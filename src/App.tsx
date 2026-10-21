import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  CheckCircle2,
  Download,
  FilePlus2,
  FolderOpen,
  HelpCircle,
  Play,
  Save,
  Settings,
  Sparkles,
  Terminal,
} from "lucide-react";
import { AppSettingsPanel } from "@/components/layout/AppSettingsPanel";
import { AppShell } from "@/components/layout/AppShell";
import { CommandPalette, type CommandPaletteAction } from "@/components/layout/CommandPalette";
import { OnboardingGuide, isOnboardingCompleted, resetOnboarding } from "@/components/layout/OnboardingGuide";
import { KeyboardShortcutsOverlay } from "@/components/layout/KeyboardShortcutsOverlay";
const ShowcasePage = React.lazy(() => import("@/components/showcase/ShowcasePage").then((m) => ({ default: m.ShowcasePage })));
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toastIconClassName,
} from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { showcaseNavItems, type ShowcaseId } from "@/data/components";
import { getAppCopy, type AppCopy } from "@/lib/i18n";
import { dispatchNovaEditorCommand, type NovaEditorCommand } from "@/lib/editor-commands";
import { DEFAULT_APP_LANGUAGE, type AppLanguage, type Density, type FontScale, type MotionPreference, type ThemeMode, type ThemeScheme } from "@/lib/preferences";

const LANGUAGE_USER_SET_KEY = "nova-language-user-set";
const LANGUAGE_ZH_DEFAULT_MIGRATION_KEY = "nova-language-zh-default-migrated";

function createEditorCommandActions(copy: AppCopy): CommandPaletteAction[] {
  return [
  {
    id: "editor-action-open-sample",
    title: "打开示例项目",
    description: "一键载入带控件与命令绑定的演示工程",
    category: "项目",
    icon: Sparkles,
    tags: ["sample", "demo", "example", "示例", "模板"],
    command: "open-sample",
  },
  {
    id: "editor-action-show-shortcuts",
    title: "快捷键速查",
    description: "打开可搜索的键盘快捷键列表",
    category: "帮助",
    icon: HelpCircle,
    tags: ["help", "shortcut", "keyboard", "快捷键", "帮助"],
    command: "show-shortcuts",
  },
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
    id: "editor-action-mode-project",
    title: copy.commands.modeProject[0],
    description: copy.commands.modeProject[1],
    category: copy.commands.categories.mode,
    icon: FolderOpen,
    tags: ["project", "files", "metadata", "工程", "项目", "文件树"],
    command: "mode-project",
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
    return DEFAULT_APP_LANGUAGE;
  }
  const stored = window.localStorage.getItem("nova-language");
  const storedLanguage = stored === "zh-CN" || stored === "en-US" ? stored : null;
  const userSetLanguage = window.localStorage.getItem(LANGUAGE_USER_SET_KEY) === "true";
  if (storedLanguage && userSetLanguage) {
    window.localStorage.setItem(LANGUAGE_ZH_DEFAULT_MIGRATION_KEY, "true");
    return storedLanguage;
  }
  if (!userSetLanguage) {
    window.localStorage.setItem(LANGUAGE_ZH_DEFAULT_MIGRATION_KEY, "true");
    window.localStorage.setItem("nova-language", DEFAULT_APP_LANGUAGE);
    return DEFAULT_APP_LANGUAGE;
  }
  window.localStorage.setItem(LANGUAGE_USER_SET_KEY, "false");
  window.localStorage.setItem(LANGUAGE_ZH_DEFAULT_MIGRATION_KEY, "true");
  window.localStorage.setItem("nova-language", DEFAULT_APP_LANGUAGE);
  return DEFAULT_APP_LANGUAGE;
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

function getInitialFontScale(): FontScale {
  if (typeof window === "undefined") {
    return "default";
  }
  const stored = window.localStorage.getItem("nova-font-scale");
  if (stored === "small" || stored === "default" || stored === "large") {
    return stored;
  }
  return "default";
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
  const [fontScale, setFontScale] = useState<FontScale>(() => getInitialFontScale());
  const [statusBarVisible, setStatusBarVisible] = useState(() => getInitialBoolean("nova-status-bar-visible", true));
  const [toolbarLabelsVisible, setToolbarLabelsVisible] = useState(() => getInitialBoolean("nova-toolbar-labels-visible", true));
  const [commandHintsVisible, setCommandHintsVisible] = useState(() => getInitialBoolean("nova-command-hints-visible", true));
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => getInitialBoolean("nova-auto-save-enabled", true));
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => getInitialBoolean("nova-notifications-enabled", true));
  const [compactSidebar, setCompactSidebar] = useState(() => getInitialBoolean("nova-sidebar-compact", false));
  const [focusModeEnabled, setFocusModeEnabled] = useState(() => getInitialBoolean("nova-focus-mode-enabled", false));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => !isOnboardingCompleted());
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [pendingEditorCommand, setPendingEditorCommand] = useState<NovaEditorCommand | null>(null);
  const [systemDark, setSystemDark] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const copy = useMemo(() => getAppCopy(language), [language]);
  const editorCommandActions = useMemo(() => createEditorCommandActions(copy), [copy]);

  const handleLanguageChange = useCallback((nextLanguage: AppLanguage) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_USER_SET_KEY, "true");
      window.localStorage.setItem(LANGUAGE_ZH_DEFAULT_MIGRATION_KEY, "true");
    }
    setLanguage(nextLanguage);
  }, []);

  const runEditorCommand = useCallback((command: NovaEditorCommand) => {
    if (command === "open-app-settings") {
      setCommandOpen(false);
      setSettingsOpen(true);
      return;
    }
    if (command === "show-shortcuts") {
      setCommandOpen(false);
      setShortcutsOpen(true);
      return;
    }
    if (command === "show-onboarding") {
      setCommandOpen(false);
      resetOnboarding();
      setOnboardingOpen(true);
      return;
    }
    setActiveId("builder");
    setPendingEditorCommand(command);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (event.key === "F1" || (event.key === "?" && !typing && !event.ctrlKey && !event.metaKey)) {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }
      if (event.key === "Escape" && shortcutsOpen) {
        setShortcutsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcutsOpen]);

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
    document.documentElement.dataset.toolbarLabels = toolbarLabelsVisible ? "visible" : "icons";
    document.documentElement.dataset.commandHints = commandHintsVisible ? "visible" : "hidden";
    document.documentElement.dataset.autoSave = autoSaveEnabled ? "enabled" : "manual";
    document.documentElement.dataset.notifications = notificationsEnabled ? "enabled" : "muted";
    document.documentElement.dataset.sidebar = compactSidebar ? "compact" : "full";
    document.documentElement.dataset.focusMode = focusModeEnabled ? "enabled" : "disabled";
    document.documentElement.dataset.fontScale = fontScale;
    document.documentElement.dataset.density = density;
    document.documentElement.dataset.language = language;
    document.documentElement.lang = language;
    window.localStorage.setItem("nova-theme-mode", theme);
    window.localStorage.setItem("nova-theme-scheme", scheme);
    window.localStorage.setItem("nova-density", density);
    window.localStorage.setItem("nova-language", language);
    window.localStorage.setItem("nova-motion", motion);
    window.localStorage.setItem("nova-font-scale", fontScale);
    window.localStorage.setItem("nova-status-bar-visible", String(statusBarVisible));
    window.localStorage.setItem("nova-toolbar-labels-visible", String(toolbarLabelsVisible));
    window.localStorage.setItem("nova-command-hints-visible", String(commandHintsVisible));
    window.localStorage.setItem("nova-auto-save-enabled", String(autoSaveEnabled));
    window.localStorage.setItem("nova-notifications-enabled", String(notificationsEnabled));
    window.localStorage.setItem("nova-sidebar-compact", String(compactSidebar));
    window.localStorage.setItem("nova-focus-mode-enabled", String(focusModeEnabled));
  }, [autoSaveEnabled, commandHintsVisible, compactSidebar, density, focusModeEnabled, fontScale, language, motion, notificationsEnabled, scheme, statusBarVisible, systemDark, theme, toolbarLabelsVisible]);

  const resetPreferences = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_USER_SET_KEY, "false");
      window.localStorage.setItem(LANGUAGE_ZH_DEFAULT_MIGRATION_KEY, "true");
    }
    setLanguage(DEFAULT_APP_LANGUAGE);
    setTheme("system");
    setScheme("violet");
    setDensity("cozy");
    setMotion("full");
    setFontScale("default");
    setStatusBarVisible(true);
    setToolbarLabelsVisible(true);
    setCommandHintsVisible(true);
    setAutoSaveEnabled(true);
    setNotificationsEnabled(true);
    setCompactSidebar(false);
    setFocusModeEnabled(false);
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
    if (!notificationsEnabled) {
      return;
    }
    setToastOpen(false);
    window.setTimeout(() => setToastOpen(true), 20);
  };

  const effectiveStatusBarVisible = statusBarVisible && !focusModeEnabled;
  const effectiveToolbarLabelsVisible = toolbarLabelsVisible && !focusModeEnabled;
  const effectiveCommandHintsVisible = commandHintsVisible && !focusModeEnabled;
  const effectiveCompactSidebar = compactSidebar || focusModeEnabled;

  return (
    <TooltipProvider delayDuration={350}>
      <ToastProvider swipeDirection="up">
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
          statusBarVisible={effectiveStatusBarVisible}
          toolbarLabelsVisible={effectiveToolbarLabelsVisible}
          commandHintsVisible={effectiveCommandHintsVisible}
          autoSaveEnabled={autoSaveEnabled}
          notificationsEnabled={notificationsEnabled}
          compactSidebar={effectiveCompactSidebar}
          onOpenCommand={() => setCommandOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onRunEditorCommand={runEditorCommand}
          onSaveProject={() => runEditorCommand("save-project")}
          onToast={showToast}
        >
          <Suspense fallback={null}>
            <ShowcasePage item={activeItem} onOpenCommand={() => setCommandOpen(true)} onToast={showToast} />
          </Suspense>
        </AppShell>

        <AppSettingsPanel
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          copy={copy}
          language={language}
          onLanguageChange={handleLanguageChange}
          theme={theme}
          onThemeChange={setTheme}
          scheme={scheme}
          onSchemeChange={setScheme}
          density={density}
          onDensityChange={setDensity}
          statusBarVisible={statusBarVisible}
          onStatusBarVisibleChange={setStatusBarVisible}
          toolbarLabelsVisible={toolbarLabelsVisible}
          onToolbarLabelsVisibleChange={setToolbarLabelsVisible}
          commandHintsVisible={commandHintsVisible}
          onCommandHintsVisibleChange={setCommandHintsVisible}
          autoSaveEnabled={autoSaveEnabled}
          onAutoSaveEnabledChange={setAutoSaveEnabled}
          notificationsEnabled={notificationsEnabled}
          onNotificationsEnabledChange={setNotificationsEnabled}
          compactSidebar={compactSidebar}
          onCompactSidebarChange={setCompactSidebar}
          focusModeEnabled={focusModeEnabled}
          onFocusModeEnabledChange={setFocusModeEnabled}
          fontScale={fontScale}
          onFontScaleChange={setFontScale}
          motion={motion}
          onMotionChange={setMotion}
          onResetDefaults={resetPreferences}
        />

        <OnboardingGuide
          open={onboardingOpen}
          onOpenChange={setOnboardingOpen}
          onOpenSample={() => runEditorCommand("open-sample")}
          onShowShortcuts={() => setShortcutsOpen(true)}
        />
        <KeyboardShortcutsOverlay open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

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
          <div className={toastIconClassName}>
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
