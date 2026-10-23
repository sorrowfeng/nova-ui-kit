/* eslint-disable @typescript-eslint/no-explicit-any */
// Extracted from BuilderShowcase.tsx (P2-9): the workspace shell chrome that
// wraps every mode. BuilderShowcase still owns the state; this only renders it.

import type {
  ReactNode,
} from "react";
import {
  AlertTriangle,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  Box,
  Braces,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  ClipboardPaste,
  Clock3,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileJson,
  Grid3x3,
  Keyboard,
  Layers,
  ListChecks,
  LoaderCircle,
  Lock,
  LockOpen,
  Maximize2,
  Menu,
  Monitor,
  MousePointer2,
  Move,
  MoveDown,
  MoveUp,
  Pause,
  Play,
  RectangleHorizontal,
  RotateCcw,
  Save,
  Scissors,
  ScrollText,
  Settings2,
  Square,
  Terminal,
  TextCursorInput,
  ToggleLeft,
  Trash2,
  Type,
  ZoomIn,
} from "lucide-react";
import {
  buildDiagnosticSeverityLabel,
} from "./status-labels";
import {
  CountReadout,
  StateBadge,
  StateLabel,
  isQuietStateLabel,
} from "./view-helpers";
import {
  BuilderComponentType,
} from "./types";
import {
  Button,
} from "@/components/ui/button";
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
import {
  Progress,
} from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ShellViewScope } from "./scope-shell";

export function ShellView(props: { scope: ShellViewScope }): ReactNode {
  const scope = props.scope;
  const {
    ArrowRight,
    BuildView,
    ChevronDown,
    DesignView,
    FolderOpen,
    Input,
    LogicView,
    OutputDock,
    PathRow,
    Plus,
    PreviewDock,
    ProjectView,
    Search,
    Suspense,
    Wand2,
    X,
    activateBuilderIssue,
    activeBottomDockHeight,
    activeBundleDir,
    activeBundlePath,
    activeEditorTabId,
    activeFile,
    activeFileDirty,
    activeModeItem,
    activeProject,
    activeProjectTasks,
    activeWorkflowRuntimeSession,
    activeWorkflowRuntimeStopId,
    allProjectActionPresets,
    applyPropertyIssueAutoFix,
    beginEditorFileTabDrag,
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
    buildError,
    builderIssueCount,
    builderIssues,
    building,
    bundling,
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
    clipboardRef,
    closeCanvasContextMenu,
    closeCleanEditorFileTabs,
    closeEditorFileTab,
    closeEditorFileTabsToRight,
    closeOtherEditorFileTabs,
    closeProjectExplorerContextMenu,
    cn,
    confirmDestructiveAction,
    convertFileSrc,
    copiedArtifactPath,
    copiedOutputLog,
    copyArtifactPath,
    copyBottomDockLog,
    createNewFileFromNavigator,
    destructiveAction,
    dirtyUiFileCount,
    diskBusy,
    dispatchNovaEditorCommand,
    draggingEditorFileTabId,
    dropEditorFileTab,
    dropIntent,
    editorWorkflowStepStates,
    enqueueProjectTask,
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
    focusLeftRunControls,
    focusPropertyIssue,
    focusRustDiagnostic,
    focusableTabOrderItems,
    getDefinition,
    getItemSummary,
    handleBottomDockTabChange,
    handleCanvasContextInsertSearchKeyDown,
    insertComponentFromCanvasContext,
    isEditableRustDiagnostic,
    items,
    latestRailPreset,
    latestRailPresetStatusLabel,
    latestRailPresetStatusVariant,
    latestRailPresetStepLabel,
    latestRailPresetSummary,
    latestRailPresetTask,
    latestReleasePipeline,
    latestRunSessionEntry,
    latestRunSessionRunning,
    launchActiveOutputExecutable,
    launchingExeId,
    leftRunControlsRef,
    leftRunTaskTimelineRows,
    leftRunTaskTimelineSummary,
    loadWorkspace,
    mode,
    modeBarItems,
    navigateBuilderIssue,
    openBottomDock,
    openEditorFileIds,
    openEditorTab,
    openEditorTabCountLabel,
    openEditorTabs,
    openFeedbackPanel,
    openLocalArtifact,
    openLocalPath,
    openRelevantTaskDock,
    operationMonitorDetail,
    operationMonitorStatus,
    operationMonitorTask,
    operationMonitorTitle,
    operationMonitorVisible,
    outputDockWorkspaceAvoidancePadding,
    outputDockWorkspaceHeight,
    outputDockWorkspacePadding,
    outputDockWorkspaceState,
    outputDockWorkspaceStyle,
    page,
    palettePointerDrag,
    parentPathFromPath,
    previewAutoRefresh,
    previewGeneratedWeb,
    previewVersion,
    previewWebPath,
    projectExplorerActionLabel,
    projectExplorerContextMenu,
    projectExplorerContextNode,
    projectExplorerPrimaryActionLabel,
    projectJumpFeedback,
    projectLocatorControl,
    projectSettingsDirty,
    projectSourceDirty,
    projectTaskElapsedLabel,
    projectTaskKindLabel,
    projectTaskLogSearchQuery,
    projectTaskProgress,
    projectTaskStatusLabel,
    projectTaskStatusVariant,
    propertySectionForProp,
    queuedProjectTaskCount,
    quickTextPropLabel,
    railArtifactStateLabel,
    railBundleTargetLabel,
    railConfigurationLabel,
    railEventTargetLabel,
    railKitLabel,
    railQueueSummaryLabel,
    railReleaseTargetLabel,
    railRunTargetLabel,
    railTaskCountLabel,
    railTaskStateLabel,
    railWindowTargetLabel,
    refreshPreviewFrame,
    releaseWindowShellMatchesPage,
    requestResetCurrentFile,
    rerunLatestRailPreset,
    retryLastFailedTask,
    retryProjectTask,
    revealEditorTabInProject,
    runCanvasContextAction,
    runEditorWorkflowStep,
    runProjectExplorerContextAction,
    runSelectedEventAndRevealLogs,
    runSelectedRailActionPreset,
    runTaskQueueRecommendedAction,
    runWorkflowPrimaryAction,
    runningProjectTask,
    rustLogicDirty,
    saved,
    selectedBatchRuntimeSummary,
    selectedBuilderIssue,
    selectedEventCommand,
    selectedIds,
    selectedItems,
    selectedProjectTask,
    selectedProjectTaskLogLines,
    selectedProjectTaskLogMatchCount,
    selectedRailActionPreset,
    selectedRailActionPresetStepLabel,
    selectedRailKitPlanStats,
    selectedRailKitStepRows,
    selectedSimulatorTraceLogPreview,
    setBottomDockExpanded,
    setBottomDockExpandedHeight,
    setBottomDockHeight,
    setBottomDockLogSearchQuery,
    setBottomDockMinimized,
    setCanvasContextInsertActiveIndex,
    setCanvasContextInsertQuery,
    setDestructiveAction,
    setDraggingEditorFileTabId,
    setMode,
    setPreviewAutoRefresh,
    setProjectTaskLogSearchQuery,
    setRightDockTab,
    setSelectedProjectTaskId,
    setSelectedRailActionPresetId,
    stopRunSession,
    stopWorkflowRuntimeSession,
    stoppingRunId,
    suggestedWorkflowStepId,
    switchEditorMode,
    syncReleaseWindowFromActivePage,
    taskQueueNextActionLabel,
    taskQueueStateDetail,
    taskQueueStateTitle,
    taskQueueStateTone,
    textPropertyValue,
    validatingWindow,
    visibleProjectTasks,
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
  } = scope;

  return (
      <div className="h-full min-h-0 overflow-hidden bg-surface-container-lowest">
        <Dialog open={Boolean(destructiveAction)} onOpenChange={(open) => !open && setDestructiveAction(null)}>
          <DialogContent className="sm:max-w-[420px]" data-builder-destructive-dialog="">
            <DialogHeader>
              <DialogTitle data-builder-destructive-dialog-title="">{destructiveAction?.title ?? "确认操作"}</DialogTitle>
              <DialogDescription data-builder-destructive-dialog-description="">
                {destructiveAction?.description ?? "应用到当前工作区前，请先确认这个操作。"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="ghost" data-builder-destructive-cancel="" onClick={() => setDestructiveAction(null)}>
                取消
              </Button>
              <Button type="button" variant="destructive" data-builder-destructive-confirm="" onClick={confirmDestructiveAction}>
                {destructiveAction?.confirmLabel ?? "确认"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Persistent live region: aria-live only announces reliably when the
            node exists before its text changes, so keep this mounted and mirror
            the transient toast into it (checklist 6.x). */}
        <div
          data-builder-live-region=""
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {projectJumpFeedback ? `${projectJumpFeedback.title} ${projectJumpFeedback.detail ?? ""}` : ""}
        </div>
          <div className="grid h-full min-h-0 grid-cols-[72px_minmax(0,1fr)]">

                <nav
              className="flex flex-col items-stretch gap-2 border-r border-outline-variant bg-surface-container-low px-2 py-3"
              aria-label="编辑器模式"
              data-builder-mode-rail="qt-creator-left"
              data-builder-mode-count={modeBarItems.length}
            >
              <span className="mx-auto mb-1 flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-m3-1">
                <activeModeItem.icon aria-hidden className="size-4" />
              </span>
              {modeBarItems.map((item: any) => (
                <button
                  key={item.mode}
                  type="button"
                  data-builder-mode-button={item.mode}
                  aria-label={`${item.label}模式`}
                  aria-current={mode === item.mode ? "page" : undefined}
                  className={cn(
                    "focus-ring group flex h-10 w-full min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.56rem] font-medium leading-none transition",
                    mode === item.mode
                      ? "bg-secondary-container text-secondary-container-foreground shadow-m3-1"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                  )}
                  title={`${item.label} · ${item.detail}`}
                  onClick={() => switchEditorMode(item.mode)}
                >
                  <item.icon aria-hidden className="size-4 shrink-0" />
                  <span className="max-w-full truncate">{item.label}</span>
                </button>
              ))}
              <div
                ref={leftRunControlsRef}
                tabIndex={-1}
                className="mt-auto flex flex-col gap-0.5 border-t border-outline-variant/70 bg-surface-container-lowest/45 px-2 py-1.5"
                aria-label="构建与运行快捷操作"
                data-builder-left-run-controls=""
                data-builder-left-run-controls-layout="qt-creator-kit"
                data-builder-left-run-visible-actions="primary-run-build-more"
                data-builder-left-rail-utility-strip="qt-creator-minimal"
                data-builder-run-command-owner="primary-left-rail"
                data-builder-command-ownership="left-rail-primary titlebar-menu-secondary build-page-config-only"
              >
                <div
                  className="sr-only"
                  data-builder-left-run-controls-primary-owner=""
                >
                  <span className="truncate text-[0.58rem] font-semibold uppercase tracking-[0.08em]">主运行入口</span>
                  <span className="shrink-0 rounded-full bg-surface/60 px-1.5 py-0.5 text-[0.52rem] text-on-surface-variant">Build/Run owner</span>
                </div>
                <button
                  type="button"
                  data-builder-rail-kit=""
                  aria-label={`打开构建配置：${railConfigurationLabel}`}
                  title={`Kit：${railKitLabel} · ${railConfigurationLabel}`}
                  className="focus-ring flex h-8 w-full items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
                  onClick={() => setMode("build")}
                >
                  <Settings2 aria-hidden className="size-4" />
                  <span className="sr-only">{railKitLabel} · {railRunTargetLabel} · {railTaskStateLabel}</span>
                </button>
                <div
                  className="sr-only"
                  data-builder-rail-kit-preset=""
                  title={selectedRailActionPreset?.detail}
                >
                  <div className="flex items-center justify-between gap-1 px-1">
                    <span className="truncate text-[0.56rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">预设</span>
                    <span className="shrink-0 rounded-full bg-surface-container-high px-1.5 py-0.5 text-[0.54rem] text-on-surface-variant">
                      {selectedRailActionPresetStepLabel}
                    </span>
                  </div>
                  <Select value={selectedRailActionPreset?.id ?? ""} onValueChange={setSelectedRailActionPresetId}>
                    <SelectTrigger
                      inputSize="sm"
                      className="h-8 w-full rounded-xl bg-surface-container-low px-2 text-[0.62rem]"
                      data-builder-rail-kit-preset-select=""
                      aria-label="选择构建运行 Kit preset"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start" className="w-72">
                      {allProjectActionPresets.map((preset: any) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.title} · {preset.badge}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div
                    className="space-y-1 rounded-xl bg-surface-container-low p-1"
                    data-builder-rail-kit-step-preview=""
                    data-builder-rail-kit-step-count={selectedRailKitStepRows.length}
                  >
                    {selectedRailKitStepRows.slice(0, 3).map((step: any) => (
                      <button
                        key={step.id}
                        type="button"
                        className="focus-ring grid w-full grid-cols-[1.15rem_minmax(0,1fr)_auto] items-center gap-1 rounded-lg px-1.5 py-1 text-left text-[0.56rem] transition hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-45"
                        data-builder-rail-kit-step={step.actionId}
                        data-builder-rail-kit-step-state={step.status}
                        data-builder-rail-kit-step-run={step.actionId}
                        title={step.detail}
                        aria-label={`运行 Kit 第 ${step.index + 1} 步：${step.title}`}
                        disabled={Boolean(runningProjectTask) || queuedProjectTaskCount > 0}
                        onClick={() => enqueueProjectTask(step.actionId)}
                      >
                        <span className="flex size-4 items-center justify-center rounded-full bg-surface-container-high font-mono text-[0.52rem] text-on-surface-variant">
                          {step.index + 1}
                        </span>
                        <span className="min-w-0 truncate font-medium text-on-surface">{step.title}</span>
                        <StateLabel showQuiet variant={step.statusVariant} className="shrink-0 px-1.5 py-0.5 text-[0.5rem]" label={step.statusLabel} />
                      </button>
                    ))}
                    {selectedRailKitStepRows.length > 3 ? (
                      <button
                        type="button"
                        className="focus-ring flex w-full items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-[0.56rem] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                        data-builder-rail-kit-step-overflow=""
                        onClick={() => setMode("build")}
                      >
                        <span className="truncate">还有 {selectedRailKitStepRows.length - 3} 步在 构建 页查看</span>
                        <ChevronRight aria-hidden className="size-3 shrink-0" />
                      </button>
                    ) : null}
                  </div>
                  <div
                    className="rounded-xl border border-outline-variant/70 bg-surface-container-low px-2 py-1.5"
                    data-builder-rail-kit-plan=""
                    data-builder-rail-kit-plan-state={selectedRailKitPlanStats.state}
                    data-builder-rail-kit-plan-progress={selectedRailKitPlanStats.progress}
                    data-builder-rail-kit-plan-total={selectedRailKitPlanStats.total}
                    data-builder-rail-kit-plan-completed={selectedRailKitPlanStats.completed}
                    data-builder-rail-kit-plan-failed={selectedRailKitPlanStats.failed}
                    data-builder-rail-kit-plan-waiting={selectedRailKitPlanStats.waiting}
                    data-builder-rail-kit-plan-next-step={selectedRailKitPlanStats.nextStep?.actionId ?? "none"}
                    title={`下一步：${selectedRailKitPlanStats.nextStep?.title ?? "无"} · ${selectedRailKitPlanStats.summary}`}
                  >
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <span className="truncate text-[0.56rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">计划</span>
                      <span className="shrink-0 rounded-full bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.52rem] text-on-surface-variant">
                        {selectedRailKitPlanStats.completed}/{selectedRailKitPlanStats.total}
                      </span>
                    </div>
                    <Progress className="mt-1 h-1" value={selectedRailKitPlanStats.progress} />
                    <div className="mt-1 flex min-w-0 items-center justify-between gap-2 text-[0.54rem]">
                      <span className="min-w-0 truncate text-on-surface-variant" data-builder-rail-kit-plan-next="">
                        {selectedRailKitPlanStats.nextStep ? `下一步 ${selectedRailKitPlanStats.nextStep.index + 1}: ${selectedRailKitPlanStats.nextStep.title}` : "没有待执行步骤"}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 font-medium",
                          selectedRailKitPlanStats.state === "attention"
                            ? "bg-destructive/15 text-destructive"
                            : selectedRailKitPlanStats.state === "running"
                              ? "bg-primary/15 text-primary"
                              : selectedRailKitPlanStats.state === "complete"
                                ? "bg-secondary-container text-secondary-container-foreground"
                                : "bg-surface-container-high text-on-surface-variant",
                        )}
                        data-builder-rail-kit-plan-summary=""
                      >
                        {selectedRailKitPlanStats.summary}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-builder-rail-run-selected-preset=""
                    className="focus-ring flex w-full min-w-0 items-center justify-center gap-1 rounded-xl bg-secondary-container px-1.5 py-1 text-[0.6rem] font-medium text-secondary-container-foreground transition hover:brightness-95 disabled:opacity-45"
                    disabled={!selectedRailActionPreset || Boolean(runningProjectTask) || queuedProjectTaskCount > 0}
                    onClick={runSelectedRailActionPreset}
                  >
                    <Play aria-hidden className="size-3 shrink-0" />
                    <span className="truncate">{selectedRailActionPreset?.badge ?? "运行"}</span>
                  </button>
                </div>
                <div
                  className="sr-only"
                  data-builder-rail-recent-run=""
                  data-builder-rail-recent-run-state={latestRailPresetTask?.status ?? "idle"}
                  title={latestRailPresetSummary}
                >
                  <div className="flex items-center justify-between gap-1 px-1">
                    <span className="truncate text-[0.56rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">最近</span>
                    <StateLabel
                      showQuiet
                      variant={latestRailPresetStatusVariant}
                      className="shrink-0 px-1.5 py-0.5 text-[0.5rem]"
                      label={latestRailPresetStatusLabel}
                      data-builder-rail-recent-run-status=""
                    />
                  </div>
                  <button
                    type="button"
                    className="focus-ring grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 rounded-xl px-1.5 py-1 text-left transition hover:bg-surface-container-high"
                    data-builder-rail-open-last-preset-task=""
                    aria-label={latestRailPresetTask ? `打开最近运行任务：${latestRailPresetTask.title}` : "打开任务队列"}
                    onClick={() => openRelevantTaskDock(latestRailPresetTask, true)}
                  >
                    <ScrollText aria-hidden className="size-3 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block truncate text-[0.62rem] font-medium text-on-surface" data-builder-rail-recent-run-title="">
                        {latestRailPresetTask?.pipelinePresetTitle ?? latestRailPreset?.title ?? "尚未运行 preset"}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.54rem] text-on-surface-variant" data-builder-rail-recent-run-detail="">
                        {latestRailPresetTask?.title ?? "运行后可直接回放上一次 Kit"}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.52rem] text-on-surface-variant">
                      {latestRailPresetStepLabel}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="focus-ring flex w-full min-w-0 items-center justify-center gap-1 rounded-xl px-1.5 py-1 text-[0.6rem] font-medium text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface disabled:opacity-45"
                    data-builder-rail-rerun-last-preset=""
                    disabled={Boolean(runningProjectTask) || queuedProjectTaskCount > 0 || (!latestRailPreset && !selectedRailActionPreset)}
                    onClick={rerunLatestRailPreset}
                  >
                    <RotateCcw aria-hidden className="size-3 shrink-0" />
                    <span className="truncate">{latestRailPreset ? `回放 ${latestRailPreset.badge}` : "回放当前 Kit"}</span>
                  </button>
                </div>
                <div
                  className="sr-only"
                  data-builder-rail-run-target=""
                  aria-label="当前运行目标"
                >
                  <div className="flex items-center justify-between gap-1 px-1">
                    <span className="truncate text-[0.56rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">Target</span>
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        workflowRuntimeActive ? "bg-primary" : activeProject.outputExePath ? "bg-tertiary" : "bg-outline",
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <button
                    type="button"
                    className="focus-ring grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-1.5 rounded-xl px-1.5 py-1 text-left transition hover:bg-surface-container-high"
                    data-builder-rail-ui-window-target=""
                    title={`当前 UI：${activeFile.name} · ${railWindowTargetLabel}`}
                    onClick={() => {
                      setMode("design");
                      setRightDockTab("properties");
                    }}
                  >
                    <Monitor aria-hidden className="size-3 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block truncate text-[0.56rem] text-on-surface-variant">UI</span>
                      <span className="block truncate text-[0.62rem] font-medium text-on-surface">{railWindowTargetLabel}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="focus-ring grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-1.5 rounded-xl px-1.5 py-1 text-left transition hover:bg-surface-container-high"
                    data-builder-rail-release-target=""
                    title={`发布：${railReleaseTargetLabel} · ${railBundleTargetLabel}`}
                    onClick={() => setMode("build")}
                  >
                    <Download aria-hidden className="size-3 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block truncate text-[0.56rem] text-on-surface-variant">Release</span>
                      <span className="block truncate text-[0.62rem] font-medium text-on-surface">{railBundleTargetLabel}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="focus-ring grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-1.5 rounded-xl px-1.5 py-1 text-left transition hover:bg-surface-container-high"
                    data-builder-rail-artifact-target=""
                    title={activeProject.outputExePath || activeBundlePath || "还没有生成桌面产物"}
                    onClick={() => openBottomDock("output", false)}
                  >
                    <FileJson aria-hidden className="size-3 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block truncate text-[0.56rem] text-on-surface-variant">产物</span>
                      <span className="block truncate text-[0.62rem] font-medium text-on-surface">{railArtifactStateLabel}</span>
                    </span>
                  </button>
                  {!releaseWindowShellMatchesPage ? (
                    <button
                      type="button"
                      className="focus-ring flex w-full min-w-0 items-center justify-center gap-1 rounded-xl bg-secondary-container px-1.5 py-1 text-[0.6rem] font-medium text-secondary-container-foreground transition hover:brightness-95"
                      data-builder-rail-sync-window-target=""
                      title="将当前 UI 窗体类型、标题栏和尺寸同步到 Release 目标"
                      onClick={syncReleaseWindowFromActivePage}
                    >
                      <Save aria-hidden className="size-3 shrink-0" />
                      <span className="truncate">同步窗口</span>
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  data-builder-rail-primary-workflow=""
                  data-builder-rail-run-shortcut="Ctrl+Shift+R"
                  aria-label={workflowRuntimeActive ? "停止正在运行的目标 exe" : workflowPrimaryActionLabel}
                  title={`${workflowRailDetail} · Ctrl+Shift+R`}
                  className={cn(
                    "focus-ring flex h-8 w-full items-center justify-center rounded-lg text-[0.62rem] font-semibold transition disabled:opacity-45",
                    workflowRuntimeActive
                      ? "bg-destructive/10 text-destructive hover:bg-destructive/15"
                      : workflowComplete
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary-container text-secondary-container-foreground",
                  )}
                  onClick={runWorkflowPrimaryAction}
                  disabled={workflowPrimaryActionDisabled}
                >
                  {workflowRuntimeActive ? (
                    stoppingRunId === activeWorkflowRuntimeStopId ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Square aria-hidden className="size-4" />
                  ) : launchingExeId === "active-output" ? (
                    <LoaderCircle aria-hidden className="size-4 animate-spin" />
                  ) : (
                    <Play aria-hidden className="size-3.5 shrink-0" />
                  )}
                  {/* Run is the product's primary verb. An icon-only affordance
                      loses it to the unlabeled rail, so it gets the one word a
                      Qt Creator user looks for. */}
                  <span className="min-w-0 truncate">{workflowRuntimeActive ? "停止" : "运行"}</span>
                  <span className="sr-only">{workflowPrimaryActionLabel}</span>
                </button>
                <div className="sr-only">
                  <Progress className="h-1" value={workflowProgressValue} />
                </div>
                <div className="flex flex-col gap-1" data-builder-rail-quick-actions="" data-builder-left-rail-buttons="qt-creator-minimal">
                  <button
                    type="button"
                    data-builder-rail-save=""
                    aria-label={saved ? "项目已保存" : "保存项目"}
                    title={saved ? "项目已保存" : "保存项目"}
                    className={cn(
                      "sr-only focus-ring h-9 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface disabled:opacity-45",
                      diskBusy && "bg-primary/10 text-primary",
                    )}
                    onClick={() => enqueueProjectTask("save-project")}
                    disabled={diskBusy}
                  >
                    {diskBusy ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : saved ? <CheckCircle2 aria-hidden className="size-4 text-primary" /> : <Save aria-hidden className="size-4" />}
                  </button>
                  <button
                    type="button"
                    data-builder-rail-check=""
                    data-builder-rail-check-shortcut="Ctrl+Alt+B"
                    aria-label={runningProjectTask ? `任务运行中：${runningProjectTask.title}` : "运行全部检查 Ctrl+Alt+B"}
                    title={runningProjectTask ? `任务运行中：${runningProjectTask.title}` : "运行全部检查 Ctrl+Alt+B"}
                    className={cn(
                      "sr-only focus-ring h-9 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface",
                      runningProjectTask && "bg-primary/10 text-primary",
                    )}
                    onClick={() => enqueueProjectTask("quick-check-all")}
                  >
                    {runningProjectTask ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Terminal aria-hidden className="size-4" />}
                  </button>
                  <button
                    type="button"
                    data-builder-rail-build=""
                    data-builder-rail-build-shortcut="Ctrl+Shift+B"
                    aria-label={building ? "正在构建 exe" : bundling ? "正在打包安装包" : "构建 exe Ctrl+Shift+B"}
                    title={building ? "正在构建 exe" : bundling ? "正在打包安装包" : "构建 exe Ctrl+Shift+B"}
                    className="focus-ring flex h-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:brightness-95 disabled:opacity-45"
                    onClick={() => enqueueProjectTask("build-exe")}
                    disabled={building || bundling}
                  >
                    {building || bundling ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Download aria-hidden className="size-4" />}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" data-builder-rail-more="" aria-label="更多运行与构建操作" title="更多运行与构建操作" className="h-8 w-full rounded-lg">
                        <Menu aria-hidden className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="end"
                      className="w-64"
                      data-builder-rail-kit-command-menu=""
                      data-builder-rail-kit-command-menu-state={taskQueueStateTone}
                    >
                      <DropdownMenuLabel className="flex items-center justify-between gap-2">
                        <span className="truncate">运行与构建</span>
                        <span className="shrink-0 rounded-full bg-surface-container-high px-2 py-0.5 text-[0.64rem] font-medium text-on-surface-variant" data-builder-rail-kit-command-menu-summary="">
                          {railQueueSummaryLabel}
                        </span>
                      </DropdownMenuLabel>
                      <DropdownMenuItem data-builder-rail-run="" disabled={!selectedEventCommand} onSelect={runSelectedEventAndRevealLogs}>
                        <Play aria-hidden className="size-4" />
                        <span className="min-w-0 flex-1 truncate">运行当前事件</span>
                        <span className="max-w-20 truncate text-[0.68rem] text-on-surface-variant">{railEventTargetLabel}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        data-builder-rail-run-exe=""
                        data-builder-rail-run-state={workflowRuntimeActive ? "running" : "idle"}
                        title="Ctrl+Shift+R"
                        disabled={
                          workflowRuntimeActive
                            ? !activeWorkflowRuntimeSession || Boolean(stoppingRunId)
                            : !activeProject.outputExePath || Boolean(launchingExeId)
                        }
                        onSelect={() => {
                          if (workflowRuntimeActive && activeWorkflowRuntimeSession) {
                            setMode("build");
                            openBottomDock("logs", false);
                            void stopWorkflowRuntimeSession(activeWorkflowRuntimeSession);
                            return;
                          }
                          void launchActiveOutputExecutable();
                        }}
                      >
                        {workflowRuntimeActive ? <Square aria-hidden className="size-4" /> : <Monitor aria-hidden className="size-4" />}
                        <span className="min-w-0 flex-1 truncate">{workflowRuntimeActive ? "停止正在运行的 exe" : "运行生成 exe"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        data-builder-rail-menu-quick-check=""
                        disabled={Boolean(runningProjectTask) || queuedProjectTaskCount > 0}
                        onSelect={() => enqueueProjectTask("quick-check-all")}
                      >
                        <Terminal aria-hidden className="size-4" />
                        <span className="min-w-0 flex-1 truncate">运行全部检查</span>
                        <span className="shrink-0 font-mono text-[0.68rem] text-on-surface-variant">Ctrl+Alt+B</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        data-builder-rail-menu-validate-window=""
                        disabled={validatingWindow || bundling || building}
                        onSelect={() => enqueueProjectTask("validate-window")}
                      >
                        <CheckCircle2 aria-hidden className="size-4" />
                        <span className="min-w-0 flex-1 truncate">验证生成窗口</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        data-builder-rail-menu-bundle-installer=""
                        disabled={bundling || building}
                        onSelect={() => enqueueProjectTask("bundle-installer")}
                      >
                        <Download aria-hidden className="size-4" />
                        <span className="min-w-0 flex-1 truncate">打包安装器</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem data-builder-rail-output="" onSelect={() => openBottomDock("output", false)}>
                        <FileJson aria-hidden className="size-4" />
                        <span className="min-w-0 flex-1 truncate">打开输出 Dock</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem data-builder-rail-sync-window="" disabled={releaseWindowShellMatchesPage} onSelect={syncReleaseWindowFromActivePage}>
                        <Save aria-hidden className="size-4" />
                        <span className="min-w-0 flex-1 truncate">同步当前 UI 窗口到发布目标</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => openRelevantTaskDock(undefined, true)}>
                        <ScrollText aria-hidden className="size-4" />
                        <span className="min-w-0 flex-1 truncate">打开任务队列</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem data-builder-rail-menu-build-config="" onSelect={() => setMode("build")}>
                        <Settings2 aria-hidden className="size-4" />
                        <span className="min-w-0 flex-1 truncate">配置构建目标</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* This button only runs the readiness checks. It used to be
                      titled 一键运行（保存→生成→构建）, which promised a build
                      it never performed — so it lost the Play icon and the
                      Run wording, and the real Run stayed on the rail. */}
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="h-8 gap-1 px-2"
                    data-builder-preview-run=""
                    aria-label="就绪检查"
                    title="就绪检查（校验生成计划与配置，不构建）"
                    onClick={() => dispatchNovaEditorCommand("preview-run")}
                  >
                    <CheckCircle2 aria-hidden className="size-3.5" />
                    <span className="truncate text-[0.62rem]">就绪检查</span>
                  </Button>
                  {/* The cheap way to see the designed screen running. Next to
                      Run this is what a beginner should reach for first. */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 gap-1 px-2"
                    data-builder-preview-web=""
                    aria-label="预览"
                    title="网页预览（只编译前端，比构建 exe 快）"
                    onClick={() => void previewGeneratedWeb()}
                  >
                    <Monitor aria-hidden className="size-3.5" />
                    <span className="truncate text-[0.62rem]">预览</span>
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="size-8"
                    data-builder-retry-failed=""
                    aria-label="重试失败任务"
                    title="重试最近失败的任务"
                    onClick={retryLastFailedTask}
                  >
                    <RotateCcw aria-hidden className="size-4" />
                  </Button>
                </div>
                <button
                  type="button"
                  data-builder-rail-task-queue=""
                  data-builder-left-run-operation-monitor=""
                  data-builder-left-run-operation-state={taskQueueStateTone}
                  data-builder-left-run-operation-task={operationMonitorTask?.actionId ?? "idle"}
                  data-builder-left-run-operation-status={operationMonitorTask?.status ?? "idle"}
                  data-builder-left-run-operation-count={activeProjectTasks.length}
                  aria-label={`运行监视器：${taskQueueStateTitle}，${taskQueueNextActionLabel}`}
                  title={`${taskQueueStateTitle} · ${taskQueueStateDetail}`}
                  className={cn(
                    "sr-only",
                    taskQueueStateTone === "attention"
                      ? "border-destructive/35 bg-destructive/10"
                      : taskQueueStateTone === "running"
                        ? "border-primary/35 bg-primary/10"
                        : taskQueueStateTone === "paused"
                          ? "border-outline bg-surface-container-high"
                          : "border-outline-variant",
                    bottomDockTab === "tasks" && !bottomDockMinimized && "border-primary/50 bg-secondary-container text-secondary-container-foreground",
                  )}
                  onClick={runTaskQueueRecommendedAction}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-lg",
                          taskQueueStateTone === "attention"
                            ? "bg-destructive/15 text-destructive"
                            : taskQueueStateTone === "running"
                              ? "bg-primary/15 text-primary"
                              : taskQueueStateTone === "queued" || taskQueueStateTone === "paused"
                                ? "bg-secondary-container text-secondary-container-foreground"
                                : "bg-surface-container-high text-on-surface-variant",
                        )}
                        aria-hidden="true"
                      >
                        {taskQueueStateTone === "running" ? (
                          <LoaderCircle className="size-3 animate-spin" />
                        ) : taskQueueStateTone === "attention" ? (
                          <AlertTriangle className="size-3" />
                        ) : taskQueueStateTone === "paused" ? (
                          <Pause className="size-3" />
                        ) : taskQueueStateTone === "queued" ? (
                          <Clock3 className="size-3" />
                        ) : (
                          <CheckCircle2 className="size-3" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[0.56rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">
                          监视器
                        </span>
                        <span
                          className="mt-0.5 block truncate text-[0.62rem] font-semibold text-on-surface"
                          data-builder-left-run-operation-title=""
                        >
                          {taskQueueStateTitle}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[0.56rem] text-on-surface-variant">{railTaskCountLabel}</span>
                  </span>
                  <span
                    className="mt-1 block truncate text-[0.56rem] text-on-surface-variant"
                    data-builder-left-run-operation-detail=""
                  >
                    {taskQueueStateDetail}
                  </span>
                  {operationMonitorTask ? (
                    <Progress className="mt-1 h-1" value={projectTaskProgress(operationMonitorTask.status)} />
                  ) : null}
                  <span className="mt-1 flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-[0.54rem] text-on-surface-variant">{railQueueSummaryLabel}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[0.52rem] font-medium",
                        taskQueueStateTone === "attention"
                          ? "bg-destructive/15 text-destructive"
                          : taskQueueStateTone === "running" || taskQueueStateTone === "ready"
                            ? "bg-secondary-container text-secondary-container-foreground"
                            : "bg-surface-container-high text-on-surface-variant",
                      )}
                      data-builder-left-run-operation-action=""
                    >
                      {taskQueueNextActionLabel}
                    </span>
                  </span>
                </button>
                <div
                  className="sr-only"
                  data-builder-left-run-task-timeline=""
                  data-builder-left-run-task-timeline-count={leftRunTaskTimelineRows.length}
                  title={leftRunTaskTimelineSummary}
                >
                  <div className="flex min-w-0 items-center justify-between gap-2 px-1">
                    <span className="truncate text-[0.56rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">时间线</span>
                    <button
                      type="button"
                      className="focus-ring shrink-0 rounded-lg px-1.5 py-0.5 text-[0.52rem] font-medium text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                      data-builder-left-run-task-timeline-open=""
                      onClick={() => openRelevantTaskDock(leftRunTaskTimelineRows[0] ?? null, true)}
                    >
                      任务
                    </button>
                  </div>
                  {leftRunTaskTimelineRows.length > 0 ? (
                    leftRunTaskTimelineRows.map((task: any) => (
                      <button
                        key={task.id}
                        type="button"
                        className="focus-ring grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 rounded-lg px-1.5 py-1 text-left text-[0.56rem] transition hover:bg-surface-container-high"
                        data-builder-left-run-task-timeline-row={task.actionId}
                        data-builder-left-run-task-timeline-status={task.status}
                        title={`${task.title} · ${projectTaskStatusLabel(task.status)} · ${task.summary ?? task.error ?? task.detail}`}
                        onClick={() => openRelevantTaskDock(task, true)}
                      >
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            task.status === "running"
                              ? "bg-primary"
                              : task.status === "failed"
                                ? "bg-destructive"
                                : task.status === "queued"
                                  ? "bg-tertiary"
                                  : task.status === "succeeded"
                                    ? "bg-secondary"
                                    : "bg-outline",
                          )}
                          aria-hidden="true"
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-on-surface" data-builder-left-run-task-timeline-title="">
                            {task.pipelinePresetTitle ? `${task.pipelinePresetTitle} / ${task.title}` : task.title}
                          </span>
                          <span className="mt-0.5 block truncate text-[0.52rem] text-on-surface-variant" data-builder-left-run-task-timeline-detail="">
                            {projectTaskStatusLabel(task.status)} · {projectTaskElapsedLabel(task)}
                          </span>
                        </span>
                        {/* Pipeline position is a tally and task.kind is a category. */}
                        <span className="shrink-0 px-1.5 py-0.5 text-[0.48rem] text-on-surface-variant">
                          {task.pipelineStepCount && task.pipelineStepIndex !== undefined ? `${task.pipelineStepIndex + 1}/${task.pipelineStepCount}` : task.kind}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-lg bg-surface-container-low px-2 py-1.5 text-[0.56rem] text-on-surface-variant" data-builder-left-run-task-timeline-empty="">
                      点击运行 Kit 后，这里会显示最近的检查、构建、运行和打包任务。
                    </div>
                  )}
                </div>
              </div>
            </nav>
            <div className="relative flex min-h-0 min-w-0 flex-col overflow-hidden">
          <div
            className="flex h-7 shrink-0 items-center gap-1.5 border-b border-outline-variant bg-surface-container-lowest px-2 py-0.5"
            data-builder-compact-topbar=""
            data-builder-compact-topbar-policy="status-locator-only"
          >
            <div className="hidden min-w-0 shrink-0 2xl:block 2xl:w-40">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-lg bg-secondary-container text-secondary-container-foreground">
                  <activeModeItem.icon aria-hidden className="size-3" />
                </span>
                <div className="flex min-w-0 items-baseline gap-1.5">
                  <h1 className="truncate text-[0.72rem] font-semibold tracking-normal">{activeProject.name}</h1>
                  <p className="shrink-0 text-[0.58rem] text-on-surface-variant">{activeModeItem.label}</p>
                </div>
              </div>
            </div>

            {projectLocatorControl}

            <div className="ml-auto flex shrink-0 items-center gap-1">
              <div
                className={cn(
                  "hidden h-6 min-w-0 max-w-[16rem] items-center gap-1.5 px-2 text-[0.64rem] font-medium md:flex",
                  // A saved document is just text; only unsaved work earns the pill.
                  projectSourceDirty || activeFileDirty
                    ? "rounded-lg border border-primary/40 bg-surface-container text-primary"
                    : "text-on-surface-variant",
                )}
                data-builder-active-document-status="compact"
                data-builder-topbar-status-chip-count="1"
                title={`${activeModeItem.label} · ${activeFile.name} · ${
                  projectSourceDirty
                    ? `${dirtyUiFileCount} 个 UI 文件、Rust ${rustLogicDirty ? "未保存" : "已同步"}、项目设置 ${projectSettingsDirty ? "未保存" : "已同步"}`
                    : activeFileDirty
                      ? "当前文件未保存"
                      : "项目来源已同步"
                }`}
              >
                <activeModeItem.icon aria-hidden className="size-3 shrink-0 text-primary" />
                <span className="shrink-0">{activeModeItem.label}</span>
                <span className="h-3 w-px shrink-0 bg-outline-variant" aria-hidden />
                <span
                  className="min-w-0 truncate"
                  data-builder-active-file-save-state={activeFileDirty ? "dirty" : "clean"}
                >
                  {activeFile.name}
                </span>
                <span className="h-3 w-px shrink-0 bg-outline-variant" aria-hidden />
                <span className="shrink-0" data-builder-project-source-dirty={projectSourceDirty ? "true" : "false"}>
                  {projectSourceDirty ? "未保存" : saved ? "已保存" : "已同步"}
                </span>
              </div>
              <button
                type="button"
                className="focus-ring hidden h-6 min-w-0 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-2 text-[0.62rem] font-medium text-on-surface-variant transition hover:border-primary/40 hover:bg-surface-container-high hover:text-on-surface 2xl:inline-flex"
                data-builder-topbar-run-owner=""
                data-builder-topbar-focus-run-kit=""
                data-builder-command-ownership-chip="left-rail-primary"
                aria-label="定位左下角构建运行 Kit"
                title={`构建/运行主入口在左下 Kit：${railQueueSummaryLabel}`}
                onClick={focusLeftRunControls}
              >
                <Play aria-hidden className="size-3 text-primary" />
                <span className="truncate">运行归左下 Kit</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="size-7 rounded-lg" data-builder-editor-more="" aria-label="打开编辑器更多操作" title="更多操作">
                    <Menu aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>工作区</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => enqueueProjectTask("save-project")}>
                    <Save aria-hidden className="size-4" />
                    <span className="min-w-0 flex-1 truncate">{saved ? "保存项目（已保存）" : "保存项目"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem data-builder-load="" onSelect={loadWorkspace}>
                    <FolderOpen aria-hidden className="size-4" />
                    <span className="min-w-0 flex-1 truncate">重载本地工作区</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => switchEditorMode("project")}>
                    <Settings2 aria-hidden className="size-4" />
                    <span className="min-w-0 flex-1 truncate">项目设置与文件树</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem data-builder-topbar-menu-focus-run-kit="" onSelect={focusLeftRunControls}>
                    <Play aria-hidden className="size-4" />
                    <span className="min-w-0 flex-1 truncate">定位左下运行 Kit</span>
                    <span className="ml-auto text-[0.66rem] text-on-surface-variant">Run</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>当前 UI 文件</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={createNewFileFromNavigator}>
                    <FileJson aria-hidden className="size-4" />
                    <span className="min-w-0 flex-1 truncate">新建 UI 文件</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem data-builder-reset="" onSelect={requestResetCurrentFile}>
                    <RotateCcw aria-hidden className="size-4" />
                    <span className="min-w-0 flex-1 truncate">清空当前 UI 文件</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div
            className="sr-only"
            data-builder-editor-tabs=""
            data-builder-editor-tab-count={openEditorTabs.length}
            data-builder-editor-tabs-visibility="sidebar-only"
            data-builder-editor-tabs-replaced-by="project-open-files"
          >
            <div className="subtle-scrollbar flex min-w-0 flex-1 items-end gap-1 overflow-x-auto" role="tablist" aria-label="打开的编辑器标签">
              {openEditorTabs.map((tab: any) => {
                const active = tab.id === activeEditorTabId;
                const TabIcon = tab.icon;
                const uiTabIndex = tab.fileId ? openEditorFileIds.indexOf(tab.fileId) : -1;
                const hasEditorTabsToRight = uiTabIndex >= 0 && uiTabIndex < openEditorFileIds.length - 1;
                const cleanClosableTabCount = openEditorFileIds.filter((fileId: any) => fileId !== activeFile.id && !fileSaveStates.get(fileId)?.dirty).length;
                return (
                  <div
                    key={tab.id}
                    className={cn(
                      "group grid h-8 max-w-[16.5rem] shrink-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center overflow-hidden rounded-t-xl border border-b-0 transition",
                      active
                        ? "border-outline-variant bg-surface-container text-on-surface shadow-m3-1"
                        : "border-transparent bg-transparent text-on-surface-variant hover:border-outline-variant hover:bg-surface-container-high",
                      tab.fileId && draggingEditorFileTabId === tab.fileId && "opacity-50",
                      tab.fileId && draggingEditorFileTabId && draggingEditorFileTabId !== tab.fileId && "ring-1 ring-primary/35",
                    )}
                    draggable={tab.kind === "ui"}
                    data-builder-editor-tab={tab.kind}
                    data-builder-editor-tab-state={active ? "active" : "idle"}
                    data-builder-editor-tab-dirty={tab.dirty ? "true" : "false"}
                    data-builder-editor-tab-draggable={tab.kind === "ui" ? "true" : "false"}
                    data-builder-editor-tab-dragging={tab.fileId && draggingEditorFileTabId === tab.fileId ? "true" : "false"}
                    data-builder-editor-tab-drop-target={tab.fileId && draggingEditorFileTabId && draggingEditorFileTabId !== tab.fileId ? "true" : "false"}
                    data-builder-editor-tab-target-mode={tab.targetMode}
                    data-builder-editor-tab-reveal-node={tab.revealNodeId}
                    onDragStart={(event) => {
                      if (tab.fileId) {
                        beginEditorFileTabDrag(event, tab.fileId);
                      }
                    }}
                    onDragOver={(event) => {
                      if (tab.fileId && draggingEditorFileTabId && draggingEditorFileTabId !== tab.fileId) {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                      }
                    }}
                    onDrop={(event) => {
                      if (tab.fileId) {
                        dropEditorFileTab(event, tab.fileId);
                      }
                    }}
                    onDragEnd={() => setDraggingEditorFileTabId("")}
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className="focus-ring flex h-full min-w-0 items-center gap-2 rounded-t-xl px-2.5 text-left"
                      title={`${tab.label} · ${tab.detail}`}
                      onClick={() => openEditorTab(tab)}
                    >
                      <TabIcon aria-hidden className={cn("size-3.5 shrink-0", active ? "text-primary" : "text-on-surface-variant")} />
                      <span className="min-w-0">
                        <span className="flex min-w-0 items-center gap-1.5">
                          {tab.dirty ? <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label="未保存" /> : null}
                          <span className="truncate text-[0.72rem] font-medium">{tab.label}</span>
                        </span>
                        <span className="mt-0.5 hidden max-w-full truncate text-[0.56rem] text-on-surface-variant lg:block">{tab.detail}</span>
                      </span>
                      <StateLabel showQuiet variant={active ? "secondary" : "outline"} className="ml-auto hidden h-5 shrink-0 px-1.5 text-[0.56rem] xl:inline-flex" label={tab.badge} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="focus-ring flex size-6 shrink-0 items-center justify-center rounded-lg text-on-surface-variant opacity-0 transition hover:bg-surface-container-highest hover:text-on-surface group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100"
                          data-builder-editor-tab-menu=""
                          aria-label={`${tab.label} 标签菜单`}
                          title="标签菜单"
                        >
                          <ChevronDown aria-hidden className="size-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64">
                        <DropdownMenuLabel>
                          <span className="block truncate">{tab.label}</span>
                          <span className="mt-0.5 block truncate text-[0.68rem] font-normal text-on-surface-variant">{tab.detail}</span>
                        </DropdownMenuLabel>
                        <DropdownMenuItem data-builder-editor-tab-menu-open="" onSelect={() => openEditorTab(tab)}>
                          <ArrowRight aria-hidden className="size-4" />
                          <span className="min-w-0 flex-1 truncate">打开</span>
                          <StateLabel label={tab.badge} />
                        </DropdownMenuItem>
                        <DropdownMenuItem data-builder-editor-tab-menu-reveal="" onSelect={() => revealEditorTabInProject(tab)}>
                          <FolderOpen aria-hidden className="size-4" />
                          <span className="min-w-0 flex-1 truncate">在项目树中定位</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem data-builder-editor-tab-menu-copy-path="" onSelect={() => void copyArtifactPath(tab.path)}>
                          <ClipboardCopy aria-hidden className="size-4" />
                          <span className="min-w-0 flex-1 truncate">复制项目路径</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem data-builder-editor-tab-menu-copy-relative-path="" onSelect={() => void copyArtifactPath(tab.relativePath)}>
                          <ClipboardCopy aria-hidden className="size-4" />
                          <span className="min-w-0 flex-1 truncate">复制相对路径</span>
                        </DropdownMenuItem>
                        {tab.kind === "ui" ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              data-builder-editor-tab-menu-close-right=""
                              disabled={!tab.fileId || !hasEditorTabsToRight}
                              onSelect={() => {
                                if (tab.fileId) {
                                  closeEditorFileTabsToRight(tab.fileId);
                                }
                              }}
                            >
                              <X aria-hidden className="size-4" />
                              <span className="min-w-0 flex-1 truncate">关闭右侧 UI 标签</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              data-builder-editor-tab-menu-close-clean=""
                              disabled={cleanClosableTabCount === 0}
                              onSelect={closeCleanEditorFileTabs}
                            >
                              <CheckCircle2 aria-hidden className="size-4" />
                              <span className="min-w-0 flex-1 truncate">关闭已同步 UI 标签</span>
                              <CountReadout label={String(cleanClosableTabCount)} count={cleanClosableTabCount} />
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              data-builder-editor-tab-menu-close-others=""
                              disabled={!tab.fileId || openEditorFileIds.length <= 1}
                              onSelect={() => {
                                if (tab.fileId) {
                                  closeOtherEditorFileTabs(tab.fileId);
                                }
                              }}
                            >
                              <X aria-hidden className="size-4" />
                              <span className="min-w-0 flex-1 truncate">关闭其他 UI 标签</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              data-builder-editor-tab-menu-close=""
                              disabled={!tab.closable || !tab.fileId}
                              onSelect={() => {
                                if (tab.fileId) {
                                  closeEditorFileTab(tab.fileId);
                                }
                              }}
                            >
                              <X aria-hidden className="size-4" />
                              <span className="min-w-0 flex-1 truncate">关闭当前标签</span>
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {tab.kind === "ui" ? (
                      <button
                        type="button"
                        className="focus-ring mr-1 flex size-6 shrink-0 items-center justify-center rounded-lg text-on-surface-variant opacity-0 transition hover:bg-surface-container-highest hover:text-on-surface group-hover:opacity-100 focus:opacity-100 disabled:pointer-events-none disabled:opacity-25"
                        data-builder-editor-tab-close=""
                        aria-label={`关闭 ${tab.label} 标签`}
                        title={tab.closable ? "关闭标签，不删除项目文件" : "至少保留一个 UI 标签"}
                        disabled={!tab.closable || !tab.fileId}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (tab.fileId) {
                            closeEditorFileTab(tab.fileId);
                          }
                        }}
                      >
                        <X aria-hidden className="size-3.5" />
                      </button>
                    ) : (
                      <span className="mr-2 size-2 rounded-full bg-outline-variant" aria-hidden />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="hidden min-w-0 shrink items-center gap-2 text-[0.62rem] text-on-surface-variant md:flex" data-builder-editor-tabs-summary="">
              {/* A tab tally is a readout; the pill made a number look like a state. */}
              <CountReadout className="max-w-[10rem] truncate" label={openEditorTabCountLabel} count={openEditorTabs.length} />
              <Button size="icon-sm" variant="ghost" className="size-7 rounded-lg" data-builder-editor-tabs-new-file="" aria-label="新建 UI 文件标签" title="新建 UI 文件" onClick={createNewFileFromNavigator}>
                <Plus aria-hidden className="size-4" />
              </Button>
            </div>
          </div>

          {mode === "build" ? (
          <div
            className="border-b border-outline-variant bg-surface-container-lowest px-2 py-1"
            data-builder-workflow-rail=""
            data-builder-workflow-rail-layout="compact-status"
            data-builder-workflow-rail-density="condensed-single-row"
            data-builder-feedback-strip-default="hidden"
          >
            <div className="mx-auto flex w-full max-w-full flex-col gap-1">
              <div className="flex h-9 min-w-0 max-w-full items-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-2 text-xs">
                <button
                  type="button"
                  className="focus-ring flex min-w-0 flex-[1.15] items-center gap-2 rounded-lg px-1.5 py-1 text-left transition hover:bg-surface-container-high"
                  onClick={() => openRelevantTaskDock()}
                  title={`${workflowRailStateLabel} · ${workflowRailDetail}`}
                >
                  <span
                    className={cn(
                      "size-2.5 shrink-0 rounded-full",
                      runningProjectTask
                        ? "bg-primary"
                        : failedProjectTaskCount > 0
                          ? "bg-destructive"
                          : queuedProjectTaskCount > 0
                            ? "bg-secondary"
                            : "bg-outline",
                    )}
                  />
                  <span className="min-w-0">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-medium text-on-surface">{workflowRailTitle}</span>
                      <StateBadge
                        variant={workflowRailBadgeVariant}
                        className="h-5 shrink-0 px-1.5 text-[0.58rem]"
                        label={workflowRailBadgeLabel}
                        signal={!isQuietStateLabel(workflowRailBadgeLabel)}
                      />
                    </span>
                    <span className="mt-0.5 block truncate text-[0.62rem] text-on-surface-variant">{workflowProgressLabel} · {workflowProgressValue}%</span>
                  </span>
                </button>
                <div
                  className="hidden min-w-0 flex-[1.4] items-center gap-2 lg:flex"
                  data-builder-workflow-summary="condensed"
                >
                  <span className="shrink-0 text-[0.62rem] font-medium uppercase tracking-[0.06em] text-on-surface-variant">
                    流程
                  </span>
                  <span className="min-w-0 truncate text-[0.66rem] text-on-surface-variant">
                    {workflowRailDetail}
                  </span>
                </div>
                <div className="hidden w-28 shrink-0 items-center gap-2 lg:flex">
                  <Progress className="h-1.5" value={workflowProgressValue} />
                  <span className="w-7 shrink-0 text-right font-mono text-[0.58rem] text-on-surface-variant">{workflowProgressValue}%</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 shrink-0 px-2 text-xs"
                      data-builder-workflow-path-trigger=""
                      aria-label="打开构建流程步骤"
                      title="打开构建流程步骤"
                    >
                      <Menu aria-hidden className="size-4" />
                      <span className="hidden sm:inline">流程</span>
                      <CountReadout label={String(workflowStepCount)} count={workflowStepCount} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-72"
                    data-builder-workflow-path="deferred-menu"
                    data-builder-workflow-path-default="collapsed"
                  >
                    <DropdownMenuLabel>构建流程</DropdownMenuLabel>
                    {editorWorkflowStepStates.map(({ step, status }: any, index: any) => {
                      const StepIcon = step.icon;
                      const suggested = suggestedWorkflowStepId === step.id;
                      return (
                        <DropdownMenuItem
                          key={step.id}
                          data-builder-workflow-step={step.id}
                          data-builder-workflow-menu-step={step.id}
                          data-builder-workflow-menu-step-status={status}
                          aria-current={suggested ? "step" : undefined}
                          onSelect={() => runEditorWorkflowStep(step)}
                          className="items-start gap-2"
                        >
                          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                            <StepIcon aria-hidden className="size-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="truncate font-medium">{index + 1}. {step.title}</span>
                              <StateLabel
                                showQuiet
                                variant={status === "failed" ? "destructive" : "secondary"}
                                className="h-5 shrink-0 px-1.5 py-0 text-[0.56rem]"
                                label={suggested && status === "idle" ? "下一步" : workflowStepStatusLabel(status)}
                              />
                            </span>
                            <span className="mt-0.5 block truncate text-[0.66rem] text-on-surface-variant">{step.detail}</span>
                          </span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex shrink-0 items-center gap-1" data-builder-workflow-feedback-actions="inline-icons">
                  <Button
                    size="icon-sm"
                    variant={bottomDockTab === "issues" ? "secondary" : "ghost"}
                    className="size-7 rounded-lg"
                    data-builder-workflow-open-issues=""
                    aria-label={`打开问题，当前 ${feedbackIssueCount} 个`}
                    title="问题"
                    onClick={() => openFeedbackPanel("issues")}
                  >
                    <AlertTriangle aria-hidden className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant={bottomDockTab === "tasks" ? "secondary" : "ghost"}
                    className="size-7 rounded-lg"
                    aria-label="打开工作流任务队列"
                    title="打开任务队列"
                    onClick={() => openRelevantTaskDock()}
                  >
                    <ClipboardCopy aria-hidden className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant={bottomDockTab === "output" ? "secondary" : "ghost"}
                    className="size-7 rounded-lg"
                    data-builder-workflow-open-output=""
                    aria-label="打开输出"
                    title="输出"
                    onClick={() => openFeedbackPanel("output")}
                  >
                    <Download aria-hidden className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant={bottomDockTab === "logs" ? "secondary" : "ghost"}
                    className="size-7 rounded-lg"
                    data-builder-workflow-open-logs=""
                    aria-label="打开日志"
                    title="日志"
                    onClick={() => openFeedbackPanel("logs")}
                  >
                    <FileJson aria-hidden className="size-4" />
                  </Button>
                </div>
              </div>
              {operationMonitorVisible ? (
                <div
                  className={cn(
                    "flex min-w-0 flex-wrap items-center gap-2 rounded-xl border bg-surface-container px-2 py-1.5 text-xs shadow-m3-1",
                    operationMonitorStatus === "failed"
                      ? "border-destructive/35"
                      : operationMonitorStatus === "running"
                        ? "border-primary/35"
                        : "border-outline-variant",
                  )}
                  data-builder-operation-monitor=""
                >
                  <StateLabel showQuiet variant={projectTaskStatusVariant(operationMonitorStatus)} label={projectTaskStatusLabel(operationMonitorStatus)} />
                  <span className="min-w-0 max-w-[22rem] truncate font-medium text-on-surface">{operationMonitorTitle}</span>
                  <span className="hidden min-w-[10rem] flex-1 truncate text-on-surface-variant md:block">{operationMonitorDetail}</span>
                  {operationMonitorTask?.pipelineStepCount ? (
                    <span className="rounded-full border border-outline-variant px-2 py-0.5 font-mono text-[0.62rem] text-on-surface-variant">
                      {(operationMonitorTask.pipelineStepIndex ?? 0) + 1}/{operationMonitorTask.pipelineStepCount}
                    </span>
                  ) : null}
                  {operationMonitorTask ? (
                    <>
                      <Progress className="hidden h-1.5 w-24 lg:block" value={projectTaskProgress(operationMonitorTask.status)} />
                      <span className="rounded-full border border-outline-variant px-2 py-0.5 font-mono text-[0.62rem] text-on-surface-variant">
                        {projectTaskElapsedLabel(operationMonitorTask)}
                      </span>
                    </>
                  ) : null}
                  <div className="ml-auto flex shrink-0 items-center gap-1">
                    <Button
                      size="icon-sm"
                      variant={bottomDockTab === "tasks" ? "secondary" : "ghost"}
                      className="size-7 rounded-lg"
                      data-builder-monitor-open-tasks=""
                      aria-label="打开任务"
                      title="任务"
                      onClick={() => openRelevantTaskDock(operationMonitorTask)}
                    >
                      <ClipboardCopy aria-hidden className="size-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant={bottomDockTab === "issues" ? "secondary" : "ghost"}
                      className="size-7 rounded-lg"
                      data-builder-monitor-open-issues=""
                      aria-label="打开问题"
                      title="问题"
                      onClick={() => {
                        setMode("build");
                        openBottomDock("issues");
                      }}
                    >
                      <AlertTriangle aria-hidden className="size-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant={bottomDockTab === "output" ? "secondary" : "ghost"}
                      className="size-7 rounded-lg"
                      data-builder-monitor-open-output=""
                      aria-label="打开输出"
                      title="输出"
                      onClick={() => {
                        setMode("build");
                        openBottomDock("output");
                      }}
                    >
                      <Terminal aria-hidden className="size-4" />
                    </Button>
                    {operationMonitorTask?.status === "failed" ? (
                      <Button size="sm" className="h-7 px-2 text-xs" data-builder-monitor-retry-task="" onClick={() => retryProjectTask(operationMonitorTask)}>
                        <RotateCcw aria-hidden className="size-4" />
                        重试
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {feedbackStripVisible ? (
                <>
                  <div
                    className="flex min-w-0 flex-wrap items-center gap-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-xs shadow-m3-1"
                    data-builder-feedback-strip=""
                    data-builder-feedback-strip-mode="expanded-only"
                  >
                    <StateLabel
                      showQuiet
                      variant={
                        feedbackSummaryTone === "attention"
                          ? "destructive"
                          : feedbackSummaryTone === "running" || feedbackSummaryTone === "ready"
                            ? "secondary"
                            : "outline"
                      }
                      label={feedbackSummaryToneLabel}
                    />
                    <span className="max-w-[18rem] truncate font-medium text-on-surface">{feedbackSummaryTitle}</span>
                    <button
                      type="button"
                      className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-high px-2.5 py-1 text-on-surface-variant transition hover:border-outline hover:text-on-surface"
                      onClick={() => openFeedbackPanel("issues")}
                    >
                      <AlertTriangle aria-hidden className="size-3.5" />
                      问题 {feedbackIssueCount}
                    </button>
                    <button
                      type="button"
                      className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-high px-2.5 py-1 text-on-surface-variant transition hover:border-outline hover:text-on-surface"
                      onClick={() => openRelevantTaskDock()}
                    >
                      <ClipboardCopy aria-hidden className="size-3.5" />
                      任务 {activeProjectTasks.length}
                    </button>
                    <button
                      type="button"
                      className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-high px-2.5 py-1 text-on-surface-variant transition hover:border-outline hover:text-on-surface"
                      onClick={() => openFeedbackPanel("output")}
                    >
                      <Download aria-hidden className="size-3.5" />
                      输出
                    </button>
                    <button
                      type="button"
                      className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-high px-2.5 py-1 text-on-surface-variant transition hover:border-outline hover:text-on-surface"
                      onClick={() => openFeedbackPanel("logs")}
                    >
                      <FileJson aria-hidden className="size-3.5" />
                      日志
                    </button>
                    <span className="min-w-[12rem] flex-1 truncate text-on-surface-variant">{feedbackSummaryDetail}</span>
                  </div>
                  {feedbackPanelOpen ? (
                    <div
                      className="grid min-w-0 gap-2 rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-xs shadow-m3-1 md:grid-cols-[12rem_minmax(0,1fr)]"
                      data-builder-feedback-inline-panel={bottomDockTab}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <StateLabel label={bottomDockTabs.find((tab: any) => tab.value === bottomDockTab)?.label ?? bottomDockTab} />
                        <span className="truncate text-on-surface-variant">
                          {bottomDockTab === "issues"
                            ? `${feedbackIssueCount} 个活跃问题`
                            : bottomDockTab === "tasks"
                              ? `${activeProjectTasks.length} 个任务`
                              : bottomDockTab === "output"
                                ? activeProject.outputExePath ? "exe 已就绪" : "等待输出"
                                : selectedProjectTask?.logPreview || selectedSimulatorTraceLogPreview ? "任务日志" : "等待日志"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        {bottomDockTab === "preview" ? (
                  <PreviewDock
                    previewUrl={previewWebPath ? convertFileSrc(previewWebPath) : null}
                    distDir={previewWebPath ? previewWebPath.replace(/[\\/]index\.html$/, "") : null}
                    onRefresh={refreshPreviewFrame}
                    onOpenExternal={() => {
                      if (previewWebPath) void openLocalPath(previewWebPath);
                    }}
                    onGenerate={() => void previewGeneratedWeb()}
                    autoRefresh={previewAutoRefresh}
                    onToggleAutoRefresh={() => setPreviewAutoRefresh((value: any) => !value)}
                    previewVersion={previewVersion}
                  />
                ) : bottomDockTab === "issues" ? (
                          <span className="block truncate text-on-surface-variant">
                            {selectedBuilderIssue ? `${selectedBuilderIssue.title}: ${selectedBuilderIssue.detail}` : "没有活跃问题。设计验证、构建诊断和运行时检查会显示在这里。"}
                          </span>
                        ) : bottomDockTab === "tasks" ? (
                          <div className="flex min-w-0 flex-wrap gap-1.5">
                            {visibleProjectTasks.slice(0, 3).map((task: any) => (
                              <button
                                key={task.id}
                                type="button"
                                className="focus-ring inline-flex max-w-[16rem] items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-high px-2.5 py-1 text-on-surface-variant transition hover:border-outline hover:text-on-surface"
                                onClick={() => openRelevantTaskDock(task)}
                              >
                                <span className="truncate">{task.title}</span>
                                <StateLabel showQuiet variant={projectTaskStatusVariant(task.status)} label={projectTaskStatusLabel(task.status)} />
                              </button>
                            ))}
                            {visibleProjectTasks.length === 0 ? <span className="text-on-surface-variant">暂无任务。</span> : null}
                          </div>
                        ) : bottomDockTab === "output" ? (
                          <span className="block truncate font-mono text-[0.68rem] text-on-surface-variant">
                            {activeProject.outputExePath || activeBundlePath || activeBundleDir || "运行构建或打包后会生成桌面产物。"}
                          </span>
                        ) : (
                          <span className="block truncate font-mono text-[0.68rem] text-on-surface-variant">
                            {selectedProjectTask?.logPreview || selectedSimulatorTraceLogPreview || latestRunSessionEntry?.runtimeLogPreview || "运行检查、构建或启动生成应用后会显示运行时和任务日志。"}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
          ) : null}

          <div
            className={cn("min-h-0 flex-1 basis-0 overflow-hidden bg-surface-container-low", outputDockWorkspacePadding)}
            style={outputDockWorkspaceStyle}
            data-builder-workspace-output-state={outputDockWorkspaceState}
            data-builder-workspace-output-height={outputDockWorkspaceHeight}
            data-builder-workspace-output-padding={outputDockWorkspaceAvoidancePadding}
            data-builder-workspace-no-output-reserved-band=""
            data-builder-workspace-no-output-background-shield=""
            // Density scope, one level out from DesignWorkspace's layout contract.
            // That attribute only exists in design mode; reusing it as the probe
            // root made the other three modes fall back to document.body and
            // measure the titlebar, mode rail and docks too — numbers that were
            // not comparable across surfaces.
            data-builder-density-root={mode}
          >
          <Suspense fallback={null}>
          {mode === "project" ? (
            <ProjectView
              scope={scope}
            />
          ) : mode === "logic" ? (
            <LogicView
              scope={scope}
            />
          ) : mode === "build" ? (
            <BuildView
              scope={scope}
            />
          ) : (
            <Suspense fallback={null}>
              <DesignView
              scope={scope}
              />
            </Suspense>
          )}
          </Suspense>
          </div>
              <OutputDock
                tabs={bottomDockTabs}
                activeTab={bottomDockTab}
                onTabChange={handleBottomDockTabChange}
                expanded={bottomDockExpanded}
                onExpandedChange={(expanded: any) => {
                  setBottomDockExpanded(expanded);
                  setBottomDockMinimized(false);
                }}
                minimized={bottomDockMinimized}
                onMinimizedChange={setBottomDockMinimized}
                height={activeBottomDockHeight}
                onHeightChange={(height: any) => {
                  if (bottomDockExpanded) {
                    setBottomDockExpandedHeight(height);
                    return;
                  }
                  setBottomDockHeight(height);
                }}
                avoidDesignSideDocks={mode === "design"}
                summary={
                  <div className="grid gap-2 text-xs" data-builder-feedback-summary="">
                    <div
                      className={cn(
                        "rounded-xl border p-3",
                        feedbackSummaryTone === "attention"
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : feedbackSummaryTone === "running"
                            ? "border-primary/30 bg-primary/10 text-on-surface"
                            : "border-outline-variant bg-surface-container-high text-on-surface",
                      )}
                    >
                      <div className="mb-1 flex min-w-0 items-center justify-between gap-2">
                        <span className="truncate font-medium">{feedbackSummaryTitle}</span>
                        <StateLabel
                          showQuiet
                          variant={
                            feedbackSummaryTone === "attention"
                              ? "destructive"
                              : feedbackSummaryTone === "running" || feedbackSummaryTone === "ready"
                                ? "secondary"
                                : "outline"
                          }
                          label={feedbackSummaryToneLabel}
                        />
                      </div>
                      <p className="line-clamp-2 leading-5 text-on-surface-variant">{feedbackSummaryDetail}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        className="focus-ring rounded-xl border border-outline-variant bg-surface-container-high px-2 py-2 text-left transition hover:border-outline"
                        onClick={() => openBottomDock("issues", false)}
                      >
                        <span className="block text-[0.66rem] text-on-surface-variant">问题</span>
                        <span className="mt-0.5 block font-medium text-on-surface">{feedbackIssueCount}</span>
                      </button>
                      <button
                        type="button"
                        className="focus-ring rounded-xl border border-outline-variant bg-surface-container-high px-2 py-2 text-left transition hover:border-outline"
                        onClick={() => openRelevantTaskDock(null, false)}
                      >
                        <span className="block text-[0.66rem] text-on-surface-variant">任务</span>
                        <span className="mt-0.5 block font-medium text-on-surface">{activeProjectTasks.length}</span>
                      </button>
                      <button
                        type="button"
                        className="focus-ring rounded-xl border border-outline-variant bg-surface-container-high px-2 py-2 text-left transition hover:border-outline"
                        onClick={() => openBottomDock("output", false)}
                      >
                        <span className="block text-[0.66rem] text-on-surface-variant">输出</span>
                        <span className="mt-0.5 block font-medium text-on-surface">{activeProject.outputExePath ? "exe" : "空闲"}</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant={bottomDockTab === "issues" ? "secondary" : "ghost"} onClick={() => openBottomDock("issues", false)}>
                        <AlertTriangle aria-hidden className="size-4" />
                        问题
                      </Button>
                      <Button size="sm" variant={bottomDockTab === "tasks" ? "secondary" : "ghost"} onClick={() => openRelevantTaskDock(null, false)}>
                        <ClipboardCopy aria-hidden className="size-4" />
                        任务
                      </Button>
                      <Button size="sm" variant={bottomDockTab === "logs" ? "secondary" : "ghost"} onClick={() => openBottomDock("logs", false)}>
                        <FileJson aria-hidden className="size-4" />
                        日志
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-builder-issue-prev=""
                        disabled={builderIssueCount === 0}
                        onClick={() => navigateBuilderIssue(-1)}
                      >
                        <MoveUp aria-hidden className="size-4" />
                        上一个
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-builder-issue-next=""
                        disabled={builderIssueCount === 0}
                        onClick={() => navigateBuilderIssue(1)}
                      >
                        <MoveDown aria-hidden className="size-4" />
                        下一个
                        <span className="hidden rounded-full border border-outline-variant bg-surface-container px-1.5 py-0.5 font-mono text-[0.56rem] text-on-surface-variant xl:inline-flex">
                          F8
                        </span>
                      </Button>
                    </div>
                  </div>
                }
                minimizedSummary={
                  <div className="flex min-w-0 items-center gap-2" data-builder-output-dock-minimized-feedback="">
                    <StateLabel
                      variant={
                        feedbackSummaryTone === "attention"
                          ? "destructive"
                          : feedbackSummaryTone === "running" || feedbackSummaryTone === "ready"
                            ? "secondary"
                            : "outline"
                      }
                      className="shrink-0"
                      label={feedbackSummaryToneLabel}
                    />
                    <span className="min-w-0 truncate font-medium text-on-surface">{feedbackSummaryTitle}</span>
                    <span className="hidden shrink-0 text-on-surface-variant lg:inline">
                      问题 {feedbackIssueCount}
                    </span>
                    <span className="hidden shrink-0 text-on-surface-variant xl:inline">
                      任务 {queuedProjectTaskCount}/{activeProjectTasks.length}
                    </span>
                    <span className="hidden min-w-0 truncate text-on-surface-variant 2xl:inline">
                      {activeProject.outputExePath ? fileNameFromPath(activeProject.outputExePath) : feedbackSummaryDetail}
                    </span>
                  </div>
                }
              >
                {bottomDockTab === "issues" ? (
                  bottomDockExpanded ? (
                    <div className="grid h-full min-h-0 gap-3 text-xs xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                      <div className="subtle-scrollbar min-h-0 space-y-2 overflow-auto pr-1">
                        {builderIssues.length > 0 ? (
                          builderIssues.slice(0, 24).map((issue: any) => {
                            const isSelected = issue.id === selectedBuilderIssue?.id;
                            return (
                              <button
                                key={issue.id}
                                type="button"
                                aria-selected={isSelected}
                                className={cn(
                                  "focus-ring w-full rounded-xl border p-3 text-left transition",
                                  isSelected
                                    ? "border-primary bg-primary/10"
                                    : "border-outline-variant bg-surface-container-high hover:border-outline",
                                )}
                                onClick={() => {
                                  activateBuilderIssue(issue, { focusEditable: false, feedback: false });
                                }}
                              >
                                <span className="mb-1 flex min-w-0 items-center gap-2">
                                  <StateBadge
                                    signal
                                    variant={issue.severity === "error" ? "destructive" : "outline"}
                                    label={issue.severity === "error" ? "错误" : "警告"}
                                  />
                                  <StateLabel label={issue.sourceLabel} />
                                  {issue.fixable ? <StateLabel label="可修复" /> : null}
                                  {issue.meta ? <span className="min-w-0 truncate font-mono text-[0.68rem] text-on-surface-variant">{issue.meta}</span> : null}
                                </span>
                                <span className="block truncate font-medium text-on-surface">{issue.title}</span>
                                <span className="line-clamp-2 leading-5 text-on-surface-variant">{issue.detail}</span>
                              </button>
                            );
                          })
                        ) : (
                          <div className="rounded-xl border border-dashed border-outline-variant p-4 text-center text-on-surface-variant">
                            没有活跃问题。设计验证、构建诊断和运行时检查会显示在这里。
                          </div>
                        )}
                      </div>
                      <div className="subtle-scrollbar min-h-0 overflow-auto rounded-xl border border-outline-variant bg-surface-container-high p-3">
                        {selectedBuilderIssue?.kind === "diagnostic" && selectedBuilderIssue.diagnostic ? (
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <StateBadge
                                  signal
                                  variant={selectedBuilderIssue.diagnostic.severity === "error" ? "destructive" : "outline"}
                                  label={buildDiagnosticSeverityLabel(selectedBuilderIssue.diagnostic.severity)}
                                />
                                {selectedBuilderIssue.diagnostic.code ? <StateLabel label={selectedBuilderIssue.diagnostic.code} /> : null}
                                {selectedBuilderIssue.diagnostic.origin ? <StateLabel label={selectedBuilderIssue.diagnostic.origin} /> : null}
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                {isEditableRustDiagnostic(selectedBuilderIssue.diagnostic) ? (
                                  <Button size="sm" variant="secondary" onClick={() => focusRustDiagnostic(selectedBuilderIssue.diagnostic!)}>
                                    <MousePointer2 aria-hidden className="size-4" />
                                    定位源码
                                  </Button>
                                ) : null}
                                <Button size="sm" variant="ghost" onClick={() => openBottomDock("logs", bottomDockExpanded)}>
                                  <FileJson aria-hidden className="size-4" />
                                  完整日志
                                </Button>
                              </div>
                            </div>
                            <p className="leading-5 text-on-surface">{selectedBuilderIssue.diagnostic.message}</p>
                            <div className="grid gap-2 md:grid-cols-2">
                              <PathRow label="文件" value={selectedBuilderIssue.diagnostic.file || "Cargo 输出"} />
                              <PathRow
                                label="位置"
                                value={
                                  selectedBuilderIssue.diagnostic.line
                                    ? `第 ${selectedBuilderIssue.diagnostic.line} 行，第 ${selectedBuilderIssue.diagnostic.column ?? 1} 列`
                                    : "没有直接源码位置"
                                }
                              />
                              <PathRow label="映射源码" value={selectedBuilderIssue.diagnostic.sourceFile || "未映射到编辑器源码"} />
                              <PathRow
                                label="源码行"
                                value={
                                  selectedBuilderIssue.diagnostic.sourceLine
                                    ? `第 ${selectedBuilderIssue.diagnostic.sourceLine} 行，第 ${selectedBuilderIssue.diagnostic.sourceColumn ?? 1} 列`
                                    : "不可用"
                                }
                              />
                            </div>
                            {!isEditableRustDiagnostic(selectedBuilderIssue.diagnostic) ? (
                              <p className="rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 leading-5 text-on-surface-variant">
                                这个诊断来自生成 app、依赖或 Cargo 输出，当前无法安全映射到编辑器里的 Rust 逻辑源码。
                              </p>
                            ) : null}
                            {selectedBuilderIssue.diagnostic.rendered ? (
                              <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-container-low p-3 font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                                {selectedBuilderIssue.diagnostic.rendered}
                              </pre>
                            ) : null}
                          </div>
                        ) : selectedBuilderIssue?.kind === "property" && selectedBuilderIssue.propertyIssue ? (
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <StateBadge
                                  signal
                                  variant={selectedBuilderIssue.severity === "error" ? "destructive" : "outline"}
                                  label={selectedBuilderIssue.severity === "error" ? "错误" : "警告"}
                                />
                                <StateLabel label="设计" />
                                {selectedBuilderIssue.fixable ? <StateLabel label="安全修复" /> : <StateLabel label="手动处理" />}
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <Button size="sm" variant="secondary" onClick={() => focusPropertyIssue(selectedBuilderIssue.propertyIssue!, { feedback: true })}>
                                  <MousePointer2 aria-hidden className="size-4" />
                                  定位控件
                                </Button>
                                <Button
                                  size="sm"
                                  variant={selectedBuilderIssue.fixable ? "secondary" : "ghost"}
                                  onClick={() => applyPropertyIssueAutoFix(selectedBuilderIssue.propertyIssue!)}
                                >
                                  <Wand2 aria-hidden className="size-4" />
                                  {selectedBuilderIssue.fixable ? "安全修复" : "查看属性"}
                                </Button>
                              </div>
                            </div>
                            <p className="leading-5 text-on-surface">{selectedBuilderIssue.propertyIssue.message}</p>
                            <div className="grid gap-2 md:grid-cols-2">
                              <PathRow label="UI 文件" value={selectedBuilderIssue.propertyIssue.fileName} />
                              <PathRow label="控件" value={selectedBuilderIssue.propertyIssue.itemName} />
                              <PathRow label="属性" value={`${selectedBuilderIssue.propertyIssue.label} / ${String(selectedBuilderIssue.propertyIssue.prop)}`} />
                              <PathRow label="面板" value={`${propertySectionForProp(selectedBuilderIssue.propertyIssue.prop)} 区段`} />
                            </div>
                            <p className="rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 leading-5 text-on-surface-variant">
                              这个问题来自设计器属性 schema。修复后会影响生成 UI、可访问性文本或构建前 readiness。
                            </p>
                          </div>
                        ) : selectedBuilderIssue?.kind === "build-error" && buildError ? (
                          <div className="space-y-3">
                            <StateBadge signal variant="destructive" label="构建错误" />
                            <p className="leading-5 text-destructive">{buildError}</p>
                            <Button size="sm" variant="secondary" onClick={() => openBottomDock("logs", bottomDockExpanded)}>
                              <FileJson aria-hidden className="size-4" />
                              完整日志
                            </Button>
                          </div>
                        ) : (
                          <div className="flex h-full min-h-36 items-center justify-center rounded-xl border border-dashed border-outline-variant text-center text-on-surface-variant">
                            未选择问题。
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-2 text-xs xl:grid-cols-2">
                      {builderIssues.length > 0 ? (
                        builderIssues.slice(0, 4).map((issue: any) => (
                          <button
                            key={issue.id}
                            type="button"
                            className={cn(
                              "focus-ring rounded-xl border p-3 text-left transition hover:border-outline",
                              issue.severity === "error" ? "border-destructive/25 bg-destructive/10" : "border-outline-variant bg-surface-container-high",
                            )}
                            onClick={() => {
                              setBottomDockExpanded(true);
                              activateBuilderIssue(issue, { focusEditable: false, feedback: false });
                            }}
                          >
                            <span className="mb-1 flex min-w-0 items-center gap-2">
                              <StateBadge
                                signal
                                variant={issue.severity === "error" ? "destructive" : "outline"}
                                label={issue.severity === "error" ? "错误" : "警告"}
                              />
                              <StateLabel label={issue.sourceLabel} />
                              {issue.fixable ? <StateLabel label="可修复" /> : null}
                              {issue.meta ? <span className="min-w-0 truncate font-mono text-[0.68rem]">{issue.meta}</span> : null}
                            </span>
                            <span className="block truncate font-medium text-on-surface">{issue.title}</span>
                            <span className="line-clamp-2 leading-5 text-on-surface-variant">{issue.detail}</span>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-outline-variant p-4 text-center text-on-surface-variant">
                          没有活跃问题。设计验证、构建诊断和运行时检查会显示在这里。
                        </div>
                      )}
                    </div>
                  )
                ) : bottomDockTab === "output" ? (
                  <div className={cn("grid h-full min-h-0 gap-3 overflow-auto pr-1 text-xs", bottomDockExpanded ? "xl:grid-cols-3" : "md:grid-cols-2 2xl:grid-cols-3")}>
                    <div className={cn("rounded-xl border border-outline-variant bg-surface-container-high", bottomDockExpanded ? "p-3" : "p-2.5")}>
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">流水线</p>
                          <p className={cn("mt-1 leading-5 text-on-surface", bottomDockExpanded ? "line-clamp-2" : "line-clamp-1")}>
                            {latestReleasePipeline ? latestReleasePipeline.summary : "还没有发布流水线"}
                          </p>
                        </div>
                        <StateLabel
                          showQuiet
                          variant={latestReleasePipeline ? projectTaskStatusVariant(latestReleasePipeline.status as any) : "outline"}
                          label={latestReleasePipeline ? projectTaskStatusLabel(latestReleasePipeline.status) : "空闲"}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openRelevantTaskDock()}
                        >
                          <ClipboardCopy aria-hidden className="size-4" />
                          任务
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openBottomDock("logs", bottomDockExpanded)}>
                          <FileJson aria-hidden className="size-4" />
                          日志
                        </Button>
                      </div>
                    </div>
                    <div className={cn("rounded-xl border border-outline-variant bg-surface-container-high", bottomDockExpanded ? "p-3" : "p-2.5")}>
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">可执行文件</p>
                          <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface">
                            {activeProject.outputExePath ? fileNameFromPath(activeProject.outputExePath) : "等待构建输出"}
                          </p>
                        </div>
                        <StateBadge label={activeProject.outputExePath ? "exe" : "等待中"} />
                      </div>
                      {bottomDockExpanded ? (
                        <p className="mb-3 line-clamp-2 break-all font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                          {activeProject.outputExePath || "运行构建后会生成桌面可执行文件。"}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          variant={latestRunSessionRunning ? "ghost" : "secondary"}
                          data-builder-output-run-exe=""
                          loading={latestRunSessionRunning && latestRunSessionEntry ? stoppingRunId === latestRunSessionEntry.id : launchingExeId === "active-output"}
                          disabled={
                            latestRunSessionRunning && latestRunSessionEntry
                              ? !latestRunSessionEntry.launchedPid || Boolean(stoppingRunId)
                              : !activeProject.outputExePath || Boolean(launchingExeId)
                          }
                          title={latestRunSessionRunning ? "停止正在运行的桌面可执行文件" : "运行生成的桌面可执行文件"}
                          onClick={() => {
                            if (latestRunSessionRunning && latestRunSessionEntry) {
                              void stopRunSession(latestRunSessionEntry);
                              return;
                            }
                            void launchActiveOutputExecutable();
                          }}
                        >
                          {latestRunSessionRunning ? "停止" : bottomDockExpanded ? "运行 exe" : "运行"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          data-builder-output-reveal-exe=""
                          disabled={!activeProject.outputExePath}
                          title="打开可执行文件所在文件夹"
                          onClick={() => void openLocalArtifact(parentPathFromPath(activeProject.outputExePath || ""))}
                        >
                          <FolderOpen aria-hidden className="size-4" />
                          {bottomDockExpanded ? "文件夹" : "打开"}
                        </Button>
                        <Button size="sm" variant="ghost" disabled={!activeProject.outputExePath} onClick={() => void copyArtifactPath(activeProject.outputExePath || "")}>
                          <ClipboardCopy aria-hidden className="size-4" />
                          {copiedArtifactPath === activeProject.outputExePath ? "已复制" : "复制"}
                        </Button>
                      </div>
                    </div>
                    <div className={cn("rounded-xl border border-outline-variant bg-surface-container-high", bottomDockExpanded ? "p-3" : "p-2.5")}>
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">安装包</p>
                          <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface">
                            {activeBundlePath ? fileNameFromPath(activeBundlePath) : activeBundleDir ? fileNameFromPath(activeBundleDir) : "等待安装包输出"}
                          </p>
                        </div>
                        <StateBadge label={activeBundlePath ? "安装器" : activeBundleDir ? "文件夹" : "等待中"} />
                      </div>
                      {bottomDockExpanded ? (
                        <p className="mb-3 line-clamp-2 break-all font-mono text-[0.68rem] leading-4 text-on-surface-variant">
                          {activeBundlePath || activeBundleDir || "运行安装器打包后会生成可分发产物。"}
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
                          打开
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!(activeBundlePath || activeBundleDir)}
                          onClick={() => void openLocalArtifact(activeBundleDir || parentPathFromPath(activeBundlePath || ""))}
                        >
                          <FolderOpen aria-hidden className="size-4" />
                          {bottomDockExpanded ? "文件夹" : "目录"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!(activeBundlePath || activeBundleDir)}
                          onClick={() => void copyArtifactPath(activeBundlePath || activeBundleDir || "")}
                        >
                          <ClipboardCopy aria-hidden className="size-4" />
                          {copiedArtifactPath === (activeBundlePath || activeBundleDir) ? "已复制" : "复制"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : bottomDockTab === "tasks" ? (
                  bottomDockExpanded ? (
                    <div className="grid h-full min-h-0 gap-3 text-xs xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                      <div className="subtle-scrollbar min-h-0 space-y-2 overflow-auto pr-1">
                        {visibleProjectTasks.slice(0, 8).map((task: any) => (
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
                              <StateLabel showQuiet variant={projectTaskStatusVariant(task.status)} label={projectTaskStatusLabel(task.status)} />
                            </span>
                            <span className="mt-1 block truncate text-on-surface-variant">{projectTaskKindLabel(task.kind)} · {projectTaskElapsedLabel(task)}</span>
                            <span className="mt-1 block line-clamp-1 text-[0.68rem] text-on-surface-variant">{task.summary ?? task.detail}</span>
                          </button>
                        ))}
                        {visibleProjectTasks.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-outline-variant p-4 text-center text-on-surface-variant">
                            暂无任务。
                          </div>
                        ) : null}
                      </div>
                      <div className="subtle-scrollbar min-h-0 overflow-auto rounded-xl border border-outline-variant bg-surface-container-high p-3">
                        {selectedProjectTask ? (
                          <div className="min-h-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-medium text-on-surface">{selectedProjectTask.title}</p>
                                <p className="mt-1 line-clamp-2 leading-5 text-on-surface-variant">
                                  {selectedProjectTask.summary ?? selectedProjectTask.detail}
                                </p>
                              </div>
                              <StateLabel showQuiet variant={projectTaskStatusVariant(selectedProjectTask.status)} label={projectTaskStatusLabel(selectedProjectTask.status)} />
                            </div>
                            {selectedProjectTask.error ? (
                              <p className="mt-2 line-clamp-2 rounded-xl bg-destructive/10 p-2 font-mono text-[0.68rem] leading-4 text-destructive">
                                {selectedProjectTask.error}
                              </p>
                            ) : null}
                            <div className="mt-3 grid grid-cols-3 gap-2 text-[0.68rem]">
                              <PathRow label="类型" value={projectTaskKindLabel(selectedProjectTask.kind)} />
                              <PathRow label="耗时" value={projectTaskElapsedLabel(selectedProjectTask)} />
                              <PathRow label="来源" value={selectedProjectTask.backendTaskId ? "Rust 任务" : "编辑器队列"} />
                            </div>
                            <div className="mt-3 rounded-xl border border-outline-variant/70 bg-surface-container-low p-2" data-builder-bottom-task-log-toolbar="">
                              <div className="mb-2 flex min-w-0 flex-wrap items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">任务日志</p>
                                  <p className="mt-0.5 truncate text-on-surface">
                                    {projectTaskLogSearchQuery ? `${selectedProjectTaskLogMatchCount} 条匹配` : `${selectedProjectTaskLogLines.length} 行可读摘要`}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={!selectedProjectTask.logPreview}
                                    data-builder-bottom-task-log-open-readable=""
                                    onClick={() => openBottomDock("logs", bottomDockExpanded)}
                                  >
                                    <FileJson aria-hidden className="size-4" />
                                    完整日志
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={!selectedProjectTask.logPreview}
                                    data-builder-bottom-task-log-copy=""
                                    onClick={() => void copyBottomDockLog()}
                                  >
                                    <ClipboardCopy aria-hidden className="size-4" />
                                    {copiedOutputLog ? "已复制" : "复制"}
                                  </Button>
                                </div>
                              </div>
                              <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" data-builder-bottom-task-log-search="">
                                <div className="relative min-w-0">
                                  <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                                  <Input
                                    inputSize="sm"
                                    className="pl-8"
                                    value={projectTaskLogSearchQuery}
                                    onChange={(event: any) => setProjectTaskLogSearchQuery(event.target.value)}
                                    placeholder="搜索选中任务日志..."
                                    aria-label="搜索底部任务日志"
                                    disabled={!selectedProjectTask.logPreview}
                                    data-builder-bottom-task-log-search-input=""
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={!projectTaskLogSearchQuery}
                                  data-builder-bottom-task-log-search-clear=""
                                  onClick={() => setProjectTaskLogSearchQuery("")}
                                >
                                  <X aria-hidden className="size-4" />
                                  清除
                                </Button>
                              </div>
                            </div>
                            {selectedProjectTask.logPreview ? (
                              <div
                                className="mt-3 max-h-56 overflow-auto rounded-xl bg-surface-container-low py-2 font-mono text-[0.68rem] leading-4 text-on-surface-variant"
                                data-builder-task-log-full-preview=""
                                data-builder-task-log-line-count={selectedProjectTaskLogLines.length}
                              >
                                {selectedProjectTaskLogLines.map((line: any) => (
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
                                该任务暂无日志摘要。
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-outline-variant p-4 text-center text-on-surface-variant">
                            选择任务后查看详情。
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-2 text-xs xl:grid-cols-4">
                      {visibleProjectTasks.slice(0, 4).map((task: any) => (
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
                            <StateLabel showQuiet variant={projectTaskStatusVariant(task.status)} label={projectTaskStatusLabel(task.status)} />
                          </span>
                          <span className="mt-1 block truncate text-on-surface-variant">{projectTaskKindLabel(task.kind)} · {projectTaskElapsedLabel(task)}</span>
                        </button>
                      ))}
                      {visibleProjectTasks.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-outline-variant p-4 text-center text-on-surface-variant">
                          暂无任务。
                        </div>
                      ) : null}
                    </div>
                  )
                ) : (
                  <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2 text-xs" data-builder-output-log-readable-panel="">
                    <div
                      className="grid min-w-0 gap-2 rounded-[18px] border border-outline-variant/70 bg-surface-container-high px-3 py-2"
                      data-builder-output-log-toolbar=""
                    >
                      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">日志来源</p>
                          <p className="mt-0.5 truncate font-medium text-on-surface" data-builder-output-log-source="">
                            {bottomDockLogSource}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <CountReadout label={`${bottomDockLogLineCount} 行`} count={bottomDockLogLineCount} data-builder-output-log-line-count="" />
                          {bottomDockLogSearchQuery ? (
                            <CountReadout
                              label={`${bottomDockLogMatchCount} 匹配`}
                              count={bottomDockLogMatchCount}
                              data-builder-output-log-search-count=""
                            />
                          ) : null}
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-output-log-copy=""
                            disabled={!bottomDockLogText.trim()}
                            onClick={() => void copyBottomDockLog()}
                          >
                            <ClipboardCopy aria-hidden className="size-4" />
                            {copiedOutputLog ? "已复制" : "复制"}
                          </Button>
                          <Button
                            size="sm"
                            variant={bottomDockExpanded ? "secondary" : "ghost"}
                            data-builder-output-log-expand=""
                            onClick={() => setBottomDockExpanded(true)}
                          >
                            <Maximize2 aria-hidden className="size-4" />
                            完整
                          </Button>
                        </div>
                      </div>
                      <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" data-builder-output-log-search="">
                        <div className="relative min-w-0">
                          <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                          <Input
                            inputSize="sm"
                            className="pl-8"
                            value={bottomDockLogSearchQuery}
                            onChange={(event: any) => setBottomDockLogSearchQuery(event.target.value)}
                            placeholder="搜索当前输出日志..."
                            aria-label="搜索底部输出日志"
                            data-builder-output-log-search-input=""
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!bottomDockLogSearchQuery}
                          data-builder-output-log-search-clear=""
                          onClick={() => setBottomDockLogSearchQuery("")}
                        >
                          <X aria-hidden className="size-4" />
                          清除
                        </Button>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "subtle-scrollbar h-full min-h-0 max-h-full overflow-auto rounded-[18px] border border-outline-variant/70 bg-surface-container-high py-2 font-mono text-[0.68rem] leading-5 text-on-surface-variant [overflow-wrap:anywhere]",
                        bottomDockExpanded ? "min-h-[14rem]" : "min-h-[9rem]",
                      )}
                      data-builder-output-log-full-content=""
                      data-builder-output-log-wrap-policy="break-anywhere"
                      data-builder-output-log-line-reader=""
                    >
                      {bottomDockLogLines.length ? (
                        bottomDockLogLines.map((line: any) => (
                          <div
                            key={line.id}
                            className={cn(
                              "grid grid-cols-[3rem_minmax(0,1fr)] gap-2 px-2 py-0.5",
                              line.matched && "bg-primary/10 text-on-surface",
                            )}
                            data-builder-output-log-line={line.number}
                            data-builder-output-log-line-match={line.matched ? "true" : "false"}
                          >
                            <span className="select-none text-right text-on-surface-variant">{line.number}</span>
                            <span className="whitespace-pre-wrap break-words">{line.text || " "}</span>
                          </div>
                        ))
                      ) : (
                        <p className="px-3 py-4 text-center text-on-surface-variant">
                          没有匹配的日志行。
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </OutputDock>
            </div>
          </div>
          {projectExplorerContextMenu && projectExplorerContextNode ? (
            <div
              className="fixed inset-0 z-[9997]"
              data-builder-project-context-overlay=""
              onPointerDown={closeProjectExplorerContextMenu}
              onContextMenu={(event) => {
                event.preventDefault();
                closeProjectExplorerContextMenu();
              }}
            >
              <div
                role="menu"
                aria-label={`${projectExplorerContextNode.label} 项目树操作菜单`}
                className="absolute w-60 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest/98 p-1.5 text-xs text-on-surface shadow-m3-3 backdrop-blur"
                data-builder-project-context-menu=""
                data-builder-project-context-smart-position=""
                data-builder-project-context-placement-x={projectExplorerContextMenu.placementX}
                data-builder-project-context-placement-y={projectExplorerContextMenu.placementY}
                style={{
                  left: projectExplorerContextMenu.x,
                  top: projectExplorerContextMenu.y,
                  transformOrigin: `${projectExplorerContextMenu.placementX === "left" ? "right" : "left"} ${projectExplorerContextMenu.placementY === "top" ? "bottom" : "top"}`,
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onContextMenu={(event) => event.preventDefault()}
              >
                <div className="px-2 py-1.5">
                  <p className="truncate font-medium">{projectExplorerContextNode.label}</p>
                  <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">
                    {projectExplorerActionLabel(projectExplorerContextNode.action)} · {projectExplorerContextNode.detail}
                  </p>
                </div>
                <div className="my-1 h-px bg-outline-variant" />
                <button
                  type="button"
                  role="menuitem"
                  className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                  data-builder-project-context-open=""
                  disabled={projectExplorerContextNode.action === "none"}
                  onClick={() => runProjectExplorerContextAction("open", projectExplorerContextNode)}
                >
                  <FolderOpen aria-hidden className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate">{projectExplorerPrimaryActionLabel(projectExplorerContextNode)}</span>
                  <span className="text-[0.68rem] text-on-surface-variant">Enter</span>
                </button>
                {projectExplorerContextNode.id === "ui-folder" || projectExplorerContextNode.action === "select-file" ? (
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      data-builder-project-context-new-ui-file=""
                      onClick={() => runProjectExplorerContextAction("new-ui-file", projectExplorerContextNode)}
                    >
                      <Plus aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">新建 UI 文件</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      data-builder-project-context-rename-ui-file=""
                      disabled={!projectExplorerContextNode.fileId}
                      onClick={() => runProjectExplorerContextAction("rename-ui-file", projectExplorerContextNode)}
                    >
                      <TextCursorInput aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">重命名 UI 文件</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      data-builder-project-context-duplicate-ui-file=""
                      disabled={!projectExplorerContextNode.fileId}
                      onClick={() => runProjectExplorerContextAction("duplicate-ui-file", projectExplorerContextNode)}
                    >
                      <Copy aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">复制 UI 文件</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-40"
                      data-builder-project-context-delete-ui-file=""
                      disabled={!projectExplorerContextNode.fileId}
                      onClick={() => runProjectExplorerContextAction("delete-ui-file", projectExplorerContextNode)}
                    >
                      <Trash2 aria-hidden className="size-4" />
                      <span className="min-w-0 flex-1 truncate">{activeProject.files.length <= 1 ? "清空 UI 文件" : "删除 UI 文件"}</span>
                    </button>
                    <div className="my-1 h-px bg-outline-variant" />
                  </>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                  data-builder-project-context-reveal=""
                  disabled={!projectExplorerContextNode.path}
                  onClick={() => runProjectExplorerContextAction("reveal", projectExplorerContextNode)}
                >
                  <FolderOpen aria-hidden className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate">在系统中显示</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                  data-builder-project-context-copy-path=""
                  onClick={() => runProjectExplorerContextAction("copy-path", projectExplorerContextNode)}
                >
                  <ClipboardCopy aria-hidden className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate">复制路径</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                  data-builder-project-context-copy-relative-path=""
                  onClick={() => runProjectExplorerContextAction("copy-relative-path", projectExplorerContextNode)}
                >
                  <FileJson aria-hidden className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate">复制相对路径</span>
                </button>
                <div className="my-1 h-px bg-outline-variant" />
                <button
                  type="button"
                  role="menuitem"
                  className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high"
                  data-builder-project-context-filter-kind=""
                  onClick={() => runProjectExplorerContextAction("filter-kind", projectExplorerContextNode)}
                >
                  <Search aria-hidden className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate">只看同类节点</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high"
                  data-builder-project-context-show-all=""
                  onClick={() => runProjectExplorerContextAction("show-all", projectExplorerContextNode)}
                >
                  <Layers aria-hidden className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate">显示全部并展开</span>
                </button>
              </div>
            </div>
          ) : null}
          {canvasContextMenu ? (
            <div
              className="fixed inset-0 z-[9998]"
              data-builder-canvas-context-overlay=""
              onPointerDown={closeCanvasContextMenu}
              onContextMenu={(event) => {
                event.preventDefault();
                closeCanvasContextMenu();
              }}
            >
              <div
                role="menu"
                aria-label={canvasContextMenuItem ? `${getItemSummary(canvasContextMenuItem)} 操作菜单` : "画布操作菜单"}
                className="subtle-scrollbar absolute max-h-[calc(100vh-1.5rem)] w-60 overflow-y-auto rounded-2xl border border-outline-variant bg-surface-container-lowest/98 p-1.5 text-xs text-on-surface shadow-m3-3 backdrop-blur"
                data-builder-canvas-context-smart-position=""
                data-builder-canvas-context-placement-x={canvasContextMenu.placementX}
                data-builder-canvas-context-placement-y={canvasContextMenu.placementY}
                style={{
                  left: canvasContextMenu.x,
                  top: canvasContextMenu.y,
                  transformOrigin: `${canvasContextMenu.placementX === "left" ? "right" : "left"} ${canvasContextMenu.placementY === "top" ? "bottom" : "top"}`,
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onContextMenu={(event) => event.preventDefault()}
              >
                <div className="px-2 py-1.5">
                  <p className="truncate font-medium">{canvasContextMenuItem ? getItemSummary(canvasContextMenuItem) : activeFile.name}</p>
                  <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">
                    {canvasContextMenuItem
                      ? `${canvasContextMenuItem.type}${canvasContextMenuEventName ? ` · ${canvasContextMenuEventName}` : ""}`
                      : `${items.length} 个控件 · ${page.width} x ${page.height}`}
                  </p>
                </div>
                <div className="my-1 h-px bg-outline-variant" />
                <details className="group mx-1 mb-1" data-builder-canvas-context-insert-collapsed="">
                  <summary className="focus-ring flex h-8 cursor-pointer list-none items-center gap-2 rounded-xl px-2 text-[0.72rem] font-medium hover:bg-surface-container-high [&::-webkit-details-marker]:hidden">
                    <ChevronRight aria-hidden className="size-3.5 text-on-surface-variant transition-transform group-open:rotate-90" />
                    <span className="flex-1 truncate">插入控件到此处</span>
                    <span className="font-mono text-[0.6rem] text-on-surface-variant">{canvasContextQuickInsertTypes.length}</span>
                  </summary>
                  <div className="space-y-1 pb-1">
                <div className="px-1 pb-1" data-builder-canvas-context-insert-search="">
                  <input
                    ref={canvasContextInsertInputRef}
                    value={canvasContextInsertQuery}
                    data-builder-canvas-context-insert-search-input=""
                    data-builder-canvas-context-insert-search-autofocus=""
                    aria-label="搜索要插入的控件"
                    placeholder="搜索控件…"
                    className="focus-ring h-7 w-full rounded-lg border border-outline-variant bg-surface-container px-2 text-[0.7rem] text-on-surface"
                    onChange={(event) => {
                      setCanvasContextInsertQuery(event.target.value);
                      setCanvasContextInsertActiveIndex(0);
                    }}
                    onKeyDown={handleCanvasContextInsertSearchKeyDown}
                  />
                  {canvasContextInsertQuery.trim() ? (
                    <div className="mt-1 max-h-28 overflow-y-auto" data-builder-canvas-context-insert-search-results="" role="listbox">
                      {canvasContextInsertSearchResults.length === 0 ? (
                        <p className="px-2 py-1 text-[0.68rem] text-on-surface-variant">没有匹配控件</p>
                      ) : (
                        canvasContextInsertSearchResults.map((definition: any, index: any) => {
                          const Icon = definition.icon;
                          return (
                            <button
                              key={definition.type}
                              type="button"
                              role="option"
                              aria-selected={index === canvasContextInsertActiveIndex}
                              className={cn(
                                "focus-ring flex h-7 w-full items-center gap-1.5 rounded-lg px-2 text-left",
                                index === canvasContextInsertActiveIndex ? "bg-secondary-container" : "hover:bg-surface-container-high",
                              )}
                              data-builder-canvas-context-insert-component={definition.type}
                              data-builder-canvas-context-insert-search-result={definition.type}
                              data-builder-canvas-context-insert-search-active={index === canvasContextInsertActiveIndex ? "true" : "false"}
                              onMouseEnter={() => setCanvasContextInsertActiveIndex(index)}
                              onClick={() => insertComponentFromCanvasContext(definition.type)}
                            >
                              <Icon aria-hidden className="size-3 shrink-0 text-primary" />
                              <span className="min-w-0 flex-1 truncate text-[0.68rem]">{definition.title}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1 px-1 pb-1" role="group" aria-label="常用控件快速插入">
                  {["button", "input", "frame", "select", "search-bar", "table"].map((type) => {
                    const definition = getDefinition(type as BuilderComponentType);
                    const Icon = definition.icon;
                    return (
                      <button
                        key={type}
                        type="button"
                        role="menuitem"
                        className="focus-ring flex h-7 min-w-0 items-center gap-1 rounded-lg border border-outline-variant bg-surface-container px-1.5 text-left hover:bg-surface-container-high"
                        data-builder-canvas-context-insert-component={type}
                        title={`在右键位置插入 ${definition.title}`}
                        onClick={() => insertComponentFromCanvasContext(type as BuilderComponentType)}
                      >
                        <Icon aria-hidden className="size-3 shrink-0 text-primary" />
                        <span className="max-w-[4.5rem] truncate text-[0.62rem]">{definition.title}</span>
                      </button>
                    );
                  })}
                </div>
                <details className="group mx-1 mb-1 rounded-lg border border-outline-variant/80" data-builder-canvas-context-insert-more="">
                  <summary className="focus-ring flex h-7 cursor-pointer list-none items-center gap-1 rounded-lg px-2 text-[0.68rem] text-on-surface-variant hover:bg-surface-container-high [&::-webkit-details-marker]:hidden">
                    <ChevronRight aria-hidden className="size-3 transition-transform group-open:rotate-90" />
                    更多插入
                    <span className="ml-auto font-mono text-[0.6rem]">{canvasContextQuickInsertTypes.length}</span>
                  </summary>
                  <div className="max-h-40 overflow-y-auto border-t border-outline-variant/70 p-1">
                    {canvasContextQuickInsertGroups.map((group: any) => (
                      <div key={group.id} className="mb-1" data-builder-canvas-context-quick-insert-group={group.id}>
                        <div className="px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase text-on-surface-variant">{group.label}</div>
                        <div className="flex flex-wrap gap-1">
                          {group.types.map((type: any) => {
                            const definition = getDefinition(type);
                            const Icon = definition.icon;
                            return (
                              <button
                                key={type}
                                type="button"
                                role="menuitem"
                                className="focus-ring flex h-7 min-w-0 items-center gap-1 rounded-lg px-1.5 hover:bg-surface-container-high"
                                data-builder-canvas-context-insert-component={type}
                                onClick={() => insertComponentFromCanvasContext(type)}
                              >
                                <Icon aria-hidden className="size-3 shrink-0 text-primary" />
                                <span className="max-w-[5rem] truncate text-[0.62rem]">{definition.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
  </div>
                </details>
                <div className="my-1 h-px bg-outline-variant" />
                {canvasContextMenuItem ? (
                  <>
                    {canvasContextMenuTextProps.length > 0 ? (
                      <div data-builder-canvas-context-text-fields="">
                        <div className="px-2 pb-1 pt-1 text-[0.64rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">
                          快速编辑
                        </div>
                        {canvasContextMenuTextProps.map((prop: any) => (
                          <button
                            key={prop}
                            type="button"
                            role="menuitem"
                            className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                            data-builder-canvas-context-edit-text-field={prop}
                            disabled={canvasContextMenuItem.locked}
                            onClick={() => runCanvasContextAction("edit-text", prop)}
                          >
                            <Type aria-hidden className="size-4 text-primary" />
                            <span className="min-w-0 flex-1 truncate">编辑{quickTextPropLabel(prop)}</span>
                            <span className="max-w-[6.5rem] truncate text-[0.68rem] text-on-surface-variant" data-builder-canvas-context-edit-text-field-value={prop}>
                              {textPropertyValue(canvasContextMenuItem.props[prop]) || "空"}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        type="button"
                        role="menuitem"
                        className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                        disabled
                      >
                        <Type aria-hidden className="size-4 text-primary" />
                        <span className="min-w-0 flex-1 truncate">没有可快速编辑文本</span>
                      </button>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      data-builder-canvas-context-rename-object=""
                      onClick={() => runCanvasContextAction("rename-object")}
                    >
                      <TextCursorInput aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">重命名对象</span>
                      <span className="text-[0.68rem] text-on-surface-variant">Ctrl+F2</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      data-builder-canvas-context-tab-order=""
                      disabled={focusableTabOrderItems.length === 0}
                      onClick={() => runCanvasContextAction("tab-order")}
                    >
                      <Keyboard aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">显示 Tab 顺序</span>
                      <span className="text-[0.68rem] text-on-surface-variant">Ctrl+Alt+T</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      data-builder-canvas-context-go-slot={canvasContextMenuCommand ? "open" : "create"}
                      disabled={!canvasContextMenuEventName}
                      onClick={() => runCanvasContextAction("go-slot")}
                    >
                      <Braces aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">{canvasContextMenuCommand ? "转到槽函数" : "创建并转到槽函数"}</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      data-builder-canvas-context-run-event=""
                      disabled={!canvasContextMenuCommand}
                      onClick={() => runCanvasContextAction("run-event")}
                    >
                      <Play aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">运行事件</span>
                    </button>
                    <div className="my-1 h-px bg-outline-variant" />
                  </>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                  disabled={selectedIds.length === 0}
                  onClick={() => runCanvasContextAction("copy")}
                >
                  <ClipboardCopy aria-hidden className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate">复制选中控件</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                  disabled={selectedIds.length === 0}
                  data-builder-canvas-context-cut=""
                  onClick={() => runCanvasContextAction("cut")}
                >
                  <Scissors aria-hidden className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate">剪切选中控件</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                  disabled={clipboardRef.current.length === 0}
                  onClick={() => runCanvasContextAction("paste")}
                >
                  <ClipboardPaste aria-hidden className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate">粘贴</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                  disabled={selectedIds.length === 0}
                  onClick={() => runCanvasContextAction("duplicate")}
                >
                  <Copy aria-hidden className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate">复制副本</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                  disabled={selectedItems.length < 2}
                  data-builder-canvas-context-group=""
                  onClick={() => runCanvasContextAction("group")}
                >
                  <Box aria-hidden className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate">成组</span>
                  <span className="text-[0.68rem] text-on-surface-variant">Ctrl+G</span>
                </button>
                <div
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-1"
                  role="group"
                  aria-label="按布局模式成组"
                  data-builder-canvas-context-group-layout=""
                >
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 items-center justify-center gap-1 rounded-lg px-1 text-[0.68rem] font-medium text-on-surface-variant hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      disabled={selectedItems.length < 2}
                      aria-label="成组为自由布局 Frame"
                      title="自由布局"
                      data-builder-canvas-context-group-layout-mode="free"
                      onClick={() => runCanvasContextAction("group-free")}
                    >
                      <Move aria-hidden className="size-3.5 text-primary" />
                      <span>自由</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 items-center justify-center gap-1 rounded-lg px-1 text-[0.68rem] font-medium text-on-surface-variant hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      disabled={selectedItems.length < 2}
                      aria-label="成组为水平行布局 Frame"
                      title="水平行布局"
                      data-builder-canvas-context-group-layout-mode="row"
                      onClick={() => runCanvasContextAction("group-row")}
                    >
                      <RectangleHorizontal aria-hidden className="size-3.5 text-primary" />
                      <span>行</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 items-center justify-center gap-1 rounded-lg px-1 text-[0.68rem] font-medium text-on-surface-variant hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      disabled={selectedItems.length < 2}
                      aria-label="成组为垂直列布局 Frame"
                      title="垂直列布局"
                      data-builder-canvas-context-group-layout-mode="column"
                      onClick={() => runCanvasContextAction("group-column")}
                    >
                      <MoveDown aria-hidden className="size-3.5 text-primary" />
                      <span>列</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 items-center justify-center gap-1 rounded-lg px-1 text-[0.68rem] font-medium text-on-surface-variant hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      disabled={selectedItems.length < 2}
                      aria-label="成组为网格布局 Frame"
                      title="网格布局"
                      data-builder-canvas-context-group-layout-mode="grid"
                      onClick={() => runCanvasContextAction("group-grid")}
                    >
                      <Grid3x3 aria-hidden className="size-3.5 text-primary" />
                      <span>网格</span>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                  disabled={!selectedItems.some((item: any) => item.type === "frame")}
                  data-builder-canvas-context-ungroup=""
                  onClick={() => runCanvasContextAction("ungroup")}
                >
                  <Layers aria-hidden className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate">取消成组</span>
                  <span className="text-[0.68rem] text-on-surface-variant">Ctrl+Shift+G</span>
                </button>
                {selectedItems.length > 1 ? (
                  <>
                    <div className="my-1 h-px bg-outline-variant" />
                    <div className="px-2 pb-1 pt-1 text-[0.64rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">
                      对齐
                    </div>
                    <div className="grid grid-cols-3 gap-1" role="group" aria-label="对齐选中控件">
                      <button
                        type="button"
                        role="menuitem"
                        className="focus-ring flex h-8 items-center justify-center rounded-xl hover:bg-surface-container-high"
                        aria-label="左对齐"
                        title="左对齐"
                        onClick={() => runCanvasContextAction("align-left")}
                      >
                        <AlignHorizontalJustifyStart aria-hidden className="size-4 text-primary" />
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="focus-ring flex h-8 items-center justify-center rounded-xl hover:bg-surface-container-high"
                        aria-label="水平居中对齐"
                        title="水平居中对齐"
                        onClick={() => runCanvasContextAction("align-center")}
                      >
                        <AlignHorizontalJustifyCenter aria-hidden className="size-4 text-primary" />
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="focus-ring flex h-8 items-center justify-center rounded-xl hover:bg-surface-container-high"
                        aria-label="右对齐"
                        title="右对齐"
                        onClick={() => runCanvasContextAction("align-right")}
                      >
                        <AlignHorizontalJustifyEnd aria-hidden className="size-4 text-primary" />
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="focus-ring flex h-8 items-center justify-center rounded-xl hover:bg-surface-container-high"
                        aria-label="顶部对齐"
                        title="顶部对齐"
                        onClick={() => runCanvasContextAction("align-top")}
                      >
                        <AlignVerticalJustifyStart aria-hidden className="size-4 text-primary" />
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="focus-ring flex h-8 items-center justify-center rounded-xl hover:bg-surface-container-high"
                        aria-label="垂直居中对齐"
                        title="垂直居中对齐"
                        onClick={() => runCanvasContextAction("align-middle")}
                      >
                        <AlignVerticalJustifyCenter aria-hidden className="size-4 text-primary" />
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="focus-ring flex h-8 items-center justify-center rounded-xl hover:bg-surface-container-high"
                        aria-label="底部对齐"
                        title="底部对齐"
                        onClick={() => runCanvasContextAction("align-bottom")}
                      >
                        <AlignVerticalJustifyEnd aria-hidden className="size-4 text-primary" />
                      </button>
                    </div>
                    {selectedItems.length > 2 ? (
                      <>
                        <div className="px-2 pb-1 pt-2 text-[0.64rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">
                          分布
                        </div>
                        <div className="grid grid-cols-2 gap-1" role="group" aria-label="等距分布选中控件" data-builder-canvas-context-distribute="">
                          <button
                            type="button"
                            role="menuitem"
                            className="focus-ring flex h-8 items-center justify-center gap-1.5 rounded-xl hover:bg-surface-container-high"
                            aria-label="水平等距分布"
                            title="水平等距分布"
                            data-builder-canvas-context-distribute-horizontal=""
                            onClick={() => runCanvasContextAction("distribute-horizontal")}
                          >
                            <Move aria-hidden className="size-4 text-primary" />
                            <span className="text-[0.68rem]">水平</span>
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className="focus-ring flex h-8 items-center justify-center gap-1.5 rounded-xl hover:bg-surface-container-high"
                            aria-label="垂直等距分布"
                            title="垂直等距分布"
                            data-builder-canvas-context-distribute-vertical=""
                            onClick={() => runCanvasContextAction("distribute-vertical")}
                          >
                            <MoveDown aria-hidden className="size-4 text-primary" />
                            <span className="text-[0.68rem]">垂直</span>
                          </button>
                        </div>
                      </>
                    ) : null}
                    <div className="px-2 pb-1 pt-2 text-[0.64rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">
                      尺寸
                    </div>
                    <div className="grid grid-cols-3 gap-1" role="group" aria-label="匹配选中控件尺寸" data-builder-canvas-context-match-size="">
                      <button
                        type="button"
                        role="menuitem"
                        className="focus-ring flex h-8 items-center justify-center rounded-xl text-[0.68rem] font-medium text-primary hover:bg-surface-container-high"
                        aria-label="匹配宽度"
                        title="匹配宽度"
                        data-builder-canvas-context-match-width=""
                        onClick={() => runCanvasContextAction("match-width")}
                      >
                        W
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="focus-ring flex h-8 items-center justify-center rounded-xl text-[0.68rem] font-medium text-primary hover:bg-surface-container-high"
                        aria-label="匹配高度"
                        title="匹配高度"
                        data-builder-canvas-context-match-height=""
                        onClick={() => runCanvasContextAction("match-height")}
                      >
                        H
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="focus-ring flex h-8 items-center justify-center rounded-xl hover:bg-surface-container-high"
                        aria-label="匹配宽高"
                        title="匹配宽高"
                        data-builder-canvas-context-match-both=""
                        onClick={() => runCanvasContextAction("match-size")}
                      >
                        <Maximize2 aria-hidden className="size-4 text-primary" />
                      </button>
                    </div>
                  </>
                ) : null}
                <div className="my-1 h-px bg-outline-variant" />
                {canvasContextMenuItem ? (
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      disabled={selectedIds.length === 0}
                      data-builder-canvas-context-layer-forward=""
                      onClick={() => runCanvasContextAction("layer-forward")}
                    >
                      <MoveUp aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">上移一层</span>
                      <span className="text-[0.68rem] text-on-surface-variant">Ctrl+]</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      disabled={selectedIds.length === 0}
                      data-builder-canvas-context-layer-backward=""
                      onClick={() => runCanvasContextAction("layer-backward")}
                    >
                      <MoveDown aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">下移一层</span>
                      <span className="text-[0.68rem] text-on-surface-variant">Ctrl+[</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      disabled={selectedIds.length === 0}
                      data-builder-canvas-context-front=""
                      onClick={() => runCanvasContextAction("front")}
                    >
                      <MoveUp aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">置于顶层</span>
                      <span className="text-[0.68rem] text-on-surface-variant">Ctrl+Shift+]</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      disabled={selectedIds.length === 0}
                      data-builder-canvas-context-back=""
                      onClick={() => runCanvasContextAction("back")}
                    >
                      <MoveDown aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">置于底层</span>
                      <span className="text-[0.68rem] text-on-surface-variant">Ctrl+Shift+[</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      disabled={selectedIds.length === 0}
                      onClick={() => runCanvasContextAction("lock")}
                    >
                      {canvasContextMenuSelectionLocked ? (
                        <LockOpen aria-hidden className="size-4 text-primary" />
                      ) : (
                        <Lock aria-hidden className="size-4 text-primary" />
                      )}
                      <span className="min-w-0 flex-1 truncate">{canvasContextMenuSelectionLocked ? "解锁选择" : "锁定选择"}</span>
                    </button>
                    <div className="px-2 pb-1 pt-2 text-[0.64rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">
                      运行状态
                    </div>
                    <div
                      className="mx-1 mb-1 grid grid-cols-3 gap-1 rounded-xl bg-surface-container-high px-2 py-1.5 text-center text-[0.58rem] text-on-surface-variant"
                      data-builder-canvas-context-selection-summary=""
                      data-builder-canvas-context-selection-count={selectedIds.length}
                      data-builder-canvas-context-selection-focusable-count={selectedBatchRuntimeSummary.focusableCount}
                      data-builder-canvas-context-selection-readonly-count={selectedBatchRuntimeSummary.readOnlyCapableCount}
                    >
                      <span className="truncate">
                        <span className="block font-semibold text-on-surface">{selectedIds.length}</span>
                        已选
                      </span>
                      <span className="truncate">
                        <span className="block font-semibold text-on-surface">{selectedBatchRuntimeSummary.focusableCount}</span>
                        可交互
                      </span>
                      <span className="truncate">
                        <span className="block font-semibold text-on-surface">{selectedBatchRuntimeSummary.readOnlyCapableCount}</span>
                        可只读
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1" role="group" aria-label="切换选中控件运行状态" data-builder-canvas-context-runtime-state="">
                      <button
                        type="button"
                        role="menuitem"
                        className={cn(
                          "focus-ring flex h-8 items-center justify-center rounded-xl hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40",
                          !canvasContextMenuSelectionVisible && "bg-primary/10 text-primary",
                        )}
                        disabled={selectedIds.length === 0}
                        data-builder-canvas-context-toggle-visible=""
                        aria-label={canvasContextMenuSelectionVisible ? "运行态隐藏选择" : "运行态显示选择"}
                        title={canvasContextMenuSelectionVisible ? "运行态隐藏选择" : "运行态显示选择"}
                        onClick={() => runCanvasContextAction("toggle-visible")}
                      >
                        {canvasContextMenuSelectionVisible ? <Eye aria-hidden className="size-4 text-primary" /> : <EyeOff aria-hidden className="size-4 text-primary" />}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={cn(
                          "focus-ring flex h-8 items-center justify-center rounded-xl hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40",
                          !canvasContextMenuSelectionEnabled && selectedBatchRuntimeSummary.focusableCount > 0 && "bg-primary/10 text-primary",
                        )}
                        disabled={selectedBatchRuntimeSummary.focusableCount === 0}
                        data-builder-canvas-context-toggle-enabled=""
                        aria-label={canvasContextMenuSelectionEnabled ? "运行态禁用交互" : "运行态启用交互"}
                        title={canvasContextMenuSelectionEnabled ? "运行态禁用交互" : "运行态启用交互"}
                        onClick={() => runCanvasContextAction("toggle-enabled")}
                      >
                        <ToggleLeft aria-hidden className="size-4 text-primary" />
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={cn(
                          "focus-ring flex h-8 items-center justify-center rounded-xl hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40",
                          canvasContextMenuSelectionReadOnly && "bg-primary/10 text-primary",
                        )}
                        disabled={selectedBatchRuntimeSummary.readOnlyCapableCount === 0}
                        data-builder-canvas-context-toggle-readonly=""
                        aria-label={canvasContextMenuSelectionReadOnly ? "允许运行态编辑" : "设为运行态只读"}
                        title={canvasContextMenuSelectionReadOnly ? "允许运行态编辑" : "设为运行态只读"}
                        onClick={() => runCanvasContextAction("toggle-read-only")}
                      >
                        <TextCursorInput aria-hidden className="size-4 text-primary" />
                      </button>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      data-builder-canvas-context-select-same-type=""
                      disabled={!canvasContextMenuItem && selectedItems.length === 0}
                      onClick={() => runCanvasContextAction("select-same-type")}
                    >
                      <ListChecks aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">选择同类控件</span>
                      <span className="text-[0.68rem] text-on-surface-variant">Ctrl+Shift+A</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      data-builder-canvas-context-invert-selection=""
                      disabled={items.length === 0}
                      onClick={() => runCanvasContextAction("invert-selection")}
                    >
                      <MousePointer2 aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">反选控件</span>
                      <span className="text-[0.68rem] text-on-surface-variant">Ctrl+I</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-40"
                      disabled={selectedIds.length === 0}
                      onClick={() => runCanvasContextAction("delete")}
                    >
                      <Trash2 aria-hidden className="size-4" />
                      <span className="min-w-0 flex-1 truncate">删除选择</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      disabled={items.length === 0}
                      onClick={() => runCanvasContextAction("select-all")}
                    >
                      <MousePointer2 aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">全选控件</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      data-builder-canvas-context-select-same-type="idle"
                      disabled={selectedItems.length === 0}
                      onClick={() => runCanvasContextAction("select-same-type")}
                    >
                      <ListChecks aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">选择同类控件</span>
                      <span className="text-[0.68rem] text-on-surface-variant">Ctrl+Shift+A</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      data-builder-canvas-context-invert-selection="idle"
                      disabled={items.length === 0}
                      onClick={() => runCanvasContextAction("invert-selection")}
                    >
                      <MousePointer2 aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">反选控件</span>
                      <span className="text-[0.68rem] text-on-surface-variant">Ctrl+I</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
                      disabled={selectedIds.length === 0}
                      onClick={() => runCanvasContextAction("clear")}
                    >
                      <MousePointer2 aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">清空选择</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high"
                      onClick={() => runCanvasContextAction("fit")}
                    >
                      <ZoomIn aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">适配画布</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="focus-ring flex h-8 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-surface-container-high"
                      onClick={() => runCanvasContextAction("components")}
                    >
                      <Layers aria-hidden className="size-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate">打开控件库</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : null}
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
              <span className="text-[0.68rem] text-on-surface-variant">
                {dropIntent ? "放置" : "拖拽"}
              </span>
            </div>
          ) : null}
      </div>
  );
}
