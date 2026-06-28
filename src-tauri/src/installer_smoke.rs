use crate::{
    bundle_artifact_kind, html_text, json_string, normalized_checkpoint_created_at,
    powershell_single_quoted, safe_file_name, to_error, InstallerSandboxHandoffResult,
    InstallerSmokeReadResult, WindowsCertificateInspectionResult, WindowsCertificateStoreEntry,
};
use serde_json::Value;
use std::{
    collections::BTreeSet,
    fs,
    path::{Path, PathBuf},
    process::Command,
};

#[tauri::command]
pub(super) fn read_installer_smoke_result(
    path: String,
) -> Result<InstallerSmokeReadResult, String> {
    let path = PathBuf::from(path);
    let result = read_installer_smoke_result_file(&path)?;
    Ok(result)
}

#[tauri::command]
pub(super) fn run_installer_smoke_script(
    script_path: String,
    result_path: String,
) -> Result<InstallerSmokeReadResult, String> {
    if !cfg!(target_os = "windows") {
        return Err("Installer smoke runner currently uses Windows PowerShell.".to_string());
    }

    let script_path = PathBuf::from(script_path);
    let result_path = PathBuf::from(result_path);
    let script_path = validate_installer_smoke_runner_paths(&script_path, &result_path)?;
    let script_path_text = script_path.display().to_string();

    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            &script_path_text,
        ])
        .output()
        .map_err(to_error)?;

    let mut output_log = String::new();
    output_log.push_str(&String::from_utf8_lossy(&output.stdout));
    output_log.push_str(&String::from_utf8_lossy(&output.stderr));

    if result_path.exists() {
        let mut result = read_installer_smoke_result_file(&result_path)?;
        result.script_path = Some(script_path_text);
        result.output_log = output_log;
        return Ok(result);
    }

    if output.status.success() {
        Err(format!(
            "Installer smoke script completed but did not write result JSON: {}",
            result_path.display()
        ))
    } else {
        Err(output_log)
    }
}

#[tauri::command]
pub(super) fn inspect_windows_certificate_store(
    thumbprint: String,
) -> Result<WindowsCertificateInspectionResult, String> {
    if !cfg!(target_os = "windows") {
        return Err(
            "Windows certificate store inspection is only available on Windows.".to_string(),
        );
    }

    let query = normalize_certificate_thumbprint(&thumbprint);
    if query.is_empty() {
        return Err(
            "Enter a certificate thumbprint before inspecting the Windows certificate store."
                .to_string(),
        );
    }
    if !query.chars().all(|value| value.is_ascii_hexdigit()) {
        return Err(
            "Certificate thumbprint must contain only hexadecimal characters, spaces, or colons."
                .to_string(),
        );
    }

    let query_json = json_string(&query);
    let script = format!(
        r#"$ErrorActionPreference = 'Stop'
$query = {query_json}
$stores = @(
  [ordered]@{{ store = 'CurrentUser\My'; path = 'Cert:\CurrentUser\My' }},
  [ordered]@{{ store = 'LocalMachine\My'; path = 'Cert:\LocalMachine\My' }}
)
$results = @()
foreach ($store in $stores) {{
  $certs = Get-ChildItem -Path $store.path -ErrorAction SilentlyContinue
  foreach ($cert in $certs) {{
    $thumb = (($cert.Thumbprint -replace '\s', '').ToUpperInvariant())
    if ($thumb -eq $query) {{
      $results += [ordered]@{{
        store = $store.store
        subject = [string]$cert.Subject
        issuer = [string]$cert.Issuer
        thumbprint = [string]$cert.Thumbprint
        not_before = if ($null -eq $cert.NotBefore) {{ $null }} else {{ $cert.NotBefore.ToString('o') }}
        not_after = if ($null -eq $cert.NotAfter) {{ $null }} else {{ $cert.NotAfter.ToString('o') }}
        has_private_key = [bool]$cert.HasPrivateKey
        archived = [bool]$cert.Archived
        friendly_name = if ([string]::IsNullOrWhiteSpace($cert.FriendlyName)) {{ $null }} else {{ [string]$cert.FriendlyName }}
      }}
    }}
  }}
}}
ConvertTo-Json -InputObject $results -Compress -Depth 5
"#
    );
    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", &script])
        .output()
        .map_err(to_error)?;
    if !output.status.success() {
        let mut message = String::new();
        message.push_str(&String::from_utf8_lossy(&output.stdout));
        message.push_str(&String::from_utf8_lossy(&output.stderr));
        return Err(message);
    }

    let content = String::from_utf8_lossy(&output.stdout);
    let entries = parse_certificate_store_entries(content.trim_start_matches('\u{feff}').trim())?;
    let stores = entries
        .iter()
        .map(|entry| entry.store.clone())
        .filter(|value| !value.trim().is_empty())
        .collect::<BTreeSet<_>>()
        .into_iter()
        .collect::<Vec<_>>();
    let private_key_count = entries.iter().filter(|entry| entry.has_private_key).count();
    let summary = if entries.is_empty() {
        format!("No certificate with thumbprint {query} was found in CurrentUser\\My or LocalMachine\\My.")
    } else {
        format!(
            "Found {} matching certificate{} in {}; {} with private key.",
            entries.len(),
            if entries.len() == 1 { "" } else { "s" },
            stores.join(", "),
            private_key_count
        )
    };

    Ok(WindowsCertificateInspectionResult {
        query,
        checked_at: normalized_checkpoint_created_at(""),
        found: !entries.is_empty(),
        match_count: entries.len(),
        summary,
        entries,
    })
}

#[tauri::command]
pub(super) fn create_installer_sandbox_handoff(
    handoff_path: String,
) -> Result<InstallerSandboxHandoffResult, String> {
    if !cfg!(target_os = "windows") {
        return Err("Windows Sandbox handoff generation is only available on Windows.".to_string());
    }

    let handoff_path = validate_installer_smoke_vm_handoff_path(&PathBuf::from(handoff_path))?;
    let builds_dir = handoff_path
        .parent()
        .ok_or_else(|| "Installer smoke VM handoff has no builds directory.".to_string())?;
    let content = fs::read_to_string(&handoff_path).map_err(to_error)?;
    let handoff: Value =
        serde_json::from_str(content.trim_start_matches('\u{feff}')).map_err(to_error)?;
    if handoff.get("schema").and_then(Value::as_str) != Some("nova.installerSmokeVmHandoff.v1") {
        return Err("Installer smoke handoff schema is not supported.".to_string());
    }

    let created_at = normalized_checkpoint_created_at("");
    let handoff_stem = handoff_path
        .file_stem()
        .and_then(|value| value.to_str())
        .map(safe_file_name)
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| "installer-smoke-vm-handoff".to_string());
    let sandbox_dir = builds_dir.join(format!("sandbox-{handoff_stem}-{created_at}"));
    let artifacts_dir = sandbox_dir.join("artifacts");
    fs::create_dir_all(&artifacts_dir).map_err(to_error)?;

    let artifacts = handoff
        .get("artifacts")
        .and_then(Value::as_array)
        .ok_or_else(|| "Installer smoke handoff does not list artifacts.".to_string())?;
    let mut copied_artifacts = Vec::new();
    for artifact in artifacts {
        let source_path = artifact
            .get("path")
            .and_then(Value::as_str)
            .ok_or_else(|| "Installer smoke handoff artifact is missing its path.".to_string())?;
        let source_path = PathBuf::from(source_path);
        let source_path = fs::canonicalize(&source_path).map_err(to_error)?;
        if !source_path.is_file() {
            return Err(format!(
                "Installer artifact is not a file: {}",
                source_path.display()
            ));
        }
        let file_name = source_path
            .file_name()
            .and_then(|value| value.to_str())
            .map(safe_file_name)
            .filter(|value| !value.is_empty())
            .unwrap_or_else(|| "artifact.bin".to_string());
        let destination_path = unique_child_path(&artifacts_dir, &file_name);
        fs::copy(&source_path, &destination_path).map_err(to_error)?;
        let artifact_kind = artifact
            .get("kind")
            .and_then(Value::as_str)
            .map(str::to_string)
            .unwrap_or_else(|| bundle_artifact_kind(&source_path));
        copied_artifacts.push(serde_json::json!({
            "source_path": source_path.display().to_string(),
            "file_name": destination_path.file_name().map(|value| value.to_string_lossy().to_string()).unwrap_or(file_name),
            "kind": artifact_kind,
            "minimum_size_bytes": artifact.get("minimum_size_bytes").and_then(Value::as_u64).unwrap_or(0),
        }));
    }
    if copied_artifacts.is_empty() {
        return Err("Installer smoke handoff does not contain any copyable artifacts.".to_string());
    }

    let result_file_name = handoff
        .get("smoke_result_path")
        .and_then(Value::as_str)
        .and_then(|value| Path::new(value).file_name())
        .and_then(|value| value.to_str())
        .map(safe_file_name)
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| format!("installer-smoke-result-{created_at}.json"));
    let manifest_file_names = ["manifest_path", "latest_manifest_path"]
        .iter()
        .filter_map(|key| {
            handoff
                .get(*key)
                .and_then(Value::as_str)
                .and_then(|value| Path::new(value).file_name())
                .and_then(|value| value.to_str())
                .map(safe_file_name)
        })
        .filter(|value| !value.is_empty())
        .collect::<Vec<_>>();
    let app_name = handoff
        .get("app_name")
        .and_then(Value::as_str)
        .unwrap_or("Nova app");
    let sandbox_script_path = sandbox_dir.join("run-installer-smoke-in-sandbox.ps1");
    write_windows_sandbox_smoke_script(
        &sandbox_script_path,
        &result_file_name,
        &manifest_file_names,
        app_name,
        &copied_artifacts,
    )?;

    let sandbox_config_path = sandbox_dir.join("nova-installer-smoke.wsb");
    let guest_script_path = format!(
        r"C:\Users\WDAGUtilityAccount\Desktop\builds\{}\run-installer-smoke-in-sandbox.ps1",
        sandbox_dir
            .file_name()
            .map(|value| value.to_string_lossy().to_string())
            .unwrap_or_else(|| "sandbox".to_string())
    );
    let wsb = format!(
        r#"<Configuration>
  <MappedFolders>
    <MappedFolder>
      <HostFolder>{}</HostFolder>
      <ReadOnly>false</ReadOnly>
    </MappedFolder>
  </MappedFolders>
  <LogonCommand>
    <Command>powershell.exe -NoProfile -ExecutionPolicy Bypass -File "{}"</Command>
  </LogonCommand>
</Configuration>
"#,
        html_text(&builds_dir.display().to_string()),
        html_text(&guest_script_path)
    );
    fs::write(&sandbox_config_path, wsb).map_err(to_error)?;

    let launcher_script_path = sandbox_dir.join("open-windows-sandbox.ps1");
    let launcher = format!(
        r#"# Generated by Nova UI Editor.
$ErrorActionPreference = 'Stop'
$ConfigPath = {}
Write-Host "Opening Windows Sandbox config: $ConfigPath"
Write-Host "The mapped host folder is: {}"
Start-Process -FilePath $ConfigPath
"#,
        powershell_single_quoted(&sandbox_config_path.display().to_string()),
        builds_dir.display()
    );
    fs::write(&launcher_script_path, launcher).map_err(to_error)?;

    let sandbox_result_path = builds_dir.join(&result_file_name);
    Ok(InstallerSandboxHandoffResult {
        handoff_path: handoff_path.display().to_string(),
        sandbox_config_path: sandbox_config_path.display().to_string(),
        launcher_script_path: launcher_script_path.display().to_string(),
        shared_folder: builds_dir.display().to_string(),
        sandbox_script_path: sandbox_script_path.display().to_string(),
        sandbox_result_path: sandbox_result_path.display().to_string(),
        copied_artifact_count: copied_artifacts.len(),
        summary: format!(
            "Prepared Windows Sandbox smoke handoff with {} artifact{}; opening the .wsb file will run the sandbox script and write {}.",
            copied_artifacts.len(),
            if copied_artifacts.len() == 1 { "" } else { "s" },
            sandbox_result_path.display()
        ),
    })
}

fn read_installer_smoke_result_file(path: &Path) -> Result<InstallerSmokeReadResult, String> {
    let content = fs::read_to_string(path).map_err(to_error)?;
    let mut result: InstallerSmokeReadResult =
        serde_json::from_str(content.trim_start_matches('\u{feff}')).map_err(to_error)?;
    result.result_path = path.display().to_string();
    Ok(result)
}

fn validate_installer_smoke_runner_paths(
    script_path: &Path,
    result_path: &Path,
) -> Result<PathBuf, String> {
    let script_name = script_path
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default();
    if !script_name.starts_with("installer-smoke-") || !script_name.ends_with(".ps1") {
        return Err(
            "Installer smoke runner only runs Nova-generated installer-smoke-*.ps1 scripts."
                .to_string(),
        );
    }

    let result_name = result_path
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default();
    if !result_name.starts_with("installer-smoke-result-") || !result_name.ends_with(".json") {
        return Err(
            "Installer smoke result must be a Nova-generated installer-smoke-result-*.json path."
                .to_string(),
        );
    }

    let script_path = fs::canonicalize(script_path).map_err(to_error)?;
    let script_dir = script_path
        .parent()
        .ok_or_else(|| "Installer smoke script has no parent directory.".to_string())?;
    let result_dir = result_path
        .parent()
        .ok_or_else(|| "Installer smoke result has no parent directory.".to_string())
        .and_then(|path| fs::canonicalize(path).map_err(to_error))?;

    if script_dir != result_dir {
        return Err(
            "Installer smoke script and result JSON must live in the same builds directory."
                .to_string(),
        );
    }
    if !is_nova_builds_dir(script_dir) {
        return Err(
            "Installer smoke runner only runs scripts from a Nova .nova/builds directory."
                .to_string(),
        );
    }

    Ok(script_path)
}

fn validate_installer_smoke_vm_handoff_path(path: &Path) -> Result<PathBuf, String> {
    let file_name = path
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default();
    if !file_name.starts_with("installer-smoke-vm-handoff-") || !file_name.ends_with(".json") {
        return Err(
            "Sandbox handoff only accepts Nova-generated installer-smoke-vm-handoff-*.json files."
                .to_string(),
        );
    }

    let path = fs::canonicalize(path).map_err(to_error)?;
    if !path.is_file() {
        return Err(format!(
            "Installer smoke VM handoff is not a file: {}",
            path.display()
        ));
    }
    let builds_dir = path
        .parent()
        .ok_or_else(|| "Installer smoke VM handoff has no parent directory.".to_string())?;
    if !is_nova_builds_dir(builds_dir) {
        return Err(
            "Sandbox handoff only prepares packages from a Nova .nova/builds directory."
                .to_string(),
        );
    }

    Ok(path)
}

pub(super) fn normalize_certificate_thumbprint(value: &str) -> String {
    value
        .chars()
        .filter(|character| !character.is_whitespace() && *character != ':')
        .flat_map(char::to_uppercase)
        .collect()
}

pub(super) fn parse_certificate_store_entries(
    content: &str,
) -> Result<Vec<WindowsCertificateStoreEntry>, String> {
    if content.trim().is_empty() {
        return Ok(Vec::new());
    }
    let parsed: Value = serde_json::from_str(content).map_err(to_error)?;
    match parsed {
        Value::Array(entries) => entries
            .into_iter()
            .map(serde_json::from_value)
            .collect::<Result<Vec<_>, _>>()
            .map_err(to_error),
        Value::Object(_) => serde_json::from_value(parsed)
            .map(|entry| vec![entry])
            .map_err(to_error),
        Value::Null => Ok(Vec::new()),
        _ => {
            Err("Windows certificate store inspection returned an unexpected payload.".to_string())
        }
    }
}

fn unique_child_path(parent: &Path, file_name: &str) -> PathBuf {
    let candidate = parent.join(file_name);
    if !candidate.exists() {
        return candidate;
    }

    let stem = Path::new(file_name)
        .file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or("artifact");
    let extension = Path::new(file_name)
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| format!(".{value}"))
        .unwrap_or_default();
    for index in 2..1000 {
        let candidate = parent.join(format!("{stem}-{index}{extension}"));
        if !candidate.exists() {
            return candidate;
        }
    }

    parent.join(format!("{stem}-copy{extension}"))
}

fn write_windows_sandbox_smoke_script(
    script_path: &Path,
    result_file_name: &str,
    manifest_file_names: &[String],
    app_name: &str,
    copied_artifacts: &[Value],
) -> Result<(), String> {
    let mut script = String::from(
        r#"# Generated by Nova UI Editor for Windows Sandbox.
# The .wsb file maps the host .nova/builds directory to the Sandbox desktop and runs this script.
$ErrorActionPreference = 'Stop'
$RunInstallers = $true
$BuildsRoot = Split-Path -Parent $PSScriptRoot
"#,
    );
    script.push_str("$SmokeResultPath = Join-Path $BuildsRoot ");
    script.push_str(&powershell_single_quoted(result_file_name));
    script.push('\n');
    script.push_str("$ManifestPaths = @(\n");
    for file_name in manifest_file_names {
        script.push_str("  (Join-Path $BuildsRoot ");
        script.push_str(&powershell_single_quoted(file_name));
        script.push_str(")\n");
    }
    script.push_str(")\n");
    script.push_str("$AppName = ");
    script.push_str(&powershell_single_quoted(app_name));
    script.push_str("\n$Artifacts = @(\n");
    for artifact in copied_artifacts {
        let file_name = artifact
            .get("file_name")
            .and_then(Value::as_str)
            .unwrap_or("artifact.bin");
        let kind = artifact
            .get("kind")
            .and_then(Value::as_str)
            .unwrap_or("unknown");
        let source_path = artifact
            .get("source_path")
            .and_then(Value::as_str)
            .unwrap_or("");
        let minimum_size_bytes = artifact
            .get("minimum_size_bytes")
            .and_then(Value::as_u64)
            .unwrap_or(0);
        script.push_str("  @{ Path = (Join-Path $PSScriptRoot ");
        script.push_str(&powershell_single_quoted(&format!(
            "artifacts\\{file_name}"
        )));
        script.push_str("); Kind = ");
        script.push_str(&powershell_single_quoted(kind));
        script.push_str("; SourcePath = ");
        script.push_str(&powershell_single_quoted(source_path));
        script.push_str("; MinimumSizeBytes = ");
        script.push_str(&minimum_size_bytes.to_string());
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
    source_path = $Artifact.SourcePath
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
      throw "Missing sandbox artifact: $Path"
    }
    $Size = (Get-Item -LiteralPath $Path).Length
    if ($Size -lt [int64]$Artifact.MinimumSizeBytes) {
      throw "Artifact is $Size bytes, below $($Artifact.MinimumSizeBytes)."
    }
    $Record.artifact_status = 'passed'
    $Record.messages += "Artifact exists in sandbox and meets the configured size threshold."
    Write-Host "Sandbox artifact ready: $Kind $Path"

    if ($Kind -eq 'msi') {
      $Install = Start-Process msiexec.exe -ArgumentList @('/i', $Path, '/qn', '/norestart') -Wait -PassThru
      $Record.install_exit_code = $Install.ExitCode
      if ($Install.ExitCode -ne 0) { throw "MSI install failed with $($Install.ExitCode)" }
      $Record.install_status = 'passed'

      $Uninstall = Start-Process msiexec.exe -ArgumentList @('/x', $Path, '/qn', '/norestart') -Wait -PassThru
      $Record.uninstall_exit_code = $Uninstall.ExitCode
      if ($Uninstall.ExitCode -ne 0) { throw "MSI uninstall failed with $($Uninstall.ExitCode)" }
      $Record.uninstall_status = 'passed'
    } elseif ($Kind -eq 'nsis') {
      $Install = Start-Process -FilePath $Path -ArgumentList '/S' -Wait -PassThru
      $Record.install_exit_code = $Install.ExitCode
      if ($Install.ExitCode -ne 0) { throw "NSIS install failed with $($Install.ExitCode)" }
      $Record.install_status = 'passed'
      $Record.uninstall_status = 'manual'
      $Record.messages += "Silent NSIS install completed. Uninstall command is app-specific; verify it manually for $AppName."
    } else {
      $Record.install_status = 'unsupported'
      $Record.uninstall_status = 'unsupported'
      $Record.messages += "No sandbox install smoke command configured for artifact kind: $Kind"
    }

    $Record.status = 'passed'
  } catch {
    $Record.status = 'failed'
    $Record.messages += $_.Exception.Message
    $OverallStatus = 'failed'
  }

  $Results += [pscustomobject]$Record
}

$PassedCount = @($Results | Where-Object { $_.status -eq 'passed' }).Count
$FailedCount = @($Results | Where-Object { $_.status -eq 'failed' }).Count
$FinishedAt = (Get-Date).ToString('o')
$Summary = "$PassedCount passed, $FailedCount failed, sandbox installers run: $RunInstallers"
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
  runner = 'windows-sandbox'
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
    $Manifest | Add-Member -NotePropertyName 'installer_smoke_runner' -NotePropertyValue 'windows-sandbox' -Force
    $Manifest | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $ManifestPath -Encoding UTF8
  }
}

if ($OverallStatus -eq 'failed') {
  exit 1
}
"#,
    );
    fs::write(script_path, script).map_err(to_error)
}

fn is_nova_builds_dir(path: &Path) -> bool {
    path.file_name()
        .and_then(|value| value.to_str())
        .is_some_and(|value| value.eq_ignore_ascii_case("builds"))
        && path
            .parent()
            .and_then(|parent| parent.file_name())
            .and_then(|value| value.to_str())
            .is_some_and(|value| value.eq_ignore_ascii_case(".nova"))
}
