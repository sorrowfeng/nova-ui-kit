import type { LucideIcon } from "lucide-react";
import {
  Component,
  PanelsTopLeft,
  Settings,
} from "lucide-react";

export type ShowcaseId =
  | "builder"
  | "buttons"
  | "forms"
  | "navigation"
  | "feedback"
  | "data-display"
  | "patterns";

export type ShowcaseNavItem = {
  id: ShowcaseId;
  title: string;
  description: string;
  category: string;
  icon: LucideIcon;
  tags: string[];
};

export const showcaseNavItems: ShowcaseNavItem[] = [
  {
    id: "builder",
    title: "UI 编辑器",
    description: "新建项目、管理 UI 文件，并通过自由画布拖拽构建桌面界面。",
    category: "编辑器",
    icon: PanelsTopLeft,
    tags: ["项目", "UI 文件", "拖拽", "画布", "属性面板", "导出", "Tauri"],
  },
];

export const workspaceSections = [
  {
    title: "工作区",
    icon: PanelsTopLeft,
    items: showcaseNavItems,
  },
];

export const utilityNavItems = [
  { title: "项目设置", icon: Settings },
  { title: "构建输出", icon: Component },
];
