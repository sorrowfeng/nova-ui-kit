use crate::incremental_io::{remove_stale_generated_files, write_text_if_changed};
use crate::{
    copy_project_assets_to_dir, generated_backend_integrations_readme, generated_project_readme,
    generated_rust_source_map_json, project_name, rust_module_source, rust_modules, rust_source,
    safe_file_name, to_error, write_generated_app,
};
use serde_json::Value;
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
    Ok(())
}
