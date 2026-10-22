// Editor-experience audit: 左侧栏与构建运行、紧凑顶栏与定位器、内联编辑、右键菜单、对象命名、预览导出、控件套件与 MD3 应用级控件。
//
// One of four domain slices of editor-experience-audit.ts (phase 3 of
// docs/monolith-decomposition.md). Pure data: no refs, no effects, no DOM.
// The seam is derived — every flag below is read by this slice alone.
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  CANVAS_CONTEXT_INSERT_SEARCH_LIMIT,
  getItemSummary,
  quickTextPropsForItem,
  type EditorExperienceAuditItem,
} from "./monolith-module";


export function buildChromeAuditItems(s: Record<string, any>): EditorExperienceAuditItem[] {
  const textEditableControlCount = s.items.filter((item: any) => quickTextPropsForItem(item).length > 0).length;
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
