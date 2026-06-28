use crate::{
    generated_project_readme, project_name, release_config, slugify, write_text_if_changed,
    EditorProjectPaths,
};
use serde_json::Value;
use std::{
    env,
    path::{Path, PathBuf},
};

pub(super) fn managed_project_root(name: &str) -> Result<PathBuf, String> {
    Ok(managed_projects_dir()?.join(slugify(name)))
}

pub(super) fn managed_projects_dir() -> Result<PathBuf, String> {
    let base = env::var_os("USERPROFILE")
        .or_else(|| env::var_os("HOME"))
        .map(PathBuf::from)
        .ok_or_else(|| "Cannot find the user home directory".to_string())?;
    let documents = if cfg!(target_os = "windows") {
        base.join("Documents")
    } else {
        base
    };
    Ok(documents.join("Nova UI Projects"))
}

pub(super) fn project_root_from_project(
    project: &Value,
    project_name: &str,
) -> Result<PathBuf, String> {
    project
        .get("rootPath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from)
        .map(Ok)
        .unwrap_or_else(|| managed_project_root(project_name))
}

pub(super) fn project_with_root_path(mut project: Value, root: &Path) -> Value {
    if let Value::Object(ref mut object) = project {
        object.insert(
            "rootPath".to_string(),
            Value::String(root.display().to_string()),
        );
    }
    project
}

pub(super) fn project_checkpoints_dir(root: &Path) -> PathBuf {
    root.join(".nova").join("checkpoints")
}

pub(super) fn project_builds_dir(root: &Path) -> PathBuf {
    root.join(".nova").join("builds")
}

pub(super) fn project_pipelines_dir(root: &Path) -> PathBuf {
    root.join(".nova").join("pipelines")
}

pub(super) fn project_dependency_graph_path(root: &Path) -> PathBuf {
    root.join(".nova").join("dependency-graph.json")
}

pub(super) fn project_paths(root: &Path, project_name: &str) -> EditorProjectPaths {
    let slug = slugify(project_name);
    project_paths_with_slug(root, &slug)
}

pub(super) fn project_paths_for_project(root: &Path, project: &Value) -> EditorProjectPaths {
    let project_name = project_name(project);
    let release = release_config(project, &project_name);
    project_paths_with_slug(root, &release.slug)
}

fn project_paths_with_slug(root: &Path, slug: &str) -> EditorProjectPaths {
    let app_dir = root.join("app");
    let exe = app_dir
        .join("src-tauri")
        .join("target")
        .join("release")
        .join(if cfg!(target_os = "windows") {
            format!("{slug}.exe")
        } else {
            slug.to_string()
        });

    EditorProjectPaths {
        root_path: root.display().to_string(),
        manifest_path: root.join("nova.project.json").display().to_string(),
        ui_dir: root.join("ui").display().to_string(),
        rust_logic_path: root.join("rust").join("logic.rs").display().to_string(),
        rust_source_map_path: root
            .join("rust")
            .join("source-map.json")
            .display()
            .to_string(),
        generated_app_dir: app_dir.display().to_string(),
        generated_app_src: app_dir.join("src").display().to_string(),
        generated_rust_source_map_path: app_dir
            .join("src-tauri")
            .join("src")
            .join("nova_source_map.json")
            .display()
            .to_string(),
        output_exe_path: exe.exists().then(|| exe.display().to_string()),
    }
}

pub(super) fn write_readme(root: &Path, project_name: &str) -> Result<(), String> {
    write_text_if_changed(
        &root.join("README.md"),
        &generated_project_readme(project_name),
    )?;
    Ok(())
}
