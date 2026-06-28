use crate::{
    backend_artifact_source, backend_integrations, normalized_checkpoint_created_at,
    path_modified_at, path_size_bytes, project_name, project_root_from_project,
    project_with_root_path, GeneratedBackendIntegration,
};
use serde::Serialize;
use serde_json::Value;
use std::{
    fs,
    path::{Path, PathBuf},
};

#[derive(Serialize)]
pub(super) struct BackendArtifactInspectionResult {
    root_path: String,
    checked_at: String,
    summary: String,
    ready_count: usize,
    missing_count: usize,
    entries: Vec<BackendArtifactInspectionEntry>,
}

#[derive(Serialize)]
pub(super) struct BackendArtifactInspectionEntry {
    integration_id: String,
    integration_name: String,
    kind: String,
    language: String,
    transport: String,
    bundle_resource: bool,
    artifact_path: String,
    resource_path: String,
    resolved_path: Option<String>,
    exists: bool,
    is_file: bool,
    is_dir: bool,
    size_bytes: u64,
    modified_at: Option<String>,
    status: String,
    summary: String,
}

#[tauri::command]
pub(super) fn inspect_backend_artifacts(
    project: Value,
) -> Result<BackendArtifactInspectionResult, String> {
    let name = project_name(&project);
    let root = project_root_from_project(&project, &name)?;
    let project = project_with_root_path(project, &root);
    let entries = backend_integrations(&project)
        .iter()
        .map(|integration| inspect_backend_artifact_entry(integration, &root))
        .collect::<Vec<_>>();
    let ready_count = entries
        .iter()
        .filter(|entry| entry.status == "ready")
        .count();
    let missing_count = entries
        .iter()
        .filter(|entry| matches!(entry.status.as_str(), "missing" | "not-configured"))
        .count();
    let summary = if entries.is_empty() {
        "No enabled backend integrations require artifact inspection.".to_string()
    } else if missing_count == 0 {
        format!("{ready_count} backend artifact(s) ready; no missing bundled artifacts.")
    } else {
        format!(
            "{ready_count} backend artifact(s) ready; {missing_count} missing or not configured."
        )
    };

    Ok(BackendArtifactInspectionResult {
        root_path: root.display().to_string(),
        checked_at: normalized_checkpoint_created_at(""),
        summary,
        ready_count,
        missing_count,
        entries,
    })
}

fn inspect_backend_artifact_entry(
    integration: &GeneratedBackendIntegration,
    root: &Path,
) -> BackendArtifactInspectionEntry {
    let source = backend_artifact_source(integration, root);
    let expected_path = source
        .clone()
        .or_else(|| expected_backend_artifact_path(integration, root));
    let metadata = source.as_ref().and_then(|path| fs::metadata(path).ok());
    let exists = metadata.is_some();
    let is_file = metadata
        .as_ref()
        .map(|value| value.is_file())
        .unwrap_or(false);
    let is_dir = metadata
        .as_ref()
        .map(|value| value.is_dir())
        .unwrap_or(false);
    let size_bytes = source
        .as_ref()
        .map(|path| path_size_bytes(path))
        .unwrap_or_default();
    let modified_at = source.as_ref().and_then(|path| path_modified_at(path));
    let artifact_configured = !integration.artifact_path.trim().is_empty();
    let resource_configured = !integration.resource_path.trim().is_empty();
    let status = if !integration.bundle_resource {
        "not-required"
    } else if !artifact_configured || !resource_configured {
        "not-configured"
    } else if exists {
        "ready"
    } else {
        "missing"
    };
    let summary = match status {
        "not-required" => "Bundle artifact is disabled for this integration.".to_string(),
        "not-configured" => {
            "Bundle artifact is enabled but artifactPath or resourcePath is missing.".to_string()
        }
        "ready" if is_dir => format!("Directory artifact is ready with {size_bytes} bytes."),
        "ready" => format!("File artifact is ready with {size_bytes} bytes."),
        _ => expected_path
            .as_ref()
            .map(|path| format!("Expected artifact was not found at {}.", path.display()))
            .unwrap_or_else(|| "Expected artifact path is not configured.".to_string()),
    };

    BackendArtifactInspectionEntry {
        integration_id: integration.id.clone(),
        integration_name: integration.name.clone(),
        kind: integration.kind.clone(),
        language: integration.language.clone(),
        transport: integration.transport.clone(),
        bundle_resource: integration.bundle_resource,
        artifact_path: integration.artifact_path.clone(),
        resource_path: integration.resource_path.clone(),
        resolved_path: expected_path.map(|path| path.display().to_string()),
        exists,
        is_file,
        is_dir,
        size_bytes,
        modified_at,
        status: status.to_string(),
        summary,
    }
}

fn expected_backend_artifact_path(
    integration: &GeneratedBackendIntegration,
    root: &Path,
) -> Option<PathBuf> {
    let artifact_path = integration.artifact_path.trim();
    if artifact_path.is_empty() {
        return None;
    }
    let configured = PathBuf::from(artifact_path);
    if configured.is_absolute() {
        return Some(configured);
    }
    let project_relative = root.join(&configured);
    if project_relative.exists() {
        return Some(project_relative);
    }
    let backend_relative = root.join("backend").join(&configured);
    if backend_relative.exists() {
        return Some(backend_relative);
    }
    Some(project_relative)
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

    #[test]
    fn inspect_backend_artifacts_reports_ready_and_missing_resources() {
        let root = temp_root("backend-artifact-inspection");
        let ready_artifact = root
            .join("backend")
            .join("go-service")
            .join("target")
            .join("backend-service.exe");
        fs::create_dir_all(ready_artifact.parent().expect("artifact parent"))
            .expect("artifact parent should be created");
        fs::write(&ready_artifact, b"ready").expect("artifact should be written");

        let project = json!({
            "name": "Artifact Inspection Project",
            "rootPath": root.display().to_string(),
            "backendIntegrations": [
                {
                    "id": "go-service",
                    "name": "Go Service",
                    "kind": "sidecar",
                    "language": "go",
                    "transport": "stdio",
                    "entryPath": "backend/go-service",
                    "artifactPath": "backend/go-service/target/backend-service.exe",
                    "resourcePath": "resources/backend/go-service/backend-service.exe",
                    "bundleResource": true,
                    "enabled": true,
                    "methods": []
                },
                {
                    "id": "missing-cpp",
                    "name": "Missing Cpp",
                    "kind": "cpp-ffi",
                    "language": "cpp",
                    "transport": "ffi",
                    "entryPath": "backend/missing-cpp",
                    "artifactPath": "backend/missing-cpp/build/bin/Release/nova_missing_cpp.dll",
                    "resourcePath": "resources/backend/missing-cpp/nova_missing_cpp.dll",
                    "bundleResource": true,
                    "enabled": true,
                    "methods": []
                }
            ]
        });

        let result = inspect_backend_artifacts(project).expect("inspection should succeed");
        assert_eq!(result.ready_count, 1);
        assert_eq!(result.missing_count, 1);
        assert_eq!(result.entries.len(), 2);
        assert_eq!(result.entries[0].status, "ready");
        assert_eq!(result.entries[0].size_bytes, 5);
        assert_eq!(result.entries[1].status, "missing");
        assert!(
            result.entries[1]
                .resolved_path
                .as_deref()
                .unwrap_or_default()
                .ends_with("nova_missing_cpp.dll"),
            "missing artifact should report the expected resolved path"
        );

        fs::remove_dir_all(root).expect("temp root should be removed");
    }
}
