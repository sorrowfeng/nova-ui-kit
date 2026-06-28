import type { ReactNode } from "react";
import type { BuilderDockTab } from "./ProjectDock";
import { DockTabList } from "./ProjectDock";

export function OutputDock<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  children,
}: {
  tabs: BuilderDockTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  children: ReactNode;
}) {
  return (
    <section className="h-[128px] shrink-0 border-t border-outline-variant bg-surface-container-lowest" data-builder-output-dock="">
      <div className="grid h-full gap-3 px-4 py-3 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
        <DockTabList tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
        <div className="min-h-0 overflow-auto rounded-2xl border border-outline-variant bg-surface-container p-3">
          {children}
        </div>
      </div>
    </section>
  );
}
