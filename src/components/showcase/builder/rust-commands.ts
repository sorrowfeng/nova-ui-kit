import { activeBackendMethod } from "./backend";
import { createId } from "./ids";
import type {
  BackendIntegration,
  BackendIntegrationMethod,
  RustCommand,
  RustCommandParameter,
  RustCommandParameterSource,
  RustCommandParameterType,
  RustCommandResultSchema,
} from "./types";

const DEFAULT_RUST_COMMAND_NAME = "app_message";
export const DEFAULT_RUST_COMMAND_RESPONSE = "来自 Nova 生成 Rust 逻辑的消息";
export const DEFAULT_RUST_COMMANDS: RustCommand[] = [
  {
    id: "command-app-message",
    name: DEFAULT_RUST_COMMAND_NAME,
    response: DEFAULT_RUST_COMMAND_RESPONSE,
  },
];

export const rustParameterTypes: Array<{ value: RustCommandParameterType; label: string }> = [
  { value: "string", label: "String" },
  { value: "bool", label: "bool" },
  { value: "number", label: "f64" },
  { value: "json", label: "serde_json::Value" },
];

export const rustParameterSources: Array<{ value: RustCommandParameterSource; label: string }> = [
  { value: "value", label: "当前值" },
  { value: "checked", label: "选中状态" },
  { value: "event", label: "事件名称" },
  { value: "itemId", label: "控件 ID" },
  { value: "itemName", label: "控件名称" },
  { value: "state", label: "状态快照" },
  { value: "payload", label: "完整载荷" },
];

export const defaultRustCommandResult: RustCommandResultSchema = {
  mode: "text",
};

export const defaultJsonResultSchema: RustCommandResultSchema = {
  mode: "json",
  messagePath: "message",
  statePatchPath: "patch",
  successPath: "success",
  errorPath: "error",
};

export function sanitizeRustCommandName(value: string) {
  const candidate = value
    .trim()
    .replace(/[^A-Za-z0-9_]/g, "_")
    .replace(/^[^A-Za-z_]+/, "");
  return candidate || DEFAULT_RUST_COMMAND_NAME;
}

export function sanitizeRustParameterName(value: string, index = 0) {
  const fallback = index === 0 ? "value" : `arg_${index + 1}`;
  let candidate =
    value
      .trim()
      .replace(/[^A-Za-z0-9_]/g, "_")
      .replace(/^[^A-Za-z_]+/, "") || fallback;
  if (
    [
      "as",
      "break",
      "const",
      "continue",
      "crate",
      "else",
      "enum",
      "extern",
      "false",
      "fn",
      "for",
      "if",
      "impl",
      "in",
      "let",
      "loop",
      "match",
      "mod",
      "move",
      "mut",
      "pub",
      "ref",
      "return",
      "self",
      "Self",
      "static",
      "struct",
      "super",
      "trait",
      "true",
      "type",
      "unsafe",
      "use",
      "where",
      "while",
    ].includes(candidate)
  ) {
    candidate = `${candidate}_arg`;
  }
  return candidate;
}

export function createRustCommandParameter(index = 0, source: RustCommandParameterSource = "value"): RustCommandParameter {
  return {
    id: createId(),
    name: sanitizeRustParameterName(index === 0 ? "value" : `arg_${index + 1}`, index),
    type: source === "checked" ? "bool" : source === "state" || source === "payload" ? "json" : "string",
    source,
  };
}

function normalizeRustCommandParameters(value: unknown, useLegacyValue = false): RustCommandParameter[] {
  if (!Array.isArray(value) || value.length === 0) {
    return useLegacyValue
      ? [
          {
            id: "param-value",
            name: "value",
            type: "string",
            source: "value",
          },
        ]
      : [];
  }

  const names = new Set<string>();
  return value
    .map((rawParameter, index): RustCommandParameter | null => {
      if (!rawParameter || typeof rawParameter !== "object") {
        return null;
      }
      const parameter = rawParameter as Partial<RustCommandParameter>;
      let name = sanitizeRustParameterName(parameter.name || (index === 0 ? "value" : `arg_${index + 1}`), index);
      const baseName = name;
      let suffix = 2;
      while (names.has(name)) {
        name = `${baseName}_${suffix}`;
        suffix += 1;
      }
      names.add(name);
      const source = rustParameterSources.some((candidate) => candidate.value === parameter.source) ? parameter.source! : "value";
      return {
        id: parameter.id || createId(),
        name,
        type: rustParameterTypes.some((candidate) => candidate.value === parameter.type) ? parameter.type! : "string",
        source,
      };
    })
    .filter((parameter): parameter is RustCommandParameter => Boolean(parameter));
}

export function rustCommandParameters(command: RustCommand): RustCommandParameter[] {
  return normalizeRustCommandParameters(command.parameters, Boolean(command.acceptsValue));
}

export function rustCommandAcceptsArgs(command: RustCommand) {
  return rustCommandParameters(command).length > 0;
}

export function rustParameterTypeCode(type: RustCommandParameterType) {
  if (type === "bool") {
    return "bool";
  }
  if (type === "number") {
    return "f64";
  }
  if (type === "json") {
    return "serde_json::Value";
  }
  return "String";
}

function normalizeRustCommandResult(value: unknown): RustCommandResultSchema | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const result = value as Partial<RustCommandResultSchema>;
  if (result.mode !== "json") {
    return result.mode === "text" ? defaultRustCommandResult : undefined;
  }
  return {
    ...defaultJsonResultSchema,
    messagePath: result.messagePath || defaultJsonResultSchema.messagePath,
    statePatchPath: result.statePatchPath || defaultJsonResultSchema.statePatchPath,
    successPath: result.successPath || defaultJsonResultSchema.successPath,
    errorPath: result.errorPath || defaultJsonResultSchema.errorPath,
  };
}

export function commandResultSchema(command: RustCommand): RustCommandResultSchema {
  return normalizeRustCommandResult(command.result) ?? defaultRustCommandResult;
}

function escapeRustStringLiteral(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t");
}

function backendIntegrationPayloadExpression(parameters: RustCommandParameter[]) {
  const jsonPayload = parameters.find((parameter) => parameter.type === "json" && parameter.name === "payload");
  if (jsonPayload) {
    return jsonPayload.name;
  }
  if (parameters.length === 0) {
    return "serde_json::json!({})";
  }
  return `serde_json::json!({\n${parameters.map((parameter) => `        "${escapeRustStringLiteral(parameter.name)}": ${parameter.name}`).join(",\n")}\n    })`;
}

function createBackendIntegrationRustCommandSource(
  commandName: string,
  integration: BackendIntegration,
  method: BackendIntegrationMethod | null,
  parameters: RustCommandParameter[],
) {
  const id = escapeRustStringLiteral(integration.id);
  const signature = ["app: tauri::AppHandle", ...parameters.map((parameter) => `${parameter.name}: ${rustParameterTypeCode(parameter.type)}`)].join(", ");
  const payloadExpression = backendIntegrationPayloadExpression(parameters);
  const methodFields = method
    ? `\n        "methodId": "${escapeRustStringLiteral(method.id)}",\n        "method": "${escapeRustStringLiteral(method.name)}",\n        "operation": "${escapeRustStringLiteral(method.operation)}",\n        "path": "${escapeRustStringLiteral(method.path)}",\n        "payload": raw_payload`
    : `\n        "payload": raw_payload`;
  return `#[tauri::command]\nfn ${commandName}(${signature}) -> String {\n    let raw_payload = ${payloadExpression};\n    let payload = serde_json::json!({${methodFields}\n    });\n    backend_integrations::call_integration(&app, "${id}", payload)\n}`;
}

export function createRustLogic(commands: RustCommand[], backendIntegrations: BackendIntegration[] = []) {
  const safeCommands = commands.length > 0 ? commands : DEFAULT_RUST_COMMANDS;
  const enabledBackendIntegrations = new Map(
    backendIntegrations.filter((integration) => integration.enabled !== false).map((integration) => [integration.id, integration]),
  );
  const names = new Set<string>();
  return `${safeCommands
    .map((command) => {
      const baseName = sanitizeRustCommandName(command.name);
      let name = baseName;
      let suffix = 2;
      while (names.has(name)) {
        name = `${baseName}_${suffix}`;
        suffix += 1;
      }
      names.add(name);
      const response = escapeRustStringLiteral(command.response || DEFAULT_RUST_COMMAND_RESPONSE);
      const parameters = rustCommandParameters(command);
      const backendIntegration = command.backendIntegrationId ? enabledBackendIntegrations.get(command.backendIntegrationId) : null;
      if (backendIntegration) {
        const method =
          backendIntegration.methods.find((candidate) => candidate.id === command.backendIntegrationMethodId) ??
          backendIntegration.methods.find((candidate) => candidate.id === backendIntegration.activeMethodId) ??
          backendIntegration.methods[0] ??
          null;
        return createBackendIntegrationRustCommandSource(name, backendIntegration, method, parameters);
      }
      const resultSchema = commandResultSchema(command);
      if (parameters.length > 0) {
        const signature = parameters.map((parameter) => `${parameter.name}: ${rustParameterTypeCode(parameter.type)}`).join(", ");
        const debugValue =
          parameters.length === 1
            ? parameters[0].name
            : `(${parameters.map((parameter) => parameter.name).join(", ")})`;
        if (resultSchema.mode === "json") {
          return `#[tauri::command]\nfn ${name}(${signature}) -> String {\n    serde_json::json!({\n        "success": true,\n        "message": format!("{}: {:?}", "${response}", ${debugValue}),\n        "patch": {}\n    }).to_string()\n}`;
        }
        return `#[tauri::command]\nfn ${name}(${signature}) -> String {\n    format!("{}: {:?}", "${response}", ${debugValue})\n}`;
      }
      if (resultSchema.mode === "json") {
        return `#[tauri::command]\nfn ${name}() -> String {\n    serde_json::json!({\n        "success": true,\n        "message": "${response}",\n        "patch": {}\n    }).to_string()\n}`;
      }
      return `#[tauri::command]\nfn ${name}() -> String {\n    "${response}".to_string()\n}`;
    })
    .join("\n\n")}\n`;
}

export function createDefaultRustCommands(): RustCommand[] {
  return DEFAULT_RUST_COMMANDS.map((command) => ({
    ...command,
    id: createId(),
  }));
}

export function createRustCommand(index: number): RustCommand {
  return {
    id: createId(),
    name: `project_command_${index}`,
    response: `来自 project_command_${index} 的响应`,
  };
}

export function createBackendIntegrationCommand(
  integration: BackendIntegration,
  index: number,
  method: BackendIntegrationMethod | null = activeBackendMethod(integration),
): RustCommand {
  const methodName = method?.name ? `_${method.name}` : "";
  const commandName = sanitizeRustCommandName(`run_${integration.name || integration.kind || "backend_integration"}${methodName}`);
  return {
    id: createId(),
    name: commandName || `backend_integration_${index}`,
    response: `调用 ${integration.name || "后端集成"}${method ? ` / ${method.name}` : ""}`,
    acceptsValue: true,
    parameters: [
      {
        id: createId(),
        name: "payload",
        type: "json",
        source: "payload",
      },
    ],
    result: {
      ...defaultJsonResultSchema,
    },
    backendIntegrationId: integration.id,
    backendIntegrationMethodId: method?.id,
  };
}

export function normalizeRustCommands(value: unknown): RustCommand[] {
  if (!Array.isArray(value)) {
    return createDefaultRustCommands();
  }

  const names = new Set<string>();
  const commands = value
    .map((rawCommand, index): RustCommand | null => {
      if (!rawCommand || typeof rawCommand !== "object") {
        return null;
      }
      const command = rawCommand as Partial<RustCommand>;
      let name = sanitizeRustCommandName(command.name || (index === 0 ? DEFAULT_RUST_COMMAND_NAME : `project_command_${index + 1}`));
      while (names.has(name)) {
        name = `${name}_${index + 1}`;
      }
      names.add(name);
      const parameters = normalizeRustCommandParameters(command.parameters, Boolean(command.acceptsValue));
      const result = normalizeRustCommandResult(command.result);
      return {
        id: command.id || createId(),
        name,
        response: command.response || (index === 0 ? DEFAULT_RUST_COMMAND_RESPONSE : `来自 ${name} 的响应`),
        acceptsValue: parameters.length > 0,
        parameters: parameters.length > 0 ? parameters : undefined,
        result,
        backendIntegrationId: typeof command.backendIntegrationId === "string" && command.backendIntegrationId.trim() ? command.backendIntegrationId : undefined,
        backendIntegrationMethodId:
          typeof command.backendIntegrationMethodId === "string" && command.backendIntegrationMethodId.trim()
            ? command.backendIntegrationMethodId
            : undefined,
      };
    })
    .filter((command): command is RustCommand => Boolean(command));

  return commands.length > 0 ? commands : createDefaultRustCommands();
}
