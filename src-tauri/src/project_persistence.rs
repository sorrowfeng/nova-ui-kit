use crate::{
    managed_project_root, managed_projects_dir, migrate_project_schema,
    normalized_checkpoint_created_at,
    project_checkpoints_dir, project_editor_state_path, project_name,
    project_paths_for_project, project_root_from_project, project_with_root_path, read_json_file,
    safe_file_name, save_project_files, slugify, to_error, EditorProjectPaths,
    ManagedProjectSummary, ProjectCheckpointDiff, ProjectCheckpointFileDiff,
    ProjectCheckpointResult, ProjectCheckpointSummary, DEFAULT_RUST_LOGIC,
};
use serde_json::{Map, Value};
use std::{
    collections::{BTreeMap, BTreeSet},
    fs,
    path::{Path, PathBuf},
};

#[tauri::command]
pub(super) fn save_editor_project(
    project: Value,
    rust_logic: String,
) -> Result<EditorProjectPaths, String> {
    let project_name = project_name(&project);
    let root = project
        .get("rootPath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from)
        .map(Ok)
        .unwrap_or_else(|| managed_project_root(&project_name))?;

    save_project_files(&root, &project, &rust_logic)?;
    Ok(project_paths_for_project(&root, &project))
}

#[tauri::command]
pub(super) fn read_editor_project(root_path: String) -> Result<Value, String> {
    let root = PathBuf::from(root_path);
    let manifest_path = root.join("nova.project.json");
    let content = fs::read_to_string(manifest_path).map_err(to_error)?;
    let project = migrate_project_schema(serde_json::from_str(&content).map_err(to_error)?)?;
    let project = merge_project_editor_state_metadata(project, &root);
    Ok(project_with_root_path(project, &root))
}

fn merge_project_editor_state_metadata(mut project: Value, root: &Path) -> Value {
    let Some(metadata) = read_json_file(&project_editor_state_path(root)) else {
        return project;
    };
    if metadata.get("schema").and_then(Value::as_str) != Some("nova.editorState.v1") {
        return project;
    }

    if let Some(active_file_id) = metadata
        .get("project")
        .and_then(|project| project.get("activeFileId"))
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
    {
        if let Value::Object(ref mut project_object) = project {
            project_object.insert(
                "activeFileId".to_string(),
                Value::String(active_file_id.to_string()),
            );
        }
    }

    let current_editor_state = project
        .get("editorState")
        .and_then(Value::as_object)
        .cloned()
        .unwrap_or_default();
    let mut editor_state = current_editor_state;
    apply_editor_state_metadata(&mut editor_state, &metadata);

    if let Value::Object(ref mut project_object) = project {
        project_object.insert("editorState".to_string(), Value::Object(editor_state));
    }
    project
}

fn apply_editor_state_metadata(editor_state: &mut Map<String, Value>, metadata: &Value) {
    let workspace = metadata.get("workspace").unwrap_or(&Value::Null);
    let bottom_dock = workspace.get("bottomDock").unwrap_or(&Value::Null);
    let canvas = workspace.get("canvas").unwrap_or(&Value::Null);
    let project_explorer = workspace.get("projectExplorer").unwrap_or(&Value::Null);
    let navigator = workspace.get("navigator").unwrap_or(&Value::Null);
    let component_palette = workspace.get("componentPalette").unwrap_or(&Value::Null);
    let inspector = workspace.get("inspector").unwrap_or(&Value::Null);
    let rust_editor = workspace.get("rustEditor").unwrap_or(&Value::Null);
    let logic = workspace.get("logic").unwrap_or(&Value::Null);
    let task_center = workspace.get("taskCenter").unwrap_or(&Value::Null);
    let generated_plan = workspace.get("generatedPlan").unwrap_or(&Value::Null);
    let issues = workspace.get("issues").unwrap_or(&Value::Null);

    copy_string_field(editor_state, "activeMode", workspace, "activeMode");
    copy_string_field(
        editor_state,
        "activeEditorTabId",
        workspace,
        "activeEditorTabId",
    );
    copy_string_array_field(editor_state, "openFileIds", workspace, "openFileIds");
    copy_string_field(editor_state, "activeLeftDockTab", workspace, "leftDockTab");
    copy_string_field(
        editor_state,
        "activeRightDockTab",
        workspace,
        "rightDockTab",
    );
    copy_bool_field(editor_state, "leftDockCollapsed", workspace, "leftDockCollapsed");
    copy_bool_field(
        editor_state,
        "rightDockCollapsed",
        workspace,
        "rightDockCollapsed",
    );
    copy_string_field(
        editor_state,
        "activeBottomDockTab",
        workspace,
        "bottomDockTab",
    );
    copy_bool_field(editor_state, "bottomDockExpanded", bottom_dock, "expanded");
    copy_bool_field(
        editor_state,
        "bottomDockMinimized",
        bottom_dock,
        "minimized",
    );
    copy_i64_field(editor_state, "bottomDockHeight", bottom_dock, "height");
    copy_i64_field(
        editor_state,
        "bottomDockExpandedHeight",
        bottom_dock,
        "expandedHeight",
    );
    copy_string_field(
        editor_state,
        "bottomDockLogSearchQuery",
        bottom_dock,
        "logSearchQuery",
    );
    copy_string_field(
        editor_state,
        "selectedRailActionPresetId",
        workspace,
        "selectedRailActionPresetId",
    );
    copy_bool_field(
        editor_state,
        "canvasControlsExpanded",
        canvas,
        "controlsExpanded",
    );
    copy_bool_field(
        editor_state,
        "tabOrderOverlayVisible",
        canvas,
        "tabOrderOverlayVisible",
    );
    copy_string_field(
        editor_state,
        "canvasActiveBreakpoint",
        canvas,
        "activeBreakpoint",
    );
    copy_number_field(editor_state, "canvasZoom", canvas, "zoom");
    let canvas_viewport = canvas.get("viewport").unwrap_or(&Value::Null);
    copy_i64_field(
        editor_state,
        "canvasViewportScrollLeft",
        canvas_viewport,
        "scrollLeft",
    );
    copy_i64_field(
        editor_state,
        "canvasViewportScrollTop",
        canvas_viewport,
        "scrollTop",
    );
    let canvas_selection = canvas.get("selection").unwrap_or(&Value::Null);
    copy_string_array_field(
        editor_state,
        "selectedItemIds",
        canvas_selection,
        "selectedItemIds",
    );
    copy_string_field(
        editor_state,
        "selectionAnchorId",
        canvas_selection,
        "anchorId",
    );
    copy_string_field(
        editor_state,
        "projectExplorerFilter",
        project_explorer,
        "filter",
    );
    copy_string_field(
        editor_state,
        "projectExplorerQuery",
        project_explorer,
        "query",
    );
    copy_string_field(
        editor_state,
        "selectedProjectExplorerNodeId",
        project_explorer,
        "selectedNodeId",
    );
    copy_string_array_field(
        editor_state,
        "collapsedProjectExplorerNodeIds",
        project_explorer,
        "collapsedNodeIds",
    );
    copy_string_field(editor_state, "navigatorQuery", navigator, "query");
    copy_string_field(
        editor_state,
        "componentPaletteQuery",
        component_palette,
        "query",
    );
    copy_string_field(
        editor_state,
        "componentPaletteCategory",
        component_palette,
        "category",
    );
    copy_string_array_field(
        editor_state,
        "componentPaletteRecentTypes",
        component_palette,
        "recentTypes",
    );
    copy_string_array_field(
        editor_state,
        "componentPaletteFavoriteTypes",
        component_palette,
        "favoriteTypes",
    );
    copy_string_field(editor_state, "inspectorPropertyQuery", inspector, "query");
    let inspector_property_sections = inspector.get("propertySections").unwrap_or(&Value::Null);
    copy_property_section_state(editor_state, inspector_property_sections);
    copy_string_field(editor_state, "rustFindQuery", rust_editor, "findQuery");
    copy_bool_field(
        editor_state,
        "rustFindCaseSensitive",
        rust_editor,
        "findCaseSensitive",
    );
    copy_i64_field(
        editor_state,
        "rustEditorScrollTop",
        rust_editor,
        "scrollTop",
    );
    copy_i64_field(
        editor_state,
        "rustEditorScrollLeft",
        rust_editor,
        "scrollLeft",
    );
    copy_bool_field(
        editor_state,
        "rustEditorWordWrap",
        rust_editor,
        "wordWrap",
    );
    copy_i64_field(
        editor_state,
        "rustEditorSelectionStart",
        rust_editor,
        "selectionStart",
    );
    copy_i64_field(
        editor_state,
        "rustEditorSelectionEnd",
        rust_editor,
        "selectionEnd",
    );
    copy_string_field(editor_state, "logicSearchQuery", logic, "searchQuery");
    copy_string_field(editor_state, "logicResourceView", logic, "view");
    copy_string_field(
        editor_state,
        "logicConnectionFilter",
        logic,
        "connectionFilter",
    );
    copy_string_field(
        editor_state,
        "projectTaskSearchQuery",
        task_center,
        "searchQuery",
    );
    copy_string_field(
        editor_state,
        "projectTaskStatusFilter",
        task_center,
        "statusFilter",
    );
    copy_string_field(
        editor_state,
        "projectTaskKindFilter",
        task_center,
        "kindFilter",
    );
    copy_string_field(
        editor_state,
        "selectedProjectTaskId",
        task_center,
        "selectedTaskId",
    );
    copy_string_field(
        editor_state,
        "projectTaskLogSearchQuery",
        task_center,
        "logSearchQuery",
    );
    copy_bool_field(
        editor_state,
        "projectTaskQueuePaused",
        task_center,
        "queuePaused",
    );
    copy_string_field(
        editor_state,
        "activeGeneratedPreviewPath",
        generated_plan,
        "activePath",
    );
    copy_string_array_field(
        editor_state,
        "selectedGeneratedPreviewPaths",
        generated_plan,
        "selectedPaths",
    );
    copy_bool_field(
        editor_state,
        "showGeneratedPlanAdvanced",
        generated_plan,
        "advancedOpen",
    );
    copy_string_field(
        editor_state,
        "selectedBuilderIssueId",
        issues,
        "selectedIssueId",
    );
    copy_string_field(editor_state, "updatedAt", metadata, "savedAt");
}

fn copy_string_field(
    target: &mut Map<String, Value>,
    target_key: &str,
    source: &Value,
    source_key: &str,
) {
    if let Some(value) = source
        .get(source_key)
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
    {
        target.insert(target_key.to_string(), Value::String(value.to_string()));
    }
}

fn copy_bool_field(
    target: &mut Map<String, Value>,
    target_key: &str,
    source: &Value,
    source_key: &str,
) {
    if let Some(value) = source.get(source_key).and_then(Value::as_bool) {
        target.insert(target_key.to_string(), Value::Bool(value));
    }
}

fn copy_i64_field(
    target: &mut Map<String, Value>,
    target_key: &str,
    source: &Value,
    source_key: &str,
) {
    if let Some(value) = source.get(source_key).and_then(Value::as_i64) {
        target.insert(target_key.to_string(), Value::Number(value.into()));
    }
}

fn copy_number_field(
    target: &mut Map<String, Value>,
    target_key: &str,
    source: &Value,
    source_key: &str,
) {
    if let Some(value) = source
        .get(source_key)
        .and_then(Value::as_f64)
        .and_then(serde_json::Number::from_f64)
    {
        target.insert(target_key.to_string(), Value::Number(value));
    }
}

fn copy_property_section_state(target: &mut Map<String, Value>, source: &Value) {
    let mut sections = Map::new();
    for key in ["layout", "content", "state", "appearance", "actions"] {
        if let Some(value) = source.get(key).and_then(Value::as_bool) {
            sections.insert(key.to_string(), Value::Bool(value));
        }
    }
    if !sections.is_empty() {
        target.insert(
            "inspectorPropertySections".to_string(),
            Value::Object(sections),
        );
    }
}

fn copy_string_array_field(
    target: &mut Map<String, Value>,
    target_key: &str,
    source: &Value,
    source_key: &str,
) {
    if let Some(values) = source.get(source_key).and_then(Value::as_array) {
        let strings = values
            .iter()
            .filter_map(Value::as_str)
            .filter(|value| !value.trim().is_empty())
            .map(|value| Value::String(value.to_string()))
            .collect::<Vec<_>>();
        if !strings.is_empty() {
            target.insert(target_key.to_string(), Value::Array(strings));
        }
    }
}

#[tauri::command]
pub(super) fn list_editor_projects() -> Result<Vec<ManagedProjectSummary>, String> {
    let base = managed_projects_dir()?;
    if !base.exists() {
        return Ok(Vec::new());
    }

    let mut projects = Vec::new();
    for entry in fs::read_dir(base).map_err(to_error)? {
        let entry = entry.map_err(to_error)?;
        let root = entry.path();
        if !root.is_dir() {
            continue;
        }

        let manifest_path = root.join("nova.project.json");
        if !manifest_path.exists() {
            continue;
        }

        let manifest = fs::read_to_string(&manifest_path)
            .ok()
            .and_then(|content| serde_json::from_str::<Value>(&content).ok());
        let name = manifest
            .as_ref()
            .and_then(|value| value.get("name"))
            .and_then(Value::as_str)
            .map(ToString::to_string)
            .or_else(|| {
                root.file_name()
                    .map(|value| value.to_string_lossy().to_string())
            })
            .unwrap_or_else(|| "Untitled Project".to_string());
        let updated_at = manifest
            .as_ref()
            .and_then(|value| value.get("updatedAt"))
            .and_then(Value::as_str)
            .map(ToString::to_string);

        projects.push(ManagedProjectSummary {
            name,
            root_path: root.display().to_string(),
            manifest_path: manifest_path.display().to_string(),
            updated_at,
        });
    }

    projects.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(projects)
}

#[tauri::command]
pub(super) fn create_project_checkpoint(
    project: Value,
    rust_logic: String,
    label: String,
    created_at: String,
) -> Result<ProjectCheckpointResult, String> {
    let project_name = project_name(&project);
    let root = project_root_from_project(&project, &project_name)?;
    let project = project_with_root_path(project, &root);
    save_project_files(&root, &project, &rust_logic)?;

    let checkpoint_dir = project_checkpoints_dir(&root);
    fs::create_dir_all(&checkpoint_dir).map_err(to_error)?;
    let label = normalized_checkpoint_label(&label);
    let created_at = normalized_checkpoint_created_at(&created_at);
    let id = unique_checkpoint_id(&checkpoint_dir, &created_at, &label);
    let path = checkpoint_dir.join(format!("{id}.json"));
    let payload = serde_json::json!({
        "id": id,
        "label": label,
        "createdAt": created_at,
        "project": project.clone(),
        "rustLogic": rust_logic,
    });
    let payload_json = serde_json::to_string_pretty(&payload).map_err(to_error)?;
    fs::write(&path, payload_json).map_err(to_error)?;

    Ok(ProjectCheckpointResult {
        checkpoint: checkpoint_summary_from_payload(&path, &payload),
        paths: project_paths_for_project(&root, &project),
    })
}

#[tauri::command]
pub(super) fn list_project_checkpoints(
    root_path: String,
) -> Result<Vec<ProjectCheckpointSummary>, String> {
    let checkpoint_dir = project_checkpoints_dir(&PathBuf::from(root_path));
    if !checkpoint_dir.exists() {
        return Ok(Vec::new());
    }

    let mut checkpoints = Vec::new();
    for entry in fs::read_dir(checkpoint_dir).map_err(to_error)? {
        let entry = entry.map_err(to_error)?;
        let path = entry.path();
        if path.extension().and_then(|value| value.to_str()) != Some("json") {
            continue;
        }
        let Some(payload) = read_json_file(&path) else {
            continue;
        };
        checkpoints.push(checkpoint_summary_from_payload(&path, &payload));
    }

    checkpoints.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(checkpoints)
}

#[tauri::command]
pub(super) fn diff_project_checkpoint(
    project: Value,
    rust_logic: String,
    root_path: String,
    checkpoint_id: String,
) -> Result<ProjectCheckpointDiff, String> {
    let root = PathBuf::from(root_path);
    let (checkpoint_path, payload) = read_checkpoint_payload(&root, &checkpoint_id)?;
    let checkpoint_project = payload
        .get("project")
        .cloned()
        .ok_or_else(|| "Checkpoint is missing project data".to_string())?;
    let checkpoint_rust_logic = payload
        .get("rustLogic")
        .and_then(Value::as_str)
        .or_else(|| checkpoint_project.get("rustLogic").and_then(Value::as_str))
        .unwrap_or(DEFAULT_RUST_LOGIC);

    Ok(project_checkpoint_diff(
        &project,
        &rust_logic,
        &checkpoint_project,
        checkpoint_rust_logic,
        checkpoint_summary_from_payload(&checkpoint_path, &payload),
    ))
}

#[tauri::command]
pub(super) fn restore_project_checkpoint(
    root_path: String,
    checkpoint_id: String,
) -> Result<Value, String> {
    let root = PathBuf::from(root_path);
    let (_, payload) = read_checkpoint_payload(&root, &checkpoint_id)?;
    let project = payload
        .get("project")
        .cloned()
        .ok_or_else(|| "Checkpoint is missing project data".to_string())?;
    let project = project_with_root_path(project, &root);
    let rust_logic = payload
        .get("rustLogic")
        .and_then(Value::as_str)
        .or_else(|| project.get("rustLogic").and_then(Value::as_str))
        .unwrap_or(DEFAULT_RUST_LOGIC);
    save_project_files(&root, &project, rust_logic)?;
    Ok(project)
}

fn normalized_checkpoint_label(label: &str) -> String {
    let label = label.trim();
    if label.is_empty() {
        "Manual checkpoint".to_string()
    } else {
        label.to_string()
    }
}

fn checkpoint_id_seed(created_at: &str, label: &str) -> String {
    let stamp = created_at
        .chars()
        .filter(|ch| ch.is_ascii_alphanumeric())
        .take(18)
        .collect::<String>();
    let stamp = if stamp.is_empty() {
        normalized_checkpoint_created_at("")
    } else {
        stamp
    };
    format!("{}-{}", stamp, slugify(label))
}

fn unique_checkpoint_id(checkpoint_dir: &Path, created_at: &str, label: &str) -> String {
    let base = checkpoint_id_seed(created_at, label);
    let mut id = base.clone();
    let mut suffix = 2;
    while checkpoint_dir.join(format!("{id}.json")).exists() {
        id = format!("{base}-{suffix}");
        suffix += 1;
    }
    id
}

fn read_checkpoint_payload(root: &Path, checkpoint_id: &str) -> Result<(PathBuf, Value), String> {
    let checkpoint_path =
        project_checkpoints_dir(root).join(format!("{}.json", safe_file_name(checkpoint_id)));
    if !checkpoint_path.exists() {
        return Err(format!(
            "Checkpoint does not exist: {}",
            checkpoint_path.display()
        ));
    }

    let content = fs::read_to_string(&checkpoint_path).map_err(to_error)?;
    let payload = serde_json::from_str(&content).map_err(to_error)?;
    Ok((checkpoint_path, payload))
}

fn checkpoint_summary_from_payload(path: &Path, payload: &Value) -> ProjectCheckpointSummary {
    let project = payload.get("project").unwrap_or(payload);
    ProjectCheckpointSummary {
        id: payload
            .get("id")
            .and_then(Value::as_str)
            .map(ToString::to_string)
            .or_else(|| {
                path.file_stem()
                    .map(|value| value.to_string_lossy().to_string())
            })
            .unwrap_or_else(|| "checkpoint".to_string()),
        label: payload
            .get("label")
            .and_then(Value::as_str)
            .map(ToString::to_string)
            .unwrap_or_else(|| "Manual checkpoint".to_string()),
        created_at: payload
            .get("createdAt")
            .and_then(Value::as_str)
            .map(ToString::to_string)
            .unwrap_or_else(|| "0".to_string()),
        path: path.display().to_string(),
        project_name: project_name(project),
        file_count: project
            .get("files")
            .and_then(Value::as_array)
            .map(Vec::len)
            .unwrap_or(0),
        command_count: project
            .get("rustCommands")
            .and_then(Value::as_array)
            .map(Vec::len)
            .unwrap_or(0),
    }
}

fn project_checkpoint_diff(
    current_project: &Value,
    current_rust_logic: &str,
    checkpoint_project: &Value,
    checkpoint_rust_logic: &str,
    checkpoint: ProjectCheckpointSummary,
) -> ProjectCheckpointDiff {
    let current_files = project_file_map(current_project);
    let checkpoint_files = project_file_map(checkpoint_project);
    let file_keys = current_files
        .keys()
        .chain(checkpoint_files.keys())
        .cloned()
        .collect::<BTreeSet<_>>();
    let mut added_files = Vec::new();
    let mut removed_files = Vec::new();
    let mut changed_files = Vec::new();

    for key in file_keys {
        match (current_files.get(&key), checkpoint_files.get(&key)) {
            (None, Some(checkpoint_file)) => added_files.push(checkpoint_file.name.clone()),
            (Some(current_file), None) => removed_files.push(current_file.name.clone()),
            (Some(current_file), Some(checkpoint_file)) => {
                if current_file.comparable != checkpoint_file.comparable {
                    changed_files.push(ProjectCheckpointFileDiff {
                        name: checkpoint_file.name.clone(),
                        change: "changed".to_string(),
                        current_items: current_file.item_count,
                        checkpoint_items: checkpoint_file.item_count,
                    });
                }
            }
            (None, None) => {}
        }
    }

    let current_file_count = current_files.len() as i64;
    let checkpoint_file_count = checkpoint_files.len() as i64;
    let current_item_count = project_item_count(current_project) as i64;
    let checkpoint_item_count = project_item_count(checkpoint_project) as i64;
    let current_command_count = project_array_len(current_project, "rustCommands") as i64;
    let checkpoint_command_count = project_array_len(checkpoint_project, "rustCommands") as i64;
    let current_state_count = project_array_len(current_project, "stateVariables") as i64;
    let checkpoint_state_count = project_array_len(checkpoint_project, "stateVariables") as i64;
    let current_asset_count = project_array_len(current_project, "assets") as i64;
    let checkpoint_asset_count = project_array_len(checkpoint_project, "assets") as i64;
    let metadata_changed = project_metadata_fingerprint(current_project)
        != project_metadata_fingerprint(checkpoint_project);
    let rust_logic_changed =
        normalize_rust_logic(current_rust_logic) != normalize_rust_logic(checkpoint_rust_logic);

    let file_delta = checkpoint_file_count - current_file_count;
    let item_delta = checkpoint_item_count - current_item_count;
    let command_delta = checkpoint_command_count - current_command_count;
    let state_delta = checkpoint_state_count - current_state_count;
    let asset_delta = checkpoint_asset_count - current_asset_count;

    let mut details = Vec::new();
    if metadata_changed {
        details.push("Project metadata differs".to_string());
    }
    if rust_logic_changed {
        details.push("Rust logic differs".to_string());
    }
    if !added_files.is_empty() {
        details.push(format!("Restore will add {} UI file(s)", added_files.len()));
    }
    if !removed_files.is_empty() {
        details.push(format!(
            "Restore will remove {} UI file(s)",
            removed_files.len()
        ));
    }
    if !changed_files.is_empty() {
        details.push(format!("{} UI file(s) differ", changed_files.len()));
    }
    if command_delta != 0 {
        details.push(format!(
            "Command count changes by {}",
            signed_i64(command_delta)
        ));
    }
    if state_delta != 0 {
        details.push(format!(
            "State variable count changes by {}",
            signed_i64(state_delta)
        ));
    }
    if asset_delta != 0 {
        details.push(format!(
            "Asset count changes by {}",
            signed_i64(asset_delta)
        ));
    }

    let touched_files = added_files.len() + removed_files.len() + changed_files.len();
    let summary = if details.is_empty() {
        "Checkpoint matches the current project.".to_string()
    } else {
        format!(
            "Restore affects {} UI file(s), items {}, commands {}, state {}, assets {}.",
            touched_files,
            signed_i64(item_delta),
            signed_i64(command_delta),
            signed_i64(state_delta),
            signed_i64(asset_delta)
        )
    };

    ProjectCheckpointDiff {
        checkpoint,
        summary,
        metadata_changed,
        rust_logic_changed,
        file_delta,
        item_delta,
        command_delta,
        state_delta,
        asset_delta,
        added_files,
        removed_files,
        changed_files,
        details,
    }
}

struct ProjectFileComparable {
    name: String,
    item_count: usize,
    comparable: Value,
}

fn project_file_map(project: &Value) -> BTreeMap<String, ProjectFileComparable> {
    let mut map = BTreeMap::new();
    if let Some(files) = project.get("files").and_then(Value::as_array) {
        for (index, file) in files.iter().enumerate() {
            let key = project_file_key(file, index);
            map.insert(
                key.clone(),
                ProjectFileComparable {
                    name: project_file_name(file, &key),
                    item_count: file_item_count(file),
                    comparable: comparable_file_value(file),
                },
            );
        }
    }
    map
}

fn project_file_key(file: &Value, index: usize) -> String {
    file.get("id")
        .and_then(Value::as_str)
        .or_else(|| file.get("path").and_then(Value::as_str))
        .or_else(|| file.get("name").and_then(Value::as_str))
        .filter(|value| !value.trim().is_empty())
        .map(ToString::to_string)
        .unwrap_or_else(|| format!("file-{index}"))
}

fn project_file_name(file: &Value, fallback: &str) -> String {
    file.get("name")
        .and_then(Value::as_str)
        .or_else(|| file.get("path").and_then(Value::as_str))
        .filter(|value| !value.trim().is_empty())
        .map(ToString::to_string)
        .unwrap_or_else(|| fallback.to_string())
}

fn comparable_file_value(file: &Value) -> Value {
    let mut comparable = file.clone();
    if let Value::Object(ref mut object) = comparable {
        object.remove("updatedAt");
    }
    comparable
}

fn file_item_count(file: &Value) -> usize {
    file.get("items")
        .and_then(Value::as_array)
        .map(Vec::len)
        .unwrap_or(0)
}

fn project_item_count(project: &Value) -> usize {
    project
        .get("files")
        .and_then(Value::as_array)
        .map(|files| files.iter().map(file_item_count).sum())
        .unwrap_or(0)
}

fn project_array_len(project: &Value, key: &str) -> usize {
    project
        .get(key)
        .and_then(Value::as_array)
        .map(Vec::len)
        .unwrap_or(0)
}

fn project_metadata_fingerprint(project: &Value) -> String {
    serde_json::json!({
        "name": project.get("name").cloned().unwrap_or(Value::Null),
        "description": project.get("description").cloned().unwrap_or(Value::Null),
        "activeFileId": project.get("activeFileId").cloned().unwrap_or(Value::Null),
        "activeRustCommandId": project.get("activeRustCommandId").cloned().unwrap_or(Value::Null),
        "activeStateVariableId": project.get("activeStateVariableId").cloned().unwrap_or(Value::Null),
    })
    .to_string()
}

fn normalize_rust_logic(value: &str) -> String {
    value.replace("\r\n", "\n")
}

fn signed_i64(value: i64) -> String {
    if value > 0 {
        format!("+{value}")
    } else {
        value.to_string()
    }
}
