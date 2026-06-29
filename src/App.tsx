import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CommandPalette } from "@/components/layout/CommandPalette";
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
