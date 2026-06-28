use crate::{
    is_valid_env_var_name, normalized_checkpoint_created_at, project_builds_dir, to_error,
    GeneratedReleaseConfig,
};
use serde::Serialize;
use std::{
    collections::BTreeSet,
    env, fs,
    path::{Path, PathBuf},
    process::Command,
    time::UNIX_EPOCH,
};

#[derive(Serialize)]
struct BundleArtifactManifest {
    project_name: String,
    app_name: String,
    version: String,
    release_notes: String,
    bundle_targets: String,
    signing_mode: String,
    signing_configured: bool,
    signing_summary: String,
    certificate_source_configured: bool,
    certificate_password_env_var: Option<String>,
    certificate_import_requested: bool,
    smoke_minimum_artifact_size_bytes: u64,
    installer_smoke_mode: String,
    installer_smoke_runner_mode: String,
    installer_smoke_status: String,
    installer_smoke_script_path: Option<String>,
    installer_smoke_result_path: Option<String>,
    installer_smoke_vm_handoff_path: Option<String>,
    installer_smoke_vm_name: Option<String>,
    installer_smoke_vm_shared_folder: Option<String>,
    installer_smoke_vm_notes: Option<String>,
    installer_smoke_result_summary: Option<String>,
    installer_smoke_finished_at: Option<String>,
    created_at: String,
    bundle_dir: Option<String>,
    artifact_count: usize,
    smoke_status: String,
    smoke_messages: Vec<String>,
    artifacts: Vec<BundleArtifactEntry>,
}

#[derive(Serialize)]
struct BundleArtifactEntry {
    path: String,
    file_name: String,
    kind: String,
    size_bytes: u64,
    minimum_size_bytes: u64,
    modified_at: Option<String>,
    smoke_status: String,
    smoke_messages: Vec<String>,
}

pub(super) struct BundleManifestWriteResult {
    pub(super) path: String,
    pub(super) smoke_status: String,
    pub(super) artifact_count: usize,
    pub(super) installer_smoke_script_path: Option<String>,
    pub(super) installer_smoke_result_path: Option<String>,
    pub(super) installer_smoke_status: String,
    pub(super) installer_smoke_runner_mode: String,
    pub(super) installer_smoke_vm_handoff_path: Option<String>,
}

pub(super) fn generated_bundle_dir(root: &Path) -> PathBuf {
    root.join("app")
        .join("src-tauri")
        .join("target")
        .join("release")
        .join("bundle")
}

pub(super) fn bundle_artifacts(root: &Path) -> Result<(Option<String>, Vec<String>), String> {
    let bundle_dir = generated_bundle_dir(root);
    if !bundle_dir.exists() {
        return Ok((None, Vec::new()));
    }

    let mut artifacts = BTreeSet::new();
    collect_bundle_artifacts(&bundle_dir, &mut artifacts)?;
    Ok((
        Some(bundle_dir.display().to_string()),
        artifacts.into_iter().collect(),
    ))
}

pub(super) fn write_bundle_manifest(
    root: &Path,
    project_name: &str,
    release: &GeneratedReleaseConfig,
    bundle_dir: &Option<String>,
    bundle_paths: &[String],
) -> Result<BundleManifestWriteResult, String> {
    let builds_dir = project_builds_dir(root);
    fs::create_dir_all(&builds_dir).map_err(to_error)?;
    let created_at = normalized_checkpoint_created_at("");
    let manifest_path = builds_dir.join(format!("bundle-manifest-{created_at}.json"));
    let latest_manifest_path = builds_dir.join("latest-bundle-manifest.json");
    let installer_smoke_result_path = if release.installer_smoke_mode == "write-script" {
        Some(
            builds_dir
                .join(format!("installer-smoke-result-{created_at}.json"))
                .display()
                .to_string(),
        )
    } else {
        None
    };
    let installer_smoke_status = if installer_smoke_result_path.is_some() {
        "pending"
    } else {
        "not-requested"
    }
    .to_string();
    let minimum_size_bytes = release.minimum_artifact_size_kb.saturating_mul(1024);
    let artifacts = bundle_paths
        .iter()
        .map(|path| bundle_artifact_entry(Path::new(path), minimum_size_bytes))
        .collect::<Vec<_>>();
    let mut smoke_messages = Vec::new();
    if artifacts.is_empty() {
        smoke_messages.push("No bundle artifacts were found after tauri build.".to_string());
    }
    let failed_count = artifacts
        .iter()
        .filter(|artifact| artifact.smoke_status == "failed")
        .count();
    if failed_count > 0 {
        smoke_messages.push(format!(
            "{failed_count} bundle artifact smoke check(s) failed."
        ));
    }
    let smoke_status = if artifacts.is_empty() || failed_count > 0 {
        "failed"
    } else {
        "passed"
    }
    .to_string();
    let installer_smoke_script_path = write_installer_smoke_script(
        &builds_dir,
        &created_at,
        release,
        bundle_paths,
        &manifest_path,
        &latest_manifest_path,
        installer_smoke_result_path.as_deref(),
    )?;
    let installer_smoke_vm_handoff_path = write_installer_smoke_vm_handoff(
        &builds_dir,
        &created_at,
        project_name,
        release,
        bundle_paths,
        &manifest_path,
        &latest_manifest_path,
        installer_smoke_script_path.as_deref(),
        installer_smoke_result_path.as_deref(),
    )?;
    let manifest = BundleArtifactManifest {
        project_name: project_name.to_string(),
        app_name: release.app_name.clone(),
        version: release.version.clone(),
        release_notes: release.release_notes.clone(),
        bundle_targets: release.bundle_targets.clone(),
        signing_mode: release.signing_mode.clone(),
        signing_configured: release_signing_configured(release),
        signing_summary: release_signing_summary(release),
        certificate_source_configured: release.certificate_source_path.is_some(),
        certificate_password_env_var: if release.certificate_password_env_var.trim().is_empty() {
            None
        } else {
            Some(release.certificate_password_env_var.clone())
        },
        certificate_import_requested: release.import_certificate_before_build,
        smoke_minimum_artifact_size_bytes: minimum_size_bytes,
        installer_smoke_mode: release.installer_smoke_mode.clone(),
        installer_smoke_runner_mode: release.installer_smoke_runner_mode.clone(),
        installer_smoke_status: installer_smoke_status.clone(),
        installer_smoke_script_path: installer_smoke_script_path.clone(),
        installer_smoke_result_path: installer_smoke_result_path.clone(),
        installer_smoke_vm_handoff_path: installer_smoke_vm_handoff_path.clone(),
        installer_smoke_vm_name: if release.installer_smoke_runner_mode == "vm-handoff" {
            Some(release.installer_smoke_vm_name.clone())
        } else {
            None
        },
        installer_smoke_vm_shared_folder: release.installer_smoke_vm_shared_folder.clone(),
        installer_smoke_vm_notes: release.installer_smoke_vm_notes.clone(),
        installer_smoke_result_summary: None,
        installer_smoke_finished_at: None,
        created_at: created_at.clone(),
        bundle_dir: bundle_dir.clone(),
        artifact_count: artifacts.len(),
        smoke_status,
        smoke_messages,
        artifacts,
    };
    let smoke_status = manifest.smoke_status.clone();
    let artifact_count = manifest.artifact_count;
    let manifest_json = serde_json::to_string_pretty(&manifest).map_err(to_error)?;
    fs::write(&manifest_path, &manifest_json).map_err(to_error)?;
    fs::write(&latest_manifest_path, &manifest_json).map_err(to_error)?;
    Ok(BundleManifestWriteResult {
        path: manifest_path.display().to_string(),
        smoke_status,
        artifact_count,
        installer_smoke_script_path,
        installer_smoke_result_path,
        installer_smoke_status,
        installer_smoke_runner_mode: release.installer_smoke_runner_mode.clone(),
        installer_smoke_vm_handoff_path,
    })
}

fn write_installer_smoke_vm_handoff(
    builds_dir: &Path,
    created_at: &str,
    project_name: &str,
    release: &GeneratedReleaseConfig,
    bundle_paths: &[String],
    manifest_path: &Path,
    latest_manifest_path: &Path,
    script_path: Option<&str>,
    result_path: Option<&str>,
) -> Result<Option<String>, String> {
    if release.installer_smoke_runner_mode != "vm-handoff" {
        return Ok(None);
    }

    let handoff_path = builds_dir.join(format!("installer-smoke-vm-handoff-{created_at}.json"));
    let minimum_size_bytes = release.minimum_artifact_size_kb.saturating_mul(1024);
    let artifacts = bundle_paths
        .iter()
        .map(|path| {
            let path = Path::new(path);
            serde_json::json!({
                "path": path.display().to_string(),
                "file_name": path.file_name().map(|value| value.to_string_lossy().to_string()).unwrap_or_else(|| "artifact".to_string()),
                "kind": bundle_artifact_kind(path),
                "size_bytes": path_size_bytes(path),
                "minimum_size_bytes": minimum_size_bytes,
            })
        })
        .collect::<Vec<_>>();
    let vm_shared_folder = release.installer_smoke_vm_shared_folder.as_deref();
    let instructions = vec![
        "Run this handoff inside a clean VM or sandbox with a fresh user profile.",
        "Mount or copy the listed artifacts into the VM before enabling installer execution.",
        "Review the PowerShell script, set $RunInstallers = $true only in the isolated environment, then run it.",
        "Copy the generated result JSON back to the recorded result_path and refresh the build history in Nova.",
    ];
    let payload = serde_json::json!({
        "schema": "nova.installerSmokeVmHandoff.v1",
        "project_name": project_name,
        "app_name": &release.app_name,
        "version": &release.version,
        "created_at": created_at,
        "runner_mode": &release.installer_smoke_runner_mode,
        "installer_smoke_mode": &release.installer_smoke_mode,
        "vm_name": &release.installer_smoke_vm_name,
        "vm_shared_folder": vm_shared_folder,
        "vm_notes": release.installer_smoke_vm_notes.as_deref(),
        "manifest_path": manifest_path.display().to_string(),
        "latest_manifest_path": latest_manifest_path.display().to_string(),
        "smoke_script_path": script_path,
        "smoke_result_path": result_path,
        "minimum_artifact_size_bytes": minimum_size_bytes,
        "artifact_count": artifacts.len(),
        "artifacts": artifacts,
        "instructions": instructions,
    });
    let payload = serde_json::to_string_pretty(&payload).map_err(to_error)?;
    fs::write(&handoff_path, payload).map_err(to_error)?;
    Ok(Some(handoff_path.display().to_string()))
}

fn write_installer_smoke_script(
    builds_dir: &Path,
    created_at: &str,
    release: &GeneratedReleaseConfig,
    bundle_paths: &[String],
    manifest_path: &Path,
    latest_manifest_path: &Path,
    result_path: Option<&str>,
) -> Result<Option<String>, String> {
    if release.installer_smoke_mode != "write-script" {
        return Ok(None);
    }
    let Some(result_path) = result_path else {
        return Ok(None);
    };

    let script_path = builds_dir.join(format!("installer-smoke-{created_at}.ps1"));
    let mut script = format!(
        r#"# Generated by Nova UI Editor.
# Review this script before running it. Set $RunInstallers = $true in a clean VM to run install/uninstall smoke checks.
$ErrorActionPreference = 'Stop'
$RunInstallers = $false
$SmokeResultPath = {result_path}
$ManifestPaths = @(
  {manifest_path},
  {latest_manifest_path}
)

"#,
        result_path = powershell_single_quoted(result_path),
        manifest_path = powershell_single_quoted(&manifest_path.display().to_string()),
        latest_manifest_path =
            powershell_single_quoted(&latest_manifest_path.display().to_string()),
    );
    script.push_str("$Artifacts = @(\n");
    for path in bundle_paths {
        let kind = bundle_artifact_kind(Path::new(path));
        script.push_str("  @{ Path = ");
        script.push_str(&powershell_single_quoted(path));
        script.push_str("; Kind = ");
        script.push_str(&powershell_single_quoted(&kind));
        script.push_str(" }\n");
    }
    script.push_str(")\n\n");
    script.push_str(
        r#"$StartedAt = (Get-Date).ToString('o')
$Results = @()
$OverallStatus = 'passed'

foreach ($Artifact in $Artifacts) {
  $Path = $Artifact.Path
  $Kind = $Artifact.Kind
  $Record = [ordered]@{
    path = $Path
    kind = $Kind
    status = 'pending'
    artifact_status = 'pending'
    install_status = 'not-run'
    install_exit_code = $null
    uninstall_status = 'not-run'
    uninstall_exit_code = $null
    messages = @()
  }
  try {
    if (-not (Test-Path -LiteralPath $Path)) {
      throw "Missing artifact: $Path"
    }
    $Record.artifact_status = 'passed'
    $Record.messages += "Artifact exists."
    Write-Host "Artifact ready: $Kind $Path"

    if (-not $RunInstallers) {
      $Record.install_status = 'skipped'
      $Record.uninstall_status = 'skipped'
      $Record.messages += 'Installer execution skipped because $RunInstallers is false.'
    } elseif ($Kind -eq 'msi') {
      $Install = Start-Process msiexec.exe -ArgumentList @('/i', $Path, '/qn', '/norestart') -Wait -PassThru
      $Record.install_exit_code = $Install.ExitCode
      if ($Install.ExitCode -ne 0) { throw "MSI install failed with $($Install.ExitCode)" }
      $Record.install_status = 'passed'

      $Uninstall = Start-Process msiexec.exe -ArgumentList @('/x', $Path, '/qn', '/norestart') -Wait -PassThru
      $Record.uninstall_exit_code = $Uninstall.ExitCode
      if ($Uninstall.ExitCode -ne 0) { throw "MSI uninstall failed with $($Uninstall.ExitCode)" }
      $Record.uninstall_status = 'passed'
    } elseif ($Kind -eq 'nsis') {
      $Record.install_status = 'manual'
      $Record.uninstall_status = 'manual'
      $Record.messages += 'NSIS silent install commonly uses /S, but uninstall path is app-specific. Verify with a project-specific command in a clean VM.'
    } else {
      $Record.install_status = 'unsupported'
      $Record.uninstall_status = 'unsupported'
      $Record.messages += "No install smoke command configured for artifact kind: $Kind"
    }

    $Record.status = 'passed'
  } catch {
    $Record.status = 'failed'
    $Record.messages += $_.Exception.Message
    $OverallStatus = 'failed'
  }

  $Results += [pscustomobject]$Record
}

if (-not $RunInstallers -and $OverallStatus -eq 'passed') {
  $OverallStatus = 'artifact-only'
}

$PassedCount = @($Results | Where-Object { $_.status -eq 'passed' }).Count
$FailedCount = @($Results | Where-Object { $_.status -eq 'failed' }).Count
$FinishedAt = (Get-Date).ToString('o')
$Summary = "$PassedCount passed, $FailedCount failed, installers run: $RunInstallers"
$Payload = [ordered]@{
  result_path = $SmokeResultPath
  status = $OverallStatus
  summary = $Summary
  started_at = $StartedAt
  finished_at = $FinishedAt
  artifact_count = $Results.Count
  passed_count = $PassedCount
  failed_count = $FailedCount
  run_installers = $RunInstallers
  log_path = $null
  artifacts = $Results
}

$Payload | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $SmokeResultPath -Encoding UTF8

foreach ($ManifestPath in $ManifestPaths) {
  if (Test-Path -LiteralPath $ManifestPath) {
    $Manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
    $Manifest | Add-Member -NotePropertyName 'installer_smoke_status' -NotePropertyValue $Payload.status -Force
    $Manifest | Add-Member -NotePropertyName 'installer_smoke_result_path' -NotePropertyValue $Payload.result_path -Force
    $Manifest | Add-Member -NotePropertyName 'installer_smoke_result_summary' -NotePropertyValue $Payload.summary -Force
    $Manifest | Add-Member -NotePropertyName 'installer_smoke_finished_at' -NotePropertyValue $Payload.finished_at -Force
    $Manifest | Add-Member -NotePropertyName 'installer_smoke_passed_count' -NotePropertyValue $Payload.passed_count -Force
    $Manifest | Add-Member -NotePropertyName 'installer_smoke_failed_count' -NotePropertyValue $Payload.failed_count -Force
    $Manifest | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $ManifestPath -Encoding UTF8
  }
}

if ($OverallStatus -eq 'failed') {
  exit 1
}
"#,
    );
    fs::write(&script_path, script).map_err(to_error)?;
    Ok(Some(script_path.display().to_string()))
}

fn bundle_artifact_entry(path: &Path, minimum_size_bytes: u64) -> BundleArtifactEntry {
    let size_bytes = path_size_bytes(path);
    let mut smoke_messages = Vec::new();
    if !path.exists() {
        smoke_messages.push("Artifact path does not exist.".to_string());
    } else if size_bytes == 0 {
        smoke_messages.push("Artifact exists but is empty.".to_string());
    } else if size_bytes < minimum_size_bytes {
        smoke_messages.push(format!(
            "Artifact is {size_bytes} bytes, below the configured {minimum_size_bytes} byte smoke threshold."
        ));
    } else {
        smoke_messages.push(format!(
            "Artifact exists and is at least {minimum_size_bytes} bytes."
        ));
    }
    let smoke_status = if path.exists() && size_bytes > 0 && size_bytes >= minimum_size_bytes {
        "passed"
    } else {
        "failed"
    }
    .to_string();

    BundleArtifactEntry {
        path: path.display().to_string(),
        file_name: path
            .file_name()
            .map(|value| value.to_string_lossy().to_string())
            .unwrap_or_else(|| "artifact".to_string()),
        kind: bundle_artifact_kind(path),
        size_bytes,
        minimum_size_bytes,
        modified_at: path_modified_at(path),
        smoke_status,
        smoke_messages,
    }
}

pub(super) fn path_size_bytes(path: &Path) -> u64 {
    let Ok(metadata) = fs::metadata(path) else {
        return 0;
    };
    if metadata.is_file() {
        return metadata.len();
    }
    if metadata.is_dir() {
        return fs::read_dir(path)
            .ok()
            .map(|entries| {
                entries
                    .filter_map(Result::ok)
                    .map(|entry| path_size_bytes(&entry.path()))
                    .sum()
            })
            .unwrap_or(0);
    }
    0
}

pub(super) fn path_modified_at(path: &Path) -> Option<String> {
    fs::metadata(path)
        .ok()
        .and_then(|metadata| metadata.modified().ok())
        .and_then(|modified| modified.duration_since(UNIX_EPOCH).ok())
        .map(|duration| duration.as_millis().to_string())
}

pub(super) fn bundle_artifact_kind(path: &Path) -> String {
    let path_text = path.to_string_lossy().to_ascii_lowercase();
    let name = path
        .file_name()
        .map(|value| value.to_string_lossy().to_ascii_lowercase())
        .unwrap_or_default();
    if path.is_dir() && name.ends_with(".app") {
        "app".to_string()
    } else if path_text.contains("\\nsis\\") || path_text.contains("/nsis/") {
        "nsis".to_string()
    } else if name.ends_with(".msi") {
        "msi".to_string()
    } else if name.ends_with(".dmg") {
        "dmg".to_string()
    } else if name.ends_with(".deb") {
        "deb".to_string()
    } else if name.ends_with(".rpm") {
        "rpm".to_string()
    } else if name.ends_with(".appimage") {
        "appimage".to_string()
    } else if name.ends_with(".zip") || name.ends_with(".tar.gz") {
        "archive".to_string()
    } else if name.ends_with(".exe") {
        "exe".to_string()
    } else {
        "artifact".to_string()
    }
}

fn collect_bundle_artifacts(dir: &Path, artifacts: &mut BTreeSet<String>) -> Result<(), String> {
    for entry in fs::read_dir(dir).map_err(to_error)? {
        let entry = entry.map_err(to_error)?;
        let path = entry.path();
        if path.is_dir() {
            if path
                .extension()
                .and_then(|value| value.to_str())
                .is_some_and(|extension| extension.eq_ignore_ascii_case("app"))
            {
                artifacts.insert(path.display().to_string());
            } else {
                collect_bundle_artifacts(&path, artifacts)?;
            }
        } else if is_bundle_artifact_file(&path) {
            artifacts.insert(path.display().to_string());
        }
    }
    Ok(())
}

fn is_bundle_artifact_file(path: &Path) -> bool {
    let name = path
        .file_name()
        .map(|value| value.to_string_lossy().to_ascii_lowercase())
        .unwrap_or_default();
    [
        ".exe",
        ".msi",
        ".dmg",
        ".deb",
        ".rpm",
        ".appimage",
        ".zip",
        ".tar.gz",
    ]
    .iter()
    .any(|suffix| name.ends_with(suffix))
}

pub(super) fn release_signing_configured(release: &GeneratedReleaseConfig) -> bool {
    match release.signing_mode.as_str() {
        "windows-certificate" => {
            let base_ready = !release.certificate_thumbprint.trim().is_empty()
                && !release.timestamp_url.trim().is_empty();
            if !release.import_certificate_before_build {
                return base_ready;
            }
            base_ready
                && release
                    .certificate_source_path
                    .as_deref()
                    .filter(|value| !value.trim().is_empty())
                    .is_some()
                && is_valid_env_var_name(&release.certificate_password_env_var)
        }
        "custom-command" => {
            !release.sign_command.trim().is_empty() && release.sign_command.contains("%1")
        }
        _ => false,
    }
}

fn release_signing_summary(release: &GeneratedReleaseConfig) -> String {
    match release.signing_mode.as_str() {
        "windows-certificate" if release_signing_configured(release) => format!(
            "Windows certificate signing configured with {} and {}; certificate password is read from {}.",
            release.digest_algorithm, release.timestamp_url, release.certificate_password_env_var
        ),
        "windows-certificate" => {
            "Windows certificate signing is selected but missing a thumbprint, timestamp URL, certificate path, or password env var."
                .to_string()
        }
        "custom-command" if release_signing_configured(release) => {
            "Custom signCommand configured with the %1 artifact placeholder.".to_string()
        }
        "custom-command" => {
            "Custom signing is selected but the command is missing the %1 artifact placeholder."
                .to_string()
        }
        _ => "Unsigned build; suitable for local testing but not trusted distribution.".to_string(),
    }
}

pub(super) fn prepare_release_signing(
    release: &GeneratedReleaseConfig,
    log: &mut String,
) -> Result<(), String> {
    if release.signing_mode != "windows-certificate" || !release.import_certificate_before_build {
        return Ok(());
    }

    if !cfg!(target_os = "windows") {
        return Err("PFX certificate import is only supported on Windows builds.".to_string());
    }

    let certificate_path = release.certificate_source_path.as_deref().ok_or_else(|| {
        "PFX certificate import is enabled but no certificate file path is configured.".to_string()
    })?;
    let certificate_path = Path::new(certificate_path);
    if !certificate_path.exists() {
        return Err(format!(
            "Configured signing certificate does not exist: {}",
            certificate_path.display()
        ));
    }

    let password_env_var = release.certificate_password_env_var.trim();
    if !is_valid_env_var_name(password_env_var) {
        return Err("Signing certificate password env var must use letters, numbers, or underscores and cannot start with a number.".to_string());
    }
    if env::var(password_env_var)
        .map(|value| value.is_empty())
        .unwrap_or(true)
    {
        return Err(format!(
            "Signing certificate password env var {password_env_var} is not set."
        ));
    }

    let escaped_path = powershell_single_quoted(&certificate_path.display().to_string());
    let script = format!(
        "$password = ConvertTo-SecureString -String $env:{password_env_var} -Force -AsPlainText; Import-PfxCertificate -FilePath {escaped_path} -CertStoreLocation Cert:\\CurrentUser\\My -Password $password | Out-Null"
    );

    log.push_str("$ powershell Import-PfxCertificate ");
    log.push_str(&certificate_path.display().to_string());
    log.push_str(" -Password $env:");
    log.push_str(password_env_var);
    log.push('\n');

    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            &script,
        ])
        .output()
        .map_err(to_error)?;
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    log.push_str(&stdout);
    log.push_str(&stderr);

    if output.status.success() {
        log.push_str("Signing certificate imported into Cert:\\CurrentUser\\My.\n");
        Ok(())
    } else {
        Err(log.clone())
    }
}

pub(super) fn powershell_single_quoted(value: &str) -> String {
    format!("'{}'", value.replace('\'', "''"))
}
