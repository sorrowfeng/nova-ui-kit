import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ShortcutGroup = {
  title: string;
  items: Array<{ keys: string; label: string }>;
};

const GROUPS: ShortcutGroup[] = [
  {
    title: "全局",
    items: [
      { keys: "Ctrl + K", label: "打开命令面板" },
      { keys: "F1 / ?", label: "快捷键速查" },
      { keys: "Ctrl + S", label: "保存项目" },
      { keys: "Ctrl + Z / Y", label: "撤销 / 重做" },
      { keys: "Ctrl + 1…4", label: "切换 Project/Design/Logic/Build" },
    ],
  },
  {
    title: "画布与选择",
    items: [
      { keys: "Ctrl + C / V / X", label: "复制 / 粘贴 / 剪切控件" },
      { keys: "Ctrl + F", label: "画布内搜索控件" },
      { keys: "Ctrl + A", label: "全选" },
      { keys: "Esc", label: "取消选择 / 关闭浮层" },
      { keys: "方向键 / Shift+方向键", label: "微调 / 大步移动" },
      { keys: "Ctrl + I", label: "反选" },
      { keys: "Ctrl + G / Shift+G", label: "成组 / 取消成组" },
      { keys: "Delete", label: "删除选中" },
    ],
  },
  {
    title: "选择条与对齐",
    items: [
      { keys: "Ctrl + Shift + A", label: "选择同类控件" },
      { keys: "Ctrl + F2", label: "命名对象" },
      { keys: "Ctrl + 2", label: "适配选中到视口" },
      { keys: "Ctrl + Alt + T", label: "Tab 顺序覆盖层" },
      { keys: "Ctrl + [ / ]", label: "图层下移 / 上移" },
    ],
  },
  {
    title: "运行与构建",
    items: [
      { keys: "F5", label: "运行选中事件" },
      { keys: "F8", label: "打开构建输出" },
      { keys: "Ctrl + J", label: "显示 / 隐藏输出 Dock" },
      { keys: "Ctrl + Enter", label: "执行主要工作流动作" },
    ],
  },
];

export function KeyboardShortcutsOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.keys.toLowerCase().includes(q) ||
          item.label.toLowerCase().includes(q) ||
          group.title.toLowerCase().includes(q),
      ),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[135] flex items-start justify-center bg-scrim/40 p-4 pt-[8vh]"
      data-builder-shortcuts-overlay=""
      role="dialog"
      aria-modal="true"
      aria-label="键盘快捷键"
    >
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-m3-3">
        <div className="flex items-center gap-3 border-b border-outline-variant px-5 py-4">
          <h2 className="flex-1 text-base font-semibold text-on-surface">键盘快捷键</h2>
          <div className="relative w-52">
            <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-on-surface-variant" />
            <Input
              inputSize="sm"
              value={query}
              aria-label="搜索快捷键"
              placeholder="搜索快捷键…"
              className="h-8 rounded-full pl-8 text-xs"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <button
            type="button"
            className="focus-ring flex size-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
            aria-label="关闭快捷键"
            onClick={() => onOpenChange(false)}
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
        <div className="subtle-scrollbar overflow-y-auto px-5 py-4">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-on-surface-variant">没有匹配的快捷键</p>
          ) : (
            <div className="space-y-5">
              {filtered.map((group) => (
                <section key={group.title} data-builder-shortcuts-group={group.title}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                    {group.title}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <div
                        key={item.keys + item.label}
                        className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-sm odd:bg-surface-container/40"
                      >
                        <span className="min-w-0 truncate text-on-surface">{item.label}</span>
                        <kbd
                          className={cn(
                            "shrink-0 rounded-lg border border-outline-variant bg-surface-container-high px-2 py-0.5 font-mono text-[0.7rem] text-on-surface-variant",
                          )}
                        >
                          {item.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
