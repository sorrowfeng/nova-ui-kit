import type { ReactNode } from "react";
import { ChevronUp, Maximize2, Minimize2, X } from "lucide-react";
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
  minimized = false,
  onMinimizedChange,
  summary,
  children,
}: {
  tabs: BuilderDockTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  minimized?: boolean;
  onMinimizedChange?: (minimized: boolean) => void;
  summary?: ReactNode;
  children: ReactNode;
}) {
  const ExpandIcon = expanded ? Minimize2 : Maximize2;
  const handleTabChange = (tab: T) => {
    onTabChange(tab);
    if (minimized) {
      onMinimizedChange?.(false);
    }
  };

  return (
    <section
      className={cn(
        "fixed bottom-0 left-[88px] right-0 z-20 shrink-0 border-t border-outline-variant bg-surface-container-lowest shadow-m3-2 transition-[height]",
        minimized ? "h-[56px]" : expanded ? "h-[288px]" : "h-[128px]",
      )}
      data-builder-output-dock=""
      data-builder-output-dock-expanded={expanded ? "true" : "false"}
      data-builder-output-dock-minimized={minimized ? "true" : "false"}
    >
      {minimized ? (
        <div className="grid h-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-2">
          <DockTabList tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} layout="inline" />
          <Button
            size="icon-sm"
            variant="secondary"
            aria-label="显示输出面板"
            data-builder-restore-output-dock=""
            onClick={() => onMinimizedChange?.(false)}
          >
            <ChevronUp aria-hidden className="size-3.5" />
          </Button>
        </div>
      ) : (
        <div className="grid h-full min-h-0 gap-3 px-4 py-3 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
          <div className="grid min-h-0 gap-2">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <DockTabList tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} layout="inline" />
              <div className="flex items-start gap-1">
                {onMinimizedChange ? (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="最小化输出面板"
                    data-builder-minimize-output-dock=""
                    onClick={() => onMinimizedChange(true)}
                  >
                    <X aria-hidden className="size-3.5" />
                  </Button>
                ) : null}
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
            {summary ? <div className="min-h-0 overflow-auto">{summary}</div> : null}
          </div>
          <div className="min-h-0 overflow-auto rounded-2xl border border-outline-variant bg-surface-container p-3">
            {children}
          </div>
        </div>
      )}
    </section>
  );
}
