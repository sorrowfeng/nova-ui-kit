import { useState } from "react";
import type { ReactNode } from "react";
import type { ShowcaseId, ShowcaseNavItem } from "@/data/components";
import type { AppCopy } from "@/lib/i18n";
import type { AppLanguage, Density, ThemeMode, ThemeScheme } from "@/lib/preferences";
import { InspectorPanel } from "@/components/layout/InspectorPanel";
import { NavigationRail } from "@/components/layout/NavigationRail";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Topbar } from "@/components/layout/Topbar";
import { WindowTitlebar } from "@/components/layout/WindowTitlebar";
import type { NovaEditorCommand } from "@/lib/editor-commands";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AppShellProps = {
  activeId: ShowcaseId;
  filteredItems: ShowcaseNavItem[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: ShowcaseId) => void;
  copy: AppCopy;
  language: AppLanguage;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  scheme: ThemeScheme;
  onSchemeChange: (scheme: ThemeScheme) => void;
  density: Density;
  onDensityChange: (value: Density) => void;
  statusBarVisible: boolean;
  onOpenCommand: () => void;
  onOpenSettings: () => void;
  onRunEditorCommand: (command: NovaEditorCommand) => void;
  onSaveProject: () => void;
  onExportProject: () => void;
  onToast: () => void;
  children: ReactNode;
};

export function AppShell({
  activeId,
  filteredItems,
  searchQuery,
  onSearchChange,
  onSelect,
  copy,
  language,
  theme,
  onThemeChange,
  scheme,
  onSchemeChange,
  density,
  onDensityChange,
  statusBarVisible,
  onOpenCommand,
  onOpenSettings,
  onRunEditorCommand,
  onSaveProject,
  onExportProject,
  onToast,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const builderWorkspace = activeId === "builder";

  const handleSelect = (id: ShowcaseId) => {
    onSelect(id);
    setMobileOpen(false);
  };

  if (builderWorkspace) {
    return (
      <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-surface-container-lowest text-on-surface" data-density={density}>
        <WindowTitlebar copy={copy} onOpenSettings={onOpenSettings} onRunEditorCommand={onRunEditorCommand} />
        <main className="min-h-0 flex-1 overflow-hidden bg-surface-container-lowest">
          {children}
        </main>
        {statusBarVisible ? <StatusBar copy={copy} language={language} theme={theme} scheme={scheme} density={density} /> : null}
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-surface text-on-surface" data-density={density}>
      <WindowTitlebar copy={copy} onOpenSettings={onOpenSettings} onRunEditorCommand={onRunEditorCommand} />

      <div className="flex min-h-0 flex-1">
        <NavigationRail
          activeId={activeId}
          items={filteredItems}
          onSelect={onSelect}
          onOpenCommand={onOpenCommand}
          onOpenSettings={onOpenSettings}
          onRunEditorCommand={onRunEditorCommand}
          onToast={onToast}
          copy={copy}
        />

        <Sidebar
          activeId={activeId}
          filteredItems={filteredItems}
          onSelect={onSelect}
          onOpenSettings={onOpenSettings}
          onRunEditorCommand={onRunEditorCommand}
          copy={copy}
          className="hidden lg:flex"
        />

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[286px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>导航</SheetTitle>
              <SheetDescription>组件库导航</SheetDescription>
            </SheetHeader>
            <Sidebar
              activeId={activeId}
              filteredItems={filteredItems}
              onSelect={handleSelect}
              onOpenSettings={onOpenSettings}
              onRunEditorCommand={onRunEditorCommand}
              copy={copy}
              className="w-full border-r-0"
            />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col rounded-tl-[28px] bg-surface-container-lowest shadow-m3-1">
          <Topbar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            theme={theme}
            onThemeChange={onThemeChange}
            scheme={scheme}
            onSchemeChange={onSchemeChange}
            language={language}
            copy={copy}
            density={density}
            onDensityChange={onDensityChange}
            onOpenCommand={onOpenCommand}
            onOpenSettings={onOpenSettings}
            onSaveProject={onSaveProject}
            onExportProject={onExportProject}
            onOpenMobileNav={() => setMobileOpen(true)}
            onToast={onToast}
          />
          <div className="flex min-h-0 flex-1">
            <main className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto bg-surface-container-lowest">
              <div
                className={cn(
                  "mx-auto w-full px-4 py-5 sm:px-6 lg:px-8",
                  builderWorkspace ? "max-w-[1600px]" : "max-w-[1180px]",
                )}
              >
                {children}
              </div>
            </main>
            {builderWorkspace ? null : (
              <InspectorPanel
                activeId={activeId}
                copy={copy}
                language={language}
                theme={theme}
                onThemeChange={onThemeChange}
                scheme={scheme}
                onSchemeChange={onSchemeChange}
                density={density}
                onDensityChange={onDensityChange}
                onSaveProject={onSaveProject}
              />
            )}
          </div>
          {statusBarVisible ? <StatusBar copy={copy} language={language} theme={theme} scheme={scheme} density={density} /> : null}
        </div>
      </div>
    </div>
  );
}
