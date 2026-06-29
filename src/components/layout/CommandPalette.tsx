import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Command, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
import type { NovaEditorCommand } from "@/lib/editor-commands";
import { cn } from "@/lib/utils";

export type CommandPaletteAction = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: LucideIcon;
  tags: string[];
  command: NovaEditorCommand;
  shortcut?: string;
};

type CommandPaletteResult =
  | {
      kind: "page";
      id: string;
      title: string;
      description: string;
      category: string;
      tags: string[];
      icon: LucideIcon;
      item: ShowcaseNavItem;
      shortcut?: string;
    }
  | {
      kind: "action";
      id: string;
      title: string;
      description: string;
      category: string;
      tags: string[];
      icon: LucideIcon;
      action: CommandPaletteAction;
      shortcut?: string;
    };

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ShowcaseNavItem[];
  onSelect: (id: ShowcaseId) => void;
  actions: CommandPaletteAction[];
  onRunAction: (command: NovaEditorCommand) => void;
};

export function CommandPalette({ open, onOpenChange, items, onSelect, actions, onRunAction }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const actionResults: CommandPaletteResult[] = actions.map((action) => ({
      kind: "action",
      id: action.id,
      title: action.title,
      description: action.description,
      category: action.category,
      tags: action.tags,
      icon: action.icon,
      action,
      shortcut: action.shortcut,
    }));
    const pageResults: CommandPaletteResult[] = items.map((item) => ({
      kind: "page",
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      tags: item.tags,
      icon: item.icon,
      item,
    }));
    const allResults = [...pageResults, ...actionResults];

    if (!normalized) {
      return allResults;
    }
    return allResults.filter((result) =>
      [result.title, result.description, result.category, result.shortcut ?? "", ...result.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [actions, items, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [open, query]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(results.length - 1, 0)));
  }, [results.length]);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setQuery("");
      setActiveIndex(0);
    }
  };

  const closePalette = () => {
    handleOpenChange(false);
  };

  const chooseResult = (result: CommandPaletteResult) => {
    if (result.kind === "page") {
      onSelect(result.item.id);
    } else {
      onRunAction(result.action.command);
    }
    closePalette();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="top-[14%] max-w-2xl overflow-hidden p-0 [--dialog-y:0px]">
        <DialogHeader className="border-b border-outline-variant bg-surface-container p-5 pb-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Command aria-hidden className="size-4 text-primary" />
            命令面板
          </DialogTitle>
          <DialogDescription>搜索工作区、编辑器模式和项目动作。</DialogDescription>
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
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
                  return;
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((current) => Math.max(current - 1, 0));
                  return;
                }
                if (event.key === "Enter" && results[activeIndex]) {
                  event.preventDefault();
                  chooseResult(results[activeIndex]);
                }
              }}
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
              {results.map((result, index) => {
                const Icon = result.icon;
                return (
                  <button
                    key={result.id}
                    type="button"
                    aria-selected={index === activeIndex}
                    className={cn(
                      "focus-ring m3-state-layer flex w-full items-center gap-3 rounded-[28px] px-4 py-3 text-left transition-colors hover:bg-surface-container-high",
                      index === activeIndex && "bg-secondary-container text-secondary-container-foreground",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => chooseResult(result)}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-container">
                      <Icon aria-hidden className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{result.title}</p>
                        <Badge variant={result.kind === "action" ? "default" : "secondary"}>{result.category}</Badge>
                        {result.shortcut ? <Badge variant="outline">{result.shortcut}</Badge> : null}
                      </div>
                      <p className="truncate text-xs text-on-surface-variant">{result.description}</p>
                    </div>
                    <ArrowRight aria-hidden className="size-4 text-on-surface-variant" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container px-5 py-3 text-xs text-on-surface-variant">
          <span>工作区与编辑器动作</span>
          <Button variant="ghost" size="sm" onClick={closePalette}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
