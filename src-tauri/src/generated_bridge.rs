use crate::{
    backend_integrations, json_string, rust_source, sanitize_rust_ident, to_error,
    GeneratedBackendIntegration, GeneratedRustModule, DEFAULT_RUST_COMMAND_NAME,
};
use serde_json::Value;
fn rust_parameter_type(value: &Value) -> &'static str {
    match value.as_str().unwrap_or("string") {
        "bool" => "bool",
        "number" => "number",
        "json" => "json",
        _ => "string",
    }
}

fn rust_parameter_source(value: &Value) -> &'static str {
    match value.as_str().unwrap_or("value") {
        "checked" => "checked",
        "event" => "event",
        "itemId" => "itemId",
        "itemName" => "itemName",
        "state" => "state",
        "payload" => "payload",
        _ => "value",
    }
}

fn rust_command_parameter_schemas(command: &Value) -> Vec<Value> {
    let mut schemas = Vec::new();
    if let Some(parameters) = command.get("parameters").and_then(Value::as_array) {
        for (index, parameter) in parameters.iter().enumerate() {
            let fallback = if index == 0 { "value" } else { "arg" };
            let raw_name = parameter
                .get("name")
                .and_then(Value::as_str)
                .unwrap_or(fallback);
            let base_name = sanitize_rust_ident(raw_name);
            let mut name = base_name.clone();
            let mut suffix = 2;
            while schemas.iter().any(|schema: &Value| {
                schema.get("name").and_then(Value::as_str) == Some(name.as_str())
            }) {
                name = format!("{base_name}_{suffix}");
                suffix += 1;
            }
            schemas.push(serde_json::json!({
                "name": name,
                "type": rust_parameter_type(parameter.get("type").unwrap_or(&Value::Null)),
                "source": rust_parameter_source(parameter.get("source").unwrap_or(&Value::Null)),
            }));
        }
    }

    if schemas.is_empty()
        && command
            .get("acceptsValue")
            .and_then(Value::as_bool)
            .unwrap_or(false)
    {
        schemas.push(serde_json::json!({
            "name": "value",
            "type": "string",
            "source": "value",
        }));
    }

    schemas
}

fn string_path(command_result: &Value, key: &str, fallback: &str) -> String {
    command_result
        .get(key)
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .unwrap_or(fallback)
        .to_string()
}

fn rust_command_result_schema(command: &Value) -> Value {
    let Some(result) = command.get("result").filter(|value| value.is_object()) else {
        return serde_json::json!({ "mode": "text" });
    };
    if result.get("mode").and_then(Value::as_str) != Some("json") {
        return serde_json::json!({ "mode": "text" });
    }
    serde_json::json!({
        "mode": "json",
        "messagePath": string_path(result, "messagePath", "message"),
        "statePatchPath": string_path(result, "statePatchPath", "patch"),
        "successPath": string_path(result, "successPath", "success"),
        "errorPath": string_path(result, "errorPath", "error"),
    })
}

pub(super) fn generated_lib_module_block(
    modules: &[GeneratedRustModule],
    integrations: &[GeneratedBackendIntegration],
) -> String {
    let module_declarations = modules
        .iter()
        .map(|module| format!("mod {};", module.name))
        .collect::<Vec<_>>()
        .join("\n");
    let backend_module_declaration = if integrations.is_empty() {
        String::new()
    } else {
        "mod backend_integrations;".to_string()
    };
    let module_block = [module_declarations, backend_module_declaration]
        .into_iter()
        .filter(|declaration| !declaration.trim().is_empty())
        .collect::<Vec<_>>()
        .join("\n");
    if module_block.is_empty() {
        String::new()
    } else {
        format!("{module_block}\n\n")
    }
}

fn backend_status_command_name(
    command_names: &[String],
    integrations: &[GeneratedBackendIntegration],
) -> Option<String> {
    backend_generated_command_name(
        command_names,
        integrations,
        "nova_backend_integration_status",
    )
}

fn backend_probe_command_name(
    command_names: &[String],
    integrations: &[GeneratedBackendIntegration],
) -> Option<String> {
    backend_generated_command_name(
        command_names,
        integrations,
        "nova_backend_integration_probe",
    )
}

fn backend_start_command_name(
    command_names: &[String],
    integrations: &[GeneratedBackendIntegration],
) -> Option<String> {
    backend_generated_command_name(
        command_names,
        integrations,
        "nova_backend_integration_start",
    )
}

fn backend_stop_command_name(
    command_names: &[String],
    integrations: &[GeneratedBackendIntegration],
) -> Option<String> {
    backend_generated_command_name(command_names, integrations, "nova_backend_integration_stop")
}

fn backend_runtime_status_command_name(
    command_names: &[String],
    integrations: &[GeneratedBackendIntegration],
) -> Option<String> {
    backend_generated_command_name(
        command_names,
        integrations,
        "nova_backend_integration_runtime_status",
    )
}

fn backend_read_log_command_name(
    command_names: &[String],
    integrations: &[GeneratedBackendIntegration],
) -> Option<String> {
    backend_generated_command_name(
        command_names,
        integrations,
        "nova_backend_integration_read_log",
    )
}

fn backend_open_log_command_name(
    command_names: &[String],
    integrations: &[GeneratedBackendIntegration],
) -> Option<String> {
    backend_generated_command_name(
        command_names,
        integrations,
        "nova_backend_integration_open_log",
    )
}

fn backend_call_command_name(
    command_names: &[String],
    integrations: &[GeneratedBackendIntegration],
) -> Option<String> {
    backend_generated_command_name(command_names, integrations, "nova_backend_integration_call")
}

fn backend_generated_command_name(
    command_names: &[String],
    integrations: &[GeneratedBackendIntegration],
    base_name: &str,
) -> Option<String> {
    if integrations.is_empty() {
        return None;
    }
    let mut name = base_name.to_string();
    let mut suffix = 2;
    while command_names.iter().any(|command| command == &name) {
        name = format!("{base_name}_{suffix}");
        suffix += 1;
    }
    Some(name)
}

pub(super) fn generated_lib_rs(
    rust_logic: &str,
    command_names: &[String],
    modules: &[GeneratedRustModule],
    integrations: &[GeneratedBackendIntegration],
) -> String {
    let backend_status_command = backend_status_command_name(command_names, integrations);
    let backend_probe_command = backend_probe_command_name(command_names, integrations);
    let backend_start_command = backend_start_command_name(command_names, integrations);
    let backend_stop_command = backend_stop_command_name(command_names, integrations);
    let backend_runtime_status_command =
        backend_runtime_status_command_name(command_names, integrations);
    let backend_read_log_command = backend_read_log_command_name(command_names, integrations);
    let backend_open_log_command = backend_open_log_command_name(command_names, integrations);
    let backend_call_command = backend_call_command_name(command_names, integrations);
    let mut handler_names = if command_names.is_empty() {
        vec![DEFAULT_RUST_COMMAND_NAME.to_string()]
    } else {
        command_names.to_vec()
    };
    if let Some(command_name) = backend_status_command.as_ref() {
        handler_names.push(command_name.clone());
    }
    if let Some(command_name) = backend_probe_command.as_ref() {
        handler_names.push(command_name.clone());
    }
    if let Some(command_name) = backend_start_command.as_ref() {
        handler_names.push(command_name.clone());
    }
    if let Some(command_name) = backend_stop_command.as_ref() {
        handler_names.push(command_name.clone());
    }
    if let Some(command_name) = backend_runtime_status_command.as_ref() {
        handler_names.push(command_name.clone());
    }
    if let Some(command_name) = backend_read_log_command.as_ref() {
        handler_names.push(command_name.clone());
    }
    if let Some(command_name) = backend_open_log_command.as_ref() {
        handler_names.push(command_name.clone());
    }
    if let Some(command_name) = backend_call_command.as_ref() {
        handler_names.push(command_name.clone());
    }
    let handlers = handler_names.join(", ");
    let module_block = generated_lib_module_block(modules, integrations);
    let backend_status_command_block = backend_status_command
        .map(|command_name| {
            format!(
                r#"#[tauri::command]
fn {command_name}() -> Vec<String> {{
    backend_integrations::integration_summary()
}}

"#
            )
        })
        .unwrap_or_default();
    let backend_probe_command_block = backend_probe_command
        .map(|command_name| {
            format!(
                r#"#[tauri::command]
fn {command_name}(app: tauri::AppHandle) -> Vec<serde_json::Value> {{
    backend_integrations::probe_integrations(&app)
}}

"#
            )
        })
        .unwrap_or_default();
    let backend_start_command_block = backend_start_command
        .map(|command_name| {
            format!(
                r#"#[tauri::command]
fn {command_name}(
    app: tauri::AppHandle,
    registry: tauri::State<'_, backend_integrations::BackendProcessRegistry>,
    integration_id: String,
) -> serde_json::Value {{
    backend_integrations::start_integration(&app, registry.inner(), &integration_id)
}}

"#
            )
        })
        .unwrap_or_default();
    let backend_stop_command_block = backend_stop_command
        .map(|command_name| {
            format!(
                r#"#[tauri::command]
fn {command_name}(
    registry: tauri::State<'_, backend_integrations::BackendProcessRegistry>,
    integration_id: String,
) -> serde_json::Value {{
    backend_integrations::stop_integration(registry.inner(), &integration_id)
}}

"#
            )
        })
        .unwrap_or_default();
    let backend_runtime_status_command_block = backend_runtime_status_command
        .map(|command_name| {
            format!(
                r#"#[tauri::command]
fn {command_name}(
    registry: tauri::State<'_, backend_integrations::BackendProcessRegistry>,
) -> Vec<serde_json::Value> {{
    backend_integrations::runtime_status(registry.inner())
}}

"#
            )
        })
        .unwrap_or_default();
    let backend_read_log_command_block = backend_read_log_command
        .map(|command_name| {
            format!(
                r#"#[tauri::command]
fn {command_name}(log_path: String) -> serde_json::Value {{
    backend_integrations::read_runtime_log(&log_path)
}}

"#
            )
        })
        .unwrap_or_default();
    let backend_open_log_command_block = backend_open_log_command
        .map(|command_name| {
            format!(
                r#"#[tauri::command]
fn {command_name}(log_path: String) -> serde_json::Value {{
    backend_integrations::open_runtime_log(&log_path)
}}

"#
            )
        })
        .unwrap_or_default();
    let backend_call_command_block = backend_call_command
        .map(|command_name| {
            format!(
                r#"#[tauri::command]
fn {command_name}(
    app: tauri::AppHandle,
    integration_id: String,
    payload: serde_json::Value,
) -> String {{
    backend_integrations::call_integration(&app, &integration_id, payload)
}}

"#
            )
        })
        .unwrap_or_default();
    let backend_process_registry = if integrations.is_empty() {
        String::new()
    } else {
        ".manage(backend_integrations::BackendProcessRegistry::default())\n        ".to_string()
    };
    format!(
        r#"{module_block}{}{backend_status_command_block}{backend_probe_command_block}{backend_start_command_block}{backend_stop_command_block}{backend_runtime_status_command_block}{backend_read_log_command_block}{backend_open_log_command_block}{backend_call_command_block}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {{
    tauri::Builder::default()
        {backend_process_registry}.invoke_handler(tauri::generate_handler![{handlers}])
        .run(tauri::generate_context!())
        .expect("error while running generated application");
}}
"#,
        rust_source(rust_logic)
    )
}

pub(super) fn generated_project_data(
    project: &Value,
    command_names: &[String],
) -> Result<String, String> {
    let json = serde_json::to_string_pretty(project).map_err(to_error)?;
    let commands = serde_json::to_string_pretty(command_names).map_err(to_error)?;
    let integrations = backend_integrations(project);
    let backend_status_command =
        json_string(&backend_status_command_name(command_names, &integrations).unwrap_or_default());
    let backend_probe_command =
        json_string(&backend_probe_command_name(command_names, &integrations).unwrap_or_default());
    let backend_start_command =
        json_string(&backend_start_command_name(command_names, &integrations).unwrap_or_default());
    let backend_stop_command =
        json_string(&backend_stop_command_name(command_names, &integrations).unwrap_or_default());
    let backend_runtime_status_command = json_string(
        &backend_runtime_status_command_name(command_names, &integrations).unwrap_or_default(),
    );
    let backend_read_log_command = json_string(
        &backend_read_log_command_name(command_names, &integrations).unwrap_or_default(),
    );
    let backend_open_log_command = json_string(
        &backend_open_log_command_name(command_names, &integrations).unwrap_or_default(),
    );
    let backend_call_command =
        json_string(&backend_call_command_name(command_names, &integrations).unwrap_or_default());
    let mut bindings = serde_json::Map::new();
    let mut schemas = serde_json::Map::new();
    if let Some(raw_commands) = project.get("rustCommands").and_then(Value::as_array) {
        for (index, command) in raw_commands.iter().enumerate() {
            if let Some(id) = command.get("id").and_then(Value::as_str) {
                let name = command_names
                    .get(index)
                    .cloned()
                    .unwrap_or_else(|| DEFAULT_RUST_COMMAND_NAME.to_string());
                bindings.insert(id.to_string(), Value::String(name));
                schemas.insert(
                    id.to_string(),
                    serde_json::json!({
                        "parameters": rust_command_parameter_schemas(command),
                        "result": rust_command_result_schema(command),
                    }),
                );
            }
        }
    }
    let command_bindings = serde_json::to_string_pretty(&bindings).map_err(to_error)?;
    let command_schemas = serde_json::to_string_pretty(&schemas).map_err(to_error)?;
    Ok(format!(
        "export const project = {json} as const;\nexport const registeredRustCommands = {commands} as const;\nexport const backendIntegrationStatusCommand = {backend_status_command} as const;\nexport const backendIntegrationProbeCommand = {backend_probe_command} as const;\nexport const backendIntegrationStartCommand = {backend_start_command} as const;\nexport const backendIntegrationStopCommand = {backend_stop_command} as const;\nexport const backendIntegrationRuntimeStatusCommand = {backend_runtime_status_command} as const;\nexport const backendIntegrationReadLogCommand = {backend_read_log_command} as const;\nexport const backendIntegrationOpenLogCommand = {backend_open_log_command} as const;\nexport const backendIntegrationCallCommand = {backend_call_command} as const;\nexport const rustCommandBindings = {command_bindings} as const;\nexport const rustCommandSchemas = {command_schemas} as const;\n"
    ))
}
