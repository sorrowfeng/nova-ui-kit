// Editor-experience audit: 选择操作栏、画布与标尺、多选与手柄、运行时状态、输出坞、窗体外壳。
//
// One of four domain slices of editor-experience-audit.ts (phase 3 of
// docs/monolith-decomposition.md). Pure data: no refs, no effects, no DOM.
// The seam is derived — every flag below is read by this slice alone.
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  EDITOR_EXPERIENCE_KNOWN_TITLEBAR_STYLES,
  EDITOR_EXPERIENCE_KNOWN_WINDOW_KINDS,
  SMART_GUIDE_SAFE_MARGIN,
  SMART_GUIDE_THRESHOLD,
  frameLayoutLabel,
  frameLayoutValues,
  getItemSummary,
  type EditorExperienceAuditItem,
} from "./monolith-module";
import { getDefinition } from "./component-palette";

/** Percent label for a canvas zoom factor. Shared with the shell chrome. */
export function formatCanvasZoom(zoom: number): string {
  return `${Math.round(zoom * 100)}%`;
}
export function buildSurfaceAuditItems(s: Record<string, any>): EditorExperienceAuditItem[] {
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
  ];
}
