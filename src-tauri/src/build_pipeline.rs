use crate::{managed_project_root, project_name, run_logged_process, save_project_files};
use serde_json::Value;
use std::path::PathBuf;


/// Build the generated app frontend only (fast preview) and return the dist entry path.
#[tauri::command]
pub(super) fn preview_generated_web(project: Value, rust_logic: String) -> Result<PreviewWebResult, String> {
    let project_name = project_name(&project);
    let root = project
        .get("rootPath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from)
        .map(Ok)
        .unwrap_or_else(|| managed_project_root(&project_name))?;

    save_project_files(&root, &project, &rust_logic)?;
    let app_dir = root.join("app");
    let mut log = String::new();

    if !app_dir.join("node_modules").exists() {
        run_logged_process(&app_dir, "npm", &["install"], &mut log)?;
    }
    run_logged_process(&app_dir, "npm", &["run", "build"], &mut log)?;

    let index = app_dir.join("dist").join("index.html");
    if !index.exists() {
        return Err(format!("Preview build finished but {} is missing.\n{}", index.display(), log));
    }
    Ok(PreviewWebResult {
        index_path: index.display().to_string(),
        dist_dir: app_dir.join("dist").display().to_string(),
        log,
    })
}

#[derive(serde::Serialize)]
pub(super) struct PreviewWebResult {
    pub index_path: String,
    pub dist_dir: String,
    pub log: String,
}

