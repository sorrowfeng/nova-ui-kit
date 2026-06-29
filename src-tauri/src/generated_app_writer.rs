use crate::incremental_io::{
    copy_file_if_changed, remove_stale_generated_files_with_keep, write_text_if_changed,
};
use crate::{
    backend_bundle_resource_paths, backend_integrations, backend_integrations_need_ffi_loader,
    cargo_dependencies, copy_backend_integration_resources, generated_app_tsx,
    generated_backend_integrations_rs, generated_capabilities_default,
    generated_capture_window_script, generated_cargo_toml, generated_index_html, generated_lib_rs,
    generated_main_rs, generated_main_tsx, generated_package_json, generated_project_data,
    generated_rust_source_map_json, generated_styles, generated_tauri_conf, generated_tsconfig,
    generated_vite_config, release_config, rust_command_names, rust_module_source, rust_modules,
    safe_file_name, to_error, GeneratedReleaseConfig,
};
use serde_json::Value;
use std::{
    collections::BTreeSet,
    env, fs,
    path::{Path, PathBuf},
};

pub(super) fn generated_icon_source(icon_name: &str) -> Option<PathBuf> {
    let source = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("icons")
        .join(icon_name);
    if source.exists() && source.is_file() {
        Some(source)
    } else {
        None
    }
}

pub(super) fn release_icon_preview_source(
    project: &Value,
    release: &GeneratedReleaseConfig,
    fallback_dir: Option<&Path>,
) -> Option<PathBuf> {
    let icon_asset_id = release.icon_asset_id.as_deref()?;
    let assets = project.get("assets").and_then(Value::as_array)?;
    let (index, asset) = assets.iter().enumerate().find(|(_, asset)| {
        asset
            .get("id")
            .and_then(Value::as_str)
            .is_some_and(|id| id == icon_asset_id)
    })?;
    let file_name = asset_file_name(asset, index);
    let extension = Path::new(&file_name)
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.to_ascii_lowercase())
        .unwrap_or_default();
    if !matches!(extension.as_str(), "png" | "ico" | "icns") {
        return None;
    }
    let original_source = asset
        .get("sourcePath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from);
    let fallback_source = fallback_dir.map(|dir| dir.join(&file_name));
    original_source
        .filter(|path| path.exists() && path.is_file())
        .or_else(|| fallback_source.filter(|path| path.exists() && path.is_file()))
}

pub(super) fn release_icon_preview_paths(
    project: &Value,
    release: &GeneratedReleaseConfig,
    fallback_dir: Option<&Path>,
) -> Vec<String> {
    let mut icon_paths = default_icon_paths();
    let Some(icon_asset_id) = release.icon_asset_id.as_deref() else {
        return icon_paths;
    };
    let Some(assets) = project.get("assets").and_then(Value::as_array) else {
        return icon_paths;
    };
    let Some((index, asset)) = assets.iter().enumerate().find(|(_, asset)| {
        asset
            .get("id")
            .and_then(Value::as_str)
            .is_some_and(|id| id == icon_asset_id)
    }) else {
        return icon_paths;
    };
    let file_name = asset_file_name(asset, index);
    let extension = Path::new(&file_name)
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.to_ascii_lowercase())
        .unwrap_or_default();
    if !matches!(extension.as_str(), "png" | "ico" | "icns") {
        return icon_paths;
    }
    let original_source = asset
        .get("sourcePath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from);
    let fallback_source = fallback_dir.map(|dir| dir.join(&file_name));
    let source_exists = original_source
        .filter(|path| path.exists() && path.is_file())
        .or_else(|| fallback_source.filter(|path| path.exists() && path.is_file()))
        .is_some();
    if source_exists {
        let icon_path = format!("icons/release-icon.{extension}");
        if !icon_paths.iter().any(|path| path == &icon_path) {
            icon_paths.insert(0, icon_path);
        }
    }
    icon_paths
}

pub(super) fn write_generated_app(
    root: &Path,
    project: &Value,
    rust_logic: &str,
    project_name: &str,
) -> Result<(), String> {
    let app_dir = root.join("app");
    let src_dir = app_dir.join("src");
    let scripts_dir = app_dir.join("scripts");
    let tauri_dir = app_dir.join("src-tauri");
    let tauri_src_dir = tauri_dir.join("src");
    let tauri_capabilities_dir = tauri_dir.join("capabilities");
    let public_assets_dir = app_dir.join("public").join("assets");
    let icons_dir = tauri_dir.join("icons");
    fs::create_dir_all(&src_dir).map_err(to_error)?;
    fs::create_dir_all(&scripts_dir).map_err(to_error)?;
    fs::create_dir_all(&tauri_src_dir).map_err(to_error)?;
    fs::create_dir_all(&tauri_capabilities_dir).map_err(to_error)?;
    fs::create_dir_all(&public_assets_dir).map_err(to_error)?;
    fs::create_dir_all(&icons_dir).map_err(to_error)?;

    let release = release_config(project, project_name);
    let slug = release.slug.clone();
    let command_names = rust_command_names(project);
    let project_modules = rust_modules(project);
    let project_dependencies = cargo_dependencies(project);
    let project_backend_integrations = backend_integrations(project);
    let icon_paths = copy_release_icons(project, &release, &icons_dir, Some(&root.join("assets")))?;
    let backend_resource_paths = backend_bundle_resource_paths(&project_backend_integrations, root);
    write_text_if_changed(
        &app_dir.join("package.json"),
        &generated_package_json(&release),
    )?;
    write_text_if_changed(
        &app_dir.join("index.html"),
        &generated_index_html(&release.app_name),
    )?;
    write_text_if_changed(&app_dir.join("vite.config.ts"), generated_vite_config())?;
    write_text_if_changed(&app_dir.join("tsconfig.json"), generated_tsconfig())?;
    write_text_if_changed(&src_dir.join("main.tsx"), generated_main_tsx())?;
    write_text_if_changed(&src_dir.join("App.tsx"), generated_app_tsx())?;
    write_text_if_changed(&src_dir.join("styles.css"), generated_styles())?;
    write_text_if_changed(
        &scripts_dir.join("capture-window.mjs"),
        generated_capture_window_script(),
    )?;
    write_text_if_changed(
        &src_dir.join("project-data.ts"),
        &generated_project_data(project, &command_names)?,
    )?;

    write_text_if_changed(
        &tauri_dir.join("Cargo.toml"),
        &generated_cargo_toml(
            &release,
            &project_dependencies,
            backend_integrations_need_ffi_loader(&project_backend_integrations),
        ),
    )?;
    write_text_if_changed(
        &tauri_dir.join("build.rs"),
        "fn main() { tauri_build::build() }\n",
    )?;
    write_text_if_changed(
        &tauri_dir.join("tauri.conf.json"),
        &generated_tauri_conf(&release, &icon_paths, &backend_resource_paths),
    )?;
    write_text_if_changed(
        &tauri_capabilities_dir.join("default.json"),
        generated_capabilities_default(),
    )?;
    write_text_if_changed(&tauri_src_dir.join("main.rs"), &generated_main_rs(&slug))?;
    let expected_tauri_module_files = project_modules
        .iter()
        .map(|module| format!("{}.rs", module.name))
        .collect::<BTreeSet<_>>();
    remove_stale_generated_files_with_keep(
        &tauri_src_dir,
        &expected_tauri_module_files,
        &[
            "main.rs",
            "lib.rs",
            "backend_integrations.rs",
            "nova_source_map.json",
        ],
    )?;
    for module in &project_modules {
        write_text_if_changed(
            &tauri_src_dir.join(format!("{}.rs", module.name)),
            &rust_module_source(&module.source),
        )?;
    }
    if !project_backend_integrations.is_empty() {
        write_text_if_changed(
            &tauri_src_dir.join("backend_integrations.rs"),
            &generated_backend_integrations_rs(&project_backend_integrations),
        )?;
    } else if tauri_src_dir.join("backend_integrations.rs").exists() {
        fs::remove_file(tauri_src_dir.join("backend_integrations.rs")).map_err(to_error)?;
    }
    write_text_if_changed(
        &tauri_src_dir.join("lib.rs"),
        &generated_lib_rs(
            rust_logic,
            &command_names,
            &project_modules,
            &project_backend_integrations,
        ),
    )?;
    write_text_if_changed(
        &tauri_src_dir.join("nova_source_map.json"),
        &generated_rust_source_map_json(root, project, rust_logic)?,
    )?;
    copy_project_assets_to_dir(project, &public_assets_dir, Some(&root.join("assets")))?;
    copy_backend_integration_resources(&project_backend_integrations, root, &tauri_dir)?;
    Ok(())
}

pub(super) fn copy_project_assets_to_dir(
    project: &Value,
    target_dir: &Path,
    fallback_dir: Option<&Path>,
) -> Result<(), String> {
    let Some(assets) = project.get("assets").and_then(Value::as_array) else {
        return Ok(());
    };

    for (index, asset) in assets.iter().enumerate() {
        let file_name = asset_file_name(asset, index);
        let target = target_dir.join(&file_name);
        let original_source = asset
            .get("sourcePath")
            .and_then(Value::as_str)
            .filter(|value| !value.trim().is_empty())
            .map(PathBuf::from);
        let fallback_source = fallback_dir.map(|dir| dir.join(&file_name));

        let source = original_source
            .filter(|path| path.exists() && path.is_file())
            .or_else(|| fallback_source.filter(|path| path.exists() && path.is_file()));

        if let Some(source) = source {
            if source != target {
                copy_file_if_changed(&source, &target)?;
            }
        }
    }

    Ok(())
}

pub(super) fn asset_file_name(asset: &Value, index: usize) -> String {
    asset
        .get("publicPath")
        .and_then(Value::as_str)
        .and_then(|value| Path::new(value).file_name())
        .map(|value| safe_file_name(&value.to_string_lossy()))
        .filter(|value| !value.trim().is_empty())
        .or_else(|| {
            asset
                .get("name")
                .and_then(Value::as_str)
                .map(safe_file_name)
        })
        .unwrap_or_else(|| format!("asset-{}.png", index + 1))
}

fn copy_generated_icons(icons_dir: &Path) -> Result<(), String> {
    let source_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("icons");
    for icon_name in [
        "icon.ico",
        "icon.icns",
        "icon.png",
        "32x32.png",
        "128x128.png",
        "128x128@2x.png",
    ] {
        let source = source_dir.join(icon_name);
        if source.exists() {
            copy_file_if_changed(&source, &icons_dir.join(icon_name))?;
        }
    }
    Ok(())
}

pub(super) fn default_icon_paths() -> Vec<String> {
    [
        "icons/icon.ico",
        "icons/icon.icns",
        "icons/icon.png",
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
    ]
    .iter()
    .map(|value| value.to_string())
    .collect()
}

fn copy_release_icons(
    project: &Value,
    release: &GeneratedReleaseConfig,
    icons_dir: &Path,
    fallback_dir: Option<&Path>,
) -> Result<Vec<String>, String> {
    copy_generated_icons(icons_dir)?;
    let mut icon_paths = default_icon_paths();
    let Some(icon_asset_id) = release.icon_asset_id.as_deref() else {
        return Ok(icon_paths);
    };
    let Some(assets) = project.get("assets").and_then(Value::as_array) else {
        return Ok(icon_paths);
    };
    let Some((index, asset)) = assets.iter().enumerate().find(|(_, asset)| {
        asset
            .get("id")
            .and_then(Value::as_str)
            .is_some_and(|id| id == icon_asset_id)
    }) else {
        return Ok(icon_paths);
    };

    let file_name = asset_file_name(asset, index);
    let extension = Path::new(&file_name)
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.to_ascii_lowercase())
        .unwrap_or_default();
    if !matches!(extension.as_str(), "png" | "ico" | "icns") {
        return Ok(icon_paths);
    }

    let target_name = format!("release-icon.{extension}");
    let target = icons_dir.join(&target_name);
    let original_source = asset
        .get("sourcePath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from);
    let fallback_source = fallback_dir.map(|dir| dir.join(&file_name));
    let source = original_source
        .filter(|path| path.exists() && path.is_file())
        .or_else(|| fallback_source.filter(|path| path.exists() && path.is_file()));

    if let Some(source) = source {
        if source != target {
            copy_file_if_changed(&source, &target)?;
        }
        let icon_path = format!("icons/{target_name}");
        if !icon_paths.iter().any(|path| path == &icon_path) {
            icon_paths.insert(0, icon_path);
        }
    }

    Ok(icon_paths)
}
