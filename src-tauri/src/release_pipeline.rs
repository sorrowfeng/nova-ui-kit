use crate::project_paths::project_pipelines_dir;
use crate::release_artifacts::{path_modified_at, path_size_bytes};
use crate::{
    normalized_checkpoint_created_at, project_name, project_root_from_project,
    project_with_root_path, safe_file_name, to_error,
};
use serde::Serialize;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{fs, fs::File, io::Read, path::Path};

#[derive(Serialize)]
pub(super) struct ReleasePipelineRecordWriteResult {
    root_path: String,
    path: String,
    latest_path: String,
    written_at: String,
    summary: String,
}

#[derive(Serialize)]
pub(super) struct ReleasePipelineArtifactInspectionResult {
    path: String,
    exists: bool,
    is_file: bool,
    is_dir: bool,
    size_bytes: u64,
    modified_at: Option<String>,
    sha256: Option<String>,
    summary: String,
}

#[tauri::command]
pub(super) fn write_release_pipeline_record(
    project: Value,
    pipeline: Value,
) -> Result<ReleasePipelineRecordWriteResult, String> {
    let project_name = project_name(&project);
    let root = project_root_from_project(&project, &project_name)?;
    let project = project_with_root_path(project, &root);
    write_release_pipeline_record_to_root(&root, &project_name, &project, pipeline)
}

#[tauri::command]
pub(super) fn list_release_pipeline_records(project: Value) -> Result<Vec<Value>, String> {
    let project_name = project_name(&project);
    let root = project_root_from_project(&project, &project_name)?;
    let pipelines_dir = project_pipelines_dir(&root);
    if !pipelines_dir.exists() {
        return Ok(Vec::new());
    }

    let mut records = Vec::new();
    for entry in fs::read_dir(&pipelines_dir).map_err(to_error)? {
        let entry = entry.map_err(to_error)?;
        let path = entry.path();
        if path.extension().and_then(|value| value.to_str()) != Some("json") {
            continue;
        }
        if path.file_name().and_then(|value| value.to_str()) == Some("latest-pipeline.json") {
            continue;
        }
        let Ok(content) = fs::read_to_string(&path) else {
            continue;
        };
        let Ok(payload) = serde_json::from_str::<Value>(&content) else {
            continue;
        };
        if payload.get("schema").and_then(Value::as_str) != Some("nova.releasePipeline.v1") {
            continue;
        }
        let Some(mut pipeline) = payload.get("pipeline").cloned() else {
            continue;
        };
        if let Value::Object(ref mut object) = pipeline {
            object.insert(
                "recordPath".to_string(),
                Value::String(path.display().to_string()),
            );
            object.insert(
                "latestRecordPath".to_string(),
                Value::String(
                    pipelines_dir
                        .join("latest-pipeline.json")
                        .display()
                        .to_string(),
                ),
            );
            if let Some(written_at) = payload.get("written_at").and_then(Value::as_str) {
                object.insert(
                    "recordWrittenAt".to_string(),
                    Value::String(written_at.to_string()),
                );
            }
            object.insert(
                "rootPath".to_string(),
                Value::String(root.display().to_string()),
            );
        }
        records.push(pipeline);
    }

    records.sort_by(|left, right| pipeline_sort_key(right).cmp(&pipeline_sort_key(left)));
    records.truncate(24);
    Ok(records)
}

#[tauri::command]
pub(super) fn inspect_release_pipeline_artifact(
    path: String,
) -> Result<ReleasePipelineArtifactInspectionResult, String> {
    let trimmed_path = path.trim();
    if trimmed_path.is_empty() {
        return Err("Artifact path is required.".to_string());
    }

    let artifact_path = Path::new(trimmed_path);
    let metadata = fs::metadata(artifact_path).ok();
    let exists = metadata.is_some();
    let is_file = metadata
        .as_ref()
        .map(|metadata| metadata.is_file())
        .unwrap_or(false);
    let is_dir = metadata
        .as_ref()
        .map(|metadata| metadata.is_dir())
        .unwrap_or(false);
    let size_bytes = if exists {
        path_size_bytes(artifact_path)
    } else {
        0
    };
    let modified_at = if exists {
        path_modified_at(artifact_path)
    } else {
        None
    };
    let sha256 = if is_file {
        Some(file_sha256(artifact_path)?)
    } else {
        None
    };
    let summary = if is_file {
        format!("Artifact file inspected: {size_bytes} bytes.")
    } else if is_dir {
        format!("Artifact directory inspected: {size_bytes} bytes.")
    } else {
        "Artifact path does not exist.".to_string()
    };

    Ok(ReleasePipelineArtifactInspectionResult {
        path: artifact_path.display().to_string(),
        exists,
        is_file,
        is_dir,
        size_bytes,
        modified_at,
        sha256,
        summary,
    })
}

fn file_sha256(path: &Path) -> Result<String, String> {
    let mut file = File::open(path).map_err(to_error)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0_u8; 16 * 1024];
    loop {
        let read_bytes = file.read(&mut buffer).map_err(to_error)?;
        if read_bytes == 0 {
            break;
        }
        hasher.update(&buffer[..read_bytes]);
    }
    Ok(format!("{:x}", hasher.finalize()))
}

fn write_release_pipeline_record_to_root(
    root: &Path,
    project_name: &str,
    project: &Value,
    pipeline: Value,
) -> Result<ReleasePipelineRecordWriteResult, String> {
    let pipelines_dir = project_pipelines_dir(root);
    fs::create_dir_all(&pipelines_dir).map_err(to_error)?;
    let pipeline_id = pipeline
        .get("id")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .unwrap_or("release-pipeline");
    let safe_id = safe_file_name(pipeline_id);
    let path = pipelines_dir.join(format!("{safe_id}.json"));
    let latest_path = pipelines_dir.join("latest-pipeline.json");
    let written_at = normalized_checkpoint_created_at("");
    let release = project.get("releaseConfig").cloned().unwrap_or(Value::Null);
    let payload = json!({
        "schema": "nova.releasePipeline.v1",
        "written_at": written_at,
        "record_path": path.display().to_string(),
        "latest_record_path": latest_path.display().to_string(),
        "project": {
            "id": project.get("id").and_then(Value::as_str),
            "name": project_name,
            "root_path": root.display().to_string(),
            "release": release,
        },
        "pipeline": pipeline,
    });
    let payload_json = serde_json::to_string_pretty(&payload).map_err(to_error)?;
    fs::write(&path, &payload_json).map_err(to_error)?;
    fs::write(&latest_path, payload_json).map_err(to_error)?;
    let summary = format!("Release pipeline record written to {}.", path.display());

    Ok(ReleasePipelineRecordWriteResult {
        root_path: root.display().to_string(),
        path: path.display().to_string(),
        latest_path: latest_path.display().to_string(),
        written_at,
        summary,
    })
}

fn pipeline_sort_key(value: &Value) -> String {
    value
        .get("finishedAt")
        .and_then(Value::as_str)
        .or_else(|| value.get("startedAt").and_then(Value::as_str))
        .or_else(|| value.get("createdAt").and_then(Value::as_str))
        .or_else(|| value.get("recordWrittenAt").and_then(Value::as_str))
        .unwrap_or_default()
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::{
        fs,
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
    fn writes_release_pipeline_record_and_latest_pointer() {
        let root = temp_root("release-pipeline-record");
        let project = json!({
            "id": "project-1",
            "name": "Pipeline Project",
            "rootPath": root.display().to_string(),
            "releaseConfig": {
                "appName": "Pipeline App",
                "version": "0.2.0"
            }
        });
        let pipeline = json!({
            "id": "run:../unsafe",
            "presetTitle": "Release exe",
            "status": "succeeded",
            "steps": []
        });

        let result = write_release_pipeline_record(project, pipeline)
            .expect("pipeline record should be written");
        assert!(
            result.path.contains(".nova") && result.path.contains("pipelines"),
            "pipeline record should live under .nova/pipelines"
        );
        let file_name = Path::new(&result.path)
            .file_name()
            .and_then(|value| value.to_str())
            .unwrap_or_default();
        assert!(
            !file_name.contains(':') && !file_name.contains('/') && !file_name.contains('\\'),
            "pipeline id should be sanitized for the filename"
        );
        assert!(Path::new(&result.path).exists());
        assert!(Path::new(&result.latest_path).exists());

        let payload: Value = serde_json::from_str(
            &fs::read_to_string(&result.path).expect("record should be readable"),
        )
        .expect("record should be json");
        assert_eq!(payload["schema"], "nova.releasePipeline.v1");
        assert_eq!(payload["project"]["name"], "Pipeline Project");
        assert_eq!(payload["pipeline"]["presetTitle"], "Release exe");

        fs::remove_dir_all(root).expect("temp root should be removed");
    }

    #[test]
    fn lists_pipeline_records_from_disk_without_latest_duplicate() {
        let root = temp_root("release-pipeline-list");
        let project = json!({
            "id": "project-1",
            "name": "Pipeline List Project",
            "rootPath": root.display().to_string(),
            "releaseConfig": {
                "appName": "Pipeline App",
                "version": "0.2.0"
            }
        });

        write_release_pipeline_record(
            project.clone(),
            json!({
                "id": "run-old",
                "presetTitle": "Design preflight",
                "status": "succeeded",
                "createdAt": "100",
                "steps": []
            }),
        )
        .expect("old pipeline record should be written");
        write_release_pipeline_record(
            project.clone(),
            json!({
                "id": "run-new",
                "presetTitle": "Release exe",
                "status": "failed",
                "createdAt": "200",
                "steps": []
            }),
        )
        .expect("new pipeline record should be written");

        let records = list_release_pipeline_records(project).expect("records should list");
        assert_eq!(records.len(), 2);
        assert_eq!(records[0]["id"], "run-new");
        assert_eq!(records[1]["id"], "run-old");
        assert!(
            records[0]["recordPath"]
                .as_str()
                .unwrap_or_default()
                .ends_with("run-new.json"),
            "record path should be injected from the disk file"
        );
        assert!(
            records[0]["latestRecordPath"]
                .as_str()
                .unwrap_or_default()
                .ends_with("latest-pipeline.json"),
            "latest path should be injected for UI open actions"
        );

        fs::remove_dir_all(root).expect("temp root should be removed");
    }

    #[test]
    fn inspects_release_pipeline_file_artifact_with_stable_hash() {
        let root = temp_root("release-pipeline-artifact");
        let artifact = root.join("nova-artifact.bin");
        fs::write(&artifact, b"nova artifact").expect("artifact should be written");

        let first = inspect_release_pipeline_artifact(artifact.display().to_string())
            .expect("artifact inspection should succeed");
        let second = inspect_release_pipeline_artifact(artifact.display().to_string())
            .expect("artifact inspection should be deterministic");

        assert!(first.exists);
        assert!(first.is_file);
        assert!(!first.is_dir);
        assert_eq!(first.size_bytes, 13);
        assert_eq!(first.sha256.as_ref().map(String::len), Some(64));
        assert_eq!(first.sha256, second.sha256);
        assert!(
            first.summary.contains("Artifact file inspected"),
            "summary should explain the inspected artifact kind"
        );

        fs::remove_dir_all(root).expect("temp root should be removed");
    }
}
