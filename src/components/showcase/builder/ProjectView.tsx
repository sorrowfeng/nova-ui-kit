/* eslint-disable @typescript-eslint/no-explicit-any */
// Extracted from BuilderShowcase.tsx (P2-9): the "project" workspace view.
// BuilderShowcase still owns the state; this module only renders it.

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Braces, ChevronDown, ChevronRight, ClipboardCopy, Columns3, Copy, Download, Eye, FileImage, FileJson, FileText, FolderOpen, FolderSearch, Layers, ListChecks, Menu, MousePointer2, Play, Plus, Save, Search, TextCursorInput, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  SignalChip,
  CountReadout,
  StateBadge,
  StateLabel,
  isQuietCount,
  isQuietStateLabel,
  isReadoutStateLabel,
  isSignalStateLabel,
} from "./view-helpers";
import { projectSourceScopeLabel } from "./project-source-models";
import { projectExplorerBadgeLabel } from "./monolith-module";

export type ProjectViewScope = Record<string, any>;

export function ProjectView(props: { scope: ProjectViewScope }): ReactNode {
  const scope = props.scope ?? {};
  const {
    Field,
    PathRow,
    SelectedProjectExplorerIcon,
    activeEditorTab,
    activeEditorTabId,
    activeFile,
    activeProject,
    activeProjectSavePlanStep,
    chooseProjectDirectory,
    cleanClosableOpenEditorTabCount,
    closeCleanEditorFileTabs,
    closeEditorFileTab,
    closeOtherEditorFileTabs,
    cn,
    collapseProjectExplorerTree,
    collapsedProjectExplorerNodeIds,
    collapsedProjectExplorerNodeSet,
    copiedArtifactPath,
    copyArtifactPath,
    createDiskCheckpoint,
    createNewFileFromNavigator,
    dirtyOpenEditorTabCount,
    dirtyUiFileCount,
    diskBusy,
    diskCheckpoints,
    enqueueProjectTask,
    expandProjectExplorerTree,
    fileNameFromPath,
    focusProjectSourceOverviewRow,
    focusProjectWorkingSetItem,
    handleProjectExplorerNode,
    handleProjectExplorerTreeKeyDown,
    isTauriRuntime,
    latestFailedProjectTask,
    missingRustSlotCount,
    mode,
    normalizeReleaseVersion,
    openEditorTab,
    openEditorTabCountLabel,
    openEditorTabs,
    openLocalArtifact,
    openProjectExplorerContextMenu,
    openProjectFolderHealthItem,
    openProjectSavePlanStep,
    openProjectSourceOverviewRow,
    openProjectWorkingSetItem,
    otherOpenEditorUiTabCount,
    projectActionCenterBadgeVariant,
    projectActionCenterItems,
    projectActionCenterToneClass,
    projectDiskPath,
    projectExplorerActionLabel,
    projectExplorerFilter,
    projectExplorerFilterCounts,
    projectExplorerFilterOptions,
    projectExplorerFolderNodeIds,
    projectExplorerGroupMeta,
    projectExplorerLocatorActive,
    projectExplorerLocatorResults,
    projectExplorerModel,
    projectExplorerNodeGroupId,
    projectExplorerNodeStatus,
    projectExplorerPrimaryActionLabel,
    projectExplorerQuery,
    projectExplorerRenameInputRef,
    projectExplorerStatusClass,
    projectFileRouteGroups,
    projectFolderHealthItems,
    projectOwnershipMatrixItems,
    projectSaveManifestItems,
    projectSavePlanSteps,
    projectSettingsDirty,
    projectSourceDirty,
    projectSourceOverviewBadgeVariant,
    projectSourceOverviewRows,
    projectTaskDefinitions,
    projectTopologyNodes,
    projectWorkingSetActiveItem,
    projectWorkingSetDirtyCount,
    projectWorkingSetItems,
    projectWorkingSetSummary,
    renameFileById,
    revealEditorTabInProject,
    runProjectActionCenterItem,
    runProjectExplorerContextAction,
    runSelectedProjectExplorerImpactAction,
    runningProjectTask,
    rustLogicDirty,
    saved,
    selectedProjectExplorerChildNodes,
    selectedProjectExplorerDisplayPath,
    selectedProjectExplorerDossier,
    selectedProjectExplorerFile,
    selectedProjectExplorerFileSaveState,
    selectedProjectExplorerImpactItems,
    selectedProjectExplorerNode,
    selectedProjectExplorerParentNode,
    selectedProjectExplorerPathNodes,
    selectedProjectExplorerRelativePath,
    selectedRailActionPreset,
    selectedRailKitPlanStats,
    setLeftDockTab,
    setProjectExplorerFilter,
    setProjectExplorerQuery,
    setSelectedProjectExplorerNodeId,
    switchEditorMode,
    toggleProjectExplorerNode,
    visibleProjectExplorerNodes,
    visibleProjectExplorerRows,
  } = scope;

  return (
            <div
              className="h-full min-h-0 overflow-hidden px-2 pt-2 pb-11"
              data-builder-project-workspace=""
              data-builder-project-workspace-bottom-dock-clearance="reserved"
              data-builder-project-workspace-chrome="low-chrome-docks"
            >
              <div className="subtle-scrollbar h-full min-h-0 overflow-y-auto" data-builder-project-workspace-scroll="contained">
              <div className="mx-auto flex max-w-[1480px] flex-col gap-2">
                <section
                  className="rounded-lg border border-outline-variant bg-surface-container-low/70 px-2 py-1"
                  data-builder-project-workspace-header=""
                  data-builder-project-workspace-header-density="single-row-dock"
                >
                  <div className="flex min-h-8 items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary-container text-secondary-container-foreground">
                          <FolderOpen aria-hidden className="size-3.5" />
                        </span>
                        <div className="flex min-w-0 items-center gap-1.5">
                          <h2 className="shrink-0 truncate text-xs font-semibold text-on-surface">{activeProject.name || "Nova 项目"}</h2>
                          <span className="hidden text-[0.64rem] text-on-surface-variant md:inline">·</span>
                          <p className="hidden min-w-0 truncate text-[0.64rem] text-on-surface-variant md:block">
                            {activeProject.rootPath || "保存后会写入 Documents/Nova UI Projects"}
                          </p>
                        </div>
                      </div>
                      <div
                        className="hidden min-w-0 items-center gap-1.5 text-[0.64rem] lg:flex"
                        data-builder-project-workspace-header-meta="single-inline"
                      >
                        <StateBadge signal={!activeProject.rootPath} variant={activeProject.rootPath ? "secondary" : "outline"} label={activeProject.rootPath ? "已落盘" : "未保存"} />
                        <StateBadge
                          signal={projectSourceDirty}
                          variant={projectSourceDirty ? "outline" : "secondary"}
                          data-builder-project-save-state-summary=""
                          title={`UI ${dirtyUiFileCount} 个未保存 · Rust ${rustLogicDirty ? "未保存" : "已同步"} · 设置 ${projectSettingsDirty ? "未保存" : "已同步"}`}
                          label={projectSourceDirty ? `未保存 ${dirtyUiFileCount + (rustLogicDirty ? 1 : 0) + (projectSettingsDirty ? 1 : 0)}` : "来源已同步"}
                        />
                        <span className="max-w-[18rem] truncate text-[0.68rem] text-on-surface-variant">{projectExplorerModel.summary}</span>
                      </div>
                    </div>
                    <div className="flex min-w-0 shrink-0 items-center justify-end gap-1" data-builder-project-workspace-header-actions="single-row-toolbar">
                      <Button size="sm" variant="secondary" className="h-7 px-2.5 text-[0.68rem]" data-builder-project-workspace-save="" onClick={() => enqueueProjectTask("save-project")} loading={diskBusy || runningProjectTask?.actionId === "save-project"}>
                        <Save aria-hidden className="size-3.5" />
                        保存同步
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="size-7"
                            aria-label="打开项目操作菜单"
                            data-builder-project-workspace-header-overflow-trigger=""
                          >
                            <Menu aria-hidden className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64" data-builder-project-workspace-header-overflow-menu="">
                          <DropdownMenuLabel>项目操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem data-builder-project-workspace-open="" disabled={!isTauriRuntime()} onSelect={() => void chooseProjectDirectory()}>
                            <FolderOpen aria-hidden className="mr-2 size-4" />
                            打开目录
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            data-builder-project-workspace-root=""
                            disabled={!activeProject.rootPath || !isTauriRuntime()}
                            onSelect={() => void openLocalArtifact(activeProject.rootPath ?? "")}
                          >
                            <FolderOpen aria-hidden className="mr-2 size-4" />
                            资源管理器
                          </DropdownMenuItem>
                          <DropdownMenuItem data-builder-project-workspace-checkpoint="" disabled={!isTauriRuntime()} onSelect={() => void createDiskCheckpoint()}>
                            <Save aria-hidden className="mr-2 size-4" />
                            创建检查点
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled>
                            Release {normalizeReleaseVersion(activeProject.releaseConfig.version)}
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            {missingRustSlotCount > 0 ? `${missingRustSlotCount} 个 Rust 槽待生成` : "Rust 已同步"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </section>

                <details
                  className="group rounded-xl border border-outline-variant bg-surface-container-low/80 px-2 py-1"
                  data-builder-project-secondary-details=""
                  data-builder-project-secondary-details-density="compact-toggle-strip"
                >
                  <summary
                    className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1.5 py-1 text-xs font-medium text-on-surface transition hover:bg-surface-container-high"
                    data-builder-project-secondary-summary-density="single-row"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Layers aria-hidden className="size-3.5 shrink-0 text-primary" />
                      <span className="truncate">工程概览</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-[0.68rem] font-normal text-on-surface-variant">
                      <span>{projectTopologyNodes.length} 拓扑</span>
                      <span>{projectSourceOverviewRows.length} 来源</span>
                      <ChevronDown aria-hidden className="size-3.5 transition-transform group-open:rotate-180" />
                    </span>
                  </summary>
                  <div className="mt-3 grid gap-3 2xl:grid-cols-2" data-builder-project-secondary-grid="">
                <section
                  className="rounded-[24px] border border-outline-variant bg-surface-container p-4 shadow-m3-1"
                  data-builder-project-topology=""
                  data-builder-project-topology-count={projectTopologyNodes.length}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-surface-container-highest text-primary">
                          <Layers aria-hidden className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-on-surface">项目拓扑</h3>
                          <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                            从项目 manifest 到 UI、Rust、生成 app、.nova 和运行证据，展示这个桌面项目的真实文件边界。
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Cards already name their domain, so a scope colour key
                        would explain a distinction the eye cannot see. */}
                    <div className="sr-only" data-builder-project-topology-legend="">
                      项目范围分为 source（源码）、generated（生成目标）与 .nova（本地元数据）。
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-3 2xl:grid-cols-6">
                    {projectTopologyNodes.map((node: any, index: any) => {
                      const NodeIcon = node.icon;
                      return (
                        <button
                          key={node.id}
                          type="button"
                          className={cn(
                            "focus-ring group relative grid min-h-[8.25rem] min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] rounded-[20px] border px-3 py-3 text-left text-xs transition hover:-translate-y-0.5 hover:shadow-m3-1",
                            node.status === "ready" && "border-outline-variant bg-surface-container-low hover:border-primary/35",
                            node.status === "warning" && "border-destructive/30 bg-destructive/10 hover:border-destructive/50",
                            node.status === "pending" && "border-outline-variant bg-surface-container-high text-on-surface-variant hover:border-outline",
                          )}
                          data-builder-project-topology-node={node.id}
                          data-builder-project-topology-node-scope={node.scope}
                          data-builder-project-topology-node-status={node.status}
                          title={node.path}
                          onClick={() => {
                            setProjectExplorerFilter(node.filter);
                            setProjectExplorerQuery(node.query);
                            setSelectedProjectExplorerNodeId(node.nodeId);
                          }}
                        >
                          <span className="flex min-w-0 items-center justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest text-primary">
                                <NodeIcon aria-hidden className="size-4" />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-medium text-on-surface">{node.title}</span>
                                <span className="mt-0.5 block truncate font-mono text-[0.62rem] text-on-surface-variant">{node.metric}</span>
                              </span>
                            </span>
                            <span
                              className={cn(
                                "size-2 shrink-0 rounded-full",
                                node.status === "ready" && "bg-primary",
                                node.status === "warning" && "bg-destructive",
                                node.status === "pending" && "bg-outline",
                              )}
                            />
                          </span>
                          <span className="mt-2 min-w-0">
                            <span className="line-clamp-2 leading-5 text-on-surface-variant">{node.detail}</span>
                            <span className="mt-1 block truncate font-mono text-[0.62rem] text-on-surface-variant" data-builder-project-topology-path="">
                              {node.path}
                            </span>
                          </span>
                          <span className="mt-3 flex min-w-0 items-center justify-between gap-2">
                            {/* Scope is already on the card title and icon; the
                                chip only repeated it on all six cards. */}
                            <span className="sr-only">{projectSourceScopeLabel(node.scope)}</span>
                            <span className="inline-flex min-w-0 items-center gap-1 text-primary">
                              <span className="truncate">{node.actionLabel}</span>
                              <ArrowRight aria-hidden className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </span>
                          </span>
                          {index < projectTopologyNodes.length - 1 ? (
                            <span
                              aria-hidden
                              className="pointer-events-none absolute -right-2 top-1/2 hidden size-4 -translate-y-1/2 items-center justify-center rounded-full border border-outline-variant bg-surface-container text-on-surface-variant 2xl:flex"
                              data-builder-project-topology-edge={`${node.id}->${projectTopologyNodes[index + 1].id}`}
                            >
                              <ChevronRight aria-hidden className="size-3" />
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section
                  className="rounded-lg border border-outline-variant bg-surface-container-low px-2 py-2"
                  data-builder-project-source-overview=""
                  data-builder-project-source-overview-count={projectSourceOverviewRows.length}
                  data-builder-project-source-overview-density="compact-table"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-primary">
                          <FileText aria-hidden className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-on-surface">项目源文件总览</h3>
                          <p className="sr-only">
                            像桌面 IDE 一样集中查看 UI 文件、Rust 逻辑、后端集成、资源、发布配置和 `.nova` 本地状态，不再只依赖窄侧栏。
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[0.68rem]" data-builder-project-source-overview-summary="">
                      {/* Tallies are readouts — visible when non-zero, not painted
                          as pills and not hidden while they still mean something. */}
                      <CountReadout
                        label={`${projectSourceOverviewRows.filter((row: any) => row.scope === "source").length} 源码`}
                        count={projectSourceOverviewRows.filter((row: any) => row.scope === "source").length}
                      />
                      <CountReadout
                        label={`${projectSourceOverviewRows.filter((row: any) => row.scope === "metadata").length} .nova`}
                        count={projectSourceOverviewRows.filter((row: any) => row.scope === "metadata").length}
                      />
                      <StateBadge
                        label={`${projectSourceOverviewRows.filter((row: any) => row.status === "dirty").length} 未保存`}
                        signal={projectSourceOverviewRows.some((row: any) => row.status === "dirty")}
                        variant="secondary"
                      />
                      <StateBadge
                        label={activeProject.outputExePath ? "exe 就绪" : "待构建"}
                        signal={!activeProject.outputExePath}
                        variant={activeProject.outputExePath ? "accent" : "outline"}
                      />
                    </div>
                  </div>

                  <div
                    className="mt-2 overflow-hidden rounded-md border border-outline-variant bg-surface-container"
                    data-builder-project-source-overview-table=""
                    data-builder-project-source-overview-table-density="compact-rows"
                  >
                    <div className="grid h-7 grid-cols-[minmax(0,1.35fr)_7rem_minmax(0,1.1fr)_4.75rem] items-center gap-2 border-b border-outline-variant bg-surface-container-high px-2 text-[0.62rem] font-medium text-on-surface-variant max-lg:hidden">
                      <span>来源</span>
                      <span>状态</span>
                      <span>路径</span>
                      <span className="text-right">动作</span>
                    </div>
                    <div className="divide-y divide-outline-variant">
                      {projectSourceOverviewRows.map((row: any) => {
                        const RowIcon = row.icon;
                        return (
                          <article
                            key={row.id}
                            className="grid min-h-10 gap-2 px-2 py-1 text-xs lg:grid-cols-[minmax(0,1.35fr)_7rem_minmax(0,1.1fr)_4.75rem] lg:items-center"
                            data-builder-project-source-overview-row={row.id}
                            data-builder-project-source-overview-row-density="compact-row"
                            data-builder-project-source-overview-scope={row.scope}
                            data-builder-project-source-overview-status={row.status}
                            data-builder-project-source-overview-metadata={row.scope === "metadata" ? "true" : undefined}
                          >
                            <button
                              type="button"
                              className="focus-ring grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-md px-1 py-1 text-left transition hover:bg-surface-container-high lg:-ml-1"
                              data-builder-project-source-overview-focus-density="flat-cell"
                              data-builder-project-source-overview-focus={row.nodeId}
                              title={row.detail}
                              onClick={() => focusProjectSourceOverviewRow(row)}
                            >
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-primary">
                                <RowIcon aria-hidden className="size-3.5" />
                              </span>
                              <span className="min-w-0">
                                <span className="flex min-w-0 items-center gap-1.5">
                                  <span className="truncate font-semibold text-on-surface">{row.title}</span>
                                  {/* A category is a table column value, not a
                                      status token. Pill-shaped, it read as
                                      something to act on. */}
                                  <span className="shrink-0 truncate text-[0.58rem] text-on-surface-variant">
                                    {row.kind}
                                  </span>
                                </span>
                                <span className="sr-only">{row.detail}</span>
                              </span>
                            </button>
                            <div className="flex min-w-0 items-center gap-1.5">
                              {isReadoutStateLabel(row.statusLabel) ? (
                                /* A version or a tally is a value, not a state. */
                                <span
                                  className="shrink-0 truncate font-mono text-[0.66rem] text-on-surface"
                                  data-builder-project-source-overview-state={row.status}
                                >
                                  {row.statusLabel}
                                </span>
                              ) : (
                                <StateBadge
                                  label={row.statusLabel}
                                  signal={isSignalStateLabel(row.statusLabel)}
                                  variant={projectSourceOverviewBadgeVariant(row.status)}
                                  className="shrink-0"
                                  data-builder-project-source-overview-state={row.status}
                                />
                              )}
                              <span className="truncate text-[0.66rem] text-on-surface-variant">{projectSourceScopeLabel(row.scope)}</span>
                            </div>
                            <div
                              className="min-w-0 px-1 py-1"
                              data-builder-project-source-overview-path=""
                              data-builder-project-source-overview-path-density="single-line"
                              title={row.path}
                            >
                              <span className="block truncate font-mono text-[0.68rem] text-on-surface">{row.relativePath}</span>
                              <span className="sr-only">{row.path}</span>
                            </div>
                            <div className="flex shrink-0 items-center justify-end gap-1" data-builder-project-source-overview-actions-density="icon-strip">
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                className="size-7 rounded-md"
                                aria-label={`复制 ${row.title} 的路径`}
                                title="复制路径"
                                data-builder-project-source-overview-copy={row.id}
                                onClick={() => void copyArtifactPath(row.path)}
                              >
                                <ClipboardCopy aria-hidden className="size-4" />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="secondary"
                                className="size-7 rounded-md"
                                aria-label={`打开 ${row.title}`}
                                title={row.actionLabel}
                                data-builder-project-source-overview-open={row.id}
                                onClick={() => openProjectSourceOverviewRow(row)}
                              >
                                <ArrowRight aria-hidden className="size-3.5" />
                              </Button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <section
                  className="rounded-[18px] border border-outline-variant bg-surface-container p-3 shadow-m3-1"
                  data-builder-project-folder-health=""
                  data-builder-project-folder-health-density="compact-table"
                  data-builder-project-folder-health-count={projectFolderHealthItems.length}
                  data-builder-project-folder-health-root={activeProject.rootPath ? "connected" : "missing"}
                >
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
                        <FolderOpen aria-hidden className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-on-surface">项目文件夹健康</h3>
                        <p className="truncate text-xs text-on-surface-variant">根目录、源码、生成输出和 .nova 本地状态</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1.5 text-[0.68rem]" data-builder-project-folder-health-summary="inline-status">
                      <StateBadge
                        label={activeProject.rootPath ? "已连接" : "待保存"}
                        signal={!activeProject.rootPath}
                        variant={activeProject.rootPath ? "secondary" : "outline"}
                        data-builder-project-folder-health-root-state=""
                      />
                      <StateBadge
                        label={projectSourceDirty ? "待同步" : "已同步"}
                        signal={Boolean(projectSourceDirty)}
                        variant={projectSourceDirty ? "destructive" : "secondary"}
                      />
                      <CountReadout label={`${projectSaveManifestItems.length} 项`} count={projectSaveManifestItems.length} />
                    </div>
                  </div>
                  <div
                    className="mt-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low"
                    data-builder-project-folder-health-list=""
                    data-builder-project-folder-health-list-density="compact-rows"
                  >
                    <div className="grid grid-cols-[minmax(8rem,0.9fr)_minmax(0,1.4fr)_minmax(7rem,0.9fr)_auto] gap-2 border-b border-outline-variant bg-surface-container-high px-2.5 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant max-lg:hidden">
                      <span>边界</span>
                      <span>状态</span>
                      <span>路径</span>
                      <span className="text-right">打开</span>
                    </div>
                    {projectFolderHealthItems.map((item: any) => {
                      const ItemIcon = item.icon;
                      return (
                        <article
                          key={item.id}
                          className={cn(
                            "grid min-h-11 min-w-0 items-center gap-2 border-b border-outline-variant/70 px-2.5 py-1.5 text-xs last:border-b-0 lg:grid-cols-[minmax(8rem,0.9fr)_minmax(0,1.4fr)_minmax(7rem,0.9fr)_auto]",
                            item.state === "warning"
                              ? "bg-destructive/8"
                              : item.state === "pending"
                                ? "bg-surface-container"
                                : "bg-surface-container-low",
                          )}
                          data-builder-project-folder-health-row={item.id}
                          data-builder-project-folder-health-row-density="compact-row"
                          data-builder-project-folder-health-state={item.state}
                          data-builder-project-folder-health-route-group={item.routeGroupId ?? "none"}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                              <ItemIcon aria-hidden className="size-3.5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-on-surface">{item.title}</span>
                              <span className="block truncate text-[0.66rem] leading-3 text-on-surface-variant">{item.metric}</span>
                            </span>
                          </div>
                          <p className="min-w-0 truncate text-on-surface-variant">{item.detail}</p>
                          <p
                            className="min-w-0 truncate font-mono text-[0.66rem] text-on-surface-variant"
                            data-builder-project-folder-health-path=""
                            data-builder-project-folder-health-path-density="single-line"
                            title={item.path}
                          >
                            {item.path}
                          </p>
                          <Button
                            size="icon-sm"
                            variant={item.state === "warning" ? "secondary" : "ghost"}
                            className="size-7 justify-self-end rounded-md"
                            aria-label={`${item.actionLabel} ${item.title}`}
                            title={item.actionLabel}
                            data-builder-project-folder-health-open={item.id}
                            onClick={() => openProjectFolderHealthItem(item)}
                          >
                            <ArrowRight aria-hidden className="size-3.5" />
                          </Button>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section
                  className="rounded-[24px] border border-outline-variant bg-surface-container p-4 shadow-m3-1"
                  data-builder-project-action-center=""
                  data-builder-project-action-center-count={projectActionCenterItems.length}
                  data-builder-project-action-center-run-kit={selectedRailActionPreset?.id ?? ""}
                  data-builder-project-action-center-next-step={selectedRailKitPlanStats.nextStep?.actionId ?? "none"}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-surface-container-highest text-primary">
                          <ListChecks aria-hidden className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-on-surface">项目动作中心</h3>
                          <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                            把当前文件、未保存来源、Rust 连接、Run Kit 下一步和最近任务收成一个可执行队列，减少在文件树、逻辑页和构建页之间来回找入口。
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[0.68rem]" data-builder-project-action-center-summary="">
                      <StateBadge
                        label={projectSourceDirty ? "有未保存来源" : "来源已同步"}
                        signal={Boolean(projectSourceDirty)}
                        variant={projectSourceDirty ? "outline" : "secondary"}
                      />
                      {/* A kit progress tally is a readout; only a failed step
                          needs to reach for the eye. */
                      }
                      <CountReadout
                        label={`Kit ${selectedRailKitPlanStats.completed}/${selectedRailKitPlanStats.total}`}
                        count={selectedRailKitPlanStats.total}
                      />
                      {selectedRailKitPlanStats.failed > 0 ? (
                        <StateBadge
                          label={`${selectedRailKitPlanStats.failed} 个步骤失败`}
                          variant="destructive"
                        />
                      ) : null}
                      <StateBadge
                        label={runningProjectTask ? "运行中" : latestFailedProjectTask ? "需处理" : "队列就绪"}
                        signal={Boolean(runningProjectTask) || Boolean(latestFailedProjectTask)}
                        variant={runningProjectTask ? "accent" : latestFailedProjectTask ? "destructive" : "outline"}
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 xl:grid-cols-2" data-builder-project-action-center-list="">
                    {projectActionCenterItems.map((item: any, index: any) => {
                      const ItemIcon = item.icon;
                      const isRunKitItem = item.id === "run-kit-next-step";
                      return (
                        <article
                          key={item.id}
                          className={cn(
                            "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[20px] border px-3 py-3 text-xs transition",
                            projectActionCenterToneClass(item.tone),
                          )}
                          data-builder-project-action-center-row={item.id}
                          data-builder-project-action-center-kind={item.kind}
                          data-builder-project-action-center-tone={item.tone}
                          data-builder-project-action-center-primary={index === 0 ? "true" : "false"}
                        >
                          <button
                            type="button"
                            className="focus-ring grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-2xl px-2 py-1.5 text-left transition hover:bg-surface-container-high/70"
                            data-builder-project-action-center-open={item.id}
                            data-builder-project-action-center-action={item.action.kind}
                            title={`${item.title} · ${item.meta}`}
                            onClick={() => runProjectActionCenterItem(item)}
                          >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-surface-container-highest text-primary">
                              <ItemIcon aria-hidden className="size-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                                <span className="truncate font-semibold text-on-surface">{item.title}</span>
                                <StateLabel
                                  variant={projectActionCenterBadgeVariant(item.tone)}
                                  className="shrink-0 text-[0.58rem]"
                                  label={item.badge}
                                />
                              </span>
                              <span className="mt-1 line-clamp-2 leading-5 text-on-surface-variant">{item.detail}</span>
                              <span className="mt-1 block truncate font-mono text-[0.66rem] text-on-surface-variant">{item.meta}</span>
                              {isRunKitItem ? (
                                <span
                                  className="mt-2 block"
                                  data-builder-project-action-center-kit-progress={selectedRailKitPlanStats.progress}
                                  data-builder-project-action-center-kit-total={selectedRailKitPlanStats.total}
                                >
                                  <Progress className="h-1" value={selectedRailKitPlanStats.progress} />
                                </span>
                              ) : null}
                            </span>
                          </button>
                          <Button
                            size="sm"
                            variant={item.tone === "danger" ? "destructive" : item.tone === "warning" || item.tone === "running" ? "secondary" : "ghost"}
                            className="h-8 shrink-0 px-2.5 text-xs"
                            data-builder-project-action-center-run={item.id}
                            onClick={() => runProjectActionCenterItem(item)}
                          >
                            <ArrowRight aria-hidden className="size-4" />
                            {item.actionLabel}
                          </Button>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section
                  className="rounded-[24px] border border-outline-variant bg-surface-container p-4 shadow-m3-1"
                  data-builder-project-working-set=""
                  data-builder-project-working-set-count={projectWorkingSetItems.length}
                  data-builder-project-working-set-dirty-count={projectWorkingSetDirtyCount}
                  data-builder-project-working-set-active={projectWorkingSetActiveItem?.id ?? ""}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-surface-container-highest text-primary">
                          <Columns3 aria-hidden className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-on-surface">项目工作集</h3>
                          <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                            把当前 UI、未保存来源、Rust 逻辑和构建工作区放到同一个可操作队列里，像 Qt Creator 的工作集一样快速切换。
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[0.68rem]" data-builder-project-working-set-summary="">
                      <span className="text-on-surface-variant">{projectWorkingSetSummary}</span>
                      <StateLabel
                        variant="destructive"
                        label={projectWorkingSetDirtyCount > 0 ? `${projectWorkingSetDirtyCount} 未保存` : "全部同步"}
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 xl:grid-cols-2" data-builder-project-working-set-list="">
                    {projectWorkingSetItems.map((item: any) => {
                      const ItemIcon = item.icon;
                      return (
                        <article
                          key={item.id}
                          className={cn(
                            "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[18px] border px-3 py-2.5 text-xs transition",
                            item.active
                              ? "border-primary/35 bg-secondary-container/75 text-secondary-container-foreground shadow-m3-1"
                              : "border-outline-variant bg-surface-container-low hover:bg-surface-container-high",
                          )}
                          data-builder-project-working-set-row={item.id}
                          data-builder-project-working-set-kind={item.kind}
                          data-builder-project-working-set-state={item.active ? "active" : item.dirty ? "dirty" : "idle"}
                          data-builder-project-working-set-node={item.nodeId}
                        >
                          <button
                            type="button"
                            className={cn(
                              "focus-ring grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl px-2 py-1.5 text-left transition hover:bg-surface-container-high",
                              item.active ? "bg-secondary-container/60" : "",
                            )}
                            data-builder-project-working-set-open={item.id}
                            aria-current={item.active ? "page" : undefined}
                            title={`${item.label} · ${item.relativePath}`}
                            onClick={() => openProjectWorkingSetItem(item)}
                          >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-surface-container-highest text-primary">
                              <ItemIcon aria-hidden className="size-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="flex min-w-0 items-center gap-1.5">
                                {item.dirty ? <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-label="未保存" /> : null}
                                <span className="truncate font-semibold text-on-surface">{item.label}</span>
                              </span>
                              <span className="mt-0.5 block truncate text-on-surface-variant">{item.detail}</span>
                              <span className="mt-0.5 block truncate font-mono text-[0.66rem] text-on-surface-variant">{item.relativePath}</span>
                            </span>
                            {/* Kind words (逻辑 / 构建) ride the icon, and the active row's
                                background already says which one is current. Only an unsaved
                                change earns a chip. */}
                            <StateBadge
                              variant={item.dirty ? "destructive" : "outline"}
                              label={item.statusLabel}
                              signal={item.dirty}
                              className="shrink-0"
                            />
                          </button>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              className="size-8 rounded-xl"
                              data-builder-project-working-set-reveal={item.id}
                              aria-label={`在项目树定位 ${item.label}`}
                              title="在项目树定位"
                              onClick={() => focusProjectWorkingSetItem(item)}
                            >
                              <FolderOpen aria-hidden className="size-4" />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              className="size-8 rounded-xl"
                              data-builder-project-working-set-copy-path={item.id}
                              aria-label={`复制 ${item.label} 的相对路径`}
                              title="复制相对路径"
                              onClick={() => void copyArtifactPath(item.relativePath || item.path)}
                            >
                              <ClipboardCopy aria-hidden className="size-4" />
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section
                  className="rounded-[24px] border border-outline-variant bg-surface-container p-4 shadow-m3-1"
                  data-builder-project-ownership-matrix=""
                  data-builder-project-ownership-matrix-count={projectOwnershipMatrixItems.length}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-surface-container-highest text-primary">
                          <FileJson aria-hidden className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-on-surface">项目职责矩阵</h3>
                          <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                            把源码、生成物和隐藏本地状态拆成清晰所有权，避免把 UI 文件、Rust 文件和 `.nova` 状态混在窄侧栏里猜。
                          </p>
                        </div>
                      </div>
                    </div>
                    <StateBadge
                      label={projectSourceDirty ? "有未保存来源" : "来源已同步"}
                      signal={Boolean(projectSourceDirty)}
                      variant={projectSourceDirty ? "outline" : "secondary"}
                      data-builder-project-ownership-sync-state=""
                    />
                  </div>
                  <div className="mt-3 overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-low" data-builder-project-ownership-table="">
                    <div className="grid grid-cols-[0.8fr_1fr_1.15fr_1.2fr_auto] gap-3 border-b border-outline-variant bg-surface-container-high px-3 py-2 text-[0.62rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant max-lg:hidden">
                      <span>边界</span>
                      <span>负责人</span>
                      <span>职责</span>
                      <span>保存策略</span>
                      <span className="text-right">动作</span>
                    </div>
                    <div className="divide-y divide-outline-variant">
                      {projectOwnershipMatrixItems.map((item: any) => {
                        const ItemIcon = item.icon;
                        return (
                          <article
                            key={item.id}
                            className="grid gap-3 px-3 py-3 text-xs lg:grid-cols-[0.8fr_1fr_1.15fr_1.2fr_auto] lg:items-center"
                            data-builder-project-ownership-row={item.id}
                            data-builder-project-ownership-route-count={item.routeCount}
                          >
                            <div className="min-w-0">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest text-primary">
                                  <ItemIcon aria-hidden className="size-4" />
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate font-medium text-on-surface">{item.title}</span>
                                  <span className="mt-0.5 block truncate font-mono text-[0.62rem] text-on-surface-variant">
                                    {item.countLabel} · {item.routeCount} 路径
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div className="min-w-0" data-builder-project-ownership-owner="">
                              <p className="truncate font-medium text-on-surface">{item.owner}</p>
                              <p className="mt-1 truncate font-mono text-[0.68rem] text-on-surface-variant">{item.sourceOfTruth}</p>
                            </div>
                            <p className="line-clamp-2 leading-5 text-on-surface-variant" data-builder-project-ownership-responsibility="">
                              {item.responsibility}
                            </p>
                            <p className="line-clamp-2 leading-5 text-on-surface-variant" data-builder-project-ownership-save-policy="">
                              {item.savePolicy}
                            </p>
                            <div className="flex min-w-0 flex-wrap items-center gap-1.5 lg:justify-end">
                              {/* A storage kind is a column value, not a state worth a pill. */}
                              <span className="shrink-0 text-[0.68rem] text-on-surface-variant">
                                {item.id === "source" ? "源码" : item.id === "generated" ? "生成" : ".nova"}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs"
                                data-builder-project-ownership-open=""
                                onClick={() => {
                                  setProjectExplorerFilter(item.primaryRoute.filter);
                                  setProjectExplorerQuery(item.primaryRoute.query);
                                  if (item.primaryRoute.nodeId) {
                                    setSelectedProjectExplorerNodeId(item.primaryRoute.nodeId);
                                  }
                                }}
                              >
                                {item.actionLabel}
                                <ArrowRight aria-hidden className="size-3.5" />
                              </Button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </section>

                  </div>
                </details>

                <section
                  className="grid min-h-[560px] gap-2 xl:grid-cols-[minmax(22rem,0.74fr)_minmax(0,1.26fr)]"
                  data-builder-project-workspace-layout="split-ide"
                  data-builder-project-workspace-panel-chrome="low"
                >
                  <div
                    className="flex min-h-0 flex-col overflow-hidden rounded-[14px] border border-outline-variant bg-surface-container-low p-2 shadow-none"
                    data-builder-project-tree-panel-density="low-chrome-dock"
                  >
                    <div
                      className="flex min-h-8 items-center justify-between gap-2 rounded-lg px-1"
                      data-builder-project-tree-header=""
                      data-builder-project-tree-header-density="compact-title-toolbar"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-on-surface">工程文件树</h3>
                        <div
                          className="hidden min-w-0 items-center gap-1 text-[0.62rem] text-on-surface-variant sm:flex"
                          data-builder-project-workspace-summary-strip=""
                          data-builder-project-storage-boundaries=""
                          data-builder-project-workspace-summary-density="inline-counts"
                        >
                          <CountReadout label={`${visibleProjectExplorerNodes.length} 节点`} count={visibleProjectExplorerNodes.length} />
                          <span className="font-mono">{activeProject.files.length} UI</span>
                          <span aria-hidden className="h-3 w-px bg-outline-variant" />
                          <span className="font-mono">{activeProject.rustCommands.length + activeProject.rustModules.length} Rust</span>
                          <span aria-hidden className="h-3 w-px bg-outline-variant" />
                          <span className="font-mono">{diskCheckpoints.length + 2} .nova</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1" data-builder-project-tree-header-actions="compact">
                        <button
                          type="button"
                          className="focus-ring rounded-lg px-2 py-1 text-[0.64rem] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                          data-builder-project-tree-expand-all=""
                          title="展开全部文件夹 · Ctrl+Alt+→"
                          onClick={expandProjectExplorerTree}
                        >
                          展开
                        </button>
                        <button
                          type="button"
                          className="focus-ring rounded-lg px-2 py-1 text-[0.64rem] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                          data-builder-project-tree-collapse-all=""
                          title="收起全部文件夹 · Ctrl+Alt+←"
                          onClick={collapseProjectExplorerTree}
                        >
                          收起
                        </button>
                      </div>
                    </div>
                    <div
                      className="mt-1.5 grid min-w-0 gap-1 rounded-lg border border-outline-variant/80 bg-surface-container px-1.5 py-1 text-[0.64rem] sm:grid-cols-[minmax(8rem,1fr)_auto]"
                      data-builder-project-tree-toolbar=""
                      data-builder-project-tree-toolbar-density="single-row-filter-search"
                    >
                      <div
                        className="relative min-w-0"
                        data-builder-project-workspace-search=""
                        data-builder-project-workspace-search-active={projectExplorerLocatorActive ? "true" : "false"}
                      >
                        <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-on-surface-variant" />
                        <Input
                          value={projectExplorerQuery}
                          inputSize="sm"
                          aria-label="搜索工程文件树"
                          placeholder="搜索文件、路径、类型..."
                          className="h-7 rounded-lg border-transparent bg-surface-container-high pl-8 pr-8 text-[0.68rem] shadow-none"
                          data-builder-project-workspace-search-input=""
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
                        {projectExplorerQuery ? (
                          <button
                            type="button"
                            aria-label="清空工程文件树搜索"
                            className="focus-ring absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-on-surface-variant transition hover:bg-surface-container-highest hover:text-on-surface"
                            data-builder-project-workspace-search-clear=""
                            onClick={() => setProjectExplorerQuery("")}
                          >
                            <X aria-hidden className="size-3.5" />
                          </button>
                        ) : null}
                      </div>
                      <div
                        className="subtle-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto sm:justify-end"
                        data-builder-project-workspace-filter=""
                        data-builder-project-workspace-filter-density="toolbar-segmented"
                      >
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
                                "focus-ring inline-flex h-7 flex-none items-center gap-1 rounded-md border px-1.5 text-[0.64rem] transition",
                                active
                                  ? "border-primary bg-primary/10 text-on-surface"
                                  : "border-transparent bg-transparent text-on-surface-variant hover:border-outline-variant hover:bg-surface-container-high hover:text-on-surface",
                              )}
                              onClick={() => setProjectExplorerFilter(option.id)}
                            >
                              <span className="font-medium">{option.label}</span>
                              <span className="font-mono text-[0.58rem] opacity-70">{projectExplorerFilterCounts.get(option.id) ?? 0}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {projectExplorerLocatorActive ? (
                      <section
                        className="mt-2 overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low"
                        data-builder-project-locator=""
                        data-builder-project-locator-query={projectExplorerQuery}
                        data-builder-project-locator-count={projectExplorerLocatorResults.length}
                      >
                        <div className="flex min-w-0 items-center justify-between gap-2 border-b border-outline-variant bg-surface-container-high px-3 py-2 text-[0.66rem] text-on-surface-variant">
                          <span className="truncate">
                            定位器 · {projectExplorerLocatorResults.length} 个结果
                          </span>
                          <span className="max-w-[10rem] truncate font-mono" data-builder-project-locator-active-query="">
                            {projectExplorerQuery}
                          </span>
                        </div>
                        <div className="max-h-52 overflow-auto p-1.5" data-builder-project-locator-results="">
                          {projectExplorerLocatorResults.map((node: any) => {
                            const NodeIcon = node.icon;
                            const group = projectExplorerGroupMeta(projectExplorerNodeGroupId(node));
                            const status = projectExplorerNodeStatus(node);
                            return (
                              <article
                                key={node.id}
                                className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl px-2 py-1.5 text-xs transition hover:bg-surface-container-high"
                                data-builder-project-locator-result={node.id}
                                data-builder-project-locator-result-group={projectExplorerNodeGroupId(node)}
                                data-builder-project-locator-result-action={node.action}
                              >
                                <button
                                  type="button"
                                  className="focus-ring grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-xl px-1 py-1 text-left"
                                  data-builder-project-locator-select={node.id}
                                  onClick={() => setSelectedProjectExplorerNodeId(node.id)}
                                >
                                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest text-primary">
                                    <NodeIcon aria-hidden className="size-4" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="flex min-w-0 items-center gap-1.5">
                                      <span className="truncate font-medium text-on-surface">{node.label}</span>
                                      <span className="shrink-0 rounded-full bg-surface-container px-1.5 py-0.5 text-[0.58rem] text-on-surface-variant">
                                        {group.label}
                                      </span>
                                    </span>
                                    <span className="mt-0.5 block truncate font-mono text-[0.62rem] text-on-surface-variant">
                                      {node.path || node.detail}
                                    </span>
                                  </span>
                                </button>
                                <div className="flex shrink-0 items-center gap-1">
                                  <SignalChip
                                    label={status.label}
                                    signal={status.signal}
                                    toneClass={projectExplorerStatusClass(status.tone)}
                                  />
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    className="size-8 rounded-xl"
                                    aria-label={`打开 ${node.label}`}
                                    data-builder-project-locator-open={node.id}
                                    disabled={node.action === "none"}
                                    onClick={() => handleProjectExplorerNode(node)}
                                  >
                                    <ArrowRight aria-hidden className="size-4" />
                                  </Button>
                                </div>
                              </article>
                            );
                          })}
                          {projectExplorerLocatorResults.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-outline-variant px-3 py-5 text-center text-xs text-on-surface-variant" data-builder-project-locator-empty="">
                              没有匹配的工程节点。
                            </div>
                          ) : null}
                        </div>
                      </section>
                    ) : null}
                    <div
                      className="subtle-scrollbar mt-2 min-h-0 flex-1 space-y-0.5 overflow-auto pr-1"
                      data-builder-project-workspace-tree=""
                      data-builder-project-workspace-tree-density="compact-explorer"
                      data-builder-project-tree-keyboard-nav=""
                      data-builder-project-tree-selected-node={selectedProjectExplorerNode?.id ?? ""}
                      data-builder-project-tree-visible-count={visibleProjectExplorerNodes.length}
                      data-builder-project-tree-collapsed-count={collapsedProjectExplorerNodeIds.length}
                      role="tree"
                      tabIndex={0}
                      aria-label="项目文件树"
                      aria-activedescendant={selectedProjectExplorerNode ? `project-explorer-node-${selectedProjectExplorerNode.id}` : undefined}
                      onKeyDown={handleProjectExplorerTreeKeyDown}
                    >
                      {visibleProjectExplorerRows.map((row: any) => {
                        if (row.kind === "group") {
                          return (
                            <div
                              key={row.key}
                              className="sticky top-0 z-[1] flex items-center justify-between gap-2 bg-surface-container-lowest/95 px-1.5 py-0.5 text-[0.58rem] font-medium uppercase tracking-[0.06em] text-on-surface-variant backdrop-blur"
                              data-builder-project-workspace-group={row.id}
                            >
                              <span className="truncate">{row.label}</span>
                              <span className="shrink-0 font-mono tracking-normal">{row.count}</span>
                            </div>
                          );
                        }
                        const node = row.node;
                        const NodeIcon = node.icon;
                        const selected = selectedProjectExplorerNode?.id === node.id;
                        const actionable = node.action !== "none";
                        const hasChildren = projectExplorerFolderNodeIds.includes(node.id);
                        const collapsed = collapsedProjectExplorerNodeSet.has(node.id);
                        const status = projectExplorerNodeStatus(node);
                        return (
                          <div
                            key={node.id}
                            id={`project-explorer-node-${node.id}`}
                            role="treeitem"
                            aria-selected={selected}
                            aria-expanded={hasChildren ? !collapsed : undefined}
                            data-builder-project-workspace-node={node.id}
                            data-builder-project-workspace-node-density="compact-row"
                            data-builder-project-tree-node={node.id}
                            data-builder-project-context-node={node.id}
                            data-builder-project-tree-node-dirty={node.dirty ? "true" : "false"}
                            className={cn(
                              "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-0.5 rounded-md py-0.5 pr-1 text-xs transition focus-within:ring-2 focus-within:ring-ring/40",
                              selected
                                ? "bg-secondary-container text-secondary-container-foreground"
                                : node.muted
                                  ? "text-on-surface-variant hover:bg-surface-container-high"
                                  : "hover:bg-surface-container-high",
                              !actionable && "cursor-default opacity-80",
                            )}
                            style={{ paddingLeft: node.depth * 14 + 6 }}
                            title={node.path || node.detail}
                            onContextMenu={(event: any) => openProjectExplorerContextMenu(event, node)}
                          >
                            <button
                              type="button"
                              aria-label={collapsed ? `展开 ${node.label}` : `收起 ${node.label}`}
                              className={cn(
                                "focus-ring flex size-5 shrink-0 items-center justify-center rounded-md transition",
                                hasChildren ? "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface" : "cursor-default text-on-surface-variant/40",
                              )}
                              disabled={!hasChildren}
                              onClick={() => toggleProjectExplorerNode(node.id)}
                            >
                              <ChevronDown aria-hidden className={cn("size-3.5 transition-transform", collapsed && "-rotate-90")} />
                            </button>
                            <button
                              type="button"
                              className="focus-ring grid min-h-7 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-1.5 rounded-md py-0.5 pr-1 text-left"
                              onClick={() => handleProjectExplorerNode(node)}
                            >
                              <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-md", selected ? "bg-secondary-container text-secondary-container-foreground" : "text-primary")}>
                                <NodeIcon aria-hidden className="size-3.5" />
                              </span>
                              <span className="min-w-0" data-builder-project-workspace-node-detail="deferred">
                                <span className="flex min-w-0 items-center gap-1.5 font-medium leading-5">
                                  {node.dirty ? <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-label="未保存" /> : null}
                                  <span className="truncate">{node.label}</span>
                                </span>
                                <span className="sr-only">{node.detail}</span>
                              </span>
                              <SignalChip
                                label={status.label}
                                signal={status.signal}
                                toneClass={projectExplorerStatusClass(status.tone)}
                              />
                              {/* Skip the badge when it only repeats the status chip —
                                  a dirty file row used to read "未保存 | 未保存". A folder's
                                  "N 个未保存" is different information and must survive. */}
                              {node.badge && projectExplorerBadgeLabel(node.badge) !== status.label ? (
                                <StateLabel
                                  className={
                                    selected
                                      ? "shrink-0 border-transparent bg-secondary-container text-secondary-container-foreground"
                                      : "shrink-0"
                                  }
                                  label={projectExplorerBadgeLabel(node.badge)}
                                />
                              ) : null}
                            </button>
                            <Button
                              size="icon-sm"
                              variant={selected ? "secondary" : "ghost"}
                              className="size-6 rounded-md"
                              aria-label={`查看 ${node.label} 的项目详情`}
                              data-builder-project-workspace-node-select={node.id}
                              onClick={() => setSelectedProjectExplorerNodeId(node.id)}
                            >
                              <Eye aria-hidden className="size-3.5" />
                            </Button>
                          </div>
                        );
                      })}
                      {visibleProjectExplorerNodes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-outline-variant px-3 py-8 text-center text-xs text-on-surface-variant">
                          当前过滤没有可显示节点。
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div
                    className="subtle-scrollbar min-h-0 overflow-y-auto rounded-[14px] border border-outline-variant bg-surface-container-low p-1 shadow-none"
                    data-builder-project-detail-panel-density="low-chrome-dock"
                    data-builder-project-detail-panel-chrome="flat-inspector"
                  >
                    {selectedProjectExplorerNode ? (
                      <section
                        className="overflow-hidden rounded-md border border-outline-variant bg-surface-container-low/70"
                        data-builder-project-workspace-detail=""
                        data-builder-project-workspace-detail-density="thin-inspector-stack"
                        data-builder-project-workspace-detail-chrome="single-layer-inspector"
                      >
                        <div className="flex min-w-0 items-center gap-2 px-2 py-1.5">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-container-highest text-primary">
                            <SelectedProjectExplorerIcon aria-hidden className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <h3 className="truncate text-sm font-semibold text-on-surface">{selectedProjectExplorerNode.label}</h3>
                              <span className="text-[0.68rem] text-on-surface-variant">{projectExplorerActionLabel(selectedProjectExplorerNode.action)}</span>
                              {selectedProjectExplorerNode.badge ? (
                                <StateLabel variant="secondary" label={projectExplorerBadgeLabel(selectedProjectExplorerNode.badge)} />
                              ) : null}
                            </div>
                            <p className="sr-only">{selectedProjectExplorerNode.detail}</p>
                          </div>
                        </div>
                        <nav
                          className="flex min-h-7 min-w-0 flex-wrap items-center gap-1 border-t border-outline-variant px-2 py-1 text-[0.68rem]"
                          aria-label="当前项目节点路径"
                          data-builder-project-tree-breadcrumb=""
                          data-builder-project-tree-breadcrumb-density="inline-row"
                          data-builder-project-tree-breadcrumb-chrome="flat-row"
                        >
                          {selectedProjectExplorerPathNodes.map((node: any, index: any) => {
                            const current = node.id === selectedProjectExplorerNode.id;
                            return (
                              <span key={node.id} className="flex min-w-0 items-center gap-1.5">
                                {index > 0 ? <ChevronRight aria-hidden className="size-3 shrink-0 text-on-surface-variant" /> : null}
                                <button
                                  type="button"
                                  className={cn(
                                    "focus-ring max-w-[12rem] truncate rounded-md px-1.5 py-0.5 transition",
                                    current
                                      ? "bg-secondary-container text-secondary-container-foreground"
                                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                                  )}
                                  aria-current={current ? "page" : undefined}
                                  data-builder-project-tree-breadcrumb-segment={node.id}
                                  onClick={() => setSelectedProjectExplorerNodeId(node.id)}
                                >
                                  {node.label.replace(/\/$/, "")}
                                </button>
                              </span>
                            );
                          })}
                        </nav>
                        <p className="sr-only" data-builder-project-tree-selected-full-path="deferred">
                          {selectedProjectExplorerDisplayPath}
                        </p>
                        <section
                          className="border-t border-outline-variant px-2 py-1"
                          data-builder-project-node-action-strip=""
                          data-builder-project-node-action-strip-density="primary-row-with-deferred-secondary"
                          data-builder-project-node-action-strip-chrome="toolbar-row"
                          data-builder-project-node-action-strip-node={selectedProjectExplorerNode.id}
                          data-builder-project-node-action-strip-kind={selectedProjectExplorerDossier?.groupId ?? projectExplorerNodeGroupId(selectedProjectExplorerNode)}
                          data-builder-project-node-action-strip-file={selectedProjectExplorerFile?.id ?? "none"}
                        >
                          <div className="flex min-w-0 flex-wrap items-center gap-1.5" data-builder-project-node-action-strip-summary="single-row">
                            <span className="mr-1 inline-flex min-w-0 max-w-[14rem] items-center gap-1.5 text-[0.68rem] text-on-surface-variant">
                              <MousePointer2 aria-hidden className="size-3.5 shrink-0 text-primary" />
                              <span className="truncate font-medium text-on-surface">{selectedProjectExplorerDossier?.groupLabel ?? "项目"}</span>
                            </span>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 justify-start px-2 text-[0.68rem]"
                              data-builder-project-node-action-open=""
                              disabled={selectedProjectExplorerNode.action === "none"}
                              onClick={() => runProjectExplorerContextAction("open", selectedProjectExplorerNode)}
                            >
                              <ArrowRight aria-hidden className="size-4" />
                              打开节点
                            </Button>
                            <details
                              className="group min-w-[12rem] flex-1"
                              data-builder-project-node-action-strip-secondary=""
                              data-builder-project-node-action-strip-secondary-state="collapsed-default"
                            >
                              <summary
                                className="focus-ring flex h-7 cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-2 text-[0.68rem] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface [&::-webkit-details-marker]:hidden"
                                data-builder-project-node-action-strip-secondary-summary="single-row"
                              >
                                <span className="flex min-w-0 items-center gap-1.5">
                                  <ChevronRight aria-hidden className="size-3.5 shrink-0 transition-transform group-open:rotate-90" />
                                  <span className="truncate font-medium">更多动作</span>
                                </span>
                                <span className="flex shrink-0 items-center gap-1.5">
                                  <span className="hidden max-w-[12rem] truncate font-mono text-[0.62rem] xl:inline">
                                    {selectedProjectExplorerRelativePath || selectedProjectExplorerNode.label}
                                  </span>
                                </span>
                              </summary>
                              <div
                                className="mt-2 hidden min-w-0 gap-1.5 border-t border-outline-variant pt-2 group-open:grid sm:grid-cols-2 xl:grid-cols-6"
                                data-builder-project-node-action-strip-details="deferred"
                              >
                                <Button
                                  size="sm"
                                  variant="subtle"
                                  className="h-7 justify-start px-2 text-[0.68rem]"
                                  data-builder-project-node-action-rename=""
                                  disabled={!selectedProjectExplorerFile}
                                  onClick={() => runProjectExplorerContextAction("rename-ui-file", selectedProjectExplorerNode)}
                                >
                                  <TextCursorInput aria-hidden className="size-4" />
                                  重命名 UI
                                </Button>
                                <Button
                                  size="sm"
                                  variant="subtle"
                                  className="h-7 justify-start px-2 text-[0.68rem]"
                                  data-builder-project-node-action-duplicate=""
                                  disabled={!selectedProjectExplorerFile}
                                  onClick={() => runProjectExplorerContextAction("duplicate-ui-file", selectedProjectExplorerNode)}
                                >
                                  <Copy aria-hidden className="size-4" />
                                  复制 UI
                                </Button>
                                <Button
                                  size="sm"
                                  variant="subtle"
                                  className="h-7 justify-start px-2 text-[0.68rem]"
                                  data-builder-project-node-action-new-ui=""
                                  onClick={() => runProjectExplorerContextAction("new-ui-file", selectedProjectExplorerNode)}
                                >
                                  <Plus aria-hidden className="size-4" />
                                  新建 UI
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 justify-start px-2 text-[0.68rem]"
                                  data-builder-project-node-action-copy-path=""
                                  disabled={!selectedProjectExplorerDisplayPath}
                                  onClick={() => void copyArtifactPath(selectedProjectExplorerDisplayPath)}
                                >
                                  <ClipboardCopy aria-hidden className="size-4" />
                                  复制路径
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 justify-start px-2 text-[0.68rem]"
                                  data-builder-project-node-action-reveal=""
                                  disabled={!selectedProjectExplorerDisplayPath || !isTauriRuntime()}
                                  onClick={() => runProjectExplorerContextAction("reveal", selectedProjectExplorerNode)}
                                >
                                  <FolderOpen aria-hidden className="size-4" />
                                  系统中显示
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 justify-start px-2 text-[0.68rem]"
                                  data-builder-project-node-action-filter=""
                                  onClick={() => runProjectExplorerContextAction("filter-kind", selectedProjectExplorerNode)}
                                >
                                  <Search aria-hidden className="size-4" />
                                  只看同类
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 justify-start px-2 text-[0.68rem] sm:col-span-2 xl:col-span-1"
                                  data-builder-project-node-action-delete=""
                                  disabled={!selectedProjectExplorerFile}
                                  onClick={() => runProjectExplorerContextAction("delete-ui-file", selectedProjectExplorerNode)}
                                >
                                  <Trash2 aria-hidden className="size-4" />
                                  删除 UI
                                </Button>
                              </div>
                            </details>
                          </div>
                        </section>
                        <div
                          className="grid min-w-0 gap-x-2 gap-y-1 border-t border-outline-variant px-2 py-1 text-[0.68rem] lg:grid-cols-[auto_auto_minmax(0,1fr)]"
                          data-builder-project-tree-selected-context=""
                          data-builder-project-tree-selected-context-density="single-row"
                          data-builder-project-tree-selected-context-chrome="property-row"
                        >
                          <button
                            type="button"
                            className="focus-ring inline-flex min-w-0 items-center gap-1.5 rounded-lg px-1.5 py-0.5 text-left transition hover:bg-surface-container-high"
                            data-builder-project-tree-parent-node={selectedProjectExplorerParentNode?.id ?? "none"}
                            disabled={!selectedProjectExplorerParentNode}
                            onClick={() => {
                              if (selectedProjectExplorerParentNode) {
                                setSelectedProjectExplorerNodeId(selectedProjectExplorerParentNode.id);
                              }
                            }}
                          >
                            <span className="shrink-0 font-medium text-on-surface">上级</span>
                            <span className="truncate text-on-surface-variant">{selectedProjectExplorerParentNode?.label ?? "项目根"}</span>
                          </button>
                          {/* Label/value pairs are property rows, not status tokens.
                              Rounding them into pills spent visual budget on chrome
                              and made the density probe count them as decoration. */}
                          <div
                            className="flex min-w-0 items-center gap-1.5"
                            data-builder-project-tree-selected-children={selectedProjectExplorerChildNodes.length}
                          >
                            <span className="shrink-0 font-medium text-on-surface">子节点</span>
                            <span className="truncate text-on-surface-variant">
                              {selectedProjectExplorerChildNodes.length > 0
                                ? selectedProjectExplorerChildNodes.slice(0, 3).map((node: any) => node.label).join(" / ")
                                : "没有子节点"}
                            </span>
                          </div>
                          <div
                            className="flex min-w-0 flex-1 items-center gap-1.5"
                            data-builder-project-tree-relative-path=""
                          >
                            <span className="shrink-0 font-medium text-on-surface">相对路径</span>
                            <span className="truncate font-mono text-[0.66rem] text-on-surface-variant">{selectedProjectExplorerRelativePath || "."}</span>
                          </div>
                        </div>
                        {selectedProjectExplorerDossier ? (
                          <div
                            className="border-t border-outline-variant px-2 py-1 text-xs"
                            data-builder-project-node-dossier=""
                            data-builder-project-node-dossier-density="thin-inspector-strip"
                            data-builder-project-node-dossier-chrome="flat-property-row"
                            data-builder-project-node-dossier-domain={selectedProjectExplorerDossier.groupId}
                          >
                            <div className="grid min-w-0 gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] xl:items-center">
                              <div className="min-w-0">
                                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                  {/* A dossier group is a category, the same class
                                      of value as a type name — a column value. */}
                                  <span
                                    className="text-[0.68rem] font-medium text-on-surface-variant"
                                    data-builder-project-node-dossier-domain-label=""
                                  >
                                    {selectedProjectExplorerDossier.groupLabel}
                                  </span>
                                  <StateBadge
                                    variant={selectedProjectExplorerDossier.syncState === "已同步" ? "secondary" : "outline"}
                                    label={selectedProjectExplorerDossier.syncState}
                                    signal={!isQuietStateLabel(selectedProjectExplorerDossier.syncState)}
                                    data-builder-project-node-dossier-sync-state=""
                                  />
                                  <StateBadge
                                    variant="outline"
                                    label={`${selectedProjectExplorerDossier.relatedTabCount} 标签`}
                                    signal={!isQuietCount(selectedProjectExplorerDossier.relatedTabCount)}
                                    data-builder-project-node-dossier-related-tabs=""
                                  />
                                </div>
                                <p className="mt-1 truncate leading-4 text-on-surface-variant" data-builder-project-node-dossier-source-of-truth="">
                                  事实来源：<span className="font-mono text-on-surface">{selectedProjectExplorerDossier.sourceOfTruth}</span>
                                </p>
                              </div>
                              <p className="min-w-0 truncate break-all font-mono text-[0.68rem] leading-4 text-on-surface-variant" data-builder-project-node-dossier-save-target="">
                                <span className="mr-1 font-sans font-medium text-on-surface">保存目标</span>
                                {selectedProjectExplorerDossier.saveTarget}
                              </p>
                              <div className="shrink-0 rounded-lg border border-outline-variant bg-surface-container px-2 py-1 text-right" data-builder-project-node-dossier-artifact-state="">
                                <span className="mr-1 text-[0.62rem] uppercase tracking-[0.08em] text-on-surface-variant">状态</span>
                                <span className="inline-block max-w-[10rem] truncate align-bottom font-medium text-on-surface">{selectedProjectExplorerDossier.artifactState}</span>
                              </div>
                              <div
                                className="flex min-w-0 shrink-0 items-center gap-0.5 rounded-md border border-outline-variant bg-surface-container px-1 py-0.5"
                                data-builder-project-node-dossier-tasks=""
                                data-builder-project-node-dossier-task-strip="icon-strip"
                              >
                                {selectedProjectExplorerDossier.taskIds.map((taskId: any) => (
                                  <button
                                    key={taskId}
                                    type="button"
                                    className="focus-ring inline-flex size-7 items-center justify-center rounded-md text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                                    data-builder-project-node-dossier-task={taskId}
                                    onClick={() => enqueueProjectTask(taskId)}
                                    title={projectTaskDefinitions[taskId].detail}
                                    aria-label={projectTaskDefinitions[taskId].title}
                                  >
                                    <Play aria-hidden className="size-3.5" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null}
                        {selectedProjectExplorerImpactItems.length > 0 ? (
                          <details
                            className="group border-t border-outline-variant px-2 py-1 text-xs"
                            data-builder-project-node-impact=""
                            data-builder-project-node-impact-count={selectedProjectExplorerImpactItems.length}
                            data-builder-project-node-impact-density="collapsed-summary"
                            data-builder-project-node-impact-chrome="flat-disclosure-row"
                            data-builder-project-node-impact-state="collapsed-default"
                          >
                            <summary
                              className="focus-ring flex min-h-7 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-1 [&::-webkit-details-marker]:hidden"
                              data-builder-project-node-impact-summary="single-row"
                              data-builder-project-node-impact-summary-density="thin-row"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                                <ListChecks aria-hidden className="size-4 shrink-0 text-primary" />
                                <span className="min-w-0">
                                  <span className="truncate font-medium text-on-surface">节点影响</span>
                                  <span className="sr-only">
                                    路径、同步、标签和推荐任务
                                  </span>
                                </span>
                              </span>
                              <span className="flex shrink-0 items-center gap-1.5">
                                <span className="text-[0.68rem] text-on-surface-variant">
                                  {selectedProjectExplorerDossier?.groupLabel ?? "项目"}
                                </span>
                                <CountReadout label={`${selectedProjectExplorerImpactItems.length} 项`} count={selectedProjectExplorerImpactItems.length} />
                              </span>
                            </summary>
                            <div className="mt-2 hidden border-t border-outline-variant pt-2 group-open:block" data-builder-project-node-impact-details="deferred">
                              <div className="divide-y divide-outline-variant overflow-hidden rounded-xl border border-outline-variant bg-surface-container" data-builder-project-node-impact-list="" data-builder-project-node-impact-list-density="single-column-property-rows">
                              {selectedProjectExplorerImpactItems.map((item: any) => {
                                const ImpactIcon = item.icon;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    className={cn(
                                      "focus-ring grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-2.5 py-2 text-left transition hover:bg-surface-container-high",
                                      item.tone === "warning" && "text-on-surface",
                                      item.tone === "success" && "text-on-surface",
                                      item.tone === "ready" && "text-on-surface",
                                      item.tone === "muted" && "text-on-surface-variant hover:text-on-surface",
                                    )}
                                    data-builder-project-node-impact-item={item.id}
                                    data-builder-project-node-impact-tone={item.tone}
                                    data-builder-project-node-impact-task={item.action.kind === "task" ? item.action.taskId : undefined}
                                    onClick={() => runSelectedProjectExplorerImpactAction(item)}
                                    title={item.detail}
                                  >
                                    <span
                                      className={cn(
                                        "flex size-7 shrink-0 items-center justify-center rounded-lg",
                                        item.tone === "warning" && "bg-destructive/10 text-destructive",
                                        item.tone === "success" && "bg-primary/10 text-primary",
                                        item.tone === "ready" && "bg-tertiary-container text-tertiary",
                                        item.tone === "muted" && "bg-surface-container-highest text-on-surface-variant",
                                      )}
                                    >
                                      <ImpactIcon aria-hidden className="size-3.5" />
                                    </span>
                                    <span className="min-w-0">
                                      <span className="flex min-w-0 items-center gap-2">
                                        <span className="truncate font-medium text-on-surface">{item.title}</span>
                                        <span className="shrink-0 text-[0.62rem] text-on-surface-variant">{item.badge}</span>
                                      </span>
                                      <span className="mt-0.5 block truncate break-all leading-4 text-on-surface-variant">
                                        {item.detail}
                                      </span>
                                    </span>
                                    {/* This is the button's own label, not a status. */}
                                    <span
                                      className="shrink-0 font-medium text-primary"
                                      data-builder-project-node-impact-action={item.action.kind}
                                    >
                                      {item.actionLabel}
                                    </span>
                                  </button>
                                );
                              })}
                              </div>
                            </div>
                          </details>
                        ) : null}
                        {selectedProjectExplorerFile ? (
                          <div className="mt-3" data-builder-project-file-rename-editor="">
                            <Field label="UI 文件名">
                              <Input
                                ref={projectExplorerRenameInputRef}
                                data-builder-project-file-rename-input=""
                                inputSize="sm"
                                value={selectedProjectExplorerFile.name}
                                onChange={(event: any) => renameFileById(selectedProjectExplorerFile.id, event.target.value)}
                              />
                            </Field>
                            <div
                              className={cn(
                                "mt-2 flex min-w-0 items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-xs",
                                selectedProjectExplorerFileSaveState?.dirty
                                  ? "border-destructive/25 bg-destructive/10 text-destructive"
                                  : "border-outline-variant bg-surface-container-low text-on-surface-variant",
                              )}
                              data-builder-project-file-save-state={selectedProjectExplorerFileSaveState?.dirty ? "dirty" : "clean"}
                            >
                              <span className="truncate">
                                {selectedProjectExplorerFileSaveState?.dirty ? "此 UI 文件尚未保存同步" : "此 UI 文件已与最近保存内容同步"}
                              </span>
                              <span className="shrink-0 font-mono text-[0.66rem]">{selectedProjectExplorerFile.items.length} items</span>
                            </div>
                          </div>
                        ) : null}
                        <details
                          className="group border-t border-outline-variant px-2 py-1.5"
                          data-builder-project-tree-quick-actions=""
                          data-builder-project-tree-quick-actions-density="collapsed-summary"
                          data-builder-project-tree-quick-actions-chrome="flat-disclosure-row"
                        >
                          <summary
                            className="focus-ring flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-1 text-xs text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface [&::-webkit-details-marker]:hidden"
                            data-builder-project-tree-quick-actions-summary="single-row"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <ChevronRight aria-hidden className="size-3.5 shrink-0 transition-transform group-open:rotate-90" />
                              <FolderSearch aria-hidden className="size-4 shrink-0 text-primary" />
                              <span className="truncate font-medium text-on-surface">路径动作</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-1.5">
                              <span className="hidden max-w-[12rem] truncate font-mono text-[0.62rem] xl:inline">
                                {selectedProjectExplorerRelativePath || selectedProjectExplorerNode.label}
                              </span>
                            </span>
                          </summary>
                          <div className="mt-2 hidden gap-2 border-t border-outline-variant pt-2 group-open:grid sm:grid-cols-2 xl:grid-cols-5" data-builder-project-tree-quick-actions-details="deferred">
                            <Button
                              size="sm"
                              variant="secondary"
                              data-builder-project-workspace-open-node=""
                              data-builder-project-tree-open-selected=""
                              disabled={selectedProjectExplorerNode.action === "none"}
                              onClick={() => handleProjectExplorerNode(selectedProjectExplorerNode)}
                            >
                              <ArrowRight aria-hidden className="size-4" />
                              {projectExplorerPrimaryActionLabel(selectedProjectExplorerNode)}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              data-builder-project-workspace-copy-node=""
                              data-builder-project-tree-copy-selected-path=""
                              disabled={!selectedProjectExplorerDisplayPath}
                              onClick={() => void copyArtifactPath(selectedProjectExplorerDisplayPath)}
                            >
                              <ClipboardCopy aria-hidden className="size-4" />
                              复制完整
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              data-builder-project-tree-copy-selected-relative-path=""
                              disabled={!selectedProjectExplorerRelativePath}
                              onClick={() => void copyArtifactPath(selectedProjectExplorerRelativePath)}
                            >
                              <FileJson aria-hidden className="size-4" />
                              复制相对
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              data-builder-project-workspace-open-artifact=""
                              data-builder-project-tree-reveal-selected=""
                              disabled={!selectedProjectExplorerDisplayPath || !isTauriRuntime()}
                              onClick={() => runProjectExplorerContextAction("reveal", selectedProjectExplorerNode)}
                            >
                              <FolderOpen aria-hidden className="size-4" />
                              显示
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="sm:col-span-2 xl:col-span-1"
                              data-builder-project-tree-filter-selected-kind=""
                              onClick={() => runProjectExplorerContextAction("filter-kind", selectedProjectExplorerNode)}
                            >
                              <Search aria-hidden className="size-4" />
                              同类
                            </Button>
                          </div>
                        </details>
                        {copiedArtifactPath &&
                        (copiedArtifactPath === selectedProjectExplorerDisplayPath || copiedArtifactPath === selectedProjectExplorerRelativePath) ? (
                          <p className="mt-2 text-center text-xs text-primary">路径已复制</p>
                        ) : null}
                      </section>
                    ) : null}

                    <details
                      className="group mt-2 rounded-xl border border-outline-variant bg-surface-container px-2 py-1.5"
                      data-builder-project-open-files=""
                      data-builder-project-open-files-active-tab={activeEditorTabId}
                      data-builder-project-open-files-dirty-count={dirtyOpenEditorTabCount}
                      data-builder-project-open-files-density="collapsed-summary"
                      data-builder-project-open-files-state="collapsed-default"
                    >
                      <summary
                        className="focus-ring flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-1 text-xs [&::-webkit-details-marker]:hidden"
                        data-builder-project-open-files-summary="single-row"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                          <FileText aria-hidden className="size-4 shrink-0 text-primary" />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-on-surface">打开文件</span>
                            <span className="block truncate text-[0.68rem] leading-4 text-on-surface-variant">
                              {activeEditorTab ? `${activeEditorTab.label} · ${activeEditorTab.relativePath}` : "尚无打开文件"}
                            </span>
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          <CountReadout label={openEditorTabCountLabel} count={openEditorTabs.length} />
                          <StateLabel
                            variant={dirtyOpenEditorTabCount > 0 ? "outline" : "secondary"}
                            label={dirtyOpenEditorTabCount > 0 ? `${dirtyOpenEditorTabCount} 未保存` : "已同步"}
                          />
                        </span>
                      </summary>
                      <div className="mt-2 hidden border-t border-outline-variant pt-2 group-open:block" data-builder-project-open-files-details="deferred">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-on-surface">打开文件</h3>
                            <CountReadout label={openEditorTabCountLabel} count={openEditorTabs.length} />
                            {activeEditorTab ? (
                              <StateLabel variant="secondary" label={activeEditorTab.badge} />
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                            像桌面 IDE 一样在项目页集中管理已打开的 UI、Rust 逻辑和构建工作区；关闭 UI 标签不会删除项目文件。
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            data-builder-project-open-files-close-clean=""
                            disabled={cleanClosableOpenEditorTabCount === 0}
                            title={cleanClosableOpenEditorTabCount > 0 ? `关闭 ${cleanClosableOpenEditorTabCount} 个已同步 UI 标签` : "没有可关闭的已同步 UI 标签"}
                            onClick={closeCleanEditorFileTabs}
                          >
                            <X aria-hidden className="size-4" />
                            已同步
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-builder-project-open-files-close-others=""
                            disabled={otherOpenEditorUiTabCount === 0}
                            title={otherOpenEditorUiTabCount > 0 ? `只保留当前 UI，关闭 ${otherOpenEditorUiTabCount} 个其他 UI 标签` : "没有其他 UI 标签可关闭"}
                            onClick={() => closeOtherEditorFileTabs(activeFile.id)}
                          >
                            <Layers aria-hidden className="size-4" />
                            仅当前
                          </Button>
                          <Button size="sm" variant="secondary" data-builder-project-open-files-new-ui="" onClick={createNewFileFromNavigator}>
                            <Plus aria-hidden className="size-4" />
                            新建 UI
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 divide-y divide-outline-variant overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low" data-builder-project-open-files-list="">
                        {openEditorTabs.map((tab: any) => {
                          const TabIcon = tab.icon;
                          const active = tab.id === activeEditorTabId;
                          return (
                            <article
                              key={`project-open-${tab.id}`}
                              className={cn(
                                "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5 text-xs",
                                active && "bg-secondary-container/60",
                              )}
                              data-builder-project-open-file={tab.id}
                              data-builder-project-open-file-kind={tab.kind}
                              data-builder-project-open-file-state={active ? "active" : "idle"}
                              data-builder-project-open-file-dirty={tab.dirty ? "true" : "false"}
                            >
                              <button
                                type="button"
                                className="focus-ring grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-surface-container-high"
                                data-builder-project-open-file-open=""
                                aria-current={active ? "page" : undefined}
                                title={`${tab.label} · ${tab.detail}`}
                                onClick={() => openEditorTab(tab)}
                              >
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest text-primary">
                                  <TabIcon aria-hidden className="size-4" />
                                </span>
                                <span className="min-w-0">
                                  <span className="flex min-w-0 items-center gap-1.5">
                                    {tab.dirty ? <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-label="未保存" /> : null}
                                    <span className="truncate font-medium text-on-surface">{tab.label}</span>
                                  </span>
                                  <span className="mt-0.5 block truncate text-on-surface-variant">{tab.detail}</span>
                                  <span className="mt-0.5 block truncate font-mono text-[0.66rem] text-on-surface-variant">{tab.relativePath}</span>
                                </span>
                                {/* The row already carries the selection (background +
                                    aria-current); a "当前" pill restates it. The badge is
                                    the file's kind, which is a column value to read. */}
                                {tab.badge ? (
                                  <StateLabel variant="outline" className="shrink-0" label={tab.badge} />
                                ) : null}
                              </button>
                              <div className="flex shrink-0 items-center gap-1">
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  className="size-8 rounded-xl"
                                  data-builder-project-open-file-reveal=""
                                  aria-label={`在项目树定位 ${tab.label}`}
                                  title="在项目树定位"
                                  onClick={() => revealEditorTabInProject(tab)}
                                >
                                  <FolderOpen aria-hidden className="size-4" />
                                </Button>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  className="size-8 rounded-xl"
                                  data-builder-project-open-file-copy-relative-path=""
                                  aria-label={`复制 ${tab.label} 的相对路径`}
                                  title="复制相对路径"
                                  onClick={() => void copyArtifactPath(tab.relativePath)}
                                >
                                  <ClipboardCopy aria-hidden className="size-4" />
                                </Button>
                                {tab.kind === "ui" ? (
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    className="size-8 rounded-xl"
                                    data-builder-project-open-file-close=""
                                    aria-label={`关闭 ${tab.label} 标签`}
                                    title={tab.closable ? "关闭标签，不删除项目文件" : "至少保留一个 UI 标签"}
                                    disabled={!tab.closable || !tab.fileId}
                                    onClick={() => {
                                      if (tab.fileId) {
                                        closeEditorFileTab(tab.fileId);
                                      }
                                    }}
                                  >
                                    <X aria-hidden className="size-4" />
                                  </Button>
                                ) : null}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.68rem] text-on-surface-variant">
                        <StateBadge
                          variant="destructive"
                          label={dirtyOpenEditorTabCount > 0 ? `${dirtyOpenEditorTabCount} 个未保存` : "全部同步"}
                          signal={dirtyOpenEditorTabCount > 0}
                        />
                        <span className="min-w-0 truncate">
                          {activeEditorTab ? `当前：${activeEditorTab.label} · ${activeEditorTab.relativePath}` : "尚无打开文件"}
                        </span>
                      </div>
                      </div>
                    </details>

                    <section
                      className="mt-2 grid overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low sm:grid-cols-2 xl:grid-cols-4"
                      data-builder-project-workspace-scopes=""
                      data-builder-project-workspace-scopes-density="ide-scope-strip"
                    >
                      {[
                        {
                          id: "ui",
                          title: "UI 文件",
                          icon: FileJson,
                          detail: `${activeProject.files.length} 个窗口 / ${projectExplorerModel.controlCount} 个控件`,
                          action: "进入设计",
                          onAction: () => switchEditorMode("design"),
                        },
                        {
                          id: "rust",
                          title: "Rust 逻辑",
                          icon: Braces,
                          detail: `${activeProject.rustCommands.length} 命令 / ${activeProject.rustModules.length} 模块 / ${activeProject.cargoDependencies.length} 依赖`,
                          action: "打开逻辑",
                          onAction: () => switchEditorMode("logic"),
                        },
                        {
                          id: "assets",
                          title: "资源",
                          icon: FileImage,
                          detail: `${activeProject.assets.length} 个图片或资源索引`,
                          action: "查看资源",
                          onAction: () => setLeftDockTab("assets"),
                        },
                        {
                          id: "build",
                          title: "生成目标",
                          icon: Download,
                          detail: activeProject.outputExePath ? fileNameFromPath(activeProject.outputExePath) : "保存后生成 app / exe / bundle",
                          action: "打开构建",
                          onAction: () => switchEditorMode("build"),
                        },
                      ].map((scope: any) => {
                        const ScopeIcon = scope.icon;
                        return (
                          <article
                            key={scope.id}
                            className="grid min-h-12 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-outline-variant px-2.5 py-1.5 text-xs last:border-b-0 hover:bg-surface-container xl:border-b-0 xl:border-r xl:last:border-r-0"
                            data-builder-project-workspace-scope-row={scope.id}
                          >
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
                              <ScopeIcon aria-hidden className="size-3.5" />
                            </span>
                            <div className="min-w-0">
                              <h4 className="truncate font-medium text-on-surface">{scope.title}</h4>
                              <p className="truncate text-[0.68rem] leading-4 text-on-surface-variant">{scope.detail}</p>
                            </div>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              className="size-7 shrink-0 rounded-lg"
                              data-builder-project-workspace-scope-action={scope.id}
                              aria-label={scope.action}
                              title={scope.action}
                              onClick={scope.onAction}
                            >
                              <ArrowRight aria-hidden className="size-3.5" />
                            </Button>
                          </article>
                        );
                      })}
                    </section>

                    <section
                      className="mt-3 rounded-lg border border-outline-variant bg-surface-container px-2 py-1.5"
                      data-builder-project-file-routing=""
                      data-builder-project-file-routing-density="compact-table"
                      data-builder-project-save-destinations=""
                    >
                      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <h3 className="truncate text-xs font-semibold text-on-surface">项目文件路由</h3>
                          <CountReadout label={`${projectFileRouteGroups.reduce((total: any, group: any) => total + group.routes.length, 0)} 路径`} count={projectFileRouteGroups.reduce((total: any, group: any) => total + group.routes.length, 0)} />
                          <span className="hidden min-w-0 truncate text-[0.68rem] text-on-surface-variant lg:block">
                            源码、生成目标和 `.nova` 本地状态按项目文件夹分层保存
                          </span>
                        </div>
                        {/* Routing notes describe where things go, not what to do. */}
                        <span className="shrink-0 text-[0.68rem] text-on-surface-variant">
                          {activeProject.rootPath ? "项目文件夹" : "保存后创建"}
                        </span>
                      </div>
                      <p className="sr-only">
                        像 IDE 工程视图一样把源码、生成目标和 `.nova` 本地状态拆开；保存项目时写入目录结构，而不是再导出单个 UI 文件。
                      </p>
                      <div
                        className="mt-1.5 overflow-hidden rounded-md border border-outline-variant bg-surface-container-low text-xs"
                        data-builder-project-file-route-table=""
                        data-builder-project-file-route-table-density="compact-rows"
                      >
                        <div className="grid h-7 items-center gap-2 border-b border-outline-variant bg-surface-container px-2 text-[0.62rem] font-medium text-on-surface-variant max-lg:hidden lg:grid-cols-[10rem_7rem_minmax(0,1fr)_2rem]">
                          <span>边界</span>
                          <span>状态</span>
                          <span>路径</span>
                          <span className="text-right">打开</span>
                        </div>
                        {projectFileRouteGroups.map((group: any) => {
                          const GroupIcon = group.icon;
                          return (
                            <details
                              key={group.id}
                              className="group border-b border-outline-variant last:border-b-0"
                              data-builder-project-file-route-group={group.id}
                              data-builder-project-file-route-group-density="collapsed-table-section"
                              data-builder-project-file-route-group-state="collapsed-default"
                              data-builder-project-nova-metadata={group.id === "metadata" ? "true" : undefined}
                            >
                              <summary
                                className="focus-ring grid min-h-8 min-w-0 cursor-pointer list-none items-center gap-2 bg-surface-container px-2 py-1 transition hover:bg-surface-container-high lg:grid-cols-[10rem_7rem_minmax(0,1fr)_2rem] [&::-webkit-details-marker]:hidden"
                                data-builder-project-file-route-group-summary="single-row"
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-surface-container-highest text-primary">
                                    <GroupIcon aria-hidden className="size-3" />
                                  </span>
                                  <span className="truncate font-medium text-on-surface">{group.title}</span>
                                </span>
                                <span className="min-w-0 truncate font-mono text-[0.62rem] tabular-nums text-on-surface-variant lg:justify-self-start">
                                  {group.countLabel}
                                </span>
                                <span className="min-w-0 truncate text-[0.68rem] text-on-surface-variant">{group.detail}</span>
                                <span className="flex items-center justify-end gap-1 text-[0.62rem] text-on-surface-variant">
                                  <span>{group.routes.length}</span>
                                  <ChevronRight aria-hidden className="size-3.5 transition-transform group-open:rotate-90" />
                                </span>
                              </summary>
                              <div className="divide-y divide-outline-variant border-t border-outline-variant/70" data-builder-project-file-route-details="deferred">
                                {group.routes.map((route: any) => {
                                  const RouteIcon = route.icon;
                                  return (
                                    <button
                                      key={route.id}
                                      type="button"
                                      className="focus-ring grid min-h-8 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-2 py-1 text-left text-xs transition hover:bg-surface-container-high lg:grid-cols-[10rem_7rem_minmax(0,1fr)_2rem]"
                                      title={`${route.title}: ${route.path}`}
                                      data-builder-project-file-route={route.id}
                                      data-builder-project-file-route-filter={route.filter}
                                      data-builder-project-file-route-density="compact-row"
                                      onClick={() => {
                                        setProjectExplorerFilter(route.filter);
                                        setProjectExplorerQuery(route.query);
                                        if (route.nodeId) {
                                          setSelectedProjectExplorerNodeId(route.nodeId);
                                        }
                                      }}
                                    >
                                      <span className="flex min-w-0 items-center gap-2">
                                        <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-primary">
                                          <RouteIcon aria-hidden className="size-3" />
                                        </span>
                                        <span className="truncate font-medium text-on-surface">{route.title}</span>
                                      </span>
                                      <span className="hidden min-w-0 lg:block">
                                        {route.badge ? (
                                          <StateLabel
                                            variant={group.id === "generated" ? "secondary" : "outline"}
                                            className="max-w-full truncate text-[0.58rem]"
                                            label={route.badge}
                                          />
                                        ) : (
                                          <span className="text-[0.66rem] text-on-surface-variant">-</span>
                                        )}
                                      </span>
                                      <span className="hidden min-w-0 truncate font-mono text-[0.66rem] text-on-surface-variant lg:block">{route.path}</span>
                                      <span className="sr-only">{route.detail}</span>
                                      <ArrowRight aria-hidden className="size-3.5 shrink-0 justify-self-end text-on-surface-variant" />
                                    </button>
                                  );
                                })}
                              </div>
                            </details>
                          );
                        })}
                      </div>
                    </section>

                    <section
                      className="mt-4 rounded-2xl border border-outline-variant bg-surface-container p-2.5"
                      data-builder-project-save-manifest=""
                      data-builder-project-save-manifest-density="compact-save-settings"
                      data-builder-project-save-root={activeProject.rootPath ? "disk" : "managed-default"}
                    >
                      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-xs font-semibold text-on-surface">保存到本地文件夹</h3>
                            <StateLabel
                              showQuiet
                              variant={saved ? "secondary" : "destructive"}
                              label={saved ? "已同步" : "待同步"}
                            />
                            <span className="text-[0.66rem] text-on-surface-variant">
                              源码 / 生成 / .nova 一次同步
                            </span>
                          </div>
                          <p className="mt-1 truncate text-[0.68rem] text-on-surface-variant">
                            保存项目会写入可追踪源码、生成目标和本地编辑器元数据。
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 px-2.5 text-xs"
                          data-builder-project-save-manifest-run=""
                          loading={diskBusy || runningProjectTask?.actionId === "save-project"}
                          onClick={() => enqueueProjectTask("save-project")}
                        >
                          <Save aria-hidden className="size-3.5" />
                          保存并同步
                        </Button>
                      </div>

                      <div
                        className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5 text-xs"
                        data-builder-project-save-manifest-summary=""
                        data-builder-project-save-manifest-summary-density="inline-chips"
                      >
                        {[
                          { scope: "source" as const, label: "源码", count: projectSaveManifestItems.filter((item: any) => item.scope === "source").length },
                          { scope: "generated" as const, label: "生成", count: projectSaveManifestItems.filter((item: any) => item.scope === "generated").length },
                          { scope: "metadata" as const, label: ".nova", count: projectSaveManifestItems.filter((item: any) => item.scope === "metadata").length },
                        ].map((group: any) => (
                          <button
                            key={group.scope}
                            type="button"
                            className="focus-ring inline-flex h-7 min-w-0 items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low px-2 text-[0.68rem] transition hover:bg-surface-container-high"
                            data-builder-project-save-manifest-scope={group.scope}
                            data-builder-project-save-manifest-scope-density="inline-chip"
                            onClick={() => {
                              setProjectExplorerFilter(group.scope === "source" ? "all" : group.scope === "generated" ? "build" : "meta");
                              setProjectExplorerQuery("");
                            }}
                          >
                            <span className="font-mono text-on-surface">{group.count}</span>
                            <span className="truncate text-on-surface-variant">{group.label}</span>
                          </button>
                        ))}
                      </div>

                      <div
                        className="mt-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low"
                        data-builder-project-save-plan=""
                        data-builder-project-save-plan-density="compact-table"
                        data-builder-project-save-plan-count={projectSavePlanSteps.length}
                        data-builder-project-save-plan-pending-count={projectSavePlanSteps.reduce((total: any, step: any) => total + step.pendingCount, 0)}
                      >
                        <div className="grid min-h-8 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-outline-variant px-2.5 py-1.5">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="text-xs font-semibold text-on-surface">保存计划</span>
                            <span className="truncate text-[0.66rem] text-on-surface-variant">
                              阶段表按源码、生成目标和本地状态排列。
                            </span>
                          </div>
                          <StateBadge
                            variant={projectSourceDirty ? "destructive" : "secondary"}
                            className="shrink-0 text-[0.58rem]"
                            label={projectSourceDirty ? "待同步" : "就绪"}
                            signal={Boolean(projectSourceDirty)}
                            data-builder-project-save-plan-state=""
                          />
                        </div>
                        <div
                          className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(10rem,auto)] items-center gap-2 border-b border-outline-variant bg-surface-container px-2.5 py-1.5 text-[0.66rem]"
                          data-builder-project-save-plan-route={activeProjectSavePlanStep?.id ?? "none"}
                          data-builder-project-save-plan-route-filter={projectExplorerFilter}
                          data-builder-project-save-plan-route-query={projectExplorerQuery}
                        >
                          <span className="min-w-0 truncate text-on-surface-variant">
                            {activeProjectSavePlanStep ? `当前定位：${activeProjectSavePlanStep.title}` : "未定位阶段"}
                          </span>
                          <span className="min-w-0 truncate text-right font-mono text-on-surface" data-builder-project-save-plan-route-path="">
                            {activeProjectSavePlanStep?.path ?? "源码 / 生成 / .nova"}
                          </span>
                        </div>
                        <div className="divide-y divide-outline-variant" data-builder-project-save-plan-list="" data-builder-project-save-plan-list-density="row-table">
                          {projectSavePlanSteps.map((step: any, index: any) => {
                            const StepIcon = step.icon;
                            const ready = step.status === "ready";
                            return (
                              <button
                                key={step.id}
                                type="button"
                                className={cn(
                                  "focus-ring grid min-h-10 w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 px-2.5 py-1.5 text-left text-xs transition hover:bg-surface-container-high",
                                  step.status === "warning" ? "bg-destructive/5" : "bg-transparent",
                                )}
                                data-builder-project-save-plan-step={step.id}
                                data-builder-project-save-plan-step-scope={step.scope}
                                data-builder-project-save-plan-step-status={step.status}
                                data-builder-project-save-plan-step-pending-count={step.pendingCount}
                                data-builder-project-save-plan-step-index={index + 1}
                                data-builder-project-save-plan-step-density="compact-row"
                                data-builder-project-save-plan-open={step.id}
                                onClick={() => openProjectSavePlanStep(step)}
                              >
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                                  <StepIcon aria-hidden className="size-3.5" />
                                </span>
                                <span className="grid min-w-0 grid-cols-[minmax(0,8rem)_minmax(0,1fr)] items-center gap-2">
                                  <span className="flex min-w-0 items-center gap-1.5">
                                    <span className="truncate font-medium text-on-surface">{step.title}</span>
                                    <StateBadge
                                      variant={ready ? "secondary" : step.status === "warning" ? "destructive" : "outline"}
                                      className="shrink-0 text-[0.56rem]"
                                      label={ready ? "就绪" : step.status === "warning" ? `${step.pendingCount} 待同步` : "待生成"}
                                      signal={!ready}
                                    />
                                  </span>
                                  <span className="hidden min-w-0 truncate text-[0.66rem] text-on-surface-variant lg:block">{step.detail}</span>
                                </span>
                                <span className="hidden min-w-0 text-right lg:block">
                                  <span className="block truncate font-mono text-[0.64rem] text-on-surface" data-builder-project-save-plan-path="">
                                    {step.path}
                                  </span>
                                  <span className="block text-[0.58rem] text-on-surface-variant">
                                    {step.itemCount} 项 · {projectSourceScopeLabel(step.scope)}
                                  </span>
                                </span>
                                <ArrowRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <details
                        className="group mt-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low"
                        data-builder-project-save-manifest-list=""
                        data-builder-project-save-manifest-list-density="collapsed-rows"
                        data-builder-project-save-manifest-list-state="collapsed-default"
                      >
                        <summary className="focus-ring flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 px-2.5 py-1.5 text-xs transition hover:bg-surface-container-high [&::-webkit-details-marker]:hidden">
                          <span className="flex min-w-0 items-center gap-2">
                            <ChevronRight aria-hidden className="size-3.5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-90" />
                            <span className="truncate font-medium text-on-surface">完整写入清单</span>
                            <CountReadout label={`${projectSaveManifestItems.length} 项`} count={projectSaveManifestItems.length} className="text-[0.58rem]" />
                          </span>
                          <span className="truncate text-[0.66rem] text-on-surface-variant">展开查看每个路径</span>
                        </summary>
                        <div className="divide-y divide-outline-variant border-t border-outline-variant bg-surface-container-lowest" data-builder-project-save-manifest-item-list="">
                          {projectSaveManifestItems.map((item: any) => {
                            const ItemIcon = item.icon;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                className="focus-ring grid min-h-9 w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-2.5 py-1.5 text-left text-xs transition hover:bg-surface-container-high"
                                data-builder-project-save-manifest-item={item.id}
                                data-builder-project-save-manifest-item-scope={item.scope}
                                data-builder-project-save-manifest-item-density="compact-row"
                                onClick={() => {
                                  setProjectExplorerQuery(item.path);
                                  setProjectExplorerFilter(item.scope === "generated" ? "build" : item.scope === "metadata" ? "meta" : "all");
                                }}
                              >
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                                  <ItemIcon aria-hidden className="size-3.5" />
                                </span>
                                <span className="grid min-w-0 grid-cols-[minmax(0,8rem)_minmax(0,1fr)] items-center gap-2">
                                  <span className="flex min-w-0 items-center gap-1.5">
                                    <span className="truncate font-medium text-on-surface">{item.title}</span>
                                    {/* Scope is a category, not a state; a pill would spend the eye's budget on taxonomy. */}
                                    <span className="shrink-0 text-[0.56rem] text-on-surface-variant">
                                      {item.scope === "source" ? "源码" : item.scope === "generated" ? "生成" : ".nova"}
                                    </span>
                                  </span>
                                  <span className="hidden min-w-0 truncate text-[0.66rem] text-on-surface-variant lg:block">{item.detail}</span>
                                </span>
                                <span className="hidden min-w-0 max-w-[18rem] truncate text-right font-mono text-[0.64rem] text-on-surface-variant xl:block">{item.path}</span>
                              </button>
                            );
                          })}
                        </div>
                      </details>
                    </section>

                    <section className="mt-4 rounded-[22px] border border-outline-variant bg-surface-container p-4" data-builder-project-workspace-metadata="">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-on-surface">本地项目元数据</h3>
                          <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                            `.nova` 存放编辑器状态、工作区索引、检查点、构建记录和运行日志，项目源码仍以 `nova.project.json`、`ui/`、`rust/` 为主。
                          </p>
                        </div>
                        <span className="text-[0.68rem] text-on-surface-variant">.nova</span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs md:grid-cols-2">
                        <PathRow label="项目清单" value={projectDiskPath(activeProject.rootPath, "nova.project.json") || "保存后生成"} />
                        <PathRow label="工作区" value={projectDiskPath(activeProject.rootPath, ".nova", "workspace.json") || ".nova/workspace.json"} />
                        <PathRow label="编辑器状态" value={projectDiskPath(activeProject.rootPath, ".nova", "editor-state.json") || ".nova/editor-state.json"} />
                        <PathRow label="检查点" value={`${diskCheckpoints.length} 个磁盘版本`} />
                      </div>
                    </section>
                  </div>
                </section>
              </div>
            </div>
            </div>
  );
}
