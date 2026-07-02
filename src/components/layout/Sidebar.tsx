import { SearchX, Settings, Sparkles } from "lucide-react";
import type { ShowcaseId, ShowcaseNavItem } from "@/data/components";
import { workspaceSections, utilityNavItems } from "@/data/components";
import type { AppCopy } from "@/lib/i18n";
import type { NovaEditorCommand } from "@/lib/editor-commands";
import { cn } from "@/lib/utils";

type SidebarProps = {
  activeId: ShowcaseId;
  filteredItems: ShowcaseNavItem[];
  onSelect: (id: ShowcaseId) => void;
  onOpenSettings: () => void;
  onRunEditorCommand: (command: NovaEditorCommand) => void;
  copy: AppCopy;
  compact?: boolean;
  className?: string;
};

export function Sidebar({ activeId, filteredItems, onSelect, onOpenSettings, onRunEditorCommand, copy, compact = false, className }: SidebarProps) {
  const filteredIds = new Set(filteredItems.map((item) => item.id));

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col bg-surface-container-low transition-[width] duration-200",
        compact ? "w-[88px]" : "w-[304px]",
        className,
      )}
    >
      <div className={cn("flex h-20 shrink-0 items-center gap-3 px-5", compact && "justify-center px-3")}>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-m3-1">
          <Sparkles aria-hidden className="size-5" />
        </div>
        <div className={cn("min-w-0", compact && "sr-only")}>
          <p className="truncate text-base font-medium">{copy.appName}</p>
          <p className="truncate text-sm text-on-surface-variant">{copy.appSubtitle}</p>
        </div>
      </div>

      <div className="subtle-scrollbar flex-1 overflow-y-auto px-3 pb-4">
        {filteredItems.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-2 rounded-3xl border border-dashed border-outline-variant bg-surface-container p-5 text-center text-sm text-on-surface-variant">
            <SearchX aria-hidden className="size-5" />
            {copy.sidebar.empty}
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
                  <div className={cn("flex items-center gap-2 px-4 text-xs font-medium text-on-surface-variant", compact && "justify-center px-0")}>
                    <SectionIcon aria-hidden className="size-3.5" />
                    <span className={compact ? "sr-only" : ""}>{section.title === "工作区" ? copy.sidebar.workspace : section.title}</span>
                  </div>
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const active = item.id === activeId;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          title={item.title}
                          aria-label={item.title}
                          onClick={() => onSelect(item.id)}
                          className={cn(
                            "focus-ring m3-state-layer group relative flex w-full items-center text-left text-sm font-medium transition-colors",
                            compact ? "justify-center rounded-2xl px-0 py-3" : "gap-3 rounded-full px-4 py-3",
                            active
                              ? "bg-secondary-container text-secondary-container-foreground"
                              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                          )}
                        >
                          <Icon aria-hidden className={cn("size-5", active && "text-secondary-container-foreground")} />
                          <span className={cn("min-w-0 flex-1 truncate", compact && "sr-only")}>{item.title}</span>
                          <span
                            className={cn(
                              compact ? "absolute right-2 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity" : "h-1.5 w-1.5 rounded-full opacity-0 transition-opacity",
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
          <button
            type="button"
            onClick={onOpenSettings}
            title={copy.sidebar.appSettings}
            aria-label={copy.sidebar.appSettings}
            className={cn(
              "focus-ring m3-state-layer flex w-full items-center text-left text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface",
              compact ? "justify-center rounded-2xl px-0 py-3" : "gap-3 rounded-full px-4 py-3",
            )}
          >
            <Settings aria-hidden className="size-5" />
            <span className={cn("truncate", compact && "sr-only")}>{copy.sidebar.appSettings}</span>
          </button>
          {utilityNavItems.map((item) => {
            const Icon = item.icon;
            const title = item.command === "open-project-settings" ? copy.sidebar.projectSettings : item.command === "open-build-output" ? copy.sidebar.buildOutput : item.title;
            return (
              <button
                type="button"
                key={item.title}
                title={title}
                aria-label={title}
                onClick={() => onRunEditorCommand(item.command)}
                className={cn(
                  "focus-ring m3-state-layer flex w-full items-center text-left text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface",
                  compact ? "justify-center rounded-2xl px-0 py-3" : "gap-3 rounded-full px-4 py-3",
                )}
              >
                <Icon aria-hidden className="size-5" />
                <span className={cn("truncate", compact && "sr-only")}>{title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
