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
    title: "Save project",
    detail: "Persist workspace, UI files, Rust logic, and project metadata.",
    kind: "project",
    mode: "build",
  },
  "new-ui-file": {
    title: "New UI file",
    detail: "Create another managed window inside this Nova project.",
    kind: "design",
    mode: "design",
  },
  "duplicate-ui-file": {
    title: "Duplicate UI file",
    detail: "Copy the active managed UI file and open the duplicate.",
    kind: "design",
    mode: "design",
  },
  "delete-ui-file": {
    title: "Delete UI file",
    detail: "Delete or clear the active managed UI file after confirmation.",
    kind: "design",
    mode: "design",
  },
  "insert-component": {
    title: "Insert component",
    detail: "Place a reusable UI component on the active design canvas.",
    kind: "design",
    mode: "design",
  },
  "bind-control-event": {
    title: "Bind control event",
    detail: "Create a Rust command and bind it to the selected control event.",
    kind: "logic",
    mode: "design",
  },
  "run-selected-event": {
    title: "Run selected event",
    detail: "Simulate the selected control event and show the latest runtime result.",
    kind: "logic",
    mode: "preview",
  },
  "add-rust-command": {
    title: "Add Rust command",
    detail: "Register a new Tauri invoke command for UI events.",
    kind: "logic",
    mode: "logic",
  },
  "add-state-variable": {
    title: "Add state variable",
    detail: "Create shared project state for bindings and command results.",
    kind: "logic",
    mode: "logic",
  },
  "sync-rust": {
    title: "Sync Rust source",
    detail: "Regenerate Rust logic from the command registry.",
    kind: "logic",
    mode: "logic",
  },
  "add-image-asset": {
    title: "Import image asset",
    detail: "Add a local image resource to the managed project assets.",
    kind: "design",
    mode: "design",
  },
  "preview-generated-files": {
    title: "Preview generated files",
    detail: "Review the target app file plan and disk diff before writing.",
    kind: "generate",
    mode: "build",
  },
  "apply-generated-files": {
    title: "Apply selected generated files",
    detail: "Write selected generated target files with a pre-write snapshot.",
    kind: "generate",
    mode: "build",
  },
  "apply-generated-changes": {
    title: "Apply generated changes",
    detail: "Preview and write all changed generated target files with a pre-write snapshot.",
    kind: "generate",
    mode: "build",
  },
  "build-backend-artifacts": {
    title: "Build backend artifacts",
    detail: "Run C++/Go starter build scripts and refresh bundled artifact status.",
    kind: "build",
    mode: "logic",
  },
  "quick-check-frontend": {
    title: "Run frontend check",
    detail: "Run the generated target app frontend check.",
    kind: "check",
    mode: "build",
  },
  "quick-check-rust": {
    title: "Run Rust check",
    detail: "Run cargo check for the generated target app.",
    kind: "check",
    mode: "build",
  },
  "quick-check-all": {
    title: "Run all quick checks",
    detail: "Run frontend and Rust checks before building the executable.",
    kind: "check",
    mode: "build",
  },
  "validate-window": {
    title: "Validate generated window",
    detail: "Run visual/runtime validation for the generated target window.",
    kind: "validate",
    mode: "build",
  },
  "build-exe": {
    title: "Build release exe",
    detail: "Compile the managed target app into a release executable.",
    kind: "build",
    mode: "build",
  },
  "bundle-installer": {
    title: "Bundle installer",
    detail: "Build installer bundles and collect artifact smoke metadata.",
    kind: "build",
    mode: "build",
  },
  "fix-property-schema": {
    title: "Fix property schema issues",
    detail: "Apply safe project-level control property repairs.",
    kind: "repair",
    mode: "build",
  },
};

export const projectTaskStatusFilterOptions: { value: ProjectTaskStatusFilter; label: string }[] = [
  { value: "all", label: "All status" },
  { value: "running", label: "Running" },
  { value: "queued", label: "Queued" },
  { value: "failed", label: "Failed" },
  { value: "succeeded", label: "Done" },
  { value: "canceled", label: "Canceled" },
  { value: "skipped", label: "Skipped" },
];

export const projectTaskKindFilterOptions: { value: ProjectTaskKindFilter; label: string }[] = [
  { value: "all", label: "All kinds" },
  { value: "build", label: "Build" },
  { value: "check", label: "Checks" },
  { value: "validate", label: "Validate" },
  { value: "generate", label: "Generate" },
  { value: "logic", label: "Logic" },
  { value: "design", label: "Design" },
  { value: "repair", label: "Repair" },
  { value: "project", label: "Project" },
];

export const projectActionPresets: ProjectActionPresetDefinition[] = [
  {
    id: "design-preflight",
    title: "Design preflight",
    detail: "Save, preview/apply generated files, build backend artifacts, run all quick checks, then validate the generated window.",
    badge: "preflight",
    actions: ["save-project", "preview-generated-files", "apply-generated-changes", "build-backend-artifacts", "quick-check-all", "validate-window"],
  },
  {
    id: "release-exe",
    title: "Release exe",
    detail: "Save the project, apply generated changes, build backend artifacts, run checks and validation, then compile the generated app executable.",
    badge: "exe",
    actions: ["save-project", "preview-generated-files", "apply-generated-changes", "build-backend-artifacts", "quick-check-all", "validate-window", "build-exe"],
  },
  {
    id: "installer-bundle",
    title: "Installer bundle",
    detail: "Run the full release chain through exe build and installer bundle collection.",
    badge: "bundle",
    actions: ["save-project", "preview-generated-files", "apply-generated-changes", "build-backend-artifacts", "quick-check-all", "validate-window", "build-exe", "bundle-installer"],
  },
  {
    id: "logic-sync",
    title: "Logic sync",
    detail: "Regenerate Rust source from commands, save, then run the generated Rust check.",
    badge: "logic",
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
    detail: typeof source.detail === "string" && source.detail.trim() ? source.detail.trim() : "Custom Task Center action preset.",
    badge: typeof source.badge === "string" && source.badge.trim() ? source.badge.trim().slice(0, 16) : "custom",
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
    summary: interrupted ? "Task was interrupted when the editor session ended." : typeof source.summary === "string" ? source.summary : undefined,
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
    summary: typeof source.summary === "string" && source.summary ? source.summary : "Restored from the persisted editor queue.",
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
    return "Machine log contained no user-facing diagnostics.";
  }
  return readable.length > 4000 ? readable.slice(-4000) : readable;
}

export function projectTaskKindLabel(kind: ProjectTaskKind) {
  return projectTaskKindFilterOptions.find((option) => option.value === kind)?.label ?? kind;
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
    return task.startedAt ? "started" : "not started";
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
