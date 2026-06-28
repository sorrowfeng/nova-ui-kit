import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BuilderDockTab<T extends string> = {
  value: T;
  label: string;
  icon: LucideIcon;
  badge?: ReactNode;
};

export function ProjectDock<T extends string>({
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
    <aside className="subtle-scrollbar h-full min-h-0 overflow-y-auto border-b border-outline-variant bg-surface-container xl:border-b-0 xl:border-r">
      <div className="sticky top-0 z-10 border-b border-outline-variant bg-surface-container/95 p-2 backdrop-blur">
        <DockTabList tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      </div>
      <div className="p-4">{children}</div>
    </aside>
  );
}

export function DockTabList<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  layout = "grid",
}: {
  tabs: BuilderDockTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  layout?: "grid" | "inline";
}) {
  return (
    <div className={cn(layout === "inline" ? "flex min-w-0 flex-wrap gap-1" : "grid grid-cols-2 gap-1")}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            className={cn(
              "focus-ring flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[0.68rem] font-medium transition",
              layout === "inline" && "min-h-9 flex-1 basis-24",
              active
                ? "bg-secondary-container text-secondary-container-foreground shadow-m3-1"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
            )}
            onClick={() => onTabChange(tab.value)}
          >
            <Icon aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">{tab.label}</span>
            {tab.badge ? <span className="shrink-0">{tab.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
