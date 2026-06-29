import { useEffect, useMemo, useState } from "react";
import {
  Box,
  CheckCircle2,
  Download,
  FileDown,
  FilePlus2,
  FolderOpen,
  HelpCircle,
  Monitor,
  Play,
  Save,
  Settings,
  Sparkles,
  Terminal,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CommandPalette, type CommandPaletteAction } from "@/components/layout/CommandPalette";
import { ShowcasePage } from "@/components/showcase/ShowcasePage";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { showcaseNavItems, type ShowcaseId } from "@/data/components";
import { dispatchNovaEditorCommand, type NovaEditorCommand } from "@/lib/editor-commands";

export type ThemeMode = "light" | "dark" | "system";
export type ThemeScheme = "violet" | "blue" | "green";
export type Density = "compact" | "cozy" | "comfortable";

const editorCommandActions: CommandPaletteAction[] = [
  {
    id: "editor-action-new-project",
    title: "新建项目",
    description: "从模板创建新的桌面 UI 项目。",
    category: "Project",
    icon: FilePlus2,
    tags: ["new", "project", "template", "新建", "模板"],
    command: "new-project",
  },
  {
    id: "editor-action-open-project",
    title: "打开项目",
    description: "选择已有项目目录并恢复编辑状态。",
    category: "Project",
    icon: FolderOpen,
    tags: ["open", "workspace", "folder", "打开", "项目"],
    command: "open-project",
  },
  {
    id: "editor-action-save-project",
    title: "保存项目",
    description: "保存当前项目、UI 文件、逻辑和元数据。",
    category: "Project",
    icon: Save,
    tags: ["save", "sync", "disk", "保存", "同步"],
    command: "save-project",
    shortcut: "Ctrl+S",
  },
  {
    id: "editor-action-mode-design",
    title: "Design 模式",
    description: "回到画布、组件和属性编辑工作区。",
    category: "Mode",
    icon: Sparkles,
    tags: ["design", "canvas", "navigator", "设计", "画布"],
    command: "mode-design",
  },
  {
    id: "editor-action-mode-logic",
    title: "Logic 模式",
    description: "编辑 Rust commands、状态和后端集成。",
    category: "Mode",
    icon: Settings,
    tags: ["logic", "rust", "state", "backend", "逻辑", "后端"],
    command: "mode-logic",
  },
  {
    id: "editor-action-mode-build",
    title: "Build 模式",
    description: "查看任务、检查、构建输出和发布配置。",
    category: "Mode",
    icon: Terminal,
    tags: ["build", "tasks", "checks", "构建", "任务"],
    command: "mode-build",
  },
  {
    id: "editor-action-mode-preview",
    title: "Preview 模式",
    description: "预览当前 UI 并模拟已绑定的交互。",
    category: "Mode",
    icon: Monitor,
    tags: ["preview", "simulate", "预览", "模拟"],
    command: "mode-preview",
  },
  {
    id: "editor-action-mode-export",
    title: "Export 模式",
    description: "查看生成代码、导出格式和目标文件。",
    category: "Mode",
    icon: FileDown,
    tags: ["export", "code", "files", "导出", "代码"],
    command: "mode-export",
  },
  {
    id: "editor-action-run-event",
    title: "运行当前事件",
    description: "模拟选中控件的事件并打开日志。",
    category: "Run",
    icon: Play,
    tags: ["run", "event", "simulate", "logs", "运行", "事件"],
    command: "run-selected-event",
    shortcut: "F5",
  },
  {
    id: "editor-action-check-all",
    title: "运行全部检查",
    description: "执行前端和 Rust 检查，准备发布构建。",
    category: "Build",
    icon: Terminal,
    tags: ["check", "frontend", "rust", "检查"],
    command: "quick-check-all",
  },
  {
    id: "editor-action-build-exe",
    title: "构建 release exe",
    description: "编译当前目标应用的桌面可执行文件。",
    category: "Build",
    icon: Download,
    tags: ["build", "exe", "release", "构建", "发布"],
    command: "build-exe",
    shortcut: "Ctrl+Shift+B",
  },
  {
    id: "editor-action-bundle-installer",
    title: "打包安装器",
    description: "生成 MSI / NSIS 等安装包输出。",
    category: "Build",
    icon: Box,
    tags: ["bundle", "installer", "msi", "nsis", "安装包"],
    command: "bundle-installer",
  },
  {
    id: "editor-action-help",
    title: "编辑器指南",
    description: "在 Locator 中打开可用命令和构建入口。",
    category: "Help",
    icon: HelpCircle,
    tags: ["help", "guide", "commands", "帮助", "指南"],
    command: "help-guide",
  },
];

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }
  const stored = window.localStorage.getItem("nova-theme-mode") ?? window.localStorage.getItem("nova-theme");
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function getInitialScheme(): ThemeScheme {
  if (typeof window === "undefined") {
    return "violet";
  }
  const stored = window.localStorage.getItem("nova-theme-scheme");
  if (stored === "violet" || stored === "blue" || stored === "green") {
    return stored;
  }
  return "violet";
}

function App() {
  const [activeId, setActiveId] = useState<ShowcaseId>("builder");
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [scheme, setScheme] = useState<ThemeScheme>(() => getInitialScheme());
  const [density, setDensity] = useState<Density>("cozy");
  const [commandOpen, setCommandOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [pendingEditorCommand, setPendingEditorCommand] = useState<NovaEditorCommand | null>(null);
  const [systemDark, setSystemDark] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.dataset.theme = scheme;
    window.localStorage.setItem("nova-theme-mode", theme);
    window.localStorage.setItem("nova-theme-scheme", scheme);
  }, [scheme, systemDark, theme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (activeId !== "builder" || !pendingEditorCommand) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      dispatchNovaEditorCommand(pendingEditorCommand);
      setPendingEditorCommand(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeId, pendingEditorCommand]);

  const filteredItems = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) {
      return showcaseNavItems;
    }
    return showcaseNavItems.filter((item) =>
      [item.title, item.description, item.category, ...item.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [searchQuery]);

  const activeItem = showcaseNavItems.find((item) => item.id === activeId) ?? showcaseNavItems[0];

  const showToast = () => {
    setToastOpen(false);
    window.setTimeout(() => setToastOpen(true), 20);
  };

  const runBuilderCommand = (command: NovaEditorCommand) => {
    setActiveId("builder");
    setPendingEditorCommand(command);
  };

  return (
    <TooltipProvider delayDuration={350}>
      <ToastProvider swipeDirection="right">
        <AppShell
          activeId={activeId}
          filteredItems={filteredItems}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelect={setActiveId}
          theme={theme}
          onThemeChange={setTheme}
          scheme={scheme}
          onSchemeChange={setScheme}
          density={density}
          onDensityChange={setDensity}
          onOpenCommand={() => setCommandOpen(true)}
          onSaveProject={() => runBuilderCommand("save-project")}
          onExportProject={() => runBuilderCommand("mode-export")}
          onToast={showToast}
        >
          <ShowcasePage item={activeItem} onOpenCommand={() => setCommandOpen(true)} onToast={showToast} />
        </AppShell>

        <CommandPalette
          open={commandOpen}
          onOpenChange={setCommandOpen}
          items={showcaseNavItems}
          onSelect={setActiveId}
          actions={editorCommandActions}
          onRunAction={runBuilderCommand}
        />

        <Toast open={toastOpen} onOpenChange={setToastOpen}>
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/12 text-primary">
            <CheckCircle2 aria-hidden className="size-4" />
          </div>
          <div>
            <ToastTitle>预览已同步</ToastTitle>
            <ToastDescription>Nova UI Kit 已更新本地交互状态。</ToastDescription>
          </div>
          <ToastClose aria-label="关闭通知" />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    </TooltipProvider>
  );
}

export default App;
