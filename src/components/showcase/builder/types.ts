export type BuilderComponentType =
  | "frame"
  | "group-box"
  | "spacer"
  | "heading"
  | "label"
  | "link-label"
  | "text-browser"
  | "help-viewer"
  | "image"
  | "image-list"
  | "web-view"
  | "media-player"
  | "pdf-viewer"
  | "map-view"
  | "graphics-view"
  | "button"
  | "button-group"
  | "dialog-button-box"
  | "command-link-button"
  | "menu-button"
  | "split-button"
  | "tool-button"
  | "toggle-button"
  | "toggle-group"
  | "input"
  | "password-field"
  | "number-field"
  | "spin-box"
  | "double-spin-box"
  | "dial"
  | "textarea"
  | "plain-text-edit"
  | "rich-text-editor"
  | "code-editor"
  | "search-bar"
  | "search-view"
  | "search-suggestion-list"
  | "filter-bar"
  | "tag-input"
  | "checkbox"
  | "checkbox-group"
  | "radio"
  | "radio-group"
  | "switch"
  | "slider"
  | "range-slider"
  | "rating"
  | "scroll-bar"
  | "color-picker"
  | "color-swatch-grid"
  | "file-picker"
  | "folder-picker"
  | "shortcut-recorder"
  | "select"
  | "multi-select"
  | "combobox"
  | "autocomplete"
  | "font-combo-box"
  | "date-picker"
  | "date-range-picker"
  | "time-picker"
  | "date-time-picker"
  | "calendar-widget"
  | "calendar-scheduler"
  | "segmented"
  | "chips"
  | "assist-chip"
  | "filter-chip"
  | "input-chip"
  | "suggestion-chip"
  | "tabs"
  | "list-item"
  | "navigation-item"
  | "menu-bar"
  | "ribbon-bar"
  | "menu"
  | "context-menu"
  | "list"
  | "list-view"
  | "column-view"
  | "icon-view"
  | "command-list"
  | "command-palette"
  | "notification-center"
  | "system-tray"
  | "activity-bar"
  | "shortcut-table"
  | "resource-browser"
  | "asset-grid"
  | "task-list"
  | "settings-list"
  | "tree-view"
  | "tree-table"
  | "outline-view"
  | "signal-slot-editor"
  | "node-graph"
  | "log-viewer"
  | "problems-panel"
  | "breakpoints-panel"
  | "watch-panel"
  | "call-stack"
  | "property-browser"
  | "layer-panel"
  | "breadcrumb-bar"
  | "pagination"
  | "top-app-bar"
  | "bottom-app-bar"
  | "navigation-bar"
  | "navigation-suite"
  | "status-bar"
  | "toolbar"
  | "floating-toolbar"
  | "split-view"
  | "splitter"
  | "size-grip"
  | "supporting-pane"
  | "scroll-area"
  | "stacked-pages"
  | "dock-panel"
  | "mdi-area"
  | "navigation"
  | "navigation-drawer"
  | "navigation-rail"
  | "side-sheet"
  | "bottom-sheet"
  | "sheet-drag-handle"
  | "accordion"
  | "tool-box"
  | "card"
  | "section-header"
  | "elevated-card"
  | "filled-card"
  | "outlined-card"
  | "carousel"
  | "empty-state"
  | "empty-panel"
  | "dialog"
  | "popover"
  | "stepper"
  | "wizard"
  | "banner"
  | "alert"
  | "tooltip"
  | "snackbar"
  | "toast"
  | "fab"
  | "extended-fab"
  | "icon-button"
  | "stat"
  | "lcd-display"
  | "chart-view"
  | "progress"
  | "circular-progress"
  | "progress-list"
  | "avatar"
  | "avatar-group"
  | "table"
  | "table-view"
  | "kanban-board"
  | "data-grid"
  | "property-grid"
  | "key-value-list"
  | "inspector-section"
  | "form-layout"
  | "console-panel"
  | "terminal-view"
  | "timeline"
  | "status-indicator"
  | "divider"
  | "badge";

export type BuilderMode = "project" | "design" | "logic" | "build";
export type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
export type ControlSize = "sm" | "md" | "lg";
export type ImageFit = "cover" | "contain" | "fill";
export type FrameLayoutMode = "free" | "row" | "column" | "grid";
export type CanvasPresetId = "desktop" | "wide" | "dialog" | "tablet" | "mobile" | "custom";
export type ResponsiveBreakpointId = "desktop" | "tablet" | "mobile";
export type CanvasBackground = "plain" | "soft" | "grid";
export type BuilderEventName = "click" | "change";
export type BuilderResultTargetProp = "value" | "label" | "title" | "description" | "helper";
export type BuilderEventPayloadMode = "value" | "json";
export type BuilderEventPayloadField = "event" | "itemId" | "itemName" | "value" | "checked" | "state";
export type RustCommandParameterType = "string" | "bool" | "number" | "json";
export type RustCommandParameterSource = "value" | "checked" | "event" | "itemId" | "itemName" | "state" | "payload";
export type RustCommandResultMode = "text" | "json";
export type ReleaseBundleTarget = "all" | "app" | "nsis" | "msi" | "appimage" | "deb" | "dmg";
export type ReleaseSigningMode = "unsigned" | "windows-certificate" | "custom-command";
export type ReleaseInstallerSmokeMode = "artifact-only" | "write-script";
export type ReleaseInstallerSmokeRunnerMode = "manual" | "local-artifact" | "vm-handoff";
export type ReleaseWindowKind = "main" | "dialog" | "tool" | "frameless";
export type ReleaseTitlebarStyle = "nova" | "native" | "hidden";
export type InstallerSmokeStatus = "not-requested" | "pending" | "artifact-only" | "passed" | "failed";
export type BackendIntegrationKind = "rust-native" | "cpp-ffi" | "sidecar" | "local-service";
export type BackendIntegrationLanguage = "rust" | "cpp" | "go" | "python" | "node" | "other";
export type BackendIntegrationTransport = "tauri-invoke" | "ffi" | "stdio" | "http" | "grpc" | "local-socket";

export type BuilderEventBinding = {
  commandId?: string;
  passValue?: boolean;
  payloadMode?: BuilderEventPayloadMode;
  payloadFields?: BuilderEventPayloadField[];
  resultTargetItemId?: string;
  resultTargetProp?: BuilderResultTargetProp;
  resultStateId?: string;
  applyJsonStatePatch?: boolean;
};

export type BuilderStateVariable = {
  id: string;
  name: string;
  initialValue: string;
};

export type PageConfig = {
  title: string;
  windowKind: ReleaseWindowKind;
  titlebarStyle: ReleaseTitlebarStyle;
  titlebarSubtitle: string;
  preset: CanvasPresetId;
  activeBreakpoint?: ResponsiveBreakpointId;
  width: number;
  height: number;
  background: CanvasBackground;
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  gridSize: number;
  zoom: number;
  autoSave: boolean;
};

export type BuilderItemProps = {
  title?: string;
  description?: string;
  label?: string;
  placeholder?: string;
  helper?: string;
  value?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  variant?: ButtonVariant;
  size?: ControlSize;
  actionCommandId?: string;
  events?: Partial<Record<BuilderEventName, BuilderEventBinding>>;
  stateBindings?: Partial<Record<BuilderResultTargetProp, string>>;
  enabled?: boolean;
  visible?: boolean;
  readOnly?: boolean;
  tabIndex?: number;
  assetId?: string;
  assetPath?: string;
  alt?: string;
  objectFit?: ImageFit;
  layoutMode?: FrameLayoutMode;
  layoutGap?: number;
  layoutPadding?: number;
  layoutColumns?: number;
  constraintLeft?: boolean;
  constraintRight?: boolean;
  constraintTop?: boolean;
  constraintBottom?: boolean;
  checked?: boolean;
};

export type ResponsiveOverride = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type BuilderItem = {
  id: string;
  type: BuilderComponentType;
  name: string;
  parentId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  locked?: boolean;
  responsive?: Partial<Record<ResponsiveBreakpointId, ResponsiveOverride>>;
  props: BuilderItemProps;
};

export type SavedBuilderState = {
  page: PageConfig;
  items: BuilderItem[];
};

export type DesignerFile = SavedBuilderState & {
  id: string;
  name: string;
  path: string;
  updatedAt: string;
};

export type RustCommand = {
  id: string;
  name: string;
  response: string;
  acceptsValue?: boolean;
  parameters?: RustCommandParameter[];
  result?: RustCommandResultSchema;
  backendIntegrationId?: string;
  backendIntegrationMethodId?: string;
};

export type RustCommandParameter = {
  id: string;
  name: string;
  type: RustCommandParameterType;
  source: RustCommandParameterSource;
};

export type RustCommandResultSchema = {
  mode: RustCommandResultMode;
  messagePath?: string;
  statePatchPath?: string;
  successPath?: string;
  errorPath?: string;
};

export type RustModule = {
  id: string;
  name: string;
  source: string;
  enabled: boolean;
};

export type CargoDependency = {
  id: string;
  name: string;
  version: string;
  features: string;
  enabled: boolean;
};

export type BackendIntegration = {
  id: string;
  name: string;
  kind: BackendIntegrationKind;
  language: BackendIntegrationLanguage;
  transport: BackendIntegrationTransport;
  entryPath: string;
  artifactPath: string;
  resourcePath: string;
  command: string;
  healthCheckCommand: string;
  startupTimeoutMs: number;
  captureOutput: boolean;
  notes: string;
  bundleResource: boolean;
  methods: BackendIntegrationMethod[];
  activeMethodId?: string;
  enabled: boolean;
};

export type BackendIntegrationMethod = {
  id: string;
  name: string;
  operation: string;
  path: string;
  description: string;
  requestSchema: string;
  responseSchema: string;
  samplePayload: string;
  lastTest?: BackendMethodTestRecord;
};

export type BackendMethodTestStatus = "passed" | "failed" | "skipped";

export type BackendMethodTestRecord = {
  id: string;
  testedAt: string;
  status: BackendMethodTestStatus;
  summary: string;
  durationMs?: number;
  transport: BackendIntegrationTransport;
  request: string;
  response: string;
  rawResponse?: string;
  error?: string;
  validationIssues?: string[];
};

export type DesignerAsset = {
  id: string;
  name: string;
  kind: "image";
  sourcePath: string;
  publicPath: string;
  addedAt: string;
};

export type ValidationHistoryEntry = {
  id: string;
  createdAt: string;
  status: "passed" | "warning" | "failed";
  score: number;
  errorCount: number;
  warningCount: number;
  checkedFiles: number;
  checkedItems: number;
  reportPath?: string;
  snapshotPath?: string;
  screenshotPath?: string;
  screenshotAnalysisPath?: string;
  runtimeAuditPath?: string;
  breakpointValidationPath?: string;
  summary: string;
};

export type BuildHistoryEntry = {
  id: string;
  createdAt: string;
  status: "success";
  buildKind: "exe" | "bundle";
  label: string;
  releaseAppName: string;
  releaseVersion: string;
  releaseBundleTargets: ReleaseBundleTarget;
  releaseNotes: string;
  releaseSigningMode: ReleaseSigningMode;
  releaseSigningConfigured: boolean;
  outputExePath?: string;
  outputDir?: string;
  bundleDir?: string;
  bundlePaths?: string[];
  bundleManifestPath?: string;
  bundleSmokeStatus?: string;
  bundleArtifactCount?: number;
  installerSmokeScriptPath?: string;
  installerSmokeResultPath?: string;
  installerSmokeStatus?: InstallerSmokeStatus | string;
  installerSmokeFinishedAt?: string;
  installerSmokeSummary?: string;
  installerSmokeRunnerMode?: ReleaseInstallerSmokeRunnerMode | string;
  installerSmokeVmHandoffPath?: string;
  launchedPid?: number;
  launchedAt?: string;
  launchSummary?: string;
  runStatus?: "running" | "stopped" | "stale" | "unknown" | string;
  runCheckedAt?: string;
  runSummary?: string;
  stoppedAt?: string;
  stopSummary?: string;
  runtimeLogPath?: string;
  runtimeLogPreview?: string;
  runtimeLogSizeBytes?: number;
  runtimeLogUpdatedAt?: string;
  runtimeLogTruncated?: boolean;
  generatedAppDir: string;
  generatedFileSummary?: string;
  generatedChangedCount?: number;
  generatedTotalCount?: number;
  generatedCreatedCount?: number;
  generatedUpdatedCount?: number;
  generatedUnchangedCount?: number;
  readinessScore: number;
  readinessErrors: number;
  readinessWarnings: number;
  visualScore: number;
  visualErrors: number;
  visualWarnings: number;
  validationStatus?: ValidationHistoryEntry["status"];
  fileCount: number;
  controlCount: number;
  commandCount: number;
  stateCount: number;
  assetCount: number;
  summary: string;
};

export type ReleasePipelineStatus = "queued" | "running" | "succeeded" | "failed" | "skipped" | "canceled";

export type ReleasePipelineStepInputSnapshot = {
  projectId: string;
  projectName: string;
  rootPath?: string;
  activeFileId?: string;
  activeFileName?: string;
  releaseAppName: string;
  releaseVersion: string;
  fileCount: number;
  controlCount: number;
  commandCount: number;
  stateCount: number;
  assetCount: number;
  backendIntegrationCount: number;
  projectSnapshotHash: string;
};

export type ReleasePipelineStepEnvironment = {
  runtime: "tauri" | "browser";
  platform: string;
  userAgent?: string;
  language?: string;
  timeZone?: string;
};

export type ReleasePipelineStepCommandArgs = {
  actionId: string;
  title: string;
  kind: string;
  attempt: number;
  pipelineRunId?: string;
  pipelineStepIndex?: number;
  pipelineStepCount?: number;
  backendTaskId?: string;
  artifactPath?: string;
  logPath?: string;
};

export type ReleasePipelineStepArtifactEvidence = {
  path: string;
  exists: boolean;
  isFile: boolean;
  isDir: boolean;
  sizeBytes: number;
  modifiedAt?: string | null;
  sha256?: string | null;
  summary: string;
  checkedAt: string;
};

export type ReleasePipelineArtifactInspectionResult = {
  path: string;
  exists: boolean;
  is_file: boolean;
  is_dir: boolean;
  size_bytes: number;
  modified_at?: string | null;
  sha256?: string | null;
  summary: string;
};

export type ReleasePipelineStep = {
  id: string;
  taskId?: string;
  actionId: string;
  title: string;
  kind: string;
  status: ReleasePipelineStatus;
  startedAt?: string;
  finishedAt?: string;
  summary?: string;
  error?: string;
  logPreview?: string;
  artifactPath?: string;
  logPath?: string;
  inputSnapshot?: ReleasePipelineStepInputSnapshot;
  environment?: ReleasePipelineStepEnvironment;
  commandArgs?: ReleasePipelineStepCommandArgs;
  artifactEvidence?: ReleasePipelineStepArtifactEvidence;
};

export type ReleasePipelineEntry = {
  id: string;
  presetId: string;
  presetTitle: string;
  presetBadge: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  status: ReleasePipelineStatus;
  stepCount: number;
  succeededCount: number;
  failedCount: number;
  skippedCount: number;
  canceledCount: number;
  releaseAppName: string;
  releaseVersion: string;
  artifactPath?: string;
  logPath?: string;
  recordPath?: string;
  latestRecordPath?: string;
  recordWrittenAt?: string;
  outputExePath?: string;
  bundleManifestPath?: string;
  bundlePaths?: string[];
  rootPath?: string;
  summary: string;
  steps: ReleasePipelineStep[];
};

export type ReleasePipelineRecordWriteResult = {
  root_path: string;
  path: string;
  latest_path: string;
  written_at: string;
  summary: string;
};

export type ProjectReleaseConfig = {
  appName: string;
  bundleIdentifier: string;
  version: string;
  releaseNotes: string;
  bundleTargets: ReleaseBundleTarget;
  iconAssetId: string;
  signingMode: ReleaseSigningMode;
  certificateThumbprint: string;
  certificateSourcePath: string;
  certificatePasswordEnvVar: string;
  importCertificateBeforeBuild: boolean;
  digestAlgorithm: string;
  timestampUrl: string;
  timestampTsp: boolean;
  signCommand: string;
  minimumArtifactSizeKb: number;
  installerSmokeMode: ReleaseInstallerSmokeMode;
  installerSmokeRunnerMode: ReleaseInstallerSmokeRunnerMode;
  installerSmokeVmName: string;
  installerSmokeVmSharedFolder: string;
  installerSmokeVmNotes: string;
  windowTitle: string;
  windowKind: ReleaseWindowKind;
  titlebarStyle: ReleaseTitlebarStyle;
  titlebarSubtitle: string;
  windowWidth: number;
  windowHeight: number;
  minWindowWidth: number;
  minWindowHeight: number;
  resizable: boolean;
  showRuntimePanel: boolean;
};

export type BreakpointValidationIssue = {
  id: string;
  breakpoint: ResponsiveBreakpointId;
  severity: "warning" | "error";
  title: string;
  detail: string;
  fileId: string;
  fileName: string;
  itemId?: string;
  itemName?: string;
  itemType?: string;
};

export type ProjectMaintenanceAction = "property-schema-repair";

export type ProjectMaintenanceChange = {
  fileId: string;
  fileName: string;
  itemId: string;
  itemName: string;
  itemType: BuilderComponentType;
  props: string[];
  issueCount: number;
};

export type ProjectMaintenanceEntry = {
  id: string;
  createdAt: string;
  action: ProjectMaintenanceAction;
  status: "applied" | "partial" | "skipped";
  title: string;
  summary: string;
  fileCount: number;
  itemCount: number;
  propertyCount: number;
  issueCount: number;
  manualIssueCount: number;
  changes: ProjectMaintenanceChange[];
};

export type ProjectEditorState = {
  openFileIds: string[];
  activeMode: BuilderMode;
  activeLeftDockTab?: string;
  activeRightDockTab?: string;
  leftDockCollapsed?: boolean;
  rightDockCollapsed?: boolean;
  activeBottomDockTab?: string;
  bottomDockExpanded?: boolean;
  bottomDockMinimized?: boolean;
  bottomDockHeight?: number;
  bottomDockExpandedHeight?: number;
  selectedRailActionPresetId?: string;
  canvasControlsExpanded?: boolean;
  tabOrderOverlayVisible?: boolean;
  canvasActiveBreakpoint?: ResponsiveBreakpointId;
  canvasZoom?: number;
  canvasViewportScrollLeft?: number;
  canvasViewportScrollTop?: number;
  selectedItemIds?: string[];
  selectionAnchorId?: string;
  projectExplorerFilter?: string;
  projectExplorerQuery?: string;
  selectedProjectExplorerNodeId?: string;
  collapsedProjectExplorerNodeIds?: string[];
  navigatorQuery?: string;
  componentPaletteQuery?: string;
  componentPaletteCategory?: string;
  componentPaletteRecentTypes?: string[];
  componentPaletteFavoriteTypes?: string[];
  inspectorPropertySections?: Partial<Record<"layout" | "content" | "state" | "appearance" | "actions", boolean>>;
  inspectorPropertyQuery?: string;
  rustFindQuery?: string;
  rustFindCaseSensitive?: boolean;
  logicSearchQuery?: string;
  logicResourceView?: string;
  logicConnectionFilter?: string;
  rustEditorScrollTop?: number;
  rustEditorScrollLeft?: number;
  rustEditorWordWrap?: boolean;
  rustEditorSelectionStart?: number;
  rustEditorSelectionEnd?: number;
  projectTaskSearchQuery?: string;
  projectTaskStatusFilter?: string;
  projectTaskKindFilter?: string;
  selectedProjectTaskId?: string;
  projectTaskLogSearchQuery?: string;
  bottomDockLogSearchQuery?: string;
  projectTaskQueuePaused?: boolean;
  activeGeneratedPreviewPath?: string;
  selectedGeneratedPreviewPaths?: string[];
  showGeneratedPlanAdvanced?: boolean;
  selectedBuilderIssueId?: string;
  activeEditorTabId?: string;
  updatedAt: string;
};

export type DesignerProject = {
  id: string;
  name: string;
  description: string;
  rootPath?: string;
  assets: DesignerAsset[];
  stateVariables: BuilderStateVariable[];
  activeStateVariableId?: string;
  rustCommands: RustCommand[];
  activeRustCommandId: string;
  rustLogic: string;
  rustModules: RustModule[];
  activeRustModuleId?: string;
  cargoDependencies: CargoDependency[];
  activeCargoDependencyId?: string;
  backendIntegrations: BackendIntegration[];
  activeBackendIntegrationId?: string;
  buildLog?: string;
  lastGeneratedFileSummary?: GeneratedFileChangeSummary;
  rustSourceMap?: GeneratedRustSourceMap;
  rustSourceMapPath?: string;
  generatedRustSourceMapPath?: string;
  outputExePath?: string;
  outputBundleDir?: string;
  outputBundlePaths?: string[];
  outputBundleManifestPath?: string;
  validationLog?: string;
  validationReportPath?: string;
  validationSnapshotPath?: string;
  validationScreenshotPath?: string;
  validationScreenshotAnalysisPath?: string;
  validationRuntimeAuditPath?: string;
  validationBreakpointPath?: string;
  validationBreakpointIssues?: BreakpointValidationIssue[];
  validationHistory?: ValidationHistoryEntry[];
  buildHistory?: BuildHistoryEntry[];
  releasePipelineHistory?: ReleasePipelineEntry[];
  maintenanceHistory?: ProjectMaintenanceEntry[];
  files: DesignerFile[];
  activeFileId: string;
  editorState?: ProjectEditorState;
  releaseConfig: ProjectReleaseConfig;
  createdAt: string;
  updatedAt: string;
};

export type DesignerWorkspace = {
  projects: DesignerProject[];
  activeProjectId: string;
};

export type EditorProjectPaths = {
  root_path: string;
  manifest_path: string;
  editor_state_path: string;
  workspace_metadata_path: string;
  ui_dir: string;
  rust_logic_path: string;
  rust_source_map_path: string;
  generated_app_dir: string;
  generated_app_src: string;
  generated_rust_source_map_path: string;
  output_exe_path?: string | null;
};

export type EditorProjectCheckpoint = {
  id: string;
  label: string;
  created_at: string;
  path: string;
  project_name: string;
  file_count: number;
  command_count: number;
};

export type EditorProjectCheckpointResult = {
  checkpoint: EditorProjectCheckpoint;
  paths: EditorProjectPaths;
};

export type EditorProjectCheckpointFileDiff = {
  name: string;
  change: string;
  current_items: number;
  checkpoint_items: number;
};

export type EditorProjectCheckpointDiff = {
  checkpoint: EditorProjectCheckpoint;
  summary: string;
  metadata_changed: boolean;
  rust_logic_changed: boolean;
  file_delta: number;
  item_delta: number;
  command_delta: number;
  state_delta: number;
  asset_delta: number;
  added_files: string[];
  removed_files: string[];
  changed_files: EditorProjectCheckpointFileDiff[];
  details: string[];
};

export type BuildResult = {
  success: boolean;
  build_kind?: "exe" | "bundle" | string;
  paths: EditorProjectPaths;
  generated_files?: GeneratedFileChangeSummary;
  bundle_dir?: string | null;
  bundle_paths?: string[];
  bundle_manifest_path?: string | null;
  bundle_smoke_status?: string | null;
  bundle_artifact_count?: number;
  installer_smoke_script_path?: string | null;
  installer_smoke_result_path?: string | null;
  installer_smoke_status?: string | null;
  installer_smoke_result_summary?: string | null;
  installer_smoke_finished_at?: string | null;
  installer_smoke_runner_mode?: string | null;
  installer_smoke_vm_handoff_path?: string | null;
  rust_source_map?: GeneratedRustSourceMap;
  log: string;
};

export type GeneratedFileChangeSummary = {
  summary: string;
  total_count: number;
  changed_count: number;
  created_count: number;
  updated_count: number;
  unchanged_count: number;
  asset_count: number;
};

export type EditorBackgroundTaskView = {
  id: string;
  task_kind: "check" | "build" | "bundle" | string;
  check_kind?: "frontend" | "rust" | "all" | string | null;
  status: "queued" | "running" | "succeeded" | "failed" | "canceled" | string;
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  root_path: string;
  log_path: string;
  current_command?: string | null;
  pid?: number | null;
  summary: string;
  error?: string | null;
  log_tail: string;
  result?: BuildResult | null;
};

export type GeneratedFilePreviewEntry = {
  path: string;
  relative_path: string;
  kind: string;
  status: "create" | "update" | "unchanged" | "copy" | "managed" | string;
  changed: boolean;
  exists: boolean;
  size_bytes: number;
  line_count: number;
  preview: string;
  summary: string;
};

export type GeneratedFilePreviewResult = {
  root_path: string;
  summary: string;
  total_count: number;
  changed_count: number;
  created_count: number;
  updated_count: number;
  unchanged_count: number;
  asset_count: number;
  entries: GeneratedFilePreviewEntry[];
};

export type ApplyGeneratedFileEntry = {
  path: string;
  relative_path: string;
  kind: string;
  status: string;
  applied: boolean;
  summary: string;
};

export type ApplyGeneratedFilesResult = {
  root_path: string;
  checkpoint_path: string;
  requested_count: number;
  applied_count: number;
  skipped_count: number;
  summary: string;
  entries: ApplyGeneratedFileEntry[];
};

export type ProjectDependencyGraphScope = {
  id: string;
  label: string;
  status: string;
  changedCount: number;
  totalCount: number;
  paths: string[];
  sourceRefs: ProjectDependencySourceReference[];
  summary: string;
};

export type ProjectDependencySourceReference = {
  id: string;
  kind: string;
  label: string;
  detail: string;
  affectedPaths: string[];
  fileId?: string;
  itemId?: string;
  commandId?: string;
  moduleId?: string;
  dependencyId?: string;
  assetId?: string;
  integrationId?: string;
  path?: string;
};

export type ProjectDependencyGraphPlan = {
  id: string;
  title: string;
  detail: string;
  badge: string;
  actions: string[];
  scopeIds: string[];
  ready: boolean;
};

export type ProjectDependencyGraphEvent = {
  kind: string;
  actionId?: string;
  status?: string;
  summary?: string;
  artifactPath?: string;
  logPath?: string;
  scopeIds?: string[];
  recordedAt: string;
};

export type ProjectDependencyGraphValidityEntry = {
  id: string;
  kind: string;
  label: string;
  scopeIds: string[];
  snapshotHash: string;
  resultStatus: string;
  actionId?: string;
  summary?: string;
  artifactPath?: string;
  logPath?: string;
  recordedAt: string;
  invalidatedAt?: string;
  invalidatedBy?: string;
  invalidatedScopeIds?: string[];
};

export type ProjectDependencyGraphRecord = {
  id: string;
  projectId: string;
  projectName: string;
  rootPath?: string;
  snapshotHash: string;
  previewSnapshotHash?: string;
  status: string;
  changedCount: number;
  totalCount: number;
  dirtyScopeCount: number;
  scopes: ProjectDependencyGraphScope[];
  executionPlan: ProjectDependencyGraphPlan;
  lastEvent: ProjectDependencyGraphEvent;
  validity: ProjectDependencyGraphValidityEntry[];
  previewRootPath?: string;
  recordPath?: string;
  recordWrittenAt?: string;
  updatedAt: string;
  summary: string;
};

export type ProjectDependencyGraphWriteResult = {
  root_path: string;
  path: string;
  written_at: string;
  summary: string;
};

export type ProjectDependencyGraphReadResult = {
  root_path: string;
  path: string;
  exists: boolean;
  graph?: ProjectDependencyGraphRecord | null;
  summary: string;
};

export type BackendMethodTestResult = {
  success: boolean;
  status: BackendMethodTestStatus | string;
  integration_id: string;
  integration_name: string;
  method_id: string;
  method_name: string;
  transport: BackendIntegrationTransport;
  duration_ms: number;
  summary: string;
  request: unknown;
  response?: unknown;
  raw_response?: string;
  error?: string | null;
};

export type BackendArtifactInspectionStatus = "ready" | "missing" | "not-required" | "not-configured";

export type BackendArtifactInspectionEntry = {
  integration_id: string;
  integration_name: string;
  kind: BackendIntegrationKind | string;
  language: BackendIntegrationLanguage | string;
  transport: BackendIntegrationTransport | string;
  bundle_resource: boolean;
  artifact_path: string;
  resource_path: string;
  resolved_path?: string | null;
  exists: boolean;
  is_file: boolean;
  is_dir: boolean;
  size_bytes: number;
  modified_at?: string | null;
  status: BackendArtifactInspectionStatus | string;
  summary: string;
};

export type BackendArtifactInspectionResult = {
  root_path: string;
  checked_at: string;
  summary: string;
  ready_count: number;
  missing_count: number;
  entries: BackendArtifactInspectionEntry[];
};

export type BackendArtifactBuildResult = {
  success: boolean;
  status: "built" | "failed" | "missing-artifact" | string;
  integration_id: string;
  integration_name: string;
  kind: BackendIntegrationKind | string;
  language: BackendIntegrationLanguage | string;
  command: string;
  cwd: string;
  script_path?: string | null;
  artifact_path: string;
  resolved_artifact_path?: string | null;
  artifact_exists: boolean;
  artifact_size_bytes: number;
  artifact_modified_at?: string | null;
  checked_at: string;
  summary: string;
  log: string;
};

export type InstallerSmokeResult = {
  result_path: string;
  status: InstallerSmokeStatus | string;
  summary: string;
  finished_at?: string | null;
  artifact_count: number;
  passed_count: number;
  failed_count: number;
  log_path?: string | null;
  script_path?: string | null;
  output_log?: string;
};

export type WindowsCertificateStoreEntry = {
  store: string;
  subject: string;
  issuer: string;
  thumbprint: string;
  not_before?: string | null;
  not_after?: string | null;
  has_private_key: boolean;
  archived: boolean;
  friendly_name?: string | null;
};

export type WindowsCertificateInspectionResult = {
  query: string;
  checked_at: string;
  found: boolean;
  match_count: number;
  summary: string;
  entries: WindowsCertificateStoreEntry[];
};

export type InstallerSandboxHandoffResult = {
  handoff_path: string;
  sandbox_config_path: string;
  launcher_script_path: string;
  shared_folder: string;
  sandbox_script_path: string;
  sandbox_result_path: string;
  copied_artifact_count: number;
  summary: string;
};

export type LaunchExecutableResult = {
  path: string;
  pid: number;
  started_at: string;
  log_path: string;
  summary: string;
};

export type RunSessionResult = {
  path: string;
  pid: number;
  status: "running" | "stopped" | "stale" | "unknown" | string;
  checked_at: string;
  executable_path?: string | null;
  command_line?: string | null;
  summary: string;
};

export type RuntimeLogResult = {
  path: string;
  content: string;
  size_bytes: number;
  modified_at?: string | null;
  truncated: boolean;
};

export type ValidationResult = {
  success: boolean;
  paths: EditorProjectPaths;
  log: string;
  report_path: string;
  snapshot_path: string;
  screenshot_path?: string | null;
  screenshot_analysis_path?: string | null;
  runtime_audit_path?: string | null;
  breakpoint_validation_path?: string | null;
  breakpoint_issues?: Array<{
    id: string;
    breakpoint: string;
    severity: string;
    title: string;
    detail: string;
    file_id: string;
    file_name: string;
    item_id?: string | null;
    item_name?: string | null;
    item_type?: string | null;
  }>;
};

export type ManagedProjectSummary = {
  name: string;
  root_path: string;
  manifest_path: string;
  updated_at?: string | null;
};

export type BuildDiagnostic = {
  severity: "error" | "warning";
  message: string;
  code?: string;
  file?: string;
  line?: number;
  column?: number;
  lineEnd?: number;
  columnEnd?: number;
  rendered?: string;
  origin?: "cargo-json" | "rustc-text";
  sourceFile?: string;
  sourceLine?: number;
  sourceColumn?: number;
  sourceKind?: string;
  sourceSummary?: string;
  mappedToSource?: boolean;
  sourceMapId?: string;
};

export type GeneratedRustSourceMapEntry = {
  id: string;
  kind: string;
  source_path: string;
  generated_path: string;
  source_start_line: number;
  source_end_line: number;
  generated_start_line: number;
  generated_end_line: number;
  line_offset: number;
  line_count: number;
  summary: string;
};

export type GeneratedRustSourceMap = {
  schema: string;
  project_name: string;
  root_path: string;
  rust_logic_path: string;
  generated_lib_path: string;
  source_map_path: string;
  generated_source_map_path: string;
  entries: GeneratedRustSourceMapEntry[];
};

export type ResizeHandle = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

export type DragSession =
  | {
      kind: "move";
      ids: string[];
      startClientX: number;
      startClientY: number;
      origins: Record<string, { x: number; y: number }>;
      absoluteOrigins: Record<string, { x: number; y: number }>;
    }
  | {
      kind: "resize";
      id: string;
      handle: ResizeHandle;
      startClientX: number;
      startClientY: number;
      originWidth: number;
      originHeight: number;
      originX: number;
      originY: number;
    };

export type FrameDropIntent = {
  kind: "frame";
  frameId: string;
  index: number;
  childCount: number;
  mode: FrameLayoutMode;
};

export type CanvasDropIntent = {
  kind: "canvas";
  x: number;
  y: number;
  itemCount: number;
};

export type BuilderDropIntent = FrameDropIntent | CanvasDropIntent;

export type HistoryEntry = {
  undo: SavedBuilderState[];
  redo: SavedBuilderState[];
};

export type AlignmentMode = "left" | "center" | "right" | "top" | "middle" | "bottom";
