import type {
  BuilderMode,
  DesignerProject,
  ReleasePipelineStepArtifactEvidence,
  ReleasePipelineStepCommandArgs,
  ReleasePipelineStepEnvironment,
  ReleasePipelineStepInputSnapshot,
} from "./types";

export type ProjectJumpActionId =
  | "save-project"
  | "new-ui-file"
  | "duplicate-ui-file"
  | "delete-ui-file"
  | "insert-component"
  | "bind-control-event"
  | "run-selected-event"
  | "add-rust-command"
  | "add-state-variable"
  | "sync-rust"
  | "add-image-asset"
  | "preview-generated-files"
  | "apply-generated-files"
  | "apply-generated-changes"
  | "build-backend-artifacts"
  | "quick-check-frontend"
  | "quick-check-rust"
  | "quick-check-all"
  | "validate-window"
  | "build-exe"
  | "bundle-installer"
  | "fix-property-schema";

export type ProjectTaskStatus = "queued" | "running" | "succeeded" | "failed" | "skipped" | "canceled";

export type ProjectTaskKind = "project" | "design" | "logic" | "generate" | "check" | "validate" | "build" | "repair";

export type ProjectTaskStatusFilter = "all" | ProjectTaskStatus;

export type ProjectTaskKindFilter = "all" | ProjectTaskKind;

export type ProjectTaskEntry = {
  id: string;
  projectId?: string;
  projectName?: string;
  pipelineRunId?: string;
  pipelinePresetTitle?: string;
  pipelineStepIndex?: number;
  pipelineStepCount?: number;
  actionId: ProjectJumpActionId;
  kind: ProjectTaskKind;
  title: string;
  detail: string;
  status: ProjectTaskStatus;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  summary?: string;
  error?: string;
  logPreview?: string;
  artifactPath?: string;
  logPath?: string;
  backendTaskId?: string;
  inputSnapshot?: ReleasePipelineStepInputSnapshot;
  environment?: ReleasePipelineStepEnvironment;
  commandArgs?: ReleasePipelineStepCommandArgs;
  artifactEvidence?: ReleasePipelineStepArtifactEvidence;
  attempt: number;
};

export type ProjectTaskPipelineMetadata = {
  runId: string;
  presetTitle: string;
  stepIndex: number;
  stepCount: number;
};

export type ProjectTaskRunResult = {
  status?: Exclude<ProjectTaskStatus, "queued" | "running">;
  summary: string;
  logPreview?: string;
  artifactPath?: string;
  logPath?: string;
  backendTaskId?: string;
};

export type ProjectTaskLogLine = {
  id: string;
  number: number;
  text: string;
  matched: boolean;
};

export type ProjectActionPresetDefinition = {
  id: string;
  title: string;
  detail: string;
  badge: string;
  actions: ProjectJumpActionId[];
  custom?: boolean;
};

export type ProjectTaskQueueStorageState = {
  paused: boolean;
  tasks: ProjectTaskEntry[];
};

export const projectTaskDefinitions: Record<
  ProjectJumpActionId,
  {
    title: string;
    detail: string;
    kind: ProjectTaskKind;
    mode: BuilderMode;
  }
> = {
  "save-project": {
    title: "保存项目",
    detail: "保存工作区、UI 文件、Rust 逻辑和项目元数据。",
    kind: "project",
    mode: "build",
  },
  "new-ui-file": {
    title: "新建 UI 文件",
    detail: "在当前 Nova 项目中创建一个受管理的窗口。",
    kind: "design",
    mode: "design",
  },
  "duplicate-ui-file": {
    title: "复制 UI 文件",
    detail: "复制当前受管理的 UI 文件并打开副本。",
    kind: "design",
    mode: "design",
  },
  "delete-ui-file": {
    title: "删除 UI 文件",
    detail: "确认后删除或清空当前受管理的 UI 文件。",
    kind: "design",
    mode: "design",
  },
  "insert-component": {
    title: "插入组件",
    detail: "把可复用 UI 组件放到当前设计画布上。",
    kind: "design",
    mode: "design",
  },
  "bind-control-event": {
    title: "绑定控件事件",
    detail: "创建 Rust 命令并绑定到所选控件事件。",
    kind: "logic",
    mode: "design",
  },
  "run-selected-event": {
    title: "运行所选事件",
    detail: "模拟所选控件事件并显示最新运行结果。",
    kind: "logic",
    mode: "preview",
  },
  "add-rust-command": {
    title: "添加 Rust 命令",
    detail: "为 UI 事件注册新的 Tauri invoke 命令。",
    kind: "logic",
    mode: "logic",
  },
  "add-state-variable": {
    title: "添加状态变量",
    detail: "创建用于绑定和命令结果的项目共享状态。",
    kind: "logic",
    mode: "logic",
  },
  "sync-rust": {
    title: "同步 Rust 源码",
    detail: "根据命令注册表重新生成 Rust 逻辑。",
    kind: "logic",
    mode: "logic",
  },
  "add-image-asset": {
    title: "导入图片资源",
    detail: "把本地图片资源加入受管理的项目资源。",
    kind: "design",
    mode: "design",
  },
  "preview-generated-files": {
    title: "预览生成文件",
    detail: "写入前查看目标应用文件计划和磁盘差异。",
    kind: "generate",
    mode: "build",
  },
  "apply-generated-files": {
    title: "应用所选生成文件",
    detail: "带写入前快照地写入所选生成目标文件。",
    kind: "generate",
    mode: "build",
  },
  "apply-generated-changes": {
    title: "应用生成变更",
    detail: "预览并带写入前快照地写入全部已变化目标文件。",
    kind: "generate",
    mode: "build",
  },
  "build-backend-artifacts": {
    title: "构建后端产物",
    detail: "运行 C++/Go starter 构建脚本并刷新打包产物状态。",
    kind: "build",
    mode: "logic",
  },
  "quick-check-frontend": {
    title: "运行前端检查",
    detail: "运行生成目标应用的前端检查。",
    kind: "check",
    mode: "build",
  },
  "quick-check-rust": {
    title: "运行 Rust 检查",
    detail: "对生成目标应用执行 cargo check。",
    kind: "check",
    mode: "build",
  },
  "quick-check-all": {
    title: "运行全部快速检查",
    detail: "构建可执行文件前运行前端和 Rust 检查。",
    kind: "check",
    mode: "build",
  },
  "validate-window": {
    title: "验证生成窗口",
    detail: "对生成目标窗口运行视觉和运行时验证。",
    kind: "validate",
    mode: "build",
  },
  "build-exe": {
    title: "构建 release exe",
    detail: "把受管理的目标应用编译成发布可执行文件。",
    kind: "build",
    mode: "build",
  },
  "bundle-installer": {
    title: "打包安装器",
    detail: "构建安装包并收集产物冒烟测试元数据。",
    kind: "build",
    mode: "build",
  },
  "fix-property-schema": {
    title: "修复属性结构问题",
    detail: "应用安全的项目级控件属性修复。",
    kind: "repair",
    mode: "build",
  },
};

export const projectTaskStatusFilterOptions: { value: ProjectTaskStatusFilter; label: string }[] = [
  { value: "all", label: "全部状态" },
  { value: "running", label: "运行中" },
  { value: "queued", label: "排队中" },
  { value: "failed", label: "失败" },
  { value: "succeeded", label: "完成" },
  { value: "canceled", label: "已取消" },
  { value: "skipped", label: "已跳过" },
];

export const projectTaskKindFilterOptions: { value: ProjectTaskKindFilter; label: string }[] = [
  { value: "all", label: "全部类型" },
  { value: "build", label: "构建" },
  { value: "check", label: "检查" },
  { value: "validate", label: "验证" },
  { value: "generate", label: "生成" },
  { value: "logic", label: "逻辑" },
  { value: "design", label: "设计" },
  { value: "repair", label: "修复" },
  { value: "project", label: "项目" },
];

export const projectActionPresets: ProjectActionPresetDefinition[] = [
  {
    id: "design-preflight",
    title: "设计预检",
    detail: "保存、预览并应用生成文件、构建后端产物、运行全部快速检查，然后验证生成窗口。",
    badge: "预检",
    actions: ["save-project", "preview-generated-files", "apply-generated-changes", "build-backend-artifacts", "quick-check-all", "validate-window"],
  },
  {
    id: "release-exe",
    title: "发布 exe",
    detail: "保存项目、应用生成变更、构建后端产物、运行检查和验证，然后编译生成应用可执行文件。",
    badge: "exe",
    actions: ["save-project", "preview-generated-files", "apply-generated-changes", "build-backend-artifacts", "quick-check-all", "validate-window", "build-exe"],
  },
  {
    id: "installer-bundle",
    title: "安装包流水线",
    detail: "执行完整发布链路，包含 exe 构建和安装包产物收集。",
    badge: "安装包",
    actions: ["save-project", "preview-generated-files", "apply-generated-changes", "build-backend-artifacts", "quick-check-all", "validate-window", "build-exe", "bundle-installer"],
  },
  {
    id: "logic-sync",
    title: "逻辑同步",
    detail: "根据命令重新生成 Rust 源码，保存后运行生成项目的 Rust 检查。",
    badge: "逻辑",
    actions: ["sync-rust", "save-project", "quick-check-rust"],
  },
];

export const projectActionOptionIds = Object.keys(projectTaskDefinitions) as ProjectJumpActionId[];

const PROJECT_TASK_HISTORY_STORAGE_KEY = "nova-ui-kit-project-task-history-v1";
const PROJECT_TASK_QUEUE_STORAGE_KEY = "nova-ui-kit-project-task-queue-v1";
const PROJECT_ACTION_PRESETS_STORAGE_KEY = "nova-ui-kit-project-action-presets-v1";

let cachedProjectTaskQueueState: ProjectTaskQueueStorageState | null = null;

function createTaskId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function isProjectJumpActionId(value: unknown): value is ProjectJumpActionId {
  return typeof value === "string" && value in projectTaskDefinitions;
}

export function createProjectTask(
  actionId: ProjectJumpActionId,
  project: Pick<DesignerProject, "id" | "name">,
  attempt = 1,
  pipeline?: ProjectTaskPipelineMetadata,
): ProjectTaskEntry {
  const definition = projectTaskDefinitions[actionId];
  return {
    id: createTaskId(),
    projectId: project.id,
    projectName: project.name,
    pipelineRunId: pipeline?.runId,
    pipelinePresetTitle: pipeline?.presetTitle,
    pipelineStepIndex: pipeline?.stepIndex,
    pipelineStepCount: pipeline?.stepCount,
    actionId,
    kind: definition.kind,
    title: definition.title,
    detail: definition.detail,
    status: "queued",
    createdAt: new Date().toISOString(),
    attempt,
  };
}

function normalizeProjectActionPresetRecord(record: unknown): ProjectActionPresetDefinition | null {
  if (!record || typeof record !== "object") {
    return null;
  }
  const source = record as Partial<ProjectActionPresetDefinition>;
  const actions = Array.isArray(source.actions) ? source.actions.filter(isProjectJumpActionId) : [];
  const title = typeof source.title === "string" ? source.title.trim() : "";
  if (!title || actions.length === 0) {
    return null;
  }
  return {
    id: typeof source.id === "string" && source.id ? source.id : createTaskId(),
    title,
    detail: typeof source.detail === "string" && source.detail.trim() ? source.detail.trim() : "自定义任务中心操作 preset。",
    badge: typeof source.badge === "string" && source.badge.trim() ? source.badge.trim().slice(0, 16) : "自定义",
    actions,
    custom: true,
  };
}

export function loadProjectActionPresets(): ProjectActionPresetDefinition[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(PROJECT_ACTION_PRESETS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeProjectActionPresetRecord).filter((preset): preset is ProjectActionPresetDefinition => Boolean(preset)).slice(0, 24);
  } catch {
    return [];
  }
}

export function saveProjectActionPresets(presets: ProjectActionPresetDefinition[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PROJECT_ACTION_PRESETS_STORAGE_KEY, JSON.stringify(presets.slice(0, 24)));
}

function normalizeProjectTaskHistoryRecord(record: unknown): ProjectTaskEntry | null {
  if (!record || typeof record !== "object") {
    return null;
  }
  const source = record as Partial<ProjectTaskEntry>;
  if (!source.actionId || !(source.actionId in projectTaskDefinitions)) {
    return null;
  }
  const definition = projectTaskDefinitions[source.actionId];
  const rawStatus = typeof source.status === "string" ? source.status : "canceled";
  const status: ProjectTaskStatus =
    rawStatus === "succeeded" || rawStatus === "failed" || rawStatus === "skipped" || rawStatus === "canceled" ? rawStatus : "canceled";
  const interrupted = rawStatus === "queued" || rawStatus === "running";
  const createdAt = typeof source.createdAt === "string" && source.createdAt ? source.createdAt : new Date().toISOString();
  return {
    id: typeof source.id === "string" && source.id ? source.id : createTaskId(),
    projectId: typeof source.projectId === "string" ? source.projectId : undefined,
    projectName: typeof source.projectName === "string" ? source.projectName : undefined,
    pipelineRunId: typeof source.pipelineRunId === "string" ? source.pipelineRunId : undefined,
    pipelinePresetTitle: typeof source.pipelinePresetTitle === "string" ? source.pipelinePresetTitle : undefined,
    pipelineStepIndex: Number.isFinite(Number(source.pipelineStepIndex)) ? Math.max(0, Number(source.pipelineStepIndex)) : undefined,
    pipelineStepCount: Number.isFinite(Number(source.pipelineStepCount)) ? Math.max(0, Number(source.pipelineStepCount)) : undefined,
    actionId: source.actionId,
    kind: definition.kind,
    title: definition.title,
    detail: definition.detail,
    status,
    createdAt,
    startedAt: typeof source.startedAt === "string" ? source.startedAt : undefined,
    finishedAt: typeof source.finishedAt === "string" ? source.finishedAt : interrupted ? new Date().toISOString() : undefined,
    summary: interrupted ? "编辑器会话结束时任务被中断。" : typeof source.summary === "string" ? source.summary : undefined,
    error: typeof source.error === "string" ? source.error : undefined,
    logPreview: typeof source.logPreview === "string" ? projectTaskLogPreview(source.logPreview) : undefined,
    artifactPath: typeof source.artifactPath === "string" ? source.artifactPath : undefined,
    logPath: typeof source.logPath === "string" ? source.logPath : undefined,
    backendTaskId: typeof source.backendTaskId === "string" ? source.backendTaskId : undefined,
    attempt: typeof source.attempt === "number" && source.attempt > 0 ? source.attempt : 1,
  };
}

function normalizeProjectTaskQueueRecord(record: unknown): ProjectTaskEntry | null {
  if (!record || typeof record !== "object") {
    return null;
  }
  const source = record as Partial<ProjectTaskEntry>;
  if (!isProjectJumpActionId(source.actionId)) {
    return null;
  }
  const definition = projectTaskDefinitions[source.actionId];
  return {
    id: typeof source.id === "string" && source.id ? source.id : createTaskId(),
    projectId: typeof source.projectId === "string" ? source.projectId : undefined,
    projectName: typeof source.projectName === "string" ? source.projectName : undefined,
    pipelineRunId: typeof source.pipelineRunId === "string" ? source.pipelineRunId : undefined,
    pipelinePresetTitle: typeof source.pipelinePresetTitle === "string" ? source.pipelinePresetTitle : undefined,
    pipelineStepIndex: Number.isFinite(Number(source.pipelineStepIndex)) ? Math.max(0, Number(source.pipelineStepIndex)) : undefined,
    pipelineStepCount: Number.isFinite(Number(source.pipelineStepCount)) ? Math.max(0, Number(source.pipelineStepCount)) : undefined,
    actionId: source.actionId,
    kind: definition.kind,
    title: definition.title,
    detail: definition.detail,
    status: "queued",
    createdAt: typeof source.createdAt === "string" && source.createdAt ? source.createdAt : new Date().toISOString(),
    summary: typeof source.summary === "string" && source.summary ? source.summary : "已从本地持久化队列恢复。",
    error: undefined,
    logPreview: undefined,
    artifactPath: typeof source.artifactPath === "string" ? source.artifactPath : undefined,
    logPath: undefined,
    backendTaskId: undefined,
    attempt: typeof source.attempt === "number" && source.attempt > 0 ? source.attempt : 1,
  };
}

export function loadProjectTaskQueueState(): ProjectTaskQueueStorageState {
  if (cachedProjectTaskQueueState) {
    return cachedProjectTaskQueueState;
  }
  if (typeof window === "undefined") {
    cachedProjectTaskQueueState = { paused: false, tasks: [] };
    return cachedProjectTaskQueueState;
  }
  try {
    const raw = window.localStorage.getItem(PROJECT_TASK_QUEUE_STORAGE_KEY);
    if (!raw) {
      cachedProjectTaskQueueState = { paused: false, tasks: [] };
      return cachedProjectTaskQueueState;
    }
    const parsed = JSON.parse(raw) as Partial<ProjectTaskQueueStorageState>;
    const tasks = Array.isArray(parsed.tasks)
      ? parsed.tasks.map(normalizeProjectTaskQueueRecord).filter((task): task is ProjectTaskEntry => Boolean(task)).slice(0, 80)
      : [];
    cachedProjectTaskQueueState = {
      paused: Boolean(parsed.paused),
      tasks,
    };
    return cachedProjectTaskQueueState;
  } catch {
    cachedProjectTaskQueueState = { paused: false, tasks: [] };
    return cachedProjectTaskQueueState;
  }
}

export function saveProjectTaskQueueState(state: ProjectTaskQueueStorageState) {
  cachedProjectTaskQueueState = {
    paused: state.paused,
    tasks: state.tasks.slice(0, 80),
  };
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PROJECT_TASK_QUEUE_STORAGE_KEY, JSON.stringify(cachedProjectTaskQueueState));
}

function loadProjectTaskHistory(): ProjectTaskEntry[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(PROJECT_TASK_HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeProjectTaskHistoryRecord).filter((task): task is ProjectTaskEntry => Boolean(task)).slice(0, 80);
  } catch {
    return [];
  }
}

export function saveProjectTaskHistory(tasks: ProjectTaskEntry[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PROJECT_TASK_HISTORY_STORAGE_KEY, JSON.stringify(tasks.slice(0, 80)));
}

export function loadInitialProjectTaskHistory(): ProjectTaskEntry[] {
  const queuedTasks = loadProjectTaskQueueState().tasks;
  const queuedIds = new Set(queuedTasks.map((task) => task.id));
  const historyTasks = loadProjectTaskHistory().filter((task) => !queuedIds.has(task.id));
  return [...queuedTasks, ...historyTasks].slice(0, 100);
}

export function projectTaskStatusVariant(status: ProjectTaskStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "failed") {
    return "destructive";
  }
  if (status === "queued" || status === "skipped" || status === "canceled") {
    return "outline";
  }
  return "secondary";
}

export function projectTaskProgress(status: ProjectTaskStatus) {
  if (status === "queued") {
    return 18;
  }
  if (status === "running") {
    return 62;
  }
  if (status === "succeeded" || status === "skipped") {
    return 100;
  }
  if (status === "failed" || status === "canceled") {
    return 100;
  }
  return 0;
}

function isTaskLogRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function taskLogString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function taskLogNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function cargoDiagnosticLocation(message: Record<string, unknown>) {
  const spans = Array.isArray(message.spans) ? message.spans.filter(isTaskLogRecord) : [];
  const primarySpan = spans.find((span) => span.is_primary === true) ?? spans[0];
  if (!primarySpan) {
    return "";
  }

  const file = taskLogString(primarySpan, "file_name");
  if (!file) {
    return "";
  }
  const line = taskLogNumber(primarySpan, "line_start");
  const column = taskLogNumber(primarySpan, "column_start");
  return line && column ? `${file}:${line}:${column}` : file;
}

function cargoDiagnosticCode(message: Record<string, unknown>) {
  const code = message.code;
  return isTaskLogRecord(code) ? taskLogString(code, "code") : undefined;
}

function readableCargoDiagnostic(line: string) {
  if (!line.startsWith("{") || !line.endsWith("}")) {
    return line;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(line);
  } catch {
    return line;
  }

  if (!isTaskLogRecord(payload)) {
    return line;
  }

  if (payload.reason !== "compiler-message") {
    return undefined;
  }

  const message = payload.message;
  if (!isTaskLogRecord(message)) {
    return undefined;
  }

  const level = taskLogString(message, "level") ?? "diagnostic";
  const summary = taskLogString(message, "message") ?? "Cargo diagnostic";
  const code = cargoDiagnosticCode(message);
  const location = cargoDiagnosticLocation(message);
  return [
    `${level}${code ? ` [${code}]` : ""}: ${summary}`,
    location ? `--> ${location}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function readableTaskLogPreview(log: string) {
  return log
    .split(/\r?\n/)
    .map((line) => readableCargoDiagnostic(line.trim()))
    .filter((line): line is string => Boolean(line?.trim()))
    .join("\n")
    .trim();
}

export function projectTaskLogPreview(log?: string | null) {
  const normalized = (log ?? "").trim();
  if (!normalized) {
    return undefined;
  }
  const readable = readableTaskLogPreview(normalized);
  if (!readable) {
    return "机器日志中没有可面向用户显示的诊断。";
  }
  return readable.length > 4000 ? readable.slice(-4000) : readable;
}

export function projectTaskKindLabel(kind: ProjectTaskKind) {
  return projectTaskKindFilterOptions.find((option) => option.value === kind)?.label ?? kind;
}

export function projectTaskStatusLabel(status: ProjectTaskStatus | "idle" | string) {
  if (status === "idle") {
    return "待开始";
  }
  return projectTaskStatusFilterOptions.find((option) => option.value === status)?.label ?? status;
}

function projectTaskSearchText(task: ProjectTaskEntry) {
  return [task.title, task.detail, task.status, task.kind, task.summary, task.error, task.artifactPath, task.logPath, task.projectName, task.backendTaskId]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterProjectTasks(
  tasks: ProjectTaskEntry[],
  statusFilter: ProjectTaskStatusFilter,
  kindFilter: ProjectTaskKindFilter,
  query: string,
) {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return tasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) {
      return false;
    }
    if (kindFilter !== "all" && task.kind !== kindFilter) {
      return false;
    }
    if (tokens.length === 0) {
      return true;
    }
    const searchable = projectTaskSearchText(task);
    return tokens.every((token) => searchable.includes(token));
  });
}

export function projectTaskElapsedLabel(task: ProjectTaskEntry) {
  const startDate = new Date(task.startedAt ?? task.createdAt);
  const endDate = task.finishedAt ? new Date(task.finishedAt) : task.status === "running" ? new Date() : null;
  const startTime = startDate.getTime();
  const endTime = endDate?.getTime();
  if (!Number.isFinite(startTime) || !endTime || !Number.isFinite(endTime) || endTime < startTime) {
    return task.startedAt ? "已开始" : "未开始";
  }

  const elapsedSeconds = Math.max(1, Math.round((endTime - startTime) / 1000));
  if (elapsedSeconds < 60) {
    return `${elapsedSeconds}s`;
  }
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  if (minutes < 60) {
    return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function projectTaskLogLines(log: string | undefined, query: string): ProjectTaskLogLine[] {
  const lines = (log ?? "").split(/\r?\n/);
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const mapped = lines.map((line, index) => {
    const normalized = line.toLowerCase();
    const matched = tokens.length > 0 && tokens.every((token) => normalized.includes(token));
    return {
      id: `${index + 1}-${line.slice(0, 16)}`,
      number: index + 1,
      text: line,
      matched,
    };
  });

  if (tokens.length > 0) {
    return mapped.filter((line) => line.matched).slice(-120);
  }
  return mapped.filter((line) => line.text.trim()).slice(-120);
}
