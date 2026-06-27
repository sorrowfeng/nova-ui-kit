import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Boxes,
  Component,
  Database,
  FormInput,
  LayoutDashboard,
  MousePointerClick,
  Navigation,
  PanelsTopLeft,
  Settings,
  Sparkles,
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
    title: "界面编辑器",
    description: "通过拖拽组件构建桌面界面，并导出结构和 React 片段。",
    category: "构建",
    icon: PanelsTopLeft,
    tags: ["拖拽", "画布", "属性面板", "导出", "Tauri"],
  },
  {
    id: "buttons",
    title: "按钮",
    description: "操作层级、意图表达、加载、禁用、图标按钮和组合按钮。",
    category: "基础",
    icon: MousePointerClick,
    tags: ["主按钮", "次按钮", "文本按钮", "危险操作", "描边", "加载", "图标"],
  },
  {
    id: "forms",
    title: "表单控件",
    description: "输入框、选择器、开关、滑杆、分段控件和日期选择。",
    category: "输入",
    icon: FormInput,
    tags: ["输入框", "多行输入", "选择器", "组合框", "复选框", "单选", "开关", "滑杆", "日历"],
  },
  {
    id: "navigation",
    title: "导航",
    description: "标签页、面包屑、命令面板、下拉菜单和侧栏导航项。",
    category: "结构",
    icon: Navigation,
    tags: ["标签页", "面包屑", "侧栏", "命令面板", "下拉菜单"],
  },
  {
    id: "feedback",
    title: "反馈",
    description: "提示、警告、对话框、抽屉、工具提示、气泡、进度和骨架屏。",
    category: "浮层",
    icon: Bell,
    tags: ["提示", "警告", "对话框", "抽屉", "提示气泡", "气泡卡片", "进度", "骨架屏"],
  },
  {
    id: "data-display",
    title: "数据展示",
    description: "徽标、头像、卡片、统计卡、表格、空状态和活动流。",
    category: "内容",
    icon: Database,
    tags: ["徽标", "头像", "卡片", "统计", "表格", "空状态", "时间线"],
  },
  {
    id: "patterns",
    title: "应用模式",
    description: "桌面设置、账号面板、通知中心、可搜索列表、仪表盘和表单校验。",
    category: "模式",
    icon: LayoutDashboard,
    tags: ["设置", "账号", "通知", "搜索列表", "仪表盘", "校验"],
  },
];

export const workspaceSections = [
  {
    title: "组件库",
    icon: Boxes,
    items: showcaseNavItems.slice(0, 3),
  },
  {
    title: "交互",
    icon: Component,
    items: showcaseNavItems.slice(3, 5),
  },
  {
    title: "产品界面",
    icon: Sparkles,
    items: showcaseNavItems.slice(5),
  },
];

export const utilityNavItems = [
  { title: "设计令牌", icon: Component },
  { title: "设置", icon: Settings },
];
