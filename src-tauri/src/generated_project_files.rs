use crate::generated_files::{
    generated_file_preview_entry, normalize_preview_relative_path, preview_text,
    push_planned_copy_file, push_planned_text_file, summarize_generated_file_entries,
    ApplyGeneratedFileEntry, ApplyGeneratedFilesResult, GeneratedFileChangeSummary,
    GeneratedFilePreviewResult, PlannedGeneratedFile,
};
use crate::incremental_io::copy_file_if_changed;
use crate::{
    asset_file_name, backend_integrations, backend_integrations_need_ffi_loader,
    cargo_dependencies, default_icon_paths, generated_app_tsx,
    generated_backend_integrations_readme, generated_backend_integrations_rs,
    generated_capture_window_script, generated_cargo_toml, generated_icon_source,
    generated_index_html, generated_lib_rs, generated_main_rs, generated_main_tsx,
    generated_package_json, generated_project_data, generated_project_readme,
    generated_rust_source_map_json, generated_styles, generated_tauri_conf, generated_tsconfig,
    generated_vite_config, json_string, managed_project_root, normalized_checkpoint_created_at,
    path_size_bytes, project_name, project_with_root_path, release_config,
    release_icon_preview_paths, release_icon_preview_source, rust_command_names,
    rust_module_source, rust_modules, rust_source, safe_file_name, slugify, to_error,
    GeneratedBackendIntegration,
};
use serde_json::Value;
use std::{
    collections::{BTreeMap, BTreeSet},
    fs,
    path::{Path, PathBuf},
};

#[tauri::command]
pub(super) fn preview_generated_project_files(
    project: Value,
    rust_logic: String,
) -> Result<GeneratedFilePreviewResult, String> {
    let project_name = project_name(&project);
    let root = project
        .get("rootPath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from)
        .map(Ok)
        .unwrap_or_else(|| managed_project_root(&project_name))?;
    let project = project_with_root_path(project, &root);
    let mut entries = planned_generated_files(&root, &project, &rust_logic, &project_name)?
        .into_iter()
        .map(|file| generated_file_preview_entry(&root, file))
        .collect::<Result<Vec<_>, String>>()?;
    entries.sort_by(|a, b| a.relative_path.cmp(&b.relative_path));

    let change_summary = summarize_generated_file_entries(&entries);

    Ok(GeneratedFilePreviewResult {
        root_path: root.display().to_string(),
        summary: change_summary.summary,
        total_count: change_summary.total_count,
        changed_count: change_summary.changed_count,
        created_count: change_summary.created_count,
        updated_count: change_summary.updated_count,
        unchanged_count: change_summary.unchanged_count,
        asset_count: change_summary.asset_count,
        entries,
    })
}

pub(super) fn generated_file_change_summary(
    root: &Path,
    project: &Value,
    rust_logic: &str,
) -> Result<GeneratedFileChangeSummary, String> {
    let project_name = project_name(project);
    let entries = planned_generated_files(root, project, rust_logic, &project_name)?
        .into_iter()
        .map(|file| generated_file_preview_entry(root, file))
        .collect::<Result<Vec<_>, String>>()?;
    Ok(summarize_generated_file_entries(&entries))
}

#[tauri::command]
pub(super) fn apply_generated_project_files(
    project: Value,
    rust_logic: String,
    relative_paths: Vec<String>,
    created_at: String,
) -> Result<ApplyGeneratedFilesResult, String> {
    let project_name = project_name(&project);
    let root = project
        .get("rootPath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from)
        .map(Ok)
        .unwrap_or_else(|| managed_project_root(&project_name))?;
    let project = project_with_root_path(project, &root);
    let requested = normalize_generated_path_selection(&relative_paths)?;
    if requested.is_empty() {
        return Err("Select at least one generated file to apply.".to_string());
    }

    let planned_files = planned_generated_files(&root, &project, &rust_logic, &project_name)?;
    let mut planned_by_path = planned_files
        .into_iter()
        .map(|file| (file.relative_path.clone(), file))
        .collect::<BTreeMap<_, _>>();
    let unknown = requested
        .iter()
        .filter(|path| !planned_by_path.contains_key(*path))
        .cloned()
        .collect::<Vec<_>>();
    if !unknown.is_empty() {
        return Err(format!(
            "Cannot apply paths outside the generated file plan: {}",
            unknown.join(", ")
        ));
    }

    let created_at = normalized_checkpoint_created_at(&created_at);
    let apply_dir = project_applies_dir(&root);
    fs::create_dir_all(&apply_dir).map_err(to_error)?;
    let safe_created_at = safe_file_name(&created_at);
    let checkpoint_path = apply_dir.join(format!(
        "selected-write-{}-{}.json",
        safe_created_at,
        slugify(&project_name)
    ));
    write_apply_snapshot(
        &checkpoint_path,
        &root,
        &project_name,
        &created_at,
        &requested,
    )?;

    let mut entries = Vec::new();
    let mut applied_count = 0;
    let mut skipped_count = 0;

    for relative_path in requested {
        let Some(planned) = planned_by_path.remove(&relative_path) else {
            continue;
        };
        let target = root.join(&planned.relative_path);
        let mut applied = false;
        let status: String;
        let summary: String;
        if let Some(content) = planned.content.as_deref() {
            if let Some(parent) = target.parent() {
                fs::create_dir_all(parent).map_err(to_error)?;
            }
            fs::write(&target, content).map_err(to_error)?;
            applied = true;
            status = "written".to_string();
            summary = format!("Wrote {} bytes", content.len());
        } else if let Some(source) = planned.copy_source.as_ref() {
            if source.exists() && (source.is_file() || source.is_dir()) {
                if source != &target {
                    copy_path_to_target(source, &target)?;
                }
                applied = true;
                status = "copied".to_string();
                summary = format!("Copied from {}", source.display());
            } else {
                status = "skipped".to_string();
                summary = "Copy source was not available.".to_string();
            }
        } else {
            status = "skipped".to_string();
            summary = "Copy source was not available.".to_string();
        }

        if applied {
            applied_count += 1;
        } else {
            skipped_count += 1;
        }

        entries.push(ApplyGeneratedFileEntry {
            path: target.display().to_string(),
            relative_path: planned.relative_path,
            kind: planned.kind,
            status,
            applied,
            summary,
        });
    }

    let summary = format!(
        "Applied {applied_count} generated file(s), skipped {skipped_count}. Before snapshot: {}",
        checkpoint_path.display()
    );

    Ok(ApplyGeneratedFilesResult {
        root_path: root.display().to_string(),
        checkpoint_path: checkpoint_path.display().to_string(),
        requested_count: entries.len(),
        applied_count,
        skipped_count,
        summary,
        entries,
    })
}

fn project_applies_dir(root: &Path) -> PathBuf {
    root.join(".nova").join("applies")
}

fn normalize_generated_path_selection(paths: &[String]) -> Result<BTreeSet<String>, String> {
    let mut selected = BTreeSet::new();
    for path in paths {
        let normalized = normalize_preview_relative_path(path);
        if normalized.trim().is_empty()
            || normalized.starts_with('/')
            || normalized.contains(':')
            || normalized
                .split('/')
                .any(|part| part.is_empty() || part == "." || part == "..")
        {
            return Err(format!("Invalid generated file path: {path}"));
        }
        selected.insert(normalized);
    }
    Ok(selected)
}

fn write_apply_snapshot(
    checkpoint_path: &Path,
    root: &Path,
    project_name: &str,
    created_at: &str,
    relative_paths: &BTreeSet<String>,
) -> Result<(), String> {
    let files = relative_paths
        .iter()
        .map(|relative_path| {
            let target = root.join(relative_path);
            let exists = target.exists();
            let size_bytes = path_size_bytes(&target);
            let content = if exists && target.is_file() {
                fs::read_to_string(&target)
                    .ok()
                    .map(|value| preview_text(&value))
            } else {
                None
            };
            serde_json::json!({
                "relative_path": relative_path,
                "path": target.display().to_string(),
                "existed": exists,
                "size_bytes": size_bytes,
                "content_preview": content,
            })
        })
        .collect::<Vec<_>>();
    let payload = serde_json::json!({
        "schema": "nova.generatedFileApplySnapshot.v1",
        "project_name": project_name,
        "created_at": created_at,
        "root_path": root.display().to_string(),
        "selected_count": relative_paths.len(),
        "files": files,
    });
    let payload = serde_json::to_string_pretty(&payload).map_err(to_error)?;
    fs::write(checkpoint_path, payload).map_err(to_error)
}

fn planned_generated_files(
    root: &Path,
    project: &Value,
    rust_logic: &str,
    project_name: &str,
) -> Result<Vec<PlannedGeneratedFile>, String> {
    let mut files = Vec::new();

    let manifest = serde_json::to_string_pretty(project).map_err(to_error)?;
    push_planned_text_file(
        &mut files,
        "nova.project.json".to_string(),
        "manifest",
        manifest,
        "Editor project manifest".to_string(),
    );

    if let Some(ui_files) = project.get("files").and_then(Value::as_array) {
        for file in ui_files {
            let file_name = file
                .get("name")
                .and_then(Value::as_str)
                .map(safe_file_name)
                .unwrap_or_else(|| "Untitled.ui".to_string());
            let file_json = serde_json::to_string_pretty(file).map_err(to_error)?;
            push_planned_text_file(
                &mut files,
                format!("ui/{file_name}.json"),
                "ui",
                file_json,
                format!("UI file {file_name}"),
            );
        }
    }

    push_planned_text_file(
        &mut files,
        "rust/logic.rs".to_string(),
        "rust",
        rust_source(rust_logic),
        "Editable Rust command logic".to_string(),
    );
    push_planned_text_file(
        &mut files,
        "rust/source-map.json".to_string(),
        "rust-source-map",
        generated_rust_source_map_json(root, project, rust_logic)?,
        "Rust diagnostic source map for editor-authored logic".to_string(),
    );
    for module in rust_modules(project) {
        push_planned_text_file(
            &mut files,
            format!("rust/modules/{}.rs", module.name),
            "rust-module",
            rust_module_source(&module.source),
            format!("Project Rust module {}", module.name),
        );
    }
    if let Some(commands) = project.get("rustCommands") {
        push_planned_text_file(
            &mut files,
            "rust/commands.json".to_string(),
            "rust",
            serde_json::to_string_pretty(commands).map_err(to_error)?,
            "Rust command registry".to_string(),
        );
    }
    if let Some(dependencies) = project.get("cargoDependencies") {
        push_planned_text_file(
            &mut files,
            "rust/dependencies.json".to_string(),
            "rust",
            serde_json::to_string_pretty(dependencies).map_err(to_error)?,
            "Project Cargo dependency registry".to_string(),
        );
    }
    if let Some(integrations) = project.get("backendIntegrations") {
        push_planned_text_file(
            &mut files,
            "backend/integrations.json".to_string(),
            "backend",
            serde_json::to_string_pretty(integrations).map_err(to_error)?,
            "Project backend integration registry".to_string(),
        );
        push_planned_text_file(
            &mut files,
            "backend/README.md".to_string(),
            "backend",
            generated_backend_integrations_readme(project_name, integrations),
            "Backend integration handoff notes".to_string(),
        );
    }
    if let Some(assets) = project.get("assets") {
        push_planned_text_file(
            &mut files,
            "assets/assets.json".to_string(),
            "asset",
            serde_json::to_string_pretty(assets).map_err(to_error)?,
            "Project asset registry".to_string(),
        );
    }
    if let Some(assets) = project.get("assets").and_then(Value::as_array) {
        for (index, asset) in assets.iter().enumerate() {
            let file_name = asset_file_name(asset, index);
            let copy_source = asset_copy_source(asset, root, &file_name);
            push_planned_copy_file(
                &mut files,
                format!("assets/{file_name}"),
                "asset",
                copy_source.clone(),
                asset_copy_summary_from_source(copy_source.as_deref()),
            );
            push_planned_copy_file(
                &mut files,
                format!("app/public/assets/{file_name}"),
                "asset",
                copy_source.clone(),
                asset_copy_summary_from_source(copy_source.as_deref()),
            );
        }
    }

    let release = release_config(project, project_name);
    let slug = release.slug.clone();
    let command_names = rust_command_names(project);
    let project_modules = rust_modules(project);
    let project_dependencies = cargo_dependencies(project);
    let project_backend_integrations = backend_integrations(project);
    let icon_paths = release_icon_preview_paths(project, &release, Some(&root.join("assets")));
    let backend_resource_paths = backend_bundle_resource_paths(&project_backend_integrations, root);

    push_backend_integration_starter_files(&mut files, root, &project_backend_integrations);

    push_planned_text_file(
        &mut files,
        "app/package.json".to_string(),
        "app",
        generated_package_json(&release),
        "Generated frontend package manifest".to_string(),
    );
    push_planned_text_file(
        &mut files,
        "app/index.html".to_string(),
        "app",
        generated_index_html(&release.app_name),
        "Generated app HTML entry".to_string(),
    );
    push_planned_text_file(
        &mut files,
        "app/vite.config.ts".to_string(),
        "app",
        generated_vite_config().to_string(),
        "Generated Vite config".to_string(),
    );
    push_planned_text_file(
        &mut files,
        "app/tsconfig.json".to_string(),
        "app",
        generated_tsconfig().to_string(),
        "Generated TypeScript config".to_string(),
    );
    push_planned_text_file(
        &mut files,
        "app/src/main.tsx".to_string(),
        "app",
        generated_main_tsx().to_string(),
        "Generated React entry".to_string(),
    );
    push_planned_text_file(
        &mut files,
        "app/src/App.tsx".to_string(),
        "app",
        generated_app_tsx().to_string(),
        "Generated React runtime".to_string(),
    );
    push_planned_text_file(
        &mut files,
        "app/src/styles.css".to_string(),
        "app",
        generated_styles().to_string(),
        "Generated runtime styles".to_string(),
    );
    push_planned_text_file(
        &mut files,
        "app/scripts/capture-window.mjs".to_string(),
        "validation",
        generated_capture_window_script().to_string(),
        "Generated runtime capture helper".to_string(),
    );
    push_planned_text_file(
        &mut files,
        "app/src/project-data.ts".to_string(),
        "app-data",
        generated_project_data(project, &command_names)?,
        "Generated UI/project data".to_string(),
    );
    push_planned_text_file(
        &mut files,
        "app/src-tauri/Cargo.toml".to_string(),
        "cargo",
        generated_cargo_toml(
            &release,
            &project_dependencies,
            backend_integrations_need_ffi_loader(&project_backend_integrations),
        ),
        "Generated Cargo manifest".to_string(),
    );
    push_planned_text_file(
        &mut files,
        "app/src-tauri/build.rs".to_string(),
        "cargo",
        "fn main() { tauri_build::build() }\n".to_string(),
        "Generated Tauri build script".to_string(),
    );
    push_planned_text_file(
        &mut files,
        "app/src-tauri/tauri.conf.json".to_string(),
        "tauri",
        generated_tauri_conf(&release, &icon_paths, &backend_resource_paths),
        "Generated Tauri app config".to_string(),
    );
    push_planned_text_file(
        &mut files,
        "app/src-tauri/src/main.rs".to_string(),
        "rust",
        generated_main_rs(&slug),
        "Generated native entrypoint".to_string(),
    );
    for module in &project_modules {
        push_planned_text_file(
            &mut files,
            format!("app/src-tauri/src/{}.rs", module.name),
            "rust-module",
            rust_module_source(&module.source),
            format!("Generated Rust module {}", module.name),
        );
    }
    if !project_backend_integrations.is_empty() {
        push_planned_text_file(
            &mut files,
            "app/src-tauri/src/backend_integrations.rs".to_string(),
            "backend",
            generated_backend_integrations_rs(&project_backend_integrations),
            "Generated Rust backend integration wrappers".to_string(),
        );
    }
    for integration in &project_backend_integrations {
        if !integration.bundle_resource || integration.resource_path.trim().is_empty() {
            continue;
        }
        let copy_source = backend_artifact_source(integration, root);
        push_planned_copy_file(
            &mut files,
            format!("app/src-tauri/{}", integration.resource_path),
            "backend-resource",
            copy_source.clone(),
            backend_resource_copy_summary(integration, copy_source.as_deref()),
        );
    }
    push_planned_text_file(
        &mut files,
        "app/src-tauri/src/lib.rs".to_string(),
        "rust",
        generated_lib_rs(
            rust_logic,
            &command_names,
            &project_modules,
            &project_backend_integrations,
        ),
        "Generated Tauri command wrapper".to_string(),
    );
    push_planned_text_file(
        &mut files,
        "app/src-tauri/src/nova_source_map.json".to_string(),
        "rust-source-map",
        generated_rust_source_map_json(root, project, rust_logic)?,
        "Generated-app Rust source map for diagnostics".to_string(),
    );
    for icon_path in default_icon_paths() {
        let icon_file_name = Path::new(&icon_path)
            .file_name()
            .map(|value| value.to_string_lossy().to_string())
            .unwrap_or_else(|| "icon.png".to_string());
        let icon_source = generated_icon_source(&icon_file_name);
        push_planned_copy_file(
            &mut files,
            format!("app/src-tauri/{icon_path}"),
            "icon",
            icon_source,
            "Default Nova/Tauri icon copied from editor bundle".to_string(),
        );
    }
    for icon_path in icon_paths
        .iter()
        .filter(|path| path.starts_with("icons/release-icon."))
    {
        let icon_source =
            release_icon_preview_source(project, &release, Some(&root.join("assets")));
        push_planned_copy_file(
            &mut files,
            format!("app/src-tauri/{icon_path}"),
            "icon",
            icon_source,
            "Release icon copied from selected project asset".to_string(),
        );
    }
    push_planned_text_file(
        &mut files,
        "README.md".to_string(),
        "docs",
        generated_project_readme(project_name),
        "Managed project README".to_string(),
    );

    Ok(files)
}

fn asset_copy_source(asset: &Value, root: &Path, file_name: &str) -> Option<PathBuf> {
    let original_source = asset
        .get("sourcePath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from);
    let fallback_source = root.join("assets").join(file_name);
    original_source
        .filter(|path| path.exists() && path.is_file())
        .or_else(|| {
            if fallback_source.exists() && fallback_source.is_file() {
                Some(fallback_source)
            } else {
                None
            }
        })
}

fn asset_copy_summary_from_source(source: Option<&Path>) -> String {
    source
        .map(|path| format!("Copy asset from {}", path.display()))
        .unwrap_or_else(|| "Asset source will be resolved when the project is saved".to_string())
}

fn push_starter_text_file_if_missing(
    files: &mut Vec<PlannedGeneratedFile>,
    root: &Path,
    relative_path: String,
    kind: &str,
    content: String,
    summary: String,
) {
    let normalized_path = normalize_preview_relative_path(&relative_path);
    if root.join(&normalized_path).exists() {
        return;
    }
    push_planned_text_file(files, normalized_path, kind, content, summary);
}

fn backend_entry_starter_dir(entry_path: &str) -> Option<String> {
    let normalized = normalize_preview_relative_path(entry_path)
        .trim_matches('/')
        .to_string();
    if normalized.is_empty()
        || normalized.contains("..")
        || Path::new(&normalized).is_absolute()
        || !normalized.starts_with("backend/")
    {
        return None;
    }

    let mut parts = normalized
        .split('/')
        .filter(|part| !part.trim().is_empty())
        .collect::<Vec<_>>();
    if parts.len() < 2 {
        return None;
    }
    if parts.last().map(|part| part.contains('.')).unwrap_or(false) {
        parts.pop();
    }
    if parts.len() < 2 {
        return None;
    }
    Some(parts.join("/"))
}

fn backend_starter_dir(integration: &GeneratedBackendIntegration) -> String {
    backend_entry_starter_dir(&integration.entry_path)
        .unwrap_or_else(|| format!("backend/{}", safe_file_name(&integration.function_name)))
}

fn push_backend_integration_starter_files(
    files: &mut Vec<PlannedGeneratedFile>,
    root: &Path,
    integrations: &[GeneratedBackendIntegration],
) {
    for integration in integrations {
        match integration.kind.as_str() {
            "cpp-ffi" => push_cpp_ffi_starter_files(files, root, integration),
            "sidecar" | "local-service" => push_sidecar_starter_files(files, root, integration),
            _ => {}
        }
    }
}

fn push_cpp_ffi_starter_files(
    files: &mut Vec<PlannedGeneratedFile>,
    root: &Path,
    integration: &GeneratedBackendIntegration,
) {
    let dir = backend_starter_dir(integration);
    let target_name = format!("nova_{}", integration.function_name);
    let readme = generated_cpp_ffi_starter_readme(integration, &dir, &target_name);
    push_starter_text_file_if_missing(
        files,
        root,
        format!("{dir}/README.md"),
        "backend-starter",
        readme,
        format!("Create C++ FFI starter notes for {}", integration.name),
    );
    push_starter_text_file_if_missing(
        files,
        root,
        format!("{dir}/include/nova_backend.h"),
        "backend-starter",
        generated_cpp_ffi_header().to_string(),
        format!("Create C++ FFI header for {}", integration.name),
    );
    push_starter_text_file_if_missing(
        files,
        root,
        format!("{dir}/src/nova_backend.cpp"),
        "backend-starter",
        generated_cpp_ffi_source().to_string(),
        format!("Create C++ FFI source for {}", integration.name),
    );
    push_starter_text_file_if_missing(
        files,
        root,
        format!("{dir}/CMakeLists.txt"),
        "backend-starter",
        generated_cpp_ffi_cmake(&target_name),
        format!("Create CMake build file for {}", integration.name),
    );
    push_starter_text_file_if_missing(
        files,
        root,
        format!("{dir}/scripts/build.ps1"),
        "backend-starter",
        generated_cpp_ffi_build_script().to_string(),
        format!("Create C++ FFI build script for {}", integration.name),
    );
}

fn push_sidecar_starter_files(
    files: &mut Vec<PlannedGeneratedFile>,
    root: &Path,
    integration: &GeneratedBackendIntegration,
) {
    let dir = backend_starter_dir(integration);
    let readme = generated_sidecar_starter_readme(integration, &dir);
    push_starter_text_file_if_missing(
        files,
        root,
        format!("{dir}/README.md"),
        "backend-starter",
        readme,
        format!("Create sidecar starter notes for {}", integration.name),
    );

    match integration.language.as_str() {
        "go" => {
            push_starter_text_file_if_missing(
                files,
                root,
                format!("{dir}/go.mod"),
                "backend-starter",
                generated_go_sidecar_mod(integration),
                format!("Create Go sidecar module for {}", integration.name),
            );
            push_starter_text_file_if_missing(
                files,
                root,
                format!("{dir}/main.go"),
                "backend-starter",
                generated_go_sidecar_main().to_string(),
                format!("Create Go sidecar stdio service for {}", integration.name),
            );
            push_starter_text_file_if_missing(
                files,
                root,
                format!("{dir}/scripts/build.ps1"),
                "backend-starter",
                generated_go_sidecar_build_script().to_string(),
                format!("Create Go sidecar build script for {}", integration.name),
            );
        }
        "python" => {
            push_starter_text_file_if_missing(
                files,
                root,
                format!("{dir}/service.py"),
                "backend-starter",
                generated_python_sidecar_service().to_string(),
                format!(
                    "Create Python sidecar stdio service for {}",
                    integration.name
                ),
            );
            push_starter_text_file_if_missing(
                files,
                root,
                format!("{dir}/scripts/run.ps1"),
                "backend-starter",
                generated_python_sidecar_run_script().to_string(),
                format!("Create Python sidecar run script for {}", integration.name),
            );
        }
        "node" => {
            push_starter_text_file_if_missing(
                files,
                root,
                format!("{dir}/package.json"),
                "backend-starter",
                generated_node_sidecar_package(integration),
                format!("Create Node sidecar package for {}", integration.name),
            );
            push_starter_text_file_if_missing(
                files,
                root,
                format!("{dir}/src/index.mjs"),
                "backend-starter",
                generated_node_sidecar_index().to_string(),
                format!("Create Node sidecar stdio service for {}", integration.name),
            );
        }
        _ => {
            push_starter_text_file_if_missing(
                files,
                root,
                format!("{dir}/stdio-contract.json"),
                "backend-starter",
                generated_sidecar_contract_json(),
                format!("Create backend stdio contract for {}", integration.name),
            );
        }
    }
}

fn generated_cpp_ffi_starter_readme(
    integration: &GeneratedBackendIntegration,
    dir: &str,
    target_name: &str,
) -> String {
    format!(
        r#"# {name} C++ FFI Starter

Nova keeps Rust/Tauri as the primary desktop backend. This folder is a starter boundary for a bounded C++ subsystem that the generated Rust app loads through a small `extern "C"` ABI.

- Integration id: `{id}`
- Generated Rust plan helper: `backend_integrations::{function_name}_plan()`
- Transport: `{transport}`
- Starter folder: `{dir}`
- Suggested Windows artifact path: `{dir}/build/bin/Release/{target_name}.dll`
- Suggested resource target: `{resource_path}`

Build the starter:

```powershell
./scripts/build.ps1
```

Then update the Nova backend integration fields if needed:

- `entryPath`: `{dir}`
- `artifactPath`: the built `.dll`, `.dylib`, or `.so` that exports `nova_backend_process`.
- `resourcePath`: where Tauri should bundle the artifact, usually under `resources/backend/...`.

The generated app loads this library with Rust `libloading` and calls `nova_backend_process(const char*)`. Return a JSON envelope with `success`, `message`, and optional `patch` fields so UI event bindings can update state.
"#,
        name = integration.name,
        id = integration.id,
        function_name = integration.function_name,
        transport = integration.transport,
        dir = dir,
        target_name = target_name,
        resource_path = integration.resource_path
    )
}

fn generated_cpp_ffi_header() -> &'static str {
    r#"#pragma once

#ifdef _WIN32
  #ifdef NOVA_BACKEND_EXPORTS
    #define NOVA_BACKEND_API __declspec(dllexport)
  #else
    #define NOVA_BACKEND_API __declspec(dllimport)
  #endif
#else
  #define NOVA_BACKEND_API
#endif

extern "C" {
NOVA_BACKEND_API const char* nova_backend_process(const char* request_json);
}
"#
}

fn generated_cpp_ffi_source() -> &'static str {
    r#"#include "nova_backend.h"

#include <string>

static thread_local std::string nova_last_response;

extern "C" const char* nova_backend_process(const char* request_json) {
    const bool has_payload = request_json != nullptr && request_json[0] != '\0';
    nova_last_response = has_payload
        ? R"({"success":true,"message":"C++ backend received a request.","patch":{}})"
        : R"({"success":true,"message":"C++ backend is ready.","patch":{}})";
    return nova_last_response.c_str();
}
"#
}

fn generated_cpp_ffi_cmake(target_name: &str) -> String {
    format!(
        r#"cmake_minimum_required(VERSION 3.20)

project({target_name}_project LANGUAGES CXX)

add_library(nova_backend SHARED src/nova_backend.cpp)
target_compile_features(nova_backend PUBLIC cxx_std_17)
target_include_directories(nova_backend PUBLIC include)
target_compile_definitions(nova_backend PRIVATE NOVA_BACKEND_EXPORTS)
set_target_properties(nova_backend PROPERTIES
  OUTPUT_NAME "{target_name}"
  RUNTIME_OUTPUT_DIRECTORY "${{CMAKE_BINARY_DIR}}/bin"
  LIBRARY_OUTPUT_DIRECTORY "${{CMAKE_BINARY_DIR}}/bin"
  ARCHIVE_OUTPUT_DIRECTORY "${{CMAKE_BINARY_DIR}}/lib"
)
"#
    )
}

fn generated_cpp_ffi_build_script() -> &'static str {
    r#"$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
cmake -S $root -B "$root/build"
cmake --build "$root/build" --config Release
"#
}

fn generated_sidecar_starter_readme(
    integration: &GeneratedBackendIntegration,
    dir: &str,
) -> String {
    format!(
        r#"# {name} Sidecar Starter

Nova keeps Rust/Tauri as the primary desktop backend and launches bounded sidecars only when a subsystem needs a separate runtime or language.

- Integration id: `{id}`
- Generated Rust plan helper: `backend_integrations::{function_name}_plan()`
- Language: `{language}`
- Transport: `{transport}`
- Starter folder: `{dir}`
- Configured command: `{command}`
- Configured artifact path: `{artifact_path}`
- Configured resource target: `{resource_path}`
- Health check command: `{health_check_command}`

The starter implements the Nova JSON-over-stdio contract:

1. Read one JSON payload from stdin.
2. Write one JSON response to stdout.
3. Prefer `{{
   "success": true,
   "message": "...",
   "patch": {{}}
}}`.

If this integration uses HTTP instead of stdio, keep the same request/response envelope and point the Command/call point field at a local `http://host:port/path` endpoint.

Starter files are generated only when missing, so your backend code will not be overwritten after you begin editing it.
"#,
        name = integration.name,
        id = integration.id,
        function_name = integration.function_name,
        language = integration.language,
        transport = integration.transport,
        dir = dir,
        command = integration.command,
        artifact_path = integration.artifact_path,
        resource_path = integration.resource_path,
        health_check_command = integration.health_check_command
    )
}

fn generated_go_sidecar_mod(integration: &GeneratedBackendIntegration) -> String {
    format!(
        "module nova_backend_{}\n\ngo 1.22\n",
        safe_file_name(&integration.function_name).replace('-', "_")
    )
}

fn generated_go_sidecar_main() -> &'static str {
    r#"package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
)

func writeJSON(value any) {
	payload, err := json.Marshal(value)
	if err != nil {
		fmt.Println(`{"success":false,"message":"failed to encode response","patch":{}}`)
		return
	}
	fmt.Println(string(payload))
}

func main() {
	if len(os.Args) > 1 && os.Args[1] == "--health" {
		writeJSON(map[string]any{"success": true, "message": "Go sidecar is healthy.", "patch": map[string]any{}})
		return
	}

	input, err := io.ReadAll(os.Stdin)
	if err != nil {
		writeJSON(map[string]any{"success": false, "message": err.Error(), "patch": map[string]any{}})
		return
	}

	var request any = map[string]any{}
	if strings.TrimSpace(string(input)) != "" {
		if err := json.Unmarshal(input, &request); err != nil {
			writeJSON(map[string]any{"success": false, "message": err.Error(), "patch": map[string]any{}})
			return
		}
	}

	writeJSON(map[string]any{
		"success": true,
		"message": "Go sidecar processed the Nova request.",
		"patch":   map[string]any{},
		"request": request,
	})
}
"#
}

fn generated_go_sidecar_build_script() -> &'static str {
    r#"$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$target = Join-Path $root "target"
New-Item -ItemType Directory -Force -Path $target | Out-Null
go build -o (Join-Path $target "backend-service.exe") $root
"#
}

fn generated_python_sidecar_service() -> &'static str {
    r#"import json
import sys


def write_json(value):
    print(json.dumps(value, separators=(",", ":")))


if "--health" in sys.argv:
    write_json({"success": True, "message": "Python sidecar is healthy.", "patch": {}})
    raise SystemExit(0)

raw = sys.stdin.read().strip()
try:
    request = json.loads(raw) if raw else {}
    write_json({
        "success": True,
        "message": "Python sidecar processed the Nova request.",
        "patch": {},
        "request": request,
    })
except Exception as error:
    write_json({"success": False, "message": str(error), "patch": {}})
    raise SystemExit(1)
"#
}

fn generated_python_sidecar_run_script() -> &'static str {
    r#"$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
python (Join-Path $root "service.py")
"#
}

fn generated_node_sidecar_package(integration: &GeneratedBackendIntegration) -> String {
    let package_name = format!(
        "nova-{}",
        safe_file_name(&integration.function_name)
            .replace('_', "-")
            .to_lowercase()
    );
    format!(
        r#"{{
  "name": {},
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {{
    "start": "node src/index.mjs",
    "health": "node src/index.mjs --health"
  }}
}}
"#,
        json_string(&package_name)
    )
}

fn generated_node_sidecar_index() -> &'static str {
    r#"if (process.argv.includes("--health")) {
  console.log(JSON.stringify({ success: true, message: "Node sidecar is healthy.", patch: {} }));
  process.exit(0);
}

const chunks = [];
for await (const chunk of process.stdin) {
  chunks.push(chunk);
}

try {
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  const request = raw ? JSON.parse(raw) : {};
  console.log(JSON.stringify({
    success: true,
    message: "Node sidecar processed the Nova request.",
    patch: {},
    request
  }));
} catch (error) {
  console.log(JSON.stringify({
    success: false,
    message: error instanceof Error ? error.message : String(error),
    patch: {}
  }));
  process.exit(1);
}
"#
}

fn generated_sidecar_contract_json() -> String {
    serde_json::to_string_pretty(&serde_json::json!({
        "schema": "nova.backend.stdioContract.v1",
        "request": {
            "stdin": "One JSON object per invocation",
            "example": {
                "methodId": "backend-method-1",
                "method": "process_event",
                "operation": "process_event",
                "path": "/process",
                "payload": {
                    "event": "click",
                    "itemId": "preview-button",
                    "value": "Run backend method"
                }
            }
        },
        "response": {
            "stdout": "One JSON object or text response",
            "preferredEnvelope": {
                "success": true,
                "message": "Processed request",
                "patch": {}
            }
        }
    }))
    .unwrap_or_else(|_| "{}".to_string())
}

pub(super) fn backend_artifact_source(
    integration: &GeneratedBackendIntegration,
    root: &Path,
) -> Option<PathBuf> {
    if integration.artifact_path.trim().is_empty() {
        return None;
    }
    let configured = PathBuf::from(&integration.artifact_path);
    if configured.exists() {
        return Some(configured);
    }
    if configured.is_absolute() {
        return None;
    }
    let project_relative = root.join(&configured);
    if project_relative.exists() {
        return Some(project_relative);
    }
    let backend_relative = root.join("backend").join(&configured);
    if backend_relative.exists() {
        Some(backend_relative)
    } else {
        None
    }
}

fn backend_resource_copy_summary(
    integration: &GeneratedBackendIntegration,
    source: Option<&Path>,
) -> String {
    source
        .map(|path| {
            format!(
                "Copy backend artifact '{}' from {}",
                integration.name,
                path.display()
            )
        })
        .unwrap_or_else(|| {
            format!(
                "Backend artifact '{}' will be copied when artifactPath exists",
                integration.name
            )
        })
}

pub(super) fn backend_bundle_resource_paths(
    integrations: &[GeneratedBackendIntegration],
    root: &Path,
) -> Vec<String> {
    integrations
        .iter()
        .filter(|integration| {
            integration.bundle_resource
                && !integration.resource_path.trim().is_empty()
                && backend_artifact_source(integration, root).is_some()
        })
        .map(|integration| integration.resource_path.clone())
        .collect()
}

fn copy_path_to_target(source: &Path, target: &Path) -> Result<(), String> {
    if source.is_file() {
        copy_file_if_changed(source, target)?;
        return Ok(());
    }

    if source.is_dir() {
        fs::create_dir_all(target).map_err(to_error)?;
        for entry in fs::read_dir(source).map_err(to_error)? {
            let entry = entry.map_err(to_error)?;
            let source_path = entry.path();
            let target_path = target.join(entry.file_name());
            copy_path_to_target(&source_path, &target_path)?;
        }
        return Ok(());
    }

    Err(format!("Copy source does not exist: {}", source.display()))
}

pub(super) fn copy_backend_integration_resources(
    integrations: &[GeneratedBackendIntegration],
    root: &Path,
    tauri_dir: &Path,
) -> Result<(), String> {
    for integration in integrations {
        if !integration.bundle_resource || integration.resource_path.trim().is_empty() {
            continue;
        }
        let Some(source) = backend_artifact_source(integration, root) else {
            continue;
        };
        let target = tauri_dir.join(&integration.resource_path);
        copy_path_to_target(&source, &target)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn temp_root(label: &str) -> PathBuf {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock should be after epoch")
            .as_nanos();
        let root = std::env::temp_dir().join(format!(
            "nova-ui-kit-{label}-{}-{nonce}",
            std::process::id()
        ));
        fs::create_dir_all(&root).expect("temp root should be created");
        root
    }

    fn sidecar_project() -> Value {
        json!({
            "name": "Starter Test",
            "files": [],
            "rustCommands": [],
            "cargoDependencies": [],
            "backendIntegrations": [
                {
                    "id": "go-sidecar",
                    "name": "Go Worker",
                    "kind": "sidecar",
                    "language": "go",
                    "transport": "stdio",
                    "entryPath": "backend/go-worker",
                    "artifactPath": "backend/go-worker/target/backend-service.exe",
                    "resourcePath": "resources/backend/go-worker/backend-service.exe",
                    "command": "{resource} --stdio",
                    "healthCheckCommand": "{resource} --health",
                    "startupTimeoutMs": 1500,
                    "captureOutput": true,
                    "bundleResource": true,
                    "methods": []
                }
            ]
        })
    }

    #[test]
    fn sidecar_starter_files_are_planned_only_when_missing() {
        let root = temp_root("sidecar-starter");
        let project = sidecar_project();
        let rust_logic = r#"#[tauri::command]
fn app_message() -> String {
    "ok".to_string()
}
"#;

        let files = planned_generated_files(&root, &project, rust_logic, "Starter Test")
            .expect("generated files should be planned");
        let paths = files
            .iter()
            .map(|file| file.relative_path.as_str())
            .collect::<BTreeSet<_>>();

        assert!(paths.contains("backend/go-worker/README.md"));
        assert!(paths.contains("backend/go-worker/go.mod"));
        assert!(paths.contains("backend/go-worker/main.go"));
        assert!(paths.contains("backend/go-worker/scripts/build.ps1"));

        let existing_main = root.join("backend/go-worker/main.go");
        fs::create_dir_all(existing_main.parent().expect("starter parent"))
            .expect("starter parent should be created");
        fs::write(&existing_main, "// user code\n")
            .expect("existing starter file should be written");

        let files = planned_generated_files(&root, &project, rust_logic, "Starter Test")
            .expect("generated files should still be planned");
        let paths = files
            .iter()
            .map(|file| file.relative_path.as_str())
            .collect::<BTreeSet<_>>();

        assert!(!paths.contains("backend/go-worker/main.go"));
        assert!(paths.contains("backend/go-worker/go.mod"));

        fs::remove_dir_all(root).ok();
    }
}
