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

#[derive(serde::Serialize)]
pub(super) struct ToolchainStatus {
    pub node: bool,
    pub npm: bool,
    pub cargo: bool,
    pub rustc: bool,
    pub node_version: String,
    pub npm_version: String,
    pub cargo_version: String,
    pub rustc_version: String,
    pub missing: Vec<String>,
}

fn probe_version(program: &str, args: &[&str]) -> (bool, String) {
    let executable = if cfg!(target_os = "windows") && program == "npm" {
        "npm.cmd"
    } else {
        program
    };
    match Command::new(executable).args(args).output() {
        Ok(output) if output.status.success() => {
            let text = String::from_utf8_lossy(&output.stdout).trim().to_string();
            (true, text.lines().next().unwrap_or("").to_string())
        }
        _ => (false, String::new()),
    }
}

#[tauri::command]
pub(super) fn check_toolchain() -> ToolchainStatus {
    let (node, node_version) = probe_version("node", &["--version"]);
    let (npm, npm_version) = probe_version("npm", &["--version"]);
    let (cargo, cargo_version) = probe_version("cargo", &["--version"]);
    let (rustc, rustc_version) = probe_version("rustc", &["--version"]);
    let mut missing = Vec::new();
    if !node {
        missing.push("node".to_string());
    }
    if !npm {
        missing.push("npm".to_string());
    }
    if !cargo {
        missing.push("cargo".to_string());
    }
    if !rustc {
        missing.push("rustc".to_string());
    }
    ToolchainStatus {
        node,
        npm,
        cargo,
        rustc,
        node_version,
        npm_version,
        cargo_version,
        rustc_version,
        missing,
    }
}



#[derive(serde::Serialize)]
pub(super) struct GitSnapshotResult {
    pub ok: bool,
    pub log: String,
    pub git_dir: String,
}

#[derive(serde::Serialize)]
pub(super) struct GitProjectStatus {
    pub clean: bool,
    pub conflicted: Vec<String>,
    pub changed: Vec<String>,
    pub log: String,
}

/// Report git working-tree status including conflict markers (D2).
#[tauri::command]
pub(super) fn git_project_status(root_path: String) -> Result<GitProjectStatus, String> {
    let root = std::path::PathBuf::from(&root_path);
    if !root.join(".git").exists() {
        return Ok(GitProjectStatus {
            clean: true,
            conflicted: Vec::new(),
            changed: Vec::new(),
            log: "not a git repository".into(),
        });
    }
    let output = std::process::Command::new("git")
        .args(["status", "--porcelain"])
        .current_dir(&root)
        .output()
        .map_err(to_error)?;
    let text = String::from_utf8_lossy(&output.stdout).to_string();
    let mut conflicted = Vec::new();
    let mut changed = Vec::new();
    for line in text.lines() {
        if line.starts_with("UU") || line.starts_with("AA") || line.starts_with("DD") {
            conflicted.push(line.chars().skip(3).collect::<String>().trim().to_string());
        } else if !line.trim().is_empty() {
            changed.push(line.trim().to_string());
        }
    }
    Ok(GitProjectStatus {
        clean: conflicted.is_empty() && changed.is_empty(),
        conflicted,
        changed,
        log: text,
    })
}

/// Initialize a git repo in the project root and commit current files (D2).
#[tauri::command]
pub(super) fn init_project_git(root_path: String) -> Result<GitSnapshotResult, String> {
    let root = std::path::PathBuf::from(&root_path);
    if !root.exists() {
        return Err(format!("Project root does not exist: {root_path}"));
    }
    let mut log = String::new();
    let git = |args: &[&str], log: &mut String| -> Result<(), String> {
        let output = std::process::Command::new("git")
            .args(args)
            .current_dir(&root)
            .output()
            .map_err(to_error)?;
        log.push_str(&format!("$ git {}\n", args.join(" ")));
        log.push_str(&String::from_utf8_lossy(&output.stdout));
        log.push_str(&String::from_utf8_lossy(&output.stderr));
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
        Ok(())
    };

    if !root.join(".git").exists() {
        git(&["init"], &mut log)?;
    }
    git(&["add", "-A"], &mut log)?;
    // Commit only if there is something staged
    let status = std::process::Command::new("git")
        .args(["status", "--porcelain"])
        .current_dir(&root)
        .output()
        .map_err(to_error)?;
    if !String::from_utf8_lossy(&status.stdout).trim().is_empty() {
        git(&["commit", "-m", "Nova project snapshot"], &mut log)?;
    } else {
        log.push_str("nothing to commit\n");
    }
    Ok(GitSnapshotResult {
        ok: true,
        log,
        git_dir: root.join(".git").display().to_string(),
    })
}


#[derive(serde::Serialize)]
pub(super) struct GitConflictHunk {
    pub ours: String,
    pub theirs: String,
    pub start_line: usize,
}

#[derive(serde::Serialize)]
pub(super) struct GitConflictFile {
    pub path: String,
    pub hunks: Vec<GitConflictHunk>,
}

/// Read conflict markers (<<<<<<< / ======= / >>>>>>>) from a file.
#[tauri::command]
pub(super) fn read_git_conflict(root_path: String, file_path: String) -> Result<GitConflictFile, String> {
    let full = std::path::PathBuf::from(&root_path).join(&file_path);
    let text = std::fs::read_to_string(&full).map_err(to_error)?;
    let mut hunks = Vec::new();
    let mut ours = String::new();
    let mut theirs = String::new();
    let mut in_conflict = false;
    let mut in_ours = false;
    let mut in_theirs = false;
    let mut start_line = 0usize;
    for (idx, line) in text.lines().enumerate() {
        if line.starts_with("<<<<<<<") {
            in_conflict = true;
            in_ours = true;
            in_theirs = false;
            ours.clear();
            theirs.clear();
            start_line = idx + 1;
        } else if in_conflict && line.starts_with("=======") {
            in_ours = false;
            in_theirs = true;
        } else if in_conflict && line.starts_with(">>>>>>>") {
            hunks.push(GitConflictHunk {
                ours: ours.clone(),
                theirs: theirs.clone(),
                start_line,
            });
            in_conflict = false;
            in_ours = false;
            in_theirs = false;
        } else if in_ours {
            ours.push_str(line);
            ours.push('\n');
        } else if in_theirs {
            theirs.push_str(line);
            theirs.push('\n');
        }
    }
    Ok(GitConflictFile { path: file_path, hunks })
}

/// Resolve a conflicted file by taking ours / theirs / both (concat).
#[tauri::command]
pub(super) fn resolve_git_conflict(
    root_path: String,
    file_path: String,
    resolution: String,
) -> Result<String, String> {
    let full = std::path::PathBuf::from(&root_path).join(&file_path);
    let text = std::fs::read_to_string(&full).map_err(to_error)?;
    let mut out = String::new();
    let mut ours = String::new();
    let mut theirs = String::new();
    let mut in_conflict = false;
    let mut in_ours = false;
    let mut in_theirs = false;
    for line in text.lines() {
        if line.starts_with("<<<<<<<") {
            in_conflict = true;
            in_ours = true;
            in_theirs = false;
            ours.clear();
            theirs.clear();
        } else if in_conflict && line.starts_with("=======") {
            in_ours = false;
            in_theirs = true;
        } else if in_conflict && line.starts_with(">>>>>>>") {
            match resolution.as_str() {
                "ours" => out.push_str(&ours),
                "theirs" => out.push_str(&theirs),
                "both" => {
                    out.push_str(&ours);
                    out.push_str(&theirs);
                }
                _ => out.push_str(&ours),
            }
            in_conflict = false;
            in_ours = false;
            in_theirs = false;
        } else if in_ours {
            ours.push_str(line);
            ours.push('\n');
        } else if in_theirs {
            theirs.push_str(line);
            theirs.push('\n');
        } else {
            out.push_str(line);
            out.push('\n');
        }
    }
    std::fs::write(&full, out).map_err(to_error)?;
    Ok(file_path)
}
