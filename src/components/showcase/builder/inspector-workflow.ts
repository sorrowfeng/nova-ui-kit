import {
  AlertTriangle,
  Braces,
  Copy,
  Download,
  Layers,
  MousePointer2,
  Play,
  Settings2,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import type { BuilderItem } from "./types";

export type InspectorWorkflowTone = "primary" | "ready" | "warning" | "danger" | "muted";

export type InspectorWorkflowStep = {
  id: string;
  title: string;
  detail: string;
  badge: string;
  icon: LucideIcon;
  actionLabel: string;
  tone: InspectorWorkflowTone;
  disabled?: boolean;
  onAction: () => void;
};

export type InspectorWorkflowInput = {
  selectedItems: BuilderItem[];
  selectedItem: BuilderItem | null;
  selectedPropertyIssues: Array<{ prop: string }>;
  selectedPropertyAutoFixCount: number;
  selectedEventName: string | null;
  selectedEventCommandName: string | null;
  selectedLatestSimulatorStatus?: string;
  selectedLatestSimulatorMessage?: string;
  selectedControlReverseDependencySummary?: string;
  selectedControlReverseDependencyLabel?: string;
  rightDockTab: string;
  leftDockTab: string;
  paletteCount: number;
  nextWorkflowTitle?: string;
  nextWorkflowDetail?: string;
  nextWorkflowStatusLabel?: string;
  nextWorkflowFailed?: boolean;
  getItemSummary: (item: BuilderItem) => string;
  openSelectedProperties: () => void;
  openSelectedConnections: () => void;
  openImpact: () => void;
  openNavigator: () => void;
  openComponents: () => void;
  openTaskDock: () => void;
  duplicateSelected: () => void;
  requestDeleteSelected: () => void;
  applySelectedPropertyAutoFix: () => void;
  createAndBindBackendIntegrationCommand: () => void;
  runSelectedEvent: () => void;
  sanitizeRustCommandName: (name: string) => string;
};

export function buildInspectorWorkflowSteps(input: InspectorWorkflowInput): InspectorWorkflowStep[] {
  const {
    selectedItems,
    selectedItem,
    selectedPropertyIssues,
    selectedPropertyAutoFixCount,
    selectedEventName,
    selectedEventCommandName,
    selectedLatestSimulatorStatus,
    selectedLatestSimulatorMessage,
    selectedControlReverseDependencySummary,
    selectedControlReverseDependencyLabel,
    rightDockTab,
    paletteCount,
    nextWorkflowTitle,
    nextWorkflowDetail,
    nextWorkflowStatusLabel,
    nextWorkflowFailed,
    getItemSummary,
    openSelectedProperties,
    openSelectedConnections,
    openImpact,
    openNavigator,
    openComponents,
    openTaskDock,
    duplicateSelected,
    requestDeleteSelected,
    applySelectedPropertyAutoFix,
    createAndBindBackendIntegrationCommand,
    runSelectedEvent,
    sanitizeRustCommandName,
  } = input;

  if (selectedItems.length > 1) {
    return [
      {
        id: "batch-properties",
        title: "批量布局",
        detail: `已选择 ${selectedItems.length} 个控件；共享编辑会保留在属性面板中。`,
        badge: `${selectedItems.length} 个已选`,
        icon: Layers,
        actionLabel: "属性",
        tone: rightDockTab === "properties" ? "primary" : "ready",
        onAction: openSelectedProperties,
      },
      {
        id: "batch-duplicate",
        title: "复制",
        detail: "复制所选控件及当前布局和绑定。",
        badge: "复制",
        icon: Copy,
        actionLabel: "复制",
        tone: "ready",
        onAction: duplicateSelected,
      },
      {
        id: "batch-impact",
        title: "影响图谱",
        detail: "检查哪些生成文件和验证步骤依赖当前选择。",
        badge: "图谱",
        icon: AlertTriangle,
        actionLabel: "影响",
        tone: rightDockTab === "impact" ? "primary" : "muted",
        onAction: openImpact,
      },
      {
        id: "batch-delete",
        title: "删除",
        detail: `${selectedItems.filter((item) => item.locked).length} 个锁定控件会被跳过。`,
        badge: "危险",
        icon: Trash2,
        actionLabel: "删除",
        tone: "danger",
        onAction: requestDeleteSelected,
      },
    ];
  }

  if (selectedItem) {
    return [
      {
        id: "selected-properties",
        title: selectedPropertyIssues.length > 0 ? "修复属性" : "属性",
        detail:
          selectedPropertyIssues.length > 0
            ? `发现 ${selectedPropertyIssues.length} 个问题；${selectedPropertyAutoFixCount} 个可立即修复。`
            : `${getItemSummary(selectedItem)} 可编辑布局和内容。`,
        badge: selectedPropertyIssues.length > 0 ? `${selectedPropertyIssues.length} 个问题` : "就绪",
        icon: selectedPropertyIssues.length > 0 ? AlertTriangle : Settings2,
        actionLabel: selectedPropertyAutoFixCount > 0 ? "立即修复" : "打开",
        tone: selectedPropertyIssues.length > 0 ? "warning" : rightDockTab === "properties" ? "primary" : "ready",
        onAction: selectedPropertyAutoFixCount > 0 ? applySelectedPropertyAutoFix : openSelectedProperties,
      },
      {
        id: "selected-connection",
        title: selectedEventName ? (selectedEventCommandName ? "事件" : "绑定事件") : "静态控件",
        detail: selectedEventName
          ? selectedEventCommandName
            ? `${selectedEventName} 调用 ${sanitizeRustCommandName(selectedEventCommandName)}。`
            : `${selectedEventName} 可用，但还没有 Rust 命令。`
          : "这个控件没有事件；Connections 会显示可用的下一步。",
        badge: selectedEventName ? (selectedEventCommandName ? "已绑定" : "待绑定") : "静态",
        icon: Braces,
        actionLabel: selectedEventName ? (selectedEventCommandName ? "打开" : "绑定") : "查看",
        tone: selectedEventName
          ? selectedEventCommandName
            ? rightDockTab === "connections"
              ? "primary"
              : "ready"
            : "warning"
          : "muted",
        onAction: selectedEventName
          ? selectedEventCommandName
            ? openSelectedConnections
            : createAndBindBackendIntegrationCommand
          : openSelectedConnections,
      },
      {
        id: "selected-run-event",
        title: selectedLatestSimulatorStatus ? "最近运行" : "运行验证",
        detail: selectedLatestSimulatorStatus
          ? `${selectedLatestSimulatorStatus}: ${selectedLatestSimulatorMessage ?? ""}`
          : selectedEventCommandName
            ? "执行已绑定的 Rust 命令并显示模拟器日志。"
            : "先绑定命令，之后即可运行这一步。",
        badge: selectedLatestSimulatorStatus ?? (selectedEventCommandName ? "就绪" : "阻塞"),
        icon: Play,
        actionLabel: selectedEventCommandName ? "运行" : "先绑定",
        tone: selectedLatestSimulatorStatus
          ? selectedLatestSimulatorStatus === "success"
            ? "primary"
            : "warning"
          : selectedEventCommandName
            ? "ready"
            : "muted",
        disabled: !selectedEventCommandName,
        onAction: runSelectedEvent,
      },
      {
        id: "selected-impact",
        title: "影响图谱",
        detail: selectedControlReverseDependencySummary ?? "显示该控件下游相关的文件、检查和生成输出。",
        badge: selectedControlReverseDependencyLabel ?? "图谱",
        icon: AlertTriangle,
        actionLabel: "影响",
        tone: rightDockTab === "impact" ? "primary" : "muted",
        onAction: openImpact,
      },
    ];
  }

  return [
    {
      id: "empty-select",
      title: "选择",
      detail: "使用导航或画布聚焦属性和连接工作流。",
      badge: "开始",
      icon: MousePointer2,
      actionLabel: "导航",
      tone: "primary",
      onAction: () => {
        openNavigator();
        openSelectedProperties();
      },
    },
    {
      id: "empty-components",
      title: "插入",
      detail: "打开组件库并把控件放入当前 UI 文件。",
      badge: `${paletteCount} 项`,
      icon: Layers,
      actionLabel: "组件",
      tone: "ready",
      onAction: openComponents,
    },
    {
      id: "empty-workflow",
      title: "构建流程",
      detail: nextWorkflowTitle ? `${nextWorkflowTitle}: ${nextWorkflowDetail ?? ""}` : "从工作流条执行保存、生成、验证和构建。",
      badge: nextWorkflowStatusLabel ?? "待开始",
      icon: Download,
      actionLabel: "任务",
      tone: nextWorkflowFailed ? "warning" : "muted",
      onAction: openTaskDock,
    },
  ];
}
