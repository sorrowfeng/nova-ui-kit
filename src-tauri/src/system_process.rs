use crate::to_error;
use std::{
    path::{Path, PathBuf},
    process::Command,
};

pub(super) fn terminate_process_tree(pid: u32) -> Result<(), String> {
    if cfg!(target_os = "windows") {
        let output = Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/T", "/F"])
            .output()
            .map_err(to_error)?;
        if output.status.success() {
            return Ok(());
        }
        let mut message = String::new();
        message.push_str(&String::from_utf8_lossy(&output.stdout));
        message.push_str(&String::from_utf8_lossy(&output.stderr));
        return Err(message);
    }

    let output = Command::new("kill")
        .args(["-TERM", &pid.to_string()])
        .output()
        .map_err(to_error)?;
    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub(super) fn open_local_path(path: String) -> Result<(), String> {
    let path = PathBuf::from(path);
    if !path.exists() {
        return Err(format!("Path does not exist: {}", path.display()));
    }

    let mut command = if cfg!(target_os = "windows") {
        let mut command = Command::new("explorer");
        command.arg(&path);
        command
    } else if cfg!(target_os = "macos") {
        let mut command = Command::new("open");
        command.arg(&path);
        command
    } else {
        let mut command = Command::new("xdg-open");
        command.arg(&path);
        command
    };

    command.spawn().map_err(to_error)?;
    Ok(())
}

pub(super) fn run_process(cwd: &Path, program: &str, args: &[&str]) -> Result<String, String> {
    let executable = if cfg!(target_os = "windows") && program == "npm" {
        "npm.cmd"
    } else {
        program
    };
    let output = Command::new(executable)
        .args(args)
        .current_dir(cwd)
        .output()
        .map_err(to_error)?;

    let mut log = String::new();
    log.push_str(&String::from_utf8_lossy(&output.stdout));
    log.push_str(&String::from_utf8_lossy(&output.stderr));

    if output.status.success() {
        Ok(log)
    } else {
        Err(log)
    }
}

pub(super) fn run_logged_process(
    cwd: &Path,
    program: &str,
    args: &[&str],
    log: &mut String,
) -> Result<(), String> {
    log.push_str("$ ");
    log.push_str(program);
    if !args.is_empty() {
        log.push(' ');
        log.push_str(&args.join(" "));
    }
    log.push('\n');

    match run_process(cwd, program, args) {
        Ok(output) => {
            log.push_str(&output);
            log.push('\n');
            Ok(())
        }
        Err(output) => {
            log.push_str(&output);
            Err(log.clone())
        }
    }
}
