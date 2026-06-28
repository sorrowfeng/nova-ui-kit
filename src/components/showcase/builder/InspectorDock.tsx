import type { ReactNode } from "react";
import type { BuilderDockTab } from "./ProjectDock";
import { DockTabList } from "./ProjectDock";

export function InspectorDock<T extends string>({
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
    <aside className="subtle-scrollbar relative z-10 h-full min-h-0 overflow-y-auto border-t border-outline-variant bg-surface-container xl:border-l xl:border-t-0">
      <div className="sticky top-0 z-10 border-b border-outline-variant bg-surface-container/95 p-2 backdrop-blur">
        <DockTabList tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      </div>
      <div className="p-4">{children}</div>
    </aside>
  );
}
