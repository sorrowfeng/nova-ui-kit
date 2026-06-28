use crate::{
    backend_artifact_source, backend_integrations, normalized_checkpoint_created_at,
    path_modified_at, path_size_bytes, project_name, project_root_from_project,
    project_with_root_path, safe_file_name, to_error, GeneratedBackendIntegration,
};
use serde::Serialize;
use serde_json::Value;
use std::{
    path::{Component, Path, PathBuf},
    process::Command,
};

#[derive(Serialize)]
pub(super) struct BackendArtifactBuildResult {
    success: bool,
    status: String,
    integration_id: String,
    integration_name: String,
    kind: String,
    language: String,
    command: String,
    cwd: String,
    script_path: Option<String>,
    artifact_path: String,
    resolved_artifact_path: Option<String>,
    artifact_exists: bool,
    artifact_size_bytes: u64,
    artifact_modified_at: Option<String>,
    checked_at: String,
    summary: String,
    log: String,
}

struct BackendArtifactBuildPlan {
    cwd: PathBuf,
    program: String,
    args: Vec<String>,
    script_path: Option<PathBuf>,
    command: String,
}

#[tauri::command]
pub(super) fn build_backend_artifact(
    project: Value,
    integration_id: String,
) -> Result<BackendArtifactBuildResult, String> {
    let name = project_name(&project);
    let root = project_root_from_project(&project, &name)?;
    let project = project_with_root_path(project, &root);
    let integrations = backend_integrations(&project);
    let integration = integrations
        .iter()
        .find(|integration| integration.id == integration_id)
        .ok_or_else(|| {
            format!(
                "Backend integration '{}' was not found or is disabled.",
                integration_id
            )
        })?;
    let plan = backend_artifact_build_plan(integration, &root)?;
    let mut log = format!(
        "Backend artifact build for {} ({}, {}).\n",
        integration.name, integration.kind, integration.language
    );
    log.push_str("$ ");
    log.push_str(&plan.command);
    log.push('\n');

    let mut command = Command::new(&plan.program);
    command.args(&plan.args).current_dir(&plan.cwd);
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }
    let output = command.output().map_err(to_error)?;
    log.push_str(&String::from_utf8_lossy(&output.stdout));
    log.push_str(&String::from_utf8_lossy(&output.stderr));

    let source = backend_artifact_source(integration, &root);
    let expected = source
        .clone()
        .or_else(|| expected_backend_artifact_path(integration, &root));
    let artifact_exists = source.is_some();
    let artifact_size_bytes = source
        .as_ref()
        .map(|path| path_size_bytes(path))
        .unwrap_or_default();
    let artifact_modified_at = source.as_ref().and_then(|path| path_modified_at(path));
    let command_succeeded = output.status.success();
    let success = command_succeeded && artifact_exists;
    let status = if success {
        "built"
    } else if command_succeeded {
        "missing-artifact"
    } else {
        "failed"
    };
    let summary = if success {
        format!(
            "{} artifact built successfully ({} bytes).",
            integration.name, artifact_size_bytes
        )
    } else if command_succeeded {
        expected
            .as_ref()
            .map(|path| {
                format!(
                    "{} build command succeeded, but artifact was not found at {}.",
                    integration.name,
                    path.display()
                )
            })
            .unwrap_or_else(|| {
                format!(
                    "{} build command succeeded, but artifactPath is not configured.",
                    integration.name
                )
            })
    } else {
        format!(
            "{} artifact build failed. Review the build log.",
            integration.name
        )
    };

    Ok(BackendArtifactBuildResult {
        success,
        status: status.to_string(),
        integration_id: integration.id.clone(),
        integration_name: integration.name.clone(),
        kind: integration.kind.clone(),
        language: integration.language.clone(),
        command: plan.command,
        cwd: plan.cwd.display().to_string(),
        script_path: plan.script_path.map(|path| path.display().to_string()),
        artifact_path: integration.artifact_path.clone(),
        resolved_artifact_path: expected.map(|path| path.display().to_string()),
        artifact_exists,
        artifact_size_bytes,
        artifact_modified_at,
        checked_at: normalized_checkpoint_created_at(""),
        summary,
        log,
    })
}

fn backend_artifact_build_plan(
    integration: &GeneratedBackendIntegration,
    root: &Path,
) -> Result<BackendArtifactBuildPlan, String> {
    if integration.kind == "rust-native" {
        return Err("Rust-native integrations compile with the Tauri app and do not have a separate artifact build script.".to_string());
    }
    if integration.language == "python" || integration.language == "node" {
        return Err(format!(
            "{} integrations are bundled as script/resource folders. Use Artifact status to verify the directory instead of running a build script.",
            integration.language
        ));
    }
    if integration.kind != "cpp-ffi" && integration.language != "go" {
        return Err(format!(
            "{} / {} does not have a known Nova starter build script yet.",
            integration.kind, integration.language
        ));
    }

    let starter_dir = backend_starter_dir(integration, root)?;
    let script_path = starter_dir.join("scripts").join("build.ps1");
    if !script_path.exists() || !script_path.is_file() {
        return Err(format!(
            "Build script is missing: {}. Apply generated backend starter files first.",
            script_path.display()
        ));
    }

    let program = if cfg!(target_os = "windows") {
        "powershell".to_string()
    } else {
        "pwsh".to_string()
    };
    let args = vec![
        "-NoProfile".to_string(),
        "-ExecutionPolicy".to_string(),
        "Bypass".to_string(),
        "-File".to_string(),
        script_path.display().to_string(),
    ];
    let command = format!("{} {}", program, args.join(" "));

    Ok(BackendArtifactBuildPlan {
        cwd: starter_dir,
        program,
        args,
        script_path: Some(script_path),
        command,
    })
}

fn backend_starter_dir(
    integration: &GeneratedBackendIntegration,
    root: &Path,
) -> Result<PathBuf, String> {
    let relative = normalized_backend_entry_dir(&integration.entry_path).unwrap_or_else(|| {
        PathBuf::from("backend").join(safe_file_name(&integration.function_name))
    });
    let candidate = root.join(relative);
    if !path_stays_inside_root(root, &candidate) {
        return Err(format!(
            "Backend starter directory must stay inside the project root: {}",
            candidate.display()
        ));
    }
    Ok(candidate)
}

fn normalized_backend_entry_dir(entry_path: &str) -> Option<PathBuf> {
    let normalized = entry_path
        .replace('\\', "/")
        .trim()
        .trim_matches('/')
        .to_string();
    if normalized.is_empty() || normalized.contains(':') {
        return None;
    }
    let mut parts = normalized
        .split('/')
        .map(str::trim)
        .filter(|part| !part.is_empty() && *part != ".")
        .collect::<Vec<_>>();
    if parts.is_empty() || parts.iter().any(|part| *part == "..") {
        return None;
    }
    if parts.last().map(|part| part.contains('.')).unwrap_or(false) {
        parts.pop();
    }
    if parts.is_empty() {
        return None;
    }
    let mut path = PathBuf::new();
    for part in parts {
        path.push(part);
    }
    Some(path)
}

fn path_stays_inside_root(root: &Path, candidate: &Path) -> bool {
    if candidate.is_absolute() && !candidate.starts_with(root) {
        return false;
    }
    candidate
        .components()
        .all(|component| !matches!(component, Component::ParentDir))
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
    use std::{
        fs,
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
    fn backend_artifact_build_plan_uses_project_local_starter_script() {
        let root = temp_root("backend-artifact-build-plan");
        let script_path = root
            .join("backend")
            .join("native")
            .join("scripts")
            .join("build.ps1");
        fs::create_dir_all(script_path.parent().expect("script parent"))
            .expect("script parent should be created");
        fs::write(&script_path, "$true").expect("script should be written");
        let integration = backend_integrations(&json!({
            "backendIntegrations": [{
                "id": "native",
                "name": "Native Core",
                "kind": "cpp-ffi",
                "language": "cpp",
                "transport": "ffi",
                "entryPath": "backend/native",
                "artifactPath": "backend/native/build/bin/Release/nova_native_core_cpp_ffi.dll",
                "resourcePath": "resources/backend/native/nova_native_core_cpp_ffi.dll",
                "bundleResource": true,
                "enabled": true,
                "methods": []
            }]
        }))
        .remove(0);

        let plan = backend_artifact_build_plan(&integration, &root).expect("plan should resolve");
        assert_eq!(plan.cwd, root.join("backend").join("native"));
        assert_eq!(plan.script_path.as_deref(), Some(script_path.as_path()));
        assert!(
            plan.command.contains("build.ps1"),
            "command should include the build script"
        );

        fs::remove_dir_all(root).expect("temp root should be removed");
    }

    #[cfg(target_os = "windows")]
    #[test]
    fn build_backend_artifact_runs_starter_script_and_reports_artifact() {
        let root = temp_root("backend-artifact-build");
        let script_path = root
            .join("backend")
            .join("go-service")
            .join("scripts")
            .join("build.ps1");
        fs::create_dir_all(script_path.parent().expect("script parent"))
            .expect("script parent should be created");
        fs::write(
            &script_path,
            r#"$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$target = Join-Path $root "target"
New-Item -ItemType Directory -Force -Path $target | Out-Null
Set-Content -LiteralPath (Join-Path $target "backend-service.exe") -Value "ready" -Encoding UTF8
"#,
        )
        .expect("script should be written");

        let result = build_backend_artifact(
            json!({
                "name": "Artifact Build Project",
                "rootPath": root.display().to_string(),
                "backendIntegrations": [{
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
                }]
            }),
            "go-service".to_string(),
        )
        .expect("build command should run");

        assert!(result.success);
        assert_eq!(result.status, "built");
        assert!(result.artifact_exists);
        assert!(result.artifact_size_bytes > 0);

        fs::remove_dir_all(root).expect("temp root should be removed");
    }
}
