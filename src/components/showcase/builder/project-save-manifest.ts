import { Braces, Download, FileImage, FileJson, Monitor, Save, Settings2 } from "lucide-react";
import {
  fileNameFromPath,
  projectDiskPath,
  projectRelativePath,
  type ProjectSaveManifestItem,
} from "./monolith-module";
import type { DesignerProject, EditorProjectCheckpoint } from "./types-project";

/** Pure builders for the 项目 page save manifest. */
export type ProjectSaveManifestInput = {
  readonly activeProject: DesignerProject;
  readonly diskCheckpoints: readonly EditorProjectCheckpoint[];
};

export function buildProjectSaveManifestItems(input: ProjectSaveManifestInput): ProjectSaveManifestItem[] {
  const { activeProject, diskCheckpoints } = input;
  return [
    {
      id: "manifest",
      title: "项目清单",
      detail: "项目名称、UI 文件索引、发布设置、命令注册表和资源引用。",
      path: projectDiskPath(activeProject.rootPath, "nova.project.json") || projectRelativePath("nova.project.json"),
      scope: "source",
      icon: FileJson,
    },
    {
      id: "ui",
      title: "UI 文件",
      detail: `${activeProject.files.length} 个窗口会保存为独立 JSON，便于版本控制和复用。`,
      path: projectDiskPath(activeProject.rootPath, "ui") || projectRelativePath("ui"),
      scope: "source",
      icon: Monitor,
    },
    {
      id: "rust",
      title: "Rust 逻辑",
      detail: `${activeProject.rustCommands.length} 个命令、${activeProject.rustModules.length} 个模块和 Cargo 依赖清单。`,
      path: projectDiskPath(activeProject.rootPath, "rust", "logic.rs") || projectRelativePath("rust", "logic.rs"),
      scope: "source",
      icon: Braces,
    },
    {
      id: "assets",
      title: "资源索引",
      detail: `${activeProject.assets.length} 个资源引用和可复制的本地素材。`,
      path: projectDiskPath(activeProject.rootPath, "assets") || projectRelativePath("assets"),
      scope: "source",
      icon: FileImage,
    },
    {
      id: "gitignore",
      title: "协作忽略规则",
      detail: "保留项目源码和可复用元数据，忽略依赖、构建产物、运行日志和临时缓存。",
      path: projectDiskPath(activeProject.rootPath, ".gitignore") || projectRelativePath(".gitignore"),
      scope: "metadata",
      icon: FileJson,
    },
    {
      id: "generated-app",
      title: "生成 app",
      detail: activeProject.outputExePath ? `包含最新 exe：${fileNameFromPath(activeProject.outputExePath)}` : "保存同步后生成 Tauri/Vite 目标应用目录。",
      path: projectDiskPath(activeProject.rootPath, "app") || projectRelativePath("app"),
      scope: "generated",
      icon: Download,
    },
    {
      id: "nova-workspace",
      title: ".nova 工作区索引",
      detail: "本地工作区、活动窗口、生成目标和文件树索引。",
      path: projectDiskPath(activeProject.rootPath, ".nova", "workspace.json") || projectRelativePath(".nova", "workspace.json"),
      scope: "metadata",
      icon: FileJson,
    },
    {
      id: "nova-editor-state",
      title: ".nova 编辑器状态",
      detail: "活动 UI、窗口壳、计数、源码路径和本地编辑状态。",
      path: projectDiskPath(activeProject.rootPath, ".nova", "editor-state.json") || projectRelativePath(".nova", "editor-state.json"),
      scope: "metadata",
      icon: Settings2,
    },
    {
      id: "nova-checkpoints",
      title: ".nova 检查点",
      detail: `${diskCheckpoints.length} 个磁盘版本，保存前后可用于回看差异。`,
      path: projectDiskPath(activeProject.rootPath, ".nova", "checkpoints") || projectRelativePath(".nova", "checkpoints"),
      scope: "metadata",
      icon: Save,
    },
  ];
}
