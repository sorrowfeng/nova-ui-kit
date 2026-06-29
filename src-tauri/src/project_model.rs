use serde_json::Value;
use std::{
    collections::BTreeSet,
    path::Path,
    time::{SystemTime, UNIX_EPOCH},
};

pub(super) struct GeneratedReleaseConfig {
    pub(super) app_name: String,
    pub(super) slug: String,
    pub(super) identifier: String,
    pub(super) version: String,
    pub(super) release_notes: String,
    pub(super) bundle_targets: String,
    pub(super) icon_asset_id: Option<String>,
    pub(super) signing_mode: String,
    pub(super) certificate_thumbprint: String,
    pub(super) certificate_source_path: Option<String>,
    pub(super) certificate_password_env_var: String,
    pub(super) import_certificate_before_build: bool,
    pub(super) digest_algorithm: String,
    pub(super) timestamp_url: String,
    pub(super) timestamp_tsp: bool,
    pub(super) sign_command: String,
    pub(super) minimum_artifact_size_kb: u64,
    pub(super) installer_smoke_mode: String,
    pub(super) installer_smoke_runner_mode: String,
    pub(super) installer_smoke_vm_name: String,
    pub(super) installer_smoke_vm_shared_folder: Option<String>,
    pub(super) installer_smoke_vm_notes: Option<String>,
    pub(super) window_title: String,
    pub(super) window_kind: String,
    pub(super) titlebar_style: String,
    pub(super) titlebar_subtitle: String,
    pub(super) window_width: u64,
    pub(super) window_height: u64,
    pub(super) min_window_width: u64,
    pub(super) min_window_height: u64,
    pub(super) resizable: bool,
    pub(super) show_runtime_panel: bool,
}

#[derive(Debug, Clone)]
pub(super) struct GeneratedRustModule {
    pub(super) name: String,
    pub(super) source: String,
}

#[derive(Debug, Clone)]
pub(super) struct GeneratedCargoDependency {
    pub(super) name: String,
    pub(super) version: String,
    pub(super) features: Vec<String>,
}

#[derive(Debug, Clone)]
pub(super) struct GeneratedBackendMethod {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) operation: String,
    pub(super) path: String,
    pub(super) description: String,
    pub(super) request_schema: String,
    pub(super) response_schema: String,
}

#[derive(Debug, Clone)]
pub(super) struct GeneratedBackendIntegration {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) function_name: String,
    pub(super) kind: String,
    pub(super) language: String,
    pub(super) transport: String,
    pub(super) entry_path: String,
    pub(super) artifact_path: String,
    pub(super) resource_path: String,
    pub(super) command: String,
    pub(super) health_check_command: String,
    pub(super) startup_timeout_ms: u64,
    pub(super) capture_output: bool,
    pub(super) notes: String,
    pub(super) bundle_resource: bool,
    pub(super) methods: Vec<GeneratedBackendMethod>,
}

pub(super) const DEFAULT_RUST_LOGIC: &str = r#"#[tauri::command]
fn app_message() -> String {
    "Hello from Nova generated Rust logic".to_string()
}
"#;
pub(super) const DEFAULT_RUST_COMMAND_NAME: &str = "app_message";

pub(super) fn project_name(project: &Value) -> String {
    project
        .get("name")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .unwrap_or("Nova Generated App")
        .to_string()
}

pub(super) fn release_config(project: &Value, project_name: &str) -> GeneratedReleaseConfig {
    let config = project.get("releaseConfig").unwrap_or(&Value::Null);
    let app_name = string_field(config, "appName", project_name);
    let slug = slugify(&app_name);
    let identifier = bundle_identifier(
        config
            .get("bundleIdentifier")
            .and_then(Value::as_str)
            .unwrap_or(""),
        &slug,
    );
    let version = release_version(
        config
            .get("version")
            .and_then(Value::as_str)
            .unwrap_or("0.1.0"),
    );
    let bundle_targets = release_bundle_targets(
        config
            .get("bundleTargets")
            .and_then(Value::as_str)
            .unwrap_or("all"),
    );
    let icon_asset_id = config
        .get("iconAssetId")
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToString::to_string);
    let signing_mode = release_signing_mode(
        config
            .get("signingMode")
            .and_then(Value::as_str)
            .unwrap_or("unsigned"),
    );
    let window_width = number_field(config, "windowWidth", 1200, 320, 3840);
    let window_height = number_field(config, "windowHeight", 800, 240, 2160);
    let min_window_width = number_field(config, "minWindowWidth", 720, 240, window_width);
    let min_window_height = number_field(config, "minWindowHeight", 480, 180, window_height);

    GeneratedReleaseConfig {
        app_name: app_name.clone(),
        slug,
        identifier,
        version,
        release_notes: string_field(config, "releaseNotes", ""),
        bundle_targets,
        icon_asset_id,
        signing_mode,
        certificate_thumbprint: string_field(config, "certificateThumbprint", ""),
        certificate_source_path: config
            .get("certificateSourcePath")
            .and_then(Value::as_str)
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(ToString::to_string),
        certificate_password_env_var: env_var_field(
            config,
            "certificatePasswordEnvVar",
            "NOVA_SIGNING_CERT_PASSWORD",
        ),
        import_certificate_before_build: config
            .get("importCertificateBeforeBuild")
            .and_then(Value::as_bool)
            .unwrap_or(false),
        digest_algorithm: release_digest_algorithm(
            config
                .get("digestAlgorithm")
                .and_then(Value::as_str)
                .unwrap_or("sha256"),
        ),
        timestamp_url: string_field(config, "timestampUrl", ""),
        timestamp_tsp: config
            .get("timestampTsp")
            .and_then(Value::as_bool)
            .unwrap_or(false),
        sign_command: string_field(config, "signCommand", ""),
        minimum_artifact_size_kb: number_field(config, "minimumArtifactSizeKb", 1, 0, 1024 * 1024),
        installer_smoke_mode: release_installer_smoke_mode(
            config
                .get("installerSmokeMode")
                .and_then(Value::as_str)
                .unwrap_or("artifact-only"),
        ),
        installer_smoke_runner_mode: release_installer_smoke_runner_mode(
            config
                .get("installerSmokeRunnerMode")
                .and_then(Value::as_str)
                .unwrap_or("local-artifact"),
        ),
        installer_smoke_vm_name: string_field(config, "installerSmokeVmName", "Nova Smoke VM"),
        installer_smoke_vm_shared_folder: config
            .get("installerSmokeVmSharedFolder")
            .and_then(Value::as_str)
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(ToString::to_string),
        installer_smoke_vm_notes: config
            .get("installerSmokeVmNotes")
            .and_then(Value::as_str)
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(ToString::to_string),
        window_title: string_field(config, "windowTitle", &app_name),
        window_kind: release_window_kind(
            config
                .get("windowKind")
                .and_then(Value::as_str)
                .unwrap_or("main"),
        ),
        titlebar_style: release_titlebar_style(
            config
                .get("titlebarStyle")
                .and_then(Value::as_str)
                .unwrap_or("nova"),
            config
                .get("windowKind")
                .and_then(Value::as_str)
                .unwrap_or("main"),
        ),
        titlebar_subtitle: string_field(config, "titlebarSubtitle", "Desktop app"),
        window_width,
        window_height,
        min_window_width,
        min_window_height,
        resizable: config
            .get("resizable")
            .and_then(Value::as_bool)
            .unwrap_or(true),
        show_runtime_panel: config
            .get("showRuntimePanel")
            .and_then(Value::as_bool)
            .unwrap_or(false),
    }
}

fn release_window_kind(value: &str) -> String {
    match value {
        "dialog" | "tool" | "frameless" => value.to_string(),
        _ => "main".to_string(),
    }
}

fn release_titlebar_style(value: &str, window_kind: &str) -> String {
    if window_kind == "frameless" {
        return "hidden".to_string();
    }
    match value {
        "native" | "hidden" => value.to_string(),
        _ => "nova".to_string(),
    }
}

fn string_field(config: &Value, key: &str, fallback: &str) -> String {
    config
        .get(key)
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .unwrap_or(fallback)
        .trim()
        .to_string()
}

fn env_var_field(config: &Value, key: &str, fallback: &str) -> String {
    config
        .get(key)
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| is_valid_env_var_name(value))
        .unwrap_or(fallback)
        .to_string()
}

pub(super) fn is_valid_env_var_name(value: &str) -> bool {
    let mut chars = value.chars();
    let Some(first) = chars.next() else {
        return false;
    };
    (first.is_ascii_alphabetic() || first == '_')
        && chars.all(|ch| ch.is_ascii_alphanumeric() || ch == '_')
}

fn number_field(config: &Value, key: &str, fallback: u64, min: u64, max: u64) -> u64 {
    let value = config.get(key).and_then(Value::as_u64).unwrap_or(fallback);
    value.clamp(min, max.max(min))
}

fn bundle_identifier(value: &str, slug: &str) -> String {
    let identifier = value
        .trim()
        .to_ascii_lowercase()
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '.' || ch == '-' {
                ch
            } else {
                '.'
            }
        })
        .collect::<String>()
        .split('.')
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join(".");
    if identifier.contains('.') {
        identifier
    } else {
        format!("com.nova.generated.{}", slug.replace('-', "."))
    }
}

fn release_version(value: &str) -> String {
    let version = value.trim();
    let valid = version
        .chars()
        .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '.' | '-' | '+'))
        && version.split('.').take(3).count() >= 3
        && version
            .chars()
            .next()
            .map(|ch| ch.is_ascii_digit())
            .unwrap_or(false);
    if valid {
        version.to_string()
    } else {
        "0.1.0".to_string()
    }
}

fn release_bundle_targets(value: &str) -> String {
    match value.trim().to_ascii_lowercase().as_str() {
        "app" => "app",
        "nsis" => "nsis",
        "msi" => "msi",
        "appimage" => "appimage",
        "deb" => "deb",
        "dmg" => "dmg",
        _ => "all",
    }
    .to_string()
}

fn release_signing_mode(value: &str) -> String {
    match value.trim().to_ascii_lowercase().as_str() {
        "windows-certificate" => "windows-certificate",
        "custom-command" => "custom-command",
        _ => "unsigned",
    }
    .to_string()
}

fn release_digest_algorithm(value: &str) -> String {
    match value.trim().to_ascii_lowercase().as_str() {
        "sha384" => "sha384",
        "sha512" => "sha512",
        _ => "sha256",
    }
    .to_string()
}

fn release_installer_smoke_mode(value: &str) -> String {
    match value.trim().to_ascii_lowercase().as_str() {
        "write-script" => "write-script",
        _ => "artifact-only",
    }
    .to_string()
}

fn release_installer_smoke_runner_mode(value: &str) -> String {
    match value.trim().to_ascii_lowercase().as_str() {
        "manual" => "manual",
        "vm-handoff" => "vm-handoff",
        _ => "local-artifact",
    }
    .to_string()
}

pub(super) fn normalized_checkpoint_created_at(created_at: &str) -> String {
    let created_at = created_at.trim();
    if !created_at.is_empty() {
        return created_at.to_string();
    }

    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis().to_string())
        .unwrap_or_else(|_| "0".to_string())
}

pub(super) fn rust_command_names(project: &Value) -> Vec<String> {
    let mut names = Vec::new();
    if let Some(commands) = project.get("rustCommands").and_then(Value::as_array) {
        for (index, command) in commands.iter().enumerate() {
            let raw_name = command
                .get("name")
                .and_then(Value::as_str)
                .unwrap_or(if index == 0 {
                    DEFAULT_RUST_COMMAND_NAME
                } else {
                    "project_command"
                });
            let base_name = sanitize_rust_ident(raw_name);
            let mut name = base_name.clone();
            let mut suffix = 2;
            while names.contains(&name) {
                name = format!("{base_name}_{suffix}");
                suffix += 1;
            }
            names.push(name);
        }
    }

    if names.is_empty() {
        names.push(DEFAULT_RUST_COMMAND_NAME.to_string());
    }
    names
}

pub(super) fn rust_modules(project: &Value) -> Vec<GeneratedRustModule> {
    let mut modules = Vec::new();
    if let Some(raw_modules) = project.get("rustModules").and_then(Value::as_array) {
        for (index, module) in raw_modules.iter().enumerate() {
            if module.get("enabled").and_then(Value::as_bool) == Some(false) {
                continue;
            }
            let raw_name = module
                .get("name")
                .and_then(Value::as_str)
                .unwrap_or(if index == 0 {
                    "project_state"
                } else {
                    "module"
                });
            let base_name = sanitize_rust_ident(raw_name);
            let mut name = if base_name == DEFAULT_RUST_COMMAND_NAME {
                format!("module_{}", index + 1)
            } else {
                base_name
            };
            let base_for_suffix = name.clone();
            let mut suffix = 2;
            while modules
                .iter()
                .any(|candidate: &GeneratedRustModule| candidate.name == name)
            {
                name = format!("{base_for_suffix}_{suffix}");
                suffix += 1;
            }
            let source = module
                .get("source")
                .and_then(Value::as_str)
                .unwrap_or("")
                .trim_end()
                .to_string();
            modules.push(GeneratedRustModule { name, source });
        }
    }
    modules
}

fn sanitize_cargo_dependency_name(value: &str, index: usize) -> String {
    let mut name = value
        .trim()
        .to_lowercase()
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '_' || ch == '-' {
                ch
            } else {
                '-'
            }
        })
        .collect::<String>()
        .trim_matches('-')
        .to_string();
    while name.contains("--") {
        name = name.replace("--", "-");
    }
    if name.is_empty() {
        if index == 0 {
            "serde".to_string()
        } else {
            format!("dependency-{}", index + 1)
        }
    } else {
        name
    }
}

fn cargo_dependency_features(value: &Value) -> Vec<String> {
    value
        .as_str()
        .unwrap_or("")
        .split(',')
        .map(str::trim)
        .filter(|feature| !feature.is_empty())
        .map(ToString::to_string)
        .collect()
}

pub(super) fn cargo_dependencies(project: &Value) -> Vec<GeneratedCargoDependency> {
    let mut dependencies = Vec::new();
    if let Some(raw_dependencies) = project.get("cargoDependencies").and_then(Value::as_array) {
        for (index, dependency) in raw_dependencies.iter().enumerate() {
            if dependency.get("enabled").and_then(Value::as_bool) == Some(false) {
                continue;
            }
            let name = sanitize_cargo_dependency_name(
                dependency
                    .get("name")
                    .and_then(Value::as_str)
                    .unwrap_or(if index == 0 { "serde" } else { "dependency" }),
                index,
            );
            if matches!(name.as_str(), "tauri" | "tauri-build" | "serde_json")
                || dependencies
                    .iter()
                    .any(|candidate: &GeneratedCargoDependency| candidate.name == name)
            {
                continue;
            }
            let version = dependency
                .get("version")
                .and_then(Value::as_str)
                .map(str::trim)
                .filter(|value| !value.is_empty())
                .unwrap_or("1")
                .to_string();
            dependencies.push(GeneratedCargoDependency {
                name,
                version,
                features: cargo_dependency_features(&dependency["features"]),
            });
        }
    }
    dependencies
}

fn backend_integration_string(value: &Value, key: &str, fallback: &str) -> String {
    value
        .get(key)
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(fallback)
        .to_string()
}

fn normalized_backend_integration_kind(value: &str) -> &'static str {
    match value {
        "cpp-ffi" => "cpp-ffi",
        "sidecar" => "sidecar",
        "local-service" => "local-service",
        _ => "rust-native",
    }
}

fn normalized_backend_integration_language(value: &str, kind: &str) -> &'static str {
    match value {
        "cpp" => "cpp",
        "go" => "go",
        "python" => "python",
        "node" => "node",
        "other" => "other",
        "rust" => "rust",
        _ if kind == "cpp-ffi" => "cpp",
        _ => "rust",
    }
}

fn normalized_backend_integration_transport(value: &str, kind: &str) -> &'static str {
    match value {
        "ffi" => "ffi",
        "stdio" => "stdio",
        "http" => "http",
        "grpc" => "grpc",
        "local-socket" => "local-socket",
        "tauri-invoke" => "tauri-invoke",
        _ if kind == "cpp-ffi" => "ffi",
        _ if kind == "rust-native" => "tauri-invoke",
        _ => "stdio",
    }
}

fn backend_integration_bool(value: &Value, key: &str, fallback: bool) -> bool {
    value.get(key).and_then(Value::as_bool).unwrap_or(fallback)
}

fn backend_integration_u64(value: &Value, key: &str, fallback: u64, min: u64, max: u64) -> u64 {
    let number = value.get(key).and_then(Value::as_u64).unwrap_or(fallback);
    number.clamp(min, max)
}

fn normalize_backend_resource_path(value: &str) -> String {
    let path = value.replace('\\', "/");
    let parts = path
        .split('/')
        .map(str::trim)
        .filter(|part| !part.is_empty() && *part != "." && *part != ".." && !part.contains(':'))
        .map(safe_file_name)
        .collect::<Vec<_>>();
    if parts.is_empty() {
        return String::new();
    }
    let normalized = parts.join("/");
    if normalized == "resources" || normalized.starts_with("resources/") {
        normalized
    } else {
        format!("resources/{normalized}")
    }
}

fn default_backend_resource_path(
    id: &str,
    name: &str,
    artifact_path: &str,
    entry_path: &str,
) -> String {
    let folder = safe_file_name(if id.trim().is_empty() { name } else { id });
    let file_name = [artifact_path, entry_path, name]
        .iter()
        .find_map(|value| {
            let trimmed = value.trim();
            if trimmed.is_empty() {
                return None;
            }
            Path::new(trimmed)
                .file_name()
                .map(|part| safe_file_name(&part.to_string_lossy()))
                .filter(|part| !part.trim().is_empty())
        })
        .unwrap_or_else(|| "backend-artifact".to_string());
    format!("resources/backend/{folder}/{file_name}")
}

fn backend_integration_methods(value: &Value) -> Vec<GeneratedBackendMethod> {
    let mut methods = Vec::new();
    let raw_methods = value.get("methods").and_then(Value::as_array);
    if let Some(raw_methods) = raw_methods {
        for (index, method) in raw_methods.iter().enumerate() {
            let fallback_name = if index == 0 {
                "process_event"
            } else {
                "backend_method"
            };
            let name = backend_integration_string(method, "name", fallback_name);
            let operation = backend_integration_string(method, "operation", &name);
            let path = backend_integration_string(
                method,
                "path",
                if index == 0 { "/process" } else { "/method" },
            );
            methods.push(GeneratedBackendMethod {
                id: backend_integration_string(
                    method,
                    "id",
                    &format!("backend-method-{}", index + 1),
                ),
                name,
                operation,
                path,
                description: backend_integration_string(method, "description", ""),
                request_schema: backend_integration_string(method, "requestSchema", "{}"),
                response_schema: backend_integration_string(
                    method,
                    "responseSchema",
                    r#"{"success":true,"message":"ok","patch":{}}"#,
                ),
            });
        }
    }
    if methods.is_empty() {
        methods.push(GeneratedBackendMethod {
            id: "backend-method-1".to_string(),
            name: "process_event".to_string(),
            operation: "process_event".to_string(),
            path: "/process".to_string(),
            description: "Receives UI event payloads and returns a Nova JSON envelope.".to_string(),
            request_schema: r#"{"payload":"object"}"#.to_string(),
            response_schema: r#"{"success":true,"message":"ok","patch":{}}"#.to_string(),
        });
    }
    methods
}

pub(super) fn backend_integrations(project: &Value) -> Vec<GeneratedBackendIntegration> {
    let mut integrations = Vec::new();
    let mut function_names = BTreeSet::new();
    function_names.insert("integration_summary".to_string());
    function_names.insert("integration_by_id".to_string());
    function_names.insert("build_sidecar_command".to_string());
    function_names.insert("bundled_resource_path".to_string());
    function_names.insert("build_bundled_sidecar_command".to_string());
    function_names.insert("probe_integrations".to_string());
    function_names.insert("probe_integration".to_string());
    function_names.insert("build_health_check_command".to_string());
    function_names.insert("run_health_check_with_timeout".to_string());
    function_names.insert("read_child_output".to_string());
    function_names.insert("trim_probe_output".to_string());
    function_names.insert("call_integration".to_string());
    function_names.insert("backend_call_error".to_string());
    function_names.insert("unsupported_backend_call".to_string());
    function_names.insert("backend_call_success".to_string());
    function_names.insert("call_stdio_integration".to_string());
    function_names.insert("call_http_integration".to_string());
    function_names.insert("parse_http_endpoint".to_string());

    if let Some(raw_integrations) = project.get("backendIntegrations").and_then(Value::as_array) {
        for (index, integration) in raw_integrations.iter().enumerate() {
            if integration.get("enabled").and_then(Value::as_bool) == Some(false) {
                continue;
            }
            let fallback_name = if index == 0 {
                "Rust Tauri backend"
            } else {
                "Backend integration"
            };
            let name = backend_integration_string(integration, "name", fallback_name);
            let kind = normalized_backend_integration_kind(&backend_integration_string(
                integration,
                "kind",
                "rust-native",
            ))
            .to_string();
            let language = normalized_backend_integration_language(
                &backend_integration_string(integration, "language", "rust"),
                &kind,
            )
            .to_string();
            let transport = normalized_backend_integration_transport(
                &backend_integration_string(integration, "transport", "tauri-invoke"),
                &kind,
            )
            .to_string();
            let base_name = sanitize_rust_ident(&format!("{name}_{kind}"));
            let mut function_name = base_name.clone();
            let mut suffix = 2;
            while function_names.contains(&function_name) {
                function_name = format!("{base_name}_{suffix}");
                suffix += 1;
            }
            function_names.insert(function_name.clone());
            let id = backend_integration_string(
                integration,
                "id",
                &format!("backend-integration-{}", index + 1),
            );
            let artifact_path = backend_integration_string(integration, "artifactPath", "");
            let entry_path = backend_integration_string(integration, "entryPath", "");
            let fallback_resource_path =
                default_backend_resource_path(&id, &name, &artifact_path, &entry_path);
            let resource_path = normalize_backend_resource_path(&backend_integration_string(
                integration,
                "resourcePath",
                &fallback_resource_path,
            ));
            let default_bundle_resource = matches!(kind.as_str(), "sidecar" | "local-service");

            integrations.push(GeneratedBackendIntegration {
                id,
                name,
                function_name,
                kind,
                language,
                transport,
                entry_path,
                artifact_path,
                resource_path,
                command: backend_integration_string(integration, "command", ""),
                health_check_command: backend_integration_string(
                    integration,
                    "healthCheckCommand",
                    "",
                ),
                startup_timeout_ms: backend_integration_u64(
                    integration,
                    "startupTimeoutMs",
                    1500,
                    250,
                    60000,
                ),
                capture_output: backend_integration_bool(integration, "captureOutput", true),
                notes: backend_integration_string(integration, "notes", ""),
                bundle_resource: backend_integration_bool(
                    integration,
                    "bundleResource",
                    default_bundle_resource,
                ),
                methods: backend_integration_methods(integration),
            });
        }
    }

    integrations
}

pub(super) fn backend_integrations_need_ffi_loader(
    integrations: &[GeneratedBackendIntegration],
) -> bool {
    integrations
        .iter()
        .any(|integration| integration.transport == "ffi" || integration.kind == "cpp-ffi")
}

pub(super) fn sanitize_rust_ident(value: &str) -> String {
    let mut ident = value
        .trim()
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '_' {
                ch
            } else {
                '_'
            }
        })
        .collect::<String>();

    while ident
        .chars()
        .next()
        .is_some_and(|ch| !ch.is_ascii_alphabetic() && ch != '_')
    {
        ident.remove(0);
    }

    if ident.is_empty() {
        ident = DEFAULT_RUST_COMMAND_NAME.to_string();
    }

    if matches!(
        ident.as_str(),
        "as" | "break"
            | "const"
            | "continue"
            | "crate"
            | "else"
            | "enum"
            | "extern"
            | "false"
            | "fn"
            | "for"
            | "if"
            | "impl"
            | "in"
            | "let"
            | "loop"
            | "match"
            | "mod"
            | "move"
            | "mut"
            | "pub"
            | "ref"
            | "return"
            | "self"
            | "Self"
            | "static"
            | "struct"
            | "super"
            | "trait"
            | "true"
            | "type"
            | "unsafe"
            | "use"
            | "where"
            | "while"
    ) {
        ident.push_str("_command");
    }

    ident
}

pub(super) fn safe_file_name(name: &str) -> String {
    let sanitized = name
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '-' || ch == '_' || ch == '.' {
                ch
            } else {
                '-'
            }
        })
        .collect::<String>();
    if sanitized.is_empty() {
        "Untitled.ui".to_string()
    } else {
        sanitized
    }
}

pub(super) fn slugify(value: &str) -> String {
    let mut slug = value
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() {
                ch.to_ascii_lowercase()
            } else {
                '-'
            }
        })
        .collect::<String>()
        .split('-')
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("-");
    if slug.is_empty() {
        slug = "nova-generated-app".to_string();
    }
    slug
}

pub(super) fn rust_source(rust_logic: &str) -> String {
    if rust_logic.trim().is_empty() {
        DEFAULT_RUST_LOGIC.to_string()
    } else {
        rust_logic.to_string()
    }
}

pub(super) fn rust_module_source(source: &str) -> String {
    if source.trim().is_empty() {
        "\n".to_string()
    } else if source.ends_with('\n') {
        source.to_string()
    } else {
        format!("{source}\n")
    }
}
