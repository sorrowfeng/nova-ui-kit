use crate::{
    backend_artifact_source, backend_integrations, managed_project_root, project_name,
    BackendMethodTestResult, GeneratedBackendIntegration, GeneratedBackendMethod,
};
use serde_json::Value;
use std::{
    ffi::{c_char, CStr, CString},
    io::{Read, Write},
    path::{Path, PathBuf},
    process::{Command, Stdio},
};

#[tauri::command]
pub(super) fn test_backend_integration_method(
    project: Value,
    integration_id: String,
    method_id: String,
    sample_payload: Value,
) -> Result<BackendMethodTestResult, String> {
    let started = std::time::Instant::now();
    let project_name = project_name(&project);
    let root = project
        .get("rootPath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from)
        .map(Ok)
        .unwrap_or_else(|| managed_project_root(&project_name))?;
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
    let method = integration
        .methods
        .iter()
        .find(|method| method.id == method_id)
        .ok_or_else(|| {
            format!(
                "Backend method '{}' is not declared on {}.",
                method_id, integration.name
            )
        })?;
    let request = serde_json::json!({
        "methodId": method.id,
        "method": method.name,
        "operation": method.operation,
        "path": method.path,
        "payload": sample_payload,
    });

    let (success, status, summary, response, raw_response, error) =
        match integration.transport.as_str() {
            "tauri-invoke" => {
                let response = serde_json::json!({
                    "success": true,
                    "message": format!("{} / {} is handled by Rust/Tauri commands in-process.", integration.name, method.name),
                    "patch": {
                        "statusText": format!("{} · {} ready", integration.name, method.name)
                    }
                });
                (
                    true,
                    "passed".to_string(),
                    format!(
                        "{} / {} is ready through Rust/Tauri invoke.",
                        integration.name, method.name
                    ),
                    response,
                    None,
                    None,
                )
            }
            "stdio" => editor_call_stdio_backend_method(&root, integration, method, &request),
            "http" => editor_call_http_backend_method(integration, method, &request),
            "ffi" => editor_call_ffi_backend_method(&root, integration, method, &request),
            "grpc" => editor_unsupported_backend_method(
                integration,
                method,
                "gRPC calls need a generated Rust client adapter such as tonic before Nova can call them from the editor.",
            ),
            "local-socket" => editor_unsupported_backend_method(
                integration,
                method,
                "Local socket calls need a socket framing adapter before Nova can call them from the editor.",
            ),
            _ => editor_unsupported_backend_method(
                integration,
                method,
                "This backend transport does not have an editor-side call adapter yet.",
            ),
        };

    Ok(BackendMethodTestResult {
        success,
        status,
        integration_id: integration.id.clone(),
        integration_name: integration.name.clone(),
        method_id: method.id.clone(),
        method_name: method.name.clone(),
        transport: integration.transport.clone(),
        duration_ms: started.elapsed().as_millis(),
        summary,
        request,
        response,
        raw_response,
        error,
    })
}

fn editor_unsupported_backend_method(
    integration: &GeneratedBackendIntegration,
    method: &GeneratedBackendMethod,
    message: &str,
) -> (bool, String, String, Value, Option<String>, Option<String>) {
    let summary = format!("{} / {}: {}", integration.name, method.name, message);
    (
        false,
        "failed".to_string(),
        summary.clone(),
        serde_json::json!({
            "success": false,
            "message": summary,
            "error": message,
            "transport": integration.transport,
        }),
        None,
        Some(message.to_string()),
    )
}

fn editor_call_stdio_backend_method(
    root: &Path,
    integration: &GeneratedBackendIntegration,
    method: &GeneratedBackendMethod,
    request: &Value,
) -> (bool, String, String, Value, Option<String>, Option<String>) {
    let mut command = match editor_backend_command(root, integration) {
        Ok(command) => command,
        Err(error) => {
            return editor_backend_test_error(integration, method, error, None);
        }
    };
    command
        .current_dir(root)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }
    let mut child = match command.spawn() {
        Ok(child) => child,
        Err(error) => {
            return editor_backend_test_error(
                integration,
                method,
                format!("Failed to start backend method test: {error}"),
                None,
            );
        }
    };
    if let Some(mut stdin) = child.stdin.take() {
        if let Err(error) = writeln!(stdin, "{request}") {
            let _ = child.kill();
            let _ = child.wait();
            return editor_backend_test_error(
                integration,
                method,
                format!("Failed to write backend payload: {error}"),
                None,
            );
        }
    }

    let timeout = std::time::Duration::from_millis(integration.startup_timeout_ms.max(250));
    let started = std::time::Instant::now();
    loop {
        match child.try_wait() {
            Ok(Some(status)) => {
                let mut stdout = String::new();
                let mut stderr = String::new();
                if let Some(mut stream) = child.stdout.take() {
                    let _ = stream.read_to_string(&mut stdout);
                }
                if let Some(mut stream) = child.stderr.take() {
                    let _ = stream.read_to_string(&mut stderr);
                }
                let raw = stdout.trim().to_string();
                if status.success() {
                    return editor_backend_test_success(
                        integration,
                        method,
                        format!(
                            "{} / {} responded over stdio.",
                            integration.name, method.name
                        ),
                        raw,
                    );
                }
                let detail = if stderr.trim().is_empty() {
                    stdout
                } else {
                    stderr
                };
                return editor_backend_test_error(
                    integration,
                    method,
                    format!(
                        "Backend stdio method exited with code {:?}: {}",
                        status.code(),
                        detail.trim()
                    ),
                    Some(raw),
                );
            }
            Ok(None) => {
                if started.elapsed() >= timeout {
                    let _ = child.kill();
                    let _ = child.wait();
                    return editor_backend_test_error(
                        integration,
                        method,
                        format!(
                            "Backend stdio method exceeded {} ms.",
                            integration.startup_timeout_ms
                        ),
                        None,
                    );
                }
                std::thread::sleep(std::time::Duration::from_millis(25));
            }
            Err(error) => {
                return editor_backend_test_error(
                    integration,
                    method,
                    format!("Failed while polling backend stdio method: {error}"),
                    None,
                );
            }
        }
    }
}

fn editor_call_http_backend_method(
    integration: &GeneratedBackendIntegration,
    method: &GeneratedBackendMethod,
    request: &Value,
) -> (bool, String, String, Value, Option<String>, Option<String>) {
    let base_endpoint = if integration.command.trim().is_empty() {
        integration.entry_path.trim()
    } else {
        integration.command.trim()
    };
    let endpoint = if method.path.trim().starts_with('/') {
        format!(
            "{}{}",
            base_endpoint.trim_end_matches('/'),
            method.path.trim()
        )
    } else {
        base_endpoint.to_string()
    };
    let (host, port, path) = match editor_parse_http_endpoint(&endpoint) {
        Ok(parts) => parts,
        Err(error) => return editor_backend_test_error(integration, method, error, None),
    };
    let body = request.to_string();
    let timeout = std::time::Duration::from_millis(integration.startup_timeout_ms.max(250));
    let mut stream = match std::net::TcpStream::connect((host.as_str(), port)) {
        Ok(stream) => stream,
        Err(error) => {
            return editor_backend_test_error(
                integration,
                method,
                format!("Failed to connect to {host}:{port}: {error}"),
                None,
            );
        }
    };
    let _ = stream.set_read_timeout(Some(timeout));
    let _ = stream.set_write_timeout(Some(timeout));
    let http_request = format!(
        "POST {} HTTP/1.1\r\nHost: {}\r\nContent-Type: application/json\r\nAccept: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
        path,
        host,
        body.len(),
        body
    );
    if let Err(error) = stream.write_all(http_request.as_bytes()) {
        return editor_backend_test_error(
            integration,
            method,
            format!("Failed to write HTTP backend request: {error}"),
            None,
        );
    }
    let mut response = String::new();
    if let Err(error) = stream.read_to_string(&mut response) {
        return editor_backend_test_error(
            integration,
            method,
            format!("Failed to read HTTP backend response: {error}"),
            None,
        );
    }
    let status_line = response.lines().next().unwrap_or("");
    let status_code = status_line
        .split_whitespace()
        .nth(1)
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(0);
    let body = response
        .split_once("\r\n\r\n")
        .map(|(_, body)| body.trim().to_string())
        .unwrap_or_else(|| response.trim().to_string());
    if (200..300).contains(&status_code) {
        editor_backend_test_success(
            integration,
            method,
            format!(
                "{} / {} responded over HTTP {}.",
                integration.name, method.name, status_code
            ),
            body,
        )
    } else {
        editor_backend_test_error(
            integration,
            method,
            format!("HTTP backend method returned status {status_code}: {body}"),
            Some(body),
        )
    }
}

fn editor_call_ffi_backend_method(
    root: &Path,
    integration: &GeneratedBackendIntegration,
    method: &GeneratedBackendMethod,
    request: &Value,
) -> (bool, String, String, Value, Option<String>, Option<String>) {
    let Some(library_path) = backend_artifact_source(integration, root).or_else(|| {
        if integration.artifact_path.trim().is_empty() {
            None
        } else {
            Some(resolve_editor_backend_program(
                root,
                &integration.artifact_path,
            ))
        }
    }) else {
        return editor_backend_test_error(
            integration,
            method,
            "C++ FFI artifactPath does not resolve to a library file.",
            None,
        );
    };
    let payload = match CString::new(request.to_string()) {
        Ok(payload) => payload,
        Err(_) => {
            return editor_backend_test_error(
                integration,
                method,
                "C++ FFI request contains an interior NUL byte.",
                None,
            );
        }
    };
    let raw = unsafe {
        let library = match libloading::Library::new(&library_path) {
            Ok(library) => library,
            Err(error) => {
                return editor_backend_test_error(
                    integration,
                    method,
                    format!(
                        "Failed to load C++ FFI library {}: {error}",
                        library_path.display()
                    ),
                    None,
                );
            }
        };
        let function: libloading::Symbol<unsafe extern "C" fn(*const c_char) -> *const c_char> =
            match library.get(b"nova_backend_process\0") {
                Ok(function) => function,
                Err(error) => {
                    return editor_backend_test_error(
                        integration,
                        method,
                        format!("C++ FFI symbol nova_backend_process was not found: {error}"),
                        None,
                    );
                }
            };
        let response_ptr = function(payload.as_ptr());
        if response_ptr.is_null() {
            return editor_backend_test_error(
                integration,
                method,
                "C++ FFI function returned a null response pointer.",
                None,
            );
        }
        CStr::from_ptr(response_ptr).to_string_lossy().to_string()
    };
    editor_backend_test_success(
        integration,
        method,
        format!(
            "{} / {} responded through C++ FFI.",
            integration.name, method.name
        ),
        raw,
    )
}

fn editor_backend_test_success(
    _integration: &GeneratedBackendIntegration,
    _method: &GeneratedBackendMethod,
    summary: String,
    raw: String,
) -> (bool, String, String, Value, Option<String>, Option<String>) {
    let response = if raw.trim().is_empty() {
        serde_json::json!({
            "success": true,
            "message": summary,
        })
    } else {
        serde_json::from_str::<Value>(raw.trim()).unwrap_or_else(|_| {
            serde_json::json!({
                "success": true,
                "message": raw.trim(),
                "stdout": raw.trim(),
            })
        })
    };
    let success = response
        .get("success")
        .and_then(Value::as_bool)
        .unwrap_or(true);
    let error = if success {
        None
    } else {
        response
            .get("error")
            .and_then(Value::as_str)
            .or_else(|| response.get("message").and_then(Value::as_str))
            .map(str::to_string)
    };
    (
        success,
        if success { "passed" } else { "failed" }.to_string(),
        response
            .get("message")
            .and_then(Value::as_str)
            .map(str::to_string)
            .unwrap_or(summary),
        response,
        Some(raw),
        error,
    )
}

fn editor_backend_test_error(
    integration: &GeneratedBackendIntegration,
    method: &GeneratedBackendMethod,
    message: impl Into<String>,
    raw: Option<String>,
) -> (bool, String, String, Value, Option<String>, Option<String>) {
    let message = message.into();
    (
        false,
        "failed".to_string(),
        format!("{} / {} failed: {}", integration.name, method.name, message),
        serde_json::json!({
            "success": false,
            "message": message,
            "error": message,
        }),
        raw,
        Some(message),
    )
}

fn editor_backend_command(
    root: &Path,
    integration: &GeneratedBackendIntegration,
) -> Result<Command, String> {
    let resource = backend_artifact_source(integration, root)
        .map(|path| path.display().to_string())
        .or_else(|| {
            if !integration.artifact_path.trim().is_empty() {
                Some(integration.artifact_path.clone())
            } else if !integration.resource_path.trim().is_empty() {
                Some(root.join(&integration.resource_path).display().to_string())
            } else {
                None
            }
        });
    let mut command_line = if integration.command.trim().is_empty() {
        resource
            .clone()
            .or_else(|| {
                if integration.entry_path.trim().is_empty() {
                    None
                } else {
                    Some(integration.entry_path.clone())
                }
            })
            .ok_or_else(|| {
                format!(
                    "Backend integration '{}' needs a command, artifactPath, or entryPath before stdio testing.",
                    integration.name
                )
            })?
    } else {
        integration.command.clone()
    };
    if let Some(resource) = resource {
        command_line = command_line.replace("{resource}", &resource);
    }
    let parts = split_command_line(&command_line)?;
    let Some(program) = parts.first() else {
        return Err(format!(
            "Backend integration '{}' has an empty command.",
            integration.name
        ));
    };
    let program_path = resolve_editor_backend_program(root, program);
    let mut command = Command::new(program_path);
    command.args(parts.iter().skip(1));
    Ok(command)
}

fn split_command_line(command_line: &str) -> Result<Vec<String>, String> {
    let mut parts = Vec::new();
    let mut current = String::new();
    let mut in_quote = false;
    let mut escaped = false;
    for ch in command_line.chars() {
        if escaped {
            current.push(ch);
            escaped = false;
            continue;
        }
        if ch == '\\' && in_quote {
            escaped = true;
            continue;
        }
        if ch == '"' {
            in_quote = !in_quote;
            continue;
        }
        if ch.is_whitespace() && !in_quote {
            if !current.is_empty() {
                parts.push(std::mem::take(&mut current));
            }
            continue;
        }
        current.push(ch);
    }
    if in_quote {
        return Err("Backend command has an unclosed quote.".to_string());
    }
    if !current.is_empty() {
        parts.push(current);
    }
    Ok(parts)
}

fn resolve_editor_backend_program(root: &Path, program: &str) -> PathBuf {
    let path = PathBuf::from(program);
    if path.is_absolute() || path.exists() {
        return path;
    }
    let root_path = root.join(&path);
    if root_path.exists() {
        return root_path;
    }
    let backend_path = root.join("backend").join(&path);
    if backend_path.exists() {
        return backend_path;
    }
    path
}

fn editor_parse_http_endpoint(endpoint: &str) -> Result<(String, u16, String), String> {
    let Some(rest) = endpoint.trim().strip_prefix("http://") else {
        return Err(
            "HTTP backend method tests currently require an http:// local endpoint in the Command/call point field."
                .to_string(),
        );
    };
    let (host_port, path) = rest.split_once('/').unwrap_or((rest, ""));
    if host_port.trim().is_empty() {
        return Err("HTTP backend endpoint is missing a host.".to_string());
    }
    let (host, port) = match host_port.rsplit_once(':') {
        Some((host, port)) if !host.is_empty() => {
            let port = port
                .parse::<u16>()
                .map_err(|_| "HTTP backend endpoint has an invalid port.".to_string())?;
            (host.to_string(), port)
        }
        _ => (host_port.to_string(), 80),
    };
    let path = if path.is_empty() {
        "/".to_string()
    } else {
        format!("/{path}")
    };
    Ok((host, port, path))
}
