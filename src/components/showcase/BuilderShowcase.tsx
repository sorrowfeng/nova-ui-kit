import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type FormEvent as ReactFormEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import {
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Box,
  Braces,
  CheckCircle2,
  ClipboardCopy,
  ClipboardPaste,
  CornerDownRight,
  Copy,
  Download,
  FileJson,
  FileImage,
  FolderOpen,
  Grid3x3,
  Hand,
  Heading1,
  Layers,
  Lock,
  LockOpen,
  Maximize2,
  Monitor,
  MousePointer2,
  Move,
  MoveDown,
  MoveUp,
  PanelTop,
  Pause,
  Plus,
  Play,
  RectangleHorizontal,
  Redo2,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Smartphone,
  Square,
  Table2,
  Terminal,
  TextCursorInput,
  ToggleLeft,
  Trash2,
  Type,
  Undo2,
  Wand2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BuildWorkspace } from "./builder/BuildWorkspace";
import { DesignWorkspace } from "./builder/DesignWorkspace";
import { InspectorDock } from "./builder/InspectorDock";
import { LogicWorkspace } from "./builder/LogicWorkspace";
import { NavigatorDock } from "./builder/NavigatorDock";
import { OutputDock } from "./builder/OutputDock";
import { ProjectDock, type BuilderDockTab } from "./builder/ProjectDock";
import {
  MIN_ITEM_HEIGHT,
  MIN_ITEM_WIDTH,
  applyConstraintsForParentResize,
  clamp,
  collectDescendantIds,
  frameChildrenStyle,
  frameLayoutMetrics,
  frameLayoutMode,
  getAbsolutePosition,
  getItemDepth,
  getOrderedFrameChildren,
  getParentBounds,
  isDescendantOf,
  itemConstraints,
  normalizeItemBounds,
  normalizeItemBoundsInTree,
  numberFromInput,
  parentUsesAutoLayout,
  reorderFrameChildren,
  replaceItemAndApplyResizeConstraints,
  snap,
} from "./builder/layout";
import { normalizeGeneratedFileChangeSummary } from "./builder/build-results";
import {
  createProjectChangeImpact,
  createProjectReverseDependencySummary,
  type ProjectChangeImpactStatus,
  type ProjectChangeImpactSummary,
  type ProjectChangeScope,
  type ProjectReverseDependencySummary,
  type ProjectReverseDependencyTarget,
} from "./builder/change-impact";
import {
  isEditableRustDiagnostic,
  normalizeGeneratedRustSourceMap,
  parseBuildDiagnostics,
  parseRustSourceMapFromLog,
  rustDiagnosticSourceLocation,
} from "./builder/diagnostics";
import {
  createProjectTask,
  filterProjectTasks,
  isProjectJumpActionId,
  loadInitialProjectTaskHistory,
  loadProjectActionPresets,
  loadProjectTaskQueueState,
  projectActionOptionIds,
  projectActionPresets,
  projectTaskDefinitions,
  projectTaskElapsedLabel,
  projectTaskKindFilterOptions,
  projectTaskKindLabel,
  projectTaskLogLines,
  projectTaskLogPreview,
  projectTaskProgress,
  projectTaskStatusFilterOptions,
  projectTaskStatusVariant,
  saveProjectActionPresets,
  saveProjectTaskHistory,
  saveProjectTaskQueueState,
  type ProjectActionPresetDefinition,
  type ProjectJumpActionId,
  type ProjectTaskEntry,
  type ProjectTaskKind,
  type ProjectTaskKindFilter,
  type ProjectTaskLogLine,
  type ProjectTaskRunResult,
  type ProjectTaskStatus,
  type ProjectTaskStatusFilter,
} from "./builder/task-center";
import {
  cloneResponsiveOverrides,
  getEffectivePage,
  normalizeBreakpoint,
  responsiveBreakpointSize,
  resolveItemForBreakpoint,
  resolveItemsForBreakpoint,
  withResponsiveLayoutOverride,
} from "./builder/responsive";
import {
  bumpReleaseVersion,
  defaultReleaseConfig,
  defaultReleaseNotes,
  normalizeEnvVarName,
  normalizeMinimumArtifactSizeKb,
  normalizeReleaseBundleTarget,
  normalizeReleaseConfig,
  normalizeReleaseInstallerSmokeRunnerMode,
  normalizeReleaseNotes,
  normalizeReleaseSigningMode,
  normalizeReleaseVersion,
  releaseBundleTargets,
  releaseDigestAlgorithms,
  releaseInstallerSmokeModes,
  releaseInstallerSmokeRunnerModes,
  releaseSigningConfigured,
  releaseSigningDescription,
  releaseSigningModes,
  type ReleaseVersionBump,
} from "./builder/release";
import {
  activeBackendMethod,
  backendIntegrationKinds,
  backendIntegrationLanguages,
  backendIntegrationStarterHint,
  backendIntegrationTransports,
  createBackendIntegration,
  createBackendIntegrationMethod,
  createCargoDependency,
  createRustModule,
  normalizeBackendIntegrations,
  normalizeCargoDependencies,
  normalizeRustModules,
  recommendedBackendIntegrationPreset,
  sanitizeCargoDependencyName,
  sanitizeRustModuleName,
} from "./builder/backend";
import {
  DEFAULT_RUST_COMMANDS,
  DEFAULT_RUST_COMMAND_RESPONSE,
  DEFAULT_RUST_LOGIC,
  commandResultSchema,
  createBackendIntegrationCommand,
  createDefaultRustCommands,
  createRustCommand,
  createRustCommandParameter,
  createRustLogic,
  defaultJsonResultSchema,
  defaultRustCommandResult,
  normalizeRustCommands,
  rustCommandAcceptsArgs,
  rustCommandParameters,
  rustParameterSources,
  rustParameterTypes,
  sanitizeRustCommandName,
} from "./builder/rust-commands";
import {
  createBlankFile as createTemplateBlankFile,
  createProjectTemplateSeed,
  projectTemplateById,
  projectTemplates,
  type ProjectTemplateDefinition,
  type ProjectTemplateId,
} from "./builder/project-templates";
import {
  defaultEventPayloadFields,
  eventCommandId,
  eventNameForItem,
  eventPayloadFieldSelection,
  eventPayloadFields,
  payloadFieldsWithToggle,
  propsWithEventBindingPatch,
  propsWithoutPayloadForCommand,
} from "./builder/event-bindings";
import {
  resolveSimulatorProps,
  simulatorArgsForEvent,
  simulatorOutcomeFromResult,
  simulatorStateSnapshot,
  simulatorTimeLabel,
  simulatorTraceId,
} from "./builder/simulator";
import { createId } from "./builder/ids";
import type {
  AlignmentMode,
  BackendArtifactBuildResult,
  ApplyGeneratedFilesResult,
  BackendArtifactInspectionEntry,
  BackendArtifactInspectionResult,
  BackendIntegration,
  BackendIntegrationKind,
  BackendIntegrationLanguage,
  BackendIntegrationMethod,
  BackendIntegrationTransport,
  BackendMethodTestRecord,
  BackendMethodTestResult,
  BuildHistoryEntry,
  BuildDiagnostic,
  ButtonVariant,
  BuilderComponentType,
  BuilderDropIntent,
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
  GeneratedFilePreviewResult,
  GeneratedRustSourceMap,
  ReleasePipelineArtifactInspectionResult,
  ReleasePipelineEntry,
  ReleasePipelineRecordWriteResult,
  ReleasePipelineStatus,
  ReleasePipelineStep,
  ReleasePipelineStepArtifactEvidence,
  ReleasePipelineStepCommandArgs,
  ReleasePipelineStepEnvironment,
  ReleasePipelineStepInputSnapshot,
  CanvasBackground,
  CanvasPresetId,
  ControlSize,
  DesignerAsset,
  DesignerFile,
  DesignerProject,
  DesignerWorkspace,
  DragSession,
  EditorProjectPaths,
  EditorProjectCheckpoint,
  EditorProjectCheckpointDiff,
  EditorProjectCheckpointResult,
  EditorBackgroundTaskView,
  CanvasDropIntent,
  FrameDropIntent,
  FrameLayoutMode,
  HistoryEntry,
  ImageFit,
  InstallerSandboxHandoffResult,
  InstallerSmokeResult,
  LaunchExecutableResult,
  ManagedProjectSummary,
  PageConfig,
  ProjectDependencyGraphEvent,
  ProjectDependencyGraphPlan,
  ProjectDependencyGraphReadResult,
  ProjectDependencyGraphRecord,
  ProjectDependencyGraphScope,
  ProjectDependencySourceReference,
  ProjectDependencyGraphValidityEntry,
  ProjectDependencyGraphWriteResult,
  ProjectMaintenanceEntry,
  ProjectReleaseConfig,
  ReleaseBundleTarget,
  ReleaseInstallerSmokeMode,
  ReleaseInstallerSmokeRunnerMode,
  ReleaseSigningMode,
  ResponsiveBreakpointId,
  ResponsiveOverride,
  BuilderResultTargetProp,
  RuntimeLogResult,
  RunSessionResult,
  RustCommand,
  RustModule,
  CargoDependency,
  RustCommandParameter,
  RustCommandParameterSource,
  RustCommandParameterType,
  RustCommandResultSchema,
  SavedBuilderState,
  ValidationHistoryEntry,
  ValidationResult,
  WindowsCertificateInspectionResult,
} from "./builder/types";

type ComponentDefinition = {
  type: BuilderComponentType;
  title: string;
  description: string;
  icon: typeof Layers;
  defaultSize: { width: number; height: number };
  defaultProps: BuilderItemProps;
};

type BackendSchemaFieldType = "string" | "number" | "boolean" | "object" | "array" | "json";

type BackendSchemaField = {
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

type BuilderPropertyKind = "text" | "number" | "boolean" | "select";

type BuilderPropertySchemaField = {
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

type BuilderPropertyIssue = {
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

type BuilderLeftDockTab = "project" | "navigator" | "components" | "assets";
type BuilderRightDockTab = "properties" | "connections" | "responsive" | "impact";
type BuilderBottomDockTab = "issues" | "output" | "tasks" | "logs";

function buildDiagnosticKey(diagnostic: BuildDiagnostic, index: number) {
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

type PalettePointerDrag = {
  type: BuilderComponentType;
  title: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  currentClientX: number;
  currentClientY: number;
  dragging: boolean;
};

const canvasZoomLevels = [0.25, 0.35, 0.5, 0.65, 0.8, 1, 1.25, 1.5, 2] as const;

type BuilderPropertyAutoFixTarget = {
  fileId: string;
  fileName: string;
  itemId: string;
  itemName: string;
  itemType: BuilderComponentType;
  issueCount: number;
  patch: BuilderItemProps;
  propertyCount: number;
};

type BuilderPropertyAutoFixSummary = {
  targets: BuilderPropertyAutoFixTarget[];
  issueCount: number;
  errorCount: number;
  warningCount: number;
  manualIssueCount: number;
  propertyCount: number;
  fileCount: number;
};

type ProjectSnapshotEntry = {
  id: string;
  createdAt: string;
  label: string;
  fingerprint: string;
  project: DesignerProject;
};

type ProjectActivityEntry = {
  id: string;
  time: string;
  kind: "pipeline" | "build" | "bundle" | "validation" | "maintenance" | "run" | "runtime-log" | "smoke" | "checkpoint";
  title: string;
  status: string;
  summary: string;
  path?: string;
  secondaryPath?: string;
};

type ProjectJumpKind =
  | "action"
  | "file"
  | "component"
  | "control"
  | "rust-command"
  | "state"
  | "asset"
  | "artifact"
  | "validation"
  | "pipeline"
  | "maintenance"
  | "settings"
  | "checkpoint";

type ProjectJumpResult = {
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

type EditorWorkflowStep = {
  id: "save" | "generate" | "check" | "validate" | "build";
  title: string;
  detail: string;
  badge: string;
  icon: typeof Save;
  actions: ProjectJumpActionId[];
};

type DestructiveActionRequest = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
};

type SimulatorTraceEntry = {
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

type BuildReadinessSeverity = "ready" | "warning" | "error";

type BuildReadinessItem = {
  id: string;
  severity: BuildReadinessSeverity;
  title: string;
  detail: string;
  fileName?: string;
  fileId?: string;
  itemId?: string;
  itemName?: string;
};

type BuildReadinessSummary = {
  items: BuildReadinessItem[];
  readyCount: number;
  warningCount: number;
  errorCount: number;
  score: number;
};

type ReleaseReadinessItem = {
  id: string;
  severity: BuildReadinessSeverity;
  title: string;
  detail: string;
  score: number;
};

type ReleaseReadinessSummary = {
  score: number;
  status: BuildReadinessSeverity;
  blockers: number;
  warnings: number;
  items: ReleaseReadinessItem[];
  nextActions: string[];
};

type WindowVisualAuditSeverity = "pass" | "warning" | "error";

type WindowVisualAuditIssue = {
  id: string;
  severity: WindowVisualAuditSeverity;
  title: string;
  detail: string;
  fileId: string;
  fileName: string;
  itemId?: string;
  itemName?: string;
};

type WindowVisualAuditSummary = {
  issues: WindowVisualAuditIssue[];
  checkedFiles: number;
  checkedItems: number;
  warningCount: number;
  errorCount: number;
  score: number;
};

const LEGACY_BUILDER_STORAGE_KEY = "nova-ui-kit-builder-freeform-v2";
const DESIGNER_WORKSPACE_STORAGE_KEY = "nova-ui-kit-designer-workspace-v1";
const PROJECT_JUMP_RECENTS_STORAGE_KEY = "nova-ui-kit-project-jump-recents-v1";

const canvasPresets: Array<{ id: CanvasPresetId; title: string; description: string; width: number; height: number; icon: typeof Monitor }> = [
  { id: "desktop", title: "Desktop", description: "1440 x 900", width: 1440, height: 900, icon: Monitor },
  { id: "wide", title: "Wide", description: "1728 x 1024", width: 1728, height: 1024, icon: Monitor },
  { id: "dialog", title: "Dialog", description: "720 x 520", width: 720, height: 520, icon: RectangleHorizontal },
  { id: "tablet", title: "Tablet", description: "1024 x 768", width: 1024, height: 768, icon: RectangleHorizontal },
  { id: "mobile", title: "Mobile", description: "390 x 844", width: 390, height: 844, icon: Smartphone },
];

const responsiveBreakpoints: Array<{ id: ResponsiveBreakpointId; title: string; width: number; height: number; icon: typeof Monitor }> = [
  { id: "desktop", title: "Desktop", width: 1440, height: 900, icon: Monitor },
  { id: "tablet", title: "Tablet", width: 1024, height: 768, icon: RectangleHorizontal },
  { id: "mobile", title: "Mobile", width: 390, height: 844, icon: Smartphone },
];

const eventResultTargetProps: Array<{ value: BuilderResultTargetProp; label: string }> = [
  { value: "value", label: "Value" },
  { value: "label", label: "Label" },
  { value: "title", label: "Title" },
  { value: "description", label: "Description" },
  { value: "helper", label: "Helper" },
];

const buttonVariantValues = ["default", "secondary", "outline", "ghost", "destructive"] as const satisfies readonly ButtonVariant[];
const controlSizeValues = ["sm", "md", "lg"] as const satisfies readonly ControlSize[];
const imageFitValues = ["cover", "contain", "fill"] as const satisfies readonly ImageFit[];
const frameLayoutValues = ["free", "row", "column", "grid"] as const satisfies readonly FrameLayoutMode[];

const builderPropertySchema: BuilderPropertySchemaField[] = [
  { prop: "title", label: "Title", kind: "text", appliesTo: ["heading", "switch", "card", "table"], required: true, minLength: 1, maxLength: 72 },
  { prop: "title", label: "Title", kind: "text", appliesTo: ["frame"], recommended: true, maxLength: 72 },
  { prop: "label", label: "Label", kind: "text", appliesTo: ["button", "input", "textarea", "select", "checkbox", "stat", "badge"], required: true, minLength: 1, maxLength: 64 },
  { prop: "value", label: "Value", kind: "text", appliesTo: ["select", "stat"], required: true, minLength: 1, maxLength: 80 },
  { prop: "description", label: "Description", kind: "text", appliesTo: ["heading", "switch", "card", "table"], maxLength: 180 },
  { prop: "placeholder", label: "Placeholder", kind: "text", appliesTo: ["input", "textarea"], maxLength: 96 },
  { prop: "helper", label: "Helper text", kind: "text", appliesTo: ["input", "stat"], maxLength: 120 },
  { prop: "variant", label: "Variant", kind: "select", appliesTo: ["button", "badge"], options: buttonVariantValues },
  { prop: "size", label: "Size", kind: "select", appliesTo: ["button"], options: controlSizeValues },
  { prop: "checked", label: "Checked state", kind: "boolean", appliesTo: ["checkbox", "switch"] },
  { prop: "alt", label: "Alt text", kind: "text", appliesTo: ["image"], recommended: true, maxLength: 120 },
  { prop: "objectFit", label: "Object fit", kind: "select", appliesTo: ["image"], options: imageFitValues },
  { prop: "layoutMode", label: "Layout mode", kind: "select", appliesTo: ["frame"], recommended: true, options: frameLayoutValues },
  { prop: "layoutGap", label: "Layout gap", kind: "number", appliesTo: ["frame"], min: 0, max: 96 },
  { prop: "layoutPadding", label: "Layout padding", kind: "number", appliesTo: ["frame"], min: 0, max: 96 },
  { prop: "layoutColumns", label: "Grid columns", kind: "number", appliesTo: ["frame"], min: 1, max: 12 },
];

const defaultPage: PageConfig = {
  title: "Untitled Interface",
  preset: "desktop",
  activeBreakpoint: "desktop",
  width: 1440,
  height: 900,
  background: "grid",
  showGrid: true,
  snapToGrid: true,
  gridSize: 8,
  zoom: 0.5,
  autoSave: true,
};

const palette: ComponentDefinition[] = [
  {
    type: "frame",
    title: "Frame",
    description: "容器面板，用来承载一组控件。",
    icon: Box,
    defaultSize: { width: 360, height: 220 },
    defaultProps: {
      title: "Settings",
      description: "Group related controls in one panel.",
      layoutMode: "free",
      layoutGap: 12,
      layoutPadding: 16,
      layoutColumns: 2,
    },
  },
  {
    type: "heading",
    title: "Heading",
    description: "页面标题、分组标题或说明文本。",
    icon: Heading1,
    defaultSize: { width: 420, height: 92 },
    defaultProps: {
      label: "Workspace",
      title: "Project Overview",
      description: "Arrange controls freely on the canvas.",
    },
  },
  {
    type: "image",
    title: "Image",
    description: "绑定项目资源，用于产品图、插图或界面预览。",
    icon: FileImage,
    defaultSize: { width: 320, height: 200 },
    defaultProps: {
      label: "Image",
      alt: "Project asset",
      objectFit: "cover",
    },
  },
  {
    type: "button",
    title: "Button",
    description: "主操作、次操作、危险操作按钮。",
    icon: MousePointer2,
    defaultSize: { width: 148, height: 44 },
    defaultProps: {
      label: "Create",
      variant: "default",
      size: "md",
    },
  },
  {
    type: "input",
    title: "Input",
    description: "单行输入控件，适合名称、路径、搜索。",
    icon: Type,
    defaultSize: { width: 260, height: 76 },
    defaultProps: {
      label: "Project name",
      placeholder: "Nova workspace",
      helper: "Used for the generated window title.",
    },
  },
  {
    type: "textarea",
    title: "Textarea",
    description: "多行文本输入区域。",
    icon: TextCursorInput,
    defaultSize: { width: 320, height: 138 },
    defaultProps: {
      label: "Notes",
      placeholder: "Write implementation notes...",
    },
  },
  {
    type: "checkbox",
    title: "Checkbox",
    description: "复选项或确认项。",
    icon: CheckCircle2,
    defaultSize: { width: 230, height: 48 },
    defaultProps: {
      label: "Enable generated layout",
      checked: true,
    },
  },
  {
    type: "switch",
    title: "Switch",
    description: "二元设置开关。",
    icon: ToggleLeft,
    defaultSize: { width: 280, height: 76 },
    defaultProps: {
      title: "Auto save",
      description: "Persist layout changes locally.",
      checked: true,
    },
  },
  {
    type: "select",
    title: "Select",
    description: "下拉选项控件。",
    icon: PanelTop,
    defaultSize: { width: 260, height: 76 },
    defaultProps: {
      label: "Build target",
      value: "Windows exe",
      optionA: "Windows exe",
      optionB: "macOS app",
      optionC: "Linux AppImage",
    },
  },
  {
    type: "card",
    title: "Card",
    description: "信息卡片，适合摘要与状态说明。",
    icon: Box,
    defaultSize: { width: 320, height: 180 },
    defaultProps: {
      title: "Release status",
      description: "All checks passed and the desktop artifact is ready.",
    },
  },
  {
    type: "stat",
    title: "Stat",
    description: "指标卡，用于仪表盘和状态面板。",
    icon: BarChart3,
    defaultSize: { width: 210, height: 132 },
    defaultProps: {
      label: "Build success",
      value: "98%",
      helper: "+4.2% this week",
    },
  },
  {
    type: "table",
    title: "Table",
    description: "紧凑数据表格。",
    icon: Table2,
    defaultSize: { width: 520, height: 240 },
    defaultProps: {
      title: "Recent builds",
      description: "Artifact status and platform output.",
    },
  },
  {
    type: "divider",
    title: "Divider",
    description: "横向分隔线。",
    icon: RectangleHorizontal,
    defaultSize: { width: 320, height: 18 },
    defaultProps: {},
  },
  {
    type: "badge",
    title: "Badge",
    description: "状态徽标和标签。",
    icon: PanelTop,
    defaultSize: { width: 112, height: 32 },
    defaultProps: {
      label: "Ready",
      variant: "secondary",
    },
  },
];

function getDefinition(type: BuilderComponentType) {
  return palette.find((item) => item.type === type) ?? palette[0];
}

const emptyCanvasQuickStarts = ["button", "input", "frame"] as const satisfies readonly BuilderComponentType[];

function escapeText(value = "") {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function normalizeName(value: string) {
  return value.replace(/[^A-Za-z0-9]/g, "") || "GeneratedInterface";
}

function fileNameFromPath(path = "") {
  return path.split(/[\\/]/).filter(Boolean).pop() || "asset";
}

function safeAssetFileName(name: string, index = 0) {
  const fallback = `asset-${index + 1}.png`;
  const sanitized = (name || fallback).replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-");
  return sanitized || fallback;
}

function assetPublicPath(sourcePath: string, index = 0) {
  return `assets/${safeAssetFileName(fileNameFromPath(sourcePath), index)}`;
}

function parentPathFromPath(path = "") {
  const normalized = path.trim();
  if (!normalized) {
    return "";
  }
  const separatorIndex = Math.max(normalized.lastIndexOf("\\"), normalized.lastIndexOf("/"));
  return separatorIndex > 0 ? normalized.slice(0, separatorIndex) : "";
}

function normalizeComparablePath(path = "") {
  return path.trim().replace(/^\\\\\?\\/, "").replace(/\//g, "\\").replace(/\\+$/, "").toLowerCase();
}

function samePathText(left = "", right = "") {
  const normalizedLeft = normalizeComparablePath(left);
  const normalizedRight = normalizeComparablePath(right);
  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

type WorkflowRuntimeSession = {
  entryId?: string;
  path: string;
  pid: number;
  startedAt: string;
  logPath: string;
  summary: string;
  status: string;
  checkedAt: string;
};

function workflowRuntimeSessionFromLaunch(result: LaunchExecutableResult, entryId?: string): WorkflowRuntimeSession {
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

function createAssetFromPath(sourcePath: string, index = 0): DesignerAsset {
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

function normalizeDesignerAssets(value: unknown): DesignerAsset[] {
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

function normalizeValidationHistory(value: unknown): ValidationHistoryEntry[] {
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
        summary: entry.summary || "Generated window validation",
      };
    })
    .filter((entry): entry is ValidationHistoryEntry => Boolean(entry))
    .slice(0, 12);
}

function normalizeProjectMaintenanceHistory(value: unknown): ProjectMaintenanceEntry[] {
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
                fileName: change.fileName || "UI file",
                itemId: change.itemId,
                itemName: change.itemName || "Control",
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
        title: entry.title || "Property schema repair",
        summary: entry.summary || "Project maintenance action",
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

function normalizeBuildHistory(value: unknown): BuildHistoryEntry[] {
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
        label: entry.label || (buildKind === "bundle" ? "Bundle build" : "Build"),
        releaseAppName: entry.releaseAppName || "Nova App",
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
        summary: entry.summary || (buildKind === "bundle" ? "Generated installer bundle" : "Generated executable build"),
      };
    })
    .filter((entry): entry is BuildHistoryEntry => Boolean(entry))
    .slice(0, 12);
}

function normalizeReleasePipelineStatus(value: unknown): ReleasePipelineStatus {
  return value === "running" ||
    value === "succeeded" ||
    value === "failed" ||
    value === "skipped" ||
    value === "canceled" ||
    value === "queued"
    ? value
    : "queued";
}

function normalizeReleasePipelineStepInputSnapshot(value: unknown): ReleasePipelineStepInputSnapshot | undefined {
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
    releaseAppName: typeof source.releaseAppName === "string" && source.releaseAppName.trim() ? source.releaseAppName : "Nova App",
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

function normalizeReleasePipelineStepEnvironment(value: unknown): ReleasePipelineStepEnvironment | undefined {
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

function normalizeReleasePipelineStepCommandArgs(value: unknown): ReleasePipelineStepCommandArgs | undefined {
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

function normalizeReleasePipelineStepArtifactEvidence(value: unknown): ReleasePipelineStepArtifactEvidence | undefined {
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
    summary: typeof source.summary === "string" && source.summary.trim() ? source.summary : "Artifact evidence captured.",
    checkedAt: typeof source.checkedAt === "string" && source.checkedAt.trim() ? source.checkedAt : new Date().toISOString(),
  };
}

function normalizeProjectDependencyGraphScope(value: unknown): ProjectDependencyGraphScope | null {
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
    summary: typeof source.summary === "string" && source.summary.trim() ? source.summary : "Dependency scope status.",
  };
}

function normalizeProjectDependencySourceReference(value: unknown): ProjectDependencySourceReference | null {
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
    detail: typeof source.detail === "string" && source.detail.trim() ? source.detail : "Dependency source",
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

function normalizeProjectDependencyGraphPlan(value: unknown): ProjectDependencyGraphPlan {
  if (!value || typeof value !== "object") {
    return {
      id: "dependency-plan",
      title: "Dependency plan",
      detail: "No persisted dependency plan was found.",
      badge: "graph",
      actions: [],
      scopeIds: [],
      ready: false,
    };
  }
  const source = value as Partial<ProjectDependencyGraphPlan>;
  return {
    id: typeof source.id === "string" && source.id.trim() ? source.id : "dependency-plan",
    title: typeof source.title === "string" && source.title.trim() ? source.title : "Dependency plan",
    detail: typeof source.detail === "string" && source.detail.trim() ? source.detail : "Persisted dependency graph plan.",
    badge: typeof source.badge === "string" && source.badge.trim() ? source.badge : "graph",
    actions: Array.isArray(source.actions) ? source.actions.filter((action): action is string => typeof action === "string" && action.trim().length > 0) : [],
    scopeIds: Array.isArray(source.scopeIds) ? source.scopeIds.filter((scope): scope is string => typeof scope === "string" && scope.trim().length > 0) : [],
    ready: Boolean(source.ready),
  };
}

function normalizeProjectDependencyGraphEvent(value: unknown): ProjectDependencyGraphEvent {
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

function normalizeProjectDependencyGraphValidityEntry(value: unknown): ProjectDependencyGraphValidityEntry | null {
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

function normalizeProjectDependencyGraphRecord(value: unknown): ProjectDependencyGraphRecord | null {
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
    summary: typeof source.summary === "string" && source.summary.trim() ? source.summary : "Persisted project dependency graph.",
  };
}

function normalizeReleasePipelineSteps(value: unknown): ReleasePipelineStep[] {
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

function normalizeReleasePipelineHistory(value: unknown): ReleasePipelineEntry[] {
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
        presetTitle: typeof entry.presetTitle === "string" && entry.presetTitle ? entry.presetTitle : "Release pipeline",
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
        releaseAppName: typeof entry.releaseAppName === "string" && entry.releaseAppName ? entry.releaseAppName : "Nova App",
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
        summary: typeof entry.summary === "string" && entry.summary ? entry.summary : `${steps.length} release pipeline step(s).`,
        steps,
      };
    })
    .filter((entry): entry is ReleasePipelineEntry => Boolean(entry))
    .slice(0, 12);
}

function mergeReleasePipelineHistory(
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

function normalizeBreakpointValidationIssues(value: unknown): BreakpointValidationIssue[] {
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
        title: String(issue.title ?? raw.title ?? "Breakpoint runtime issue"),
        detail: String(issue.detail ?? raw.detail ?? "No detail provided."),
        fileId,
        fileName: String(issue.fileName ?? raw.file_name ?? "UI file"),
        itemId: typeof issue.itemId === "string" ? issue.itemId : typeof raw.item_id === "string" ? raw.item_id : undefined,
        itemName: typeof issue.itemName === "string" ? issue.itemName : typeof raw.item_name === "string" ? raw.item_name : undefined,
        itemType: typeof issue.itemType === "string" ? issue.itemType : typeof raw.item_type === "string" ? raw.item_type : undefined,
      };
    })
    .filter((issue): issue is BreakpointValidationIssue => Boolean(issue))
    .slice(0, 24);
}

function assetForItem(item: BuilderItem, assets: DesignerAsset[]) {
  return assets.find((asset) => asset.id === item.props.assetId) ?? null;
}

function imageSourceForItem(item: BuilderItem, assets: DesignerAsset[]) {
  const asset = assetForItem(item, assets);
  const source = asset?.sourcePath || item.props.assetPath || asset?.publicPath || "";
  if (!source || /^(https?:|data:|blob:|\/)/i.test(source) || !isTauriRuntime()) {
    return source;
  }
  return convertFileSrc(source);
}

function createStateVariable(index = 1): BuilderStateVariable {
  return {
    id: createId(),
    name: index === 1 ? "statusText" : `stateValue${index}`,
    initialValue: index === 1 ? "Ready" : "",
  };
}

function normalizeStateVariables(value: unknown): BuilderStateVariable[] {
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

function createItem(type: BuilderComponentType, page: PageConfig, index: number, position?: { x: number; y: number }): BuilderItem {
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

function getItemSummary(item: BuilderItem) {
  return item.props.title ?? item.props.label ?? item.props.value ?? item.name;
}

function propertySchemaForItem(item: BuilderItem) {
  return builderPropertySchema.filter((field) => field.appliesTo.includes(item.type));
}

function textPropertyValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function selectOptionsForItem(item: BuilderItem) {
  return [item.props.optionA, item.props.optionB, item.props.optionC].map((option) => option?.trim()).filter((option): option is string => Boolean(option));
}

function propertySchemaHint(field: BuilderPropertySchemaField) {
  const hints: string[] = [field.kind];
  if (field.required) {
    hints.push("required");
  } else if (field.recommended) {
    hints.push("recommended");
  }
  if (field.options?.length) {
    hints.push(field.options.join(" / "));
  }
  if (typeof field.min === "number" || typeof field.max === "number") {
    hints.push(`${field.min ?? "-inf"}..${field.max ?? "inf"}`);
  }
  if (typeof field.maxLength === "number") {
    hints.push(`max ${field.maxLength}`);
  }
  return hints.join(" | ");
}

function propertyIssueId(file: DesignerFile, item: BuilderItem, prop: keyof BuilderItemProps, suffix: string) {
  return `${file.id}-${item.id}-${String(prop)}-${suffix}`;
}

function propertyFallbackValue(item: BuilderItem, field: BuilderPropertySchemaField) {
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
    return item.props.label || item.name || "Project asset";
  }
  if (field.prop === "title" || field.prop === "label") {
    return item.name || definition.title;
  }
  return "";
}

function setPropertyPatchValue(patch: BuilderItemProps, prop: keyof BuilderItemProps, value: BuilderItemProps[keyof BuilderItemProps]) {
  (patch as Record<keyof BuilderItemProps, BuilderItemProps[keyof BuilderItemProps]>)[prop] = value;
}

function propertyAutoFixPatchForItem(item: BuilderItem): BuilderItemProps {
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

  if (item.type === "select") {
    const defaultOptions = getDefinition("select").defaultProps;
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

function propertyPatchSize(patch: BuilderItemProps) {
  return Object.keys(patch).length;
}

function propertyIssuesForItem(file: DesignerFile, item: BuilderItem): BuilderPropertyIssue[] {
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

  if (item.type === "select") {
    const options = selectOptionsForItem(item);
    const value = item.props.value?.trim() ?? "";
    if (options.length === 0) {
      pushIssue({ prop: "optionA", label: "Options" }, "error", "Select 至少需要一个候选项。", "empty-options");
    } else if (value && !options.includes(value)) {
      pushIssue({ prop: "value", label: "Value" }, "warning", `当前值不在候选项中：${options.join(", ")}。`, "value-option");
    }
  }

  return issues;
}

function propertyIssuesForProject(project: DesignerProject) {
  return project.files.flatMap((file) => file.items.flatMap((item) => propertyIssuesForItem(file, item)));
}

function propertyAutoFixSummaryForProject(project: DesignerProject): BuilderPropertyAutoFixSummary {
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

function projectJumpKindLabel(kind: ProjectJumpKind) {
  const labels: Record<ProjectJumpKind, string> = {
    action: "Action",
    file: "UI file",
    component: "Component",
    control: "Control",
    "rust-command": "Rust",
    state: "State",
    asset: "Asset",
    artifact: "Artifact",
    validation: "Validation",
    pipeline: "Pipeline",
    maintenance: "Repair",
    settings: "Settings",
    checkpoint: "Checkpoint",
  };
  return labels[kind];
}

function projectJumpSearchText(parts: Array<string | number | undefined | null>) {
  return parts.filter((part) => part !== undefined && part !== null).join(" ").toLowerCase();
}

function projectJumpFuzzyMatch(text: string, token: string) {
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

function projectJumpResultScore(result: ProjectJumpResult, tokens: string[], query: string) {
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

function buildProjectJumpResults(project: DesignerProject, checkpoints: EditorProjectCheckpoint[]): ProjectJumpResult[] {
  const results: ProjectJumpResult[] = [];
  const actionResults: ProjectJumpResult[] = [
    {
      id: "settings-release",
      kind: "settings",
      title: "Project release settings",
      subtitle: "Edit app name, bundle id, version, bundle target, and window behavior.",
      badge: "settings",
      mode: "design",
      searchable: projectJumpSearchText(["project settings release config app name bundle identifier version target window"]),
    },
    {
      id: "action-save-project",
      kind: "action",
      title: "Save project",
      subtitle: "Persist workspace, UI files, Rust logic, and project metadata.",
      badge: "save",
      mode: "build",
      actionId: "save-project",
      searchable: projectJumpSearchText(["save persist disk project workspace ui rust metadata"]),
    },
    {
      id: "action-new-ui-file",
      kind: "action",
      title: "New UI file",
      subtitle: "Create another managed window inside this Nova project.",
      badge: "UI",
      mode: "design",
      actionId: "new-ui-file",
      searchable: projectJumpSearchText(["new create ui file window canvas screen"]),
    },
    {
      id: "action-duplicate-ui-file",
      kind: "action",
      title: "Duplicate current UI file",
      subtitle: "Copy the active UI file, controls, page settings, and responsive overrides.",
      badge: "UI",
      mode: "design",
      actionId: "duplicate-ui-file",
      searchable: projectJumpSearchText(["duplicate copy clone current ui file window canvas screen"]),
    },
    {
      id: "action-delete-ui-file",
      kind: "action",
      title: "Delete current UI file",
      subtitle: "Open a confirmation before removing or clearing the active UI file.",
      badge: "UI",
      mode: "design",
      actionId: "delete-ui-file",
      searchable: projectJumpSearchText(["delete remove clear current ui file window canvas screen"]),
    },
    {
      id: "action-add-rust-command",
      kind: "action",
      title: "Add Rust command",
      subtitle: "Register a new Tauri invoke command for UI events.",
      badge: "invoke",
      mode: "logic",
      actionId: "add-rust-command",
      searchable: projectJumpSearchText(["add create rust command invoke backend logic event"]),
    },
    {
      id: "action-bind-control-event",
      kind: "action",
      title: "Bind selected control event",
      subtitle: "Create a Rust command and connect it to the selected control event.",
      badge: "bind",
      mode: "design",
      actionId: "bind-control-event",
      searchable: projectJumpSearchText(["bind selected control event create connection rust command signal slot"]),
    },
    {
      id: "action-run-selected-event",
      kind: "action",
      title: "Run selected event",
      subtitle: "Simulate the selected control event and inspect the latest result.",
      badge: "run",
      mode: "preview",
      actionId: "run-selected-event",
      searchable: projectJumpSearchText(["run simulate selected control event preview invoke command result"]),
    },
    {
      id: "action-add-state-variable",
      kind: "action",
      title: "Add state variable",
      subtitle: "Create shared project state for bindings and command results.",
      badge: "state",
      mode: "logic",
      actionId: "add-state-variable",
      searchable: projectJumpSearchText(["add create state variable binding shared result"]),
    },
    {
      id: "action-sync-rust",
      kind: "action",
      title: "Sync Rust source",
      subtitle: "Regenerate Rust logic from the command registry.",
      badge: "sync",
      mode: "logic",
      actionId: "sync-rust",
      searchable: projectJumpSearchText(["sync regenerate rust source logic commands registry"]),
    },
    {
      id: "action-add-image-asset",
      kind: "action",
      title: "Import image asset",
      subtitle: "Add a local image resource to the managed project assets.",
      badge: "asset",
      mode: "design",
      actionId: "add-image-asset",
      searchable: projectJumpSearchText(["import add image asset resource png jpg svg"]),
    },
    {
      id: "action-preview-generated-files",
      kind: "action",
      title: "Preview generated files",
      subtitle: "Review the target app file plan and disk diff before writing.",
      badge: "diff",
      mode: "build",
      actionId: "preview-generated-files",
      searchable: projectJumpSearchText(["preview generated files file plan diff target app"]),
    },
    {
      id: "action-apply-generated-files",
      kind: "action",
      title: "Apply selected generated files",
      subtitle: "Write the selected generated target files with a pre-write snapshot.",
      badge: "apply",
      mode: "build",
      actionId: "apply-generated-files",
      searchable: projectJumpSearchText(["apply selected generated files write snapshot target app"]),
    },
    {
      id: "action-apply-generated-changes",
      kind: "action",
      title: "Apply generated changes",
      subtitle: "Preview and write all changed generated target files with a pre-write snapshot.",
      badge: "apply all",
      mode: "build",
      actionId: "apply-generated-changes",
      searchable: projectJumpSearchText(["apply all generated changes changed files write snapshot target app"]),
    },
    {
      id: "action-build-backend-artifacts",
      kind: "action",
      title: "Build backend artifacts",
      subtitle: "Run C++/Go starter build scripts and refresh artifact status.",
      badge: "backend",
      mode: "logic",
      actionId: "build-backend-artifacts",
      searchable: projectJumpSearchText(["build backend artifacts cpp ffi go sidecar starter script artifact"]),
    },
    {
      id: "action-quick-check-all",
      kind: "action",
      title: "Run all quick checks",
      subtitle: "Run frontend and Rust checks before building the executable.",
      badge: "check",
      mode: "build",
      actionId: "quick-check-all",
      searchable: projectJumpSearchText(["run all quick checks frontend rust cargo npm build verify"]),
    },
    {
      id: "action-quick-check-frontend",
      kind: "action",
      title: "Run frontend check",
      subtitle: "Run the generated target app frontend check.",
      badge: "web",
      mode: "build",
      actionId: "quick-check-frontend",
      searchable: projectJumpSearchText(["run frontend check npm vite web generated target app"]),
    },
    {
      id: "action-quick-check-rust",
      kind: "action",
      title: "Run Rust check",
      subtitle: "Run cargo check for the generated target app.",
      badge: "cargo",
      mode: "build",
      actionId: "quick-check-rust",
      searchable: projectJumpSearchText(["run rust check cargo generated target app"]),
    },
    {
      id: "action-validate-window",
      kind: "action",
      title: "Validate generated window",
      subtitle: "Run visual/runtime validation for the generated target window.",
      badge: "audit",
      mode: "build",
      actionId: "validate-window",
      searchable: projectJumpSearchText(["validate generated window visual runtime audit screenshot breakpoint"]),
    },
    {
      id: "action-build-exe",
      kind: "action",
      title: "Build release exe",
      subtitle: "Compile the managed target app into a release executable.",
      badge: "exe",
      mode: "build",
      actionId: "build-exe",
      searchable: projectJumpSearchText(["build release exe executable compile target app tauri"]),
    },
    {
      id: "action-bundle-installer",
      kind: "action",
      title: "Bundle installer",
      subtitle: "Build installer bundles and collect artifact smoke metadata.",
      badge: "bundle",
      mode: "build",
      actionId: "bundle-installer",
      searchable: projectJumpSearchText(["bundle installer msi nsis artifact smoke release"]),
    },
    {
      id: "action-fix-property-schema",
      kind: "action",
      title: "Fix property schema issues",
      subtitle: "Apply safe project-level control property repairs.",
      badge: "repair",
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
      title: `Insert ${definition.title}`,
      subtitle: `${definition.description} Adds it to the active UI file and selects it on the canvas.`,
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
      subtitle: `${file.path} · ${file.items.length} controls · ${file.page.width} x ${file.page.height}`,
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
      subtitle: `${rustCommandParameters(command).length} args · ${commandResultSchema(command).mode} result`,
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
      subtitle: `Initial value: ${state.initialValue || "(empty)"}`,
      badge: "state",
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
      subtitle: `${entry.status} · ${entry.succeededCount}/${entry.stepCount} steps · ${entry.summary}`,
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
      title: entry.buildKind === "bundle" ? "Bundle artifact" : "Executable artifact",
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
      title: "Window validation",
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
      subtitle: `${entry.propertyCount} properties · ${entry.itemCount} controls · ${entry.manualIssueCount} manual`,
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
      subtitle: `${checkpoint.project_name} · ${checkpoint.file_count} UI · ${checkpoint.command_count} commands`,
      badge: "snapshot",
      mode: "build",
      path: checkpoint.path,
      searchable: projectJumpSearchText([checkpoint.label, checkpoint.project_name, checkpoint.path, "checkpoint snapshot restore"]),
    });
  }

  return results;
}

function filterProjectJumpResults(results: ProjectJumpResult[], query: string) {
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

function projectTaskTimestamp(task: ProjectTaskEntry) {
  const timestamp = new Date(task.startedAt ?? task.createdAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function workflowTaskForActions(tasks: ProjectTaskEntry[], actions: ProjectJumpActionId[]) {
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

function workflowStepStatusLabel(status: ProjectTaskStatus | "idle") {
  const labels: Record<ProjectTaskStatus | "idle", string> = {
    idle: "ready",
    queued: "queued",
    running: "running",
    succeeded: "done",
    failed: "failed",
    skipped: "skipped",
    canceled: "canceled",
  };
  return labels[status];
}

function workflowStepStatusClassName(status: ProjectTaskStatus | "idle", suggested: boolean) {
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

function loadProjectJumpRecentIds() {
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

function createPropertyMaintenanceEntry(summary: BuilderPropertyAutoFixSummary): ProjectMaintenanceEntry {
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
    title: "Property schema repair",
    summary:
      summary.manualIssueCount > 0
        ? `Applied ${summary.propertyCount} safe property fixes; ${summary.manualIssueCount} issue(s) still need review.`
        : `Applied ${summary.propertyCount} safe property fixes across ${summary.targets.length} control(s).`,
    fileCount: summary.fileCount,
    itemCount: summary.targets.length,
    propertyCount: summary.propertyCount,
    issueCount: summary.issueCount,
    manualIssueCount: summary.manualIssueCount,
    changes,
  };
}

function mapLegacyType(type: string): BuilderComponentType | null {
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

function normalizeResponsiveOverrides(value: unknown, page: PageConfig) {
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

function normalizeBuilderState(value: unknown): SavedBuilderState | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const state = value as Partial<SavedBuilderState>;
  const page = { ...defaultPage, ...(state.page ?? {}) };
  page.width = clamp(Number(page.width), 320, 2400);
  page.height = clamp(Number(page.height), 240, 1800);
  page.gridSize = clamp(Number(page.gridSize), 4, 32);
  page.zoom = clamp(Number(page.zoom), 0.25, 2);
  page.activeBreakpoint = normalizeBreakpoint(page.activeBreakpoint);

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

function cloneBuilderState(state: SavedBuilderState): SavedBuilderState {
  return {
    page: { ...state.page },
    items: state.items.map((item) => ({
      ...item,
      responsive: cloneResponsiveOverrides(item.responsive),
      props: { ...item.props },
    })),
  };
}

function builderStateFingerprint(state: SavedBuilderState) {
  return JSON.stringify({
    page: state.page,
    items: state.items,
  });
}

function getSelectionBounds(items: BuilderItem[]) {
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

function buildTreeRows(items: BuilderItem[]) {
  const rows: Array<{ item: BuilderItem; depth: number }> = [];
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

function loadSavedBuilderState(): SavedBuilderState | null {
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

function projectTemplateSeedOptions() {
  return {
    defaultPage,
    defaultPropsForType: (type: BuilderComponentType) => getDefinition(type).defaultProps,
  };
}

function createBlankFile(name = "Main Window.ui", pagePatch: Partial<PageConfig> = {}): DesignerFile {
  return createTemplateBlankFile(name, pagePatch, defaultPage);
}
function createProject(name = "Untitled Project", templateId: ProjectTemplateId = "blank"): DesignerProject {
  const now = new Date().toISOString();
  const seed = createProjectTemplateSeed(templateId, projectTemplateSeedOptions());
  const activeFile = seed.files[0] ?? createBlankFile("Main Window.ui");
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
    releaseConfig: defaultReleaseConfig(name),
    createdAt: now,
    updatedAt: now,
  };
}

function createWorkspace(project = createProject("Nova Project")): DesignerWorkspace {
  return {
    projects: [project],
    activeProjectId: project.id,
  };
}

function normalizeDesignerFile(value: unknown, index = 0): DesignerFile | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Partial<DesignerFile>;
  const state = normalizeBuilderState({ page: source.page, items: source.items });
  if (!state) {
    return null;
  }

  const now = new Date().toISOString();
  const name = source.name || (index === 0 ? "Main Window.ui" : `Window ${index + 1}.ui`);
  return {
    id: source.id || createId(),
    name,
    path: source.path || `ui/${name}`,
    page: state.page,
    items: state.items,
    updatedAt: source.updatedAt || now,
  };
}

function normalizeDesignerWorkspace(value: unknown): DesignerWorkspace | null {
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

      return {
        id: projectSource.id || createId(),
        name: projectSource.name || (projectIndex === 0 ? "Nova Project" : `Project ${projectIndex + 1}`),
        description: projectSource.description || "Local Nova UI editor project",
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

function loadDesignerWorkspace(): DesignerWorkspace | null {
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

function getInitialDesignerWorkspace(): DesignerWorkspace {
  const savedWorkspace = loadDesignerWorkspace();
  if (savedWorkspace) {
    return savedWorkspace;
  }

  const legacyState = loadSavedBuilderState();
  if (legacyState) {
    const project = createProject("Migrated Nova Project");
    project.files = [
      {
        ...createBlankFile(legacyState.page.title ? `${legacyState.page.title}.ui` : "Main Window.ui"),
        page: legacyState.page,
        items: legacyState.items,
      },
    ];
    project.activeFileId = project.files[0].id;
    return createWorkspace(project);
  }

  return createWorkspace();
}

function itemStyleCode(item: BuilderItem, allItems: BuilderItem[], parentLayoutMode: FrameLayoutMode, page: PageConfig) {
  if (parentLayoutMode !== "free") {
    return `style={{ width: ${item.width}, height: ${item.height} }}`;
  }

  const constraints = itemConstraints(item);
  const parentBounds = getParentBounds(item, allItems, page);
  const right = parentBounds.width - item.x - item.width;
  const bottom = parentBounds.height - item.y - item.height;
  const entries = [`position: "absolute"`];

  if (constraints.left || !constraints.right) {
    entries.push(`left: ${item.x}`);
  }
  if (constraints.right) {
    entries.push(`right: ${right}`);
  }
  if (!constraints.right || !constraints.left) {
    entries.push(`width: ${item.width}`);
  }

  if (constraints.top || !constraints.bottom) {
    entries.push(`top: ${item.y}`);
  }
  if (constraints.bottom) {
    entries.push(`bottom: ${bottom}`);
  }
  if (!constraints.bottom || !constraints.top) {
    entries.push(`height: ${item.height}`);
  }

  return `style={{ ${entries.join(", ")} }}`;
}

function frameChildrenStyleCode(item: BuilderItem) {
  const mode = frameLayoutMode(item);
  if (mode === "free") {
    return `style={{ position: "absolute", inset: 0, overflow: "hidden" }}`;
  }

  const { gap, padding, columns } = frameLayoutMetrics(item);
  if (mode === "row") {
    return `style={{ position: "absolute", inset: 0, overflow: "auto", display: "flex", flexDirection: "row", alignItems: "flex-start", gap: ${gap}, padding: ${padding} }}`;
  }

  if (mode === "column") {
    return `style={{ position: "absolute", inset: 0, overflow: "auto", display: "flex", flexDirection: "column", alignItems: "stretch", gap: ${gap}, padding: ${padding} }}`;
  }

  return `style={{ position: "absolute", inset: 0, overflow: "auto", display: "grid", gridTemplateColumns: "repeat(${columns}, minmax(0, 1fr))", alignContent: "flex-start", gap: ${gap}, padding: ${padding} }}`;
}

function eventDataAttributeCode(item: BuilderItem, eventName: BuilderEventName) {
  const binding = item.props.events?.[eventName];
  const commandId = binding?.commandId || eventCommandId(item, eventName);
  if (!commandId) {
    return "";
  }
  const passValue = binding?.passValue ? ` data-rust-${eventName}-pass-value="true"` : "";
  const target = binding?.resultTargetItemId ? ` data-rust-${eventName}-result-target="${escapeText(binding.resultTargetItemId)}"` : "";
  const targetProp = binding?.resultTargetProp ? ` data-rust-${eventName}-result-prop="${escapeText(binding.resultTargetProp)}"` : "";
  const resultState = binding?.resultStateId ? ` data-rust-${eventName}-result-state="${escapeText(binding.resultStateId)}"` : "";
  const jsonPatch = binding?.applyJsonStatePatch ? ` data-rust-${eventName}-json-state-patch="true"` : "";
  const payloadMode = binding?.payloadMode === "json" ? ` data-rust-${eventName}-payload="json"` : "";
  const payloadFields =
    binding?.payloadMode === "json" && binding.payloadFields?.length
      ? ` data-rust-${eventName}-payload-fields="${escapeText(binding.payloadFields.join(","))}"`
      : "";
  return ` data-rust-${eventName}-command-id="${escapeText(commandId)}"${passValue}${payloadMode}${payloadFields}${target}${targetProp}${resultState}${jsonPatch}`;
}

function renderItemCode(item: BuilderItem, allItems: BuilderItem[] = [], parentLayoutMode: FrameLayoutMode = "free", page: PageConfig = defaultPage): string {
  const style = itemStyleCode(item, allItems, parentLayoutMode, page);
  const title = escapeText(item.props.title);
  const description = escapeText(item.props.description);
  const label = escapeText(item.props.label);
  const placeholder = escapeText(item.props.placeholder);
  const value = escapeText(item.props.value);
  const layoutMode = frameLayoutMode(item);
  const childCode = allItems
    .filter((child) => child.parentId === item.id)
    .sort((a, b) => a.z - b.z)
    .map((child) => renderItemCode(child, allItems, layoutMode, page).split("\n").map((line: string) => `    ${line}`).join("\n"))
    .join("\n");

  if (item.type === "frame") {
    return `<section ${style} className="relative overflow-hidden rounded-2xl border bg-surface-container p-4">
  <h2 className="text-sm font-medium">${title}</h2>
  <p className="mt-2 text-sm text-muted-foreground">${description}</p>
  <div ${frameChildrenStyleCode(item)}>
${childCode}
  </div>
</section>`;
  }

  if (item.type === "heading") {
    return `<section ${style}>
  <p className="text-xs font-medium text-muted-foreground">${label}</p>
  <h1 className="mt-1 text-3xl font-semibold">${title}</h1>
  <p className="mt-2 text-sm text-muted-foreground">${description}</p>
</section>`;
  }

  if (item.type === "image") {
    const src = escapeText(item.props.assetPath || "");
    const alt = escapeText(item.props.alt || item.props.label || "Project asset");
    return `<img ${style} src="${src}" alt="${alt}" className="rounded-2xl object-${item.props.objectFit ?? "cover"}" />`;
  }

  if (item.type === "button") {
    return `<Button ${style}${eventDataAttributeCode(item, "click")} variant="${item.props.variant ?? "default"}" size="${item.props.size ?? "md"}">${label}</Button>`;
  }

  if (item.type === "input") {
    return `<div ${style}${eventDataAttributeCode(item, "change")} className="space-y-2">
  <Label>${label}</Label>
  <Input placeholder="${placeholder}" />
</div>`;
  }

  if (item.type === "textarea") {
    return `<div ${style}${eventDataAttributeCode(item, "change")} className="space-y-2">
  <Label>${label}</Label>
  <Textarea placeholder="${placeholder}" className="h-[calc(100%-28px)]" />
</div>`;
  }

  if (item.type === "checkbox") {
    return `<label ${style}${eventDataAttributeCode(item, "change")} className="flex items-center gap-3">
  <Checkbox defaultChecked={${Boolean(item.props.checked)}} />
  <span className="text-sm">${label}</span>
</label>`;
  }

  if (item.type === "switch") {
    return `<div ${style}${eventDataAttributeCode(item, "change")} className="flex items-center justify-between rounded-2xl border p-4">
  <div>
    <p className="text-sm font-medium">${title}</p>
    <p className="text-xs text-muted-foreground">${description}</p>
  </div>
  <Switch defaultChecked={${Boolean(item.props.checked)}} />
</div>`;
  }

  if (item.type === "select") {
    return `<div ${style}${eventDataAttributeCode(item, "change")} className="space-y-2">
  <Label>${label}</Label>
  <Select defaultValue="${value}">
    <SelectTrigger><SelectValue /></SelectTrigger>
  </Select>
</div>`;
  }

  if (item.type === "card") {
    return `<section ${style} className="rounded-2xl border bg-surface-container p-5">
  <h2 className="text-base font-medium">${title}</h2>
  <p className="mt-2 text-sm text-muted-foreground">${description}</p>
</section>`;
  }

  if (item.type === "stat") {
    return `<section ${style} className="rounded-2xl border bg-surface-container p-5">
  <p className="text-xs text-muted-foreground">${label}</p>
  <p className="mt-2 text-3xl font-semibold">${value}</p>
  <p className="mt-2 text-xs text-muted-foreground">${escapeText(item.props.helper)}</p>
</section>`;
  }

  if (item.type === "table") {
    return `<section ${style} className="overflow-hidden rounded-2xl border">
  <table className="h-full w-full text-left text-sm">
    <thead><tr><th>Name</th><th>Status</th><th>Target</th></tr></thead>
    <tbody><tr><td>${title}</td><td>Ready</td><td>Windows</td></tr></tbody>
  </table>
</section>`;
  }

  if (item.type === "divider") {
    return `<div ${style} className="border-t" />`;
  }

  return `<Badge ${style} variant="${item.props.variant ?? "secondary"}">${label}</Badge>`;
}

function renderBuilderPreview(item: BuilderItem, mode: BuilderMode, assets: DesignerAsset[] = []) {
  const props = item.props;
  const passive = mode === "design";

  if (item.type === "frame") {
    return (
      <section className="h-full w-full overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container p-4 shadow-m3-1">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="truncate text-sm font-medium">{props.title}</h3>
          <Badge variant="outline">{frameLayoutMode(item)}</Badge>
        </div>
        <p className="line-clamp-3 text-sm leading-5 text-on-surface-variant">{props.description}</p>
        <div className="mt-4 h-2 rounded-full bg-surface-container-highest">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>
      </section>
    );
  }

  if (item.type === "heading") {
    return (
      <section className="h-full w-full overflow-hidden">
        <p className="truncate text-xs font-medium uppercase tracking-[0.12em] text-primary">{props.label}</p>
        <h2 className="mt-1 truncate text-3xl font-semibold tracking-normal">{props.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-on-surface-variant">{props.description}</p>
      </section>
    );
  }

  if (item.type === "button") {
    return (
      <Button className="h-full w-full" variant={props.variant ?? "default"} size={props.size ?? "md"} tabIndex={passive ? -1 : undefined}>
        {props.label}
      </Button>
    );
  }

  if (item.type === "image") {
    const asset = assetForItem(item, assets);
    const src = imageSourceForItem(item, assets);
    return (
      <figure className="relative h-full w-full overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        {src ? (
          <img
            src={src}
            alt={props.alt || props.label || asset?.name || "Project asset"}
            className={cn("h-full w-full", props.objectFit === "contain" ? "object-contain" : props.objectFit === "fill" ? "object-fill" : "object-cover")}
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center text-on-surface-variant">
            <FileImage aria-hidden className="size-8 text-primary" />
            <span className="text-sm font-medium">No asset bound</span>
          </div>
        )}
        <figcaption className="pointer-events-none absolute inset-x-2 bottom-2 rounded-xl border border-outline-variant bg-surface/85 px-2 py-1 text-[0.68rem] text-on-surface-variant shadow-m3-1">
          <span className="block truncate">{asset?.name || props.label || "Image asset"}</span>
        </figcaption>
      </figure>
    );
  }

  if (item.type === "input") {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <Label className="truncate text-xs">{props.label}</Label>
        <Input className="min-h-0 flex-1" placeholder={props.placeholder} tabIndex={passive ? -1 : undefined} />
        {item.height >= 86 ? <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </div>
    );
  }

  if (item.type === "textarea") {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <Label className="truncate text-xs">{props.label}</Label>
        <Textarea className="min-h-0 flex-1 resize-none" placeholder={props.placeholder} tabIndex={passive ? -1 : undefined} />
      </div>
    );
  }

  if (item.type === "checkbox") {
    return (
      <label className="flex h-full w-full items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-4">
        <Checkbox checked={Boolean(props.checked)} tabIndex={passive ? -1 : undefined} />
        <span className="truncate text-sm font-medium">{props.label}</span>
      </label>
    );
  }

  if (item.type === "switch") {
    return (
      <div className="flex h-full w-full items-center justify-between gap-4 overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-low px-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium">{props.title}</h3>
          <p className="mt-1 truncate text-xs text-on-surface-variant">{props.description}</p>
        </div>
        <Switch checked={Boolean(props.checked)} tabIndex={passive ? -1 : undefined} />
      </div>
    );
  }

  if (item.type === "select") {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <Label className="truncate text-xs">{props.label}</Label>
        <div className="flex min-h-0 flex-1 items-center justify-between rounded-xl bg-surface-container-highest px-4 text-sm">
          <span className="truncate">{props.value}</span>
          <span className="text-on-surface-variant">⌄</span>
        </div>
      </div>
    );
  }

  if (item.type === "card") {
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-5 shadow-m3-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium">{props.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-5 text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="secondary">Live</Badge>
        </div>
        <Progress value={68} className="mt-auto" />
      </section>
    );
  }

  if (item.type === "stat") {
    return (
      <section className="h-full w-full overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-5 shadow-m3-1">
        <p className="truncate text-xs text-on-surface-variant">{props.label}</p>
        <p className="mt-2 truncate text-3xl font-semibold">{props.value}</p>
        <p className="mt-2 truncate text-xs text-primary">{props.helper}</p>
      </section>
    );
  }

  if (item.type === "table") {
    return (
      <section className="h-full w-full overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <div className="border-b border-outline-variant px-4 py-3">
          <h3 className="truncate text-sm font-medium">{props.title}</h3>
          <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-container-high text-on-surface-variant">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Target</th>
            </tr>
          </thead>
          <tbody>
            {["Desktop shell", "UI kit", "Builder"].map((name, index) => (
              <tr key={name} className="border-t border-outline-variant">
                <td className="px-4 py-2">{name}</td>
                <td className="px-4 py-2">
                  <Badge variant={index === 2 ? "outline" : "secondary"}>{index === 2 ? "Draft" : "Ready"}</Badge>
                </td>
                <td className="px-4 py-2 text-on-surface-variant">Win</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  }

  if (item.type === "divider") {
    return <div className="h-full w-full border-t-2 border-outline-variant" />;
  }

  return (
    <div className="flex h-full w-full items-center">
      <Badge variant={props.variant === "destructive" ? "destructive" : "secondary"} className="max-w-full truncate">
        {props.label}
      </Badge>
    </div>
  );
}

function getCanvasBackgroundStyle(page: PageConfig): CSSProperties {
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

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function textRangeForLineColumn(value: string, lineNumber = 1, columnNumber = 1) {
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rustCommandFunctionExists(rustLogic: string, commandName: string) {
  const pattern = new RegExp(
    `#\\s*\\[\\s*tauri::command\\s*\\]\\s*(?:pub\\s+)?(?:async\\s+)?fn\\s+${escapeRegExp(commandName)}\\s*\\(`,
    "m",
  );
  return pattern.test(rustLogic);
}

function summarizeReadiness(items: BuildReadinessItem[]): BuildReadinessSummary {
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

function buildReadiness(
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
        const payloadResult = parseJsonEditorValue(method.samplePayload, `${integration.name}/${method.name} sample payload`);
        const requestSchemaResult = parseJsonEditorValue(method.requestSchema, `${integration.name}/${method.name} request schema`);
        const responseSchemaResult = parseJsonEditorValue(method.responseSchema, `${integration.name}/${method.name} response schema`);
        const requestIssues =
          !payloadResult.error && !requestSchemaResult.error
            ? validateBackendSchemaValue(payloadResult.value, requestSchemaResult.value, `${integration.name}/${method.name} sample payload`)
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
    "Project identity",
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
    "Release config",
    release.appName.trim() && releaseIdentifierValid && releaseVersionValid && releaseWindowValid
      ? `生成 app：${release.appName} / ${release.bundleIdentifier} / v${release.version} / ${release.windowWidth}x${release.windowHeight} / ${release.bundleTargets}。`
      : "发布配置需要合法 app 名称、bundle identifier、semver 版本号和窗口尺寸。",
  );

  if (release.iconAssetId && !releaseIconAsset) {
    addItem("error", "release-icon", "Release icon", "发布图标引用的项目资源不存在，请重新选择资源。");
  } else if (releaseIconAsset && !["png", "ico", "icns"].includes(releaseIconExtension)) {
    addItem("warning", "release-icon-format", "Release icon", "Tauri 图标建议使用 png、ico 或 icns，当前资源会保留默认图标作为 fallback。");
  } else {
    addItem(
      "ready",
      "release-icon",
      "Release icon",
      releaseIconAsset ? `发布图标会从项目资源复制：${releaseIconAsset.name}。` : "未指定发布图标时使用默认 Nova 图标。",
    );
  }

  const signingConfigured = releaseSigningConfigured(release);
  const signingSeverity: BuildReadinessSeverity =
    release.signingMode === "unsigned" ? "warning" : signingConfigured ? "ready" : "error";
  addItem(
    signingSeverity,
    "release-signing",
    "Release signing",
    releaseSigningDescription(release),
  );

  if (release.signingMode === "windows-certificate" && release.importCertificateBeforeBuild) {
    const certificateImportReady = Boolean(release.certificateSourcePath.trim() && normalizeEnvVarName(release.certificatePasswordEnvVar));
    addItem(
      certificateImportReady ? "ready" : "error",
      "release-certificate-import",
      "Certificate import",
      certificateImportReady
        ? `构建前会从 ${fileNameFromPath(release.certificateSourcePath)} 导入证书，密码只读取环境变量 ${release.certificatePasswordEnvVar}。`
        : "构建前导入证书需要 PFX/P12 路径和合法的密码环境变量名；不要把密码写入项目文件。",
    );
  }

  addItem(
    "ready",
    "bundle-smoke-threshold",
    "Bundle smoke threshold",
    `安装包 manifest 会检查每个 artifact 是否存在且不小于 ${normalizeMinimumArtifactSizeKb(release.minimumArtifactSizeKb)} KB。`,
  );

  addItem(
    "ready",
    "installer-smoke-mode",
    "Installer smoke mode",
    release.installerSmokeMode === "write-script"
      ? "打包后会写出 PowerShell 安装/卸载 smoke 脚本，供发布前在受控环境执行。"
      : "当前只做非侵入式 artifact smoke 检查，不会自动安装或卸载软件。",
  );

  addItem(
    release.installerSmokeRunnerMode === "vm-handoff" && release.installerSmokeMode !== "write-script" ? "warning" : "ready",
    "installer-smoke-runner",
    "Installer smoke runner",
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
    "UI files",
    project.files.length > 0 ? `${project.files.length} 个 UI 文件会写入 ui/*.json。` : "项目至少需要一个 UI 文件。",
  );

  addItem(
    projectItems.length > 0 ? "ready" : "warning",
    "canvas-content",
    "Canvas content",
    projectItems.length > 0 ? `${projectItems.length} 个控件会进入生成 app。` : "当前画布为空，可以构建，但输出窗口没有可见控件。",
  );

  addItem(
    propertyErrors.length > 0 ? "error" : propertyWarnings.length > 0 ? "warning" : "ready",
    "control-property-schema",
    "Control property schema",
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
    "Project folder",
    project.rootPath?.trim() ? `项目会保存到 ${project.rootPath}` : "未指定项目目录时，Tauri 会保存到默认 Nova projects 目录。",
  );

  addItem(
    tauriRuntimeAvailable ? "ready" : "warning",
    "tauri-runtime",
    "Desktop runtime",
    tauriRuntimeAvailable ? "当前运行在 Tauri 桌面环境，可写入磁盘并触发构建。" : "当前是浏览器预览，只能保存本地状态；构建 exe 需要桌面 app。",
  );

  addItem(
    project.rustCommands.length > 0 ? "ready" : "error",
    "rust-command-registry",
    "Rust command registry",
    project.rustCommands.length > 0 ? `${project.rustCommands.length} 个 command 会注册到生成 app。` : "至少需要一个 Rust command。",
  );

  if (duplicateCommandNames.length > 0) {
    addItem(
      "error",
      "duplicate-rust-command-names",
      "Duplicate command names",
      `这些 command 名称生成后重复：${Array.from(new Set(duplicateCommandNames)).join(", ")}。`,
    );
  } else {
    addItem("ready", "unique-rust-command-names", "Command names", "Rust command 名称可安全注册。");
  }

  if (missingRustFunctions.length > 0) {
    addItem(
      "error",
      "missing-rust-functions",
      "Rust source sync",
      `Rust 逻辑缺少同名 #[tauri::command] 函数：${missingRustFunctions.join(", ")}。`,
    );
  } else {
    addItem("ready", "rust-source-sync", "Rust source sync", "Rust 逻辑与 command registry 已对齐。");
  }

  addItem(
    emptyRustModules.length > 0 ? "error" : enabledRustModules.length > 0 ? "ready" : "warning",
    "rust-modules",
    "Rust modules",
    emptyRustModules.length > 0
      ? `这些启用模块没有源码：${emptyRustModules.map((module) => module.name).join(", ")}。`
      : enabledRustModules.length > 0
        ? `${enabledRustModules.length} 个 Rust module 会写入生成 app 的 src-tauri/src/ 并在 lib.rs 中声明。`
        : "当前没有启用的 Rust module；复杂后端逻辑建议拆分到模块文件。",
  );

  addItem(
    invalidCargoDependencies.length > 0 ? "error" : "ready",
    "cargo-dependencies",
    "Cargo dependencies",
    invalidCargoDependencies.length > 0
      ? "启用的 Cargo dependency 需要有效 crate 名称和版本。"
      : enabledCargoDependencies.length > 0
        ? `${enabledCargoDependencies.length} 个项目依赖会追加到生成 app 的 Cargo.toml。`
        : "未启用额外依赖；生成 app 仍包含 Tauri 与 serde_json 基础依赖。",
  );

  addItem(
    incompleteBackendIntegrations.length > 0 ? "warning" : "ready",
    "backend-integrations",
    "Backend integrations",
    incompleteBackendIntegrations.length > 0
      ? `${incompleteBackendIntegrations.length} 个后端集成缺少入口路径或启动命令；Rust 主后端仍可继续构建。`
      : enabledBackendIntegrations.length > 0
        ? `${enabledBackendIntegrations.length} 个后端集成计划会写入 backend/integrations.json，Rust 仍作为 Tauri 主后端。`
        : "未启用外部后端集成；当前使用 Rust/Tauri 原生后端。",
  );

  addItem(
    incompleteBackendResources.length > 0 ? "warning" : inspectedMissingBackendArtifacts.length > 0 ? "error" : "ready",
    "backend-resource-bundle",
    "Backend resources",
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
    "Backend starter artifacts",
    starterBackendsNeedingBuildAttention.length > 0
      ? `${starterBackendsNeedingBuildAttention.length} 个非 Rust 后端使用生成 starter。请先应用生成文件、运行 starter build、确认 artifactPath 可被打包，并通过 method test；${backendIntegrationStarterHint(starterBackendsNeedingBuildAttention[0])}`
      : starterBackendIntegrations.length > 0
        ? `${starterBackendIntegrations.length} 个非 Rust 后端已有 starter 配置，artifact 与 method test 已满足当前检查。`
        : "当前没有 C++ FFI 或 sidecar/local-service starter 需要构建。Rust 主后端可直接构建。",
  );

  addItem(
    missingBackendHealthChecks.length > 0 ? "warning" : "ready",
    "backend-health-checks",
    "Backend health checks",
    missingBackendHealthChecks.length > 0
      ? `${missingBackendHealthChecks.length} 个 sidecar/local-service 没有 health check 命令；生成 app 会显示 skipped，运行异常需要人工判断。`
      : probeableBackendIntegrations.length > 0
        ? `${probeableBackendIntegrations.length} 个外部后端有 health check，生成 app 启动后会探测状态、超时和输出。`
        : "当前没有需要启动探测的外部后端；Rust/Tauri 主后端直接可用。",
  );

  addItem(
    invalidBackendCommands.length > 0 || invalidBackendMethodCommands.length > 0 ? "warning" : "ready",
    "backend-command-presets",
    "Backend command presets",
    invalidBackendCommands.length > 0
      ? `${invalidBackendCommands.length} 个 Rust command 绑定到不存在或禁用的 backend integration；重新生成或启用对应 integration。`
      : invalidBackendMethodCommands.length > 0
        ? `${invalidBackendMethodCommands.length} 个 Rust command 绑定到不存在的 backend method；请选择有效 method 后重新生成。`
        : "Backend method command preset 可生成可绑定 UI 事件的 Rust command。",
  );

  addItem(
    invalidBackendMethodContracts.length > 0 ? "warning" : "ready",
    "backend-method-contracts",
    "Backend method contracts",
    invalidBackendMethodContracts.length > 0
      ? `${invalidBackendMethodContracts.length} 个 backend method sample/schema 不是合法 JSON；先在 Method test bench 修正再发布。`
      : "Backend method sample payload、request schema 和 response schema 都可解析并通过基础类型校验。",
  );

  addItem(
    backendMethodsNeedingPassingTest.length > 0 ? "warning" : "ready",
    "backend-method-tests",
    "Backend method tests",
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
      "Frame hierarchy",
      `${brokenParentItems.length} 个控件引用了不存在或无效的父 Frame。`,
      brokenParentItems[0].file.name,
    );
  } else {
    addItem("ready", "frame-hierarchy", "Frame hierarchy", "父子层级可以被保存并生成。");
  }

  const missingAssetItems = projectItems.filter(({ item }) => item.type === "image" && item.props.assetId && !assetIds.has(item.props.assetId));
  const unboundImages = projectItems.filter(({ item }) => item.type === "image" && !item.props.assetId);
  if (missingAssetItems.length > 0) {
    addItem(
      "error",
      "missing-image-assets",
      "Image assets",
      `${missingAssetItems.length} 个 Image 控件绑定了不存在的项目资源。`,
      missingAssetItems[0].file.name,
    );
  } else if (unboundImages.length > 0) {
    addItem(
      "warning",
      "unbound-image-assets",
      "Image assets",
      `${unboundImages.length} 个 Image 控件尚未绑定资源，生成窗口会显示占位内容。`,
      unboundImages[0].file.name,
    );
  } else {
    addItem("ready", "image-assets", "Image assets", "图片资源绑定可以被复制到生成 app。");
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
      "State bindings",
      `${brokenStateBindings.length + brokenResultStates.length} 个 state 引用已经断开。`,
      (brokenStateBindings[0] ?? brokenResultStates[0])?.file.name,
    );
  } else {
    addItem("ready", "state-bindings", "State bindings", `${project.stateVariables.length} 个共享 state 可用于控件绑定。`);
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
      "Event bindings",
      `${missingEventCommands.length} 个控件事件绑定了不存在的 Rust command。`,
      missingEventCommands[0].file.name,
    );
  } else if (eventBindings.length === 0) {
    addItem("warning", "no-event-bindings", "Event bindings", "还没有 UI 事件连接 Rust command；生成 app 会偏静态。");
  } else {
    addItem("ready", "event-bindings", "Event bindings", `${eventBindings.length} 个 UI 事件会调用 Rust command。`);
  }

  if (unboundButtons.length > 0) {
    addItem(
      "warning",
      "unbound-buttons",
      "Button actions",
      `${unboundButtons.length} 个按钮尚未绑定 click command。`,
      unboundButtons[0].file.name,
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
      "Result targets",
      `${brokenResultTargets.length} 个 Rust 结果写回目标无效。`,
      brokenResultTargets[0].file.name,
    );
  } else {
    addItem("ready", "result-targets", "Result targets", "Rust 返回值写回目标检查通过。");
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
      "JSON state patches",
      `${textPatchBindings.length} 个绑定启用了 JSON patch，但 command schema 仍是 Text result。`,
      textPatchBindings[0].file.name,
    );
  }

  const unnamedStateNames = project.stateVariables.filter((state) => !state.name.trim());
  if (unnamedStateNames.length > 0) {
    addItem("error", "empty-state-names", "State names", "State 名称不能为空，否则 JSON patch 无法稳定映射。");
  } else if (stateNames.size !== project.stateVariables.length) {
    addItem("error", "duplicate-state-names", "State names", "State 名称需要唯一。");
  }

  return summarizeReadiness(items);
}

function itemVisualName(item: BuilderItem) {
  return getItemSummary(item) || item.name || item.type;
}

function itemBounds(item: BuilderItem, items: BuilderItem[]) {
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

function relativeItemBounds(item: BuilderItem) {
  return {
    left: item.x,
    top: item.y,
    right: item.x + item.width,
    bottom: item.y + item.height,
    width: item.width,
    height: item.height,
  };
}

function overlapArea(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

function visualTextForItem(item: BuilderItem) {
  return [item.props.title, item.props.label, item.props.value, item.props.placeholder, item.props.description, item.props.helper]
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => b.length - a.length)[0] ?? "";
}

function visualMinimumSize(item: BuilderItem) {
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
  if (item.type === "frame" || item.type === "card") {
    return { width: 180, height: 120 };
  }
  return { width: MIN_ITEM_WIDTH, height: MIN_ITEM_HEIGHT };
}

function auditAutoLayoutFrame(file: DesignerFile, frame: BuilderItem, items: BuilderItem[], pushIssue: (issue: WindowVisualAuditIssue) => void) {
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
      title: "Auto-layout capacity",
      detail: `${mode} Frame 的子控件需要约 ${Math.round(requiredWidth)} x ${Math.round(requiredHeight)}，可用空间为 ${Math.round(availableWidth)} x ${Math.round(availableHeight)}。`,
      fileId: file.id,
      fileName: file.name,
      itemId: frame.id,
      itemName: itemVisualName(frame),
    });
  }
}

function auditSiblingOverlaps(file: DesignerFile, parentId: string | undefined, items: BuilderItem[], pushIssue: (issue: WindowVisualAuditIssue) => void) {
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
          title: "Overlapping controls",
          detail: `${itemVisualName(first)} 与 ${itemVisualName(second)} 在同一层级明显重叠。`,
          fileId: file.id,
          fileName: file.name,
          itemId: first.id,
          itemName: parent ? itemVisualName(parent) : "Window",
        });
      }
    }
  }
}

function auditProjectWindows(project: DesignerProject): WindowVisualAuditSummary {
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
        title: "Window size",
        detail: `目标窗口只有 ${page.width} x ${page.height}，容易生成不可用窗口。`,
        fileId: file.id,
        fileName: file.name,
      });
    }

    if (items.length === 0) {
      pushIssue({
        id: `${file.id}-empty-window`,
        severity: "warning",
        title: "Empty window",
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
          title: "Off-canvas control",
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
          title: "Clipped control",
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
          title: "Small control",
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
          title: "Text fit",
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
          title: "Image placeholder",
          detail: "Image 控件没有绑定项目资源，目标窗口会显示占位状态。",
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
              title: "Frame clipping",
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

function validationHistoryStatus(audit: WindowVisualAuditSummary): ValidationHistoryEntry["status"] {
  if (audit.errorCount > 0) {
    return "failed";
  }
  return audit.warningCount > 0 ? "warning" : "passed";
}

function validationTimeLabel(value: string) {
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

function byteSizeLabel(value: number) {
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

function projectChangeImpactStatusLabel(status: ProjectChangeImpactStatus) {
  const labels: Record<ProjectChangeImpactStatus, string> = {
    "needs-preview": "needs preview",
    stale: "stale",
    dirty: "dirty",
    clean: "clean",
  };
  return labels[status];
}

function projectChangeImpactStatusVariant(status: ProjectChangeImpactStatus): "default" | "secondary" | "outline" | "destructive" {
  if (status === "dirty") {
    return "secondary";
  }
  if (status === "stale") {
    return "destructive";
  }
  return status === "clean" ? "outline" : "secondary";
}

function projectChangeScopeStatusVariant(scope: ProjectChangeScope): "default" | "secondary" | "outline" | "destructive" {
  if (scope.status === "dirty") {
    return "secondary";
  }
  if (scope.status === "unknown") {
    return "outline";
  }
  return "outline";
}

function dependencyGraphEventStatusVariant(status?: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "failed" || status === "canceled") {
    return "destructive";
  }
  if (status === "succeeded") {
    return "secondary";
  }
  return "outline";
}

function dependencyValidityStatusVariant(status: ProjectDependencyValidityView["validityStatus"]): "default" | "secondary" | "outline" | "destructive" {
  if (status === "failed" || status === "stale") {
    return "destructive";
  }
  if (status === "valid") {
    return "secondary";
  }
  return "outline";
}

function reverseDependencyStatusVariant(status: ProjectReverseDependencySummary["status"]): "default" | "secondary" | "outline" | "destructive" {
  if (status === "tracked") {
    return "secondary";
  }
  return "outline";
}

function reverseDependencyStatusLabel(status: ProjectReverseDependencySummary["status"]) {
  if (status === "tracked") {
    return "current preview";
  }
  if (status === "persisted") {
    return "persisted graph";
  }
  if (status === "projected") {
    return "projected";
  }
  return "empty";
}

function reverseDependencyTargetKindLabel(kind: ProjectReverseDependencyTarget["kind"]) {
  const labels: Record<ProjectReverseDependencyTarget["kind"], string> = {
    project: "Project",
    "ui-file": "UI file",
    control: "Control",
    "generated-runtime": "Runtime",
    "rust-command": "Rust command",
    "rust-module": "Rust module",
    "cargo-dependency": "Cargo dependency",
    asset: "Asset",
    "backend-integration": "Backend integration",
    "release-config": "Release config",
    validation: "Validation",
  };
  return labels[kind];
}

function generatedPreviewEntryNeedsApply(entry: GeneratedFilePreviewEntry) {
  return entry.changed || entry.status === "copy" || entry.status === "create" || entry.status === "update";
}

function backendArtifactStatusVariant(entry: BackendArtifactInspectionEntry): "default" | "secondary" | "outline" | "destructive" {
  if (entry.status === "ready") {
    return "secondary";
  }
  if (entry.status === "missing" || entry.status === "not-configured") {
    return "destructive";
  }
  return "outline";
}

function backendArtifactStarterBuildAvailable(integration: BackendIntegration) {
  return integration.enabled && (integration.kind === "cpp-ffi" || integration.language === "go");
}

function createValidationHistoryEntry(result: ValidationResult, audit: WindowVisualAuditSummary): ValidationHistoryEntry {
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
        ? `${audit.checkedFiles} files, ${audit.checkedItems} controls, ${breakpointIssues.length} runtime issues`
        : `${audit.checkedFiles} files, ${audit.checkedItems} controls checked`,
  };
}

function createBuildHistoryEntry(
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
    label: buildKind === "bundle" ? `Bundle ${buildNumber}` : `Build ${buildNumber}`,
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
      ? `${project.files.length} UI files, ${controlCount} controls -> ${fileNameFromPath(primaryBundlePath)}`
      : outputExePath
      ? `${project.files.length} UI files, ${controlCount} controls -> ${fileNameFromPath(outputExePath)}`
      : `${project.files.length} UI files, ${controlCount} controls -> generated app`,
  };
}

function releasePipelineTerminalStatus(status: ReleasePipelineStatus) {
  return status === "succeeded" || status === "failed" || status === "skipped" || status === "canceled";
}

function stableTextHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function createReleasePipelineInputSnapshot(project: DesignerProject): ReleasePipelineStepInputSnapshot {
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

function createReleasePipelineEnvironment(): ReleasePipelineStepEnvironment {
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

function createReleasePipelineCommandArgs(task: ProjectTaskEntry): ReleasePipelineStepCommandArgs {
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

function releasePipelineArtifactEvidenceFromInspection(
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

async function inspectReleasePipelineArtifactEvidence(path?: string): Promise<ReleasePipelineStepArtifactEvidence | undefined> {
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
      summary: `Artifact inspection failed: ${String(error)}`,
      checkedAt: new Date().toISOString(),
    };
  }
}

type ProjectDependencyValidityView = ProjectDependencyGraphValidityEntry & {
  validityStatus: "valid" | "stale" | "needs-preview" | "failed";
  invalidatedByCurrentScopes: string[];
  statusSummary: string;
};

const dependencyValidityDefinitions: Record<
  string,
  { label: string; scopeIds: string[] }
> = {
  "frontend-check": {
    label: "Frontend check",
    scopeIds: ["ui", "frontend", "assets", "validation"],
  },
  "rust-check": {
    label: "Rust check",
    scopeIds: ["rust", "backend", "release"],
  },
  "all-check": {
    label: "All quick checks",
    scopeIds: ["ui", "frontend", "assets", "validation", "rust", "backend", "release"],
  },
  validation: {
    label: "Window validation",
    scopeIds: ["ui", "frontend", "assets", "validation"],
  },
  build: {
    label: "Release exe build",
    scopeIds: ["project", "ui", "frontend", "assets", "rust", "backend", "release", "validation"],
  },
  bundle: {
    label: "Installer bundle",
    scopeIds: ["project", "ui", "frontend", "assets", "rust", "backend", "release", "validation"],
  },
};

function dependencyValidityKindsForEvent(event: ProjectDependencyGraphEvent) {
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
  return [];
}

function intersectsScopeIds(left: string[], right: string[]) {
  return left.some((scope) => right.includes(scope));
}

function dirtyScopeIdsForImpact(impact: ProjectChangeImpactSummary) {
  return impact.scopes.filter((scope) => scope.status === "dirty").map((scope) => scope.id);
}

function updateDependencyValidityCache(
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

function projectDependencyValidityViews(
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
    const needsPreview = entry.snapshotHash !== currentSnapshotHash && (impact.status === "needs-preview" || impact.status === "stale");
    const stale = Boolean(entry.invalidatedAt) || invalidatedByCurrentScopes.length > 0;
    const validityStatus: ProjectDependencyValidityView["validityStatus"] = failed
      ? "failed"
      : stale
        ? "stale"
        : needsPreview
          ? "needs-preview"
          : "valid";
    const statusSummary =
      validityStatus === "failed"
        ? `${entry.label} last ${entry.resultStatus}.`
        : validityStatus === "stale"
          ? `${entry.label} is stale for ${[...(entry.invalidatedScopeIds ?? []), ...invalidatedByCurrentScopes].filter(Boolean).slice(0, 4).join(", ") || "changed scopes"}.`
          : validityStatus === "needs-preview"
            ? `${entry.label} needs a fresh impact preview before Nova can prove it is still valid.`
            : `${entry.label} is valid for the current known scopes.`;
    return {
      ...entry,
      validityStatus,
      invalidatedByCurrentScopes,
      statusSummary,
    };
  });
}

function projectDependencyGraphSourceRefs(record: ProjectDependencyGraphRecord | null): ProjectDependencySourceReference[] {
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

function createProjectDependencyGraphRecord(
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
    summary: `${impact.summary} Last event: ${lastEvent.kind}${lastEvent.status ? ` (${lastEvent.status})` : ""}.`,
  };
}

function releasePipelineStepFromTask(task: ProjectTaskEntry): ReleasePipelineStep {
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

function summarizeReleasePipelineEntry(entry: ReleasePipelineEntry, steps: ReleasePipelineStep[]): ReleasePipelineEntry {
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
      ? `Running ${runningStep.title} (${terminalCount}/${steps.length} finished).`
      : status === "failed"
        ? `${failedCount} of ${steps.length} step(s) failed.`
        : status === "canceled"
          ? `${canceledCount} of ${steps.length} step(s) canceled.`
          : status === "skipped"
            ? `All ${steps.length} step(s) were skipped.`
            : status === "succeeded"
              ? `Completed ${succeededCount} step(s), skipped ${skippedCount}.`
              : `Queued ${steps.length} release pipeline step(s).`;

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

function createReleasePipelineEntry(
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
      summary: `Queued ${steps.length} release pipeline step(s).`,
      steps,
    },
    steps,
  );
}

function updateReleasePipelineEntryWithTask(entry: ReleasePipelineEntry, task: ProjectTaskEntry): ReleasePipelineEntry {
  const nextStep = releasePipelineStepFromTask(task);
  const stepIndex = Math.max(0, Math.min(task.pipelineStepIndex ?? entry.steps.findIndex((step) => step.taskId === task.id), entry.steps.length - 1));
  const steps = entry.steps.map((step, index) => {
    const taskMatches = step.taskId && step.taskId === task.id;
    const indexMatches = index === stepIndex;
    return taskMatches || indexMatches ? { ...step, ...nextStep, id: step.id || nextStep.id } : step;
  });
  return summarizeReleasePipelineEntry(entry, steps);
}

function activityTimeValue(value: string) {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function projectActivityTimeline(project: DesignerProject, checkpoints: EditorProjectCheckpoint[]): ProjectActivityEntry[] {
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
      title: entry.buildKind === "bundle" ? "Bundle build" : "Executable build",
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
        title: "Run session",
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
        title: "Runtime Console",
        status: entry.runtimeLogTruncated ? "truncated" : "ready",
        summary: entry.runtimeLogSizeBytes ? `${entry.runtimeLogSizeBytes} bytes captured` : "Runtime log captured",
        path: entry.runtimeLogPath,
      });
    }

    if (entry.installerSmokeStatus) {
      activities.push({
        id: `smoke-${entry.id}-${entry.installerSmokeFinishedAt ?? entry.createdAt}`,
        time: entry.installerSmokeFinishedAt || entry.createdAt,
        kind: "smoke",
        title: "Installer smoke",
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
      title: "Window validation",
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
      summary: `${entry.propertyCount} properties · ${entry.itemCount} controls · ${entry.manualIssueCount} manual`,
    });
  }

  for (const checkpoint of checkpoints) {
    activities.push({
      id: `checkpoint-${checkpoint.id}`,
      time: checkpoint.created_at,
      kind: "checkpoint",
      title: "Disk checkpoint",
      status: "saved",
      summary: `${checkpoint.label} · ${checkpoint.file_count} UI · ${checkpoint.command_count} commands`,
      path: checkpoint.path,
    });
  }

  return activities
    .filter((activity) => activity.time)
    .sort((a, b) => activityTimeValue(b.time) - activityTimeValue(a.time))
    .slice(0, 24);
}

function releaseReadinessDashboard(
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
    "Build preflight",
    readiness.errorCount > 0
      ? `${readiness.errorCount} blocking issue(s) must be fixed before compiling.`
      : readiness.warningCount > 0
        ? `${readiness.warningCount} warning(s) remain before release.`
        : "Project structure, Rust commands, assets, and release config are ready.",
    readiness.score,
  );

  addItem(
    visualAudit.errorCount > 0 ? "error" : visualAudit.warningCount > 0 ? "warning" : "ready",
    "visual",
    "Window visual audit",
    visualAudit.errorCount > 0
      ? `${visualAudit.errorCount} visual blocking issue(s) found.`
      : visualAudit.warningCount > 0
        ? `${visualAudit.warningCount} visual warning(s) should be reviewed.`
        : "No obvious clipping, overlap, or sizing problems in the target window.",
    visualAudit.score,
  );

  addItem(
    !latestValidation ? "warning" : latestValidation.status === "failed" ? "error" : latestValidation.status === "warning" ? "warning" : "ready",
    "validation",
    "Generated window validation",
    !latestValidation
      ? "Run generated-window validation before packaging a release."
      : `${latestValidation.status} · ${latestValidation.summary}`,
    latestValidation ? latestValidation.score : 45,
  );

  addItem(
    !latestBuild ? "warning" : latestBuild.readinessErrors > 0 ? "error" : latestBuild.readinessWarnings > 0 ? "warning" : "ready",
    "artifact",
    "Build artifact",
    !latestBuild
      ? "No successful exe or bundle build recorded yet."
      : `${latestBuild.label} · ${latestBuild.releaseAppName} v${latestBuild.releaseVersion}`,
    latestBuild ? Math.min(latestBuild.readinessScore, latestBuild.visualScore) : 35,
  );

  addItem(
    project.releaseConfig.signingMode === "unsigned" ? "warning" : signingReady ? "ready" : "error",
    "signing",
    "Release signing",
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
    "Bundle and smoke evidence",
    !latestBundle
      ? "Run a full bundle build to collect installer artifacts and smoke evidence."
      : `${latestBundle.bundleArtifactCount ?? latestBundle.bundlePaths?.length ?? 0} artifact(s) · smoke ${smokeStatus ?? "unknown"}`,
    !latestBundle ? 40 : smokeStatus === "failed" ? 0 : smokeStatus === "pending" || smokeStatus === "not-requested" ? 70 : 100,
  );

  addItem(
    !latestRun ? "warning" : latestRun.runStatus === "stale" || latestRun.runStatus === "unknown" ? "warning" : "ready",
    "runtime",
    "Runtime run session",
    !latestRun
      ? "Launch the generated exe once from Nova to verify the runtime loop."
      : latestRun.runtimeLogPath
        ? `${latestRun.runStatus ?? "launched"} · runtime log captured`
        : `${latestRun.runStatus ?? "launched"} · no runtime log preview yet`,
    !latestRun ? 45 : latestRun.runtimeLogPath ? 100 : 80,
  );

  addItem(
    checkpointCount > 0 ? "ready" : "warning",
    "checkpoint",
    "Recovery checkpoint",
    checkpointCount > 0 ? `${checkpointCount} disk checkpoint(s) available for rollback.` : "Create a disk checkpoint before major release changes.",
    checkpointCount > 0 ? 100 : 65,
  );

  addItem(
    activityCount > 0 ? "ready" : "warning",
    "traceability",
    "Project traceability",
    activityCount > 0 ? `${activityCount} recent activity event(s) recorded.` : "Run validation, build, or checkpoint actions to create an audit trail.",
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

function simulatorStateFromProject(project: DesignerProject) {
  return Object.fromEntries(project.stateVariables.map((state) => [state.id, state.initialValue || ""])) as Record<string, string>;
}

function compactJson(value: unknown) {
  if (value === undefined) {
    return "";
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function simulatorStateValuesForArgs(
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

function simulatorRunMessage(commandResponse: string | undefined, eventName: BuilderEventName, commandName: string) {
  const response = commandResponse?.trim() || DEFAULT_RUST_COMMAND_RESPONSE;
  return `${response} completed for ${eventName} -> ${commandName}.`;
}

function prettyJson(value: unknown) {
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

function parseJsonEditorValue(value: string, label: string): { value: unknown; error?: string } {
  try {
    return { value: value.trim() ? JSON.parse(value) : {} };
  } catch (error) {
    return {
      value: null,
      error: `${label} JSON is invalid: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeBackendSchemaType(value: unknown): BackendSchemaFieldType {
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

function backendSchemaIsJsonSchema(schema: unknown) {
  return isPlainRecord(schema) && (typeof schema.type === "string" || isPlainRecord(schema.properties) || Array.isArray(schema.required));
}

function backendSchemaIsLegacyPayloadEnvelope(schema: unknown) {
  return (
    isPlainRecord(schema) &&
    Object.keys(schema).length === 1 &&
    normalizeBackendSchemaType(schema.payload) === "object"
  );
}

function backendSchemaDescription(definition: unknown) {
  return isPlainRecord(definition) && typeof definition.description === "string" ? definition.description : "";
}

function backendSchemaEnumValues(definition: unknown) {
  if (!isPlainRecord(definition) || !Array.isArray(definition.enum)) {
    return undefined;
  }
  const values = definition.enum
    .map((value) => (typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : ""))
    .filter(Boolean);
  return values.length ? values : undefined;
}

function backendSchemaDefaultValue(type: BackendSchemaFieldType, definition?: unknown): unknown {
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

function backendFieldInputValue(value: unknown, type: BackendSchemaFieldType) {
  if (value === undefined) {
    return "";
  }
  if (type === "object" || type === "array" || type === "json") {
    return prettyJson(value);
  }
  return String(value);
}

function parseBackendFieldInput(type: BackendSchemaFieldType, raw: string): unknown {
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

function valueAtPath(value: unknown, path: string[]) {
  return path.reduce<unknown>((current, segment) => {
    if (!isPlainRecord(current)) {
      return undefined;
    }
    return current[segment];
  }, value);
}

function hasValueAtPath(value: unknown, path: string[]) {
  let current = value;
  for (const segment of path) {
    if (!isPlainRecord(current) || !Object.prototype.hasOwnProperty.call(current, segment)) {
      return false;
    }
    current = current[segment];
  }
  return true;
}

function setValueAtPath(value: Record<string, unknown>, path: string[], nextValue: unknown) {
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

function backendFieldFromSchema(
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

function backendSchemaFieldsFromValues(schema: unknown, sample: unknown): BackendSchemaField[] {
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

function backendSchemaFields(schemaText: string, sampleText: string) {
  const schemaResult = parseJsonEditorValue(schemaText, "Request schema");
  const sampleResult = parseJsonEditorValue(sampleText, "Sample payload");
  if (schemaResult.error || sampleResult.error) {
    return [];
  }
  return backendSchemaFieldsFromValues(schemaResult.value, sampleResult.value).slice(0, 12);
}

function samplePayloadFromBackendSchema(schemaText: string, existingSampleText: string) {
  const schemaResult = parseJsonEditorValue(schemaText, "Request schema");
  const sampleResult = parseJsonEditorValue(existingSampleText, "Sample payload");
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

function backendValueMatchesType(value: unknown, type: BackendSchemaFieldType) {
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

function validateBackendJsonSchemaValue(value: unknown, schema: Record<string, unknown>, label: string): string[] {
  const rootType = normalizeBackendSchemaType(schema.type ?? (isPlainRecord(schema.properties) ? "object" : "json"));
  const issues: string[] = [];
  if (!backendValueMatchesType(value, rootType)) {
    issues.push(`${label} should be ${rootType}.`);
    return issues;
  }
  const enumValues = backendSchemaEnumValues(schema);
  if (enumValues?.length && !enumValues.includes(String(value))) {
    issues.push(`${label} should be one of ${enumValues.join(", ")}.`);
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
      issues.push(`${label}.${name} is required.`);
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
      issues.push(`${label}.${name} should be ${type}.`);
    }
  }
  return issues;
}

function validateBackendSchemaValue(value: unknown, schema: unknown, label: string): string[] {
  if (backendSchemaIsLegacyPayloadEnvelope(schema)) {
    return isPlainRecord(value) ? [] : [`${label} should be an object payload.`];
  }
  if (backendSchemaIsJsonSchema(schema)) {
    return validateBackendJsonSchemaValue(value, schema as Record<string, unknown>, label);
  }
  if (isPlainRecord(schema)) {
    if (!isPlainRecord(value)) {
      return [`${label} should be an object.`];
    }
    return Object.entries(schema).flatMap(([name, definition]) => {
      const type = normalizeBackendSchemaType(isPlainRecord(definition) ? definition.type ?? definition : definition);
      if (!Object.prototype.hasOwnProperty.call(value, name)) {
        return [`${label}.${name} is required.`];
      }
      return backendValueMatchesType(value[name], type) ? [] : [`${label}.${name} should be ${type}.`];
    });
  }
  return [];
}

function backendSchemaFieldIssues(field: BackendSchemaField, issues: string[]) {
  const label = `Sample payload.${field.name}`;
  return issues.filter((issue) => issue.startsWith(label) || issue.includes(`.${field.name} `) || issue.includes(`.${field.name} is`));
}

function backendPayloadFieldsForEvent(fields: BackendSchemaField[], item: BuilderItem): BuilderEventPayloadField[] {
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

function backendResponseSchemaHasPatch(schemaText: string) {
  const result = parseJsonEditorValue(schemaText, "Response schema");
  if (result.error) {
    return false;
  }
  const schema = result.value;
  if (backendSchemaIsJsonSchema(schema) && isPlainRecord(schema) && isPlainRecord(schema.properties)) {
    return Object.prototype.hasOwnProperty.call(schema.properties, "patch");
  }
  return isPlainRecord(schema) && Object.prototype.hasOwnProperty.call(schema, "patch");
}

function backendMethodRequestEnvelope(method: BackendIntegrationMethod, payload: unknown) {
  return {
    methodId: method.id,
    method: method.name,
    operation: method.operation,
    path: method.path,
    payload,
  };
}

function backendMethodLocalValidationRecord(
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

async function invokeIfAvailable<T>(command: string, args: Record<string, unknown>): Promise<T | null> {
  if (!isTauriRuntime()) {
    return null;
  }

  return invoke<T>(command, args);
}

function cloneDesignerProject(project: DesignerProject): DesignerProject {
  return JSON.parse(JSON.stringify(project)) as DesignerProject;
}

function projectSnapshotFingerprint(project: DesignerProject) {
  const snapshot = cloneDesignerProject(project);
  snapshot.updatedAt = "";
  snapshot.files = snapshot.files.map((file) => ({
    ...file,
    updatedAt: "",
  }));
  return JSON.stringify(snapshot);
}

function formatProjectSnapshotTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "刚刚";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatSignedDelta(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function checkpointDiffSummary(diff: EditorProjectCheckpointDiff) {
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

function checkpointDiffDetails(diff: EditorProjectCheckpointDiff) {
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

export function BuilderShowcase() {
  const [workspace, setWorkspace] = useState<DesignerWorkspace>(() => getInitialDesignerWorkspace());
  const activeProject = useMemo(
    () => workspace.projects.find((project) => project.id === workspace.activeProjectId) ?? workspace.projects[0],
    [workspace],
  );
  const latestRunSessionEntry = useMemo(
    () =>
      (activeProject.buildHistory ?? []).find((entry) => entry.outputExePath && entry.launchedPid && entry.runStatus === "running") ??
      (activeProject.buildHistory ?? []).find((entry) => entry.outputExePath && entry.launchedPid) ??
      null,
    [activeProject.buildHistory],
  );
  const activeFile = useMemo(
    () => activeProject.files.find((file) => file.id === activeProject.activeFileId) ?? activeProject.files[0],
    [activeProject],
  );
  const sourcePage = activeFile.page;
  const activeBreakpoint = normalizeBreakpoint(sourcePage.activeBreakpoint);
  const page = useMemo(() => getEffectivePage(sourcePage), [sourcePage]);
  const baseItems = activeFile.items;
  const items = useMemo(() => resolveItemsForBreakpoint(baseItems, activeBreakpoint), [baseItems, activeBreakpoint]);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => (activeFile.items[0]?.id ? [activeFile.items[0].id] : []));
  const [selectedProjectTemplateId, setSelectedProjectTemplateId] = useState<ProjectTemplateId>("dashboard");
  const [mode, setMode] = useState<BuilderMode>("design");
  const [leftDockTab, setLeftDockTab] = useState<BuilderLeftDockTab>("project");
  const [rightDockTab, setRightDockTab] = useState<BuilderRightDockTab>("properties");
  const [bottomDockTab, setBottomDockTab] = useState<BuilderBottomDockTab>("issues");
  const [bottomDockExpanded, setBottomDockExpanded] = useState(false);
  const [bottomDockMinimized, setBottomDockMinimized] = useState(false);
  const openBottomDock = (tab: BuilderBottomDockTab, expanded = true) => {
    setBottomDockTab(tab);
    setBottomDockExpanded(expanded);
    setBottomDockMinimized(false);
  };
  const [selectedBuildDiagnosticKey, setSelectedBuildDiagnosticKey] = useState("");
  const [canvasPanMode, setCanvasPanMode] = useState(false);
  const [spacePanActive, setSpacePanActive] = useState(false);
  const [palettePointerDrag, setPalettePointerDrag] = useState<PalettePointerDrag | null>(null);
  const [exportKind, setExportKind] = useState<"json" | "jsx">("json");
  const [copied, setCopied] = useState(false);
  const [copiedArtifactPath, setCopiedArtifactPath] = useState("");
  const [saved, setSaved] = useState(false);
  const [diskBusy, setDiskBusy] = useState(false);
  const [refreshingPipelineRecords, setRefreshingPipelineRecords] = useState(false);
  const [building, setBuilding] = useState(false);
  const [bundling, setBundling] = useState(false);
  const [checkingTarget, setCheckingTarget] = useState<"frontend" | "rust" | "all" | null>(null);
  const [validatingWindow, setValidatingWindow] = useState(false);
  const [previewingGeneratedFiles, setPreviewingGeneratedFiles] = useState(false);
  const [applyingGeneratedFiles, setApplyingGeneratedFiles] = useState(false);
  const [generatedFilePreview, setGeneratedFilePreview] = useState<GeneratedFilePreviewResult | null>(null);
  const [generatedFilePreviewSnapshotHash, setGeneratedFilePreviewSnapshotHash] = useState("");
  const [activeGeneratedPreviewPath, setActiveGeneratedPreviewPath] = useState("");
  const [selectedGeneratedPreviewPaths, setSelectedGeneratedPreviewPaths] = useState<string[]>([]);
  const [generatedFileApplyResult, setGeneratedFileApplyResult] = useState<ApplyGeneratedFilesResult | null>(null);
  const [projectDependencyGraph, setProjectDependencyGraph] = useState<ProjectDependencyGraphRecord | null>(null);
  const [refreshingDependencyGraph, setRefreshingDependencyGraph] = useState(false);
  const [writingDependencyGraph, setWritingDependencyGraph] = useState(false);
  const [backendArtifactInspection, setBackendArtifactInspection] = useState<BackendArtifactInspectionResult | null>(null);
  const [checkingBackendArtifacts, setCheckingBackendArtifacts] = useState(false);
  const [buildingBackendArtifactId, setBuildingBackendArtifactId] = useState("");
  const [backendArtifactBuildResult, setBackendArtifactBuildResult] = useState<BackendArtifactBuildResult | null>(null);
  const [runningSmokeId, setRunningSmokeId] = useState("");
  const [checkingCertificateStore, setCheckingCertificateStore] = useState(false);
  const [certificateInspection, setCertificateInspection] = useState<WindowsCertificateInspectionResult | null>(null);
  const [creatingSandboxHandoffId, setCreatingSandboxHandoffId] = useState("");
  const [launchingExeId, setLaunchingExeId] = useState("");
  const [checkingRunId, setCheckingRunId] = useState("");
  const [stoppingRunId, setStoppingRunId] = useState("");
  const [workflowRuntimeSession, setWorkflowRuntimeSession] = useState<WorkflowRuntimeSession | null>(null);
  const [readingRuntimeLogId, setReadingRuntimeLogId] = useState("");
  const [testingBackendMethodId, setTestingBackendMethodId] = useState("");
  const [buildError, setBuildError] = useState("");
  const [managedProjects, setManagedProjects] = useState<ManagedProjectSummary[]>([]);
  const [diskCheckpoints, setDiskCheckpoints] = useState<EditorProjectCheckpoint[]>([]);
  const activityTimeline = useMemo(() => projectActivityTimeline(activeProject, diskCheckpoints), [activeProject, diskCheckpoints]);
  const [checkpointDiff, setCheckpointDiff] = useState<EditorProjectCheckpointDiff | null>(null);
  const [checkpointDiffLoadingId, setCheckpointDiffLoadingId] = useState("");
  const [checkpointLabel, setCheckpointLabel] = useState("");
  const [projectJumpQuery, setProjectJumpQuery] = useState("");
  const [projectJumpFocused, setProjectJumpFocused] = useState(false);
  const [projectJumpActiveIndex, setProjectJumpActiveIndex] = useState(0);
  const [projectJumpRecentIds, setProjectJumpRecentIds] = useState<string[]>(() => loadProjectJumpRecentIds());
  const [projectTasks, setProjectTasks] = useState<ProjectTaskEntry[]>(() => loadInitialProjectTaskHistory());
  const [projectTaskSearchQuery, setProjectTaskSearchQuery] = useState("");
  const [projectTaskStatusFilter, setProjectTaskStatusFilter] = useState<ProjectTaskStatusFilter>("all");
  const [projectTaskKindFilter, setProjectTaskKindFilter] = useState<ProjectTaskKindFilter>("all");
  const [selectedProjectTaskId, setSelectedProjectTaskId] = useState("");
  const [projectTaskLogSearchQuery, setProjectTaskLogSearchQuery] = useState("");
  const [projectTaskQueuePaused, setProjectTaskQueuePaused] = useState(() => loadProjectTaskQueueState().paused);
  const [projectTaskQueueVersion, setProjectTaskQueueVersion] = useState(0);
  const [customProjectActionPresets, setCustomProjectActionPresets] = useState<ProjectActionPresetDefinition[]>(() => loadProjectActionPresets());
  const [destructiveAction, setDestructiveAction] = useState<DestructiveActionRequest | null>(null);
  const [customPresetTitle, setCustomPresetTitle] = useState("Custom release flow");
  const [customPresetDetail, setCustomPresetDetail] = useState("Reusable project build flow.");
  const [customPresetDraftActionId, setCustomPresetDraftActionId] = useState<ProjectJumpActionId>("save-project");
  const [customPresetDraftActions, setCustomPresetDraftActions] = useState<ProjectJumpActionId[]>(["save-project", "quick-check-all"]);
  const [replaceTemplateOpen, setReplaceTemplateOpen] = useState(false);
  const [simulatorStateValues, setSimulatorStateValues] = useState<Record<string, string>>(() => simulatorStateFromProject(activeProject));
  const [simulatorTrace, setSimulatorTrace] = useState<SimulatorTraceEntry[]>([]);
  const [dragSession, setDragSession] = useState<DragSession | null>(null);
  const [dropIntent, setDropIntent] = useState<BuilderDropIntent | null>(null);
  useEffect(() => {
    setWorkflowRuntimeSession(null);
  }, [activeProject.id]);
  const [rustDiagnosticTarget, setRustDiagnosticTarget] = useState<{
    file?: string;
    sourceFile?: string;
    sourceKind?: string;
    sourceSummary?: string;
    message: string;
    generatedLine: number;
    sourceLine: number;
    column: number;
    mappedToSource: boolean;
  } | null>(null);
  const [rustEditorScrollTop, setRustEditorScrollTop] = useState(0);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [projectSnapshotVersion, setProjectSnapshotVersion] = useState(0);
  const [clipboardVersion, setClipboardVersion] = useState(0);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const canvasViewportRef = useRef<HTMLDivElement | null>(null);
  const projectJumpInputRef = useRef<HTMLInputElement | null>(null);
  const rustLogicRef = useRef<HTMLTextAreaElement | null>(null);
  const itemsRef = useRef<BuilderItem[]>(items);
  const historyRef = useRef<Record<string, HistoryEntry>>({});
  const projectSnapshotsRef = useRef<Record<string, ProjectSnapshotEntry[]>>({});
  const clipboardRef = useRef<BuilderItem[]>([]);
  const palettePointerDragRef = useRef<PalettePointerDrag | null>(null);
  const suppressPaletteClickRef = useRef(false);
  const canvasPanSessionRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startScrollLeft: number;
    startScrollTop: number;
  } | null>(null);
  const projectTaskQueueRef = useRef<ProjectTaskEntry[]>(loadProjectTaskQueueState().tasks);
  const projectTaskQueuePausedRef = useRef(projectTaskQueuePaused);
  const projectTaskRunnerRef = useRef<Promise<void> | null>(null);
  const releasePipelineEntriesRef = useRef<Record<string, ReleasePipelineEntry>>({});
  const activeProjectRef = useRef(activeProject);
  const projectChangeImpactRef = useRef<ProjectChangeImpactSummary | null>(null);
  const projectDependencyGraphRef = useRef<ProjectDependencyGraphRecord | null>(null);
  const restoredProjectTaskQueueRef = useRef(false);
  const activeProjectTasks = useMemo(
    () => projectTasks.filter((task) => !task.projectId || task.projectId === activeProject.id),
    [activeProject.id, projectTasks],
  );
  const visibleProjectTasks = useMemo(
    () => filterProjectTasks(activeProjectTasks, projectTaskStatusFilter, projectTaskKindFilter, projectTaskSearchQuery),
    [activeProjectTasks, projectTaskKindFilter, projectTaskSearchQuery, projectTaskStatusFilter],
  );
  const selectedProjectTask = useMemo(
    () =>
      visibleProjectTasks.find((task) => task.id === selectedProjectTaskId) ??
      visibleProjectTasks[0] ??
      null,
    [selectedProjectTaskId, visibleProjectTasks],
  );
  const selectedProjectTaskLogLines = useMemo(
    () => projectTaskLogLines(selectedProjectTask?.logPreview, projectTaskLogSearchQuery),
    [projectTaskLogSearchQuery, selectedProjectTask?.logPreview],
  );
  const selectedProjectTaskLogMatchCount = useMemo(
    () => selectedProjectTaskLogLines.filter((line) => line.matched).length,
    [selectedProjectTaskLogLines],
  );
  const runningProjectTask = useMemo(() => activeProjectTasks.find((task) => task.status === "running") ?? null, [activeProjectTasks]);
  const queuedProjectTaskCount = useMemo(() => activeProjectTasks.filter((task) => task.status === "queued").length, [activeProjectTasks]);
  const localQueuedProjectTasks = useMemo(
    () => projectTaskQueueRef.current.filter((task) => !task.projectId || task.projectId === activeProject.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeProject.id, projectTaskQueueVersion],
  );
  const failedProjectTaskCount = useMemo(() => activeProjectTasks.filter((task) => task.status === "failed").length, [activeProjectTasks]);
  const completedProjectTaskCount = useMemo(
    () => activeProjectTasks.filter((task) => ["succeeded", "failed", "skipped", "canceled"].includes(task.status)).length,
    [activeProjectTasks],
  );
  const latestQueuedProjectTask = useMemo(
    () =>
      activeProjectTasks
        .filter((task) => task.status === "queued")
        .reduce<ProjectTaskEntry | null>(
          (latest, task) => (!latest || projectTaskTimestamp(task) > projectTaskTimestamp(latest) ? task : latest),
          null,
        ),
    [activeProjectTasks],
  );
  const latestFailedProjectTask = useMemo(
    () =>
      activeProjectTasks
        .filter((task) => task.status === "failed")
        .reduce<ProjectTaskEntry | null>(
          (latest, task) => (!latest || projectTaskTimestamp(task) > projectTaskTimestamp(latest) ? task : latest),
          null,
        ),
    [activeProjectTasks],
  );
  const latestProjectTask = useMemo(
    () =>
      activeProjectTasks.reduce<ProjectTaskEntry | null>(
        (latest, task) => (!latest || projectTaskTimestamp(task) > projectTaskTimestamp(latest) ? task : latest),
        null,
      ),
    [activeProjectTasks],
  );
  const operationMonitorTask = runningProjectTask ?? latestQueuedProjectTask ?? latestFailedProjectTask ?? latestProjectTask;
  const allProjectActionPresets = useMemo(
    () => [...projectActionPresets, ...customProjectActionPresets],
    [customProjectActionPresets],
  );
  const latestReleasePipeline = activeProject.releasePipelineHistory?.[0] ?? null;
  const canSaveCustomPreset = customPresetTitle.trim().length > 0 && customPresetDraftActions.length > 0;

  const selectedId = selectedIds[0] ?? "";
  const setSelectedId = (id: string) => setSelectedIds(id ? [id] : []);
  const selectedItems = useMemo(
    () => selectedIds.map((id) => items.find((item) => item.id === id)).filter((item): item is BuilderItem => Boolean(item)),
    [items, selectedIds],
  );
  const selectedItem = selectedItems.length === 1 ? selectedItems[0] : null;
  const selectedBaseItem = selectedItem ? baseItems.find((item) => item.id === selectedItem.id) ?? null : null;
  const selectedProjectTemplate = useMemo(() => projectTemplateById(selectedProjectTemplateId), [selectedProjectTemplateId]);
  const selectedBreakpointOverride =
    selectedBaseItem && activeBreakpoint !== "desktop" ? selectedBaseItem.responsive?.[activeBreakpoint] ?? null : null;
  const activeRustCommand =
    activeProject.rustCommands.find((command) => command.id === activeProject.activeRustCommandId) ??
    activeProject.rustCommands[0] ??
    DEFAULT_RUST_COMMANDS[0];
  const activeRustModule =
    activeProject.rustModules.find((module) => module.id === activeProject.activeRustModuleId) ??
    activeProject.rustModules[0] ??
    createRustModule(0);
  const activeCargoDependency =
    activeProject.cargoDependencies.find((dependency) => dependency.id === activeProject.activeCargoDependencyId) ??
    activeProject.cargoDependencies[0] ??
    createCargoDependency(0);
  const activeBackendIntegration =
    activeProject.backendIntegrations.find((integration) => integration.id === activeProject.activeBackendIntegrationId) ??
    activeProject.backendIntegrations[0] ??
    createBackendIntegration(0);
  const backendArtifactInspectionKey = useMemo(
    () =>
      JSON.stringify({
        projectId: activeProject.id,
        rootPath: activeProject.rootPath ?? "",
        backendIntegrations: activeProject.backendIntegrations.map((integration) => ({
          id: integration.id,
          kind: integration.kind,
          language: integration.language,
          transport: integration.transport,
          artifactPath: integration.artifactPath,
          resourcePath: integration.resourcePath,
          bundleResource: integration.bundleResource,
          enabled: integration.enabled,
        })),
      }),
    [activeProject.backendIntegrations, activeProject.id, activeProject.rootPath],
  );
  const activeBackendArtifactInspection = useMemo(
    () => backendArtifactInspection?.entries.find((entry) => entry.integration_id === activeBackendIntegration.id) ?? null,
    [activeBackendIntegration.id, backendArtifactInspection],
  );
  const activeBackendArtifactBuildResult = useMemo(
    () => (backendArtifactBuildResult?.integration_id === activeBackendIntegration.id ? backendArtifactBuildResult : null),
    [activeBackendIntegration.id, backendArtifactBuildResult],
  );
  const activeBackendIntegrationMethod = activeBackendMethod(activeBackendIntegration) ?? createBackendIntegrationMethod(0);
  const activeBackendMethodFields = useMemo(
    () => backendSchemaFields(activeBackendIntegrationMethod.requestSchema, activeBackendIntegrationMethod.samplePayload),
    [activeBackendIntegrationMethod.requestSchema, activeBackendIntegrationMethod.samplePayload],
  );
  const activeBackendPayloadMapping = useMemo(
    () => (selectedItem ? backendPayloadFieldsForEvent(activeBackendMethodFields, selectedItem) : []),
    [activeBackendMethodFields, selectedItem],
  );
  const activeBackendResponsePatchEnabled = useMemo(
    () => backendResponseSchemaHasPatch(activeBackendIntegrationMethod.responseSchema),
    [activeBackendIntegrationMethod.responseSchema],
  );
  const activeBackendRequestValidationIssues = useMemo(() => {
    const requestSchemaResult = parseJsonEditorValue(activeBackendIntegrationMethod.requestSchema, "Request schema");
    const sampleResult = parseJsonEditorValue(activeBackendIntegrationMethod.samplePayload, "Sample payload");
    if (requestSchemaResult.error || sampleResult.error) {
      return [requestSchemaResult.error, sampleResult.error].filter(Boolean) as string[];
    }
    return validateBackendSchemaValue(sampleResult.value, requestSchemaResult.value, "Sample payload");
  }, [activeBackendIntegrationMethod.requestSchema, activeBackendIntegrationMethod.samplePayload]);
  const activeBackendResponseValidationIssues = useMemo(() => {
    const responseSchemaResult = parseJsonEditorValue(activeBackendIntegrationMethod.responseSchema, "Response schema");
    const responseResult = parseJsonEditorValue(activeBackendIntegrationMethod.lastTest?.response ?? "", "Last response");
    if (responseSchemaResult.error || responseResult.error || !activeBackendIntegrationMethod.lastTest?.response) {
      return [];
    }
    const responseValue = isPlainRecord(responseResult.value) && Object.prototype.hasOwnProperty.call(responseResult.value, "response")
      ? responseResult.value.response
      : responseResult.value;
    return validateBackendSchemaValue(responseValue, responseSchemaResult.value, "Response");
  }, [activeBackendIntegrationMethod.lastTest?.response, activeBackendIntegrationMethod.responseSchema]);
  const activeRustCommandBackendIntegration = activeRustCommand.backendIntegrationId
    ? activeProject.backendIntegrations.find((integration) => integration.id === activeRustCommand.backendIntegrationId)
    : null;
  const activeStateVariable =
    activeProject.stateVariables.find((state) => state.id === activeProject.activeStateVariableId) ??
    activeProject.stateVariables[0] ??
    createStateVariable(1);
  const sortedItems = useMemo(() => [...items].sort((a, b) => a.z - b.z), [items]);
  const baseSortedItems = useMemo(() => [...baseItems].sort((a, b) => a.z - b.z), [baseItems]);
  const topLevelItems = useMemo(() => sortedItems.filter((item) => !item.parentId), [sortedItems]);
  const treeRows = useMemo(() => buildTreeRows(items), [items]);
  const combinedBuildLog = useMemo(() => [activeProject.buildLog, buildError].filter(Boolean).join("\n"), [activeProject.buildLog, buildError]);
  const activeRustSourceMap = useMemo(
    () => normalizeGeneratedRustSourceMap(activeProject.rustSourceMap) ?? parseRustSourceMapFromLog(combinedBuildLog),
    [activeProject.rustSourceMap, combinedBuildLog],
  );
  const buildDiagnostics = useMemo(
    () => parseBuildDiagnostics(combinedBuildLog, activeRustSourceMap),
    [combinedBuildLog, activeRustSourceMap],
  );
  const selectedBuildDiagnostic = useMemo(() => {
    if (buildDiagnostics.length === 0) {
      return null;
    }
    return (
      buildDiagnostics.find((diagnostic, index) => buildDiagnosticKey(diagnostic, index) === selectedBuildDiagnosticKey) ??
      buildDiagnostics[0]
    );
  }, [buildDiagnostics, selectedBuildDiagnosticKey]);
  const rustEditorLines = useMemo(() => activeProject.rustLogic.split(/\r?\n/), [activeProject.rustLogic]);
  const rustDiagnosticsBySourceLine = useMemo(() => {
    const diagnosticsByLine = new Map<number, BuildDiagnostic[]>();
    for (const diagnostic of buildDiagnostics) {
      const location = rustDiagnosticSourceLocation(diagnostic, activeProject.rustLogic);
      if (!location) {
        continue;
      }
      const existing = diagnosticsByLine.get(location.sourceLine) ?? [];
      diagnosticsByLine.set(location.sourceLine, [...existing, diagnostic]);
    }
    return diagnosticsByLine;
  }, [activeProject.rustLogic, buildDiagnostics]);
  const buildReadinessSummary = useMemo(
    () => buildReadiness(activeProject, isTauriRuntime(), backendArtifactInspection),
    [activeProject, backendArtifactInspection],
  );
  const windowVisualAudit = useMemo(() => auditProjectWindows(activeProject), [activeProject]);
  const breakpointIssues = activeProject.validationBreakpointIssues ?? [];
  const fixableBreakpointIssueCount = useMemo(
    () =>
      breakpointIssues.filter((issue) =>
        Boolean(issue.itemId && activeProject.files.some((file) => file.id === issue.fileId && file.items.some((item) => item.id === issue.itemId))),
      ).length,
    [activeProject.files, breakpointIssues],
  );
  const activeHistory = useMemo(() => historyRef.current[activeFile.id], [activeFile.id, historyVersion]);
  const activeProjectSnapshots = useMemo(() => projectSnapshotsRef.current[activeProject.id] ?? [], [activeProject.id, projectSnapshotVersion]);
  const latestProjectSnapshot = activeProjectSnapshots[0] ?? null;
  const canUndo = Boolean(activeHistory?.undo.length);
  const canRedo = Boolean(activeHistory?.redo.length);
  const canPaste = useMemo(() => clipboardRef.current.length > 0, [clipboardVersion]);
  const availableParentFrames = useMemo(
    () =>
      selectedItem
        ? items.filter((item) => item.type === "frame" && item.id !== selectedItem.id && !isDescendantOf(item.id, selectedItem.id, items))
        : [],
    [items, selectedItem],
  );
  const selectedParentAutoLayout = selectedItem ? parentUsesAutoLayout(selectedItem, items) : false;
  const selectedConstraints = selectedItem ? itemConstraints(selectedItem) : null;
  const selectedEventName = selectedItem ? eventNameForItem(selectedItem) : null;
  const selectedEventCommandId = selectedItem && selectedEventName ? eventCommandId(selectedItem, selectedEventName) : "";
  const selectedEventBinding = selectedItem && selectedEventName ? selectedItem.props.events?.[selectedEventName] ?? null : null;
  const selectedEventCommand = selectedEventCommandId ? activeProject.rustCommands.find((command) => command.id === selectedEventCommandId) ?? null : null;
  const selectedEventCommandArgs = selectedEventCommand ? rustCommandParameters(selectedEventCommand) : [];
  const latestSimulatorTrace = simulatorTrace[0] ?? null;
  const selectedLatestSimulatorTrace =
    latestSimulatorTrace && selectedItem && selectedEventName && latestSimulatorTrace.itemName === getItemSummary(selectedItem) && latestSimulatorTrace.eventName === selectedEventName
      ? latestSimulatorTrace
      : null;
  const selectedActionFeedback = selectedItem && selectedEventName
    ? selectedLatestSimulatorTrace
      ? {
          tone: selectedLatestSimulatorTrace.status,
          title: selectedLatestSimulatorTrace.status === "success" ? "Last event succeeded" : "Last event failed",
          detail: `${selectedLatestSimulatorTrace.commandName}: ${selectedLatestSimulatorTrace.message}`,
          badge: selectedLatestSimulatorTrace.status,
        }
      : selectedEventCommand
        ? {
            tone: "ready",
            title: `Ready to run ${selectedEventName}`,
            detail: `${sanitizeRustCommandName(selectedEventCommand.name)} · ${selectedEventCommandArgs.length} argument(s) · ${commandResultSchema(selectedEventCommand).mode} result`,
            badge: "ready",
          }
        : {
            tone: "unbound",
            title: `${selectedEventName} has no command`,
            detail: "Create a binding before this control can run a live event.",
            badge: "needs binding",
          }
    : null;
  const eventResultTargets = useMemo(
    () =>
      items
        .filter((item) => item.type !== "frame" && item.type !== "divider" && item.id !== selectedItem?.id)
        .sort((a, b) => a.z - b.z),
    [items, selectedItem?.id],
  );
  const selectedBindableProps = useMemo(
    () =>
      selectedItem
        ? eventResultTargetProps.filter(
            (prop) =>
              prop.value in selectedItem.props ||
              (prop.value === "value" && ["input", "textarea", "select", "stat"].includes(selectedItem.type)),
          )
        : [],
    [selectedItem],
  );
  const selectedPropertySchema = useMemo(() => (selectedItem ? propertySchemaForItem(selectedItem) : []), [selectedItem]);
  const selectedPropertyIssues = useMemo(() => (selectedItem ? propertyIssuesForItem(activeFile, selectedItem) : []), [activeFile, selectedItem]);
  const selectedPropertyAutoFixPatch = useMemo(() => (selectedItem ? propertyAutoFixPatchForItem(selectedItem) : {}), [selectedItem]);
  const selectedPropertyAutoFixCount = propertyPatchSize(selectedPropertyAutoFixPatch);
  const projectPropertyAutoFixSummary = useMemo(() => propertyAutoFixSummaryForProject(activeProject), [activeProject]);
  const projectJumpResults = useMemo(() => buildProjectJumpResults(activeProject, diskCheckpoints), [activeProject, diskCheckpoints]);
  const visibleProjectJumpResults = useMemo(
    () => filterProjectJumpResults(projectJumpResults, projectJumpQuery),
    [projectJumpQuery, projectJumpResults],
  );
  const recentProjectJumpResults = useMemo(
    () =>
      projectJumpRecentIds
        .map((id) => projectJumpResults.find((result) => result.id === id) ?? null)
        .filter((result): result is ProjectJumpResult => Boolean(result)),
    [projectJumpRecentIds, projectJumpResults],
  );
  const projectJumpPanelResults = useMemo(() => {
    if (projectJumpQuery.trim()) {
      return visibleProjectJumpResults;
    }
    const recommendedResults = projectJumpResults.filter((result) => result.kind === "action" || result.kind === "settings").slice(0, 8);
    const seen = new Set<string>();
    return [...recentProjectJumpResults, ...recommendedResults]
      .filter((result) => {
        if (seen.has(result.id)) {
          return false;
        }
        seen.add(result.id);
        return true;
      })
      .slice(0, 10);
  }, [projectJumpQuery, projectJumpResults, recentProjectJumpResults, visibleProjectJumpResults]);
  const projectJumpPanelOpen = projectJumpFocused || projectJumpQuery.trim().length > 0;
  const stateVariableFingerprint = useMemo(
    () => activeProject.stateVariables.map((state) => `${state.id}:${state.name}:${state.initialValue}`).join("|"),
    [activeProject.stateVariables],
  );
  const latestBuildEntry = activeProject.buildHistory?.[0] ?? null;
  const latestGeneratedFileSummary = activeProject.lastGeneratedFileSummary;
  const activeProjectSnapshotHash = useMemo(() => stableTextHash(projectSnapshotFingerprint(activeProject)), [activeProject]);
  const releaseReadinessSummary = useMemo(
    () =>
      releaseReadinessDashboard(
        activeProject,
        buildReadinessSummary,
        windowVisualAudit,
        latestBuildEntry,
        latestRunSessionEntry,
        diskCheckpoints.length,
        activityTimeline.length,
      ),
    [activeProject, activityTimeline.length, buildReadinessSummary, diskCheckpoints.length, latestBuildEntry, latestRunSessionEntry, windowVisualAudit],
  );
  const activeBuildOutputDir = useMemo(
    () =>
      parentPathFromPath(activeProject.outputExePath || "") ||
      latestBuildEntry?.outputDir ||
      (activeProject.rootPath ? `${activeProject.rootPath}\\app\\src-tauri\\target\\release` : ""),
    [activeProject.outputExePath, activeProject.rootPath, latestBuildEntry?.outputDir],
  );
  const activeBundleDir = useMemo(
    () => activeProject.outputBundleDir || latestBuildEntry?.bundleDir || (activeProject.rootPath ? `${activeProject.rootPath}\\app\\src-tauri\\target\\release\\bundle` : ""),
    [activeProject.outputBundleDir, activeProject.rootPath, latestBuildEntry?.bundleDir],
  );
  const activeBundlePath = activeProject.outputBundlePaths?.[0] || latestBuildEntry?.bundlePaths?.[0] || "";
  const activeBundleManifestPath = activeProject.outputBundleManifestPath || latestBuildEntry?.bundleManifestPath || "";
  const activeGeneratedPreviewEntry = useMemo(
    () =>
      generatedFilePreview?.entries.find((entry) => entry.relative_path === activeGeneratedPreviewPath) ??
      generatedFilePreview?.entries.find((entry) => entry.changed) ??
      generatedFilePreview?.entries[0] ??
      null,
    [activeGeneratedPreviewPath, generatedFilePreview],
  );
  const selectedGeneratedPreviewPathSet = useMemo(() => new Set(selectedGeneratedPreviewPaths), [selectedGeneratedPreviewPaths]);
  const selectableGeneratedPreviewEntries = useMemo(
    () => generatedFilePreview?.entries.filter(generatedPreviewEntryNeedsApply) ?? [],
    [generatedFilePreview],
  );
  const projectChangeImpact = useMemo(
    () =>
      createProjectChangeImpact(
        activeProject,
        generatedFilePreview,
        activeProjectSnapshotHash,
        generatedFilePreviewSnapshotHash,
      ),
    [activeProject, activeProjectSnapshotHash, generatedFilePreview, generatedFilePreviewSnapshotHash],
  );
  const projectDependencyValidity = useMemo(
    () => projectDependencyValidityViews(projectDependencyGraph, projectChangeImpact, activeProjectSnapshotHash),
    [activeProjectSnapshotHash, projectChangeImpact, projectDependencyGraph],
  );
  const projectDependencySources = useMemo(
    () => projectDependencyGraphSourceRefs(projectDependencyGraph),
    [projectDependencyGraph],
  );
  const activeReleaseIconAsset = useMemo(
    () => activeProject.assets.find((asset) => asset.id === activeProject.releaseConfig.iconAssetId) ?? null,
    [activeProject.assets, activeProject.releaseConfig.iconAssetId],
  );
  const reverseDependencyTargets = useMemo<ProjectReverseDependencyTarget[]>(() => {
    const selectedAsset = selectedItem?.props.assetId
      ? activeProject.assets.find((asset) => asset.id === selectedItem.props.assetId) ?? null
      : null;
    const targets: ProjectReverseDependencyTarget[] = [];
    const activeFileTarget: ProjectReverseDependencyTarget = {
      id: `ui-file-${activeFile.id}`,
      kind: "ui-file",
      label: activeFile.name,
      detail: `${activeFile.items.length} controls in ${activeFile.path}`,
      fileId: activeFile.id,
      path: activeFile.path,
    };
    const selectedControlTarget: ProjectReverseDependencyTarget | null = selectedItem
      ? {
          id: `control-${selectedItem.id}`,
          kind: "control",
          label: selectedItem.name,
          detail: `${selectedItem.type} in ${activeFile.name}`,
          fileId: activeFile.id,
          itemId: selectedItem.id,
          path: activeFile.path,
        }
      : null;
    const rustTargets: ProjectReverseDependencyTarget[] = [
      {
        id: `rust-command-${activeRustCommand.id}`,
        kind: "rust-command",
        label: activeRustCommand.name,
        detail: activeRustCommand.backendIntegrationId ? "Command bound to backend integration" : "Project Tauri command",
        commandId: activeRustCommand.id,
        path: "rust/logic.rs",
      },
      {
        id: `rust-module-${activeRustModule.id}`,
        kind: "rust-module",
        label: activeRustModule.name,
        detail: activeRustModule.enabled ? "Enabled Rust module" : "Disabled Rust module",
        moduleId: activeRustModule.id,
        path: `rust/modules/${activeRustModule.name}.rs`,
      },
      {
        id: `cargo-dependency-${activeCargoDependency.id}`,
        kind: "cargo-dependency",
        label: activeCargoDependency.name,
        detail: activeCargoDependency.enabled ? `Cargo dependency v${activeCargoDependency.version}` : "Disabled Cargo dependency",
        dependencyId: activeCargoDependency.id,
        path: "rust/dependencies.json",
      },
      {
        id: `backend-${activeBackendIntegration.id}`,
        kind: "backend-integration",
        label: activeBackendIntegration.name,
        detail: `${activeBackendIntegration.kind} · ${activeBackendIntegration.language} · ${activeBackendIntegration.transport}`,
        integrationId: activeBackendIntegration.id,
        path: activeBackendIntegration.artifactPath || activeBackendIntegration.entryPath || activeBackendIntegration.resourcePath,
      },
    ];
    const releaseTargets: ProjectReverseDependencyTarget[] = [
      {
        id: "release-config",
        kind: "release-config",
        label: `${activeProject.releaseConfig.appName} v${activeProject.releaseConfig.version}`,
        detail: `${activeProject.releaseConfig.bundleTargets} · ${activeProject.releaseConfig.signingMode}`,
      },
    ];
    if (activeReleaseIconAsset) {
      releaseTargets.push({
        id: `asset-${activeReleaseIconAsset.id}`,
        kind: "asset",
        label: activeReleaseIconAsset.name,
        detail: activeReleaseIconAsset.sourcePath || activeReleaseIconAsset.publicPath,
        assetId: activeReleaseIconAsset.id,
        path: activeReleaseIconAsset.sourcePath || activeReleaseIconAsset.publicPath,
      });
    }
    if (mode === "logic") {
      targets.push(...rustTargets);
    } else if (mode === "build") {
      targets.push(...releaseTargets, ...rustTargets.slice(0, 1));
    } else {
      if (selectedControlTarget) {
        targets.push(selectedControlTarget);
      }
      targets.push(activeFileTarget);
      if (selectedAsset) {
        targets.push({
          id: `asset-${selectedAsset.id}`,
          kind: "asset",
          label: selectedAsset.name,
          detail: selectedAsset.sourcePath || selectedAsset.publicPath,
          assetId: selectedAsset.id,
          path: selectedAsset.sourcePath || selectedAsset.publicPath,
        });
      }
    }
    const seen = new Set<string>();
    return targets
      .filter((target) => {
        const key = `${target.kind}:${target.id}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .slice(0, 4);
  }, [
    activeBackendIntegration,
    activeCargoDependency,
    activeFile,
    activeProject.assets,
    activeProject.releaseConfig,
    activeReleaseIconAsset,
    activeRustCommand,
    activeRustModule,
    mode,
    selectedItem,
  ]);
  const reverseDependencySummaries = useMemo(
    () =>
      reverseDependencyTargets.map((target) =>
        createProjectReverseDependencySummary(target, projectChangeImpact.scopes, projectDependencyGraph?.scopes ?? []),
      ),
    [projectChangeImpact.scopes, projectDependencyGraph?.scopes, reverseDependencyTargets],
  );
  const selectedControlReverseDependency = useMemo(
    () => reverseDependencySummaries.find((summary) => summary.target?.kind === "control" && summary.target.itemId === selectedItem?.id) ?? null,
    [reverseDependencySummaries, selectedItem?.id],
  );
  const activeRustCommandReverseDependency = useMemo(
    () =>
      reverseDependencySummaries.find(
        (summary) => summary.target?.kind === "rust-command" && summary.target.commandId === activeRustCommand.id,
      ) ?? null,
    [activeRustCommand.id, reverseDependencySummaries],
  );

  useEffect(() => {
    activeProjectRef.current = activeProject;
  }, [activeProject]);

  useEffect(() => {
    projectChangeImpactRef.current = projectChangeImpact;
  }, [projectChangeImpact]);

  useEffect(() => {
    projectDependencyGraphRef.current = projectDependencyGraph;
  }, [projectDependencyGraph]);

  useEffect(() => {
    if (!sourcePage.autoSave || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(DESIGNER_WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
  }, [sourcePage.autoSave, workspace]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    saveProjectTaskHistory(projectTasks);
  }, [projectTasks]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(PROJECT_JUMP_RECENTS_STORAGE_KEY, JSON.stringify(projectJumpRecentIds.slice(0, 8)));
  }, [projectJumpRecentIds]);

  useEffect(() => {
    setProjectJumpActiveIndex(0);
  }, [projectJumpQuery, projectJumpPanelResults.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCommand = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (!isCommand || (key !== "p" && key !== "k")) {
        return;
      }
      event.preventDefault();
      setProjectJumpFocused(true);
      window.requestAnimationFrame(() => {
        projectJumpInputRef.current?.focus();
        projectJumpInputRef.current?.select();
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    saveProjectActionPresets(customProjectActionPresets);
  }, [customProjectActionPresets]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    saveProjectTaskQueueState({
      paused: projectTaskQueuePaused,
      tasks: projectTaskQueueRef.current.slice(0, 80),
    });
  }, [projectTaskQueuePaused, projectTaskQueueVersion]);

  useEffect(() => {
    projectTaskQueuePausedRef.current = projectTaskQueuePaused;
  }, [projectTaskQueuePaused]);

  useEffect(() => {
    if (restoredProjectTaskQueueRef.current) {
      return;
    }
    restoredProjectTaskQueueRef.current = true;
    if (!projectTaskQueuePausedRef.current && projectTaskQueueRef.current.length > 0) {
      void drainProjectTaskQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeProjectTasks.length === 0 || visibleProjectTasks.length === 0) {
      setSelectedProjectTaskId("");
      return;
    }
    if (selectedProjectTaskId && visibleProjectTasks.some((task) => task.id === selectedProjectTaskId)) {
      return;
    }
    setSelectedProjectTaskId(visibleProjectTasks[0].id);
  }, [activeProjectTasks, selectedProjectTaskId, visibleProjectTasks]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (mode !== "logic" || !rustDiagnosticTarget) {
      return;
    }

    const editor = rustLogicRef.current;
    if (!editor) {
      return;
    }

    window.requestAnimationFrame(() => {
      const { start, end } = textRangeForLineColumn(activeProject.rustLogic, rustDiagnosticTarget.sourceLine, rustDiagnosticTarget.column);
      const lineHeight = Number.parseFloat(window.getComputedStyle(editor).lineHeight) || 20;
      const nextScrollTop = Math.max(0, (rustDiagnosticTarget.sourceLine - 4) * lineHeight);
      editor.focus();
      editor.setSelectionRange(start, end);
      editor.scrollTop = nextScrollTop;
      setRustEditorScrollTop(nextScrollTop);
    });
  }, [activeProject.rustLogic, mode, rustDiagnosticTarget]);

  useEffect(() => {
    setSimulatorStateValues(simulatorStateFromProject(activeProject));
    setSimulatorTrace([]);
  }, [activeProject.id, activeFile.id, stateVariableFingerprint]);

  useEffect(() => {
    if (activeBreakpoint !== "desktop") {
      return;
    }
    updateActiveItems((current) => current.map((item) => normalizeItemBoundsInTree(item, current, page)), { history: false });
  }, [activeBreakpoint, page.width, page.height]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => items.some((item) => item.id === id)));
  }, [activeFile.id, items]);

  useEffect(() => {
    refreshManagedProjects();
  }, []);

  useEffect(() => {
    setCheckpointDiff(null);
    void refreshDiskCheckpoints();
  }, [activeProject.id, activeProject.rootPath]);

  useEffect(() => {
    setGeneratedFilePreview(null);
    setGeneratedFilePreviewSnapshotHash("");
    setGeneratedFileApplyResult(null);
    setProjectDependencyGraph(null);
    setActiveGeneratedPreviewPath("");
    setSelectedGeneratedPreviewPaths([]);
  }, [activeProject.id]);

  useEffect(() => {
    void refreshProjectDependencyGraph(activeProject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject.id, activeProject.rootPath]);

  useEffect(() => {
    void refreshBackendArtifactInspection(activeProject);
  }, [backendArtifactInspectionKey]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditingText =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (mode !== "design" || isEditingText) {
        return;
      }

      const isCommand = event.ctrlKey || event.metaKey;
      if (isCommand && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redoCanvas();
        } else {
          undoCanvas();
        }
        return;
      }

      if ((isCommand && event.key.toLowerCase() === "y") || (isCommand && event.shiftKey && event.key.toLowerCase() === "z")) {
        event.preventDefault();
        redoCanvas();
        return;
      }

      if (isCommand && event.key.toLowerCase() === "a") {
        event.preventDefault();
        selectAllItems();
        return;
      }

      if (isCommand && event.key.toLowerCase() === "c") {
        event.preventDefault();
        copySelectionToClipboard();
        return;
      }

      if (isCommand && event.key.toLowerCase() === "v") {
        event.preventDefault();
        pasteClipboardItems();
        return;
      }

      if (isCommand && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelected();
        return;
      }

      if (selectedIds.length === 0) {
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
        return;
      }

      const distance = event.shiftKey ? page.gridSize * 4 : page.gridSize;
      const directions: Record<string, [number, number]> = {
        ArrowLeft: [-distance, 0],
        ArrowRight: [distance, 0],
        ArrowUp: [0, -distance],
        ArrowDown: [0, distance],
      };
      const direction = directions[event.key];
      if (direction) {
        event.preventDefault();
        nudgeSelected(direction[0], direction[1]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, page.gridSize, selectedIds, canUndo, canRedo]);

  useEffect(() => {
    if (!dragSession) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      const deltaX = (event.clientX - dragSession.startClientX) / page.zoom;
      const deltaY = (event.clientY - dragSession.startClientY) / page.zoom;
      if (dragSession.kind === "move") {
        const movedDistance = Math.hypot(event.clientX - dragSession.startClientX, event.clientY - dragSession.startClientY);
        setDropIntent(movedDistance > 4 ? getMoveDropIntentFromClientPoint(event.clientX, event.clientY, dragSession.ids) : null);
      }

      updateActiveItems((current) => {
        if (dragSession.kind === "resize") {
          const previousItem = current.find((item) => item.id === dragSession.id);
          if (!previousItem) {
            return current;
          }

          const nextItem = applyLayoutPatchForActiveBreakpoint(
            previousItem,
            {
              width: snap(dragSession.originWidth + deltaX, page.gridSize, page.snapToGrid),
              height: snap(dragSession.originHeight + deltaY, page.gridSize, page.snapToGrid),
            },
            current,
          );

          return activeBreakpoint === "desktop"
            ? replaceItemAndApplyResizeConstraints(current, previousItem, nextItem, page)
            : current.map((item) => (item.id === previousItem.id ? nextItem : item));
        }

        return current.map((item) => {
          if (dragSession.kind === "move") {
            if (!dragSession.ids.includes(item.id) || item.locked) {
              return item;
            }
            const origin = dragSession.origins[item.id];
            if (!origin) {
              return item;
            }
            return applyLayoutPatchForActiveBreakpoint(
              item,
              {
                x: snap(origin.x + deltaX, page.gridSize, page.snapToGrid),
                y: snap(origin.y + deltaY, page.gridSize, page.snapToGrid),
              },
              current,
            );
          }

          return item;
        });
      },
        { history: false },
      );
    };

    const onPointerUp = (event: PointerEvent) => {
      if (dragSession.kind === "move") {
        const movedDistance = Math.hypot(event.clientX - dragSession.startClientX, event.clientY - dragSession.startClientY);
        const intent = movedDistance > 4 ? getMoveDropIntentFromClientPoint(event.clientX, event.clientY, dragSession.ids) : null;
        if (intent?.kind === "frame") {
          reparentMovedItemsToFrame(dragSession.ids, intent.frameId, intent.index);
        } else if (intent?.kind === "canvas") {
          detachMovedItemsToCanvas(dragSession, event.clientX, event.clientY);
        }
      }
      setDragSession(null);
      setDropIntent(null);
    };

    document.body.style.cursor = dragSession.kind === "move" ? "grabbing" : "nwse-resize";
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragSession, page]);

  const exportJson = useMemo(
    () =>
      JSON.stringify(
        {
          target: "tauri-react-freeform",
          version: 2,
          project: {
            id: activeProject.id,
            name: activeProject.name,
            rustCommands: activeProject.rustCommands,
            stateVariables: activeProject.stateVariables,
            assets: activeProject.assets,
            releaseConfig: activeProject.releaseConfig,
          },
          file: {
            id: activeFile.id,
            name: activeFile.name,
            path: activeFile.path,
          },
          page: sourcePage,
          items: baseSortedItems,
        },
        null,
        2,
      ),
    [
      activeFile.id,
      activeFile.name,
      activeFile.path,
      activeProject.assets,
      activeProject.id,
      activeProject.name,
      activeProject.releaseConfig,
      activeProject.rustCommands,
      activeProject.stateVariables,
      sourcePage,
      baseSortedItems,
    ],
  );

  const exportJsx = useMemo(
    () =>
      [
        `export function ${normalizeName(page.title)}() {`,
        "  return (",
        `    <div className="relative overflow-hidden" style={{ width: ${page.width}, height: ${page.height} }}>`,
        ...topLevelItems.map((item) => renderItemCode(item, sortedItems, "free", page).split("\n").map((line: string) => `      ${line}`).join("\n")),
        "    </div>",
        "  );",
        "}",
      ].join("\n"),
    [page.height, page.title, page.width, sortedItems, topLevelItems],
  );

  const exportText = exportKind === "json" ? exportJson : exportJsx;

  const getFileHistory = (fileId: string) => {
    historyRef.current[fileId] ??= { undo: [], redo: [] };
    return historyRef.current[fileId];
  };

  const pushHistorySnapshot = (file = activeFile) => {
    const history = getFileHistory(file.id);
    const snapshot = cloneBuilderState(file);
    const fingerprint = builderStateFingerprint(snapshot);
    const latest = history.undo[history.undo.length - 1];
    if (latest && builderStateFingerprint(latest) === fingerprint) {
      return;
    }

    history.undo.push(snapshot);
    if (history.undo.length > 80) {
      history.undo.shift();
    }
    history.redo = [];
    setHistoryVersion((version) => version + 1);
  };

  const getProjectSnapshots = (projectId: string) => {
    projectSnapshotsRef.current[projectId] ??= [];
    return projectSnapshotsRef.current[projectId];
  };

  const pushProjectSnapshot = (label: string, project = activeProject) => {
    const snapshots = getProjectSnapshots(project.id);
    const fingerprint = projectSnapshotFingerprint(project);
    const latest = snapshots[0];
    if (latest?.fingerprint === fingerprint) {
      return;
    }

    snapshots.unshift({
      id: createId(),
      createdAt: new Date().toISOString(),
      label,
      fingerprint,
      project: cloneDesignerProject(project),
    });
    projectSnapshotsRef.current[project.id] = snapshots.slice(0, 12);
    setProjectSnapshotVersion((version) => version + 1);
  };

  const restoreLatestProjectSnapshot = () => {
    const snapshots = getProjectSnapshots(activeProject.id);
    const latest = snapshots.shift();
    if (!latest) {
      return;
    }

    const restoredProject = cloneDesignerProject(latest.project);
    const nextFile = restoredProject.files.find((file) => file.id === restoredProject.activeFileId) ?? restoredProject.files[0];
    setWorkspace((current) => {
      const now = new Date().toISOString();
      const nextProject: DesignerProject = {
        ...restoredProject,
        updatedAt: now,
        files: restoredProject.files.map((file) => ({
          ...file,
          updatedAt: file.updatedAt || now,
        })),
      };
      return {
        ...current,
        projects: current.projects.map((project) => (project.id === current.activeProjectId ? nextProject : project)),
        activeProjectId: nextProject.id,
      };
    });
    setSelectedId(nextFile?.items[0]?.id ?? "");
    setBuildError("");
    setReplaceTemplateOpen(false);
    setMode("design");
    setProjectSnapshotVersion((version) => version + 1);
  };

  const restoreActiveFileState = (state: SavedBuilderState) => {
    updateActiveFile(
      (file) => ({
        ...file,
        page: { ...state.page },
        items: state.items.map((item) => ({ ...item, responsive: cloneResponsiveOverrides(item.responsive), props: { ...item.props } })),
      }),
      { history: false },
    );
    setSelectedIds((current) => current.filter((id) => state.items.some((item) => item.id === id)));
  };

  const undoCanvas = () => {
    const history = getFileHistory(activeFile.id);
    const previous = history.undo.pop();
    if (!previous) {
      return;
    }

    history.redo.push(cloneBuilderState(activeFile));
    restoreActiveFileState(previous);
    setHistoryVersion((version) => version + 1);
  };

  const redoCanvas = () => {
    const history = getFileHistory(activeFile.id);
    const next = history.redo.pop();
    if (!next) {
      return;
    }

    history.undo.push(cloneBuilderState(activeFile));
    restoreActiveFileState(next);
    setHistoryVersion((version) => version + 1);
  };

  const updateActiveFile = (updater: (file: DesignerFile) => DesignerFile, options: { history?: boolean } = {}) => {
    if (options.history !== false) {
      pushHistorySnapshot();
    }
    setWorkspace((current) => {
      const now = new Date().toISOString();
      return {
        ...current,
        projects: current.projects.map((project) => {
          if (project.id !== current.activeProjectId) {
            return project;
          }

          return {
            ...project,
            updatedAt: now,
            files: project.files.map((file) => {
              if (file.id !== project.activeFileId) {
                return file;
              }
              const nextFile = updater(file);
              return {
                ...nextFile,
                updatedAt: now,
                path: nextFile.path || `ui/${nextFile.name}`,
              };
            }),
          };
        }),
      };
    });
  };

  const updateActiveProject = (updater: (project: DesignerProject) => DesignerProject) => {
    setWorkspace((current) => {
      const now = new Date().toISOString();
      return {
        ...current,
        projects: current.projects.map((project) => {
          if (project.id !== current.activeProjectId) {
            return project;
          }
          return {
            ...updater(project),
            updatedAt: now,
          };
        }),
      };
    });
  };

  const updateActiveItems = (updater: (items: BuilderItem[]) => BuilderItem[], options: { history?: boolean } = {}) => {
    updateActiveFile((file) => ({
      ...file,
      items: updater(file.items),
    }), options);
  };

  const updatePage = (patch: Partial<PageConfig>, options: { history?: boolean } = {}) => {
    updateActiveFile((file) => {
      const nextPage = { ...file.page, ...patch };
      const sizeChanged = nextPage.width !== file.page.width || nextPage.height !== file.page.height;
      return {
        ...file,
        page: nextPage,
        items: sizeChanged
          ? applyConstraintsForParentResize(
              file.items,
              undefined,
              { width: file.page.width, height: file.page.height },
              { width: nextPage.width, height: nextPage.height },
              nextPage,
            )
          : file.items,
      };
    }, options);
  };

  const applyCanvasPreset = (presetId: CanvasPresetId) => {
    if (presetId === "custom") {
      updatePage({ preset: "custom", activeBreakpoint: "desktop" });
      return;
    }
    const preset = canvasPresets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }
    updatePage({ preset: preset.id, activeBreakpoint: "desktop", width: preset.width, height: preset.height });
  };

  const setResponsiveBreakpoint = (breakpoint: ResponsiveBreakpointId) => {
    updatePage({ activeBreakpoint: breakpoint }, { history: false });
  };

  const setCanvasZoom = (zoom: number) => {
    updatePage({ zoom: Math.round(clamp(zoom, 0.25, 2) * 100) / 100 }, { history: false });
  };

  const zoomCanvasBy = (delta: number) => {
    if (delta > 0) {
      setCanvasZoom(canvasZoomLevels.find((zoom) => zoom > page.zoom + 0.001) ?? 2);
      return;
    }
    setCanvasZoom([...canvasZoomLevels].reverse().find((zoom) => zoom < page.zoom - 0.001) ?? 0.25);
  };

  const resetCanvasView = () => {
    setCanvasZoom(1);
    window.requestAnimationFrame(() => {
      const viewport = canvasViewportRef.current;
      if (!viewport) {
        return;
      }
      viewport.scrollTo({
        left: Math.max(0, (page.width - viewport.clientWidth) / 2),
        top: Math.max(0, (page.height - viewport.clientHeight) / 2),
        behavior: "smooth",
      });
    });
  };

  const fitCanvasToViewport = () => {
    const viewport = canvasViewportRef.current;
    if (!viewport) {
      return;
    }
    const nextZoom = Math.min((viewport.clientWidth - 64) / page.width, (viewport.clientHeight - 64) / page.height);
    setCanvasZoom(clamp(nextZoom, 0.25, 2));
    window.requestAnimationFrame(() => {
      viewport.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    });
  };

  const centerCanvasView = () => {
    const viewport = canvasViewportRef.current;
    if (!viewport) {
      return;
    }
    viewport.scrollTo({
      left: Math.max(0, (page.width * page.zoom - viewport.clientWidth) / 2),
      top: Math.max(0, (page.height * page.zoom - viewport.clientHeight) / 2),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      return Boolean(element?.closest("input, textarea, select, [contenteditable='true']"));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.code === "Space" && mode === "design") {
        event.preventDefault();
        setSpacePanActive(true);
        return;
      }

      if (!(event.ctrlKey || event.metaKey) || mode !== "design") {
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomCanvasBy(0.1);
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomCanvasBy(-0.1);
      } else if (event.key === "0") {
        event.preventDefault();
        resetCanvasView();
      } else if (event.key === "1") {
        event.preventDefault();
        fitCanvasToViewport();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setSpacePanActive(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [mode, page.height, page.width, page.zoom]);

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp((clientX - rect.left) / page.zoom, 0, page.width),
      y: clamp((clientY - rect.top) / page.zoom, 0, page.height),
    };
  };

  const isClientPointInsideCanvas = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return false;
    }
    const rect = canvas.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  };

  const getNodeCanvasPosition = (item: BuilderItem) => {
    const canvas = canvasRef.current;
    if (canvas && typeof document !== "undefined") {
      const element = document.querySelector<HTMLElement>(`[data-builder-node-id="${item.id}"]`);
      if (element) {
        const canvasRect = canvas.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        return {
          x: (elementRect.left - canvasRect.left) / page.zoom,
          y: (elementRect.top - canvasRect.top) / page.zoom,
        };
      }
    }

    return getAbsolutePosition(item, itemsRef.current);
  };

  const isValidFrameDropTarget = (candidate: BuilderItem | undefined, excludedIds: Set<string>, sourceItems: BuilderItem[]) => {
    if (!candidate || candidate.type !== "frame" || candidate.locked || excludedIds.has(candidate.id)) {
      return false;
    }

    return !Array.from(excludedIds).some((id) => isDescendantOf(candidate.id, id, sourceItems));
  };

  const getFrameDropTargetFromClientPoint = (clientX: number, clientY: number, excludedIds: string[] = []) => {
    const sourceItems = itemsRef.current;
    const excluded = new Set(excludedIds);
    const canvas = canvasRef.current;

    if (typeof document !== "undefined") {
      const elements = document.elementsFromPoint(clientX, clientY);
      for (const element of elements) {
        let current = element as HTMLElement | null;
        while (current && current !== canvas) {
          const nodeId = current.dataset?.builderNodeId;
          const candidate = nodeId ? sourceItems.find((item) => item.id === nodeId) : undefined;
          if (isValidFrameDropTarget(candidate, excluded, sourceItems)) {
            return candidate ?? null;
          }
          current = current.parentElement;
        }
      }
    }

    const point = getCanvasPoint(clientX, clientY);
    return (
      sourceItems
        .filter((item) => isValidFrameDropTarget(item, excluded, sourceItems))
        .map((item) => ({
          item,
          depth: getItemDepth(item, sourceItems),
          position: getAbsolutePosition(item, sourceItems),
        }))
        .filter(({ item, position }) => point.x >= position.x && point.x <= position.x + item.width && point.y >= position.y && point.y <= position.y + item.height)
        .sort((a, b) => b.depth - a.depth || b.item.z - a.item.z)[0]?.item ?? null
    );
  };

  const getFrameInsertionIndex = (frame: BuilderItem, clientX: number, clientY: number, excludedIds: string[] = []) => {
    const mode = frameLayoutMode(frame);
    const excluded = new Set(excludedIds);
    const children = getOrderedFrameChildren(frame.id, itemsRef.current, excluded);
    if (mode === "free" || children.length === 0 || typeof document === "undefined") {
      return children.length;
    }

    const entries = children
      .map((child, index) => {
        const element = document.querySelector<HTMLElement>(`[data-builder-node-id="${child.id}"]`);
        const rect = element?.getBoundingClientRect();
        return rect ? { child, index, rect } : null;
      })
      .filter((entry): entry is { child: BuilderItem; index: number; rect: DOMRect } => Boolean(entry));

    if (entries.length === 0) {
      return children.length;
    }

    if (mode === "row") {
      const target = entries.find((entry) => clientX < entry.rect.left + entry.rect.width / 2);
      return target?.index ?? children.length;
    }

    if (mode === "column") {
      const target = entries.find((entry) => clientY < entry.rect.top + entry.rect.height / 2);
      return target?.index ?? children.length;
    }

    const gridEntries = [...entries].sort((a, b) => {
      const topDelta = a.rect.top - b.rect.top;
      if (Math.abs(topDelta) > 12) {
        return topDelta;
      }
      return a.rect.left - b.rect.left;
    });
    const target = gridEntries.find((entry) => {
      const centerY = entry.rect.top + entry.rect.height / 2;
      const centerX = entry.rect.left + entry.rect.width / 2;
      const rowRange = Math.max(12, entry.rect.height / 2);
      return clientY < centerY - rowRange || (Math.abs(clientY - centerY) <= rowRange && clientX < centerX);
    });

    return target?.index ?? children.length;
  };

  const getFrameDropIntentFromClientPoint = (clientX: number, clientY: number, excludedIds: string[] = []): FrameDropIntent | null => {
    const frame = getFrameDropTargetFromClientPoint(clientX, clientY, excludedIds);
    if (!frame) {
      return null;
    }

    const excluded = new Set(excludedIds);
    const mode = frameLayoutMode(frame);
    const childCount = getOrderedFrameChildren(frame.id, itemsRef.current, excluded).length;
    return {
      kind: "frame",
      frameId: frame.id,
      index: getFrameInsertionIndex(frame, clientX, clientY, excludedIds),
      childCount,
      mode,
    };
  };

  const getCanvasDropIntentFromClientPoint = (clientX: number, clientY: number, movingIds: string[] = []): CanvasDropIntent | null => {
    if (!isClientPointInsideCanvas(clientX, clientY)) {
      return null;
    }

    const movingSet = new Set(movingIds);
    const movingRoots = movingIds.filter((id) => {
      const item = itemsRef.current.find((candidate) => candidate.id === id);
      return item && !item.locked && (!item.parentId || !movingSet.has(item.parentId));
    });
    const hasParentedRoot = movingRoots.some((id) => Boolean(itemsRef.current.find((item) => item.id === id)?.parentId));
    if (!hasParentedRoot) {
      return null;
    }

    return {
      kind: "canvas",
      ...getCanvasPoint(clientX, clientY),
      itemCount: movingRoots.length,
    };
  };

  const getMoveDropIntentFromClientPoint = (clientX: number, clientY: number, movingIds: string[] = []): BuilderDropIntent | null => {
    return getFrameDropIntentFromClientPoint(clientX, clientY, movingIds) ?? getCanvasDropIntentFromClientPoint(clientX, clientY, movingIds);
  };

  const getRelativeDropPoint = (clientX: number, clientY: number, parent?: BuilderItem | null) => {
    const point = getCanvasPoint(clientX, clientY);
    if (!parent) {
      return point;
    }

    const parentPosition = getAbsolutePosition(parent, itemsRef.current);
    return {
      x: point.x - parentPosition.x,
      y: point.y - parentPosition.y,
    };
  };

  const selectItem = (id: string, event?: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }) => {
    if (event?.ctrlKey || event?.metaKey || event?.shiftKey) {
      setSelectedIds((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
      return;
    }
    setSelectedId(id);
  };

  const clearSelection = () => setSelectedIds([]);

  const selectAllItems = () => {
    setSelectedIds(items.map((item) => item.id));
  };

  const addComponent = (type: BuilderComponentType, position?: { x: number; y: number }, parentId?: string, insertionIndex?: number) => {
    const parent = parentId ? items.find((item) => item.id === parentId && item.type === "frame") : undefined;
    const baseItem = createItem(type, page, items.length, position);
    const parentedBaseItem = parent
      ? normalizeItemBoundsInTree(
          {
            ...baseItem,
            parentId: parent.id,
          },
          [...items, baseItem],
          page,
        )
      : baseItem;
    const firstAsset = activeProject.assets[0];
    const nextItem =
      type === "image" && firstAsset
        ? {
            ...parentedBaseItem,
            props: {
              ...parentedBaseItem.props,
              assetId: firstAsset.id,
              assetPath: firstAsset.publicPath,
              alt: firstAsset.name,
              label: firstAsset.name,
            },
          }
        : parentedBaseItem;
    updateActiveItems((current) => {
      const appendedItems = [...current, nextItem];
      if (parent?.id && insertionIndex !== undefined) {
        return reorderFrameChildren(appendedItems, parent.id, [nextItem.id], insertionIndex);
      }
      return appendedItems;
    });
    setSelectedId(nextItem.id);
    setMode("design");
  };

  const insertComponentFromShortcut = (type: BuilderComponentType, options: { centered?: boolean; revealPalette?: boolean } = {}) => {
    const definition = getDefinition(type);
    const position = options.centered ? { x: page.width / 2, y: page.height / 2 } : undefined;
    addComponent(type, position);
    setRightDockTab("properties");
    if (options.revealPalette) {
      setLeftDockTab("components");
    }
    recordInstantProjectAction("insert-component", `Inserted ${definition.title} into ${activeFile.name}.`);
  };

  const handlePaletteDragStart = (event: DragEvent, type: BuilderComponentType) => {
    event.dataTransfer.setData("application/x-nova-component", type);
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleCanvasDrop = (event: DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/x-nova-component") as BuilderComponentType;
    if (!mapLegacyType(type)) {
      return;
    }
    const intent = getFrameDropIntentFromClientPoint(event.clientX, event.clientY);
    const targetFrame = intent ? itemsRef.current.find((item) => item.id === intent.frameId) : null;
    addComponent(type, getRelativeDropPoint(event.clientX, event.clientY, targetFrame), intent?.frameId, intent?.index);
    setDropIntent(null);
  };

  const handlePalettePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    definition: ComponentDefinition,
  ) => {
    if (event.button !== 0) {
      return;
    }
    const session: PalettePointerDrag = {
      type: definition.type,
      title: definition.title,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      currentClientX: event.clientX,
      currentClientY: event.clientY,
      dragging: false,
    };
    palettePointerDragRef.current = session;
    setPalettePointerDrag(session);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePalettePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const session = palettePointerDragRef.current;
    if (!session || session.pointerId !== event.pointerId) {
      return;
    }

    const distance = Math.hypot(event.clientX - session.startClientX, event.clientY - session.startClientY);
    const nextSession: PalettePointerDrag = {
      ...session,
      currentClientX: event.clientX,
      currentClientY: event.clientY,
      dragging: session.dragging || distance > 6,
    };
    palettePointerDragRef.current = nextSession;
    setPalettePointerDrag(nextSession);

    if (!nextSession.dragging) {
      return;
    }

    event.preventDefault();
    const frameIntent = getFrameDropIntentFromClientPoint(event.clientX, event.clientY);
    if (frameIntent) {
      setDropIntent(frameIntent);
      return;
    }

    if (isClientPointInsideCanvas(event.clientX, event.clientY)) {
      setDropIntent({
        kind: "canvas",
        ...getCanvasPoint(event.clientX, event.clientY),
        itemCount: 1,
      });
      return;
    }

    setDropIntent(null);
  };

  const finishPalettePointerDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const session = palettePointerDragRef.current;
    if (!session || session.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    palettePointerDragRef.current = null;
    setPalettePointerDrag(null);
    setDropIntent(null);

    if (!session.dragging) {
      return;
    }

    suppressPaletteClickRef.current = true;
    window.setTimeout(() => {
      suppressPaletteClickRef.current = false;
    }, 0);
    event.preventDefault();
    event.stopPropagation();

    const intent = getFrameDropIntentFromClientPoint(event.clientX, event.clientY);
    if (!intent && !isClientPointInsideCanvas(event.clientX, event.clientY)) {
      return;
    }
    const targetFrame = intent ? itemsRef.current.find((item) => item.id === intent.frameId) : null;
    addComponent(session.type, getRelativeDropPoint(event.clientX, event.clientY, targetFrame), intent?.frameId, intent?.index);
  };

  const cancelPalettePointerDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    palettePointerDragRef.current = null;
    setPalettePointerDrag(null);
    setDropIntent(null);
  };

  const updatePaletteDragFromClientPoint = (clientX: number, clientY: number) => {
    const session = palettePointerDragRef.current;
    if (!session) {
      return null;
    }

    const distance = Math.hypot(clientX - session.startClientX, clientY - session.startClientY);
    const nextSession: PalettePointerDrag = {
      ...session,
      currentClientX: clientX,
      currentClientY: clientY,
      dragging: session.dragging || distance > 6,
    };
    palettePointerDragRef.current = nextSession;
    setPalettePointerDrag(nextSession);

    if (!nextSession.dragging) {
      return nextSession;
    }

    const frameIntent = getFrameDropIntentFromClientPoint(clientX, clientY);
    if (frameIntent) {
      setDropIntent(frameIntent);
      return nextSession;
    }

    if (isClientPointInsideCanvas(clientX, clientY)) {
      setDropIntent({
        kind: "canvas",
        ...getCanvasPoint(clientX, clientY),
        itemCount: 1,
      });
      return nextSession;
    }

    setDropIntent(null);
    return nextSession;
  };

  const commitPaletteDragAtClientPoint = (clientX: number, clientY: number) => {
    const session = palettePointerDragRef.current;
    palettePointerDragRef.current = null;
    setPalettePointerDrag(null);
    setDropIntent(null);

    if (!session?.dragging) {
      return false;
    }

    const intent = getFrameDropIntentFromClientPoint(clientX, clientY);
    if (!intent && !isClientPointInsideCanvas(clientX, clientY)) {
      return true;
    }

    const targetFrame = intent ? itemsRef.current.find((item) => item.id === intent.frameId) : null;
    addComponent(session.type, getRelativeDropPoint(clientX, clientY, targetFrame), intent?.frameId, intent?.index);
    return true;
  };

  const handlePaletteMouseDown = (event: ReactMouseEvent<HTMLButtonElement>, definition: ComponentDefinition) => {
    if (event.button !== 0 || palettePointerDragRef.current) {
      return;
    }

    const session: PalettePointerDrag = {
      type: definition.type,
      title: definition.title,
      pointerId: -1,
      startClientX: event.clientX,
      startClientY: event.clientY,
      currentClientX: event.clientX,
      currentClientY: event.clientY,
      dragging: false,
    };
    palettePointerDragRef.current = session;
    setPalettePointerDrag(session);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const nextSession = updatePaletteDragFromClientPoint(moveEvent.clientX, moveEvent.clientY);
      if (nextSession?.dragging) {
        moveEvent.preventDefault();
      }
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (commitPaletteDragAtClientPoint(upEvent.clientX, upEvent.clientY)) {
        suppressPaletteClickRef.current = true;
        window.setTimeout(() => {
          suppressPaletteClickRef.current = false;
        }, 0);
        upEvent.preventDefault();
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const reparentMovedItemsToFrame = (movingIds: string[], frameId: string, insertionIndex: number) => {
    const movingSet = new Set(movingIds);
    updateActiveItems((current) => {
      const targetFrame = current.find((item) => item.id === frameId && item.type === "frame");
      if (!targetFrame || targetFrame.locked || movingSet.has(targetFrame.id)) {
        return current;
      }

      if (Array.from(movingSet).some((id) => isDescendantOf(targetFrame.id, id, current))) {
        return current;
      }

      const rootMoveIds = movingIds.filter((id) => {
        const item = current.find((candidate) => candidate.id === id);
        return item && !item.locked && (!item.parentId || !movingSet.has(item.parentId));
      });

      if (rootMoveIds.length === 0 || rootMoveIds.every((id) => current.find((item) => item.id === id)?.parentId === targetFrame.id)) {
        return reorderFrameChildren(current, targetFrame.id, rootMoveIds, insertionIndex);
      }

      const targetPosition = getAbsolutePosition(targetFrame, current);
      const reparentedItems = current.map((item) => {
        if (!rootMoveIds.includes(item.id)) {
          return item;
        }

        const itemPosition = getAbsolutePosition(item, current);
        return normalizeItemBoundsInTree(
          {
            ...item,
            parentId: targetFrame.id,
            x: itemPosition.x - targetPosition.x,
            y: itemPosition.y - targetPosition.y,
          },
          current,
          page,
        );
      });

      return reorderFrameChildren(reparentedItems, targetFrame.id, rootMoveIds, insertionIndex);
    }, { history: false });
  };

  const detachMovedItemsToCanvas = (session: Extract<DragSession, { kind: "move" }>, clientX: number, clientY: number) => {
    const movingSet = new Set(session.ids);
    const deltaX = (clientX - session.startClientX) / page.zoom;
    const deltaY = (clientY - session.startClientY) / page.zoom;

    updateActiveItems((current) => {
      const rootMoveIds = session.ids.filter((id) => {
        const item = current.find((candidate) => candidate.id === id);
        return item && !item.locked && item.parentId && (!item.parentId || !movingSet.has(item.parentId));
      });

      if (rootMoveIds.length === 0) {
        return current;
      }

      return current.map((item) => {
        if (!rootMoveIds.includes(item.id)) {
          return item;
        }

        const origin = session.absoluteOrigins[item.id] ?? getAbsolutePosition(item, current);
        return normalizeItemBounds(
          {
            ...item,
            parentId: undefined,
            x: snap(origin.x + deltaX, page.gridSize, page.snapToGrid),
            y: snap(origin.y + deltaY, page.gridSize, page.snapToGrid),
          },
          page,
        );
      });
    }, { history: false });
  };

  const startMove = (event: ReactPointerEvent<HTMLDivElement>, item: BuilderItem) => {
    if (mode !== "design" || item.locked || event.button !== 0 || canvasPanMode || spacePanActive || event.altKey) {
      return;
    }
    const target = event.target as HTMLElement;
    if (target.closest("[data-builder-resize-handle]")) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      selectItem(item.id, event);
      return;
    }

    const moveIds = (selectedIds.includes(item.id) ? selectedIds : [item.id]).filter((id) => {
      const node = items.find((candidate) => candidate.id === id);
      return node && !node.locked;
    });
    if (moveIds.length === 0) {
      return;
    }

    if (!selectedIds.includes(item.id)) {
      setSelectedId(item.id);
    }
    pushHistorySnapshot();
    setDragSession({
      kind: "move",
      ids: moveIds,
      startClientX: event.clientX,
      startClientY: event.clientY,
      origins: Object.fromEntries(
        moveIds.map((id) => {
          const node = items.find((candidate) => candidate.id === id) ?? item;
          return [id, { x: node.x, y: node.y }];
        }),
      ),
      absoluteOrigins: Object.fromEntries(
        moveIds.map((id) => {
          const node = items.find((candidate) => candidate.id === id) ?? item;
          return [id, getNodeCanvasPosition(node)];
        }),
      ),
    });
  };

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>, item: BuilderItem) => {
    if (mode !== "design" || item.locked || event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setSelectedId(item.id);
    pushHistorySnapshot();
    setDragSession({
      kind: "resize",
      id: item.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      originWidth: item.width,
      originHeight: item.height,
      originX: item.x,
      originY: item.y,
    });
  };

  const updateSelectedProps = (patch: BuilderItemProps) => {
    updateActiveItems((current) =>
      current.map((item) => (selectedIds.includes(item.id) ? { ...item, props: { ...item.props, ...patch } } : item)),
    );
  };

  const applySelectedPropertyAutoFix = () => {
    if (!selectedItem || selectedPropertyAutoFixCount === 0) {
      return;
    }
    updateSelectedProps(selectedPropertyAutoFixPatch);
  };

  const applyProjectPropertyAutoFixes = () => {
    if (projectPropertyAutoFixSummary.targets.length === 0) {
      return;
    }

    pushProjectSnapshot("批量属性 schema 修复前");
    const maintenanceEntry = createPropertyMaintenanceEntry(projectPropertyAutoFixSummary);
    const patchesByFileAndItem = new Map(projectPropertyAutoFixSummary.targets.map((target) => [`${target.fileId}:${target.itemId}`, target.patch]));
    updateActiveProject((project) => ({
      ...project,
      files: project.files.map((file) => ({
        ...file,
        items: file.items.map((item) => {
          const patch = patchesByFileAndItem.get(`${file.id}:${item.id}`);
          return patch ? { ...item, props: { ...item.props, ...patch } } : item;
        }),
      })),
      maintenanceHistory: [maintenanceEntry, ...(project.maintenanceHistory ?? [])].slice(0, 12),
      buildLog: `${project.buildLog ? `${project.buildLog}\n` : ""}${maintenanceEntry.summary}`,
    }));
  };

  const updateSelectedEventCommand = (eventName: BuilderEventName, commandId: string) => {
    const commandAcceptsValue = Boolean(activeProject.rustCommands.find((command) => command.id === commandId)?.acceptsValue);
    const patch: Partial<BuilderEventBinding> = commandAcceptsValue
      ? { commandId, passValue: true }
      : { commandId, passValue: false, payloadMode: "value", payloadFields: undefined };
    updateActiveItems((current) =>
      current.map((item) =>
        selectedIds.includes(item.id)
          ? {
              ...item,
              props: propsWithEventBindingPatch(item.props, eventName, patch),
            }
          : item,
      ),
    );
  };

  const updateSelectedEventBinding = (
    eventName: BuilderEventName,
    patch: Partial<BuilderEventBinding>,
  ) => {
    updateActiveItems((current) =>
      current.map((item) =>
        selectedIds.includes(item.id)
          ? {
              ...item,
              props: propsWithEventBindingPatch(item.props, eventName, patch),
            }
          : item,
      ),
    );
  };

  const updateSelectedStateBinding = (propName: BuilderResultTargetProp, stateId: string) => {
    updateActiveItems((current) =>
      current.map((item) => {
        if (!selectedIds.includes(item.id)) {
          return item;
        }
        const stateBindings = { ...(item.props.stateBindings ?? {}) };
        if (stateId) {
          stateBindings[propName] = stateId;
        } else {
          delete stateBindings[propName];
        }
        return {
          ...item,
          props: {
            ...item.props,
            stateBindings: Object.keys(stateBindings).length > 0 ? stateBindings : undefined,
          },
        };
      }),
    );
  };

  const previewEventRawValue = (
    item: BuilderItem,
    eventName: BuilderEventName,
    props: BuilderItemProps,
    rawValue?: unknown,
  ) => {
    if (rawValue !== undefined) {
      return rawValue;
    }
    if (eventName === "change" && (item.type === "checkbox" || item.type === "switch")) {
      return !Boolean(props.checked);
    }
    return props.value ?? props.label ?? item.name;
  };

  const runSimulatorEventForItem = (item: BuilderItem, eventName: BuilderEventName, rawValue?: unknown): SimulatorTraceEntry => {
    setMode("preview");
    const commandId = eventCommandId(item, eventName);
    const command = commandId ? activeProject.rustCommands.find((candidate) => candidate.id === commandId) ?? null : null;
    const itemName = getItemSummary(item);

    if (!command || !commandId) {
      const trace: SimulatorTraceEntry = {
        id: simulatorTraceId(),
        time: simulatorTimeLabel(),
        itemName,
        eventName,
        commandName: "Unbound event",
        status: "error",
        rawResult: "",
        message: `No Rust command bound to ${eventName}. Open Connections or create a command.`,
        patch: {},
      };
      setSimulatorTrace((current) =>
        [
          trace,
          ...current,
        ].slice(0, 10),
      );
      return trace;
    }

    const binding: BuilderEventBinding = {
      ...(item.props.events?.[eventName] ?? {}),
      commandId,
    };
    const argumentStateValues = simulatorStateValuesForArgs(activeProject, binding, simulatorStateValues);
    const props = resolveSimulatorProps(item, argumentStateValues);
    const eventRawValue = previewEventRawValue(item, eventName, props, rawValue);
    const args = simulatorArgsForEvent(activeProject, command, item, props, eventName, eventRawValue, binding, argumentStateValues);
    const commandName = sanitizeRustCommandName(command.name);
    const message = simulatorRunMessage(command.response, eventName, commandName);
    const resultSchema = commandResultSchema(command);
    const resultPatchByName: Record<string, string> = {};
    if (resultSchema.mode === "json" && binding.applyJsonStatePatch && binding.resultStateId) {
      const state = activeProject.stateVariables.find((candidate) => candidate.id === binding.resultStateId);
      if (state) {
        resultPatchByName[state.name || state.id] = message;
      }
    }
    const rawResult =
      resultSchema.mode === "json"
        ? JSON.stringify({
            success: true,
            message,
            patch: resultPatchByName,
          })
        : message;
    const outcome = simulatorOutcomeFromResult(activeProject, command, rawResult, binding);
    const patch = { ...outcome.patch };

    if (!outcome.error && binding.resultStateId) {
      patch[binding.resultStateId] = outcome.message;
    }

    const targetItem = binding.resultTargetItemId ? items.find((candidate) => candidate.id === binding.resultTargetItemId) : null;
    const target = targetItem && binding.resultTargetProp ? `${getItemSummary(targetItem)}.${binding.resultTargetProp}` : undefined;
    const traceStatus: SimulatorTraceEntry["status"] = outcome.error ? "error" : "success";

    if (Object.keys(patch).length > 0) {
      setSimulatorStateValues((current) => ({
        ...current,
        ...patch,
      }));
    }

    const trace: SimulatorTraceEntry = {
      id: simulatorTraceId(),
      time: simulatorTimeLabel(),
      itemName,
      eventName,
      commandName,
      status: traceStatus,
      args,
      rawResult,
      message: outcome.message,
      patch,
      target,
    };

    setSimulatorTrace((current) =>
      [
        trace,
        ...current,
      ].slice(0, 10),
    );
    return trace;
  };

  const simulateSelectedEvent = (options: { recordTask?: boolean } = {}) => {
    if (!selectedItem || !selectedEventName) {
      if (options.recordTask !== false) {
        recordInstantProjectAction("run-selected-event", "Select a control with an event before running it.", "skipped");
      }
      return;
    }
    const trace = runSimulatorEventForItem(selectedItem, selectedEventName);
    if (options.recordTask !== false) {
      const summary =
        trace.status === "success"
          ? `Ran ${trace.itemName} ${trace.eventName} with ${trace.commandName}.`
          : `Failed to run ${trace.itemName} ${trace.eventName}: ${trace.message}`;
      recordInstantProjectAction("run-selected-event", summary, trace.status === "success" ? "succeeded" : "failed");
    }
    return trace;
  };

  const applyLayoutPatchForActiveBreakpoint = (item: BuilderItem, patch: ResponsiveOverride, current: BuilderItem[]) => {
    const visualItems = resolveItemsForBreakpoint(current, activeBreakpoint);
    const visualItem = resolveItemForBreakpoint(item, activeBreakpoint);
    const nextVisualItem = normalizeItemBoundsInTree({ ...visualItem, ...patch }, visualItems, page);

    if (activeBreakpoint === "desktop") {
      return nextVisualItem;
    }

    return withResponsiveLayoutOverride(item, activeBreakpoint, {
      x: nextVisualItem.x,
      y: nextVisualItem.y,
      width: nextVisualItem.width,
      height: nextVisualItem.height,
    });
  };

  const toggleSelectedConstraint = (key: "constraintLeft" | "constraintRight" | "constraintTop" | "constraintBottom") => {
    if (!selectedItem) {
      return;
    }
    const current = itemConstraints(selectedItem);
    const currentValue =
      key === "constraintLeft" ? current.left : key === "constraintRight" ? current.right : key === "constraintTop" ? current.top : current.bottom;
    updateSelectedProps({ [key]: !currentValue } as BuilderItemProps);
  };

  const resetSelectedBreakpointOverride = () => {
    if (!selectedItem || activeBreakpoint === "desktop") {
      return;
    }
    updateActiveItems((current) =>
      current.map((item) => {
        if (!selectedIds.includes(item.id) || !item.responsive?.[activeBreakpoint]) {
          return item;
        }
        const nextResponsive = { ...item.responsive };
        delete nextResponsive[activeBreakpoint];
        return {
          ...item,
          responsive: Object.keys(nextResponsive).length > 0 ? nextResponsive : undefined,
        };
      }),
    );
  };

  const updateSelectedLayout = (patch: Partial<Pick<BuilderItem, "x" | "y" | "width" | "height">>) => {
    updateActiveItems((current) => {
      let next = current;
      for (const id of selectedIds) {
        const previousItem = next.find((item) => item.id === id);
        if (!previousItem) {
          continue;
        }
        const nextItem = applyLayoutPatchForActiveBreakpoint(previousItem, patch, next);
        next =
          activeBreakpoint === "desktop"
            ? replaceItemAndApplyResizeConstraints(next, previousItem, nextItem, page)
            : next.map((item) => (item.id === previousItem.id ? nextItem : item));
      }
      return next;
    });
  };

  const updateSelectedParent = (parentId: string) => {
    if (!selectedItem) {
      return;
    }

    const nextParentId = parentId === "__canvas" ? undefined : parentId;
    updateActiveItems((current) => {
      const item = current.find((candidate) => candidate.id === selectedItem.id);
      if (!item) {
        return current;
      }

      const nextParent = nextParentId ? current.find((candidate) => candidate.id === nextParentId && candidate.type === "frame") : null;
      if (nextParentId && (!nextParent || nextParent.id === item.id || isDescendantOf(nextParent.id, item.id, current))) {
        return current;
      }

      const itemAbsolute = getAbsolutePosition(item, current);
      const parentAbsolute = nextParent ? getAbsolutePosition(nextParent, current) : { x: 0, y: 0 };
      const nextItem = normalizeItemBoundsInTree(
        {
          ...item,
          parentId: nextParent?.id,
          x: itemAbsolute.x - parentAbsolute.x,
          y: itemAbsolute.y - parentAbsolute.y,
        },
        current,
        page,
      );

      return current.map((candidate) => (candidate.id === item.id ? nextItem : candidate));
    });
  };

  const nudgeSelected = (deltaX: number, deltaY: number) => {
    updateActiveItems((current) =>
      current.map((item) =>
        selectedIds.includes(item.id) && !item.locked
          ? (() => {
              const visualItem = resolveItemForBreakpoint(item, activeBreakpoint);
              return applyLayoutPatchForActiveBreakpoint(item, { x: visualItem.x + deltaX, y: visualItem.y + deltaY }, current);
            })()
          : item,
      ),
    );
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) {
      return;
    }
    updateActiveItems((current) => {
      const deletableRoots = selectedIds.filter((id) => !current.find((item) => item.id === id)?.locked);
      const deletedIds = collectDescendantIds(deletableRoots, current);
      return current.filter((item) => !deletedIds.has(item.id));
    });
    clearSelection();
  };

  const duplicateSelected = () => {
    if (selectedItems.length === 0) {
      return;
    }
    const duplicateIds = collectDescendantIds(selectedIds, items);
    const sourceItems = items.filter((item) => duplicateIds.has(item.id)).sort((a, b) => a.z - b.z);
    const idMap = new Map(sourceItems.map((item) => [item.id, createId()]));
    const nextItems = sourceItems.map((item, index) => {
      const hasDuplicatedParent = Boolean(item.parentId && idMap.has(item.parentId));
      return normalizeItemBoundsInTree(
        {
          ...item,
          id: idMap.get(item.id)!,
          parentId: item.parentId ? idMap.get(item.parentId) ?? item.parentId : undefined,
          x: hasDuplicatedParent ? item.x : item.x + page.gridSize * 3,
          y: hasDuplicatedParent ? item.y : item.y + page.gridSize * 3,
          z: Math.max(0, ...items.map((node) => node.z)) + index + 1,
          locked: false,
          responsive: cloneResponsiveOverrides(item.responsive),
          props: { ...item.props },
        },
        [...items, ...sourceItems],
        page,
      );
    });
    updateActiveItems((current) => [...current, ...nextItems]);
    setSelectedIds(nextItems.map((item) => item.id));
  };

  const toggleSelectedLock = () => {
    updateActiveItems((current) => current.map((item) => (selectedIds.includes(item.id) ? { ...item, locked: !item.locked } : item)));
  };

  const moveLayer = (id: string, direction: 1 | -1) => {
    updateActiveItems((current) => {
      const ordered = [...current].sort((a, b) => a.z - b.z);
      const index = ordered.findIndex((item) => item.id === id);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
        return current;
      }
      const next = [...ordered];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next.map((node, nodeIndex) => ({ ...node, z: nodeIndex + 1 }));
    });
  };

  const bringToFront = () => {
    if (selectedItems.length === 0) {
      return;
    }
    updateActiveItems((current) => {
      const baseZ = Math.max(0, ...current.map((node) => node.z));
      let offset = 1;
      return current.map((item) => {
        if (!selectedIds.includes(item.id)) {
          return item;
        }
        const next = { ...item, z: baseZ + offset };
        offset += 1;
        return next;
      });
    });
  };

  const sendToBack = () => {
    if (selectedItems.length === 0) {
      return;
    }
    updateActiveItems((current) => {
      const baseZ = Math.min(0, ...current.map((node) => node.z));
      let offset = selectedIds.length;
      return current.map((item) => {
        if (!selectedIds.includes(item.id)) {
          return item;
        }
        const next = { ...item, z: baseZ - offset };
        offset -= 1;
        return next;
      });
    });
  };

  const copySelectionToClipboard = () => {
    if (selectedItems.length === 0) {
      return;
    }
    const copiedIds = collectDescendantIds(selectedIds, items);
    clipboardRef.current = items
      .filter((item) => copiedIds.has(item.id))
      .sort((a, b) => a.z - b.z)
      .map((item) => ({ ...item, responsive: cloneResponsiveOverrides(item.responsive), props: { ...item.props } }));
    setClipboardVersion((version) => version + 1);
  };

  const pasteClipboardItems = () => {
    if (clipboardRef.current.length === 0) {
      return;
    }
    const idMap = new Map(clipboardRef.current.map((item) => [item.id, createId()]));
    const pastedItems = clipboardRef.current.map((item, index) => {
      const hasPastedParent = Boolean(item.parentId && idMap.has(item.parentId));
      return normalizeItemBoundsInTree(
        {
          ...item,
          id: idMap.get(item.id)!,
          parentId: item.parentId ? idMap.get(item.parentId) ?? item.parentId : undefined,
          x: hasPastedParent ? item.x : item.x + page.gridSize * 4,
          y: hasPastedParent ? item.y : item.y + page.gridSize * 4,
          z: Math.max(0, ...items.map((node) => node.z)) + index + 1,
          locked: false,
          responsive: cloneResponsiveOverrides(item.responsive),
          props: { ...item.props },
        },
        [...items, ...clipboardRef.current],
        page,
      );
    });
    updateActiveItems((current) => [...current, ...pastedItems]);
    setSelectedIds(pastedItems.map((item) => item.id));
    clipboardRef.current = pastedItems.map((item) => ({ ...item, responsive: cloneResponsiveOverrides(item.responsive), props: { ...item.props } }));
    setClipboardVersion((version) => version + 1);
  };

  const alignSelected = (alignment: AlignmentMode) => {
    const movableItems = selectedItems.filter((item) => !item.locked);
    const bounds = getSelectionBounds(movableItems);
    if (!bounds || movableItems.length < 2) {
      return;
    }

    updateActiveItems((current) =>
      current.map((item) => {
        if (!selectedIds.includes(item.id) || item.locked) {
          return item;
        }

        if (alignment === "left") {
          return normalizeItemBounds({ ...item, x: bounds.left }, page);
        }
        if (alignment === "center") {
          return normalizeItemBounds({ ...item, x: bounds.left + bounds.width / 2 - item.width / 2 }, page);
        }
        if (alignment === "right") {
          return normalizeItemBounds({ ...item, x: bounds.right - item.width }, page);
        }
        if (alignment === "top") {
          return normalizeItemBounds({ ...item, y: bounds.top }, page);
        }
        if (alignment === "middle") {
          return normalizeItemBounds({ ...item, y: bounds.top + bounds.height / 2 - item.height / 2 }, page);
        }
        return normalizeItemBounds({ ...item, y: bounds.bottom - item.height }, page);
      }),
    );
  };

  const applyProjectPaths = (paths: EditorProjectPaths, log?: string) => {
    updateActiveProject((project) => ({
      ...project,
      rootPath: paths.root_path,
      outputExePath: paths.output_exe_path ?? project.outputExePath,
      rustSourceMapPath: paths.rust_source_map_path,
      generatedRustSourceMapPath: paths.generated_rust_source_map_path,
      buildLog: log ?? project.buildLog,
    }));
  };

  const applyValidationResult = (result: ValidationResult, auditSnapshot = windowVisualAudit) => {
    const historyEntry = createValidationHistoryEntry(result, auditSnapshot);
    updateActiveProject((project) => ({
      ...project,
      rootPath: result.paths.root_path,
      outputExePath: result.paths.output_exe_path ?? project.outputExePath,
      validationLog: result.log,
      validationReportPath: result.report_path,
      validationSnapshotPath: result.snapshot_path,
      validationScreenshotPath: result.screenshot_path ?? project.validationScreenshotPath,
      validationScreenshotAnalysisPath: result.screenshot_analysis_path ?? project.validationScreenshotAnalysisPath,
      validationRuntimeAuditPath: result.runtime_audit_path ?? project.validationRuntimeAuditPath,
      validationBreakpointPath: result.breakpoint_validation_path ?? project.validationBreakpointPath,
      validationBreakpointIssues: normalizeBreakpointValidationIssues(result.breakpoint_issues),
      validationHistory: [historyEntry, ...(project.validationHistory ?? [])].slice(0, 12),
      buildLog: result.log,
    }));
    return historyEntry;
  };

  const runGeneratedWindowValidation = async (projectSnapshot: DesignerProject, auditSnapshot = windowVisualAudit) => {
    const result = await invokeIfAvailable<ValidationResult>("validate_generated_window", {
      project: projectSnapshot,
      rustLogic: projectSnapshot.rustLogic,
    });

    if (!result) {
      const message = "Window validation is available in the Tauri desktop app. The web preview can run the in-editor visual audit only.";
      updateActiveProject((project) => ({
        ...project,
        validationLog: message,
        buildLog: message,
      }));
      return null;
    }

    const historyEntry = applyValidationResult(result, auditSnapshot);
    recordProjectDependencyGraphEvent(
      {
        kind: "validation",
        actionId: "validate-window",
        status: historyEntry.status === "failed" ? "failed" : "succeeded",
        summary: historyEntry.summary,
        artifactPath: result.report_path,
      },
      projectChangeImpact,
      { ...projectSnapshot, rootPath: result.paths.root_path, outputExePath: result.paths.output_exe_path ?? projectSnapshot.outputExePath },
    );
    return result;
  };

  const refreshBackendArtifactInspection = async (projectSnapshot = activeProject) => {
    if (!isTauriRuntime()) {
      setBackendArtifactInspection(null);
      return null;
    }

    setCheckingBackendArtifacts(true);
    try {
      const result = await invokeIfAvailable<BackendArtifactInspectionResult>("inspect_backend_artifacts", {
        project: projectSnapshot,
      });
      if (result) {
        setBackendArtifactInspection(result);
      }
      return result;
    } catch (error) {
      setBuildError(String(error));
      return null;
    } finally {
      setCheckingBackendArtifacts(false);
    }
  };

  const runBackendArtifactBuild = async (integration: BackendIntegration, projectSnapshot = activeProject) => {
    const result = await invokeIfAvailable<BackendArtifactBuildResult>("build_backend_artifact", {
      project: projectSnapshot,
      integrationId: integration.id,
    });
    if (!result) {
      throw new Error("No backend artifact build result was returned.");
    }
    setBackendArtifactBuildResult(result);
    updateActiveProject((project) => ({
      ...project,
      buildLog: [project.buildLog, result.log || result.summary].filter(Boolean).join("\n"),
    }));
    return result;
  };

  const buildActiveBackendArtifact = async () => {
    const integration = activeBackendIntegration;
    if (!backendArtifactStarterBuildAvailable(integration)) {
      setBuildError("This backend integration does not have a Nova starter build script. Use Artifact status to verify script/resource folders.");
      return;
    }
    if (!isTauriRuntime()) {
      setBuildError("Backend artifact builds require the Nova desktop app runtime.");
      return;
    }

    setBuildingBackendArtifactId(integration.id);
    setBuildError("");
    try {
      const result = await runBackendArtifactBuild(integration, activeProject);
      if (!result.success) {
        setBuildError(result.summary);
      }
      void refreshBackendArtifactInspection(activeProject);
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setBuildingBackendArtifactId("");
    }
  };

  const buildProjectBackendArtifacts = async (): Promise<ProjectTaskRunResult> => {
    if (!isTauriRuntime()) {
      return { status: "skipped", summary: "Backend artifact builds require the Nova desktop app runtime." };
    }
    const projectSnapshot = activeProject;
    const buildableIntegrations = projectSnapshot.backendIntegrations.filter(backendArtifactStarterBuildAvailable);
    if (buildableIntegrations.length === 0) {
      await refreshBackendArtifactInspection(projectSnapshot);
      return {
        status: "skipped",
        summary: "No enabled C++ FFI or Go starter backend integrations need artifact builds.",
        artifactPath: projectSnapshot.rootPath,
      };
    }

    setBuildError("");
    const results: BackendArtifactBuildResult[] = [];
    const errors: string[] = [];
    for (const integration of buildableIntegrations) {
      setBuildingBackendArtifactId(integration.id);
      try {
        results.push(await runBackendArtifactBuild(integration, projectSnapshot));
      } catch (error) {
        errors.push(`${integration.name}: ${String(error)}`);
      }
    }
    setBuildingBackendArtifactId("");
    await refreshBackendArtifactInspection(projectSnapshot);

    const failures = results.filter((result) => !result.success);
    const status: ProjectTaskRunResult["status"] = failures.length || errors.length ? "failed" : "succeeded";
    const summary =
      status === "succeeded"
        ? `Built ${results.length} backend artifact(s).`
        : `Backend artifact build finished with ${failures.length + errors.length} failure(s).`;
    const logPreview = [
      ...results.map((result) => `${result.integration_name}: ${result.summary}`),
      ...errors,
    ].join("\n");
    if (status === "failed") {
      setBuildError(logPreview || summary);
    }
    return {
      status,
      summary,
      logPreview,
      artifactPath: projectSnapshot.rootPath,
    };
  };

  const refreshManagedProjects = async () => {
    try {
      const projects = await invokeIfAvailable<ManagedProjectSummary[]>("list_editor_projects", {});
      if (projects) {
        setManagedProjects(projects);
      }
    } catch (error) {
      setBuildError(String(error));
    }
  };

  const refreshDiskCheckpoints = async (rootPath = activeProject.rootPath) => {
    if (!rootPath || !isTauriRuntime()) {
      setDiskCheckpoints([]);
      return;
    }

    try {
      const checkpoints = await invokeIfAvailable<EditorProjectCheckpoint[]>("list_project_checkpoints", {
        rootPath,
      });
      if (checkpoints) {
        setDiskCheckpoints(checkpoints);
      }
    } catch (error) {
      setBuildError(String(error));
    }
  };

  const persistDiskCheckpoint = async (label: string) => {
    const result = await invokeIfAvailable<EditorProjectCheckpointResult>("create_project_checkpoint", {
      project: activeProject,
      rustLogic: activeProject.rustLogic,
      label,
      createdAt: new Date().toISOString(),
    });
    if (!result) {
      return null;
    }

    applyProjectPaths(result.paths);
    setDiskCheckpoints((current) => [result.checkpoint, ...current.filter((checkpoint) => checkpoint.id !== result.checkpoint.id)].slice(0, 12));
    setCheckpointDiff(null);
    void refreshManagedProjects();
    return result;
  };

  const createDiskCheckpoint = async () => {
    if (typeof window === "undefined") {
      return;
    }

    setDiskBusy(true);
    setBuildError("");
    try {
      const label = checkpointLabel.trim() || "Manual checkpoint";
      const result = await persistDiskCheckpoint(label);
      if (!result) {
        setBuildError("磁盘版本历史需要在 Tauri 桌面 app 中运行。");
        return;
      }

      setCheckpointLabel("");
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1400);
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setDiskBusy(false);
    }
  };

  const inspectDiskCheckpointDiff = async (checkpoint: EditorProjectCheckpoint) => {
    const rootPath = activeProject.rootPath;
    if (!rootPath) {
      setBuildError("请先保存项目或创建一个磁盘检查点，再查看版本差异。");
      return;
    }

    setCheckpointDiffLoadingId(checkpoint.id);
    setBuildError("");
    try {
      const diff = await invokeIfAvailable<EditorProjectCheckpointDiff>("diff_project_checkpoint", {
        project: activeProject,
        rustLogic: activeProject.rustLogic,
        rootPath,
        checkpointId: checkpoint.id,
      });
      if (!diff) {
        setBuildError("版本差异需要在 Tauri 桌面 app 中运行。");
        return;
      }
      setCheckpointDiff(diff);
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setCheckpointDiffLoadingId("");
    }
  };

  const restoreDiskCheckpoint = async (checkpoint: EditorProjectCheckpoint) => {
    const rootPath = activeProject.rootPath;
    if (!rootPath) {
      setBuildError("请先保存项目或创建一个磁盘检查点，再恢复历史版本。");
      return;
    }

    pushProjectSnapshot(`恢复磁盘版本 ${checkpoint.label} 前`);
    setDiskBusy(true);
    setBuildError("");
    try {
      const restoredProject = await invokeIfAvailable<DesignerProject>("restore_project_checkpoint", {
        rootPath,
        checkpointId: checkpoint.id,
      });
      if (!restoredProject) {
        setBuildError("恢复磁盘版本需要在 Tauri 桌面 app 中运行。");
        return;
      }

      const workspace = normalizeDesignerWorkspace({ projects: [restoredProject], activeProjectId: restoredProject.id });
      if (workspace) {
        const nextProject = workspace.projects.find((project) => project.id === workspace.activeProjectId) ?? workspace.projects[0];
        const nextFile = nextProject.files.find((file) => file.id === nextProject.activeFileId) ?? nextProject.files[0];
        setWorkspace(workspace);
        setSelectedId(nextFile?.items[0]?.id ?? "");
        setCheckpointDiff(null);
        setMode("design");
        void refreshDiskCheckpoints(nextProject.rootPath ?? rootPath);
        void refreshReleasePipelineRecords(nextProject);
        void refreshManagedProjects();
      }
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setDiskBusy(false);
    }
  };

  const saveWorkspace = async () => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(DESIGNER_WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));

    setDiskBusy(true);
    setBuildError("");
    try {
      const paths = await invokeIfAvailable<EditorProjectPaths>("save_editor_project", {
        project: activeProject,
        rustLogic: activeProject.rustLogic,
      });
      if (paths) {
        applyProjectPaths(paths);
        void refreshManagedProjects();
        void refreshDiskCheckpoints(paths.root_path);
        void refreshReleasePipelineRecords({ ...activeProject, rootPath: paths.root_path });
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1400);
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setDiskBusy(false);
    }
  };

  const loadWorkspace = () => {
    const savedWorkspace = loadDesignerWorkspace();
    if (!savedWorkspace) {
      return;
    }
    setWorkspace(savedWorkspace);
    const nextProject = savedWorkspace.projects.find((project) => project.id === savedWorkspace.activeProjectId) ?? savedWorkspace.projects[0];
    const nextFile = nextProject.files.find((file) => file.id === nextProject.activeFileId) ?? nextProject.files[0];
    setSelectedId(nextFile.items[0]?.id ?? "");
    setMode("design");
  };

  const resetCurrentFile = () => {
    updateActiveFile((file) => ({
      ...file,
      page: { ...defaultPage, title: file.name.replace(/\.ui$/i, "") || "Untitled Interface" },
      items: [],
    }));
    setSelectedId("");
    setMode("design");
  };

  const createNewProject = () => {
    const template = projectTemplateById(selectedProjectTemplateId);
    const nextProject = createProject(`${template.defaultName} ${workspace.projects.length + 1}`, selectedProjectTemplateId);
    setWorkspace((current) => ({
      ...current,
      projects: [...current.projects, nextProject],
      activeProjectId: nextProject.id,
    }));
    setSelectedId("");
    setMode("design");
  };

  const replaceActiveProjectWithTemplate = () => {
    pushProjectSnapshot(`替换为 ${selectedProjectTemplate.title} 前`);
    const templateProject = createProject(activeProject.name || selectedProjectTemplate.defaultName, selectedProjectTemplateId);
    const nextProject: DesignerProject = {
      ...templateProject,
      id: activeProject.id,
      name: activeProject.name || templateProject.name,
      rootPath: activeProject.rootPath,
      releaseConfig: activeProject.releaseConfig,
      createdAt: activeProject.createdAt,
      updatedAt: new Date().toISOString(),
    };
    const nextFile = nextProject.files.find((file) => file.id === nextProject.activeFileId) ?? nextProject.files[0];
    setWorkspace((current) => ({
      ...current,
      projects: current.projects.map((project) => (project.id === current.activeProjectId ? nextProject : project)),
      activeProjectId: nextProject.id,
    }));
    setSelectedId(nextFile?.items[0]?.id ?? "");
    setBuildError("");
    setReplaceTemplateOpen(false);
    setMode("design");
  };

  const selectProject = (projectId: string) => {
    setWorkspace((current) => ({
      ...current,
      activeProjectId: projectId,
    }));
    const nextProject = workspace.projects.find((project) => project.id === projectId);
    const nextFile = nextProject?.files.find((file) => file.id === nextProject.activeFileId) ?? nextProject?.files[0];
    setSelectedId(nextFile?.items[0]?.id ?? "");
    setMode("design");
  };

  const deleteActiveProject = () => {
    if (workspace.projects.length <= 1) {
      const nextProject = createProject("Nova Project");
      setWorkspace(createWorkspace(nextProject));
      setSelectedId("");
      setMode("design");
      return;
    }

    setWorkspace((current) => {
      const nextProjects = current.projects.filter((project) => project.id !== current.activeProjectId);
      return {
        projects: nextProjects,
        activeProjectId: nextProjects[0].id,
      };
    });
    setSelectedId("");
    setMode("design");
  };

  const renameActiveProject = (name: string) => {
    updateActiveProject((project) => ({
      ...project,
      name: name || "Untitled Project",
    }));
  };

  const updateProjectRootPath = (rootPath: string) => {
    updateActiveProject((project) => ({
      ...project,
      rootPath,
    }));
  };

  const updateReleaseConfig = (patch: Partial<ProjectReleaseConfig>) => {
    updateActiveProject((project) => ({
      ...project,
      releaseConfig: { ...project.releaseConfig, ...patch },
    }));
  };

  const bumpActiveReleaseVersion = async (bump: ReleaseVersionBump) => {
    const currentVersion = normalizeReleaseVersion(activeProject.releaseConfig.version);
    const nextVersion = bumpReleaseVersion(currentVersion, bump);
    setBuildError("");

    if (isTauriRuntime()) {
      setDiskBusy(true);
      try {
        const checkpoint = await persistDiskCheckpoint(`Before ${bump} release ${currentVersion} -> ${nextVersion}`);
        if (!checkpoint) {
          setBuildError("版本发布前检查点需要在 Tauri 桌面 app 中运行。");
          return;
        }
      } catch (error) {
        setBuildError(String(error));
        return;
      } finally {
        setDiskBusy(false);
      }
    }

    updateActiveProject((project) => ({
      ...project,
      releaseConfig: {
        ...project.releaseConfig,
        version: nextVersion,
        releaseNotes:
          !project.releaseConfig.releaseNotes.trim() || project.releaseConfig.releaseNotes === defaultReleaseNotes(currentVersion)
            ? defaultReleaseNotes(nextVersion)
            : project.releaseConfig.releaseNotes,
      },
    }));
  };

  const addAssetToProject = (sourcePath: string) => {
    const asset = createAssetFromPath(sourcePath, activeProject.assets.length);
    updateActiveProject((project) => ({
      ...project,
      assets: [...project.assets, asset],
    }));
    return asset;
  };

  const chooseImageAsset = async (): Promise<DesignerAsset | null> => {
    if (!isTauriRuntime()) {
      setBuildError("导入本地图片资源需要在 Tauri 桌面 app 中运行。");
      return null;
    }

    setDiskBusy(true);
    setBuildError("");
    try {
      const selected = await open({
        multiple: false,
        title: "选择图片资源",
        filters: [
          {
            name: "Images",
            extensions: ["png", "jpg", "jpeg", "webp", "gif", "svg"],
          },
        ],
      });
      const sourcePath = Array.isArray(selected) ? selected[0] : selected;
      if (!sourcePath) {
        return null;
      }
      return addAssetToProject(sourcePath);
    } catch (error) {
      setBuildError(String(error));
      return null;
    } finally {
      setDiskBusy(false);
    }
  };

  const chooseSigningCertificate = async () => {
    if (!isTauriRuntime()) {
      setBuildError("选择签名证书需要在 Tauri 桌面 app 中运行。");
      return;
    }

    setDiskBusy(true);
    setBuildError("");
    try {
      const selected = await open({
        multiple: false,
        title: "选择 PFX/P12 签名证书",
        filters: [
          {
            name: "Signing certificates",
            extensions: ["pfx", "p12"],
          },
        ],
      });
      const sourcePath = Array.isArray(selected) ? selected[0] : selected;
      if (!sourcePath) {
        return;
      }
      updateReleaseConfig({
        certificateSourcePath: sourcePath,
        importCertificateBeforeBuild: true,
      });
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setDiskBusy(false);
    }
  };

  const inspectCertificateStore = async () => {
    const thumbprint = activeProject.releaseConfig.certificateThumbprint.trim();
    if (!thumbprint) {
      setBuildError("请先填写证书 thumbprint，再检查 Windows certificate store。");
      return;
    }
    setCheckingCertificateStore(true);
    setBuildError("");
    try {
      const result = await invokeIfAvailable<WindowsCertificateInspectionResult>("inspect_windows_certificate_store", {
        thumbprint,
      });
      if (!result) {
        setBuildError("检查 Windows certificate store 需要在 Tauri 桌面 app 中运行。");
        return;
      }
      setCertificateInspection(result);
      updateActiveProject((project) => ({
        ...project,
        buildLog: `${result.summary}\n${project.buildLog || ""}`.trim(),
      }));
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setCheckingCertificateStore(false);
    }
  };

  const deleteAsset = (assetId: string) => {
    updateActiveProject((project) => ({
      ...project,
      assets: project.assets.filter((asset) => asset.id !== assetId),
      files: project.files.map((file) => ({
        ...file,
        items: file.items.map((item) =>
          item.props.assetId === assetId
            ? {
                ...item,
                props: {
                  ...item.props,
                  assetId: "",
                  assetPath: "",
                },
              }
            : item,
        ),
      })),
    }));
  };

  const addImageFromAsset = (asset: DesignerAsset) => {
    const item = createItem("image", page, items.length);
    const nextItem: BuilderItem = {
      ...item,
      props: {
        ...item.props,
        label: asset.name,
        alt: asset.name,
        assetId: asset.id,
        assetPath: asset.publicPath,
      },
    };
    updateActiveItems((current) => [...current, nextItem]);
    setSelectedId(nextItem.id);
    setMode("design");
  };

  const bindSelectedImageAsset = (assetId: string) => {
    const asset = activeProject.assets.find((candidate) => candidate.id === assetId);
    updateSelectedProps({
      assetId,
      assetPath: asset?.publicPath ?? "",
      label: asset?.name ?? "Image",
      alt: asset?.name ?? selectedItem?.props.alt ?? "Project asset",
    });
  };

  const openProjectRoot = async (rootPath: string) => {
    if (!rootPath) {
      setBuildError("请先填写项目目录路径。");
      return;
    }

    setDiskBusy(true);
    setBuildError("");
    try {
      const project = await invokeIfAvailable<DesignerProject>("read_editor_project", {
        rootPath,
      });
      if (!project) {
        setBuildError("打开磁盘项目需要在 Tauri 桌面 app 中运行。");
        return;
      }
      const workspace = normalizeDesignerWorkspace({ projects: [project], activeProjectId: project.id });
      if (workspace) {
        const nextProject = workspace.projects.find((candidate) => candidate.id === workspace.activeProjectId) ?? workspace.projects[0];
        setWorkspace(workspace);
        setSelectedId("");
        setMode("design");
        void refreshDiskCheckpoints(nextProject.rootPath ?? rootPath);
        void refreshReleasePipelineRecords(nextProject);
      }
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setDiskBusy(false);
    }
  };

  const openProjectFromDisk = async () => {
    await openProjectRoot(activeProject.rootPath ?? "");
  };

  const chooseProjectDirectory = async () => {
    if (!isTauriRuntime()) {
      setBuildError("原生文件夹选择需要在 Tauri 桌面 app 中运行。");
      return;
    }

    setDiskBusy(true);
    setBuildError("");
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "选择 Nova UI 项目目录",
      });
      const rootPath = Array.isArray(selected) ? selected[0] : selected;
      if (!rootPath) {
        return;
      }
      updateProjectRootPath(rootPath);
      await openProjectRoot(rootPath);
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setDiskBusy(false);
    }
  };

  const updateRustLogic = (rustLogic: string) => {
    setRustDiagnosticTarget(null);
    updateActiveProject((project) => ({
      ...project,
      rustLogic,
    }));
  };

  const focusRustDiagnostic = (diagnostic: BuildDiagnostic) => {
    const location = rustDiagnosticSourceLocation(diagnostic, activeProject.rustLogic);
    if (!location || !diagnostic.line) {
      setBuildError("这个诊断来自生成 app 的非编辑器 Rust 逻辑文件，请查看完整构建日志。");
      return;
    }

    setRustDiagnosticTarget({
      file: diagnostic.file,
      sourceFile: diagnostic.sourceFile,
      sourceKind: diagnostic.sourceKind,
      sourceSummary: diagnostic.sourceSummary,
      message: diagnostic.message,
      generatedLine: diagnostic.line,
      sourceLine: location.sourceLine,
      column: location.column,
      mappedToSource: location.mappedToSource,
    });
    setBuildError("");
    setMode("logic");
  };

  const openBuildDiagnostic = (diagnostic: BuildDiagnostic, index: number, focusEditable = true) => {
    setSelectedBuildDiagnosticKey(buildDiagnosticKey(diagnostic, index));
    openBottomDock("issues");
    if (focusEditable && isEditableRustDiagnostic(diagnostic)) {
      focusRustDiagnostic(diagnostic);
    }
  };

  const selectRustCommand = (commandId: string) => {
    updateActiveProject((project) => ({
      ...project,
      activeRustCommandId: commandId,
    }));
  };

  const updateRustCommand = (commandId: string, patch: Partial<RustCommand>) => {
    updateActiveProject((project) => {
      const commands = normalizeRustCommands(
        project.rustCommands.map((command) =>
          command.id === commandId
            ? {
                ...command,
                ...patch,
              }
            : command,
        ),
      );
      const files =
        patch.acceptsValue === false
          ? project.files.map((file) => ({
              ...file,
              items: file.items.map((item) => ({
                ...item,
                props: propsWithoutPayloadForCommand(item.props, commandId),
              })),
            }))
          : project.files;

      return {
        ...project,
        rustCommands: commands,
        files,
        activeRustCommandId: commands.some((command) => command.id === project.activeRustCommandId)
          ? project.activeRustCommandId
          : commands[0].id,
        rustLogic: createRustLogic(commands, project.backendIntegrations),
      };
    });
  };

  const setRustCommandAcceptsArgs = (commandId: string, acceptsValue: boolean) => {
    const parameters = acceptsValue ? rustCommandParameters(activeRustCommand) : [];
    updateRustCommand(commandId, {
      acceptsValue,
      parameters: acceptsValue ? (parameters.length > 0 ? parameters : [createRustCommandParameter(0)]) : undefined,
    });
  };

  const addRustCommandParameter = () => {
    const parameters = rustCommandParameters(activeRustCommand);
    updateRustCommand(activeRustCommand.id, {
      acceptsValue: true,
      parameters: [...parameters, createRustCommandParameter(parameters.length, parameters.length === 0 ? "value" : "event")],
    });
  };

  const updateRustCommandParameter = (parameterId: string, patch: Partial<RustCommandParameter>) => {
    const parameters = rustCommandParameters(activeRustCommand).map((parameter) =>
      parameter.id === parameterId ? { ...parameter, ...patch } : parameter,
    );
    updateRustCommand(activeRustCommand.id, {
      acceptsValue: true,
      parameters,
    });
  };

  const deleteRustCommandParameter = (parameterId: string) => {
    const parameters = rustCommandParameters(activeRustCommand).filter((parameter) => parameter.id !== parameterId);
    updateRustCommand(activeRustCommand.id, {
      acceptsValue: parameters.length > 0,
      parameters: parameters.length > 0 ? parameters : undefined,
    });
  };

  const setRustCommandResultMode = (mode: RustCommandResultSchema["mode"]) => {
    updateRustCommand(activeRustCommand.id, {
      result: mode === "json" ? defaultJsonResultSchema : undefined,
    });
  };

  const updateRustCommandResult = (patch: Partial<RustCommandResultSchema>) => {
    const current = commandResultSchema(activeRustCommand);
    updateRustCommand(activeRustCommand.id, {
      result: {
        ...(current.mode === "json" ? defaultJsonResultSchema : defaultRustCommandResult),
        ...current,
        ...patch,
      },
    });
  };

  const createRustCommandInProject = () => {
    updateActiveProject((project) => {
      const command = createRustCommand(project.rustCommands.length + 1);
      const commands = normalizeRustCommands([...project.rustCommands, command]);
      return {
        ...project,
        rustCommands: commands,
        activeRustCommandId: command.id,
        rustLogic: createRustLogic(commands, project.backendIntegrations),
      };
    });
  };

  const createRustCommandFromBackendIntegration = () => {
    updateActiveProject((project) => {
      const integration =
        project.backendIntegrations.find((candidate) => candidate.id === project.activeBackendIntegrationId) ??
        project.backendIntegrations[0];
      if (!integration) {
        return project;
      }
      const command = createBackendIntegrationCommand(integration, project.rustCommands.length + 1, activeBackendMethod(integration));
      const commands = normalizeRustCommands([...project.rustCommands, command]);
      return {
        ...project,
        rustCommands: commands,
        activeRustCommandId: command.id,
        rustLogic: createRustLogic(commands, project.backendIntegrations),
      };
    });
  };

  const createAndBindBackendIntegrationCommand = (options: { recordTask?: boolean } = {}) => {
    if (!selectedItem || !selectedEventName) {
      if (options.recordTask !== false) {
        recordInstantProjectAction("bind-control-event", "Select a control with an event before creating a binding.", "skipped");
      }
      return null;
    }

    const selectedItemId = selectedItem.id;
    const selectedItemName = getItemSummary(selectedItem);
    const eventName = selectedEventName;
    const integration =
      activeProject.backendIntegrations.find((candidate) => candidate.id === activeProject.activeBackendIntegrationId) ??
      activeProject.backendIntegrations[0];
    if (!integration) {
      if (options.recordTask !== false) {
        recordInstantProjectAction("bind-control-event", "No backend integration is available for the selected event.", "skipped");
      }
      return null;
    }
    const method = activeBackendMethod(integration);
    const command = createBackendIntegrationCommand(integration, activeProject.rustCommands.length + 1, method);
    const createdCommandName = sanitizeRustCommandName(command.name);

    updateActiveProject((project) => {
      const commands = normalizeRustCommands([...project.rustCommands, command]);
      const resultStateId = project.stateVariables[0]?.id ?? "";
      const schemaFields = method ? backendSchemaFields(method.requestSchema, method.samplePayload) : [];
      const payloadFields = backendPayloadFieldsForEvent(schemaFields, selectedItem);
      const applyJsonStatePatch = method ? backendResponseSchemaHasPatch(method.responseSchema) : true;
      const files = project.files.map((file) => {
        if (file.id !== project.activeFileId) {
          return file;
        }

        return {
          ...file,
          items: file.items.map((item) => {
            if (item.id !== selectedItemId) {
              return item;
            }

            return {
              ...item,
              props: propsWithEventBindingPatch(item.props, eventName, {
                commandId: command.id,
                passValue: true,
                payloadMode: "json",
                payloadFields,
                resultTargetItemId: selectedItemId,
                resultTargetProp: "helper",
                resultStateId,
                applyJsonStatePatch,
              }),
            };
          }),
        };
      });

      return {
        ...project,
        files,
        rustCommands: commands,
        activeRustCommandId: command.id,
        rustLogic: createRustLogic(commands, project.backendIntegrations),
      };
    });
    setSimulatorTrace([]);
    setMode("design");
    setRightDockTab("connections");
    if (options.recordTask !== false) {
      recordInstantProjectAction("bind-control-event", `Bound ${selectedItemName} ${eventName} to ${createdCommandName}.`);
    }
    return createdCommandName;
  };

  const deleteActiveRustCommand = () => {
    updateActiveProject((project) => {
      if (project.rustCommands.length <= 1) {
        const commands = createDefaultRustCommands();
        return {
          ...project,
          rustCommands: commands,
          activeRustCommandId: commands[0].id,
          rustLogic: createRustLogic(commands, project.backendIntegrations),
        };
      }

      const commands = normalizeRustCommands(project.rustCommands.filter((command) => command.id !== project.activeRustCommandId));
      return {
        ...project,
        rustCommands: commands,
        activeRustCommandId: commands[0].id,
        rustLogic: createRustLogic(commands, project.backendIntegrations),
      };
    });
  };

  const syncRustLogicFromCommands = () => {
    updateActiveProject((project) => {
      const commands = normalizeRustCommands(project.rustCommands);
      return {
        ...project,
        rustCommands: commands,
        activeRustCommandId: commands.some((command) => command.id === project.activeRustCommandId)
          ? project.activeRustCommandId
          : commands[0].id,
        rustLogic: createRustLogic(commands, project.backendIntegrations),
      };
    });
  };

  const selectRustModule = (moduleId: string) => {
    updateActiveProject((project) => ({
      ...project,
      activeRustModuleId: moduleId,
    }));
  };

  const updateRustModule = (moduleId: string, patch: Partial<RustModule>) => {
    updateActiveProject((project) => {
      const modules = normalizeRustModules(
        project.rustModules.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                ...patch,
                id: module.id,
              }
            : module,
        ),
      );
      return {
        ...project,
        rustModules: modules,
        activeRustModuleId: modules.some((module) => module.id === project.activeRustModuleId)
          ? project.activeRustModuleId
          : modules[0]?.id,
      };
    });
  };

  const createRustModuleInProject = () => {
    updateActiveProject((project) => {
      const module = createRustModule(project.rustModules.length);
      const modules = normalizeRustModules([...project.rustModules, module]);
      return {
        ...project,
        rustModules: modules,
        activeRustModuleId: module.id,
      };
    });
  };

  const deleteActiveRustModule = () => {
    updateActiveProject((project) => {
      if (project.rustModules.length <= 1) {
        const modules = [createRustModule(0)];
        return {
          ...project,
          rustModules: modules,
          activeRustModuleId: modules[0].id,
        };
      }
      const modules = normalizeRustModules(project.rustModules.filter((module) => module.id !== project.activeRustModuleId));
      return {
        ...project,
        rustModules: modules,
        activeRustModuleId: modules[0]?.id,
      };
    });
  };

  const selectCargoDependency = (dependencyId: string) => {
    updateActiveProject((project) => ({
      ...project,
      activeCargoDependencyId: dependencyId,
    }));
  };

  const updateCargoDependency = (dependencyId: string, patch: Partial<CargoDependency>) => {
    updateActiveProject((project) => {
      const dependencies = normalizeCargoDependencies(
        project.cargoDependencies.map((dependency) =>
          dependency.id === dependencyId
            ? {
                ...dependency,
                ...patch,
                id: dependency.id,
              }
            : dependency,
        ),
      );
      return {
        ...project,
        cargoDependencies: dependencies,
        activeCargoDependencyId: dependencies.some((dependency) => dependency.id === project.activeCargoDependencyId)
          ? project.activeCargoDependencyId
          : dependencies[0]?.id,
      };
    });
  };

  const createCargoDependencyInProject = () => {
    updateActiveProject((project) => {
      const dependency = createCargoDependency(project.cargoDependencies.length);
      const dependencies = normalizeCargoDependencies([...project.cargoDependencies, dependency]);
      return {
        ...project,
        cargoDependencies: dependencies,
        activeCargoDependencyId: dependency.id,
      };
    });
  };

  const deleteActiveCargoDependency = () => {
    updateActiveProject((project) => {
      if (project.cargoDependencies.length <= 1) {
        const dependencies = [createCargoDependency(0)];
        return {
          ...project,
          cargoDependencies: dependencies,
          activeCargoDependencyId: dependencies[0].id,
        };
      }
      const dependencies = normalizeCargoDependencies(project.cargoDependencies.filter((dependency) => dependency.id !== project.activeCargoDependencyId));
      return {
        ...project,
        cargoDependencies: dependencies,
        activeCargoDependencyId: dependencies[0]?.id,
      };
    });
  };

  const selectBackendIntegration = (integrationId: string) => {
    updateActiveProject((project) => ({
      ...project,
      activeBackendIntegrationId: integrationId,
    }));
  };

  const updateBackendIntegration = (integrationId: string, patch: Partial<BackendIntegration>) => {
    updateActiveProject((project) => {
      const integrations = normalizeBackendIntegrations(
        project.backendIntegrations.map((integration) =>
          integration.id === integrationId
            ? {
                ...integration,
                ...patch,
                id: integration.id,
              }
            : integration,
        ),
      );
      return {
        ...project,
        backendIntegrations: integrations,
        activeBackendIntegrationId: integrations.some((integration) => integration.id === project.activeBackendIntegrationId)
          ? project.activeBackendIntegrationId
          : integrations[0]?.id,
        rustLogic: project.rustCommands.some((command) => command.backendIntegrationId)
          ? createRustLogic(project.rustCommands, integrations)
          : project.rustLogic,
      };
    });
  };

  const applyBackendIntegrationPreset = (
    integration: BackendIntegration,
    patch: Partial<Pick<BackendIntegration, "kind" | "language" | "transport">> = {},
  ) => {
    const preset = recommendedBackendIntegrationPreset({
      ...integration,
      ...patch,
      kind: patch.kind ?? integration.kind,
      language: patch.language ?? integration.language,
      transport: patch.transport ?? integration.transport,
    });
    updateBackendIntegration(integration.id, {
      ...preset,
      ...patch,
    });
  };

  const applyActiveBackendIntegrationPreset = () => {
    applyBackendIntegrationPreset(activeBackendIntegration);
  };

  const selectBackendIntegrationMethod = (methodId: string) => {
    updateBackendIntegration(activeBackendIntegration.id, { activeMethodId: methodId });
  };

  const updateBackendIntegrationMethodInProject = (
    integrationId: string,
    methodId: string,
    patch: Partial<BackendIntegrationMethod>,
  ) => {
    updateActiveProject((project) => {
      const integrations = normalizeBackendIntegrations(
        project.backendIntegrations.map((integration) =>
          integration.id === integrationId
            ? {
                ...integration,
                methods: integration.methods.map((method) =>
                  method.id === methodId
                    ? {
                        ...method,
                        ...patch,
                        id: method.id,
                      }
                    : method,
                ),
                activeMethodId: methodId,
              }
            : integration,
        ),
      );
      return {
        ...project,
        backendIntegrations: integrations,
        rustLogic: project.rustCommands.some((command) => command.backendIntegrationId)
          ? createRustLogic(project.rustCommands, integrations)
          : project.rustLogic,
      };
    });
  };

  const updateBackendIntegrationMethod = (methodId: string, patch: Partial<BackendIntegrationMethod>) => {
    updateBackendIntegrationMethodInProject(activeBackendIntegration.id, methodId, patch);
  };

  const updateActiveBackendMethodSampleField = (field: BackendSchemaField, rawValue: string) => {
    const payloadResult = parseJsonEditorValue(activeBackendIntegrationMethod.samplePayload, "Sample payload");
    const currentPayload = isPlainRecord(payloadResult.value) ? { ...payloadResult.value } : {};
    const nextPayload = setValueAtPath(currentPayload, field.path, parseBackendFieldInput(field.type, rawValue));
    updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { samplePayload: prettyJson(nextPayload) });
  };

  const syncActiveBackendMethodSampleFromSchema = () => {
    updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, {
      samplePayload: samplePayloadFromBackendSchema(
        activeBackendIntegrationMethod.requestSchema,
        activeBackendIntegrationMethod.samplePayload,
      ),
    });
  };

  const createBackendIntegrationMethodInProject = () => {
    const method = createBackendIntegrationMethod(activeBackendIntegration.methods.length);
    updateBackendIntegration(activeBackendIntegration.id, {
      methods: [...activeBackendIntegration.methods, method],
      activeMethodId: method.id,
    });
  };

  const deleteActiveBackendIntegrationMethod = () => {
    const remaining = activeBackendIntegration.methods.filter((method) => method.id !== activeBackendIntegration.activeMethodId);
    const methods = remaining.length > 0 ? remaining : [createBackendIntegrationMethod(0)];
    const activeMethodId = methods[0]?.id;
    updateActiveProject((project) => {
      const integrations = normalizeBackendIntegrations(
        project.backendIntegrations.map((integration) =>
          integration.id === activeBackendIntegration.id
            ? {
                ...integration,
                methods,
                activeMethodId,
              }
            : integration,
        ),
      );
      const commands = normalizeRustCommands(
        project.rustCommands.map((command) =>
          command.backendIntegrationId === activeBackendIntegration.id &&
          command.backendIntegrationMethodId === activeBackendIntegration.activeMethodId
            ? {
                ...command,
                backendIntegrationMethodId: activeMethodId,
              }
            : command,
        ),
      );
      return {
        ...project,
        backendIntegrations: integrations,
        rustCommands: commands,
        rustLogic: project.rustCommands.some((command) => command.backendIntegrationId)
          ? createRustLogic(commands, integrations)
          : project.rustLogic,
      };
    });
  };

  const validateActiveBackendMethodContract = () => {
    const payloadResult = parseJsonEditorValue(activeBackendIntegrationMethod.samplePayload, "Sample payload");
    const requestSchemaResult = parseJsonEditorValue(activeBackendIntegrationMethod.requestSchema, "Request schema");
    const responseSchemaResult = parseJsonEditorValue(activeBackendIntegrationMethod.responseSchema, "Response schema");
    const requestValidationIssues =
      !payloadResult.error && !requestSchemaResult.error
        ? validateBackendSchemaValue(payloadResult.value, requestSchemaResult.value, "Sample payload")
        : [];
    const errors = [payloadResult.error, requestSchemaResult.error, responseSchemaResult.error, ...requestValidationIssues].filter(Boolean) as string[];
    const request = payloadResult.error
      ? activeBackendIntegrationMethod.samplePayload
      : prettyJson(backendMethodRequestEnvelope(activeBackendIntegrationMethod, payloadResult.value));
    const response = errors.length
      ? errors.join("\n")
      : prettyJson({
          requestSchema: requestSchemaResult.value,
          responseSchema: responseSchemaResult.value,
          derivedFields: activeBackendMethodFields.map((field) => ({
            name: field.name,
            type: field.type,
            required: field.required,
          })),
        });

    updateBackendIntegrationMethodInProject(
      activeBackendIntegration.id,
      activeBackendIntegrationMethod.id,
      {
        lastTest: backendMethodLocalValidationRecord(
          activeBackendIntegration,
          errors.length ? "failed" : "passed",
          errors.length ? `${errors.length} JSON contract issue(s).` : "Sample payload and method schemas are valid JSON.",
          request,
          response,
          errors[0],
          errors,
        ),
      },
    );
  };

  const testActiveBackendIntegrationMethod = async () => {
    const integration = activeBackendIntegration;
    const method = activeBackendIntegrationMethod;
    const payloadResult = parseJsonEditorValue(method.samplePayload, "Sample payload");
    const requestSchemaResult = parseJsonEditorValue(method.requestSchema, "Request schema");
    const responseSchemaResult = parseJsonEditorValue(method.responseSchema, "Response schema");
    const requestValidationIssues =
      !payloadResult.error && !requestSchemaResult.error
        ? validateBackendSchemaValue(payloadResult.value, requestSchemaResult.value, "Sample payload")
        : [];
    const errors = [payloadResult.error, requestSchemaResult.error, responseSchemaResult.error, ...requestValidationIssues].filter(Boolean) as string[];
    const request = payloadResult.error ? method.samplePayload : prettyJson(backendMethodRequestEnvelope(method, payloadResult.value));

    if (errors.length) {
      updateBackendIntegrationMethodInProject(integration.id, method.id, {
        lastTest: backendMethodLocalValidationRecord(
          integration,
          "failed",
          `${errors.length} JSON contract issue(s). Fix them before running the backend method.`,
          request,
          errors.join("\n"),
          errors[0],
          errors,
        ),
      });
      return;
    }

    if (!isTauriRuntime()) {
      updateBackendIntegrationMethodInProject(integration.id, method.id, {
        lastTest: backendMethodLocalValidationRecord(
          integration,
          "skipped",
          "Backend method calls require the Nova desktop app runtime.",
          request,
          "Open the Tauri desktop build to run this method against local processes or HTTP endpoints.",
        ),
      });
      return;
    }

    setTestingBackendMethodId(method.id);
    setBuildError("");
    try {
      const result = await invokeIfAvailable<BackendMethodTestResult>("test_backend_integration_method", {
        project: activeProject,
        integrationId: integration.id,
        methodId: method.id,
        samplePayload: payloadResult.value,
      });
      if (!result) {
        updateBackendIntegrationMethodInProject(integration.id, method.id, {
          lastTest: backendMethodLocalValidationRecord(
            integration,
            "skipped",
            "Backend method calls require the Nova desktop app runtime.",
            request,
            "No Tauri invoke result was returned.",
          ),
        });
        return;
      }
      const responseValidationIssues =
        responseSchemaResult.error ? [] : validateBackendSchemaValue(result.response, responseSchemaResult.value, "Response");
      const validationIssues = [...responseValidationIssues];
      const status: BackendMethodTestRecord["status"] = result.success && validationIssues.length === 0 ? "passed" : "failed";
      const record: BackendMethodTestRecord = {
        id: createId(),
        testedAt: new Date().toISOString(),
        status,
        summary: validationIssues.length ? `${result.summary} · ${validationIssues.length} response schema issue(s).` : result.summary,
        durationMs: result.duration_ms,
        transport: result.transport,
        request: prettyJson(result.request),
        response: prettyJson({
          response: result.response ?? result.raw_response ?? result,
          validation: validationIssues.length ? validationIssues : "passed",
        }),
        rawResponse: result.raw_response,
        error: result.error ?? validationIssues[0] ?? undefined,
        validationIssues,
      };
      updateBackendIntegrationMethodInProject(integration.id, method.id, { lastTest: record });
      updateActiveProject((project) => ({
        ...project,
        buildLog: `${project.buildLog ? `${project.buildLog}\n` : ""}${record.summary}`,
      }));
    } catch (error) {
      const message = String(error);
      updateBackendIntegrationMethodInProject(integration.id, method.id, {
        lastTest: backendMethodLocalValidationRecord(integration, "failed", message, request, message, message),
      });
      setBuildError(message);
    } finally {
      setTestingBackendMethodId("");
    }
  };

  const createBackendIntegrationInProject = () => {
    updateActiveProject((project) => {
      const integration = createBackendIntegration(project.backendIntegrations.length);
      const integrations = normalizeBackendIntegrations([...project.backendIntegrations, integration]);
      return {
        ...project,
        backendIntegrations: integrations,
        activeBackendIntegrationId: integration.id,
      };
    });
  };

  const deleteActiveBackendIntegration = () => {
    updateActiveProject((project) => {
      if (project.backendIntegrations.length <= 1) {
        const integrations = [createBackendIntegration(0)];
        return {
          ...project,
          backendIntegrations: integrations,
          activeBackendIntegrationId: integrations[0].id,
          rustLogic: project.rustCommands.some((command) => command.backendIntegrationId)
            ? createRustLogic(project.rustCommands, integrations)
            : project.rustLogic,
        };
      }
      const integrations = normalizeBackendIntegrations(project.backendIntegrations.filter((integration) => integration.id !== project.activeBackendIntegrationId));
      return {
        ...project,
        backendIntegrations: integrations,
        activeBackendIntegrationId: integrations[0]?.id,
        rustLogic: project.rustCommands.some((command) => command.backendIntegrationId)
          ? createRustLogic(project.rustCommands, integrations)
          : project.rustLogic,
      };
    });
  };

  const selectStateVariable = (stateId: string) => {
    updateActiveProject((project) => ({
      ...project,
      activeStateVariableId: stateId,
    }));
  };

  const updateStateVariable = (stateId: string, patch: Partial<BuilderStateVariable>) => {
    updateActiveProject((project) => {
      const stateVariables = normalizeStateVariables(
        project.stateVariables.map((state) => (state.id === stateId ? { ...state, ...patch, id: state.id } : state)),
      );
      return {
        ...project,
        stateVariables,
        activeStateVariableId: stateVariables.some((state) => state.id === project.activeStateVariableId)
          ? project.activeStateVariableId
          : stateVariables[0].id,
      };
    });
  };

  const createStateVariableInProject = () => {
    updateActiveProject((project) => {
      const state = createStateVariable(project.stateVariables.length + 1);
      return {
        ...project,
        stateVariables: [...project.stateVariables, state],
        activeStateVariableId: state.id,
      };
    });
  };

  const deleteActiveStateVariable = () => {
    updateActiveProject((project) => {
      const deletedId = project.activeStateVariableId || project.stateVariables[0]?.id;
      if (!deletedId || project.stateVariables.length <= 1) {
        const stateVariables = [createStateVariable(1)];
        return {
          ...project,
          stateVariables,
          activeStateVariableId: stateVariables[0].id,
        };
      }

      const stateVariables = project.stateVariables.filter((state) => state.id !== deletedId);
      const cleanItem = (item: BuilderItem): BuilderItem => {
        const stateBindings = Object.fromEntries(
          Object.entries(item.props.stateBindings ?? {}).filter(([, stateId]) => stateId !== deletedId),
        ) as BuilderItemProps["stateBindings"];
        const events = Object.fromEntries(
          Object.entries(item.props.events ?? {}).map(([eventName, binding]) => [
            eventName,
            binding?.resultStateId === deletedId ? { ...binding, resultStateId: undefined } : binding,
          ]),
        ) as BuilderItemProps["events"];
        return {
          ...item,
          props: {
            ...item.props,
            stateBindings: stateBindings && Object.keys(stateBindings).length > 0 ? stateBindings : undefined,
            events,
          },
        };
      };

      return {
        ...project,
        stateVariables,
        activeStateVariableId: stateVariables[0].id,
        files: project.files.map((file) => ({
          ...file,
          items: file.items.map(cleanItem),
        })),
      };
    });
  };

  const createNewFile = () => {
    const nextFile = createBlankFile(`Window ${activeProject.files.length + 1}.ui`);
    updateActiveProject((project) => ({
      ...project,
      files: [...project.files, nextFile],
      activeFileId: nextFile.id,
    }));
    setSelectedId("");
    setMode("design");
    return nextFile;
  };

  const selectFile = (fileId: string) => {
    updateActiveProject((project) => ({
      ...project,
      activeFileId: fileId,
    }));
    const nextFile = activeProject.files.find((file) => file.id === fileId);
    setSelectedId(nextFile?.items[0]?.id ?? "");
    setMode("design");
  };

  const focusVisualAuditIssue = (issue: WindowVisualAuditIssue) => {
    const targetFile = activeProject.files.find((file) => file.id === issue.fileId);
    if (!targetFile) {
      setBuildError(`找不到问题所属 UI 文件：${issue.fileName}`);
      return;
    }

    const targetItemId = issue.itemId && targetFile.items.some((item) => item.id === issue.itemId) ? issue.itemId : "";
    updateActiveProject((project) => ({
      ...project,
      activeFileId: issue.fileId,
    }));
    setSelectedId(targetItemId);
    setMode("design");
  };

  const focusBuildReadinessItem = (item: BuildReadinessItem) => {
    if (!item.fileId) {
      return;
    }
    const targetFile = activeProject.files.find((file) => file.id === item.fileId);
    if (!targetFile) {
      setBuildError(`找不到问题所属 UI 文件：${item.fileName ?? item.fileId}`);
      return;
    }
    const targetItemId = item.itemId && targetFile.items.some((candidate) => candidate.id === item.itemId) ? item.itemId : "";
    if (item.itemId && !targetItemId) {
      setBuildError(`找不到问题控件：${item.itemName ?? item.itemId}`);
    }
    updateActiveProject((project) => ({
      ...project,
      activeFileId: item.fileId!,
    }));
    setSelectedId(targetItemId);
    setMode("design");
  };

  const updateProjectTask = (taskId: string, patch: Partial<ProjectTaskEntry>) => {
    setProjectTasks((current) => current.map((task) => (task.id === taskId ? { ...task, ...patch } : task)));
  };

  const applyReleasePipelineRecordWriteResult = (runId: string, result: ReleasePipelineRecordWriteResult) => {
    const currentEntry = releasePipelineEntriesRef.current[runId];
    if (currentEntry) {
      releasePipelineEntriesRef.current[runId] = {
        ...currentEntry,
        recordPath: result.path,
        latestRecordPath: result.latest_path,
        recordWrittenAt: result.written_at,
        rootPath: result.root_path,
      };
    }
    updateActiveProject((project) => ({
      ...project,
      releasePipelineHistory: (project.releasePipelineHistory ?? []).map((entry) =>
        entry.id === runId
          ? {
              ...entry,
              recordPath: result.path,
              latestRecordPath: result.latest_path,
              recordWrittenAt: result.written_at,
              rootPath: result.root_path,
            }
          : entry,
      ),
    }));
  };

  const persistReleasePipelineRecord = async (entry: ReleasePipelineEntry, projectSnapshot = activeProject) => {
    if (!isTauriRuntime()) {
      return;
    }
    try {
      const result = await invokeIfAvailable<ReleasePipelineRecordWriteResult>("write_release_pipeline_record", {
        project: projectSnapshot,
        pipeline: entry,
      });
      if (result) {
        applyReleasePipelineRecordWriteResult(entry.id, result);
      }
    } catch (error) {
      setBuildError(`Release pipeline record write failed: ${String(error)}`);
    }
  };

  const refreshReleasePipelineRecords = async (projectSnapshot = activeProject) => {
    if (!isTauriRuntime() || !projectSnapshot.rootPath?.trim()) {
      return;
    }
    setRefreshingPipelineRecords(true);
    try {
      const records = await invokeIfAvailable<ReleasePipelineEntry[]>("list_release_pipeline_records", {
        project: projectSnapshot,
      });
      if (!records) {
        return;
      }
      const diskRecords = normalizeReleasePipelineHistory(records);
      for (const entry of diskRecords) {
        releasePipelineEntriesRef.current[entry.id] = entry;
      }
      setWorkspace((current) => ({
        ...current,
        projects: current.projects.map((project) =>
          project.id === projectSnapshot.id
            ? {
                ...project,
                releasePipelineHistory: mergeReleasePipelineHistory(diskRecords, project.releasePipelineHistory),
                updatedAt: new Date().toISOString(),
              }
            : project,
        ),
      }));
    } catch (error) {
      setBuildError(`Release pipeline history refresh failed: ${String(error)}`);
    } finally {
      setRefreshingPipelineRecords(false);
    }
  };

  const applyProjectDependencyGraphWriteResult = (result: ProjectDependencyGraphWriteResult) => {
    setProjectDependencyGraph((current) =>
      current
        ? {
            ...current,
            rootPath: result.root_path,
            recordPath: result.path,
            recordWrittenAt: result.written_at,
          }
        : current,
    );
  };

  const persistProjectDependencyGraphRecord = async (record: ProjectDependencyGraphRecord, projectSnapshot = activeProject) => {
    if (!isTauriRuntime()) {
      return;
    }
    setWritingDependencyGraph(true);
    try {
      const result = await invokeIfAvailable<ProjectDependencyGraphWriteResult>("write_project_dependency_graph", {
        project: projectSnapshot,
        graph: record,
      });
      if (result) {
        applyProjectDependencyGraphWriteResult(result);
      }
    } catch (error) {
      setBuildError(`Dependency graph write failed: ${String(error)}`);
    } finally {
      setWritingDependencyGraph(false);
    }
  };

  const recordProjectDependencyGraphEvent = (
    lastEvent: Omit<ProjectDependencyGraphEvent, "recordedAt"> & { recordedAt?: string },
    impact = projectChangeImpactRef.current ?? projectChangeImpact,
    projectSnapshot = activeProjectRef.current,
  ) => {
    const previousRecord = projectDependencyGraphRef.current;
    const record = createProjectDependencyGraphRecord(projectSnapshot, impact, lastEvent, previousRecord);
    setProjectDependencyGraph(record);
    void persistProjectDependencyGraphRecord(record, projectSnapshot);
    return record;
  };

  const refreshProjectDependencyGraph = async (projectSnapshot = activeProject) => {
    if (!isTauriRuntime() || !projectSnapshot.rootPath?.trim()) {
      return;
    }
    setRefreshingDependencyGraph(true);
    try {
      const result = await invokeIfAvailable<ProjectDependencyGraphReadResult>("read_project_dependency_graph", {
        project: projectSnapshot,
      });
      if (!result) {
        return;
      }
      const graph = normalizeProjectDependencyGraphRecord(result.graph);
      setProjectDependencyGraph(graph);
    } catch (error) {
      setBuildError(`Dependency graph refresh failed: ${String(error)}`);
    } finally {
      setRefreshingDependencyGraph(false);
    }
  };

  const recordReleasePipelineRun = (entry: ReleasePipelineEntry) => {
    releasePipelineEntriesRef.current[entry.id] = entry;
    updateActiveProject((project) => ({
      ...project,
      releasePipelineHistory: [entry, ...(project.releasePipelineHistory ?? []).filter((candidate) => candidate.id !== entry.id)].slice(0, 12),
    }));
    void persistReleasePipelineRecord(entry);
  };

  const recordReleasePipelineTaskUpdate = (task: ProjectTaskEntry) => {
    if (!task.pipelineRunId) {
      return;
    }
    const currentEntry =
      releasePipelineEntriesRef.current[task.pipelineRunId] ??
      activeProject.releasePipelineHistory?.find((entry) => entry.id === task.pipelineRunId);
    if (!currentEntry) {
      return;
    }
    const nextEntry = updateReleasePipelineEntryWithTask(currentEntry, task);
    releasePipelineEntriesRef.current[task.pipelineRunId] = nextEntry;
    updateActiveProject((project) => ({
      ...project,
      releasePipelineHistory: (project.releasePipelineHistory ?? []).map((entry) =>
        entry.id === task.pipelineRunId ? nextEntry : entry,
      ),
    }));
    void persistReleasePipelineRecord(nextEntry);
  };

  const cancelRemainingReleasePipelineTasks = (runId: string, reason: string) => {
    const remainingTasks = projectTaskQueueRef.current.filter((task) => task.pipelineRunId === runId);
    if (remainingTasks.length === 0) {
      return;
    }
    projectTaskQueueRef.current = projectTaskQueueRef.current.filter((task) => task.pipelineRunId !== runId);
    bumpProjectTaskQueueVersion();
    const canceledAt = new Date().toISOString();
    const canceledTasks = remainingTasks.map((task): ProjectTaskEntry => ({
      ...task,
      status: "canceled",
      finishedAt: canceledAt,
      summary: reason,
    }));
    canceledTasks.forEach(recordReleasePipelineTaskUpdate);
    const canceledById = new Map(canceledTasks.map((task) => [task.id, task]));
    setProjectTasks((current) => current.map((task) => canceledById.get(task.id) ?? task));
  };

  const bumpProjectTaskQueueVersion = () => {
    setProjectTaskQueueVersion((version) => version + 1);
  };

  const syncProjectTaskQueueOrderToHistory = () => {
    const order = new Map(projectTaskQueueRef.current.map((task, index) => [task.id, index]));
    setProjectTasks((current) =>
      [...current].sort((left, right) => {
        const leftIndex = order.get(left.id);
        const rightIndex = order.get(right.id);
        if (leftIndex !== undefined && rightIndex !== undefined) {
          return leftIndex - rightIndex;
        }
        if (leftIndex !== undefined) {
          return -1;
        }
        if (rightIndex !== undefined) {
          return 1;
        }
        return 0;
      }),
    );
  };

  const backendTaskStatusToProjectTaskStatus = (status: string): ProjectTaskStatus => {
    if (status === "queued" || status === "running" || status === "succeeded" || status === "failed" || status === "canceled") {
      return status;
    }
    return "failed";
  };

  const backendTaskActionId = (task: EditorBackgroundTaskView): ProjectJumpActionId => {
    if (task.task_kind === "build") {
      return "build-exe";
    }
    if (task.task_kind === "bundle") {
      return "bundle-installer";
    }
    if (task.check_kind === "frontend") {
      return "quick-check-frontend";
    }
    if (task.check_kind === "rust") {
      return "quick-check-rust";
    }
    return "quick-check-all";
  };

  const projectTaskFromBackendTask = (task: EditorBackgroundTaskView): ProjectTaskEntry => {
    const actionId = backendTaskActionId(task);
    const definition = projectTaskDefinitions[actionId];
    return {
      id: `backend-${task.id}`,
      projectId: activeProject.id,
      projectName: activeProject.name,
      actionId,
      kind: definition.kind,
      title: definition.title,
      detail: definition.detail,
      status: backendTaskStatusToProjectTaskStatus(task.status),
      createdAt: task.created_at,
      startedAt: task.started_at ?? undefined,
      finishedAt: task.finished_at ?? undefined,
      summary: task.summary,
      error: task.error ?? undefined,
      logPreview: projectTaskLogPreview(task.log_tail),
      artifactPath:
        task.result?.paths.output_exe_path ??
        task.result?.bundle_manifest_path ??
        task.result?.bundle_dir ??
        task.result?.paths.generated_app_dir ??
        task.root_path,
      logPath: task.log_path,
      backendTaskId: task.id,
      attempt: 1,
    };
  };

  const mergeBackendProjectTasks = (backendTasks: EditorBackgroundTaskView[]) => {
    const mappedTasks = backendTasks.map(projectTaskFromBackendTask);
    setProjectTasks((current) => {
      const merged = [...current];
      for (const task of mappedTasks) {
        const existingIndex = merged.findIndex((candidate) => candidate.backendTaskId === task.backendTaskId || candidate.id === task.id);
        if (existingIndex >= 0) {
          merged[existingIndex] = { ...merged[existingIndex], ...task };
        } else {
          merged.push(task);
        }
      }
      return merged
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, 100);
    });
  };

  const refreshBackendProjectTaskHistory = async () => {
    if (!isTauriRuntime()) {
      return;
    }
    try {
      const tasks = await invokeIfAvailable<EditorBackgroundTaskView[]>("list_editor_project_tasks", {
        project: activeProject,
      });
      if (tasks) {
        mergeBackendProjectTasks(tasks);
      }
    } catch (error) {
      setBuildError(String(error));
    }
  };

  useEffect(() => {
    void refreshBackendProjectTaskHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject.id, activeProject.rootPath]);

  useEffect(() => {
    void refreshReleasePipelineRecords(activeProject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject.id, activeProject.rootPath]);

  const applyBackendBuildResult = (taskKind: "check" | "build" | "bundle", result: BuildResult) => {
    if (taskKind === "check") {
      updateActiveProject((project) => ({
        ...project,
        rootPath: result.paths.root_path,
        rustSourceMap: normalizeGeneratedRustSourceMap(result.rust_source_map) ?? project.rustSourceMap,
        rustSourceMapPath: result.paths.rust_source_map_path,
        generatedRustSourceMapPath: result.paths.generated_rust_source_map_path,
        lastGeneratedFileSummary: normalizeGeneratedFileChangeSummary(result.generated_files) ?? project.lastGeneratedFileSummary,
        buildLog: result.log,
      }));
      void refreshManagedProjects();
      return;
    }

    const buildEntry = createBuildHistoryEntry(result, activeProject, buildReadinessSummary, windowVisualAudit);
    updateActiveProject((project) => ({
      ...project,
      rootPath: result.paths.root_path,
      outputExePath: result.paths.output_exe_path ?? project.outputExePath,
      rustSourceMap: normalizeGeneratedRustSourceMap(result.rust_source_map) ?? project.rustSourceMap,
      rustSourceMapPath: result.paths.rust_source_map_path,
      generatedRustSourceMapPath: result.paths.generated_rust_source_map_path,
      lastGeneratedFileSummary: normalizeGeneratedFileChangeSummary(result.generated_files) ?? project.lastGeneratedFileSummary,
      buildLog: result.log,
      buildHistory: [buildEntry, ...(project.buildHistory ?? [])].slice(0, 12),
    }));
    void refreshManagedProjects();
  };

  const waitForBackendProjectTask = async (
    frontendTaskId: string,
    taskKind: "check" | "build" | "bundle",
    checkKind?: "frontend" | "rust" | "all",
  ): Promise<ProjectTaskRunResult> => {
    const started = await invokeIfAvailable<EditorBackgroundTaskView>("start_editor_project_task", {
      project: activeProject,
      rustLogic: activeProject.rustLogic,
      taskKind,
      checkKind,
    });
    if (!started) {
      return { status: "skipped", summary: "Background task registry requires the Tauri desktop runtime." };
    }

    let current = started;
    updateProjectTask(frontendTaskId, {
      backendTaskId: current.id,
      logPath: current.log_path,
      artifactPath: current.root_path,
      logPreview: projectTaskLogPreview(current.log_tail),
      summary: current.summary,
    });

    while (current.status === "queued" || current.status === "running") {
      await new Promise((resolve) => window.setTimeout(resolve, 1000));
      const next = await invokeIfAvailable<EditorBackgroundTaskView>("read_editor_project_task", { taskId: current.id });
      if (!next) {
        return { status: "failed", summary: "Lost access to the Rust background task registry." };
      }
      current = next;
      updateProjectTask(frontendTaskId, {
        backendTaskId: current.id,
        logPath: current.log_path,
        artifactPath: current.root_path,
        logPreview: projectTaskLogPreview(current.log_tail),
        summary: current.current_command ? `${current.summary} · pid ${current.pid ?? "?"}` : current.summary,
      });
    }

    if (current.result) {
      applyBackendBuildResult(taskKind, current.result);
    }

    const artifactPath =
      current.result?.paths.output_exe_path ??
      current.result?.bundle_manifest_path ??
      current.result?.bundle_dir ??
      current.result?.paths.generated_app_dir ??
      current.root_path;
    const finalStatus = current.status === "succeeded" ? "succeeded" : current.status === "canceled" ? "canceled" : "failed";
    recordProjectDependencyGraphEvent({
      kind: taskKind,
      actionId:
        taskKind === "build"
          ? "build-exe"
          : taskKind === "bundle"
            ? "bundle-installer"
            : checkKind === "frontend"
              ? "quick-check-frontend"
              : checkKind === "rust"
                ? "quick-check-rust"
                : "quick-check-all",
      status: finalStatus,
      summary: current.summary,
      artifactPath,
      logPath: current.log_path,
    });
    return {
      status: finalStatus,
      summary: current.summary,
      logPreview: projectTaskLogPreview(current.log_tail),
      artifactPath,
      logPath: current.log_path,
      backendTaskId: current.id,
    };
  };

  const executeProjectTaskAction = async (task: ProjectTaskEntry): Promise<ProjectTaskRunResult> => {
    const actionId = task.actionId;
    switch (actionId) {
      case "save-project":
        await saveWorkspace();
        return { summary: "Project workspace saved to the current editor storage target." };
      case "new-ui-file":
        {
          const file = createNewFile();
          return { summary: `Created ${file.name} inside the active project.` };
        }
      case "duplicate-ui-file":
        {
          const file = duplicateActiveFile();
          return { summary: `Duplicated the active UI file as ${file.name}.` };
        }
      case "delete-ui-file":
        setMode("design");
        setLeftDockTab("navigator");
        requestDeleteActiveFile();
        return { status: "skipped", summary: "Delete UI file requires confirmation in the Navigator." };
      case "insert-component":
        {
          const definition = getDefinition("button");
          addComponent("button", items.length === 0 ? { x: page.width / 2, y: page.height / 2 } : undefined);
          setLeftDockTab("components");
          setRightDockTab("properties");
          return { summary: `Inserted ${definition.title} into ${activeFile.name}.` };
        }
      case "bind-control-event":
        {
          const commandName = createAndBindBackendIntegrationCommand({ recordTask: false });
          if (!commandName) {
            return { status: "skipped", summary: "Select a control with an event before creating a binding." };
          }
          return { summary: `Bound the selected control event to ${commandName}.` };
        }
      case "run-selected-event":
        {
          const trace = simulateSelectedEvent({ recordTask: false });
          if (!trace) {
            return { status: "skipped", summary: "Select a control with an event before running it." };
          }
          return {
            status: trace.status === "success" ? "succeeded" : "failed",
            summary:
              trace.status === "success"
                ? `Ran ${trace.itemName} ${trace.eventName} with ${trace.commandName}.`
                : `Failed to run ${trace.itemName} ${trace.eventName}: ${trace.message}`,
            logPreview: trace.rawResult || trace.message,
          };
        }
      case "add-rust-command":
        createRustCommandInProject();
        setMode("logic");
        return { summary: "Added a Rust command and opened the Logic panel." };
      case "add-state-variable":
        createStateVariableInProject();
        setMode("logic");
        return { summary: "Added a shared project state variable." };
      case "sync-rust":
        syncRustLogicFromCommands();
        setMode("logic");
        return { summary: "Regenerated Rust source from the command registry." };
      case "add-image-asset":
        setMode("design");
        await chooseImageAsset();
        return { summary: "Image asset import flow finished." };
      case "preview-generated-files":
        {
          const result = await previewGeneratedProjectFiles();
          if (!result) {
            return { status: "skipped", summary: "Generated file preview requires the Tauri desktop runtime." };
          }
          return {
            summary: result.summary,
            logPreview: `${result.changed_count} changed / ${result.total_count} total generated target file(s).`,
            artifactPath: result.root_path,
          };
        }
      case "apply-generated-files":
        if (!generatedFilePreview) {
          await previewGeneratedProjectFiles();
          return {
            status: "skipped",
            summary: "Generated a file preview first. Select target files, then run Apply selected generated files again.",
          };
        }
        if (selectedGeneratedPreviewPaths.length === 0) {
          setMode("build");
          setBuildError("没有选中的生成文件。请先在文件预览里选择要写入的文件。");
          return { status: "skipped", summary: "No generated files were selected for apply." };
        }
        {
          const result = await applySelectedGeneratedFiles();
          if (!result) {
            return { status: "skipped", summary: "Generated file apply requires selected files and the Tauri desktop runtime." };
          }
          return {
            summary: result.summary,
            logPreview: `${result.applied_count} applied / ${result.skipped_count} skipped. Snapshot: ${result.checkpoint_path}`,
            artifactPath: result.root_path,
          };
        }
      case "apply-generated-changes":
        return applyGeneratedFileChanges();
      case "build-backend-artifacts":
        return buildProjectBackendArtifacts();
      case "quick-check-frontend":
        return waitForBackendProjectTask(task.id, "check", "frontend");
      case "quick-check-rust":
        return waitForBackendProjectTask(task.id, "check", "rust");
      case "quick-check-all":
        return waitForBackendProjectTask(task.id, "check", "all");
      case "validate-window":
        if (buildReadinessSummary.errorCount > 0) {
          await validateGeneratedWindow();
          return {
            status: "skipped",
            summary: `Window validation was blocked by ${buildReadinessSummary.errorCount} readiness issue(s).`,
          };
        }
        await validateGeneratedWindow();
        return { summary: "Generated window validation finished." };
      case "build-exe":
        if (buildReadinessSummary.errorCount > 0) {
          await buildActiveProject();
          return {
            status: "skipped",
            summary: `Release exe build was blocked by ${buildReadinessSummary.errorCount} readiness issue(s).`,
          };
        }
        return waitForBackendProjectTask(task.id, "build");
      case "bundle-installer":
        if (buildReadinessSummary.errorCount > 0) {
          await bundleActiveProject();
          return {
            status: "skipped",
            summary: `Installer bundle build was blocked by ${buildReadinessSummary.errorCount} readiness issue(s).`,
          };
        }
        return waitForBackendProjectTask(task.id, "bundle");
      case "fix-property-schema":
        setMode("build");
        if (projectPropertyAutoFixSummary.targets.length === 0) {
          setBuildError("没有可自动修复的属性 schema 问题。");
          return { status: "skipped", summary: "No safe property schema fixes were available." };
        }
        applyProjectPropertyAutoFixes();
        return {
          summary: `Applied ${projectPropertyAutoFixSummary.propertyCount} safe property fix(es) across ${projectPropertyAutoFixSummary.targets.length} control(s).`,
        };
    }
  };

  const drainProjectTaskQueue = async () => {
    if (projectTaskQueuePausedRef.current) {
      return null;
    }
    if (projectTaskRunnerRef.current) {
      return projectTaskRunnerRef.current;
    }

    const runner = (async () => {
      while (projectTaskQueueRef.current.length > 0) {
        if (projectTaskQueuePausedRef.current) {
          break;
        }
        const task = projectTaskQueueRef.current.shift();
        bumpProjectTaskQueueVersion();
        if (!task) {
          continue;
        }

        const startedTaskBase: ProjectTaskEntry = {
          ...task,
          status: "running",
          startedAt: new Date().toISOString(),
          summary: "Running...",
          error: undefined,
          inputSnapshot: createReleasePipelineInputSnapshot(activeProject),
          environment: createReleasePipelineEnvironment(),
          artifactEvidence: undefined,
        };
        const startedTask: ProjectTaskEntry = {
          ...startedTaskBase,
          commandArgs: createReleasePipelineCommandArgs(startedTaskBase),
        };
        updateProjectTask(task.id, startedTask);
        recordReleasePipelineTaskUpdate(startedTask);

        try {
          const result = await executeProjectTaskAction(task);
          const artifactPath = result.artifactPath ?? startedTask.artifactPath;
          const artifactEvidence = await inspectReleasePipelineArtifactEvidence(artifactPath);
          const finishedTaskBase: ProjectTaskEntry = {
            ...startedTask,
            status: result.status ?? "succeeded",
            finishedAt: new Date().toISOString(),
            summary: result.summary,
            logPreview: result.logPreview,
            artifactPath,
            logPath: result.logPath ?? startedTask.logPath,
            backendTaskId: result.backendTaskId ?? startedTask.backendTaskId,
            artifactEvidence,
          };
          const finishedTask: ProjectTaskEntry = {
            ...finishedTaskBase,
            commandArgs: createReleasePipelineCommandArgs(finishedTaskBase),
          };
          updateProjectTask(task.id, finishedTask);
          recordReleasePipelineTaskUpdate(finishedTask);
          if (finishedTask.pipelineRunId && (finishedTask.status === "failed" || finishedTask.status === "canceled")) {
            cancelRemainingReleasePipelineTasks(
              finishedTask.pipelineRunId,
              `Skipped because ${finishedTask.title} ${finishedTask.status}.`,
            );
          }
        } catch (error) {
          const artifactEvidence = await inspectReleasePipelineArtifactEvidence(startedTask.artifactPath);
          const failedTaskBase: ProjectTaskEntry = {
            ...startedTask,
            status: "failed",
            finishedAt: new Date().toISOString(),
            summary: "Task failed before the editor action could finish.",
            error: String(error),
            artifactEvidence,
          };
          const failedTask: ProjectTaskEntry = {
            ...failedTaskBase,
            commandArgs: createReleasePipelineCommandArgs(failedTaskBase),
          };
          updateProjectTask(task.id, failedTask);
          recordReleasePipelineTaskUpdate(failedTask);
          if (failedTask.pipelineRunId) {
            cancelRemainingReleasePipelineTasks(failedTask.pipelineRunId, `Skipped because ${failedTask.title} failed.`);
          }
        }
      }
    })().finally(() => {
      projectTaskRunnerRef.current = null;
    });

    projectTaskRunnerRef.current = runner;
    return runner;
  };

  const enqueueProjectTask = (actionId: ProjectJumpActionId, attempt = 1) => {
    enqueueProjectTaskSequence([actionId], attempt);
  };

  const enqueueProjectTaskSequence = (
    actionIds: ProjectJumpActionId[],
    attempt = 1,
    pipeline?: { runId: string; presetTitle: string },
    autoStart = true,
  ) => {
    const tasks = actionIds.map((actionId, index) =>
      createProjectTask(
        actionId,
        activeProject,
        attempt,
        pipeline
          ? {
              runId: pipeline.runId,
              presetTitle: pipeline.presetTitle,
              stepIndex: index,
              stepCount: actionIds.length,
            }
          : undefined,
      ),
    );
    if (tasks.length === 0) {
      return [];
    }
    projectTaskQueueRef.current = [...projectTaskQueueRef.current, ...tasks];
    bumpProjectTaskQueueVersion();
    setProjectTasks((current) => [...tasks, ...current].slice(0, 100));
    setSelectedProjectTaskId(tasks[0].id);
    openBottomDock("tasks");
    setMode(projectTaskDefinitions[tasks[tasks.length - 1].actionId].mode);
    if (autoStart && !projectTaskQueuePausedRef.current) {
      void drainProjectTaskQueue();
    }
    return tasks;
  };

  const runProjectActionsAsPipeline = (preset: ProjectActionPresetDefinition, actionIds: string[] = preset.actions) => {
    const validActionIds = actionIds.filter(isProjectJumpActionId);
    const invalidActionIds = actionIds.filter((actionId) => !isProjectJumpActionId(actionId));
    if (validActionIds.length === 0) {
      setBuildError("没有可执行的 pipeline step。");
      return;
    }
    if (invalidActionIds.length > 0) {
      setBuildError(`Skipped unsupported pipeline action(s): ${invalidActionIds.join(", ")}`);
    }
    const runId = createId();
    const tasks = enqueueProjectTaskSequence(validActionIds, 1, { runId, presetTitle: preset.title }, false);
    if (tasks.length > 0) {
      recordReleasePipelineRun(createReleasePipelineEntry({ ...preset, actions: validActionIds }, tasks, activeProject));
      if (!projectTaskQueuePausedRef.current) {
        void drainProjectTaskQueue();
      }
    }
  };

  const runProjectActionPreset = (preset: ProjectActionPresetDefinition) => {
    runProjectActionsAsPipeline(preset);
  };

  const runProjectChangeImpactPlan = () => {
    const plan = projectChangeImpact.executionPlan;
    if (!plan.ready || plan.actions.length === 0) {
      setBuildError("当前没有可执行的 incremental impact plan。");
      return;
    }
    runProjectActionsAsPipeline({
      id: `${plan.id}-${Date.now()}`,
      title: plan.title,
      detail: plan.detail,
      badge: plan.badge,
      actions: plan.actions,
      custom: true,
    });
  };

  const rerunReleasePipeline = (entry: ReleasePipelineEntry, startIndex = 0) => {
    const actionIds = entry.steps.slice(startIndex).map((step) => step.actionId);
    const preset: ProjectActionPresetDefinition = {
      id: `rerun-${entry.id}-${Date.now()}`,
      title: startIndex > 0 ? `${entry.presetTitle} from step ${startIndex + 1}` : `${entry.presetTitle} rerun`,
      detail:
        startIndex > 0
          ? `Re-run ${entry.presetTitle} from step ${startIndex + 1} based on pipeline ${entry.id}.`
          : `Re-run ${entry.presetTitle} based on pipeline ${entry.id}.`,
      badge: startIndex > 0 ? "rerun" : entry.presetBadge || "rerun",
      actions: actionIds.filter(isProjectJumpActionId),
      custom: true,
    };
    runProjectActionsAsPipeline(preset, actionIds);
  };

  const rerunReleasePipelineFromFailure = (entry: ReleasePipelineEntry) => {
    const failedIndex = entry.steps.findIndex((step) => step.status === "failed" || step.status === "canceled");
    if (failedIndex < 0) {
      setBuildError("这条 pipeline 没有失败或取消的 step。");
      return;
    }
    rerunReleasePipeline(entry, failedIndex);
  };

  const addActionToCustomPresetDraft = () => {
    setCustomPresetDraftActions((current) => [...current, customPresetDraftActionId]);
  };

  const removeActionFromCustomPresetDraft = (index: number) => {
    setCustomPresetDraftActions((current) => current.filter((_, candidateIndex) => candidateIndex !== index));
  };

  const moveCustomPresetDraftAction = (index: number, direction: -1 | 1) => {
    setCustomPresetDraftActions((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }
      const next = [...current];
      const [action] = next.splice(index, 1);
      next.splice(nextIndex, 0, action);
      return next;
    });
  };

  const saveCustomProjectActionPreset = () => {
    if (!canSaveCustomPreset) {
      return;
    }
    const title = customPresetTitle.trim();
    const detail = customPresetDetail.trim() || "Custom Task Center action preset.";
    const preset: ProjectActionPresetDefinition = {
      id: `custom-preset-${createId()}`,
      title,
      detail,
      badge: "custom",
      actions: customPresetDraftActions,
      custom: true,
    };
    setCustomProjectActionPresets((current) => [preset, ...current].slice(0, 24));
  };

  const deleteCustomProjectActionPreset = (presetId: string) => {
    setCustomProjectActionPresets((current) => current.filter((preset) => preset.id !== presetId));
  };

  const setProjectTaskQueuePausedState = (paused: boolean) => {
    projectTaskQueuePausedRef.current = paused;
    setProjectTaskQueuePaused(paused);
    if (!paused) {
      void drainProjectTaskQueue();
    }
  };

  const moveQueuedProjectTask = (taskId: string, direction: -1 | 1) => {
    const currentIndex = projectTaskQueueRef.current.findIndex((task) => task.id === taskId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= projectTaskQueueRef.current.length) {
      return;
    }
    const nextQueue = [...projectTaskQueueRef.current];
    const [task] = nextQueue.splice(currentIndex, 1);
    nextQueue.splice(nextIndex, 0, task);
    projectTaskQueueRef.current = nextQueue;
    bumpProjectTaskQueueVersion();
    syncProjectTaskQueueOrderToHistory();
  };

  const cancelQueuedProjectTasks = () => {
    const canceledIds = new Set(localQueuedProjectTasks.map((task) => task.id));
    if (canceledIds.size === 0) {
      return;
    }
    projectTaskQueueRef.current = projectTaskQueueRef.current.filter((task) => !canceledIds.has(task.id));
    bumpProjectTaskQueueVersion();
    localQueuedProjectTasks
      .filter((task) => canceledIds.has(task.id))
      .forEach((task) =>
        recordReleasePipelineTaskUpdate({
          ...task,
          status: "canceled",
          finishedAt: new Date().toISOString(),
          summary: "Canceled while waiting in the editor queue.",
        }),
      );
    setProjectTasks((current) =>
      current.map((task) =>
        canceledIds.has(task.id)
          ? {
              ...task,
              status: "canceled",
              finishedAt: new Date().toISOString(),
              summary: "Canceled while waiting in the editor queue.",
            }
          : task,
      ),
    );
  };

  const queuedProjectTaskIndex = (taskId: string) => projectTaskQueueRef.current.findIndex((task) => task.id === taskId);

  const canMoveQueuedProjectTask = (taskId: string, direction: -1 | 1) => {
    const index = queuedProjectTaskIndex(taskId);
    const nextIndex = index + direction;
    return index >= 0 && nextIndex >= 0 && nextIndex < projectTaskQueueRef.current.length;
  };

  const retryProjectTask = (task: ProjectTaskEntry) => {
    enqueueProjectTask(task.actionId, task.attempt + 1);
  };

  const cancelProjectTask = async (task: ProjectTaskEntry) => {
    if (task.status === "queued") {
      projectTaskQueueRef.current = projectTaskQueueRef.current.filter((queuedTask) => queuedTask.id !== task.id);
      bumpProjectTaskQueueVersion();
      const canceledTask: ProjectTaskEntry = {
        ...task,
        status: "canceled",
        finishedAt: new Date().toISOString(),
        summary: "Canceled before the task started.",
      };
      updateProjectTask(task.id, {
        status: canceledTask.status,
        finishedAt: canceledTask.finishedAt,
        summary: canceledTask.summary,
      });
      recordReleasePipelineTaskUpdate(canceledTask);
      return;
    }

    if (task.status === "running" && task.backendTaskId) {
      try {
        const canceled = await invokeIfAvailable<EditorBackgroundTaskView>("cancel_editor_project_task", {
          taskId: task.backendTaskId,
        });
        if (canceled) {
          updateProjectTask(task.id, {
            summary: canceled.summary,
            logPreview: projectTaskLogPreview(canceled.log_tail),
            logPath: canceled.log_path,
            artifactPath: canceled.root_path,
          });
        }
      } catch (error) {
        updateProjectTask(task.id, {
          error: String(error),
          summary: "Failed to request backend task cancellation.",
        });
      }
    }
  };

  const clearCompletedProjectTasks = () => {
    setProjectTasks((current) =>
      current.filter(
        (task) =>
          (task.projectId && task.projectId !== activeProject.id) ||
          task.status === "queued" ||
          task.status === "running",
      ),
    );
  };

  const recordInstantProjectAction = (
    actionId: ProjectJumpActionId,
    summary: string,
    status: Exclude<ProjectTaskStatus, "queued" | "running"> = "succeeded",
  ) => {
    const timestamp = new Date().toISOString();
    const task = createProjectTask(actionId, activeProject, 1);
    const finishedTask: ProjectTaskEntry = {
      ...task,
      status,
      startedAt: timestamp,
      finishedAt: timestamp,
      summary,
    };
    setProjectTasks((current) => [finishedTask, ...current].slice(0, 100));
    setSelectedProjectTaskId(finishedTask.id);
  };

  const runInstantProjectJumpAction = async (actionId: ProjectJumpActionId) => {
    if (actionId === "new-ui-file") {
      const file = createNewFile();
      setLeftDockTab("navigator");
      recordInstantProjectAction(actionId, `Created ${file.name} and opened it on the canvas.`);
      return true;
    }

    if (actionId === "duplicate-ui-file") {
      const file = duplicateActiveFile();
      setLeftDockTab("navigator");
      recordInstantProjectAction(actionId, `Duplicated the active UI file as ${file.name}.`);
      return true;
    }

    if (actionId === "delete-ui-file") {
      setMode("design");
      setLeftDockTab("navigator");
      requestDeleteActiveFile();
      return true;
    }

    if (actionId === "bind-control-event") {
      createAndBindBackendIntegrationCommand();
      return true;
    }

    if (actionId === "run-selected-event") {
      simulateSelectedEvent();
      return true;
    }

    if (actionId === "add-rust-command") {
      const commandName = `project_command_${activeProject.rustCommands.length + 1}`;
      createRustCommandInProject();
      setMode("logic");
      recordInstantProjectAction(actionId, `Created ${commandName} and opened the Logic workspace.`);
      return true;
    }

    if (actionId === "add-state-variable") {
      const stateName = activeProject.stateVariables.length === 0 ? "statusText" : `stateValue${activeProject.stateVariables.length + 1}`;
      createStateVariableInProject();
      setMode("logic");
      recordInstantProjectAction(actionId, `Created ${stateName} for bindings and command results.`);
      return true;
    }

    if (actionId === "add-image-asset") {
      setMode("design");
      setLeftDockTab("assets");
      const asset = await chooseImageAsset();
      recordInstantProjectAction(
        actionId,
        asset ? `Imported ${asset.name} into project assets.` : "Image asset import was canceled or unavailable.",
        asset ? "succeeded" : "skipped",
      );
      return true;
    }

    return false;
  };

  const runProjectJumpAction = (actionId: ProjectJumpActionId) => {
    void (async () => {
      const handled = await runInstantProjectJumpAction(actionId);
      if (!handled) {
        enqueueProjectTask(actionId);
      }
    })();
  };

  const rememberProjectJumpResult = (result: ProjectJumpResult) => {
    setProjectJumpRecentIds((current) => [result.id, ...current.filter((id) => id !== result.id)].slice(0, 8));
  };

  const openProjectJumpResult = (result: ProjectJumpResult) => {
    rememberProjectJumpResult(result);
    setProjectJumpQuery("");
    setProjectJumpFocused(false);
    setBuildError("");

    if (result.kind === "action" && result.actionId) {
      runProjectJumpAction(result.actionId);
      return;
    }

    if (result.kind === "component" && result.insertComponentType) {
      insertComponentFromShortcut(result.insertComponentType, { centered: items.length === 0, revealPalette: true });
      return;
    }

    if (result.kind === "settings") {
      setMode("design");
      setLeftDockTab("project");
      return;
    }

    if (result.kind === "rust-command" && result.commandId) {
      selectRustCommand(result.commandId);
      setMode("logic");
      return;
    }

    if (result.kind === "state" && result.stateId) {
      selectStateVariable(result.stateId);
      setMode("logic");
      return;
    }

    if (result.kind === "asset" && result.assetId) {
      const assetItem = activeProject.files
        .flatMap((file) => file.items.map((item) => ({ file, item })))
        .find(({ item }) => item.props.assetId === result.assetId);
      if (assetItem) {
        focusBuildReadinessItem({
          id: `asset-${result.assetId}`,
          severity: "ready",
          title: result.title,
          detail: result.subtitle,
          fileId: assetItem.file.id,
          fileName: assetItem.file.name,
          itemId: assetItem.item.id,
          itemName: getItemSummary(assetItem.item),
        });
      } else {
        setMode("design");
      }
      return;
    }

    if (result.fileId) {
      const targetFile = activeProject.files.find((file) => file.id === result.fileId);
      updateActiveProject((project) => ({
        ...project,
        activeFileId: result.fileId!,
      }));
      setSelectedId(result.itemId || targetFile?.items[0]?.id || "");
      setMode(result.mode);
      return;
    }

    setMode(result.mode);
    if (result.path) {
      void openLocalArtifact(result.path);
    }
  };

  const focusBreakpointIssue = (issue: BreakpointValidationIssue) => {
    const targetFile = activeProject.files.find((file) => file.id === issue.fileId);
    if (!targetFile) {
      setBuildError(`找不到断点问题所属 UI 文件：${issue.fileName}`);
      return;
    }

    const targetItemId = issue.itemId && targetFile.items.some((item) => item.id === issue.itemId) ? issue.itemId : "";
    if (issue.itemId && !targetItemId) {
      setBuildError(`找不到断点问题控件：${issue.itemName || issue.itemId}`);
    }
    updateActiveProject((project) => ({
      ...project,
      activeFileId: issue.fileId,
      files: project.files.map((file) =>
        file.id === issue.fileId
          ? {
              ...file,
              page: {
                ...file.page,
                activeBreakpoint: issue.breakpoint,
              },
            }
          : file,
      ),
    }));
    setSelectedId(targetItemId);
    setMode("design");
  };

  const fixBreakpointIssue = (issue: BreakpointValidationIssue) => {
    if (!issue.itemId) {
      setBuildError("这个断点问题没有可自动修复的控件目标。");
      return;
    }

    const fixedProject = projectWithBreakpointIssueFix(activeProject, issue);
    if (!fixedProject) {
      setBuildError(`找不到断点问题控件：${issue.itemName || issue.itemId}`);
      return;
    }

    const targetFile = activeProject.files.find((file) => file.id === issue.fileId);
    if (targetFile) {
      pushHistorySnapshot(targetFile);
    }
    updateActiveProject(() => fixedProject);
    setSelectedId(issue.itemId);
    setBuildError("");
    setMode("design");
  };

  const projectWithBreakpointIssueFix = (project: DesignerProject, issue: BreakpointValidationIssue): DesignerProject | null => {
    const targetFile = project.files.find((file) => file.id === issue.fileId);
    const targetItem = targetFile?.items.find((item) => item.id === issue.itemId);
    if (!targetFile || !targetItem) {
      return null;
    }

    const size = responsiveBreakpointSize(issue.breakpoint, targetFile.page);
    const effectivePage = {
      ...targetFile.page,
      activeBreakpoint: issue.breakpoint,
      preset: issue.breakpoint === "desktop" ? targetFile.page.preset : issue.breakpoint,
      width: size.width,
      height: size.height,
    };
    const visualItems = resolveItemsForBreakpoint(targetFile.items, issue.breakpoint);
    const visualItem = resolveItemForBreakpoint(targetItem, issue.breakpoint);
    const fixedVisualItem = normalizeItemBoundsInTree(visualItem, visualItems, effectivePage);
    const nextItem =
      issue.breakpoint === "desktop"
        ? fixedVisualItem
        : withResponsiveLayoutOverride(targetItem, issue.breakpoint, {
            x: fixedVisualItem.x,
            y: fixedVisualItem.y,
            width: fixedVisualItem.width,
            height: fixedVisualItem.height,
          });

    return {
      ...project,
      activeFileId: issue.fileId,
      validationBreakpointIssues: (project.validationBreakpointIssues ?? []).filter((candidate) => candidate.id !== issue.id),
      files: project.files.map((file) =>
        file.id === issue.fileId
          ? {
              ...file,
              page: {
                ...file.page,
                activeBreakpoint: issue.breakpoint,
              },
              items: file.items.map((item) => (item.id === targetItem.id ? nextItem : item)),
            }
          : file,
      ),
    };
  };

  const projectWithBreakpointIssueFixes = (project: DesignerProject) => {
    let nextProject = project;
    const fixedFileIds = new Set<string>();
    const skippedIssues: BreakpointValidationIssue[] = [];
    let fixedCount = 0;
    let selectedItemId = "";

    for (const issue of project.validationBreakpointIssues ?? []) {
      if (!issue.itemId) {
        skippedIssues.push(issue);
        continue;
      }

      const fixedProject = projectWithBreakpointIssueFix(nextProject, issue);
      if (!fixedProject) {
        skippedIssues.push(issue);
        continue;
      }

      nextProject = fixedProject;
      fixedFileIds.add(issue.fileId);
      selectedItemId = issue.itemId;
      fixedCount += 1;
    }

    return {
      project: nextProject,
      fixedCount,
      fixedFileIds: Array.from(fixedFileIds),
      skippedIssues,
      selectedItemId,
    };
  };

  const pushBreakpointBatchHistorySnapshots = (fileIds: string[]) => {
    for (const fileId of fileIds) {
      const file = activeProject.files.find((candidate) => candidate.id === fileId);
      if (file) {
        pushHistorySnapshot(file);
      }
    }
  };

  const fixAllBreakpointIssues = () => {
    const batch = projectWithBreakpointIssueFixes(activeProject);
    if (batch.fixedCount === 0) {
      setBuildError(batch.skippedIssues.length > 0 ? "当前断点问题缺少可自动修复的控件目标。" : "当前没有可自动修复的断点问题。");
      return;
    }

    pushProjectSnapshot("批量断点修复前");
    pushBreakpointBatchHistorySnapshots(batch.fixedFileIds);
    updateActiveProject(() => batch.project);
    setSelectedId(batch.selectedItemId);
    setBuildError("");
    setMode("design");
  };

  const fixBreakpointIssueAndValidate = async (issue: BreakpointValidationIssue) => {
    if (!issue.itemId) {
      setBuildError("这个断点问题没有可自动修复的控件目标。");
      return;
    }
    const fixedProject = projectWithBreakpointIssueFix(activeProject, issue);
    if (!fixedProject) {
      setBuildError(`找不到断点问题控件：${issue.itemName || issue.itemId}`);
      return;
    }

    const targetFile = activeProject.files.find((file) => file.id === issue.fileId);
    pushProjectSnapshot("单项断点修复前");
    if (targetFile) {
      pushHistorySnapshot(targetFile);
    }
    setMode("build");
    setValidatingWindow(true);
    setBuildError("");
    updateActiveProject(() => fixedProject);
    setSelectedId(issue.itemId);

    try {
      await runGeneratedWindowValidation(fixedProject, auditProjectWindows(fixedProject));
    } catch (error) {
      const message = String(error);
      setBuildError(message);
      updateActiveProject((project) => ({
        ...project,
        validationLog: message,
        buildLog: message,
      }));
    } finally {
      setValidatingWindow(false);
    }
  };

  const fixAllBreakpointIssuesAndValidate = async () => {
    const batch = projectWithBreakpointIssueFixes(activeProject);
    if (batch.fixedCount === 0) {
      setBuildError(batch.skippedIssues.length > 0 ? "当前断点问题缺少可自动修复的控件目标。" : "当前没有可自动修复的断点问题。");
      return;
    }

    pushProjectSnapshot("批量断点修复并验证前");
    pushBreakpointBatchHistorySnapshots(batch.fixedFileIds);
    setMode("build");
    setValidatingWindow(true);
    setBuildError("");
    updateActiveProject(() => batch.project);
    setSelectedId(batch.selectedItemId);

    try {
      await runGeneratedWindowValidation(batch.project, auditProjectWindows(batch.project));
    } catch (error) {
      const message = String(error);
      setBuildError(message);
      updateActiveProject((project) => ({
        ...project,
        validationLog: message,
        buildLog: message,
      }));
    } finally {
      setValidatingWindow(false);
    }
  };

  const renameActiveFile = (name: string) => {
    updateActiveFile((file) => {
      const safeName = name || "Untitled.ui";
      return {
        ...file,
        name: safeName,
        path: `ui/${safeName}`,
        page: {
          ...file.page,
          title: safeName.replace(/\.ui$/i, "") || file.page.title,
        },
      };
    });
  };

  const duplicateActiveFile = () => {
    const nextFile: DesignerFile = {
      ...activeFile,
      id: createId(),
      name: `${activeFile.name.replace(/\.ui$/i, "")} Copy.ui`,
      path: `ui/${activeFile.name.replace(/\.ui$/i, "")} Copy.ui`,
      page: { ...activeFile.page },
      items: activeFile.items.map((item) => ({ ...item, id: createId(), responsive: cloneResponsiveOverrides(item.responsive), props: { ...item.props } })),
      updatedAt: new Date().toISOString(),
    };
    updateActiveProject((project) => ({
      ...project,
      files: [...project.files, nextFile],
      activeFileId: nextFile.id,
    }));
    setSelectedId(nextFile.items[0]?.id ?? "");
    setMode("design");
    return nextFile;
  };

  const createNewFileFromNavigator = () => {
    const file = createNewFile();
    setLeftDockTab("navigator");
    recordInstantProjectAction("new-ui-file", `Created ${file.name} and opened it on the canvas.`);
  };

  const duplicateActiveFileFromNavigator = () => {
    const file = duplicateActiveFile();
    setLeftDockTab("navigator");
    recordInstantProjectAction("duplicate-ui-file", `Duplicated the active UI file as ${file.name}.`);
  };

  const deleteActiveFile = () => {
    if (activeProject.files.length <= 1) {
      resetCurrentFile();
      return;
    }

    updateActiveProject((project) => {
      const nextFiles = project.files.filter((file) => file.id !== project.activeFileId);
      return {
        ...project,
        files: nextFiles,
        activeFileId: nextFiles[0].id,
      };
    });
    setSelectedId("");
    setMode("design");
  };

  const requestDeleteSelected = () => {
    if (selectedItems.length === 0) {
      return;
    }
    const unlockedCount = selectedItems.filter((item) => !item.locked).length;
    setDestructiveAction({
      title: `Delete ${unlockedCount || selectedItems.length} selected control${selectedItems.length === 1 ? "" : "s"}?`,
      description:
        unlockedCount === 0
          ? "The current selection is locked, so this action will not remove anything. Unlock the controls first if you need to delete them."
          : `This removes the selected control${unlockedCount === 1 ? "" : "s"} and any child controls from ${activeFile.name}. You can still use Undo after the deletion.`,
      confirmLabel: unlockedCount === 0 ? "Close" : "Delete selection",
      onConfirm: unlockedCount === 0 ? () => undefined : deleteSelected,
    });
  };

  const requestResetCurrentFile = () => {
    setDestructiveAction({
      title: `Clear ${activeFile.name}?`,
      description: `This removes every control from the current UI file and resets the page settings to a blank canvas. Project settings and other files are kept.`,
      confirmLabel: "Clear UI file",
      onConfirm: resetCurrentFile,
    });
  };

  const requestDeleteActiveFile = () => {
    const fileName = activeFile.name;
    const clearingOnlyFile = activeProject.files.length <= 1;
    setDestructiveAction({
      title: clearingOnlyFile ? `Clear ${fileName}?` : `Delete ${fileName}?`,
      description:
        clearingOnlyFile
          ? "This is the only UI file in the project, so Nova will clear it instead of removing the file record."
          : `This removes ${fileName} from ${activeProject.name}. Other project files, Rust logic, and release settings are kept.`,
      confirmLabel: clearingOnlyFile ? "Clear file" : "Delete file",
      onConfirm: () => {
        deleteActiveFile();
        setLeftDockTab("navigator");
        recordInstantProjectAction("delete-ui-file", clearingOnlyFile ? `Cleared ${fileName}.` : `Deleted ${fileName}.`);
      },
    });
  };

  const requestDeleteActiveProject = () => {
    setDestructiveAction({
      title: workspace.projects.length <= 1 ? `Reset ${activeProject.name}?` : `Delete ${activeProject.name}?`,
      description:
        workspace.projects.length <= 1
          ? "This is the only project in the workspace, so Nova will replace it with a fresh blank project."
          : "This removes the project from the local editor workspace. Files already written on disk are not deleted by this action.",
      confirmLabel: workspace.projects.length <= 1 ? "Reset project" : "Delete project",
      onConfirm: deleteActiveProject,
    });
  };

  const confirmDestructiveAction = () => {
    const action = destructiveAction;
    if (!action) {
      return;
    }
    setDestructiveAction(null);
    action.onConfirm();
  };

  const validateGeneratedWindow = async () => {
    setMode("build");
    setValidatingWindow(true);
    setBuildError("");

    if (buildReadinessSummary.errorCount > 0) {
      const blockingItems = buildReadinessSummary.items.filter((item) => item.severity === "error");
      const message = [
        `Window validation blocked by ${blockingItems.length} readiness issue${blockingItems.length === 1 ? "" : "s"}.`,
        ...blockingItems.map((item) => `- ${item.title}: ${item.detail}`),
      ].join("\n");
      setBuildError(message);
      updateActiveProject((project) => ({
        ...project,
        validationLog: message,
        buildLog: message,
      }));
      setValidatingWindow(false);
      return;
    }

    try {
      await runGeneratedWindowValidation(activeProject);
    } catch (error) {
      const message = String(error);
      setBuildError(message);
      updateActiveProject((project) => ({
        ...project,
        validationLog: message,
        buildLog: message,
      }));
    } finally {
      setValidatingWindow(false);
    }
  };

  const openLocalArtifact = async (path: string) => {
    if (!path) {
      return;
    }
    setBuildError("");
    try {
      const opened = await invokeIfAvailable<void>("open_local_path", { path });
      if (opened === null) {
        setBuildError("打开验证产物需要在 Tauri 桌面 app 中运行。");
      }
    } catch (error) {
      setBuildError(String(error));
    }
  };

  const copyArtifactPath = async (path: string) => {
    if (!path) {
      return;
    }
    try {
      await navigator.clipboard.writeText(path);
      setCopiedArtifactPath(path);
      window.setTimeout(() => setCopiedArtifactPath((current) => (current === path ? "" : current)), 1400);
    } catch (error) {
      setBuildError(`无法复制路径：${String(error)}`);
    }
  };

  const launchBuiltExecutable = async (entry: BuildHistoryEntry) => {
    if (!entry.outputExePath) {
      setBuildError("这个构建记录没有可启动的 exe 路径。");
      return;
    }
    setLaunchingExeId(entry.id);
    setBuildError("");
    try {
      const result = await invokeIfAvailable<LaunchExecutableResult>("launch_built_executable", {
        path: entry.outputExePath,
      });
      if (!result) {
        setBuildError("启动编译产物需要在 Tauri 桌面 app 中运行。");
        return;
      }
      setWorkflowRuntimeSession(workflowRuntimeSessionFromLaunch(result, entry.id));
      updateActiveProject((project) => ({
        ...project,
        buildLog: `${project.buildLog ? `${project.buildLog}\n` : ""}${result.summary}`,
        buildHistory: (project.buildHistory ?? []).map((candidate) =>
          candidate.id === entry.id
            ? {
                ...candidate,
                launchedPid: result.pid,
                launchedAt: result.started_at,
                launchSummary: result.summary,
                runStatus: "running",
                runCheckedAt: result.started_at,
                runSummary: result.summary,
                runtimeLogPath: result.log_path,
                runtimeLogPreview: `Nova Runtime Console\n${result.summary}\nLog: ${result.log_path}`,
                runtimeLogUpdatedAt: result.started_at,
                runtimeLogTruncated: false,
                stoppedAt: undefined,
                stopSummary: undefined,
              }
            : candidate,
        ),
      }));
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setLaunchingExeId("");
    }
  };

  const launchActiveOutputExecutable = async () => {
    if (!activeProject.outputExePath) {
      setBuildError("当前项目还没有可启动的 exe，请先执行构建。");
      return;
    }
    setLaunchingExeId("active-output");
    setBuildError("");
    try {
      const result = await invokeIfAvailable<LaunchExecutableResult>("launch_built_executable", {
        path: activeProject.outputExePath,
      });
      if (!result) {
        setBuildError("启动编译产物需要在 Tauri 桌面 app 中运行。");
        return;
      }
      const activeOutputEntry =
        (activeProject.buildHistory ?? []).find((entry) => entry.outputExePath && samePathText(entry.outputExePath, activeProject.outputExePath)) ??
        (activeProject.buildHistory ?? []).find((entry) => entry.buildKind === "exe" && entry.outputExePath) ??
        null;
      setWorkflowRuntimeSession(workflowRuntimeSessionFromLaunch(result, activeOutputEntry?.id));
      updateActiveProject((project) => ({
        ...project,
        buildLog: `${project.buildLog ? `${project.buildLog}\n` : ""}${result.summary}`,
        buildHistory: (project.buildHistory ?? []).map((candidate) =>
          candidate.id === activeOutputEntry?.id ||
          samePathText(candidate.outputExePath ?? "", result.path) ||
          samePathText(candidate.outputExePath ?? "", activeProject.outputExePath ?? "")
            ? {
                ...candidate,
                launchedPid: result.pid,
                launchedAt: result.started_at,
                launchSummary: result.summary,
                runStatus: "running",
                runCheckedAt: result.started_at,
                runSummary: result.summary,
                runtimeLogPath: result.log_path,
                runtimeLogPreview: `Nova Runtime Console\n${result.summary}\nLog: ${result.log_path}`,
                runtimeLogUpdatedAt: result.started_at,
                runtimeLogTruncated: false,
                stoppedAt: undefined,
                stopSummary: undefined,
              }
            : candidate,
        ),
      }));
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setLaunchingExeId("");
    }
  };

  const applyRunSessionResult = (entryId: string, result: RunSessionResult, stopped = false) => {
    setWorkflowRuntimeSession((session) => {
      if (!session || (session.entryId !== entryId && !samePathText(session.path, result.path))) {
        return session;
      }
      if (result.status !== "running") {
        return null;
      }
      return {
        ...session,
        path: result.path,
        pid: result.pid,
        status: result.status,
        checkedAt: result.checked_at,
        summary: result.summary,
      };
    });
    updateActiveProject((project) => ({
      ...project,
      buildLog: `${project.buildLog ? `${project.buildLog}\n` : ""}${result.summary}`,
      buildHistory: (project.buildHistory ?? []).map((candidate) =>
        candidate.id === entryId || (candidate.launchedPid === result.pid && samePathText(candidate.outputExePath ?? "", result.path))
          ? {
              ...candidate,
              runStatus: result.status,
              runCheckedAt: result.checked_at,
              runSummary: result.summary,
              stoppedAt: stopped && result.status === "stopped" ? result.checked_at : candidate.stoppedAt,
              stopSummary: stopped ? result.summary : candidate.stopSummary,
            }
          : candidate,
      ),
    }));
  };

  const refreshRunSession = async (entry: BuildHistoryEntry) => {
    if (!entry.outputExePath || !entry.launchedPid) {
      setBuildError("这个构建记录没有可检查的运行会话。");
      return;
    }
    setCheckingRunId(entry.id);
    setBuildError("");
    try {
      const result = await invokeIfAvailable<RunSessionResult>("inspect_run_session", {
        path: entry.outputExePath,
        pid: entry.launchedPid,
      });
      if (!result) {
        setBuildError("检查运行状态需要在 Tauri 桌面 app 中运行。");
        return;
      }
      applyRunSessionResult(entry.id, result);
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setCheckingRunId("");
    }
  };

  const stopRunSession = async (entry: BuildHistoryEntry) => {
    if (!entry.outputExePath || !entry.launchedPid) {
      setBuildError("这个构建记录没有可停止的运行会话。");
      return;
    }
    setStoppingRunId(entry.id);
    setBuildError("");
    try {
      const result = await invokeIfAvailable<RunSessionResult>("stop_run_session", {
        path: entry.outputExePath,
        pid: entry.launchedPid,
      });
      if (!result) {
        setBuildError("停止运行会话需要在 Tauri 桌面 app 中运行。");
        return;
      }
      applyRunSessionResult(entry.id, result, true);
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setStoppingRunId("");
    }
  };

  const stopWorkflowRuntimeSession = async (session: WorkflowRuntimeSession) => {
    const historyEntry =
      (activeProject.buildHistory ?? []).find((entry) => entry.id === session.entryId) ??
      (activeProject.buildHistory ?? []).find(
        (entry) => entry.launchedPid === session.pid && samePathText(entry.outputExePath ?? "", session.path),
      ) ??
      null;
    if (historyEntry) {
      await stopRunSession(historyEntry);
      return;
    }

    const runId = session.entryId ?? "workflow-runtime";
    setStoppingRunId(runId);
    setBuildError("");
    try {
      const result = await invokeIfAvailable<RunSessionResult>("stop_run_session", {
        path: session.path,
        pid: session.pid,
      });
      if (!result) {
        setBuildError("停止运行会话需要在 Tauri 桌面 app 中运行。");
        return;
      }
      setWorkflowRuntimeSession(result.status === "running" ? { ...session, status: result.status, checkedAt: result.checked_at, summary: result.summary } : null);
      updateActiveProject((project) => ({
        ...project,
        buildLog: `${project.buildLog ? `${project.buildLog}\n` : ""}${result.summary}`,
        buildHistory: (project.buildHistory ?? []).map((candidate) =>
          samePathText(candidate.outputExePath ?? "", result.path) || candidate.launchedPid === result.pid
            ? {
                ...candidate,
                runStatus: result.status,
                runCheckedAt: result.checked_at,
                runSummary: result.summary,
                stoppedAt: result.status === "stopped" ? result.checked_at : candidate.stoppedAt,
                stopSummary: result.summary,
              }
            : candidate,
        ),
      }));
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setStoppingRunId("");
    }
  };

  const refreshRuntimeLog = async (entry: BuildHistoryEntry) => {
    if (!entry.runtimeLogPath) {
      setBuildError("这个运行会话还没有 runtime log 路径。");
      return;
    }
    setReadingRuntimeLogId(entry.id);
    setBuildError("");
    try {
      const result = await invokeIfAvailable<RuntimeLogResult>("read_run_session_log", {
        path: entry.runtimeLogPath,
      });
      if (!result) {
        setBuildError("读取 Runtime Console 需要在 Tauri 桌面 app 中运行。");
        return;
      }
      updateActiveProject((project) => ({
        ...project,
        buildHistory: (project.buildHistory ?? []).map((candidate) =>
          candidate.id === entry.id
            ? {
                ...candidate,
                runtimeLogPath: result.path,
                runtimeLogPreview: result.content,
                runtimeLogSizeBytes: result.size_bytes,
                runtimeLogUpdatedAt: result.modified_at ?? undefined,
                runtimeLogTruncated: result.truncated,
              }
            : candidate,
        ),
      }));
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setReadingRuntimeLogId("");
    }
  };

  const applyInstallerSmokeResult = (entryId: string, result: InstallerSmokeResult) => {
    updateActiveProject((project) => ({
      ...project,
      buildLog: result.output_log || project.buildLog,
      buildHistory: (project.buildHistory ?? []).map((candidate) =>
        candidate.id === entryId
          ? {
              ...candidate,
              installerSmokeStatus: result.status,
              installerSmokeFinishedAt: result.finished_at ?? undefined,
              installerSmokeSummary: result.summary,
              installerSmokeResultPath: result.result_path,
            }
          : candidate,
      ),
    }));
  };

  const refreshInstallerSmokeResult = async (entry: BuildHistoryEntry) => {
    if (!entry.installerSmokeResultPath) {
      setBuildError("这个构建记录没有 installer smoke result 路径。");
      return;
    }
    setBuildError("");
    try {
      const result = await invokeIfAvailable<InstallerSmokeResult>("read_installer_smoke_result", {
        path: entry.installerSmokeResultPath,
      });
      if (!result) {
        setBuildError("刷新 installer smoke 结果需要在 Tauri 桌面 app 中运行。");
        return;
      }
      applyInstallerSmokeResult(entry.id, result);
    } catch (error) {
      setBuildError(String(error));
    }
  };

  const runInstallerSmokeScript = async (entry: BuildHistoryEntry) => {
    if (!entry.installerSmokeScriptPath || !entry.installerSmokeResultPath) {
      setBuildError("这个构建记录没有可运行的 installer smoke 脚本或结果路径。");
      return;
    }
    setRunningSmokeId(entry.id);
    setBuildError("");
    try {
      const result = await invokeIfAvailable<InstallerSmokeResult>("run_installer_smoke_script", {
        scriptPath: entry.installerSmokeScriptPath,
        resultPath: entry.installerSmokeResultPath,
      });
      if (!result) {
        setBuildError("运行 installer smoke 需要在 Tauri 桌面 app 中运行。");
        return;
      }
      applyInstallerSmokeResult(entry.id, result);
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setRunningSmokeId("");
    }
  };

  const createInstallerSandboxHandoff = async (entry: BuildHistoryEntry) => {
    if (!entry.installerSmokeVmHandoffPath) {
      setBuildError("这个构建记录没有 VM/Sandbox handoff JSON。");
      return;
    }
    setCreatingSandboxHandoffId(entry.id);
    setBuildError("");
    try {
      const result = await invokeIfAvailable<InstallerSandboxHandoffResult>("create_installer_sandbox_handoff", {
        handoffPath: entry.installerSmokeVmHandoffPath,
      });
      if (!result) {
        setBuildError("生成 Windows Sandbox handoff 需要在 Tauri 桌面 app 中运行。");
        return;
      }
      updateActiveProject((project) => ({
        ...project,
        buildLog: `${result.summary}\nSandbox config: ${result.sandbox_config_path}\nSandbox result: ${result.sandbox_result_path}\n${project.buildLog || ""}`.trim(),
      }));
      await openLocalArtifact(result.sandbox_config_path);
    } catch (error) {
      setBuildError(String(error));
    } finally {
      setCreatingSandboxHandoffId("");
    }
  };

  const checkActiveProject = async (checkKind: "frontend" | "rust" | "all") => {
    setMode("build");
    setCheckingTarget(checkKind);
    setBuildError("");

    try {
      const result = await invokeIfAvailable<BuildResult>("check_editor_project", {
        project: activeProject,
        rustLogic: activeProject.rustLogic,
        checkKind,
      });

      if (!result) {
        const message = "Quick checks are available in the Tauri desktop app. The web preview can only run in-browser editor checks.";
        updateActiveProject((project) => ({
          ...project,
          buildLog: message,
        }));
        return null;
      }

      updateActiveProject((project) => ({
        ...project,
        rootPath: result.paths.root_path,
        lastGeneratedFileSummary: normalizeGeneratedFileChangeSummary(result.generated_files) ?? project.lastGeneratedFileSummary,
        buildLog: result.log,
      }));
      recordProjectDependencyGraphEvent(
        {
          kind: "check",
          actionId:
            checkKind === "frontend"
              ? "quick-check-frontend"
              : checkKind === "rust"
                ? "quick-check-rust"
                : "quick-check-all",
          status: result.success ? "succeeded" : "failed",
          summary: result.success ? `${checkKind} check completed.` : `${checkKind} check failed.`,
          artifactPath: result.paths.generated_app_dir,
        },
        projectChangeImpact,
        { ...activeProject, rootPath: result.paths.root_path },
      );
      void refreshManagedProjects();
      return result;
    } catch (error) {
      const message = String(error);
      setBuildError(message);
      updateActiveProject((project) => ({
        ...project,
        buildLog: message,
      }));
      throw error;
    } finally {
      setCheckingTarget(null);
    }
  };

  const previewGeneratedProjectFiles = async () => {
    setMode("build");
    setPreviewingGeneratedFiles(true);
    setBuildError("");
    const previewSnapshotHash = activeProjectSnapshotHash;
    try {
      const result = await invokeIfAvailable<GeneratedFilePreviewResult>("preview_generated_project_files", {
        project: activeProject,
        rustLogic: activeProject.rustLogic,
      });
      if (!result) {
        setBuildError("生成文件预览需要在 Tauri 桌面 app 中运行。");
        return null;
      }
      setGeneratedFilePreview(result);
      setGeneratedFilePreviewSnapshotHash(previewSnapshotHash);
      setGeneratedFileApplyResult(null);
      setSelectedGeneratedPreviewPaths(
        result.entries.filter(generatedPreviewEntryNeedsApply).map((entry) => entry.relative_path),
      );
      setActiveGeneratedPreviewPath(
        result.entries.find((entry) => entry.changed)?.relative_path ?? result.entries[0]?.relative_path ?? "",
      );
      const previewImpact = createProjectChangeImpact(activeProject, result, previewSnapshotHash, previewSnapshotHash);
      recordProjectDependencyGraphEvent(
        {
          kind: "preview",
          actionId: "preview-generated-files",
          status: "succeeded",
          summary: result.summary,
          artifactPath: result.root_path,
        },
        previewImpact,
        activeProject,
      );
      return result;
    } catch (error) {
      setBuildError(String(error));
      throw error;
    } finally {
      setPreviewingGeneratedFiles(false);
    }
  };

  const toggleGeneratedPreviewPath = (relativePath: string, selected: boolean) => {
    setSelectedGeneratedPreviewPaths((current) => {
      if (selected) {
        return current.includes(relativePath) ? current : [...current, relativePath];
      }
      return current.filter((path) => path !== relativePath);
    });
  };

  const selectChangedGeneratedPreviewPaths = () => {
    setSelectedGeneratedPreviewPaths(selectableGeneratedPreviewEntries.map((entry) => entry.relative_path));
  };

  const selectGeneratedChangeScope = (scope: ProjectChangeScope) => {
    setSelectedGeneratedPreviewPaths(scope.paths);
    setActiveGeneratedPreviewPath(scope.paths[0] ?? "");
  };

  const focusProjectDependencySourceRef = (source: ProjectDependencySourceReference) => {
    if (source.affectedPaths[0]) {
      setActiveGeneratedPreviewPath(source.affectedPaths[0]);
    }

    if (source.fileId && activeProject.files.some((file) => file.id === source.fileId)) {
      const targetFile = activeProject.files.find((file) => file.id === source.fileId);
      const targetItemId = source.itemId && targetFile?.items.some((item) => item.id === source.itemId) ? source.itemId : "";
      updateActiveProject((project) => ({
        ...project,
        activeFileId: source.fileId!,
      }));
      setSelectedId(targetItemId);
      setMode("design");
      return;
    }

    if (source.commandId && activeProject.rustCommands.some((command) => command.id === source.commandId)) {
      updateActiveProject((project) => ({
        ...project,
        activeRustCommandId: source.commandId!,
      }));
      setMode("logic");
      return;
    }

    if (source.moduleId && activeProject.rustModules.some((module) => module.id === source.moduleId)) {
      updateActiveProject((project) => ({
        ...project,
        activeRustModuleId: source.moduleId,
      }));
      setMode("logic");
      return;
    }

    if (source.dependencyId && activeProject.cargoDependencies.some((dependency) => dependency.id === source.dependencyId)) {
      updateActiveProject((project) => ({
        ...project,
        activeCargoDependencyId: source.dependencyId,
      }));
      setMode("logic");
      return;
    }

    if (source.integrationId && activeProject.backendIntegrations.some((integration) => integration.id === source.integrationId)) {
      updateActiveProject((project) => ({
        ...project,
        activeBackendIntegrationId: source.integrationId,
      }));
      setMode("logic");
      return;
    }

    setMode(source.kind === "release-config" || source.kind === "validation" ? "build" : "design");
  };

  const focusProjectReverseDependencyTarget = (target: ProjectReverseDependencyTarget) => {
    focusProjectDependencySourceRef({
      id: target.id,
      kind: target.kind,
      label: target.label,
      detail: target.detail,
      affectedPaths: target.path ? [target.path] : [],
      fileId: target.fileId,
      itemId: target.itemId,
      commandId: target.commandId,
      moduleId: target.moduleId,
      dependencyId: target.dependencyId,
      assetId: target.assetId,
      integrationId: target.integrationId,
      path: target.path,
    });
  };

  const selectProjectReverseDependencyOutputs = (summary: ProjectReverseDependencySummary) => {
    const targetPaths = summary.affectedPaths.filter(Boolean);
    if (targetPaths.length === 0) {
      setBuildError("当前源对象还没有可定位的生成目标，请先刷新生成文件预览。");
      return;
    }
    setSelectedGeneratedPreviewPaths(targetPaths);
    setActiveGeneratedPreviewPath(targetPaths[0]);
    setMode("build");
  };

  const applyGeneratedFilesByPaths = async (relativePaths: string[], emptyMessage = "请先选择至少一个生成目标文件。") => {
    const targetPaths = Array.from(new Set(relativePaths.filter(Boolean)));
    if (targetPaths.length === 0) {
      setBuildError(emptyMessage);
      return null;
    }
    const appliedScopeIds = dirtyScopeIdsForImpact(projectChangeImpact);
    setMode("build");
    setApplyingGeneratedFiles(true);
    setBuildError("");
    try {
      const result = await invokeIfAvailable<ApplyGeneratedFilesResult>("apply_generated_project_files", {
        project: activeProject,
        rustLogic: activeProject.rustLogic,
        relativePaths: targetPaths,
        createdAt: new Date().toISOString(),
      });
      if (!result) {
        setBuildError("应用生成文件需要在 Tauri 桌面 app 中运行。");
        return null;
      }
      setGeneratedFileApplyResult(result);
      const preview = await invokeIfAvailable<GeneratedFilePreviewResult>("preview_generated_project_files", {
        project: activeProject,
        rustLogic: activeProject.rustLogic,
      });
      if (preview) {
        const nextProjectSnapshot = { ...activeProject, rootPath: result.root_path };
        const nextSnapshotHash = stableTextHash(projectSnapshotFingerprint(nextProjectSnapshot));
        setGeneratedFilePreview(preview);
        setGeneratedFilePreviewSnapshotHash(nextSnapshotHash);
        setSelectedGeneratedPreviewPaths(preview.entries.filter(generatedPreviewEntryNeedsApply).map((entry) => entry.relative_path));
        setActiveGeneratedPreviewPath(
          preview.entries.find((entry) => entry.changed)?.relative_path ?? preview.entries[0]?.relative_path ?? "",
        );
        const applyImpact = createProjectChangeImpact(nextProjectSnapshot, preview, nextSnapshotHash, nextSnapshotHash);
        recordProjectDependencyGraphEvent(
          {
            kind: "apply",
            actionId: "apply-generated-changes",
          status: "succeeded",
          summary: result.summary,
          artifactPath: result.root_path,
          scopeIds: appliedScopeIds,
        },
          applyImpact,
          nextProjectSnapshot,
        );
      }
      updateActiveProject((project) => ({
        ...project,
        rootPath: result.root_path,
        buildLog: `${project.buildLog ? `${project.buildLog}\n` : ""}${result.summary}`,
      }));
      void refreshManagedProjects();
      return result;
    } catch (error) {
      setBuildError(String(error));
      throw error;
    } finally {
      setApplyingGeneratedFiles(false);
    }
  };

  const applySelectedGeneratedFiles = async () => applyGeneratedFilesByPaths(selectedGeneratedPreviewPaths);

  const applyGeneratedFileChanges = async (): Promise<ProjectTaskRunResult> => {
    const preview = await previewGeneratedProjectFiles();
    if (!preview) {
      return { status: "skipped", summary: "Generated file auto-apply requires the Tauri desktop runtime." };
    }
    const paths = preview.entries.filter(generatedPreviewEntryNeedsApply).map((entry) => entry.relative_path);
    if (paths.length === 0) {
      return {
        status: "skipped",
        summary: "Generated target files are already up to date.",
        logPreview: `${preview.unchanged_count} unchanged / ${preview.total_count} total generated target file(s).`,
        artifactPath: preview.root_path,
      };
    }
    const result = await applyGeneratedFilesByPaths(paths, "No changed generated files were found.");
    if (!result) {
      return { status: "skipped", summary: "No generated file changes were applied.", artifactPath: preview.root_path };
    }
    return {
      summary: result.summary,
      logPreview: `${result.applied_count} applied / ${result.skipped_count} skipped. Snapshot: ${result.checkpoint_path}`,
      artifactPath: result.root_path,
    };
  };

  const buildActiveProject = async () => {
    setMode("build");
    setBuilding(true);
    setBuildError("");

    if (buildReadinessSummary.errorCount > 0) {
      const blockingItems = buildReadinessSummary.items.filter((item) => item.severity === "error");
      const message = [
        `Build blocked by ${blockingItems.length} readiness issue${blockingItems.length === 1 ? "" : "s"}.`,
        ...blockingItems.map((item) => `- ${item.title}: ${item.detail}`),
      ].join("\n");
      setBuildError(message);
      updateActiveProject((project) => ({
        ...project,
        buildLog: message,
      }));
      setBuilding(false);
      return null;
    }

    try {
      const result = await invokeIfAvailable<BuildResult>("build_editor_project", {
        project: activeProject,
        rustLogic: activeProject.rustLogic,
      });

      if (!result) {
        const message = "Build is available in the Tauri desktop app. The web preview saved the workspace locally only.";
        updateActiveProject((project) => ({
          ...project,
          buildLog: message,
        }));
        return null;
      }

      const buildEntry = createBuildHistoryEntry(result, activeProject, buildReadinessSummary, windowVisualAudit);
      updateActiveProject((project) => ({
        ...project,
        rootPath: result.paths.root_path,
        outputExePath: result.paths.output_exe_path ?? project.outputExePath,
        rustSourceMap: normalizeGeneratedRustSourceMap(result.rust_source_map) ?? project.rustSourceMap,
        rustSourceMapPath: result.paths.rust_source_map_path,
        generatedRustSourceMapPath: result.paths.generated_rust_source_map_path,
        lastGeneratedFileSummary: normalizeGeneratedFileChangeSummary(result.generated_files) ?? project.lastGeneratedFileSummary,
        buildLog: result.log,
        buildHistory: [buildEntry, ...(project.buildHistory ?? [])].slice(0, 12),
      }));
      recordProjectDependencyGraphEvent(
        {
          kind: "build",
          actionId: "build-exe",
          status: result.success ? "succeeded" : "failed",
          summary: buildEntry.summary,
          artifactPath: result.paths.output_exe_path ?? result.paths.generated_app_dir,
        },
        projectChangeImpact,
        { ...activeProject, rootPath: result.paths.root_path, outputExePath: result.paths.output_exe_path ?? activeProject.outputExePath },
      );
      void refreshManagedProjects();
      return result;
    } catch (error) {
      const message = String(error);
      setBuildError(message);
      updateActiveProject((project) => ({
        ...project,
        buildLog: message,
      }));
      throw error;
    } finally {
      setBuilding(false);
    }
  };

  const bundleActiveProject = async () => {
    setMode("build");
    setBundling(true);
    setBuildError("");

    if (buildReadinessSummary.errorCount > 0) {
      const blockingItems = buildReadinessSummary.items.filter((item) => item.severity === "error");
      const message = [
        `Bundle build blocked by ${blockingItems.length} readiness issue${blockingItems.length === 1 ? "" : "s"}.`,
        ...blockingItems.map((item) => `- ${item.title}: ${item.detail}`),
      ].join("\n");
      setBuildError(message);
      updateActiveProject((project) => ({
        ...project,
        buildLog: message,
      }));
      setBundling(false);
      return null;
    }

    try {
      const result = await invokeIfAvailable<BuildResult>("bundle_editor_project", {
        project: activeProject,
        rustLogic: activeProject.rustLogic,
      });

      if (!result) {
        const message = "Bundle build is available in the Tauri desktop app. The web preview saved the workspace locally only.";
        updateActiveProject((project) => ({
          ...project,
          buildLog: message,
        }));
        return null;
      }

      const buildEntry = createBuildHistoryEntry(result, activeProject, buildReadinessSummary, windowVisualAudit);
      updateActiveProject((project) => ({
        ...project,
        rootPath: result.paths.root_path,
        outputExePath: result.paths.output_exe_path ?? project.outputExePath,
        outputBundleDir: result.bundle_dir ?? project.outputBundleDir,
        outputBundlePaths: result.bundle_paths?.length ? result.bundle_paths : project.outputBundlePaths,
        outputBundleManifestPath: result.bundle_manifest_path ?? project.outputBundleManifestPath,
        rustSourceMap: normalizeGeneratedRustSourceMap(result.rust_source_map) ?? project.rustSourceMap,
        rustSourceMapPath: result.paths.rust_source_map_path,
        generatedRustSourceMapPath: result.paths.generated_rust_source_map_path,
        lastGeneratedFileSummary: normalizeGeneratedFileChangeSummary(result.generated_files) ?? project.lastGeneratedFileSummary,
        buildLog: result.log,
        buildHistory: [buildEntry, ...(project.buildHistory ?? [])].slice(0, 12),
      }));
      recordProjectDependencyGraphEvent(
        {
          kind: "bundle",
          actionId: "bundle-installer",
          status: result.success ? "succeeded" : "failed",
          summary: buildEntry.summary,
          artifactPath: result.bundle_manifest_path ?? result.bundle_paths?.[0] ?? result.bundle_dir ?? result.paths.generated_app_dir,
        },
        projectChangeImpact,
        {
          ...activeProject,
          rootPath: result.paths.root_path,
          outputExePath: result.paths.output_exe_path ?? activeProject.outputExePath,
          outputBundleDir: result.bundle_dir ?? activeProject.outputBundleDir,
          outputBundlePaths: result.bundle_paths?.length ? result.bundle_paths : activeProject.outputBundlePaths,
          outputBundleManifestPath: result.bundle_manifest_path ?? activeProject.outputBundleManifestPath,
        },
      );
      void refreshManagedProjects();
      return result;
    } catch (error) {
      const message = String(error);
      setBuildError(message);
      updateActiveProject((project) => ({
        ...project,
        buildLog: message,
      }));
      throw error;
    } finally {
      setBundling(false);
    }
  };

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const downloadExport = () => {
    const blob = new Blob([exportText], { type: exportKind === "json" ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeFile.name.replace(/\.ui$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "nova-interface"}.${exportKind === "json" ? "json" : "tsx"}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const releaseReadinessActionItems = releaseReadinessSummary.items
    .filter((item) => item.severity !== "ready")
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const releaseActionButtonLabel = (item: ReleaseReadinessItem) => {
    if (item.id === "validation") {
      return "运行验证";
    }
    if (item.id === "artifact") {
      return "构建 exe";
    }
    if (item.id === "smoke") {
      return "打包";
    }
    if (item.id === "runtime") {
      return "启动 exe";
    }
    if (item.id === "checkpoint" || item.id === "traceability") {
      return "创建 checkpoint";
    }
    if (item.id === "signing") {
      return "查看签名";
    }
    return "查看问题";
  };

  const releaseActionButtonLoading = (item: ReleaseReadinessItem) => {
    if (item.id === "validation") {
      return validatingWindow;
    }
    if (item.id === "artifact") {
      return building;
    }
    if (item.id === "smoke") {
      return bundling;
    }
    if (item.id === "runtime") {
      return Boolean(launchingExeId);
    }
    if (item.id === "checkpoint" || item.id === "traceability") {
      return diskBusy;
    }
    return false;
  };

  const releaseActionButtonDisabled = (item: ReleaseReadinessItem) => {
    if (item.id === "validation") {
      return validatingWindow || building || bundling;
    }
    if (item.id === "artifact") {
      return building || bundling;
    }
    if (item.id === "smoke") {
      return building || bundling;
    }
    if (item.id === "runtime") {
      return Boolean(launchingExeId) || !activeProject.outputExePath;
    }
    if (item.id === "checkpoint" || item.id === "traceability") {
      return diskBusy;
    }
    return false;
  };

  const runReleaseReadinessAction = (item: ReleaseReadinessItem) => {
    if (item.id === "validation") {
      enqueueProjectTask("validate-window");
      return;
    }
    if (item.id === "artifact") {
      enqueueProjectTask("build-exe");
      return;
    }
    if (item.id === "smoke") {
      enqueueProjectTask("bundle-installer");
      return;
    }
    if (item.id === "runtime") {
      void launchActiveOutputExecutable();
      return;
    }
    if (item.id === "checkpoint" || item.id === "traceability") {
      void createDiskCheckpoint();
      return;
    }
    setMode("build");
  };

  const canvasPanActive = canvasPanMode || spacePanActive;

  const startCanvasPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const shouldPan = canvasPanActive || event.button === 1 || event.altKey;
    const viewport = canvasViewportRef.current;
    if (!shouldPan || !viewport) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    viewport.setPointerCapture(event.pointerId);
    canvasPanSessionRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startScrollLeft: viewport.scrollLeft,
      startScrollTop: viewport.scrollTop,
    };
  };

  const moveCanvasPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = canvasPanSessionRef.current;
    const viewport = canvasViewportRef.current;
    if (!session || !viewport || session.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    viewport.scrollLeft = session.startScrollLeft - (event.clientX - session.startClientX);
    viewport.scrollTop = session.startScrollTop - (event.clientY - session.startClientY);
  };

  const stopCanvasPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = canvasPanSessionRef.current;
    const viewport = canvasViewportRef.current;
    if (viewport?.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    if (session?.pointerId === event.pointerId) {
      canvasPanSessionRef.current = null;
    }
  };

  const handleCanvasViewportWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!(event.ctrlKey || event.metaKey)) {
      return;
    }
    event.preventDefault();
    zoomCanvasBy(event.deltaY < 0 ? 0.1 : -0.1);
  };

  const startCanvasMousePan = (event: ReactMouseEvent<HTMLDivElement>) => {
    const shouldPan = canvasPanActive || event.button === 1 || event.altKey;
    const viewport = canvasViewportRef.current;
    if (!shouldPan || !viewport) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const session = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      startScrollLeft: viewport.scrollLeft,
      startScrollTop: viewport.scrollTop,
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      viewport.scrollLeft = session.startScrollLeft - (moveEvent.clientX - session.startClientX);
      viewport.scrollTop = session.startScrollTop - (moveEvent.clientY - session.startClientY);
      moveEvent.preventDefault();
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handlePreviewCanvasClick = (item: BuilderItem) => {
    if (mode !== "preview") {
      return;
    }
    const eventName = eventNameForItem(item);
    if (!eventName || item.type === "input" || item.type === "textarea") {
      return;
    }
    if (eventName === "change" && (item.type === "checkbox" || item.type === "switch")) {
      const props = resolveSimulatorProps(item, simulatorStateValues);
      runSimulatorEventForItem(item, eventName, !Boolean(props.checked));
      return;
    }
    runSimulatorEventForItem(item, eventName);
  };

  const handlePreviewCanvasChange = (item: BuilderItem, event: ReactFormEvent<HTMLDivElement>) => {
    if (mode !== "preview") {
      return;
    }
    const eventName = eventNameForItem(item);
    if (eventName !== "change") {
      return;
    }

    event.stopPropagation();
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const rawValue =
      (item.type === "checkbox" || item.type === "switch") && "checked" in target
        ? Boolean((target as HTMLInputElement).checked)
        : target.value;
    runSimulatorEventForItem(item, eventName, rawValue);
  };

  const canvasStageStyle: CSSProperties = {
    width: page.width * page.zoom,
    height: page.height * page.zoom,
  };

  const canvasStyle: CSSProperties = {
    width: page.width,
    height: page.height,
    transform: `scale(${page.zoom})`,
    transformOrigin: "top left",
    ...getCanvasBackgroundStyle(page),
  };

  const renderCanvasNode = (item: BuilderItem): ReactNode => {
    const children = sortedItems.filter((child) => child.parentId === item.id);
    const managedByParentLayout = parentUsesAutoLayout(item, items);
    const isFrameDropTarget = item.type === "frame" && dropIntent?.kind === "frame" && dropIntent.frameId === item.id && mode === "design";
    const layoutMode = item.type === "frame" ? frameLayoutMode(item) : "free";
    const frameMetrics = item.type === "frame" ? frameLayoutMetrics(item) : { gap: 0, padding: 0, columns: 2 };
    const frameIntent = isFrameDropTarget && dropIntent?.kind === "frame" ? dropIntent : null;
    const dropIndex = frameIntent?.index ?? 0;
    const dropCount = frameIntent?.childCount ?? 0;
    const itemEventName = eventNameForItem(item);
    const nodeStyle: CSSProperties = managedByParentLayout
      ? {
          width: item.width,
          height: item.height,
          zIndex: item.z,
        }
      : {
          left: item.x,
          top: item.y,
          width: item.width,
          height: item.height,
          zIndex: item.z,
        };
    return (
      <div
        key={item.id}
        data-builder-node={item.type}
        data-builder-node-id={item.id}
        data-builder-parent-id={item.parentId ?? ""}
        className={cn(
          managedByParentLayout ? "relative shrink-0 rounded-[12px] transition-shadow" : "absolute rounded-[12px] transition-shadow",
          mode === "design" && "select-none",
          mode === "design" && !item.locked && "cursor-grab active:cursor-grabbing",
          mode === "design" && selectedIds.includes(item.id) && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
          mode === "design" && !selectedIds.includes(item.id) && "hover:ring-1 hover:ring-outline",
          mode === "preview" && itemEventName && item.type !== "input" && item.type !== "textarea" && "cursor-pointer",
          isFrameDropTarget && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
          item.locked && mode === "design" && "cursor-not-allowed opacity-90",
        )}
        style={nodeStyle}
        onPointerDown={(event) => {
          startMove(event, item);
        }}
        onClick={(event) => {
          event.stopPropagation();
          selectItem(item.id, event);
          handlePreviewCanvasClick(item);
        }}
        onChange={(event) => handlePreviewCanvasChange(item, event)}
      >
        <div className={cn("h-full w-full overflow-hidden", mode === "design" && "pointer-events-none")}>
          {renderBuilderPreview(item, mode, activeProject.assets)}
        </div>

        {children.length > 0 ? (
          <div className="subtle-scrollbar rounded-[12px]" style={frameChildrenStyle(item)}>
            {children.map((child) => renderCanvasNode(child))}
          </div>
        ) : null}

        {isFrameDropTarget ? (
          <div className="pointer-events-none absolute inset-2 z-30 overflow-hidden rounded-[14px] border border-dashed border-primary/80 bg-primary/10 p-2 shadow-m3-1 backdrop-blur-[1px]">
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/25 bg-surface-container-lowest/95 px-2 py-1 text-[0.66rem] font-medium text-primary shadow-m3-1">
              <PanelTop aria-hidden className="size-3" />
              <span className="truncate">Drop into Frame</span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 uppercase">{layoutMode}</span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5">#{Math.min(dropIndex + 1, dropCount + 1)}</span>
            </div>
            {layoutMode === "free" ? (
              <div className="mt-2 h-[calc(100%-2rem)] rounded-[10px] border border-primary/25 bg-surface/45" />
            ) : (
              <div className="relative mt-2 h-[calc(100%-2rem)]">
                <div
                  className={cn(
                    "absolute inset-0 gap-1.5",
                    layoutMode === "row" && "flex flex-row",
                    layoutMode === "column" && "flex flex-col",
                    layoutMode === "grid" && "grid",
                  )}
                  style={layoutMode === "grid" ? { gridTemplateColumns: `repeat(${frameMetrics.columns}, minmax(0, 1fr))` } : undefined}
                >
                {Array.from({ length: layoutMode === "grid" ? Math.min(frameMetrics.columns * 2, 8) : 3 }).map((_, index) => (
                  <span key={index} className="min-h-4 rounded-[8px] border border-primary/35 bg-surface/55" />
                ))}
                </div>
                {layoutMode === "row" ? (
                  <span
                    className="absolute bottom-0 top-0 w-1 rounded-full bg-primary shadow-m3-1"
                    style={{ left: `${(Math.min(dropIndex, dropCount) / Math.max(dropCount, 1)) * 100}%` }}
                  />
                ) : null}
                {layoutMode === "column" ? (
                  <span
                    className="absolute left-0 right-0 h-1 rounded-full bg-primary shadow-m3-1"
                    style={{ top: `${(Math.min(dropIndex, dropCount) / Math.max(dropCount, 1)) * 100}%` }}
                  />
                ) : null}
                {layoutMode === "grid" ? (
                  <span className="absolute bottom-2 right-2 rounded-full border border-primary/30 bg-surface-container-lowest/95 px-2 py-1 text-[0.62rem] font-medium text-primary shadow-m3-1">
                    Insert {Math.min(dropIndex + 1, dropCount + 1)}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        {mode === "design" && selectedId === item.id ? (
          <>
            <div className="pointer-events-none absolute -left-1 -top-7 rounded-full border border-outline-variant bg-surface-container-high px-2 py-1 text-[0.68rem] font-medium text-on-surface-variant shadow-m3-1">
              x {item.x} · y {item.y} · {item.width} x {item.height}
            </div>
            <button
              type="button"
              data-builder-resize-handle=""
              aria-label="调整控件尺寸"
              className="focus-ring absolute -bottom-3 -right-3 z-20 flex size-7 touch-none items-center justify-center rounded-full border border-primary bg-surface text-primary shadow-m3-1"
              onPointerDownCapture={(event) => startResize(event, item)}
            >
              <Maximize2 aria-hidden className="size-3" />
            </button>
          </>
        ) : null}
      </div>
    );
  };

  const modeBarItems: Array<{ mode: BuilderMode; label: string; detail: string; icon: typeof Layers }> = [
    { mode: "design", label: "Design", detail: "Canvas", icon: MousePointer2 },
    { mode: "logic", label: "Logic", detail: "Rust", icon: Braces },
    { mode: "build", label: "Build", detail: "Run", icon: Download },
    { mode: "preview", label: "Preview", detail: "Sim", icon: Monitor },
    { mode: "export", label: "Export", detail: "Code", icon: FileJson },
  ];
  const activeModeItem = modeBarItems.find((item) => item.mode === mode) ?? modeBarItems[0];
  const leftDockTabs: BuilderDockTab<BuilderLeftDockTab>[] = [
    { value: "project", label: "Project", icon: FolderOpen },
    { value: "navigator", label: "Navigator", icon: FileJson, badge: <Badge variant="outline">{activeProject.files.length}</Badge> },
    { value: "components", label: "Components", icon: Layers, badge: <Badge variant="outline">{palette.length}</Badge> },
    { value: "assets", label: "Assets", icon: FileImage, badge: <Badge variant="outline">{activeProject.assets.length}</Badge> },
  ];
  const rightDockTabs: BuilderDockTab<BuilderRightDockTab>[] = [
    { value: "properties", label: "Properties", icon: Settings2 },
    { value: "connections", label: "Connections", icon: Braces },
    { value: "responsive", label: "Responsive", icon: Monitor },
    { value: "impact", label: "Impact", icon: AlertTriangle },
  ];
  const bottomDockTabs: BuilderDockTab<BuilderBottomDockTab>[] = [
    { value: "issues", label: "Issues", icon: AlertTriangle, badge: <Badge variant={buildDiagnostics.length > 0 || buildError ? "destructive" : "outline"}>{buildDiagnostics.length + (buildError ? 1 : 0)}</Badge> },
    { value: "output", label: "Output", icon: Terminal },
    { value: "tasks", label: "Tasks", icon: ClipboardCopy, badge: <Badge variant="outline">{projectTasks.length}</Badge> },
    { value: "logs", label: "Logs", icon: FileJson },
  ];
  const editorWorkflowSteps: EditorWorkflowStep[] = [
    {
      id: "save",
      title: "Save",
      detail: saved ? "Workspace clean" : "Persist project changes",
      badge: saved ? "clean" : "dirty",
      icon: Save,
      actions: ["save-project"],
    },
    {
      id: "generate",
      title: "Generate",
      detail: latestGeneratedFileSummary
        ? `${latestGeneratedFileSummary.changed_count} changed / ${latestGeneratedFileSummary.total_count} targets`
        : "Preview and apply target files",
      badge: "files",
      icon: FileJson,
      actions: ["preview-generated-files", "apply-generated-changes"],
    },
    {
      id: "check",
      title: "Check",
      detail: buildReadinessSummary.errorCount > 0 ? `${buildReadinessSummary.errorCount} blocker(s) to resolve` : "Run backend and quick checks",
      badge: buildReadinessSummary.errorCount > 0 ? "blocked" : "checks",
      icon: Terminal,
      actions: ["build-backend-artifacts", "quick-check-all"],
    },
    {
      id: "validate",
      title: "Validate",
      detail: activeProject.validationHistory?.[0]
        ? `${activeProject.validationHistory[0].status} · ${activeProject.validationHistory[0].score}%`
        : "Audit generated window",
      badge: "audit",
      icon: Monitor,
      actions: ["validate-window"],
    },
    {
      id: "build",
      title: "Build",
      detail: latestBuildEntry ? `${latestBuildEntry.releaseAppName} v${latestBuildEntry.releaseVersion}` : "Compile release exe",
      badge: "exe",
      icon: Download,
      actions: ["build-exe"],
    },
  ];
  const editorWorkflowStepStates: Array<{
    step: EditorWorkflowStep;
    task: ProjectTaskEntry | null;
    status: ProjectTaskStatus | "idle";
  }> = editorWorkflowSteps.map((step) => {
    const task = workflowTaskForActions(activeProjectTasks, step.actions);
    return {
      step,
      task,
      status: task?.status ?? "idle",
    };
  });
  const activeWorkflowStepState = editorWorkflowStepStates.find(({ status }) => status === "running" || status === "queued") ?? null;
  const workflowComplete =
    editorWorkflowStepStates.length > 0 && editorWorkflowStepStates.every(({ status }) => status === "succeeded");
  const activeWorkflowRuntimeSession = workflowRuntimeSession?.status === "running" ? workflowRuntimeSession : null;
  const activeWorkflowRuntimeStopId = activeWorkflowRuntimeSession?.entryId ?? "workflow-runtime";
  const workflowRuntimeActive = Boolean(workflowComplete && activeWorkflowRuntimeSession?.pid && activeWorkflowRuntimeSession.status === "running");
  const nextWorkflowStepState =
    activeWorkflowStepState ??
    editorWorkflowStepStates.find(({ status }) => status === "failed") ??
    editorWorkflowStepStates.find(({ status }) => status === "idle" || status === "skipped" || status === "canceled") ??
    null;
  const suggestedWorkflowStepId = nextWorkflowStepState?.step.id ?? null;
  const workflowPrimaryActionLabel =
    workflowRuntimeActive
      ? stoppingRunId === activeWorkflowRuntimeStopId
        ? "Stopping"
        : "Stop target"
      : workflowComplete && activeProject.outputExePath
      ? launchingExeId === "active-output"
        ? "Launching"
        : "Run exe"
      : workflowComplete
        ? "Open output"
        : nextWorkflowStepState?.status === "failed"
          ? "Retry"
          : nextWorkflowStepState?.status === "running"
            ? "Running"
            : "Continue";
  const workflowPrimaryActionDisabled = workflowRuntimeActive
    ? Boolean(stoppingRunId)
    : workflowComplete
    ? Boolean(activeProject.outputExePath && launchingExeId)
    : Boolean(!nextWorkflowStepState || runningProjectTask || queuedProjectTaskCount > 0);
  const workflowRailStateLabel = activeWorkflowStepState ? "Active step" : workflowRuntimeActive ? "Target running" : workflowComplete ? "Workflow complete" : "Next step";
  const workflowRailBadgeLabel = workflowRuntimeActive
    ? "running"
    : workflowComplete
    ? "done"
    : nextWorkflowStepState
      ? workflowStepStatusLabel(nextWorkflowStepState.status)
      : "ready";
  const workflowRailBadgeVariant = nextWorkflowStepState?.status === "failed" ? "destructive" : workflowComplete || workflowRuntimeActive ? "secondary" : "outline";
  const workflowActivityText = runningProjectTask
    ? `Running ${runningProjectTask.title}`
    : queuedProjectTaskCount > 0
      ? `${queuedProjectTaskCount} queued task(s)`
      : failedProjectTaskCount > 0
        ? `${failedProjectTaskCount} failed task(s)`
        : "Ready for the next editor action";
  const workflowRailTitle = workflowRuntimeActive ? "Runtime active" : workflowComplete ? "Ready to run" : nextWorkflowStepState?.step.title ?? "Workflow ready";
  const workflowRailDetail = workflowRuntimeActive
    ? `pid ${activeWorkflowRuntimeSession?.pid} · ${activeWorkflowRuntimeSession?.status ?? "running"}`
    : workflowComplete
    ? activeProject.outputExePath
      ? `Release exe ready: ${fileNameFromPath(activeProject.outputExePath)}`
      : latestReleasePipeline?.summary ?? "All editor workflow steps finished."
    : runningProjectTask
      ? workflowActivityText
      : nextWorkflowStepState?.task?.summary ?? nextWorkflowStepState?.step.detail ?? workflowActivityText;
  const operationMonitorTitle = operationMonitorTask
    ? operationMonitorTask.pipelinePresetTitle
      ? `${operationMonitorTask.pipelinePresetTitle} / ${operationMonitorTask.title}`
      : operationMonitorTask.title
    : buildError
      ? "Editor message"
      : "Editor operations";
  const operationMonitorDetail =
    operationMonitorTask?.error ??
    operationMonitorTask?.summary ??
    operationMonitorTask?.detail ??
    buildError ??
    "Run Save, Generate, Check, Validate, or Build to see live task evidence here.";
  const operationMonitorStatus = operationMonitorTask?.status ?? (buildError ? "failed" : "queued");
  const operationMonitorVisible = Boolean(operationMonitorTask || buildError || queuedProjectTaskCount > 0 || failedProjectTaskCount > 0);
  const runEditorWorkflowStep = (step: EditorWorkflowStep) => {
    setBuildError("");
    if (step.actions.length === 1) {
      enqueueProjectTask(step.actions[0]);
      return;
    }
    runProjectActionsAsPipeline({
      id: `workflow-${step.id}-${Date.now()}`,
      title: step.title,
      detail: step.detail,
      badge: step.badge,
      actions: step.actions,
      custom: true,
    });
  };

  const runWorkflowPrimaryAction = () => {
    if (workflowRuntimeActive && activeWorkflowRuntimeSession) {
      setMode("build");
      openBottomDock("logs", false);
      void stopWorkflowRuntimeSession(activeWorkflowRuntimeSession);
      return;
    }
    if (workflowComplete) {
      setMode("build");
      openBottomDock("output", false);
      if (activeProject.outputExePath) {
        void launchActiveOutputExecutable();
      }
      return;
    }
    if (nextWorkflowStepState) {
      runEditorWorkflowStep(nextWorkflowStepState.step);
    }
  };

  const openSelectedProperties = () => {
    setRightDockTab("properties");
  };

  const openSelectedConnections = () => {
    if (!selectedItem || !selectedEventName) {
      return;
    }
    setRightDockTab("connections");
  };

  const openSelectedConnectionTarget = () => {
    if (!selectedItem || !selectedEventName) {
      return;
    }
    if (selectedEventCommand) {
      selectRustCommand(selectedEventCommand.id);
      setBuildError("");
      setMode("logic");
      return;
    }
    setRightDockTab("connections");
  };

  const previewSelectedControl = () => {
    if (!selectedItem) {
      return;
    }
    setMode("preview");
    if (selectedEventName) {
      setRightDockTab("connections");
    }
  };

  const runSelectedEventFromActionBar = () => {
    if (!selectedItem || !selectedEventName) {
      return;
    }
    setRightDockTab("connections");
    simulateSelectedEvent();
  };

  return (
    <div className="h-full min-h-0 overflow-hidden bg-surface-container-lowest">
      <Dialog open={Boolean(destructiveAction)} onOpenChange={(open) => !open && setDestructiveAction(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{destructiveAction?.title ?? "Confirm action"}</DialogTitle>
            <DialogDescription>
              {destructiveAction?.description ?? "Review this action before applying it to the current workspace."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDestructiveAction(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDestructiveAction}>
              {destructiveAction?.confirmLabel ?? "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        <div className="grid h-full min-h-0 grid-cols-[56px_minmax(0,1fr)]">
          <nav className="flex flex-col items-center gap-2 border-r border-outline-variant bg-surface-container-low px-2 py-3" aria-label="Editor modes">
            <span className="mb-1 flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-m3-1">
              <MousePointer2 aria-hidden className="size-4" />
            </span>
            {modeBarItems.map((item) => (
              <button
                key={item.mode}
                type="button"
                aria-label={`${item.label} mode`}
                aria-current={mode === item.mode ? "page" : undefined}
                className={cn(
                  "focus-ring group flex size-10 items-center justify-center rounded-2xl transition",
                  mode === item.mode
                    ? "bg-secondary-container text-secondary-container-foreground shadow-m3-1"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                )}
                title={`${item.label} · ${item.detail}`}
                onClick={() => setMode(item.mode)}
              >
                <item.icon aria-hidden className="size-4" />
              </button>
            ))}
          </nav>
          <div className="flex min-h-0 min-w-0 flex-col">
        <div className="flex flex-col gap-4 border-b border-outline-variant p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-secondary-container text-secondary-container-foreground">
                <activeModeItem.icon aria-hidden className="size-4" />
              </span>
              <div>
                <h1 className="text-base font-semibold tracking-normal">Nova UI Editor</h1>
                <p className="text-xs text-on-surface-variant">
                  {activeModeItem.label} / {activeProject.name} / {activeFile.path}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{activeModeItem.label}</Badge>
            <Button variant="ghost" size="sm" data-builder-save="" onClick={() => enqueueProjectTask("save-project")} loading={diskBusy}>
              {saved ? <CheckCircle2 aria-hidden className="size-4" /> : <Save aria-hidden className="size-4" />}
              {saved ? "已保存" : "保存到磁盘"}
            </Button>
            <Button variant="secondary" size="sm" data-builder-build="" onClick={() => enqueueProjectTask("build-exe")} loading={building} disabled={bundling}>
              <Download aria-hidden className="size-4" />
              构建 exe
            </Button>
            <Button variant="ghost" size="sm" data-builder-bundle="" onClick={() => enqueueProjectTask("bundle-installer")} loading={bundling} disabled={building}>
              <Box aria-hidden className="size-4" />
              安装包
            </Button>
            <Button variant="ghost" size="icon-sm" data-builder-load="" aria-label="重载本地工作区" onClick={loadWorkspace}>
              <FolderOpen aria-hidden />
            </Button>
            <Button variant="ghost" size="icon-sm" data-builder-reset="" aria-label="清空当前 UI 文件" onClick={requestResetCurrentFile}>
              <RotateCcw aria-hidden />
            </Button>
          </div>
        </div>

        <div className="relative z-30 border-b border-outline-variant bg-surface-container-low px-4 py-3" data-builder-project-jump="" data-builder-locator="">
          <div className="mx-auto max-w-5xl">
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <Input
                ref={projectJumpInputRef}
                value={projectJumpQuery}
                inputSize="sm"
                aria-label="Project Locator"
                placeholder="Locator: file, control, Rust command, action, artifact, settings..."
                className="h-10 rounded-2xl pl-10 pr-20"
                onFocus={() => setProjectJumpFocused(true)}
                onBlur={() => window.setTimeout(() => setProjectJumpFocused(false), 120)}
                onChange={(event) => setProjectJumpQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setProjectJumpActiveIndex((current) => Math.min(current + 1, Math.max(projectJumpPanelResults.length - 1, 0)));
                    return;
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setProjectJumpActiveIndex((current) => Math.max(current - 1, 0));
                    return;
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setProjectJumpQuery("");
                    setProjectJumpFocused(false);
                    projectJumpInputRef.current?.blur();
                    return;
                  }
                  if (event.key === "Enter" && projectJumpPanelResults[projectJumpActiveIndex]) {
                    event.preventDefault();
                    openProjectJumpResult(projectJumpPanelResults[projectJumpActiveIndex]);
                  }
                }}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-lg border border-outline-variant bg-surface-container-high px-2 py-0.5 font-mono text-[0.66rem] text-on-surface-variant sm:inline-flex">
                Enter
              </span>
            </div>
            {projectJumpPanelOpen ? (
            <div className="absolute left-4 right-4 top-[calc(100%-0.35rem)] z-50 mx-auto max-h-[360px] max-w-5xl overflow-auto rounded-2xl border border-outline-variant bg-surface-container p-1 shadow-m3-2">
              <div className="flex items-center justify-between px-3 py-2 text-[0.68rem] text-on-surface-variant">
                <span>{projectJumpQuery.trim() ? "Search results" : recentProjectJumpResults.length > 0 ? "Recent and recommended" : "Recommended commands"}</span>
                <span className="font-mono">Ctrl+P / Ctrl+K</span>
              </div>
              {projectJumpPanelResults.length > 0 ? (
                projectJumpPanelResults.map((result, index) => (
                  <button
                    key={result.id}
                    type="button"
                    data-builder-project-jump-result={result.kind}
                    aria-selected={index === projectJumpActiveIndex}
                    className={cn(
                      "focus-ring grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-2 text-left text-xs transition hover:bg-surface-container-high",
                      index === projectJumpActiveIndex && "bg-secondary-container text-secondary-container-foreground",
                    )}
                    onMouseEnter={() => setProjectJumpActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => openProjectJumpResult(result)}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary">
                      <ProjectJumpIcon kind={result.kind} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-medium text-on-surface">{result.title}</span>
                        <Badge variant="outline" className="shrink-0">
                          {result.badge}
                        </Badge>
                      </span>
                      <span className="mt-1 block truncate text-on-surface-variant">{result.subtitle}</span>
                    </span>
                    <span className="hidden items-center gap-2 text-[0.68rem] text-on-surface-variant sm:flex">
                      {projectJumpKindLabel(result.kind)}
                      <ArrowRight aria-hidden className="size-3.5 shrink-0" />
                    </span>
                  </button>
                ))
              ) : (
                <div className="flex min-h-10 flex-1 items-center rounded-xl border border-dashed border-outline-variant px-4 text-xs text-on-surface-variant">
                  No project matches
                </div>
              )}
            </div>
            ) : null}
          </div>
        </div>

        <div className="border-b border-outline-variant bg-surface-container-lowest px-4 py-2.5" data-builder-workflow-rail="">
          <div className="mx-auto flex max-w-[82rem] flex-col gap-2">
            <div className="flex min-w-0 flex-col gap-2 xl:flex-row xl:items-center">
              <div className="grid min-w-0 gap-2 rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-xs shadow-m3-1 xl:w-72">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2 text-on-surface-variant">
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        runningProjectTask
                          ? "bg-primary"
                          : failedProjectTaskCount > 0
                            ? "bg-destructive"
                            : queuedProjectTaskCount > 0
                              ? "bg-secondary"
                              : "bg-outline",
                      )}
                    />
                    <span className="truncate">{workflowRailStateLabel}</span>
                  </div>
                  <Badge variant={workflowRailBadgeVariant} className="shrink-0">
                    {workflowRailBadgeLabel}
                  </Badge>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-on-surface">{workflowRailTitle}</p>
                  <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">
                    {workflowRailDetail}
                  </p>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="min-w-0 flex-1"
                    data-builder-run-next-workflow-step=""
                    disabled={workflowPrimaryActionDisabled}
                    onClick={runWorkflowPrimaryAction}
                  >
                    {workflowRuntimeActive ? <Square aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
                    {workflowPrimaryActionLabel}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0"
                    aria-label="Open workflow tasks"
                    onClick={() => openBottomDock("tasks")}
                  >
                    <ClipboardCopy aria-hidden className="size-4" />
                    Tasks
                  </Button>
                </div>
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-1.5 md:grid-cols-5">
                {editorWorkflowStepStates.map(({ step, task, status }, index) => {
                  const StepIcon = step.icon;
                  const suggested = suggestedWorkflowStepId === step.id;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      data-builder-workflow-step={step.id}
                      aria-current={suggested ? "step" : undefined}
                      className={cn(
                        "focus-ring group grid min-h-[4rem] min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs transition",
                        workflowStepStatusClassName(status, suggested),
                      )}
                      onClick={() => runEditorWorkflowStep(step)}
                    >
                      <span className="flex size-8 items-center justify-center rounded-lg bg-surface-container-lowest/80 text-current shadow-m3-1">
                        <StepIcon aria-hidden className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="font-mono text-[0.68rem] text-on-surface-variant">{index + 1}</span>
                          <span className="truncate font-medium text-on-surface">{step.title}</span>
                        </span>
                        <span className="mt-1 block truncate text-[0.68rem] text-on-surface-variant">{task?.summary ?? step.detail}</span>
                      </span>
                      <Badge variant={status === "failed" ? "destructive" : status === "succeeded" ? "secondary" : "outline"} className="shrink-0">
                        {workflowStepStatusLabel(status)}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
            {operationMonitorVisible ? (
              <div
                className={cn(
                  "grid min-w-0 gap-3 rounded-2xl border bg-surface-container px-3 py-3 shadow-m3-1 xl:grid-cols-[minmax(0,1fr)_auto]",
                  operationMonitorStatus === "failed"
                    ? "border-destructive/35"
                    : operationMonitorStatus === "running"
                      ? "border-primary/35"
                      : "border-outline-variant",
                )}
                data-builder-operation-monitor=""
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Badge variant={projectTaskStatusVariant(operationMonitorStatus)}>{operationMonitorStatus}</Badge>
                    <span className="truncate text-xs font-medium text-on-surface">{operationMonitorTitle}</span>
                    {operationMonitorTask?.pipelineStepCount ? (
                      <span className="rounded-full border border-outline-variant px-2 py-0.5 font-mono text-[0.66rem] text-on-surface-variant">
                        step {(operationMonitorTask.pipelineStepIndex ?? 0) + 1}/{operationMonitorTask.pipelineStepCount}
                      </span>
                    ) : null}
                    {operationMonitorTask ? (
                      <span className="rounded-full border border-outline-variant px-2 py-0.5 font-mono text-[0.66rem] text-on-surface-variant">
                        {projectTaskElapsedLabel(operationMonitorTask)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">{operationMonitorDetail}</p>
                  {operationMonitorTask ? <Progress className="mt-2 h-1.5" value={projectTaskProgress(operationMonitorTask.status)} /> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                  <Button
                    size="sm"
                    variant={bottomDockTab === "tasks" ? "secondary" : "ghost"}
                    data-builder-monitor-open-tasks=""
                    onClick={() => {
                      setMode("build");
                      openBottomDock("tasks");
                      if (operationMonitorTask) {
                        setSelectedProjectTaskId(operationMonitorTask.id);
                      }
                    }}
                  >
                    <ClipboardCopy aria-hidden className="size-4" />
                    Tasks
                  </Button>
                  <Button
                    size="sm"
                    variant={bottomDockTab === "issues" ? "secondary" : "ghost"}
                    data-builder-monitor-open-issues=""
                    onClick={() => {
                      setMode("build");
                      openBottomDock("issues");
                    }}
                  >
                    <AlertTriangle aria-hidden className="size-4" />
                    Issues
                  </Button>
                  <Button
                    size="sm"
                    variant={bottomDockTab === "output" ? "secondary" : "ghost"}
                    data-builder-monitor-open-output=""
                    onClick={() => {
                      setMode("build");
                      openBottomDock("output");
                    }}
                  >
                    <Terminal aria-hidden className="size-4" />
                    Output
                  </Button>
                  {operationMonitorTask?.status === "failed" ? (
                    <Button size="sm" data-builder-monitor-retry-task="" onClick={() => retryProjectTask(operationMonitorTask)}>
                      <RotateCcw aria-hidden className="size-4" />
                      Retry
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-surface-container-lowest">
        {mode === "logic" ? (
          <LogicWorkspace>
            <aside className="space-y-4 rounded-[24px] border border-outline-variant bg-surface-container p-4">
              <PanelTitle icon={Braces} title="命令注册表" description="管理会写入 Tauri invoke handler 的项目级 Rust commands。" />
              <div className="space-y-2">
                {activeProject.rustCommands.map((command) => (
                  <button
                    key={command.id}
                    type="button"
                    data-builder-rust-command={command.name}
                    onClick={() => selectRustCommand(command.id)}
                    className={cn(
                      "w-full rounded-2xl border p-3 text-left transition",
                      command.id === activeProject.activeRustCommandId
                        ? "border-primary bg-primary/10 text-on-surface shadow-m3-1"
                        : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-outline hover:bg-surface-container-high",
                    )}
                  >
                    <span className="block truncate font-mono text-xs">{sanitizeRustCommandName(command.name)}</span>
                    <span className="mt-1 block truncate text-[0.68rem]">{command.response || DEFAULT_RUST_COMMAND_RESPONSE}</span>
                  </button>
                ))}
              </div>
              <Button className="w-full" variant="secondary" data-builder-new-command="" onClick={createRustCommandInProject}>
                <Plus aria-hidden className="size-4" />
                新建命令
              </Button>
              <div className="border-t border-outline-variant pt-4">
                <PanelTitle icon={FileJson} title="Rust modules" description="拆分可复用后端逻辑，生成到 src-tauri/src/*.rs。" />
                <div className="space-y-2">
                  {activeProject.rustModules.map((module) => (
                    <button
                      key={module.id}
                      type="button"
                      data-builder-rust-module={module.name}
                      onClick={() => selectRustModule(module.id)}
                      className={cn(
                        "w-full rounded-2xl border p-3 text-left transition",
                        module.id === activeProject.activeRustModuleId
                          ? "border-primary bg-primary/10 text-on-surface shadow-m3-1"
                          : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-outline hover:bg-surface-container-high",
                      )}
                    >
                      <span className="block truncate font-mono text-xs">{sanitizeRustModuleName(module.name)}</span>
                      <span className="mt-1 block truncate text-[0.68rem]">{module.enabled ? "enabled" : "disabled"} · {module.source.split(/\r?\n/).length} lines</span>
                    </button>
                  ))}
                </div>
                <Button className="mt-2 w-full" variant="secondary" data-builder-new-rust-module="" onClick={createRustModuleInProject}>
                  <Plus aria-hidden className="size-4" />
                  新建模块
                </Button>
              </div>
              <div className="border-t border-outline-variant pt-4">
                <PanelTitle icon={Box} title="Cargo dependencies" description="管理会追加到生成 app Cargo.toml 的 crate。" />
                <div className="space-y-2">
                  {activeProject.cargoDependencies.map((dependency) => (
                    <button
                      key={dependency.id}
                      type="button"
                      data-builder-cargo-dependency={dependency.name}
                      onClick={() => selectCargoDependency(dependency.id)}
                      className={cn(
                        "w-full rounded-2xl border p-3 text-left transition",
                        dependency.id === activeProject.activeCargoDependencyId
                          ? "border-primary bg-primary/10 text-on-surface shadow-m3-1"
                          : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-outline hover:bg-surface-container-high",
                      )}
                    >
                      <span className="block truncate font-mono text-xs">{sanitizeCargoDependencyName(dependency.name)}</span>
                      <span className="mt-1 block truncate text-[0.68rem]">
                        {dependency.enabled ? "enabled" : "disabled"} · v{dependency.version}
                        {dependency.features ? ` · ${dependency.features}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
                <Button className="mt-2 w-full" variant="secondary" data-builder-new-cargo-dependency="" onClick={createCargoDependencyInProject}>
                  <Plus aria-hidden className="size-4" />
                  新建依赖
                </Button>
              </div>
              <div className="border-t border-outline-variant pt-4">
                <PanelTitle icon={Terminal} title="Backend integrations" description="登记 Rust 管理的 C++ FFI、sidecar 或本地服务。" />
                <div className="space-y-2">
                  {activeProject.backendIntegrations.map((integration) => (
                    <button
                      key={integration.id}
                      type="button"
                      data-builder-backend-integration={integration.name}
                      onClick={() => selectBackendIntegration(integration.id)}
                      className={cn(
                        "w-full rounded-2xl border p-3 text-left transition",
                        integration.id === activeProject.activeBackendIntegrationId
                          ? "border-primary bg-primary/10 text-on-surface shadow-m3-1"
                          : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-outline hover:bg-surface-container-high",
                      )}
                    >
                      <span className="block truncate font-mono text-xs">{integration.name}</span>
                      <span className="mt-1 block truncate text-[0.68rem]">
                        {integration.enabled ? "enabled" : "disabled"} · {integration.language} · {integration.transport}
                      </span>
                    </button>
                  ))}
                </div>
                <Button className="mt-2 w-full" variant="secondary" data-builder-new-backend-integration="" onClick={createBackendIntegrationInProject}>
                  <Plus aria-hidden className="size-4" />
                  新建集成
                </Button>
              </div>
              <div className="border-t border-outline-variant pt-4">
                <PanelTitle icon={ToggleLeft} title="State store" description="项目级共享状态，可绑定到多个控件。" />
                <div className="space-y-2">
                  {activeProject.stateVariables.map((state) => (
                    <button
                      key={state.id}
                      type="button"
                      data-builder-state-variable={state.name}
                      onClick={() => selectStateVariable(state.id)}
                      className={cn(
                        "w-full rounded-2xl border p-3 text-left transition",
                        state.id === activeProject.activeStateVariableId
                          ? "border-primary bg-primary/10 text-on-surface shadow-m3-1"
                          : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-outline hover:bg-surface-container-high",
                      )}
                    >
                      <span className="block truncate font-mono text-xs">{state.name}</span>
                      <span className="mt-1 block truncate text-[0.68rem]">{state.initialValue || "empty"}</span>
                    </button>
                  ))}
                </div>
                <Button className="mt-2 w-full" variant="secondary" data-builder-new-state="" onClick={createStateVariableInProject}>
                  <Plus aria-hidden className="size-4" />
                  新建状态
                </Button>
              </div>
            </aside>
            <section className="rounded-[24px] border border-outline-variant bg-surface-container-low p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium">Rust 逻辑</h2>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    命令属性会生成默认源码，也可以在这里继续手写 Rust。
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{activeProject.rustCommands.length} commands</Badge>
                  <Badge variant="outline">{activeProject.rustModules.filter((module) => module.enabled).length} modules</Badge>
                  <Badge variant="outline">{activeProject.cargoDependencies.filter((dependency) => dependency.enabled).length} deps</Badge>
                  <Badge variant="outline">{activeProject.backendIntegrations.filter((integration) => integration.enabled).length} integrations</Badge>
                </div>
              </div>
              {rustDiagnosticTarget ? (
                <div
                  className="mb-3 flex items-start gap-2 rounded-[18px] border border-outline-variant bg-surface-container-high p-3 text-xs"
                  data-builder-active-rust-diagnostic=""
                >
                  <AlertTriangle
                    aria-hidden
                    className={cn("mt-0.5 size-4 shrink-0", rustDiagnosticTarget.mappedToSource ? "text-destructive" : "text-on-surface-variant")}
                  />
                  <div className="min-w-0">
                    <p className="font-medium">
                      {rustDiagnosticTarget.sourceKind ? `${rustDiagnosticTarget.sourceKind} · ` : ""}
                      {rustDiagnosticTarget.file ? `${rustDiagnosticTarget.file}:` : ""}
                      {rustDiagnosticTarget.generatedLine}:{rustDiagnosticTarget.column}
                    </p>
                    {rustDiagnosticTarget.sourceFile ? (
                      <p className="mt-1 break-all font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                        maps to {fileNameFromPath(rustDiagnosticTarget.sourceFile)}:{rustDiagnosticTarget.sourceLine}
                        {rustDiagnosticTarget.sourceKind ? ` · ${rustDiagnosticTarget.sourceKind}` : ""}
                      </p>
                    ) : null}
                    <p className="mt-1 leading-5 text-on-surface-variant">{rustDiagnosticTarget.message}</p>
                    {rustDiagnosticTarget.sourceSummary ? (
                      <p className="mt-1 leading-5 text-on-surface-variant">{rustDiagnosticTarget.sourceSummary}</p>
                    ) : null}
                    {!rustDiagnosticTarget.mappedToSource ? (
                      <p className="mt-1 leading-5 text-on-surface-variant">
                        该诊断指向生成的 Tauri wrapper，已打开可编辑 Rust 源码末尾。
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div
                className="grid min-h-[620px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-highest shadow-inner"
                data-builder-rust-editor=""
              >
                <div className="grid min-h-[620px] grid-cols-[4.5rem_minmax(0,1fr)]">
                  <div className="relative overflow-hidden border-r border-outline-variant bg-surface-container-high" aria-hidden="true">
                    <div className="py-3 transition-transform duration-75" style={{ transform: `translateY(-${rustEditorScrollTop}px)` }}>
                      {rustEditorLines.map((_, index) => {
                        const lineNumber = index + 1;
                        const lineDiagnostics = rustDiagnosticsBySourceLine.get(lineNumber) ?? [];
                        const hasError = lineDiagnostics.some((diagnostic) => diagnostic.severity === "error");
                        const hasWarning = lineDiagnostics.some((diagnostic) => diagnostic.severity === "warning");
                        const isActiveDiagnosticLine = rustDiagnosticTarget?.sourceLine === lineNumber;
                        return (
                          <div
                            key={lineNumber}
                            className={cn(
                              "flex h-5 items-center justify-between gap-2 px-3 font-mono text-[0.68rem] leading-5 text-on-surface-variant",
                              isActiveDiagnosticLine && "bg-primary/10 text-on-surface",
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                hasError ? "bg-destructive" : hasWarning ? "bg-primary" : "bg-transparent",
                              )}
                            />
                            <span className="tabular-nums">{lineNumber}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="relative min-w-0">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="py-3 transition-transform duration-75" style={{ transform: `translateY(-${rustEditorScrollTop}px)` }}>
                        {rustEditorLines.map((_, index) => {
                          const lineNumber = index + 1;
                          const lineDiagnostics = rustDiagnosticsBySourceLine.get(lineNumber) ?? [];
                          const isActiveDiagnosticLine = rustDiagnosticTarget?.sourceLine === lineNumber;
                          const hasDiagnostic = lineDiagnostics.length > 0;
                          return (
                            <div
                              key={lineNumber}
                              className={cn(
                                "h-5 border-l-2 border-transparent",
                                isActiveDiagnosticLine
                                  ? "border-primary bg-primary/10"
                                  : hasDiagnostic
                                    ? "border-destructive/60 bg-destructive/5"
                                    : "",
                              )}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <Textarea
                      ref={rustLogicRef}
                      data-builder-rust-logic=""
                      aria-label="Rust 逻辑编辑器"
                      value={activeProject.rustLogic}
                      onChange={(event) => updateRustLogic(event.target.value)}
                      onScroll={(event) => setRustEditorScrollTop(event.currentTarget.scrollTop)}
                      className="relative z-10 h-[620px] min-h-[620px] resize-none overflow-auto rounded-none border-0 bg-transparent px-4 py-3 font-mono text-xs leading-5 shadow-none hover:bg-transparent focus-visible:border-transparent"
                      spellCheck={false}
                      wrap="off"
                    />
                  </div>
                </div>
              </div>
            </section>
            <aside className="space-y-4 rounded-[24px] border border-outline-variant bg-surface-container p-4">
              <PanelTitle icon={Settings2} title="命令属性" description="当前命令会参与生成 app 的 Rust 注册和前端 invoke。" />
              {activeRustCommandReverseDependency ? (
                <section
                  className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3 text-xs"
                  data-builder-rust-command-impact=""
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-medium text-on-surface">Dependency impact</p>
                        <Badge variant={reverseDependencyStatusVariant(activeRustCommandReverseDependency.status)}>
                          {reverseDependencyStatusLabel(activeRustCommandReverseDependency.status)}
                        </Badge>
                      </div>
                      <p className="mt-1 leading-5 text-on-surface-variant">{activeRustCommandReverseDependency.summary}</p>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="查看 Rust 命令生成目标"
                      onClick={() => selectProjectReverseDependencyOutputs(activeRustCommandReverseDependency)}
                    >
                      <FileJson aria-hidden className="size-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRustCommandReverseDependency.scopeIds.slice(0, 4).map((scopeId) => (
                      <span key={scopeId} className="rounded-full bg-surface-container-low px-2 py-1 text-[0.68rem] text-on-surface-variant">
                        {scopeId}
                      </span>
                    ))}
                  </div>
                  {activeRustCommandReverseDependency.plannedActions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {activeRustCommandReverseDependency.plannedActions.slice(0, 2).map((actionId) => (
                        <Button
                          key={actionId}
                          size="sm"
                          variant="ghost"
                          disabled={
                            (actionId === "apply-generated-changes" && (!generatedFilePreview || projectChangeImpact.previewIsStale)) ||
                            previewingGeneratedFiles ||
                            applyingGeneratedFiles
                          }
                          onClick={() => enqueueProjectTask(actionId)}
                        >
                          {projectTaskDefinitions[actionId].title}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}
              <Field label="函数名">
                <Input
                  data-builder-command-name=""
                  value={activeRustCommand.name}
                  onChange={(event) => updateRustCommand(activeRustCommand.id, { name: event.target.value })}
                  spellCheck={false}
                  className="font-mono text-xs"
                />
              </Field>
              <Field label="返回文本">
                <Textarea
                  data-builder-command-response=""
                  value={activeRustCommand.response}
                  onChange={(event) => updateRustCommand(activeRustCommand.id, { response: event.target.value })}
                  className="min-h-[120px] resize-none text-xs leading-5"
                />
              </Field>
              {activeRustCommandBackendIntegration ? (
                <div className="rounded-[18px] border border-outline-variant bg-surface-container-low p-3 text-xs leading-5 text-on-surface-variant">
                  该命令绑定到 <span className="font-medium text-on-surface">{activeRustCommandBackendIntegration.name}</span>，生成源码会调用
                  <span className="font-mono"> backend_integrations::call_integration</span> 协议适配器。
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4 rounded-[18px] bg-surface-container-low p-3">
                <div className="min-w-0">
                  <Label className="text-xs font-medium">Accept command args</Label>
                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">生成命名参数，并从控件事件上下文映射到 Rust。</p>
                </div>
                <Switch
                  checked={rustCommandAcceptsArgs(activeRustCommand)}
                  onCheckedChange={(acceptsValue) => setRustCommandAcceptsArgs(activeRustCommand.id, acceptsValue)}
                />
              </div>
              {rustCommandAcceptsArgs(activeRustCommand) ? (
                <section className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-low p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Command args</h3>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">这些名称会成为 Rust 函数参数和 Tauri invoke args。</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={addRustCommandParameter}>
                      <Plus aria-hidden className="size-3.5" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {rustCommandParameters(activeRustCommand).map((parameter) => (
                      <div key={parameter.id} className="space-y-2 rounded-xl border border-outline-variant bg-surface-container p-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={parameter.name}
                            onChange={(event) => updateRustCommandParameter(parameter.id, { name: event.target.value })}
                            className="h-8 font-mono text-xs"
                            spellCheck={false}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="删除命令参数"
                            onClick={() => deleteRustCommandParameter(parameter.id)}
                          >
                            <Trash2 aria-hidden className="size-3.5" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={parameter.source}
                            onValueChange={(source) =>
                              updateRustCommandParameter(parameter.id, {
                                source: source as RustCommandParameterSource,
                                type:
                                  source === "checked"
                                    ? "bool"
                                    : source === "state" || source === "payload"
                                      ? "json"
                                      : parameter.type,
                              })
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {rustParameterSources.map((source) => (
                                <SelectItem key={source.value} value={source.value}>
                                  {source.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={parameter.type}
                            onValueChange={(type) => updateRustCommandParameter(parameter.id, { type: type as RustCommandParameterType })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {rustParameterTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
              <section className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-low p-3">
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Result schema</h3>
                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">定义 Rust 返回值如何变成消息、错误和 state patch。</p>
                </div>
                <Field label="Result format">
                  <Select value={commandResultSchema(activeRustCommand).mode} onValueChange={(mode) => setRustCommandResultMode(mode as RustCommandResultSchema["mode"])}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text result</SelectItem>
                      <SelectItem value="json">JSON envelope</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                {commandResultSchema(activeRustCommand).mode === "json" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Message path">
                      <Input
                        value={commandResultSchema(activeRustCommand).messagePath ?? "message"}
                        onChange={(event) => updateRustCommandResult({ mode: "json", messagePath: event.target.value })}
                        className="h-8 font-mono text-xs"
                        spellCheck={false}
                      />
                    </Field>
                    <Field label="Patch path">
                      <Input
                        value={commandResultSchema(activeRustCommand).statePatchPath ?? "patch"}
                        onChange={(event) => updateRustCommandResult({ mode: "json", statePatchPath: event.target.value })}
                        className="h-8 font-mono text-xs"
                        spellCheck={false}
                      />
                    </Field>
                    <Field label="Success path">
                      <Input
                        value={commandResultSchema(activeRustCommand).successPath ?? "success"}
                        onChange={(event) => updateRustCommandResult({ mode: "json", successPath: event.target.value })}
                        className="h-8 font-mono text-xs"
                        spellCheck={false}
                      />
                    </Field>
                    <Field label="Error path">
                      <Input
                        value={commandResultSchema(activeRustCommand).errorPath ?? "error"}
                        onChange={(event) => updateRustCommandResult({ mode: "json", errorPath: event.target.value })}
                        className="h-8 font-mono text-xs"
                        spellCheck={false}
                      />
                    </Field>
                  </div>
                ) : (
                  <p className="text-xs leading-5 text-on-surface-variant">Text result 会直接作为反馈、目标属性或 result state 的值。</p>
                )}
              </section>
              <div className="rounded-[18px] bg-surface-container-low p-3 text-xs leading-5 text-on-surface-variant">
                生成时会注册为 <span className="font-mono text-on-surface">{sanitizeRustCommandName(activeRustCommand.name)}</span>。如果你手写源码，请确保这里的命令名有同名
                <span className="font-mono"> #[tauri::command]</span> 函数。
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" data-builder-sync-rust="" onClick={() => enqueueProjectTask("sync-rust")}>
                  <RotateCcw aria-hidden className="size-4" />
                  生成源码
                </Button>
                <Button variant="ghost" data-builder-delete-command="" onClick={deleteActiveRustCommand}>
                  <Trash2 aria-hidden className="size-4" />
                  删除命令
                </Button>
              </div>
              <Button className="w-full" data-builder-save-rust="" onClick={() => enqueueProjectTask("save-project")} loading={diskBusy}>
                <Save aria-hidden className="size-4" />
                保存 Rust 逻辑
              </Button>
              <section className="space-y-3 rounded-[20px] border border-outline-variant bg-surface-container-low p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Rust module</h3>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">模块会生成到 app/src-tauri/src，并通过 lib.rs 的 mod 声明载入。</p>
                  </div>
                  <Switch
                    checked={activeRustModule.enabled}
                    aria-label="启用 Rust module"
                    onCheckedChange={(enabled) => updateRustModule(activeRustModule.id, { enabled })}
                  />
                </div>
                <Field label="模块名">
                  <Input
                    data-builder-rust-module-name=""
                    value={activeRustModule.name}
                    onChange={(event) => updateRustModule(activeRustModule.id, { name: event.target.value })}
                    spellCheck={false}
                    className="font-mono text-xs"
                  />
                </Field>
                <Field label="模块源码">
                  <Textarea
                    data-builder-rust-module-source=""
                    value={activeRustModule.source}
                    onChange={(event) => updateRustModule(activeRustModule.id, { source: event.target.value })}
                    className="min-h-[160px] resize-y font-mono text-xs leading-5"
                    spellCheck={false}
                    wrap="off"
                  />
                </Field>
                <Button variant="ghost" className="w-full" data-builder-delete-rust-module="" onClick={deleteActiveRustModule}>
                  <Trash2 aria-hidden className="size-4" />
                  删除模块
                </Button>
              </section>
              <section className="space-y-3 rounded-[20px] border border-outline-variant bg-surface-container-low p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Cargo dependency</h3>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">启用后会写入生成 app 的 src-tauri/Cargo.toml。</p>
                  </div>
                  <Switch
                    checked={activeCargoDependency.enabled}
                    aria-label="启用 Cargo dependency"
                    onCheckedChange={(enabled) => updateCargoDependency(activeCargoDependency.id, { enabled })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Crate">
                    <Input
                      data-builder-cargo-dependency-name=""
                      value={activeCargoDependency.name}
                      onChange={(event) => updateCargoDependency(activeCargoDependency.id, { name: event.target.value })}
                      spellCheck={false}
                      className="font-mono text-xs"
                    />
                  </Field>
                  <Field label="Version">
                    <Input
                      data-builder-cargo-dependency-version=""
                      value={activeCargoDependency.version}
                      onChange={(event) => updateCargoDependency(activeCargoDependency.id, { version: event.target.value })}
                      spellCheck={false}
                      className="font-mono text-xs"
                    />
                  </Field>
                </div>
                <Field label="Features">
                  <Input
                    data-builder-cargo-dependency-features=""
                    value={activeCargoDependency.features}
                    onChange={(event) => updateCargoDependency(activeCargoDependency.id, { features: event.target.value })}
                    spellCheck={false}
                    className="font-mono text-xs"
                    placeholder="derive, rc"
                  />
                </Field>
                <Button variant="ghost" className="w-full" data-builder-delete-cargo-dependency="" onClick={deleteActiveCargoDependency}>
                  <Trash2 aria-hidden className="size-4" />
                  删除依赖
                </Button>
              </section>
              <section className="space-y-3 rounded-[20px] border border-outline-variant bg-surface-container-low p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Backend integration</h3>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">Rust 仍是主后端；这里登记 C++ FFI、sidecar 或本地服务边界。</p>
                  </div>
                  <Switch
                    checked={activeBackendIntegration.enabled}
                    aria-label="启用 Backend integration"
                    onCheckedChange={(enabled) => updateBackendIntegration(activeBackendIntegration.id, { enabled })}
                  />
                </div>
                <Field label="名称">
                  <Input
                    data-builder-backend-integration-name=""
                    value={activeBackendIntegration.name}
                    onChange={(event) => updateBackendIntegration(activeBackendIntegration.id, { name: event.target.value })}
                    className="font-mono text-xs"
                    spellCheck={false}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Kind">
                    <Select
                      value={activeBackendIntegration.kind}
                      onValueChange={(kind) => {
                        const nextKind = kind as BackendIntegrationKind;
                        const nextLanguage =
                          nextKind === "cpp-ffi"
                            ? "cpp"
                            : nextKind === "rust-native"
                              ? "rust"
                              : activeBackendIntegration.language === "rust" || activeBackendIntegration.language === "cpp"
                                ? "go"
                                : activeBackendIntegration.language;
                        const nextTransport =
                          nextKind === "cpp-ffi" ? "ffi" : nextKind === "rust-native" ? "tauri-invoke" : activeBackendIntegration.transport;
                        applyBackendIntegrationPreset(activeBackendIntegration, {
                          kind: nextKind,
                          language: nextLanguage,
                          transport: nextTransport,
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {backendIntegrationKinds.map((kind) => (
                          <SelectItem key={kind.value} value={kind.value}>
                            {kind.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Language">
                    <Select
                      value={activeBackendIntegration.language}
                      onValueChange={(language) => {
                        const nextLanguage = language as BackendIntegrationLanguage;
                        const nextKind =
                          nextLanguage === "rust"
                            ? "rust-native"
                            : nextLanguage === "cpp"
                              ? "cpp-ffi"
                              : activeBackendIntegration.kind === "rust-native" || activeBackendIntegration.kind === "cpp-ffi"
                                ? "sidecar"
                                : activeBackendIntegration.kind;
                        const nextTransport =
                          nextKind === "rust-native" ? "tauri-invoke" : nextKind === "cpp-ffi" ? "ffi" : activeBackendIntegration.transport;
                        applyBackendIntegrationPreset(activeBackendIntegration, {
                          kind: nextKind,
                          language: nextLanguage,
                          transport: nextTransport,
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {backendIntegrationLanguages.map((language) => (
                          <SelectItem key={language.value} value={language.value}>
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Transport">
                  <Select
                    value={activeBackendIntegration.transport}
                    onValueChange={(transport) => updateBackendIntegration(activeBackendIntegration.id, { transport: transport as BackendIntegrationTransport })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {backendIntegrationTransports.map((transport) => (
                        <SelectItem key={transport.value} value={transport.value}>
                          {transport.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="入口路径">
                  <Input
                    data-builder-backend-integration-entry=""
                    value={activeBackendIntegration.entryPath}
                    onChange={(event) => updateBackendIntegration(activeBackendIntegration.id, { entryPath: event.target.value })}
                    className="font-mono text-xs"
                    spellCheck={false}
                    placeholder="backend/native/libengine.a"
                  />
                </Field>
                <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-high p-3">
                  <div className="min-w-0">
                    <Label className="text-xs font-medium">Bundle artifact</Label>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">将 sidecar、动态库或脚本产物复制进生成 app 的 Tauri resources。</p>
                  </div>
                  <Switch
                    checked={activeBackendIntegration.bundleResource}
                    aria-label="打包 Backend integration artifact"
                    onCheckedChange={(bundleResource) => updateBackendIntegration(activeBackendIntegration.id, { bundleResource })}
                  />
                </div>
                <Field label="产物路径">
                  <Input
                    data-builder-backend-integration-artifact=""
                    value={activeBackendIntegration.artifactPath}
                    onChange={(event) => updateBackendIntegration(activeBackendIntegration.id, { artifactPath: event.target.value })}
                    className="font-mono text-xs"
                    spellCheck={false}
                    placeholder="backend/service/backend-service.exe"
                  />
                </Field>
                <Field label="资源目标">
                  <Input
                    data-builder-backend-integration-resource=""
                    value={activeBackendIntegration.resourcePath}
                    onChange={(event) => updateBackendIntegration(activeBackendIntegration.id, { resourcePath: event.target.value })}
                    className="font-mono text-xs"
                    spellCheck={false}
                    placeholder="resources/backend/service/backend-service.exe"
                  />
                </Field>
                <div className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-on-surface">Artifact status</p>
                      <p className="mt-1 leading-5 text-on-surface-variant">检查当前后端产物是否能被 Tauri resources 打包。</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        data-builder-build-backend-artifact=""
                        loading={buildingBackendArtifactId === activeBackendIntegration.id}
                        disabled={!isTauriRuntime() || !backendArtifactStarterBuildAvailable(activeBackendIntegration)}
                        onClick={() => void buildActiveBackendArtifact()}
                      >
                        <Terminal aria-hidden className="size-3.5" />
                        Build
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-builder-check-backend-artifact=""
                        loading={checkingBackendArtifacts}
                        disabled={!isTauriRuntime()}
                        onClick={() => void refreshBackendArtifactInspection()}
                      >
                        <Search aria-hidden className="size-3.5" />
                        Check
                      </Button>
                    </div>
                  </div>
                  {activeBackendArtifactInspection ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={backendArtifactStatusVariant(activeBackendArtifactInspection)}>
                          {activeBackendArtifactInspection.status}
                        </Badge>
                        <span className="text-on-surface-variant">
                          {activeBackendArtifactInspection.exists
                            ? `${activeBackendArtifactInspection.is_dir ? "directory" : "file"} · ${byteSizeLabel(activeBackendArtifactInspection.size_bytes)}`
                            : "not found"}
                        </span>
                        {activeBackendArtifactInspection.modified_at ? (
                          <span className="text-on-surface-variant">{validationTimeLabel(activeBackendArtifactInspection.modified_at)}</span>
                        ) : null}
                      </div>
                      <p className="leading-5 text-on-surface-variant">{activeBackendArtifactInspection.summary}</p>
                      {activeBackendArtifactInspection.resolved_path ? (
                        <p className="break-all rounded-lg bg-surface-container-low px-2 py-1 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                          {activeBackendArtifactInspection.resolved_path}
                        </p>
                      ) : null}
                      {activeBackendArtifactBuildResult ? (
                        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-2">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <Badge variant={activeBackendArtifactBuildResult.success ? "secondary" : "destructive"}>
                              {activeBackendArtifactBuildResult.status}
                            </Badge>
                            <span className="text-on-surface-variant">{validationTimeLabel(activeBackendArtifactBuildResult.checked_at)}</span>
                          </div>
                          <p className="leading-5 text-on-surface-variant">{activeBackendArtifactBuildResult.summary}</p>
                          <p className="mt-1 break-all font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                            {activeBackendArtifactBuildResult.command}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="leading-5 text-on-surface-variant">
                      {isTauriRuntime() ? "保存或刷新后会显示当前集成的 artifact 检查结果。" : "桌面运行时会显示真实磁盘 artifact 检查结果。"}
                    </p>
                  )}
                </div>
                <Field label="启动命令 / 调用点">
                  <Input
                    data-builder-backend-integration-command=""
                    value={activeBackendIntegration.command}
                    onChange={(event) => updateBackendIntegration(activeBackendIntegration.id, { command: event.target.value })}
                    className="font-mono text-xs"
                    spellCheck={false}
                    placeholder="engine --stdio"
                  />
                </Field>
                <div className="rounded-2xl border border-outline-variant bg-surface-container p-3">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Methods</h4>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">声明可从 UI 事件调用的后端接口。</p>
                    </div>
                    <Button size="sm" variant="secondary" data-builder-new-backend-method="" onClick={createBackendIntegrationMethodInProject}>
                      <Plus aria-hidden className="size-3.5" />
                      Method
                    </Button>
                  </div>
                  <div className="mb-3 grid gap-2">
                    {activeBackendIntegration.methods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        data-builder-backend-method-item=""
                        onClick={() => selectBackendIntegrationMethod(method.id)}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-left text-xs transition",
                          method.id === activeBackendIntegrationMethod.id
                            ? "border-primary bg-primary-container text-on-primary-container"
                            : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-outline",
                        )}
                      >
                        <span className="block truncate font-mono text-on-surface">{method.name}</span>
                        <span className="mt-1 block truncate font-mono">{method.operation || method.path || "operation not set"}</span>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3 rounded-xl bg-surface-container-low p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">{activeBackendIntegration.transport}</Badge>
                      <Button size="sm" variant="ghost" data-builder-delete-backend-method="" onClick={deleteActiveBackendIntegrationMethod}>
                        <Trash2 aria-hidden className="size-3.5" />
                        Delete
                      </Button>
                    </div>
                    <Field label="Method name">
                      <Input
                        data-builder-backend-method-name=""
                        value={activeBackendIntegrationMethod.name}
                        onChange={(event) => updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { name: event.target.value })}
                        className="font-mono text-xs"
                        spellCheck={false}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Operation">
                        <Input
                          data-builder-backend-method-operation=""
                          value={activeBackendIntegrationMethod.operation}
                          onChange={(event) => updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { operation: event.target.value })}
                          className="font-mono text-xs"
                          spellCheck={false}
                          placeholder="classify_image"
                        />
                      </Field>
                      <Field label="HTTP path">
                        <Input
                          data-builder-backend-method-path=""
                          value={activeBackendIntegrationMethod.path}
                          onChange={(event) => updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { path: event.target.value })}
                          className="font-mono text-xs"
                          spellCheck={false}
                          placeholder="/classify"
                        />
                      </Field>
                    </div>
                    <Field label="Description">
                      <Textarea
                        data-builder-backend-method-description=""
                        value={activeBackendIntegrationMethod.description}
                        onChange={(event) => updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { description: event.target.value })}
                        className="min-h-[68px] resize-y text-xs leading-5"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Request schema">
                        <Textarea
                          data-builder-backend-method-request-schema=""
                          value={activeBackendIntegrationMethod.requestSchema}
                          onChange={(event) => updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { requestSchema: event.target.value })}
                          className="min-h-[116px] resize-y font-mono text-xs leading-5"
                          spellCheck={false}
                        />
                      </Field>
                      <Field label="Response schema">
                        <Textarea
                          data-builder-backend-method-response-schema=""
                          value={activeBackendIntegrationMethod.responseSchema}
                          onChange={(event) => updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { responseSchema: event.target.value })}
                          className="min-h-[116px] resize-y font-mono text-xs leading-5"
                          spellCheck={false}
                        />
                      </Field>
                    </div>
                    <div className="grid gap-2 rounded-xl border border-outline-variant bg-surface p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-on-surface">Schema parameters</p>
                          <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                            从 request schema 派生 sample payload 字段。
                          </p>
                        </div>
                        <Button size="sm" variant="secondary" data-builder-sync-backend-method-sample="" onClick={syncActiveBackendMethodSampleFromSchema}>
                          <Wand2 aria-hidden className="size-3.5" />
                          Sync sample
                        </Button>
                      </div>
                      {activeBackendMethodFields.length ? (
                        <div className="grid gap-2">
                          {activeBackendMethodFields.map((field) => {
                            const fieldIssues = backendSchemaFieldIssues(field, activeBackendRequestValidationIssues);
                            const fieldPath = field.path.join(".");
                            return (
                              <div
                                key={fieldPath}
                                className={cn(
                                  "grid gap-1 rounded-lg border bg-surface-container-low p-2",
                                  fieldIssues.length ? "border-destructive/35" : "border-transparent",
                                )}
                                style={{ marginLeft: field.depth ? field.depth * 12 : undefined }}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate font-mono text-xs text-on-surface">{field.name}</p>
                                    {field.description ? (
                                      <p className="mt-1 line-clamp-2 text-[0.68rem] leading-4 text-on-surface-variant">{field.description}</p>
                                    ) : null}
                                  </div>
                                  <div className="flex shrink-0 items-center gap-1">
                                    <Badge variant={field.required ? "secondary" : "outline"}>{field.required ? "required" : "optional"}</Badge>
                                    <Badge variant={field.enumValues?.length ? "secondary" : "outline"}>{field.enumValues?.length ? "enum" : field.type}</Badge>
                                  </div>
                                </div>
                                {field.enumValues?.length ? (
                                  <Select value={field.inputValue || field.enumValues[0]} onValueChange={(value) => updateActiveBackendMethodSampleField(field, value)}>
                                    <SelectTrigger className="h-8 text-xs" data-builder-backend-schema-field={fieldPath}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.enumValues.map((value) => (
                                        <SelectItem key={value} value={value}>
                                          {value}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : field.type === "boolean" ? (
                                  <Select value={field.inputValue || "false"} onValueChange={(value) => updateActiveBackendMethodSampleField(field, value)}>
                                    <SelectTrigger className="h-8 text-xs" data-builder-backend-schema-field={fieldPath}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="true">true</SelectItem>
                                      <SelectItem value="false">false</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : field.type === "object" || field.type === "array" || field.type === "json" ? (
                                  <Textarea
                                    data-builder-backend-schema-field={fieldPath}
                                    value={field.inputValue}
                                    onChange={(event) => updateActiveBackendMethodSampleField(field, event.target.value)}
                                    className="min-h-[72px] resize-y font-mono text-xs leading-5"
                                    spellCheck={false}
                                  />
                                ) : (
                                  <Input
                                    data-builder-backend-schema-field={fieldPath}
                                    value={field.inputValue}
                                    type={field.type === "number" ? "number" : "text"}
                                    onChange={(event) => updateActiveBackendMethodSampleField(field, event.target.value)}
                                    className="font-mono text-xs"
                                    spellCheck={false}
                                  />
                                )}
                                {fieldIssues.length ? (
                                  <p className="text-[0.68rem] leading-4 text-destructive">{fieldIssues[0]}</p>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs leading-5 text-on-surface-variant">
                          schema 还不能派生字段；可以使用 JSON Schema 的 properties/required，或在 sample payload 里直接写对象字段。
                        </p>
                      )}
                      {selectedItem ? (
                        <div className="rounded-lg bg-surface-container-low p-2 text-xs">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-on-surface-variant">Selected control payload:</span>
                            {activeBackendPayloadMapping.map((field) => (
                              <Badge key={field} variant="outline">
                                {field}
                              </Badge>
                            ))}
                            <Badge variant={activeBackendResponsePatchEnabled ? "secondary" : "outline"}>
                              {activeBackendResponsePatchEnabled ? "patch enabled" : "message target"}
                            </Badge>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <Field label="Sample payload">
                      <Textarea
                        data-builder-backend-method-sample-payload=""
                        value={activeBackendIntegrationMethod.samplePayload}
                        onChange={(event) => updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { samplePayload: event.target.value })}
                        className="min-h-[116px] resize-y font-mono text-xs leading-5"
                        spellCheck={false}
                      />
                    </Field>
                    <div className="grid gap-2 rounded-xl border border-outline-variant bg-surface p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-on-surface">Method test bench</p>
                          <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                            先校验 JSON contract，再用当前 integration 配置调用这个 method。
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button size="sm" variant="secondary" data-builder-validate-backend-method="" onClick={validateActiveBackendMethodContract}>
                            <CheckCircle2 aria-hidden className="size-3.5" />
                            Contract
                          </Button>
                          <Button
                            size="sm"
                            data-builder-test-backend-method=""
                            loading={testingBackendMethodId === activeBackendIntegrationMethod.id}
                            onClick={() => void testActiveBackendIntegrationMethod()}
                          >
                            <Play aria-hidden className="size-3.5" />
                            Run Method
                          </Button>
                        </div>
                      </div>
                      {activeBackendIntegrationMethod.lastTest ? (
                        <div className="grid gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={
                                activeBackendIntegrationMethod.lastTest.status === "passed"
                                  ? "secondary"
                                  : activeBackendIntegrationMethod.lastTest.status === "skipped"
                                    ? "outline"
                                    : "destructive"
                              }
                            >
                              {activeBackendIntegrationMethod.lastTest.status}
                            </Badge>
                            <span className="truncate text-on-surface-variant">
                              {activeBackendIntegrationMethod.lastTest.durationMs !== undefined
                                ? `${activeBackendIntegrationMethod.lastTest.durationMs} ms`
                                : "local check"}
                            </span>
                            <span className="truncate text-on-surface-variant">{activeBackendIntegrationMethod.lastTest.transport}</span>
                            <span className="truncate text-on-surface-variant">
                              {validationTimeLabel(activeBackendIntegrationMethod.lastTest.testedAt)}
                            </span>
                          </div>
                          <p className="leading-5 text-on-surface-variant">{activeBackendIntegrationMethod.lastTest.summary}</p>
                          {(activeBackendIntegrationMethod.lastTest.validationIssues?.length || activeBackendResponseValidationIssues.length) ? (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-[0.68rem] leading-4 text-destructive">
                              {(activeBackendIntegrationMethod.lastTest.validationIssues?.length
                                ? activeBackendIntegrationMethod.lastTest.validationIssues
                                : activeBackendResponseValidationIssues
                              ).slice(0, 4).map((issue) => (
                                <p key={issue}>{issue}</p>
                              ))}
                            </div>
                          ) : null}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="min-w-0 rounded-lg bg-surface-container-low p-2">
                              <p className="mb-1 text-[0.68rem] uppercase tracking-[0.08em] text-on-surface-variant">Request</p>
                              <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words font-mono text-[0.68rem] leading-4 text-on-surface">
                                {activeBackendIntegrationMethod.lastTest.request || "{}"}
                              </pre>
                            </div>
                            <div className="min-w-0 rounded-lg bg-surface-container-low p-2">
                              <p className="mb-1 text-[0.68rem] uppercase tracking-[0.08em] text-on-surface-variant">Response</p>
                              <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words font-mono text-[0.68rem] leading-4 text-on-surface">
                                {activeBackendIntegrationMethod.lastTest.response || activeBackendIntegrationMethod.lastTest.error || "{}"}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs leading-5 text-on-surface-variant">还没有测试记录。Contract 会做本地 JSON 检查，Run Method 会调用真实后端边界。</p>
                      )}
                    </div>
                  </div>
                </div>
                <Field label="健康检查命令">
                  <Input
                    data-builder-backend-integration-health-command=""
                    value={activeBackendIntegration.healthCheckCommand}
                    onChange={(event) => updateBackendIntegration(activeBackendIntegration.id, { healthCheckCommand: event.target.value })}
                    className="font-mono text-xs"
                    spellCheck={false}
                    placeholder="{resource} --health"
                  />
                </Field>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <Field label="超时 ms">
                    <Input
                      data-builder-backend-integration-timeout=""
                      type="number"
                      value={activeBackendIntegration.startupTimeoutMs}
                      onChange={(event) =>
                        updateBackendIntegration(activeBackendIntegration.id, {
                          startupTimeoutMs: numberFromInput(event.target.value, activeBackendIntegration.startupTimeoutMs, 250, 60000),
                        })
                      }
                      className="font-mono text-xs"
                    />
                  </Field>
                  <div className="flex items-end">
                    <label className="flex h-[var(--control-sm)] items-center gap-2 rounded-xl bg-surface-container-high px-3 text-xs text-on-surface-variant">
                      Capture
                      <Switch
                        className="h-5 w-9 border"
                        checked={activeBackendIntegration.captureOutput}
                        onCheckedChange={(captureOutput) => updateBackendIntegration(activeBackendIntegration.id, { captureOutput })}
                      />
                    </label>
                  </div>
                </div>
                <Field label="备注">
                  <Textarea
                    data-builder-backend-integration-notes=""
                    value={activeBackendIntegration.notes}
                    onChange={(event) => updateBackendIntegration(activeBackendIntegration.id, { notes: event.target.value })}
                    className="min-h-[96px] resize-y text-xs leading-5"
                  />
                </Field>
                <div className="rounded-2xl bg-surface-container px-3 py-2 text-xs leading-5 text-on-surface-variant">
                  {backendIntegrationKinds.find((kind) => kind.value === activeBackendIntegration.kind)?.description}
                  {backendIntegrationStarterHint(activeBackendIntegration) ? (
                    <span className="mt-2 block">{backendIntegrationStarterHint(activeBackendIntegration)}</span>
                  ) : null}
                </div>
                <Button
                  variant="ghost"
                  className="w-full"
                  data-builder-apply-backend-preset=""
                  onClick={applyActiveBackendIntegrationPreset}
                >
                  <Wand2 aria-hidden className="size-4" />
                  应用推荐后端配置
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  data-builder-create-backend-command=""
                  onClick={createRustCommandFromBackendIntegration}
                >
                  <Braces aria-hidden className="size-4" />
                  生成绑定命令
                </Button>
                <Button
                  className="w-full"
                  data-builder-bind-backend-command=""
                  onClick={() => createAndBindBackendIntegrationCommand()}
                  disabled={!selectedItem || !selectedEventName}
                >
                  <MousePointer2 aria-hidden className="size-4" />
                  生成并绑定选中控件
                </Button>
                <p className="text-xs leading-5 text-on-surface-variant">
                  {selectedItem && selectedEventName
                    ? `会绑定 ${getItemSummary(selectedItem)} 的 ${selectedEventName} 事件，并打开 Connections 继续检查或模拟。`
                    : "选择 Button、Input、Switch、Select 等控件后，可以一键生成 command 并绑定事件。"}
                </p>
                <Button variant="ghost" className="w-full" data-builder-delete-backend-integration="" onClick={deleteActiveBackendIntegration}>
                  <Trash2 aria-hidden className="size-4" />
                  删除集成
                </Button>
              </section>
              <section className="space-y-3 rounded-[20px] border border-outline-variant bg-surface-container-low p-3">
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">State variable</h3>
                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">共享状态可驱动多个控件的显示属性。</p>
                </div>
                <Field label="状态名">
                  <Input
                    data-builder-state-name=""
                    value={activeStateVariable.name}
                    onChange={(event) => updateStateVariable(activeStateVariable.id, { name: event.target.value })}
                    spellCheck={false}
                    className="font-mono text-xs"
                  />
                </Field>
                <Field label="初始值">
                  <Input
                    data-builder-state-initial-value=""
                    value={activeStateVariable.initialValue}
                    onChange={(event) => updateStateVariable(activeStateVariable.id, { initialValue: event.target.value })}
                  />
                </Field>
                <Button variant="ghost" className="w-full" data-builder-delete-state="" onClick={deleteActiveStateVariable}>
                  <Trash2 aria-hidden className="size-4" />
                  删除状态
                </Button>
              </section>
            </aside>
          </LogicWorkspace>
        ) : mode === "build" ? (
          <BuildWorkspace
            toolbar={
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Download aria-hidden className="size-4 text-primary" />
                    <h2 className="text-sm font-semibold">Build / Run</h2>
                    <Badge variant={latestReleasePipeline ? projectTaskStatusVariant(latestReleasePipeline.status as ProjectTaskStatus) : "outline"}>
                      {latestReleasePipeline ? latestReleasePipeline.status : "idle"}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-on-surface-variant">
                    Pipeline, Problems, Output and Artifacts for {activeProject.releaseConfig.appName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    data-builder-run-generated-app=""
                    loading={launchingExeId === "active-output"}
                    disabled={!activeProject.outputExePath || Boolean(launchingExeId)}
                    onClick={() => void launchActiveOutputExecutable()}
                  >
                    <Play aria-hidden className="size-4" />
                    Run
                  </Button>
                  <Button size="sm" data-builder-build-workspace="" onClick={() => enqueueProjectTask("build-exe")} loading={building} disabled={bundling}>
                    <Download aria-hidden className="size-4" />
                    Build
                  </Button>
                  <Button size="sm" variant="secondary" data-builder-bundle-workspace="" onClick={() => enqueueProjectTask("bundle-installer")} loading={bundling} disabled={building}>
                    <Box aria-hidden className="size-4" />
                    Bundle
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-builder-stop-run-workspace=""
                    loading={Boolean(latestRunSessionEntry && stoppingRunId === latestRunSessionEntry.id)}
                    disabled={!latestRunSessionEntry?.launchedPid || latestRunSessionEntry.runStatus === "stopped" || Boolean(stoppingRunId)}
                    onClick={() => {
                      if (latestRunSessionEntry) {
                        void stopRunSession(latestRunSessionEntry);
                      }
                    }}
                  >
                    <Square aria-hidden className="size-4" />
                    Stop
                  </Button>
                </div>
              </div>
            }
          >
            <aside className="space-y-4 rounded-[24px] border border-outline-variant bg-surface-container p-4">
              <PanelTitle icon={Download} title="构建输出" description="生成目标 Tauri 应用并输出 exe 或安装包。" />
              <div className="space-y-3 rounded-[22px] bg-surface-container-low p-3 text-xs">
                <PathRow label="项目目录" value={activeProject.rootPath || "保存后生成"} />
                <PathRow label="UI 文件" value={activeProject.rootPath ? `${activeProject.rootPath}\\ui` : "保存后生成"} />
                <PathRow label="Rust 逻辑" value={activeProject.rootPath ? `${activeProject.rootPath}\\rust\\logic.rs` : "保存后生成"} />
                <PathRow label="Rust Source Map" value={activeProject.rustSourceMapPath || "保存后生成"} />
                <PathRow label="生成应用" value={activeProject.rootPath ? `${activeProject.rootPath}\\app` : "保存后生成"} />
                <PathRow label="Generated Map" value={activeProject.generatedRustSourceMapPath || "生成 app 后写入"} />
                <PathRow label="验证报告" value={activeProject.validationReportPath || "验证后生成"} />
                <PathRow label="窗口快照" value={activeProject.validationSnapshotPath || "验证后生成"} />
                <PathRow label="运行截图" value={activeProject.validationScreenshotPath || "有可用浏览器时生成"} />
                <PathRow label="截图分析" value={activeProject.validationScreenshotAnalysisPath || "截图成功后生成"} />
                <PathRow label="DOM 审阅" value={activeProject.validationRuntimeAuditPath || "浏览器验证后生成"} />
                <PathRow label="断点验证" value={activeProject.validationBreakpointPath || "多断点验证后生成"} />
                <PathRow label="输出 exe" value={activeProject.outputExePath || "构建成功后生成"} />
                <PathRow label="安装包目录" value={activeProject.outputBundleDir || activeBundleDir || "完整打包后生成"} />
                <PathRow label="安装包产物" value={activeBundlePath || "完整打包后生成"} />
                <PathRow label="Bundle manifest" value={activeBundleManifestPath || "完整打包后生成"} />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    data-builder-open-output-exe=""
                    disabled={!activeProject.outputExePath}
                    onClick={() => void openLocalArtifact(activeProject.outputExePath ?? "")}
                  >
                    <Download aria-hidden className="size-4" />
                    打开 exe
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    data-builder-launch-output-exe=""
                    loading={launchingExeId === "active-output"}
                    disabled={!activeProject.outputExePath || Boolean(launchingExeId)}
                    onClick={() => void launchActiveOutputExecutable()}
                  >
                    <Play aria-hidden className="size-4" />
                    启动 exe
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    data-builder-open-output-bundle=""
                    disabled={!activeBundlePath}
                    onClick={() => void openLocalArtifact(activeBundlePath)}
                  >
                    <Box aria-hidden className="size-4" />
                    打开包
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-builder-open-output-dir=""
                    disabled={!activeBuildOutputDir}
                    onClick={() => void openLocalArtifact(activeBuildOutputDir)}
                  >
                    <FolderOpen aria-hidden className="size-4" />
                    exe 目录
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-builder-open-bundle-dir=""
                    disabled={!activeBundleDir}
                    onClick={() => void openLocalArtifact(activeBundleDir)}
                  >
                    <FolderOpen aria-hidden className="size-4" />
                    包目录
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-builder-open-bundle-manifest=""
                    disabled={!activeBundleManifestPath}
                    onClick={() => void openLocalArtifact(activeBundleManifestPath)}
                  >
                    <FileJson aria-hidden className="size-4" />
                    Manifest
                  </Button>
                </div>
                {latestRunSessionEntry ? (
                  <div className="rounded-2xl border border-outline-variant bg-surface-container px-3 py-3" data-builder-run-session-panel="">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium">Run session</p>
                        <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface-variant">
                          pid {latestRunSessionEntry.launchedPid} · {latestRunSessionEntry.runStatus ?? "launched"}
                        </p>
                      </div>
                      <Badge variant={latestRunSessionEntry.runStatus === "running" ? "secondary" : "outline"}>
                        {latestRunSessionEntry.runStatus ?? "unknown"}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[0.68rem] leading-4 text-on-surface-variant">
                      {latestRunSessionEntry.runSummary || latestRunSessionEntry.launchSummary}
                    </p>
                    {latestRunSessionEntry.runtimeLogPath ? (
                      <p className="mt-2 break-all font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                        {latestRunSessionEntry.runtimeLogPath}
                      </p>
                    ) : null}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        data-builder-refresh-run-session=""
                        loading={checkingRunId === latestRunSessionEntry.id}
                        disabled={!latestRunSessionEntry.launchedPid || Boolean(checkingRunId)}
                        onClick={() => void refreshRunSession(latestRunSessionEntry)}
                      >
                        <RotateCcw aria-hidden className="size-4" />
                        状态
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-builder-stop-run-session=""
                        loading={stoppingRunId === latestRunSessionEntry.id}
                        disabled={!latestRunSessionEntry.launchedPid || latestRunSessionEntry.runStatus === "stopped" || Boolean(stoppingRunId)}
                        onClick={() => void stopRunSession(latestRunSessionEntry)}
                      >
                        <Square aria-hidden className="size-4" />
                        停止
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-builder-refresh-runtime-log=""
                        loading={readingRuntimeLogId === latestRunSessionEntry.id}
                        disabled={!latestRunSessionEntry.runtimeLogPath || Boolean(readingRuntimeLogId)}
                        onClick={() => void refreshRuntimeLog(latestRunSessionEntry)}
                      >
                        <Terminal aria-hidden className="size-4" />
                        日志
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-builder-open-runtime-log=""
                        disabled={!latestRunSessionEntry.runtimeLogPath}
                        onClick={() => void openLocalArtifact(latestRunSessionEntry.runtimeLogPath ?? "")}
                      >
                        <FileJson aria-hidden className="size-4" />
                        打开
                      </Button>
                    </div>
                    <pre className="mt-3 max-h-44 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-container-high p-3 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                      {latestRunSessionEntry.runtimeLogPreview || "Runtime Console will appear after launching the generated exe."}
                    </pre>
                  </div>
                ) : null}
              </div>
              <section className="space-y-3 rounded-[22px] border border-outline-variant bg-surface-container-low p-3" data-builder-release-settings-shortcut="">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Project Settings</h3>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                      Release config 已移动到 Project Dock；Build 页只保留运行、构建、输出和证据。
                    </p>
                  </div>
                  <Badge variant="outline">{normalizeReleaseVersion(activeProject.releaseConfig.version)}</Badge>
                </div>
                <div className="rounded-2xl bg-surface-container-high p-3 text-xs">
                  <PathRow label="App" value={activeProject.releaseConfig.appName} />
                  <PathRow label="Bundle" value={activeProject.releaseConfig.bundleIdentifier} />
                  <PathRow label="Target" value={activeProject.releaseConfig.bundleTargets} />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  data-builder-open-project-release-settings=""
                  onClick={() => {
                    setMode("design");
                    setLeftDockTab("project");
                  }}
                >
                  <Settings2 aria-hidden className="size-4" />
                  Open Project Settings
                </Button>
              </section>
              <section className="hidden" data-builder-release-config="">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">发布配置</h3>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">写入目标 app 的 package、Cargo 和 Tauri 配置。</p>
                  </div>
                  <Badge variant="outline">release</Badge>
                </div>
                <Field label="应用名称">
                  <Input
                    inputSize="sm"
                    data-builder-release-app-name=""
                    value={activeProject.releaseConfig.appName}
                    onChange={(event) => updateReleaseConfig({ appName: event.target.value })}
                  />
                </Field>
                <Field label="Bundle identifier">
                  <Input
                    inputSize="sm"
                    data-builder-release-identifier=""
                    value={activeProject.releaseConfig.bundleIdentifier}
                    spellCheck={false}
                    className="font-mono text-xs"
                    onChange={(event) => updateReleaseConfig({ bundleIdentifier: event.target.value })}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="版本号">
                    <Input
                      inputSize="sm"
                      data-builder-release-version=""
                      value={activeProject.releaseConfig.version}
                      spellCheck={false}
                      className="font-mono text-xs"
                      onChange={(event) => updateReleaseConfig({ version: event.target.value })}
                    />
                  </Field>
                  <Field label="窗口标题">
                    <Input
                      inputSize="sm"
                      data-builder-release-window-title=""
                      value={activeProject.releaseConfig.windowTitle}
                      onChange={(event) => updateReleaseConfig({ windowTitle: event.target.value })}
                    />
                  </Field>
                </div>
                <div className="rounded-xl bg-surface-container-high p-3 text-xs" data-builder-release-version-bump="">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-medium text-on-surface">版本发布</span>
                    <span className="font-mono text-[0.68rem] text-on-surface-variant">
                      当前 {normalizeReleaseVersion(activeProject.releaseConfig.version)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["patch", "minor", "major"] as const).map((bump) => (
                      <Button
                        key={bump}
                        size="sm"
                        variant="ghost"
                        className="min-w-0 justify-start px-2"
                        data-builder-release-bump={bump}
                        onClick={() => void bumpActiveReleaseVersion(bump)}
                        disabled={diskBusy}
                      >
                        {bump}
                        <span className="ml-1 min-w-0 truncate font-mono text-[0.66rem] text-on-surface-variant">
                          {bumpReleaseVersion(activeProject.releaseConfig.version, bump)}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
                <Field label="Release notes">
                  <Textarea
                    data-builder-release-notes=""
                    value={activeProject.releaseConfig.releaseNotes}
                    onChange={(event) => updateReleaseConfig({ releaseNotes: event.target.value })}
                    className="min-h-[112px] resize-none font-mono text-xs leading-5"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="安装包目标">
                    <Select
                      value={activeProject.releaseConfig.bundleTargets}
                      onValueChange={(bundleTargets) => updateReleaseConfig({ bundleTargets: bundleTargets as ReleaseBundleTarget })}
                    >
                      <SelectTrigger inputSize="sm" data-builder-release-targets="">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {releaseBundleTargets.map((target) => (
                          <SelectItem key={target.value} value={target.value}>
                            {target.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="发布图标">
                    <Select
                      value={activeProject.releaseConfig.iconAssetId || "__default"}
                      onValueChange={(iconAssetId) => updateReleaseConfig({ iconAssetId: iconAssetId === "__default" ? "" : iconAssetId })}
                    >
                      <SelectTrigger inputSize="sm" data-builder-release-icon="">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__default">默认图标</SelectItem>
                        {activeProject.assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="rounded-xl bg-surface-container-high px-3 py-2 text-xs leading-5 text-on-surface-variant">
                  当前图标：{activeReleaseIconAsset ? `${activeReleaseIconAsset.name} (${activeReleaseIconAsset.publicPath})` : "使用内置默认图标"}
                </div>
                <div className="space-y-3 rounded-xl bg-surface-container-high p-3" data-builder-release-signing="">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Label className="text-xs font-medium">签名与发布校验</Label>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">{releaseSigningDescription(activeProject.releaseConfig)}</p>
                    </div>
                    <Badge variant={activeProject.releaseConfig.signingMode === "unsigned" ? "outline" : releaseSigningConfigured(activeProject.releaseConfig) ? "secondary" : "destructive"}>
                      {activeProject.releaseConfig.signingMode === "unsigned" ? "unsigned" : releaseSigningConfigured(activeProject.releaseConfig) ? "ready" : "missing"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="签名模式">
                      <Select
                        value={activeProject.releaseConfig.signingMode}
                        onValueChange={(signingMode) => updateReleaseConfig({ signingMode: signingMode as ReleaseSigningMode })}
                      >
                        <SelectTrigger inputSize="sm" data-builder-release-signing-mode="">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {releaseSigningModes.map((mode) => (
                            <SelectItem key={mode.value} value={mode.value}>
                              {mode.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Smoke 最小 KB">
                      <Input
                        inputSize="sm"
                        type="number"
                        min={0}
                        data-builder-release-smoke-size=""
                        value={activeProject.releaseConfig.minimumArtifactSizeKb}
                        onChange={(event) =>
                          updateReleaseConfig({ minimumArtifactSizeKb: normalizeMinimumArtifactSizeKb(event.target.value) })
                        }
                      />
                    </Field>
                  </div>
                  {activeProject.releaseConfig.signingMode === "windows-certificate" ? (
                    <div className="space-y-3">
                      <Field label="Certificate thumbprint">
                        <Input
                          inputSize="sm"
                          data-builder-release-cert-thumbprint=""
                          value={activeProject.releaseConfig.certificateThumbprint}
                          spellCheck={false}
                          className="font-mono text-xs"
                          onChange={(event) => {
                            setCertificateInspection(null);
                            updateReleaseConfig({ certificateThumbprint: event.target.value });
                          }}
                        />
                      </Field>
                      <div className="rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <Label className="text-xs font-medium">Certificate store</Label>
                            <p className="mt-1 text-[0.68rem] leading-4 text-on-surface-variant">
                              检查 CurrentUser\My 和 LocalMachine\My 是否已有匹配证书。
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            data-builder-inspect-certificate-store=""
                            loading={checkingCertificateStore}
                            disabled={!activeProject.releaseConfig.certificateThumbprint.trim() || checkingCertificateStore}
                            onClick={() => void inspectCertificateStore()}
                          >
                            <Search aria-hidden className="size-4" />
                            检查 Store
                          </Button>
                        </div>
                        {certificateInspection ? (
                          <div
                            className={cn(
                              "mt-3 rounded-xl border px-3 py-2 text-xs leading-5",
                              certificateInspection.found
                                ? "border-primary/30 bg-primary/5 text-on-surface"
                                : "border-outline-variant bg-surface text-on-surface-variant",
                            )}
                            data-builder-certificate-store-result=""
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={certificateInspection.found ? "secondary" : "outline"}>
                                {certificateInspection.found ? `${certificateInspection.match_count} found` : "missing"}
                              </Badge>
                              <span className="min-w-0 break-words">{certificateInspection.summary}</span>
                            </div>
                            {certificateInspection.entries.length > 0 ? (
                              <div className="mt-2 space-y-2">
                                {certificateInspection.entries.slice(0, 3).map((entry) => (
                                  <div key={`${entry.store}-${entry.thumbprint}`} className="rounded-lg bg-surface-container px-2 py-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-medium">{entry.store}</span>
                                      <Badge variant={entry.has_private_key ? "secondary" : "outline"}>
                                        {entry.has_private_key ? "private key" : "no private key"}
                                      </Badge>
                                      {entry.not_after ? (
                                        <span className="text-on-surface-variant">expires {validationTimeLabel(entry.not_after)}</span>
                                      ) : null}
                                    </div>
                                    <p className="mt-1 break-words font-mono text-[0.68rem] text-on-surface-variant">
                                      {entry.friendly_name || entry.subject || entry.thumbprint}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs text-on-surface-variant">Certificate file</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-release-choose-certificate=""
                            onClick={() => void chooseSigningCertificate()}
                            disabled={diskBusy}
                          >
                            <FolderOpen aria-hidden className="size-4" />
                            选择
                          </Button>
                        </div>
                        <Input
                          inputSize="sm"
                          data-builder-release-cert-source=""
                          value={activeProject.releaseConfig.certificateSourcePath}
                          spellCheck={false}
                          className="font-mono text-xs"
                          placeholder="C:\\certs\\release-signing.pfx"
                          onChange={(event) => updateReleaseConfig({ certificateSourcePath: event.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Password env var">
                          <Input
                            inputSize="sm"
                            data-builder-release-cert-password-env=""
                            value={activeProject.releaseConfig.certificatePasswordEnvVar}
                            spellCheck={false}
                            className="font-mono text-xs"
                            onChange={(event) => updateReleaseConfig({ certificatePasswordEnvVar: event.target.value })}
                          />
                        </Field>
                        <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2">
                          <div className="min-w-0">
                            <Label className="text-xs font-medium">导入 PFX</Label>
                            <p className="mt-1 text-[0.68rem] leading-4 text-on-surface-variant">构建前导入到 CurrentUser\\My。</p>
                          </div>
                          <Switch
                            checked={activeProject.releaseConfig.importCertificateBeforeBuild}
                            onCheckedChange={(importCertificateBeforeBuild) => updateReleaseConfig({ importCertificateBeforeBuild })}
                          />
                        </div>
                      </div>
                      <p className="rounded-xl bg-surface-container-low px-3 py-2 text-[0.68rem] leading-4 text-on-surface-variant">
                        证书密码不会保存到项目；构建时只读取系统环境变量 {activeProject.releaseConfig.certificatePasswordEnvVar || "NOVA_SIGNING_CERT_PASSWORD"}。
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Digest">
                          <Select
                            value={activeProject.releaseConfig.digestAlgorithm}
                            onValueChange={(digestAlgorithm) => updateReleaseConfig({ digestAlgorithm })}
                          >
                            <SelectTrigger inputSize="sm" data-builder-release-digest="">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {releaseDigestAlgorithms.map((algorithm) => (
                                <SelectItem key={algorithm} value={algorithm}>
                                  {algorithm}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2">
                          <div className="min-w-0">
                            <Label className="text-xs font-medium">TSP</Label>
                            <p className="mt-1 text-[0.68rem] leading-4 text-on-surface-variant">时间戳服务使用 RFC 3161。</p>
                          </div>
                          <Switch
                            checked={activeProject.releaseConfig.timestampTsp}
                            onCheckedChange={(timestampTsp) => updateReleaseConfig({ timestampTsp })}
                          />
                        </div>
                      </div>
                      <Field label="Timestamp URL">
                        <Input
                          inputSize="sm"
                          data-builder-release-timestamp-url=""
                          value={activeProject.releaseConfig.timestampUrl}
                          spellCheck={false}
                          className="font-mono text-xs"
                          onChange={(event) => updateReleaseConfig({ timestampUrl: event.target.value })}
                        />
                      </Field>
                    </div>
                  ) : null}
                  {activeProject.releaseConfig.signingMode === "custom-command" ? (
                    <Field label="Sign command">
                      <Textarea
                        data-builder-release-sign-command=""
                        value={activeProject.releaseConfig.signCommand}
                        onChange={(event) => updateReleaseConfig({ signCommand: event.target.value })}
                        placeholder="signtool sign /fd SHA256 /a /tr http://timestamp.digicert.com %1"
                        className="min-h-[72px] resize-none font-mono text-xs leading-5"
                      />
                    </Field>
                  ) : null}
                  <Field label="Installer smoke">
                    <Select
                      value={activeProject.releaseConfig.installerSmokeMode}
                      onValueChange={(installerSmokeMode) => updateReleaseConfig({ installerSmokeMode: installerSmokeMode as ReleaseInstallerSmokeMode })}
                    >
                      <SelectTrigger inputSize="sm" data-builder-release-installer-smoke="">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {releaseInstallerSmokeModes.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Smoke runner">
                    <Select
                      value={activeProject.releaseConfig.installerSmokeRunnerMode}
                      onValueChange={(installerSmokeRunnerMode) => updateReleaseConfig({ installerSmokeRunnerMode: installerSmokeRunnerMode as ReleaseInstallerSmokeRunnerMode })}
                    >
                      <SelectTrigger inputSize="sm" data-builder-release-installer-smoke-runner="">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {releaseInstallerSmokeRunnerModes.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  {activeProject.releaseConfig.installerSmokeRunnerMode === "vm-handoff" ? (
                    <>
                      <Field label="VM name">
                        <Input
                          inputSize="sm"
                          value={activeProject.releaseConfig.installerSmokeVmName}
                          data-builder-release-installer-smoke-vm-name=""
                          onChange={(event) => updateReleaseConfig({ installerSmokeVmName: event.target.value })}
                        />
                      </Field>
                      <Field label="Shared folder">
                        <Input
                          inputSize="sm"
                          value={activeProject.releaseConfig.installerSmokeVmSharedFolder}
                          data-builder-release-installer-smoke-vm-shared-folder=""
                          placeholder="C:\\NovaSmoke or \\\\vm\\NovaSmoke"
                          className="font-mono text-xs"
                          onChange={(event) => updateReleaseConfig({ installerSmokeVmSharedFolder: event.target.value })}
                        />
                      </Field>
                      <Field label="VM notes" className="col-span-2">
                        <Textarea
                          value={activeProject.releaseConfig.installerSmokeVmNotes}
                          data-builder-release-installer-smoke-vm-notes=""
                          placeholder="Snapshot name, guest user, runner expectation, or return-result convention."
                          className="min-h-[70px] resize-none text-xs leading-5"
                          onChange={(event) => updateReleaseConfig({ installerSmokeVmNotes: event.target.value })}
                        />
                      </Field>
                    </>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="宽度">
                    <Input
                      inputSize="sm"
                      type="number"
                      data-builder-release-window-width=""
                      value={activeProject.releaseConfig.windowWidth}
                      onChange={(event) =>
                        updateReleaseConfig({ windowWidth: numberFromInput(event.target.value, activeProject.releaseConfig.windowWidth, 320, 3840) })
                      }
                    />
                  </Field>
                  <Field label="高度">
                    <Input
                      inputSize="sm"
                      type="number"
                      data-builder-release-window-height=""
                      value={activeProject.releaseConfig.windowHeight}
                      onChange={(event) =>
                        updateReleaseConfig({ windowHeight: numberFromInput(event.target.value, activeProject.releaseConfig.windowHeight, 240, 2160) })
                      }
                    />
                  </Field>
                  <Field label="最小宽度">
                    <Input
                      inputSize="sm"
                      type="number"
                      data-builder-release-min-width=""
                      value={activeProject.releaseConfig.minWindowWidth}
                      onChange={(event) =>
                        updateReleaseConfig({
                          minWindowWidth: numberFromInput(event.target.value, activeProject.releaseConfig.minWindowWidth, 240, activeProject.releaseConfig.windowWidth),
                        })
                      }
                    />
                  </Field>
                  <Field label="最小高度">
                    <Input
                      inputSize="sm"
                      type="number"
                      data-builder-release-min-height=""
                      value={activeProject.releaseConfig.minWindowHeight}
                      onChange={(event) =>
                        updateReleaseConfig({
                          minWindowHeight: numberFromInput(event.target.value, activeProject.releaseConfig.minWindowHeight, 180, activeProject.releaseConfig.windowHeight),
                        })
                      }
                    />
                  </Field>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-high p-3">
                  <div className="min-w-0">
                    <Label className="text-xs font-medium">允许缩放窗口</Label>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">关闭后目标 app 使用固定窗口尺寸。</p>
                  </div>
                  <Switch checked={activeProject.releaseConfig.resizable} onCheckedChange={(resizable) => updateReleaseConfig({ resizable })} />
                </div>
              </section>
              {buildError ? (
                <div className="rounded-[18px] border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {buildError}
                </div>
              ) : null}
              <section className="rounded-[22px] bg-surface-container-low p-3" data-builder-generated-incremental-summary="">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Generated targets</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">
                      {latestGeneratedFileSummary
                        ? latestGeneratedFileSummary.summary
                        : "运行检查、构建或安装包任务后显示本次生成目标变更。未变化的文件不会重写，以保留 Vite/Cargo 增量缓存。"}
                    </p>
                  </div>
                  <Badge variant={latestGeneratedFileSummary?.changed_count ? "outline" : "secondary"}>
                    {latestGeneratedFileSummary ? `${latestGeneratedFileSummary.changed_count} changed` : "pending"}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-2xl bg-surface-container-high p-2">
                    <p className="font-medium text-on-surface">{latestGeneratedFileSummary?.total_count ?? 0}</p>
                    <p className="mt-1 text-[0.68rem] text-on-surface-variant">targets</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-high p-2">
                    <p className="font-medium text-primary">{latestGeneratedFileSummary?.created_count ?? 0}</p>
                    <p className="mt-1 text-[0.68rem] text-on-surface-variant">create</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-high p-2">
                    <p className="font-medium text-on-surface">{latestGeneratedFileSummary?.updated_count ?? 0}</p>
                    <p className="mt-1 text-[0.68rem] text-on-surface-variant">update</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-high p-2">
                    <p className="font-medium text-on-surface-variant">{latestGeneratedFileSummary?.unchanged_count ?? 0}</p>
                    <p className="mt-1 text-[0.68rem] text-on-surface-variant">unchanged</p>
                  </div>
                </div>
              </section>
              <section className="rounded-[22px] bg-surface-container-low p-3" data-builder-readiness="">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Build readiness</h3>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">构建前检查项目结构、Rust 同步、事件绑定和资源引用。</p>
                  </div>
                  <Badge
                    variant={
                      buildReadinessSummary.errorCount > 0
                        ? "destructive"
                        : buildReadinessSummary.warningCount > 0
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {buildReadinessSummary.score}%
                  </Badge>
                </div>
                <Progress value={buildReadinessSummary.score} />
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-2xl bg-surface-container-high p-2">
                    <p className="font-medium text-destructive">{buildReadinessSummary.errorCount}</p>
                    <p className="mt-1 text-[0.68rem] text-on-surface-variant">errors</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-high p-2">
                    <p className="font-medium text-on-surface">{buildReadinessSummary.warningCount}</p>
                    <p className="mt-1 text-[0.68rem] text-on-surface-variant">warnings</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-high p-2">
                    <p className="font-medium text-primary">{buildReadinessSummary.readyCount}</p>
                    <p className="mt-1 text-[0.68rem] text-on-surface-variant">ready</p>
                  </div>
                </div>
                <div className="mt-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3" data-builder-property-repair-plan="">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Property repair plan</h4>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                        {projectPropertyAutoFixSummary.issueCount > 0
                          ? `${projectPropertyAutoFixSummary.errorCount} errors, ${projectPropertyAutoFixSummary.warningCount} warnings. 可安全修复 ${projectPropertyAutoFixSummary.propertyCount} 个属性。`
                          : "项目内控件属性 schema 暂无问题。"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={projectPropertyAutoFixSummary.targets.length === 0}
                      data-builder-apply-project-property-fixes=""
                      onClick={applyProjectPropertyAutoFixes}
                    >
                      <Wand2 aria-hidden className="size-4" />
                      Fix project
                    </Button>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-2xl bg-surface-container-low p-2">
                      <p className="font-medium text-on-surface">{projectPropertyAutoFixSummary.fileCount}</p>
                      <p className="mt-1 text-[0.68rem] text-on-surface-variant">files</p>
                    </div>
                    <div className="rounded-2xl bg-surface-container-low p-2">
                      <p className="font-medium text-primary">{projectPropertyAutoFixSummary.targets.length}</p>
                      <p className="mt-1 text-[0.68rem] text-on-surface-variant">controls</p>
                    </div>
                    <div className="rounded-2xl bg-surface-container-low p-2">
                      <p className="font-medium text-on-surface">{projectPropertyAutoFixSummary.manualIssueCount}</p>
                      <p className="mt-1 text-[0.68rem] text-on-surface-variant">manual</p>
                    </div>
                  </div>
                  {projectPropertyAutoFixSummary.targets.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {projectPropertyAutoFixSummary.targets.slice(0, 3).map((target) => (
                        <button
                          key={`${target.fileId}-${target.itemId}`}
                          type="button"
                          className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl bg-surface-container-low p-2 text-left text-xs transition hover:bg-surface-container"
                          onClick={() =>
                            focusBuildReadinessItem({
                              id: `property-repair-${target.fileId}-${target.itemId}`,
                              severity: "warning",
                              title: "Property repair",
                              detail: "",
                              fileId: target.fileId,
                              fileName: target.fileName,
                              itemId: target.itemId,
                              itemName: target.itemName,
                            })
                          }
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-on-surface">{target.itemName}</span>
                            <span className="block truncate text-on-surface-variant">
                              {target.fileName} · {target.itemType} · {target.propertyCount} fixes
                            </span>
                          </span>
                          <MousePointer2 aria-hidden className="size-4 shrink-0 text-on-surface-variant" />
                        </button>
                      ))}
                      {projectPropertyAutoFixSummary.targets.length > 3 ? (
                        <p className="text-[0.68rem] text-on-surface-variant">另有 {projectPropertyAutoFixSummary.targets.length - 3} 个控件会在批量修复中处理。</p>
                      ) : null}
                    </div>
                  ) : null}
                  {activeProject.maintenanceHistory?.length ? (
                    <div className="mt-3 space-y-2 border-t border-outline-variant pt-3" data-builder-maintenance-history="">
                      <div className="flex items-center justify-between gap-3">
                        <h5 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Repair history</h5>
                        <Badge variant="outline">{activeProject.maintenanceHistory.length}</Badge>
                      </div>
                      {activeProject.maintenanceHistory.slice(0, 4).map((entry) => (
                        <article key={entry.id} className="rounded-xl bg-surface-container-low p-2 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-on-surface">{entry.title}</p>
                              <p className="mt-1 text-[0.68rem] text-on-surface-variant">{validationTimeLabel(entry.createdAt)}</p>
                            </div>
                            <Badge variant={entry.status === "partial" ? "outline" : "secondary"}>{entry.status}</Badge>
                          </div>
                          <p className="mt-2 line-clamp-2 leading-5 text-on-surface-variant">{entry.summary}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5 text-[0.68rem] text-on-surface-variant">
                            <span className="rounded-full bg-surface-container-high px-2 py-1">{entry.fileCount} files</span>
                            <span className="rounded-full bg-surface-container-high px-2 py-1">{entry.itemCount} controls</span>
                            <span className="rounded-full bg-surface-container-high px-2 py-1">{entry.propertyCount} props</span>
                          </div>
                          {entry.changes.length ? (
                            <div className="mt-2 space-y-1">
                              {entry.changes.slice(0, 3).map((change) => (
                                <button
                                  key={`${entry.id}-${change.fileId}-${change.itemId}`}
                                  type="button"
                                  className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg bg-surface-container-high px-2 py-1.5 text-left text-[0.68rem] transition hover:bg-surface-container"
                                  onClick={() =>
                                    focusBuildReadinessItem({
                                      id: `maintenance-${entry.id}-${change.itemId}`,
                                      severity: "ready",
                                      title: entry.title,
                                      detail: entry.summary,
                                      fileId: change.fileId,
                                      fileName: change.fileName,
                                      itemId: change.itemId,
                                      itemName: change.itemName,
                                    })
                                  }
                                >
                                  <span className="min-w-0 truncate">
                                    {change.itemName} · {change.props.join(", ")}
                                  </span>
                                  <MousePointer2 aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
                  {buildReadinessSummary.items.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-outline-variant bg-surface-container-high p-3 text-xs">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          {item.severity === "ready" ? (
                            <CheckCircle2 aria-hidden className="size-3.5 shrink-0 text-primary" />
                          ) : (
                            <AlertTriangle
                              aria-hidden
                              className={cn("size-3.5 shrink-0", item.severity === "error" ? "text-destructive" : "text-on-surface-variant")}
                            />
                          )}
                          <span className="truncate font-medium">{item.title}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {item.fileId ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              data-builder-focus-readiness={item.id}
                              aria-label={`定位 ${item.title}`}
                              onClick={() => focusBuildReadinessItem(item)}
                            >
                              <MousePointer2 aria-hidden className="size-4" />
                              定位
                            </Button>
                          ) : null}
                          <Badge variant={item.severity === "error" ? "destructive" : item.severity === "warning" ? "outline" : "secondary"}>
                            {item.severity}
                          </Badge>
                        </div>
                      </div>
                      <p className="leading-5 text-on-surface-variant">{item.detail}</p>
                      {item.fileName ? <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface-variant">{item.fileName}</p> : null}
                    </article>
                  ))}
                </div>
              </section>
              <section className="rounded-[22px] bg-surface-container-low p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">诊断</h3>
                  <Badge variant={buildDiagnostics.length > 0 ? "destructive" : "secondary"}>
                    {buildDiagnostics.length}
                  </Badge>
                </div>
                {buildDiagnostics.length === 0 ? (
                  <p className="text-xs leading-5 text-on-surface-variant">暂无 Rust/Cargo 诊断。构建失败时会解析错误位置。</p>
                ) : (
                  <div className="max-h-40 space-y-2 overflow-auto pr-1">
                    {buildDiagnostics.map((diagnostic, index) => {
                      const canFocusDiagnostic = isEditableRustDiagnostic(diagnostic);
                      return (
                        <article key={`${diagnostic.message}-${index}`} className="rounded-2xl border border-outline-variant bg-surface-container-high p-3 text-xs">
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <Badge variant={diagnostic.severity === "error" ? "destructive" : "outline"}>{diagnostic.severity}</Badge>
                              {diagnostic.code ? <Badge variant="outline">{diagnostic.code}</Badge> : null}
                              {diagnostic.origin ? <Badge variant="outline">{diagnostic.origin}</Badge> : null}
                              {diagnostic.file ? (
                                <span className="min-w-0 truncate font-mono text-[0.68rem] text-on-surface-variant">
                                  {diagnostic.file}:{diagnostic.line}:{diagnostic.column}
                                </span>
                              ) : null}
                            </div>
                            <Button
                              size="sm"
                              variant={canFocusDiagnostic ? "secondary" : "outline"}
                              data-builder-focus-build-diagnostic={`${index}`}
                              onClick={() => openBuildDiagnostic(diagnostic, index, canFocusDiagnostic)}
                            >
                              {canFocusDiagnostic ? <MousePointer2 aria-hidden className="size-4" /> : <Search aria-hidden className="size-4" />}
                              {canFocusDiagnostic ? "定位" : "详情"}
                            </Button>
                          </div>
                          <p className="leading-5">{diagnostic.message}</p>
                          {diagnostic.sourceLine ? (
                            <p className="mt-1 break-all font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                              source {diagnostic.sourceFile ? fileNameFromPath(diagnostic.sourceFile) : "rust"}:{diagnostic.sourceLine}
                              {diagnostic.sourceKind ? ` · ${diagnostic.sourceKind}` : ""}
                            </p>
                          ) : null}
                          {diagnostic.rendered ? (
                            <pre className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-container-low p-2 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                              {diagnostic.rendered}
                            </pre>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
              <section className="rounded-[22px] bg-surface-container-low p-3" data-builder-quick-checks="">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">快速检查</h3>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">先跑轻量检查，再决定是否完整输出 exe。</p>
                  </div>
                  <Badge variant={checkingTarget ? "outline" : "secondary"}>{checkingTarget ?? "ready"}</Badge>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  <Button
                    size="sm"
                    variant="secondary"
                    data-builder-preview-generated-files=""
                    loading={previewingGeneratedFiles}
                    disabled={previewingGeneratedFiles || applyingGeneratedFiles || Boolean(checkingTarget) || building || bundling || validatingWindow}
                    onClick={() => enqueueProjectTask("preview-generated-files")}
                  >
                    <FileJson aria-hidden className="size-4" />
                    文件预览
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    data-builder-build-backend-artifacts=""
                    loading={Boolean(buildingBackendArtifactId)}
                    disabled={Boolean(buildingBackendArtifactId) || Boolean(checkingTarget) || building || bundling || validatingWindow}
                    onClick={() => enqueueProjectTask("build-backend-artifacts")}
                  >
                    <Terminal aria-hidden className="size-4" />
                    后端产物
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    data-builder-check-frontend=""
                    loading={checkingTarget === "frontend"}
                    disabled={Boolean(checkingTarget) || building || bundling || validatingWindow}
                    onClick={() => enqueueProjectTask("quick-check-frontend")}
                  >
                    <Monitor aria-hidden className="size-4" />
                    前端检查
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    data-builder-check-rust=""
                    loading={checkingTarget === "rust"}
                    disabled={Boolean(checkingTarget) || building || bundling || validatingWindow}
                    onClick={() => enqueueProjectTask("quick-check-rust")}
                  >
                    <Braces aria-hidden className="size-4" />
                    Rust 检查
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    data-builder-check-all=""
                    loading={checkingTarget === "all"}
                    disabled={Boolean(checkingTarget) || building || bundling || validatingWindow}
                    onClick={() => enqueueProjectTask("quick-check-all")}
                  >
                    <CheckCircle2 aria-hidden className="size-4" />
                    全部检查
                  </Button>
                </div>
              </section>
              <section className="rounded-[22px] bg-surface-container-low p-3" data-builder-task-center="">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Task Center</h3>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                      队列化保存、生成、检查、验证、构建和打包动作。
                    </p>
                  </div>
                  <Badge variant={runningProjectTask ? "outline" : activeProjectTasks.length ? "secondary" : "outline"}>
                    {runningProjectTask ? "running" : activeProjectTasks.length ? `${visibleProjectTasks.length}/${activeProjectTasks.length}` : "empty"}
                  </Badge>
                </div>
                <div className="mb-3 grid grid-cols-3 gap-2 text-center text-[0.68rem]">
                  <div className="rounded-xl bg-surface-container-high px-2 py-2">
                    <p className="font-medium text-on-surface">{runningProjectTask ? 1 : 0}</p>
                    <p className="mt-1 text-on-surface-variant">running</p>
                  </div>
                  <div className="rounded-xl bg-surface-container-high px-2 py-2">
                    <p className="font-medium text-on-surface">{queuedProjectTaskCount}</p>
                    <p className="mt-1 text-on-surface-variant">queued</p>
                  </div>
                  <div className="rounded-xl bg-surface-container-high px-2 py-2">
                    <p className="font-medium text-on-surface">{failedProjectTaskCount}</p>
                    <p className="mt-1 text-on-surface-variant">failed</p>
                  </div>
                </div>
                <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]" data-builder-task-queue-controls="">
                  <Button
                    size="sm"
                    variant={projectTaskQueuePaused ? "secondary" : "ghost"}
                    data-builder-toggle-task-queue=""
                    onClick={() => setProjectTaskQueuePausedState(!projectTaskQueuePaused)}
                  >
                    {projectTaskQueuePaused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
                    {projectTaskQueuePaused ? "恢复队列" : "暂停队列"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-builder-drain-task-queue=""
                    disabled={projectTaskQueuePaused || localQueuedProjectTasks.length === 0}
                    onClick={() => void drainProjectTaskQueue()}
                  >
                    <Play aria-hidden className="size-4" />
                    继续执行
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-builder-cancel-queued-tasks=""
                    disabled={localQueuedProjectTasks.length === 0}
                    onClick={cancelQueuedProjectTasks}
                  >
                    取消等待 {localQueuedProjectTasks.length}
                  </Button>
                </div>
                <div className="mb-3 space-y-2" data-builder-custom-action-preset-editor="">
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <Input
                      inputSize="sm"
                      value={customPresetTitle}
                      onChange={(event) => setCustomPresetTitle(event.target.value)}
                      placeholder="Preset title"
                      aria-label="Custom action preset title"
                    />
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                      <Select value={customPresetDraftActionId} onValueChange={(value) => setCustomPresetDraftActionId(value as ProjectJumpActionId)}>
                        <SelectTrigger inputSize="sm" aria-label="Add action to custom preset">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {projectActionOptionIds.map((actionId) => (
                            <SelectItem key={actionId} value={actionId}>
                              {projectTaskDefinitions[actionId].title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="ghost" data-builder-add-preset-step="" onClick={addActionToCustomPresetDraft}>
                        <Plus aria-hidden className="size-4" />
                        step
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    className="min-h-16 text-xs"
                    value={customPresetDetail}
                    onChange={(event) => setCustomPresetDetail(event.target.value)}
                    placeholder="Preset detail"
                    aria-label="Custom action preset detail"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {customPresetDraftActions.map((actionId, index) => (
                      <span key={`${actionId}-${index}`} className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-high px-2 py-1 text-[0.68rem] text-on-surface-variant">
                        {index + 1}. {projectTaskDefinitions[actionId].title}
                        <button
                          type="button"
                          className="focus-ring rounded-full px-1 text-primary"
                          aria-label={`Move ${projectTaskDefinitions[actionId].title} up in preset`}
                          disabled={index === 0}
                          onClick={() => moveCustomPresetDraftAction(index, -1)}
                        >
                          <MoveUp aria-hidden className="size-3" />
                        </button>
                        <button
                          type="button"
                          className="focus-ring rounded-full px-1 text-primary"
                          aria-label={`Move ${projectTaskDefinitions[actionId].title} down in preset`}
                          disabled={index === customPresetDraftActions.length - 1}
                          onClick={() => moveCustomPresetDraftAction(index, 1)}
                        >
                          <MoveDown aria-hidden className="size-3" />
                        </button>
                        <button
                          type="button"
                          className="focus-ring rounded-full px-1 text-destructive"
                          aria-label={`Remove ${projectTaskDefinitions[actionId].title} from preset`}
                          onClick={() => removeActionFromCustomPresetDraft(index)}
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button size="sm" variant="secondary" data-builder-save-custom-preset="" disabled={!canSaveCustomPreset} onClick={saveCustomProjectActionPreset}>
                      <Save aria-hidden className="size-4" />
                      保存自定义 preset
                    </Button>
                    <Button size="sm" variant="ghost" data-builder-clear-custom-preset="" disabled={customPresetDraftActions.length === 0} onClick={() => setCustomPresetDraftActions([])}>
                      清空步骤
                    </Button>
                  </div>
                </div>
                <div className="mb-3 grid gap-2 sm:grid-cols-2" data-builder-action-presets="">
                  {allProjectActionPresets.map((preset) => (
                    <article
                      key={preset.id}
                      className="focus-ring rounded-2xl border border-outline-variant bg-surface-container-high p-3 text-left text-xs transition-colors hover:border-outline hover:bg-surface-container-highest"
                      data-builder-action-preset={preset.id}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-on-surface">{preset.title}</p>
                          <p className="mt-1 line-clamp-2 leading-5 text-on-surface-variant">{preset.detail}</p>
                        </div>
                        <Badge variant="outline">{preset.badge}</Badge>
                      </div>
                      <p className="mt-2 truncate font-mono text-[0.68rem] text-on-surface-variant">
                        {preset.actions.map((actionId) => projectTaskDefinitions[actionId].title).join(" -> ")}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" data-builder-run-action-preset={preset.id} onClick={() => runProjectActionPreset(preset)}>
                          <Play aria-hidden className="size-4" />
                          运行
                        </Button>
                        {preset.custom ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          data-builder-delete-custom-preset={preset.id}
                          onClick={() => deleteCustomProjectActionPreset(preset.id)}
                        >
                          删除自定义
                        </Button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
                <div className="mb-3 grid gap-2" data-builder-task-filter="">
                  <div className="relative">
                    <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                    <Input
                      inputSize="sm"
                      className="pl-8"
                      value={projectTaskSearchQuery}
                      onChange={(event) => setProjectTaskSearchQuery(event.target.value)}
                      placeholder="Search tasks, paths, errors..."
                      aria-label="Search project tasks"
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Select value={projectTaskStatusFilter} onValueChange={(value) => setProjectTaskStatusFilter(value as ProjectTaskStatusFilter)}>
                      <SelectTrigger inputSize="sm" aria-label="Filter task status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTaskStatusFilterOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={projectTaskKindFilter} onValueChange={(value) => setProjectTaskKindFilter(value as ProjectTaskKindFilter)}>
                      <SelectTrigger inputSize="sm" aria-label="Filter task kind">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTaskKindFilterOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {activeProjectTasks.length ? (
                  <div className="grid gap-3 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                    <div className="max-h-[22rem] space-y-2 overflow-auto pr-1" data-builder-task-list="">
                      {visibleProjectTasks.length ? (
                        visibleProjectTasks.slice(0, 12).map((task) => {
                          const selected = selectedProjectTask?.id === task.id;
                          const queueIndex = queuedProjectTaskIndex(task.id);
                          return (
                            <article
                              key={task.id}
                              role="button"
                              tabIndex={0}
                              className={cn(
                                "rounded-2xl border bg-surface-container-high p-3 text-xs transition-colors",
                                selected ? "border-primary/60 bg-secondary-container/45" : "border-outline-variant hover:border-outline",
                              )}
                              data-builder-task-item={task.id}
                              aria-selected={selected}
                              onClick={() => {
                                setSelectedProjectTaskId(task.id);
                                setProjectTaskLogSearchQuery("");
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  setSelectedProjectTaskId(task.id);
                                  setProjectTaskLogSearchQuery("");
                                }
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-primary">
                                  <ProjectTaskIcon kind={task.kind} />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="truncate font-medium text-on-surface">{task.title}</p>
                                      <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                                        {validationTimeLabel(task.startedAt ?? task.createdAt)}
                                        {task.attempt > 1 ? ` · retry ${task.attempt}` : ""}
                                      </p>
                                    </div>
                                    <Badge variant={projectTaskStatusVariant(task.status)}>{task.status}</Badge>
                                  </div>
                                  <p className="mt-2 line-clamp-2 leading-5 text-on-surface-variant">{task.summary ?? task.detail}</p>
                                  {task.error ? <p className="mt-2 line-clamp-2 font-mono text-[0.68rem] leading-4 text-destructive">{task.error}</p> : null}
                                  {task.status === "queued" && queueIndex >= 0 ? (
                                    <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-surface-container-low px-2 py-1.5 text-[0.68rem] text-on-surface-variant">
                                      <span>queue #{queueIndex + 1}</span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="icon-sm"
                                          variant="ghost"
                                          aria-label={`Move ${task.title} up in queue`}
                                          data-builder-move-task-up={task.id}
                                          disabled={!canMoveQueuedProjectTask(task.id, -1)}
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            moveQueuedProjectTask(task.id, -1);
                                          }}
                                        >
                                          <MoveUp aria-hidden className="size-3.5" />
                                        </Button>
                                        <Button
                                          size="icon-sm"
                                          variant="ghost"
                                          aria-label={`Move ${task.title} down in queue`}
                                          data-builder-move-task-down={task.id}
                                          disabled={!canMoveQueuedProjectTask(task.id, 1)}
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            moveQueuedProjectTask(task.id, 1);
                                          }}
                                        >
                                          <MoveDown aria-hidden className="size-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : null}
                                  <Progress className="mt-3 h-1.5" value={projectTaskProgress(task.status)} />
                                </div>
                              </div>
                            </article>
                          );
                        })
                      ) : (
                        <div className="rounded-2xl border border-dashed border-outline-variant p-4 text-center text-xs leading-5 text-on-surface-variant">
                          没有符合筛选条件的任务。
                        </div>
                      )}
                    </div>
                    {selectedProjectTask ? (
                      <div className="rounded-2xl border border-outline-variant bg-surface-container-high p-3 text-xs" data-builder-task-detail="">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-on-surface">{selectedProjectTask.title}</p>
                            <p className="mt-1 line-clamp-2 leading-5 text-on-surface-variant">{selectedProjectTask.detail}</p>
                          </div>
                          <Badge variant={projectTaskStatusVariant(selectedProjectTask.status)}>{selectedProjectTask.status}</Badge>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-[0.68rem] xl:grid-cols-4">
                          <div className="rounded-xl bg-surface-container-low px-2 py-2">
                            <p className="text-on-surface-variant">kind</p>
                            <p className="mt-1 truncate font-medium text-on-surface">{projectTaskKindLabel(selectedProjectTask.kind)}</p>
                          </div>
                          <div className="rounded-xl bg-surface-container-low px-2 py-2">
                            <p className="text-on-surface-variant">elapsed</p>
                            <p className="mt-1 truncate font-medium text-on-surface">{projectTaskElapsedLabel(selectedProjectTask)}</p>
                          </div>
                          <div className="rounded-xl bg-surface-container-low px-2 py-2">
                            <p className="text-on-surface-variant">attempt</p>
                            <p className="mt-1 truncate font-medium text-on-surface">{selectedProjectTask.attempt}</p>
                          </div>
                          <div className="rounded-xl bg-surface-container-low px-2 py-2">
                            <p className="text-on-surface-variant">source</p>
                            <p className="mt-1 truncate font-medium text-on-surface">{selectedProjectTask.backendTaskId ? "Rust task" : "Editor queue"}</p>
                          </div>
                        </div>
                        <p className="mt-3 rounded-xl bg-surface-container-low p-2 leading-5 text-on-surface-variant">
                          {selectedProjectTask.summary ?? "No task summary has been written yet."}
                        </p>
                        {selectedProjectTask.error ? (
                          <p className="mt-2 rounded-xl bg-destructive/10 p-2 font-mono text-[0.68rem] leading-4 text-destructive">
                            {selectedProjectTask.error}
                          </p>
                        ) : null}
                        <div className="mt-3 space-y-2">
                          {selectedProjectTask.artifactPath ? (
                            <p className="break-all rounded-xl bg-surface-container-low p-2 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                              artifact: {selectedProjectTask.artifactPath}
                            </p>
                          ) : null}
                          {selectedProjectTask.logPath ? (
                            <p className="break-all rounded-xl bg-surface-container-low p-2 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                              log: {selectedProjectTask.logPath}
                            </p>
                          ) : null}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedProjectTask.artifactPath ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              data-builder-open-selected-task-artifact={selectedProjectTask.id}
                              onClick={() => void openLocalArtifact(selectedProjectTask.artifactPath ?? "")}
                            >
                              <FolderOpen aria-hidden className="size-4" />
                              打开产物
                            </Button>
                          ) : null}
                          {selectedProjectTask.status === "queued" || selectedProjectTask.status === "running" ? (
                            <Button size="sm" variant="ghost" data-builder-cancel-selected-task={selectedProjectTask.id} onClick={() => void cancelProjectTask(selectedProjectTask)}>
                              取消任务
                            </Button>
                          ) : null}
                          {selectedProjectTask.logPath ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              data-builder-open-selected-task-log={selectedProjectTask.id}
                              onClick={() => void openLocalArtifact(selectedProjectTask.logPath ?? "")}
                            >
                              <FileJson aria-hidden className="size-4" />
                              打开日志
                            </Button>
                          ) : null}
                          {["failed", "skipped", "canceled"].includes(selectedProjectTask.status) ? (
                            <Button size="sm" variant="secondary" data-builder-retry-selected-task={selectedProjectTask.id} onClick={() => retryProjectTask(selectedProjectTask)}>
                              <RotateCcw aria-hidden className="size-4" />
                              重试
                            </Button>
                          ) : null}
                        </div>
                        <div className="mt-4" data-builder-task-log-search="">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="font-medium text-on-surface">Log preview</p>
                            <span className="text-[0.68rem] text-on-surface-variant">
                              {projectTaskLogSearchQuery ? `${selectedProjectTaskLogMatchCount} match` : `${selectedProjectTaskLogLines.length} lines`}
                            </span>
                          </div>
                          <div className="relative">
                            <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                            <Input
                              inputSize="sm"
                              className="pl-8"
                              value={projectTaskLogSearchQuery}
                              onChange={(event) => setProjectTaskLogSearchQuery(event.target.value)}
                              placeholder="Search this log..."
                              aria-label="Search selected task log"
                              disabled={!selectedProjectTask.logPreview}
                            />
                          </div>
                          {selectedProjectTask.logPreview ? (
                            <div className="mt-2 max-h-44 overflow-auto rounded-xl bg-surface-container-low py-2 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                              {selectedProjectTaskLogLines.length ? (
                                selectedProjectTaskLogLines.map((line) => (
                                  <div
                                    key={line.id}
                                    className={cn(
                                      "grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2 px-2 py-0.5",
                                      line.matched && "bg-primary/10 text-on-surface",
                                    )}
                                  >
                                    <span className="select-none text-right text-on-surface-variant">{line.number}</span>
                                    <span className="whitespace-pre-wrap break-words">{line.text}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="px-3 py-2 text-on-surface-variant">No matching log lines.</p>
                              )}
                            </div>
                          ) : (
                            <div className="mt-2 rounded-xl border border-dashed border-outline-variant p-3 text-center leading-5 text-on-surface-variant">
                              这个任务还没有写入日志预览。
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-outline-variant p-4 text-center text-xs leading-5 text-on-surface-variant">
                    还没有任务。点击检查、验证、构建或 Project Jump action 后会进入这里。
                  </div>
                )}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    data-builder-clear-task-filters=""
                    disabled={!projectTaskSearchQuery && projectTaskStatusFilter === "all" && projectTaskKindFilter === "all" && !projectTaskLogSearchQuery}
                    onClick={() => {
                      setProjectTaskSearchQuery("");
                      setProjectTaskStatusFilter("all");
                      setProjectTaskKindFilter("all");
                      setProjectTaskLogSearchQuery("");
                    }}
                  >
                    清理筛选
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-builder-clear-completed-tasks=""
                    disabled={completedProjectTaskCount === 0}
                    onClick={clearCompletedProjectTasks}
                  >
                    清理已完成 {completedProjectTaskCount}
                  </Button>
                </div>
              </section>
              <section className="rounded-[22px] bg-surface-container-low p-3" data-builder-release-pipelines="">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Release Pipelines</h3>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                      每次运行 preset 都会归档为一条流水线，聚合步骤、日志、失败点和最终产物。
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={latestReleasePipeline ? projectTaskStatusVariant(latestReleasePipeline.status as ProjectTaskStatus) : "outline"}>
                      {latestReleasePipeline ? latestReleasePipeline.status : "empty"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      data-builder-refresh-release-pipelines=""
                      loading={refreshingPipelineRecords}
                      disabled={refreshingPipelineRecords || !activeProject.rootPath}
                      onClick={() => void refreshReleasePipelineRecords(activeProject)}
                    >
                      <RotateCcw aria-hidden className="size-4" />
                      刷新
                    </Button>
                  </div>
                </div>
                {activeProject.releasePipelineHistory?.length ? (
                  <div className="space-y-3">
                    {activeProject.releasePipelineHistory.slice(0, 4).map((entry) => (
                      <article key={entry.id} className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs" data-builder-release-pipeline={entry.id}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-medium text-on-surface">{entry.presetTitle}</p>
                              <Badge variant="outline">{entry.presetBadge}</Badge>
                              <Badge variant={projectTaskStatusVariant(entry.status as ProjectTaskStatus)}>{entry.status}</Badge>
                            </div>
                            <p className="mt-1 text-[0.68rem] text-on-surface-variant">
                              {validationTimeLabel(entry.startedAt ?? entry.createdAt)}
                              {entry.finishedAt ? ` -> ${validationTimeLabel(entry.finishedAt)}` : ""}
                            </p>
                          </div>
                          <div className="min-w-[8rem] text-right">
                            <p className="font-medium text-on-surface">
                              {entry.succeededCount + entry.skippedCount + entry.failedCount + entry.canceledCount}/{entry.stepCount} steps
                            </p>
                            <Progress className="mt-2 h-1.5" value={projectTaskProgress(entry.status as ProjectTaskStatus)} />
                          </div>
                        </div>
                        <p className="mt-2 line-clamp-2 leading-5 text-on-surface-variant">
                          {entry.releaseAppName} v{entry.releaseVersion} · {entry.summary}
                        </p>
                        {entry.recordPath ? (
                          <p className="mt-2 break-all rounded-xl bg-surface-container-low p-2 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                            record: {entry.recordPath}
                          </p>
                        ) : null}
                        <div className="mt-3 grid gap-1.5">
                          {entry.steps.map((step, index) => (
                            <div
                              key={step.id}
                              className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-surface-container-low px-2 py-1.5 text-[0.68rem]"
                              data-builder-release-pipeline-step={`${entry.id}-${step.id}`}
                            >
                              <span className="text-on-surface-variant">{index + 1}</span>
                              <div className="min-w-0">
                                <p className="truncate text-on-surface">
                                  {step.title}
                                  {step.summary ? <span className="text-on-surface-variant"> · {step.summary}</span> : null}
                                </p>
                                {step.artifactEvidence ? (
                                  <p className="truncate text-on-surface-variant">
                                    artifact:{" "}
                                    {step.artifactEvidence.exists
                                      ? `${byteSizeLabel(step.artifactEvidence.sizeBytes)}${step.artifactEvidence.sha256 ? ` · sha256 ${step.artifactEvidence.sha256.slice(0, 12)}` : ""}`
                                      : "missing"}
                                  </p>
                                ) : step.inputSnapshot ? (
                                  <p className="truncate text-on-surface-variant">
                                    input: {step.inputSnapshot.fileCount} files · {step.inputSnapshot.controlCount} controls · {step.inputSnapshot.projectSnapshotHash}
                                  </p>
                                ) : null}
                              </div>
                              <Badge variant={projectTaskStatusVariant(step.status as ProjectTaskStatus)}>{step.status}</Badge>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            data-builder-rerun-release-pipeline={entry.id}
                            disabled={entry.steps.length === 0}
                            onClick={() => rerunReleasePipeline(entry)}
                          >
                            <Play aria-hidden className="size-4" />
                            重跑全部
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-rerun-release-pipeline-from-failure={entry.id}
                            disabled={!entry.steps.some((step) => step.status === "failed" || step.status === "canceled")}
                            onClick={() => rerunReleasePipelineFromFailure(entry)}
                          >
                            <RotateCcw aria-hidden className="size-4" />
                            从失败处重跑
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            data-builder-open-release-pipeline-record={entry.id}
                            disabled={!entry.recordPath}
                            onClick={() => void openLocalArtifact(entry.recordPath ?? "")}
                          >
                            <FileJson aria-hidden className="size-4" />
                            打开记录
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-open-release-pipeline-artifact={entry.id}
                            disabled={!entry.artifactPath && !entry.outputExePath && !entry.bundleManifestPath}
                            onClick={() => void openLocalArtifact(entry.artifactPath || entry.outputExePath || entry.bundleManifestPath || "")}
                          >
                            <FolderOpen aria-hidden className="size-4" />
                            打开产物
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-open-release-pipeline-log={entry.id}
                            disabled={!entry.logPath}
                            onClick={() => void openLocalArtifact(entry.logPath ?? "")}
                          >
                            <FileJson aria-hidden className="size-4" />
                            打开日志
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-open-latest-release-pipeline={entry.id}
                            disabled={!entry.latestRecordPath}
                            onClick={() => void openLocalArtifact(entry.latestRecordPath ?? "")}
                          >
                            latest
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-outline-variant p-4 text-center text-xs leading-5 text-on-surface-variant">
                    还没有发布流水线。运行 Design preflight、Release exe 或 Installer bundle preset 后会在这里留下完整记录。
                  </div>
                )}
              </section>
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                <Button variant="secondary" data-builder-save-disk="" onClick={() => enqueueProjectTask("save-project")} loading={diskBusy}>
                  <Save aria-hidden className="size-4" />
                  保存
                </Button>
                <Button variant="secondary" data-builder-validate-window="" onClick={() => enqueueProjectTask("validate-window")} loading={validatingWindow} disabled={bundling || building}>
                  <CheckCircle2 aria-hidden className="size-4" />
                  验证
                </Button>
                <Button data-builder-run-build="" onClick={() => enqueueProjectTask("build-exe")} loading={building} disabled={bundling}>
                  <Download aria-hidden className="size-4" />
                  exe
                </Button>
                <Button data-builder-run-bundle="" onClick={() => enqueueProjectTask("bundle-installer")} loading={bundling} disabled={building}>
                  <Box aria-hidden className="size-4" />
                  打包
                </Button>
              </div>
            </aside>
            <section className="space-y-4">
              <div className="rounded-[24px] border border-outline-variant bg-surface-container-low p-4" data-builder-generated-file-preview="">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-sm font-medium">Generated file plan</h2>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                      构建前预览 Nova 将写入的 manifest、UI、Rust module、Cargo 和 Tauri app 文件，并标记新增或更新。
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      data-builder-select-changed-generated-files=""
                      disabled={!generatedFilePreview || applyingGeneratedFiles}
                      onClick={selectChangedGeneratedPreviewPaths}
                    >
                      选中变更
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      data-builder-clear-generated-file-selection=""
                      disabled={!generatedFilePreview || applyingGeneratedFiles}
                      onClick={() => setSelectedGeneratedPreviewPaths([])}
                    >
                      清空
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      data-builder-apply-generated-files=""
                      loading={applyingGeneratedFiles}
                      disabled={applyingGeneratedFiles || previewingGeneratedFiles || selectedGeneratedPreviewPaths.length === 0}
                      onClick={() => enqueueProjectTask("apply-generated-files")}
                    >
                      <Save aria-hidden className="size-4" />
                      应用选中 {selectedGeneratedPreviewPaths.length}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      data-builder-apply-generated-changes=""
                      loading={applyingGeneratedFiles || previewingGeneratedFiles}
                      disabled={applyingGeneratedFiles || previewingGeneratedFiles || building || bundling || validatingWindow}
                      onClick={() => enqueueProjectTask("apply-generated-changes")}
                    >
                      <Download aria-hidden className="size-4" />
                      应用全部变更
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      data-builder-refresh-generated-file-preview=""
                      loading={previewingGeneratedFiles}
                      disabled={previewingGeneratedFiles || applyingGeneratedFiles || building || bundling || validatingWindow}
                      onClick={() => enqueueProjectTask("preview-generated-files")}
                    >
                      <FileJson aria-hidden className="size-4" />
                      刷新预览
                    </Button>
                  </div>
                </div>
                <div className="mb-4 rounded-2xl border border-outline-variant bg-surface-container p-3" data-builder-change-impact="">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Incremental impact</h3>
                        <Badge variant={projectChangeImpactStatusVariant(projectChangeImpact.status)}>
                          {projectChangeImpactStatusLabel(projectChangeImpact.status)}
                        </Badge>
                        <Badge variant="outline">{projectChangeImpact.currentSnapshotHash}</Badge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-on-surface-variant">{projectChangeImpact.summary}</p>
                      {projectChangeImpact.previewSnapshotHash ? (
                        <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface-variant">
                          preview {projectChangeImpact.previewSnapshotHash}
                          {projectChangeImpact.previewRootPath ? ` · ${projectChangeImpact.previewRootPath}` : ""}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        data-builder-run-change-impact-plan=""
                        disabled={
                          !projectChangeImpact.executionPlan.ready ||
                          previewingGeneratedFiles ||
                          applyingGeneratedFiles ||
                          building ||
                          bundling ||
                          validatingWindow
                        }
                        onClick={runProjectChangeImpactPlan}
                      >
                        <Play aria-hidden className="size-4" />
                        Run plan
                      </Button>
                      {projectChangeImpact.recommendedActions.slice(0, 4).map((actionId) => (
                        <Button
                          key={actionId}
                          size="sm"
                          variant={actionId === "apply-generated-changes" ? "secondary" : "ghost"}
                          data-builder-change-impact-action={actionId}
                          disabled={
                            (actionId === "apply-generated-changes" && (!generatedFilePreview || projectChangeImpact.previewIsStale)) ||
                            previewingGeneratedFiles ||
                            applyingGeneratedFiles
                          }
                          onClick={() => enqueueProjectTask(actionId)}
                        >
                          {projectTaskDefinitions[actionId].title}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl bg-surface-container-low px-3 py-2 text-xs" data-builder-change-impact-plan="">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-on-surface">{projectChangeImpact.executionPlan.title}</p>
                          <Badge variant="outline">{projectChangeImpact.executionPlan.badge}</Badge>
                          <span className="text-[0.68rem] text-on-surface-variant">
                            {projectChangeImpact.executionPlan.actions.length} action(s)
                          </span>
                        </div>
                        <p className="mt-1 leading-5 text-on-surface-variant">{projectChangeImpact.executionPlan.detail}</p>
                      </div>
                      <div className="flex max-w-full flex-wrap gap-1.5">
                        {projectChangeImpact.executionPlan.actions.map((actionId, index) => (
                          <span key={`${actionId}-${index}`} className="rounded-full bg-surface-container px-2 py-1 text-[0.68rem] text-on-surface-variant">
                            {index + 1}. {projectTaskDefinitions[actionId].title}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 rounded-xl bg-surface-container-low px-3 py-2 text-xs" data-builder-dependency-graph="">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-on-surface">Persisted dependency graph</p>
                          <Badge variant={projectDependencyGraph ? dependencyGraphEventStatusVariant(projectDependencyGraph.lastEvent.status) : "outline"}>
                            {projectDependencyGraph ? projectDependencyGraph.lastEvent.kind : "empty"}
                          </Badge>
                          {writingDependencyGraph ? <Badge variant="outline">writing</Badge> : null}
                        </div>
                        <p className="mt-1 line-clamp-2 leading-5 text-on-surface-variant">
                          {projectDependencyGraph
                            ? `${projectDependencyGraph.summary} ${projectDependencyGraph.dirtyScopeCount} dirty scope(s), ${projectDependencyGraph.executionPlan.actions.length} planned action(s).`
                            : activeProject.rootPath
                              ? "No dependency graph has been written for this project yet."
                              : "Save the project to disk before Nova can persist dependency graph metadata."}
                        </p>
                        {projectDependencyGraph?.recordPath ? (
                          <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface-variant">
                            {projectDependencyGraph.recordPath}
                            {projectDependencyGraph.recordWrittenAt ? ` · ${validationTimeLabel(projectDependencyGraph.recordWrittenAt)}` : ""}
                          </p>
                        ) : null}
                        {projectDependencySources.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5" data-builder-dependency-sources="">
                            {projectDependencySources.slice(0, 6).map((source) => (
                              <button
                                key={source.id}
                                type="button"
                                className="max-w-full truncate rounded-full bg-surface-container px-2 py-1 text-[0.68rem] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                title={`${source.kind}: ${source.detail}`}
                                onClick={() => focusProjectDependencySourceRef(source)}
                              >
                                {source.label}
                              </button>
                            ))}
                            {projectDependencySources.length > 6 ? (
                              <span className="rounded-full bg-surface-container px-2 py-1 text-[0.68rem] text-on-surface-variant">
                                +{projectDependencySources.length - 6}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={refreshingDependencyGraph}
                          disabled={!activeProject.rootPath || refreshingDependencyGraph}
                          data-builder-refresh-dependency-graph=""
                          onClick={() => void refreshProjectDependencyGraph(activeProject)}
                        >
                          <RotateCcw aria-hidden className="size-4" />
                          刷新
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!projectDependencyGraph?.recordPath}
                          data-builder-open-dependency-graph=""
                          onClick={() => void openLocalArtifact(projectDependencyGraph?.recordPath ?? "")}
                        >
                          <FileJson aria-hidden className="size-4" />
                          打开
                        </Button>
                      </div>
                    </div>
                    {projectDependencyValidity.length > 0 ? (
                      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3" data-builder-dependency-validity="">
                        {projectDependencyValidity.map((entry) => (
                          <article key={entry.id} className="rounded-lg bg-surface-container px-2.5 py-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate font-medium text-on-surface">{entry.label}</p>
                                <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface-variant">{entry.snapshotHash}</p>
                              </div>
                              <Badge variant={dependencyValidityStatusVariant(entry.validityStatus)}>{entry.validityStatus}</Badge>
                            </div>
                            <p className="mt-2 line-clamp-2 leading-5 text-on-surface-variant">{entry.statusSummary}</p>
                            <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                              {validationTimeLabel(entry.recordedAt)}
                              {entry.artifactPath ? ` · ${fileNameFromPath(entry.artifactPath)}` : ""}
                            </p>
                          </article>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-3 rounded-xl bg-surface-container-low px-3 py-2 text-xs" data-builder-reverse-dependencies="">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-on-surface">Selected source impact</p>
                          <Badge variant="outline">{reverseDependencySummaries.length} tracked source(s)</Badge>
                        </div>
                        <p className="mt-1 leading-5 text-on-surface-variant">
                          反向查看当前选中控件、Rust 逻辑或发布配置会影响哪些生成文件、检查和构建动作。
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-builder-refresh-reverse-dependencies=""
                        disabled={previewingGeneratedFiles || applyingGeneratedFiles || building || bundling || validatingWindow}
                        onClick={() => enqueueProjectTask("preview-generated-files")}
                      >
                        <RotateCcw aria-hidden className="size-4" />
                        刷新影响
                      </Button>
                    </div>
                    {reverseDependencySummaries.length > 0 ? (
                      <div className="mt-3 grid gap-2 lg:grid-cols-2 2xl:grid-cols-4">
                        {reverseDependencySummaries.map((summary) =>
                          summary.target ? (
                            <article
                              key={`${summary.target.kind}-${summary.target.id}`}
                              className="rounded-lg border border-outline-variant bg-surface-container p-2.5"
                              data-builder-reverse-dependency={summary.target.id}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <Badge variant="outline">{reverseDependencyTargetKindLabel(summary.target.kind)}</Badge>
                                    <Badge variant={reverseDependencyStatusVariant(summary.status)}>{reverseDependencyStatusLabel(summary.status)}</Badge>
                                  </div>
                                  <p className="mt-2 truncate font-medium text-on-surface">{summary.target.label}</p>
                                  <p className="mt-1 line-clamp-2 leading-5 text-on-surface-variant">{summary.summary}</p>
                                </div>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  aria-label={`定位 ${summary.target.label}`}
                                  onClick={() => focusProjectReverseDependencyTarget(summary.target!)}
                                >
                                  <CornerDownRight aria-hidden className="size-4" />
                                </Button>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {summary.scopeIds.slice(0, 4).map((scopeId) => (
                                  <span key={scopeId} className="rounded-full bg-surface-container-high px-2 py-1 text-[0.68rem] text-on-surface-variant">
                                    {scopeId}
                                  </span>
                                ))}
                                {summary.scopeIds.length > 4 ? (
                                  <span className="rounded-full bg-surface-container-high px-2 py-1 text-[0.68rem] text-on-surface-variant">
                                    +{summary.scopeIds.length - 4}
                                  </span>
                                ) : null}
                              </div>
                              {summary.affectedPaths.length > 0 ? (
                                <div className="mt-2 space-y-1">
                                  {summary.affectedPaths.slice(0, 3).map((path) => (
                                    <p key={path} className="truncate font-mono text-[0.68rem] text-on-surface-variant" title={path}>
                                      {path}
                                    </p>
                                  ))}
                                </div>
                              ) : null}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  data-builder-select-reverse-dependency={summary.target.id}
                                  disabled={summary.affectedPaths.length === 0}
                                  onClick={() => selectProjectReverseDependencyOutputs(summary)}
                                >
                                  选择目标
                                </Button>
                                {summary.plannedActions.slice(0, 1).map((actionId) => (
                                  <Button
                                    key={actionId}
                                    size="sm"
                                    variant={actionId === "apply-generated-changes" ? "secondary" : "ghost"}
                                    data-builder-run-reverse-dependency-action={`${summary.target?.id}-${actionId}`}
                                    disabled={
                                      (actionId === "apply-generated-changes" && (!generatedFilePreview || projectChangeImpact.previewIsStale)) ||
                                      previewingGeneratedFiles ||
                                      applyingGeneratedFiles
                                    }
                                    onClick={() => enqueueProjectTask(actionId)}
                                  >
                                    {projectTaskDefinitions[actionId].title}
                                  </Button>
                                ))}
                              </div>
                            </article>
                          ) : null,
                        )}
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2 2xl:grid-cols-4">
                    {projectChangeImpact.scopes.map((scope) => (
                      <article
                        key={scope.id}
                        className={cn(
                          "rounded-xl border p-3 text-xs",
                          scope.status === "dirty"
                            ? "border-primary/50 bg-primary/10"
                            : "border-outline-variant bg-surface-container-low",
                        )}
                        data-builder-change-scope={scope.id}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-on-surface">{scope.label}</p>
                            <p className="mt-1 text-[0.68rem] text-on-surface-variant">
                              {scope.changedCount}/{scope.totalCount} changed
                            </p>
                          </div>
                          <Badge variant={projectChangeScopeStatusVariant(scope)}>{scope.status}</Badge>
                        </div>
                        <p className="mt-2 line-clamp-2 leading-5 text-on-surface-variant">{scope.summary}</p>
                        {scope.examples.length > 0 ? (
                          <div className="mt-2 space-y-1">
                            {scope.examples.map((path) => (
                              <p key={path} className="truncate font-mono text-[0.68rem] text-on-surface-variant">
                                {path}
                              </p>
                            ))}
                          </div>
                        ) : null}
                        {scope.sourceRefs.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5" data-builder-change-scope-sources={scope.id}>
                            {scope.sourceRefs.slice(0, 5).map((source) => (
                              <button
                                key={source.id}
                                type="button"
                                className="max-w-full truncate rounded-full bg-surface-container-high px-2 py-1 text-[0.68rem] text-on-surface-variant transition hover:bg-surface-container-highest hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                title={`${source.kind}: ${source.detail}`}
                                data-builder-change-source={source.id}
                                onClick={() => focusProjectDependencySourceRef(source)}
                              >
                                {source.label}
                              </button>
                            ))}
                            {scope.sourceRefs.length > 5 ? (
                              <span className="rounded-full bg-surface-container px-2 py-1 text-[0.68rem] text-on-surface-variant">
                                +{scope.sourceRefs.length - 5}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-select-change-scope={scope.id}
                            disabled={scope.paths.length === 0 || applyingGeneratedFiles}
                            onClick={() => selectGeneratedChangeScope(scope)}
                          >
                            选择
                          </Button>
                          {scope.nextActions.slice(0, 1).map((actionId) => (
                            <Button
                              key={actionId}
                              size="sm"
                              variant="ghost"
                              data-builder-run-change-scope-action={`${scope.id}-${actionId}`}
                              disabled={
                                actionId === "apply-generated-changes" &&
                                (!generatedFilePreview || projectChangeImpact.previewIsStale)
                              }
                              onClick={() => enqueueProjectTask(actionId)}
                            >
                              {projectTaskDefinitions[actionId].title}
                            </Button>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
                {generatedFilePreview ? (
                  <div className="space-y-3">
                    <div className="grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-6">
                      {[
                        ["targets", generatedFilePreview.total_count],
                        ["changed", generatedFilePreview.changed_count],
                        ["selected", selectedGeneratedPreviewPaths.length],
                        ["create", generatedFilePreview.created_count],
                        ["update", generatedFilePreview.updated_count],
                        ["assets", generatedFilePreview.asset_count],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl bg-surface-container p-3">
                          <p className="font-medium text-on-surface">{value}</p>
                          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="break-all rounded-2xl bg-surface-container px-3 py-2 font-mono text-[0.68rem] text-on-surface-variant">
                      {generatedFilePreview.root_path}
                    </p>
                    {generatedFileApplyResult ? (
                      <div className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                          <p className="leading-5 text-on-surface-variant">{generatedFileApplyResult.summary}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-open-generated-apply-snapshot=""
                            onClick={() => void openLocalArtifact(generatedFileApplyResult.checkpoint_path)}
                          >
                            <FolderOpen aria-hidden className="size-4" />
                            打开快照
                          </Button>
                        </div>
                      </div>
                    ) : null}
                    <div className="grid gap-3 xl:grid-cols-[340px_minmax(0,1fr)]">
                      <div className="max-h-[460px] space-y-2 overflow-auto pr-1">
                        {generatedFilePreview.entries.map((entry) => (
                          <article
                            key={entry.relative_path}
                            data-builder-generated-file={entry.relative_path}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-2xl border p-3 text-left text-xs transition",
                              activeGeneratedPreviewEntry?.relative_path === entry.relative_path
                                ? "border-primary bg-primary/10 text-on-surface shadow-m3-1"
                                : "border-outline-variant bg-surface-container text-on-surface-variant hover:border-outline hover:bg-surface-container-high",
                            )}
                          >
                            <Checkbox
                              className="mt-0.5"
                              aria-label={`选择 ${entry.relative_path}`}
                              data-builder-generated-file-selected={entry.relative_path}
                              checked={selectedGeneratedPreviewPathSet.has(entry.relative_path)}
                              onCheckedChange={(checked) => toggleGeneratedPreviewPath(entry.relative_path, Boolean(checked))}
                            />
                            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setActiveGeneratedPreviewPath(entry.relative_path)}>
                              <div className="mb-2 flex items-start justify-between gap-2">
                                <span className="min-w-0 truncate font-mono text-[0.72rem]">{entry.relative_path}</span>
                                <Badge
                                  variant={
                                    entry.status === "update"
                                      ? "outline"
                                      : entry.status === "create" || entry.status === "copy"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  {entry.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[0.68rem]">
                                <span className="rounded-full bg-surface-container-high px-2 py-0.5">{entry.kind}</span>
                                <span>{entry.line_count ? `${entry.line_count} lines` : entry.exists ? "exists" : "planned"}</span>
                                {entry.changed ? <span className="text-primary">changed</span> : null}
                              </div>
                            </button>
                          </article>
                        ))}
                      </div>
                      <div className="min-w-0 rounded-2xl border border-outline-variant bg-surface-container p-3">
                        {activeGeneratedPreviewEntry ? (
                          <div className="space-y-3">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0">
                                <p className="truncate font-mono text-xs font-medium">{activeGeneratedPreviewEntry.relative_path}</p>
                                <p className="mt-1 text-xs leading-5 text-on-surface-variant">{activeGeneratedPreviewEntry.summary}</p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <Badge variant={activeGeneratedPreviewEntry.changed ? "secondary" : "outline"}>
                                  {activeGeneratedPreviewEntry.status}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  data-builder-open-generated-file-preview=""
                                  disabled={!activeGeneratedPreviewEntry.exists}
                                  onClick={() => void openLocalArtifact(activeGeneratedPreviewEntry.path)}
                                >
                                  <FolderOpen aria-hidden className="size-4" />
                                  打开
                                </Button>
                              </div>
                            </div>
                            <p className="break-all rounded-xl bg-surface-container-high px-3 py-2 font-mono text-[0.68rem] text-on-surface-variant">
                              {activeGeneratedPreviewEntry.path}
                            </p>
                            <pre className="max-h-[320px] overflow-auto rounded-xl bg-surface-container-highest p-3 font-mono text-[0.68rem] leading-5 text-on-surface-variant">
                              {activeGeneratedPreviewEntry.preview}
                            </pre>
                          </div>
                        ) : (
                          <p className="rounded-xl bg-surface-container-high px-3 py-2 text-xs leading-5 text-on-surface-variant">
                            点击“文件预览”后，这里会显示将要写入的目标文件。
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container p-4 text-xs leading-5 text-on-surface-variant">
                    尚未生成文件计划。点击“文件预览”可以在写盘和构建前查看目标文件树。
                  </div>
                )}
              </div>
              <div className="rounded-[24px] border border-outline-variant bg-surface-container-low p-4" data-builder-release-readiness="">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-sm font-medium">Release readiness</h2>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                      汇总构建、验证、签名、运行、smoke 和回滚证据，判断这个项目离可发布版本还有多远。
                    </p>
                  </div>
                  <Badge
                    variant={
                      releaseReadinessSummary.status === "error"
                        ? "destructive"
                        : releaseReadinessSummary.status === "warning"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {releaseReadinessSummary.status === "error" ? "blocked" : releaseReadinessSummary.status}
                  </Badge>
                </div>
                <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="rounded-2xl bg-surface-container p-4">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">Release score</p>
                    <p className="mt-3 text-4xl font-semibold tracking-normal">{releaseReadinessSummary.score}%</p>
                    <Progress className="mt-3" value={releaseReadinessSummary.score} />
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[0.68rem]">
                      <span className="rounded-xl bg-surface-container-low px-2 py-1">{releaseReadinessSummary.blockers} blockers</span>
                      <span className="rounded-xl bg-surface-container-low px-2 py-1">{releaseReadinessSummary.warnings} warnings</span>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    {releaseReadinessSummary.items.map((item) => (
                      <article key={item.id} className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            {item.severity === "ready" ? (
                              <CheckCircle2 aria-hidden className="size-3.5 shrink-0 text-primary" />
                            ) : (
                              <AlertTriangle
                                aria-hidden
                                className={cn("size-3.5 shrink-0", item.severity === "error" ? "text-destructive" : "text-on-surface-variant")}
                              />
                            )}
                            <span className="truncate font-medium">{item.title}</span>
                          </div>
                          <Badge variant={item.severity === "error" ? "destructive" : item.severity === "warning" ? "outline" : "secondary"}>
                            {item.score}%
                          </Badge>
                        </div>
                        <p className="line-clamp-3 leading-5 text-on-surface-variant">{item.detail}</p>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="font-medium">Next actions</h3>
                    <Badge variant={releaseReadinessActionItems.length ? "outline" : "secondary"}>
                      {releaseReadinessActionItems.length || "clear"}
                    </Badge>
                  </div>
                  {releaseReadinessActionItems.length ? (
                    <div className="grid gap-2 md:grid-cols-3">
                      {releaseReadinessActionItems.map((item) => (
                        <div key={item.id} className="flex min-h-28 flex-col justify-between gap-3 rounded-xl bg-surface-container-high p-3">
                          <div className="min-w-0">
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <p className="truncate font-medium text-on-surface">{item.title}</p>
                              <Badge variant={item.severity === "error" ? "destructive" : "outline"}>{item.score}%</Badge>
                            </div>
                            <p className="line-clamp-3 leading-5 text-on-surface-variant">{item.detail}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full justify-center"
                            data-builder-release-action={item.id}
                            loading={releaseActionButtonLoading(item)}
                            disabled={releaseActionButtonDisabled(item)}
                            onClick={() => runReleaseReadinessAction(item)}
                          >
                            <Play aria-hidden className="size-3.5" />
                            {releaseActionButtonLabel(item)}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl bg-surface-container-high px-3 py-2 leading-5 text-on-surface-variant">
                      发布证据完整。可以继续做最终 smoke、签名和安装包分发检查。
                    </p>
                  )}
                </div>
              </div>
              <div className="rounded-[24px] border border-outline-variant bg-surface-container-low p-4" data-builder-visual-audit="">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-sm font-medium">目标窗口视觉校验</h2>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">在编译前检查生成窗口的溢出、重叠、尺寸、文本和 Frame 布局风险。</p>
                  </div>
                  <Badge
                    variant={
                      windowVisualAudit.errorCount > 0
                        ? "destructive"
                        : windowVisualAudit.warningCount > 0
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {windowVisualAudit.score}%
                  </Badge>
                </div>
                <Progress value={windowVisualAudit.score} />
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                  <div className="rounded-2xl bg-surface-container p-3">
                    <p className="font-medium">{windowVisualAudit.checkedFiles}</p>
                    <p className="mt-1 text-[0.68rem] text-on-surface-variant">files</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container p-3">
                    <p className="font-medium">{windowVisualAudit.checkedItems}</p>
                    <p className="mt-1 text-[0.68rem] text-on-surface-variant">controls</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container p-3">
                    <p className="font-medium text-destructive">{windowVisualAudit.errorCount}</p>
                    <p className="mt-1 text-[0.68rem] text-on-surface-variant">errors</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container p-3">
                    <p className="font-medium">{windowVisualAudit.warningCount}</p>
                    <p className="mt-1 text-[0.68rem] text-on-surface-variant">warnings</p>
                  </div>
                </div>
                {windowVisualAudit.issues.length === 0 ? (
                  <div className="mt-3 flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs text-on-surface-variant">
                    <CheckCircle2 aria-hidden className="size-4 text-primary" />
                    当前目标窗口没有发现明显视觉风险。
                  </div>
                ) : (
                  <div className="mt-3 grid max-h-72 gap-2 overflow-auto pr-1 md:grid-cols-2">
                    {windowVisualAudit.issues.map((issue) => (
                      <article key={issue.id} className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <AlertTriangle
                              aria-hidden
                              className={cn("size-3.5 shrink-0", issue.severity === "error" ? "text-destructive" : "text-on-surface-variant")}
                            />
                            <span className="truncate font-medium">{issue.title}</span>
                          </div>
                          <Badge variant={issue.severity === "error" ? "destructive" : "outline"}>{issue.severity}</Badge>
                        </div>
                        <p className="leading-5 text-on-surface-variant">{issue.detail}</p>
                        <p className="mt-2 truncate font-mono text-[0.68rem] text-on-surface-variant">
                          {issue.fileName}
                          {issue.itemName ? ` / ${issue.itemName}` : ""}
                        </p>
                        <Button
                          className="mt-3 w-full"
                          size="sm"
                          variant="secondary"
                          data-builder-focus-audit-issue={issue.id}
                          onClick={() => focusVisualAuditIssue(issue)}
                        >
                          <MousePointer2 aria-hidden className="size-4" />
                          定位问题
                        </Button>
                      </article>
                    ))}
                  </div>
                )}
                {activeProject.validationReportPath ? (
                  <div className="mt-3 rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                    <div className="mb-1 flex items-center gap-2 font-medium">
                      <CheckCircle2 aria-hidden className="size-4 text-primary" />
                      生成窗口验证报告已就绪
                    </div>
                    <p className="break-all font-mono text-[0.68rem] text-on-surface-variant">{activeProject.validationReportPath}</p>
                    {activeProject.validationSnapshotPath ? (
                      <p className="mt-1 break-all font-mono text-[0.68rem] text-on-surface-variant">{activeProject.validationSnapshotPath}</p>
                    ) : null}
                    {activeProject.validationScreenshotPath ? (
                      <p className="mt-1 break-all font-mono text-[0.68rem] text-on-surface-variant">{activeProject.validationScreenshotPath}</p>
                    ) : null}
                    {activeProject.validationScreenshotAnalysisPath ? (
                      <p className="mt-1 break-all font-mono text-[0.68rem] text-on-surface-variant">{activeProject.validationScreenshotAnalysisPath}</p>
                    ) : null}
                    {activeProject.validationRuntimeAuditPath ? (
                      <p className="mt-1 break-all font-mono text-[0.68rem] text-on-surface-variant">{activeProject.validationRuntimeAuditPath}</p>
                    ) : null}
                    {activeProject.validationBreakpointPath ? (
                      <p className="mt-1 break-all font-mono text-[0.68rem] text-on-surface-variant">{activeProject.validationBreakpointPath}</p>
                    ) : null}
                    <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-6">
                      <Button
                        size="sm"
                        variant="secondary"
                        data-builder-open-validation-report=""
                        onClick={() => void openLocalArtifact(activeProject.validationReportPath ?? "")}
                      >
                        <FileJson aria-hidden className="size-4" />
                        打开报告
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        data-builder-open-validation-screenshot=""
                        disabled={!activeProject.validationScreenshotPath}
                        onClick={() => void openLocalArtifact(activeProject.validationScreenshotPath ?? "")}
                      >
                        <FileImage aria-hidden className="size-4" />
                        打开截图
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        data-builder-open-validation-analysis=""
                        disabled={!activeProject.validationScreenshotAnalysisPath}
                        onClick={() => void openLocalArtifact(activeProject.validationScreenshotAnalysisPath ?? "")}
                      >
                        <FileJson aria-hidden className="size-4" />
                        打开分析
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        data-builder-open-runtime-audit=""
                        disabled={!activeProject.validationRuntimeAuditPath}
                        onClick={() => void openLocalArtifact(activeProject.validationRuntimeAuditPath ?? "")}
                      >
                        <FileJson aria-hidden className="size-4" />
                        打开 DOM
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        data-builder-open-breakpoint-validation=""
                        disabled={!activeProject.validationBreakpointPath}
                        onClick={() => void openLocalArtifact(activeProject.validationBreakpointPath ?? "")}
                      >
                        <FileJson aria-hidden className="size-4" />
                        打开断点
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-builder-open-validation-snapshot=""
                        disabled={!activeProject.validationSnapshotPath}
                        onClick={() => void openLocalArtifact(activeProject.validationSnapshotPath ?? "")}
                      >
                        <FileImage aria-hidden className="size-4" />
                        打开快照
                      </Button>
                    </div>
                  </div>
                ) : null}
                {activeProject.validationBreakpointPath ? (
                  <section className="mt-3 rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs" data-builder-breakpoint-issues="">
                    <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-medium">断点问题定位</h3>
                        <p className="mt-1 text-on-surface-variant">从 desktop / tablet / mobile 运行时审阅结果反向定位到画布控件。</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Badge variant={breakpointIssues.length > 0 ? "outline" : "secondary"}>
                          {breakpointIssues.length ? `可修复 ${fixableBreakpointIssueCount}/${breakpointIssues.length}` : 0}
                        </Badge>
                        {breakpointIssues.length ? (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              data-builder-fix-all-breakpoint-issues=""
                              disabled={fixableBreakpointIssueCount === 0}
                              onClick={fixAllBreakpointIssues}
                            >
                              <Wand2 aria-hidden className="size-4" />
                              全部修复
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              data-builder-fix-validate-all-breakpoint-issues=""
                              disabled={fixableBreakpointIssueCount === 0}
                              loading={validatingWindow}
                              onClick={() => void fixAllBreakpointIssuesAndValidate()}
                            >
                              <CheckCircle2 aria-hidden className="size-4" />
                              修复并验证
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </div>
                    {breakpointIssues.length ? (
                      <div className="grid max-h-64 gap-2 overflow-auto pr-1 md:grid-cols-2">
                        {breakpointIssues.map((issue) => (
                          <article key={issue.id} className="rounded-2xl border border-outline-variant bg-surface-container-high p-3">
                            <div className="mb-1 flex items-start justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <AlertTriangle
                                  aria-hidden
                                  className={cn("size-3.5 shrink-0", issue.severity === "error" ? "text-destructive" : "text-on-surface-variant")}
                                />
                                <span className="truncate font-medium">{issue.title}</span>
                              </div>
                              <Badge variant={issue.severity === "error" ? "destructive" : "outline"}>{issue.breakpoint}</Badge>
                            </div>
                            <p className="leading-5 text-on-surface-variant">{issue.detail}</p>
                            <p className="mt-2 truncate font-mono text-[0.68rem] text-on-surface-variant">
                              {issue.fileName}
                              {issue.itemName ? ` / ${issue.itemName}` : ""}
                              {issue.itemType ? ` / ${issue.itemType}` : ""}
                            </p>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                data-builder-focus-breakpoint-issue={issue.id}
                                onClick={() => focusBreakpointIssue(issue)}
                              >
                                <MousePointer2 aria-hidden className="size-4" />
                                定位
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                data-builder-fix-breakpoint-issue={issue.id}
                                disabled={!issue.itemId}
                                onClick={() => fixBreakpointIssue(issue)}
                              >
                                <Wand2 aria-hidden className="size-4" />
                                修复
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                data-builder-fix-validate-breakpoint-issue={issue.id}
                                disabled={!issue.itemId}
                                loading={validatingWindow}
                                onClick={() => void fixBreakpointIssueAndValidate(issue)}
                              >
                                <CheckCircle2 aria-hidden className="size-4" />
                                验证
                              </Button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-high p-3 text-on-surface-variant">
                        <CheckCircle2 aria-hidden className="size-4 text-primary" />
                        最近一次多断点运行时审阅没有发现可定位问题。
                      </div>
                    )}
                  </section>
                ) : null}
                {activeProject.validationHistory?.length ? (
                  <section className="mt-3 rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs" data-builder-validation-history="">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-medium">验证历史</h3>
                        <p className="mt-1 text-on-surface-variant">最近 {activeProject.validationHistory.length} 次窗口验证。</p>
                      </div>
                      <Badge variant="outline">{activeProject.validationHistory[0].status}</Badge>
                    </div>
                    <div className="space-y-2">
                      {activeProject.validationHistory.slice(0, 6).map((entry) => (
                        <article key={entry.id} className="rounded-2xl border border-outline-variant bg-surface-container-high p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{validationTimeLabel(entry.createdAt)}</p>
                              <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">{entry.summary}</p>
                            </div>
                            <Badge variant={entry.status === "failed" ? "destructive" : entry.status === "warning" ? "outline" : "secondary"}>
                              {entry.score}%
                            </Badge>
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[0.68rem]">
                            <span className="rounded-xl bg-surface-container-low px-2 py-1">{entry.errorCount} errors</span>
                            <span className="rounded-xl bg-surface-container-low px-2 py-1">{entry.warningCount} warnings</span>
                            <span className="rounded-xl bg-surface-container-low px-2 py-1">{entry.checkedItems} controls</span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 xl:grid-cols-6">
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={!entry.reportPath}
                              onClick={() => void openLocalArtifact(entry.reportPath ?? "")}
                            >
                              <FileJson aria-hidden className="size-4" />
                              报告
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={!entry.screenshotPath}
                              onClick={() => void openLocalArtifact(entry.screenshotPath ?? "")}
                            >
                              <FileImage aria-hidden className="size-4" />
                              截图
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={!entry.screenshotAnalysisPath}
                              onClick={() => void openLocalArtifact(entry.screenshotAnalysisPath ?? "")}
                            >
                              <FileJson aria-hidden className="size-4" />
                              分析
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={!entry.runtimeAuditPath}
                              onClick={() => void openLocalArtifact(entry.runtimeAuditPath ?? "")}
                            >
                              <FileJson aria-hidden className="size-4" />
                              DOM
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={!entry.breakpointValidationPath}
                              onClick={() => void openLocalArtifact(entry.breakpointValidationPath ?? "")}
                            >
                              <FileJson aria-hidden className="size-4" />
                              断点
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={!entry.snapshotPath}
                              onClick={() => void openLocalArtifact(entry.snapshotPath ?? "")}
                            >
                              <FileImage aria-hidden className="size-4" />
                              快照
                            </Button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
              <div className="rounded-[24px] border border-outline-variant bg-surface-container-low p-4" data-builder-activity-timeline="">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-medium">Activity Timeline</h2>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">项目级事件流，聚合验证、构建、运行、日志、smoke 和磁盘检查点。</p>
                  </div>
                  <Badge variant={activityTimeline.length ? "secondary" : "outline"}>{activityTimeline.length}</Badge>
                </div>
                {activityTimeline.length ? (
                  <div className="space-y-2">
                    {activityTimeline.slice(0, 10).map((activity) => (
                      <article key={activity.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                        <div className="mt-1 flex size-7 items-center justify-center rounded-full bg-surface-container-high text-[0.68rem] font-medium uppercase text-on-surface-variant">
                          {activity.kind.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{activity.title}</p>
                              <p className="mt-1 text-[0.68rem] text-on-surface-variant">{validationTimeLabel(activity.time)}</p>
                            </div>
                            <Badge
                              variant={
                                ["failed", "error", "stale"].includes(activity.status)
                                  ? "destructive"
                                  : ["warning", "truncated", "unknown"].includes(activity.status)
                                    ? "outline"
                                    : "secondary"
                              }
                            >
                              {activity.status}
                            </Badge>
                          </div>
                          <p className="mt-2 line-clamp-2 leading-5 text-on-surface-variant">{activity.summary}</p>
                          {activity.path ? (
                            <p className="mt-2 break-all font-mono text-[0.68rem] leading-4 text-on-surface-variant">{activity.path}</p>
                          ) : null}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              data-builder-open-activity-path={activity.id}
                              disabled={!activity.path}
                              onClick={() => void openLocalArtifact(activity.path ?? "")}
                            >
                              <FileJson aria-hidden className="size-4" />
                              打开
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              data-builder-open-activity-secondary={activity.id}
                              disabled={!activity.secondaryPath}
                              onClick={() => void openLocalArtifact(activity.secondaryPath ?? "")}
                            >
                              <FolderOpen aria-hidden className="size-4" />
                              关联
                            </Button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-outline-variant p-5 text-center text-xs leading-5 text-on-surface-variant">
                    还没有项目活动。执行验证、构建、启动或创建磁盘检查点后，这里会显示事件流。
                  </div>
                )}
              </div>
              <div className="rounded-[24px] border border-outline-variant bg-surface-container-low p-4" data-builder-build-history="">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-medium">构建产物历史</h2>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">记录最近生成的 exe、安装包、输出目录和构建时的项目检查状态。</p>
                  </div>
                  <Badge variant={activeProject.buildHistory?.length ? "secondary" : "outline"}>{activeProject.buildHistory?.length ?? 0}</Badge>
                </div>
                {activeProject.buildHistory?.length ? (
                  <div className="grid gap-3 xl:grid-cols-2">
                    {activeProject.buildHistory.slice(0, 6).map((entry) => {
                      const primaryArtifactPath = entry.buildKind === "bundle" ? entry.bundlePaths?.[0] : entry.outputExePath;
                      const artifactDir = entry.buildKind === "bundle" ? entry.bundleDir || entry.outputDir : entry.outputDir;
                      return (
                      <article key={entry.id} className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{entry.label}</p>
                            <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">{validationTimeLabel(entry.createdAt)}</p>
                          </div>
                          <Badge variant="secondary">{entry.buildKind}</Badge>
                        </div>
                        <p className="mt-2 line-clamp-2 leading-5 text-on-surface-variant">{entry.summary}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[0.68rem]">
                          <span className="rounded-xl bg-surface-container-low px-2 py-1 font-mono">v{entry.releaseVersion}</span>
                          <span className="rounded-xl bg-surface-container-low px-2 py-1">{entry.releaseAppName}</span>
                          <span className="rounded-xl bg-surface-container-low px-2 py-1">{entry.releaseBundleTargets}</span>
                          <span className="rounded-xl bg-surface-container-low px-2 py-1">{entry.releaseSigningMode}</span>
                          {entry.generatedTotalCount !== undefined ? (
                            <span className="rounded-xl bg-surface-container-low px-2 py-1">
                              generated {entry.generatedChangedCount ?? 0}/{entry.generatedTotalCount}
                            </span>
                          ) : null}
                          {entry.buildKind === "bundle" ? (
                            <span className="rounded-xl bg-surface-container-low px-2 py-1">
                              smoke {entry.bundleSmokeStatus ?? "unknown"} / {entry.bundleArtifactCount ?? entry.bundlePaths?.length ?? 0}
                            </span>
                          ) : null}
                          {entry.installerSmokeStatus ? (
                            <span className="rounded-xl bg-surface-container-low px-2 py-1">installer {entry.installerSmokeStatus}</span>
                          ) : null}
                          {entry.installerSmokeRunnerMode ? (
                            <span className="rounded-xl bg-surface-container-low px-2 py-1">runner {entry.installerSmokeRunnerMode}</span>
                          ) : null}
                          {entry.launchedPid ? (
                            <span className="rounded-xl bg-surface-container-low px-2 py-1">
                              run {entry.runStatus ?? "launched"} / {entry.launchedPid}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 line-clamp-3 whitespace-pre-line text-[0.68rem] leading-4 text-on-surface-variant">{entry.releaseNotes}</p>
                        {entry.installerSmokeSummary ? (
                          <p className="mt-2 line-clamp-2 text-[0.68rem] leading-4 text-on-surface-variant">
                            Smoke result: {entry.installerSmokeSummary}
                            {entry.installerSmokeFinishedAt ? ` · ${validationTimeLabel(entry.installerSmokeFinishedAt)}` : ""}
                          </p>
                        ) : null}
                        {entry.launchSummary ? (
                          <p className="mt-2 line-clamp-2 text-[0.68rem] leading-4 text-on-surface-variant">
                            Launch: {entry.launchSummary}
                            {entry.launchedAt ? ` · ${validationTimeLabel(entry.launchedAt)}` : ""}
                          </p>
                        ) : null}
                        {entry.runSummary && entry.runSummary !== entry.launchSummary ? (
                          <p className="mt-2 line-clamp-2 text-[0.68rem] leading-4 text-on-surface-variant">
                            Run session: {entry.runSummary}
                            {entry.runCheckedAt ? ` · ${validationTimeLabel(entry.runCheckedAt)}` : ""}
                          </p>
                        ) : null}
                        {entry.runtimeLogPath ? (
                          <p className="mt-2 line-clamp-2 break-all font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                            Runtime log: {entry.runtimeLogPath}
                            {entry.runtimeLogSizeBytes ? ` · ${entry.runtimeLogSizeBytes} bytes` : ""}
                          </p>
                        ) : null}
                        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[0.68rem]">
                          <span className="rounded-xl bg-surface-container-low px-2 py-1">{entry.readinessScore}% ready</span>
                          <span className="rounded-xl bg-surface-container-low px-2 py-1">{entry.visualScore}% visual</span>
                          <span className="rounded-xl bg-surface-container-low px-2 py-1">{entry.controlCount} controls</span>
                          <span className="rounded-xl bg-surface-container-low px-2 py-1">{entry.validationStatus ?? "unchecked"}</span>
                        </div>
                        <p className="mt-3 break-all font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                          {primaryArtifactPath || entry.outputExePath || entry.generatedAppDir}
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            data-builder-open-build-history-artifact={entry.id}
                            disabled={!primaryArtifactPath}
                            onClick={() => void openLocalArtifact(primaryArtifactPath ?? "")}
                          >
                            {entry.buildKind === "bundle" ? <Box aria-hidden className="size-4" /> : <Download aria-hidden className="size-4" />}
                            {entry.buildKind === "bundle" ? "安装包" : "exe"}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            data-builder-launch-build-history-exe={entry.id}
                            loading={launchingExeId === entry.id}
                            disabled={entry.buildKind !== "exe" || !entry.outputExePath || Boolean(launchingExeId)}
                            onClick={() => void launchBuiltExecutable(entry)}
                          >
                            <Play aria-hidden className="size-4" />
                            启动
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-refresh-build-history-run-session={entry.id}
                            loading={checkingRunId === entry.id}
                            disabled={!entry.outputExePath || !entry.launchedPid || Boolean(checkingRunId)}
                            onClick={() => void refreshRunSession(entry)}
                          >
                            <RotateCcw aria-hidden className="size-4" />
                            状态
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-stop-build-history-run-session={entry.id}
                            loading={stoppingRunId === entry.id}
                            disabled={!entry.outputExePath || !entry.launchedPid || entry.runStatus === "stopped" || Boolean(stoppingRunId)}
                            onClick={() => void stopRunSession(entry)}
                          >
                            <Square aria-hidden className="size-4" />
                            停止
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-refresh-build-history-runtime-log={entry.id}
                            loading={readingRuntimeLogId === entry.id}
                            disabled={!entry.runtimeLogPath || Boolean(readingRuntimeLogId)}
                            onClick={() => void refreshRuntimeLog(entry)}
                          >
                            <Terminal aria-hidden className="size-4" />
                            日志
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-open-build-history-runtime-log={entry.id}
                            disabled={!entry.runtimeLogPath}
                            onClick={() => void openLocalArtifact(entry.runtimeLogPath ?? "")}
                          >
                            <FileJson aria-hidden className="size-4" />
                            Log
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-open-build-history-dir={entry.id}
                            disabled={!artifactDir}
                            onClick={() => void openLocalArtifact(artifactDir ?? "")}
                          >
                            <FolderOpen aria-hidden className="size-4" />
                            目录
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-open-build-history-manifest={entry.id}
                            disabled={!entry.bundleManifestPath}
                            onClick={() => void openLocalArtifact(entry.bundleManifestPath ?? "")}
                          >
                            <FileJson aria-hidden className="size-4" />
                            Manifest
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-open-build-history-smoke-script={entry.id}
                            disabled={!entry.installerSmokeScriptPath}
                            onClick={() => void openLocalArtifact(entry.installerSmokeScriptPath ?? "")}
                          >
                            <FileJson aria-hidden className="size-4" />
                            Smoke
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            data-builder-run-build-history-smoke={entry.id}
                            loading={runningSmokeId === entry.id}
                            disabled={!entry.installerSmokeScriptPath || !entry.installerSmokeResultPath || Boolean(runningSmokeId)}
                            onClick={() => void runInstallerSmokeScript(entry)}
                          >
                            <Play aria-hidden className="size-4" />
                            运行
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-open-build-history-smoke-result={entry.id}
                            disabled={!entry.installerSmokeResultPath}
                            onClick={() => void openLocalArtifact(entry.installerSmokeResultPath ?? "")}
                          >
                            <FileJson aria-hidden className="size-4" />
                            Result
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-open-build-history-vm-handoff={entry.id}
                            disabled={!entry.installerSmokeVmHandoffPath}
                            onClick={() => void openLocalArtifact(entry.installerSmokeVmHandoffPath ?? "")}
                          >
                            <Monitor aria-hidden className="size-4" />
                            VM
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            data-builder-create-build-history-sandbox={entry.id}
                            loading={creatingSandboxHandoffId === entry.id}
                            disabled={!entry.installerSmokeVmHandoffPath || Boolean(creatingSandboxHandoffId)}
                            onClick={() => void createInstallerSandboxHandoff(entry)}
                          >
                            <Box aria-hidden className="size-4" />
                            Sandbox
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-refresh-build-history-smoke-result={entry.id}
                            disabled={!entry.installerSmokeResultPath}
                            onClick={() => void refreshInstallerSmokeResult(entry)}
                          >
                            <RotateCcw aria-hidden className="size-4" />
                            刷新
                          </Button>
                        </div>
                      </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-outline-variant p-5 text-center text-xs leading-5 text-on-surface-variant">
                    尚无构建产物。构建成功后会记录 exe、安装包、输出目录和检查状态。
                  </div>
                )}
              </div>
              <div className="rounded-[24px] border border-outline-variant bg-surface-container-low p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-medium">构建日志</h2>
                    <p className="mt-1 text-xs text-on-surface-variant">这里显示 `npm install`、Tauri 构建和 Rust 编译输出。</p>
                  </div>
                  <Badge variant={activeBundlePath || activeProject.outputExePath ? "secondary" : "outline"}>
                    {bundling ? "bundling" : activeBundlePath ? "bundle ready" : activeProject.outputExePath ? "exe ready" : building ? "building" : "idle"}
                  </Badge>
                </div>
                <Textarea
                  data-builder-build-log=""
                  readOnly
                  value={activeProject.buildLog || "尚未构建。点击“exe”会生成可执行文件，点击“打包”会运行完整 Tauri bundle。"}
                  className="min-h-[420px] resize-none font-mono text-xs leading-5"
                />
              </div>
            </section>
          </BuildWorkspace>
        ) : mode === "export" ? (
          <div className="space-y-4 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SegmentedControl
                aria-label="导出格式"
                value={exportKind}
                onValueChange={(value) => setExportKind(value as "json" | "jsx")}
                options={[
                  { value: "json", label: "JSON" },
                  { value: "jsx", label: "React" },
                ]}
              />
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={downloadExport}>
                  <Download aria-hidden className="size-4" />
                  下载文件
                </Button>
                <Button variant="secondary" onClick={copyExport}>
                  <Copy aria-hidden className="size-4" />
                  {copied ? "已复制" : "复制导出"}
                </Button>
              </div>
            </div>
            <Textarea data-builder-export-output="" readOnly value={exportText} className="min-h-[640px] resize-none font-mono text-xs leading-5" />
          </div>
        ) : (
          <DesignWorkspace>
            <ProjectDock tabs={leftDockTabs} activeTab={leftDockTab} onTabChange={setLeftDockTab}>
              {leftDockTab === "project" ? (
                <>
              <PanelTitle icon={FolderOpen} title="项目" description="管理本地 UI 编辑器项目。" />
              <div className="mb-5 space-y-3 rounded-[22px] bg-surface-container-low p-3">
                <Field label="当前项目">
                  <Select value={activeProject.id} onValueChange={selectProject}>
                    <SelectTrigger data-builder-project-select="">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {workspace.projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="项目模板">
                  <div className="grid gap-2" data-builder-project-templates="">
                    {projectTemplates.map((template) => {
                      const TemplateIcon = template.icon;
                      const selected = selectedProjectTemplateId === template.id;
                      return (
                        <button
                          key={template.id}
                          type="button"
                          data-builder-project-template={template.id}
                          onClick={() => setSelectedProjectTemplateId(template.id)}
                          className={cn(
                            "w-full rounded-2xl border p-3 text-left transition",
                            selected
                              ? "border-primary bg-primary/10 text-on-surface shadow-m3-1"
                              : "border-outline-variant bg-surface-container-high text-on-surface-variant hover:border-outline hover:bg-surface-container-highest",
                          )}
                        >
                          <span className="flex min-w-0 items-center justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-2">
                              <TemplateIcon aria-hidden className="size-4 shrink-0 text-primary" />
                              <span className="truncate text-xs font-medium">{template.title}</span>
                            </span>
                            <Badge variant={selected ? "secondary" : "outline"}>{template.badge}</Badge>
                          </span>
                          <span className="mt-2 block line-clamp-2 text-[0.68rem] leading-4">{template.description}</span>
                          <TemplateMiniPreview template={template} selected={selected} />
                        </button>
                      );
                    })}
                  </div>
                  <Dialog open={replaceTemplateOpen} onOpenChange={setReplaceTemplateOpen}>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="mt-2 w-full"
                      data-builder-replace-project-template=""
                      onClick={() => setReplaceTemplateOpen(true)}
                    >
                      <RotateCcw aria-hidden className="size-4" />
                      用模板替换当前项目
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>用 {selectedProjectTemplate.title} 替换当前项目？</DialogTitle>
                        <DialogDescription>
                          这会替换当前项目的 UI 文件、state、Rust commands 和 Rust 逻辑；项目名称和磁盘目录会保留。
                        </DialogDescription>
                      </DialogHeader>
                      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-3">
                        <TemplateMiniPreview template={selectedProjectTemplate} selected />
                        <p className="mt-3 text-xs leading-5 text-on-surface-variant">{selectedProjectTemplate.description}</p>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setReplaceTemplateOpen(false)}>
                          取消
                        </Button>
                        <Button type="button" variant="destructive" data-builder-confirm-replace-template="" onClick={replaceActiveProjectWithTemplate}>
                          替换项目
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </Field>
                <Field label="项目快照">
                  <div className="rounded-2xl border border-outline-variant bg-surface-container-high p-3" data-builder-project-snapshots="">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-on-surface">会话快照</p>
                        <p className="mt-1 truncate text-[0.68rem] leading-4 text-on-surface-variant">
                          {latestProjectSnapshot
                            ? `${latestProjectSnapshot.label} · ${formatProjectSnapshotTime(latestProjectSnapshot.createdAt)}`
                            : "暂无快照，适合在大改前保存"}
                        </p>
                      </div>
                      <Badge variant={activeProjectSnapshots.length > 0 ? "secondary" : "outline"}>{activeProjectSnapshots.length}</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button size="sm" variant="secondary" data-builder-save-project-snapshot="" onClick={() => pushProjectSnapshot("手动快照")}>
                        <Save aria-hidden className="size-4" />
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-builder-restore-project-snapshot=""
                        onClick={restoreLatestProjectSnapshot}
                        disabled={activeProjectSnapshots.length === 0}
                      >
                        <RotateCcw aria-hidden className="size-4" />
                        恢复上个
                      </Button>
                    </div>
                  </div>
                </Field>
                <Field label="磁盘版本">
                  <div className="space-y-3 rounded-2xl border border-outline-variant bg-surface-container-high p-3" data-builder-disk-checkpoints="">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-on-surface">命名检查点</p>
                        <p className="mt-1 truncate text-[0.68rem] leading-4 text-on-surface-variant">
                          {activeProject.rootPath ? ".nova/checkpoints" : "创建后会自动保存项目目录"}
                        </p>
                      </div>
                      <Badge variant={diskCheckpoints.length > 0 ? "secondary" : "outline"}>{diskCheckpoints.length}</Badge>
                    </div>
                    <Input
                      inputSize="sm"
                      data-builder-checkpoint-label=""
                      value={checkpointLabel}
                      placeholder="例如：布局初版"
                      onChange={(event) => setCheckpointLabel(event.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      data-builder-create-disk-checkpoint=""
                      onClick={() => void createDiskCheckpoint()}
                      loading={diskBusy}
                      disabled={!isTauriRuntime()}
                    >
                      <Save aria-hidden className="size-4" />
                      创建磁盘检查点
                    </Button>
                    <div className="max-h-40 space-y-2 overflow-auto pr-1">
                      {diskCheckpoints.length > 0 ? (
                        diskCheckpoints.slice(0, 5).map((checkpoint) => (
                          <div key={checkpoint.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-2">
                            <div className="min-w-0">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium">{checkpoint.label}</p>
                                <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                                  {formatProjectSnapshotTime(checkpoint.created_at)} · {checkpoint.file_count} UI · {checkpoint.command_count} commands
                                </p>
                              </div>
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                <Button
                                  size="sm"
                                  variant={checkpointDiff?.checkpoint.id === checkpoint.id ? "secondary" : "ghost"}
                                  data-builder-diff-disk-checkpoint={checkpoint.id}
                                  onClick={() => void inspectDiskCheckpointDiff(checkpoint)}
                                  loading={checkpointDiffLoadingId === checkpoint.id}
                                  disabled={diskBusy}
                                >
                                  <Braces aria-hidden className="size-4" />
                                  对比
                                </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                data-builder-restore-disk-checkpoint={checkpoint.id}
                                onClick={() => void restoreDiskCheckpoint(checkpoint)}
                                disabled={diskBusy}
                              >
                                <RotateCcw aria-hidden className="size-4" />
                                恢复
                              </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-outline-variant p-3 text-center text-[0.68rem] leading-4 text-on-surface-variant">
                          暂无磁盘检查点。适合在重构 UI、修改 Rust 逻辑或构建前保存。
                        </div>
                      )}
                    </div>
                    {checkpointDiff ? (
                      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-3" data-builder-checkpoint-diff="">
                        <div className="flex min-w-0 items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-on-surface">恢复摘要</p>
                            <p className="mt-1 text-[0.68rem] leading-4 text-on-surface-variant">{checkpointDiffSummary(checkpointDiff)}</p>
                          </div>
                          <Badge variant={checkpointDiff.rust_logic_changed || checkpointDiff.changed_files.length > 0 ? "secondary" : "outline"}>
                            diff
                          </Badge>
                        </div>
                        <div className="mt-3 grid grid-cols-5 gap-1 text-center">
                          {[
                            ["UI", checkpointDiff.file_delta],
                            ["控件", checkpointDiff.item_delta],
                            ["Cmd", checkpointDiff.command_delta],
                            ["State", checkpointDiff.state_delta],
                            ["Asset", checkpointDiff.asset_delta],
                          ].map(([label, value]) => (
                            <div key={label} className="rounded-lg bg-surface-container-high px-1 py-2">
                              <p className="text-[0.62rem] text-on-surface-variant">{label}</p>
                              <p className="mt-0.5 font-mono text-[0.68rem] text-on-surface">{formatSignedDelta(Number(value))}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 space-y-1">
                          {checkpointDiffDetails(checkpointDiff).slice(0, 4).map((detail) => (
                            <p key={detail} className="text-[0.68rem] leading-4 text-on-surface-variant">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </Field>
                <Field label="磁盘项目">
                  {managedProjects.length > 0 ? (
                    <Select value={activeProject.rootPath ?? managedProjects[0].root_path} onValueChange={(rootPath) => void openProjectRoot(rootPath)}>
                      <SelectTrigger data-builder-managed-project-select="">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {managedProjects.map((project) => (
                          <SelectItem key={project.root_path} value={project.root_path}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Button size="sm" variant="secondary" className="w-full" data-builder-refresh-projects="" onClick={() => void refreshManagedProjects()}>
                      <FolderOpen aria-hidden className="size-4" />
                      扫描磁盘项目
                    </Button>
                  )}
                </Field>
                <Field label="项目名称">
                  <Input data-builder-project-name="" value={activeProject.name} onChange={(event) => renameActiveProject(event.target.value)} />
                </Field>
                <Field label="项目目录">
                  <Input
                    data-builder-project-root=""
                    value={activeProject.rootPath ?? ""}
                    placeholder="保存后生成，或粘贴已有项目目录"
                    onChange={(event) => updateProjectRootPath(event.target.value)}
                  />
                </Field>
                <section className="space-y-3 rounded-2xl border border-outline-variant bg-surface-container-high p-3" data-builder-project-release-settings="">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Project Settings / Release</h3>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">Build 页只负责运行流水线；发布元数据在这里维护。</p>
                    </div>
                    <Badge variant="outline">settings</Badge>
                  </div>
                  <Field label="应用名称">
                    <Input
                      inputSize="sm"
                      data-builder-project-release-app-name=""
                      value={activeProject.releaseConfig.appName}
                      onChange={(event) => updateReleaseConfig({ appName: event.target.value })}
                    />
                  </Field>
                  <Field label="Bundle identifier">
                    <Input
                      inputSize="sm"
                      data-builder-project-release-identifier=""
                      value={activeProject.releaseConfig.bundleIdentifier}
                      spellCheck={false}
                      className="font-mono text-xs"
                      onChange={(event) => updateReleaseConfig({ bundleIdentifier: event.target.value })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="版本号">
                      <Input
                        inputSize="sm"
                        data-builder-project-release-version=""
                        value={activeProject.releaseConfig.version}
                        spellCheck={false}
                        className="font-mono text-xs"
                        onChange={(event) => updateReleaseConfig({ version: event.target.value })}
                      />
                    </Field>
                    <Field label="窗口标题">
                      <Input
                        inputSize="sm"
                        data-builder-project-release-window-title=""
                        value={activeProject.releaseConfig.windowTitle}
                        onChange={(event) => updateReleaseConfig({ windowTitle: event.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="安装包目标">
                      <Select
                        value={activeProject.releaseConfig.bundleTargets}
                        onValueChange={(bundleTargets) => updateReleaseConfig({ bundleTargets: bundleTargets as ReleaseBundleTarget })}
                      >
                        <SelectTrigger inputSize="sm" data-builder-project-release-targets="">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {releaseBundleTargets.map((target) => (
                            <SelectItem key={target.value} value={target.value}>
                              {target.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <div className="flex items-end">
                      <label className="flex h-[var(--control-sm)] w-full items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 text-xs">
                        允许缩放
                        <Switch checked={activeProject.releaseConfig.resizable} onCheckedChange={(resizable) => updateReleaseConfig({ resizable })} />
                      </label>
                    </div>
                  </div>
                </section>
                <Button size="sm" variant="secondary" className="w-full" data-builder-choose-project-dir="" onClick={chooseProjectDirectory} loading={diskBusy}>
                  <FolderOpen aria-hidden className="size-4" />
                  选择项目目录
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="secondary" data-builder-new-project="" onClick={createNewProject}>
                    <Plus aria-hidden className="size-4" />
                    新建
                  </Button>
                  <Button size="sm" variant="secondary" data-builder-open-project="" onClick={openProjectFromDisk} loading={diskBusy}>
                    <FolderOpen aria-hidden className="size-4" />
                    打开
                  </Button>
                </div>
                <Button size="sm" variant="ghost" className="w-full" data-builder-delete-project="" onClick={requestDeleteActiveProject}>
                  <Trash2 aria-hidden className="size-4" />
                  删除当前项目
                </Button>
              </div>
                </>
              ) : null}

              {leftDockTab === "navigator" ? (
                <NavigatorDock>
              <PanelTitle icon={FileJson} title="UI 文件" description="一个项目可以包含多个界面文件。" />
              <div className="mb-5 space-y-3 rounded-[22px] bg-surface-container-low p-3">
                <Field label="文件名">
                  <Input data-builder-file-name="" value={activeFile.name} onChange={(event) => renameActiveFile(event.target.value)} />
                </Field>
                <div className="max-h-44 space-y-1 overflow-auto pr-1">
                  {activeProject.files.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      data-builder-file={file.name}
                      className={cn(
                        "focus-ring m3-state-layer flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-left text-xs transition-colors",
                        file.id === activeFile.id ? "bg-secondary-container text-secondary-container-foreground" : "hover:bg-surface-container-high",
                      )}
                      onClick={() => selectFile(file.id)}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{file.name}</span>
                        <span className="block truncate opacity-70">{file.items.length} controls</span>
                      </span>
                      <FileJson aria-hidden className="size-3.5 shrink-0" />
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button size="icon-sm" variant="secondary" data-builder-new-file="" aria-label="新建 UI 文件" onClick={createNewFileFromNavigator}>
                    <Plus aria-hidden />
                  </Button>
                  <Button size="icon-sm" variant="secondary" data-builder-duplicate-file="" aria-label="复制当前 UI 文件" onClick={duplicateActiveFileFromNavigator}>
                    <Copy aria-hidden />
                  </Button>
                  <Button size="icon-sm" variant="ghost" data-builder-delete-file="" aria-label="删除当前 UI 文件" onClick={requestDeleteActiveFile}>
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              </div>
                </NavigatorDock>
              ) : null}

              {leftDockTab === "assets" ? (
                <>
              <PanelTitle icon={FileImage} title="资源" description="项目级图片资源，可绑定到 Image 控件。" />
              <div className="mb-5 space-y-3 rounded-[22px] bg-surface-container-low p-3">
                <Button size="sm" variant="secondary" className="w-full" data-builder-import-asset="" onClick={chooseImageAsset} loading={diskBusy}>
                  <FileImage aria-hidden className="size-4" />
                  导入图片
                </Button>
                {activeProject.assets.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-outline-variant p-4 text-center text-xs leading-5 text-on-surface-variant">
                    暂无资源。导入图片后可放入画布，并随生成 app 一起复制。
                  </div>
                ) : (
                  <div className="max-h-44 space-y-2 overflow-auto pr-1">
                    {activeProject.assets.map((asset) => (
                      <div key={asset.id} className="rounded-2xl border border-outline-variant bg-surface-container-high p-2">
                        <div className="flex items-center gap-2">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileImage aria-hidden className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">{asset.name}</p>
                            <p className="truncate font-mono text-[0.66rem] text-on-surface-variant">{asset.publicPath}</p>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <Button size="sm" variant="secondary" data-builder-add-asset-image={asset.name} onClick={() => addImageFromAsset(asset)}>
                            <Plus aria-hidden className="size-4" />
                            放入
                          </Button>
                          <Button size="sm" variant="ghost" data-builder-delete-asset={asset.name} onClick={() => deleteAsset(asset.id)}>
                            <Trash2 aria-hidden className="size-4" />
                            删除
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
                </>
              ) : null}

              {leftDockTab === "components" ? (
                <>
              <PanelTitle icon={Layers} title="控件工具箱" description="拖到画布任意位置，也可以单击快速添加。" />
              <div className="grid gap-2">
                {palette.map((definition) => {
                  const Icon = definition.icon;
                  return (
                    <button
                      key={definition.type}
                      type="button"
                      data-builder-palette-type={definition.type}
                      draggable={false}
                      onMouseDown={(event) => handlePaletteMouseDown(event, definition)}
                      onClick={() => {
                        if (suppressPaletteClickRef.current) {
                          return;
                        }
                        addComponent(definition.type);
                      }}
                      className="focus-ring m3-state-layer flex w-full items-start gap-3 rounded-[18px] border border-transparent bg-surface-container-low p-3 text-left transition-colors hover:border-outline-variant hover:bg-surface-container-high"
                    >
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-primary">
                        <Icon aria-hidden className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{definition.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-on-surface-variant">{definition.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
                </>
              ) : null}
            </ProjectDock>

            <main className="relative flex min-h-0 min-w-0 flex-col overflow-hidden bg-surface-container-low">
              <div className="flex flex-col gap-3 border-b border-outline-variant bg-surface-container-lowest p-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={page.preset} onValueChange={(value) => applyCanvasPreset(value as CanvasPresetId)}>
                    <SelectTrigger data-builder-canvas-preset="" className="w-[170px]" inputSize="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {canvasPresets.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.title} · {preset.description}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <SegmentedControl
                    aria-label="响应式断点"
                    value={activeBreakpoint}
                    onValueChange={(value) => setResponsiveBreakpoint(value as ResponsiveBreakpointId)}
                    options={[
                      { value: "desktop", label: "Desktop" },
                      { value: "tablet", label: "Tablet" },
                      { value: "mobile", label: "Mobile" },
                    ]}
                  />
                  <NumberBox
                    label="W"
                    value={page.width}
                    dataAttr="data-builder-canvas-width"
                    disabled={activeBreakpoint !== "desktop"}
                    onChange={(value) => updatePage({ preset: "custom", width: numberFromInput(value, page.width, 320, 2400) })}
                  />
                  <NumberBox
                    label="H"
                    value={page.height}
                    dataAttr="data-builder-canvas-height"
                    disabled={activeBreakpoint !== "desktop"}
                    onChange={(value) => updatePage({ preset: "custom", height: numberFromInput(value, page.height, 240, 1800) })}
                  />
                  <Select value={String(page.zoom)} onValueChange={(value) => updatePage({ zoom: Number(value) })}>
                    <SelectTrigger className="w-[104px]" inputSize="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {canvasZoomLevels.map((zoom) => (
                        <SelectItem key={zoom} value={String(zoom)}>
                          {Math.round(zoom * 100)}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1 rounded-full border border-outline bg-surface-container-high p-1">
                    <Button size="icon-sm" variant="ghost" data-builder-zoom-out="" aria-label="缩小画布 Ctrl+-" onClick={() => zoomCanvasBy(-0.1)}>
                      <ZoomOut aria-hidden />
                    </Button>
                    <Button size="icon-sm" variant="ghost" data-builder-zoom-in="" aria-label="放大画布 Ctrl++" onClick={() => zoomCanvasBy(0.1)}>
                      <ZoomIn aria-hidden />
                    </Button>
                    <Button size="icon-sm" variant="ghost" data-builder-fit-canvas="" aria-label="适配画布 Ctrl+1" onClick={fitCanvasToViewport}>
                      <Maximize2 aria-hidden />
                    </Button>
                    <Button size="icon-sm" variant="ghost" data-builder-reset-canvas-view="" aria-label="重置画布视图 Ctrl+0" onClick={resetCanvasView}>
                      <RotateCcw aria-hidden />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant={canvasPanMode ? "secondary" : "ghost"}
                      data-builder-pan-canvas=""
                      aria-label="移动画布 Space"
                      onClick={() => setCanvasPanMode((enabled) => !enabled)}
                    >
                      <Hand aria-hidden />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full border border-outline bg-surface-container-high p-1">
                    <Button size="icon-sm" variant="ghost" data-builder-undo="" aria-label="撤销" onClick={undoCanvas} disabled={!canUndo}>
                      <Undo2 aria-hidden />
                    </Button>
                    <Button size="icon-sm" variant="ghost" data-builder-redo="" aria-label="重做" onClick={redoCanvas} disabled={!canRedo}>
                      <Redo2 aria-hidden />
                    </Button>
                    <Button size="icon-sm" variant="ghost" data-builder-copy-selection="" aria-label="复制选中控件" onClick={copySelectionToClipboard} disabled={selectedIds.length === 0}>
                      <ClipboardCopy aria-hidden />
                    </Button>
                    <Button size="icon-sm" variant="ghost" data-builder-paste-selection="" aria-label="粘贴控件" onClick={pasteClipboardItems} disabled={!canPaste}>
                      <ClipboardPaste aria-hidden />
                    </Button>
                  </div>
                  <label className="flex h-[var(--control-sm)] items-center gap-2 rounded-full border border-outline bg-surface-container-high px-3 text-xs">
                    <Grid3x3 aria-hidden className="size-3.5 text-primary" />
                    网格
                    <Switch className="h-5 w-9 border" checked={page.showGrid} onCheckedChange={(showGrid) => updatePage({ showGrid })} />
                  </label>
                  <label className="flex h-[var(--control-sm)] items-center gap-2 rounded-full border border-outline bg-surface-container-high px-3 text-xs">
                    <Move aria-hidden className="size-3.5 text-primary" />
                    吸附
                    <Switch className="h-5 w-9 border" checked={page.snapToGrid} onCheckedChange={(snapToGrid) => updatePage({ snapToGrid })} />
                  </label>
                  <Badge variant="outline">{items.length} nodes</Badge>
                  <Badge variant={selectedIds.length > 0 ? "secondary" : "outline"}>{selectedIds.length} selected</Badge>
                </div>
              </div>

              {selectedItems.length > 0 ? (
                <section
                  className="flex min-h-[4.25rem] min-w-0 flex-col gap-2 border-b border-outline-variant bg-surface-container-lowest px-4 py-2.5 lg:flex-row lg:items-center lg:justify-between"
                  data-builder-selection-action-bar=""
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high text-primary shadow-m3-1">
                      {selectedItems.length > 1 ? <Layers aria-hidden className="size-4" /> : <MousePointer2 aria-hidden className="size-4" />}
                    </span>
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-on-surface">
                          {selectedItems.length > 1 ? `${selectedItems.length} controls selected` : selectedItem ? getItemSummary(selectedItem) : "Selection"}
                        </h3>
                        {selectedItem ? <Badge variant="outline">{selectedItem.type}</Badge> : null}
                        {selectedItem && selectedEventName ? (
                          <Badge variant={selectedEventCommand ? "secondary" : "outline"}>
                            {selectedEventCommand ? `${selectedEventName} bound` : `${selectedEventName} ready`}
                          </Badge>
                        ) : null}
                        {selectedPropertyIssues.length > 0 ? <Badge variant="destructive">{selectedPropertyIssues.length} issue(s)</Badge> : null}
                      </div>
                      <p className="mt-1 truncate text-xs text-on-surface-variant">
                        {selectedItems.length > 1
                          ? "Batch actions are available for duplication, delete, and shared layout edits."
                          : selectedItem
                            ? `${activeFile.name} · x ${Math.round(selectedItem.x)} y ${Math.round(selectedItem.y)} · ${Math.round(selectedItem.width)} x ${Math.round(selectedItem.height)}`
                            : activeFile.name}
                      </p>
                      {selectedActionFeedback ? (
                        <div
                          className={cn(
                            "mt-2 flex min-w-0 items-center gap-2 rounded-xl border px-2 py-1.5 text-xs",
                            selectedActionFeedback.tone === "success" && "border-primary/30 bg-primary/10 text-on-surface",
                            selectedActionFeedback.tone === "error" && "border-destructive/30 bg-destructive/10 text-on-surface",
                            selectedActionFeedback.tone === "ready" && "border-outline-variant bg-surface-container-high text-on-surface",
                            selectedActionFeedback.tone === "unbound" && "border-outline-variant bg-surface-container-low text-on-surface",
                          )}
                          data-builder-action-feedback=""
                        >
                          <span
                            className={cn(
                              "flex size-6 shrink-0 items-center justify-center rounded-lg",
                              selectedActionFeedback.tone === "success" && "bg-primary/10 text-primary",
                              selectedActionFeedback.tone === "error" && "bg-destructive/10 text-destructive",
                              selectedActionFeedback.tone !== "success" && selectedActionFeedback.tone !== "error" && "bg-surface-container-high text-primary",
                            )}
                          >
                            {selectedActionFeedback.tone === "success" ? (
                              <CheckCircle2 aria-hidden className="size-3.5" />
                            ) : selectedActionFeedback.tone === "error" || selectedActionFeedback.tone === "unbound" ? (
                              <AlertTriangle aria-hidden className="size-3.5" />
                            ) : (
                              <Braces aria-hidden className="size-3.5" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{selectedActionFeedback.title}</p>
                            <p className="truncate text-[0.68rem] text-on-surface-variant">{selectedActionFeedback.detail}</p>
                          </div>
                          <Badge variant={selectedActionFeedback.tone === "error" ? "destructive" : "secondary"} className="hidden shrink-0 sm:inline-flex">
                            {selectedActionFeedback.badge}
                          </Badge>
                          {selectedLatestSimulatorTrace ? (
                            <Button size="sm" variant="ghost" className="h-7 shrink-0 px-2 text-xs" onClick={openSelectedConnections}>
                              Trace
                            </Button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5 lg:justify-end">
                    <Button size="sm" variant="secondary" data-builder-actionbar-properties="" onClick={openSelectedProperties}>
                      <Settings2 aria-hidden className="size-4" />
                      Properties
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedEventCommand ? "secondary" : "default"}
                      data-builder-actionbar-connections=""
                      disabled={!selectedItem || !selectedEventName}
                      onClick={selectedEventCommand ? openSelectedConnections : () => createAndBindBackendIntegrationCommand()}
                    >
                      <Braces aria-hidden className="size-4" />
                      {selectedEventCommand ? "Connections" : "Create Binding"}
                    </Button>
                    <Button size="sm" variant="secondary" data-builder-actionbar-preview="" disabled={!selectedItem} onClick={previewSelectedControl}>
                      <Monitor aria-hidden className="size-4" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      data-builder-actionbar-run-event=""
                      disabled={!selectedItem || !selectedEventName || !selectedEventCommand}
                      onClick={runSelectedEventFromActionBar}
                    >
                      <Play aria-hidden className="size-4" />
                      Run Event
                    </Button>
                    <Button size="sm" variant="ghost" data-builder-actionbar-impact="" onClick={() => setRightDockTab("impact")}>
                      <AlertTriangle aria-hidden className="size-4" />
                      Impact
                    </Button>
                  </div>
                </section>
              ) : null}

              <div
                ref={canvasViewportRef}
                data-builder-canvas-viewport=""
                className={cn(
                  "subtle-scrollbar relative min-h-0 flex-1 overflow-auto p-8",
                  canvasPanActive ? "cursor-grab active:cursor-grabbing" : "cursor-default",
                )}
                onMouseDown={startCanvasMousePan}
                onPointerDown={startCanvasPan}
                onPointerMove={moveCanvasPan}
                onPointerUp={stopCanvasPan}
                onPointerCancel={stopCanvasPan}
                onWheel={handleCanvasViewportWheel}
              >
                <div className="relative" style={canvasStageStyle}>
                  <div
                    ref={canvasRef}
                    data-builder-canvas=""
                    className={cn(
                      "relative overflow-hidden rounded-[18px] border border-outline-variant shadow-m3-2",
                      mode === "design" && !canvasPanActive && "cursor-crosshair",
                      mode === "design" && canvasPanActive && "cursor-grab",
                    )}
                    style={canvasStyle}
                    onClick={clearSelection}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "copy";
                      setDropIntent(getFrameDropIntentFromClientPoint(event.clientX, event.clientY));
                    }}
                    onDragLeave={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setDropIntent(null);
                      }
                    }}
                    onDrop={handleCanvasDrop}
                  >
                    {items.length === 0 ? (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div
                          className="pointer-events-auto w-[min(420px,calc(100%-48px))] rounded-[24px] border border-dashed border-outline-variant bg-surface-container-lowest/95 px-5 py-4 text-center shadow-m3-2 backdrop-blur"
                          style={{
                            transform: `scale(${Math.min(2.4, 1 / Math.max(page.zoom, 0.42))})`,
                            transformOrigin: "center",
                          }}
                          onClick={(event) => event.stopPropagation()}
                          onPointerDown={(event) => event.stopPropagation()}
                        >
                          <MousePointer2 aria-hidden className="mx-auto mb-3 size-5 text-primary" />
                          <p className="text-sm font-semibold">Start this UI file</p>
                          <p className="mx-auto mt-1 max-w-[320px] text-xs leading-5 text-on-surface-variant">
                            Insert a first control here, or open the component library for the full toolbox.
                          </p>
                          <div className="mt-4 grid grid-cols-3 gap-2">
                            {emptyCanvasQuickStarts.map((type) => {
                              const definition = getDefinition(type);
                              const Icon = definition.icon;
                              return (
                                <Button
                                  key={type}
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="min-w-0 px-2"
                                  data-builder-empty-insert={type}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    insertComponentFromShortcut(type, { centered: true });
                                  }}
                                >
                                  <Icon aria-hidden className="size-4" />
                                  <span className="truncate">{definition.title}</span>
                                </Button>
                              );
                            })}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="mt-2 w-full"
                            data-builder-empty-open-components=""
                            onClick={(event) => {
                              event.stopPropagation();
                              setLeftDockTab("components");
                            }}
                          >
                            <Layers aria-hidden className="size-4" />
                            Open components
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {dropIntent?.kind === "canvas" && mode === "design" ? (
                      <div className="pointer-events-none absolute inset-3 z-[9999] rounded-[18px] border border-dashed border-primary/80 bg-primary/5 shadow-m3-1">
                        <div
                          className="absolute inline-flex max-w-[220px] items-center gap-1.5 rounded-full border border-primary/25 bg-surface-container-lowest/95 px-2 py-1 text-[0.66rem] font-medium text-primary shadow-m3-1"
                          style={{
                            left: clamp(dropIntent.x + 12, 12, Math.max(12, page.width - 220)),
                            top: clamp(dropIntent.y + 12, 12, Math.max(12, page.height - 34)),
                          }}
                        >
                          <Move aria-hidden className="size-3" />
                          <span className="truncate">Release to Canvas</span>
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5">{dropIntent.itemCount}</span>
                        </div>
                      </div>
                    ) : null}

                    {topLevelItems.map((item) => renderCanvasNode(item))}
                  </div>
                </div>
              </div>
            </main>

            <InspectorDock tabs={rightDockTabs} activeTab={rightDockTab} onTabChange={setRightDockTab}>
              <section className="mb-4 rounded-[22px] border border-outline-variant bg-surface-container-low p-3" data-builder-inspector-context="">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-primary">
                        {selectedItems.length > 1 ? (
                          <Layers aria-hidden className="size-4" />
                        ) : selectedItem ? (
                          <MousePointer2 aria-hidden className="size-4" />
                        ) : (
                          <FileJson aria-hidden className="size-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold">
                          {selectedItems.length > 1 ? `${selectedItems.length} controls selected` : selectedItem ? getItemSummary(selectedItem) : activeFile.name}
                        </h2>
                        <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">
                          {selectedItems.length > 1
                            ? `${selectedItems.filter((item) => item.locked).length} locked · ${activeFile.name}`
                            : selectedItem
                              ? `${selectedItem.type} · x ${Math.round(selectedItem.x)} y ${Math.round(selectedItem.y)} · ${Math.round(selectedItem.width)} x ${Math.round(selectedItem.height)}`
                              : `${activeFile.items.length} controls · ${page.width} x ${page.height}`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge variant={selectedPropertyIssues.length > 0 ? "outline" : "secondary"}>
                        {selectedItem ? `${selectedPropertyIssues.length} issue(s)` : "page"}
                      </Badge>
                      {selectedItem && selectedEventName ? (
                        <Badge variant={selectedEventCommand ? "secondary" : "outline"}>
                          {selectedEventCommand ? "event bound" : "event ready"}
                        </Badge>
                      ) : null}
                      {selectedControlReverseDependency ? (
                        <Badge variant={reverseDependencyStatusVariant(selectedControlReverseDependency.status)}>
                          {reverseDependencyStatusLabel(selectedControlReverseDependency.status)}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={selectedItem?.locked ? "解锁控件" : "锁定控件"}
                    disabled={!selectedItem}
                    onClick={toggleSelectedLock}
                  >
                    {selectedItem?.locked ? <Lock aria-hidden /> : <LockOpen aria-hidden />}
                  </Button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {rightDockTabs.map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.value}
                        type="button"
                        data-builder-inspector-jump={tab.value}
                        className={cn(
                          "focus-ring flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs transition",
                          rightDockTab === tab.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-outline-variant bg-surface-container-high text-on-surface-variant hover:border-outline hover:text-on-surface",
                        )}
                        onClick={() => setRightDockTab(tab.value)}
                      >
                        <TabIcon aria-hidden className="size-3.5 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  <Button size="sm" variant="secondary" disabled={selectedItems.length === 0} onClick={duplicateSelected}>
                    <Copy aria-hidden className="size-4" />
                    Duplicate
                  </Button>
                  <Button size="sm" variant="secondary" disabled={!selectedItem || !selectedEventName} onClick={() => setRightDockTab("connections")}>
                    <Braces aria-hidden className="size-4" />
                    Bind
                  </Button>
                  <Button size="sm" variant="destructive" disabled={selectedItems.length === 0} onClick={requestDeleteSelected}>
                    <Trash2 aria-hidden className="size-4" />
                    Delete
                  </Button>
                </div>

                {selectedItem && selectedEventName ? (
                  <div className="mt-3 rounded-2xl border border-outline-variant bg-surface-container-high p-3" data-builder-connection-path="">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-on-surface">Connection path</p>
                        <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                          {selectedLatestSimulatorTrace
                            ? `Last ${selectedLatestSimulatorTrace.status}: ${selectedLatestSimulatorTrace.message}`
                            : selectedEventCommand
                              ? `${selectedEventName} -> ${sanitizeRustCommandName(selectedEventCommand.name)}`
                              : `${selectedEventName} event is ready for a Rust command`}
                        </p>
                      </div>
                      <Badge variant={selectedEventCommand ? "secondary" : "outline"}>{selectedEventCommand ? "bound" : "unbound"}</Badge>
                    </div>
                    <div className="mt-3 grid gap-1.5 sm:grid-cols-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        data-builder-connection-path-open=""
                        onClick={openSelectedConnectionTarget}
                      >
                        <Braces aria-hidden className="size-4" />
                        {selectedEventCommand ? "Open command" : "Open"}
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedEventCommand ? "ghost" : "secondary"}
                        data-builder-connection-path-create=""
                        onClick={() => createAndBindBackendIntegrationCommand()}
                      >
                        <Plus aria-hidden className="size-4" />
                        Create
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-builder-connection-path-simulate=""
                        disabled={!selectedEventCommand}
                        onClick={() => simulateSelectedEvent()}
                      >
                        <Play aria-hidden className="size-4" />
                        Simulate
                      </Button>
                    </div>
                    {selectedLatestSimulatorTrace ? (
                      <div className="mt-3 rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-xs" data-builder-connection-path-last-run="">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium text-on-surface">{`${selectedLatestSimulatorTrace.eventName} -> ${selectedLatestSimulatorTrace.commandName}`}</span>
                          <Badge variant={selectedLatestSimulatorTrace.status === "error" ? "destructive" : "secondary"}>{selectedLatestSimulatorTrace.status}</Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[0.68rem] leading-4 text-on-surface-variant">{selectedLatestSimulatorTrace.message}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>

              {rightDockTab === "properties" ? (
                <>
              <PanelTitle icon={Settings2} title="检查器" description="页面、图层、坐标和控件属性。" />

              <div className="space-y-4">
                <section className="rounded-[22px] bg-surface-container-low p-3">
                  <div className="mb-3 flex items-center gap-2">
                    <FileJson aria-hidden className="size-4 text-primary" />
                    <h3 className="text-sm font-medium">页面设置</h3>
                  </div>
                  <div className="space-y-3">
                    <Field label="页面名称">
                      <Input value={page.title} onChange={(event) => updatePage({ title: event.target.value })} />
                    </Field>
                    <Field label="背景">
                      <Select value={page.background} onValueChange={(value) => updatePage({ background: value as CanvasBackground })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid</SelectItem>
                          <SelectItem value="soft">Soft</SelectItem>
                          <SelectItem value="plain">Plain</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="网格尺寸">
                        <Input
                          type="number"
                          inputSize="sm"
                          value={page.gridSize}
                          onChange={(event) => updatePage({ gridSize: numberFromInput(event.target.value, page.gridSize, 4, 32) })}
                        />
                      </Field>
                      <div className="flex items-end">
                        <label className="flex h-[var(--control-sm)] w-full items-center justify-between rounded-xl bg-surface-container-high px-3 text-xs">
                          自动保存
                          <Switch className="h-5 w-9 border" checked={page.autoSave} onCheckedChange={(autoSave) => updatePage({ autoSave })} />
                        </label>
                      </div>
                    </div>
                  </div>
                </section>

                {mode === "preview" ? (
                  <section className="space-y-3 rounded-[22px] bg-surface-container-low p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <Braces aria-hidden className="size-4 text-primary" />
                          <h3 className="text-sm font-medium">Live Simulator</h3>
                        </div>
                        <p className="text-xs leading-5 text-on-surface-variant">
                          预演选中控件的事件参数、Rust 返回和 state patch。
                        </p>
                      </div>
                      <Badge variant={simulatorTrace.length > 0 ? "secondary" : "outline"}>{simulatorTrace.length}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        data-builder-simulate-event=""
                        onClick={() => simulateSelectedEvent()}
                        disabled={!selectedItem || !selectedEventName || !selectedEventCommand}
                      >
                        <Braces aria-hidden className="size-4" />
                        Simulate
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSimulatorStateValues(simulatorStateFromProject(activeProject));
                          setSimulatorTrace([]);
                        }}
                      >
                        <RotateCcw aria-hidden className="size-4" />
                        Reset
                      </Button>
                    </div>
                    <div className="rounded-2xl border border-outline-variant bg-surface-container p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">State snapshot</span>
                        <span className="text-[0.68rem] text-on-surface-variant">{activeProject.stateVariables.length} states</span>
                      </div>
                      <div className="space-y-1">
                        {activeProject.stateVariables.map((state) => (
                          <div key={state.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-high px-2 py-1.5 text-xs">
                            <span className="min-w-0 truncate font-mono">{state.name}</span>
                            <span className="max-w-[140px] truncate text-right text-on-surface-variant">
                              {simulatorStateValues[state.id] ?? state.initialValue ?? ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {simulatorTrace.length > 0 ? (
                        simulatorTrace.map((entry) => (
                          <article key={entry.id} className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate font-medium">{`${entry.eventName} -> ${entry.commandName}`}</p>
                                <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">{entry.itemName} · {entry.time}</p>
                              </div>
                              <Badge variant={entry.status === "error" ? "destructive" : "secondary"}>{entry.status}</Badge>
                            </div>
                            {entry.args ? (
                              <pre className="max-h-24 overflow-auto rounded-xl bg-surface-container-high p-2 font-mono text-[0.68rem] leading-4">
                                args {compactJson(entry.args)}
                              </pre>
                            ) : null}
                            <pre className="mt-2 max-h-24 overflow-auto rounded-xl bg-surface-container-high p-2 font-mono text-[0.68rem] leading-4">
                              result {entry.rawResult}
                            </pre>
                            {Object.keys(entry.patch).length > 0 ? (
                              <pre className="mt-2 max-h-24 overflow-auto rounded-xl bg-surface-container-high p-2 font-mono text-[0.68rem] leading-4">
                                patch {compactJson(Object.fromEntries(Object.entries(entry.patch).map(([stateId, value]) => [activeProject.stateVariables.find((state) => state.id === stateId)?.name ?? stateId, value])))}
                              </pre>
                            ) : null}
                            {entry.target ? <p className="mt-2 text-[0.68rem] text-on-surface-variant">Target: {entry.target}</p> : null}
                            <p className="mt-2 line-clamp-2 text-on-surface-variant">{entry.message}</p>
                          </article>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-outline-variant p-4 text-center text-xs leading-5 text-on-surface-variant">
                          选择一个绑定了 Rust command 的控件，然后点击 Simulate。
                        </div>
                      )}
                    </div>
                  </section>
                ) : null}

                <section className="rounded-[22px] bg-surface-container-low p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers aria-hidden className="size-4 text-primary" />
                      <h3 className="text-sm font-medium">对象树</h3>
                    </div>
                    <Badge variant="secondary">{items.length}</Badge>
                  </div>
                  {treeRows.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-outline-variant p-4 text-center text-xs text-on-surface-variant">
                      暂无对象
                    </div>
                  ) : (
                    <div className="max-h-52 space-y-1 overflow-auto pr-1">
                      {treeRows.map(({ item, depth }) => (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center gap-1 rounded-2xl p-1 transition-colors",
                            selectedIds.includes(item.id) ? "bg-secondary-container text-secondary-container-foreground" : "hover:bg-surface-container-high",
                          )}
                          style={{ paddingLeft: depth * 14 + 4 }}
                        >
                          <button
                            type="button"
                            className="focus-ring min-w-0 flex-1 rounded-xl px-2 py-2 text-left"
                            onClick={(event) => selectItem(item.id, event)}
                          >
                            <span className="block truncate text-xs font-medium">{getItemSummary(item)}</span>
                            <span className="block truncate text-[0.68rem] opacity-70">
                              {item.name} · {item.parentId ? "child" : "root"} · z {item.z}
                            </span>
                          </button>
                          <button
                            type="button"
                            className="focus-ring rounded-full p-1 disabled:opacity-30"
                            aria-label="图层上移"
                            onClick={() => moveLayer(item.id, 1)}
                          >
                            <MoveUp aria-hidden className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            className="focus-ring rounded-full p-1 disabled:opacity-30"
                            aria-label="图层下移"
                            onClick={() => moveLayer(item.id, -1)}
                          >
                            <MoveDown aria-hidden className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {selectedItems.length > 1 ? (
                  <section className="space-y-4 rounded-[22px] bg-surface-container-low p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-medium">批量选择</h3>
                        <p className="mt-1 truncate text-xs text-on-surface-variant">{selectedItems.length} 个控件已选中</p>
                      </div>
                      <Badge variant="secondary">{selectedItems.filter((item) => item.locked).length} locked</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button size="icon-sm" variant="secondary" aria-label="左对齐" onClick={() => alignSelected("left")}>
                        <AlignHorizontalJustifyStart aria-hidden />
                      </Button>
                      <Button size="icon-sm" variant="secondary" aria-label="水平居中对齐" onClick={() => alignSelected("center")}>
                        <AlignHorizontalJustifyCenter aria-hidden />
                      </Button>
                      <Button size="icon-sm" variant="secondary" aria-label="右对齐" onClick={() => alignSelected("right")}>
                        <AlignHorizontalJustifyEnd aria-hidden />
                      </Button>
                      <Button size="icon-sm" variant="secondary" aria-label="顶部对齐" onClick={() => alignSelected("top")}>
                        <AlignVerticalJustifyStart aria-hidden />
                      </Button>
                      <Button size="icon-sm" variant="secondary" aria-label="垂直居中对齐" onClick={() => alignSelected("middle")}>
                        <AlignVerticalJustifyCenter aria-hidden />
                      </Button>
                      <Button size="icon-sm" variant="secondary" aria-label="底部对齐" onClick={() => alignSelected("bottom")}>
                        <AlignVerticalJustifyEnd aria-hidden />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="secondary" size="sm" onClick={bringToFront}>
                        <MoveUp aria-hidden className="size-4" />
                        置顶
                      </Button>
                      <Button variant="secondary" size="sm" onClick={sendToBack}>
                        <MoveDown aria-hidden className="size-4" />
                        置底
                      </Button>
                      <Button variant="secondary" size="sm" onClick={duplicateSelected}>
                        <Copy aria-hidden className="size-4" />
                        复制
                      </Button>
                      <Button variant="destructive" size="sm" onClick={requestDeleteSelected}>
                        <Trash2 aria-hidden className="size-4" />
                        删除
                      </Button>
                    </div>
                  </section>
                ) : selectedItem ? (
                  <section className="space-y-4 rounded-[22px] bg-surface-container-low p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-medium">控件属性</h3>
                        <p className="mt-1 truncate text-xs text-on-surface-variant">{getItemSummary(selectedItem)}</p>
                      </div>
                      <Button variant="ghost" size="icon-sm" aria-label={selectedItem.locked ? "解锁控件" : "锁定控件"} onClick={toggleSelectedLock}>
                        {selectedItem.locked ? <Lock aria-hidden /> : <LockOpen aria-hidden />}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-[18px] bg-surface-container-high p-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">Breakpoint</p>
                        <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                          {activeBreakpoint === "desktop" ? "Editing base layout" : `Editing ${activeBreakpoint} override`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={activeBreakpoint === "desktop" ? "outline" : "secondary"}>{activeBreakpoint}</Badge>
                        {activeBreakpoint !== "desktop" ? (
                          <Button size="sm" variant="ghost" onClick={resetSelectedBreakpointOverride} disabled={!selectedBreakpointOverride}>
                            Reset
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    <section className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3" data-builder-property-schema="">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Property schema</h4>
                          <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                            {selectedPropertyIssues.length > 0
                              ? `${selectedPropertyIssues.length} 个属性问题会进入构建前检查。`
                              : `${selectedPropertySchema.length} 个字段通过当前控件契约。`}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {selectedPropertyAutoFixCount > 0 ? (
                            <Button size="sm" variant="secondary" onClick={applySelectedPropertyAutoFix}>
                              <Wand2 aria-hidden className="size-4" />
                              Fix {selectedPropertyAutoFixCount}
                            </Button>
                          ) : null}
                          <Badge
                            variant={
                              selectedPropertyIssues.some((issue) => issue.severity === "error")
                                ? "destructive"
                                : selectedPropertyIssues.length > 0
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {selectedPropertyIssues.some((issue) => issue.severity === "error")
                              ? "error"
                              : selectedPropertyIssues.length > 0
                                ? "warning"
                                : "ready"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPropertySchema.slice(0, 8).map((field) => (
                          <span
                            key={`${String(field.prop)}-${field.label}`}
                            className="max-w-full truncate rounded-full border border-outline bg-surface-container-low px-2 py-1 text-[0.68rem] text-on-surface-variant"
                            title={propertySchemaHint(field)}
                          >
                            {field.label}
                            {field.required ? " *" : field.recommended ? " rec" : ""}
                          </span>
                        ))}
                        {selectedPropertySchema.length > 8 ? (
                          <span className="rounded-full border border-outline bg-surface-container-low px-2 py-1 text-[0.68rem] text-on-surface-variant">
                            +{selectedPropertySchema.length - 8}
                          </span>
                        ) : null}
                      </div>
                      {selectedPropertyIssues.length > 0 ? (
                        <div className="space-y-2">
                          {selectedPropertyIssues.slice(0, 4).map((issue) => (
                            <div key={issue.id} className="flex min-w-0 items-start gap-2 rounded-xl bg-surface-container-low p-2 text-xs">
                              <AlertTriangle
                                aria-hidden
                                className={cn("mt-0.5 size-3.5 shrink-0", issue.severity === "error" ? "text-destructive" : "text-on-surface-variant")}
                              />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-on-surface">{issue.label}</p>
                                <p className="mt-0.5 leading-5 text-on-surface-variant">{issue.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-2 text-xs text-on-surface-variant">
                          <CheckCircle2 aria-hidden className="size-3.5 text-primary" />
                          <span>属性值、枚举和范围都符合当前控件 schema。</span>
                        </div>
                      )}
                    </section>

                    {selectedControlReverseDependency ? (
                      <section
                        className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3"
                        data-builder-selected-control-impact=""
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Dependency impact</h4>
                              <Badge variant={reverseDependencyStatusVariant(selectedControlReverseDependency.status)}>
                                {reverseDependencyStatusLabel(selectedControlReverseDependency.status)}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-on-surface-variant">{selectedControlReverseDependency.summary}</p>
                          </div>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label="查看控件生成目标"
                            onClick={() => selectProjectReverseDependencyOutputs(selectedControlReverseDependency)}
                          >
                            <FileJson aria-hidden className="size-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedControlReverseDependency.scopeIds.slice(0, 4).map((scopeId) => (
                            <span key={scopeId} className="rounded-full bg-surface-container-low px-2 py-1 text-[0.68rem] text-on-surface-variant">
                              {scopeId}
                            </span>
                          ))}
                        </div>
                        {selectedControlReverseDependency.affectedPaths.length > 0 ? (
                          <div className="space-y-1">
                            {selectedControlReverseDependency.affectedPaths.slice(0, 2).map((path) => (
                              <p key={path} className="truncate font-mono text-[0.68rem] text-on-surface-variant" title={path}>
                                {path}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </section>
                    ) : null}

                    <div className="grid grid-cols-2 gap-2">
                      <Field label="X">
                        <Input
                          type="number"
                          inputSize="sm"
                          value={selectedItem.x}
                          onChange={(event) => updateSelectedLayout({ x: numberFromInput(event.target.value, selectedItem.x, 0, page.width) })}
                        />
                      </Field>
                      <Field label="Y">
                        <Input
                          type="number"
                          inputSize="sm"
                          value={selectedItem.y}
                          onChange={(event) => updateSelectedLayout({ y: numberFromInput(event.target.value, selectedItem.y, 0, page.height) })}
                        />
                      </Field>
                      <Field label="宽度">
                        <Input
                          type="number"
                          inputSize="sm"
                          value={selectedItem.width}
                          onChange={(event) => updateSelectedLayout({ width: numberFromInput(event.target.value, selectedItem.width, MIN_ITEM_WIDTH, page.width) })}
                        />
                      </Field>
                      <Field label="高度">
                        <Input
                          type="number"
                          inputSize="sm"
                          value={selectedItem.height}
                          onChange={(event) => updateSelectedLayout({ height: numberFromInput(event.target.value, selectedItem.height, MIN_ITEM_HEIGHT, page.height) })}
                        />
                      </Field>
                    </div>

                    <Field label="父容器">
                      <Select value={selectedItem.parentId ?? "__canvas"} onValueChange={updateSelectedParent}>
                        <SelectTrigger data-builder-parent-select="">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__canvas">Canvas</SelectItem>
                          {availableParentFrames.map((frame) => (
                            <SelectItem key={frame.id} value={frame.id}>
                              {getItemSummary(frame)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    {selectedParentAutoLayout ? (
                      <div className="rounded-[18px] bg-surface-container-high p-3 text-xs leading-5 text-on-surface-variant">
                        当前控件由父 Frame 的自动布局控制，X/Y 主要作为保存的参考坐标。
                      </div>
                    ) : null}

                    {selectedConstraints ? (
                      <section className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Constraints</h4>
                            <p className="mt-1 text-xs text-on-surface-variant">父级尺寸变化时保持边距或拉伸。</p>
                          </div>
                          <Badge variant={selectedParentAutoLayout ? "outline" : "secondary"}>{selectedParentAutoLayout ? "layout" : "anchors"}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={selectedConstraints.left ? "secondary" : "outline"}
                            disabled={selectedParentAutoLayout}
                            onClick={() => toggleSelectedConstraint("constraintLeft")}
                          >
                            Left
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={selectedConstraints.right ? "secondary" : "outline"}
                            disabled={selectedParentAutoLayout}
                            onClick={() => toggleSelectedConstraint("constraintRight")}
                          >
                            Right
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={selectedConstraints.top ? "secondary" : "outline"}
                            disabled={selectedParentAutoLayout}
                            onClick={() => toggleSelectedConstraint("constraintTop")}
                          >
                            Top
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={selectedConstraints.bottom ? "secondary" : "outline"}
                            disabled={selectedParentAutoLayout}
                            onClick={() => toggleSelectedConstraint("constraintBottom")}
                          >
                            Bottom
                          </Button>
                        </div>
                      </section>
                    ) : null}

                    {selectedItem.type === "frame" ? (
                      <section className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Frame Layout</h4>
                            <p className="mt-1 text-xs text-on-surface-variant">控制子控件的排列方式。</p>
                          </div>
                          <Badge variant={frameLayoutMode(selectedItem) === "free" ? "outline" : "secondary"}>{frameLayoutMode(selectedItem)}</Badge>
                        </div>
                        <Field label="布局模式">
                          <SegmentedControl
                            aria-label="Frame 布局模式"
                            value={frameLayoutMode(selectedItem)}
                            onValueChange={(value) => updateSelectedProps({ layoutMode: value as FrameLayoutMode })}
                            options={[
                              { value: "free", label: "Free" },
                              { value: "row", label: "Row" },
                              { value: "column", label: "Column" },
                              { value: "grid", label: "Grid" },
                            ]}
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="间距">
                            <Input
                              type="number"
                              inputSize="sm"
                              value={frameLayoutMetrics(selectedItem).gap}
                              onChange={(event) => updateSelectedProps({ layoutGap: numberFromInput(event.target.value, frameLayoutMetrics(selectedItem).gap, 0, 80) })}
                            />
                          </Field>
                          <Field label="内边距">
                            <Input
                              type="number"
                              inputSize="sm"
                              value={frameLayoutMetrics(selectedItem).padding}
                              onChange={(event) =>
                                updateSelectedProps({ layoutPadding: numberFromInput(event.target.value, frameLayoutMetrics(selectedItem).padding, 0, 80) })
                              }
                            />
                          </Field>
                        </div>
                        {frameLayoutMode(selectedItem) === "grid" ? (
                          <Field label="列数">
                            <Input
                              type="number"
                              inputSize="sm"
                              value={frameLayoutMetrics(selectedItem).columns}
                              onChange={(event) =>
                                updateSelectedProps({ layoutColumns: numberFromInput(event.target.value, frameLayoutMetrics(selectedItem).columns, 1, 6) })
                              }
                            />
                          </Field>
                        ) : null}
                      </section>
                    ) : null}

                    {selectedItem.type === "image" ? (
                      <>
                        <Field label="绑定资源">
                          <Select
                            value={selectedItem.props.assetId || "__none"}
                            onValueChange={(value) => {
                              if (value === "__none") {
                                updateSelectedProps({ assetId: "", assetPath: "", label: "Image" });
                                return;
                              }
                              bindSelectedImageAsset(value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">未绑定</SelectItem>
                              {activeProject.assets.map((asset) => (
                                <SelectItem key={asset.id} value={asset.id}>
                                  {asset.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="图片适配">
                          <Select value={selectedItem.props.objectFit ?? "cover"} onValueChange={(value) => updateSelectedProps({ objectFit: value as ImageFit })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cover">Cover</SelectItem>
                              <SelectItem value="contain">Contain</SelectItem>
                              <SelectItem value="fill">Fill</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="替代文本">
                          <Input value={selectedItem.props.alt ?? ""} onChange={(event) => updateSelectedProps({ alt: event.target.value })} />
                        </Field>
                      </>
                    ) : null}

                    {"title" in selectedItem.props ? (
                      <Field label="标题">
                        <Input value={selectedItem.props.title ?? ""} onChange={(event) => updateSelectedProps({ title: event.target.value })} />
                      </Field>
                    ) : null}

                    {"label" in selectedItem.props ? (
                      <Field label="标签">
                        <Input value={selectedItem.props.label ?? ""} onChange={(event) => updateSelectedProps({ label: event.target.value })} />
                      </Field>
                    ) : null}

                    {"value" in selectedItem.props ? (
                      <Field label="值">
                        <Input value={selectedItem.props.value ?? ""} onChange={(event) => updateSelectedProps({ value: event.target.value })} />
                      </Field>
                    ) : null}

                    {selectedItem.type === "select" ? (
                      <section className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Select options</h4>
                            <p className="mt-1 text-xs text-on-surface-variant">候选项会写入生成 app 的 Select 控件。</p>
                          </div>
                          <Badge variant="outline">{selectOptionsForItem(selectedItem).length} options</Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <Field label="Option A">
                            <Input value={selectedItem.props.optionA ?? ""} onChange={(event) => updateSelectedProps({ optionA: event.target.value })} />
                          </Field>
                          <Field label="Option B">
                            <Input value={selectedItem.props.optionB ?? ""} onChange={(event) => updateSelectedProps({ optionB: event.target.value })} />
                          </Field>
                          <Field label="Option C">
                            <Input value={selectedItem.props.optionC ?? ""} onChange={(event) => updateSelectedProps({ optionC: event.target.value })} />
                          </Field>
                        </div>
                      </section>
                    ) : null}

                    {"description" in selectedItem.props ? (
                      <Field label="说明">
                        <Textarea value={selectedItem.props.description ?? ""} onChange={(event) => updateSelectedProps({ description: event.target.value })} />
                      </Field>
                    ) : null}

                    {"placeholder" in selectedItem.props ? (
                      <Field label="占位文本">
                        <Input value={selectedItem.props.placeholder ?? ""} onChange={(event) => updateSelectedProps({ placeholder: event.target.value })} />
                      </Field>
                    ) : null}

                    {"helper" in selectedItem.props ? (
                      <Field label="辅助说明">
                        <Input value={selectedItem.props.helper ?? ""} onChange={(event) => updateSelectedProps({ helper: event.target.value })} />
                      </Field>
                    ) : null}

                    {selectedBindableProps.length > 0 ? (
                      <section className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">State binding</h4>
                            <p className="mt-1 text-xs text-on-surface-variant">将控件属性绑定到项目级共享状态。</p>
                          </div>
                          <Badge variant="outline">{activeProject.stateVariables.length} states</Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedBindableProps.map((prop) => (
                            <Field key={prop.value} label={prop.label}>
                              <Select
                                value={selectedItem.props.stateBindings?.[prop.value] || "__none"}
                                onValueChange={(value) => updateSelectedStateBinding(prop.value, value === "__none" ? "" : value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none">No state</SelectItem>
                                  {activeProject.stateVariables.map((state) => (
                                    <SelectItem key={state.id} value={state.id}>
                                      {state.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </Field>
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {selectedItem.type === "button" || selectedItem.type === "badge" ? (
                      <Field label="样式">
                        <Select value={selectedItem.props.variant ?? "default"} onValueChange={(value) => updateSelectedProps({ variant: value as ButtonVariant })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                            <SelectItem value="ghost">Ghost</SelectItem>
                            <SelectItem value="destructive">Destructive</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    ) : null}

                    {selectedItem.type === "button" ? (
                      <Field label="按钮尺寸">
                        <Select value={selectedItem.props.size ?? "md"} onValueChange={(value) => updateSelectedProps({ size: value as ControlSize })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sm">Small</SelectItem>
                            <SelectItem value="md">Medium</SelectItem>
                            <SelectItem value="lg">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    ) : null}

                    {selectedEventName ? (
                      <Field label="Event binding">
                        <Select
                          value={
                            selectedEventCommandId && activeProject.rustCommands.some((command) => command.id === selectedEventCommandId)
                              ? selectedEventCommandId
                              : "__none"
                          }
                          onValueChange={(value) => updateSelectedEventCommand(selectedEventName, value === "__none" ? "" : value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none">No command</SelectItem>
                            {activeProject.rustCommands.map((command) => (
                              <SelectItem key={command.id} value={command.id}>
                                {sanitizeRustCommandName(command.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-high p-3">
                          <div className="min-w-0">
                            <Label className="text-xs font-medium">Command args</Label>
                            <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                              {selectedEventCommandArgs.length > 0
                                ? `触发时会传入 ${selectedEventCommandArgs.length} 个命名参数。`
                                : "当前 Rust command 没有参数。"}
                            </p>
                          </div>
                          <Switch
                            checked={selectedEventCommandArgs.length > 0 || Boolean(selectedEventBinding?.passValue && selectedEventCommand?.acceptsValue)}
                            disabled={selectedEventCommandArgs.length > 0 || !selectedEventCommand?.acceptsValue}
                            onCheckedChange={(passValue) => updateSelectedEventBinding(selectedEventName, { passValue })}
                          />
                        </div>
                        {selectedEventCommand?.acceptsValue ? (
                          <div className="space-y-3 rounded-xl bg-surface-container-high p-3">
                            <Field label="Payload mode">
                              <Select
                                value={selectedEventBinding?.payloadMode ?? "value"}
                                disabled={!selectedEventBinding?.passValue || selectedEventCommandArgs.length > 0}
                                onValueChange={(payloadMode) =>
                                  updateSelectedEventBinding(selectedEventName, {
                                    payloadMode: payloadMode === "json" ? "json" : "value",
                                    payloadFields: payloadMode === "json" ? eventPayloadFieldSelection(selectedEventBinding) : undefined,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="value">Current value</SelectItem>
                                  <SelectItem value="json">JSON payload</SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>
                            {selectedEventBinding?.passValue && selectedEventBinding.payloadMode === "json" ? (
                              <div className="grid grid-cols-2 gap-2">
                                {eventPayloadFields.map((field) => (
                                  <label
                                    key={field.value}
                                    className="flex min-w-0 items-start gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-2 text-xs"
                                  >
                                    <Checkbox
                                      className="mt-0.5 size-4"
                                      checked={eventPayloadFieldSelection(selectedEventBinding).includes(field.value)}
                                      onCheckedChange={(checked) =>
                                        updateSelectedEventBinding(selectedEventName, {
                                          payloadMode: "json",
                                          payloadFields: payloadFieldsWithToggle(selectedEventBinding, field.value, Boolean(checked)),
                                        })
                                      }
                                    />
                                    <span className="min-w-0">
                                      <span className="block truncate font-medium text-on-surface">{field.label}</span>
                                      <span className="block truncate text-on-surface-variant">{field.description}</span>
                                    </span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs leading-5 text-on-surface-variant">
                                {selectedEventCommandArgs.length > 0
                                  ? "多参数命令使用命令属性里的来源映射；Payload mode 仅用于旧的单 value 参数。"
                                  : "默认传入控件的当前 value/checked。切到 JSON payload 后可把事件上下文和 state 快照一起传给 Rust。"}
                              </p>
                            )}
                          </div>
                        ) : null}
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="Result target">
                            <Select
                              value={selectedEventBinding?.resultTargetItemId || "__none"}
                              onValueChange={(value) =>
                                updateSelectedEventBinding(selectedEventName, {
                                  resultTargetItemId: value === "__none" ? "" : value,
                                  resultTargetProp: value === "__none" ? undefined : selectedEventBinding?.resultTargetProp ?? "value",
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none">None</SelectItem>
                                {eventResultTargets.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {getItemSummary(item)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Target prop">
                            <Select
                              value={selectedEventBinding?.resultTargetProp || "__none"}
                              disabled={!selectedEventBinding?.resultTargetItemId}
                              onValueChange={(value) =>
                                updateSelectedEventBinding(selectedEventName, {
                                  resultTargetProp: value === "__none" ? undefined : (value as BuilderResultTargetProp),
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none">None</SelectItem>
                                {eventResultTargetProps.map((prop) => (
                                  <SelectItem key={prop.value} value={prop.value}>
                                    {prop.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>
                        <Field label="Result state">
                          <Select
                            value={selectedEventBinding?.resultStateId || "__none"}
                            onValueChange={(value) => updateSelectedEventBinding(selectedEventName, { resultStateId: value === "__none" ? "" : value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">No state</SelectItem>
                              {activeProject.stateVariables.map((state) => (
                                <SelectItem key={state.id} value={state.id}>
                                  {state.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-high p-3">
                          <div className="min-w-0">
                            <Label className="text-xs font-medium">Apply JSON state patch</Label>
                            <p className="mt-1 text-xs leading-5 text-on-surface-variant">Rust 返回对象时，用 key 匹配 state name/id 并批量更新。</p>
                          </div>
                          <Switch
                            checked={Boolean(selectedEventBinding?.applyJsonStatePatch)}
                            onCheckedChange={(applyJsonStatePatch) => updateSelectedEventBinding(selectedEventName, { applyJsonStatePatch })}
                          />
                        </div>
                        <p className="text-xs leading-5 text-on-surface-variant">
                          生成 app 后，控件触发 <span className="font-mono">{selectedEventName}</span> 时会通过 Tauri invoke 调用绑定的 Rust command。
                        </p>
                      </Field>
                    ) : null}

                    {selectedItem.type === "switch" || selectedItem.type === "checkbox" ? (
                      <div className="flex items-center justify-between rounded-xl bg-surface-container-high p-3">
                        <Label>默认选中</Label>
                        <Switch checked={Boolean(selectedItem.props.checked)} onCheckedChange={(checked) => updateSelectedProps({ checked })} />
                      </div>
                    ) : null}

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="secondary" size="sm" onClick={bringToFront}>
                        <MoveUp aria-hidden className="size-4" />
                        置顶
                      </Button>
                      <Button variant="secondary" size="sm" onClick={sendToBack}>
                        <MoveDown aria-hidden className="size-4" />
                        置底
                      </Button>
                      <Button variant="secondary" size="sm" onClick={duplicateSelected}>
                        <Copy aria-hidden className="size-4" />
                        复制
                      </Button>
                      <Button variant="destructive" size="sm" onClick={requestDeleteSelected}>
                        <Trash2 aria-hidden className="size-4" />
                        删除
                      </Button>
                    </div>
                  </section>
                ) : (
                  <section className="rounded-[22px] border border-dashed border-outline-variant p-6 text-center text-sm text-on-surface-variant">
                    选择画布上的控件后，可以编辑坐标、尺寸、文本和状态。
                  </section>
                )}
              </div>
                </>
              ) : rightDockTab === "connections" ? (
                <section className="space-y-4">
                  <PanelTitle icon={Braces} title="Connections" description="把控件事件绑定到 Rust command，并设置结果回写。" />
                  {selectedItem && selectedEventName ? (
                    <div className="space-y-4 rounded-[22px] bg-surface-container-low p-3">
                      <div className="rounded-2xl border border-outline-variant bg-surface-container p-3">
                        <p className="truncate text-sm font-medium">{getItemSummary(selectedItem)}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {selectedItem.name} · {selectedItem.type} · event {selectedEventName}
                        </p>
                      </div>
                      <Field label="Rust command">
                        <Select
                          value={
                            selectedEventCommandId && activeProject.rustCommands.some((command) => command.id === selectedEventCommandId)
                              ? selectedEventCommandId
                              : "__none"
                          }
                          onValueChange={(value) => updateSelectedEventCommand(selectedEventName, value === "__none" ? "" : value)}
                        >
                          <SelectTrigger data-builder-inspector-event-command="">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none">No command</SelectItem>
                            {activeProject.rustCommands.map((command) => (
                              <SelectItem key={command.id} value={command.id}>
                                {sanitizeRustCommandName(command.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          data-builder-connection-simulate=""
                          onClick={() => simulateSelectedEvent()}
                          disabled={!selectedEventCommand}
                        >
                          <Play aria-hidden className="size-4" />
                          Simulate
                        </Button>
                        <Button size="sm" variant="secondary" data-builder-connection-new-command="" onClick={() => createAndBindBackendIntegrationCommand()}>
                          <Plus aria-hidden className="size-4" />
                          Bind new
                        </Button>
                      </div>
                      <div className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs leading-5 text-on-surface-variant">
                        {selectedEventCommand
                          ? `${selectedEventCommandArgs.length} argument(s) · ${commandResultSchema(selectedEventCommand).mode} result · ${selectedEventBinding?.resultStateId ? "writes state" : "no state write"}`
                          : "选择或创建 Rust command 后，Preview 模式可以真实模拟事件调用。"}
                      </div>
                      {selectedLatestSimulatorTrace ? (
                        <div className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs" data-builder-connection-last-run="">
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{selectedLatestSimulatorTrace.commandName}</p>
                              <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                                {selectedLatestSimulatorTrace.itemName} · {selectedLatestSimulatorTrace.eventName} · {selectedLatestSimulatorTrace.time}
                              </p>
                            </div>
                            <Badge variant={selectedLatestSimulatorTrace.status === "error" ? "destructive" : "secondary"}>{selectedLatestSimulatorTrace.status}</Badge>
                          </div>
                          <p className="line-clamp-3 text-on-surface-variant">{selectedLatestSimulatorTrace.message}</p>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-outline-variant p-6 text-center text-sm text-on-surface-variant">
                      选择 Button、Input、Switch、Select 等可交互控件后，可以管理事件连接。
                    </div>
                  )}
                </section>
              ) : rightDockTab === "responsive" ? (
                <section className="space-y-4">
                  <PanelTitle icon={Monitor} title="Responsive" description="查看当前断点、画布尺寸和选中控件的响应式状态。" />
                  <div className="space-y-3 rounded-[22px] bg-surface-container-low p-3">
                    <SegmentedControl
                      aria-label="Inspector responsive breakpoint"
                      value={activeBreakpoint}
                      onValueChange={(value) => setResponsiveBreakpoint(value as ResponsiveBreakpointId)}
                      options={[
                        { value: "desktop", label: "Desktop" },
                        { value: "tablet", label: "Tablet" },
                        { value: "mobile", label: "Mobile" },
                      ]}
                    />
                    <div className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                      <PathRow label="Canvas" value={`${page.width} x ${page.height} · ${responsiveBreakpointSize(activeBreakpoint, page).width}px guide`} />
                      <PathRow label="Preset" value={page.preset} />
                      <PathRow label="Zoom" value={`${Math.round(page.zoom * 100)}%`} />
                    </div>
                    {selectedItem ? (
                      <div className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                        <PathRow label="Selected" value={getItemSummary(selectedItem)} />
                        <PathRow label="Bounds" value={`x ${selectedItem.x}, y ${selectedItem.y}, ${selectedItem.width} x ${selectedItem.height}`} />
                        <PathRow
                          label="Constraints"
                          value={
                            Object.entries(itemConstraints(selectedItem))
                              .filter(([, enabled]) => enabled)
                              .map(([name]) => name)
                              .join(", ") || "none"
                          }
                        />
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-outline-variant p-4 text-center text-xs text-on-surface-variant">
                        选中控件后会显示响应式覆盖与约束摘要。
                      </div>
                    )}
                  </div>
                </section>
              ) : (
                <section className="space-y-4">
                  <PanelTitle icon={AlertTriangle} title="Impact" description="反向查看当前选择会影响哪些生成文件、检查和构建动作。" />
                  <div className="space-y-3 rounded-[22px] bg-surface-container-low p-3">
                    {selectedControlReverseDependency ? (
                      <div className="rounded-2xl border border-outline-variant bg-surface-container p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{selectedControlReverseDependency.target?.label ?? "Selected control"}</p>
                            <p className="mt-1 text-xs leading-5 text-on-surface-variant">{selectedControlReverseDependency.summary}</p>
                          </div>
                          <Badge variant={reverseDependencyStatusVariant(selectedControlReverseDependency.status)}>
                            {reverseDependencyStatusLabel(selectedControlReverseDependency.status)}
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedControlReverseDependency.scopeIds.slice(0, 4).map((scopeId) => (
                            <Badge key={scopeId} variant="outline">
                              {scopeId}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          className="mt-3 w-full"
                          variant="secondary"
                          onClick={() => selectProjectReverseDependencyOutputs(selectedControlReverseDependency)}
                        >
                          <ArrowRight aria-hidden className="size-4" />
                          Select generated outputs
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-outline-variant p-4 text-center text-xs leading-5 text-on-surface-variant">
                        当前没有选中控件；选择画布节点后会显示依赖影响。
                      </div>
                    )}
                    <div className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                      <PathRow label="Tracked" value={`${reverseDependencySummaries.length} source(s)`} />
                      <PathRow label="Graph" value={projectDependencyGraph ? "loaded" : "not loaded"} />
                    </div>
                  </div>
                </section>
              )}
            </InspectorDock>
          </DesignWorkspace>
        )}
        </div>
            <OutputDock
              tabs={bottomDockTabs}
              activeTab={bottomDockTab}
              onTabChange={setBottomDockTab}
              expanded={bottomDockExpanded}
              onExpandedChange={(expanded) => {
                setBottomDockExpanded(expanded);
                setBottomDockMinimized(false);
              }}
              minimized={bottomDockMinimized}
              onMinimizedChange={setBottomDockMinimized}
            >
              {bottomDockTab === "issues" ? (
                bottomDockExpanded ? (
                  <div className="grid gap-3 text-xs xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <div className="max-h-56 space-y-2 overflow-auto pr-1">
                      {buildError ? (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                          <div className="mb-1 flex items-center gap-2">
                            <AlertTriangle aria-hidden className="size-4" />
                            <span className="font-medium">Build error</span>
                          </div>
                          <p className="line-clamp-2 leading-5">{buildError}</p>
                        </div>
                      ) : null}
                      {buildDiagnostics.length > 0 ? (
                        buildDiagnostics.slice(0, 16).map((diagnostic, index) => {
                          const isSelected = diagnostic === selectedBuildDiagnostic;
                          const canFocusDiagnostic = isEditableRustDiagnostic(diagnostic);
                          return (
                            <button
                              key={`${diagnostic.message}-${index}`}
                              type="button"
                              aria-selected={isSelected}
                              className={cn(
                                "focus-ring w-full rounded-xl border p-3 text-left transition",
                                isSelected
                                  ? "border-primary bg-primary/10"
                                  : "border-outline-variant bg-surface-container-high hover:border-outline",
                              )}
                              onClick={() => openBuildDiagnostic(diagnostic, index, false)}
                            >
                              <span className="mb-1 flex min-w-0 items-center gap-2">
                                <Badge variant={diagnostic.severity === "error" ? "destructive" : "outline"}>{diagnostic.severity}</Badge>
                                {diagnostic.code ? <Badge variant="outline">{diagnostic.code}</Badge> : null}
                                {!canFocusDiagnostic ? <Badge variant="secondary">log</Badge> : null}
                                {diagnostic.file ? (
                                  <span className="min-w-0 truncate font-mono text-[0.68rem] text-on-surface-variant">
                                    {diagnostic.file}:{diagnostic.line ?? "-"}
                                  </span>
                                ) : null}
                              </span>
                              <span className="line-clamp-2 leading-5 text-on-surface-variant">{diagnostic.message}</span>
                            </button>
                          );
                        })
                      ) : !buildError ? (
                        <div className="rounded-xl border border-dashed border-outline-variant p-4 text-center text-on-surface-variant">
                          No active issues. Build diagnostics and validation problems will appear here.
                        </div>
                      ) : null}
                    </div>
                    <div className="min-h-44 rounded-xl border border-outline-variant bg-surface-container-high p-3">
                      {selectedBuildDiagnostic ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <Badge variant={selectedBuildDiagnostic.severity === "error" ? "destructive" : "outline"}>
                                {selectedBuildDiagnostic.severity}
                              </Badge>
                              {selectedBuildDiagnostic.code ? <Badge variant="outline">{selectedBuildDiagnostic.code}</Badge> : null}
                              {selectedBuildDiagnostic.origin ? <Badge variant="secondary">{selectedBuildDiagnostic.origin}</Badge> : null}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {isEditableRustDiagnostic(selectedBuildDiagnostic) ? (
                                <Button size="sm" variant="secondary" onClick={() => focusRustDiagnostic(selectedBuildDiagnostic)}>
                                  <MousePointer2 aria-hidden className="size-4" />
                                  定位源码
                                </Button>
                              ) : null}
                              <Button size="sm" variant="ghost" onClick={() => setBottomDockTab("logs")}>
                                <FileJson aria-hidden className="size-4" />
                                完整日志
                              </Button>
                            </div>
                          </div>
                          <p className="leading-5 text-on-surface">{selectedBuildDiagnostic.message}</p>
                          <div className="grid gap-2 md:grid-cols-2">
                            <PathRow label="File" value={selectedBuildDiagnostic.file || "Cargo output"} />
                            <PathRow
                              label="Location"
                              value={
                                selectedBuildDiagnostic.line
                                  ? `line ${selectedBuildDiagnostic.line}, column ${selectedBuildDiagnostic.column ?? 1}`
                                  : "No direct source location"
                              }
                            />
                            <PathRow label="Mapped source" value={selectedBuildDiagnostic.sourceFile || "Not mapped to editor source"} />
                            <PathRow
                              label="Source line"
                              value={
                                selectedBuildDiagnostic.sourceLine
                                  ? `line ${selectedBuildDiagnostic.sourceLine}, column ${selectedBuildDiagnostic.sourceColumn ?? 1}`
                                  : "Unavailable"
                              }
                            />
                          </div>
                          {!isEditableRustDiagnostic(selectedBuildDiagnostic) ? (
                            <p className="rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 leading-5 text-on-surface-variant">
                              这个诊断来自生成 app、依赖或 Cargo 输出，当前无法安全映射到编辑器里的 Rust 逻辑源码。
                            </p>
                          ) : null}
                          {selectedBuildDiagnostic.rendered ? (
                            <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-container-low p-3 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                              {selectedBuildDiagnostic.rendered}
                            </pre>
                          ) : null}
                        </div>
                      ) : buildError ? (
                        <div className="space-y-3">
                          <Badge variant="destructive">build error</Badge>
                          <p className="leading-5 text-destructive">{buildError}</p>
                          <Button size="sm" variant="secondary" onClick={() => setBottomDockTab("logs")}>
                            <FileJson aria-hidden className="size-4" />
                            完整日志
                          </Button>
                        </div>
                      ) : (
                        <div className="flex h-full min-h-36 items-center justify-center rounded-xl border border-dashed border-outline-variant text-center text-on-surface-variant">
                          No issue selected.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2 text-xs xl:grid-cols-2">
                    {buildError ? (
                      <button
                        type="button"
                        className="focus-ring rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-left text-destructive"
                        onClick={() => setBottomDockExpanded(true)}
                      >
                        <span className="mb-1 flex items-center gap-2 font-medium">
                          <AlertTriangle aria-hidden className="size-4" />
                          Build error
                        </span>
                        <span className="line-clamp-2 leading-5">{buildError}</span>
                      </button>
                    ) : null}
                    {buildDiagnostics.length > 0 ? (
                      buildDiagnostics.slice(0, 4).map((diagnostic, index) => (
                        <button
                          key={`${diagnostic.message}-${index}`}
                          type="button"
                          className="focus-ring rounded-xl border border-outline-variant bg-surface-container-high p-3 text-left transition hover:border-outline"
                          onClick={() => openBuildDiagnostic(diagnostic, index, false)}
                        >
                          <span className="mb-1 flex min-w-0 items-center gap-2">
                            <Badge variant={diagnostic.severity === "error" ? "destructive" : "outline"}>{diagnostic.severity}</Badge>
                            {!isEditableRustDiagnostic(diagnostic) ? <Badge variant="secondary">log</Badge> : null}
                            {diagnostic.file ? <span className="min-w-0 truncate font-mono text-[0.68rem]">{diagnostic.file}</span> : null}
                          </span>
                          <span className="line-clamp-2 leading-5 text-on-surface-variant">{diagnostic.message}</span>
                        </button>
                      ))
                    ) : !buildError ? (
                      <div className="rounded-xl border border-dashed border-outline-variant p-4 text-center text-on-surface-variant">
                        No active issues. Build diagnostics and validation problems will appear here.
                      </div>
                    ) : null}
                  </div>
                )
              ) : bottomDockTab === "output" ? (
                <div className="grid gap-3 text-xs xl:grid-cols-3">
                  <div className={cn("rounded-xl border border-outline-variant bg-surface-container-high", bottomDockExpanded ? "p-3" : "p-2.5")}>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">Pipeline</p>
                        <p className={cn("mt-1 leading-5 text-on-surface", bottomDockExpanded ? "line-clamp-2" : "line-clamp-1")}>
                          {latestReleasePipeline ? latestReleasePipeline.summary : "No release pipeline yet"}
                        </p>
                      </div>
                      <Badge variant={latestReleasePipeline ? projectTaskStatusVariant(latestReleasePipeline.status as ProjectTaskStatus) : "outline"}>
                        {latestReleasePipeline?.status ?? "idle"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openBottomDock("tasks")}
                      >
                        <ClipboardCopy aria-hidden className="size-4" />
                        Tasks
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setBottomDockTab("logs")}>
                        <FileJson aria-hidden className="size-4" />
                        Logs
                      </Button>
                    </div>
                  </div>
                  <div className={cn("rounded-xl border border-outline-variant bg-surface-container-high", bottomDockExpanded ? "p-3" : "p-2.5")}>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">Executable</p>
                        <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface">
                          {activeProject.outputExePath ? fileNameFromPath(activeProject.outputExePath) : "Build output pending"}
                        </p>
                      </div>
                      <Badge variant={activeProject.outputExePath ? "secondary" : "outline"}>{activeProject.outputExePath ? "exe" : "pending"}</Badge>
                    </div>
                    {bottomDockExpanded ? (
                      <p className="mb-3 line-clamp-2 break-all font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                        {activeProject.outputExePath || "Run Build to produce a desktop executable."}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="secondary" disabled={!activeProject.outputExePath} onClick={() => void openLocalArtifact(activeProject.outputExePath || "")}>
                        <Play aria-hidden className="size-4" />
                        {bottomDockExpanded ? "Run exe" : "Run"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={!activeProject.outputExePath}
                        onClick={() => void openLocalArtifact(parentPathFromPath(activeProject.outputExePath || ""))}
                      >
                        <FolderOpen aria-hidden className="size-4" />
                        {bottomDockExpanded ? "Folder" : "Dir"}
                      </Button>
                      <Button size="sm" variant="ghost" disabled={!activeProject.outputExePath} onClick={() => void copyArtifactPath(activeProject.outputExePath || "")}>
                        <ClipboardCopy aria-hidden className="size-4" />
                        {copiedArtifactPath === activeProject.outputExePath ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>
                  <div className={cn("rounded-xl border border-outline-variant bg-surface-container-high", bottomDockExpanded ? "p-3" : "p-2.5")}>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">Bundle</p>
                        <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface">
                          {activeBundlePath ? fileNameFromPath(activeBundlePath) : activeBundleDir ? fileNameFromPath(activeBundleDir) : "Bundle output pending"}
                        </p>
                      </div>
                      <Badge variant={activeBundlePath || activeBundleDir ? "secondary" : "outline"}>{activeBundlePath ? "installer" : activeBundleDir ? "folder" : "pending"}</Badge>
                    </div>
                    {bottomDockExpanded ? (
                      <p className="mb-3 line-clamp-2 break-all font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                        {activeBundlePath || activeBundleDir || "Run Installer bundle to produce distributable artifacts."}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={!(activeBundlePath || activeBundleDir)}
                        onClick={() => void openLocalArtifact(activeBundlePath || activeBundleDir || "")}
                      >
                        <FolderOpen aria-hidden className="size-4" />
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={!(activeBundlePath || activeBundleDir)}
                        onClick={() => void openLocalArtifact(activeBundleDir || parentPathFromPath(activeBundlePath || ""))}
                      >
                        <FolderOpen aria-hidden className="size-4" />
                        {bottomDockExpanded ? "Folder" : "Dir"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={!(activeBundlePath || activeBundleDir)}
                        onClick={() => void copyArtifactPath(activeBundlePath || activeBundleDir || "")}
                      >
                        <ClipboardCopy aria-hidden className="size-4" />
                        {copiedArtifactPath === (activeBundlePath || activeBundleDir) ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : bottomDockTab === "tasks" ? (
                bottomDockExpanded ? (
                  <div className="grid gap-3 text-xs xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <div className="max-h-56 space-y-2 overflow-auto pr-1">
                      {visibleProjectTasks.slice(0, 8).map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          className={cn(
                            "focus-ring w-full rounded-xl border p-3 text-left transition",
                            selectedProjectTask?.id === task.id ? "border-primary bg-primary/10" : "border-outline-variant bg-surface-container-high hover:border-outline",
                          )}
                          onClick={() => {
                            setSelectedProjectTaskId(task.id);
                            setProjectTaskLogSearchQuery("");
                          }}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate font-medium">{task.title}</span>
                            <Badge variant={projectTaskStatusVariant(task.status)}>{task.status}</Badge>
                          </span>
                          <span className="mt-1 block truncate text-on-surface-variant">{projectTaskKindLabel(task.kind)} · {projectTaskElapsedLabel(task)}</span>
                          <span className="mt-1 block line-clamp-1 text-[0.68rem] text-on-surface-variant">{task.summary ?? task.detail}</span>
                        </button>
                      ))}
                      {visibleProjectTasks.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-outline-variant p-4 text-center text-on-surface-variant">
                          No tasks yet.
                        </div>
                      ) : null}
                    </div>
                    <div className="min-h-0 rounded-xl border border-outline-variant bg-surface-container-high p-3">
                      {selectedProjectTask ? (
                        <div className="min-h-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-on-surface">{selectedProjectTask.title}</p>
                              <p className="mt-1 line-clamp-2 leading-5 text-on-surface-variant">
                                {selectedProjectTask.summary ?? selectedProjectTask.detail}
                              </p>
                            </div>
                            <Badge variant={projectTaskStatusVariant(selectedProjectTask.status)}>{selectedProjectTask.status}</Badge>
                          </div>
                          {selectedProjectTask.error ? (
                            <p className="mt-2 line-clamp-2 rounded-xl bg-destructive/10 p-2 font-mono text-[0.68rem] leading-4 text-destructive">
                              {selectedProjectTask.error}
                            </p>
                          ) : null}
                          <div className="mt-3 grid grid-cols-3 gap-2 text-[0.68rem]">
                            <PathRow label="Kind" value={projectTaskKindLabel(selectedProjectTask.kind)} />
                            <PathRow label="Elapsed" value={projectTaskElapsedLabel(selectedProjectTask)} />
                            <PathRow label="Source" value={selectedProjectTask.backendTaskId ? "Rust task" : "Editor queue"} />
                          </div>
                          {selectedProjectTask.logPreview ? (
                            <div className="mt-3 max-h-24 overflow-auto rounded-xl bg-surface-container-low py-2 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                              {selectedProjectTaskLogLines.slice(0, 8).map((line) => (
                                <div
                                  key={line.id}
                                  className={cn(
                                    "grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2 px-2 py-0.5",
                                    line.matched && "bg-primary/10 text-on-surface",
                                  )}
                                >
                                  <span className="select-none text-right text-on-surface-variant">{line.number}</span>
                                  <span className="whitespace-pre-wrap break-words">{line.text}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-3 rounded-xl border border-dashed border-outline-variant p-3 text-center leading-5 text-on-surface-variant">
                              No log preview for this task.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-outline-variant p-4 text-center text-on-surface-variant">
                          Select a task to inspect it.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2 text-xs xl:grid-cols-4">
                    {visibleProjectTasks.slice(0, 4).map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        className={cn(
                          "focus-ring rounded-xl border p-3 text-left transition",
                          selectedProjectTask?.id === task.id ? "border-primary bg-primary/10" : "border-outline-variant bg-surface-container-high hover:border-outline",
                        )}
                        onClick={() => setSelectedProjectTaskId(task.id)}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium">{task.title}</span>
                          <Badge variant={projectTaskStatusVariant(task.status)}>{task.status}</Badge>
                        </span>
                        <span className="mt-1 block truncate text-on-surface-variant">{projectTaskKindLabel(task.kind)} · {projectTaskElapsedLabel(task)}</span>
                      </button>
                    ))}
                    {visibleProjectTasks.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-outline-variant p-4 text-center text-on-surface-variant">
                        No tasks yet.
                      </div>
                    ) : null}
                  </div>
                )
              ) : (
                <pre className="max-h-36 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-container-high p-3 font-mono text-[0.68rem] leading-5 text-on-surface-variant">
                  {selectedProjectTask?.logPreview ||
                    latestRunSessionEntry?.runtimeLogPreview ||
                    "Runtime and task logs will appear after checks, builds, or running the generated app."}
                </pre>
              )}
            </OutputDock>
          </div>
        </div>
        {palettePointerDrag?.dragging ? (
          <div
            className="pointer-events-none fixed z-[9999] flex items-center gap-2 rounded-2xl border border-primary/30 bg-surface-container-lowest/95 px-3 py-2 text-xs font-medium text-on-surface shadow-m3-2 backdrop-blur"
            style={{
              left: palettePointerDrag.currentClientX + 14,
              top: palettePointerDrag.currentClientY + 14,
            }}
          >
            <Layers aria-hidden className="size-4 text-primary" />
            <span>{palettePointerDrag.title}</span>
            <Badge variant={dropIntent ? "secondary" : "outline"}>{dropIntent ? "Drop" : "Drag"}</Badge>
          </div>
        ) : null}
    </div>
  );
}

function PanelTitle({ icon: Icon, title, description }: { icon: typeof Layers; title: string; description: string }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon aria-hidden className="size-4" />
      </span>
      <div className="min-w-0">
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-on-surface-variant">{description}</p>
      </div>
    </div>
  );
}

function ProjectJumpIcon({ kind }: { kind: ProjectJumpKind }) {
  if (kind === "action") {
    return <Play aria-hidden className="size-4" />;
  }
  if (kind === "file" || kind === "validation") {
    return <FileJson aria-hidden className="size-4" />;
  }
  if (kind === "control") {
    return <MousePointer2 aria-hidden className="size-4" />;
  }
  if (kind === "component") {
    return <Layers aria-hidden className="size-4" />;
  }
  if (kind === "rust-command") {
    return <Braces aria-hidden className="size-4" />;
  }
  if (kind === "state") {
    return <Settings2 aria-hidden className="size-4" />;
  }
  if (kind === "settings") {
    return <Settings2 aria-hidden className="size-4" />;
  }
  if (kind === "asset") {
    return <FileImage aria-hidden className="size-4" />;
  }
  if (kind === "artifact" || kind === "pipeline") {
    return <Download aria-hidden className="size-4" />;
  }
  if (kind === "maintenance") {
    return <Wand2 aria-hidden className="size-4" />;
  }
  return <FolderOpen aria-hidden className="size-4" />;
}

function ProjectTaskIcon({ kind }: { kind: ProjectTaskKind }) {
  if (kind === "logic") {
    return <Braces aria-hidden className="size-4" />;
  }
  if (kind === "design") {
    return <MousePointer2 aria-hidden className="size-4" />;
  }
  if (kind === "generate") {
    return <FileJson aria-hidden className="size-4" />;
  }
  if (kind === "check" || kind === "validate") {
    return <CheckCircle2 aria-hidden className="size-4" />;
  }
  if (kind === "build") {
    return <Download aria-hidden className="size-4" />;
  }
  if (kind === "repair") {
    return <Wand2 aria-hidden className="size-4" />;
  }
  return <Save aria-hidden className="size-4" />;
}

function TemplateMiniPreview({ template, selected = false }: { template: ProjectTemplateDefinition; selected?: boolean }) {
  const active = selected ? "bg-primary/70" : "bg-on-surface-variant/50";
  return (
    <div className="mt-3 rounded-xl border border-outline-variant bg-surface-container-low p-2" data-builder-template-preview={template.id}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate text-[0.68rem] font-medium text-on-surface-variant">{template.footprint}</span>
        <span className={cn("h-1.5 w-10 rounded-full", selected ? "bg-primary" : "bg-outline-variant")} />
      </div>
      <div className="grid h-16 grid-cols-[1.2fr_0.8fr] gap-1.5 overflow-hidden">
        <div className="space-y-1.5">
          <div className={cn("h-3 rounded-md", active)} />
          <div className="grid grid-cols-3 gap-1">
            <div className={cn("h-5 rounded-md", selected ? "bg-primary/25" : "bg-outline-variant/70")} />
            <div className={cn("h-5 rounded-md", selected ? "bg-primary/20" : "bg-outline-variant/60")} />
            <div className={cn("h-5 rounded-md", selected ? "bg-primary/15" : "bg-outline-variant/50")} />
          </div>
          <div className={cn("h-4 rounded-md", selected ? "bg-primary/20" : "bg-outline-variant/60")} />
        </div>
        <div className={cn("rounded-lg", selected ? "bg-primary/15" : "bg-outline-variant/50")} />
      </div>
      <div className="mt-2 grid gap-1">
        {template.preview.map((line) => (
          <div key={line} className="flex min-w-0 items-center gap-2 text-[0.68rem] text-on-surface-variant">
            <span className={cn("size-1.5 shrink-0 rounded-full", selected ? "bg-primary" : "bg-outline")} />
            <span className="truncate">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs text-on-surface-variant">{label}</Label>
      {children}
    </div>
  );
}

function PathRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
      <p className="break-all rounded-xl bg-surface-container-high px-3 py-2 font-mono text-[0.68rem] text-on-surface-variant">{value}</p>
    </div>
  );
}

function NumberBox({
  label,
  value,
  onChange,
  dataAttr,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  dataAttr: "data-builder-canvas-width" | "data-builder-canvas-height";
  disabled?: boolean;
}) {
  return (
    <label className="flex h-[var(--control-sm)] items-center gap-2 rounded-full border border-outline bg-surface-container-high pl-3 pr-1 text-xs text-on-surface-variant">
      {label}
      <Input
        {...{ [dataAttr]: "" }}
        type="number"
        inputSize="sm"
        value={value}
        className="h-7 w-20 rounded-full px-2 text-xs"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
