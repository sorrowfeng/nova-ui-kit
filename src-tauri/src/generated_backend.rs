use crate::{json_string, GeneratedBackendIntegration, GeneratedBackendMethod};

fn generated_backend_integration_plan_entries(
    integrations: &[GeneratedBackendIntegration],
) -> String {
    integrations
        .iter()
        .map(|integration| {
            let methods = generated_backend_method_plan_entries(&integration.methods);
            format!(
                r#"    BackendIntegrationPlan {{
        id: {},
        name: {},
        kind: {},
        language: {},
        transport: {},
        entry_path: {},
        artifact_path: {},
        resource_path: {},
        command: {},
        health_check_command: {},
        startup_timeout_ms: {},
        capture_output: {},
        notes: {},
        bundle_resource: {},
        methods: &[
{methods}
        ],
    }}"#,
                json_string(&integration.id),
                json_string(&integration.name),
                json_string(&integration.kind),
                json_string(&integration.language),
                json_string(&integration.transport),
                json_string(&integration.entry_path),
                json_string(&integration.artifact_path),
                json_string(&integration.resource_path),
                json_string(&integration.command),
                json_string(&integration.health_check_command),
                integration.startup_timeout_ms,
                integration.capture_output,
                json_string(&integration.notes),
                integration.bundle_resource
            )
        })
        .collect::<Vec<_>>()
        .join(",\n")
}

fn generated_backend_method_plan_entries(methods: &[GeneratedBackendMethod]) -> String {
    methods
        .iter()
        .map(|method| {
            format!(
                r#"            BackendIntegrationMethodPlan {{
                id: {},
                name: {},
                operation: {},
                path: {},
                description: {},
                request_schema: {},
                response_schema: {},
            }}"#,
                json_string(&method.id),
                json_string(&method.name),
                json_string(&method.operation),
                json_string(&method.path),
                json_string(&method.description),
                json_string(&method.request_schema),
                json_string(&method.response_schema),
            )
        })
        .collect::<Vec<_>>()
        .join(",\n")
}

fn generated_backend_integration_helpers(integrations: &[GeneratedBackendIntegration]) -> String {
    integrations
        .iter()
        .enumerate()
        .map(|(index, integration)| {
            let function_name = &integration.function_name;
            let helper = match integration.kind.as_str() {
                "cpp-ffi" => format!(
                    r#"pub fn {function_name}_ffi_status() -> Result<String, String> {{
    let plan = {function_name}_plan();
    Ok(format!(
        "C++ FFI integration '{{}}' will call nova_backend_process from {{}}.",
        plan.name,
        if plan.bundle_resource && !plan.resource_path.is_empty() {{ plan.resource_path }} else {{ plan.artifact_path }}
    ))
}}"#
                ),
                "sidecar" | "local-service" => format!(
                    r#"pub fn {function_name}_command() -> std::process::Command {{
    build_sidecar_command({function_name}_plan())
}}

pub fn {function_name}_resource_path<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
) -> Result<std::path::PathBuf, String> {{
    bundled_resource_path(app, {function_name}_plan())
}}

pub fn {function_name}_bundled_command<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
) -> Result<std::process::Command, String> {{
    build_bundled_sidecar_command(app, {function_name}_plan())
}}"#
                ),
                _ => format!(
                    r#"pub fn {function_name}_status() -> String {{
    let plan = {function_name}_plan();
    format!("Rust native integration '{{}}' is available through {{}}.", plan.name, plan.transport)
}}"#
                ),
            };
            format!(
                r#"pub fn {function_name}_plan() -> &'static BackendIntegrationPlan {{
    &BACKEND_INTEGRATIONS[{index}]
}}

{helper}
"#
            )
        })
        .collect::<Vec<_>>()
        .join("\n")
}

pub(super) fn generated_backend_integrations_rs(
    integrations: &[GeneratedBackendIntegration],
) -> String {
    let entries = generated_backend_integration_plan_entries(integrations);
    let helpers = generated_backend_integration_helpers(integrations);
    let needs_ffi_loader = integrations
        .iter()
        .any(|integration| integration.transport == "ffi" || integration.kind == "cpp-ffi");
    let ffi_call_branch = if needs_ffi_loader {
        r#""ffi" => call_ffi_integration(app, plan, payload),"#
    } else {
        r#""ffi" => unsupported_backend_call(plan, "C++ FFI calls need libloading enabled before runtime invocation."),"#
    };
    let ffi_call_function = if needs_ffi_loader {
        r#"
fn call_ffi_integration<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    plan: &BackendIntegrationPlan,
    payload: serde_json::Value,
) -> String {
    let log_path = backend_runtime_log_path(plan).ok();
    if let Some(path) = log_path.as_deref() {
        append_backend_runtime_log(path, format!("Calling C++ FFI integration with payload: {}", payload));
    }
    let library_path = if plan.bundle_resource {
        match bundled_resource_path(app, plan) {
            Ok(path) => path,
            Err(error) => return backend_call_error(plan.name, error, log_path.as_deref()),
        }
    } else if !plan.artifact_path.trim().is_empty() {
        std::path::PathBuf::from(plan.artifact_path)
    } else {
        return backend_call_error(
            plan.name,
            "C++ FFI integration needs artifactPath or bundled resourcePath before runtime invocation.",
            log_path.as_deref(),
        );
    };
    let request = match std::ffi::CString::new(payload.to_string()) {
        Ok(value) => value,
        Err(_) => {
            return backend_call_error(
                plan.name,
                "C++ FFI request contains an interior NUL byte.",
                log_path.as_deref(),
            );
        }
    };
    let raw_response = unsafe {
        let library = match libloading::Library::new(&library_path) {
            Ok(library) => library,
            Err(error) => {
                return backend_call_error(
                    plan.name,
                    format!("Failed to load C++ FFI library {}: {}", library_path.display(), error),
                    log_path.as_deref(),
                );
            }
        };
        type NovaBackendProcess = unsafe extern "C" fn(*const std::ffi::c_char) -> *const std::ffi::c_char;
        let function: libloading::Symbol<NovaBackendProcess> = match library.get(b"nova_backend_process\0") {
            Ok(function) => function,
            Err(error) => {
                return backend_call_error(
                    plan.name,
                    format!("C++ FFI symbol nova_backend_process was not found: {}", error),
                    log_path.as_deref(),
                );
            }
        };
        let response_ptr = function(request.as_ptr());
        if response_ptr.is_null() {
            return backend_call_error(
                plan.name,
                "C++ FFI function returned a null response pointer.",
                log_path.as_deref(),
            );
        }
        std::ffi::CStr::from_ptr(response_ptr).to_string_lossy().to_string()
    };
    if let Some(path) = log_path.as_deref() {
        append_backend_runtime_log(path, format!("ffi response: {}", raw_response));
    }
    backend_call_success(
        plan,
        format!("{} responded through C++ FFI.", plan.name),
        raw_response,
        log_path.as_deref(),
    )
}
"#
    } else {
        ""
    };
    format!(
        r#"pub struct BackendIntegrationMethodPlan {{
    pub id: &'static str,
    pub name: &'static str,
    pub operation: &'static str,
    pub path: &'static str,
    pub description: &'static str,
    pub request_schema: &'static str,
    pub response_schema: &'static str,
}}

pub struct BackendIntegrationPlan {{
    pub id: &'static str,
    pub name: &'static str,
    pub kind: &'static str,
    pub language: &'static str,
    pub transport: &'static str,
    pub entry_path: &'static str,
    pub artifact_path: &'static str,
    pub resource_path: &'static str,
    pub command: &'static str,
    pub health_check_command: &'static str,
    pub startup_timeout_ms: u64,
    pub capture_output: bool,
    pub notes: &'static str,
    pub bundle_resource: bool,
    pub methods: &'static [BackendIntegrationMethodPlan],
}}

pub const BACKEND_INTEGRATIONS: &[BackendIntegrationPlan] = &[
{entries}
];

pub fn integration_summary() -> Vec<String> {{
    BACKEND_INTEGRATIONS
        .iter()
        .map(|plan| {{
            format!(
                "{{}} · {{}} · {{}} via {{}} · {{}}",
                plan.name,
                plan.kind,
                plan.language,
                plan.transport,
                if plan.bundle_resource && !plan.resource_path.is_empty() {{
                    plan.resource_path
                }} else if plan.entry_path.is_empty() {{
                    "entry not set"
                }} else {{
                    plan.entry_path
                }}
            )
        }})
        .collect()
}}

pub fn integration_by_id(id: &str) -> Option<&'static BackendIntegrationPlan> {{
    BACKEND_INTEGRATIONS.iter().find(|plan| plan.id == id)
}}

pub fn build_sidecar_command(plan: &BackendIntegrationPlan) -> std::process::Command {{
    let command_line = if plan.command.is_empty() {{
        if plan.bundle_resource && !plan.resource_path.is_empty() {{
            plan.resource_path
        }} else if !plan.artifact_path.is_empty() {{
            plan.artifact_path
        }} else {{
            plan.entry_path
        }}
    }} else {{
        plan.command
    }};
    let mut parts = command_line.split_whitespace();
    let program = parts.next().unwrap_or(command_line);
    let mut command = std::process::Command::new(program);
    command.args(parts);
    command
}}

pub fn bundled_resource_path<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    plan: &BackendIntegrationPlan,
) -> Result<std::path::PathBuf, String> {{
    if !plan.bundle_resource || plan.resource_path.is_empty() {{
        return Err(format!("Backend integration '{{}}' is not configured as a bundled resource.", plan.name));
    }}
    use tauri::Manager;
    app.path()
        .resolve(plan.resource_path, tauri::path::BaseDirectory::Resource)
        .map_err(|error| error.to_string())
}}

pub fn build_bundled_sidecar_command<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    plan: &BackendIntegrationPlan,
) -> Result<std::process::Command, String> {{
    let resource_path = bundled_resource_path(app, plan)?;
    let resource = resource_path.display().to_string();
    let command_line = if plan.command.is_empty() {{
        resource
    }} else {{
        plan.command.replace("{{resource}}", &resource)
    }};
    let mut parts = command_line.split_whitespace();
    let program = parts.next().unwrap_or(&command_line);
    let mut command = std::process::Command::new(program);
    command.args(parts);
    Ok(command)
}}

pub fn probe_integrations<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
) -> Vec<serde_json::Value> {{
    BACKEND_INTEGRATIONS
        .iter()
        .map(|plan| probe_integration(app, plan))
        .collect()
}}

pub fn probe_integration<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    plan: &BackendIntegrationPlan,
) -> serde_json::Value {{
    let started = std::time::Instant::now();
    if plan.kind == "rust-native" {{
        return serde_json::json!({{
            "id": plan.id,
            "name": plan.name,
            "kind": plan.kind,
            "language": plan.language,
            "transport": plan.transport,
            "status": "ready",
            "message": "Rust/Tauri backend is available in-process.",
            "durationMs": 0,
            "resourcePath": plan.resource_path,
        }});
    }}
    if plan.health_check_command.is_empty() {{
        return serde_json::json!({{
            "id": plan.id,
            "name": plan.name,
            "kind": plan.kind,
            "language": plan.language,
            "transport": plan.transport,
            "status": "skipped",
            "message": "No health check command configured.",
            "durationMs": 0,
            "resourcePath": plan.resource_path,
        }});
    }}
    match build_health_check_command(app, plan) {{
        Ok(mut command) => run_health_check_with_timeout(plan, &mut command, started),
        Err(error) => serde_json::json!({{
            "id": plan.id,
            "name": plan.name,
            "kind": plan.kind,
            "language": plan.language,
            "transport": plan.transport,
            "status": "error",
            "message": error,
            "durationMs": started.elapsed().as_millis(),
            "resourcePath": plan.resource_path,
        }}),
    }}
}}

pub fn build_health_check_command<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    plan: &BackendIntegrationPlan,
) -> Result<std::process::Command, String> {{
    let mut command_line = plan.health_check_command.to_string();
    if command_line.contains("{{resource}}") {{
        let resource_path = bundled_resource_path(app, plan)?;
        command_line = command_line.replace("{{resource}}", &resource_path.display().to_string());
    }}
    let mut parts = command_line.split_whitespace();
    let Some(program) = parts.next() else {{
        return Err(format!("Backend integration '{{}}' has an empty health check command.", plan.name));
    }};
    let mut command = std::process::Command::new(program);
    command.args(parts);
    Ok(command)
}}

fn run_health_check_with_timeout(
    plan: &BackendIntegrationPlan,
    command: &mut std::process::Command,
    started: std::time::Instant,
) -> serde_json::Value {{
    if plan.capture_output {{
        command.stdout(std::process::Stdio::piped());
        command.stderr(std::process::Stdio::piped());
    }} else {{
        command.stdout(std::process::Stdio::null());
        command.stderr(std::process::Stdio::null());
    }}
    let timeout = std::time::Duration::from_millis(plan.startup_timeout_ms.max(250));
    let mut child = match command.spawn() {{
        Ok(child) => child,
        Err(error) => {{
            return serde_json::json!({{
                "id": plan.id,
                "name": plan.name,
                "kind": plan.kind,
                "language": plan.language,
                "transport": plan.transport,
                "status": "error",
                "message": format!("Failed to start health check: {{}}", error),
                "durationMs": started.elapsed().as_millis(),
                "resourcePath": plan.resource_path,
            }});
        }}
    }};

    loop {{
        match child.try_wait() {{
            Ok(Some(status)) => {{
                let (stdout, stderr) = read_child_output(&mut child, plan.capture_output);
                let success = status.success();
                return serde_json::json!({{
                    "id": plan.id,
                    "name": plan.name,
                    "kind": plan.kind,
                    "language": plan.language,
                    "transport": plan.transport,
                    "status": if success {{ "ready" }} else {{ "error" }},
                    "message": if success {{ "Health check passed." }} else {{ "Health check exited with an error." }},
                    "exitCode": status.code(),
                    "durationMs": started.elapsed().as_millis(),
                    "stdout": stdout,
                    "stderr": stderr,
                    "resourcePath": plan.resource_path,
                }});
            }}
            Ok(None) => {{
                if started.elapsed() >= timeout {{
                    let _ = child.kill();
                    let _ = child.wait();
                    let (stdout, stderr) = read_child_output(&mut child, plan.capture_output);
                    return serde_json::json!({{
                        "id": plan.id,
                        "name": plan.name,
                        "kind": plan.kind,
                        "language": plan.language,
                        "transport": plan.transport,
                        "status": "timeout",
                        "message": format!("Health check exceeded {{}} ms and was stopped.", plan.startup_timeout_ms),
                        "durationMs": started.elapsed().as_millis(),
                        "stdout": stdout,
                        "stderr": stderr,
                        "resourcePath": plan.resource_path,
                    }});
                }}
                std::thread::sleep(std::time::Duration::from_millis(25));
            }}
            Err(error) => {{
                return serde_json::json!({{
                    "id": plan.id,
                    "name": plan.name,
                    "kind": plan.kind,
                    "language": plan.language,
                    "transport": plan.transport,
                    "status": "error",
                    "message": format!("Failed while polling health check: {{}}", error),
                    "durationMs": started.elapsed().as_millis(),
                    "resourcePath": plan.resource_path,
                }});
            }}
        }}
    }}
}}

fn read_child_output(child: &mut std::process::Child, capture_output: bool) -> (String, String) {{
    if !capture_output {{
        return (String::new(), String::new());
    }}
    use std::io::Read;
    let mut stdout = String::new();
    let mut stderr = String::new();
    if let Some(mut stream) = child.stdout.take() {{
        let _ = stream.read_to_string(&mut stdout);
    }}
    if let Some(mut stream) = child.stderr.take() {{
        let _ = stream.read_to_string(&mut stderr);
    }}
    (trim_probe_output(stdout), trim_probe_output(stderr))
}}

fn trim_probe_output(value: String) -> String {{
    const LIMIT: usize = 4096;
    if value.len() <= LIMIT {{
        return value;
    }}
    let mut trimmed = value.chars().take(LIMIT).collect::<String>();
    trimmed.push_str("\n...[truncated]");
    trimmed
}}

#[derive(Default)]
pub struct BackendProcessRegistry {{
    processes: std::sync::Mutex<std::collections::BTreeMap<String, ManagedBackendProcess>>,
}}

pub struct ManagedBackendProcess {{
    pub pid: u32,
    pub started_at_ms: u128,
    pub log_path: String,
    pub child: std::process::Child,
}}

fn now_millis() -> u128 {{
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or(0)
}}

fn process_runtime_value(
    plan: &BackendIntegrationPlan,
    status: &str,
    pid: Option<u32>,
    started_at_ms: Option<u128>,
    message: String,
) -> serde_json::Value {{
    process_runtime_value_with_log(plan, status, pid, started_at_ms, message, "")
}}

fn process_runtime_value_with_log(
    plan: &BackendIntegrationPlan,
    status: &str,
    pid: Option<u32>,
    started_at_ms: Option<u128>,
    message: String,
    log_path: &str,
) -> serde_json::Value {{
    serde_json::json!({{
        "id": plan.id,
        "name": plan.name,
        "kind": plan.kind,
        "transport": plan.transport,
        "status": status,
        "pid": pid,
        "startedAtMs": started_at_ms,
        "message": message,
        "resourcePath": plan.resource_path,
        "logPath": log_path,
    }})
}}

fn startable_process(plan: &BackendIntegrationPlan) -> bool {{
    matches!(plan.kind, "sidecar" | "local-service")
}}

fn safe_runtime_file_name(value: &str) -> String {{
    let safe = value
        .chars()
        .map(|character| {{
            if character.is_ascii_alphanumeric() || matches!(character, '-' | '_' | '.') {{
                character
            }} else {{
                '-'
            }}
        }})
        .collect::<String>()
        .trim_matches('-')
        .to_string();
    if safe.is_empty() {{
        "backend".to_string()
    }} else {{
        safe
    }}
}}

fn backend_runtime_log_dir() -> Result<std::path::PathBuf, String> {{
    let directory = std::env::temp_dir()
        .join("nova-ui-generated-runtime")
        .join("backend");
    std::fs::create_dir_all(&directory)
        .map_err(|error| format!("Failed to create backend runtime log directory: {{}}", error))?;
    Ok(directory)
}}

fn backend_runtime_log_path(plan: &BackendIntegrationPlan) -> Result<String, String> {{
    let directory = backend_runtime_log_dir()?;
    let file_name = format!("{{}}-{{}}.log", safe_runtime_file_name(plan.id), now_millis());
    Ok(directory.join(file_name).display().to_string())
}}

fn append_backend_runtime_log(log_path: &str, message: impl AsRef<str>) {{
    use std::io::Write;
    if log_path.is_empty() {{
        return;
    }}
    if let Ok(mut file) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_path)
    {{
        let _ = writeln!(file, "[{{}}] {{}}", now_millis(), message.as_ref());
    }}
}}

fn attach_backend_process_output(
    command: &mut std::process::Command,
    plan: &BackendIntegrationPlan,
    log_path: &str,
) -> Result<(), String> {{
    if plan.capture_output {{
        let stdout = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(log_path)
            .map_err(|error| format!("Failed to open backend stdout log: {{}}", error))?;
        let stderr = stdout
            .try_clone()
            .map_err(|error| format!("Failed to clone backend stderr log: {{}}", error))?;
        command.stdout(std::process::Stdio::from(stdout));
        command.stderr(std::process::Stdio::from(stderr));
    }} else {{
        command.stdout(std::process::Stdio::null());
        command.stderr(std::process::Stdio::null());
    }}
    Ok(())
}}

fn validate_backend_runtime_log_path(log_path: &str) -> Result<std::path::PathBuf, String> {{
    if log_path.trim().is_empty() {{
        return Err("Backend runtime log path is empty.".to_string());
    }}
    let directory = backend_runtime_log_dir()?;
    let canonical_directory = directory
        .canonicalize()
        .map_err(|error| format!("Failed to resolve backend runtime log directory: {{}}", error))?;
    let path = std::path::PathBuf::from(log_path);
    let canonical_path = path
        .canonicalize()
        .map_err(|error| format!("Failed to resolve backend runtime log path: {{}}", error))?;
    if !canonical_path.starts_with(&canonical_directory) {{
        return Err("Backend runtime log must live inside Nova's generated runtime log directory.".to_string());
    }}
    if canonical_path.extension().and_then(|value| value.to_str()) != Some("log") {{
        return Err("Backend runtime log must be a .log file.".to_string());
    }}
    Ok(canonical_path)
}}

pub fn read_runtime_log(log_path: &str) -> serde_json::Value {{
    let path = match validate_backend_runtime_log_path(log_path) {{
        Ok(path) => path,
        Err(error) => {{
            return serde_json::json!({{
                "success": false,
                "message": error,
                "logPath": log_path,
                "content": "",
                "truncated": false,
                "lengthBytes": 0,
            }});
        }}
    }};
    let metadata = match std::fs::metadata(&path) {{
        Ok(metadata) => metadata,
        Err(error) => {{
            return serde_json::json!({{
                "success": false,
                "message": format!("Failed to read backend runtime log metadata: {{}}", error),
                "logPath": path.display().to_string(),
                "content": "",
                "truncated": false,
                "lengthBytes": 0,
            }});
        }}
    }};
    const LIMIT: u64 = 16 * 1024;
    let length = metadata.len();
    let start = length.saturating_sub(LIMIT);
    let mut file = match std::fs::File::open(&path) {{
        Ok(file) => file,
        Err(error) => {{
            return serde_json::json!({{
                "success": false,
                "message": format!("Failed to open backend runtime log: {{}}", error),
                "logPath": path.display().to_string(),
                "content": "",
                "truncated": false,
                "lengthBytes": length,
            }});
        }}
    }};
    use std::io::{{Read, Seek}};
    if start > 0 {{
        let _ = file.seek(std::io::SeekFrom::Start(start));
    }}
    let mut buffer = Vec::new();
    if let Err(error) = file.read_to_end(&mut buffer) {{
        return serde_json::json!({{
            "success": false,
            "message": format!("Failed to read backend runtime log: {{}}", error),
            "logPath": path.display().to_string(),
            "content": "",
            "truncated": start > 0,
            "lengthBytes": length,
        }});
    }}
    serde_json::json!({{
        "success": true,
        "message": if start > 0 {{ "Showing the latest backend runtime log output." }} else {{ "Showing backend runtime log output." }},
        "logPath": path.display().to_string(),
        "content": String::from_utf8_lossy(&buffer).to_string(),
        "truncated": start > 0,
        "lengthBytes": length,
    }})
}}

pub fn open_runtime_log(log_path: &str) -> serde_json::Value {{
    let path = match validate_backend_runtime_log_path(log_path) {{
        Ok(path) => path,
        Err(error) => {{
            return serde_json::json!({{
                "success": false,
                "message": error,
                "logPath": log_path,
            }});
        }}
    }};
    #[cfg(target_os = "windows")]
    let mut command = {{
        let mut command = std::process::Command::new("cmd");
        command.args(["/C", "start", "", &path.display().to_string()]);
        command
    }};
    #[cfg(target_os = "macos")]
    let mut command = {{
        let mut command = std::process::Command::new("open");
        command.arg(&path);
        command
    }};
    #[cfg(all(not(target_os = "windows"), not(target_os = "macos")))]
    let mut command = {{
        let mut command = std::process::Command::new("xdg-open");
        command.arg(&path);
        command
    }};
    command.stdout(std::process::Stdio::null());
    command.stderr(std::process::Stdio::null());
    match command.spawn() {{
        Ok(_) => serde_json::json!({{
            "success": true,
            "message": "Opened backend runtime log.",
            "logPath": path.display().to_string(),
        }}),
        Err(error) => serde_json::json!({{
            "success": false,
            "message": format!("Failed to open backend runtime log: {{}}", error),
            "logPath": path.display().to_string(),
        }}),
    }}
}}

pub fn call_integration<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    integration_id: &str,
    payload: serde_json::Value,
) -> String {{
    let Some(plan) = integration_by_id(integration_id) else {{
        return backend_call_error(integration_id, "Backend integration was not found.", None);
    }};
    if let Some(method_id) = payload.get("methodId").and_then(serde_json::Value::as_str) {{
        if !plan.methods.iter().any(|method| method.id == method_id) {{
            return backend_call_error(
                plan.name,
                format!("Backend method '{{}}' is not declared on {{}}.", method_id, plan.name),
                None,
            );
        }}
    }}
    match plan.transport {{
        "stdio" => call_stdio_integration(app, plan, payload),
        "http" => call_http_integration(plan, payload),
        "tauri-invoke" => serde_json::json!({{
            "success": true,
            "message": format!("{{}} is handled by Rust/Tauri commands in-process.", plan.name),
            "patch": {{
                "statusText": format!("{{}} · Rust/Tauri command ready", plan.name)
            }}
        }})
        .to_string(),
        {ffi_call_branch}
        "grpc" => unsupported_backend_call(plan, "gRPC calls need a generated client adapter such as tonic before runtime invocation."),
        "local-socket" => unsupported_backend_call(plan, "Local socket calls need a socket framing adapter before runtime invocation."),
        _ => unsupported_backend_call(plan, "This backend transport does not have a generated call adapter yet."),
    }}
}}

{ffi_call_function}

fn backend_call_error(target: &str, message: impl Into<String>, log_path: Option<&str>) -> String {{
    let message = message.into();
    serde_json::json!({{
        "success": false,
        "message": message,
        "error": message,
        "logPath": log_path.unwrap_or(""),
        "patch": {{
            "statusText": format!("Backend call failed: {{}}", target)
        }}
    }})
    .to_string()
}}

fn unsupported_backend_call(plan: &BackendIntegrationPlan, message: &str) -> String {{
    serde_json::json!({{
        "success": false,
        "message": format!("{{}}: {{}}", plan.name, message),
        "error": message,
        "transport": plan.transport,
        "patch": {{
            "statusText": format!("{{}} · adapter required", plan.name)
        }}
    }})
    .to_string()
}}

fn backend_call_success(
    plan: &BackendIntegrationPlan,
    message: String,
    raw_output: String,
    log_path: Option<&str>,
) -> String {{
    let trimmed = raw_output.trim();
    if let Ok(value) = serde_json::from_str::<serde_json::Value>(trimmed) {{
        if value.get("success").is_some() || value.get("message").is_some() || value.get("patch").is_some() {{
            return value.to_string();
        }}
        return serde_json::json!({{
            "success": true,
            "message": message,
            "response": value,
            "logPath": log_path.unwrap_or(""),
            "patch": {{
                "statusText": format!("{{}} · response received", plan.name)
            }}
        }})
        .to_string();
    }}
    let output_message = if trimmed.is_empty() {{
        message
    }} else {{
        trimmed.to_string()
    }};
    serde_json::json!({{
        "success": true,
        "message": output_message,
        "stdout": trimmed,
        "logPath": log_path.unwrap_or(""),
        "patch": {{
            "statusText": format!("{{}} · response received", plan.name)
        }}
    }})
    .to_string()
}}

fn call_stdio_integration<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    plan: &BackendIntegrationPlan,
    payload: serde_json::Value,
) -> String {{
    let log_path = backend_runtime_log_path(plan).ok();
    if let Some(path) = log_path.as_deref() {{
        append_backend_runtime_log(path, format!("Calling stdio integration with payload: {{}}", payload));
    }}
    let mut command = if plan.bundle_resource {{
        match build_bundled_sidecar_command(app, plan) {{
            Ok(command) => command,
            Err(error) => return backend_call_error(plan.name, error, log_path.as_deref()),
        }}
    }} else {{
        build_sidecar_command(plan)
    }};
    command.stdin(std::process::Stdio::piped());
    command.stdout(std::process::Stdio::piped());
    command.stderr(std::process::Stdio::piped());
    let mut child = match command.spawn() {{
        Ok(child) => child,
        Err(error) => return backend_call_error(plan.name, format!("Failed to start backend call: {{}}", error), log_path.as_deref()),
    }};
    if let Some(mut stdin) = child.stdin.take() {{
        use std::io::Write;
        if let Err(error) = writeln!(stdin, "{{}}", payload) {{
            let _ = child.kill();
            let _ = child.wait();
            return backend_call_error(plan.name, format!("Failed to write backend payload: {{}}", error), log_path.as_deref());
        }}
    }}
    let timeout = std::time::Duration::from_millis(plan.startup_timeout_ms.max(250));
    let started = std::time::Instant::now();
    loop {{
        match child.try_wait() {{
            Ok(Some(status)) => {{
                let (stdout, stderr) = read_child_output(&mut child, true);
                if let Some(path) = log_path.as_deref() {{
                    append_backend_runtime_log(path, format!("stdio exit {{:?}}", status.code()));
                    if !stdout.is_empty() {{
                        append_backend_runtime_log(path, format!("stdout: {{}}", stdout));
                    }}
                    if !stderr.is_empty() {{
                        append_backend_runtime_log(path, format!("stderr: {{}}", stderr));
                    }}
                }}
                if status.success() {{
                    return backend_call_success(
                        plan,
                        format!("{{}} responded over stdio.", plan.name),
                        stdout,
                        log_path.as_deref(),
                    );
                }}
                let detail = if stderr.trim().is_empty() {{ stdout }} else {{ stderr }};
                return backend_call_error(
                    plan.name,
                    format!("Backend stdio call exited with code {{:?}}: {{}}", status.code(), detail),
                    log_path.as_deref(),
                );
            }}
            Ok(None) => {{
                if started.elapsed() >= timeout {{
                    let _ = child.kill();
                    let _ = child.wait();
                    if let Some(path) = log_path.as_deref() {{
                        append_backend_runtime_log(path, "stdio call timed out");
                    }}
                    return backend_call_error(
                        plan.name,
                        format!("Backend stdio call exceeded {{}} ms.", plan.startup_timeout_ms),
                        log_path.as_deref(),
                    );
                }}
                std::thread::sleep(std::time::Duration::from_millis(25));
            }}
            Err(error) => {{
                return backend_call_error(
                    plan.name,
                    format!("Failed while polling backend stdio call: {{}}", error),
                    log_path.as_deref(),
                );
            }}
        }}
    }}
}}

fn call_http_integration(plan: &BackendIntegrationPlan, payload: serde_json::Value) -> String {{
    let base_endpoint = if plan.command.trim().is_empty() {{ plan.entry_path }} else {{ plan.command }};
    let method_path = payload
        .get("path")
        .and_then(serde_json::Value::as_str)
        .map(str::trim)
        .filter(|value| value.starts_with('/'))
        .unwrap_or("");
    let endpoint = if method_path.is_empty() {{
        base_endpoint.to_string()
    }} else {{
        format!("{{}}{{}}", base_endpoint.trim_end_matches('/'), method_path)
    }};
    let (host, port, path) = match parse_http_endpoint(&endpoint) {{
        Ok(parts) => parts,
        Err(error) => return backend_call_error(plan.name, error, None),
    }};
    let body = payload.to_string();
    let timeout = std::time::Duration::from_millis(plan.startup_timeout_ms.max(250));
    let mut stream = match std::net::TcpStream::connect((host.as_str(), port)) {{
        Ok(stream) => stream,
        Err(error) => return backend_call_error(plan.name, format!("Failed to connect to {{}}:{{}}: {{}}", host, port, error), None),
    }};
    let _ = stream.set_read_timeout(Some(timeout));
    let _ = stream.set_write_timeout(Some(timeout));
    let request = format!(
        "POST {{}} HTTP/1.1\r\nHost: {{}}\r\nContent-Type: application/json\r\nAccept: application/json\r\nContent-Length: {{}}\r\nConnection: close\r\n\r\n{{}}",
        path,
        host,
        body.as_bytes().len(),
        body
    );
    use std::io::{{Read, Write}};
    if let Err(error) = stream.write_all(request.as_bytes()) {{
        return backend_call_error(plan.name, format!("Failed to write HTTP backend request: {{}}", error), None);
    }}
    let mut response = String::new();
    if let Err(error) = stream.read_to_string(&mut response) {{
        return backend_call_error(plan.name, format!("Failed to read HTTP backend response: {{}}", error), None);
    }}
    let status_line = response.lines().next().unwrap_or("");
    let status_code = status_line
        .split_whitespace()
        .nth(1)
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(0);
    let body = response
        .split_once("\r\n\r\n")
        .map(|(_, body)| body.to_string())
        .unwrap_or_else(|| response.clone());
    if (200..300).contains(&status_code) {{
        backend_call_success(
            plan,
            format!("{{}} responded over HTTP {{}}.", plan.name, status_code),
            body,
            None,
        )
    }} else {{
        backend_call_error(
            plan.name,
            format!("HTTP backend call returned status {{}}: {{}}", status_code, body),
            None,
        )
    }}
}}

fn parse_http_endpoint(endpoint: &str) -> Result<(String, u16, String), String> {{
    let Some(rest) = endpoint.trim().strip_prefix("http://") else {{
        return Err("HTTP backend calls currently require an http:// local endpoint in the Command/call point field.".to_string());
    }};
    let (host_port, path) = rest.split_once('/').unwrap_or((rest, ""));
    if host_port.trim().is_empty() {{
        return Err("HTTP backend endpoint is missing a host.".to_string());
    }}
    let (host, port) = match host_port.rsplit_once(':') {{
        Some((host, port)) if !host.is_empty() => {{
            let port = port
                .parse::<u16>()
                .map_err(|_| "HTTP backend endpoint has an invalid port.".to_string())?;
            (host.to_string(), port)
        }}
        _ => (host_port.to_string(), 80),
    }};
    let path = if path.is_empty() {{ "/".to_string() }} else {{ format!("/{{}}", path) }};
    Ok((host, port, path))
}}

pub fn runtime_status(registry: &BackendProcessRegistry) -> Vec<serde_json::Value> {{
    let mut processes = registry.processes.lock().unwrap_or_else(|error| error.into_inner());
    BACKEND_INTEGRATIONS
        .iter()
        .map(|plan| {{
            if !startable_process(plan) {{
                return process_runtime_value(
                    plan,
                    "skipped",
                    None,
                    None,
                    "This backend integration does not run as a managed sidecar process.".to_string(),
                );
            }}
            match processes.get_mut(plan.id) {{
                Some(process) => match process.child.try_wait() {{
                    Ok(Some(status)) => {{
                        append_backend_runtime_log(
                            &process.log_path,
                            format!("Process exited with code {{:?}}.", status.code()),
                        );
                        process_runtime_value_with_log(
                            plan,
                            "exited",
                            Some(process.pid),
                            Some(process.started_at_ms),
                            format!("Process exited with code {{:?}}.", status.code()),
                            &process.log_path,
                        )
                    }},
                    Ok(None) => process_runtime_value_with_log(
                        plan,
                        "running",
                        Some(process.pid),
                        Some(process.started_at_ms),
                        "Process is running.".to_string(),
                        &process.log_path,
                    ),
                    Err(error) => process_runtime_value_with_log(
                        plan,
                        "error",
                        Some(process.pid),
                        Some(process.started_at_ms),
                        format!("Failed to inspect process: {{}}", error),
                        &process.log_path,
                    ),
                }},
                None => process_runtime_value(
                    plan,
                    "stopped",
                    None,
                    None,
                    "Process is not running.".to_string(),
                ),
            }}
        }})
        .collect()
}}

pub fn start_integration<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    registry: &BackendProcessRegistry,
    integration_id: &str,
) -> serde_json::Value {{
    let Some(plan) = integration_by_id(integration_id) else {{
        return serde_json::json!({{
            "id": integration_id,
            "name": integration_id,
            "kind": "unknown",
            "transport": "unknown",
            "status": "error",
            "message": "Backend integration was not found.",
        }});
    }};
    if !startable_process(plan) {{
        return process_runtime_value(
            plan,
            "skipped",
            None,
            None,
            "This backend integration does not run as a managed sidecar process.".to_string(),
        );
    }}

    {{
        let mut processes = registry.processes.lock().unwrap_or_else(|error| error.into_inner());
        let mut remove_existing = false;
        if let Some(process) = processes.get_mut(plan.id) {{
            match process.child.try_wait() {{
                Ok(None) => {{
                    return process_runtime_value_with_log(
                        plan,
                        "running",
                        Some(process.pid),
                        Some(process.started_at_ms),
                        "Process is already running.".to_string(),
                        &process.log_path,
                    );
                }}
                Ok(Some(_)) | Err(_) => {{
                    remove_existing = true;
                }}
            }}
        }}
        if remove_existing {{
            processes.remove(plan.id);
        }}
    }}

    let mut command = if plan.bundle_resource {{
        match build_bundled_sidecar_command(app, plan) {{
            Ok(command) => command,
            Err(error) => {{
                return process_runtime_value(plan, "error", None, None, error);
            }}
        }}
    }} else {{
        build_sidecar_command(plan)
    }};
    let log_path = match backend_runtime_log_path(plan) {{
        Ok(path) => path,
        Err(error) => {{
            return process_runtime_value(plan, "error", None, None, error);
        }}
    }};
    append_backend_runtime_log(&log_path, format!("Starting process: {{:?}}", command));
    if let Err(error) = attach_backend_process_output(&mut command, plan, &log_path) {{
        append_backend_runtime_log(&log_path, &error);
        return process_runtime_value_with_log(plan, "error", None, None, error, &log_path);
    }}
    match command.spawn() {{
        Ok(child) => {{
            let pid = child.id();
            let started_at_ms = now_millis();
            append_backend_runtime_log(&log_path, format!("Process started with pid {{}}.", pid));
            let mut processes = registry.processes.lock().unwrap_or_else(|error| error.into_inner());
            processes.insert(
                plan.id.to_string(),
                ManagedBackendProcess {{
                    pid,
                    started_at_ms,
                    log_path: log_path.clone(),
                    child,
                }},
            );
            process_runtime_value_with_log(
                plan,
                "running",
                Some(pid),
                Some(started_at_ms),
                "Process started.".to_string(),
                &log_path,
            )
        }}
        Err(error) => {{
            append_backend_runtime_log(&log_path, format!("Failed to start process: {{}}", error));
            process_runtime_value_with_log(
                plan,
                "error",
                None,
                None,
                format!("Failed to start process: {{}}", error),
                &log_path,
            )
        }},
    }}
}}

pub fn stop_integration(
    registry: &BackendProcessRegistry,
    integration_id: &str,
) -> serde_json::Value {{
    let Some(plan) = integration_by_id(integration_id) else {{
        return serde_json::json!({{
            "id": integration_id,
            "name": integration_id,
            "kind": "unknown",
            "transport": "unknown",
            "status": "error",
            "message": "Backend integration was not found.",
        }});
    }};
    let mut processes = registry.processes.lock().unwrap_or_else(|error| error.into_inner());
    let Some(mut process) = processes.remove(plan.id) else {{
        return process_runtime_value(
            plan,
            "stopped",
            None,
            None,
            "Process was not running.".to_string(),
        );
    }};
    let _ = process.child.kill();
    let _ = process.child.wait();
    append_backend_runtime_log(&process.log_path, "Process stopped by generated app.");
    process_runtime_value_with_log(
        plan,
        "stopped",
        Some(process.pid),
        Some(process.started_at_ms),
        "Process stopped.".to_string(),
        &process.log_path,
    )
}}

{helpers}
"#
    )
}
