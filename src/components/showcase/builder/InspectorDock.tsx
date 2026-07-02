import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BuilderDockTab } from "./ProjectDock";
import { DockTabList } from "./ProjectDock";
import { cn } from "@/lib/utils";

export function InspectorDock<T extends string>({
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
        className="relative z-10 flex h-full min-h-0 flex-col items-center border-t border-outline-variant bg-surface-container xl:border-l xl:border-t-0"
        data-builder-readable-dock="right"
        data-builder-side-dock="inspector"
        data-builder-side-dock-collapsed="true"
      >
        <button
          type="button"
          className="focus-ring mt-2 flex size-9 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
          aria-label="展开右侧属性面板"
          title="展开属性面板"
          data-builder-right-dock-expand=""
          data-builder-dock-collapse-toggle="right"
          onClick={() => onCollapsedChange?.(false)}
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>
        <div className="mt-2 flex w-full flex-1 flex-col items-center gap-1 px-1.5" role="tablist" aria-label="折叠属性面板">
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
      className="subtle-scrollbar relative z-10 h-full min-h-0 overflow-x-hidden overflow-y-auto border-t border-outline-variant bg-surface-container xl:border-l xl:border-t-0"
      data-builder-readable-dock="right"
      data-builder-side-dock="inspector"
      data-builder-side-dock-collapsed="false"
    >
      <div className="sticky top-0 z-10 border-b border-outline-variant bg-surface-container/95 p-2 backdrop-blur">
        <div className="flex min-w-0 items-center gap-1.5">
          {onCollapsedChange ? (
            <button
              type="button"
              className="focus-ring flex size-8 shrink-0 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
              aria-label="收起右侧属性面板"
              title="收起属性面板"
              data-builder-right-dock-collapse=""
              data-builder-dock-collapse-toggle="right"
              onClick={() => onCollapsedChange(true)}
            >
              <ChevronRight aria-hidden className="size-4" />
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            <DockTabList tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
          </div>
        </div>
      </div>
      <div className="p-3">{children}</div>
    </aside>
  );
}
