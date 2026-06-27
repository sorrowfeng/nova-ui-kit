import { useMemo, useState } from "react";
import { ArrowRight, Command, Search } from "lucide-react";
import type { ShowcaseId, ShowcaseNavItem } from "@/data/components";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ShowcaseNavItem[];
  onSelect: (id: ShowcaseId) => void;
};

export function CommandPalette({ open, onOpenChange, items, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return items;
    }
    return items.filter((item) =>
      [item.title, item.description, item.category, ...item.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [items, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[14%] max-w-2xl overflow-hidden p-0 [--dialog-y:0px]">
        <DialogHeader className="border-b border-outline-variant bg-surface-container p-5 pb-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Command aria-hidden className="size-4 text-primary" />
            命令面板
          </DialogTitle>
          <DialogDescription>快速跳转组件组，或检查匹配的交互状态。</DialogDescription>
        </DialogHeader>

        <div className="border-b border-outline-variant bg-surface-container-low p-4">
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-on-surface-variant" />
            <Input
              autoFocus
              aria-label="搜索命令面板"
              placeholder="输入组件、模式或状态..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 rounded-full pl-12"
            />
          </div>
        </div>

        <div className="subtle-scrollbar max-h-[420px] overflow-y-auto bg-surface-container-low p-3">
          {results.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-outline-variant p-8 text-center text-sm text-on-surface-variant">
              没有匹配命令
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      "focus-ring m3-state-layer flex w-full items-center gap-3 rounded-[28px] px-4 py-3 text-left transition-colors hover:bg-surface-container-high",
                    )}
                    onClick={() => {
                      onSelect(item.id);
                      onOpenChange(false);
                      setQuery("");
                    }}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-container">
                      <Icon aria-hidden className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      <p className="truncate text-xs text-on-surface-variant">{item.description}</p>
                    </div>
                    <ArrowRight aria-hidden className="size-4 text-on-surface-variant" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container px-5 py-3 text-xs text-on-surface-variant">
          <span>搜索结果与侧边栏共用同一份组件注册表。</span>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
