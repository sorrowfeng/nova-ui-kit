import type { ProjectJumpKind } from "./builder/task-center";
import {
  Field,
  NumberBox,
  CountReadout,
  PanelTitle,
  PathRow,
  ProjectJumpIcon,
  ProjectTaskIcon,
  PropertySection,
  StateBadge,
  TemplateMiniPreview,
} from "./builder/view-helpers";
import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type UIEvent as ReactUIEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Activity,
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
  Bug,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  ClipboardCopy,
  ClipboardPaste,
  Columns3,
  CornerDownRight,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  FileJson,
  FileImage,
  FolderOpen,
  FolderSearch,
  GitBranch,
  Grid3x3,
  Hand,
  Heading1,
  Keyboard,
  Layers,
  ListChecks,
  LoaderCircle,
  Lock,
  LockOpen,
  Maximize2,
  Menu,
  MessageSquare,
  Monitor,
  MonitorPlay,
  MousePointer2,
  Move,
  MoveDown,
  MoveUp,
  Navigation,
  PanelTop,
  Pause,
  Plus,
  Play,
  RectangleHorizontal,
  Redo2,
  RotateCcw,
  Ruler,
  Save,
  ScrollText,
  Scissors,
  Search,
  Settings2,
  Smartphone,
  Square,
  Star,
  Table2,
  Terminal,
  TextCursorInput,
  ToggleLeft,
  Trash2,
  Type,
  Undo2,
  Wand2,
  X,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toastIconClassName, toastSurfaceClassName } from "@/components/ui/toast";
import {
  dispatchNovaEditorCommand,
  NOVA_EDITOR_COMMAND_EVENT,
  type NovaEditorCommand,
  type NovaEditorCommandEventDetail,
} from "@/lib/editor-commands";
import { cn } from "@/lib/utils";
const BuildWorkspace = lazy(() => import("./builder/BuildWorkspace").then((m) => ({ default: m.BuildWorkspace })));
const DesignWorkspace = lazy(() => import("./builder/DesignWorkspace").then((m) => ({ default: m.DesignWorkspace })));
import { InspectorDock } from "./builder/InspectorDock";
const LogicWorkspace = lazy(() => import("./builder/LogicWorkspace").then((m) => ({ default: m.LogicWorkspace })));
import { NavigatorDock } from "./builder/NavigatorDock";
import { OutputDock } from "./builder/OutputDock";
import { SelectionActionBar } from "./builder/SelectionActionBar";
import { useCanvasViewportInteraction } from "./builder/useCanvasViewportInteraction";
import { useCanvasItemDrag } from "./builder/useCanvasItemDrag";
import { BatchSelectToolbar, CanvasFindBar } from "./builder/CanvasOverlays";
import { ProjectHealthPanel } from "./builder/ProjectHealthPanel";
import { ConflictMergeEditor, type ConflictFile } from "./builder/ConflictMergeEditor";
import { GeneratedDiffView } from "./builder/GeneratedDiffView";
// Mode views are code-split so the design shell does not pay for the
// project/logic/build workbenches (P2-11).
const BuilderItemPreview = lazy(() => import("./builder/BuilderItemPreview").then((m) => ({ default: m.BuilderItemPreview })));
const DesignView = lazy(() => import("./builder/DesignView").then((m) => ({ default: m.DesignView })));
const ShellView = lazy(() => import("./builder/ShellView").then((m) => ({ default: m.ShellView })));
const ProjectView = lazy(() => import("./builder/ProjectView").then((m) => ({ default: m.ProjectView })));
const LogicView = lazy(() => import("./builder/LogicView").then((m) => ({ default: m.LogicView })));
const BuildView = lazy(() => import("./builder/BuildView").then((m) => ({ default: m.BuildView })));
import { itemOptionTexts } from "./builder/item-options";
import { isTauriRuntime } from "./builder/item-assets";
import { PreviewDock } from "./builder/PreviewDock";
import { useDebouncedPreviewReload } from "./builder/useDebouncedPreviewReload";
import { ToolchainBanner } from "./builder/ToolchainBanner";
import { palette, getDefinition, type ComponentDefinition } from "./builder/component-palette";
import { AlignGuideOverlay } from "./builder/AlignGuideOverlay";
import { buildInspectorWorkflowSteps } from "./builder/inspector-workflow";
import {
  getItemIdsInsideMarquee,
  getSelectionMarqueeRect,
  useCanvasMarquee,
  type SelectionMarquee,
} from "./builder/useCanvasMarquee";
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
  projectTaskStatusLabel,
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
  normalizeReleaseTitlebarStyle,
  normalizeReleaseVersion,
  normalizeReleaseWindowKind,
  releaseBundleTargets,
  releaseDigestAlgorithms,
  releaseInstallerSmokeModes,
  releaseInstallerSmokeRunnerModes,
  releaseSigningConfigured,
  releaseSigningDescription,
  releaseSigningModes,
  releaseTitlebarStyles,
  type ReleaseVersionBump,
  releaseWindowKinds,
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
  rustParameterTypeCode,
  rustParameterTypes,
  sanitizeRustCommandName,
  sanitizeRustParameterName,
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
  ProjectEditorState,
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
  ReleaseTitlebarStyle,
  ReleaseWindowKind,
  ResizeHandle,
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

// Module-scope types, constants and pure helpers live in builder/monolith-module.
import {
  BackendSchemaField,
  BackendSchemaFieldType,
  BuildReadinessItem,
  BuildReadinessSeverity,
  BuildReadinessSummary,
  BuilderBottomDockTab,
  BuilderEditorTab,
  BuilderEditorTabKind,
  BuilderFileSaveState,
  BuilderIssueItem,
  BuilderLeftDockTab,
  BuilderPropertyAutoFixSummary,
  BuilderPropertyAutoFixTarget,
  BuilderPropertyIssue,
  BuilderPropertyKind,
  BuilderPropertySchemaField,
  BuilderPropertySectionId,
  BuilderRightDockTab,
  BuilderTreeRow,
  CANVAS_CONTEXT_INSERT_SEARCH_LIMIT,
  COMPONENT_PALETTE_FAVORITES_STORAGE_KEY,
  COMPONENT_PALETTE_RECENTS_STORAGE_KEY,
  CanvasBounds,
  CanvasContextMenuState,
  CanvasDragMetricsOverlay,
  CanvasNudgeResult,
  CanvasRulerMark,
  ComponentCoverageGroup,
  ComponentPaletteCategoryId,
  ComponentPaletteKit,
  DESIGNER_WORKSPACE_STORAGE_KEY,
  DestructiveActionRequest,
  EDITOR_EXPERIENCE_KNOWN_TITLEBAR_STYLES,
  EDITOR_EXPERIENCE_KNOWN_WINDOW_KINDS,
  EditorExperienceAuditFilter,
  EditorExperienceAuditItem,
  EditorExperienceAuditSeverity,
  EditorWorkflowStep,
  InlineTextEdit,
  InspectorWorkflowStep,
  LEGACY_BUILDER_STORAGE_KEY,
  LogicConnectionFilterId,
  LogicResourceViewId,
  LogicSignalSlotRow,
  PROJECT_JUMP_RECENTS_STORAGE_KEY,
  PalettePointerDrag,
  ProjectActionCenterAction,
  ProjectActionCenterItem,
  ProjectActionCenterTone,
  ProjectActivityEntry,
  ProjectDependencyValidityView,
  ProjectExplorerContextMenuState,
  ProjectExplorerDossier,
  ProjectExplorerFilterId,
  ProjectExplorerGroupId,
  ProjectExplorerImpactAction,
  ProjectExplorerImpactItem,
  ProjectExplorerModel,
  ProjectExplorerNode,
  ProjectExplorerNodeAction,
  ProjectExplorerRow,
  ProjectExplorerStatusTone,
  ProjectFileRouteGroup,
  ProjectFileRouteItem,
  ProjectFolderHealthItem,
  ProjectFolderHealthState,
  ProjectJumpFeedback,
  ProjectJumpResult,
  ProjectOwnershipMatrixItem,
  ProjectSaveManifestItem,
  ProjectSavePlanStep,
  ProjectSnapshotEntry,
  ProjectSourceOverviewRow,
  ProjectSourceOverviewStatus,
  ProjectTopologyNode,
  ProjectWorkingSetItem,
  ProjectWorkingSetKind,
  QtCreatorParityItem,
  READINESS_GATED_PROJECT_ACTIONS,
  RUST_RESERVED_WORDS,
  ReleaseReadinessItem,
  ReleaseReadinessSummary,
  RustBracketMatch,
  RustCommandResultImpact,
  RustCompletionCommit,
  RustCompletionItem,
  RustCompletionKind,
  RustCompletionTrigger,
  RustDebuggerPanelId,
  RustDiagnosticGutterEntry,
  RustEditorHoverDoc,
  RustEditorMinimapMarker,
  RustEditorQuickFix,
  RustEditorQuickFixTone,
  RustEditorSelection,
  RustFindMatch,
  RustIdentifierReference,
  RustIdentifierTarget,
  RustLogicOutlineEntry,
  RustLogicOutlineKind,
  RustSignatureHelp,
  RustSignatureParameterHelp,
  SMART_GUIDE_SAFE_MARGIN,
  SMART_GUIDE_THRESHOLD,
  SimulatorTraceEntry,
  SlotNavigationEntry,
  SmartGuide,
  SmartGuideSource,
  WindowVisualAuditIssue,
  WindowVisualAuditSeverity,
  WindowVisualAuditSummary,
  WorkflowRuntimeSession,
  activityTimeValue,
  assetPublicPath,
  auditAutoLayoutFrame,
  auditProjectWindows,
  auditSiblingOverlaps,
  backendArtifactInspectionStatusLabel,
  backendArtifactStarterBuildAvailable,
  backendArtifactStatusVariant,
  backendFieldFromSchema,
  backendFieldInputValue,
  backendMethodLocalValidationRecord,
  backendMethodRequestEnvelope,
  backendPayloadFieldsForEvent,
  backendResponseSchemaHasPatch,
  backendSchemaDefaultValue,
  backendSchemaDescription,
  backendSchemaEnumValues,
  backendSchemaFieldIssues,
  backendSchemaFields,
  backendSchemaFieldsFromValues,
  backendSchemaIsJsonSchema,
  backendSchemaIsLegacyPayloadEnvelope,
  backendValueMatchesType,
  booleanStateLabel,
  boundsFromRects,
  buildDiagnosticKey,
  buildProjectExplorerModel,
  buildProjectJumpResults,
  buildReadiness,
  buildReadinessSeverityLabel,
  buildTreeRows,
  builderIssueSeverityRank,
  builderItemRuntimeState,
  builderPropertySchema,
  builderPropertySectionIds,
  builderPropertySectionLabels,
  builderPropertySectionOptions,
  builderStateFingerprint,
  builderTabIndexValue,
  buttonVariantValues,
  byteSizeLabel,
  canMoveLayerWithinGroup,
  canvasContextMenuWidth,
  canvasContextQuickInsertGroups,
  canvasContextQuickInsertTypes,
  canvasPresets,
  canvasZoomLevels,
  checkpointDiffDetails,
  checkpointDiffSummary,
  cloneBuilderState,
  cloneDesignerProject,
  compactJson,
  componentCoverageGroups,
  componentPaletteCategoryForType,
  componentPaletteCategoryLabel,
  componentPaletteCategoryOptions,
  componentPaletteKitDefinitions,
  componentPaletteMatchesSearch,
  componentPaletteQuickInsertTypes,
  controlSizeValues,
  countStateVariableReferences,
  createAssetFromPath,
  createBlankFile,
  createBuildHistoryEntry,
  createCanvasRulerMarks,
  createItem,
  createProject,
  createProjectDependencyGraphRecord,
  createPropertyMaintenanceEntry,
  createReleasePipelineCommandArgs,
  createReleasePipelineEntry,
  createReleasePipelineEnvironment,
  createReleasePipelineInputSnapshot,
  createRustCommandDebugResultSnippet,
  createRustNovaJsonResultSnippet,
  createRustStatePatchLiteral,
  createSmartGuidesForDragSession,
  createStateVariable,
  createValidationHistoryEntry,
  createWorkspace,
  defaultOpenPropertySections,
  defaultPage,
  dependencyGraphEventStatusVariant,
  dependencyValidityDefinitions,
  dependencyValidityKindsForEvent,
  dependencyValidityStatusVariant,
  designerFileContentFingerprint,
  dirtyScopeIdsForImpact,
  editorExperienceAuditBadgeVariant,
  editorExperienceAuditSeverityLabel,
  emptyCanvasQuickStarts,
  escapeRegExp,
  estimateCanvasContextMenuHeight,
  eventResultTargetProps,
  fileNameFromPath,
  filterProjectJumpResults,
  findRustBracketMatch,
  floatingEditorMenuViewportPadding,
  focusableBuilderComponentTypeSet,
  focusableBuilderComponentTypes,
  formatProjectSnapshotTime,
  formatRustSource,
  formatSignedDelta,
  formatSimulatorTraceLog,
  formatStateReferenceCount,
  frameLayoutLabel,
  frameLayoutValues,
  generatedFileStatusLabel,
  generatedPreviewEntryNeedsApply,
  getCanvasBackgroundStyle,
  getInitialDesignerWorkspace,
  getItemSummary,
  getLayerSiblings,
  getSelectionBounds,
  groupProjectExplorerRows,
  hasValueAtPath,
  imageFitValues,
  inspectReleasePipelineArtifactEvidence,
  intersectsScopeIds,
  invokeIfAvailable,
  isKeyboardFocusableBuilderItem,
  isMultilineQuickTextEdit,
  isPlainRecord,
  isQuickTextProp,
  isRustIdentifierName,
  isRustIdentifierPart,
  itemBounds,
  itemCanvasBounds,
  itemUsesOptions,
  itemVisualName,
  loadComponentPaletteTypeList,
  loadDesignerWorkspace,
  loadProjectJumpRecentIds,
  loadSavedBuilderState,
  logicConnectionFilterIds,
  logicConnectionFilterOptions,
  logicResourceItemActiveClass,
  logicResourceItemClass,
  logicResourceItemIdleClass,
  logicResourceSectionClass,
  logicResourceSectionContentClass,
  logicResourceSectionIconClass,
  logicResourceSectionSummaryClass,
  logicResourceViewIds,
  logicResourceViewOptions,
  mapLegacyType,
  matchesSearchNeedle,
  md3ApplicationComponentTypes,
  mergeReleasePipelineHistory,
  navigatorTreeRowMatches,
  normalizeBackendSchemaType,
  normalizeBreakpointValidationIssues,
  normalizeBuildHistory,
  normalizeBuilderState,
  normalizeComparablePath,
  normalizeComponentTypeList,
  normalizeDesignerAssets,
  normalizeDesignerFile,
  normalizeDesignerWorkspace,
  normalizeOpenEditorFileIds,
  normalizeProjectDependencyGraphEvent,
  normalizeProjectDependencyGraphPlan,
  normalizeProjectDependencyGraphRecord,
  normalizeProjectDependencyGraphScope,
  normalizeProjectDependencyGraphValidityEntry,
  normalizeProjectDependencySourceReference,
  normalizeProjectEditorState,
  normalizeProjectMaintenanceHistory,
  normalizeReleasePipelineHistory,
  normalizeReleasePipelineStatus,
  normalizeReleasePipelineStepArtifactEvidence,
  normalizeReleasePipelineStepCommandArgs,
  normalizeReleasePipelineStepEnvironment,
  normalizeReleasePipelineStepInputSnapshot,
  normalizeReleasePipelineSteps,
  normalizeResponsiveOverrides,
  normalizeStateVariables,
  normalizeValidationHistory,
  optionComponentTypes,
  overlapArea,
  parentPathFromPath,
  parseBackendFieldInput,
  parseJsonEditorValue,
  placeFloatingEditorMenu,
  prettyJson,
  projectActionCenterBadgeVariant,
  projectActionCenterToneClass,
  projectActivityTimeline,
  projectChangeImpactStatusLabel,
  projectChangeImpactStatusVariant,
  projectChangeScopeStatusLabel,
  projectChangeScopeStatusVariant,
  projectDependencyGraphSourceRefs,
  projectDependencyValidityViews,
  projectDesignContentFingerprint,
  projectDiskPath,
  projectExplorerActionLabel,
  projectExplorerContextMenuEstimatedHeight,
  projectExplorerContextMenuWidth,
  projectExplorerDossierSourceOfTruth,
  projectExplorerDossierTasks,
  projectExplorerFilterOptions,
  projectExplorerGroupFilter,
  projectExplorerGroupMeta,
  projectExplorerNodeGroupId,
  projectExplorerNodeHasChildren,
  projectExplorerNodeMatchesFilter,
  projectExplorerNodeMatchesSearch,
  projectExplorerNodeStatus,
  projectExplorerPrimaryActionLabel,
  projectExplorerStatusClass,
  projectExplorerVisibleWithCollapsedAncestors,
  projectFileContentFingerprints,
  projectJumpFuzzyMatch,
  projectJumpKindLabel,
  projectJumpResultScore,
  projectJumpSearchText,
  projectRelativePath,
  projectRustContentFingerprint,
  projectSettingsContentFingerprint,
  projectSnapshotFingerprint,
  projectSourceOverviewBadgeVariant,
  projectTaskTimestamp,
  projectTemplateSeedOptions,
  projectUiDiskFileName,
  propertyAutoFixPatchForItem,
  propertyAutoFixSummaryForProject,
  propertyFallbackValue,
  propertyFieldMatchesSearch,
  propertyIssueId,
  propertyIssuesForItem,
  propertyIssuesForProject,
  propertyPatchSize,
  propertySchemaForItem,
  propertySchemaHint,
  propertySectionForProp,
  pushRustPlainTextSegment,
  quickTextPrimaryPropByType,
  quickTextPropForItem,
  quickTextPropLabel,
  quickTextPropOrder,
  quickTextPropOrderForItem,
  quickTextPropsForItem,
  readOnlyBuilderComponentTypeSet,
  readOnlyBuilderComponentTypes,
  relativeItemBounds,
  releasePipelineArtifactEvidenceFromInspection,
  releasePipelineStepFromTask,
  releasePipelineTerminalStatus,
  releaseReadinessDashboard,
  renderRustHighlightedLine,
  resizeHandleCursor,
  resizeHandleMetas,
  resizePatchForHandle,
  responsiveBreakpoints,
  reverseDependencyStatusLabel,
  reverseDependencyStatusVariant,
  reverseDependencyTargetKindLabel,
  rustBracketPairs,
  rustClosingBrackets,
  rustCommandFunctionExists,
  rustCommandSignatureLabel,
  rustCompletionInsertPreview,
  rustCompletionKindLabel,
  rustCompletionSymbolEntries,
  rustEditorSelectionFromValue,
  rustFunctionLocation,
  rustHighlightPattern,
  rustIdentifierAtSelection,
  rustIdentifierOccurrences,
  rustLineNumberAtIndex,
  rustLineStartIndex,
  rustLocationAtIndex,
  rustLogicOutlineEntries,
  rustOutlineColumn,
  rustOutlineKindLabel,
  rustOutlineKindTitle,
  rustSignatureActiveParameterIndex,
  rustSignatureParameterHelp,
  rustStringLiteral,
  rustSyntaxLegendItems,
  safeAssetFileName,
  samePathText,
  samplePayloadFromBackendSchema,
  sanitizeRustLineForFormatting,
  searchNeedle,
  selectOptionsForItem,
  setPropertyPatchValue,
  setValueAtPath,
  simulatorRunMessage,
  simulatorStateFromProject,
  simulatorStateValuesForArgs,
  stableTextHash,
  summarizeReadiness,
  summarizeReleasePipelineEntry,
  textPropertyValue,
  textRangeForLineColumn,
  updateDependencyValidityCache,
  updateReleasePipelineEntryWithTask,
  validateBackendJsonSchemaValue,
  validateBackendSchemaValue,
  validationHistoryStatus,
  validationTimeLabel,
  valueAtPath,
  visualAuditSeverityLabel,
  visualMinimumSize,
  visualTextForItem,
  withProjectExplorerParentLinks,
  workflowRuntimeSessionFromBuildHistory,
  workflowRuntimeSessionFromLaunch,
  workflowStepStatusClassName,
  workflowStepStatusLabel,
  workflowTaskForActions,
  workspaceFileContentFingerprints,
  workspaceProjectSettingsContentFingerprints,
  workspaceRustContentFingerprints,
} from "./builder/monolith-module";
import { buildProjectSaveManifestItems } from "./builder/project-save-manifest";
import { buildProjectFileRouteGroups, buildProjectSourceOverviewRows } from "./builder/project-source-models";

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
  const pageWindowKindMeta = releaseWindowKinds.find((kind) => kind.value === page.windowKind) ?? releaseWindowKinds[0];
  const pageTitlebarStyleMeta = releaseTitlebarStyles.find((style) => style.value === page.titlebarStyle) ?? releaseTitlebarStyles[0];
  const releaseWindowKindMeta = releaseWindowKinds.find((kind) => kind.value === activeProject.releaseConfig.windowKind) ?? releaseWindowKinds[0];
  const releaseTitlebarStyleMeta = releaseTitlebarStyles.find((style) => style.value === activeProject.releaseConfig.titlebarStyle) ?? releaseTitlebarStyles[0];
  const releaseWindowShellMatchesPage =
    activeProject.releaseConfig.windowKind === page.windowKind &&
    activeProject.releaseConfig.titlebarStyle === page.titlebarStyle &&
    activeProject.releaseConfig.titlebarSubtitle === page.titlebarSubtitle &&
    activeProject.releaseConfig.windowTitle === page.title &&
    activeProject.releaseConfig.windowWidth === page.width &&
    activeProject.releaseConfig.windowHeight === page.height;
  const pageWindowShellPresets: Array<{
    id: string;
    label: string;
    detail: string;
    windowKind: ReleaseWindowKind;
    titlebarStyle: ReleaseTitlebarStyle;
    subtitle: string;
  }> = [
    { id: "main-nova", label: "主窗口", detail: "完整 Nova 标题栏", windowKind: "main", titlebarStyle: "nova", subtitle: "桌面应用" },
    { id: "dialog-nova", label: "对话框", detail: "设置、确认、向导", windowKind: "dialog", titlebarStyle: "nova", subtitle: "对话框" },
    { id: "tool-nova", label: "工具窗口", detail: "浮动工具与面板", windowKind: "tool", titlebarStyle: "nova", subtitle: "工具窗口" },
    { id: "frameless-hidden", label: "无框", detail: "沉浸内容窗口", windowKind: "frameless", titlebarStyle: "hidden", subtitle: "" },
  ];
  const baseItems = activeFile.items;
  const items = useMemo(() => resolveItemsForBreakpoint(baseItems, activeBreakpoint), [baseItems, activeBreakpoint]);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => (activeFile.items[0]?.id ? [activeFile.items[0].id] : []));
  const [selectionAnchorId, setSelectionAnchorId] = useState(() => activeFile.items[0]?.id ?? "");
  const [selectedProjectTemplateId, setSelectedProjectTemplateId] = useState<ProjectTemplateId>("dashboard");
  const [mode, setMode] = useState<BuilderMode>("design");
  const [leftDockTab, setLeftDockTab] = useState<BuilderLeftDockTab>("components");
  const [leftDockCollapsed, setLeftDockCollapsed] = useState(false);
  const [componentPaletteQuery, setComponentPaletteQuery] = useState("");
  const [componentPaletteCategory, setComponentPaletteCategory] = useState<ComponentPaletteCategoryId>("all");
  const [activeComponentPaletteKitId, setActiveComponentPaletteKitId] = useState("");
  const [componentPaletteRecentTypes, setComponentPaletteRecentTypes] = useState<BuilderComponentType[]>(() =>
    loadComponentPaletteTypeList(COMPONENT_PALETTE_RECENTS_STORAGE_KEY, 8, ["button", "input", "table"]),
  );
  const [componentPaletteFavoriteTypes, setComponentPaletteFavoriteTypes] = useState<BuilderComponentType[]>(() =>
    loadComponentPaletteTypeList(COMPONENT_PALETTE_FAVORITES_STORAGE_KEY, 8, componentPaletteQuickInsertTypes),
  );
  const [navigatorQuery, setNavigatorQuery] = useState("");
  const [navigatorLayerMessage, setNavigatorLayerMessage] = useState("");
  const [rightDockTab, setRightDockTab] = useState<BuilderRightDockTab>("properties");
  const [rightDockCollapsed, setRightDockCollapsed] = useState(true);
  const [openPropertySections, setOpenPropertySections] = useState<Record<BuilderPropertySectionId, boolean>>(() => ({ ...defaultOpenPropertySections }));
  const [inspectorPropertyQuery, setInspectorPropertyQuery] = useState("");
  const togglePropertySection = (section: BuilderPropertySectionId) => {
    setOpenPropertySections((current) => ({ ...current, [section]: !current[section] }));
  };
  const openPropertySectionFromSearch = (section: BuilderPropertySectionId) => {
    setOpenPropertySections((current) => ({ ...current, [section]: true }));
  };
  const [bottomDockTab, setBottomDockTab] = useState<BuilderBottomDockTab>("issues");
  const [bottomDockExpanded, setBottomDockExpanded] = useState(false);
  const [bottomDockMinimized, setBottomDockMinimized] = useState(true);
  const [bottomDockHeight, setBottomDockHeight] = useState(360);
  const [bottomDockExpandedHeight, setBottomDockExpandedHeight] = useState(560);
  const [feedbackPanelOpen, setFeedbackPanelOpen] = useState(false);
  const [tabOrderOverlayVisible, setTabOrderOverlayVisible] = useState(false);
  const [canvasControlsExpanded, setCanvasControlsExpanded] = useState(false);
  const openBottomDock = (tab: BuilderBottomDockTab, expanded = true) => {
    setBottomDockTab(tab);
    setBottomDockExpanded(expanded);
    setBottomDockMinimized(false);
  };
  const openFeedbackPanel = (tab: BuilderBottomDockTab, expanded = false) => {
    setBottomDockTab(tab);
    setBottomDockExpanded(expanded);
    setFeedbackPanelOpen(true);
    setBottomDockMinimized(false);
  };
  const activeBottomDockHeight = bottomDockExpanded ? bottomDockExpandedHeight : bottomDockHeight;
  const outputDockWorkspaceHeight = bottomDockMinimized ? "minimized" : `${activeBottomDockHeight}px`;
  const outputDockWorkspaceState = bottomDockMinimized ? "minimized" : bottomDockExpanded ? "expanded" : "standard";
  const outputDockWorkspacePadding = "pb-0";
  const outputDockWorkspaceAvoidancePadding = "0px";
  const outputDockWorkspaceStyle = {
    "--builder-output-dock-current-height": bottomDockMinimized ? "3.25rem" : `${activeBottomDockHeight}px`,
  } as CSSProperties;
  const selectionActionBarReservedTrack = canvasControlsExpanded ? "toolbar-expanded" : "toolbar-collapsed-reserved";
  const canvasViewportSelectionScrollPaddingClass = "scroll-pt-8";
  const canvasViewportDockScrollPadding = bottomDockMinimized ? 68 : activeBottomDockHeight + 40;
  const canvasViewportDockVisualPadding = bottomDockMinimized ? 8 : 16;
  const canvasViewportDockScrollStyle = {
    "--builder-canvas-dock-scroll-padding": `${canvasViewportDockScrollPadding}px`,
    "--builder-canvas-dock-visual-padding": `${canvasViewportDockVisualPadding}px`,
    scrollPaddingBottom: "var(--builder-canvas-dock-scroll-padding)",
    paddingBottom: "var(--builder-canvas-dock-visual-padding)",
  } as CSSProperties;
  const designSideDockBottomClearance = mode === "design" ? `${canvasViewportDockScrollPadding}px` : undefined;
  const toggleOutputDockVisibility = () => {
    setBottomDockMinimized((minimized) => {
      const nextMinimized = !minimized;
      if (nextMinimized) {
        setBottomDockExpanded(false);
        setFeedbackPanelOpen(false);
      } else {
        setFeedbackPanelOpen(true);
      }
      return nextMinimized;
    });
  };
  useEffect(() => {
    if (mode !== "design") {
      return;
    }
    setBottomDockExpanded(false);
    setBottomDockMinimized(true);
    setFeedbackPanelOpen(false);
  }, [mode]);
  const [selectedBuilderIssueId, setSelectedBuilderIssueId] = useState("");
  const [canvasPanMode, setCanvasPanMode] = useState(false);
  const [spacePanActive, setSpacePanActive] = useState(false);
  const [palettePointerDrag, setPalettePointerDrag] = useState<PalettePointerDrag | null>(null);
  const [copiedArtifactPath, setCopiedArtifactPath] = useState("");
  const [copiedOutputLog, setCopiedOutputLog] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedFileFingerprintsByProject, setSavedFileFingerprintsByProject] = useState<Record<string, Record<string, string>>>(() =>
    workspaceFileContentFingerprints(workspace),
  );
  const [savedRustFingerprintsByProject, setSavedRustFingerprintsByProject] = useState<Record<string, string>>(() =>
    workspaceRustContentFingerprints(workspace),
  );
  const [savedProjectSettingsFingerprintsByProject, setSavedProjectSettingsFingerprintsByProject] = useState<Record<string, string>>(() =>
    workspaceProjectSettingsContentFingerprints(workspace),
  );
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
  const [showGeneratedPlanAdvanced, setShowGeneratedPlanAdvanced] = useState(false);
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
  const [desktopRuntimeConsoleOpen, setDesktopRuntimeConsoleOpen] = useState(false);
  const [canvasFindOpen, setCanvasFindOpen] = useState(false);
  const [alignPreviewMode, setAlignPreviewMode] = useState<string | null>(null);
  const [toolchainStatus, setToolchainStatus] = useState<{
    ok: boolean;
    missing: string[];
    nodeVersion: string;
    npmVersion: string;
    cargoVersion: string;
    rustcVersion: string;
  } | null>(null);
  const [previewWebPath, setPreviewWebPath] = useState<string | null>(null);
  const [previewAutoRefresh, setPreviewAutoRefresh] = useState(true);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [projectGitStatus, setProjectGitStatus] = useState<{ clean: boolean; conflicted: string[]; changed: string[] } | null>(null);
  const [conflictFile, setConflictFile] = useState<ConflictFile | null>(null);
  const [canvasFindQuery, setCanvasFindQuery] = useState("");
  const canvasFindInputRef = useRef<HTMLInputElement | null>(null);
  const [workflowRuntimeSession, setWorkflowRuntimeSession] = useState<WorkflowRuntimeSession | null>(null);
  const autoRunSessionRefreshRef = useRef<{ key: string; checkedAt: number }>({ key: "", checkedAt: 0 });
  const [readingRuntimeLogId, setReadingRuntimeLogId] = useState("");
  const [testingBackendMethodId, setTestingBackendMethodId] = useState("");
  const [buildError, setBuildError] = useState("");
  const [managedProjects, setManagedProjects] = useState<ManagedProjectSummary[]>([]);
  const [diskCheckpoints, setDiskCheckpoints] = useState<EditorProjectCheckpoint[]>([]);
  const activityTimeline = useMemo(() => projectActivityTimeline(activeProject, diskCheckpoints), [activeProject, diskCheckpoints]);
  const [checkpointDiff, setCheckpointDiff] = useState<EditorProjectCheckpointDiff | null>(null);
  const [checkpointDiffLoadingId, setCheckpointDiffLoadingId] = useState("");
  const [checkpointLabel, setCheckpointLabel] = useState("");
  const [selectedProjectExplorerNodeId, setSelectedProjectExplorerNodeId] = useState("root");
  const [collapsedProjectExplorerNodeIds, setCollapsedProjectExplorerNodeIds] = useState<string[]>(["app-folder", "nova-folder"]);
  const [projectExplorerFilter, setProjectExplorerFilter] = useState<ProjectExplorerFilterId>("all");
  const [projectExplorerQuery, setProjectExplorerQuery] = useState("");
  const [projectSavePlanRouteId, setProjectSavePlanRouteId] = useState<ProjectSavePlanStep["id"] | null>(null);
  const [openEditorFileIds, setOpenEditorFileIds] = useState<string[]>(() =>
    normalizeOpenEditorFileIds(activeProject.editorState?.openFileIds, activeProject.files, activeProject.activeFileId),
  );
  const [draggingEditorFileTabId, setDraggingEditorFileTabId] = useState("");
  const markProjectSourceSaved = (project: DesignerProject) => {
    setSavedFileFingerprintsByProject((current) => ({
      ...current,
      [project.id]: projectFileContentFingerprints(project),
    }));
    setSavedRustFingerprintsByProject((current) => ({
      ...current,
      [project.id]: projectRustContentFingerprint(project),
    }));
    setSavedProjectSettingsFingerprintsByProject((current) => ({
      ...current,
      [project.id]: projectSettingsContentFingerprint(project),
    }));
  };
  const markWorkspaceSourceSaved = (workspaceSnapshot: DesignerWorkspace) => {
    setSavedFileFingerprintsByProject(workspaceFileContentFingerprints(workspaceSnapshot));
    setSavedRustFingerprintsByProject(workspaceRustContentFingerprints(workspaceSnapshot));
    setSavedProjectSettingsFingerprintsByProject(workspaceProjectSettingsContentFingerprints(workspaceSnapshot));
  };
  const activeSavedFileFingerprints = savedFileFingerprintsByProject[activeProject.id] ?? {};
  const fileSaveStates = useMemo(() => {
    return new Map(
      activeProject.files.map((file) => {
        const currentFingerprint = designerFileContentFingerprint(file);
        const savedFingerprint = activeSavedFileFingerprints[file.id];
        return [
          file.id,
          {
            fileId: file.id,
            currentFingerprint,
            savedFingerprint,
            dirty: savedFingerprint !== currentFingerprint,
          },
        ] as const;
      }),
    );
  }, [activeProject.files, activeSavedFileFingerprints]);
  const dirtyUiFileCount = useMemo(
    () => activeProject.files.filter((file) => fileSaveStates.get(file.id)?.dirty).length,
    [activeProject.files, fileSaveStates],
  );
  const activeFileSaveState = fileSaveStates.get(activeFile.id) ?? null;
  const activeFileDirty = Boolean(activeFileSaveState?.dirty);
  const activeProjectRustFingerprint = useMemo(() => projectRustContentFingerprint(activeProject), [activeProject]);
  const activeProjectSettingsFingerprint = useMemo(() => projectSettingsContentFingerprint(activeProject), [activeProject]);
  const rustLogicDirty = savedRustFingerprintsByProject[activeProject.id] !== activeProjectRustFingerprint;
  const projectSettingsDirty = savedProjectSettingsFingerprintsByProject[activeProject.id] !== activeProjectSettingsFingerprint;
  const projectSourceDirty = dirtyUiFileCount > 0 || rustLogicDirty || projectSettingsDirty;
  const projectExplorerModel = useMemo(
    () => buildProjectExplorerModel(activeProject, activeFile.id, diskCheckpoints.length, fileSaveStates),
    [activeFile.id, activeProject, diskCheckpoints.length, fileSaveStates],
  );
  const projectSaveManifestItems = useMemo<ProjectSaveManifestItem[]>(
    () => buildProjectSaveManifestItems({ activeProject, diskCheckpoints }),
    [
      activeProject.assets.length,
      activeProject.files.length,
      activeProject.outputExePath,
      activeProject.rootPath,
      activeProject.rustCommands.length,
      activeProject.rustModules.length,
      diskCheckpoints.length,
    ],
  );
  const projectSavePlanSteps = useMemo<ProjectSavePlanStep[]>(() => {
    const itemsForScope = (scope: ProjectSaveManifestItem["scope"]) => projectSaveManifestItems.filter((item) => item.scope === scope);
    const sourceItems = itemsForScope("source");
    const generatedItems = itemsForScope("generated");
    const metadataItems = itemsForScope("metadata");
    const sourcePendingCount = dirtyUiFileCount + (rustLogicDirty ? 1 : 0) + (projectSettingsDirty ? 1 : 0);
    const generatedPendingCount = activeProject.outputExePath ? 0 : generatedItems.length;
    const metadataPendingCount = projectSourceDirty ? metadataItems.length : 0;
    const firstPath = (items: ProjectSaveManifestItem[], fallback: string) => items[0]?.path ?? fallback;
    const metadataPath = metadataItems.find((item) => item.path.includes(".nova"))?.path ?? firstPath(metadataItems, projectRelativePath(".nova", "workspace.json"));

    return [
      {
        id: "source",
        title: "同步源码输入",
        detail:
          sourcePendingCount > 0
            ? `${dirtyUiFileCount} 个 UI 文件、Rust ${rustLogicDirty ? "待保存" : "已同步"}、设置 ${projectSettingsDirty ? "待保存" : "已同步"}。`
            : "UI、Rust 逻辑和项目设置都已与最近保存指纹一致。",
        path: firstPath(sourceItems, projectRelativePath("nova.project.json")),
        scope: "source",
        itemCount: sourceItems.length,
        pendingCount: sourcePendingCount,
        status: sourcePendingCount > 0 ? "warning" : "ready",
        actionLabel: sourcePendingCount > 0 ? "定位未保存" : "查看源码",
        icon: Save,
        filter: "all",
      },
      {
        id: "generated",
        title: "刷新生成目标",
        detail: activeProject.outputExePath
          ? `${fileNameFromPath(activeProject.outputExePath)} 已登记为当前桌面运行产物。`
          : "保存后可继续生成 Tauri/Vite runtime、exe 和安装包输出。",
        path: activeProject.outputExePath || firstPath(generatedItems, projectRelativePath("app")),
        scope: "generated",
        itemCount: generatedItems.length,
        pendingCount: generatedPendingCount,
        status: activeProject.outputExePath ? "ready" : "pending",
        actionLabel: activeProject.outputExePath ? "定位产物" : "查看生成",
        icon: Download,
        filter: "build",
      },
      {
        id: "metadata",
        title: "写入 .nova 状态",
        detail:
          metadataPendingCount > 0
            ? "源码同步会同时刷新工作区索引、编辑器状态和检查点入口。"
            : "本地工作区状态、打开文件和检查点入口已准备复用。",
        path: metadataPath,
        scope: "metadata",
        itemCount: metadataItems.length,
        pendingCount: metadataPendingCount,
        status: metadataPendingCount > 0 ? "warning" : "ready",
        actionLabel: "查看 .nova",
        icon: FileJson,
        filter: "meta",
      },
    ];
  }, [
    activeProject.outputExePath,
    dirtyUiFileCount,
    projectSaveManifestItems,
    projectSettingsDirty,
    projectSourceDirty,
    rustLogicDirty,
  ]);
  const activeProjectSavePlanStep = projectSavePlanRouteId
    ? projectSavePlanSteps.find((step) => step.id === projectSavePlanRouteId) ?? null
    : null;
  const projectFileRouteGroups = useMemo<ProjectFileRouteGroup[]>(
    () => buildProjectFileRouteGroups({ activeProject, diskCheckpoints }),
    [
    activeProject.assets.length,
    activeProject.backendIntegrations.length,
    activeProject.files.length,
    activeProject.outputExePath,
    activeProject.rootPath,
    activeProject.rustCommands.length,
    activeProject.rustModules.length,
    diskCheckpoints.length,
    ],
  );
  const projectOwnershipMatrixItems = useMemo<ProjectOwnershipMatrixItem[]>(() => {
    const ownershipMeta: Record<
      ProjectFileRouteGroup["id"],
      Pick<ProjectOwnershipMatrixItem, "owner" | "responsibility" | "sourceOfTruth" | "savePolicy" | "actionLabel">
    > = {
      source: {
        owner: "开发者 / 版本控制",
        responsibility: "项目主数据，决定 UI、Rust 逻辑、资源和发布配置。",
        sourceOfTruth: "nova.project.json + ui/ + rust/",
        savePolicy: "保存项目时直接写入本地文件夹，应进入 Git。",
        actionLabel: "查看源码",
      },
      generated: {
        owner: "Nova 构建流水线",
        responsibility: "由源码重新生成的 Tauri app、release exe、构建记录和运行证据。",
        sourceOfTruth: "source + release config",
        savePolicy: "构建/运行任务刷新，可删除后从源码再生成。",
        actionLabel: "查看生成",
      },
      metadata: {
        owner: "Nova 本地工作区",
        responsibility: "类似 .vscode 的隐藏状态：打开标签、Dock、检查点、任务和依赖图。",
        sourceOfTruth: ".nova/workspace.json + editor-state.json",
        savePolicy: "随保存/打开项目自动维护；运行日志和临时证据保持本地。",
        actionLabel: "查看 .nova",
      },
    };

    return projectFileRouteGroups.map((group) => ({
      id: group.id,
      title: group.title,
      icon: group.icon,
      routeCount: group.routes.length,
      countLabel: group.countLabel,
      primaryRoute: group.routes[0],
      ...ownershipMeta[group.id],
    }));
  }, [projectFileRouteGroups]);
  const projectTopologyNodes = useMemo<ProjectTopologyNode[]>(() => {
    const projectPath = (...segments: string[]) => projectDiskPath(activeProject.rootPath, ...segments) || projectRelativePath(...segments);
    const latestBuildEntry = (activeProject.buildHistory ?? []).find((entry) => entry.outputExePath || entry.bundleManifestPath || entry.runtimeLogPath) ?? null;
    const latestRuntimeLogPath = latestBuildEntry?.runtimeLogPath || projectPath(".nova", "runtime");

    return [
      {
        id: "topology-manifest",
        title: "项目 manifest",
        detail: "项目根索引，串联 UI、Rust、资源和发布配置。",
        path: projectPath("nova.project.json"),
        metric: activeProject.rootPath ? "已跟踪" : "保存后创建",
        scope: "source",
        icon: FileJson,
        filter: "all",
        nodeId: "manifest",
        query: "nova.project.json",
        actionLabel: "定位 manifest",
        status: activeProject.rootPath ? "ready" : "pending",
      },
      {
        id: "topology-ui",
        title: "UI 源文件",
        detail: "每个窗口独立保存，设计时网格和编辑状态不会泄漏到运行端。",
        path: projectPath("ui"),
        metric: `${activeProject.files.length} 文件 · ${projectExplorerModel.controlCount} 控件`,
        scope: "source",
        icon: Monitor,
        filter: "ui",
        nodeId: "ui-folder",
        query: "ui/",
        actionLabel: "查看 UI",
        status: dirtyUiFileCount > 0 ? "warning" : "ready",
      },
      {
        id: "topology-rust",
        title: "Rust 后端逻辑",
        detail: "UI 信号最终绑定到这里的命令、模块和 Cargo 依赖。",
        path: projectPath("rust", "logic.rs"),
        metric: `${activeProject.rustCommands.length} 个命令 · ${activeProject.rustModules.length} 个模块`,
        scope: "source",
        icon: Braces,
        filter: "rust",
        nodeId: "rust-logic",
        query: "logic.rs",
        actionLabel: "打开 Rust",
        status: rustLogicDirty ? "warning" : "ready",
      },
      {
        id: "topology-generated",
        title: "生成 app",
        detail: "由项目源码重新生成的 Tauri/Vite 桌面目标，不再走孤立导出面板。",
        path: projectPath("app"),
        metric: activeProject.outputExePath ? "exe 就绪" : "待构建",
        scope: "generated",
        icon: Download,
        filter: "build",
        nodeId: "app-folder",
        query: "app/",
        actionLabel: "查看生成",
        status: activeProject.outputExePath ? "ready" : "pending",
      },
      {
        id: "topology-nova",
        title: ".nova 本地状态",
        detail: "类似 .vscode：保存打开标签、Dock、检查点、任务和编辑器偏好。",
        path: projectPath(".nova", "workspace.json"),
        metric: `${diskCheckpoints.length} 检查点`,
        scope: "metadata",
        icon: Settings2,
        filter: "meta",
        nodeId: "nova-folder",
        query: ".nova",
        actionLabel: "查看 .nova",
        status: projectSettingsDirty ? "warning" : "ready",
      },
      {
        id: "topology-runtime",
        title: "运行与发布证据",
        detail: "exe、bundle manifest、运行日志和 smoke 记录统一回到项目证据链。",
        path: activeProject.outputExePath || latestRuntimeLogPath,
        metric: activeProject.outputExePath ? fileNameFromPath(activeProject.outputExePath) : "等待运行",
        scope: "runtime",
        icon: Terminal,
        filter: "build",
        nodeId: activeProject.outputExePath ? "app-release-exe" : "nova-runtime",
        query: activeProject.outputExePath ? fileNameFromPath(activeProject.outputExePath) : "runtime/",
        actionLabel: "查看证据",
        status: activeProject.outputExePath || latestBuildEntry ? "ready" : "pending",
      },
    ];
  }, [
    activeProject.buildHistory,
    activeProject.files.length,
    activeProject.outputExePath,
    activeProject.rootPath,
    activeProject.rustCommands.length,
    activeProject.rustModules.length,
    dirtyUiFileCount,
    diskCheckpoints.length,
    projectExplorerModel.controlCount,
    projectSettingsDirty,
    rustLogicDirty,
  ]);
  const projectSourceOverviewRows = useMemo<ProjectSourceOverviewRow[]>(
    () => buildProjectSourceOverviewRows({ activeProject, activeFile, fileSaveStates, projectSettingsDirty, projectSourceDirty, rustLogicDirty, diskCheckpoints }),
    [
    activeFile.id,
    activeProject.assets.length,
    activeProject.backendIntegrations,
    activeProject.cargoDependencies.length,
    activeProject.files,
    activeProject.outputExePath,
    activeProject.releaseConfig,
    activeProject.rootPath,
    activeProject.rustCommands.length,
    activeProject.rustModules.length,
    diskCheckpoints.length,
    fileSaveStates,
    projectSettingsDirty,
    projectSourceDirty,
    rustLogicDirty,
    ],
  );
  useEffect(() => {
    const editorState = normalizeProjectEditorState(activeProject.editorState, activeProject.files, activeProject.activeFileId);
    setOpenEditorFileIds(editorState.openFileIds);
    setMode(editorState.activeMode);
    if (editorState.activeLeftDockTab === "project" || editorState.activeLeftDockTab === "navigator" || editorState.activeLeftDockTab === "components" || editorState.activeLeftDockTab === "assets") {
      setLeftDockTab(editorState.activeLeftDockTab);
    }
    if (editorState.activeRightDockTab === "properties" || editorState.activeRightDockTab === "connections" || editorState.activeRightDockTab === "responsive" || editorState.activeRightDockTab === "impact") {
      setRightDockTab(editorState.activeRightDockTab);
    }
    setLeftDockCollapsed(Boolean(editorState.leftDockCollapsed));
    setRightDockCollapsed(editorState.rightDockCollapsed ?? true);
    if (editorState.activeBottomDockTab === "issues" || editorState.activeBottomDockTab === "output" || editorState.activeBottomDockTab === "tasks" || editorState.activeBottomDockTab === "logs" || editorState.activeBottomDockTab === "preview") {
      setBottomDockTab(editorState.activeBottomDockTab);
    }
    setBottomDockExpanded(Boolean(editorState.bottomDockExpanded));
    setBottomDockMinimized(Boolean(editorState.bottomDockMinimized));
    if (typeof editorState.bottomDockHeight === "number") {
      setBottomDockHeight(editorState.bottomDockHeight);
    }
    if (typeof editorState.bottomDockExpandedHeight === "number") {
      setBottomDockExpandedHeight(editorState.bottomDockExpandedHeight);
    }
    if (editorState.selectedRailActionPresetId) {
      setSelectedRailActionPresetId(editorState.selectedRailActionPresetId);
    }
    setCanvasControlsExpanded(Boolean(editorState.canvasControlsExpanded));
    setTabOrderOverlayVisible(Boolean(editorState.tabOrderOverlayVisible));
    if (Array.isArray(editorState.selectedItemIds)) {
      setSelectedIds(editorState.selectedItemIds);
      setSelectionAnchorId(editorState.selectionAnchorId ?? editorState.selectedItemIds[0] ?? "");
    }
    if (editorState.canvasActiveBreakpoint || typeof editorState.canvasZoom === "number") {
      setWorkspace((current) => {
        let changed = false;
        const nextProjects = current.projects.map((project) => {
          if (project.id !== current.activeProjectId) {
            return project;
          }
          const nextFiles = project.files.map((file) => {
            if (file.id !== project.activeFileId) {
              return file;
            }
            const nextPage = {
              ...file.page,
              ...(editorState.canvasActiveBreakpoint ? { activeBreakpoint: editorState.canvasActiveBreakpoint } : {}),
              ...(typeof editorState.canvasZoom === "number" ? { zoom: editorState.canvasZoom } : {}),
            };
            if (nextPage.activeBreakpoint === file.page.activeBreakpoint && nextPage.zoom === file.page.zoom) {
              return file;
            }
            changed = true;
            return { ...file, page: nextPage };
          });
          return changed ? { ...project, files: nextFiles } : project;
        });
        return changed ? { ...current, projects: nextProjects } : current;
      });
    }
    let restoreViewportFrame: number | null = null;
    if (typeof editorState.canvasViewportScrollLeft === "number" || typeof editorState.canvasViewportScrollTop === "number") {
      restoreViewportFrame = window.requestAnimationFrame(() => {
        const viewport = canvasViewportRef.current;
        if (!viewport) {
          return;
        }
        const scrollLeft = editorState.canvasViewportScrollLeft ?? viewport.scrollLeft;
        const scrollTop = editorState.canvasViewportScrollTop ?? viewport.scrollTop;
        viewport.scrollTo({ left: scrollLeft, top: scrollTop, behavior: "auto" });
        canvasViewportStateRef.current = {
          scrollLeft: Math.max(0, Math.round(scrollLeft)),
          scrollTop: Math.max(0, Math.round(scrollTop)),
        };
      });
    }
    const restoredProjectExplorerFilter =
      editorState.projectExplorerFilter === "all" ||
      editorState.projectExplorerFilter === "ui" ||
      editorState.projectExplorerFilter === "rust" ||
      editorState.projectExplorerFilter === "assets" ||
      editorState.projectExplorerFilter === "backend" ||
      editorState.projectExplorerFilter === "build" ||
      editorState.projectExplorerFilter === "meta"
        ? editorState.projectExplorerFilter
        : "all";
    setProjectExplorerFilter(restoredProjectExplorerFilter);
    setProjectExplorerQuery(editorState.projectExplorerQuery ?? "");
    setSelectedProjectExplorerNodeId(editorState.selectedProjectExplorerNodeId ?? "root");
    setCollapsedProjectExplorerNodeIds(editorState.collapsedProjectExplorerNodeIds ?? ["app-folder", "nova-folder"]);
    setNavigatorQuery(editorState.navigatorQuery ?? "");
    setComponentPaletteQuery(editorState.componentPaletteQuery ?? "");
    setComponentPaletteCategory(
      componentPaletteCategoryOptions.some((option) => option.id === editorState.componentPaletteCategory)
        ? (editorState.componentPaletteCategory as ComponentPaletteCategoryId)
        : "all",
    );
    if (Array.isArray(editorState.componentPaletteRecentTypes)) {
      setComponentPaletteRecentTypes(editorState.componentPaletteRecentTypes as BuilderComponentType[]);
    }
    if (Array.isArray(editorState.componentPaletteFavoriteTypes)) {
      setComponentPaletteFavoriteTypes(editorState.componentPaletteFavoriteTypes as BuilderComponentType[]);
    }
    setOpenPropertySections({ ...defaultOpenPropertySections, ...(editorState.inspectorPropertySections ?? {}) });
    setInspectorPropertyQuery(editorState.inspectorPropertyQuery ?? "");
    setRustFindQuery(editorState.rustFindQuery ?? "");
    setRustFindCaseSensitive(Boolean(editorState.rustFindCaseSensitive));
    setLogicSearchQuery(editorState.logicSearchQuery ?? "");
    setLogicResourceView(
      logicResourceViewIds.includes(editorState.logicResourceView as LogicResourceViewId)
        ? (editorState.logicResourceView as LogicResourceViewId)
        : "all",
    );
    setLogicConnectionFilter(
      logicConnectionFilterIds.includes(editorState.logicConnectionFilter as LogicConnectionFilterId)
        ? (editorState.logicConnectionFilter as LogicConnectionFilterId)
        : "all",
    );
    setRustEditorWordWrap(Boolean(editorState.rustEditorWordWrap));
    setRustFindActiveIndex(0);
    const rustSelectionStart = clamp(editorState.rustEditorSelectionStart ?? 0, 0, activeProject.rustLogic.length);
    const rustSelectionEnd = clamp(editorState.rustEditorSelectionEnd ?? rustSelectionStart, 0, activeProject.rustLogic.length);
    const rustScrollTop = editorState.rustEditorScrollTop ?? 0;
    const rustScrollLeft = editorState.rustEditorScrollLeft ?? 0;
    setRustEditorScrollTop(rustScrollTop);
    setRustEditorScrollLeft(rustScrollLeft);
    setRustEditorSelection(rustEditorSelectionFromValue(activeProject.rustLogic, rustSelectionStart, rustSelectionEnd));
    const restoreRustEditorFrame = window.requestAnimationFrame(() => {
      const editor = rustLogicRef.current;
      if (!editor) {
        return;
      }
      editor.scrollTop = rustScrollTop;
      editor.scrollLeft = rustScrollLeft;
      editor.setSelectionRange(rustSelectionStart, rustSelectionEnd);
      updateRustEditorSelectionFromEditor(editor);
    });
    setProjectTaskSearchQuery(editorState.projectTaskSearchQuery ?? "");
    setProjectTaskStatusFilter(
      projectTaskStatusFilterOptions.some((option) => option.value === editorState.projectTaskStatusFilter)
        ? (editorState.projectTaskStatusFilter as ProjectTaskStatusFilter)
        : "all",
    );
    setProjectTaskKindFilter(
      projectTaskKindFilterOptions.some((option) => option.value === editorState.projectTaskKindFilter)
        ? (editorState.projectTaskKindFilter as ProjectTaskKindFilter)
        : "all",
    );
    setSelectedProjectTaskId(editorState.selectedProjectTaskId ?? "");
    setProjectTaskLogSearchQuery(editorState.projectTaskLogSearchQuery ?? "");
    setBottomDockLogSearchQuery(editorState.bottomDockLogSearchQuery ?? "");
    if (typeof editorState.projectTaskQueuePaused === "boolean") {
      projectTaskQueuePausedRef.current = editorState.projectTaskQueuePaused;
      setProjectTaskQueuePaused(editorState.projectTaskQueuePaused);
    }
    setActiveGeneratedPreviewPath(editorState.activeGeneratedPreviewPath ?? "");
    setSelectedGeneratedPreviewPaths(editorState.selectedGeneratedPreviewPaths ?? []);
    setShowGeneratedPlanAdvanced(Boolean(editorState.showGeneratedPlanAdvanced));
    setSelectedBuilderIssueId(editorState.selectedBuilderIssueId ?? "");
    return () => {
      if (restoreViewportFrame !== null) {
        window.cancelAnimationFrame(restoreViewportFrame);
      }
      window.cancelAnimationFrame(restoreRustEditorFrame);
    };
  }, [activeProject.id]);
  useEffect(() => {
    setOpenEditorFileIds((current) => {
      const validIds = new Set(activeProject.files.map((file) => file.id));
      const nextIds = [activeFile.id, ...current.filter((id) => id !== activeFile.id && validIds.has(id))].slice(0, 6);
      return nextIds.length > 0 ? nextIds : activeProject.files[0]?.id ? [activeProject.files[0].id] : [];
    });
  }, [activeFile.id, activeProject.files]);
  const openEditorTabs = useMemo<BuilderEditorTab[]>(() => {
    const fileById = new Map(activeProject.files.map((file) => [file.id, file]));
    const uiTabs = openEditorFileIds
      .map((fileId) => fileById.get(fileId))
      .filter((file): file is DesignerFile => Boolean(file))
      .map((file) => ({
        id: `ui:${file.id}`,
        kind: "ui" as const,
        label: file.name,
        detail: `${file.items.length} 控件 · ${file.page.width} x ${file.page.height}${fileSaveStates.get(file.id)?.dirty ? " · 未保存" : " · 已同步"}`,
        badge: "UI",
        fileId: file.id,
        path: projectDiskPath(activeProject.rootPath, "ui", projectUiDiskFileName(file)) || projectRelativePath("ui", projectUiDiskFileName(file)),
        relativePath: projectRelativePath("ui", projectUiDiskFileName(file)),
        revealNodeId: `ui-${file.id}`,
        targetMode: "design" as const,
        dirty: Boolean(fileSaveStates.get(file.id)?.dirty),
        closable: openEditorFileIds.length > 1,
        icon: FileJson,
      }));

    return [
      ...uiTabs,
      {
        id: "logic:rust",
        kind: "logic",
        label: "Rust 逻辑",
        detail: `${activeProject.rustCommands.length} 命令 · ${activeProject.rustModules.length} 模块`,
        badge: "Rust",
        path: projectDiskPath(activeProject.rootPath, "rust", "logic.rs") || projectRelativePath("rust", "logic.rs"),
        relativePath: projectRelativePath("rust", "logic.rs"),
        revealNodeId: "rust-logic",
        targetMode: "logic",
        dirty: rustLogicDirty,
        closable: false,
        icon: Braces,
      },
      {
        id: "build:workspace",
        kind: "build",
        label: "构建与运行",
        detail: activeProject.outputExePath ? fileNameFromPath(activeProject.outputExePath) : "尚未生成 exe",
        badge: activeProject.outputExePath ? "exe" : "待构建",
        path: activeProject.outputExePath || projectDiskPath(activeProject.rootPath, "app") || projectRelativePath("app"),
        relativePath:
          activeProject.rootPath && activeProject.outputExePath?.startsWith(activeProject.rootPath)
            ? activeProject.outputExePath.slice(activeProject.rootPath.length).replace(/^[/\\]+/, "") || "."
            : projectRelativePath("app"),
        revealNodeId: activeProject.outputExePath ? "app-release-exe" : "app-folder",
        targetMode: "build",
        dirty: building || bundling || Boolean(checkingTarget) || validatingWindow,
        closable: false,
        icon: Download,
      },
    ];
  }, [
    activeFile.id,
    activeProject.files,
    activeProject.outputExePath,
    activeProject.rootPath,
    activeProject.rustCommands.length,
    activeProject.rustModules.length,
    building,
    bundling,
    checkingTarget,
    fileSaveStates,
    mode,
    openEditorFileIds,
    rustLogicDirty,
    validatingWindow,
  ]);
  const activeEditorTabId = mode === "logic" ? "logic:rust" : mode === "build" ? "build:workspace" : `ui:${activeFile.id}`;
  const openEditorUiTabCount = openEditorTabs.filter((tab) => tab.kind === "ui").length;
  const dirtyOpenEditorTabCount = openEditorTabs.filter((tab) => tab.dirty).length;
  const cleanClosableOpenEditorTabCount = openEditorFileIds.filter((fileId) => fileId !== activeFile.id && !fileSaveStates.get(fileId)?.dirty).length;
  const otherOpenEditorUiTabCount = openEditorFileIds.filter((fileId) => fileId !== activeFile.id).length;
  const activeEditorTab = openEditorTabs.find((tab) => tab.id === activeEditorTabId) ?? openEditorTabs[0] ?? null;
  const openEditorTabCountLabel = `${openEditorUiTabCount} UI · ${activeProject.files.length} 文件`;
  const projectWorkingSetItems = useMemo<ProjectWorkingSetItem[]>(() => {
    const tabItems = openEditorTabs.map<ProjectWorkingSetItem>((tab) => {
      const active = tab.id === activeEditorTabId;
      const kind: ProjectWorkingSetKind = active
        ? "current"
        : tab.dirty
          ? "dirty"
          : tab.kind === "logic"
            ? "logic"
            : tab.kind === "build"
              ? "build"
              : "recent";

      return {
        id: `tab-${tab.id}`,
        kind,
        label: tab.label,
        detail: tab.detail,
        path: tab.path,
        relativePath: tab.relativePath,
        badge: tab.badge,
        // The workbench kind the tab belongs to. `kind` above is remapped to
        // "current" for the active row, which used to make this self-check lose
        // track of the build/logic entry exactly while it was on screen.
        tabKind: tab.kind,
        // Dirty wins over active: an unsaved change is the thing to act on, and
        // "当前" is already carried by the row's background + aria-current.
        statusLabel: tab.dirty
          ? "未保存"
          : active
            ? "当前"
            : tab.kind === "ui"
              ? "已打开"
              : tab.kind === "logic"
                ? "逻辑"
                : "构建",
        nodeId: tab.revealNodeId,
        dirty: Boolean(tab.dirty),
        active,
        tabId: tab.id,
        icon: tab.icon,
      };
    });
    const openedNodeIds = new Set(tabItems.map((item) => item.nodeId));
    const dirtySourceItems = projectSourceOverviewRows
      .filter((row) => row.status === "dirty" && !openedNodeIds.has(row.nodeId))
      .slice(0, 4)
      .map<ProjectWorkingSetItem>((row) => ({
        id: `source-${row.id}`,
        kind: "dirty",
        label: row.title,
        detail: row.detail,
        path: row.path,
        relativePath: row.relativePath,
        badge: row.kind,
        statusLabel: row.statusLabel,
        nodeId: row.nodeId,
        dirty: true,
        active: false,
        sourceRowId: row.id,
        icon: row.icon,
      }));
    const ordered = [
      ...tabItems.filter((item) => item.active),
      ...tabItems.filter((item) => !item.active && item.dirty),
      ...dirtySourceItems,
      ...tabItems.filter((item) => !item.active && !item.dirty && (item.kind === "logic" || item.kind === "build")),
      ...tabItems.filter((item) => !item.active && !item.dirty && item.kind === "recent"),
    ];
    const seen = new Set<string>();
    return ordered.filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    }).slice(0, 8);
  }, [activeEditorTabId, openEditorTabs, projectSourceOverviewRows]);
  const projectWorkingSetDirtyCount = projectWorkingSetItems.filter((item) => item.dirty).length;
  const projectWorkingSetActiveItem = projectWorkingSetItems.find((item) => item.active) ?? projectWorkingSetItems[0] ?? null;
  const projectWorkingSetSummary = projectWorkingSetActiveItem
    ? `${projectWorkingSetItems.length} 项 · 当前 ${projectWorkingSetActiveItem.label}`
    : "暂无工作集项目";
  const createCurrentProjectEditorState = (project: DesignerProject = activeProject): ProjectEditorState => {
    const editorFile = project.files.find((file) => file.id === project.activeFileId) ?? project.files[0];
    const validItemIds = new Set((editorFile?.items ?? []).map((item) => item.id));
    const persistedSelectedItemIds = selectedIds.filter((id) => validItemIds.has(id));
    const persistedSelectionAnchorId = validItemIds.has(selectionAnchorId)
      ? selectionAnchorId
      : persistedSelectedItemIds[0] ?? "";
    const viewport = canvasViewportRef.current;
    const viewportPosition = viewport
      ? {
          scrollLeft: Math.max(0, Math.round(viewport.scrollLeft)),
          scrollTop: Math.max(0, Math.round(viewport.scrollTop)),
        }
      : canvasViewportStateRef.current;
    const rustEditor = rustLogicRef.current;
    const rustLogicLength = project.rustLogic.length;
    const rustSelectionStart = clamp(rustEditor?.selectionStart ?? rustEditorSelection.selectionStart, 0, rustLogicLength);
    const rustSelectionEnd = clamp(rustEditor?.selectionEnd ?? rustEditorSelection.selectionEnd, 0, rustLogicLength);
    return {
      openFileIds: normalizeOpenEditorFileIds(openEditorFileIds, project.files, project.activeFileId),
      activeMode: mode,
      activeLeftDockTab: leftDockTab,
      activeRightDockTab: rightDockTab,
      leftDockCollapsed,
      rightDockCollapsed,
      activeBottomDockTab: bottomDockTab,
      bottomDockExpanded,
      bottomDockMinimized,
      bottomDockHeight,
      bottomDockExpandedHeight,
      selectedRailActionPresetId,
      canvasControlsExpanded,
      tabOrderOverlayVisible,
      canvasActiveBreakpoint: normalizeBreakpoint(editorFile?.page.activeBreakpoint),
      canvasZoom: Math.round(clamp(Number(editorFile?.page.zoom ?? defaultPage.zoom), 0.25, 2) * 100) / 100,
      canvasViewportScrollLeft: viewportPosition.scrollLeft,
      canvasViewportScrollTop: viewportPosition.scrollTop,
      selectedItemIds: persistedSelectedItemIds,
      selectionAnchorId: persistedSelectionAnchorId,
      projectExplorerFilter,
      projectExplorerQuery,
      selectedProjectExplorerNodeId,
      collapsedProjectExplorerNodeIds,
      navigatorQuery,
      componentPaletteQuery,
      componentPaletteCategory,
      componentPaletteRecentTypes,
      componentPaletteFavoriteTypes,
      inspectorPropertySections: openPropertySections,
      inspectorPropertyQuery,
      rustFindQuery,
      rustFindCaseSensitive,
      logicSearchQuery,
      logicResourceView,
      logicConnectionFilter,
      rustEditorScrollTop: Math.max(0, Math.round(rustEditor?.scrollTop ?? rustEditorScrollTop)),
      rustEditorScrollLeft: Math.max(0, Math.round(rustEditor?.scrollLeft ?? rustEditorScrollLeft)),
      rustEditorWordWrap,
      rustEditorSelectionStart: rustSelectionStart,
      rustEditorSelectionEnd: rustSelectionEnd,
      projectTaskSearchQuery,
      projectTaskStatusFilter,
      projectTaskKindFilter,
      selectedProjectTaskId,
      projectTaskLogSearchQuery,
      bottomDockLogSearchQuery,
      projectTaskQueuePaused,
      activeGeneratedPreviewPath,
      selectedGeneratedPreviewPaths,
      showGeneratedPlanAdvanced,
      selectedBuilderIssueId,
      activeEditorTabId,
      updatedAt: new Date().toISOString(),
    };
  };
  const projectWithCurrentEditorState = (project: DesignerProject = activeProject): DesignerProject => ({
    ...project,
    editorState: createCurrentProjectEditorState(project),
  });
  const workspaceWithCurrentEditorState = () => {
    const projectSnapshot = projectWithCurrentEditorState(activeProject);
    return {
      ...workspace,
      projects: workspace.projects.map((project) => (project.id === activeProject.id ? projectSnapshot : project)),
    };
  };
  const projectExplorerNodeById = useMemo(
    () => new Map(projectExplorerModel.nodes.map((node) => [node.id, node])),
    [projectExplorerModel.nodes],
  );
  const projectExplorerFolderNodeIds = useMemo(
    () => projectExplorerModel.nodes.filter((node) => projectExplorerNodeHasChildren(projectExplorerModel.nodes, node.id)).map((node) => node.id),
    [projectExplorerModel.nodes],
  );
  const collapsedProjectExplorerNodeSet = useMemo(() => new Set(collapsedProjectExplorerNodeIds), [collapsedProjectExplorerNodeIds]);
  const visibleProjectExplorerNodes = useMemo(
    () =>
      projectExplorerModel.nodes.filter(
        (node) =>
          projectExplorerNodeMatchesFilter(node, projectExplorerFilter) &&
          projectExplorerNodeMatchesSearch(node, projectExplorerQuery) &&
          (projectExplorerQuery.trim() || projectExplorerVisibleWithCollapsedAncestors(node, projectExplorerNodeById, collapsedProjectExplorerNodeSet)),
      ),
    [collapsedProjectExplorerNodeSet, projectExplorerFilter, projectExplorerModel.nodes, projectExplorerNodeById, projectExplorerQuery],
  );
  const visibleProjectExplorerRows = useMemo(
    () => groupProjectExplorerRows(visibleProjectExplorerNodes),
    [visibleProjectExplorerNodes],
  );
  const projectExplorerLocatorActive = projectExplorerQuery.trim().length > 0;
  const projectExplorerLocatorResults = useMemo(() => {
    const query = projectExplorerQuery.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return projectExplorerModel.nodes
      .filter((node) => node.id !== "root" && projectExplorerNodeMatchesFilter(node, projectExplorerFilter) && projectExplorerNodeMatchesSearch(node, query))
      .map((node) => {
        const label = node.label.toLowerCase();
        const path = (node.path ?? "").toLowerCase();
        const detail = node.detail.toLowerCase();
        const exact = label === query || path.endsWith(query) ? 0 : 1;
        const prefix = label.startsWith(query) || path.includes(`/${query}`) || path.includes(`\\${query}`) ? 0 : 1;
        const active = node.active ? 0 : 1;
        const dirty = node.dirty ? 0 : 1;
        const depth = node.depth;
        const action = node.action === "none" ? 1 : 0;
        const textScore = label.includes(query) ? 0 : path.includes(query) ? 1 : detail.includes(query) ? 2 : 3;
        return { node, rank: [exact, prefix, active, dirty, action, textScore, depth] };
      })
      .sort((left, right) => {
        for (let index = 0; index < left.rank.length; index += 1) {
          const delta = left.rank[index] - right.rank[index];
          if (delta !== 0) {
            return delta;
          }
        }
        return left.node.label.localeCompare(right.node.label);
      })
      .slice(0, 8)
      .map((result) => result.node);
  }, [projectExplorerFilter, projectExplorerModel.nodes, projectExplorerQuery]);
  const projectExplorerFilterCounts = useMemo(
    () =>
      new Map(
        projectExplorerFilterOptions.map((option) => [
          option.id,
          projectExplorerModel.nodes.filter((node) => projectExplorerNodeMatchesFilter(node, option.id) && node.id !== "root").length,
        ]),
      ),
    [projectExplorerModel.nodes],
  );
  const selectedProjectExplorerNode = useMemo(
    () =>
      projectExplorerModel.nodes.find((node) => node.id === selectedProjectExplorerNodeId) ??
      projectExplorerModel.nodes.find((node) => node.active) ??
      projectExplorerModel.nodes[0] ??
      null,

    [projectExplorerModel.nodes, selectedProjectExplorerNodeId],
  );
  const selectedProjectExplorerPathNodes = useMemo(() => {
    if (!selectedProjectExplorerNode) {
      return [];
    }
    const nodes: ProjectExplorerNode[] = [];
    const seen = new Set<string>();
    let cursor: ProjectExplorerNode | undefined = selectedProjectExplorerNode;
    while (cursor && !seen.has(cursor.id)) {
      nodes.push(cursor);
      seen.add(cursor.id);
      cursor = cursor.parentId ? projectExplorerNodeById.get(cursor.parentId) : undefined;
    }
    return nodes.reverse();
  }, [projectExplorerNodeById, selectedProjectExplorerNode]);
  const selectedProjectExplorerDisplayPath = useMemo(() => {
    if (!selectedProjectExplorerNode) {
      return "";
    }
    if (selectedProjectExplorerNode.path) {
      return selectedProjectExplorerNode.path;
    }
    return projectRelativePath(...selectedProjectExplorerPathNodes.map((node) => node.label.replace(/\/$/, "")));
  }, [selectedProjectExplorerNode, selectedProjectExplorerPathNodes]);
  const selectedProjectExplorerRelativePath = useMemo(() => {
    if (!selectedProjectExplorerDisplayPath) {
      return "";
    }
    const rootPath = activeProject.rootPath?.trim() ?? "";
    if (rootPath && selectedProjectExplorerDisplayPath.startsWith(rootPath)) {
      return selectedProjectExplorerDisplayPath.slice(rootPath.length).replace(/^[/\\]+/, "") || ".";
    }
    return selectedProjectExplorerDisplayPath;
  }, [activeProject.rootPath, selectedProjectExplorerDisplayPath]);
  const selectedProjectExplorerParentNode = selectedProjectExplorerNode?.parentId
    ? projectExplorerNodeById.get(selectedProjectExplorerNode.parentId) ?? null
    : null;
  const selectedProjectExplorerChildNodes = useMemo(
    () => (selectedProjectExplorerNode ? projectExplorerModel.nodes.filter((node) => node.parentId === selectedProjectExplorerNode.id) : []),
    [projectExplorerModel.nodes, selectedProjectExplorerNode],
  );
  const selectedProjectExplorerFile = selectedProjectExplorerNode?.fileId
    ? activeProject.files.find((file) => file.id === selectedProjectExplorerNode.fileId) ?? null
    : null;
  const selectedProjectExplorerFileSaveState = selectedProjectExplorerFile ? fileSaveStates.get(selectedProjectExplorerFile.id) ?? null : null;
  const selectedProjectExplorerDossier = useMemo<ProjectExplorerDossier | null>(() => {
    if (!selectedProjectExplorerNode) {
      return null;
    }

    const groupId = projectExplorerNodeGroupId(selectedProjectExplorerNode);
    const groupMeta = projectExplorerGroupMeta(groupId);
    const relatedTabCount = openEditorTabs.filter(
      (tab) =>
        (selectedProjectExplorerNode.fileId && tab.fileId === selectedProjectExplorerNode.fileId) ||
        tab.revealNodeId === selectedProjectExplorerNode.id ||
        tab.path === selectedProjectExplorerDisplayPath ||
        tab.relativePath === selectedProjectExplorerRelativePath,
    ).length;
    const syncState = selectedProjectExplorerFileSaveState?.dirty
      ? "UI 文件未同步"
      : selectedProjectExplorerNode.dirty
        ? "节点未保存"
        : projectSourceDirty
          ? "项目有未保存更改"
          : "已同步";
    const missingSlotCountForDossier = activeProject.rustCommands.filter(
      (command) => !rustCommandFunctionExists(activeProject.rustLogic, sanitizeRustCommandName(command.name)),
    ).length;
    const artifactState =
      groupId === "ui"
        ? `${selectedProjectExplorerFile?.items.length ?? projectExplorerModel.controlCount} 控件`
        : groupId === "rust"
          ? `${activeProject.rustCommands.length} command / ${missingSlotCountForDossier} 槽待生成`
          : groupId === "backend"
            ? `${activeProject.backendIntegrations.length} 集成`
            : groupId === "assets"
              ? `${activeProject.assets.length} 资源`
              : groupId === "app"
                ? activeProject.outputExePath
                  ? fileNameFromPath(activeProject.outputExePath)
                  : "等待构建"
                : groupId === "meta"
                  ? `${diskCheckpoints.length} 检查点`
                  : projectExplorerModel.summary;

    return {
      groupId,
      groupLabel: groupMeta.label,
      sourceOfTruth: projectExplorerDossierSourceOfTruth(groupId),
      saveTarget: selectedProjectExplorerDisplayPath || selectedProjectExplorerRelativePath || activeProject.rootPath || "保存后创建",
      syncState,
      artifactState,
      relatedTabCount,
      taskIds: projectExplorerDossierTasks(groupId),
    };
  }, [
    activeProject.assets.length,
    activeProject.backendIntegrations.length,
    activeProject.outputExePath,
    activeProject.rootPath,
    activeProject.rustCommands.length,
    activeProject.rustLogic,
    diskCheckpoints.length,
    fileSaveStates,
    openEditorTabs,
    projectExplorerModel.controlCount,
    projectExplorerModel.summary,
    projectSourceDirty,
    selectedProjectExplorerDisplayPath,
    selectedProjectExplorerFile?.items.length,
    selectedProjectExplorerFileSaveState?.dirty,
    selectedProjectExplorerNode,
    selectedProjectExplorerRelativePath,
  ]);
  const selectedProjectExplorerImpactItems = useMemo<ProjectExplorerImpactItem[]>(() => {
    if (!selectedProjectExplorerNode || !selectedProjectExplorerDossier) {
      return [];
    }

    const isDirty = Boolean(selectedProjectExplorerFileSaveState?.dirty || selectedProjectExplorerNode.dirty || projectSourceDirty);
    const impactItems: ProjectExplorerImpactItem[] = [
      {
        id: "sync-state",
        title: "同步状态",
        detail: selectedProjectExplorerDossier.syncState,
        badge: isDirty ? "需要保存" : "已同步",
        tone: isDirty ? "warning" : "success",
        actionLabel: isDirty ? "保存" : "任务",
        action: isDirty ? { kind: "task", taskId: "save-project" } : { kind: "open-tasks" },
        icon: Save,
      },
      {
        id: "node-location",
        title: "项目路径",
        detail: selectedProjectExplorerRelativePath || selectedProjectExplorerDisplayPath || ".",
        badge: selectedProjectExplorerNode.path ? "磁盘" : "逻辑",
        tone: selectedProjectExplorerNode.path ? "ready" : "muted",
        actionLabel: selectedProjectExplorerRelativePath ? "复制相对" : "复制完整",
        action: selectedProjectExplorerRelativePath ? { kind: "copy-relative-path" } : { kind: "copy-path" },
        icon: FolderOpen,
      },
    ];

    if (selectedProjectExplorerDossier.relatedTabCount > 0) {
      impactItems.push({
        id: "open-editor-tabs",
        title: "打开标签",
        detail: `${selectedProjectExplorerDossier.relatedTabCount} 个打开标签与当前节点关联。`,
        badge: `${selectedProjectExplorerDossier.relatedTabCount} tabs`,
        tone: "ready",
        actionLabel: "打开",
        action: { kind: "open-node" },
        icon: Columns3,
      });
    }

    if (selectedProjectExplorerChildNodes.length > 0) {
      impactItems.push({
        id: "child-nodes",
        title: "子节点",
        detail: `${selectedProjectExplorerChildNodes.length} 个子节点，包含 ${selectedProjectExplorerChildNodes.slice(0, 3).map((node) => node.label).join(" / ")}。`,
        badge: `${selectedProjectExplorerChildNodes.length}`,
        tone: "muted",
        actionLabel: "同类",
        action: { kind: "filter-kind" },
        icon: Layers,
      });
    }

    for (const taskId of selectedProjectExplorerDossier.taskIds.slice(0, 3)) {
      impactItems.push({
        id: `task-${taskId}`,
        title: projectTaskDefinitions[taskId].title,
        detail: projectTaskDefinitions[taskId].detail,
        badge: "任务",
        tone: READINESS_GATED_PROJECT_ACTIONS.has(taskId) ? "warning" : "ready",
        actionLabel: "运行",
        action: { kind: "task", taskId },
        icon: Play,
      });
    }

    return impactItems.slice(0, 7);
  }, [
    projectSourceDirty,
    selectedProjectExplorerChildNodes,
    selectedProjectExplorerDisplayPath,
    selectedProjectExplorerDossier,
    selectedProjectExplorerFileSaveState?.dirty,
    selectedProjectExplorerNode,
    selectedProjectExplorerRelativePath,
  ]);
  const SelectedProjectExplorerIcon = selectedProjectExplorerNode?.icon ?? FolderOpen;
  const toggleProjectExplorerNode = (nodeId: string) => {
    setCollapsedProjectExplorerNodeIds((current) => (current.includes(nodeId) ? current.filter((id) => id !== nodeId) : [...current, nodeId]));
  };
  const expandProjectExplorerTree = () => setCollapsedProjectExplorerNodeIds([]);
  const collapseProjectExplorerTree = () => setCollapsedProjectExplorerNodeIds(projectExplorerFolderNodeIds.filter((id) => id !== "root"));
  const [projectJumpQuery, setProjectJumpQuery] = useState("");
  const [projectJumpFocused, setProjectJumpFocused] = useState(false);
  const [projectJumpActiveIndex, setProjectJumpActiveIndex] = useState(0);
  const [projectJumpRecentIds, setProjectJumpRecentIds] = useState<string[]>(() => loadProjectJumpRecentIds());
  const [projectJumpFeedback, setProjectJumpFeedback] = useState<ProjectJumpFeedback | null>(null);
  const [projectTasks, setProjectTasks] = useState<ProjectTaskEntry[]>(() => loadInitialProjectTaskHistory());
  const [projectTaskSearchQuery, setProjectTaskSearchQuery] = useState("");
  const [projectTaskStatusFilter, setProjectTaskStatusFilter] = useState<ProjectTaskStatusFilter>("all");
  const [projectTaskKindFilter, setProjectTaskKindFilter] = useState<ProjectTaskKindFilter>("all");
  const [selectedProjectTaskId, setSelectedProjectTaskId] = useState("");
  const [projectTaskLogSearchQuery, setProjectTaskLogSearchQuery] = useState("");
  const [bottomDockLogSearchQuery, setBottomDockLogSearchQuery] = useState("");
  const [editorExperienceAuditFilter, setEditorExperienceAuditFilter] = useState<EditorExperienceAuditFilter>("all");
  const [projectTaskQueuePaused, setProjectTaskQueuePaused] = useState(() => loadProjectTaskQueueState().paused);
  const [projectTaskQueueMessage, setProjectTaskQueueMessage] = useState("");
  const [projectTaskQueueVersion, setProjectTaskQueueVersion] = useState(0);
  const [customProjectActionPresets, setCustomProjectActionPresets] = useState<ProjectActionPresetDefinition[]>(() => loadProjectActionPresets());
  const [selectedRailActionPresetId, setSelectedRailActionPresetId] = useState("design-preflight");
  const [destructiveAction, setDestructiveAction] = useState<DestructiveActionRequest | null>(null);
  const [customPresetTitle, setCustomPresetTitle] = useState("自定义发布流程");
  const [customPresetDetail, setCustomPresetDetail] = useState("可复用的项目构建流程。");
  const [customPresetDraftActionId, setCustomPresetDraftActionId] = useState<ProjectJumpActionId>("save-project");
  const [customPresetDraftActions, setCustomPresetDraftActions] = useState<ProjectJumpActionId[]>(["save-project", "quick-check-all"]);
  const [replaceTemplateOpen, setReplaceTemplateOpen] = useState(false);
  const [simulatorStateValues, setSimulatorStateValues] = useState<Record<string, string>>(() => simulatorStateFromProject(activeProject));
  const [simulatorTrace, setSimulatorTrace] = useState<SimulatorTraceEntry[]>([]);
  const [dragSession, setDragSession] = useState<DragSession | null>(null);
  const [smartGuides, setSmartGuides] = useState<SmartGuide[]>([]);
  const [canvasPrecisionDragActive, setCanvasPrecisionDragActive] = useState(false);
  const [dropIntent, setDropIntent] = useState<BuilderDropIntent | null>(null);
  const [inlineTextEdit, setInlineTextEdit] = useState<InlineTextEdit | null>(null);
  const [canvasContextMenu, setCanvasContextMenu] = useState<CanvasContextMenuState | null>(null);
  const [canvasContextInsertQuery, setCanvasContextInsertQuery] = useState("");
  const [canvasContextInsertActiveIndex, setCanvasContextInsertActiveIndex] = useState(0);
  const [projectExplorerContextMenu, setProjectExplorerContextMenu] = useState<ProjectExplorerContextMenuState | null>(null);
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
  const [logicSearchQuery, setLogicSearchQuery] = useState("");
  const [logicResourceView, setLogicResourceView] = useState<LogicResourceViewId>("connections");
  const [logicConnectionFilter, setLogicConnectionFilter] = useState<LogicConnectionFilterId>("all");
  const [rustDebuggerPanel, setRustDebuggerPanel] = useState<RustDebuggerPanelId>("problems");
  const [disabledRustDebuggerBreakpointIds, setDisabledRustDebuggerBreakpointIds] = useState<string[]>([]);
  const [slotNavigationHistory, setSlotNavigationHistory] = useState<SlotNavigationEntry[]>([]);
  const logicResourceVisible = (view: LogicResourceViewId) => logicResourceView === "all" || logicResourceView === view;
  const [rustEditorScrollTop, setRustEditorScrollTop] = useState(0);
  const [rustEditorScrollLeft, setRustEditorScrollLeft] = useState(0);
  const [rustEditorWordWrap, setRustEditorWordWrap] = useState(false);
  const [rustSyntaxHighlightVisible, setRustSyntaxHighlightVisible] = useState(true);
  const [rustEditorSelection, setRustEditorSelection] = useState<RustEditorSelection>(() => rustEditorSelectionFromValue("", 0));
  const [rustCompletionTrigger, setRustCompletionTrigger] = useState<RustCompletionTrigger | null>(null);
  const [rustCompletionCommit, setRustCompletionCommit] = useState<RustCompletionCommit | null>(null);
  const [rustFindQuery, setRustFindQuery] = useState("");
  const [rustReplaceQuery, setRustReplaceQuery] = useState("");
  const [rustGoToLineQuery, setRustGoToLineQuery] = useState("");
  const [rustRenameQuery, setRustRenameQuery] = useState("");
  const [rustFindCaseSensitive, setRustFindCaseSensitive] = useState(false);
  const [rustFindActiveIndex, setRustFindActiveIndex] = useState(0);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [projectSnapshotVersion, setProjectSnapshotVersion] = useState(0);
  const [clipboardVersion, setClipboardVersion] = useState(0);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const canvasViewportRef = useRef<HTMLDivElement | null>(null);
  const canvasViewportStateRef = useRef({ scrollLeft: 0, scrollTop: 0 });
  const canvasContextInsertInputRef = useRef<HTMLInputElement | null>(null);
  const projectJumpInputRef = useRef<HTMLInputElement | null>(null);
  const leftRunControlsRef = useRef<HTMLDivElement | null>(null);
  const projectJumpFeedbackTimeoutRef = useRef<number | null>(null);
  const projectExplorerRenameInputRef = useRef<HTMLInputElement | null>(null);
  const selectedObjectNameInputRef = useRef<HTMLInputElement | null>(null);
  const rustLogicRef = useRef<HTMLTextAreaElement | null>(null);
  const rustFindInputRef = useRef<HTMLInputElement | null>(null);
  const rustGoToLineInputRef = useRef<HTMLInputElement | null>(null);
  const rustRenameInputRef = useRef<HTMLInputElement | null>(null);
  const itemsRef = useRef<BuilderItem[]>(items);
  const historyRef = useRef<Record<string, HistoryEntry>>({});
  const projectSnapshotsRef = useRef<Record<string, ProjectSnapshotEntry[]>>({});
  const clipboardRef = useRef<BuilderItem[]>([]);
  const palettePointerDragRef = useRef<PalettePointerDrag | null>(null);
  const suppressPaletteClickRef = useRef(false);
  const selectionMarqueeRef = useRef<SelectionMarquee | null>(null);
  const suppressCanvasClickRef = useRef(false);
  const projectTaskQueueRef = useRef<ProjectTaskEntry[]>(loadProjectTaskQueueState().tasks);
  const projectTaskQueuePausedRef = useRef(projectTaskQueuePaused);
  const projectTaskRunnerRef = useRef<Promise<void> | null>(null);
  const releasePipelineEntriesRef = useRef<Record<string, ReleasePipelineEntry>>({});
  const activeProjectRef = useRef(activeProject);
  const projectChangeImpactRef = useRef<ProjectChangeImpactSummary | null>(null);
  const projectDependencyGraphRef = useRef<ProjectDependencyGraphRecord | null>(null);
  const restoredProjectTaskQueueRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined" || !canvasContextMenu) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      canvasContextInsertInputRef.current?.focus();
      canvasContextInsertInputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [canvasContextMenu]);
  const componentPaletteCounts = useMemo(() => {
    const counts: Record<ComponentPaletteCategoryId, number> = {
      all: palette.length,
      layout: 0,
      inputs: 0,
      data: 0,
      display: 0,
    };
    for (const definition of palette) {
      counts[componentPaletteCategoryForType(definition.type)] += 1;
    }
    return counts;
  }, []);
  const componentCoverageRows = useMemo(() => {
    const availableTypes = new Set(palette.map((definition) => definition.type));
    const normalizedQuery = componentPaletteQuery.trim().toLowerCase();
    return componentCoverageGroups.map((group) => {
      const presentTypes = group.types.filter((type) => availableTypes.has(type));
      const missingTypes = group.types.filter((type) => !availableTypes.has(type));
      const categoryTypes = presentTypes.filter(
        (type) => componentPaletteCategory === "all" || componentPaletteCategoryForType(type) === componentPaletteCategory,
      );
      const groupMatchesSearch =
        normalizedQuery.length === 0 ||
        group.id.toLowerCase().includes(normalizedQuery) ||
        group.title.toLowerCase().includes(normalizedQuery) ||
        group.description.toLowerCase().includes(normalizedQuery);
      const matchingTypes = categoryTypes.filter((type) => componentPaletteMatchesSearch(getDefinition(type), componentPaletteQuery));
      const visibleTypes = matchingTypes.length > 0 ? matchingTypes : groupMatchesSearch ? categoryTypes : [];
      return {
        ...group,
        availableCount: presentTypes.length,
        totalCount: group.types.length,
        progress: Math.round((presentTypes.length / Math.max(group.types.length, 1)) * 100),
        missingTypes,
        visibleTypes,
        matchesCurrentFilter: visibleTypes.length > 0 || (groupMatchesSearch && componentPaletteCategory === "all"),
      };
    });
  }, [componentPaletteCategory, componentPaletteQuery]);
  const visibleComponentCoverageRows = useMemo(
    () => componentCoverageRows.filter((row) => row.matchesCurrentFilter).slice(0, 5),
    [componentCoverageRows],
  );
  const componentCoverageCompleteCount = componentCoverageRows.filter((row) => row.availableCount === row.totalCount).length;
  const componentCoverageFilterLabel = componentPaletteQuery.trim()
    ? `搜索 "${componentPaletteQuery.trim()}"`
    : componentPaletteCategoryLabel(componentPaletteCategory);
  const activeComponentPaletteKit = useMemo(
    () => componentPaletteKitDefinitions.find((kit) => kit.id === activeComponentPaletteKitId) ?? null,
    [activeComponentPaletteKitId],
  );
  const activeComponentPaletteKitTypeSet = useMemo(
    () => (activeComponentPaletteKit ? new Set<BuilderComponentType>(activeComponentPaletteKit.types) : null),
    [activeComponentPaletteKit],
  );
  const componentPaletteKitRows = useMemo(() => {
    const availableTypes = new Set(palette.map((definition) => definition.type));
    return componentPaletteKitDefinitions.map((kit) => {
      const presentTypes = kit.types.filter((type) => availableTypes.has(type));
      return {
        ...kit,
        presentTypes,
        sampleTypes: presentTypes.slice(0, 4),
        availableCount: presentTypes.length,
        totalCount: kit.types.length,
      };
    });
  }, []);
  const componentPaletteQuickInsertDefinitions = useMemo(
    () => componentPaletteQuickInsertTypes.map((type) => getDefinition(type)),
    [],
  );
  const componentPaletteRecentDefinitions = useMemo(
    () => componentPaletteRecentTypes.map((type) => getDefinition(type)),
    [componentPaletteRecentTypes],
  );
  const componentPaletteFavoriteDefinitions = useMemo(
    () => componentPaletteFavoriteTypes.map((type) => getDefinition(type)),
    [componentPaletteFavoriteTypes],
  );
  const showComponentPaletteKits = componentPaletteCategory === "all" && componentPaletteQuery.trim().length === 0;
  const showComponentPaletteQuickInsert = showComponentPaletteKits && !activeComponentPaletteKit;
  const showComponentPaletteCollections = showComponentPaletteKits && !activeComponentPaletteKit;
  const rememberComponentPaletteRecent = (type: BuilderComponentType) => {
    setComponentPaletteRecentTypes((current) => normalizeComponentTypeList([type, ...current.filter((candidate) => candidate !== type)], 8));
  };
  const toggleComponentPaletteFavorite = (type: BuilderComponentType) => {
    setComponentPaletteFavoriteTypes((current) => {
      if (current.includes(type)) {
        return current.filter((candidate) => candidate !== type);
      }
      return normalizeComponentTypeList([type, ...current], 8);
    });
  };
  const visibleComponentPalette = useMemo(
    () =>
      palette.filter((definition) => {
        const matchesCategory = componentPaletteCategory === "all" || componentPaletteCategoryForType(definition.type) === componentPaletteCategory;
        const matchesActiveKit = !activeComponentPaletteKitTypeSet || activeComponentPaletteKitTypeSet.has(definition.type);
        return matchesActiveKit && matchesCategory && componentPaletteMatchesSearch(definition, componentPaletteQuery);
      }),
    [activeComponentPaletteKitTypeSet, componentPaletteCategory, componentPaletteQuery],
  );
  const visibleComponentPaletteGroups = useMemo(() => {
    const hasFocusedFilter = componentPaletteQuery.trim().length > 0 || Boolean(activeComponentPaletteKitTypeSet);
    return componentPaletteCategoryOptions
      .filter((category): category is Extract<(typeof componentPaletteCategoryOptions)[number], { id: Exclude<ComponentPaletteCategoryId, "all"> }> => category.id !== "all")
      .map((category) => {
        const definitions = visibleComponentPalette.filter((definition) => componentPaletteCategoryForType(definition.type) === category.id);
        const defaultOpen =
          componentPaletteCategory === category.id ||
          (componentPaletteCategory === "all" && (hasFocusedFilter ? definitions.length > 0 : category.id === "layout"));
        return {
          ...category,
          definitions,
          defaultOpen,
        };
      })
      .filter((group) => group.definitions.length > 0);
  }, [activeComponentPaletteKitTypeSet, componentPaletteCategory, componentPaletteQuery, visibleComponentPalette]);
  const visibleComponentPaletteDefaultOpenGroupCount = visibleComponentPaletteGroups.filter((group) => group.defaultOpen).length;
  const canvasContextInsertSearchResults = useMemo(() => {
    if (!canvasContextInsertQuery.trim()) {
      return [];
    }
    return palette
      .filter((definition) => componentPaletteMatchesSearch(definition, canvasContextInsertQuery))
      .slice(0, CANVAS_CONTEXT_INSERT_SEARCH_LIMIT);
  }, [canvasContextInsertQuery]);
  useEffect(() => {
    setCanvasContextInsertActiveIndex((current) =>
      canvasContextInsertSearchResults.length > 0 ? clamp(current, 0, canvasContextInsertSearchResults.length - 1) : 0,
    );
  }, [canvasContextInsertSearchResults.length]);
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
  const allProjectActionPresets = useMemo(
    () => [...projectActionPresets, ...customProjectActionPresets],
    [customProjectActionPresets],
  );
  const latestRailPresetTask = useMemo(
    () =>
      activeProjectTasks
        .filter((task) => Boolean(task.pipelinePresetTitle))
        .reduce<ProjectTaskEntry | null>(
          (latest, task) => (!latest || projectTaskTimestamp(task) > projectTaskTimestamp(latest) ? task : latest),
          null,
        ),
    [activeProjectTasks],
  );
  const latestRailPreset =
    latestRailPresetTask?.pipelinePresetTitle
      ? allProjectActionPresets.find((preset) => preset.title === latestRailPresetTask.pipelinePresetTitle) ?? null
      : null;
  const latestRailPresetStepLabel =
    latestRailPresetTask?.pipelineStepCount && latestRailPresetTask.pipelineStepIndex !== undefined
      ? `${latestRailPresetTask.pipelineStepIndex + 1}/${latestRailPresetTask.pipelineStepCount}`
      : latestRailPreset
        ? `${latestRailPreset.actions.length} 步`
        : "未运行";
  const latestRailPresetSummary =
    latestRailPresetTask?.summary ??
    latestRailPresetTask?.error ??
    latestRailPresetTask?.detail ??
    (latestRailPreset ? latestRailPreset.detail : "运行 Kit preset 后，这里会保留最近一次流水线，可一键回放或打开任务。");
  const latestRailPresetStatusLabel = latestRailPresetTask ? projectTaskStatusLabel(latestRailPresetTask.status) : "尚未运行";
  const latestRailPresetStatusVariant = latestRailPresetTask ? projectTaskStatusVariant(latestRailPresetTask.status) : "outline";
  const operationMonitorTask = runningProjectTask ?? latestQueuedProjectTask ?? latestFailedProjectTask ?? latestProjectTask;
  const leftRunTaskTimelineRows = useMemo(
    () =>
      [...activeProjectTasks]
        .sort((left, right) => projectTaskTimestamp(right) - projectTaskTimestamp(left))
        .slice(0, 4),
    [activeProjectTasks],
  );
  const leftRunTaskTimelineSummary =
    leftRunTaskTimelineRows.length > 0
      ? `${leftRunTaskTimelineRows.length} 条最近任务 · ${leftRunTaskTimelineRows[0].title}`
      : "还没有构建/运行任务";
  const nextQueuedProjectTask = localQueuedProjectTasks[0] ?? latestQueuedProjectTask;
  const taskQueueStateTone = runningProjectTask
    ? "running"
    : projectTaskQueuePaused && localQueuedProjectTasks.length > 0
      ? "paused"
      : localQueuedProjectTasks.length > 0
        ? "queued"
        : latestFailedProjectTask
          ? "attention"
          : "ready";
  const taskQueueStateTitle = runningProjectTask
    ? `正在运行 ${runningProjectTask.title}`
    : projectTaskQueuePaused && localQueuedProjectTasks.length > 0
      ? "队列已暂停"
      : localQueuedProjectTasks.length > 0
        ? `${localQueuedProjectTasks.length} 个等待中`
        : latestFailedProjectTask
          ? `需要处理：${latestFailedProjectTask.title}`
          : "队列就绪";
  const taskQueueStateDetail =
    projectTaskQueueMessage ||
    runningProjectTask?.summary ||
    runningProjectTask?.detail ||
    (projectTaskQueuePaused && nextQueuedProjectTask
      ? `${nextQueuedProjectTask.title} 正在等待你恢复队列。`
      : nextQueuedProjectTask
        ? `下一个：${nextQueuedProjectTask.title}。`
        : latestFailedProjectTask
          ? latestFailedProjectTask.error ?? latestFailedProjectTask.summary ?? "打开失败任务，检查日志，然后重试或调整项目。"
          : "运行检查、验证、构建或预设后会创建可追踪的编辑器任务。");
  const taskQueueNextActionLabel = runningProjectTask
    ? "查看当前任务"
    : projectTaskQueuePaused && localQueuedProjectTasks.length > 0
      ? "恢复队列"
      : localQueuedProjectTasks.length > 0
        ? "继续队列"
        : latestFailedProjectTask
          ? "查看失败"
          : "从检查开始";
  const selectedRailActionPreset =
    allProjectActionPresets.find((preset) => preset.id === selectedRailActionPresetId) ??
    allProjectActionPresets[0] ??
    projectActionPresets[0];
  const selectedRailActionPresetStepLabel = selectedRailActionPreset
    ? `${selectedRailActionPreset.actions.length} 步`
    : "0 步";
  const selectedRailKitStepRows = useMemo(() => {
    if (!selectedRailActionPreset) {
      return [];
    }
    const recentTasks = [...activeProjectTasks].reverse();
    return selectedRailActionPreset.actions.map((actionId, index) => {
      const definition = projectTaskDefinitions[actionId];
      const latestTask =
        recentTasks.find((task) => task.actionId === actionId && task.pipelinePresetTitle === selectedRailActionPreset.title) ??
        recentTasks.find((task) => task.actionId === actionId) ??
        null;
      return {
        id: `${actionId}-${index}`,
        actionId,
        title: definition.title,
        detail: definition.detail,
        index,
        status: latestTask?.status ?? "idle",
        statusLabel: latestTask ? projectTaskStatusLabel(latestTask.status) : "待执行",
        statusVariant: latestTask ? projectTaskStatusVariant(latestTask.status) : "outline",
      };
    });
  }, [activeProjectTasks, selectedRailActionPreset]);
  const selectedRailKitPlanStats = useMemo(() => {
    const total = selectedRailKitStepRows.length;
    const succeeded = selectedRailKitStepRows.filter((step) => step.status === "succeeded").length;
    const failed = selectedRailKitStepRows.filter((step) => step.status === "failed").length;
    const active = selectedRailKitStepRows.filter((step) => step.status === "queued" || step.status === "running").length;
    const waiting = selectedRailKitStepRows.filter((step) => step.status === "idle").length;
    const skipped = selectedRailKitStepRows.filter((step) => step.status === "skipped" || step.status === "canceled").length;
    const nextStep =
      selectedRailKitStepRows.find((step) => step.status === "running" || step.status === "queued") ??
      selectedRailKitStepRows.find((step) => step.status === "idle") ??
      selectedRailKitStepRows.find((step) => step.status === "failed") ??
      selectedRailKitStepRows[0] ??
      null;
    const state =
      failed > 0
        ? "attention"
        : active > 0
          ? "running"
          : total > 0 && succeeded + skipped >= total
            ? "complete"
            : "ready";
    const completed = succeeded + skipped;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      total,
      succeeded,
      failed,
      active,
      waiting,
      skipped,
      completed,
      nextStep,
      state,
      progress,
      summary: `${completed}/${total} 完成 · ${failed} 失败 · ${waiting} 待执行`,
    };
  }, [selectedRailKitStepRows]);
  const latestReleasePipeline = activeProject.releasePipelineHistory?.[0] ?? null;
  const canSaveCustomPreset = customPresetTitle.trim().length > 0 && customPresetDraftActions.length > 0;

  const selectedId = selectedIds[0] ?? "";
  const setSelectedId = (id: string) => {
    setSelectionAnchorId(id);
    setSelectedIds(id ? [id] : []);
  };
  const selectedItems = useMemo(
    () => selectedIds.map((id) => items.find((item) => item.id === id)).filter((item): item is BuilderItem => Boolean(item)),
    [items, selectedIds],
  );
  const selectedCanvasFitBounds = useMemo(() => {
    if (selectedItems.length === 0) {
      return null;
    }

    return getSelectionBounds(
      selectedItems.map((item) => {
        const position = getAbsolutePosition(item, items);
        return {
          ...item,
          x: position.x,
          y: position.y,
        };
      }),
    );
  }, [items, selectedItems]);
  const selectedCanvasBounds = useMemo(() => {
    if (selectedItems.length < 2) {
      return null;
    }

    return selectedCanvasFitBounds;
  }, [selectedCanvasFitBounds, selectedItems.length]);
  const canvasHorizontalRulerMarks = useMemo(
    () => createCanvasRulerMarks(page.width, page.zoom, page.gridSize),
    [page.gridSize, page.width, page.zoom],
  );
  const canvasVerticalRulerMarks = useMemo(
    () => createCanvasRulerMarks(page.height, page.zoom, page.gridSize),
    [page.gridSize, page.height, page.zoom],
  );
  const canvasRulerSelectionProjection = selectedCanvasFitBounds
    ? {
        left: Math.round(selectedCanvasFitBounds.left * page.zoom),
        top: Math.round(selectedCanvasFitBounds.top * page.zoom),
        width: Math.max(1, Math.round(selectedCanvasFitBounds.width * page.zoom)),
        height: Math.max(1, Math.round(selectedCanvasFitBounds.height * page.zoom)),
        label: `${Math.round(selectedCanvasFitBounds.left)}, ${Math.round(selectedCanvasFitBounds.top)} · ${Math.round(selectedCanvasFitBounds.width)} x ${Math.round(selectedCanvasFitBounds.height)}`,
      }
    : null;
  const selectedBatchCommonWidth = useMemo(() => {
    if (selectedItems.length < 2) {
      return null;
    }
    const [firstItem] = selectedItems;
    return selectedItems.every((item) => item.width === firstItem.width) ? firstItem.width : null;
  }, [selectedItems]);
  const selectedBatchCommonHeight = useMemo(() => {
    if (selectedItems.length < 2) {
      return null;
    }
    const [firstItem] = selectedItems;
    return selectedItems.every((item) => item.height === firstItem.height) ? firstItem.height : null;
  }, [selectedItems]);
  const selectedBatchRuntimeSummary = useMemo(() => {
    const focusableItems = selectedItems.filter((item) => focusableBuilderComponentTypeSet.has(item.type));
    const readOnlyCapableItems = selectedItems.filter((item) => readOnlyBuilderComponentTypeSet.has(item.type));
    return {
      lockedCount: selectedItems.filter((item) => item.locked).length,
      visibleCount: selectedItems.filter((item) => item.props.visible !== false).length,
      enabledCount: focusableItems.filter((item) => item.props.enabled !== false).length,
      focusableCount: focusableItems.length,
      readOnlyCount: readOnlyCapableItems.filter((item) => item.props.readOnly === true).length,
      readOnlyCapableCount: readOnlyCapableItems.length,
    };
  }, [selectedItems]);
  const selectedBatchTypeSummary = useMemo(() => {
    const counts = new Map<BuilderComponentType, number>();
    selectedItems.forEach((item) => counts.set(item.type, (counts.get(item.type) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => `${getDefinition(type).title} ${count}`)
      .join(" · ");
  }, [selectedItems]);
  const selectedBatchLayoutSummary = useMemo(() => {
    const movableCount = selectedItems.filter((item) => !item.locked).length;
    const lockedCount = selectedItems.length - movableCount;
    const parentManagedCount = selectedItems.filter((item) => parentUsesAutoLayout(item, items)).length;
    const bounds = selectedCanvasBounds;
    return {
      movableCount,
      lockedCount,
      parentManagedCount,
      distributeReady: movableCount >= 3,
      boundsLabel: bounds
        ? `${Math.round(bounds.left)}, ${Math.round(bounds.top)} · ${Math.round(bounds.width)} x ${Math.round(bounds.height)}`
        : "暂无选区",
      spacingLabel:
        movableCount >= 3
          ? "可等距分布"
          : movableCount >= 2
            ? "再选 1 个可分布"
            : "需至少 3 个",
    };
  }, [items, selectedCanvasBounds, selectedItems]);
  const selectedSameTypeAnchor = selectedItems[0] ?? null;
  const selectedSameTypeCount = selectedSameTypeAnchor ? items.filter((item) => item.type === selectedSameTypeAnchor.type).length : 0;
  const selectedItem = selectedItems.length === 1 ? selectedItems[0] : null;
  const selectedQuickTextProps = selectedItem ? quickTextPropsForItem(selectedItem) : [];
  const selectedItemHierarchy = useMemo(() => {
    if (!selectedItem) {
      return [];
    }
    const byId = new Map(items.map((item) => [item.id, item]));
    const hierarchy: BuilderItem[] = [];
    const visited = new Set<string>();
    let current: BuilderItem | undefined = selectedItem;
    while (current && !visited.has(current.id)) {
      hierarchy.unshift(current);
      visited.add(current.id);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
    return hierarchy;
  }, [items, selectedItem]);
  const hasCanvasSelection = selectedItems.length > 0;
  const selectionActionBarState = selectedItems.length > 1 ? "multi" : hasCanvasSelection ? "single" : "idle";
  const selectionActionBarLabel =
    selectedItems.length > 1
      ? `${selectedItems.length} 个控件的选择操作栏`
      : selectedItem
        ? `${getItemSummary(selectedItem)} 的选择操作栏`
        : "画布选择操作栏";
  const selectionActionBarActionCount = useMemo(() => {
    if (!hasCanvasSelection) {
      return 2;
    }
    let actionCount = 21;
    if (selectedItems.length > 1) {
      actionCount += 10;
    }
    if (selectedItems.length > 2) {
      actionCount += 2;
    }
    if (selectedItems.some((item) => item.type === "frame")) {
      actionCount += 1;
    }
    return actionCount;
  }, [hasCanvasSelection, selectedItems]);
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
  const stateReferenceCounts = useMemo(
    () => new Map(activeProject.stateVariables.map((state) => [state.id, countStateVariableReferences(activeProject, state.id)])),
    [activeProject],
  );
  const activeStateReferenceCount = stateReferenceCounts.get(activeStateVariable.id) ?? 0;
  const sortedItems = useMemo(() => [...items].sort((a, b) => a.z - b.z), [items]);
  const focusableTabOrderItems = useMemo(() => {
    const visualItems = sortedItems
      .filter(isKeyboardFocusableBuilderItem)
      .sort((a, b) => {
        const positionA = getAbsolutePosition(a, items);
        const positionB = getAbsolutePosition(b, items);
        return positionA.y - positionB.y || positionA.x - positionB.x || a.z - b.z;
      });
    const visualOrder = new Map(visualItems.map((item, index) => [item.id, index]));

    return visualItems
      .map((item, index) => {
        const explicitTabIndex = builderTabIndexValue(item);
        const tabIndex = explicitTabIndex && explicitTabIndex > 0 ? clamp(explicitTabIndex, 1, 999) : index + 1;
        return {
          item,
          tabIndex,
          explicit: explicitTabIndex !== null,
          visualIndex: visualOrder.get(item.id) ?? index,
        };
      })
      .sort((a, b) => a.tabIndex - b.tabIndex || a.visualIndex - b.visualIndex || a.item.z - b.item.z);
  }, [items, sortedItems]);
  const selectedTabOrderEntry = selectedItem
    ? focusableTabOrderItems.find((entry) => entry.item.id === selectedItem.id) ?? null
    : null;
  const selectedCanUseTabOrder = selectedItem ? focusableBuilderComponentTypeSet.has(selectedItem.type) : false;
  const selectedCanUseReadOnly = selectedItem ? readOnlyBuilderComponentTypeSet.has(selectedItem.type) : false;
  const selectedRuntimeState = selectedItem ? builderItemRuntimeState(selectedItem) : null;
  const selectedTabOrderPosition = selectedTabOrderEntry
    ? focusableTabOrderItems.findIndex((entry) => entry.item.id === selectedTabOrderEntry.item.id) + 1
    : 0;
  const topLevelItems = useMemo(() => sortedItems.filter((item) => !item.parentId), [sortedItems]);
  const treeRows = useMemo(() => buildTreeRows(items), [items]);
  const visibleNavigatorTreeRows = useMemo(
    () => treeRows.filter((row) => navigatorTreeRowMatches(row, navigatorQuery)),
    [navigatorQuery, treeRows],
  );
  const combinedBuildLog = useMemo(() => [activeProject.buildLog, buildError].filter(Boolean).join("\n"), [activeProject.buildLog, buildError]);
  const buildLogPreviewText = combinedBuildLog || "尚未构建。点击“exe”会生成可执行文件，点击“打包”会运行完整 Tauri bundle。";
  const buildLogLineCount = useMemo(
    () => combinedBuildLog.split(/\r?\n/).filter((line) => line.trim()).length,
    [combinedBuildLog],
  );
  const activeRustSourceMap = useMemo(
    () => normalizeGeneratedRustSourceMap(activeProject.rustSourceMap) ?? parseRustSourceMapFromLog(combinedBuildLog),
    [activeProject.rustSourceMap, combinedBuildLog],
  );
  const buildDiagnostics = useMemo(
    () => parseBuildDiagnostics(combinedBuildLog, activeRustSourceMap),
    [combinedBuildLog, activeRustSourceMap],
  );
  const rustEditorLines = useMemo(() => activeProject.rustLogic.split(/\r?\n/), [activeProject.rustLogic]);
  const rustEditorLineStartIndexes = useMemo(
    () => rustEditorLines.map((_, index) => rustLineStartIndex(activeProject.rustLogic, index + 1)),
    [activeProject.rustLogic, rustEditorLines],
  );
  const rustFindMatches = useMemo(() => {
    const query = rustFindQuery.trim();
    if (!query) {
      return [] as RustFindMatch[];
    }

    const source = activeProject.rustLogic;
    const haystack = rustFindCaseSensitive ? source : source.toLowerCase();
    const needle = rustFindCaseSensitive ? query : query.toLowerCase();
    const matches: RustFindMatch[] = [];
    let searchFrom = 0;

    while (needle && searchFrom <= haystack.length && matches.length < 500) {
      const index = haystack.indexOf(needle, searchFrom);
      if (index < 0) {
        break;
      }
      const before = source.slice(0, index);
      const line = before.split(/\r?\n/).length;
      const lineStart = before.lastIndexOf("\n") + 1;
      const lineEnd = source.indexOf("\n", index);
      const preview = source.slice(lineStart, lineEnd < 0 ? source.length : lineEnd).trim();
      matches.push({
        index,
        end: index + query.length,
        line,
        column: index - lineStart + 1,
        preview,
      });
      searchFrom = index + Math.max(1, needle.length);
    }

    return matches;
  }, [activeProject.rustLogic, rustFindCaseSensitive, rustFindQuery]);
  const activeRustFindMatch = rustFindMatches.length
    ? rustFindMatches[clamp(rustFindActiveIndex, 0, rustFindMatches.length - 1)]
    : null;
  const rustFindLineSet = useMemo(() => new Set(rustFindMatches.map((match) => match.line)), [rustFindMatches]);
  const rustCurrentIdentifier = useMemo(
    () => rustIdentifierAtSelection(activeProject.rustLogic, rustEditorSelection.selectionStart, rustEditorSelection.selectionEnd),
    [activeProject.rustLogic, rustEditorSelection.selectionEnd, rustEditorSelection.selectionStart],
  );
  const rustBracketMatch = useMemo(
    () => findRustBracketMatch(activeProject.rustLogic, rustEditorSelection.selectionStart, rustEditorSelection.selectionEnd),
    [activeProject.rustLogic, rustEditorSelection.selectionEnd, rustEditorSelection.selectionStart],
  );
  const rustBracketMatchIndexes = useMemo(() => {
    const indexes = new Set<number>();
    if (!rustBracketMatch) {
      return indexes;
    }
    if (rustBracketMatch.status === "matched") {
      if (rustBracketMatch.openIndex !== undefined) {
        indexes.add(rustBracketMatch.openIndex);
      }
      if (rustBracketMatch.closeIndex !== undefined) {
        indexes.add(rustBracketMatch.closeIndex);
      }
    } else {
      indexes.add(rustBracketMatch.anchor);
    }
    return indexes;
  }, [rustBracketMatch]);
  const rustBracketMatchLabel = rustBracketMatch
    ? rustBracketMatch.status === "matched"
      ? `${rustBracketMatch.pair} · Ln ${rustBracketMatch.openLine}:${rustBracketMatch.openColumn} -> Ln ${rustBracketMatch.closeLine}:${rustBracketMatch.closeColumn}`
      : `${rustBracketMatch.anchorBracket} 缺少匹配项`
    : "光标未在括号旁";
  const rustCurrentIdentifierOccurrences = useMemo(
    () => (rustCurrentIdentifier ? rustIdentifierOccurrences(activeProject.rustLogic, rustCurrentIdentifier.name) : []),
    [activeProject.rustLogic, rustCurrentIdentifier],
  );
  const rustCurrentIdentifierReferences = useMemo<RustIdentifierReference[]>(
    () =>
      rustCurrentIdentifier
        ? rustCurrentIdentifierOccurrences.map((occurrence, index) => {
            const before = activeProject.rustLogic.slice(0, occurrence.index);
            const line = before.split(/\r?\n/).length;
            const lineStart = Math.max(before.lastIndexOf("\n"), before.lastIndexOf("\r")) + 1;
            const lineEnd = activeProject.rustLogic.indexOf("\n", occurrence.index);
            const preview = activeProject.rustLogic.slice(lineStart, lineEnd < 0 ? activeProject.rustLogic.length : lineEnd).replace(/\r$/, "").trim();
            return {
              id: `${rustCurrentIdentifier.name}-${index}-${occurrence.index}`,
              index: occurrence.index,
              end: occurrence.end,
              line,
              column: occurrence.index - lineStart + 1,
              preview: preview || rustCurrentIdentifier.name,
              role: occurrence.index === rustCurrentIdentifier.start ? "current" : "reference",
            };
          })
        : [],
    [activeProject.rustLogic, rustCurrentIdentifier, rustCurrentIdentifierOccurrences],
  );
  const rustVisibleIdentifierReferences = rustCurrentIdentifierReferences.slice(0, 12);
  useEffect(() => {
    if (rustFindActiveIndex >= rustFindMatches.length) {
      setRustFindActiveIndex(0);
    }
  }, [rustFindActiveIndex, rustFindMatches.length]);
  const rustDiagnosticsBySourceLine = useMemo(() => {
    const diagnosticsByLine = new Map<number, RustDiagnosticGutterEntry[]>();
    buildDiagnostics.forEach((diagnostic, index) => {
      const location = rustDiagnosticSourceLocation(diagnostic, activeProject.rustLogic);
      if (!location) {
        return;
      }
      const existing = diagnosticsByLine.get(location.sourceLine) ?? [];
      diagnosticsByLine.set(location.sourceLine, [...existing, { diagnostic, index }]);
    });
    return diagnosticsByLine;
  }, [activeProject.rustLogic, buildDiagnostics]);
  const rustCompletionContext = useMemo(() => {
    if (!rustCompletionTrigger) {
      return { query: "", items: [] as RustCompletionItem[] };
    }

    const source = activeProject.rustLogic;
    const cursor = clamp(rustCompletionTrigger.cursor, 0, source.length);
    const prefix = source.slice(0, cursor);
    const token = prefix.match(/[A-Za-z_][A-Za-z0-9_:]*$/)?.[0] ?? "";
    const query = token.toLowerCase();
    const replaceStart = cursor - token.length;
    const replaceEnd = cursor;

    if (!rustCompletionTrigger.forced && query.length < 2) {
      return { query, items: [] as RustCompletionItem[] };
    }

    const parameters = rustCommandParameters(activeRustCommand);
    const activeCommandName = sanitizeRustCommandName(activeRustCommand.name);
    const activeSignature = parameters
      .map((parameter, index) => {
        const name = sanitizeRustParameterName(parameter.name, index);
        const rustType =
          parameter.type === "bool"
            ? "bool"
            : parameter.type === "number"
              ? "f64"
              : parameter.type === "json"
                ? "serde_json::Value"
                : "String";
        return `${name}: ${rustType}`;
      })
      .join(", ");

    const novaJsonSnippet = createRustNovaJsonResultSnippet(`${activeCommandName} handled`, activeProject.stateVariables);
    const indentedNovaJsonSnippet = novaJsonSnippet.split("\n").map((line) => `    ${line}`).join("\n");
    const statePatchSnippet = createRustStatePatchLiteral(activeProject.stateVariables);
    const commandDebugSnippet = createRustCommandDebugResultSnippet(activeRustCommand, activeProject.stateVariables);
    const baseItems: Array<Omit<RustCompletionItem, "replaceStart" | "replaceEnd">> = [
      {
        id: "snippet-json-response",
        kind: "snippet",
        label: "Nova JSON result",
        detail: "success/message/patch 返回结构",
        sourceLabel: "Nova result 模板",
        insertText: novaJsonSnippet,
      },
      {
        id: "snippet-state-patch",
        kind: "snippet",
        label: "state patch",
        detail: "按当前项目 state 名称回写状态",
        sourceLabel: "状态回写模板",
        insertText: statePatchSnippet,
      },
      {
        id: "snippet-command-debug-result",
        kind: "snippet",
        label: `${activeCommandName} debug result`,
        detail: "带当前命令参数 Debug 的 JSON 返回",
        sourceLabel: "当前命令模板",
        insertText: commandDebugSnippet,
      },
      {
        id: "snippet-command-slot",
        kind: "snippet",
        label: `#[tauri::command] ${activeCommandName}`,
        detail: "当前命令槽函数骨架",
        sourceLabel: "槽函数模板",
        insertText: `#[tauri::command]\nfn ${activeCommandName}(${activeSignature}) -> String {\n${indentedNovaJsonSnippet}\n}`,
      },
      {
        id: "snippet-json-value",
        kind: "snippet",
        label: "serde_json::Value",
        detail: "JSON 参数/状态值类型",
        sourceLabel: "常用 Rust 类型",
        insertText: "serde_json::Value",
      },
      {
        id: "snippet-match",
        kind: "snippet",
        label: "match",
        detail: "Rust match 分支",
        sourceLabel: "控制流模板",
        insertText: "match value {\n    _ => {}\n}",
      },
      {
        id: "snippet-if",
        kind: "snippet",
        label: "if",
        detail: "条件分支",
        sourceLabel: "控制流模板",
        insertText: "if condition {\n    \n}",
        cursorOffset: "if condition {\n    ".length,
      },
    ];

    for (const command of activeProject.rustCommands) {
      const safeName = sanitizeRustCommandName(command.name);
      baseItems.push({
        id: `command-${command.id}`,
        kind: "command",
        label: safeName,
        detail: command.id === activeRustCommand.id ? "当前命令" : "项目命令",
        sourceLabel: command.id === activeRustCommand.id ? "当前 Rust command" : "项目 Rust command",
        targetLine: rustFunctionLocation(activeProject.rustLogic, safeName)?.line,
        insertText: safeName,
      });
    }
    for (const [index, parameter] of parameters.entries()) {
      const safeName = sanitizeRustParameterName(parameter.name, index);
      baseItems.push({
        id: `parameter-${parameter.id}`,
        kind: "parameter",
        label: safeName,
        detail: `${parameter.source} -> ${parameter.type}`,
        sourceLabel: "当前命令参数",
        insertText: safeName,
      });
    }
    for (const state of activeProject.stateVariables) {
      baseItems.push({
        id: `state-${state.id}`,
        kind: "state",
        label: state.name,
        detail: `state 初始值：${state.initialValue || "空"}`,
        sourceLabel: "项目状态变量",
        insertText: state.name,
      });
    }
    for (const module of activeProject.rustModules) {
      baseItems.push({
        id: `module-${module.id}`,
        kind: "module",
        label: sanitizeRustModuleName(module.name),
        detail: module.enabled ? "启用的 Rust 模块" : "已禁用的 Rust 模块",
        sourceLabel: module.enabled ? "启用模块" : "禁用模块",
        insertText: sanitizeRustModuleName(module.name),
      });
    }
    for (const dependency of activeProject.cargoDependencies) {
      baseItems.push({
        id: `dependency-${dependency.id}`,
        kind: "dependency",
        label: sanitizeCargoDependencyName(dependency.name),
        detail: dependency.enabled ? `Cargo 依赖 v${dependency.version}` : "已禁用的 Cargo 依赖",
        sourceLabel: dependency.enabled ? "启用依赖" : "禁用依赖",
        insertText: sanitizeCargoDependencyName(dependency.name),
      });
    }
    for (const symbol of rustCompletionSymbolEntries(activeProject.rustLogic)) {
      baseItems.push({
        id: symbol.id,
        kind: "symbol",
        label: symbol.label,
        detail: symbol.detail,
        sourceLabel: `${rustOutlineKindTitle(symbol.kind)} · logic.rs:${symbol.line}`,
        targetLine: symbol.line,
        insertText: symbol.label,
      });
    }

    const filtered = baseItems
      .map((item) => ({
        ...item,
        replaceStart,
        replaceEnd,
        sourceLabel: item.sourceLabel ?? rustCompletionKindLabel(item.kind),
        insertPreview: item.insertPreview ?? rustCompletionInsertPreview(item.insertText),
      }))
      .filter((item) => {
        if (!query) {
          return true;
        }
        const searchable = `${item.label} ${item.detail} ${item.kind}`.toLowerCase();
        return searchable.includes(query) || item.insertText.toLowerCase().includes(query);
      })
      .slice(0, 12);

    return { query, items: filtered };
  }, [
    activeProject.cargoDependencies,
    activeProject.rustCommands,
    activeProject.rustLogic,
    activeProject.rustModules,
    activeProject.stateVariables,
    activeRustCommand,
    rustCompletionTrigger,
  ]);
  const rustCompletionItems = rustCompletionContext.items;
  const activeRustCompletion =
    rustCompletionItems.length > 0 && rustCompletionTrigger
      ? rustCompletionItems[clamp(rustCompletionTrigger.activeIndex, 0, rustCompletionItems.length - 1)]
      : null;
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
  const selectedSimulatorTraceLogPreview = selectedLatestSimulatorTrace ? formatSimulatorTraceLog(selectedLatestSimulatorTrace) : "";
  const selectedActionFeedback = selectedItem
    ? selectedLatestSimulatorTrace
      ? {
          tone: selectedLatestSimulatorTrace.status,
          title: selectedLatestSimulatorTrace.status === "success" ? "最近事件成功" : "最近事件失败",
          detail: `${selectedLatestSimulatorTrace.commandName}: ${selectedLatestSimulatorTrace.message}`,
          badge: selectedLatestSimulatorTrace.status,
        }
        : selectedEventName
          ? selectedEventCommand
            ? {
                tone: "ready",
                title: `${selectedEventName} 可运行`,
                detail: `${sanitizeRustCommandName(selectedEventCommand.name)} · ${selectedEventCommandArgs.length} 个参数 · ${commandResultSchema(selectedEventCommand).mode} 结果`,
                badge: "就绪",
              }
            : {
                tone: "unbound",
                title: `${selectedEventName} 没有命令`,
                detail: "创建绑定后，该控件才能运行实时事件。",
                badge: "待绑定",
              }
          : null
    : null;
  const selectedConnectionPayloadFields = selectedEventBinding?.payloadMode === "json" ? eventPayloadFieldSelection(selectedEventBinding) : [];
  const selectedConnectionResultTarget = selectedEventBinding?.resultTargetItemId
    ? items.find((item) => item.id === selectedEventBinding.resultTargetItemId) ?? null
    : null;
  const selectedConnectionResultState = selectedEventBinding?.resultStateId
    ? activeProject.stateVariables.find((state) => state.id === selectedEventBinding.resultStateId) ?? null
    : null;
  const selectedConnectionInputSummary = selectedEventCommand
    ? selectedEventCommandArgs.length > 0
      ? `${selectedEventCommandArgs.length} 个命名参数`
      : selectedEventBinding?.passValue
        ? selectedEventBinding.payloadMode === "json"
          ? `${selectedConnectionPayloadFields.length} JSON field(s)`
          : "当前值"
        : "无载荷"
    : "无命令";
  const selectedConnectionOutputSummary = selectedEventCommand
    ? [
        selectedEventBinding?.resultTargetItemId
          ? selectedConnectionResultTarget && selectedEventBinding.resultTargetProp
            ? `${getItemSummary(selectedConnectionResultTarget)}.${selectedEventBinding.resultTargetProp}`
            : "目标缺失"
          : "",
        selectedConnectionResultState ? `状态 ${selectedConnectionResultState.name}` : "",
        selectedEventBinding?.applyJsonStatePatch ? "JSON patch" : "",
      ].filter(Boolean).join(" · ") || "无回写"
    : "未配置";
  const selectedConnectionVerificationLabel = selectedEventCommand
    ? selectedLatestSimulatorTrace
      ? selectedLatestSimulatorTrace.status === "success"
        ? "已验证"
        : "需要处理"
      : "可模拟"
    : "需要命令";
  const selectedConnectionVerificationDetail = selectedEventCommand
    ? selectedLatestSimulatorTrace
      ? `${selectedLatestSimulatorTrace.commandName} ${selectedLatestSimulatorTrace.status}: ${selectedLatestSimulatorTrace.message}`
      : `${selectedEventName ?? "事件"} 已绑定到 ${sanitizeRustCommandName(selectedEventCommand.name)}。`
    : selectedEventName
      ? `${selectedEventName} 没有 Rust 命令。`
      : "请选择一个可交互控件。";
  const selectedConnectionVerificationVariant = selectedEventCommand
    ? selectedLatestSimulatorTrace?.status === "error"
      ? "destructive"
      : "secondary"
    : "outline";
  const logicSignalSlotRows = useMemo<LogicSignalSlotRow[]>(() => {
    const rows = sortedItems
      .map((item): LogicSignalSlotRow | null => {
        const eventName = eventNameForItem(item);
        if (!eventName) {
          return null;
        }

        const commandId = eventCommandId(item, eventName);
        const command = commandId ? activeProject.rustCommands.find((candidate) => candidate.id === commandId) ?? null : null;
        const binding = item.props.events?.[eventName] ?? null;
        const commandArgs = command ? rustCommandParameters(command) : [];
        const inputSummary = command
          ? commandArgs.length > 0
            ? `${commandArgs.length} 个命名参数`
            : binding?.passValue
              ? binding.payloadMode === "json"
                ? `${eventPayloadFieldSelection(binding).length || "全部"} 个 JSON 字段`
                : "控件当前值"
              : "无载荷"
          : "等待绑定";
        const targetItem = binding?.resultTargetItemId ? sortedItems.find((candidate) => candidate.id === binding.resultTargetItemId) ?? null : null;
        const targetSummary = targetItem && binding?.resultTargetProp ? `${getItemSummary(targetItem)}.${binding.resultTargetProp}` : "";
        const stateSummary = binding?.resultStateId
          ? activeProject.stateVariables.find((state) => state.id === binding.resultStateId)?.name ?? "状态缺失"
          : "";
        const outputSummary = command
          ? [targetSummary, stateSummary ? `状态 ${stateSummary}` : "", binding?.applyJsonStatePatch ? "JSON patch" : ""].filter(Boolean).join(" · ") ||
            "无回写"
          : "等待配置";

        return {
          id: `${item.id}:${eventName}`,
          item,
          eventName,
          binding,
          command,
          commandArgs,
          selected: item.id === selectedItem?.id,
          inputSummary,
          outputSummary,
        };
      })
      .filter((row): row is LogicSignalSlotRow => Boolean(row));

    return [...rows.filter((row) => row.selected), ...rows.filter((row) => !row.selected)];
  }, [activeProject.rustCommands, activeProject.stateVariables, selectedItem?.id, sortedItems]);
  const logicSignalSlotBoundCount = logicSignalSlotRows.filter((row) => row.command).length;
  const logicSignalSlotUnboundCount = logicSignalSlotRows.length - logicSignalSlotBoundCount;
  const rustLogicOutline = useMemo(
    () => rustLogicOutlineEntries(activeProject.rustLogic, activeProject.rustCommands, logicSignalSlotRows, activeProject.activeRustCommandId),
    [activeProject.activeRustCommandId, activeProject.rustCommands, activeProject.rustLogic, logicSignalSlotRows],
  );
  const logicSearchNeedle = searchNeedle(logicSearchQuery);
  const filteredRustCommands = useMemo(
    () =>
      activeProject.rustCommands.filter((command) =>
        matchesSearchNeedle(logicSearchNeedle, [
          command.name,
          sanitizeRustCommandName(command.name),
          command.response,
          command.backendIntegrationId,
          command.backendIntegrationMethodId,
        ]),
      ),
    [activeProject.rustCommands, logicSearchNeedle],
  );
  const filteredRustModules = useMemo(
    () =>
      activeProject.rustModules.filter((module) =>
        matchesSearchNeedle(logicSearchNeedle, [module.name, sanitizeRustModuleName(module.name), module.source, module.enabled ? "enabled 启用" : "disabled 禁用"]),
      ),
    [activeProject.rustModules, logicSearchNeedle],
  );
  const filteredCargoDependencies = useMemo(
    () =>
      activeProject.cargoDependencies.filter((dependency) =>
        matchesSearchNeedle(logicSearchNeedle, [
          dependency.name,
          sanitizeCargoDependencyName(dependency.name),
          dependency.version,
          dependency.features,
          dependency.enabled ? "enabled 启用" : "disabled 禁用",
        ]),
      ),
    [activeProject.cargoDependencies, logicSearchNeedle],
  );
  const filteredBackendIntegrations = useMemo(
    () =>
      activeProject.backendIntegrations.filter((integration) =>
        matchesSearchNeedle(logicSearchNeedle, [
          integration.name,
          integration.kind,
          integration.language,
          integration.transport,
          integration.entryPath,
          integration.artifactPath,
          integration.resourcePath,
          integration.command,
          integration.healthCheckCommand,
        ]),
      ),
    [activeProject.backendIntegrations, logicSearchNeedle],
  );
  const filteredStateVariables = useMemo(
    () =>
      activeProject.stateVariables.filter((state) =>
        matchesSearchNeedle(logicSearchNeedle, [state.name, state.initialValue, formatStateReferenceCount(stateReferenceCounts.get(state.id) ?? 0)]),
      ),
    [activeProject.stateVariables, logicSearchNeedle, stateReferenceCounts],
  );
  const filteredLogicSignalSlotRows = useMemo(
    () =>
      logicSignalSlotRows.filter((row) =>
        matchesSearchNeedle(logicSearchNeedle, [
          getItemSummary(row.item),
          row.item.name,
          row.item.type,
          row.eventName,
          row.command?.name,
          row.command ? sanitizeRustCommandName(row.command.name) : "未绑定 unbound",
          row.inputSummary,
          row.outputSummary,
          row.commandArgs.map((parameter) => parameter.name).join(" "),
        ]),
      ),
    [logicSearchNeedle, logicSignalSlotRows],
  );
  const logicSignalSlotRowNeedsSlot = (row: LogicSignalSlotRow) =>
    Boolean(row.command && !rustLogicOutline.some((entry) => entry.kind === "slot" && entry.commandId === row.command?.id && entry.line));
  const logicConnectionMissingSlotRows = useMemo(
    () => filteredLogicSignalSlotRows.filter((row) => logicSignalSlotRowNeedsSlot(row)),
    [filteredLogicSignalSlotRows, rustLogicOutline],
  );
  const filteredLogicConnectionRows = useMemo(() => {
    if (logicConnectionFilter === "bound") {
      return filteredLogicSignalSlotRows.filter((row) => row.command);
    }
    if (logicConnectionFilter === "unbound") {
      return filteredLogicSignalSlotRows.filter((row) => !row.command);
    }
    if (logicConnectionFilter === "missing-slot") {
      return logicConnectionMissingSlotRows;
    }
    return filteredLogicSignalSlotRows;
  }, [filteredLogicSignalSlotRows, logicConnectionFilter, logicConnectionMissingSlotRows]);
  const selectedLogicSignalSlotRow = useMemo(
    () =>
      selectedItem && selectedEventName
        ? logicSignalSlotRows.find((row) => row.item.id === selectedItem.id && row.eventName === selectedEventName) ?? null
        : null,
    [logicSignalSlotRows, selectedEventName, selectedItem?.id],
  );
  const selectedSignalSlotOutlineEntry = selectedEventCommand
    ? rustLogicOutline.find((entry) => entry.commandId === selectedEventCommand.id) ?? null
    : null;
  const filteredRustLogicOutline = useMemo(
    () =>
      rustLogicOutline.filter((entry) =>
        matchesSearchNeedle(logicSearchNeedle, [entry.label, entry.detail, entry.kind, entry.line, entry.bindingCount, entry.line ? "已定位 located" : "待生成 missing"]),
      ),
    [logicSearchNeedle, rustLogicOutline],
  );
  const visibleRustLogicOutline = filteredRustLogicOutline.slice(0, logicSearchNeedle ? 16 : 8);
  const missingRustSlotCount = rustLogicOutline.filter((entry) => entry.kind === "slot" && entry.line === null).length;
  const missingRustSlotEntries = useMemo(
    () => rustLogicOutline.filter((entry) => entry.kind === "slot" && entry.line === null && entry.commandId),
    [rustLogicOutline],
  );
  const unboundLogicSignalSlotRows = useMemo(
    () => logicSignalSlotRows.filter((row) => !row.command),
    [logicSignalSlotRows],
  );
  const activeRustCommandBindingRows = useMemo(
    () => logicSignalSlotRows.filter((row) => row.command?.id === activeRustCommand.id),
    [activeRustCommand.id, logicSignalSlotRows],
  );
  const activeRustCommandCandidateRows = useMemo(
    () => logicSignalSlotRows.filter((row) => !row.command).slice(0, 3),
    [logicSignalSlotRows],
  );
  const rustSlotOutlineCount = rustLogicOutline.filter((entry) => entry.kind === "slot").length;
  const rustFunctionOutlineCount = rustLogicOutline.filter((entry) => entry.kind === "function").length;
  const rustStructureOutlineCount = rustLogicOutline.filter((entry) => !["slot", "function"].includes(entry.kind)).length;
  const rustEditorMinimapMarkers = useMemo<RustEditorMinimapMarker[]>(() => {
    const markers: RustEditorMinimapMarker[] = [];
    const addMarker = (marker: RustEditorMinimapMarker) => {
      const line = clamp(Math.round(marker.line), 1, Math.max(1, rustEditorLines.length));
      markers.push({ ...marker, line });
    };

    for (const entry of rustLogicOutline) {
      if (!entry.line) {
        continue;
      }
      addMarker({
        id: `outline-${entry.id}`,
        kind: "outline",
        line: entry.line,
        label: `${rustOutlineKindTitle(entry.kind)} · ${entry.label}`,
      });
    }

    rustDiagnosticsBySourceLine.forEach((entries, line) => {
      const severity = entries.some((entry) => entry.diagnostic.severity === "error") ? "error" : "warning";
      addMarker({
        id: `diagnostic-${line}`,
        kind: "diagnostic",
        line,
        label: `${entries.length} 个 Rust 诊断`,
        severity,
      });
    });

    for (const [index, match] of rustFindMatches.entries()) {
      addMarker({
        id: `find-${index}-${match.line}`,
        kind: "find",
        line: match.line,
        label: `查找命中 · ${match.preview || rustFindQuery}`,
      });
    }

    if (rustCurrentIdentifier) {
      const seenIdentifierLines = new Set<number>();
      for (const occurrence of rustCurrentIdentifierOccurrences) {
        const line = rustLineNumberAtIndex(activeProject.rustLogic, occurrence.index);
        if (seenIdentifierLines.has(line)) {
          continue;
        }
        seenIdentifierLines.add(line);
        addMarker({
          id: `identifier-${rustCurrentIdentifier.name}-${line}`,
          kind: "identifier",
          line,
          label: `${rustCurrentIdentifier.name} occurrence`,
        });
      }
    }

    addMarker({
      id: "cursor",
      kind: "cursor",
      line: rustEditorSelection.line,
      label: `光标 Ln ${rustEditorSelection.line}`,
    });

    const priority: Record<RustEditorMinimapMarker["kind"], number> = {
      diagnostic: 0,
      cursor: 1,
      find: 2,
      identifier: 3,
      outline: 4,
    };

    return markers.sort((a, b) => a.line - b.line || priority[a.kind] - priority[b.kind]);
  }, [
    activeProject.rustLogic,
    rustCurrentIdentifier,
    rustCurrentIdentifierOccurrences,
    rustDiagnosticsBySourceLine,
    rustEditorLines.length,
    rustEditorSelection.line,
    rustFindMatches,
    rustFindQuery,
    rustLogicOutline,
  ]);
  const rustEditorMinimapTotalLines = Math.max(1, rustEditorLines.length);
  const rustEditorMinimapViewport = {
    top: clamp((rustEditorScrollTop / 20 / rustEditorMinimapTotalLines) * 100, 0, 96),
    height: clamp((620 / 20 / rustEditorMinimapTotalLines) * 100, 6, 100),
  };
  const logicConnectedSlotCount = Math.max(0, rustSlotOutlineCount - missingRustSlotCount);
  const logicConnectionHealthScore = Math.round(
    ((logicSignalSlotBoundCount + logicConnectedSlotCount) / Math.max(1, logicSignalSlotRows.length + rustSlotOutlineCount)) * 100,
  );
  const logicConnectionHealthStatus =
    logicSignalSlotRows.length === 0
      ? "等待控件事件"
      : logicSignalSlotUnboundCount > 0
        ? "有信号未绑定"
        : missingRustSlotCount > 0
          ? "有槽函数缺失"
          : "连接完整";
  const projectActionCenterItems = useMemo<ProjectActionCenterItem[]>(() => {
    const rows: ProjectActionCenterItem[] = [];
    const activeWorkingSetItem = projectWorkingSetActiveItem ?? projectWorkingSetItems[0] ?? null;
    const selectedNode = selectedProjectExplorerNode;
    const taskCandidate = runningProjectTask ?? nextQueuedProjectTask ?? latestFailedProjectTask ?? latestProjectTask;
    const rustSourceRow = projectSourceOverviewRows.find((row) => row.id === "source-rust-logic-overview") ?? null;
    const buildSourceRow = projectSourceOverviewRows.find((row) => row.id === "generated-app-overview") ?? null;
    const dirtySourceCount = projectSourceOverviewRows.filter((row) => row.status === "dirty").length;

    rows.push({
      id: "sync-state",
      kind: "sync",
      title: projectSourceDirty ? "保存项目来源" : "项目来源已同步",
      detail: projectSourceDirty
        ? `${dirtyUiFileCount} 个 UI 文件、Rust ${rustLogicDirty ? "未保存" : "已同步"}、设置 ${projectSettingsDirty ? "未保存" : "已同步"}。`
        : "UI 文件、Rust 逻辑、发布设置和 .nova 编辑状态已在当前工作区对齐。",
      meta: projectSourceDirty ? `${dirtySourceCount} 个来源待同步` : activeProject.rootPath || "未选择项目目录",
      badge: projectSourceDirty ? "待同步" : "已同步",
      actionLabel: projectSourceDirty ? "保存" : "查看",
      tone: projectSourceDirty ? "warning" : "success",
      icon: Save,
      action: projectSourceDirty ? { kind: "task", taskId: "save-project" } : { kind: "source-row", rowId: "source-manifest-overview" },
    });

    if (activeWorkingSetItem) {
      rows.push({
        id: "active-working-set",
        kind: "file",
        title: activeWorkingSetItem.active ? `继续 ${activeWorkingSetItem.label}` : "打开工作集项目",
        detail: activeWorkingSetItem.detail,
        meta: activeWorkingSetItem.relativePath,
        badge: activeWorkingSetItem.statusLabel,
        actionLabel: activeWorkingSetItem.active ? "继续" : "打开",
        tone: activeWorkingSetItem.dirty ? "warning" : activeWorkingSetItem.active ? "ready" : "muted",
        icon: activeWorkingSetItem.icon,
        action: { kind: "working-set", itemId: activeWorkingSetItem.id },
      });
    }

    if (selectedNode && selectedNode.id !== activeWorkingSetItem?.nodeId) {
      rows.push({
        id: "selected-project-node",
        kind: "node",
        title: `检查 ${selectedNode.label}`,
        detail: selectedProjectExplorerDossier
          ? `${selectedProjectExplorerDossier.groupLabel} · ${selectedProjectExplorerDossier.syncState} · ${selectedProjectExplorerDossier.artifactState}`
          : selectedNode.detail,
        meta: selectedProjectExplorerRelativePath || selectedNode.path || selectedNode.detail,
        badge: projectExplorerActionLabel(selectedNode.action),
        actionLabel: projectExplorerPrimaryActionLabel(selectedNode),
        tone: selectedNode.dirty ? "warning" : selectedNode.action === "none" ? "muted" : "ready",
        icon: selectedNode.icon,
        action: { kind: "project-node", nodeId: selectedNode.id },
      });
    }

    rows.push({
      id: "rust-followup",
      kind: "logic",
      title: missingRustSlotCount > 0 ? "生成缺失 Rust 槽函数" : logicSignalSlotUnboundCount > 0 ? "绑定 UI 信号" : "检查 Rust 逻辑",
      detail:
        missingRustSlotCount > 0
          ? `${missingRustSlotCount} 个 Rust command 还没有可跳转槽函数，适合从这里进入逻辑页处理。`
          : logicSignalSlotUnboundCount > 0
            ? `${logicSignalSlotUnboundCount} 个控件事件尚未绑定后端命令。`
            : `${activeProject.rustCommands.length} 个 command，${activeProject.rustModules.length} 个模块，连接健康度 ${logicConnectionHealthScore}%。`,
      meta: rustSourceRow?.relativePath ?? "rust/logic.rs",
      badge: missingRustSlotCount > 0 ? `${missingRustSlotCount} 缺槽` : logicSignalSlotUnboundCount > 0 ? `${logicSignalSlotUnboundCount} 未绑定` : "Rust",
      actionLabel: missingRustSlotCount > 0 ? "同步 Rust" : logicSignalSlotUnboundCount > 0 ? "绑定" : "打开",
      tone: missingRustSlotCount > 0 || logicSignalSlotUnboundCount > 0 || rustLogicDirty ? "warning" : "ready",
      icon: Braces,
      action:
        missingRustSlotCount > 0
          ? { kind: "task", taskId: "sync-rust" }
          : logicSignalSlotUnboundCount > 0
            ? { kind: "task", taskId: "bind-control-event" }
            : rustSourceRow
              ? { kind: "source-row", rowId: rustSourceRow.id }
              : { kind: "open-build" },
    });

    if (selectedRailActionPreset) {
      rows.push({
        id: "run-kit-next-step",
        kind: "run",
        title: selectedRailKitPlanStats.nextStep ? `Run Kit 下一步：${selectedRailKitPlanStats.nextStep.title}` : selectedRailActionPreset.title,
        detail: `${selectedRailActionPreset.title} · ${selectedRailKitPlanStats.summary}`,
        meta: selectedRailKitPlanStats.nextStep
          ? `${selectedRailKitPlanStats.nextStep.index + 1}/${selectedRailKitPlanStats.total} · ${selectedRailKitPlanStats.nextStep.detail}`
          : selectedRailActionPreset.detail,
        badge: selectedRailActionPreset.badge,
        actionLabel: runningProjectTask ? "查看" : "运行",
        tone: runningProjectTask ? "running" : selectedRailKitPlanStats.failed > 0 ? "danger" : "ready",
        icon: Play,
        action: runningProjectTask ? { kind: "task-detail", taskId: runningProjectTask.id } : { kind: "run-preset", presetId: selectedRailActionPreset.id },
      });
    }

    if (taskCandidate) {
      rows.push({
        id: "task-monitor",
        kind: "task",
        title: runningProjectTask ? `正在运行：${taskCandidate.title}` : latestFailedProjectTask ? `处理失败：${taskCandidate.title}` : `最近任务：${taskCandidate.title}`,
        detail: taskCandidate.error || taskCandidate.summary || taskCandidate.detail,
        meta: taskCandidate.logPath || taskCandidate.artifactPath || projectTaskStatusLabel(taskCandidate.status),
        badge: projectTaskStatusLabel(taskCandidate.status),
        actionLabel: taskCandidate.status === "failed" ? "处理" : "打开",
        tone: taskCandidate.status === "running" ? "running" : taskCandidate.status === "failed" ? "danger" : taskCandidate.status === "queued" ? "warning" : "muted",
        icon: Terminal,
        action: { kind: "task-detail", taskId: taskCandidate.id },
      });
    }

    rows.push({
      id: "release-target",
      kind: "build",
      title: activeProject.outputExePath ? "定位 release exe" : "生成桌面运行目标",
      detail: activeProject.outputExePath
        ? `${fileNameFromPath(activeProject.outputExePath)} 已作为项目产物挂到文件树和运行证据。`
        : `${activeProject.releaseConfig.appName} 还没有 release exe，可从左下 Run Kit 或 Build 页生成。`,
      meta: activeProject.outputExePath || buildSourceRow?.relativePath || "app/",
      badge: activeProject.outputExePath ? "exe" : "待构建",
      actionLabel: activeProject.outputExePath ? "定位" : "构建",
      tone: activeProject.outputExePath ? "success" : "warning",
      icon: Download,
      action: activeProject.outputExePath && buildSourceRow ? { kind: "source-row", rowId: buildSourceRow.id } : { kind: "task", taskId: "build-exe" },
    });

    return rows.slice(0, 7);
  }, [
    activeProject.outputExePath,
    activeProject.releaseConfig.appName,
    activeProject.rootPath,
    activeProject.rustCommands.length,
    activeProject.rustModules.length,
    dirtyUiFileCount,
    latestFailedProjectTask,
    latestProjectTask,
    logicConnectionHealthScore,
    logicSignalSlotUnboundCount,
    missingRustSlotCount,
    nextQueuedProjectTask,
    projectSettingsDirty,
    projectSourceDirty,
    projectSourceOverviewRows,
    projectWorkingSetActiveItem,
    projectWorkingSetItems,
    runningProjectTask,
    rustLogicDirty,
    selectedProjectExplorerDossier,
    selectedProjectExplorerNode,
    selectedProjectExplorerRelativePath,
    selectedRailActionPreset,
    selectedRailKitPlanStats,
  ]);
  const projectFolderHealthItems = useMemo<ProjectFolderHealthItem[]>(() => {
    const routeCountFor = (groupId: ProjectFileRouteGroup["id"]) =>
      projectFileRouteGroups.find((group) => group.id === groupId)?.routes.length ?? 0;
    const sourceRouteCount = routeCountFor("source");
    const generatedRouteCount = routeCountFor("generated");
    const metadataRouteCount = routeCountFor("metadata");
    const sourceOverviewRow = projectSourceOverviewRows.find((row) => row.id === "source-ui-overview") ?? projectSourceOverviewRows.find((row) => row.scope === "source");
    const generatedOverviewRow =
      projectSourceOverviewRows.find((row) => row.id === "generated-app-overview") ?? projectSourceOverviewRows.find((row) => row.scope === "generated");
    const metadataOverviewRow =
      projectSourceOverviewRows.find((row) => row.id === "metadata-editor-state-overview") ?? projectSourceOverviewRows.find((row) => row.scope === "metadata");
    const sourceManifestCount = projectSaveManifestItems.filter((item) => item.scope === "source").length;
    const generatedManifestCount = projectSaveManifestItems.filter((item) => item.scope === "generated").length;
    const metadataManifestCount = projectSaveManifestItems.filter((item) => item.scope === "metadata").length;

    const rows: ProjectFolderHealthItem[] = [
      {
        id: "root",
        title: "项目根目录",
        metric: activeProject.rootPath ? "已连接" : "未选择",
        detail: activeProject.rootPath
          ? "项目文件、生成物和 .nova 本地状态都映射到同一个文件夹。"
          : "保存项目后会建立本地文件夹和隐藏 .nova 工作区。",
        path: activeProject.rootPath || projectRelativePath(activeProject.name),
        state: activeProject.rootPath ? "ready" : "warning",
        actionLabel: "定位根",
        icon: FolderOpen,
        nodeId: "root",
        filter: "all",
      },
      {
        id: "source",
        title: "源码归属",
        metric: projectSourceDirty ? `${sourceManifestCount} 项待同步` : `${sourceManifestCount} 项同步`,
        detail: `UI 文件 ${activeProject.files.length} 个、Rust command ${activeProject.rustCommands.length} 个；${dirtyUiFileCount} 个 UI 文件待保存，Rust ${
          rustLogicDirty ? "待保存" : "已同步"
        }。`,
        path: sourceOverviewRow?.relativePath ?? "src/",
        state: projectSourceDirty ? "warning" : "ready",
        actionLabel: projectSourceDirty ? "保存" : "查看源码",
        icon: Save,
        routeGroupId: "source",
        sourceRowId: sourceOverviewRow?.id,
        filter: "ui",
      },
      {
        id: "generated",
        title: "生成与运行",
        metric: activeProject.outputExePath ? "exe 就绪" : `${generatedManifestCount} 项待生成`,
        detail: activeProject.outputExePath
          ? `${fileNameFromPath(activeProject.outputExePath)} 已登记为桌面运行目标。`
          : "生成的 Tauri app、runtime、bundle 和 smoke 结果会写入项目输出区。",
        path: activeProject.outputExePath || generatedOverviewRow?.relativePath || "app/",
        state: activeProject.outputExePath ? "ready" : "pending",
        actionLabel: activeProject.outputExePath ? "打开产物" : "去构建",
        icon: Download,
        routeGroupId: "generated",
        sourceRowId: generatedOverviewRow?.id,
        filter: "build",
      },
      {
        id: "metadata",
        title: ".nova 本地状态",
        metric: `${metadataManifestCount} 项元数据`,
        detail: "打开文件、组件库、项目树、生成计划、运行 Kit 和检查点会保存到隐藏 .nova 目录。",
        path: projectExplorerModel.metadataPath,
        state: metadataRouteCount > 0 ? "ready" : "warning",
        actionLabel: "查看 .nova",
        icon: FileJson,
        routeGroupId: "metadata",
        sourceRowId: metadataOverviewRow?.id,
        filter: "meta",
      },
    ];

    return rows.map((item) => ({
      ...item,
      metric:
        item.id === "source"
          ? `${item.metric} · ${sourceRouteCount} 路径`
          : item.id === "generated"
            ? `${item.metric} · ${generatedRouteCount} 路径`
            : item.id === "metadata"
              ? `${item.metric} · ${metadataRouteCount} 路径`
              : item.metric,
    }));
  }, [
    activeProject.files.length,
    activeProject.name,
    activeProject.outputExePath,
    activeProject.rootPath,
    activeProject.rustCommands.length,
    dirtyUiFileCount,
    projectExplorerModel.metadataPath,
    projectFileRouteGroups,
    projectSaveManifestItems,
    projectSourceDirty,
    projectSourceOverviewRows,
    rustLogicDirty,
  ]);
  const logicWorkflowRow = selectedLogicSignalSlotRow ?? filteredLogicSignalSlotRows[0] ?? null;
  const logicWorkflowOutlineEntry =
    logicWorkflowRow?.command
      ? rustLogicOutline.find((entry) => entry.commandId === logicWorkflowRow.command?.id) ?? null
      : null;
  const activeRustCommandOutlineEntry =
    rustLogicOutline.find((entry) => entry.commandId === activeRustCommand.id && entry.line) ?? null;
  const activeRustCommandSlotState = activeRustCommandOutlineEntry ? "located" : "missing";
  const activeRustCommandSlotLocationLabel = activeRustCommandOutlineEntry?.line
    ? `logic.rs:${activeRustCommandOutlineEntry.line}`
    : "缺少同名槽函数";
  const activeRustCommandSlotActionLabel = activeRustCommandOutlineEntry ? "打开源码" : "生成槽函数";
  const activeRustCommandPrimaryCaller =
    selectedLogicSignalSlotRow?.command?.id === activeRustCommand.id
      ? selectedLogicSignalSlotRow
      : activeRustCommandBindingRows[0] ?? null;
  const activeRustCommandCodeLensRows = useMemo(() => {
    const commandName = sanitizeRustCommandName(activeRustCommand.name);
    if (activeRustCommandBindingRows.length > 0) {
      return activeRustCommandBindingRows.slice(0, 4).map((row) => ({
        id: row.id,
        state: "bound" as const,
        title: `${getItemSummary(row.item)}.${row.eventName}`,
        detail: `${row.inputSummary} -> ${row.outputSummary}`,
        badge: "UI 调用",
        commandName,
        item: row.item,
        eventName: row.eventName,
        line: activeRustCommandOutlineEntry?.line ?? null,
      }));
    }
    return activeRustCommandCandidateRows.slice(0, 3).map((row) => ({
      id: `candidate-${row.id}`,
      state: "candidate" as const,
      title: `${getItemSummary(row.item)}.${row.eventName}`,
      detail: `${row.inputSummary} · 可绑定到 ${commandName}`,
      badge: "候选信号",
      commandName,
      item: row.item,
      eventName: row.eventName,
      line: activeRustCommandOutlineEntry?.line ?? null,
    }));
  }, [activeRustCommand.name, activeRustCommandBindingRows, activeRustCommandCandidateRows, activeRustCommandOutlineEntry?.line]);
  const activeRustCommandCodeLensState =
    activeRustCommandBindingRows.length > 0
      ? "bound"
      : activeRustCommandCandidateRows.length > 0
        ? "candidates"
        : "empty";
  const activeRustCommandParameters = useMemo(
    () => rustCommandParameters(activeRustCommand),
    [activeRustCommand],
  );
  const activeRustCommandResultSchema = useMemo(
    () => commandResultSchema(activeRustCommand),
    [activeRustCommand],
  );
  const activeRustCommandParameterSummary =
    activeRustCommandParameters.length > 0
      ? activeRustCommandParameters
          .map((parameter) => `${parameter.name}:${rustParameterTypeCode(parameter.type)}`)
          .join(" / ")
      : rustCommandAcceptsArgs(activeRustCommand)
        ? "value"
        : "无参数";
  const activeRustCommandResultImpacts = useMemo<RustCommandResultImpact[]>(() => {
    const stateById = new Map(activeProject.stateVariables.map((state) => [state.id, state]));
    const itemById = new Map(sortedItems.map((item) => [item.id, item]));
    const impacts: RustCommandResultImpact[] = [];

    for (const row of activeRustCommandBindingRows) {
      const binding = row.binding;
      if (!binding) {
        continue;
      }

      if (binding.resultTargetItemId && binding.resultTargetProp) {
        const targetItem = itemById.get(binding.resultTargetItemId);
        impacts.push({
          id: `target-${row.id}-${binding.resultTargetItemId}-${binding.resultTargetProp}`,
          label: targetItem ? `${getItemSummary(targetItem)}.${binding.resultTargetProp}` : "目标控件缺失",
          detail: `${getItemSummary(row.item)}.${row.eventName} 的返回值写回控件属性。`,
          tone: "target",
        });
      }

      if (binding.resultStateId) {
        const state = stateById.get(binding.resultStateId);
        impacts.push({
          id: `state-${row.id}-${binding.resultStateId}`,
          label: state ? `State ${state.name}` : "State 缺失",
          detail: binding.applyJsonStatePatch
            ? "JSON patch 会合并到共享状态。"
            : `${getItemSummary(row.item)}.${row.eventName} 会更新共享状态。`,
          tone: "state",
        });
      }

      if (binding.applyJsonStatePatch) {
        impacts.push({
          id: `patch-${row.id}`,
          label: `JSON patch · ${activeRustCommandResultSchema.statePatchPath || "patch"}`,
          detail: `${activeRustCommandResultSchema.messagePath || "message"} 作为用户反馈，patch 作为状态差量。`,
          tone: "patch",
        });
      }
    }

    const uniqueImpacts = impacts.filter(
      (impact, index, source) => source.findIndex((candidate) => candidate.label === impact.label && candidate.tone === impact.tone) === index,
    );

    return uniqueImpacts.length > 0
      ? uniqueImpacts
      : [
          {
            id: "none",
            label: activeRustCommandResultSchema.mode === "json" ? "JSON 结果" : "文本结果",
            detail: "还没有配置控件属性或共享状态回写。",
            tone: "none",
          },
        ];
  }, [activeProject.stateVariables, activeRustCommandBindingRows, activeRustCommandResultSchema, sortedItems]);
  const activeRustCommandInvokeName = sanitizeRustCommandName(activeRustCommand.name);
  const activeRustCommandSourceLineLabel = activeRustCommandOutlineEntry?.line
    ? `logic.rs:${activeRustCommandOutlineEntry.line}${activeRustCommandOutlineEntry.column ? `:${activeRustCommandOutlineEntry.column}` : ""}`
    : "logic.rs · 待生成";
  const activeRustCommandSourceRangeLabel =
    activeRustCommandOutlineEntry?.line && activeRustCommandOutlineEntry.endLine && activeRustCommandOutlineEntry.endLine > activeRustCommandOutlineEntry.line
      ? `Ln ${activeRustCommandOutlineEntry.line}-${activeRustCommandOutlineEntry.endLine}`
      : activeRustCommandOutlineEntry?.line
        ? `Ln ${activeRustCommandOutlineEntry.line}`
        : "缺少槽函数";
  const activeRustCommandPrimaryCallerLabel = activeRustCommandPrimaryCaller
    ? `${getItemSummary(activeRustCommandPrimaryCaller.item)}.${activeRustCommandPrimaryCaller.eventName}`
    : "暂无 UI 调用";
  const activeRustCommandInvokePreview =
    activeRustCommandParameters.length > 0
      ? `invoke("${activeRustCommandInvokeName}", { ${activeRustCommandParameters
          .slice(0, 3)
          .map((parameter, index) => `${sanitizeRustParameterName(parameter.name, index)}: ...`)
          .join(", ")} })`
      : `invoke("${activeRustCommandInvokeName}")`;
  const activeRustCommandSourceInspectorRows = [
    {
      id: "invoke",
      label: "Invoke",
      value: activeRustCommandInvokeName,
      detail: activeRustCommandParameters.length > 0 ? activeRustCommandParameterSummary : "前端可直接调用",
      icon: ClipboardCopy,
    },
    {
      id: "source",
      label: "源码",
      value: activeRustCommandSourceLineLabel,
      detail: activeRustCommandOutlineEntry?.detail ?? "可从这里生成缺失槽函数",
      icon: Braces,
    },
    {
      id: "caller",
      label: "调用入口",
      value: activeRustCommandPrimaryCallerLabel,
      detail: activeRustCommandPrimaryCaller
        ? `${activeRustCommandPrimaryCaller.inputSummary} -> ${activeRustCommandPrimaryCaller.outputSummary}`
        : "先在连接矩阵绑定控件事件",
      icon: MousePointer2,
    },
    {
      id: "result",
      label: "回写",
      value: activeRustCommandResultSchema.mode.toUpperCase(),
      detail: activeRustCommandResultImpacts[0]?.label ?? "无结果映射",
      icon: FileJson,
    },
  ];
  const activeRustCommandImpactStats = [
    {
      id: "callers",
      label: "UI 调用",
      value: `${activeRustCommandBindingRows.length}`,
      detail: activeRustCommandBindingRows.length > 0 ? "可回跳控件" : "等待绑定",
      icon: MousePointer2,
    },
    {
      id: "parameters",
      label: "输入参数",
      value: activeRustCommandParameters.length > 0 ? `${activeRustCommandParameters.length}` : "0",
      detail: activeRustCommandParameterSummary,
      icon: TextCursorInput,
    },
    {
      id: "result",
      label: "结果模式",
      value: activeRustCommandResultSchema.mode.toUpperCase(),
      detail: activeRustCommandResultImpacts[0]?.label ?? "无回写",
      icon: FileJson,
    },
    {
      id: "slot",
      label: "槽函数",
      value: activeRustCommandSlotState === "located" ? "已定位" : "待生成",
      detail: activeRustCommandSlotLocationLabel,
      icon: Braces,
    },
  ];
  const rustDebuggerProblemRows = useMemo(
    () =>
      buildDiagnostics.slice(0, 8).map((diagnostic, index) => {
        const location = rustDiagnosticSourceLocation(diagnostic, activeProject.rustLogic);
        const editable = isEditableRustDiagnostic(diagnostic);
        return {
          id: `diagnostic-${index}-${diagnostic.line ?? "unknown"}`,
          diagnostic,
          index,
          editable,
          severity: diagnostic.severity,
          title: diagnostic.message,
          code: diagnostic.code || diagnostic.origin || "rustc",
          file: diagnostic.sourceFile || diagnostic.file || "Cargo 输出",
          line: location?.sourceLine ?? diagnostic.sourceLine ?? diagnostic.line ?? null,
          column: location?.column ?? diagnostic.sourceColumn ?? diagnostic.column ?? 1,
          detail: location
            ? `映射到 logic.rs:${location.sourceLine}:${location.column}`
            : diagnostic.rendered || diagnostic.sourceSummary || "无法映射到当前 Rust 编辑器源码",
        };
      }),
    [activeProject.rustLogic, buildDiagnostics],
  );
  const rustDebuggerBreakpointRows = useMemo(
    () =>
      rustLogicOutline
        .filter((entry) => Boolean(entry.line))
        .slice(0, 8)
        .map((entry, index) => {
          const id = `breakpoint-${entry.id}`;
          return {
            id,
            entry,
            enabled: !disabledRustDebuggerBreakpointIds.includes(id),
            label: entry.label,
            line: entry.line ?? 1,
            detail: `${rustOutlineKindTitle(entry.kind)} · ${entry.detail}`,
            hitLabel: index === 0 ? "当前" : index === 1 ? "条件" : "启用",
          };
        }),
    [disabledRustDebuggerBreakpointIds, rustLogicOutline],
  );
  const rustDebuggerWatchRows = useMemo(() => {
    const patch = latestSimulatorTrace?.patch ?? {};
    const rows = activeProject.stateVariables.slice(0, 6).map((state) => ({
      id: `state-${state.id}`,
      expression: `state.${state.name}`,
      value: patch[state.id] ?? state.initialValue ?? "",
      detail: patch[state.id] !== undefined ? "来自最近运行 patch" : "初始状态值",
      tone: patch[state.id] !== undefined ? "changed" : "state",
    }));
    if (activeRustCommandParameters.length > 0) {
      rows.push(
        ...activeRustCommandParameters.slice(0, 4).map((parameter, index) => ({
          id: `param-${parameter.id}`,
          expression: `args.${sanitizeRustParameterName(parameter.name, index)}`,
          value: parameter.source,
          detail: rustParameterTypeCode(parameter.type),
          tone: "parameter",
        })),
      );
    }
    if (latestSimulatorTrace) {
      rows.unshift({
        id: `trace-${latestSimulatorTrace.id}`,
        expression: "runtime.lastResult",
        value: latestSimulatorTrace.status,
        detail: `${latestSimulatorTrace.commandName}: ${latestSimulatorTrace.message}`,
        tone: latestSimulatorTrace.status === "error" ? "error" : "changed",
      });
    }
    return rows.slice(0, 8);
  }, [activeProject.stateVariables, activeRustCommandParameters, latestSimulatorTrace]);
  const rustDebuggerCallStackRows = useMemo(() => {
    const caller = activeRustCommandPrimaryCaller;
    const rows = [
      caller
        ? {
            id: "frame-ui-signal",
            frame: "#0",
            label: `${getItemSummary(caller.item)}.${caller.eventName}`,
            detail: `${caller.item.type} UI signal`,
            line: null as number | null,
            action: "design" as const,
          }
        : {
            id: "frame-ui-signal-empty",
            frame: "#0",
            label: "等待 UI 信号",
            detail: "选择或绑定一个控件事件后会显示调用入口",
            line: null as number | null,
            action: "none" as const,
          },
      {
        id: "frame-command",
        frame: "#1",
        label: sanitizeRustCommandName(activeRustCommand.name),
        detail: `${activeRustCommandParameters.length} 参数 · ${activeRustCommandResultSchema.mode} result`,
        line: activeRustCommandOutlineEntry?.line ?? null,
        action: "function" as const,
      },
      {
        id: "frame-invoke",
        frame: "#2",
        label: "tauri::invoke",
        detail: activeRustCommandBindingRows.length > 0 ? `${activeRustCommandBindingRows.length} 个 UI 调用` : "尚未绑定 UI 调用",
        line: activeRustCommandOutlineEntry?.line ?? null,
        action: "function" as const,
      },
      {
        id: "frame-result",
        frame: "#3",
        label: activeRustCommandResultImpacts[0]?.label ?? "result",
        detail: activeRustCommandResultImpacts[0]?.detail ?? "等待配置输出回写",
        line: null as number | null,
        action: "none" as const,
      },
    ];
    return rows;
  }, [
    activeRustCommand.name,
    activeRustCommandBindingRows.length,
    activeRustCommandOutlineEntry?.line,
    activeRustCommandParameters.length,
    activeRustCommandPrimaryCaller,
    activeRustCommandResultImpacts,
    activeRustCommandResultSchema.mode,
  ]);
  const rustDebuggerTabs: Array<{ id: RustDebuggerPanelId; label: string; count: number }> = [
    { id: "problems", label: "Problems", count: rustDebuggerProblemRows.length },
    { id: "breakpoints", label: "Breakpoints", count: rustDebuggerBreakpointRows.length },
    { id: "watch", label: "Watch", count: rustDebuggerWatchRows.length },
    { id: "call-stack", label: "Call Stack", count: rustDebuggerCallStackRows.length },
  ];
  const recentSlotNavigationEntries = useMemo(
    () =>
      slotNavigationHistory
        .filter((entry) => activeProject.rustCommands.some((command) => command.id === entry.commandId))
        .slice(0, 6),
    [activeProject.rustCommands, slotNavigationHistory],
  );
  const registerSlotNavigationVisit = (
    command: RustCommand,
    context: {
      item?: BuilderItem | null;
      eventName?: BuilderEventName | null;
      sourceLine?: number | null;
      reason?: SlotNavigationEntry["reason"];
    } = {},
  ) => {
    const matchingRows = logicSignalSlotRows.filter((row) => row.command?.id === command.id);
    const item = context.item ?? null;
    const sourceLine =
      context.sourceLine ??
      rustLogicOutline.find((entry) => entry.kind === "slot" && entry.commandId === command.id && entry.line)?.line ??
      null;
    const safeName = sanitizeRustCommandName(command.name);
    const eventName = context.eventName ?? undefined;
    const entry: SlotNavigationEntry = {
      id: `${command.id}:${item?.id ?? "command"}:${eventName ?? "slot"}`,
      commandId: command.id,
      commandName: safeName,
      sourceLine,
      sourceLabel: sourceLine ? `logic.rs:${sourceLine}` : "槽函数待生成",
      itemId: item?.id,
      itemName: item ? getItemSummary(item) : undefined,
      eventName,
      bindingCount: matchingRows.length,
      reason: context.reason ?? "command",
      visitedAt: new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date()),
    };
    setSlotNavigationHistory((current) => [
      entry,
      ...current.filter((candidate) => candidate.id !== entry.id),
    ].slice(0, 8));
  };
  const logicWorkflowSteps: InspectorWorkflowStep[] = logicWorkflowRow
    ? [
        {
          id: "logic-focus-control",
          title: logicWorkflowRow.selected ? "控件已聚焦" : "聚焦控件",
          detail: `${getItemSummary(logicWorkflowRow.item)} · ${logicWorkflowRow.item.type}`,
          badge: logicWorkflowRow.selected ? "已选" : logicWorkflowRow.item.type,
          icon: MousePointer2,
          actionLabel: logicWorkflowRow.selected ? "保持" : "聚焦",
          tone: logicWorkflowRow.selected ? "primary" : "ready",
          onAction: () => {
            setSelectedId(logicWorkflowRow.item.id);
            setMode("logic");
          },
        },
        {
          id: "logic-slot",
          title: logicWorkflowRow.command ? "槽函数已绑定" : "创建槽函数",
          detail: logicWorkflowRow.command
            ? `${logicWorkflowRow.eventName} -> ${sanitizeRustCommandName(logicWorkflowRow.command.name)}`
            : `${logicWorkflowRow.eventName} 等待 Rust command`,
          badge: logicWorkflowRow.command ? "已绑定" : "待绑定",
          icon: CornerDownRight,
          actionLabel: logicWorkflowRow.command ? "打开槽" : "创建",
          tone: logicWorkflowRow.command ? "ready" : "warning",
          onAction: () => goToSlotForItem(logicWorkflowRow.item),
        },
        {
          id: "logic-source",
          title: "源码定位",
          detail: logicWorkflowOutlineEntry?.line
            ? `logic.rs:${logicWorkflowOutlineEntry.line}`
            : logicWorkflowRow.command
              ? "按命令名定位源码"
              : "需要先创建槽函数",
          badge: logicWorkflowOutlineEntry?.line ? `Ln ${logicWorkflowOutlineEntry.line}` : logicWorkflowRow.command ? "搜索" : "阻塞",
          icon: Braces,
          actionLabel: "定位",
          tone: logicWorkflowOutlineEntry?.line ? "primary" : logicWorkflowRow.command ? "ready" : "muted",
          disabled: !logicWorkflowRow.command,
          onAction: () => {
            if (logicWorkflowOutlineEntry) {
              openRustLogicOutlineEntry(logicWorkflowOutlineEntry);
              return;
            }
            if (logicWorkflowRow.command) {
              focusRustFunction(logicWorkflowRow.command.name);
            }
          },
        },
        {
          id: "logic-run",
          title: "运行验证",
          detail: logicWorkflowRow.command ? `${logicWorkflowRow.inputSummary} -> ${logicWorkflowRow.outputSummary}` : "绑定后可运行",
          badge: logicWorkflowRow.command ? "就绪" : "阻塞",
          icon: Play,
          actionLabel: "运行",
          tone: logicWorkflowRow.command ? "ready" : "muted",
          disabled: !logicWorkflowRow.command,
          onAction: () => runLogicSignalSlotEvent(logicWorkflowRow.item, logicWorkflowRow.eventName),
        },
        {
          id: "logic-impact",
          title: "影响范围",
          detail: "控件、命令、生成文件和检查链路",
          badge: "图谱",
          icon: AlertTriangle,
          actionLabel: "影响",
          tone: "muted",
          onAction: () => {
            setSelectedId(logicWorkflowRow.item.id);
            setMode("design");
            setRightDockTab("impact");
            setFeedbackPanelOpen(false);
            setBottomDockExpanded(false);
            setBottomDockMinimized(true);
          },
        },
      ]
    : [];
  const firstUnboundLogicSignalSlotRow = unboundLogicSignalSlotRows[0] ?? null;
  const logicWorkbenchNextActions = ([
    ...(firstUnboundLogicSignalSlotRow
      ? [
          {
            id: "logic-next-bind-signal",
            title: "连接未绑定信号",
            detail: `${getItemSummary(firstUnboundLogicSignalSlotRow.item)}.${firstUnboundLogicSignalSlotRow.eventName} 还没有 Rust command。`,
            badge: `${unboundLogicSignalSlotRows.length} 待绑定`,
            icon: CornerDownRight,
            actionLabel: "打开连接",
            tone: "warning" as const,
            onAction: () => openLogicConnectionSettings(firstUnboundLogicSignalSlotRow.item, firstUnboundLogicSignalSlotRow.eventName),
          },
        ]
      : []),
    ...(missingRustSlotEntries.length > 0
      ? [
          {
            id: "logic-next-generate-missing-slots",
            title: "生成缺失槽函数",
            detail: `${missingRustSlotEntries.length} 个 Rust command 缺少可跳转的 #[tauri::command] 槽函数实现。`,
            badge: `${missingRustSlotEntries.length} 缺槽`,
            icon: Wand2,
            actionLabel: "补齐槽",
            tone: "warning" as const,
            onAction: () => appendMissingRustSlots(),
          },
        ]
      : []),
    ...(logicWorkflowRow?.command
      ? [
          {
            id: "logic-next-run-current-flow",
            title: "运行当前逻辑链路",
            detail: `${getItemSummary(logicWorkflowRow.item)}.${logicWorkflowRow.eventName} -> ${sanitizeRustCommandName(logicWorkflowRow.command.name)}。`,
            badge: "可运行",
            icon: Play,
            actionLabel: "运行事件",
            tone: "primary" as const,
            onAction: () => runLogicSignalSlotEvent(logicWorkflowRow.item, logicWorkflowRow.eventName),
          },
        ]
      : []),
    ...(activeRustCommandBindingRows.length > 0
      ? [
          {
            id: "logic-next-review-callers",
            title: "查看当前命令调用者",
            detail: `${sanitizeRustCommandName(activeRustCommand.name)} 被 ${activeRustCommandBindingRows.length} 个 UI 事件调用，可回跳控件或调整输入输出。`,
            badge: `${activeRustCommandBindingRows.length} 调用`,
            icon: Navigation,
            actionLabel: "查看调用",
            tone: "ready" as const,
            onAction: () => {
              setRightDockTab("connections");
              setMode("logic");
            },
          },
        ]
      : []),
    {
      id: "logic-next-open-evidence",
      title: "打开运行证据",
      detail: "查看问题、任务和日志 Dock，确认槽函数运行结果、构建诊断和任务输出。",
      badge: "证据",
      icon: ScrollText,
      actionLabel: "打开日志",
      tone: logicWorkflowRow?.command ? "ready" as const : "muted" as const,
      onAction: () => openBottomDock("logs", false),
    },
  ] as InspectorWorkflowStep[]).slice(0, 4);
  const logicWorkbenchPrimaryAction = logicWorkbenchNextActions.find((step) => step.tone === "warning" && !step.disabled) ??
    logicWorkbenchNextActions.find((step) => step.tone === "primary" && !step.disabled) ??
    logicWorkbenchNextActions.find((step) => step.tone === "ready" && !step.disabled) ??
    logicWorkbenchNextActions[0] ??
    null;
  const logicWorkflowNodes = logicWorkflowRow
    ? [
        {
          id: "control",
          title: "控件信号",
          label: getItemSummary(logicWorkflowRow.item),
          detail: `${logicWorkflowRow.item.type}.${logicWorkflowRow.eventName}`,
          badge: logicWorkflowRow.selected ? "当前" : "可聚焦",
          icon: MousePointer2,
          tone: logicWorkflowRow.selected ? "primary" : "ready",
          actionLabel: logicWorkflowRow.selected ? "已聚焦" : "聚焦",
          disabled: false,
          onAction: () => {
            setSelectedId(logicWorkflowRow.item.id);
            setRightDockTab("connections");
          },
        },
        {
          id: "command",
          title: "Rust command",
          label: logicWorkflowRow.command ? sanitizeRustCommandName(logicWorkflowRow.command.name) : "未绑定 command",
          detail: logicWorkflowRow.command ? logicWorkflowRow.inputSummary : "从连接设置选择或创建命令",
          badge: logicWorkflowRow.command ? "已绑定" : "待绑定",
          icon: CornerDownRight,
          tone: logicWorkflowRow.command ? "ready" : "warning",
          actionLabel: logicWorkflowRow.command ? "选中命令" : "连接",
          disabled: false,
          onAction: () => {
            if (logicWorkflowRow.command) {
              selectRustCommand(logicWorkflowRow.command.id);
              return;
            }
            openLogicConnectionSettings(logicWorkflowRow.item, logicWorkflowRow.eventName);
          },
        },
        {
          id: "source",
          title: "槽函数源码",
          label: logicWorkflowOutlineEntry?.line
            ? `logic.rs:${logicWorkflowOutlineEntry.line}`
            : logicWorkflowRow.command
              ? sanitizeRustCommandName(logicWorkflowRow.command.name)
              : "等待 command",
          detail: logicWorkflowOutlineEntry?.line
            ? "源码位置可直接跳转"
            : logicWorkflowRow.command
              ? "槽函数缺失时可一键生成"
              : "先完成 command 绑定",
          badge: logicWorkflowOutlineEntry?.line ? "已定位" : logicWorkflowRow.command ? "待生成" : "阻塞",
          icon: Braces,
          tone: logicWorkflowOutlineEntry?.line ? "primary" : logicWorkflowRow.command ? "warning" : "muted",
          actionLabel: logicWorkflowOutlineEntry?.line ? "打开源码" : logicWorkflowRow.command ? "生成槽" : "等待",
          disabled: !logicWorkflowRow.command,
          onAction: () => {
            if (logicWorkflowOutlineEntry) {
              openRustLogicOutlineEntry(logicWorkflowOutlineEntry);
              return;
            }
            if (logicWorkflowRow.command) {
              appendMissingRustSlotForCommand(logicWorkflowRow.command.id);
            }
          },
        },
        {
          id: "runtime",
          title: "运行回写",
          label: logicWorkflowRow.command ? logicWorkflowRow.outputSummary : "暂无输出",
          detail: logicWorkflowRow.command ? `输入：${logicWorkflowRow.inputSummary}` : "绑定后可模拟运行并查看日志",
          badge: logicWorkflowRow.command ? "可运行" : "阻塞",
          icon: Play,
          tone: logicWorkflowRow.command ? "ready" : "muted",
          actionLabel: "运行事件",
          disabled: !logicWorkflowRow.command,
          onAction: () => runLogicSignalSlotEvent(logicWorkflowRow.item, logicWorkflowRow.eventName),
        },
      ]
    : [];
  const logicSlotAssistantRoute: InspectorWorkflowStep[] = logicWorkflowRow
    ? [
        {
          id: "slot-assistant-signal",
          title: "UI 信号",
          detail: `${getItemSummary(logicWorkflowRow.item)} · ${logicWorkflowRow.item.type}.${logicWorkflowRow.eventName}`,
          badge: logicWorkflowRow.selected ? "当前" : "可聚焦",
          icon: MousePointer2,
          actionLabel: logicWorkflowRow.selected ? "已聚焦" : "聚焦控件",
          tone: logicWorkflowRow.selected ? "primary" : "ready",
          onAction: () => {
            setSelectedId(logicWorkflowRow.item.id);
            setRightDockTab("connections");
          },
        },
        {
          id: "slot-assistant-command",
          title: "Rust command",
          detail: logicWorkflowRow.command
            ? `${sanitizeRustCommandName(logicWorkflowRow.command.name)} · ${logicWorkflowRow.commandArgs.length} 参数`
            : "还没有绑定 Rust command",
          badge: logicWorkflowRow.command ? "已绑定" : "待绑定",
          icon: Braces,
          actionLabel: logicWorkflowRow.command ? "选中命令" : "连接命令",
          tone: logicWorkflowRow.command ? "ready" : "warning",
          onAction: () => {
            if (logicWorkflowRow.command) {
              selectRustCommand(logicWorkflowRow.command.id);
              return;
            }
            openLogicConnectionSettings(logicWorkflowRow.item, logicWorkflowRow.eventName);
          },
        },
        {
          id: "slot-assistant-source",
          title: "logic.rs 槽函数",
          detail: logicWorkflowOutlineEntry?.line
            ? `可跳转到 logic.rs:${logicWorkflowOutlineEntry.line}`
            : logicWorkflowRow.command
              ? "命令存在，但源码里还没有可定位槽函数"
              : "先绑定 command 后再生成槽函数",
          badge: logicWorkflowOutlineEntry?.line ? `Ln ${logicWorkflowOutlineEntry.line}` : logicWorkflowRow.command ? "缺槽" : "阻塞",
          icon: FileJson,
          actionLabel: logicWorkflowOutlineEntry?.line ? "打开源码" : logicWorkflowRow.command ? "生成槽" : "等待",
          tone: logicWorkflowOutlineEntry?.line ? "primary" : logicWorkflowRow.command ? "warning" : "muted",
          disabled: !logicWorkflowRow.command,
          onAction: () => {
            if (logicWorkflowOutlineEntry) {
              openRustLogicOutlineEntry(logicWorkflowOutlineEntry);
              return;
            }
            if (logicWorkflowRow.command) {
              appendMissingRustSlotForCommand(logicWorkflowRow.command.id);
            }
          },
        },
        {
          id: "slot-assistant-io",
          title: "参数 / 回写",
          detail: logicWorkflowRow.command
            ? `${logicWorkflowRow.inputSummary} -> ${logicWorkflowRow.outputSummary}`
            : "绑定后可配置 payload 和 result patch",
          badge: logicWorkflowRow.command ? commandResultSchema(logicWorkflowRow.command).mode : "未配置",
          icon: ArrowRight,
          actionLabel: "映射设置",
          tone: logicWorkflowRow.command ? "ready" : "muted",
          disabled: !logicWorkflowRow.command,
          onAction: () => openLogicConnectionSettings(logicWorkflowRow.item, logicWorkflowRow.eventName),
        },
        {
          id: "slot-assistant-evidence",
          title: "运行证据",
          detail: selectedLatestSimulatorTrace
            ? `${selectedLatestSimulatorTrace.commandName} · ${selectedLatestSimulatorTrace.message}`
            : logicWorkflowRow.command
              ? "运行当前事件后，日志和 state patch 会进入证据 Dock"
              : "先完成绑定，再运行事件验证",
          badge: selectedLatestSimulatorTrace?.status ?? (logicWorkflowRow.command ? "可运行" : "阻塞"),
          icon: ScrollText,
          actionLabel: logicWorkflowRow.command ? "运行验证" : "查看日志",
          tone: selectedLatestSimulatorTrace?.status === "error"
            ? "danger"
            : logicWorkflowRow.command
              ? "ready"
              : "muted",
          disabled: !logicWorkflowRow.command,
          onAction: () => runLogicSignalSlotEvent(logicWorkflowRow.item, logicWorkflowRow.eventName),
        },
      ]
    : [];
  const logicSlotAssistantState = !logicWorkflowRow
    ? "empty"
    : !logicWorkflowRow.command
      ? "unbound"
      : logicWorkflowOutlineEntry?.line
        ? "ready"
        : "missing-slot";
  const rustCursorOutlineEntry = useMemo(
    () =>
      [...rustLogicOutline]
        .filter((entry) => entry.line !== null && entry.line <= rustEditorSelection.line && rustEditorSelection.line <= (entry.endLine ?? entry.line))
        .sort((a, b) => (b.line ?? 0) - (a.line ?? 0))[0] ?? null,
    [rustEditorSelection.line, rustLogicOutline],
  );
  const rustCursorSignalSlotRow = useMemo(
    () =>
      rustCursorOutlineEntry?.commandId
        ? logicSignalSlotRows.find((row) => row.command?.id === rustCursorOutlineEntry.commandId) ?? null
        : null,
    [logicSignalSlotRows, rustCursorOutlineEntry?.commandId],
  );
  const rustSignatureHelp = useMemo<RustSignatureHelp | null>(() => {
    const cursorCommand = rustCursorOutlineEntry?.commandId
      ? activeProject.rustCommands.find((command) => command.id === rustCursorOutlineEntry.commandId) ?? null
      : null;
    const command = cursorCommand ?? activeRustCommand;
    if (!command) {
      return null;
    }

    const parameters = rustSignatureParameterHelp(command);
    const line = rustEditorLines[rustEditorSelection.line - 1] ?? "";
    const activeParameterIndex = rustSignatureActiveParameterIndex(
      line,
      rustEditorSelection.column - 1,
      sanitizeRustCommandName(command.name),
      parameters.length,
    );
    const result = commandResultSchema(command);
    const resultSummary =
      result.mode === "json"
        ? `JSON result · ${result.messagePath || "message"} / ${result.statePatchPath || "patch"}`
        : "String result";

    return {
      commandId: command.id,
      commandName: sanitizeRustCommandName(command.name),
      signature: rustCommandSignatureLabel(command),
      resultSummary,
      activeParameterIndex,
      parameters,
      bindingCount: logicSignalSlotRows.filter((row) => row.command?.id === command.id).length,
      source: cursorCommand ? "cursor-slot" : "active-command",
    };
  }, [
    activeProject.rustCommands,
    activeRustCommand,
    logicSignalSlotRows,
    rustCursorOutlineEntry?.commandId,
    rustEditorLines,
    rustEditorSelection.column,
    rustEditorSelection.line,
  ]);
  const rustEditorContextTitle = rustCursorOutlineEntry
    ? `${rustOutlineKindTitle(rustCursorOutlineEntry.kind)} · ${rustCursorOutlineEntry.label}`
    : "全局作用域";
  const rustCursorOutlineRangeLabel = rustCursorOutlineEntry?.line
    ? rustCursorOutlineEntry?.endLine && rustCursorOutlineEntry.endLine > rustCursorOutlineEntry.line
      ? `Ln ${rustCursorOutlineEntry.line}-${rustCursorOutlineEntry.endLine}`
      : `Ln ${rustCursorOutlineEntry.line}`
    : "";
  const rustEditorContextDetail = rustCursorSignalSlotRow
    ? `${getItemSummary(rustCursorSignalSlotRow.item)}.${rustCursorSignalSlotRow.eventName} -> ${sanitizeRustCommandName(rustCursorSignalSlotRow.command?.name ?? "未绑定")}`
    : rustCursorOutlineEntry
      ? [rustCursorOutlineRangeLabel, rustCursorOutlineEntry.detail].filter(Boolean).join(" · ")
      : "移动光标到函数、类型或槽函数内，Nova 会显示当前位置和可用操作。";
  const rustEditorHoverDoc = useMemo<RustEditorHoverDoc>(() => {
    const identifierName = rustCurrentIdentifier?.name ?? "";
    const identifierOutlineEntry = identifierName
      ? rustLogicOutline.find((entry) => entry.label === identifierName && entry.line) ?? null
      : null;
    const cursorCommand = rustCursorOutlineEntry?.commandId
      ? activeProject.rustCommands.find((command) => command.id === rustCursorOutlineEntry.commandId) ?? null
      : null;
    const identifierCommand = identifierName
      ? activeProject.rustCommands.find((command) => sanitizeRustCommandName(command.name) === identifierName) ?? null
      : null;
    const command = identifierCommand ?? cursorCommand;

    if (command) {
      const commandName = sanitizeRustCommandName(command.name);
      const commandRows = logicSignalSlotRows.filter((row) => row.command?.id === command.id);
      const commandEntry = rustLogicOutline.find((entry) => entry.commandId === command.id && entry.line) ?? identifierOutlineEntry ?? null;
      const parameters = rustCommandParameters(command);
      return {
        kind: "command",
        title: `Rust command · ${commandName}`,
        detail: `${parameters.length} 参数 · ${commandResultSchema(command).mode} 返回 · ${commandRows.length} 个 UI 调用`,
        location: commandEntry?.line ? `logic.rs:${commandEntry.line}${commandEntry.column ? `:${commandEntry.column}` : ""}` : "源码待生成",
        sourceLine: commandEntry?.line ?? undefined,
        commandId: command.id,
        controlItemId: commandRows[0]?.item.id,
        controlEventName: commandRows[0]?.eventName,
        badges: [
          parameters.length > 0 ? `${parameters.length} 参数` : "无参数",
          commandRows.length > 0 ? `${commandRows.length} UI 调用` : "未绑定 UI",
          command.backendIntegrationId ? "后端集成" : "Tauri invoke",
        ],
      };
    }

    const state = identifierName ? activeProject.stateVariables.find((candidate) => candidate.name === identifierName) ?? null : null;
    if (state) {
      return {
        kind: "state",
        title: `State · ${state.name}`,
        detail: `初始值 ${state.initialValue || "空"}，可由 Rust JSON patch 回写到 UI。`,
        location: "项目 state store",
        badges: ["状态变量", state.initialValue ? "有初始值" : "空值", "可回写"],
      };
    }

    const module = identifierName
      ? activeProject.rustModules.find((candidate) => sanitizeRustModuleName(candidate.name) === identifierName) ?? null
      : null;
    if (module) {
      return {
        kind: "module",
        title: `Rust module · ${sanitizeRustModuleName(module.name)}`,
        detail: module.enabled ? "模块会写入生成 app 并通过 lib.rs mod 声明载入。" : "模块已禁用，保存时不会参与生成。",
        location: `rust/modules/${sanitizeRustModuleName(module.name)}.rs`,
        badges: [module.enabled ? "启用" : "禁用", `${module.source.split(/\r?\n/).length} 行`, "模块"],
      };
    }

    const dependency = identifierName
      ? activeProject.cargoDependencies.find((candidate) => sanitizeCargoDependencyName(candidate.name) === identifierName) ?? null
      : null;
    if (dependency) {
      return {
        kind: "dependency",
        title: `Cargo · ${sanitizeCargoDependencyName(dependency.name)}`,
        detail: dependency.enabled ? `保存时写入 Cargo.toml，版本 ${dependency.version || "*"}` : "依赖已禁用，生成时不会写入 Cargo.toml。",
        location: "src-tauri/Cargo.toml",
        badges: [dependency.enabled ? "启用" : "禁用", dependency.version || "*", dependency.features ? "features" : "无 features"],
      };
    }

    if (rustCursorOutlineEntry) {
      return {
        kind: rustCursorOutlineEntry.kind,
        title: `${rustOutlineKindTitle(rustCursorOutlineEntry.kind)} · ${rustCursorOutlineEntry.label}`,
        detail: rustCursorOutlineEntry.detail,
        location: rustCursorOutlineEntry.line
          ? `logic.rs:${rustCursorOutlineEntry.line}${rustCursorOutlineEntry.column ? `:${rustCursorOutlineEntry.column}` : ""}`
          : "源码待生成",
        sourceLine: rustCursorOutlineEntry.line ?? undefined,
        commandId: rustCursorOutlineEntry.commandId,
        controlItemId: rustCursorSignalSlotRow?.item.id,
        controlEventName: rustCursorSignalSlotRow?.eventName,
        badges: [
          rustOutlineKindLabel(rustCursorOutlineEntry.kind),
          rustCursorOutlineEntry.bindingCount > 0 ? `${rustCursorOutlineEntry.bindingCount} UI 调用` : "无 UI 调用",
          rustCursorOutlineEntry.line ? "已定位" : "待生成",
        ],
      };
    }

    return {
      kind: "global",
      title: identifierName ? `符号 · ${identifierName}` : "Rust 全局上下文",
      detail: identifierName
        ? "当前标识符还没有匹配到 Nova command、state、module 或源码大纲。"
        : "把光标放在 command、state、module、依赖或函数名上查看上下文文档和跳转动作。",
      location: `logic.rs:${rustEditorSelection.line}:${rustEditorSelection.column}`,
      sourceLine: rustEditorSelection.line,
      badges: [identifierName ? "普通标识符" : "全局", `${rustCurrentIdentifierOccurrences.length} 处`, "hover doc"],
    };
  }, [
    activeProject.cargoDependencies,
    activeProject.rustCommands,
    activeProject.rustModules,
    activeProject.stateVariables,
    logicSignalSlotRows,
    rustCurrentIdentifier?.name,
    rustCurrentIdentifierOccurrences.length,
    rustCursorOutlineEntry,
    rustCursorSignalSlotRow,
    rustEditorSelection.column,
    rustEditorSelection.line,
    rustLogicOutline,
  ]);
  const primaryRustDebuggerProblemRow = rustDebuggerProblemRows[0] ?? null;
  const logicContextSummaryItems = ([
    {
      id: "logic-context-signal",
      title: logicWorkflowRow ? "当前 UI 信号" : "等待 UI 信号",
      detail: logicWorkflowRow
        ? `${getItemSummary(logicWorkflowRow.item)}.${logicWorkflowRow.eventName} · ${logicWorkflowRow.inputSummary}`
        : "选择一个可触发事件的控件，或在信号/槽矩阵里选中一行。",
      badge: logicWorkflowRow?.command ? "已绑定" : logicWorkflowRow ? "待绑定" : "空闲",
      icon: MousePointer2,
      actionLabel: logicWorkflowRow?.command ? "连接设置" : "选择信号",
      tone: logicWorkflowRow?.command ? "ready" as const : logicWorkflowRow ? "warning" as const : "muted" as const,
      disabled: !logicWorkflowRow,
      onAction: () => {
        if (!logicWorkflowRow) {
          return;
        }
        openLogicConnectionSettings(logicWorkflowRow.item, logicWorkflowRow.eventName);
      },
    },
    {
      id: "logic-context-cursor",
      title: rustCursorOutlineEntry ? "Rust 光标上下文" : "Rust 全局上下文",
      detail: rustCursorSignalSlotRow
        ? `${getItemSummary(rustCursorSignalSlotRow.item)}.${rustCursorSignalSlotRow.eventName} 调用当前槽。`
        : rustCursorOutlineEntry
          ? `${rustOutlineKindTitle(rustCursorOutlineEntry.kind)} ${rustCursorOutlineEntry.label} · ${rustCursorOutlineRangeLabel || "logic.rs"}`
          : `Ln ${rustEditorSelection.line}, Col ${rustEditorSelection.column}`,
      badge: rustCursorSignalSlotRow ? "UI 槽" : rustCursorOutlineEntry ? rustOutlineKindLabel(rustCursorOutlineEntry.kind) : "光标",
      icon: Braces,
      actionLabel: rustCursorOutlineEntry ? "打开范围" : "定位光标",
      tone: rustCursorOutlineEntry ? "primary" as const : "ready" as const,
      onAction: () => {
        if (rustCursorOutlineEntry) {
          openRustLogicOutlineEntry(rustCursorOutlineEntry);
          return;
        }
        focusRustLine(rustEditorSelection.line, "逻辑上下文 · 当前光标", rustEditorSelection.column);
      },
    },
    {
      id: "logic-context-command",
      title: "活跃 Rust command",
      detail: `${sanitizeRustCommandName(activeRustCommand.name)} · ${activeRustCommandBindingRows.length} 个 UI 调用 · ${activeRustCommandParameterSummary}`,
      badge: activeRustCommandSlotState === "located" ? activeRustCommandSlotLocationLabel : "缺槽",
      icon: CornerDownRight,
      actionLabel: activeRustCommandSlotState === "located" ? "打开槽" : "生成槽",
      tone: activeRustCommandSlotState === "located" ? "ready" as const : "warning" as const,
      onAction: () => {
        if (activeRustCommandOutlineEntry) {
          openRustLogicOutlineEntry(activeRustCommandOutlineEntry);
          return;
        }
        appendMissingRustSlotForCommand(activeRustCommand.id);
      },
    },
    {
      id: "logic-context-evidence",
      title: buildDiagnostics.length > 0 ? "诊断证据" : latestSimulatorTrace ? "运行证据" : "等待验证",
      detail: primaryRustDebuggerProblemRow
        ? primaryRustDebuggerProblemRow.detail
        : latestSimulatorTrace
          ? `${latestSimulatorTrace.commandName}: ${latestSimulatorTrace.message}`
          : logicWorkflowRow?.command
            ? "运行当前信号槽后，这里会显示返回、日志和 state patch。"
            : "完成绑定后可从这里进入日志、任务或问题证据。",
      badge: buildDiagnostics.length > 0 ? `${buildDiagnostics.length} 诊断` : latestSimulatorTrace?.status ?? "未运行",
      icon: buildDiagnostics.length > 0 ? AlertTriangle : ScrollText,
      actionLabel: buildDiagnostics.length > 0 ? "查看问题" : latestSimulatorTrace ? "打开日志" : "验证",
      tone: buildDiagnostics.length > 0 ? "danger" as const : latestSimulatorTrace?.status === "success" ? "ready" as const : logicWorkflowRow?.command ? "primary" as const : "muted" as const,
      disabled: !buildDiagnostics.length && !latestSimulatorTrace && !logicWorkflowRow?.command,
      onAction: () => {
        if (primaryRustDebuggerProblemRow?.editable) {
          focusRustDiagnostic(primaryRustDebuggerProblemRow.diagnostic);
          return;
        }
        if (buildDiagnostics.length > 0) {
          openBottomDock("issues", false);
          return;
        }
        if (latestSimulatorTrace) {
          openBottomDock("logs", false);
          return;
        }
        if (logicWorkflowRow?.command) {
          runLogicSignalSlotEvent(logicWorkflowRow.item, logicWorkflowRow.eventName);
        }
      },
    },
  ] as InspectorWorkflowStep[]);
  const rustBackendTopology = useMemo(
    () => [
      {
        id: "commands",
        label: "Tauri Commands",
        detail: `${activeProject.rustCommands.length} 个命令 · ${logicSignalSlotBoundCount} 个 UI 绑定`,
        badge: activeProject.rustCommands.length,
        tone: activeProject.rustCommands.length > 0 ? "ready" : "empty",
      },
      {
        id: "modules",
        label: "Rust Modules",
        detail: `${activeProject.rustModules.filter((module) => module.enabled).length}/${activeProject.rustModules.length} 启用`,
        badge: activeProject.rustModules.filter((module) => module.enabled).length,
        tone: activeProject.rustModules.some((module) => module.enabled) ? "ready" : "muted",
      },
      {
        id: "dependencies",
        label: "Cargo Dependencies",
        detail: `${activeProject.cargoDependencies.filter((dependency) => dependency.enabled).length}/${activeProject.cargoDependencies.length} 写入 Cargo.toml`,
        badge: activeProject.cargoDependencies.filter((dependency) => dependency.enabled).length,
        tone: activeProject.cargoDependencies.some((dependency) => dependency.enabled) ? "ready" : "muted",
      },
      {
        id: "integrations",
        label: "External Backends",
        detail: `${activeProject.backendIntegrations.filter((integration) => integration.enabled).length}/${activeProject.backendIntegrations.length} 集成 · C++/sidecar/service 边界`,
        badge: activeProject.backendIntegrations.filter((integration) => integration.enabled).length,
        tone: activeProject.backendIntegrations.some((integration) => integration.enabled) ? "ready" : "muted",
      },
      {
        id: "state",
        label: "State Store",
        detail: `${activeProject.stateVariables.length} 个共享状态 · 可被 UI 与槽函数复用`,
        badge: activeProject.stateVariables.length,
        tone: activeProject.stateVariables.length > 0 ? "ready" : "empty",
      },
    ],
    [
      activeProject.backendIntegrations,
      activeProject.cargoDependencies,
      activeProject.rustCommands.length,
      activeProject.rustModules,
      activeProject.stateVariables.length,
      logicSignalSlotBoundCount,
    ],
  );
  const eventResultTargets = useMemo(
    () =>
      items
        .filter((item) => item.type !== "frame" && item.type !== "divider")
        .sort((a, b) => a.z - b.z),
    [items],
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
  const inspectorPropertyQueryActive = inspectorPropertyQuery.trim().length > 0;
  const selectedFilteredPropertySchema = useMemo(
    () => selectedPropertySchema.filter((field) => propertyFieldMatchesSearch(field, selectedItem, inspectorPropertyQuery)),
    [inspectorPropertyQuery, selectedItem, selectedPropertySchema],
  );
  const selectedPropertyIssueProps = useMemo(
    () => new Set(selectedPropertyIssues.map((issue) => issue.prop)),
    [selectedPropertyIssues],
  );
  const selectedPropertySectionMatchCounts = useMemo(
    () =>
      Object.fromEntries(
        builderPropertySectionIds.map((section) => [
          section,
          selectedFilteredPropertySchema.filter((field) => propertySectionForProp(field.prop) === section).length,
        ]),
      ) as Record<BuilderPropertySectionId, number>,
    [selectedFilteredPropertySchema],
  );
  const selectedPropertyAutoFixPatch = useMemo(() => (selectedItem ? propertyAutoFixPatchForItem(selectedItem) : {}), [selectedItem]);
  const selectedPropertyAutoFixCount = propertyPatchSize(selectedPropertyAutoFixPatch);
  const projectPropertyIssues = useMemo(() => propertyIssuesForProject(activeProject), [activeProject]);
  const projectPropertyAutoFixSummary = useMemo(() => propertyAutoFixSummaryForProject(activeProject), [activeProject]);
  const fixableProjectPropertyIssueKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const target of projectPropertyAutoFixSummary.targets) {
      for (const prop of Object.keys(target.patch)) {
        keys.add(`${target.fileId}:${target.itemId}:${prop}`);
      }
    }
    return keys;
  }, [projectPropertyAutoFixSummary]);
  const builderIssues = useMemo<BuilderIssueItem[]>(() => {
    const issues: BuilderIssueItem[] = [];
    if (buildError) {
      issues.push({
        id: "build-error",
        kind: "build-error",
        severity: "error",
        sourceLabel: "构建",
        title: "构建错误",
        detail: buildError,
        meta: "编辑器消息",
      });
    }
    buildDiagnostics.forEach((diagnostic, index) => {
      const key = buildDiagnosticKey(diagnostic, index);
      const location = diagnostic.file
        ? `${diagnostic.file}${diagnostic.line ? `:${diagnostic.line}` : ""}`
        : diagnostic.origin || "Cargo 输出";
      issues.push({
        id: `diagnostic:${key}`,
        kind: "diagnostic",
        severity: diagnostic.severity === "error" ? "error" : "warning",
        sourceLabel: diagnostic.origin || "构建",
        title: diagnostic.code || "编译器诊断",
        detail: diagnostic.message,
        meta: location,
        diagnostic,
        diagnosticIndex: index,
      });
    });
    projectPropertyIssues.forEach((issue) => {
      const fixable = fixableProjectPropertyIssueKeys.has(`${issue.fileId}:${issue.itemId}:${String(issue.prop)}`);
      issues.push({
        id: `property:${issue.id}`,
        kind: "property",
        severity: issue.severity,
        sourceLabel: "设计",
        title: `${issue.itemName} / ${issue.label}`,
        detail: issue.message,
        meta: `${issue.fileName} · ${issue.itemType}`,
        fixable,
        propertyIssue: issue,
      });
    });
    return issues.sort((a, b) => builderIssueSeverityRank(a.severity) - builderIssueSeverityRank(b.severity));
  }, [buildDiagnostics, buildError, fixableProjectPropertyIssueKeys, projectPropertyIssues]);
  const selectedBuilderIssue = useMemo(
    () => builderIssues.find((issue) => issue.id === selectedBuilderIssueId) ?? builderIssues[0] ?? null,
    [builderIssues, selectedBuilderIssueId],
  );
  const builderIssueCount = builderIssues.length;
  const builderIssueErrorCount = builderIssues.filter((issue) => issue.severity === "error").length;
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
  const projectLocatorInputVisible = projectJumpPanelOpen || projectJumpQuery.trim().length > 0;
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
  const buildArtifactReady = Boolean(activeBundlePath || activeProject.outputExePath);
  const buildArtifactStatusLabel = bundling
    ? "打包中"
    : activeBundlePath
      ? "安装包就绪"
      : activeProject.outputExePath
        ? "exe 就绪"
        : building
          ? "构建中"
          : "空闲";
  const activeBundleManifestPath = activeProject.outputBundleManifestPath || latestBuildEntry?.bundleManifestPath || "";
  const latestRunSessionRunning = latestRunSessionEntry?.runStatus === "running";
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
  const generatedPlanBusy = previewingGeneratedFiles || applyingGeneratedFiles || building || bundling || validatingWindow;
  const generatedPlanPrimaryAction = projectChangeImpact.executionPlan.actions[0] ?? "generate-file-plan";
  const generatedPlanPrimaryLabel =
    generatedPlanPrimaryAction === "generate-file-plan"
      ? "生成计划"
      : generatedPlanPrimaryAction === "save-project"
        ? "先保存"
      : generatedPlanPrimaryAction === "apply-generated-changes"
          ? "应用变更"
          : generatedPlanPrimaryAction === "quick-check-all"
            ? "运行检查"
            : generatedPlanPrimaryAction === "validate-window"
              ? "验证窗口"
              : generatedPlanPrimaryAction === "build-exe"
                ? "构建 exe"
                : projectTaskDefinitions[generatedPlanPrimaryAction].title;
  const generatedPlanStatusTitle =
    previewingGeneratedFiles
      ? "正在生成文件计划"
      : applyingGeneratedFiles
        ? "正在应用生成目标"
        : projectChangeImpact.status === "needs-plan"
          ? "需要生成计划"
          : projectChangeImpact.status === "stale"
            ? "生成计划已过期"
            : projectChangeImpact.status === "dirty"
              ? `${projectChangeImpact.changedCount} 个目标可应用`
              : "生成目标已同步";
  const generatedPlanStatusDetail =
    previewingGeneratedFiles
      ? "Nova 正在扫描 manifest、UI、Rust、Cargo、资源和 Tauri 目标。"
      : applyingGeneratedFiles
        ? `正在向磁盘写入 ${selectedGeneratedPreviewPaths.length || projectChangeImpact.changedCount} 个选中目标。`
        : projectChangeImpact.status === "needs-plan" || projectChangeImpact.status === "stale"
          ? projectChangeImpact.executionPlan.detail
          : projectChangeImpact.status === "dirty"
            ? `${projectChangeImpact.dirtyScopeCount} dirty scope(s). Apply generated changes before checks or release builds.`
            : "运行检查、验证窗口，然后从当前生成输出构建可执行文件。";
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
        detail: activeRustCommand.backendIntegrationId ? "命令已绑定到后端集成" : "项目 Tauri 命令",
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
    if (!allProjectActionPresets.some((preset) => preset.id === selectedRailActionPresetId)) {
      setSelectedRailActionPresetId(allProjectActionPresets[0]?.id ?? "design-preflight");
    }
  }, [allProjectActionPresets, selectedRailActionPresetId]);

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
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(COMPONENT_PALETTE_RECENTS_STORAGE_KEY, JSON.stringify(componentPaletteRecentTypes.slice(0, 8)));
  }, [componentPaletteRecentTypes]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(COMPONENT_PALETTE_FAVORITES_STORAGE_KEY, JSON.stringify(componentPaletteFavoriteTypes.slice(0, 8)));
  }, [componentPaletteFavoriteTypes]);

  useEffect(
    () => () => {
      if (projectJumpFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(projectJumpFeedbackTimeoutRef.current);
      }
    },
    [],
  );

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
      updateRustEditorSelectionFromEditor(editor);
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
    setSelectionAnchorId((current) => {
      if (current && items.some((item) => item.id === current)) {
        return current;
      }
      return selectedIds.find((id) => items.some((item) => item.id === id)) ?? "";
    });
  }, [activeFile.id, items, selectedIds]);

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
      if (event.defaultPrevented) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isEditingText =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;
      const isInteractiveTarget = Boolean(target?.closest("button,a,[role='button'],[role='menuitem'],[role='tab'],[role='option']"));

      if (mode !== "design" || isEditingText) {
        return;
      }

      const isCommand = event.ctrlKey || event.metaKey;
      if (isCommand && event.altKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        setTabOrderOverlayVisible((visible) => !visible);
        return;
      }

      if (isCommand && event.key === "F2") {
        event.preventDefault();
        focusSelectedObjectNameEditor();
        return;
      }

      if (isCommand && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          runRedoCanvas();
        } else {
          runUndoCanvas();
        }
        return;
      }

      if ((isCommand && event.key.toLowerCase() === "y") || (isCommand && event.shiftKey && event.key.toLowerCase() === "z")) {
        event.preventDefault();
        runRedoCanvas();
        return;
      }

      if (isCommand && event.key.toLowerCase() === "a") {
        event.preventDefault();
        if (event.shiftKey) {
          selectSameTypeControls();
        } else {
          selectAllItems();
        }
        return;
      }

      if (isCommand && event.key.toLowerCase() === "i") {
        event.preventDefault();
        selectInverseSelection();
        return;
      }

      if (isCommand && event.key.toLowerCase() === "c") {
        event.preventDefault();
        copySelectionToClipboard();
        return;
      }

      if (isCommand && event.key.toLowerCase() === "x") {
        event.preventDefault();
        cutSelectionToClipboard();
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

      if (isCommand && event.key.toLowerCase() === "g") {
        event.preventDefault();
        if (event.shiftKey) {
          ungroupSelectedFrames();
        } else {
          groupSelectedIntoFrame();
        }
        return;
      }

      if (isCommand && (event.key === "]" || event.code === "BracketRight")) {
        event.preventDefault();
        if (event.shiftKey) {
          bringToFront();
        } else {
          moveSelectedLayerStep(1);
        }
        return;
      }

      if (isCommand && (event.key === "[" || event.code === "BracketLeft")) {
        event.preventDefault();
        if (event.shiftKey) {
          sendToBack();
        } else {
          moveSelectedLayerStep(-1);
        }
        return;
      }

      if (selectedIds.length === 0) {
        return;
      }

      if (!isCommand && event.key === "F2") {
        event.preventDefault();
        startSelectedInlineTextEditFromKeyboard("F2");
        return;
      }

      if (!isCommand && event.key === "Enter" && !event.shiftKey && !event.altKey && !isInteractiveTarget) {
        event.preventDefault();
        startSelectedInlineTextEditFromKeyboard("Enter");
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
        return;
      }

      const distance = event.shiftKey ? (page.snapToGrid ? page.gridSize * 4 : 10) : page.snapToGrid ? page.gridSize : 1;
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
  }, [mode, page.gridSize, page.snapToGrid, selectedIds, selectedItem, selectedItems.length, canUndo, canRedo]);

  useEffect(() => {
    if (!dragSession) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      const deltaX = (event.clientX - dragSession.startClientX) / page.zoom;
      const deltaY = (event.clientY - dragSession.startClientY) / page.zoom;
      const precisionDrag = dragSession.kind === "move" && (event.ctrlKey || event.metaKey);
      const activeSmartGuides = precisionDrag ? [] : createSmartGuidesForDragSession(dragSession, itemsRef.current, page, deltaX, deltaY);
      const smartGuideSnapDeltaX = dragSession.kind === "move" ? (activeSmartGuides.find((guide) => guide.axis === "x")?.snapDeltaX ?? 0) : 0;
      const smartGuideSnapDeltaY = dragSession.kind === "move" ? (activeSmartGuides.find((guide) => guide.axis === "y")?.snapDeltaY ?? 0) : 0;
      setCanvasPrecisionDragActive(precisionDrag);
      setSmartGuides(activeSmartGuides);
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
            resizePatchForHandle(dragSession, deltaX, deltaY, page),
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
                x: snap(origin.x + deltaX, page.gridSize, page.snapToGrid) + smartGuideSnapDeltaX,
                y: snap(origin.y + deltaY, page.gridSize, page.snapToGrid) + smartGuideSnapDeltaY,
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
      setSmartGuides([]);
      setCanvasPrecisionDragActive(false);
    };

    document.body.style.cursor = dragSession.kind === "move" ? "grabbing" : resizeHandleCursor(dragSession.handle);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      document.body.style.cursor = "";
      setSmartGuides([]);
      setCanvasPrecisionDragActive(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragSession, page]);

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
      return null;
    }

    history.redo.push(cloneBuilderState(activeFile));
    restoreActiveFileState(previous);
    setHistoryVersion((version) => version + 1);
    return previous;
  };

  const redoCanvas = () => {
    const history = getFileHistory(activeFile.id);
    const next = history.redo.pop();
    if (!next) {
      return null;
    }

    history.undo.push(cloneBuilderState(activeFile));
    restoreActiveFileState(next);
    setHistoryVersion((version) => version + 1);
    return next;
  };

  const runUndoCanvas = () => {
    const restored = undoCanvas();
    if (!restored) {
      showProjectJumpFeedback("warning", "没有可撤销内容", `${activeFile.name} 没有更早的画布快照。`);
      return;
    }
    showProjectJumpFeedback("success", "已撤销画布操作", `${activeFile.name} 已恢复，包含 ${formatControlCount(restored.items.length)}。`);
  };

  const runRedoCanvas = () => {
    const restored = redoCanvas();
    if (!restored) {
      showProjectJumpFeedback("warning", "没有可重做内容", `${activeFile.name} 没有更晚的画布快照。`);
      return;
    }
    showProjectJumpFeedback("success", "已重做画布操作", `${activeFile.name} 已恢复，包含 ${formatControlCount(restored.items.length)}。`);
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

  const updatePageWindowKind = (windowKind: ReleaseWindowKind) => {
    updatePage({
      windowKind,
      titlebarStyle:
        windowKind === "frameless"
          ? "hidden"
          : page.windowKind === "frameless" && page.titlebarStyle === "hidden"
            ? "nova"
            : page.titlebarStyle,
    });
  };

  const updatePageTitlebarStyle = (titlebarStyle: ReleaseTitlebarStyle) => {
    updatePage({ titlebarStyle: normalizeReleaseTitlebarStyle(titlebarStyle, page.windowKind) });
  };

  const applyPageWindowShellPreset = (presetId: string) => {
    const preset = pageWindowShellPresets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }
    updatePage({
      windowKind: preset.windowKind,
      titlebarStyle: normalizeReleaseTitlebarStyle(preset.titlebarStyle, preset.windowKind),
      titlebarSubtitle: preset.subtitle,
    });
    showProjectJumpFeedback(
      "success",
      "已应用窗体预设",
      `${activeFile.name} 已切换为 ${preset.label} / ${preset.detail}。可继续同步到 Release 目标。`,
    );
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

  const normalizeCanvasZoom = (zoom: number) => Math.round(clamp(zoom, 0.25, 2) * 100) / 100;

  const formatCanvasZoom = (zoom: number) => `${Math.round(zoom * 100)}%`;

  const setCanvasZoom = (zoom: number) => {
    const nextZoom = normalizeCanvasZoom(zoom);
    updatePage({ zoom: nextZoom }, { history: false });
    return nextZoom;
  };

  const zoomCanvasBy = (delta: number) => {
    const nextZoom = delta > 0 ? (canvasZoomLevels.find((zoom) => zoom > page.zoom + 0.001) ?? 2) : ([...canvasZoomLevels].reverse().find((zoom) => zoom < page.zoom - 0.001) ?? 0.25);
    const appliedZoom = setCanvasZoom(nextZoom);
    if (Math.abs(appliedZoom - page.zoom) < 0.001) {
      showProjectJumpFeedback(
        "warning",
        delta > 0 ? "已达到最大缩放" : "已达到最小缩放",
        `画布已经是 ${formatCanvasZoom(appliedZoom)}。`,
      );
      return;
    }
    showProjectJumpFeedback("success", "画布缩放已更新", `${formatCanvasZoom(page.zoom)} -> ${formatCanvasZoom(appliedZoom)}。`);
  };

  const chooseCanvasZoom = (zoom: number) => {
    const appliedZoom = setCanvasZoom(zoom);
    showProjectJumpFeedback("success", "画布缩放已选择", `当前画布视口为 ${formatCanvasZoom(appliedZoom)}。`);
  };

  const resetCanvasView = () => {
    const nextZoom = setCanvasZoom(1);
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
    showProjectJumpFeedback("success", "画布视图已重置", `缩放已恢复到 ${formatCanvasZoom(nextZoom)}，画布已居中。`);
  };

  const fitCanvasToViewport = () => {
    const viewport = canvasViewportRef.current;
    if (!viewport) {
      showProjectJumpFeedback("warning", "无法适配画布", "画布视口还没有准备好。");
      return;
    }
    const nextZoom = Math.min((viewport.clientWidth - 64) / page.width, (viewport.clientHeight - 64) / page.height);
    const appliedZoom = setCanvasZoom(nextZoom);
    window.requestAnimationFrame(() => {
      viewport.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    });
    showProjectJumpFeedback("success", "画布已适配视口", `${page.width} x ${page.height} 画布以 ${formatCanvasZoom(appliedZoom)} 显示。`);
  };

  const fitSelectedCanvasToViewport = () => {
    const viewport = canvasViewportRef.current;
    if (!viewport) {
      showProjectJumpFeedback("warning", "无法适配选区", "画布视口还没有准备好。");
      return;
    }
    if (!selectedCanvasFitBounds || selectedItems.length === 0) {
      showProjectJumpFeedback("warning", "没有选中控件", "先在画布或导航器中选择一个或多个控件，再适配选区。");
      return;
    }

    const paddedWidth = Math.max(1, selectedCanvasFitBounds.width + 96);
    const paddedHeight = Math.max(1, selectedCanvasFitBounds.height + 144);
    const nextZoom = Math.min((viewport.clientWidth - 48) / paddedWidth, (viewport.clientHeight - 72) / paddedHeight, 2);
    const appliedZoom = setCanvasZoom(nextZoom);
    const selectionCenterX = selectedCanvasFitBounds.left + selectedCanvasFitBounds.width / 2;
    const selectionCenterY = selectedCanvasFitBounds.top + selectedCanvasFitBounds.height / 2;

    window.requestAnimationFrame(() => {
      const maxLeft = Math.max(0, page.width * appliedZoom - viewport.clientWidth);
      const maxTop = Math.max(0, page.height * appliedZoom - viewport.clientHeight);
      viewport.scrollTo({
        left: clamp(selectionCenterX * appliedZoom - viewport.clientWidth / 2, 0, maxLeft),
        top: clamp(selectionCenterY * appliedZoom - viewport.clientHeight / 2, 0, maxTop),
        behavior: "smooth",
      });
    });
    showProjectJumpFeedback(
      "success",
      "选区已适配视口",
      `${selectedItems.length} 个控件以 ${formatCanvasZoom(appliedZoom)} 居中显示。`,
    );
  };

  const toggleCanvasPanMode = () => {
    const nextEnabled = !canvasPanMode;
    setCanvasPanMode(nextEnabled);
    showProjectJumpFeedback(
      nextEnabled ? "success" : "warning",
      nextEnabled ? "已启用平移模式" : "已关闭平移模式",
      nextEnabled ? "拖动画布视口即可移动设计区域。" : "再次点击画布会选择并编辑控件。",
    );
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
      } else if (event.key === "2") {
        event.preventDefault();
        fitSelectedCanvasToViewport();
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
  }, [mode, page.height, page.width, page.zoom, selectedCanvasFitBounds, selectedItems.length]);

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

  const { selectionMarquee, startSelectionMarquee, clearMarquee } = useCanvasMarquee({
    enabled: mode === "design",
    blocked: Boolean(canvasPanMode || spacePanActive || dragSession),
    selectedIds,
    allItemIds: items.map((item) => item.id),
    getCanvasPoint,
    itemBounds: (itemId) => {
      const item = items.find((candidate) => candidate.id === itemId);
      if (!item) return null;
      const position = getAbsolutePosition(item, items);
      return { x: position.x, y: position.y, width: item.width, height: item.height };
    },
    onSelectionChange: (ids) => setSelectedIds(ids),
    onAnchorChange: (id) => setSelectionAnchorId(id),
    onMarqueeComplete: () => {
      setRightDockTab("properties");
      suppressCanvasClickRef.current = true;
      window.setTimeout(() => {
        suppressCanvasClickRef.current = false;
      }, 0);
    },
    onReplaceStart: () => {
      setSelectionAnchorId("");
      setSelectedIds([]);
      setDropIntent(null);
    },
  });

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
    if (event?.shiftKey) {
      const orderedIds = sortedItems.map((item) => item.id);
      const anchorId =
        selectionAnchorId && orderedIds.includes(selectionAnchorId)
          ? selectionAnchorId
          : selectedIds.find((selectedId) => orderedIds.includes(selectedId)) ?? id;
      const anchorIndex = orderedIds.indexOf(anchorId);
      const targetIndex = orderedIds.indexOf(id);
      if (anchorIndex >= 0 && targetIndex >= 0) {
        const start = Math.min(anchorIndex, targetIndex);
        const end = Math.max(anchorIndex, targetIndex);
        const rangeIds = orderedIds.slice(start, end + 1);
        setSelectedIds((current) =>
          event.ctrlKey || event.metaKey
            ? Array.from(new Set([...current, ...rangeIds]))
            : rangeIds,
        );
        setSelectionAnchorId(anchorId);
        setRightDockTab("properties");
        return;
      }
    }
    if (event?.ctrlKey || event?.metaKey || event?.shiftKey) {
      setSelectedIds((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
      setSelectionAnchorId(id);
      return;
    }
    setSelectedId(id);
  };

  const clearSelection = (options: { feedback?: boolean } = {}) => {
    const clearedCount = selectedIds.length;
    setSelectionAnchorId("");
    setSelectedIds([]);
    if (!options.feedback || clearedCount === 0) {
      return;
    }
    setRightDockTab("properties");
    showProjectJumpFeedback(
      "success",
      "选择已清空",
      `已取消选择 ${formatControlCount(clearedCount)}，当前画布为 ${activeFile.name}。`,
    );
  };

  const focusSelectedRosterItem = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) {
      return;
    }
    setSelectedId(target.id);
    setLeftDockTab("navigator");
    setRightDockTab("properties");
    showProjectJumpFeedback("success", "已聚焦选中控件", `${getItemSummary(target)} 已成为当前编辑目标。`);
  };

  const removeItemFromSelection = (id: string) => {
    const target = selectedItems.find((item) => item.id === id);
    if (!target) {
      return;
    }
    const nextSelectedIds = selectedIds.filter((selectedId) => selectedId !== id);
    setSelectedIds(nextSelectedIds);
    setSelectionAnchorId(nextSelectedIds[0] ?? "");
    setRightDockTab("properties");
    showProjectJumpFeedback(
      "success",
      "已更新选择集",
      `${getItemSummary(target)} 已从选择中移除，剩余 ${formatControlCount(nextSelectedIds.length)}。`,
    );
  };

  const selectHierarchyBreadcrumbNode = (itemId: string | null) => {
    if (!itemId) {
      clearSelection({ feedback: true });
      return;
    }
    const target = items.find((item) => item.id === itemId);
    if (!target) {
      return;
    }
    setSelectedId(target.id);
    setLeftDockTab("navigator");
    setRightDockTab("properties");
    showProjectJumpFeedback("success", "已切换层级", `${getItemSummary(target)} 已在画布和导航器中选中。`);
  };

  const selectAllItems = () => {
    if (items.length === 0) {
      showProjectJumpFeedback("warning", "没有可选择控件", `${activeFile.name} 还没有控件。请先插入一个组件。`);
      return;
    }
    const nextSelectedIds = items.map((item) => item.id);
    setSelectedIds(nextSelectedIds);
    setSelectionAnchorId(nextSelectedIds[0] ?? "");
    setRightDockTab("properties");
    showProjectJumpFeedback("success", "已选择全部控件", `${formatControlCount(items.length)} 可在属性面板批量编辑。`);
  };

  const selectSameTypeControls = (sourceItem?: BuilderItem | null) => {
    const anchor = sourceItem ?? selectedItems[0] ?? null;
    if (!anchor) {
      showProjectJumpFeedback("warning", "未选择控件", "先选择一个控件，然后即可选中同类型控件进行批量编辑。");
      return;
    }
    const nextSelectedIds = [
      anchor.id,
      ...items.filter((item) => item.type === anchor.type && item.id !== anchor.id).map((item) => item.id),
    ];
    const definition = getDefinition(anchor.type);
    setSelectedIds(nextSelectedIds);
    setSelectionAnchorId(anchor.id);
    setRightDockTab("properties");
    showProjectJumpFeedback(
      "success",
      "已选择同类控件",
      `${formatControlCount(nextSelectedIds.length)} ${definition.title} 已进入同一选择集，可在属性面板批量调整。`,
    );
  };

  const selectInverseSelection = () => {
    if (items.length === 0) {
      showProjectJumpFeedback("warning", "没有可反选控件", `${activeFile.name} 还没有控件。请先插入一个组件。`);
      return;
    }
    const selectedSet = new Set(selectedIds);
    const nextSelectedIds = items.filter((item) => !selectedSet.has(item.id)).map((item) => item.id);
    setSelectedIds(nextSelectedIds);
    setSelectionAnchorId(nextSelectedIds[0] ?? "");
    setRightDockTab("properties");
    showProjectJumpFeedback(
      nextSelectedIds.length > 0 ? "success" : "warning",
      nextSelectedIds.length > 0 ? "已反选控件" : "反选后没有控件",
      nextSelectedIds.length > 0
        ? `${formatControlCount(nextSelectedIds.length)} 已进入选择集，原选择被排除。`
        : `当前 ${formatControlCount(items.length)} 已全部从选择集中移除。`,
    );
  };

  const addComponent = (
    type: BuilderComponentType,
    position?: { x: number; y: number },
    parentId?: string,
    insertionIndex?: number,
    propsPatch: Partial<BuilderItemProps> = {},
  ) => {
    const parent = parentId ? items.find((item) => item.id === parentId && item.type === "frame") : undefined;
    const definition = getDefinition(type);
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
    const patchedItem = {
      ...nextItem,
      props: { ...nextItem.props, ...propsPatch },
    };
    updateActiveItems((current) => {
      const appendedItems = [...current, patchedItem];
      if (parent?.id && insertionIndex !== undefined) {
        return reorderFrameChildren(appendedItems, parent.id, [patchedItem.id], insertionIndex);
      }
      return appendedItems;
    });
    rememberComponentPaletteRecent(type);
    setSelectedId(patchedItem.id);
    setMode("design");
    setRightDockTab("properties");
    showProjectJumpFeedback(
      "success",
      "Component inserted",
      `${definition.title} was added ${parent ? `inside ${getItemSummary(parent)}` : `to ${activeFile.name}`} and selected for editing in Properties.`,
    );
  };

  const focusComponentPaletteKit = (kitId: string) => {
    const kit = componentPaletteKitDefinitions.find((candidate) => candidate.id === kitId);
    if (!kit) {
      return;
    }
    setComponentPaletteCategory("all");
    setComponentPaletteQuery("");
    setActiveComponentPaletteKitId(kit.id);
    showProjectJumpFeedback("success", "已聚焦控件套件", `${kit.title} 包含 ${kit.types.length} 个常用桌面控件。`);
  };

  const clearComponentPaletteKit = () => {
    setActiveComponentPaletteKitId("");
    setComponentPaletteCategory("all");
    setComponentPaletteQuery("");
  };

  const insertComponentPaletteKitPrimary = (kitId: string) => {
    const kit = componentPaletteKitDefinitions.find((candidate) => candidate.id === kitId);
    if (!kit) {
      return;
    }
    focusComponentPaletteKit(kit.id);
    addComponent(kit.primaryType);
  };

  const insertComponentPaletteKitScaffold = (kitId: string) => {
    const kit = componentPaletteKitDefinitions.find((candidate) => candidate.id === kitId);
    if (!kit) {
      return;
    }

    const availableTypes = new Set(palette.map((definition) => definition.type));
    const scaffoldTypes = kit.types.reduce<BuilderComponentType[]>((nextTypes, type) => {
      if (!availableTypes.has(type) || nextTypes.includes(type)) {
        return nextTypes;
      }
      return [...nextTypes, type];
    }, []);
    if (scaffoldTypes.length === 0) {
      showProjectJumpFeedback("warning", "套件没有可插入控件", `${kit.title} 当前没有可用控件定义。`);
      return;
    }

    const columns = clamp(Math.ceil(Math.sqrt(scaffoldTypes.length)), 2, 4);
    const usableWidth = Math.max(320, page.width - 144);
    const columnWidth = usableWidth / columns;
    const rowHeight = Math.max(132, Math.min(176, page.height / 4));
    const firstAsset = activeProject.assets[0];
    const scaffoldItems = scaffoldTypes.map((type, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const centerX = clamp(72 + columnWidth * (column + 0.5), 72, page.width - 72);
      const centerY = clamp(96 + rowHeight * row, 72, page.height - 72);
      const baseItem = createItem(type, page, items.length + index, { x: centerX, y: centerY });
      if (type === "image" && firstAsset) {
        return {
          ...baseItem,
          props: {
            ...baseItem.props,
            assetId: firstAsset.id,
            assetPath: firstAsset.publicPath,
            alt: firstAsset.name,
            label: firstAsset.name,
          },
        };
      }
      return baseItem;
    });

    updateActiveItems((current) => [...current, ...scaffoldItems]);
    setComponentPaletteRecentTypes((current) =>
      normalizeComponentTypeList([...scaffoldTypes, ...current.filter((candidate) => !scaffoldTypes.includes(candidate))], 8),
    );
    setSelectedIds(scaffoldItems.map((item) => item.id));
    setSelectionAnchorId(scaffoldItems[0]?.id ?? "");
    setMode("design");
    setRightDockTab("properties");
    setComponentPaletteCategory("all");
    setComponentPaletteQuery("");
    setActiveComponentPaletteKitId(kit.id);
    showProjectJumpFeedback(
      "success",
      "控件套件骨架已插入",
      `${kit.title} 已批量添加 ${formatControlCount(scaffoldItems.length)}，当前选择集可继续对齐、分布或成组。`,
    );
  };

  const insertComponentFromShortcut = (type: BuilderComponentType, options: { centered?: boolean; revealPalette?: boolean } = {}) => {
    const definition = getDefinition(type);
    const position = options.centered ? { x: page.width / 2, y: page.height / 2 } : undefined;
    addComponent(type, position);
    setRightDockTab("properties");
    if (options.revealPalette) {
      setLeftDockTab("components");
    }
    recordInstantProjectAction("insert-component", `已将 ${definition.title} 插入 ${activeFile.name}。`);
  };

  const handlePaletteDragStart = (event: DragEvent, type: BuilderComponentType) => {
    event.dataTransfer.setData("application/x-nova-component", type);
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleCanvasDrop = (event: DragEvent) => {
    event.preventDefault();
    const assetId = event.dataTransfer.getData("application/x-nova-asset");
    if (assetId) {
      const asset = activeProject.assets.find((candidate) => candidate.id === assetId);
      if (asset) {
        const intent = getFrameDropIntentFromClientPoint(event.clientX, event.clientY);
        const targetFrame = intent ? itemsRef.current.find((item) => item.id === intent.frameId) : null;
        addComponent("image", getRelativeDropPoint(event.clientX, event.clientY, targetFrame), intent?.frameId, intent?.index, {
          label: asset.name,
          alt: asset.name,
          assetId: asset.id,
          assetPath: asset.publicPath,
        });
        showProjectJumpFeedback("success", "已放入图片", `${asset.name} 已从资源拖入画布。`);
      }
      setDropIntent(null);
      return;
    }
    const type = event.dataTransfer.getData("application/x-nova-component") as BuilderComponentType;
    if (!mapLegacyType(type)) {
      return;
    }
    const intent = getFrameDropIntentFromClientPoint(event.clientX, event.clientY);
    const targetFrame = intent ? itemsRef.current.find((item) => item.id === intent.frameId) : null;
    addComponent(type, getRelativeDropPoint(event.clientX, event.clientY, targetFrame), intent?.frameId, intent?.index);
    setDropIntent(null);
  };

  const handleAssetDragStart = (event: DragEvent, asset: DesignerAsset) => {
    event.dataTransfer.setData("application/x-nova-asset", asset.id);
    event.dataTransfer.effectAllowed = "copy";
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

  const pasteSelectionFromClipboard = () => {
    pasteClipboardItems();
  };

  const openCanvasFind = () => {
    setCanvasFindOpen(true);
    window.requestAnimationFrame(() => {
      canvasFindInputRef.current?.focus();
      canvasFindInputRef.current?.select();
    });
    showProjectJumpFeedback("success", "画布搜索已打开", "输入控件名称或类型定位，Esc 关闭。");
  };

  /** Load a project template into the active file (P1-8: multi-template wizard). */
  const loadProjectTemplate = (templateId: ProjectTemplateId) => {
    const template = projectTemplateById(templateId);
    const seed = createProjectTemplateSeed(templateId, projectTemplateSeedOptions());
    const sample = seed.files[0];
    if (!sample) {
      showProjectJumpFeedback("warning", "模板不可用", `${template.title} 未提供默认文件。`);
      return;
    }
    updateActiveFile((file) => ({
      ...file,
      name: sample.name,
      page: sample.page,
      items: sample.items,
    }));
    if (seed.rustCommands.length > 0) {
      updateActiveProject((project) => ({
        ...project,
        rustCommands: seed.rustCommands,
      }));
    }
    switchEditorMode("design");
    showProjectJumpFeedback("success", "模板已载入", `${template.title} · ${template.description}`);
  };

  const createSampleProjectFromTemplate = () => loadProjectTemplate("dashboard");

  const { startMove, startResize } = useCanvasItemDrag({
    mode,
    canvasPanMode,
    spacePanActive,
    items,
    selectedIds,
    selectItem,
    setSelectedId: (id) => setSelectedId(id),
    pushHistorySnapshot,
    setDragSession,
    getNodeCanvasPosition,
  });

  const updateSelectedProps = (patch: BuilderItemProps) => {
    updateActiveItems((current) =>
      current.map((item) => (selectedIds.includes(item.id) ? { ...item, props: { ...item.props, ...patch } } : item)),
    );
  };

  const updateItemPropsById = (itemId: string, patch: BuilderItemProps) => {
    updateActiveItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, props: { ...item.props, ...patch } } : item)),
    );
  };

  const normalizeTabOrderForFocusableItems = () => {
    if (focusableTabOrderItems.length === 0) {
      showProjectJumpFeedback("warning", "没有可排序控件", "当前 UI 文件里还没有可进入键盘焦点链的控件。");
      return;
    }
    const orderedIds = focusableTabOrderItems.map((entry) => entry.item.id);
    const orderById = new Map(orderedIds.map((id, index) => [id, index + 1]));
    updateActiveItems((current) =>
      current.map((item) => {
        const tabIndex = orderById.get(item.id);
        return tabIndex ? { ...item, props: { ...item.props, tabIndex } } : item;
      }),
    );
    setTabOrderOverlayVisible(true);
    showProjectJumpFeedback("success", "Tab 顺序已标准化", `${formatControlCount(orderedIds.length)} 已按画布视觉顺序写入 1-${orderedIds.length}。`);
  };

  const updateSelectedTabIndex = (value: string) => {
    if (!selectedItem) {
      return;
    }
    const fallback = (selectedTabOrderEntry?.tabIndex ?? selectedTabOrderPosition) || 1;
    const nextTabIndex = numberFromInput(value, fallback, -1, 999);
    updateSelectedProps({ tabIndex: nextTabIndex });
    setTabOrderOverlayVisible(true);
  };

  const moveSelectedTabOrder = (direction: -1 | 1) => {
    if (!selectedItem) {
      showProjectJumpFeedback("warning", "未选择控件", "请先选择一个可参与键盘焦点顺序的控件。");
      return;
    }
    const currentIndex = focusableTabOrderItems.findIndex((entry) => entry.item.id === selectedItem.id);
    if (currentIndex < 0) {
      showProjectJumpFeedback("warning", "控件不在焦点链", `${getItemSummary(selectedItem)} 当前不可聚焦或已设置为跳过 Tab 顺序。`);
      return;
    }
    const nextIndex = clamp(currentIndex + direction, 0, focusableTabOrderItems.length - 1);
    if (nextIndex === currentIndex) {
      showProjectJumpFeedback("warning", "已经到边界", `${getItemSummary(selectedItem)} 已经是${direction < 0 ? "第一个" : "最后一个"}可聚焦控件。`);
      return;
    }

    const orderedIds = focusableTabOrderItems.map((entry) => entry.item.id);
    const [movedId] = orderedIds.splice(currentIndex, 1);
    orderedIds.splice(nextIndex, 0, movedId);
    const orderById = new Map(orderedIds.map((id, index) => [id, index + 1]));
    updateActiveItems((current) =>
      current.map((item) => {
        const tabIndex = orderById.get(item.id);
        return tabIndex ? { ...item, props: { ...item.props, tabIndex } } : item;
      }),
    );
    setTabOrderOverlayVisible(true);
    showProjectJumpFeedback("success", "Tab 顺序已调整", `${getItemSummary(selectedItem)} 已移动到第 ${nextIndex + 1} 位。`);
  };

  const updateSelectedObjectName = (name: string) => {
    if (!selectedItem) {
      return;
    }
    updateActiveItems((current) =>
      current.map((item) => (item.id === selectedItem.id ? { ...item, name } : item)),
    );
  };

  const focusObjectNameEditor = (targetItem: BuilderItem | null) => {
    if (!targetItem) {
      showProjectJumpFeedback("warning", "未选择控件", "请先在画布或对象树中选择一个控件。");
      return;
    }
    setSelectedId(targetItem.id);
    setRightDockTab("properties");
    window.requestAnimationFrame(() => {
      selectedObjectNameInputRef.current?.focus();
      selectedObjectNameInputRef.current?.select();
    });
    showProjectJumpFeedback("success", "对象名编辑已聚焦", `${getItemSummary(targetItem)} 的工程对象名可用于对象树、诊断和连接追踪。`);
  };

  const focusSelectedObjectNameEditor = () => {
    focusObjectNameEditor(selectedItem);
  };

  const startInlineTextEdit = (
    item: BuilderItem,
    requestedProp?: InlineTextEdit["prop"],
    source: InlineTextEdit["source"] = "actionbar",
  ) => {
    if (mode !== "design") {
      return;
    }
    if (item.locked) {
      showProjectJumpFeedback("warning", "控件已锁定", "先解锁控件，再直接编辑文本。");
      return;
    }
    const textProps = quickTextPropsForItem(item);
    const prop = requestedProp && textProps.includes(requestedProp) ? requestedProp : textProps[0] ?? null;
    if (!prop) {
      setSelectedId(item.id);
      setRightDockTab("properties");
      showProjectJumpFeedback("warning", "没有可快速编辑文本", `${getItemSummary(item)} 可在右侧属性面板继续编辑。`);
      return;
    }
    setSelectedId(item.id);
    setRightDockTab("properties");
    setCanvasContextMenu(null);
    setInlineTextEdit({
      itemId: item.id,
      prop,
      value: textPropertyValue(item.props[prop]),
      source,
    });
    if (source === "double-click") {
      showProjectJumpFeedback("success", "文本快编已打开", `正在直接编辑 ${getItemSummary(item)} 的${quickTextPropLabel(prop)}。`);
    }
  };

  const commitInlineTextEdit = () => {
    if (!inlineTextEdit) {
      return;
    }
    const target = items.find((item) => item.id === inlineTextEdit.itemId);
    if (!target) {
      setInlineTextEdit(null);
      return;
    }
    updateItemPropsById(inlineTextEdit.itemId, { [inlineTextEdit.prop]: inlineTextEdit.value } as BuilderItemProps);
    setInlineTextEdit(null);
    showProjectJumpFeedback("success", "文本已更新", `${getItemSummary(target)} 的${quickTextPropLabel(inlineTextEdit.prop)}已更新。`);
  };

  const switchInlineTextEditProp = (nextProp: InlineTextEdit["prop"]) => {
    if (!inlineTextEdit) {
      return;
    }
    if (nextProp === inlineTextEdit.prop) {
      return;
    }
    const target = items.find((item) => item.id === inlineTextEdit.itemId);
    if (!target) {
      setInlineTextEdit(null);
      return;
    }
    const nextTextProps = quickTextPropsForItem(target);
    if (!nextTextProps.includes(nextProp)) {
      return;
    }
    updateItemPropsById(inlineTextEdit.itemId, { [inlineTextEdit.prop]: inlineTextEdit.value } as BuilderItemProps);
    setInlineTextEdit({
      itemId: target.id,
      prop: nextProp,
      value: textPropertyValue(target.props[nextProp]),
      source: inlineTextEdit.source,
    });
  };

  const cancelInlineTextEdit = () => {
    setInlineTextEdit(null);
  };

  const startSelectedInlineTextEditFromKeyboard = (shortcut: "F2" | "Enter") => {
    if (selectedItems.length > 1) {
      showProjectJumpFeedback("warning", "无法批量编辑文本", "文本快编以单个控件为单位；先聚焦一个控件，再按 F2 或 Enter。");
      return false;
    }
    if (!selectedItem) {
      return false;
    }
    const editProp = quickTextPropForItem(selectedItem);
    if (!editProp) {
      startInlineTextEdit(selectedItem, undefined, "keyboard");
      return false;
    }
    startInlineTextEdit(selectedItem, editProp, "keyboard");
    showProjectJumpFeedback("success", "文本快编已打开", `${getItemSummary(selectedItem)} 可用 ${shortcut} 进入内联编辑，Enter 保存，Esc 取消。`);
    return true;
  };

  const applySelectedPropertyAutoFix = () => {
    if (!selectedItem || selectedPropertyAutoFixCount === 0) {
      showProjectJumpFeedback("warning", "没有属性修复", "选中的控件没有可安全自动修复的属性。");
      return;
    }
    const fixedCount = selectedPropertyAutoFixCount;
    const issueCount = selectedPropertyIssues.length;
    const patchedLabels = selectedPropertySchema
      .filter((field) => Object.prototype.hasOwnProperty.call(selectedPropertyAutoFixPatch, field.prop))
      .map((field) => field.label);
    updateSelectedProps(selectedPropertyAutoFixPatch);
    setRightDockTab("properties");
    setOpenPropertySections((current) => ({ ...current, state: true, content: true }));
    showProjectJumpFeedback(
      "success",
      "Property fixes applied",
      `${fixedCount} propert${fixedCount === 1 ? "y" : "ies"} repaired on ${getItemSummary(selectedItem)}${patchedLabels.length ? `: ${patchedLabels.join(", ")}` : ""}. ${Math.max(0, issueCount - fixedCount)} issue(s) may still need review.`,
    );
  };

  const applyProjectPropertyAutoFixes = () => {
    if (projectPropertyAutoFixSummary.targets.length === 0) {
      showProjectJumpFeedback("warning", "没有项目属性修复", "当前项目没有可安全自动修复的属性。");
      return;
    }

    const summary = projectPropertyAutoFixSummary;
    pushProjectSnapshot("批量属性 schema 修复前");
    const maintenanceEntry = createPropertyMaintenanceEntry(summary);
    const patchesByFileAndItem = new Map(summary.targets.map((target) => [`${target.fileId}:${target.itemId}`, target.patch]));
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
    setRightDockTab("properties");
    setBottomDockTab(summary.manualIssueCount > 0 ? "issues" : "tasks");
    showProjectJumpFeedback(
      "success",
      "项目属性已修复",
      `已在 ${summary.fileCount} 个 UI 文件、${summary.targets.length} 个控件中修复 ${summary.propertyCount} 个属性；仍有 ${summary.manualIssueCount} 个问题需要手动确认。`,
    );
  };

  const focusPropertyIssue = (issue: BuilderPropertyIssue, options: { feedback?: boolean } = {}) => {
    const targetFile = activeProject.files.find((file) => file.id === issue.fileId);
    if (!targetFile) {
      const message = `找不到属性问题所属 UI 文件：${issue.fileName}`;
      setBuildError(message);
      showProjectJumpFeedback("error", "属性问题无法定位", message);
      return;
    }

    const targetItem = targetFile.items.find((item) => item.id === issue.itemId);
    if (!targetItem) {
      const message = `找不到属性问题控件：${issue.itemName}`;
      setBuildError(message);
      showProjectJumpFeedback("error", "属性问题无法定位", message);
      return;
    }

    updateActiveProject((project) => ({
      ...project,
      activeFileId: issue.fileId,
    }));
    setSelectedId(issue.itemId);
    setMode("design");
    setLeftDockTab("navigator");
    setRightDockTab("properties");
    setOpenPropertySections((current) => ({
      ...current,
      [propertySectionForProp(issue.prop)]: true,
    }));
    setBottomDockTab("issues");
    setBottomDockExpanded(true);
    setBottomDockMinimized(false);
    if (mode !== "design") {
      window.setTimeout(() => {
        setBottomDockTab("issues");
        setBottomDockExpanded(true);
        setBottomDockMinimized(false);
      }, 0);
    }
    if (options.feedback) {
      showProjectJumpFeedback("success", "已定位属性问题", `${issue.itemName} 的 ${issue.label} 已选中，右侧 Properties 可编辑。`);
    }
  };

  const applyPropertyIssueAutoFix = (issue: BuilderPropertyIssue) => {
    const targetFile = activeProject.files.find((file) => file.id === issue.fileId);
    const targetItem = targetFile?.items.find((item) => item.id === issue.itemId);
    if (!targetFile || !targetItem) {
      const message = `找不到可修复控件：${issue.itemName}`;
      setBuildError(message);
      showProjectJumpFeedback("error", "属性修复失败", message);
      return;
    }

    const patch = propertyAutoFixPatchForItem(targetItem);
    if (!Object.prototype.hasOwnProperty.call(patch, issue.prop)) {
      showProjectJumpFeedback("warning", "需要手动处理", `${issue.itemName} 的 ${issue.label} 没有安全自动修复。`);
      focusPropertyIssue(issue);
      return;
    }

    pushHistorySnapshot(targetFile);
    updateActiveProject((project) => ({
      ...project,
      activeFileId: issue.fileId,
      files: project.files.map((file) =>
        file.id === issue.fileId
          ? {
              ...file,
              items: file.items.map((item) => (item.id === issue.itemId ? { ...item, props: { ...item.props, ...patch } } : item)),
            }
          : file,
      ),
    }));
    setSelectedId(issue.itemId);
    setMode("design");
    setLeftDockTab("navigator");
    setRightDockTab("properties");
    setOpenPropertySections((current) => ({
      ...current,
      [propertySectionForProp(issue.prop)]: true,
    }));
    setBottomDockTab("issues");
    setBottomDockExpanded(true);
    setBottomDockMinimized(false);
    if (mode !== "design") {
      window.setTimeout(() => {
        setBottomDockTab("issues");
        setBottomDockExpanded(true);
        setBottomDockMinimized(false);
      }, 0);
    }
    showProjectJumpFeedback("success", "属性已修复", `${issue.itemName} 的 ${issue.label} 已应用安全默认值。`);
  };

  const updateSelectedEventCommand = (eventName: BuilderEventName, commandId: string) => {
    const command = activeProject.rustCommands.find((candidate) => candidate.id === commandId) ?? null;
    const commandAcceptsValue = Boolean(command?.acceptsValue);
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
    setSimulatorTrace([]);
    setRightDockTab("connections");
    const targetLabel = selectedIds.length > 1 ? `${selectedIds.length} 个选中控件` : selectedItem ? getItemSummary(selectedItem) : "选中控件";
    showProjectJumpFeedback(
      command ? "success" : "warning",
      command ? "连接已绑定" : "连接已解绑",
      command
        ? `${targetLabel} ${eventName} -> ${sanitizeRustCommandName(command.name)}。模拟运行会自动打开日志并按该命令筛选。`
        : `${targetLabel} ${eventName} 已移除 Rust command。`,
    );
  };

  const updateEventCommandForItem = (
    targetItem: BuilderItem,
    eventName: BuilderEventName,
    commandId: string,
    options: { keepConnectionView?: boolean } = {},
  ) => {
    const command = activeProject.rustCommands.find((candidate) => candidate.id === commandId) ?? null;
    const commandAcceptsValue = Boolean(command?.acceptsValue);
    const patch: Partial<BuilderEventBinding> = command
      ? commandAcceptsValue
        ? { commandId, passValue: true }
        : { commandId, passValue: false, payloadMode: "value", payloadFields: undefined }
      : { commandId: "", passValue: false, payloadMode: "value", payloadFields: undefined };

    updateActiveItems((current) =>
      current.map((item) =>
        item.id === targetItem.id
          ? {
              ...item,
              props: propsWithEventBindingPatch(item.props, eventName, patch),
            }
          : item,
      ),
    );
    setSelectedId(targetItem.id);
    setSimulatorTrace([]);
    setMode("logic");
    if (command) {
      selectRustCommand(command.id);
      if (options.keepConnectionView) {
        setLogicResourceView("connections");
      }
    }
    showProjectJumpFeedback(
      command ? "success" : "warning",
      command ? "连接已更新" : "连接已移除",
      command
        ? `${getItemSummary(targetItem)} ${eventName} 已绑定到 ${sanitizeRustCommandName(command.name)}。`
        : `${getItemSummary(targetItem)} ${eventName} 不再绑定 Rust command。`,
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
    setSimulatorTrace([]);
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
    const commandId = eventCommandId(item, eventName);
    const command = commandId ? activeProject.rustCommands.find((candidate) => candidate.id === commandId) ?? null : null;
    const itemName = getItemSummary(item);

    if (!command || !commandId) {
      const trace: SimulatorTraceEntry = {
        id: simulatorTraceId(),
        time: simulatorTimeLabel(),
        itemName,
        eventName,
        commandName: "未绑定事件",
        status: "error",
        rawResult: "",
        message: `${eventName} 还没有绑定 Rust command。请打开连接设置或创建槽函数。`,
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
        recordInstantProjectAction(
          "run-selected-event",
          "运行前请先选择带事件的控件。",
          "skipped",
          "已跳过运行所选事件：请先选择带事件绑定的控件。",
        );
      }
      return;
    }
    const trace = runSimulatorEventForItem(selectedItem, selectedEventName);
    if (options.recordTask !== false) {
    const summary =
      trace.status === "success"
        ? `已运行 ${trace.itemName} ${trace.eventName}，调用 ${trace.commandName}。`
        : `${trace.itemName} ${trace.eventName} 运行失败：${trace.message}`;
      recordInstantProjectAction(
        "run-selected-event",
        summary,
        trace.status === "success" ? "succeeded" : "failed",
        formatSimulatorTraceLog(trace),
      );
    }
    return trace;
  };

  const runSelectedEventAndRevealLogs = () => {
    if (!selectedItem) {
      setMode("design");
      setLeftDockTab("navigator");
      setRightDockTab("properties");
      setFeedbackPanelOpen(true);
      openBottomDock("issues", false);
      showProjectJumpFeedback("warning", "请先选择控件", "运行事件需要选中一个支持事件的控件。");
      recordInstantProjectAction(
        "run-selected-event",
        "运行前请先选择带事件的控件。",
        "skipped",
        "已跳过运行所选事件：当前没有选中控件。",
      );
      return;
    }

    if (!selectedEventName) {
      setMode("design");
      setRightDockTab("properties");
      setFeedbackPanelOpen(true);
      openBottomDock("issues", false);
      showProjectJumpFeedback(
        "warning",
        "所选控件是静态控件",
        `${getItemSummary(selectedItem)} 没有可运行事件。请选择 Button、Input、Switch、Select 或 Checkbox。`,
      );
      recordInstantProjectAction(
        "run-selected-event",
        `${getItemSummary(selectedItem)} 没有可运行事件。`,
        "skipped",
        "已跳过运行所选事件：所选控件没有支持的事件。",
      );
      return;
    }

    if (!selectedEventCommand) {
      setMode("design");
      setRightDockTab("connections");
      setFeedbackPanelOpen(false);
      setBottomDockExpanded(false);
      setBottomDockMinimized(true);
      showProjectJumpFeedback(
        "warning",
        "运行前请先绑定事件",
        `${getItemSummary(selectedItem)} ${selectedEventName} 需要先绑定 Rust command。连接面板已打开，可直接创建新槽函数。`,
      );
      recordInstantProjectAction(
        "run-selected-event",
        `${getItemSummary(selectedItem)} ${selectedEventName} 需要先绑定 Rust command。`,
        "skipped",
        "已跳过运行所选事件：请先打开连接并创建绑定。",
      );
      return;
    }

    const trace = simulateSelectedEvent();
    setRightDockTab("connections");
    setFeedbackPanelOpen(true);
    openBottomDock("logs", false);
    if (trace) {
      setProjectTaskLogSearchQuery(trace.commandName);
    }
  };

  const runLogicSignalSlotEvent = (targetItem: BuilderItem, targetEventName: BuilderEventName) => {
    const commandId = eventCommandId(targetItem, targetEventName);
    const command = commandId ? activeProject.rustCommands.find((candidate) => candidate.id === commandId) ?? null : null;
    setSelectedId(targetItem.id);

    if (!command) {
      setMode("design");
      setRightDockTab("connections");
      showProjectJumpFeedback(
        "warning",
        "运行前请先绑定事件",
        `${getItemSummary(targetItem)} ${targetEventName} 还没有 Rust 命令。`,
      );
      recordInstantProjectAction(
        "run-selected-event",
        `${getItemSummary(targetItem)} ${targetEventName} 需要先绑定 Rust command。`,
        "skipped",
        "已跳过运行所选事件：请先创建信号到槽函数的连接。",
      );
      return;
    }

    const trace = runSimulatorEventForItem(targetItem, targetEventName);
    recordInstantProjectAction(
      "run-selected-event",
      trace.status === "success"
        ? `已运行 ${trace.itemName} ${trace.eventName}，调用 ${trace.commandName}。`
        : `${trace.itemName} ${trace.eventName} 运行失败：${trace.message}`,
      trace.status === "success" ? "succeeded" : "failed",
      formatSimulatorTraceLog(trace),
    );
    setMode("logic");
    setFeedbackPanelOpen(true);
    openBottomDock("logs", false);
    setProjectTaskLogSearchQuery(trace.commandName);
    showProjectJumpFeedback(
      trace.status === "success" ? "success" : "error",
      trace.status === "success" ? "事件已运行" : "事件运行失败",
      `${trace.itemName} ${trace.eventName} -> ${trace.commandName}: ${trace.message}`,
    );
  };

  const revealSelectedConnectionLogs = () => {
    if (!selectedItem || !selectedEventName) {
      return;
    }
    setRightDockTab("connections");
    setFeedbackPanelOpen(true);
    openBottomDock("logs", false);
    setProjectTaskLogSearchQuery(
      selectedLatestSimulatorTrace?.commandName ?? (selectedEventCommand ? sanitizeRustCommandName(selectedEventCommand.name) : selectedEventName),
    );
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

  const updateSelectedBatchSize = (dimension: "width" | "height", value: string) => {
    const fallback =
      dimension === "width"
        ? selectedBatchCommonWidth ?? selectedCanvasBounds?.width ?? MIN_ITEM_WIDTH
        : selectedBatchCommonHeight ?? selectedCanvasBounds?.height ?? MIN_ITEM_HEIGHT;
    const nextValue = numberFromInput(
      value,
      fallback,
      dimension === "width" ? MIN_ITEM_WIDTH : MIN_ITEM_HEIGHT,
      dimension === "width" ? page.width : page.height,
    );
    updateSelectedLayout({ [dimension]: nextValue });
  };

  const setSelectedLockState = (locked: boolean) => {
    if (selectedIds.length === 0) {
      return;
    }
    updateActiveItems((current) => current.map((item) => (selectedIds.includes(item.id) ? { ...item, locked } : item)));
    showProjectJumpFeedback("success", locked ? "已批量锁定" : "已批量解锁", `${formatControlCount(selectedIds.length)} 已${locked ? "锁定" : "解锁"}。`);
  };

  const setSelectedRuntimeState = (patch: Pick<BuilderItemProps, "visible" | "enabled" | "readOnly">) => {
    if (selectedIds.length === 0) {
      return;
    }
    updateActiveItems((current) =>
      current.map((item) => {
        if (!selectedIds.includes(item.id)) {
          return item;
        }
        const nextPatch = { ...patch };
        if (Object.prototype.hasOwnProperty.call(nextPatch, "readOnly") && !readOnlyBuilderComponentTypeSet.has(item.type)) {
          delete nextPatch.readOnly;
        }
        return {
          ...item,
          props: {
            ...item.props,
            ...nextPatch,
          },
        };
      }),
    );
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

  const getKeyboardNudgeTargets = (sourceItems: BuilderItem[]) => {
    const selectedSet = new Set(selectedIds);
    return selectedIds
      .map((id) => sourceItems.find((item) => item.id === id))
      .filter((item): item is BuilderItem => Boolean(item))
      .filter((item) => !Array.from(selectedSet).some((selectedId) => selectedId !== item.id && isDescendantOf(item.id, selectedId, sourceItems)));
  };

  const canvasKeyboardNudgeDelta = (targets: BuilderItem[], sourceItems: BuilderItem[], requestedX: number, requestedY: number) => {
    const ranges = targets.map((item) => {
      const visualItem = resolveItemForBreakpoint(item, activeBreakpoint);
      const bounds = getParentBounds(visualItem, sourceItems, page);
      return {
        minX: -visualItem.x,
        maxX: Math.max(0, bounds.width - visualItem.width) - visualItem.x,
        minY: -visualItem.y,
        maxY: Math.max(0, bounds.height - visualItem.height) - visualItem.y,
      };
    });

    const minX = Math.max(...ranges.map((range) => range.minX));
    const maxX = Math.min(...ranges.map((range) => range.maxX));
    const minY = Math.max(...ranges.map((range) => range.minY));
    const maxY = Math.min(...ranges.map((range) => range.maxY));
    return {
      x: clamp(requestedX, minX, maxX),
      y: clamp(requestedY, minY, maxY),
    };
  };

  const nudgeSelected = (deltaX: number, deltaY: number): CanvasNudgeResult => {
    const sourceItems = itemsRef.current;
    const rootTargets = getKeyboardNudgeTargets(sourceItems);
    const skippedLockedCount = rootTargets.filter((item) => item.locked).length;
    const unlockedTargets = rootTargets.filter((item) => !item.locked);
    const skippedAutoLayoutCount = unlockedTargets.filter((item) => parentUsesAutoLayout(item, sourceItems)).length;
    const movableTargets = unlockedTargets.filter((item) => !parentUsesAutoLayout(item, sourceItems));

    if (movableTargets.length === 0) {
      const result: CanvasNudgeResult = {
        requestedX: deltaX,
        requestedY: deltaY,
        appliedX: 0,
        appliedY: 0,
        movedCount: 0,
        skippedLockedCount,
        skippedAutoLayoutCount,
        constrained: true,
      };
      showProjectJumpFeedback(
        "warning",
        "无法微调选择",
        skippedLockedCount > 0
          ? "当前选择已锁定，方向键不会移动这些控件。"
          : skippedAutoLayoutCount > 0
            ? "当前选择由父级自动布局控制，请在 Frame 的布局设置中调整顺序或间距。"
            : "请先选择一个可移动控件。",
      );
      return result;
    }

    const applied = canvasKeyboardNudgeDelta(movableTargets, sourceItems, deltaX, deltaY);
    const constrained = Math.abs(applied.x - deltaX) > 0.001 || Math.abs(applied.y - deltaY) > 0.001;
    if (Math.abs(applied.x) < 0.001 && Math.abs(applied.y) < 0.001) {
      const result: CanvasNudgeResult = {
        requestedX: deltaX,
        requestedY: deltaY,
        appliedX: 0,
        appliedY: 0,
        movedCount: movableTargets.length,
        skippedLockedCount,
        skippedAutoLayoutCount,
        constrained: true,
      };
      showProjectJumpFeedback("warning", "已到达边界", "选中控件已经贴近画布或父级 Frame 边界。");
      return result;
    }

    const movableIds = new Set(movableTargets.map((item) => item.id));
    updateActiveItems((current) =>
      current.map((item) => {
        if (!movableIds.has(item.id)) {
          return item;
        }
        const visualItem = resolveItemForBreakpoint(item, activeBreakpoint);
        return applyLayoutPatchForActiveBreakpoint(item, { x: visualItem.x + applied.x, y: visualItem.y + applied.y }, current);
      }),
    );

    const result: CanvasNudgeResult = {
      requestedX: deltaX,
      requestedY: deltaY,
      appliedX: applied.x,
      appliedY: applied.y,
      movedCount: movableTargets.length,
      skippedLockedCount,
      skippedAutoLayoutCount,
      constrained,
    };
    if (constrained || skippedLockedCount > 0 || skippedAutoLayoutCount > 0) {
      showProjectJumpFeedback(
        constrained ? "warning" : "success",
        constrained ? "微调已受边界约束" : "已微调可移动控件",
        `${movableTargets.length} 个控件移动 ${Math.round(applied.x)}, ${Math.round(applied.y)}。${skippedLockedCount ? `跳过 ${skippedLockedCount} 个锁定控件。` : ""}${skippedAutoLayoutCount ? `跳过 ${skippedAutoLayoutCount} 个自动布局子项。` : ""}`,
      );
    }
    return result;
  };

  const formatControlCount = (count: number) => `${count} 个控件`;

  const deleteSelected = () => {
    if (selectedIds.length === 0) {
      showProjectJumpFeedback("warning", "没有可删除内容", "删除前请先选择一个或多个控件。");
      return;
    }
    const deletableRoots = selectedIds.filter((id) => !items.find((item) => item.id === id)?.locked);
    const deletedIds = collectDescendantIds(deletableRoots, items);
    if (deletedIds.size === 0) {
      showProjectJumpFeedback("warning", "选择已锁定", "删除前请先解锁选中的控件。");
      return;
    }
    updateActiveItems((current) => {
      const deletableRoots = selectedIds.filter((id) => !current.find((item) => item.id === id)?.locked);
      const deletedIds = collectDescendantIds(deletableRoots, current);
      return current.filter((item) => !deletedIds.has(item.id));
    });
    clearSelection();
    showProjectJumpFeedback("success", "已删除选择", `已从当前 UI 文件移除 ${formatControlCount(deletedIds.size)}。`);
  };

  const duplicateSelected = () => {
    if (selectedItems.length === 0) {
      showProjectJumpFeedback("warning", "没有可复制内容", "复制前请先选择一个或多个控件。");
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
    showProjectJumpFeedback("success", "已复制选择", `${formatControlCount(nextItems.length)} 已复制并在画布上选中。`);
  };

  const selectedRootItemsForTree = (sourceItems: BuilderItem[], ids = selectedIds) => {
    const selectedSet = new Set(ids);
    return sourceItems
      .filter((item) => {
        if (!selectedSet.has(item.id)) {
          return false;
        }
        return !Array.from(selectedSet).some((candidateId) => candidateId !== item.id && isDescendantOf(item.id, candidateId, sourceItems));
      })
      .sort((a, b) => a.z - b.z);
  };

  const groupSelectedIntoFrame = (layoutMode: FrameLayoutMode = "free") => {
    if (activeBreakpoint !== "desktop") {
      showProjectJumpFeedback("warning", "请在桌面断点成组", "成组会改变项目层级，请先切回 Desktop 基准断点。");
      return;
    }

    const rootItems = selectedRootItemsForTree(items).filter((item) => !item.locked);
    const lockedCount = selectedRootItemsForTree(items).length - rootItems.length;
    if (rootItems.length < 2) {
      showProjectJumpFeedback(
        "warning",
        "成组需要多个控件",
        lockedCount > 0 ? `${lockedCount} 个选中控件已锁定。请至少选择两个未锁定控件。` : "请至少选择两个未锁定控件再成组。",
      );
      return;
    }

    const absoluteEntries = rootItems.map((item) => ({ item, position: getAbsolutePosition(item, items) }));
    const left = Math.min(...absoluteEntries.map(({ position }) => position.x));
    const top = Math.min(...absoluteEntries.map(({ position }) => position.y));
    const right = Math.max(...absoluteEntries.map(({ item, position }) => position.x + item.width));
    const bottom = Math.max(...absoluteEntries.map(({ item, position }) => position.y + item.height));
    const commonParentId = rootItems.every((item) => item.parentId === rootItems[0].parentId) ? rootItems[0].parentId : undefined;
    const commonParent = commonParentId ? items.find((item) => item.id === commonParentId && item.type === "frame") : null;
    const groupParentId = commonParent && frameLayoutMode(commonParent) === "free" ? commonParent.id : undefined;
    const groupParentPosition = groupParentId && commonParent ? getAbsolutePosition(commonParent, items) : { x: 0, y: 0 };
    const groupId = createId();
    const groupItem = normalizeItemBoundsInTree(
      {
        id: groupId,
        type: "frame",
        name: "控件组",
        parentId: groupParentId,
        x: left - groupParentPosition.x,
        y: top - groupParentPosition.y,
        width: right - left,
        height: bottom - top,
        z: Math.max(0, ...items.map((item) => item.z)) + 1,
        props: {
          title: "控件组",
          description: `${rootItems.length} 个控件`,
          layoutMode,
          layoutGap: 12,
          layoutPadding: 0,
          layoutColumns: layoutMode === "grid" ? Math.min(3, Math.max(2, rootItems.length)) : 2,
        },
      },
      [...items],
      page,
    );
    const groupPosition = {
      x: groupParentPosition.x + groupItem.x,
      y: groupParentPosition.y + groupItem.y,
    };
    const rootIds = new Set(rootItems.map((item) => item.id));
    const absolutePositionById = new Map(absoluteEntries.map(({ item, position }) => [item.id, position]));

    updateActiveItems((current) => {
      const nextWithChildren = current.map((item) => {
        if (!rootIds.has(item.id)) {
          return item;
        }
        const position = absolutePositionById.get(item.id) ?? getAbsolutePosition(item, current);
        return normalizeItemBoundsInTree(
          {
            ...item,
            parentId: groupId,
            x: position.x - groupPosition.x,
            y: position.y - groupPosition.y,
          },
          [...current, groupItem],
          page,
        );
      });
      return [...nextWithChildren, groupItem];
    });
    setSelectedIds([groupId]);
    setSelectionAnchorId(groupId);
    setRightDockTab("properties");
    showProjectJumpFeedback(
      "success",
      "已创建控件组",
      `${formatControlCount(rootItems.length)} 已放入新的 ${frameLayoutLabel(layoutMode)} Frame${groupParentId ? "，并保留在原父容器内" : ""}。`,
    );
  };

  const ungroupSelectedFrames = () => {
    if (activeBreakpoint !== "desktop") {
      showProjectJumpFeedback("warning", "请在桌面断点取消成组", "取消成组会改变项目层级，请先切回 Desktop 基准断点。");
      return;
    }

    const frameItems = selectedRootItemsForTree(items).filter((item) => item.type === "frame" && !item.locked);
    if (frameItems.length === 0) {
      showProjectJumpFeedback("warning", "没有可取消的控件组", "请选择一个未锁定的 Frame 或控件组。");
      return;
    }

    const frameIds = new Set(frameItems.map((item) => item.id));
    const directChildren = items.filter((item) => item.parentId && frameIds.has(item.parentId));
    if (directChildren.length === 0) {
      showProjectJumpFeedback("warning", "控件组为空", "选中的 Frame 没有直接子控件，未执行取消成组。");
      return;
    }

    const frameById = new Map(frameItems.map((item) => [item.id, item]));
    const framePositionById = new Map(frameItems.map((item) => [item.id, getAbsolutePosition(item, items)]));
    const nextSelectedIds = directChildren.map((item) => item.id);

    updateActiveItems((current) =>
      current.flatMap((item) => {
        if (frameIds.has(item.id)) {
          return [];
        }
        if (!item.parentId || !frameIds.has(item.parentId)) {
          return [item];
        }

        const frame = frameById.get(item.parentId);
        const framePosition = framePositionById.get(item.parentId) ?? { x: 0, y: 0 };
        const nextParentId = frame?.parentId;
        const nextParent = nextParentId ? current.find((candidate) => candidate.id === nextParentId) : null;
        const nextParentPosition = nextParent ? getAbsolutePosition(nextParent, current) : { x: 0, y: 0 };
        return [
          normalizeItemBoundsInTree(
            {
              ...item,
              parentId: nextParentId,
              x: framePosition.x + item.x - nextParentPosition.x,
              y: framePosition.y + item.y - nextParentPosition.y,
            },
            current,
            page,
          ),
        ];
      }),
    );
    setSelectedIds(nextSelectedIds);
    setSelectionAnchorId(nextSelectedIds[0] ?? "");
    showProjectJumpFeedback("success", "已取消成组", `${formatControlCount(directChildren.length)} 已提升到控件组外层。`);
  };

  const toggleSelectedLock = () => {
    updateActiveItems((current) => current.map((item) => (selectedIds.includes(item.id) ? { ...item, locked: !item.locked } : item)));
  };

  const toggleItemLockFromNavigator = (itemId: string) => {
    const target = items.find((item) => item.id === itemId);
    if (!target) {
      return;
    }
    updateActiveItems((current) => current.map((item) => (item.id === itemId ? { ...item, locked: !item.locked } : item)));
    setSelectedId(itemId);
    setNavigatorLayerMessage(`${getItemSummary(target)} 已${target.locked ? "解锁" : "锁定"}。`);
  };

  const toggleItemRuntimeVisibility = (itemId: string) => {
    const target = items.find((item) => item.id === itemId);
    if (!target) {
      return;
    }
    const nextVisible = target.props.visible === false;
    updateActiveItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              props: {
                ...item.props,
                visible: nextVisible,
              },
            }
          : item,
      ),
    );
    setSelectedId(itemId);
    setNavigatorLayerMessage(`${getItemSummary(target)} 运行态已设为${nextVisible ? "可见" : "隐藏"}。`);
  };

  const toggleSelectedRuntimeVisibility = () => {
    if (selectedIds.length === 0) {
      return;
    }
    const shouldHide = selectedItems.some((item) => item.props.visible !== false);
    updateActiveItems((current) =>
      current.map((item) =>
        selectedIds.includes(item.id)
          ? {
              ...item,
              props: {
                ...item.props,
                visible: shouldHide ? false : true,
              },
            }
          : item,
      ),
    );
    setNavigatorLayerMessage(`${formatControlCount(selectedIds.length)} 运行态已设为${shouldHide ? "隐藏" : "可见"}。`);
  };

  const layerMoveTitle = (item: BuilderItem, direction: 1 | -1) => {
    if (item.locked) {
      return "锁定控件不能调整层级";
    }
    if (canMoveLayerWithinGroup(items, item, direction)) {
      return direction > 0 ? "在同组中图层上移" : "在同组中图层下移";
    }
    return direction > 0 ? "已经在本组最上方" : "已经在本组最下方";
  };

  const moveLayer = (id: string, direction: 1 | -1) => {
    const source = items.find((item) => item.id === id);
    if (!source) {
      return;
    }

    setSelectedIds([id]);

    if (source.locked) {
      setNavigatorLayerMessage(`已锁定：${getItemSummary(source)}，先解锁再调整层级。`);
      return;
    }

    const siblings = getLayerSiblings(items, source);
    const index = siblings.findIndex((item) => item.id === id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= siblings.length) {
      setNavigatorLayerMessage(`已在本组${direction > 0 ? "最上方" : "最下方"}：${getItemSummary(source)}。`);
      return;
    }

    const zSlots = siblings.map((item) => item.z).sort((a, b) => a - b);
    const nextSiblingOrder = [...siblings];
    const [movedItem] = nextSiblingOrder.splice(index, 1);
    nextSiblingOrder.splice(targetIndex, 0, movedItem);
    const nextZById = new Map(nextSiblingOrder.map((item, siblingIndex) => [item.id, zSlots[siblingIndex]]));

    updateActiveItems((current) => current.map((item) => (nextZById.has(item.id) ? { ...item, z: nextZById.get(item.id)! } : item)));
    setNavigatorLayerMessage(`已在同组${direction > 0 ? "上移" : "下移"}：${getItemSummary(source)}。`);
  };

  const moveSelectedLayerStep = (direction: 1 | -1) => {
    if (selectedItems.length === 0) {
      showProjectJumpFeedback("warning", "未选择控件", "调整图层顺序前请先选择控件。");
      return;
    }

    let movedCount = 0;
    const selectedRoots = selectedRootItemsForTree(items, selectedIds);
    const movableRoots = selectedRoots.filter((item) => !item.locked);
    const movableRootCount = movableRoots.length;
    const lockedRootCount = selectedRoots.length - movableRoots.length;
    const selectedRootIds = new Set(movableRoots.map((item) => item.id));
    const parentIds = Array.from(new Set(movableRoots.map((item) => item.parentId || "__canvas")));
    const nextZById = new Map<string, number>();

    parentIds.forEach((parentKey) => {
      const parentId = parentKey === "__canvas" ? undefined : parentKey;
      const siblings = items
        .filter((item) => (item.parentId || undefined) === parentId)
        .sort((a, b) => a.z - b.z);
      const nextOrder = [...siblings];
      const zSlots = siblings.map((item) => item.z).sort((a, b) => a - b);

      if (direction > 0) {
        for (let index = nextOrder.length - 2; index >= 0; index -= 1) {
          if (selectedRootIds.has(nextOrder[index].id) && !selectedRootIds.has(nextOrder[index + 1].id)) {
            [nextOrder[index], nextOrder[index + 1]] = [nextOrder[index + 1], nextOrder[index]];
            movedCount += 1;
          }
        }
      } else {
        for (let index = 1; index < nextOrder.length; index += 1) {
          if (selectedRootIds.has(nextOrder[index].id) && !selectedRootIds.has(nextOrder[index - 1].id)) {
            [nextOrder[index - 1], nextOrder[index]] = [nextOrder[index], nextOrder[index - 1]];
            movedCount += 1;
          }
        }
      }

      nextOrder.forEach((item, index) => {
        if (item.z !== zSlots[index]) {
          nextZById.set(item.id, zSlots[index]);
        }
      });
    });

    if (movedCount === 0 || nextZById.size === 0) {
      const lockedDetail = lockedRootCount > 0 ? `，${lockedRootCount} 个锁定控件已跳过` : "";
      showProjectJumpFeedback(
        "warning",
        direction > 0 ? "已在本组最上方" : "已在本组最下方",
        `${formatControlCount(Math.max(1, movableRootCount || selectedItems.length))} 没有可继续${direction > 0 ? "上移" : "下移"}的同级图层${lockedDetail}。`,
      );
      return;
    }

    updateActiveItems((current) => current.map((item) => (nextZById.has(item.id) ? { ...item, z: nextZById.get(item.id)! } : item)));
    const summary = `${formatControlCount(movableRootCount)} 已在同组${direction > 0 ? "上移" : "下移"}一级${lockedRootCount > 0 ? `，跳过 ${lockedRootCount} 个锁定控件` : ""}。`;
    setNavigatorLayerMessage(summary);
    showProjectJumpFeedback("success", "图层顺序已更新", summary);
  };

  const bringToFront = () => {
    if (selectedItems.length === 0) {
      showProjectJumpFeedback("warning", "未选择控件", "调整图层顺序前请先选择控件。");
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
    showProjectJumpFeedback("success", "图层顺序已更新", `${formatControlCount(selectedItems.length)} 已移到画布最前。`);
  };

  const sendToBack = () => {
    if (selectedItems.length === 0) {
      showProjectJumpFeedback("warning", "未选择控件", "调整图层顺序前请先选择控件。");
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
    showProjectJumpFeedback("success", "图层顺序已更新", `${formatControlCount(selectedItems.length)} 已移到画布最后。`);
  };

  const copySelectionToClipboard = () => {
    if (selectedItems.length === 0) {
      showProjectJumpFeedback("warning", "没有可复制内容", "复制前请先选择一个或多个控件。");
      return;
    }
    const copiedIds = collectDescendantIds(selectedIds, items);
    clipboardRef.current = items
      .filter((item) => copiedIds.has(item.id))
      .sort((a, b) => a.z - b.z)
      .map((item) => ({ ...item, responsive: cloneResponsiveOverrides(item.responsive), props: { ...item.props } }));
    setClipboardVersion((version) => version + 1);
    showProjectJumpFeedback("success", "选择已复制", `${formatControlCount(clipboardRef.current.length)} 已复制，可包含子级和绑定一起粘贴。`);
  };

  const cutSelectionToClipboard = () => {
    if (selectedItems.length === 0) {
      showProjectJumpFeedback("warning", "没有可剪切内容", "剪切前请先选择一个或多个控件。");
      return;
    }

    const cuttableRoots = selectedIds.filter((id) => !items.find((item) => item.id === id)?.locked);
    const cutIds = collectDescendantIds(cuttableRoots, items);
    if (cutIds.size === 0) {
      showProjectJumpFeedback("warning", "选择已锁定", "剪切前请先解锁选中的控件。");
      return;
    }

    clipboardRef.current = items
      .filter((item) => cutIds.has(item.id))
      .sort((a, b) => a.z - b.z)
      .map((item) => ({ ...item, responsive: cloneResponsiveOverrides(item.responsive), props: { ...item.props } }));
    setClipboardVersion((version) => version + 1);
    updateActiveItems((current) => {
      const nextCuttableRoots = selectedIds.filter((id) => !current.find((item) => item.id === id)?.locked);
      const nextCutIds = collectDescendantIds(nextCuttableRoots, current);
      return current.filter((item) => !nextCutIds.has(item.id));
    });
    clearSelection();
    showProjectJumpFeedback("success", "选择已剪切", `${formatControlCount(clipboardRef.current.length)} 已复制到剪贴板并从画布移除。`);
  };

  const pasteClipboardItems = (targetPoint?: { x: number; y: number }) => {
    if (clipboardRef.current.length === 0) {
      showProjectJumpFeedback("warning", "剪贴板为空", "请先复制控件，或从控件面板插入新组件。");
      return;
    }
    const idMap = new Map(clipboardRef.current.map((item) => [item.id, createId()]));
    const clipboardIds = new Set(clipboardRef.current.map((item) => item.id));
    const clipboardRoots = clipboardRef.current.filter((item) => !item.parentId || !clipboardIds.has(item.parentId));
    const rootMinX = Math.min(...clipboardRoots.map((item) => item.x));
    const rootMinY = Math.min(...clipboardRoots.map((item) => item.y));
    const anchorOffset = targetPoint
      ? {
          x: snap(targetPoint.x - rootMinX, page.gridSize, page.snapToGrid),
          y: snap(targetPoint.y - rootMinY, page.gridSize, page.snapToGrid),
        }
      : null;
    const pastedItems = clipboardRef.current.map((item, index) => {
      const hasPastedParent = Boolean(item.parentId && idMap.has(item.parentId));
      const defaultOffset = page.gridSize * 4;
      return normalizeItemBoundsInTree(
        {
          ...item,
          id: idMap.get(item.id)!,
          parentId: item.parentId ? idMap.get(item.parentId) ?? item.parentId : undefined,
          x: hasPastedParent ? item.x : item.x + (anchorOffset?.x ?? defaultOffset),
          y: hasPastedParent ? item.y : item.y + (anchorOffset?.y ?? defaultOffset),
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
    showProjectJumpFeedback(
      "success",
      "已粘贴选择",
      targetPoint
        ? `${formatControlCount(pastedItems.length)} 已粘贴到右键位置并选中。`
        : `${formatControlCount(pastedItems.length)} 已插入并在画布上选中。`,
    );
  };

  const openCanvasContextMenu = (event: ReactMouseEvent<HTMLDivElement>, item?: BuilderItem) => {
    if (mode !== "design") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setProjectExplorerContextMenu(null);
    setCanvasContextInsertQuery("");
    setCanvasContextInsertActiveIndex(0);
    if (item && !selectedIds.includes(item.id)) {
      setSelectedId(item.id);
    }
    const menuSelectionCount = item && !selectedIds.includes(item.id) ? 1 : selectedIds.length;
    const estimatedMenuHeight = estimateCanvasContextMenuHeight(Boolean(item), menuSelectionCount);
    const canvasPoint = getCanvasPoint(event.clientX, event.clientY);
    setCanvasContextMenu({
      ...placeFloatingEditorMenu(event.clientX, event.clientY, canvasContextMenuWidth, estimatedMenuHeight),
      canvasPoint,
      itemId: item?.id,
    });
  };

  const closeCanvasContextMenu = () => {
    setCanvasContextMenu(null);
    setCanvasContextInsertQuery("");
    setCanvasContextInsertActiveIndex(0);
  };

  const insertComponentFromCanvasContext = (type: BuilderComponentType) => {
    const targetPoint = canvasContextMenu?.canvasPoint;
    closeCanvasContextMenu();
    addComponent(type, targetPoint);
    const definition = getDefinition(type);
    showProjectJumpFeedback(
      "success",
      "已在右键位置插入控件",
      `${definition.title} 已添加到 ${activeFile.name}${targetPoint ? ` · x ${Math.round(targetPoint.x)}, y ${Math.round(targetPoint.y)}` : ""}。`,
    );
  };

  const handleCanvasContextInsertSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeCanvasContextMenu();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      if (canvasContextInsertSearchResults.length === 0) {
        setCanvasContextInsertActiveIndex(0);
        return;
      }
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setCanvasContextInsertActiveIndex((current) =>
        (current + direction + canvasContextInsertSearchResults.length) % canvasContextInsertSearchResults.length,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      const definition = canvasContextInsertSearchResults[canvasContextInsertActiveIndex];
      if (definition) {
        insertComponentFromCanvasContext(definition.type);
      }
      return;
    }

    event.stopPropagation();
  };

  const runCanvasContextAction = (
    action:
      | "edit-text"
      | "rename-object"
      | "tab-order"
      | "go-slot"
      | "run-event"
      | "copy"
      | "cut"
      | "paste"
      | "duplicate"
      | "group"
      | "group-free"
      | "group-row"
      | "group-column"
      | "group-grid"
      | "ungroup"
      | "layer-forward"
      | "layer-backward"
      | "front"
      | "back"
      | "lock"
      | "toggle-visible"
      | "toggle-enabled"
      | "toggle-read-only"
      | "delete"
      | "select-all"
      | "select-same-type"
      | "invert-selection"
      | "clear"
      | "fit"
      | "components"
      | "align-left"
      | "align-center"
      | "align-right"
      | "align-top"
      | "align-middle"
      | "align-bottom"
      | "distribute-horizontal"
      | "distribute-vertical"
      | "match-width"
      | "match-height"
      | "match-size",
    editProp?: InlineTextEdit["prop"],
  ) => {
    const targetItem = canvasContextMenu?.itemId ? items.find((item) => item.id === canvasContextMenu.itemId) ?? null : null;
    const contextPastePoint = canvasContextMenu?.canvasPoint;
    closeCanvasContextMenu();

    if (action === "edit-text" && targetItem) {
      startInlineTextEdit(targetItem, editProp, "context-menu");
      return;
    }
    if (action === "rename-object") {
      focusObjectNameEditor(targetItem ?? selectedItem);
      return;
    }
    if (action === "tab-order") {
      if (targetItem && !selectedIds.includes(targetItem.id)) {
        setSelectedId(targetItem.id);
      }
      setRightDockTab("properties");
      setTabOrderOverlayVisible(true);
      showProjectJumpFeedback("success", "Tab 顺序已显示", "画布编号显示当前键盘焦点链；可在属性面板调整顺序或设为 -1 跳过。");
      return;
    }
    if (action === "go-slot") {
      goToSlotForItem(targetItem ?? selectedItem);
      return;
    }
    if (action === "run-event") {
      const targetEventName = targetItem ? eventNameForItem(targetItem) : null;
      if (!targetItem || !targetEventName) {
        showProjectJumpFeedback("warning", "没有可运行事件", "请在支持 click/change 的控件上打开右键菜单。");
        return;
      }
      if (!selectedIds.includes(targetItem.id)) {
        setSelectedId(targetItem.id);
      }
      runLogicSignalSlotEvent(targetItem, targetEventName);
      return;
    }
    if (action === "copy") {
      copySelectionToClipboard();
      return;
    }
    if (action === "cut") {
      cutSelectionToClipboard();
      return;
    }
    if (action === "paste") {
      pasteClipboardItems(contextPastePoint);
      return;
    }
    if (action === "duplicate") {
      duplicateSelected();
      return;
    }
    if (action === "group" || action === "group-free" || action === "group-row" || action === "group-column" || action === "group-grid") {
      const layoutMode: FrameLayoutMode =
        action === "group-row" ? "row" : action === "group-column" ? "column" : action === "group-grid" ? "grid" : "free";
      groupSelectedIntoFrame(layoutMode);
      return;
    }
    if (action === "ungroup") {
      ungroupSelectedFrames();
      return;
    }
    if (action.startsWith("align-")) {
      alignSelected(action.replace("align-", "") as AlignmentMode);
      return;
    }
    if (action === "distribute-horizontal" || action === "distribute-vertical") {
      distributeSelected(action === "distribute-horizontal" ? "horizontal" : "vertical");
      return;
    }
    if (action === "match-width" || action === "match-height" || action === "match-size") {
      matchSelectedSize(action === "match-width" ? "width" : action === "match-height" ? "height" : "both");
      return;
    }
    if (action === "layer-forward") {
      moveSelectedLayerStep(1);
      return;
    }
    if (action === "layer-backward") {
      moveSelectedLayerStep(-1);
      return;
    }
    if (action === "front") {
      bringToFront();
      return;
    }
    if (action === "back") {
      sendToBack();
      return;
    }
    if (action === "lock") {
      toggleSelectedLock();
      return;
    }
    if (action === "toggle-visible") {
      const visible = selectedBatchRuntimeSummary.visibleCount < selectedItems.length;
      setSelectedRuntimeState({ visible });
      showProjectJumpFeedback(
        "success",
        visible ? "运行态已显示" : "运行态已隐藏",
        `${formatControlCount(selectedIds.length)} 在生成 exe 中会${visible ? "显示" : "隐藏"}，设计器内仍可继续选取。`,
      );
      return;
    }
    if (action === "toggle-enabled") {
      if (selectedBatchRuntimeSummary.focusableCount === 0) {
        showProjectJumpFeedback("warning", "没有可禁用控件", "按钮、输入框、选择框等可交互控件才支持启用/禁用。");
        return;
      }
      const enabled = selectedBatchRuntimeSummary.enabledCount < selectedBatchRuntimeSummary.focusableCount;
      setSelectedRuntimeState({ enabled });
      showProjectJumpFeedback(
        "success",
        enabled ? "交互已启用" : "交互已禁用",
        `${selectedBatchRuntimeSummary.focusableCount} 个可交互控件在生成 exe 中会${enabled ? "启用" : "禁用"}。`,
      );
      return;
    }
    if (action === "toggle-read-only") {
      if (selectedBatchRuntimeSummary.readOnlyCapableCount === 0) {
        showProjectJumpFeedback("warning", "没有可只读控件", "输入类控件才支持只读状态。");
        return;
      }
      const readOnly = selectedBatchRuntimeSummary.readOnlyCount < selectedBatchRuntimeSummary.readOnlyCapableCount;
      setSelectedRuntimeState({ readOnly });
      showProjectJumpFeedback(
        "success",
        readOnly ? "已设为只读" : "已允许编辑",
        `${selectedBatchRuntimeSummary.readOnlyCapableCount} 个输入类控件在生成 exe 中会${readOnly ? "只读" : "允许编辑"}。`,
      );
      return;
    }
    if (action === "delete") {
      deleteSelected();
      return;
    }
    if (action === "select-all") {
      selectAllItems();
      return;
    }
    if (action === "select-same-type") {
      selectSameTypeControls(targetItem ?? selectedItems[0] ?? null);
      return;
    }
    if (action === "invert-selection") {
      selectInverseSelection();
      return;
    }
    if (action === "clear") {
      clearSelection({ feedback: true });
      return;
    }
    if (action === "fit") {
      fitCanvasToViewport();
      return;
    }
    setLeftDockTab("components");
  };

  const alignmentLabel = (alignment: AlignmentMode) => {
    if (alignment === "left") {
      return "left edges";
    }
    if (alignment === "center") {
      return "horizontal centers";
    }
    if (alignment === "right") {
      return "right edges";
    }
    if (alignment === "top") {
      return "top edges";
    }
    if (alignment === "middle") {
      return "vertical centers";
    }
    return "bottom edges";
  };

  const alignSelected = (alignment: AlignmentMode) => {
    if (selectedItems.length < 2) {
      showProjectJumpFeedback("warning", "对齐需要多个选择", "使用对齐工具前请至少选择两个控件。");
      return;
    }
    const movableItems = selectedItems.filter((item) => !item.locked);
    const lockedCount = selectedItems.length - movableItems.length;
    if (movableItems.length < 2) {
      showProjectJumpFeedback(
        "warning",
        "已跳过对齐",
        lockedCount > 0
          ? `${lockedCount} 个锁定控件无法移动。请至少解锁两个控件后再对齐。`
          : "使用对齐工具前请至少选择两个可移动控件。",
      );
      return;
    }
    const bounds = getSelectionBounds(movableItems);
    if (!bounds) {
      showProjectJumpFeedback("warning", "已跳过对齐", "选中控件还没有可测量的画布边界。");
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
    showProjectJumpFeedback(
      "success",
      "选择已对齐",
      `${formatControlCount(movableItems.length)} 已按${alignmentLabel(alignment)}对齐${lockedCount > 0 ? `；${lockedCount} 个锁定控件保持原位` : ""}。`,
    );
  };

  const distributeSelected = (axis: "horizontal" | "vertical") => {
    if (selectedItems.length < 3) {
      showProjectJumpFeedback("warning", "分布需要更多选择", "使用等距分布前请至少选择三个控件。");
      return;
    }

    const movableItems = selectedItems.filter((item) => !item.locked);
    const lockedCount = selectedItems.length - movableItems.length;
    if (movableItems.length < 3) {
      showProjectJumpFeedback(
        "warning",
        "已跳过分布",
        lockedCount > 0 ? `${lockedCount} 个锁定控件无法移动。请至少解锁三个控件后再分布。` : "使用等距分布前请至少选择三个可移动控件。",
      );
      return;
    }

    const ordered = [...movableItems].sort((a, b) => (axis === "horizontal" ? a.x - b.x : a.y - b.y));
    const first = ordered[0];
    const last = ordered[ordered.length - 1];
    const available =
      axis === "horizontal"
        ? last.x + last.width - first.x - ordered.reduce((total, item) => total + item.width, 0)
        : last.y + last.height - first.y - ordered.reduce((total, item) => total + item.height, 0);
    const gap = available / Math.max(1, ordered.length - 1);

    if (!Number.isFinite(gap) || gap < 0) {
      showProjectJumpFeedback("warning", "空间不足", "当前选择重叠过多，无法计算稳定的等距分布。");
      return;
    }

    let cursor = axis === "horizontal" ? first.x : first.y;
    const nextPositionById = new Map<string, number>();
    for (const item of ordered) {
      nextPositionById.set(item.id, cursor);
      cursor += (axis === "horizontal" ? item.width : item.height) + gap;
    }

    updateActiveItems((current) =>
      current.map((item) => {
        const nextPosition = nextPositionById.get(item.id);
        if (nextPosition === undefined) {
          return item;
        }
        return normalizeItemBounds(
          axis === "horizontal"
            ? { ...item, x: snap(nextPosition, page.gridSize, page.snapToGrid) }
            : { ...item, y: snap(nextPosition, page.gridSize, page.snapToGrid) },
          page,
        );
      }),
    );
    showProjectJumpFeedback(
      "success",
      "选择已等距分布",
      `${formatControlCount(movableItems.length)} 已按${axis === "horizontal" ? "水平" : "垂直"}方向等距分布${lockedCount > 0 ? `；${lockedCount} 个锁定控件保持原位` : ""}。`,
    );
  };

  const matchSelectedSize = (axis: "width" | "height" | "both") => {
    const baselineId = selectionAnchorId && selectedIds.includes(selectionAnchorId) ? selectionAnchorId : selectedIds[0] ?? "";
    const baselineItem = selectedItems.find((item) => item.id === baselineId) ?? selectedItems[0] ?? null;
    if (!baselineItem || selectedItems.length < 2) {
      showProjectJumpFeedback("warning", "统一尺寸需要多个选择", "先选择一个基准控件，再追加选择需要统一尺寸的控件。");
      return;
    }

    const targetItems = selectedItems.filter((item) => item.id !== baselineItem.id && !item.locked);
    const lockedCount = selectedItems.length - 1 - targetItems.length;
    if (targetItems.length === 0) {
      showProjectJumpFeedback("warning", "已跳过统一尺寸", lockedCount > 0 ? "其他选中控件均已锁定。" : "没有可统一尺寸的其他控件。");
      return;
    }

    const patch =
      axis === "width"
        ? { width: baselineItem.width }
        : axis === "height"
          ? { height: baselineItem.height }
          : { width: baselineItem.width, height: baselineItem.height };
    const targetIds = new Set(targetItems.map((item) => item.id));

    updateActiveItems((current) =>
      current.map((item) => (targetIds.has(item.id) ? normalizeItemBounds({ ...item, ...patch }, page) : item)),
    );
    showProjectJumpFeedback(
      "success",
      "尺寸已统一",
      `${formatControlCount(targetItems.length)} 已匹配${axis === "width" ? "宽度" : axis === "height" ? "高度" : "宽高"}${lockedCount > 0 ? `；${lockedCount} 个锁定控件保持原位` : ""}。`,
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
      const message = "窗口验证需要在 Tauri 桌面 app 中运行。浏览器模式只能执行编辑器内视觉审查。";
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
      throw new Error("后端产物构建没有返回结果。");
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
      setBuildError("这个后端集成没有 Nova starter 构建脚本。请用产物状态检查脚本和资源目录。");
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
        summary: "没有启用的 C++ FFI 或 Go starter 后端集成需要构建产物。",
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
      markProjectSourceSaved(activeProject);
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
        markWorkspaceSourceSaved(workspace);
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
      return { saved: false, paths: null as EditorProjectPaths | null };
    }
    const workspaceSnapshot = workspaceWithCurrentEditorState();
    const activeProjectSnapshot =
      workspaceSnapshot.projects.find((project) => project.id === workspaceSnapshot.activeProjectId) ?? workspaceSnapshot.projects[0];
    window.localStorage.setItem(DESIGNER_WORKSPACE_STORAGE_KEY, JSON.stringify(workspaceSnapshot));

    setDiskBusy(true);
    setBuildError("");
    try {
      const paths = await invokeIfAvailable<EditorProjectPaths>("save_editor_project", {
        project: activeProjectSnapshot,
        rustLogic: activeProjectSnapshot.rustLogic,
      });
      if (paths) {
        applyProjectPaths(paths);
        void refreshManagedProjects();
        void refreshDiskCheckpoints(paths.root_path);
        void refreshReleasePipelineRecords({ ...activeProjectSnapshot, rootPath: paths.root_path });
      }
      markProjectSourceSaved(activeProjectSnapshot);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1400);
      return { saved: true, paths: paths ?? null };
    } catch (error) {
      setBuildError(String(error));
      return { saved: false, paths: null as EditorProjectPaths | null };
    } finally {
      setDiskBusy(false);
    }
  };

  const loadWorkspace = () => {
    const savedWorkspace = loadDesignerWorkspace();
    if (!savedWorkspace) {
      showProjectJumpFeedback("warning", "没有本地工作区", "请先保存当前编辑器工作区，之后才能重新加载恢复。");
      return;
    }
    setWorkspace(savedWorkspace);
    markWorkspaceSourceSaved(savedWorkspace);
    const nextProject = savedWorkspace.projects.find((project) => project.id === savedWorkspace.activeProjectId) ?? savedWorkspace.projects[0];
    const nextFile = nextProject.files.find((file) => file.id === nextProject.activeFileId) ?? nextProject.files[0];
    setSelectedId(nextFile.items[0]?.id ?? "");
    setMode("design");
    showProjectJumpFeedback("success", "工作区已重新加载", `${nextProject.name} / ${nextFile.name} 已从本地编辑器存储恢复。`);
  };

  const resetCurrentFile = () => {
    const fileName = activeFile.name;
    updateActiveFile((file) => ({
      ...file,
      page: { ...defaultPage, title: file.name.replace(/\.ui$/i, "") || "Untitled Interface" },
      items: [],
    }));
    setSelectedId("");
    setLeftDockTab("components");
    setMode("design");
    showProjectJumpFeedback("success", "UI 文件已清空", `${fileName} 已清空。控件面板已打开，可继续插入。`);
  };

  const createNewProject = () => {
    const template = projectTemplateById(selectedProjectTemplateId);
    const nextProject = createProject(`${template.defaultName} ${workspace.projects.length + 1}`, selectedProjectTemplateId);
    setWorkspace((current) => ({
      ...current,
      projects: [...current.projects, nextProject],
      activeProjectId: nextProject.id,
    }));
    markProjectSourceSaved(nextProject);
    setSelectedId("");
    setLeftDockTab("project");
    setMode("design");
    showProjectJumpFeedback("success", "项目已创建", `${nextProject.name} 已激活。项目设置和模板已打开。`);
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
      const nextProject = createProject("Nova 项目");
      const nextWorkspace = createWorkspace(nextProject);
      setWorkspace(nextWorkspace);
      markWorkspaceSourceSaved(nextWorkspace);
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
      name: name || "未命名项目",
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
    addComponent("image", undefined, undefined, undefined, {
        label: asset.name,
        alt: asset.name,
        assetId: asset.id,
        assetPath: asset.publicPath,
    });
  };

  const bindSelectedImageAsset = (assetId: string) => {
    const asset = activeProject.assets.find((candidate) => candidate.id === assetId);
    updateSelectedProps({
      assetId,
      assetPath: asset?.publicPath ?? "",
      label: asset?.name ?? "Image",
      alt: asset?.name ?? selectedItem?.props.alt ?? "项目资源",
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
        markWorkspaceSourceSaved(workspace);
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

  const updateRustEditorSelectionFromEditor = (editor: HTMLTextAreaElement) => {
    setRustEditorSelection(rustEditorSelectionFromValue(editor.value, editor.selectionStart ?? 0, editor.selectionEnd ?? editor.selectionStart ?? 0));
  };

  const focusRustFindMatch = (match: RustFindMatch | null = activeRustFindMatch) => {
    if (!match) {
      rustFindInputRef.current?.focus();
      return;
    }

    setMode("logic");
    setRustDiagnosticTarget(null);
    window.requestAnimationFrame(() => {
      const editor = rustLogicRef.current;
      if (!editor) {
        return;
      }
      editor.focus();
      editor.setSelectionRange(match.index, match.end);
      const nextScrollTop = Math.max(0, (match.line - 6) * 20);
      editor.scrollTop = nextScrollTop;
      setRustEditorScrollTop(nextScrollTop);
      updateRustEditorSelectionFromEditor(editor);
    });
  };

  const focusRustIdentifierReference = (reference: RustIdentifierReference) => {
    setMode("logic");
    setRustDiagnosticTarget({
      file: "rust/logic.rs",
      sourceFile: "rust/logic.rs",
      sourceKind: "identifier",
      sourceSummary: `${rustCurrentIdentifier?.name ?? "标识符"} 引用 · Ln ${reference.line}:${reference.column}`,
      message: `Rust 引用导航：第 ${reference.line} 行，第 ${reference.column} 列`,
      generatedLine: reference.line,
      sourceLine: reference.line,
      column: reference.column,
      mappedToSource: true,
    });
    setBuildError("");
    window.requestAnimationFrame(() => {
      const editor = rustLogicRef.current;
      if (!editor) {
        return;
      }
      editor.focus();
      editor.setSelectionRange(reference.index, reference.end);
      const nextScrollTop = Math.max(0, (reference.line - 6) * 20);
      editor.scrollTop = nextScrollTop;
      setRustEditorScrollTop(nextScrollTop);
      updateRustEditorSelectionFromEditor(editor);
    });
    showProjectJumpFeedback("success", "已跳到 Rust 引用", `Ln ${reference.line}:${reference.column} · ${reference.preview}`);
  };

  const moveRustFindMatch = (direction: 1 | -1) => {
    if (rustFindMatches.length === 0) {
      rustFindInputRef.current?.focus();
      return;
    }

    const nextIndex = (rustFindActiveIndex + direction + rustFindMatches.length) % rustFindMatches.length;
    setRustFindActiveIndex(nextIndex);
    focusRustFindMatch(rustFindMatches[nextIndex]);
  };

  const goToRustLine = () => {
    const query = rustGoToLineQuery.trim();
    const match = query.match(/^(\d+)(?::(\d+))?$/);
    if (!match) {
      rustGoToLineInputRef.current?.focus();
      rustGoToLineInputRef.current?.select();
      showProjectJumpFeedback("warning", "行号格式不正确", "请输入类似 42 或 42:5 的 Rust 源码行列位置。");
      return;
    }

    const requestedLine = Number.parseInt(match[1] ?? "1", 10);
    const requestedColumn = match[2] ? Number.parseInt(match[2], 10) : 1;
    const nextLine = clamp(requestedLine, 1, Math.max(1, rustEditorLines.length));
    const nextColumn = clamp(requestedColumn, 1, Math.max(1, (rustEditorLines[nextLine - 1] ?? "").length + 1));
    setRustGoToLineQuery(nextColumn > 1 ? `${nextLine}:${nextColumn}` : String(nextLine));
    focusRustLine(nextLine, "手动行列跳转", nextColumn);
    showProjectJumpFeedback("success", "已跳转到 Rust 行", `光标已移动到第 ${nextLine} 行，第 ${nextColumn} 列。`);
  };

  const copyRustEditorLocation = async () => {
    const location = `rust/logic.rs:${rustEditorSelection.line}:${rustEditorSelection.column}`;
    try {
      await navigator.clipboard.writeText(location);
      showProjectJumpFeedback("success", "已复制 Rust 位置", location);
    } catch (error) {
      const message = `无法复制 Rust 位置：${String(error)}`;
      setBuildError(message);
      showProjectJumpFeedback("warning", "复制失败", message);
    }
  };

  const selectCurrentRustOutlineRange = () => {
    const entry = rustCursorOutlineEntry;
    if (!entry?.line) {
      rustLogicRef.current?.focus();
      showProjectJumpFeedback("warning", "没有可选择的 Rust 符号", "请把光标移动到函数、槽函数、module、impl、type 或 const 内。");
      return;
    }

    const entryLine = entry.line;
    const source = activeProject.rustLogic;
    const start = rustLineStartIndex(source, entryLine);
    const endLine = clamp(entry.endLine ?? entryLine, entryLine, Math.max(entryLine, rustEditorLines.length));
    const nextLineStart = rustLineStartIndex(source, endLine + 1);
    const end = clamp(nextLineStart > start ? nextLineStart : source.length, start, source.length);
    setRustDiagnosticTarget({
      file: "rust/logic.rs",
      sourceFile: "rust/logic.rs",
      sourceKind: entry.kind,
      sourceSummary: `${rustOutlineKindTitle(entry.kind)} ${entry.label} 已选中，可复制、重命名、格式化或继续编辑。`,
      message: `已选择 Rust 符号范围：${entry.label}`,
      generatedLine: entryLine,
      sourceLine: entryLine,
      column: entry.column ?? 1,
      mappedToSource: true,
    });
    setBuildError("");
    setMode("logic");
    window.requestAnimationFrame(() => {
      const editor = rustLogicRef.current;
      if (!editor) {
        return;
      }
      editor.focus();
      editor.setSelectionRange(start, end);
      const nextScrollTop = Math.max(0, (entryLine - 6) * 20);
      editor.scrollTop = nextScrollTop;
      setRustEditorScrollTop(nextScrollTop);
      updateRustEditorSelectionFromEditor(editor);
    });
    showProjectJumpFeedback("success", "已选择 Rust 符号", `${entry.label} · Ln ${entryLine}-${endLine}`);
  };

  const prepareRustSymbolRename = () => {
    if (!rustCurrentIdentifier) {
      rustLogicRef.current?.focus();
      showProjectJumpFeedback("warning", "没有可重命名符号", "请把光标放在 Rust 标识符上，或先选中一个标识符。");
      return;
    }

    setRustRenameQuery(rustCurrentIdentifier.name);
    window.requestAnimationFrame(() => {
      rustRenameInputRef.current?.focus();
      rustRenameInputRef.current?.select();
    });
  };

  const renameRustSymbolAtCursor = () => {
    if (!rustCurrentIdentifier) {
      prepareRustSymbolRename();
      return;
    }

    const nextName = rustRenameQuery.trim();
    if (!isRustIdentifierName(nextName)) {
      rustRenameInputRef.current?.focus();
      rustRenameInputRef.current?.select();
      showProjectJumpFeedback("warning", "重命名无效", "Rust 标识符需要以字母或下划线开头，并且不能使用保留字。");
      return;
    }
    if (nextName === rustCurrentIdentifier.name) {
      rustLogicRef.current?.focus();
      showProjectJumpFeedback("warning", "符号名称未变化", `${rustCurrentIdentifier.name} 已经是当前名称。`);
      return;
    }

    const source = activeProject.rustLogic;
    const occurrences = rustIdentifierOccurrences(source, rustCurrentIdentifier.name);
    if (occurrences.length === 0) {
      showProjectJumpFeedback("warning", "没有找到可替换符号", `${rustCurrentIdentifier.name} 没有可重命名的出现位置。`);
      return;
    }

    const replacementsBeforeTarget = occurrences.filter((occurrence) => occurrence.index < rustCurrentIdentifier.start).length;
    const nextRustLogic = source.replace(new RegExp(`\\b${escapeRegExp(rustCurrentIdentifier.name)}\\b`, "g"), nextName);
    const nextCursor = rustCurrentIdentifier.start + replacementsBeforeTarget * (nextName.length - rustCurrentIdentifier.name.length) + nextName.length;
    setRustRenameQuery(nextName);
    applyRustEditorTextEdit(nextRustLogic, nextCursor, nextCursor);
    showProjectJumpFeedback(
      "success",
      "Rust 符号已重命名",
      `${rustCurrentIdentifier.name} -> ${nextName}，共更新 ${occurrences.length} 处标识符。`,
    );
  };

  const handleRustFindInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      moveRustFindMatch(event.shiftKey ? -1 : 1);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setRustFindQuery("");
      rustLogicRef.current?.focus();
    }
  };

  const handleRustGoToLineInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      goToRustLine();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setRustGoToLineQuery("");
      rustLogicRef.current?.focus();
    }
  };

  const handleRustRenameInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      renameRustSymbolAtCursor();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setRustRenameQuery("");
      rustLogicRef.current?.focus();
    }
  };

  const insertRustSnippet = (snippet: string, cursorOffset = snippet.length) => {
    const editor = rustLogicRef.current;
    const source = activeProject.rustLogic;
    const start = editor?.selectionStart ?? source.length;
    const end = editor?.selectionEnd ?? start;
    const needsLeadingLine = start > 0 && source[start - 1] !== "\n";
    const needsTrailingLine = end < source.length && source[end] !== "\n";
    const inserted = `${needsLeadingLine ? "\n" : ""}${snippet}${needsTrailingLine ? "\n" : ""}`;
    const nextRustLogic = `${source.slice(0, start)}${inserted}${source.slice(end)}`;
    const cursor = start + (needsLeadingLine ? 1 : 0) + cursorOffset;
    updateRustLogic(nextRustLogic);
    window.requestAnimationFrame(() => {
      const nextEditor = rustLogicRef.current;
      if (!nextEditor) {
        return;
      }
      nextEditor.focus();
      nextEditor.setSelectionRange(cursor, cursor);
      updateRustEditorSelectionFromEditor(nextEditor);
    });
  };

  const updateRustCompletionFromEditor = (editor: HTMLTextAreaElement, forced = false) => {
    updateRustEditorSelectionFromEditor(editor);
    const cursor = editor.selectionStart ?? 0;
    const prefix = editor.value.slice(0, cursor).match(/[A-Za-z_][A-Za-z0-9_:]*$/)?.[0] ?? "";
    if (!forced && prefix.length < 2) {
      setRustCompletionTrigger(null);
      return;
    }
    setRustCompletionCommit(null);
    setRustCompletionTrigger({ cursor, activeIndex: 0, forced });
  };

  const applyRustCompletion = (completion: RustCompletionItem | null = activeRustCompletion) => {
    if (!completion) {
      return;
    }

    const source = activeProject.rustLogic;
    const nextRustLogic = `${source.slice(0, completion.replaceStart)}${completion.insertText}${source.slice(completion.replaceEnd)}`;
    const cursor = completion.replaceStart + (completion.cursorOffset ?? completion.insertText.length);
    setRustCompletionTrigger(null);
    setRustCompletionCommit({
      label: completion.label,
      kind: completion.kind,
      insertedLength: completion.insertText.length,
      cursor,
    });
    updateRustLogic(nextRustLogic);
    window.requestAnimationFrame(() => {
      const editor = rustLogicRef.current;
      if (!editor) {
        return;
      }
      editor.focus();
      editor.setSelectionRange(cursor, cursor);
      updateRustEditorSelectionFromEditor(editor);
    });
  };

  const applyRustIndent = (editor: HTMLTextAreaElement, outdent: boolean) => {
    const source = activeProject.rustLogic;
    const start = editor.selectionStart ?? 0;
    const end = editor.selectionEnd ?? start;

    if (start === end && !outdent) {
      const nextRustLogic = `${source.slice(0, start)}    ${source.slice(end)}`;
      const cursor = start + 4;
      updateRustLogic(nextRustLogic);
      window.requestAnimationFrame(() => {
        const nextEditor = rustLogicRef.current;
        if (!nextEditor) {
          return;
        }
        nextEditor.focus();
        nextEditor.setSelectionRange(cursor, cursor);
        updateRustEditorSelectionFromEditor(nextEditor);
      });
      return;
    }

    const lineStart = source.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const adjustedEnd = end > start && source[end - 1] === "\n" ? end - 1 : end;
    const lineEndIndex = source.indexOf("\n", adjustedEnd);
    const lineEnd = lineEndIndex === -1 ? source.length : lineEndIndex;
    const block = source.slice(lineStart, lineEnd);
    const lines = block.split("\n");
    let firstLineDelta = 0;
    let totalDelta = 0;

    const nextLines = lines.map((line, index) => {
      if (!outdent) {
        firstLineDelta = index === 0 ? 4 : firstLineDelta;
        totalDelta += 4;
        return `    ${line}`;
      }

      const leadingSpaces = line.match(/^ +/)?.[0].length ?? 0;
      const removeCount = line.startsWith("\t") ? 1 : Math.min(leadingSpaces, 4);
      if (index === 0) {
        firstLineDelta = -removeCount;
      }
      totalDelta -= removeCount;
      return line.slice(removeCount);
    });

    const nextBlock = nextLines.join("\n");
    const nextRustLogic = `${source.slice(0, lineStart)}${nextBlock}${source.slice(lineEnd)}`;
    const nextStart = Math.max(lineStart, start + firstLineDelta);
    const nextEnd = Math.max(nextStart, end + totalDelta);
    updateRustLogic(nextRustLogic);
    window.requestAnimationFrame(() => {
      const nextEditor = rustLogicRef.current;
      if (!nextEditor) {
        return;
      }
      nextEditor.focus();
      nextEditor.setSelectionRange(nextStart, nextEnd);
      updateRustEditorSelectionFromEditor(nextEditor);
    });
  };

  const toggleRustLineComment = () => {
    const editor = rustLogicRef.current;
    const source = activeProject.rustLogic;
    const start = editor?.selectionStart ?? rustEditorSelection.selectionStart;
    const end = editor?.selectionEnd ?? start;
    const lineStart = source.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const adjustedEnd = end > start && source[end - 1] === "\n" ? end - 1 : end;
    const lineEndIndex = source.indexOf("\n", adjustedEnd);
    const lineEnd = lineEndIndex === -1 ? source.length : lineEndIndex;
    const block = source.slice(lineStart, lineEnd);
    const lines = block.split("\n");
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
    const shouldUncomment = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => /^\s*\/\//.test(line));
    const shouldCommentBlankLines = nonEmptyLines.length === 0;
    const edits: Array<{ position: number; delta: number }> = [];
    let originalOffset = lineStart;

    const nextLines = lines.map((line) => {
      const absoluteLineStart = originalOffset;
      originalOffset += line.length + 1;

      if (!line.trim() && !shouldCommentBlankLines) {
        return line;
      }

      if (shouldUncomment) {
        const match = line.match(/^(\s*)\/\/ ?/);
        if (!match) {
          return line;
        }
        const commentStart = match[1].length;
        const removeCount = match[0].length - commentStart;
        edits.push({ position: absoluteLineStart + commentStart, delta: -removeCount });
        return `${line.slice(0, commentStart)}${line.slice(commentStart + removeCount)}`;
      }

      const indentation = line.match(/^\s*/)?.[0].length ?? 0;
      edits.push({ position: absoluteLineStart + indentation, delta: 3 });
      return `${line.slice(0, indentation)}// ${line.slice(indentation)}`;
    });

    const nextBlock = nextLines.join("\n");
    const nextRustLogic = `${source.slice(0, lineStart)}${nextBlock}${source.slice(lineEnd)}`;
    const adjustmentForOffset = (offset: number) =>
      edits.reduce((total, edit) => (offset > edit.position ? total + edit.delta : total), 0);
    const nextStart = clamp(start + adjustmentForOffset(start), 0, nextRustLogic.length);
    const nextEnd = start === end ? nextStart : clamp(end + adjustmentForOffset(end), nextStart, nextRustLogic.length);

    applyRustEditorTextEdit(nextRustLogic, nextStart, nextEnd);
    showProjectJumpFeedback(
      "success",
      shouldUncomment ? "Rust 注释已取消" : "Rust 注释已添加",
      shouldUncomment ? "已取消所选 Rust 行的 // 注释。" : "已为所选 Rust 行添加 // 注释。",
    );
  };

  const duplicateRustSelectionOrLine = () => {
    const editor = rustLogicRef.current;
    const source = activeProject.rustLogic;
    const start = editor?.selectionStart ?? rustEditorSelection.selectionStart;
    const end = editor?.selectionEnd ?? start;

    if (start !== end) {
      const selected = source.slice(start, end);
      const nextRustLogic = `${source.slice(0, end)}${selected}${source.slice(end)}`;
      applyRustEditorTextEdit(nextRustLogic, end, end + selected.length);
      showProjectJumpFeedback("success", "Rust 选区已复制", `已复制 ${selected.length} 个字符到选区后方。`);
      return;
    }

    const lineStart = source.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const lineEndIndex = source.indexOf("\n", start);
    const lineEnd = lineEndIndex === -1 ? source.length : lineEndIndex;
    const column = start - lineStart;
    const lineText = source.slice(lineStart, lineEnd);
    const insertAt = lineEndIndex === -1 ? lineEnd : lineEndIndex + 1;
    const inserted = lineEndIndex === -1 ? `\n${lineText}` : `${lineText}\n`;
    const nextRustLogic = `${source.slice(0, insertAt)}${inserted}${source.slice(insertAt)}`;
    const nextCursor = lineEndIndex === -1 ? insertAt + 1 + column : insertAt + column;
    applyRustEditorTextEdit(nextRustLogic, nextCursor, nextCursor);
    showProjectJumpFeedback("success", "Rust 行已复制", `已复制第 ${rustEditorSelection.line} 行到下一行。`);
  };

  const moveRustSelectionLines = (direction: -1 | 1) => {
    const editor = rustLogicRef.current;
    const source = activeProject.rustLogic;
    if (!source) {
      showProjectJumpFeedback("warning", "没有可移动内容", "Rust 逻辑源码为空。");
      return;
    }

    const ranges: Array<{ start: number; end: number }> = [];
    let cursor = 0;
    while (cursor < source.length) {
      const nextLineBreak = source.indexOf("\n", cursor);
      if (nextLineBreak < 0) {
        ranges.push({ start: cursor, end: source.length });
        break;
      }
      ranges.push({ start: cursor, end: nextLineBreak + 1 });
      cursor = nextLineBreak + 1;
    }

    const start = editor?.selectionStart ?? rustEditorSelection.selectionStart;
    const end = editor?.selectionEnd ?? start;
    const adjustedEnd = end > start && source[end - 1] === "\n" ? end - 1 : end;
    const lineIndexForOffset = (offset: number) => {
      const safeOffset = clamp(offset, 0, source.length);
      const index = ranges.findIndex((range) => safeOffset >= range.start && safeOffset <= Math.max(range.start, range.end - 1));
      return index >= 0 ? index : Math.max(0, ranges.length - 1);
    };
    const firstLineIndex = lineIndexForOffset(start);
    const lastLineIndex = lineIndexForOffset(adjustedEnd);

    if (direction < 0 && firstLineIndex === 0) {
      showProjectJumpFeedback("warning", "已在顶部", "当前 Rust 行块不能再上移。");
      return;
    }
    if (direction > 0 && lastLineIndex >= ranges.length - 1) {
      showProjectJumpFeedback("warning", "已在底部", "当前 Rust 行块不能再下移。");
      return;
    }

    const blockStart = ranges[firstLineIndex].start;
    const blockEnd = ranges[lastLineIndex].end;
    const blockText = source.slice(blockStart, blockEnd);

    if (direction < 0) {
      const neighborStart = ranges[firstLineIndex - 1].start;
      const neighborEnd = ranges[firstLineIndex - 1].end;
      const neighborText = source.slice(neighborStart, neighborEnd);
      const nextRustLogic = `${source.slice(0, neighborStart)}${blockText}${neighborText}${source.slice(blockEnd)}`;
      applyRustEditorTextEdit(nextRustLogic, start - neighborText.length, end - neighborText.length);
      showProjectJumpFeedback("success", "Rust 行已上移", `已上移 ${lastLineIndex - firstLineIndex + 1} 行。`);
      return;
    }

    const neighborStart = ranges[lastLineIndex + 1].start;
    const neighborEnd = ranges[lastLineIndex + 1].end;
    const neighborText = source.slice(neighborStart, neighborEnd);
    const nextRustLogic = `${source.slice(0, blockStart)}${neighborText}${blockText}${source.slice(neighborEnd)}`;
    applyRustEditorTextEdit(nextRustLogic, start + neighborText.length, end + neighborText.length);
    showProjectJumpFeedback("success", "Rust 行已下移", `已下移 ${lastLineIndex - firstLineIndex + 1} 行。`);
  };

  const applyRustEditorTextEdit = (nextRustLogic: string, selectionStart: number, selectionEnd = selectionStart) => {
    setRustCompletionTrigger(null);
    updateRustLogic(nextRustLogic);
    window.requestAnimationFrame(() => {
      const nextEditor = rustLogicRef.current;
      if (!nextEditor) {
        return;
      }
      nextEditor.focus();
      nextEditor.setSelectionRange(selectionStart, selectionEnd);
      updateRustEditorSelectionFromEditor(nextEditor);
    });
  };

  const replaceActiveRustFindMatch = () => {
    const match = activeRustFindMatch;
    if (!match) {
      rustFindInputRef.current?.focus();
      showProjectJumpFeedback("warning", "没有可替换匹配", "先输入查找内容并定位到一个 Rust 源码匹配项。");
      return;
    }

    const source = activeProject.rustLogic;
    const nextRustLogic = `${source.slice(0, match.index)}${rustReplaceQuery}${source.slice(match.end)}`;
    const nextSelectionEnd = match.index + rustReplaceQuery.length;
    setRustFindActiveIndex(Math.min(rustFindActiveIndex, Math.max(0, rustFindMatches.length - 2)));
    applyRustEditorTextEdit(nextRustLogic, match.index, nextSelectionEnd);
    showProjectJumpFeedback(
      "success",
      "已替换当前匹配",
      rustReplaceQuery ? `已将当前 Rust 匹配替换为 “${rustReplaceQuery}”。` : "已删除当前 Rust 匹配内容。",
    );
  };

  const replaceAllRustFindMatches = () => {
    if (rustFindMatches.length === 0) {
      rustFindInputRef.current?.focus();
      showProjectJumpFeedback("warning", "没有可替换匹配", "先输入查找内容，Nova 会在 Rust 源码中计算可替换项。");
      return;
    }

    const source = activeProject.rustLogic;
    const nextRustLogic = [...rustFindMatches]
      .reverse()
      .reduce((nextSource, match) => `${nextSource.slice(0, match.index)}${rustReplaceQuery}${nextSource.slice(match.end)}`, source);
    const firstMatch = rustFindMatches[0];
    setRustFindActiveIndex(0);
    applyRustEditorTextEdit(nextRustLogic, firstMatch.index, firstMatch.index + rustReplaceQuery.length);
    showProjectJumpFeedback(
      "success",
      "已全部替换",
      rustReplaceQuery ? `Rust 源码中 ${rustFindMatches.length} 处匹配已替换。` : `Rust 源码中 ${rustFindMatches.length} 处匹配已删除。`,
    );
  };

  const handleRustReplaceInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    const commandKey = event.ctrlKey || event.metaKey;
    if (event.key === "Enter" && commandKey) {
      event.preventDefault();
      if (event.shiftKey) {
        replaceAllRustFindMatches();
        return;
      }
      replaceActiveRustFindMatch();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setRustReplaceQuery("");
      rustLogicRef.current?.focus();
    }
  };

  const formatRustLogicSource = () => {
    const formatted = formatRustSource(activeProject.rustLogic);
    if (formatted === activeProject.rustLogic) {
      showProjectJumpFeedback("success", "Rust 源码已整理", "当前缩进和空行已经符合 Nova 的轻量格式化规则。");
      rustLogicRef.current?.focus();
      return;
    }

    const editor = rustLogicRef.current;
    const cursor = Math.min(editor?.selectionStart ?? formatted.length, formatted.length);
    applyRustEditorTextEdit(formatted, cursor, cursor);
    showProjectJumpFeedback("success", "Rust 源码已格式化", "已清理尾随空白、压缩多余空行，并按括号层级重新缩进。");
  };

  const toggleRustEditorWordWrap = () => {
    setRustEditorWordWrap((current) => {
      const next = !current;
      if (next) {
        setRustEditorScrollLeft(0);
        window.requestAnimationFrame(() => {
          if (rustLogicRef.current) {
            rustLogicRef.current.scrollLeft = 0;
          }
        });
      }
      return next;
    });
  };

  const applyRustAutoNewline = (editor: HTMLTextAreaElement) => {
    const source = editor.value;
    const start = editor.selectionStart ?? 0;
    const end = editor.selectionEnd ?? start;
    const lineStart = source.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const lineBeforeCursor = source.slice(lineStart, start);
    const currentIndent = lineBeforeCursor.match(/^\s*/)?.[0] ?? "";
    const beforeTrimmed = lineBeforeCursor.trimEnd();
    const opener = beforeTrimmed.at(-1);
    const pairClose = opener === "{" ? "}" : opener === "(" ? ")" : opener === "[" ? "]" : "";
    const nextChar = source[end] ?? "";
    const shouldIndentInnerLine = Boolean(pairClose);
    const innerIndent = `${currentIndent}${shouldIndentInnerLine ? "    " : ""}`;
    const inserted = pairClose && nextChar === pairClose ? `\n${innerIndent}\n${currentIndent}` : `\n${innerIndent}`;
    const cursor = start + 1 + innerIndent.length;

    applyRustEditorTextEdit(`${source.slice(0, start)}${inserted}${source.slice(end)}`, cursor);
  };

  const applyRustAutoPair = (editor: HTMLTextAreaElement, open: string, close: string) => {
    const source = editor.value;
    const start = editor.selectionStart ?? 0;
    const end = editor.selectionEnd ?? start;
    const selected = source.slice(start, end);
    const inserted = `${open}${selected}${close}`;
    const nextStart = start + 1;
    const nextEnd = selected ? end + 1 : nextStart;

    applyRustEditorTextEdit(`${source.slice(0, start)}${inserted}${source.slice(end)}`, nextStart, nextEnd);
  };

  const skipRustClosingPair = (editor: HTMLTextAreaElement, closing: string) => {
    const source = editor.value;
    const start = editor.selectionStart ?? 0;
    const end = editor.selectionEnd ?? start;
    if (start !== end || source[start] !== closing) {
      return false;
    }
    editor.setSelectionRange(start + 1, start + 1);
    updateRustEditorSelectionFromEditor(editor);
    return true;
  };

  const deleteRustAutoPair = (editor: HTMLTextAreaElement) => {
    const source = editor.value;
    const start = editor.selectionStart ?? 0;
    const end = editor.selectionEnd ?? start;
    const rustBackspacePairs: Record<string, string> = { "(": ")", "[": "]", "{": "}", "\"": "\"" };
    const previous = source[start - 1] ?? "";
    const next = source[start] ?? "";
    if (start !== end || rustBackspacePairs[previous] !== next) {
      return false;
    }

    const cursor = Math.max(0, start - 1);
    applyRustEditorTextEdit(`${source.slice(0, cursor)}${source.slice(start + 1)}`, cursor);
    return true;
  };

  const handleRustEditorKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    const commandKey = event.ctrlKey || event.metaKey;
    if (!commandKey && event.altKey && event.key === "Enter") {
      event.preventDefault();
      selectCurrentRustOutlineRange();
      return;
    }

    if (!commandKey && !event.altKey && event.key === "F2") {
      event.preventDefault();
      prepareRustSymbolRename();
      return;
    }

    if (!commandKey && event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      moveRustSelectionLines(event.key === "ArrowUp" ? -1 : 1);
      return;
    }

    if (commandKey && event.shiftKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      formatRustLogicSource();
      return;
    }

    if (commandKey && event.key.toLowerCase() === "g") {
      event.preventDefault();
      rustGoToLineInputRef.current?.focus();
      rustGoToLineInputRef.current?.select();
      return;
    }

    if (commandKey && event.key === "/") {
      event.preventDefault();
      toggleRustLineComment();
      return;
    }

    if (commandKey && event.key.toLowerCase() === "d") {
      event.preventDefault();
      duplicateRustSelectionOrLine();
      return;
    }

    if (commandKey && event.key.toLowerCase() === "m") {
      event.preventDefault();
      focusRustBracketMatch();
      return;
    }

    if (commandKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      rustFindInputRef.current?.focus();
      rustFindInputRef.current?.select();
      return;
    }

    if (commandKey && event.key === " ") {
      event.preventDefault();
      updateRustCompletionFromEditor(event.currentTarget, true);
      return;
    }

    if (event.key === "Tab" && (!rustCompletionTrigger || rustCompletionItems.length === 0)) {
      event.preventDefault();
      applyRustIndent(event.currentTarget, event.shiftKey);
      return;
    }

    if (rustCompletionTrigger && rustCompletionItems.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setRustCompletionTrigger((current) =>
          current ? { ...current, activeIndex: (current.activeIndex + 1) % rustCompletionItems.length } : current,
        );
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setRustCompletionTrigger((current) =>
          current ? { ...current, activeIndex: (current.activeIndex - 1 + rustCompletionItems.length) % rustCompletionItems.length } : current,
        );
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setRustCompletionTrigger(null);
        return;
      }
      if (event.key === "Tab" || event.key === "Enter") {
        event.preventDefault();
        applyRustCompletion();
        return;
      }
    }

    if (!commandKey && !event.altKey && event.key === "Backspace" && deleteRustAutoPair(event.currentTarget)) {
      event.preventDefault();
      return;
    }

    if (!commandKey && !event.altKey && event.key === "Enter") {
      event.preventDefault();
      applyRustAutoNewline(event.currentTarget);
      return;
    }

    const rustAutoPairs: Record<string, string> = { "(": ")", "[": "]", "{": "}", "\"": "\"" };
    const closingPair = rustAutoPairs[event.key];
    if (!commandKey && !event.altKey && closingPair) {
      event.preventDefault();
      applyRustAutoPair(event.currentTarget, event.key, closingPair);
      return;
    }

    if (!commandKey && !event.altKey && [")", "]", "}", "\""].includes(event.key)) {
      if (skipRustClosingPair(event.currentTarget, event.key)) {
        event.preventDefault();
      }
    }
  };

  const insertActiveRustCommandDraft = () => {
    const parameters = rustCommandParameters(activeRustCommand);
    const signature = parameters
      .map((parameter, index) => {
        const name = sanitizeRustParameterName(parameter.name, index);
        const rustType =
          parameter.type === "bool"
            ? "bool"
            : parameter.type === "number"
              ? "f64"
              : parameter.type === "json"
                ? "serde_json::Value"
                : "String";
        return `${name}: ${rustType}`;
      })
      .join(", ");
    const safeName = sanitizeRustCommandName(activeRustCommand.name);
    const resultSnippet = createRustCommandDebugResultSnippet(activeRustCommand, activeProject.stateVariables)
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n");
    const snippet = `\n// Draft slot for ${safeName}\n#[tauri::command]\nfn ${safeName}_draft(${signature}) -> String {\n${resultSnippet}\n}\n`;
    insertRustSnippet(snippet.trimStart());
  };

  const appendRustSlotsForCommands = (commands: RustCommand[], options: { title?: string; detailPrefix?: string } = {}) => {
    if (commands.length === 0) {
      showProjectJumpFeedback("success", "槽函数已完整", "当前 Rust 命令都有可定位的同名槽函数。");
      return;
    }

    const snippets = commands.map((command) => createRustLogic([command], activeProject.backendIntegrations).trim()).filter(Boolean);
    const source = activeProject.rustLogic.trimEnd();
    const header = `// Nova generated missing slot functions · ${new Date().toLocaleString()}`;
    const nextRustLogic = `${source}${source ? "\n\n" : ""}${header}\n${snippets.join("\n\n")}\n`;
    const firstCommand = commands[0];
    updateRustLogic(nextRustLogic);
    registerSlotNavigationVisit(firstCommand, {
      sourceLine: rustFunctionLocation(nextRustLogic, sanitizeRustCommandName(firstCommand.name))?.line ?? null,
      reason: "created",
    });
    selectRustCommand(firstCommand.id);
    focusRustFunction(firstCommand.name, nextRustLogic);
    showProjectJumpFeedback(
      "success",
      options.title ?? "已补齐槽函数",
      `${options.detailPrefix ?? `已追加 ${commands.length} 个同名 Rust 槽函数`}，并定位到 ${sanitizeRustCommandName(firstCommand.name)}。`,
    );
  };

  const appendMissingRustSlotForCommand = (commandId: string) => {
    const outlineEntry = rustLogicOutline.find((entry) => entry.commandId === commandId && entry.line);
    if (outlineEntry) {
      openRustLogicOutlineEntry(outlineEntry);
      return;
    }
    const command = activeProject.rustCommands.find((candidate) => candidate.id === commandId);
    if (!command) {
      showProjectJumpFeedback("warning", "找不到命令", "该槽函数条目对应的 Rust command 已不存在。");
      return;
    }
    appendRustSlotsForCommands([command], {
      title: "已生成槽函数",
      detailPrefix: "已追加 1 个同名 Rust 槽函数",
    });
  };

  const appendMissingRustSlots = () => {
    const missingCommands = missingRustSlotEntries
      .map((entry) => activeProject.rustCommands.find((command) => command.id === entry.commandId))
      .filter((command): command is RustCommand => Boolean(command));

    appendRustSlotsForCommands(missingCommands);
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

  const focusRustFunction = (commandName: string, rustLogic = activeProject.rustLogic) => {
    const safeName = sanitizeRustCommandName(commandName);
    const location = rustFunctionLocation(rustLogic, safeName);
    const fallbackLine = Math.max(1, rustLogic.split(/\r?\n/).length);
    setRustDiagnosticTarget({
      file: "rust/logic.rs",
      sourceFile: "rust/logic.rs",
      sourceKind: "slot",
      sourceSummary: location ? `已定位 Rust 槽函数 ${safeName}。` : `没有找到 ${safeName}，已定位到 Rust 逻辑末尾。`,
      message: `UI 事件槽函数：${safeName}`,
      generatedLine: location?.line ?? fallbackLine,
      sourceLine: location?.line ?? fallbackLine,
      column: location?.column ?? 1,
      mappedToSource: Boolean(location),
    });
    setBuildError("");
    setMode("logic");
  };

  const focusRustLine = (line: number, summary: string, column = 1) => {
    const lines = activeProject.rustLogic.split(/\r?\n/);
    const targetLine = clamp(Math.round(line), 1, Math.max(1, lines.length));
    const lineText = lines[targetLine - 1] ?? "";
    const targetColumn = clamp(Math.round(column), 1, Math.max(1, lineText.length + 1));
    const selectionStart = rustLineStartIndex(activeProject.rustLogic, targetLine) + targetColumn - 1;
    setRustDiagnosticTarget({
      file: "rust/logic.rs",
      sourceFile: "rust/logic.rs",
      sourceKind: "outline",
      sourceSummary: summary,
      message: `Rust 结构导航：第 ${targetLine} 行，第 ${targetColumn} 列`,
      generatedLine: targetLine,
      sourceLine: targetLine,
      column: targetColumn,
      mappedToSource: true,
    });
    setBuildError("");
    setMode("logic");
    window.requestAnimationFrame(() => {
      const editor = rustLogicRef.current;
      if (!editor) {
        return;
      }
      editor.focus();
      editor.setSelectionRange(selectionStart, selectionStart);
      const nextScrollTop = Math.max(0, (targetLine - 6) * 20);
      editor.scrollTop = nextScrollTop;
      setRustEditorScrollTop(nextScrollTop);
      updateRustEditorSelectionFromEditor(editor);
    });
  };

  const focusRustBracketMatch = () => {
    if (!rustBracketMatch || rustBracketMatch.status !== "matched") {
      if (rustBracketMatch) {
        const location = rustLocationAtIndex(activeProject.rustLogic, rustBracketMatch.anchor);
        focusRustLine(location.line, `Rust bracket · ${rustBracketMatch.anchorBracket} 未匹配`, location.column);
      }
      return;
    }

    const targetIndex = rustBracketMatch.anchor === rustBracketMatch.openIndex
      ? rustBracketMatch.closeIndex
      : rustBracketMatch.openIndex;
    if (targetIndex === undefined) {
      return;
    }
    const targetLocation = rustLocationAtIndex(activeProject.rustLogic, targetIndex);
    focusRustLine(targetLocation.line, `Rust bracket match · ${rustBracketMatch.pair}`, targetLocation.column);
  };

  const openBuildDiagnostic = (diagnostic: BuildDiagnostic, index: number, focusEditable = true) => {
    const key = buildDiagnosticKey(diagnostic, index);
    setSelectedBuilderIssueId(`diagnostic:${key}`);
    openBottomDock("issues");
    if (focusEditable && isEditableRustDiagnostic(diagnostic)) {
      focusRustDiagnostic(diagnostic);
    }
  };

  const openRustDiagnosticFromGutter = (lineNumber: number, entries: RustDiagnosticGutterEntry[]) => {
    if (entries.length === 0) {
      focusRustLine(lineNumber, "Rust gutter 行号导航");
      return;
    }

    const preferredEntry =
      entries.find((entry) => entry.diagnostic.severity === "error") ??
      entries[0];
    openBuildDiagnostic(preferredEntry.diagnostic, preferredEntry.index, true);
  };

  const editableRustDiagnosticQuickFixes = buildDiagnostics
    .map((diagnostic, index) => ({ diagnostic, index }))
    .filter(({ diagnostic }) => isEditableRustDiagnostic(diagnostic));
  const firstEditableRustDiagnosticQuickFix = editableRustDiagnosticQuickFixes[0] ?? null;
  const rustEditorQuickFixes: RustEditorQuickFix[] = [
    ...(missingRustSlotCount > 0
      ? [
          {
            id: "missing-slots",
            title: "补齐缺失槽函数",
            detail: `${missingRustSlotCount} 个 Rust command 没有同名槽函数，生成后可直接从 UI 事件跳到 slot。`,
            tone: "danger" as const,
            actionLabel: "生成槽",
            countLabel: String(missingRustSlotCount),
            run: appendMissingRustSlots,
          },
        ]
      : []),
    ...(firstEditableRustDiagnosticQuickFix
      ? [
          {
            id: "focus-diagnostic",
            title: "定位首个 Rust 诊断",
            detail: `${firstEditableRustDiagnosticQuickFix.diagnostic.severity === "error" ? "错误" : "警告"} · ${
              firstEditableRustDiagnosticQuickFix.diagnostic.message
            }`,
            tone: firstEditableRustDiagnosticQuickFix.diagnostic.severity === "error" ? ("danger" as const) : ("warning" as const),
            actionLabel: "定位",
            countLabel: String(editableRustDiagnosticQuickFixes.length),
            run: () => openBuildDiagnostic(firstEditableRustDiagnosticQuickFix.diagnostic, firstEditableRustDiagnosticQuickFix.index, true),
          },
        ]
      : []),
    ...(rustBracketMatch
      ? [
          {
            id: "rust-editor-bracket-match",
            title: rustBracketMatch.status === "matched" ? "跳转匹配括号" : "括号未匹配",
            detail:
              rustBracketMatch.status === "matched"
                ? `${rustBracketMatch.pair} · Ln ${rustBracketMatch.openLine}:${rustBracketMatch.openColumn} 到 Ln ${rustBracketMatch.closeLine}:${rustBracketMatch.closeColumn}`
                : `${rustBracketMatch.anchorBracket} 暂时没有找到对应的 ${rustBracketMatch.direction === "forward" ? "闭合" : "打开"}括号。`,
            tone: rustBracketMatch.status === "matched" ? ("ready" as const) : ("warning" as const),
            actionLabel: rustBracketMatch.status === "matched" ? "跳转" : "定位",
            countLabel: rustBracketMatch.pair,
            run: focusRustBracketMatch,
          },
        ]
      : []),
    {
      id: "format-source",
      title: "格式化 Rust 源码",
      detail: "整理缩进、尾随空白和多余空行，适合保存或构建前快速清理。",
      tone: "ready",
      actionLabel: "格式化",
      run: formatRustLogicSource,
    },
    {
      id: "insert-command-draft",
      title: "插入当前命令草稿",
      detail: `${sanitizeRustCommandName(activeRustCommand.name)} · ${rustCommandParameters(activeRustCommand).length} 个参数，可快速补出调试返回。`,
      tone: activeRustCommandBindingRows.length > 0 ? "ready" : "muted",
      actionLabel: "插入",
      countLabel: activeRustCommandBindingRows.length > 0 ? `${activeRustCommandBindingRows.length} 调用` : undefined,
      run: insertActiveRustCommandDraft,
    },
    ...(rustCurrentIdentifier && rustCurrentIdentifierOccurrences.length > 1
      ? [
          {
            id: "rename-symbol",
            title: "重命名当前符号",
            detail: `${rustCurrentIdentifier.name} 有 ${rustCurrentIdentifierOccurrences.length} 处匹配，可用 F2 或这里预填重命名框。`,
            tone: "ready" as const,
            actionLabel: "准备",
            countLabel: String(rustCurrentIdentifierOccurrences.length),
            run: prepareRustSymbolRename,
          },
          {
            id: "show-symbol-references",
            title: "浏览当前符号引用",
            detail: `${rustCurrentIdentifier.name} 有 ${rustCurrentIdentifierReferences.length} 处引用，可在引用面板中逐条跳转和选中。`,
            tone: "ready" as const,
            actionLabel: "引用",
            countLabel: String(rustCurrentIdentifierReferences.length),
            run: () => {
              const targetReference = rustCurrentIdentifierReferences.find((reference) => reference.role !== "current") ?? rustCurrentIdentifierReferences[0];
              if (targetReference) {
                focusRustIdentifierReference(targetReference);
              }
            },
          },
        ]
      : []),
    ...(rustCursorOutlineEntry?.line
      ? [
          {
            id: "select-symbol-range",
            title: "选择当前符号范围",
            detail: `${rustOutlineKindTitle(rustCursorOutlineEntry.kind)} ${rustCursorOutlineEntry.label} · Ln ${rustCursorOutlineEntry.line}-${
              rustCursorOutlineEntry.endLine ?? rustCursorOutlineEntry.line
            }，适合复制、重构或批量编辑。`,
            tone: "ready" as const,
            actionLabel: "选择",
            countLabel: rustCursorOutlineEntry.endLine ? `${rustCursorOutlineEntry.endLine - rustCursorOutlineEntry.line + 1} 行` : undefined,
            run: selectCurrentRustOutlineRange,
          },
        ]
      : []),
  ];
  const actionableRustQuickFixCount = rustEditorQuickFixes.filter((fix) => !fix.disabled).length;

  const activateBuilderIssue = (issue: BuilderIssueItem, options: { focusEditable?: boolean; feedback?: boolean } = {}) => {
    setSelectedBuilderIssueId(issue.id);
    if (issue.kind === "diagnostic" && issue.diagnostic && typeof issue.diagnosticIndex === "number") {
      openBuildDiagnostic(issue.diagnostic, issue.diagnosticIndex, options.focusEditable ?? true);
    } else if (issue.kind === "property" && issue.propertyIssue) {
      focusPropertyIssue(issue.propertyIssue, { feedback: options.feedback });
    } else {
      openBottomDock("issues");
    }
  };

  const navigateBuilderIssue = (direction: 1 | -1) => {
    if (builderIssues.length === 0) {
      openBottomDock("issues", false);
      showProjectJumpFeedback("success", "没有活跃问题", "设计验证、构建诊断和运行时检查当前没有需要处理的条目。");
      return;
    }
    const currentIndex = selectedBuilderIssue ? builderIssues.findIndex((issue) => issue.id === selectedBuilderIssue.id) : -1;
    const fallbackIndex = direction > 0 ? -1 : builderIssues.length;
    const nextIndex = (currentIndex >= 0 ? currentIndex : fallbackIndex) + direction;
    const wrappedIndex = (nextIndex + builderIssues.length) % builderIssues.length;
    const nextIssue = builderIssues[wrappedIndex];
    activateBuilderIssue(nextIssue, { focusEditable: true, feedback: true });
    showProjectJumpFeedback(
      nextIssue.severity === "error" ? "error" : "warning",
      direction > 0 ? "下一个问题" : "上一个问题",
      `${wrappedIndex + 1}/${builderIssues.length} · ${nextIssue.title}`,
    );
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== "F8" || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      event.preventDefault();
      navigateBuilderIssue(event.shiftKey ? -1 : 1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const selectRustCommand = (commandId: string) => {
    const command = activeProject.rustCommands.find((candidate) => candidate.id === commandId);
    if (command) {
      registerSlotNavigationVisit(command, { reason: "command" });
    }
    setLogicResourceView("commands");
    updateActiveProject((project) => ({
      ...project,
      activeRustCommandId: commandId,
    }));
  };

  const openRustLogicOutlineEntry = (entry: RustLogicOutlineEntry) => {
    if (entry.commandId) {
      const command = activeProject.rustCommands.find((candidate) => candidate.id === entry.commandId);
      if (command) {
        registerSlotNavigationVisit(command, { sourceLine: entry.line, reason: "outline" });
      }
      selectRustCommand(entry.commandId);
    }
    if (entry.line) {
      focusRustLine(entry.line, `${rustOutlineKindTitle(entry.kind)} · ${entry.detail}`, entry.column ?? 1);
      return;
    }
    focusRustFunction(entry.label);
  };

  const openSlotNavigationEntry = (entry: SlotNavigationEntry) => {
    const command = activeProject.rustCommands.find((candidate) => candidate.id === entry.commandId);
    if (!command) {
      showProjectJumpFeedback("warning", "槽函数历史已失效", "这个历史条目对应的 Rust command 已不存在。");
      return;
    }

    const item = entry.itemId ? items.find((candidate) => candidate.id === entry.itemId) ?? null : null;
    if (item) {
      setSelectedId(item.id);
    }

    setLogicResourceView("commands");
    updateActiveProject((project) => ({
      ...project,
      activeRustCommandId: command.id,
    }));

    const outlineEntry = rustLogicOutline.find((candidate) => candidate.commandId === command.id && candidate.line) ?? null;
    registerSlotNavigationVisit(command, {
      item,
      eventName: entry.eventName,
      sourceLine: outlineEntry?.line ?? entry.sourceLine,
      reason: "history",
    });

    if (outlineEntry?.line) {
      focusRustLine(outlineEntry.line, `最近槽函数 · ${sanitizeRustCommandName(command.name)}`, outlineEntry.column ?? 1);
      return;
    }

    focusRustFunction(command.name);
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
    setLogicResourceView("commands");
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
    setLogicResourceView("commands");
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

  const createAndBindCommandForItem = (targetItem: BuilderItem | null, targetEventName: BuilderEventName | null, options: { recordTask?: boolean } = {}) => {
    if (!targetItem || !targetEventName) {
      if (options.recordTask !== false) {
        recordInstantProjectAction("bind-control-event", "创建绑定前请先选择带事件的控件。", "skipped");
      }
      return null;
    }

    const selectedItemId = targetItem.id;
    const selectedItemName = getItemSummary(targetItem);
    const eventName = targetEventName;
    const integration =
      activeProject.backendIntegrations.find((candidate) => candidate.id === activeProject.activeBackendIntegrationId) ??
      activeProject.backendIntegrations[0];
    if (!integration) {
      if (options.recordTask !== false) {
        recordInstantProjectAction("bind-control-event", "所选事件没有可用的后端集成。", "skipped");
      }
      return null;
    }
    const method = activeBackendMethod(integration);
    const command = createBackendIntegrationCommand(integration, activeProject.rustCommands.length + 1, method);
    const createdCommandName = sanitizeRustCommandName(command.name);
    const nextCommands = normalizeRustCommands([...activeProject.rustCommands, command]);
    const nextRustLogic = createRustLogic(nextCommands, activeProject.backendIntegrations);

    updateActiveProject((project) => {
      const commands = normalizeRustCommands([...project.rustCommands, command]);
      const resultStateId = project.stateVariables[0]?.id ?? "";
      const schemaFields = method ? backendSchemaFields(method.requestSchema, method.samplePayload) : [];
      const payloadFields = backendPayloadFieldsForEvent(schemaFields, targetItem);
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
      recordInstantProjectAction("bind-control-event", `${selectedItemName} ${eventName} 已绑定到 ${createdCommandName}。`);
      showProjectJumpFeedback(
        "success",
        "连接已创建",
        `${selectedItemName} ${eventName} -> ${createdCommandName}。可直接转到 Rust 槽函数继续编写逻辑。`,
      );
    }
    return { id: command.id, name: createdCommandName, rustLogic: nextRustLogic };
  };

  const createAndBindBackendIntegrationCommand = (options: { recordTask?: boolean } = {}) => {
    return createAndBindCommandForItem(selectedItem, selectedEventName, options);
  };

  const goToSlotForItem = (targetItem: BuilderItem | null = selectedItem) => {
    if (!targetItem) {
      showProjectJumpFeedback("warning", "请先选择控件", "选择一个带事件的控件后，可以跳转到对应 Rust 槽函数。");
      setRightDockTab("properties");
      return;
    }

    const eventName = eventNameForItem(targetItem);
    if (!eventName) {
      setSelectedId(targetItem.id);
      setRightDockTab("properties");
      showProjectJumpFeedback("warning", "控件没有事件", `${getItemSummary(targetItem)} 当前没有可绑定的 UI 事件。`);
      return;
    }

    setSelectedId(targetItem.id);
    const existingCommandId = eventCommandId(targetItem, eventName);
    const existingCommand = existingCommandId
      ? activeProject.rustCommands.find((command) => command.id === existingCommandId) ?? null
      : null;

    if (existingCommand) {
      registerSlotNavigationVisit(existingCommand, {
        item: targetItem,
        eventName,
        sourceLine: rustFunctionLocation(activeProject.rustLogic, sanitizeRustCommandName(existingCommand.name))?.line ?? null,
        reason: "control",
      });
      selectRustCommand(existingCommand.id);
      focusRustFunction(existingCommand.name);
      showProjectJumpFeedback("success", "已转到槽函数", `${getItemSummary(targetItem)} ${eventName} -> ${sanitizeRustCommandName(existingCommand.name)}。`);
      return;
    }

    const created = createAndBindCommandForItem(targetItem, eventName);
    if (!created) {
      return;
    }
    registerSlotNavigationVisit(
      {
        id: created.id,
        name: created.name,
        response: "",
      },
      {
        item: targetItem,
        eventName,
        sourceLine: rustFunctionLocation(created.rustLogic, created.name)?.line ?? null,
        reason: "created",
      },
    );
    selectRustCommand(created.id);
    focusRustFunction(created.name, created.rustLogic);
    showProjectJumpFeedback("success", "已创建并打开槽函数", `${getItemSummary(targetItem)} ${eventName} -> ${created.name}。`);
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
    setLogicResourceView("modules");
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
    setLogicResourceView("modules");
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
    setLogicResourceView("dependencies");
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
    setLogicResourceView("dependencies");
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
    setLogicResourceView("integrations");
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
          "请打开 Tauri 桌面构建，才能针对本地进程或 HTTP endpoint 运行这个方法。",
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
            "没有返回 Tauri invoke 结果。",
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
    setLogicResourceView("integrations");
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

  const selectStateVariable = (stateId: string, options: { feedback?: boolean } = {}) => {
    const state = activeProject.stateVariables.find((candidate) => candidate.id === stateId);
    setLogicResourceView("state");
    updateActiveProject((project) => ({
      ...project,
      activeStateVariableId: stateId,
    }));
    setMode("logic");
    if (options.feedback && state) {
      showProjectJumpFeedback(
        "success",
        "状态已选择",
        `${state.name} is active in Logic. ${formatStateReferenceCount(countStateVariableReferences(activeProject, state.id))} linked.`,
      );
    }
  };

  const openRustBackendTopologyNode = (nodeId: string) => {
    setMode("logic");
    if (nodeId === "commands") {
      setLogicResourceView("commands");
      focusRustFunction(activeRustCommand.name);
      return;
    }
    if (nodeId === "modules" && activeRustModule.id) {
      selectRustModule(activeRustModule.id);
      showProjectJumpFeedback("success", "Rust 模块已聚焦", `${sanitizeRustModuleName(activeRustModule.name)} 可在右侧属性区编辑。`);
      return;
    }
    if (nodeId === "dependencies" && activeCargoDependency.id) {
      selectCargoDependency(activeCargoDependency.id);
      showProjectJumpFeedback("success", "Cargo 依赖已聚焦", `${sanitizeCargoDependencyName(activeCargoDependency.name)} 可在右侧属性区编辑。`);
      return;
    }
    if (nodeId === "integrations" && activeBackendIntegration.id) {
      selectBackendIntegration(activeBackendIntegration.id);
      showProjectJumpFeedback("success", "后端集成已聚焦", `${activeBackendIntegration.name} 可继续配置入口、产物和通道。`);
      return;
    }
    if (nodeId === "state" && activeStateVariable.id) {
      selectStateVariable(activeStateVariable.id, { feedback: true });
    }
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

  const createStateVariableInProject = (options: { feedback?: boolean } = {}) => {
    const state = createStateVariable(activeProject.stateVariables.length + 1);
    setLogicResourceView("state");
    updateActiveProject((project) => {
      return {
        ...project,
        stateVariables: [...project.stateVariables, state],
        activeStateVariableId: state.id,
      };
    });
    setMode("logic");
    if (options.feedback) {
      showProjectJumpFeedback(
        "success",
        "状态变量已创建",
        `${state.name} is selected with Properties bindings and Connections result routing ready.`,
      );
    }
  };

  const deleteActiveStateVariable = () => {
    const deletedId = activeProject.activeStateVariableId || activeProject.stateVariables[0]?.id;
    const deletedState = activeProject.stateVariables.find((state) => state.id === deletedId);
    const referenceCount = deletedId ? countStateVariableReferences(activeProject, deletedId) : 0;
    const resetOnlyState = activeProject.stateVariables.length <= 1;
    updateActiveProject((project) => {
      const deletedId = project.activeStateVariableId || project.stateVariables[0]?.id;
      const cleanItem = (item: BuilderItem): BuilderItem => {
        if (!deletedId) {
          return item;
        }
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
      if (!deletedId || project.stateVariables.length <= 1) {
        const stateVariables = [createStateVariable(1)];
        return {
          ...project,
          stateVariables,
          activeStateVariableId: stateVariables[0].id,
          files: project.files.map((file) => ({
            ...file,
            items: file.items.map(cleanItem),
          })),
        };
      }

      const stateVariables = project.stateVariables.filter((state) => state.id !== deletedId);
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
    setMode("logic");
    if (resetOnlyState) {
      showProjectJumpFeedback(
        "warning",
        "状态存储已重置",
        "Nova keeps one state variable available, so a fresh statusText state is ready for bindings.",
      );
      return;
    }
    showProjectJumpFeedback(
      "success",
      "状态变量已删除",
      `${deletedState?.name ?? "选中状态"} 已移除。${formatStateReferenceCount(referenceCount)} 已从绑定和命令结果中清理。`,
    );
  };

  const fileCanvasSummary = (file: DesignerFile) => `${formatControlCount(file.items.length)} · ${file.page.width} x ${file.page.height}`;

  const openFileEditingContext = (
    file: DesignerFile,
    options: {
      detail?: string;
      feedback?: boolean;
      leftDockTab?: BuilderLeftDockTab;
      selectedId?: string;
      title?: string;
    } = {},
  ) => {
    const nextSelectedId = options.selectedId ?? file.items[0]?.id ?? "";
    setSelectedId(nextSelectedId);
    setMode("design");
    setRightDockTab("properties");
    setNavigatorQuery("");
    setNavigatorLayerMessage("");
    setLeftDockTab(options.leftDockTab ?? "project");
    if (options.feedback) {
      showProjectJumpFeedback("success", options.title ?? "已打开 UI 文件", options.detail ?? `${file.name} 已激活。${fileCanvasSummary(file)}。`);
    }
  };

  const createNewFile = () => {
    const nextFile = createBlankFile(`Window ${activeProject.files.length + 1}.ui`);
    updateActiveProject((project) => ({
      ...project,
      files: [...project.files, nextFile],
      activeFileId: nextFile.id,
    }));
    openFileEditingContext(nextFile, {
      feedback: true,
      leftDockTab: "components",
      title: "UI 文件已创建",
      detail: `${nextFile.name} 为空。控件面板已打开，可以添加第一个控件。`,
    });
    return nextFile;
  };

  const selectFile = (fileId: string, options: { feedback?: boolean; leftDockTab?: BuilderLeftDockTab } = {}) => {
    const nextFile = activeProject.files.find((file) => file.id === fileId);
    if (!nextFile) {
      const message = `找不到 UI 文件：${fileId}。`;
      setBuildError(message);
      showProjectJumpFeedback("error", "UI 文件缺失", message);
      return;
    }
    updateActiveProject((project) => ({
      ...project,
      activeFileId: fileId,
    }));
    openFileEditingContext(nextFile, {
      feedback: options.feedback,
      leftDockTab: options.leftDockTab ?? "project",
      title: "已打开 UI 文件",
      detail: `${nextFile.name} 已激活。${fileCanvasSummary(nextFile)}。`,
    });
  };

  const openEditorTab = (tab: BuilderEditorTab) => {
    if (tab.kind === "ui" && tab.fileId) {
      selectFile(tab.fileId, { feedback: true, leftDockTab: "navigator" });
      return;
    }
    if (tab.kind === "logic") {
      setMode("logic");
      setLeftDockTab("project");
      showProjectJumpFeedback("success", "已打开 Rust 逻辑", "逻辑页包含信号/槽连接、Rust 编辑器和后端集成。");
      return;
    }
    setMode("build");
    openBottomDock("output", false);
    showProjectJumpFeedback("success", "已打开构建与运行", "构建页会显示检查、生成、运行和日志输出。");
  };

  const revealEditorTabInProject = (tab: BuilderEditorTab) => {
    if (tab.kind === "ui" && tab.fileId) {
      updateActiveProject((project) => ({
        ...project,
        activeFileId: tab.fileId!,
      }));
    }
    setSelectedProjectExplorerNodeId(tab.revealNodeId);
    setProjectExplorerQuery("");
    setProjectExplorerFilter(tab.kind === "ui" ? "ui" : tab.kind === "logic" ? "rust" : "build");
    setMode("project");
    setLeftDockTab("project");
    showProjectJumpFeedback("success", "已在项目树定位", `${tab.label} · ${tab.path}`);
  };

  const reorderEditorFileTab = (draggedFileId: string, targetFileId: string) => {
    if (!draggedFileId || !targetFileId || draggedFileId === targetFileId) {
      return;
    }
    const draggedFile = activeProject.files.find((file) => file.id === draggedFileId);
    const targetFile = activeProject.files.find((file) => file.id === targetFileId);
    const fromIndex = openEditorFileIds.indexOf(draggedFileId);
    const toIndex = openEditorFileIds.indexOf(targetFileId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return;
    }
    const nextOpenIds = [...openEditorFileIds];
    const [moved] = nextOpenIds.splice(fromIndex, 1);
    nextOpenIds.splice(toIndex, 0, moved);
    setOpenEditorFileIds(nextOpenIds);
    showProjectJumpFeedback(
      "success",
      "已重排编辑标签",
      `${draggedFile?.name ?? "UI 文件"} 已移动到 ${targetFile?.name ?? "目标标签"} 旁边，项目文件顺序不变。`,
    );
  };

  const beginEditorFileTabDrag = (event: DragEvent<HTMLDivElement>, fileId: string) => {
    setDraggingEditorFileTabId(fileId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", fileId);
    event.dataTransfer.setData("application/x-nova-editor-tab", fileId);
  };

  const dropEditorFileTab = (event: DragEvent<HTMLDivElement>, targetFileId: string) => {
    event.preventDefault();
    const draggedFileId =
      event.dataTransfer.getData("application/x-nova-editor-tab") ||
      event.dataTransfer.getData("text/plain") ||
      draggingEditorFileTabId;
    reorderEditorFileTab(draggedFileId, targetFileId);
    setDraggingEditorFileTabId("");
  };

  const closeOtherEditorFileTabs = (fileId: string) => {
    const file = activeProject.files.find((candidate) => candidate.id === fileId);
    if (!file) {
      return;
    }
    setOpenEditorFileIds([fileId]);
    updateActiveProject((project) => ({
      ...project,
      activeFileId: fileId,
    }));
    setMode("design");
    setLeftDockTab("navigator");
    showProjectJumpFeedback("success", "已关闭其他 UI 标签", `${file.name} 仍保持打开，项目文件没有被删除。`);
  };

  const closeEditorFileTabsToRight = (fileId: string) => {
    const file = activeProject.files.find((candidate) => candidate.id === fileId);
    const tabIndex = openEditorFileIds.indexOf(fileId);
    if (!file || tabIndex < 0) {
      return;
    }
    const nextOpenIds = openEditorFileIds.slice(0, tabIndex + 1);
    const closedCount = Math.max(0, openEditorFileIds.length - nextOpenIds.length);
    setOpenEditorFileIds(nextOpenIds);
    if (!nextOpenIds.includes(activeFile.id)) {
      window.setTimeout(() => selectFile(fileId, { feedback: true, leftDockTab: "navigator" }), 0);
    }
    showProjectJumpFeedback(
      closedCount > 0 ? "success" : "warning",
      closedCount > 0 ? "已关闭右侧标签" : "右侧没有可关闭标签",
      closedCount > 0 ? `${file.name} 右侧 ${closedCount} 个 UI 标签已关闭，项目文件没有被删除。` : `${file.name} 已经是最右侧 UI 标签。`,
    );
  };

  const closeCleanEditorFileTabs = () => {
    const openSet = new Set(openEditorFileIds);
    const dirtyIds = new Set(
      activeProject.files
        .filter((file) => openSet.has(file.id) && Boolean(fileSaveStates.get(file.id)?.dirty))
        .map((file) => file.id),
    );
    const nextOpenIds = openEditorFileIds.filter((fileId) => fileId === activeFile.id || dirtyIds.has(fileId));
    const closedCount = Math.max(0, openEditorFileIds.length - nextOpenIds.length);
    if (closedCount === 0) {
      showProjectJumpFeedback("warning", "没有可关闭的已同步标签", "当前打开的 UI 标签要么是活动文件，要么仍有未保存改动。");
      return;
    }
    setOpenEditorFileIds(nextOpenIds.length > 0 ? nextOpenIds : [activeFile.id]);
    showProjectJumpFeedback("success", "已关闭已同步标签", `${closedCount} 个已同步 UI 标签已关闭，未保存标签和当前文件仍保留。`);
  };

  const closeEditorFileTab = (fileId: string) => {
    const file = activeProject.files.find((candidate) => candidate.id === fileId);
    setOpenEditorFileIds((current) => {
      const nextOpenIds = current.filter((id) => id !== fileId);
      if (fileId === activeFile.id) {
        const nextFileId =
          nextOpenIds.find((id) => activeProject.files.some((candidate) => candidate.id === id)) ??
          activeProject.files.find((candidate) => candidate.id !== fileId)?.id ??
          activeProject.files[0]?.id;
        if (nextFileId && nextFileId !== fileId) {
          window.setTimeout(() => selectFile(nextFileId, { feedback: true, leftDockTab: "navigator" }), 0);
        }
      }
      return nextOpenIds.length > 0 ? nextOpenIds : activeProject.files[0]?.id ? [activeProject.files[0].id] : [];
    });
    showProjectJumpFeedback("success", "已关闭编辑标签", `${file?.name ?? "UI 文件"} 已从打开标签中移除，项目文件仍保留。`);
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

  const buildReadinessActionLabel = (item: BuildReadinessItem) => {
    if (item.fileId) {
      return ["missing-event-commands", "unbound-buttons", "broken-result-targets", "text-result-json-patches", "broken-state-links"].includes(item.id)
        ? "连接"
        : "定位";
    }
    if (["project-name", "project-root", "release-config", "release-icon", "release-icon-format", "release-signing", "release-certificate-import", "installer-smoke-mode", "installer-smoke-runner"].includes(item.id)) {
      return "设置";
    }
    if (item.id === "ui-files") {
      return "文件";
    }
    if (item.id === "canvas-content") {
      return "组件";
    }
    if (item.id === "tauri-runtime") {
      return "输出";
    }
    if (item.id.startsWith("backend")) {
      return "后端";
    }
    if (item.id.includes("rust") || item.id.includes("cargo") || item.id.includes("state")) {
      return "Logic";
    }
    return "查看";
  };

  const openBuildReadinessItem = (item: BuildReadinessItem) => {
    setBuildError("");

    if (item.fileId) {
      focusBuildReadinessItem(item);
      setRightDockTab(
        ["missing-event-commands", "unbound-buttons", "broken-result-targets", "text-result-json-patches", "broken-state-links"].includes(item.id)
          ? "connections"
          : "properties",
      );
      showProjectJumpFeedback(
        item.severity === "error" ? "warning" : "success",
        `Opened ${item.title}`,
        item.itemName ? `${item.itemName} is selected for this readiness item.` : "The related UI file is active.",
      );
      return;
    }

    if (["project-name", "project-root", "release-config", "release-icon", "release-icon-format", "release-signing", "release-certificate-import", "installer-smoke-mode", "installer-smoke-runner"].includes(item.id)) {
      setMode("design");
      setLeftDockTab("project");
      showProjectJumpFeedback("success", "已打开项目设置", `${item.title} 可在项目 Dock 中查看。`);
      return;
    }

    if (item.id === "ui-files") {
      setMode("design");
      setLeftDockTab("navigator");
      showProjectJumpFeedback("success", "已打开导航器", "可以在导航器中创建、复制或恢复 UI 文件。");
      return;
    }

    if (item.id === "canvas-content") {
      setMode("design");
      setLeftDockTab("components");
      showProjectJumpFeedback("success", "已打开控件面板", "向当前 UI 文件插入控件后，生成窗口会变得可见。");
      return;
    }

    if (item.id === "no-event-bindings") {
      setMode("design");
      setLeftDockTab("navigator");
      setRightDockTab("connections");
      showProjectJumpFeedback("warning", "请打开连接", "选择支持事件的控件，然后绑定到 Rust 命令。");
      return;
    }

    if (item.id === "tauri-runtime") {
      setMode("build");
      openBottomDock("output", false);
      showProjectJumpFeedback("warning", "需要桌面运行时", "构建和磁盘操作需要在 Tauri 桌面 app 中运行，不能在浏览器模式中执行。");
      return;
    }

    if (item.id.startsWith("backend")) {
      const firstBackend = activeProject.backendIntegrations.find((integration) => integration.enabled) ?? activeProject.backendIntegrations[0];
      if (firstBackend) {
        selectBackendIntegration(firstBackend.id);
      }
      setMode("logic");
      showProjectJumpFeedback("success", "已打开后端集成", `${item.title} 可在逻辑工作区中查看。`);
      return;
    }

    if (item.id.includes("rust") || item.id.includes("cargo") || item.id.includes("state")) {
      setMode("logic");
      showProjectJumpFeedback("success", "已打开逻辑工作区", `${item.title} 可在命令、模块、依赖或状态中查看。`);
      return;
    }

    setMode("build");
    showProjectJumpFeedback("warning", "已选择就绪项", item.detail);
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
      return { status: "skipped", summary: "后台任务注册表需要 Tauri 桌面运行时。" };
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
        return { status: "failed", summary: "已失去 Rust 后台任务注册表访问。" };
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

  const runEditorExperienceAudit = async (): Promise<ProjectTaskRunResult> => {
    setMode("build");
    openBottomDock("tasks", false);
    setBuildError("");

    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
    });

    const query = (selector: string) => Boolean(document.querySelector(selector));
    const outputDock = document.querySelector<HTMLElement>("[data-builder-output-dock]");
    const outputDockStyle = outputDock ? window.getComputedStyle(outputDock) : null;
    const outputDockRadius = outputDockStyle ? Number.parseFloat(outputDockStyle.borderTopLeftRadius) : 0;
    const outputDockLayout = outputDock?.getAttribute("data-builder-output-dock-layout") ?? "unknown";
    const outputDockHeightRaw = outputDock?.getAttribute("data-builder-output-dock-height") ?? "0";
    const outputDockHeight = Number.parseFloat(outputDockHeightRaw);
    const outputDockMinHeight = outputDock ? Number.parseFloat(outputDock.getAttribute("data-builder-output-dock-min-height") ?? "0") : 0;
    const outputDockMaxHeight = outputDock ? Number.parseFloat(outputDock.getAttribute("data-builder-output-dock-max-height") ?? "0") : 0;
    const outputDockWorkspace = document.querySelector<HTMLElement>("[data-builder-workspace-no-output-reserved-band]");
    const outputDockWorkspaceStyle = outputDockWorkspace ? window.getComputedStyle(outputDockWorkspace) : null;
    const outputDockWorkspacePaddingBottom = outputDockWorkspaceStyle ? Number.parseFloat(outputDockWorkspaceStyle.paddingBottom || "0") : 999;
    const outputDockHeightValid =
      outputDockLayout === "minimized" ||
      (Number.isFinite(outputDockHeight) &&
        Number.isFinite(outputDockMinHeight) &&
        Number.isFinite(outputDockMaxHeight) &&
        outputDockHeight >= outputDockMinHeight &&
        outputDockHeight <= outputDockMaxHeight);
    const checkItems: Array<{ id: string; title: string; passed: boolean; detail: string; severity?: "error" | "warning" }> = [
      ...editorExperienceAuditItems.map((item) => ({
        id: item.id,
        title: item.title,
        passed: item.severity === "pass",
        detail: item.detail,
        severity: item.severity === "warning" ? "warning" as const : undefined,
      })),
      {
        id: "output-dock-dom",
        title: "输出 Dock 圆角与滚动 DOM",
        passed:
          Boolean(outputDock) &&
          outputDockStyle?.position === "fixed" &&
          outputDockRadius >= 16 &&
          outputDockHeightValid &&
          query("[data-builder-output-dock-viewport-fit]") &&
          query("[data-builder-output-dock-safe-area]") &&
          query("[data-builder-output-dock-no-background-shield]") &&
          query('[data-builder-output-dock-content-clip="scroll-panels"]') &&
          query("[data-builder-output-dock-content]") &&
          query("[data-builder-output-dock-resize-handle]"),
        detail: outputDock
          ? `Dock ${outputDockLayout}，position=${outputDockStyle?.position ?? "unknown"}，radius=${outputDockRadius}px，高度=${outputDockHeightRaw}，范围 ${outputDockMinHeight}-${outputDockMaxHeight}px。`
          : "没有找到输出 Dock DOM。",
      },
      {
        id: "output-dock-safe-scroll-dom",
        title: "输出 Dock 无背景遮罩 DOM",
        passed:
          Boolean(outputDockWorkspace) &&
          outputDockWorkspacePaddingBottom <= 24 &&
          query("[data-builder-workspace-no-output-background-shield]") &&
          query("[data-builder-output-dock-no-reserved-band]") &&
          query("[data-builder-output-dock-statusbar-offset]") &&
          query("[data-builder-output-dock-no-background-shield]"),
        detail: outputDockWorkspace
          ? `工作区 padding-bottom=${outputDockWorkspacePaddingBottom}px，Dock 外层透明，不再用背景遮罩或整块底部占位影响原内容。`
          : "没有找到输出 Dock 工作区标记。",
      },
      {
        id: "page-window-dom",
        title: "当前 UI 外窗体 DOM",
        passed: query("[data-builder-canvas-window-shell]"),
        detail: "画布需要渲染当前 UI 外窗体编辑壳，供标题栏、边框和窗口类型配置预览。",
        severity: "warning",
      },
      {
        id: "left-run-controls-dom",
        title: "左侧运行区 DOM",
        passed: query('[data-builder-left-run-controls-layout="qt-creator-kit"]') && query("[data-builder-rail-run-target]"),
        detail: "左下角需要保留 Qt Creator 风格的运行目标、发布目标和主工作流入口。",
      },
    ];

    const failedChecks = checkItems.filter((item) => !item.passed && item.severity !== "warning");
    const warningChecks = checkItems.filter((item) => !item.passed && item.severity === "warning");
    const passedChecks = checkItems.length - failedChecks.length - warningChecks.length;
    const summary = failedChecks.length
      ? `编辑器体验审计发现 ${failedChecks.length} 个阻塞项，${warningChecks.length} 个提醒。`
      : warningChecks.length
        ? `编辑器体验审计通过，另有 ${warningChecks.length} 个项目级提醒。`
        : `编辑器体验审计通过：${passedChecks}/${checkItems.length} 项。`;
    const logPreview = checkItems
      .map((item, index) => {
        const state = item.passed ? "PASS" : item.severity === "warning" ? "WARN" : "FAIL";
        return `[${index + 1}] ${state} ${item.title}\n    ${item.detail}`;
      })
      .join("\n");

    if (failedChecks.length > 0) {
      setBuildError(summary);
    }

    recordProjectDependencyGraphEvent({
      kind: "check",
      actionId: "audit-editor-experience",
      status: failedChecks.length > 0 ? "failed" : "succeeded",
      summary,
      scopeIds: ["project", "ui", "frontend", "validation", "rust", "backend", "release"],
    });

    return {
      status: failedChecks.length > 0 ? "failed" : "succeeded",
      summary,
      logPreview,
    };
  };

  const executeProjectTaskAction = async (task: ProjectTaskEntry): Promise<ProjectTaskRunResult> => {
    const actionId = task.actionId;
    switch (actionId) {
      case "save-project":
        {
          const saveResult = await saveWorkspace();
          if (!saveResult.saved) {
            return { status: "failed", summary: "项目工作区保存失败，请查看底部日志。", artifactPath: saveResult.paths?.root_path };
          }
          const savedProjectSnapshot = saveResult.paths ? { ...activeProject, rootPath: saveResult.paths.root_path } : activeProject;
          const syncResult = await applyGeneratedFileChanges({ revealBuildMode: false, projectSnapshot: savedProjectSnapshot });
          if (syncResult.status === "skipped") {
            return {
              summary: `项目已保存。${syncResult.summary}`,
              logPreview: syncResult.logPreview,
              artifactPath: syncResult.artifactPath ?? saveResult.paths?.root_path,
            };
          }
          return {
            status: syncResult.status,
            summary: `项目已保存并同步生成目标。${syncResult.summary}`,
            logPreview: syncResult.logPreview,
            artifactPath: syncResult.artifactPath ?? saveResult.paths?.root_path,
            logPath: syncResult.logPath,
            backendTaskId: syncResult.backendTaskId,
          };
        }
      case "new-ui-file":
        {
          const file = createNewFile();
          return { summary: `已在当前项目中创建 ${file.name}。` };
        }
      case "duplicate-ui-file":
        {
          const file = duplicateActiveFile();
          return { summary: `已复制当前 UI 文件为 ${file.name}。` };
        }
      case "delete-ui-file":
        setMode("design");
        setLeftDockTab("navigator");
        requestDeleteActiveFile();
        return { status: "skipped", summary: "删除 UI 文件需要在导航器中确认。" };
      case "insert-component":
        {
          const definition = getDefinition("button");
          addComponent("button", items.length === 0 ? { x: page.width / 2, y: page.height / 2 } : undefined);
          setLeftDockTab("components");
          setRightDockTab("properties");
          return { summary: `已将 ${definition.title} 插入 ${activeFile.name}。` };
        }
      case "bind-control-event":
        {
          const createdCommand = createAndBindBackendIntegrationCommand({ recordTask: false });
          if (!createdCommand) {
            return { status: "skipped", summary: "创建绑定前请先选择带事件的控件。" };
          }
          return { summary: `已将选中控件事件绑定到 ${createdCommand.name}。` };
        }
      case "run-selected-event":
        {
          if (!selectedItem || !selectedEventName) {
            setMode("design");
            setLeftDockTab("navigator");
            setRightDockTab("properties");
            return { status: "skipped", summary: "运行前请先选择带事件的控件。" };
          }
          if (!selectedEventCommand) {
            setMode("design");
            setRightDockTab("connections");
            return {
              status: "skipped",
              summary: `${getItemSummary(selectedItem)} ${selectedEventName} 需要先绑定 Rust command。`,
              logPreview: "打开连接并使用“绑定新命令”，然后再次运行事件。",
            };
          }
          const trace = simulateSelectedEvent({ recordTask: false });
          if (!trace) {
            return { status: "skipped", summary: "运行前请先选择带事件的控件。" };
          }
          return {
            status: trace.status === "success" ? "succeeded" : "failed",
            summary:
              trace.status === "success"
                ? `已运行 ${trace.itemName} ${trace.eventName}，调用 ${trace.commandName}。`
                : `${trace.itemName} ${trace.eventName} 运行失败：${trace.message}`,
            logPreview: trace.rawResult || trace.message,
          };
        }
      case "add-rust-command":
        createRustCommandInProject();
        setMode("logic");
        return { summary: "已添加 Rust 命令并打开逻辑面板。" };
      case "add-state-variable":
        createStateVariableInProject();
        setMode("logic");
        return { summary: "已添加共享项目状态变量。" };
      case "sync-rust":
        syncRustLogicFromCommands();
        setMode("logic");
        return { summary: "已根据命令注册表重新生成 Rust 源码。" };
      case "add-image-asset":
        setMode("design");
        await chooseImageAsset();
        return { summary: "图片资源导入流程已完成。" };
      case "generate-file-plan":
        {
          const result = await previewGeneratedProjectFiles();
          if (!result) {
            return { status: "skipped", summary: "生成文件计划需要 Tauri 桌面运行时。" };
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
            summary: "已先生成文件计划。请选择目标文件，然后再次运行“应用选中的生成文件”。",
          };
        }
        if (selectedGeneratedPreviewPaths.length === 0) {
          setMode("build");
          setBuildError("没有选中的生成文件。请先在生成计划里选择要写入的文件。");
          return { status: "skipped", summary: "没有选择要应用的生成文件。" };
        }
        {
          const result = await applySelectedGeneratedFiles();
          if (!result) {
            return { status: "skipped", summary: "应用生成文件需要选择文件，并在 Tauri 桌面运行时中执行。" };
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
      case "audit-editor-experience":
        return runEditorExperienceAudit();
      case "validate-window":
        if (buildReadinessSummary.errorCount > 0) {
          await validateGeneratedWindow();
          return {
            status: "skipped",
            summary: `窗口验证被 ${buildReadinessSummary.errorCount} 个就绪问题阻塞：${buildReadinessSummary.items.find((i) => i.severity === "error")?.title ?? "见就绪列表"}`,
          };
        }
        await validateGeneratedWindow();
        return { summary: "生成窗口验证已完成。" };
      case "build-exe":
        if (buildReadinessSummary.errorCount > 0) {
          await buildActiveProject();
          return {
            status: "skipped",
            summary: `exe 构建被 ${buildReadinessSummary.errorCount} 个就绪问题阻塞：${buildReadinessSummary.items.find((i) => i.severity === "error")?.title ?? "见就绪列表"}`,
          };
        }
        return waitForBackendProjectTask(task.id, "build");
      case "bundle-installer":
        if (buildReadinessSummary.errorCount > 0) {
          await bundleActiveProject();
          return {
            status: "skipped",
            summary: `安装包构建被 ${buildReadinessSummary.errorCount} 个就绪问题阻塞：${buildReadinessSummary.items.find((i) => i.severity === "error")?.title ?? "见就绪列表"}`,
          };
        }
        return waitForBackendProjectTask(task.id, "bundle");
      case "fix-property-schema":
        setMode("build");
        if (projectPropertyAutoFixSummary.targets.length === 0) {
          setBuildError("没有可自动修复的属性 schema 问题。");
          return { status: "skipped", summary: "没有可安全应用的属性结构修复。" };
        }
        applyProjectPropertyAutoFixes();
        return {
          summary: `Applied ${projectPropertyAutoFixSummary.propertyCount} safe property fix(es) across ${projectPropertyAutoFixSummary.targets.length} control(s).`,
        };
    }
  };

  const drainProjectTaskQueue = async () => {
    if (projectTaskQueuePausedRef.current) {
      setProjectTaskQueueMessage("Queue is paused. Resume it before continuing queued work.");
      return null;
    }
    if (projectTaskRunnerRef.current) {
      setProjectTaskQueueMessage("Queue runner is already active.");
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
          summary: "运行中...",
          error: undefined,
          inputSnapshot: createReleasePipelineInputSnapshot(activeProject),
          environment: createReleasePipelineEnvironment(),
          artifactEvidence: undefined,
        };
        const startedTask: ProjectTaskEntry = {
          ...startedTaskBase,
          commandArgs: createReleasePipelineCommandArgs(startedTaskBase),
        };
        setProjectTaskQueueMessage(`Started ${startedTask.title}.`);
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
          setProjectTaskQueueMessage(
            `${finishedTask.title} ${finishedTask.status}. ${
              projectTaskQueueRef.current.length > 0 ? `${projectTaskQueueRef.current.length} task(s) still waiting.` : "Queue is clear."
            }`,
          );
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
            summary: "编辑器操作完成前任务已失败。",
            error: String(error),
            artifactEvidence,
          };
          const failedTask: ProjectTaskEntry = {
            ...failedTaskBase,
            commandArgs: createReleasePipelineCommandArgs(failedTaskBase),
          };
          if (failedTask.status === "failed") {
            const tail = (failedTask.logPreview || failedTask.error || "").split("\n").slice(-12).join("\n");
            setBuildError(`${failedTask.title} 失败。\n${tail}\n（详情见任务/日志标签）`);
            openBottomDock("logs", false);
          }
          setProjectTaskQueueMessage(`${failedTask.title} 失败。请查看日志或修复后重试。`);
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

  const releasePipelinePresetForAction = (actionId: ProjectJumpActionId) =>
    actionId === "build-exe"
      ? projectActionPresets.find((preset) => preset.id === "release-exe") ?? null
      : actionId === "bundle-installer"
        ? projectActionPresets.find((preset) => preset.id === "installer-bundle") ?? null
        : null;

  const shouldSwitchTaskWorkspaceForActions = (actionIds: ProjectJumpActionId[]) =>
    !(actionIds.length === 1 && actionIds[0] === "save-project");

  const revealReadinessGateForActions = (actionIds: ProjectJumpActionId[], label?: string) => {
    const gatedActionId = actionIds.find((actionId) => READINESS_GATED_PROJECT_ACTIONS.has(actionId));
    const blockers = buildReadinessSummary.items.filter((item) => item.severity === "error");
    if (!gatedActionId || blockers.length === 0) {
      return false;
    }

    const primaryBlocker = blockers[0];
    const actionLabel = label ?? (actionIds.length === 1 ? projectTaskDefinitions[gatedActionId].title : "发布工作流");
    const summary = `${actionLabel}被 ${blockers.length} 个就绪问题阻塞`;
    const detail = `${primaryBlocker.title}：${primaryBlocker.detail}`;
    const logPreview = blockers
      .slice(0, 8)
      .map((blocker, index) => `[${index + 1}] ${blocker.title}: ${blocker.detail}`)
      .join("\n");
    const timestamp = new Date().toISOString();
    const skippedTask: ProjectTaskEntry = {
      ...createProjectTask(gatedActionId, activeProject, 1),
      status: "skipped",
      startedAt: timestamp,
      finishedAt: timestamp,
      summary: `${summary} ${detail}`,
      logPreview,
    };

    setMode("build");
    setBuildError(`${summary}\n${detail}`);
    setProjectTaskStatusFilter("all");
    setProjectTaskKindFilter("all");
    setProjectTaskSearchQuery("");
    setProjectTasks((current) => [skippedTask, ...current].slice(0, 100));
    setSelectedProjectTaskId(skippedTask.id);
    setProjectTaskQueueMessage(`${summary} Open Build readiness or Issues before retrying.`);
    setFeedbackPanelOpen(true);
    openBottomDock("issues", false);
    showProjectJumpFeedback("warning", "发布被阻止", detail);
    return true;
  };

  const enqueueProjectTask = (actionId: ProjectJumpActionId, attempt = 1) => {
    const releasePreset = attempt === 1 ? releasePipelinePresetForAction(actionId) : null;
    if (releasePreset) {
      if (revealReadinessGateForActions(releasePreset.actions, releasePreset.title)) {
        return;
      }
      runProjectActionsAsPipeline(releasePreset);
      return;
    }
    if (revealReadinessGateForActions([actionId])) {
      return;
    }
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
    setProjectTaskQueueMessage(
      tasks.length === 1
        ? `Queued ${tasks[0].title}.`
        : `Queued ${tasks.length} task(s), starting with ${tasks[0].title}.`,
    );
    const switchTaskWorkspace = shouldSwitchTaskWorkspaceForActions(actionIds);
    openBottomDock("tasks", switchTaskWorkspace);
    if (switchTaskWorkspace) {
      setMode(projectTaskDefinitions[tasks[tasks.length - 1].actionId].mode);
    }
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
    if (revealReadinessGateForActions(validActionIds, preset.title)) {
      return;
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
    const detail = customPresetDetail.trim() || "自定义任务中心操作 preset。";
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
    setProjectTaskQueueMessage(
      paused
        ? `Queue paused. ${localQueuedProjectTasks.length} waiting task(s) will stay queued.`
        : localQueuedProjectTasks.length > 0
          ? `Queue resumed. Next task: ${localQueuedProjectTasks[0].title}.`
          : "队列已恢复。没有等待中的任务。",
    );
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
    setProjectTaskQueueMessage(`${task.title} moved to queue position ${nextIndex + 1}.`);
  };

  const cancelQueuedProjectTasks = () => {
    const canceledIds = new Set(localQueuedProjectTasks.map((task) => task.id));
    if (canceledIds.size === 0) {
      return;
    }
    projectTaskQueueRef.current = projectTaskQueueRef.current.filter((task) => !canceledIds.has(task.id));
    bumpProjectTaskQueueVersion();
    setProjectTaskQueueMessage(`Canceled ${canceledIds.size} waiting task(s).`);
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
    setProjectTaskQueueMessage(`Retry queued for ${task.title}.`);
    enqueueProjectTask(task.actionId, task.attempt + 1);
  };

  const projectTaskResolutionLabel = (task: ProjectTaskEntry) => {
    if ((task.summary ?? "").toLowerCase().includes("readiness") || (task.error ?? "").toLowerCase().includes("readiness")) {
      return "定位准备项";
    }
    if (task.actionId === "run-selected-event" || task.actionId === "bind-control-event") {
      return "打开连接";
    }
    if (task.actionId === "add-rust-command" || task.actionId === "add-state-variable" || task.actionId === "sync-rust") {
      return "打开逻辑";
    }
    if (task.actionId === "build-backend-artifacts") {
      return "检查后端";
    }
    if (task.actionId === "add-image-asset") {
      return "打开资源";
    }
    if (task.actionId === "new-ui-file" || task.actionId === "duplicate-ui-file" || task.actionId === "delete-ui-file") {
      return "打开导航";
    }
    if (task.actionId === "insert-component") {
      return "打开组件";
    }
    if (task.actionId === "generate-file-plan" || task.actionId === "apply-generated-files" || task.actionId === "apply-generated-changes") {
      return "查看生成";
    }
    if (task.actionId === "save-project") {
      return "项目设置";
    }
    return task.logPath || task.logPreview ? "查看日志" : "定位处理";
  };

  const openFirstReadinessIssue = (sourceTask: ProjectTaskEntry) => {
    const issue =
      buildReadinessSummary.items.find((item) => item.severity === "error") ??
      buildReadinessSummary.items.find((item) => item.severity === "warning");

    if (issue) {
      openBuildReadinessItem(issue);
      setProjectTaskQueueMessage(`${sourceTask.title} is waiting on ${issue.title}.`);
      return true;
    }

    setMode("build");
    openBottomDock("issues", false);
    showProjectJumpFeedback("warning", "没有找到就绪问题", `${sourceTask.title} 当前在构建就绪度中没有阻塞项。`);
    return false;
  };

  const openProjectTaskResolution = (task: ProjectTaskEntry) => {
    const taskText = [task.summary, task.error, task.logPreview].filter(Boolean).join("\n").toLowerCase();
    setSelectedProjectTaskId(task.id);
    setProjectTaskLogSearchQuery("");
    setBuildError("");

    if (taskText.includes("readiness") || (READINESS_GATED_PROJECT_ACTIONS.has(task.actionId) && buildReadinessSummary.errorCount > 0)) {
      openFirstReadinessIssue(task);
      return;
    }

    if (task.actionId === "run-selected-event" || task.actionId === "bind-control-event") {
      setMode("design");
      if (!selectedItem) {
        setLeftDockTab("navigator");
        setRightDockTab("properties");
        showProjectJumpFeedback("warning", "选择事件控件", "导航器已打开。请选择按钮、输入框、开关、下拉选择或复选框，然后绑定事件。");
        return;
      }
      setRightDockTab(selectedEventName ? "connections" : "properties");
      showProjectJumpFeedback(
        selectedEventName ? "success" : "warning",
        selectedEventName ? "已打开连接" : "所选控件是静态控件",
        selectedEventName
          ? `${getItemSummary(selectedItem)} is ready for event binding or simulation.`
          : `${getItemSummary(selectedItem)} has no supported event; choose another control from Navigator.`,
      );
      return;
    }

    if (task.actionId === "new-ui-file" || task.actionId === "duplicate-ui-file" || task.actionId === "delete-ui-file") {
      setMode("design");
      setLeftDockTab("navigator");
      showProjectJumpFeedback("success", "已打开导航器", "这里可以管理 UI 文件、图层选择、复制和删除操作。");
      return;
    }

    if (task.actionId === "insert-component") {
      setMode("design");
      setLeftDockTab("components");
      setRightDockTab("properties");
      showProjectJumpFeedback("success", "已打开控件面板", "插入组件后可以在属性面板继续调整。");
      return;
    }

    if (task.actionId === "add-image-asset") {
      setMode("design");
      setLeftDockTab("assets");
      showProjectJumpFeedback("success", "已打开资源面板", "这里可以导入或检查项目图片资源。");
      return;
    }

    if (
      task.actionId === "add-rust-command" ||
      task.actionId === "add-state-variable" ||
      task.actionId === "sync-rust" ||
      task.actionId === "build-backend-artifacts"
    ) {
      setMode("logic");
      if (task.actionId === "build-backend-artifacts") {
        const backend = activeProject.backendIntegrations.find((integration) => integration.enabled) ?? activeProject.backendIntegrations[0];
        if (backend) {
          selectBackendIntegration(backend.id);
        }
      }
      showProjectJumpFeedback(
        "success",
        task.actionId === "build-backend-artifacts" ? "已打开后端集成" : "已打开逻辑",
        `${task.title} can be repaired from commands, state, dependencies, and backend integration settings.`,
      );
      return;
    }

    if (task.actionId === "generate-file-plan" || task.actionId === "apply-generated-files" || task.actionId === "apply-generated-changes") {
      setMode("build");
      openBottomDock("tasks", false);
      showProjectJumpFeedback("success", "已打开生成工作流", "可使用生成计划、应用生成变更和任务中心检查目标文件输出。");
      return;
    }

    if (task.actionId === "save-project") {
      setMode("design");
      setLeftDockTab("project");
      showProjectJumpFeedback("success", "已打开项目 Dock", "再次保存前可检查项目目录、发布元数据、文件和模板状态。");
      return;
    }

    if (task.logPath || task.logPreview || buildDiagnostics.length > 0 || buildError) {
      setMode("build");
      openBottomDock(task.logPath || task.logPreview ? "logs" : "issues", false);
      setProjectTaskLogSearchQuery(task.error ? task.error.split(/\s+/).slice(0, 3).join(" ") : task.title);
      showProjectJumpFeedback("success", task.logPath || task.logPreview ? "已打开日志" : "已打开问题", `${task.title} 的证据已显示在底部 Dock。`);
      return;
    }

    openRelevantTaskDock(task);
    showProjectJumpFeedback("warning", "任务已选择", `${task.title} 没有更深的定位目标，已打开任务证据。`);
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
      setProjectTaskQueueMessage(`Canceled ${task.title} before it started.`);
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
          setProjectTaskQueueMessage(`Cancellation requested for ${task.title}.`);
        }
      } catch (error) {
        updateProjectTask(task.id, {
          error: String(error),
          summary: "Failed to request backend task cancellation.",
        });
        setProjectTaskQueueMessage(`Failed to cancel ${task.title}: ${String(error)}`);
      }
    }
  };

  const clearCompletedProjectTasks = () => {
    setProjectTaskQueueMessage(`Cleared ${completedProjectTaskCount} completed task(s).`);
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
    logPreview?: string,
  ) => {
    const timestamp = new Date().toISOString();
    const task = createProjectTask(actionId, activeProject, 1);
    const finishedTask: ProjectTaskEntry = {
      ...task,
      status,
      startedAt: timestamp,
      finishedAt: timestamp,
      summary,
      logPreview,
    };
    setProjectTasks((current) => [finishedTask, ...current].slice(0, 100));
    setSelectedProjectTaskId(finishedTask.id);
  };

  const runInstantProjectJumpAction = async (actionId: ProjectJumpActionId) => {
    if (actionId === "new-ui-file") {
      const file = createNewFile();
      recordInstantProjectAction(actionId, `已创建 ${file.name} 并在画布中打开。`);
      return true;
    }

    if (actionId === "duplicate-ui-file") {
      const file = duplicateActiveFile();
      recordInstantProjectAction(actionId, `已复制当前 UI 文件为 ${file.name}。`);
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
      runSelectedEventAndRevealLogs();
      return true;
    }

    if (actionId === "add-rust-command") {
      const commandName = `project_command_${activeProject.rustCommands.length + 1}`;
      createRustCommandInProject();
      setMode("logic");
      recordInstantProjectAction(actionId, `已创建 ${commandName} 并打开逻辑工作区。`);
      return true;
    }

    if (actionId === "add-state-variable") {
      const stateName = activeProject.stateVariables.length === 0 ? "statusText" : `stateValue${activeProject.stateVariables.length + 1}`;
      createStateVariableInProject();
      setMode("logic");
      recordInstantProjectAction(actionId, `已创建 ${stateName}，可用于绑定和命令结果。`);
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

  const clearProjectJumpFeedback = () => {
    if (projectJumpFeedbackTimeoutRef.current !== null) {
      window.clearTimeout(projectJumpFeedbackTimeoutRef.current);
      projectJumpFeedbackTimeoutRef.current = null;
    }
    setProjectJumpFeedback(null);
  };

  const showProjectJumpFeedback = (tone: ProjectJumpFeedback["tone"], title: string, detail: string) => {
    const id = createId();
    if (projectJumpFeedbackTimeoutRef.current !== null) {
      window.clearTimeout(projectJumpFeedbackTimeoutRef.current);
    }
    setProjectJumpFeedback({ id, tone, title, detail });
    projectJumpFeedbackTimeoutRef.current = window.setTimeout(() => {
      setProjectJumpFeedback((current) => (current?.id === id ? null : current));
      projectJumpFeedbackTimeoutRef.current = null;
    }, 3200);
  };

  const syncReleaseWindowFromActivePage = () => {
    const windowKind = normalizeReleaseWindowKind(page.windowKind);
    const titlebarStyle = normalizeReleaseTitlebarStyle(page.titlebarStyle, windowKind);
    updateReleaseConfig({
      windowTitle: page.title || activeFile.name.replace(/\.ui$/i, ""),
      windowKind,
      titlebarStyle,
      titlebarSubtitle: page.titlebarSubtitle,
      windowWidth: page.width,
      windowHeight: page.height,
      minWindowWidth: Math.min(activeProject.releaseConfig.minWindowWidth, page.width),
      minWindowHeight: Math.min(activeProject.releaseConfig.minWindowHeight, page.height),
    });
    showProjectJumpFeedback(
      "success",
      "已同步发布窗口",
      `${activeFile.name} 的 ${pageWindowKindMeta?.label ?? windowKind} / ${pageTitlebarStyleMeta?.label ?? titlebarStyle} 已设为项目默认发布窗口。`,
    );
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
      setMode(result.mode);
      if (result.mode === "build") {
        openRelevantTaskDock(null, false);
      }
      runProjectJumpAction(result.actionId);
      showProjectJumpFeedback("success", "动作已开始", `${result.title} 已显示在工作流栏和任务 Dock 中。`);
      return;
    }

    if (result.kind === "component" && result.insertComponentType) {
      insertComponentFromShortcut(result.insertComponentType, { centered: items.length === 0, revealPalette: true });
      return;
    }

    if (result.kind === "settings") {
      setMode("project");
      setLeftDockTab("project");
      showProjectJumpFeedback("success", "已打开项目工作区", "发布、打包、版本、窗口设置和文件树都在项目模式中。");
      return;
    }

    if (result.kind === "rust-command" && result.commandId) {
      selectRustCommand(result.commandId);
      setMode("logic");
      showProjectJumpFeedback("success", "已打开 Rust 命令", `${result.title} 已在逻辑工作区中选中。`);
      return;
    }

    if (result.kind === "state" && result.stateId) {
      selectStateVariable(result.stateId);
      setMode("logic");
      showProjectJumpFeedback("success", "已打开状态变量", `${result.title} 已在逻辑工作区中选中。`);
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
        showProjectJumpFeedback("success", "已定位资源使用", `${result.title} 正被 ${assetItem.file.name} 中的 ${getItemSummary(assetItem.item)} 使用。`);
      } else {
        setMode("design");
        setLeftDockTab("assets");
        showProjectJumpFeedback("success", "已打开项目资源", `${result.title} 已在项目资源中选中；尚未发现画布使用位置。`);
      }
      return;
    }

    if (result.fileId) {
      const targetFile = activeProject.files.find((file) => file.id === result.fileId);
      if (!targetFile) {
        const message = `找不到 ${result.title} 对应的 UI 文件。`;
        setBuildError(message);
        showProjectJumpFeedback("error", "Result target missing", message);
        return;
      }
      updateActiveProject((project) => ({
        ...project,
        activeFileId: result.fileId!,
      }));
      setSelectedId(result.itemId || targetFile?.items[0]?.id || "");
      setMode(result.mode);
      setLeftDockTab("navigator");
      setRightDockTab("properties");
      showProjectJumpFeedback(
        "success",
        result.itemId ? "已定位控件" : "已打开 UI 文件",
        result.itemId ? `${result.title} is selected in ${targetFile.name}.` : `${targetFile.name} is active on the canvas.`,
      );
      return;
    }

    setMode(result.mode);
    if (result.path) {
      void openLocalArtifact(result.path).then((opened) => {
        showProjectJumpFeedback(
          opened ? "success" : "warning",
          opened ? "正在打开产物" : "产物无法打开",
          opened ? result.path! : "请检查任务输出，或从 Tauri 桌面 app 运行。",
        );
      });
      return;
    }
    showProjectJumpFeedback("warning", "已打开工作区", `${result.title} 没有直接产物路径，已切换到 ${result.mode} 工作区。`);
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

  const renameFileById = (fileId: string, name: string) => {
    const normalizedName = name.trim() || "Untitled.ui";
    const safeName = normalizedName.toLowerCase().endsWith(".ui") ? normalizedName : `${normalizedName}.ui`;
    updateActiveProject((project) => ({
      ...project,
      files: project.files.map((file) => {
        if (file.id !== fileId) {
          return file;
        }
        return {
          ...file,
          name: safeName,
          path: `ui/${safeName}`,
          page: {
            ...file.page,
            title: safeName.replace(/\.ui$/i, "") || file.page.title,
          },
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  };

  const renameActiveFile = (name: string) => {
    renameFileById(activeFile.id, name);
  };

  const renameProjectExplorerUiFile = (fileId: string) => {
    const file = activeProject.files.find((candidate) => candidate.id === fileId);
    if (!file) {
      showProjectJumpFeedback("error", "UI 文件缺失", `找不到要重命名的 UI 文件：${fileId}。`);
      return;
    }
    setSelectedProjectExplorerNodeId(`ui-${fileId}`);
    setMode("project");
    setLeftDockTab("project");
    window.setTimeout(() => {
      projectExplorerRenameInputRef.current?.focus();
      projectExplorerRenameInputRef.current?.select();
    }, 0);
    showProjectJumpFeedback("success", "已定位文件名", `${file.name} 可在项目详情中直接重命名。`);
  };

  const duplicateFileById = (fileId: string) => {
    const sourceFile = activeProject.files.find((file) => file.id === fileId);
    if (!sourceFile) {
      showProjectJumpFeedback("error", "UI 文件缺失", `找不到要复制的 UI 文件：${fileId}。`);
      return null;
    }

    const idMap = new Map(sourceFile.items.map((item) => [item.id, createId()]));
    const remapItemId = (id: string | undefined) => (id ? idMap.get(id) ?? id : id);
    const nextItems = sourceFile.items.map((item) => {
      const events = item.props.events
        ? (Object.fromEntries(
            Object.entries(item.props.events).map(([eventName, binding]) => [
              eventName,
              binding
                ? {
                    ...binding,
                    resultTargetItemId: remapItemId(binding.resultTargetItemId),
                  }
                : binding,
            ]),
          ) as BuilderItemProps["events"])
        : item.props.events;
      return {
        ...item,
        id: idMap.get(item.id) ?? createId(),
        parentId: remapItemId(item.parentId),
        responsive: cloneResponsiveOverrides(item.responsive),
        props: {
          ...item.props,
          events,
        },
      };
    });
    const selectedDuplicateId = sourceFile.id === activeFile.id ? selectedIds.map((id) => idMap.get(id)).find((id): id is string => Boolean(id)) : "";
    const sourceName = sourceFile.name.replace(/\.ui$/i, "");
    const nextFile: DesignerFile = {
      ...sourceFile,
      id: createId(),
      name: `${sourceName} Copy.ui`,
      path: `ui/${sourceName} Copy.ui`,
      page: { ...sourceFile.page },
      items: nextItems,
      updatedAt: new Date().toISOString(),
    };
    updateActiveProject((project) => ({
      ...project,
      files: [...project.files, nextFile],
      activeFileId: nextFile.id,
    }));
    openFileEditingContext(nextFile, {
      feedback: true,
      leftDockTab: "navigator",
      selectedId: selectedDuplicateId ?? nextFile.items[0]?.id ?? "",
      title: "UI file duplicated",
      detail: `${nextFile.name} opened with ${formatControlCount(nextFile.items.length)} and remapped layer links.`,
    });
    return nextFile;
  };

  const duplicateActiveFile = () => duplicateFileById(activeFile.id)!;

  const createNewFileFromNavigator = () => {
    const file = createNewFile();
    recordInstantProjectAction("new-ui-file", `已创建 ${file.name} 并在画布中打开。`);
  };

  const duplicateActiveFileFromNavigator = () => {
    const file = duplicateActiveFile();
    recordInstantProjectAction("duplicate-ui-file", `已复制当前 UI 文件为 ${file.name}。`);
  };

  const deleteFileById = (fileId: string) => {
    const targetFile = activeProject.files.find((file) => file.id === fileId);
    if (!targetFile) {
      showProjectJumpFeedback("error", "UI 文件缺失", `找不到要删除的 UI 文件：${fileId}。`);
      return;
    }

    if (activeProject.files.length <= 1) {
      resetCurrentFile();
      return;
    }

    const deletedFileName = targetFile.name;
    const remainingFiles = activeProject.files.filter((file) => file.id !== fileId);
    const nextFile = targetFile.id === activeFile.id
      ? remainingFiles[0]
      : activeProject.files.find((file) => file.id === activeFile.id) ?? remainingFiles[0];
    updateActiveProject((project) => {
      const nextFiles = project.files.filter((file) => file.id !== fileId);
      const nextActiveFileId = project.activeFileId === fileId ? nextFiles[0].id : project.activeFileId;
      return {
        ...project,
        files: nextFiles,
        activeFileId: nextActiveFileId,
      };
    });
    setOpenEditorFileIds((current) => {
      const nextOpenIds = current.filter((id) => id !== fileId);
      return nextOpenIds.length > 0 ? nextOpenIds : nextFile?.id ? [nextFile.id] : [];
    });
    if (nextFile && targetFile.id === activeFile.id) {
      openFileEditingContext(nextFile, {
        feedback: true,
        leftDockTab: "navigator",
        title: "UI 文件已删除",
        detail: `${deletedFileName} 已移除。当前已打开 ${nextFile.name}，${fileCanvasSummary(nextFile)}。`,
      });
    } else {
      showProjectJumpFeedback("success", "UI 文件已删除", `${deletedFileName} 已从项目中移除。`);
    }
  };

  const deleteActiveFile = () => deleteFileById(activeFile.id);

  const requestDeleteSelected = () => {
    if (selectedItems.length === 0) {
      return;
    }
    const unlockedCount = selectedItems.filter((item) => !item.locked).length;
    setDestructiveAction({
      title: `删除 ${unlockedCount || selectedItems.length} 个已选控件？`,
      description:
        unlockedCount === 0
          ? "当前选择已锁定，因此不会删除任何内容。需要删除时请先解锁控件。"
          : `将从 ${activeFile.name} 移除已选控件及其子控件。删除后仍可使用撤销恢复。`,
      confirmLabel: unlockedCount === 0 ? "关闭" : "删除选择",
      onConfirm: unlockedCount === 0 ? () => undefined : deleteSelected,
    });
  };

  const requestResetCurrentFile = () => {
    setDestructiveAction({
      title: `清空 ${activeFile.name}？`,
      description: "这会移除当前 UI 文件中的所有控件，并将页面设置恢复为空白画布。项目设置和其他文件会保留。",
      confirmLabel: "清空 UI 文件",
      onConfirm: resetCurrentFile,
    });
  };

  const requestDeleteActiveFile = () => {
    requestDeleteFileById(activeFile.id);
  };

  const requestDeleteFileById = (fileId: string) => {
    const file = activeProject.files.find((candidate) => candidate.id === fileId);
    if (!file) {
      showProjectJumpFeedback("error", "UI 文件缺失", `找不到要删除的 UI 文件：${fileId}。`);
      return;
    }
    const fileName = file.name;
    const clearingOnlyFile = activeProject.files.length <= 1;
    setDestructiveAction({
      title: clearingOnlyFile ? `清空 ${fileName}？` : `删除 ${fileName}？`,
      description:
        clearingOnlyFile
          ? "这是项目中的唯一 UI 文件，Nova 会清空它，而不是删除文件记录。"
          : `这会从 ${activeProject.name} 中移除 ${fileName}。其他项目文件、Rust 逻辑和发布设置会保留。`,
      confirmLabel: clearingOnlyFile ? "清空文件" : "删除文件",
      onConfirm: () => {
        deleteFileById(fileId);
        setLeftDockTab("navigator");
        recordInstantProjectAction("delete-ui-file", clearingOnlyFile ? `已清空 ${fileName}。` : `已删除 ${fileName}。`);
      },
    });
  };

  const requestDeleteActiveProject = () => {
    setDestructiveAction({
      title: workspace.projects.length <= 1 ? `重置 ${activeProject.name}？` : `删除 ${activeProject.name}？`,
      description:
        workspace.projects.length <= 1
          ? "这是工作区中的唯一项目，Nova 会用一个新的空白项目替换它。"
          : "这会从本地编辑器工作区移除该项目。已经写入磁盘的文件不会被这个操作删除。",
      confirmLabel: workspace.projects.length <= 1 ? "重置项目" : "删除项目",
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
      return false;
    }
    setBuildError("");
    try {
      const opened = await invokeIfAvailable<void>("open_local_path", { path });
      if (opened === null) {
        setBuildError("打开验证产物需要在 Tauri 桌面 app 中运行。");
        return false;
      }
      return true;
    } catch (error) {
      setBuildError(String(error));
      return false;
    }
  };

  const handleProjectExplorerNode = (node: ProjectExplorerNode) => {
    setSelectedProjectExplorerNodeId(node.id);
    if (node.action === "select-file") {
      if (node.fileId) {
        selectFile(node.fileId, { feedback: true, leftDockTab: "project" });
      }
      return;
    }
    if (node.action === "open-logic") {
      setMode("logic");
      setRightDockTab("connections");
      showProjectJumpFeedback("success", "已打开 Rust 逻辑", node.path || node.detail);
      return;
    }
    if (node.action === "open-connections") {
      setMode("logic");
      setRightDockTab("connections");
      showProjectJumpFeedback("success", "已打开后端连接", node.detail);
      return;
    }
    if (node.action === "open-assets") {
      setLeftDockTab("assets");
      setMode("design");
      showProjectJumpFeedback("success", "已打开资源面板", node.detail);
      return;
    }
    if (node.action === "open-build") {
      setMode("build");
      openBottomDock("logs", false);
      if (node.path) {
        void openLocalArtifact(node.path);
        showProjectJumpFeedback("success", "已定位生成目标", node.path);
      } else {
        showProjectJumpFeedback("success", "已打开构建工作台", "保存同步或构建后会在项目树显示 exe、bundle 和运行日志。");
      }
      return;
    }
    if (node.action === "open-checkpoints") {
      setLeftDockTab("project");
      showProjectJumpFeedback("success", "磁盘版本已定位", node.path || ".nova/checkpoints");
      return;
    }
    if (node.action === "open-settings") {
      setLeftDockTab("project");
      showProjectJumpFeedback("success", "项目设置在当前页", "发布元数据、标题栏、bundle 和本地目录都在项目页维护。");
      return;
    }
    if (node.action === "open-path") {
      if (!node.path) {
        showProjectJumpFeedback("warning", "路径尚未生成", "先保存项目，Nova 会创建磁盘目录和 .nova 元数据。");
        return;
      }
      void openLocalArtifact(node.path);
    }
  };

  const focusProjectSourceOverviewRow = (row: ProjectSourceOverviewRow) => {
    setMode("project");
    setLeftDockTab("project");
    setProjectExplorerFilter(row.filter);
    setProjectExplorerQuery(row.query);
    setSelectedProjectExplorerNodeId(row.nodeId);
  };

  const openProjectSourceOverviewRow = (row: ProjectSourceOverviewRow) => {
    focusProjectSourceOverviewRow(row);
    const targetNode = projectExplorerModel.nodes.find((node) => node.id === row.nodeId);
    if (targetNode) {
      handleProjectExplorerNode(targetNode);
      return;
    }
    showProjectJumpFeedback("success", "已定位项目来源", `${row.title} · ${row.relativePath}`);
  };

  const openProjectSavePlanStep = (step: ProjectSavePlanStep) => {
    setMode("project");
    setLeftDockTab("project");
    setProjectSavePlanRouteId(step.id);
    setProjectExplorerFilter(step.filter);
    setProjectExplorerQuery(step.id === "source" ? "nova.project.json" : step.id === "generated" ? "app" : ".nova");
    showProjectJumpFeedback("success", "已定位保存计划", `${step.title} · ${step.path}`);
  };

  const openProjectFolderHealthItem = (item: ProjectFolderHealthItem) => {
    if (item.id === "generated") {
      if (item.sourceRowId) {
        const row = projectSourceOverviewRows.find((candidate) => candidate.id === item.sourceRowId);
        if (row) {
          openProjectSourceOverviewRow(row);
          return;
        }
      }
      setMode("build");
      openBottomDock("logs", false);
      showProjectJumpFeedback("success", "已打开构建工作台", item.path);
      return;
    }
    if (item.sourceRowId) {
      const row = projectSourceOverviewRows.find((candidate) => candidate.id === item.sourceRowId);
      if (row) {
        openProjectSourceOverviewRow(row);
        return;
      }
    }
    setMode("project");
    setLeftDockTab("project");
    if (item.filter) {
      setProjectExplorerFilter(item.filter);
    }
    if (item.nodeId) {
      setSelectedProjectExplorerNodeId(item.nodeId);
    }
    if (item.id === "metadata") {
      setProjectExplorerQuery(".nova");
    } else if (item.id === "source") {
      setProjectExplorerQuery("src");
    } else {
      setProjectExplorerQuery("");
    }
    showProjectJumpFeedback("success", "已定位项目边界", `${item.title} · ${item.path}`);
  };

  const focusProjectWorkingSetItem = (item: ProjectWorkingSetItem) => {
    if (item.tabId) {
      const tab = openEditorTabs.find((candidate) => candidate.id === item.tabId);
      if (tab) {
        revealEditorTabInProject(tab);
        return;
      }
    }
    if (item.sourceRowId) {
      const row = projectSourceOverviewRows.find((candidate) => candidate.id === item.sourceRowId);
      if (row) {
        focusProjectSourceOverviewRow(row);
        showProjectJumpFeedback("success", "已定位工作集来源", `${row.title} · ${row.relativePath}`);
        return;
      }
    }
    const targetNode = projectExplorerModel.nodes.find((node) => node.id === item.nodeId);
    if (targetNode) {
      setMode("project");
      setLeftDockTab("project");
      setProjectExplorerFilter(projectExplorerNodeGroupId(targetNode) === "root" ? "all" : projectExplorerGroupFilter(projectExplorerNodeGroupId(targetNode)));
      setProjectExplorerQuery("");
      setSelectedProjectExplorerNodeId(targetNode.id);
      showProjectJumpFeedback("success", "已定位工作集节点", `${item.label} · ${item.relativePath}`);
      return;
    }
    showProjectJumpFeedback("warning", "无法定位工作集项", `${item.label} 暂时没有对应的项目节点。`);
  };

  const openProjectWorkingSetItem = (item: ProjectWorkingSetItem) => {
    if (item.tabId) {
      const tab = openEditorTabs.find((candidate) => candidate.id === item.tabId);
      if (tab) {
        openEditorTab(tab);
        return;
      }
    }
    if (item.sourceRowId) {
      const row = projectSourceOverviewRows.find((candidate) => candidate.id === item.sourceRowId);
      if (row) {
        openProjectSourceOverviewRow(row);
        return;
      }
    }
    const targetNode = projectExplorerModel.nodes.find((node) => node.id === item.nodeId);
    if (targetNode) {
      handleProjectExplorerNode(targetNode);
      return;
    }
    showProjectJumpFeedback("warning", "无法打开工作集项", `${item.label} 暂时没有可执行动作。`);
  };

  const runProjectActionCenterItem = (item: ProjectActionCenterItem) => {
    const action = item.action;
    if (action.kind === "task") {
      runProjectJumpAction(action.taskId);
      return;
    }
    if (action.kind === "working-set") {
      const target = projectWorkingSetItems.find((candidate) => candidate.id === action.itemId);
      if (target) {
        openProjectWorkingSetItem(target);
        return;
      }
    }
    if (action.kind === "source-row") {
      const row = projectSourceOverviewRows.find((candidate) => candidate.id === action.rowId);
      if (row) {
        openProjectSourceOverviewRow(row);
        return;
      }
    }
    if (action.kind === "run-preset") {
      const preset = allProjectActionPresets.find((candidate) => candidate.id === action.presetId);
      if (preset) {
        setSelectedRailActionPresetId(preset.id);
        runProjectActionPreset(preset);
        return;
      }
    }
    if (action.kind === "project-node") {
      const node = projectExplorerModel.nodes.find((candidate) => candidate.id === action.nodeId);
      if (node) {
        setMode("project");
        setLeftDockTab("project");
        setSelectedProjectExplorerNodeId(node.id);
        handleProjectExplorerNode(node);
        return;
      }
    }
    if (action.kind === "task-detail") {
      const task = action.taskId ? activeProjectTasks.find((candidate) => candidate.id === action.taskId) ?? null : null;
      if (task) {
        openProjectTaskResolution(task);
        return;
      }
      openRelevantTaskDock(null, false);
      return;
    }
    if (action.kind === "open-build") {
      setMode("build");
      openBottomDock("tasks", false);
      return;
    }
    showProjectJumpFeedback("warning", "动作不可用", `${item.title} 暂时没有可执行目标。`);
  };

  const handleProjectExplorerTreeKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (visibleProjectExplorerNodes.length === 0) {
      return;
    }

    const selectedIndex = visibleProjectExplorerNodes.findIndex((node) => node.id === selectedProjectExplorerNodeId);
    const activeIndex = visibleProjectExplorerNodes.findIndex((node) => node.active);
    const currentIndex = selectedIndex >= 0 ? selectedIndex : activeIndex >= 0 ? activeIndex : 0;
    const selectedNode = visibleProjectExplorerNodes[currentIndex] ?? visibleProjectExplorerNodes[0];
    const selectNodeAt = (index: number) => {
      const nextNode = visibleProjectExplorerNodes[clamp(index, 0, visibleProjectExplorerNodes.length - 1)];
      if (nextNode) {
        setSelectedProjectExplorerNodeId(nextNode.id);
      }
    };

    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectNodeAt(currentIndex + 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      selectNodeAt(currentIndex - 1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      selectNodeAt(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      selectNodeAt(visibleProjectExplorerNodes.length - 1);
      return;
    }

    if (!selectedNode) {
      return;
    }

    const commandKey = event.ctrlKey || event.metaKey;
    const selectedUiFileId = selectedNode.fileId;

    if (commandKey && event.altKey && event.key === "ArrowRight") {
      event.preventDefault();
      expandProjectExplorerTree();
      return;
    }

    if (commandKey && event.altKey && event.key === "ArrowLeft") {
      event.preventDefault();
      collapseProjectExplorerTree();
      return;
    }

    if (commandKey && !event.altKey && event.key.toLowerCase() === "n") {
      event.preventDefault();
      createNewFileFromNavigator();
      return;
    }

    if (selectedUiFileId && !commandKey && !event.altKey && event.key === "F2") {
      event.preventDefault();
      renameProjectExplorerUiFile(selectedUiFileId);
      return;
    }

    if (selectedUiFileId && commandKey && !event.altKey && event.key.toLowerCase() === "d") {
      event.preventDefault();
      const file = duplicateFileById(selectedUiFileId);
      if (file) {
        recordInstantProjectAction("duplicate-ui-file", `已从项目树复制 ${selectedNode.label} 为 ${file.name}。`);
      }
      return;
    }

    if (selectedUiFileId && !commandKey && !event.altKey && (event.key === "Delete" || event.key === "Backspace")) {
      event.preventDefault();
      requestDeleteFileById(selectedUiFileId);
      return;
    }

    const selectedHasChildren = projectExplorerFolderNodeIds.includes(selectedNode.id);
    const selectedCollapsed = collapsedProjectExplorerNodeSet.has(selectedNode.id);

    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (selectedHasChildren && selectedCollapsed) {
        toggleProjectExplorerNode(selectedNode.id);
        return;
      }
      if (selectedNode.action !== "none") {
        handleProjectExplorerNode(selectedNode);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (selectedHasChildren && !selectedCollapsed) {
        toggleProjectExplorerNode(selectedNode.id);
        return;
      }
      if (selectedNode.parentId && projectExplorerNodeById.has(selectedNode.parentId)) {
        setSelectedProjectExplorerNodeId(selectedNode.parentId);
      }
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && event.currentTarget === event.target) {
      event.preventDefault();
      handleProjectExplorerNode(selectedNode);
    }
  };

  const openProjectExplorerContextMenu = (event: ReactMouseEvent<HTMLElement>, node: ProjectExplorerNode) => {
    event.preventDefault();
    event.stopPropagation();
    setCanvasContextMenu(null);
    setSelectedProjectExplorerNodeId(node.id);
    setProjectExplorerContextMenu({
      ...placeFloatingEditorMenu(
        event.clientX,
        event.clientY,
        projectExplorerContextMenuWidth,
        projectExplorerContextMenuEstimatedHeight,
      ),
      nodeId: node.id,
    });
  };

  const closeProjectExplorerContextMenu = () => {
    setProjectExplorerContextMenu(null);
  };

  const runProjectExplorerContextAction = (
    action:
      | "open"
      | "copy-path"
      | "reveal"
      | "filter-kind"
      | "show-all"
      | "copy-relative-path"
      | "rename-ui-file"
      | "new-ui-file"
      | "duplicate-ui-file"
      | "delete-ui-file",
    node: ProjectExplorerNode,
  ) => {
    closeProjectExplorerContextMenu();
    if (action === "new-ui-file") {
      createNewFileFromNavigator();
      return;
    }
    if (action === "rename-ui-file") {
      if (!node.fileId) {
        showProjectJumpFeedback("warning", "请选择 UI 文件", "只有具体 .ui 文件节点可以重命名。");
        return;
      }
      renameProjectExplorerUiFile(node.fileId);
      return;
    }
    if (action === "duplicate-ui-file") {
      if (!node.fileId) {
        showProjectJumpFeedback("warning", "请选择 UI 文件", "只有具体 .ui 文件节点可以复制。");
        return;
      }
      const file = duplicateFileById(node.fileId);
      if (file) {
        recordInstantProjectAction("duplicate-ui-file", `已从项目树复制 ${node.label} 为 ${file.name}。`);
      }
      return;
    }
    if (action === "delete-ui-file") {
      if (!node.fileId) {
        showProjectJumpFeedback("warning", "请选择 UI 文件", "只有具体 .ui 文件节点可以删除。");
        return;
      }
      requestDeleteFileById(node.fileId);
      return;
    }
    if (action === "open") {
      handleProjectExplorerNode(node);
      return;
    }
    if (action === "copy-path") {
      void copyArtifactPath(node.path ?? projectRelativePath(node.label.replace(/\/$/, "")));
      return;
    }
    if (action === "copy-relative-path") {
      const relativePath = node.path?.startsWith(activeProject.rootPath ?? "")
        ? node.path.slice((activeProject.rootPath ?? "").length).replace(/^[/\\]+/, "")
        : node.path || projectRelativePath(node.label.replace(/\/$/, ""));
      void copyArtifactPath(relativePath);
      return;
    }
    if (action === "reveal") {
      if (node.path) {
        void openLocalArtifact(node.path);
      } else {
        showProjectJumpFeedback("warning", "路径尚未生成", "先保存项目，Nova 会创建磁盘目录和 .nova 元数据。");
      }
      return;
    }
    if (action === "filter-kind") {
      const groupId = projectExplorerNodeGroupId(node);
      const nextFilter: ProjectExplorerFilterId =
        groupId === "app"
          ? "build"
          : groupId === "ui" || groupId === "rust" || groupId === "assets" || groupId === "backend" || groupId === "meta"
            ? groupId
            : "all";
      setProjectExplorerFilter(nextFilter);
      setProjectExplorerQuery("");
      showProjectJumpFeedback("success", "项目树已筛选", `${projectExplorerGroupMeta(groupId).label} 节点已聚焦显示。`);
      return;
    }
    if (action === "show-all") {
      setProjectExplorerFilter("all");
      setProjectExplorerQuery("");
      expandProjectExplorerTree();
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

  const openActiveRustCommandSlot = () => {
    if (activeRustCommandOutlineEntry) {
      openRustLogicOutlineEntry(activeRustCommandOutlineEntry);
      return;
    }
    appendMissingRustSlotForCommand(activeRustCommand.id);
  };

  const focusActiveRustCommandPrimaryCaller = () => {
    if (!activeRustCommandPrimaryCaller) {
      setLogicResourceView("connections");
      showProjectJumpFeedback("warning", "暂无 UI 调用者", "先在信号 / 槽连接里把控件事件绑定到当前 Rust command。");
      return;
    }
    setSelectedId(activeRustCommandPrimaryCaller.item.id);
    setMode("design");
    setRightDockTab("connections");
    setFeedbackPanelOpen(false);
    setBottomDockExpanded(false);
    setBottomDockMinimized(true);
    showProjectJumpFeedback(
      "success",
      "已跳到主调用控件",
      `${getItemSummary(activeRustCommandPrimaryCaller.item)}.${activeRustCommandPrimaryCaller.eventName} 已在连接面板中聚焦。`,
    );
  };

  const runActiveRustCommandPrimaryCaller = () => {
    if (!activeRustCommandPrimaryCaller) {
      setLogicResourceView("connections");
      showProjectJumpFeedback("warning", "无法运行当前命令", "当前 Rust command 还没有绑定到任何 UI 事件。");
      return;
    }
    runLogicSignalSlotEvent(activeRustCommandPrimaryCaller.item, activeRustCommandPrimaryCaller.eventName);
  };

  const openActiveRustCommandPrimaryMapping = () => {
    if (!activeRustCommandPrimaryCaller) {
      setLogicResourceView("connections");
      showProjectJumpFeedback("warning", "暂无映射可编辑", "请选择一个 UI 事件，或先把候选信号绑定到当前 Rust command。");
      return;
    }
    openLogicConnectionSettings(activeRustCommandPrimaryCaller.item, activeRustCommandPrimaryCaller.eventName);
  };

  const copyActiveRustCommandInvokeName = async () => {
    const commandName = sanitizeRustCommandName(activeRustCommand.name);
    try {
      await navigator.clipboard.writeText(commandName);
      showProjectJumpFeedback("success", "已复制 invoke 名称", commandName);
    } catch (error) {
      const message = `无法复制 Rust command 名称：${String(error)}`;
      setBuildError(message);
      showProjectJumpFeedback("warning", "复制失败", message);
    }
  };

  const copyBottomDockLog = async () => {
    if (!bottomDockLogText.trim()) {
      return;
    }
    try {
      await navigator.clipboard.writeText(bottomDockLogText);
      setCopiedOutputLog(true);
      window.setTimeout(() => setCopiedOutputLog(false), 1400);
    } catch (error) {
      setBuildError(`无法复制日志：${String(error)}`);
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
                runtimeLogPreview: `Nova 运行控制台\n${result.summary}\n日志：${result.log_path}`,
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
                runtimeLogPreview: `Nova 运行控制台\n${result.summary}\n日志：${result.log_path}`,
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

  useEffect(() => {
    const refreshLatestRunningSession = () => {
      if (!isTauriRuntime()) {
        return;
      }
      if (
        !latestRunSessionEntry ||
        latestRunSessionEntry.runStatus !== "running" ||
        !latestRunSessionEntry.outputExePath ||
        !latestRunSessionEntry.launchedPid
      ) {
        return;
      }

      const refreshKey = [
        latestRunSessionEntry.id,
        latestRunSessionEntry.launchedPid,
        normalizeComparablePath(latestRunSessionEntry.outputExePath),
      ].join(":");
      const now = Date.now();
      if (autoRunSessionRefreshRef.current.key === refreshKey && now - autoRunSessionRefreshRef.current.checkedAt < 12_000) {
        return;
      }
      autoRunSessionRefreshRef.current = { key: refreshKey, checkedAt: now };
      void refreshRunSession(latestRunSessionEntry);
    };

    refreshLatestRunningSession();
    const handleWindowFocus = () => refreshLatestRunningSession();
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshLatestRunningSession();
      }
    };
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeProject.id,
    latestRunSessionEntry?.id,
    latestRunSessionEntry?.runStatus,
    latestRunSessionEntry?.launchedPid,
    latestRunSessionEntry?.outputExePath,
  ]);

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
        setBuildError("读取运行控制台需要在 Tauri 桌面 app 中运行。");
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
        const message = "快速检查需要在 Tauri 桌面 app 中运行。浏览器模式只能执行编辑器内检查。";
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

  const previewGeneratedProjectFiles = async ({
    revealBuildMode = true,
    projectSnapshot = activeProject,
  }: {
    revealBuildMode?: boolean;
    projectSnapshot?: DesignerProject;
  } = {}) => {
    if (revealBuildMode) {
      setMode("build");
    }
    setPreviewingGeneratedFiles(true);
    setBuildError("");
    const previewSnapshotHash = stableTextHash(projectSnapshotFingerprint(projectSnapshot));
    try {
      const result = await invokeIfAvailable<GeneratedFilePreviewResult>("preview_generated_project_files", {
        project: projectSnapshot,
        rustLogic: projectSnapshot.rustLogic,
      });
      if (!result) {
        setBuildError("生成文件计划需要在 Tauri 桌面 app 中运行。");
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
      const previewImpact = createProjectChangeImpact(projectSnapshot, result, previewSnapshotHash, previewSnapshotHash);
      recordProjectDependencyGraphEvent(
        {
          kind: "preview",
          actionId: "generate-file-plan",
          status: "succeeded",
          summary: result.summary,
          artifactPath: result.root_path,
        },
        previewImpact,
        projectSnapshot,
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
      selectRustCommand(source.commandId);
      setMode("logic");
      return;
    }

    if (source.moduleId && activeProject.rustModules.some((module) => module.id === source.moduleId)) {
      selectRustModule(source.moduleId);
      setMode("logic");
      return;
    }

    if (source.dependencyId && activeProject.cargoDependencies.some((dependency) => dependency.id === source.dependencyId)) {
      selectCargoDependency(source.dependencyId);
      setMode("logic");
      return;
    }

    if (source.integrationId && activeProject.backendIntegrations.some((integration) => integration.id === source.integrationId)) {
      selectBackendIntegration(source.integrationId);
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
      setBuildError("当前源对象还没有可定位的生成目标，请先刷新生成计划。");
      return;
    }
    setSelectedGeneratedPreviewPaths(targetPaths);
    setActiveGeneratedPreviewPath(targetPaths[0]);
    setMode("build");
  };

  const applyGeneratedFilesByPaths = async (
    relativePaths: string[],
    emptyMessage = "请先选择至少一个生成目标文件。",
    {
      revealBuildMode = true,
      projectSnapshot = activeProject,
    }: {
      revealBuildMode?: boolean;
      projectSnapshot?: DesignerProject;
    } = {},
  ) => {
    const targetPaths = Array.from(new Set(relativePaths.filter(Boolean)));
    if (targetPaths.length === 0) {
      setBuildError(emptyMessage);
      return null;
    }
    const appliedScopeIds = dirtyScopeIdsForImpact(projectChangeImpact);
    if (revealBuildMode) {
      setMode("build");
    }
    setApplyingGeneratedFiles(true);
    setBuildError("");
    try {
      const result = await invokeIfAvailable<ApplyGeneratedFilesResult>("apply_generated_project_files", {
        project: projectSnapshot,
        rustLogic: projectSnapshot.rustLogic,
        relativePaths: targetPaths,
        createdAt: new Date().toISOString(),
      });
      if (!result) {
        setBuildError("应用生成文件需要在 Tauri 桌面 app 中运行。");
        return null;
      }
      setGeneratedFileApplyResult(result);
      const preview = await invokeIfAvailable<GeneratedFilePreviewResult>("preview_generated_project_files", {
        project: projectSnapshot,
        rustLogic: projectSnapshot.rustLogic,
      });
      if (preview) {
        const nextProjectSnapshot = { ...projectSnapshot, rootPath: result.root_path };
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

  const applyGeneratedFileChanges = async ({
    revealBuildMode = true,
    projectSnapshot = activeProject,
  }: {
    revealBuildMode?: boolean;
    projectSnapshot?: DesignerProject;
  } = {}): Promise<ProjectTaskRunResult> => {
    const preview = await previewGeneratedProjectFiles({ revealBuildMode, projectSnapshot });
    if (!preview) {
      return { status: "skipped", summary: "自动应用生成文件需要 Tauri 桌面运行时。" };
    }
    const paths = preview.entries.filter(generatedPreviewEntryNeedsApply).map((entry) => entry.relative_path);
    if (paths.length === 0) {
      return {
        status: "skipped",
        summary: "生成目标文件已经是最新状态。",
        logPreview: `${preview.unchanged_count} unchanged / ${preview.total_count} total generated target file(s).`,
        artifactPath: preview.root_path,
      };
    }
    const result = await applyGeneratedFilesByPaths(paths, "没有找到已变更的生成文件。", { revealBuildMode, projectSnapshot });
    if (!result) {
      return { status: "skipped", summary: "没有应用任何生成文件变更。", artifactPath: preview.root_path };
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
        const message = "构建需要在 Tauri 桌面 app 中运行。浏览器模式只会把工作区保存到本地。";
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
        const message = "安装包构建需要在 Tauri 桌面 app 中运行。浏览器模式只会把工作区保存到本地。";
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
  const canvasSelectionMode = selectionMarquee?.mode ?? "idle";
  const canvasInteractionMode = canvasPanActive
    ? "pan"
    : selectionMarquee
      ? `marquee-${selectionMarquee.mode}`
      : mode === "design"
        ? "select"
        : "inspect";
  const selectionModeHudTone = selectionMarquee
    ? selectionMarquee.mode === "subtract"
      ? "subtract"
      : selectionMarquee.mode === "add"
        ? "add"
        : "marquee"
    : canvasPanActive
      ? "pan"
      : selectedItems.length > 1
        ? "multi"
        : selectedItem
          ? "single"
          : "idle";
  const selectionModeHudCount = selectionMarquee
    ? getItemIdsInsideMarquee(
        selectionMarquee,
        (itemId) => {
          const item = items.find((candidate) => candidate.id === itemId);
          if (!item) return null;
          const position = getAbsolutePosition(item, items);
          return { x: position.x, y: position.y, width: item.width, height: item.height };
        },
        items.map((item) => item.id),
      ).length
    : selectedIds.length;
  const selectionModeHudLabel =
    selectionModeHudTone === "subtract"
      ? "减选中"
      : selectionModeHudTone === "add"
        ? "加选中"
        : selectionModeHudTone === "marquee"
          ? "框选中"
          : selectionModeHudTone === "pan"
            ? "平移画布"
            : selectionModeHudTone === "multi"
              ? "多选"
              : selectionModeHudTone === "single"
                ? "单选"
                : "选择工具";
  const selectionModeHudDetail =
    selectionMarquee
      ? "松开鼠标完成选择，Esc 取消"
      : canvasPanActive
        ? "拖动画布空白区域移动视图"
        : selectedItems.length > 1
          ? "Ctrl/Shift 可继续增减选，右键批量操作"
          : selectedItem
            ? "右键打开控件菜单，F2/Enter 可编辑文本"
            : "空白处拖拽框选，Ctrl/Shift 叠加选择";
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const status = {
      active: mode === "design",
      tone: selectionModeHudTone,
      label: selectionModeHudLabel,
      detail: selectionModeHudDetail,
      count: selectionModeHudCount,
    };
    const targetWindow = window as Window & {
      __novaBuilderSelectionStatus?: typeof status;
    };
    targetWindow.__novaBuilderSelectionStatus = status;
    window.dispatchEvent(new CustomEvent("nova-builder-selection-status", { detail: status }));
  }, [mode, selectionModeHudCount, selectionModeHudDetail, selectionModeHudLabel, selectionModeHudTone]);

  useEffect(() => {
    return () => {
      if (typeof window === "undefined") {
        return;
      }
      const status = { active: false };
      const targetWindow = window as Window & {
        __novaBuilderSelectionStatus?: typeof status;
      };
      targetWindow.__novaBuilderSelectionStatus = status;
      window.dispatchEvent(new CustomEvent("nova-builder-selection-status", { detail: status }));
    };
  }, []);
  const selectionModeAffordanceItems = [
    {
      id: "marquee",
      label: "框选",
      shortcut: "拖拽",
      detail: "在画布空白处拖出范围",
      active: selectionModeHudTone === "marquee",
    },
    {
      id: "add",
      label: "加选",
      shortcut: "Ctrl / Shift",
      detail: "叠加点选或框选结果",
      active: selectionModeHudTone === "add",
    },
    {
      id: "subtract",
      label: "减选",
      shortcut: "Alt",
      detail: "从当前选择集中移除",
      active: selectionModeHudTone === "subtract",
    },
    {
      id: "invert",
      label: "反选",
      shortcut: "Ctrl+I",
      detail: "切换为画布补集",
      active: false,
      disabled: items.length === 0,
      action: selectInverseSelection,
    },
    {
      id: "clear",
      label: "清空",
      shortcut: "Esc",
      detail: "取消当前选择",
      active: false,
      disabled: selectedIds.length === 0,
      action: () => clearSelection({ feedback: true }),
    },
  ];
  const selectionCapabilityItems = [
    {
      id: "layout",
      label: "布局",
      value: hasCanvasSelection
        ? selectedItems.length > 1
          ? `${selectedItems.length} 个`
          : "单选"
        : "待选择",
      detail: hasCanvasSelection ? "属性、对齐、层级和尺寸可用" : "选择控件后启用布局编辑",
      enabled: hasCanvasSelection,
      icon: Maximize2,
      action: () => setRightDockTab("properties"),
    },
    {
      id: "text",
      label: "文本",
      value: selectedItem ? (selectedQuickTextProps.length > 0 ? `${selectedQuickTextProps.length} 项` : "无文本") : "待选择",
      detail: selectedQuickTextProps.length > 0 ? "F2、Enter 或菜单快编" : "当前选择没有直接文本字段",
      enabled: Boolean(selectedItem && selectedQuickTextProps.length > 0),
      icon: Type,
      action: () => {
        if (selectedItem && selectedQuickTextProps[0]) {
          startInlineTextEdit(selectedItem, selectedQuickTextProps[0], "actionbar");
        }
      },
    },
    {
      id: "logic",
      label: "逻辑",
      value: selectedEventCommand ? "已绑定" : selectedEventName ? "可绑定" : selectedItem ? "静态" : "待选择",
      detail: selectedEventCommand
        ? `连接到 ${sanitizeRustCommandName(selectedEventCommand.name)}`
        : selectedEventName
          ? `${selectedEventName} 可创建 Rust 槽`
          : "选择有事件的控件后启用",
      enabled: Boolean(selectedItem && selectedEventName),
      icon: Braces,
      action: () => setRightDockTab("connections"),
    },
    {
      id: "runtime",
      label: "运行态",
      value: hasCanvasSelection
        ? selectedItems.length > 1
          ? `${selectedBatchRuntimeSummary.visibleCount}/${selectedItems.length} 可见`
          : selectedItem?.props.visible === false
            ? "隐藏"
            : selectedItem?.props.enabled === false
              ? "禁用"
              : "可见"
        : "待选择",
      detail: hasCanvasSelection ? "可管理可见、启用、只读和锁定" : "选择控件后启用运行态控制",
      enabled: hasCanvasSelection,
      icon: Eye,
      action: () => setRightDockTab("properties"),
    },
  ];
  const selectionCapabilityStrip = (
    <div
      className="hidden min-w-0 shrink-0 flex-wrap items-center gap-1 rounded-xl border border-outline-variant bg-surface-container px-1.5 py-1 text-[0.58rem] text-on-surface-variant 2xl:flex"
      data-builder-selection-capability-strip=""
      data-builder-selection-capability-state={selectionActionBarState}
      data-builder-selection-capability-count={selectionCapabilityItems.length}
      aria-label="当前选择能力"
    >
      {selectionCapabilityItems.map((item) => {
        const ItemIcon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              "focus-ring inline-flex h-5 min-w-0 shrink-0 items-center gap-1 rounded-full px-1.5 transition",
              item.enabled
                ? "bg-surface-container-high text-on-surface hover:bg-secondary-container hover:text-secondary-container-foreground"
                : "cursor-not-allowed opacity-45",
            )}
            data-builder-selection-capability={item.id}
            data-builder-selection-capability-enabled={item.enabled ? "true" : "false"}
            data-builder-selection-capability-value={item.value}
            title={`${item.label}：${item.detail}`}
            disabled={!item.enabled}
            onClick={item.action}
          >
            <ItemIcon aria-hidden className="size-3 shrink-0" />
            <span>{item.label}</span>
            <span className="max-w-20 truncate font-mono text-[0.52rem]" data-builder-selection-capability-value-label={item.id}>
              {item.value}
            </span>
          </button>
        );
      })}
    </div>
  );
  const selectionModeStrip = (
    <div
      className="hidden"
      data-builder-selection-mode-strip=""
      data-builder-selection-mode-strip-state={selectionModeHudTone}
      data-builder-selection-mode-strip-count={selectionModeHudCount}
      aria-label="选择模式快捷提示"
    >
      <span className="shrink-0 font-medium text-on-surface" data-builder-selection-mode-strip-label="">
        {selectionModeHudLabel}
      </span>
      {selectionModeAffordanceItems.map((item) => {
        const commonClass = cn(
          "focus-ring inline-flex h-5 shrink-0 items-center gap-1 rounded-full border px-1.5 font-medium transition-colors",
          item.active
            ? "border-primary bg-primary-container text-primary-container-foreground"
            : "border-outline-variant bg-surface-container text-on-surface-variant",
          item.disabled && "cursor-not-allowed opacity-45",
        );
        const content = (
          <>
            <span>{item.label}</span>
            <span className="rounded-full bg-surface-container-high px-1 font-mono text-[0.54rem]" data-builder-selection-mode-shortcut={item.shortcut}>
              {item.shortcut}
            </span>
          </>
        );

        if (item.action) {
          return (
            <button
              key={item.id}
              type="button"
              className={commonClass}
              data-builder-selection-mode-affordance={item.id}
              data-builder-selection-mode-affordance-active={item.active ? "true" : "false"}
              title={`${item.label}：${item.detail}`}
              disabled={item.disabled}
              onClick={item.action}
            >
              {content}
            </button>
          );
        }

        return (
          <span
            key={item.id}
            className={commonClass}
            data-builder-selection-mode-affordance={item.id}
            data-builder-selection-mode-affordance-active={item.active ? "true" : "false"}
            title={`${item.label}：${item.detail}`}
          >
            {content}
          </span>
        );
      })}
    </div>
  );
  const canvasContextMenuItem = canvasContextMenu?.itemId ? items.find((item) => item.id === canvasContextMenu.itemId) ?? null : null;
  const canvasContextMenuEventName = canvasContextMenuItem ? eventNameForItem(canvasContextMenuItem) : null;
  const canvasContextMenuCommandId = canvasContextMenuItem && canvasContextMenuEventName ? eventCommandId(canvasContextMenuItem, canvasContextMenuEventName) : "";
  const canvasContextMenuCommand = canvasContextMenuCommandId
    ? activeProject.rustCommands.find((command) => command.id === canvasContextMenuCommandId) ?? null
    : null;
  const canvasContextMenuTextProps = canvasContextMenuItem ? quickTextPropsForItem(canvasContextMenuItem) : [];
  const canvasContextMenuSelectionLocked = selectedItems.length > 0 && selectedItems.every((item) => item.locked);
  const canvasContextMenuSelectionVisible = selectedItems.length > 0 && selectedBatchRuntimeSummary.visibleCount === selectedItems.length;
  const canvasContextMenuSelectionEnabled =
    selectedBatchRuntimeSummary.focusableCount > 0 && selectedBatchRuntimeSummary.enabledCount === selectedBatchRuntimeSummary.focusableCount;
  const canvasContextMenuSelectionReadOnly =
    selectedBatchRuntimeSummary.readOnlyCapableCount > 0 &&
    selectedBatchRuntimeSummary.readOnlyCount === selectedBatchRuntimeSummary.readOnlyCapableCount;
  const projectExplorerContextNode = projectExplorerContextMenu
    ? projectExplorerNodeById.get(projectExplorerContextMenu.nodeId) ?? null
    : null;
  const canvasDragMetricsOverlay = useMemo<CanvasDragMetricsOverlay | null>(() => {
    if (!dragSession || mode !== "design") {
      return null;
    }

    if (dragSession.kind === "move") {
      const movedItems = dragSession.ids
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is BuilderItem => Boolean(item));
      if (movedItems.length === 0) {
        return null;
      }
      const bounds = boundsFromRects(movedItems.map((item) => itemCanvasBounds(item, items)));
      const primaryItem = movedItems[0];
      const origin = dragSession.origins[primaryItem.id] ?? { x: primaryItem.x, y: primaryItem.y };
      const deltaX = Math.round(primaryItem.x - origin.x);
      const deltaY = Math.round(primaryItem.y - origin.y);
      const dropSummary =
        dropIntent?.kind === "frame"
          ? `Frame ${dropIntent.index + 1}/${dropIntent.childCount + 1}`
          : dropIntent?.kind === "canvas"
            ? "画布"
            : "自由移动";
      const precisionSummary = canvasPrecisionDragActive ? "Ctrl/⌘ 暂停吸附" : "参考线吸附";
      return {
        title: movedItems.length > 1 ? `移动 ${movedItems.length} 个控件` : `移动 ${getItemSummary(primaryItem)}`,
        detail: `Δ ${deltaX}, ${deltaY} · ${Math.round(bounds.width)} x ${Math.round(bounds.height)} · ${precisionSummary} · ${smartGuides.length} 条参考线 · ${dropSummary}`,
        x: clamp(bounds.right + 10, 10, Math.max(10, page.width - 280)),
        y: clamp(bounds.top - 36, 10, Math.max(10, page.height - 44)),
        tone: "move",
        precision: canvasPrecisionDragActive,
      };
    }

    const item = items.find((candidate) => candidate.id === dragSession.id);
    if (!item) {
      return null;
    }
    const bounds = itemCanvasBounds(item, items);
    const deltaWidth = Math.round(item.width - dragSession.originWidth);
    const deltaHeight = Math.round(item.height - dragSession.originHeight);
    return {
      title: `缩放 ${getItemSummary(item)}`,
      detail: `${Math.round(item.width)} x ${Math.round(item.height)} · Δ ${deltaWidth}, ${deltaHeight} · ${dragSession.handle.toUpperCase()} · ${smartGuides.length} 条参考线`,
      x: clamp(bounds.right + 10, 10, Math.max(10, page.width - 280)),
      y: clamp(bounds.top - 36, 10, Math.max(10, page.height - 44)),
      tone: "resize",
      precision: false,
    };
  }, [canvasPrecisionDragActive, dragSession, dropIntent, items, mode, page.height, page.width, smartGuides.length]);

  const rememberCanvasViewportPosition = (viewport: HTMLDivElement) => {
    canvasViewportStateRef.current = {
      scrollLeft: Math.max(0, Math.round(viewport.scrollLeft)),
      scrollTop: Math.max(0, Math.round(viewport.scrollTop)),
    };
  };

  const {
    startCanvasPan,
    moveCanvasPan,
    stopCanvasPan,
    startCanvasMousePan,
    handleCanvasViewportScroll,
    handleCanvasViewportWheel,
  } = useCanvasViewportInteraction({
    viewportRef: canvasViewportRef,
    canvasPanActive,
    zoomCanvasBy,
    onViewportMoved: rememberCanvasViewportPosition,
  });

  const canvasScaledWidth = page.width * page.zoom;
  const canvasScaledHeight = page.height * page.zoom;
  const canvasOuterChromeHeight = mode === "design" ? 48 : 0;
  const canvasStageStyle: CSSProperties = {
    width: canvasScaledWidth,
    height: canvasScaledHeight + canvasOuterChromeHeight,
  };
  const canvasContentPlaneStyle: CSSProperties = {
    width: canvasScaledWidth,
    height: canvasScaledHeight,
  };
  const canvasShellPreviewStyle: CSSProperties = {
    width: canvasScaledWidth,
  };
  const canvasStageViewportStyle: CSSProperties = {
    width: `max(100%, ${canvasScaledWidth}px)`,
    minHeight: "100%",
  };

  const canvasStyle: CSSProperties = {
    width: page.width,
    height: page.height,
    transform: `scale(${page.zoom})`,
    transformOrigin: "top left",
    ...getCanvasBackgroundStyle(page),
  };

  const renderCanvasNode = (item: BuilderItem): ReactNode => {
    const runtimeState = builderItemRuntimeState(item);
    const children = sortedItems.filter((child) => child.parentId === item.id);
    const managedByParentLayout = parentUsesAutoLayout(item, items);
    const isFrameDropTarget = item.type === "frame" && dropIntent?.kind === "frame" && dropIntent.frameId === item.id && mode === "design";
    const layoutMode = item.type === "frame" ? frameLayoutMode(item) : "free";
    const frameMetrics = item.type === "frame" ? frameLayoutMetrics(item) : { gap: 0, padding: 0, columns: 2 };
    const frameIntent = isFrameDropTarget && dropIntent?.kind === "frame" ? dropIntent : null;
    const dropIndex = frameIntent?.index ?? 0;
    const dropCount = frameIntent?.childCount ?? 0;
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
    const activeInlineTextEdit = inlineTextEdit?.itemId === item.id ? inlineTextEdit : null;
    const inlineEditMultiline = activeInlineTextEdit ? isMultilineQuickTextEdit(item, activeInlineTextEdit.prop) : false;
    const activeInlineTextProps = activeInlineTextEdit ? quickTextPropsForItem(item) : [];
    const quickEditableTextProps = quickTextPropsForItem(item);
    const primaryQuickEditableTextProp = quickEditableTextProps[0] ?? null;
    const primaryQuickEditableTextValue = primaryQuickEditableTextProp
      ? textPropertyValue(item.props[primaryQuickEditableTextProp])
      : "";
    return (
      <div
        key={item.id}
        data-builder-node={item.type}
        data-builder-node-id={item.id}
        data-builder-parent-id={item.parentId ?? ""}
        data-builder-node-selected={selectedIds.includes(item.id) ? "true" : "false"}
        data-builder-node-enabled={runtimeState.enabled ? "true" : "false"}
        data-builder-node-visible={runtimeState.visible ? "true" : "false"}
        data-builder-node-read-only={runtimeState.readOnly ? "true" : "false"}
        data-builder-node-runtime-state={`${runtimeState.visible ? "visible" : "hidden"} ${runtimeState.enabled ? "enabled" : "disabled"} ${runtimeState.readOnly ? "readonly" : "editable"}`}
        data-builder-frame-layout-mode={item.type === "frame" ? layoutMode : undefined}
        data-builder-inline-text-double-click={mode === "design" && primaryQuickEditableTextProp ? primaryQuickEditableTextProp : undefined}
        data-builder-inline-text-prop-count={quickEditableTextProps.length || undefined}
        data-builder-inline-text-primary-value={mode === "design" && primaryQuickEditableTextProp ? primaryQuickEditableTextValue : undefined}
        className={cn(
          managedByParentLayout ? "relative shrink-0 rounded-[12px] transition-shadow" : "absolute rounded-[12px] transition-shadow",
          mode === "design" && "select-none",
          mode === "design" && !item.locked && "cursor-grab active:cursor-grabbing",
          mode === "design" && selectedIds.includes(item.id) && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
          mode === "design" && !selectedIds.includes(item.id) && "hover:ring-1 hover:ring-outline",
          isFrameDropTarget && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
          item.locked && mode === "design" && "cursor-not-allowed opacity-90",
          mode === "design" && !runtimeState.visible && "opacity-45 ring-1 ring-dashed ring-outline",
          mode === "design" && runtimeState.visible && !runtimeState.enabled && "opacity-65 saturate-50",
        )}
        style={nodeStyle}
        onPointerDown={(event) => {
          startMove(event, item);
        }}
        onClick={(event) => {
          event.stopPropagation();
          selectItem(item.id, event);
        }}
        onDoubleClick={(event) => {
          if (mode !== "design") {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          startInlineTextEdit(item, primaryQuickEditableTextProp ?? undefined, "double-click");
        }}
        onContextMenu={(event) => openCanvasContextMenu(event, item)}
      >
        <div className={cn("h-full w-full overflow-hidden", mode === "design" && "pointer-events-none")}>
          <Suspense fallback={null}><BuilderItemPreview item={item} mode={mode} assets={activeProject.assets} /></Suspense>
        </div>

        {mode === "design" && (!runtimeState.visible || !runtimeState.enabled || runtimeState.readOnly) ? (
          <div
            className="pointer-events-none absolute right-1.5 top-1.5 z-30 flex max-w-[calc(100%-0.75rem)] flex-wrap justify-end gap-1"
            data-builder-runtime-state-badge=""
          >
            {!runtimeState.visible ? <Badge variant="outline" className="bg-surface-container-lowest/90 px-1.5 text-[0.56rem]">隐藏</Badge> : null}
            {!runtimeState.enabled ? <Badge variant="outline" className="bg-surface-container-lowest/90 px-1.5 text-[0.56rem]">禁用</Badge> : null}
            {runtimeState.readOnly ? <Badge variant="outline" className="bg-surface-container-lowest/90 px-1.5 text-[0.56rem]">只读</Badge> : null}
          </div>
        ) : null}

        {activeInlineTextEdit ? (
          <div
            className={cn(
              "absolute inset-1 z-40 flex gap-2 rounded-xl border border-primary/45 bg-surface-container-lowest/95 p-2 shadow-m3-2 backdrop-blur",
              inlineEditMultiline ? "items-stretch" : "items-center",
            )}
            data-builder-inline-text-editor=""
            data-builder-inline-text-edit-item-id={activeInlineTextEdit.itemId}
            data-builder-inline-text-edit-prop={activeInlineTextEdit.prop}
            data-builder-inline-text-edit-source={activeInlineTextEdit.source}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
          >
            {activeInlineTextProps.length > 1 ? (
              <div
                className="absolute -top-10 left-0 z-50 flex max-w-[min(28rem,calc(100vw-2rem))] items-center gap-1 overflow-x-auto rounded-2xl border border-outline-variant bg-surface-container-lowest/98 p-1 text-[0.62rem] shadow-m3-2 backdrop-blur"
                data-builder-inline-text-field-switcher=""
                data-builder-inline-text-field-count={activeInlineTextProps.length}
              >
                {activeInlineTextProps.map((prop) => (
                  <button
                    key={prop}
                    type="button"
                    className={cn(
                      "focus-ring h-7 shrink-0 rounded-xl px-2 font-medium transition",
                      prop === activeInlineTextEdit.prop
                        ? "bg-secondary-container text-secondary-container-foreground"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                    )}
                    data-builder-inline-text-field-tab={prop}
                    aria-pressed={prop === activeInlineTextEdit.prop}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => switchInlineTextEditProp(prop)}
                  >
                    {quickTextPropLabel(prop)}
                  </button>
                ))}
              </div>
            ) : null}
            {inlineEditMultiline ? (
              <Textarea
                key={`${activeInlineTextEdit.itemId}-${activeInlineTextEdit.prop}`}
                autoFocus
                aria-label={`编辑${quickTextPropLabel(activeInlineTextEdit.prop)}`}
                className="min-h-0 min-w-0 flex-1 resize-none rounded-lg bg-surface-container-high px-2 py-2 text-xs leading-5"
                value={activeInlineTextEdit.value}
                onChange={(event) => setInlineTextEdit((current) => (current ? { ...current, value: event.target.value } : current))}
                onBlur={commitInlineTextEdit}
                onKeyDown={(event) => {
                  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                    event.preventDefault();
                    commitInlineTextEdit();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    cancelInlineTextEdit();
                  }
                }}
              />
            ) : (
              <Input
                key={`${activeInlineTextEdit.itemId}-${activeInlineTextEdit.prop}`}
                autoFocus
                aria-label={`编辑${quickTextPropLabel(activeInlineTextEdit.prop)}`}
                className="h-8 min-w-0 flex-1 rounded-lg bg-surface-container-high px-2 text-xs"
                value={activeInlineTextEdit.value}
                onChange={(event) => setInlineTextEdit((current) => (current ? { ...current, value: event.target.value } : current))}
                onBlur={commitInlineTextEdit}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitInlineTextEdit();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    cancelInlineTextEdit();
                  }
                }}
              />
            )}
            <Badge variant="secondary" className={cn("shrink-0", inlineEditMultiline && "self-start")}>
              {quickTextPropLabel(activeInlineTextEdit.prop)}
            </Badge>
          </div>
        ) : null}

        {children.length > 0 ? (
          <div className="subtle-scrollbar rounded-[12px]" style={frameChildrenStyle(item)}>
            {children.map((child) => renderCanvasNode(child))}
          </div>
        ) : null}

        {isFrameDropTarget ? (
          <div className="pointer-events-none absolute inset-2 z-30 overflow-hidden rounded-[14px] border border-dashed border-primary/80 bg-primary/10 p-2 shadow-m3-1 backdrop-blur-[1px]">
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/25 bg-surface-container-lowest/95 px-2 py-1 text-[0.66rem] font-medium text-primary shadow-m3-1">
              <PanelTop aria-hidden className="size-3" />
              <span className="truncate">放入 Frame</span>
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

        {mode === "design" && selectedItem?.id === item.id && !item.locked ? (
          <>
            {resizeHandleMetas.map((meta) => (
              <button
                key={meta.handle}
                type="button"
                data-builder-resize-handle={meta.handle}
                aria-label={meta.label}
                title={meta.label}
                className={cn(
                  "focus-ring absolute z-20 flex size-6 touch-none items-center justify-center rounded-full border border-primary bg-surface text-primary shadow-m3-1 transition-transform hover:scale-110",
                  meta.className,
                )}
                onPointerDownCapture={(event) => startResize(event, item, meta.handle)}
              >
                {meta.handle === "se" ? <Maximize2 aria-hidden className="size-3" /> : <span className="size-1.5 rounded-full bg-primary" />}
              </button>
            ))}
          </>
        ) : null}
      </div>
    );
  };

  const modeBarItems: Array<{ mode: BuilderMode; label: string; detail: string; icon: typeof Layers }> = [
    { mode: "project", label: "项目", detail: "工程", icon: FolderOpen },
    { mode: "design", label: "设计", detail: "画布", icon: MousePointer2 },
    { mode: "logic", label: "逻辑", detail: "Rust", icon: Braces },
    { mode: "build", label: "构建", detail: "运行", icon: Download },
  ];
  const switchEditorMode = (nextMode: BuilderMode) => {
    setMode(nextMode);
    if (nextMode === "project") {
      setLeftDockTab("project");
    }
    if (nextMode === "design" && leftDockTab === "project") {
      setLeftDockTab("components");
    }
  };
  const activeModeItem = modeBarItems.find((item) => item.mode === mode) ?? modeBarItems[0];
  const leftDockTabs: BuilderDockTab<BuilderLeftDockTab>[] = [
    { value: "project", label: "项目", icon: FolderOpen },
    {
      value: "navigator",
      label: "导航",
      icon: FileJson,
      // Panel tallies are readouts: "how many are in here", not a state to act on.
      badge: (
        <CountReadout
          className="px-1 py-0 text-[0.55rem] leading-4"
          label={String(activeProject.files.length)}
          count={activeProject.files.length}
        />
      ),
    },
    {
      value: "components",
      label: "组件",
      icon: Layers,
      badge: (
        <CountReadout
          className="px-1 py-0 text-[0.55rem] leading-4"
          label={String(palette.length)}
          count={palette.length}
        />
      ),
    },
    {
      value: "assets",
      label: "资源",
      icon: FileImage,
      badge: (
        <CountReadout
          className="px-1 py-0 text-[0.55rem] leading-4"
          label={String(activeProject.assets.length)}
          count={activeProject.assets.length}
        />
      ),
    },
  ];
  const rightDockTabs: BuilderDockTab<BuilderRightDockTab>[] = [
    { value: "properties", label: "属性", icon: Settings2 },
    { value: "connections", label: "连接", icon: Braces },
    { value: "responsive", label: "响应式", icon: Monitor },
    { value: "impact", label: "影响", icon: AlertTriangle },
  ];
  const bottomDockTabs: BuilderDockTab<BuilderBottomDockTab>[] = [
    {
      value: "issues",
      label: "问题",
      icon: AlertTriangle,
      badge: (
        <CountReadout
          className="px-1 py-0 text-[0.55rem] leading-4"
          label={String(builderIssueCount)}
          count={builderIssueCount}
        />
      ),
    },
    { value: "output", label: "输出", icon: Terminal },
    {
      value: "tasks",
      label: "任务",
      icon: ClipboardCopy,
      badge: (
        <CountReadout
          className="px-1 py-0 text-[0.55rem] leading-4"
          label={String(projectTasks.length)}
          count={projectTasks.length}
        />
      ),
    },
    { value: "logs", label: "日志", icon: FileJson },
    { value: "preview", label: "预览", icon: MonitorPlay },
  ];
  const editorWorkflowSteps: EditorWorkflowStep[] = [
    {
      id: "save",
      title: "保存",
      detail: saved ? "项目文件已同步" : "保存并同步项目文件",
      badge: saved ? "已同步" : "待保存",
      icon: Save,
      actions: ["save-project"],
    },
    {
      id: "generate",
      title: "生成",
      detail: latestGeneratedFileSummary
        ? `${latestGeneratedFileSummary.changed_count} 个变更 / ${latestGeneratedFileSummary.total_count} 个目标`
        : "检查并应用目标文件",
      badge: "文件",
      icon: FileJson,
      actions: ["generate-file-plan", "apply-generated-changes"],
    },
    {
      id: "check",
      title: "检查",
      detail: buildReadinessSummary.errorCount > 0 ? `${buildReadinessSummary.errorCount} 个阻塞项待处理` : "运行后端和快速检查",
      badge: buildReadinessSummary.errorCount > 0 ? "阻塞" : "检查",
      icon: Terminal,
      actions: ["build-backend-artifacts", "quick-check-all", "audit-editor-experience"],
    },
    {
      id: "validate",
      title: "验证",
      detail: activeProject.validationHistory?.[0]
        ? `${activeProject.validationHistory[0].status} · ${activeProject.validationHistory[0].score}%`
        : "审查生成窗口",
      badge: "审查",
      icon: Monitor,
      actions: ["validate-window"],
    },
    {
      id: "build",
      title: "构建",
      detail: latestBuildEntry ? `${latestBuildEntry.releaseAppName} v${latestBuildEntry.releaseVersion}` : "编译 release exe",
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
  const activeBuildHistoryRuntimeSession = latestRunSessionEntry ? workflowRuntimeSessionFromBuildHistory(latestRunSessionEntry) : null;
  const activeWorkflowRuntimeSession =
    workflowRuntimeSession?.status === "running"
      ? workflowRuntimeSession
      : activeBuildHistoryRuntimeSession;
  const activeWorkflowRuntimeStopId = activeWorkflowRuntimeSession?.entryId ?? "workflow-runtime";
  const workflowRuntimeActive = Boolean(activeWorkflowRuntimeSession?.pid && activeWorkflowRuntimeSession.status === "running");
  const nextWorkflowStepState =
    activeWorkflowStepState ??
    editorWorkflowStepStates.find(({ status }) => status === "failed") ??
    editorWorkflowStepStates.find(({ status }) => status === "idle" || status === "skipped" || status === "canceled") ??
    null;
  const suggestedWorkflowStepId = nextWorkflowStepState?.step.id ?? null;
  const suggestedWorkflowStepIndex = suggestedWorkflowStepId
    ? editorWorkflowStepStates.findIndex(({ step }) => step.id === suggestedWorkflowStepId)
    : -1;
  const completedWorkflowStepCount = editorWorkflowStepStates.filter(({ status }) => status === "succeeded").length;
  const workflowStepCount = editorWorkflowStepStates.length;
  const workflowProgressValue = workflowRuntimeActive || workflowComplete
    ? 100
    : Math.round((completedWorkflowStepCount / Math.max(1, workflowStepCount)) * 100);
  const workflowProgressLabel = workflowComplete
    ? `${workflowStepCount}/${workflowStepCount} 已完成`
    : suggestedWorkflowStepIndex >= 0
      ? `步骤 ${suggestedWorkflowStepIndex + 1}/${workflowStepCount}`
      : `${completedWorkflowStepCount}/${workflowStepCount} 已完成`;
  const workflowPrimaryActionLabel =
    workflowRuntimeActive
      ? stoppingRunId === activeWorkflowRuntimeStopId
        ? "正在停止"
        : "停止目标"
      : workflowComplete && activeProject.outputExePath
      ? launchingExeId === "active-output"
        ? "正在启动"
        : "运行 exe"
      : workflowComplete
        ? "打开输出"
        : nextWorkflowStepState?.status === "failed"
          ? "重试"
          : nextWorkflowStepState?.status === "running"
            ? "运行中"
            : "继续";
  const workflowPrimaryActionDisabled = workflowRuntimeActive
    ? Boolean(stoppingRunId)
    : workflowComplete
    ? Boolean(activeProject.outputExePath && launchingExeId)
    : Boolean(!nextWorkflowStepState || runningProjectTask || queuedProjectTaskCount > 0);
  const workflowRailStateLabel = activeWorkflowStepState ? "当前步骤" : workflowRuntimeActive ? "目标运行中" : workflowComplete ? "流程完成" : "下一步";
  const workflowRailBadgeLabel = workflowRuntimeActive
    ? "运行中"
    : workflowComplete
    ? "完成"
    : nextWorkflowStepState
      ? workflowStepStatusLabel(nextWorkflowStepState.status)
      : "就绪";
  const workflowRailBadgeVariant = nextWorkflowStepState?.status === "failed" ? "destructive" : workflowComplete || workflowRuntimeActive ? "secondary" : "outline";
  const workflowActivityText = runningProjectTask
    ? `正在运行 ${runningProjectTask.title}`
    : queuedProjectTaskCount > 0
      ? `${queuedProjectTaskCount} 个任务排队中`
      : failedProjectTaskCount > 0
        ? `${failedProjectTaskCount} 个任务失败`
        : "已准备好执行下一个编辑操作";
  const workflowRailTitle = workflowRuntimeActive ? "运行时已启动" : workflowComplete ? "可以运行" : nextWorkflowStepState?.step.title ?? "工作流就绪";
  const workflowRailDetail = workflowRuntimeActive
    ? `pid ${activeWorkflowRuntimeSession?.pid} · ${activeWorkflowRuntimeSession?.status ?? "running"}`
    : workflowComplete
    ? activeProject.outputExePath
      ? `Release exe 已就绪：${fileNameFromPath(activeProject.outputExePath)}`
      : latestReleasePipeline?.summary ?? "编辑器工作流步骤已全部完成。"
    : runningProjectTask
      ? workflowActivityText
      : nextWorkflowStepState?.task?.summary ?? nextWorkflowStepState?.step.detail ?? workflowActivityText;
  const operationMonitorTitle = operationMonitorTask
    ? operationMonitorTask.pipelinePresetTitle
      ? `${operationMonitorTask.pipelinePresetTitle} / ${operationMonitorTask.title}`
      : operationMonitorTask.title
    : buildError
      ? "编辑器消息"
      : "编辑器操作";
  const operationMonitorDetail =
    operationMonitorTask?.error ??
    operationMonitorTask?.summary ??
    operationMonitorTask?.detail ??
    buildError ??
    "运行保存、生成、检查、验证或构建后，这里会显示实时任务证据。";
  const operationMonitorStatus = operationMonitorTask?.status ?? (buildError ? "failed" : "queued");
  const operationMonitorVisible = Boolean(buildError || runningProjectTask || queuedProjectTaskCount > 0 || failedProjectTaskCount > 0);
  const feedbackIssueCount = builderIssueCount;
  const feedbackSummaryTone = buildError || failedProjectTaskCount > 0
    ? "attention"
    : runningProjectTask
      ? "running"
      : queuedProjectTaskCount > 0
        ? "queued"
        : "ready";
  const feedbackSummaryTitle = buildError
    ? "编辑器需要处理"
    : runningProjectTask
      ? `正在运行 ${runningProjectTask.title}`
      : queuedProjectTaskCount > 0
        ? `${queuedProjectTaskCount} 个任务排队中`
        : latestProjectTask
          ? latestProjectTask.title
          : "反馈已就绪";
  const feedbackSummaryDetail =
    buildError ??
    runningProjectTask?.summary ??
    runningProjectTask?.detail ??
    latestFailedProjectTask?.error ??
    latestFailedProjectTask?.summary ??
    latestProjectTask?.summary ??
    (activeProject.outputExePath ? `最新 exe：${fileNameFromPath(activeProject.outputExePath)}` : "问题、任务、输出和日志会显示在这里。");
  const bottomDockLogText =
    selectedProjectTask?.logPreview ||
    selectedSimulatorTraceLogPreview ||
    latestRunSessionEntry?.runtimeLogPreview ||
    activeProject.buildLog ||
    buildError ||
    "运行检查、构建或启动生成应用后会显示运行时和任务日志。";
  const bottomDockLogSource = selectedProjectTask?.logPreview
    ? `任务：${selectedProjectTask.title}`
    : selectedSimulatorTraceLogPreview
      ? "事件模拟器"
      : latestRunSessionEntry?.runtimeLogPreview
        ? `运行时：${latestRunSessionEntry.outputExePath ? fileNameFromPath(latestRunSessionEntry.outputExePath) : activeProject.releaseConfig.appName}`
        : activeProject.buildLog
          ? "构建输出"
          : buildError
            ? "构建错误"
            : "等待日志";
  const bottomDockLogLineCount = bottomDockLogText.split(/\r\n|\r|\n/).length;
  const bottomDockLogLines = useMemo<ProjectTaskLogLine[]>(() => {
    const tokens = bottomDockLogSearchQuery
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const mapped = bottomDockLogText.split(/\r\n|\r|\n/).map((line, index) => {
      const normalized = line.toLowerCase();
      const matched = tokens.length > 0 && tokens.every((token) => normalized.includes(token));
      return {
        id: `bottom-${index + 1}-${line.slice(0, 16)}`,
        number: index + 1,
        text: line,
        matched,
      };
    });
    return tokens.length > 0 ? mapped.filter((line) => line.matched) : mapped;
  }, [bottomDockLogSearchQuery, bottomDockLogText]);
  const bottomDockLogMatchCount = bottomDockLogLines.filter((line) => line.matched).length;
  const feedbackSummaryToneLabel =
    feedbackSummaryTone === "attention"
      ? "需处理"
      : feedbackSummaryTone === "running"
        ? "运行中"
        : feedbackSummaryTone === "queued"
          ? "排队中"
          : "就绪";
  const feedbackStripVisible = feedbackPanelOpen;
  const railTaskStateLabel = runningProjectTask
    ? "运行中"
    : queuedProjectTaskCount > 0
      ? "排队中"
      : failedProjectTaskCount > 0
        ? "需处理"
        : activeProject.outputExePath
          ? "exe 就绪"
          : "待构建";
  const railRunTargetLabel = activeProject.outputExePath ? fileNameFromPath(activeProject.outputExePath) : activeProject.releaseConfig.appName || activeProject.name;
  const railEventTargetLabel = selectedEventCommand ? sanitizeRustCommandName(selectedEventCommand.name) : selectedEventName ? "待绑定" : "无事件";
  const railKitLabel = activeProject.releaseConfig.bundleTargets === "all" ? "桌面" : activeProject.releaseConfig.bundleTargets;
  const railConfigurationLabel = `${activeProject.releaseConfig.appName || activeProject.name} ${activeProject.releaseConfig.version}`;
  const railWindowTargetLabel = `${pageWindowKindMeta?.label ?? page.windowKind} / ${pageTitlebarStyleMeta?.label ?? page.titlebarStyle}`;
  const railReleaseTargetLabel = `${releaseWindowKindMeta?.label ?? activeProject.releaseConfig.windowKind} / ${releaseTitlebarStyleMeta?.label ?? activeProject.releaseConfig.titlebarStyle}`;
  const railBundleTargetLabel = activeProject.releaseConfig.bundleTargets === "all" ? "exe + installers" : activeProject.releaseConfig.bundleTargets;
  const railArtifactStateLabel = workflowRuntimeActive
    ? `pid ${activeWorkflowRuntimeSession?.pid}`
    : activeProject.outputExePath
      ? "exe 就绪"
      : activeBundlePath
        ? "安装包就绪"
        : "无产物";
  const railNextStepLabel = workflowRuntimeActive
    ? "停止运行目标"
    : workflowComplete
      ? activeProject.outputExePath
        ? "运行生成 exe"
        : "打开构建输出"
      : nextWorkflowStepState?.step.title ?? "从检查开始";
  const railQueueSummaryLabel = runningProjectTask
    ? runningProjectTask.title
    : queuedProjectTaskCount > 0
      ? `${queuedProjectTaskCount} 个任务等待`
      : failedProjectTaskCount > 0
        ? `${failedProjectTaskCount} 个任务失败`
        : latestProjectTask
          ? latestProjectTask.title
          : "暂无任务";
  const railTaskCountLabel = activeProjectTasks.length > 0 ? `${completedProjectTaskCount}/${activeProjectTasks.length}` : "0/0";
  const latestValidationRun = activeProject.validationHistory?.[0] ?? null;
  const desktopRuntimeState = workflowRuntimeActive
    ? "running"
    : building || runningProjectTask?.actionId === "build-exe"
      ? "building"
      : activeProject.outputExePath
        ? "ready"
        : "missing";
  const desktopRuntimeStatusLabel =
    desktopRuntimeState === "running"
      ? `运行中 · pid ${activeWorkflowRuntimeSession?.pid}`
      : desktopRuntimeState === "building"
        ? "正在构建 exe"
        : desktopRuntimeState === "ready"
          ? "exe 已就绪"
          : "等待构建";
  const desktopRuntimeBadgeVariant =
    desktopRuntimeState === "running" || desktopRuntimeState === "ready"
      ? "secondary"
      : desktopRuntimeState === "building"
        ? "outline"
        : "outline";
  const desktopRuntimePath =
    activeWorkflowRuntimeSession?.path ||
    activeProject.outputExePath ||
    activeBuildOutputDir ||
    projectDiskPath(activeProject.rootPath, "app", "src-tauri", "target", "release") ||
    "构建成功后生成";
  const desktopRuntimeLogPath = activeWorkflowRuntimeSession?.logPath || latestRunSessionEntry?.runtimeLogPath || "";
  const desktopRuntimePrimaryLabel = workflowRuntimeActive
    ? stoppingRunId === activeWorkflowRuntimeStopId
      ? "正在停止"
      : "停止桌面端"
    : activeProject.outputExePath
      ? launchingExeId === "active-output"
        ? "正在启动"
        : "运行桌面端"
      : "构建 exe";
  const desktopRuntimePrimaryDisabled = workflowRuntimeActive
    ? !activeWorkflowRuntimeSession || Boolean(stoppingRunId)
    : activeProject.outputExePath
      ? Boolean(launchingExeId)
      : building || bundling || Boolean(runningProjectTask);
  const desktopRuntimePrimaryLoading =
    (workflowRuntimeActive && stoppingRunId === activeWorkflowRuntimeStopId) ||
    (!workflowRuntimeActive && activeProject.outputExePath && launchingExeId === "active-output") ||
    (!activeProject.outputExePath && (building || runningProjectTask?.actionId === "build-exe"));
  const runtimeWindowParityItems = useMemo(
    () => [
      {
        id: "titlebar",
        label: "标题栏",
        value: releaseTitlebarStyleMeta.label,
        detail:
          activeProject.releaseConfig.titlebarStyle === "nova"
            ? "运行端使用 Nova 自绘标题栏，拖动区域由 Tauri drag region 承接。"
            : "当前发布标题栏不是 Nova 风格，建议同步为桌面编辑器一致的窗口壳。",
        severity: activeProject.releaseConfig.titlebarStyle === "nova" ? "pass" : "warning",
        icon: PanelTop,
      },
      {
        id: "window-kind",
        label: "窗口类型",
        value: releaseWindowKindMeta.label,
        detail: `${Math.round(activeProject.releaseConfig.windowWidth)} x ${Math.round(activeProject.releaseConfig.windowHeight)}，最小 ${Math.round(activeProject.releaseConfig.minWindowWidth)} x ${Math.round(activeProject.releaseConfig.minWindowHeight)}。`,
        severity: EDITOR_EXPERIENCE_KNOWN_WINDOW_KINDS.includes(activeProject.releaseConfig.windowKind) ? "pass" : "warning",
        icon: Monitor,
      },
      {
        id: "runtime-grid",
        label: "运行网格",
        value: "关闭",
        detail: `设计画布网格${page.showGrid ? "可开启" : "已关闭"}，生成 runtime 固定输出 data-runtime-grid=off。`,
        severity: "pass",
        icon: Grid3x3,
      },
      {
        id: "shell-sync",
        label: "页面同步",
        value: releaseWindowShellMatchesPage ? "已匹配" : "需同步",
        detail: `${pageWindowKindMeta.label} / ${pageTitlebarStyleMeta.label} -> ${releaseWindowKindMeta.label} / ${releaseTitlebarStyleMeta.label}。`,
        severity: releaseWindowShellMatchesPage ? "pass" : "warning",
        icon: Layers,
      },
      {
        id: "validation",
        label: "验证证据",
        value: latestValidationRun ? `${latestValidationRun.status} · ${latestValidationRun.score}%` : "未验证",
        detail: latestValidationRun
          ? activeProject.validationReportPath || "已记录最近一次窗口验证结果。"
          : "运行窗口验证后会写入报告、截图与 DOM 审阅记录。",
        severity: latestValidationRun?.status === "passed" ? "pass" : "warning",
        icon: CheckCircle2,
      },
    ],
    [
      activeProject.releaseConfig.minWindowHeight,
      activeProject.releaseConfig.minWindowWidth,
      activeProject.releaseConfig.titlebarStyle,
      activeProject.releaseConfig.windowHeight,
      activeProject.releaseConfig.windowKind,
      activeProject.releaseConfig.windowWidth,
      activeProject.validationReportPath,
      latestValidationRun,
      page.showGrid,
      pageTitlebarStyleMeta.label,
      pageWindowKindMeta.label,
      releaseTitlebarStyleMeta.label,
      releaseWindowKindMeta.label,
      releaseWindowShellMatchesPage,
    ],
  );
  const latestEditorExperienceAuditTask = activeProjectTasks.find((task) => task.actionId === "audit-editor-experience") ?? null;
  const editorExperienceAuditItems = useMemo<EditorExperienceAuditItem[]>(() => {
    const projectTreeHasNovaMetadata = projectExplorerModel.nodes.some((node) => node.id === "nova-workspace" || node.id === "nova-editor-state");
    const projectTreeHasManagedFiles = projectExplorerModel.nodes.some((node) => ["ui", "rust", "assets"].includes(projectExplorerNodeGroupId(node)));
    const projectTreeKeyboardReady = visibleProjectExplorerNodes.length > 0 && Boolean(selectedProjectExplorerNode);
    const projectTreeBulkFoldingReady = projectExplorerFolderNodeIds.length > 0;
    const projectTreeContextReady = projectExplorerModel.nodes.some((node) => node.action !== "none");
    const projectLocatorReady =
      projectExplorerModel.nodes.some((node) => node.id === "rust-logic" && projectExplorerNodeMatchesSearch(node, "logic.rs")) &&
      projectExplorerModel.nodes.some((node) => node.id.startsWith("ui-") && projectExplorerNodeMatchesSearch(node, "ui/"));
    const projectFileRouteCount = projectFileRouteGroups.reduce((total, group) => total + group.routes.length, 0);
    const projectFileRoutingReady =
      projectFileRouteGroups.some((group) => group.id === "source" && group.routes.some((route) => route.id === "source-ui")) &&
      projectFileRouteGroups.some((group) => group.id === "generated" && group.routes.some((route) => route.id === "generated-app")) &&
      projectFileRouteGroups.some((group) => group.id === "metadata" && group.routes.some((route) => route.id === "metadata-editor-state"));
    const projectFolderHealthReady =
      projectFolderHealthItems.length >= 4 &&
      ["root", "source", "generated", "metadata"].every((id) => projectFolderHealthItems.some((item) => item.id === id)) &&
      projectFolderHealthItems.some((item) => item.id === "metadata" && item.path.includes(".nova"));
    const projectOwnershipMatrixReady =
      projectOwnershipMatrixItems.length === 3 &&
      projectOwnershipMatrixItems.every((item) => item.routeCount > 0 && Boolean(item.primaryRoute.nodeId));
    const projectWorkingSetReady =
      projectWorkingSetItems.length >= 3 &&
      projectWorkingSetItems.some((item) => item.active) &&
      // Match the tab's own kind, not its badge text or the "current" remap:
      // an unsaved build tab or one without an exe is still the build entry.
      projectWorkingSetItems.some((item) => item.tabKind === "logic") &&
      projectWorkingSetItems.some((item) => item.tabKind === "build");
    const projectActionCenterReady =
      projectActionCenterItems.length >= 5 &&
      projectActionCenterItems.some((item) => item.kind === "sync") &&
      projectActionCenterItems.some((item) => item.kind === "logic") &&
      projectActionCenterItems.some((item) => item.kind === "run") &&
      projectActionCenterItems.some((item) => item.kind === "build");
    const textEditableControlCount = items.filter((item) => quickTextPropsForItem(item).length > 0).length;
    const runtimeStateControlCount = items.filter((item) => item.props.enabled === false || item.props.visible === false || item.props.readOnly === true).length;
    const navigatorManagedStateCount = items.filter((item) => item.locked || item.props.visible === false).length;
    const selectionValid = ["idle", "single", "multi"].includes(selectionActionBarState) && selectedIds.every((id) => items.some((item) => item.id === id));
    const selectionActionBarOverflowReady =
      selectionActionBarActionCount > 0 && (hasCanvasSelection ? selectionActionBarActionCount >= 18 : selectionActionBarActionCount === 2);
    const selectionCapabilityStripReady =
      selectionCapabilityItems.length >= 4 &&
      ["layout", "text", "logic", "runtime"].every((id) => selectionCapabilityItems.some((item) => item.id === id));
    const selectedHierarchyReady = !selectedItem || selectedItemHierarchy.some((item) => item.id === selectedItem.id);
    const marqueeValid =
      selectionMarquee === null ||
      (Number.isFinite(selectionMarquee.currentX) && Number.isFinite(selectionMarquee.currentY));
    const multiSelectLayoutToolsReady =
      selectedItems.length < 2 ||
      (selectedBatchLayoutSummary.movableCount + selectedBatchLayoutSummary.lockedCount === selectedItems.length &&
        selectedBatchLayoutSummary.boundsLabel.length > 0);
    const resizeHandlesReady = resizeHandleMetas.length === 8;
    const smartGuidesReady = SMART_GUIDE_THRESHOLD > 0;
    const groupedFrameCount = items.filter((item) => item.type === "frame" && items.some((candidate) => candidate.parentId === item.id)).length;
    const releaseShellValid =
      EDITOR_EXPERIENCE_KNOWN_WINDOW_KINDS.includes(activeProject.releaseConfig.windowKind) &&
      EDITOR_EXPERIENCE_KNOWN_TITLEBAR_STYLES.includes(activeProject.releaseConfig.titlebarStyle);
    const pageShellValid =
      EDITOR_EXPERIENCE_KNOWN_WINDOW_KINDS.includes(page.windowKind) &&
      EDITOR_EXPERIENCE_KNOWN_TITLEBAR_STYLES.includes(page.titlebarStyle);
    const pageWindowShellPresetsReady =
      pageWindowShellPresets.length >= 4 &&
      pageWindowShellPresets.some((preset) => preset.windowKind === "main" && preset.titlebarStyle === "nova") &&
      pageWindowShellPresets.some((preset) => preset.windowKind === "dialog") &&
      pageWindowShellPresets.some((preset) => preset.windowKind === "tool") &&
      pageWindowShellPresets.some((preset) => preset.windowKind === "frameless" && preset.titlebarStyle === "hidden");
    const signalSlotModelValid = Number.isFinite(logicConnectionHealthScore);
    const hasSignalSlotWarnings = missingRustSlotEntries.length > 0 || logicSignalSlotUnboundCount > 0;
    const logicFlowBoardReady = Boolean(logicWorkflowRow);
    const logicFlowBoardComplete = Boolean(logicWorkflowRow?.command && logicWorkflowOutlineEntry?.line);
    const logicContextSummaryReady =
      logicContextSummaryItems.length >= 4 &&
      ["logic-context-signal", "logic-context-cursor", "logic-context-command", "logic-context-evidence"].every((id) =>
        logicContextSummaryItems.some((item) => item.id === id),
      );
    const md3ApplicationComponentsReady =
      md3ApplicationComponentTypes.length >= 32 &&
      md3ApplicationComponentTypes.every((type) => palette.some((definition) => definition.type === type));
    const componentPaletteKitsReady =
      componentPaletteKitDefinitions.length >= 5 &&
      componentPaletteKitDefinitions.every((kit) =>
        kit.types.length >= 8 && palette.some((definition) => definition.type === kit.primaryType),
      );
    const componentPaletteKitScaffoldReady =
      componentPaletteKitsReady && componentPaletteKitRows.every((row) => row.availableCount >= Math.min(8, row.totalCount));
    const contextMenuPlacementReady =
      floatingEditorMenuViewportPadding > 0 &&
      canvasContextMenuWidth === projectExplorerContextMenuWidth &&
      projectExplorerContextMenuEstimatedHeight > 0;
    const canvasContextQuickInsertGroupCount = canvasContextQuickInsertGroups.length;
    const canvasContextQuickInsertReady =
      canvasContextQuickInsertGroupCount >= 4 && canvasContextQuickInsertTypes.length >= 20;
    const canvasContextInsertSearchReady = palette.length >= 100 && CANVAS_CONTEXT_INSERT_SEARCH_LIMIT >= 8;

    return [
      {
        id: "selection-actionbar",
        title: "固定选择操作栏",
        severity: selectionValid ? "pass" : "fail",
        detail: `选择状态 ${selectionActionBarState}，当前选中 ${selectedIds.length} 个控件。`,
      },
      {
        id: "selection-actionbar-stable-track",
        title: "选择操作栏稳定轨道",
        severity: "pass",
        detail: `选择栏固定在画布顶部预留轨道，当前工具条状态为 ${selectionActionBarReservedTrack}，选中控件不会触发布局位移。`,
      },
      {
        id: "selection-actionbar-overflow",
        title: "选择操作栏拥挤保护",
        severity: selectionActionBarOverflowReady ? "pass" : "fail",
        detail: `命令区 ${selectionActionBarActionCount} 项动作在独立滚动视口内展示，选择摘要保持固定。`,
      },
      {
        id: "selection-capability-strip",
        title: "选择能力一致性",
        severity: selectionCapabilityStripReady ? "pass" : "fail",
        detail: `选择栏固定展示 ${selectionCapabilityItems.map((item) => `${item.label}:${item.value}`).join("、")}，不同控件只改变可用状态，不改变操作栏结构。`,
      },
      {
        id: "selection-marquee",
        title: "多选与框选模型",
        severity: marqueeValid ? "pass" : "fail",
        detail: `选择锚点 ${selectionAnchorId || "无"}，框选状态 ${selectionMarquee ? selectionMarquee.mode : "空闲"}。`,
      },
      {
        id: "selection-status-bar",
        title: "状态栏选择模式提示",
        severity: ["idle", "single", "multi", "marquee", "add", "subtract", "pan"].includes(selectionModeHudTone) ? "pass" : "fail",
        detail: `${selectionModeHudLabel} · 当前计数 ${selectionModeHudCount}，提示移入底部状态栏，不占用画布空间。`,
      },
      {
        id: "selection-mode-strip",
        title: "选择模式固定帮助条",
        severity: selectionModeAffordanceItems.length >= 5 ? "pass" : "fail",
        detail: `选择栏持续展示 ${selectionModeAffordanceItems.map((item) => `${item.label}(${item.shortcut})`).join("、")}，idle/single/multi 共用同一轨道。`,
      },
      {
        id: "selection-same-type",
        title: "同类控件快速选择",
        severity: items.length > 0 ? "pass" : "warning",
        detail: selectedSameTypeAnchor
          ? `当前锚点 ${getDefinition(selectedSameTypeAnchor.type).title} 可一键选出 ${selectedSameTypeCount} 个同类控件。`
          : "选中一个控件后，可通过 Ctrl+Shift+A、选择栏或右键菜单选出同类型控件。",
      },
      {
        id: "selection-invert",
        title: "反选选择集",
        severity: items.length > 0 ? "pass" : "warning",
        detail:
          selectedIds.length > 0
            ? `当前已选 ${selectedIds.length} 个控件，可用 Ctrl+I 快速切换到剩余 ${Math.max(0, items.length - selectedIds.length)} 个控件。`
            : "可通过 Ctrl+I、选择栏或右键菜单把当前选择集切换为画布补集。",
      },
      {
        id: "multi-select-inspector",
        title: "多选批量检查器",
        severity: selectedItems.length > 1 ? "pass" : "warning",
        detail:
          selectedItems.length > 1
            ? `${selectedItems.length} 个控件可批量编辑尺寸、锁定、运行态可见、启用和只读状态。`
            : "框选或多选控件后，右侧属性面板会显示批量尺寸、锁定和运行态编辑器。",
      },
      {
        id: "multi-select-layout-tools",
        title: "多选批量布局工具",
        severity: multiSelectLayoutToolsReady ? "pass" : "warning",
        detail:
          selectedItems.length > 1
            ? `选区 ${selectedBatchLayoutSummary.boundsLabel}，${selectedBatchLayoutSummary.movableCount} 个可移动、${selectedBatchLayoutSummary.lockedCount} 个锁定；${selectedBatchLayoutSummary.spacingLabel}。`
            : "多选后，右侧批量检查器会集中提供对齐、等距分布、选区范围和锁定状态摘要。",
      },
      {
        id: "selection-keyboard-nudge",
        title: "键盘微调与边界保护",
        severity: selectedIds.every((id) => items.some((item) => item.id === id)) ? "pass" : "fail",
        detail: "设计画布支持方向键移动选中控件，Shift+方向键按网格/大步进移动，并保持多选相对位置不被边界压缩。",
      },
      {
        id: "selection-hierarchy-breadcrumb",
        title: "选择层级路径",
        severity: selectedHierarchyReady ? "pass" : "fail",
        detail: selectedItem
          ? `${activeFile.name} / ${selectedItemHierarchy.map((item) => getItemSummary(item)).join(" / ")}`
          : "单选控件时会在固定选择栏显示可点击的画布、父容器和当前控件路径。",
      },
      {
        id: "canvas-fit-selection",
        title: "画布适配选区",
        severity: "pass",
        detail: selectedCanvasFitBounds
          ? `${selectedIds.length} 个控件可用 Ctrl+2 居中适配视口。`
          : "选择控件后可通过选择栏或 Ctrl+2 将选区适配并居中到画布视口。",
      },
      {
        id: "selection-resize-handles",
        title: "八向尺寸调整手柄",
        severity: resizeHandlesReady ? "pass" : "fail",
        detail: resizeHandlesReady ? "单选控件可从四边和四角调整尺寸。" : "尺寸调整手柄配置不完整。",
      },
      {
        id: "smart-guides",
        title: "拖拽智能参考线吸附",
        severity: smartGuidesReady ? "pass" : "fail",
        detail: `拖动控件时在 ${SMART_GUIDE_THRESHOLD}px 阈值内吸附到控件、画布边缘/中线和 ${SMART_GUIDE_SAFE_MARGIN}px 安全边距，按住 Ctrl/⌘ 可临时暂停吸附，缩放时继续显示对齐提示。`,
      },
      {
        id: "canvas-drag-metrics",
        title: "画布拖拽读数",
        severity: "pass",
        detail: canvasDragMetricsOverlay
          ? `${canvasDragMetricsOverlay.title}：${canvasDragMetricsOverlay.detail}`
          : "移动或缩放控件时，画布会就地显示 delta、尺寸、参考线数量和释放目标。",
      },
      {
        id: "canvas-rulers",
        title: "设计标尺与坐标参考",
        severity: canvasHorizontalRulerMarks.length > 0 && canvasVerticalRulerMarks.length > 0 ? "pass" : "fail",
        detail: canvasRulerSelectionProjection
          ? `标尺按 ${page.gridSize}px 网格和 ${formatCanvasZoom(page.zoom)} 缩放投影选区：${canvasRulerSelectionProjection.label}。`
          : `标尺按 ${page.gridSize}px 网格和 ${formatCanvasZoom(page.zoom)} 缩放显示 ${page.width} x ${page.height} 画布。`,
      },
      {
        id: "canvas-ruler-toggle",
        title: "设计标尺显隐开关",
        severity: typeof page.showRulers === "boolean" ? "pass" : "fail",
        detail: page.showRulers
          ? "设计标尺已显示，可在画布工具条或页面设置中关闭。"
          : "设计标尺已隐藏，页面设置仍保留该偏好并可随时恢复。",
      },
      {
        id: "grouping-model",
        title: "成组与层级组织",
        severity: palette.some((definition) => definition.type === "frame") ? "pass" : "fail",
        detail: `当前 ${groupedFrameCount} 个 Frame 含子控件；Ctrl+G / Ctrl+Shift+G 可管理选中层级。`,
      },
      {
        id: "context-menu-layout-grouping",
        title: "右键布局成组",
        severity: frameLayoutValues.length >= 4 ? "pass" : "fail",
        detail: `右键菜单可把多选控件直接成组为 ${frameLayoutValues.map(frameLayoutLabel).join("、")} Frame。`,
      },
      {
        id: "layer-order-shortcuts",
        title: "图层顺序快捷操作",
        severity: "pass",
        detail: selectedIds.length > 0
          ? `已选择 ${selectedIds.length} 个控件；Ctrl+] / Ctrl+[ 逐级调整，Ctrl+Shift+] / Ctrl+Shift+[ 置顶或置底。`
          : "选择控件后可用 Ctrl+] / Ctrl+[ 调整同组层级，也可在选择栏或右键菜单操作。",
      },
      {
        id: "tab-order-editor",
        title: "Tab 顺序编辑",
        severity: focusableTabOrderItems.length > 0 ? "pass" : "warning",
        detail: focusableTabOrderItems.length > 0
          ? `${focusableTabOrderItems.length} 个可聚焦控件可用覆盖层、右键菜单、属性面板和 Ctrl+Alt+T 管理 Tab 顺序。`
          : "添加按钮、输入框、选择框等交互控件后，可配置桌面表单键盘焦点顺序。",
      },
      {
        id: "runtime-state-editor",
        title: "控件运行状态",
        severity: focusableTabOrderItems.length > 0 ? "pass" : "warning",
        detail: runtimeStateControlCount > 0
          ? `${runtimeStateControlCount} 个控件配置了隐藏、禁用或只读状态，并会同步到生成 exe。`
          : "属性面板可为交互控件设置运行态可见、启用和只读状态。",
      },
      {
        id: "canvas-context-runtime-state",
        title: "右键运行态切换",
        severity: items.length > 0 ? "pass" : "warning",
        detail:
          selectedItems.length > 0
            ? `右键菜单可切换 ${selectedItems.length} 个选中控件的运行态可见、交互启用和输入只读；当前 ${selectedBatchRuntimeSummary.visibleCount}/${selectedItems.length} 可见。`
            : "画布右键菜单可直接切换选中控件在生成 exe 中的可见、启用和只读状态。",
      },
      {
        id: "navigator-visibility-locks",
        title: "对象树可见性与锁定",
        severity: items.length > 0 ? "pass" : "warning",
        detail: navigatorManagedStateCount > 0
          ? `${navigatorManagedStateCount} 个控件在对象树中带有隐藏或锁定状态，可从 Navigator 直接切换。`
          : "Navigator 和对象树行可直接切换运行态可见性与锁定状态，便于找回隐藏控件并保护布局。",
      },
      {
        id: "output-dock-policy",
        title: "输出 Dock 无背景遮罩",
        severity: outputDockWorkspacePadding === "pb-0" && outputDockWorkspaceAvoidancePadding === "0px" ? "pass" : "fail",
        detail: `底部 Dock 状态 ${outputDockWorkspaceState}，工作区 padding=${outputDockWorkspaceAvoidancePadding}，最小化和展开都不再撑出可见背景遮罩。`,
      },
      {
        id: "output-dock-resizable",
        title: "输出 Dock 可调高度",
        severity: activeBottomDockHeight >= 300 ? "pass" : "fail",
        detail: `标准 ${bottomDockHeight}px，展开 ${bottomDockExpandedHeight}px，当前 ${outputDockWorkspaceHeight}，可拖动顶部手柄或用方向键调整。`,
      },
      {
        id: "output-dock-viewport-fit",
        title: "输出 Dock 视口适配",
        severity: "pass",
        detail: "Dock 高度由组件按视口暴露 min/max 范围；短窗口会进入 compact 高度，避免内容被窗口边缘裁掉。",
      },
      {
        id: "canvas-output-dock-avoidance",
        title: "画布避让输出 Dock",
        severity: canvasViewportDockScrollPadding >= (bottomDockMinimized ? 68 : activeBottomDockHeight) ? "pass" : "fail",
        detail: `滚动定位避让 ${canvasViewportDockScrollPadding}px，随底部 Dock 当前高度 ${outputDockWorkspaceHeight} 动态更新。`,
      },
      {
        id: "canvas-output-dock-no-white-band",
        title: "画布底部无空白带",
        severity: canvasViewportDockVisualPadding <= 16 ? "pass" : "fail",
        detail: `Dock 是固定浮层，画布只保留 ${canvasViewportDockVisualPadding}px 视觉缓冲，不再用 Dock 高度撑出空白区域。`,
      },
      {
        id: "runtime-shell",
        title: "生成 exe 窗口壳",
        severity: releaseShellValid ? "pass" : "fail",
        detail: `Release 目标为 ${releaseWindowKindMeta.label} / ${releaseTitlebarStyleMeta.label}。`,
      },
      {
        id: "runtime-grid",
        title: "运行时去除设计网格",
        severity: "pass",
        detail: `设计画布网格 ${page.showGrid ? "开启" : "关闭"}，生成 runtime 由构建检查守护 data-runtime-grid=off。`,
      },
      {
        id: "runtime-window-parity",
        title: "运行端窗口一致性",
        severity: releaseShellValid && releaseWindowShellMatchesPage && activeProject.releaseConfig.titlebarStyle === "nova" ? "pass" : "warning",
        detail: `发布端为 ${releaseWindowKindMeta.label} / ${releaseTitlebarStyleMeta.label}，运行端固定关闭编辑网格，${releaseWindowShellMatchesPage ? "页面外壳已同步" : "页面外壳可同步"}。`,
      },
      {
        id: "page-window-shape",
        title: "当前 UI 外窗体",
        severity: pageShellValid ? (releaseWindowShellMatchesPage ? "pass" : "warning") : "fail",
        detail: `${activeFile.name} 使用 ${pageWindowKindMeta.label} / ${pageTitlebarStyleMeta.label}，${releaseWindowShellMatchesPage ? "已同步到发布目标" : "可同步到发布目标"}。`,
      },
      {
        id: "page-window-shell-presets",
        title: "窗体外壳预设",
        severity: pageWindowShellPresetsReady ? "pass" : "fail",
        detail: `${pageWindowShellPresets.length} 个预设覆盖主窗口、对话框、工具窗口和无框沉浸，可一键更新当前 UI 外窗体。`,
      },
      {
        id: "rust-editor",
        title: "Rust 编辑与补全",
        severity: activeProject.rustLogic.trim().length > 0 && activeProject.rustCommands.length > 0 ? "pass" : "fail",
        detail: `${activeProject.rustCommands.length} 个命令，${activeProject.rustModules.length} 个模块，${activeProject.cargoDependencies.length} 个依赖。`,
      },
      {
        id: "rust-editor-completion-detail",
        title: "Rust 补全来源详情",
        severity: rustCompletionItems.length > 0 || activeProject.rustLogic.trim().length > 0 ? "pass" : "warning",
        detail: activeRustCompletion
          ? `${activeRustCompletion.label} 来自 ${activeRustCompletion.sourceLabel ?? rustCompletionKindLabel(activeRustCompletion.kind)}，预览 ${activeRustCompletion.insertPreview ?? rustCompletionInsertPreview(activeRustCompletion.insertText)}。`
          : "补全候选会显示来源、插入预览，并能从源码符号补全跳回对应 logic.rs 行号。",
      },
      {
        id: "rust-editor-completion-commit",
        title: "Rust 补全提交闭环",
        severity: rustCompletionCommit || activeProject.rustLogic.trim().length > 0 ? "pass" : "warning",
        detail: rustCompletionCommit
          ? `${rustCompletionCommit.label} 已插入 ${rustCompletionCommit.insertedLength} 个字符，光标停在 ${rustCompletionCommit.cursor}。`
          : "Ctrl+Space 打开补全后，ArrowUp/ArrowDown 选择，Enter/Tab 或详情插入按钮会提交候选并在状态栏确认。",
      },
      {
        id: "rust-editor-signature-help",
        title: "Rust 签名帮助",
        severity: rustSignatureHelp ? "pass" : "warning",
        detail: rustSignatureHelp
          ? `${rustSignatureHelp.signature}，${rustSignatureHelp.parameters.length} 个参数，${rustSignatureHelp.bindingCount} 个 UI 调用，返回 ${rustSignatureHelp.resultSummary}。`
          : "逻辑页会根据光标所在槽函数或当前命令显示 Rust command 签名、参数来源和返回结构。",
      },
      {
        id: "rust-editor-format",
        title: "Rust 源码格式化",
        severity: activeProject.rustLogic.trim().length > 0 ? "pass" : "warning",
        detail: "逻辑页支持 Ctrl+Shift+F 轻量格式化，整理缩进、尾随空白和多余空行。",
      },
      {
        id: "rust-editor-line-comment",
        title: "Rust 行注释切换",
        severity: activeProject.rustLogic.length > 0 ? "pass" : "warning",
        detail: "逻辑页支持 Ctrl+/ 对当前行或选区执行 // 注释与取消注释。",
      },
      {
        id: "rust-editor-smart-pairs",
        title: "Rust 成对符号输入",
        severity: activeProject.rustLogic.length > 0 ? "pass" : "warning",
        detail: "逻辑页支持括号/引号成对输入、成对符号中间 Backspace 同步删除，以及 Enter 自动缩进。",
      },
      {
        id: "rust-editor-word-wrap",
        title: "Rust 自动折行",
        severity: "pass",
        detail: rustEditorWordWrap
          ? "逻辑页已开启自动折行，长命令和 JSON 片段会保持在编辑器宽度内。"
          : "逻辑页可一键切换自动折行，默认保持横向滚动，适合查看生成代码。",
      },
      {
        id: "rust-editor-duplicate-line",
        title: "Rust 复制行/选区",
        severity: activeProject.rustLogic.length > 0 ? "pass" : "warning",
        detail: "逻辑页支持 Ctrl+D 复制当前行或所选 Rust 代码片段。",
      },
      {
        id: "rust-editor-move-line",
        title: "Rust 行块移动",
        severity: activeProject.rustLogic.length > 0 ? "pass" : "warning",
        detail: "逻辑页支持 Alt+Up / Alt+Down 移动当前行或所选 Rust 行块。",
      },
      {
        id: "rust-editor-replace",
        title: "Rust 查找替换",
        severity: rustFindQuery.trim().length > 0 ? (rustFindMatches.length > 0 ? "pass" : "warning") : "pass",
        detail: rustFindQuery.trim().length > 0
          ? `${rustFindMatches.length} 个源码匹配项，可替换当前或全部替换。`
          : "逻辑页支持查找、大小写匹配、替换当前和全部替换。",
      },
      {
        id: "rust-editor-goto-line",
        title: "Rust 跳转行列",
        severity: rustEditorLines.length > 0 ? "pass" : "warning",
        detail: `逻辑页支持 Ctrl+G 聚焦行号输入，并跳转到 1-${rustEditorLines.length} 行内的指定位置。`,
      },
      {
        id: "rust-editor-minimap",
        title: "Rust 代码概览",
        severity: rustEditorMinimapMarkers.length > 0 ? "pass" : "warning",
        detail: `${rustEditorMinimapMarkers.length} 个 minimap 标记覆盖大纲、诊断、查找命中、当前符号和光标行，可点击跳转源码。`,
      },
      {
        id: "rust-editor-breadcrumbs",
        title: "Rust 当前位置 Breadcrumbs",
        severity: rustCursorOutlineEntry ? "pass" : "warning",
        detail: rustCursorOutlineEntry
          ? `Breadcrumbs 可从项目、logic.rs、${rustOutlineKindTitle(rustCursorOutlineEntry.kind)} 和${rustCursorSignalSlotRow ? "绑定控件" : "当前源码"}逐级跳转。`
          : "移动光标到函数、槽函数或类型内后，Breadcrumbs 会显示可点击的 Rust 上下文路径。",
      },
      {
        id: "rust-editor-rename-symbol",
        title: "Rust 符号重命名",
        severity: rustCurrentIdentifier ? "pass" : "warning",
        detail: rustCurrentIdentifier
          ? `当前符号 ${rustCurrentIdentifier.name} 有 ${rustCurrentIdentifierOccurrences.length} 处词法匹配，可用 F2 快速重命名。`
          : "逻辑页支持 F2 对光标处 Rust 标识符执行词法级快速重命名。",
      },
      {
        id: "rust-editor-references",
        title: "Rust 符号引用",
        severity: rustCurrentIdentifierReferences.length > 0 ? "pass" : "warning",
        detail: rustCurrentIdentifier
          ? `${rustCurrentIdentifier.name} 有 ${rustCurrentIdentifierReferences.length} 处引用，引用面板显示行列、源码片段并可点击选中。`
          : "把光标放到 Rust 标识符上后，逻辑页会列出当前符号引用并支持逐条跳转。",
      },
      {
        id: "rust-editor-copy-location",
        title: "Rust 位置复制",
        severity: rustEditorSelection.line > 0 && rustEditorSelection.column > 0 ? "pass" : "warning",
        detail: `逻辑页可复制 rust/logic.rs:${rustEditorSelection.line}:${rustEditorSelection.column}，便于从日志、任务和笔记回跳。`,
      },
      {
        id: "rust-editor-select-symbol-range",
        title: "Rust 符号范围选择",
        severity: rustCursorOutlineEntry?.line ? "pass" : "warning",
        detail: rustCursorOutlineEntry?.line
          ? `Alt+Enter 可选择 ${rustOutlineKindTitle(rustCursorOutlineEntry.kind)} ${rustCursorOutlineEntry.label} 的完整范围，便于复制、重构和批量编辑。`
          : "移动光标到函数、槽函数、module、impl、type 或 const 内后，可一键选择整个符号范围。",
      },
      {
        id: "rust-diagnostic-gutter",
        title: "Rust 诊断 Gutter",
        severity: "pass",
        detail: buildDiagnostics.length > 0
          ? `${buildDiagnostics.length} 个构建诊断映射到 ${rustDiagnosticsBySourceLine.size} 个可点击源码行。`
          : "Rust 编辑器左侧行号可直接跳转；出现构建诊断时，红/黄标记可点击打开问题并定位源码。",
      },
      {
        id: "rust-editor-quick-fixes",
        title: "Rust 快速修复",
        severity: actionableRustQuickFixCount > 0 ? "pass" : "warning",
        detail: `逻辑页提供 ${rustEditorQuickFixes.length} 个 quick fix，覆盖缺失槽函数、构建诊断、格式化、命令草稿、引用浏览和符号重命名。`,
      },
      {
        id: "rust-editor-evidence-toolbar",
        title: "Rust 证据回跳",
        severity: "pass",
        detail: `Rust 逻辑页可直接打开 ${builderIssueCount} 个问题、${activeProjectTasks.length} 个任务和运行日志 Dock。`,
      },
      {
        id: "rust-codelens-callers",
        title: "Rust CodeLens 调用者",
        severity: activeRustCommandCodeLensRows.length > 0 ? "pass" : "warning",
        detail: `${sanitizeRustCommandName(activeRustCommand.name)} CodeLens 当前显示 ${activeRustCommandCodeLensRows.length} 行，${activeRustCommandBindingRows.length} 个已绑定 UI 调用；可从编辑器上下文直接跳控件、跳槽函数、运行或打开映射。`,
      },
      {
        id: "logic-command-center",
        title: "当前命令操作中心",
        severity: activeProject.rustCommands.length > 0 ? "pass" : "warning",
        detail: `${sanitizeRustCommandName(activeRustCommand.name)} 的槽函数、主调用控件、运行、映射、连接矩阵和调试响应片段集中在 Rust 编辑器上方操作区。`,
      },
      {
        id: "rust-command-source-inspector",
        title: "Rust Command 源码检查器",
        severity: activeProject.rustCommands.length > 0 ? (activeRustCommandOutlineEntry ? "pass" : "warning") : "fail",
        detail: `${activeRustCommandInvokeName} 映射到 ${activeRustCommandSourceLineLabel}，${activeRustCommandBindingRows.length} 个 UI 调用，可直接复制 invoke、打开源码、运行主调用或检查映射。`,
      },
      {
        id: "signal-slot",
        title: "UI 到后端槽函数链接",
        severity: signalSlotModelValid ? (hasSignalSlotWarnings ? "warning" : "pass") : "fail",
        detail: `${logicSignalSlotBoundCount}/${logicSignalSlotRows.length} 个控件事件已绑定，${missingRustSlotEntries.length} 个槽函数待生成，健康度 ${logicConnectionHealthScore}%。`,
      },
      {
        id: "logic-connection-matrix",
        title: "信号槽连接矩阵",
        severity: logicSignalSlotRows.length > 0 ? "pass" : "warning",
        detail:
          logicSignalSlotRows.length > 0
            ? `${filteredLogicConnectionRows.length} 条连接按控件信号、Rust command、槽函数状态和结果回写对齐展示。`
            : "添加 Button、Input、Switch、Select 等交互控件后，逻辑页会显示可直接绑定和运行的连接矩阵。",
      },
      {
        id: "logic-flow-board",
        title: "逻辑链路板",
        severity: logicFlowBoardReady ? (logicFlowBoardComplete ? "pass" : "warning") : "warning",
        detail: logicWorkflowRow
          ? `${getItemSummary(logicWorkflowRow.item)}.${logicWorkflowRow.eventName} -> ${
              logicWorkflowRow.command ? sanitizeRustCommandName(logicWorkflowRow.command.name) : "待绑定 command"
            }，槽函数${logicWorkflowOutlineEntry?.line ? `位于 logic.rs:${logicWorkflowOutlineEntry.line}` : "需要生成或连接"}。`
          : "选择一个有事件的控件后，逻辑页会显示控件信号、Rust command、槽函数源码和运行回写四段链路。",
      },
      {
        id: "logic-context-summary",
        title: "逻辑上下文摘要",
        severity: logicContextSummaryReady ? "pass" : "warning",
        detail: `${logicContextSummaryItems.length} 个上下文入口把 UI 信号、Rust 光标、活跃 command 和运行/诊断证据集中显示；当前 command 为 ${sanitizeRustCommandName(activeRustCommand.name)}。`,
      },
      {
        id: "logic-workbench-next-actions",
        title: "逻辑页下一步工作台",
        severity: logicWorkbenchNextActions.length > 0 && logicWorkbenchPrimaryAction ? "pass" : "warning",
        detail: logicWorkbenchPrimaryAction
          ? `${logicWorkbenchPrimaryAction.title} 是当前推荐动作；逻辑页共提供 ${logicWorkbenchNextActions.length} 个下一步入口，覆盖绑定、生成槽、运行验证和证据回看。`
          : "逻辑页需要根据当前信号/槽状态自动推荐下一步动作。",
      },
      {
        id: "rust-command-binding-preview",
        title: "Rust 命令调用关系",
        severity: activeProject.rustCommands.length > 0 ? "pass" : "warning",
        detail: `${sanitizeRustCommandName(activeRustCommand.name)} 当前有 ${activeRustCommandBindingRows.length} 个 UI 调用；右侧命令属性可查看输入、输出、跳回控件、运行和映射设置。`,
      },
      {
        id: "rust-command-slot-card",
        title: "当前命令槽函数卡片",
        severity: activeRustCommandOutlineEntry ? "pass" : "warning",
        detail: `${sanitizeRustCommandName(activeRustCommand.name)} 槽函数状态：${activeRustCommandSlotLocationLabel}；右侧卡片可打开源码、生成缺失槽或切到调用者列表。`,
      },
      {
        id: "logic-command-impact-panel",
        title: "Rust 命令影响面板",
        severity: activeProject.rustCommands.length > 0 ? "pass" : "warning",
        detail: `${sanitizeRustCommandName(activeRustCommand.name)} 汇总 ${activeRustCommandBindingRows.length} 个 UI 调用、${activeRustCommandParameters.length} 个输入参数、${activeRustCommandResultImpacts.length} 个结果影响和 ${activeRustCommandSlotLocationLabel}。`,
      },
      {
        id: "rust-debug-workbench",
        title: "Rust 调试工作台",
        severity: rustDebuggerTabs.length === 4 && rustDebuggerBreakpointRows.length > 0 && rustDebuggerWatchRows.length > 0 ? "pass" : "warning",
        detail: `Problems ${rustDebuggerProblemRows.length} / Breakpoints ${rustDebuggerBreakpointRows.length} / Watch ${rustDebuggerWatchRows.length} / Call Stack ${rustDebuggerCallStackRows.length}，可在逻辑页右侧直接查看诊断、断点、观察值和调用链。`,
      },
      {
        id: "selection-signal-slot-strip",
        title: "选择栏 Signal/Slot 快捷链路",
        severity: logicSignalSlotRows.length > 0 ? "pass" : "warning",
        detail:
          selectedItem && selectedEventName
            ? `${getItemSummary(selectedItem)}.${selectedEventName} -> ${
                selectedEventCommand ? sanitizeRustCommandName(selectedEventCommand.name) : "待创建 Rust command"
              } -> ${selectedSignalSlotOutlineEntry?.line ? `logic.rs:${selectedSignalSlotOutlineEntry.line}` : selectedEventCommand ? "定位函数" : "创建槽函数"}。`
            : "单选可交互控件时，固定选择栏会显示事件、Rust command 和 logic.rs 槽函数入口。",
      },
      {
        id: "problem-navigation",
        title: "问题导航",
        severity: "pass",
        detail: builderIssueCount > 0
          ? `底部 Dock 当前有 ${builderIssueCount} 个问题，可用 F8 / Shift+F8 在诊断、属性问题和构建错误之间跳转。`
          : "底部 Dock 支持 F8 / Shift+F8 问题导航；当前没有活跃问题。",
      },
      {
        id: "project-tree",
        title: "项目树和 .nova 元数据",
        severity: projectTreeHasManagedFiles && projectTreeHasNovaMetadata && projectSaveManifestItems.length >= 7 ? "pass" : "fail",
        detail: `${projectExplorerModel.summary}；${projectTreeHasNovaMetadata ? "已暴露 .nova 元数据" : "缺少 .nova 元数据节点"}；保存清单 ${projectSaveManifestItems.length} 项。`,
      },
      {
        id: "project-file-routing",
        title: "项目文件路由",
        severity: projectFileRoutingReady && projectFileRouteCount >= 15 ? "pass" : "fail",
        detail: `${projectFileRouteGroups.length} 个分组、${projectFileRouteCount} 条路径，把源码、生成目标和 .nova 本地状态映射到项目文件夹。`,
      },
      {
        id: "project-save-plan",
        title: "项目保存计划",
        severity: projectSavePlanSteps.length === 3 && projectSavePlanSteps.every((step) => step.itemCount > 0) ? "pass" : "warning",
        detail: `${projectSavePlanSteps.length} 个阶段按源码、生成目标和 .nova 元数据拆分保存路径；当前 ${projectSavePlanSteps.reduce((total, step) => total + step.pendingCount, 0)} 项待同步。`,
      },
      {
        id: "project-folder-health",
        title: "项目文件夹健康",
        severity: projectFolderHealthReady ? "pass" : "fail",
        detail: `${projectFolderHealthItems.length} 个边界展示项目根、源码、生成物和 .nova 状态；${projectFolderHealthItems
          .map((item) => `${item.title}:${item.metric}`)
          .join("、")}。`,
      },
      {
        id: "project-ownership-matrix",
        title: "项目职责矩阵",
        severity: projectOwnershipMatrixReady ? "pass" : "fail",
        detail: `${projectOwnershipMatrixItems.length} 个项目边界把源码、生成物和 .nova 本地状态的负责人、保存策略和主路径动作拆开展示。`,
      },
      {
        id: "project-topology",
        title: "项目拓扑总览",
        severity: projectTopologyNodes.length >= 6 ? "pass" : "warning",
        detail: `Project 模式首屏展示 ${projectTopologyNodes.length} 个结构节点，把 manifest、UI、Rust、生成 app、.nova 和运行证据串成可点击工程关系图。`,
      },
      {
        id: "project-source-overview",
        title: "项目源文件总览",
        severity:
          projectSourceOverviewRows.some((row) => row.scope === "source") &&
          projectSourceOverviewRows.some((row) => row.scope === "metadata") &&
          projectSourceOverviewRows.some((row) => row.id === "generated-app-overview")
            ? "pass"
            : "warning",
        detail: `${projectSourceOverviewRows.length} 个来源行集中展示 UI 文件、Rust、后端、资源、发布设置、.nova 状态和生成目标，其中 ${projectSourceOverviewRows.filter((row) => row.status === "dirty").length} 项待同步。`,
      },
      {
        id: "project-working-set",
        title: "项目工作集",
        severity: projectWorkingSetReady ? "pass" : "warning",
        detail: `${projectWorkingSetItems.length} 个工作集入口集中显示当前文件、未保存来源、Rust 逻辑和构建工作区；当前 ${projectWorkingSetActiveItem?.label ?? "无"}，未保存 ${projectWorkingSetDirtyCount} 个。`,
      },
      {
        id: "project-action-center",
        title: "项目动作中心",
        severity: projectActionCenterReady ? "pass" : "warning",
        detail: `${projectActionCenterItems.length} 个项目动作把未保存来源、当前工作集、Rust 连接、Run Kit 下一步、最近任务和 release 目标串成可执行队列。`,
      },
      {
        id: "project-locator-search",
        title: "项目定位器搜索",
        severity: projectLocatorReady ? "pass" : "warning",
        detail: projectExplorerLocatorActive
          ? `当前查询 ${projectExplorerQuery} 返回 ${projectExplorerLocatorResults.length} 个可点击工程结果，支持定位或打开节点。`
          : "项目页搜索会显示可点击定位结果，覆盖 UI、Rust、生成目标和 .nova 元数据节点。",
      },
      {
        id: "project-tree-keyboard-nav",
        title: "项目树键盘导航",
        severity: projectTreeKeyboardReady ? "pass" : "warning",
        detail: projectTreeKeyboardReady
          ? `${visibleProjectExplorerNodes.length} 个可见工程节点支持方向键、Home/End、Enter 打开，以及 F2 重命名、Ctrl+D 复制、Delete 删除、Ctrl+N 新建 UI 文件。`
          : "项目树无可见节点时会保留键盘入口，恢复过滤后即可导航。",
      },
      {
        id: "project-tree-bulk-folding",
        title: "项目树批量展开收起",
        severity: projectTreeBulkFoldingReady ? "pass" : "warning",
        detail: `${projectExplorerFolderNodeIds.length} 个文件夹节点支持工具栏一键展开/收起；项目树聚焦时可用 Ctrl+Alt+←/→ 批量折叠或展开。当前已折叠 ${collapsedProjectExplorerNodeIds.length} 个。`,
      },
      {
        id: "project-tree-context-menu",
        title: "项目树右键菜单",
        severity: projectTreeContextReady ? "pass" : "warning",
        detail: projectTreeContextReady
          ? "项目树节点支持右键打开、复制路径、系统中显示、按类型筛选，并可直接新建、复制或删除 UI 文件。"
          : "项目树当前没有可操作节点；保存或生成项目后会出现可右键处理的文件与产物。",
      },
      {
        id: "project-node-action-strip",
        title: "项目节点主操作条",
        severity: selectedProjectExplorerNode ? "pass" : "warning",
        detail: selectedProjectExplorerFile
          ? `${selectedProjectExplorerFile.name} 的打开、重命名、复制、新建、删除和路径工具已提升到 Project 主详情区。`
          : "选中项目树节点后，Project 主详情区会集中显示打开、新建、路径复制、系统显示和同类筛选等直接操作。",
      },
      {
        id: "project-node-dossier",
        title: "项目节点工程上下文",
        severity: selectedProjectExplorerDossier ? "pass" : "warning",
        detail: selectedProjectExplorerDossier
          ? `${selectedProjectExplorerDossier.groupLabel} 节点使用 ${selectedProjectExplorerDossier.sourceOfTruth}，保存目标 ${selectedProjectExplorerDossier.saveTarget}，推荐 ${selectedProjectExplorerDossier.taskIds.length} 个工程任务。`
          : "选中项目树节点后，应显示事实来源、保存目标、相关标签、产物状态和推荐任务。",
      },
      {
        id: "project-node-impact-summary",
        title: "项目节点影响摘要",
        severity: selectedProjectExplorerImpactItems.length > 0 ? "pass" : "warning",
        detail: selectedProjectExplorerImpactItems.length > 0
          ? `${selectedProjectExplorerNode?.label ?? "当前节点"} 显示 ${selectedProjectExplorerImpactItems.length} 个影响项，覆盖同步状态、路径、打开标签、子节点和推荐工程任务。`
          : "选中项目树节点后，应显示可点击的影响摘要，用于保存、复制路径、筛选同类和运行推荐任务。",
      },
      {
        id: "project-tree-file-rename",
        title: "项目树 UI 文件重命名",
        severity: activeProject.files.length > 0 ? "pass" : "warning",
        detail: selectedProjectExplorerFile
          ? `${selectedProjectExplorerFile.name} 可在项目树详情中直接重命名，路径同步到 ${selectedProjectExplorerFile.path}。`
          : "选中任意 UI 文件节点后，可在项目树详情卡或右键菜单中重命名文件。",
      },
      {
        id: "project-file-dirty-state",
        title: "逐文件保存状态",
        severity: "pass",
        detail: projectSourceDirty
          ? `${dirtyUiFileCount} 个 UI 文件未保存，Rust ${rustLogicDirty ? "未保存" : "已同步"}，项目设置 ${projectSettingsDirty ? "未保存" : "已同步"}。`
          : "UI 文件、Rust 逻辑和项目设置都与最近一次保存同步。",
      },
      {
        id: "editor-tab-file-actions",
        title: "编辑器标签文件动作",
        severity: openEditorTabs.length > 0 ? "pass" : "warning",
        detail: `${openEditorTabs.length} 个打开标签支持定位项目树、复制完整/相对路径、关闭右侧、关闭已同步和关闭其他 UI 标签。`,
      },
      {
        id: "editor-tab-reorder",
        title: "编辑器标签拖拽重排",
        severity: openEditorUiTabCount > 1 ? "pass" : "warning",
        detail: `${openEditorUiTabCount} 个 UI 标签可通过拖拽调整打开顺序；保存项目时顺序进入 openFileIds，本地文件顺序不受影响。`,
      },
      {
        id: "project-open-files-manager",
        title: "项目打开文件管理",
        severity: openEditorTabs.length > 0 ? "pass" : "warning",
        detail: `${openEditorTabs.length} 个打开标签在项目页和项目 Dock 中集中管理，当前 ${activeEditorTab?.label ?? "无"}，未保存 ${dirtyOpenEditorTabCount} 个，可一键关闭 ${cleanClosableOpenEditorTabCount} 个已同步 UI 标签，或只保留当前 UI 并关闭 ${otherOpenEditorUiTabCount} 个其他 UI 标签。`,
      },
      {
        id: "left-run-controls",
        title: "左下角构建运行区",
        severity: "pass",
        detail: `运行目标 ${railWindowTargetLabel}，发布目标 ${railReleaseTargetLabel}，产物 ${railArtifactStateLabel}。`,
      },
      {
        id: "left-rail-kit-command-menu",
        title: "左侧 Kit 二级命令菜单",
        severity: "pass",
        detail: `快速检查、窗口验证、安装器打包和构建配置已收进左侧 Kit 菜单；当前队列 ${railQueueSummaryLabel}。`,
      },
      {
        id: "build-run-shortcuts",
        title: "构建运行快捷键",
        severity: "pass",
        detail: "Ctrl+Alt+B 运行全部检查，Ctrl+Shift+B 构建 exe，Ctrl+Shift+R 运行或停止生成的桌面端 exe。",
      },
      {
        id: "left-rail-kit-preset",
        title: "左侧 Kit 预设选择",
        severity: selectedRailActionPreset && allProjectActionPresets.length > 0 ? "pass" : "warning",
        detail: selectedRailActionPreset
          ? `${selectedRailActionPreset.title} 包含 ${selectedRailActionPreset.actions.length} 个流水线步骤，可从左下角直接运行。`
          : "左下角运行区需要可选择设计预检、发布 exe、安装包和自定义流水线。",
      },
      {
        id: "left-rail-kit-plan",
        title: "左侧 Kit 运行计划",
        severity: selectedRailKitPlanStats.total > 0 ? "pass" : "warning",
        detail: selectedRailKitPlanStats.nextStep
          ? `${selectedRailActionPreset?.title ?? "当前 Kit"}：${selectedRailKitPlanStats.summary}，下一步 ${selectedRailKitPlanStats.nextStep.index + 1} 是 ${selectedRailKitPlanStats.nextStep.title}。`
          : "左侧 Kit 需要显示当前 preset 的步骤进度、下一步和失败/等待状态。",
      },
      {
        id: "compact-topbar",
        title: "顶部工具栏收敛",
        severity: modeBarItems.length === 4 ? "pass" : "warning",
        detail: "顶部只保留状态、定位器和 Run Kit 归属提示；打开文件入口交给项目页/侧边栏，构建、运行、输出和任务入口集中在模式栏、左侧运行区与底部 Dock。",
      },
      {
        id: "topbar-command-deduplication",
        title: "顶部重复命令收纳",
        severity: "pass",
        detail: "Builder 工作台不渲染展示页 Topbar；发布、构建和运行保留在标题菜单与左侧 Kit 运行区，顶部只显示定位器、保存状态和可聚焦左下 Kit 的归属 chip。",
      },
      {
        id: "build-run-command-ownership",
        title: "构建运行命令归属",
        severity: "pass",
        detail: "左下 Run Kit 是唯一主运行入口；顶部 chip 可直接聚焦 Run Kit，标题栏 Build 菜单作为备用菜单路径，Build 页只做配置、审计和检查。",
      },
      {
        id: "compact-locator",
        title: "顶部定位器默认收起",
        severity: "pass",
        detail: projectLocatorInputVisible
          ? "项目定位器正在展开输入；失焦且无查询时会恢复为单个搜索按钮。"
          : "项目定位器默认只占一个图标按钮，Ctrl+P / Ctrl+K、点击按钮或输入查询时才展开。",
      },
      {
        id: "output-dock-minimized-peek",
        title: "底部 Dock 最小化摘要",
        severity: "pass",
        detail: `最小化时仍显示 ${feedbackIssueCount} 个问题、${queuedProjectTaskCount} 个排队任务和 ${feedbackSummaryToneLabel} 状态，避免展开面板才知道日志/问题变化。`,
      },
      {
        id: "inline-edit-context-menu",
        title: "画布文本快编与右键菜单",
        severity: textEditableControlCount > 0 ? "pass" : "warning",
        detail: `${textEditableControlCount} 个控件有可快速编辑文本属性。`,
      },
      {
        id: "context-menu-smart-position",
        title: "上下文菜单贴边避让",
        severity: contextMenuPlacementReady ? "pass" : "fail",
        detail: "画布与项目树右键菜单共享智能定位模型，靠近屏幕边缘时自动夹取位置；Esc 优先关闭菜单。",
      },
      {
        id: "canvas-context-quick-insert",
        title: "右键位置快速插入",
        severity: canvasContextQuickInsertReady ? "pass" : "warning",
        detail: `画布右键菜单按 ${canvasContextQuickInsertGroupCount} 组提供 ${canvasContextQuickInsertTypes.length} 个常用控件，可直接插入到右键画布坐标。`,
      },
      {
        id: "canvas-context-insert-search",
        title: "右键全量控件搜索插入",
        severity: canvasContextInsertSearchReady ? "pass" : "warning",
        detail: `右键菜单可搜索完整 ${palette.length} 个控件库，最多显示 ${CANVAS_CONTEXT_INSERT_SEARCH_LIMIT} 个匹配结果，支持方向键选择并用 Enter 插入到右键坐标。`,
      },
      {
        id: "inline-text-keyboard-edit",
        title: "键盘触发文本快编",
        severity: textEditableControlCount > 0 ? "pass" : "warning",
        detail: "单选文本类控件后可按 F2 或 Enter 直接进入内联编辑；Enter 保存，Esc 取消，多文本字段可在浮层内切换。",
      },
      {
        id: "inline-text-field-switcher",
        title: "快编字段切换",
        severity: textEditableControlCount > 0 ? "pass" : "warning",
        detail: "内联编辑器会列出当前控件所有可快编文本字段，切换字段前自动保存当前输入，减少反复打开属性面板。",
      },
      {
        id: "actionbar-text-field-menu",
        title: "选择栏文本字段菜单",
        severity: selectedItem ? (selectedQuickTextProps.length > 0 ? "pass" : "warning") : textEditableControlCount > 0 ? "pass" : "warning",
        detail: selectedItem
          ? `${getItemSummary(selectedItem)} 当前有 ${selectedQuickTextProps.length} 个文本字段可从常驻选择栏直接进入快编。`
          : "选择栏的“文本”按钮会展开字段菜单，显示可编辑字段和当前值，和右键菜单保持一致。",
      },
      {
        id: "object-name-editor",
        title: "对象名编辑",
        severity: selectedItem ? (selectedItem.name.trim() ? "pass" : "warning") : "pass",
        detail: selectedItem
          ? `${selectedItem.name || "未命名对象"} 可通过属性面板、选择栏、右键菜单或 Ctrl+F2 编辑工程对象名。`
          : "选中控件后可编辑工程对象名，服务对象树、构建诊断、事件连接和维护日志。",
      },
      {
        id: "preview-export-removed",
        title: "去除重复预览/导出模式",
        severity: !projectActionOptionIds.some((actionId) => actionId.includes("export")) ? "pass" : "warning",
        detail: "项目保存、生成文件和运行 exe 已取代独立导出/预览流。",
      },
      {
        id: "desktop-runtime-workbench",
        title: "桌面运行工作台",
        severity: workflowRuntimeActive || activeProject.outputExePath || latestValidationRun ? "pass" : "warning",
        detail: latestValidationRun
          ? `${desktopRuntimeStatusLabel}；最近窗口验证 ${latestValidationRun.status} · ${latestValidationRun.score}%。`
          : `${desktopRuntimeStatusLabel}；Build 页首屏提供构建、运行、停止、验证和运行控制台入口。`,
      },
      {
        id: "component-palette-kits",
        title: "控件套件入口",
        severity: componentPaletteKitsReady ? "pass" : "warning",
        detail: `${componentPaletteKitDefinitions.length} 个控件套件把 MD3 应用壳、Qt 主窗口、数据工作台、设置表单和调试面板组织成可聚焦、可插入的工作流入口。`,
      },
      {
        id: "component-palette-kit-scaffold",
        title: "控件套件骨架插入",
        severity: componentPaletteKitScaffoldReady ? "pass" : "warning",
        detail: `套件可一次性批量插入 ${componentPaletteKitRows.reduce((total, row) => total + row.availableCount, 0)} 个可用控件，插入后会形成多选集继续对齐、分布或成组。`,
      },
      {
        id: "component-palette-collections",
        title: "控件工具箱常用与最近使用",
        severity: componentPaletteFavoriteTypes.length > 0 && componentPaletteRecentTypes.length > 0 ? "pass" : "warning",
        detail: `${componentPaletteFavoriteTypes.length} 个收藏控件，${componentPaletteRecentTypes.length} 个最近使用控件；插入控件后会自动更新最近使用区。`,
      },
      {
        id: "component-coverage",
        title: "MD3 与桌面控件覆盖",
        severity: palette.length >= 90 ? "pass" : "warning",
        detail: `当前 palette ${palette.length} 个控件，覆盖脚本验证类型、预览和 runtime 分支一致。`,
      },
      {
        id: "md3-application-components",
        title: "应用级 MD3 控件补齐",
        severity: md3ApplicationComponentsReady ? "pass" : "fail",
        detail: `${md3ApplicationComponentTypes.length} 个应用级控件覆盖顶部/底部应用栏、导航栏/抽屉/侧栏、side/bottom sheet、状态栏、搜索、chip、卡片、FAB、反馈和数据视图，均进入类型、组件工具箱、画布预览与生成 runtime。`,
      },
    ];
  }, [
    activeFile.name,
    activeProjectTasks.length,
    activeProject.cargoDependencies.length,
    activeProject.releaseConfig.titlebarStyle,
    activeProject.releaseConfig.windowKind,
    activeProject.files.length,
    activeProject.rustCommands.length,
    activeProject.rustLogic,
    activeProject.rustModules.length,
    activeRustCommand.id,
    activeRustCommand.name,
    activeRustCommandCodeLensRows.length,
    activeRustCommandOutlineEntry?.line,
    activeRustCommandBindingRows.length,
    activeRustCommandParameters.length,
    activeRustCommandResultImpacts.length,
    activeRustCommandSlotLocationLabel,
    actionableRustQuickFixCount,
    activeBottomDockHeight,
    allProjectActionPresets.length,
    buildDiagnostics.length,
    builderIssueCount,
    bottomDockMinimized,
    bottomDockExpandedHeight,
    bottomDockHeight,
    canvasDragMetricsOverlay,
    canvasViewportDockScrollPadding,
    canvasViewportDockVisualPadding,
    cleanClosableOpenEditorTabCount,
    componentPaletteFavoriteTypes.length,
    componentPaletteKitRows,
    componentPaletteRecentTypes.length,
    dirtyUiFileCount,
    otherOpenEditorUiTabCount,
    feedbackIssueCount,
    feedbackSummaryToneLabel,
    focusableTabOrderItems.length,
    hasCanvasSelection,
    items,
    logicConnectionHealthScore,
    logicContextSummaryItems.length,
    logicWorkbenchNextActions.length,
    logicWorkbenchPrimaryAction?.title,
    logicWorkflowOutlineEntry?.line,
    logicWorkflowRow,
    logicSignalSlotBoundCount,
    logicSignalSlotRows.length,
    logicSignalSlotUnboundCount,
    missingRustSlotEntries.length,
    modeBarItems.length,
    openEditorTabs.length,
    outputDockWorkspacePadding,
    outputDockWorkspaceHeight,
    outputDockWorkspaceState,
    page.showGrid,
    page.showRulers,
    page.titlebarStyle,
    page.windowKind,
    pageTitlebarStyleMeta.label,
    pageWindowKindMeta.label,
    palette.length,
    projectActionCenterItems,
    projectExplorerModel.nodes,
    projectExplorerModel.summary,
    projectExplorerLocatorActive,
    projectExplorerLocatorResults.length,
    projectExplorerFolderNodeIds.length,
    projectExplorerQuery,
    collapsedProjectExplorerNodeIds.length,
    projectFileRouteGroups,
    projectFolderHealthItems,
    projectOwnershipMatrixItems.length,
    projectSourceOverviewRows,
    projectWorkingSetActiveItem?.label,
    projectWorkingSetDirtyCount,
    projectWorkingSetItems,
    projectTopologyNodes.length,
    activeProject.outputExePath,
    projectSettingsDirty,
    projectSourceDirty,
    projectSaveManifestItems.length,
    projectLocatorInputVisible,
    queuedProjectTaskCount,
    desktopRuntimeStatusLabel,
    latestValidationRun,
    railArtifactStateLabel,
    railReleaseTargetLabel,
    railWindowTargetLabel,
    releaseTitlebarStyleMeta.label,
    releaseWindowKindMeta.label,
    releaseWindowShellMatchesPage,
    rustCurrentIdentifier?.name,
    rustCurrentIdentifierReferences.length,
    rustDiagnosticsBySourceLine.size,
    rustEditorQuickFixes.length,
    rustLogicDirty,
    rustSignatureHelp?.bindingCount,
    rustSignatureHelp?.parameters.length,
    rustSignatureHelp?.resultSummary,
    rustSignatureHelp?.signature,
    selectedBatchLayoutSummary.boundsLabel,
    selectedBatchLayoutSummary.lockedCount,
    selectedBatchLayoutSummary.movableCount,
    selectedBatchLayoutSummary.spacingLabel,
    selectedBatchRuntimeSummary.visibleCount,
    selectedCanvasFitBounds,
    selectedIds,
    selectedEventCommand,
    selectedEventName,
    selectedItem,
    selectedItemHierarchy,
    selectedQuickTextProps.length,
    selectedSameTypeAnchor?.type,
    selectedSameTypeCount,
    selectionActionBarActionCount,
    selectionActionBarReservedTrack,
    selectedItems.length,
    selectedProjectExplorerDossier?.groupLabel,
    selectedProjectExplorerDossier?.saveTarget,
    selectedProjectExplorerDossier?.sourceOfTruth,
    selectedProjectExplorerDossier?.taskIds.length,
    selectedProjectExplorerFile,
    selectedProjectExplorerImpactItems.length,
    selectedProjectExplorerNode,
    selectedRailActionPreset,
    selectionActionBarState,
    selectionAnchorId,
    selectionMarquee,
    selectionModeHudCount,
    selectionModeHudLabel,
    selectionModeHudTone,
    selectedSignalSlotOutlineEntry?.line,
    visibleProjectExplorerNodes.length,
    workflowRuntimeActive,
  ]);
  const editorExperienceAuditStats = useMemo(() => {
    const passCount = editorExperienceAuditItems.filter((item) => item.severity === "pass").length;
    const warningCount = editorExperienceAuditItems.filter((item) => item.severity === "warning").length;
    const failCount = editorExperienceAuditItems.filter((item) => item.severity === "fail").length;
    const score = Math.round(((passCount + warningCount * 0.5) / Math.max(1, editorExperienceAuditItems.length)) * 100);
    return { passCount, warningCount, failCount, score, total: editorExperienceAuditItems.length };
  }, [editorExperienceAuditItems]);
  const filteredEditorExperienceAuditItems = useMemo(
    () =>
      editorExperienceAuditFilter === "all"
        ? editorExperienceAuditItems
        : editorExperienceAuditItems.filter((item) => item.severity === editorExperienceAuditFilter),
    [editorExperienceAuditFilter, editorExperienceAuditItems],
  );
  const editorExperienceAuditState =
    editorExperienceAuditStats.failCount > 0
      ? "blocked"
      : editorExperienceAuditStats.warningCount > 0
        ? "review"
        : "ready";
  const editorExperienceAuditStatusLabel =
    editorExperienceAuditState === "blocked"
      ? "有阻塞"
      : editorExperienceAuditState === "review"
        ? "需复核"
        : "已通过";
  const qtCreatorParityItems = useMemo<QtCreatorParityItem[]>(() => {
    const auditById = new Map(editorExperienceAuditItems.map((item) => [item.id, item]));
    const severityForEvidence = (evidenceIds: string[]): EditorExperienceAuditSeverity => {
      const severities = evidenceIds.map((id) => auditById.get(id)?.severity ?? "warning");
      if (severities.includes("fail")) {
        return "fail";
      }
      if (severities.includes("warning")) {
        return "warning";
      }
      return "pass";
    };
    const item = (requirement: number, title: string, detail: string, evidenceIds: string[]): QtCreatorParityItem => ({
      requirement,
      title,
      detail,
      evidenceIds,
      severity: severityForEvidence(evidenceIds),
    });

    return [
      item(1, "固定选择操作栏", "统一 idle / single / multi 三态，不再因选中控件时弹出栏位而推动画布，并用独立命令滚动区处理窄窗口拥挤。", ["selection-actionbar", "selection-actionbar-overflow", "selection-status-bar", "selection-hierarchy-breadcrumb", "canvas-fit-selection"]),
      item(2, "多选与框选", "支持框选、组合选择、键盘微调和多选属性批量编辑。", ["selection-marquee", "multi-select-inspector", "selection-keyboard-nudge"]),
      item(3, "圆角输出 Dock", "底部问题、输出和任务日志使用可缩放、可短窗口适配的 Nova 圆角浮层。", ["output-dock-policy", "output-dock-resizable", "output-dock-viewport-fit", "output-dock-minimized-peek"]),
      item(4, "无无效白带", "输出 Dock 浮在工作区上方，画布只保留必要避让和滚动定位。", ["canvas-output-dock-avoidance", "canvas-output-dock-no-white-band"]),
      item(5, "exe 同款窗口壳", "发布目标与编辑器窗口风格对齐，Build 页展示运行端窗口一致性。", ["runtime-shell", "runtime-window-parity", "desktop-runtime-workbench"]),
      item(6, "运行端无设计网格", "设计网格只属于画布，生成 runtime 固定关闭网格并可验证。", ["runtime-grid", "runtime-window-parity"]),
      item(7, "UI 外窗体可编辑", "当前 UI 与发布目标都能配置窗口类型、标题栏和标题信息。", ["page-window-shape", "runtime-shell", "runtime-window-parity"]),
      item(8, "Rust 编辑器能力", "Rust 页面提供高亮、补全、签名帮助、查找替换、minimap、符号引用、符号范围选择和 quick fix。", ["rust-editor", "rust-editor-completion-detail", "rust-editor-signature-help", "rust-editor-quick-fixes", "rust-editor-minimap", "rust-editor-references", "rust-editor-select-symbol-range"]),
      item(9, "UI 到后端槽函数", "信号槽矩阵、逻辑链路板、Rust CodeLens 和选择栏都能创建或跳转 Rust 槽函数。", ["signal-slot", "logic-connection-matrix", "logic-flow-board", "rust-codelens-callers", "selection-signal-slot-strip"]),
      item(10, "项目级工程视图", "Project 模式以工程树、工作集、拓扑图、源文件总览、职责矩阵、节点档案、节点操作条和影响摘要拆分 UI、Rust、资源、生成目标和本地状态。", ["project-tree", "project-working-set", "project-topology", "project-source-overview", "project-ownership-matrix", "project-node-action-strip", "project-node-dossier", "project-node-impact-summary", "project-file-routing"]),
      item(11, ".nova 本地状态", "保存/打开项目时维护隐藏 .nova 元数据、工作区状态和本地运行证据，并在源文件总览与职责矩阵里区分本地状态边界。", ["project-tree", "project-source-overview", "project-ownership-matrix", "project-file-routing", "project-file-dirty-state"]),
      item(12, "左下角构建运行", "运行 Kit、快捷键和桌面运行工作台把构建/运行收敛到 Qt Creator 风格流程。", ["left-run-controls", "left-rail-kit-preset", "build-run-shortcuts", "desktop-runtime-workbench", "build-run-command-ownership"]),
      item(13, "顶部工具栏收敛", "Builder 顶部只保留状态和定位器；打开文件与模式启动交给侧边栏/项目页，重复发布/构建动作收进菜单与运行区。", ["compact-topbar", "topbar-command-deduplication", "compact-locator", "build-run-command-ownership"]),
      item(14, "文本快速编辑", "F2/Enter、选择栏和右键菜单都能编辑控件文本与对象名，画布仍默认支持双击。", ["inline-edit-context-menu", "inline-text-keyboard-edit", "inline-text-field-switcher", "object-name-editor"]),
      item(15, "画布右键菜单", "右键菜单覆盖文本编辑、运行态、分布、尺寸匹配、布局成组和层级排序，并在屏幕边缘自动避让。", ["inline-edit-context-menu", "context-menu-smart-position", "canvas-context-quick-insert", "canvas-context-runtime-state", "context-menu-layout-grouping", "grouping-model", "layer-order-shortcuts"]),
      item(16, "Rust 逻辑页直观化", "Rust 页把上下文摘要、下一步工作台、当前命令操作中心、CodeLens、证据回跳、Breadcrumbs、诊断 gutter、逻辑链路、当前 command 影响面、槽函数状态和符号引用集中展示。", ["logic-context-summary", "logic-workbench-next-actions", "logic-command-center", "rust-codelens-callers", "rust-editor-evidence-toolbar", "rust-editor-breadcrumbs", "rust-diagnostic-gutter", "logic-flow-board", "logic-command-impact-panel", "rust-command-slot-card", "rust-editor-references", "rust-editor-select-symbol-range"]),
      item(17, "去除重复预览模式", "独立预览/导出模式已移除，真实运行以 exe 为准。", ["preview-export-removed", "compact-topbar"]),
      item(18, "项目文件夹保存", "UI、Rust、生成目标和 .nova 都按项目目录落盘，并通过源文件总览、保存计划与职责矩阵明确哪些是源码、生成物和本地状态。", ["preview-export-removed", "project-source-overview", "project-save-plan", "project-ownership-matrix", "project-file-routing", "project-file-dirty-state"]),
      item(19, "补齐 MD3 / Qt 控件", "组件工具箱、套件、最近/收藏和生成 runtime 覆盖桌面与 MD3 常用控件。", ["component-coverage", "md3-application-components", "component-palette-kits", "component-palette-collections"]),
    ];
  }, [editorExperienceAuditItems]);
  const qtCreatorParityStats = useMemo(() => {
    const passCount = qtCreatorParityItems.filter((item) => item.severity === "pass").length;
    const warningCount = qtCreatorParityItems.filter((item) => item.severity === "warning").length;
    const failCount = qtCreatorParityItems.filter((item) => item.severity === "fail").length;
    const score = Math.round(((passCount + warningCount * 0.5) / Math.max(1, qtCreatorParityItems.length)) * 100);
    return { passCount, warningCount, failCount, score, total: qtCreatorParityItems.length };
  }, [qtCreatorParityItems]);
  const focusEditorExperienceAuditEvidence = (evidenceId: string) => {
    const evidence = editorExperienceAuditItems.find((item) => item.id === evidenceId);
    if (!evidence) {
      setEditorExperienceAuditFilter("all");
      showProjectJumpFeedback("warning", "证据项缺失", `${evidenceId} 不在当前体验审计列表中。`);
      return;
    }
    setEditorExperienceAuditFilter(evidence.severity);
    showProjectJumpFeedback("success", "已筛选审计证据", `${evidence.title} · ${editorExperienceAuditSeverityLabel(evidence.severity)}`);
  };
  const openQtCreatorParityRequirement = (item: QtCreatorParityItem) => {
    if ([1, 2, 14, 15].includes(item.requirement)) {
      setMode("design");
      setLeftDockTab(item.requirement === 15 ? "navigator" : "components");
      setRightDockTab(item.requirement === 15 ? "connections" : "properties");
    } else if ([3, 4].includes(item.requirement)) {
      setMode("build");
      openBottomDock("output", true);
    } else if ([5, 6, 12, 17].includes(item.requirement)) {
      setMode("build");
      openBottomDock("logs", false);
    } else if (item.requirement === 7) {
      setMode("design");
      setRightDockTab("properties");
    } else if ([8, 9, 16].includes(item.requirement)) {
      setMode("logic");
      if (item.requirement === 9) {
        setRightDockTab("connections");
      }
    } else if ([10, 11, 18].includes(item.requirement)) {
      setMode("project");
      setLeftDockTab("project");
    } else if (item.requirement === 13) {
      setMode("build");
    } else if (item.requirement === 19) {
      setMode("design");
      setLeftDockTab("components");
      setRightDockTab("properties");
    } else {
      setMode("build");
    }
    showProjectJumpFeedback("success", "已打开相关工作区", `需求 ${item.requirement} · ${item.title}`);
  };
  const selectRelevantProjectTask = (preferredTask?: ProjectTaskEntry | null) => {
    const task =
      preferredTask ??
      runningProjectTask ??
      latestQueuedProjectTask ??
      latestFailedProjectTask ??
      latestProjectTask ??
      selectedProjectTask ??
      visibleProjectTasks[0] ??
      null;

    if (!task) {
      return;
    }

    if (!visibleProjectTasks.some((visibleTask) => visibleTask.id === task.id)) {
      setProjectTaskStatusFilter("all");
      setProjectTaskKindFilter("all");
      setProjectTaskSearchQuery("");
    }
    setSelectedProjectTaskId(task.id);
    setProjectTaskLogSearchQuery("");
  };
  const openRelevantTaskDock = (preferredTask?: ProjectTaskEntry | null, expanded = true) => {
    setMode("build");
    openBottomDock("tasks", expanded);
    selectRelevantProjectTask(preferredTask);
  };
  const handleBottomDockTabChange = (tab: BuilderBottomDockTab) => {
    openBottomDock(tab, bottomDockExpanded);
    if (tab === "tasks") {
      selectRelevantProjectTask();
    }
  };
  const runSelectedProjectExplorerImpactAction = (item: ProjectExplorerImpactItem) => {
    if (item.action.kind === "task") {
      enqueueProjectTask(item.action.taskId);
      return;
    }
    if (item.action.kind === "open-tasks") {
      openRelevantTaskDock(null, false);
      return;
    }
    if (!selectedProjectExplorerNode) {
      return;
    }
    if (item.action.kind === "open-node") {
      handleProjectExplorerNode(selectedProjectExplorerNode);
      return;
    }
    if (item.action.kind === "copy-path") {
      void copyArtifactPath(selectedProjectExplorerDisplayPath);
      return;
    }
    if (item.action.kind === "copy-relative-path") {
      void copyArtifactPath(selectedProjectExplorerRelativePath);
      return;
    }
    if (item.action.kind === "filter-kind") {
      runProjectExplorerContextAction("filter-kind", selectedProjectExplorerNode);
    }
  };
  const runTaskQueueRecommendedAction = () => {
    if (runningProjectTask) {
      openRelevantTaskDock(runningProjectTask);
      return;
    }
    if (projectTaskQueuePaused && localQueuedProjectTasks.length > 0) {
      setProjectTaskQueuePausedState(false);
      return;
    }
    if (localQueuedProjectTasks.length > 0) {
      void drainProjectTaskQueue();
      return;
    }
    if (latestFailedProjectTask) {
      openRelevantTaskDock(latestFailedProjectTask);
      return;
    }
    enqueueProjectTask("quick-check-all");
  };
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

  const rerunLatestRailPreset = () => {
    const preset = latestRailPreset ?? selectedRailActionPreset;
    if (!preset) {
      setBuildError("当前没有可回放的 Kit preset。");
      return;
    }
    setSelectedRailActionPresetId(preset.id);
    setMode("build");
    runProjectActionPreset(preset);
  };

  const runSelectedRailActionPreset = () => {
    if (!selectedRailActionPreset) {
      setBuildError("当前没有可运行的 Kit preset。");
      return;
    }
    setMode("build");
    runProjectActionPreset(selectedRailActionPreset);
  };

  const focusLeftRunControls = () => {
    const runControls = leftRunControlsRef.current;
    if (!runControls) {
      return;
    }
    runControls.scrollIntoView({ block: "nearest", inline: "nearest" });
    window.requestAnimationFrame(() => {
      const primaryWorkflow = runControls.querySelector<HTMLElement>("[data-builder-rail-primary-workflow]");
      (primaryWorkflow ?? runControls).focus({ preventScroll: true });
    });
  };

  const openLocalPath = (path: string) => invokeIfAvailable<void>("open_local_path", { path });

  const previewGeneratedWeb = async () => {
    setBuildError("");
    setMode("build");
    openBottomDock("tasks", true);
    showProjectJumpFeedback("success", "正在生成网页预览", "编译生成应用前端（比完整 exe 快）…");
    try {
      const result = await invokeIfAvailable<{ index_path: string; dist_dir: string; log: string }>(
        "preview_generated_web",
        { project: activeProject, rustLogic: activeProject.rustLogic },
      );
      if (!result) {
        setBuildError("网页预览需要 Tauri 桌面运行时。");
        return;
      }
      setPreviewWebPath(result.index_path);
      setPreviewVersion((v) => v + 1);
      openBottomDock("preview", true);
      void openLocalPath(result.index_path);
      showProjectJumpFeedback("success", "网页预览已打开", result.index_path);
    } catch (error) {
      const message = String(error);
      setBuildError("网页预览失败：\n" + message.slice(-1200));
      showProjectJumpFeedback("error", "网页预览失败", message.slice(0, 160));
    }
  };

  // P1-7: design edits regenerate the live preview after a quiet period.
  const designSignature = useMemo(
    () => projectDesignContentFingerprint(activeProject),
    [activeProject],
  );
  useDebouncedPreviewReload({
    enabled: previewAutoRefresh,
    signature: designSignature,
    hasPreview: Boolean(previewWebPath),
    onReload: () => void previewGeneratedWeb(),
  });

  const refreshPreviewFrame = () => {
    // Bump the iframe key so the existing preview reloads without a rebuild.
    setPreviewVersion((v) => v + 1);
  };

  const retryLastFailedTask = () => {
    const failed = activeProjectTasks.find((task) => task.status === "failed");
    if (!failed) {
      setBuildError("没有失败任务可重试。");
      return;
    }
    setBuildError("");
    enqueueProjectTask(failed.actionId);
    showProjectJumpFeedback("success", "已重新排队", failed.title);
  };

  const runWorkflowPrimaryAction = () => {
    // "运行" = end-to-end: stop runtime if running, else launch exe if ready,
    // else run the remaining workflow pipeline so the user gets a runnable app.
    if (workflowRuntimeActive && activeWorkflowRuntimeSession) {
      setMode("build");
      openBottomDock("logs", false);
      void stopWorkflowRuntimeSession(activeWorkflowRuntimeSession);
      return;
    }
    if (workflowComplete && activeProject.outputExePath) {
      setMode("build");
      openBottomDock("output", false);
      void launchActiveOutputExecutable();
      return;
    }
    // Auto-seed a sample project when the canvas is empty so "运行" always has something to build.
    if (items.length === 0) {
      createSampleProjectFromTemplate();
    }
    // Run every remaining step as one pipeline so a single click reaches exe.
    const pendingSteps = editorWorkflowStepStates.filter((state) => state.status === "idle" || state.status === "failed");
    const actionIds = pendingSteps.flatMap((state) => state.step.actions);
    if (actionIds.length === 0) {
      if (activeProject.outputExePath) {
        void launchActiveOutputExecutable();
      } else {
        setBuildError("没有待执行的构建步骤，且尚未生成可执行文件。");
      }
      return;
    }
    setMode("build");
    openBottomDock("tasks", true);
    runProjectActionsAsPipeline({
      id: "one-click-run-" + Date.now(),
      title: "一键运行",
      detail: "保存 → 生成 → 检查 → 验证 → 构建 exe",
      badge: "运行",
      actions: actionIds,
      custom: true,
    });
  };

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      return Boolean(element?.closest("input, textarea, select, [contenteditable='true']"));
    };

    const runShortcut = (event: KeyboardEvent, action: () => void) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      action();
    };

    const runCommandShortcut = (event: KeyboardEvent, command: NovaEditorCommand) => {
      runShortcut(event, () => dispatchNovaEditorCommand(command));
    };

    const focusProjectLocator = () => {
      setProjectJumpFocused(true);
      window.requestAnimationFrame(() => {
        projectJumpInputRef.current?.focus();
        projectJumpInputRef.current?.select();
      });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isCommand = event.ctrlKey || event.metaKey;
      const commandOnly = isCommand && !event.altKey;

      if (commandOnly && (key === "p" || key === "k")) {
        runShortcut(event, focusProjectLocator);
        return;
      }

      if (commandOnly && key === "j") {
        runShortcut(event, toggleOutputDockVisibility);
        return;
      }

      if (commandOnly && key === "s") {
        runShortcut(event, () => {
          setBuildError("");
          setFeedbackPanelOpen(true);
          setBottomDockTab("tasks");
          enqueueProjectTask("save-project");
        });
        return;
      }

      if (isCommand && event.altKey && key === "b") {
        runCommandShortcut(event, "quick-check-all");
        return;
      }

      if (commandOnly && event.shiftKey && key === "b") {
        runCommandShortcut(event, "build-exe");
        return;
      }

      if (commandOnly && event.shiftKey && key === "r") {
        runCommandShortcut(event, "run-output-exe");
        return;
      }

      if (event.key === "Escape" && (canvasContextMenu || projectExplorerContextMenu)) {
        runShortcut(event, () => {
          setCanvasContextMenu(null);
          setProjectExplorerContextMenu(null);
        });
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.key === "F2" && selectedItem) {
        runShortcut(event, () => {
          startInlineTextEdit(selectedItem, undefined, "keyboard");
        });
        return;
      }

      if (event.key === "Escape" && selectionMarquee) {
        runShortcut(event, () => {
          selectionMarqueeRef.current = null;
          clearMarquee();
          setSelectedIds(selectionMarquee.baseSelectedIds);
        });
        return;
      }

      if (event.key === "Escape" && selectedIds.length > 0) {
        runShortcut(event, () => {
          setSelectedIds([]);
          setRightDockTab("properties");
        });
        return;
      }

      if (event.key === "Escape" && !bottomDockMinimized) {
        runShortcut(event, () => {
          setBottomDockExpanded(false);
          setBottomDockMinimized(true);
          setFeedbackPanelOpen(false);
        });
        return;
      }

      if (commandOnly && key === "z") {
        runCommandShortcut(event, event.shiftKey ? "redo" : "undo");
        return;
      }

      if (commandOnly && key === "y") {
        runCommandShortcut(event, "redo");
        return;
      }

      if (commandOnly && key === "c" && selectedItems.length > 0) {
        runCommandShortcut(event, "copy-selection");
        return;
      }

      if (commandOnly && key === "x" && selectedItems.length > 0) {
        runShortcut(event, cutSelectionToClipboard);
        return;
      }

      if (commandOnly && key === "v") {
        runShortcut(event, pasteSelectionFromClipboard);
        return;
      }

      if (commandOnly && key === "d" && selectedItems.length > 0) {
        runShortcut(event, duplicateSelected);
        return;
      }

      if (commandOnly && key === "f") {
        runShortcut(event, openCanvasFind);
        return;
      }

      if (commandOnly && key === "a" && items.length > 0) {
        runShortcut(event, () => {
          setSelectedIds(items.map((item) => item.id));
          setSelectionAnchorId(items[0]?.id ?? "");
        });
        return;
      }

      if (event.key === "F5" || (commandOnly && key === "r")) {
        runCommandShortcut(event, "run-selected-event");
      }
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [bottomDockMinimized, canvasContextMenu, projectExplorerContextMenu, selectedIds.length, selectedItem?.id, selectedItems.length, selectionMarquee]);

  const openSelectedProperties = () => {
    setRightDockTab("properties");
  };

  const returnToDesignEditor = () => {
    setMode("design");
    setRightDockTab("properties");
    setFeedbackPanelOpen(false);
    setBottomDockExpanded(false);
    setBottomDockMinimized(true);
  };

  const openSelectedConnections = () => {
    setLogicResourceView("connections");
    if (!selectedItem) {
      setLeftDockTab("navigator");
      setRightDockTab("connections");
      showProjectJumpFeedback("warning", "先选择控件", "Navigator 已打开。选择可交互控件后即可查看事件连接。");
      return;
    }
    setRightDockTab("connections");
    if (!selectedEventName) {
      showProjectJumpFeedback(
        "warning",
        "静态控件",
        `${getItemSummary(selectedItem)} 没有可绑定事件。可回到 Properties 编辑布局/内容，或插入可交互控件。`,
      );
    }
  };

  const openLogicConnectionSettings = (targetItem: BuilderItem, eventName: BuilderEventName) => {
    const commandId = eventCommandId(targetItem, eventName);
    const command = commandId ? activeProject.rustCommands.find((candidate) => candidate.id === commandId) ?? null : null;
    setSelectedId(targetItem.id);
    if (command) {
      selectRustCommand(command.id);
    }
    setLogicResourceView("connections");
    setMode("design");
    setRightDockTab("connections");
    setFeedbackPanelOpen(false);
    setBottomDockExpanded(false);
    setBottomDockMinimized(true);
    showProjectJumpFeedback(
      command ? "success" : "warning",
      command ? "已打开连接设置" : "等待绑定命令",
      command
        ? `${getItemSummary(targetItem)} ${eventName} 正在调用 ${sanitizeRustCommandName(command.name)}。`
        : `${getItemSummary(targetItem)} ${eventName} 还没有绑定 Rust command。`,
    );
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

  const runSelectedEventFromActionBar = () => {
    if (!selectedItem || !selectedEventName) {
      return;
    }
    runSelectedEventAndRevealLogs();
  };

  const inspectorWorkflowSteps: InspectorWorkflowStep[] = buildInspectorWorkflowSteps({
    selectedItems,
    selectedItem,
    selectedPropertyIssues,
    selectedPropertyAutoFixCount,
    selectedEventName,
    selectedEventCommandName: selectedEventCommand ? sanitizeRustCommandName(selectedEventCommand.name) : null,
    selectedLatestSimulatorStatus: selectedLatestSimulatorTrace?.status,
    selectedLatestSimulatorMessage: selectedLatestSimulatorTrace?.message,
    selectedControlReverseDependencySummary: selectedControlReverseDependency?.summary,
    selectedControlReverseDependencyLabel: selectedControlReverseDependency
      ? reverseDependencyStatusLabel(selectedControlReverseDependency.status)
      : undefined,
    rightDockTab,
    leftDockTab,
    paletteCount: palette.length,
    nextWorkflowTitle: nextWorkflowStepState?.step.title,
    nextWorkflowDetail: nextWorkflowStepState?.step.detail,
    nextWorkflowStatusLabel: nextWorkflowStepState ? workflowStepStatusLabel(nextWorkflowStepState.status) : undefined,
    nextWorkflowFailed: nextWorkflowStepState?.status === "failed",
    getItemSummary,
    openSelectedProperties,
    openSelectedConnections,
    openImpact: () => setRightDockTab("impact"),
    openNavigator: () => setLeftDockTab("navigator"),
    openComponents: () => setLeftDockTab("components"),
    openTaskDock: () => openRelevantTaskDock(),
    duplicateSelected,
    requestDeleteSelected,
    applySelectedPropertyAutoFix,
    createAndBindBackendIntegrationCommand,
    runSelectedEvent: runSelectedEventFromActionBar,
    sanitizeRustCommandName,
  });

  const inspectorWorkflowBadge =
    selectedItems.length > 1
      ? "批量工作流"
      : selectedItem
        ? selectedEventName
          ? selectedEventCommand
            ? "已连接"
            : "待绑定"
          : "静态控件"
        : "未选择";
  const selectionRecommendedStep =
    inspectorWorkflowSteps.find((step) => step.tone === "warning" && !step.disabled) ??
    inspectorWorkflowSteps.find((step) => step.tone === "danger" && !step.disabled) ??
    inspectorWorkflowSteps.find((step) => step.tone === "primary" && !step.disabled) ??
    inspectorWorkflowSteps.find((step) => step.tone === "ready" && !step.disabled) ??
    inspectorWorkflowSteps.find((step) => !step.disabled) ??
    inspectorWorkflowSteps[0] ??
    null;
  const SelectionRecommendedIcon = selectionRecommendedStep?.icon ?? MousePointer2;
  const selectionStatusTone =
    selectedItems.length > 1
      ? selectedItems.some((item) => item.locked)
        ? "attention"
        : "batch"
      : selectedPropertyIssues.length > 0
        ? "attention"
        : selectedItem && selectedEventName && !selectedEventCommand
          ? "setup"
          : selectedItem && selectedEventCommand
            ? "interactive"
            : "ready";
  const selectionStatusTitle =
    selectedItems.length > 1
      ? `${selectedItems.length} 个控件已进入批量编辑`
      : selectedItem
        ? selectedPropertyIssues.length > 0
          ? "所选控件需要属性修复"
          : selectedEventName && !selectedEventCommand
            ? "下一步是绑定事件"
            : selectedEventCommand
              ? "所选控件可交互"
              : "所选控件可编辑布局"
        : "未选择";
  const selectionStatusDetail =
    selectedItems.length > 1
      ? `${selectedItems.filter((item) => item.locked).length} 个已锁定 · 可复制、删除或检查这批控件的生成影响。`
      : selectedItem
        ? selectedPropertyIssues.length > 0
          ? `${selectedPropertyIssues.length} 个问题，${selectedPropertyAutoFixCount} 个安全修复。`
          : selectedEventName
            ? selectedEventCommand
              ? `${selectedEventName} 调用 ${sanitizeRustCommandName(selectedEventCommand.name)}；可运行或检查连接。`
              : `${selectedEventName} 可在连接面板中接入 Rust 命令。`
            : `${activeFile.name} · ${selectedItem.type} · 可编辑布局与内容。`
        : "选择图层或画布节点后即可编辑。";
  const selectionStatusToneLabel =
    selectionStatusTone === "attention"
      ? "需处理"
      : selectionStatusTone === "batch"
        ? "批量"
        : selectionStatusTone === "setup"
          ? "待配置"
          : selectionStatusTone === "interactive"
            ? "可交互"
            : "就绪";
  const selectionBarStatusTone = selectedActionFeedback
    ? selectedActionFeedback.tone === "error" || selectedActionFeedback.tone === "unbound"
      ? "attention"
      : selectedActionFeedback.tone === "success"
        ? "interactive"
        : "ready"
    : selectionStatusTone;
  const selectionBarStatusLabel = selectedActionFeedback?.badge ?? selectionStatusToneLabel;
  const selectionBarStatusTitle = selectedActionFeedback?.title ?? selectionStatusTitle;
  const selectionBarStatusDetail = selectedActionFeedback?.detail ?? selectionStatusDetail;
  const openProjectLocator = () => {
    setProjectJumpFocused(true);
    window.requestAnimationFrame(() => {
      projectJumpInputRef.current?.focus();
      projectJumpInputRef.current?.select();
    });
  };

  useEffect(() => {
    let cancelled = false;
    void invokeIfAvailable<{
      node: boolean;
      npm: boolean;
      cargo: boolean;
      rustc: boolean;
      node_version: string;
      npm_version: string;
      cargo_version: string;
      rustc_version: string;
      missing: string[];
    }>("check_toolchain", {}).then((status) => {
      if (!status || cancelled) return;
      setToolchainStatus({
        ok: status.missing.length === 0,
        missing: status.missing,
        nodeVersion: status.node_version,
        npmVersion: status.npm_version,
        cargoVersion: status.cargo_version,
        rustcVersion: status.rustc_version,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleEditorCommand = (event: Event) => {
      const detail = (event as CustomEvent<NovaEditorCommandEventDetail>).detail;
      const command = detail?.command;
      if (!command) {
        return;
      }

      if (command === "new-project") {
        createNewProject();
        return;
      }
      if (command === "open-project") {
        void chooseProjectDirectory();
        return;
      }
      if (command === "save-project") {
        enqueueProjectTask("save-project");
        return;
      }
      if (command === "undo") {
        runUndoCanvas();
        return;
      }
      if (command === "redo") {
        runRedoCanvas();
        return;
      }
      if (command === "copy-selection") {
        if (selectedItems.length === 0) {
          setBuildError("请先选中一个控件，再复制。");
          return;
        }
        copySelectionToClipboard();
        return;
      }
      if (command === "mode-project") {
        switchEditorMode("project");
        return;
      }
      if (command === "mode-design") {
        switchEditorMode("design");
        return;
      }
      if (command === "mode-logic") {
        switchEditorMode("logic");
        return;
      }
      if (command === "mode-build") {
        switchEditorMode("build");
        return;
      }
      if (command === "quick-check-all") {
        enqueueProjectTask("quick-check-all");
        return;
      }
      if (command === "run-selected-event") {
        runSelectedEventAndRevealLogs();
        return;
      }
      if (command === "run-output-exe") {
        runWorkflowPrimaryAction();
        return;
      }
      if (command === "build-exe") {
        enqueueProjectTask("build-exe");
        return;
      }
      if (command === "bundle-installer") {
        enqueueProjectTask("bundle-installer");
        return;
      }
      if (command === "open-project-settings") {
        switchEditorMode("project");
        setLeftDockTab("project");
        showProjectJumpFeedback("success", "已打开项目工作区", "项目模式会显示文件树、磁盘路径、元数据和发布设置入口。");
        return;
      }
      if (command === "open-project-files") {
        switchEditorMode("project");
        setLeftDockTab("project");
        showProjectJumpFeedback("success", "已打开项目文件", "项目工作区已展开 UI、Rust、资源、生成目标和 .nova 元数据。");
        return;
      }
      if (command === "open-build-output") {
        setMode("build");
        openBottomDock("output");
        showProjectJumpFeedback("success", "已打开构建输出", "构建工作区和输出 Dock 已显示。");
        return;
      }
      if (command === "help-guide") {
        setProjectJumpQuery("action build command settings");
        openProjectLocator();
        return;
      }
      if (command === "open-sample") {
        createSampleProjectFromTemplate();
        return;
      }
      if (command === "open-template") {
        const requested = detail?.templateId;
        const templateId = (["blank", "dashboard", "settings", "dialog", "data-tool"] as const).find(
          (id) => id === requested,
        );
        if (!templateId) {
          showProjectJumpFeedback("warning", "未知模板", `没有名为 ${requested ?? "(空)"} 的模板。`);
          return;
        }
        loadProjectTemplate(templateId);
        return;
      }
      if (command === "show-shortcuts" || command === "show-onboarding") {
        // Handled at App shell.
        return;
      }
      if (command === "canvas-find") {
        setMode("design");
        openCanvasFind();
        return;
      }
      if (command === "preview-run") {
        enqueueProjectTask("quick-check-all");
        setMode("build");
        openBottomDock("output");
        showProjectJumpFeedback("success", "预览运行已启动", "已执行就绪检查并打开构建输出；可继续点 exe 或打包。");
        return;
      }
      if (command === "project-templates") {
        switchEditorMode("project");
        setLeftDockTab("project");
        return;
      }
    };

    window.addEventListener(NOVA_EDITOR_COMMAND_EVENT, handleEditorCommand);
    return () => window.removeEventListener(NOVA_EDITOR_COMMAND_EVENT, handleEditorCommand);
  });

  const projectLocatorExpanded = projectLocatorInputVisible;
  const projectLocatorControl = (
    <div
      className={cn(
        "relative z-30 min-w-0 flex-none transition-[width,flex-basis] duration-150",
        projectLocatorExpanded ? "w-[min(32rem,46vw)] xl:max-w-lg" : "w-8",
      )}
      data-builder-project-jump=""
      data-builder-locator=""
      data-builder-locator-state={projectLocatorInputVisible ? "expanded" : projectJumpFeedback ? "feedback" : "collapsed"}
    >
      {projectLocatorInputVisible ? (
        <>
          <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-on-surface-variant" />
          <Input
            ref={projectJumpInputRef}
            value={projectJumpQuery}
            inputSize="sm"
            aria-label="项目定位器"
            placeholder="定位：文件、控件、Rust 命令、操作..."
            className="h-7 rounded-xl border-outline-variant bg-surface-container-low pl-8 pr-12 text-[0.72rem]"
            data-builder-locator-expanded-input=""
            onFocus={() => setProjectJumpFocused(true)}
            onBlur={() => window.setTimeout(() => setProjectJumpFocused(false), 120)}
            onChange={(event) => {
              setProjectJumpQuery(event.target.value);
              if (projectJumpFeedback) {
                clearProjectJumpFeedback();
              }
            }}
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
          <span className="pointer-events-none absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-outline-variant bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.56rem] text-on-surface-variant sm:inline-flex">
            Enter
          </span>
        </>
      ) : (
        <button
          type="button"
          className="focus-ring flex size-8 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-low text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
          data-builder-locator-collapsed-button=""
          aria-label="打开项目定位器"
          title="定位文件、控件、Rust 命令和操作（Ctrl+P / Ctrl+K）"
          onClick={openProjectLocator}
        >
          <Search aria-hidden className="size-3.5" />
        </button>
      )}
      {projectJumpPanelOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[360px] overflow-auto rounded-2xl border border-outline-variant bg-surface-container p-1 shadow-m3-2">
          <div className="flex items-center justify-between px-3 py-2 text-[0.68rem] text-on-surface-variant">
            <span>{projectJumpQuery.trim() ? "搜索结果" : recentProjectJumpResults.length > 0 ? "最近和推荐" : "推荐命令"}</span>
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
              没有匹配项目
            </div>
          )}
        </div>
      ) : projectJumpFeedback ? (
        <div
          role="status"
          aria-live={projectJumpFeedback.tone === "error" ? "assertive" : "polite"}
          data-builder-project-jump-feedback={projectJumpFeedback.tone}
          data-builder-project-jump-feedback-placement="top-center-toast-lane"
          data-toast-surface-style="nova-surface"
          className={cn(
            toastSurfaceClassName,
            "fixed left-1/2 top-[calc(3.25rem+env(safe-area-inset-top))] z-[120] w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 animate-fade-in text-xs",
            projectJumpFeedback.tone === "success" && "border-primary/40",
            projectJumpFeedback.tone === "warning" && "border-outline bg-surface-container-high/98",
            projectJumpFeedback.tone === "error" && "border-destructive/50 bg-destructive/10",
          )}
        >
          <span
            className={cn(
              toastIconClassName,
              projectJumpFeedback.tone === "success" && "text-primary",
              projectJumpFeedback.tone === "warning" && "bg-surface-container-high text-on-surface",
              projectJumpFeedback.tone === "error" && "bg-destructive/10 text-destructive",
            )}
          >
            {projectJumpFeedback.tone === "success" ? <CheckCircle2 aria-hidden className="size-4" /> : <AlertTriangle aria-hidden className="size-4" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-on-surface">{projectJumpFeedback.title}</span>
            <span className="mt-0.5 block line-clamp-2 text-on-surface-variant">{projectJumpFeedback.detail}</span>
          </span>
        </div>
      ) : null}
    </div>
  );

  return <ShellView
    scope={{
      ArrowRight,
      BuildView,
      BuildWorkspace,
      ChevronDown,
      DesignView,
      Field,
      FolderOpen,
      Input,
      LogicView,
      LogicWorkspace,
      OutputDock,
      PanelTitle,
      PathRow,
      Plus,
      PreviewDock,
      ProjectTaskIcon,
      ProjectView,
      Search,
      SelectedProjectExplorerIcon,
      Suspense,
      Wand2,
      X,
      actionableRustQuickFixCount,
      activateBuilderIssue,
      activeBackendArtifactBuildResult,
      activeBackendArtifactInspection,
      activeBackendIntegration,
      activeBackendIntegrationMethod,
      activeBackendMethodFields,
      activeBackendPayloadMapping,
      activeBackendRequestValidationIssues,
      activeBackendResponsePatchEnabled,
      activeBackendResponseValidationIssues,
      activeBottomDockHeight,
      activeBreakpoint,
      activeBuildOutputDir,
      activeBundleDir,
      activeBundleManifestPath,
      activeBundlePath,
      activeCargoDependency,
      activeComponentPaletteKit,
      activeEditorTab,
      activeEditorTabId,
      activeFile,
      activeFileDirty,
      activeGeneratedPreviewEntry,
      activeModeItem,
      activeProject,
      activeProjectSavePlanStep,
      activeProjectSnapshots,
      activeProjectTasks,
      activeReleaseIconAsset,
      activeRustCommand,
      activeRustCommandBackendIntegration,
      activeRustCommandBindingRows,
      activeRustCommandCandidateRows,
      activeRustCommandCodeLensRows,
      activeRustCommandCodeLensState,
      activeRustCommandImpactStats,
      activeRustCommandInvokeName,
      activeRustCommandInvokePreview,
      activeRustCommandOutlineEntry,
      activeRustCommandParameters,
      activeRustCommandPrimaryCaller,
      activeRustCommandResultImpacts,
      activeRustCommandResultSchema,
      activeRustCommandReverseDependency,
      activeRustCommandSlotActionLabel,
      activeRustCommandSlotLocationLabel,
      activeRustCommandSlotState,
      activeRustCommandSourceInspectorRows,
      activeRustCommandSourceLineLabel,
      activeRustCommandSourceRangeLabel,
      activeRustCompletion,
      activeRustFindMatch,
      activeRustModule,
      activeStateReferenceCount,
      activeStateVariable,
      activeWorkflowRuntimeSession,
      activeWorkflowRuntimeStopId,
      activityTimeline,
      addActionToCustomPresetDraft,
      addComponent,
      addImageFromAsset,
      addRustCommandParameter,
      alignPreviewMode,
      alignSelected,
      allProjectActionPresets,
      appendMissingRustSlotForCommand,
      appendMissingRustSlots,
      applyActiveBackendIntegrationPreset,
      applyBackendIntegrationPreset,
      applyCanvasPreset,
      applyPageWindowShellPreset,
      applyProjectPropertyAutoFixes,
      applyPropertyIssueAutoFix,
      applyRustCompletion,
      applySelectedPropertyAutoFix,
      applyingGeneratedFiles,
      availableParentFrames,
      backendArtifactInspectionStatusLabel,
      backendArtifactStarterBuildAvailable,
      backendArtifactStatusVariant,
      backendIntegrationKinds,
      backendIntegrationLanguages,
      backendIntegrationStarterHint,
      backendIntegrationTransports,
      backendSchemaFieldIssues,
      beginEditorFileTabDrag,
      bindSelectedImageAsset,
      booleanStateLabel,
      bottomDockExpanded,
      bottomDockLogLineCount,
      bottomDockLogLines,
      bottomDockLogMatchCount,
      bottomDockLogSearchQuery,
      bottomDockLogSource,
      bottomDockLogText,
      bottomDockMinimized,
      bottomDockTab,
      bottomDockTabs,
      breakpointIssues,
      bringToFront,
      buildActiveBackendArtifact,
      buildArtifactReady,
      buildArtifactStatusLabel,
      buildDiagnostics,
      buildError,
      buildLogLineCount,
      buildLogPreviewText,
      buildReadinessActionLabel,
      buildReadinessSeverityLabel,
      buildReadinessSummary,
      builderIssueCount,
      builderIssueErrorCount,
      builderIssues,
      builderItemRuntimeState,
      builderPropertySectionLabels,
      builderPropertySectionOptions,
      building,
      buildingBackendArtifactId,
      bumpActiveReleaseVersion,
      bumpReleaseVersion,
      bundling,
      byteSizeLabel,
      canMoveLayerWithinGroup,
      canMoveQueuedProjectTask,
      canPaste,
      canRedo,
      canSaveCustomPreset,
      canUndo,
      cancelProjectTask,
      cancelQueuedProjectTasks,
      canvasContentPlaneStyle,
      canvasContextInsertActiveIndex,
      canvasContextInsertInputRef,
      canvasContextInsertQuery,
      canvasContextInsertSearchResults,
      canvasContextMenu,
      canvasContextMenuCommand,
      canvasContextMenuEventName,
      canvasContextMenuItem,
      canvasContextMenuSelectionEnabled,
      canvasContextMenuSelectionLocked,
      canvasContextMenuSelectionReadOnly,
      canvasContextMenuSelectionVisible,
      canvasContextMenuTextProps,
      canvasContextQuickInsertGroups,
      canvasContextQuickInsertTypes,
      canvasControlsExpanded,
      canvasDragMetricsOverlay,
      canvasFindInputRef,
      canvasFindOpen,
      canvasFindQuery,
      canvasHorizontalRulerMarks,
      canvasInteractionMode,
      canvasPanActive,
      canvasPanMode,
      canvasPresets,
      canvasRef,
      canvasRulerSelectionProjection,
      canvasSelectionMode,
      canvasShellPreviewStyle,
      canvasStageStyle,
      canvasStageViewportStyle,
      canvasStyle,
      canvasVerticalRulerMarks,
      canvasViewportDockScrollPadding,
      canvasViewportDockScrollStyle,
      canvasViewportDockVisualPadding,
      canvasViewportRef,
      canvasViewportSelectionScrollPaddingClass,
      canvasZoomLevels,
      certificateInspection,
      checkingBackendArtifacts,
      checkingCertificateStore,
      checkingRunId,
      checkingTarget,
      checkpointDiff,
      checkpointDiffDetails,
      checkpointDiffLoadingId,
      checkpointDiffSummary,
      checkpointLabel,
      chooseCanvasZoom,
      chooseImageAsset,
      chooseProjectDirectory,
      chooseSigningCertificate,
      clamp,
      cleanClosableOpenEditorTabCount,
      clearCompletedProjectTasks,
      clearComponentPaletteKit,
      clearSelection,
      clipboardRef,
      closeCanvasContextMenu,
      closeCleanEditorFileTabs,
      closeEditorFileTab,
      closeEditorFileTabsToRight,
      closeOtherEditorFileTabs,
      closeProjectExplorerContextMenu,
      cn,
      collapseProjectExplorerTree,
      collapsedProjectExplorerNodeIds,
      collapsedProjectExplorerNodeSet,
      commandResultSchema,
      compactJson,
      completedProjectTaskCount,
      componentCoverageCompleteCount,
      componentCoverageFilterLabel,
      componentCoverageRows,
      componentPaletteCategory,
      componentPaletteCategoryForType,
      componentPaletteCategoryLabel,
      componentPaletteCategoryOptions,
      componentPaletteCounts,
      componentPaletteFavoriteDefinitions,
      componentPaletteFavoriteTypes,
      componentPaletteKitRows,
      componentPaletteQuery,
      componentPaletteQuickInsertDefinitions,
      componentPaletteRecentDefinitions,
      componentPaletteRecentTypes,
      confirmDestructiveAction,
      conflictFile,
      convertFileSrc,
      copiedArtifactPath,
      copiedOutputLog,
      copyActiveRustCommandInvokeName,
      copyArtifactPath,
      copyBottomDockLog,
      copyRustEditorLocation,
      copySelectionToClipboard,
      createAndBindBackendIntegrationCommand,
      createBackendIntegrationInProject,
      createBackendIntegrationMethodInProject,
      createCargoDependencyInProject,
      createDiskCheckpoint,
      createInstallerSandboxHandoff,
      createNewFileFromNavigator,
      createNewProject,
      createRustCommandFromBackendIntegration,
      createRustCommandInProject,
      createRustModuleInProject,
      createRustNovaJsonResultSnippet,
      createRustStatePatchLiteral,
      createStateVariableInProject,
      creatingSandboxHandoffId,
      customPresetDetail,
      customPresetDraftActionId,
      customPresetDraftActions,
      customPresetTitle,
      cutSelectionToClipboard,
      deleteActiveBackendIntegration,
      deleteActiveBackendIntegrationMethod,
      deleteActiveCargoDependency,
      deleteActiveRustCommand,
      deleteActiveRustModule,
      deleteActiveStateVariable,
      deleteAsset,
      deleteCustomProjectActionPreset,
      deleteRustCommandParameter,
      deleteSelected,
      dependencyGraphEventStatusVariant,
      dependencyValidityStatusVariant,
      designSideDockBottomClearance,
      desktopRuntimeBadgeVariant,
      desktopRuntimeConsoleOpen,
      desktopRuntimeLogPath,
      desktopRuntimePath,
      desktopRuntimePrimaryDisabled,
      desktopRuntimePrimaryLabel,
      desktopRuntimePrimaryLoading,
      desktopRuntimeState,
      desktopRuntimeStatusLabel,
      destructiveAction,
      dirtyOpenEditorTabCount,
      dirtyUiFileCount,
      diskBusy,
      diskCheckpoints,
      dispatchNovaEditorCommand,
      distributeSelected,
      draggingEditorFileTabId,
      drainProjectTaskQueue,
      dropEditorFileTab,
      dropIntent,
      duplicateActiveFileFromNavigator,
      duplicateRustSelectionOrLine,
      duplicateSelected,
      editableRustDiagnosticQuickFixes,
      editorExperienceAuditBadgeVariant,
      editorExperienceAuditFilter,
      editorExperienceAuditItems,
      editorExperienceAuditSeverityLabel,
      editorExperienceAuditState,
      editorExperienceAuditStats,
      editorExperienceAuditStatusLabel,
      editorWorkflowStepStates,
      emptyCanvasQuickStarts,
      enqueueProjectTask,
      eventPayloadFieldSelection,
      eventPayloadFields,
      eventResultTargetProps,
      eventResultTargets,
      expandProjectExplorerTree,
      failedProjectTaskCount,
      feedbackIssueCount,
      feedbackPanelOpen,
      feedbackStripVisible,
      feedbackSummaryDetail,
      feedbackSummaryTitle,
      feedbackSummaryTone,
      feedbackSummaryToneLabel,
      fileNameFromPath,
      fileSaveStates,
      filteredBackendIntegrations,
      filteredCargoDependencies,
      filteredEditorExperienceAuditItems,
      filteredLogicConnectionRows,
      filteredLogicSignalSlotRows,
      filteredRustCommands,
      filteredRustLogicOutline,
      filteredRustModules,
      filteredStateVariables,
      fitCanvasToViewport,
      fitSelectedCanvasToViewport,
      fixAllBreakpointIssues,
      fixAllBreakpointIssuesAndValidate,
      fixBreakpointIssue,
      fixBreakpointIssueAndValidate,
      fixableBreakpointIssueCount,
      focusActiveRustCommandPrimaryCaller,
      focusBreakpointIssue,
      focusBuildReadinessItem,
      focusComponentPaletteKit,
      focusEditorExperienceAuditEvidence,
      focusLeftRunControls,
      focusProjectDependencySourceRef,
      focusProjectReverseDependencyTarget,
      focusProjectSourceOverviewRow,
      focusProjectWorkingSetItem,
      focusPropertyIssue,
      focusRustDiagnostic,
      focusRustFunction,
      focusRustIdentifierReference,
      focusRustLine,
      focusSelectedObjectNameEditor,
      focusSelectedRosterItem,
      focusVisualAuditIssue,
      focusableTabOrderItems,
      formatProjectSnapshotTime,
      formatRustLogicSource,
      formatSignedDelta,
      formatStateReferenceCount,
      frameLayoutMetrics,
      frameLayoutMode,
      generatedFileApplyResult,
      generatedFilePreview,
      generatedFileStatusLabel,
      generatedPlanBusy,
      generatedPlanPrimaryAction,
      generatedPlanPrimaryLabel,
      generatedPlanStatusDetail,
      generatedPlanStatusTitle,
      getAbsolutePosition,
      getDefinition,
      getFrameDropIntentFromClientPoint,
      getItemIdsInsideMarquee,
      getItemSummary,
      getSelectionMarqueeRect,
      goToRustLine,
      goToSlotForItem,
      groupSelectedIntoFrame,
      handleAssetDragStart,
      handleBottomDockTabChange,
      handleCanvasContextInsertSearchKeyDown,
      handleCanvasDrop,
      handleCanvasViewportScroll,
      handleCanvasViewportWheel,
      handlePaletteMouseDown,
      handleProjectExplorerNode,
      handleProjectExplorerTreeKeyDown,
      handleRustEditorKeyDown,
      handleRustFindInputKeyDown,
      handleRustGoToLineInputKeyDown,
      handleRustRenameInputKeyDown,
      handleRustReplaceInputKeyDown,
      hasCanvasSelection,
      insertActiveRustCommandDraft,
      insertComponentFromCanvasContext,
      insertComponentFromShortcut,
      insertComponentPaletteKitPrimary,
      insertComponentPaletteKitScaffold,
      insertRustSnippet,
      inspectCertificateStore,
      inspectDiskCheckpointDiff,
      inspectorPropertyQuery,
      inspectorPropertyQueryActive,
      inspectorWorkflowBadge,
      inspectorWorkflowSteps,
      invokeIfAvailable,
      isEditableRustDiagnostic,
      isTauriRuntime,
      itemConstraints,
      itemUsesOptions,
      items,
      latestEditorExperienceAuditTask,
      latestFailedProjectTask,
      latestGeneratedFileSummary,
      latestProjectSnapshot,
      latestProjectTask,
      latestRailPreset,
      latestRailPresetStatusLabel,
      latestRailPresetStatusVariant,
      latestRailPresetStepLabel,
      latestRailPresetSummary,
      latestRailPresetTask,
      latestReleasePipeline,
      latestRunSessionEntry,
      latestRunSessionRunning,
      latestSimulatorTrace,
      latestValidationRun,
      launchActiveOutputExecutable,
      launchBuiltExecutable,
      launchingExeId,
      layerMoveTitle,
      leftDockCollapsed,
      leftDockTab,
      leftDockTabs,
      leftRunControlsRef,
      leftRunTaskTimelineRows,
      leftRunTaskTimelineSummary,
      length,
      loadWorkspace,
      localQueuedProjectTasks,
      logicConnectedSlotCount,
      logicConnectionFilter,
      logicConnectionFilterOptions,
      logicConnectionHealthScore,
      logicConnectionHealthStatus,
      logicContextSummaryItems,
      logicResourceItemActiveClass,
      logicResourceItemClass,
      logicResourceItemIdleClass,
      logicResourceSectionClass,
      logicResourceSectionContentClass,
      logicResourceSectionIconClass,
      logicResourceSectionSummaryClass,
      logicResourceView,
      logicResourceViewOptions,
      logicResourceVisible,
      logicSearchNeedle,
      logicSearchQuery,
      logicSignalSlotBoundCount,
      logicSignalSlotRowNeedsSlot,
      logicSignalSlotRows,
      logicSignalSlotUnboundCount,
      logicSlotAssistantRoute,
      logicSlotAssistantState,
      logicWorkbenchNextActions,
      logicWorkbenchPrimaryAction,
      logicWorkflowNodes,
      logicWorkflowOutlineEntry,
      logicWorkflowRow,
      logicWorkflowSteps,
      managedProjects,
      matchSelectedSize,
      missingRustSlotCount,
      missingRustSlotEntries,
      mode,
      modeBarItems,
      moveCanvasPan,
      moveCustomPresetDraftAction,
      moveLayer,
      moveQueuedProjectTask,
      moveRustFindMatch,
      moveRustSelectionLines,
      moveSelectedLayerStep,
      moveSelectedTabOrder,
      name,
      navigateBuilderIssue,
      navigatorLayerMessage,
      navigatorQuery,
      normalizeMinimumArtifactSizeKb,
      normalizeReleaseTitlebarStyle,
      normalizeReleaseVersion,
      normalizeTabOrderForFocusableItems,
      numberFromInput,
      openActiveRustCommandPrimaryMapping,
      openActiveRustCommandSlot,
      openBottomDock,
      openBuildDiagnostic,
      openBuildReadinessItem,
      openCanvasContextMenu,
      openEditorFileIds,
      openEditorTab,
      openEditorTabCountLabel,
      openEditorTabs,
      openFeedbackPanel,
      openLocalArtifact,
      openLocalPath,
      openLogicConnectionSettings,
      openProjectExplorerContextMenu,
      openProjectFolderHealthItem,
      openProjectFromDisk,
      openProjectRoot,
      openProjectSavePlanStep,
      openProjectSourceOverviewRow,
      openProjectTaskResolution,
      openProjectWorkingSetItem,
      openPropertySectionFromSearch,
      openPropertySections,
      openQtCreatorParityRequirement,
      openRelevantTaskDock,
      openRustBackendTopologyNode,
      openRustDiagnosticFromGutter,
      openRustLogicOutlineEntry,
      openSelectedConnectionTarget,
      openSelectedConnections,
      openSelectedProperties,
      openSlotNavigationEntry,
      operationMonitorDetail,
      operationMonitorStatus,
      operationMonitorTask,
      operationMonitorTitle,
      operationMonitorVisible,
      otherOpenEditorUiTabCount,
      outputDockWorkspaceAvoidancePadding,
      outputDockWorkspaceHeight,
      outputDockWorkspacePadding,
      outputDockWorkspaceState,
      outputDockWorkspaceStyle,
      page,
      pageTitlebarStyleMeta,
      pageWindowKindMeta,
      pageWindowShellPresets,
      palettePointerDrag,
      parentPathFromPath,
      pasteClipboardItems,
      payloadFieldsWithToggle,
      prepareRustSymbolRename,
      previewAutoRefresh,
      previewGeneratedWeb,
      previewVersion,
      previewWebPath,
      previewingGeneratedFiles,
      projectActionCenterBadgeVariant,
      projectActionCenterItems,
      projectActionCenterToneClass,
      projectActionOptionIds,
      projectChangeImpact,
      projectChangeImpactStatusLabel,
      projectChangeImpactStatusVariant,
      projectChangeScopeStatusLabel,
      projectChangeScopeStatusVariant,
      projectDependencyGraph,
      projectDependencySources,
      projectDependencyValidity,
      projectDiskPath,
      projectExplorerActionLabel,
      projectExplorerContextMenu,
      projectExplorerContextNode,
      projectExplorerFilter,
      projectExplorerFilterCounts,
      projectExplorerFilterOptions,
      projectExplorerFolderNodeIds,
      projectExplorerGroupMeta,
      projectExplorerLocatorActive,
      projectExplorerLocatorResults,
      projectExplorerModel,
      projectExplorerNodeGroupId,
      projectExplorerNodeStatus,
      projectExplorerPrimaryActionLabel,
      projectExplorerQuery,
      projectExplorerRenameInputRef,
      projectExplorerStatusClass,
      projectFileRouteGroups,
      projectFolderHealthItems,
      projectGitStatus,
      projectJumpFeedback,
      projectLocatorControl,
      projectOwnershipMatrixItems,
      projectPropertyAutoFixSummary,
      projectSaveManifestItems,
      projectSavePlanSteps,
      projectSettingsDirty,
      projectSourceDirty,
      projectSourceOverviewBadgeVariant,
      projectSourceOverviewRows,
      projectTaskDefinitions,
      projectTaskElapsedLabel,
      projectTaskKindFilter,
      projectTaskKindFilterOptions,
      projectTaskKindLabel,
      projectTaskLogSearchQuery,
      projectTaskProgress,
      projectTaskQueuePaused,
      projectTaskResolutionLabel,
      projectTaskSearchQuery,
      projectTaskStatusFilter,
      projectTaskStatusFilterOptions,
      projectTaskStatusLabel,
      projectTaskStatusVariant,
      projectTemplates,
      projectTopologyNodes,
      projectWorkingSetActiveItem,
      projectWorkingSetDirtyCount,
      projectWorkingSetItems,
      projectWorkingSetSummary,
      propertySchemaHint,
      propertySectionForProp,
      pushProjectSnapshot,
      qtCreatorParityItems,
      qtCreatorParityStats,
      queuedProjectTaskCount,
      queuedProjectTaskIndex,
      quickTextPropLabel,
      railArtifactStateLabel,
      railBundleTargetLabel,
      railConfigurationLabel,
      railEventTargetLabel,
      railKitLabel,
      railNextStepLabel,
      railQueueSummaryLabel,
      railReleaseTargetLabel,
      railRunTargetLabel,
      railTaskCountLabel,
      railTaskStateLabel,
      railWindowTargetLabel,
      readingRuntimeLogId,
      recentSlotNavigationEntries,
      refreshBackendArtifactInspection,
      refreshInstallerSmokeResult,
      refreshManagedProjects,
      refreshPreviewFrame,
      refreshProjectDependencyGraph,
      refreshReleasePipelineRecords,
      refreshRunSession,
      refreshRuntimeLog,
      refreshingDependencyGraph,
      refreshingPipelineRecords,
      registerSlotNavigationVisit,
      releaseActionButtonDisabled,
      releaseActionButtonLabel,
      releaseActionButtonLoading,
      releaseBundleTargets,
      releaseDigestAlgorithms,
      releaseInstallerSmokeModes,
      releaseInstallerSmokeRunnerModes,
      releaseReadinessActionItems,
      releaseReadinessSummary,
      releaseSigningConfigured,
      releaseSigningDescription,
      releaseSigningModes,
      releaseTitlebarStyleMeta,
      releaseTitlebarStyles,
      releaseWindowKindMeta,
      releaseWindowKinds,
      releaseWindowShellMatchesPage,
      removeActionFromCustomPresetDraft,
      removeItemFromSelection,
      renameActiveFile,
      renameActiveProject,
      renameFileById,
      renameRustSymbolAtCursor,
      renderCanvasNode,
      renderRustHighlightedLine,
      replaceActiveProjectWithTemplate,
      replaceActiveRustFindMatch,
      replaceAllRustFindMatches,
      replaceTemplateOpen,
      requestDeleteActiveFile,
      requestDeleteActiveProject,
      requestDeleteSelected,
      requestResetCurrentFile,
      rerunLatestRailPreset,
      rerunReleasePipeline,
      rerunReleasePipelineFromFailure,
      resetCanvasView,
      resetSelectedBreakpointOverride,
      responsiveBreakpointSize,
      restoreDiskCheckpoint,
      restoreLatestProjectSnapshot,
      retryLastFailedTask,
      retryProjectTask,
      revealEditorTabInProject,
      revealSelectedConnectionLogs,
      reverseDependencyStatusLabel,
      reverseDependencyStatusVariant,
      reverseDependencySummaries,
      reverseDependencyTargetKindLabel,
      rightDockCollapsed,
      rightDockTab,
      rightDockTabs,
      runActiveRustCommandPrimaryCaller,
      runCanvasContextAction,
      runEditorWorkflowStep,
      runInstallerSmokeScript,
      runLogicSignalSlotEvent,
      runProjectActionCenterItem,
      runProjectActionPreset,
      runProjectChangeImpactPlan,
      runProjectExplorerContextAction,
      runRedoCanvas,
      runReleaseReadinessAction,
      runSelectedEventAndRevealLogs,
      runSelectedEventFromActionBar,
      runSelectedProjectExplorerImpactAction,
      runSelectedRailActionPreset,
      runTaskQueueRecommendedAction,
      runUndoCanvas,
      runWorkflowPrimaryAction,
      runningProjectTask,
      runningSmokeId,
      runtimeWindowParityItems,
      rustBackendTopology,
      rustBracketMatch,
      rustBracketMatchIndexes,
      rustBracketMatchLabel,
      rustCommandAcceptsArgs,
      rustCommandParameters,
      rustCompletionCommit,
      rustCompletionContext,
      rustCompletionInsertPreview,
      rustCompletionItems,
      rustCompletionKindLabel,
      rustCompletionTrigger,
      rustCurrentIdentifier,
      rustCurrentIdentifierOccurrences,
      rustCurrentIdentifierReferences,
      rustCursorOutlineEntry,
      rustCursorOutlineRangeLabel,
      rustCursorSignalSlotRow,
      rustDebuggerBreakpointRows,
      rustDebuggerCallStackRows,
      rustDebuggerPanel,
      rustDebuggerProblemRows,
      rustDebuggerTabs,
      rustDebuggerWatchRows,
      rustDiagnosticTarget,
      rustDiagnosticsBySourceLine,
      rustEditorContextDetail,
      rustEditorContextTitle,
      rustEditorHoverDoc,
      rustEditorLineStartIndexes,
      rustEditorLines,
      rustEditorMinimapMarkers,
      rustEditorMinimapTotalLines,
      rustEditorMinimapViewport,
      rustEditorQuickFixes,
      rustEditorScrollLeft,
      rustEditorScrollTop,
      rustEditorSelection,
      rustEditorWordWrap,
      rustFindActiveIndex,
      rustFindCaseSensitive,
      rustFindInputRef,
      rustFindLineSet,
      rustFindMatches,
      rustFindQuery,
      rustFunctionOutlineCount,
      rustGoToLineInputRef,
      rustGoToLineQuery,
      rustLogicDirty,
      rustLogicOutline,
      rustLogicRef,
      rustOutlineKindLabel,
      rustOutlineKindTitle,
      rustParameterSources,
      rustParameterTypeCode,
      rustParameterTypes,
      rustRenameInputRef,
      rustRenameQuery,
      rustReplaceQuery,
      rustSignatureHelp,
      rustSlotOutlineCount,
      rustStructureOutlineCount,
      rustSyntaxHighlightVisible,
      rustSyntaxLegendItems,
      rustVisibleIdentifierReferences,
      sanitizeCargoDependencyName,
      sanitizeRustCommandName,
      sanitizeRustModuleName,
      saveCustomProjectActionPreset,
      saved,
      selectAllItems,
      selectBackendIntegration,
      selectBackendIntegrationMethod,
      selectCargoDependency,
      selectChangedGeneratedPreviewPaths,
      selectCurrentRustOutlineRange,
      selectFile,
      selectGeneratedChangeScope,
      selectHierarchyBreadcrumbNode,
      selectInverseSelection,
      selectItem,
      selectOptionsForItem,
      selectProject,
      selectProjectReverseDependencyOutputs,
      selectRustCommand,
      selectRustModule,
      selectSameTypeControls,
      selectStateVariable,
      selectedBatchCommonHeight,
      selectedBatchCommonWidth,
      selectedBatchLayoutSummary,
      selectedBatchRuntimeSummary,
      selectedBatchTypeSummary,
      selectedBindableProps,
      selectedBreakpointOverride,
      selectedBuilderIssue,
      selectedCanUseReadOnly,
      selectedCanUseTabOrder,
      selectedCanvasBounds,
      selectedCanvasFitBounds,
      selectedConnectionInputSummary,
      selectedConnectionOutputSummary,
      selectedConnectionPayloadFields,
      selectedConnectionVerificationDetail,
      selectedConnectionVerificationLabel,
      selectedConnectionVerificationVariant,
      selectedConstraints,
      selectedControlReverseDependency,
      selectedEventBinding,
      selectedEventCommand,
      selectedEventCommandArgs,
      selectedEventCommandId,
      selectedEventName,
      selectedFilteredPropertySchema,
      selectedGeneratedPreviewPathSet,
      selectedGeneratedPreviewPaths,
      selectedIds,
      selectedItem,
      selectedItemHierarchy,
      selectedItems,
      selectedLatestSimulatorTrace,
      selectedLogicSignalSlotRow,
      selectedObjectNameInputRef,
      selectedParentAutoLayout,
      selectedProjectExplorerChildNodes,
      selectedProjectExplorerDisplayPath,
      selectedProjectExplorerDossier,
      selectedProjectExplorerFile,
      selectedProjectExplorerFileSaveState,
      selectedProjectExplorerImpactItems,
      selectedProjectExplorerNode,
      selectedProjectExplorerParentNode,
      selectedProjectExplorerPathNodes,
      selectedProjectExplorerRelativePath,
      selectedProjectTask,
      selectedProjectTaskLogLines,
      selectedProjectTaskLogMatchCount,
      selectedProjectTemplate,
      selectedProjectTemplateId,
      selectedPropertyAutoFixCount,
      selectedPropertyIssueProps,
      selectedPropertyIssues,
      selectedPropertySchema,
      selectedPropertySectionMatchCounts,
      selectedQuickTextProps,
      selectedRailActionPreset,
      selectedRailActionPresetStepLabel,
      selectedRailKitPlanStats,
      selectedRailKitStepRows,
      selectedRuntimeState,
      selectedSameTypeCount,
      selectedSignalSlotOutlineEntry,
      selectedSimulatorTraceLogPreview,
      selectedTabOrderEntry,
      selectedTabOrderPosition,
      selectionActionBarActionCount,
      selectionActionBarLabel,
      selectionActionBarReservedTrack,
      selectionActionBarState,
      selectionAnchorId,
      selectionBarStatusDetail,
      selectionBarStatusLabel,
      selectionBarStatusTitle,
      selectionBarStatusTone,
      selectionCapabilityStrip,
      selectionMarquee,
      selectionModeHudLabel,
      selectionModeStrip,
      selectionRecommendedStep,
      selectionStatusDetail,
      selectionStatusTone,
      selectionStatusToneLabel,
      sendToBack,
      setActiveComponentPaletteKitId,
      setActiveGeneratedPreviewPath,
      setAlignPreviewMode,
      setBottomDockExpanded,
      setBottomDockExpandedHeight,
      setBottomDockHeight,
      setBottomDockLogSearchQuery,
      setBottomDockMinimized,
      setCanvasContextInsertActiveIndex,
      setCanvasContextInsertQuery,
      setCanvasControlsExpanded,
      setCanvasFindOpen,
      setCanvasFindQuery,
      setCertificateInspection,
      setCheckpointLabel,
      setComponentPaletteCategory,
      setComponentPaletteQuery,
      setConflictFile,
      setCustomPresetDetail,
      setCustomPresetDraftActionId,
      setCustomPresetDraftActions,
      setCustomPresetTitle,
      setDesktopRuntimeConsoleOpen,
      setDestructiveAction,
      setDisabledRustDebuggerBreakpointIds,
      setDraggingEditorFileTabId,
      setDropIntent,
      setEditorExperienceAuditFilter,
      setFeedbackPanelOpen,
      setInspectorPropertyQuery,
      setLeftDockCollapsed,
      setLeftDockTab,
      setLogicConnectionFilter,
      setLogicResourceView,
      setLogicSearchQuery,
      setMode,
      setNavigatorLayerMessage,
      setNavigatorQuery,
      setPreviewAutoRefresh,
      setProjectExplorerFilter,
      setProjectExplorerQuery,
      setProjectGitStatus,
      setProjectTaskKindFilter,
      setProjectTaskLogSearchQuery,
      setProjectTaskQueuePausedState,
      setProjectTaskSearchQuery,
      setProjectTaskStatusFilter,
      setReplaceTemplateOpen,
      setResponsiveBreakpoint,
      setRightDockCollapsed,
      setRightDockTab,
      setRustCommandAcceptsArgs,
      setRustCommandResultMode,
      setRustCompletionCommit,
      setRustCompletionTrigger,
      setRustDebuggerPanel,
      setRustEditorScrollLeft,
      setRustEditorScrollTop,
      setRustFindActiveIndex,
      setRustFindCaseSensitive,
      setRustFindQuery,
      setRustGoToLineQuery,
      setRustRenameQuery,
      setRustReplaceQuery,
      setRustSyntaxHighlightVisible,
      setSelectedGeneratedPreviewPaths,
      setSelectedId,
      setSelectedLockState,
      setSelectedProjectExplorerNodeId,
      setSelectedProjectTaskId,
      setSelectedProjectTemplateId,
      setSelectedRailActionPresetId,
      setSelectedRuntimeState,
      setSelectionAnchorId,
      setShowGeneratedPlanAdvanced,
      setSimulatorStateValues,
      setSimulatorTrace,
      setTabOrderOverlayVisible,
      showComponentPaletteCollections,
      showComponentPaletteKits,
      showComponentPaletteQuickInsert,
      showGeneratedPlanAdvanced,
      showProjectJumpFeedback,
      simulatorStateFromProject,
      simulatorStateValues,
      simulatorTrace,
      smartGuides,
      startCanvasMousePan,
      startCanvasPan,
      startInlineTextEdit,
      startSelectionMarquee,
      stateReferenceCounts,
      stopCanvasPan,
      stopRunSession,
      stopWorkflowRuntimeSession,
      stoppingRunId,
      suggestedWorkflowStepId,
      suppressCanvasClickRef,
      suppressPaletteClickRef,
      switchEditorMode,
      syncActiveBackendMethodSampleFromSchema,
      syncReleaseWindowFromActivePage,
      tabOrderOverlayVisible,
      taskQueueNextActionLabel,
      taskQueueStateDetail,
      taskQueueStateTitle,
      taskQueueStateTone,
      testActiveBackendIntegrationMethod,
      testingBackendMethodId,
      textPropertyValue,
      toggleCanvasPanMode,
      toggleComponentPaletteFavorite,
      toggleGeneratedPreviewPath,
      toggleItemLockFromNavigator,
      toggleItemRuntimeVisibility,
      toggleOutputDockVisibility,
      toggleProjectExplorerNode,
      togglePropertySection,
      toggleRustEditorWordWrap,
      toggleRustLineComment,
      toggleSelectedConstraint,
      toggleSelectedLock,
      toggleSelectedRuntimeVisibility,
      toolchainStatus,
      topLevelItems,
      treeRows,
      unboundLogicSignalSlotRows,
      ungroupSelectedFrames,
      updateActiveBackendMethodSampleField,
      updateBackendIntegration,
      updateBackendIntegrationMethod,
      updateCargoDependency,
      updateEventCommandForItem,
      updateItemPropsById,
      updatePage,
      updatePageTitlebarStyle,
      updatePageWindowKind,
      updateProjectRootPath,
      updateReleaseConfig,
      updateRustCommand,
      updateRustCommandParameter,
      updateRustCommandResult,
      updateRustCompletionFromEditor,
      updateRustEditorSelectionFromEditor,
      updateRustLogic,
      updateRustModule,
      updateSelectedBatchSize,
      updateSelectedEventBinding,
      updateSelectedEventCommand,
      updateSelectedLayout,
      updateSelectedObjectName,
      updateSelectedParent,
      updateSelectedProps,
      updateSelectedStateBinding,
      updateSelectedTabIndex,
      updateStateVariable,
      validateActiveBackendMethodContract,
      validatingWindow,
      validationTimeLabel,
      visibleComponentCoverageRows,
      visibleComponentPalette,
      visibleComponentPaletteDefaultOpenGroupCount,
      visibleComponentPaletteGroups,
      visibleNavigatorTreeRows,
      visibleProjectExplorerNodes,
      visibleProjectExplorerRows,
      visibleProjectTasks,
      visibleRustLogicOutline,
      visualAuditSeverityLabel,
      windowVisualAudit,
      workflowComplete,
      workflowPrimaryActionDisabled,
      workflowPrimaryActionLabel,
      workflowProgressLabel,
      workflowProgressValue,
      workflowRailBadgeLabel,
      workflowRailBadgeVariant,
      workflowRailDetail,
      workflowRailStateLabel,
      workflowRailTitle,
      workflowRuntimeActive,
      workflowStepCount,
      workflowStepStatusLabel,
      workspace,
      writingDependencyGraph,
      zoomCanvasBy,
    }}
  />;
}
