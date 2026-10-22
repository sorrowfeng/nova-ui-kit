/* eslint-disable @typescript-eslint/no-explicit-any */
// Extracted from BuilderShowcase.tsx (P2-9): the "design" workspace view.
// BuilderShowcase still owns the state; this module only renders it.

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignHorizontalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignVerticalJustifyStart, ArrowRight, Braces, CheckCircle2, ChevronDown, ChevronRight, ClipboardCopy, ClipboardPaste, Columns3, Copy, CornerDownRight, Eye, EyeOff, FileImage, FileJson, FolderOpen, Grid3x3, Hand, Keyboard, Layers, Lock, LockOpen, Maximize2, Monitor, MousePointer2, Move, MoveDown, MoveUp, PanelTop, Play, Plus, Redo2, RotateCcw, Ruler, Save, Search, Settings2, Star, Terminal, ToggleLeft, Trash2, Type, Undo2, Wand2, X, ZoomIn, ZoomOut } from "lucide-react";
import { AlignGuideOverlay } from "./AlignGuideOverlay";
import { Badge } from "@/components/ui/badge";
import { BatchSelectToolbar, CanvasFindBar } from "./CanvasOverlays";
import { BuilderResultTargetProp, ButtonVariant, CanvasBackground, CanvasPresetId, ControlSize, FrameLayoutMode, ImageFit, ReleaseBundleTarget, ReleaseTitlebarStyle, ReleaseWindowKind, ResponsiveBreakpointId } from "./types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConflictMergeEditor } from "./ConflictMergeEditor";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InspectorDock } from "./InspectorDock";
import { Label } from "@/components/ui/label";
import { MIN_ITEM_HEIGHT, MIN_ITEM_WIDTH } from "./layout";
import { NavigatorDock } from "./NavigatorDock";
import { ProjectDock } from "./ProjectDock";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectionActionBar } from "./SelectionActionBar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToolchainBanner } from "./ToolchainBanner";

import { DesignWorkspace } from "./DesignWorkspace";
import { Field, NumberBox, PanelTitle, PathRow, PropertySection, SignalChip, TemplateMiniPreview } from "./view-helpers";

export type DesignViewScope = Record<string, any>;

export function DesignView(props: { scope: DesignViewScope }): ReactNode {
  const scope = props.scope ?? {};
  const {
    SelectedProjectExplorerIcon,
    activeBreakpoint,
    activeComponentPaletteKit,
    activeEditorTabId,
    activeFile,
    activeProject,
    activeProjectSnapshots,
    addComponent,
    addImageFromAsset,
    alignPreviewMode,
    alignSelected,
    applyCanvasPreset,
    applyPageWindowShellPreset,
    applySelectedPropertyAutoFix,
    availableParentFrames,
    bindSelectedImageAsset,
    bottomDockMinimized,
    bringToFront,
    builderItemRuntimeState,
    builderPropertySectionLabels,
    builderPropertySectionOptions,
    canMoveLayerWithinGroup,
    canPaste,
    canRedo,
    canUndo,
    canvasContentPlaneStyle,
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
    checkpointDiff,
    checkpointDiffDetails,
    checkpointDiffLoadingId,
    checkpointDiffSummary,
    checkpointLabel,
    chooseCanvasZoom,
    chooseImageAsset,
    chooseProjectDirectory,
    clamp,
    cleanClosableOpenEditorTabCount,
    clearComponentPaletteKit,
    clearSelection,
    closeCleanEditorFileTabs,
    closeEditorFileTab,
    closeOtherEditorFileTabs,
    cn,
    collapseProjectExplorerTree,
    collapsedProjectExplorerNodeSet,
    commandResultSchema,
    compactJson,
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
    conflictFile,
    copiedArtifactPath,
    copyArtifactPath,
    copySelectionToClipboard,
    createAndBindBackendIntegrationCommand,
    createDiskCheckpoint,
    createNewFileFromNavigator,
    createNewProject,
    cutSelectionToClipboard,
    deleteAsset,
    deleteSelected,
    designSideDockBottomClearance,
    dirtyOpenEditorTabCount,
    diskBusy,
    diskCheckpoints,
    distributeSelected,
    dropIntent,
    duplicateActiveFileFromNavigator,
    duplicateSelected,
    emptyCanvasQuickStarts,
    enqueueProjectTask,
    eventPayloadFieldSelection,
    eventPayloadFields,
    eventResultTargetProps,
    eventResultTargets,
    expandProjectExplorerTree,
    fitCanvasToViewport,
    fitSelectedCanvasToViewport,
    focusComponentPaletteKit,
    focusSelectedObjectNameEditor,
    focusSelectedRosterItem,
    focusableTabOrderItems,
    formatProjectSnapshotTime,
    formatSignedDelta,
    frameLayoutMetrics,
    frameLayoutMode,
    getAbsolutePosition,
    getDefinition,
    getFrameDropIntentFromClientPoint,
    getItemIdsInsideMarquee,
    getItemSummary,
    getSelectionMarqueeRect,
    goToSlotForItem,
    groupSelectedIntoFrame,
    handleAssetDragStart,
    handleCanvasDrop,
    handleCanvasViewportScroll,
    handleCanvasViewportWheel,
    handlePaletteMouseDown,
    handleProjectExplorerNode,
    handleProjectExplorerTreeKeyDown,
    hasCanvasSelection,
    insertComponentFromShortcut,
    insertComponentPaletteKitPrimary,
    insertComponentPaletteKitScaffold,
    inspectDiskCheckpointDiff,
    inspectorPropertyQuery,
    inspectorPropertyQueryActive,
    inspectorWorkflowBadge,
    inspectorWorkflowSteps,
    invokeIfAvailable,
    isTauriRuntime,
    itemConstraints,
    itemUsesOptions,
    items,
    latestProjectSnapshot,
    layerMoveTitle,
    leftDockCollapsed,
    leftDockTab,
    leftDockTabs,
    managedProjects,
    matchSelectedSize,
    mode,
    moveCanvasPan,
    moveLayer,
    moveSelectedLayerStep,
    moveSelectedTabOrder,
    navigatorLayerMessage,
    navigatorQuery,
    normalizeReleaseTitlebarStyle,
    normalizeTabOrderForFocusableItems,
    numberFromInput,
    open,
    openCanvasContextMenu,
    openEditorTab,
    openEditorTabs,
    openLocalArtifact,
    openProjectExplorerContextMenu,
    openProjectFromDisk,
    openProjectRoot,
    openPropertySectionFromSearch,
    openPropertySections,
    openSelectedConnectionTarget,
    openSelectedConnections,
    openSelectedProperties,
    otherOpenEditorUiTabCount,
    page,
    pageTitlebarStyleMeta,
    pageWindowKindMeta,
    pageWindowShellPresets,
    pasteClipboardItems,
    payloadFieldsWithToggle,
    projectDependencyGraph,
    projectExplorerActionLabel,
    projectExplorerFilter,
    projectExplorerFilterCounts,
    projectExplorerFilterOptions,
    projectExplorerFolderNodeIds,
    projectExplorerModel,
    projectExplorerNodeStatus,
    projectExplorerPrimaryActionLabel,
    projectExplorerQuery,
    projectExplorerStatusClass,
    projectTemplates,
    propertySchemaHint,
    propertySectionForProp,
    pushProjectSnapshot,
    quickTextPropLabel,
    refreshManagedProjects,
    releaseBundleTargets,
    releaseTitlebarStyleMeta,
    releaseTitlebarStyles,
    releaseWindowKindMeta,
    releaseWindowKinds,
    releaseWindowShellMatchesPage,
    removeItemFromSelection,
    renameActiveFile,
    renameActiveProject,
    renameFileById,
    renderCanvasNode,
    replaceActiveProjectWithTemplate,
    replaceTemplateOpen,
    requestDeleteActiveFile,
    requestDeleteActiveProject,
    requestDeleteSelected,
    resetCanvasView,
    resetSelectedBreakpointOverride,
    responsiveBreakpointSize,
    restoreDiskCheckpoint,
    restoreLatestProjectSnapshot,
    revealEditorTabInProject,
    revealSelectedConnectionLogs,
    reverseDependencyStatusLabel,
    reverseDependencyStatusVariant,
    reverseDependencySummaries,
    rightDockCollapsed,
    rightDockTab,
    rightDockTabs,
    runProjectExplorerContextAction,
    runRedoCanvas,
    runSelectedEventAndRevealLogs,
    runSelectedEventFromActionBar,
    runUndoCanvas,
    runningProjectTask,
    sanitizeRustCommandName,
    selectAllItems,
    selectFile,
    selectHierarchyBreadcrumbNode,
    selectInverseSelection,
    selectItem,
    selectOptionsForItem,
    selectProject,
    selectProjectReverseDependencyOutputs,
    selectSameTypeControls,
    selectedBatchCommonHeight,
    selectedBatchCommonWidth,
    selectedBatchLayoutSummary,
    selectedBatchRuntimeSummary,
    selectedBatchTypeSummary,
    selectedBindableProps,
    selectedBreakpointOverride,
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
    selectedIds,
    selectedItem,
    selectedItemHierarchy,
    selectedItems,
    selectedLatestSimulatorTrace,
    selectedObjectNameInputRef,
    selectedParentAutoLayout,
    selectedProjectExplorerDisplayPath,
    selectedProjectExplorerFile,
    selectedProjectExplorerFileSaveState,
    selectedProjectExplorerNode,
    selectedProjectExplorerParentNode,
    selectedProjectExplorerPathNodes,
    selectedProjectExplorerRelativePath,
    selectedProjectTemplate,
    selectedProjectTemplateId,
    selectedPropertyAutoFixCount,
    selectedPropertyIssueProps,
    selectedPropertyIssues,
    selectedPropertySchema,
    selectedPropertySectionMatchCounts,
    selectedQuickTextProps,
    selectedRuntimeState,
    selectedSameTypeCount,
    selectedSignalSlotOutlineEntry,
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
    setAlignPreviewMode,
    setCanvasControlsExpanded,
    setCanvasFindOpen,
    setCanvasFindQuery,
    setCheckpointLabel,
    setComponentPaletteCategory,
    setComponentPaletteQuery,
    setConflictFile,
    setDropIntent,
    setInspectorPropertyQuery,
    setLeftDockCollapsed,
    setLeftDockTab,
    setMode,
    setNavigatorLayerMessage,
    setNavigatorQuery,
    setProjectExplorerFilter,
    setProjectExplorerQuery,
    setProjectGitStatus,
    setReplaceTemplateOpen,
    setResponsiveBreakpoint,
    setRightDockCollapsed,
    setRightDockTab,
    setSelectedId,
    setSelectedLockState,
    setSelectedProjectExplorerNodeId,
    setSelectedProjectTemplateId,
    setSelectedRuntimeState,
    setSelectionAnchorId,
    setSimulatorStateValues,
    setSimulatorTrace,
    setTabOrderOverlayVisible,
    showComponentPaletteCollections,
    showComponentPaletteKits,
    showComponentPaletteQuickInsert,
    showProjectJumpFeedback,
    simulatorStateFromProject,
    simulatorStateValues,
    simulatorTrace,
    smartGuides,
    startCanvasMousePan,
    startCanvasPan,
    startInlineTextEdit,
    startSelectionMarquee,
    stopCanvasPan,
    suppressCanvasClickRef,
    suppressPaletteClickRef,
    syncReleaseWindowFromActivePage,
    tabOrderOverlayVisible,
    textPropertyValue,
    toggleCanvasPanMode,
    toggleComponentPaletteFavorite,
    toggleItemLockFromNavigator,
    toggleItemRuntimeVisibility,
    toggleOutputDockVisibility,
    toggleProjectExplorerNode,
    togglePropertySection,
    toggleSelectedConstraint,
    toggleSelectedLock,
    toggleSelectedRuntimeVisibility,
    toolchainStatus,
    top,
    topLevelItems,
    treeRows,
    ungroupSelectedFrames,
    updateItemPropsById,
    updatePage,
    updatePageTitlebarStyle,
    updatePageWindowKind,
    updateProjectRootPath,
    updateReleaseConfig,
    updateSelectedBatchSize,
    updateSelectedEventBinding,
    updateSelectedEventCommand,
    updateSelectedLayout,
    updateSelectedObjectName,
    updateSelectedParent,
    updateSelectedProps,
    updateSelectedStateBinding,
    updateSelectedTabIndex,
    visibleComponentCoverageRows,
    visibleComponentPalette,
    visibleComponentPaletteDefaultOpenGroupCount,
    visibleComponentPaletteGroups,
    visibleNavigatorTreeRows,
    visibleProjectExplorerNodes,
    visibleProjectExplorerRows,
    window,
    workspace,
    zoomCanvasBy,
  } = scope;

  return (
            <DesignWorkspace leftCollapsed={leftDockCollapsed} rightCollapsed={rightDockCollapsed}>
              <ProjectDock
                tabs={leftDockTabs}
                activeTab={leftDockTab}
                onTabChange={setLeftDockTab}
                collapsed={leftDockCollapsed}
                onCollapsedChange={setLeftDockCollapsed}
                tabLayout="inline"
                bottomClearance={designSideDockBottomClearance}
              >
                {leftDockTab === "project" ? (
                  <>
                <PanelTitle icon={FolderOpen} title="项目" description="管理本地 UI 编辑器项目。" />
                <div className="mb-5 space-y-3 rounded-[22px] bg-surface-container-low p-3">
                  <section className="space-y-3 rounded-2xl border border-outline-variant bg-surface-container-high p-3" data-builder-project-explorer="">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-semibold text-on-surface">项目文件树</h3>
                        <p className="mt-1 text-[0.68rem] leading-4 text-on-surface-variant">
                          显示保存后的真实目录结构；隐藏目录用于编辑器元数据，不属于业务 UI。
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Badge variant={activeProject.rootPath ? "secondary" : "outline"}>{activeProject.rootPath ? "已落盘" : "未保存"}</Badge>
                        <button
                          type="button"
                          aria-label="展开项目文件树"
                          className="focus-ring rounded-lg px-1.5 py-1 text-[0.62rem] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                          data-builder-project-sidebar-tree-expand-all=""
                          title="展开全部文件夹 · Ctrl+Alt+→"
                          onClick={expandProjectExplorerTree}
                        >
                          展
                        </button>
                        <button
                          type="button"
                          aria-label="收起项目文件树"
                          className="focus-ring rounded-lg px-1.5 py-1 text-[0.62rem] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                          data-builder-project-sidebar-tree-collapse-all=""
                          title="收起全部文件夹 · Ctrl+Alt+←"
                          onClick={collapseProjectExplorerTree}
                        >
                          收
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[0.66rem]">
                      {[
                        ["UI", activeProject.files.length],
                        ["控件", projectExplorerModel.controlCount],
                        ["命令", activeProject.rustCommands.length],
                        [".nova", diskCheckpoints.length + 2],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-surface-container-low px-1.5 py-2">
                          <p className="font-mono text-[0.72rem] text-on-surface">{value}</p>
                          <p className="mt-0.5 truncate text-on-surface-variant">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <Settings2 aria-hidden className="size-3.5 shrink-0 text-primary" />
                        <span className="shrink-0 text-[0.68rem] font-medium text-on-surface-variant">编辑器元数据</span>
                      </div>
                      <p className="mt-1 break-all font-mono text-[0.66rem] leading-4 text-on-surface-variant">{projectExplorerModel.metadataPath}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5" data-builder-project-tree-filter="">
                      {projectExplorerFilterOptions.map((option: any) => {
                        const active = option.id === projectExplorerFilter;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            aria-pressed={active}
                            data-builder-project-filter-option={option.id}
                            title={option.description}
                            className={cn(
                              "focus-ring min-w-0 rounded-xl border px-2 py-1.5 text-left text-[0.68rem] transition",
                              active
                                ? "border-primary bg-primary/10 text-on-surface"
                                : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-outline hover:bg-surface-container",
                            )}
                            onClick={() => setProjectExplorerFilter(option.id)}
                          >
                            <span className="flex min-w-0 items-center justify-between gap-1">
                              <span className="truncate font-medium">{option.label}</span>
                              <span className="font-mono text-[0.62rem] opacity-70">{projectExplorerFilterCounts.get(option.id) ?? 0}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="relative" data-builder-project-tree-search="">
                      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-on-surface-variant" />
                      <Input
                        value={projectExplorerQuery}
                        inputSize="sm"
                        aria-label="搜索项目文件树"
                        placeholder="搜索文件、路径、类型..."
                        className="h-8 rounded-xl bg-surface-container-low pl-8 pr-16 text-xs"
                        onChange={(event: any) => setProjectExplorerQuery(event.target.value)}
                        onKeyDown={(event: any) => {
                          if (event.key === "Enter" && visibleProjectExplorerNodes[0]) {
                            event.preventDefault();
                            handleProjectExplorerNode(visibleProjectExplorerNodes[0]);
                          }
                          if (event.key === "Escape") {
                            event.preventDefault();
                            setProjectExplorerQuery("");
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[0.62rem] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface disabled:opacity-40"
                        disabled={!projectExplorerQuery}
                        onClick={() => setProjectExplorerQuery("")}
                      >
                        清空
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-container-low px-3 py-2 text-[0.68rem] text-on-surface-variant">
                      <span className="truncate">
                        {projectExplorerFilterOptions.find((option: any) => option.id === projectExplorerFilter)?.label ?? "全部"} · {visibleProjectExplorerNodes.length} 个节点
                      </span>
                      {projectExplorerQuery ? <span className="max-w-[9rem] truncate font-mono">{projectExplorerQuery}</span> : <span>本地工程视图</span>}
                    </div>
                    {selectedProjectExplorerNode ? (
                      <div className="rounded-2xl border border-outline-variant bg-surface-container px-3 py-3" data-builder-project-node-focus="">
                        <div className="flex min-w-0 items-start gap-2">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-surface-container-highest text-primary">
                            <SelectedProjectExplorerIcon aria-hidden className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="truncate text-xs font-semibold text-on-surface">{selectedProjectExplorerNode.label}</p>
                              <Badge variant="outline" className="shrink-0">
                                {projectExplorerActionLabel(selectedProjectExplorerNode.action)}
                              </Badge>
                            </div>
                            <p className="mt-1 line-clamp-2 text-[0.68rem] leading-4 text-on-surface-variant">{selectedProjectExplorerNode.detail}</p>
                          </div>
                        </div>
                        <nav
                          className="mt-2 flex min-w-0 flex-wrap items-center gap-1 rounded-xl bg-surface-container-low px-2 py-1.5 text-[0.62rem]"
                          aria-label="侧栏当前项目节点路径"
                          data-builder-project-sidebar-node-breadcrumb=""
                        >
                          {selectedProjectExplorerPathNodes.map((node: any, index: any) => {
                            const current = node.id === selectedProjectExplorerNode.id;
                            return (
                              <span key={node.id} className="flex min-w-0 items-center gap-1">
                                {index > 0 ? <ChevronRight aria-hidden className="size-3 shrink-0 text-on-surface-variant" /> : null}
                                <button
                                  type="button"
                                  className={cn(
                                    "focus-ring max-w-[8rem] truncate rounded-md px-1.5 py-0.5 transition",
                                    current
                                      ? "bg-secondary-container text-secondary-container-foreground"
                                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                                  )}
                                  aria-current={current ? "page" : undefined}
                                  data-builder-project-sidebar-node-breadcrumb-segment={node.id}
                                  onClick={() => setSelectedProjectExplorerNodeId(node.id)}
                                >
                                  {node.label.replace(/\/$/, "")}
                                </button>
                              </span>
                            );
                          })}
                        </nav>
                        <div className="mt-2 rounded-xl bg-surface-container-low px-2.5 py-2">
                          <p className="break-all font-mono text-[0.66rem] leading-4 text-on-surface-variant">
                            {selectedProjectExplorerDisplayPath}
                          </p>
                        </div>
                        <div
                          className="mt-2 grid grid-cols-2 gap-2 text-[0.66rem]"
                          data-builder-project-sidebar-node-context=""
                        >
                          <button
                            type="button"
                            className="focus-ring min-w-0 rounded-xl border border-outline-variant bg-surface-container-low px-2 py-1.5 text-left transition hover:bg-surface-container-high disabled:opacity-50"
                            data-builder-project-sidebar-parent-node={selectedProjectExplorerParentNode?.id ?? "none"}
                            disabled={!selectedProjectExplorerParentNode}
                            onClick={() => {
                              if (selectedProjectExplorerParentNode) {
                                setSelectedProjectExplorerNodeId(selectedProjectExplorerParentNode.id);
                              }
                            }}
                          >
                            <span className="block truncate text-on-surface">上级</span>
                            <span className="block truncate text-on-surface-variant">{selectedProjectExplorerParentNode?.label ?? "项目根"}</span>
                          </button>
                          <div className="min-w-0 rounded-xl border border-outline-variant bg-surface-container-low px-2 py-1.5">
                            <span className="block truncate text-on-surface">相对路径</span>
                            <span className="block truncate font-mono text-on-surface-variant">{selectedProjectExplorerRelativePath || "."}</span>
                          </div>
                        </div>
                        {selectedProjectExplorerFile ? (
                          <div className="mt-2" data-builder-project-sidebar-file-rename="">
                            <Input
                              inputSize="sm"
                              aria-label="重命名项目树 UI 文件"
                              value={selectedProjectExplorerFile.name}
                              onChange={(event: any) => renameFileById(selectedProjectExplorerFile.id, event.target.value)}
                            />
                            <div
                              className={cn(
                                "mt-2 rounded-xl border px-2.5 py-1.5 text-[0.66rem]",
                                selectedProjectExplorerFileSaveState?.dirty
                                  ? "border-destructive/25 bg-destructive/10 text-destructive"
                                  : "border-outline-variant bg-surface-container-low text-on-surface-variant",
                              )}
                              data-builder-project-sidebar-file-save-state={selectedProjectExplorerFileSaveState?.dirty ? "dirty" : "clean"}
                            >
                              {selectedProjectExplorerFileSaveState?.dirty ? "未保存同步" : "已同步"}
                            </div>
                          </div>
                        ) : null}
                        <div className="mt-2 grid grid-cols-2 gap-2" data-builder-project-sidebar-quick-actions="">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="justify-center"
                            data-builder-project-sidebar-copy-selected-path=""
                            disabled={!selectedProjectExplorerDisplayPath}
                            onClick={() => void copyArtifactPath(selectedProjectExplorerDisplayPath)}
                          >
                            <ClipboardCopy aria-hidden className="size-4" />
                            复制路径
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="justify-center"
                            data-builder-project-sidebar-open-selected=""
                            disabled={selectedProjectExplorerNode.action === "none"}
                            onClick={() => handleProjectExplorerNode(selectedProjectExplorerNode)}
                          >
                            <ArrowRight aria-hidden className="size-4" />
                            {projectExplorerPrimaryActionLabel(selectedProjectExplorerNode)}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="justify-center"
                            data-builder-project-sidebar-copy-relative-path=""
                            disabled={!selectedProjectExplorerRelativePath}
                            onClick={() => void copyArtifactPath(selectedProjectExplorerRelativePath)}
                          >
                            <FileJson aria-hidden className="size-4" />
                            相对路径
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="justify-center"
                            data-builder-project-sidebar-filter-kind=""
                            onClick={() => runProjectExplorerContextAction("filter-kind", selectedProjectExplorerNode)}
                          >
                            <Search aria-hidden className="size-4" />
                            同类
                          </Button>
                        </div>
                        {copiedArtifactPath &&
                        (copiedArtifactPath === selectedProjectExplorerDisplayPath || copiedArtifactPath === selectedProjectExplorerRelativePath) ? (
                          <p className="mt-2 text-center text-[0.66rem] text-primary">路径已复制</p>
                        ) : null}
                      </div>
                    ) : null}
                    <section
                      className="rounded-2xl border border-outline-variant bg-surface-container px-3 py-3"
                      data-builder-project-sidebar-open-files=""
                      data-builder-project-sidebar-open-files-active-tab={activeEditorTabId}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-xs font-semibold text-on-surface">打开文件</h3>
                          <p className="mt-1 text-[0.66rem] leading-4 text-on-surface-variant">项目 Dock 中的轻量标签管理。</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Badge variant={dirtyOpenEditorTabCount > 0 ? "outline" : "secondary"}>
                            {dirtyOpenEditorTabCount > 0 ? `${dirtyOpenEditorTabCount} 未保存` : "同步"}
                          </Badge>
                          <button
                            type="button"
                            className="focus-ring rounded-lg px-1.5 py-1 text-[0.62rem] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface disabled:opacity-35"
                            data-builder-project-sidebar-open-files-close-clean=""
                            disabled={cleanClosableOpenEditorTabCount === 0}
                            title={cleanClosableOpenEditorTabCount > 0 ? `关闭 ${cleanClosableOpenEditorTabCount} 个已同步 UI 标签` : "没有可关闭的已同步 UI 标签"}
                            onClick={closeCleanEditorFileTabs}
                          >
                            同步
                          </button>
                          <button
                            type="button"
                            className="focus-ring rounded-lg px-1.5 py-1 text-[0.62rem] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface disabled:opacity-35"
                            data-builder-project-sidebar-open-files-close-others=""
                            disabled={otherOpenEditorUiTabCount === 0}
                            title={otherOpenEditorUiTabCount > 0 ? `只保留当前 UI，关闭 ${otherOpenEditorUiTabCount} 个其他 UI 标签` : "没有其他 UI 标签可关闭"}
                            onClick={() => closeOtherEditorFileTabs(activeFile.id)}
                          >
                            保留
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        {openEditorTabs.slice(0, 5).map((tab: any) => {
                          const TabIcon = tab.icon;
                          const active = tab.id === activeEditorTabId;
                          return (
                            <div
                              key={`sidebar-open-${tab.id}`}
                              className={cn(
                                "grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1 rounded-xl border px-1.5 py-1",
                                active
                                  ? "border-primary/35 bg-secondary-container text-secondary-container-foreground"
                                  : "border-outline-variant bg-surface-container-low text-on-surface-variant",
                              )}
                              data-builder-project-sidebar-open-file={tab.id}
                              data-builder-project-sidebar-open-file-state={active ? "active" : "idle"}
                              data-builder-project-sidebar-open-file-dirty={tab.dirty ? "true" : "false"}
                            >
                              <button
                                type="button"
                                className="focus-ring grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-lg px-1.5 py-1 text-left transition hover:bg-surface-container-high"
                                data-builder-project-sidebar-open-file-open=""
                                aria-current={active ? "page" : undefined}
                                title={`${tab.label} · ${tab.relativePath}`}
                                onClick={() => openEditorTab(tab)}
                              >
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
                                  <TabIcon aria-hidden className="size-3.5" />
                                </span>
                                <span className="min-w-0">
                                  <span className="flex min-w-0 items-center gap-1">
                                    {tab.dirty ? <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-label="未保存" /> : null}
                                    <span className="truncate text-[0.68rem] font-medium">{tab.label}</span>
                                  </span>
                                  <span className="mt-0.5 block truncate font-mono text-[0.58rem] opacity-70">{tab.relativePath}</span>
                                </span>
                              </button>
                              <button
                                type="button"
                                className="focus-ring flex size-7 shrink-0 items-center justify-center rounded-lg transition hover:bg-surface-container-high"
                                data-builder-project-sidebar-open-file-reveal=""
                                aria-label={`定位 ${tab.label}`}
                                title="在项目树定位"
                                onClick={() => revealEditorTabInProject(tab)}
                              >
                                <FolderOpen aria-hidden className="size-3.5" />
                              </button>
                              {tab.kind === "ui" ? (
                                <button
                                  type="button"
                                  className="focus-ring flex size-7 shrink-0 items-center justify-center rounded-lg transition hover:bg-surface-container-high disabled:opacity-35"
                                  data-builder-project-sidebar-open-file-close=""
                                  aria-label={`关闭 ${tab.label}`}
                                  title={tab.closable ? "关闭标签" : "至少保留一个 UI 标签"}
                                  disabled={!tab.closable || !tab.fileId}
                                  onClick={() => {
                                    if (tab.fileId) {
                                      closeEditorFileTab(tab.fileId);
                                    }
                                  }}
                                >
                                  <X aria-hidden className="size-3.5" />
                                </button>
                              ) : (
                                <span className="size-7 shrink-0" aria-hidden />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {openEditorTabs.length > 5 ? (
                        <p className="mt-2 text-center text-[0.62rem] text-on-surface-variant">另有 {openEditorTabs.length - 5} 个固定工作区标签</p>
                      ) : null}
                    </section>
                    <div
                      className="max-h-80 space-y-1 overflow-auto pr-1"
                      data-builder-project-tree-keyboard-nav=""
                      role="tree"
                      tabIndex={0}
                      aria-label="侧栏项目文件树"
                      aria-activedescendant={selectedProjectExplorerNode ? `project-explorer-sidebar-node-${selectedProjectExplorerNode.id}` : undefined}
                      onKeyDown={handleProjectExplorerTreeKeyDown}
                    >
                      {visibleProjectExplorerRows.map((row: any) => {
                        if (row.kind === "group") {
                          return (
                            <div
                              key={`sidebar-group-${row.id}`}
                              className="sticky top-0 z-[1] flex items-center justify-between gap-2 rounded-xl border border-outline-variant/70 bg-surface-container-high/95 px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant backdrop-blur"
                              data-builder-project-tree-group={row.id}
                            >
                              <span className="truncate">{row.label}</span>
                              <span className="shrink-0 font-mono tracking-normal">{row.count}</span>
                            </div>
                          );
                        }
                        const node = row.node;
                        const NodeIcon = node.icon;
                        const actionable = node.action !== "none";
                        const selected = selectedProjectExplorerNode?.id === node.id;
                        const hasChildren = projectExplorerFolderNodeIds.includes(node.id);
                        const collapsed = collapsedProjectExplorerNodeSet.has(node.id);
                        const status = projectExplorerNodeStatus(node);
                        return (
                          <div
                            key={node.id}
                            id={`project-explorer-sidebar-node-${node.id}`}
                            role="treeitem"
                            aria-selected={selected || node.active}
                            aria-expanded={hasChildren ? !collapsed : undefined}
                            data-builder-project-tree-node={node.id}
                            data-builder-project-context-node={node.id}
                            data-builder-project-tree-node-dirty={node.dirty ? "true" : "false"}
                            className={cn(
                              "m3-state-layer grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-1 rounded-2xl py-1.5 pr-2 text-xs transition focus-within:ring-2 focus-within:ring-ring/40",
                              selected || node.active
                                ? "bg-secondary-container text-secondary-container-foreground"
                                : node.muted
                                  ? "text-on-surface-variant hover:bg-surface-container-high"
                                  : "hover:bg-surface-container-high",
                              !actionable && "cursor-default opacity-80",
                            )}
                            style={{ paddingLeft: node.depth * 14 + 8 }}
                            title={node.path || node.detail}
                            onContextMenu={(event: any) => openProjectExplorerContextMenu(event, node)}
                          >
                            <button
                              type="button"
                              aria-label={collapsed ? `展开 ${node.label}` : `收起 ${node.label}`}
                              className={cn(
                                "focus-ring flex size-5 shrink-0 items-center justify-center rounded-lg transition",
                                hasChildren ? "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface" : "cursor-default text-on-surface-variant/40",
                              )}
                              disabled={!hasChildren}
                              onClick={() => toggleProjectExplorerNode(node.id)}
                            >
                              <ChevronDown aria-hidden className={cn("size-3 transition-transform", collapsed && "-rotate-90")} />
                            </button>
                            <button
                              type="button"
                              className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl py-1 pr-1 text-left"
                              onClick={() => handleProjectExplorerNode(node)}
                            >
                              <span
                                className={cn(
                                  "flex size-7 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest",
                                  selected || node.active ? "text-secondary-container-foreground" : "text-primary",
                                )}
                              >
                                <NodeIcon aria-hidden className="size-3.5" />
                              </span>
                              <span className="min-w-0">
                                <span className="flex min-w-0 items-center gap-1.5 font-medium">
                                  {node.dirty ? <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-label="未保存" /> : null}
                                  <span className="truncate">{node.label}</span>
                                </span>
                                <span className="mt-0.5 block truncate text-[0.66rem] opacity-70">{node.detail}</span>
                              </span>
                              <span className="flex min-w-0 shrink-0 items-center gap-1">
                                <SignalChip
                                  label={status.label}
                                  signal={status.signal}
                                  toneClass={projectExplorerStatusClass(status.tone)}
                                />
                                {node.badge ? (
                                  <SignalChip
                                    label={node.badge}
                                    signal={node.badge === "dirty" || node.badge === "active"}
                                    toneClass={node.active ? "border-transparent bg-secondary-container text-secondary-container-foreground" : "border-outline-variant bg-transparent text-on-surface-variant"}
                                  />
                                ) : null}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                      {visibleProjectExplorerNodes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-outline-variant px-3 py-6 text-center text-xs text-on-surface-variant">
                          当前过滤没有可显示节点。
                        </div>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="secondary" data-builder-save-project-from-tree="" onClick={() => enqueueProjectTask("save-project")} loading={diskBusy || runningProjectTask?.actionId === "save-project"}>
                        <Save aria-hidden className="size-4" />
                        保存同步
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-builder-open-project-root-from-tree=""
                        disabled={!activeProject.rootPath || !isTauriRuntime()}
                        onClick={() => void openLocalArtifact(activeProject.rootPath ?? "")}
                      >
                        <FolderOpen aria-hidden className="size-4" />
                        打开目录
                      </Button>
                    </div>
                  </section>
                  <Field label="当前项目">
                    <Select value={activeProject.id} onValueChange={selectProject}>
                      <SelectTrigger data-builder-project-select="">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {workspace.projects.map((project: any) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="项目模板">
                    <div className="grid gap-2" data-builder-project-templates="">
                      {projectTemplates.map((template: any) => {
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
                        onChange={(event: any) => setCheckpointLabel(event.target.value)}
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
                          diskCheckpoints.slice(0, 5).map((checkpoint: any) => (
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
                            {checkpointDiffDetails(checkpointDiff).slice(0, 4).map((detail: any) => (
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
                      <Select value={activeProject.rootPath ?? managedProjects[0].root_path} onValueChange={(rootPath: any) => void openProjectRoot(rootPath)}>
                        <SelectTrigger data-builder-managed-project-select="">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {managedProjects.map((project: any) => (
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
                    <Input data-builder-project-name="" value={activeProject.name} onChange={(event: any) => renameActiveProject(event.target.value)} />
                  </Field>
                  <Field label="项目目录">
                    <Input
                      data-builder-project-root=""
                      value={activeProject.rootPath ?? ""}
                      placeholder="保存后生成，或粘贴已有项目目录"
                      onChange={(event: any) => updateProjectRootPath(event.target.value)}
                    />
                  </Field>
                  <section className="space-y-3 rounded-2xl border border-outline-variant bg-surface-container-high p-3" data-builder-project-release-settings="">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                          <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">项目设置 / 发布</h3>
                        <p className="mt-1 text-xs leading-5 text-on-surface-variant">Build 页只负责运行流水线；发布元数据在这里维护。</p>
                      </div>
                      <Badge variant="outline">设置</Badge>
                    </div>
                    <Field label="应用名称">
                      <Input
                        inputSize="sm"
                        data-builder-project-release-app-name=""
                        value={activeProject.releaseConfig.appName}
                        onChange={(event: any) => updateReleaseConfig({ appName: event.target.value })}
                      />
                    </Field>
                    <Field label="Bundle 标识符">
                      <Input
                        inputSize="sm"
                        data-builder-project-release-identifier=""
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
                          data-builder-project-release-version=""
                          value={activeProject.releaseConfig.version}
                          spellCheck={false}
                          className="font-mono text-xs"
                          onChange={(event: any) => updateReleaseConfig({ version: event.target.value })}
                        />
                      </Field>
                      <Field label="窗口标题">
                        <Input
                          inputSize="sm"
                          data-builder-project-release-window-title=""
                          value={activeProject.releaseConfig.windowTitle}
                          onChange={(event: any) => updateReleaseConfig({ windowTitle: event.target.value })}
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="窗体类型">
                        <Select
                          value={activeProject.releaseConfig.windowKind}
                          onValueChange={(windowKind: any) =>
                            updateReleaseConfig({
                              windowKind: windowKind as ReleaseWindowKind,
                              titlebarStyle:
                                windowKind === "frameless"
                                  ? "hidden"
                                  : activeProject.releaseConfig.windowKind === "frameless" && activeProject.releaseConfig.titlebarStyle === "hidden"
                                    ? "nova"
                                    : activeProject.releaseConfig.titlebarStyle,
                            })
                          }
                        >
                          <SelectTrigger inputSize="sm" data-builder-project-release-window-kind="">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {releaseWindowKinds.map((kind: any) => (
                              <SelectItem key={kind.value} value={kind.value}>
                                {kind.label} · {kind.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="标题栏">
                        <Select
                          value={activeProject.releaseConfig.titlebarStyle}
                          onValueChange={(titlebarStyle: any) => updateReleaseConfig({ titlebarStyle: titlebarStyle as ReleaseTitlebarStyle })}
                          disabled={activeProject.releaseConfig.windowKind === "frameless"}
                        >
                          <SelectTrigger inputSize="sm" data-builder-project-release-titlebar-style="">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {releaseTitlebarStyles.map((style: any) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label} · {style.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <Field label="标题栏副标题">
                      <Input
                        inputSize="sm"
                        data-builder-project-release-titlebar-subtitle=""
                        value={activeProject.releaseConfig.titlebarSubtitle}
                        placeholder="例如：设置、工具窗口、后台任务"
                        onChange={(event: any) => updateReleaseConfig({ titlebarSubtitle: event.target.value })}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="安装包目标">
                        <Select
                          value={activeProject.releaseConfig.bundleTargets}
                          onValueChange={(bundleTargets: any) => updateReleaseConfig({ bundleTargets: bundleTargets as ReleaseBundleTarget })}
                        >
                          <SelectTrigger inputSize="sm" data-builder-project-release-targets="">
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
                      <div className="flex items-end">
                        <label className="flex h-[var(--control-sm)] w-full items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 text-xs">
                          允许缩放
                          <Switch checked={activeProject.releaseConfig.resizable} onCheckedChange={(resizable: any) => updateReleaseConfig({ resizable })} />
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
                <PanelTitle icon={FileJson} title="导航器" description="管理 UI 文件、对象层级和当前选择。" />
                <div className="flex flex-col gap-3">
                  <section className="order-2 space-y-3 rounded-[22px] bg-surface-container-low p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-on-surface">UI 文件</p>
                        <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">项目内 {activeProject.files.length} 个文件</p>
                      </div>
                      <Badge variant="outline">{activeFile.items.length} 控件</Badge>
                    </div>
                    <Field label="当前文件">
                      <Input data-builder-file-name="" inputSize="sm" value={activeFile.name} onChange={(event: any) => renameActiveFile(event.target.value)} />
                    </Field>
                    <div className="max-h-32 space-y-1 overflow-auto pr-1">
                      {activeProject.files.map((file: any) => (
                        <button
                          key={file.id}
                          type="button"
                          data-builder-file={file.name}
                          className={cn(
                            "focus-ring m3-state-layer flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-left text-xs transition-colors",
                            file.id === activeFile.id ? "bg-secondary-container text-secondary-container-foreground" : "hover:bg-surface-container-high",
                          )}
                          onClick={() => selectFile(file.id, { feedback: true, leftDockTab: "navigator" })}
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{file.name}</span>
                            <span className="block truncate opacity-70">{file.items.length} 控件</span>
                          </span>
                          <FileJson aria-hidden className="size-3.5 shrink-0" />
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button size="icon-sm" variant="secondary" data-builder-new-file="" aria-label="新建 UI 文件" title="新建 UI 文件" onClick={createNewFileFromNavigator}>
                        <Plus aria-hidden />
                      </Button>
                      <Button size="icon-sm" variant="secondary" data-builder-duplicate-file="" aria-label="复制当前 UI 文件" title="复制当前 UI 文件" onClick={duplicateActiveFileFromNavigator}>
                        <Copy aria-hidden />
                      </Button>
                      <Button size="icon-sm" variant="ghost" data-builder-delete-file="" aria-label="删除当前 UI 文件" title="删除当前 UI 文件" onClick={requestDeleteActiveFile}>
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  </section>

                  <section className="order-1 space-y-3 rounded-[22px] bg-surface-container-low p-3" data-builder-navigator-layers="">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-2">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-2xl bg-surface-container-highest text-primary">
                          <Layers aria-hidden className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-medium">图层树</h3>
                          <p className="mt-1 truncate text-xs text-on-surface-variant">
                            {treeRows.length} 个图层中显示 {visibleNavigatorTreeRows.length} 个
                          </p>
                        </div>
                      </div>
                      <Badge variant={selectedIds.length > 0 ? "secondary" : "outline"}>{selectedIds.length} 个已选</Badge>
                    </div>

                    <div className="relative">
                      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                      <Input
                        inputSize="sm"
                        data-builder-navigator-search=""
                        aria-label="搜索对象层级"
                        placeholder="搜索图层..."
                        value={navigatorQuery}
                        className="h-9 rounded-2xl pl-9 text-xs"
                        onChange={(event: any) => {
                          setNavigatorQuery(event.target.value);
                          setNavigatorLayerMessage("");
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-6 gap-1.5">
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        data-builder-navigator-select-all=""
                        aria-label="选择全部控件"
                        title="选择全部控件"
                        onClick={selectAllItems}
                        disabled={items.length === 0}
                      >
                        <CheckCircle2 aria-hidden />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        data-builder-navigator-clear-selection=""
                        aria-label="清空选择"
                        title="清空选择"
                        onClick={() => clearSelection({ feedback: true })}
                        disabled={selectedIds.length === 0}
                      >
                        <MousePointer2 aria-hidden />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        data-builder-navigator-duplicate-selection=""
                        aria-label="复制选中控件"
                        title="复制选中控件"
                        onClick={duplicateSelected}
                        disabled={selectedIds.length === 0}
                      >
                        <Copy aria-hidden />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        data-builder-navigator-toggle-lock=""
                        aria-label="切换选中控件锁定状态"
                        title="切换选中控件锁定状态"
                        onClick={toggleSelectedLock}
                        disabled={selectedIds.length === 0}
                      >
                        {selectedItems.some((item: any) => item.locked) ? <LockOpen aria-hidden /> : <Lock aria-hidden />}
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        data-builder-navigator-toggle-visibility=""
                        aria-label="切换选中控件运行态可见性"
                        title="切换选中控件运行态可见性"
                        onClick={toggleSelectedRuntimeVisibility}
                        disabled={selectedIds.length === 0}
                      >
                        {selectedItems.some((item: any) => item.props.visible === false) ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        data-builder-navigator-delete-selection=""
                        aria-label="删除选中控件"
                        title="删除选中控件"
                        onClick={requestDeleteSelected}
                        disabled={selectedIds.length === 0}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>

                    {navigatorLayerMessage ? (
                      <div
                        className="flex min-w-0 items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-high px-3 py-2 text-xs text-on-surface-variant"
                        data-builder-navigator-layer-message=""
                        role="status"
                      >
                        <Layers aria-hidden className="size-3.5 shrink-0 text-primary" />
                        <span className="truncate">{navigatorLayerMessage}</span>
                      </div>
                    ) : null}

                    {treeRows.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-outline-variant p-4 text-center text-xs text-on-surface-variant">
                        当前文件还没有控件。去 Components 面板添加一个控件开始编辑。
                      </div>
                    ) : visibleNavigatorTreeRows.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-outline-variant p-4 text-center">
                        <Search aria-hidden className="mx-auto size-5 text-on-surface-variant" />
                        <p className="mt-2 text-xs font-medium">没有匹配的图层</p>
                        <Button size="sm" variant="ghost" className="mt-3 h-8" data-builder-navigator-reset-search="" onClick={() => setNavigatorQuery("")}>
                          重置搜索
                        </Button>
                      </div>
                    ) : (
                      <div className="max-h-72 space-y-1 overflow-auto pr-1">
                        {visibleNavigatorTreeRows.map(({ item, depth }: any) => {
                          const Icon = getDefinition(item.type).icon;
                          const selected = selectedIds.includes(item.id);
                          const canMoveUp = canMoveLayerWithinGroup(items, item, 1);
                          const canMoveDown = canMoveLayerWithinGroup(items, item, -1);
                          const runtimeState = builderItemRuntimeState(item);
                          return (
                            <div
                              key={item.id}
                              data-builder-navigator-row={item.id}
                              data-builder-navigator-row-visible={runtimeState.visible ? "true" : "false"}
                              data-builder-navigator-row-locked={item.locked ? "true" : "false"}
                              className={cn(
                                "grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] items-center gap-1 rounded-2xl p-1 transition-colors",
                                selected ? "bg-secondary-container text-secondary-container-foreground" : "hover:bg-surface-container-high",
                                !runtimeState.visible && "opacity-70",
                              )}
                              style={{ paddingLeft: depth * 12 + 4 }}
                            >
                              <button
                                type="button"
                                className="focus-ring grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-xl px-2 py-2 text-left"
                                onClick={(event: any) => selectItem(item.id, event)}
                              >
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest text-primary">
                                  <Icon aria-hidden className="size-3.5" />
                                </span>
                                <span className="min-w-0">
                                  <span className="flex min-w-0 items-center gap-1.5">
                                    <span className="truncate text-xs font-medium">{getItemSummary(item)}</span>
                                    {!runtimeState.visible ? <EyeOff aria-hidden className="size-3 shrink-0 opacity-70" /> : null}
                                    {item.locked ? <Lock aria-hidden className="size-3 shrink-0 opacity-70" /> : null}
                                    {!runtimeState.enabled ? <span className="shrink-0 rounded-full border border-outline-variant px-1 text-[0.55rem] opacity-75">禁用</span> : null}
                                    {runtimeState.readOnly ? <span className="shrink-0 rounded-full border border-outline-variant px-1 text-[0.55rem] opacity-75">只读</span> : null}
                                  </span>
                                  <span className="mt-0.5 block truncate text-[0.66rem] opacity-70">
                                    {item.type} · {item.parentId ? "子级" : "根级"} · z {item.z}
                                  </span>
                                </span>
                              </button>
                              <button
                                type="button"
                                className="focus-ring rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                                data-builder-navigator-row-visibility-toggle={item.id}
                                aria-label={runtimeState.visible ? "运行态隐藏控件" : "运行态显示控件"}
                                title={runtimeState.visible ? "运行态隐藏控件" : "运行态显示控件"}
                                onClick={(event: any) => {
                                  event.stopPropagation();
                                  toggleItemRuntimeVisibility(item.id);
                                }}
                              >
                                {runtimeState.visible ? <Eye aria-hidden className="size-3.5" /> : <EyeOff aria-hidden className="size-3.5" />}
                              </button>
                              <button
                                type="button"
                                className="focus-ring rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                                data-builder-navigator-row-lock-toggle={item.id}
                                aria-label={item.locked ? "解锁控件" : "锁定控件"}
                                title={item.locked ? "解锁控件" : "锁定控件"}
                                onClick={(event: any) => {
                                  event.stopPropagation();
                                  toggleItemLockFromNavigator(item.id);
                                }}
                              >
                                {item.locked ? <Lock aria-hidden className="size-3.5" /> : <LockOpen aria-hidden className="size-3.5" />}
                              </button>
                              <button
                                type="button"
                                className={cn(
                                  "focus-ring rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant",
                                )}
                                aria-label="图层上移"
                                title={layerMoveTitle(item, 1)}
                                disabled={!canMoveUp}
                                onClick={() => moveLayer(item.id, 1)}
                              >
                                <MoveUp aria-hidden className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                className="focus-ring rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                                aria-label="图层下移"
                                title={layerMoveTitle(item, -1)}
                                disabled={!canMoveDown}
                                onClick={() => moveLayer(item.id, -1)}
                              >
                                <MoveDown aria-hidden className="size-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
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
                      {activeProject.assets.map((asset: any) => (
                        <div key={asset.id} className="rounded-2xl border border-outline-variant bg-surface-container-high p-2">
                          <div
                            className="flex cursor-grab items-center gap-2"
                            draggable
                            data-builder-asset-drag={asset.name}
                            title="拖到画布即可创建图片控件"
                            onDragStart={(event: any) => handleAssetDragStart(event, asset)}
                          >
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
                <div
                  className="mb-1 flex h-7 items-center justify-between gap-2 border-b border-outline-variant/70 px-1.5 pb-1"
                  data-builder-component-palette-header="toolbar"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-primary">
                      <Layers aria-hidden className="size-3.5" />
                    </span>
                    <div className="flex min-w-0 items-baseline gap-1.5">
                      <h2 className="truncate text-xs font-semibold text-on-surface">控件</h2>
                      <p className="truncate text-[0.62rem] text-on-surface-variant">拖放/单击</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.6rem] text-on-surface-variant">
                    {visibleComponentPalette.length}
                  </span>
                </div>
                <div
                  className="flex flex-col gap-1.5"
                  data-builder-component-palette-layout="qt-compact-list"
                  data-builder-component-palette-priority="component-list-first"
                >
                  <div className="relative">
                    <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-on-surface-variant" />
                    <Input
                      inputSize="sm"
                      data-builder-component-search=""
                      aria-label="搜索控件工具箱"
                      placeholder="搜索控件..."
                      value={componentPaletteQuery}
                      className="h-7 rounded-lg pl-8 text-xs"
                      onChange={(event: any) => {
                        setComponentPaletteQuery(event.target.value);
                        setActiveComponentPaletteKitId("");
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-5 gap-1" aria-label="控件分类" data-builder-component-category-strip="compact-grid">
                    {componentPaletteCategoryOptions.map((category: any) => {
                      const active = category.id === componentPaletteCategory;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          data-builder-component-category={category.id}
                          aria-pressed={active}
                          aria-label={`${category.label}，${componentPaletteCounts[category.id]} 个控件`}
                          title={`${category.description} · ${componentPaletteCounts[category.id]} 个控件`}
                          onClick={() => {
                            setComponentPaletteCategory(category.id);
                            setActiveComponentPaletteKitId("");
                          }}
                          className={cn(
                            "focus-ring flex h-6 min-w-0 items-center justify-center rounded-md border px-1 text-[0.64rem] font-medium transition",
                            active
                              ? "border-outline bg-surface-container-highest text-on-surface"
                              : "border-transparent bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                          )}
                        >
                          <span className="min-w-0 truncate">{category.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div
                    className="space-y-1 relative isolate overflow-hidden"
                    data-builder-component-list-priority="first"
                    data-builder-component-list-mode="category-disclosure"
                    data-builder-component-list-open-groups={visibleComponentPaletteDefaultOpenGroupCount}
                  >
                    {visibleComponentPaletteGroups.length > 0 ? (
                      visibleComponentPaletteGroups.map((group: any) => (
                        <details
                          key={group.id}
                          className="group/palette rounded-lg border border-outline-variant/80 bg-surface-container-low p-1"
                          open={group.defaultOpen}
                          data-builder-component-group={group.id}
                          data-builder-component-group-layout="category-disclosure"
                          data-builder-component-group-default-open={group.defaultOpen ? "true" : "false"}
                        >
                          <summary
                            className="focus-ring flex h-7 cursor-pointer list-none items-center gap-2 rounded-md px-1.5 text-xs transition hover:bg-surface-container-high [&::-webkit-details-marker]:hidden"
                            data-builder-component-group-summary={group.id}
                          >
                            <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition group-open/palette:rotate-90" />
                            <span className="min-w-0 flex-1 truncate font-semibold text-on-surface">{group.label}</span>
                            <span className="shrink-0 rounded-md bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.6rem] text-on-surface-variant">
                              {group.definitions.length}
                            </span>
                          </summary>
                          <div className="subtle-scrollbar mt-1 max-h-[260px] space-y-0.5 overflow-y-auto border-t border-outline-variant/70 pt-1" data-builder-component-group-details={group.id}>
                            {group.definitions.map((definition: any) => {
                              const Icon = definition.icon;
                              const category = componentPaletteCategoryForType(definition.type);
                              const favorite = componentPaletteFavoriteTypes.includes(definition.type);
                              return (
                                <div
                                  key={definition.type}
                                  data-builder-palette-type={definition.type}
                                  data-builder-palette-category={category}
                                  data-builder-palette-row-layout="compact"
                                  data-builder-palette-row-density="single-line"
                                  className="group isolate grid h-8 w-full grid-cols-[minmax(0,1fr)_1.75rem] overflow-hidden rounded-md border border-transparent bg-transparent transition-colors hover:bg-surface-container-high focus-within:bg-surface-container-high"
                                >
                                  <button
                                    type="button"
                                    draggable={false}
                                    onMouseDown={(event: any) => handlePaletteMouseDown(event, definition)}
                                    onClick={() => {
                                      if (suppressPaletteClickRef.current) {
                                        return;
                                      }
                                      addComponent(definition.type);
                                    }}
                                    className="focus-ring m3-state-layer grid h-full min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 px-2 text-left"
                                    title={`${definition.description} · ${componentPaletteCategoryLabel(category)}`}
                                    aria-label={`添加 ${definition.title}，${componentPaletteCategoryLabel(category)}`}
                                  >
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-primary">
                                      <Icon aria-hidden className="size-3.5" />
                                    </span>
                                    <span className="min-w-0">
                                      <span className="truncate text-xs font-semibold leading-4">{definition.title}</span>
                                      <span className="sr-only" data-builder-palette-category-label="metadata">
                                        {componentPaletteCategoryLabel(category)}
                                      </span>
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    data-builder-component-favorite-toggle={definition.type}
                                    data-builder-component-favorite-visibility={favorite ? "pinned" : "hover-reveal"}
                                    aria-pressed={favorite}
                                    aria-label={`${favorite ? "取消收藏" : "收藏"} ${definition.title}`}
                                    title={favorite ? "取消收藏" : "收藏到常用控件"}
                                    onClick={() => toggleComponentPaletteFavorite(definition.type)}
                                    className={cn(
                                      "focus-ring flex shrink-0 items-center justify-center self-stretch text-on-surface-variant/55 opacity-0 transition hover:bg-surface-container-highest hover:text-primary hover:opacity-100 focus-visible:text-primary focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100",
                                      favorite && "text-primary opacity-100",
                                    )}
                                  >
                                    <Star aria-hidden className={cn("size-3.5", favorite && "fill-current")} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      ))
                    ) : (
                      <div className="rounded-[18px] border border-dashed border-outline-variant bg-surface-container-low p-4 text-center">
                        <Search aria-hidden className="mx-auto size-5 text-on-surface-variant" />
                        <p className="mt-2 text-xs font-medium">没有匹配的控件</p>
                        <p className="mt-1 text-[0.68rem] leading-4 text-on-surface-variant">清空搜索或切换分类后继续添加控件。</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-3 h-8"
                          data-builder-component-search-reset=""
                          onClick={() => {
                            setComponentPaletteQuery("");
                            setComponentPaletteCategory("all");
                            setActiveComponentPaletteKitId("");
                          }}
                        >
                          Reset filters
                        </Button>
                      </div>
                    )}
                  </div>

                  {showComponentPaletteQuickInsert ? (
                    
  <section
                      className="rounded-lg border border-outline-variant/80 bg-surface-container-low p-0.5 relative isolate overflow-hidden"
                      data-builder-component-quick-insert-priority="secondary-tools"
                      data-builder-component-quick-insert-density="tool-strip"
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className="shrink-0 rounded-md bg-surface-container-high px-1.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant"
                          data-builder-component-quick-insert-label="compact"
                        >
                          常用控件
                        </span>
                      <div
                        className="flex min-w-0 flex-1 justify-end gap-0.5"
                        role="toolbar"
                        aria-label="常用控件快速插入"
                        data-builder-component-quick-insert-strip="single-row"
                      >
                        {componentPaletteQuickInsertDefinitions.map((definition: any) => {
                          const Icon = definition.icon;
                          return (
                            <button
                              key={definition.type}
                              type="button"
                              data-builder-component-quick-insert={definition.type}
                              data-builder-component-quick-insert-item-density="compact"
                              onClick={() => addComponent(definition.type)}
                              aria-label={`添加常用控件 ${definition.title}`}
                              title={`添加 ${definition.title}`}
                              className="focus-ring m3-state-layer flex size-7 shrink-0 items-center justify-center rounded-md bg-transparent text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                            >
                              <Icon aria-hidden className="size-3.5 shrink-0 text-primary" />
                              <span className="sr-only">{definition.title}</span>
                            </button>
                          );
                        })}
                      </div>
                      <span className="sr-only">{componentPaletteQuickInsertDefinitions.length} 个常用控件</span>
                      </div>
                    </section>
                  ) : null}

                  {showComponentPaletteKits ? (
                    <section
                      className="space-y-1 rounded-lg border border-outline-variant bg-surface-container-low p-1 relative isolate overflow-hidden"
                      data-builder-component-kits=""
                      data-builder-component-kits-layout="compact-list"
                      data-builder-component-kits-density="single-line"
                      data-builder-component-active-kit={activeComponentPaletteKit?.id ?? "none"}
                    >
                      <div className="flex h-5 items-center justify-between gap-2 px-1">
                        <span className="truncate text-[0.66rem] font-semibold uppercase text-on-surface-variant">套件</span>
                        {activeComponentPaletteKit ? (
                          <button
                            type="button"
                            data-builder-component-kit-clear=""
                            onClick={clearComponentPaletteKit}
                            className="focus-ring rounded-md px-1 py-0.5 text-[0.64rem] font-medium text-primary transition hover:bg-primary/10"
                          >
                            显示全部
                          </button>
                        ) : (
                          <span className="shrink-0 text-[0.66rem] text-on-surface-variant">{componentPaletteKitRows.length}</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {componentPaletteKitRows.map((row: any) => {
                          const active = activeComponentPaletteKit?.id === row.id;
                          const primaryDefinition = getDefinition(row.primaryType);
                          const PrimaryIcon = primaryDefinition.icon;
                          return (
                            <div
                              key={row.id}
                              data-builder-component-kit={row.id}
                              data-builder-component-kit-density="single-line"
                              data-builder-component-kit-active={active ? "true" : "false"}
                              data-builder-component-kit-available-count={row.availableCount}
                              className={cn(
                                "grid min-w-0 grid-cols-[minmax(0,1fr)_1.75rem_1.75rem] overflow-hidden rounded-md border transition-colors",
                                active ? "border-outline bg-surface-container-highest" : "border-transparent bg-transparent hover:bg-surface-container-high",
                              )}
                            >
                              <button
                                type="button"
                                data-builder-component-kit-focus={row.id}
                                aria-pressed={active}
                                aria-label={`聚焦 ${row.title}，${row.availableCount}/${row.totalCount} 可用`}
                                onClick={() => focusComponentPaletteKit(row.id)}
                                className="focus-ring flex h-8 min-w-0 items-center gap-2 px-2 text-left"
                                title={row.description}
                              >
                                <PrimaryIcon aria-hidden className="size-3.5 shrink-0 text-primary" />
                                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-on-surface">
                                  {row.title}
                                </span>
                                <span className="shrink-0 font-mono text-[0.62rem] text-on-surface-variant">
                                  {row.availableCount}/{row.totalCount}
                                </span>
                                <span className="sr-only" aria-hidden="true">
                                  {row.sampleTypes.map((type: any) => {
                                    const definition = getDefinition(type);
                                    return (
                                      <span
                                        key={`${row.id}-${type}`}
                                        data-builder-component-kit-type={type}
                                      >
                                        {definition.title}
                                      </span>
                                    );
                                  })}
                                </span>
                              </button>
                              <button
                                type="button"
                                data-builder-component-kit-scaffold={row.id}
                                data-builder-component-kit-scaffold-count={row.availableCount}
                                aria-label={`插入 ${row.title} 骨架`}
                                title={`插入 ${row.title} 骨架`}
                                onClick={() => insertComponentPaletteKitScaffold(row.id)}
                                className="focus-ring flex h-8 shrink-0 items-center justify-center border-l border-outline-variant text-primary transition hover:bg-surface-container-highest"
                              >
                                <Layers aria-hidden className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                data-builder-component-kit-insert={row.primaryType}
                                aria-label={`插入 ${row.title} 的 ${primaryDefinition.title}`}
                                title={`插入 ${primaryDefinition.title}`}
                                onClick={() => insertComponentPaletteKitPrimary(row.id)}
                                className="focus-ring flex h-8 shrink-0 items-center justify-center border-l border-outline-variant text-primary transition hover:bg-surface-container-highest"
                              >
                                <PrimaryIcon aria-hidden className="size-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}

                  <section
                    className="order-6 rounded-lg border border-outline-variant bg-surface-container-low p-1"
                    data-builder-component-coverage-panel=""
                    data-builder-component-coverage-mode="summary-strip"
                  >
                    <details className="group" data-builder-component-coverage-details="collapsed">
                      <summary className="focus-ring flex h-8 cursor-pointer list-none items-center gap-2 rounded-md px-2 text-xs text-on-surface transition hover:bg-surface-container [&::-webkit-details-marker]:hidden">
                        <span className="min-w-0 flex-1 truncate font-semibold">控件覆盖度</span>
                        <span className="hidden min-w-0 truncate text-[0.66rem] text-on-surface-variant 2xl:inline" data-builder-component-coverage-filter="">
                          {componentCoverageFilterLabel} · {visibleComponentPalette.length}
                        </span>
                        <span className="h-1 w-12 shrink-0 overflow-hidden rounded-full bg-surface-container-highest">
                          <span
                            className="block h-full rounded-full bg-primary"
                            style={{ width: `${Math.round((componentCoverageCompleteCount / Math.max(componentCoverageRows.length, 1)) * 100)}%` }}
                          />
                        </span>
                        <span className="shrink-0 font-mono text-[0.66rem] text-on-surface-variant" data-builder-component-coverage-count="">
                          {componentCoverageCompleteCount}/{componentCoverageRows.length}
                        </span>
                        <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition group-open:rotate-90" />
                      </summary>
                      <div className="mt-1 space-y-0.5 border-t border-outline-variant/70 pt-1" data-builder-component-coverage-detail-list="">
                        {visibleComponentCoverageRows.length > 0 ? (
                          visibleComponentCoverageRows.map((row: any) => {
                            const complete = row.availableCount === row.totalCount;
                            const focusType = row.visibleTypes[0] ?? row.types[0];
                            return (
                              <button
                                key={row.id}
                                type="button"
                                data-builder-component-coverage-group={row.id}
                                aria-label={`查看 ${row.title} 控件覆盖度`}
                                title={row.description}
                                onClick={() => {
                                  if (focusType) {
                                    setComponentPaletteCategory(componentPaletteCategoryForType(focusType));
                                    setComponentPaletteQuery("");
                                    setActiveComponentPaletteKitId("");
                                  }
                                }}
                                className="focus-ring grid h-7 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-md px-2 text-left text-xs transition hover:bg-surface-container-high"
                              >
                                <span className="truncate font-medium text-on-surface">{row.title}</span>
                                <span className="shrink-0 font-mono text-[0.62rem] text-on-surface-variant">
                                  {row.availableCount}/{row.totalCount}
                                </span>
                                <span
                                  className={cn(
                                    "shrink-0 rounded-md px-1.5 py-0.5 text-[0.58rem] font-semibold",
                                    complete ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                                  )}
                                  data-builder-component-coverage-missing={row.id}
                                >
                                  {complete ? "完整" : `${row.missingTypes.length} 缺口`}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <div className="rounded-md border border-dashed border-outline-variant bg-surface-container px-2 py-2 text-center text-[0.68rem] text-on-surface-variant">
                            当前搜索没有匹配的覆盖组
                          </div>
                        )}
                      </div>
                    </details>
                  </section>

                  {showComponentPaletteCollections ? (
                    <section
                      className="order-7 rounded-lg border border-outline-variant bg-surface-container-low p-1"
                      data-builder-component-collections=""
                      data-builder-component-collections-mode="summary-strip"
                    >
                      <details className="group" data-builder-component-collections-details="collapsed">
                        <summary className="focus-ring flex h-8 cursor-pointer list-none items-center gap-2 rounded-md px-2 text-xs text-on-surface transition hover:bg-surface-container [&::-webkit-details-marker]:hidden">
                          <span className="min-w-0 flex-1 truncate font-semibold">快速访问</span>
                          <span className="shrink-0 text-[0.66rem] text-on-surface-variant">{componentPaletteFavoriteTypes.length} 常用</span>
                          <span className="shrink-0 text-[0.66rem] text-on-surface-variant">{componentPaletteRecentTypes.length} 最近</span>
                          <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition group-open:rotate-90" />
                        </summary>
                        <div className="mt-1 space-y-1 border-t border-outline-variant/70 pt-1" data-builder-component-collections-detail-list="">
                          <div className="grid grid-cols-2 gap-1" data-builder-component-favorites="">
                            {componentPaletteFavoriteDefinitions.map((definition: any) => {
                              const Icon = definition.icon;
                              return (
                                <div key={`favorite-${definition.type}`} className="grid min-w-0 grid-cols-[minmax(0,1fr)_1.75rem] overflow-hidden rounded-md bg-surface-container">
                                  <button
                                    type="button"
                                    data-builder-component-favorite={definition.type}
                                    onClick={() => addComponent(definition.type)}
                                    className="focus-ring flex h-7 min-w-0 items-center gap-1.5 px-2 text-left text-xs font-medium transition-colors hover:bg-surface-container-high"
                                  >
                                    <Icon aria-hidden className="size-3.5 shrink-0 text-primary" />
                                    <span className="truncate">{definition.title}</span>
                                  </button>
                                  <button
                                    type="button"
                                    data-builder-component-favorite-toggle={definition.type}
                                    aria-label={`取消收藏 ${definition.title}`}
                                    title="取消收藏"
                                    onClick={() => toggleComponentPaletteFavorite(definition.type)}
                                    className="focus-ring flex h-7 shrink-0 items-center justify-center text-primary transition hover:bg-surface-container-highest"
                                  >
                                    <Star aria-hidden className="size-3.5 fill-current" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          <div className="border-t border-outline-variant/70 pt-1" data-builder-component-recents="">
                            <div className="flex flex-wrap gap-1">
                              {componentPaletteRecentDefinitions.map((definition: any) => {
                                const Icon = definition.icon;
                                return (
                                  <button
                                    key={`recent-${definition.type}`}
                                    type="button"
                                    data-builder-component-recent={definition.type}
                                    onClick={() => addComponent(definition.type)}
                                    className="focus-ring inline-flex max-w-full items-center gap-1.5 rounded-md border border-outline-variant bg-surface-container px-2 py-1 text-[0.66rem] font-medium transition hover:border-outline hover:bg-surface-container-high"
                                  >
                                    <Icon aria-hidden className="size-3 shrink-0 text-primary" />
                                    <span className="truncate">{definition.title}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </details>
                    </section>
                  ) : null}

                  
                </div>
                  </>
                ) : null}
              </ProjectDock>

              <main
                className="relative flex min-h-0 min-w-0 flex-col overflow-hidden bg-surface-container-low"
                data-builder-readable-canvas=""
                data-builder-canvas-priority="true"
              >
                <div
                  className="flex flex-col gap-1 border-b border-outline-variant bg-surface-container-lowest px-2.5 py-1"
                  data-builder-canvas-controls={canvasControlsExpanded ? "expanded" : "collapsed"}
                  data-builder-canvas-controls-density={canvasControlsExpanded ? "expanded" : "compact"}
                >
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5 overflow-hidden text-xs">
                      <Badge variant="secondary">{activeBreakpoint}</Badge>
                      <span className="truncate font-medium text-on-surface">{page.title || activeFile.name}</span>
                      <div
                        className={cn(
                          "hidden min-w-0 items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-high px-1 py-0.5 text-on-surface-variant",
                          canvasControlsExpanded ? "lg:flex" : "2xl:flex",
                        )}
                        data-builder-canvas-window-shell=""
                        data-builder-canvas-window-shell-synced={releaseWindowShellMatchesPage ? "true" : "false"}
                        title={`当前窗体：${pageWindowKindMeta?.label ?? page.windowKind} / ${pageTitlebarStyleMeta?.label ?? page.titlebarStyle}`}
                      >
                        <Monitor aria-hidden className="ml-1 size-3.5 shrink-0 text-primary" />
                        <Select value={page.windowKind} onValueChange={(windowKind: any) => updatePageWindowKind(windowKind as ReleaseWindowKind)}>
                          <SelectTrigger
                            data-builder-canvas-window-kind=""
                            inputSize="sm"
                            className="h-6 w-[6.5rem] border-0 bg-transparent px-1 text-[0.66rem] shadow-none hover:bg-surface-container-highest focus:ring-0"
                            aria-label="当前 UI 窗体类型"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {releaseWindowKinds.map((kind: any) => (
                              <SelectItem key={kind.value} value={kind.value}>
                                {kind.label} · {kind.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="h-4 w-px bg-outline-variant" aria-hidden />
                        <Select
                          value={page.titlebarStyle}
                          onValueChange={(titlebarStyle: any) => updatePageTitlebarStyle(titlebarStyle as ReleaseTitlebarStyle)}
                          disabled={page.windowKind === "frameless"}
                        >
                          <SelectTrigger
                            data-builder-canvas-titlebar-style=""
                            inputSize="sm"
                            className="h-6 w-[6.5rem] border-0 bg-transparent px-1 text-[0.66rem] shadow-none hover:bg-surface-container-highest focus:ring-0 disabled:opacity-60"
                            aria-label="当前 UI 标题栏样式"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {releaseTitlebarStyles.map((style: any) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label} · {style.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!releaseWindowShellMatchesPage ? (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="size-6 rounded-full"
                            data-builder-canvas-sync-window-to-release=""
                            aria-label="同步当前 UI 窗口设置到发布配置"
                            title="同步到发布窗口"
                            onClick={syncReleaseWindowFromActivePage}
                          >
                            <Save aria-hidden className="size-3.5" />
                          </Button>
                        ) : null}
                      </div>
                      <span
                        className="hidden shrink-0 rounded-md border border-outline-variant bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.66rem] text-on-surface-variant md:inline-flex"
                        data-builder-canvas-toolbar-metrics="compact"
                      >
                        {Math.round(page.width)}x{Math.round(page.height)} · {Math.round(page.zoom * 100)}% · {items.length}/{selectedIds.length}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center justify-end gap-0.5" data-builder-workbench-layout-controls="">
                      <Button
                        size="icon-sm"
                        variant={leftDockCollapsed ? "ghost" : "secondary"}
                        data-builder-toggle-left-dock=""
                        aria-label={leftDockCollapsed ? "展开项目面板" : "收起项目面板"}
                        title={leftDockCollapsed ? "展开项目面板" : "收起项目面板"}
                        aria-pressed={!leftDockCollapsed}
                        onClick={() => setLeftDockCollapsed((collapsed: any) => !collapsed)}
                      >
                        <Columns3 aria-hidden className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant={rightDockCollapsed ? "ghost" : "secondary"}
                        data-builder-toggle-right-dock=""
                        aria-label={rightDockCollapsed ? "展开属性面板" : "收起属性面板"}
                        title={rightDockCollapsed ? "展开属性面板" : "收起属性面板"}
                        aria-pressed={!rightDockCollapsed}
                        onClick={() => setRightDockCollapsed((collapsed: any) => !collapsed)}
                      >
                        <Settings2 aria-hidden className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant={bottomDockMinimized ? "ghost" : "secondary"}
                        data-builder-toggle-output-dock-compact=""
                        aria-label={bottomDockMinimized ? "显示输出面板" : "隐藏输出面板"}
                        title={bottomDockMinimized ? "显示输出面板" : "隐藏输出面板"}
                        aria-pressed={!bottomDockMinimized}
                        onClick={toggleOutputDockVisibility}
                      >
                        <Terminal aria-hidden className="size-4" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" data-builder-fit-canvas-compact="" aria-label="适配画布 Ctrl+1" onClick={fitCanvasToViewport}>
                        <Maximize2 aria-hidden />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant={canvasPanMode ? "secondary" : "ghost"}
                        data-builder-pan-canvas-compact=""
                        aria-label="移动画布 Space"
                        onClick={toggleCanvasPanMode}
                      >
                        <Hand aria-hidden />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 rounded-lg px-1.5"
                        data-builder-toggle-canvas-controls=""
                        aria-label={canvasControlsExpanded ? "收起画布设置" : "展开画布设置"}
                        title={canvasControlsExpanded ? "收起画布设置" : "展开画布设置"}
                        aria-expanded={canvasControlsExpanded}
                        onClick={() => setCanvasControlsExpanded((expanded: any) => !expanded)}
                      >
                        <Settings2 aria-hidden className="size-3.5" />
                        <ChevronDown aria-hidden className={cn("size-3.5 transition-transform", canvasControlsExpanded && "rotate-180")} />
                      </Button>
                    </div>
                  </div>
                  {canvasControlsExpanded ? (
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={page.preset} onValueChange={(value: any) => applyCanvasPreset(value as CanvasPresetId)}>
                      <SelectTrigger data-builder-canvas-preset="" className="w-[170px]" inputSize="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {canvasPresets.map((preset: any) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            {preset.title} · {preset.description}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">自定义</SelectItem>
                      </SelectContent>
                    </Select>
                    <SegmentedControl
                      aria-label="响应式断点"
                      value={activeBreakpoint}
                      onValueChange={(value: any) => setResponsiveBreakpoint(value as ResponsiveBreakpointId)}
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
                      onChange={(value: any) => updatePage({ preset: "custom", width: numberFromInput(value, page.width, 320, 2400) })}
                    />
                    <NumberBox
                      label="H"
                      value={page.height}
                      dataAttr="data-builder-canvas-height"
                      disabled={activeBreakpoint !== "desktop"}
                      onChange={(value: any) => updatePage({ preset: "custom", height: numberFromInput(value, page.height, 240, 1800) })}
                    />
                    <Select value={String(page.zoom)} onValueChange={(value: any) => chooseCanvasZoom(Number(value))}>
                      <SelectTrigger className="w-[104px]" inputSize="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {canvasZoomLevels.map((zoom: any) => (
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
                        onClick={toggleCanvasPanMode}
                      >
                        <Hand aria-hidden />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full border border-outline bg-surface-container-high p-1">
                      <Button size="icon-sm" variant="ghost" data-builder-undo="" aria-label="撤销" onClick={runUndoCanvas} disabled={!canUndo}>
                        <Undo2 aria-hidden />
                      </Button>
                      <Button size="icon-sm" variant="ghost" data-builder-redo="" aria-label="重做" onClick={runRedoCanvas} disabled={!canRedo}>
                        <Redo2 aria-hidden />
                      </Button>
                      <Button size="icon-sm" variant="ghost" data-builder-copy-selection="" aria-label="复制选中控件" onClick={copySelectionToClipboard} disabled={selectedIds.length === 0}>
                        <ClipboardCopy aria-hidden />
                      </Button>
                      <Button size="icon-sm" variant="ghost" data-builder-paste-selection="" aria-label="粘贴控件" onClick={() => pasteClipboardItems()} disabled={!canPaste}>
                        <ClipboardPaste aria-hidden />
                      </Button>
                    </div>
                    <label className="flex h-[var(--control-sm)] items-center gap-2 rounded-full border border-outline bg-surface-container-high px-3 text-xs">
                      <Grid3x3 aria-hidden className="size-3.5 text-primary" />
                      网格
                      <Switch className="h-5 w-9 border" checked={page.showGrid} onCheckedChange={(showGrid: any) => updatePage({ showGrid })} />
                    </label>
                    <label
                      className="flex h-[var(--control-sm)] items-center gap-2 rounded-full border border-outline bg-surface-container-high px-3 text-xs"
                      data-builder-canvas-show-rulers=""
                    >
                      <Ruler aria-hidden className="size-3.5 text-primary" />
                      标尺
                      <Switch className="h-5 w-9 border" checked={page.showRulers} onCheckedChange={(showRulers: any) => updatePage({ showRulers })} />
                    </label>
                    <label className="flex h-[var(--control-sm)] items-center gap-2 rounded-full border border-outline bg-surface-container-high px-3 text-xs">
                      <Move aria-hidden className="size-3.5 text-primary" />
                      吸附
                      <Switch className="h-5 w-9 border" checked={page.snapToGrid} onCheckedChange={(snapToGrid: any) => updatePage({ snapToGrid })} />
                    </label>
                    <Badge variant="outline">{items.length} 个节点</Badge>
                    <Badge variant={selectedIds.length > 0 ? "secondary" : "outline"}>{selectedIds.length} 个已选</Badge>
                  </div>
                    </div>
                  ) : null}
                </div>

                <BatchSelectToolbar
                  count={selectedItems.length}
                  onAlignLeft={() => alignSelected("left")}
                  onMatchWidth={() => matchSelectedSize("width")}
                  onMatchHeight={() => matchSelectedSize("height")}
                  onBatchLabel={() => {
                    const next = window.prompt("批量设置标签文案", selectedItems[0]?.props.label ?? "");
                    if (next != null) {
                      selectedItems.forEach((item: any) => updateItemPropsById(item.id, { label: next }));
                      showProjectJumpFeedback("success", "批量标签已更新", String(selectedItems.length) + " 个控件标签已更新。");
                    }
                  }}
                />
                <CanvasFindBar
                  open={canvasFindOpen && mode === "design"}
                  query={canvasFindQuery}
                  inputRef={canvasFindInputRef}
                  onQueryChange={(value: any) => {
                    setCanvasFindQuery(value);
                    const q = value.trim().toLowerCase();
                    const match = items.find((item: any) => {
                      if (!q) return false;
                      return (
                        item.name.toLowerCase().includes(q) ||
                        item.type.toLowerCase().includes(q) ||
                        getItemSummary(item).toLowerCase().includes(q)
                      );
                    });
                    if (match) {
                      setSelectedId(match.id);
                      setSelectionAnchorId(match.id);
                    }
                  }}
                  onClose={() => {
                    setCanvasFindOpen(false);
                    setCanvasFindQuery("");
                  }}
                  onCommit={() => {
                    const q = canvasFindQuery.trim().toLowerCase();
                    const match = items.find(
                      (item: any) =>
                        item.name.toLowerCase().includes(q) ||
                        item.type.toLowerCase().includes(q) ||
                        getItemSummary(item).toLowerCase().includes(q),
                    );
                    if (match) {
                      setSelectedId(match.id);
                      fitSelectedCanvasToViewport();
                    }
                  }}
                />

                          <ToolchainBanner status={toolchainStatus} />
                {conflictFile ? (
                  <ConflictMergeEditor
                    file={conflictFile}
                    onClose={() => setConflictFile(null)}
                    onResolve={(resolutions: any) => {
                      void invokeIfAvailable("resolve_git_conflict", {
                        rootPath: activeProject.rootPath ?? "",
                        filePath: conflictFile.path,
                        resolutions,
                      }).then(() => {
                        setConflictFile(null);
                        void invokeIfAvailable(
                          "git_project_status",
                          { rootPath: activeProject.rootPath ?? "" },
                        ).then(setProjectGitStatus);
                        showProjectJumpFeedback("success", "冲突已解决", conflictFile.path);
                      });
                    }}
                  />
                ) : null}
                <SelectionActionBar
                  hasCanvasSelection={hasCanvasSelection}
                  selectionAnchorId={selectionAnchorId}
                  selectionActionBarState={selectionActionBarState}
                  selectionActionBarActionCount={selectionActionBarActionCount}
                  selectionActionBarReservedTrack={selectionActionBarReservedTrack}
                  selectionActionBarLabel={selectionActionBarLabel}
                  selectedItems={selectedItems}
                  selectedItem={selectedItem}
                  getItemSummary={getItemSummary}
                  getItemIcon={(type: any) => getDefinition(type).icon}
                  selectedItemHierarchy={selectedItemHierarchy}
                  selectHierarchyBreadcrumbNode={selectHierarchyBreadcrumbNode}
                  activeFileName={activeFile.name}
                  selectedEventName={selectedEventName}
                  selectedEventCommandName={selectedEventCommand ? sanitizeRustCommandName(selectedEventCommand.name) : null}
                  selectedPropertyIssueCount={selectedPropertyIssues.length}
                  selectionModeStrip={selectionModeStrip}
                  selectionCapabilityStrip={selectionCapabilityStrip}
                  selectionBarStatusTone={selectionBarStatusTone}
                  selectionBarStatusLabel={selectionBarStatusLabel}
                  selectionBarStatusTitle={selectionBarStatusTitle}
                  selectionBarStatusDetail={selectionBarStatusDetail}
                  selectionStatusTone={selectionStatusTone}
                  selectedSignalSlotLocation={selectedSignalSlotOutlineEntry?.line ? `logic.rs:${selectedSignalSlotOutlineEntry.line}` : null}
                  selectedSignalSlotGoState={selectedEventCommand ? "open" : "create"}
                  goToSlotForItem={goToSlotForItem}
                  hasSelectedSimulatorTrace={Boolean(selectedLatestSimulatorTrace)}
                  openSelectedConnections={openSelectedConnections}
                  selectionRecommendedStep={selectionRecommendedStep}
                  focusSelectedRosterItem={focusSelectedRosterItem}
                  removeItemFromSelection={removeItemFromSelection}
                  clearSelection={clearSelection}
                  openSelectedProperties={openSelectedProperties}
                  selectedSameTypeCount={selectedSameTypeCount}
                  selectSameTypeControls={selectSameTypeControls}
                  selectInverseSelection={selectInverseSelection}
                  focusSelectedObjectNameEditor={focusSelectedObjectNameEditor}
                  canFitSelectedCanvas={Boolean(selectedCanvasFitBounds)}
                  fitSelectedCanvasToViewport={fitSelectedCanvasToViewport}
                  selectedQuickTextProps={selectedQuickTextProps}
                  startInlineTextEdit={(item: any, prop: any, source: any) => startInlineTextEdit(item, prop as any, source as any)}
                  quickTextPropLabel={(prop: any) => quickTextPropLabel(prop as any)}
                  textPropertyValue={textPropertyValue}
                  tabOrderOverlayVisible={tabOrderOverlayVisible}
                  setTabOrderOverlayVisible={setTabOrderOverlayVisible}
                  focusableTabOrderCount={focusableTabOrderItems.length}
                  alignSelected={alignSelected}
                  distributeSelected={distributeSelected}
                  matchSelectedSize={matchSelectedSize}
                  groupSelectedIntoFrame={groupSelectedIntoFrame}
                  ungroupSelectedFrames={ungroupSelectedFrames}
                  moveSelectedLayerStep={(delta: any) => moveSelectedLayerStep(delta as 1 | -1)}
                  sendToBack={sendToBack}
                  bringToFront={bringToFront}
                  copySelectionToClipboard={copySelectionToClipboard}
                  cutSelectionToClipboard={cutSelectionToClipboard}
                  duplicateSelected={duplicateSelected}
                  toggleSelectedLock={toggleSelectedLock}
                  createAndBindBackendIntegrationCommand={createAndBindBackendIntegrationCommand}
                  runSelectedEventFromActionBar={runSelectedEventFromActionBar}
                  openImpactDock={() => setRightDockTab("impact")}
                  deleteSelected={deleteSelected}
                  openComponentsDock={() => setLeftDockTab("components")}
                  fitCanvasToViewport={fitCanvasToViewport}
                  canvasItemCount={items.length}
                  onAlignPreview={setAlignPreviewMode}
                />

                <div
                  ref={canvasViewportRef}
                  data-builder-canvas-viewport=""
                  data-builder-canvas-interaction={canvasInteractionMode}
                  data-builder-canvas-pan-state={canvasPanActive ? "active" : "idle"}
                  data-builder-canvas-selected-count={selectedIds.length}
                  data-builder-canvas-selection-mode={canvasSelectionMode}
                  data-builder-canvas-selection-scroll-padding="content-local"
                  className={cn(
                    "subtle-scrollbar relative min-h-0 flex-1 overflow-auto p-8",
                    canvasViewportSelectionScrollPaddingClass,
                    canvasPanActive
                      ? "cursor-grab active:cursor-grabbing"
                      : mode === "design"
                        ? "cursor-crosshair"
                        : "cursor-default",
                  )}
                  style={canvasViewportDockScrollStyle}
                  data-builder-canvas-dock-scroll-padding={canvasViewportDockScrollPadding}
                  data-builder-canvas-dock-visual-padding={canvasViewportDockVisualPadding}
                  onMouseDown={startCanvasMousePan}
                  onPointerDown={startCanvasPan}
                  onPointerMove={moveCanvasPan}
                  onPointerUp={stopCanvasPan}
                  onPointerCancel={stopCanvasPan}
                  onScroll={handleCanvasViewportScroll}
                  onWheel={handleCanvasViewportWheel}
                >
                  <div
                    className="flex justify-center"
                    style={canvasStageViewportStyle}
                    data-builder-canvas-stage-viewport=""
                    data-builder-canvas-stage-alignment="centered-when-room"
                  >
                  <div className="relative" style={canvasStageStyle}>
                    {mode === "design" ? (
                      <div
                        aria-hidden
                        className={cn(
                          "pointer-events-none mb-2 flex h-9 items-center justify-between gap-3 rounded-[14px] border px-3 text-[0.68rem] shadow-m3-1 backdrop-blur",
                          page.titlebarStyle === "hidden"
                            ? "border-dashed border-outline-variant bg-surface-container-lowest/65 text-on-surface-variant"
                            : page.titlebarStyle === "native"
                              ? "border-outline-variant bg-surface-container-lowest/88 text-on-surface"
                              : "border-primary/25 bg-surface-container-lowest/88 text-on-surface",
                        )}
                        style={canvasShellPreviewStyle}
                        data-builder-canvas-window-shell-preview=""
                        data-builder-canvas-window-shell-placement="outside-content"
                        data-builder-canvas-window-kind={page.windowKind}
                        data-builder-canvas-titlebar-style={page.titlebarStyle}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-lg border",
                              page.titlebarStyle === "nova"
                                ? "border-primary/20 bg-primary-container text-primary"
                                : "border-outline-variant bg-surface-container-high text-on-surface-variant",
                            )}
                          >
                            {page.titlebarStyle === "hidden" ? <PanelTop className="size-3" /> : <Monitor className="size-3" />}
                          </span>
                          <span className="min-w-0">
                            <span className="flex min-w-0 items-center gap-1.5">
                              <span className="truncate font-semibold">{page.title || activeFile.name}</span>
                              <Badge variant="outline" className="h-5 max-w-[5.75rem] truncate px-1.5 text-[0.6rem]">
                                {pageWindowKindMeta?.label ?? page.windowKind}
                              </Badge>
                              <Badge
                                variant={page.titlebarStyle === "nova" ? "secondary" : "outline"}
                                className="h-5 max-w-[5.75rem] truncate px-1.5 text-[0.6rem]"
                              >
                                {pageTitlebarStyleMeta?.label ?? page.titlebarStyle}
                              </Badge>
                            </span>
                            <span className="mt-0.5 hidden max-w-[28rem] truncate text-[0.62rem] text-on-surface-variant lg:block">
                              {page.titlebarStyle === "hidden" ? "运行时内容会占满窗口区域" : page.titlebarSubtitle || pageWindowKindMeta?.description}
                            </span>
                          </span>
                        </div>
                        {page.titlebarStyle === "hidden" ? (
                          <span className="shrink-0 rounded-full border border-outline-variant bg-surface-container-high px-2 py-0.5 text-[0.6rem] font-medium">
                            无标题栏
                          </span>
                        ) : (
                          <span className="flex shrink-0 items-center gap-1">
                            <span className="size-2 rounded-full bg-outline-variant" />
                            <span className="size-2 rounded-full bg-outline-variant" />
                            <span className="size-2 rounded-full bg-destructive/70" />
                          </span>
                        )}
                      </div>
                    ) : null}
                    <div className="relative" style={canvasContentPlaneStyle} data-builder-canvas-content-plane="">
                    <AlignGuideOverlay
                      mode={alignPreviewMode as "左对齐" | "水平居中" | "右对齐" | "顶部对齐" | "垂直居中" | "底部对齐" | null}
                      items={selectedItems}
                      zoom={page.zoom}
                      canvasWidth={page.width * page.zoom}
                      canvasHeight={page.height * page.zoom}
                    />
                    {mode === "design" && page.showRulers ? (
                      <div
                        className="pointer-events-none absolute inset-0 z-20"
                        data-builder-canvas-rulers=""
                        data-builder-canvas-ruler-grid={page.gridSize}
                        data-builder-canvas-ruler-zoom={Math.round(page.zoom * 100)}
                      >
                        <div
                          className="absolute left-0 top-0 h-6 overflow-hidden rounded-t-xl border border-outline-variant bg-surface-container-lowest/95 text-[0.58rem] text-on-surface-variant shadow-m3-1 backdrop-blur"
                          style={{ width: page.width * page.zoom }}
                          data-builder-canvas-ruler-axis="x"
                        >
                          {canvasRulerSelectionProjection ? (
                            <div
                              className="absolute bottom-0 top-0 border-x border-primary/50 bg-primary/10"
                              style={{
                                left: canvasRulerSelectionProjection.left,
                                width: canvasRulerSelectionProjection.width,
                              }}
                              data-builder-canvas-ruler-selection="x"
                            />
                          ) : null}
                          {canvasHorizontalRulerMarks.map((mark: any) => (
                            <span key={`x-${mark.value}`} data-builder-canvas-ruler-mark={mark.major ? "major" : "minor"}>
                              <span
                                className={cn(
                                  "absolute bottom-0 w-px bg-outline-variant",
                                  mark.major ? "h-4 bg-outline" : "h-2",
                                )}
                                style={{ left: mark.position }}
                              />
                              {mark.label ? (
                                <span
                                  className="absolute left-0 top-1 max-w-12 truncate px-1 font-mono"
                                  style={{ transform: `translateX(${mark.position}px)` }}
                                >
                                  {mark.label}
                                </span>
                              ) : null}
                            </span>
                          ))}
                        </div>
                        <div
                          className="absolute left-0 top-0 w-8 overflow-hidden rounded-l-xl border border-outline-variant bg-surface-container-lowest/95 text-[0.58rem] text-on-surface-variant shadow-m3-1 backdrop-blur"
                          style={{ height: page.height * page.zoom }}
                          data-builder-canvas-ruler-axis="y"
                        >
                          {canvasRulerSelectionProjection ? (
                            <div
                              className="absolute left-0 right-0 border-y border-primary/50 bg-primary/10"
                              style={{
                                top: canvasRulerSelectionProjection.top,
                                height: canvasRulerSelectionProjection.height,
                              }}
                              data-builder-canvas-ruler-selection="y"
                            />
                          ) : null}
                          {canvasVerticalRulerMarks.map((mark: any) => (
                            <span key={`y-${mark.value}`} data-builder-canvas-ruler-mark={mark.major ? "major" : "minor"}>
                              <span
                                className={cn(
                                  "absolute right-0 h-px bg-outline-variant",
                                  mark.major ? "w-5 bg-outline" : "w-2.5",
                                )}
                                style={{ top: mark.position }}
                              />
                              {mark.label ? (
                                <span
                                  className="absolute left-1 max-w-6 truncate font-mono leading-none"
                                  style={{ top: mark.position + 2 }}
                                >
                                  {mark.label}
                                </span>
                              ) : null}
                            </span>
                          ))}
                        </div>
                        <div
                          className="absolute left-0 top-0 flex h-6 w-8 items-center justify-center rounded-tl-xl border border-outline-variant bg-surface-container-lowest/95 font-mono text-[0.56rem] text-on-surface-variant shadow-m3-1 backdrop-blur"
                          data-builder-canvas-ruler-origin=""
                        >
                          0
                        </div>
                        <div
                          className="absolute left-10 top-7 max-w-[16rem] truncate rounded-full border border-outline-variant bg-surface-container-lowest/90 px-2 py-1 font-mono text-[0.62rem] text-on-surface-variant shadow-m3-1 backdrop-blur"
                          data-builder-canvas-ruler-coordinate-readout=""
                        >
                          {canvasRulerSelectionProjection ? canvasRulerSelectionProjection.label : `${Math.round(page.width)} x ${Math.round(page.height)} · grid ${page.gridSize}`}
                        </div>
                      </div>
                    ) : null}
                    <div
                      ref={canvasRef}
                      data-builder-canvas=""
                      data-builder-canvas-interaction={canvasInteractionMode}
                      data-builder-canvas-selected-count={selectedIds.length}
                      data-builder-canvas-selection-anchor={selectionAnchorId}
                      data-builder-canvas-selection-mode={canvasSelectionMode}
                      aria-label={selectionMarquee ? "画布框选中" : "设计画布"}
                      className={cn(
                        "relative z-0 overflow-hidden rounded-[18px] border border-outline-variant shadow-m3-2",
                        mode === "design" && !canvasPanActive && "cursor-crosshair",
                        mode === "design" && canvasPanActive && "cursor-grab active:cursor-grabbing",
                      )}
                      style={canvasStyle}
                      onPointerDown={startSelectionMarquee}
                      onClick={() => {
                        if (suppressCanvasClickRef.current) {
                          suppressCanvasClickRef.current = false;
                          return;
                        }
                        clearSelection({ feedback: true });
                      }}
                      onContextMenu={(event: any) => openCanvasContextMenu(event)}
                      onDragOver={(event: any) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "copy";
                        setDropIntent(getFrameDropIntentFromClientPoint(event.clientX, event.clientY));
                      }}
                      onDragLeave={(event: any) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                          setDropIntent(null);
                        }
                      }}
                      onDrop={handleCanvasDrop}
                    >
                      {items.length === 0 ? (
                        <div
                          className={cn(
                            "pointer-events-none absolute inset-x-4 z-[3] flex justify-center",
                            page.showRulers ? "top-28" : "top-4",
                          )}
                        >
                          <div
                            data-builder-design-empty-state=""
                            data-builder-empty-state-density="compact-strip"
                            className="pointer-events-auto flex max-w-[min(540px,calc(100%-16px))] flex-wrap items-center justify-center gap-1.5 rounded-full border border-dashed border-outline-variant bg-surface-container-lowest/95 px-2 py-1.5 text-left shadow-m3-1 backdrop-blur"
                            style={{
                              transform: `scale(${Math.min(2.4, 1 / Math.max(page.zoom, 0.42))})`,
                              transformOrigin: "top center",
                            }}
                            onClick={(event: any) => event.stopPropagation()}
                            onPointerDown={(event: any) => event.stopPropagation()}
                          >
                            <div className="inline-flex min-w-0 items-center gap-1.5 px-1.5 text-xs font-medium text-on-surface">
                              <MousePointer2 aria-hidden className="size-3.5 text-primary" />
                              <span className="whitespace-nowrap">空画布</span>
                            </div>
                            <span className="hidden max-w-[170px] truncate text-[0.68rem] text-on-surface-variant sm:inline">
                              插入控件开始设计
                            </span>
                            {emptyCanvasQuickStarts.map((type: any) => {
                              const definition = getDefinition(type);
                              const Icon = definition.icon;
                              return (
                                <Button
                                  key={type}
                                  type="button"
                                  size="icon"
                                  variant="secondary"
                                  className="size-7 shrink-0 rounded-full"
                                  aria-label={`插入${definition.title}`}
                                  title={`插入${definition.title}`}
                                  data-builder-empty-insert={type}
                                  onClick={(event: any) => {
                                    event.stopPropagation();
                                    insertComponentFromShortcut(type, { centered: true });
                                  }}
                                >
                                  <Icon aria-hidden className="size-3.5" />
                                </Button>
                              );
                            })}
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 min-w-0 rounded-full px-2.5 text-[0.68rem]"
                              data-builder-empty-open-components=""
                              onClick={(event: any) => {
                                event.stopPropagation();
                                setLeftDockTab("components");
                              }}
                            >
                              <Layers aria-hidden className="size-3.5" />
                              <span className="truncate">控件库</span>
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
                            <span className="truncate">释放到画布</span>
                            <span className="rounded-full bg-primary/10 px-1.5 py-0.5">{dropIntent.itemCount}</span>
                          </div>
                        </div>
                      ) : null}

                      {mode === "design" && smartGuides.length > 0 ? (
                        <div className="pointer-events-none absolute inset-0 z-[9997]" data-builder-smart-guides="" data-builder-smart-guide-count={smartGuides.length}>
                          {smartGuides.map((guide: any) =>
                            guide.axis === "x" ? (
                              <div
                                key={guide.id}
                                data-builder-smart-guide={guide.id}
                                data-builder-smart-guide-axis="x"
                                data-builder-smart-guide-source={guide.source}
                                data-builder-smart-guide-snap-delta={guide.snapDeltaX ?? 0}
                              >
                                <div
                                  className="absolute w-px bg-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.18)]"
                                  style={{
                                    left: guide.position,
                                    top: guide.start,
                                    height: Math.max(12, guide.end - guide.start),
                                  }}
                                />
                                <div
                                  className="absolute inline-flex max-w-[180px] items-center gap-1 rounded-full border border-primary/25 bg-surface-container-lowest/95 px-2 py-0.5 text-[0.62rem] font-medium text-primary shadow-m3-1 backdrop-blur"
                                  style={{
                                    left: clamp(guide.position + 8, 8, Math.max(8, page.width - 180)),
                                    top: clamp(guide.start + 4, 8, Math.max(8, page.height - 28)),
                                  }}
                                >
                                  <Move aria-hidden className="size-3" />
                                  <span className="truncate">{guide.label}</span>
                                </div>
                              </div>
                            ) : (
                              <div
                                key={guide.id}
                                data-builder-smart-guide={guide.id}
                                data-builder-smart-guide-axis="y"
                                data-builder-smart-guide-source={guide.source}
                                data-builder-smart-guide-snap-delta={guide.snapDeltaY ?? 0}
                              >
                                <div
                                  className="absolute h-px bg-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.18)]"
                                  style={{
                                    left: guide.start,
                                    top: guide.position,
                                    width: Math.max(12, guide.end - guide.start),
                                  }}
                                />
                                <div
                                  className="absolute inline-flex max-w-[180px] items-center gap-1 rounded-full border border-primary/25 bg-surface-container-lowest/95 px-2 py-0.5 text-[0.62rem] font-medium text-primary shadow-m3-1 backdrop-blur"
                                  style={{
                                    left: clamp(guide.start + 4, 8, Math.max(8, page.width - 180)),
                                    top: clamp(guide.position + 8, 8, Math.max(8, page.height - 28)),
                                  }}
                                >
                                  <Move aria-hidden className="size-3" />
                                  <span className="truncate">{guide.label}</span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : null}

                      {canvasDragMetricsOverlay ? (
                        <div
                          className={cn(
                            "pointer-events-none absolute z-[9998] max-w-[280px] rounded-2xl border bg-surface-container-lowest/95 px-3 py-2 text-[0.68rem] shadow-m3-2 backdrop-blur",
                            canvasDragMetricsOverlay.tone === "resize"
                              ? "border-tertiary/35 text-tertiary"
                              : "border-primary/30 text-primary",
                          )}
                          data-builder-drag-metrics-overlay=""
                          data-builder-drag-metrics-mode={canvasDragMetricsOverlay.tone}
                          data-builder-drag-metrics-precision={canvasDragMetricsOverlay.precision ? "on" : "off"}
                          style={{ left: canvasDragMetricsOverlay.x, top: canvasDragMetricsOverlay.y }}
                        >
                          <div className="flex min-w-0 items-center gap-1.5 font-semibold">
                            {canvasDragMetricsOverlay.tone === "resize" ? (
                              <Maximize2 aria-hidden className="size-3.5 shrink-0" />
                            ) : (
                              <Move aria-hidden className="size-3.5 shrink-0" />
                            )}
                            <span className="truncate">{canvasDragMetricsOverlay.title}</span>
                          </div>
                          <p className="mt-1 truncate font-mono text-[0.64rem] text-on-surface-variant">{canvasDragMetricsOverlay.detail}</p>
                        </div>
                      ) : null}

                      {mode === "design" && tabOrderOverlayVisible ? (
                        <div
                          className="pointer-events-none absolute inset-0 z-[9998]"
                          data-builder-tab-order-overlay=""
                          data-builder-tab-order-count={focusableTabOrderItems.length}
                        >
                          {focusableTabOrderItems.map((entry: any, index: any) => {
                            const position = getAbsolutePosition(entry.item, items);
                            return (
                              <button
                                key={entry.item.id}
                                type="button"
                                className={cn(
                                  "focus-ring pointer-events-auto absolute inline-flex h-7 max-w-[180px] items-center gap-1 rounded-full border px-2 text-[0.66rem] font-semibold shadow-m3-2 backdrop-blur transition-colors",
                                  selectedIds.includes(entry.item.id)
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-primary/35 bg-surface-container-lowest/95 text-primary hover:bg-primary-container hover:text-primary-container-foreground",
                                )}
                                data-builder-tab-order-overlay-item={entry.item.id}
                                data-builder-tab-order-index={entry.tabIndex}
                                aria-label={`选择 Tab 顺序 ${index + 1}：${getItemSummary(entry.item)}`}
                                style={{
                                  left: clamp(position.x + 6, 6, Math.max(6, page.width - 180)),
                                  top: clamp(position.y + 6, 6, Math.max(6, page.height - 28)),
                                }}
                                onPointerDown={(event: any) => event.stopPropagation()}
                                onClick={(event: any) => {
                                  event.stopPropagation();
                                  setSelectedId(entry.item.id);
                                  setRightDockTab("properties");
                                }}
                              >
                                <Keyboard aria-hidden className="size-3" />
                                <span className="font-mono">{entry.tabIndex}</span>
                                <span className="min-w-0 truncate font-medium">{getItemSummary(entry.item)}</span>
                                {!entry.explicit ? <span className="rounded-full bg-primary/10 px-1 text-[0.56rem]">auto</span> : null}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}

                      {selectionMarquee && !selectionMarquee.moved ? (
                        <div
                          className={cn(
                            "pointer-events-none absolute z-[9999] inline-flex max-w-[220px] items-center gap-1.5 rounded-full border bg-surface-container-lowest/95 px-2 py-1 text-[0.66rem] font-medium shadow-m3-1 backdrop-blur",
                            selectionMarquee.mode === "subtract"
                              ? "border-destructive/25 text-destructive"
                              : "border-primary/25 text-primary",
                          )}
                          data-builder-selection-marquee-start=""
                          data-builder-selection-marquee-mode={selectionMarquee.mode}
                          style={{
                            left: clamp(selectionMarquee.originX + 8, 8, Math.max(8, page.width - 220)),
                            top: clamp(selectionMarquee.originY - 30, 8, Math.max(8, page.height - 30)),
                          }}
                        >
                          <MousePointer2 aria-hidden className="size-3" />
                          <span className="truncate">{selectionModeHudLabel}</span>
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[0.58rem]">
                            0
                          </span>
                        </div>
                      ) : null}

                      {selectionMarquee?.moved
                        ? (() => {
                            const rect = getSelectionMarqueeRect(selectionMarquee);
                            const marqueeSelectedCount = getItemIdsInsideMarquee(
                              selectionMarquee,
                              (itemId: any) => {
                                const item = items.find((candidate: any) => candidate.id === itemId);
                                if (!item) return null;
                                const position = getAbsolutePosition(item, items);
                                return { x: position.x, y: position.y, width: item.width, height: item.height };
                              },
                              items.map((item: any) => item.id),
                            ).length;
                            const marqueeModeLabel =
                              selectionMarquee.mode === "subtract"
                                ? "减选"
                                : selectionMarquee.mode === "add"
                                  ? "加选"
                                  : "框选";
                            return (
                              <>
                                <div
                                  className={cn(
                                    "pointer-events-none absolute z-[9998] rounded-[10px] border shadow-m3-1",
                                    selectionMarquee.mode === "subtract"
                                      ? "border-destructive/70 bg-destructive/10"
                                      : "border-primary/70 bg-primary/15",
                                  )}
                                  data-builder-selection-marquee=""
                                  data-builder-selection-marquee-mode={selectionMarquee.mode}
                                  data-builder-selection-marquee-result-count={marqueeSelectedCount}
                                  style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
                                />
                                <div
                                  className={cn(
                                    "pointer-events-none absolute z-[9999] inline-flex max-w-[220px] items-center gap-1.5 rounded-full border bg-surface-container-lowest/95 px-2 py-1 text-[0.66rem] font-medium shadow-m3-1",
                                    selectionMarquee.mode === "subtract"
                                      ? "border-destructive/25 text-destructive"
                                      : "border-primary/25 text-primary",
                                  )}
                                  data-builder-selection-marquee-count=""
                                  data-builder-selection-marquee-result-count={marqueeSelectedCount}
                                  style={{
                                    left: clamp(rect.left + 8, 8, Math.max(8, page.width - 220)),
                                    top: clamp(rect.top - 30, 8, Math.max(8, page.height - 30)),
                                  }}
                                >
                                  <MousePointer2 aria-hidden className="size-3" />
                                  <span className="truncate">{marqueeModeLabel}</span>
                                  <span
                                    className={cn(
                                      "rounded-full px-1.5 py-0.5",
                                      selectionMarquee.mode === "subtract" ? "bg-destructive/10" : "bg-primary/10",
                                    )}
                                  >
                                    {marqueeSelectedCount}
                                  </span>
                                </div>
                              </>
                            );
                          })()
                        : null}

                      {mode === "design" && selectedCanvasBounds ? (
                        <>
                          <div
                            className="pointer-events-none absolute z-[9997] rounded-[14px] border border-primary/75 bg-primary/5 shadow-m3-2"
                            data-builder-selection-bounds=""
                            style={{
                              left: selectedCanvasBounds.left,
                              top: selectedCanvasBounds.top,
                              width: selectedCanvasBounds.width,
                              height: selectedCanvasBounds.height,
                            }}
                          >
                            <span className="absolute -left-1 -top-1 size-2 rounded-full border border-primary bg-surface-container-lowest shadow-m3-1" />
                            <span className="absolute -right-1 -top-1 size-2 rounded-full border border-primary bg-surface-container-lowest shadow-m3-1" />
                            <span className="absolute -bottom-1 -left-1 size-2 rounded-full border border-primary bg-surface-container-lowest shadow-m3-1" />
                            <span className="absolute -bottom-1 -right-1 size-2 rounded-full border border-primary bg-surface-container-lowest shadow-m3-1" />
                          </div>
                          <div
                            className="pointer-events-none absolute z-[9999] inline-flex max-w-[260px] items-center gap-1.5 rounded-full border border-primary/25 bg-surface-container-lowest/95 px-2 py-1 text-[0.66rem] font-medium text-primary shadow-m3-1 backdrop-blur"
                            data-builder-selection-bounds-label=""
                            style={{
                              left: clamp(selectedCanvasBounds.left, 8, Math.max(8, page.width - 260)),
                              top: clamp(selectedCanvasBounds.top - 32, 8, Math.max(8, page.height - 34)),
                            }}
                          >
                            <Layers aria-hidden className="size-3" />
                            <span className="truncate">{selectedItems.length} 个控件</span>
                            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-mono">
                              {Math.round(selectedCanvasBounds.width)} x {Math.round(selectedCanvasBounds.height)}
                            </span>
                            {selectedItems.some((item: any) => item.locked) ? (
                              <span className="rounded-full bg-surface-container-high px-1.5 py-0.5 text-on-surface-variant">
                                {selectedItems.filter((item: any) => item.locked).length} 锁定
                              </span>
                            ) : null}
                          </div>
                        </>
                      ) : null}

                      {topLevelItems.map((item: any) => renderCanvasNode(item))}
                    </div>
                    </div>
                  </div>
                  </div>
                </div>
              </main>

              <InspectorDock
                tabs={rightDockTabs}
                activeTab={rightDockTab}
                onTabChange={setRightDockTab}
                collapsed={rightDockCollapsed}
                onCollapsedChange={setRightDockCollapsed}
                bottomClearance={designSideDockBottomClearance}
              >
                <section
                  className={cn(
                    "mb-4 rounded-[22px] border border-outline-variant bg-surface-container-low p-3",
                    rightDockTab === "properties" && selectedItem && "hidden",
                  )}
                  data-builder-inspector-context=""
                >
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
                            {selectedItems.length > 1 ? `已选择 ${selectedItems.length} 个控件` : selectedItem ? getItemSummary(selectedItem) : activeFile.name}
                          </h2>
                          <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">
                            {selectedItems.length > 1
                              ? `${selectedItems.filter((item: any) => item.locked).length} 个已锁定 · ${activeFile.name}`
                              : selectedItem
                                ? `${selectedItem.type} · x ${Math.round(selectedItem.x)} y ${Math.round(selectedItem.y)} · ${Math.round(selectedItem.width)} x ${Math.round(selectedItem.height)}`
                                : `${activeFile.items.length} 个控件 · ${page.width} x ${page.height}`}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Badge variant={selectedPropertyIssues.length > 0 ? "outline" : "secondary"}>
                          {selectedItem ? `${selectedPropertyIssues.length} 个问题` : "页面"}
                        </Badge>
                        {selectedItem && selectedEventName ? (
                          <Badge variant={selectedEventCommand ? "secondary" : "outline"}>
                            {selectedEventCommand ? "事件已绑定" : "事件就绪"}
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

                  <div
                    className={cn("mt-3 space-y-2", rightDockTab === "properties" && selectedItem && "hidden")}
                    data-builder-inspector-workflow=""
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">下一步</p>
                      <Badge variant={selectedEventCommand || selectedItems.length > 1 ? "secondary" : "outline"}>{inspectorWorkflowBadge}</Badge>
                    </div>
                    <div className="space-y-1.5">
                      {inspectorWorkflowSteps.map((step: any, index: any) => {
                        const StepIcon = step.icon;
                        return (
                          <button
                            key={step.id}
                            type="button"
                            data-builder-inspector-workflow-step={step.id}
                            disabled={step.disabled}
                            className={cn(
                              "focus-ring group flex w-full min-w-0 items-center gap-2 rounded-2xl border px-2.5 py-2.5 text-left text-xs transition",
                              step.tone === "primary" && "border-primary/40 bg-primary/10 text-on-surface shadow-m3-1",
                              step.tone === "ready" && "border-outline-variant bg-surface-container-high text-on-surface hover:border-primary/30 hover:bg-primary/5",
                              step.tone === "warning" && "border-destructive/30 bg-destructive/10 text-on-surface hover:border-destructive/50",
                              step.tone === "danger" && "border-destructive/30 bg-surface-container-high text-destructive hover:bg-destructive/10",
                              step.tone === "muted" && "border-outline-variant bg-surface-container-high text-on-surface-variant hover:border-outline hover:text-on-surface",
                              step.disabled && "cursor-not-allowed opacity-55 hover:border-outline-variant hover:bg-surface-container-high hover:text-on-surface-variant",
                            )}
                            onClick={step.onAction}
                          >
                            <span
                              className={cn(
                                "flex size-7 shrink-0 items-center justify-center rounded-xl",
                                step.tone === "primary" && "bg-primary text-primary-foreground",
                                step.tone === "warning" && "bg-destructive/10 text-destructive",
                                step.tone === "danger" && "bg-destructive/10 text-destructive",
                                (step.tone === "ready" || step.tone === "muted") && "bg-surface-container-low text-primary",
                              )}
                            >
                              <StepIcon aria-hidden className="size-3.5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex min-w-0 items-center gap-2">
                                <span className="truncate font-medium">{index + 1}. {step.title}</span>
                                <Badge
                                  variant={step.tone === "warning" || step.tone === "danger" ? "destructive" : step.tone === "primary" ? "secondary" : "outline"}
                                  className="hidden shrink-0 sm:inline-flex"
                                >
                                  {step.badge}
                                </Badge>
                              </span>
                              <span className="mt-0.5 line-clamp-3 text-[0.68rem] leading-4 text-on-surface-variant">{step.detail}</span>
                            </span>
                            <span
                              className={cn(
                                "hidden shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[0.66rem] font-medium 2xl:inline-flex",
                                step.tone === "primary"
                                  ? "border-primary/30 bg-primary/10 text-primary"
                                  : "border-outline-variant bg-surface-container-low text-on-surface-variant group-hover:text-on-surface",
                              )}
                            >
                              {step.actionLabel}
                              <ArrowRight aria-hidden className="size-3" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {rightDockTab === "properties" && selectedItem ? (
                    <div className="mt-3 grid grid-cols-4 gap-1.5" data-builder-inspector-property-map="">
                      {[
                        { label: "布局", value: `${Math.round(selectedItem.width)} x ${Math.round(selectedItem.height)}` },
                        { label: "内容", value: "text" in selectedItem.props ? String(selectedItem.props.text) : selectedItem.props.label ?? selectedItem.props.title ?? selectedItem.type },
                        { label: "状态", value: selectedBindableProps.length > 0 ? `${selectedBindableProps.length} 个绑定` : "静态" },
                        { label: "动作", value: selectedEventCommand ? "已绑定" : selectedEventName ? "就绪" : "无" },
                      ].map((group: any) => (
                        <div key={group.label} className="min-w-0 rounded-xl border border-outline-variant bg-surface-container-high px-2 py-2">
                          <p className="truncate text-[0.64rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">{group.label}</p>
                          <p className="mt-1 truncate text-[0.68rem] text-on-surface">{group.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">视图</p>
                      <span className="text-[0.68rem] text-on-surface-variant">{rightDockTab}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                    {rightDockTabs.map((tab: any) => {
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
                  </div>
                </section>

                {rightDockTab === "properties" ? (
                  <>
                <PanelTitle icon={Settings2} title="检查器" description="页面、图层、坐标和控件属性。" />

                <div className="space-y-4">
                  {selectedItem ? (
                    <section className="space-y-2.5 rounded-[18px] border border-primary/20 bg-surface-container-low p-2.5 shadow-m3-1" data-builder-selected-properties-quick="">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold">{getItemSummary(selectedItem)}</h3>
                            <Badge variant="outline">{selectedItem.type}</Badge>
                            {selectedItem.locked ? <Badge variant="outline">已锁定</Badge> : null}
                            <Badge variant={selectedEventCommand ? "secondary" : selectedEventName ? "outline" : "outline"}>
                              {selectedEventCommand ? "事件已绑定" : selectedEventName ? "事件就绪" : "无事件"}
                            </Badge>
                          </div>
                          <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                            x {Math.round(selectedItem.x)} y {Math.round(selectedItem.y)} · {Math.round(selectedItem.width)} x {Math.round(selectedItem.height)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button size="icon-sm" variant="secondary" aria-label="打开连接设置" onClick={openSelectedConnections}>
                            <Braces aria-hidden className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" aria-label={selectedItem.locked ? "解锁控件" : "锁定控件"} onClick={toggleSelectedLock}>
                            {selectedItem.locked ? <Lock aria-hidden /> : <LockOpen aria-hidden />}
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-outline-variant bg-surface-container p-2.5" data-builder-selected-object-name-editor="">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <Label htmlFor="builder-selected-object-name" className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">
                            对象名称
                          </Label>
                          <span className="rounded-full border border-outline-variant bg-surface-container-high px-2 py-0.5 font-mono text-[0.58rem] text-on-surface-variant">
                            Ctrl+F2
                          </span>
                        </div>
                        <Input
                          id="builder-selected-object-name"
                          ref={selectedObjectNameInputRef}
                          inputSize="sm"
                          data-builder-selected-object-name=""
                          value={selectedItem.name}
                          placeholder={`${selectedItem.type}-${selectedItem.id.slice(-4)}`}
                          onChange={(event: any) => updateSelectedObjectName(event.target.value)}
                          onBlur={() => {
                            if (selectedItem.name.trim()) {
                              return;
                            }
                            updateSelectedObjectName(`${selectedItem.type}-${selectedItem.id.slice(-4)}`);
                          }}
                        />
                        <p className="mt-1.5 text-[0.66rem] leading-4 text-on-surface-variant">
                          用于对象树、构建诊断、事件连接和维护日志；不会改变控件显示文本。
                        </p>
                      </div>

                      <div className="rounded-2xl border border-outline-variant bg-surface-container p-2.5" data-builder-runtime-state-editor="">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">运行状态</p>
                            <p className="mt-1 text-[0.66rem] leading-4 text-on-surface-variant">
                              这些状态会写入生成 exe：禁用会阻止交互，隐藏只在运行态隐藏，只读用于输入类控件。
                            </p>
                          </div>
                          <Badge variant={selectedRuntimeState?.visible && selectedRuntimeState.enabled ? "secondary" : "outline"} className="shrink-0">
                            {selectedRuntimeState?.visible === false ? "隐藏" : selectedRuntimeState?.enabled === false ? "禁用" : selectedRuntimeState?.readOnly ? "只读" : "默认"}
                          </Badge>
                        </div>
                        <div className="space-y-1.5">
                          <label className="flex min-h-9 items-center justify-between gap-3 rounded-xl bg-surface-container-high px-3 py-2 text-xs" data-builder-runtime-state-visible="">
                            <span className="min-w-0">
                              <span className="block truncate font-medium">运行态可见</span>
                              <span className="block truncate text-[0.64rem] text-on-surface-variant">关闭后 exe 中隐藏，设计器仍可选中。</span>
                            </span>
                            <Switch checked={selectedRuntimeState?.visible ?? true} onCheckedChange={(visible: any) => updateSelectedProps({ visible })} />
                          </label>
                          <label className="flex min-h-9 items-center justify-between gap-3 rounded-xl bg-surface-container-high px-3 py-2 text-xs" data-builder-runtime-state-enabled="">
                            <span className="min-w-0">
                              <span className="block truncate font-medium">启用交互</span>
                              <span className="block truncate text-[0.64rem] text-on-surface-variant">关闭后按钮、输入、选择等控件会禁用。</span>
                            </span>
                            <Switch checked={selectedRuntimeState?.enabled ?? true} onCheckedChange={(enabled: any) => updateSelectedProps({ enabled })} />
                          </label>
                          <label className="flex min-h-9 items-center justify-between gap-3 rounded-xl bg-surface-container-high px-3 py-2 text-xs" data-builder-runtime-state-read-only="">
                            <span className="min-w-0">
                              <span className="block truncate font-medium">只读输入</span>
                              <span className="block truncate text-[0.64rem] text-on-surface-variant">
                                {selectedCanUseReadOnly ? "保留可复制/聚焦，但禁止编辑文本值。" : "当前控件类型不支持只读。"}
                              </span>
                            </span>
                            <Switch
                              checked={selectedRuntimeState?.readOnly ?? false}
                              disabled={!selectedCanUseReadOnly}
                              onCheckedChange={(readOnly: any) => updateSelectedProps({ readOnly })}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-outline-variant bg-surface-container p-2.5" data-builder-tab-order-editor="">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Label htmlFor="builder-selected-tab-order" className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">
                              Tab 顺序
                            </Label>
                            <p className="mt-1 text-[0.66rem] leading-4 text-on-surface-variant">
                              控制真实桌面表单中按 Tab 键时的焦点移动顺序；-1 表示跳过。
                            </p>
                          </div>
                          <Badge variant={selectedTabOrderEntry ? "secondary" : selectedCanUseTabOrder ? "outline" : "outline"} className="shrink-0">
                            {selectedTabOrderEntry ? `#${selectedTabOrderPosition}` : selectedCanUseTabOrder ? "跳过" : "不可聚焦"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-1.5">
                          <Input
                            id="builder-selected-tab-order"
                            type="number"
                            inputSize="sm"
                            min={-1}
                            max={999}
                            disabled={!selectedCanUseTabOrder}
                            data-builder-selected-tab-index=""
                            value={selectedItem.props.tabIndex ?? selectedTabOrderEntry?.tabIndex ?? ""}
                            placeholder={selectedCanUseTabOrder ? String(selectedTabOrderPosition || focusableTabOrderItems.length + 1) : "n/a"}
                            onChange={(event: any) => updateSelectedTabIndex(event.target.value)}
                          />
                          <Button
                            size="icon-sm"
                            variant="outline"
                            aria-label="Tab 顺序前移"
                            title="Tab 顺序前移"
                            disabled={!selectedTabOrderEntry}
                            data-builder-tab-order-move-previous=""
                            onClick={() => moveSelectedTabOrder(-1)}
                          >
                            <MoveUp aria-hidden />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="outline"
                            aria-label="Tab 顺序后移"
                            title="Tab 顺序后移"
                            disabled={!selectedTabOrderEntry}
                            data-builder-tab-order-move-next=""
                            onClick={() => moveSelectedTabOrder(1)}
                          >
                            <MoveDown aria-hidden />
                          </Button>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          <Button size="sm" variant="secondary" data-builder-tab-order-normalize="" onClick={normalizeTabOrderForFocusableItems}>
                            <Keyboard aria-hidden className="size-4" />
                            自动排序
                          </Button>
                          <Button
                            size="sm"
                            variant={tabOrderOverlayVisible ? "secondary" : "outline"}
                            data-builder-tab-order-toggle-overlay=""
                            onClick={() => setTabOrderOverlayVisible((visible: any) => !visible)}
                          >
                            <MousePointer2 aria-hidden className="size-4" />
                            {tabOrderOverlayVisible ? "隐藏编号" : "显示编号"}
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-outline-variant bg-surface-container p-2" data-builder-selected-properties-workflow="">
                        <div className="mb-2 flex items-center justify-between gap-2 px-1">
                          <div className="min-w-0">
                            <p className="truncate text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">选择工作流</p>
                            <p className="mt-0.5 text-[0.68rem] leading-4 text-on-surface-variant">{selectionStatusDetail}</p>
                          </div>
                          <Badge
                            variant={
                              selectionStatusTone === "attention"
                                ? "destructive"
                                : selectionStatusTone === "interactive" || selectionStatusTone === "ready"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="shrink-0"
                          >
                            {selectionStatusToneLabel}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {inspectorWorkflowSteps.map((step: any, index: any) => {
                            const StepIcon = step.icon;
                            return (
                              <button
                                key={step.id}
                                type="button"
                                data-builder-selected-properties-workflow-step={step.id}
                                disabled={step.disabled}
                                className={cn(
                                  "focus-ring group flex min-w-0 items-start gap-2 rounded-xl border px-2 py-2 text-left text-xs transition",
                                  step.tone === "primary" && "border-primary/40 bg-primary/10 text-on-surface",
                                  step.tone === "ready" && "border-outline-variant bg-surface-container-high text-on-surface hover:border-primary/30 hover:bg-primary/5",
                                  step.tone === "warning" && "border-destructive/30 bg-destructive/10 text-on-surface hover:border-destructive/50",
                                  step.tone === "danger" && "border-destructive/30 bg-surface-container-high text-destructive hover:bg-destructive/10",
                                  step.tone === "muted" && "border-outline-variant bg-surface-container-high text-on-surface-variant hover:border-outline hover:text-on-surface",
                                  step.disabled && "cursor-not-allowed opacity-55 hover:border-outline-variant hover:bg-surface-container-high hover:text-on-surface-variant",
                                )}
                                onClick={step.onAction}
                              >
                                <span
                                  className={cn(
                                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg",
                                    step.tone === "primary" && "bg-primary text-primary-foreground",
                                    (step.tone === "warning" || step.tone === "danger") && "bg-destructive/10 text-destructive",
                                    (step.tone === "ready" || step.tone === "muted") && "bg-surface-container-low text-primary",
                                  )}
                                >
                                  <StepIcon aria-hidden className="size-3.5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex min-w-0 items-center gap-1.5">
                                    <span className="truncate font-medium">{index + 1}. {step.title}</span>
                                    <span
                                      className={cn(
                                        "hidden size-1.5 shrink-0 rounded-full sm:inline-flex",
                                        step.tone === "primary" && "bg-primary",
                                        step.tone === "warning" && "bg-destructive",
                                        step.tone === "danger" && "bg-destructive",
                                        step.tone === "ready" && "bg-primary/70",
                                        step.tone === "muted" && "bg-outline",
                                      )}
                                    />
                                  </span>
                                  <span className="mt-0.5 block truncate text-[0.66rem] text-on-surface-variant">{step.actionLabel}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div
                        className="rounded-2xl border border-outline-variant bg-surface-container p-2.5"
                        data-builder-property-search-panel=""
                        data-builder-property-search-active={inspectorPropertyQueryActive ? "true" : "false"}
                      >
                        <div className="relative">
                          <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-on-surface-variant" />
                          <Input
                            inputSize="sm"
                            data-builder-property-search=""
                            aria-label="搜索控件属性"
                            value={inspectorPropertyQuery}
                            placeholder="搜索属性、字段名或当前值..."
                            className="pl-8 pr-8"
                            onChange={(event: any) => setInspectorPropertyQuery(event.target.value)}
                          />
                          {inspectorPropertyQuery ? (
                            <button
                              type="button"
                              className="focus-ring absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                              aria-label="清除属性搜索"
                              data-builder-property-search-reset=""
                              onClick={() => setInspectorPropertyQuery("")}
                            >
                              <X aria-hidden className="size-3.5" />
                            </button>
                          ) : null}
                        </div>
                        <div className="mt-2 flex min-w-0 items-center justify-between gap-2 text-[0.68rem] text-on-surface-variant">
                          <span className="min-w-0 truncate" data-builder-property-search-summary="">
                            {inspectorPropertyQueryActive
                              ? selectedFilteredPropertySchema.length > 0
                                ? `匹配 ${selectedFilteredPropertySchema.length} 个字段，点击结果可展开分组。`
                                : "没有匹配字段，可改用字段名、标签、类型或当前值。"
                              : `${selectedPropertySchema.length} 个字段 · ${selectedPropertyIssues.length} 个问题`}
                          </span>
                          <Badge variant={inspectorPropertyQueryActive ? "secondary" : "outline"} className="shrink-0" data-builder-property-search-count="">
                            {inspectorPropertyQueryActive
                              ? `${selectedFilteredPropertySchema.length}/${selectedPropertySchema.length}`
                              : selectedPropertyIssues.length > 0
                                ? `${selectedPropertyIssues.length} issues`
                                : "ready"}
                          </Badge>
                        </div>
                        {inspectorPropertyQueryActive ? (
                          selectedFilteredPropertySchema.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5" data-builder-property-filtered-fields="">
                              {selectedFilteredPropertySchema.slice(0, 10).map((field: any) => {
                                const sectionId = propertySectionForProp(field.prop);
                                const hasIssue = selectedPropertyIssueProps.has(field.prop);
                                return (
                                  <button
                                    key={`${String(field.prop)}-${field.label}-${sectionId}`}
                                    type="button"
                                    className={cn(
                                      "focus-ring inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-1 text-[0.68rem] transition",
                                      hasIssue
                                        ? "border-destructive/35 bg-destructive/10 text-destructive hover:bg-destructive/15"
                                        : "border-outline-variant bg-surface-container-high text-on-surface-variant hover:border-primary/30 hover:bg-primary/5 hover:text-on-surface",
                                    )}
                                    title={propertySchemaHint(field)}
                                    data-builder-property-filtered-field={String(field.prop)}
                                    data-builder-property-filtered-section={sectionId}
                                    onClick={() => openPropertySectionFromSearch(sectionId)}
                                  >
                                    {hasIssue ? <AlertTriangle aria-hidden className="size-3 shrink-0" /> : null}
                                    <span className="truncate">{field.label}</span>
                                    <span className="shrink-0 text-[0.58rem] opacity-70">{builderPropertySectionLabels[sectionId]}</span>
                                  </button>
                                );
                              })}
                              {selectedFilteredPropertySchema.length > 10 ? (
                                <span className="inline-flex items-center rounded-full border border-outline-variant bg-surface-container-high px-2 py-1 text-[0.68rem] text-on-surface-variant">
                                  +{selectedFilteredPropertySchema.length - 10}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <div className="mt-2 rounded-xl border border-dashed border-outline-variant p-3 text-center text-xs leading-5 text-on-surface-variant" data-builder-property-empty-state="">
                              没有匹配的属性字段。
                            </div>
                          )
                        ) : null}
                      </div>

                      <div className="grid grid-cols-5 gap-1.5" aria-label="属性分组" data-builder-property-section-filter="">
                        {builderPropertySectionOptions.map((section: any) => (
                          <Button
                            key={section.id}
                            type="button"
                            size="sm"
                            variant={openPropertySections[section.id] ? "secondary" : "outline"}
                            className={cn(
                              "h-7 min-w-0 gap-1 px-1.5 text-[0.68rem]",
                              inspectorPropertyQueryActive && selectedPropertySectionMatchCounts[section.id] === 0 && "opacity-50",
                            )}
                            data-builder-property-section-filter-hit={
                              inspectorPropertyQueryActive && selectedPropertySectionMatchCounts[section.id] > 0 ? "true" : "false"
                            }
                            onClick={() => togglePropertySection(section.id)}
                          >
                            <span className="truncate">{section.label}</span>
                            {inspectorPropertyQueryActive && selectedPropertySectionMatchCounts[section.id] > 0 ? (
                              <span className="shrink-0 rounded-full bg-primary/10 px-1 text-[0.56rem] text-primary">
                                {selectedPropertySectionMatchCounts[section.id]}
                              </span>
                            ) : null}
                          </Button>
                        ))}
                      </div>

                      <PropertySection
                        icon={Move}
                        title="布局"
                        description={activeBreakpoint === "desktop" ? "编辑基础坐标、尺寸和父容器。" : `正在编辑 ${activeBreakpoint} 断点覆盖。`}
                        badge={activeBreakpoint}
                        open={openPropertySections.layout}
                        onOpenChange={() => togglePropertySection("layout")}
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="X">
                            <Input
                              type="number"
                              inputSize="sm"
                              value={selectedItem.x}
                              onChange={(event: any) => updateSelectedLayout({ x: numberFromInput(event.target.value, selectedItem.x, 0, page.width) })}
                            />
                          </Field>
                          <Field label="Y">
                            <Input
                              type="number"
                              inputSize="sm"
                              value={selectedItem.y}
                              onChange={(event: any) => updateSelectedLayout({ y: numberFromInput(event.target.value, selectedItem.y, 0, page.height) })}
                            />
                          </Field>
                          <Field label="宽度">
                            <Input
                              type="number"
                              inputSize="sm"
                              value={selectedItem.width}
                              onChange={(event: any) => updateSelectedLayout({ width: numberFromInput(event.target.value, selectedItem.width, MIN_ITEM_WIDTH, page.width) })}
                            />
                          </Field>
                          <Field label="高度">
                            <Input
                              type="number"
                              inputSize="sm"
                              value={selectedItem.height}
                              onChange={(event: any) => updateSelectedLayout({ height: numberFromInput(event.target.value, selectedItem.height, MIN_ITEM_HEIGHT, page.height) })}
                            />
                          </Field>
                        </div>
                        <Field label="父容器">
                          <Select value={selectedItem.parentId ?? "__canvas"} onValueChange={updateSelectedParent}>
                            <SelectTrigger data-builder-parent-select="">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__canvas">画布</SelectItem>
                              {availableParentFrames.map((frame: any) => (
                                <SelectItem key={frame.id} value={frame.id}>
                                  {getItemSummary(frame)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        {activeBreakpoint !== "desktop" ? (
                          <Button size="sm" variant="ghost" onClick={resetSelectedBreakpointOverride} disabled={!selectedBreakpointOverride}>
                            <RotateCcw aria-hidden className="size-4" />
                            重置断点覆盖
                          </Button>
                        ) : null}
                        {selectedParentAutoLayout ? (
                          <p className="rounded-xl bg-surface-container-low p-2 text-xs leading-5 text-on-surface-variant">
                            当前控件由父 Frame 的自动布局控制，坐标主要作为保存参考。
                          </p>
                        ) : null}
                        {selectedConstraints ? (
                          <div className="grid grid-cols-4 gap-1.5">
                            <Button size="sm" variant={selectedConstraints.left ? "secondary" : "outline"} disabled={selectedParentAutoLayout} onClick={() => toggleSelectedConstraint("constraintLeft")}>
                              左
                            </Button>
                            <Button size="sm" variant={selectedConstraints.right ? "secondary" : "outline"} disabled={selectedParentAutoLayout} onClick={() => toggleSelectedConstraint("constraintRight")}>
                              右
                            </Button>
                            <Button size="sm" variant={selectedConstraints.top ? "secondary" : "outline"} disabled={selectedParentAutoLayout} onClick={() => toggleSelectedConstraint("constraintTop")}>
                              上
                            </Button>
                            <Button size="sm" variant={selectedConstraints.bottom ? "secondary" : "outline"} disabled={selectedParentAutoLayout} onClick={() => toggleSelectedConstraint("constraintBottom")}>
                              下
                            </Button>
                          </div>
                        ) : null}
                        {selectedItem.type === "frame" ? (
                          <div className="space-y-3 rounded-xl bg-surface-container-low p-2">
                            <Field label="Frame 布局模式">
                              <SegmentedControl
                                aria-label="Frame 布局模式"
                                value={frameLayoutMode(selectedItem)}
                                onValueChange={(value: any) => updateSelectedProps({ layoutMode: value as FrameLayoutMode })}
                                options={[
                                  { value: "free", label: "自由" },
                                  { value: "row", label: "行" },
                                  { value: "column", label: "列" },
                                  { value: "grid", label: "网格" },
                                ]}
                              />
                            </Field>
                            <div className="grid grid-cols-2 gap-2">
                              <Field label="间距">
                                <Input
                                  type="number"
                                  inputSize="sm"
                                  value={frameLayoutMetrics(selectedItem).gap}
                                  onChange={(event: any) => updateSelectedProps({ layoutGap: numberFromInput(event.target.value, frameLayoutMetrics(selectedItem).gap, 0, 80) })}
                                />
                              </Field>
                              <Field label="内边距">
                                <Input
                                  type="number"
                                  inputSize="sm"
                                  value={frameLayoutMetrics(selectedItem).padding}
                                  onChange={(event: any) => updateSelectedProps({ layoutPadding: numberFromInput(event.target.value, frameLayoutMetrics(selectedItem).padding, 0, 80) })}
                                />
                              </Field>
                            </div>
                          </div>
                        ) : null}
                      </PropertySection>

                      <PropertySection
                        icon={Type}
                        title="内容"
                        description="文本、图片和表单候选项。"
                        open={openPropertySections.content}
                        onOpenChange={() => togglePropertySection("content")}
                      >
                        {selectedItem.type === "image" ? (
                          <>
                            <Field label="绑定资源">
                              <Select
                                value={selectedItem.props.assetId || "__none"}
                                onValueChange={(value: any) => {
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
                                  {activeProject.assets.map((asset: any) => (
                                    <SelectItem key={asset.id} value={asset.id}>
                                      {asset.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </Field>
                            <Field label="图片适配">
                              <Select value={selectedItem.props.objectFit ?? "cover"} onValueChange={(value: any) => updateSelectedProps({ objectFit: value as ImageFit })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cover">覆盖</SelectItem>
                                  <SelectItem value="contain">完整显示</SelectItem>
                                  <SelectItem value="fill">拉伸填充</SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>
                            <Field label="替代文本">
                              <Input value={selectedItem.props.alt ?? ""} onChange={(event: any) => updateSelectedProps({ alt: event.target.value })} />
                            </Field>
                          </>
                        ) : null}
                        {"title" in selectedItem.props ? (
                          <Field label="标题">
                            <Input value={selectedItem.props.title ?? ""} onChange={(event: any) => updateSelectedProps({ title: event.target.value })} />
                          </Field>
                        ) : null}
                        {"label" in selectedItem.props ? (
                          <Field label="标签">
                            <Input data-builder-selected-label-input="" value={selectedItem.props.label ?? ""} onChange={(event: any) => updateSelectedProps({ label: event.target.value })} />
                          </Field>
                        ) : null}
                        {"value" in selectedItem.props ? (
                          <Field label="值">
                            <Input value={selectedItem.props.value ?? ""} onChange={(event: any) => updateSelectedProps({ value: event.target.value })} />
                          </Field>
                        ) : null}
                        {itemUsesOptions(selectedItem) ? (
                          <div className="grid grid-cols-1 gap-2">
                            <Field label="选项 A">
                              <Input value={selectedItem.props.optionA ?? ""} onChange={(event: any) => updateSelectedProps({ optionA: event.target.value })} />
                            </Field>
                            <Field label="选项 B">
                              <Input value={selectedItem.props.optionB ?? ""} onChange={(event: any) => updateSelectedProps({ optionB: event.target.value })} />
                            </Field>
                            <Field label="选项 C">
                              <Input value={selectedItem.props.optionC ?? ""} onChange={(event: any) => updateSelectedProps({ optionC: event.target.value })} />
                            </Field>
                          </div>
                        ) : null}
                        {"description" in selectedItem.props ? (
                          <Field label="说明">
                            <Textarea value={selectedItem.props.description ?? ""} onChange={(event: any) => updateSelectedProps({ description: event.target.value })} />
                          </Field>
                        ) : null}
                        {"placeholder" in selectedItem.props ? (
                          <Field label="占位文本">
                            <Input value={selectedItem.props.placeholder ?? ""} onChange={(event: any) => updateSelectedProps({ placeholder: event.target.value })} />
                          </Field>
                        ) : null}
                        {"helper" in selectedItem.props ? (
                          <Field label="辅助说明">
                            <Input value={selectedItem.props.helper ?? ""} onChange={(event: any) => updateSelectedProps({ helper: event.target.value })} />
                          </Field>
                        ) : null}
                      </PropertySection>

                      <PropertySection
                        icon={ToggleLeft}
                        title="State"
                        description="项目状态绑定、默认值和属性校验。"
                        badge={selectedPropertyIssues.length > 0 ? `${selectedPropertyIssues.length} issue(s)` : "ready"}
                        open={openPropertySections.state}
                        onOpenChange={() => togglePropertySection("state")}
                      >
                        {selectedBindableProps.length > 0 ? (
                          <div className="grid grid-cols-1 gap-2">
                            {selectedBindableProps.map((prop: any) => (
                              <Field key={prop.value} label={prop.label}>
                                <Select
                                  value={selectedItem.props.stateBindings?.[prop.value] || "__none"}
                                  onValueChange={(value: any) => updateSelectedStateBinding(prop.value, value === "__none" ? "" : value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__none">无状态</SelectItem>
                                    {activeProject.stateVariables.map((state: any) => (
                                      <SelectItem key={state.id} value={state.id}>
                                        {state.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </Field>
                            ))}
                          </div>
                        ) : (
                          <p className="rounded-xl bg-surface-container-low p-2 text-xs leading-5 text-on-surface-variant">当前控件没有可绑定的基础属性。</p>
                        )}
                        {selectedItem.type === "switch" || selectedItem.type === "checkbox" || selectedItem.type === "radio" ? (
                          <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                            <Label>默认选中</Label>
                            <Switch checked={Boolean(selectedItem.props.checked)} onCheckedChange={(checked: any) => updateSelectedProps({ checked })} />
                          </div>
                        ) : null}
                        {selectedPropertyIssues.length > 0 ? (
                          <div className="space-y-2">
                            {selectedPropertyIssues.slice(0, 2).map((issue: any) => (
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
                            {selectedPropertyAutoFixCount > 0 ? (
                              <Button size="sm" variant="secondary" onClick={applySelectedPropertyAutoFix}>
                                <Wand2 aria-hidden className="size-4" />
                                Fix {selectedPropertyAutoFixCount}
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </PropertySection>

                      <PropertySection
                        icon={Settings2}
                        title="Appearance"
                        description="视觉变体和控件尺寸。"
                        open={openPropertySections.appearance}
                        onOpenChange={() => togglePropertySection("appearance")}
                      >
                        {selectedItem.type === "button" || selectedItem.type === "badge" || selectedItem.type === "dialog" || selectedItem.type === "progress" ? (
                          <Field label="样式">
                            <Select value={selectedItem.props.variant ?? "default"} onValueChange={(value: any) => updateSelectedProps({ variant: value as ButtonVariant })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default">主要</SelectItem>
                                <SelectItem value="secondary">次要</SelectItem>
                                <SelectItem value="outline">描边</SelectItem>
                                <SelectItem value="ghost">幽灵</SelectItem>
                                <SelectItem value="destructive">危险</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                        ) : null}
                        {selectedItem.type === "button" ? (
                          <Field label="按钮尺寸">
                            <Select value={selectedItem.props.size ?? "md"} onValueChange={(value: any) => updateSelectedProps({ size: value as ControlSize })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sm">小</SelectItem>
                                <SelectItem value="md">中</SelectItem>
                                <SelectItem value="lg">大</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                        ) : null}
                        {selectedItem.type !== "button" && selectedItem.type !== "badge" && selectedItem.type !== "dialog" && selectedItem.type !== "progress" ? (
                          <p className="rounded-xl bg-surface-container-low p-2 text-xs leading-5 text-on-surface-variant">该控件暂时没有专属外观变体。</p>
                        ) : null}
                      </PropertySection>

                      <PropertySection
                        icon={Braces}
                        title="Actions"
                        description={selectedEventName ? `事件 ${selectedEventName} 绑定和常用图层动作。` : "当前控件没有可绑定事件。"}
                        badge={selectedEventCommand ? "bound" : selectedEventName ? "ready" : "none"}
                        open={openPropertySections.actions}
                        onOpenChange={() => togglePropertySection("actions")}
                      >
                        {selectedEventName ? (
                          <Field label="Rust command">
                            <Select
                              value={
                                selectedEventCommandId && activeProject.rustCommands.some((command: any) => command.id === selectedEventCommandId)
                                  ? selectedEventCommandId
                                  : "__none"
                              }
                              onValueChange={(value: any) => updateSelectedEventCommand(selectedEventName, value === "__none" ? "" : value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none">无命令</SelectItem>
                                {activeProject.rustCommands.map((command: any) => (
                                  <SelectItem key={command.id} value={command.id}>
                                    {sanitizeRustCommandName(command.name)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                        ) : null}
                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" variant="secondary" disabled={!selectedItem || !selectedEventName || !selectedEventCommand} onClick={runSelectedEventAndRevealLogs}>
                            <Play aria-hidden className="size-4" />
                            Run Event
                          </Button>
                          <Button size="sm" variant="secondary" onClick={openSelectedConnections}>
                            <Braces aria-hidden className="size-4" />
                            Details
                          </Button>
                          <Button size="sm" variant="outline" onClick={bringToFront}>
                            <MoveUp aria-hidden className="size-4" />
                            置顶
                          </Button>
                          <Button size="sm" variant="outline" onClick={sendToBack}>
                            <MoveDown aria-hidden className="size-4" />
                            置底
                          </Button>
                          <Button size="sm" variant="outline" onClick={duplicateSelected}>
                            <Copy aria-hidden className="size-4" />
                            复制
                          </Button>
                          <Button size="sm" variant="destructive" onClick={requestDeleteSelected}>
                            <Trash2 aria-hidden className="size-4" />
                            删除
                          </Button>
                        </div>
                      </PropertySection>
                    </section>
                  ) : null}

                  <section className="rounded-[22px] bg-surface-container-low p-3">
                    <div className="mb-3 flex items-center gap-2">
                      <FileJson aria-hidden className="size-4 text-primary" />
                      <h3 className="text-sm font-medium">页面设置</h3>
                    </div>
                    <div className="space-y-3">
                      <div
                        className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs"
                        data-builder-page-window-shell=""
                        data-builder-page-window-shell-synced={releaseWindowShellMatchesPage ? "true" : "false"}
                      >
                        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <span className="truncate font-medium text-on-surface">当前 UI 窗口外壳</span>
                              <Badge variant={releaseWindowShellMatchesPage ? "secondary" : "outline"}>
                                {releaseWindowShellMatchesPage ? "已同步" : "独立配置"}
                              </Badge>
                            </div>
                            <p className="mt-1 truncate text-on-surface-variant">
                              {pageWindowKindMeta?.label ?? page.windowKind} / {pageTitlebarStyleMeta?.label ?? page.titlebarStyle} · {Math.round(page.width)} x {Math.round(page.height)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={releaseWindowShellMatchesPage ? "ghost" : "secondary"}
                            className="shrink-0"
                            data-builder-sync-page-window-to-release=""
                            onClick={syncReleaseWindowFromActivePage}
                          >
                            <Save aria-hidden className="size-4" />
                            同步发布
                          </Button>
                        </div>
                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                          <div className="min-w-0 rounded-xl bg-surface-container-high px-3 py-2">
                            <span className="block text-[0.66rem] text-on-surface-variant">UI 文件</span>
                            <span className="mt-0.5 block truncate font-medium text-on-surface">
                              {page.title || activeFile.name}
                              {page.titlebarSubtitle ? ` · ${page.titlebarSubtitle}` : ""}
                            </span>
                          </div>
                          <div className="min-w-0 rounded-xl bg-surface-container-high px-3 py-2">
                            <span className="block text-[0.66rem] text-on-surface-variant">发布默认</span>
                            <span className="mt-0.5 block truncate font-medium text-on-surface">
                              {releaseWindowKindMeta?.label ?? activeProject.releaseConfig.windowKind} / {releaseTitlebarStyleMeta?.label ?? activeProject.releaseConfig.titlebarStyle}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2" data-builder-page-window-shell-preset-list="">
                          {pageWindowShellPresets.map((preset: any) => {
                            const active =
                              page.windowKind === preset.windowKind &&
                              page.titlebarStyle === normalizeReleaseTitlebarStyle(preset.titlebarStyle, preset.windowKind);
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                className={cn(
                                  "focus-ring min-w-0 rounded-xl border px-3 py-2 text-left transition-colors",
                                  active
                                    ? "border-primary bg-primary-container text-primary-container-foreground"
                                    : "border-outline-variant bg-surface-container-low hover:bg-surface-container-high",
                                )}
                                data-builder-page-window-shell-preset={preset.id}
                                data-builder-page-window-shell-preset-active={active ? "true" : "false"}
                                onClick={() => applyPageWindowShellPreset(preset.id)}
                              >
                                <span className="block truncate text-xs font-medium">{preset.label}</span>
                                <span className={cn("mt-0.5 block truncate text-[0.66rem]", active ? "text-primary-container-foreground/75" : "text-on-surface-variant")}>
                                  {preset.detail}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <Field label="页面名称">
                        <Input value={page.title} onChange={(event: any) => updatePage({ title: event.target.value })} />
                      </Field>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="窗体类型">
                          <Select
                            value={page.windowKind}
                            onValueChange={(windowKind: any) => updatePageWindowKind(windowKind as ReleaseWindowKind)}
                          >
                            <SelectTrigger data-builder-page-window-kind="" inputSize="sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {releaseWindowKinds.map((kind: any) => (
                                <SelectItem key={kind.value} value={kind.value}>
                                  {kind.label} · {kind.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="标题栏">
                          <Select
                            value={page.titlebarStyle}
                            onValueChange={(titlebarStyle: any) => updatePageTitlebarStyle(titlebarStyle as ReleaseTitlebarStyle)}
                            disabled={page.windowKind === "frameless"}
                          >
                            <SelectTrigger data-builder-page-titlebar-style="" inputSize="sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {releaseTitlebarStyles.map((style: any) => (
                                <SelectItem key={style.value} value={style.value}>
                                  {style.label} · {style.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                      <Field label="标题栏副标题">
                        <Input
                          inputSize="sm"
                          data-builder-page-titlebar-subtitle=""
                          value={page.titlebarSubtitle}
                          placeholder="例如：设置、工具窗口、对话框"
                          onChange={(event: any) => updatePage({ titlebarSubtitle: event.target.value })}
                        />
                      </Field>
                      <Field label="背景">
                        <Select value={page.background} onValueChange={(value: any) => updatePage({ background: value as CanvasBackground })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">网格</SelectItem>
                            <SelectItem value="soft">柔和</SelectItem>
                            <SelectItem value="plain">简洁</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="网格尺寸">
                          <Input
                            type="number"
                            inputSize="sm"
                            value={page.gridSize}
                            onChange={(event: any) => updatePage({ gridSize: numberFromInput(event.target.value, page.gridSize, 4, 32) })}
                          />
                        </Field>
                        <div className="flex items-end">
                          <label className="flex h-[var(--control-sm)] w-full items-center justify-between rounded-xl bg-surface-container-high px-3 text-xs">
                            自动保存
                            <Switch className="h-5 w-9 border" checked={page.autoSave} onCheckedChange={(autoSave: any) => updatePage({ autoSave })} />
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex h-[var(--control-sm)] items-center justify-between rounded-xl bg-surface-container-high px-3 text-xs">
                          显示网格
                          <Switch className="h-5 w-9 border" checked={page.showGrid} onCheckedChange={(showGrid: any) => updatePage({ showGrid })} />
                        </label>
                        <label
                          className="flex h-[var(--control-sm)] items-center justify-between rounded-xl bg-surface-container-high px-3 text-xs"
                          data-builder-canvas-show-rulers="page-settings"
                        >
                          显示标尺
                          <Switch className="h-5 w-9 border" checked={page.showRulers} onCheckedChange={(showRulers: any) => updatePage({ showRulers })} />
                        </label>
                      </div>
                    </div>
                  </section>

                  {selectedEventCommand || simulatorTrace.length > 0 ? (
                    <section className="space-y-3 rounded-[22px] bg-surface-container-low p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="mb-1 flex items-center gap-2">
                            <Braces aria-hidden className="size-4 text-primary" />
                            <h3 className="text-sm font-medium">事件运行记录</h3>
                          </div>
                          <p className="text-xs leading-5 text-on-surface-variant">
                            运行选中控件事件后，这里显示参数、Rust 返回和 state patch。
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant={simulatorTrace.length > 0 ? "secondary" : "outline"}>{simulatorTrace.length}</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          data-builder-simulate-event=""
                          onClick={runSelectedEventAndRevealLogs}
                          disabled={!selectedItem || !selectedEventName || !selectedEventCommand}
                        >
                          <Braces aria-hidden className="size-4" />
                          运行事件
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
                          重置记录
                        </Button>
                      </div>
                      <div className="rounded-2xl border border-outline-variant bg-surface-container p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">状态快照</span>
                          <span className="text-[0.68rem] text-on-surface-variant">{activeProject.stateVariables.length} states</span>
                        </div>
                        <div className="space-y-1">
                          {activeProject.stateVariables.map((state: any) => (
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
                          simulatorTrace.map((entry: any) => (
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
                                  patch {compactJson(Object.fromEntries(Object.entries(entry.patch).map(([stateId, value]) => [activeProject.stateVariables.find((state: any) => state.id === stateId)?.name ?? stateId, value])))}
                                </pre>
                              ) : null}
                              {entry.target ? <p className="mt-2 text-[0.68rem] text-on-surface-variant">Target: {entry.target}</p> : null}
                              <p className="mt-2 line-clamp-2 text-on-surface-variant">{entry.message}</p>
                            </article>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-outline-variant p-4 text-center text-xs leading-5 text-on-surface-variant">
                            选择一个绑定了 Rust command 的控件，然后点击运行事件。
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
                        {treeRows.map(({ item, depth }: any) => {
                          const canMoveUp = canMoveLayerWithinGroup(items, item, 1);
                          const canMoveDown = canMoveLayerWithinGroup(items, item, -1);
                          const runtimeState = builderItemRuntimeState(item);
                          return (
                            <div
                              key={item.id}
                              data-builder-object-tree-row={item.id}
                              data-builder-object-tree-row-visible={runtimeState.visible ? "true" : "false"}
                              data-builder-object-tree-row-locked={item.locked ? "true" : "false"}
                              className={cn(
                                "flex items-center gap-1 rounded-2xl p-1 transition-colors",
                                selectedIds.includes(item.id) ? "bg-secondary-container text-secondary-container-foreground" : "hover:bg-surface-container-high",
                                !runtimeState.visible && "opacity-70",
                              )}
                              style={{ paddingLeft: depth * 14 + 4 }}
                            >
                              <button
                                type="button"
                                className="focus-ring min-w-0 flex-1 rounded-xl px-2 py-2 text-left"
                                onClick={(event: any) => selectItem(item.id, event)}
                              >
                                <span className="block truncate text-xs font-medium">{getItemSummary(item)}</span>
                                <span className="block truncate text-[0.68rem] opacity-70">
                                  {item.name} · {item.parentId ? "child" : "root"} · z {item.z}
                                  {!runtimeState.visible ? " · hidden" : ""}
                                  {item.locked ? " · locked" : ""}
                                </span>
                              </button>
                              <button
                                type="button"
                                className="focus-ring rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                                data-builder-object-tree-visibility-toggle={item.id}
                                aria-label={runtimeState.visible ? "运行态隐藏控件" : "运行态显示控件"}
                                title={runtimeState.visible ? "运行态隐藏控件" : "运行态显示控件"}
                                onClick={() => toggleItemRuntimeVisibility(item.id)}
                              >
                                {runtimeState.visible ? <Eye aria-hidden className="size-3.5" /> : <EyeOff aria-hidden className="size-3.5" />}
                              </button>
                              <button
                                type="button"
                                className="focus-ring rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                                data-builder-object-tree-lock-toggle={item.id}
                                aria-label={item.locked ? "解锁控件" : "锁定控件"}
                                title={item.locked ? "解锁控件" : "锁定控件"}
                                onClick={() => toggleItemLockFromNavigator(item.id)}
                              >
                                {item.locked ? <Lock aria-hidden className="size-3.5" /> : <LockOpen aria-hidden className="size-3.5" />}
                              </button>
                              <button
                                type="button"
                                className="focus-ring rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                                aria-label="图层上移"
                                title={layerMoveTitle(item, 1)}
                                disabled={!canMoveUp}
                                onClick={() => moveLayer(item.id, 1)}
                              >
                                <MoveUp aria-hidden className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                className="focus-ring rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                                aria-label="图层下移"
                                title={layerMoveTitle(item, -1)}
                                disabled={!canMoveDown}
                                onClick={() => moveLayer(item.id, -1)}
                              >
                                <MoveDown aria-hidden className="size-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  {selectedItems.length > 1 ? (
                    <section className="space-y-4 rounded-[22px] bg-surface-container-low p-3" data-builder-multi-select-inspector="">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-medium">批量选择</h3>
                          <p className="mt-1 truncate text-xs text-on-surface-variant">{selectedItems.length} 个控件已选中</p>
                        </div>
                        <Badge variant="secondary">{selectedItems.filter((item: any) => item.locked).length} 个已锁定</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-[0.68rem]">
                        {[
                          ["选区", selectedCanvasBounds ? `${Math.round(selectedCanvasBounds.width)} x ${Math.round(selectedCanvasBounds.height)}` : "-"],
                          ["类型", selectedBatchTypeSummary || "混合"],
                          ["焦点", `${selectedBatchRuntimeSummary.focusableCount}/${selectedItems.length}`],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0 rounded-xl bg-surface-container-high px-2 py-2">
                            <p className="truncate font-medium text-on-surface">{value}</p>
                            <p className="mt-0.5 truncate text-on-surface-variant">{label}</p>
                          </div>
                        ))}
                      </div>

                      <div
                        className="rounded-2xl border border-outline-variant bg-surface-container p-2.5"
                        data-builder-multi-select-layout-tools=""
                        data-builder-multi-select-layout-movable-count={selectedBatchLayoutSummary.movableCount}
                        data-builder-multi-select-layout-locked-count={selectedBatchLayoutSummary.lockedCount}
                        data-builder-multi-select-layout-parent-managed-count={selectedBatchLayoutSummary.parentManagedCount}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">批量布局</p>
                            <p className="mt-1 truncate font-mono text-[0.66rem] text-on-surface-variant" data-builder-multi-select-layout-bounds="">
                              {selectedBatchLayoutSummary.boundsLabel}
                            </p>
                          </div>
                          <Badge variant={selectedBatchLayoutSummary.distributeReady ? "secondary" : "outline"} data-builder-multi-select-layout-spacing-state="">
                            {selectedBatchLayoutSummary.spacingLabel}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-[0.68rem]" data-builder-multi-select-layout-summary="">
                          {[
                            ["可移动", selectedBatchLayoutSummary.movableCount],
                            ["锁定", selectedBatchLayoutSummary.lockedCount],
                            ["自动布局", selectedBatchLayoutSummary.parentManagedCount],
                          ].map(([label, value]) => (
                            <div key={label} className="min-w-0 rounded-xl bg-surface-container-high px-2 py-2">
                              <p className="truncate font-medium text-on-surface">{value}</p>
                              <p className="mt-0.5 truncate text-on-surface-variant">{label}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 grid grid-cols-6 gap-1.5" data-builder-multi-select-align-tools="">
                          <Button size="icon-sm" variant="secondary" aria-label="左对齐" title="左对齐" data-builder-multi-select-align="left" onClick={() => alignSelected("left")}>
                            <AlignHorizontalJustifyStart aria-hidden />
                          </Button>
                          <Button size="icon-sm" variant="secondary" aria-label="水平居中对齐" title="水平居中对齐" data-builder-multi-select-align="center" onClick={() => alignSelected("center")}>
                            <AlignHorizontalJustifyCenter aria-hidden />
                          </Button>
                          <Button size="icon-sm" variant="secondary" aria-label="右对齐" title="右对齐" data-builder-multi-select-align="right" onClick={() => alignSelected("right")}>
                            <AlignHorizontalJustifyEnd aria-hidden />
                          </Button>
                          <Button size="icon-sm" variant="secondary" aria-label="顶部对齐" title="顶部对齐" data-builder-multi-select-align="top" onClick={() => alignSelected("top")}>
                            <AlignVerticalJustifyStart aria-hidden />
                          </Button>
                          <Button size="icon-sm" variant="secondary" aria-label="垂直居中对齐" title="垂直居中对齐" data-builder-multi-select-align="middle" onClick={() => alignSelected("middle")}>
                            <AlignVerticalJustifyCenter aria-hidden />
                          </Button>
                          <Button size="icon-sm" variant="secondary" aria-label="底部对齐" title="底部对齐" data-builder-multi-select-align="bottom" onClick={() => alignSelected("bottom")}>
                            <AlignVerticalJustifyEnd aria-hidden />
                          </Button>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1.5" data-builder-multi-select-distribute-tools="">
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-multi-select-distribute="horizontal"
                            disabled={!selectedBatchLayoutSummary.distributeReady}
                            onClick={() => distributeSelected("horizontal")}
                          >
                            <AlignHorizontalJustifyCenter aria-hidden className="size-4" />
                            水平等距
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-multi-select-distribute="vertical"
                            disabled={!selectedBatchLayoutSummary.distributeReady}
                            onClick={() => distributeSelected("vertical")}
                          >
                            <AlignVerticalJustifyCenter aria-hidden className="size-4" />
                            垂直等距
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-outline-variant bg-surface-container p-2.5" data-builder-multi-select-size-editor="">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">批量尺寸</p>
                            <p className="mt-1 truncate text-[0.66rem] text-on-surface-variant">统一所选控件宽高，或按首个控件匹配。</p>
                          </div>
                          <Badge variant="outline">{activeBreakpoint}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="宽">
                            <Input
                              inputSize="sm"
                              data-builder-multi-select-width=""
                              value={selectedBatchCommonWidth ?? ""}
                              placeholder={selectedCanvasBounds ? `混合 / ${Math.round(selectedCanvasBounds.width)}` : "混合"}
                              onChange={(event: any) => updateSelectedBatchSize("width", event.target.value)}
                            />
                          </Field>
                          <Field label="高">
                            <Input
                              inputSize="sm"
                              data-builder-multi-select-height=""
                              value={selectedBatchCommonHeight ?? ""}
                              placeholder={selectedCanvasBounds ? `混合 / ${Math.round(selectedCanvasBounds.height)}` : "混合"}
                              onChange={(event: any) => updateSelectedBatchSize("height", event.target.value)}
                            />
                          </Field>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-1.5">
                          <Button size="sm" variant="ghost" data-builder-multi-select-match-width="" onClick={() => matchSelectedSize("width")}>
                            等宽
                          </Button>
                          <Button size="sm" variant="ghost" data-builder-multi-select-match-height="" onClick={() => matchSelectedSize("height")}>
                            等高
                          </Button>
                          <Button size="sm" variant="ghost" data-builder-multi-select-match-size="" onClick={() => matchSelectedSize("both")}>
                            等尺寸
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-outline-variant bg-surface-container p-2.5" data-builder-multi-select-runtime-state="">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">批量状态</p>
                            <p className="mt-1 truncate text-[0.66rem] text-on-surface-variant">锁定、运行态可见、启用和只读会写入生成 exe。</p>
                          </div>
                          <Badge variant={selectedBatchRuntimeSummary.lockedCount > 0 ? "outline" : "secondary"}>
                            {selectedBatchRuntimeSummary.lockedCount} locked
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2" data-builder-multi-select-locks="">
                          <Button size="sm" variant="secondary" onClick={() => setSelectedLockState(true)}>
                            <Lock aria-hidden className="size-4" />
                            全部锁定
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedLockState(false)}>
                            <LockOpen aria-hidden className="size-4" />
                            全部解锁
                          </Button>
                        </div>
                        <div className="mt-2 space-y-1.5">
                          <label className="flex min-h-9 items-center justify-between gap-3 rounded-xl bg-surface-container-high px-3 py-2 text-xs" data-builder-multi-select-visible="">
                            <span className="min-w-0">
                              <span className="block truncate font-medium">运行态可见</span>
                              <span className="block truncate text-[0.64rem] text-on-surface-variant">{selectedBatchRuntimeSummary.visibleCount}/{selectedItems.length} 可见</span>
                            </span>
                            <Switch
                              checked={selectedBatchRuntimeSummary.visibleCount === selectedItems.length}
                              onCheckedChange={(visible: any) => setSelectedRuntimeState({ visible })}
                            />
                          </label>
                          <label className="flex min-h-9 items-center justify-between gap-3 rounded-xl bg-surface-container-high px-3 py-2 text-xs" data-builder-multi-select-enabled="">
                            <span className="min-w-0">
                              <span className="block truncate font-medium">启用交互</span>
                              <span className="block truncate text-[0.64rem] text-on-surface-variant">
                                {selectedBatchRuntimeSummary.enabledCount}/{selectedBatchRuntimeSummary.focusableCount} 可交互
                              </span>
                            </span>
                            <Switch
                              checked={selectedBatchRuntimeSummary.focusableCount > 0 && selectedBatchRuntimeSummary.enabledCount === selectedBatchRuntimeSummary.focusableCount}
                              disabled={selectedBatchRuntimeSummary.focusableCount === 0}
                              onCheckedChange={(enabled: any) => setSelectedRuntimeState({ enabled })}
                            />
                          </label>
                          <label className="flex min-h-9 items-center justify-between gap-3 rounded-xl bg-surface-container-high px-3 py-2 text-xs" data-builder-multi-select-read-only="">
                            <span className="min-w-0">
                              <span className="block truncate font-medium">只读输入</span>
                              <span className="block truncate text-[0.64rem] text-on-surface-variant">
                                {selectedBatchRuntimeSummary.readOnlyCount}/{selectedBatchRuntimeSummary.readOnlyCapableCount} 只读
                              </span>
                            </span>
                            <Switch
                              checked={
                                selectedBatchRuntimeSummary.readOnlyCapableCount > 0 &&
                                selectedBatchRuntimeSummary.readOnlyCount === selectedBatchRuntimeSummary.readOnlyCapableCount
                              }
                              disabled={selectedBatchRuntimeSummary.readOnlyCapableCount === 0}
                              onCheckedChange={(readOnly: any) => setSelectedRuntimeState({ readOnly })}
                            />
                          </label>
                        </div>
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
                    <section className="hidden" aria-hidden="true">
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
                          <p className="truncate text-xs font-medium">断点</p>
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
                            <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">属性结构</h4>
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
                                selectedPropertyIssues.some((issue: any) => issue.severity === "error")
                                  ? "destructive"
                                  : selectedPropertyIssues.length > 0
                                    ? "outline"
                                    : "secondary"
                              }
                            >
                              {selectedPropertyIssues.some((issue: any) => issue.severity === "error")
                                ? "error"
                                : selectedPropertyIssues.length > 0
                                  ? "warning"
                                  : "ready"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPropertySchema.slice(0, 8).map((field: any) => (
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
                            {selectedPropertyIssues.slice(0, 4).map((issue: any) => (
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
                                <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">依赖影响</h4>
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
                            {selectedControlReverseDependency.scopeIds.slice(0, 4).map((scopeId: any) => (
                              <span key={scopeId} className="rounded-full bg-surface-container-low px-2 py-1 text-[0.68rem] text-on-surface-variant">
                                {scopeId}
                              </span>
                            ))}
                          </div>
                          {selectedControlReverseDependency.affectedPaths.length > 0 ? (
                            <div className="space-y-1">
                              {selectedControlReverseDependency.affectedPaths.slice(0, 2).map((path: any) => (
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
                            onChange={(event: any) => updateSelectedLayout({ x: numberFromInput(event.target.value, selectedItem.x, 0, page.width) })}
                          />
                        </Field>
                        <Field label="Y">
                          <Input
                            type="number"
                            inputSize="sm"
                            value={selectedItem.y}
                            onChange={(event: any) => updateSelectedLayout({ y: numberFromInput(event.target.value, selectedItem.y, 0, page.height) })}
                          />
                        </Field>
                        <Field label="宽度">
                          <Input
                            type="number"
                            inputSize="sm"
                            value={selectedItem.width}
                            onChange={(event: any) => updateSelectedLayout({ width: numberFromInput(event.target.value, selectedItem.width, MIN_ITEM_WIDTH, page.width) })}
                          />
                        </Field>
                        <Field label="高度">
                          <Input
                            type="number"
                            inputSize="sm"
                            value={selectedItem.height}
                            onChange={(event: any) => updateSelectedLayout({ height: numberFromInput(event.target.value, selectedItem.height, MIN_ITEM_HEIGHT, page.height) })}
                          />
                        </Field>
                      </div>

                      <Field label="父容器">
                        <Select value={selectedItem.parentId ?? "__canvas"} onValueChange={updateSelectedParent}>
                          <SelectTrigger data-builder-parent-select="">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__canvas">画布</SelectItem>
                            {availableParentFrames.map((frame: any) => (
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
                              <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">约束</h4>
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
                              左
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={selectedConstraints.right ? "secondary" : "outline"}
                              disabled={selectedParentAutoLayout}
                              onClick={() => toggleSelectedConstraint("constraintRight")}
                            >
                              右
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={selectedConstraints.top ? "secondary" : "outline"}
                              disabled={selectedParentAutoLayout}
                              onClick={() => toggleSelectedConstraint("constraintTop")}
                            >
                              上
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={selectedConstraints.bottom ? "secondary" : "outline"}
                              disabled={selectedParentAutoLayout}
                              onClick={() => toggleSelectedConstraint("constraintBottom")}
                            >
                              下
                            </Button>
                          </div>
                        </section>
                      ) : null}

                      {selectedItem.type === "frame" ? (
                        <section className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Frame 布局</h4>
                              <p className="mt-1 text-xs text-on-surface-variant">控制子控件的排列方式。</p>
                            </div>
                            <Badge variant={frameLayoutMode(selectedItem) === "free" ? "outline" : "secondary"}>{frameLayoutMode(selectedItem)}</Badge>
                          </div>
                          <Field label="布局模式">
                            <SegmentedControl
                              aria-label="Frame 布局模式"
                              value={frameLayoutMode(selectedItem)}
                              onValueChange={(value: any) => updateSelectedProps({ layoutMode: value as FrameLayoutMode })}
                              options={[
                                  { value: "free", label: "自由" },
                                  { value: "row", label: "行" },
                                  { value: "column", label: "列" },
                                  { value: "grid", label: "网格" },
                              ]}
                            />
                          </Field>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="间距">
                              <Input
                                type="number"
                                inputSize="sm"
                                value={frameLayoutMetrics(selectedItem).gap}
                                onChange={(event: any) => updateSelectedProps({ layoutGap: numberFromInput(event.target.value, frameLayoutMetrics(selectedItem).gap, 0, 80) })}
                              />
                            </Field>
                            <Field label="内边距">
                              <Input
                                type="number"
                                inputSize="sm"
                                value={frameLayoutMetrics(selectedItem).padding}
                                onChange={(event: any) =>
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
                                onChange={(event: any) =>
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
                              onValueChange={(value: any) => {
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
                                {activeProject.assets.map((asset: any) => (
                                  <SelectItem key={asset.id} value={asset.id}>
                                    {asset.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="图片适配">
                            <Select value={selectedItem.props.objectFit ?? "cover"} onValueChange={(value: any) => updateSelectedProps({ objectFit: value as ImageFit })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cover">覆盖</SelectItem>
                                <SelectItem value="contain">完整显示</SelectItem>
                                <SelectItem value="fill">拉伸填充</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="替代文本">
                            <Input value={selectedItem.props.alt ?? ""} onChange={(event: any) => updateSelectedProps({ alt: event.target.value })} />
                          </Field>
                        </>
                      ) : null}

                      {"title" in selectedItem.props ? (
                        <Field label="标题">
                          <Input value={selectedItem.props.title ?? ""} onChange={(event: any) => updateSelectedProps({ title: event.target.value })} />
                        </Field>
                      ) : null}

                      {"label" in selectedItem.props ? (
                        <Field label="标签">
                          <Input value={selectedItem.props.label ?? ""} onChange={(event: any) => updateSelectedProps({ label: event.target.value })} />
                        </Field>
                      ) : null}

                      {"value" in selectedItem.props ? (
                        <Field label="值">
                          <Input value={selectedItem.props.value ?? ""} onChange={(event: any) => updateSelectedProps({ value: event.target.value })} />
                        </Field>
                      ) : null}

                      {itemUsesOptions(selectedItem) ? (
                        <section className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">选项</h4>
                              <p className="mt-1 text-xs text-on-surface-variant">候选项会写入生成 app 的控件内容。</p>
                            </div>
                            <Badge variant="outline">{selectOptionsForItem(selectedItem).length} 个选项</Badge>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <Field label="选项 A">
                              <Input value={selectedItem.props.optionA ?? ""} onChange={(event: any) => updateSelectedProps({ optionA: event.target.value })} />
                            </Field>
                            <Field label="选项 B">
                              <Input value={selectedItem.props.optionB ?? ""} onChange={(event: any) => updateSelectedProps({ optionB: event.target.value })} />
                            </Field>
                            <Field label="选项 C">
                              <Input value={selectedItem.props.optionC ?? ""} onChange={(event: any) => updateSelectedProps({ optionC: event.target.value })} />
                            </Field>
                          </div>
                        </section>
                      ) : null}

                      {"description" in selectedItem.props ? (
                        <Field label="说明">
                          <Textarea value={selectedItem.props.description ?? ""} onChange={(event: any) => updateSelectedProps({ description: event.target.value })} />
                        </Field>
                      ) : null}

                      {"placeholder" in selectedItem.props ? (
                        <Field label="占位文本">
                          <Input value={selectedItem.props.placeholder ?? ""} onChange={(event: any) => updateSelectedProps({ placeholder: event.target.value })} />
                        </Field>
                      ) : null}

                      {"helper" in selectedItem.props ? (
                        <Field label="辅助说明">
                          <Input value={selectedItem.props.helper ?? ""} onChange={(event: any) => updateSelectedProps({ helper: event.target.value })} />
                        </Field>
                      ) : null}

                      {selectedBindableProps.length > 0 ? (
                        <section className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">状态绑定</h4>
                              <p className="mt-1 text-xs text-on-surface-variant">将控件属性绑定到项目级共享状态。</p>
                            </div>
                            <Badge variant="outline">{activeProject.stateVariables.length} 个状态</Badge>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedBindableProps.map((prop: any) => (
                              <Field key={prop.value} label={prop.label}>
                                <Select
                                  value={selectedItem.props.stateBindings?.[prop.value] || "__none"}
                                  onValueChange={(value: any) => updateSelectedStateBinding(prop.value, value === "__none" ? "" : value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__none">无状态</SelectItem>
                                    {activeProject.stateVariables.map((state: any) => (
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

                      {selectedItem.type === "button" || selectedItem.type === "badge" || selectedItem.type === "dialog" || selectedItem.type === "progress" ? (
                        <Field label="样式">
                          <Select value={selectedItem.props.variant ?? "default"} onValueChange={(value: any) => updateSelectedProps({ variant: value as ButtonVariant })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">主要</SelectItem>
                              <SelectItem value="secondary">次要</SelectItem>
                              <SelectItem value="outline">描边</SelectItem>
                              <SelectItem value="ghost">幽灵</SelectItem>
                              <SelectItem value="destructive">危险</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      ) : null}

                      {selectedItem.type === "button" ? (
                        <Field label="按钮尺寸">
                          <Select value={selectedItem.props.size ?? "md"} onValueChange={(value: any) => updateSelectedProps({ size: value as ControlSize })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sm">小</SelectItem>
                              <SelectItem value="md">中</SelectItem>
                              <SelectItem value="lg">大</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      ) : null}

                      {selectedEventName ? (
                        <Field label="事件绑定">
                          <Select
                            value={
                              selectedEventCommandId && activeProject.rustCommands.some((command: any) => command.id === selectedEventCommandId)
                                ? selectedEventCommandId
                                : "__none"
                            }
                            onValueChange={(value: any) => updateSelectedEventCommand(selectedEventName, value === "__none" ? "" : value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">无命令</SelectItem>
                              {activeProject.rustCommands.map((command: any) => (
                                <SelectItem key={command.id} value={command.id}>
                                  {sanitizeRustCommandName(command.name)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-high p-3">
                            <div className="min-w-0">
                              <Label className="text-xs font-medium">命令参数</Label>
                              <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                                {selectedEventCommandArgs.length > 0
                                  ? `触发时会传入 ${selectedEventCommandArgs.length} 个命名参数。`
                                  : "当前 Rust command 没有参数。"}
                              </p>
                            </div>
                            <Switch
                              checked={selectedEventCommandArgs.length > 0 || Boolean(selectedEventBinding?.passValue && selectedEventCommand?.acceptsValue)}
                              disabled={selectedEventCommandArgs.length > 0 || !selectedEventCommand?.acceptsValue}
                              onCheckedChange={(passValue: any) => updateSelectedEventBinding(selectedEventName, { passValue })}
                            />
                          </div>
                          {selectedEventCommand?.acceptsValue ? (
                            <div className="space-y-3 rounded-xl bg-surface-container-high p-3">
                              <Field label="载荷模式">
                                <Select
                                  value={selectedEventBinding?.payloadMode ?? "value"}
                                  disabled={!selectedEventBinding?.passValue || selectedEventCommandArgs.length > 0}
                                  onValueChange={(payloadMode: any) =>
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
                                    <SelectItem value="value">当前值</SelectItem>
                                    <SelectItem value="json">JSON 载荷</SelectItem>
                                  </SelectContent>
                                </Select>
                              </Field>
                              {selectedEventBinding?.passValue && selectedEventBinding.payloadMode === "json" ? (
                                <div className="grid grid-cols-2 gap-2">
                                  {eventPayloadFields.map((field: any) => (
                                    <label
                                      key={field.value}
                                      className="flex min-w-0 items-start gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-2 text-xs"
                                    >
                                      <Checkbox
                                        className="mt-0.5 size-4"
                                        checked={eventPayloadFieldSelection(selectedEventBinding).includes(field.value)}
                                        onCheckedChange={(checked: any) =>
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
                                    ? "多参数命令使用命令属性里的来源映射；载荷模式仅用于旧的单 value 参数。"
                                    : "默认传入控件的当前 value/checked。切到 JSON 载荷后可把事件上下文和 state 快照一起传给 Rust。"}
                                </p>
                              )}
                            </div>
                          ) : null}
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="结果目标">
                              <Select
                                value={selectedEventBinding?.resultTargetItemId || "__none"}
                                onValueChange={(value: any) =>
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
                                  <SelectItem value="__none">无</SelectItem>
                                  {eventResultTargets.map((item: any) => (
                                    <SelectItem key={item.id} value={item.id}>
                                      {getItemSummary(item)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </Field>
                            <Field label="目标属性">
                              <Select
                                value={selectedEventBinding?.resultTargetProp || "__none"}
                                disabled={!selectedEventBinding?.resultTargetItemId}
                                onValueChange={(value: any) =>
                                  updateSelectedEventBinding(selectedEventName, {
                                    resultTargetProp: value === "__none" ? undefined : (value as BuilderResultTargetProp),
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none">无</SelectItem>
                                  {eventResultTargetProps.map((prop: any) => (
                                    <SelectItem key={prop.value} value={prop.value}>
                                      {prop.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </Field>
                          </div>
                          <Field label="结果状态">
                            <Select
                              value={selectedEventBinding?.resultStateId || "__none"}
                              onValueChange={(value: any) => updateSelectedEventBinding(selectedEventName, { resultStateId: value === "__none" ? "" : value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none">无状态</SelectItem>
                                {activeProject.stateVariables.map((state: any) => (
                                  <SelectItem key={state.id} value={state.id}>
                                    {state.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-high p-3">
                            <div className="min-w-0">
                              <Label className="text-xs font-medium">应用 JSON 状态 patch</Label>
                              <p className="mt-1 text-xs leading-5 text-on-surface-variant">Rust 返回对象时，用 key 匹配 state name/id 并批量更新。</p>
                            </div>
                            <Switch
                              checked={Boolean(selectedEventBinding?.applyJsonStatePatch)}
                              onCheckedChange={(applyJsonStatePatch: any) => updateSelectedEventBinding(selectedEventName, { applyJsonStatePatch })}
                            />
                          </div>
                          <p className="text-xs leading-5 text-on-surface-variant">
                            生成 app 后，控件触发 <span className="font-mono">{selectedEventName}</span> 时会通过 Tauri invoke 调用绑定的 Rust command。
                          </p>
                        </Field>
                      ) : null}

                      {selectedItem.type === "switch" || selectedItem.type === "checkbox" || selectedItem.type === "radio" ? (
                        <div className="flex items-center justify-between rounded-xl bg-surface-container-high p-3">
                          <Label>默认选中</Label>
                          <Switch checked={Boolean(selectedItem.props.checked)} onCheckedChange={(checked: any) => updateSelectedProps({ checked })} />
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
                    <PanelTitle icon={Braces} title="连接" description="把控件事件绑定到 Rust command，并设置结果回写。" />
                    {selectedItem && selectedEventName ? (
                      <div className="space-y-4 rounded-[22px] bg-surface-container-low p-3">
                        <div className="rounded-2xl border border-outline-variant bg-surface-container p-3">
                          <p className="truncate text-sm font-medium">{getItemSummary(selectedItem)}</p>
                          <p className="mt-1 text-xs text-on-surface-variant">
                            {selectedItem.name} · {selectedItem.type} · 事件 {selectedEventName}
                          </p>
                        </div>
                        <Field label="Rust 命令">
                          <Select
                            value={
                              selectedEventCommandId && activeProject.rustCommands.some((command: any) => command.id === selectedEventCommandId)
                                ? selectedEventCommandId
                                : "__none"
                            }
                            onValueChange={(value: any) => updateSelectedEventCommand(selectedEventName, value === "__none" ? "" : value)}
                          >
                            <SelectTrigger data-builder-inspector-event-command="">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">无命令</SelectItem>
                              {activeProject.rustCommands.map((command: any) => (
                                <SelectItem key={command.id} value={command.id}>
                                  {sanitizeRustCommandName(command.name)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            size="sm"
                            data-builder-connection-simulate=""
                            onClick={runSelectedEventAndRevealLogs}
                            disabled={!selectedEventCommand}
                          >
                            <Play aria-hidden className="size-4" />
                            模拟
                          </Button>
                          <Button size="sm" variant="secondary" data-builder-connection-new-command="" onClick={() => createAndBindBackendIntegrationCommand()}>
                            <Plus aria-hidden className="size-4" />
                            绑定新命令
                          </Button>
                          <Button size="sm" variant="ghost" data-builder-connection-go-slot="" onClick={() => goToSlotForItem(selectedItem)}>
                            <CornerDownRight aria-hidden className="size-4" />
                            槽函数
                          </Button>
                        </div>
                        <div className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs" data-builder-connection-map="">
                          <div className="mb-3 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-on-surface">连接映射</p>
                              <p className="mt-1 line-clamp-2 text-[0.68rem] leading-4 text-on-surface-variant">
                                {selectedEventCommand
                                  ? `${selectedEventName} -> ${sanitizeRustCommandName(selectedEventCommand.name)}`
                                  : `${selectedEventName} 没有 Rust 命令`}
                              </p>
                            </div>
                            <Badge variant={selectedEventCommand ? "secondary" : "outline"}>{selectedEventCommand ? "已绑定" : "未绑定"}</Badge>
                          </div>
                          <div className="grid gap-2">
                            <div className="rounded-xl bg-surface-container-high px-3 py-2">
                              <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">输入</p>
                              <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface">{selectedConnectionInputSummary}</p>
                            </div>
                            <div className="rounded-xl bg-surface-container-high px-3 py-2">
                              <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">输出</p>
                              <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface">{selectedConnectionOutputSummary}</p>
                            </div>
                          </div>
                          <div className="mt-3 rounded-xl border border-outline-variant bg-surface-container-high px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">验证</p>
                                <p className="mt-1 line-clamp-2 text-xs leading-4 text-on-surface-variant">{selectedConnectionVerificationDetail}</p>
                              </div>
                              <Badge variant={selectedConnectionVerificationVariant}>{selectedConnectionVerificationLabel}</Badge>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              <Button size="sm" variant="secondary" disabled={!selectedEventCommand} onClick={runSelectedEventAndRevealLogs}>
                                <Play aria-hidden className="size-4" />
                                模拟
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => goToSlotForItem(selectedItem)}>
                                <CornerDownRight aria-hidden className="size-4" />
                                槽函数
                              </Button>
                              <Button size="sm" variant="ghost" disabled={!selectedEventCommand} onClick={revealSelectedConnectionLogs}>
                                <FileJson aria-hidden className="size-4" />
                                日志
                              </Button>
                            </div>
                          </div>
                        </div>

                        <section className="space-y-3 rounded-2xl border border-outline-variant bg-surface-container p-3" data-builder-connection-input="">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">输入载荷</h4>
                              <p className="mt-1 truncate text-xs text-on-surface-variant">{selectedConnectionInputSummary}</p>
                            </div>
                            <Badge variant="outline">{selectedEventCommandArgs.length || (selectedEventBinding?.passValue ? 1 : 0)} arg</Badge>
                          </div>
                          {selectedEventCommandArgs.length > 0 ? (
                            <div className="space-y-1.5">
                              {selectedEventCommandArgs.map((arg: any) => (
                                <div key={arg.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-xl bg-surface-container-high px-3 py-2 text-xs">
                                  <div className="min-w-0">
                                    <p className="truncate font-mono text-on-surface">{arg.name}</p>
                                    <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">{arg.source}</p>
                                  </div>
                                  <Badge variant="outline">{arg.type}</Badge>
                                </div>
                              ))}
                              <Button size="sm" variant="ghost" className="w-full" onClick={openSelectedConnectionTarget}>
                                <Braces aria-hidden className="size-4" />
                                Edit command args
                              </Button>
                            </div>
                          ) : selectedEventCommand ? (
                            <>
                              <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-high p-3">
                                <div className="min-w-0">
                                  <Label className="text-xs font-medium">传入控件值</Label>
                                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                                    {selectedEventCommand.acceptsValue ? "value / checked" : "命令没有 value 参数"}
                                  </p>
                                </div>
                                <Switch
                                  checked={Boolean(selectedEventBinding?.passValue && selectedEventCommand.acceptsValue)}
                                  disabled={!selectedEventCommand.acceptsValue}
                                  onCheckedChange={(passValue: any) => updateSelectedEventBinding(selectedEventName, { passValue })}
                                />
                              </div>
                              {selectedEventCommand.acceptsValue ? (
                                <Field label="载荷模式">
                                  <Select
                                    value={selectedEventBinding?.payloadMode ?? "value"}
                                    disabled={!selectedEventBinding?.passValue}
                                    onValueChange={(payloadMode: any) =>
                                      updateSelectedEventBinding(selectedEventName, {
                                        payloadMode: payloadMode === "json" ? "json" : "value",
                                        payloadFields: payloadMode === "json" ? eventPayloadFieldSelection(selectedEventBinding) : undefined,
                                      })
                                    }
                                  >
                                    <SelectTrigger data-builder-connection-payload-mode="">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="value">当前值</SelectItem>
                                      <SelectItem value="json">JSON 载荷</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </Field>
                              ) : null}
                              {selectedEventBinding?.passValue && selectedEventBinding.payloadMode === "json" ? (
                                <div className="grid grid-cols-2 gap-2">
                                  {eventPayloadFields.map((field: any) => (
                                    <label
                                      key={field.value}
                                      className="flex min-w-0 items-start gap-2 rounded-xl border border-outline-variant bg-surface-container-high p-2 text-xs"
                                    >
                                      <Checkbox
                                        className="mt-0.5 size-4"
                                        checked={selectedConnectionPayloadFields.includes(field.value)}
                                        onCheckedChange={(checked: any) =>
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
                              ) : null}
                            </>
                          ) : (
                            <div className="rounded-xl border border-dashed border-outline-variant p-3 text-xs leading-5 text-on-surface-variant">
                              先绑定 Rust 命令，再配置载荷。
                            </div>
                          )}
                        </section>

                        <section className="space-y-3 rounded-2xl border border-outline-variant bg-surface-container p-3" data-builder-connection-output="">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">结果路由</h4>
                              <p className="mt-1 truncate text-xs text-on-surface-variant">{selectedConnectionOutputSummary}</p>
                            </div>
                            <Badge variant={selectedEventBinding?.resultTargetItemId || selectedEventBinding?.resultStateId ? "secondary" : "outline"}>
                              {selectedEventCommand ? commandResultSchema(selectedEventCommand).mode : "none"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Field label="目标">
                              <Select
                                value={selectedEventBinding?.resultTargetItemId || "__none"}
                                onValueChange={(value: any) =>
                                  updateSelectedEventBinding(selectedEventName, {
                                    resultTargetItemId: value === "__none" ? "" : value,
                                    resultTargetProp: value === "__none" ? undefined : selectedEventBinding?.resultTargetProp ?? "value",
                                  })
                                }
                              >
                                <SelectTrigger data-builder-connection-result-target="">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none">无</SelectItem>
                                  {eventResultTargets.map((item: any) => (
                                    <SelectItem key={item.id} value={item.id}>
                                      {getItemSummary(item)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </Field>
                            <Field label="属性">
                              <Select
                                value={selectedEventBinding?.resultTargetProp || "__none"}
                                disabled={!selectedEventBinding?.resultTargetItemId}
                                onValueChange={(value: any) =>
                                  updateSelectedEventBinding(selectedEventName, {
                                    resultTargetProp: value === "__none" ? undefined : (value as BuilderResultTargetProp),
                                  })
                                }
                              >
                                <SelectTrigger data-builder-connection-result-prop="">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none">无</SelectItem>
                                  {eventResultTargetProps.map((prop: any) => (
                                    <SelectItem key={prop.value} value={prop.value}>
                                      {prop.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </Field>
                          </div>
                          <Field label="状态">
                            <Select
                              value={selectedEventBinding?.resultStateId || "__none"}
                              onValueChange={(value: any) => updateSelectedEventBinding(selectedEventName, { resultStateId: value === "__none" ? "" : value })}
                            >
                              <SelectTrigger data-builder-connection-result-state="">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none">无状态</SelectItem>
                                {activeProject.stateVariables.map((state: any) => (
                                  <SelectItem key={state.id} value={state.id}>
                                    {state.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-high p-3">
                            <div className="min-w-0">
                              <Label className="text-xs font-medium">应用 JSON 状态 patch</Label>
                              <p className="mt-1 text-xs leading-5 text-on-surface-variant">将 patch 写入状态</p>
                            </div>
                            <Switch
                              checked={Boolean(selectedEventBinding?.applyJsonStatePatch)}
                              onCheckedChange={(applyJsonStatePatch: any) => updateSelectedEventBinding(selectedEventName, { applyJsonStatePatch })}
                            />
                          </div>
                        </section>
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
                      <div className="space-y-3 rounded-[22px] border border-dashed border-outline-variant bg-surface-container-low p-4 text-sm" data-builder-connections-empty="">
                        <div className="flex items-start gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary">
                            <Braces aria-hidden className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-medium text-on-surface">{selectedItem ? "静态控件" : "未选择控件"}</h3>
                            <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                              {selectedItem
                                ? `${getItemSummary(selectedItem)} 没有可绑定事件。可以编辑属性，或插入 Button、Input、Switch、Select、Checkbox。`
                                : "选择 Button、Input、Switch、Select 或 Checkbox 后，可以管理事件连接。"}
                            </p>
                          </div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setRightDockTab("properties");
                              if (!selectedItem) {
                                setLeftDockTab("navigator");
                              }
                            }}
                          >
                            <Settings2 aria-hidden className="size-4" />
                            {selectedItem ? "属性" : "导航"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setMode("design");
                              setLeftDockTab("components");
                              insertComponentFromShortcut("button", { centered: items.length === 0, revealPalette: true });
                            }}
                          >
                            <Plus aria-hidden className="size-4" />
                            插入 Button
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setMode("design");
                              setLeftDockTab("navigator");
                            }}
                          >
                            <FileJson aria-hidden className="size-4" />
                            图层
                          </Button>
                        </div>
                      </div>
                    )}
                  </section>
                ) : rightDockTab === "responsive" ? (
                  <section className="space-y-4">
                    <PanelTitle icon={Monitor} title="响应式" description="查看当前断点、画布尺寸和选中控件的响应式状态。" />
                    <div className="space-y-3 rounded-[22px] bg-surface-container-low p-3">
                      <SegmentedControl
                        aria-label="Inspector responsive breakpoint"
                        value={activeBreakpoint}
                        onValueChange={(value: any) => setResponsiveBreakpoint(value as ResponsiveBreakpointId)}
                        options={[
                          { value: "desktop", label: "桌面" },
                          { value: "tablet", label: "平板" },
                          { value: "mobile", label: "手机" },
                        ]}
                      />
                      <div className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                        <PathRow label="画布" value={`${page.width} x ${page.height} · ${responsiveBreakpointSize(activeBreakpoint, page).width}px 参考线`} />
                        <PathRow label="预设" value={page.preset} />
                        <PathRow label="缩放" value={`${Math.round(page.zoom * 100)}%`} />
                      </div>
                      {selectedItem ? (
                        <div className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                          <PathRow label="所选" value={getItemSummary(selectedItem)} />
                          <PathRow label="边界" value={`x ${selectedItem.x}, y ${selectedItem.y}, ${selectedItem.width} x ${selectedItem.height}`} />
                          <PathRow
                            label="约束"
                            value={
                              Object.entries(itemConstraints(selectedItem))
                                .filter(([, enabled]) => enabled)
                                .map(([name]) => name)
                                .join(", ") || "无"
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
                    <PanelTitle icon={AlertTriangle} title="影响" description="反向查看当前选择会影响哪些生成文件、检查和构建动作。" />
                    <div className="space-y-3 rounded-[22px] bg-surface-container-low p-3">
                      {selectedControlReverseDependency ? (
                        <div className="rounded-2xl border border-outline-variant bg-surface-container p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{selectedControlReverseDependency.target?.label ?? "所选控件"}</p>
                              <p className="mt-1 text-xs leading-5 text-on-surface-variant">{selectedControlReverseDependency.summary}</p>
                            </div>
                            <Badge variant={reverseDependencyStatusVariant(selectedControlReverseDependency.status)}>
                              {reverseDependencyStatusLabel(selectedControlReverseDependency.status)}
                            </Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedControlReverseDependency.scopeIds.slice(0, 4).map((scopeId: any) => (
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
  );
}
