use crate::incremental_io::{remove_stale_generated_files, write_text_if_changed};
use crate::{
    copy_project_assets_to_dir, generated_backend_integrations_readme, generated_project_readme,
    generated_rust_source_map_json, normalized_checkpoint_created_at, project_name, release_config,
    rust_module_source, rust_modules, rust_source, safe_file_name, to_error, write_generated_app,
};
use serde_json::{json, Value};
use std::{collections::BTreeSet, fs, path::Path};

pub(super) fn save_project_files(
    root: &Path,
    project: &Value,
    rust_logic: &str,
) -> Result<(), String> {
    let project_name = project_name(project);
    fs::create_dir_all(root).map_err(to_error)?;

    let manifest_path = root.join("nova.project.json");
    let manifest = serde_json::to_string_pretty(project).map_err(to_error)?;
    write_text_if_changed(&manifest_path, &manifest)?;
    write_editor_state(root, project)?;
    write_workspace_metadata(root, project)?;

    let ui_dir = root.join("ui");
    fs::create_dir_all(&ui_dir).map_err(to_error)?;
    if let Some(files) = project.get("files").and_then(Value::as_array) {
        for file in files {
            let file_name = file
                .get("name")
                .and_then(Value::as_str)
                .map(safe_file_name)
                .unwrap_or_else(|| "Untitled.ui".to_string());
            let file_path = ui_dir.join(format!("{file_name}.json"));
            let file_json = serde_json::to_string_pretty(file).map_err(to_error)?;
            write_text_if_changed(&file_path, &file_json)?;
        }
    }

    let logic_dir = root.join("rust");
    fs::create_dir_all(&logic_dir).map_err(to_error)?;
    write_text_if_changed(&logic_dir.join("logic.rs"), &rust_source(rust_logic))?;
    write_text_if_changed(
        &logic_dir.join("source-map.json"),
        &generated_rust_source_map_json(root, project, rust_logic)?,
    )?;
    let project_modules = rust_modules(project);
    let modules_dir = logic_dir.join("modules");
    fs::create_dir_all(&modules_dir).map_err(to_error)?;
    let expected_module_files = project_modules
        .iter()
        .map(|module| format!("{}.rs", module.name))
        .collect::<BTreeSet<_>>();
    remove_stale_generated_files(&modules_dir, &expected_module_files)?;
    for module in &project_modules {
        write_text_if_changed(
            &modules_dir.join(format!("{}.rs", module.name)),
            &rust_module_source(&module.source),
        )?;
    }
    if let Some(commands) = project.get("rustCommands") {
        let commands_json = serde_json::to_string_pretty(commands).map_err(to_error)?;
        write_text_if_changed(&logic_dir.join("commands.json"), &commands_json)?;
    }
    if let Some(dependencies) = project.get("cargoDependencies") {
        let dependencies_json = serde_json::to_string_pretty(dependencies).map_err(to_error)?;
        write_text_if_changed(&logic_dir.join("dependencies.json"), &dependencies_json)?;
    }

    if let Some(integrations) = project.get("backendIntegrations") {
        let backend_dir = root.join("backend");
        fs::create_dir_all(&backend_dir).map_err(to_error)?;
        let integrations_json = serde_json::to_string_pretty(integrations).map_err(to_error)?;
        write_text_if_changed(&backend_dir.join("integrations.json"), &integrations_json)?;
        write_text_if_changed(
            &backend_dir.join("README.md"),
            &generated_backend_integrations_readme(&project_name, integrations),
        )?;
    }

    let assets_dir = root.join("assets");
    fs::create_dir_all(&assets_dir).map_err(to_error)?;
    if let Some(assets) = project.get("assets") {
        let assets_json = serde_json::to_string_pretty(assets).map_err(to_error)?;
        write_text_if_changed(&assets_dir.join("assets.json"), &assets_json)?;
        copy_project_assets_to_dir(project, &assets_dir, None)?;
    }

    write_generated_app(root, project, rust_logic, &project_name)?;
    write_text_if_changed(
        &root.join("README.md"),
        &generated_project_readme(&project_name),
    )?;
    write_project_gitignore(root)?;
    Ok(())
}

fn nova_project_gitignore_block() -> &'static str {
    r#"# >>> Nova UI Editor managed ignores
# Keep project source files tracked:
#   nova.project.json, ui/, rust/, backend/, assets/, app/src/, app/src-tauri/src/,
#   .nova/workspace.json, .nova/editor-state.json

# Generated app dependencies and build outputs
app/node_modules/
app/dist/
app/src-tauri/target/
app/src-tauri/gen/schemas/

# Local backend build artifacts
backend/**/target/
backend/**/build/
backend/**/*.exe
backend/**/*.dll
backend/**/*.dylib
backend/**/*.so

# Nova local runtime/build caches
.nova/builds/
.nova/runtime/
.nova/tasks/
.nova/applies/
.nova/pipelines/
.nova/checkpoints/
.nova/dependency-graph.json
# <<< Nova UI Editor managed ignores
"#
}

fn write_project_gitignore(root: &Path) -> Result<(), String> {
    let path = root.join(".gitignore");
    let block = nova_project_gitignore_block();
    let start_marker = "# >>> Nova UI Editor managed ignores";
    let end_marker = "# <<< Nova UI Editor managed ignores";
    let next_content = match fs::read_to_string(&path) {
        Ok(existing) => {
            if let (Some(start), Some(end)) =
                (existing.find(start_marker), existing.find(end_marker))
            {
                let end_after_marker = end + end_marker.len();
                let mut merged = String::new();
                merged.push_str(existing[..start].trim_end());
                if !merged.is_empty() {
                    merged.push_str("\n\n");
                }
                merged.push_str(block.trim_end());
                let tail = existing[end_after_marker..].trim_start();
                if !tail.is_empty() {
                    merged.push_str("\n\n");
                    merged.push_str(tail);
                }
                merged.push('\n');
                merged
            } else {
                let mut merged = existing.trim_end().to_string();
                if !merged.is_empty() {
                    merged.push_str("\n\n");
                }
                merged.push_str(block.trim_end());
                merged.push('\n');
                merged
            }
        }
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => block.to_string(),
        Err(error) => return Err(to_error(error)),
    };
    write_text_if_changed(&path, &next_content)?;
    Ok(())
}

fn write_editor_state(root: &Path, project: &Value) -> Result<(), String> {
    let nova_dir = root.join(".nova");
    fs::create_dir_all(&nova_dir).map_err(to_error)?;

    let files = project
        .get("files")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let active_file_id = project
        .get("activeFileId")
        .and_then(Value::as_str)
        .unwrap_or_default();
    let active_file = files
        .iter()
        .find(|file| {
            !active_file_id.is_empty()
                && file
                    .get("id")
                    .and_then(Value::as_str)
                    .is_some_and(|id| id == active_file_id)
        })
        .or_else(|| files.first());
    let page = active_file
        .and_then(|file| file.get("page"))
        .unwrap_or(&Value::Null);
    let controls_count = files
        .iter()
        .map(|file| {
            file.get("items")
                .and_then(Value::as_array)
                .map_or(0, Vec::len)
        })
        .sum::<usize>();
    let array_len = |key: &str| {
        project
            .get(key)
            .and_then(Value::as_array)
            .map_or(0, Vec::len)
    };
    let project_name = project_name(project);
    let active_file_name = active_file
        .and_then(|file| file.get("name"))
        .and_then(Value::as_str)
        .unwrap_or("Untitled.ui");
    let editor_state_source = project.get("editorState").unwrap_or(&Value::Null);
    let active_mode = editor_state_source
        .get("activeMode")
        .and_then(Value::as_str)
        .filter(|mode| matches!(*mode, "project" | "design" | "logic" | "build"))
        .unwrap_or("design");
    let editor_string_field = |key: &str, fallback: &str| {
        editor_state_source
            .get(key)
            .and_then(Value::as_str)
            .filter(|value| !value.trim().is_empty())
            .unwrap_or(fallback)
            .to_string()
    };
    let editor_string_array_field = |key: &str| {
        editor_state_source
            .get(key)
            .and_then(Value::as_array)
            .map(|values| {
                values
                    .iter()
                    .filter_map(Value::as_str)
                    .filter(|value| !value.trim().is_empty())
                    .map(ToString::to_string)
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default()
    };
    let valid_file_ids = files
        .iter()
        .filter_map(|file| {
            file.get("id")
                .and_then(Value::as_str)
                .map(ToString::to_string)
        })
        .collect::<BTreeSet<_>>();
    let mut open_file_ids = editor_state_source
        .get("openFileIds")
        .and_then(Value::as_array)
        .map(|ids| {
            ids.iter()
                .filter_map(Value::as_str)
                .filter(|id| valid_file_ids.contains(*id))
                .map(ToString::to_string)
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();
    if !active_file_id.is_empty() && valid_file_ids.contains(active_file_id) {
        open_file_ids.retain(|id| id != active_file_id);
        open_file_ids.insert(0, active_file_id.to_string());
    }
    if open_file_ids.is_empty() {
        if let Some(first_id) = valid_file_ids.iter().next() {
            open_file_ids.push(first_id.clone());
        }
    }
    open_file_ids.truncate(8);
    let open_tabs = open_file_ids
        .iter()
        .filter_map(|file_id| {
            files
                .iter()
                .find(|file| file.get("id").and_then(Value::as_str).is_some_and(|id| id == file_id))
                .map(|file| {
                    let name = file
                        .get("name")
                        .and_then(Value::as_str)
                        .unwrap_or("Untitled.ui");
                    let page = file.get("page").unwrap_or(&Value::Null);
                    json!({
                        "id": file_id,
                        "kind": "ui",
                        "name": name,
                        "relativePath": format!("ui/{}.json", safe_file_name(name)),
                        "active": file_id == active_file_id,
                        "itemCount": file.get("items").and_then(Value::as_array).map_or(0, Vec::len),
                        "window": {
                            "title": page.get("title").and_then(Value::as_str).unwrap_or(name),
                            "kind": page.get("windowKind").and_then(Value::as_str).unwrap_or("main"),
                            "titlebarStyle": page.get("titlebarStyle").and_then(Value::as_str).unwrap_or("nova")
                        }
                    })
                })
        })
        .collect::<Vec<_>>();
    let collapsed_project_explorer_node_ids = editor_state_source
        .get("collapsedProjectExplorerNodeIds")
        .and_then(Value::as_array)
        .map(|ids| {
            ids.iter()
                .filter_map(Value::as_str)
                .filter(|id| !id.trim().is_empty())
                .map(ToString::to_string)
                .collect::<Vec<_>>()
        })
        .unwrap_or_else(|| vec!["app-folder".to_string(), "nova-folder".to_string()]);
    let valid_item_ids = active_file
        .and_then(|file| file.get("items"))
        .and_then(Value::as_array)
        .map(|items| {
            items
                .iter()
                .filter_map(|item| item.get("id").and_then(Value::as_str))
                .map(ToString::to_string)
                .collect::<BTreeSet<_>>()
        })
        .unwrap_or_default();
    let selected_item_ids = editor_state_source
        .get("selectedItemIds")
        .and_then(Value::as_array)
        .map(|ids| {
            ids.iter()
                .filter_map(Value::as_str)
                .filter(|id| valid_item_ids.contains(*id))
                .map(ToString::to_string)
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();
    let selection_anchor_id = editor_state_source
        .get("selectionAnchorId")
        .and_then(Value::as_str)
        .filter(|id| valid_item_ids.contains(*id))
        .map(ToString::to_string)
        .or_else(|| selected_item_ids.first().cloned())
        .unwrap_or_default();
    let selected_item_count = selected_item_ids.len();
    let inspector_property_sections = editor_state_source
        .get("inspectorPropertySections")
        .unwrap_or(&Value::Null);
    let inspector_property_section = |key: &str, fallback: bool| {
        inspector_property_sections
            .get(key)
            .and_then(Value::as_bool)
            .unwrap_or(fallback)
    };
    let editor_state = json!({
        "schema": "nova.editorState.v1",
        "savedAt": normalized_checkpoint_created_at(""),
        "project": {
            "id": project.get("id").and_then(Value::as_str).unwrap_or(""),
            "name": project_name,
            "rootPath": root.display().to_string(),
            "activeFileId": active_file_id,
            "activeFileName": active_file_name
        },
        "workspace": {
            "activeMode": active_mode,
            "activeEditorTabId": editor_string_field("activeEditorTabId", if active_mode == "logic" { "logic:rust" } else if active_mode == "build" { "build:workspace" } else { "" }),
            "openFileIds": open_file_ids,
            "openTabs": open_tabs,
            "leftDockTab": editor_string_field("activeLeftDockTab", "components"),
            "rightDockTab": editor_string_field("activeRightDockTab", "properties"),
            "leftDockCollapsed": editor_state_source.get("leftDockCollapsed").and_then(Value::as_bool).unwrap_or(false),
            "rightDockCollapsed": editor_state_source.get("rightDockCollapsed").and_then(Value::as_bool).unwrap_or(true),
            "bottomDockTab": editor_string_field("activeBottomDockTab", "issues"),
            "bottomDock": {
                "expanded": editor_state_source.get("bottomDockExpanded").and_then(Value::as_bool).unwrap_or(false),
                "minimized": editor_state_source.get("bottomDockMinimized").and_then(Value::as_bool).unwrap_or(true),
                "height": editor_state_source.get("bottomDockHeight").and_then(Value::as_i64).unwrap_or(360),
                "expandedHeight": editor_state_source.get("bottomDockExpandedHeight").and_then(Value::as_i64).unwrap_or(560),
                "logSearchQuery": editor_string_field("bottomDockLogSearchQuery", "")
            },
            "selectedRailActionPresetId": editor_string_field("selectedRailActionPresetId", "design-preflight"),
            "canvas": {
                "controlsExpanded": editor_state_source.get("canvasControlsExpanded").and_then(Value::as_bool).unwrap_or(false),
                "tabOrderOverlayVisible": editor_state_source.get("tabOrderOverlayVisible").and_then(Value::as_bool).unwrap_or(false),
                "activeBreakpoint": editor_string_field("canvasActiveBreakpoint", page.get("activeBreakpoint").and_then(Value::as_str).unwrap_or("desktop")),
                "zoom": editor_state_source.get("canvasZoom").and_then(Value::as_f64).or_else(|| page.get("zoom").and_then(Value::as_f64)).unwrap_or(1.0),
                "viewport": {
                    "scrollLeft": editor_state_source.get("canvasViewportScrollLeft").and_then(Value::as_i64).unwrap_or(0),
                    "scrollTop": editor_state_source.get("canvasViewportScrollTop").and_then(Value::as_i64).unwrap_or(0)
                },
                "selection": {
                    "selectedItemIds": selected_item_ids,
                    "anchorId": selection_anchor_id,
                    "selectedCount": selected_item_count
                }
            },
            "projectExplorer": {
                "filter": editor_string_field("projectExplorerFilter", "all"),
                "query": editor_string_field("projectExplorerQuery", ""),
                "selectedNodeId": editor_string_field("selectedProjectExplorerNodeId", "root"),
                "collapsedNodeIds": collapsed_project_explorer_node_ids
            },
            "navigator": {
                "query": editor_string_field("navigatorQuery", "")
            },
            "componentPalette": {
                "query": editor_string_field("componentPaletteQuery", ""),
                "category": editor_string_field("componentPaletteCategory", "all"),
                "recentTypes": editor_string_array_field("componentPaletteRecentTypes"),
                "favoriteTypes": editor_string_array_field("componentPaletteFavoriteTypes")
            },
            "inspector": {
                "query": editor_string_field("inspectorPropertyQuery", ""),
                "propertySections": {
                    "layout": inspector_property_section("layout", true),
                    "content": inspector_property_section("content", true),
                    "state": inspector_property_section("state", false),
                    "appearance": inspector_property_section("appearance", false),
                    "actions": inspector_property_section("actions", false)
                }
            },
            "rustEditor": {
                "findQuery": editor_string_field("rustFindQuery", ""),
                "findCaseSensitive": editor_state_source.get("rustFindCaseSensitive").and_then(Value::as_bool).unwrap_or(false),
                "scrollTop": editor_state_source.get("rustEditorScrollTop").and_then(Value::as_i64).unwrap_or(0),
                "scrollLeft": editor_state_source.get("rustEditorScrollLeft").and_then(Value::as_i64).unwrap_or(0),
                "wordWrap": editor_state_source.get("rustEditorWordWrap").and_then(Value::as_bool).unwrap_or(false),
                "selectionStart": editor_state_source.get("rustEditorSelectionStart").and_then(Value::as_i64).unwrap_or(0),
                "selectionEnd": editor_state_source.get("rustEditorSelectionEnd").and_then(Value::as_i64).unwrap_or(0)
            },
            "logic": {
                "searchQuery": editor_string_field("logicSearchQuery", ""),
                "view": editor_string_field("logicResourceView", "all"),
                "connectionFilter": editor_string_field("logicConnectionFilter", "all")
            },
            "taskCenter": {
                "searchQuery": editor_string_field("projectTaskSearchQuery", ""),
                "statusFilter": editor_string_field("projectTaskStatusFilter", "all"),
                "kindFilter": editor_string_field("projectTaskKindFilter", "all"),
                "selectedTaskId": editor_string_field("selectedProjectTaskId", ""),
                "logSearchQuery": editor_string_field("projectTaskLogSearchQuery", ""),
                "queuePaused": editor_state_source.get("projectTaskQueuePaused").and_then(Value::as_bool).unwrap_or(false)
            },
            "generatedPlan": {
                "activePath": editor_string_field("activeGeneratedPreviewPath", ""),
                "selectedPaths": editor_string_array_field("selectedGeneratedPreviewPaths"),
                "advancedOpen": editor_state_source.get("showGeneratedPlanAdvanced").and_then(Value::as_bool).unwrap_or(false)
            },
            "issues": {
                "selectedIssueId": editor_string_field("selectedBuilderIssueId", "")
            }
        },
        "activeWindow": {
            "title": page.get("title").and_then(Value::as_str).unwrap_or(active_file_name),
            "kind": page.get("windowKind").and_then(Value::as_str).unwrap_or("main"),
            "titlebarStyle": page.get("titlebarStyle").and_then(Value::as_str).unwrap_or("nova"),
            "titlebarSubtitle": page.get("titlebarSubtitle").and_then(Value::as_str).unwrap_or(""),
            "preset": page.get("preset").and_then(Value::as_str).unwrap_or("desktop"),
            "width": page.get("width").and_then(Value::as_i64).unwrap_or(0),
            "height": page.get("height").and_then(Value::as_i64).unwrap_or(0),
            "background": page.get("background").and_then(Value::as_str).unwrap_or("grid"),
            "designRulers": page.get("showRulers").and_then(Value::as_bool).unwrap_or(true)
        },
        "counts": {
            "files": files.len(),
            "controls": controls_count,
            "rustCommands": array_len("rustCommands"),
            "rustModules": array_len("rustModules"),
            "stateVariables": array_len("stateVariables"),
            "assets": array_len("assets"),
            "backendIntegrations": array_len("backendIntegrations")
        },
        "paths": {
            "manifest": root.join("nova.project.json").display().to_string(),
            "ui": root.join("ui").display().to_string(),
            "rustLogic": root.join("rust").join("logic.rs").display().to_string(),
            "generatedApp": root.join("app").display().to_string(),
            "metadata": nova_dir.display().to_string()
        },
        "notes": [
            "This file stores Nova UI Editor local workspace state.",
            "The source of truth for project content is nova.project.json plus ui/, rust/, backend/, and assets/."
        ]
    });
    let state_json = serde_json::to_string_pretty(&editor_state).map_err(to_error)?;
    write_text_if_changed(&nova_dir.join("editor-state.json"), &state_json)?;
    Ok(())
}

fn write_workspace_metadata(root: &Path, project: &Value) -> Result<(), String> {
    let nova_dir = root.join(".nova");
    fs::create_dir_all(&nova_dir).map_err(to_error)?;

    let project_name = project_name(project);
    let release = release_config(project, &project_name);
    let files = project
        .get("files")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let active_file_id = project
        .get("activeFileId")
        .and_then(Value::as_str)
        .unwrap_or_default();
    let active_file = files
        .iter()
        .find(|file| {
            !active_file_id.is_empty()
                && file
                    .get("id")
                    .and_then(Value::as_str)
                    .is_some_and(|id| id == active_file_id)
        })
        .or_else(|| files.first());
    let active_file_name = active_file
        .and_then(|file| file.get("name"))
        .and_then(Value::as_str)
        .unwrap_or("Untitled.ui");
    let editor_state_source = project.get("editorState").unwrap_or(&Value::Null);
    let active_mode = editor_state_source
        .get("activeMode")
        .and_then(Value::as_str)
        .filter(|mode| matches!(*mode, "project" | "design" | "logic" | "build"))
        .unwrap_or("design");
    let active_editor_tab_id = editor_state_source
        .get("activeEditorTabId")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .unwrap_or(if active_mode == "logic" {
            "logic:rust"
        } else if active_mode == "build" {
            "build:workspace"
        } else {
            ""
        });
    let valid_file_ids = files
        .iter()
        .filter_map(|file| {
            file.get("id")
                .and_then(Value::as_str)
                .map(ToString::to_string)
        })
        .collect::<BTreeSet<_>>();
    let mut open_file_ids = editor_state_source
        .get("openFileIds")
        .and_then(Value::as_array)
        .map(|ids| {
            ids.iter()
                .filter_map(Value::as_str)
                .filter(|id| valid_file_ids.contains(*id))
                .map(ToString::to_string)
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();
    if !active_file_id.is_empty() && valid_file_ids.contains(active_file_id) {
        open_file_ids.retain(|id| id != active_file_id);
        open_file_ids.insert(0, active_file_id.to_string());
    }
    if open_file_ids.is_empty() {
        if let Some(first_id) = valid_file_ids.iter().next() {
            open_file_ids.push(first_id.clone());
        }
    }
    open_file_ids.truncate(8);
    let open_file_count = open_file_ids.len();

    let file_summaries = files
        .iter()
        .map(|file| {
            let name = file
                .get("name")
                .and_then(Value::as_str)
                .filter(|value| !value.trim().is_empty())
                .unwrap_or("Untitled.ui");
            let page = file.get("page").unwrap_or(&Value::Null);
            let item_count = file
                .get("items")
                .and_then(Value::as_array)
                .map_or(0, Vec::len);
            json!({
                "id": file.get("id").and_then(Value::as_str).unwrap_or(""),
                "name": name,
                "relativePath": format!("ui/{}.json", safe_file_name(name)),
                "active": file.get("id").and_then(Value::as_str).is_some_and(|id| id == active_file_id),
                "itemCount": item_count,
                "window": {
                    "title": page.get("title").and_then(Value::as_str).unwrap_or(name),
                    "kind": page.get("windowKind").and_then(Value::as_str).unwrap_or("main"),
                    "titlebarStyle": page.get("titlebarStyle").and_then(Value::as_str).unwrap_or("nova"),
                    "titlebarSubtitle": page.get("titlebarSubtitle").and_then(Value::as_str).unwrap_or(""),
                    "preset": page.get("preset").and_then(Value::as_str).unwrap_or("desktop"),
                    "width": page.get("width").and_then(Value::as_i64).unwrap_or(0),
                    "height": page.get("height").and_then(Value::as_i64).unwrap_or(0),
                    "background": page.get("background").and_then(Value::as_str).unwrap_or("grid"),
                    "designRulers": page.get("showRulers").and_then(Value::as_bool).unwrap_or(true),
                    "runtimeGrid": false
                }
            })
        })
        .collect::<Vec<_>>();

    let rust_commands = project
        .get("rustCommands")
        .and_then(Value::as_array)
        .map(|commands| {
            commands
                .iter()
                .map(|command| {
                    json!({
                        "id": command.get("id").and_then(Value::as_str).unwrap_or(""),
                        "name": command.get("name").and_then(Value::as_str).unwrap_or(""),
                        "description": command.get("description").and_then(Value::as_str).unwrap_or(""),
                        "category": command.get("category").and_then(Value::as_str).unwrap_or("command"),
                        "enabled": command.get("enabled").and_then(Value::as_bool).unwrap_or(true),
                        "parameterCount": command.get("parameters").and_then(Value::as_array).map_or(0, Vec::len)
                    })
                })
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();

    let rust_modules_metadata = project
        .get("rustModules")
        .and_then(Value::as_array)
        .map(|modules| {
            modules
                .iter()
                .map(|module| {
                    let name = module
                        .get("name")
                        .and_then(Value::as_str)
                        .filter(|value| !value.trim().is_empty())
                        .unwrap_or("module");
                    json!({
                        "id": module.get("id").and_then(Value::as_str).unwrap_or(""),
                        "name": name,
                        "enabled": module.get("enabled").and_then(Value::as_bool).unwrap_or(true),
                        "relativePath": format!("rust/modules/{}.rs", safe_file_name(name))
                    })
                })
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();

    let cargo_dependencies = project
        .get("cargoDependencies")
        .and_then(Value::as_array)
        .map(|dependencies| {
            dependencies
                .iter()
                .map(|dependency| {
                    json!({
                        "id": dependency.get("id").and_then(Value::as_str).unwrap_or(""),
                        "name": dependency.get("name").and_then(Value::as_str).unwrap_or(""),
                        "version": dependency.get("version").and_then(Value::as_str).unwrap_or(""),
                        "enabled": dependency.get("enabled").and_then(Value::as_bool).unwrap_or(true)
                    })
                })
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();

    let backend_integrations = project
        .get("backendIntegrations")
        .and_then(Value::as_array)
        .map(|integrations| {
            integrations
                .iter()
                .map(|integration| {
                    json!({
                        "id": integration.get("id").and_then(Value::as_str).unwrap_or(""),
                        "name": integration.get("name").and_then(Value::as_str).unwrap_or(""),
                        "language": integration.get("language").and_then(Value::as_str).unwrap_or("rust"),
                        "transport": integration.get("transport").and_then(Value::as_str).unwrap_or("tauri-invoke"),
                        "enabled": integration.get("enabled").and_then(Value::as_bool).unwrap_or(true),
                        "methodCount": integration.get("methods").and_then(Value::as_array).map_or(0, Vec::len)
                    })
                })
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();

    let assets = project
        .get("assets")
        .and_then(Value::as_array)
        .map(|assets| {
            assets
                .iter()
                .map(|asset| {
                    let name = asset
                        .get("name")
                        .and_then(Value::as_str)
                        .filter(|value| !value.trim().is_empty())
                        .unwrap_or("asset");
                    json!({
                        "id": asset.get("id").and_then(Value::as_str).unwrap_or(""),
                        "name": name,
                        "kind": asset.get("kind").and_then(Value::as_str).unwrap_or("image"),
                        "relativePath": format!("assets/{name}"),
                        "publicPath": asset.get("publicPath").and_then(Value::as_str).unwrap_or("")
                    })
                })
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();

    let control_count = files
        .iter()
        .map(|file| {
            file.get("items")
                .and_then(Value::as_array)
                .map_or(0, Vec::len)
        })
        .sum::<usize>();
    let array_len = |key: &str| {
        project
            .get(key)
            .and_then(Value::as_array)
            .map_or(0, Vec::len)
    };

    let workspace_metadata = json!({
        "schema": "nova.workspace.v1",
        "savedAt": normalized_checkpoint_created_at(""),
        "project": {
            "id": project.get("id").and_then(Value::as_str).unwrap_or(""),
            "name": project_name,
            "rootPath": root.display().to_string(),
            "activeFileId": active_file_id,
            "activeFileName": active_file_name
        },
        "paths": {
            "root": root.display().to_string(),
            "manifest": root.join("nova.project.json").display().to_string(),
            "editorState": nova_dir.join("editor-state.json").display().to_string(),
            "workspaceMetadata": nova_dir.join("workspace.json").display().to_string(),
            "ui": root.join("ui").display().to_string(),
            "rust": root.join("rust").display().to_string(),
            "backend": root.join("backend").display().to_string(),
            "assets": root.join("assets").display().to_string(),
            "generatedApp": root.join("app").display().to_string()
        },
        "counts": {
            "files": files.len(),
            "controls": control_count,
            "rustCommands": array_len("rustCommands"),
            "rustModules": array_len("rustModules"),
            "cargoDependencies": array_len("cargoDependencies"),
            "stateVariables": array_len("stateVariables"),
            "assets": array_len("assets"),
            "backendIntegrations": array_len("backendIntegrations")
        },
        "editor": {
            "activeMode": active_mode,
            "activeEditorTabId": active_editor_tab_id,
            "openFileIds": open_file_ids,
            "openFileCount": open_file_count
        },
        "files": file_summaries,
        "rust": {
            "logicPath": "rust/logic.rs",
            "sourceMapPath": "rust/source-map.json",
            "commands": rust_commands,
            "modules": rust_modules_metadata,
            "dependencies": cargo_dependencies
        },
        "backendIntegrations": backend_integrations,
        "assets": assets,
        "release": {
            "appName": release.app_name,
            "slug": release.slug,
            "identifier": release.identifier,
            "version": release.version,
            "bundleTargets": release.bundle_targets,
            "windowTitle": release.window_title,
            "windowKind": release.window_kind,
            "titlebarStyle": release.titlebar_style,
            "titlebarSubtitle": release.titlebar_subtitle,
            "windowWidth": release.window_width,
            "windowHeight": release.window_height,
            "resizable": release.resizable,
            "showRuntimePanel": release.show_runtime_panel
        },
        "managedFolders": [
            "ui",
            "rust",
            "backend",
            "assets",
            "app",
            ".nova/checkpoints",
            ".nova/builds",
            ".nova/runtime",
            ".nova/pipelines",
            ".nova/tasks",
            ".nova/applies"
        ],
        "notes": [
            "This file is a local workspace index for Nova UI Editor.",
            "Do not treat it as the source of truth; nova.project.json remains the portable project manifest."
        ]
    });
    let workspace_json = serde_json::to_string_pretty(&workspace_metadata).map_err(to_error)?;
    write_text_if_changed(&nova_dir.join("workspace.json"), &workspace_json)?;
    Ok(())
}
