import { clamp } from "./layout";
import { createId } from "./ids";
import type {
  BackendIntegration,
  BackendIntegrationKind,
  BackendIntegrationLanguage,
  BackendIntegrationMethod,
  BackendIntegrationTransport,
  BackendMethodTestRecord,
  CargoDependency,
  RustModule,
} from "./types";

type BackendIntegrationConfigFields = Pick<
  BackendIntegration,
  "kind" | "language" | "transport" | "entryPath" | "artifactPath" | "resourcePath" | "command" | "healthCheckCommand" | "startupTimeoutMs" | "captureOutput" | "notes" | "bundleResource"
>;

export type BackendIntegrationPreset = BackendIntegrationConfigFields & {
  starterDirectory: string;
  buildCommand: string;
  summary: string;
};

export const backendIntegrationKinds: { value: BackendIntegrationKind; label: string; description: string }[] = [
  { value: "rust-native", label: "Rust 原生", description: "默认 Tauri 后端，用 invoke 调用 Rust commands。" },
  { value: "cpp-ffi", label: "C++ FFI", description: "由 Rust 包一层 C ABI / C++ 静态库或动态库。" },
  { value: "sidecar", label: "Sidecar 进程", description: "由 Rust 启动外部进程，通过 stdio/socket/http 通信。" },
  { value: "local-service", label: "本地服务", description: "本地长期服务，适合 Go/Python/Node 或独立引擎。" },
];

export const backendIntegrationLanguages: { value: BackendIntegrationLanguage; label: string }[] = [
  { value: "rust", label: "Rust" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "python", label: "Python" },
  { value: "node", label: "Node.js" },
  { value: "other", label: "其他" },
];

export const backendIntegrationTransports: { value: BackendIntegrationTransport; label: string }[] = [
  { value: "tauri-invoke", label: "Tauri invoke" },
  { value: "ffi", label: "FFI" },
  { value: "stdio", label: "stdio" },
  { value: "http", label: "HTTP" },
  { value: "grpc", label: "gRPC" },
  { value: "local-socket", label: "本地 socket" },
];

export function sanitizeRustModuleName(value: string, index = 0) {
  const fallback = index === 0 ? "project_state" : `module_${index + 1}`;
  let candidate =
    value
      .trim()
      .replace(/[^A-Za-z0-9_]/g, "_")
      .replace(/^[^A-Za-z_]+/, "") || fallback;
  if (["crate", "self", "super", "mod", "fn", "use", "pub", "type"].includes(candidate)) {
    candidate = `${candidate}_module`;
  }
  return candidate;
}

export function createRustModule(index = 0): RustModule {
  const name = sanitizeRustModuleName(index === 0 ? "project_state" : `module_${index + 1}`, index);
  return {
    id: createId(),
    name,
    enabled: true,
    source:
      index === 0
        ? `pub fn app_label() -> &'static str {\n    "Nova 生成应用"\n}\n`
        : `pub fn ${name}_ready() -> bool {\n    true\n}\n`,
  };
}

export function normalizeRustModules(value: unknown): RustModule[] {
  if (!Array.isArray(value)) {
    return [createRustModule(0)];
  }

  const names = new Set<string>();
  const modules = value
    .map((rawModule, index): RustModule | null => {
      if (!rawModule || typeof rawModule !== "object") {
        return null;
      }
      const module = rawModule as Partial<RustModule>;
      const baseName = sanitizeRustModuleName(module.name || `module_${index + 1}`, index);
      let name = baseName;
      let suffix = 2;
      while (names.has(name)) {
        name = `${baseName}_${suffix}`;
        suffix += 1;
      }
      names.add(name);
      return {
        id: module.id || createId(),
        name,
        source: typeof module.source === "string" ? module.source : createRustModule(index).source,
        enabled: module.enabled !== false,
      };
    })
    .filter((module): module is RustModule => Boolean(module));

  return modules.length > 0 ? modules : [createRustModule(0)];
}

export function sanitizeCargoDependencyName(value: string, index = 0) {
  const fallback = index === 0 ? "serde" : `dependency-${index + 1}`;
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

export function normalizeCargoDependencyFeatures(value: unknown) {
  return typeof value === "string"
    ? value
        .split(",")
        .map((feature) => feature.trim())
        .filter(Boolean)
        .join(", ")
    : "";
}

export function createCargoDependency(index = 0): CargoDependency {
  return {
    id: createId(),
    name: index === 0 ? "serde" : `dependency-${index + 1}`,
    version: index === 0 ? "1" : "0.1",
    features: index === 0 ? "derive" : "",
    enabled: true,
  };
}

export function normalizeCargoDependencies(value: unknown): CargoDependency[] {
  if (!Array.isArray(value)) {
    return [createCargoDependency(0)];
  }

  const names = new Set<string>();
  const dependencies = value
    .map((rawDependency, index): CargoDependency | null => {
      if (!rawDependency || typeof rawDependency !== "object") {
        return null;
      }
      const dependency = rawDependency as Partial<CargoDependency>;
      const name = sanitizeCargoDependencyName(dependency.name || `dependency-${index + 1}`, index);
      if (["tauri", "tauri-build", "serde_json"].includes(name) || names.has(name)) {
        return null;
      }
      names.add(name);
      return {
        id: dependency.id || createId(),
        name,
        version: typeof dependency.version === "string" && dependency.version.trim() ? dependency.version.trim() : "1",
        features: normalizeCargoDependencyFeatures(dependency.features),
        enabled: dependency.enabled !== false,
      };
    })
    .filter((dependency): dependency is CargoDependency => Boolean(dependency));

  return dependencies.length > 0 ? dependencies : [createCargoDependency(0)];
}

export function sanitizeBackendIntegrationName(value: string, index = 0) {
  const fallback = index === 0 ? "Rust Tauri 后端" : `后端集成 ${index + 1}`;
  const name = value.trim().replace(/\s+/g, " ");
  return name || fallback;
}

export function backendIntegrationSlug(value: string, fallback = "backend-service") {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

export function backendIntegrationRustIdentifier(value: string, fallback = "backend_integration") {
  let candidate =
    value
      .trim()
      .replace(/[^A-Za-z0-9_]/g, "_")
      .replace(/^[^A-Za-z_]+/, "") || fallback;
  if (["crate", "self", "super", "mod", "fn", "use", "pub", "type"].includes(candidate)) {
    candidate = `${candidate}_integration`;
  }
  return candidate;
}

export function normalizeBackendIntegrationKind(value: unknown, fallback: BackendIntegrationKind = "rust-native"): BackendIntegrationKind {
  return backendIntegrationKinds.some((kind) => kind.value === value) ? (value as BackendIntegrationKind) : fallback;
}

export function normalizeBackendIntegrationLanguage(value: unknown, fallback: BackendIntegrationLanguage = "rust"): BackendIntegrationLanguage {
  return backendIntegrationLanguages.some((language) => language.value === value) ? (value as BackendIntegrationLanguage) : fallback;
}

export function normalizeBackendIntegrationTransport(value: unknown, fallback: BackendIntegrationTransport = "tauri-invoke"): BackendIntegrationTransport {
  return backendIntegrationTransports.some((transport) => transport.value === value) ? (value as BackendIntegrationTransport) : fallback;
}

export function recommendedBackendIntegrationPreset(
  source: Pick<BackendIntegration, "name" | "kind" | "language"> & Partial<Pick<BackendIntegration, "id" | "transport">>,
): BackendIntegrationPreset {
  const kind = normalizeBackendIntegrationKind(source.kind);
  const language = normalizeBackendIntegrationLanguage(source.language, kind === "cpp-ffi" ? "cpp" : kind === "rust-native" ? "rust" : "go");
  const slug = backendIntegrationSlug(source.id || source.name);
  const functionName = backendIntegrationRustIdentifier(`${source.name || slug}_${kind}`);
  const starterDirectory = `backend/${slug}`;

  if (kind === "rust-native") {
    return {
      kind,
      language: "rust",
      transport: "tauri-invoke",
      entryPath: "src-tauri/src/lib.rs",
      artifactPath: "",
      resourcePath: "",
      command: "tauri::Builder invoke_handler",
      healthCheckCommand: "",
      startupTimeoutMs: 1000,
      captureOutput: false,
      notes: "默认 Nova 后端：文件系统、生成、构建编排和原生系统集成都保持在 Rust 中。",
      bundleResource: false,
      starterDirectory: "",
      buildCommand: "cargo build",
      summary: "Rust/Tauri 是主进程内后端，不需要额外 starter 产物。",
    };
  }

  if (kind === "cpp-ffi") {
    const libraryName = `nova_${functionName}`;
    return {
      kind,
      language: "cpp",
      transport: "ffi",
      entryPath: starterDirectory,
      artifactPath: `${starterDirectory}/build/bin/Release/${libraryName}.dll`,
      resourcePath: `resources/backend/${slug}/${libraryName}.dll`,
      command: "nova_backend_process",
      healthCheckCommand: "",
      startupTimeoutMs: 1000,
      captureOutput: false,
      notes: "Nova 会在 backend/ 中创建 C++ FFI starter。生成应用会加载构建后的库，并通过 C ABI 调用 nova_backend_process。",
      bundleResource: true,
      starterDirectory,
      buildCommand: `${starterDirectory}/scripts/build.ps1`,
      summary: "C++ FFI starter 会输出动态库；生成应用从打包产物中调用 nova_backend_process。",
    };
  }

  if (language === "python") {
    return {
      kind,
      language,
      transport: normalizeBackendIntegrationTransport(source.transport, "stdio"),
      entryPath: starterDirectory,
      artifactPath: starterDirectory,
      resourcePath: `resources/backend/${slug}`,
      command: "python {resource}/service.py",
      healthCheckCommand: "python {resource}/service.py --health",
      startupTimeoutMs: 1500,
      captureOutput: true,
      notes: "Nova 会创建 Python JSON-over-stdio sidecar starter。可以打包服务文件夹，或替换为构建后的可执行文件。",
      bundleResource: true,
      starterDirectory,
      buildCommand: `${starterDirectory}/scripts/run.ps1`,
      summary: "Python sidecar starter 会从打包资源目录以脚本方式运行。",
    };
  }

  if (language === "node") {
    return {
      kind,
      language,
      transport: normalizeBackendIntegrationTransport(source.transport, "stdio"),
      entryPath: starterDirectory,
      artifactPath: starterDirectory,
      resourcePath: `resources/backend/${slug}`,
      command: "node {resource}/src/index.mjs",
      healthCheckCommand: "node {resource}/src/index.mjs --health",
      startupTimeoutMs: 1500,
      captureOutput: true,
      notes: "Nova 会创建 Node JSON-over-stdio sidecar starter。可以打包服务文件夹，或替换为构建后的可执行文件。",
      bundleResource: true,
      starterDirectory,
      buildCommand: "npm start",
      summary: "Node sidecar starter 会从打包资源目录运行。",
    };
  }

  if (language === "go") {
    return {
      kind,
      language,
      transport: normalizeBackendIntegrationTransport(source.transport, "stdio"),
      entryPath: starterDirectory,
      artifactPath: `${starterDirectory}/target/backend-service.exe`,
      resourcePath: `resources/backend/${slug}/backend-service.exe`,
      command: "{resource} --stdio",
      healthCheckCommand: "{resource} --health",
      startupTimeoutMs: 1500,
      captureOutput: true,
      notes: "Nova 会创建 Go JSON-over-stdio sidecar starter。打包前请先构建，确保 artifactPath 存在。",
      bundleResource: true,
      starterDirectory,
      buildCommand: `${starterDirectory}/scripts/build.ps1`,
      summary: "Go sidecar starter 会构建到 target/backend-service.exe，并可作为 Tauri resource 打包。",
    };
  }

  return {
    kind,
    language,
    transport: normalizeBackendIntegrationTransport(source.transport, "stdio"),
    entryPath: starterDirectory,
    artifactPath: "",
    resourcePath: `resources/backend/${slug}`,
    command: "{resource} --stdio",
    healthCheckCommand: "{resource} --health",
    startupTimeoutMs: 1500,
    captureOutput: true,
    notes: "保持该子系统边界清晰，并从 Rust 调用它，而不是把整个桌面后端移出 Tauri。",
    bundleResource: false,
    starterDirectory,
    buildCommand: "",
    summary: "自定义 sidecar/本地服务集成：准备好后填写 artifactPath、command 和健康检查。",
  };
}

export function backendIntegrationStarterHint(integration: BackendIntegration) {
  const preset = recommendedBackendIntegrationPreset(integration);
  if (!preset.starterDirectory || integration.kind === "rust-native") {
    return "";
  }
  return `${preset.summary} Starter：${preset.starterDirectory}${preset.buildCommand ? `，构建：${preset.buildCommand}` : ""}。`;
}

export function sanitizeBackendMethodName(value: string, index = 0) {
  const fallback = index === 0 ? "default_call" : `backend_method_${index + 1}`;
  const name = value.trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_./:-]/g, "_");
  return name || fallback;
}

export function backendMethodSchema(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return fallback;
}

export function backendMethodSamplePayload(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return fallback;
}

export function normalizeBackendMethodTestRecord(value: unknown, transport: BackendIntegrationTransport): BackendMethodTestRecord | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const record = value as Partial<BackendMethodTestRecord>;
  if (record.status !== "passed" && record.status !== "failed" && record.status !== "skipped") {
    return undefined;
  }
  return {
    id: typeof record.id === "string" && record.id ? record.id : createId(),
    testedAt: typeof record.testedAt === "string" && record.testedAt ? record.testedAt : new Date().toISOString(),
    status: record.status,
    summary: typeof record.summary === "string" ? record.summary : "",
    durationMs: typeof record.durationMs === "number" ? record.durationMs : undefined,
    transport: normalizeBackendIntegrationTransport(record.transport, transport),
    request: typeof record.request === "string" ? record.request : "",
    response: typeof record.response === "string" ? record.response : "",
    rawResponse: typeof record.rawResponse === "string" ? record.rawResponse : undefined,
    error: typeof record.error === "string" ? record.error : undefined,
    validationIssues: Array.isArray(record.validationIssues) ? record.validationIssues.filter((issue): issue is string => typeof issue === "string") : undefined,
  };
}

export function createBackendIntegrationMethod(index = 0): BackendIntegrationMethod {
  const name = index === 0 ? "process_event" : `backend_method_${index + 1}`;
  return {
    id: createId(),
    name,
    operation: name,
    path: index === 0 ? "/process" : `/method-${index + 1}`,
    description: index === 0 ? "接收 UI 事件载荷并返回 Nova JSON envelope。" : "为 UI 事件绑定声明的后端方法。",
    requestSchema: '{\n  "type": "object",\n  "required": ["event", "itemId", "value"],\n  "properties": {\n    "event": {\n      "type": "string",\n      "enum": ["click", "change"],\n      "default": "click"\n    },\n    "itemId": {\n      "type": "string",\n      "default": "preview-button"\n    },\n    "value": {\n      "type": "string",\n      "default": "运行后端方法"\n    },\n    "state": {\n      "type": "object",\n      "properties": {\n        "statusText": {\n          "type": "string",\n          "default": "就绪"\n        }\n      }\n    }\n  }\n}',
    responseSchema: '{\n  "type": "object",\n  "required": ["success", "message"],\n  "properties": {\n    "success": {\n      "type": "boolean"\n    },\n    "message": {\n      "type": "string"\n    },\n    "patch": {\n      "type": "object",\n      "properties": {\n        "statusText": {\n          "type": "string"\n        }\n      }\n    }\n  }\n}',
    samplePayload: '{\n  "event": "click",\n  "itemId": "preview-button",\n  "value": "运行后端方法",\n  "state": {\n    "statusText": "就绪"\n  }\n}',
  };
}

export function normalizeBackendIntegrationMethods(value: unknown, transport: BackendIntegrationTransport = "tauri-invoke"): BackendIntegrationMethod[] {
  if (!Array.isArray(value)) {
    return [createBackendIntegrationMethod(0)];
  }
  const names = new Set<string>();
  const methods = value
    .map((rawMethod, index): BackendIntegrationMethod | null => {
      if (!rawMethod || typeof rawMethod !== "object") {
        return null;
      }
      const method = rawMethod as Partial<BackendIntegrationMethod>;
      const baseName = sanitizeBackendMethodName(method.name || `backend_method_${index + 1}`, index);
      let name = baseName;
      let suffix = 2;
      while (names.has(name.toLowerCase())) {
        name = `${baseName}_${suffix}`;
        suffix += 1;
      }
      names.add(name.toLowerCase());
      const fallback = createBackendIntegrationMethod(index);
      const operation = sanitizeBackendMethodName(method.operation || name, index);
      return {
        id: method.id || createId(),
        name,
        operation,
        path: typeof method.path === "string" && method.path.trim() ? method.path.trim() : fallback.path,
        description: typeof method.description === "string" ? method.description : fallback.description,
        requestSchema: backendMethodSchema(method.requestSchema, fallback.requestSchema),
        responseSchema: backendMethodSchema(method.responseSchema, fallback.responseSchema),
        samplePayload: backendMethodSamplePayload(method.samplePayload, fallback.samplePayload),
        lastTest: normalizeBackendMethodTestRecord(method.lastTest, transport),
      };
    })
    .filter((method): method is BackendIntegrationMethod => Boolean(method));
  return methods.length > 0 ? methods : [createBackendIntegrationMethod(0)];
}

export function backendIntegrationDefaults(
  index = 0,
): BackendIntegrationConfigFields {
  if (index === 0) {
    return recommendedBackendIntegrationPreset({
      name: "Rust Tauri 后端",
      kind: "rust-native",
      language: "rust",
    });
  }
  return recommendedBackendIntegrationPreset({
    name: `后端集成 ${index + 1}`,
    kind: "sidecar",
    language: "go",
  });
}

export function createBackendIntegration(index = 0): BackendIntegration {
  const defaults = backendIntegrationDefaults(index);
  const methods = [createBackendIntegrationMethod(0)];
  return {
    id: createId(),
    name: sanitizeBackendIntegrationName(index === 0 ? "Rust Tauri 后端" : `后端集成 ${index + 1}`, index),
    enabled: true,
    methods,
    activeMethodId: methods[0].id,
    ...defaults,
  };
}

export function normalizeBackendIntegrations(value: unknown): BackendIntegration[] {
  if (!Array.isArray(value)) {
    return [createBackendIntegration(0)];
  }

  const names = new Set<string>();
  const integrations = value
    .map((rawIntegration, index): BackendIntegration | null => {
      if (!rawIntegration || typeof rawIntegration !== "object") {
        return null;
      }
      const integration = rawIntegration as Partial<BackendIntegration>;
      const defaults = backendIntegrationDefaults(index);
      const baseName = sanitizeBackendIntegrationName(integration.name || `后端集成 ${index + 1}`, index);
      let name = baseName;
      let suffix = 2;
      while (names.has(name.toLowerCase())) {
        name = `${baseName} ${suffix}`;
        suffix += 1;
      }
      names.add(name.toLowerCase());
      const kind = normalizeBackendIntegrationKind(integration.kind, defaults.kind);
      const transport = normalizeBackendIntegrationTransport(
        integration.transport,
        kind === "cpp-ffi" ? "ffi" : kind === "rust-native" ? "tauri-invoke" : defaults.transport,
      );
      const methods = normalizeBackendIntegrationMethods(integration.methods, transport);
      const activeMethodId = methods.some((method) => method.id === integration.activeMethodId)
        ? integration.activeMethodId
        : methods[0]?.id;
      return {
        id: integration.id || createId(),
        name,
        kind,
        language: normalizeBackendIntegrationLanguage(integration.language, kind === "cpp-ffi" ? "cpp" : defaults.language),
        transport,
        entryPath: typeof integration.entryPath === "string" ? integration.entryPath.trim() : defaults.entryPath,
        artifactPath: typeof integration.artifactPath === "string" ? integration.artifactPath.trim() : defaults.artifactPath,
        resourcePath: typeof integration.resourcePath === "string" ? integration.resourcePath.trim() : defaults.resourcePath,
        command: typeof integration.command === "string" ? integration.command.trim() : defaults.command,
        healthCheckCommand: typeof integration.healthCheckCommand === "string" ? integration.healthCheckCommand.trim() : defaults.healthCheckCommand,
        startupTimeoutMs: clamp(Number(integration.startupTimeoutMs ?? defaults.startupTimeoutMs), 250, 60000),
        captureOutput: typeof integration.captureOutput === "boolean" ? integration.captureOutput : defaults.captureOutput,
        notes: typeof integration.notes === "string" ? integration.notes : defaults.notes,
        bundleResource: typeof integration.bundleResource === "boolean" ? integration.bundleResource : defaults.bundleResource,
        methods,
        activeMethodId,
        enabled: integration.enabled !== false,
      };
    })
    .filter((integration): integration is BackendIntegration => Boolean(integration));

  return integrations.length > 0 ? integrations : [createBackendIntegration(0)];
}

export function activeBackendMethod(integration: BackendIntegration) {
  return integration.methods.find((method) => method.id === integration.activeMethodId) ?? integration.methods[0] ?? null;
}
