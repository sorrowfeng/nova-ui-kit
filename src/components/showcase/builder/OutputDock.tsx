import type { ReactNode } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import type { BuilderDockTab } from "./ProjectDock";
import { DockTabList } from "./ProjectDock";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OutputDock<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  expanded = false,
  onExpandedChange,
  children,
}: {
  tabs: BuilderDockTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children: ReactNode;
}) {
  const ExpandIcon = expanded ? Minimize2 : Maximize2;

  return (
    <section
      className={cn(
        "shrink-0 border-t border-outline-variant bg-surface-container-lowest transition-[height]",
        expanded ? "h-[288px]" : "h-[128px]",
      )}
      data-builder-output-dock=""
      data-builder-output-dock-expanded={expanded ? "true" : "false"}
    >
      <div className="grid h-full min-h-0 gap-3 px-4 py-3 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
        <div className="grid min-h-0 gap-2">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <DockTabList tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
            {onExpandedChange ? (
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={expanded ? "收起输出面板" : "展开输出面板"}
                data-builder-toggle-output-dock=""
                onClick={() => onExpandedChange(!expanded)}
              >
                <ExpandIcon aria-hidden className="size-3.5" />
              </Button>
            ) : null}
          </div>
        </div>
        <div className="min-h-0 overflow-auto rounded-2xl border border-outline-variant bg-surface-container p-3">
          {children}
        </div>
      </div>
    </section>
  );
}
