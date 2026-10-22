// The whole builder scope bag, derived instead of re-listed.
//
// Regenerate with:
//   node scripts/internal/phase2-gen-scope-shell.mjs
//
// The bag is the intersection of the four per-view key sets plus the names
// only ShellView reads. That makes it closed over exactly the keys the views
// and the shell consume — 941 from the views + 146 shell-only = 1087, the size of the
// literal in BuilderShowcase — so the one place the bag is built is the one
// place a missing key is caught.
//
// An intersection satisfies each of its members, which is what lets ShellView
// hand `scope` straight to a child and still have that child's closed key set
// apply. Without this the child literals had to be hand-copied per view.
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from "react";
import type { ProjectViewScope } from "./scope-project";
import type { DesignViewScope } from "./scope-design";
import type { LogicViewScope } from "./scope-logic";
import type { BuildViewScope } from "./scope-build";

/** Names only ShellView reads; the four mode views never see these. */
export type ShellViewOwnKey =
  | "ArrowRight"
  | "ChevronDown"
  | "FolderOpen"
  | "Input"
  | "OutputDock"
  | "Plus"
  | "PreviewDock"
  | "Search"
  | "Wand2"
  | "X"
  | "activateBuilderIssue"
  | "activeBottomDockHeight"
  | "activeFileDirty"
  | "activeModeItem"
  | "activeWorkflowRuntimeStopId"
  | "applyPropertyIssueAutoFix"
  | "beginEditorFileTabDrag"
  | "bottomDockExpanded"
  | "bottomDockLogLineCount"
  | "bottomDockLogLines"
  | "bottomDockLogMatchCount"
  | "bottomDockLogSearchQuery"
  | "bottomDockLogSource"
  | "bottomDockLogText"
  | "bottomDockTabs"
  | "builderIssues"
  | "canvasContextInsertActiveIndex"
  | "canvasContextInsertInputRef"
  | "canvasContextInsertQuery"
  | "canvasContextInsertSearchResults"
  | "canvasContextMenu"
  | "canvasContextMenuCommand"
  | "canvasContextMenuEventName"
  | "canvasContextMenuItem"
  | "canvasContextMenuSelectionEnabled"
  | "canvasContextMenuSelectionLocked"
  | "canvasContextMenuSelectionReadOnly"
  | "canvasContextMenuSelectionVisible"
  | "canvasContextMenuTextProps"
  | "canvasContextQuickInsertGroups"
  | "canvasContextQuickInsertTypes"
  | "clipboardRef"
  | "closeCanvasContextMenu"
  | "closeEditorFileTabsToRight"
  | "closeProjectExplorerContextMenu"
  | "confirmDestructiveAction"
  | "convertFileSrc"
  | "copiedOutputLog"
  | "copyBottomDockLog"
  | "destructiveAction"
  | "dispatchNovaEditorCommand"
  | "draggingEditorFileTabId"
  | "dropEditorFileTab"
  | "editorWorkflowStepStates"
  | "feedbackIssueCount"
  | "feedbackPanelOpen"
  | "feedbackStripVisible"
  | "feedbackSummaryDetail"
  | "feedbackSummaryTitle"
  | "feedbackSummaryTone"
  | "feedbackSummaryToneLabel"
  | "fileSaveStates"
  | "focusPropertyIssue"
  | "focusRustDiagnostic"
  | "handleBottomDockTabChange"
  | "handleCanvasContextInsertSearchKeyDown"
  | "insertComponentFromCanvasContext"
  | "latestRailPreset"
  | "latestRailPresetStatusLabel"
  | "latestRailPresetStatusVariant"
  | "latestRailPresetStepLabel"
  | "latestRailPresetSummary"
  | "latestRailPresetTask"
  | "latestRunSessionRunning"
  | "leftRunControlsRef"
  | "leftRunTaskTimelineRows"
  | "leftRunTaskTimelineSummary"
  | "loadWorkspace"
  | "modeBarItems"
  | "navigateBuilderIssue"
  | "openEditorFileIds"
  | "openFeedbackPanel"
  | "openLocalPath"
  | "operationMonitorDetail"
  | "operationMonitorStatus"
  | "operationMonitorTask"
  | "operationMonitorTitle"
  | "operationMonitorVisible"
  | "outputDockWorkspaceAvoidancePadding"
  | "outputDockWorkspaceHeight"
  | "outputDockWorkspacePadding"
  | "outputDockWorkspaceState"
  | "outputDockWorkspaceStyle"
  | "palettePointerDrag"
  | "parentPathFromPath"
  | "previewAutoRefresh"
  | "previewGeneratedWeb"
  | "previewVersion"
  | "previewWebPath"
  | "projectExplorerContextMenu"
  | "projectExplorerContextNode"
  | "projectJumpFeedback"
  | "projectLocatorControl"
  | "railArtifactStateLabel"
  | "railBundleTargetLabel"
  | "railConfigurationLabel"
  | "railEventTargetLabel"
  | "railKitLabel"
  | "railReleaseTargetLabel"
  | "railTaskStateLabel"
  | "refreshPreviewFrame"
  | "requestResetCurrentFile"
  | "rerunLatestRailPreset"
  | "retryLastFailedTask"
  | "runCanvasContextAction"
  | "runEditorWorkflowStep"
  | "runSelectedRailActionPreset"
  | "runWorkflowPrimaryAction"
  | "selectedBuilderIssue"
  | "selectedRailKitStepRows"
  | "selectedSimulatorTraceLogPreview"
  | "setBottomDockExpandedHeight"
  | "setBottomDockHeight"
  | "setBottomDockLogSearchQuery"
  | "setCanvasContextInsertActiveIndex"
  | "setCanvasContextInsertQuery"
  | "setDestructiveAction"
  | "setDraggingEditorFileTabId"
  | "setPreviewAutoRefresh"
  | "setSelectedRailActionPresetId"
  | "suggestedWorkflowStepId"
  | "workflowComplete"
  | "workflowPrimaryActionDisabled"
  | "workflowPrimaryActionLabel"
  | "workflowProgressValue"
  | "workflowRailBadgeLabel"
  | "workflowRailBadgeVariant"
  | "workflowRailDetail"
  | "workflowRailStateLabel"
  | "workflowRailTitle"
  | "workflowStepCount"
  | "workflowStepStatusLabel"
  ;

type ShellViewOwnScope = { [K in ShellViewOwnKey]: any }
  & {
    ProjectView: ComponentType<{ scope: ProjectViewScope }>;
    DesignView: ComponentType<{ scope: DesignViewScope }>;
    LogicView: ComponentType<{ scope: LogicViewScope }>;
    BuildView: ComponentType<{ scope: BuildViewScope }>;
  };

export type ShellViewScope =
  & ProjectViewScope
  & DesignViewScope
  & LogicViewScope
  & BuildViewScope
  & ShellViewOwnScope
  ;
