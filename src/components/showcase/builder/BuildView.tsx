/* eslint-disable @typescript-eslint/no-explicit-any */
// Extracted from BuilderShowcase.tsx (P2-9): the "build" workspace view.
// BuilderShowcase still owns the state; this module only renders it.

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight, Box, Braces, CheckCircle2, ChevronDown, ChevronRight, ClipboardCopy, Clock3, CornerDownRight, Download, FileImage, FileJson, FolderOpen, GitBranch, ListChecks, Menu, Monitor, MousePointer2, MoveDown, MoveUp, Pause, Play, Plus, RotateCcw, Save, Search, Settings2, Square, Terminal, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projectChangeScopeLabel } from "./change-impact";
import { CountReadout, StateBadge, StateLabel, isQuietCount, isQuietStateLabel, isSignalStateLabel } from "./view-helpers";
// Pure helpers come in directly rather than through props.scope: the scope bag
// needs the same symbol wired through BuilderShowcase and ShellView, which is
// how "X is not a function" once blanked this whole workbench.
import { projectActivityStatusLabel } from "./monolith-module";
import { buildDiagnosticSeverityLabel } from "./status-labels";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GeneratedDiffView } from "./GeneratedDiffView";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ProjectHealthPanel } from "./ProjectHealthPanel";
import { ProjectJumpActionId, ProjectTaskKindFilter, ProjectTaskStatus, ProjectTaskStatusFilter } from "./task-center";
import { ReleaseBundleTarget, ReleaseInstallerSmokeMode, ReleaseInstallerSmokeRunnerMode, ReleaseSigningMode } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type BuildViewScope = Record<string, any>;

export function BuildView(props: { scope: BuildViewScope }): ReactNode {
  const scope = props.scope ?? {};
  const {
    BuildWorkspace,
    Field,
    PathRow,
    ProjectTaskIcon,
    Suspense,
    activeBuildOutputDir,
    activeBundleDir,
    activeBundleManifestPath,
    activeBundlePath,
    activeGeneratedPreviewEntry,
    activeProject,
    activeProjectTasks,
    activeReleaseIconAsset,
    activeWorkflowRuntimeSession,
    activityTimeline,
    addActionToCustomPresetDraft,
    allProjectActionPresets,
    applyProjectPropertyAutoFixes,
    applyingGeneratedFiles,
    breakpointIssues,
    buildArtifactReady,
    buildArtifactStatusLabel,
    buildDiagnostics,
    buildError,
    buildLogLineCount,
    buildLogPreviewText,
    buildReadinessActionLabel,
    buildReadinessSeverityLabel,
    buildReadinessSummary,
    building,
    buildingBackendArtifactId,
    bumpActiveReleaseVersion,
    bumpReleaseVersion,
    bundling,
    byteSizeLabel,
    canMoveQueuedProjectTask,
    canSaveCustomPreset,
    cancelProjectTask,
    cancelQueuedProjectTasks,
    certificateInspection,
    checkingCertificateStore,
    checkingRunId,
    checkingTarget,
    chooseSigningCertificate,
    clearCompletedProjectTasks,
    cn,
    completedProjectTaskCount,
    createInstallerSandboxHandoff,
    creatingSandboxHandoffId,
    customPresetDetail,
    customPresetDraftActionId,
    customPresetDraftActions,
    customPresetTitle,
    deleteCustomProjectActionPreset,
    dependencyGraphEventStatusVariant,
    dependencyValidityStatusVariant,
    desktopRuntimeBadgeVariant,
    desktopRuntimeConsoleOpen,
    desktopRuntimeLogPath,
    desktopRuntimePath,
    desktopRuntimePrimaryDisabled,
    desktopRuntimePrimaryLabel,
    desktopRuntimePrimaryLoading,
    desktopRuntimeState,
    desktopRuntimeStatusLabel,
    diskBusy,
    drainProjectTaskQueue,
    editorExperienceAuditBadgeVariant,
    editorExperienceAuditFilter,
    editorExperienceAuditItems,
    editorExperienceAuditSeverityLabel,
    editorExperienceAuditState,
    editorExperienceAuditStats,
    editorExperienceAuditStatusLabel,
    enqueueProjectTask,
    failedProjectTaskCount,
    fileNameFromPath,
    filteredEditorExperienceAuditItems,
    fixAllBreakpointIssues,
    fixAllBreakpointIssuesAndValidate,
    fixBreakpointIssue,
    fixBreakpointIssueAndValidate,
    fixableBreakpointIssueCount,
    focusBreakpointIssue,
    focusBuildReadinessItem,
    focusEditorExperienceAuditEvidence,
    focusLeftRunControls,
    focusProjectDependencySourceRef,
    focusProjectReverseDependencyTarget,
    focusVisualAuditIssue,
    generatedFileApplyResult,
    generatedFilePreview,
    generatedFileStatusLabel,
    generatedPlanBusy,
    generatedPlanPrimaryAction,
    generatedPlanPrimaryLabel,
    generatedPlanStatusDetail,
    generatedPlanStatusTitle,
    inspectCertificateStore,
    invokeIfAvailable,
    isEditableRustDiagnostic,
    latestEditorExperienceAuditTask,
    latestGeneratedFileSummary,
    latestProjectTask,
    latestReleasePipeline,
    latestRunSessionEntry,
    latestValidationRun,
    launchActiveOutputExecutable,
    launchBuiltExecutable,
    launchingExeId,
    localQueuedProjectTasks,
    moveCustomPresetDraftAction,
    moveQueuedProjectTask,
    normalizeMinimumArtifactSizeKb,
    normalizeReleaseVersion,
    numberFromInput,
    open,
    openBottomDock,
    openBuildDiagnostic,
    openBuildReadinessItem,
    openLocalArtifact,
    openProjectTaskResolution,
    openQtCreatorParityRequirement,
    openRelevantTaskDock,
    previewingGeneratedFiles,
    projectActionOptionIds,
    projectChangeImpact,
    projectChangeImpactStatusLabel,
    projectChangeImpactStatusVariant,
    projectChangeScopeStatusLabel,
    projectChangeScopeStatusVariant,
    projectDependencyGraph,
    projectDependencySources,
    projectDependencyValidity,
    projectGitStatus,
    projectPropertyAutoFixSummary,
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
    qtCreatorParityItems,
    qtCreatorParityStats,
    queuedProjectTaskCount,
    queuedProjectTaskIndex,
    railQueueSummaryLabel,
    railRunTargetLabel,
    railTaskCountLabel,
    railWindowTargetLabel,
    readingRuntimeLogId,
    refreshInstallerSmokeResult,
    refreshProjectDependencyGraph,
    refreshReleasePipelineRecords,
    refreshRunSession,
    refreshRuntimeLog,
    refreshingDependencyGraph,
    refreshingPipelineRecords,
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
    releaseTitlebarStyles,
    releaseWindowKinds,
    releaseWindowShellMatchesPage,
    removeActionFromCustomPresetDraft,
    rerunReleasePipeline,
    rerunReleasePipelineFromFailure,
    retryProjectTask,
    reverseDependencyStatusLabel,
    reverseDependencyStatusVariant,
    reverseDependencySummaries,
    reverseDependencyTargetKindLabel,
    runInstallerSmokeScript,
    runProjectActionPreset,
    runProjectChangeImpactPlan,
    runReleaseReadinessAction,
    runTaskQueueRecommendedAction,
    runningProjectTask,
    runningSmokeId,
    runtimeWindowParityItems,
    saveCustomProjectActionPreset,
    selectChangedGeneratedPreviewPaths,
    selectGeneratedChangeScope,
    selectProjectReverseDependencyOutputs,
    selectedGeneratedPreviewPathSet,
    selectedGeneratedPreviewPaths,
    selectedProjectTask,
    selectedProjectTaskLogLines,
    selectedProjectTaskLogMatchCount,
    selectedRailActionPreset,
    selectedRailActionPresetStepLabel,
    setActiveGeneratedPreviewPath,
    setCertificateInspection,
    setCustomPresetDetail,
    setCustomPresetDraftActionId,
    setCustomPresetDraftActions,
    setCustomPresetTitle,
    setDesktopRuntimeConsoleOpen,
    setEditorExperienceAuditFilter,
    setLeftDockTab,
    setMode,
    setProjectTaskKindFilter,
    setProjectTaskLogSearchQuery,
    setProjectTaskQueuePausedState,
    setProjectTaskSearchQuery,
    setProjectTaskStatusFilter,
    setSelectedGeneratedPreviewPaths,
    setSelectedProjectTaskId,
    setShowGeneratedPlanAdvanced,
    showGeneratedPlanAdvanced,
    showProjectJumpFeedback,
    stopRunSession,
    stopWorkflowRuntimeSession,
    stoppingRunId,
    syncReleaseWindowFromActivePage,
    taskQueueNextActionLabel,
    taskQueueStateDetail,
    taskQueueStateLabel,
    taskQueueStateTitle,
    taskQueueStateTone,
    toggleGeneratedPreviewPath,
    toolbar,
    updateReleaseConfig,
    validatingWindow,
    validationTimeLabel,
    visibleProjectTasks,
    visualAuditSeverityLabel,
    windowVisualAudit,
    workflowProgressLabel,
    workflowRuntimeActive,
    writingDependencyGraph,
  } = scope;

  return (
            <Suspense fallback={null}>
            <BuildWorkspace
              toolbarPlacement="sidebar"
              toolbar={
                <div className="grid min-w-0 gap-2 text-xs" data-builder-build-toolbar="">
                  <div className="flex min-w-0 items-center gap-2">
                    <Download aria-hidden className="size-4 shrink-0 text-primary" />
                    <h2 className="shrink-0 text-sm font-semibold">构建</h2>
                    <StateLabel variant={latestReleasePipeline ? projectTaskStatusVariant(latestReleasePipeline.status as ProjectTaskStatus) : "outline"}
                      label={latestReleasePipeline ? projectTaskStatusLabel(latestReleasePipeline.status) : "待开始"} />
                    <span className="hidden min-w-0 truncate text-on-surface-variant md:block">
                      {activeProject.outputExePath ? fileNameFromPath(activeProject.outputExePath) : activeProject.releaseConfig.appName}
                    </span>
                  </div>
                  <div
                    className="flex min-w-0 items-center gap-1 overflow-hidden"
                    data-builder-build-toolbar-status-actions=""
                  >
                    <StateBadge variant={activeProject.outputExePath ? "secondary" : "outline"} className="h-6 shrink-0 px-2 text-[0.65rem]"
                      label={activeProject.outputExePath ? "exe 就绪" : "无 exe"} signal={!activeProject.outputExePath} />
                    <StateBadge variant={activeBundlePath || activeBundleDir ? "secondary" : "outline"} className="h-6 shrink-0 px-2 text-[0.65rem]"
                      label={activeBundlePath || activeBundleDir ? "包就绪" : "无安装包"} signal={!(activeBundlePath || activeBundleDir)} />
                    <Button size="icon-sm" variant="ghost" className="size-7 shrink-0" aria-label="打开输出 Dock" title="打开输出 Dock" onClick={() => openBottomDock("output", false)}>
                      <Download aria-hidden className="size-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="size-7 shrink-0"
                      aria-label="打开任务 Dock"
                      title="打开任务 Dock"
                      onClick={() => openRelevantTaskDock(latestProjectTask, false)}
                    >
                      <ClipboardCopy aria-hidden className="size-3.5" />
                    </Button>
                  </div>
                </div>
              }
            >
              <aside
                className="space-y-1 rounded-md border border-outline-variant bg-surface-container-low px-1.5 py-1.5"
                data-builder-build-output-sidebar=""
                data-builder-build-output-sidebar-density="low-chrome"
              >
                <div
                  className="flex h-8 min-w-0 items-center justify-between gap-2 rounded-md px-1.5 text-xs"
                  data-builder-build-output-header=""
                  data-builder-build-output-header-density="single-row"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                      <Download aria-hidden className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-xs font-semibold text-on-surface">构建输出</h3>
                      {/* The name, not a second copy of the status. The toolbar
                          chip right above already says "无 exe"; repeating it
                          here put one fact on screen twice within one card. */}
                      <p className="truncate text-[0.64rem] leading-3 text-on-surface-variant">
                        {activeProject.outputExePath ? fileNameFromPath(activeProject.outputExePath) : activeProject.releaseConfig.appName || activeProject.name}
                      </p>
                    </div>
                  </div>
                  <StateBadge variant="outline" className="h-6 shrink-0 px-2 text-[0.64rem]"
                    label={activeProject.outputExePath ? "就绪" : "待构建"} signal={false} />
                </div>
                <div className="space-y-1.5 text-xs" data-builder-build-output-evidence="collapsed-default">
                  <details
                    className="group rounded-md border border-outline-variant bg-surface-container px-2 py-1.5"
                    data-builder-build-output-details=""
                    data-builder-build-output-details-state="collapsed-default"
                  >
                    <summary className="focus-ring flex h-7 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-1 text-xs font-medium text-on-surface transition hover:bg-surface-container-high">
                      <span className="truncate">输出路径</span>
                      <span className="flex shrink-0 items-center gap-1.5 text-[0.66rem] text-on-surface-variant">
                        <span>{activeProject.outputExePath ? "exe 已生成" : "待构建"}</span>
                        <ChevronDown aria-hidden className="size-3.5 transition-transform group-open:rotate-180" />
                      </span>
                    </summary>
                    <div className="mt-2 space-y-2">
                      <PathRow label="项目目录" value={activeProject.rootPath || "保存后生成"} />
                      <PathRow label="UI 文件" value={activeProject.rootPath ? `${activeProject.rootPath}\\ui` : "保存后生成"} />
                      <PathRow label="Rust 逻辑" value={activeProject.rootPath ? `${activeProject.rootPath}\\rust\\logic.rs` : "保存后生成"} />
                      <PathRow label="Rust 源码映射" value={activeProject.rustSourceMapPath || "保存后生成"} />
                      <PathRow label="生成应用" value={activeProject.rootPath ? `${activeProject.rootPath}\\app` : "保存后生成"} />
                      <PathRow label="生成源码映射" value={activeProject.generatedRustSourceMapPath || "生成 app 后写入"} />
                      <PathRow label="验证报告" value={activeProject.validationReportPath || "验证后生成"} />
                      <PathRow label="窗口快照" value={activeProject.validationSnapshotPath || "验证后生成"} />
                      <PathRow label="运行截图" value={activeProject.validationScreenshotPath || "有可用浏览器时生成"} />
                      <PathRow label="截图分析" value={activeProject.validationScreenshotAnalysisPath || "截图成功后生成"} />
                      <PathRow label="DOM 审阅" value={activeProject.validationRuntimeAuditPath || "浏览器验证后生成"} />
                      <PathRow label="断点验证" value={activeProject.validationBreakpointPath || "多断点验证后生成"} />
                      <PathRow label="输出 exe" value={activeProject.outputExePath || "构建成功后生成"} />
                      <PathRow label="安装包目录" value={activeProject.outputBundleDir || activeBundleDir || "完整打包后生成"} />
                      <PathRow label="安装包产物" value={activeBundlePath || "完整打包后生成"} />
                      <PathRow label="安装包 manifest" value={activeBundleManifestPath || "完整打包后生成"} />
                    </div>
                  </details>
                  <div
                    className="subtle-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto overflow-y-hidden rounded-md border border-outline-variant/70 bg-surface-container px-1 py-1"
                    data-builder-build-artifact-actions="icon-strip"
                    data-builder-build-artifact-actions-density="single-row-icons"
                  >
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      className="size-7 shrink-0"
                      data-builder-open-output-exe=""
                      aria-label="打开 exe"
                      title="打开 exe"
                      disabled={!activeProject.outputExePath}
                      onClick={() => void openLocalArtifact(activeProject.outputExePath ?? "")}
                    >
                      <Download aria-hidden className="size-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      className="size-7 shrink-0"
                      data-builder-launch-output-exe=""
                      aria-label="启动 exe"
                      title="启动 exe"
                      loading={launchingExeId === "active-output"}
                      disabled={!activeProject.outputExePath || Boolean(launchingExeId)}
                      onClick={() => void launchActiveOutputExecutable()}
                    >
                      <Play aria-hidden className="size-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      className="size-7 shrink-0"
                      data-builder-open-output-bundle=""
                      aria-label="打开安装包"
                      title="打开安装包"
                      disabled={!activeBundlePath}
                      onClick={() => void openLocalArtifact(activeBundlePath)}
                    >
                      <Box aria-hidden className="size-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="size-7 shrink-0"
                      data-builder-open-output-dir=""
                      aria-label="打开 exe 目录"
                      title="打开 exe 目录"
                      disabled={!activeBuildOutputDir}
                      onClick={() => void openLocalArtifact(activeBuildOutputDir)}
                    >
                      <FolderOpen aria-hidden className="size-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="size-7 shrink-0"
                      data-builder-open-bundle-dir=""
                      aria-label="打开安装包目录"
                      title="打开安装包目录"
                      disabled={!activeBundleDir}
                      onClick={() => void openLocalArtifact(activeBundleDir)}
                    >
                      <FolderOpen aria-hidden className="size-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="size-7 shrink-0"
                      data-builder-open-bundle-manifest=""
                      aria-label="打开安装包 Manifest"
                      title="打开安装包 Manifest"
                      disabled={!activeBundleManifestPath}
                      onClick={() => void openLocalArtifact(activeBundleManifestPath)}
                    >
                      <FileJson aria-hidden className="size-3.5" />
                    </Button>
                  </div>
                  {latestRunSessionEntry ? (
                    <div className="rounded-md border border-outline-variant bg-surface-container px-2 py-2" data-builder-run-session-panel="">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium">运行会话</p>
                          <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface-variant">
                            pid {latestRunSessionEntry.launchedPid} · {latestRunSessionEntry.runStatus ?? "已启动"}
                          </p>
                        </div>
                        <StateLabel
                          showQuiet
                          variant={latestRunSessionEntry.runStatus === "running" ? "secondary" : "outline"}
                          label={latestRunSessionEntry.runStatus ?? "未知"}
                        />
                      </div>
                      <p className="mt-2 line-clamp-2 text-[0.68rem] leading-4 text-on-surface-variant">
                        {latestRunSessionEntry.runSummary || latestRunSessionEntry.launchSummary}
                      </p>
                      {latestRunSessionEntry.runtimeLogPath ? (
                        <p className="mt-2 break-all font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                          {latestRunSessionEntry.runtimeLogPath}
                        </p>
                      ) : null}
                      <div className="mt-2 grid grid-cols-4 gap-1.5">
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
                      <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap rounded-md bg-surface-container-high p-2 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                        {latestRunSessionEntry.runtimeLogPreview || "启动生成的 exe 后会显示运行时控制台。"}
                      </pre>
                    </div>
                  ) : null}
                </div>
                <details
                  className="group rounded-md border border-outline-variant/60 bg-transparent px-1 py-0.5 transition-colors hover:bg-surface-container"
                  data-builder-build-sidebar-section-density="thin-outline-row"
                  data-builder-release-settings-shortcut=""
                  data-builder-release-settings-shortcut-density="collapsed-summary"
                  data-builder-release-settings-shortcut-state="collapsed-default"
                >
                  <summary
                    className="focus-ring flex min-h-7 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-1.5 text-xs transition-colors hover:bg-surface-container-high [&::-webkit-details-marker]:hidden"
                    data-builder-build-sidebar-section-summary="one-line"
                    data-builder-release-settings-shortcut-summary="single-row"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-medium text-on-surface">项目设置</h3>
                        <p className="sr-only">Release config 由 Project Dock 管理，展开查看当前目标。</p>
                      </div>
                    </div>
                    {/* A version is a value, not a state. */}
                    <span className="shrink-0 font-mono text-[0.68rem] text-on-surface">
                      {normalizeReleaseVersion(activeProject.releaseConfig.version)}
                    </span>
                  </summary>
                  <div className="mt-2 border-t border-outline-variant pt-2" data-builder-release-settings-shortcut-details="deferred">
                    <div className="rounded-md bg-surface-container-low px-2 py-1.5 text-xs" data-builder-release-settings-shortcut-fields="compact-property-list">
                      <PathRow label="应用" value={activeProject.releaseConfig.appName} />
                      <PathRow label="应用标识" value={activeProject.releaseConfig.bundleIdentifier} />
                      <PathRow
                        label="窗口"
                        value={`${releaseWindowKinds.find((kind: any) => kind.value === activeProject.releaseConfig.windowKind)?.label ?? activeProject.releaseConfig.windowKind} / ${
                          releaseTitlebarStyles.find((style: any) => style.value === activeProject.releaseConfig.titlebarStyle)?.label ?? activeProject.releaseConfig.titlebarStyle
                        }`}
                      />
                      <PathRow label="目标" value={activeProject.releaseConfig.bundleTargets} />
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2 h-8 w-full"
                      data-builder-open-project-release-settings=""
                      onClick={() => {
                        setMode("project");
                        setLeftDockTab("project");
                      }}
                    >
                      <Settings2 aria-hidden className="size-4" />
                      打开项目设置
                    </Button>
                  </div>
                </details>
                <section className="hidden" data-builder-release-config="">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">发布配置</h3>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">写入目标 app 的 package、Cargo 和 Tauri 配置。</p>
                    </div>
                    <span className="text-[0.68rem] text-on-surface-variant">发布</span>
                  </div>
                  <Field label="应用名称">
                    <Input
                      inputSize="sm"
                      data-builder-release-app-name=""
                      value={activeProject.releaseConfig.appName}
                      onChange={(event: any) => updateReleaseConfig({ appName: event.target.value })}
                    />
                  </Field>
                  <Field label="Bundle 标识符">
                    <Input
                      inputSize="sm"
                      data-builder-release-identifier=""
                      value={activeProject.releaseConfig.bundleIdentifier}
                      spellCheck={false}
                      className="font-mono text-xs"
                      onChange={(event: any) => updateReleaseConfig({ bundleIdentifier: event.target.value })}
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
                        onChange={(event: any) => updateReleaseConfig({ version: event.target.value })}
                      />
                    </Field>
                    <Field label="窗口标题">
                      <Input
                        inputSize="sm"
                        data-builder-release-window-title=""
                        value={activeProject.releaseConfig.windowTitle}
                        onChange={(event: any) => updateReleaseConfig({ windowTitle: event.target.value })}
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
                      {(["patch", "minor", "major"] as const).map((bump: any) => (
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
                  <Field label="发布说明">
                    <Textarea
                      data-builder-release-notes=""
                      value={activeProject.releaseConfig.releaseNotes}
                      onChange={(event: any) => updateReleaseConfig({ releaseNotes: event.target.value })}
                      className="min-h-[112px] resize-none font-mono text-xs leading-5"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="安装包目标">
                      <Select
                        value={activeProject.releaseConfig.bundleTargets}
                        onValueChange={(bundleTargets: any) => updateReleaseConfig({ bundleTargets: bundleTargets as ReleaseBundleTarget })}
                      >
                        <SelectTrigger inputSize="sm" data-builder-release-targets="">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {releaseBundleTargets.map((target: any) => (
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
                        onValueChange={(iconAssetId: any) => updateReleaseConfig({ iconAssetId: iconAssetId === "__default" ? "" : iconAssetId })}
                      >
                        <SelectTrigger inputSize="sm" data-builder-release-icon="">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__default">默认图标</SelectItem>
                          {activeProject.assets.map((asset: any) => (
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
                      <StateLabel
                        showQuiet
                        variant={activeProject.releaseConfig.signingMode === "unsigned" ? "outline" : releaseSigningConfigured(activeProject.releaseConfig) ? "secondary" : "destructive"}
                        label={activeProject.releaseConfig.signingMode === "unsigned" ? "未签名" : releaseSigningConfigured(activeProject.releaseConfig) ? "就绪" : "缺失"}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="签名模式">
                        <Select
                          value={activeProject.releaseConfig.signingMode}
                          onValueChange={(signingMode: any) => updateReleaseConfig({ signingMode: signingMode as ReleaseSigningMode })}
                        >
                          <SelectTrigger inputSize="sm" data-builder-release-signing-mode="">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {releaseSigningModes.map((mode: any) => (
                              <SelectItem key={mode.value} value={mode.value}>
                                {mode.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Smoke 最小体积 KB">
                        <Input
                          inputSize="sm"
                          type="number"
                          min={0}
                          data-builder-release-smoke-size=""
                          value={activeProject.releaseConfig.minimumArtifactSizeKb}
                          onChange={(event: any) =>
                            updateReleaseConfig({ minimumArtifactSizeKb: normalizeMinimumArtifactSizeKb(event.target.value) })
                          }
                        />
                      </Field>
                    </div>
                    {activeProject.releaseConfig.signingMode === "windows-certificate" ? (
                      <div className="space-y-3">
                        <Field label="证书 thumbprint">
                          <Input
                            inputSize="sm"
                            data-builder-release-cert-thumbprint=""
                            value={activeProject.releaseConfig.certificateThumbprint}
                            spellCheck={false}
                            className="font-mono text-xs"
                            onChange={(event: any) => {
                              setCertificateInspection(null);
                              updateReleaseConfig({ certificateThumbprint: event.target.value });
                            }}
                          />
                        </Field>
                        <div className="rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <Label className="text-xs font-medium">证书存储</Label>
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
                                <CountReadout
                                  label={
                                    certificateInspection.found
                                      ? `${certificateInspection.match_count} 个匹配`
                                      : "未找到"
                                  }
                                  count={certificateInspection.found ? certificateInspection.match_count : 0}
                                />
                                <span className="min-w-0 break-words">{certificateInspection.summary}</span>
                              </div>
                              {certificateInspection.entries.length > 0 ? (
                                <div className="mt-2 space-y-2">
                                  {certificateInspection.entries.slice(0, 3).map((entry: any) => (
                                    <div key={`${entry.store}-${entry.thumbprint}`} className="rounded-lg bg-surface-container px-2 py-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium">{entry.store}</span>
                                        <StateLabel
                                          showQuiet
                                          variant={entry.has_private_key ? "secondary" : "outline"}
                                          label={entry.has_private_key ? "含私钥" : "无私钥"}
                                        />
                                        {entry.not_after ? (
                                          <span className="text-on-surface-variant">到期 {validationTimeLabel(entry.not_after)}</span>
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
                            <Label className="text-xs text-on-surface-variant">证书文件</Label>
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
                            onChange={(event: any) => updateReleaseConfig({ certificateSourcePath: event.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="密码环境变量">
                            <Input
                              inputSize="sm"
                              data-builder-release-cert-password-env=""
                              value={activeProject.releaseConfig.certificatePasswordEnvVar}
                              spellCheck={false}
                              className="font-mono text-xs"
                              onChange={(event: any) => updateReleaseConfig({ certificatePasswordEnvVar: event.target.value })}
                            />
                          </Field>
                          <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2">
                            <div className="min-w-0">
                              <Label className="text-xs font-medium">导入 PFX</Label>
                              <p className="mt-1 text-[0.68rem] leading-4 text-on-surface-variant">构建前导入到 CurrentUser\\My。</p>
                            </div>
                            <Switch
                              checked={activeProject.releaseConfig.importCertificateBeforeBuild}
                              onCheckedChange={(importCertificateBeforeBuild: any) => updateReleaseConfig({ importCertificateBeforeBuild })}
                            />
                          </div>
                        </div>
                        <p className="rounded-xl bg-surface-container-low px-3 py-2 text-[0.68rem] leading-4 text-on-surface-variant">
                          证书密码不会保存到项目；构建时只读取系统环境变量 {activeProject.releaseConfig.certificatePasswordEnvVar || "NOVA_SIGNING_CERT_PASSWORD"}。
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="摘要算法">
                            <Select
                              value={activeProject.releaseConfig.digestAlgorithm}
                              onValueChange={(digestAlgorithm: any) => updateReleaseConfig({ digestAlgorithm })}
                            >
                              <SelectTrigger inputSize="sm" data-builder-release-digest="">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {releaseDigestAlgorithms.map((algorithm: any) => (
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
                              onCheckedChange={(timestampTsp: any) => updateReleaseConfig({ timestampTsp })}
                            />
                          </div>
                        </div>
                        <Field label="时间戳 URL">
                          <Input
                            inputSize="sm"
                            data-builder-release-timestamp-url=""
                            value={activeProject.releaseConfig.timestampUrl}
                            spellCheck={false}
                            className="font-mono text-xs"
                            onChange={(event: any) => updateReleaseConfig({ timestampUrl: event.target.value })}
                          />
                        </Field>
                      </div>
                    ) : null}
                    {activeProject.releaseConfig.signingMode === "custom-command" ? (
                      <Field label="签名命令">
                        <Textarea
                          data-builder-release-sign-command=""
                          value={activeProject.releaseConfig.signCommand}
                          onChange={(event: any) => updateReleaseConfig({ signCommand: event.target.value })}
                          placeholder="signtool sign /fd SHA256 /a /tr http://timestamp.digicert.com %1"
                          className="min-h-[72px] resize-none font-mono text-xs leading-5"
                        />
                      </Field>
                    ) : null}
                    <Field label="安装包 smoke">
                      <Select
                        value={activeProject.releaseConfig.installerSmokeMode}
                        onValueChange={(installerSmokeMode: any) => updateReleaseConfig({ installerSmokeMode: installerSmokeMode as ReleaseInstallerSmokeMode })}
                      >
                        <SelectTrigger inputSize="sm" data-builder-release-installer-smoke="">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {releaseInstallerSmokeModes.map((mode: any) => (
                            <SelectItem key={mode.value} value={mode.value}>
                              {mode.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Smoke 运行器">
                      <Select
                        value={activeProject.releaseConfig.installerSmokeRunnerMode}
                        onValueChange={(installerSmokeRunnerMode: any) => updateReleaseConfig({ installerSmokeRunnerMode: installerSmokeRunnerMode as ReleaseInstallerSmokeRunnerMode })}
                      >
                        <SelectTrigger inputSize="sm" data-builder-release-installer-smoke-runner="">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {releaseInstallerSmokeRunnerModes.map((mode: any) => (
                            <SelectItem key={mode.value} value={mode.value}>
                              {mode.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    {activeProject.releaseConfig.installerSmokeRunnerMode === "vm-handoff" ? (
                      <>
                        <Field label="虚拟机名称">
                          <Input
                            inputSize="sm"
                            value={activeProject.releaseConfig.installerSmokeVmName}
                            data-builder-release-installer-smoke-vm-name=""
                            onChange={(event: any) => updateReleaseConfig({ installerSmokeVmName: event.target.value })}
                          />
                        </Field>
                        <Field label="共享目录">
                          <Input
                            inputSize="sm"
                            value={activeProject.releaseConfig.installerSmokeVmSharedFolder}
                            data-builder-release-installer-smoke-vm-shared-folder=""
                            placeholder="C:\\NovaSmoke or \\\\vm\\NovaSmoke"
                            className="font-mono text-xs"
                            onChange={(event: any) => updateReleaseConfig({ installerSmokeVmSharedFolder: event.target.value })}
                          />
                        </Field>
                        <Field label="虚拟机备注" className="col-span-2">
                          <Textarea
                            value={activeProject.releaseConfig.installerSmokeVmNotes}
                            data-builder-release-installer-smoke-vm-notes=""
                            placeholder="快照名、访客用户、runner 预期或结果返回约定。"
                            className="min-h-[70px] resize-none text-xs leading-5"
                            onChange={(event: any) => updateReleaseConfig({ installerSmokeVmNotes: event.target.value })}
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
                        onChange={(event: any) =>
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
                        onChange={(event: any) =>
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
                        onChange={(event: any) =>
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
                        onChange={(event: any) =>
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
                    <Switch checked={activeProject.releaseConfig.resizable} onCheckedChange={(resizable: any) => updateReleaseConfig({ resizable })} />
                  </div>
                </section>
                {buildError ? (
                  <div className="rounded-[18px] border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    {buildError}
                  </div>
                ) : null}
                <details
                  className="group rounded-md border border-outline-variant/60 bg-transparent px-1 py-0.5 transition-colors hover:bg-surface-container"
                  data-builder-build-sidebar-section-density="thin-outline-row"
                  data-builder-build-target-dock=""
                  data-builder-build-target-dock-density="collapsed-summary"
                  data-builder-build-target-dock-state="collapsed-default"
                >
                  <summary
                    className="focus-ring flex min-h-7 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-1.5 text-xs transition-colors hover:bg-surface-container-high [&::-webkit-details-marker]:hidden"
                    data-builder-build-sidebar-section-summary="one-line"
                    data-builder-build-target-dock-summary="single-row"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-medium text-on-surface">生成目标</h3>
                        <p className="sr-only">
                          {latestGeneratedFileSummary
                            ? `${latestGeneratedFileSummary.total_count} 目标 · ${latestGeneratedFileSummary.changed_count} 变更`
                            : `${buildReadinessSummary.score}% 就绪 · 展开查看增量和修复计划`}
                        </p>
                      </div>
                    </div>
                    {/* A score is a readout; the error/warning counts below
                        carry the severity. Matches the sibling score readouts. */}
                    <span
                      className={cn(
                        "shrink-0 font-mono text-[0.72rem] tabular-nums",
                        buildReadinessSummary.errorCount > 0
                          ? "text-destructive"
                          : buildReadinessSummary.warningCount > 0
                            ? "text-on-surface-variant"
                            : "text-primary",
                      )}
                    >
                      {buildReadinessSummary.score}%
                    </span>
                  </summary>
                  <div className="mt-2 space-y-2 border-t border-outline-variant pt-2" data-builder-build-target-dock-details="deferred">
                    <section
                      className="rounded-lg bg-surface-container-low px-2 py-2"
                      data-builder-generated-incremental-summary=""
                      data-builder-generated-incremental-summary-density="compact-property-strip"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">生成目标</h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">
                            {latestGeneratedFileSummary
                              ? latestGeneratedFileSummary.summary
                              : "运行检查、构建或安装包任务后显示本次生成目标变更。未变化的文件不会重写，以保留 Vite/Cargo 增量缓存。"}
                          </p>
                        </div>
                        <StateBadge
                          label={latestGeneratedFileSummary ? `${latestGeneratedFileSummary.changed_count} 个变更` : "待生成"}
                          signal={!latestGeneratedFileSummary || latestGeneratedFileSummary.changed_count > 0}
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                        <div className="rounded-lg bg-surface-container-high px-2 py-1.5">
                          <p className="font-medium text-on-surface">{latestGeneratedFileSummary?.total_count ?? 0}</p>
                          <p className="mt-0.5 text-[0.68rem] text-on-surface-variant">目标</p>
                        </div>
                        <div className="rounded-lg bg-surface-container-high px-2 py-1.5">
                          <p className="font-medium text-primary">{latestGeneratedFileSummary?.created_count ?? 0}</p>
                          <p className="mt-0.5 text-[0.68rem] text-on-surface-variant">新增</p>
                        </div>
                        <div className="rounded-lg bg-surface-container-high px-2 py-1.5">
                          <p className="font-medium text-on-surface">{latestGeneratedFileSummary?.updated_count ?? 0}</p>
                          <p className="mt-0.5 text-[0.68rem] text-on-surface-variant">更新</p>
                        </div>
                        <div className="rounded-lg bg-surface-container-high px-2 py-1.5">
                          <p className="font-medium text-on-surface-variant">{latestGeneratedFileSummary?.unchanged_count ?? 0}</p>
                          <p className="mt-0.5 text-[0.68rem] text-on-surface-variant">未变化</p>
                        </div>
                      </div>
                    </section>
                                  <ProjectHealthPanel
                    fileCount={activeProject.files.length}
                    hasRustLogic={Boolean(activeProject.rustLogic?.trim())}
                    hasCommands={activeProject.rustCommands.length > 0}
                    gitStatus={projectGitStatus}
                    onGitSnapshot={() => {
                      void invokeIfAvailable("init_project_git", {
                        rootPath: activeProject.rootPath ?? "",
                      }).then((result: any) => {
                        showProjectJumpFeedback(
                          result?.ok ? "success" : "error",
                          result?.ok ? "Git 快照完成" : "Git 快照失败",
                          result?.ok ? "项目已提交到本地仓库" : "需要 Tauri 桌面运行时且项目已有磁盘路径",
                        );
                      });
                    }}
                    onRunCheck={() => {
                      const issues: string[] = [];
                      const warnings: string[] = [];
                      if (!activeProject.files.length) issues.push("没有 UI 文件");
                      if (!activeProject.rustLogic?.trim()) warnings.push("rust/logic.rs 为空");
                      if (!activeProject.rustCommands.length) warnings.push("尚未定义 Rust 命令");
                      const ok = issues.length === 0;
                      showProjectJumpFeedback(
                        ok ? "success" : "error",
                        ok ? "健康检查通过" : "健康检查发现问题",
                        ok
                          ? warnings.length
                            ? "项目可用。提示：" + warnings.join("；")
                            : "项目结构完整，可生成并构建。"
                          : issues.join("；"),
                      );
                    }}
                  />
                    <section
                      className="rounded-md bg-surface-container-low px-2 py-1.5"
                      data-builder-readiness=""
                      data-builder-readiness-density="compact-issue-list"
                    >
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-primary">
                            <ListChecks aria-hidden className="size-3.5" />
                          </span>
                          <div className="min-w-0">
                            <h3 className="truncate text-xs font-medium text-on-surface">构建就绪度</h3>
                            <p className="truncate text-[0.66rem] leading-3 text-on-surface-variant">结构 / Rust / 事件 / 资源</p>
                          </div>
                        </div>
                        <span className="flex shrink-0 items-center gap-1.5">
                          {/* The Progress bar below carries the shape; this is the
                              number it cannot say. The error/warning counts are
                              not repeated here — the strip underneath already
                              states them, in a form the reader can scan. */}
                          <span
                            className={cn(
                              "font-mono text-[0.72rem] tabular-nums",
                              buildReadinessSummary.errorCount > 0
                                ? "text-destructive"
                                : buildReadinessSummary.warningCount > 0
                                  ? "text-on-surface-variant"
                                  : "text-primary",
                            )}
                          >
                            {buildReadinessSummary.score}%
                          </span>
                        </span>
                      </div>
                      <Progress value={buildReadinessSummary.score} className="mt-1.5 h-1" />
                      <div
                        className="mt-2 grid grid-cols-3 gap-1 text-center text-[0.66rem]"
                        data-builder-readiness-summary-strip="inline-counts"
                        data-builder-readiness-a11y="disclosure-summary"
                      >
                        {/* Problems are signals; "N 就绪" is a tally to read. */}
                        <StateBadge
                          variant="destructive"
                          label={`${buildReadinessSummary.errorCount} 错误`}
                          signal={buildReadinessSummary.errorCount > 0}
                        />
                        <StateBadge
                          variant="outline"
                          label={`${buildReadinessSummary.warningCount} 警告`}
                          signal={buildReadinessSummary.warningCount > 0}
                        />
                        <CountReadout label={`${buildReadinessSummary.readyCount} 就绪`} count={buildReadinessSummary.readyCount} />
                      </div>
                      <details
                        className="group mt-2 rounded-md border border-outline-variant/70 bg-surface-container-high px-1.5 py-1"
                        data-builder-property-repair-plan=""
                        data-builder-property-repair-plan-density="collapsed-summary"
                      >
                        <summary
                          className="focus-ring flex min-h-7 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-1 text-xs transition hover:bg-surface-container [&::-webkit-details-marker]:hidden"
                          data-builder-property-repair-plan-summary="single-row"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                            <span className="truncate font-medium text-on-surface">属性修复计划</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-1.5 text-[0.66rem] text-on-surface-variant">
                            <span>{projectPropertyAutoFixSummary.issueCount > 0 ? `${projectPropertyAutoFixSummary.issueCount} 项` : "无问题"}</span>
                            <StateBadge
                              variant={projectPropertyAutoFixSummary.targets.length > 0 ? "outline" : "secondary"}
                              label={`${projectPropertyAutoFixSummary.targets.length} 控件`}
                              signal={!isQuietCount(projectPropertyAutoFixSummary.targets.length)}
                            />
                          </span>
                        </summary>
                        <div
                          className="mt-2 space-y-2 border-t border-outline-variant pt-2"
                          data-builder-property-repair-plan-details="deferred"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="min-w-0 text-xs leading-5 text-on-surface-variant">
                              {projectPropertyAutoFixSummary.issueCount > 0
                                ? `${projectPropertyAutoFixSummary.errorCount} 个错误，${projectPropertyAutoFixSummary.warningCount} 个警告。可安全修复 ${projectPropertyAutoFixSummary.propertyCount} 个属性。`
                                : "项目内控件属性 schema 暂无问题。"}
                            </p>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={projectPropertyAutoFixSummary.targets.length === 0}
                              data-builder-apply-project-property-fixes=""
                              onClick={applyProjectPropertyAutoFixes}
                            >
                              <Wand2 aria-hidden className="size-4" />
                              修复
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-center text-[0.66rem]">
                            <CountReadout label={`${projectPropertyAutoFixSummary.fileCount} 文件`} count={projectPropertyAutoFixSummary.fileCount} />
                            <CountReadout label={`${projectPropertyAutoFixSummary.targets.length} 控件`} count={projectPropertyAutoFixSummary.targets.length} className="text-primary" />
                            <CountReadout label={`${projectPropertyAutoFixSummary.manualIssueCount} 手动`} count={projectPropertyAutoFixSummary.manualIssueCount} />
                          </div>
                          {projectPropertyAutoFixSummary.targets.length > 0 ? (
                            <div className="space-y-1">
                              {projectPropertyAutoFixSummary.targets.slice(0, 3).map((target: any) => (
                                <button
                                  key={`${target.fileId}-${target.itemId}`}
                                  type="button"
                                  className="focus-ring flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-md bg-surface-container-low px-2 text-left text-xs transition hover:bg-surface-container"
                                  onClick={() =>
                                    focusBuildReadinessItem({
                                      id: `property-repair-${target.fileId}-${target.itemId}`,
                                      severity: "warning",
                                      title: "属性修复",
                                      detail: "",
                                      fileId: target.fileId,
                                      fileName: target.fileName,
                                      itemId: target.itemId,
                                      itemName: target.itemName,
                                    })
                                  }
                                >
                                  <span className="min-w-0 truncate">
                                    <span className="font-medium text-on-surface">{target.itemName}</span>
                                    <span className="ml-1 text-on-surface-variant">
                                      {target.fileName} · {target.itemType} · {target.propertyCount} 项
                                    </span>
                                  </span>
                                  <MousePointer2 aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                                </button>
                              ))}
                              {projectPropertyAutoFixSummary.targets.length > 3 ? (
                                <p className="text-[0.68rem] text-on-surface-variant">另有 {projectPropertyAutoFixSummary.targets.length - 3} 个控件会在批量修复中处理。</p>
                              ) : null}
                            </div>
                          ) : null}
                          {activeProject.maintenanceHistory?.length ? (
                            <div className="space-y-1 border-t border-outline-variant pt-2" data-builder-maintenance-history="">
                              <div className="flex items-center justify-between gap-3">
                                <h5 className="text-xs font-medium text-on-surface">修复历史</h5>
                                <CountReadout label={`${activeProject.maintenanceHistory.length} 项`} count={activeProject.maintenanceHistory.length} />
                              </div>
                              {activeProject.maintenanceHistory.slice(0, 4).map((entry: any) => (
                                <div key={entry.id} className="rounded-md bg-surface-container-low px-2 py-1.5 text-xs">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="min-w-0 truncate font-medium text-on-surface">{entry.title}</span>
                                    <StateLabel showQuiet variant={entry.status === "partial" ? "outline" : "secondary"} label={entry.status} />
                                  </div>
                                  <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                                    {validationTimeLabel(entry.createdAt)} · {entry.fileCount} 文件 · {entry.itemCount} 控件 · {entry.propertyCount} 属性
                                  </p>
                                  {entry.changes.length ? (
                                    <div className="mt-1 space-y-1">
                                      {entry.changes.slice(0, 3).map((change: any) => (
                                        <button
                                          key={`${entry.id}-${change.fileId}-${change.itemId}`}
                                          type="button"
                                          className="focus-ring flex h-7 w-full min-w-0 items-center justify-between gap-2 rounded-md bg-surface-container-high px-2 text-left text-[0.68rem] transition hover:bg-surface-container"
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
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </details>
                      <div
                        className="subtle-scrollbar mt-2 max-h-56 space-y-1 overflow-auto pr-1"
                        data-builder-readiness-list=""
                        data-builder-readiness-list-density="thin-rows"
                      >
                        {buildReadinessSummary.items.map((item: any) => {
                          const isActionableReadinessItem = item.severity !== "ready" || Boolean(item.fileId);
                          const severityIcon =
                            item.severity === "ready" ? (
                              <CheckCircle2 aria-hidden className="size-3.5 shrink-0 text-primary" />
                            ) : (
                              <AlertTriangle
                                aria-hidden
                                className={cn("size-3.5 shrink-0", item.severity === "error" ? "text-destructive" : "text-on-surface-variant")}
                              />
                            );
                          const rowClassName =
                            "flex min-h-8 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-outline-variant/70 bg-surface-container-high px-2 py-1 text-left text-xs";
                          const rowBody = (
                            <>
                              <span className="flex min-w-0 items-center gap-2">
                                {severityIcon}
                                <span className="min-w-0">
                                  <span className="block truncate font-medium text-on-surface">{item.title}</span>
                                  <span className="block truncate text-[0.66rem] leading-3 text-on-surface-variant">
                                    {item.fileName ? `${item.fileName} · ${item.detail}` : item.detail}
                                  </span>
                                </span>
                              </span>
                              <span className="flex shrink-0 items-center gap-1.5">
                                {/* The icon on the left already carries severity.
                                    The word is a column value — readable text, and
                                    only an error earns a pill on top. */}
                                <StateLabel
                                  showQuiet
                                  variant={item.severity === "error" ? "destructive" : item.severity === "warning" ? "outline" : "secondary"}
                                  label={buildReadinessSeverityLabel(item.severity)}
                                />
                                {isActionableReadinessItem ? (
                                  <span className="hidden text-[0.66rem] text-on-surface-variant 2xl:inline">
                                    {buildReadinessActionLabel(item)}
                                  </span>
                                ) : null}
                              </span>
                            </>
                          );

                          return isActionableReadinessItem ? (
                            <button
                              key={item.id}
                              type="button"
                              className={cn("focus-ring transition hover:bg-surface-container", rowClassName)}
                              data-builder-focus-readiness={item.id}
                              data-builder-readiness-row-density="thin-row"
                              aria-label={`${buildReadinessActionLabel(item)} ${item.title}`}
                              onClick={() => openBuildReadinessItem(item)}
                            >
                              {rowBody}
                            </button>
                          ) : (
                            <div key={item.id} className={rowClassName} data-builder-readiness-row-density="thin-row">
                              {rowBody}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </div>
                </details>
                <details
                  className="group rounded-md border border-outline-variant/60 bg-transparent px-1 py-0.5 transition-colors hover:bg-surface-container"
                  data-builder-build-sidebar-section-density="thin-outline-row"
                  data-builder-build-quality-dock=""
                  data-builder-build-quality-dock-density="collapsed-summary"
                  data-builder-build-quality-dock-state="collapsed-default"
                >
                  <summary
                    className="focus-ring flex min-h-7 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-1.5 text-xs transition-colors hover:bg-surface-container-high [&::-webkit-details-marker]:hidden"
                    data-builder-build-sidebar-section-summary="one-line"
                    data-builder-build-quality-dock-summary="single-row"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-medium text-on-surface">诊断 / 体验审计</h3>
                        <p className="sr-only">
                          {buildDiagnostics.length > 0
                            ? `${buildDiagnostics.length} 个构建诊断`
                            : `${editorExperienceAuditStats.score}% 审计评分 · ${editorExperienceAuditStats.warningCount} 提醒`}
                        </p>
                      </div>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <StateBadge
                        variant={buildDiagnostics.length > 0 ? "destructive" : "secondary"}
                        label={`${buildDiagnostics.length} 诊断`}
                        signal={!isQuietCount(buildDiagnostics.length)}
                      />
                      <StateBadge
                        variant={
                          editorExperienceAuditStats.failCount > 0
                            ? "destructive"
                            : editorExperienceAuditStats.warningCount > 0
                              ? "outline"
                              : "secondary"
                        }
                        label={editorExperienceAuditStatusLabel}
                        signal={editorExperienceAuditStats.failCount > 0 || editorExperienceAuditStats.warningCount > 0}
                      />
                    </span>
                  </summary>
                  <div className="mt-2 space-y-2 border-t border-outline-variant pt-2" data-builder-build-quality-dock-details="deferred">
                <section className="rounded-[18px] bg-surface-container-low p-2.5" data-builder-build-diagnostics-panel="">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">诊断</h3>
                    <StateBadge
                      variant={buildDiagnostics.length > 0 ? "destructive" : "secondary"}
                      label={String(buildDiagnostics.length)}
                      signal={!isQuietCount(buildDiagnostics.length)}
                    />
                  </div>
                  {buildDiagnostics.length === 0 ? (
                    <p className="text-xs leading-5 text-on-surface-variant">暂无 Rust/Cargo 诊断。构建失败时会解析错误位置。</p>
                  ) : (
                    <div className="max-h-40 space-y-2 overflow-auto pr-1">
                      {buildDiagnostics.map((diagnostic: any, index: any) => {
                        const canFocusDiagnostic = isEditableRustDiagnostic(diagnostic);
                        return (
                          <article key={`${diagnostic.message}-${index}`} className="rounded-2xl border border-outline-variant bg-surface-container-high p-3 text-xs">
                            <div className="mb-1 flex items-start justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <StateLabel showQuiet variant={diagnostic.severity === "error" ? "destructive" : "outline"} label={buildDiagnosticSeverityLabel(diagnostic.severity)} />
                                {diagnostic.code ? <span className="font-mono text-[0.66rem] text-on-surface-variant">{diagnostic.code}</span> : null}
                                {diagnostic.origin ? <span className="text-[0.66rem] text-on-surface-variant">{diagnostic.origin}</span> : null}
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
                <section
                  className="rounded-[18px] bg-surface-container-low p-2.5"
                  data-builder-experience-audit-panel=""
                  data-builder-experience-audit-state={editorExperienceAuditState}
                >
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">体验审计</h3>
                        <StateLabel
                          showQuiet
                          variant={
                            editorExperienceAuditStats.failCount > 0
                              ? "destructive"
                              : editorExperienceAuditStats.warningCount > 0
                                ? "outline"
                                : "secondary"
                          }
                          label={editorExperienceAuditStatusLabel}
                        />
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">
                        对齐桌面编辑器工作流：选择、多选、Dock、窗口壳、Rust 逻辑、项目树、运行区和控件覆盖。
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        data-builder-run-experience-audit=""
                        loading={runningProjectTask?.actionId === "audit-editor-experience"}
                        disabled={Boolean(checkingTarget) || building || bundling || validatingWindow}
                        onClick={() => enqueueProjectTask("audit-editor-experience")}
                      >
                        <Wand2 aria-hidden className="size-4" />
                        运行审计
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-builder-open-experience-audit-tasks=""
                        onClick={() => openRelevantTaskDock(latestEditorExperienceAuditTask, false)}
                      >
                        <ClipboardCopy aria-hidden className="size-4" />
                        任务
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs" data-builder-experience-audit-summary="">
                    <div className="rounded-2xl bg-surface-container-high p-2">
                      <p className="font-medium text-on-surface">{editorExperienceAuditStats.score}%</p>
                      <p className="mt-1 text-[0.68rem] text-on-surface-variant">评分</p>
                    </div>
                    <div className="rounded-2xl bg-surface-container-high p-2">
                      <p className="font-medium text-primary">{editorExperienceAuditStats.passCount}</p>
                      <p className="mt-1 text-[0.68rem] text-on-surface-variant">通过</p>
                    </div>
                    <div className="rounded-2xl bg-surface-container-high p-2">
                      <p className="font-medium text-on-surface">{editorExperienceAuditStats.warningCount}</p>
                      <p className="mt-1 text-[0.68rem] text-on-surface-variant">提醒</p>
                    </div>
                    <div className="rounded-2xl bg-surface-container-high p-2">
                      <p className="font-medium text-destructive">{editorExperienceAuditStats.failCount}</p>
                      <p className="mt-1 text-[0.68rem] text-on-surface-variant">阻塞</p>
                    </div>
                  </div>
                  <div
                    className="mt-3 rounded-2xl border border-outline-variant bg-surface-container-high p-3"
                    data-builder-qt-creator-parity-panel=""
                    data-builder-qt-creator-parity-total={qtCreatorParityStats.total}
                    data-builder-qt-creator-parity-score={qtCreatorParityStats.score}
                  >
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Qt Creator 对齐矩阵</h4>
                          <span className="font-mono text-[0.72rem] tabular-nums text-on-surface">
                            {qtCreatorParityStats.score}%
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">
                          把最初 19 条问题逐条映射到当前可验证的编辑器能力，便于继续发现真正薄弱的地方。
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center text-[0.68rem]">
                        <span className="rounded-full bg-surface-container-low px-2 py-1 text-primary">{qtCreatorParityStats.passCount} 通过</span>
                        <span className="rounded-full bg-surface-container-low px-2 py-1 text-on-surface-variant">{qtCreatorParityStats.warningCount} 复核</span>
                        <span className="rounded-full bg-surface-container-low px-2 py-1 text-destructive">{qtCreatorParityStats.failCount} 阻塞</span>
                      </div>
                    </div>
                    <div className="max-h-80 space-y-2 overflow-auto pr-1" data-builder-qt-creator-parity-list="">
                      {qtCreatorParityItems.map((item: any) => (
                        <article
                          key={item.requirement}
                          className="grid min-w-0 gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-2 text-xs md:grid-cols-[2.5rem_minmax(0,0.75fr)_minmax(0,1.25fr)]"
                          data-builder-qt-creator-parity-item={item.requirement}
                          data-builder-qt-creator-parity-state={item.severity}
                        >
                          <div className="flex items-start gap-2 md:block">
                            <span
                              className={cn(
                                "inline-flex size-8 shrink-0 items-center justify-center rounded-xl text-[0.68rem] font-semibold",
                                item.severity === "pass" ? "bg-primary-container text-primary" : item.severity === "fail" ? "bg-destructive text-destructive-foreground" : "bg-surface-container-high text-on-surface-variant",
                              )}
                              data-builder-qt-creator-parity-requirement={item.requirement}
                            >
                              {item.requirement}
                            </span>
                            <StateLabel
                              showQuiet
                              className="md:mt-2"
                              variant={editorExperienceAuditBadgeVariant(item.severity)}
                              label={editorExperienceAuditSeverityLabel(item.severity)}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-on-surface">{item.title}</p>
                            <p className="mt-1 line-clamp-2 leading-5 text-on-surface-variant">{item.detail}</p>
                          </div>
                          <div className="flex min-w-0 flex-wrap content-start gap-1.5" data-builder-qt-creator-parity-evidence="">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 shrink-0 px-2 text-[0.68rem]"
                              data-builder-qt-creator-parity-open={item.requirement}
                              onClick={() => openQtCreatorParityRequirement(item)}
                            >
                              查看
                            </Button>
                            {item.evidenceIds.map((id: any) => {
                              const evidence = editorExperienceAuditItems.find((auditItem: any) => auditItem.id === id);
                              return (
                                <button
                                  type="button"
                                  key={`${item.requirement}-${id}`}
                                  className={cn(
                                    "focus-ring max-w-full truncate rounded-full border px-2 py-1 text-left font-mono text-[0.62rem] transition hover:border-outline hover:bg-surface-container-high",
                                    evidence?.severity === "pass"
                                      ? "border-primary/25 bg-primary-container/50 text-primary"
                                      : evidence?.severity === "fail"
                                        ? "border-destructive/35 bg-destructive/10 text-destructive"
                                        : "border-outline-variant bg-surface-container text-on-surface-variant",
                                  )}
                                  data-builder-qt-creator-parity-evidence-id={id}
                                  data-builder-qt-creator-parity-evidence-open={id}
                                  title={evidence ? `${evidence.title} · ${evidence.detail}` : id}
                                  onClick={() => focusEditorExperienceAuditEvidence(id)}
                                >
                                  {id}
                                </button>
                              );
                            })}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                  <div
                    className="mt-3 rounded-2xl border border-outline-variant bg-surface-container-high p-3"
                    data-builder-experience-audit-detail-panel=""
                    data-builder-experience-audit-filter={editorExperienceAuditFilter}
                    data-builder-experience-audit-filtered-count={filteredEditorExperienceAuditItems.length}
                  >
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <h4 className="truncate text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">审计详情</h4>
                        <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                          {filteredEditorExperienceAuditItems.length}/{editorExperienceAuditStats.total} 项 · 当前筛选 {editorExperienceAuditFilter === "all" ? "全部" : editorExperienceAuditSeverityLabel(editorExperienceAuditFilter)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1" data-builder-experience-audit-filter-controls="">
                        {([
                          ["all", "全部", editorExperienceAuditStats.total],
                          ["fail", "阻塞", editorExperienceAuditStats.failCount],
                          ["warning", "提醒", editorExperienceAuditStats.warningCount],
                          ["pass", "通过", editorExperienceAuditStats.passCount],
                        ] as const).map(([value, label, count]) => {
                          const active = editorExperienceAuditFilter === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              className={cn(
                                "focus-ring inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[0.68rem] transition",
                                active
                                  ? "border-primary bg-primary/10 text-on-surface"
                                  : "border-outline-variant bg-surface-container text-on-surface-variant hover:border-outline hover:text-on-surface",
                              )}
                              aria-pressed={active}
                              data-builder-experience-audit-filter-option={value}
                              onClick={() => setEditorExperienceAuditFilter(value)}
                            >
                              <span>{label}</span>
                              <span className="font-mono opacity-70">{count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid max-h-96 grid-cols-1 gap-2 overflow-auto pr-1 xl:grid-cols-2" data-builder-experience-audit-filtered-list="">
                      {filteredEditorExperienceAuditItems.map((item: any) => (
                        <article
                          key={item.id}
                          className="flex min-w-0 items-start gap-2 rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs"
                          data-builder-experience-audit-item={item.id}
                          data-builder-experience-audit-item-severity={item.severity}
                        >
                          {item.severity === "pass" ? (
                            <CheckCircle2 aria-hidden className="mt-0.5 size-3.5 shrink-0 text-primary" />
                          ) : (
                            <AlertTriangle
                              aria-hidden
                              className={cn("mt-0.5 size-3.5 shrink-0", item.severity === "fail" ? "text-destructive" : "text-on-surface-variant")}
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center justify-between gap-2">
                              <p className="truncate font-medium text-on-surface">{item.title}</p>
                              {/* Severity is a column value the icon already
                                  encodes. Only a blocker earns a pill; 23 "提醒"
                                  chips turned the audit list into a wall. */}
                              <StateLabel
                                showQuiet
                                className="shrink-0"
                                variant={editorExperienceAuditBadgeVariant(item.severity)}
                                label={editorExperienceAuditSeverityLabel(item.severity)}
                              />
                            </div>
                            <p className="mt-1 line-clamp-2 leading-5 text-on-surface-variant">{item.detail}</p>
                            <p className="mt-1 truncate font-mono text-[0.62rem] text-on-surface-variant">{item.id}</p>
                          </div>
                        </article>
                      ))}
                      {filteredEditorExperienceAuditItems.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-outline-variant px-3 py-6 text-center text-xs text-on-surface-variant" data-builder-experience-audit-empty="">
                          当前筛选没有审计项。
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-outline-variant bg-surface-container-high p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-on-surface">
                        {latestEditorExperienceAuditTask ? latestEditorExperienceAuditTask.title : "尚未运行体验审计"}
                      </p>
                      <p className="mt-1 line-clamp-2 text-on-surface-variant">
                        {latestEditorExperienceAuditTask
                          ? latestEditorExperienceAuditTask.summary ?? latestEditorExperienceAuditTask.detail
                          : "运行后会在任务中心写入完整日志，并把结果记录到项目依赖有效性缓存。"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {latestEditorExperienceAuditTask ? (
                        <StateLabel
                          showQuiet
                          variant={projectTaskStatusVariant(latestEditorExperienceAuditTask.status)}
                          label={projectTaskStatusLabel(latestEditorExperienceAuditTask.status)}
                        />
                      ) : (
                        <CountReadout label={`${editorExperienceAuditStats.total} 项`} count={editorExperienceAuditStats.total} />
                      )}
                      {latestEditorExperienceAuditTask ? (
                        <span className="text-[0.68rem] text-on-surface-variant">{projectTaskElapsedLabel(latestEditorExperienceAuditTask)}</span>
                      ) : null}
                    </div>
                  </div>
                </section>
                  </div>
                </details>
                <details
                  className="group rounded-md border border-outline-variant/60 bg-transparent px-1 py-0.5 transition-colors hover:bg-surface-container"
                  data-builder-build-sidebar-section-density="thin-outline-row"
                  data-builder-build-assist-dock=""
                  data-builder-build-assist-dock-density="collapsed-summary"
                  data-builder-build-assist-dock-state="collapsed-default"
                  data-builder-quick-checks=""
                  data-builder-build-page-deemphasized-actions=""
                >
                  <summary
                    className="focus-ring flex min-h-7 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-1.5 text-xs transition-colors hover:bg-surface-container-high [&::-webkit-details-marker]:hidden"
                    data-builder-build-sidebar-section-summary="one-line"
                    data-builder-build-assist-dock-summary="single-row"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-medium text-on-surface">构建辅助</h3>
                        <p className="sr-only">
                          {selectedRailActionPreset?.title ?? "未选择 preset"} · {railRunTargetLabel}
                        </p>
                      </div>
                    </div>
                    <StateBadge
                      label={checkingTarget ?? selectedRailActionPreset?.badge ?? "就绪"}
                      signal={Boolean(checkingTarget) || (Boolean(selectedRailActionPreset?.badge) && !isQuietStateLabel(String(selectedRailActionPreset?.badge ?? "")))}
                      className="shrink-0"
                      variant={checkingTarget ? "outline" : "secondary"}
                    />
                  </summary>
                  <div className="mt-2 border-t border-outline-variant pt-2" data-builder-build-assist-dock-details="deferred">
                    <section className="rounded-[18px] bg-surface-container-low p-2.5">
                      <p className="mb-2 text-xs leading-5 text-on-surface-variant">
                        左下 Run Kit 是构建、运行和停止的主入口；这里保留生成计划、体验审计和少量检查入口。
                      </p>
                      <div className="grid gap-2" data-builder-build-page-left-rail-handoff="" data-builder-build-page-run-owner="left-rail-primary">
                    <div className="grid min-w-0 gap-2 rounded-2xl border border-outline-variant bg-surface-container-high p-3 text-xs">
                      <div
                        className="flex items-center justify-between gap-2 rounded-xl bg-primary-container/70 px-2 py-1.5 text-primary-container-foreground sm:col-span-3"
                        data-builder-build-page-primary-run-owner=""
                      >
                        <span className="min-w-0 truncate font-medium">构建/运行主入口：左下 Run Kit</span>
                        <span className="shrink-0 rounded-full bg-surface/70 px-2 py-0.5 text-[0.62rem] text-on-surface-variant">Build 页只做配置</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[0.66rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">Kit preset</p>
                        <p className="mt-1 truncate font-medium text-on-surface">{selectedRailActionPreset?.title ?? "未选择 preset"}</p>
                        <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">{selectedRailActionPresetStepLabel}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[0.66rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">Run target</p>
                        <p className="mt-1 truncate font-medium text-on-surface">{railRunTargetLabel}</p>
                        <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">{railWindowTargetLabel}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[0.66rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">Queue</p>
                        <p className="mt-1 truncate font-medium text-on-surface">{railQueueSummaryLabel}</p>
                        <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">左下角运行、构建、停止和打开输出</p>
                      </div>
                    </div>
                    <div className="grid gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                      data-builder-build-page-focus-left-rail=""
                      onClick={focusLeftRunControls}
                    >
                      <MousePointer2 aria-hidden className="size-4" />
                      聚焦运行区
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full justify-start"
                      data-builder-generate-file-plan=""
                      loading={previewingGeneratedFiles}
                      disabled={previewingGeneratedFiles || applyingGeneratedFiles || Boolean(checkingTarget) || building || bundling || validatingWindow}
                      onClick={() => enqueueProjectTask("generate-file-plan")}
                    >
                      <FileJson aria-hidden className="size-4" />
                      生成计划
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full justify-start"
                      data-builder-audit-editor-experience=""
                      loading={runningProjectTask?.actionId === "audit-editor-experience"}
                      disabled={Boolean(checkingTarget) || building || bundling || validatingWindow}
                      onClick={() => enqueueProjectTask("audit-editor-experience")}
                    >
                      <Wand2 aria-hidden className="size-4" />
                      体验审计
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="w-full justify-start" data-builder-build-page-more-checks="">
                          <Menu aria-hidden className="size-4" />
                          更多检查
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>构建前检查</DropdownMenuLabel>
                        <DropdownMenuItem
                          data-builder-build-backend-artifacts=""
                          disabled={Boolean(buildingBackendArtifactId) || Boolean(checkingTarget) || building || bundling || validatingWindow}
                          onSelect={() => enqueueProjectTask("build-backend-artifacts")}
                        >
                          <Terminal aria-hidden className="size-4" />
                          后端产物
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          data-builder-check-frontend=""
                          disabled={Boolean(checkingTarget) || building || bundling || validatingWindow}
                          onSelect={() => enqueueProjectTask("quick-check-frontend")}
                        >
                          <Monitor aria-hidden className="size-4" />
                          前端检查
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          data-builder-check-rust=""
                          disabled={Boolean(checkingTarget) || building || bundling || validatingWindow}
                          onSelect={() => enqueueProjectTask("quick-check-rust")}
                        >
                          <Braces aria-hidden className="size-4" />
                          Rust 检查
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          data-builder-check-all=""
                          disabled={Boolean(checkingTarget) || building || bundling || validatingWindow}
                          onSelect={() => enqueueProjectTask("quick-check-all")}
                        >
                          <CheckCircle2 aria-hidden className="size-4" />
                          全部检查
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                      </div>
                    </section>
                  </div>
                </details>
                <details
                  className="group rounded-md border border-outline-variant/60 bg-transparent px-1 py-0.5 transition-colors hover:bg-surface-container"
                  data-builder-build-sidebar-section-density="thin-outline-row"
                  data-builder-task-center=""
                  data-builder-build-task-center-density="collapsed-summary"
                >
                  <summary
                    className="focus-ring flex min-h-7 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-1.5 text-xs transition-colors hover:bg-surface-container-high [&::-webkit-details-marker]:hidden"
                    data-builder-build-sidebar-section-summary="one-line"
                    data-builder-build-task-center-summary="single-row"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                      <ListChecks aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <h3 className="truncate text-xs font-medium text-on-surface">任务中心</h3>
                          <StateBadge
                            label={runningProjectTask ? "运行中" : activeProjectTasks.length ? `${visibleProjectTasks.length}/${activeProjectTasks.length}` : "空"}
                            signal={Boolean(runningProjectTask) || failedProjectTaskCount > 0 || activeProjectTasks.length > 0}
                            variant={runningProjectTask ? "outline" : activeProjectTasks.length ? "secondary" : "outline"}
                          />
                        </div>
                        <p className="sr-only">
                          {taskQueueStateTitle} · {taskQueueNextActionLabel}
                        </p>
                      </div>
                    </div>
                    <div
                      className="hidden shrink-0 items-center gap-1.5 sm:flex"
                      data-builder-build-task-center-summary-detail="compact-inline"
                    >
                      <StateBadge
                        label={`运行 ${runningProjectTask ? 1 : 0}`}
                        signal={!isQuietCount(runningProjectTask ? 1 : 0)}
                        variant="outline"
                        className="px-1.5 text-[0.62rem]"
                      />
                      <StateBadge
                        label={`等待 ${queuedProjectTaskCount}`}
                        signal={!isQuietCount(queuedProjectTaskCount)}
                        variant="secondary"
                        className="px-1.5 text-[0.62rem]"
                      />
                      <StateBadge
                        label={`失败 ${failedProjectTaskCount}`}
                        signal={!isQuietCount(failedProjectTaskCount)}
                        variant="destructive"
                        className="px-1.5 text-[0.62rem]"
                      />
                    </div>
                  </summary>
                  <div className="border-t border-outline-variant p-3" data-builder-build-task-center-details="deferred">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">任务中心</h3>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                        队列化保存、生成、检查、验证、构建和打包动作。
                      </p>
                    </div>
                    <StateBadge
                      label={runningProjectTask ? "运行中" : activeProjectTasks.length ? `${visibleProjectTasks.length}/${activeProjectTasks.length}` : "空"}
                      signal={Boolean(runningProjectTask) || failedProjectTaskCount > 0 || activeProjectTasks.length > 0}
                      variant={runningProjectTask ? "outline" : activeProjectTasks.length ? "secondary" : "outline"}
                    />
                  </div>
                  <div className="mb-3 grid grid-cols-3 gap-2 text-center text-[0.68rem]">
                    <div className="rounded-xl bg-surface-container-high px-2 py-2">
                      <p className="font-medium text-on-surface">{runningProjectTask ? 1 : 0}</p>
                      <p className="mt-1 text-on-surface-variant">运行中</p>
                    </div>
                    <div className="rounded-xl bg-surface-container-high px-2 py-2">
                      <p className="font-medium text-on-surface">{queuedProjectTaskCount}</p>
                      <p className="mt-1 text-on-surface-variant">排队中</p>
                    </div>
                    <div className="rounded-xl bg-surface-container-high px-2 py-2">
                      <p className="font-medium text-on-surface">{failedProjectTaskCount}</p>
                      <p className="mt-1 text-on-surface-variant">失败</p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "mb-3 rounded-2xl border p-3 text-xs",
                      taskQueueStateTone === "attention"
                        ? "border-destructive/30 bg-destructive/10"
                        : taskQueueStateTone === "running"
                          ? "border-primary/30 bg-primary/10"
                          : taskQueueStateTone === "paused"
                            ? "border-outline bg-surface-container-high"
                            : "border-outline-variant bg-surface-container-high",
                    )}
                    data-builder-task-queue-status=""
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <StateLabel
                            showQuiet
                            variant={
                              taskQueueStateTone === "attention"
                                ? "destructive"
                                : taskQueueStateTone === "running" || taskQueueStateTone === "ready"
                                  ? "secondary"
                                  : "outline"
                            }
                            label={taskQueueStateLabel}
                          />
                          <span className="min-w-0 truncate font-medium text-on-surface">{taskQueueStateTitle}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 leading-5 text-on-surface-variant">{taskQueueStateDetail}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={taskQueueStateTone === "attention" || taskQueueStateTone === "paused" ? "secondary" : "ghost"}
                        className="shrink-0"
                        data-builder-task-queue-recommended-action=""
                        onClick={runTaskQueueRecommendedAction}
                      >
                        {taskQueueStateTone === "paused" || taskQueueStateTone === "queued" || taskQueueStateTone === "ready" ? (
                          <Play aria-hidden className="size-4" />
                        ) : taskQueueStateTone === "attention" ? (
                          <AlertTriangle aria-hidden className="size-4" />
                        ) : (
                          <MousePointer2 aria-hidden className="size-4" />
                        )}
                        {taskQueueNextActionLabel}
                      </Button>
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
                        onChange={(event: any) => setCustomPresetTitle(event.target.value)}
                        placeholder="Preset 标题"
                        aria-label="自定义操作 preset 标题"
                      />
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                        <Select value={customPresetDraftActionId} onValueChange={(value: any) => setCustomPresetDraftActionId(value as ProjectJumpActionId)}>
                          <SelectTrigger inputSize="sm" aria-label="添加操作到自定义 preset">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {projectActionOptionIds.map((actionId: any) => (
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
                      onChange={(event: any) => setCustomPresetDetail(event.target.value)}
                      placeholder="Preset 说明"
                      aria-label="自定义操作 preset 说明"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {customPresetDraftActions.map((actionId: any, index: any) => (
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
                    {allProjectActionPresets.map((preset: any) => (
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
                          <span className="text-[0.66rem] text-on-surface-variant">{preset.badge}</span>
                        </div>
                        <p className="mt-2 truncate font-mono text-[0.68rem] text-on-surface-variant">
                          {preset.actions.map((actionId: any) => projectTaskDefinitions[actionId].title).join(" -> ")}
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
                        onChange={(event: any) => setProjectTaskSearchQuery(event.target.value)}
                        placeholder="搜索任务、路径、错误..."
                        aria-label="搜索项目任务"
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Select value={projectTaskStatusFilter} onValueChange={(value: any) => setProjectTaskStatusFilter(value as ProjectTaskStatusFilter)}>
                        <SelectTrigger inputSize="sm" aria-label="筛选任务状态">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {projectTaskStatusFilterOptions.map((option: any) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={projectTaskKindFilter} onValueChange={(value: any) => setProjectTaskKindFilter(value as ProjectTaskKindFilter)}>
                        <SelectTrigger inputSize="sm" aria-label="筛选任务类型">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {projectTaskKindFilterOptions.map((option: any) => (
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
                          visibleProjectTasks.slice(0, 12).map((task: any) => {
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
                                onKeyDown={(event: any) => {
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
                                          {task.attempt > 1 ? ` · 第 ${task.attempt} 次重试` : ""}
                                        </p>
                                      </div>
                                      <StateLabel showQuiet variant={projectTaskStatusVariant(task.status)} label={projectTaskStatusLabel(task.status)} />
                                    </div>
                                    <p className="mt-2 line-clamp-2 leading-5 text-on-surface-variant">{task.summary ?? task.detail}</p>
                                    {task.error ? <p className="mt-2 line-clamp-2 font-mono text-[0.68rem] leading-4 text-destructive">{task.error}</p> : null}
                                    {task.status === "queued" && queueIndex >= 0 ? (
                                      <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-surface-container-low px-2 py-1.5 text-[0.68rem] text-on-surface-variant">
                                        <span>队列 #{queueIndex + 1}</span>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            size="icon-sm"
                                            variant="ghost"
                                            aria-label={`将 ${task.title} 在队列中上移`}
                                            data-builder-move-task-up={task.id}
                                            disabled={!canMoveQueuedProjectTask(task.id, -1)}
                                            onClick={(event: any) => {
                                              event.stopPropagation();
                                              moveQueuedProjectTask(task.id, -1);
                                            }}
                                          >
                                            <MoveUp aria-hidden className="size-3.5" />
                                          </Button>
                                          <Button
                                            size="icon-sm"
                                            variant="ghost"
                                            aria-label={`将 ${task.title} 在队列中下移`}
                                            data-builder-move-task-down={task.id}
                                            disabled={!canMoveQueuedProjectTask(task.id, 1)}
                                            onClick={(event: any) => {
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
                            <StateLabel showQuiet variant={projectTaskStatusVariant(selectedProjectTask.status)} label={projectTaskStatusLabel(selectedProjectTask.status)} />
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-[0.68rem] xl:grid-cols-4">
                            <div className="rounded-xl bg-surface-container-low px-2 py-2">
                              <p className="text-on-surface-variant">类型</p>
                              <p className="mt-1 truncate font-medium text-on-surface">{projectTaskKindLabel(selectedProjectTask.kind)}</p>
                            </div>
                            <div className="rounded-xl bg-surface-container-low px-2 py-2">
                              <p className="text-on-surface-variant">耗时</p>
                              <p className="mt-1 truncate font-medium text-on-surface">{projectTaskElapsedLabel(selectedProjectTask)}</p>
                            </div>
                            <div className="rounded-xl bg-surface-container-low px-2 py-2">
                              <p className="text-on-surface-variant">次数</p>
                              <p className="mt-1 truncate font-medium text-on-surface">{selectedProjectTask.attempt}</p>
                            </div>
                            <div className="rounded-xl bg-surface-container-low px-2 py-2">
                              <p className="text-on-surface-variant">来源</p>
                              <p className="mt-1 truncate font-medium text-on-surface">{selectedProjectTask.backendTaskId ? "Rust 任务" : "编辑器队列"}</p>
                            </div>
                          </div>
                          <p className="mt-3 rounded-xl bg-surface-container-low p-2 leading-5 text-on-surface-variant">
                            {selectedProjectTask.summary ?? "这个任务还没有写入摘要。"}
                          </p>
                          {selectedProjectTask.error ? (
                            <p className="mt-2 rounded-xl bg-destructive/10 p-2 font-mono text-[0.68rem] leading-4 text-destructive">
                              {selectedProjectTask.error}
                            </p>
                          ) : null}
                          <div className="mt-3 space-y-2">
                            {selectedProjectTask.artifactPath ? (
                              <p className="break-all rounded-xl bg-surface-container-low p-2 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                                产物：{selectedProjectTask.artifactPath}
                              </p>
                            ) : null}
                            {selectedProjectTask.logPath ? (
                              <p className="break-all rounded-xl bg-surface-container-low p-2 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                                日志：{selectedProjectTask.logPath}
                              </p>
                            ) : null}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedProjectTask.status !== "succeeded" ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                data-builder-resolve-selected-task={selectedProjectTask.id}
                                onClick={() => openProjectTaskResolution(selectedProjectTask)}
                              >
                                <ArrowRight aria-hidden className="size-4" />
                                {projectTaskResolutionLabel(selectedProjectTask)}
                              </Button>
                            ) : null}
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
                              <p className="font-medium text-on-surface">日志摘要</p>
                              <span className="text-[0.68rem] text-on-surface-variant">
                                {projectTaskLogSearchQuery ? `${selectedProjectTaskLogMatchCount} 条匹配` : `${selectedProjectTaskLogLines.length} 行`}
                              </span>
                            </div>
                            <div className="relative">
                              <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                              <Input
                                inputSize="sm"
                                className="pl-8"
                                value={projectTaskLogSearchQuery}
                                onChange={(event: any) => setProjectTaskLogSearchQuery(event.target.value)}
                                placeholder="搜索这个日志..."
                                aria-label="搜索选中任务日志"
                                disabled={!selectedProjectTask.logPreview}
                              />
                            </div>
                            {selectedProjectTask.logPreview ? (
                              <div className="mt-2 max-h-44 overflow-auto rounded-xl bg-surface-container-low py-2 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                                {selectedProjectTaskLogLines.length ? (
                                  selectedProjectTaskLogLines.map((line: any) => (
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
                                  <p className="px-3 py-2 text-on-surface-variant">没有匹配的日志行。</p>
                                )}
                              </div>
                            ) : (
                              <div className="mt-2 rounded-xl border border-dashed border-outline-variant p-3 text-center leading-5 text-on-surface-variant">
                                这个任务还没有写入日志摘要。
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-outline-variant p-4 text-center text-xs leading-5 text-on-surface-variant">
                      还没有任务。点击检查、验证、构建或项目跳转操作后会进入这里。
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
                  </div>
                </details>
                <details
                  className="group rounded-md border border-outline-variant/60 bg-transparent px-1 py-0.5 transition-colors hover:bg-surface-container"
                  data-builder-build-sidebar-section-density="thin-outline-row"
                  data-builder-release-pipelines=""
                  data-builder-release-pipelines-density="collapsed-summary"
                >
                  <summary
                    className="focus-ring flex min-h-7 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-1.5 text-xs transition-colors hover:bg-surface-container-high [&::-webkit-details-marker]:hidden"
                    data-builder-build-sidebar-section-summary="one-line"
                    data-builder-release-pipelines-summary="single-row"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                      <GitBranch aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <h3 className="truncate text-xs font-medium text-on-surface">发布流水线</h3>
                          <StateBadge
                            label={latestReleasePipeline ? projectTaskStatusLabel(latestReleasePipeline.status) : "空"}
                            signal={Boolean(latestReleasePipeline) && !isQuietStateLabel(projectTaskStatusLabel(latestReleasePipeline.status))}
                            variant={latestReleasePipeline ? projectTaskStatusVariant(latestReleasePipeline.status as ProjectTaskStatus) : "outline"}
                          />
                        </div>
                        <p className="sr-only">
                          {latestReleasePipeline ? latestReleasePipeline.summary : "按需展开查看流水线记录和复跑入口"}
                        </p>
                      </div>
                    </div>
                    <span
                      className="hidden shrink-0 items-center gap-1.5 sm:flex"
                      data-builder-release-pipelines-summary-detail="compact-inline"
                    >
                      <StateBadge
                        label={`${activeProject.releasePipelineHistory?.length ?? 0} 条`}
                        signal={!isQuietCount(activeProject.releasePipelineHistory?.length ?? 0)}
                        variant="outline"
                        className="px-1.5 text-[0.62rem]"
                      />
                      <StateBadge
                        label={refreshingPipelineRecords ? "刷新中" : activeProject.rootPath ? "可刷新" : "本地"}
                        signal={Boolean(refreshingPipelineRecords)}
                        variant={refreshingPipelineRecords ? "secondary" : "outline"}
                        className="px-1.5 text-[0.62rem]"
                      />
                    </span>
                  </summary>
                  <div className="hidden border-t border-outline-variant p-3 group-open:block" data-builder-release-pipelines-details="deferred">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <p className="min-w-0 text-xs leading-5 text-on-surface-variant">
                        每次运行 preset 都会归档为一条流水线，聚合步骤、日志、失败点和最终产物。
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0"
                        data-builder-refresh-release-pipelines=""
                        loading={refreshingPipelineRecords}
                        disabled={refreshingPipelineRecords || !activeProject.rootPath}
                        onClick={() => void refreshReleasePipelineRecords(activeProject)}
                      >
                        <RotateCcw aria-hidden className="size-4" />
                        刷新
                      </Button>
                    </div>
                    {activeProject.releasePipelineHistory?.length ? (
                      <div className="space-y-3">
                      {activeProject.releasePipelineHistory.slice(0, 4).map((entry: any) => (
                        <article key={entry.id} className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs" data-builder-release-pipeline={entry.id}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate font-medium text-on-surface">{entry.presetTitle}</p>
                                <span className="text-[0.66rem] text-on-surface-variant">{entry.presetBadge}</span>
                                <StateLabel showQuiet variant={projectTaskStatusVariant(entry.status as ProjectTaskStatus)} label={projectTaskStatusLabel(entry.status)} />
                              </div>
                              <p className="mt-1 text-[0.68rem] text-on-surface-variant">
                                {validationTimeLabel(entry.startedAt ?? entry.createdAt)}
                                {entry.finishedAt ? ` -> ${validationTimeLabel(entry.finishedAt)}` : ""}
                              </p>
                            </div>
                            <div className="min-w-[8rem] text-right">
                              <p className="font-medium text-on-surface">
                                {entry.succeededCount + entry.skippedCount + entry.failedCount + entry.canceledCount}/{entry.stepCount} 步
                              </p>
                              <Progress className="mt-2 h-1.5" value={projectTaskProgress(entry.status as ProjectTaskStatus)} />
                            </div>
                          </div>
                          <p className="mt-2 line-clamp-2 leading-5 text-on-surface-variant">
                            {entry.releaseAppName} v{entry.releaseVersion} · {entry.summary}
                          </p>
                          {entry.recordPath ? (
                            <p className="mt-2 break-all rounded-xl bg-surface-container-low p-2 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                              记录：{entry.recordPath}
                            </p>
                          ) : null}
                          <div className="mt-3 grid gap-1.5">
                            {entry.steps.map((step: any, index: any) => (
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
                                      产物：{" "}
                                      {step.artifactEvidence.exists
                                        ? `${byteSizeLabel(step.artifactEvidence.sizeBytes)}${step.artifactEvidence.sha256 ? ` · sha256 ${step.artifactEvidence.sha256.slice(0, 12)}` : ""}`
                                        : "缺失"}
                                    </p>
                                  ) : step.inputSnapshot ? (
                                    <p className="truncate text-on-surface-variant">
                                      输入：{step.inputSnapshot.fileCount} 文件 · {step.inputSnapshot.controlCount} 控件 · {step.inputSnapshot.projectSnapshotHash}
                                    </p>
                                  ) : null}
                                </div>
                                <StateLabel showQuiet variant={projectTaskStatusVariant(step.status as ProjectTaskStatus)} label={projectTaskStatusLabel(step.status)} />
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
                              disabled={!entry.steps.some((step: any) => step.status === "failed" || step.status === "canceled")}
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
                              最新
                            </Button>
                          </div>
                        </article>
                      ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-outline-variant p-4 text-center text-xs leading-5 text-on-surface-variant">
                        还没有发布流水线。运行设计预检、发布 exe 或安装包流水线后会在这里留下完整记录。
                      </div>
                    )}
                  </div>
                </details>
                <div
                  className="subtle-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto overflow-y-hidden rounded-md border border-outline-variant/70 bg-surface-container px-1 py-1"
                  data-builder-build-sidebar-actions="icon-strip"
                  data-builder-build-sidebar-actions-density="single-row-icons"
                >
                  <Button
                    size="icon-sm"
                    variant="secondary"
                    className="size-7 shrink-0"
                    data-builder-save-disk=""
                    aria-label="保存项目"
                    title="保存项目"
                    onClick={() => enqueueProjectTask("save-project")}
                    loading={diskBusy}
                  >
                    <Save aria-hidden className="size-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="secondary"
                    className="size-7 shrink-0"
                    data-builder-validate-window=""
                    aria-label="验证窗口"
                    title="验证窗口"
                    onClick={() => enqueueProjectTask("validate-window")}
                    loading={validatingWindow}
                    disabled={bundling || building}
                  >
                    <CheckCircle2 aria-hidden className="size-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    className="size-7 shrink-0"
                    data-builder-run-build=""
                    aria-label="发布 exe"
                    title="发布 exe"
                    onClick={() => enqueueProjectTask("build-exe")}
                    loading={building}
                    disabled={bundling}
                  >
                    <Download aria-hidden className="size-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    className="size-7 shrink-0"
                    data-builder-run-bundle=""
                    aria-label="打包安装包"
                    title="打包安装包"
                    onClick={() => enqueueProjectTask("bundle-installer")}
                    loading={bundling}
                    disabled={building}
                  >
                    <Box aria-hidden className="size-3.5" />
                  </Button>
                </div>
              </aside>
              <section className="space-y-2">
                <div
                  className="overflow-hidden rounded-md border border-outline-variant bg-surface-container-low/70"
                  data-builder-desktop-runtime-workbench=""
                  data-builder-desktop-runtime-workbench-density="thin-output-stack"
                  data-builder-desktop-runtime-workbench-chrome="flat-output-panel"
                  data-builder-desktop-runtime-state={desktopRuntimeState}
                >
                  <div
                    className="flex min-h-7 flex-col gap-1 border-b border-outline-variant px-2 py-0.5 lg:flex-row lg:items-center lg:justify-between"
                    data-builder-desktop-runtime-header=""
                    data-builder-desktop-runtime-header-density="single-row"
                    data-builder-desktop-runtime-header-chrome="flat-toolbar"
                  >
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-secondary-container text-secondary-container-foreground">
                          <Monitor aria-hidden className="size-3" />
                        </span>
                        <div className="min-w-0">
                          <h2 className="truncate text-[0.82rem] font-semibold leading-5 text-on-surface">桌面运行</h2>
                          <p className="sr-only">
                            Tauri exe 目标、窗口验证与运行控制台
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                      <StateLabel variant={desktopRuntimeBadgeVariant} label={desktopRuntimeStatusLabel} data-builder-desktop-runtime-status="" />
                      <Button
                        size="sm"
                        variant={workflowRuntimeActive ? "destructive" : "secondary"}
                        data-builder-desktop-runtime-primary=""
                        data-builder-desktop-runtime-primary-density="inline-run"
                        loading={desktopRuntimePrimaryLoading}
                        disabled={desktopRuntimePrimaryDisabled}
                        onClick={() => {
                          if (workflowRuntimeActive && activeWorkflowRuntimeSession) {
                            void stopWorkflowRuntimeSession(activeWorkflowRuntimeSession);
                            return;
                          }
                          if (activeProject.outputExePath) {
                            void launchActiveOutputExecutable();
                            return;
                          }
                          enqueueProjectTask("build-exe");
                        }}
                      >
                        {workflowRuntimeActive ? <Square aria-hidden className="size-4" /> : activeProject.outputExePath ? <Play aria-hidden className="size-4" /> : <Download aria-hidden className="size-4" />}
                        {desktopRuntimePrimaryLabel}
                      </Button>
                      <div
                        className="flex shrink-0 items-center gap-0.5 rounded-md border border-outline-variant bg-surface-container px-1 py-0.5"
                        data-builder-desktop-runtime-actions=""
                        data-builder-desktop-runtime-actions-density="header-icon-strip"
                      >
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          data-builder-desktop-runtime-build=""
                          aria-label="构建 exe"
                          title="构建 exe"
                          loading={building || runningProjectTask?.actionId === "build-exe"}
                          disabled={building || bundling}
                          onClick={() => enqueueProjectTask("build-exe")}
                        >
                          <Download aria-hidden className="size-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          data-builder-desktop-runtime-validate=""
                          aria-label="验证窗口"
                          title="验证窗口"
                          loading={validatingWindow || runningProjectTask?.actionId === "validate-window"}
                          disabled={building || bundling || validatingWindow}
                          onClick={() => enqueueProjectTask("validate-window")}
                        >
                          <CheckCircle2 aria-hidden className="size-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          data-builder-desktop-runtime-generated-plan=""
                          aria-label="生成文件计划"
                          title="生成文件计划"
                          loading={previewingGeneratedFiles || applyingGeneratedFiles}
                          disabled={generatedPlanBusy}
                          onClick={() => enqueueProjectTask("generate-file-plan")}
                        >
                          <FileJson aria-hidden className="size-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          data-builder-desktop-runtime-output=""
                          aria-label="打开输出 Dock"
                          title="打开输出 Dock"
                          onClick={() => openBottomDock("output", false)}
                        >
                          <Terminal aria-hidden className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div
                    className="grid items-stretch divide-y divide-outline-variant lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.48fr)] lg:divide-x lg:divide-y-0"
                    data-builder-desktop-runtime-body=""
                    data-builder-desktop-runtime-body-density="flat-split-strip"
                  >
                    <div
                      className="grid min-w-0 overflow-hidden text-xs md:grid-cols-4 md:divide-x md:divide-outline-variant"
                      data-builder-desktop-runtime-summary=""
                      data-builder-desktop-runtime-summary-density="single-row-output"
                      data-builder-desktop-runtime-summary-layout="inline-property-strip"
                      data-builder-desktop-runtime-summary-chrome="borderless-property-strip"
                    >
                      {[
                        {
                          label: "输出 exe",
                          value: activeProject.outputExePath ? fileNameFromPath(activeProject.outputExePath) : "尚未生成",
                          detail: desktopRuntimePath,
                          icon: Download,
                        },
                        {
                          label: "运行会话",
                          value: workflowRuntimeActive
                            ? `pid ${activeWorkflowRuntimeSession?.pid}`
                            : latestRunSessionEntry
                              ? latestRunSessionEntry.runStatus ?? "已启动"
                              : "未运行",
                          detail: desktopRuntimeLogPath || "运行控制台等待生成",
                          icon: Terminal,
                        },
                        {
                          label: "窗口验证",
                          value: latestValidationRun ? `${latestValidationRun.status} · ${latestValidationRun.score}%` : "未验证",
                          detail: activeProject.validationReportPath || "验证后生成报告、截图和 DOM 审阅",
                          icon: CheckCircle2,
                        },
                        {
                          label: "任务队列",
                          value: railQueueSummaryLabel,
                          detail: `${railTaskCountLabel} 工作流步骤 · ${workflowProgressLabel}`,
                          icon: ClipboardCopy,
                        },
                      ].map((item: any) => {
                        const ItemIcon = item.icon;
                        return (
                          <article
                            key={item.label}
                            className="min-w-0 self-start px-2 py-1"
                            title={`${item.label}: ${item.value} · ${item.detail}`}
                            data-builder-desktop-runtime-card={item.label}
                            data-builder-desktop-runtime-card-density="compact-cell"
                            data-builder-desktop-runtime-card-detail="deferred"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="flex size-3.5 shrink-0 items-center justify-center rounded-sm bg-surface-container-highest text-primary">
                                <ItemIcon aria-hidden className="size-3" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[0.58rem] font-medium text-on-surface-variant">{item.label}</p>
                                <p className="truncate text-[0.7rem] font-medium leading-4 text-on-surface">{item.value}</p>
                                <p className="sr-only">{item.detail}</p>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    <details
                      open={desktopRuntimeConsoleOpen}
                      onToggle={(event: any) => setDesktopRuntimeConsoleOpen(event.currentTarget.open)}
                      className="group min-w-0 px-2 py-1 text-xs"
                      data-builder-desktop-runtime-console=""
                      data-builder-desktop-runtime-console-density="collapsed-summary"
                      data-builder-desktop-runtime-console-chrome="inline-disclosure-row"
                      data-builder-desktop-runtime-console-state="collapsed-default"
                    >
                      <summary
                        className="focus-ring flex min-h-6 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-1 [&::-webkit-details-marker]:hidden"
                        aria-controls="builder-desktop-runtime-console-details"
                        data-builder-desktop-runtime-console-summary="single-row"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                          <div className="min-w-0">
                            <h3 className="truncate text-xs font-medium text-on-surface">运行控制台</h3>
                            <p className="truncate text-[0.68rem] leading-4 text-on-surface-variant">
                              {desktopRuntimeLogPath || "运行桌面端后写入 .nova/runtime"}
                            </p>
                          </div>
                        </div>
                        {/* The chevron already is the "expand" affordance;
                            a chip saying 按需展开 was decoration on decoration. */}
                      </summary>
                      <div className="mt-2 border-t border-outline-variant pt-2" id="builder-desktop-runtime-console-details"
                        data-builder-desktop-runtime-console-details="deferred">
                        <div className="mb-1.5 flex flex-wrap items-center justify-end gap-1">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            data-builder-desktop-runtime-refresh=""
                            aria-label="刷新运行状态"
                            title="刷新运行状态"
                            loading={latestRunSessionEntry ? checkingRunId === latestRunSessionEntry.id : false}
                            disabled={!latestRunSessionEntry?.launchedPid || Boolean(checkingRunId)}
                            onClick={() => {
                              if (latestRunSessionEntry) {
                                void refreshRunSession(latestRunSessionEntry);
                              }
                            }}
                          >
                            <RotateCcw aria-hidden className="size-4" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            data-builder-desktop-runtime-open-log=""
                            aria-label="打开运行日志"
                            title="打开运行日志"
                            disabled={!desktopRuntimeLogPath}
                            onClick={() => void openLocalArtifact(desktopRuntimeLogPath)}
                          >
                            <FileJson aria-hidden className="size-4" />
                          </Button>
                        </div>
                        <pre
                          className="max-h-20 min-h-14 overflow-auto whitespace-pre-wrap rounded-lg bg-surface-container-high px-2 py-1.5 font-mono text-[0.66rem] leading-4 text-on-surface-variant"
                          data-builder-desktop-runtime-log-preview=""
                        >
                          {latestRunSessionEntry?.runtimeLogPreview || activeWorkflowRuntimeSession?.summary || "运行桌面端 exe 后会在这里显示 stdout、stderr 和运行状态摘要。"}
                        </pre>
                      </div>
                    </details>
                  </div>

                  <details
                    className="group mt-1 rounded-md border border-outline-variant bg-surface-container px-1.5 py-0.5"
                    data-builder-runtime-parity-panel=""
                    data-builder-runtime-parity-density="collapsed-default"
                    data-builder-runtime-parity-grid="off"
                    data-builder-runtime-parity-list="compact-output"
                    data-builder-runtime-parity-shell={releaseWindowShellMatchesPage ? "matched" : "needs-sync"}
                    data-builder-runtime-parity-titlebar={activeProject.releaseConfig.titlebarStyle}
                    data-builder-runtime-parity-window-kind={activeProject.releaseConfig.windowKind}
                    data-builder-runtime-parity-validation={latestValidationRun?.status ?? "missing"}
                  >
                    <summary
                      className="focus-ring flex min-h-6 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-1 text-xs [&::-webkit-details-marker]:hidden"
                      data-builder-runtime-parity-summary="single-row"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <h3 className="truncate text-xs font-medium text-on-surface">运行端窗口一致性</h3>
                            <StateBadge
                              signal={!releaseWindowShellMatchesPage}
                              variant={releaseWindowShellMatchesPage ? "secondary" : "outline"}
                              label={releaseWindowShellMatchesPage ? "页面与发布一致" : "等待同步"}
                            />
                          </div>
                          <p className="sr-only">
                            发布窗口、标题栏、验证和运行网格的低频详情，展开后处理。
                          </p>
                        </div>
                      </div>
                      <CountReadout label={`${runtimeWindowParityItems.length} 项`} count={runtimeWindowParityItems.length} className="shrink-0" />
                    </summary>
                    <div className="mt-2 border-t border-outline-variant pt-2" data-builder-runtime-parity-details="deferred">
                      <div className="mb-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <p className="min-w-0 truncate text-[0.68rem] leading-4 text-on-surface-variant">
                          对照编辑器页面、发布配置和生成 runtime，避免 exe 出现标题栏、拖拽区域或编辑网格残留的偏差。
                        </p>
                        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                          <Button
                            size="sm"
                            variant={releaseWindowShellMatchesPage ? "ghost" : "secondary"}
                            data-builder-runtime-parity-sync=""
                            disabled={releaseWindowShellMatchesPage}
                            onClick={syncReleaseWindowFromActivePage}
                          >
                            <Save aria-hidden className="size-4" />
                            同步窗口
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-runtime-parity-validate=""
                            loading={validatingWindow || runningProjectTask?.actionId === "validate-window"}
                            disabled={building || bundling || validatingWindow}
                            onClick={() => enqueueProjectTask("validate-window")}
                          >
                            <CheckCircle2 aria-hidden className="size-4" />
                            验证窗口
                          </Button>
                        </div>
                      </div>
                      <div className="grid overflow-hidden rounded-lg border border-outline-variant md:grid-cols-2 xl:grid-cols-3 xl:divide-x xl:divide-outline-variant">
                        {runtimeWindowParityItems.map((item: any) => {
                          const ItemIcon = item.icon;
                          return (
                            <article
                              key={item.id}
                              className="min-w-0 bg-surface-container-high/40 px-2.5 py-1.5 text-xs"
                              data-builder-runtime-parity-item={item.id}
                              data-builder-runtime-parity-state={item.severity}
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <span
                                  className={cn(
                                    "flex size-5 shrink-0 items-center justify-center rounded-md",
                                    item.severity === "pass" ? "bg-primary-container text-primary-container-foreground" : "bg-tertiary-container text-tertiary-container-foreground",
                                  )}
                                >
                                  <ItemIcon aria-hidden className="size-3" />
                                </span>
                                <div className="grid min-w-0 flex-1 items-center gap-1 sm:grid-cols-[5rem_minmax(0,1fr)]">
                                  <p className="truncate text-[0.66rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">{item.label}</p>
                                  <p className="truncate font-medium text-on-surface">{item.value}</p>
                                </div>
                                <span
                                  className={cn(
                                    "size-2 shrink-0 rounded-full",
                                    item.severity === "pass" ? "bg-primary" : "bg-tertiary",
                                  )}
                                  aria-label={item.severity === "pass" ? "通过" : "需要复核"}
                                />
                              </div>
                              <p className="mt-0.5 truncate pl-7 leading-4 text-on-surface-variant">{item.detail}</p>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  </details>
                </div>
                <details
                  className="group rounded-md border border-outline-variant bg-surface-container-low/80 p-1.5 text-xs"
                  data-builder-generated-file-plan=""
                  data-builder-generated-file-plan-density="collapsed-summary"
                  data-builder-generated-file-plan-surface="compact-output-pane"
                >
                  <summary
                    className="focus-ring flex min-h-8 cursor-pointer list-none flex-col gap-1.5 rounded-md border border-outline-variant bg-surface-container px-2 py-1 transition hover:bg-surface-container-high lg:flex-row lg:items-center lg:justify-between [&::-webkit-details-marker]:hidden"
                    data-builder-generated-plan-status=""
                    data-builder-generated-plan-status-density="single-row"
                    data-builder-generated-plan-summary="single-row"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg border",
                          projectChangeImpact.status === "dirty"
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : projectChangeImpact.status === "clean"
                              ? "border-primary/20 bg-surface-container-high text-primary"
                              : "border-outline-variant bg-surface-container-high text-on-surface-variant",
                        )}
                      >
                        {projectChangeImpact.status === "clean" ? (
                          <CheckCircle2 aria-hidden className="size-4" />
                        ) : projectChangeImpact.status === "dirty" ? (
                          <Download aria-hidden className="size-4" />
                        ) : (
                          <FileJson aria-hidden className="size-4" />
                        )}
                      </span>
                      <div className="flex min-w-0 items-center gap-1.5" data-builder-generated-plan-status-detail="compact-inline">
                        <h2 className="shrink-0 text-xs font-semibold text-on-surface">生成文件计划</h2>
                        {/* The prose next to this already states the plan's state,
                            and the 增量影响 section below carries the status chip —
                            chipping it here said the same fact twice on one screen. */}
                        <span className="text-[0.68rem] text-on-surface-variant">
                          {projectChangeImpactStatusLabel(projectChangeImpact.status)}
                        </span>
                        {generatedFilePreview ? (
                          <CountReadout label={`${projectChangeImpact.totalCount} 文件`} count={projectChangeImpact.totalCount} />
                        ) : null}
                        <span className="min-w-0 truncate text-[0.68rem] text-on-surface-variant">
                          {generatedPlanStatusTitle} · {generatedPlanStatusDetail}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      <Button
                        size="sm"
                        className="h-7 px-2 text-[0.68rem]"
                        data-builder-generated-plan-primary=""
                        loading={previewingGeneratedFiles || applyingGeneratedFiles}
                        disabled={generatedPlanBusy}
                        onClick={(event: any) => {
                          event.stopPropagation();
                          enqueueProjectTask(generatedPlanPrimaryAction);
                        }}
                      >
                        {projectChangeImpact.status === "dirty" ? <Download aria-hidden className="size-3.5" /> : <Play aria-hidden className="size-3.5" />}
                        {generatedPlanPrimaryLabel}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[0.68rem]"
                        data-builder-generated-plan-tasks=""
                        onClick={(event: any) => {
                          event.stopPropagation();
                          openRelevantTaskDock();
                        }}
                      >
                        <ClipboardCopy aria-hidden className="size-3.5" />
                        任务
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[0.68rem]"
                        data-builder-generated-plan-advanced-toggle=""
                        aria-expanded={showGeneratedPlanAdvanced}
                        onClick={() => setShowGeneratedPlanAdvanced((current: any) => !current)}
                      >
                        <Settings2 aria-hidden className="size-3.5" />
                        高级
                      </Button>
                    </div>
                  </summary>
                  <div className="mt-2 border-t border-outline-variant pt-2" data-builder-generated-file-plan-details="deferred">
                  <div className="mb-2 rounded-lg border border-outline-variant bg-surface-container-low p-2 text-[0.64rem]" data-builder-generated-diff-preview="">
                    <div className="mb-1 font-semibold text-on-surface">变更摘要预览</div>
                    <div className="space-y-0.5 font-mono">
                      <div className="text-primary">+ 新建 / 更新的生成文件以增量方式写入</div>
                      <div className="text-on-surface-variant">  未变化文件不会重写，保留 Vite/Cargo 缓存</div>
                      <div className="text-destructive">- 不会覆盖 create-only starter（如用户手改 README）</div>
                    </div>
                  </div>
                  {showGeneratedPlanAdvanced ? (
                    <div className="mb-4 border-t border-outline-variant pt-3" data-builder-generated-plan-advanced="">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">高级文件控制</p>
                          <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                            精细选择生成目标、刷新计划，或在需要更多控制时执行完整计算计划。
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
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
                            data-builder-refresh-generated-file-plan=""
                            loading={previewingGeneratedFiles}
                            disabled={previewingGeneratedFiles || applyingGeneratedFiles || building || bundling || validatingWindow}
                            onClick={() => enqueueProjectTask("generate-file-plan")}
                          >
                            <FileJson aria-hidden className="size-4" />
                            刷新计划
                          </Button>
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
                            运行完整计划
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <details
                    className="group mb-2 rounded-md border border-outline-variant bg-surface-container text-xs"
                    data-builder-change-impact=""
                    data-builder-change-impact-density="collapsed-default"
                  >
                    <summary
                      className="focus-ring flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-2 py-1.5 transition hover:bg-surface-container-high [&::-webkit-details-marker]:hidden"
                      data-builder-change-impact-summary="single-row"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-primary">
                          <GitBranch aria-hidden className="size-3.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-on-surface">增量影响</span>
                          <span className="block truncate text-[0.64rem] text-on-surface-variant">{projectChangeImpact.summary}</span>
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <StateBadge
                          variant={projectChangeImpactStatusVariant(projectChangeImpact.status)}
                          label={projectChangeImpactStatusLabel(projectChangeImpact.status)}
                        />
                        {/* group-open:hidden is display:none, so it also leaves the
                            accessibility tree — the count is a collapsed-only tally. */}
                        <CountReadout
                          className="group-open:hidden"
                          label={`${projectChangeImpact.scopes.length} 范围`}
                          count={projectChangeImpact.scopes.length}
                        />
                        <ChevronRight aria-hidden className="size-3.5 text-on-surface-variant transition-transform group-open:rotate-90" />
                      </span>
                    </summary>
                    <div className="border-t border-outline-variant p-2.5" data-builder-change-impact-details="deferred">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* The summary row above still shows the status while
                              this panel is open; repeating it here said the same
                              thing twice on one screen. */}
                          <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">增量影响</h3>
                          <span className="font-mono text-[0.66rem] text-on-surface-variant">{projectChangeImpact.currentSnapshotHash}</span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-on-surface-variant">{projectChangeImpact.summary}</p>
                        {projectChangeImpact.previewSnapshotHash ? (
                          <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface-variant">
                            计划 {projectChangeImpact.previewSnapshotHash}
                            {projectChangeImpact.previewRootPath ? ` · ${projectChangeImpact.previewRootPath}` : ""}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                        {/* An instruction is prose, not a status token. Wrapping
                            it in a pill made it look like something to act on. */}
                        <span className="truncate">
                          从上方引导操作执行
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 rounded-xl bg-surface-container-low px-3 py-2 text-xs" data-builder-change-impact-plan="">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-on-surface">{projectChangeImpact.executionPlan.title}</p>
                            <StateLabel label={projectChangeImpact.executionPlan.badge} />
                            <span className="text-[0.68rem] text-on-surface-variant">
                              {projectChangeImpact.executionPlan.actions.length} 个操作
                            </span>
                          </div>
                          <p className="mt-1 leading-5 text-on-surface-variant">{projectChangeImpact.executionPlan.detail}</p>
                        </div>
                        <div className="flex max-w-full flex-wrap gap-1.5">
                          {projectChangeImpact.executionPlan.actions.map((actionId: any, index: any) => (
                            <span key={`${actionId}-${index}`} className="text-[0.68rem] text-on-surface-variant">
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
                            <p className="font-medium text-on-surface">已保存依赖图</p>
                            {/* The event kind is a category; the status is what needs acting on. */}
                            {projectDependencyGraph ? (
                              <span className="text-[0.68rem] text-on-surface-variant">
                                {projectDependencyGraph.lastEvent.kind}
                              </span>
                            ) : null}
                            <StateBadge
                              variant={projectDependencyGraph ? dependencyGraphEventStatusVariant(projectDependencyGraph.lastEvent.status) : "outline"}
                              label={projectDependencyGraph ? projectActivityStatusLabel(projectDependencyGraph.lastEvent.status) : "空"}
                              signal={
                                Boolean(projectDependencyGraph) &&
                                dependencyGraphEventStatusVariant(projectDependencyGraph.lastEvent.status) === "destructive"
                              }
                            />
                            {writingDependencyGraph ? <StateLabel variant="outline" label="写入中" /> : null}
                          </div>
                          <p className="mt-1 line-clamp-2 leading-5 text-on-surface-variant">
                            {projectDependencyGraph
                              ? `${projectDependencyGraph.summary} ${projectDependencyGraph.dirtyScopeCount} 个脏范围，${projectDependencyGraph.executionPlan.actions.length} 个计划操作。`
                              : activeProject.rootPath
                                ? "这个项目还没有写入依赖图。"
                                : "先把项目保存到磁盘，Nova 才能持久化依赖图元数据。"}
                          </p>
                          {projectDependencyGraph?.recordPath ? (
                            <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface-variant">
                              {projectDependencyGraph.recordPath}
                              {projectDependencyGraph.recordWrittenAt ? ` · ${validationTimeLabel(projectDependencyGraph.recordWrittenAt)}` : ""}
                            </p>
                          ) : null}
                          {projectDependencySources.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5" data-builder-dependency-sources="">
                              {projectDependencySources.slice(0, 6).map((source: any) => (
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
                          {projectDependencyValidity.map((entry: any) => (
                            <article key={entry.id} className="rounded-lg bg-surface-container px-2.5 py-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-on-surface">{entry.label}</p>
                                  <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface-variant">{entry.snapshotHash}</p>
                                </div>
                                <StateLabel showQuiet variant={dependencyValidityStatusVariant(entry.validityStatus)} label={entry.validityStatus} />
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
                            <p className="font-medium text-on-surface">所选来源影响</p>
                            <CountReadout label={`${reverseDependencySummaries.length} 个追踪来源`} count={reverseDependencySummaries.length} />
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
                          onClick={() => enqueueProjectTask("generate-file-plan")}
                        >
                          <RotateCcw aria-hidden className="size-4" />
                          刷新影响
                        </Button>
                      </div>
                      {reverseDependencySummaries.length > 0 ? (
                        <div className="mt-3 grid gap-2 lg:grid-cols-2 2xl:grid-cols-4">
                          {reverseDependencySummaries.map((summary: any) =>
                            summary.target ? (
                              <article
                                key={`${summary.target.kind}-${summary.target.id}`}
                                className="rounded-lg border border-outline-variant bg-surface-container p-2.5"
                                data-builder-reverse-dependency={summary.target.id}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      {/* Kind is a category, provenance is how we know — only a state that demands action earns a chip. */}
                                      <span className="text-[0.68rem] text-on-surface-variant">
                                        {reverseDependencyTargetKindLabel(summary.target.kind)}
                                      </span>
                                      <StateLabel
                                        variant={reverseDependencyStatusVariant(summary.status)}
                                        label={reverseDependencyStatusLabel(summary.status)}
                                      />
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
                                  {summary.scopeIds.slice(0, 4).map((scopeId: any) => (
                                    <span key={scopeId} className="text-[0.66rem] text-on-surface-variant">
                                      {projectChangeScopeLabel(scopeId)}
                                    </span>
                                  ))}
                                  {summary.scopeIds.length > 4 ? (
                                    <span className="font-mono text-[0.66rem] text-on-surface-variant">
                                      +{summary.scopeIds.length - 4}
                                    </span>
                                  ) : null}
                                </div>
                                {summary.affectedPaths.length > 0 ? (
                                  <div className="mt-2 space-y-1">
                                    {summary.affectedPaths.slice(0, 3).map((path: any) => (
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
                                  {summary.plannedActions.slice(0, 1).map((actionId: any) => (
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
                      {projectChangeImpact.scopes.map((scope: any) => (
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
                            <StateBadge
                              label={projectChangeScopeStatusLabel(scope.status)}
                              signal={scope.status === "dirty"}
                              variant={projectChangeScopeStatusVariant(scope)}
                            />
                          </div>
                          <p className="mt-2 line-clamp-2 leading-5 text-on-surface-variant">{scope.summary}</p>
                          {scope.examples.length > 0 ? (
                            <div className="mt-2 space-y-1">
                              {scope.examples.map((path: any) => (
                                <p key={path} className="truncate font-mono text-[0.68rem] text-on-surface-variant">
                                  {path}
                                </p>
                              ))}
                            </div>
                          ) : null}
                          {scope.sourceRefs.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5" data-builder-change-scope-sources={scope.id}>
                              {scope.sourceRefs.slice(0, 5).map((source: any) => (
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
                            {scope.nextActions.slice(0, 1).map((actionId: any) => (
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
                  </details>
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
                          {generatedFilePreview.entries.map((entry: any) => (
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
                                onCheckedChange={(checked: any) => toggleGeneratedPreviewPath(entry.relative_path, Boolean(checked))}
                              />
                              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setActiveGeneratedPreviewPath(entry.relative_path)}>
                                <div className="mb-2 flex items-start justify-between gap-2">
                                  <span className="min-w-0 truncate font-mono text-[0.72rem]">{entry.relative_path}</span>
                                  <StateLabel showQuiet label={generatedFileStatusLabel(entry.status)} />
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-[0.68rem]">
                                  <span className="rounded-full bg-surface-container-high px-2 py-0.5">{entry.kind}</span>
                                  <span>{entry.line_count ? `${entry.line_count} 行` : entry.exists ? "已存在" : "计划写入"}</span>
                                  {entry.changed ? <span className="text-primary">已变更</span> : null}
                                  {entry.line_diff ? (
                                    <span className="font-mono text-[0.62rem]" data-builder-generated-line-diff="">
                                      <span className="text-primary">+{entry.line_diff.added}</span>{" "}
                                      <span className="text-destructive">-{entry.line_diff.removed}</span>{" "}
                                      <span className="text-on-surface-variant">{entry.line_diff.unchanged}~</span>
                                    </span>
                                  ) : null}
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
                                  <StateLabel showQuiet label={generatedFileStatusLabel(activeGeneratedPreviewEntry.status)} />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    data-builder-open-generated-plan-file=""
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
                              <GeneratedDiffView entry={activeGeneratedPreviewEntry} />
                            </div>
                          ) : (
                            <p className="rounded-xl bg-surface-container-high px-3 py-2 text-xs leading-5 text-on-surface-variant">
                              点击“生成计划”后，这里会显示将要写入的目标文件。
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container p-4 text-xs leading-5 text-on-surface-variant">
                      尚未生成文件计划。点击“生成计划”可以在写盘和构建前查看目标文件树。
                    </div>
                  )}
                  </div>
                </details>
                <details
                  className="group rounded-lg border border-outline-variant bg-surface-container-low/80 text-xs"
                  data-builder-release-readiness=""
                  data-builder-release-readiness-density="collapsed-default"
                >
                  <summary
                    className="focus-ring flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 transition hover:bg-surface-container [&::-webkit-details-marker]:hidden"
                    data-builder-release-readiness-summary="single-row"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary">
                        <ListChecks aria-hidden className="size-3.5" />
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5" data-builder-release-readiness-summary-detail="compact-inline">
                        <span className="shrink-0 font-semibold text-on-surface">发布就绪度</span>
                        <StateLabel
                          showQuiet
                          variant={
                            releaseReadinessSummary.status === "error"
                              ? "destructive"
                              : releaseReadinessSummary.status === "warning"
                                ? "outline"
                                : "secondary"
                          }
                          label={releaseReadinessSummary.status === "error" ? "阻塞" : buildReadinessSeverityLabel(releaseReadinessSummary.status)}
                        />
                        <span className="min-w-0 truncate text-[0.68rem] text-on-surface-variant">
                          {releaseReadinessSummary.score}% · {releaseReadinessSummary.blockers} 阻塞 · {releaseReadinessSummary.warnings} 警告 · {releaseReadinessActionItems.length || "无"} 待处理
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <CountReadout label={`${releaseReadinessSummary.items.length} 项`} count={releaseReadinessSummary.items.length} />
                      <ChevronRight aria-hidden className="size-3.5 text-on-surface-variant transition-transform group-open:rotate-90" />
                    </span>
                  </summary>
                  <div className="border-t border-outline-variant p-2.5" data-builder-release-readiness-details="deferred">
                  <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="rounded-2xl bg-surface-container p-4">
                      <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">发布评分</p>
                      <p className="mt-3 text-4xl font-semibold tracking-normal">{releaseReadinessSummary.score}%</p>
                      <Progress className="mt-3" value={releaseReadinessSummary.score} />
                      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[0.68rem]">
                        {/* Hand-rolled rounded spans bypassed the quiet/signal rule
                            that every other problem tally follows. */}
                        <StateBadge
                          variant="destructive"
                          label={`${releaseReadinessSummary.blockers} 阻塞`}
                          signal={releaseReadinessSummary.blockers > 0}
                        />
                        <StateBadge
                          variant="outline"
                          label={`${releaseReadinessSummary.warnings} 警告`}
                          signal={releaseReadinessSummary.warnings > 0}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-3">
                      {releaseReadinessSummary.items.map((item: any) => (
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
                            {/* A score is a readout; the icon already carries the severity. */}
                            <span
                              className={cn(
                                "shrink-0 font-mono text-[0.72rem] tabular-nums",
                                item.severity === "error" ? "text-destructive" : item.severity === "warning" ? "text-on-surface-variant" : "text-primary",
                              )}
                            >
                              {item.score}%
                            </span>
                          </div>
                          <p className="line-clamp-3 leading-5 text-on-surface-variant">{item.detail}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="font-medium">下一步操作</h3>
                      <StateBadge
                        variant={releaseReadinessActionItems.length ? "outline" : "secondary"}
                        label={
                          releaseReadinessActionItems.length
                            ? `${releaseReadinessActionItems.length} 项待处理`
                            : "已清理"
                        }
                        signal={Boolean(releaseReadinessActionItems.length)}
                      />
                    </div>
                    {releaseReadinessActionItems.length ? (
                      <div className="grid gap-2 md:grid-cols-3">
                        {releaseReadinessActionItems.map((item: any) => (
                          <div key={item.id} className="flex min-h-28 flex-col justify-between gap-3 rounded-xl bg-surface-container-high p-3">
                            <div className="min-w-0">
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <p className="truncate font-medium text-on-surface">{item.title}</p>
                                <span
                                  className={cn(
                                    "shrink-0 font-mono text-[0.72rem] tabular-nums",
                                    item.severity === "error" ? "text-destructive" : "text-on-surface-variant",
                                  )}
                                >
                                  {item.score}%
                                </span>
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
                </details>
                <details
                  className="group overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low"
                  data-builder-visual-audit=""
                  data-builder-visual-audit-density="collapsed-default"
                >
                  <summary
                    className="focus-ring flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-xs transition hover:bg-surface-container [&::-webkit-details-marker]:hidden"
                    data-builder-visual-audit-summary="single-row"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                      <ListChecks aria-hidden className="size-4 shrink-0 text-primary" />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-on-surface">目标窗口视觉校验</span>
                        <span className="block truncate text-[0.68rem] text-on-surface-variant">
                          溢出、重叠、尺寸、文本和 Frame 布局风险
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5" data-builder-visual-audit-summary-detail="compact-inline">
                      {/* Score and tallies are readouts; only problems need a chip. */}
                      <span
                        className={cn(
                          "font-mono text-[0.72rem] tabular-nums",
                          windowVisualAudit.errorCount > 0
                            ? "text-destructive"
                            : windowVisualAudit.warningCount > 0
                              ? "text-on-surface-variant"
                              : "text-primary",
                        )}
                      >
                        {windowVisualAudit.score}%
                      </span>
                      <span className="text-[0.68rem] text-on-surface-variant">
                        {windowVisualAudit.checkedFiles} 文件 · {windowVisualAudit.checkedItems} 控件
                      </span>
                      <StateBadge
                        variant={windowVisualAudit.errorCount > 0 ? "destructive" : "secondary"}
                        label={`${windowVisualAudit.errorCount} 错误`}
                        signal={!isQuietCount(windowVisualAudit.errorCount)}
                      />
                      <StateBadge
                        variant={windowVisualAudit.warningCount > 0 ? "outline" : "secondary"}
                        label={`${windowVisualAudit.warningCount} 警告`}
                        signal={!isQuietCount(windowVisualAudit.warningCount)}
                      />
                    </span>
                  </summary>
                  <div className="hidden border-t border-outline-variant p-3 group-open:block" data-builder-visual-audit-details="deferred">
                  <Progress value={windowVisualAudit.score} />
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                    <div className="rounded-2xl bg-surface-container p-3">
                      <p className="font-medium">{windowVisualAudit.checkedFiles}</p>
                      <p className="mt-1 text-[0.68rem] text-on-surface-variant">文件</p>
                    </div>
                    <div className="rounded-2xl bg-surface-container p-3">
                      <p className="font-medium">{windowVisualAudit.checkedItems}</p>
                      <p className="mt-1 text-[0.68rem] text-on-surface-variant">控件</p>
                    </div>
                    <div className="rounded-2xl bg-surface-container p-3">
                      <p className="font-medium text-destructive">{windowVisualAudit.errorCount}</p>
                      <p className="mt-1 text-[0.68rem] text-on-surface-variant">错误</p>
                    </div>
                    <div className="rounded-2xl bg-surface-container p-3">
                      <p className="font-medium">{windowVisualAudit.warningCount}</p>
                      <p className="mt-1 text-[0.68rem] text-on-surface-variant">警告</p>
                    </div>
                  </div>
                  {windowVisualAudit.issues.length === 0 ? (
                    <div className="mt-3 flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs text-on-surface-variant">
                      <CheckCircle2 aria-hidden className="size-4 text-primary" />
                      当前目标窗口没有发现明显视觉风险。
                    </div>
                  ) : (
                    <div className="mt-3 grid max-h-72 gap-2 overflow-auto pr-1 md:grid-cols-2">
                      {windowVisualAudit.issues.map((issue: any) => (
                        <article key={issue.id} className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <AlertTriangle
                                aria-hidden
                                className={cn("size-3.5 shrink-0", issue.severity === "error" ? "text-destructive" : "text-on-surface-variant")}
                              />
                              <span className="truncate font-medium">{issue.title}</span>
                            </div>
                            {/* Severity is the column value; the icon beside it
                                already carries the weight. */}
                            <StateLabel
                              showQuiet
                              variant={issue.severity === "error" ? "destructive" : "outline"}
                              label={visualAuditSeverityLabel(issue.severity)}
                            />
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
                          <p className="mt-1 text-on-surface-variant">从桌面 / 平板 / 手机运行时审阅结果反向定位到画布控件。</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <CountReadout
                            label={breakpointIssues.length ? `可修复 ${fixableBreakpointIssueCount}/${breakpointIssues.length}` : "0"}
                            count={breakpointIssues.length}
                          />
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
                          {breakpointIssues.map((issue: any) => (
                            <article key={issue.id} className="rounded-2xl border border-outline-variant bg-surface-container-high p-3">
                              <div className="mb-1 flex items-start justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  <AlertTriangle
                                    aria-hidden
                                    className={cn("size-3.5 shrink-0", issue.severity === "error" ? "text-destructive" : "text-on-surface-variant")}
                                  />
                                  <span className="truncate font-medium">{issue.title}</span>
                                </div>
                                <span className="font-mono text-[0.66rem] text-on-surface-variant">{issue.breakpoint}</span>
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
                        <StateLabel showQuiet variant="outline" label={activeProject.validationHistory[0].status} />
                      </div>
                      <div className="space-y-2">
                        {activeProject.validationHistory.slice(0, 6).map((entry: any) => (
                          <article key={entry.id} className="rounded-2xl border border-outline-variant bg-surface-container-high p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate font-medium">{validationTimeLabel(entry.createdAt)}</p>
                                <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">{entry.summary}</p>
                              </div>
                              <StateLabel label={`${entry.score}%`} />
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[0.68rem]">
                              <span className="rounded-xl bg-surface-container-low px-2 py-1">{entry.errorCount} 错误</span>
                              <span className="rounded-xl bg-surface-container-low px-2 py-1">{entry.warningCount} 警告</span>
                              <span className="rounded-xl bg-surface-container-low px-2 py-1">{entry.checkedItems} 控件</span>
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
                </details>
                <details
                  className="group overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low"
                  data-builder-activity-timeline=""
                  data-builder-activity-timeline-density="collapsed-default"
                >
                  <summary
                    className="focus-ring flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-xs transition hover:bg-surface-container [&::-webkit-details-marker]:hidden"
                    data-builder-activity-timeline-summary="single-row"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                      <Clock3 aria-hidden className="size-4 shrink-0 text-primary" />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-on-surface">活动时间线</span>
                        <span className="block truncate text-[0.68rem] text-on-surface-variant">验证、构建、运行、日志和 smoke 事件流</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5" data-builder-activity-timeline-summary-detail="compact-inline">
                      <StateBadge
                        variant={activityTimeline.length ? "secondary" : "outline"}
                        label={`${activityTimeline.length} 项`}
                        signal={!isQuietCount(activityTimeline.length)}
                      />
                      <StateBadge
                        variant={activityTimeline[0]?.status === "failed" || activityTimeline[0]?.status === "error" ? "destructive" : activityTimeline[0] ? "outline" : "secondary"}
                        label={activityTimeline[0] ? projectActivityStatusLabel(activityTimeline[0].status) : "空"}
                        signal={Boolean(activityTimeline[0]) && isSignalStateLabel(projectActivityStatusLabel(activityTimeline[0].status))}
                      />
                    </span>
                  </summary>
                  <div className="hidden border-t border-outline-variant p-3 group-open:block" data-builder-activity-timeline-details="deferred">
                  {activityTimeline.length ? (
                    <div className="space-y-2">
                      {activityTimeline.slice(0, 10).map((activity: any) => (
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
                              <StateLabel
                                showQuiet
                                variant={
                                  ["failed", "error", "stale"].includes(activity.status)
                                    ? "destructive"
                                    : ["warning", "truncated", "unknown"].includes(activity.status)
                                      ? "outline"
                                      : "secondary"
                                }
                                label={projectActivityStatusLabel(activity.status)}
                              />
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
                </details>
                <details
                  className="group overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low"
                  data-builder-build-history=""
                  data-builder-build-history-density="collapsed-default"
                >
                  <summary
                    className="focus-ring flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-xs transition hover:bg-surface-container [&::-webkit-details-marker]:hidden"
                    data-builder-build-history-summary="single-row"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                      <Box aria-hidden className="size-4 shrink-0 text-primary" />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-on-surface">构建产物历史</span>
                        <span className="block truncate text-[0.68rem] text-on-surface-variant">exe、安装包、输出目录和运行证据</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5" data-builder-build-history-summary-detail="compact-inline">
                      <CountReadout
                        label={`${activeProject.buildHistory?.length ?? 0} 项`}
                        count={activeProject.buildHistory?.length ?? 0}
                      />
                      {/* Build kind is a category of the artifact, not a state to act on. */}
                      {activeProject.buildHistory?.[0]?.buildKind ? (
                        <span className="text-[0.68rem] text-on-surface-variant">
                          {activeProject.buildHistory[0].buildKind}
                        </span>
                      ) : null}
                    </span>
                  </summary>
                  <div className="hidden border-t border-outline-variant p-3 group-open:block" data-builder-build-history-details="deferred">
                  {activeProject.buildHistory?.length ? (
                    <div className="grid gap-3 xl:grid-cols-2">
                      {activeProject.buildHistory.slice(0, 6).map((entry: any) => {
                        const primaryArtifactPath = entry.buildKind === "bundle" ? entry.bundlePaths?.[0] : entry.outputExePath;
                        const artifactDir = entry.buildKind === "bundle" ? entry.bundleDir || entry.outputDir : entry.outputDir;
                        return (
                        <article key={entry.id} className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{entry.label}</p>
                              <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">{validationTimeLabel(entry.createdAt)}</p>
                            </div>
                            <span className="text-[0.66rem] text-on-surface-variant">{entry.buildKind}</span>
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
                </details>
                <details
                  className="group rounded-lg border border-outline-variant bg-surface-container-low/80 p-1.5 text-xs"
                  data-builder-build-log-panel=""
                  data-builder-build-log-density="collapsed-summary"
                      data-builder-build-log-a11y="summary-first"
                >
                  <summary
                    className="focus-ring flex min-h-9 cursor-pointer list-none items-center justify-between gap-3 rounded-md border border-outline-variant bg-surface-container px-2 py-1 transition hover:bg-surface-container-high [&::-webkit-details-marker]:hidden"
                    data-builder-build-log-summary="single-row"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-secondary-container text-secondary-container-foreground">
                        <Terminal aria-hidden className="size-3.5" />
                      </span>
                      <h2 className="truncate text-sm font-medium">构建日志</h2>
                      {/* In-flight work chips; "exe 就绪" and "空闲" are routine
                          and must not spend the same visual budget. */}
                      <StateLabel
                        showQuiet
                        variant={buildArtifactReady ? "secondary" : "outline"}
                        className="h-5 shrink-0 px-1.5 text-[0.65rem]"
                        label={buildArtifactStatusLabel}
                      />
                      <span className="hidden min-w-0 truncate text-[0.68rem] text-on-surface-variant md:inline">
                        详细输出在底部 Output Dock
                      </span>
                    </div>
                    <div
                      className="hidden shrink-0 items-center gap-2 text-[0.68rem] text-on-surface-variant sm:flex"
                      data-builder-build-log-summary-detail="compact-inline"
                    >
                      {/* The open body never restates the line count, so this
                          must survive the disclosure — `group-open:hidden`
                          would drop it from the accessibility tree too. */}
                      <CountReadout
                        className="h-5 px-1.5 text-[0.65rem]"
                        label={`${buildLogLineCount} 行`}
                        count={buildLogLineCount}
                      />
                    </div>
                  </summary>
                  <div
                    className="mt-2 hidden gap-2 border-t border-outline-variant pt-2 group-open:grid"
                    data-builder-build-log-details="deferred"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-[0.68rem] text-on-surface-variant">
                        这里显示 npm install、Tauri 构建和 Rust 编译输出；持续查看时建议打开底部日志 Dock。
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 shrink-0 px-2 text-[0.68rem]"
                        onClick={() => openBottomDock("logs", false)}
                        data-builder-build-log-open-dock=""
                      >
                        <Terminal aria-hidden className="mr-1 size-3.5" />
                        日志 Dock
                      </Button>
                    </div>
                    <Textarea
                      data-builder-build-log=""
                      readOnly
                      value={buildLogPreviewText}
                      className="max-h-[320px] min-h-[220px] resize-none font-mono text-xs leading-5"
                    />
                  </div>
                </details>
              </section>
            </BuildWorkspace>
            </Suspense>
  );
}
