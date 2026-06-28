use serde_json::Value;

fn integration_field(integration: &Value, key: &str, fallback: &str) -> String {
    integration
        .get(key)
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(fallback)
        .to_string()
}

pub(super) fn generated_backend_integrations_readme(
    project_name: &str,
    integrations: &Value,
) -> String {
    let mut output = format!(
        r#"# {project_name} Backend Integrations

Rust/Tauri is the primary backend for this generated app. Use this folder to track bounded native integrations that Rust calls through FFI or launches as sidecar/local services.

Nova's generated file plan also creates missing starter folders for C++ FFI and sidecar/local-service integrations. Starter files are create-only: once you edit backend code, future generated-file applies will not overwrite those files unless you delete them first.

"#
    );

    let Some(items) = integrations.as_array() else {
        output.push_str("No backend integrations are configured.\n");
        return output;
    };

    if items.is_empty() {
        output.push_str("No backend integrations are configured.\n");
        return output;
    }

    for (index, integration) in items.iter().enumerate() {
        let name = integration_field(
            integration,
            "name",
            if index == 0 {
                "Rust Tauri backend"
            } else {
                "Backend integration"
            },
        );
        let enabled = integration
            .get("enabled")
            .and_then(Value::as_bool)
            .unwrap_or(true);
        let status = if enabled { "enabled" } else { "disabled" };
        let kind = integration_field(integration, "kind", "rust-native");
        let language = integration_field(integration, "language", "rust");
        let transport = integration_field(integration, "transport", "tauri-invoke");
        let entry_path = integration_field(integration, "entryPath", "not set");
        let artifact_path = integration_field(integration, "artifactPath", "not set");
        let resource_path = integration_field(integration, "resourcePath", "not set");
        let bundle_resource = integration
            .get("bundleResource")
            .and_then(Value::as_bool)
            .unwrap_or(matches!(kind.as_str(), "sidecar" | "local-service"));
        let command = integration_field(integration, "command", "not set");
        let health_check_command = integration_field(integration, "healthCheckCommand", "not set");
        let startup_timeout_ms = integration
            .get("startupTimeoutMs")
            .and_then(Value::as_u64)
            .unwrap_or(1500);
        let capture_output = integration
            .get("captureOutput")
            .and_then(Value::as_bool)
            .unwrap_or(true);
        let notes = integration_field(integration, "notes", "No notes.");
        let method_lines = integration
            .get("methods")
            .and_then(Value::as_array)
            .map(|methods| {
                methods
                    .iter()
                    .enumerate()
                    .map(|(method_index, method)| {
                        let method_name = integration_field(
                            method,
                            "name",
                            if method_index == 0 {
                                "process_event"
                            } else {
                                "backend_method"
                            },
                        );
                        let operation = integration_field(method, "operation", &method_name);
                        let path = integration_field(method, "path", "/process");
                        let request_schema = integration_field(method, "requestSchema", "{}");
                        let response_schema = integration_field(
                            method,
                            "responseSchema",
                            r#"{"success":true,"message":"ok","patch":{}}"#,
                        );
                        format!(
                            "- `{method_name}`: operation `{operation}`, path `{path}`\n  - Request schema: `{request_schema}`\n  - Response schema: `{response_schema}`"
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n")
            })
            .filter(|value| !value.trim().is_empty())
            .unwrap_or_else(|| "- `process_event`: operation `process_event`, path `/process`".to_string());

        output.push_str(&format!(
            r#"## {name}

- Status: {status}
- Kind: {kind}
- Language: {language}
- Transport: {transport}
- Entry path: `{entry_path}`
- Artifact path: `{artifact_path}`
- Bundle resource: {bundle_resource}
- Resource target: `{resource_path}`
- Command/call point: `{command}`
- Health check: `{health_check_command}`
- Startup timeout: {startup_timeout_ms} ms
- Capture output: {capture_output}

### Methods

{method_lines}

{notes}

"#
        ));
    }

    output.push_str(
        "Keep external runtimes optional and project-scoped. C++ FFI integrations should export nova_backend_process(const char*) and return a Nova JSON envelope. JSON-over-stdio integrations should read one JSON payload from stdin and write either a Nova JSON envelope or any JSON/text response to stdout. HTTP integrations should expose a local http:// endpoint that accepts POST application/json. gRPC and local-socket entries are tracked here but need concrete protocol adapters before runtime calls can succeed. If a subsystem must become mandatory for builds, add the Rust wrapper, Cargo build script, and release smoke checks alongside this plan.\n",
    );
    output
}

pub(super) fn generated_project_readme(project_name: &str) -> String {
    format!(
        r#"# {project_name}
This project is managed by Nova UI Editor.

- `nova.project.json` stores the editor workspace.
- `ui/` stores individual UI files as JSON.
- `assets/` stores imported project resources copied from their source files.
- `rust/logic.rs` stores the editable Rust logic source.
- `rust/modules/` stores project Rust modules.
- `rust/commands.json` stores the Rust command registry used by Tauri invoke handlers.
- `rust/dependencies.json` stores project-managed Cargo dependencies.
- `backend/integrations.json` stores Rust-managed C++ FFI, sidecar, or local-service integration plans.
- `backend/<integration>/` stores create-only starter code for C++ FFI or sidecar/local-service integrations when configured.
- `app/src-tauri/src/backend_integrations.rs` stores generated wrapper/launcher templates and the backend integration status data source.
- `app/` is the generated Tauri application that can be built into an executable.
"#
    )
}
