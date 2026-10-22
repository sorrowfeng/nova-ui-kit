import { Braces, Download, FileImage, FileJson, Monitor, Save, Settings2, Terminal } from "lucide-react";
import {
  fileNameFromPath,
  projectDiskPath,
  projectRelativePath,
  projectUiDiskFileName,
  type ProjectFileRouteGroup,
  type ProjectSourceOverviewRow,
} from "./monolith-module";
import { normalizeReleaseVersion } from "./release";
import type { DesignerFile, DesignerProject, EditorProjectCheckpoint } from "./types-project";

/** Pure builders for the Project page file-route map and source overview. */
export type ProjectFileSaveState = {
  readonly fileId: string;
  readonly currentFingerprint: string;
  readonly savedFingerprint: string | undefined;
  readonly dirty: boolean;
};

export type ProjectFileSaveStates = ReadonlyMap<string, ProjectFileSaveState>;

export type ProjectFileRouteGroupsInput = {
  readonly activeProject: DesignerProject;
  readonly diskCheckpoints: readonly EditorProjectCheckpoint[];
};

/**
 * Display label for a project file scope. Scope names on the wire are English
 * ("source" / "generated" / "metadata"); the Chinese UI shows the ownership
 * word. Unknown scopes fall back to the id so a new one stays visible.
 */
export function projectSourceScopeLabel(scope: string): string {
  const labels: Record<string, string> = {
    source: "源码",
    generated: "生成",
    metadata: ".nova",
    runtime: "运行",
    build: "构建",
  };
  return labels[scope] ?? scope;
}

export function buildProjectFileRouteGroups(input: ProjectFileRouteGroupsInput): ProjectFileRouteGroup[] {
  const { activeProject, diskCheckpoints } = input;
  const projectPath = (...segments: string[]) => projectDiskPath(activeProject.rootPath, ...segments) || projectRelativePath(...segments);

  return [
    {
      id: "source",
      title: "源码与设计输入",
      detail: "这些文件应该进入版本控制，是项目复用和协作的主数据。",
      countLabel: `${activeProject.files.length} UI / ${activeProject.rustCommands.length} 命令`,
      icon: FileJson,
      routes: [
        {
          id: "source-manifest",
          title: "项目 manifest",
          detail: "项目名称、窗口索引、发布设置、资源和逻辑注册表。",
          path: projectPath("nova.project.json"),
          query: "nova.project.json",
          filter: "all",
          nodeId: "manifest",
          badge: "源码",
          icon: FileJson,
        },
        {
          id: "source-ui",
          title: "UI 文件",
          detail: "每个窗口是独立 JSON，适合评审、复制和版本 diff。",
          path: projectPath("ui"),
          query: "ui/",
          filter: "ui",
          nodeId: "ui-folder",
          badge: `${activeProject.files.length}`,
          icon: Monitor,
        },
        {
          id: "source-rust",
          title: "Rust 逻辑",
          detail: "可绑定槽函数、模块、Cargo 依赖和源码映射。",
          path: projectPath("rust", "logic.rs"),
          query: "logic.rs",
          filter: "rust",
          nodeId: "rust-logic",
          badge: `${activeProject.rustModules.length} 模块`,
          icon: Braces,
        },
        {
          id: "source-backend",
          title: "后端集成",
          detail: "Rust native、C++ FFI、sidecar 或 HTTP 集成定义。",
          path: projectPath("backend", "integrations.json"),
          query: "integrations.json",
          filter: "backend",
          nodeId: "backend-integrations",
          badge: `${activeProject.backendIntegrations.length}`,
          icon: Terminal,
        },
        {
          id: "source-assets",
          title: "资源目录",
          detail: "资源索引和导入素材，生成目标会按引用复制。",
          path: projectPath("assets"),
          query: "assets/",
          filter: "assets",
          nodeId: "assets-folder",
          badge: `${activeProject.assets.length}`,
          icon: FileImage,
        },
      ],
    },
    {
      id: "generated",
      title: "生成目标与运行证据",
      detail: "由保存、检查、运行和打包任务生成，可重新产出，不再作为单独 UI 导出入口。",
      countLabel: activeProject.outputExePath ? "exe 就绪" : "待构建",
      icon: Download,
      routes: [
        {
          id: "generated-app",
          title: "生成 app 工程",
          detail: "完整 Vite + React + Tauri 目标工程，用于 exe 和安装包构建。",
          path: projectPath("app"),
          query: "app/",
          filter: "build",
          nodeId: "app-folder",
          badge: "生成",
          icon: Download,
        },
        {
          id: "generated-tauri-config",
          title: "桌面壳配置",
          detail: "窗口类型、标题栏、图标、bundle target 和签名配置。",
          path: projectPath("app", "src-tauri", "tauri.conf.json"),
          query: "tauri.conf.json",
          filter: "build",
          nodeId: "app-tauri-conf",
          badge: "tauri",
          icon: FileJson,
        },
        {
          id: "generated-release",
          title: "release 输出",
          detail: activeProject.outputExePath ? "最新生成的桌面端 exe。" : "构建后写入 target/release 和 bundle 输出目录。",
          path: activeProject.outputExePath || projectPath("app", "src-tauri", "target", "release"),
          query: activeProject.outputExePath ? fileNameFromPath(activeProject.outputExePath) : "target release",
          filter: "build",
          nodeId: activeProject.outputExePath ? "app-release-exe" : "app-folder",
          badge: activeProject.outputExePath ? "exe" : "待构建",
          icon: Download,
        },
        {
          id: "generated-builds",
          title: "构建记录",
          detail: "bundle manifest、installer smoke 结果和发布证据。",
          path: projectPath(".nova", "builds"),
          query: "builds/",
          filter: "build",
          nodeId: "nova-builds",
          badge: "证据",
          icon: FileJson,
        },
        {
          id: "generated-runtime",
          title: "运行日志",
          detail: "双击式桌面运行会话的 stdout/stderr 和状态记录。",
          path: projectPath(".nova", "runtime"),
          query: "runtime/",
          filter: "build",
          nodeId: "nova-runtime",
          badge: "日志",
          icon: Terminal,
        },
      ],
    },
    {
      id: "metadata",
      title: ".nova 本地元数据",
      detail: "类似 .vscode 的项目本地状态：可复用索引、打开状态、任务、检查点和流水线。",
      countLabel: `${diskCheckpoints.length} 检查点`,
      icon: Settings2,
      routes: [
        {
          id: "metadata-workspace",
          title: "workspace.json",
          detail: "工作区索引、文件树摘要、活动窗口和生成目标状态。",
          path: projectPath(".nova", "workspace.json"),
          query: "workspace.json",
          filter: "meta",
          nodeId: "nova-workspace",
          badge: "可跟踪",
          icon: FileJson,
        },
        {
          id: "metadata-editor-state",
          title: "editor-state.json",
          detail: "打开标签、停靠栏、Rust 编辑器、检查器和底部输出状态。",
          path: projectPath(".nova", "editor-state.json"),
          query: "editor-state.json",
          filter: "meta",
          nodeId: "nova-editor-state",
          badge: "本地",
          icon: Settings2,
        },
        {
          id: "metadata-checkpoints",
          title: "检查点/",
          detail: "命名磁盘版本，可比较并恢复项目快照。",
          path: projectPath(".nova", "checkpoints"),
          query: "checkpoints/",
          filter: "meta",
          nodeId: "nova-checkpoints",
          badge: `${diskCheckpoints.length}`,
          icon: Save,
        },
        {
          id: "metadata-pipelines",
          title: "pipelines/",
          detail: "发布流水线每一步的输入、日志、产物和复跑证据。",
          path: projectPath(".nova", "pipelines"),
          query: "pipelines/",
          filter: "build",
          nodeId: "nova-pipelines",
          badge: "运行",
          icon: FileJson,
        },
        {
          id: "metadata-tasks",
          title: "tasks/",
          detail: "后台任务队列、日志索引和重启恢复状态。",
          path: projectPath(".nova", "tasks"),
          query: "tasks/",
          filter: "build",
          nodeId: "nova-tasks",
          badge: "队列",
          icon: Terminal,
        },
        {
          id: "metadata-applies",
          title: "applies/",
          detail: "应用生成文件前的快照，方便撤回和审计。",
          path: projectPath(".nova", "applies"),
          query: "applies/",
          filter: "meta",
          nodeId: "nova-applies",
          badge: "快照",
          icon: FileJson,
        },
        {
          id: "metadata-dependency-graph",
          title: "dependency-graph.json",
          detail: "源码到生成目标的依赖图和变更影响缓存。",
          path: projectPath(".nova", "dependency-graph.json"),
          query: "dependency-graph.json",
          filter: "meta",
          nodeId: "nova-dependency-graph",
          badge: "图谱",
          icon: FileJson,
        },
      ],
    },
  ];
}

export type ProjectSourceOverviewInput = {
  readonly activeProject: DesignerProject;
  readonly activeFile: DesignerFile;
  readonly fileSaveStates: ProjectFileSaveStates;
  readonly projectSettingsDirty: boolean;
  readonly projectSourceDirty: boolean;
  readonly rustLogicDirty: boolean;
  readonly diskCheckpoints: readonly EditorProjectCheckpoint[];
};

export function buildProjectSourceOverviewRows(input: ProjectSourceOverviewInput): ProjectSourceOverviewRow[] {
  const { activeProject, activeFile, fileSaveStates, projectSettingsDirty, projectSourceDirty, rustLogicDirty, diskCheckpoints } = input;
  const projectPath = (...segments: string[]) => projectDiskPath(activeProject.rootPath, ...segments) || projectRelativePath(...segments);
  const uiRows = activeProject.files.map((file) => {
    const fileDirty = Boolean(fileSaveStates.get(file.id)?.dirty);
    const diskFileName = projectUiDiskFileName(file);
    return {
      id: `source-ui-${file.id}`,
      title: file.name,
      kind: "UI 文件",
      detail: `${file.items.length} 控件 · ${file.page.width} x ${file.page.height} · ${file.page.windowKind}`,
      path: projectPath("ui", diskFileName),
      relativePath: projectRelativePath("ui", diskFileName),
      scope: "source" as const,
      status: fileDirty ? "dirty" as const : "clean" as const,
      statusLabel: fileDirty ? "未保存" : file.id === activeFile.id ? "当前编辑" : "已同步",
      icon: FileJson,
      filter: "ui" as const,
      nodeId: `ui-${file.id}`,
      query: file.name,
      actionLabel: file.id === activeFile.id ? "继续编辑" : "打开 UI",
      fileId: file.id,
    };
  });

  return [
    {
      id: "source-manifest-overview",
      title: "nova.project.json",
      kind: "项目清单",
      detail: "UI 文件索引、发布配置、Rust commands、资源和后端集成的主索引。",
      path: projectPath("nova.project.json"),
      relativePath: projectRelativePath("nova.project.json"),
      scope: "source" as const,
      status: projectSettingsDirty ? "dirty" as const : "clean" as const,
      statusLabel: projectSettingsDirty ? "设置未保存" : "已同步",
      icon: FileJson,
      filter: "all" as const,
      nodeId: "manifest",
      query: "nova.project.json",
      actionLabel: "定位清单",
    },
    ...uiRows,
    {
      id: "source-rust-logic-overview",
      title: "logic.rs",
      kind: "Rust 逻辑",
      detail: `${activeProject.rustCommands.length} 个命令 · ${activeProject.rustModules.length} 个模块 · ${activeProject.cargoDependencies.length} 个依赖`,
      path: projectPath("rust", "logic.rs"),
      relativePath: projectRelativePath("rust", "logic.rs"),
      scope: "source" as const,
      status: rustLogicDirty ? "dirty" as const : "clean" as const,
      statusLabel: rustLogicDirty ? "未保存" : "已同步",
      icon: Braces,
      filter: "rust" as const,
      nodeId: "rust-logic",
      query: "logic.rs",
      actionLabel: "打开逻辑",
    },
    {
      id: "source-backend-overview",
      title: "integrations.json",
      kind: "后端集成",
      detail: `${activeProject.backendIntegrations.length} 个集成 · ${activeProject.backendIntegrations.filter((integration) => integration.enabled).length} 个启用`,
      path: projectPath("backend", "integrations.json"),
      relativePath: projectRelativePath("backend", "integrations.json"),
      scope: "source" as const,
      status: "clean" as const,
      statusLabel: "连接配置",
      icon: Terminal,
      filter: "backend" as const,
      nodeId: "backend-integrations",
      query: "integrations.json",
      actionLabel: "编辑连接",
    },
    {
      id: "source-assets-overview",
      title: "assets.json",
      kind: "资源索引",
      detail: `${activeProject.assets.length} 个资源引用，生成目标按索引复制素材。`,
      path: projectPath("assets", "assets.json"),
      relativePath: projectRelativePath("assets", "assets.json"),
      scope: "source" as const,
      status: activeProject.assets.length > 0 ? "clean" as const : "pending" as const,
      statusLabel: activeProject.assets.length > 0 ? "已同步" : "暂无资源",
      icon: FileImage,
      filter: "assets" as const,
      nodeId: "assets-manifest",
      query: "assets.json",
      actionLabel: "查看资源",
    },
    {
      id: "source-release-overview",
      title: "release 配置",
      kind: "发布设置",
      detail: `${activeProject.releaseConfig.appName} · ${activeProject.releaseConfig.windowKind} · ${activeProject.releaseConfig.titlebarStyle}`,
      path: projectPath("nova.project.json"),
      relativePath: projectRelativePath("nova.project.json"),
      scope: "source" as const,
      status: projectSettingsDirty ? "dirty" as const : "clean" as const,
      statusLabel: projectSettingsDirty ? "未保存" : `v${normalizeReleaseVersion(activeProject.releaseConfig.version)}`,
      icon: Settings2,
      filter: "all" as const,
      nodeId: "manifest",
      query: "release",
      actionLabel: "编辑发布",
    },
    {
      id: "metadata-editor-state-overview",
      title: ".nova/editor-state.json",
      kind: "编辑器状态",
      detail: "打开标签、Dock、画布视口、Rust 编辑位置、任务过滤和本地偏好。",
      path: projectPath(".nova", "editor-state.json"),
      relativePath: projectRelativePath(".nova", "editor-state.json"),
      scope: "metadata" as const,
      status: projectSettingsDirty || projectSourceDirty ? "dirty" as const : "clean" as const,
      statusLabel: projectSettingsDirty || projectSourceDirty ? "等待保存" : "已同步",
      icon: Settings2,
      filter: "meta" as const,
      nodeId: "nova-editor-state",
      query: "editor-state.json",
      actionLabel: "查看状态",
    },
    {
      id: "metadata-checkpoints-overview",
      title: ".nova/checkpoints/",
      kind: "检查点",
      detail: `${diskCheckpoints.length} 个磁盘版本，可用于比较保存前后的项目状态。`,
      path: projectPath(".nova", "checkpoints"),
      relativePath: projectRelativePath(".nova", "checkpoints"),
      scope: "metadata" as const,
      status: diskCheckpoints.length > 0 ? "clean" as const : "pending" as const,
      statusLabel: diskCheckpoints.length > 0 ? `${diskCheckpoints.length} 个版本` : "尚无版本",
      icon: Save,
      filter: "meta" as const,
      nodeId: "nova-checkpoints",
      query: "checkpoints",
      actionLabel: "查看版本",
    },
    {
      id: "generated-app-overview",
      title: activeProject.outputExePath ? fileNameFromPath(activeProject.outputExePath) : "app/",
      kind: "生成目标",
      detail: activeProject.outputExePath ? "最新 release exe，可从项目树定位运行产物。" : "保存或构建后生成 Vite + React + Tauri 目标工程。",
      path: activeProject.outputExePath || projectPath("app"),
      relativePath:
        activeProject.rootPath && activeProject.outputExePath?.startsWith(activeProject.rootPath)
          ? activeProject.outputExePath.slice(activeProject.rootPath.length).replace(/^[/\\]+/, "") || "."
          : projectRelativePath("app"),
      scope: "generated" as const,
      status: activeProject.outputExePath ? "generated" as const : "pending" as const,
      statusLabel: activeProject.outputExePath ? "exe 已生成" : "待生成",
      icon: Download,
      filter: "build" as const,
      nodeId: activeProject.outputExePath ? "app-release-exe" : "app-folder",
      query: activeProject.outputExePath ? fileNameFromPath(activeProject.outputExePath) : "app/",
      actionLabel: activeProject.outputExePath ? "定位 exe" : "打开构建",
    },
  ];
}
