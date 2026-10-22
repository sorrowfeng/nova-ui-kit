// Editor-experience audit: 项目树与 .nova 元数据、文件路由、保存计划、文件夹健康、归属矩阵、工作集、行动中心、编辑器标签页。
//
// One of four domain slices of editor-experience-audit.ts (phase 3 of
// docs/monolith-decomposition.md). Pure data: no refs, no effects, no DOM.
// The seam is derived — every flag below is read by this slice alone.
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  projectExplorerNodeGroupId,
  projectExplorerNodeMatchesSearch,
  type EditorExperienceAuditItem,
} from "./monolith-module";


export function buildProjectAuditItems(s: Record<string, any>): EditorExperienceAuditItem[] {
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
  return [
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
      severity: s.projectSavePlanSteps.length === 3 && s.projectSavePlanSteps.every((step: any) => step.itemCount > 0) ? "pass" : "unverified",
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
      severity: s.projectTopologyNodes.length >= 6 ? "pass" : "unverified",
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
      severity: s.selectedProjectExplorerNode ? "pass" : "unverified",
      detail: s.selectedProjectExplorerFile
        ? `${s.selectedProjectExplorerFile.name} 的打开、重命名、复制、新建、删除和路径工具已提升到 项目 主详情区。`
        : "选中项目树节点后，Project 主详情区会集中显示打开、新建、路径复制、系统显示和同类筛选等直接操作。",
    },
    {
      id: "project-node-dossier",
      title: "项目节点工程上下文",
      severity: s.selectedProjectExplorerDossier ? "pass" : "unverified",
      detail: s.selectedProjectExplorerDossier
        ? `${s.selectedProjectExplorerDossier.groupLabel} 节点使用 ${s.selectedProjectExplorerDossier.sourceOfTruth}，保存目标 ${s.selectedProjectExplorerDossier.saveTarget}，推荐 ${s.selectedProjectExplorerDossier.taskIds.length} 个工程任务。`
        : "选中项目树节点后，应显示事实来源、保存目标、相关标签、产物状态和推荐任务。",
    },
    {
      id: "project-node-impact-summary",
      title: "项目节点影响摘要",
      severity: s.selectedProjectExplorerImpactItems.length > 0 ? "pass" : "unverified",
      detail: s.selectedProjectExplorerImpactItems.length > 0
        ? `${s.selectedProjectExplorerNode?.label ?? "当前节点"} 显示 ${s.selectedProjectExplorerImpactItems.length} 个影响项，覆盖同步状态、路径、打开标签、子节点和推荐工程任务。`
        : "选中项目树节点后，应显示可点击的影响摘要，用于保存、复制路径、筛选同类和运行推荐任务。",
    },
    {
      id: "project-tree-file-rename",
      title: "项目树 UI 文件重命名",
      severity: s.activeProject.files.length > 0 ? "pass" : "unverified",
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
      severity: s.openEditorTabs.length > 0 ? "pass" : "unverified",
      detail: `${s.openEditorTabs.length} 个打开标签支持定位项目树、复制完整/相对路径、关闭右侧、关闭已同步和关闭其他 UI 标签。`,
    },
    {
      id: "editor-tab-reorder",
      title: "编辑器标签拖拽重排",
      severity: s.openEditorUiTabCount > 1 ? "pass" : "unverified",
      detail: `${s.openEditorUiTabCount} 个 UI 标签可通过拖拽调整打开顺序；保存项目时顺序进入 openFileIds，本地文件顺序不受影响。`,
    },
    {
      id: "project-open-files-manager",
      title: "项目打开文件管理",
      severity: s.openEditorTabs.length > 0 ? "pass" : "unverified",
      detail: `${s.openEditorTabs.length} 个打开标签在项目页和项目 Dock 中集中管理，当前 ${s.activeEditorTab?.label ?? "无"}，未保存 ${s.dirtyOpenEditorTabCount} 个，可一键关闭 ${s.cleanClosableOpenEditorTabCount} 个已同步 UI 标签，或只保留当前 UI 并关闭 ${s.otherOpenEditorUiTabCount} 个其他 UI 标签。`,
    },
  ];
}
