#![recursion_limit = "256"]

mod backend_artifact_builder;
mod backend_artifact_inspector;
mod backend_method_runner;
mod build_pipeline;
mod editor_tasks;
mod generated_app_config;
mod generated_app_runtime;
mod generated_app_writer;
mod generated_backend;
mod generated_bridge;
mod generated_files;
mod generated_project_docs;
mod generated_project_files;
mod generated_templates;
mod generated_theme;
mod generated_window_validation;
mod git_conflict;
mod incremental_io;
mod installer_smoke;
mod line_diff;
mod project_dependency_graph;
mod project_model;
mod project_paths;
mod project_persistence;
mod project_writer;
mod release_artifacts;
mod release_pipeline;
mod release_runtime;
mod rust_source_map;
mod system_process;
mod text_utils;

use backend_artifact_builder::build_backend_artifact;
use backend_artifact_inspector::inspect_backend_artifacts;
use backend_method_runner::test_backend_integration_method;
use build_pipeline::{build_editor_project, bundle_editor_project, check_editor_project, preview_generated_web};
use editor_tasks::{
    cancel_editor_project_task, list_editor_project_tasks, read_editor_project_task,
    start_editor_project_task, EditorTaskState,
};
use generated_app_config::{
    generated_capabilities_default, generated_cargo_toml, generated_index_html, generated_main_rs,
    generated_package_json, generated_tauri_conf,
};
use generated_app_runtime::{
    generated_app_tsx, generated_capture_window_script, generated_main_tsx, generated_styles,
    generated_tsconfig, generated_vite_config,
};
use generated_app_writer::{
    asset_file_name, copy_project_assets_to_dir, default_icon_paths, generated_icon_source,
    release_icon_preview_paths, release_icon_preview_source, write_generated_app,
};
use generated_backend::generated_backend_integrations_rs;
use generated_bridge::{generated_lib_rs, generated_project_data};
use generated_files::GeneratedFileChangeSummary;
use generated_project_docs::{generated_backend_integrations_readme, generated_project_readme};
use generated_project_files::{
    apply_generated_project_files, backend_artifact_source, backend_bundle_resource_paths,
    copy_backend_integration_resources, generated_file_change_summary,
    preview_generated_project_files,
};
use generated_window_validation::{read_json_file, validate_generated_window};
use incremental_io::write_text_if_changed;
use installer_smoke::{
    create_installer_sandbox_handoff, inspect_windows_certificate_store,
    read_installer_smoke_result, run_installer_smoke_script,
};
use project_dependency_graph::{read_project_dependency_graph, write_project_dependency_graph};
use project_model::{
    backend_integrations, backend_integrations_need_ffi_loader, cargo_dependencies,
    is_valid_env_var_name, migrate_project_schema, normalized_checkpoint_created_at,
    project_name, release_config,
    rust_command_names, rust_module_source, rust_modules, rust_source, safe_file_name,
    sanitize_rust_ident, slugify, GeneratedBackendIntegration, GeneratedBackendMethod,
    GeneratedCargoDependency, GeneratedReleaseConfig, GeneratedRustModule,
    DEFAULT_RUST_COMMAND_NAME, DEFAULT_RUST_LOGIC,
};
use project_paths::{
    managed_project_root, managed_projects_dir, project_builds_dir, project_checkpoints_dir,
    project_editor_state_path, project_paths, project_paths_for_project, project_root_from_project,
    project_with_root_path, write_readme,
};
use project_persistence::{
    create_editor_project, create_project_checkpoint, diff_project_checkpoint,
    list_editor_projects, list_project_checkpoints, read_editor_project,
    restore_project_checkpoint, save_editor_project,
};
use project_writer::save_project_files;
#[cfg(test)]
use release_artifacts::generated_bundle_dir;
use release_artifacts::{
    bundle_artifact_kind, bundle_artifacts, path_modified_at, path_size_bytes,
    powershell_single_quoted, prepare_release_signing, release_signing_configured,
    write_bundle_manifest,
};
use release_pipeline::{
    inspect_release_pipeline_artifact, list_release_pipeline_records, write_release_pipeline_record,
};
use release_runtime::{
    inspect_run_session, launch_built_executable, read_run_session_log, stop_run_session,
};
use rust_source_map::{
    append_rust_source_map_log, cargo_check_diagnostic_args, generated_rust_source_map,
    generated_rust_source_map_json, GeneratedRustSourceMap,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::env;
use git_conflict::{read_git_conflict, resolve_git_conflict};
use system_process::{check_toolchain, git_project_status, init_project_git, open_local_path, run_logged_process, run_process, terminate_process_tree};
use text_utils::{html_text, json_string, json_string_array, to_error};

#[derive(Serialize)]
struct EditorProjectPaths {
    root_path: String,
    manifest_path: String,
    editor_state_path: String,
    workspace_metadata_path: String,
    ui_dir: String,
    rust_logic_path: String,
    rust_source_map_path: String,
    generated_app_dir: String,
    generated_app_src: String,
    generated_rust_source_map_path: String,
    output_exe_path: Option<String>,
}

#[derive(Serialize)]
struct BuildResult {
    success: bool,
    build_kind: String,
    paths: EditorProjectPaths,
    generated_files: GeneratedFileChangeSummary,
    bundle_dir: Option<String>,
    bundle_paths: Vec<String>,
    bundle_manifest_path: Option<String>,
    bundle_smoke_status: Option<String>,
    bundle_artifact_count: usize,
    installer_smoke_script_path: Option<String>,
    installer_smoke_result_path: Option<String>,
    installer_smoke_status: Option<String>,
    installer_smoke_runner_mode: Option<String>,
    installer_smoke_vm_handoff_path: Option<String>,
    rust_source_map: GeneratedRustSourceMap,
    log: String,
}

#[derive(Deserialize, Serialize)]
struct InstallerSmokeReadResult {
    result_path: String,
    status: String,
    summary: String,
    finished_at: Option<String>,
    artifact_count: usize,
    passed_count: usize,
    failed_count: usize,
    log_path: Option<String>,
    #[serde(default)]
    script_path: Option<String>,
    #[serde(default)]
    output_log: String,
}

#[derive(Deserialize, Serialize)]
struct WindowsCertificateStoreEntry {
    #[serde(default)]
    store: String,
    #[serde(default)]
    subject: String,
    #[serde(default)]
    issuer: String,
    #[serde(default)]
    thumbprint: String,
    #[serde(default)]
    not_before: Option<String>,
    #[serde(default)]
    not_after: Option<String>,
    #[serde(default)]
    has_private_key: bool,
    #[serde(default)]
    archived: bool,
    #[serde(default)]
    friendly_name: Option<String>,
}

#[derive(Serialize)]
struct WindowsCertificateInspectionResult {
    query: String,
    checked_at: String,
    found: bool,
    match_count: usize,
    summary: String,
    entries: Vec<WindowsCertificateStoreEntry>,
}

#[derive(Serialize)]
struct InstallerSandboxHandoffResult {
    handoff_path: String,
    sandbox_config_path: String,
    launcher_script_path: String,
    shared_folder: String,
    sandbox_script_path: String,
    sandbox_result_path: String,
    copied_artifact_count: usize,
    summary: String,
}

#[derive(Serialize)]
struct LaunchExecutableResult {
    path: String,
    pid: u32,
    started_at: String,
    log_path: String,
    summary: String,
}

#[derive(Serialize)]
struct RunSessionResult {
    path: String,
    pid: u32,
    status: String,
    checked_at: String,
    executable_path: Option<String>,
    command_line: Option<String>,
    summary: String,
}

#[derive(Serialize)]
struct RuntimeLogReadResult {
    path: String,
    content: String,
    size_bytes: u64,
    modified_at: Option<String>,
    truncated: bool,
}

#[derive(Serialize)]
struct BackendMethodTestResult {
    success: bool,
    status: String,
    integration_id: String,
    integration_name: String,
    method_id: String,
    method_name: String,
    transport: String,
    duration_ms: u128,
    summary: String,
    request: Value,
    response: Value,
    raw_response: Option<String>,
    error: Option<String>,
}

#[derive(Serialize)]
struct ValidationResult {
    success: bool,
    paths: EditorProjectPaths,
    log: String,
    report_path: String,
    snapshot_path: String,
    screenshot_path: Option<String>,
    screenshot_analysis_path: Option<String>,
    runtime_audit_path: Option<String>,
    breakpoint_validation_path: Option<String>,
    breakpoint_issues: Vec<BreakpointValidationIssue>,
}

#[derive(Serialize)]
struct BreakpointValidationIssue {
    id: String,
    breakpoint: String,
    severity: String,
    title: String,
    detail: String,
    file_id: String,
    file_name: String,
    item_id: Option<String>,
    item_name: Option<String>,
    item_type: Option<String>,
}

#[derive(Serialize)]
struct ManagedProjectSummary {
    name: String,
    root_path: String,
    manifest_path: String,
    updated_at: Option<String>,
}

#[derive(Serialize)]
struct ProjectCheckpointSummary {
    id: String,
    label: String,
    created_at: String,
    path: String,
    project_name: String,
    file_count: usize,
    command_count: usize,
}

#[derive(Serialize)]
struct ProjectCheckpointResult {
    checkpoint: ProjectCheckpointSummary,
    paths: EditorProjectPaths,
}

#[derive(Serialize)]
struct ProjectCheckpointFileDiff {
    name: String,
    change: String,
    current_items: usize,
    checkpoint_items: usize,
}

#[derive(Serialize)]
struct ProjectCheckpointDiff {
    checkpoint: ProjectCheckpointSummary,
    summary: String,
    metadata_changed: bool,
    rust_logic_changed: bool,
    file_delta: i64,
    item_delta: i64,
    command_delta: i64,
    state_delta: i64,
    asset_delta: i64,
    added_files: Vec<String>,
    removed_files: Vec<String>,
    changed_files: Vec<ProjectCheckpointFileDiff>,
    details: Vec<String>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(EditorTaskState::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            create_editor_project,
            save_editor_project,
            read_editor_project,
            list_editor_projects,
            create_project_checkpoint,
            list_project_checkpoints,
            diff_project_checkpoint,
            restore_project_checkpoint,
            write_project_dependency_graph,
            read_project_dependency_graph,
            write_release_pipeline_record,
            list_release_pipeline_records,
            inspect_release_pipeline_artifact,
            preview_generated_project_files,
            apply_generated_project_files,
            build_editor_project,
            bundle_editor_project,
            check_editor_project,
            start_editor_project_task,
            list_editor_project_tasks,
            read_editor_project_task,
            cancel_editor_project_task,
            validate_generated_window,
            open_local_path,
            launch_built_executable,
            inspect_run_session,
            stop_run_session,
            read_run_session_log,
            build_backend_artifact,
            inspect_backend_artifacts,
            test_backend_integration_method,
            read_installer_smoke_result,
            run_installer_smoke_script,
            inspect_windows_certificate_store,
            create_installer_sandbox_handoff,
            check_toolchain,
            git_project_status,
            read_git_conflict,
            resolve_git_conflict,
            init_project_git,
            preview_generated_web
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::fs;
    use std::path::{Path, PathBuf};

    fn checkpoint_test_project(root: &Path) -> Value {
        json!({
            "id": "checkpoint-project",
            "name": "Checkpoint Project",
            "description": "Checkpoint verification",
            "rootPath": root.display().to_string(),
            "assets": [],
            "stateVariables": [],
            "rustCommands": [
                {
                    "id": "cmd-app-message",
                    "name": "app_message",
                    "response": "Checkpoint ready"
                }
            ],
            "activeRustCommandId": "cmd-app-message",
            "rustLogic": DEFAULT_RUST_LOGIC,
            "activeFileId": "main",
            "editorState": {
                "openFileIds": ["main"],
                "activeMode": "logic",
                "activeEditorTabId": "logic:rust",
                "activeLeftDockTab": "project",
                "activeRightDockTab": "connections",
                "leftDockCollapsed": false,
                "rightDockCollapsed": true,
                "activeBottomDockTab": "output",
                "bottomDockExpanded": true,
                "bottomDockMinimized": false,
                "bottomDockHeight": 384,
                "bottomDockExpandedHeight": 640,
                "bottomDockLogSearchQuery": "panic",
                "selectedRailActionPresetId": "release-exe",
                "canvasControlsExpanded": true,
                "tabOrderOverlayVisible": true,
                "canvasActiveBreakpoint": "tablet",
                "canvasZoom": 0.75,
                "canvasViewportScrollLeft": 128,
                "canvasViewportScrollTop": 96,
                "selectedItemIds": ["hero-button", "status-label"],
                "selectionAnchorId": "hero-button",
                "projectExplorerFilter": "rust",
                "projectExplorerQuery": "logic",
                "selectedProjectExplorerNodeId": "rust-folder",
                "collapsedProjectExplorerNodeIds": ["app-folder", "nova-folder"],
                "navigatorQuery": "hero",
                "componentPaletteQuery": "button",
                "componentPaletteCategory": "inputs",
                "componentPaletteRecentTypes": ["button", "input", "table"],
                "componentPaletteFavoriteTypes": ["top-app-bar", "frame"],
                "inspectorPropertySections": {
                    "layout": true,
                    "content": false,
                    "state": true,
                    "appearance": true,
                    "actions": false
                },
                "inspectorPropertyQuery": "label",
                "rustFindQuery": "invoke",
                "rustFindCaseSensitive": true,
                "logicSearchQuery": "slot status",
                "logicResourceView": "modules",
                "logicConnectionFilter": "unbound",
                "rustEditorScrollTop": 220,
                "rustEditorScrollLeft": 18,
                "rustEditorWordWrap": true,
                "rustEditorSelectionStart": 32,
                "rustEditorSelectionEnd": 46,
                "projectTaskSearchQuery": "release",
                "projectTaskStatusFilter": "failed",
                "projectTaskKindFilter": "build",
                "selectedProjectTaskId": "task-build-exe",
                "projectTaskLogSearchQuery": "warning",
                "projectTaskQueuePaused": true,
                "activeGeneratedPreviewPath": "app/src/App.tsx",
                "selectedGeneratedPreviewPaths": ["app/src/App.tsx", "app/src-tauri/src/lib.rs"],
                "showGeneratedPlanAdvanced": true,
                "selectedBuilderIssueId": "diagnostic:app/src-tauri/src/lib.rs:42"
            },
            "files": [
                {
                    "id": "main",
                    "name": "Main.ui",
                    "path": "ui/Main.ui",
                    "updatedAt": "2026-06-28T00:00:00.000Z",
                    "page": {
                        "title": "Checkpoint Project",
                        "preset": "dialog",
                        "activeBreakpoint": "desktop",
                        "width": 640,
                        "height": 420,
                        "background": "grid",
                        "showGrid": true,
                        "showRulers": true,
                        "snapToGrid": true,
                        "gridSize": 8,
                        "zoom": 1,
                        "autoSave": true
                    },
                    "items": [
                        {
                            "id": "hero-button",
                            "type": "button",
                            "name": "Hero Button",
                            "x": 24,
                            "y": 24,
                            "width": 140,
                            "height": 40,
                            "z": 1,
                            "props": {
                                "label": "Save"
                            }
                        },
                        {
                            "id": "status-label",
                            "type": "label",
                            "name": "Status Label",
                            "x": 24,
                            "y": 76,
                            "width": 180,
                            "height": 32,
                            "z": 2,
                            "props": {
                                "label": "Ready"
                            }
                        }
                    ]
                }
            ],
            "createdAt": "2026-06-28T00:00:00.000Z",
            "updatedAt": "2026-06-28T00:00:00.000Z"
        })
    }

    #[test]
    fn project_checkpoints_round_trip_to_disk() {
        let root = env::temp_dir().join("nova-ui-checkpoint-roundtrip");
        if root.exists() {
            fs::remove_dir_all(&root).expect("remove old checkpoint project");
        }

        let project = checkpoint_test_project(&root);
        let checkpoint = create_project_checkpoint(
            project.clone(),
            DEFAULT_RUST_LOGIC.to_string(),
            "Before risky edit".to_string(),
            "2026-06-28T08:00:00.000Z".to_string(),
        )
        .expect("create checkpoint");

        assert!(
            PathBuf::from(&checkpoint.checkpoint.path).exists(),
            "checkpoint json should be written to disk"
        );
        assert_eq!(checkpoint.checkpoint.file_count, 1);
        assert_eq!(checkpoint.checkpoint.command_count, 1);

        let checkpoints =
            list_project_checkpoints(root.display().to_string()).expect("list checkpoints");
        assert_eq!(checkpoints.len(), 1);
        assert_eq!(checkpoints[0].label, "Before risky edit");

        let mut changed_project = project.clone();
        changed_project["name"] = Value::String("Changed Project".to_string());
        changed_project["rustCommands"]
            .as_array_mut()
            .expect("commands array")
            .push(json!({
                "id": "cmd-extra",
                "name": "extra_command",
                "response": "Extra command"
            }));
        changed_project["files"][0]["items"]
            .as_array_mut()
            .expect("items array")
            .push(json!({
                "id": "button-added",
                "type": "button",
                "name": "Added button",
                "x": 24,
                "y": 24,
                "width": 120,
                "height": 40,
                "z": 1,
                "props": {
                    "label": "Added"
                }
            }));
        save_project_files(&root, &changed_project, DEFAULT_RUST_LOGIC)
            .expect("save changed project");

        let diff = diff_project_checkpoint(
            changed_project,
            DEFAULT_RUST_LOGIC.to_string(),
            root.display().to_string(),
            checkpoint.checkpoint.id.clone(),
        )
        .expect("diff checkpoint");
        assert!(diff.metadata_changed, "diff should find metadata changes");
        assert_eq!(
            diff.command_delta, -1,
            "restoring the checkpoint should remove the extra command"
        );
        assert_eq!(
            diff.item_delta, -1,
            "restoring the checkpoint should remove the added control"
        );
        assert_eq!(diff.changed_files.len(), 1);
        assert!(
            diff.summary.contains("Restore affects"),
            "diff should include a compact restore summary"
        );

        let restored = restore_project_checkpoint(
            root.display().to_string(),
            checkpoint.checkpoint.id.clone(),
        )
        .expect("restore checkpoint");
        assert_eq!(restored["name"], "Checkpoint Project");
        assert_eq!(
            restored["rootPath"],
            Value::String(root.display().to_string()),
            "restored project should keep its disk root path"
        );

        let manifest =
            fs::read_to_string(root.join("nova.project.json")).expect("read restored manifest");
        assert!(
            manifest.contains("Checkpoint Project") && !manifest.contains("Changed Project"),
            "restore should write checkpoint data back to the main manifest"
        );
    }

    #[test]
    fn save_project_files_writes_editor_state_metadata() {
        let root = env::temp_dir().join("nova-ui-editor-state-metadata");
        if root.exists() {
            fs::remove_dir_all(&root).expect("remove old editor state project");
        }

        let project = checkpoint_test_project(&root);
        save_project_files(&root, &project, DEFAULT_RUST_LOGIC).expect("save project files");

        let state_path = root.join(".nova").join("editor-state.json");
        assert!(
            state_path.exists(),
            "editor-state metadata should live under .nova"
        );
        let state: Value = serde_json::from_str(
            &fs::read_to_string(&state_path).expect("read editor-state metadata"),
        )
        .expect("parse editor-state metadata");

        assert_eq!(state["schema"], "nova.editorState.v1");
        assert_eq!(state["project"]["activeFileId"], "main");
        assert_eq!(state["project"]["activeFileName"], "Main.ui");
        assert_eq!(state["activeWindow"]["kind"], "main");
        assert_eq!(state["activeWindow"]["titlebarStyle"], "nova");
        assert_eq!(state["activeWindow"]["designRulers"], true);
        assert_eq!(state["workspace"]["activeMode"], "logic");
        assert_eq!(state["workspace"]["activeEditorTabId"], "logic:rust");
        assert_eq!(state["workspace"]["openFileIds"][0], "main");
        assert_eq!(
            state["workspace"]["openTabs"][0]["relativePath"],
            "ui/Main.ui.json"
        );
        assert_eq!(state["workspace"]["rightDockTab"], "connections");
        assert_eq!(state["workspace"]["leftDockCollapsed"], false);
        assert_eq!(state["workspace"]["rightDockCollapsed"], true);
        assert_eq!(state["workspace"]["bottomDock"]["expanded"], true);
        assert_eq!(state["workspace"]["bottomDock"]["minimized"], false);
        assert_eq!(state["workspace"]["bottomDock"]["height"], 384);
        assert_eq!(state["workspace"]["bottomDock"]["expandedHeight"], 640);
        assert_eq!(state["workspace"]["bottomDock"]["logSearchQuery"], "panic");
        assert_eq!(
            state["workspace"]["selectedRailActionPresetId"],
            "release-exe"
        );
        assert_eq!(state["workspace"]["canvas"]["controlsExpanded"], true);
        assert_eq!(state["workspace"]["canvas"]["tabOrderOverlayVisible"], true);
        assert_eq!(state["workspace"]["canvas"]["activeBreakpoint"], "tablet");
        assert_eq!(state["workspace"]["canvas"]["zoom"], 0.75);
        assert_eq!(state["workspace"]["canvas"]["viewport"]["scrollLeft"], 128);
        assert_eq!(state["workspace"]["canvas"]["viewport"]["scrollTop"], 96);
        assert_eq!(
            state["workspace"]["canvas"]["selection"]["selectedItemIds"][0],
            "hero-button"
        );
        assert_eq!(
            state["workspace"]["canvas"]["selection"]["selectedItemIds"][1],
            "status-label"
        );
        assert_eq!(
            state["workspace"]["canvas"]["selection"]["anchorId"],
            "hero-button"
        );
        assert_eq!(
            state["workspace"]["canvas"]["selection"]["selectedCount"],
            2
        );
        assert_eq!(state["workspace"]["projectExplorer"]["filter"], "rust");
        assert_eq!(state["workspace"]["projectExplorer"]["query"], "logic");
        assert_eq!(
            state["workspace"]["projectExplorer"]["selectedNodeId"],
            "rust-folder"
        );
        assert_eq!(
            state["workspace"]["projectExplorer"]["collapsedNodeIds"][0],
            "app-folder"
        );
        assert_eq!(
            state["workspace"]["projectExplorer"]["collapsedNodeIds"][1],
            "nova-folder"
        );
        assert_eq!(state["workspace"]["navigator"]["query"], "hero");
        assert_eq!(state["workspace"]["componentPalette"]["query"], "button");
        assert_eq!(state["workspace"]["componentPalette"]["category"], "inputs");
        assert_eq!(
            state["workspace"]["componentPalette"]["recentTypes"][2],
            "table"
        );
        assert_eq!(
            state["workspace"]["componentPalette"]["favoriteTypes"][1],
            "frame"
        );
        assert_eq!(
            state["workspace"]["inspector"]["propertySections"]["content"],
            false
        );
        assert_eq!(
            state["workspace"]["inspector"]["propertySections"]["state"],
            true
        );
        assert_eq!(
            state["workspace"]["inspector"]["propertySections"]["appearance"],
            true
        );
        assert_eq!(state["workspace"]["inspector"]["query"], "label");
        assert_eq!(state["workspace"]["rustEditor"]["findQuery"], "invoke");
        assert_eq!(state["workspace"]["rustEditor"]["findCaseSensitive"], true);
        assert_eq!(state["workspace"]["rustEditor"]["scrollTop"], 220);
        assert_eq!(state["workspace"]["rustEditor"]["scrollLeft"], 18);
        assert_eq!(state["workspace"]["rustEditor"]["wordWrap"], true);
        assert_eq!(state["workspace"]["rustEditor"]["selectionStart"], 32);
        assert_eq!(state["workspace"]["rustEditor"]["selectionEnd"], 46);
        assert_eq!(state["workspace"]["logic"]["searchQuery"], "slot status");
        assert_eq!(state["workspace"]["logic"]["view"], "modules");
        assert_eq!(state["workspace"]["logic"]["connectionFilter"], "unbound");
        assert_eq!(state["workspace"]["taskCenter"]["searchQuery"], "release");
        assert_eq!(state["workspace"]["taskCenter"]["statusFilter"], "failed");
        assert_eq!(state["workspace"]["taskCenter"]["kindFilter"], "build");
        assert_eq!(
            state["workspace"]["taskCenter"]["selectedTaskId"],
            "task-build-exe"
        );
        assert_eq!(
            state["workspace"]["taskCenter"]["logSearchQuery"],
            "warning"
        );
        assert_eq!(state["workspace"]["taskCenter"]["queuePaused"], true);
        assert_eq!(
            state["workspace"]["generatedPlan"]["activePath"],
            "app/src/App.tsx"
        );
        assert_eq!(
            state["workspace"]["generatedPlan"]["selectedPaths"][1],
            "app/src-tauri/src/lib.rs"
        );
        assert_eq!(state["workspace"]["generatedPlan"]["advancedOpen"], true);
        assert_eq!(
            state["workspace"]["issues"]["selectedIssueId"],
            "diagnostic:app/src-tauri/src/lib.rs:42"
        );
        assert_eq!(state["counts"]["files"], 1);
        assert_eq!(state["counts"]["controls"], 2);
        assert!(
            state["paths"]["metadata"]
                .as_str()
                .is_some_and(|path| path.ends_with(".nova")),
            "metadata path should point at the hidden .nova folder"
        );

        let workspace_path = root.join(".nova").join("workspace.json");
        assert!(
            workspace_path.exists(),
            "workspace metadata index should live under .nova"
        );
        let workspace: Value = serde_json::from_str(
            &fs::read_to_string(&workspace_path).expect("read workspace metadata"),
        )
        .expect("parse workspace metadata");
        assert_eq!(workspace["schema"], "nova.workspace.v1");
        assert_eq!(workspace["project"]["activeFileName"], "Main.ui");
        assert_eq!(workspace["counts"]["files"], 1);
        assert_eq!(workspace["counts"]["rustCommands"], 1);
        assert_eq!(workspace["editor"]["activeMode"], "logic");
        assert_eq!(workspace["editor"]["openFileIds"][0], "main");
        assert_eq!(workspace["editor"]["openFileCount"], 1);
        assert_eq!(workspace["files"][0]["relativePath"], "ui/Main.ui.json");
        assert_eq!(workspace["files"][0]["window"]["titlebarStyle"], "nova");
        assert_eq!(workspace["files"][0]["window"]["designRulers"], true);
        assert_eq!(workspace["files"][0]["window"]["runtimeGrid"], false);
        assert_eq!(workspace["release"]["titlebarStyle"], "nova");
        assert_eq!(workspace["release"]["showRuntimePanel"], false);
        assert_eq!(workspace["rust"]["logicPath"], "rust/logic.rs");
        assert!(
            workspace["paths"]["workspaceMetadata"]
                .as_str()
                .is_some_and(|path| path.ends_with(".nova\\workspace.json")
                    || path.ends_with(".nova/workspace.json")),
            "workspace metadata path should point at .nova/workspace.json"
        );
        assert!(
            workspace["managedFolders"]
                .as_array()
                .is_some_and(|folders| folders.iter().any(|folder| folder == ".nova/checkpoints")),
            "workspace metadata should describe managed hidden project folders"
        );
    }

    #[test]
    fn read_editor_project_merges_hidden_editor_state_metadata() {
        let root = env::temp_dir().join("nova-ui-read-hidden-editor-state");
        if root.exists() {
            fs::remove_dir_all(&root).expect("remove old hidden editor state project");
        }

        let project = checkpoint_test_project(&root);
        save_project_files(&root, &project, DEFAULT_RUST_LOGIC).expect("save project files");

        let manifest_path = root.join("nova.project.json");
        let mut manifest: Value =
            serde_json::from_str(&fs::read_to_string(&manifest_path).expect("read manifest"))
                .expect("parse manifest");
        manifest["editorState"]["activeMode"] = json!("design");
        manifest["editorState"]["selectedRailActionPresetId"] = json!("design-preflight");
        manifest["editorState"]["bottomDockLogSearchQuery"] = json!("stale-output");
        manifest["editorState"]["selectedItemIds"] = json!(["stale-control"]);
        manifest["editorState"]["selectionAnchorId"] = json!("stale-control");
        manifest["editorState"]["navigatorQuery"] = json!("stale-navigator");
        manifest["editorState"]["componentPaletteQuery"] = json!("stale-component");
        manifest["editorState"]["componentPaletteCategory"] = json!("display");
        manifest["editorState"]["componentPaletteRecentTypes"] = json!(["stale-control"]);
        manifest["editorState"]["componentPaletteFavoriteTypes"] = json!(["stale-control"]);
        manifest["editorState"]["inspectorPropertySections"] = json!({
            "layout": false,
            "content": true,
            "state": false,
            "appearance": false,
            "actions": true
        });
        manifest["editorState"]["rustFindQuery"] = json!("stale-find");
        manifest["editorState"]["logicSearchQuery"] = json!("stale-logic");
        manifest["editorState"]["logicResourceView"] = json!("state");
        manifest["editorState"]["logicConnectionFilter"] = json!("bound");
        manifest["editorState"]["rustEditorScrollTop"] = json!(0);
        manifest["editorState"]["rustEditorSelectionStart"] = json!(0);
        manifest["editorState"]["projectTaskSearchQuery"] = json!("stale-task");
        manifest["editorState"]["projectTaskQueuePaused"] = json!(false);
        manifest["editorState"]["activeGeneratedPreviewPath"] = json!("stale/generated.txt");
        manifest["editorState"]["selectedGeneratedPreviewPaths"] = json!(["stale/generated.txt"]);
        manifest["editorState"]["showGeneratedPlanAdvanced"] = json!(false);
        manifest["editorState"]["selectedBuilderIssueId"] = json!("stale-issue");
        fs::write(
            &manifest_path,
            serde_json::to_string_pretty(&manifest).expect("format stale manifest"),
        )
        .expect("write stale manifest");

        let read = read_editor_project(root.display().to_string()).expect("read editor project");
        assert_eq!(read["rootPath"], Value::String(root.display().to_string()));
        assert_eq!(read["activeFileId"], "main");
        assert_eq!(read["editorState"]["activeMode"], "logic");
        assert_eq!(read["editorState"]["activeEditorTabId"], "logic:rust");
        assert_eq!(read["editorState"]["leftDockCollapsed"], false);
        assert_eq!(read["editorState"]["rightDockCollapsed"], true);
        assert_eq!(
            read["editorState"]["selectedRailActionPresetId"],
            "release-exe"
        );
        assert_eq!(read["editorState"]["bottomDockExpanded"], true);
        assert_eq!(read["editorState"]["bottomDockMinimized"], false);
        assert_eq!(read["editorState"]["bottomDockLogSearchQuery"], "panic");
        assert_eq!(read["editorState"]["projectExplorerFilter"], "rust");
        assert_eq!(
            read["editorState"]["selectedProjectExplorerNodeId"],
            "rust-folder"
        );
        assert_eq!(
            read["editorState"]["collapsedProjectExplorerNodeIds"][1],
            "nova-folder"
        );
        assert_eq!(read["editorState"]["navigatorQuery"], "hero");
        assert_eq!(read["editorState"]["componentPaletteQuery"], "button");
        assert_eq!(read["editorState"]["componentPaletteCategory"], "inputs");
        assert_eq!(
            read["editorState"]["componentPaletteRecentTypes"][2],
            "table"
        );
        assert_eq!(
            read["editorState"]["componentPaletteFavoriteTypes"][1],
            "frame"
        );
        assert_eq!(read["editorState"]["canvasActiveBreakpoint"], "tablet");
        assert_eq!(read["editorState"]["canvasZoom"], 0.75);
        assert_eq!(read["editorState"]["canvasViewportScrollLeft"], 128);
        assert_eq!(read["editorState"]["canvasViewportScrollTop"], 96);
        assert_eq!(read["editorState"]["selectedItemIds"][0], "hero-button");
        assert_eq!(read["editorState"]["selectedItemIds"][1], "status-label");
        assert_eq!(read["editorState"]["selectionAnchorId"], "hero-button");
        assert_eq!(
            read["editorState"]["inspectorPropertySections"]["content"],
            false
        );
        assert_eq!(
            read["editorState"]["inspectorPropertySections"]["state"],
            true
        );
        assert_eq!(
            read["editorState"]["inspectorPropertySections"]["appearance"],
            true
        );
        assert_eq!(read["editorState"]["inspectorPropertyQuery"], "label");
        assert_eq!(read["editorState"]["rustFindQuery"], "invoke");
        assert_eq!(read["editorState"]["rustFindCaseSensitive"], true);
        assert_eq!(read["editorState"]["rustEditorScrollTop"], 220);
        assert_eq!(read["editorState"]["rustEditorScrollLeft"], 18);
        assert_eq!(read["editorState"]["rustEditorWordWrap"], true);
        assert_eq!(read["editorState"]["rustEditorSelectionStart"], 32);
        assert_eq!(read["editorState"]["rustEditorSelectionEnd"], 46);
        assert_eq!(read["editorState"]["logicSearchQuery"], "slot status");
        assert_eq!(read["editorState"]["logicResourceView"], "modules");
        assert_eq!(read["editorState"]["logicConnectionFilter"], "unbound");
        assert_eq!(read["editorState"]["projectTaskSearchQuery"], "release");
        assert_eq!(read["editorState"]["projectTaskStatusFilter"], "failed");
        assert_eq!(read["editorState"]["projectTaskKindFilter"], "build");
        assert_eq!(
            read["editorState"]["selectedProjectTaskId"],
            "task-build-exe"
        );
        assert_eq!(read["editorState"]["projectTaskLogSearchQuery"], "warning");
        assert_eq!(read["editorState"]["projectTaskQueuePaused"], true);
        assert_eq!(
            read["editorState"]["activeGeneratedPreviewPath"],
            "app/src/App.tsx"
        );
        assert_eq!(
            read["editorState"]["selectedGeneratedPreviewPaths"][1],
            "app/src-tauri/src/lib.rs"
        );
        assert_eq!(read["editorState"]["showGeneratedPlanAdvanced"], true);
        assert_eq!(
            read["editorState"]["selectedBuilderIssueId"],
            "diagnostic:app/src-tauri/src/lib.rs:42"
        );
    }

    #[test]
    fn save_project_files_writes_gitignore_without_overwriting_user_rules() {
        let root = env::temp_dir().join("nova-ui-project-gitignore");
        if root.exists() {
            fs::remove_dir_all(&root).expect("remove old gitignore project");
        }
        fs::create_dir_all(&root).expect("create gitignore project");
        fs::write(
            root.join(".gitignore"),
            "custom.local\n\n# >>> Nova UI Editor managed ignores\nold-generated-rule\n# <<< Nova UI Editor managed ignores\n\n!important.keep\n",
        )
        .expect("write existing gitignore");

        let project = checkpoint_test_project(&root);
        save_project_files(&root, &project, DEFAULT_RUST_LOGIC).expect("save project files");

        let gitignore = fs::read_to_string(root.join(".gitignore")).expect("read gitignore");
        assert!(
            gitignore.contains("custom.local") && gitignore.contains("!important.keep"),
            "existing user gitignore rules should be preserved"
        );
        assert!(
            gitignore.contains("app/node_modules/")
                && gitignore.contains("app/src-tauri/target/")
                && gitignore.contains(".nova/runtime/")
                && gitignore.contains(".nova/checkpoints/")
                && gitignore.contains("backend/**/target/"),
            "Nova managed ignore block should cover dependencies, build outputs, runtime logs, checkpoints, and backend artifacts"
        );
        assert!(
            !gitignore.lines().any(|line| {
                let trimmed = line.trim();
                trimmed == ".nova/"
                    || trimmed == ".nova/workspace.json"
                    || trimmed == ".nova/editor-state.json"
            }),
            "reusable .nova workspace metadata should remain trackable"
        );
        assert!(
            !gitignore.contains("old-generated-rule"),
            "old Nova managed block should be replaced"
        );
    }

    #[test]
    fn generated_runtime_uses_nova_drag_titlebar_without_editor_grid() {
        let project = checkpoint_test_project(Path::new("C:/nova-runtime-titlebar"));
        let release = release_config(&project, "Nova Runtime Titlebar");
        let tauri_conf = generated_tauri_conf(&release, &[], &[]);
        let capabilities = generated_capabilities_default();
        let generated_app = generated_app_tsx();
        let generated_css = generated_styles(&release.theme);
        let generated_capture = generated_capture_window_script();

        assert!(
            tauri_conf.contains(r#""decorations": false"#),
            "generated Nova titlebar windows should be borderless so the custom titlebar is the visible shell"
        );
        assert!(
            tauri_conf.contains(r#""maximized": true"#),
            "generated desktop exe windows should open maximized by default"
        );
        assert!(
            tauri_conf.contains(r#""transparent": true"#)
                && tauri_conf.contains(r#""shadow": true"#),
            "generated custom chrome windows should use a transparent shadowed desktop shell like the editor"
        );
        assert!(
            capabilities.contains("core:window:allow-start-dragging")
                && capabilities.contains("core:window:allow-minimize")
                && capabilities.contains("core:window:allow-toggle-maximize")
                && capabilities.contains("core:window:allow-close"),
            "generated app capabilities should allow custom titlebar dragging and controls"
        );
        assert!(
            generated_app.contains(r#"className="window-titlebar""#)
                && generated_app.contains(r#"className="titlebar-drag-region""#)
                && generated_app.contains(r#"data-tauri-drag-region=""#)
                && generated_app.contains(r#"data-titlebar-drag-shell=""#)
                && generated_app.contains(r#"data-titlebar-drag-region=""#)
                && generated_app.contains(r#"data-titlebar-drag-strip=""#)
                && generated_app.contains(r#"data-titlebar-drag-hit-target="background""#)
                && generated_app.contains(r#"data-titlebar-drag-hit-target="brand""#)
                && generated_app.contains("onMouseDown={startWindowDrag}")
                && generated_app.contains("getCurrentWindow().startDragging()")
                && generated_app.contains("event.detail > 1")
                && generated_app.contains(r#"[data-titlebar-interactive='true']"#)
                && generated_app.contains(r#"[data-titlebar-interactive-control]"#)
                && generated_app.contains(r#"data-titlebar-interactive-control=""#)
                && generated_app.contains(r#"data-runtime-titlebar="nova""#)
                && generated_app.contains("data-window-kind={windowKind}")
                && generated_app.contains(r#"data-titlebar-status={status ? "active" : "idle"}"#)
                && generated_app.contains(r#"data-window-control="minimize""#)
                && generated_app.contains(r#"data-window-control="toggle-maximize""#)
                && generated_app.contains(r#"data-window-control="close""#)
                && generated_app.contains(r#"className="window-control-icon window-minimize-icon""#)
                && generated_app.contains(r#"className="window-control-icon window-maximize-icon""#)
                && generated_app.contains(r#"className="window-control-icon window-close-icon""#),
            "generated runtime should expose a stable drag region while keeping controls interactive"
        );
        assert!(
            generated_app.contains(r#"data-runtime-grid="off""#)
                && generated_app.contains(r#"data-runtime-style-contract="nova-desktop-shell""#)
                && generated_app.contains(r#"data-runtime-design-artifacts="none""#)
                && generated_app.contains(r#"data-runtime-body="nova-surface""#)
                && generated_app.contains(r#"data-runtime-surface="viewport""#)
                && generated_app.contains(r#"data-runtime-surface="app-canvas""#)
                && generated_app.contains(r#"data-runtime-design-grid="absent""#)
                && generated_app.contains(r#"data-runtime-rulers="absent""#)
                && generated_app.contains("runtimePageBackground")
                && generated_app.contains(r#"type RuntimePageBackground = "plain" | "soft";"#)
                && generated_app.contains(r#"return value === "soft" ? "soft" : "plain";"#)
                && generated_app.contains("canvas-background-${runtimeBackground}")
                && generated_app.contains("data-runtime-shell={titlebarStyle === \"nova\" ? \"nova\" : titlebarStyle}"),
            "generated runtime should explicitly separate runtime shell/background from editor-only grid settings"
        );
        assert!(
            generated_css.contains(".titlebar-drag-region")
                && generated_css.contains(".titlebar-hit-strip")
                && generated_css.contains(".window-controls")
                && generated_css.contains(".window-control-icon")
                && generated_css.contains(".window-minimize-icon::before")
                && generated_css.contains(".window-maximize-icon::before")
                && generated_css.contains(".window-close-icon::after")
                && generated_css.contains(".app-dialog")
                && generated_css.contains(".app-tool")
                && generated_css.contains(".canvas-viewport")
                && generated_css.contains(".canvas-background-soft")
                && generated_css.contains(".canvas-background-plain")
                && generated_css.contains("--nova-runtime-radius")
                && generated_css.contains("--nova-runtime-border")
                && generated_css.contains(r#"[data-runtime-style-contract="nova-desktop-shell"]"#)
                && generated_css.contains(r#"[data-runtime-surface="viewport"]"#)
                && generated_css.contains("@media (prefers-color-scheme: dark)")
                && generated_css.contains("color-scheme: dark")
                && generated_css.contains(".runtime-panel")
                && generated_css.contains("border: 0;")
                && generated_css.contains("box-shadow: none;"),
            "generated runtime CSS should use the Nova titlebar shell and app-like canvas surface"
        );
        assert!(
            !generated_app.contains("showGrid")
                && !generated_app.contains("showRulers")
                && !generated_app.contains("gridSize")
                && !generated_app.contains("canvas-background-grid"),
            "editor-only grid and ruler settings should not be rendered by the generated runtime app"
        );
        assert!(
            !generated_css.contains(".canvas-grid")
                && !generated_css.contains("[data-design-grid]")
                && !generated_css.contains("[data-builder-canvas-grid]")
                && !generated_css.contains(".canvas-background-grid"),
            "generated runtime CSS should not ship editor-only canvas grid selectors"
        );
        assert!(
            generated_capture.contains(r#"[data-runtime-shell]"#)
                && generated_capture.contains("Runtime shell marker missing")
                && generated_capture.contains("Runtime grid marker is not disabled")
                && generated_capture.contains("Runtime style contract missing")
                && generated_capture.contains("Runtime design artifacts marker is not disabled")
                && generated_capture.contains("Runtime app surface markers missing")
                && generated_capture.contains("Editor design grid rendered in runtime")
                && generated_capture.contains("Nova titlebar missing")
                && generated_capture.contains("hasNovaTitlebarDragRegions")
                && generated_capture.contains("hasNovaTitlebarDragStrip")
                && generated_capture.contains("Nova titlebar drag regions missing")
                && generated_capture.contains("hasInteractiveTitlebarControls")
                && generated_capture.contains("hasNovaTitlebarMetadata")
                && generated_capture.contains("hasWindowControlMarkers")
                && generated_capture.contains("hasWindowControlsProtectedFromDrag")
                && generated_capture.contains("Nova titlebar metadata missing")
                && generated_capture.contains("Nova window controls are not identifiable")
                && generated_capture.contains("Nova window controls can start drag")
                && generated_capture.contains("shell,"),
            "generated capture audit should verify exe shell metadata, titlebar rendering, and absence of editor design grid artifacts"
        );
    }

    #[test]
    fn active_ui_window_shape_drives_generated_exe_shell() {
        let root = env::temp_dir().join("nova-ui-active-window-shape");
        let mut project = checkpoint_test_project(&root);
        project["releaseConfig"] = json!({
            "appName": "Shell Sync",
            "windowTitle": "Release Window",
            "windowKind": "main",
            "titlebarStyle": "native",
            "titlebarSubtitle": "Release subtitle",
            "windowWidth": 1200,
            "windowHeight": 800,
            "minWindowWidth": 360,
            "minWindowHeight": 260,
            "resizable": true
        });
        project["files"][0]["page"]["title"] = json!("Inspector Dialog");
        project["files"][0]["page"]["windowKind"] = json!("dialog");
        project["files"][0]["page"]["titlebarStyle"] = json!("hidden");
        project["files"][0]["page"]["titlebarSubtitle"] = json!("Page subtitle");
        project["files"][0]["page"]["width"] = json!(860);
        project["files"][0]["page"]["height"] = json!(540);

        let release = release_config(&project, "Shell Sync");
        let tauri_conf = generated_tauri_conf(&release, &[], &[]);

        assert_eq!(release.window_title, "Inspector Dialog");
        assert_eq!(release.window_kind, "dialog");
        assert_eq!(release.titlebar_style, "hidden");
        assert_eq!(release.titlebar_subtitle, "Page subtitle");
        assert_eq!(release.window_width, 860);
        assert_eq!(release.window_height, 540);
        assert!(
            tauri_conf.contains(r#""decorations": false"#)
                && tauri_conf.contains(r#""transparent": true"#)
                && tauri_conf.contains(r#""shadow": true"#)
                && tauri_conf.contains(r#""center": true"#)
                && tauri_conf.contains(r#""maximized": true"#)
                && tauri_conf.contains(r#""title": "Inspector Dialog""#)
                && tauri_conf.contains(r#""width": 860"#)
                && tauri_conf.contains(r#""height": 540"#),
            "generated Tauri shell should follow the active UI file window shape"
        );
    }

    #[test]
    fn built_executable_launch_path_validation_is_scoped_to_release_output() {
        let root = env::temp_dir().join("nova-ui-launch-validation-check");
        if root.exists() {
            fs::remove_dir_all(&root).expect("remove old launch validation project");
        }
        let release_dir = root
            .join("app")
            .join("src-tauri")
            .join("target")
            .join("release");
        let bundle_dir = release_dir.join("bundle").join("nsis");
        fs::create_dir_all(&release_dir).expect("create release dir");
        fs::create_dir_all(&bundle_dir).expect("create bundle dir");
        let built_exe = release_dir.join("nova-target.exe");
        let installer_exe = bundle_dir.join("Nova Setup.exe");
        let loose_exe = root.join("loose.exe");
        fs::write(&built_exe, b"target exe").expect("write target exe");
        fs::write(&installer_exe, b"installer exe").expect("write installer exe");
        fs::write(&loose_exe, b"loose exe").expect("write loose exe");

        let validated = release_runtime::validate_built_executable_path(&built_exe)
            .expect("target/release exe should launch");
        assert_eq!(
            validated.file_name().and_then(|value| value.to_str()),
            Some("nova-target.exe")
        );
        assert!(
            release_runtime::paths_equal_ignore_case(&validated, &validated),
            "path comparison should recognize the same canonical release exe"
        );
        let log_path =
            release_runtime::runtime_log_path_for_executable(&built_exe, "20260628-085500")
                .expect("runtime log path");
        assert!(
            log_path.ends_with(
                Path::new(".nova")
                    .join("runtime")
                    .join("run-20260628-085500-nova-target.log")
            ),
            "generated app logs should live under the project .nova/runtime directory"
        );
        fs::create_dir_all(log_path.parent().expect("runtime log parent"))
            .expect("create runtime log dir");
        fs::write(&log_path, b"hello runtime").expect("write runtime log");
        assert!(
            release_runtime::validate_runtime_log_path(&log_path).is_ok(),
            "Nova runtime log should pass path validation"
        );
        assert!(
            release_runtime::validate_built_executable_path(&installer_exe).is_err(),
            "installer bundle exe should not be launched as an app"
        );
        assert!(
            release_runtime::validate_built_executable_path(&loose_exe).is_err(),
            "arbitrary exe outside target/release should not be launchable"
        );
    }

    #[test]
    fn certificate_thumbprint_normalization_allows_common_formats() {
        assert_eq!(
            installer_smoke::normalize_certificate_thumbprint("01 23:ab cd"),
            "0123ABCD"
        );
        assert!(installer_smoke::parse_certificate_store_entries("")
            .expect("empty inspection")
            .is_empty());
        let entries = installer_smoke::parse_certificate_store_entries(
            r#"[{"store":"CurrentUser\\My","subject":"CN=Nova","issuer":"CN=CA","thumbprint":"ABCD","has_private_key":true}]"#,
        )
        .expect("parse certificate entries");
        assert_eq!(entries.len(), 1);
        assert!(entries[0].has_private_key);
    }

    #[test]
    fn cargo_check_diagnostic_args_enable_json_output() {
        assert_eq!(
            cargo_check_diagnostic_args(),
            &["check", "--message-format=json"]
        );
    }

    #[test]
    fn backend_method_test_runner_returns_rust_native_result() {
        let root = env::temp_dir().join("nova-ui-backend-method-test-runner");
        if root.exists() {
            fs::remove_dir_all(&root).expect("remove old backend method project");
        }
        let mut project = checkpoint_test_project(&root);
        project["backendIntegrations"] = json!([
            {
                "id": "backend-rust",
                "name": "Rust Tauri backend",
                "kind": "rust-native",
                "language": "rust",
                "transport": "tauri-invoke",
                "entryPath": "src-tauri/src/lib.rs",
                "command": "tauri::Builder invoke_handler",
                "activeMethodId": "method-process-event",
                "methods": [
                    {
                        "id": "method-process-event",
                        "name": "process_event",
                        "operation": "process_event",
                        "path": "/process",
                        "description": "Test method",
                        "requestSchema": "{\"payload\":\"object\"}",
                        "responseSchema": "{\"success\":true}",
                        "samplePayload": "{\"event\":\"click\"}"
                    }
                ],
                "enabled": true
            }
        ]);

        let result = test_backend_integration_method(
            project,
            "backend-rust".to_string(),
            "method-process-event".to_string(),
            json!({ "event": "click", "value": "ok" }),
        )
        .expect("run rust-native backend method test");

        assert!(result.success);
        assert_eq!(result.status, "passed");
        assert_eq!(result.transport, "tauri-invoke");
        assert_eq!(
            result.request.get("methodId").and_then(Value::as_str),
            Some("method-process-event")
        );
        assert_eq!(
            result
                .request
                .get("payload")
                .and_then(|value| value.get("value"))
                .and_then(Value::as_str),
            Some("ok")
        );
        assert!(result.summary.contains("Rust Tauri backend"));
    }

    #[test]
    fn release_config_writes_generated_target_metadata() {
        let root = env::temp_dir().join("nova-ui-release-config-check");
        if root.exists() {
            fs::remove_dir_all(&root).expect("remove old release config project");
        }
        let source_icon = env::temp_dir().join("nova-ui-release-config-icon.png");
        fs::write(&source_icon, [137, 80, 78, 71, 13, 10, 26, 10]).expect("write release icon");

        let mut project = checkpoint_test_project(&root);
        project["releaseConfig"] = json!({
            "appName": "Release Config App",
            "bundleIdentifier": "com.example.release-config",
            "version": "2.3.4",
            "bundleTargets": "nsis",
            "iconAssetId": "asset-icon",
            "signingMode": "windows-certificate",
            "certificateThumbprint": "0123456789ABCDEF0123456789ABCDEF01234567",
            "certificateSourcePath": "C:\\certs\\release-signing.pfx",
            "certificatePasswordEnvVar": "NOVA_TEST_CERT_PASSWORD",
            "importCertificateBeforeBuild": true,
            "digestAlgorithm": "sha512",
            "timestampUrl": "http://timestamp.example.com",
            "timestampTsp": true,
            "minimumArtifactSizeKb": 2,
            "windowTitle": "Release Window",
            "windowWidth": 960,
            "windowHeight": 640,
            "minWindowWidth": 640,
            "minWindowHeight": 420,
            "resizable": false
        });
        project["assets"] = json!([
            {
                "id": "asset-icon",
                "name": "release-icon.png",
                "kind": "image",
                "sourcePath": source_icon.display().to_string(),
                "publicPath": "assets/release-icon.png",
                "addedAt": "2026-06-28T00:00:00.000Z"
            }
        ]);

        save_project_files(&root, &project, DEFAULT_RUST_LOGIC)
            .expect("save release config project");
        let package_json =
            fs::read_to_string(root.join("app").join("package.json")).expect("read package");
        let cargo_toml = fs::read_to_string(root.join("app").join("src-tauri").join("Cargo.toml"))
            .expect("read cargo");
        let tauri_conf =
            fs::read_to_string(root.join("app").join("src-tauri").join("tauri.conf.json"))
                .expect("read tauri config");
        let copied_icon = root
            .join("app")
            .join("src-tauri")
            .join("icons")
            .join("release-icon.png");

        assert!(package_json.contains(r#""name": "release-config-app""#));
        assert!(package_json.contains(r#""version": "2.3.4""#));
        assert!(package_json.contains(r#""tauri:bundle": "tauri build""#));
        assert!(cargo_toml.contains(r#"name = "release-config-app""#));
        assert!(cargo_toml.contains(r#"version = "2.3.4""#));
        assert!(tauri_conf.contains(r#""productName": "Release Config App""#));
        assert!(tauri_conf.contains(r#""identifier": "com.example.release-config""#));
        assert!(tauri_conf.contains(r#""title": "Release Window""#));
        assert!(tauri_conf.contains(r#""width": 960"#));
        assert!(tauri_conf.contains(r#""height": 640"#));
        assert!(tauri_conf.contains(r#""resizable": false"#));
        assert!(tauri_conf.contains(r#""targets": "nsis""#));
        assert!(tauri_conf.contains(r#""icons/release-icon.png""#));
        assert!(tauri_conf
            .contains(r#""certificateThumbprint": "0123456789ABCDEF0123456789ABCDEF01234567""#));
        assert!(tauri_conf.contains(r#""digestAlgorithm": "sha512""#));
        assert!(tauri_conf.contains(r#""timestampUrl": "http://timestamp.example.com""#));
        assert!(tauri_conf.contains(r#""tsp": true"#));
        let release = release_config(&project, "Release Config App");
        assert_eq!(
            release.certificate_password_env_var,
            "NOVA_TEST_CERT_PASSWORD"
        );
        assert!(release.import_certificate_before_build);
        assert_eq!(
            release.certificate_source_path.as_deref(),
            Some("C:\\certs\\release-signing.pfx")
        );
        assert!(
            copied_icon.exists(),
            "release icon should be copied into the generated Tauri icons folder"
        );
    }

    #[test]
    fn generated_file_preview_reports_project_targets_and_diff_status() {
        let root = env::temp_dir().join("nova-ui-generated-file-preview");
        if root.exists() {
            fs::remove_dir_all(&root).expect("remove old preview project");
        }
        let worker_dir = root.join("backend").join("bin");
        fs::create_dir_all(&worker_dir).expect("create backend worker dir");
        fs::write(worker_dir.join("worker.exe"), "worker-binary").expect("write worker artifact");

        let mut project = checkpoint_test_project(&root);
        project["rustModules"] = json!([
            {
                "id": "module-project-state",
                "name": "project_state",
                "source": "pub fn label() -> &'static str {\n    \"preview-ready\"\n}\n",
                "enabled": true
            }
        ]);
        project["cargoDependencies"] = json!([
            {
                "id": "dependency-serde",
                "name": "serde",
                "version": "1",
                "features": "derive",
                "enabled": true
            }
        ]);
        project["backendIntegrations"] = json!([
            {
                "id": "backend-rust",
                "name": "Rust Tauri backend",
                "kind": "rust-native",
                "language": "rust",
                "transport": "tauri-invoke",
                "entryPath": "src-tauri/src/lib.rs",
                "command": "tauri::Builder invoke_handler",
                "notes": "Primary Nova backend.",
                "enabled": true
            },
            {
                "id": "backend-cpp",
                "name": "C++ engine",
                "kind": "cpp-ffi",
                "language": "cpp",
                "transport": "ffi",
                "entryPath": "backend/native/libengine.a",
                "command": "engine_process",
                "notes": "Wrapped by Rust FFI before Tauri invoke.",
                "enabled": true
            },
            {
                "id": "backend-worker",
                "name": "Worker sidecar",
                "kind": "sidecar",
                "language": "go",
                "transport": "stdio",
                "entryPath": "backend/bin/worker.exe",
                "artifactPath": "backend/bin/worker.exe",
                "resourcePath": "resources/backend/backend-worker/worker.exe",
                "command": "{resource} --stdio",
                "notes": "Bundled worker launched by Rust.",
                "bundleResource": true,
                "enabled": true
            }
        ]);
        let rust_logic = r#"#[tauri::command]
fn app_message() -> String {
    project_state::label().to_string()
}
"#;

        let preview = preview_generated_project_files(project.clone(), rust_logic.to_string())
            .expect("preview generated files");
        assert!(
            preview.created_count > 0 && preview.changed_count > 0,
            "empty project folder should report generated files as created"
        );
        let lib_entry = preview
            .entries
            .iter()
            .find(|entry| entry.relative_path == "app/src-tauri/src/lib.rs")
            .expect("lib.rs preview entry");
        assert_eq!(lib_entry.status, "create");
        assert!(lib_entry.preview.contains("mod project_state;"));
        assert!(lib_entry.preview.contains("mod backend_integrations;"));
        assert!(lib_entry
            .preview
            .contains("nova_backend_integration_status"));
        assert!(lib_entry.preview.contains("project_state::label()"));
        // P0-2: created files diff as pure additions with line numbers.
        assert!(
            !lib_entry.diff_lines.is_empty(),
            "created files should still expose diff lines for the preview"
        );
        assert!(
            lib_entry.diff_lines.iter().all(|line| line.kind == "add"),
            "a create entry should diff as additions only"
        );
        assert!(
            lib_entry
                .diff_lines
                .iter()
                .all(|line| line.old_line.is_none() && line.new_line.is_some()),
            "addition rows should carry new-file line numbers only"
        );
        assert_eq!(
            lib_entry.line_diff.as_ref().map(|summary| summary.added),
            Some(lib_entry.diff_lines.len().min(crate::line_diff::MAX_DIFF_LINES)),
        );
        let source_map_entry = preview
            .entries
            .iter()
            .find(|entry| entry.relative_path == "rust/source-map.json")
            .expect("project Rust source-map preview entry");
        assert!(source_map_entry.preview.contains("nova.rustSourceMap.v1"));
        assert!(source_map_entry
            .preview
            .contains("\"generated_start_line\": 4"));
        assert!(
            preview
                .entries
                .iter()
                .any(|entry| entry.relative_path == "app/src-tauri/src/nova_source_map.json"),
            "generated app Rust source map should be included"
        );
        assert!(
            preview
                .entries
                .iter()
                .any(|entry| entry.relative_path == "app/src-tauri/src/project_state.rs"),
            "Rust module target should be included"
        );
        let backend_wrapper_entry = preview
            .entries
            .iter()
            .find(|entry| entry.relative_path == "app/src-tauri/src/backend_integrations.rs")
            .expect("backend wrapper preview entry");
        assert!(backend_wrapper_entry
            .preview
            .contains("pub const BACKEND_INTEGRATIONS"));
        assert!(backend_wrapper_entry
            .preview
            .contains("resources/backend/backend-worker/worker.exe"));
        let cargo_entry = preview
            .entries
            .iter()
            .find(|entry| entry.relative_path == "app/src-tauri/Cargo.toml")
            .expect("Cargo.toml preview entry");
        assert!(cargo_entry
            .preview
            .contains(r#"serde = { version = "1", features = ["derive"] }"#));
        assert!(cargo_entry.preview.contains(r#"libloading = "0.8""#));
        let tauri_entry = preview
            .entries
            .iter()
            .find(|entry| entry.relative_path == "app/src-tauri/tauri.conf.json")
            .expect("tauri config preview entry");
        assert!(tauri_entry
            .preview
            .contains(r#""resources": ["resources/backend/backend-worker/worker.exe"]"#));
        let resource_entry = preview
            .entries
            .iter()
            .find(|entry| {
                entry.relative_path == "app/src-tauri/resources/backend/backend-worker/worker.exe"
            })
            .expect("backend resource preview entry");
        assert_eq!(resource_entry.kind, "backend-resource");
        let backend_entry = preview
            .entries
            .iter()
            .find(|entry| entry.relative_path == "backend/README.md")
            .expect("backend README preview entry");
        assert!(backend_entry.preview.contains("C++ engine"));
        assert!(backend_entry
            .preview
            .contains("Rust/Tauri is the primary backend"));

        save_project_files(&root, &project, rust_logic).expect("save preview project");
        let saved_backend_wrapper = fs::read_to_string(
            root.join("app")
                .join("src-tauri")
                .join("src")
                .join("backend_integrations.rs"),
        )
        .expect("read saved backend wrapper");
        assert!(saved_backend_wrapper.contains("build_bundled_sidecar_command"));
        assert!(saved_backend_wrapper.contains("call_ffi_integration"));
        assert!(saved_backend_wrapper.contains("nova_backend_process"));
        assert!(saved_backend_wrapper.contains("probe_integrations"));
        assert!(saved_backend_wrapper.contains("health_check_command"));
        let saved_source_map =
            fs::read_to_string(root.join("rust").join("source-map.json")).expect("read source map");
        let saved_source_map_json: Value =
            serde_json::from_str(&saved_source_map).expect("parse source map");
        let rust_logic_entry = saved_source_map_json
            .get("entries")
            .and_then(Value::as_array)
            .and_then(|entries| {
                entries
                    .iter()
                    .find(|entry| entry.get("id").and_then(Value::as_str) == Some("rust-logic"))
            })
            .expect("rust logic source-map entry");
        assert_eq!(
            rust_logic_entry
                .get("generated_start_line")
                .and_then(Value::as_u64),
            Some(4)
        );
        assert_eq!(
            rust_logic_entry.get("line_offset").and_then(Value::as_i64),
            Some(3)
        );
        let preview_after_save = preview_generated_project_files(project, rust_logic.to_string())
            .expect("preview after save");
        let saved_lib_entry = preview_after_save
            .entries
            .iter()
            .find(|entry| entry.relative_path == "app/src-tauri/src/lib.rs")
            .expect("saved lib.rs preview entry");
        assert_eq!(saved_lib_entry.status, "unchanged");
    }

    /// P0-3: page config locale/theme must reach the generated CSS and copy.
    #[test]
    fn generated_styles_and_copy_follow_project_locale_and_theme() {
        let root = env::temp_dir().join("nova-ui-generated-locale-theme");
        if root.exists() {
            fs::remove_dir_all(&root).expect("remove old locale/theme project");
        }
        let mut project = checkpoint_test_project(&root);
        project["files"] = json!([
            {
                "id": "main",
                "name": "Main",
                "page": {
                    "title": "Main",
                    "locale": "en-US",
                    "theme": "dark",
                    "windowKind": "main",
                    "titlebarStyle": "nova"
                },
                "items": []
            }
        ]);

        let preview = preview_generated_project_files(project.clone(), DEFAULT_RUST_LOGIC.to_string())
            .expect("preview with locale/theme");
        let index_entry = preview
            .entries
            .iter()
            .find(|entry| entry.relative_path == "app/index.html")
            .expect("index.html preview entry");
        assert!(
            index_entry.preview.contains("lang=\"en\""),
            "index.html lang should follow the project locale, got:\n{}",
            index_entry.preview
        );
        assert!(
            index_entry.preview.contains("window.__NOVA_LOCALE__ = \"en-US\""),
            "index.html should bootstrap the project locale, got:\n{}",
            index_entry.preview
        );

        let styles_entry = preview
            .entries
            .iter()
            .find(|entry| entry.relative_path == "app/src/styles.css")
            .expect("styles.css preview entry");
        assert!(
            styles_entry.preview.contains("Nova project theme: dark"),
            "styles.css should carry the project theme marker"
        );
        assert!(
            styles_entry.preview.contains("--nova-theme-bg: #14121c;"),
            "styles.css should carry the dark palette, got:\n{}",
            styles_entry.preview
        );

        save_project_files(&root, &project, DEFAULT_RUST_LOGIC).expect("save locale/theme project");
        let saved_styles =
            fs::read_to_string(root.join("app").join("src").join("styles.css")).expect("styles");
        assert!(saved_styles.contains("Nova project theme: dark"));
        let saved_index =
            fs::read_to_string(root.join("app").join("index.html")).expect("index");
        assert!(saved_index.contains("lang=\"en\""));
        assert!(saved_index.contains("window.__NOVA_LOCALE__ = \"en-US\""));
    }

    #[test]
    fn save_project_files_preserves_unchanged_generated_file_mtime() {
        let root = env::temp_dir().join("nova-ui-incremental-save-check");
        if root.exists() {
            fs::remove_dir_all(&root).expect("remove old incremental project");
        }
        let project = checkpoint_test_project(&root);
        save_project_files(&root, &project, DEFAULT_RUST_LOGIC).expect("initial save");
        let generated_lib = root
            .join("app")
            .join("src-tauri")
            .join("src")
            .join("lib.rs");
        let first_modified = fs::metadata(&generated_lib)
            .expect("read generated lib metadata")
            .modified()
            .expect("read initial modified time");

        std::thread::sleep(std::time::Duration::from_millis(1100));
        save_project_files(&root, &project, DEFAULT_RUST_LOGIC).expect("second identical save");
        let second_modified = fs::metadata(&generated_lib)
            .expect("read generated lib metadata again")
            .modified()
            .expect("read second modified time");
        assert_eq!(
            first_modified, second_modified,
            "identical generated content should not rewrite the Tauri Rust wrapper"
        );

        std::thread::sleep(std::time::Duration::from_millis(1100));
        save_project_files(
            &root,
            &project,
            r#"#[tauri::command]
fn app_message() -> String {
    "Changed incremental logic".to_string()
}
"#,
        )
        .expect("save changed logic");
        let third_modified = fs::metadata(&generated_lib)
            .expect("read changed generated lib metadata")
            .modified()
            .expect("read changed modified time");
        assert!(
            third_modified > second_modified,
            "changed generated content should update the Tauri Rust wrapper"
        );
    }

    #[test]
    fn apply_generated_files_writes_only_selected_targets_with_snapshot() {
        let root = env::temp_dir().join("nova-ui-generated-file-apply");
        if root.exists() {
            fs::remove_dir_all(&root).expect("remove old apply project");
        }
        let analysis_dir = root.join("backend").join("analysis");
        fs::create_dir_all(&analysis_dir).expect("create analysis backend dir");
        fs::write(analysis_dir.join("main.py"), "print('analysis')")
            .expect("write analysis sidecar");

        let mut project = checkpoint_test_project(&root);
        project["rustModules"] = json!([
            {
                "id": "module-project-state",
                "name": "project_state",
                "source": "pub fn label() -> &'static str {\n    \"apply-ready\"\n}\n",
                "enabled": true
            }
        ]);
        project["cargoDependencies"] = json!([
            {
                "id": "dependency-serde",
                "name": "serde",
                "version": "1",
                "features": "derive",
                "enabled": true
            }
        ]);
        project["backendIntegrations"] = json!([
            {
                "id": "backend-python",
                "name": "Python analysis sidecar",
                "kind": "sidecar",
                "language": "python",
                "transport": "stdio",
                "entryPath": "backend/analysis/main.py",
                "artifactPath": "backend/analysis/main.py",
                "resourcePath": "resources/backend/python-analysis/main.py",
                "command": "python {resource} --stdio",
                "notes": "Optional analysis worker launched by Rust.",
                "bundleResource": true,
                "enabled": true
            }
        ]);
        let rust_logic = r#"#[tauri::command]
fn app_message() -> String {
    project_state::label().to_string()
}
"#;

        let result = apply_generated_project_files(
            project.clone(),
            rust_logic.to_string(),
            vec![
                "app/src-tauri/src/lib.rs".to_string(),
                "app/src-tauri/src/project_state.rs".to_string(),
                "app/src-tauri/src/backend_integrations.rs".to_string(),
                "app/src-tauri/Cargo.toml".to_string(),
                "app/src-tauri/resources/backend/python-analysis/main.py".to_string(),
                "backend/integrations.json".to_string(),
                "backend/README.md".to_string(),
            ],
            "2026-06-28T09:00:00.000Z".to_string(),
        )
        .expect("apply selected generated files");

        assert_eq!(result.requested_count, 7);
        assert_eq!(result.applied_count, 7);
        assert!(PathBuf::from(&result.checkpoint_path).exists());
        assert!(
            root.join("app")
                .join("src-tauri")
                .join("src")
                .join("lib.rs")
                .exists()
                && root
                    .join("app")
                    .join("src-tauri")
                    .join("src")
                    .join("project_state.rs")
                    .exists()
                && root
                    .join("app")
                    .join("src-tauri")
                    .join("src")
                    .join("backend_integrations.rs")
                    .exists()
                && root
                    .join("app")
                    .join("src-tauri")
                    .join("Cargo.toml")
                    .exists()
                && root
                    .join("app")
                    .join("src-tauri")
                    .join("resources")
                    .join("backend")
                    .join("python-analysis")
                    .join("main.py")
                    .exists()
                && root.join("backend").join("integrations.json").exists()
                && root.join("backend").join("README.md").exists(),
            "only selected generated targets should be written"
        );
        assert!(
            !root.join("app").join("src").join("App.tsx").exists(),
            "unselected generated targets should not be written"
        );
        let snapshot =
            fs::read_to_string(result.checkpoint_path).expect("read selected apply snapshot");
        assert!(snapshot.contains(r#""schema": "nova.generatedFileApplySnapshot.v1""#));
        assert!(snapshot.contains(r#""selected_count": 7"#));
        assert!(
            apply_generated_project_files(
                project,
                rust_logic.to_string(),
                vec!["../outside.rs".to_string()],
                "".to_string(),
            )
            .is_err(),
            "unsafe relative paths should be rejected"
        );
    }

    #[test]
    fn bundle_artifacts_collects_generated_installers() {
        let root = env::temp_dir().join("nova-ui-bundle-artifact-check");
        if root.exists() {
            fs::remove_dir_all(&root).expect("remove old bundle artifact project");
        }
        let nsis_dir = generated_bundle_dir(&root).join("nsis");
        let msi_dir = generated_bundle_dir(&root).join("msi");
        let appimage_dir = generated_bundle_dir(&root).join("appimage");
        fs::create_dir_all(&nsis_dir).expect("create nsis dir");
        fs::create_dir_all(&msi_dir).expect("create msi dir");
        fs::create_dir_all(&appimage_dir).expect("create appimage dir");
        fs::write(nsis_dir.join("Nova Setup.exe"), vec![1_u8; 2048]).expect("write nsis artifact");
        fs::write(msi_dir.join("Nova Setup.msi"), vec![2_u8; 2048]).expect("write msi artifact");
        fs::write(appimage_dir.join("Nova.AppImage"), vec![3_u8; 2048])
            .expect("write appimage artifact");
        fs::write(appimage_dir.join("notes.txt"), b"ignore").expect("write ignored file");

        let (bundle_dir, artifacts) = bundle_artifacts(&root).expect("collect bundle artifacts");
        assert!(bundle_dir.is_some(), "bundle dir should be reported");
        assert_eq!(
            artifacts.len(),
            3,
            "only installer artifacts should be returned"
        );
        assert!(
            artifacts
                .iter()
                .any(|path| path.ends_with("Nova Setup.exe"))
                && artifacts
                    .iter()
                    .any(|path| path.ends_with("Nova Setup.msi"))
                && artifacts.iter().any(|path| path.ends_with("Nova.AppImage")),
            "expected bundle installer artifacts should be collected"
        );

        let mut project = checkpoint_test_project(&root);
        project["releaseConfig"] = serde_json::json!({
            "appName": "Nova Release",
            "version": "0.2.0",
            "releaseNotes": "Release notes from test",
            "bundleTargets": "all",
            "signingMode": "custom-command",
            "signCommand": "signtool sign %1",
            "minimumArtifactSizeKb": 1,
            "installerSmokeMode": "write-script",
            "installerSmokeRunnerMode": "vm-handoff",
            "installerSmokeVmName": "Nova Clean Windows VM",
            "installerSmokeVmSharedFolder": "C:\\NovaSmoke",
            "installerSmokeVmNotes": "Reset to clean snapshot before running installers."
        });
        let project_name = project_name(&project);
        let release = release_config(&project, &project_name);
        let manifest_result =
            write_bundle_manifest(&root, &project_name, &release, &bundle_dir, &artifacts)
                .expect("write bundle manifest");
        let manifest = fs::read_to_string(&manifest_result.path).expect("read bundle manifest");
        assert_eq!(manifest_result.smoke_status, "passed");
        assert_eq!(manifest_result.artifact_count, 3);
        let smoke_script_path = manifest_result
            .installer_smoke_script_path
            .as_ref()
            .expect("installer smoke script should be written");
        let smoke_result_path = manifest_result
            .installer_smoke_result_path
            .as_ref()
            .expect("installer smoke result path should be recorded");
        let vm_handoff_path = manifest_result
            .installer_smoke_vm_handoff_path
            .as_ref()
            .expect("installer smoke VM handoff should be written");
        let smoke_script = fs::read_to_string(smoke_script_path).expect("read smoke script");
        let vm_handoff = fs::read_to_string(vm_handoff_path).expect("read VM handoff");
        assert_eq!(manifest_result.installer_smoke_status, "pending");
        assert_eq!(manifest_result.installer_smoke_runner_mode, "vm-handoff");
        assert!(
            manifest.contains(r#""smoke_status": "passed""#)
                && manifest.contains(r#""artifact_count": 3"#)
                && manifest.contains(r#""signing_mode": "custom-command""#)
                && manifest.contains(r#""signing_configured": true"#)
                && manifest.contains(r#""smoke_minimum_artifact_size_bytes": 1024"#)
                && manifest.contains(r#""installer_smoke_mode": "write-script""#)
                && manifest.contains(r#""installer_smoke_runner_mode": "vm-handoff""#)
                && manifest.contains(r#""installer_smoke_vm_name": "Nova Clean Windows VM""#)
                && manifest.contains("installer-smoke-vm-handoff-")
                && manifest.contains(r#""installer_smoke_status": "pending""#)
                && manifest.contains("installer-smoke-result-")
                && manifest.contains("Release notes from test")
                && manifest.contains("Nova Setup.exe"),
            "bundle manifest should record smoke status and artifacts"
        );
        assert!(
            smoke_script.contains("$RunInstallers = $false")
                && smoke_script.contains("msiexec.exe")
                && smoke_script.contains("Nova Setup.msi")
                && smoke_script.contains(smoke_result_path)
                && smoke_script.contains("installer_smoke_status")
                && smoke_script.contains("ConvertTo-Json -Depth 8"),
            "installer smoke script should contain guarded install/uninstall commands"
        );
        let vm_handoff_json: Value = serde_json::from_str(&vm_handoff).expect("parse VM handoff");
        assert_eq!(
            vm_handoff_json.get("schema").and_then(Value::as_str),
            Some("nova.installerSmokeVmHandoff.v1")
        );
        assert_eq!(
            vm_handoff_json.get("runner_mode").and_then(Value::as_str),
            Some("vm-handoff")
        );
        assert_eq!(
            vm_handoff_json.get("vm_name").and_then(Value::as_str),
            Some("Nova Clean Windows VM")
        );
        assert_eq!(
            vm_handoff_json
                .get("smoke_script_path")
                .and_then(Value::as_str),
            Some(smoke_script_path.as_str())
        );
        assert_eq!(
            vm_handoff_json
                .get("smoke_result_path")
                .and_then(Value::as_str),
            Some(smoke_result_path.as_str())
        );
        assert!(
            vm_handoff_json
                .get("artifacts")
                .and_then(Value::as_array)
                .is_some_and(|artifacts| artifacts
                    .iter()
                    .any(|artifact| artifact.get("file_name").and_then(Value::as_str)
                        == Some("Nova Setup.exe"))),
            "VM handoff should capture installer artifacts"
        );
        if cfg!(target_os = "windows") {
            let sandbox_handoff = create_installer_sandbox_handoff(vm_handoff_path.clone())
                .expect("create Windows Sandbox handoff");
            assert_eq!(sandbox_handoff.copied_artifact_count, 3);
            assert!(
                Path::new(&sandbox_handoff.sandbox_config_path).exists(),
                "sandbox config should be written"
            );
            assert!(
                Path::new(&sandbox_handoff.sandbox_script_path).exists(),
                "sandbox smoke script should be written"
            );
            let sandbox_config =
                fs::read_to_string(&sandbox_handoff.sandbox_config_path).expect("read wsb");
            let sandbox_script =
                fs::read_to_string(&sandbox_handoff.sandbox_script_path).expect("read script");
            assert!(sandbox_config.contains("<MappedFolder>"));
            assert!(sandbox_config.contains("run-installer-smoke-in-sandbox.ps1"));
            assert!(sandbox_script.contains("$RunInstallers = $true"));
            assert!(sandbox_script.contains("windows-sandbox"));

            let smoke_result =
                run_installer_smoke_script(smoke_script_path.clone(), smoke_result_path.clone())
                    .expect("run installer smoke script");
            assert_eq!(smoke_result.status, "artifact-only");
            assert_eq!(smoke_result.artifact_count, 3);
            assert_eq!(smoke_result.failed_count, 0);
            assert!(
                Path::new(smoke_result_path).exists(),
                "smoke runner should write a result json"
            );
            let manifest_after =
                fs::read_to_string(&manifest_result.path).expect("read updated bundle manifest");
            let manifest_after_json: Value =
                serde_json::from_str(manifest_after.trim_start_matches('\u{feff}'))
                    .expect("parse updated bundle manifest");
            assert_eq!(
                manifest_after_json
                    .get("installer_smoke_status")
                    .and_then(Value::as_str),
                Some("artifact-only")
            );
            assert!(
                manifest_after_json
                    .get("installer_smoke_result_summary")
                    .and_then(Value::as_str)
                    .is_some(),
                "smoke runner should write result status back to the bundle manifest"
            );
        }
        assert!(
            project_builds_dir(&root)
                .join("latest-bundle-manifest.json")
                .exists(),
            "latest bundle manifest should be written"
        );
    }

    #[test]
    #[ignore = "Builds a generated Tauri app and can take a while."]
    fn generated_tauri_app_builds_release_exe() {
        let root = env::temp_dir().join("nova-ui-generated-build-check");
        if root.exists() {
            fs::remove_dir_all(&root).expect("remove old generated project");
        }
        let source_asset = env::temp_dir().join("nova-ui-generated-build-check-asset.png");
        fs::write(&source_asset, [137, 80, 78, 71, 13, 10, 26, 10]).expect("write source asset");
        let backend_dir = root.join("backend");
        fs::create_dir_all(&backend_dir).expect("create generated backend dir");
        fs::write(backend_dir.join("go-worker"), "worker-placeholder")
            .expect("write sidecar placeholder");

        let project = json!({
            "id": "build-check",
            "name": "Build Check",
            "description": "Generated app build verification",
            "rootPath": root.display().to_string(),
            "releaseConfig": {
                "appName": "Build Check Pro",
                "bundleIdentifier": "com.example.build-check",
                "version": "1.2.3",
                "windowTitle": "Build Check Window",
                "windowWidth": 720,
                "windowHeight": 520,
                "minWindowWidth": 640,
                "minWindowHeight": 420,
                "resizable": false
            },
            "assets": [
                {
                    "id": "asset-logo",
                    "name": "logo.png",
                    "kind": "image",
                    "sourcePath": source_asset.display().to_string(),
                    "publicPath": "assets/logo.png",
                    "addedAt": "2026-06-28T00:00:00.000Z"
                }
            ],
            "stateVariables": [
                {
                    "id": "state-status",
                    "name": "statusText",
                    "initialValue": "Launch"
                },
                {
                    "id": "state-helper",
                    "name": "helperText",
                    "initialValue": "Waiting"
                }
            ],
            "activeStateVariableId": "state-status",
            "rustCommands": [
                {
                    "id": "cmd-app-message",
                    "name": "app_message",
                    "response": "Hello from generated build check"
                },
                {
                    "id": "cmd-project-status",
                    "name": "project_status",
                    "response": "Build check ready",
                    "acceptsValue": true,
                    "result": {
                        "mode": "json",
                        "messagePath": "message",
                        "statePatchPath": "patch",
                        "successPath": "success",
                        "errorPath": "error"
                    },
                    "parameters": [
                        {
                            "id": "param-event-name",
                            "name": "event_name",
                            "type": "string",
                            "source": "event"
                        },
                        {
                            "id": "param-current-value",
                            "name": "current_value",
                            "type": "string",
                            "source": "value"
                        },
                        {
                            "id": "param-state-snapshot",
                            "name": "state_snapshot",
                            "type": "json",
                            "source": "state"
                        }
                    ]
                },
                {
                    "id": "cmd-go-worker",
                    "name": "run_go_worker",
                    "response": "Invoke Go Worker",
                    "acceptsValue": true,
                    "backendIntegrationId": "backend-go-worker",
                    "backendIntegrationMethodId": "method-process-event",
                    "result": {
                        "mode": "json",
                        "messagePath": "message",
                        "statePatchPath": "patch",
                        "successPath": "success",
                        "errorPath": "error"
                    },
                    "parameters": [
                        {
                            "id": "param-payload",
                            "name": "payload",
                            "type": "json",
                            "source": "payload"
                        }
                    ]
                }
            ],
            "rustModules": [
                {
                    "id": "module-project-state",
                    "name": "project_state",
                    "source": "pub fn suffix() -> &'static str {\n    \"module-ready\"\n}\n",
                    "enabled": true
                }
            ],
            "cargoDependencies": [
                {
                    "id": "dependency-serde",
                    "name": "serde",
                    "version": "1",
                    "features": "derive",
                    "enabled": true
                }
            ],
            "backendIntegrations": [
                {
                    "id": "backend-cpp-engine",
                    "name": "C++ Engine",
                    "kind": "cpp-ffi",
                    "language": "cpp",
                    "transport": "ffi",
                    "entryPath": "backend/cpp-engine",
                    "artifactPath": "backend/cpp-engine/build/bin/Release/nova_cpp_engine_cpp_ffi.dll",
                    "resourcePath": "resources/backend/cpp-engine/nova_cpp_engine_cpp_ffi.dll",
                    "command": "nova_backend_process",
                    "startupTimeoutMs": 1200,
                    "captureOutput": false,
                    "bundleResource": false,
                    "methods": [
                        {
                            "id": "method-cpp-process-event",
                            "name": "process_event",
                            "operation": "process_event",
                            "path": "/process",
                            "description": "Process a Nova UI event through C++ FFI.",
                            "requestSchema": "{\"payload\":\"object\"}",
                            "responseSchema": "{\"success\":true,\"message\":\"ok\",\"patch\":{}}",
                            "samplePayload": "{\"event\":\"click\",\"value\":\"Launch\"}"
                        }
                    ],
                    "notes": "Compiled C++ library loaded by Rust through nova_backend_process.",
                    "enabled": true
                },
                {
                    "id": "backend-go-worker",
                    "name": "Go Worker",
                    "kind": "sidecar",
                    "language": "go",
                    "transport": "stdio",
                    "entryPath": "backend/go-worker",
                    "artifactPath": "backend/go-worker",
                    "resourcePath": "resources/backend/go-worker/go-worker",
                    "command": "go-worker --stdio",
                    "healthCheckCommand": "{resource} --health",
                    "startupTimeoutMs": 1200,
                    "captureOutput": true,
                    "bundleResource": true,
                    "activeMethodId": "method-process-event",
                    "methods": [
                        {
                            "id": "method-process-event",
                            "name": "process_event",
                            "operation": "process_event",
                            "path": "/process",
                            "description": "Process a Nova UI event payload.",
                            "requestSchema": "{\"payload\":\"object\"}",
                            "responseSchema": "{\"success\":true,\"message\":\"ok\",\"patch\":{}}",
                            "samplePayload": "{\"event\":\"click\",\"value\":\"Launch\"}"
                        }
                    ],
                    "notes": "Compiled sidecar launched by Rust when the generated app opts in.",
                    "enabled": true
                }
            ],
            "activeFileId": "main",
            "files": [
                {
                    "id": "main",
                    "name": "Main Window.ui",
                    "path": "ui/Main Window.ui",
                    "updatedAt": "2026-06-27T00:00:00.000Z",
                    "page": {
                        "title": "Build Check",
                        "preset": "dialog",
                        "activeBreakpoint": "desktop",
                        "width": 720,
                        "height": 520,
                        "background": "grid",
                        "showGrid": true,
                        "showRulers": true,
                        "snapToGrid": true,
                        "gridSize": 8,
                        "zoom": 0.8,
                        "autoSave": true
                    },
                    "items": [
                        {
                            "id": "button-1",
                            "type": "button",
                            "name": "Button",
                            "x": 48,
                            "y": 56,
                            "width": 160,
                            "height": 44,
                            "z": 1,
                            "responsive": {
                                "tablet": {
                                    "x": 40,
                                    "y": 48,
                                    "width": 180,
                                    "height": 44
                                },
                                "mobile": {
                                    "x": 24,
                                    "y": 32,
                                    "width": 220,
                                    "height": 48
                                }
                            },
                            "props": {
                                "label": "Launch",
                                "variant": "default",
                                "size": "md",
                                "stateBindings": {
                                    "label": "state-status",
                                    "helper": "state-helper"
                                },
                                "events": {
                                    "click": {
                                        "commandId": "cmd-app-message"
                                    }
                                }
                            }
                        },
                        {
                            "id": "image-1",
                            "type": "image",
                            "name": "Image",
                            "x": 240,
                            "y": 56,
                            "width": 180,
                            "height": 120,
                            "z": 2,
                            "props": {
                                "label": "logo.png",
                                "assetId": "asset-logo",
                                "assetPath": "assets/logo.png",
                                "alt": "Logo",
                                "objectFit": "contain"
                            }
                        },
                        {
                            "id": "frame-1",
                            "type": "frame",
                            "name": "Frame",
                            "x": 48,
                            "y": 220,
                            "width": 360,
                            "height": 180,
                            "z": 3,
                            "props": {
                                "title": "Nested frame",
                                "description": "Contains a generated child control",
                                "layoutMode": "column",
                                "layoutGap": 12,
                                "layoutPadding": 16,
                                "layoutColumns": 2
                            }
                        },
                        {
                            "id": "button-child-1",
                            "type": "button",
                            "parentId": "frame-1",
                            "name": "Button",
                            "x": 24,
                            "y": 96,
                            "width": 180,
                            "height": 44,
                            "z": 4,
                            "props": {
                                "label": "Inside frame",
                                "variant": "default",
                                "size": "md",
                                "events": {
                                    "click": {
                                        "commandId": "cmd-app-message"
                                    }
                                }
                            }
                        },
                        {
                            "id": "input-child-1",
                            "type": "input",
                            "parentId": "frame-1",
                            "name": "Input",
                            "x": 24,
                            "y": 144,
                            "width": 220,
                            "height": 76,
                            "z": 5,
                            "props": {
                                "label": "Status input",
                                "placeholder": "Type to invoke Rust",
                                "helper": "Change invokes project_status",
                                "events": {
                                    "change": {
                                        "commandId": "cmd-project-status",
                                        "passValue": true,
                                        "payloadMode": "json",
                                        "payloadFields": ["event", "itemId", "itemName", "value", "state"],
                                        "resultTargetItemId": "button-1",
                                        "resultTargetProp": "label",
                                        "resultStateId": "state-status",
                                        "applyJsonStatePatch": true
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        });
        let rust_logic = r#"#[tauri::command]
fn app_message() -> String {
    format!("Hello from generated build check / {}", project_state::suffix())
}

#[tauri::command]
fn project_status(event_name: String, current_value: String, state_snapshot: serde_json::Value) -> String {
    let status = format!("{event_name}: {current_value} / {state_snapshot}");
    serde_json::json!({
        "success": true,
        "message": status,
        "patch": {
            "statusText": format!("Build check ready: {current_value}"),
            "helperText": "Synced from Rust"
        }
    }).to_string()
}

#[tauri::command]
fn run_go_worker(app: tauri::AppHandle, payload: serde_json::Value) -> String {
    let payload = serde_json::json!({
        "methodId": "method-process-event",
        "method": "process_event",
        "operation": "process_event",
        "path": "/process",
        "payload": payload
    });
    backend_integrations::call_integration(&app, "backend-go-worker", payload)
}
"#;

        save_project_files(&root, &project, rust_logic).expect("save generated project");
        assert!(
            root.join("assets").join("logo.png").exists(),
            "project asset copy should exist"
        );
        assert!(
            root.join("app")
                .join("src-tauri")
                .join("resources")
                .join("backend")
                .join("go-worker")
                .join("go-worker")
                .exists(),
            "configured backend sidecar resource should be copied into the generated app"
        );
        assert!(
            root.join("app")
                .join("public")
                .join("assets")
                .join("logo.png")
                .exists(),
            "generated app public asset should exist"
        );
        let generated_package_json = fs::read_to_string(root.join("app").join("package.json"))
            .expect("read generated package");
        let generated_cargo_toml =
            fs::read_to_string(root.join("app").join("src-tauri").join("Cargo.toml"))
                .expect("read generated cargo");
        let generated_tauri_conf =
            fs::read_to_string(root.join("app").join("src-tauri").join("tauri.conf.json"))
                .expect("read generated tauri config");
        assert!(
            generated_package_json.contains(r#""name": "build-check-pro""#)
                && generated_package_json.contains(r#""version": "1.2.3""#),
            "generated package.json should use release app name and version"
        );
        assert!(
            generated_cargo_toml.contains(r#"name = "build-check-pro""#)
                && generated_cargo_toml.contains(r#"version = "1.2.3""#),
            "generated Cargo.toml should use release package name and version"
        );
        assert!(
            generated_cargo_toml.contains(r#"serde = { version = "1", features = ["derive"] }"#),
            "generated Cargo.toml should include project-managed dependencies"
        );
        assert!(
            root.join("rust")
                .join("modules")
                .join("project_state.rs")
                .exists()
                && root
                    .join("app")
                    .join("src-tauri")
                    .join("src")
                    .join("project_state.rs")
                    .exists(),
            "project Rust module should be written to saved project and generated app"
        );
        let generated_lib = fs::read_to_string(
            root.join("app")
                .join("src-tauri")
                .join("src")
                .join("lib.rs"),
        )
        .expect("read generated lib");
        assert!(
            generated_lib.contains("mod project_state;")
                && generated_lib.contains("project_state::suffix()"),
            "generated lib.rs should declare project modules before editable Rust logic"
        );
        assert!(
            generated_lib.contains("mod backend_integrations;")
                && generated_lib.contains("nova_backend_integration_status")
                && generated_lib.contains("nova_backend_integration_probe")
                && generated_lib.contains("nova_backend_integration_start")
                && generated_lib.contains("nova_backend_integration_stop")
                && generated_lib.contains("nova_backend_integration_runtime_status")
                && generated_lib.contains("nova_backend_integration_read_log")
                && generated_lib.contains("nova_backend_integration_open_log")
                && generated_lib.contains("nova_backend_integration_call")
                && generated_lib.contains("BackendProcessRegistry::default()")
                && generated_lib.contains("run_go_worker")
                && generated_lib.contains("backend_integrations::call_integration")
                && generated_lib.contains("\"methodId\": \"method-process-event\""),
            "generated lib.rs should register backend integration status, probe, runtime process, log, and call commands"
        );
        let generated_backend_integrations = fs::read_to_string(
            root.join("app")
                .join("src-tauri")
                .join("src")
                .join("backend_integrations.rs"),
        )
        .expect("read generated backend integrations");
        assert!(
            generated_backend_integrations.contains("Go Worker")
                && generated_backend_integrations.contains("build_sidecar_command")
                && generated_backend_integrations.contains("probe_integrations")
                && generated_backend_integrations.contains("start_integration")
                && generated_backend_integrations.contains("stop_integration")
                && generated_backend_integrations.contains("runtime_status")
                && generated_backend_integrations.contains("backend_runtime_log_path")
                && generated_backend_integrations.contains("append_backend_runtime_log")
                && generated_backend_integrations.contains("read_runtime_log")
                && generated_backend_integrations.contains("open_runtime_log")
                && generated_backend_integrations.contains("validate_backend_runtime_log_path")
                && generated_backend_integrations.contains("call_integration")
                && generated_backend_integrations.contains("call_stdio_integration")
                && generated_backend_integrations.contains("call_http_integration")
                && generated_backend_integrations.contains("parse_http_endpoint")
                && generated_backend_integrations.contains("BackendIntegrationMethodPlan")
                && generated_backend_integrations.contains("process_event")
                && generated_backend_integrations.contains("request_schema")
                && generated_backend_integrations.contains("logPath")
                && generated_backend_integrations.contains("health_check_command")
                && generated_backend_integrations.contains("{resource} --health")
                && generated_backend_integrations.contains("go-worker --stdio"),
            "generated backend integration module should include sidecar launcher, health probe, process lifecycle, runtime logging, and protocol call templates"
        );
        assert!(
            generated_tauri_conf.contains(r#""resources": ["resources/backend/go-worker/go-worker"]"#),
            "generated Tauri config should bundle configured backend resources when the artifact exists"
        );
        assert!(
            generated_tauri_conf.contains(r#""productName": "Build Check Pro""#)
                && generated_tauri_conf.contains(r#""identifier": "com.example.build-check""#)
                && generated_tauri_conf.contains(r#""title": "Build Check Window""#)
                && generated_tauri_conf.contains(r#""width": 720"#)
                && generated_tauri_conf.contains(r#""height": 520"#)
                && generated_tauri_conf.contains(r#""maximized": true"#)
                && generated_tauri_conf.contains(r#""resizable": false"#),
            "generated tauri.conf.json should use release identity and window settings"
        );
        let generated_data =
            fs::read_to_string(root.join("app").join("src").join("project-data.ts"))
                .expect("read generated project data");
        assert!(
            generated_data.contains("rustCommandBindings"),
            "generated project data should include command id bindings"
        );
        assert!(
            generated_data.contains("backendIntegrationProbeCommand")
                && generated_data.contains("nova_backend_integration_probe"),
            "generated project data should expose backend probe command name"
        );
        assert!(
            generated_data.contains("backendIntegrationStartCommand")
                && generated_data.contains("nova_backend_integration_start")
                && generated_data.contains("backendIntegrationStopCommand")
                && generated_data.contains("nova_backend_integration_stop")
                && generated_data.contains("backendIntegrationRuntimeStatusCommand")
                && generated_data.contains("nova_backend_integration_runtime_status")
                && generated_data.contains("backendIntegrationReadLogCommand")
                && generated_data.contains("nova_backend_integration_read_log")
                && generated_data.contains("backendIntegrationOpenLogCommand")
                && generated_data.contains("nova_backend_integration_open_log")
                && generated_data.contains("backendIntegrationCallCommand")
                && generated_data.contains("nova_backend_integration_call"),
            "generated project data should expose backend process lifecycle, runtime log, and protocol call command names"
        );
        assert!(
            generated_data.contains("rustCommandSchemas")
                && generated_data.contains(r#""name": "event_name""#)
                && generated_data.contains(r#""name": "state_snapshot""#)
                && generated_data.contains(r#""source": "state""#)
                && generated_data.contains(r#""messagePath": "message""#)
                && generated_data.contains(r#""statePatchPath": "patch""#),
            "generated project data should include named Rust command argument and result schemas"
        );
        assert!(
            generated_data.contains(r#""stateVariables""#)
                && generated_data.contains(r#""stateBindings""#)
                && generated_data.contains(r#""state-status""#),
            "generated project data should preserve project state bindings"
        );
        assert!(
            generated_data.contains(r#""cmd-project-status": "project_status""#),
            "button action id should resolve to sanitized Rust command name"
        );
        assert!(
            generated_data.contains(r#""cmd-go-worker": "run_go_worker""#)
                && generated_data.contains(r#""backendIntegrationId": "backend-go-worker""#)
                && generated_data.contains(r#""backendIntegrationMethodId": "method-process-event""#)
                && generated_data.contains(r#""activeMethodId": "method-process-event""#)
                && generated_data.contains(r#""samplePayload": "{\"event\":\"click\",\"value\":\"Launch\"}""#),
            "backend integration command preset and method declaration should be preserved in generated project data"
        );
        assert!(
            generated_data.contains(r#""change""#)
                && generated_data.contains(r#""commandId": "cmd-project-status""#)
                && generated_data.contains(r#""passValue": true"#)
                && generated_data.contains(r#""resultTargetItemId": "button-1""#),
            "generated project data should preserve parameterized change event bindings"
        );
        assert!(
            generated_data.contains(r#""resultStateId": "state-status""#),
            "generated project data should preserve event result state targets"
        );
        assert!(
            generated_data.contains(r#""applyJsonStatePatch": true"#)
                && generated_data.contains(r#""payloadMode": "json"#)
                && generated_data.contains(r#""payloadFields""#)
                && generated_data.contains(r#""name": "helperText""#),
            "generated project data should preserve payload and JSON state patch settings"
        );
        let generated_app = fs::read_to_string(root.join("app").join("src").join("App.tsx"))
            .expect("read generated app");
        assert!(
            generated_app.contains("eventCommandName")
                && generated_app.contains("onRunCommand")
                && generated_app.contains("ItemPropOverrides")
                && generated_app.contains("StateValues")
                && generated_app.contains("statePatchFromJson")
                && generated_app.contains("eventPayload")
                && generated_app.contains("commandArgs")
                && generated_app.contains("commandSchemas")
                && generated_app.contains("coerceCommandArg")
                && generated_app.contains("commandResultOutcome")
                && generated_app.contains("statePatchFromRecord")
                && generated_app.contains("RuntimeTracePanel")
                && generated_app.contains("Backend health")
                && generated_app.contains("backendIntegrationProbeCommand")
                && generated_app.contains("backendIntegrationStartCommand")
                && generated_app.contains("backendIntegrationStopCommand")
                && generated_app.contains("backendIntegrationRuntimeStatusCommand")
                && generated_app.contains("backendIntegrationReadLogCommand")
                && generated_app.contains("backendIntegrationOpenLogCommand")
                && generated_app.contains("backendRuntimeContext")
                && generated_app.contains("withBackendRuntimeContext")
                && generated_app.contains("backendRuntimeLogs")
                && generated_app.contains("Log summary")
                && generated_app.contains("Open full log")
                && generated_app.contains("backend-log-preview")
                && generated_app.contains("logPath")
                && generated_app.contains("onStartBackend")
                && generated_app.contains("onStopBackend")
                && generated_app.contains("runtimeTrace")
                && generated_app.contains("binding.passValue"),
            "generated app should invoke bound Rust commands from UI control events, payloads, state, write results, expose runtime traces, and manage backend sidecar processes"
        );
        let validation = validate_generated_window(project.clone(), rust_logic.to_string())
            .expect("validate generated window");
        assert!(
            PathBuf::from(&validation.report_path).exists(),
            "validation report should exist"
        );
        assert!(
            PathBuf::from(&validation.snapshot_path).exists(),
            "validation snapshot should exist"
        );
        assert!(
            root.join("validation")
                .join("browser-capture-status.json")
                .exists(),
            "browser capture status should exist"
        );
        if let Some(screenshot_path) = &validation.screenshot_path {
            assert!(
                PathBuf::from(screenshot_path).exists(),
                "runtime screenshot should exist when capture reports a screenshot path"
            );
            let analysis_path = validation
                .screenshot_analysis_path
                .as_ref()
                .expect("screenshot analysis path should exist when screenshot exists");
            assert!(
                PathBuf::from(analysis_path).exists(),
                "screenshot analysis should exist when screenshot exists"
            );
            let analysis = fs::read_to_string(analysis_path).expect("read screenshot analysis");
            let analysis_json: Value =
                serde_json::from_str(&analysis).expect("parse screenshot analysis");
            assert!(
                analysis.contains(r#""status""#)
                    && analysis.contains(r#""contentRatio""#)
                    && analysis.contains(r#""uniqueColorBins""#),
                "screenshot analysis should include machine-readable visual metrics"
            );
            assert_eq!(
                analysis_json.get("isLikelyBlank").and_then(Value::as_bool),
                Some(false),
                "runtime screenshot should not be blank"
            );
            assert_eq!(
                analysis_json
                    .get("capturedSize")
                    .and_then(|value| value.get("width"))
                    .and_then(Value::as_i64),
                Some(720),
                "runtime screenshot should match the generated window width"
            );
            assert_eq!(
                analysis_json
                    .get("capturedSize")
                    .and_then(|value| value.get("height"))
                    .and_then(Value::as_i64),
                Some(520),
                "runtime screenshot should match the generated window height"
            );
            let runtime_audit_path = validation
                .runtime_audit_path
                .as_ref()
                .expect("runtime audit path should exist when browser validation succeeds");
            assert!(
                PathBuf::from(runtime_audit_path).exists(),
                "runtime DOM audit should exist when browser validation succeeds"
            );
            let runtime_audit =
                fs::read_to_string(runtime_audit_path).expect("read runtime DOM audit");
            let runtime_audit_json: Value =
                serde_json::from_str(&runtime_audit).expect("parse runtime DOM audit");
            assert_eq!(
                runtime_audit_json.get("status").and_then(Value::as_str),
                Some("passed"),
                "runtime DOM audit should pass for the generated build-check project"
            );
            assert_eq!(
                runtime_audit_json
                    .get("renderedControlCount")
                    .and_then(Value::as_i64),
                Some(5),
                "runtime DOM audit should find all generated controls"
            );
            assert_eq!(
                runtime_audit_json
                    .get("boundEventControlCount")
                    .and_then(Value::as_i64),
                Some(3),
                "runtime DOM audit should find controls with bound events"
            );
            let breakpoint_validation_path = validation
                .breakpoint_validation_path
                .as_ref()
                .expect("breakpoint validation path should exist when browser validation succeeds");
            assert!(
                PathBuf::from(breakpoint_validation_path).exists(),
                "breakpoint validation summary should exist when browser validation succeeds"
            );
            let breakpoint_validation = fs::read_to_string(breakpoint_validation_path)
                .expect("read breakpoint validation summary");
            let breakpoint_validation_json: Value = serde_json::from_str(&breakpoint_validation)
                .expect("parse breakpoint validation summary");
            assert_eq!(
                breakpoint_validation_json
                    .get("breakpoints")
                    .and_then(Value::as_array)
                    .map(Vec::len),
                Some(3),
                "breakpoint validation should include desktop, tablet, and mobile"
            );
            for breakpoint in ["desktop", "tablet", "mobile"] {
                let entry = breakpoint_validation_json
                    .get("breakpoints")
                    .and_then(Value::as_array)
                    .and_then(|items| {
                        items
                            .iter()
                            .find(|item| item.get("id").and_then(Value::as_str) == Some(breakpoint))
                    })
                    .unwrap_or_else(|| panic!("{breakpoint} validation entry should exist"));
                assert!(
                    entry
                        .get("screenshotPath")
                        .and_then(Value::as_str)
                        .map(|path| PathBuf::from(path).exists())
                        .unwrap_or(false),
                    "{breakpoint} runtime screenshot should exist"
                );
                assert!(
                    entry
                        .get("screenshotAnalysisPath")
                        .and_then(Value::as_str)
                        .map(|path| PathBuf::from(path).exists())
                        .unwrap_or(false),
                    "{breakpoint} screenshot analysis should exist"
                );
                assert!(
                    entry
                        .get("runtimeAuditPath")
                        .and_then(Value::as_str)
                        .map(|path| PathBuf::from(path).exists())
                        .unwrap_or(false),
                    "{breakpoint} runtime audit should exist"
                );
                assert_eq!(
                    entry
                        .get("runtimeAudit")
                        .and_then(|audit| audit.get("renderedControlCount"))
                        .and_then(Value::as_i64),
                    Some(5),
                    "{breakpoint} audit should find all generated controls"
                );
            }
            assert!(
                validation
                    .breakpoint_issues
                    .iter()
                    .any(|issue| issue.breakpoint == "mobile"
                        && issue.item_id.as_deref() == Some("image-1")),
                "validation result should expose mobile image clipping as a locatable issue"
            );
            assert!(
                validation
                    .breakpoint_issues
                    .iter()
                    .any(|issue| issue.breakpoint == "mobile"
                        && issue.item_id.as_deref() == Some("frame-1")),
                "validation result should expose mobile frame clipping as a locatable issue"
            );
        }
        let app_dir = root.join("app");
        run_process(&app_dir, "npm", &["install"]).expect("install generated app dependencies");
        run_process(&app_dir, "npm", &["run", "tauri:exe"]).expect("build generated app exe");

        let paths = project_paths_for_project(&root, &project);
        assert!(
            paths.output_exe_path.is_some(),
            "generated app exe should exist after build"
        );
    }
}
