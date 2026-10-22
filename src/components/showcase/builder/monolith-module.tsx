/* eslint-disable @typescript-eslint/no-explicit-any */
// Module-scope types, constants and pure helpers extracted from
// BuilderShowcase.tsx (P2-9). The component still owns all runtime state; this
// module only holds the declarations that never close over it.

import type { ProjectJumpKind } from "./task-center";
import {
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  invoke,
} from "@tauri-apps/api/core";
import {
  Braces,
  Download,
  FileJson,
  FileImage,
  FolderOpen,
  Layers,
  Monitor,
  RectangleHorizontal,
  Save,
  Settings2,
  Smartphone,
  Terminal,
} from "lucide-react";
import {
  cn,
} from "@/lib/utils";
import {
  itemOptionTexts,
} from "./item-options";
import {
  isTauriRuntime,
} from "./item-assets";
import {
  palette,
  getDefinition,
  type ComponentDefinition,
} from "./component-palette";
import {
  MIN_ITEM_HEIGHT,
  MIN_ITEM_WIDTH,
  clamp,
  collectDescendantIds,
  frameLayoutMetrics,
  frameLayoutMode,
  getAbsolutePosition,
  getOrderedFrameChildren,
  isDescendantOf,
  normalizeItemBounds,
  snap,
} from "./layout";
import {
  normalizeGeneratedFileChangeSummary,
} from "./build-results";
import {
  type ProjectChangeImpactStatus,
  type ProjectChangeImpactSummary,
  type ProjectChangeScope,
  type ProjectReverseDependencySummary,
  type ProjectReverseDependencyTarget,
} from "./change-impact";
import {
  normalizeGeneratedRustSourceMap,
} from "./diagnostics";
import {
  projectTaskStatusLabel,
  type ProjectActionPresetDefinition,
  type ProjectJumpActionId,
  type ProjectTaskEntry,
  type ProjectTaskStatus,
} from "./task-center";
import {
  cloneResponsiveOverrides,
  getEffectivePage,
  normalizeBreakpoint,
  responsiveBreakpointSize,
  resolveItemsForBreakpoint,
} from "./responsive";
import {
  defaultReleaseConfig,
  normalizeEnvVarName,
  normalizeMinimumArtifactSizeKb,
  normalizeReleaseBundleTarget,
  normalizeReleaseConfig,
  normalizeReleaseInstallerSmokeRunnerMode,
  normalizeReleaseNotes,
  normalizeReleaseSigningMode,
  normalizeReleaseTitlebarStyle,
  normalizeReleaseVersion,
  normalizeReleaseWindowKind,
  releaseSigningConfigured,
  releaseSigningDescription,
  releaseWindowShellFromPage,
} from "./release";
import {
  backendIntegrationStarterHint,
  createBackendIntegration,
  createCargoDependency,
  createRustModule,
  normalizeBackendIntegrations,
  normalizeCargoDependencies,
  normalizeRustModules,
} from "./backend";
import {
  DEFAULT_RUST_COMMAND_RESPONSE,
  commandResultSchema,
  createRustLogic,
  normalizeRustCommands,
  rustCommandParameters,
  rustParameterTypeCode,
  sanitizeRustCommandName,
  sanitizeRustParameterName,
} from "./rust-commands";
import {
  createBlankFile as createTemplateBlankFile,
  createProjectTemplateSeed,
  type ProjectTemplateId,
} from "./project-templates";
import {
  defaultEventPayloadFields,
  eventCommandId,
  eventNameForItem,
} from "./event-bindings";
import {
  createId,
} from "./ids";
import type {
  BackendArtifactInspectionEntry,
  BackendArtifactInspectionResult,
  BackendIntegration,
  BackendIntegrationMethod,
  BackendMethodTestRecord,
  BuildHistoryEntry,
  BuildDiagnostic,
  ButtonVariant,
  BuilderComponentType,
  BuilderEventBinding,
  BuilderEventName,
  BuilderEventPayloadField,
  BuilderItem,
  BuilderItemProps,
  BuilderMode,
  BuilderStateVariable,
  BreakpointValidationIssue,
  BuildResult,
  GeneratedFilePreviewEntry,
  ReleasePipelineArtifactInspectionResult,
  ReleasePipelineEntry,
  ReleasePipelineStatus,
  ReleasePipelineStep,
  ReleasePipelineStepArtifactEvidence,
  ReleasePipelineStepCommandArgs,
  ReleasePipelineStepEnvironment,
  ReleasePipelineStepInputSnapshot,
  CanvasPresetId,
  ControlSize,
  DesignerAsset,
  DesignerFile,
  DesignerProject,
  DesignerWorkspace,
  DragSession,
  EditorProjectCheckpoint,
  EditorProjectCheckpointDiff,
  FrameLayoutMode,
  ImageFit,
  LaunchExecutableResult,
  PageConfig,
  ProjectEditorState,
  ProjectDependencyGraphEvent,
  ProjectDependencyGraphPlan,
  ProjectDependencyGraphRecord,
  ProjectDependencyGraphScope,
  ProjectDependencySourceReference,
  ProjectDependencyGraphValidityEntry,
  ProjectMaintenanceEntry,
  ReleaseTitlebarStyle,
  ReleaseWindowKind,
  ResizeHandle,
  ResponsiveBreakpointId,
  ResponsiveOverride,
  BuilderResultTargetProp,
  RustCommand,
  RustCommandParameter,
  SavedBuilderState,
  ValidationHistoryEntry,
  ValidationResult,
} from "./types";
export const READINESS_GATED_PROJECT_ACTIONS = new Set<ProjectJumpActionId>([
  "validate-window",
  "build-exe",
  "bundle-installer",
]);


export type BackendSchemaFieldType = "string" | "number" | "boolean" | "object" | "array" | "json";

export type BackendSchemaField = {
  name: string;
  path: string[];
  type: BackendSchemaFieldType;
  required: boolean;
  description: string;
  inputValue: string;
  source: "schema" | "sample";
  enumValues?: string[];
  depth: number;
};

export type BuilderPropertyKind = "text" | "number" | "boolean" | "select";

export type BuilderPropertySchemaField = {
  prop: keyof BuilderItemProps;
  label: string;
  kind: BuilderPropertyKind;
  appliesTo: readonly BuilderComponentType[];
  required?: boolean;
  recommended?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: readonly string[];
};

export type BuilderPropertyIssue = {
  id: string;
  severity: "warning" | "error";
  fileId: string;
  fileName: string;
  itemId: string;
  itemName: string;
  itemType: BuilderComponentType;
  prop: keyof BuilderItemProps;
  label: string;
  message: string;
};

export type BuilderLeftDockTab = "project" | "navigator" | "components" | "assets";
export type BuilderRightDockTab = "properties" | "connections" | "responsive" | "impact";
export type BuilderBottomDockTab = "issues" | "output" | "tasks" | "logs" | "preview";
export type BuilderPropertySectionId = "layout" | "content" | "state" | "appearance" | "actions";
export type LogicResourceViewId = "all" | "connections" | "commands" | "modules" | "dependencies" | "integrations" | "state";
export type LogicConnectionFilterId = "all" | "unbound" | "bound" | "missing-slot";
export type RustDebuggerPanelId = "problems" | "breakpoints" | "watch" | "call-stack";
export const defaultOpenPropertySections: Record<BuilderPropertySectionId, boolean> = {
  layout: true,
  content: true,
  state: false,
  appearance: false,
  actions: false,
};
export const builderPropertySectionIds = Object.keys(defaultOpenPropertySections) as BuilderPropertySectionId[];
export const builderPropertySectionLabels: Record<BuilderPropertySectionId, string> = {
  layout: "布局",
  content: "内容",
  state: "状态",
  appearance: "样式",
  actions: "动作",
};
export const builderPropertySectionOptions = builderPropertySectionIds.map((id) => ({ id, label: builderPropertySectionLabels[id] }));
export const logicResourceViewOptions: Array<{ value: LogicResourceViewId; label: string }> = [
  { value: "all", label: "全部" },
  { value: "connections", label: "连接" },
  { value: "commands", label: "命令" },
  { value: "modules", label: "模块" },
  { value: "dependencies", label: "依赖" },
  { value: "integrations", label: "集成" },
  { value: "state", label: "状态" },
];
export const logicResourceViewIds = logicResourceViewOptions.map((option) => option.value) as LogicResourceViewId[];
export const logicResourceSectionClass =
  "group rounded-lg border border-outline-variant/80 bg-surface-container-low/70 text-xs shadow-none";
export const logicResourceSectionSummaryClass =
  "focus-ring flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-1.5 py-1 transition hover:bg-surface-container-high [&::-webkit-details-marker]:hidden";
export const logicResourceSectionIconClass =
  "flex size-5 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-primary";
export const logicResourceSectionContentClass = "space-y-1 border-t border-outline-variant/70 p-1.5";
export const logicResourceItemClass = "w-full rounded-lg border px-2 py-1 text-left transition";
export const logicResourceItemActiveClass = "border-primary bg-primary/10 text-on-surface shadow-m3-1";
export const logicResourceItemIdleClass =
  "border-outline-variant/80 bg-transparent text-on-surface-variant hover:border-outline hover:bg-surface-container-high";
export const logicConnectionFilterOptions: Array<{ value: LogicConnectionFilterId; label: string }> = [
  { value: "all", label: "全部" },
  { value: "unbound", label: "待绑定" },
  { value: "bound", label: "已绑定" },
  { value: "missing-slot", label: "缺槽" },
];
export const logicConnectionFilterIds = logicConnectionFilterOptions.map((option) => option.value) as LogicConnectionFilterId[];
export type BuilderEditorTabKind = "ui" | "logic" | "build";
export type BuilderEditorTab = {
  id: string;
  kind: BuilderEditorTabKind;
  label: string;
  detail: string;
  badge: string;
  fileId?: string;
  path: string;
  relativePath: string;
  revealNodeId: string;
  targetMode: BuilderMode;
  dirty?: boolean;
  closable?: boolean;
  icon: typeof FileJson;
};
export type BuilderFileSaveState = {
  fileId: string;
  currentFingerprint: string;
  savedFingerprint?: string;
  dirty: boolean;
};
export type ProjectExplorerFilterId = "all" | "ui" | "rust" | "assets" | "backend" | "build" | "meta";

export type ProjectExplorerNodeAction =
  | "open-path"
  | "select-file"
  | "open-logic"
  | "open-assets"
  | "open-build"
  | "open-connections"
  | "open-checkpoints"
  | "open-settings"
  | "none";

export type ProjectExplorerNode = {
  id: string;
  parentId?: string;
  label: string;
  detail: string;
  icon: typeof Layers;
  depth: number;
  action: ProjectExplorerNodeAction;
  path?: string;
  fileId?: string;
  active?: boolean;
  badge?: string;
  muted?: boolean;
  dirty?: boolean;
};

export type ProjectExplorerModel = {
  nodes: ProjectExplorerNode[];
  controlCount: number;
  metadataPath: string;
  summary: string;
};

export type ProjectExplorerGroupId = "root" | "ui" | "rust" | "backend" | "assets" | "app" | "meta";

export type ProjectExplorerRow =
  | {
      kind: "group";
      id: ProjectExplorerGroupId;
      /** Unique per contiguous run: the same group can open more than once. */
      key: string;
      label: string;
      detail: string;
      count: number;
    }
  | {
      kind: "node";
      node: ProjectExplorerNode;
    };

export type ProjectExplorerStatusTone = "default" | "success" | "warning" | "muted";

export type ProjectSaveManifestItem = {
  id: string;
  title: string;
  detail: string;
  path: string;
  scope: "source" | "generated" | "metadata";
  icon: typeof FileJson;
};

export type ProjectSavePlanStep = {
  id: "source" | "generated" | "metadata";
  title: string;
  detail: string;
  path: string;
  scope: ProjectSaveManifestItem["scope"];
  itemCount: number;
  pendingCount: number;
  status: "ready" | "warning" | "pending";
  actionLabel: string;
  icon: typeof FileJson;
  filter: ProjectExplorerFilterId;
};

export type ProjectFileRouteItem = {
  id: string;
  title: string;
  detail: string;
  path: string;
  query: string;
  filter: ProjectExplorerFilterId;
  nodeId?: string;
  badge?: string;
  icon: typeof FileJson;
};

export type ProjectFileRouteGroup = {
  id: "source" | "generated" | "metadata";
  title: string;
  detail: string;
  countLabel: string;
  icon: typeof FileJson;
  routes: ProjectFileRouteItem[];
};

export type ProjectTopologyNode = {
  id: string;
  title: string;
  detail: string;
  path: string;
  metric: string;
  scope: "source" | "generated" | "metadata" | "runtime";
  icon: typeof FileJson;
  filter: ProjectExplorerFilterId;
  nodeId: string;
  query: string;
  actionLabel: string;
  status: "ready" | "warning" | "pending";
};

export type ProjectSourceOverviewStatus = "clean" | "dirty" | "pending" | "generated";

export type ProjectSourceOverviewRow = {
  id: string;
  title: string;
  kind: string;
  detail: string;
  path: string;
  relativePath: string;
  scope: "source" | "generated" | "metadata";
  status: ProjectSourceOverviewStatus;
  statusLabel: string;
  icon: typeof FileJson;
  filter: ProjectExplorerFilterId;
  nodeId: string;
  query: string;
  actionLabel: string;
  fileId?: string;
};

export type ProjectFolderHealthState = "ready" | "warning" | "pending";

export type ProjectFolderHealthItem = {
  id: "root" | "source" | "generated" | "metadata";
  title: string;
  metric: string;
  detail: string;
  path: string;
  state: ProjectFolderHealthState;
  actionLabel: string;
  icon: typeof FileJson;
  routeGroupId?: ProjectFileRouteGroup["id"];
  sourceRowId?: string;
  nodeId?: string;
  filter?: ProjectExplorerFilterId;
};

export type ProjectWorkingSetKind = "current" | "dirty" | "recent" | "logic" | "build";

export type ProjectWorkingSetItem = {
  id: string;
  kind: ProjectWorkingSetKind;
  label: string;
  detail: string;
  path: string;
  relativePath: string;
  badge: string;
  statusLabel: string;
  nodeId: string;
  dirty: boolean;
  active: boolean;
  tabId?: string;
  /**
   * The workbench the entry belongs to. `kind` is remapped to "current" for the
   * active row, so readiness checks that want "is the build tab present" must
   * look here instead of at `kind` or at badge text.
   */
  tabKind?: BuilderEditorTabKind;
  sourceRowId?: string;
  icon: typeof FileJson;
};

export type ProjectActionCenterTone = "success" | "ready" | "warning" | "danger" | "running" | "muted";

export type ProjectActionCenterAction =
  | { kind: "task"; taskId: ProjectJumpActionId }
  | { kind: "working-set"; itemId: string }
  | { kind: "source-row"; rowId: string }
  | { kind: "run-preset"; presetId: string }
  | { kind: "project-node"; nodeId: string }
  | { kind: "task-detail"; taskId?: string }
  | { kind: "open-build" };

export type ProjectActionCenterItem = {
  id: string;
  kind: "sync" | "file" | "logic" | "run" | "build" | "task" | "node";
  title: string;
  detail: string;
  meta: string;
  badge: string;
  actionLabel: string;
  tone: ProjectActionCenterTone;
  icon: typeof FileJson;
  action: ProjectActionCenterAction;
};

export type ProjectOwnershipMatrixItem = {
  id: ProjectFileRouteGroup["id"];
  title: string;
  owner: string;
  responsibility: string;
  sourceOfTruth: string;
  savePolicy: string;
  routeCount: number;
  countLabel: string;
  primaryRoute: ProjectFileRouteItem;
  actionLabel: string;
  icon: typeof FileJson;
};

export type ProjectExplorerDossier = {
  groupId: ProjectExplorerGroupId;
  groupLabel: string;
  sourceOfTruth: string;
  saveTarget: string;
  syncState: string;
  artifactState: string;
  relatedTabCount: number;
  taskIds: ProjectJumpActionId[];
};

export type ProjectExplorerImpactAction =
  | { kind: "task"; taskId: ProjectJumpActionId }
  | { kind: "open-node" }
  | { kind: "copy-path" }
  | { kind: "copy-relative-path" }
  | { kind: "filter-kind" }
  | { kind: "open-tasks" };

export type ProjectExplorerImpactItem = {
  id: string;
  title: string;
  detail: string;
  badge: string;
  tone: "success" | "warning" | "ready" | "muted";
  actionLabel: string;
  action: ProjectExplorerImpactAction;
  icon: typeof FileJson;
};

export type BuilderIssueItem = {
  id: string;
  kind: "build-error" | "diagnostic" | "property";
  severity: "warning" | "error";
  sourceLabel: string;
  title: string;
  detail: string;
  meta?: string;
  fixable?: boolean;
  diagnostic?: BuildDiagnostic;
  diagnosticIndex?: number;
  propertyIssue?: BuilderPropertyIssue;
};

export function buildDiagnosticKey(diagnostic: BuildDiagnostic, index: number) {
  return [
    diagnostic.severity,
    diagnostic.origin ?? "",
    diagnostic.code ?? "",
    diagnostic.file ?? "",
    diagnostic.line ?? "",
    diagnostic.column ?? "",
    diagnostic.sourceFile ?? "",
    diagnostic.sourceLine ?? "",
    diagnostic.message,
    index,
  ].join("::");
}

export function propertySectionForProp(prop: keyof BuilderItemProps): BuilderPropertySectionId {
  if (["layoutMode", "layoutGap", "layoutPadding", "layoutColumns"].includes(prop)) {
    return "layout";
  }
  if (["checked", "value", "tabIndex", "enabled", "visible", "readOnly"].includes(prop)) {
    return "state";
  }
  if (["variant", "size", "objectFit"].includes(prop)) {
    return "appearance";
  }
  if (["command", "resultStateId", "resultTargetItemId", "resultTargetProp"].includes(prop)) {
    return "actions";
  }
  return "content";
}

export function builderIssueSeverityRank(severity: BuilderIssueItem["severity"]) {
  return severity === "error" ? 0 : 1;
}

export type PalettePointerDrag = {
  type: BuilderComponentType;
  title: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  currentClientX: number;
  currentClientY: number;
  dragging: boolean;
};


export type InlineTextEdit = {
  itemId: string;
  prop: Extract<
    keyof BuilderItemProps,
    "title" | "label" | "value" | "placeholder" | "description" | "helper" | "optionA" | "optionB" | "optionC" | "alt"
  >;
  value: string;
  source: "double-click" | "keyboard" | "context-menu" | "actionbar";
};

export type CanvasContextMenuState = {
  x: number;
  y: number;
  placementX: "left" | "right";
  placementY: "top" | "bottom";
  canvasPoint?: { x: number; y: number };
  itemId?: string;
};

export type ProjectExplorerContextMenuState = {
  x: number;
  y: number;
  placementX: "left" | "right";
  placementY: "top" | "bottom";
  nodeId: string;
};

export const floatingEditorMenuViewportPadding = 12;
export const canvasContextMenuWidth = 240;
export const CANVAS_CONTEXT_INSERT_SEARCH_LIMIT = 8;
export const projectExplorerContextMenuWidth = 240;
export const projectExplorerContextMenuEstimatedHeight = 280;

export function estimateCanvasContextMenuHeight(hasItem: boolean, selectedCount: number) {
  // Compact menu: header + favorites row + action list ≈ 360-480px
  if (!hasItem) {
    return 420;
  }
  return selectedCount > 1 ? 520 : 480;
}

export function placeFloatingEditorMenu(clientX: number, clientY: number, width: number, estimatedHeight: number) {
  const maxX = Math.max(floatingEditorMenuViewportPadding, window.innerWidth - width - floatingEditorMenuViewportPadding);
  const maxY = Math.max(floatingEditorMenuViewportPadding, window.innerHeight - estimatedHeight - floatingEditorMenuViewportPadding);
  return {
    x: Math.min(Math.max(clientX, floatingEditorMenuViewportPadding), maxX),
    y: Math.min(Math.max(clientY, floatingEditorMenuViewportPadding), maxY),
    placementX: clientX > maxX ? ("left" as const) : ("right" as const),
    placementY: clientY > maxY ? ("top" as const) : ("bottom" as const),
  };
}

export type CanvasDragMetricsOverlay = {
  title: string;
  detail: string;
  x: number;
  y: number;
  tone: "move" | "resize";
  precision: boolean;
};

export type CanvasNudgeResult = {
  requestedX: number;
  requestedY: number;
  appliedX: number;
  appliedY: number;
  movedCount: number;
  skippedLockedCount: number;
  skippedAutoLayoutCount: number;
  constrained: boolean;
};

export type RustCompletionTrigger = {
  cursor: number;
  activeIndex: number;
  forced: boolean;
};

export type RustCompletionKind = "snippet" | "command" | "parameter" | "state" | "module" | "dependency" | "symbol";

export type RustCompletionItem = {
  id: string;
  kind: RustCompletionKind;
  label: string;
  detail: string;
  sourceLabel?: string;
  insertPreview?: string;
  targetLine?: number;
  insertText: string;
  cursorOffset?: number;
  replaceStart: number;
  replaceEnd: number;
};

export type RustCompletionCommit = {
  label: string;
  kind: RustCompletionKind;
  insertedLength: number;
  cursor: number;
};

export type RustSignatureParameterHelp = {
  id: string;
  name: string;
  type: string;
  source: string;
  detail: string;
};

export type RustSignatureHelp = {
  commandId: string;
  commandName: string;
  signature: string;
  resultSummary: string;
  activeParameterIndex: number | null;
  parameters: RustSignatureParameterHelp[];
  bindingCount: number;
  source: "cursor-slot" | "active-command";
};

export type LogicSignalSlotRow = {
  id: string;
  item: BuilderItem;
  eventName: BuilderEventName;
  binding: BuilderEventBinding | null;
  command: RustCommand | null;
  commandArgs: RustCommandParameter[];
  selected: boolean;
  inputSummary: string;
  outputSummary: string;
};

export type RustCommandResultImpact = {
  id: string;
  label: string;
  detail: string;
  tone: "target" | "state" | "patch" | "none";
};

export type SlotNavigationEntry = {
  id: string;
  commandId: string;
  commandName: string;
  sourceLine: number | null;
  sourceLabel: string;
  itemId?: string;
  itemName?: string;
  eventName?: BuilderEventName;
  bindingCount: number;
  reason: "command" | "control" | "outline" | "created" | "history";
  visitedAt: string;
};

export type RustLogicOutlineKind = "slot" | "function" | "module" | "type" | "impl" | "constant";

export type RustLogicOutlineEntry = {
  id: string;
  kind: RustLogicOutlineKind;
  label: string;
  detail: string;
  line: number | null;
  column?: number;
  endLine?: number;
  commandId?: string;
  bindingCount: number;
  active: boolean;
};

export type RustEditorSelection = {
  cursor: number;
  selectionStart: number;
  selectionEnd: number;
  line: number;
  column: number;
};

export type RustFindMatch = {
  index: number;
  end: number;
  line: number;
  column: number;
  preview: string;
};

export type RustIdentifierTarget = {
  name: string;
  start: number;
  end: number;
};

export type RustIdentifierReference = {
  id: string;
  index: number;
  end: number;
  line: number;
  column: number;
  preview: string;
  role: "current" | "reference";
};

export type RustBracketMatch = {
  anchor: number;
  anchorBracket: string;
  pair: string;
  direction: "forward" | "backward";
  status: "matched" | "unmatched";
  openIndex?: number;
  closeIndex?: number;
  openLine?: number;
  openColumn?: number;
  closeLine?: number;
  closeColumn?: number;
};

export type RustEditorHoverDoc = {
  kind: RustLogicOutlineKind | "command" | "state" | "dependency" | "global";
  title: string;
  detail: string;
  location: string;
  sourceLine?: number;
  commandId?: string;
  controlItemId?: string;
  controlEventName?: BuilderEventName;
  badges: string[];
};

export type RustDiagnosticGutterEntry = {
  diagnostic: BuildDiagnostic;
  index: number;
};

export type RustEditorQuickFixTone = "ready" | "warning" | "danger" | "muted";

export type RustEditorQuickFix = {
  id: string;
  title: string;
  detail: string;
  tone: RustEditorQuickFixTone;
  actionLabel: string;
  countLabel?: string;
  disabled?: boolean;
  run: () => void;
};

export type RustEditorMinimapMarker = {
  id: string;
  kind: "outline" | "diagnostic" | "find" | "identifier" | "cursor";
  line: number;
  label: string;
  severity?: "error" | "warning";
};

export type CanvasBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
};

export type SmartGuideSource = "control" | "canvas" | "safe-margin";

export type SmartGuide = {
  id: string;
  axis: "x" | "y";
  source: SmartGuideSource;
  position: number;
  start: number;
  end: number;
  label: string;
  snapDeltaX?: number;
  snapDeltaY?: number;
};

export const canvasZoomLevels = [0.25, 0.35, 0.5, 0.65, 0.8, 1, 1.25, 1.5, 2] as const;
export const SMART_GUIDE_THRESHOLD = 4;
export const SMART_GUIDE_SAFE_MARGIN = 24;

export const resizeHandleMetas: Array<{ handle: ResizeHandle; label: string; className: string }> = [
  { handle: "nw", label: "从左上调整尺寸", className: "-left-3 -top-3 cursor-nwse-resize" },
  { handle: "n", label: "从上边调整高度", className: "-top-3 left-1/2 -translate-x-1/2 cursor-ns-resize" },
  { handle: "ne", label: "从右上调整尺寸", className: "-right-3 -top-3 cursor-nesw-resize" },
  { handle: "e", label: "从右边调整宽度", className: "-right-3 top-1/2 -translate-y-1/2 cursor-ew-resize" },
  { handle: "se", label: "从右下调整尺寸", className: "-bottom-3 -right-3 cursor-nwse-resize" },
  { handle: "s", label: "从下边调整高度", className: "-bottom-3 left-1/2 -translate-x-1/2 cursor-ns-resize" },
  { handle: "sw", label: "从左下调整尺寸", className: "-bottom-3 -left-3 cursor-nesw-resize" },
  { handle: "w", label: "从左边调整宽度", className: "-left-3 top-1/2 -translate-y-1/2 cursor-ew-resize" },
];

export function resizeHandleCursor(handle: ResizeHandle) {
  if (handle === "n" || handle === "s") {
    return "ns-resize";
  }
  if (handle === "e" || handle === "w") {
    return "ew-resize";
  }
  if (handle === "ne" || handle === "sw") {
    return "nesw-resize";
  }
  return "nwse-resize";
}

export function resizePatchForHandle(
  session: Extract<DragSession, { kind: "resize" }>,
  deltaX: number,
  deltaY: number,
  page: PageConfig,
): ResponsiveOverride {
  const right = session.originX + session.originWidth;
  const bottom = session.originY + session.originHeight;
  let x = session.originX;
  let y = session.originY;
  let width = session.originWidth;
  let height = session.originHeight;

  if (session.handle.includes("w")) {
    const nextX = snap(session.originX + deltaX, page.gridSize, page.snapToGrid);
    x = clamp(nextX, 0, Math.max(0, right - MIN_ITEM_WIDTH));
    width = right - x;
  } else if (session.handle.includes("e")) {
    width = snap(session.originWidth + deltaX, page.gridSize, page.snapToGrid);
  }

  if (session.handle.includes("n")) {
    const nextY = snap(session.originY + deltaY, page.gridSize, page.snapToGrid);
    y = clamp(nextY, 0, Math.max(0, bottom - MIN_ITEM_HEIGHT));
    height = bottom - y;
  } else if (session.handle.includes("s")) {
    height = snap(session.originHeight + deltaY, page.gridSize, page.snapToGrid);
  }

  return {
    x,
    y,
    width: clamp(width, MIN_ITEM_WIDTH, Math.max(MIN_ITEM_WIDTH, page.width - x)),
    height: clamp(height, MIN_ITEM_HEIGHT, Math.max(MIN_ITEM_HEIGHT, page.height - y)),
  };
}

export function itemCanvasBounds(item: BuilderItem, items: BuilderItem[]): CanvasBounds {
  const position = getAbsolutePosition(item, items);
  return {
    left: position.x,
    top: position.y,
    right: position.x + item.width,
    bottom: position.y + item.height,
    centerX: position.x + item.width / 2,
    centerY: position.y + item.height / 2,
    width: item.width,
    height: item.height,
  };
}

export function boundsFromRects(rects: CanvasBounds[]): CanvasBounds {
  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  return {
    left,
    top,
    right,
    bottom,
    centerX: left + (right - left) / 2,
    centerY: top + (bottom - top) / 2,
    width: right - left,
    height: bottom - top,
  };
}

export function createSmartGuidesForDragSession(
  session: DragSession,
  sourceItems: BuilderItem[],
  page: PageConfig,
  deltaX: number,
  deltaY: number,
): SmartGuide[] {
  const movingRootIds = session.kind === "move" ? session.ids : [session.id];
  const movingIds = collectDescendantIds(movingRootIds, sourceItems);
  const movingRects = movingRootIds
    .map((id) => {
      const item = sourceItems.find((candidate) => candidate.id === id);
      if (!item) {
        return null;
      }
      const parent = item.parentId ? sourceItems.find((candidate) => candidate.id === item.parentId) : null;
      const parentPosition = parent ? getAbsolutePosition(parent, sourceItems) : { x: 0, y: 0 };
      if (session.kind === "resize") {
        const patch = resizePatchForHandle(session, deltaX, deltaY, page);
        return {
          left: parentPosition.x + Number(patch.x ?? item.x),
          top: parentPosition.y + Number(patch.y ?? item.y),
          right: parentPosition.x + Number(patch.x ?? item.x) + Number(patch.width ?? item.width),
          bottom: parentPosition.y + Number(patch.y ?? item.y) + Number(patch.height ?? item.height),
          centerX: parentPosition.x + Number(patch.x ?? item.x) + Number(patch.width ?? item.width) / 2,
          centerY: parentPosition.y + Number(patch.y ?? item.y) + Number(patch.height ?? item.height) / 2,
          width: Number(patch.width ?? item.width),
          height: Number(patch.height ?? item.height),
        };
      }
      const origin = session.origins[item.id] ?? { x: item.x, y: item.y };
      const width = item.width;
      const height = item.height;
      const left = parentPosition.x + snap(origin.x + deltaX, page.gridSize, page.snapToGrid);
      const top = parentPosition.y + snap(origin.y + deltaY, page.gridSize, page.snapToGrid);
      return {
        left,
        top,
        right: left + width,
        bottom: top + height,
        centerX: left + width / 2,
        centerY: top + height / 2,
        width,
        height,
      };
    })
    .filter((rect): rect is CanvasBounds => Boolean(rect));
  if (movingRects.length === 0) {
    return [];
  }

  const movingBounds = boundsFromRects(movingRects);
  const candidates = sourceItems.filter((item) => !movingIds.has(item.id));
  type SmartGuideMatch = { diff: number; guide: SmartGuide };
  const xGuideMatches: SmartGuideMatch[] = [];
  const yGuideMatches: SmartGuideMatch[] = [];
  const movingXAnchors = [
    { key: "left", label: "左边" },
    { key: "centerX", label: "中心" },
    { key: "right", label: "右边" },
  ] as const;
  const movingYAnchors = [
    { key: "top", label: "上边" },
    { key: "centerY", label: "中心" },
    { key: "bottom", label: "下边" },
  ] as const;
  type XAnchor = { key: "left" | "centerX" | "right"; label: string };
  type YAnchor = { key: "top" | "centerY" | "bottom"; label: string };

  const considerXGuide = (candidateId: string, candidateBounds: CanvasBounds, candidateAnchors: readonly XAnchor[], source: SmartGuideSource) => {
    for (const movingAnchor of movingXAnchors) {
      for (const candidateAnchor of candidateAnchors) {
        const snapDeltaX = candidateBounds[candidateAnchor.key] - movingBounds[movingAnchor.key];
        const diff = Math.abs(snapDeltaX);
        if (diff <= SMART_GUIDE_THRESHOLD) {
          const position = candidateBounds[candidateAnchor.key];
          xGuideMatches.push({
            diff,
            guide: {
              id: `x-${source}-${candidateId}-${movingAnchor.key}-${candidateAnchor.key}`,
              axis: "x",
              source,
              position,
              start: source === "control" ? clamp(Math.min(movingBounds.top, candidateBounds.top) - 28, 0, page.height) : 0,
              end: source === "control" ? clamp(Math.max(movingBounds.bottom, candidateBounds.bottom) + 28, 0, page.height) : page.height,
              label: `${movingAnchor.label} 对齐 ${candidateAnchor.label}`,
              snapDeltaX,
            },
          });
        }
      }
    }
  };

  const considerYGuide = (candidateId: string, candidateBounds: CanvasBounds, candidateAnchors: readonly YAnchor[], source: SmartGuideSource) => {
    for (const movingAnchor of movingYAnchors) {
      for (const candidateAnchor of candidateAnchors) {
        const snapDeltaY = candidateBounds[candidateAnchor.key] - movingBounds[movingAnchor.key];
        const diff = Math.abs(snapDeltaY);
        if (diff <= SMART_GUIDE_THRESHOLD) {
          const position = candidateBounds[candidateAnchor.key];
          yGuideMatches.push({
            diff,
            guide: {
              id: `y-${source}-${candidateId}-${movingAnchor.key}-${candidateAnchor.key}`,
              axis: "y",
              source,
              position,
              start: source === "control" ? clamp(Math.min(movingBounds.left, candidateBounds.left) - 28, 0, page.width) : 0,
              end: source === "control" ? clamp(Math.max(movingBounds.right, candidateBounds.right) + 28, 0, page.width) : page.width,
              label: `${movingAnchor.label} 对齐 ${candidateAnchor.label}`,
              snapDeltaY,
            },
          });
        }
      }
    }
  };

  for (const candidate of candidates) {
    const candidateBounds = itemCanvasBounds(candidate, sourceItems);
    const candidateXAnchors = [
      { key: "left", label: "左边" },
      { key: "centerX", label: "中心" },
      { key: "right", label: "右边" },
    ] as const;
    const candidateYAnchors = [
      { key: "top", label: "上边" },
      { key: "centerY", label: "中心" },
      { key: "bottom", label: "下边" },
    ] as const;

    considerXGuide(candidate.id, candidateBounds, candidateXAnchors, "control");
    considerYGuide(candidate.id, candidateBounds, candidateYAnchors, "control");
  }

  const canvasGuideBounds: CanvasBounds = {
    left: 0,
    top: 0,
    right: page.width,
    bottom: page.height,
    centerX: page.width / 2,
    centerY: page.height / 2,
    width: page.width,
    height: page.height,
  };
  const canvasXAnchors: readonly XAnchor[] = [
    { key: "left", label: "画布左边" },
    { key: "centerX", label: "画布中线" },
    { key: "right", label: "画布右边" },
  ];
  const canvasYAnchors: readonly YAnchor[] = [
    { key: "top", label: "画布上边" },
    { key: "centerY", label: "画布中线" },
    { key: "bottom", label: "画布下边" },
  ];
  considerXGuide("canvas", canvasGuideBounds, canvasXAnchors, "canvas");
  considerYGuide("canvas", canvasGuideBounds, canvasYAnchors, "canvas");

  const safeMarginGuideBounds: CanvasBounds = {
    left: SMART_GUIDE_SAFE_MARGIN,
    top: SMART_GUIDE_SAFE_MARGIN,
    right: Math.max(SMART_GUIDE_SAFE_MARGIN, page.width - SMART_GUIDE_SAFE_MARGIN),
    bottom: Math.max(SMART_GUIDE_SAFE_MARGIN, page.height - SMART_GUIDE_SAFE_MARGIN),
    centerX: page.width / 2,
    centerY: page.height / 2,
    width: Math.max(0, page.width - SMART_GUIDE_SAFE_MARGIN * 2),
    height: Math.max(0, page.height - SMART_GUIDE_SAFE_MARGIN * 2),
  };
  const safeMarginXAnchors: readonly XAnchor[] = [
    { key: "left", label: "安全左边距" },
    { key: "right", label: "安全右边距" },
  ];
  const safeMarginYAnchors: readonly YAnchor[] = [
    { key: "top", label: "安全上边距" },
    { key: "bottom", label: "安全下边距" },
  ];
  considerXGuide("safe-margin", safeMarginGuideBounds, safeMarginXAnchors, "safe-margin");
  considerYGuide("safe-margin", safeMarginGuideBounds, safeMarginYAnchors, "safe-margin");

  const bestX = xGuideMatches.reduce<SmartGuideMatch | null>((best, match) => (!best || match.diff < best.diff ? match : best), null);
  const bestY = yGuideMatches.reduce<SmartGuideMatch | null>((best, match) => (!best || match.diff < best.diff ? match : best), null);
  return [bestX?.guide, bestY?.guide].filter((guide): guide is SmartGuide => Boolean(guide));
}

export type BuilderPropertyAutoFixTarget = {
  fileId: string;
  fileName: string;
  itemId: string;
  itemName: string;
  itemType: BuilderComponentType;
  issueCount: number;
  patch: BuilderItemProps;
  propertyCount: number;
};

export type BuilderPropertyAutoFixSummary = {
  targets: BuilderPropertyAutoFixTarget[];
  issueCount: number;
  errorCount: number;
  warningCount: number;
  manualIssueCount: number;
  propertyCount: number;
  fileCount: number;
};

export type ProjectSnapshotEntry = {
  id: string;
  createdAt: string;
  label: string;
  fingerprint: string;
  project: DesignerProject;
};

export type ProjectActivityEntry = {
  id: string;
  time: string;
  kind: "pipeline" | "build" | "bundle" | "validation" | "maintenance" | "run" | "runtime-log" | "smoke" | "checkpoint";
  title: string;
  status: string;
  summary: string;
  path?: string;
  secondaryPath?: string;
};


export type ProjectJumpResult = {
  id: string;
  kind: ProjectJumpKind;
  title: string;
  subtitle: string;
  badge: string;
  mode: BuilderMode;
  searchable: string;
  fileId?: string;
  itemId?: string;
  commandId?: string;
  stateId?: string;
  assetId?: string;
  actionId?: ProjectJumpActionId;
  insertComponentType?: BuilderComponentType;
  path?: string;
  secondaryPath?: string;
};

export type ProjectJumpFeedback = {
  id: string;
  tone: "success" | "warning" | "error";
  title: string;
  detail: string;
};

export type EditorWorkflowStep = {
  id: "save" | "generate" | "check" | "validate" | "build";
  title: string;
  detail: string;
  badge: string;
  icon: typeof Save;
  actions: ProjectJumpActionId[];
};

export type EditorExperienceAuditSeverity = import("./status-labels").EditorExperienceAuditSeverity;
export type EditorExperienceAuditFilter = "all" | EditorExperienceAuditSeverity;

export type EditorExperienceAuditItem = {
  id: string;
  title: string;
  detail: string;
  severity: EditorExperienceAuditSeverity;
};

export type QtCreatorParityItem = {
  requirement: number;
  title: string;
  detail: string;
  evidenceIds: string[];
  severity: EditorExperienceAuditSeverity;
};

export const EDITOR_EXPERIENCE_KNOWN_WINDOW_KINDS: ReleaseWindowKind[] = ["main", "dialog", "tool", "frameless"];
export const EDITOR_EXPERIENCE_KNOWN_TITLEBAR_STYLES: ReleaseTitlebarStyle[] = ["nova", "native", "hidden"];
export const RUST_RESERVED_WORDS = new Set([
  "as",
  "async",
  "await",
  "break",
  "const",
  "continue",
  "crate",
  "dyn",
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
]);

export type InspectorWorkflowStep = {
  id: string;
  title: string;
  detail: string;
  badge: string;
  icon: typeof Save;
  actionLabel: string;
  tone: "primary" | "ready" | "warning" | "danger" | "muted";
  disabled?: boolean;
  onAction: () => void;
};

export type DestructiveActionRequest = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
};

export type SimulatorTraceEntry = {
  id: string;
  time: string;
  itemName: string;
  eventName: BuilderEventName;
  commandName: string;
  status: "success" | "error";
  args?: Record<string, unknown>;
  rawResult: string;
  message: string;
  patch: Record<string, string>;
  target?: string;
};

export function formatSimulatorTraceLog(trace: SimulatorTraceEntry) {
  const args = trace.args && Object.keys(trace.args).length > 0 ? JSON.stringify(trace.args) : "{}";
  const patch = Object.keys(trace.patch).length > 0 ? JSON.stringify(trace.patch) : "{}";

  return [
    `[${trace.time}] ${trace.status.toUpperCase()} ${trace.itemName}.${trace.eventName}`,
    `command: ${trace.commandName}`,
    `message: ${trace.message}`,
    `args: ${args}`,
    `result: ${trace.rawResult}`,
    trace.target ? `target: ${trace.target}` : "target: none",
    `状态补丁： ${patch}`,
  ].join("\n");
}

export type BuildReadinessSeverity = "ready" | "warning" | "error";

export type BuildReadinessItem = {
  id: string;
  severity: BuildReadinessSeverity;
  title: string;
  detail: string;
  fileName?: string;
  fileId?: string;
  itemId?: string;
  itemName?: string;
};

export type BuildReadinessSummary = {
  items: BuildReadinessItem[];
  readyCount: number;
  warningCount: number;
  errorCount: number;
  score: number;
};

export type ReleaseReadinessItem = {
  id: string;
  severity: BuildReadinessSeverity;
  title: string;
  detail: string;
  score: number;
};

export type ReleaseReadinessSummary = {
  score: number;
  status: BuildReadinessSeverity;
  blockers: number;
  warnings: number;
  items: ReleaseReadinessItem[];
  nextActions: string[];
};

export type WindowVisualAuditSeverity = "pass" | "warning" | "error";

export type WindowVisualAuditIssue = {
  id: string;
  severity: WindowVisualAuditSeverity;
  title: string;
  detail: string;
  fileId: string;
  fileName: string;
  itemId?: string;
  itemName?: string;
};

export type WindowVisualAuditSummary = {
  issues: WindowVisualAuditIssue[];
  checkedFiles: number;
  checkedItems: number;
  warningCount: number;
  errorCount: number;
  score: number;
};

export const LEGACY_BUILDER_STORAGE_KEY = "nova-ui-kit-builder-freeform-v2";
export const DESIGNER_WORKSPACE_STORAGE_KEY = "nova-ui-kit-designer-workspace-v1";
export const PROJECT_JUMP_RECENTS_STORAGE_KEY = "nova-ui-kit-project-jump-recents-v1";
export const COMPONENT_PALETTE_RECENTS_STORAGE_KEY = "nova-ui-kit-component-palette-recents-v1";
export const COMPONENT_PALETTE_FAVORITES_STORAGE_KEY = "nova-ui-kit-component-palette-favorites-v1";

export const canvasPresets: Array<{ id: CanvasPresetId; title: string; description: string; width: number; height: number; icon: typeof Monitor }> = [
  { id: "desktop", title: "桌面", description: "1440 x 900", width: 1440, height: 900, icon: Monitor },
  { id: "wide", title: "宽屏", description: "1728 x 1024", width: 1728, height: 1024, icon: Monitor },
  { id: "dialog", title: "弹窗", description: "720 x 520", width: 720, height: 520, icon: RectangleHorizontal },
  { id: "tablet", title: "平板", description: "1024 x 768", width: 1024, height: 768, icon: RectangleHorizontal },
  { id: "mobile", title: "手机", description: "390 x 844", width: 390, height: 844, icon: Smartphone },
];

export const responsiveBreakpoints: Array<{ id: ResponsiveBreakpointId; title: string; width: number; height: number; icon: typeof Monitor }> = [
  { id: "desktop", title: "桌面", width: 1440, height: 900, icon: Monitor },
  { id: "tablet", title: "平板", width: 1024, height: 768, icon: RectangleHorizontal },
  { id: "mobile", title: "手机", width: 390, height: 844, icon: Smartphone },
];

export const eventResultTargetProps: Array<{ value: BuilderResultTargetProp; label: string }> = [
  { value: "value", label: "值" },
  { value: "label", label: "标签" },
  { value: "title", label: "标题" },
  { value: "description", label: "说明" },
  { value: "helper", label: "辅助文本" },
];

export const buttonVariantValues = ["default", "secondary", "outline", "ghost", "destructive"] as const satisfies readonly ButtonVariant[];
export const controlSizeValues = ["sm", "md", "lg"] as const satisfies readonly ControlSize[];
export const imageFitValues = ["cover", "contain", "fill"] as const satisfies readonly ImageFit[];
export const frameLayoutValues = ["free", "row", "column", "grid"] as const satisfies readonly FrameLayoutMode[];
export const frameLayoutLabel = (mode: FrameLayoutMode) => {
  if (mode === "row") {
    return "水平行布局";
  }
  if (mode === "column") {
    return "垂直列布局";
  }
  if (mode === "grid") {
    return "网格布局";
  }
  return "自由布局";
};
export const focusableBuilderComponentTypes = [
  "link-label",
  "button",
  "button-group",
  "dialog-button-box",
  "command-link-button",
  "menu-button",
  "split-button",
  "tool-button",
  "toggle-button",
  "toggle-group",
  "input",
  "password-field",
  "number-field",
  "spin-box",
  "double-spin-box",
  "dial",
  "textarea",
  "plain-text-edit",
  "rich-text-editor",
  "code-editor",
  "terminal-view",
  "search-bar",
  "search-view",
  "search-suggestion-list",
  "filter-bar",
  "tag-input",
  "checkbox",
  "checkbox-group",
  "radio",
  "radio-group",
  "switch",
  "slider",
  "range-slider",
  "rating",
  "scroll-bar",
  "color-picker",
  "file-picker",
  "folder-picker",
  "shortcut-recorder",
  "select",
  "multi-select",
  "combobox",
  "autocomplete",
  "font-combo-box",
  "date-picker",
  "date-range-picker",
  "time-picker",
  "date-time-picker",
  "calendar-widget",
  "calendar-scheduler",
  "segmented",
  "chips",
  "assist-chip",
  "filter-chip",
  "input-chip",
  "suggestion-chip",
  "tabs",
  "menu-bar",
  "menu",
  "context-menu",
  "command-list",
  "command-palette",
  "filter-bar",
  "notification-center",
  "system-tray",
  "shortcut-table",
  "resource-browser",
  "task-list",
  "settings-list",
  "tree-view",
  "tree-table",
  "outline-view",
  "signal-slot-editor",
  "node-graph",
  "log-viewer",
  "property-browser",
  "breadcrumb-bar",
  "pagination",
  "toolbar",
  "floating-toolbar",
  "top-app-bar",
  "bottom-app-bar",
  "navigation-bar",
  "navigation-suite",
  "splitter",
  "size-grip",
  "navigation",
  "navigation-drawer",
  "navigation-item",
  "navigation-rail",
  "accordion",
  "tool-box",
  "dialog",
  "popover",
  "sheet-drag-handle",
  "stepper",
  "alert",
  "toast",
  "empty-panel",
  "snackbar",
  "section-header",
  "fab",
  "extended-fab",
  "elevated-card",
  "filled-card",
  "outlined-card",
  "avatar-group",
  "image-list",
  "icon-button",
  "list-item",
  "table",
  "table-view",
  "kanban-board",
  "data-grid",
  "property-grid",
  "progress-list",
] as const satisfies readonly BuilderComponentType[];
export const focusableBuilderComponentTypeSet = new Set<BuilderComponentType>(focusableBuilderComponentTypes);
export const readOnlyBuilderComponentTypes = [
  "input",
  "password-field",
  "number-field",
  "spin-box",
  "double-spin-box",
  "textarea",
  "plain-text-edit",
  "rich-text-editor",
  "code-editor",
  "terminal-view",
  "search-bar",
  "search-view",
  "search-suggestion-list",
  "filter-bar",
  "combobox",
  "autocomplete",
  "font-combo-box",
  "date-picker",
  "date-range-picker",
  "time-picker",
  "date-time-picker",
  "color-picker",
  "file-picker",
  "shortcut-recorder",
] as const satisfies readonly BuilderComponentType[];
export const readOnlyBuilderComponentTypeSet = new Set<BuilderComponentType>(readOnlyBuilderComponentTypes);

export const builderPropertySchema: BuilderPropertySchemaField[] = [
  { prop: "title", label: "标题", kind: "text", appliesTo: ["heading", "text-browser", "web-view", "media-player", "pdf-viewer", "map-view", "graphics-view", "image-list", "code-editor", "command-link-button", "switch", "card", "section-header", "elevated-card", "filled-card", "outlined-card", "carousel", "empty-state", "empty-panel", "table", "table-view", "kanban-board", "calendar-scheduler", "data-grid", "property-grid", "key-value-list", "inspector-section", "form-layout", "console-panel", "terminal-view", "timeline", "status-indicator", "tabs", "menu-bar", "menu", "context-menu", "list", "list-item", "list-view", "column-view", "icon-view", "command-list", "command-palette", "search-view", "search-suggestion-list", "notification-center", "system-tray", "shortcut-table", "resource-browser", "task-list", "settings-list", "tree-view", "tree-table", "breadcrumb-bar", "pagination", "toolbar", "floating-toolbar", "top-app-bar", "bottom-app-bar", "navigation-bar", "navigation-item", "navigation-suite", "status-bar", "split-view", "splitter", "size-grip", "supporting-pane", "scroll-area", "stacked-pages", "dock-panel", "mdi-area", "navigation", "navigation-drawer", "navigation-rail", "side-sheet", "bottom-sheet", "sheet-drag-handle", "accordion", "tool-box", "dialog", "popover", "stepper", "wizard", "banner", "alert", "tooltip", "snackbar", "toast", "progress", "circular-progress", "progress-list", "avatar-group", "lcd-display", "chart-view", "filter-bar", "problems-panel", "breakpoints-panel", "watch-panel", "call-stack"], required: true, minLength: 1, maxLength: 72 },
  { prop: "title", label: "标题", kind: "text", appliesTo: ["frame", "group-box", "spacer"], recommended: true, maxLength: 72 },
  { prop: "label", label: "标签", kind: "text", appliesTo: ["label", "link-label", "button", "button-group", "dialog-button-box", "command-link-button", "menu-button", "split-button", "tool-button", "toggle-button", "toggle-group", "icon-button", "input", "password-field", "number-field", "spin-box", "double-spin-box", "dial", "textarea", "plain-text-edit", "rich-text-editor", "code-editor", "terminal-view", "search-bar", "search-view", "search-suggestion-list", "filter-bar", "tag-input", "select", "multi-select", "combobox", "autocomplete", "font-combo-box", "date-picker", "date-range-picker", "time-picker", "date-time-picker", "calendar-widget", "calendar-scheduler", "checkbox", "checkbox-group", "radio", "radio-group", "slider", "range-slider", "rating", "scroll-bar", "color-picker", "file-picker", "folder-picker", "shortcut-recorder", "segmented", "chips", "assist-chip", "filter-chip", "input-chip", "suggestion-chip", "notification-center", "system-tray", "breadcrumb-bar", "pagination", "navigation-bar", "navigation-item", "status-bar", "side-sheet", "bottom-sheet", "sheet-drag-handle", "empty-state", "empty-panel", "dialog", "popover", "stepper", "wizard", "banner", "alert", "tooltip", "snackbar", "toast", "fab", "extended-fab", "section-header", "elevated-card", "filled-card", "outlined-card", "stat", "lcd-display", "chart-view", "web-view", "media-player", "pdf-viewer", "map-view", "image-list", "progress", "circular-progress", "progress-list", "avatar", "avatar-group", "badge", "kanban-board", "list-item"], required: true, minLength: 1, maxLength: 64 },
  { prop: "value", label: "值", kind: "text", appliesTo: ["link-label", "text-browser", "web-view", "media-player", "pdf-viewer", "map-view", "graphics-view", "image-list", "menu-button", "split-button", "button-group", "toggle-group", "password-field", "number-field", "spin-box", "double-spin-box", "dial", "spacer", "textarea", "plain-text-edit", "rich-text-editor", "code-editor", "terminal-view", "search-bar", "search-view", "search-suggestion-list", "filter-bar", "tag-input", "select", "multi-select", "combobox", "autocomplete", "font-combo-box", "date-picker", "date-range-picker", "time-picker", "date-time-picker", "calendar-widget", "calendar-scheduler", "checkbox-group", "radio", "radio-group", "slider", "range-slider", "rating", "scroll-bar", "color-picker", "file-picker", "folder-picker", "shortcut-recorder", "segmented", "chips", "assist-chip", "filter-chip", "input-chip", "suggestion-chip", "context-menu", "list-item", "list-view", "column-view", "icon-view", "command-list", "command-palette", "notification-center", "system-tray", "shortcut-table", "resource-browser", "task-list", "settings-list", "tree-view", "tree-table", "breadcrumb-bar", "pagination", "stepper", "wizard", "navigation-bar", "navigation-item", "navigation-suite", "floating-toolbar", "splitter", "size-grip", "supporting-pane", "scroll-area", "stacked-pages", "dock-panel", "mdi-area", "table-view", "data-grid", "property-grid", "key-value-list", "inspector-section", "accordion", "tool-box", "console-panel", "timeline", "status-indicator", "carousel", "section-header", "elevated-card", "filled-card", "outlined-card", "stat", "lcd-display", "chart-view", "progress", "circular-progress", "progress-list", "tabs", "avatar", "avatar-group", "kanban-board", "problems-panel", "breakpoints-panel", "watch-panel", "call-stack", "sheet-drag-handle"], required: true, minLength: 1, maxLength: 240 },
  { prop: "description", label: "说明", kind: "text", appliesTo: ["heading", "label", "link-label", "text-browser", "web-view", "media-player", "pdf-viewer", "map-view", "graphics-view", "image-list", "code-editor", "command-link-button", "switch", "card", "section-header", "elevated-card", "filled-card", "outlined-card", "carousel", "empty-state", "empty-panel", "table", "table-view", "kanban-board", "calendar-scheduler", "data-grid", "property-grid", "key-value-list", "inspector-section", "form-layout", "console-panel", "terminal-view", "timeline", "status-indicator", "group-box", "spacer", "menu-bar", "menu", "context-menu", "list", "list-item", "list-view", "column-view", "icon-view", "command-list", "command-palette", "search-view", "search-suggestion-list", "notification-center", "system-tray", "shortcut-table", "resource-browser", "task-list", "settings-list", "tree-view", "tree-table", "breadcrumb-bar", "pagination", "toolbar", "floating-toolbar", "top-app-bar", "bottom-app-bar", "navigation-bar", "navigation-item", "navigation-suite", "status-bar", "split-view", "splitter", "size-grip", "supporting-pane", "scroll-area", "stacked-pages", "dock-panel", "mdi-area", "navigation", "navigation-drawer", "navigation-rail", "side-sheet", "bottom-sheet", "sheet-drag-handle", "accordion", "tool-box", "dialog", "popover", "stepper", "wizard", "banner", "alert", "tooltip", "snackbar", "toast", "progress", "circular-progress", "progress-list", "avatar-group", "lcd-display", "chart-view", "filter-bar", "assist-chip", "filter-chip", "input-chip", "suggestion-chip", "problems-panel", "breakpoints-panel", "watch-panel", "call-stack"], maxLength: 180 },
  { prop: "placeholder", label: "占位文本", kind: "text", appliesTo: ["input", "password-field", "number-field", "spin-box", "double-spin-box", "textarea", "plain-text-edit", "rich-text-editor", "code-editor", "terminal-view", "search-bar", "search-view", "search-suggestion-list", "filter-bar", "tag-input", "command-list", "command-palette", "combobox", "autocomplete", "font-combo-box", "date-picker", "date-range-picker", "date-time-picker", "file-picker", "folder-picker"], maxLength: 96 },
  { prop: "helper", label: "辅助文本", kind: "text", appliesTo: ["link-label", "input", "password-field", "number-field", "spin-box", "double-spin-box", "dial", "slider", "range-slider", "rating", "scroll-bar", "button-group", "toggle-group", "dialog-button-box", "command-link-button", "menu-button", "command-list", "command-palette", "search-view", "search-suggestion-list", "autocomplete", "date-picker", "date-range-picker", "time-picker", "date-time-picker", "calendar-widget", "calendar-scheduler", "checkbox-group", "radio-group", "multi-select", "tag-input", "color-picker", "file-picker", "folder-picker", "shortcut-recorder", "stat", "lcd-display", "code-editor", "terminal-view", "media-player", "pdf-viewer", "map-view", "image-list", "avatar", "avatar-group", "filter-bar", "pagination", "kanban-board", "assist-chip", "filter-chip", "input-chip", "suggestion-chip", "floating-toolbar", "elevated-card", "filled-card", "outlined-card", "section-header", "list-item", "navigation-item", "sheet-drag-handle", "progress-list", "problems-panel", "breakpoints-panel", "watch-panel", "call-stack"], maxLength: 120 },
  { prop: "variant", label: "变体", kind: "select", appliesTo: ["button", "button-group", "dialog-button-box", "command-link-button", "menu-button", "split-button", "tool-button", "toggle-button", "toggle-group", "icon-button", "badge", "chips", "assist-chip", "filter-chip", "input-chip", "suggestion-chip", "banner", "alert", "progress", "circular-progress", "snackbar", "toast", "fab", "extended-fab", "floating-toolbar"], options: buttonVariantValues },
  { prop: "size", label: "尺寸", kind: "select", appliesTo: ["button", "button-group", "dialog-button-box", "command-link-button", "menu-button", "split-button", "tool-button", "toggle-button", "toggle-group", "icon-button", "fab", "extended-fab", "assist-chip", "filter-chip", "input-chip", "suggestion-chip", "floating-toolbar"], options: controlSizeValues },
  { prop: "checked", label: "选中状态", kind: "boolean", appliesTo: ["checkbox", "radio", "switch", "toggle-button", "filter-chip", "navigation-item"] },
  { prop: "checked", label: "显示密码", kind: "boolean", appliesTo: ["password-field"] },
  { prop: "enabled", label: "启用", kind: "boolean", appliesTo: focusableBuilderComponentTypes },
  { prop: "visible", label: "可见", kind: "boolean", appliesTo: focusableBuilderComponentTypes },
  { prop: "readOnly", label: "只读", kind: "boolean", appliesTo: readOnlyBuilderComponentTypes },
  { prop: "tabIndex", label: "Tab 顺序", kind: "number", appliesTo: focusableBuilderComponentTypes, min: -1, max: 999 },
  { prop: "slotBindings", label: "插槽绑定", kind: "text", appliesTo: ["frame", "card", "tabs", "dialog-button-box", "group-box"], maxLength: 120 },
  { prop: "twoWayBindings", label: "双向绑定", kind: "text", appliesTo: ["input", "textarea", "select", "checkbox", "switch", "slider", "number-field"], maxLength: 120 },
  { prop: "alt", label: "替代文本", kind: "text", appliesTo: ["image"], recommended: true, maxLength: 120 },
  { prop: "objectFit", label: "图片适配", kind: "select", appliesTo: ["image", "image-list"], options: imageFitValues },
  { prop: "layoutMode", label: "布局模式", kind: "select", appliesTo: ["frame"], recommended: true, options: frameLayoutValues },
  { prop: "layoutGap", label: "布局间距", kind: "number", appliesTo: ["frame"], min: 0, max: 96 },
  { prop: "layoutPadding", label: "内边距", kind: "number", appliesTo: ["frame"], min: 0, max: 96 },
  { prop: "layoutColumns", label: "网格列数", kind: "number", appliesTo: ["frame"], min: 1, max: 12 },
];

export const defaultPage: PageConfig = {
  title: "未命名界面",
  windowKind: "main",
  titlebarStyle: "nova",
  titlebarSubtitle: "桌面界面",
  preset: "desktop",
  activeBreakpoint: "desktop",
  width: 1440,
  height: 900,
  background: "grid",
  showGrid: true,
  showRulers: true,
  snapToGrid: true,
  gridSize: 8,
  zoom: 0.5,
  autoSave: true,
};


export type ComponentPaletteCategoryId = "all" | "layout" | "inputs" | "data" | "display";

export const componentPaletteCategoryOptions = [
  { id: "all", label: "全部", description: "全部控件" },
  { id: "layout", label: "布局", description: "布局与结构" },
  { id: "inputs", label: "输入", description: "输入与设置" },
  { id: "data", label: "数据", description: "数据展示" },
  { id: "display", label: "展示", description: "内容与状态" },
] as const satisfies ReadonlyArray<{ id: ComponentPaletteCategoryId; label: string; description: string }>;

export const componentPaletteQuickInsertTypes = ["button", "search-bar", "search-view", "frame", "top-app-bar", "table"] as const satisfies readonly BuilderComponentType[];

export type ComponentPaletteKit = {
  id: string;
  title: string;
  description: string;
  primaryType: BuilderComponentType;
  types: readonly BuilderComponentType[];
};

export const componentPaletteKitDefinitions = [
  {
    id: "md3-window-shell",
    title: "MD3 窗口骨架",
    description: "应用栏、导航、FAB、Sheet 和反馈控件，适合快速搭主窗口。",
    primaryType: "top-app-bar",
    types: ["top-app-bar", "navigation-rail", "navigation-drawer", "navigation-suite", "status-bar", "extended-fab", "side-sheet", "bottom-sheet", "snackbar"],
  },
  {
    id: "qt-main-window",
    title: "Qt 主窗口",
    description: "菜单栏、工具栏、状态栏、Dock、分割区和 MDI 区。",
    primaryType: "menu-bar",
    types: ["menu-bar", "toolbar", "status-bar", "dock-panel", "split-view", "splitter", "tree-view", "property-browser", "mdi-area"],
  },
  {
    id: "data-workbench",
    title: "数据工作台",
    description: "过滤、表格、树表、属性网格、图表和分页视图。",
    primaryType: "table-view",
    types: ["filter-bar", "table-view", "data-grid", "tree-table", "property-grid", "chart-view", "pagination", "empty-panel"],
  },
  {
    id: "settings-form",
    title: "设置表单",
    description: "Section、表单布局、输入项、开关、分组和按钮盒。",
    primaryType: "form-layout",
    types: ["section-header", "form-layout", "input", "combobox", "switch", "checkbox-group", "radio-group", "slider", "dialog-button-box", "settings-list"],
  },
  {
    id: "debug-workbench",
    title: "调试工作台",
    description: "问题、断点、Watch、调用栈、终端和信号槽编辑器。",
    primaryType: "problems-panel",
    types: ["problems-panel", "breakpoints-panel", "watch-panel", "call-stack", "console-panel", "terminal-view", "log-viewer", "signal-slot-editor"],
  },
] as const satisfies readonly ComponentPaletteKit[];

export const md3ApplicationComponentTypes = [
  "top-app-bar",
  "bottom-app-bar",
  "navigation-bar",
  "navigation-drawer",
  "navigation-item",
  "navigation-rail",
  "navigation-suite",
  "side-sheet",
  "bottom-sheet",
  "sheet-drag-handle",
  "menu-bar",
  "status-bar",
  "filter-bar",
  "search-view",
  "search-suggestion-list",
  "autocomplete",
  "date-range-picker",
  "assist-chip",
  "filter-chip",
  "input-chip",
  "suggestion-chip",
  "elevated-card",
  "filled-card",
  "outlined-card",
  "extended-fab",
  "supporting-pane",
  "floating-toolbar",
  "pagination",
  "calendar-scheduler",
  "kanban-board",
  "dialog",
  "banner",
  "snackbar",
  "section-header",
  "alert",
  "toast",
  "image-list",
  "color-swatch-grid",
  "avatar-group",
  "list-item",
  "progress-list",
] as const satisfies readonly BuilderComponentType[];

export type ComponentCoverageGroup = {
  id: string;
  title: string;
  description: string;
  types: readonly BuilderComponentType[];
};

export const componentCoverageGroups = [
  {
    id: "desktop-inputs",
    title: "表单与输入",
    description: "Qt 常见输入、选择器、文本编辑和路径控件。",
    types: [
      "button",
      "button-group",
      "dialog-button-box",
      "command-link-button",
      "menu-button",
      "split-button",
      "tool-button",
      "toggle-button",
      "toggle-group",
      "input",
      "password-field",
      "number-field",
      "spin-box",
      "double-spin-box",
      "dial",
      "textarea",
      "plain-text-edit",
      "rich-text-editor",
      "code-editor",
      "search-bar",
      "search-suggestion-list",
      "filter-bar",
      "tag-input",
      "checkbox",
      "checkbox-group",
      "radio",
      "radio-group",
      "switch",
      "slider",
      "range-slider",
      "rating",
      "color-picker",
      "file-picker",
      "folder-picker",
      "shortcut-recorder",
      "select",
      "multi-select",
      "combobox",
      "autocomplete",
      "font-combo-box",
      "date-picker",
      "date-range-picker",
      "time-picker",
      "date-time-picker",
      "calendar-widget",
      "segmented",
      "chips",
      "assist-chip",
      "filter-chip",
      "input-chip",
      "suggestion-chip",
      "fab",
      "extended-fab",
      "icon-button",
    ],
  },
  {
    id: "desktop-navigation",
    title: "导航与窗口结构",
    description: "菜单栏、停靠面板、分割区和应用窗口结构。",
    types: [
      "tabs",
      "menu-bar",
      "ribbon-bar",
      "menu",
      "context-menu",
      "breadcrumb-bar",
      "pagination",
      "top-app-bar",
      "bottom-app-bar",
      "navigation-bar",
      "navigation-item",
      "navigation-suite",
      "status-bar",
      "toolbar",
      "floating-toolbar",
      "activity-bar",
      "split-view",
      "splitter",
      "size-grip",
      "supporting-pane",
      "scroll-area",
      "stacked-pages",
      "dock-panel",
      "mdi-area",
      "navigation",
      "navigation-drawer",
      "navigation-rail",
      "side-sheet",
      "bottom-sheet",
      "sheet-drag-handle",
      "accordion",
      "tool-box",
    ],
  },
  {
    id: "desktop-data-views",
    title: "数据与工程视图",
    description: "表格、树、属性网格、资源浏览和任务视图。",
    types: [
      "list",
      "list-item",
      "list-view",
      "column-view",
      "icon-view",
      "command-list",
      "command-palette",
      "notification-center",
      "system-tray",
      "activity-bar",
      "shortcut-table",
      "resource-browser",
      "asset-grid",
      "task-list",
      "settings-list",
      "tree-view",
      "tree-table",
      "outline-view",
      "signal-slot-editor",
      "node-graph",
      "log-viewer",
      "problems-panel",
      "breakpoints-panel",
      "watch-panel",
      "call-stack",
      "property-browser",
      "layer-panel",
      "table",
      "table-view",
      "kanban-board",
      "data-grid",
      "property-grid",
      "key-value-list",
      "inspector-section",
      "form-layout",
    ],
  },
  {
    id: "feedback-overlays",
    title: "反馈与浮层",
    description: "对话框、弹出层、流程向导、提示和状态反馈。",
    types: [
      "card",
      "section-header",
      "elevated-card",
      "filled-card",
      "outlined-card",
      "carousel",
      "empty-state",
      "dialog",
      "popover",
      "stepper",
      "wizard",
      "banner",
      "alert",
      "tooltip",
      "snackbar",
      "toast",
      "progress",
      "circular-progress",
      "progress-list",
      "status-indicator",
      "divider",
      "badge",
      "avatar",
      "avatar-group",
      "stat",
      "lcd-display",
      "empty-panel",
    ],
  },
  {
    id: "md3-application-shell",
    title: "MD3 应用壳",
    description: "Material 3 应用栏、导航、sheet、状态栏和反馈控件，可组成真实桌面应用框架。",
    types: md3ApplicationComponentTypes,
  },
  {
    id: "runtime-surfaces",
    title: "运行时与专业面板",
    description: "图形、多媒体、终端、图表和调度类复杂控件。",
    types: [
      "web-view",
      "help-viewer",
      "image-list",
      "media-player",
      "pdf-viewer",
      "map-view",
      "graphics-view",
      "console-panel",
      "terminal-view",
      "problems-panel",
      "breakpoints-panel",
      "watch-panel",
      "call-stack",
      "chart-view",
      "calendar-scheduler",
      "timeline",
    ],
  },
] as const satisfies readonly ComponentCoverageGroup[];

export function componentPaletteCategoryForType(type: BuilderComponentType): Exclude<ComponentPaletteCategoryId, "all"> {
  if (["frame", "group-box", "spacer", "divider", "toolbar", "floating-toolbar", "ribbon-bar", "top-app-bar", "bottom-app-bar", "navigation-bar", "navigation-item", "navigation-suite", "status-bar", "activity-bar", "split-view", "splitter", "size-grip", "supporting-pane", "scroll-area", "stacked-pages", "dock-panel", "mdi-area", "navigation", "navigation-drawer", "navigation-rail", "side-sheet", "bottom-sheet", "sheet-drag-handle", "accordion", "tool-box", "menu-bar", "menu", "context-menu", "system-tray", "breadcrumb-bar", "pagination"].includes(type)) {
    return "layout";
  }
  if (["button", "button-group", "dialog-button-box", "command-link-button", "menu-button", "split-button", "tool-button", "toggle-button", "toggle-group", "icon-button", "link-label", "input", "password-field", "number-field", "spin-box", "double-spin-box", "dial", "textarea", "plain-text-edit", "rich-text-editor", "code-editor", "search-bar", "search-suggestion-list", "filter-bar", "tag-input", "checkbox", "checkbox-group", "radio", "radio-group", "switch", "slider", "range-slider", "rating", "scroll-bar", "color-picker", "color-swatch-grid", "file-picker", "folder-picker", "shortcut-recorder", "select", "multi-select", "combobox", "autocomplete", "font-combo-box", "date-picker", "date-range-picker", "time-picker", "date-time-picker", "calendar-widget", "segmented", "chips", "assist-chip", "filter-chip", "input-chip", "suggestion-chip", "fab", "extended-fab"].includes(type)) {
    return "inputs";
  }
  if (["elevated-card", "filled-card", "outlined-card", "section-header"].includes(type)) {
    return "display";
  }
  if (["stat", "lcd-display", "chart-view", "table", "table-view", "kanban-board", "calendar-scheduler", "data-grid", "property-grid", "key-value-list", "inspector-section", "list-item", "list-view", "column-view", "icon-view", "command-list", "command-palette", "search-view", "notification-center", "shortcut-table", "resource-browser", "asset-grid", "task-list", "settings-list", "tree-view", "tree-table", "outline-view", "signal-slot-editor", "node-graph", "log-viewer", "problems-panel", "breakpoints-panel", "watch-panel", "call-stack", "property-browser", "layer-panel", "form-layout", "console-panel", "terminal-view", "timeline", "status-indicator", "progress", "circular-progress", "progress-list", "graphics-view", "web-view", "help-viewer", "media-player", "pdf-viewer", "map-view"].includes(type)) {
    return "data";
  }
  return "display";
}

export function componentPaletteCategoryLabel(category: ComponentPaletteCategoryId) {
  return componentPaletteCategoryOptions.find((option) => option.id === category)?.label ?? category;
}

export function componentPaletteMatchesSearch(definition: ComponentDefinition, query: string) {
  if (!query.trim()) {
    return true;
  }
  const category = componentPaletteCategoryForType(definition.type);
  return [
    definition.type,
    definition.title,
    definition.description,
    componentPaletteCategoryLabel(category),
  ]
    .join(" ")
    .toLowerCase()
    .includes(query.trim().toLowerCase());
}

export function normalizeComponentTypeList(value: unknown, limit: number) {
  const validTypes = new Set(palette.map((definition) => definition.type));
  const values = Array.isArray(value) ? value : [];
  const normalized: BuilderComponentType[] = [];
  for (const item of values) {
    if (typeof item !== "string" || !validTypes.has(item as BuilderComponentType) || normalized.includes(item as BuilderComponentType)) {
      continue;
    }
    normalized.push(item as BuilderComponentType);
    if (normalized.length >= limit) {
      break;
    }
  }
  return normalized;
}

export function loadComponentPaletteTypeList(storageKey: string, limit: number, fallback: readonly BuilderComponentType[] = []) {
  if (typeof window === "undefined") {
    return normalizeComponentTypeList(fallback, limit);
  }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    const values = normalizeComponentTypeList(parsed, limit);
    return values.length > 0 ? values : normalizeComponentTypeList(fallback, limit);
  } catch {
    return normalizeComponentTypeList(fallback, limit);
  }
}

export const emptyCanvasQuickStarts = ["button", "input", "frame"] as const satisfies readonly BuilderComponentType[];
export const canvasContextQuickInsertGroups = [
  {
    id: "inputs",
    label: "输入",
    types: ["button", "input", "textarea", "select", "checkbox", "switch"],
  },
  {
    id: "layout",
    label: "布局",
    types: ["frame", "group-box", "split-view", "tabs", "toolbar", "top-app-bar"],
  },
  {
    id: "data",
    label: "数据",
    types: ["table", "tree-view", "outline-view", "signal-slot-editor", "node-graph", "property-browser"],
  },
  {
    id: "md3",
    label: "MD3",
    types: ["search-bar", "filter-bar", "navigation-suite", "supporting-pane", "card", "toast"],
  },
] as const satisfies ReadonlyArray<{ id: string; label: string; types: readonly BuilderComponentType[] }>;
export const canvasContextQuickInsertTypes = canvasContextQuickInsertGroups.flatMap((group) => group.types);

export function fileNameFromPath(path = "") {
  return path.split(/[\\/]/).filter(Boolean).pop() || "asset";
}

export function safeAssetFileName(name: string, index = 0) {
  const fallback = `asset-${index + 1}.png`;
  const sanitized = (name || fallback).replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-");
  return sanitized || fallback;
}

export function assetPublicPath(sourcePath: string, index = 0) {
  return `assets/${safeAssetFileName(fileNameFromPath(sourcePath), index)}`;
}

export function parentPathFromPath(path = "") {
  const normalized = path.trim();
  if (!normalized) {
    return "";
  }
  const separatorIndex = Math.max(normalized.lastIndexOf("\\"), normalized.lastIndexOf("/"));
  return separatorIndex > 0 ? normalized.slice(0, separatorIndex) : "";
}

export function normalizeComparablePath(path = "") {
  return path.trim().replace(/^\\\\\?\\/, "").replace(/\//g, "\\").replace(/\\+$/, "").toLowerCase();
}

export function samePathText(left = "", right = "") {
  const normalizedLeft = normalizeComparablePath(left);
  const normalizedRight = normalizeComparablePath(right);
  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

export type WorkflowRuntimeSession = {
  entryId?: string;
  path: string;
  pid: number;
  startedAt: string;
  logPath: string;
  summary: string;
  status: string;
  checkedAt: string;
};

export function workflowRuntimeSessionFromLaunch(result: LaunchExecutableResult, entryId?: string): WorkflowRuntimeSession {
  return {
    entryId,
    path: result.path,
    pid: result.pid,
    startedAt: result.started_at,
    logPath: result.log_path,
    summary: result.summary,
    status: "running",
    checkedAt: result.started_at,
  };
}

export function workflowRuntimeSessionFromBuildHistory(entry: BuildHistoryEntry): WorkflowRuntimeSession | null {
  if (!entry.outputExePath || !entry.launchedPid || entry.runStatus !== "running") {
    return null;
  }

  return {
    entryId: entry.id,
    path: entry.outputExePath,
    pid: entry.launchedPid,
    startedAt: entry.launchedAt ?? entry.runCheckedAt ?? "",
    logPath: entry.runtimeLogPath ?? "",
    summary: entry.runSummary ?? entry.launchSummary ?? "生成的 exe 正在运行。",
    status: "running",
    checkedAt: entry.runCheckedAt ?? entry.launchedAt ?? "",
  };
}

export function createAssetFromPath(sourcePath: string, index = 0): DesignerAsset {
  const name = fileNameFromPath(sourcePath);
  return {
    id: createId(),
    name,
    kind: "image",
    sourcePath,
    publicPath: assetPublicPath(sourcePath, index),
    addedAt: new Date().toISOString(),
  };
}

export function normalizeDesignerAssets(value: unknown): DesignerAsset[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((rawAsset, index): DesignerAsset | null => {
      if (!rawAsset || typeof rawAsset !== "object") {
        return null;
      }
      const asset = rawAsset as Partial<DesignerAsset>;
      const sourcePath = asset.sourcePath || asset.publicPath || "";
      if (!sourcePath) {
        return null;
      }
      return {
        id: asset.id || createId(),
        name: asset.name || fileNameFromPath(sourcePath),
        kind: "image",
        sourcePath,
        publicPath: asset.publicPath || assetPublicPath(sourcePath, index),
        addedAt: asset.addedAt || new Date().toISOString(),
      };
    })
    .filter((asset): asset is DesignerAsset => Boolean(asset));
}

export function normalizeValidationHistory(value: unknown): ValidationHistoryEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((rawEntry): ValidationHistoryEntry | null => {
      if (!rawEntry || typeof rawEntry !== "object") {
        return null;
      }
      const entry = rawEntry as Partial<ValidationHistoryEntry>;
      const status = entry.status === "failed" || entry.status === "warning" || entry.status === "passed" ? entry.status : "passed";
      return {
        id: entry.id || createId(),
        createdAt: entry.createdAt || new Date().toISOString(),
        status,
        score: clamp(Number(entry.score ?? 100), 0, 100),
        errorCount: Math.max(0, Number(entry.errorCount ?? 0)),
        warningCount: Math.max(0, Number(entry.warningCount ?? 0)),
        checkedFiles: Math.max(0, Number(entry.checkedFiles ?? 0)),
        checkedItems: Math.max(0, Number(entry.checkedItems ?? 0)),
        reportPath: entry.reportPath,
        snapshotPath: entry.snapshotPath,
        screenshotPath: entry.screenshotPath,
        screenshotAnalysisPath: entry.screenshotAnalysisPath,
        runtimeAuditPath: entry.runtimeAuditPath,
        breakpointValidationPath: entry.breakpointValidationPath,
        summary: entry.summary || "生成窗口验证",
      };
    })
    .filter((entry): entry is ValidationHistoryEntry => Boolean(entry))
    .slice(0, 12);
}

export function normalizeProjectMaintenanceHistory(value: unknown): ProjectMaintenanceEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((rawEntry): ProjectMaintenanceEntry | null => {
      if (!rawEntry || typeof rawEntry !== "object") {
        return null;
      }
      const entry = rawEntry as Partial<ProjectMaintenanceEntry>;
      const changes = Array.isArray(entry.changes)
        ? entry.changes
            .map((rawChange): ProjectMaintenanceEntry["changes"][number] | null => {
              if (!rawChange || typeof rawChange !== "object") {
                return null;
              }
              const change = rawChange as Partial<ProjectMaintenanceEntry["changes"][number]>;
              const props = Array.isArray(change.props)
                ? change.props.filter((prop): prop is string => typeof prop === "string" && prop.trim().length > 0)
                : [];
              if (!change.fileId || !change.itemId || props.length === 0) {
                return null;
              }
              return {
                fileId: change.fileId,
                fileName: change.fileName || "UI 文件",
                itemId: change.itemId,
                itemName: change.itemName || "控件",
                itemType: change.itemType || "frame",
                props,
                issueCount: Math.max(0, Number(change.issueCount ?? 0)),
              };
            })
            .filter((change): change is ProjectMaintenanceEntry["changes"][number] => Boolean(change))
        : [];
      const action: ProjectMaintenanceEntry["action"] = entry.action === "property-schema-repair" ? entry.action : "property-schema-repair";
      const status: ProjectMaintenanceEntry["status"] =
        entry.status === "partial" || entry.status === "skipped" || entry.status === "applied" ? entry.status : "applied";
      return {
        id: entry.id || createId(),
        createdAt: entry.createdAt || new Date().toISOString(),
        action,
        status,
        title: entry.title || "属性结构修复",
        summary: entry.summary || "项目维护操作",
        fileCount: Math.max(0, Number(entry.fileCount ?? new Set(changes.map((change) => change.fileId)).size)),
        itemCount: Math.max(0, Number(entry.itemCount ?? changes.length)),
        propertyCount: Math.max(0, Number(entry.propertyCount ?? changes.reduce((sum, change) => sum + change.props.length, 0))),
        issueCount: Math.max(0, Number(entry.issueCount ?? changes.reduce((sum, change) => sum + change.issueCount, 0))),
        manualIssueCount: Math.max(0, Number(entry.manualIssueCount ?? 0)),
        changes,
      };
    })
    .filter((entry): entry is ProjectMaintenanceEntry => Boolean(entry))
    .slice(0, 12);
}

export function normalizeBuildHistory(value: unknown): BuildHistoryEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((rawEntry): BuildHistoryEntry | null => {
      if (!rawEntry || typeof rawEntry !== "object") {
        return null;
      }
      const entry = rawEntry as Partial<BuildHistoryEntry>;
      const outputExePath = entry.outputExePath || "";
      const bundlePaths = Array.isArray(entry.bundlePaths) ? entry.bundlePaths.filter((path): path is string => typeof path === "string" && path.trim().length > 0) : [];
      const bundleDir = entry.bundleDir || (bundlePaths[0] ? parentPathFromPath(bundlePaths[0]) : "");
      const bundleManifestPath = entry.bundleManifestPath || "";
      const buildKind: BuildHistoryEntry["buildKind"] = entry.buildKind === "bundle" ? "bundle" : "exe";
      const generatedAppDir = entry.generatedAppDir || entry.outputDir || bundleDir || parentPathFromPath(outputExePath);
      if (!generatedAppDir && !outputExePath && bundlePaths.length === 0) {
        return null;
      }
      const outputDir = entry.outputDir || parentPathFromPath(outputExePath) || bundleDir || generatedAppDir;
      const validationStatus =
        entry.validationStatus === "failed" || entry.validationStatus === "warning" || entry.validationStatus === "passed"
          ? entry.validationStatus
          : undefined;
      return {
        id: entry.id || createId(),
        createdAt: entry.createdAt || new Date().toISOString(),
        status: "success",
        buildKind,
        label: entry.label || (buildKind === "bundle" ? "安装包构建" : "构建"),
        releaseAppName: entry.releaseAppName || "Nova 应用",
        releaseVersion: normalizeReleaseVersion(entry.releaseVersion || "0.1.0"),
        releaseBundleTargets: normalizeReleaseBundleTarget(entry.releaseBundleTargets),
        releaseNotes: normalizeReleaseNotes(entry.releaseNotes, entry.releaseVersion || "0.1.0"),
        releaseSigningMode: normalizeReleaseSigningMode(entry.releaseSigningMode),
        releaseSigningConfigured: entry.releaseSigningConfigured === true,
        outputExePath: outputExePath || undefined,
        outputDir: outputDir || undefined,
        bundleDir: bundleDir || undefined,
        bundlePaths,
        bundleManifestPath: bundleManifestPath || undefined,
        bundleSmokeStatus: typeof entry.bundleSmokeStatus === "string" ? entry.bundleSmokeStatus : undefined,
        bundleArtifactCount: Math.max(0, Number(entry.bundleArtifactCount ?? bundlePaths.length)),
        installerSmokeScriptPath: typeof entry.installerSmokeScriptPath === "string" && entry.installerSmokeScriptPath.trim() ? entry.installerSmokeScriptPath : undefined,
        installerSmokeResultPath: typeof entry.installerSmokeResultPath === "string" && entry.installerSmokeResultPath.trim() ? entry.installerSmokeResultPath : undefined,
        installerSmokeStatus: typeof entry.installerSmokeStatus === "string" ? entry.installerSmokeStatus : undefined,
        installerSmokeFinishedAt: typeof entry.installerSmokeFinishedAt === "string" ? entry.installerSmokeFinishedAt : undefined,
        installerSmokeSummary: typeof entry.installerSmokeSummary === "string" ? entry.installerSmokeSummary : undefined,
        installerSmokeRunnerMode: typeof entry.installerSmokeRunnerMode === "string" ? normalizeReleaseInstallerSmokeRunnerMode(entry.installerSmokeRunnerMode) : undefined,
        installerSmokeVmHandoffPath: typeof entry.installerSmokeVmHandoffPath === "string" && entry.installerSmokeVmHandoffPath.trim() ? entry.installerSmokeVmHandoffPath : undefined,
        launchedPid: Number.isFinite(Number(entry.launchedPid)) ? Number(entry.launchedPid) : undefined,
        launchedAt: typeof entry.launchedAt === "string" ? entry.launchedAt : undefined,
        launchSummary: typeof entry.launchSummary === "string" ? entry.launchSummary : undefined,
        runStatus: typeof entry.runStatus === "string" ? entry.runStatus : undefined,
        runCheckedAt: typeof entry.runCheckedAt === "string" ? entry.runCheckedAt : undefined,
        runSummary: typeof entry.runSummary === "string" ? entry.runSummary : undefined,
        stoppedAt: typeof entry.stoppedAt === "string" ? entry.stoppedAt : undefined,
        stopSummary: typeof entry.stopSummary === "string" ? entry.stopSummary : undefined,
        runtimeLogPath: typeof entry.runtimeLogPath === "string" && entry.runtimeLogPath.trim() ? entry.runtimeLogPath : undefined,
        runtimeLogPreview: typeof entry.runtimeLogPreview === "string" ? entry.runtimeLogPreview : undefined,
        runtimeLogSizeBytes: Number.isFinite(Number(entry.runtimeLogSizeBytes)) ? Number(entry.runtimeLogSizeBytes) : undefined,
        runtimeLogUpdatedAt: typeof entry.runtimeLogUpdatedAt === "string" ? entry.runtimeLogUpdatedAt : undefined,
        runtimeLogTruncated: entry.runtimeLogTruncated === true,
        generatedAppDir,
        generatedFileSummary: typeof entry.generatedFileSummary === "string" ? entry.generatedFileSummary : undefined,
        generatedChangedCount: Number.isFinite(Number(entry.generatedChangedCount)) ? Number(entry.generatedChangedCount) : undefined,
        generatedTotalCount: Number.isFinite(Number(entry.generatedTotalCount)) ? Number(entry.generatedTotalCount) : undefined,
        generatedCreatedCount: Number.isFinite(Number(entry.generatedCreatedCount)) ? Number(entry.generatedCreatedCount) : undefined,
        generatedUpdatedCount: Number.isFinite(Number(entry.generatedUpdatedCount)) ? Number(entry.generatedUpdatedCount) : undefined,
        generatedUnchangedCount: Number.isFinite(Number(entry.generatedUnchangedCount)) ? Number(entry.generatedUnchangedCount) : undefined,
        readinessScore: clamp(Number(entry.readinessScore ?? 100), 0, 100),
        readinessErrors: Math.max(0, Number(entry.readinessErrors ?? 0)),
        readinessWarnings: Math.max(0, Number(entry.readinessWarnings ?? 0)),
        visualScore: clamp(Number(entry.visualScore ?? 100), 0, 100),
        visualErrors: Math.max(0, Number(entry.visualErrors ?? 0)),
        visualWarnings: Math.max(0, Number(entry.visualWarnings ?? 0)),
        validationStatus,
        fileCount: Math.max(0, Number(entry.fileCount ?? 0)),
        controlCount: Math.max(0, Number(entry.controlCount ?? 0)),
        commandCount: Math.max(0, Number(entry.commandCount ?? 0)),
        stateCount: Math.max(0, Number(entry.stateCount ?? 0)),
        assetCount: Math.max(0, Number(entry.assetCount ?? 0)),
        summary: entry.summary || (buildKind === "bundle" ? "已生成安装包" : "已生成可执行文件"),
      };
    })
    .filter((entry): entry is BuildHistoryEntry => Boolean(entry))
    .slice(0, 12);
}

export function normalizeReleasePipelineStatus(value: unknown): ReleasePipelineStatus {
  return value === "running" ||
    value === "succeeded" ||
    value === "failed" ||
    value === "skipped" ||
    value === "canceled" ||
    value === "queued"
    ? value
    : "queued";
}

export function normalizeReleasePipelineStepInputSnapshot(value: unknown): ReleasePipelineStepInputSnapshot | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const source = value as Partial<ReleasePipelineStepInputSnapshot>;
  const projectId = typeof source.projectId === "string" && source.projectId.trim() ? source.projectId : "";
  const projectName = typeof source.projectName === "string" && source.projectName.trim() ? source.projectName : "";
  if (!projectId || !projectName) {
    return undefined;
  }
  return {
    projectId,
    projectName,
    rootPath: typeof source.rootPath === "string" && source.rootPath.trim() ? source.rootPath : undefined,
    activeFileId: typeof source.activeFileId === "string" && source.activeFileId.trim() ? source.activeFileId : undefined,
    activeFileName: typeof source.activeFileName === "string" && source.activeFileName.trim() ? source.activeFileName : undefined,
    releaseAppName: typeof source.releaseAppName === "string" && source.releaseAppName.trim() ? source.releaseAppName : "Nova 应用",
    releaseVersion: normalizeReleaseVersion(source.releaseVersion || "0.1.0"),
    fileCount: Math.max(0, Number(source.fileCount ?? 0)),
    controlCount: Math.max(0, Number(source.controlCount ?? 0)),
    commandCount: Math.max(0, Number(source.commandCount ?? 0)),
    stateCount: Math.max(0, Number(source.stateCount ?? 0)),
    assetCount: Math.max(0, Number(source.assetCount ?? 0)),
    backendIntegrationCount: Math.max(0, Number(source.backendIntegrationCount ?? 0)),
    projectSnapshotHash: typeof source.projectSnapshotHash === "string" && source.projectSnapshotHash.trim() ? source.projectSnapshotHash : "unknown",
  };
}

export function normalizeReleasePipelineStepEnvironment(value: unknown): ReleasePipelineStepEnvironment | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const source = value as Partial<ReleasePipelineStepEnvironment>;
  const runtime = source.runtime === "tauri" || source.runtime === "browser" ? source.runtime : undefined;
  const platform = typeof source.platform === "string" && source.platform.trim() ? source.platform : "";
  if (!runtime || !platform) {
    return undefined;
  }
  return {
    runtime,
    platform,
    userAgent: typeof source.userAgent === "string" && source.userAgent.trim() ? source.userAgent : undefined,
    language: typeof source.language === "string" && source.language.trim() ? source.language : undefined,
    timeZone: typeof source.timeZone === "string" && source.timeZone.trim() ? source.timeZone : undefined,
  };
}

export function normalizeReleasePipelineStepCommandArgs(value: unknown): ReleasePipelineStepCommandArgs | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const source = value as Partial<ReleasePipelineStepCommandArgs>;
  const actionId = typeof source.actionId === "string" && source.actionId.trim() ? source.actionId : "";
  if (!actionId) {
    return undefined;
  }
  return {
    actionId,
    title: typeof source.title === "string" && source.title.trim() ? source.title : actionId,
    kind: typeof source.kind === "string" && source.kind.trim() ? source.kind : "project",
    attempt: Math.max(1, Number(source.attempt ?? 1)),
    pipelineRunId: typeof source.pipelineRunId === "string" && source.pipelineRunId.trim() ? source.pipelineRunId : undefined,
    pipelineStepIndex: Number.isFinite(Number(source.pipelineStepIndex)) ? Math.max(0, Number(source.pipelineStepIndex)) : undefined,
    pipelineStepCount: Number.isFinite(Number(source.pipelineStepCount)) ? Math.max(0, Number(source.pipelineStepCount)) : undefined,
    backendTaskId: typeof source.backendTaskId === "string" && source.backendTaskId.trim() ? source.backendTaskId : undefined,
    artifactPath: typeof source.artifactPath === "string" && source.artifactPath.trim() ? source.artifactPath : undefined,
    logPath: typeof source.logPath === "string" && source.logPath.trim() ? source.logPath : undefined,
  };
}

export function normalizeReleasePipelineStepArtifactEvidence(value: unknown): ReleasePipelineStepArtifactEvidence | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const source = value as Partial<ReleasePipelineStepArtifactEvidence>;
  const path = typeof source.path === "string" && source.path.trim() ? source.path : "";
  if (!path) {
    return undefined;
  }
  return {
    path,
    exists: Boolean(source.exists),
    isFile: Boolean(source.isFile),
    isDir: Boolean(source.isDir),
    sizeBytes: Math.max(0, Number(source.sizeBytes ?? 0)),
    modifiedAt: typeof source.modifiedAt === "string" && source.modifiedAt.trim() ? source.modifiedAt : source.modifiedAt === null ? null : undefined,
    sha256: typeof source.sha256 === "string" && source.sha256.trim() ? source.sha256 : source.sha256 === null ? null : undefined,
    summary: typeof source.summary === "string" && source.summary.trim() ? source.summary : "已捕获产物证据。",
    checkedAt: typeof source.checkedAt === "string" && source.checkedAt.trim() ? source.checkedAt : new Date().toISOString(),
  };
}

export function normalizeProjectDependencyGraphScope(value: unknown): ProjectDependencyGraphScope | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const source = value as Partial<ProjectDependencyGraphScope>;
  const id = typeof source.id === "string" && source.id.trim() ? source.id : "";
  if (!id) {
    return null;
  }
  return {
    id,
    label: typeof source.label === "string" && source.label.trim() ? source.label : id,
    status: typeof source.status === "string" && source.status.trim() ? source.status : "unknown",
    changedCount: Math.max(0, Number(source.changedCount ?? 0)),
    totalCount: Math.max(0, Number(source.totalCount ?? 0)),
    paths: Array.isArray(source.paths) ? source.paths.filter((path): path is string => typeof path === "string" && path.trim().length > 0) : [],
    sourceRefs: Array.isArray(source.sourceRefs)
      ? source.sourceRefs.map(normalizeProjectDependencySourceReference).filter((ref): ref is ProjectDependencySourceReference => Boolean(ref))
      : [],
    summary: typeof source.summary === "string" && source.summary.trim() ? source.summary : "依赖范围状态。",
  };
}

export function normalizeProjectDependencySourceReference(value: unknown): ProjectDependencySourceReference | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const source = value as Partial<ProjectDependencySourceReference>;
  const id = typeof source.id === "string" && source.id.trim() ? source.id : "";
  const kind = typeof source.kind === "string" && source.kind.trim() ? source.kind : "";
  if (!id || !kind) {
    return null;
  }
  return {
    id,
    kind,
    label: typeof source.label === "string" && source.label.trim() ? source.label : id,
    detail: typeof source.detail === "string" && source.detail.trim() ? source.detail : "依赖来源",
    affectedPaths: Array.isArray(source.affectedPaths)
      ? source.affectedPaths.filter((path): path is string => typeof path === "string" && path.trim().length > 0)
      : [],
    fileId: typeof source.fileId === "string" && source.fileId.trim() ? source.fileId : undefined,
    itemId: typeof source.itemId === "string" && source.itemId.trim() ? source.itemId : undefined,
    commandId: typeof source.commandId === "string" && source.commandId.trim() ? source.commandId : undefined,
    moduleId: typeof source.moduleId === "string" && source.moduleId.trim() ? source.moduleId : undefined,
    dependencyId: typeof source.dependencyId === "string" && source.dependencyId.trim() ? source.dependencyId : undefined,
    assetId: typeof source.assetId === "string" && source.assetId.trim() ? source.assetId : undefined,
    integrationId: typeof source.integrationId === "string" && source.integrationId.trim() ? source.integrationId : undefined,
    path: typeof source.path === "string" && source.path.trim() ? source.path : undefined,
  };
}

export function normalizeProjectDependencyGraphPlan(value: unknown): ProjectDependencyGraphPlan {
  if (!value || typeof value !== "object") {
    return {
      id: "dependency-plan",
      title: "依赖计划",
      detail: "没有找到已保存的依赖计划。",
      badge: "图谱",
      actions: [],
      scopeIds: [],
      ready: false,
    };
  }
  const source = value as Partial<ProjectDependencyGraphPlan>;
  return {
    id: typeof source.id === "string" && source.id.trim() ? source.id : "dependency-plan",
    title: typeof source.title === "string" && source.title.trim() ? source.title : "依赖计划",
    detail: typeof source.detail === "string" && source.detail.trim() ? source.detail : "已保存的依赖图计划。",
    badge: typeof source.badge === "string" && source.badge.trim() ? source.badge : "图谱",
    actions: Array.isArray(source.actions) ? source.actions.filter((action): action is string => typeof action === "string" && action.trim().length > 0) : [],
    scopeIds: Array.isArray(source.scopeIds) ? source.scopeIds.filter((scope): scope is string => typeof scope === "string" && scope.trim().length > 0) : [],
    ready: Boolean(source.ready),
  };
}

export function normalizeProjectDependencyGraphEvent(value: unknown): ProjectDependencyGraphEvent {
  if (!value || typeof value !== "object") {
    return {
      kind: "unknown",
      recordedAt: new Date().toISOString(),
    };
  }
  const source = value as Partial<ProjectDependencyGraphEvent>;
  return {
    kind: typeof source.kind === "string" && source.kind.trim() ? source.kind : "unknown",
    actionId: typeof source.actionId === "string" && source.actionId.trim() ? source.actionId : undefined,
    status: typeof source.status === "string" && source.status.trim() ? source.status : undefined,
    summary: typeof source.summary === "string" && source.summary.trim() ? source.summary : undefined,
    artifactPath: typeof source.artifactPath === "string" && source.artifactPath.trim() ? source.artifactPath : undefined,
    logPath: typeof source.logPath === "string" && source.logPath.trim() ? source.logPath : undefined,
    scopeIds: Array.isArray(source.scopeIds) ? source.scopeIds.filter((scope): scope is string => typeof scope === "string" && scope.trim().length > 0) : undefined,
    recordedAt: typeof source.recordedAt === "string" && source.recordedAt.trim() ? source.recordedAt : new Date().toISOString(),
  };
}

export function normalizeProjectDependencyGraphValidityEntry(value: unknown): ProjectDependencyGraphValidityEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const source = value as Partial<ProjectDependencyGraphValidityEntry>;
  const kind = typeof source.kind === "string" && source.kind.trim() ? source.kind : "";
  if (!kind) {
    return null;
  }
  const scopeIds = Array.isArray(source.scopeIds)
    ? source.scopeIds.filter((scope): scope is string => typeof scope === "string" && scope.trim().length > 0)
    : [];
  return {
    id: typeof source.id === "string" && source.id.trim() ? source.id : `validity-${kind}`,
    kind,
    label: typeof source.label === "string" && source.label.trim() ? source.label : kind,
    scopeIds,
    snapshotHash: typeof source.snapshotHash === "string" && source.snapshotHash.trim() ? source.snapshotHash : "unknown",
    resultStatus: typeof source.resultStatus === "string" && source.resultStatus.trim() ? source.resultStatus : "unknown",
    actionId: typeof source.actionId === "string" && source.actionId.trim() ? source.actionId : undefined,
    summary: typeof source.summary === "string" && source.summary.trim() ? source.summary : undefined,
    artifactPath: typeof source.artifactPath === "string" && source.artifactPath.trim() ? source.artifactPath : undefined,
    logPath: typeof source.logPath === "string" && source.logPath.trim() ? source.logPath : undefined,
    recordedAt: typeof source.recordedAt === "string" && source.recordedAt.trim() ? source.recordedAt : new Date().toISOString(),
    invalidatedAt: typeof source.invalidatedAt === "string" && source.invalidatedAt.trim() ? source.invalidatedAt : undefined,
    invalidatedBy: typeof source.invalidatedBy === "string" && source.invalidatedBy.trim() ? source.invalidatedBy : undefined,
    invalidatedScopeIds: Array.isArray(source.invalidatedScopeIds)
      ? source.invalidatedScopeIds.filter((scope): scope is string => typeof scope === "string" && scope.trim().length > 0)
      : undefined,
  };
}

export function normalizeProjectDependencyGraphRecord(value: unknown): ProjectDependencyGraphRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const source = value as Partial<ProjectDependencyGraphRecord>;
  const projectId = typeof source.projectId === "string" && source.projectId.trim() ? source.projectId : "";
  const projectName = typeof source.projectName === "string" && source.projectName.trim() ? source.projectName : "";
  if (!projectId || !projectName) {
    return null;
  }
  const scopes = Array.isArray(source.scopes)
    ? source.scopes.map(normalizeProjectDependencyGraphScope).filter((scope): scope is ProjectDependencyGraphScope => Boolean(scope))
    : [];
  const validity = Array.isArray(source.validity)
    ? source.validity.map(normalizeProjectDependencyGraphValidityEntry).filter((entry): entry is ProjectDependencyGraphValidityEntry => Boolean(entry))
    : [];
  return {
    id: typeof source.id === "string" && source.id.trim() ? source.id : createId(),
    projectId,
    projectName,
    rootPath: typeof source.rootPath === "string" && source.rootPath.trim() ? source.rootPath : undefined,
    snapshotHash: typeof source.snapshotHash === "string" && source.snapshotHash.trim() ? source.snapshotHash : "unknown",
    previewSnapshotHash: typeof source.previewSnapshotHash === "string" && source.previewSnapshotHash.trim() ? source.previewSnapshotHash : undefined,
    status: typeof source.status === "string" && source.status.trim() ? source.status : "unknown",
    changedCount: Math.max(0, Number(source.changedCount ?? 0)),
    totalCount: Math.max(0, Number(source.totalCount ?? 0)),
    dirtyScopeCount: Math.max(0, Number(source.dirtyScopeCount ?? scopes.filter((scope) => scope.status === "dirty").length)),
    scopes,
    executionPlan: normalizeProjectDependencyGraphPlan(source.executionPlan),
    lastEvent: normalizeProjectDependencyGraphEvent(source.lastEvent),
    validity,
    previewRootPath: typeof source.previewRootPath === "string" && source.previewRootPath.trim() ? source.previewRootPath : undefined,
    recordPath: typeof source.recordPath === "string" && source.recordPath.trim() ? source.recordPath : undefined,
    recordWrittenAt: typeof source.recordWrittenAt === "string" && source.recordWrittenAt.trim() ? source.recordWrittenAt : undefined,
    updatedAt: typeof source.updatedAt === "string" && source.updatedAt.trim() ? source.updatedAt : new Date().toISOString(),
    summary: typeof source.summary === "string" && source.summary.trim() ? source.summary : "已保存的项目依赖图。",
  };
}

export function normalizeReleasePipelineSteps(value: unknown): ReleasePipelineStep[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((rawStep, index): ReleasePipelineStep | null => {
      if (!rawStep || typeof rawStep !== "object") {
        return null;
      }
      const step = rawStep as Partial<ReleasePipelineStep>;
      const actionId = typeof step.actionId === "string" && step.actionId.trim() ? step.actionId : "";
      if (!actionId) {
        return null;
      }
      return {
        id: typeof step.id === "string" && step.id ? step.id : `step-${index + 1}`,
        taskId: typeof step.taskId === "string" && step.taskId ? step.taskId : undefined,
        actionId,
        title: typeof step.title === "string" && step.title ? step.title : actionId,
        kind: typeof step.kind === "string" && step.kind ? step.kind : "project",
        status: normalizeReleasePipelineStatus(step.status),
        startedAt: typeof step.startedAt === "string" ? step.startedAt : undefined,
        finishedAt: typeof step.finishedAt === "string" ? step.finishedAt : undefined,
        summary: typeof step.summary === "string" ? step.summary : undefined,
        error: typeof step.error === "string" ? step.error : undefined,
        logPreview: typeof step.logPreview === "string" ? step.logPreview : undefined,
        artifactPath: typeof step.artifactPath === "string" && step.artifactPath.trim() ? step.artifactPath : undefined,
        logPath: typeof step.logPath === "string" && step.logPath.trim() ? step.logPath : undefined,
        inputSnapshot: normalizeReleasePipelineStepInputSnapshot(step.inputSnapshot),
        environment: normalizeReleasePipelineStepEnvironment(step.environment),
        commandArgs: normalizeReleasePipelineStepCommandArgs(step.commandArgs),
        artifactEvidence: normalizeReleasePipelineStepArtifactEvidence(step.artifactEvidence),
      };
    })
    .filter((step): step is ReleasePipelineStep => Boolean(step))
    .slice(0, 24);
}

export function normalizeReleasePipelineHistory(value: unknown): ReleasePipelineEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((rawEntry): ReleasePipelineEntry | null => {
      if (!rawEntry || typeof rawEntry !== "object") {
        return null;
      }
      const entry = rawEntry as Partial<ReleasePipelineEntry>;
      const steps = normalizeReleasePipelineSteps(entry.steps);
      if (steps.length === 0) {
        return null;
      }
      const status = normalizeReleasePipelineStatus(entry.status);
      const artifactPath =
        typeof entry.artifactPath === "string" && entry.artifactPath.trim()
          ? entry.artifactPath
          : [...steps].reverse().find((step) => step.artifactPath)?.artifactPath;
      const logPath =
        typeof entry.logPath === "string" && entry.logPath.trim()
          ? entry.logPath
          : [...steps].reverse().find((step) => step.logPath)?.logPath;
      const bundlePaths = Array.isArray(entry.bundlePaths)
        ? entry.bundlePaths.filter((path): path is string => typeof path === "string" && path.trim().length > 0)
        : [];
      return {
        id: typeof entry.id === "string" && entry.id ? entry.id : createId(),
        presetId: typeof entry.presetId === "string" && entry.presetId ? entry.presetId : "preset",
        presetTitle: typeof entry.presetTitle === "string" && entry.presetTitle ? entry.presetTitle : "发布流水线",
        presetBadge: typeof entry.presetBadge === "string" && entry.presetBadge ? entry.presetBadge : "run",
        createdAt: entry.createdAt || steps[0]?.startedAt || new Date().toISOString(),
        startedAt: typeof entry.startedAt === "string" ? entry.startedAt : steps.find((step) => step.startedAt)?.startedAt,
        finishedAt: typeof entry.finishedAt === "string" ? entry.finishedAt : [...steps].reverse().find((step) => step.finishedAt)?.finishedAt,
        status,
        stepCount: Math.max(steps.length, Number(entry.stepCount ?? steps.length)),
        succeededCount: Math.max(0, Number(entry.succeededCount ?? steps.filter((step) => step.status === "succeeded").length)),
        failedCount: Math.max(0, Number(entry.failedCount ?? steps.filter((step) => step.status === "failed").length)),
        skippedCount: Math.max(0, Number(entry.skippedCount ?? steps.filter((step) => step.status === "skipped").length)),
        canceledCount: Math.max(0, Number(entry.canceledCount ?? steps.filter((step) => step.status === "canceled").length)),
        releaseAppName: typeof entry.releaseAppName === "string" && entry.releaseAppName ? entry.releaseAppName : "Nova 应用",
        releaseVersion: normalizeReleaseVersion(entry.releaseVersion || "0.1.0"),
        artifactPath,
        logPath,
        recordPath: typeof entry.recordPath === "string" && entry.recordPath.trim() ? entry.recordPath : undefined,
        latestRecordPath: typeof entry.latestRecordPath === "string" && entry.latestRecordPath.trim() ? entry.latestRecordPath : undefined,
        recordWrittenAt: typeof entry.recordWrittenAt === "string" ? entry.recordWrittenAt : undefined,
        outputExePath: typeof entry.outputExePath === "string" && entry.outputExePath.trim() ? entry.outputExePath : undefined,
        bundleManifestPath: typeof entry.bundleManifestPath === "string" && entry.bundleManifestPath.trim() ? entry.bundleManifestPath : undefined,
        bundlePaths,
        rootPath: typeof entry.rootPath === "string" && entry.rootPath.trim() ? entry.rootPath : undefined,
        summary: typeof entry.summary === "string" && entry.summary ? entry.summary : `${steps.length} 个发布流水线步骤。`,
        steps,
      };
    })
    .filter((entry): entry is ReleasePipelineEntry => Boolean(entry))
    .slice(0, 12);
}

export function mergeReleasePipelineHistory(
  diskRecords: ReleasePipelineEntry[],
  projectRecords: ReleasePipelineEntry[] = [],
): ReleasePipelineEntry[] {
  const byId = new Map<string, ReleasePipelineEntry>();
  for (const entry of normalizeReleasePipelineHistory(diskRecords)) {
    byId.set(entry.id, entry);
  }
  for (const entry of normalizeReleasePipelineHistory(projectRecords)) {
    if (!byId.has(entry.id)) {
      byId.set(entry.id, entry);
    }
  }
  return [...byId.values()]
    .sort((left, right) =>
      activityTimeValue(right.finishedAt || right.startedAt || right.createdAt) -
      activityTimeValue(left.finishedAt || left.startedAt || left.createdAt),
    )
    .slice(0, 12);
}

export function normalizeBreakpointValidationIssues(value: unknown): BreakpointValidationIssue[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((rawIssue, index): BreakpointValidationIssue | null => {
      if (!rawIssue || typeof rawIssue !== "object") {
        return null;
      }
      const issue = rawIssue as Partial<BreakpointValidationIssue>;
      const raw = rawIssue as Record<string, unknown>;
      const fileId = String(issue.fileId ?? raw.file_id ?? "");
      if (!fileId) {
        return null;
      }
      const severity = issue.severity === "error" ? "error" : "warning";
      return {
        id: String(issue.id ?? raw.id ?? `breakpoint-issue-${index}`),
        breakpoint: normalizeBreakpoint(String(issue.breakpoint ?? raw.breakpoint ?? "desktop")),
        severity,
        title: String(issue.title ?? raw.title ?? "断点运行问题"),
        detail: String(issue.detail ?? raw.detail ?? "没有提供详情。"),
        fileId,
        fileName: String(issue.fileName ?? raw.file_name ?? "UI 文件"),
        itemId: typeof issue.itemId === "string" ? issue.itemId : typeof raw.item_id === "string" ? raw.item_id : undefined,
        itemName: typeof issue.itemName === "string" ? issue.itemName : typeof raw.item_name === "string" ? raw.item_name : undefined,
        itemType: typeof issue.itemType === "string" ? issue.itemType : typeof raw.item_type === "string" ? raw.item_type : undefined,
      };
    })
    .filter((issue): issue is BreakpointValidationIssue => Boolean(issue))
    .slice(0, 24);
}

export function createStateVariable(index = 1): BuilderStateVariable {
  return {
    id: createId(),
    name: index === 1 ? "statusText" : `stateValue${index}`,
    initialValue: index === 1 ? "就绪" : "",
  };
}

export function normalizeStateVariables(value: unknown): BuilderStateVariable[] {
  if (!Array.isArray(value)) {
    return [createStateVariable(1)];
  }

  const names = new Set<string>();
  const variables = value
    .map((rawState, index): BuilderStateVariable | null => {
      if (!rawState || typeof rawState !== "object") {
        return null;
      }
      const state = rawState as Partial<BuilderStateVariable>;
      let name = (state.name || (index === 0 ? "statusText" : `stateValue${index + 1}`)).trim().replace(/[^A-Za-z0-9_]/g, "_");
      name = name.replace(/^[^A-Za-z_]+/, "") || `stateValue${index + 1}`;
      while (names.has(name)) {
        name = `${name}_${index + 1}`;
      }
      names.add(name);
      return {
        id: state.id || createId(),
        name,
        initialValue: state.initialValue || "",
      };
    })
    .filter((state): state is BuilderStateVariable => Boolean(state));

  return variables.length > 0 ? variables : [createStateVariable(1)];
}

export function createItem(type: BuilderComponentType, page: PageConfig, index: number, position?: { x: number; y: number }): BuilderItem {
  const definition = getDefinition(type);
  const width = Math.min(definition.defaultSize.width, page.width);
  const height = Math.min(definition.defaultSize.height, page.height);
  const fallbackX = 48 + (index % 5) * 28;
  const fallbackY = 48 + (index % 5) * 28;
  const rawX = position ? position.x - width / 2 : fallbackX;
  const rawY = position ? position.y - height / 2 : fallbackY;

  return normalizeItemBounds(
    {
      id: createId(),
      type,
      name: definition.title,
      x: snap(rawX, page.gridSize, page.snapToGrid),
      y: snap(rawY, page.gridSize, page.snapToGrid),
      width,
      height,
      z: index + 1,
      props: { ...definition.defaultProps },
    },
    page,
  );
}

export function getItemSummary(item: BuilderItem) {
  return item.props.title ?? item.props.label ?? item.props.value ?? item.name;
}

export function propertySchemaForItem(item: BuilderItem) {
  return builderPropertySchema.filter((field) => field.appliesTo.includes(item.type));
}

export function textPropertyValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

export function searchNeedle(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function matchesSearchNeedle(needle: string, values: Array<unknown>) {
  if (!needle) {
    return true;
  }
  return values.some((value) => String(value ?? "").toLocaleLowerCase().includes(needle));
}

export function propertyFieldMatchesSearch(field: BuilderPropertySchemaField, item: BuilderItem | null | undefined, query: string) {
  const needle = searchNeedle(query);
  if (!needle) {
    return true;
  }
  const section = propertySectionForProp(field.prop);
  const currentValue = item ? item.props[field.prop] : "";
  return matchesSearchNeedle(needle, [
    field.label,
    String(field.prop),
    field.kind,
    builderPropertySectionLabels[section],
    propertySchemaHint(field),
    textPropertyValue(currentValue),
    field.required ? "必填 required" : "",
    field.recommended ? "推荐 recommended" : "",
  ]);
}

export const quickTextPropOrder: InlineTextEdit["prop"][] = [
  "label",
  "title",
  "value",
  "optionA",
  "optionB",
  "optionC",
  "placeholder",
  "description",
  "helper",
  "alt",
];

export const quickTextPrimaryPropByType: Partial<Record<BuilderComponentType, InlineTextEdit["prop"][]>> = {
  heading: ["title", "label", "description"],
  "text-browser": ["value", "title", "description"],
  "plain-text-edit": ["value", "label", "placeholder"],
  "rich-text-editor": ["value", "label", "placeholder"],
  "code-editor": ["value", "title", "label"],
  "terminal-view": ["value", "title", "label"],
  "console-panel": ["value", "title", "label"],
  "problems-panel": ["value", "title", "label"],
  "breakpoints-panel": ["value", "title", "label"],
  "watch-panel": ["value", "title", "label"],
  "call-stack": ["value", "title", "label"],
  card: ["title", "label", "description", "value"],
  "elevated-card": ["title", "label", "description", "value"],
  "filled-card": ["title", "label", "description", "value"],
  "outlined-card": ["title", "label", "description", "value"],
  "section-header": ["title", "value", "description", "label"],
  "empty-state": ["title", "description", "label"],
  "empty-panel": ["title", "description", "label"],
  stat: ["value", "label", "title"],
  "lcd-display": ["value", "label", "title"],
  "list-item": ["title", "label", "value"],
  "navigation-item": ["title", "label", "value"],
};

export function isQuickTextProp(prop: keyof BuilderItemProps): prop is InlineTextEdit["prop"] {
  return (quickTextPropOrder as readonly (keyof BuilderItemProps)[]).includes(prop);
}

export function quickTextPropOrderForItem(item: BuilderItem) {
  const primaryOrder = quickTextPrimaryPropByType[item.type] ?? [];
  return [...primaryOrder, ...quickTextPropOrder.filter((prop) => !primaryOrder.includes(prop))];
}

export function quickTextPropsForItem(item: BuilderItem): InlineTextEdit["prop"][] {
  const schemaProps = propertySchemaForItem(item)
    .filter((field) => field.kind === "text" && isQuickTextProp(field.prop))
    .map((field) => field.prop);

  return quickTextPropOrderForItem(item).filter(
    (prop) => Object.prototype.hasOwnProperty.call(item.props, prop) || schemaProps.includes(prop),
  );
}

export function quickTextPropForItem(item: BuilderItem): InlineTextEdit["prop"] | null {
  return quickTextPropsForItem(item)[0] ?? null;
}

export function isMultilineQuickTextEdit(item: BuilderItem, prop: InlineTextEdit["prop"]) {
  return (
    prop === "description" ||
    prop === "helper" ||
    (prop === "value" &&
      [
        "textarea",
        "plain-text-edit",
        "rich-text-editor",
        "text-browser",
        "code-editor",
        "terminal-view",
        "console-panel",
        "problems-panel",
        "breakpoints-panel",
        "watch-panel",
        "call-stack",
      ].includes(item.type))
  );
}

export function quickTextPropLabel(prop: InlineTextEdit["prop"]) {
  const labels: Record<InlineTextEdit["prop"], string> = {
    title: "标题",
    label: "标签",
    value: "值",
    optionA: "选项 A",
    optionB: "选项 B",
    optionC: "选项 C",
    placeholder: "占位文本",
    description: "说明",
    helper: "辅助文本",
    alt: "替代文本",
  };
  return labels[prop];
}

export function builderTabIndexValue(item: BuilderItem) {
  const rawValue = Number(item.props.tabIndex);
  return Number.isFinite(rawValue) ? Math.round(rawValue) : null;
}

export function isKeyboardFocusableBuilderItem(item: BuilderItem) {
  return focusableBuilderComponentTypeSet.has(item.type) && builderTabIndexValue(item) !== -1;
}

export function builderItemRuntimeState(item: BuilderItem) {
  return {
    enabled: item.props.enabled !== false,
    visible: item.props.visible !== false,
    readOnly: item.props.readOnly === true,
  };
}

export const rustHighlightPattern =
  /(\/\/.*|"(?:\\.|[^"\\])*"|#\[[^\]]+\]|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g;

export function pushRustPlainTextSegment(
  parts: ReactNode[],
  line: string,
  lineIndex: number,
  start: number,
  end: number,
  activeBracketIndexes?: ReadonlySet<number>,
  lineStartIndex = 0,
) {
  if (start >= end) {
    return;
  }

  let plainStart = start;
  for (let index = start; index < end; index += 1) {
    const absoluteIndex = lineStartIndex + index;
    if (!activeBracketIndexes?.has(absoluteIndex)) {
      continue;
    }
    if (plainStart < index) {
      parts.push(line.slice(plainStart, index));
    }
    parts.push(
      <span
        key={`${lineIndex}-bracket-${absoluteIndex}`}
        className="rounded bg-tertiary/20 px-0.5 text-tertiary ring-1 ring-tertiary/30"
        data-builder-rust-bracket-marker={line[index]}
      >
        {line[index]}
      </span>,
    );
    plainStart = index + 1;
  }

  if (plainStart < end) {
    parts.push(line.slice(plainStart, end));
  }
}

export function renderRustHighlightedLine(
  line: string,
  lineIndex: number,
  activeIdentifierName?: string,
  activeBracketIndexes?: ReadonlySet<number>,
  lineStartIndex = 0,
) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  line.replace(rustHighlightPattern, (match, _token, offset: number) => {
    if (offset > lastIndex) {
      pushRustPlainTextSegment(parts, line, lineIndex, lastIndex, offset, activeBracketIndexes, lineStartIndex);
    }
    const isFunctionCall = /^[A-Za-z_][A-Za-z0-9_]*$/.test(match) && /^\s*\(/.test(line.slice(offset + match.length));
    const isKeyword = /^(async|await|bool|else|enum|false|fn|for|if|impl|let|match|mod|mut|pub|return|struct|true|use)$/.test(match);
    const isKnownType = /^(serde_json|Err|None|Ok|Option|Result|Some|String|tauri|Vec)$/.test(match);
    const isActiveIdentifier = Boolean(
      activeIdentifierName &&
        match === activeIdentifierName &&
        /^[A-Za-z_][A-Za-z0-9_]*$/.test(match) &&
        !isKeyword &&
        !isKnownType,
    );
    const className = cn(
      match.startsWith("//")
      ? "text-on-surface-variant"
      : match.startsWith("\"")
        ? "text-primary"
        : match.startsWith("#[")
          ? "text-secondary-container-foreground"
          : /^\d/.test(match)
            ? "text-destructive"
            : isFunctionCall
              ? "text-secondary-container-foreground"
              : isKeyword
                ? "text-primary"
                : isKnownType
                  ? "text-secondary-container-foreground"
                  : "text-on-surface",
      isActiveIdentifier && "rounded bg-primary/15 px-0.5 text-primary ring-1 ring-primary/20",
    );
    parts.push(
      <span
        key={`${lineIndex}-${offset}`}
        className={className}
        data-builder-rust-symbol-occurrence={isActiveIdentifier ? match : undefined}
      >
        {match}
      </span>,
    );
    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < line.length) {
    pushRustPlainTextSegment(parts, line, lineIndex, lastIndex, line.length, activeBracketIndexes, lineStartIndex);
  }
  return parts.length > 0 ? parts : "\u00a0";
}

export const rustSyntaxLegendItems = [
  { id: "keyword", label: "关键字", className: "text-primary" },
  { id: "type", label: "类型 / 模块", className: "text-secondary-container-foreground" },
  { id: "string", label: "字符串", className: "text-primary" },
  { id: "number", label: "数字", className: "text-destructive" },
  { id: "comment", label: "注释", className: "text-on-surface-variant" },
  { id: "symbol", label: "当前符号", className: "rounded bg-primary/15 px-1 text-primary ring-1 ring-primary/20" },
  { id: "bracket", label: "匹配括号", className: "rounded bg-tertiary/20 px-1 text-tertiary ring-1 ring-tertiary/30" },
] as const;

export function rustStringLiteral(value: string) {
  return JSON.stringify(value);
}

export function createRustStatePatchLiteral(stateVariables: BuilderStateVariable[], fallbackValue = "已处理") {
  const patchEntries = stateVariables
    .slice(0, 4)
    .map((state, index) => {
      const key = state.name.trim() || state.id;
      const value = index === 0 ? fallbackValue : state.initialValue || "";
      return `            ${rustStringLiteral(key)}: ${rustStringLiteral(value)}`;
    });

  if (patchEntries.length === 0) {
    return "{}";
  }

  return `{\n${patchEntries.join(",\n")}\n        }`;
}

export function createRustNovaJsonResultSnippet(message: string, stateVariables: BuilderStateVariable[] = []) {
  return `serde_json::json!({\n        "success": true,\n        "message": ${rustStringLiteral(message)},\n        "patch": ${createRustStatePatchLiteral(stateVariables)}\n    }).to_string()`;
}

export function createRustCommandDebugResultSnippet(command: RustCommand, stateVariables: BuilderStateVariable[] = []) {
  const parameters = rustCommandParameters(command);
  const safeName = sanitizeRustCommandName(command.name);
  const debugExpression =
    parameters.length === 0
      ? rustStringLiteral(safeName)
      : parameters.length === 1
        ? sanitizeRustParameterName(parameters[0].name, 0)
        : `(${parameters.map((parameter, index) => sanitizeRustParameterName(parameter.name, index)).join(", ")})`;

  return `serde_json::json!({\n        "success": true,\n        "message": format!("{}: {:?}", ${rustStringLiteral(`${safeName} handled`)}, ${debugExpression}),\n        "patch": ${createRustStatePatchLiteral(stateVariables)}\n    }).to_string()`;
}

export function rustSignatureParameterHelp(command: RustCommand): RustSignatureParameterHelp[] {
  return rustCommandParameters(command).map((parameter, index) => {
    const name = sanitizeRustParameterName(parameter.name, index);
    const type = rustParameterTypeCode(parameter.type);
    return {
      id: parameter.id,
      name,
      type,
      source: parameter.source,
      detail: `${parameter.source} -> ${parameter.type}`,
    };
  });
}

export function rustCommandSignatureLabel(command: RustCommand) {
  const safeName = sanitizeRustCommandName(command.name);
  const parameters = rustSignatureParameterHelp(command);
  const signature = parameters.map((parameter) => `${parameter.name}: ${parameter.type}`).join(", ");
  return `fn ${safeName}(${signature}) -> String`;
}

export function rustSignatureActiveParameterIndex(line: string, columnIndex: number, commandName: string, parameterCount: number) {
  if (parameterCount <= 0) {
    return null;
  }
  const safeColumn = clamp(columnIndex, 0, line.length);
  const beforeCursor = line.slice(0, safeColumn);
  const declarationMatch = beforeCursor.match(new RegExp(`\\bfn\\s+${escapeRegExp(commandName)}\\s*\\(([^)]*)$`));
  const callMatch = beforeCursor.match(new RegExp(`\\b${escapeRegExp(commandName)}\\s*\\(([^)]*)$`));
  const activeText = declarationMatch?.[1] ?? callMatch?.[1] ?? "";
  if (!declarationMatch && !callMatch) {
    return null;
  }
  const commaCount = (activeText.match(/,/g) ?? []).length;
  return clamp(commaCount, 0, parameterCount - 1);
}

export function rustFunctionLocation(rustLogic: string, commandName: string) {
  const safeName = sanitizeRustCommandName(commandName);
  const lines = rustLogic.split(/\r?\n/);
  const pattern = new RegExp(`\\bfn\\s+${safeName}\\b`);
  const lineIndex = lines.findIndex((line) => pattern.test(line));
  if (lineIndex < 0) {
    return null;
  }
  return {
    line: lineIndex + 1,
    column: Math.max(1, lines[lineIndex].search(pattern) + 1),
  };
}

export function rustOutlineKindLabel(kind: RustLogicOutlineKind) {
  switch (kind) {
    case "slot":
      return "slot";
    case "function":
      return "fn";
    case "module":
      return "mod";
    case "type":
      return "type";
    case "impl":
      return "impl";
    case "constant":
      return "const";
    default:
      return kind;
  }
}

export function rustOutlineKindTitle(kind: RustLogicOutlineKind) {
  switch (kind) {
    case "slot":
      return "槽函数";
    case "function":
      return "函数";
    case "module":
      return "模块";
    case "type":
      return "类型";
    case "impl":
      return "实现块";
    case "constant":
      return "常量";
    default:
      return "符号";
  }
}

export function rustCompletionKindLabel(kind: RustCompletionKind) {
  switch (kind) {
    case "snippet":
      return "模板片段";
    case "command":
      return "项目命令";
    case "parameter":
      return "命令参数";
    case "state":
      return "项目状态";
    case "module":
      return "Rust 模块";
    case "dependency":
      return "Cargo 依赖";
    case "symbol":
      return "源码符号";
    default:
      return kind;
  }
}

export function rustCompletionInsertPreview(insertText: string) {
  const preview = insertText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return preview.length > 120 ? `${preview.slice(0, 117)}...` : preview || "空插入";
}

export function rustCompletionSymbolEntries(rustLogic: string) {
  const entries: Array<{ id: string; kind: RustLogicOutlineKind; label: string; detail: string; line: number }> = [];
  const seen = new Set<string>();

  rustLogic.split(/\r?\n/).forEach((line, index) => {
    const lineNumber = index + 1;
    const functionMatch = line.match(/^\s*(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?(?:unsafe\s+)?(?:extern\s+"[^"]+"\s+)?fn\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)/);
    const moduleMatch = line.match(/^\s*(?:pub(?:\([^)]*\))?\s+)?mod\s+([A-Za-z_][A-Za-z0-9_]*)\b/);
    const typeMatch = line.match(/^\s*(?:pub(?:\([^)]*\))?\s+)?(struct|enum|trait|type)\s+([A-Za-z_][A-Za-z0-9_]*)\b/);
    const implMatch = line.match(/^\s*impl(?:<[^>]*>)?\s+([^{]+)\s*\{/);
    const constantMatch = line.match(/^\s*(?:pub(?:\([^)]*\))?\s+)?(const|static)\s+([A-Za-z_][A-Za-z0-9_]*)\s*:/);

    let entry: { kind: RustLogicOutlineKind; label: string; detail: string } | null = null;
    if (functionMatch) {
      const [, name, signature = ""] = functionMatch;
      const parameterCount = signature.trim() ? signature.split(",").filter((part) => part.trim()).length : 0;
      entry = { kind: "function", label: name, detail: parameterCount > 0 ? `${parameterCount} 个参数` : "无参数" };
    } else if (moduleMatch) {
      entry = { kind: "module", label: moduleMatch[1], detail: line.includes(";") ? "外部模块" : "内联模块" };
    } else if (typeMatch) {
      entry = { kind: "type", label: typeMatch[2], detail: `${typeMatch[1]} 定义` };
    } else if (implMatch) {
      entry = { kind: "impl", label: implMatch[1].replace(/\s+/g, " ").trim(), detail: "impl 实现块" };
    } else if (constantMatch) {
      entry = { kind: "constant", label: constantMatch[2], detail: `${constantMatch[1]} 定义` };
    }

    if (!entry || !entry.label || entry.label.includes(" ")) {
      return;
    }
    const key = `${entry.kind}:${entry.label}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    entries.push({
      id: `symbol-${entry.kind}-${entry.label}-${lineNumber}`,
      ...entry,
      detail: `${rustOutlineKindTitle(entry.kind)} · ${entry.detail} · Ln ${lineNumber}`,
      line: lineNumber,
    });
  });

  return entries;
}

export function rustOutlineColumn(line: string, needle: string) {
  const index = line.indexOf(needle);
  return index >= 0 ? index + 1 : Math.max(1, line.search(/\S/) + 1);
}

export function rustLogicOutlineEntries(rustLogic: string, commands: RustCommand[], rows: LogicSignalSlotRow[], activeCommandId: string) {
  const commandBySafeName = new Map(commands.map((command) => [sanitizeRustCommandName(command.name), command]));
  const bindingCountByCommandId = new Map<string, number>();
  for (const row of rows) {
    if (!row.command?.id) {
      continue;
    }
    bindingCountByCommandId.set(row.command.id, (bindingCountByCommandId.get(row.command.id) ?? 0) + 1);
  }

  const seenCommandIds = new Set<string>();
  const entries: RustLogicOutlineEntry[] = [];
  const lines = rustLogic.split(/\r?\n/);
  lines.forEach((line, index) => {
    const functionMatch = line.match(/^\s*(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?(?:unsafe\s+)?(?:extern\s+"[^"]+"\s+)?fn\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)/);
    if (functionMatch) {
      const [, name, signature = ""] = functionMatch;
      const command = commandBySafeName.get(name) ?? null;
      if (command) {
        seenCommandIds.add(command.id);
      }
      const parameterCount = signature.trim() ? signature.split(",").filter((part) => part.trim()).length : 0;
      const bindingCount = command ? bindingCountByCommandId.get(command.id) ?? 0 : 0;
      entries.push({
        id: command ? `槽：${command.id}` : `函数：${name}:${index}`,
        kind: command ? "slot" : "function",
        label: name,
        detail: command
          ? `${bindingCount} 个 UI 绑定 · ${parameterCount} 个参数`
          : parameterCount > 0
            ? `手写函数 · ${parameterCount} 个参数`
            : "手写函数",
        line: index + 1,
        column: rustOutlineColumn(line, name),
        commandId: command?.id,
        bindingCount,
        active: Boolean(command && command.id === activeCommandId),
      });
      return;
    }

    const moduleMatch = line.match(/^\s*(?:pub(?:\([^)]*\))?\s+)?mod\s+([A-Za-z_][A-Za-z0-9_]*)\b/);
    if (moduleMatch) {
      const [, name] = moduleMatch;
      entries.push({
        id: `模块：${name}:${index}`,
        kind: "module",
        label: name,
        detail: line.includes(";") ? "外部模块声明" : "内联模块",
        line: index + 1,
        column: rustOutlineColumn(line, name),
        bindingCount: 0,
        active: false,
      });
      return;
    }

    const typeMatch = line.match(/^\s*(?:pub(?:\([^)]*\))?\s+)?(struct|enum|trait|type)\s+([A-Za-z_][A-Za-z0-9_]*)\b/);
    if (typeMatch) {
      const [, symbolType, name] = typeMatch;
      entries.push({
        id: `type:${symbolType}:${name}:${index}`,
        kind: "type",
        label: name,
        detail: `${symbolType} 定义`,
        line: index + 1,
        column: rustOutlineColumn(line, name),
        bindingCount: 0,
        active: false,
      });
      return;
    }

    const implMatch = line.match(/^\s*impl(?:<[^>]*>)?\s+([^{]+)\s*\{/);
    if (implMatch) {
      const label = implMatch[1].replace(/\s+/g, " ").trim();
      entries.push({
        id: `impl:${label}:${index}`,
        kind: "impl",
        label,
        detail: "impl 实现块",
        line: index + 1,
        column: rustOutlineColumn(line, "impl"),
        bindingCount: 0,
        active: false,
      });
      return;
    }

    const constantMatch = line.match(/^\s*(?:pub(?:\([^)]*\))?\s+)?(const|static)\s+([A-Za-z_][A-Za-z0-9_]*)\s*:/);
    if (constantMatch) {
      const [, symbolType, name] = constantMatch;
      entries.push({
        id: `常量：${name}:${index}`,
        kind: "constant",
        label: name,
        detail: `${symbolType} 定义`,
        line: index + 1,
        column: rustOutlineColumn(line, name),
        bindingCount: 0,
        active: false,
      });
    }
  });

  const sourceEntries = entries
    .filter((entry) => entry.line !== null)
    .sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
  sourceEntries.forEach((entry, index) => {
    const nextEntry = sourceEntries[index + 1];
    entry.endLine = Math.max(entry.line ?? 1, (nextEntry?.line ?? lines.length + 1) - 1);
  });

  for (const command of commands) {
    if (seenCommandIds.has(command.id)) {
      continue;
    }
    const safeName = sanitizeRustCommandName(command.name);
    entries.push({
      id: `missing-槽：${command.id}`,
      kind: "slot",
      label: safeName,
      detail: `${bindingCountByCommandId.get(command.id) ?? 0} 个 UI 绑定 · 未找到同名函数`,
      line: null,
      commandId: command.id,
      bindingCount: bindingCountByCommandId.get(command.id) ?? 0,
      active: command.id === activeCommandId,
    });
  }

  return entries.sort((a, b) => {
    if (a.line && b.line) {
      return a.line - b.line;
    }
    if (a.line) {
      return -1;
    }
    if (b.line) {
      return 1;
    }
    return a.label.localeCompare(b.label);
  });
}

export function rustEditorSelectionFromValue(value: string, selectionStart: number, selectionEnd = selectionStart): RustEditorSelection {
  const cursor = clamp(selectionStart, 0, value.length);
  const safeEnd = clamp(selectionEnd, 0, value.length);
  const beforeCursor = value.slice(0, cursor);
  const line = beforeCursor.split(/\r?\n/).length;
  const lastLineBreak = Math.max(beforeCursor.lastIndexOf("\n"), beforeCursor.lastIndexOf("\r"));
  return {
    cursor,
    selectionStart: cursor,
    selectionEnd: safeEnd,
    line,
    column: cursor - lastLineBreak,
  };
}

export function rustLineStartIndex(source: string, lineNumber: number) {
  const targetLine = Math.max(1, Math.trunc(lineNumber));
  let line = 1;
  let index = 0;

  while (line < targetLine && index < source.length) {
    const nextLineBreak = source.indexOf("\n", index);
    if (nextLineBreak < 0) {
      return source.length;
    }
    index = nextLineBreak + 1;
    line += 1;
  }

  return index;
}

export function isRustIdentifierPart(value: string) {
  return /^[A-Za-z0-9_]$/.test(value);
}

export function isRustIdentifierName(value: string) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value) && !RUST_RESERVED_WORDS.has(value);
}

export function rustIdentifierAtSelection(source: string, selectionStart: number, selectionEnd: number): RustIdentifierTarget | null {
  const start = clamp(selectionStart, 0, source.length);
  const end = clamp(selectionEnd, 0, source.length);
  const selected = source.slice(start, end);
  if (selected && isRustIdentifierName(selected)) {
    return { name: selected, start, end };
  }

  let cursor = start;
  if (!isRustIdentifierPart(source[cursor] ?? "") && cursor > 0 && isRustIdentifierPart(source[cursor - 1] ?? "")) {
    cursor -= 1;
  }
  if (!isRustIdentifierPart(source[cursor] ?? "")) {
    return null;
  }

  let left = cursor;
  while (left > 0 && isRustIdentifierPart(source[left - 1] ?? "")) {
    left -= 1;
  }

  let right = cursor + 1;
  while (right < source.length && isRustIdentifierPart(source[right] ?? "")) {
    right += 1;
  }

  const name = source.slice(left, right);
  return isRustIdentifierName(name) ? { name, start: left, end: right } : null;
}

export function rustIdentifierOccurrences(source: string, name: string) {
  if (!isRustIdentifierName(name)) {
    return [] as Array<{ index: number; end: number }>;
  }

  return Array.from(source.matchAll(new RegExp(`\\b${escapeRegExp(name)}\\b`, "g")), (match) => ({
    index: match.index ?? 0,
    end: (match.index ?? 0) + name.length,
  }));
}

export const rustBracketPairs: Record<string, string> = {
  "(": ")",
  "{": "}",
  "[": "]",
};

export const rustClosingBrackets = new Map(Object.entries(rustBracketPairs).map(([open, close]) => [close, open]));

export function rustLocationAtIndex(source: string, index: number) {
  const selection = rustEditorSelectionFromValue(source, index);
  return { line: selection.line, column: selection.column };
}

export function findRustBracketMatch(source: string, selectionStart: number, selectionEnd = selectionStart): RustBracketMatch | null {
  const safeStart = clamp(selectionStart, 0, source.length);
  const safeEnd = clamp(selectionEnd, 0, source.length);
  const candidateIndexes = [safeStart, safeStart - 1, safeEnd - 1, safeEnd].filter(
    (index, position, indexes) => index >= 0 && index < source.length && indexes.indexOf(index) === position,
  );
  const anchor = candidateIndexes.find((index) => Boolean(rustBracketPairs[source[index]] || rustClosingBrackets.has(source[index])));

  if (anchor === undefined) {
    return null;
  }

  const anchorBracket = source[anchor];
  const openBracket = rustBracketPairs[anchorBracket] ? anchorBracket : rustClosingBrackets.get(anchorBracket) ?? anchorBracket;
  const closeBracket = rustBracketPairs[anchorBracket] ?? anchorBracket;
  const pair = `${openBracket}${closeBracket}`;

  if (rustBracketPairs[anchorBracket]) {
    let depth = 1;
    for (let index = anchor + 1; index < source.length; index += 1) {
      const character = source[index];
      if (character === anchorBracket) {
        depth += 1;
      } else if (character === closeBracket) {
        depth -= 1;
        if (depth === 0) {
          const openLocation = rustLocationAtIndex(source, anchor);
          const closeLocation = rustLocationAtIndex(source, index);
          return {
            anchor,
            anchorBracket,
            pair,
            direction: "forward",
            status: "matched",
            openIndex: anchor,
            closeIndex: index,
            openLine: openLocation.line,
            openColumn: openLocation.column,
            closeLine: closeLocation.line,
            closeColumn: closeLocation.column,
          };
        }
      }
    }
    return { anchor, anchorBracket, pair, direction: "forward", status: "unmatched", openIndex: anchor };
  }

  let depth = 1;
  for (let index = anchor - 1; index >= 0; index -= 1) {
    const character = source[index];
    if (character === anchorBracket) {
      depth += 1;
    } else if (character === openBracket) {
      depth -= 1;
      if (depth === 0) {
        const openLocation = rustLocationAtIndex(source, index);
        const closeLocation = rustLocationAtIndex(source, anchor);
        return {
          anchor,
          anchorBracket,
          pair,
          direction: "backward",
          status: "matched",
          openIndex: index,
          closeIndex: anchor,
          openLine: openLocation.line,
          openColumn: openLocation.column,
          closeLine: closeLocation.line,
          closeColumn: closeLocation.column,
        };
      }
    }
  }

  return { anchor, anchorBracket, pair, direction: "backward", status: "unmatched", closeIndex: anchor };
}

export function rustLineNumberAtIndex(source: string, index: number) {
  const cursor = clamp(Math.round(index), 0, source.length);
  return source.slice(0, cursor).split(/\r?\n/).length;
}

export function sanitizeRustLineForFormatting(line: string) {
  return line
    .replace(/"([^"\\]|\\.)*"/g, "\"\"")
    .replace(/'([^'\\]|\\.)*'/g, "''")
    .replace(/\/\/.*$/, "");
}

export function formatRustSource(source: string) {
  const normalized = source.replace(/\r\n?/g, "\n").trim();
  if (!normalized) {
    return "";
  }

  const lines = normalized.split("\n");
  let indent = 0;
  let blankCount = 0;
  const formatted: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      blankCount += 1;
      if (blankCount <= 1 && formatted.length > 0) {
        formatted.push("");
      }
      continue;
    }
    blankCount = 0;

    const leadingClosers = trimmed.match(/^[}\])]+/)?.[0].length ?? 0;
    indent = Math.max(0, indent - leadingClosers);
    formatted.push(`${" ".repeat(indent * 4)}${trimmed}`);

    const syntaxOnly = sanitizeRustLineForFormatting(trimmed);
    const opens = (syntaxOnly.match(/[{\[(]/g) ?? []).length;
    const closes = (syntaxOnly.match(/[}\])]/g) ?? []).length;
    indent = Math.max(0, indent + opens - Math.max(0, closes - leadingClosers));
  }

  return `${formatted.join("\n").replace(/\n{3,}/g, "\n\n")}\n`;
}

export function selectOptionsForItem(item: BuilderItem) {
  return itemOptionTexts(item.props);
}

export const optionComponentTypes: readonly BuilderComponentType[] = [
  "button-group",
  "dialog-button-box",
  "toggle-group",
  "menu-button",
  "select",
  "multi-select",
  "split-button",
  "checkbox-group",
  "radio",
  "radio-group",
  "tag-input",
  "segmented",
  "chips",
  "tabs",
  "menu-bar",
  "menu",
  "list",
  "list-view",
  "column-view",
  "icon-view",
  "command-list",
  "command-palette",
  "search-view",
  "notification-center",
  "system-tray",
  "shortcut-table",
  "resource-browser",
  "task-list",
  "settings-list",
  "tree-view",
  "tree-table",
  "outline-view",
  "signal-slot-editor",
  "node-graph",
  "log-viewer",
  "property-browser",
  "breadcrumb-bar",
  "toolbar",
  "top-app-bar",
  "bottom-app-bar",
  "navigation-bar",
  "navigation-suite",
  "status-bar",
  "split-view",
  "splitter",
  "supporting-pane",
  "scroll-area",
  "stacked-pages",
  "dock-panel",
  "mdi-area",
  "navigation",
  "navigation-drawer",
  "navigation-rail",
  "side-sheet",
  "bottom-sheet",
  "accordion",
  "tool-box",
  "group-box",
  "combobox",
  "autocomplete",
  "font-combo-box",
  "date-range-picker",
  "color-picker",
  "calendar-scheduler",
  "stepper",
  "wizard",
  "carousel",
  "table-view",
  "data-grid",
  "property-grid",
  "key-value-list",
  "chart-view",
  "kanban-board",
  "inspector-section",
  "form-layout",
  "console-panel",
  "terminal-view",
  "timeline",
  "status-indicator",
  "graphics-view",
  "web-view",
  "media-player",
  "pdf-viewer",
  "map-view",
];

export function itemUsesOptions(item: BuilderItem) {
  return optionComponentTypes.includes(item.type);
}

export function propertySchemaHint(field: BuilderPropertySchemaField) {
  const hints: string[] = [field.kind];
  if (field.required) {
    hints.push("必填");
  } else if (field.recommended) {
    hints.push("推荐");
  }
  if (field.options?.length) {
    hints.push(field.options.join(" / "));
  }
  if (typeof field.min === "number" || typeof field.max === "number") {
    hints.push(`${field.min ?? "-inf"}..${field.max ?? "inf"}`);
  }
  if (typeof field.maxLength === "number") {
    hints.push(`最多 ${field.maxLength} 字符`);
  }
  return hints.join(" | ");
}

export function propertyIssueId(file: DesignerFile, item: BuilderItem, prop: keyof BuilderItemProps, suffix: string) {
  return `${file.id}-${item.id}-${String(prop)}-${suffix}`;
}

export function propertyFallbackValue(item: BuilderItem, field: BuilderPropertySchemaField) {
  const definition = getDefinition(item.type);
  const defaultValue = definition.defaultProps[field.prop];
  if (defaultValue !== undefined && textPropertyValue(defaultValue).trim()) {
    return defaultValue;
  }
  if (field.options?.length) {
    return field.options[0];
  }
  if (field.kind === "boolean") {
    return false;
  }
  if (field.kind === "number") {
    return field.min ?? 0;
  }
  if (field.prop === "alt") {
    return item.props.label || item.name || "项目资源";
  }
  if (field.prop === "title" || field.prop === "label") {
    return item.name || definition.title;
  }
  return "";
}

export function setPropertyPatchValue(patch: BuilderItemProps, prop: keyof BuilderItemProps, value: BuilderItemProps[keyof BuilderItemProps]) {
  (patch as Record<keyof BuilderItemProps, BuilderItemProps[keyof BuilderItemProps]>)[prop] = value;
}

export function propertyAutoFixPatchForItem(item: BuilderItem): BuilderItemProps {
  const patch: BuilderItemProps = {};
  for (const field of propertySchemaForItem(item)) {
    const value = item.props[field.prop];
    const textValue = textPropertyValue(value);
    const emptyText = !textValue.trim();

    if ((field.required || field.recommended) && emptyText) {
      setPropertyPatchValue(patch, field.prop, propertyFallbackValue(item, field));
      continue;
    }

    if (field.kind === "number" && value !== undefined && value !== null) {
      const numericValue = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(numericValue)) {
        setPropertyPatchValue(patch, field.prop, propertyFallbackValue(item, field));
      } else {
        const clamped = clamp(numericValue, field.min ?? numericValue, field.max ?? numericValue);
        if (clamped !== numericValue) {
          setPropertyPatchValue(patch, field.prop, clamped);
        }
      }
    }

    if (field.kind === "boolean" && value !== undefined && typeof value !== "boolean") {
      setPropertyPatchValue(patch, field.prop, Boolean(value));
    }

    if (field.kind === "select" && field.options?.length && (emptyText || !field.options.includes(textValue))) {
      setPropertyPatchValue(patch, field.prop, propertyFallbackValue(item, field));
    }
  }

  if (itemUsesOptions(item)) {
    const defaultOptions = getDefinition(item.type).defaultProps;
    const options = selectOptionsForItem(item);
    if (options.length === 0) {
      patch.optionA = defaultOptions.optionA ?? "Option A";
      patch.optionB = defaultOptions.optionB ?? "Option B";
      patch.optionC = defaultOptions.optionC ?? "Option C";
      patch.value = defaultOptions.value ?? patch.optionA;
    } else if (item.props.value && !options.includes(item.props.value.trim())) {
      patch.value = options[0];
    } else if (!item.props.value?.trim()) {
      patch.value = options[0];
    }
  }

  return patch;
}

export function propertyPatchSize(patch: BuilderItemProps) {
  return Object.keys(patch).length;
}

export function propertyIssuesForItem(file: DesignerFile, item: BuilderItem): BuilderPropertyIssue[] {
  const issues: BuilderPropertyIssue[] = [];
  const pushIssue = (field: Pick<BuilderPropertySchemaField, "prop" | "label">, severity: BuilderPropertyIssue["severity"], message: string, suffix: string) => {
    issues.push({
      id: propertyIssueId(file, item, field.prop, suffix),
      severity,
      fileId: file.id,
      fileName: file.name,
      itemId: item.id,
      itemName: getItemSummary(item),
      itemType: item.type,
      prop: field.prop,
      label: field.label,
      message,
    });
  };

  for (const field of propertySchemaForItem(item)) {
    const value = item.props[field.prop];
    const textValue = textPropertyValue(value);
    const emptyText = !textValue.trim();
    if (field.required && emptyText) {
      pushIssue(field, "error", `${field.label} 不能为空。`, "required");
      continue;
    }
    if (field.recommended && emptyText) {
      pushIssue(field, "warning", `建议填写 ${field.label}，生成界面和可访问性会更清楚。`, "recommended");
      continue;
    }

    if (!emptyText && typeof field.minLength === "number" && textValue.trim().length < field.minLength) {
      pushIssue(field, "error", `${field.label} 至少需要 ${field.minLength} 个字符。`, "min-length");
    }
    if (!emptyText && typeof field.maxLength === "number" && textValue.length > field.maxLength) {
      pushIssue(field, "warning", `${field.label} 当前 ${textValue.length} 个字符，建议不超过 ${field.maxLength}。`, "max-length");
    }
    if (field.kind === "number" && value !== undefined && value !== null) {
      const numericValue = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(numericValue)) {
        pushIssue(field, "error", `${field.label} 必须是数字。`, "number");
      } else if ((typeof field.min === "number" && numericValue < field.min) || (typeof field.max === "number" && numericValue > field.max)) {
        pushIssue(field, "error", `${field.label} 需要在 ${field.min ?? "-inf"} 到 ${field.max ?? "inf"} 之间。`, "range");
      }
    }
    if (field.kind === "boolean" && value !== undefined && typeof value !== "boolean") {
      pushIssue(field, "error", `${field.label} 必须是 true/false。`, "boolean");
    }
    if (field.kind === "select" && !emptyText && field.options?.length && !field.options.includes(textValue)) {
      pushIssue(field, "error", `${field.label} 必须是 ${field.options.join(", ")} 之一。`, "enum");
    }
  }

  if (itemUsesOptions(item)) {
    const options = selectOptionsForItem(item);
    const value = item.props.value?.trim() ?? "";
    if (options.length === 0) {
      pushIssue({ prop: "optionA", label: "选项" }, "error", "该控件至少需要一个候选项。", "empty-options");
    } else if (value && !options.includes(value)) {
      pushIssue({ prop: "value", label: "值" }, "warning", `当前值不在候选项中：${options.join(", ")}。`, "value-option");
    }
  }

  return issues;
}

export function propertyIssuesForProject(project: DesignerProject) {
  return project.files.flatMap((file) => file.items.flatMap((item) => propertyIssuesForItem(file, item)));
}

export function propertyAutoFixSummaryForProject(project: DesignerProject): BuilderPropertyAutoFixSummary {
  const targets: BuilderPropertyAutoFixTarget[] = [];
  let issueCount = 0;
  let errorCount = 0;
  let warningCount = 0;
  let fixableIssueCount = 0;

  for (const file of project.files) {
    for (const item of file.items) {
      const issues = propertyIssuesForItem(file, item);
      issueCount += issues.length;
      errorCount += issues.filter((issue) => issue.severity === "error").length;
      warningCount += issues.filter((issue) => issue.severity === "warning").length;
      const patch = propertyAutoFixPatchForItem(item);
      const propertyCount = propertyPatchSize(patch);
      if (issues.length > 0 && propertyCount > 0) {
        const patchProps = new Set(Object.keys(patch));
        fixableIssueCount += issues.filter((issue) => patchProps.has(issue.prop)).length;
        targets.push({
          fileId: file.id,
          fileName: file.name,
          itemId: item.id,
          itemName: getItemSummary(item),
          itemType: item.type,
          issueCount: issues.length,
          patch,
          propertyCount,
        });
      }
    }
  }

  return {
    targets,
    issueCount,
    errorCount,
    warningCount,
    manualIssueCount: Math.max(0, issueCount - fixableIssueCount),
    propertyCount: targets.reduce((sum, target) => sum + target.propertyCount, 0),
    fileCount: new Set(targets.map((target) => target.fileId)).size,
  };
}

export function projectJumpKindLabel(kind: ProjectJumpKind) {
  const labels: Record<ProjectJumpKind, string> = {
    action: "操作",
    file: "UI 文件",
    component: "组件",
    control: "控件",
    "rust-command": "Rust",
    state: "状态",
    asset: "资源",
    artifact: "产物",
    validation: "验证",
    pipeline: "流水线",
    maintenance: "修复",
    settings: "设置",
    checkpoint: "检查点",
  };
  return labels[kind];
}

export {
  buildReadinessSeverityLabel,
  editorExperienceAuditSeverityLabel,
  visualAuditSeverityLabel,
} from "./status-labels";

export function editorExperienceAuditBadgeVariant(severity: EditorExperienceAuditSeverity) {
  if (severity === "fail") {
    return "destructive";
  }
  return severity === "warning" ? "outline" : "secondary";
}

export function booleanStateLabel(enabled: boolean) {
  return enabled ? "已启用" : "已停用";
}

export function backendArtifactInspectionStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ok: "正常",
    missing: "未找到",
    warning: "警告",
    error: "错误",
  };
  return labels[status] ?? status;
}

export function generatedFileStatusLabel(status: string) {
  const labels: Record<string, string> = {
    create: "新增",
    update: "更新",
    copy: "复制",
    unchanged: "未变化",
    delete: "删除",
  };
  return labels[status] ?? status;
}

export function projectJumpSearchText(parts: Array<string | number | undefined | null>) {
  return parts.filter((part) => part !== undefined && part !== null).join(" ").toLowerCase();
}

export function projectJumpFuzzyMatch(text: string, token: string) {
  if (text.includes(token)) {
    return true;
  }
  if (token.length < 3) {
    return false;
  }

  return text
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .some((word) => {
      if (!word.startsWith(token[0])) {
        return false;
      }
      let cursor = 0;
      for (const character of token) {
        cursor = word.indexOf(character, cursor);
        if (cursor === -1) {
          return false;
        }
        cursor += 1;
      }
      return true;
    });
}

export function projectJumpResultScore(result: ProjectJumpResult, tokens: string[], query: string) {
  const title = result.title.toLowerCase();
  const subtitle = result.subtitle.toLowerCase();
  const badge = result.badge.toLowerCase();
  const searchable = result.searchable.toLowerCase();
  let score = 0;

  if (title === query) {
    score += 1000;
  } else if (title.startsWith(query)) {
    score += 800;
  } else if (title.includes(query)) {
    score += 600;
  }
  if (badge === query) {
    score += 120;
  }

  for (const token of tokens) {
    if (title.split(/\s+/).some((word) => word.startsWith(token))) {
      score += 120;
    } else if (title.includes(token)) {
      score += 90;
    }
    if (badge.includes(token)) {
      score += 40;
    }
    if (subtitle.includes(token)) {
      score += 20;
    }
    if (searchable.includes(token)) {
      score += 8;
    }
  }

  return score;
}

export function buildProjectJumpResults(project: DesignerProject, checkpoints: EditorProjectCheckpoint[]): ProjectJumpResult[] {
  const results: ProjectJumpResult[] = [];
  const actionResults: ProjectJumpResult[] = [
    {
      id: "settings-release",
      kind: "settings",
      title: "项目发布设置",
      subtitle: "编辑应用名称、bundle id、版本、打包目标和窗口行为。",
      badge: "设置",
      mode: "design",
      searchable: projectJumpSearchText(["project settings release config app name bundle identifier version target window"]),
    },
    {
      id: "action-save-project",
      kind: "action",
      title: "保存项目",
      subtitle: "保存工作区、UI 文件、Rust 逻辑和项目元数据。",
      badge: "保存",
      mode: "build",
      actionId: "save-project",
      searchable: projectJumpSearchText(["save persist disk project workspace ui rust metadata"]),
    },
    {
      id: "action-new-ui-file",
      kind: "action",
      title: "新建 UI 文件",
      subtitle: "在当前 Nova 项目中创建另一个受管理窗口。",
      badge: "UI",
      mode: "design",
      actionId: "new-ui-file",
      searchable: projectJumpSearchText(["new create ui file window canvas screen"]),
    },
    {
      id: "action-duplicate-ui-file",
      kind: "action",
      title: "复制当前 UI 文件",
      subtitle: "复制当前 UI 文件、控件、页面设置和响应式覆盖。",
      badge: "UI",
      mode: "design",
      actionId: "duplicate-ui-file",
      searchable: projectJumpSearchText(["duplicate copy clone current ui file window canvas screen"]),
    },
    {
      id: "action-delete-ui-file",
      kind: "action",
      title: "删除当前 UI 文件",
      subtitle: "移除或清空当前 UI 文件前先打开确认。",
      badge: "UI",
      mode: "design",
      actionId: "delete-ui-file",
      searchable: projectJumpSearchText(["delete remove clear current ui file window canvas screen"]),
    },
    {
      id: "action-add-rust-command",
      kind: "action",
      title: "添加 Rust 命令",
      subtitle: "为 UI 事件注册新的 Tauri invoke 命令。",
      badge: "invoke",
      mode: "logic",
      actionId: "add-rust-command",
      searchable: projectJumpSearchText(["add create rust command invoke backend logic event"]),
    },
    {
      id: "action-bind-control-event",
      kind: "action",
      title: "绑定所选控件事件",
      subtitle: "创建 Rust 命令并连接到所选控件事件。",
      badge: "绑定",
      mode: "design",
      actionId: "bind-control-event",
      searchable: projectJumpSearchText(["bind selected control event create connection rust command signal slot"]),
    },
    {
      id: "action-run-selected-event",
      kind: "action",
      title: "运行所选事件",
      subtitle: "模拟所选控件事件并查看最新结果。",
      badge: "运行",
      mode: "design",
      actionId: "run-selected-event",
      searchable: projectJumpSearchText(["run simulate selected control event invoke command result logs"]),
    },
    {
      id: "action-add-state-variable",
      kind: "action",
      title: "添加状态变量",
      subtitle: "创建用于绑定和命令结果的共享项目状态。",
      badge: "状态",
      mode: "logic",
      actionId: "add-state-variable",
      searchable: projectJumpSearchText(["add create state variable binding shared result"]),
    },
    {
      id: "action-sync-rust",
      kind: "action",
      title: "同步 Rust 源码",
      subtitle: "根据命令注册表重新生成 Rust 逻辑。",
      badge: "同步",
      mode: "logic",
      actionId: "sync-rust",
      searchable: projectJumpSearchText(["sync regenerate rust source logic commands registry"]),
    },
    {
      id: "action-add-image-asset",
      kind: "action",
      title: "导入图片资源",
      subtitle: "把本地图片资源加入受管理的项目资源。",
      badge: "资源",
      mode: "design",
      actionId: "add-image-asset",
      searchable: projectJumpSearchText(["import add image asset resource png jpg svg"]),
    },
    {
      id: "action-generate-file-plan",
      kind: "action",
      title: "生成文件计划",
      subtitle: "保存到项目文件夹前计算目标应用文件和磁盘差异。",
      badge: "计划",
      mode: "build",
      actionId: "generate-file-plan",
      searchable: projectJumpSearchText(["generated file plan diff target app save project folder write disk"]),
    },
    {
      id: "action-apply-generated-files",
      kind: "action",
      title: "应用所选生成文件",
      subtitle: "带写入前快照地把所选目标文件保存到项目文件夹。",
      badge: "应用",
      mode: "build",
      actionId: "apply-generated-files",
      searchable: projectJumpSearchText(["apply selected generated files write snapshot target app"]),
    },
    {
      id: "action-apply-generated-changes",
      kind: "action",
      title: "应用生成变更",
      subtitle: "基于最新文件计划，带写入前快照地保存全部已变更目标文件。",
      badge: "全部应用",
      mode: "build",
      actionId: "apply-generated-changes",
      searchable: projectJumpSearchText(["apply all generated changes changed files write snapshot target app"]),
    },
    {
      id: "action-build-backend-artifacts",
      kind: "action",
      title: "构建后端产物",
      subtitle: "运行 C++/Go starter 构建脚本并刷新产物状态。",
      badge: "后端",
      mode: "logic",
      actionId: "build-backend-artifacts",
      searchable: projectJumpSearchText(["build backend artifacts cpp ffi go sidecar starter script artifact"]),
    },
    {
      id: "action-quick-check-all",
      kind: "action",
      title: "运行全部快速检查",
      subtitle: "构建可执行文件前运行前端和 Rust 检查。",
      badge: "检查",
      mode: "build",
      actionId: "quick-check-all",
      searchable: projectJumpSearchText(["run all quick checks frontend rust cargo npm build verify"]),
    },
    {
      id: "action-audit-editor-experience",
      kind: "action",
      title: "编辑器体验审计",
      subtitle: "检查选择、多选、输出 Dock、窗口壳、项目树、Rust 逻辑和运行区是否仍然符合桌面编辑器体验。",
      badge: "体验",
      mode: "build",
      actionId: "audit-editor-experience",
      searchable: projectJumpSearchText(["audit editor experience selection marquee dock shell titlebar rust project tree qt creator workflow"]),
    },
    {
      id: "action-quick-check-frontend",
      kind: "action",
      title: "运行前端检查",
      subtitle: "运行生成目标应用的前端检查。",
      badge: "web",
      mode: "build",
      actionId: "quick-check-frontend",
      searchable: projectJumpSearchText(["run frontend check npm vite web generated target app"]),
    },
    {
      id: "action-quick-check-rust",
      kind: "action",
      title: "运行 Rust 检查",
      subtitle: "对生成目标应用执行 cargo check。",
      badge: "cargo",
      mode: "build",
      actionId: "quick-check-rust",
      searchable: projectJumpSearchText(["run rust check cargo generated target app"]),
    },
    {
      id: "action-validate-window",
      kind: "action",
      title: "验证生成窗口",
      subtitle: "对生成目标窗口运行视觉和运行时验证。",
      badge: "审查",
      mode: "build",
      actionId: "validate-window",
      searchable: projectJumpSearchText(["validate generated window visual runtime audit screenshot breakpoint"]),
    },
    {
      id: "action-build-exe",
      kind: "action",
      title: "构建 release exe",
      subtitle: "把受管理的目标应用编译成发布可执行文件。",
      badge: "exe",
      mode: "build",
      actionId: "build-exe",
      searchable: projectJumpSearchText(["build release exe executable compile target app tauri"]),
    },
    {
      id: "action-bundle-installer",
      kind: "action",
      title: "打包安装器",
      subtitle: "构建安装包并收集产物冒烟测试元数据。",
      badge: "打包",
      mode: "build",
      actionId: "bundle-installer",
      searchable: projectJumpSearchText(["bundle installer msi nsis artifact smoke release"]),
    },
    {
      id: "action-fix-property-schema",
      kind: "action",
      title: "修复属性结构问题",
      subtitle: "应用安全的项目级控件属性修复。",
      badge: "修复",
      mode: "build",
      actionId: "fix-property-schema",
      searchable: projectJumpSearchText(["fix repair property schema control issue autofix maintenance"]),
    },
  ];
  results.push(...actionResults);

  for (const definition of palette) {
    results.push({
      id: `component-${definition.type}`,
      kind: "component",
      title: `插入${definition.title}`,
      subtitle: `${definition.description} 会加入当前 UI 文件，并在画布中选中。`,
      badge: definition.type,
      mode: "design",
      insertComponentType: definition.type,
      searchable: projectJumpSearchText([
        "insert add create component control palette toolbox canvas",
        definition.type,
        definition.title,
        definition.description,
      ]),
    });
  }

  for (const file of project.files) {
    results.push({
      id: `file-${file.id}`,
      kind: "file",
      title: file.name,
      subtitle: `${file.path} · ${file.items.length} 个控件 · ${file.page.width} x ${file.page.height}`,
      badge: "UI",
      mode: "design",
      fileId: file.id,
      searchable: projectJumpSearchText([file.name, file.path, file.page.title, "ui file window canvas"]),
    });

    for (const item of file.items) {
      const summary = getItemSummary(item);
      results.push({
        id: `control-${file.id}-${item.id}`,
        kind: "control",
        title: summary,
        subtitle: `${file.name} · ${item.type} · x ${Math.round(item.x)} y ${Math.round(item.y)} · ${Math.round(item.width)} x ${Math.round(item.height)}`,
        badge: item.type,
        mode: "design",
        fileId: file.id,
        itemId: item.id,
        searchable: projectJumpSearchText([
          summary,
          item.name,
          item.type,
          file.name,
          file.path,
          item.props.title,
          item.props.label,
          item.props.value,
          item.props.description,
          "control canvas node",
        ]),
      });
    }
  }

  for (const command of project.rustCommands) {
    const safeName = sanitizeRustCommandName(command.name);
    results.push({
      id: `rust-command-${command.id}`,
      kind: "rust-command",
      title: safeName,
      subtitle: `${rustCommandParameters(command).length} 个参数 · ${commandResultSchema(command).mode} 结果`,
      badge: "invoke",
      mode: "logic",
      commandId: command.id,
      searchable: projectJumpSearchText([safeName, command.name, command.response, "rust command invoke backend logic"]),
    });
  }

  for (const state of project.stateVariables) {
    results.push({
      id: `state-${state.id}`,
      kind: "state",
      title: state.name,
      subtitle: `初始值：${state.initialValue || "（空）"}`,
      badge: "状态",
      mode: "logic",
      stateId: state.id,
      searchable: projectJumpSearchText([state.name, state.initialValue, "state variable binding"]),
    });
  }

  for (const asset of project.assets) {
    results.push({
      id: `asset-${asset.id}`,
      kind: "asset",
      title: asset.name,
      subtitle: asset.publicPath || asset.sourcePath,
      badge: asset.kind,
      mode: "design",
      assetId: asset.id,
      path: asset.sourcePath,
      searchable: projectJumpSearchText([asset.name, asset.publicPath, asset.sourcePath, "asset image resource"]),
    });
  }

  for (const entry of project.releasePipelineHistory ?? []) {
    results.push({
      id: `pipeline-${entry.id}`,
      kind: "pipeline",
      title: entry.presetTitle,
      subtitle: `${projectTaskStatusLabel(entry.status)} · ${entry.succeededCount}/${entry.stepCount} 步 · ${entry.summary}`,
      badge: entry.presetBadge,
      mode: "build",
      path: entry.recordPath || entry.artifactPath,
      secondaryPath: entry.artifactPath || entry.logPath || entry.outputExePath || entry.bundleManifestPath,
      searchable: projectJumpSearchText([
        entry.presetTitle,
        entry.presetBadge,
        entry.status,
        entry.summary,
        entry.releaseAppName,
        entry.releaseVersion,
        entry.recordPath,
        entry.artifactPath,
        "release pipeline preset run task center exe bundle",
      ]),
    });
  }

  for (const entry of project.buildHistory ?? []) {
    const primaryPath = entry.buildKind === "bundle" ? entry.bundlePaths?.[0] : entry.outputExePath;
    results.push({
      id: `artifact-${entry.id}`,
      kind: "artifact",
      title: entry.buildKind === "bundle" ? "安装包产物" : "可执行文件产物",
      subtitle: `${entry.releaseAppName} v${entry.releaseVersion} · ${entry.summary}`,
      badge: entry.buildKind,
      mode: "build",
      path: primaryPath,
      secondaryPath: entry.bundleManifestPath || entry.outputDir,
      searchable: projectJumpSearchText([entry.label, entry.releaseAppName, entry.releaseVersion, entry.summary, primaryPath, "build artifact exe bundle installer"]),
    });
  }

  for (const entry of project.validationHistory ?? []) {
    results.push({
      id: `validation-${entry.id}`,
      kind: "validation",
      title: "窗口验证",
      subtitle: `${entry.status} · ${entry.score}% · ${entry.summary}`,
      badge: entry.status,
      mode: "build",
      path: entry.reportPath,
      secondaryPath: entry.screenshotPath || entry.runtimeAuditPath || entry.breakpointValidationPath,
      searchable: projectJumpSearchText([entry.status, entry.summary, entry.reportPath, "validation audit screenshot breakpoint"]),
    });
  }

  for (const entry of project.maintenanceHistory ?? []) {
    results.push({
      id: `maintenance-${entry.id}`,
      kind: "maintenance",
      title: entry.title,
      subtitle: `${entry.propertyCount} 个属性 · ${entry.itemCount} 个控件 · ${entry.manualIssueCount} 个需手动处理`,
      badge: entry.status,
      mode: "build",
      searchable: projectJumpSearchText([
        entry.title,
        entry.summary,
        entry.status,
        ...entry.changes.flatMap((change) => [change.fileName, change.itemName, change.itemType, ...change.props]),
        "maintenance repair schema migration",
      ]),
    });
  }

  for (const checkpoint of checkpoints) {
    results.push({
      id: `checkpoint-${checkpoint.id}`,
      kind: "checkpoint",
      title: checkpoint.label,
      subtitle: `${checkpoint.project_name} · ${checkpoint.file_count} 个 UI 文件 · ${checkpoint.command_count} 个命令`,
      badge: "快照",
      mode: "build",
      path: checkpoint.path,
      searchable: projectJumpSearchText([checkpoint.label, checkpoint.project_name, checkpoint.path, "checkpoint snapshot restore"]),
    });
  }

  return results;
}

export function filterProjectJumpResults(results: ProjectJumpResult[], query: string) {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) {
    return results.slice(0, 8);
  }
  return results
    .filter((result) => tokens.every((token) => projectJumpFuzzyMatch(result.searchable, token)))
    .map((result, index) => ({
      result,
      index,
      score: projectJumpResultScore(result, tokens, tokens.join(" ")),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ result }) => result)
    .slice(0, 12);
}

export function projectTaskTimestamp(task: ProjectTaskEntry) {
  const timestamp = new Date(task.startedAt ?? task.createdAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function workflowTaskForActions(tasks: ProjectTaskEntry[], actions: ProjectJumpActionId[]) {
  const actionSet = new Set(actions);
  const relatedTasks = tasks.filter((task) => actionSet.has(task.actionId));
  return (
    relatedTasks.find((task) => task.status === "running") ??
    relatedTasks.find((task) => task.status === "queued") ??
    relatedTasks.reduce<ProjectTaskEntry | null>(
      (latest, task) => (!latest || projectTaskTimestamp(task) > projectTaskTimestamp(latest) ? task : latest),
      null,
    )
  );
}

export function workflowStepStatusLabel(status: ProjectTaskStatus | "idle") {
  const labels: Record<ProjectTaskStatus | "idle", string> = {
    idle: "待开始",
    queued: "排队中",
    running: "运行中",
    succeeded: "完成",
    failed: "失败",
    skipped: "已跳过",
    canceled: "已取消",
  };
  return labels[status];
}

export function workflowStepStatusClassName(status: ProjectTaskStatus | "idle", suggested: boolean) {
  if (status === "running") {
    return "border-primary bg-primary/10 text-primary";
  }
  if (status === "queued") {
    return "border-secondary bg-secondary/10 text-secondary-foreground";
  }
  if (status === "failed") {
    return "border-destructive bg-destructive/10 text-destructive";
  }
  if (status === "succeeded") {
    return "border-primary/40 bg-primary/5 text-primary";
  }
  if (suggested) {
    return "border-primary/60 bg-surface-container-high text-on-surface shadow-m3-1";
  }
  return "border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-outline hover:bg-surface-container-high hover:text-on-surface";
}

export function loadProjectJumpRecentIds() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PROJECT_JUMP_RECENTS_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string" && id.length > 0).slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function createPropertyMaintenanceEntry(summary: BuilderPropertyAutoFixSummary): ProjectMaintenanceEntry {
  const changes = summary.targets.map((target) => ({
    fileId: target.fileId,
    fileName: target.fileName,
    itemId: target.itemId,
    itemName: target.itemName,
    itemType: target.itemType,
    props: Object.keys(target.patch).sort(),
    issueCount: target.issueCount,
  }));

  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    action: "property-schema-repair",
    status: summary.manualIssueCount > 0 ? "partial" : "applied",
    title: "属性结构修复",
    summary:
      summary.manualIssueCount > 0
        ? `已应用 ${summary.propertyCount} 个安全属性修复；仍有 ${summary.manualIssueCount} 个问题需要检查。`
        : `已为 ${summary.targets.length} 个控件应用 ${summary.propertyCount} 个安全属性修复。`,
    fileCount: summary.fileCount,
    itemCount: summary.targets.length,
    propertyCount: summary.propertyCount,
    issueCount: summary.issueCount,
    manualIssueCount: summary.manualIssueCount,
    changes,
  };
}

export function mapLegacyType(type: string): BuilderComponentType | null {
  const direct = palette.some((definition) => definition.type === type);
  if (direct) {
    return type as BuilderComponentType;
  }
  const legacy: Record<string, BuilderComponentType> = {
    hero: "heading",
    stats: "stat",
    alert: "card",
  };
  return legacy[type] ?? null;
}

export function normalizeResponsiveOverrides(value: unknown, page: PageConfig) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const source = value as Partial<Record<ResponsiveBreakpointId, ResponsiveOverride>>;
  const entries = responsiveBreakpoints
    .filter((breakpoint) => breakpoint.id !== "desktop")
    .map((breakpoint) => {
      const override = source[breakpoint.id];
      if (!override || typeof override !== "object") {
        return null;
      }
      const size = responsiveBreakpointSize(breakpoint.id, page);
      const next: ResponsiveOverride = {};
      if (Number.isFinite(override.x)) {
        next.x = clamp(Number(override.x), 0, size.width);
      }
      if (Number.isFinite(override.y)) {
        next.y = clamp(Number(override.y), 0, size.height);
      }
      if (Number.isFinite(override.width)) {
        next.width = clamp(Number(override.width), MIN_ITEM_WIDTH, size.width);
      }
      if (Number.isFinite(override.height)) {
        next.height = clamp(Number(override.height), MIN_ITEM_HEIGHT, size.height);
      }
      return Object.keys(next).length > 0 ? [breakpoint.id, next] : null;
    })
    .filter((entry): entry is [ResponsiveBreakpointId, ResponsiveOverride] => Boolean(entry));

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export function normalizeBuilderState(value: unknown): SavedBuilderState | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const state = value as Partial<SavedBuilderState>;
  const page = { ...defaultPage, ...(state.page ?? {}) };
  page.width = clamp(Number(page.width), 320, 2400);
  page.height = clamp(Number(page.height), 240, 1800);
  page.gridSize = clamp(Number(page.gridSize), 4, 32);
  page.zoom = clamp(Number(page.zoom), 0.25, 2);
  page.showRulers = typeof page.showRulers === "boolean" ? page.showRulers : defaultPage.showRulers;
  page.activeBreakpoint = normalizeBreakpoint(page.activeBreakpoint);
  page.windowKind = normalizeReleaseWindowKind(page.windowKind);
  page.titlebarStyle = normalizeReleaseTitlebarStyle(page.titlebarStyle, page.windowKind);
  page.titlebarSubtitle = typeof page.titlebarSubtitle === "string" ? page.titlebarSubtitle.trim() : defaultPage.titlebarSubtitle;

  if (!Array.isArray(state.items)) {
    return { page, items: [] };
  }

  const items = state.items
    .map((rawItem, index) => {
      if (!rawItem || typeof rawItem !== "object") {
        return null;
      }
      const source = rawItem as Partial<BuilderItem> & { type?: string };
      const type = source.type ? mapLegacyType(source.type) : null;
      if (!type) {
        return null;
      }
      const definition = getDefinition(type);
      const fallback = createItem(type, page, index);
      const props = { ...definition.defaultProps, ...(source.props ?? {}) };
      if (type === "button" && props.actionCommandId && !props.events?.click?.commandId) {
        props.events = {
          ...(props.events ?? {}),
          click: { ...(props.events?.click ?? {}), commandId: props.actionCommandId },
        };
      }
      return normalizeItemBounds(
        {
          ...fallback,
          id: source.id || fallback.id,
          name: source.name || definition.title,
          parentId: typeof source.parentId === "string" ? source.parentId : undefined,
          x: Number.isFinite(source.x) ? Number(source.x) : 48 + (index % 4) * 28,
          y: Number.isFinite(source.y) ? Number(source.y) : 48 + Math.floor(index / 2) * 120,
          width: Number.isFinite(source.width) ? Number(source.width) : definition.defaultSize.width,
          height: Number.isFinite(source.height) ? Number(source.height) : definition.defaultSize.height,
          z: Number.isFinite(source.z) ? Number(source.z) : index + 1,
          locked: Boolean(source.locked),
          responsive: normalizeResponsiveOverrides(source.responsive, page),
          props,
        },
        page,
      );
    })
    .filter((item): item is BuilderItem => Boolean(item));

  const itemIds = new Set(items.map((item) => item.id));
  const frameIds = new Set(items.filter((item) => item.type === "frame").map((item) => item.id));
  const safeItems = items.map((item) => {
    if (!item.parentId || !itemIds.has(item.parentId) || !frameIds.has(item.parentId) || item.parentId === item.id) {
      return { ...item, parentId: undefined };
    }
    if (isDescendantOf(item.parentId, item.id, items)) {
      return { ...item, parentId: undefined };
    }
    return item;
  });

  return { page, items: safeItems };
}

export function cloneBuilderState(state: SavedBuilderState): SavedBuilderState {
  return {
    page: { ...state.page },
    items: state.items.map((item) => ({
      ...item,
      responsive: cloneResponsiveOverrides(item.responsive),
      props: { ...item.props },
    })),
  };
}

export function builderStateFingerprint(state: SavedBuilderState) {
  return JSON.stringify({
    page: state.page,
    items: state.items,
  });
}

export function designerFileContentFingerprint(file: DesignerFile) {
  return JSON.stringify({
    name: file.name,
    path: file.path,
    page: file.page,
    items: file.items,
  });
}

export function projectFileContentFingerprints(project: DesignerProject) {
  return Object.fromEntries(project.files.map((file) => [file.id, designerFileContentFingerprint(file)]));
}

export function workspaceFileContentFingerprints(workspace: DesignerWorkspace) {
  return Object.fromEntries(workspace.projects.map((project) => [project.id, projectFileContentFingerprints(project)]));
}

export function projectRustContentFingerprint(project: DesignerProject) {
  return JSON.stringify({
    rustLogic: project.rustLogic,
    rustCommands: project.rustCommands,
    activeRustCommandId: project.activeRustCommandId,
    rustModules: project.rustModules,
    activeRustModuleId: project.activeRustModuleId,
    cargoDependencies: project.cargoDependencies,
    activeCargoDependencyId: project.activeCargoDependencyId,
    stateVariables: project.stateVariables,
    activeStateVariableId: project.activeStateVariableId,
    backendIntegrations: project.backendIntegrations,
    activeBackendIntegrationId: project.activeBackendIntegrationId,
  });
}

export function workspaceRustContentFingerprints(workspace: DesignerWorkspace) {
  return Object.fromEntries(workspace.projects.map((project) => [project.id, projectRustContentFingerprint(project)]));
}

export function projectSettingsContentFingerprint(project: DesignerProject) {
  return JSON.stringify({
    name: project.name,
    description: project.description,
    assets: project.assets,
    releaseConfig: project.releaseConfig,
  });
}

export function workspaceProjectSettingsContentFingerprints(workspace: DesignerWorkspace) {
  return Object.fromEntries(workspace.projects.map((project) => [project.id, projectSettingsContentFingerprint(project)]));
}

/** Design inputs the generated web preview is built from (P1-7 hot reload). */
export function projectDesignContentFingerprint(project: DesignerProject) {
  return JSON.stringify({
    files: project.files.map((file) => ({ id: file.id, page: file.page, items: file.items })),
    assets: project.assets,
    stateVariables: project.stateVariables,
    rustCommands: project.rustCommands,
    rustLogic: project.rustLogic,
  });
}

export function getSelectionBounds(items: BuilderItem[]) {
  if (items.length === 0) {
    return null;
  }

  const left = Math.min(...items.map((item) => item.x));
  const top = Math.min(...items.map((item) => item.y));
  const right = Math.max(...items.map((item) => item.x + item.width));
  const bottom = Math.max(...items.map((item) => item.y + item.height));

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

export type BuilderTreeRow = { item: BuilderItem; depth: number };

export function buildTreeRows(items: BuilderItem[]) {
  const rows: BuilderTreeRow[] = [];
  const ordered = [...items].sort((a, b) => b.z - a.z);
  const walk = (parentId: string | undefined, depth: number) => {
    ordered
      .filter((item) => (item.parentId || undefined) === parentId)
      .forEach((item) => {
        rows.push({ item, depth });
        walk(item.id, depth + 1);
      });
  };
  walk(undefined, 0);
  return rows;
}

export function getLayerSiblings(items: BuilderItem[], item: BuilderItem) {
  const parentId = item.parentId || undefined;
  return items.filter((candidate) => (candidate.parentId || undefined) === parentId).sort((a, b) => a.z - b.z);
}

export function canMoveLayerWithinGroup(items: BuilderItem[], item: BuilderItem, direction: 1 | -1) {
  if (item.locked) {
    return false;
  }
  const siblings = getLayerSiblings(items, item);
  const index = siblings.findIndex((candidate) => candidate.id === item.id);
  const targetIndex = index + direction;
  return index >= 0 && targetIndex >= 0 && targetIndex < siblings.length;
}

export function navigatorTreeRowMatches(row: BuilderTreeRow, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const { item } = row;
  return [
    getItemSummary(item),
    item.name,
    item.type,
    item.parentId ? "child" : "root",
    item.locked ? "locked" : "unlocked",
    item.props.title,
    item.props.label,
    item.props.description,
    item.props.value,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

export function loadSavedBuilderState(): SavedBuilderState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LEGACY_BUILDER_STORAGE_KEY);
    return raw ? normalizeBuilderState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function projectTemplateSeedOptions() {
  return {
    defaultPage,
    defaultPropsForType: (type: BuilderComponentType) => getDefinition(type).defaultProps,
  };
}

export function createBlankFile(name = "主窗口.ui", pagePatch: Partial<PageConfig> = {}): DesignerFile {
  return createTemplateBlankFile(name, pagePatch, defaultPage);
}
export function createProject(name = "未命名项目", templateId: ProjectTemplateId = "blank"): DesignerProject {
  const now = new Date().toISOString();
  const seed = createProjectTemplateSeed(templateId, projectTemplateSeedOptions());
  const activeFile = seed.files[0] ?? createBlankFile("主窗口.ui");
  const rustModules = [createRustModule(0)];
  const cargoDependencies = [createCargoDependency(0)];
  const backendIntegrations = [createBackendIntegration(0)];
  return {
    id: createId(),
    name,
    description: seed.description,
    assets: [],
    stateVariables: seed.stateVariables,
    activeStateVariableId: seed.stateVariables[0]?.id,
    rustCommands: seed.rustCommands,
    activeRustCommandId: seed.rustCommands[0]?.id ?? "",
    rustLogic: createRustLogic(seed.rustCommands, backendIntegrations),
    rustModules,
    activeRustModuleId: rustModules[0]?.id,
    cargoDependencies,
    activeCargoDependencyId: cargoDependencies[0]?.id,
    backendIntegrations,
    activeBackendIntegrationId: backendIntegrations[0]?.id,
    maintenanceHistory: [],
    releasePipelineHistory: [],
    files: seed.files,
    activeFileId: activeFile.id,
    releaseConfig: releaseWindowShellFromPage(defaultReleaseConfig(name), getEffectivePage(activeFile.page)),
    createdAt: now,
    updatedAt: now,
  };
}

export function createWorkspace(project = createProject("Nova 项目")): DesignerWorkspace {
  return {
    projects: [project],
    activeProjectId: project.id,
  };
}

export function normalizeDesignerFile(value: unknown, index = 0): DesignerFile | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Partial<DesignerFile>;
  const state = normalizeBuilderState({ page: source.page, items: source.items });
  if (!state) {
    return null;
  }

  const now = new Date().toISOString();
  const name = source.name || (index === 0 ? "主窗口.ui" : `Window ${index + 1}.ui`);
  return {
    id: source.id || createId(),
    name,
    path: source.path || `ui/${name}`,
    page: state.page,
    items: state.items,
    updatedAt: source.updatedAt || now,
  };
}

export function normalizeOpenEditorFileIds(value: unknown, files: DesignerFile[], activeFileId: string) {
  const validFileIds = new Set(files.map((file) => file.id));
  const rawIds = Array.isArray(value) ? value.filter((id): id is string => typeof id === "string" && validFileIds.has(id)) : [];
  const orderedIds = [activeFileId, ...rawIds.filter((id) => id !== activeFileId)];
  const uniqueIds = Array.from(new Set(orderedIds)).filter((id) => validFileIds.has(id)).slice(0, 8);
  return uniqueIds.length > 0 ? uniqueIds : files[0]?.id ? [files[0].id] : [];
}

export function normalizeProjectEditorState(value: unknown, files: DesignerFile[], activeFileId: string): ProjectEditorState {
  const source = value && typeof value === "object" ? (value as Partial<ProjectEditorState>) : {};
  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0];
  const validItemIds = new Set((activeFile?.items ?? []).map((item) => item.id));
  const normalizeMode = (mode: unknown): BuilderMode =>
    mode === "project" || mode === "design" || mode === "logic" || mode === "build" ? mode : "design";
  const stringField = (field: unknown) => (typeof field === "string" && field.trim() ? field : undefined);
  const stringArrayField = (field: unknown) =>
    Array.isArray(field)
      ? Array.from(new Set(field.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0).map((entry) => entry.trim())))
      : undefined;
  const booleanField = (field: unknown, fallback = false) => (typeof field === "boolean" ? field : fallback);
  const optionalBooleanField = (field: unknown) => (typeof field === "boolean" ? field : undefined);
  const dockHeightField = (field: unknown, fallback: number) => {
    const value = typeof field === "number" ? field : Number(field);
    return Number.isFinite(value) ? clamp(value, 300, 900) : fallback;
  };
  const breakpointField = (field: unknown): ResponsiveBreakpointId | undefined =>
    field === "desktop" || field === "tablet" || field === "mobile" ? field : undefined;
  const canvasZoomField = (field: unknown) => {
    const value = typeof field === "number" ? field : Number(field);
    return Number.isFinite(value) ? Math.round(clamp(value, 0.25, 2) * 100) / 100 : undefined;
  };
  const canvasViewportField = (field: unknown) => {
    const value = typeof field === "number" ? field : Number(field);
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : undefined;
  };
  const rustEditorNumberField = (field: unknown) => {
    const value = typeof field === "number" ? field : Number(field);
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : undefined;
  };
  const selectedItemIdsField = (field: unknown) =>
    Array.isArray(field)
      ? Array.from(new Set(field.filter((id): id is string => typeof id === "string" && validItemIds.has(id))))
      : undefined;
  const selectionAnchorField = (field: unknown, ids?: string[]) => {
    const value = typeof field === "string" && validItemIds.has(field) ? field : undefined;
    return value ?? ids?.find((id) => validItemIds.has(id));
  };
  const logicResourceViewField = (field: unknown): LogicResourceViewId | undefined =>
    typeof field === "string" && logicResourceViewIds.includes(field as LogicResourceViewId)
      ? (field as LogicResourceViewId)
      : undefined;
  const logicConnectionFilterField = (field: unknown): LogicConnectionFilterId | undefined =>
    typeof field === "string" && logicConnectionFilterIds.includes(field as LogicConnectionFilterId)
      ? (field as LogicConnectionFilterId)
      : undefined;
  const componentPaletteCategoryField = (field: unknown): ComponentPaletteCategoryId | undefined =>
    typeof field === "string" && componentPaletteCategoryOptions.some((option) => option.id === field)
      ? (field as ComponentPaletteCategoryId)
      : undefined;
  const componentPaletteTypeListField = (field: unknown) => (Array.isArray(field) ? normalizeComponentTypeList(field, 8) : undefined);
  const inspectorPropertySectionsField = (field: unknown) => {
    if (!field || typeof field !== "object" || Array.isArray(field)) {
      return undefined;
    }
    const sectionSource = field as Record<string, unknown>;
    return Object.fromEntries(
      builderPropertySectionIds.map((section) => [
        section,
        typeof sectionSource[section] === "boolean" ? sectionSource[section] : defaultOpenPropertySections[section],
      ]),
    ) as Record<BuilderPropertySectionId, boolean>;
  };
  const selectedItemIds = selectedItemIdsField(source.selectedItemIds);
  return {
    openFileIds: normalizeOpenEditorFileIds(source.openFileIds, files, activeFileId),
    activeMode: normalizeMode(source.activeMode),
    activeLeftDockTab: stringField(source.activeLeftDockTab),
    activeRightDockTab: stringField(source.activeRightDockTab),
    leftDockCollapsed: booleanField(source.leftDockCollapsed),
    rightDockCollapsed: booleanField(source.rightDockCollapsed, true),
    activeBottomDockTab: stringField(source.activeBottomDockTab),
    bottomDockExpanded: booleanField(source.bottomDockExpanded),
    bottomDockMinimized: booleanField(source.bottomDockMinimized, true),
    bottomDockHeight: dockHeightField(source.bottomDockHeight, 360),
    bottomDockExpandedHeight: dockHeightField(source.bottomDockExpandedHeight, 560),
    selectedRailActionPresetId: stringField(source.selectedRailActionPresetId),
    canvasControlsExpanded: booleanField(source.canvasControlsExpanded),
    tabOrderOverlayVisible: booleanField(source.tabOrderOverlayVisible),
    canvasActiveBreakpoint: breakpointField(source.canvasActiveBreakpoint),
    canvasZoom: canvasZoomField(source.canvasZoom),
    canvasViewportScrollLeft: canvasViewportField(source.canvasViewportScrollLeft),
    canvasViewportScrollTop: canvasViewportField(source.canvasViewportScrollTop),
    selectedItemIds,
    selectionAnchorId: selectionAnchorField(source.selectionAnchorId, selectedItemIds),
    projectExplorerFilter: stringField(source.projectExplorerFilter),
    projectExplorerQuery: stringField(source.projectExplorerQuery),
    selectedProjectExplorerNodeId: stringField(source.selectedProjectExplorerNodeId),
    collapsedProjectExplorerNodeIds: stringArrayField(source.collapsedProjectExplorerNodeIds),
    navigatorQuery: stringField(source.navigatorQuery),
    componentPaletteQuery: stringField(source.componentPaletteQuery),
    componentPaletteCategory: componentPaletteCategoryField(source.componentPaletteCategory),
    componentPaletteRecentTypes: componentPaletteTypeListField(source.componentPaletteRecentTypes),
    componentPaletteFavoriteTypes: componentPaletteTypeListField(source.componentPaletteFavoriteTypes),
    inspectorPropertySections: inspectorPropertySectionsField(source.inspectorPropertySections),
    inspectorPropertyQuery: stringField(source.inspectorPropertyQuery),
    rustFindQuery: stringField(source.rustFindQuery),
    rustFindCaseSensitive: booleanField(source.rustFindCaseSensitive),
    logicSearchQuery: stringField(source.logicSearchQuery),
    logicResourceView: logicResourceViewField(source.logicResourceView),
    logicConnectionFilter: logicConnectionFilterField(source.logicConnectionFilter),
    rustEditorScrollTop: rustEditorNumberField(source.rustEditorScrollTop),
    rustEditorScrollLeft: rustEditorNumberField(source.rustEditorScrollLeft),
    rustEditorWordWrap: booleanField(source.rustEditorWordWrap),
    rustEditorSelectionStart: rustEditorNumberField(source.rustEditorSelectionStart),
    rustEditorSelectionEnd: rustEditorNumberField(source.rustEditorSelectionEnd),
    projectTaskSearchQuery: stringField(source.projectTaskSearchQuery),
    projectTaskStatusFilter: stringField(source.projectTaskStatusFilter),
    projectTaskKindFilter: stringField(source.projectTaskKindFilter),
    selectedProjectTaskId: stringField(source.selectedProjectTaskId),
    projectTaskLogSearchQuery: stringField(source.projectTaskLogSearchQuery),
    bottomDockLogSearchQuery: stringField(source.bottomDockLogSearchQuery),
    projectTaskQueuePaused: optionalBooleanField(source.projectTaskQueuePaused),
    activeGeneratedPreviewPath: stringField(source.activeGeneratedPreviewPath),
    selectedGeneratedPreviewPaths: stringArrayField(source.selectedGeneratedPreviewPaths),
    showGeneratedPlanAdvanced: optionalBooleanField(source.showGeneratedPlanAdvanced),
    selectedBuilderIssueId: stringField(source.selectedBuilderIssueId),
    activeEditorTabId: stringField(source.activeEditorTabId),
    updatedAt: typeof source.updatedAt === "string" && source.updatedAt.trim() ? source.updatedAt : new Date().toISOString(),
  };
}

export function normalizeDesignerWorkspace(value: unknown): DesignerWorkspace | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Partial<DesignerWorkspace>;
  if (!Array.isArray(source.projects)) {
    return null;
  }

  const projects = source.projects
    .map((projectValue, projectIndex): DesignerProject | null => {
      if (!projectValue || typeof projectValue !== "object") {
        return null;
      }

      const projectSource = projectValue as Partial<DesignerProject>;
      const files = Array.isArray(projectSource.files)
        ? projectSource.files.map((file, fileIndex) => normalizeDesignerFile(file, fileIndex)).filter((file): file is DesignerFile => Boolean(file))
        : [];
      const safeFiles = files.length > 0 ? files : [createBlankFile()];
      const now = new Date().toISOString();
      const activeFileId = safeFiles.some((file) => file.id === projectSource.activeFileId)
        ? projectSource.activeFileId!
        : safeFiles[0].id;
      const rustCommands = normalizeRustCommands((projectSource as Partial<DesignerProject>).rustCommands);
      const activeRustCommandId = rustCommands.some((command) => command.id === projectSource.activeRustCommandId)
        ? projectSource.activeRustCommandId!
        : rustCommands[0].id;
      const rustModules = normalizeRustModules((projectSource as Partial<DesignerProject>).rustModules);
      const activeRustModuleId = rustModules.some((module) => module.id === projectSource.activeRustModuleId)
        ? projectSource.activeRustModuleId
        : rustModules[0]?.id;
      const cargoDependencies = normalizeCargoDependencies((projectSource as Partial<DesignerProject>).cargoDependencies);
      const activeCargoDependencyId = cargoDependencies.some((dependency) => dependency.id === projectSource.activeCargoDependencyId)
        ? projectSource.activeCargoDependencyId
        : cargoDependencies[0]?.id;
      const backendIntegrations = normalizeBackendIntegrations((projectSource as Partial<DesignerProject>).backendIntegrations);
      const activeBackendIntegrationId = backendIntegrations.some((integration) => integration.id === projectSource.activeBackendIntegrationId)
        ? projectSource.activeBackendIntegrationId
        : backendIntegrations[0]?.id;
      const assets = normalizeDesignerAssets((projectSource as Partial<DesignerProject>).assets);
      const stateVariables = normalizeStateVariables((projectSource as Partial<DesignerProject>).stateVariables);
      const activeStateVariableId = stateVariables.some((state) => state.id === projectSource.activeStateVariableId)
        ? projectSource.activeStateVariableId
        : stateVariables[0].id;
      const editorState = normalizeProjectEditorState(projectSource.editorState, safeFiles, activeFileId);

      return {
        id: projectSource.id || createId(),
        name: projectSource.name || (projectIndex === 0 ? "Nova 项目" : `项目 ${projectIndex + 1}`),
        description: projectSource.description || "本地 Nova UI 编辑器项目",
        rootPath: projectSource.rootPath,
        assets,
        stateVariables,
        activeStateVariableId,
        rustCommands,
        activeRustCommandId,
        rustLogic: projectSource.rustLogic || createRustLogic(rustCommands, backendIntegrations),
        rustModules,
        activeRustModuleId,
        cargoDependencies,
        activeCargoDependencyId,
        backendIntegrations,
        activeBackendIntegrationId,
        buildLog: projectSource.buildLog,
        lastGeneratedFileSummary: normalizeGeneratedFileChangeSummary(projectSource.lastGeneratedFileSummary),
        rustSourceMap: normalizeGeneratedRustSourceMap(projectSource.rustSourceMap) ?? undefined,
        rustSourceMapPath: typeof projectSource.rustSourceMapPath === "string" ? projectSource.rustSourceMapPath : undefined,
        generatedRustSourceMapPath: typeof projectSource.generatedRustSourceMapPath === "string" ? projectSource.generatedRustSourceMapPath : undefined,
        outputExePath: projectSource.outputExePath,
        outputBundleDir: projectSource.outputBundleDir,
        outputBundlePaths: Array.isArray(projectSource.outputBundlePaths)
          ? projectSource.outputBundlePaths.filter((path): path is string => typeof path === "string")
          : [],
        outputBundleManifestPath: projectSource.outputBundleManifestPath,
        validationLog: projectSource.validationLog,
        validationReportPath: projectSource.validationReportPath,
        validationSnapshotPath: projectSource.validationSnapshotPath,
        validationScreenshotPath: projectSource.validationScreenshotPath,
        validationScreenshotAnalysisPath: projectSource.validationScreenshotAnalysisPath,
        validationRuntimeAuditPath: projectSource.validationRuntimeAuditPath,
        validationBreakpointPath: projectSource.validationBreakpointPath,
        validationBreakpointIssues: normalizeBreakpointValidationIssues(projectSource.validationBreakpointIssues),
        validationHistory: normalizeValidationHistory(projectSource.validationHistory),
        buildHistory: normalizeBuildHistory(projectSource.buildHistory),
        releasePipelineHistory: normalizeReleasePipelineHistory(projectSource.releasePipelineHistory),
        maintenanceHistory: normalizeProjectMaintenanceHistory(projectSource.maintenanceHistory),
        files: safeFiles,
        activeFileId,
        editorState,
        releaseConfig: normalizeReleaseConfig(projectSource.releaseConfig, projectSource.name || `Project ${projectIndex + 1}`),
        createdAt: projectSource.createdAt || now,
        updatedAt: projectSource.updatedAt || now,
      };
    })
    .filter((project): project is DesignerProject => Boolean(project));

  if (projects.length === 0) {
    return null;
  }

  return {
    projects,
    activeProjectId: projects.some((project) => project.id === source.activeProjectId)
      ? source.activeProjectId!
      : projects[0].id,
  };
}

export function loadDesignerWorkspace(): DesignerWorkspace | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(DESIGNER_WORKSPACE_STORAGE_KEY);
    return raw ? normalizeDesignerWorkspace(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function getInitialDesignerWorkspace(): DesignerWorkspace {
  const savedWorkspace = loadDesignerWorkspace();
  if (savedWorkspace) {
    return savedWorkspace;
  }

  const legacyState = loadSavedBuilderState();
  if (legacyState) {
    const project = createProject("迁移的 Nova 项目");
    project.files = [
      {
        ...createBlankFile(legacyState.page.title ? `${legacyState.page.title}.ui` : "主窗口.ui"),
        page: legacyState.page,
        items: legacyState.items,
      },
    ];
    project.activeFileId = project.files[0].id;
    return createWorkspace(project);
  }

  return createWorkspace();
}


export function getCanvasBackgroundStyle(page: PageConfig): CSSProperties {
  if (page.background === "plain") {
    return { backgroundColor: "hsl(var(--surface))" };
  }

  if (page.background === "soft") {
    return {
      background:
        "radial-gradient(circle at 20% 0%, hsl(var(--primary) / 0.08), transparent 30%), hsl(var(--surface))",
    };
  }

  if (!page.showGrid) {
    return { backgroundColor: "hsl(var(--surface))" };
  }

  return {
    backgroundColor: "hsl(var(--surface))",
    backgroundImage:
      "linear-gradient(hsl(var(--outline-variant) / 0.55) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--outline-variant) / 0.55) 1px, transparent 1px)",
    backgroundSize: `${page.gridSize}px ${page.gridSize}px`,
  };
}

export type CanvasRulerMark = {
  value: number;
  position: number;
  major: boolean;
  label?: string;
};

export function createCanvasRulerMarks(length: number, zoom: number, gridSize: number): CanvasRulerMark[] {
  const safeLength = Math.max(0, Math.round(length));
  const safeZoom = clamp(Number(zoom), 0.25, 2);
  const safeGrid = clamp(Math.round(Number(gridSize) || 8), 4, 64);
  let step = safeGrid;

  while (step * safeZoom < 9) {
    step *= 2;
  }
  while (safeLength / step > 180) {
    step *= 2;
  }

  const majorStep = step * 5;
  const marks: CanvasRulerMark[] = [];
  for (let value = 0; value <= safeLength; value += step) {
    const major = value === 0 || value % majorStep === 0;
    marks.push({
      value,
      position: Math.round(value * safeZoom),
      major,
      label: major ? String(value) : undefined,
    });
  }

  if (marks[marks.length - 1]?.value !== safeLength) {
    marks.push({
      value: safeLength,
      position: Math.round(safeLength * safeZoom),
      major: true,
      label: String(safeLength),
    });
  }

  return marks;
}

export function textRangeForLineColumn(value: string, lineNumber = 1, columnNumber = 1) {
  const targetLine = Math.max(1, Math.floor(lineNumber));
  const targetColumn = Math.max(1, Math.floor(columnNumber));
  let line = 1;
  let lineStart = 0;

  while (line < targetLine && lineStart < value.length) {
    const nextLineBreak = value.indexOf("\n", lineStart);
    if (nextLineBreak === -1) {
      lineStart = value.length;
      break;
    }
    lineStart = nextLineBreak + 1;
    line += 1;
  }

  const rawLineEnd = value.indexOf("\n", lineStart);
  const lineEnd = rawLineEnd === -1 ? value.length : rawLineEnd;
  const lineTextEnd = value.slice(lineStart, lineEnd).endsWith("\r") ? lineEnd - 1 : lineEnd;
  const start = Math.min(lineStart + targetColumn - 1, lineTextEnd);
  return {
    start,
    end: Math.max(start + 1, lineTextEnd),
  };
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function rustCommandFunctionExists(rustLogic: string, commandName: string) {
  const pattern = new RegExp(
    `#\\s*\\[\\s*tauri::command\\s*\\]\\s*(?:pub\\s+)?(?:async\\s+)?fn\\s+${escapeRegExp(commandName)}\\s*\\(`,
    "m",
  );
  return pattern.test(rustLogic);
}

export function summarizeReadiness(items: BuildReadinessItem[]): BuildReadinessSummary {
  const readyCount = items.filter((item) => item.severity === "ready").length;
  const warningCount = items.filter((item) => item.severity === "warning").length;
  const errorCount = items.filter((item) => item.severity === "error").length;
  const score = Math.round((readyCount / Math.max(items.length, 1)) * 100);
  return {
    items,
    readyCount,
    warningCount,
    errorCount,
    score,
  };
}

export function buildReadiness(
  project: DesignerProject,
  tauriRuntimeAvailable: boolean,
  backendArtifactInspection?: BackendArtifactInspectionResult | null,
): BuildReadinessSummary {
  const items: BuildReadinessItem[] = [];
  const addItem = (
    severity: BuildReadinessSeverity,
    id: string,
    title: string,
    detail: string,
    fileName?: string,
    target?: Pick<BuildReadinessItem, "fileId" | "itemId" | "itemName">,
  ) => {
    items.push({ severity, id, title, detail, fileName, ...target });
  };
  const projectItems = project.files.flatMap((file) => file.items.map((item) => ({ file, item })));
  const projectPropertyIssues = propertyIssuesForProject(project);
  const propertyErrors = projectPropertyIssues.filter((issue) => issue.severity === "error");
  const propertyWarnings = projectPropertyIssues.filter((issue) => issue.severity === "warning");
  const commandIds = new Set(project.rustCommands.map((command) => command.id));
  const commandById = new Map(project.rustCommands.map((command) => [command.id, command]));
  const stateIds = new Set(project.stateVariables.map((state) => state.id));
  const stateNames = new Set(project.stateVariables.map((state) => state.name));
  const assetIds = new Set(project.assets.map((asset) => asset.id));
  const sanitizedCommandNames = project.rustCommands.map((command) => sanitizeRustCommandName(command.name));
  const duplicateCommandNames = sanitizedCommandNames.filter((name, index) => sanitizedCommandNames.indexOf(name) !== index);
  const missingRustFunctions = sanitizedCommandNames.filter((name) => !rustCommandFunctionExists(project.rustLogic, name));
  const enabledRustModules = project.rustModules.filter((module) => module.enabled);
  const emptyRustModules = enabledRustModules.filter((module) => !module.source.trim());
  const enabledCargoDependencies = project.cargoDependencies.filter((dependency) => dependency.enabled);
  const invalidCargoDependencies = enabledCargoDependencies.filter((dependency) => !dependency.name.trim() || !dependency.version.trim());
  const enabledBackendIntegrations = project.backendIntegrations.filter((integration) => integration.enabled);
  const enabledBackendIntegrationIds = new Set(enabledBackendIntegrations.map((integration) => integration.id));
  const incompleteBackendIntegrations = enabledBackendIntegrations.filter((integration) => {
    if (integration.kind === "rust-native" || integration.kind === "cpp-ffi") {
      return !integration.entryPath.trim();
    }
    return !integration.entryPath.trim() && !integration.command.trim();
  });
  const bundledBackendIntegrations = enabledBackendIntegrations.filter((integration) => integration.bundleResource);
  const incompleteBackendResources = bundledBackendIntegrations.filter(
    (integration) => !integration.artifactPath.trim() || !integration.resourcePath.trim(),
  );
  const backendArtifactInspectionByIntegrationId = new Map(
    (backendArtifactInspection?.entries ?? []).map((entry) => [entry.integration_id, entry]),
  );
  const inspectedMissingBackendArtifacts = bundledBackendIntegrations.filter((integration) => {
    const entry = backendArtifactInspectionByIntegrationId.get(integration.id);
    return entry?.status === "missing" || entry?.status === "not-configured";
  });
  const inspectedReadyBackendArtifacts = bundledBackendIntegrations.filter(
    (integration) => backendArtifactInspectionByIntegrationId.get(integration.id)?.status === "ready",
  );
  const probeableBackendIntegrations = enabledBackendIntegrations.filter(
    (integration) => integration.kind === "sidecar" || integration.kind === "local-service",
  );
  const missingBackendHealthChecks = probeableBackendIntegrations.filter((integration) => !integration.healthCheckCommand.trim());
  const starterBackendIntegrations = enabledBackendIntegrations.filter((integration) => backendIntegrationStarterHint(integration));
  const starterBackendsNeedingBuildAttention = starterBackendIntegrations.filter(
    (integration) => {
      const artifactInspection = backendArtifactInspectionByIntegrationId.get(integration.id);
      const artifactReady = !integration.bundleResource || artifactInspection?.status === "ready";
      const methodPassed = integration.methods.some((method) => method.lastTest?.status === "passed");
      return !artifactReady || !methodPassed;
    },
  );
  const invalidBackendCommands = project.rustCommands.filter(
    (command) => command.backendIntegrationId && !enabledBackendIntegrationIds.has(command.backendIntegrationId),
  );
  const backendMethodIdsByIntegration = new Map(
    enabledBackendIntegrations.map((integration) => [integration.id, new Set(integration.methods.map((method) => method.id))]),
  );
  const invalidBackendMethodCommands = project.rustCommands.filter((command) => {
    if (!command.backendIntegrationId || !command.backendIntegrationMethodId) {
      return false;
    }
    return !backendMethodIdsByIntegration.get(command.backendIntegrationId)?.has(command.backendIntegrationMethodId);
  });
  const invalidBackendMethodContracts = enabledBackendIntegrations.flatMap((integration) =>
    integration.methods.flatMap((method) =>
      (() => {
        const payloadResult = parseJsonEditorValue(method.samplePayload, `${integration.name}/${method.name} 示例载荷`);
        const requestSchemaResult = parseJsonEditorValue(method.requestSchema, `${integration.name}/${method.name} 请求 schema`);
        const responseSchemaResult = parseJsonEditorValue(method.responseSchema, `${integration.name}/${method.name} 响应 schema`);
        const requestIssues =
          !payloadResult.error && !requestSchemaResult.error
            ? validateBackendSchemaValue(payloadResult.value, requestSchemaResult.value, `${integration.name}/${method.name} 示例载荷`)
            : [];
        return [payloadResult.error, requestSchemaResult.error, responseSchemaResult.error, ...requestIssues]
          .filter(Boolean)
          .map((error) => ({ integration, method, error: String(error) }));
      })(),
    ),
  );
  const backendMethodsNeedingPassingTest = enabledBackendIntegrations.flatMap((integration) =>
    integration.methods.filter((method) => method.lastTest?.status === "failed" || method.lastTest?.validationIssues?.length),
  );

  addItem(
    project.name.trim() ? "ready" : "error",
    "project-name",
    "项目标识",
    project.name.trim() ? `项目名称会写入 manifest 和生成 app 标题：${project.name}` : "项目名称不能为空。",
  );

  const release = project.releaseConfig ?? defaultReleaseConfig(project.name);
  const releaseVersionValid = /^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/.test(release.version);
  const releaseIdentifierValid = /^[a-z0-9][a-z0-9.-]+\.[a-z0-9.-]+$/i.test(release.bundleIdentifier);
  const releaseWindowValid = release.windowWidth >= 320 && release.windowHeight >= 240 && release.minWindowWidth <= release.windowWidth && release.minWindowHeight <= release.windowHeight;
  const releaseIconAsset = release.iconAssetId ? project.assets.find((asset) => asset.id === release.iconAssetId) : null;
  const releaseIconName = releaseIconAsset ? fileNameFromPath(releaseIconAsset.publicPath || releaseIconAsset.sourcePath || releaseIconAsset.name) : "";
  const releaseIconExtension = releaseIconName.split(".").pop()?.toLowerCase() ?? "";
  addItem(
    release.appName.trim() && releaseIdentifierValid && releaseVersionValid && releaseWindowValid ? "ready" : "error",
    "release-config",
    "发布配置",
    release.appName.trim() && releaseIdentifierValid && releaseVersionValid && releaseWindowValid
      ? `生成 app：${release.appName} / ${release.bundleIdentifier} / v${release.version} / ${release.windowWidth}x${release.windowHeight} / ${release.bundleTargets}。`
      : "发布配置需要合法 app 名称、bundle identifier、semver 版本号和窗口尺寸。",
  );

  if (release.iconAssetId && !releaseIconAsset) {
    addItem("error", "release-icon", "发布图标", "发布图标引用的项目资源不存在，请重新选择资源。");
  } else if (releaseIconAsset && !["png", "ico", "icns"].includes(releaseIconExtension)) {
    addItem("warning", "release-icon-format", "发布图标", "Tauri 图标建议使用 png、ico 或 icns，当前资源会保留默认图标作为 fallback。");
  } else {
    addItem(
      "ready",
      "release-icon",
      "发布图标",
      releaseIconAsset ? `发布图标会从项目资源复制：${releaseIconAsset.name}。` : "未指定发布图标时使用默认 Nova 图标。",
    );
  }

  const signingConfigured = releaseSigningConfigured(release);
  const signingSeverity: BuildReadinessSeverity =
    release.signingMode === "unsigned" ? "warning" : signingConfigured ? "ready" : "error";
  addItem(
    signingSeverity,
    "release-signing",
    "发布签名",
    releaseSigningDescription(release),
  );

  if (release.signingMode === "windows-certificate" && release.importCertificateBeforeBuild) {
    const certificateImportReady = Boolean(release.certificateSourcePath.trim() && normalizeEnvVarName(release.certificatePasswordEnvVar));
    addItem(
      certificateImportReady ? "ready" : "error",
      "release-certificate-import",
      "证书导入",
      certificateImportReady
        ? `构建前会从 ${fileNameFromPath(release.certificateSourcePath)} 导入证书，密码只读取环境变量 ${release.certificatePasswordEnvVar}。`
        : "构建前导入证书需要 PFX/P12 路径和合法的密码环境变量名；不要把密码写入项目文件。",
    );
  }

  addItem(
    "ready",
    "bundle-smoke-threshold",
    "安装包冒烟阈值",
    `安装包 manifest 会检查每个 artifact 是否存在且不小于 ${normalizeMinimumArtifactSizeKb(release.minimumArtifactSizeKb)} KB。`,
  );

  addItem(
    "ready",
    "installer-smoke-mode",
    "安装器冒烟模式",
    release.installerSmokeMode === "write-script"
      ? "打包后会写出 PowerShell 安装/卸载 smoke 脚本，供发布前在受控环境执行。"
      : "当前只做非侵入式 artifact smoke 检查，不会自动安装或卸载软件。",
  );

  addItem(
    release.installerSmokeRunnerMode === "vm-handoff" && release.installerSmokeMode !== "write-script" ? "warning" : "ready",
    "installer-smoke-runner",
    "安装器冒烟 runner",
    release.installerSmokeRunnerMode === "vm-handoff"
      ? release.installerSmokeMode === "write-script"
        ? `打包后会生成 ${release.installerSmokeVmName || "VM"} smoke handoff JSON，供隔离环境读取安装包和结果路径。`
        : "VM handoff 通常需要同时启用 Write smoke script，当前只会生成 artifact-only 记录。"
      : release.installerSmokeRunnerMode === "manual"
        ? "Smoke 脚本和结果路径会留给测试人员手动执行与回填。"
        : "本机 runner 只执行 artifact-only 检查，不会启动安装器。",
  );

  addItem(
    project.files.length > 0 ? "ready" : "error",
    "ui-files",
    "UI 文件",
    project.files.length > 0 ? `${project.files.length} 个 UI 文件会写入 ui/*.json。` : "项目至少需要一个 UI 文件。",
  );

  addItem(
    projectItems.length > 0 ? "ready" : "warning",
    "canvas-content",
    "画布内容",
    projectItems.length > 0 ? `${projectItems.length} 个控件会进入生成 app。` : "当前画布为空，可以构建，但输出窗口没有可见控件。",
  );

  addItem(
    propertyErrors.length > 0 ? "error" : propertyWarnings.length > 0 ? "warning" : "ready",
    "control-property-schema",
    "控件属性结构",
    projectPropertyIssues.length > 0
      ? `${propertyErrors.length} 个错误、${propertyWarnings.length} 个警告：${projectPropertyIssues[0].itemName} 的 ${projectPropertyIssues[0].label} 需要处理。`
      : `${projectItems.length} 个控件的属性 schema、枚举和范围检查通过。`,
    projectPropertyIssues[0]?.fileName,
    projectPropertyIssues[0]
      ? {
          fileId: projectPropertyIssues[0].fileId,
          itemId: projectPropertyIssues[0].itemId,
          itemName: projectPropertyIssues[0].itemName,
        }
      : undefined,
  );

  addItem(
    project.rootPath?.trim() ? "ready" : "warning",
    "project-root",
    "项目目录",
    project.rootPath?.trim() ? `项目会保存到 ${project.rootPath}` : "未指定项目目录时，Tauri 会保存到默认 Nova projects 目录。",
  );

  addItem(
    tauriRuntimeAvailable ? "ready" : "warning",
    "tauri-runtime",
    "桌面运行",
    tauriRuntimeAvailable ? "当前运行在 Tauri 桌面环境，可写入磁盘并触发构建。" : "当前是浏览器模式，只能保存本地状态；构建 exe 需要桌面 app。",
  );

  addItem(
    project.rustCommands.length > 0 ? "ready" : "error",
    "rust-command-registry",
    "Rust command 注册表",
    project.rustCommands.length > 0 ? `${project.rustCommands.length} 个 command 会注册到生成 app。` : "至少需要一个 Rust command。",
  );

  if (duplicateCommandNames.length > 0) {
    addItem(
      "error",
      "duplicate-rust-command-names",
      "命令名称重复",
      `这些 command 名称生成后重复：${Array.from(new Set(duplicateCommandNames)).join(", ")}。`,
    );
  } else {
    addItem("ready", "unique-rust-command-names", "命令名称", "Rust command 名称可安全注册。");
  }

  if (missingRustFunctions.length > 0) {
    addItem(
      "error",
      "missing-rust-functions",
      "Rust 源码同步",
      `Rust 逻辑缺少同名 #[tauri::command] 函数：${missingRustFunctions.join(", ")}。`,
    );
  } else {
    addItem("ready", "rust-source-sync", "Rust 源码同步", "Rust 逻辑与 command registry 已对齐。");
  }

  addItem(
    emptyRustModules.length > 0 ? "error" : enabledRustModules.length > 0 ? "ready" : "warning",
    "rust-modules",
    "Rust 模块",
    emptyRustModules.length > 0
      ? `这些启用模块没有源码：${emptyRustModules.map((module) => module.name).join(", ")}。`
      : enabledRustModules.length > 0
        ? `${enabledRustModules.length} 个 Rust module 会写入生成 app 的 src-tauri/src/ 并在 lib.rs 中声明。`
        : "当前没有启用的 Rust module；复杂后端逻辑建议拆分到模块文件。",
  );

  addItem(
    invalidCargoDependencies.length > 0 ? "error" : "ready",
    "cargo-dependencies",
    "Cargo 依赖",
    invalidCargoDependencies.length > 0
      ? "启用的 Cargo dependency 需要有效 crate 名称和版本。"
      : enabledCargoDependencies.length > 0
        ? `${enabledCargoDependencies.length} 个项目依赖会追加到生成 app 的 Cargo.toml。`
        : "未启用额外依赖；生成 app 仍包含 Tauri 与 serde_json 基础依赖。",
  );

  addItem(
    incompleteBackendIntegrations.length > 0 ? "warning" : "ready",
    "backend-integrations",
    "后端集成",
    incompleteBackendIntegrations.length > 0
      ? `${incompleteBackendIntegrations.length} 个后端集成缺少入口路径或启动命令；Rust 主后端仍可继续构建。`
      : enabledBackendIntegrations.length > 0
        ? `${enabledBackendIntegrations.length} 个后端集成计划会写入 backend/integrations.json，Rust 仍作为 Tauri 主后端。`
        : "未启用外部后端集成；当前使用 Rust/Tauri 原生后端。",
  );

  addItem(
    incompleteBackendResources.length > 0 ? "warning" : inspectedMissingBackendArtifacts.length > 0 ? "error" : "ready",
    "backend-resource-bundle",
    "后端资源",
    incompleteBackendResources.length > 0
      ? `${incompleteBackendResources.length} 个启用打包的后端集成缺少 artifactPath 或 resourcePath；生成 app 会保留计划，但不会可靠地包含该后端产物。`
      : inspectedMissingBackendArtifacts.length > 0
        ? `${inspectedMissingBackendArtifacts.length} 个后端产物配置了打包但文件不存在：${inspectedMissingBackendArtifacts
            .map((integration) => integration.name)
            .slice(0, 3)
            .join(", ")}。请先运行 starter build 或修正 artifactPath。`
      : bundledBackendIntegrations.length > 0
        ? backendArtifactInspection
          ? `${inspectedReadyBackendArtifacts.length}/${bundledBackendIntegrations.length} 个后端产物已在磁盘检查通过，会复制到 src-tauri/resources/backend 并写入 Tauri bundle resources。`
          : `${bundledBackendIntegrations.length} 个后端产物会复制到 src-tauri/resources/backend；桌面运行时会检查磁盘 artifact 是否存在。`
        : "当前没有外部后端产物需要随安装包打包；Rust 主后端仍可直接构建。",
  );

  addItem(
    starterBackendsNeedingBuildAttention.length > 0 ? "warning" : "ready",
    "backend-starter-artifacts",
    "后端起始产物",
    starterBackendsNeedingBuildAttention.length > 0
      ? `${starterBackendsNeedingBuildAttention.length} 个非 Rust 后端使用生成 starter。请先应用生成文件、运行 starter build、确认 artifactPath 可被打包，并通过 method test；${backendIntegrationStarterHint(starterBackendsNeedingBuildAttention[0])}`
      : starterBackendIntegrations.length > 0
        ? `${starterBackendIntegrations.length} 个非 Rust 后端已有 starter 配置，artifact 与 method test 已满足当前检查。`
        : "当前没有 C++ FFI 或 sidecar/local-service starter 需要构建。Rust 主后端可直接构建。",
  );

  addItem(
    missingBackendHealthChecks.length > 0 ? "warning" : "ready",
    "backend-health-checks",
    "后端健康检查",
    missingBackendHealthChecks.length > 0
      ? `${missingBackendHealthChecks.length} 个 sidecar/local-service 没有 health check 命令；生成 app 会显示 skipped，运行异常需要人工判断。`
      : probeableBackendIntegrations.length > 0
        ? `${probeableBackendIntegrations.length} 个外部后端有 health check，生成 app 启动后会探测状态、超时和输出。`
        : "当前没有需要启动探测的外部后端；Rust/Tauri 主后端直接可用。",
  );

  addItem(
    invalidBackendCommands.length > 0 || invalidBackendMethodCommands.length > 0 ? "warning" : "ready",
    "backend-command-presets",
    "后端命令预设",
    invalidBackendCommands.length > 0
      ? `${invalidBackendCommands.length} 个 Rust command 绑定到不存在或禁用的 backend integration；重新生成或启用对应 integration。`
      : invalidBackendMethodCommands.length > 0
        ? `${invalidBackendMethodCommands.length} 个 Rust command 绑定到不存在的 backend method；请选择有效 method 后重新生成。`
        : "Backend method command preset 可生成可绑定 UI 事件的 Rust command。",
  );

  addItem(
    invalidBackendMethodContracts.length > 0 ? "warning" : "ready",
    "backend-method-contracts",
    "后端方法契约",
    invalidBackendMethodContracts.length > 0
      ? `${invalidBackendMethodContracts.length} 个 backend method sample/schema 不是合法 JSON；先在 Method test bench 修正再发布。`
      : "示例载荷、请求 schema 与响应 schema 均可解析，并通过基础类型校验。",
  );

  addItem(
    backendMethodsNeedingPassingTest.length > 0 ? "warning" : "ready",
    "backend-method-tests",
    "后端方法测试",
    backendMethodsNeedingPassingTest.length > 0
      ? `${backendMethodsNeedingPassingTest.length} 个 backend method 最近一次测试失败或响应不符合 schema。`
      : "Backend method test bench 没有记录失败的 method 调用。",
  );

  const brokenParentItems = projectItems.filter(({ file, item }) => {
    if (!item.parentId) {
      return false;
    }
    const parent = file.items.find((candidate) => candidate.id === item.parentId);
    return !parent || parent.type !== "frame" || parent.id === item.id;
  });
  if (brokenParentItems.length > 0) {
    addItem(
      "error",
      "broken-parent-links",
      "Frame 层级",
      `${brokenParentItems.length} 个控件引用了不存在或无效的父 Frame。`,
      brokenParentItems[0].file.name,
      {
        fileId: brokenParentItems[0].file.id,
        itemId: brokenParentItems[0].item.id,
        itemName: itemVisualName(brokenParentItems[0].item),
      },
    );
  } else {
    addItem("ready", "frame-hierarchy", "Frame 层级", "父子层级可以被保存并生成。");
  }

  const missingAssetItems = projectItems.filter(({ item }) => item.type === "image" && item.props.assetId && !assetIds.has(item.props.assetId));
  const unboundImages = projectItems.filter(({ item }) => item.type === "image" && !item.props.assetId);
  if (missingAssetItems.length > 0) {
    addItem(
      "error",
      "missing-image-assets",
      "图片资源",
      `${missingAssetItems.length} 个 Image 控件绑定了不存在的项目资源。`,
      missingAssetItems[0].file.name,
      {
        fileId: missingAssetItems[0].file.id,
        itemId: missingAssetItems[0].item.id,
        itemName: itemVisualName(missingAssetItems[0].item),
      },
    );
  } else if (unboundImages.length > 0) {
    addItem(
      "warning",
      "unbound-image-assets",
      "图片资源",
      `${unboundImages.length} 个 Image 控件尚未绑定资源，生成窗口会显示占位内容。`,
      unboundImages[0].file.name,
      {
        fileId: unboundImages[0].file.id,
        itemId: unboundImages[0].item.id,
        itemName: itemVisualName(unboundImages[0].item),
      },
    );
  } else {
    addItem("ready", "image-assets", "图片资源", "图片资源绑定可以被复制到生成 app。");
  }

  const brokenStateBindings = projectItems.filter(({ item }) =>
    Object.values(item.props.stateBindings ?? {}).some((stateId) => Boolean(stateId) && !stateIds.has(stateId)),
  );
  const brokenResultStates = projectItems.filter(({ item }) => {
    const eventName = eventNameForItem(item);
    const binding = eventName ? item.props.events?.[eventName] : undefined;
    return Boolean(binding?.resultStateId && !stateIds.has(binding.resultStateId));
  });
  if (brokenStateBindings.length > 0 || brokenResultStates.length > 0) {
    addItem(
      "error",
      "broken-state-links",
      "状态绑定",
      `${brokenStateBindings.length + brokenResultStates.length} 个 state 引用已经断开。`,
      (brokenStateBindings[0] ?? brokenResultStates[0])?.file.name,
      {
        fileId: (brokenStateBindings[0] ?? brokenResultStates[0]).file.id,
        itemId: (brokenStateBindings[0] ?? brokenResultStates[0]).item.id,
        itemName: itemVisualName((brokenStateBindings[0] ?? brokenResultStates[0]).item),
      },
    );
  } else {
    addItem("ready", "state-bindings", "状态绑定", `${project.stateVariables.length} 个共享 state 可用于控件绑定。`);
  }

  const missingEventCommands = projectItems.filter(({ item }) => {
    const eventName = eventNameForItem(item);
    const commandId = eventName ? eventCommandId(item, eventName) : "";
    return Boolean(commandId && !commandIds.has(commandId));
  });
  const eventBindings = projectItems.filter(({ item }) => {
    const eventName = eventNameForItem(item);
    return Boolean(eventName && eventCommandId(item, eventName));
  });
  const unboundButtons = projectItems.filter(({ item }) => item.type === "button" && !eventCommandId(item, "click"));
  if (missingEventCommands.length > 0) {
    addItem(
      "error",
      "missing-event-commands",
      "事件绑定",
      `${missingEventCommands.length} 个控件事件绑定了不存在的 Rust command。`,
      missingEventCommands[0].file.name,
      {
        fileId: missingEventCommands[0].file.id,
        itemId: missingEventCommands[0].item.id,
        itemName: itemVisualName(missingEventCommands[0].item),
      },
    );
  } else if (eventBindings.length === 0) {
    addItem("warning", "no-event-bindings", "事件绑定", "还没有 UI 事件连接 Rust command；生成 app 会偏静态。");
  } else {
    addItem("ready", "event-bindings", "事件绑定", `${eventBindings.length} 个 UI 事件会调用 Rust command。`);
  }

  if (unboundButtons.length > 0) {
    addItem(
      "warning",
      "unbound-buttons",
      "按钮动作",
      `${unboundButtons.length} 个按钮尚未绑定 click command。`,
      unboundButtons[0].file.name,
      {
        fileId: unboundButtons[0].file.id,
        itemId: unboundButtons[0].item.id,
        itemName: itemVisualName(unboundButtons[0].item),
      },
    );
  }

  const brokenResultTargets = projectItems.filter(({ file, item }) => {
    const eventName = eventNameForItem(item);
    const binding = eventName ? item.props.events?.[eventName] : undefined;
    if (!binding?.resultTargetItemId) {
      return false;
    }
    return !file.items.some((candidate) => candidate.id === binding.resultTargetItemId) || !binding.resultTargetProp;
  });
  if (brokenResultTargets.length > 0) {
    addItem(
      "error",
      "broken-result-targets",
      "结果目标",
      `${brokenResultTargets.length} 个 Rust 结果写回目标无效。`,
      brokenResultTargets[0].file.name,
      {
        fileId: brokenResultTargets[0].file.id,
        itemId: brokenResultTargets[0].item.id,
        itemName: itemVisualName(brokenResultTargets[0].item),
      },
    );
  } else {
    addItem("ready", "result-targets", "结果目标", "Rust 返回值写回目标检查通过。");
  }

  const textPatchBindings = eventBindings.filter(({ item }) => {
    const eventName = eventNameForItem(item);
    const binding = eventName ? item.props.events?.[eventName] : undefined;
    const commandId = eventName ? eventCommandId(item, eventName) : "";
    const command = commandId ? commandById.get(commandId) : undefined;
    return Boolean(binding?.applyJsonStatePatch && command && commandResultSchema(command).mode !== "json");
  });
  if (textPatchBindings.length > 0) {
    addItem(
      "warning",
      "text-result-json-patches",
      "JSON 状态补丁",
      `${textPatchBindings.length} 个绑定启用了 JSON patch，但 command schema 仍是 Text result。`,
      textPatchBindings[0].file.name,
      {
        fileId: textPatchBindings[0].file.id,
        itemId: textPatchBindings[0].item.id,
        itemName: itemVisualName(textPatchBindings[0].item),
      },
    );
  }

  const unnamedStateNames = project.stateVariables.filter((state) => !state.name.trim());
  if (unnamedStateNames.length > 0) {
    addItem("error", "empty-state-names", "状态名称", "状态 名称不能为空，否则 JSON patch 无法稳定映射。");
  } else if (stateNames.size !== project.stateVariables.length) {
    addItem("error", "duplicate-state-names", "状态名称", "状态 名称需要唯一。");
  }

  return summarizeReadiness(items);
}

export function itemVisualName(item: BuilderItem) {
  return getItemSummary(item) || item.name || item.type;
}

export function itemBounds(item: BuilderItem, items: BuilderItem[]) {
  const position = getAbsolutePosition(item, items);
  return {
    left: position.x,
    top: position.y,
    right: position.x + item.width,
    bottom: position.y + item.height,
    width: item.width,
    height: item.height,
  };
}

export function relativeItemBounds(item: BuilderItem) {
  return {
    left: item.x,
    top: item.y,
    right: item.x + item.width,
    bottom: item.y + item.height,
    width: item.width,
    height: item.height,
  };
}

export function overlapArea(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

export function visualTextForItem(item: BuilderItem) {
  return [item.props.title, item.props.label, item.props.value, item.props.placeholder, item.props.description, item.props.helper]
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => b.length - a.length)[0] ?? "";
}

export function visualMinimumSize(item: BuilderItem) {
  if (item.type === "button") {
    return { width: 96, height: 36 };
  }
  if (item.type === "input" || item.type === "select") {
    return { width: 160, height: 58 };
  }
  if (item.type === "textarea") {
    return { width: 180, height: 96 };
  }
  if (item.type === "checkbox") {
    return { width: 140, height: 42 };
  }
  if (item.type === "switch") {
    return { width: 180, height: 58 };
  }
  if (item.type === "heading") {
    return { width: 220, height: 88 };
  }
  if (item.type === "image") {
    return { width: 120, height: 100 };
  }
  if (item.type === "table") {
    return { width: 280, height: 160 };
  }
  if (item.type === "frame" || item.type === "card" || item.type === "elevated-card" || item.type === "filled-card" || item.type === "outlined-card") {
    return { width: 180, height: 120 };
  }
  return { width: MIN_ITEM_WIDTH, height: MIN_ITEM_HEIGHT };
}

export function auditAutoLayoutFrame(file: DesignerFile, frame: BuilderItem, items: BuilderItem[], pushIssue: (issue: WindowVisualAuditIssue) => void) {
  const mode = frameLayoutMode(frame);
  if (mode === "free") {
    return;
  }

  const children = getOrderedFrameChildren(frame.id, items);
  if (children.length === 0) {
    return;
  }

  const { gap, padding, columns } = frameLayoutMetrics(frame);
  const availableWidth = Math.max(0, frame.width - padding * 2);
  const availableHeight = Math.max(0, frame.height - padding * 2);
  let requiredWidth = 0;
  let requiredHeight = 0;

  if (mode === "row") {
    requiredWidth = children.reduce((sum, child) => sum + child.width, 0) + gap * Math.max(0, children.length - 1);
    requiredHeight = Math.max(...children.map((child) => child.height));
  } else if (mode === "column") {
    requiredWidth = Math.max(...children.map((child) => child.width));
    requiredHeight = children.reduce((sum, child) => sum + child.height, 0) + gap * Math.max(0, children.length - 1);
  } else {
    const safeColumns = Math.max(1, columns);
    const rows = Math.ceil(children.length / safeColumns);
    requiredWidth = Math.max(...children.map((child) => child.width)) * safeColumns + gap * Math.max(0, safeColumns - 1);
    requiredHeight = Math.max(...children.map((child) => child.height)) * rows + gap * Math.max(0, rows - 1);
  }

  if (requiredWidth > availableWidth || requiredHeight > availableHeight) {
    pushIssue({
      id: `${file.id}-${frame.id}-autolayout-overflow`,
      severity: "warning",
      title: "自动布局容量",
      detail: `${mode} Frame 的子控件需要约 ${Math.round(requiredWidth)} x ${Math.round(requiredHeight)}，可用空间为 ${Math.round(availableWidth)} x ${Math.round(availableHeight)}。`,
      fileId: file.id,
      fileName: file.name,
      itemId: frame.id,
      itemName: itemVisualName(frame),
    });
  }
}

export function auditSiblingOverlaps(file: DesignerFile, parentId: string | undefined, items: BuilderItem[], pushIssue: (issue: WindowVisualAuditIssue) => void) {
  const parent = parentId ? items.find((item) => item.id === parentId) : null;
  if (parent && frameLayoutMode(parent) !== "free") {
    return;
  }

  const siblings = items
    .filter((item) => (item.parentId || undefined) === parentId && item.type !== "divider")
    .sort((a, b) => a.z - b.z);
  for (let outer = 0; outer < siblings.length; outer += 1) {
    for (let inner = outer + 1; inner < siblings.length; inner += 1) {
      const first = siblings[outer];
      const second = siblings[inner];
      const area = overlapArea(relativeItemBounds(first), relativeItemBounds(second));
      const smallerArea = Math.min(first.width * first.height, second.width * second.height);
      if (area > 1200 && area / Math.max(1, smallerArea) > 0.18) {
        pushIssue({
          id: `${file.id}-${first.id}-${second.id}-overlap`,
          severity: "warning",
          title: "控件重叠",
          detail: `${itemVisualName(first)} 与 ${itemVisualName(second)} 在同一层级明显重叠。`,
          fileId: file.id,
          fileName: file.name,
          itemId: first.id,
          itemName: parent ? itemVisualName(parent) : "窗口",
        });
      }
    }
  }
}

export function auditProjectWindows(project: DesignerProject): WindowVisualAuditSummary {
  const issues: WindowVisualAuditIssue[] = [];
  const pushIssue = (issue: WindowVisualAuditIssue) => {
    issues.push(issue);
  };

  for (const file of project.files) {
    const breakpoint = normalizeBreakpoint(file.page.activeBreakpoint);
    const page = getEffectivePage(file.page);
    const items = resolveItemsForBreakpoint(file.items, breakpoint);

    if (page.width < 320 || page.height < 240) {
      pushIssue({
        id: `${file.id}-window-size`,
        severity: "error",
        title: "窗口尺寸",
        detail: `目标窗口只有 ${page.width} x ${page.height}，容易生成不可用窗口。`,
        fileId: file.id,
        fileName: file.name,
      });
    }

    if (items.length === 0) {
      pushIssue({
        id: `${file.id}-empty-window`,
        severity: "warning",
        title: "空窗口",
        detail: "这个 UI 文件没有控件，生成窗口会是空画布。",
        fileId: file.id,
        fileName: file.name,
      });
      continue;
    }

    for (const item of items) {
      const bounds = itemBounds(item, items);
      const visibleWidth = Math.max(0, Math.min(bounds.right, page.width) - Math.max(bounds.left, 0));
      const visibleHeight = Math.max(0, Math.min(bounds.bottom, page.height) - Math.max(bounds.top, 0));
      const visibleRatio = (visibleWidth * visibleHeight) / Math.max(1, item.width * item.height);
      const minimum = visualMinimumSize(item);
      const text = visualTextForItem(item);

      if (visibleRatio <= 0.01) {
        pushIssue({
          id: `${file.id}-${item.id}-offscreen`,
          severity: "error",
          title: "画布外控件",
          detail: "控件完全位于目标窗口外，生成 app 中不可见。",
          fileId: file.id,
          fileName: file.name,
          itemId: item.id,
          itemName: itemVisualName(item),
        });
      } else if (visibleRatio < 0.86) {
        pushIssue({
          id: `${file.id}-${item.id}-clipped`,
          severity: "warning",
          title: "控件被裁切",
          detail: `控件只有约 ${Math.round(visibleRatio * 100)}% 位于目标窗口内。`,
          fileId: file.id,
          fileName: file.name,
          itemId: item.id,
          itemName: itemVisualName(item),
        });
      }

      if (item.width < minimum.width || item.height < minimum.height) {
        pushIssue({
          id: `${file.id}-${item.id}-small-size`,
          severity: "warning",
          title: "控件尺寸过小",
          detail: `${item.type} 当前为 ${Math.round(item.width)} x ${Math.round(item.height)}，建议至少 ${minimum.width} x ${minimum.height}。`,
          fileId: file.id,
          fileName: file.name,
          itemId: item.id,
          itemName: itemVisualName(item),
        });
      }

      if (text && text.length * (item.type === "heading" ? 14 : 7) > Math.max(24, item.width - 28)) {
        pushIssue({
          id: `${file.id}-${item.id}-text-fit`,
          severity: "warning",
          title: "文本适配",
          detail: `文本 "${text.slice(0, 48)}${text.length > 48 ? "..." : ""}" 可能在目标窗口中被截断。`,
          fileId: file.id,
          fileName: file.name,
          itemId: item.id,
          itemName: itemVisualName(item),
        });
      }

      if (item.type === "image" && !item.props.assetId) {
        pushIssue({
          id: `${file.id}-${item.id}-image-placeholder`,
          severity: "warning",
          title: "图片占位",
          detail: "图片控件没有绑定项目资源，目标窗口会显示占位状态。",
          fileId: file.id,
          fileName: file.name,
          itemId: item.id,
          itemName: itemVisualName(item),
        });
      }

      if (item.parentId) {
        const parent = items.find((candidate) => candidate.id === item.parentId);
        if (parent && frameLayoutMode(parent) === "free") {
          const relative = relativeItemBounds(item);
          if (relative.right > parent.width || relative.bottom > parent.height || relative.left < 0 || relative.top < 0) {
            pushIssue({
              id: `${file.id}-${item.id}-frame-clip`,
              severity: "warning",
              title: "容器裁切",
              detail: `${itemVisualName(item)} 超出父 Frame 可见范围。`,
              fileId: file.id,
              fileName: file.name,
              itemId: item.id,
              itemName: itemVisualName(parent),
            });
          }
        }
      }

      if (item.type === "frame") {
        auditAutoLayoutFrame(file, item, items, pushIssue);
      }
    }

    const parentIds = new Set<string | undefined>([undefined, ...items.filter((item) => item.type === "frame").map((item) => item.id)]);
    parentIds.forEach((parentId) => auditSiblingOverlaps(file, parentId, items, pushIssue));
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  const checkedItems = project.files.reduce((sum, file) => sum + file.items.length, 0);
  const score = clamp(Math.round(100 - errorCount * 18 - warningCount * 6), 0, 100);
  return {
    issues,
    checkedFiles: project.files.length,
    checkedItems,
    warningCount,
    errorCount,
    score,
  };
}

export function validationHistoryStatus(audit: WindowVisualAuditSummary): ValidationHistoryEntry["status"] {
  if (audit.errorCount > 0) {
    return "failed";
  }
  return audit.warningCount > 0 ? "warning" : "passed";
}

export function validationTimeLabel(value: string) {
  try {
    const numeric = Number(value);
    const date = Number.isFinite(numeric) && numeric > 0 ? new Date(numeric) : new Date(value);
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return value;
  }
}

export function byteSizeLabel(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size >= 10 || unitIndex === 0 ? Math.round(size) : size.toFixed(1)} ${units[unitIndex]}`;
}

export function projectChangeImpactStatusLabel(status: ProjectChangeImpactStatus) {
  const labels: Record<ProjectChangeImpactStatus, string> = {
    "needs-plan": "需要计划",
    stale: "已过期",
    dirty: "有变更",
    clean: "已同步",
  };
  return labels[status];
}

export function projectChangeImpactStatusVariant(status: ProjectChangeImpactStatus): "default" | "secondary" | "outline" | "destructive" {
  if (status === "dirty") {
    return "secondary";
  }
  if (status === "stale") {
    return "destructive";
  }
  return status === "clean" ? "outline" : "secondary";
}

export function projectChangeScopeStatusVariant(scope: ProjectChangeScope): "default" | "secondary" | "outline" | "destructive" {
  if (scope.status === "dirty") {
    return "secondary";
  }
  if (scope.status === "unknown") {
    return "outline";
  }
  return "outline";
}

/**
 * Scope status is a discriminated value, not copy. Rendering it raw leaked the
 * wire names ("unknown", "dirty", "clean") into the Chinese UI.
 */
export function projectChangeScopeStatusLabel(status: ProjectChangeScope["status"]): string {
  switch (status) {
    case "dirty":
      return "有变更";
    case "clean":
      return "已同步";
    default:
      return "未分析";
  }
}

/**
 * Activity statuses are free-form wire names from the build/run history
 * ("built", "launched", "ready", "saved"). Rendering them raw leaked English
 * into the Chinese UI, and comparing them against the Chinese quiet set never
 * matched — so every routine entry kept its chip.
 */
export function projectActivityStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    built: "已构建",
    launched: "已启动",
    truncated: "已截断",
    ready: "就绪",
    saved: "已保存",
    succeeded: "已完成",
    failed: "失败",
    running: "运行中",
    skipped: "已跳过",
    canceled: "已取消",
  };
  return labels[status] ?? status;
}

export function dependencyGraphEventStatusVariant(status?: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "failed" || status === "canceled") {
    return "destructive";
  }
  if (status === "succeeded") {
    return "secondary";
  }
  return "outline";
}

export function dependencyValidityStatusVariant(status: ProjectDependencyValidityView["validityStatus"]): "default" | "secondary" | "outline" | "destructive" {
  if (status === "failed" || status === "stale") {
    return "destructive";
  }
  if (status === "valid") {
    return "secondary";
  }
  return "outline";
}

export function reverseDependencyStatusVariant(status: ProjectReverseDependencySummary["status"]): "default" | "secondary" | "outline" | "destructive" {
  if (status === "tracked") {
    return "secondary";
  }
  return "outline";
}

export function reverseDependencyStatusLabel(status: ProjectReverseDependencySummary["status"]) {
  if (status === "tracked") {
    return "当前计划";
  }
  if (status === "persisted") {
    return "已保存图谱";
  }
  if (status === "projected") {
    return "推断";
  }
  return "空";
}

export function reverseDependencyTargetKindLabel(kind: ProjectReverseDependencyTarget["kind"]) {
  const labels: Record<ProjectReverseDependencyTarget["kind"], string> = {
    project: "项目",
    "ui-file": "UI 文件",
    control: "控件",
    "generated-runtime": "运行时",
    "rust-command": "Rust 命令",
    "rust-module": "Rust 模块",
    "cargo-dependency": "Cargo 依赖",
    asset: "资源",
    "backend-integration": "后端集成",
    "release-config": "发布配置",
    validation: "验证",
  };
  return labels[kind];
}

export function generatedPreviewEntryNeedsApply(entry: GeneratedFilePreviewEntry) {
  return entry.changed || entry.status === "copy" || entry.status === "create" || entry.status === "update";
}

export function backendArtifactStatusVariant(entry: BackendArtifactInspectionEntry): "default" | "secondary" | "outline" | "destructive" {
  if (entry.status === "ready") {
    return "secondary";
  }
  if (entry.status === "missing" || entry.status === "not-configured") {
    return "destructive";
  }
  return "outline";
}

export function backendArtifactStarterBuildAvailable(integration: BackendIntegration) {
  return integration.enabled && (integration.kind === "cpp-ffi" || integration.language === "go");
}

export function createValidationHistoryEntry(result: ValidationResult, audit: WindowVisualAuditSummary): ValidationHistoryEntry {
  const breakpointIssues = normalizeBreakpointValidationIssues(result.breakpoint_issues);
  const breakpointErrorCount = breakpointIssues.filter((issue) => issue.severity === "error").length;
  const breakpointWarningCount = breakpointIssues.filter((issue) => issue.severity === "warning").length;
  const errorCount = audit.errorCount + breakpointErrorCount;
  const warningCount = audit.warningCount + breakpointWarningCount;
  const status: ValidationHistoryEntry["status"] = errorCount > 0 ? "failed" : warningCount > 0 ? "warning" : "passed";
  const score = clamp(audit.score - breakpointErrorCount * 12 - breakpointWarningCount * 4, 0, 100);
  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    status,
    score,
    errorCount,
    warningCount,
    checkedFiles: audit.checkedFiles,
    checkedItems: audit.checkedItems,
    reportPath: result.report_path,
    snapshotPath: result.snapshot_path,
    screenshotPath: result.screenshot_path ?? undefined,
    screenshotAnalysisPath: result.screenshot_analysis_path ?? undefined,
    runtimeAuditPath: result.runtime_audit_path ?? undefined,
    breakpointValidationPath: result.breakpoint_validation_path ?? undefined,
    summary:
      breakpointIssues.length > 0
        ? `${audit.checkedFiles} 个文件，${audit.checkedItems} 个控件，${breakpointIssues.length} 个运行时问题`
        : `${audit.checkedFiles} 个文件，${audit.checkedItems} 个控件已检查`,
  };
}

export function createBuildHistoryEntry(
  result: BuildResult,
  project: DesignerProject,
  readiness: BuildReadinessSummary,
  audit: WindowVisualAuditSummary,
): BuildHistoryEntry {
  const buildKind: BuildHistoryEntry["buildKind"] = result.build_kind === "bundle" ? "bundle" : "exe";
  const outputExePath = result.paths.output_exe_path ?? undefined;
  const bundlePaths = result.bundle_paths ?? [];
  const bundleDir = result.bundle_dir ?? (bundlePaths[0] ? parentPathFromPath(bundlePaths[0]) : undefined);
  const bundleManifestPath = result.bundle_manifest_path ?? undefined;
  const primaryBundlePath = bundlePaths[0];
  const outputDir = buildKind === "bundle" ? bundleDir || parentPathFromPath(outputExePath || "") || result.paths.generated_app_dir : outputExePath ? parentPathFromPath(outputExePath) : result.paths.generated_app_dir;
  const buildNumber = (project.buildHistory?.length ?? 0) + 1;
  const controlCount = project.files.reduce((total, file) => total + file.items.length, 0);
  const validationStatus = project.validationHistory?.[0]?.status ?? validationHistoryStatus(audit);

  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    status: "success",
    buildKind,
    label: buildKind === "bundle" ? `安装包 ${buildNumber}` : `Build ${buildNumber}`,
    releaseAppName: project.releaseConfig.appName,
    releaseVersion: normalizeReleaseVersion(project.releaseConfig.version),
    releaseBundleTargets: project.releaseConfig.bundleTargets,
    releaseNotes: normalizeReleaseNotes(project.releaseConfig.releaseNotes, project.releaseConfig.version),
    releaseSigningMode: project.releaseConfig.signingMode,
    releaseSigningConfigured: releaseSigningConfigured(project.releaseConfig),
    outputExePath,
    outputDir,
    bundleDir,
    bundlePaths,
    bundleManifestPath,
    bundleSmokeStatus: result.bundle_smoke_status ?? undefined,
    bundleArtifactCount: Math.max(0, Number(result.bundle_artifact_count ?? bundlePaths.length)),
    installerSmokeScriptPath: result.installer_smoke_script_path ?? undefined,
    installerSmokeResultPath: result.installer_smoke_result_path ?? undefined,
    installerSmokeStatus: result.installer_smoke_status ?? undefined,
    installerSmokeSummary: result.installer_smoke_result_summary ?? undefined,
    installerSmokeFinishedAt: result.installer_smoke_finished_at ?? undefined,
    installerSmokeRunnerMode: normalizeReleaseInstallerSmokeRunnerMode(result.installer_smoke_runner_mode ?? project.releaseConfig.installerSmokeRunnerMode),
    installerSmokeVmHandoffPath: result.installer_smoke_vm_handoff_path ?? undefined,
    generatedAppDir: result.paths.generated_app_dir,
    generatedFileSummary: result.generated_files?.summary,
    generatedChangedCount: result.generated_files?.changed_count,
    generatedTotalCount: result.generated_files?.total_count,
    generatedCreatedCount: result.generated_files?.created_count,
    generatedUpdatedCount: result.generated_files?.updated_count,
    generatedUnchangedCount: result.generated_files?.unchanged_count,
    readinessScore: readiness.score,
    readinessErrors: readiness.errorCount,
    readinessWarnings: readiness.warningCount,
    visualScore: audit.score,
    visualErrors: audit.errorCount,
    visualWarnings: audit.warningCount,
    validationStatus,
    fileCount: project.files.length,
    controlCount,
    commandCount: project.rustCommands.length,
    stateCount: project.stateVariables.length,
    assetCount: project.assets.length,
    summary: buildKind === "bundle" && primaryBundlePath
      ? `${project.files.length} 个 UI 文件，${controlCount} 个控件 → ${fileNameFromPath(primaryBundlePath)}`
      : outputExePath
      ? `${project.files.length} 个 UI 文件，${controlCount} 个控件 → ${fileNameFromPath(outputExePath)}`
      : `${project.files.length} 个 UI 文件，${controlCount} 个控件 → 生成应用`,
  };
}

export function releasePipelineTerminalStatus(status: ReleasePipelineStatus) {
  return status === "succeeded" || status === "failed" || status === "skipped" || status === "canceled";
}

export function stableTextHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createReleasePipelineInputSnapshot(project: DesignerProject): ReleasePipelineStepInputSnapshot {
  const activeFile = project.files.find((file) => file.id === project.activeFileId) ?? project.files[0];
  const controlCount = project.files.reduce((total, file) => total + file.items.length, 0);
  return {
    projectId: project.id,
    projectName: project.name,
    rootPath: project.rootPath,
    activeFileId: activeFile?.id,
    activeFileName: activeFile?.name,
    releaseAppName: project.releaseConfig.appName,
    releaseVersion: normalizeReleaseVersion(project.releaseConfig.version),
    fileCount: project.files.length,
    controlCount,
    commandCount: project.rustCommands.length,
    stateCount: project.stateVariables.length,
    assetCount: project.assets.length,
    backendIntegrationCount: project.backendIntegrations.length,
    projectSnapshotHash: stableTextHash(projectSnapshotFingerprint(project)),
  };
}

export function createReleasePipelineEnvironment(): ReleasePipelineStepEnvironment {
  const browserNavigator = typeof navigator === "undefined" ? undefined : navigator;
  const timeZone = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return undefined;
    }
  })();
  return {
    runtime: isTauriRuntime() ? "tauri" : "browser",
    platform: browserNavigator?.platform || "unknown",
    userAgent: browserNavigator?.userAgent,
    language: browserNavigator?.language,
    timeZone,
  };
}

export function createReleasePipelineCommandArgs(task: ProjectTaskEntry): ReleasePipelineStepCommandArgs {
  return {
    actionId: task.actionId,
    title: task.title,
    kind: task.kind,
    attempt: task.attempt,
    pipelineRunId: task.pipelineRunId,
    pipelineStepIndex: task.pipelineStepIndex,
    pipelineStepCount: task.pipelineStepCount,
    backendTaskId: task.backendTaskId,
    artifactPath: task.artifactPath,
    logPath: task.logPath,
  };
}

export function releasePipelineArtifactEvidenceFromInspection(
  result: ReleasePipelineArtifactInspectionResult,
): ReleasePipelineStepArtifactEvidence {
  return {
    path: result.path,
    exists: result.exists,
    isFile: result.is_file,
    isDir: result.is_dir,
    sizeBytes: Math.max(0, Number(result.size_bytes ?? 0)),
    modifiedAt: result.modified_at ?? null,
    sha256: result.sha256 ?? null,
    summary: result.summary,
    checkedAt: new Date().toISOString(),
  };
}

export async function inspectReleasePipelineArtifactEvidence(path?: string): Promise<ReleasePipelineStepArtifactEvidence | undefined> {
  if (!path?.trim() || !isTauriRuntime()) {
    return undefined;
  }
  try {
    const result = await invokeIfAvailable<ReleasePipelineArtifactInspectionResult>("inspect_release_pipeline_artifact", {
      path,
    });
    return result ? releasePipelineArtifactEvidenceFromInspection(result) : undefined;
  } catch (error) {
    return {
      path,
      exists: false,
      isFile: false,
      isDir: false,
      sizeBytes: 0,
      modifiedAt: null,
      sha256: null,
      summary: `产物检查失败： ${String(error)}`,
      checkedAt: new Date().toISOString(),
    };
  }
}

export type ProjectDependencyValidityView = ProjectDependencyGraphValidityEntry & {
  validityStatus: "valid" | "stale" | "needs-plan" | "failed";
  invalidatedByCurrentScopes: string[];
  statusSummary: string;
};

export const dependencyValidityDefinitions: Record<
  string,
  { label: string; scopeIds: string[] }
> = {
  "frontend-check": {
    label: "前端检查",
    scopeIds: ["ui", "frontend", "assets", "validation"],
  },
  "rust-check": {
    label: "Rust 检查",
    scopeIds: ["rust", "backend", "release"],
  },
  "all-check": {
    label: "全部快速检查",
    scopeIds: ["ui", "frontend", "assets", "validation", "rust", "backend", "release"],
  },
  "experience-audit": {
    label: "编辑器体验审计",
    scopeIds: ["project", "ui", "frontend", "validation", "rust", "backend", "release"],
  },
  validation: {
    label: "窗口验证",
    scopeIds: ["ui", "frontend", "assets", "validation"],
  },
  build: {
    label: "Release exe 构建",
    scopeIds: ["project", "ui", "frontend", "assets", "rust", "backend", "release", "validation"],
  },
  bundle: {
    label: "安装器打包",
    scopeIds: ["project", "ui", "frontend", "assets", "rust", "backend", "release", "validation"],
  },
};

export function dependencyValidityKindsForEvent(event: ProjectDependencyGraphEvent) {
  if (event.kind === "validation" || event.actionId === "validate-window") {
    return ["validation"];
  }
  if (event.kind === "build" || event.actionId === "build-exe") {
    return ["build"];
  }
  if (event.kind === "bundle" || event.actionId === "bundle-installer") {
    return ["bundle"];
  }
  if (event.actionId === "quick-check-frontend") {
    return ["frontend-check"];
  }
  if (event.actionId === "quick-check-rust") {
    return ["rust-check"];
  }
  if (event.actionId === "quick-check-all") {
    return ["frontend-check", "rust-check", "all-check"];
  }
  if (event.actionId === "audit-editor-experience") {
    return ["experience-audit"];
  }
  return [];
}

export function intersectsScopeIds(left: string[], right: string[]) {
  return left.some((scope) => right.includes(scope));
}

export function dirtyScopeIdsForImpact(impact: ProjectChangeImpactSummary) {
  return impact.scopes.filter((scope) => scope.status === "dirty").map((scope) => scope.id);
}

export function updateDependencyValidityCache(
  previous: ProjectDependencyGraphRecord | null,
  impact: ProjectChangeImpactSummary,
  event: ProjectDependencyGraphEvent,
  snapshotHash: string,
): ProjectDependencyGraphValidityEntry[] {
  const recordedAt = event.recordedAt;
  const entries = new Map((previous?.validity ?? []).map((entry) => [entry.kind, entry]));
  const eventScopeIds = event.scopeIds?.length ? event.scopeIds : dirtyScopeIdsForImpact(impact);

  if (event.kind === "apply" && eventScopeIds.length > 0) {
    for (const [kind, entry] of entries) {
      if (!intersectsScopeIds(entry.scopeIds, eventScopeIds)) {
        continue;
      }
      entries.set(kind, {
        ...entry,
        invalidatedAt: recordedAt,
        invalidatedBy: event.kind,
        invalidatedScopeIds: eventScopeIds,
      });
    }
  }

  for (const kind of dependencyValidityKindsForEvent(event)) {
    const definition = dependencyValidityDefinitions[kind];
    if (!definition) {
      continue;
    }
    entries.set(kind, {
      id: `validity-${kind}`,
      kind,
      label: definition.label,
      scopeIds: definition.scopeIds,
      snapshotHash,
      resultStatus: event.status ?? "unknown",
      actionId: event.actionId,
      summary: event.summary,
      artifactPath: event.artifactPath,
      logPath: event.logPath,
      recordedAt,
    });
  }

  return Array.from(entries.values()).sort((left, right) => left.label.localeCompare(right.label));
}

export function projectDependencyValidityViews(
  record: ProjectDependencyGraphRecord | null,
  impact: ProjectChangeImpactSummary,
  currentSnapshotHash: string,
): ProjectDependencyValidityView[] {
  if (!record) {
    return [];
  }
  const dirtyScopeIds = dirtyScopeIdsForImpact(impact);
  return record.validity.map((entry): ProjectDependencyValidityView => {
    const invalidatedByCurrentScopes = dirtyScopeIds.filter((scope) => entry.scopeIds.includes(scope));
    const failed = entry.resultStatus === "failed" || entry.resultStatus === "canceled";
    const needsPlan = entry.snapshotHash !== currentSnapshotHash && (impact.status === "needs-plan" || impact.status === "stale");
    const stale = Boolean(entry.invalidatedAt) || invalidatedByCurrentScopes.length > 0;
    const validityStatus: ProjectDependencyValidityView["validityStatus"] = failed
      ? "failed"
      : stale
        ? "stale"
        : needsPlan
          ? "needs-plan"
          : "valid";
    const statusSummary =
      validityStatus === "failed"
        ? `${entry.label} last ${entry.resultStatus}.`
        : validityStatus === "stale"
          ? `${entry.label} 因 ${[...(entry.invalidatedScopeIds ?? []), ...invalidatedByCurrentScopes].filter(Boolean).slice(0, 4).join(", ") || "changed scopes"}.`
          : validityStatus === "needs-plan"
            ? `${entry.label} 需要刷新生成计划，Nova 才能证明它仍然有效。`
            : `${entry.label} 在当前已知范围内有效。`;
    return {
      ...entry,
      validityStatus,
      invalidatedByCurrentScopes,
      statusSummary,
    };
  });
}

export function projectDependencyGraphSourceRefs(record: ProjectDependencyGraphRecord | null): ProjectDependencySourceReference[] {
  if (!record) {
    return [];
  }
  const byId = new Map<string, ProjectDependencySourceReference>();
  for (const scope of record.scopes) {
    for (const source of scope.sourceRefs) {
      const key = `${source.kind}:${source.id}`;
      const existing = byId.get(key);
      byId.set(key, existing ? { ...existing, affectedPaths: Array.from(new Set([...existing.affectedPaths, ...source.affectedPaths])) } : source);
    }
  }
  return Array.from(byId.values()).slice(0, 10);
}

export function createProjectDependencyGraphRecord(
  project: DesignerProject,
  impact: ProjectChangeImpactSummary,
  lastEvent: Omit<ProjectDependencyGraphEvent, "recordedAt"> & { recordedAt?: string },
  previousRecord: ProjectDependencyGraphRecord | null,
): ProjectDependencyGraphRecord {
  const recordedAt = lastEvent.recordedAt ?? new Date().toISOString();
  const event: ProjectDependencyGraphEvent = {
    ...lastEvent,
    recordedAt,
  };
  return {
    id: `dependency-graph-${project.id}`,
    projectId: project.id,
    projectName: project.name,
    rootPath: project.rootPath,
    snapshotHash: impact.currentSnapshotHash,
    previewSnapshotHash: impact.previewSnapshotHash,
    status: impact.status,
    changedCount: impact.changedCount,
    totalCount: impact.totalCount,
    dirtyScopeCount: impact.dirtyScopeCount,
    scopes: impact.scopes.map((scope): ProjectDependencyGraphScope => ({
      id: scope.id,
      label: scope.label,
      status: scope.status,
      changedCount: scope.changedCount,
      totalCount: scope.totalCount,
      paths: scope.paths,
      sourceRefs: scope.sourceRefs,
      summary: scope.summary,
    })),
    executionPlan: {
      id: impact.executionPlan.id,
      title: impact.executionPlan.title,
      detail: impact.executionPlan.detail,
      badge: impact.executionPlan.badge,
      actions: impact.executionPlan.actions,
      scopeIds: impact.executionPlan.scopeIds,
      ready: impact.executionPlan.ready,
    },
    lastEvent: event,
    validity: updateDependencyValidityCache(previousRecord, impact, event, impact.currentSnapshotHash),
    previewRootPath: impact.previewRootPath,
    updatedAt: recordedAt,
    summary: `${impact.summary} 最近事件： ${lastEvent.kind}${lastEvent.status ? ` (${lastEvent.status})` : ""}.`,
  };
}

export function releasePipelineStepFromTask(task: ProjectTaskEntry): ReleasePipelineStep {
  return {
    id: `step-${(task.pipelineStepIndex ?? 0) + 1}`,
    taskId: task.id,
    actionId: task.actionId,
    title: task.title,
    kind: task.kind,
    status: task.status,
    startedAt: task.startedAt,
    finishedAt: task.finishedAt,
    summary: task.summary,
    error: task.error,
    logPreview: task.logPreview,
    artifactPath: task.artifactPath,
    logPath: task.logPath,
    inputSnapshot: task.inputSnapshot,
    environment: task.environment,
    commandArgs: task.commandArgs,
    artifactEvidence: task.artifactEvidence,
  };
}

export function summarizeReleasePipelineEntry(entry: ReleasePipelineEntry, steps: ReleasePipelineStep[]): ReleasePipelineEntry {
  const succeededCount = steps.filter((step) => step.status === "succeeded").length;
  const failedCount = steps.filter((step) => step.status === "failed").length;
  const skippedCount = steps.filter((step) => step.status === "skipped").length;
  const canceledCount = steps.filter((step) => step.status === "canceled").length;
  const runningStep = steps.find((step) => step.status === "running");
  const terminalCount = steps.filter((step) => releasePipelineTerminalStatus(step.status)).length;
  const latestArtifactPath = [...steps].reverse().find((step) => step.artifactPath)?.artifactPath;
  const latestLogPath = [...steps].reverse().find((step) => step.logPath)?.logPath;
  const outputExePath = steps.find((step) => step.actionId === "build-exe" && step.artifactPath)?.artifactPath ?? entry.outputExePath;
  const bundleManifestPath = steps.find((step) => step.actionId === "bundle-installer" && step.artifactPath)?.artifactPath ?? entry.bundleManifestPath;
  const status: ReleasePipelineStatus = runningStep
    ? "running"
    : failedCount > 0
      ? "failed"
      : canceledCount > 0
        ? "canceled"
        : terminalCount === steps.length && skippedCount === steps.length
          ? "skipped"
          : terminalCount === steps.length
            ? "succeeded"
            : "queued";
  const finishedAt = terminalCount === steps.length ? [...steps].reverse().find((step) => step.finishedAt)?.finishedAt ?? new Date().toISOString() : undefined;
  const summary =
    status === "running" && runningStep
      ? `运行中 ${runningStep.title} (${terminalCount}/${steps.length} 已完成）。`
      : status === "failed"
        ? `${failedCount} of ${steps.length} 个步骤失败。`
        : status === "canceled"
          ? `${canceledCount} of ${steps.length} 个步骤已取消。`
          : status === "skipped"
            ? `全部 ${steps.length} 个步骤被跳过。`
            : status === "succeeded"
              ? `已完成 ${succeededCount} 个步骤，跳过 ${skippedCount}.`
              : `已排队 ${steps.length} 个发布流水线步骤。`;

  return {
    ...entry,
    status,
    startedAt: entry.startedAt ?? steps.find((step) => step.startedAt)?.startedAt,
    finishedAt,
    stepCount: steps.length,
    succeededCount,
    failedCount,
    skippedCount,
    canceledCount,
    artifactPath: latestArtifactPath ?? entry.artifactPath,
    logPath: latestLogPath ?? entry.logPath,
    outputExePath,
    bundleManifestPath,
    summary,
    steps,
  };
}

export function createReleasePipelineEntry(
  preset: ProjectActionPresetDefinition,
  tasks: ProjectTaskEntry[],
  project: DesignerProject,
): ReleasePipelineEntry {
  const steps = tasks.map(releasePipelineStepFromTask);
  return summarizeReleasePipelineEntry(
    {
      id: tasks[0]?.pipelineRunId ?? createId(),
      presetId: preset.id,
      presetTitle: preset.title,
      presetBadge: preset.badge,
      createdAt: new Date().toISOString(),
      status: "queued",
      stepCount: steps.length,
      succeededCount: 0,
      failedCount: 0,
      skippedCount: 0,
      canceledCount: 0,
      releaseAppName: project.releaseConfig.appName,
      releaseVersion: normalizeReleaseVersion(project.releaseConfig.version),
      rootPath: project.rootPath,
      summary: `已排队 ${steps.length} 个发布流水线步骤。`,
      steps,
    },
    steps,
  );
}

export function updateReleasePipelineEntryWithTask(entry: ReleasePipelineEntry, task: ProjectTaskEntry): ReleasePipelineEntry {
  const nextStep = releasePipelineStepFromTask(task);
  const stepIndex = Math.max(0, Math.min(task.pipelineStepIndex ?? entry.steps.findIndex((step) => step.taskId === task.id), entry.steps.length - 1));
  const steps = entry.steps.map((step, index) => {
    const taskMatches = step.taskId && step.taskId === task.id;
    const indexMatches = index === stepIndex;
    return taskMatches || indexMatches ? { ...step, ...nextStep, id: step.id || nextStep.id } : step;
  });
  return summarizeReleasePipelineEntry(entry, steps);
}

export function activityTimeValue(value: string) {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function projectActivityTimeline(project: DesignerProject, checkpoints: EditorProjectCheckpoint[]): ProjectActivityEntry[] {
  const activities: ProjectActivityEntry[] = [];

  for (const entry of project.releasePipelineHistory ?? []) {
    activities.push({
      id: `pipeline-${entry.id}`,
      time: entry.finishedAt || entry.startedAt || entry.createdAt,
      kind: "pipeline",
      title: `${entry.presetTitle} pipeline`,
      status: entry.status,
      summary: `${entry.releaseAppName} v${entry.releaseVersion} · ${entry.summary}`,
      path: entry.recordPath || entry.artifactPath,
      secondaryPath: entry.artifactPath || entry.logPath || entry.outputExePath || entry.bundleManifestPath,
    });
  }

  for (const entry of project.buildHistory ?? []) {
    const primaryPath = entry.buildKind === "bundle" ? entry.bundlePaths?.[0] : entry.outputExePath;
    activities.push({
      id: `build-${entry.id}`,
      time: entry.createdAt,
      kind: entry.buildKind === "bundle" ? "bundle" : "build",
      title: entry.buildKind === "bundle" ? "安装包构建" : "可执行文件构建",
      status: entry.buildKind === "bundle" ? entry.bundleSmokeStatus ?? "built" : "built",
      summary: `${entry.releaseAppName} v${entry.releaseVersion} · ${entry.summary}`,
      path: primaryPath,
      secondaryPath: entry.bundleManifestPath || entry.outputDir,
    });

    if (entry.launchedPid) {
      activities.push({
        id: `run-${entry.id}-${entry.launchedAt ?? entry.createdAt}`,
        time: entry.runCheckedAt || entry.launchedAt || entry.createdAt,
        kind: "run",
        title: "运行会话",
        status: entry.runStatus ?? "launched",
        summary: entry.runSummary || entry.launchSummary || `pid ${entry.launchedPid}`,
        path: entry.outputExePath,
      });
    }

    if (entry.runtimeLogPath) {
      activities.push({
        id: `runtime-log-${entry.id}`,
        time: entry.runtimeLogUpdatedAt || entry.runCheckedAt || entry.launchedAt || entry.createdAt,
        kind: "runtime-log",
        title: "运行时控制台",
        status: entry.runtimeLogTruncated ? "truncated" : "ready",
        summary: entry.runtimeLogSizeBytes ? `已捕获 ${entry.runtimeLogSizeBytes} 字节` : "已捕获运行时日志",
        path: entry.runtimeLogPath,
      });
    }

    if (entry.installerSmokeStatus) {
      activities.push({
        id: `smoke-${entry.id}-${entry.installerSmokeFinishedAt ?? entry.createdAt}`,
        time: entry.installerSmokeFinishedAt || entry.createdAt,
        kind: "smoke",
        title: "安装器冒烟",
        status: entry.installerSmokeStatus,
        summary: entry.installerSmokeSummary || `${entry.installerSmokeRunnerMode ?? "installer"} smoke ${entry.installerSmokeStatus}`,
        path: entry.installerSmokeResultPath,
        secondaryPath: entry.installerSmokeScriptPath || entry.installerSmokeVmHandoffPath,
      });
    }
  }

  for (const entry of project.validationHistory ?? []) {
    activities.push({
      id: `validation-${entry.id}`,
      time: entry.createdAt,
      kind: "validation",
      title: "窗口验证",
      status: entry.status,
      summary: `${entry.score}% · ${entry.summary}`,
      path: entry.reportPath,
      secondaryPath: entry.screenshotPath || entry.runtimeAuditPath || entry.breakpointValidationPath,
    });
  }

  for (const entry of project.maintenanceHistory ?? []) {
    activities.push({
      id: `maintenance-${entry.id}`,
      time: entry.createdAt,
      kind: "maintenance",
      title: entry.title,
      status: entry.status,
      summary: `${entry.propertyCount} 个属性 · ${entry.itemCount} 个控件 · ${entry.manualIssueCount} 个需手动处理`,
    });
  }

  for (const checkpoint of checkpoints) {
    activities.push({
      id: `checkpoint-${checkpoint.id}`,
      time: checkpoint.created_at,
      kind: "checkpoint",
      title: "磁盘检查点",
      status: "saved",
      summary: `${checkpoint.label} · ${checkpoint.file_count} 个 UI · ${checkpoint.command_count} 个命令`,
      path: checkpoint.path,
    });
  }

  return activities
    .filter((activity) => activity.time)
    .sort((a, b) => activityTimeValue(b.time) - activityTimeValue(a.time))
    .slice(0, 24);
}

export function releaseReadinessDashboard(
  project: DesignerProject,
  readiness: BuildReadinessSummary,
  visualAudit: WindowVisualAuditSummary,
  latestBuild: BuildHistoryEntry | null,
  latestRun: BuildHistoryEntry | null,
  checkpointCount: number,
  activityCount: number,
): ReleaseReadinessSummary {
  const items: ReleaseReadinessItem[] = [];
  const addItem = (severity: BuildReadinessSeverity, id: string, title: string, detail: string, score: number) => {
    items.push({ severity, id, title, detail, score: clamp(Math.round(score), 0, 100) });
  };
  const latestValidation = project.validationHistory?.[0] ?? null;
  const latestBundle = (project.buildHistory ?? []).find((entry) => entry.buildKind === "bundle") ?? null;
  const signingReady = releaseSigningConfigured(project.releaseConfig);
  const smokeStatus = latestBundle?.installerSmokeStatus ?? latestBundle?.bundleSmokeStatus;

  addItem(
    readiness.errorCount > 0 ? "error" : readiness.warningCount > 0 ? "warning" : "ready",
    "preflight",
    "构建预检",
    readiness.errorCount > 0
      ? `编译前必须修复 ${readiness.errorCount} 个阻塞问题。`
      : readiness.warningCount > 0
        ? `发布前仍有 ${readiness.warningCount} 个警告。`
        : "项目结构、Rust 命令、资源和发布配置已就绪。",
    readiness.score,
  );

  addItem(
    visualAudit.errorCount > 0 ? "error" : visualAudit.warningCount > 0 ? "warning" : "ready",
    "visual",
    "窗口视觉审查",
    visualAudit.errorCount > 0
      ? `发现 ${visualAudit.errorCount} 个视觉阻塞问题。`
      : visualAudit.warningCount > 0
        ? `建议检查 ${visualAudit.warningCount} 个视觉警告。`
        : "目标窗口没有明显裁切、重叠或尺寸问题。",
    visualAudit.score,
  );

  addItem(
    !latestValidation ? "warning" : latestValidation.status === "failed" ? "error" : latestValidation.status === "warning" ? "warning" : "ready",
    "validation",
    "生成窗口验证",
    !latestValidation
      ? "打包发布前请运行生成窗口验证。"
      : `${latestValidation.status} · ${latestValidation.summary}`,
    latestValidation ? latestValidation.score : 45,
  );

  addItem(
    !latestBuild ? "warning" : latestBuild.readinessErrors > 0 ? "error" : latestBuild.readinessWarnings > 0 ? "warning" : "ready",
    "artifact",
    "构建产物",
    !latestBuild
      ? "还没有记录成功的 exe 或安装包构建。"
      : `${latestBuild.label} · ${latestBuild.releaseAppName} v${latestBuild.releaseVersion}`,
    latestBuild ? Math.min(latestBuild.readinessScore, latestBuild.visualScore) : 35,
  );

  addItem(
    project.releaseConfig.signingMode === "unsigned" ? "warning" : signingReady ? "ready" : "error",
    "signing",
    "发布签名",
    releaseSigningDescription(project.releaseConfig),
    project.releaseConfig.signingMode === "unsigned" ? 65 : signingReady ? 100 : 10,
  );

  addItem(
    !latestBundle
      ? "warning"
      : smokeStatus === "failed"
        ? "error"
        : smokeStatus === "pending" || smokeStatus === "not-requested"
          ? "warning"
          : "ready",
    "smoke",
    "安装包和冒烟证据",
    !latestBundle
      ? "运行完整安装包构建以收集安装器产物和冒烟证据。"
      : `${latestBundle.bundleArtifactCount ?? latestBundle.bundlePaths?.length ?? 0} 个产物 · 冒烟 ${smokeStatus ?? "unknown"}`,
    !latestBundle ? 40 : smokeStatus === "failed" ? 0 : smokeStatus === "pending" || smokeStatus === "not-requested" ? 70 : 100,
  );

  addItem(
    !latestRun ? "warning" : latestRun.runStatus === "stale" || latestRun.runStatus === "unknown" ? "warning" : "ready",
    "runtime",
    "运行时会话",
    !latestRun
      ? "从 Nova 启动一次生成 exe，以验证运行时闭环。"
      : latestRun.runtimeLogPath
        ? `${latestRun.runStatus ?? "launched"} · 已捕获运行时日志`
        : `${latestRun.runStatus ?? "launched"} · 暂无运行时日志摘要`,
    !latestRun ? 45 : latestRun.runtimeLogPath ? 100 : 80,
  );

  addItem(
    checkpointCount > 0 ? "ready" : "warning",
    "checkpoint",
    "恢复检查点",
    checkpointCount > 0 ? `${checkpointCount} 个磁盘检查点可用于回滚。` : "重大发布变更前请创建磁盘检查点。",
    checkpointCount > 0 ? 100 : 65,
  );

  addItem(
    activityCount > 0 ? "ready" : "warning",
    "traceability",
    "项目可追踪性",
    activityCount > 0 ? `已记录 ${activityCount} 条最近活动。` : "运行验证、构建或检查点操作以创建审计轨迹。",
    activityCount > 0 ? 100 : 55,
  );

  const blockers = items.filter((item) => item.severity === "error").length;
  const warnings = items.filter((item) => item.severity === "warning").length;
  const score = Math.round(items.reduce((total, item) => total + item.score, 0) / Math.max(items.length, 1));
  const status: BuildReadinessSeverity = blockers > 0 ? "error" : warnings > 0 ? "warning" : "ready";
  const nextActions = items
    .filter((item) => item.severity !== "ready")
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((item) => `${item.title}: ${item.detail}`);

  return { score, status, blockers, warnings, items, nextActions };
}

export function simulatorStateFromProject(project: DesignerProject) {
  return Object.fromEntries(project.stateVariables.map((state) => [state.id, state.initialValue || ""])) as Record<string, string>;
}

export function countStateVariableReferences(project: DesignerProject, stateId: string) {
  return project.files.reduce(
    (total, file) =>
      total +
      file.items.reduce((itemTotal, item) => {
        const propertyReferences = Object.values(item.props.stateBindings ?? {}).filter((candidate) => candidate === stateId).length;
        const eventReferences = Object.values(item.props.events ?? {}).filter((binding) => binding?.resultStateId === stateId).length;
        return itemTotal + propertyReferences + eventReferences;
      }, 0),
    0,
  );
}

export function formatStateReferenceCount(count: number) {
  return `${count} 处引用`;
}

export function compactJson(value: unknown) {
  if (value === undefined) {
    return "";
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function simulatorStateValuesForArgs(
  project: DesignerProject,
  binding: BuilderEventBinding,
  stateValues: Record<string, string>,
) {
  if (!binding.resultStateId || !project.stateVariables.some((state) => state.id === binding.resultStateId)) {
    return stateValues;
  }
  const nextStateValues = { ...stateValues };
  delete nextStateValues[binding.resultStateId];
  return nextStateValues;
}

export function simulatorRunMessage(commandResponse: string | undefined, eventName: BuilderEventName, commandName: string) {
  const response = commandResponse?.trim() || DEFAULT_RUST_COMMAND_RESPONSE;
  return `${response} 已完成于 ${eventName} -> ${commandName}.`;
}

export function prettyJson(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function parseJsonEditorValue(value: string, label: string): { value: unknown; error?: string } {
  try {
    return { value: value.trim() ? JSON.parse(value) : {} };
  } catch (error) {
    return {
      value: null,
      error: `${label} JSON 不合法： ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function normalizeBackendSchemaType(value: unknown): BackendSchemaFieldType {
  const type = Array.isArray(value) ? value[0] : value;
  if (typeof type !== "string") {
    if (typeof type === "number") {
      return "number";
    }
    if (typeof type === "boolean") {
      return "boolean";
    }
    if (Array.isArray(type)) {
      return "array";
    }
    if (isPlainRecord(type)) {
      return "object";
    }
    return "json";
  }
  const normalized = type.toLowerCase();
  if (["string", "text"].includes(normalized)) {
    return "string";
  }
  if (["number", "float", "integer", "int"].includes(normalized)) {
    return "number";
  }
  if (["boolean", "bool"].includes(normalized)) {
    return "boolean";
  }
  if (normalized === "object") {
    return "object";
  }
  if (normalized === "array") {
    return "array";
  }
  return "json";
}

export function backendSchemaIsJsonSchema(schema: unknown) {
  return isPlainRecord(schema) && (typeof schema.type === "string" || isPlainRecord(schema.properties) || Array.isArray(schema.required));
}

export function backendSchemaIsLegacyPayloadEnvelope(schema: unknown) {
  return (
    isPlainRecord(schema) &&
    Object.keys(schema).length === 1 &&
    normalizeBackendSchemaType(schema.payload) === "object"
  );
}

export function backendSchemaDescription(definition: unknown) {
  return isPlainRecord(definition) && typeof definition.description === "string" ? definition.description : "";
}

export function backendSchemaEnumValues(definition: unknown) {
  if (!isPlainRecord(definition) || !Array.isArray(definition.enum)) {
    return undefined;
  }
  const values = definition.enum
    .map((value) => (typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : ""))
    .filter(Boolean);
  return values.length ? values : undefined;
}

export function backendSchemaDefaultValue(type: BackendSchemaFieldType, definition?: unknown): unknown {
  if (isPlainRecord(definition) && Object.prototype.hasOwnProperty.call(definition, "default")) {
    return definition.default;
  }
  const enumValues = backendSchemaEnumValues(definition);
  if (enumValues?.length) {
    return enumValues[0];
  }
  if (isPlainRecord(definition) && Object.prototype.hasOwnProperty.call(definition, "example")) {
    return definition.example;
  }
  if (type === "object" && isPlainRecord(definition) && isPlainRecord(definition.properties)) {
    return Object.fromEntries(
      Object.entries(definition.properties).map(([name, childDefinition]) => {
        const childType = normalizeBackendSchemaType(isPlainRecord(childDefinition) ? childDefinition.type ?? childDefinition : childDefinition);
        return [name, backendSchemaDefaultValue(childType, childDefinition)];
      }),
    );
  }
  if (type === "number") {
    return 0;
  }
  if (type === "boolean") {
    return false;
  }
  if (type === "object") {
    return {};
  }
  if (type === "array") {
    return [];
  }
  if (type === "json") {
    return null;
  }
  return "";
}

export function backendFieldInputValue(value: unknown, type: BackendSchemaFieldType) {
  if (value === undefined) {
    return "";
  }
  if (type === "object" || type === "array" || type === "json") {
    return prettyJson(value);
  }
  return String(value);
}

export function parseBackendFieldInput(type: BackendSchemaFieldType, raw: string): unknown {
  if (type === "number") {
    const value = Number(raw);
    return Number.isFinite(value) ? value : raw;
  }
  if (type === "boolean") {
    return raw === "true";
  }
  if (type === "object" || type === "array" || type === "json") {
    try {
      return raw.trim() ? JSON.parse(raw) : backendSchemaDefaultValue(type);
    } catch {
      return raw;
    }
  }
  return raw;
}

export function valueAtPath(value: unknown, path: string[]) {
  return path.reduce<unknown>((current, segment) => {
    if (!isPlainRecord(current)) {
      return undefined;
    }
    return current[segment];
  }, value);
}

export function hasValueAtPath(value: unknown, path: string[]) {
  let current = value;
  for (const segment of path) {
    if (!isPlainRecord(current) || !Object.prototype.hasOwnProperty.call(current, segment)) {
      return false;
    }
    current = current[segment];
  }
  return true;
}

export function setValueAtPath(value: Record<string, unknown>, path: string[], nextValue: unknown) {
  const clone: Record<string, unknown> = { ...value };
  let cursor = clone;
  path.forEach((segment, index) => {
    if (index === path.length - 1) {
      cursor[segment] = nextValue;
      return;
    }
    const child = cursor[segment];
    const nextChild = isPlainRecord(child) ? { ...child } : {};
    cursor[segment] = nextChild;
    cursor = nextChild;
  });
  return clone;
}

export function backendFieldFromSchema(
  path: string[],
  definition: unknown,
  sample: unknown,
  required: boolean,
  depth: number,
): BackendSchemaField[] {
  const definitionObject = isPlainRecord(definition) ? definition : {};
  const type = normalizeBackendSchemaType(definitionObject.type ?? definition);
  const nestedProperties = isPlainRecord(definitionObject.properties) ? definitionObject.properties : null;
  const nestedRequired = new Set(
    Array.isArray(definitionObject.required) ? definitionObject.required.filter((name): name is string => typeof name === "string") : [],
  );
  if (type === "object" && nestedProperties && depth < 2) {
    const sampleObject = isPlainRecord(sample) ? sample : {};
    return Object.entries(nestedProperties).flatMap(([name, childDefinition]) =>
      backendFieldFromSchema(
        [...path, name],
        childDefinition,
        Object.prototype.hasOwnProperty.call(sampleObject, name) ? sampleObject[name] : undefined,
        nestedRequired.has(name),
        depth + 1,
      ),
    );
  }
  const value = sample !== undefined ? sample : backendSchemaDefaultValue(type, definition);
  return [
    {
      name: path.join("."),
      path,
      type,
      required,
      description: backendSchemaDescription(definition),
      inputValue: backendFieldInputValue(value, type),
      source: "schema",
      enumValues: backendSchemaEnumValues(definition),
      depth,
    },
  ];
}

export function backendSchemaFieldsFromValues(schema: unknown, sample: unknown): BackendSchemaField[] {
  const sampleObject = isPlainRecord(sample) ? sample : {};
  if (backendSchemaIsLegacyPayloadEnvelope(schema)) {
    return Object.entries(sampleObject).map(([name, value]) => ({
      name,
      path: [name],
      type: normalizeBackendSchemaType(value),
      required: false,
      description: "",
      inputValue: backendFieldInputValue(value, normalizeBackendSchemaType(value)),
      source: "sample",
      depth: 0,
    }));
  }
  if (backendSchemaIsJsonSchema(schema)) {
    const schemaObject = schema as Record<string, unknown>;
    const required = new Set(Array.isArray(schemaObject.required) ? schemaObject.required.filter((name): name is string => typeof name === "string") : []);
    const properties = isPlainRecord(schemaObject.properties) ? schemaObject.properties : {};
    return Object.entries(properties).flatMap(([name, definition]) =>
      backendFieldFromSchema(
        [name],
        definition,
        Object.prototype.hasOwnProperty.call(sampleObject, name) ? sampleObject[name] : undefined,
        required.has(name),
        0,
      ),
    );
  }
  if (isPlainRecord(schema)) {
    return Object.entries(schema).map(([name, definition]) => {
      const type = normalizeBackendSchemaType(isPlainRecord(definition) ? definition.type ?? definition : definition);
      const value = Object.prototype.hasOwnProperty.call(sampleObject, name)
        ? sampleObject[name]
        : backendSchemaDefaultValue(type, definition);
      return {
        name,
        path: [name],
        type,
        required: true,
        description: backendSchemaDescription(definition),
        inputValue: backendFieldInputValue(value, type),
        source: "schema",
        enumValues: backendSchemaEnumValues(definition),
        depth: 0,
      };
    });
  }
  return Object.entries(sampleObject).map(([name, value]) => {
    const type = normalizeBackendSchemaType(value);
    return {
      name,
      path: [name],
      type,
      required: false,
      description: "",
      inputValue: backendFieldInputValue(value, type),
      source: "sample",
      depth: 0,
    };
  });
}

export function backendSchemaFields(schemaText: string, sampleText: string) {
  const schemaResult = parseJsonEditorValue(schemaText, "请求 schema");
  const sampleResult = parseJsonEditorValue(sampleText, "示例载荷");
  if (schemaResult.error || sampleResult.error) {
    return [];
  }
  return backendSchemaFieldsFromValues(schemaResult.value, sampleResult.value).slice(0, 12);
}

export function samplePayloadFromBackendSchema(schemaText: string, existingSampleText: string) {
  const schemaResult = parseJsonEditorValue(schemaText, "请求 schema");
  const sampleResult = parseJsonEditorValue(existingSampleText, "示例载荷");
  const existingSample = isPlainRecord(sampleResult.value) ? sampleResult.value : {};
  if (schemaResult.error) {
    return existingSampleText;
  }
  const fields = backendSchemaFieldsFromValues(schemaResult.value, existingSample);
  if (fields.length === 0) {
    return existingSampleText;
  }
  const payload = Object.fromEntries(
    Object.entries(existingSample),
  );
  for (const field of fields) {
    const nextValue = hasValueAtPath(payload, field.path)
      ? valueAtPath(payload, field.path)
      : parseBackendFieldInput(field.type, field.inputValue);
    Object.assign(payload, setValueAtPath(payload, field.path, nextValue));
  }
  return prettyJson(payload);
}

export function backendValueMatchesType(value: unknown, type: BackendSchemaFieldType) {
  if (type === "string") {
    return typeof value === "string";
  }
  if (type === "number") {
    return typeof value === "number" && Number.isFinite(value);
  }
  if (type === "boolean") {
    return typeof value === "boolean";
  }
  if (type === "object") {
    return isPlainRecord(value);
  }
  if (type === "array") {
    return Array.isArray(value);
  }
  return true;
}

export function validateBackendJsonSchemaValue(value: unknown, schema: Record<string, unknown>, label: string): string[] {
  const rootType = normalizeBackendSchemaType(schema.type ?? (isPlainRecord(schema.properties) ? "object" : "json"));
  const issues: string[] = [];
  if (!backendValueMatchesType(value, rootType)) {
    issues.push(`${label} 应为 ${rootType}。`);
    return issues;
  }
  const enumValues = backendSchemaEnumValues(schema);
  if (enumValues?.length && !enumValues.includes(String(value))) {
    issues.push(`${label} 应为其中之一：${enumValues.join("、")}。`);
  }
  if (rootType === "array") {
    if (!Array.isArray(value)) {
      return issues;
    }
    const itemSchema = schema.items;
    if (isPlainRecord(itemSchema)) {
      value.slice(0, 5).forEach((item, index) => {
        issues.push(...validateBackendJsonSchemaValue(item, itemSchema, `${label}[${index}]`));
      });
    }
    return issues;
  }
  if (!isPlainRecord(value) || !isPlainRecord(schema.properties)) {
    return issues;
  }
  const required = new Set(Array.isArray(schema.required) ? schema.required.filter((name): name is string => typeof name === "string") : []);
  for (const name of required) {
    if (!Object.prototype.hasOwnProperty.call(value, name)) {
      issues.push(`${label}.${name} 为必填。`);
    }
  }
  for (const [name, definition] of Object.entries(schema.properties)) {
    if (!Object.prototype.hasOwnProperty.call(value, name)) {
      continue;
    }
    if (isPlainRecord(definition)) {
      issues.push(...validateBackendJsonSchemaValue(value[name], definition, `${label}.${name}`));
      continue;
    }
    const type = normalizeBackendSchemaType(definition);
    if (!backendValueMatchesType(value[name], type)) {
      issues.push(`${label}.${name} 应为 ${type}。`);
    }
  }
  return issues;
}

export function validateBackendSchemaValue(value: unknown, schema: unknown, label: string): string[] {
  if (backendSchemaIsLegacyPayloadEnvelope(schema)) {
    return isPlainRecord(value) ? [] : [`${label} 应为对象载荷。`];
  }
  if (backendSchemaIsJsonSchema(schema)) {
    return validateBackendJsonSchemaValue(value, schema as Record<string, unknown>, label);
  }
  if (isPlainRecord(schema)) {
    if (!isPlainRecord(value)) {
      return [`${label} 应为对象。`];
    }
    return Object.entries(schema).flatMap(([name, definition]) => {
      const type = normalizeBackendSchemaType(isPlainRecord(definition) ? definition.type ?? definition : definition);
      if (!Object.prototype.hasOwnProperty.call(value, name)) {
        return [`${label}.${name} 为必填。`];
      }
      return backendValueMatchesType(value[name], type) ? [] : [`${label}.${name} 应为 ${type}。`];
    });
  }
  return [];
}

export function backendSchemaFieldIssues(field: BackendSchemaField, issues: string[]) {
  const label = `示例载荷.${field.name}`;
  return issues.filter((issue) => issue.startsWith(label) || issue.includes(`.${field.name} `));
}

export function backendPayloadFieldsForEvent(fields: BackendSchemaField[], item: BuilderItem): BuilderEventPayloadField[] {
  const selected = new Set<BuilderEventPayloadField>();
  const pathStarts = fields.map((field) => field.path[0]?.toLowerCase()).filter(Boolean);
  const names = new Set(pathStarts);
  const add = (field: BuilderEventPayloadField) => selected.add(field);
  if (names.has("event") || fields.some((field) => field.required)) {
    add("event");
  }
  if (names.has("itemid") || names.has("item_id")) {
    add("itemId");
  }
  if (names.has("itemname") || names.has("item_name")) {
    add("itemName");
  }
  if (names.has("value") || ["input", "textarea", "select", "button"].includes(item.type)) {
    add("value");
  }
  if (names.has("checked") || item.type === "checkbox" || item.type === "switch") {
    add("checked");
  }
  if (names.has("state") || fields.some((field) => field.path[0] === "state" || field.name.startsWith("state."))) {
    add("state");
  }
  if (selected.size === 0) {
    defaultEventPayloadFields.forEach((field) => add(field));
  }
  return Array.from(selected);
}

export function backendResponseSchemaHasPatch(schemaText: string) {
  const result = parseJsonEditorValue(schemaText, "响应 schema");
  if (result.error) {
    return false;
  }
  const schema = result.value;
  if (backendSchemaIsJsonSchema(schema) && isPlainRecord(schema) && isPlainRecord(schema.properties)) {
    return Object.prototype.hasOwnProperty.call(schema.properties, "patch");
  }
  return isPlainRecord(schema) && Object.prototype.hasOwnProperty.call(schema, "patch");
}

export function backendMethodRequestEnvelope(method: BackendIntegrationMethod, payload: unknown) {
  return {
    methodId: method.id,
    method: method.name,
    operation: method.operation,
    path: method.path,
    payload,
  };
}

export function backendMethodLocalValidationRecord(
  integration: BackendIntegration,
  status: BackendMethodTestRecord["status"],
  summary: string,
  request: string,
  response: string,
  error?: string,
  validationIssues?: string[],
): BackendMethodTestRecord {
  return {
    id: createId(),
    testedAt: new Date().toISOString(),
    status,
    summary,
    transport: integration.transport,
    request,
    response,
    error,
    validationIssues,
  };
}

export async function invokeIfAvailable<T>(command: string, args: Record<string, unknown>): Promise<T | null> {
  if (!isTauriRuntime()) {
    return null;
  }

  return invoke<T>(command, args);
}

export function cloneDesignerProject(project: DesignerProject): DesignerProject {
  return JSON.parse(JSON.stringify(project)) as DesignerProject;
}

export function projectSnapshotFingerprint(project: DesignerProject) {
  const snapshot = cloneDesignerProject(project);
  snapshot.updatedAt = "";
  snapshot.files = snapshot.files.map((file) => ({
    ...file,
    updatedAt: "",
  }));
  return JSON.stringify(snapshot);
}

export function formatProjectSnapshotTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "刚刚";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatSignedDelta(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

export function checkpointDiffSummary(diff: EditorProjectCheckpointDiff) {
  const fileChanges = diff.added_files.length + diff.removed_files.length + diff.changed_files.length;
  if (
    fileChanges === 0 &&
    diff.item_delta === 0 &&
    diff.command_delta === 0 &&
    diff.state_delta === 0 &&
    diff.asset_delta === 0 &&
    !diff.metadata_changed &&
    !diff.rust_logic_changed
  ) {
    return "这个检查点与当前项目一致。";
  }

  return `恢复会影响 ${fileChanges} 个 UI 文件，控件 ${formatSignedDelta(diff.item_delta)}，commands ${formatSignedDelta(
    diff.command_delta,
  )}，state ${formatSignedDelta(diff.state_delta)}，assets ${formatSignedDelta(diff.asset_delta)}。`;
}

export function checkpointDiffDetails(diff: EditorProjectCheckpointDiff) {
  const details: string[] = [];
  if (diff.metadata_changed) {
    details.push("项目名称、选中项或项目元数据不同。");
  }
  if (diff.rust_logic_changed) {
    details.push("Rust 逻辑源码不同。");
  }
  if (diff.added_files.length > 0) {
    details.push(`恢复后会新增：${diff.added_files.slice(0, 3).join("、")}${diff.added_files.length > 3 ? "…" : ""}`);
  }
  if (diff.removed_files.length > 0) {
    details.push(`恢复后会移除：${diff.removed_files.slice(0, 3).join("、")}${diff.removed_files.length > 3 ? "…" : ""}`);
  }
  if (diff.changed_files.length > 0) {
    details.push(`内容不同：${diff.changed_files.slice(0, 3).map((file) => file.name).join("、")}${diff.changed_files.length > 3 ? "…" : ""}`);
  }
  return details;
}

export function projectDiskPath(rootPath: string | undefined, ...segments: string[]) {
  const cleanRoot = rootPath?.trim().replace(/[\\/]+$/, "") ?? "";
  const cleanSegments = segments.map((segment) => segment.trim()).filter(Boolean);
  if (!cleanRoot) {
    return "";
  }
  const separator = cleanRoot.includes("\\") ? "\\" : "/";
  return [cleanRoot, ...cleanSegments].join(separator);
}

export function projectRelativePath(...segments: string[]) {
  return segments.map((segment) => segment.trim()).filter(Boolean).join("/");
}

export const projectExplorerFilterOptions: Array<{ id: ProjectExplorerFilterId; label: string; description: string }> = [
  { id: "all", label: "全部", description: "完整项目树" },
  { id: "ui", label: "UI", description: "界面文件和画布" },
  { id: "rust", label: "Rust", description: "命令、模块和依赖" },
  { id: "assets", label: "资源", description: "图片和资源索引" },
  { id: "backend", label: "后端", description: "外部集成和方法" },
  { id: "build", label: "构建", description: "生成 app 和发布证据" },
  { id: "meta", label: ".nova", description: "本地编辑器元数据" },
];

export function projectExplorerNodeMatchesFilter(node: ProjectExplorerNode, filter: ProjectExplorerFilterId) {
  if (filter === "all" || node.id === "root") {
    return true;
  }
  if (filter === "ui") {
    return node.id === "manifest" || node.id === "ui-folder" || node.id.startsWith("ui-");
  }
  if (filter === "rust") {
    return node.id === "rust-folder" || node.id.startsWith("rust-");
  }
  if (filter === "assets") {
    return node.id === "assets-folder" || node.id === "assets-manifest" || node.id.startsWith("asset-") || node.id === "assets-more";
  }
  if (filter === "backend") {
    return node.id === "backend-folder" || node.id.startsWith("backend-");
  }
  if (filter === "build") {
    return node.id === "app-folder" || node.id.startsWith("app-") || ["nova-builds", "nova-runtime", "nova-pipelines", "nova-tasks"].includes(node.id);
  }
  return node.id === "manifest" || node.id === "nova-folder" || node.id.startsWith("nova-");
}

export function projectExplorerNodeMatchesSearch(node: ProjectExplorerNode, query: string) {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) {
    return true;
  }
  const searchable = [
    node.id,
    node.label,
    node.detail,
    node.path,
    node.badge,
    projectExplorerActionLabel(node.action),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return tokens.every((token) => searchable.includes(token));
}

/**
 * Display label for a project-explorer node badge. Badges arrive as wire names
 * ("root" / "manifest" / "dirty") and are also compared against those names for
 * signal decisions, so the translation happens at the render boundary rather
 * than in the model. Unknown values pass through so a new badge stays visible.
 */
export function projectExplorerBadgeLabel(badge: string): string {
  const labels: Record<string, string> = {
    root: "根目录",
    manifest: "清单",
    ignore: "忽略",
    logic: "逻辑",
    generated: "生成",
    bundle: "安装包",
    log: "日志",
    meta: "元数据",
    state: "状态",
    index: "索引",
    dirty: "未保存",
    active: "当前",
    tracked: "已跟踪",
    untracked: "未跟踪",
    local: "本地",
    build: "构建",
    runtime: "运行",
    source: "源码",
  };
  return labels[badge.trim()] ?? badge;
}

export function projectExplorerActionLabel(action: ProjectExplorerNodeAction) {
  switch (action) {
    case "select-file":
      return "UI 文件";
    case "open-logic":
      return "Rust 逻辑";
    case "open-assets":
      return "资源";
    case "open-build":
      return "生成目标";
    case "open-connections":
      return "后端";
    case "open-checkpoints":
      return "版本";
    case "open-settings":
      return "设置";
    case "open-path":
      return "路径";
    default:
      return "目录";
  }
}

export function projectExplorerPrimaryActionLabel(node: ProjectExplorerNode) {
  switch (node.action) {
    case "select-file":
      return "打开 UI";
    case "open-logic":
      return "打开逻辑";
    case "open-assets":
      return "查看资源";
    case "open-build":
      return node.path ? "打开产物" : "打开构建";
    case "open-connections":
      return "打开连接";
    case "open-checkpoints":
      return "查看版本";
    case "open-settings":
      return "打开设置";
    case "open-path":
      return "打开路径";
    default:
      return "定位";
  }
}

export function projectSourceOverviewBadgeVariant(status: ProjectSourceOverviewStatus): "secondary" | "outline" | "accent" | "destructive" {
  if (status === "clean") {
    return "secondary";
  }
  if (status === "generated") {
    return "accent";
  }
  if (status === "dirty") {
    return "destructive";
  }
  return "outline";
}

export function projectActionCenterBadgeVariant(tone: ProjectActionCenterTone): "secondary" | "outline" | "accent" | "destructive" {
  if (tone === "success" || tone === "ready") {
    return "secondary";
  }
  if (tone === "running") {
    return "accent";
  }
  if (tone === "danger") {
    return "destructive";
  }
  return "outline";
}

export function projectActionCenterToneClass(tone: ProjectActionCenterTone) {
  if (tone === "success") {
    return "border-primary/35 bg-secondary-container/70 text-secondary-container-foreground";
  }
  if (tone === "running") {
    return "border-primary/40 bg-primary-container/65 text-primary-container-foreground";
  }
  if (tone === "warning") {
    return "border-outline bg-surface-container-high text-on-surface";
  }
  if (tone === "danger") {
    return "border-destructive/35 bg-destructive/10 text-on-surface";
  }
  if (tone === "muted") {
    return "border-outline-variant bg-surface-container-low text-on-surface-variant";
  }
  return "border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container-high";
}

export function projectExplorerNodeGroupId(node: ProjectExplorerNode): ProjectExplorerGroupId {
  if (node.id === "root" || node.id === "manifest") {
    return "root";
  }
  if (node.id === "ui-folder" || node.id.startsWith("ui-")) {
    return "ui";
  }
  if (node.id === "rust-folder" || node.id.startsWith("rust-")) {
    return "rust";
  }
  if (node.id === "backend-folder" || node.id.startsWith("backend-")) {
    return "backend";
  }
  if (node.id === "assets-folder" || node.id === "assets-manifest" || node.id.startsWith("asset-") || node.id === "assets-more") {
    return "assets";
  }
  if (node.id === "app-folder" || node.id.startsWith("app-")) {
    return "app";
  }
  return "meta";
}

export function projectExplorerGroupFilter(groupId: ProjectExplorerGroupId): ProjectExplorerFilterId {
  if (groupId === "app") {
    return "build";
  }
  if (groupId === "ui" || groupId === "rust" || groupId === "backend" || groupId === "assets" || groupId === "meta") {
    return groupId;
  }
  return "all";
}

export function projectExplorerGroupMeta(groupId: ProjectExplorerGroupId) {
  switch (groupId) {
    case "root":
      return { label: "项目根", detail: "manifest 与项目目录" };
    case "ui":
      return { label: "UI", detail: "窗口文件与画布控件" };
    case "rust":
      return { label: "Rust", detail: "命令、模块与 Cargo" };
    case "backend":
      return { label: "后端", detail: "FFI、sidecar、本地服务" };
    case "assets":
      return { label: "资源", detail: "图片与资源索引" };
    case "app":
      return { label: "生成 app", detail: "Vite、Tauri、release 产物" };
    case "meta":
      return { label: ".nova", detail: "隐藏本地编辑器元数据" };
  }
}

export function withProjectExplorerParentLinks(nodes: ProjectExplorerNode[]) {
  const stack: ProjectExplorerNode[] = [];
  return nodes.map((node) => {
    while (stack.length > node.depth) {
      stack.pop();
    }
    const parent = node.depth > 0 ? stack[node.depth - 1] : undefined;
    const nextNode = { ...node, parentId: node.parentId ?? parent?.id };
    stack[node.depth] = nextNode;
    stack.length = node.depth + 1;
    return nextNode;
  });
}

export function projectExplorerNodeHasChildren(nodes: ProjectExplorerNode[], nodeId: string) {
  return nodes.some((node) => node.parentId === nodeId);
}

export function projectExplorerVisibleWithCollapsedAncestors(
  node: ProjectExplorerNode,
  nodeById: Map<string, ProjectExplorerNode>,
  collapsedNodeIds: Set<string>,
) {
  let parentId = node.parentId;
  while (parentId) {
    if (collapsedNodeIds.has(parentId)) {
      return false;
    }
    parentId = nodeById.get(parentId)?.parentId;
  }
  return true;
}

export type ProjectExplorerNodeStatus = {
  label: string;
  tone: ProjectExplorerStatusTone;
  /**
   * True only when the row needs the user to act. Routine labels ("目录",
   * "文件", ".nova", "产物") restate what the node icon already shows, so a
   * workbench that paints every one of them ends up with a chip wall and no
   * way to spot the rows that are actually wrong.
   */
  signal: boolean;
};

export function projectExplorerNodeStatus(node: ProjectExplorerNode): ProjectExplorerNodeStatus {
  if (node.dirty) {
    return { label: "未保存", tone: "warning", signal: true };
  }
  if (node.active) {
    // Selection is already carried by the row's background and aria-selected;
    // a "当前" chip on top is the same fact told twice. Keep it for the
    // accessibility tree only.
    return { label: "当前", tone: "success", signal: false };
  }
  if (node.badge === "exe" || node.badge === "bundle" || node.badge === "log") {
    return { label: "产物", tone: "success", signal: false };
  }
  if (!node.path && (node.action === "open-path" || node.action === "open-build")) {
    return { label: "待生成", tone: "warning", signal: true };
  }
  if (node.id === "nova-folder" || node.id.startsWith("nova-")) {
    return { label: ".nova", tone: "muted", signal: false };
  }
  if (node.label.endsWith("/")) {
    return { label: "目录", tone: node.muted ? "muted" : "default", signal: false };
  }
  if (node.label.includes(".")) {
    return { label: "文件", tone: node.muted ? "muted" : "default", signal: false };
  }
  return {
    label: projectExplorerActionLabel(node.action),
    tone: node.muted ? "muted" : "default",
    signal: false,
  };
}

export function projectExplorerStatusClass(tone: ProjectExplorerStatusTone) {
  switch (tone) {
    case "success":
      return "border-primary/25 bg-primary/10 text-primary";
    case "warning":
      return "border-destructive/25 bg-destructive/10 text-destructive";
    case "muted":
      return "border-outline-variant bg-surface-container-high text-on-surface-variant";
    default:
      return "border-outline-variant bg-surface-container-low text-on-surface-variant";
  }
}

export function projectExplorerDossierSourceOfTruth(groupId: ProjectExplorerGroupId) {
  switch (groupId) {
    case "ui":
      return "ui/*.ui + nova.project.json";
    case "rust":
      return "rust/logic.rs + Cargo.toml";
    case "backend":
      return "backend/ starter + integrations";
    case "assets":
      return "assets/ + public resource index";
    case "app":
      return "app/ generated runtime";
    case "meta":
      return ".nova/workspace.json + editor-state";
    default:
      return "nova.project.json";
  }
}

export function projectExplorerDossierTasks(groupId: ProjectExplorerGroupId): ProjectJumpActionId[] {
  switch (groupId) {
    case "ui":
      return ["save-project", "generate-file-plan", "validate-window"];
    case "rust":
      return ["sync-rust", "quick-check-rust", "build-backend-artifacts"];
    case "backend":
      return ["build-backend-artifacts", "quick-check-rust"];
    case "assets":
      return ["save-project", "generate-file-plan"];
    case "app":
      return ["generate-file-plan", "apply-generated-changes", "build-exe"];
    case "meta":
      return ["save-project", "audit-editor-experience"];
    default:
      return ["save-project", "generate-file-plan"];
  }
}

export function groupProjectExplorerRows(nodes: ProjectExplorerNode[]): ProjectExplorerRow[] {
  const rows: ProjectExplorerRow[] = [];
  let previousGroupId: ProjectExplorerGroupId | null = null;
  // "meta" is the catch-all group, so a run of it can sit between two named
  // groups and produce the same header twice. One header per contiguous run is
  // what the layout wants; the run index is what makes each header's key unique.
  let runIndex = 0;

  for (const node of nodes) {
    const groupId = projectExplorerNodeGroupId(node);
    if (groupId !== previousGroupId) {
      const groupNodes = nodes.filter((candidate) => projectExplorerNodeGroupId(candidate) === groupId);
      const meta = projectExplorerGroupMeta(groupId);
      rows.push({
        kind: "group",
        id: groupId,
        key: `group-${groupId}-${runIndex}`,
        label: meta.label,
        detail: meta.detail,
        count: groupNodes.length,
      });
      runIndex += 1;
      previousGroupId = groupId;
    }
    rows.push({ kind: "node", node });
  }

  return rows;
}

export function projectUiDiskFileName(file: DesignerFile) {
  return `${file.name.trim() || "Untitled.ui"}.json`;
}

export function buildProjectExplorerModel(
  project: DesignerProject,
  activeFileId: string,
  checkpointCount: number,
  fileSaveStates: Map<string, BuilderFileSaveState> = new Map(),
): ProjectExplorerModel {
  const nodes: ProjectExplorerNode[] = [];
  const rootPath = project.rootPath?.trim() ?? "";
  const controlCount = project.files.reduce((total, file) => total + file.items.length, 0);
  const dirtyUiFileCount = project.files.filter((file) => fileSaveStates.get(file.id)?.dirty).length;
  const enabledBackends = project.backendIntegrations.filter((integration) => integration.enabled).length;
  const enabledModules = project.rustModules.filter((module) => module.enabled).length;
  const enabledDependencies = project.cargoDependencies.filter((dependency) => dependency.enabled).length;
  const metadataPath = projectDiskPath(rootPath, ".nova");
  const latestBuildEntry = (project.buildHistory ?? []).find((entry) => entry.outputExePath || entry.bundleManifestPath || entry.runtimeLogPath) ?? null;
  const latestExePath = project.outputExePath || latestBuildEntry?.outputExePath || "";
  const latestBundleManifestPath = latestBuildEntry?.bundleManifestPath || "";
  const latestRuntimeLogPath = latestBuildEntry?.runtimeLogPath || "";

  const addNode = (node: ProjectExplorerNode) => nodes.push(node);

  addNode({
    id: "root",
    label: project.name || "Nova 项目",
    detail: rootPath || "保存后会写入 Documents/Nova UI Projects",
    icon: FolderOpen,
    depth: 0,
    action: rootPath ? "open-path" : "none",
    path: rootPath,
    badge: "root",
  });
  addNode({
    id: "manifest",
    label: "nova.project.json",
    detail: "项目 manifest：UI、逻辑、资源、发布设置的主索引",
    icon: FileJson,
    depth: 1,
    action: rootPath ? "open-path" : "none",
    path: projectDiskPath(rootPath, "nova.project.json"),
    badge: "manifest",
  });
  addNode({
    id: "gitignore",
    label: ".gitignore",
    detail: "协作忽略规则：保留源码与可复用元数据，排除依赖、构建产物和运行缓存",
    icon: FileJson,
    depth: 1,
    action: rootPath ? "open-path" : "none",
    path: projectDiskPath(rootPath, ".gitignore"),
    badge: "ignore",
    muted: true,
  });

  addNode({
    id: "ui-folder",
    label: "ui/",
    detail: dirtyUiFileCount > 0 ? `${project.files.length} 个 UI 文件，${dirtyUiFileCount} 个未保存，${controlCount} 个控件` : `${project.files.length} 个 UI 文件，${controlCount} 个控件`,
    icon: FolderOpen,
    depth: 1,
    action: rootPath ? "open-path" : "none",
    path: projectDiskPath(rootPath, "ui"),
    badge: dirtyUiFileCount > 0 ? `${dirtyUiFileCount} 个未保存` : `${project.files.length}`,
    dirty: dirtyUiFileCount > 0,
  });
  for (const file of project.files) {
    const saveState = fileSaveStates.get(file.id);
    const fileDirty = Boolean(saveState?.dirty);
    addNode({
      id: `ui-${file.id}`,
      label: file.name,
      detail: `${file.items.length} 控件 · ${file.page.width} x ${file.page.height} · ${fileDirty ? "未保存" : "已同步"}`,
      icon: FileJson,
      depth: 2,
      action: "select-file",
      path: projectDiskPath(rootPath, "ui", projectUiDiskFileName(file)),
      fileId: file.id,
      active: file.id === activeFileId,
      badge: fileDirty ? "dirty" : file.id === activeFileId ? "active" : undefined,
      dirty: fileDirty,
    });
  }

  addNode({
    id: "rust-folder",
    label: "rust/",
    detail: `${project.rustCommands.length} 个命令 · ${enabledModules} 个模块 · ${enabledDependencies} 个依赖`,
    icon: Braces,
    depth: 1,
    action: "open-logic",
    path: projectDiskPath(rootPath, "rust"),
    badge: "logic",
  });
  addNode({
    id: "rust-logic",
    label: "logic.rs",
    detail: "编辑器主 Rust 逻辑源文件",
    icon: Braces,
    depth: 2,
    action: "open-logic",
    path: projectDiskPath(rootPath, "rust", "logic.rs"),
  });
  addNode({
    id: "rust-source-map",
    label: "source-map.json",
    detail: "命令、模块与生成源码定位映射",
    icon: FileJson,
    depth: 2,
    action: rootPath ? "open-path" : "none",
    path: projectDiskPath(rootPath, "rust", "source-map.json"),
    muted: true,
  });
  addNode({
    id: "rust-commands",
    label: "commands.json",
    detail: `${project.rustCommands.length} 个可绑定槽函数`,
    icon: FileJson,
    depth: 2,
    action: "open-logic",
    path: projectDiskPath(rootPath, "rust", "commands.json"),
  });
  addNode({
    id: "rust-dependencies",
    label: "dependencies.json",
    detail: `${project.cargoDependencies.length} 个 Cargo 依赖配置`,
    icon: FileJson,
    depth: 2,
    action: "open-logic",
    path: projectDiskPath(rootPath, "rust", "dependencies.json"),
  });
  for (const module of project.rustModules) {
    addNode({
      id: `rust-module-${module.id}`,
      label: `modules/${module.name}.rs`,
      detail: module.enabled ? "启用的 Rust 模块" : "已禁用的 Rust 模块",
      icon: Braces,
      depth: 2,
      action: "open-logic",
      path: projectDiskPath(rootPath, "rust", "modules", `${module.name}.rs`),
      muted: !module.enabled,
    });
  }

  addNode({
    id: "backend-folder",
    label: "backend/",
    detail: `${project.backendIntegrations.length} 个集成，${enabledBackends} 个启用`,
    icon: Terminal,
    depth: 1,
    action: "open-connections",
    path: projectDiskPath(rootPath, "backend"),
    badge: enabledBackends ? `${enabledBackends}` : undefined,
  });
  addNode({
    id: "backend-integrations",
    label: "integrations.json",
    detail: "FFI、HTTP、本地命令等后端集成定义",
    icon: FileJson,
    depth: 2,
    action: "open-connections",
    path: projectDiskPath(rootPath, "backend", "integrations.json"),
  });
  for (const integration of project.backendIntegrations) {
    addNode({
      id: `backend-${integration.id}`,
      label: integration.name,
      detail: `${integration.language.toUpperCase()} · ${integration.transport} · ${integration.enabled ? "启用" : "禁用"}`,
      icon: Terminal,
      depth: 2,
      action: "open-connections",
      muted: !integration.enabled,
    });
  }

  addNode({
    id: "assets-folder",
    label: "assets/",
    detail: `${project.assets.length} 个资源文件`,
    icon: FileImage,
    depth: 1,
    action: "open-assets",
    path: projectDiskPath(rootPath, "assets"),
    badge: `${project.assets.length}`,
  });
  addNode({
    id: "assets-manifest",
    label: "assets.json",
    detail: "资源索引和导入来源记录",
    icon: FileJson,
    depth: 2,
    action: "open-assets",
    path: projectDiskPath(rootPath, "assets", "assets.json"),
    muted: true,
  });
  for (const asset of project.assets.slice(0, 6)) {
    addNode({
      id: `asset-${asset.id}`,
      label: asset.name,
      detail: asset.publicPath,
      icon: FileImage,
      depth: 2,
      action: "open-assets",
      path: projectDiskPath(rootPath, "assets", asset.name),
    });
  }
  if (project.assets.length > 6) {
    addNode({
      id: "assets-more",
      label: `还有 ${project.assets.length - 6} 个资源`,
      detail: "打开资源面板查看完整列表",
      icon: FileImage,
      depth: 2,
      action: "open-assets",
      muted: true,
    });
  }

  addNode({
    id: "app-folder",
    label: "app/",
    detail: "保存同步后生成的 Vite + React + Tauri 目标工程",
    icon: Download,
    depth: 1,
    action: "open-build",
    path: projectDiskPath(rootPath, "app"),
    badge: "generated",
  });
  addNode({
    id: "app-package",
    label: "package.json",
    detail: "生成目标应用的 npm scripts 与前端依赖",
    icon: FileJson,
    depth: 2,
    action: rootPath ? "open-path" : "none",
    path: projectDiskPath(rootPath, "app", "package.json"),
    muted: true,
  });
  addNode({
    id: "app-src",
    label: "src/",
    detail: "生成前端源码",
    icon: FileJson,
    depth: 2,
    action: "open-build",
    path: projectDiskPath(rootPath, "app", "src"),
  });
  addNode({
    id: "app-tauri",
    label: "src-tauri/",
    detail: "生成桌面壳、Rust commands 和 release 配置",
    icon: Braces,
    depth: 2,
    action: "open-build",
    path: projectDiskPath(rootPath, "app", "src-tauri"),
  });
  addNode({
    id: "app-tauri-conf",
    label: "src-tauri/tauri.conf.json",
    detail: "生成 exe 的窗口、bundle、图标和权限配置",
    icon: FileJson,
    depth: 2,
    action: rootPath ? "open-path" : "none",
    path: projectDiskPath(rootPath, "app", "src-tauri", "tauri.conf.json"),
    muted: true,
  });
  if (latestExePath) {
    addNode({
      id: "app-release-exe",
      label: fileNameFromPath(latestExePath),
      detail: "最新 release exe，可直接从项目树定位运行产物",
      icon: Download,
      depth: 2,
      action: "open-build",
      path: latestExePath,
      badge: "exe",
    });
  }
  if (latestBundleManifestPath) {
    addNode({
      id: "app-bundle-manifest",
      label: fileNameFromPath(latestBundleManifestPath),
      detail: "最新安装包 manifest 和 bundle 产物索引",
      icon: FileJson,
      depth: 2,
      action: "open-build",
      path: latestBundleManifestPath,
      badge: "bundle",
    });
  }
  if (latestRuntimeLogPath) {
    addNode({
      id: "app-runtime-log",
      label: fileNameFromPath(latestRuntimeLogPath),
      detail: "最近一次生成 exe 运行会话日志",
      icon: Terminal,
      depth: 2,
      action: "open-build",
      path: latestRuntimeLogPath,
      badge: "log",
    });
  }

  addNode({
    id: "nova-folder",
    label: ".nova/",
    detail: "隐藏编辑器元数据：工作区索引、打开状态、版本、构建、运行和流水线记录",
    icon: Settings2,
    depth: 1,
    action: rootPath ? "open-path" : "none",
    path: metadataPath,
    badge: "meta",
    muted: true,
  });
  addNode({
    id: "nova-editor-state",
    label: "editor-state.json",
    detail: "类似 .vscode/settings.json 的本地编辑器打开状态和工作区摘要",
    icon: Settings2,
    depth: 2,
    action: rootPath ? "open-path" : "none",
    path: projectDiskPath(rootPath, ".nova", "editor-state.json"),
    badge: "state",
    muted: true,
  });
  addNode({
    id: "nova-workspace",
    label: "workspace.json",
    detail: "项目级本地索引：文件、Rust、资源、后端集成和发布配置摘要",
    icon: FileJson,
    depth: 2,
    action: rootPath ? "open-path" : "none",
    path: projectDiskPath(rootPath, ".nova", "workspace.json"),
    badge: "index",
    muted: true,
  });
  addNode({
    id: "nova-checkpoints",
    label: "checkpoints/",
    detail: `${checkpointCount} 个磁盘检查点`,
    icon: Save,
    depth: 2,
    action: "open-checkpoints",
    path: projectDiskPath(rootPath, ".nova", "checkpoints"),
    badge: `${checkpointCount}`,
    muted: true,
  });
  for (const [id, label, detail] of [
    ["builds", "builds/", "release exe、bundle manifest、安装包 smoke 结果"],
    ["runtime", "runtime/", "exe 运行会话和日志"],
    ["pipelines", "pipelines/", "发布流水线记录"],
    ["tasks", "tasks/", "后台任务注册表"],
    ["applies", "applies/", "生成文件应用前快照"],
    ["dependency-graph", "dependency-graph.json", "项目依赖图和变更影响分析"],
  ] as const) {
    addNode({
      id: `nova-${id}`,
      label,
      detail,
      icon: id === "runtime" || id === "tasks" ? Terminal : FileJson,
      depth: 2,
      action: id === "builds" || id === "runtime" || id === "pipelines" ? "open-build" : rootPath ? "open-path" : "none",
      path: projectDiskPath(rootPath, ".nova", label.replace(/\/$/, "")),
      muted: true,
    });
  }

  return {
    nodes: withProjectExplorerParentLinks(nodes),
    controlCount,
    metadataPath: metadataPath || projectRelativePath(".nova"),
    summary: `${project.files.length} UI · ${controlCount} 控件 · ${project.rustCommands.length} 命令 · ${project.assets.length} 资源`,
  };
}

