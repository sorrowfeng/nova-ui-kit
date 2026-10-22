// The editor-experience audit checklist, as pure data.
//
// Extracted from BuilderShowcase.tsx (phase 1 of docs/monolith-decomposition.md).
// The checklist is a pure function of its inputs: it does not touch refs, effects
// or the DOM, so it can live outside the component without changing what renders.
//
// Inputs come in as one snapshot for now. Phase 2 narrows the snapshot per domain
// so a builder that only audits the project tree cannot see canvas state at all.
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  CANVAS_CONTEXT_INSERT_SEARCH_LIMIT,
  EDITOR_EXPERIENCE_KNOWN_TITLEBAR_STYLES,
  EDITOR_EXPERIENCE_KNOWN_WINDOW_KINDS,
  SMART_GUIDE_SAFE_MARGIN,
  SMART_GUIDE_THRESHOLD,
  frameLayoutLabel,
  frameLayoutValues,
  getItemSummary,
  projectExplorerNodeGroupId,
  projectExplorerNodeMatchesSearch,
  quickTextPropsForItem,
  rustCompletionKindLabel,
  rustOutlineKindTitle,
  type EditorExperienceAuditItem,
} from "./monolith-module";
import { getDefinition } from "./component-palette";
import { sanitizeRustCommandName } from "./rust-commands";

/** Percent label for a canvas zoom factor. Shared with the shell chrome. */
export function formatCanvasZoom(zoom: number): string {
  return `${Math.round(zoom * 100)}%`;
}
export type EditorExperienceAuditSnapshot = Record<string, any>;

export function buildEditorExperienceAuditItems(s: EditorExperienceAuditSnapshot): EditorExperienceAuditItem[] {
  const projectTreeHasNovaMetadata = s.projectExplorerModel.nodes.some((node: any) => node.id === "nova-workspace" || node.id === "nova-editor-state");
  const projectTreeHasManagedFiles = s.projectExplorerModel.nodes.some((node: any) => ["ui", "rust", "assets"].includes(projectExplorerNodeGroupId(node)));
  const projectTreeKeyboardReady = s.visibleProjectExplorerNodes.length > 0 && Boolean(s.selectedProjectExplorerNode);
  const projectTreeBulkFoldingReady = s.projectExplorerFolderNodeIds.length > 0;
  const projectTreeContextReady = s.projectExplorerModel.nodes.some((node: any) => node.action !== "none");
  const projectLocatorReady =
    s.projectExplorerModel.nodes.some((node: any) => node.id === "rust-logic" && projectExplorerNodeMatchesSearch(node, "logic.rs")) &&
    s.projectExplorerModel.nodes.some((node: any) => node.id.startsWith("ui-") && projectExplorerNodeMatchesSearch(node, "ui/"));
  const projectFileRouteCount = s.projectFileRouteGroups.reduce((total: any, group: any) => total + group.routes.length, 0);
  const projectFileRoutingReady =
    s.projectFileRouteGroups.some((group: any) => group.id === "source" && group.routes.some((route: any) => route.id === "source-ui")) &&
    s.projectFileRouteGroups.some((group: any) => group.id === "generated" && group.routes.some((route: any) => route.id === "generated-app")) &&
    s.projectFileRouteGroups.some((group: any) => group.id === "metadata" && group.routes.some((route: any) => route.id === "metadata-editor-state"));
  const projectFolderHealthReady =
    s.projectFolderHealthItems.length >= 4 &&
    ["root", "source", "generated", "metadata"].every((id) => s.projectFolderHealthItems.some((item: any) => item.id === id)) &&
    s.projectFolderHealthItems.some((item: any) => item.id === "metadata" && item.path.includes(".nova"));
  const projectOwnershipMatrixReady =
    s.projectOwnershipMatrixItems.length === 3 &&
    s.projectOwnershipMatrixItems.every((item: any) => item.routeCount > 0 && Boolean(item.primaryRoute.nodeId));
  const projectWorkingSetReady =
    s.projectWorkingSetItems.length >= 3 &&
    s.projectWorkingSetItems.some((item: any) => item.active) &&
    // Match the tab's own kind, not its badge text or the "current" remap:
    // an unsaved build tab or one without an exe is still the build entry.
    s.projectWorkingSetItems.some((item: any) => item.tabKind === "logic") &&
    s.projectWorkingSetItems.some((item: any) => item.tabKind === "build");
  const projectActionCenterReady =
    s.projectActionCenterItems.length >= 5 &&
    s.projectActionCenterItems.some((item: any) => item.kind === "sync") &&
    s.projectActionCenterItems.some((item: any) => item.kind === "logic") &&
    s.projectActionCenterItems.some((item: any) => item.kind === "run") &&
    s.projectActionCenterItems.some((item: any) => item.kind === "build");
  const textEditableControlCount = s.items.filter((item: any) => quickTextPropsForItem(item).length > 0).length;
  const runtimeStateControlCount = s.items.filter((item: any) => item.props.enabled === false || item.props.visible === false || item.props.readOnly === true).length;
  const navigatorManagedStateCount = s.items.filter((item: any) => item.locked || item.props.visible === false).length;
  const selectionValid = ["idle", "single", "multi"].includes(s.selectionActionBarState) && s.selectedIds.every((id: any) => s.items.some((item: any) => item.id === id));
  const selectionActionBarOverflowReady =
    s.selectionActionBarActionCount > 0 && (s.hasCanvasSelection ? s.selectionActionBarActionCount >= 18 : s.selectionActionBarActionCount === 2);
  const selectionCapabilityStripReady =
    s.selectionCapabilityItems.length >= 4 &&
    ["layout", "text", "logic", "runtime"].every((id) => s.selectionCapabilityItems.some((item: any) => item.id === id));
  const selectedHierarchyReady = !s.selectedItem || s.selectedItemHierarchy.some((item: any) => item.id === s.selectedItem.id);
  const marqueeValid =
    s.selectionMarquee === null ||
    (Number.isFinite(s.selectionMarquee.currentX) && Number.isFinite(s.selectionMarquee.currentY));
  const multiSelectLayoutToolsReady =
    s.selectedItems.length < 2 ||
    (s.selectedBatchLayoutSummary.movableCount + s.selectedBatchLayoutSummary.lockedCount === s.selectedItems.length &&
      s.selectedBatchLayoutSummary.boundsLabel.length > 0);
  const resizeHandlesReady = s.resizeHandleMetas.length === 8;
  const smartGuidesReady = SMART_GUIDE_THRESHOLD > 0;
  const groupedFrameCount = s.items.filter((item: any) => item.type === "frame" && s.items.some((candidate: any) => candidate.parentId === item.id)).length;
  const releaseShellValid =
    EDITOR_EXPERIENCE_KNOWN_WINDOW_KINDS.includes(s.activeProject.releaseConfig.windowKind) &&
    EDITOR_EXPERIENCE_KNOWN_TITLEBAR_STYLES.includes(s.activeProject.releaseConfig.titlebarStyle);
  const pageShellValid =
    EDITOR_EXPERIENCE_KNOWN_WINDOW_KINDS.includes(s.page.windowKind) &&
    EDITOR_EXPERIENCE_KNOWN_TITLEBAR_STYLES.includes(s.page.titlebarStyle);
  const pageWindowShellPresetsReady =
    s.pageWindowShellPresets.length >= 4 &&
    s.pageWindowShellPresets.some((preset: any) => preset.windowKind === "main" && preset.titlebarStyle === "nova") &&
    s.pageWindowShellPresets.some((preset: any) => preset.windowKind === "dialog") &&
    s.pageWindowShellPresets.some((preset: any) => preset.windowKind === "tool") &&
    s.pageWindowShellPresets.some((preset: any) => preset.windowKind === "frameless" && preset.titlebarStyle === "hidden");
  const signalSlotModelValid = Number.isFinite(s.logicConnectionHealthScore);
  const hasSignalSlotWarnings = s.missingRustSlotEntries.length > 0 || s.logicSignalSlotUnboundCount > 0;
  const logicFlowBoardReady = Boolean(s.logicWorkflowRow);
  const logicFlowBoardComplete = Boolean(s.logicWorkflowRow?.command && s.logicWorkflowOutlineEntry?.line);
  const logicContextSummaryReady =
    s.logicContextSummaryItems.length >= 4 &&
    ["logic-context-signal", "logic-context-cursor", "logic-context-command", "logic-context-evidence"].every((id) =>
      s.logicContextSummaryItems.some((item: any) => item.id === id),
    );
  const md3ApplicationComponentsReady =
    s.md3ApplicationComponentTypes.length >= 32 &&
    s.md3ApplicationComponentTypes.every((type: any) => s.palette.some((definition: any) => definition.type === type));
  const componentPaletteKitsReady =
    s.componentPaletteKitDefinitions.length >= 5 &&
    s.componentPaletteKitDefinitions.every((kit: any) =>
      kit.types.length >= 8 && s.palette.some((definition: any) => definition.type === kit.primaryType),
    );
  const componentPaletteKitScaffoldReady =
    componentPaletteKitsReady && s.componentPaletteKitRows.every((row: any) => row.availableCount >= Math.min(8, row.totalCount));
  const contextMenuPlacementReady =
    s.floatingEditorMenuViewportPadding > 0 &&
    s.canvasContextMenuWidth === s.projectExplorerContextMenuWidth &&
    s.projectExplorerContextMenuEstimatedHeight > 0;
  const canvasContextQuickInsertGroupCount = s.canvasContextQuickInsertGroups.length;
  const canvasContextQuickInsertReady =
    canvasContextQuickInsertGroupCount >= 4 && s.canvasContextQuickInsertTypes.length >= 20;
  const canvasContextInsertSearchReady = s.palette.length >= 100 && CANVAS_CONTEXT_INSERT_SEARCH_LIMIT >= 8;

  return [
    {
      id: "selection-actionbar",
      title: "固定选择操作栏",
      severity: selectionValid ? "pass" : "fail",
      detail: `选择状态 ${s.selectionActionBarState}，当前选中 ${s.selectedIds.length} 个控件。`,
    },
    {
      id: "selection-actionbar-stable-track",
      title: "选择操作栏稳定轨道",
      severity: "pass",
      detail: `选择栏固定在画布顶部预留轨道，当前工具条状态为 ${s.selectionActionBarReservedTrack}，选中控件不会触发布局位移。`,
    },
    {
      id: "selection-actionbar-overflow",
      title: "选择操作栏拥挤保护",
      severity: selectionActionBarOverflowReady ? "pass" : "fail",
      detail: `命令区 ${s.selectionActionBarActionCount} 项动作在独立滚动视口内展示，选择摘要保持固定。`,
    },
    {
      id: "selection-capability-strip",
      title: "选择能力一致性",
      severity: selectionCapabilityStripReady ? "pass" : "fail",
      detail: `选择栏固定展示 ${s.selectionCapabilityItems.map((item: any) => `${item.label}:${item.value}`).join("、")}，不同控件只改变可用状态，不改变操作栏结构。`,
    },
    {
      id: "selection-marquee",
      title: "多选与框选模型",
      severity: marqueeValid ? "pass" : "fail",
      detail: `选择锚点 ${s.selectionAnchorId || "无"}，框选状态 ${s.selectionMarquee ? s.selectionMarquee.mode : "空闲"}。`,
    },
    {
      id: "selection-status-bar",
      title: "状态栏选择模式提示",
      severity: ["idle", "single", "multi", "marquee", "add", "subtract", "pan"].includes(s.selectionModeHudTone) ? "pass" : "fail",
      detail: `${s.selectionModeHudLabel} · 当前计数 ${s.selectionModeHudCount}，提示移入底部状态栏，不占用画布空间。`,
    },
    {
      id: "selection-mode-strip",
      title: "选择模式固定帮助条",
      severity: s.selectionModeAffordanceItems.length >= 5 ? "pass" : "fail",
      detail: `选择栏持续展示 ${s.selectionModeAffordanceItems.map((item: any) => `${item.label}(${item.shortcut})`).join("、")}，idle/single/multi 共用同一轨道。`,
    },
    {
      id: "selection-same-type",
      title: "同类控件快速选择",
      severity: s.items.length > 0 ? "pass" : "warning",
      detail: s.selectedSameTypeAnchor
        ? `当前锚点 ${getDefinition(s.selectedSameTypeAnchor.type).title} 可一键选出 ${s.selectedSameTypeCount} 个同类控件。`
        : "选中一个控件后，可通过 Ctrl+Shift+A、选择栏或右键菜单选出同类型控件。",
    },
    {
      id: "selection-invert",
      title: "反选选择集",
      severity: s.items.length > 0 ? "pass" : "warning",
      detail:
        s.selectedIds.length > 0
          ? `当前已选 ${s.selectedIds.length} 个控件，可用 Ctrl+I 快速切换到剩余 ${Math.max(0, s.items.length - s.selectedIds.length)} 个控件。`
          : "可通过 Ctrl+I、选择栏或右键菜单把当前选择集切换为画布补集。",
    },
    {
      id: "multi-select-inspector",
      title: "多选批量检查器",
      severity: s.selectedItems.length > 1 ? "pass" : "warning",
      detail:
        s.selectedItems.length > 1
          ? `${s.selectedItems.length} 个控件可批量编辑尺寸、锁定、运行态可见、启用和只读状态。`
          : "框选或多选控件后，右侧属性面板会显示批量尺寸、锁定和运行态编辑器。",
    },
    {
      id: "multi-select-layout-tools",
      title: "多选批量布局工具",
      severity: multiSelectLayoutToolsReady ? "pass" : "warning",
      detail:
        s.selectedItems.length > 1
          ? `选区 ${s.selectedBatchLayoutSummary.boundsLabel}，${s.selectedBatchLayoutSummary.movableCount} 个可移动、${s.selectedBatchLayoutSummary.lockedCount} 个锁定；${s.selectedBatchLayoutSummary.spacingLabel}。`
          : "多选后，右侧批量检查器会集中提供对齐、等距分布、选区范围和锁定状态摘要。",
    },
    {
      id: "selection-keyboard-nudge",
      title: "键盘微调与边界保护",
      severity: s.selectedIds.every((id: any) => s.items.some((item: any) => item.id === id)) ? "pass" : "fail",
      detail: "设计画布支持方向键移动选中控件，Shift+方向键按网格/大步进移动，并保持多选相对位置不被边界压缩。",
    },
    {
      id: "selection-hierarchy-breadcrumb",
      title: "选择层级路径",
      severity: selectedHierarchyReady ? "pass" : "fail",
      detail: s.selectedItem
        ? `${s.activeFile.name} / ${s.selectedItemHierarchy.map((item: any) => getItemSummary(item)).join(" / ")}`
        : "单选控件时会在固定选择栏显示可点击的画布、父容器和当前控件路径。",
    },
    {
      id: "canvas-fit-selection",
      title: "画布适配选区",
      severity: "pass",
      detail: s.selectedCanvasFitBounds
        ? `${s.selectedIds.length} 个控件可用 Ctrl+2 居中适配视口。`
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
      detail: s.canvasDragMetricsOverlay
        ? `${s.canvasDragMetricsOverlay.title}：${s.canvasDragMetricsOverlay.detail}`
        : "移动或缩放控件时，画布会就地显示 delta、尺寸、参考线数量和释放目标。",
    },
    {
      id: "canvas-rulers",
      title: "设计标尺与坐标参考",
      severity: s.canvasHorizontalRulerMarks.length > 0 && s.canvasVerticalRulerMarks.length > 0 ? "pass" : "fail",
      detail: s.canvasRulerSelectionProjection
        ? `标尺按 ${s.page.gridSize}px 网格和 ${formatCanvasZoom(s.page.zoom)} 缩放投影选区：${s.canvasRulerSelectionProjection.label}。`
        : `标尺按 ${s.page.gridSize}px 网格和 ${formatCanvasZoom(s.page.zoom)} 缩放显示 ${s.page.width} x ${s.page.height} 画布。`,
    },
    {
      id: "canvas-ruler-toggle",
      title: "设计标尺显隐开关",
      severity: typeof s.page.showRulers === "boolean" ? "pass" : "fail",
      detail: s.page.showRulers
        ? "设计标尺已显示，可在画布工具条或页面设置中关闭。"
        : "设计标尺已隐藏，页面设置仍保留该偏好并可随时恢复。",
    },
    {
      id: "grouping-model",
      title: "成组与层级组织",
      severity: s.palette.some((definition: any) => definition.type === "frame") ? "pass" : "fail",
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
      detail: s.selectedIds.length > 0
        ? `已选择 ${s.selectedIds.length} 个控件；Ctrl+] / Ctrl+[ 逐级调整，Ctrl+Shift+] / Ctrl+Shift+[ 置顶或置底。`
        : "选择控件后可用 Ctrl+] / Ctrl+[ 调整同组层级，也可在选择栏或右键菜单操作。",
    },
    {
      id: "tab-order-editor",
      title: "Tab 顺序编辑",
      severity: s.focusableTabOrderItems.length > 0 ? "pass" : "warning",
      detail: s.focusableTabOrderItems.length > 0
        ? `${s.focusableTabOrderItems.length} 个可聚焦控件可用覆盖层、右键菜单、属性面板和 Ctrl+Alt+T 管理 Tab 顺序。`
        : "添加按钮、输入框、选择框等交互控件后，可配置桌面表单键盘焦点顺序。",
    },
    {
      id: "runtime-state-editor",
      title: "控件运行状态",
      severity: s.focusableTabOrderItems.length > 0 ? "pass" : "warning",
      detail: runtimeStateControlCount > 0
        ? `${runtimeStateControlCount} 个控件配置了隐藏、禁用或只读状态，并会同步到生成 exe。`
        : "属性面板可为交互控件设置运行态可见、启用和只读状态。",
    },
    {
      id: "canvas-context-runtime-state",
      title: "右键运行态切换",
      severity: s.items.length > 0 ? "pass" : "warning",
      detail:
        s.selectedItems.length > 0
          ? `右键菜单可切换 ${s.selectedItems.length} 个选中控件的运行态可见、交互启用和输入只读；当前 ${s.selectedBatchRuntimeSummary.visibleCount}/${s.selectedItems.length} 可见。`
          : "画布右键菜单可直接切换选中控件在生成 exe 中的可见、启用和只读状态。",
    },
    {
      id: "navigator-visibility-locks",
      title: "对象树可见性与锁定",
      severity: s.items.length > 0 ? "pass" : "warning",
      detail: navigatorManagedStateCount > 0
        ? `${navigatorManagedStateCount} 个控件在对象树中带有隐藏或锁定状态，可从 Navigator 直接切换。`
        : "Navigator 和对象树行可直接切换运行态可见性与锁定状态，便于找回隐藏控件并保护布局。",
    },
    {
      id: "output-dock-policy",
      title: "输出 输出面板 无背景遮罩",
      severity: s.outputDockWorkspacePadding === "pb-0" && s.outputDockWorkspaceAvoidancePadding === "0px" ? "pass" : "fail",
      detail: `底部 输出面板 状态 ${s.outputDockWorkspaceState}，工作区 padding=${s.outputDockWorkspaceAvoidancePadding}，最小化和展开都不再撑出可见背景遮罩。`,
    },
    {
      id: "output-dock-resizable",
      title: "输出 输出面板 可调高度",
      severity: s.activeBottomDockHeight >= 300 ? "pass" : "fail",
      detail: `标准 ${s.bottomDockHeight}px，展开 ${s.bottomDockExpandedHeight}px，当前 ${s.outputDockWorkspaceHeight}，可拖动顶部手柄或用方向键调整。`,
    },
    {
      id: "output-dock-viewport-fit",
      title: "输出 输出面板 视口适配",
      severity: "pass",
      detail: "Dock 高度由组件按视口暴露 min/max 范围；短窗口会进入 compact 高度，避免内容被窗口边缘裁掉。",
    },
    {
      id: "canvas-output-dock-avoidance",
      title: "画布避让输出 Dock",
      severity: s.canvasViewportDockScrollPadding >= (s.bottomDockMinimized ? 68 : s.activeBottomDockHeight) ? "pass" : "fail",
      detail: `滚动定位避让 ${s.canvasViewportDockScrollPadding}px，随底部 输出面板 当前高度 ${s.outputDockWorkspaceHeight} 动态更新。`,
    },
    {
      id: "canvas-output-dock-no-white-band",
      title: "画布底部无空白带",
      severity: s.canvasViewportDockVisualPadding <= 16 ? "pass" : "fail",
      detail: `Dock 是固定浮层，画布只保留 ${s.canvasViewportDockVisualPadding}px 视觉缓冲，不再用 输出面板 高度撑出空白区域。`,
    },
    {
      id: "runtime-shell",
      title: "生成 exe 窗口壳",
      severity: releaseShellValid ? "pass" : "fail",
      detail: `Release 目标为 ${s.releaseWindowKindMeta.label} / ${s.releaseTitlebarStyleMeta.label}。`,
    },
    {
      id: "runtime-grid",
      title: "运行时去除设计网格",
      severity: "pass",
      detail: `设计画布网格 ${s.page.showGrid ? "开启" : "关闭"}，生成 runtime 由构建检查守护 data-runtime-grid=off。`,
    },
    {
      id: "runtime-window-parity",
      title: "运行端窗口一致性",
      severity: releaseShellValid && s.releaseWindowShellMatchesPage && s.activeProject.releaseConfig.titlebarStyle === "nova" ? "pass" : "warning",
      detail: `发布端为 ${s.releaseWindowKindMeta.label} / ${s.releaseTitlebarStyleMeta.label}，运行端固定关闭编辑网格，${s.releaseWindowShellMatchesPage ? "页面外壳已同步" : "页面外壳可同步"}。`,
    },
    {
      id: "page-window-shape",
      title: "当前 UI 外窗体",
      severity: pageShellValid ? (s.releaseWindowShellMatchesPage ? "pass" : "warning") : "fail",
      detail: `${s.activeFile.name} 使用 ${s.pageWindowKindMeta.label} / ${s.pageTitlebarStyleMeta.label}，${s.releaseWindowShellMatchesPage ? "已同步到发布目标" : "可同步到发布目标"}。`,
    },
    {
      id: "page-window-shell-presets",
      title: "窗体外壳预设",
      severity: pageWindowShellPresetsReady ? "pass" : "fail",
      detail: `${s.pageWindowShellPresets.length} 个预设覆盖主窗口、对话框、工具窗口和无框沉浸，可一键更新当前 UI 外窗体。`,
    },
    {
      id: "rust-editor",
      title: "Rust 编辑与补全",
      severity: s.activeProject.rustLogic.trim().length > 0 && s.activeProject.rustCommands.length > 0 ? "pass" : "fail",
      detail: `${s.activeProject.rustCommands.length} 个命令，${s.activeProject.rustModules.length} 个模块，${s.activeProject.cargoDependencies.length} 个依赖。`,
    },
    {
      id: "rust-editor-completion-detail",
      title: "Rust 补全来源详情",
      severity: s.rustCompletionItems.length > 0 || s.activeProject.rustLogic.trim().length > 0 ? "pass" : "warning",
      detail: s.activeRustCompletion
        ? `${s.activeRustCompletion.label} 来自 ${s.activeRustCompletion.sourceLabel ?? rustCompletionKindLabel(s.activeRustCompletion.kind)}，预览 ${s.activeRustCompletion.insertPreview ?? s.rustCompletionInsertPreview(s.activeRustCompletion.insertText)}。`
        : "补全候选会显示来源、插入预览，并能从源码符号补全跳回对应 logic.rs 行号。",
    },
    {
      id: "rust-editor-completion-commit",
      title: "Rust 补全提交闭环",
      severity: s.rustCompletionCommit || s.activeProject.rustLogic.trim().length > 0 ? "pass" : "warning",
      detail: s.rustCompletionCommit
        ? `${s.rustCompletionCommit.label} 已插入 ${s.rustCompletionCommit.insertedLength} 个字符，光标停在 ${s.rustCompletionCommit.cursor}。`
        : "Ctrl+Space 打开补全后，ArrowUp/ArrowDown 选择，Enter/Tab 或详情插入按钮会提交候选并在状态栏确认。",
    },
    {
      id: "rust-editor-signature-help",
      title: "Rust 签名帮助",
      severity: s.rustSignatureHelp ? "pass" : "warning",
      detail: s.rustSignatureHelp
        ? `${s.rustSignatureHelp.signature}，${s.rustSignatureHelp.parameters.length} 个参数，${s.rustSignatureHelp.bindingCount} 个 UI 调用，返回 ${s.rustSignatureHelp.resultSummary}。`
        : "逻辑页会根据光标所在槽函数或当前命令显示 Rust command 签名、参数来源和返回结构。",
    },
    {
      id: "rust-editor-format",
      title: "Rust 源码格式化",
      severity: s.activeProject.rustLogic.trim().length > 0 ? "pass" : "warning",
      detail: "逻辑页支持 Ctrl+Shift+F 轻量格式化，整理缩进、尾随空白和多余空行。",
    },
    {
      id: "rust-editor-line-comment",
      title: "Rust 行注释切换",
      severity: s.activeProject.rustLogic.length > 0 ? "pass" : "warning",
      detail: "逻辑页支持 Ctrl+/ 对当前行或选区执行 // 注释与取消注释。",
    },
    {
      id: "rust-editor-smart-pairs",
      title: "Rust 成对符号输入",
      severity: s.activeProject.rustLogic.length > 0 ? "pass" : "warning",
      detail: "逻辑页支持括号/引号成对输入、成对符号中间 Backspace 同步删除，以及 Enter 自动缩进。",
    },
    {
      id: "rust-editor-word-wrap",
      title: "Rust 自动折行",
      severity: "pass",
      detail: s.rustEditorWordWrap
        ? "逻辑页已开启自动折行，长命令和 JSON 片段会保持在编辑器宽度内。"
        : "逻辑页可一键切换自动折行，默认保持横向滚动，适合查看生成代码。",
    },
    {
      id: "rust-editor-duplicate-line",
      title: "Rust 复制行/选区",
      severity: s.activeProject.rustLogic.length > 0 ? "pass" : "warning",
      detail: "逻辑页支持 Ctrl+D 复制当前行或所选 Rust 代码片段。",
    },
    {
      id: "rust-editor-move-line",
      title: "Rust 行块移动",
      severity: s.activeProject.rustLogic.length > 0 ? "pass" : "warning",
      detail: "逻辑页支持 Alt+Up / Alt+Down 移动当前行或所选 Rust 行块。",
    },
    {
      id: "rust-editor-replace",
      title: "Rust 查找替换",
      severity: s.rustFindQuery.trim().length > 0 ? (s.rustFindMatches.length > 0 ? "pass" : "warning") : "pass",
      detail: s.rustFindQuery.trim().length > 0
        ? `${s.rustFindMatches.length} 个源码匹配项，可替换当前或全部替换。`
        : "逻辑页支持查找、大小写匹配、替换当前和全部替换。",
    },
    {
      id: "rust-editor-goto-line",
      title: "Rust 跳转行列",
      severity: s.rustEditorLines.length > 0 ? "pass" : "warning",
      detail: `逻辑页支持 Ctrl+G 聚焦行号输入，并跳转到 1-${s.rustEditorLines.length} 行内的指定位置。`,
    },
    {
      id: "rust-editor-minimap",
      title: "Rust 代码概览",
      severity: s.rustEditorMinimapMarkers.length > 0 ? "pass" : "warning",
      detail: `${s.rustEditorMinimapMarkers.length} 个 minimap 标记覆盖大纲、诊断、查找命中、当前符号和光标行，可点击跳转源码。`,
    },
    {
      id: "rust-editor-breadcrumbs",
      title: "Rust 当前位置 Breadcrumbs",
      severity: s.rustCursorOutlineEntry ? "pass" : "warning",
      detail: s.rustCursorOutlineEntry
        ? `Breadcrumbs 可从项目、logic.rs、${rustOutlineKindTitle(s.rustCursorOutlineEntry.kind)} 和${s.rustCursorSignalSlotRow ? "绑定控件" : "当前源码"}逐级跳转。`
        : "移动光标到函数、槽函数或类型内后，Breadcrumbs 会显示可点击的 Rust 上下文路径。",
    },
    {
      id: "rust-editor-rename-symbol",
      title: "Rust 符号重命名",
      severity: s.rustCurrentIdentifier ? "pass" : "warning",
      detail: s.rustCurrentIdentifier
        ? `当前符号 ${s.rustCurrentIdentifier.name} 有 ${s.rustCurrentIdentifierOccurrences.length} 处词法匹配，可用 F2 快速重命名。`
        : "逻辑页支持 F2 对光标处 Rust 标识符执行词法级快速重命名。",
    },
    {
      id: "rust-editor-references",
      title: "Rust 符号引用",
      severity: s.rustCurrentIdentifierReferences.length > 0 ? "pass" : "warning",
      detail: s.rustCurrentIdentifier
        ? `${s.rustCurrentIdentifier.name} 有 ${s.rustCurrentIdentifierReferences.length} 处引用，引用面板显示行列、源码片段并可点击选中。`
        : "把光标放到 Rust 标识符上后，逻辑页会列出当前符号引用并支持逐条跳转。",
    },
    {
      id: "rust-editor-copy-location",
      title: "Rust 位置复制",
      severity: s.rustEditorSelection.line > 0 && s.rustEditorSelection.column > 0 ? "pass" : "warning",
      detail: `逻辑页可复制 rust/logic.rs:${s.rustEditorSelection.line}:${s.rustEditorSelection.column}，便于从日志、任务和笔记回跳。`,
    },
    {
      id: "rust-editor-select-symbol-range",
      title: "Rust 符号范围选择",
      severity: s.rustCursorOutlineEntry?.line ? "pass" : "warning",
      detail: s.rustCursorOutlineEntry?.line
        ? `Alt+Enter 可选择 ${rustOutlineKindTitle(s.rustCursorOutlineEntry.kind)} ${s.rustCursorOutlineEntry.label} 的完整范围，便于复制、重构和批量编辑。`
        : "移动光标到函数、槽函数、module、impl、type 或 const 内后，可一键选择整个符号范围。",
    },
    {
      id: "rust-diagnostic-gutter",
      title: "Rust 诊断 Gutter",
      severity: "pass",
      detail: s.buildDiagnostics.length > 0
        ? `${s.buildDiagnostics.length} 个构建诊断映射到 ${s.rustDiagnosticsBySourceLine.size} 个可点击源码行。`
        : "Rust 编辑器左侧行号可直接跳转；出现构建诊断时，红/黄标记可点击打开问题并定位源码。",
    },
    {
      id: "rust-editor-quick-fixes",
      title: "Rust 快速修复",
      severity: s.actionableRustQuickFixCount > 0 ? "pass" : "warning",
      detail: `逻辑页提供 ${s.rustEditorQuickFixes.length} 个 quick fix，覆盖缺失槽函数、构建诊断、格式化、命令草稿、引用浏览和符号重命名。`,
    },
    {
      id: "rust-editor-evidence-toolbar",
      title: "Rust 证据回跳",
      severity: "pass",
      detail: `Rust 逻辑页可直接打开 ${s.builderIssueCount} 个问题、${s.activeProjectTasks.length} 个任务和运行日志 Dock。`,
    },
    {
      id: "rust-codelens-callers",
      title: "Rust CodeLens 调用者",
      severity: s.activeRustCommandCodeLensRows.length > 0 ? "pass" : "warning",
      detail: `${sanitizeRustCommandName(s.activeRustCommand.name)} CodeLens 当前显示 ${s.activeRustCommandCodeLensRows.length} 行，${s.activeRustCommandBindingRows.length} 个已绑定 UI 调用；可从编辑器上下文直接跳控件、跳槽函数、运行或打开映射。`,
    },
    {
      id: "logic-command-center",
      title: "当前命令操作中心",
      severity: s.activeProject.rustCommands.length > 0 ? "pass" : "warning",
      detail: `${sanitizeRustCommandName(s.activeRustCommand.name)} 的槽函数、主调用控件、运行、映射、连接矩阵和调试响应片段集中在 Rust 编辑器上方操作区。`,
    },
    {
      id: "rust-command-source-inspector",
      title: "Rust Command 源码检查器",
      severity: s.activeProject.rustCommands.length > 0 ? (s.activeRustCommandOutlineEntry ? "pass" : "warning") : "fail",
      detail: `${s.activeRustCommandInvokeName} 映射到 ${s.activeRustCommandSourceLineLabel}，${s.activeRustCommandBindingRows.length} 个 UI 调用，可直接复制 invoke、打开源码、运行主调用或检查映射。`,
    },
    {
      id: "signal-slot",
      title: "UI 到后端槽函数链接",
      severity: signalSlotModelValid ? (hasSignalSlotWarnings ? "warning" : "pass") : "fail",
      detail: `${s.logicSignalSlotBoundCount}/${s.logicSignalSlotRows.length} 个控件事件已绑定，${s.missingRustSlotEntries.length} 个槽函数待生成，健康度 ${s.logicConnectionHealthScore}%。`,
    },
    {
      id: "logic-connection-matrix",
      title: "信号槽连接矩阵",
      severity: s.logicSignalSlotRows.length > 0 ? "pass" : "warning",
      detail:
        s.logicSignalSlotRows.length > 0
          ? `${s.filteredLogicConnectionRows.length} 条连接按控件信号、Rust command、槽函数状态和结果回写对齐展示。`
          : "添加 Button、Input、Switch、Select 等交互控件后，逻辑页会显示可直接绑定和运行的连接矩阵。",
    },
    {
      id: "logic-flow-board",
      title: "逻辑链路板",
      severity: logicFlowBoardReady ? (logicFlowBoardComplete ? "pass" : "warning") : "warning",
      detail: s.logicWorkflowRow
        ? `${getItemSummary(s.logicWorkflowRow.item)}.${s.logicWorkflowRow.eventName} -> ${
            s.logicWorkflowRow.command ? sanitizeRustCommandName(s.logicWorkflowRow.command.name) : "待绑定 command"
          }，槽函数${s.logicWorkflowOutlineEntry?.line ? `位于 logic.rs:${s.logicWorkflowOutlineEntry.line}` : "需要生成或连接"}。`
        : "选择一个有事件的控件后，逻辑页会显示控件信号、Rust command、槽函数源码和运行回写四段链路。",
    },
    {
      id: "logic-context-summary",
      title: "逻辑上下文摘要",
      severity: logicContextSummaryReady ? "pass" : "warning",
      detail: `${s.logicContextSummaryItems.length} 个上下文入口把 UI 信号、Rust 光标、活跃 command 和运行/诊断证据集中显示；当前 command 为 ${sanitizeRustCommandName(s.activeRustCommand.name)}。`,
    },
    {
      id: "logic-workbench-next-actions",
      title: "逻辑页下一步工作台",
      severity: s.logicWorkbenchNextActions.length > 0 && s.logicWorkbenchPrimaryAction ? "pass" : "warning",
      detail: s.logicWorkbenchPrimaryAction
        ? `${s.logicWorkbenchPrimaryAction.title} 是当前推荐动作；逻辑页共提供 ${s.logicWorkbenchNextActions.length} 个下一步入口，覆盖绑定、生成槽、运行验证和证据回看。`
        : "逻辑页需要根据当前信号/槽状态自动推荐下一步动作。",
    },
    {
      id: "rust-command-binding-preview",
      title: "Rust 命令调用关系",
      severity: s.activeProject.rustCommands.length > 0 ? "pass" : "warning",
      detail: `${sanitizeRustCommandName(s.activeRustCommand.name)} 当前有 ${s.activeRustCommandBindingRows.length} 个 UI 调用；右侧命令属性可查看输入、输出、跳回控件、运行和映射设置。`,
    },
    {
      id: "rust-command-slot-card",
      title: "当前命令槽函数卡片",
      severity: s.activeRustCommandOutlineEntry ? "pass" : "warning",
      detail: `${sanitizeRustCommandName(s.activeRustCommand.name)} 槽函数状态：${s.activeRustCommandSlotLocationLabel}；右侧卡片可打开源码、生成缺失槽或切到调用者列表。`,
    },
    {
      id: "logic-command-impact-panel",
      title: "Rust 命令影响面板",
      severity: s.activeProject.rustCommands.length > 0 ? "pass" : "warning",
      detail: `${sanitizeRustCommandName(s.activeRustCommand.name)} 汇总 ${s.activeRustCommandBindingRows.length} 个 UI 调用、${s.activeRustCommandParameters.length} 个输入参数、${s.activeRustCommandResultImpacts.length} 个结果影响和 ${s.activeRustCommandSlotLocationLabel}。`,
    },
    {
      id: "rust-debug-workbench",
      title: "Rust 调试工作台",
      severity: s.rustDebuggerTabs.length === 4 && s.rustDebuggerBreakpointRows.length > 0 && s.rustDebuggerWatchRows.length > 0 ? "pass" : "warning",
      detail: `Problems ${s.rustDebuggerProblemRows.length} / Breakpoints ${s.rustDebuggerBreakpointRows.length} / Watch ${s.rustDebuggerWatchRows.length} / Call Stack ${s.rustDebuggerCallStackRows.length}，可在逻辑页右侧直接查看诊断、断点、观察值和调用链。`,
    },
    {
      id: "selection-signal-slot-strip",
      title: "选择栏 Signal/Slot 快捷链路",
      severity: s.logicSignalSlotRows.length > 0 ? "pass" : "warning",
      detail:
        s.selectedItem && s.selectedEventName
          ? `${getItemSummary(s.selectedItem)}.${s.selectedEventName} -> ${
              s.selectedEventCommand ? sanitizeRustCommandName(s.selectedEventCommand.name) : "待创建 Rust command"
            } -> ${s.selectedSignalSlotOutlineEntry?.line ? `logic.rs:${s.selectedSignalSlotOutlineEntry.line}` : s.selectedEventCommand ? "定位函数" : "创建槽函数"}。`
          : "单选可交互控件时，固定选择栏会显示事件、Rust command 和 logic.rs 槽函数入口。",
    },
    {
      id: "problem-navigation",
      title: "问题导航",
      severity: "pass",
      detail: s.builderIssueCount > 0
        ? `底部 输出面板 当前有 ${s.builderIssueCount} 个问题，可用 F8 / Shift+F8 在诊断、属性问题和构建错误之间跳转。`
        : "底部 输出面板 支持 F8 / Shift+F8 问题导航；当前没有活跃问题。",
    },
    {
      id: "project-tree",
      title: "项目树和 .nova 元数据",
      severity: projectTreeHasManagedFiles && projectTreeHasNovaMetadata && s.projectSaveManifestItems.length >= 7 ? "pass" : "fail",
      detail: `${s.projectExplorerModel.summary}；${projectTreeHasNovaMetadata ? "已暴露 .nova 元数据" : "缺少 .nova 元数据节点"}；保存清单 ${s.projectSaveManifestItems.length} 项。`,
    },
    {
      id: "project-file-routing",
      title: "项目文件路由",
      severity: projectFileRoutingReady && projectFileRouteCount >= 15 ? "pass" : "fail",
      detail: `${s.projectFileRouteGroups.length} 个分组、${projectFileRouteCount} 条路径，把源码、生成目标和 .nova 本地状态映射到项目文件夹。`,
    },
    {
      id: "project-save-plan",
      title: "项目保存计划",
      severity: s.projectSavePlanSteps.length === 3 && s.projectSavePlanSteps.every((step: any) => step.itemCount > 0) ? "pass" : "warning",
      detail: `${s.projectSavePlanSteps.length} 个阶段按源码、生成目标和 .nova 元数据拆分保存路径；当前 ${s.projectSavePlanSteps.reduce((total: any, step: any) => total + step.pendingCount, 0)} 项待同步。`,
    },
    {
      id: "project-folder-health",
      title: "项目文件夹健康",
      severity: projectFolderHealthReady ? "pass" : "fail",
      detail: `${s.projectFolderHealthItems.length} 个边界展示项目根、源码、生成物和 .nova 状态；${s.projectFolderHealthItems
        .map((item: any) => `${item.title}:${item.metric}`)
        .join("、")}。`,
    },
    {
      id: "project-ownership-matrix",
      title: "项目职责矩阵",
      severity: projectOwnershipMatrixReady ? "pass" : "fail",
      detail: `${s.projectOwnershipMatrixItems.length} 个项目边界把源码、生成物和 .nova 本地状态的负责人、保存策略和主路径动作拆开展示。`,
    },
    {
      id: "project-topology",
      title: "项目拓扑总览",
      severity: s.projectTopologyNodes.length >= 6 ? "pass" : "warning",
      detail: `Project 模式首屏展示 ${s.projectTopologyNodes.length} 个结构节点，把 manifest、UI、Rust、生成 app、.nova 和运行证据串成可点击工程关系图。`,
    },
    {
      id: "project-source-overview",
      title: "项目源文件总览",
      severity:
        s.projectSourceOverviewRows.some((row: any) => row.scope === "source") &&
        s.projectSourceOverviewRows.some((row: any) => row.scope === "metadata") &&
        s.projectSourceOverviewRows.some((row: any) => row.id === "generated-app-overview")
          ? "pass"
          : "warning",
      detail: `${s.projectSourceOverviewRows.length} 个来源行集中展示 UI 文件、Rust、后端、资源、发布设置、.nova 状态和生成目标，其中 ${s.projectSourceOverviewRows.filter((row: any) => row.status === "dirty").length} 项待同步。`,
    },
    {
      id: "project-working-set",
      title: "项目工作集",
      severity: projectWorkingSetReady ? "pass" : "warning",
      detail: `${s.projectWorkingSetItems.length} 个工作集入口集中显示当前文件、未保存来源、Rust 逻辑和构建工作区；当前 ${s.projectWorkingSetActiveItem?.label ?? "无"}，未保存 ${s.projectWorkingSetDirtyCount} 个。`,
    },
    {
      id: "project-action-center",
      title: "项目动作中心",
      severity: projectActionCenterReady ? "pass" : "warning",
      detail: `${s.projectActionCenterItems.length} 个项目动作把未保存来源、当前工作集、Rust 连接、Run Kit 下一步、最近任务和 release 目标串成可执行队列。`,
    },
    {
      id: "project-locator-search",
      title: "项目定位器搜索",
      severity: projectLocatorReady ? "pass" : "warning",
      detail: s.projectExplorerLocatorActive
        ? `当前查询 ${s.projectExplorerQuery} 返回 ${s.projectExplorerLocatorResults.length} 个可点击工程结果，支持定位或打开节点。`
        : "项目页搜索会显示可点击定位结果，覆盖 UI、Rust、生成目标和 .nova 元数据节点。",
    },
    {
      id: "project-tree-keyboard-nav",
      title: "项目树键盘导航",
      severity: projectTreeKeyboardReady ? "pass" : "warning",
      detail: projectTreeKeyboardReady
        ? `${s.visibleProjectExplorerNodes.length} 个可见工程节点支持方向键、Home/End、Enter 打开，以及 F2 重命名、Ctrl+D 复制、Delete 删除、Ctrl+N 新建 UI 文件。`
        : "项目树无可见节点时会保留键盘入口，恢复过滤后即可导航。",
    },
    {
      id: "project-tree-bulk-folding",
      title: "项目树批量展开收起",
      severity: projectTreeBulkFoldingReady ? "pass" : "warning",
      detail: `${s.projectExplorerFolderNodeIds.length} 个文件夹节点支持工具栏一键展开/收起；项目树聚焦时可用 Ctrl+Alt+←/→ 批量折叠或展开。当前已折叠 ${s.collapsedProjectExplorerNodeIds.length} 个。`,
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
      severity: s.selectedProjectExplorerNode ? "pass" : "warning",
      detail: s.selectedProjectExplorerFile
        ? `${s.selectedProjectExplorerFile.name} 的打开、重命名、复制、新建、删除和路径工具已提升到 项目 主详情区。`
        : "选中项目树节点后，Project 主详情区会集中显示打开、新建、路径复制、系统显示和同类筛选等直接操作。",
    },
    {
      id: "project-node-dossier",
      title: "项目节点工程上下文",
      severity: s.selectedProjectExplorerDossier ? "pass" : "warning",
      detail: s.selectedProjectExplorerDossier
        ? `${s.selectedProjectExplorerDossier.groupLabel} 节点使用 ${s.selectedProjectExplorerDossier.sourceOfTruth}，保存目标 ${s.selectedProjectExplorerDossier.saveTarget}，推荐 ${s.selectedProjectExplorerDossier.taskIds.length} 个工程任务。`
        : "选中项目树节点后，应显示事实来源、保存目标、相关标签、产物状态和推荐任务。",
    },
    {
      id: "project-node-impact-summary",
      title: "项目节点影响摘要",
      severity: s.selectedProjectExplorerImpactItems.length > 0 ? "pass" : "warning",
      detail: s.selectedProjectExplorerImpactItems.length > 0
        ? `${s.selectedProjectExplorerNode?.label ?? "当前节点"} 显示 ${s.selectedProjectExplorerImpactItems.length} 个影响项，覆盖同步状态、路径、打开标签、子节点和推荐工程任务。`
        : "选中项目树节点后，应显示可点击的影响摘要，用于保存、复制路径、筛选同类和运行推荐任务。",
    },
    {
      id: "project-tree-file-rename",
      title: "项目树 UI 文件重命名",
      severity: s.activeProject.files.length > 0 ? "pass" : "warning",
      detail: s.selectedProjectExplorerFile
        ? `${s.selectedProjectExplorerFile.name} 可在项目树详情中直接重命名，路径同步到 ${s.selectedProjectExplorerFile.path}。`
        : "选中任意 UI 文件节点后，可在项目树详情卡或右键菜单中重命名文件。",
    },
    {
      id: "project-file-dirty-state",
      title: "逐文件保存状态",
      severity: "pass",
      detail: s.projectSourceDirty
        ? `${s.dirtyUiFileCount} 个 UI 文件未保存，Rust ${s.rustLogicDirty ? "未保存" : "已同步"}，项目设置 ${s.projectSettingsDirty ? "未保存" : "已同步"}。`
        : "UI 文件、Rust 逻辑和项目设置都与最近一次保存同步。",
    },
    {
      id: "editor-tab-file-actions",
      title: "编辑器标签文件动作",
      severity: s.openEditorTabs.length > 0 ? "pass" : "warning",
      detail: `${s.openEditorTabs.length} 个打开标签支持定位项目树、复制完整/相对路径、关闭右侧、关闭已同步和关闭其他 UI 标签。`,
    },
    {
      id: "editor-tab-reorder",
      title: "编辑器标签拖拽重排",
      severity: s.openEditorUiTabCount > 1 ? "pass" : "warning",
      detail: `${s.openEditorUiTabCount} 个 UI 标签可通过拖拽调整打开顺序；保存项目时顺序进入 openFileIds，本地文件顺序不受影响。`,
    },
    {
      id: "project-open-files-manager",
      title: "项目打开文件管理",
      severity: s.openEditorTabs.length > 0 ? "pass" : "warning",
      detail: `${s.openEditorTabs.length} 个打开标签在项目页和项目 Dock 中集中管理，当前 ${s.activeEditorTab?.label ?? "无"}，未保存 ${s.dirtyOpenEditorTabCount} 个，可一键关闭 ${s.cleanClosableOpenEditorTabCount} 个已同步 UI 标签，或只保留当前 UI 并关闭 ${s.otherOpenEditorUiTabCount} 个其他 UI 标签。`,
    },
    {
      id: "left-run-controls",
      title: "左下角构建运行区",
      severity: "pass",
      detail: `运行目标 ${s.railWindowTargetLabel}，发布目标 ${s.railReleaseTargetLabel}，产物 ${s.railArtifactStateLabel}。`,
    },
    {
      id: "left-rail-kit-command-menu",
      title: "左侧 Kit 二级命令菜单",
      severity: "pass",
      detail: `快速检查、窗口验证、安装器打包和构建配置已收进左侧 Kit 菜单；当前队列 ${s.railQueueSummaryLabel}。`,
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
      severity: s.selectedRailActionPreset && s.allProjectActionPresets.length > 0 ? "pass" : "warning",
      detail: s.selectedRailActionPreset
        ? `${s.selectedRailActionPreset.title} 包含 ${s.selectedRailActionPreset.actions.length} 个流水线步骤，可从左下角直接运行。`
        : "左下角运行区需要可选择设计预检、发布 exe、安装包和自定义流水线。",
    },
    {
      id: "left-rail-kit-plan",
      title: "左侧 Kit 运行计划",
      severity: s.selectedRailKitPlanStats.total > 0 ? "pass" : "warning",
      detail: s.selectedRailKitPlanStats.nextStep
        ? `${s.selectedRailActionPreset?.title ?? "当前 Kit"}：${s.selectedRailKitPlanStats.summary}，下一步 ${s.selectedRailKitPlanStats.nextStep.index + 1} 是 ${s.selectedRailKitPlanStats.nextStep.title}。`
        : "左侧 Kit 需要显示当前 preset 的步骤进度、下一步和失败/等待状态。",
    },
    {
      id: "compact-topbar",
      title: "顶部工具栏收敛",
      severity: s.modeBarItems.length === 4 ? "pass" : "warning",
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
      detail: "左下 Run Kit 是唯一主运行入口；顶部 chip 可直接聚焦 Run Kit，标题栏 构建 菜单作为备用菜单路径，Build 页只做配置、审计和检查。",
    },
    {
      id: "compact-locator",
      title: "顶部定位器默认收起",
      severity: "pass",
      detail: s.projectLocatorInputVisible
        ? "项目定位器正在展开输入；失焦且无查询时会恢复为单个搜索按钮。"
        : "项目定位器默认只占一个图标按钮，Ctrl+P / Ctrl+K、点击按钮或输入查询时才展开。",
    },
    {
      id: "output-dock-minimized-peek",
      title: "底部 输出面板 最小化摘要",
      severity: "pass",
      detail: `最小化时仍显示 ${s.feedbackIssueCount} 个问题、${s.queuedProjectTaskCount} 个排队任务和 ${s.feedbackSummaryToneLabel} 状态，避免展开面板才知道日志/问题变化。`,
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
      detail: `画布右键菜单按 ${canvasContextQuickInsertGroupCount} 组提供 ${s.canvasContextQuickInsertTypes.length} 个常用控件，可直接插入到右键画布坐标。`,
    },
    {
      id: "canvas-context-insert-search",
      title: "右键全量控件搜索插入",
      severity: canvasContextInsertSearchReady ? "pass" : "warning",
      detail: `右键菜单可搜索完整 ${s.palette.length} 个控件库，最多显示 ${CANVAS_CONTEXT_INSERT_SEARCH_LIMIT} 个匹配结果，支持方向键选择并用 Enter 插入到右键坐标。`,
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
      severity: s.selectedItem ? (s.selectedQuickTextProps.length > 0 ? "pass" : "warning") : textEditableControlCount > 0 ? "pass" : "warning",
      detail: s.selectedItem
        ? `${getItemSummary(s.selectedItem)} 当前有 ${s.selectedQuickTextProps.length} 个文本字段可从常驻选择栏直接进入快编。`
        : "选择栏的“文本”按钮会展开字段菜单，显示可编辑字段和当前值，和右键菜单保持一致。",
    },
    {
      id: "object-name-editor",
      title: "对象名编辑",
      severity: s.selectedItem ? (s.selectedItem.name.trim() ? "pass" : "warning") : "pass",
      detail: s.selectedItem
        ? `${s.selectedItem.name || "未命名对象"} 可通过属性面板、选择栏、右键菜单或 Ctrl+F2 编辑工程对象名。`
        : "选中控件后可编辑工程对象名，服务对象树、构建诊断、事件连接和维护日志。",
    },
    {
      id: "preview-export-removed",
      title: "去除重复预览/导出模式",
      severity: !s.projectActionOptionIds.some((actionId: any) => actionId.includes("export")) ? "pass" : "warning",
      detail: "项目保存、生成文件和运行 exe 已取代独立导出/预览流。",
    },
    {
      id: "desktop-runtime-workbench",
      title: "桌面运行工作台",
      severity: s.workflowRuntimeActive || s.activeProject.outputExePath || s.latestValidationRun ? "pass" : "warning",
      detail: s.latestValidationRun
        ? `${s.desktopRuntimeStatusLabel}；最近窗口验证 ${s.latestValidationRun.status} · ${s.latestValidationRun.score}%。`
        : `${s.desktopRuntimeStatusLabel}；Build 页首屏提供构建、运行、停止、验证和运行控制台入口。`,
    },
    {
      id: "component-palette-kits",
      title: "控件套件入口",
      severity: componentPaletteKitsReady ? "pass" : "warning",
      detail: `${s.componentPaletteKitDefinitions.length} 个控件套件把 MD3 应用壳、Qt 主窗口、数据工作台、设置表单和调试面板组织成可聚焦、可插入的工作流入口。`,
    },
    {
      id: "component-palette-kit-scaffold",
      title: "控件套件骨架插入",
      severity: componentPaletteKitScaffoldReady ? "pass" : "warning",
      detail: `套件可一次性批量插入 ${s.componentPaletteKitRows.reduce((total: any, row: any) => total + row.availableCount, 0)} 个可用控件，插入后会形成多选集继续对齐、分布或成组。`,
    },
    {
      id: "component-palette-collections",
      title: "控件工具箱常用与最近使用",
      severity: s.componentPaletteFavoriteTypes.length > 0 && s.componentPaletteRecentTypes.length > 0 ? "pass" : "warning",
      detail: `${s.componentPaletteFavoriteTypes.length} 个收藏控件，${s.componentPaletteRecentTypes.length} 个最近使用控件；插入控件后会自动更新最近使用区。`,
    },
    {
      id: "component-coverage",
      title: "MD3 与桌面控件覆盖",
      severity: s.palette.length >= 90 ? "pass" : "warning",
      detail: `当前 palette ${s.palette.length} 个控件，覆盖脚本验证类型、预览和 runtime 分支一致。`,
    },
    {
      id: "md3-application-components",
      title: "应用级 MD3 控件补齐",
      severity: md3ApplicationComponentsReady ? "pass" : "fail",
      detail: `${s.md3ApplicationComponentTypes.length} 个应用级控件覆盖顶部/底部应用栏、导航栏/抽屉/侧栏、side/bottom sheet、状态栏、搜索、chip、卡片、FAB、反馈和数据视图，均进入类型、组件工具箱、画布预览与生成 runtime。`,
    },
  ];
}
