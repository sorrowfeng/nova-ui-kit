use crate::{
    normalized_checkpoint_created_at, path_modified_at, slugify, to_error, LaunchExecutableResult,
    RunSessionResult, RuntimeLogReadResult,
};
use serde::Deserialize;
use std::{
    env, fs,
    io::{Read, Seek, SeekFrom, Write},
    path::{Path, PathBuf},
    process::{Command, Stdio},
};

#[derive(Deserialize)]
struct WindowsProcessInfo {
    #[serde(default)]
    found: bool,
    executable_path: Option<String>,
    command_line: Option<String>,
}

#[tauri::command]
pub(super) fn launch_built_executable(path: String) -> Result<LaunchExecutableResult, String> {
    if !cfg!(target_os = "windows") {
        return Err(
            "Built executable launch is currently implemented for Windows .exe artifacts."
                .to_string(),
        );
    }

    let path = validate_built_executable_path(&PathBuf::from(path))?;
    let path_text = path.display().to_string();
    let started_at = normalized_checkpoint_created_at("");
    let log_path = runtime_log_path_for_executable(&path, &started_at)?;
    let mut log_file = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
        .map_err(to_error)?;
    writeln!(log_file, "Nova run session started at {started_at}").map_err(to_error)?;
    writeln!(log_file, "Executable: {path_text}").map_err(to_error)?;
    writeln!(log_file, "--- process output ---").map_err(to_error)?;

    let mut command = Command::new(&path);
    if let Some(parent) = path.parent() {
        command.current_dir(parent);
    }
    command
        .stdout(Stdio::from(log_file.try_clone().map_err(to_error)?))
        .stderr(Stdio::from(log_file));
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }
    let child = command.spawn().map_err(to_error)?;
    let pid = child.id();

    Ok(LaunchExecutableResult {
        path: path_text.clone(),
        pid,
        started_at,
        log_path: log_path.display().to_string(),
        summary: format!("Launched built executable pid {pid}: {path_text}"),
    })
}

#[tauri::command]
pub(super) fn inspect_run_session(path: String, pid: u32) -> Result<RunSessionResult, String> {
    let path = validate_built_executable_path(&PathBuf::from(path))?;
    run_session_result(&path, pid)
}

#[tauri::command]
pub(super) fn stop_run_session(path: String, pid: u32) -> Result<RunSessionResult, String> {
    if !cfg!(target_os = "windows") {
        return Err("Run session stop is currently implemented for Windows processes.".to_string());
    }

    let path = validate_built_executable_path(&PathBuf::from(path))?;
    let before = run_session_result(&path, pid)?;
    if before.status != "running" {
        return Ok(before);
    }

    let output = Command::new("taskkill")
        .args(["/PID", &pid.to_string(), "/T", "/F"])
        .output()
        .map_err(to_error)?;
    if !output.status.success() {
        let mut message = String::new();
        message.push_str(&String::from_utf8_lossy(&output.stdout));
        message.push_str(&String::from_utf8_lossy(&output.stderr));
        return Err(message);
    }

    let mut result = run_session_result(&path, pid)?;
    if result.status == "stopped" {
        result.summary = format!("Stopped run session pid {pid}: {}", path.display());
    }
    Ok(result)
}

#[tauri::command]
pub(super) fn read_run_session_log(path: String) -> Result<RuntimeLogReadResult, String> {
    let path = validate_runtime_log_path(&PathBuf::from(path))?;
    let metadata = fs::metadata(&path).map_err(to_error)?;
    let max_bytes = 20_000_u64;
    let size_bytes = metadata.len();
    let truncated = size_bytes > max_bytes;
    let mut file = fs::File::open(&path).map_err(to_error)?;
    if truncated {
        file.seek(SeekFrom::Start(size_bytes.saturating_sub(max_bytes)))
            .map_err(to_error)?;
    }
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes).map_err(to_error)?;
    let mut content = String::from_utf8_lossy(&bytes).to_string();
    if truncated {
        content = format!("[Showing last {max_bytes} bytes of {size_bytes}]\n{content}");
    }

    Ok(RuntimeLogReadResult {
        path: path.display().to_string(),
        content,
        size_bytes,
        modified_at: path_modified_at(&path),
        truncated,
    })
}

fn run_session_result(path: &Path, pid: u32) -> Result<RunSessionResult, String> {
    if !cfg!(target_os = "windows") {
        return Err(
            "Run session inspection is currently implemented for Windows processes.".to_string(),
        );
    }

    let checked_at = normalized_checkpoint_created_at("");
    let path_text = path.display().to_string();
    let process_info = windows_process_info(pid)?;
    if !process_info.found {
        return Ok(RunSessionResult {
            path: path_text.clone(),
            pid,
            status: "stopped".to_string(),
            checked_at,
            executable_path: None,
            command_line: None,
            summary: format!("Run session pid {pid} is not running: {path_text}"),
        });
    }

    let executable_path = process_info.executable_path.clone();
    let status = match executable_path
        .as_deref()
        .and_then(|value| fs::canonicalize(value).ok())
    {
        Some(process_path) if paths_equal_ignore_case(&process_path, path) => "running",
        Some(_) => "stale",
        None => "unknown",
    }
    .to_string();
    let summary = match status.as_str() {
        "running" => format!("Run session pid {pid} is running: {path_text}"),
        "stale" => format!("Run session pid {pid} now belongs to a different executable."),
        _ => {
            format!("Run session pid {pid} exists, but its executable path could not be verified.")
        }
    };

    Ok(RunSessionResult {
        path: path_text,
        pid,
        status,
        checked_at,
        executable_path,
        command_line: process_info.command_line,
        summary,
    })
}

fn windows_process_info(pid: u32) -> Result<WindowsProcessInfo, String> {
    let script = format!(
        "$ErrorActionPreference = 'Stop'; \
         $p = Get-CimInstance Win32_Process -Filter \"ProcessId = {pid}\"; \
         $payload = if ($null -eq $p) {{ [ordered]@{{ found = $false }} }} else {{ [ordered]@{{ found = $true; executable_path = $p.ExecutablePath; command_line = $p.CommandLine }} }}; \
         $payload | ConvertTo-Json -Compress"
    );
    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", &script])
        .output()
        .map_err(to_error)?;
    if !output.status.success() {
        let mut message = String::new();
        message.push_str(&String::from_utf8_lossy(&output.stdout));
        message.push_str(&String::from_utf8_lossy(&output.stderr));
        return Err(message);
    }
    let content = String::from_utf8_lossy(&output.stdout);
    serde_json::from_str(content.trim_start_matches('\u{feff}').trim()).map_err(to_error)
}

pub(super) fn runtime_log_path_for_executable(
    path: &Path,
    started_at: &str,
) -> Result<PathBuf, String> {
    let logs_dir = runtime_logs_dir_for_executable(path);
    fs::create_dir_all(&logs_dir).map_err(to_error)?;
    let exe_name = path
        .file_stem()
        .and_then(|value| value.to_str())
        .map(slugify)
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| "app".to_string());
    Ok(logs_dir.join(format!("run-{started_at}-{exe_name}.log")))
}

fn runtime_logs_dir_for_executable(path: &Path) -> PathBuf {
    let Some(release_dir) = path.parent() else {
        return env::temp_dir().join("nova-runtime");
    };
    let Some(target_dir) = release_dir.parent() else {
        return release_dir.join("nova-runtime");
    };
    let Some(src_tauri_dir) = target_dir.parent() else {
        return release_dir.join("nova-runtime");
    };
    let Some(app_dir) = src_tauri_dir.parent() else {
        return release_dir.join("nova-runtime");
    };
    if src_tauri_dir
        .file_name()
        .and_then(|value| value.to_str())
        .is_some_and(|value| value.eq_ignore_ascii_case("src-tauri"))
        && app_dir
            .file_name()
            .and_then(|value| value.to_str())
            .is_some_and(|value| value.eq_ignore_ascii_case("app"))
    {
        if let Some(project_root) = app_dir.parent() {
            return project_root.join(".nova").join("runtime");
        }
    }

    release_dir.join("nova-runtime")
}

pub(super) fn validate_runtime_log_path(path: &Path) -> Result<PathBuf, String> {
    let file_name = path
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default();
    if !file_name.starts_with("run-") || !file_name.ends_with(".log") {
        return Err("Runtime Console only reads Nova-generated run-*.log files.".to_string());
    }
    let path = fs::canonicalize(path).map_err(to_error)?;
    if !path.is_file() {
        return Err(format!("Runtime log is not a file: {}", path.display()));
    }
    let Some(parent) = path.parent() else {
        return Err("Runtime log has no parent directory.".to_string());
    };
    let parent_name = parent
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default();
    let allowed_project_log = parent_name.eq_ignore_ascii_case("runtime")
        && parent
            .parent()
            .and_then(|value| value.file_name())
            .and_then(|value| value.to_str())
            .is_some_and(|value| value.eq_ignore_ascii_case(".nova"));
    let allowed_release_log = parent_name.eq_ignore_ascii_case("nova-runtime")
        && parent
            .parent()
            .and_then(|value| value.file_name())
            .and_then(|value| value.to_str())
            .is_some_and(|value| value.eq_ignore_ascii_case("release"));
    if !allowed_project_log && !allowed_release_log {
        return Err(
            "Runtime log must live in a Nova .nova/runtime or release/nova-runtime directory."
                .to_string(),
        );
    }
    Ok(path)
}

pub(super) fn paths_equal_ignore_case(left: &Path, right: &Path) -> bool {
    left.display()
        .to_string()
        .eq_ignore_ascii_case(&right.display().to_string())
}

pub(super) fn validate_built_executable_path(path: &Path) -> Result<PathBuf, String> {
    let file_name = path
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default();
    if !file_name.to_ascii_lowercase().ends_with(".exe") {
        return Err(
            "Only Windows .exe build artifacts can be launched from the editor.".to_string(),
        );
    }

    let path = fs::canonicalize(path).map_err(to_error)?;
    if !path.is_file() {
        return Err(format!("Build artifact is not a file: {}", path.display()));
    }
    let release_dir = path
        .parent()
        .ok_or_else(|| "Build artifact has no parent directory.".to_string())?;
    let target_dir = release_dir
        .parent()
        .ok_or_else(|| "Build artifact is not inside a target/release directory.".to_string())?;
    if !release_dir
        .file_name()
        .and_then(|value| value.to_str())
        .is_some_and(|value| value.eq_ignore_ascii_case("release"))
        || !target_dir
            .file_name()
            .and_then(|value| value.to_str())
            .is_some_and(|value| value.eq_ignore_ascii_case("target"))
    {
        return Err(
            "Only generated target/release/*.exe artifacts can be launched from the editor."
                .to_string(),
        );
    }
    if path.components().any(|component| {
        component
            .as_os_str()
            .to_string_lossy()
            .eq_ignore_ascii_case("bundle")
    }) {
        return Err(
            "Installer bundle executables are not launched as apps from the editor.".to_string(),
        );
    }

    Ok(path)
}
