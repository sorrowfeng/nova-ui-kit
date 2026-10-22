// Domain-split types. Re-exported from types.ts for compatibility.


export type ReleaseBundleTarget = "all" | "app" | "nsis" | "msi" | "appimage" | "deb" | "dmg";

export type ReleaseSigningMode = "unsigned" | "windows-certificate" | "custom-command";

export type ReleaseInstallerSmokeMode = "artifact-only" | "write-script";

export type ReleaseInstallerSmokeRunnerMode = "manual" | "local-artifact" | "vm-handoff";

export type ReleaseWindowKind = "main" | "dialog" | "tool" | "frameless";

export type ReleaseTitlebarStyle = "nova" | "native" | "hidden";

export type InstallerSmokeStatus = "not-requested" | "pending" | "artifact-only" | "passed" | "failed";

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

type WindowsCertificateStoreEntry = {
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
