/**
 * Plugin backend template registry (workflow D1).
 * Mirrors examples/ so Nova can offer "import backend template" in Logic.
 */

export type BackendTemplateKind = "local-service" | "cpp-ffi" | "sidecar";

export type BackendTemplate = {
  id: string;
  title: string;
  kind: BackendTemplateKind;
  language: "python" | "cpp" | "node" | "go";
  entry: string;
  healthCommand: string;
  description: string;
  sampleMethods: string[];
};

export const novaBackendTemplates: BackendTemplate[] = [
  {
    id: "python-local-service",
    title: "Python 本地服务",
    kind: "local-service",
    language: "python",
    entry: "service.py",
    healthCommand: "python service.py --health",
    description: "stdio JSON 方法路由，零第三方依赖，适合快速原型。",
    sampleMethods: ["health", "ping", "echo", "add", "upper"],
  },
  {
    id: "cpp-ffi",
    title: "C++ FFI 动态库",
    kind: "cpp-ffi",
    language: "cpp",
    entry: "nova_backend.dll",
    healthCommand: "nova_backend_version()",
    description: "extern \"C\" ABI，由生成 Rust 通过 libloading 加载。",
    sampleMethods: ["health", "add", "echo"],
  },
  {
    id: "node-sidecar",
    title: "Node sidecar",
    kind: "sidecar",
    language: "node",
    entry: "src/index.mjs",
    healthCommand: "node src/index.mjs --health",
    description: "stdio JSON，适合 JS 生态依赖。",
    sampleMethods: ["health", "echo"],
  },
  {
    id: "go-sidecar",
    title: "Go sidecar",
    kind: "sidecar",
    language: "go",
    entry: "main.go",
    healthCommand: "./main --health",
    description: "编译为单文件可执行，适合部署。",
    sampleMethods: ["health", "echo"],
  },
];

export function findBackendTemplate(id: string): BackendTemplate | undefined {
  return novaBackendTemplates.find((t) => t.id === id);
}
