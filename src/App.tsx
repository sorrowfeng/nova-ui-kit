import { useCallback, useEffect, useMemo, useState } from "react";
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
import { AppSettingsPanel } from "@/components/layout/AppSettingsPanel";
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
import { getAppCopy, type AppCopy } from "@/lib/i18n";
import { dispatchNovaEditorCommand, type NovaEditorCommand } from "@/lib/editor-commands";
import type { AppLanguage, Density, MotionPreference, ThemeMode, ThemeScheme } from "@/lib/preferences";

function createEditorCommandActions(copy: AppCopy): CommandPaletteAction[] {
  return [
  {
    id: "editor-action-new-project",
    title: copy.commands.newProject[0],
    description: copy.commands.newProject[1],
    category: copy.commands.categories.project,
    icon: FilePlus2,
    tags: ["new", "project", "template", "新建", "模板"],
    command: "new-project",
  },
  {
    id: "editor-action-open-project",
    title: copy.commands.openProject[0],
    description: copy.commands.openProject[1],
    category: copy.commands.categories.project,
    icon: FolderOpen,
    tags: ["open", "workspace", "folder", "打开", "项目"],
    command: "open-project",
  },
  {
    id: "editor-action-save-project",
    title: copy.commands.saveProject[0],
    description: copy.commands.saveProject[1],
    category: copy.commands.categories.project,
    icon: Save,
    tags: ["save", "sync", "disk", "保存", "同步"],
    command: "save-project",
    shortcut: "Ctrl+S",
  },
  {
    id: "editor-action-app-settings",
    title: copy.commands.appSettings[0],
    description: copy.commands.appSettings[1],
    category: copy.commands.categories.app,
    icon: Settings,
    tags: ["settings", "preferences", "language", "theme", "设置", "语言", "主题"],
    command: "open-app-settings",
  },
  {
    id: "editor-action-mode-design",
    title: copy.commands.modeDesign[0],
    description: copy.commands.modeDesign[1],
    category: copy.commands.categories.mode,
    icon: Sparkles,
    tags: ["design", "canvas", "navigator", "设计", "画布"],
    command: "mode-design",
  },
  {
    id: "editor-action-mode-logic",
    title: copy.commands.modeLogic[0],
    description: copy.commands.modeLogic[1],
    category: copy.commands.categories.mode,
    icon: Settings,
    tags: ["logic", "rust", "state", "backend", "逻辑", "后端"],
    command: "mode-logic",
  },
  {
    id: "editor-action-mode-build",
    title: copy.commands.modeBuild[0],
    description: copy.commands.modeBuild[1],
    category: copy.commands.categories.mode,
    icon: Terminal,
    tags: ["build", "tasks", "checks", "构建", "任务"],
    command: "mode-build",
  },
  {
    id: "editor-action-project-settings",
    title: copy.commands.projectSettings[0],
    description: copy.commands.projectSettings[1],
    category: copy.commands.categories.project,
    icon: Settings,
    tags: ["project", "settings", "release", "项目", "设置", "发布"],
    command: "open-project-settings",
  },
  {
    id: "editor-action-project-files",
    title: copy.commands.projectFiles[0],
    description: copy.commands.projectFiles[1],
    category: copy.commands.categories.project,
    icon: FolderOpen,
    tags: ["project", "files", "navigator", "ui files", "项目文件", "导航"],
    command: "open-project-files",
  },
  {
    id: "editor-action-build-output",
    title: copy.commands.buildOutput[0],
    description: copy.commands.buildOutput[1],
    category: copy.commands.categories.build,
    icon: Terminal,
    tags: ["build", "output", "logs", "构建", "输出"],
    command: "open-build-output",
  },
  {
    id: "editor-action-mode-preview",
    title: copy.commands.modePreview[0],
    description: copy.commands.modePreview[1],
    category: copy.commands.categories.mode,
    icon: Monitor,
    tags: ["preview", "simulate", "预览", "模拟"],
    command: "mode-preview",
  },
  {
    id: "editor-action-mode-export",
    title: copy.commands.modeExport[0],
    description: copy.commands.modeExport[1],
    category: copy.commands.categories.mode,
    icon: FileDown,
    tags: ["export", "code", "files", "导出", "代码"],
    command: "mode-export",
  },
  {
    id: "editor-action-run-event",
    title: copy.commands.runEvent[0],
    description: copy.commands.runEvent[1],
    category: copy.commands.categories.run,
    icon: Play,
    tags: ["run", "event", "simulate", "logs", "运行", "事件"],
    command: "run-selected-event",
    shortcut: "F5",
  },
  {
    id: "editor-action-check-all",
    title: copy.commands.checkAll[0],
    description: copy.commands.checkAll[1],
    category: copy.commands.categories.build,
    icon: Terminal,
    tags: ["check", "frontend", "rust", "检查"],
    command: "quick-check-all",
  },
  {
    id: "editor-action-build-exe",
    title: copy.commands.buildExe[0],
    description: copy.commands.buildExe[1],
    category: copy.commands.categories.build,
    icon: Download,
    tags: ["build", "exe", "release", "构建", "发布"],
    command: "build-exe",
    shortcut: "Ctrl+Shift+B",
  },
  {
    id: "editor-action-bundle-installer",
    title: copy.commands.bundleInstaller[0],
    description: copy.commands.bundleInstaller[1],
    category: copy.commands.categories.build,
    icon: Box,
    tags: ["bundle", "installer", "msi", "nsis", "安装包"],
    command: "bundle-installer",
  },
  {
    id: "editor-action-help",
    title: copy.commands.help[0],
    description: copy.commands.help[1],
    category: copy.commands.categories.help,
    icon: HelpCircle,
    tags: ["help", "guide", "commands", "帮助", "指南"],
    command: "help-guide",
  },
  ];
}

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

function getInitialLanguage(): AppLanguage {
  if (typeof window === "undefined") {
    return "zh-CN";
  }
  const stored = window.localStorage.getItem("nova-language");
  if (stored === "zh-CN" || stored === "en-US") {
    return stored;
  }
  return "zh-CN";
}

function getInitialDensity(): Density {
  if (typeof window === "undefined") {
    return "cozy";
  }
  const stored = window.localStorage.getItem("nova-density");
  if (stored === "compact" || stored === "cozy" || stored === "comfortable") {
    return stored;
  }
  return "cozy";
}

function getInitialMotion(): MotionPreference {
  if (typeof window === "undefined") {
    return "full";
  }
  const stored = window.localStorage.getItem("nova-motion");
  if (stored === "full" || stored === "reduced") {
    return stored;
  }
  return "full";
}

function getInitialBoolean(key: string, fallback: boolean) {
  if (typeof window === "undefined") {
    return fallback;
  }
  const stored = window.localStorage.getItem(key);
  if (stored === "true") {
    return true;
  }
  if (stored === "false") {
    return false;
  }
  return fallback;
}

function isPrimaryShortcut(event: KeyboardEvent) {
  return (event.metaKey || event.ctrlKey) && !event.altKey;
}

function App() {
  const [activeId, setActiveId] = useState<ShowcaseId>("builder");
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState<AppLanguage>(() => getInitialLanguage());
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [scheme, setScheme] = useState<ThemeScheme>(() => getInitialScheme());
  const [density, setDensity] = useState<Density>(() => getInitialDensity());
  const [motion, setMotion] = useState<MotionPreference>(() => getInitialMotion());
  const [statusBarVisible, setStatusBarVisible] = useState(() => getInitialBoolean("nova-status-bar-visible", true));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [pendingEditorCommand, setPendingEditorCommand] = useState<NovaEditorCommand | null>(null);
  const [systemDark, setSystemDark] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const copy = useMemo(() => getAppCopy(language), [language]);
  const editorCommandActions = useMemo(() => createEditorCommandActions(copy), [copy]);

  const runEditorCommand = useCallback((command: NovaEditorCommand) => {
    if (command === "open-app-settings") {
      setCommandOpen(false);
      setSettingsOpen(true);
      return;
    }
    setActiveId("builder");
    setPendingEditorCommand(command);
  }, []);

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
    document.documentElement.dataset.motion = motion;
    document.documentElement.lang = language;
    window.localStorage.setItem("nova-theme-mode", theme);
    window.localStorage.setItem("nova-theme-scheme", scheme);
    window.localStorage.setItem("nova-density", density);
    window.localStorage.setItem("nova-language", language);
    window.localStorage.setItem("nova-motion", motion);
    window.localStorage.setItem("nova-status-bar-visible", String(statusBarVisible));
  }, [density, language, motion, scheme, statusBarVisible, systemDark, theme]);

  const resetPreferences = useCallback(() => {
    setLanguage("zh-CN");
    setTheme("system");
    setScheme("violet");
    setDensity("cozy");
    setMotion("full");
    setStatusBarVisible(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const primaryShortcut = isPrimaryShortcut(event);

      if (primaryShortcut && key === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
        return;
      }

      if (activeId === "builder") {
        return;
      }

      const routeEditorShortcut = (command: NovaEditorCommand) => {
        event.preventDefault();
        setCommandOpen(false);
        runEditorCommand(command);
      };

      if (primaryShortcut && key === "s") {
        routeEditorShortcut("save-project");
        return;
      }

      if (primaryShortcut && event.shiftKey && key === "b") {
        routeEditorShortcut("build-exe");
        return;
      }

      if (event.key === "F5") {
        routeEditorShortcut("run-selected-event");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeId, runEditorCommand]);

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

  return (
    <TooltipProvider delayDuration={350}>
      <ToastProvider swipeDirection="right">
        <AppShell
          activeId={activeId}
          filteredItems={filteredItems}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelect={setActiveId}
          copy={copy}
          language={language}
          theme={theme}
          onThemeChange={setTheme}
          scheme={scheme}
          onSchemeChange={setScheme}
          density={density}
          onDensityChange={setDensity}
          statusBarVisible={statusBarVisible}
          onOpenCommand={() => setCommandOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onRunEditorCommand={runEditorCommand}
          onSaveProject={() => runEditorCommand("save-project")}
          onExportProject={() => runEditorCommand("mode-export")}
          onToast={showToast}
        >
          <ShowcasePage item={activeItem} onOpenCommand={() => setCommandOpen(true)} onToast={showToast} />
        </AppShell>

        <AppSettingsPanel
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          copy={copy}
          language={language}
          onLanguageChange={setLanguage}
          theme={theme}
          onThemeChange={setTheme}
          scheme={scheme}
          onSchemeChange={setScheme}
          density={density}
          onDensityChange={setDensity}
          statusBarVisible={statusBarVisible}
          onStatusBarVisibleChange={setStatusBarVisible}
          motion={motion}
          onMotionChange={setMotion}
          onResetDefaults={resetPreferences}
        />

        <CommandPalette
          open={commandOpen}
          onOpenChange={setCommandOpen}
          items={showcaseNavItems}
          onSelect={setActiveId}
          actions={editorCommandActions}
          onRunAction={runEditorCommand}
          copy={copy}
        />

        <Toast open={toastOpen} onOpenChange={setToastOpen}>
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/12 text-primary">
            <CheckCircle2 aria-hidden className="size-4" />
          </div>
          <div>
            <ToastTitle>{copy.toast.title}</ToastTitle>
            <ToastDescription>{copy.toast.description}</ToastDescription>
          </div>
          <ToastClose aria-label={copy.toast.close} />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    </TooltipProvider>
  );
}

export default App;
