use crate::project_paths::project_dependency_graph_path;
use crate::{
    normalized_checkpoint_created_at, project_name, project_root_from_project,
    project_with_root_path, to_error,
};
use serde::Serialize;
use serde_json::{json, Value};
use std::fs;

const DEPENDENCY_GRAPH_SCHEMA: &str = "nova.dependencyGraph.v1";

#[derive(Serialize)]
pub(super) struct ProjectDependencyGraphWriteResult {
    root_path: String,
    path: String,
    written_at: String,
    summary: String,
}

#[derive(Serialize)]
pub(super) struct ProjectDependencyGraphReadResult {
    root_path: String,
    path: String,
    exists: bool,
    graph: Option<Value>,
    summary: String,
}

#[tauri::command]
pub(super) fn write_project_dependency_graph(
    project: Value,
    graph: Value,
) -> Result<ProjectDependencyGraphWriteResult, String> {
    let project_name = project_name(&project);
    let root = project_root_from_project(&project, &project_name)?;
    let project = project_with_root_path(project, &root);
    let graph_path = project_dependency_graph_path(&root);
    let graph_dir = graph_path
        .parent()
        .ok_or_else(|| "Cannot resolve dependency graph directory.".to_string())?;
    fs::create_dir_all(graph_dir).map_err(to_error)?;

    let written_at = normalized_checkpoint_created_at("");
    let payload = json!({
        "schema": DEPENDENCY_GRAPH_SCHEMA,
        "written_at": written_at,
        "record_path": graph_path.display().to_string(),
        "project": {
            "id": project.get("id").and_then(Value::as_str),
            "name": project_name,
            "root_path": root.display().to_string(),
        },
        "graph": graph,
    });
    let payload_json = serde_json::to_string_pretty(&payload).map_err(to_error)?;
    fs::write(&graph_path, payload_json).map_err(to_error)?;

    Ok(ProjectDependencyGraphWriteResult {
        root_path: root.display().to_string(),
        path: graph_path.display().to_string(),
        written_at,
        summary: format!(
            "Project dependency graph written to {}.",
            graph_path.display()
        ),
    })
}

#[tauri::command]
pub(super) fn read_project_dependency_graph(
    project: Value,
) -> Result<ProjectDependencyGraphReadResult, String> {
    let project_name = project_name(&project);
    let root = project_root_from_project(&project, &project_name)?;
    let graph_path = project_dependency_graph_path(&root);
    if !graph_path.exists() {
        return Ok(ProjectDependencyGraphReadResult {
            root_path: root.display().to_string(),
            path: graph_path.display().to_string(),
            exists: false,
            graph: None,
            summary: "Project dependency graph has not been written yet.".to_string(),
        });
    }

    let content = fs::read_to_string(&graph_path).map_err(to_error)?;
    let payload = serde_json::from_str::<Value>(&content).map_err(to_error)?;
    if payload.get("schema").and_then(Value::as_str) != Some(DEPENDENCY_GRAPH_SCHEMA) {
        return Err("Unsupported project dependency graph schema.".to_string());
    }
    let mut graph = payload
        .get("graph")
        .cloned()
        .ok_or_else(|| "Project dependency graph payload is missing graph data.".to_string())?;
    if let Value::Object(ref mut object) = graph {
        object.insert(
            "recordPath".to_string(),
            Value::String(graph_path.display().to_string()),
        );
        object.insert(
            "rootPath".to_string(),
            Value::String(root.display().to_string()),
        );
        if let Some(written_at) = payload.get("written_at").and_then(Value::as_str) {
            object.insert(
                "recordWrittenAt".to_string(),
                Value::String(written_at.to_string()),
            );
        }
    }

    Ok(ProjectDependencyGraphReadResult {
        root_path: root.display().to_string(),
        path: graph_path.display().to_string(),
        exists: true,
        graph: Some(graph),
        summary: format!(
            "Project dependency graph read from {}.",
            graph_path.display()
        ),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::{
        fs,
        path::Path,
        path::PathBuf,
        time::{SystemTime, UNIX_EPOCH},
    };

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

    #[test]
    fn writes_and_reads_project_dependency_graph() {
        let root = temp_root("dependency-graph");
        let project = json!({
            "id": "project-1",
            "name": "Dependency Project",
            "rootPath": root.display().to_string()
        });
        let graph = json!({
            "id": "graph-1",
            "snapshotHash": "abc123",
            "status": "dirty",
            "scopes": [
                {"id": "ui", "status": "dirty", "changedCount": 2}
            ]
        });

        let written = write_project_dependency_graph(project.clone(), graph)
            .expect("dependency graph should write");
        assert!(Path::new(&written.path).exists());
        assert!(
            written.path.ends_with(".nova\\dependency-graph.json")
                || written.path.ends_with(".nova/dependency-graph.json"),
            "dependency graph should live under the project .nova directory"
        );

        let read = read_project_dependency_graph(project).expect("dependency graph should read");
        assert!(read.exists);
        let graph = read.graph.expect("graph should exist");
        assert_eq!(graph["id"], "graph-1");
        assert_eq!(graph["snapshotHash"], "abc123");
        assert!(graph["recordPath"]
            .as_str()
            .unwrap_or_default()
            .ends_with("dependency-graph.json"));

        fs::remove_dir_all(root).expect("temp root should be removed");
    }

    #[test]
    fn missing_project_dependency_graph_returns_empty_result() {
        let root = temp_root("dependency-graph-missing");
        let project = json!({
            "id": "project-1",
            "name": "Missing Graph Project",
            "rootPath": root.display().to_string()
        });

        let read = read_project_dependency_graph(project).expect("missing graph should not fail");
        assert!(!read.exists);
        assert!(read.graph.is_none());
        assert!(read.path.ends_with("dependency-graph.json"));

        fs::remove_dir_all(root).expect("temp root should be removed");
    }
}
