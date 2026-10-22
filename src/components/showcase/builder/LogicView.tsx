/* eslint-disable @typescript-eslint/no-explicit-any */
// Extracted from BuilderShowcase.tsx (P2-9): the "logic" workspace view.
// BuilderShowcase still owns the state; this module only renders it.

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, ArrowRight, Box, Braces, Bug, CheckCircle2, ChevronRight, ClipboardCopy, Clock3, Copy, CornerDownRight, FileJson, FolderOpen, ListChecks, MessageSquare, MousePointer2, MoveDown, MoveUp, Navigation, Play, Plus, RotateCcw, Save, ScrollText, Search, Settings2, Terminal, TextCursorInput, ToggleLeft, Trash2, Wand2 } from "lucide-react";
import { BackendIntegrationKind, BackendIntegrationLanguage, BackendIntegrationTransport, RustCommandParameterSource, RustCommandParameterType, RustCommandResultSchema } from "./types";
import { Badge } from "@/components/ui/badge";
import { projectChangeScopeLabel } from "./change-impact";
import { projectExplorerBadgeLabel } from "./monolith-module";
import { simulatorTraceStatusLabel } from "./status-labels";
import { CountReadout, StateBadge, StateLabel } from "./view-helpers";
import { Button } from "@/components/ui/button";
import { DEFAULT_RUST_COMMAND_RESPONSE } from "./rust-commands";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type LogicViewScope = Record<string, any>;

export function LogicView(props: { scope: LogicViewScope }): ReactNode {
  const scope = props.scope ?? {};
  const {
    Field,
    LogicWorkspace,
    PanelTitle,
    PathRow,
    Suspense,
    actionableRustQuickFixCount,
    activeBackendArtifactBuildResult,
    activeBackendArtifactInspection,
    activeBackendIntegration,
    activeBackendIntegrationMethod,
    activeBackendMethodFields,
    activeBackendPayloadMapping,
    activeBackendRequestValidationIssues,
    activeBackendResponsePatchEnabled,
    activeBackendResponseValidationIssues,
    activeCargoDependency,
    activeFile,
    activeProject,
    activeProjectTasks,
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
    addRustCommandParameter,
    appendMissingRustSlotForCommand,
    appendMissingRustSlots,
    applyActiveBackendIntegrationPreset,
    applyBackendIntegrationPreset,
    applyRustCompletion,
    applyingGeneratedFiles,
    backendArtifactInspectionStatusLabel,
    backendArtifactStarterBuildAvailable,
    backendArtifactStatusVariant,
    backendIntegrationKinds,
    backendIntegrationLanguages,
    backendIntegrationStarterHint,
    backendIntegrationTransports,
    backendSchemaFieldIssues,
    booleanStateLabel,
    bottomDockTab,
    buildActiveBackendArtifact,
    buildDiagnostics,
    builderIssueCount,
    builderIssueErrorCount,
    buildingBackendArtifactId,
    byteSizeLabel,
    checkingBackendArtifacts,
    clamp,
    cn,
    commandResultSchema,
    copyActiveRustCommandInvokeName,
    copyRustEditorLocation,
    createAndBindBackendIntegrationCommand,
    createBackendIntegrationInProject,
    createBackendIntegrationMethodInProject,
    createCargoDependencyInProject,
    createRustCommandFromBackendIntegration,
    createRustCommandInProject,
    createRustModuleInProject,
    createRustNovaJsonResultSnippet,
    createRustStatePatchLiteral,
    createStateVariableInProject,
    deleteActiveBackendIntegration,
    deleteActiveBackendIntegrationMethod,
    deleteActiveCargoDependency,
    deleteActiveRustCommand,
    deleteActiveRustModule,
    deleteActiveStateVariable,
    deleteRustCommandParameter,
    diskBusy,
    duplicateRustSelectionOrLine,
    editableRustDiagnosticQuickFixes,
    enqueueProjectTask,
    fileNameFromPath,
    filteredBackendIntegrations,
    filteredCargoDependencies,
    filteredLogicConnectionRows,
    filteredLogicSignalSlotRows,
    filteredRustCommands,
    filteredRustLogicOutline,
    filteredRustModules,
    filteredStateVariables,
    focusActiveRustCommandPrimaryCaller,
    focusRustFunction,
    focusRustIdentifierReference,
    focusRustLine,
    formatRustLogicSource,
    formatStateReferenceCount,
    generatedFilePreview,
    getItemSummary,
    goToRustLine,
    goToSlotForItem,
    handleRustEditorKeyDown,
    handleRustFindInputKeyDown,
    handleRustGoToLineInputKeyDown,
    handleRustRenameInputKeyDown,
    handleRustReplaceInputKeyDown,
    insertActiveRustCommandDraft,
    insertRustSnippet,
    isTauriRuntime,
    latestSimulatorTrace,
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
    missingRustSlotCount,
    missingRustSlotEntries,
    moveRustFindMatch,
    moveRustSelectionLines,
    numberFromInput,
    open,
    openActiveRustCommandPrimaryMapping,
    openActiveRustCommandSlot,
    openBottomDock,
    openBuildDiagnostic,
    openLogicConnectionSettings,
    openRelevantTaskDock,
    openRustBackendTopologyNode,
    openRustDiagnosticFromGutter,
    openRustLogicOutlineEntry,
    openSlotNavigationEntry,
    prepareRustSymbolRename,
    previewingGeneratedFiles,
    projectChangeImpact,
    projectTaskDefinitions,
    recentSlotNavigationEntries,
    refreshBackendArtifactInspection,
    registerSlotNavigationVisit,
    renameRustSymbolAtCursor,
    renderRustHighlightedLine,
    replaceActiveRustFindMatch,
    replaceAllRustFindMatches,
    reverseDependencyStatusLabel,
    reverseDependencyStatusVariant,
    runActiveRustCommandPrimaryCaller,
    runLogicSignalSlotEvent,
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
    selectBackendIntegration,
    selectBackendIntegrationMethod,
    selectCargoDependency,
    selectCurrentRustOutlineRange,
    selectProjectReverseDependencyOutputs,
    selectRustCommand,
    selectRustModule,
    selectStateVariable,
    selectedEventName,
    selectedItem,
    selectedItems,
    selectedLogicSignalSlotRow,
    setBottomDockExpanded,
    setBottomDockMinimized,
    setDisabledRustDebuggerBreakpointIds,
    setFeedbackPanelOpen,
    setLeftDockTab,
    setLogicConnectionFilter,
    setLogicResourceView,
    setLogicSearchQuery,
    setMode,
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
    setSelectedId,
    setSelectedProjectExplorerNodeId,
    showProjectJumpFeedback,
    stateReferenceCounts,
    syncActiveBackendMethodSampleFromSchema,
    testActiveBackendIntegrationMethod,
    testingBackendMethodId,
    toggleRustEditorWordWrap,
    toggleRustLineComment,
    top,
    unboundLogicSignalSlotRows,
    updateActiveBackendMethodSampleField,
    updateBackendIntegration,
    updateBackendIntegrationMethod,
    updateCargoDependency,
    updateEventCommandForItem,
    updateRustCommand,
    updateRustCommandParameter,
    updateRustCommandResult,
    updateRustCompletionFromEditor,
    updateRustEditorSelectionFromEditor,
    updateRustLogic,
    updateRustModule,
    updateStateVariable,
    validateActiveBackendMethodContract,
    validationTimeLabel,
    visibleRustLogicOutline,
    window,
  } = scope;

  return (
            <Suspense fallback={null}>
            <LogicWorkspace>
              <aside
                className="subtle-scrollbar min-h-0 space-y-1 overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-low p-1.5"
                data-builder-logic-resource-density="compact-outline"
                data-builder-logic-resource-panel-chrome="low-chrome"
              >
                <div className="flex min-h-7 min-w-0 items-center justify-between gap-2 px-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-xs font-semibold text-on-surface">逻辑资源</p>
                    <span className="shrink-0 text-[0.68rem] text-on-surface-variant">
                      {logicResourceViewOptions.find((option: any) => option.value === logicResourceView)?.label ?? "连接"}
                    </span>
                  </div>
                  <CountReadout label={`${filteredRustLogicOutline.length} 大纲`} count={filteredRustLogicOutline.length} />
                </div>
                <div
                  className="rounded-lg border border-outline-variant/80 bg-surface-container p-0.5"
                  data-builder-logic-search=""
                  data-builder-logic-search-density="single-row"
                >
                  <div className="flex items-center gap-1.5 rounded-md bg-surface-container-high px-1.5">
                    <Search aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                    <Input
                      aria-label="搜索 Rust 逻辑资源"
                      value={logicSearchQuery}
                      onChange={(event: any) => setLogicSearchQuery(event.target.value)}
                      placeholder="搜索命令、槽函数、状态、模块..."
                      className="h-7 min-w-0 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:border-transparent"
                      spellCheck={false}
                    />
                    {logicSearchQuery ? (
                      <button
                        type="button"
                        className="focus-ring shrink-0 rounded-md px-1.5 py-0.5 text-[0.64rem] text-on-surface-variant hover:bg-surface-container"
                        onClick={() => setLogicSearchQuery("")}
                      >
                        清除
                      </button>
                    ) : null}
                  </div>
                  <div className="sr-only">
                    <span className="rounded-full bg-surface-container-high px-2 py-1">{filteredRustCommands.length}/{activeProject.rustCommands.length} 命令</span>
                    <span className="rounded-full bg-surface-container-high px-2 py-1">{filteredLogicSignalSlotRows.length}/{logicSignalSlotRows.length} 信号槽</span>
                    <span className="rounded-full bg-surface-container-high px-2 py-1">{filteredRustLogicOutline.length}/{rustLogicOutline.length} 大纲</span>
                  </div>
                </div>
                <div
                  className="rounded-lg border border-outline-variant/80 bg-surface-container p-1 text-xs"
                  data-builder-rust-outline=""
                  data-builder-rust-outline-sidebar=""
                  data-builder-rust-outline-density="compact-list"
                >
                  <div className="mb-1 flex min-w-0 items-center justify-between gap-2 px-1">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-on-surface">Rust 大纲</p>
                      <p className="sr-only">侧栏跳转，不占用代码区</p>
                    </div>
                    <StateBadge
                      signal={missingRustSlotCount > 0}
                      variant="outline"
                      className="shrink-0"
                      label={missingRustSlotCount > 0 ? `${missingRustSlotCount} 缺槽` : "就绪"}
                    />
                  </div>
                  <div className="subtle-scrollbar max-h-44 space-y-1 overflow-y-auto pr-1">
                    {visibleRustLogicOutline.length > 0 ? (
                      visibleRustLogicOutline.slice(0, 18).map((entry: any) => (
                        <button
                          key={`sidebar-outline-${entry.id}`}
                          type="button"
                          className={cn(
                            "focus-ring grid w-full min-w-0 grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-1.5 rounded-md border px-1.5 py-1 text-left transition",
                            entry.active
                              ? "border-primary bg-primary/10 text-on-surface shadow-m3-1"
                              : "border-outline-variant/80 bg-transparent text-on-surface-variant hover:border-outline hover:bg-surface-container-high hover:text-on-surface",
                          )}
                          data-builder-rust-outline-entry={entry.kind}
                          data-builder-rust-outline-entry-kind={rustOutlineKindLabel(entry.kind)}
                          onClick={() => openRustLogicOutlineEntry(entry)}
                        >
                          {/* A line number is a coordinate to read, not a state to
                              act on. The rounded gutter read as one more chip in a
                              list that is already short of actions. */}
                          <span className="flex size-6 items-center justify-center font-mono text-[0.62rem] text-primary">
                            {entry.line ?? "--"}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-mono text-[0.72rem] text-on-surface">{entry.label}</span>
                            <span className="block truncate text-[0.62rem] text-on-surface-variant">
                              {rustOutlineKindLabel(entry.kind)} · {entry.detail}
                            </span>
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-high px-3 py-3 leading-5 text-on-surface-variant">
                        {logicSearchNeedle ? "没有匹配当前搜索的大纲项。" : "创建命令或插入草稿后会生成可跳转大纲。"}
                      </div>
                    )}
                  </div>
                  {missingRustSlotCount > 0 ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-1.5 h-7 w-full text-[0.68rem]"
                      data-builder-rust-create-missing-slots=""
                      onClick={appendMissingRustSlots}
                    >
                      <Wand2 aria-hidden className="size-4" />
                      补齐缺失槽
                    </Button>
                  ) : null}
                </div>
                <div className="subtle-scrollbar flex gap-0.5 overflow-x-auto rounded-lg border border-outline-variant/80 bg-surface-container p-0.5" role="radiogroup" aria-label="逻辑资源视图" data-builder-logic-resource-view="">
                  {logicResourceViewOptions.map((option: any) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={logicResourceView === option.value}
                      className={cn(
                        "focus-ring h-6 shrink-0 rounded-md px-1.5 text-[0.64rem] font-medium text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface",
                        logicResourceView === option.value && "bg-secondary-container text-secondary-container-foreground shadow-m3-1",
                      )}
                      onClick={() => setLogicResourceView(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <details
                  key={`logic-resource-connections-${logicResourceView}`}
                  open={logicResourceView !== "all"}
                  className={cn(logicResourceSectionClass, !logicResourceVisible("connections") && "hidden")}
                  data-builder-logic-resource-section="connections"
                  data-builder-logic-resource-section-density="collapsed-in-all"
                  data-builder-logic-resource-section-chrome="flat-outline"
                >
                  <summary
                    className={logicResourceSectionSummaryClass}
                    data-builder-logic-resource-section-summary="connections"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={logicResourceSectionIconClass}>
                        <CornerDownRight aria-hidden className="size-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-on-surface">信号/槽连接</span>
                        <span className="block truncate text-[0.6rem] leading-3 text-on-surface-variant">绑定、槽函数和运行入口</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {/* The count is what a closed section stands for. Once it
                          is open the list says it better than a chip does. */}
                      <CountReadout label={String(filteredLogicConnectionRows.length)} count={filteredLogicConnectionRows.length} className="shrink-0 text-[0.62rem]" />
                      <ChevronRight aria-hidden className="size-3.5 text-on-surface-variant transition-transform group-open:rotate-90" />
                    </span>
                  </summary>
                  <div className={logicResourceSectionContentClass} data-builder-logic-resource-section-content="connections">
                  <div className="grid grid-cols-4 gap-0.5 rounded-lg border border-outline-variant/80 bg-surface-container p-0.5" role="radiogroup" aria-label="连接绑定状态过滤" data-builder-logic-connection-filter="">
                    {logicConnectionFilterOptions.map((option: any) => (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={logicConnectionFilter === option.value}
                        data-builder-logic-connection-filter-option={option.value}
                        data-builder-logic-connection-filter-missing-slot={option.value === "missing-slot" ? "" : undefined}
                        className={cn(
                          "focus-ring h-6 rounded-md px-1.5 text-[0.64rem] font-medium text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface",
                          logicConnectionFilter === option.value && "bg-secondary-container text-secondary-container-foreground shadow-m3-1",
                        )}
                        onClick={() => setLogicConnectionFilter(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {filteredLogicConnectionRows.map((row: any) => {
                    const rowNeedsSlot = logicSignalSlotRowNeedsSlot(row);
                    return (
                      <div
                        key={row.id}
                        className={cn(
                          "rounded-lg border px-2 py-1.5 transition",
                          row.selected
                            ? logicResourceItemActiveClass
                            : rowNeedsSlot
                              ? "border-tertiary/35 bg-transparent text-on-surface-variant hover:border-tertiary/60 hover:bg-tertiary-container/20"
                              : logicResourceItemIdleClass,
                        )}
                        data-builder-logic-resource-item-density="thin-row"
                        data-builder-logic-connection-resource={row.command ? "bound" : "unbound"}
                        data-builder-logic-connection-resource-slot-state={rowNeedsSlot ? "missing" : row.command ? "located" : "unbound"}
                      >
                        <button
                          type="button"
                          className="focus-ring w-full rounded-md text-left"
                          onClick={() => {
                            setSelectedId(row.item.id);
                            setRightDockTab("connections");
                          }}
                        >
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate text-xs font-medium text-on-surface">{getItemSummary(row.item)}</span>
                            <StateLabel
                              showQuiet
                              variant={row.command ? "secondary" : "outline"}
                              className="shrink-0"
                              label={row.command ? "已绑定" : "待绑定"}
                            />
                            {rowNeedsSlot ? (
                              <StateLabel
                                variant="destructive"
                                className="shrink-0"
                                label="缺槽"
                                data-builder-logic-connection-missing-slot-badge=""
                              />
                            ) : null}
                          </span>
                          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[0.66rem] text-on-surface-variant">
                            <span className="shrink-0 rounded-md bg-surface-container-highest px-1.5 py-0.5 font-mono">{row.eventName}</span>
                            <ArrowRight aria-hidden className="size-3.5 shrink-0" />
                            <span className="truncate font-mono">{row.command ? sanitizeRustCommandName(row.command.name) : "未绑定 command"}</span>
                          </span>
                        </button>
                        <div className="mt-1.5 grid grid-cols-3 gap-1">
                          <Button
                            size="sm"
                            variant={rowNeedsSlot ? "default" : row.command ? "secondary" : "default"}
                            className="h-6 px-1.5 text-[0.64rem]"
                            data-builder-logic-connection-generate-missing-slot={rowNeedsSlot ? "" : undefined}
                            onClick={() => goToSlotForItem(row.item)}
                          >
                            {rowNeedsSlot ? "生成槽" : "槽"}
                          </Button>
                          <Button
                            size="sm"
                            variant={row.command ? "ghost" : "secondary"}
                            className="h-6 px-1.5 text-[0.64rem]"
                            disabled={!row.command && !activeRustCommand.id}
                            data-builder-logic-connection-bind-active-command={row.command ? undefined : ""}
                            onClick={() =>
                              row.command
                                ? runLogicSignalSlotEvent(row.item, row.eventName)
                                : updateEventCommandForItem(row.item, row.eventName, activeRustCommand.id, { keepConnectionView: true })
                            }
                          >
                            {row.command ? "运行" : "绑定"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-1.5 text-[0.64rem]"
                            onClick={() => openLogicConnectionSettings(row.item, row.eventName)}
                          >
                            设置
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredLogicConnectionRows.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-2 py-2 text-xs leading-5 text-on-surface-variant">
                      没有匹配的{logicConnectionFilter === "bound" ? "已绑定" : logicConnectionFilter === "unbound" ? "待绑定" : logicConnectionFilter === "missing-slot" ? "缺槽" : ""}信号/槽连接。
                    </div>
                  ) : null}
                </div>
                </details>
                <details
                  key={`logic-resource-commands-${logicResourceView}`}
                  open={logicResourceView !== "all"}
                  className={cn(logicResourceSectionClass, !logicResourceVisible("commands") && "hidden")}
                  data-builder-logic-resource-section="commands"
                  data-builder-logic-resource-section-density="collapsed-in-all"
                  data-builder-logic-resource-section-chrome="flat-outline"
                >
                  <summary
                    className={logicResourceSectionSummaryClass}
                    data-builder-logic-resource-section-summary="commands"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={logicResourceSectionIconClass}>
                        <Braces aria-hidden className="size-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-on-surface">命令注册表</span>
                        <span className="block truncate text-[0.6rem] leading-3 text-on-surface-variant">Tauri invoke handler</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <CountReadout label={String(filteredRustCommands.length)} count={filteredRustCommands.length} className="shrink-0 text-[0.62rem]" />
                      <ChevronRight aria-hidden className="size-3.5 text-on-surface-variant transition-transform group-open:rotate-90" />
                    </span>
                  </summary>
                  <div className={logicResourceSectionContentClass} data-builder-logic-resource-section-content="commands">
                  {filteredRustCommands.map((command: any) => (
                    <button
                      key={command.id}
                      type="button"
                      data-builder-rust-command={command.name}
                      onClick={() => selectRustCommand(command.id)}
                      className={cn(
                        logicResourceItemClass,
                        command.id === activeProject.activeRustCommandId
                          ? logicResourceItemActiveClass
                          : logicResourceItemIdleClass,
                      )}
                      data-builder-logic-resource-item-density="thin-row"
                    >
                      <span className="block truncate font-mono text-xs">{sanitizeRustCommandName(command.name)}</span>
                      <span className="mt-0.5 block truncate text-[0.62rem] leading-3">{command.response || DEFAULT_RUST_COMMAND_RESPONSE}</span>
                    </button>
                  ))}
                  {filteredRustCommands.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-2 py-2 text-xs leading-5 text-on-surface-variant">
                      没有匹配的 Rust 命令。
                    </div>
                  ) : null}
                  <Button className="h-7 w-full text-[0.68rem]" variant="secondary" data-builder-new-command="" onClick={createRustCommandInProject}>
                    <Plus aria-hidden className="size-4" />
                    新建命令
                  </Button>
                  </div>
                </details>
                <details
                  key={`logic-resource-modules-${logicResourceView}`}
                  open={logicResourceView !== "all"}
                  className={cn(logicResourceSectionClass, !logicResourceVisible("modules") && "hidden")}
                  data-builder-logic-resource-section="modules"
                  data-builder-logic-resource-section-density="collapsed-in-all"
                  data-builder-logic-resource-section-chrome="flat-outline"
                >
                  <summary
                    className={logicResourceSectionSummaryClass}
                    data-builder-logic-resource-section-summary="modules"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={logicResourceSectionIconClass}>
                        <FileJson aria-hidden className="size-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-on-surface">Rust 模块</span>
                        <span className="block truncate text-[0.6rem] leading-3 text-on-surface-variant">生成到 src-tauri/src/*.rs</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <CountReadout label={String(filteredRustModules.length)} count={filteredRustModules.length} className="shrink-0 text-[0.62rem]" />
                      <ChevronRight aria-hidden className="size-3.5 text-on-surface-variant transition-transform group-open:rotate-90" />
                    </span>
                  </summary>
                  <div className={logicResourceSectionContentClass} data-builder-logic-resource-section-content="modules">
                  <div className="space-y-1">
                    {filteredRustModules.map((module: any) => (
                      <button
                        key={module.id}
                        type="button"
                        data-builder-rust-module={module.name}
                        onClick={() => selectRustModule(module.id)}
                        className={cn(
                          logicResourceItemClass,
                          module.id === activeProject.activeRustModuleId
                            ? logicResourceItemActiveClass
                            : logicResourceItemIdleClass,
                        )}
                        data-builder-logic-resource-item-density="thin-row"
                      >
                        <span className="block truncate font-mono text-xs">{sanitizeRustModuleName(module.name)}</span>
                        <span className="mt-0.5 block truncate text-[0.62rem] leading-3">{booleanStateLabel(module.enabled)} · {module.source.split(/\r?\n/).length} 行</span>
                      </button>
                    ))}
                    {filteredRustModules.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-2 py-2 text-xs leading-5 text-on-surface-variant">
                        没有匹配的 Rust 模块。
                      </div>
                    ) : null}
                  </div>
                  <Button className="mt-1 h-7 w-full text-[0.68rem]" variant="secondary" data-builder-new-rust-module="" onClick={createRustModuleInProject}>
                    <Plus aria-hidden className="size-4" />
                    新建模块
                  </Button>
                  </div>
                </details>
                <details
                  key={`logic-resource-dependencies-${logicResourceView}`}
                  open={logicResourceView !== "all"}
                  className={cn(logicResourceSectionClass, !logicResourceVisible("dependencies") && "hidden")}
                  data-builder-logic-resource-section="dependencies"
                  data-builder-logic-resource-section-density="collapsed-in-all"
                  data-builder-logic-resource-section-chrome="flat-outline"
                >
                  <summary
                    className={logicResourceSectionSummaryClass}
                    data-builder-logic-resource-section-summary="dependencies"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={logicResourceSectionIconClass}>
                        <Box aria-hidden className="size-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-on-surface">Cargo 依赖</span>
                        <span className="block truncate text-[0.6rem] leading-3 text-on-surface-variant">写入 Cargo.toml 的 crate</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <CountReadout label={String(filteredCargoDependencies.length)} count={filteredCargoDependencies.length} className="shrink-0 text-[0.62rem]" />
                      <ChevronRight aria-hidden className="size-3.5 text-on-surface-variant transition-transform group-open:rotate-90" />
                    </span>
                  </summary>
                  <div className={logicResourceSectionContentClass} data-builder-logic-resource-section-content="dependencies">
                    {filteredCargoDependencies.map((dependency: any) => (
                      <button
                        key={dependency.id}
                        type="button"
                        data-builder-cargo-dependency={dependency.name}
                        onClick={() => selectCargoDependency(dependency.id)}
                        className={cn(
                          logicResourceItemClass,
                          dependency.id === activeProject.activeCargoDependencyId
                            ? logicResourceItemActiveClass
                            : logicResourceItemIdleClass,
                        )}
                        data-builder-logic-resource-item-density="thin-row"
                      >
                        <span className="block truncate font-mono text-xs">{sanitizeCargoDependencyName(dependency.name)}</span>
                        <span className="mt-0.5 block truncate text-[0.62rem] leading-3">
                          {booleanStateLabel(dependency.enabled)} · v{dependency.version}
                          {dependency.features ? ` · ${dependency.features}` : ""}
                        </span>
                      </button>
                    ))}
                    {filteredCargoDependencies.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-2 py-2 text-xs leading-5 text-on-surface-variant">
                        没有匹配的 Cargo 依赖。
                      </div>
                    ) : null}
                  <Button className="h-7 w-full text-[0.68rem]" variant="secondary" data-builder-new-cargo-dependency="" onClick={createCargoDependencyInProject}>
                    <Plus aria-hidden className="size-4" />
                    新建依赖
                  </Button>
                  </div>
                </details>
                <details
                  key={`logic-resource-integrations-${logicResourceView}`}
                  open={logicResourceView !== "all"}
                  className={cn(logicResourceSectionClass, !logicResourceVisible("integrations") && "hidden")}
                  data-builder-logic-resource-section="integrations"
                  data-builder-logic-resource-section-density="collapsed-in-all"
                  data-builder-logic-resource-section-chrome="flat-outline"
                >
                  <summary
                    className={logicResourceSectionSummaryClass}
                    data-builder-logic-resource-section-summary="integrations"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={logicResourceSectionIconClass}>
                        <Terminal aria-hidden className="size-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-on-surface">后端集成</span>
                        <span className="block truncate text-[0.6rem] leading-3 text-on-surface-variant">C++ FFI、sidecar、本地服务</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <CountReadout label={String(filteredBackendIntegrations.length)} count={filteredBackendIntegrations.length} className="shrink-0 text-[0.62rem]" />
                      <ChevronRight aria-hidden className="size-3.5 text-on-surface-variant transition-transform group-open:rotate-90" />
                    </span>
                  </summary>
                  <div className={logicResourceSectionContentClass} data-builder-logic-resource-section-content="integrations">
                    {filteredBackendIntegrations.map((integration: any) => (
                      <button
                        key={integration.id}
                        type="button"
                        data-builder-backend-integration={integration.name}
                        onClick={() => selectBackendIntegration(integration.id)}
                        className={cn(
                          logicResourceItemClass,
                          integration.id === activeProject.activeBackendIntegrationId
                            ? logicResourceItemActiveClass
                            : logicResourceItemIdleClass,
                        )}
                        data-builder-logic-resource-item-density="thin-row"
                      >
                        <span className="block truncate font-mono text-xs">{integration.name}</span>
                        <span className="mt-0.5 block truncate text-[0.62rem] leading-3">
                          {booleanStateLabel(integration.enabled)} · {integration.language} · {integration.transport}
                        </span>
                      </button>
                    ))}
                    {filteredBackendIntegrations.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-2 py-2 text-xs leading-5 text-on-surface-variant">
                        没有匹配的后端集成。
                      </div>
                    ) : null}
                  <Button className="h-7 w-full text-[0.68rem]" variant="secondary" data-builder-new-backend-integration="" onClick={createBackendIntegrationInProject}>
                    <Plus aria-hidden className="size-4" />
                    新建集成
                  </Button>
                  </div>
                </details>
                <details
                  key={`logic-resource-state-${logicResourceView}`}
                  open={logicResourceView !== "all"}
                  className={cn(logicResourceSectionClass, !logicResourceVisible("state") && "hidden")}
                  data-builder-logic-resource-section="state"
                  data-builder-logic-resource-section-density="collapsed-in-all"
                  data-builder-logic-resource-section-chrome="flat-outline"
                >
                  <summary
                    className={logicResourceSectionSummaryClass}
                    data-builder-logic-resource-section-summary="state"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={logicResourceSectionIconClass}>
                        <ToggleLeft aria-hidden className="size-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-on-surface">状态存储</span>
                        <span className="block truncate text-[0.6rem] leading-3 text-on-surface-variant">共享状态和控件绑定</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <CountReadout label={String(filteredStateVariables.length)} count={filteredStateVariables.length} className="shrink-0 text-[0.62rem]" />
                      <ChevronRight aria-hidden className="size-3.5 text-on-surface-variant transition-transform group-open:rotate-90" />
                    </span>
                  </summary>
                  <div className={logicResourceSectionContentClass} data-builder-logic-resource-section-content="state">
                    {filteredStateVariables.map((state: any) => (
                      <button
                        key={state.id}
                        type="button"
                        data-builder-state-variable={state.name}
                        onClick={() => selectStateVariable(state.id, { feedback: true })}
                        className={cn(
                          logicResourceItemClass,
                          state.id === activeProject.activeStateVariableId
                            ? logicResourceItemActiveClass
                            : logicResourceItemIdleClass,
                        )}
                        data-builder-logic-resource-item-density="thin-row"
                      >
                        <span className="block truncate font-mono text-xs">{state.name}</span>
                        <span className="mt-0.5 block truncate text-[0.62rem] leading-3">
                          {state.initialValue || "空"} · {formatStateReferenceCount(stateReferenceCounts.get(state.id) ?? 0)}
                        </span>
                      </button>
                    ))}
                    {filteredStateVariables.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-2 py-2 text-xs leading-5 text-on-surface-variant">
                        没有匹配的状态变量。
                      </div>
                    ) : null}
                  <Button className="h-7 w-full text-[0.68rem]" variant="secondary" data-builder-new-state="" onClick={() => createStateVariableInProject({ feedback: true })}>
                    <Plus aria-hidden className="size-4" />
                    新建状态
                  </Button>
                  </div>
                </details>
              </aside>
              <section
                className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low p-1"
                data-builder-logic-main-panel="code-primary"
                data-builder-logic-main-panel-density="flat-code-editor"
                data-builder-logic-main-panel-scroll="none"
                data-builder-logic-main-panel-layout="editor-only"
              >
                <div className="order-1 mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-medium">Rust 逻辑</h2>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      命令属性会生成默认源码，也可以在这里继续手写 Rust。
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CountReadout label={`${activeProject.rustCommands.length} 命令`} count={activeProject.rustCommands.length} />
                    <CountReadout label={`${activeProject.rustModules.filter((module: any) => module.enabled).length} 模块`} count={activeProject.rustModules.filter((module: any) => module.enabled).length} />
                    <CountReadout label={`${activeProject.cargoDependencies.filter((dependency: any) => dependency.enabled).length} 依赖`} count={activeProject.cargoDependencies.filter((dependency: any) => dependency.enabled).length} />
                    <CountReadout label={`${activeProject.backendIntegrations.filter((integration: any) => integration.enabled).length} 集成`} count={activeProject.backendIntegrations.filter((integration: any) => integration.enabled).length} />
                  </div>
                </div>
                <div
                  className="order-first z-30 -mx-1 -mt-1 mb-1 flex min-w-0 shrink-0 flex-wrap items-center gap-1 border-b border-outline-variant bg-surface-container px-1 py-0.5 text-xs"
                  data-builder-rust-editor-primary-toolbar=""
                  data-builder-rust-editor-primary-toolbar-density="thin-ide-row"
                >
                  <div className="flex min-w-0 shrink-0 items-center gap-1.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
                      <Braces aria-hidden className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate font-medium text-on-surface">logic.rs</span>
                        {/* Editor modes are values to read; the command strip toggles them. */}
                        <span className="shrink-0 text-[0.62rem] text-on-surface-variant">
                          {rustSyntaxHighlightVisible ? "高亮" : "纯文本"}
                        </span>
                        <span className="shrink-0 text-[0.62rem] text-on-surface-variant">
                          {rustEditorWordWrap ? "折行" : "不折行"}
                        </span>
                      </div>
                      <p className="hidden">
                        主代码区固定在顶部，格式化、折行和高亮操作不随辅助面板滚动丢失。
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1" data-builder-rust-editor-command-strip="" data-builder-rust-editor-command-strip-density="icon-only">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      data-builder-rust-editor-format=""
                      aria-label="格式化 Rust 源码"
                      title="格式化 Rust 源码"
                      onClick={formatRustLogicSource}
                    >
                      <Braces aria-hidden className="size-3.5" />
                      <span className="sr-only">格式化</span>
                    </Button>
                    <Button
                      size="icon-sm"
                      variant={activeRustFindMatch ? "secondary" : "ghost"}
                      data-builder-rust-editor-replace-current=""
                      aria-label="替换当前 Rust 查找结果"
                      title="替换当前 Rust 查找结果"
                      disabled={!activeRustFindMatch}
                      onClick={replaceActiveRustFindMatch}
                    >
                      <TextCursorInput aria-hidden className="size-3.5" />
                      <span className="sr-only">替换当前</span>
                    </Button>
                    <Button
                      size="icon-sm"
                      variant={rustCurrentIdentifier ? "secondary" : "ghost"}
                      data-builder-rust-editor-rename-symbol-action=""
                      aria-label="重命名当前 Rust 符号"
                      title="重命名当前 Rust 符号"
                      disabled={!rustCurrentIdentifier}
                      onClick={rustRenameQuery.trim() ? renameRustSymbolAtCursor : prepareRustSymbolRename}
                    >
                      <TextCursorInput aria-hidden className="size-3.5" />
                      <span className="sr-only">重命名</span>
                    </Button>
                    <Button
                      size="icon-sm"
                      variant={rustEditorWordWrap ? "secondary" : "ghost"}
                      data-builder-rust-editor-word-wrap=""
                      aria-label="切换 Rust 编辑器折行"
                      title="切换 Rust 编辑器折行"
                      aria-pressed={rustEditorWordWrap}
                      onClick={toggleRustEditorWordWrap}
                    >
                      <ScrollText aria-hidden className="size-3.5" />
                      <span className="sr-only">折行</span>
                    </Button>
                    <Button
                      size="icon-sm"
                      variant={rustSyntaxHighlightVisible ? "secondary" : "ghost"}
                      data-builder-rust-editor-syntax-toggle=""
                      aria-label="切换 Rust 语法高亮"
                      title="切换 Rust 语法高亮"
                      aria-pressed={rustSyntaxHighlightVisible}
                      onClick={() => setRustSyntaxHighlightVisible((visible: any) => !visible)}
                    >
                      <Braces aria-hidden className="size-3.5" />
                      <span className="sr-only">高亮</span>
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      aria-label="聚焦 Rust 源码顶部"
                      title="聚焦 Rust 源码顶部"
                      onClick={() => focusRustLine(1, "Rust 主工具条 · logic.rs")}
                    >
                      <CornerDownRight aria-hidden className="size-3.5" />
                      <span className="sr-only">源码</span>
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      data-builder-rust-editor-goto-line-action=""
                      aria-label="跳转到 Rust 行列"
                      title="跳转到 Rust 行列"
                      onClick={goToRustLine}
                    >
                      <Navigation aria-hidden className="size-3.5" />
                      <span className="sr-only">跳转</span>
                    </Button>
                  </div>
                  <div className="grid min-w-0 flex-1 basis-[26rem] gap-0.5 lg:grid-cols-[minmax(7rem,1fr)_minmax(5.5rem,0.65fr)_minmax(5.5rem,0.65fr)_4.5rem] xl:basis-auto" data-builder-rust-editor-search-lane="" data-builder-rust-editor-search-lane-density="thin-inline">
                    <div
                      className="flex h-7 min-w-0 items-center gap-1 rounded-md border border-outline-variant/70 bg-surface-container-low px-1"
                      data-builder-rust-editor-find=""
                      data-builder-rust-editor-find-count={rustFindMatches.length}
                    >
                      <Search aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                      <Input
                        ref={rustFindInputRef}
                        aria-label="查找 Rust 源码"
                        value={rustFindQuery}
                        onChange={(event: any) => {
                          setRustFindQuery(event.target.value);
                          setRustFindActiveIndex(0);
                        }}
                        onKeyDown={handleRustFindInputKeyDown}
                        placeholder="查找"
                        className="h-6 min-w-0 border-0 bg-transparent px-0 font-mono text-[0.68rem] shadow-none focus-visible:border-transparent"
                        spellCheck={false}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-1 text-[0.66rem]"
                        data-builder-rust-editor-find-prev="" aria-label="上一个查找结果"
                        disabled={rustFindMatches.length === 0}
                        onClick={() => moveRustFindMatch(-1)}
                      >
                        <MoveUp aria-hidden className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-1 text-[0.66rem]"
                        data-builder-rust-editor-find-next="" aria-label="下一个查找结果"
                        disabled={rustFindMatches.length === 0}
                        onClick={() => moveRustFindMatch(1)}
                      >
                        <MoveDown aria-hidden className="size-3.5" />
                      </Button>
                      {activeRustFindMatch ? (
                        <span className="hidden shrink-0 rounded-full bg-surface-container-low px-1.5 py-0.5 font-mono text-[0.6rem] text-primary xl:inline-flex" data-builder-rust-editor-find-active="">
                          {clamp(rustFindActiveIndex, 0, Math.max(0, rustFindMatches.length - 1)) + 1}/{rustFindMatches.length}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex h-7 min-w-0 items-center gap-1 rounded-md border border-outline-variant/70 bg-surface-container-low px-1">
                      <TextCursorInput aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                      <Input
                        aria-label="替换 Rust 源码"
                        value={rustReplaceQuery}
                        onChange={(event: any) => setRustReplaceQuery(event.target.value)}
                        onKeyDown={handleRustReplaceInputKeyDown}
                        placeholder="替换"
                        className="h-6 min-w-0 border-0 bg-transparent px-0 font-mono text-[0.68rem] shadow-none focus-visible:border-transparent"
                        data-builder-rust-editor-replace=""
                        spellCheck={false}
                      />
                    </div>
                    <div
                      className="flex h-7 min-w-0 items-center gap-1 rounded-md border border-outline-variant/70 bg-surface-container-low px-1"
                      data-builder-rust-editor-rename-symbol=""
                      data-builder-rust-editor-rename-count={rustCurrentIdentifierOccurrences.length}
                    >
                      <TextCursorInput aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                      <Input
                        ref={rustRenameInputRef}
                        aria-label="重命名 Rust 当前符号"
                        value={rustRenameQuery}
                        onChange={(event: any) => setRustRenameQuery(event.target.value)}
                        onFocus={() => {
                          if (!rustRenameQuery && rustCurrentIdentifier) {
                            setRustRenameQuery(rustCurrentIdentifier.name);
                            window.requestAnimationFrame(() => rustRenameInputRef.current?.select());
                          }
                        }}
                        onKeyDown={handleRustRenameInputKeyDown}
                        placeholder={rustCurrentIdentifier ? rustCurrentIdentifier.name : "符号"}
                        className="h-6 min-w-0 border-0 bg-transparent px-0 font-mono text-[0.68rem] shadow-none focus-visible:border-transparent"
                        data-builder-rust-editor-rename-input=""
                        spellCheck={false}
                      />
                    </div>
                    <div
                      className="flex h-7 min-w-0 items-center gap-1 rounded-md border border-outline-variant/70 bg-surface-container-low px-1"
                      data-builder-rust-editor-goto-line=""
                    >
                      <Navigation aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                      <Input
                        ref={rustGoToLineInputRef}
                        aria-label="跳转 Rust 行列"
                        value={rustGoToLineQuery}
                        onChange={(event: any) => setRustGoToLineQuery(event.target.value)}
                        onKeyDown={handleRustGoToLineInputKeyDown}
                        placeholder="行:列"
                        className="h-6 w-14 min-w-0 border-0 bg-transparent px-0 font-mono text-[0.68rem] shadow-none focus-visible:border-transparent"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </div>
                <section className="mb-4 grid gap-3 2xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
                  <div
                    className="rounded-[20px] border border-outline-variant bg-surface-container-high p-3 text-xs"
                    data-builder-rust-outline=""
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium text-on-surface">Rust 结构导航</h3>
                        <StateBadge
                          signal={missingRustSlotCount > 0}
                          variant="outline"
                          label={missingRustSlotCount > 0 ? `${missingRustSlotCount} 个槽待生成` : "槽函数就绪"}
                        />
                        {logicSearchNeedle ? <CountReadout label={`筛选 ${filteredRustLogicOutline.length}`} count={filteredRustLogicOutline.length} /> : null}
                      </div>
                        <p className="mt-1 leading-5 text-on-surface-variant">
                          从生成的命令、手写函数、模块、类型和实现块建立大纲，点击即可定位源码。
                        </p>
                      </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <CountReadout
                          label={`${filteredRustLogicOutline.filter((entry: any) => entry.kind === "slot").length}/${rustLogicOutline.filter((entry: any) => entry.kind === "slot").length} 槽`}
                          count={filteredRustLogicOutline.filter((entry: any) => entry.kind === "slot").length}
                        />
                        <CountReadout
                          label={`${filteredRustLogicOutline.filter((entry: any) => entry.kind === "function").length}/${rustLogicOutline.filter((entry: any) => entry.kind === "function").length} 函数`}
                          count={filteredRustLogicOutline.filter((entry: any) => entry.kind === "function").length}
                        />
                        <CountReadout
                          data-builder-rust-outline-symbols=""
                          label={`${filteredRustLogicOutline.filter((entry: any) => !["slot", "function"].includes(entry.kind)).length}/${rustStructureOutlineCount} 结构`}
                          count={filteredRustLogicOutline.filter((entry: any) => !["slot", "function"].includes(entry.kind)).length}
                        />
                        {missingRustSlotCount > 0 ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 px-2 text-[0.68rem]"
                            data-builder-rust-create-missing-slots=""
                            onClick={appendMissingRustSlots}
                          >
                            <Wand2 aria-hidden className="size-3.5" />
                            补齐槽
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    {visibleRustLogicOutline.length > 0 ? (
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {visibleRustLogicOutline.map((entry: any) => (
                          <button
                            key={entry.id}
                            type="button"
                            className={cn(
                              "focus-ring grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border px-3 py-2 text-left transition",
                              entry.active
                                ? "border-primary bg-primary/10 text-on-surface shadow-m3-1"
                                : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-outline hover:bg-surface-container",
                            )}
                            data-builder-rust-outline-entry={entry.kind}
                            data-builder-rust-outline-entry-kind={rustOutlineKindLabel(entry.kind)}
                            onClick={() => openRustLogicOutlineEntry(entry)}
                          >
                            <span
                              className={cn(
                                "flex size-7 items-center justify-center rounded-full border text-[0.68rem] font-medium",
                                entry.line
                                  ? "border-outline-variant bg-surface-container-high text-on-surface"
                                  : "border-dashed border-outline text-on-surface-variant",
                              )}
                            >
                              {entry.line ?? "--"}
                            </span>
                            <span className="min-w-0">
                              <span className="flex min-w-0 items-center gap-1.5">
                                <span className="truncate font-mono text-xs text-on-surface">{entry.label}</span>
                                <StateLabel className="shrink-0" label={rustOutlineKindLabel(entry.kind)} />
                              </span>
                              <span className="mt-0.5 block truncate text-[0.68rem]">
                                {entry.line && entry.endLine && entry.endLine > entry.line ? `Ln ${entry.line}-${entry.endLine} · ` : ""}
                                {entry.detail}
                              </span>
                            </span>
                            <CornerDownRight aria-hidden className="size-3.5 shrink-0" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-[16px] border border-dashed border-outline-variant bg-surface-container-low px-3 py-3 leading-5 text-on-surface-variant">
                        {logicSearchNeedle ? "没有匹配当前搜索的大纲项。" : "当前 Rust 逻辑里还没有可解析函数。创建命令或插入草稿后会生成可跳转大纲。"}
                      </div>
                    )}
                  </div>
                  <div
                    className="rounded-[20px] border border-outline-variant bg-surface-container-high p-3 text-xs"
                    data-builder-rust-backend-topology=""
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-on-surface">后端拓扑</h3>
                        <p className="mt-1 leading-5 text-on-surface-variant">
                          Rust 作为主后端，统一连接命令、模块、依赖、外部进程和状态。
                        </p>
                      </div>
                      <span className="text-[0.68rem] text-on-surface-variant">Rust 优先</span>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {rustBackendTopology.map((node: any) => (
                        <button
                          key={node.id}
                          type="button"
                          className="focus-ring grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2 text-left text-on-surface-variant transition hover:border-outline hover:bg-surface-container"
                          data-builder-rust-backend-topology-node={node.id}
                          onClick={() => openRustBackendTopologyNode(node.id)}
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-on-surface">{node.label}</span>
                            <span className="mt-0.5 block truncate text-[0.68rem]">{node.detail}</span>
                          </span>
                          <StateLabel showQuiet variant={node.tone === "ready" ? "secondary" : "outline"} className="shrink-0" label={node.badge} />
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
                <section
                  className="mb-4 rounded-[20px] border border-outline-variant bg-surface-container-high p-3 text-xs"
                  data-builder-logic-context-summary=""
                  data-builder-logic-context-summary-count={logicContextSummaryItems.length}
                  data-builder-logic-context-summary-signal={logicWorkflowRow ? logicWorkflowRow.eventName : "none"}
                  data-builder-logic-context-summary-command={sanitizeRustCommandName(activeRustCommand.name)}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-on-surface">逻辑上下文</h3>
                        <StateLabel
                          showQuiet
                          variant={logicWorkflowRow?.command ? "secondary" : "outline"}
                          label={logicWorkflowRow?.command ? "信号槽就绪" : logicWorkflowRow ? "待绑定" : "等待选择"}
                        />
                        <StateLabel
                          showQuiet
                          label={activeRustCommandSlotState === "located" ? "槽已定位" : "槽待生成"}
                        />
                      </div>
                      <p className="mt-1 leading-5 text-on-surface-variant">
                        把当前 UI 信号、Rust 光标、活跃 command 和运行证据合在一处，先给出上下文，再进入具体编辑面板。
                      </p>
                    </div>
                    <StateBadge
                      variant={buildDiagnostics.length > 0 ? "destructive" : "outline"}
                      label={
                        buildDiagnostics.length > 0
                          ? `${buildDiagnostics.length} 诊断`
                          : latestSimulatorTrace
                            ? simulatorTraceStatusLabel(latestSimulatorTrace.status)
                            : "未运行"
                      }
                    />
                  </div>
                  <div className="mt-3 grid gap-2 xl:grid-cols-4" role="list" aria-label="逻辑上下文摘要">
                    {logicContextSummaryItems.map((item: any) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="listitem"
                          className={cn(
                            "focus-ring grid min-h-[6.25rem] min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] rounded-2xl border px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-m3-1 disabled:cursor-not-allowed disabled:opacity-55",
                            item.tone === "primary" && "border-primary/45 bg-primary/10 text-on-surface",
                            item.tone === "ready" && "border-outline-variant bg-surface-container-low text-on-surface hover:border-primary/35",
                            item.tone === "warning" && "border-destructive/30 bg-destructive/10 text-on-surface",
                            item.tone === "danger" && "border-destructive/40 bg-destructive/10 text-on-surface",
                            item.tone === "muted" && "border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-outline hover:text-on-surface",
                          )}
                          data-builder-logic-context-card={item.id}
                          data-builder-logic-context-card-tone={item.tone}
                          data-builder-logic-context-card-disabled={item.disabled ? "true" : "false"}
                          disabled={item.disabled}
                          onClick={item.onAction}
                        >
                          <span className="flex min-w-0 items-center justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest text-primary">
                                <ItemIcon aria-hidden className="size-4" />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-medium text-on-surface">{item.title}</span>
                                <span className="mt-0.5 block truncate text-[0.62rem] text-on-surface-variant">{item.actionLabel}</span>
                              </span>
                            </span>
                            <StateLabel showQuiet variant={item.tone === "danger" || item.tone === "warning" ? "outline" : item.tone === "primary" || item.tone === "ready" ? "secondary" : "outline"} className="shrink-0" label={item.badge} />
                          </span>
                          <span className="mt-2 line-clamp-2 leading-4 text-on-surface-variant">{item.detail}</span>
                          <span
                            className="mt-2 inline-flex items-center gap-1 text-primary"
                            data-builder-logic-context-card-action={item.id}
                          >
                            <span>{item.actionLabel}</span>
                            <ArrowRight aria-hidden className="size-3.5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
                <section
                  className="mb-4 rounded-[20px] border border-outline-variant bg-surface-container-high p-3 text-xs"
                  data-builder-logic-workbench-next-actions=""
                  data-builder-logic-workbench-next-action-count={logicWorkbenchNextActions.length}
                  data-builder-logic-workbench-primary-action={logicWorkbenchPrimaryAction?.id ?? "none"}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium text-on-surface">逻辑工作台下一步</h3>
                        <StateLabel
                          showQuiet
                          variant={logicWorkbenchPrimaryAction?.tone === "warning" ? "outline" : "secondary"}
                          label={logicWorkbenchPrimaryAction?.badge ?? "就绪"}
                        />
                      </div>
                      <p className="mt-1 leading-5 text-on-surface-variant">
                        根据当前选中控件、信号/槽绑定、Rust 槽函数和运行证据，自动把最相关的操作放到最前面。
                      </p>
                    </div>
                    {logicWorkbenchPrimaryAction
                      ? (() => {
                          const PrimaryActionIcon = logicWorkbenchPrimaryAction.icon;
                          return (
                            <Button
                              size="sm"
                              variant={logicWorkbenchPrimaryAction.tone === "warning" || logicWorkbenchPrimaryAction.tone === "primary" ? "secondary" : "ghost"}
                              className="h-8 px-2.5 text-xs"
                              data-builder-logic-workbench-primary-run=""
                              onClick={logicWorkbenchPrimaryAction.onAction}
                              disabled={logicWorkbenchPrimaryAction.disabled}
                            >
                              <PrimaryActionIcon aria-hidden className="size-4" />
                              {logicWorkbenchPrimaryAction.actionLabel}
                            </Button>
                          );
                        })()
                      : null}
                  </div>
                  <div className="mt-3 grid gap-2 xl:grid-cols-4" role="list" aria-label="逻辑工作台推荐操作">
                    {logicWorkbenchNextActions.map((step: any, index: any) => {
                      const StepIcon = step.icon;
                      return (
                        <button
                          key={step.id}
                          type="button"
                          role="listitem"
                          className={cn(
                            "focus-ring grid min-h-[6.5rem] min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] rounded-2xl border px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-m3-1 disabled:cursor-not-allowed disabled:opacity-55",
                            step.tone === "primary" && "border-primary/45 bg-primary/10 text-on-surface",
                            step.tone === "warning" && "border-destructive/30 bg-destructive/10 text-on-surface",
                            step.tone === "ready" && "border-outline-variant bg-surface-container-low text-on-surface hover:border-primary/35",
                            step.tone === "muted" && "border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-outline hover:text-on-surface",
                          )}
                          data-builder-logic-workbench-next-action={step.id}
                          data-builder-logic-workbench-next-action-tone={step.tone}
                          data-builder-logic-workbench-next-action-primary={logicWorkbenchPrimaryAction?.id === step.id ? "true" : undefined}
                          disabled={step.disabled}
                          onClick={step.onAction}
                        >
                          <span className="flex min-w-0 items-center justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest text-primary">
                                <StepIcon aria-hidden className="size-4" />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-medium text-on-surface">{step.title}</span>
                                <span className="mt-0.5 block truncate text-[0.62rem] text-on-surface-variant">#{index + 1} · {step.actionLabel}</span>
                              </span>
                            </span>
                            <StateLabel showQuiet variant={step.tone === "warning" ? "destructive" : step.tone === "primary" || step.tone === "ready" ? "secondary" : "outline"} className="shrink-0" label={step.badge} />
                          </span>
                          <span className="mt-2 line-clamp-2 leading-4 text-on-surface-variant">{step.detail}</span>
                          <span className="mt-2 inline-flex items-center gap-1 text-primary">
                            <span>{step.actionLabel}</span>
                            <ArrowRight aria-hidden className="size-3.5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
                <section
                  className="mb-4 rounded-[20px] border border-outline-variant bg-surface-container-high p-3 text-xs"
                  data-builder-logic-slot-assistant=""
                  data-builder-logic-slot-assistant-state={logicSlotAssistantState}
                  data-builder-logic-slot-assistant-step-count={logicSlotAssistantRoute.length}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-on-surface">槽函数路径助手</h3>
                        <StateLabel
                          showQuiet
                          variant={logicSlotAssistantState === "ready" ? "secondary" : "outline"}
                          data-builder-logic-slot-assistant-state-badge=""
                          label={
                            logicSlotAssistantState === "ready"
                              ? "可运行"
                              : logicSlotAssistantState === "missing-slot"
                                ? "缺槽"
                                : logicSlotAssistantState === "unbound"
                                  ? "待绑定"
                                  : "等待信号"
                          }
                        />
                        {logicWorkflowRow ? <StateLabel label={logicWorkflowRow.eventName} /> : null}
                      </div>
                      <p className="mt-1 leading-5 text-on-surface-variant">
                        {logicWorkflowRow
                          ? `${getItemSummary(logicWorkflowRow.item)} 到 Rust 槽函数的完整路径。`
                          : "选择一个可触发事件的控件后，这里会显示从 UI 信号到 Rust 槽函数的路径。"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      <Button
                        size="sm"
                        variant={logicSlotAssistantState === "unbound" ? "secondary" : "ghost"}
                        disabled={!logicWorkflowRow}
                        data-builder-logic-slot-assistant-open-connections=""
                        onClick={() => {
                          if (logicWorkflowRow) {
                            openLogicConnectionSettings(logicWorkflowRow.item, logicWorkflowRow.eventName);
                          }
                        }}
                      >
                        <Settings2 aria-hidden className="size-4" />
                        连接
                      </Button>
                      <Button
                        size="sm"
                        variant={logicSlotAssistantState === "missing-slot" ? "secondary" : "ghost"}
                        disabled={!logicWorkflowRow?.command}
                        data-builder-logic-slot-assistant-open-slot=""
                        onClick={() => {
                          if (!logicWorkflowRow?.command) {
                            return;
                          }
                          if (logicWorkflowOutlineEntry) {
                            openRustLogicOutlineEntry(logicWorkflowOutlineEntry);
                            return;
                          }
                          appendMissingRustSlotForCommand(logicWorkflowRow.command.id);
                        }}
                      >
                        <CornerDownRight aria-hidden className="size-4" />
                        槽函数
                      </Button>
                      <Button
                        size="sm"
                        variant={logicSlotAssistantState === "ready" ? "secondary" : "ghost"}
                        disabled={!logicWorkflowRow?.command}
                        data-builder-logic-slot-assistant-run=""
                        onClick={() => {
                          if (logicWorkflowRow) {
                            runLogicSignalSlotEvent(logicWorkflowRow.item, logicWorkflowRow.eventName);
                          }
                        }}
                      >
                        <Play aria-hidden className="size-4" />
                        运行
                      </Button>
                    </div>
                  </div>
                  {logicSlotAssistantRoute.length > 0 ? (
                    <div className="mt-3 grid gap-2 lg:grid-cols-5" role="list" aria-label="槽函数路径">
                      {logicSlotAssistantRoute.map((step: any, index: any) => {
                        const StepIcon = step.icon;
                        return (
                          <article
                            key={step.id}
                            role="listitem"
                            className={cn(
                              "grid min-h-[8rem] min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] rounded-2xl border bg-surface-container-low p-2.5",
                              step.tone === "primary" && "border-primary/45 bg-primary/10",
                              step.tone === "warning" && "border-destructive/25 bg-destructive/10",
                              step.tone === "danger" && "border-destructive/40 bg-destructive/10",
                              step.tone === "ready" && "border-outline-variant",
                              step.tone === "muted" && "border-outline-variant opacity-80",
                            )}
                            data-builder-logic-slot-assistant-step={step.id}
                            data-builder-logic-slot-assistant-step-tone={step.tone}
                            data-builder-logic-slot-assistant-step-disabled={step.disabled ? "true" : "false"}
                          >
                            <div className="flex min-w-0 items-start justify-between gap-2">
                              <span
                                className={cn(
                                  "flex size-8 shrink-0 items-center justify-center rounded-xl border",
                                  step.tone === "primary" || step.tone === "ready"
                                    ? "border-primary/25 bg-primary/10 text-primary"
                                    : "border-outline-variant bg-surface-container-high text-on-surface-variant",
                                )}
                              >
                                <StepIcon aria-hidden className="size-4" />
                              </span>
                              <StateLabel
                                showQuiet
                                variant={step.tone === "danger" ? "destructive" : "secondary"}
                                className="min-w-0"
                                label={step.badge}
                              />
                            </div>
                            <div className="mt-2 min-w-0">
                              <p className="truncate font-medium text-on-surface">
                                {index + 1}. {step.title}
                              </p>
                              <p className="mt-1 line-clamp-2 min-h-8 leading-4 text-on-surface-variant">{step.detail}</p>
                            </div>
                            <Button
                              size="sm"
                              variant={step.tone === "primary" || step.tone === "warning" ? "secondary" : "ghost"}
                              className="mt-2 h-7 w-full justify-center px-2 text-[0.68rem]"
                              disabled={step.disabled}
                              data-builder-logic-slot-assistant-step-action={step.id}
                              onClick={step.onAction}
                            >
                              {step.actionLabel}
                            </Button>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-[18px] border border-dashed border-outline-variant bg-surface-container-low px-3 py-3 leading-5 text-on-surface-variant">
                      画布中选中 Button、Input、Switch、Select 等可触发事件的控件后，会出现槽函数路径。
                    </div>
                  )}
                  {recentSlotNavigationEntries.length > 0 ? (
                    <div className="mt-3 rounded-[18px] border border-outline-variant bg-surface-container-low p-2.5" data-builder-logic-slot-assistant-history="">
                      <div className="mb-2 flex min-w-0 flex-wrap items-center justify-between gap-2">
                        <span className="truncate text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">最近槽函数</span>
                        <CountReadout label={`${recentSlotNavigationEntries.length} 条`} count={recentSlotNavigationEntries.length} />
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {recentSlotNavigationEntries.slice(0, 4).map((entry: any) => (
                          <button
                            key={`slot-assistant-history-${entry.id}`}
                            type="button"
                            className="focus-ring min-w-0 rounded-2xl border border-outline-variant bg-surface-container-high px-3 py-2 text-left transition hover:border-primary/40"
                            data-builder-logic-slot-assistant-history-item={entry.commandId}
                            onClick={() => {
                              const command = activeProject.rustCommands.find((candidate: any) => candidate.id === entry.commandId);
                              if (command) {
                                selectRustCommand(command.id);
                                focusRustFunction(command.name);
                              }
                            }}
                          >
                            <span className="flex min-w-0 items-center justify-between gap-2">
                              <span className="truncate font-mono text-on-surface">{entry.commandName}</span>
                              <span className="shrink-0 text-[0.66rem] text-on-surface-variant">{entry.visitedAt}</span>
                            </span>
                            <span className="mt-1 block truncate text-[0.68rem] text-on-surface-variant">
                              {entry.itemName ? `${entry.itemName}.${entry.eventName ?? "event"}` : "命令入口"} · {entry.sourceLabel}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>
                <section
                  className="mb-4 rounded-[20px] border border-outline-variant bg-surface-container-high p-3 text-xs"
                  data-builder-logic-signal-slot-map=""
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium text-on-surface">信号 / 槽总览</h3>
                        {/* Which scope is listed is orientation the heading can
                            carry as plain text; "当前" on top of a selection is
                            the same fact twice. */}
                        <span className="text-[0.68rem] text-on-surface-variant">
                          {selectedItem ? "当前选中" : "当前 UI 文件"}
                        </span>
                        {logicSearchNeedle ? (
                          <CountReadout label={`筛选 ${filteredLogicSignalSlotRows.length}`} count={filteredLogicSignalSlotRows.length} />
                        ) : null}
                      </div>
                      <p className="mt-1 leading-5 text-on-surface-variant">
                        从画布选择控件后，这里直接显示事件、Rust command、输入载荷和结果回写。
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <CountReadout label={`${logicSignalSlotBoundCount} 已绑定`} count={logicSignalSlotBoundCount} />
                      <StateBadge
                        variant="outline"
                        label={`${logicSignalSlotUnboundCount} 待绑定`}
                        signal={logicSignalSlotUnboundCount > 0}
                      />
                    </div>
                  </div>
                  <div
                    className="mt-3 grid gap-2 md:grid-cols-4"
                    data-builder-logic-connection-health=""
                  >
                    {[
                      {
                        id: "health",
                        label: "连接健康",
                        value: `${logicConnectionHealthScore}%`,
                        detail: logicConnectionHealthStatus,
                        attention: logicSignalSlotUnboundCount > 0 || missingRustSlotCount > 0,
                      },
                      {
                        id: "signals",
                        label: "控件信号",
                        value: `${logicSignalSlotBoundCount}/${logicSignalSlotRows.length}`,
                        detail: logicSignalSlotUnboundCount > 0 ? `${logicSignalSlotUnboundCount} 个待绑定` : "全部已绑定",
                        attention: logicSignalSlotUnboundCount > 0,
                      },
                      {
                        id: "slots",
                        label: "槽函数",
                        value: `${logicConnectedSlotCount}/${rustSlotOutlineCount}`,
                        detail: missingRustSlotCount > 0 ? `${missingRustSlotCount} 个待生成` : "源码可跳转",
                        attention: missingRustSlotCount > 0,
                      },
                      {
                        id: "functions",
                        label: "手写函数",
                        value: String(rustFunctionOutlineCount),
                        detail: "可从大纲定位",
                        attention: false,
                      },
                    ].map((metric: any) => (
                      <article
                        key={metric.id}
                        className={cn(
                          "min-w-0 rounded-2xl border bg-surface-container-low px-3 py-2",
                          metric.attention ? "border-primary/35" : "border-outline-variant",
                        )}
                        data-builder-logic-health-metric={metric.id}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">{metric.label}</span>
                          <span
                            className={cn(
                              "size-1.5 shrink-0 rounded-full",
                              metric.attention ? "bg-primary" : "bg-tertiary",
                            )}
                          />
                        </div>
                        <div className="mt-2 flex min-w-0 items-end justify-between gap-2">
                          <span className="truncate text-base font-semibold text-on-surface">{metric.value}</span>
                          <span className="truncate text-[0.68rem] text-on-surface-variant">{metric.detail}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container-highest" aria-hidden="true">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width]",
                        logicSignalSlotUnboundCount > 0 || missingRustSlotCount > 0 ? "bg-primary" : "bg-tertiary",
                      )}
                      style={{ width: `${logicConnectionHealthScore}%` }}
                    />
                  </div>
                  {unboundLogicSignalSlotRows.length > 0 || missingRustSlotEntries.length > 0 ? (
                    <div
                      className="mt-3 rounded-[18px] border border-primary/25 bg-surface-container-low p-2.5"
                      data-builder-logic-quick-fixes=""
                    >
                      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 px-1">
                        <div className="min-w-0">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span className="truncate text-xs font-semibold text-on-surface">连接待办</span>
                            <StateBadge
                              label={`${unboundLogicSignalSlotRows.length} 信号未绑定`}
                              signal={unboundLogicSignalSlotRows.length > 0}
                            />
                            <StateBadge
                              label={`${missingRustSlotEntries.length} 槽函数缺失`}
                              signal={missingRustSlotEntries.length > 0}
                            />
                          </div>
                          <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">
                            像 Qt 的 Signals/Slots 面板一样，把需要连接或生成的项集中处理。
                          </p>
                        </div>
                        {missingRustSlotEntries.length > 0 ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 px-2 text-[0.68rem]"
                            onClick={appendMissingRustSlots}
                          >
                            <Wand2 aria-hidden className="size-3.5" />
                            补齐全部槽
                          </Button>
                        ) : null}
                      </div>
                      <div className="mt-2 grid gap-2 lg:grid-cols-2">
                        {unboundLogicSignalSlotRows.slice(0, 4).map((row: any) => (
                          <article
                            key={`unbound-${row.id}`}
                            className="grid min-w-0 gap-2 rounded-2xl border border-outline-variant bg-surface-container-high px-3 py-2 text-xs sm:grid-cols-[minmax(0,1fr)_auto]"
                            data-builder-logic-quick-fix="unbound-signal"
                          >
                            <div className="min-w-0">
                              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                <StateLabel label="信号" />
                                <span className="truncate font-medium text-on-surface">{getItemSummary(row.item)}</span>
                                <span className="font-mono text-on-surface-variant">{row.eventName}</span>
                              </div>
                              <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                                还没有 Rust command，创建后会自动打开同名槽函数。
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
                              <Button size="sm" variant="secondary" className="h-7 px-2 text-[0.68rem]" onClick={() => goToSlotForItem(row.item)}>
                                <CornerDownRight aria-hidden className="size-3.5" />
                                创建槽
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-[0.68rem]" onClick={() => openLogicConnectionSettings(row.item, row.eventName)}>
                                设置
                              </Button>
                            </div>
                          </article>
                        ))}
                        {missingRustSlotEntries.slice(0, 4).map((entry: any) => {
                          const command = activeProject.rustCommands.find((candidate: any) => candidate.id === entry.commandId);
                          return (
                            <article
                              key={`missing-slot-${entry.id}`}
                              className="grid min-w-0 gap-2 rounded-2xl border border-outline-variant bg-surface-container-high px-3 py-2 text-xs sm:grid-cols-[minmax(0,1fr)_auto]"
                              data-builder-logic-quick-fix="missing-slot"
                            >
                              <div className="min-w-0">
                                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                  <StateLabel label="槽函数" />
                                  <span className="truncate font-mono font-medium text-on-surface">{entry.label}</span>
                                  <span className="truncate text-on-surface-variant">{entry.bindingCount} 个绑定</span>
                                </div>
                                <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                                  {command ? `${sanitizeRustCommandName(command.name)} 缺少同名 #[tauri::command] 函数。` : "对应命令已不存在。"}
                                </p>
                              </div>
                              <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 px-2 text-[0.68rem]"
                                  disabled={!entry.commandId}
                                  onClick={() => entry.commandId && appendMissingRustSlotForCommand(entry.commandId)}
                                >
                                  <Wand2 aria-hidden className="size-3.5" />
                                  生成槽
                                </Button>
                                {command ? (
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[0.68rem]" onClick={() => selectRustCommand(command.id)}>
                                    命令
                                  </Button>
                                ) : null}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                      {unboundLogicSignalSlotRows.length > 4 || missingRustSlotEntries.length > 4 ? (
                        <p className="mt-2 px-1 text-[0.68rem] text-on-surface-variant">
                          还有 {Math.max(0, unboundLogicSignalSlotRows.length - 4) + Math.max(0, missingRustSlotEntries.length - 4)} 项待办，可通过搜索或下方总览继续处理。
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {filteredLogicConnectionRows.length > 0 ? (
                    <div
                      className="mt-3 overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low"
                      data-builder-logic-connection-matrix=""
                      data-builder-logic-connection-matrix-count={filteredLogicConnectionRows.length}
                    >
                      <div className="grid grid-cols-[1.1fr_0.9fr_1.05fr_0.9fr_1fr_auto] gap-2 border-b border-outline-variant bg-surface-container-high px-3 py-2 text-[0.62rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant max-xl:hidden">
                        <span>控件</span>
                        <span>信号</span>
                        <span>Command</span>
                        <span>槽函数</span>
                        <span>结果回写</span>
                        <span className="text-right">操作</span>
                      </div>
                      <div className="subtle-scrollbar max-h-[310px] overflow-auto">
                        {filteredLogicConnectionRows.map((row: any) => {
                          const rowCommandSchema = row.command ? commandResultSchema(row.command) : null;
                          const rowSlotEntry = row.command
                            ? rustLogicOutline.find((entry: any) => entry.kind === "slot" && entry.commandId === row.command?.id) ?? null
                            : null;
                          const rowSlotState = row.command ? (rowSlotEntry?.line ? "located" : "missing") : "unbound";
                          const rowResultState = row.command
                            ? row.outputSummary === "无回写"
                              ? "none"
                              : row.outputSummary.includes("状态缺失")
                                ? "broken"
                                : "mapped"
                            : "unbound";

                          return (
                            <article
                              key={`matrix-${row.id}`}
                              className={cn(
                                "grid gap-2 border-b border-outline-variant px-3 py-2.5 text-xs last:border-b-0 xl:grid-cols-[1.1fr_0.9fr_1.05fr_0.9fr_1fr_auto]",
                                row.selected && "bg-primary/10",
                              )}
                              data-builder-logic-connection-matrix-row={row.command ? "bound" : "unbound"}
                              data-builder-logic-connection-matrix-selected={row.selected ? "true" : "false"}
                            >
                              <button
                                type="button"
                                className="focus-ring min-w-0 rounded-xl text-left"
                                data-builder-logic-connection-matrix-source={row.item.id}
                                onClick={() => {
                                  setSelectedId(row.item.id);
                                  setRightDockTab("connections");
                                }}
                              >
                                <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                                  <span className="truncate font-medium text-on-surface">{getItemSummary(row.item)}</span>
                                  <StateLabel label={row.item.type} />
                                </span>
                                <span className="mt-1 block truncate text-[0.68rem] text-on-surface-variant">
                                  {activeFile.name} · x {Math.round(row.item.x)} y {Math.round(row.item.y)}
                                </span>
                              </button>
                              <div className="min-w-0" data-builder-logic-connection-matrix-signal={row.eventName}>
                                <div className="flex min-w-0 items-center gap-1.5">
                                  <span className="rounded-full bg-surface-container-highest px-2 py-0.5 font-mono text-[0.68rem] text-on-surface">
                                    {row.eventName}
                                  </span>
                                  <ArrowRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                                </div>
                                <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">{row.inputSummary}</p>
                              </div>
                              <div className="min-w-0">
                                <Select
                                  value={row.command?.id ?? "__none"}
                                  onValueChange={(value: any) => updateEventCommandForItem(row.item, row.eventName, value === "__none" ? "" : value, { keepConnectionView: true })}
                                >
                                  <SelectTrigger
                                    aria-label={`${getItemSummary(row.item)} ${row.eventName} 矩阵绑定命令`}
                                    className="h-8 min-w-0 bg-surface-container text-xs"
                                    data-builder-logic-connection-matrix-command-select=""
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__none">未绑定</SelectItem>
                                    {activeProject.rustCommands.map((command: any) => (
                                      <SelectItem key={command.id} value={command.id}>
                                        {sanitizeRustCommandName(command.name)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant" data-builder-logic-connection-matrix-command={row.command ? sanitizeRustCommandName(row.command.name) : "unbound"}>
                                  {row.command ? `${row.commandArgs.length} 参数 · ${rowCommandSchema?.mode ?? "text"}` : "选择已有 command 或创建槽函数"}
                                </p>
                              </div>
                              <div className="min-w-0" data-builder-logic-connection-matrix-slot-state={rowSlotState}>
                                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                  <StateLabel
                                    showQuiet
                                    variant={rowSlotState === "located" ? "secondary" : "outline"}
                                    label={rowSlotState === "located" ? "已定位" : rowSlotState === "missing" ? "待生成" : "未绑定"}
                                  />
                                  <span className="truncate font-mono text-[0.68rem] text-on-surface">
                                    {rowSlotEntry?.line ? `logic.rs:${rowSlotEntry.line}` : row.command ? sanitizeRustCommandName(row.command.name) : "无槽"}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="focus-ring mt-1 rounded-lg px-1.5 py-0.5 text-[0.68rem] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                                  data-builder-logic-connection-matrix-go-slot=""
                                  onClick={() => goToSlotForItem(row.item)}
                                >
                                  {rowSlotState === "located" ? "打开槽函数" : "创建/生成槽函数"}
                                </button>
                              </div>
                              <div className="min-w-0" data-builder-logic-connection-matrix-result={rowResultState}>
                                <p className="truncate text-on-surface">{row.outputSummary}</p>
                                <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                                  {row.command ? `result: ${rowCommandSchema?.mode ?? "text"}` : "等待绑定后配置"}
                                </p>
                              </div>
                              <div className="flex shrink-0 flex-wrap items-center gap-1.5 xl:justify-end" data-builder-logic-connection-matrix-actions="">
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-[0.68rem]" onClick={() => setSelectedId(row.item.id)}>
                                  控件
                                </Button>
                                <Button
                                  size="sm"
                                  variant={row.command ? "secondary" : "default"}
                                  className="h-7 px-2 text-[0.68rem]"
                                  data-builder-logic-connection-matrix-run=""
                                  disabled={!row.command}
                                  onClick={() => runLogicSignalSlotEvent(row.item, row.eventName)}
                                >
                                  <Play aria-hidden className="size-3.5" />
                                  运行
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-[0.68rem]" onClick={() => openLogicConnectionSettings(row.item, row.eventName)}>
                                  <Settings2 aria-hidden className="size-3.5" />
                                  设置
                                </Button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  {logicWorkflowSteps.length > 0 && logicWorkflowRow ? (
                    <div
                      className="mt-3 rounded-[18px] border border-outline-variant bg-surface-container-low p-2.5"
                      data-builder-logic-workflow=""
                      data-builder-logic-flow-board=""
                      data-builder-logic-workflow-state={logicWorkflowRow.command ? "bound" : "unbound"}
                    >
                      <div className="mb-2 flex min-w-0 flex-wrap items-center justify-between gap-2 px-1">
                        <div className="min-w-0">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span className="truncate text-xs font-semibold text-on-surface">当前逻辑工作流</span>
                            <StateBadge label={logicWorkflowRow.command ? "已绑定" : "待绑定"} />
                          </div>
                          <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">
                            {getItemSummary(logicWorkflowRow.item)}.{logicWorkflowRow.eventName}
                            {logicWorkflowRow.command ? ` -> ${sanitizeRustCommandName(logicWorkflowRow.command.name)}` : " -> Rust command"}
                          </p>
                        </div>
                        <CountReadout
                          className="shrink-0"
                          label={`${logicWorkflowSteps.filter((step: any) => !step.disabled && step.tone !== "muted").length}/${logicWorkflowSteps.length}`}
                          count={logicWorkflowSteps.filter((step: any) => !step.disabled && step.tone !== "muted").length}
                        />
                      </div>
                      <div className="grid gap-2 lg:grid-cols-4" data-builder-logic-flow-nodes="" role="list" aria-label="当前逻辑链路">
                        {logicWorkflowNodes.map((node: any, index: any) => {
                          const NodeIcon = node.icon;
                          return (
                            <article
                              key={node.id}
                              role="listitem"
                              className={cn(
                                "relative min-w-0 rounded-2xl border bg-surface-container-high p-3",
                                node.tone === "primary" && "border-primary/50 bg-primary/10",
                                node.tone === "warning" && "border-primary/35",
                                node.tone === "ready" && "border-outline-variant",
                                node.tone === "muted" && "border-outline-variant opacity-85",
                              )}
                              data-builder-logic-flow-node={node.id}
                              data-builder-logic-flow-selected-control={node.id === "control" ? getItemSummary(logicWorkflowRow.item) : undefined}
                              data-builder-logic-flow-rust-command={node.id === "command" ? (logicWorkflowRow.command ? sanitizeRustCommandName(logicWorkflowRow.command.name) : "unbound") : undefined}
                              data-builder-logic-flow-slot-state={
                                node.id === "source"
                                  ? logicWorkflowOutlineEntry?.line
                                    ? "located"
                                    : logicWorkflowRow.command
                                      ? "missing"
                                      : "blocked"
                                  : undefined
                              }
                            >
                              <div className="flex min-w-0 items-start justify-between gap-2">
                                <span
                                  className={cn(
                                    "flex size-8 shrink-0 items-center justify-center rounded-xl border",
                                    node.tone === "primary"
                                      ? "border-primary/35 bg-primary/10 text-primary"
                                      : "border-outline-variant bg-surface-container-low text-on-surface-variant",
                                  )}
                                >
                                  <NodeIcon aria-hidden className="size-4" />
                                </span>
                                <div className="flex min-w-0 items-center gap-1.5">
                                  {index < logicWorkflowNodes.length - 1 ? <ArrowRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" /> : null}
                                  <StateLabel className="min-w-0" label={projectExplorerBadgeLabel(node.badge)} />
                                </div>
                              </div>
                              <div className="mt-2 min-w-0">
                                <p className="truncate text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">{node.title}</p>
                                <p className="mt-1 truncate font-mono text-xs text-on-surface">{node.label}</p>
                                <p className="mt-1 line-clamp-2 min-h-8 text-[0.68rem] leading-4 text-on-surface-variant">{node.detail}</p>
                              </div>
                              <Button
                                size="sm"
                                variant={node.tone === "primary" || node.tone === "warning" ? "secondary" : "ghost"}
                                className="mt-2 h-7 w-full justify-center px-2 text-[0.68rem]"
                                disabled={node.disabled}
                                onClick={node.onAction}
                              >
                                {node.actionLabel}
                              </Button>
                            </article>
                          );
                        })}
                      </div>
                      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5 rounded-2xl border border-outline-variant bg-surface-container-high px-2 py-2" data-builder-logic-flow-actions="">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[0.68rem]"
                          data-builder-logic-flow-open-connections=""
                          onClick={() => openLogicConnectionSettings(logicWorkflowRow.item, logicWorkflowRow.eventName)}
                        >
                          <Settings2 aria-hidden className="size-3.5" />
                          连接设置
                        </Button>
                        <Button
                          size="sm"
                          variant={logicWorkflowRow.command ? "secondary" : "default"}
                          className="h-7 px-2 text-[0.68rem]"
                          data-builder-logic-flow-go-slot=""
                          onClick={() => goToSlotForItem(logicWorkflowRow.item)}
                        >
                          <CornerDownRight aria-hidden className="size-3.5" />
                          {logicWorkflowRow.command ? "打开槽" : "创建槽"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[0.68rem]"
                          data-builder-logic-flow-run-event=""
                          disabled={!logicWorkflowRow.command}
                          onClick={() => runLogicSignalSlotEvent(logicWorkflowRow.item, logicWorkflowRow.eventName)}
                        >
                          <Play aria-hidden className="size-3.5" />
                          运行事件
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[0.68rem]"
                          data-builder-logic-flow-generate-slot=""
                          disabled={!logicWorkflowRow.command || Boolean(logicWorkflowOutlineEntry?.line)}
                          onClick={() => {
                            if (logicWorkflowRow.command) {
                              appendMissingRustSlotForCommand(logicWorkflowRow.command.id);
                            }
                          }}
                        >
                          <Wand2 aria-hidden className="size-3.5" />
                          {logicWorkflowOutlineEntry?.line ? "槽已存在" : "生成缺失槽"}
                        </Button>
                      </div>
                      <div className="mt-2 grid gap-2 md:grid-cols-5" role="list" aria-label="当前逻辑工作流步骤">
                        {logicWorkflowSteps.map((step: any, index: any) => {
                          const StepIcon = step.icon;
                          return (
                            <article
                              key={step.id}
                              role="listitem"
                              className={cn(
                                "min-w-0 rounded-2xl border bg-surface-container-high p-2.5",
                                step.tone === "primary" && "border-primary/50 bg-primary/10",
                                step.tone === "warning" && "border-primary/40",
                                step.tone === "ready" && "border-outline-variant",
                                step.tone === "muted" && "border-outline-variant opacity-85",
                              )}
                              data-builder-logic-workflow-step={step.id}
                              data-builder-logic-workflow-step-disabled={step.disabled ? "true" : "false"}
                            >
                              <div className="flex min-w-0 items-start justify-between gap-2">
                                <span
                                  className={cn(
                                    "flex size-7 shrink-0 items-center justify-center rounded-xl border text-[0.68rem] font-medium",
                                    step.tone === "primary"
                                      ? "border-primary/30 bg-primary/10 text-primary"
                                      : "border-outline-variant bg-surface-container-low text-on-surface-variant",
                                  )}
                                >
                                  {index + 1}
                                </span>
                                <StateLabel
                                  showQuiet
                                  variant={step.tone === "warning" ? "outline" : "secondary"}
                                  className="min-w-0"
                                  label={step.badge}
                                />
                              </div>
                              <div className="mt-2 min-w-0">
                                <div className="flex min-w-0 items-center gap-1.5">
                                  <StepIcon aria-hidden className="size-3.5 shrink-0 text-primary" />
                                  <p className="truncate font-medium text-on-surface">{step.title}</p>
                                </div>
                                <p className="mt-1 line-clamp-2 min-h-8 text-[0.68rem] leading-4 text-on-surface-variant">{step.detail}</p>
                              </div>
                              <Button
                                size="sm"
                                variant={step.tone === "primary" || step.tone === "warning" ? "secondary" : "ghost"}
                                className="mt-2 h-7 w-full justify-center px-2 text-[0.68rem]"
                                disabled={step.disabled}
                                onClick={step.onAction}
                              >
                                {step.actionLabel}
                              </Button>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  {selectedLogicSignalSlotRow ? (
                    <div
                      className="mt-3 grid gap-3 rounded-[18px] border border-primary/30 bg-primary/10 p-3 text-xs md:grid-cols-[minmax(0,1fr)_auto]"
                      data-builder-logic-current-connection=""
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <StateLabel label={selectedLogicSignalSlotRow.command ? "当前连接" : "当前信号"} />
                          <span className="truncate font-medium text-on-surface">{getItemSummary(selectedLogicSignalSlotRow.item)}</span>
                          <span className="font-mono text-on-surface-variant">{selectedLogicSignalSlotRow.eventName}</span>
                          <ArrowRight aria-hidden className="size-3.5 text-on-surface-variant" />
                          <span className="min-w-0 truncate font-mono text-on-surface">
                            {selectedLogicSignalSlotRow.command ? sanitizeRustCommandName(selectedLogicSignalSlotRow.command.name) : "待绑定 Rust command"}
                          </span>
                        </div>
                        <div className="mt-2 grid gap-1 text-[0.68rem] text-on-surface-variant sm:grid-cols-2">
                          <span className="truncate">输入：{selectedLogicSignalSlotRow.inputSummary}</span>
                          <span className="truncate">输出：{selectedLogicSignalSlotRow.outputSummary}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
                        <Button size="sm" variant={selectedLogicSignalSlotRow.command ? "secondary" : "default"} data-builder-logic-current-go-slot="" onClick={() => goToSlotForItem(selectedLogicSignalSlotRow.item)}>
                          <CornerDownRight aria-hidden className="size-4" />
                          {selectedLogicSignalSlotRow.command ? "打开槽函数" : "创建槽函数"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!selectedLogicSignalSlotRow.command}
                          onClick={() => runLogicSignalSlotEvent(selectedLogicSignalSlotRow.item, selectedLogicSignalSlotRow.eventName)}
                        >
                          <Play aria-hidden className="size-4" />
                          运行
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openLogicConnectionSettings(selectedLogicSignalSlotRow.item, selectedLogicSignalSlotRow.eventName)}
                        >
                          <Settings2 aria-hidden className="size-4" />
                          设置
                        </Button>
                      </div>
                    </div>
                  ) : null}
                  {selectedItems.length > 1 ? (
                    <div className="mt-3 rounded-[16px] border border-outline-variant bg-surface-container-low px-3 py-2 leading-5 text-on-surface-variant">
                      已选择 {selectedItems.length} 个控件。信号/槽编辑以单个控件为单位，先在导航器或画布中聚焦一个控件即可继续。
                    </div>
                  ) : logicSignalSlotRows.length > 0 ? (
                    <div className="mt-3 divide-y divide-outline-variant overflow-hidden rounded-[16px] border border-outline-variant bg-surface-container-low">
                      {filteredLogicSignalSlotRows.map((row: any) => (
                        <div
                          key={row.id}
                          className={cn(
                            "grid gap-3 px-3 py-2.5 transition xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(13rem,0.75fr)_auto]",
                            row.selected && "bg-primary/10",
                          )}
                          data-builder-logic-signal-slot-row={row.command ? "bound" : "unbound"}
                        >
                          <button
                            type="button"
                            className="focus-ring min-w-0 rounded-xl text-left"
                            onClick={() => setSelectedId(row.item.id)}
                          >
                            <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                              <span className="truncate font-medium text-on-surface">{getItemSummary(row.item)}</span>
                              <StateLabel label={row.item.type} />
                              {row.selected ? <StateLabel label="选中" /> : null}
                            </span>
                            <span className="mt-1 block truncate text-[0.68rem] text-on-surface-variant">
                              {activeFile.name} · x {Math.round(row.item.x)} y {Math.round(row.item.y)}
                            </span>
                          </button>
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="rounded-full bg-surface-container-highest px-2 py-1 font-mono text-[0.68rem] text-on-surface">
                                {row.eventName}
                              </span>
                              <ArrowRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                              <span className="min-w-0 truncate font-mono text-on-surface">
                                {row.command ? sanitizeRustCommandName(row.command.name) : "未绑定 Rust command"}
                              </span>
                            </div>
                            <div className="mt-1 grid gap-1 text-[0.68rem] text-on-surface-variant sm:grid-cols-2">
                              <span className="truncate">输入：{row.inputSummary}</span>
                              <span className="truncate">输出：{row.outputSummary}</span>
                            </div>
                          </div>
                          <div className="min-w-0">
                            <Select
                              value={row.command?.id ?? "__none"}
                              onValueChange={(value: any) => updateEventCommandForItem(row.item, row.eventName, value === "__none" ? "" : value)}
                            >
                              <SelectTrigger
                                aria-label={`${getItemSummary(row.item)} ${row.eventName} 绑定命令`}
                                className="h-8 min-w-0 bg-surface-container text-xs"
                                data-builder-logic-command-select=""
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none">未绑定</SelectItem>
                                {activeProject.rustCommands.map((command: any) => (
                                  <SelectItem key={command.id} value={command.id}>
                                    {sanitizeRustCommandName(command.name)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="mt-1 block truncate text-[0.68rem] text-on-surface-variant">
                              {row.command ? `${row.commandArgs.length} 参数 · ${commandResultSchema(row.command).mode}` : "可直接选择已有命令"}
                            </span>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-1.5 lg:justify-end">
                            <Button size="sm" variant={row.command ? "secondary" : "default"} data-builder-logic-row-go-slot="" onClick={() => goToSlotForItem(row.item)}>
                              <CornerDownRight aria-hidden className="size-4" />
                              {row.command ? "槽函数" : "创建槽函数"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={!row.command}
                              onClick={() => runLogicSignalSlotEvent(row.item, row.eventName)}
                            >
                              <Play aria-hidden className="size-4" />
                              运行
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openLogicConnectionSettings(row.item, row.eventName)}>
                              <Settings2 aria-hidden className="size-4" />
                              设置
                            </Button>
                          </div>
                        </div>
                      ))}
                      {filteredLogicSignalSlotRows.length === 0 ? (
                        <div className="px-3 py-3 text-xs leading-5 text-on-surface-variant">
                          没有匹配当前搜索的信号/槽连接。
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-[16px] border border-dashed border-outline-variant bg-surface-container-low px-3 py-3 leading-5 text-on-surface-variant">
                      当前 UI 文件还没有可触发事件的控件。插入 Button、Input、Switch、Select、Checkbox 或 Radio 后，可以在这里连接 Rust 槽函数。
                    </div>
                  )}
                </section>
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
                          映射到 {fileNameFromPath(rustDiagnosticTarget.sourceFile)}:{rustDiagnosticTarget.sourceLine}
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
                  className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-[18px] border border-outline-variant bg-surface-container-high px-3 py-2 text-xs"
                  data-builder-rust-editor-evidence-toolbar=""
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-on-surface">Rust 证据</p>
                    <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">
                      从当前逻辑页快速打开问题、任务和运行日志，避免在构建页和底部 Dock 之间来回找。
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <Button
                      size="sm"
                      variant={bottomDockTab === "issues" ? "secondary" : "ghost"}
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-open-issues=""
                      onClick={() => openBottomDock("issues", false)}
                    >
                      <AlertTriangle aria-hidden className="size-4" />
                      问题
                      <CountReadout label={String(builderIssueCount)} count={builderIssueCount} />
                    </Button>
                    <Button
                      size="sm"
                      variant={bottomDockTab === "tasks" ? "secondary" : "ghost"}
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-open-tasks=""
                      onClick={() => openRelevantTaskDock(null, false)}
                    >
                      <ClipboardCopy aria-hidden className="size-4" />
                      任务
                      <CountReadout label={String(activeProjectTasks.length)} count={activeProjectTasks.length} />
                    </Button>
                    <Button
                      size="sm"
                      variant={bottomDockTab === "logs" ? "secondary" : "ghost"}
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-open-logs=""
                      onClick={() => openBottomDock("logs", false)}
                    >
                      <FileJson aria-hidden className="size-4" />
                      日志
                    </Button>
                  </div>
                </div>
                <div
                  className="mb-3 grid gap-2 rounded-[18px] border border-outline-variant bg-surface-container-high p-2 text-xs xl:grid-cols-[minmax(0,0.95fr)_minmax(0,0.85fr)_auto]"
                  data-builder-rust-editor-find=""
                  data-builder-rust-editor-find-count={rustFindMatches.length}
                >
                  <div className="flex min-w-0 items-center gap-2 rounded-xl bg-surface-container-highest px-2">
                    <Search aria-hidden className="size-4 shrink-0 text-on-surface-variant" />
                    <Input
                      aria-label="查找 Rust 源码"
                      value={rustFindQuery}
                      onChange={(event: any) => {
                        setRustFindQuery(event.target.value);
                        setRustFindActiveIndex(0);
                      }}
                      onKeyDown={handleRustFindInputKeyDown}
                      placeholder="查找源码，Ctrl+F 聚焦，Enter 跳转"
                      className="h-8 min-w-0 border-0 bg-transparent px-0 font-mono text-xs shadow-none focus-visible:border-transparent"
                      spellCheck={false}
                    />
                    <StateLabel
                      className="shrink-0"
                      label={
                        rustFindQuery
                          ? rustFindMatches.length > 0
                            ? `${clamp(rustFindActiveIndex, 0, Math.max(0, rustFindMatches.length - 1)) + 1}/${rustFindMatches.length}`
                            : "无匹配"
                          : "查找"
                      }
                    />
                  </div>
                  <div className="flex min-w-0 items-center gap-2 rounded-xl bg-surface-container-highest px-2">
                    <TextCursorInput aria-hidden className="size-4 shrink-0 text-on-surface-variant" />
                    <Input
                      aria-label="替换 Rust 源码"
                      value={rustReplaceQuery}
                      onChange={(event: any) => setRustReplaceQuery(event.target.value)}
                      onKeyDown={handleRustReplaceInputKeyDown}
                      placeholder="替换为... Ctrl+Enter 替换"
                      className="h-8 min-w-0 border-0 bg-transparent px-0 font-mono text-xs shadow-none focus-visible:border-transparent"
                      data-builder-rust-editor-replace=""
                      spellCheck={false}
                    />
                    <StateLabel className="shrink-0" label={rustReplaceQuery ? "替换" : "可删除"} />
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
                    <Button
                      size="sm"
                      variant={rustFindCaseSensitive ? "secondary" : "ghost"}
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-find-case=""
                      aria-pressed={rustFindCaseSensitive}
                      onClick={() => {
                        setRustFindCaseSensitive((current: any) => !current);
                        setRustFindActiveIndex(0);
                      }}
                    >
                      Aa
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-find-prev="" aria-label="上一个查找结果"
                      disabled={rustFindMatches.length === 0}
                      onClick={() => moveRustFindMatch(-1)}
                    >
                      <MoveUp aria-hidden className="size-4" />
                      上一个
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-find-next="" aria-label="下一个查找结果"
                      disabled={rustFindMatches.length === 0}
                      onClick={() => moveRustFindMatch(1)}
                    >
                      <MoveDown aria-hidden className="size-4" />
                      下一个
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-replace-current=""
                      disabled={!activeRustFindMatch}
                      onClick={replaceActiveRustFindMatch}
                    >
                      <TextCursorInput aria-hidden className="size-4" />
                      替换当前
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-replace-all=""
                      disabled={rustFindMatches.length === 0}
                      onClick={replaceAllRustFindMatches}
                    >
                      全部替换
                    </Button>
                    {activeRustFindMatch ? (
                      <span
                        className="min-w-0 max-w-[18rem] truncate rounded-full bg-surface-container-highest px-2 py-1 text-[0.68rem] text-on-surface-variant"
                        data-builder-rust-editor-find-active=""
                      >
                        Ln {activeRustFindMatch.line}, Col {activeRustFindMatch.column} · {activeRustFindMatch.preview || rustFindQuery}
                      </span>
                    ) : null}
                  </div>
                </div>
                <nav
                  className="subtle-scrollbar mb-3 flex min-w-0 items-center gap-1 overflow-x-auto rounded-[18px] border border-outline-variant bg-surface-container-high px-2 py-1.5 text-xs"
                  aria-label="Rust 编辑器当前位置"
                  data-builder-rust-editor-breadcrumbs=""
                >
                  <button
                    type="button"
                    className="focus-ring inline-flex h-7 max-w-[12rem] shrink-0 items-center gap-1.5 rounded-xl px-2 text-on-surface-variant transition hover:bg-surface-container-highest hover:text-on-surface"
                    data-builder-rust-editor-breadcrumb-project=""
                    data-builder-rust-editor-breadcrumb-segment="project"
                    onClick={() => {
                      setMode("project");
                      setLeftDockTab("project");
                      setSelectedProjectExplorerNodeId("rust-folder");
                    }}
                  >
                    <FolderOpen aria-hidden className="size-3.5" />
                    <span className="truncate">{activeProject.name}</span>
                  </button>
                  <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                  <button
                    type="button"
                    className="focus-ring inline-flex h-7 shrink-0 items-center gap-1.5 rounded-xl px-2 text-on-surface-variant transition hover:bg-surface-container-highest hover:text-on-surface"
                    data-builder-rust-editor-breadcrumb-source=""
                    data-builder-rust-editor-breadcrumb-segment="source"
                    onClick={() => focusRustLine(1, "Rust breadcrumb · logic.rs")}
                  >
                    <Braces aria-hidden className="size-3.5" />
                    <span className="font-mono">rust/logic.rs</span>
                  </button>
                  {rustCursorOutlineEntry ? (
                    <>
                      <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                      <button
                        type="button"
                        className="focus-ring inline-flex h-7 max-w-[16rem] shrink-0 items-center gap-1.5 rounded-xl bg-surface-container-highest px-2 text-on-surface transition hover:bg-secondary-container hover:text-secondary-container-foreground"
                        data-builder-rust-editor-breadcrumb-outline={rustCursorOutlineEntry.kind}
                        data-builder-rust-editor-breadcrumb-segment="outline"
                        onClick={() => openRustLogicOutlineEntry(rustCursorOutlineEntry)}
                      >
                        <CornerDownRight aria-hidden className="size-3.5" />
                        <span className="truncate">{rustOutlineKindTitle(rustCursorOutlineEntry.kind)} · {rustCursorOutlineEntry.label}</span>
                        {rustCursorOutlineRangeLabel ? <span className="shrink-0 font-mono text-[0.62rem] opacity-70">{rustCursorOutlineRangeLabel}</span> : null}
                      </button>
                    </>
                  ) : null}
                  {rustCursorSignalSlotRow ? (
                    <>
                      <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                      <button
                        type="button"
                        className="focus-ring inline-flex h-7 max-w-[16rem] shrink-0 items-center gap-1.5 rounded-xl px-2 text-on-surface-variant transition hover:bg-surface-container-highest hover:text-on-surface"
                        data-builder-rust-editor-breadcrumb-control=""
                        data-builder-rust-editor-breadcrumb-segment="control"
                        onClick={() => {
                          setSelectedId(rustCursorSignalSlotRow.item.id);
                          setMode("design");
                          setRightDockTab("connections");
                          showProjectJumpFeedback(
                            "success",
                            "已跳到绑定控件",
                            `${getItemSummary(rustCursorSignalSlotRow.item)}.${rustCursorSignalSlotRow.eventName} 已在设计器中选中。`,
                          );
                        }}
                      >
                        <MousePointer2 aria-hidden className="size-3.5" />
                        <span className="truncate">{getItemSummary(rustCursorSignalSlotRow.item)}.{rustCursorSignalSlotRow.eventName}</span>
                      </button>
                    </>
                  ) : null}
                </nav>
                <div
                  className="mb-3 grid gap-2 rounded-[18px] border border-outline-variant bg-surface-container-high p-2 text-xs lg:grid-cols-[minmax(0,1fr)_auto]"
                  data-builder-rust-editor-context=""
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest text-primary">
                      {rustCursorSignalSlotRow ? <CornerDownRight aria-hidden className="size-4" /> : <Braces aria-hidden className="size-4" />}
                    </span>
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-on-surface">{rustEditorContextTitle}</span>
                        <StateLabel label={rustCursorSignalSlotRow ? "UI 槽" : rustCursorOutlineEntry ? "Rust" : "全局"} />
                        <span className="text-[0.68rem] text-on-surface-variant">
                          {activeRustCompletion ? `补全 ${activeRustCompletion.kind}` : "Ctrl+Space"}
                        </span>
                        <CountReadout
                          label={rustSignatureHelp ? `${rustSignatureHelp.parameters.length} 参数` : "无签名"}
                          count={rustSignatureHelp?.parameters.length}
                          data-builder-rust-signature-source={rustSignatureHelp?.source ?? "none"}
                        />
                        <CountReadout label={`${buildDiagnostics.length} 诊断`} count={buildDiagnostics.length} />
                      </div>
                      <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">{rustEditorContextDetail}</p>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
                    <div
                      className="flex h-8 min-w-[12.5rem] items-center gap-1 rounded-xl bg-surface-container-highest px-2"
                      data-builder-rust-editor-rename-symbol=""
                      data-builder-rust-editor-rename-count={rustCurrentIdentifierOccurrences.length}
                    >
                      <TextCursorInput aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                      <Input
                        aria-label="重命名 Rust 当前符号"
                        value={rustRenameQuery}
                        onChange={(event: any) => setRustRenameQuery(event.target.value)}
                        onFocus={() => {
                          if (!rustRenameQuery && rustCurrentIdentifier) {
                            setRustRenameQuery(rustCurrentIdentifier.name);
                            window.requestAnimationFrame(() => rustRenameInputRef.current?.select());
                          }
                        }}
                        onKeyDown={handleRustRenameInputKeyDown}
                        placeholder={rustCurrentIdentifier ? rustCurrentIdentifier.name : "符号"}
                        className="h-7 w-24 min-w-0 border-0 bg-transparent px-0 font-mono text-[0.68rem] shadow-none focus-visible:border-transparent"
                        data-builder-rust-editor-rename-input=""
                        spellCheck={false}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-1.5 text-[0.68rem]"
                        data-builder-rust-editor-rename-symbol-action=""
                        disabled={!rustCurrentIdentifier}
                        onClick={rustRenameQuery.trim() ? renameRustSymbolAtCursor : prepareRustSymbolRename}
                      >
                        重命名
                      </Button>
                    </div>
                    <div
                      className="flex h-8 min-w-[9rem] items-center gap-1 rounded-xl bg-surface-container-highest px-2"
                      data-builder-rust-editor-goto-line=""
                    >
                      <Navigation aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                      <Input
                        aria-label="跳转 Rust 行列"
                        value={rustGoToLineQuery}
                        onChange={(event: any) => setRustGoToLineQuery(event.target.value)}
                        onKeyDown={handleRustGoToLineInputKeyDown}
                        placeholder="行:列"
                        className="h-7 w-16 min-w-0 border-0 bg-transparent px-0 font-mono text-[0.68rem] shadow-none focus-visible:border-transparent"
                        spellCheck={false}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-1.5 text-[0.68rem]"
                        data-builder-rust-editor-goto-line-action=""
                        onClick={goToRustLine}
                      >
                        跳转
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-copy-location=""
                      aria-label="复制 Rust 光标位置"
                      onClick={() => void copyRustEditorLocation()}
                    >
                      <Copy aria-hidden className="size-4" />
                      位置
                    </Button>
                    <Button
                      size="sm"
                      variant={rustCursorOutlineEntry?.line ? "secondary" : "ghost"}
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-select-symbol-range=""
                      aria-label="选择当前 Rust 符号范围"
                      disabled={!rustCursorOutlineEntry?.line}
                      onClick={selectCurrentRustOutlineRange}
                    >
                      <TextCursorInput aria-hidden className="size-4" />
                      选中符号
                    </Button>
                    {rustCursorSignalSlotRow ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs"
                          data-builder-rust-editor-focus-control=""
                          onClick={() => {
                            setSelectedId(rustCursorSignalSlotRow.item.id);
                            setMode("design");
                            setRightDockTab("connections");
                            setFeedbackPanelOpen(false);
                            setBottomDockExpanded(false);
                            setBottomDockMinimized(true);
                            showProjectJumpFeedback(
                              "success",
                              "已回到控件",
                              `${getItemSummary(rustCursorSignalSlotRow.item)} 的 ${rustCursorSignalSlotRow.eventName} 已在画布连接面板中聚焦。`,
                            );
                          }}
                        >
                          <MousePointer2 aria-hidden className="size-4" />
                          控件
                        </Button>
                        <Button size="sm" variant="secondary" className="h-8 px-2 text-xs" onClick={() => openLogicConnectionSettings(rustCursorSignalSlotRow.item, rustCursorSignalSlotRow.eventName)}>
                          <Settings2 aria-hidden className="size-4" />
                          连接设置
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => runLogicSignalSlotEvent(rustCursorSignalSlotRow.item, rustCursorSignalSlotRow.eventName)}>
                          <Play aria-hidden className="size-4" />
                          运行槽
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => focusRustFunction(activeRustCommand.name)}>
                        <Braces aria-hidden className="size-4" />
                        当前槽函数
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" className="h-8 px-2 text-xs" onClick={insertActiveRustCommandDraft}>
                      <Wand2 aria-hidden className="size-4" />
                      命令草稿
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-toggle-comment=""
                      onClick={toggleRustLineComment}
                    >
                      <MessageSquare aria-hidden className="size-4" />
                      注释
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-duplicate-line=""
                      onClick={duplicateRustSelectionOrLine}
                    >
                      <Copy aria-hidden className="size-4" />
                      复制行
                    </Button>
                    <div className="flex h-8 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-highest" data-builder-rust-editor-move-line="">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-none border-r border-outline-variant px-2 text-xs"
                        data-builder-rust-editor-move-line-up=""
                        aria-label="上移 Rust 行"
                        onClick={() => moveRustSelectionLines(-1)}
                      >
                        <MoveUp aria-hidden className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-none px-2 text-xs"
                        data-builder-rust-editor-move-line-down=""
                        aria-label="下移 Rust 行"
                        onClick={() => moveRustSelectionLines(1)}
                      >
                        <MoveDown aria-hidden className="size-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-format=""
                      onClick={formatRustLogicSource}
                    >
                      <Braces aria-hidden className="size-4" />
                      格式化
                    </Button>
                    <Button
                      size="sm"
                      variant={rustEditorWordWrap ? "secondary" : "ghost"}
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-word-wrap=""
                      aria-pressed={rustEditorWordWrap}
                      onClick={toggleRustEditorWordWrap}
                    >
                      <ScrollText aria-hidden className="size-4" />
                      折行
                    </Button>
                    <Button
                      size="sm"
                      variant={rustSyntaxHighlightVisible ? "secondary" : "ghost"}
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-syntax-toggle=""
                      aria-pressed={rustSyntaxHighlightVisible}
                      onClick={() => setRustSyntaxHighlightVisible((visible: any) => !visible)}
                    >
                      <Braces aria-hidden className="size-4" />
                      高亮
                    </Button>
                    {missingRustSlotCount > 0 ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 px-2 text-xs"
                        data-builder-rust-editor-create-missing-slots=""
                        onClick={appendMissingRustSlots}
                      >
                        <Wand2 aria-hidden className="size-4" />
                        补齐缺失槽
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      onClick={() =>
                        insertRustSnippet(createRustNovaJsonResultSnippet(`${sanitizeRustCommandName(activeRustCommand.name)} handled`, activeProject.stateVariables))
                      }
                    >
                      <FileJson aria-hidden className="size-4" />
                      JSON 响应
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      data-builder-rust-editor-insert-state-patch=""
                      onClick={() => insertRustSnippet(createRustStatePatchLiteral(activeProject.stateVariables))}
                    >
                      <FileJson aria-hidden className="size-4" />
                      状态 Patch
                    </Button>
                  </div>
                </div>
                <section
                  className="mb-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3 text-xs"
                  data-builder-logic-command-center=""
                  data-builder-logic-command-center-command={sanitizeRustCommandName(activeRustCommand.name)}
                  data-builder-logic-command-center-slot-state={activeRustCommandSlotState}
                  data-builder-logic-command-center-caller-count={activeRustCommandBindingRows.length}
                  data-builder-logic-command-center-primary-caller={activeRustCommandPrimaryCaller ? activeRustCommandPrimaryCaller.id : "none"}
                >
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-surface-container-highest text-primary">
                        <Braces aria-hidden className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-on-surface">当前 Rust Command</h3>
                          <StateLabel className="font-mono" label={sanitizeRustCommandName(activeRustCommand.name)} />
                          <StateLabel label={activeRustCommandSlotLocationLabel} />
                          <CountReadout label={`${activeRustCommandBindingRows.length} UI 调用`} count={activeRustCommandBindingRows.length} />
                        </div>
                        <p className="mt-1 line-clamp-2 leading-5 text-on-surface-variant">
                          {activeRustCommandPrimaryCaller
                            ? `${getItemSummary(activeRustCommandPrimaryCaller.item)}.${activeRustCommandPrimaryCaller.eventName} 是当前主调用入口，输入 ${activeRustCommandPrimaryCaller.inputSummary}，输出 ${activeRustCommandPrimaryCaller.outputSummary}。`
                            : "还没有 UI 事件调用当前命令。可以先查看连接矩阵，或从候选信号绑定到当前 command。"}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={activeRustCommandSlotState === "located" ? "secondary" : "default"}
                      className="h-8 px-2 text-xs"
                      data-builder-logic-command-center-open-slot=""
                      onClick={openActiveRustCommandSlot}
                    >
                      <CornerDownRight aria-hidden className="size-4" />
                      {activeRustCommandSlotActionLabel}
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-4" data-builder-logic-command-center-stats="">
                    {activeRustCommandImpactStats.map((stat: any) => {
                      const StatIcon = stat.icon;
                      return (
                        <div
                          key={stat.id}
                          className="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2"
                          data-builder-logic-command-center-stat={stat.id}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <StatIcon aria-hidden className="size-3.5 shrink-0 text-primary" />
                            <span className="truncate text-[0.68rem] font-medium text-on-surface-variant">{stat.label}</span>
                          </div>
                          <p className="mt-1 truncate font-mono text-sm font-semibold text-on-surface">{stat.value}</p>
                          <p className="mt-1 line-clamp-2 leading-4 text-[0.68rem] text-on-surface-variant">{stat.detail}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4" data-builder-logic-command-center-actions="">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="justify-start"
                      data-builder-logic-command-center-focus-caller=""
                      disabled={!activeRustCommandPrimaryCaller}
                      onClick={focusActiveRustCommandPrimaryCaller}
                    >
                      <MousePointer2 aria-hidden className="size-4" />
                      回到调用控件
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="justify-start"
                      data-builder-logic-command-center-run=""
                      disabled={!activeRustCommandPrimaryCaller}
                      onClick={runActiveRustCommandPrimaryCaller}
                    >
                      <Play aria-hidden className="size-4" />
                      运行主调用
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-start"
                      data-builder-logic-command-center-map=""
                      disabled={!activeRustCommandPrimaryCaller}
                      onClick={openActiveRustCommandPrimaryMapping}
                    >
                      <Settings2 aria-hidden className="size-4" />
                      输入输出映射
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-start"
                      data-builder-logic-command-center-connections=""
                      onClick={() => setLogicResourceView("connections")}
                    >
                      <ListChecks aria-hidden className="size-4" />
                      连接矩阵
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-start"
                      data-builder-logic-command-center-copy-invoke=""
                      onClick={() => void copyActiveRustCommandInvokeName()}
                    >
                      <ClipboardCopy aria-hidden className="size-4" />
                      复制 invoke 名称
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-start"
                      data-builder-logic-command-center-insert-json=""
                      onClick={() =>
                        insertRustSnippet(createRustNovaJsonResultSnippet(`${sanitizeRustCommandName(activeRustCommand.name)} handled`, activeProject.stateVariables))
                      }
                    >
                      <FileJson aria-hidden className="size-4" />
                      插入 JSON 响应
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-start"
                      data-builder-logic-command-center-insert-patch=""
                      onClick={() => insertRustSnippet(createRustStatePatchLiteral(activeProject.stateVariables))}
                    >
                      <Activity aria-hidden className="size-4" />
                      插入状态 Patch
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-start"
                      data-builder-logic-command-center-select-command=""
                      onClick={() => selectRustCommand(activeRustCommand.id)}
                    >
                      <Braces aria-hidden className="size-4" />
                      固定当前命令
                    </Button>
                  </div>
                </section>
                <section
                  className="mb-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3 text-xs"
                  data-builder-rust-command-source-inspector=""
                  data-builder-rust-command-source-inspector-command={activeRustCommandInvokeName}
                  data-builder-rust-command-source-inspector-location={activeRustCommandSourceLineLabel}
                  data-builder-rust-command-source-inspector-callers={activeRustCommandBindingRows.length}
                  data-builder-rust-command-source-inspector-slot-state={activeRustCommandSlotState}
                >
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest text-primary">
                          <CornerDownRight aria-hidden className="size-4" />
                        </span>
                        <h3 className="truncate text-sm font-semibold text-on-surface">Rust Command 源码检查器</h3>
                        <StateLabel label={activeRustCommandSourceRangeLabel} />
                        <CountReadout
                          label={`${activeRustCommandBindingRows.length} 调用`}
                          count={activeRustCommandBindingRows.length}
                          data-builder-rust-command-source-inspector-caller-count=""
                        />
                      </div>
                      <p className="mt-1 line-clamp-2 leading-5 text-on-surface-variant">
                        把当前命令的 invoke 名称、logic.rs 位置、UI 调用者和返回回写放在同一个可操作面板里，方便从逻辑页直接完成跳转、运行和映射检查。
                      </p>
                    </div>
                    <code
                      className="min-w-0 max-w-full truncate rounded-xl border border-outline-variant bg-surface-container-low px-2.5 py-1.5 font-mono text-[0.68rem] text-on-surface"
                      data-builder-rust-command-source-inspector-payload=""
                    >
                      {activeRustCommandInvokePreview}
                    </code>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4" data-builder-rust-command-source-inspector-grid="">
                    {activeRustCommandSourceInspectorRows.map((row: any) => {
                      const RowIcon = row.icon;
                      return (
                        <div
                          key={row.id}
                          className="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2"
                          data-builder-rust-command-source-inspector-row={row.id}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <RowIcon aria-hidden className="size-3.5 shrink-0 text-primary" />
                            <span className="truncate text-[0.68rem] font-medium text-on-surface-variant">{row.label}</span>
                          </div>
                          <p className="mt-1 truncate font-mono text-sm font-semibold text-on-surface">{row.value}</p>
                          <p className="mt-1 line-clamp-2 leading-4 text-[0.68rem] text-on-surface-variant">{row.detail}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4" data-builder-rust-command-source-inspector-actions="">
                    <Button
                      size="sm"
                      variant={activeRustCommandSlotState === "located" ? "secondary" : "default"}
                      className="justify-start"
                      data-builder-rust-command-source-inspector-go-source=""
                      onClick={openActiveRustCommandSlot}
                    >
                      <CornerDownRight aria-hidden className="size-4" />
                      {activeRustCommandSlotActionLabel}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-start"
                      data-builder-rust-command-source-inspector-copy-invoke=""
                      onClick={() => void copyActiveRustCommandInvokeName()}
                    >
                      <ClipboardCopy aria-hidden className="size-4" />
                      复制 invoke
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-start"
                      data-builder-rust-command-source-inspector-run=""
                      disabled={!activeRustCommandPrimaryCaller}
                      onClick={runActiveRustCommandPrimaryCaller}
                    >
                      <Play aria-hidden className="size-4" />
                      运行主调用
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-start"
                      data-builder-rust-command-source-inspector-map=""
                      disabled={!activeRustCommandPrimaryCaller}
                      onClick={openActiveRustCommandPrimaryMapping}
                    >
                      <Settings2 aria-hidden className="size-4" />
                      映射检查
                    </Button>
                  </div>
                </section>
                <section
                  className="mb-3 space-y-2 rounded-[18px] border border-outline-variant bg-surface-container-high p-2 text-xs"
                  data-builder-rust-codelens=""
                  data-builder-rust-codelens-command={sanitizeRustCommandName(activeRustCommand.name)}
                  data-builder-rust-codelens-state={activeRustCommandCodeLensState}
                  data-builder-rust-codelens-caller-count={activeRustCommandBindingRows.length}
                  data-builder-rust-codelens-row-count={activeRustCommandCodeLensRows.length}
                  data-builder-rust-codelens-slot-line={activeRustCommandOutlineEntry?.line ?? "missing"}
                >
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 px-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest text-primary">
                        <CornerDownRight aria-hidden className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className="truncate font-medium text-on-surface">Rust 代码镜头</span>
                          <StateBadge
                            label={activeRustCommandBindingRows.length > 0 ? `${activeRustCommandBindingRows.length} UI 调用` : "待连接"}
                          />
                          <StateBadge
                            label={activeRustCommandOutlineEntry?.line ? `第 ${activeRustCommandOutlineEntry.line} 行` : "槽函数缺失"}
                            variant={activeRustCommandOutlineEntry?.line ? "outline" : "destructive"}
                          />
                        </div>
                        <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">
                          {sanitizeRustCommandName(activeRustCommand.name)} 的 UI 调用者、槽函数和映射操作集中在这里。
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      data-builder-rust-codelens-open-command=""
                      onClick={() => {
                        if (activeRustCommandOutlineEntry) {
                          openRustLogicOutlineEntry(activeRustCommandOutlineEntry);
                          return;
                        }
                        appendMissingRustSlotForCommand(activeRustCommand.id);
                      }}
                    >
                      <Braces aria-hidden className="size-4" />
                      {activeRustCommandOutlineEntry ? "打开槽" : "生成槽"}
                    </Button>
                  </div>
                  {activeRustCommandCodeLensRows.length > 0 ? (
                    <div className="grid gap-1.5 lg:grid-cols-2" data-builder-rust-codelens-rows="">
                      {activeRustCommandCodeLensRows.map((row: any) => (
                        <article
                          key={`rust-codelens-${row.id}`}
                          className={cn(
                            "min-w-0 rounded-2xl border p-2",
                            row.state === "bound"
                              ? "border-primary/20 bg-primary/10"
                              : "border-dashed border-outline-variant bg-surface-container-low",
                          )}
                          data-builder-rust-codelens-row={row.state}
                          data-builder-rust-codelens-event={row.eventName}
                        >
                          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                            <span className="truncate font-medium text-on-surface">{row.title}</span>
                            <StateLabel label={row.badge} />
                          </div>
                          <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">{row.detail}</p>
                          <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 px-2 text-[0.68rem]"
                              data-builder-rust-codelens-focus-caller=""
                              onClick={() => {
                                setSelectedId(row.item.id);
                                setMode("design");
                                setRightDockTab("connections");
                                setFeedbackPanelOpen(false);
                                setBottomDockExpanded(false);
                                setBottomDockMinimized(true);
                                showProjectJumpFeedback(
                                  "success",
                                  "已跳到 UI 调用者",
                                  `${getItemSummary(row.item)}.${row.eventName} 已在连接面板中聚焦。`,
                                );
                              }}
                            >
                              <MousePointer2 aria-hidden className="size-3.5" />
                              控件
                            </Button>
                            {row.state === "bound" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-[0.68rem]"
                                  data-builder-rust-codelens-open-slot=""
                                  onClick={() => goToSlotForItem(row.item)}
                                >
                                  <CornerDownRight aria-hidden className="size-3.5" />
                                  槽
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-[0.68rem]"
                                  data-builder-rust-codelens-run-caller=""
                                  onClick={() => runLogicSignalSlotEvent(row.item, row.eventName)}
                                >
                                  <Play aria-hidden className="size-3.5" />
                                  运行
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-[0.68rem]"
                                  data-builder-rust-codelens-open-mapping=""
                                  onClick={() => openLogicConnectionSettings(row.item, row.eventName)}
                                >
                                  <Settings2 aria-hidden className="size-3.5" />
                                  映射
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-[0.68rem]"
                                data-builder-rust-codelens-bind-candidate=""
                                onClick={() => updateEventCommandForItem(row.item, row.eventName, activeRustCommand.id)}
                              >
                                <ArrowRight aria-hidden className="size-3.5" />
                                绑定
                              </Button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-3 py-2 text-[0.68rem] leading-5 text-on-surface-variant" data-builder-rust-codelens-empty="">
                      当前 UI 文件还没有可调用 Rust command 的控件。添加 Button、Switch、Input 等交互控件后，CodeLens 会显示调用者。
                    </p>
                  )}
                </section>
                <section
                  className="mb-3 grid gap-3 rounded-[18px] border border-outline-variant bg-surface-container-high px-3 py-2 text-xs lg:grid-cols-[minmax(0,1fr)_auto]"
                  data-builder-rust-hover-doc=""
                  data-builder-rust-hover-kind={rustEditorHoverDoc.kind}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-surface-container-highest text-primary">
                      {rustEditorHoverDoc.kind === "command" || rustEditorHoverDoc.kind === "slot" ? (
                        <CornerDownRight aria-hidden className="size-4" />
                      ) : rustEditorHoverDoc.kind === "state" ? (
                        <Activity aria-hidden className="size-4" />
                      ) : (
                        <Braces aria-hidden className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-on-surface">{rustEditorHoverDoc.title}</h3>
                        <StateLabel className="font-mono" label={rustEditorHoverDoc.location} data-builder-rust-hover-location="" />
                      </div>
                      <p className="mt-1 line-clamp-2 leading-5 text-on-surface-variant">{rustEditorHoverDoc.detail}</p>
                      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
                        {rustEditorHoverDoc.badges.map((badge: any) => (
                          <span
                            key={badge}
                            className="max-w-[9rem] truncate rounded-full bg-surface-container-highest px-2 py-1 text-[0.68rem] text-on-surface-variant"
                            data-builder-rust-hover-badge={badge}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
                    {rustEditorHoverDoc.sourceLine ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        data-builder-rust-hover-open-source=""
                        onClick={() => focusRustLine(rustEditorHoverDoc.sourceLine ?? 1, `Rust 悬停 · ${rustEditorHoverDoc.title}`)}
                      >
                        <Navigation aria-hidden className="size-4" />
                        源码
                      </Button>
                    ) : null}
                    {rustEditorHoverDoc.commandId ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 px-2 text-xs"
                        data-builder-rust-hover-select-command=""
                        onClick={() => selectRustCommand(rustEditorHoverDoc.commandId ?? activeRustCommand.id)}
                      >
                        <Braces aria-hidden className="size-4" />
                        命令
                      </Button>
                    ) : null}
                    {rustEditorHoverDoc.controlItemId && rustEditorHoverDoc.controlEventName ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        data-builder-rust-hover-focus-control=""
                        onClick={() => {
                          const row = logicSignalSlotRows.find(
                            (candidate: any) =>
                              candidate.item.id === rustEditorHoverDoc.controlItemId &&
                              candidate.eventName === rustEditorHoverDoc.controlEventName,
                          );
                          if (!row) {
                            return;
                          }
                          setSelectedId(row.item.id);
                          setMode("design");
                          setRightDockTab("connections");
                          setFeedbackPanelOpen(false);
                          setBottomDockExpanded(false);
                          setBottomDockMinimized(true);
                          showProjectJumpFeedback(
                            "success",
                            "已回到控件",
                            `${getItemSummary(row.item)}.${row.eventName} 已从 Rust hover 文档跳回画布。`,
                          );
                        }}
                      >
                        <MousePointer2 aria-hidden className="size-4" />
                        控件
                      </Button>
                    ) : null}
                  </div>
                </section>
                <section
                  className="mb-3 rounded-[18px] border border-outline-variant bg-surface-container-high px-3 py-2"
                  data-builder-rust-editor-references=""
                  data-builder-rust-editor-reference-count={rustCurrentIdentifierReferences.length}
                >
                  <div className="mb-2 flex min-w-0 items-center justify-between gap-3 text-xs">
                    <div className="flex min-w-0 items-center gap-2">
                      <Search aria-hidden className="size-4 shrink-0 text-primary" />
                      <span className="truncate font-medium text-on-surface">当前符号引用</span>
                      <StateBadge
                        label={rustCurrentIdentifier ? `${rustCurrentIdentifier.name} · ${rustCurrentIdentifierReferences.length} 处` : "未选中"}
                        signal={!rustCurrentIdentifier}
                      />
                    </div>
                    <span className="hidden min-w-0 truncate text-[0.68rem] text-on-surface-variant md:block">
                      点击引用可选中源码中的具体标识符
                    </span>
                  </div>
                  {rustCurrentIdentifier ? (
                    <>
                      <div className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-3" data-builder-rust-editor-reference-list="">
                        {rustVisibleIdentifierReferences.map((reference: any) => (
                          <button
                            key={reference.id}
                            type="button"
                            className={cn(
                              "focus-ring grid min-h-[3.25rem] min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-2xl border px-2.5 py-2 text-left text-xs transition",
                              reference.role === "current"
                                ? "border-primary/35 bg-primary/10 text-on-surface hover:border-primary/60"
                                : "border-outline-variant bg-surface-container-highest text-on-surface-variant hover:border-outline hover:text-on-surface",
                            )}
                            data-builder-rust-editor-reference={reference.role}
                            data-builder-rust-editor-reference-line={reference.line}
                            onClick={() => focusRustIdentifierReference(reference)}
                          >
                            <span className="rounded-full bg-surface-container-lowest px-2 py-1 font-mono text-[0.62rem] text-primary">
                              Ln {reference.line}:{reference.column}
                            </span>
                            <span className="min-w-0">
                              <span className="flex min-w-0 items-center gap-1.5">
                                <span className="truncate font-medium text-on-surface">{reference.role === "current" ? "当前光标" : "引用"}</span>
                                <span
                                  className="shrink-0 rounded-full bg-surface-container-lowest px-1.5 py-0.5 text-[0.6rem] text-on-surface-variant"
                                  data-builder-rust-editor-reference-jump={reference.role}
                                >
                                  跳转
                                </span>
                              </span>
                              <span className="mt-1 block truncate font-mono text-[0.66rem] leading-4">{reference.preview}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                      {rustCurrentIdentifierReferences.length > rustVisibleIdentifierReferences.length ? (
                        <div
                          className="mt-2 rounded-2xl border border-dashed border-outline-variant bg-surface-container-highest px-3 py-2 text-xs text-on-surface-variant"
                          data-builder-rust-editor-reference-overflow=""
                        >
                          还有 {rustCurrentIdentifierReferences.length - rustVisibleIdentifierReferences.length} 处引用未显示；可使用重命名或查找继续处理。
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-highest px-3 py-3 text-xs text-on-surface-variant">
                      把光标放到 Rust 标识符上，即可查看引用位置并快速跳转。
                    </div>
                  )}
                </section>
                <section
                  className="mb-3 rounded-[18px] border border-outline-variant bg-surface-container-high px-3 py-2"
                  data-builder-rust-quick-fixes=""
                  data-builder-rust-quick-fix-count={rustEditorQuickFixes.length}
                  data-builder-rust-quick-fix-actionable-count={actionableRustQuickFixCount}
                >
                  <div className="mb-2 flex min-w-0 items-center justify-between gap-3 text-xs">
                    <div className="flex min-w-0 items-center gap-2">
                      <Wand2 aria-hidden className="size-4 shrink-0 text-primary" />
                      <span className="truncate font-medium text-on-surface">Rust 快速修复</span>
                      <CountReadout label={`${actionableRustQuickFixCount} 项可用`} count={actionableRustQuickFixCount} />
                    </div>
                    <span className="hidden truncate text-[0.68rem] text-on-surface-variant md:block">
                      槽函数、诊断、格式化和常用代码动作集中处理
                    </span>
                  </div>
                  <div className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-4">
                    {rustEditorQuickFixes.map((fix: any) => (
                      <button
                        key={fix.id}
                        type="button"
                        className={cn(
                          "focus-ring flex min-h-[4.25rem] min-w-0 items-start gap-2 rounded-2xl border px-3 py-2 text-left text-xs transition-colors disabled:pointer-events-none disabled:opacity-45",
                          fix.tone === "danger" && "border-destructive/30 bg-destructive/10 text-on-surface hover:border-destructive/60 hover:bg-destructive/20",
                          fix.tone === "warning" && "border-tertiary/30 bg-tertiary-container/40 text-on-surface hover:border-tertiary/60",
                          fix.tone === "ready" && "border-primary/25 bg-primary/10 text-on-surface hover:border-primary/50 hover:bg-primary/20",
                          fix.tone === "muted" && "border-outline-variant bg-surface-container-highest text-on-surface-variant hover:border-outline hover:text-on-surface",
                        )}
                        data-builder-rust-quick-fix={fix.id}
                        data-builder-rust-quick-fix-tone={fix.tone}
                        disabled={fix.disabled}
                        title={fix.detail}
                        onClick={fix.run}
                      >
                        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-primary">
                          {fix.tone === "danger" || fix.tone === "warning" ? (
                            <AlertTriangle aria-hidden className="size-4" />
                          ) : fix.tone === "ready" ? (
                            <Wand2 aria-hidden className="size-4" />
                          ) : (
                            <CheckCircle2 aria-hidden className="size-4" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="truncate font-medium">{fix.title}</span>
                            {fix.countLabel ? (
                              <span className="shrink-0 rounded-full bg-surface-container-lowest px-1.5 py-0.5 font-mono text-[0.62rem] text-on-surface-variant">
                                {fix.countLabel}
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-1 line-clamp-2 leading-4 text-on-surface-variant">{fix.detail}</span>
                        </span>
                        <span
                          className="mt-0.5 shrink-0 rounded-full bg-surface-container-lowest px-2 py-1 font-medium text-primary"
                          data-builder-rust-quick-fix-action={fix.id}
                        >
                          {fix.actionLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
                {rustSignatureHelp ? (
                  <div
                    className="mb-3 grid gap-2 rounded-[18px] border border-outline-variant bg-surface-container-high px-3 py-2 text-xs lg:grid-cols-[minmax(0,1fr)_auto]"
                    data-builder-rust-signature-help=""
                    data-builder-rust-signature-command={rustSignatureHelp.commandName}
                    data-builder-rust-signature-binding-count={rustSignatureHelp.bindingCount}
                  >
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate font-mono font-medium text-on-surface">{rustSignatureHelp.signature}</span>
                        <StateLabel label={rustSignatureHelp.source === "cursor-slot" ? "光标槽函数" : "当前命令"} />
                        <StateLabel label={rustSignatureHelp.resultSummary} data-builder-rust-signature-result="" />
                        <CountReadout label={`${rustSignatureHelp.bindingCount} UI 调用`} count={rustSignatureHelp.bindingCount} />
                      </div>
                      <div className="mt-2 flex min-w-0 gap-1.5 overflow-x-auto pb-0.5">
                        {rustSignatureHelp.parameters.length > 0 ? (
                          rustSignatureHelp.parameters.map((parameter: any, index: any) => {
                            const active = rustSignatureHelp.activeParameterIndex === index;
                            return (
                              <span
                                key={parameter.id}
                                className={cn(
                                  "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 font-mono text-[0.68rem]",
                                  active
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-outline-variant bg-surface-container-highest text-on-surface-variant",
                                )}
                                data-builder-rust-signature-parameter={parameter.name}
                                data-builder-rust-signature-active-parameter={active ? "true" : undefined}
                                title={parameter.detail}
                              >
                                <span>{parameter.name}</span>
                                <span className="opacity-70">:</span>
                                <span>{parameter.type}</span>
                              </span>
                            );
                          })
                        ) : (
                          <span
                            className="rounded-full border border-outline-variant bg-surface-container-highest px-2 py-1 text-[0.68rem] text-on-surface-variant"
                            data-builder-rust-signature-parameter="none"
                          >
                            无参数 command
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
                      <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => focusRustFunction(rustSignatureHelp.commandName)}>
                        <CornerDownRight aria-hidden className="size-4" />
                        定位签名
                      </Button>
                      <Button size="sm" variant="secondary" className="h-8 px-2 text-xs" onClick={() => selectRustCommand(rustSignatureHelp.commandId)}>
                        <Braces aria-hidden className="size-4" />
                        选择命令
                      </Button>
                    </div>
                  </div>
                ) : null}
                <section
                  className="mb-3 flex flex-wrap items-center gap-2 rounded-[18px] border border-outline-variant bg-surface-container-high px-3 py-2 text-xs"
                  data-builder-rust-syntax-legend=""
                  data-builder-rust-syntax-state={rustSyntaxHighlightVisible ? "visible" : "plain"}
                >
                  <div className="flex min-w-0 items-center gap-2 pr-1">
                    <Braces aria-hidden className="size-4 shrink-0 text-primary" />
                    <span className="truncate font-medium text-on-surface">语法高亮</span>
                    <StateLabel className="shrink-0" label={rustSyntaxHighlightVisible ? "开启" : "纯文本"} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                    {rustSyntaxLegendItems.map((item: any) => (
                      <span
                        key={item.id}
                        className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container px-2 py-1"
                        data-builder-rust-syntax-token={item.id}
                      >
                        <span className={cn("font-mono text-[0.68rem]", item.className)}>
                          {item.id === "comment"
                            ? "//"
                            : item.id === "string"
                              ? "\"text\""
                              : item.id === "number"
                                ? "42"
                                : item.id === "symbol"
                                  ? "name"
                                  : item.id === "bracket"
                                    ? "{}"
                                  : item.label}
                        </span>
                        <span className="truncate text-[0.66rem] text-on-surface-variant">{item.label}</span>
                      </span>
                    ))}
                  </div>
                </section>
                <div
                  className="order-first z-0 mb-2 grid min-h-0 flex-1 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-highest shadow-inner"
                  data-builder-rust-editor=""
                  data-builder-rust-code-primary=""
                  data-builder-rust-editor-scroll-policy="self-contained"
                  data-builder-rust-editor-word-wrap-state={rustEditorWordWrap ? "on" : "off"}
                  data-builder-rust-editor-syntax-state={rustSyntaxHighlightVisible ? "highlighted" : "plain"}
                >
                  <div className="grid h-full min-h-0 grid-cols-[4.5rem_minmax(0,1fr)_2.75rem]">
                    <div className="relative overflow-hidden border-r border-outline-variant bg-surface-container-high" data-builder-rust-diagnostic-gutter="">
                      <div className="py-3 transition-transform duration-75" style={{ transform: `translateY(-${rustEditorScrollTop}px)` }}>
                        {rustEditorLines.map((_: any, index: any) => {
                          const lineNumber = index + 1;
                          const lineDiagnostics = rustDiagnosticsBySourceLine.get(lineNumber) ?? [];
                          const hasError = lineDiagnostics.some((entry: any) => entry.diagnostic.severity === "error");
                          const hasWarning = lineDiagnostics.some((entry: any) => entry.diagnostic.severity === "warning");
                          const isActiveDiagnosticLine = rustDiagnosticTarget?.sourceLine === lineNumber;
                          const isCursorLine = rustEditorSelection.line === lineNumber;
                          const hasFindMatch = rustFindLineSet.has(lineNumber);
                          const isActiveFindLine = activeRustFindMatch?.line === lineNumber;
                          return (
                            <button
                              key={lineNumber}
                              type="button"
                              className={cn(
                                "focus-ring flex h-5 w-full items-center justify-between gap-2 px-3 font-mono text-[0.68rem] leading-5 text-on-surface-variant transition hover:bg-surface-container-highest hover:text-on-surface",
                                isActiveDiagnosticLine && "bg-primary/10 text-on-surface",
                                isActiveFindLine && !isActiveDiagnosticLine && "bg-tertiary/15 text-on-surface",
                                hasFindMatch && !isActiveFindLine && !isActiveDiagnosticLine && "bg-tertiary/5 text-on-surface",
                                isCursorLine && !isActiveDiagnosticLine && !hasFindMatch && "bg-surface-container-highest text-on-surface",
                              )}
                              data-builder-rust-diagnostic-gutter-line={lineDiagnostics.length > 0 ? String(lineNumber) : undefined}
                              aria-label={
                                lineDiagnostics.length > 0
                                  ? `打开第 ${lineNumber} 行的 Rust 诊断`
                                  : `跳转到 Rust 第 ${lineNumber} 行`
                              }
                              title={
                                lineDiagnostics.length > 0
                                  ? `${lineDiagnostics.length} 个诊断 · 点击定位`
                                  : `跳转到第 ${lineNumber} 行`
                              }
                              onClick={() => openRustDiagnosticFromGutter(lineNumber, lineDiagnostics)}
                            >
                              <span
                                aria-hidden
                                className={cn(
                                  "size-1.5 rounded-full",
                                  hasError ? "bg-destructive" : hasWarning ? "bg-primary" : isActiveFindLine ? "bg-tertiary" : hasFindMatch ? "bg-tertiary/70" : "bg-transparent",
                                )}
                              />
                              <span className="tabular-nums">{lineNumber}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="relative min-w-0">
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="py-3 transition-transform duration-75" style={{ transform: `translateY(-${rustEditorScrollTop}px)` }}>
                          {rustEditorLines.map((_: any, index: any) => {
                            const lineNumber = index + 1;
                            const lineDiagnostics = rustDiagnosticsBySourceLine.get(lineNumber) ?? [];
                            const isActiveDiagnosticLine = rustDiagnosticTarget?.sourceLine === lineNumber;
                            const isCursorLine = rustEditorSelection.line === lineNumber;
                            const hasDiagnostic = lineDiagnostics.length > 0;
                            const hasFindMatch = rustFindLineSet.has(lineNumber);
                            const isActiveFindLine = activeRustFindMatch?.line === lineNumber;
                            return (
                              <div
                                key={lineNumber}
                                className={cn(
                                  "h-5 border-l-2 border-transparent",
                                  isActiveDiagnosticLine
                                    ? "border-primary bg-primary/10"
                                    : hasDiagnostic
                                      ? "border-destructive/60 bg-destructive/5"
                                      : isActiveFindLine
                                        ? "border-tertiary bg-tertiary/15"
                                        : hasFindMatch
                                          ? "border-tertiary/50 bg-tertiary/5"
                                          : isCursorLine
                                            ? "border-outline bg-surface-container-high/70"
                                            : "",
                                )}
                              />
                            );
                          })}
                        </div>
                      </div>
                      {rustSyntaxHighlightVisible ? (
                        <pre
                          className="pointer-events-none absolute inset-0 overflow-hidden px-4 py-3 font-mono text-xs leading-5 text-on-surface"
                          aria-hidden="true"
                          data-builder-rust-syntax-overlay=""
                        >
                          <code
                            className={cn(
                              "block transition-transform duration-75",
                              rustEditorWordWrap ? "whitespace-pre-wrap break-words pr-4" : "whitespace-pre",
                            )}
                            style={{ transform: `translate(${rustEditorWordWrap ? 0 : -rustEditorScrollLeft}px, -${rustEditorScrollTop}px)` }}
                          >
                            {rustEditorLines.map((line: any, index: any) => (
                              <div
                                key={`rust-highlight-${index}`}
                                className={cn("min-h-5", rustEditorWordWrap ? "whitespace-pre-wrap break-words" : "h-5 whitespace-pre")}
                              >
                                {renderRustHighlightedLine(
                                  line,
                                  index,
                                  rustCurrentIdentifier?.name,
                                  rustBracketMatchIndexes,
                                  rustEditorLineStartIndexes[index] ?? 0,
                                )}
                              </div>
                            ))}
                          </code>
                        </pre>
                      ) : null}
                      <Textarea
                        ref={rustLogicRef}
                        data-builder-rust-logic=""
                        aria-label="Rust 逻辑编辑器"
                        value={activeProject.rustLogic}
                        onChange={(event: any) => {
                          setRustCompletionCommit(null);
                          updateRustLogic(event.currentTarget.value);
                          updateRustEditorSelectionFromEditor(event.currentTarget);
                          updateRustCompletionFromEditor(event.currentTarget);
                        }}
                        onKeyDown={handleRustEditorKeyDown}
                        onKeyUp={(event: any) => updateRustEditorSelectionFromEditor(event.currentTarget)}
                        onClick={(event: any) => updateRustEditorSelectionFromEditor(event.currentTarget)}
                        onSelect={(event: any) => {
                          updateRustEditorSelectionFromEditor(event.currentTarget);
                          if (rustCompletionTrigger) {
                            updateRustCompletionFromEditor(event.currentTarget, rustCompletionTrigger.forced);
                          }
                        }}
                        onBlur={() => window.setTimeout(() => setRustCompletionTrigger(null), 120)}
                        onScroll={(event: any) => {
                          setRustEditorScrollTop(event.currentTarget.scrollTop);
                          setRustEditorScrollLeft(rustEditorWordWrap ? 0 : event.currentTarget.scrollLeft);
                        }}
                        className={cn(
                          "relative z-10 h-full min-h-0 resize-none overflow-auto rounded-none border-0 bg-transparent px-4 py-3 font-mono text-xs leading-5 caret-on-surface shadow-none selection:bg-primary/20 hover:bg-transparent focus-visible:border-transparent",
                          rustSyntaxHighlightVisible ? "text-transparent" : "text-on-surface",
                          rustEditorWordWrap ? "whitespace-pre-wrap break-words overflow-x-hidden" : "whitespace-pre",
                        )}
                        spellCheck={false}
                        wrap={rustEditorWordWrap ? "soft" : "off"}
                      />
                      {rustCompletionTrigger && rustCompletionItems.length > 0 ? (
                        <div
                          className="absolute right-3 top-3 z-30 w-[min(26rem,calc(100%-1.5rem))] overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest/98 p-1.5 text-xs shadow-m3-3 backdrop-blur"
                          data-builder-rust-completions=""
                          data-builder-rust-completion-count={rustCompletionItems.length}
                          data-builder-rust-completion-active-index={clamp(rustCompletionTrigger.activeIndex, 0, rustCompletionItems.length - 1)}
                          data-builder-rust-completion-query={rustCompletionContext.query}
                          data-builder-rust-completion-forced={rustCompletionTrigger.forced ? "true" : "false"}
                        >
                          <div className="flex items-center justify-between gap-2 px-2 py-1 text-[0.68rem] text-on-surface-variant">
                            <span className="truncate">Rust 补全{rustCompletionContext.query ? ` · ${rustCompletionContext.query}` : ""}</span>
                            <span className="font-mono">Tab / Enter</span>
                          </div>
                          <div className="max-h-64 overflow-auto">
                            {rustCompletionItems.map((completion: any, index: any) => {
                              const active = index === (rustCompletionTrigger.activeIndex % rustCompletionItems.length);
                              return (
                                <button
                                  key={completion.id}
                                  type="button"
                                  className={cn(
                                    "focus-ring grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-2 py-2 text-left transition",
                                    active ? "bg-secondary-container text-secondary-container-foreground" : "hover:bg-surface-container-high",
                                  )}
                                  data-builder-rust-completion={completion.kind}
                                  data-builder-rust-completion-label={completion.label}
                                  data-builder-rust-completion-active={active ? "true" : "false"}
                                  aria-selected={active}
                                  onMouseDown={(event: any) => event.preventDefault()}
                                  onMouseEnter={() => setRustCompletionTrigger((current: any) => (current ? { ...current, activeIndex: index } : current))}
                                  onClick={() => applyRustCompletion(completion)}
                                >
                                  <span className="min-w-0">
                                    <span className="block truncate font-mono font-medium">{completion.label}</span>
                                    <span className="mt-0.5 block truncate text-[0.68rem] opacity-75">{completion.detail}</span>
                                    <span
                                      className="mt-0.5 block truncate text-[0.62rem] opacity-65"
                                      data-builder-rust-completion-source={completion.kind}
                                    >
                                      来源：{completion.sourceLabel ?? rustCompletionKindLabel(completion.kind)}
                                      {completion.targetLine ? ` · Ln ${completion.targetLine}` : ""}
                                    </span>
                                  </span>
                                  <StateLabel className="shrink-0" label={completion.kind} />
                                </button>
                              );
                            })}
                          </div>
                          {activeRustCompletion ? (
                            <div
                              className="mt-1 rounded-xl border border-outline-variant bg-surface-container px-2.5 py-2"
                              data-builder-rust-completion-detail=""
                              data-builder-rust-completion-kind={activeRustCompletion.kind}
                            >
                              <div className="flex min-w-0 items-center justify-between gap-2">
                                <span className="truncate font-medium text-on-surface">
                                  {activeRustCompletion.sourceLabel ?? rustCompletionKindLabel(activeRustCompletion.kind)}
                                </span>
                                <span className="flex shrink-0 items-center gap-1">
                                  {activeRustCompletion.targetLine ? (
                                    <button
                                      type="button"
                                      className="focus-ring rounded-lg px-1.5 py-0.5 font-mono text-[0.62rem] text-primary transition hover:bg-primary/10"
                                      data-builder-rust-completion-jump-source=""
                                      onMouseDown={(event: any) => event.preventDefault()}
                                      onClick={() => focusRustLine(activeRustCompletion.targetLine ?? 1, `补全来源 · ${activeRustCompletion.label}`)}
                                    >
                                      Ln {activeRustCompletion.targetLine}
                                    </button>
                                  ) : null}
                                  <button
                                    type="button"
                                    className="focus-ring rounded-lg bg-primary/10 px-2 py-0.5 text-[0.62rem] font-medium text-primary transition hover:bg-primary/20"
                                    data-builder-rust-completion-accept=""
                                    data-builder-rust-completion-accept-label={activeRustCompletion.label}
                                    onMouseDown={(event: any) => event.preventDefault()}
                                    onClick={() => applyRustCompletion(activeRustCompletion)}
                                  >
                                    插入
                                  </button>
                                </span>
                              </div>
                              <p
                                className="mt-1 line-clamp-2 break-all font-mono text-[0.66rem] leading-4 text-on-surface-variant"
                                data-builder-rust-completion-preview=""
                              >
                                {activeRustCompletion.insertPreview ?? rustCompletionInsertPreview(activeRustCompletion.insertText)}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <div
                      className="relative overflow-hidden border-l border-outline-variant bg-surface-container-high/90"
                      data-builder-rust-minimap=""
                      data-builder-rust-minimap-markers={rustEditorMinimapMarkers.length}
                      aria-label="Rust 代码概览"
                    >
                      <div className="absolute inset-x-3 inset-y-3 rounded-full border border-outline-variant bg-surface-container-lowest/70" data-builder-rust-minimap-track="">
                        <div
                          className="absolute left-0 right-0 rounded-full border border-primary/25 bg-primary/10"
                          data-builder-rust-minimap-viewport=""
                          style={{
                            top: `${rustEditorMinimapViewport.top}%`,
                            height: `${rustEditorMinimapViewport.height}%`,
                          }}
                        />
                        {rustEditorMinimapMarkers.map((marker: any) => {
                          const top = ((marker.line - 1) / Math.max(1, rustEditorMinimapTotalLines - 1)) * 100;
                          const markerClassName =
                            marker.kind === "diagnostic"
                              ? marker.severity === "error"
                                ? "bg-destructive"
                                : "bg-primary"
                              : marker.kind === "find"
                                ? "bg-tertiary"
                                : marker.kind === "identifier"
                                  ? "bg-primary/70"
                                  : marker.kind === "cursor"
                                    ? "bg-on-surface"
                                    : "bg-outline";
                          return (
                            <button
                              key={marker.id}
                              type="button"
                              className={cn(
                                "focus-ring absolute left-1/2 min-h-1 w-5 -translate-x-1/2 rounded-full transition hover:w-7",
                                marker.kind === "cursor" ? "h-1.5 shadow-m3-1" : "h-1",
                                markerClassName,
                              )}
                              style={{ top: `${top}%` }}
                              data-builder-rust-minimap-marker={marker.kind}
                              data-builder-rust-minimap-line={marker.line}
                              aria-label={`${marker.label}，跳转到第 ${marker.line} 行`}
                              title={`${marker.label} · Ln ${marker.line}`}
                              onClick={() => focusRustLine(marker.line, `缩略图 · ${marker.label}`)}
                            />
                          );
                        })}
                      </div>
                      <div className="absolute bottom-1 left-1 right-1 truncate text-center font-mono text-[0.52rem] text-on-surface-variant" aria-hidden>
                        map
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="order-first flex h-9 shrink-0 items-center gap-2 overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-high px-2 py-1 text-[0.68rem] text-on-surface-variant"
                  data-builder-rust-editor-status=""
                >
                  {/* A status row is instrumentation, not a shelf of pills: these are
                      values to read while editing, so they stay plain text. */}
                  <div className="subtle-scrollbar flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-x-auto font-mono text-[0.66rem]">
                    <span>
                      行 {rustEditorSelection.line}，列 {rustEditorSelection.column}
                    </span>
                    <span>{rustEditorLines.length} 行</span>
                    <span>
                      {rustEditorSelection.selectionEnd > rustEditorSelection.selectionStart
                        ? `选中 ${rustEditorSelection.selectionEnd - rustEditorSelection.selectionStart} 字符`
                        : "无选区"}
                    </span>
                    <span className="min-w-0 truncate">
                      当前符号：{rustCursorOutlineEntry ? `${rustOutlineKindLabel(rustCursorOutlineEntry.kind)} ${rustCursorOutlineEntry.label}${rustCursorOutlineRangeLabel ? ` · ${rustCursorOutlineRangeLabel}` : ""}` : "全局作用域"}
                    </span>
                    <span
                      className="min-w-0 truncate"
                      data-builder-rust-editor-current-identifier=""
                      data-builder-rust-editor-current-identifier-count={rustCurrentIdentifierOccurrences.length}
                    >
                      标识符：{rustCurrentIdentifier ? `${rustCurrentIdentifier.name} · ${rustCurrentIdentifierOccurrences.length} 处` : "无"}
                    </span>
                    <span className="min-w-0 truncate" data-builder-rust-editor-find-status="">
                      查找：{rustFindQuery ? `${rustFindMatches.length} 项` : "空闲"}
                    </span>
                    {/* Only a broken bracket is something to act on. */}
                    <StateBadge
                      variant={rustBracketMatch?.status === "unmatched" ? "destructive" : "secondary"}
                      className="font-mono"
                      label={`括号：${rustBracketMatchLabel}`}
                      signal={rustBracketMatch?.status === "unmatched"}
                      data-builder-rust-bracket-match=""
                      data-builder-rust-bracket-match-state={rustBracketMatch?.status ?? "idle"}
                      data-builder-rust-bracket-match-direction={rustBracketMatch?.direction ?? "none"}
                    />
                    <span className="min-w-0 truncate" data-builder-rust-editor-replace-status="">
                      替换：{rustReplaceQuery ? "已填写" : "空"}
                    </span>
                  </div>
                  <div className="hidden min-w-0 items-center justify-start gap-2 md:justify-end">
                    <StateBadge
                      variant="outline"
                      label={`${buildDiagnostics.length} 诊断`}
                      signal={buildDiagnostics.length > 0}
                    />
                    <StateBadge
                      variant="outline"
                      label={`${missingRustSlotCount} 槽待生成`}
                      signal={missingRustSlotCount > 0}
                    />
                    <span className="font-mono text-[0.66rem]">
                      {activeRustCompletion ? `补全：${activeRustCompletion.label}` : "Ctrl+Space"}
                    </span>
                    {rustCompletionCommit ? (
                      <span
                        className="max-w-[14rem] truncate font-mono text-[0.66rem]"
                        data-builder-rust-completion-commit=""
                        data-builder-rust-completion-commit-kind={rustCompletionCommit.kind}
                        data-builder-rust-completion-commit-cursor={rustCompletionCommit.cursor}
                        title={`${rustCompletionCommit.label} · ${rustCompletionCommit.insertedLength} 字符`}
                      >
                        已插入：{rustCompletionCommit.label}
                      </span>
                    ) : null}
                    <StateLabel
                      label={rustSignatureHelp ? `签名：${rustSignatureHelp.commandName}` : "签名：空"}
                      data-builder-rust-signature-status=""
                    />
                    <span className="font-mono" data-builder-rust-editor-word-wrap-status="">
                      折行：{rustEditorWordWrap ? "开启" : "关闭"}
                    </span>
                    <span className="font-mono" data-builder-rust-editor-smart-pairs="">
                      Alt+Enter 选中符号 · F2 重命名 · Ctrl+M 跳转括号 · Ctrl+D 复制行 · Alt+Up/Down 移动行 · Ctrl+/ 注释 · Tab 缩进 · Shift+Tab 反缩进 · Ctrl+G 跳行 · Ctrl+Shift+F 格式化 · Ctrl+Enter 替换当前 · Enter 自动缩进 · 括号成对输入 · Backspace 删除空括号
                    </span>
                  </div>
                </div>
              </section>
              <aside className="subtle-scrollbar min-h-0 space-y-4 overflow-y-auto rounded-[24px] border border-outline-variant bg-surface-container p-4">
                <section
                  className="overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-high text-xs shadow-m3-1"
                  data-builder-rust-debug-workbench=""
                  data-builder-rust-debug-active-panel={rustDebuggerPanel}
                >
                  <div className="flex items-start justify-between gap-3 border-b border-outline-variant px-3 py-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-primary">
                          <Bug aria-hidden className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-on-surface">Rust 调试工作台</h3>
                          <p className="truncate text-[0.68rem] text-on-surface-variant">诊断、断点、监视和调用栈集中查看</p>
                        </div>
                      </div>
                    </div>
                    <StateBadge
                      variant="outline"
                      className="shrink-0"
                      label={`${rustDebuggerProblemRows.length} 问题`}
                      signal={rustDebuggerProblemRows.length > 0}
                    />
                  </div>
                  <div className="subtle-scrollbar flex gap-1 overflow-x-auto border-b border-outline-variant bg-surface-container px-2 py-2" data-builder-rust-debug-tabs="">
                    {rustDebuggerTabs.map((tab: any) => (
                      <button
                        key={tab.id}
                        type="button"
                        className={cn(
                          "focus-ring inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-[0.68rem] font-medium transition",
                          rustDebuggerPanel === tab.id
                            ? "bg-secondary-container text-secondary-container-foreground"
                            : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                        )}
                        data-builder-rust-debug-tab={tab.id}
                        aria-pressed={rustDebuggerPanel === tab.id}
                        onClick={() => setRustDebuggerPanel(tab.id)}
                      >
                        <span>{tab.label}</span>
                        {/* Tab counts are tallies of what is listed, not states. */}
                        <CountReadout
                          className="font-mono text-[0.58rem]"
                          label={String(tab.count)}
                          count={tab.count}
                        />
                      </button>
                    ))}
                  </div>

                  {rustDebuggerPanel === "problems" ? (
                    <div className="max-h-72 overflow-y-auto p-2" data-builder-rust-debug-problems="" data-builder-rust-debug-problem-count={rustDebuggerProblemRows.length}>
                      {rustDebuggerProblemRows.length > 0 ? (
                        <div className="space-y-1.5">
                          {rustDebuggerProblemRows.map((row: any) => (
                            <button
                              key={row.id}
                              type="button"
                              className="focus-ring grid w-full grid-cols-[auto_minmax(0,1fr)] gap-2 rounded-2xl border border-outline-variant bg-surface-container-low px-2.5 py-2 text-left transition hover:border-outline hover:bg-surface-container"
                              data-builder-rust-debug-problem={row.severity}
                              data-builder-rust-debug-problem-editable={row.editable ? "true" : "false"}
                              onClick={() => openBuildDiagnostic(row.diagnostic, row.index, row.editable)}
                            >
                              <span
                                className={cn(
                                  "mt-0.5 rounded-full px-2 py-1 text-[0.6rem] font-semibold uppercase",
                                  row.severity === "error" ? "bg-destructive/10 text-destructive" : "bg-tertiary-container text-tertiary",
                                )}
                              >
                                {row.severity}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-medium text-on-surface">{row.title}</span>
                                <span className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5 text-[0.66rem] text-on-surface-variant">
                                  <span className="max-w-full truncate font-mono">{row.file}</span>
                                  {row.line ? <span className="shrink-0 font-mono">Ln {row.line}:{row.column}</span> : null}
                                  <span className="shrink-0 rounded-full bg-surface-container-high px-1.5 py-0.5">{row.code}</span>
                                </span>
                                <span className="mt-1 block truncate text-[0.66rem] text-on-surface-variant">{row.detail}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-3 py-4 text-on-surface-variant" data-builder-rust-debug-empty="problems">
                          暂无 Rust/Cargo 诊断。运行构建或检查后，这里会列出可跳转的问题。
                        </div>
                      )}
                    </div>
                  ) : null}

                  {rustDebuggerPanel === "breakpoints" ? (
                    <div className="max-h-72 overflow-y-auto p-2" data-builder-rust-debug-breakpoints="" data-builder-rust-debug-breakpoint-count={rustDebuggerBreakpointRows.length}>
                      {rustDebuggerBreakpointRows.length > 0 ? (
                        <div className="space-y-1.5">
                          {rustDebuggerBreakpointRows.map((row: any) => (
                            <div
                              key={row.id}
                              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-low p-1.5"
                              data-builder-rust-debug-breakpoint={row.enabled ? "enabled" : "disabled"}
                            >
                              <button
                                type="button"
                                className="focus-ring flex min-w-0 items-start gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-surface-container-high"
                                onClick={() => focusRustLine(row.line, `断点 · ${row.label}`)}
                              >
                                <span className={cn("mt-1 size-2.5 shrink-0 rounded-full", row.enabled ? "bg-destructive" : "border border-outline bg-transparent")} />
                                <span className="min-w-0">
                                  <span className="block truncate font-mono font-medium text-on-surface">{row.label}</span>
                                  <span className="mt-1 block truncate text-[0.66rem] text-on-surface-variant">logic.rs:{row.line} · {row.detail}</span>
                                </span>
                              </button>
                              <button
                                type="button"
                                className={cn(
                                  "focus-ring h-8 rounded-xl px-2 text-[0.66rem] font-medium transition",
                                  row.enabled ? "bg-destructive/10 text-destructive hover:bg-destructive/15" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface",
                                )}
                                data-builder-rust-debug-breakpoint-toggle={row.id}
                                aria-pressed={row.enabled}
                                onClick={() =>
                                  setDisabledRustDebuggerBreakpointIds((current: any) =>
                                    current.includes(row.id)
                                      ? current.filter((id: any) => id !== row.id)
                                      : [...current, row.id],
                                  )
                                }
                              >
                                {row.enabled ? row.hitLabel : "禁用"}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-3 py-4 text-on-surface-variant" data-builder-rust-debug-empty="breakpoints">
                          当前源码还没有可定位函数。生成槽函数或添加 Rust 函数后会出现建议断点。
                        </div>
                      )}
                    </div>
                  ) : null}

                  {rustDebuggerPanel === "watch" ? (
                    <div className="max-h-72 overflow-y-auto p-2" data-builder-rust-debug-watch="" data-builder-rust-debug-watch-count={rustDebuggerWatchRows.length}>
                      <div className="space-y-1.5">
                        {rustDebuggerWatchRows.map((row: any) => (
                          <div
                            key={row.id}
                            className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)] items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-low px-2.5 py-2"
                            data-builder-rust-debug-watch-row={row.tone}
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-mono text-[0.72rem] font-medium text-on-surface">{row.expression}</span>
                              <span className="mt-1 block truncate text-[0.66rem] text-on-surface-variant">{row.detail}</span>
                            </span>
                            <span
                              className={cn(
                                "truncate rounded-xl border px-2 py-1 font-mono text-[0.68rem]",
                                row.tone === "error"
                                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                                  : row.tone === "changed"
                                    ? "border-primary/25 bg-primary/10 text-primary"
                                    : "border-outline-variant bg-surface-container",
                              )}
                            >
                              {String(row.value || "空")}
                            </span>
                          </div>
                        ))}
                        {rustDebuggerWatchRows.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-3 py-4 text-on-surface-variant" data-builder-rust-debug-empty="watch">
                            暂无状态变量或运行结果。添加 state 或运行一次控件事件后会显示监视值。
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {rustDebuggerPanel === "call-stack" ? (
                    <div className="max-h-72 overflow-y-auto p-2" data-builder-rust-debug-call-stack="" data-builder-rust-debug-call-stack-count={rustDebuggerCallStackRows.length}>
                      <div className="space-y-1.5">
                        {rustDebuggerCallStackRows.map((row: any) => (
                          <button
                            key={row.id}
                            type="button"
                            className="focus-ring grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-low px-2.5 py-2 text-left transition hover:border-outline hover:bg-surface-container"
                            data-builder-rust-debug-call-stack-frame={row.action}
                            disabled={row.action === "none"}
                            onClick={() => {
                              if (row.action === "design" && activeRustCommandPrimaryCaller) {
                                setSelectedId(activeRustCommandPrimaryCaller.item.id);
                                setMode("design");
                                setRightDockTab("connections");
                                return;
                              }
                              if (row.action === "function") {
                                if (row.line) {
                                  focusRustLine(row.line, `调用栈 · ${row.label}`);
                                } else {
                                  focusRustFunction(activeRustCommand.name);
                                }
                              }
                            }}
                          >
                            <span className="rounded-full bg-surface-container-high px-2 py-1 text-center font-mono text-[0.64rem] text-primary">{row.frame}</span>
                            <span className="min-w-0">
                              <span className="block truncate font-mono font-medium text-on-surface">{row.label}</span>
                              <span className="mt-1 block truncate text-[0.66rem] text-on-surface-variant">{row.detail}</span>
                            </span>
                            <span className="shrink-0 rounded-full bg-surface-container-high px-2 py-1 text-[0.62rem] text-on-surface-variant">
                              {row.line ? `Ln ${row.line}` : row.action === "design" ? "UI" : "info"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>
                <PanelTitle icon={Settings2} title="命令属性" description="当前命令会参与生成 app 的 Rust 注册和前端 invoke。" />
                <section
                  className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3 text-xs"
                  data-builder-rust-slot-navigator=""
                  data-builder-rust-slot-navigator-history-count={recentSlotNavigationEntries.length}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-on-surface">槽函数导航</h3>
                        {/* "待生成" is work to do; the located label is a source
                            coordinate, which the 源码 card below already repeats. */}
                        <StateLabel
                          variant="secondary"
                          label={activeRustCommandSlotState === "located" ? activeRustCommandSlotLocationLabel : "待生成"}
                        />
                      </div>
                      <p className="mt-1 leading-5 text-on-surface-variant">
                        像 Qt Creator 的信号/槽跳转一样，把控件事件、Rust command 和源码位置保持在一条路径里。
                      </p>
                    </div>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-low text-primary" aria-hidden>
                      <Navigation className="size-4" />
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]" data-builder-rust-slot-navigator-path="">
                    <div className="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2">
                      <p className="flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.08em] text-on-surface-variant">
                        <MousePointer2 aria-hidden className="size-3.5" />
                        UI 信号
                      </p>
                      <p className="mt-1 truncate font-medium text-on-surface" data-builder-rust-slot-navigator-control="">
                        {activeRustCommandPrimaryCaller
                          ? getItemSummary(activeRustCommandPrimaryCaller.item)
                          : "暂无调用控件"}
                      </p>
                      <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface-variant">
                        {activeRustCommandPrimaryCaller
                          ? `${activeRustCommandPrimaryCaller.item.type}.${activeRustCommandPrimaryCaller.eventName}`
                          : "从绑定列表选择一个事件"}
                      </p>
                    </div>
                    <div className="hidden items-center justify-center text-on-surface-variant sm:flex">
                      <ArrowRight aria-hidden className="size-4" />
                    </div>
                    <div className="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2">
                      <p className="flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.08em] text-on-surface-variant">
                        <CornerDownRight aria-hidden className="size-3.5" />
                        Rust command
                      </p>
                      <p className="mt-1 truncate font-mono font-medium text-on-surface" data-builder-rust-slot-navigator-command="">
                        {sanitizeRustCommandName(activeRustCommand.name)}
                      </p>
                      <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                        {activeRustCommandBindingRows.length > 0 ? `${activeRustCommandBindingRows.length} 个 UI 调用` : "等待 UI 入口"}
                      </p>
                    </div>
                    <div className="hidden items-center justify-center text-on-surface-variant sm:flex">
                      <ArrowRight aria-hidden className="size-4" />
                    </div>
                    <div className="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2">
                      <p className="flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.08em] text-on-surface-variant">
                        <Braces aria-hidden className="size-3.5" />
                        源码
                      </p>
                      <p className="mt-1 truncate font-mono font-medium text-on-surface" data-builder-rust-slot-navigator-source="">
                        {activeRustCommandSlotLocationLabel}
                      </p>
                      <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                        {activeRustCommandSlotState === "located" ? "可直接打开" : "可一键生成"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3" data-builder-rust-slot-navigator-actions="">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="justify-center"
                      data-builder-rust-slot-navigator-open=""
                      onClick={() => {
                        if (activeRustCommandOutlineEntry) {
                          openRustLogicOutlineEntry(activeRustCommandOutlineEntry);
                          return;
                        }
                        appendMissingRustSlotForCommand(activeRustCommand.id);
                      }}
                    >
                      <CornerDownRight aria-hidden className="size-4" />
                      {activeRustCommandSlotActionLabel}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-center"
                      data-builder-rust-slot-navigator-back-control=""
                      disabled={!activeRustCommandPrimaryCaller}
                      onClick={() => {
                        if (!activeRustCommandPrimaryCaller) {
                          return;
                        }
                        setSelectedId(activeRustCommandPrimaryCaller.item.id);
                        setMode("design");
                        setRightDockTab("connections");
                        setFeedbackPanelOpen(false);
                        setBottomDockExpanded(false);
                        setBottomDockMinimized(true);
                        registerSlotNavigationVisit(activeRustCommand, {
                          item: activeRustCommandPrimaryCaller.item,
                          eventName: activeRustCommandPrimaryCaller.eventName,
                          sourceLine: activeRustCommandOutlineEntry?.line ?? null,
                          reason: "history",
                        });
                      }}
                    >
                      <MousePointer2 aria-hidden className="size-4" />
                      回到控件
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-center"
                      data-builder-rust-slot-navigator-callers=""
                      disabled={activeRustCommandBindingRows.length === 0}
                      onClick={() => {
                        setLogicResourceView("connections");
                        setLogicConnectionFilter("bound");
                        registerSlotNavigationVisit(activeRustCommand, {
                          sourceLine: activeRustCommandOutlineEntry?.line ?? null,
                          reason: "history",
                        });
                      }}
                    >
                      <ListChecks aria-hidden className="size-4" />
                      调用列表
                    </Button>
                  </div>

                  <div className="space-y-2" data-builder-rust-slot-navigator-history="">
                    <div className="flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">
                      <Clock3 aria-hidden className="size-3.5" />
                      最近槽函数
                    </div>
                    {recentSlotNavigationEntries.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {recentSlotNavigationEntries.map((entry: any) => (
                          <button
                            key={entry.id}
                            type="button"
                            className="focus-ring max-w-full rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 text-left text-[0.68rem] text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
                            data-builder-rust-slot-navigator-history-item=""
                            onClick={() => openSlotNavigationEntry(entry)}
                            title={`${entry.itemName ? `${entry.itemName}.${entry.eventName} -> ` : ""}${entry.commandName} · ${entry.sourceLabel}`}
                          >
                            <span className="inline-flex max-w-[12rem] items-center gap-1.5 truncate">
                              <span className="truncate font-mono text-on-surface">{entry.commandName}</span>
                              <span className="shrink-0">·</span>
                              <span className="shrink-0">{entry.sourceLabel}</span>
                              <span className="shrink-0 text-on-surface-variant/70">{entry.visitedAt}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-3 py-2 leading-5 text-on-surface-variant">
                        从控件、连接矩阵或 outline 打开一次槽函数后，这里会保留最近路径。
                      </p>
                    )}
                  </div>
                </section>
                <section
                  className={cn(
                    "space-y-3 rounded-[18px] border p-3 text-xs",
                    activeRustCommandSlotState === "located"
                      ? "border-primary/30 bg-primary/10"
                      : "border-outline-variant bg-surface-container-high",
                  )}
                  data-builder-rust-command-slot-card=""
                  data-builder-rust-command-slot-state={activeRustCommandSlotState}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-on-surface">当前槽函数</h3>
                        <StateLabel
                          label={activeRustCommandSlotState === "located" ? "源码已定位" : "待生成"}
                        />
                        <CountReadout
                          label={`${activeRustCommandBindingRows.length} UI 调用`}
                          count={activeRustCommandBindingRows.length}
                        />
                      </div>
                      <p className="mt-1 truncate font-mono text-on-surface" data-builder-rust-command-slot-name="">
                        {sanitizeRustCommandName(activeRustCommand.name)}
                      </p>
                      <p className="mt-1 leading-5 text-on-surface-variant" data-builder-rust-command-slot-location="">
                        {activeRustCommandSlotLocationLabel}
                        {activeRustCommandBindingRows.length > 0
                          ? ` · 被 ${activeRustCommandBindingRows.length} 个控件事件调用`
                          : " · 还没有 UI 入口"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-2xl border",
                        activeRustCommandSlotState === "located"
                          ? "border-primary/25 bg-primary/10 text-primary"
                          : "border-outline-variant bg-surface-container-low text-on-surface-variant",
                      )}
                      aria-hidden
                    >
                      <CornerDownRight className="size-4" />
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[0.68rem]" data-builder-rust-command-slot-io="">
                    <div className="min-w-0 rounded-2xl bg-surface-container-low px-3 py-2">
                      <p className="text-on-surface-variant">输入</p>
                      <p className="mt-1 truncate font-mono text-on-surface">
                        {activeRustCommandParameters.length > 0
                          ? `${activeRustCommandParameters.length} 参数`
                          : rustCommandAcceptsArgs(activeRustCommand)
                            ? "value"
                            : "无参数"}
                      </p>
                    </div>
                    <div className="min-w-0 rounded-2xl bg-surface-container-low px-3 py-2">
                      <p className="text-on-surface-variant">输出</p>
                      <p className="mt-1 truncate font-mono text-on-surface">{activeRustCommandResultSchema.mode}</p>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3" data-builder-rust-command-slot-actions="">
                    <Button
                      size="sm"
                      variant={activeRustCommandSlotState === "located" ? "secondary" : "default"}
                      className="justify-center"
                      data-builder-rust-command-slot-open=""
                      onClick={() => {
                        if (activeRustCommandOutlineEntry) {
                          openRustLogicOutlineEntry(activeRustCommandOutlineEntry);
                          return;
                        }
                        appendMissingRustSlotForCommand(activeRustCommand.id);
                      }}
                    >
                      <CornerDownRight aria-hidden className="size-4" />
                      {activeRustCommandSlotActionLabel}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-center"
                      data-builder-rust-command-slot-focus-command=""
                      onClick={() => focusRustFunction(activeRustCommand.name)}
                    >
                      <Search aria-hidden className="size-4" />
                      定位名称
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="justify-center"
                      data-builder-rust-command-slot-show-callers=""
                      disabled={activeRustCommandBindingRows.length === 0}
                      onClick={() => {
                        setLogicResourceView("connections");
                        setLogicConnectionFilter("bound");
                      }}
                    >
                      <MousePointer2 aria-hidden className="size-4" />
                      查看调用
                    </Button>
                  </div>
                </section>
                <section
                  className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3 text-xs"
                  data-builder-logic-command-impact-panel=""
                  data-builder-logic-command-impact-command={sanitizeRustCommandName(activeRustCommand.name)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-on-surface">命令影响面</h3>
                        <StateLabel
                          variant={activeRustCommandBindingRows.length > 0 ? "secondary" : "outline"}
                          label={activeRustCommandBindingRows.length > 0 ? `${activeRustCommandBindingRows.length} 调用` : "未连接 UI"}
                        />
                        <StateLabel
                          variant={activeRustCommandSlotState === "located" ? "secondary" : "outline"}
                          data-builder-logic-command-impact-slot-state=""
                          label={activeRustCommandSlotState === "located" ? "源码已定位" : "槽函数待生成"}
                        />
                      </div>
                      <p className="mt-1 leading-5 text-on-surface-variant">
                        把当前 command 的入口、参数、输出回写和槽函数状态放在同一个可操作视图里。
                      </p>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="打开当前 Rust command 槽函数"
                      data-builder-logic-command-impact-open-slot=""
                      onClick={() => {
                        if (activeRustCommandOutlineEntry) {
                          openRustLogicOutlineEntry(activeRustCommandOutlineEntry);
                          return;
                        }
                        appendMissingRustSlotForCommand(activeRustCommand.id);
                      }}
                    >
                      <CornerDownRight aria-hidden className="size-4" />
                    </Button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2" data-builder-logic-command-impact-stats="">
                    {activeRustCommandImpactStats.map((stat: any) => {
                      const StatIcon = stat.icon;
                      return (
                        <div
                          key={stat.id}
                          className="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2"
                          data-builder-logic-command-impact-stat={stat.id}
                        >
                          <div className="flex items-center gap-2 text-[0.68rem] text-on-surface-variant">
                            <StatIcon aria-hidden className="size-3.5" />
                            <span className="truncate">{stat.label}</span>
                          </div>
                          <p className="mt-1 truncate text-sm font-medium text-on-surface">{stat.value}</p>
                          <p className="mt-0.5 truncate font-mono text-[0.66rem] text-on-surface-variant">{stat.detail}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2" data-builder-logic-command-impact-parameters="">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">输入参数</p>
                      <span className="font-mono text-[0.66rem] text-on-surface-variant">{activeRustCommandResultSchema.mode} result</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeRustCommandParameters.length > 0 ? (
                        activeRustCommandParameters.slice(0, 5).map((parameter: any) => (
                          <span
                            key={parameter.id}
                            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-2 py-1 font-mono text-[0.66rem] text-on-surface"
                            data-builder-logic-command-impact-parameter={parameter.source}
                            title={`${parameter.name}: ${rustParameterTypeCode(parameter.type)} · ${parameter.source}`}
                          >
                            <span className="truncate">{parameter.name}</span>
                            <span className="shrink-0 text-on-surface-variant">:</span>
                            <span className="shrink-0 text-on-surface-variant">{rustParameterTypeCode(parameter.type)}</span>
                          </span>
                        ))
                      ) : (
                        <span
                          className="text-[0.68rem] text-on-surface-variant"
                          data-builder-logic-command-impact-parameter="none"
                        >
                          {rustCommandAcceptsArgs(activeRustCommand) ? "接收默认 value" : "无输入参数"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2" data-builder-logic-command-impact-results="">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">输出回写</p>
                    <div className="grid gap-2">
                      {activeRustCommandResultImpacts.slice(0, 5).map((impact: any) => (
                        <div
                          key={impact.id}
                          className={cn(
                            "min-w-0 rounded-2xl border px-3 py-2",
                            impact.tone === "state"
                              ? "border-primary/25 bg-primary/10"
                              : impact.tone === "target"
                                ? "border-outline-variant bg-surface-container-low"
                                : impact.tone === "patch"
                                  ? "border-outline-variant bg-surface-container"
                                  : "border-dashed border-outline-variant bg-surface-container-low",
                          )}
                          data-builder-logic-command-impact-result={impact.tone}
                        >
                          <p className="truncate font-medium text-on-surface">{impact.label}</p>
                          <p className="mt-1 leading-5 text-on-surface-variant">{impact.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2" data-builder-logic-command-impact-callers="">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">UI 调用者</p>
                    {activeRustCommandBindingRows.length > 0 ? (
                      <div className="space-y-2">
                        {activeRustCommandBindingRows.slice(0, 3).map((row: any) => (
                          <article
                            key={`active-command-impact-caller-${row.id}`}
                            className="rounded-2xl border border-outline-variant bg-surface-container-low p-2.5"
                            data-builder-logic-command-impact-caller={row.eventName}
                          >
                            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                              <span className="truncate font-medium text-on-surface">{getItemSummary(row.item)}</span>
                              <StateLabel label={row.eventName} />
                            </div>
                            <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                              {row.inputSummary}
                              {" -> "}
                              {row.outputSummary}
                            </p>
                            <div className="mt-2 grid gap-1.5 sm:grid-cols-3" data-builder-logic-command-impact-actions="">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 justify-center px-2 text-[0.68rem]"
                                data-builder-logic-command-impact-focus-caller=""
                                onClick={() => {
                                  setSelectedId(row.item.id);
                                  setMode("design");
                                  setRightDockTab("connections");
                                  setFeedbackPanelOpen(false);
                                  setBottomDockExpanded(false);
                                  setBottomDockMinimized(true);
                                }}
                              >
                                <MousePointer2 aria-hidden className="size-3.5" />
                                控件
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 justify-center px-2 text-[0.68rem]"
                                data-builder-logic-command-impact-run=""
                                onClick={() => runLogicSignalSlotEvent(row.item, row.eventName)}
                              >
                                <Play aria-hidden className="size-3.5" />
                                运行
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 justify-center px-2 text-[0.68rem]"
                                data-builder-logic-command-impact-map=""
                                onClick={() => openLogicConnectionSettings(row.item, row.eventName)}
                              >
                                <Settings2 aria-hidden className="size-3.5" />
                                映射
                              </Button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-3 py-2 leading-5 text-on-surface-variant" data-builder-logic-command-impact-caller="empty">
                        还没有 UI 事件调用当前 command，可从下方候选信号或连接矩阵建立绑定。
                      </p>
                    )}
                  </div>
                </section>
                <section
                  className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3 text-xs"
                  data-builder-rust-command-bindings=""
                  data-builder-rust-command-binding-count={activeRustCommandBindingRows.length}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-on-surface">命令调用关系</h3>
                        <StateBadge
                          label={activeRustCommandBindingRows.length > 0 ? `${activeRustCommandBindingRows.length} 个 UI 调用` : "未使用"}
                          signal={activeRustCommandBindingRows.length === 0}
                        />
                      </div>
                      <p className="mt-1 leading-5 text-on-surface-variant">
                        当前 <span className="font-mono text-on-surface">{sanitizeRustCommandName(activeRustCommand.name)}</span> 会从这些控件事件通过 Tauri invoke 调用。
                      </p>
                    </div>
                    <Button size="icon-sm" variant="ghost" aria-label="定位当前命令源码" onClick={() => focusRustFunction(activeRustCommand.name)}>
                      <CornerDownRight aria-hidden className="size-4" />
                    </Button>
                  </div>
                  {activeRustCommandBindingRows.length > 0 ? (
                    <div className="space-y-2">
                      {activeRustCommandBindingRows.slice(0, 5).map((row: any) => (
                        <article
                          key={`active-command-binding-${row.id}`}
                          className="rounded-2xl border border-outline-variant bg-surface-container-low p-2.5"
                          data-builder-rust-command-binding-row={row.eventName}
                        >
                          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                            <span className="truncate font-medium text-on-surface">{getItemSummary(row.item)}</span>
                            <StateLabel label={row.item.type} />
                            <ArrowRight aria-hidden className="size-3.5 text-on-surface-variant" />
                            <span className="truncate font-mono text-on-surface">{row.eventName}</span>
                          </div>
                          <div className="mt-2 grid gap-1 text-[0.68rem] text-on-surface-variant">
                            <span className="truncate" data-builder-rust-command-binding-input="">
                              输入：{row.inputSummary}
                            </span>
                            <span className="truncate" data-builder-rust-command-binding-output="">
                              输出：{row.outputSummary}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 px-2 text-[0.68rem]"
                              data-builder-rust-command-binding-focus-control=""
                              onClick={() => {
                                setSelectedId(row.item.id);
                                setMode("design");
                                setRightDockTab("connections");
                                setFeedbackPanelOpen(false);
                                setBottomDockExpanded(false);
                                setBottomDockMinimized(true);
                              }}
                            >
                              <MousePointer2 aria-hidden className="size-3.5" />
                              控件
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[0.68rem]"
                              data-builder-rust-command-binding-open-slot=""
                              onClick={() => goToSlotForItem(row.item)}
                            >
                              <CornerDownRight aria-hidden className="size-3.5" />
                              槽函数
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[0.68rem]"
                              data-builder-rust-command-binding-run=""
                              onClick={() => runLogicSignalSlotEvent(row.item, row.eventName)}
                            >
                              <Play aria-hidden className="size-3.5" />
                              运行
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[0.68rem]"
                              data-builder-rust-command-binding-settings=""
                              onClick={() => openLogicConnectionSettings(row.item, row.eventName)}
                            >
                              <Settings2 aria-hidden className="size-3.5" />
                              映射
                            </Button>
                          </div>
                        </article>
                      ))}
                      {activeRustCommandBindingRows.length > 5 ? (
                        <p className="px-1 text-[0.68rem] text-on-surface-variant">
                          还有 {activeRustCommandBindingRows.length - 5} 个调用，可在中间信号 / 槽总览中继续筛选。
                        </p>
                      ) : null}
                    </div>
                  ) : activeRustCommandCandidateRows.length > 0 ? (
                    <div className="space-y-2" data-builder-rust-command-binding-candidates="">
                      <p className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-3 py-2 leading-5 text-on-surface-variant">
                        这个命令还没有 UI 入口。可以把下面的未绑定信号直接接到当前命令。
                      </p>
                      {activeRustCommandCandidateRows.map((row: any) => (
                        <article key={`active-command-candidate-${row.id}`} className="grid gap-2 rounded-2xl border border-outline-variant bg-surface-container-low p-2.5 sm:grid-cols-[minmax(0,1fr)_auto]">
                          <div className="min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                              <span className="truncate font-medium text-on-surface">{getItemSummary(row.item)}</span>
                              <StateLabel label={row.eventName} />
                            </div>
                            <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">{row.inputSummary} · {row.outputSummary}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 px-2 text-xs"
                            data-builder-rust-command-bind-candidate=""
                            onClick={() => updateEventCommandForItem(row.item, row.eventName, activeRustCommand.id)}
                          >
                            <ArrowRight aria-hidden className="size-3.5" />
                            绑定
                          </Button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-3 py-3 leading-5 text-on-surface-variant">
                      当前 UI 文件没有可触发事件的控件。添加 Button、Switch、Input 等控件后，这里会显示可绑定入口。
                    </div>
                  )}
                </section>
                {activeRustCommandReverseDependency ? (
                  <section
                    className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-high p-3 text-xs"
                    data-builder-rust-command-impact=""
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="font-medium text-on-surface">依赖影响</p>
                          <StateLabel variant={reverseDependencyStatusVariant(activeRustCommandReverseDependency.status)}
                            label={reverseDependencyStatusLabel(activeRustCommandReverseDependency.status)} />
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
                      {activeRustCommandReverseDependency.scopeIds.slice(0, 4).map((scopeId: any) => (
                        <span key={scopeId} className="text-[0.66rem] text-on-surface-variant">
                          {projectChangeScopeLabel(scopeId)}
                        </span>
                      ))}
                    </div>
                    {activeRustCommandReverseDependency.plannedActions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {activeRustCommandReverseDependency.plannedActions.slice(0, 2).map((actionId: any) => (
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
                    onChange={(event: any) => updateRustCommand(activeRustCommand.id, { name: event.target.value })}
                    spellCheck={false}
                    className="font-mono text-xs"
                  />
                </Field>
                <Field label="返回文本">
                  <Textarea
                    data-builder-command-response=""
                    value={activeRustCommand.response}
                    onChange={(event: any) => updateRustCommand(activeRustCommand.id, { response: event.target.value })}
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
                    <Label className="text-xs font-medium">接收命令参数</Label>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">生成命名参数，并从控件事件上下文映射到 Rust。</p>
                  </div>
                  <Switch
                    checked={rustCommandAcceptsArgs(activeRustCommand)}
                    onCheckedChange={(acceptsValue: any) => setRustCommandAcceptsArgs(activeRustCommand.id, acceptsValue)}
                  />
                </div>
                {rustCommandAcceptsArgs(activeRustCommand) ? (
                  <section className="space-y-3 rounded-[18px] border border-outline-variant bg-surface-container-low p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">命令参数</h3>
                        <p className="mt-1 text-xs leading-5 text-on-surface-variant">这些名称会成为 Rust 函数参数和 Tauri invoke args。</p>
                      </div>
                      <Button size="sm" variant="secondary" onClick={addRustCommandParameter}>
                        <Plus aria-hidden className="size-3.5" />
                        添加
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {rustCommandParameters(activeRustCommand).map((parameter: any) => (
                        <div key={parameter.id} className="space-y-2 rounded-xl border border-outline-variant bg-surface-container p-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={parameter.name}
                              onChange={(event: any) => updateRustCommandParameter(parameter.id, { name: event.target.value })}
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
                              onValueChange={(source: any) =>
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
                                {rustParameterSources.map((source: any) => (
                                  <SelectItem key={source.value} value={source.value}>
                                    {source.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={parameter.type}
                              onValueChange={(type: any) => updateRustCommandParameter(parameter.id, { type: type as RustCommandParameterType })}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {rustParameterTypes.map((type: any) => (
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
                    <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">结果结构</h3>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">定义 Rust 返回值如何变成消息、错误和 state patch。</p>
                  </div>
                  <Field label="结果格式">
                    <Select value={commandResultSchema(activeRustCommand).mode} onValueChange={(mode: any) => setRustCommandResultMode(mode as RustCommandResultSchema["mode"])}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">文本结果</SelectItem>
                        <SelectItem value="json">JSON 封装</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  {commandResultSchema(activeRustCommand).mode === "json" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="消息路径">
                        <Input
                          value={commandResultSchema(activeRustCommand).messagePath ?? "message"}
                          onChange={(event: any) => updateRustCommandResult({ mode: "json", messagePath: event.target.value })}
                          className="h-8 font-mono text-xs"
                          spellCheck={false}
                        />
                      </Field>
                      <Field label="Patch 路径">
                        <Input
                          value={commandResultSchema(activeRustCommand).statePatchPath ?? "patch"}
                          onChange={(event: any) => updateRustCommandResult({ mode: "json", statePatchPath: event.target.value })}
                          className="h-8 font-mono text-xs"
                          spellCheck={false}
                        />
                      </Field>
                      <Field label="成功路径">
                        <Input
                          value={commandResultSchema(activeRustCommand).successPath ?? "success"}
                          onChange={(event: any) => updateRustCommandResult({ mode: "json", successPath: event.target.value })}
                          className="h-8 font-mono text-xs"
                          spellCheck={false}
                        />
                      </Field>
                      <Field label="错误路径">
                        <Input
                          value={commandResultSchema(activeRustCommand).errorPath ?? "error"}
                          onChange={(event: any) => updateRustCommandResult({ mode: "json", errorPath: event.target.value })}
                          className="h-8 font-mono text-xs"
                          spellCheck={false}
                        />
                      </Field>
                    </div>
                  ) : (
                    <p className="text-xs leading-5 text-on-surface-variant">文本结果会直接作为反馈、目标属性或结果状态的值。</p>
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
                      <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Rust 模块</h3>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">模块会生成到 app/src-tauri/src，并通过 lib.rs 的 mod 声明载入。</p>
                    </div>
                    <Switch
                      checked={activeRustModule.enabled}
                      aria-label="启用 Rust 模块"
                      onCheckedChange={(enabled: any) => updateRustModule(activeRustModule.id, { enabled })}
                    />
                  </div>
                  <Field label="模块名">
                    <Input
                      data-builder-rust-module-name=""
                      value={activeRustModule.name}
                      onChange={(event: any) => updateRustModule(activeRustModule.id, { name: event.target.value })}
                      spellCheck={false}
                      className="font-mono text-xs"
                    />
                  </Field>
                  <Field label="模块源码">
                    <Textarea
                      data-builder-rust-module-source=""
                      value={activeRustModule.source}
                      onChange={(event: any) => updateRustModule(activeRustModule.id, { source: event.target.value })}
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
                      <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">Cargo 依赖</h3>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">启用后会写入生成 app 的 src-tauri/Cargo.toml。</p>
                    </div>
                    <Switch
                      checked={activeCargoDependency.enabled}
                      aria-label="启用 Cargo 依赖"
                      onCheckedChange={(enabled: any) => updateCargoDependency(activeCargoDependency.id, { enabled })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Crate 名称">
                      <Input
                        data-builder-cargo-dependency-name=""
                        value={activeCargoDependency.name}
                        onChange={(event: any) => updateCargoDependency(activeCargoDependency.id, { name: event.target.value })}
                        spellCheck={false}
                        className="font-mono text-xs"
                      />
                    </Field>
                    <Field label="版本">
                      <Input
                        data-builder-cargo-dependency-version=""
                        value={activeCargoDependency.version}
                        onChange={(event: any) => updateCargoDependency(activeCargoDependency.id, { version: event.target.value })}
                        spellCheck={false}
                        className="font-mono text-xs"
                      />
                    </Field>
                  </div>
                  <Field label="特性">
                    <Input
                      data-builder-cargo-dependency-features=""
                      value={activeCargoDependency.features}
                      onChange={(event: any) => updateCargoDependency(activeCargoDependency.id, { features: event.target.value })}
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
                      <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">后端集成</h3>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">Rust 仍是主后端；这里登记 C++ FFI、sidecar 或本地服务边界。</p>
                    </div>
                    <Switch
                      checked={activeBackendIntegration.enabled}
                      aria-label="启用后端集成"
                      onCheckedChange={(enabled: any) => updateBackendIntegration(activeBackendIntegration.id, { enabled })}
                    />
                  </div>
                  <Field label="名称">
                    <Input
                      data-builder-backend-integration-name=""
                      value={activeBackendIntegration.name}
                      onChange={(event: any) => updateBackendIntegration(activeBackendIntegration.id, { name: event.target.value })}
                      className="font-mono text-xs"
                      spellCheck={false}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="类型">
                      <Select
                        value={activeBackendIntegration.kind}
                        onValueChange={(kind: any) => {
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
                          {backendIntegrationKinds.map((kind: any) => (
                            <SelectItem key={kind.value} value={kind.value}>
                              {kind.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="语言">
                      <Select
                        value={activeBackendIntegration.language}
                        onValueChange={(language: any) => {
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
                          {backendIntegrationLanguages.map((language: any) => (
                            <SelectItem key={language.value} value={language.value}>
                              {language.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field label="通道">
                    <Select
                      value={activeBackendIntegration.transport}
                      onValueChange={(transport: any) => updateBackendIntegration(activeBackendIntegration.id, { transport: transport as BackendIntegrationTransport })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {backendIntegrationTransports.map((transport: any) => (
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
                      onChange={(event: any) => updateBackendIntegration(activeBackendIntegration.id, { entryPath: event.target.value })}
                      className="font-mono text-xs"
                      spellCheck={false}
                      placeholder="backend/native/libengine.a"
                    />
                  </Field>
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-high p-3">
                    <div className="min-w-0">
                      <Label className="text-xs font-medium">打包产物</Label>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">将 sidecar、动态库或脚本产物复制进生成 app 的 Tauri resources。</p>
                    </div>
                    <Switch
                      checked={activeBackendIntegration.bundleResource}
                      aria-label="打包后端集成产物"
                      onCheckedChange={(bundleResource: any) => updateBackendIntegration(activeBackendIntegration.id, { bundleResource })}
                    />
                  </div>
                  <Field label="产物路径">
                    <Input
                      data-builder-backend-integration-artifact=""
                      value={activeBackendIntegration.artifactPath}
                      onChange={(event: any) => updateBackendIntegration(activeBackendIntegration.id, { artifactPath: event.target.value })}
                      className="font-mono text-xs"
                      spellCheck={false}
                      placeholder="backend/service/backend-service.exe"
                    />
                  </Field>
                  <Field label="资源目标">
                    <Input
                      data-builder-backend-integration-resource=""
                      value={activeBackendIntegration.resourcePath}
                      onChange={(event: any) => updateBackendIntegration(activeBackendIntegration.id, { resourcePath: event.target.value })}
                      className="font-mono text-xs"
                      spellCheck={false}
                      placeholder="resources/backend/service/backend-service.exe"
                    />
                  </Field>
                  <div className="rounded-2xl border border-outline-variant bg-surface-container p-3 text-xs">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-on-surface">产物状态</p>
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
                          构建
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
                          检查
                        </Button>
                      </div>
                    </div>
                    {activeBackendArtifactInspection ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <StateLabel
                            showQuiet
                            variant={backendArtifactStatusVariant(activeBackendArtifactInspection)}
                            label={backendArtifactInspectionStatusLabel(activeBackendArtifactInspection.status)}
                          />
                          <span className="text-on-surface-variant">
                            {activeBackendArtifactInspection.exists
                              ? `${activeBackendArtifactInspection.is_dir ? "文件夹" : "文件"} · ${byteSizeLabel(activeBackendArtifactInspection.size_bytes)}`
                              : "未找到"}
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
                              <StateLabel
                                showQuiet
                                variant={activeBackendArtifactBuildResult.success ? "secondary" : "destructive"}
                                label={String(activeBackendArtifactBuildResult.status)}
                              />
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
                      onChange={(event: any) => updateBackendIntegration(activeBackendIntegration.id, { command: event.target.value })}
                      className="font-mono text-xs"
                      spellCheck={false}
                      placeholder="engine --stdio"
                    />
                  </Field>
                  <div className="rounded-2xl border border-outline-variant bg-surface-container p-3">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">后端方法</h4>
                        <p className="mt-1 text-xs leading-5 text-on-surface-variant">声明可从 UI 事件调用的后端接口。</p>
                      </div>
                      <Button size="sm" variant="secondary" data-builder-new-backend-method="" onClick={createBackendIntegrationMethodInProject}>
                        <Plus aria-hidden className="size-3.5" />
                        新建方法
                      </Button>
                    </div>
                    <div className="mb-3 grid gap-2">
                      {activeBackendIntegration.methods.map((method: any) => (
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
                          <span className="mt-1 block truncate font-mono">{method.operation || method.path || "未设置操作"}</span>
                        </button>
                      ))}
                    </div>
                    <div className="space-y-3 rounded-xl bg-surface-container-low p-3">
                      <div className="flex items-center justify-between gap-2">
                        {/* Transport is a wire name, the same class of value as a
                            type or a scope — a column value, not a state. */}
                        <span className="font-mono text-[0.68rem] text-on-surface-variant">
                          {activeBackendIntegration.transport}
                        </span>
                        <Button size="sm" variant="ghost" data-builder-delete-backend-method="" onClick={deleteActiveBackendIntegrationMethod}>
                          <Trash2 aria-hidden className="size-3.5" />
                          删除
                        </Button>
                      </div>
                      <Field label="方法名">
                        <Input
                          data-builder-backend-method-name=""
                          value={activeBackendIntegrationMethod.name}
                          onChange={(event: any) => updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { name: event.target.value })}
                          className="font-mono text-xs"
                          spellCheck={false}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="操作">
                          <Input
                            data-builder-backend-method-operation=""
                            value={activeBackendIntegrationMethod.operation}
                            onChange={(event: any) => updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { operation: event.target.value })}
                            className="font-mono text-xs"
                            spellCheck={false}
                            placeholder="classify_image"
                          />
                        </Field>
                        <Field label="HTTP 路径">
                          <Input
                            data-builder-backend-method-path=""
                            value={activeBackendIntegrationMethod.path}
                            onChange={(event: any) => updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { path: event.target.value })}
                            className="font-mono text-xs"
                            spellCheck={false}
                            placeholder="/classify"
                          />
                        </Field>
                      </div>
                      <Field label="说明">
                        <Textarea
                          data-builder-backend-method-description=""
                          value={activeBackendIntegrationMethod.description}
                          onChange={(event: any) => updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { description: event.target.value })}
                          className="min-h-[68px] resize-y text-xs leading-5"
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-2">
                      <Field label="请求结构">
                          <Textarea
                            data-builder-backend-method-request-schema=""
                            value={activeBackendIntegrationMethod.requestSchema}
                            onChange={(event: any) => updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { requestSchema: event.target.value })}
                            className="min-h-[116px] resize-y font-mono text-xs leading-5"
                            spellCheck={false}
                          />
                        </Field>
                      <Field label="响应结构">
                          <Textarea
                            data-builder-backend-method-response-schema=""
                            value={activeBackendIntegrationMethod.responseSchema}
                            onChange={(event: any) => updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { responseSchema: event.target.value })}
                            className="min-h-[116px] resize-y font-mono text-xs leading-5"
                            spellCheck={false}
                          />
                        </Field>
                      </div>
                      <div className="grid gap-2 rounded-xl border border-outline-variant bg-surface p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-medium text-on-surface">结构参数</p>
                            <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                              从 request schema 派生 sample payload 字段。
                            </p>
                          </div>
                          <Button size="sm" variant="secondary" data-builder-sync-backend-method-sample="" onClick={syncActiveBackendMethodSampleFromSchema}>
                            <Wand2 aria-hidden className="size-3.5" />
                            同步示例
                          </Button>
                        </div>
                        {activeBackendMethodFields.length ? (
                          <div className="grid gap-2">
                            {activeBackendMethodFields.map((field: any) => {
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
                                      {/* Required/optional and the type name are field attributes, not states to act on. */}
                                      <span className="text-[0.68rem] text-on-surface-variant">
                                        {field.required ? "必填" : "可选"}
                                      </span>
                                      <span className="font-mono text-[0.68rem] text-on-surface-variant">
                                        {field.enumValues?.length ? "enum" : field.type}
                                      </span>
                                    </div>
                                  </div>
                                  {field.enumValues?.length ? (
                                    <Select value={field.inputValue || field.enumValues[0]} onValueChange={(value: any) => updateActiveBackendMethodSampleField(field, value)}>
                                      <SelectTrigger className="h-8 text-xs" data-builder-backend-schema-field={fieldPath}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {field.enumValues.map((value: any) => (
                                          <SelectItem key={value} value={value}>
                                            {value}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : field.type === "boolean" ? (
                                    <Select value={field.inputValue || "false"} onValueChange={(value: any) => updateActiveBackendMethodSampleField(field, value)}>
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
                                      onChange={(event: any) => updateActiveBackendMethodSampleField(field, event.target.value)}
                                      className="min-h-[72px] resize-y font-mono text-xs leading-5"
                                      spellCheck={false}
                                    />
                                  ) : (
                                    <Input
                                      data-builder-backend-schema-field={fieldPath}
                                      value={field.inputValue}
                                      type={field.type === "number" ? "number" : "text"}
                                      onChange={(event: any) => updateActiveBackendMethodSampleField(field, event.target.value)}
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
                              <span className="text-on-surface-variant">已选控件载荷：</span>
                              {activeBackendPayloadMapping.map((field: any) => (
                                <StateLabel key={field} label={String(field)} />
                              ))}
                              <StateLabel showQuiet label={activeBackendResponsePatchEnabled ? "已启用 patch" : "消息目标"} />
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <Field label="示例载荷">
                        <Textarea
                          data-builder-backend-method-sample-payload=""
                          value={activeBackendIntegrationMethod.samplePayload}
                          onChange={(event: any) => updateBackendIntegrationMethod(activeBackendIntegrationMethod.id, { samplePayload: event.target.value })}
                          className="min-h-[116px] resize-y font-mono text-xs leading-5"
                          spellCheck={false}
                        />
                      </Field>
                      <div className="grid gap-2 rounded-xl border border-outline-variant bg-surface p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-on-surface">方法测试台</p>
                            <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                              先校验 JSON contract，再用当前 integration 配置调用这个 method。
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button size="sm" variant="secondary" data-builder-validate-backend-method="" onClick={validateActiveBackendMethodContract}>
                              <CheckCircle2 aria-hidden className="size-3.5" />
                              校验契约
                            </Button>
                            <Button
                              size="sm"
                              data-builder-test-backend-method=""
                              loading={testingBackendMethodId === activeBackendIntegrationMethod.id}
                              onClick={() => void testActiveBackendIntegrationMethod()}
                            >
                              <Play aria-hidden className="size-3.5" />
                              运行方法
                            </Button>
                          </div>
                        </div>
                        {activeBackendIntegrationMethod.lastTest ? (
                          <div className="grid gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <StateLabel
                                showQuiet
                                variant={
                                  activeBackendIntegrationMethod.lastTest.status === "passed"
                                    ? "secondary"
                                    : activeBackendIntegrationMethod.lastTest.status === "skipped"
                                      ? "outline"
                                      : "destructive"
                                }
                                label={
                                  activeBackendIntegrationMethod.lastTest.status === "passed"
                                    ? "通过"
                                    : activeBackendIntegrationMethod.lastTest.status === "skipped"
                                      ? "已跳过"
                                      : activeBackendIntegrationMethod.lastTest.status === "failed"
                                        ? "失败"
                                        : "未知"
                                }
                              />
                              <span className="truncate text-on-surface-variant">
                                {activeBackendIntegrationMethod.lastTest.durationMs !== undefined
                                  ? `${activeBackendIntegrationMethod.lastTest.durationMs} ms`
                                  : "本地检查"}
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
                                ).slice(0, 4).map((issue: any) => (
                                  <p key={issue}>{issue}</p>
                                ))}
                              </div>
                            ) : null}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="min-w-0 rounded-lg bg-surface-container-low p-2">
                                <p className="mb-1 text-[0.68rem] uppercase tracking-[0.08em] text-on-surface-variant">请求</p>
                                <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words font-mono text-[0.68rem] leading-4 text-on-surface">
                                  {activeBackendIntegrationMethod.lastTest.request || "{}"}
                                </pre>
                              </div>
                              <div className="min-w-0 rounded-lg bg-surface-container-low p-2">
                                <p className="mb-1 text-[0.68rem] uppercase tracking-[0.08em] text-on-surface-variant">响应</p>
                                <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words font-mono text-[0.68rem] leading-4 text-on-surface">
                                  {activeBackendIntegrationMethod.lastTest.response || activeBackendIntegrationMethod.lastTest.error || "{}"}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs leading-5 text-on-surface-variant">还没有测试记录。契约校验会做本地 JSON 检查，运行方法会调用真实后端边界。</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Field label="健康检查命令">
                    <Input
                      data-builder-backend-integration-health-command=""
                      value={activeBackendIntegration.healthCheckCommand}
                      onChange={(event: any) => updateBackendIntegration(activeBackendIntegration.id, { healthCheckCommand: event.target.value })}
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
                        onChange={(event: any) =>
                          updateBackendIntegration(activeBackendIntegration.id, {
                            startupTimeoutMs: numberFromInput(event.target.value, activeBackendIntegration.startupTimeoutMs, 250, 60000),
                          })
                        }
                        className="font-mono text-xs"
                      />
                    </Field>
                    <div className="flex items-end">
                      <label className="flex h-[var(--control-sm)] items-center gap-2 rounded-xl bg-surface-container-high px-3 text-xs text-on-surface-variant">
                        捕获输出
                        <Switch
                          className="h-5 w-9 border"
                          checked={activeBackendIntegration.captureOutput}
                          onCheckedChange={(captureOutput: any) => updateBackendIntegration(activeBackendIntegration.id, { captureOutput })}
                        />
                      </label>
                    </div>
                  </div>
                  <Field label="备注">
                    <Textarea
                      data-builder-backend-integration-notes=""
                      value={activeBackendIntegration.notes}
                      onChange={(event: any) => updateBackendIntegration(activeBackendIntegration.id, { notes: event.target.value })}
                      className="min-h-[96px] resize-y text-xs leading-5"
                    />
                  </Field>
                  <div className="rounded-2xl bg-surface-container px-3 py-2 text-xs leading-5 text-on-surface-variant">
                    {backendIntegrationKinds.find((kind: any) => kind.value === activeBackendIntegration.kind)?.description}
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">状态变量</h3>
                      <p className="mt-1 truncate font-mono text-xs text-on-surface">{activeStateVariable.name}</p>
                    </div>
                    <CountReadout
                      label={formatStateReferenceCount(activeStateReferenceCount)}
                      count={activeStateReferenceCount}
                      className="shrink-0"
                    />
                  </div>
                  <div className="rounded-xl border border-outline-variant bg-surface-container-high p-2 text-xs">
                    <PathRow label="当前" value={activeStateVariable.name} />
                    <PathRow label="初始值" value={activeStateVariable.initialValue || "空"} />
                    <PathRow label="引用" value={formatStateReferenceCount(activeStateReferenceCount)} />
                  </div>
                  <Field label="状态名">
                    <Input
                      data-builder-state-name=""
                      value={activeStateVariable.name}
                      onChange={(event: any) => updateStateVariable(activeStateVariable.id, { name: event.target.value })}
                      spellCheck={false}
                      className="font-mono text-xs"
                    />
                  </Field>
                  <Field label="初始值">
                    <Input
                      data-builder-state-initial-value=""
                      value={activeStateVariable.initialValue}
                      onChange={(event: any) => updateStateVariable(activeStateVariable.id, { initialValue: event.target.value })}
                    />
                  </Field>
                  <Button variant="ghost" className="w-full" data-builder-delete-state="" onClick={deleteActiveStateVariable}>
                    <Trash2 aria-hidden className="size-4" />
                    删除状态
                  </Button>
                </section>
              </aside>
            </LogicWorkspace>
            </Suspense>
  );
}
