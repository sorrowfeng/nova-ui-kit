import { Bell, Boxes, Command, Palette, Settings } from "lucide-react";
import type { ShowcaseId, ShowcaseNavItem } from "@/data/components";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type NavigationRailProps = {
  activeId: ShowcaseId;
  items: ShowcaseNavItem[];
  onSelect: (id: ShowcaseId) => void;
  onOpenCommand: () => void;
  onToast: () => void;
};

export function NavigationRail({
  activeId,
  items,
  onSelect,
  onOpenCommand,
  onToast,
}: NavigationRailProps) {
  return (
    <nav className="hidden h-full w-24 shrink-0 flex-col items-center gap-4 bg-surface px-3 py-4 lg:flex">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-container text-primary-container-foreground shadow-m3-1">
        <Palette aria-hidden className="size-6" />
      </div>

      <Button aria-label="打开命令面板" className="size-14 rounded-2xl p-0" onClick={onOpenCommand}>
        <Command aria-hidden className="size-5" />
      </Button>

      <div className="mt-2 flex w-full flex-1 flex-col items-center gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeId === item.id;
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={item.title}
                  aria-current={active ? "page" : undefined}
                  onClick={() => onSelect(item.id)}
                  className="focus-ring group flex w-full flex-col items-center gap-1 rounded-2xl py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  <span
                    className={cn(
                      "m3-state-layer flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                      active
                        ? "bg-secondary-container text-secondary-container-foreground"
                        : "group-hover:bg-surface-container-high",
                    )}
                  >
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span className="max-w-16 truncate">{item.title.split(" ")[0]}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.title}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="icon" aria-label="通知" onClick={onToast}>
          <Bell />
        </Button>
        <Button variant="ghost" size="icon" aria-label="组件库设置">
          <Settings />
        </Button>
        <Button variant="ghost" size="icon" aria-label="组件注册表">
          <Boxes />
        </Button>
      </div>
    </nav>
  );
}
