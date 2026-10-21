import type { Ref } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CanvasFindBar({
  open,
  query,
  inputRef,
  onQueryChange,
  onClose,
  onCommit,
}: {
  open: boolean;
  query: string;
  inputRef?: Ref<HTMLInputElement>;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onCommit: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="pointer-events-auto absolute right-4 top-2 z-30 flex w-[min(22rem,calc(100%-2rem))] items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest/95 px-3 py-1.5 shadow-m3-2"
      data-builder-canvas-find=""
      role="search"
      aria-label="画布搜索控件"
    >
      <Search aria-hidden className="size-3.5 shrink-0 text-on-surface-variant" />
      <input
        ref={inputRef}
        value={query}
        aria-label="按名称或类型搜索控件"
        placeholder="搜索控件名称或类型…"
        className="min-w-0 flex-1 bg-transparent text-xs text-on-surface outline-none"
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
          }
          if (event.key === "Enter") {
            event.preventDefault();
            onCommit();
          }
        }}
      />
      <button
        type="button"
        className="focus-ring flex size-6 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
        aria-label="关闭画布搜索"
        onClick={onClose}
      >
        <X aria-hidden className="size-3.5" />
      </button>
    </div>
  );
}

export function BatchSelectToolbar({
  count,
  onAlignLeft,
  onMatchWidth,
  onMatchHeight,
  onBatchLabel,
}: {
  count: number;
  onAlignLeft: () => void;
  onMatchWidth: () => void;
  onMatchHeight: () => void;
  onBatchLabel: () => void;
}) {
  if (count <= 1) return null;
  return (
    <div
      className="pointer-events-auto absolute left-4 top-2 z-20 rounded-2xl border border-primary/30 bg-surface-container-lowest/95 px-2 py-1 shadow-m3-1"
      data-builder-multi-batch-editor=""
      data-builder-multi-batch-count={count}
    >
      <div className="mb-1 text-[0.66rem] font-semibold text-on-surface">批量 {count} 个控件</div>
      <div className="flex flex-wrap gap-1">
        <Button size="sm" variant="secondary" className="h-6 px-2 text-[0.62rem]" onClick={onAlignLeft}>
          左对齐
        </Button>
        <Button size="sm" variant="secondary" className="h-6 px-2 text-[0.62rem]" onClick={onMatchWidth}>
          等宽
        </Button>
        <Button size="sm" variant="secondary" className="h-6 px-2 text-[0.62rem]" onClick={onMatchHeight}>
          等高
        </Button>
        <Button size="sm" variant="ghost" className="h-6 px-2 text-[0.62rem]" data-builder-multi-batch-label="" onClick={onBatchLabel}>
          批量改标签
        </Button>
      </div>
    </div>
  );
}
