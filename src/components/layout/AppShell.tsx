import { useState } from "react";
import type { ReactNode } from "react";
import type { ShowcaseId, ShowcaseNavItem } from "@/data/components";
import type { Density, ThemeMode, ThemeScheme } from "@/App";
import { InspectorPanel } from "@/components/layout/InspectorPanel";
import { NavigationRail } from "@/components/layout/NavigationRail";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Topbar } from "@/components/layout/Topbar";
import { WindowTitlebar } from "@/components/layout/WindowTitlebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type AppShellProps = {
  activeId: ShowcaseId;
  filteredItems: ShowcaseNavItem[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: ShowcaseId) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  scheme: ThemeScheme;
  onSchemeChange: (scheme: ThemeScheme) => void;
  density: Density;
  onDensityChange: (value: Density) => void;
  onOpenCommand: () => void;
  onToast: () => void;
  children: ReactNode;
};

export function AppShell({
  activeId,
  filteredItems,
  searchQuery,
  onSearchChange,
  onSelect,
  theme,
  onThemeChange,
  scheme,
  onSchemeChange,
  density,
  onDensityChange,
  onOpenCommand,
  onToast,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (id: ShowcaseId) => {
    onSelect(id);
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-surface text-on-surface" data-density={density}>
      <WindowTitlebar />

      <div className="flex min-h-0 flex-1">
        <NavigationRail
          activeId={activeId}
          items={filteredItems}
          onSelect={onSelect}
          onOpenCommand={onOpenCommand}
          onToast={onToast}
        />

        <Sidebar
          activeId={activeId}
          filteredItems={filteredItems}
          onSelect={onSelect}
          className="hidden lg:flex"
        />

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[286px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>导航</SheetTitle>
              <SheetDescription>组件库导航</SheetDescription>
            </SheetHeader>
            <Sidebar activeId={activeId} filteredItems={filteredItems} onSelect={handleSelect} className="w-full border-r-0" />
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
            density={density}
            onDensityChange={onDensityChange}
            onOpenCommand={onOpenCommand}
            onOpenMobileNav={() => setMobileOpen(true)}
            onToast={onToast}
          />
          <div className="flex min-h-0 flex-1">
            <main className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto bg-surface-container-lowest">
              <div className="mx-auto w-full max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8">{children}</div>
            </main>
            <InspectorPanel
              activeId={activeId}
              theme={theme}
              onThemeChange={onThemeChange}
              scheme={scheme}
              onSchemeChange={onSchemeChange}
              density={density}
              onDensityChange={onDensityChange}
              onToast={onToast}
            />
          </div>
          <StatusBar theme={theme} scheme={scheme} density={density} />
        </div>
      </div>
    </div>
  );
}
