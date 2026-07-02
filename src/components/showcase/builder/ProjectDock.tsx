import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  collapsed = false,
  onCollapsedChange,
  children,
}: {
  tabs: BuilderDockTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  children: ReactNode;
}) {
  if (collapsed) {
    return (
      <aside
        className="flex h-full min-h-0 flex-col items-center border-b border-outline-variant bg-surface-container xl:border-b-0 xl:border-r"
        data-builder-readable-dock="left"
        data-builder-side-dock="project"
        data-builder-side-dock-active-tab={activeTab}
        data-builder-side-dock-collapsed="true"
      >
        <button
          type="button"
          className="focus-ring mt-2 flex size-9 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
          aria-label="展开左侧项目面板"
          title="展开项目面板"
          data-builder-left-dock-expand=""
          data-builder-dock-collapse-toggle="left"
          onClick={() => onCollapsedChange?.(false)}
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
        <div className="mt-2 flex w-full flex-1 flex-col items-center gap-1 px-1.5" role="tablist" aria-label="折叠项目面板">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                className={cn(
                  "focus-ring flex size-10 items-center justify-center rounded-xl transition",
                  active
                    ? "bg-secondary-container text-secondary-container-foreground shadow-m3-1"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                )}
                data-builder-dock-tab={tab.value}
                data-builder-dock-tab-active={active ? "true" : "false"}
                data-builder-dock-tab-layout="collapsed-rail"
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                title={tab.label}
                onClick={() => {
                  onTabChange(tab.value);
                  onCollapsedChange?.(false);
                }}
              >
                <Icon aria-hidden className="size-4" />
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="subtle-scrollbar h-full min-h-0 overflow-y-auto border-b border-outline-variant bg-surface-container xl:border-b-0 xl:border-r"
      data-builder-readable-dock="left"
      data-builder-side-dock="project"
      data-builder-side-dock-density="balanced-compact"
      data-builder-side-dock-active-tab={activeTab}
      data-builder-side-dock-collapsed="false"
    >
      <div className="sticky top-0 z-10 border-b border-outline-variant bg-surface-container/95 p-1.5 backdrop-blur">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="min-w-0 flex-1">
            <DockTabList tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
          </div>
          {onCollapsedChange ? (
            <button
              type="button"
              className="focus-ring flex size-8 shrink-0 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
              aria-label="收起左侧项目面板"
              title="收起项目面板"
              data-builder-left-dock-collapse=""
              data-builder-dock-collapse-toggle="left"
              onClick={() => onCollapsedChange(true)}
            >
              <ChevronLeft aria-hidden className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
      <div className="p-2" data-builder-side-dock-content-density="compact">
        {children}
      </div>
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
    <div className={cn(layout === "inline" ? "subtle-scrollbar flex min-w-0 gap-1 overflow-x-auto" : "grid grid-cols-2 gap-1")}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            data-builder-dock-tab={tab.value}
            data-builder-dock-tab-active={active ? "true" : "false"}
            data-builder-dock-tab-layout={layout}
            className={cn(
              "focus-ring flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.68rem] font-medium transition",
              layout === "inline" && "min-h-7 shrink-0 basis-auto px-2",
              active
                ? "bg-secondary-container text-secondary-container-foreground"
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
