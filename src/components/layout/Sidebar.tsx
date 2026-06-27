import { SearchX, Sparkles } from "lucide-react";
import type { ShowcaseId, ShowcaseNavItem } from "@/data/components";
import { workspaceSections, utilityNavItems } from "@/data/components";
import { cn } from "@/lib/utils";

type SidebarProps = {
  activeId: ShowcaseId;
  filteredItems: ShowcaseNavItem[];
  onSelect: (id: ShowcaseId) => void;
  className?: string;
};

export function Sidebar({ activeId, filteredItems, onSelect, className }: SidebarProps) {
  const filteredIds = new Set(filteredItems.map((item) => item.id));

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-[304px] flex-col bg-surface-container-low",
        className,
      )}
    >
      <div className="flex h-20 shrink-0 items-center gap-3 px-5">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-m3-1">
          <Sparkles aria-hidden className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-medium">Nova UI Kit</p>
          <p className="truncate text-sm text-on-surface-variant">Material 3 桌面实验室</p>
        </div>
      </div>

      <div className="subtle-scrollbar flex-1 overflow-y-auto px-3 pb-4">
        {filteredItems.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-2 rounded-3xl border border-dashed border-outline-variant bg-surface-container p-5 text-center text-sm text-on-surface-variant">
            <SearchX aria-hidden className="size-5" />
            没有匹配的组件
          </div>
        ) : (
          <div className="space-y-5">
            {workspaceSections.map((section) => {
              const visibleItems = section.items.filter((item) => filteredIds.has(item.id));
              if (visibleItems.length === 0) {
                return null;
              }
              const SectionIcon = section.icon;
              return (
                <div key={section.title} className="space-y-2">
                  <div className="flex items-center gap-2 px-4 text-xs font-medium text-on-surface-variant">
                    <SectionIcon aria-hidden className="size-3.5" />
                    {section.title}
                  </div>
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const active = item.id === activeId;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => onSelect(item.id)}
                          className={cn(
                            "focus-ring m3-state-layer group flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-sm font-medium transition-colors",
                            active
                              ? "bg-secondary-container text-secondary-container-foreground"
                              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                          )}
                        >
                          <Icon aria-hidden className={cn("size-5", active && "text-secondary-container-foreground")} />
                          <span className="min-w-0 flex-1 truncate">{item.title}</span>
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full opacity-0 transition-opacity",
                              active && "bg-primary opacity-100",
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="shrink-0 p-3">
        <div className="space-y-1">
          {utilityNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.title}
                className="focus-ring m3-state-layer flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              >
                <Icon aria-hidden className="size-5" />
                <span className="truncate">{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
