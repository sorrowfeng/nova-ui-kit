use crate::{
    append_rust_source_map_log, bundle_artifacts, cargo_check_diagnostic_args,
    generated_file_change_summary, generated_rust_source_map, managed_project_root,
    prepare_release_signing, project_name, project_paths_for_project, release_config,
    run_logged_process, save_project_files, write_bundle_manifest, BuildResult,
};
use serde_json::Value;
use std::path::PathBuf;

#[tauri::command]
pub(super) fn build_editor_project(
    project: Value,
    rust_logic: String,
) -> Result<BuildResult, String> {
    let project_name = project_name(&project);
    let root = project
        .get("rootPath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from)
        .map(Ok)
        .unwrap_or_else(|| managed_project_root(&project_name))?;

    let generated_files = generated_file_change_summary(&root, &project, &rust_logic)?;
    save_project_files(&root, &project, &rust_logic)?;
    let app_dir = root.join("app");
    let mut log = String::new();
    let rust_source_map = generated_rust_source_map(&root, &project, &rust_logic);
    append_rust_source_map_log(&mut log, &rust_source_map);

    if !app_dir.join("node_modules").exists() {
        run_logged_process(&app_dir, "npm", &["install"], &mut log)?;
    }

    run_logged_process(&app_dir, "npm", &["run", "tauri:exe"], &mut log)?;

    Ok(BuildResult {
        success: true,
        build_kind: "exe".to_string(),
        paths: project_paths_for_project(&root, &project),
        generated_files,
        bundle_dir: None,
        bundle_paths: Vec::new(),
        bundle_manifest_path: None,
        bundle_smoke_status: None,
        bundle_artifact_count: 0,
        installer_smoke_script_path: None,
        installer_smoke_result_path: None,
        installer_smoke_status: None,
        installer_smoke_runner_mode: None,
        installer_smoke_vm_handoff_path: None,
        rust_source_map,
        log,
    })
}

#[tauri::command]
pub(super) fn bundle_editor_project(
    project: Value,
    rust_logic: String,
) -> Result<BuildResult, String> {
    let project_name = project_name(&project);
    let root = project
        .get("rootPath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from)
        .map(Ok)
        .unwrap_or_else(|| managed_project_root(&project_name))?;

    let generated_files = generated_file_change_summary(&root, &project, &rust_logic)?;
    save_project_files(&root, &project, &rust_logic)?;
    let app_dir = root.join("app");
    let mut log = String::new();
    let rust_source_map = generated_rust_source_map(&root, &project, &rust_logic);
    append_rust_source_map_log(&mut log, &rust_source_map);

    if !app_dir.join("node_modules").exists() {
        run_logged_process(&app_dir, "npm", &["install"], &mut log)?;
    }

    let release = release_config(&project, &project_name);
    prepare_release_signing(&release, &mut log)?;

    run_logged_process(&app_dir, "npm", &["run", "tauri:bundle"], &mut log)?;
    let (bundle_dir, bundle_paths) = bundle_artifacts(&root)?;
    let bundle_manifest =
        write_bundle_manifest(&root, &project_name, &release, &bundle_dir, &bundle_paths)?;
    log.push_str("\nBundle manifest: ");
    log.push_str(&bundle_manifest.path);
    log.push('\n');
    if let Some(path) = &bundle_manifest.installer_smoke_vm_handoff_path {
        log.push_str("Installer smoke VM handoff: ");
        log.push_str(path);
        log.push('\n');
    }

    Ok(BuildResult {
        success: true,
        build_kind: "bundle".to_string(),
        paths: project_paths_for_project(&root, &project),
        generated_files,
        bundle_dir,
        bundle_paths,
        bundle_manifest_path: Some(bundle_manifest.path),
        bundle_smoke_status: Some(bundle_manifest.smoke_status),
        bundle_artifact_count: bundle_manifest.artifact_count,
        installer_smoke_script_path: bundle_manifest.installer_smoke_script_path,
        installer_smoke_result_path: bundle_manifest.installer_smoke_result_path,
        installer_smoke_status: Some(bundle_manifest.installer_smoke_status),
        installer_smoke_runner_mode: Some(bundle_manifest.installer_smoke_runner_mode),
        installer_smoke_vm_handoff_path: bundle_manifest.installer_smoke_vm_handoff_path,
        rust_source_map,
        log,
    })
}

#[tauri::command]
pub(super) fn check_editor_project(
    project: Value,
    rust_logic: String,
    check_kind: String,
) -> Result<BuildResult, String> {
    let project_name = project_name(&project);
    let root = project
        .get("rootPath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from)
        .map(Ok)
        .unwrap_or_else(|| managed_project_root(&project_name))?;

    let generated_files = generated_file_change_summary(&root, &project, &rust_logic)?;
    save_project_files(&root, &project, &rust_logic)?;
    let app_dir = root.join("app");
    let mut log = String::new();
    let rust_source_map = generated_rust_source_map(&root, &project, &rust_logic);
    append_rust_source_map_log(&mut log, &rust_source_map);
    let normalized_kind = check_kind.trim().to_ascii_lowercase();
    let run_frontend = normalized_kind == "frontend" || normalized_kind == "all";
    let run_rust = normalized_kind == "rust" || normalized_kind == "all";

    if !run_frontend && !run_rust {
        return Err(format!(
            "Unknown check kind `{}`. Use frontend, rust, or all.",
            check_kind
        ));
    }

    if run_frontend {
        if !app_dir.join("node_modules").exists() {
            run_logged_process(&app_dir, "npm", &["install"], &mut log)?;
        }
        run_logged_process(&app_dir, "npm", &["run", "build"], &mut log)?;
    }

    if run_rust {
        run_logged_process(
            &app_dir.join("src-tauri"),
            "cargo",
            cargo_check_diagnostic_args(),
            &mut log,
        )?;
    }

    Ok(BuildResult {
        success: true,
        build_kind: format!("check:{normalized_kind}"),
        paths: project_paths_for_project(&root, &project),
        generated_files,
        bundle_dir: None,
        bundle_paths: Vec::new(),
        bundle_manifest_path: None,
        bundle_smoke_status: None,
        bundle_artifact_count: 0,
        installer_smoke_script_path: None,
        installer_smoke_result_path: None,
        installer_smoke_status: None,
        installer_smoke_runner_mode: None,
        installer_smoke_vm_handoff_path: None,
        rust_source_map,
        log,
    })
}
