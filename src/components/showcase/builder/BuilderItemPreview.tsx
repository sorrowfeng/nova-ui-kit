import type { BuilderItem, DesignerAsset } from "./types-project";
import type { BuilderMode } from "./types-canvas";
import { cn } from "@/lib/utils";
import { clamp, frameLayoutMode } from "./layout";
import { itemOptionTexts, numericPercent } from "./item-options";
import { assetForItem, imageSourceForItem } from "./item-assets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Box, Braces, CalendarDays, Check, CheckCircle2,
  ChevronDown, ChevronRight, Circle, Clock3, Columns3, CornerDownRight, Download, Eye, FileImage,
  FileJson, FileText, FolderOpen, Grid3x3, Keyboard, Layers, ListChecks, Lock, LockOpen, Maximize2,
  Menu, MessageSquare, Monitor, MousePointer2, Move, Navigation, PanelTop, Play, Plus, RectangleHorizontal,
  Save, ScrollText, Search, Settings2, Square, Star, Table2, Terminal, ToggleLeft, Type, Wand2, X,
} from "lucide-react";

/**
 * Render one builder item as it looks in the generated app (and in the
 * design-mode passive preview). Extracted from BuilderShowcase (P2-9).
 */
export function renderBuilderPreview(item: BuilderItem, mode: BuilderMode, assets: DesignerAsset[] = []) {
  const props = item.props;
  const passive = mode === "design";

  if (item.type === "frame") {
    return (
      <section className="h-full w-full overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container p-4 shadow-m3-1">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="truncate text-sm font-medium">{props.title}</h3>
          <Badge variant="outline">{frameLayoutMode(item)}</Badge>
        </div>
        <p className="line-clamp-3 text-sm leading-5 text-on-surface-variant">{props.description}</p>
        <div className="mt-4 h-2 rounded-full bg-surface-container-highest">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>
      </section>
    );
  }

  if (item.type === "group-box") {
    const options = itemOptionTexts(props);
    return (
      <fieldset className="relative flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low px-4 pb-4 pt-5 shadow-m3-1">
        <legend className="max-w-[80%] truncate rounded-full border border-outline-variant bg-surface px-3 py-1 text-xs font-semibold text-on-surface">
          {props.title || "分组"}
        </legend>
        <p className="mb-3 line-clamp-2 text-xs leading-5 text-on-surface-variant">{props.description}</p>
        <div className="grid min-h-0 flex-1 gap-2 overflow-hidden">
          {options.map((option, index) => (
            <div key={option} className="grid grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-3 rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-xs">
              <span className="truncate font-medium text-on-surface">{option}</span>
              <span className={cn("h-2 rounded-full", index === 2 ? "bg-primary" : "bg-surface-container-highest")} />
            </div>
          ))}
        </div>
      </fieldset>
    );
  }

  if (item.type === "spacer") {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[18px] border border-dashed border-outline bg-surface-container-low px-3 text-center text-xs text-on-surface-variant">
        <div className="min-w-0">
          <Move aria-hidden className="mx-auto mb-1 size-4 text-primary" />
          <p className="truncate font-semibold text-on-surface">{props.title || "Spacer"}</p>
          <p className="truncate text-[0.68rem]">{props.value || props.description || "stretch"}</p>
        </div>
      </div>
    );
  }

  if (item.type === "heading") {
    return (
      <section className="h-full w-full overflow-hidden">
        <p className="truncate text-xs font-medium uppercase tracking-[0.12em] text-primary">{props.label}</p>
        <h2 className="mt-1 truncate text-3xl font-semibold tracking-normal">{props.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-on-surface-variant">{props.description}</p>
      </section>
    );
  }

  if (item.type === "label") {
    return (
      <div className="flex h-full w-full min-w-0 flex-col justify-center overflow-hidden rounded-[16px] border border-transparent bg-transparent px-1">
        <span className="truncate text-sm font-semibold text-on-surface">{props.label || "标签"}</span>
        {props.description ? <span className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">{props.description}</span> : null}
      </div>
    );
  }

  if (item.type === "link-label") {
    return (
      <button
        type="button"
        tabIndex={passive ? -1 : undefined}
        className="focus-ring flex h-full w-full min-w-0 flex-col justify-center overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low px-4 text-left text-primary shadow-m3-1 transition hover:bg-surface-container"
      >
        <span className="truncate text-sm font-semibold underline-offset-4 hover:underline">{props.label || "打开链接"}</span>
        {props.description ? <span className="mt-1 line-clamp-1 text-xs leading-5 text-on-surface-variant">{props.description}</span> : null}
        <span className="mt-1 truncate font-mono text-[0.68rem] text-primary/80">{props.value || props.helper || "https://example.com"}</span>
      </button>
    );
  }

  if (item.type === "text-browser") {
    const lines = String(props.value || props.description || "只读文本内容")
      .split(/\n+/)
      .filter(Boolean);
    return (
      <section className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex min-h-10 items-center justify-between gap-3 border-b border-outline-variant px-4">
          <span className="truncate text-sm font-semibold">{props.title || "文本浏览器"}</span>
          <ScrollText aria-hidden className="size-4 shrink-0 text-primary" />
        </header>
        <div className="subtle-scrollbar min-h-0 flex-1 overflow-auto px-4 py-3">
          {lines.map((line, index) => (
            <p key={`${line}-${index}`} className="mb-2 text-xs leading-5 text-on-surface-variant last:mb-0">
              {line}
            </p>
          ))}
        </div>
      </section>
    );
  }

  if (item.type === "help-viewer") {
    const topics = itemOptionTexts(props);
    const current = String(props.value ?? topics[0] ?? "");
    return (
      <section className="grid h-full w-full grid-cols-[10rem_minmax(0,1fr)] overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <aside className="min-w-0 border-r border-outline-variant bg-surface-container px-2 py-3">
          <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold text-on-surface">
            <FileText aria-hidden className="size-4 shrink-0 text-primary" />
            <span className="truncate">{props.title || "帮助"}</span>
          </div>
          {topics.map((topic, index) => {
            const active = topic === current || (!current && index === 0);
            return (
              <button
                key={topic}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "focus-ring mb-1 flex h-8 w-full min-w-0 items-center rounded-xl px-2 text-left text-xs transition",
                  active ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className="truncate">{topic}</span>
              </button>
            );
          })}
        </aside>
        <main className="min-w-0 overflow-hidden p-4">
          <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
            <h3 className="truncate text-sm font-semibold">{current || props.title || "帮助主题"}</h3>
            <Badge variant="outline" className="shrink-0 text-[0.66rem]">{props.helper || "F1"}</Badge>
          </div>
          <p className="line-clamp-3 text-xs leading-5 text-on-surface-variant">
            {props.description || "在桌面应用里提供可搜索、可定位的帮助主题和上下文文档。"}
          </p>
          <div className="mt-4 space-y-2">
            <div className="h-2 rounded-full bg-surface-container-highest" />
            <div className="h-2 w-5/6 rounded-full bg-surface-container-highest" />
            <div className="h-2 w-2/3 rounded-full bg-surface-container-highest" />
          </div>
        </main>
      </section>
    );
  }

  if (item.type === "button") {
    return (
      <Button className="h-full w-full" variant={props.variant ?? "default"} size={props.size ?? "md"} tabIndex={passive ? -1 : undefined}>
        {props.label}
      </Button>
    );
  }

  if (item.type === "button-group") {
    const options = itemOptionTexts(props);
    const active = props.value || options[0] || "选项";
    return (
      <section className="flex h-full w-full min-w-0 items-center overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low p-1 shadow-m3-1">
        {options.slice(0, 5).map((option) => {
          const selected = option === active;
          return (
            <button
              key={option}
              type="button"
              tabIndex={passive ? -1 : undefined}
              className={cn(
                "focus-ring flex h-full min-w-0 flex-1 items-center justify-center rounded-[14px] px-3 text-xs font-semibold transition-colors",
                selected
                  ? "bg-secondary-container text-secondary-container-foreground shadow-m3-1"
                  : "text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              <span className="truncate">{option}</span>
            </button>
          );
        })}
      </section>
    );
  }

  if (item.type === "dialog-button-box") {
    const options = itemOptionTexts(props);
    const primaryLabel = props.label || options[options.length - 1] || "确定";
    const actions = options.length > 0 ? options : ["取消", "应用", primaryLabel];
    return (
      <div className="flex h-full w-full min-w-0 items-center justify-end gap-2 overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low px-3 shadow-m3-1">
        {actions.slice(0, 4).map((action, index) => {
          const primary = action === primaryLabel || index === actions.length - 1;
          return (
            <Button
              key={`${action}-${index}`}
              size={props.size ?? "sm"}
              variant={primary ? props.variant ?? "default" : "outline"}
              className="min-w-0 shrink-0"
              tabIndex={passive ? -1 : undefined}
            >
              <span className="truncate">{action}</span>
            </Button>
          );
        })}
      </div>
    );
  }

  if (item.type === "command-link-button") {
    return (
      <button
        type="button"
        tabIndex={passive ? -1 : undefined}
        className="flex h-full w-full min-w-0 items-center gap-3 overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low px-4 text-left shadow-m3-1 transition hover:bg-surface-container-high"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary">
          <ArrowRight aria-hidden className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{props.title || props.label}</span>
          <span className="mt-1 block truncate text-xs text-on-surface-variant">{props.description || props.helper}</span>
        </span>
        <span className="shrink-0 rounded-full bg-surface-container-high px-2 py-1 text-[0.66rem] text-on-surface-variant">{props.label || "继续"}</span>
      </button>
    );
  }

  if (item.type === "menu-button") {
    const options = itemOptionTexts(props);
    const current = String(props.value || options[0] || props.label || "更多");
    return (
      <div
        className={cn(
          "flex h-full w-full overflow-hidden rounded-2xl border shadow-m3-1",
          props.variant === "outline"
            ? "border-outline-variant bg-surface-container-low text-on-surface"
            : props.variant === "destructive"
              ? "border-destructive/35 bg-destructive text-destructive-foreground"
              : "border-outline-variant bg-secondary-container text-secondary-container-foreground",
        )}
      >
        <button
          type="button"
          tabIndex={passive ? -1 : undefined}
          className="focus-ring flex min-w-0 flex-1 items-center justify-center gap-2 px-3 text-sm font-semibold"
        >
          <Menu aria-hidden className="size-4 shrink-0" />
          <span className="truncate">{props.label || "菜单"}</span>
        </button>
        <button
          type="button"
          tabIndex={passive ? -1 : undefined}
          className="focus-ring flex min-w-0 max-w-[6.5rem] shrink-0 items-center gap-1 border-l border-outline-variant/70 px-2 text-xs"
          aria-label="展开菜单按钮"
        >
          <span className="truncate">{current}</span>
          <ChevronDown aria-hidden className="size-3.5 shrink-0" />
        </button>
      </div>
    );
  }

  if (item.type === "split-button") {
    const options = itemOptionTexts(props);
    const active = props.value || options[0] || "默认";
    return (
      <div
        className={cn(
          "flex h-full w-full overflow-hidden rounded-2xl border shadow-m3-1",
          props.variant === "outline"
            ? "border-outline-variant bg-surface-container-low text-on-surface"
            : props.variant === "secondary"
              ? "border-outline-variant bg-secondary-container text-secondary-container-foreground"
              : props.variant === "destructive"
                ? "border-destructive/35 bg-destructive text-destructive-foreground"
                : "border-primary/20 bg-primary text-primary-foreground",
        )}
      >
        <button
          type="button"
          tabIndex={passive ? -1 : undefined}
          className="focus-ring flex min-w-0 flex-1 items-center justify-center gap-2 px-4 text-sm font-semibold"
        >
          <Play aria-hidden className="size-4 shrink-0" />
          <span className="truncate">{props.label || "运行"}</span>
          <span className="truncate rounded-full bg-white/15 px-2 py-0.5 text-[0.66rem] font-medium">{active}</span>
        </button>
        <button
          type="button"
          tabIndex={passive ? -1 : undefined}
          className="focus-ring flex w-11 shrink-0 items-center justify-center border-l border-white/20 bg-black/5"
          aria-label="展开操作菜单"
        >
          <ChevronDown aria-hidden className="size-4" />
        </button>
      </div>
    );
  }

  if (item.type === "tool-button") {
    return (
      <Button
        className="h-full w-full flex-col gap-1 rounded-[18px] px-3 text-xs shadow-m3-1"
        variant={props.variant ?? "secondary"}
        size={props.size ?? "md"}
        tabIndex={passive ? -1 : undefined}
      >
        <Wand2 aria-hidden className="size-4 shrink-0" />
        <span className="max-w-full truncate">{props.label || "工具"}</span>
      </Button>
    );
  }

  if (item.type === "toggle-button") {
    const selected = Boolean(props.checked);
    return (
      <Button
        className={cn(
          "h-full w-full gap-2 rounded-[18px] px-3 text-xs shadow-m3-1",
          selected && "ring-2 ring-primary/25",
        )}
        variant={selected ? props.variant ?? "secondary" : "outline"}
        size={props.size ?? "md"}
        aria-pressed={selected}
        tabIndex={passive ? -1 : undefined}
      >
        <ToggleLeft aria-hidden className="size-4 shrink-0" />
        <span className="truncate">{props.label || "切换"}</span>
      </Button>
    );
  }

  if (item.type === "toggle-group") {
    const options = itemOptionTexts(props);
    const current = String(props.value || options[0] || "");
    return (
      <section className="flex h-full w-full flex-col justify-center gap-2 rounded-[20px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <Label className="truncate text-xs">{props.label || "切换按钮组"}</Label>
          {props.helper ? <span className="shrink-0 truncate text-[0.66rem] text-on-surface-variant">{props.helper}</span> : null}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-1 rounded-2xl border border-outline-variant bg-surface-container p-1" role="group" aria-label={props.label || "切换按钮组"}>
          {options.map((option, index) => {
            const active = option === current || (!current && index === 0);
            return (
              <button
                key={option}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "min-w-0 truncate rounded-xl px-2 text-xs font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground shadow-m3-1" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "icon-button") {
    return (
      <Button
        className="h-full w-full rounded-full p-0 shadow-m3-1"
        variant={props.variant ?? "secondary"}
        size="icon"
        aria-label={props.label || "图标按钮"}
        tabIndex={passive ? -1 : undefined}
      >
        {props.label?.includes("保存") ? <Save aria-hidden className="size-5" /> : props.label?.includes("运行") ? <Play aria-hidden className="size-5" /> : <MousePointer2 aria-hidden className="size-5" />}
      </Button>
    );
  }

  if (item.type === "image") {
    const asset = assetForItem(item, assets);
    const src = imageSourceForItem(item, assets);
    return (
      <figure className="relative h-full w-full overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        {src ? (
          <img
            src={src}
            alt={props.alt || props.label || asset?.name || "项目资源"}
            className={cn("h-full w-full", props.objectFit === "contain" ? "object-contain" : props.objectFit === "fill" ? "object-fill" : "object-cover")}
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center text-on-surface-variant">
            <FileImage aria-hidden className="size-8 text-primary" />
            <span className="text-sm font-medium">未绑定资源</span>
          </div>
        )}
        <figcaption className="pointer-events-none absolute inset-x-2 bottom-2 rounded-xl border border-outline-variant bg-surface/85 px-2 py-1 text-[0.68rem] text-on-surface-variant shadow-m3-1">
          <span className="block truncate">{asset?.name || props.label || "图片资源"}</span>
        </figcaption>
      </figure>
    );
  }

  if (item.type === "image-list") {
    const options = itemOptionTexts(props);
    const current = String(props.value || options[0] || "");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <header className="flex shrink-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{props.title || "图片列表"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description || props.helper}</p>
          </div>
          <Badge variant="outline" className="shrink-0">{props.helper || `${options.length} 项`}</Badge>
        </header>
        <div className="mt-3 grid min-h-0 flex-1 grid-cols-3 gap-2 overflow-hidden">
          {options.slice(0, 6).map((option, index) => {
            const active = option === current || (!current && index === 0);
            return (
              <button
                key={`${option}-${index}`}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "focus-ring flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-surface-container-high text-left transition hover:border-primary/40",
                  active ? "border-primary shadow-m3-1" : "border-outline-variant",
                )}
              >
                <span className={cn("block h-16 shrink-0 bg-gradient-to-br", index % 3 === 0 ? "from-[#d7e3ff] to-[#eaddff]" : index % 3 === 1 ? "from-[#d2e7d6] to-[#f3edf7]" : "from-[#ffd8e4] to-[#e8def8]")} />
                <span className="truncate px-2 py-1.5 text-[0.68rem] font-medium">{option}</span>
              </button>
            );
          })}
        </div>
        <Button className="mt-3 shrink-0 justify-center" size="sm" variant={props.variant ?? "secondary"} tabIndex={passive ? -1 : undefined}>
          <FileImage aria-hidden className="size-4" />
          {props.label || "选择图片"}
        </Button>
      </section>
    );
  }

  if (item.type === "web-view") {
    const pages = itemOptionTexts(props);
    const current = String(props.value || pages[0] || "about:blank");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-outline-variant bg-surface-container px-3">
          <Monitor aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1 text-[0.68rem] font-mono text-on-surface-variant">
            <span className="block truncate">{current}</span>
          </div>
          <Button size="sm" variant="ghost" tabIndex={passive ? -1 : undefined} className="h-7 px-2 text-[0.68rem]">
            {props.label || "刷新"}
          </Button>
        </header>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="hidden w-24 shrink-0 flex-col gap-1 border-r border-outline-variant bg-surface-container px-2 py-3 sm:flex">
            {pages.slice(0, 3).map((page, index) => (
              <span key={page} className={cn("truncate rounded-lg px-2 py-1.5 text-[0.68rem] font-medium", index === 0 ? "bg-primary-container text-primary" : "text-on-surface-variant")}>
                {page}
              </span>
            ))}
          </aside>
          <main className="grid min-w-0 flex-1 grid-rows-[auto_1fr_auto] gap-3 bg-surface-container-lowest p-4">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold">{props.title || "Web 视图"}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">{props.description}</p>
            </div>
            <div className="grid min-h-0 gap-2">
              <span className="h-3 w-4/5 rounded-full bg-surface-container-high" />
              <span className="h-3 w-2/3 rounded-full bg-surface-container-high" />
              <span className="rounded-xl border border-outline-variant bg-surface-container-low" />
            </div>
            <span className="truncate rounded-lg bg-surface-container px-2 py-1 text-[0.66rem] text-on-surface-variant">DOM ready · sandboxed preview</span>
          </main>
        </div>
      </section>
    );
  }

  if (item.type === "media-player") {
    const chapters = itemOptionTexts(props);
    const progress = numericPercent(props.value, 42);
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-[#17151b] text-[#f7f2fa] shadow-m3-2">
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_35%_25%,rgba(208,188,255,0.35),transparent_30%),linear-gradient(135deg,#211f26,#101116)]">
          <div className="absolute inset-x-4 top-4 min-w-0">
            <h3 className="truncate text-sm font-semibold">{props.title || "媒体播放器"}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#cac4d0]">{props.description}</p>
          </div>
          <button
            type="button"
            tabIndex={passive ? -1 : undefined}
            className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white shadow-m3-3 backdrop-blur"
            aria-label={props.label || "播放"}
          >
            <Play aria-hidden className="ml-1 size-6" />
          </button>
        </div>
        <footer className="shrink-0 border-t border-white/10 bg-[#211f26] p-3">
          <div className="flex items-center gap-3">
            <Button size="icon-sm" variant="ghost" tabIndex={passive ? -1 : undefined} aria-label={props.label || "播放"} className="text-[#f7f2fa] hover:bg-white/10">
              <Play aria-hidden className="size-4" />
            </Button>
            <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#d0bcff]" style={{ width: `${progress}%` }} />
            </div>
            <span className="shrink-0 truncate text-[0.68rem] text-[#cac4d0]">{props.helper || `${progress}%`}</span>
          </div>
          <div className="mt-2 flex gap-1.5 overflow-hidden">
            {chapters.slice(0, 3).map((chapter, index) => (
              <span key={chapter} className={cn("min-w-0 truncate rounded-full px-2 py-1 text-[0.66rem] font-medium", index === 0 ? "bg-[#d0bcff] text-[#381e72]" : "bg-white/10 text-[#cac4d0]")}>
                {chapter}
              </span>
            ))}
          </div>
        </footer>
      </section>
    );
  }

  if (item.type === "pdf-viewer") {
    const sections = itemOptionTexts(props);
    const currentPage = String(props.value || "1 / 1");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant bg-surface-container px-3">
          <FileText aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "PDF 查看器"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description || "分页文档预览"}</p>
          </div>
          <span className="hidden shrink-0 rounded-full bg-surface-container-high px-2 py-1 text-[0.66rem] text-on-surface-variant sm:inline">{currentPage}</span>
          <Button size="sm" variant="ghost" tabIndex={passive ? -1 : undefined} className="h-7 px-2 text-[0.68rem]">
            {props.label || "适合宽度"}
          </Button>
        </header>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="hidden w-24 shrink-0 flex-col gap-2 border-r border-outline-variant bg-surface-container px-2 py-3 sm:flex">
            {sections.slice(0, 3).map((section, index) => (
              <span key={section} className={cn("rounded-lg border px-2 py-2 text-[0.66rem] font-medium", index === 0 ? "border-primary bg-primary-container text-primary" : "border-outline-variant bg-surface-container-low text-on-surface-variant")}>
                <span className="block h-10 rounded bg-surface-container-lowest shadow-inner" />
                <span className="mt-1 block truncate">{section}</span>
              </span>
            ))}
          </aside>
          <main className="grid min-w-0 flex-1 place-items-center overflow-hidden bg-surface-container-lowest p-4">
            <article className="flex h-full max-h-[230px] w-[72%] min-w-[160px] max-w-[260px] flex-col gap-2 rounded-sm border border-outline-variant bg-white p-4 text-[#1d192b] shadow-m3-2">
              <strong className="truncate text-xs">{props.title || "Document"}</strong>
              <span className="h-2 w-4/5 rounded-full bg-[#d8d2e4]" />
              <span className="h-2 w-2/3 rounded-full bg-[#d8d2e4]" />
              <div className="mt-1 grid flex-1 grid-cols-[1fr_0.8fr] gap-2 overflow-hidden">
                <div className="space-y-1.5">
                  <span className="block h-1.5 rounded-full bg-[#cac4d0]" />
                  <span className="block h-1.5 rounded-full bg-[#cac4d0]" />
                  <span className="block h-1.5 w-3/4 rounded-full bg-[#cac4d0]" />
                  <span className="block h-12 rounded bg-[#f3edf7]" />
                </div>
                <div className="rounded border border-[#e7e0ec] bg-[#f9f6fb]" />
              </div>
            </article>
          </main>
        </div>
        <footer className="flex h-9 shrink-0 items-center justify-between gap-2 border-t border-outline-variant bg-surface-container px-3 text-[0.68rem] text-on-surface-variant">
          <span className="truncate">{props.helper || "缩放 100%"}</span>
          <span className="truncate">{currentPage}</span>
        </footer>
      </section>
    );
  }

  if (item.type === "map-view") {
    const layers = itemOptionTexts(props);
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant bg-surface-container px-3">
          <Navigation aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "地图视图"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description || "位置与路线"}</p>
          </div>
          <Button size="sm" variant="secondary" tabIndex={passive ? -1 : undefined} className="h-7 px-2 text-[0.68rem]">
            {props.label || "定位"}
          </Button>
        </header>
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[#eef4ef]">
          <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(90deg,rgba(20,108,67,0.13)_1px,transparent_1px),linear-gradient(180deg,rgba(20,108,67,0.13)_1px,transparent_1px)] [background-size:34px_34px]" />
          <svg className="absolute inset-0 h-full w-full text-[#146c43]" aria-hidden viewBox="0 0 500 300" preserveAspectRatio="none">
            <path d="M34 206 C96 154 132 168 184 126 C236 82 308 82 366 118 C416 150 442 132 482 84" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.18" />
            <path d="M34 206 C96 154 132 168 184 126 C236 82 308 82 366 118 C416 150 442 132 482 84" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          {[
            ["left-[15%] top-[58%]", layers[0] ?? "门店"],
            ["left-[48%] top-[34%]", layers[1] ?? "路线"],
            ["right-[14%] top-[24%]", layers[2] ?? "告警"],
          ].map(([position, label], index) => (
            <span key={`${label}-${index}`} className={cn("absolute flex min-w-0 max-w-[38%] items-center gap-1.5 rounded-full border px-2 py-1 text-[0.66rem] font-semibold shadow-m3-1", position, index === 2 ? "border-[#ba1a1a] bg-[#ffdad6] text-[#ba1a1a]" : "border-[#146c43] bg-white text-[#146c43]")}>
              <i className="size-2 shrink-0 rounded-full bg-current" />
              <span className="truncate">{label}</span>
            </span>
          ))}
          <div className="absolute bottom-3 left-3 max-w-[68%] rounded-xl border border-outline-variant bg-white/90 p-2 text-[0.68rem] shadow-m3-1 backdrop-blur">
            <strong className="block truncate text-[#1d192b]">{props.value || "31.2304, 121.4737"}</strong>
            <span className="mt-0.5 block truncate text-[#49454f]">{props.helper || "缩放 14"}</span>
          </div>
        </div>
      </section>
    );
  }

  if (item.type === "graphics-view") {
    const layers = itemOptionTexts(props);
    const current = String(props.value || layers[0] || "100%");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-outline-variant bg-surface-container px-3">
          <Grid3x3 aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "图形视图"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description || "可缩放场景"}</p>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[0.66rem] font-semibold text-primary">{current}</span>
        </header>
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[linear-gradient(90deg,hsl(var(--outline-variant)/0.28)_1px,transparent_1px),linear-gradient(180deg,hsl(var(--outline-variant)/0.28)_1px,transparent_1px)] bg-[length:32px_32px]">
          <svg className="absolute inset-0 h-full w-full text-primary/45" aria-hidden viewBox="0 0 480 260" preserveAspectRatio="none">
            <path d="M110 92 C180 52 252 58 326 112" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M148 172 C230 210 302 190 370 146" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          {[
            ["left-[12%] top-[18%] w-[30%]", layers[0] ?? "节点"],
            ["right-[10%] top-[32%] w-[34%]", layers[1] ?? "连线"],
            ["left-[30%] bottom-[16%] w-[38%]", layers[2] ?? "注释"],
          ].map(([position, label], index) => (
            <button
              key={`${label}-${index}`}
              type="button"
              tabIndex={passive ? -1 : undefined}
              className={cn(
                "absolute min-w-0 rounded-xl border px-3 py-2 text-left text-xs shadow-m3-1 transition",
                position,
                index === 0
                  ? "border-primary bg-primary-container text-primary"
                  : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container",
              )}
            >
              <span className="block truncate font-semibold">{label}</span>
              <span className="mt-1 block h-1.5 w-2/3 rounded-full bg-current opacity-20" />
            </button>
          ))}
        </div>
        <footer className="flex h-10 shrink-0 items-center gap-1.5 border-t border-outline-variant bg-surface-container px-2">
          {layers.slice(0, 3).map((layer) => (
            <span key={layer} className="min-w-0 truncate rounded-full bg-surface-container-high px-2 py-1 text-[0.66rem] text-on-surface-variant">
              {layer}
            </span>
          ))}
        </footer>
      </section>
    );
  }

  if (item.type === "carousel") {
    const options = itemOptionTexts(props);
    const activeIndex = Math.max(0, options.findIndex((option) => option === props.value));
    return (
      <section className="flex h-full w-full gap-3 overflow-hidden rounded-[26px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        {options.map((option, index) => {
          const active = index === activeIndex || (activeIndex === -1 && index === 0);
          return (
            <article
              key={option}
              className={cn(
                "relative flex min-w-0 flex-col justify-end overflow-hidden rounded-[22px] border border-outline-variant p-3 transition",
                active ? "flex-[1.35] bg-primary-container text-primary-container-foreground" : "flex-1 bg-surface-container-high text-on-surface",
              )}
            >
              <div className="absolute inset-x-3 top-3 h-16 rounded-[18px] bg-surface-container-lowest/55" />
              <p className="relative z-10 truncate text-sm font-semibold">{option}</p>
              <p className="relative z-10 mt-1 line-clamp-2 text-[0.68rem] opacity-75">{index === 0 ? props.title : props.description}</p>
            </article>
          );
        })}
      </section>
    );
  }

  if (item.type === "input") {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <Label className="truncate text-xs">{props.label}</Label>
        <Input className="min-h-0 flex-1" placeholder={props.placeholder} tabIndex={passive ? -1 : undefined} />
        {item.height >= 86 ? <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </div>
    );
  }

  if (item.type === "password-field") {
    const visible = Boolean(props.checked);
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <Label className="truncate text-xs">{props.label}</Label>
        <div className="flex min-h-0 flex-1 items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-low px-2 shadow-m3-1">
          <Lock aria-hidden className="size-4 shrink-0 text-on-surface-variant" />
          <Input
            className="h-9 min-w-0 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
            placeholder={props.placeholder}
            tabIndex={passive ? -1 : undefined}
            type={visible ? "text" : "password"}
            value={String(props.value ?? "")}
            readOnly
          />
          <Button
            aria-label={visible ? "隐藏密码" : "显示密码"}
            className="h-8 shrink-0 rounded-lg px-2 text-xs"
            size="sm"
            tabIndex={passive ? -1 : undefined}
            type="button"
            variant="ghost"
          >
            {visible ? "隐藏" : "显示"}
          </Button>
        </div>
        {item.height >= 86 ? <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </div>
    );
  }

  if (item.type === "number-field") {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <Label className="truncate text-xs">{props.label}</Label>
        <div className="flex min-h-0 flex-1 items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-low px-2 shadow-m3-1">
          <Button
            aria-label="减少数值"
            className="size-8 shrink-0 rounded-lg"
            size="icon"
            tabIndex={passive ? -1 : undefined}
            type="button"
            variant="ghost"
          >
            -
          </Button>
          <Input
            className="h-9 min-w-0 flex-1 border-0 bg-transparent px-1 text-right font-mono shadow-none focus-visible:ring-0"
            placeholder={props.placeholder}
            tabIndex={passive ? -1 : undefined}
            type="number"
            value={String(props.value ?? "")}
            readOnly
          />
          <Button
            aria-label="增加数值"
            className="size-8 shrink-0 rounded-lg"
            size="icon"
            tabIndex={passive ? -1 : undefined}
            type="button"
            variant="ghost"
          >
            +
          </Button>
        </div>
        {item.height >= 86 ? <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </div>
    );
  }

  if (item.type === "spin-box") {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <Label className="truncate text-xs">{props.label}</Label>
        <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low shadow-m3-1">
          <Input
            className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-right font-mono shadow-none focus-visible:ring-0"
            placeholder={props.placeholder}
            tabIndex={passive ? -1 : undefined}
            type="number"
            value={String(props.value ?? "")}
            readOnly
          />
          <div className="grid w-9 shrink-0 grid-rows-2 border-l border-outline-variant">
            <button type="button" tabIndex={passive ? -1 : undefined} className="text-[0.7rem] text-on-surface-variant hover:bg-surface-container-high">▲</button>
            <button type="button" tabIndex={passive ? -1 : undefined} className="border-t border-outline-variant text-[0.7rem] text-on-surface-variant hover:bg-surface-container-high">▼</button>
          </div>
        </div>
        {item.height >= 86 ? <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </div>
    );
  }

  if (item.type === "double-spin-box") {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <Label className="truncate text-xs">{props.label}</Label>
        <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low shadow-m3-1">
          <Input
            className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-right font-mono shadow-none focus-visible:ring-0"
            placeholder={props.placeholder}
            tabIndex={passive ? -1 : undefined}
            type="number"
            value={String(props.value ?? "")}
            readOnly
          />
          <div className="grid w-9 shrink-0 grid-rows-2 border-l border-outline-variant">
            <button type="button" tabIndex={passive ? -1 : undefined} className="text-[0.7rem] text-on-surface-variant hover:bg-surface-container-high">+0.1</button>
            <button type="button" tabIndex={passive ? -1 : undefined} className="border-t border-outline-variant text-[0.7rem] text-on-surface-variant hover:bg-surface-container-high">-0.1</button>
          </div>
        </div>
        {item.height >= 86 ? <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </div>
    );
  }

  if (item.type === "dial") {
    const percent = numericPercent(props.value, 42);
    const angle = -135 + percent * 2.7;
    return (
      <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-3 text-center shadow-m3-1">
        <div
          className="relative grid size-20 shrink-0 place-items-center rounded-full border border-outline-variant"
          style={{ background: `conic-gradient(hsl(var(--primary)) ${percent * 3.6}deg, hsl(var(--surface-container-high)) 0deg)` }}
        >
          <span className="grid size-14 place-items-center rounded-full bg-surface-container-low text-sm font-semibold">{percent}</span>
          <span
            className="absolute left-1/2 top-2 h-7 w-1 origin-[50%_30px] -translate-x-1/2 rounded-full bg-on-surface"
            style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
          />
        </div>
        <p className="mt-2 max-w-full truncate text-xs font-medium">{props.label}</p>
        <p className="max-w-full truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p>
      </div>
    );
  }

  if (item.type === "textarea") {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <Label className="truncate text-xs">{props.label}</Label>
        <Textarea className="min-h-0 flex-1 resize-none" placeholder={props.placeholder} tabIndex={passive ? -1 : undefined} />
      </div>
    );
  }

  if (item.type === "plain-text-edit") {
    const rows = String(props.value || props.placeholder || "").split(/\n/).slice(0, 6);
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-outline-variant px-3">
          <Label className="truncate text-xs">{props.label}</Label>
          <span className="rounded-full bg-surface-container-high px-2 py-1 text-[0.66rem] text-on-surface-variant">plain</span>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden bg-[#17151b] p-3 font-mono text-xs text-[#f7f2fa]">
          {rows.length > 0 ? rows.map((row, index) => (
            <div key={`${row}-${index}`} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2">
              <span className="text-right text-[#79747e]">{index + 1}</span>
              <span className="truncate">{row}</span>
            </div>
          )) : <span className="text-[#cac4d0]">{props.placeholder}</span>}
        </div>
      </section>
    );
  }

  if (item.type === "rich-text-editor") {
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-10 shrink-0 items-center gap-1 border-b border-outline-variant px-2">
          {["B", "I", "•"].map((tool) => (
            <button key={tool} type="button" tabIndex={passive ? -1 : undefined} className="h-7 w-8 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface-variant">
              {tool}
            </button>
          ))}
          <span className="ml-auto truncate text-[0.68rem] text-on-surface-variant">{props.label}</span>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden p-3">
          <p className="line-clamp-3 text-sm leading-6 text-on-surface">{props.value || props.placeholder}</p>
          <p className="mt-2 truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p>
        </div>
      </section>
    );
  }

  if (item.type === "code-editor") {
    const rows = String(props.value || props.placeholder || "")
      .split(/\n/)
      .slice(0, 8);
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-outline-variant bg-[#17151b] text-[#f7f2fa] shadow-m3-2">
        <header className="flex h-10 shrink-0 items-center gap-2 border-b border-white/10 bg-[#211f26] px-3">
          <Braces aria-hidden className="size-4 shrink-0 text-[#d0bcff]" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xs font-semibold">{props.title || "代码编辑器"}</h3>
          </div>
          <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[0.64rem] font-semibold text-[#d0bcff]">{props.label || "Code"}</span>
          {props.readOnly ? <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[0.64rem] text-[#cac4d0]">RO</span> : null}
        </header>
        <div className="min-h-0 flex-1 overflow-hidden p-3 font-mono text-xs leading-5">
          {rows.length > 0 ? rows.map((row, index) => {
            const keyword = row.match(/^(\s*)(fn|let|const|return|Ok|Err)\b/);
            return (
              <div key={`${row}-${index}`} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                <span className="select-none text-right text-[#79747e]">{index + 1}</span>
                <span className="min-w-0 truncate">
                  {keyword ? (
                    <>
                      <span>{keyword[1]}</span>
                      <span className="text-[#d0bcff]">{keyword[2]}</span>
                      <span>{row.slice(keyword[0].length)}</span>
                    </>
                  ) : (
                    row
                  )}
                </span>
              </div>
            );
          }) : <span className="text-[#cac4d0]">{props.placeholder || "输入代码..."}</span>}
        </div>
        <footer className="flex h-8 shrink-0 items-center justify-between gap-2 border-t border-white/10 bg-[#211f26] px-3 text-[0.66rem] text-[#cac4d0]">
          <span className="truncate">{props.helper || "Ln 1, Col 1"}</span>
          <span className="truncate">{props.description || "UTF-8 · LF"}</span>
        </footer>
      </section>
    );
  }

  if (item.type === "search-bar") {
    return (
      <div className="flex h-full w-full items-center gap-3 rounded-full border border-outline-variant bg-surface-container-high px-4 shadow-m3-1">
        <Search aria-hidden className="size-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-on-surface">{props.value || props.placeholder || "搜索"}</p>
          <p className="truncate text-[0.68rem] text-on-surface-variant">{props.label || "Search"}</p>
        </div>
        <span className="rounded-full bg-surface-container-highest px-2 py-1 text-[0.66rem] text-on-surface-variant">Enter</span>
      </div>
    );
  }

  if (item.type === "search-view") {
    const options = itemOptionTexts(props);
    const query = (props.helper || "").trim().toLowerCase();
    const rows = query ? options.filter((option) => option.toLowerCase().includes(query)) : options;
    const current = props.value || rows[0] || options[0] || "";
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-lowest shadow-m3-2">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-outline-variant bg-surface-container-low px-4 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{props.title || "搜索视图"}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">{props.description || "搜索建议和结果面板"}</p>
          </div>
          <span className="shrink-0 rounded-full bg-primary-container px-2.5 py-1 text-[0.66rem] font-medium text-primary">{rows.length} 项</span>
        </header>
        <div className="shrink-0 px-3 pt-3">
          <div className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-3 py-2 shadow-sm">
            <Search aria-hidden className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate text-sm text-on-surface">{props.helper || props.placeholder || "搜索"}</span>
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[0.66rem] text-on-surface-variant">Enter</span>
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-hidden p-3">
          {rows.length > 0 ? rows.map((option, index) => {
            const active = option === current || (!current && index === 0);
            return (
              <button
                key={option}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid w-full grid-cols-[2.25rem_minmax(0,1fr)_4rem] items-center gap-2 rounded-2xl px-2.5 py-2 text-left text-xs transition",
                  active ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className="flex size-8 items-center justify-center rounded-xl bg-surface-container text-primary">{index + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-on-surface">{option}</span>
                  <span className="block truncate text-[0.68rem] opacity-75">{index === 0 ? "UI 文件" : index === 1 ? "设置页" : "命令"}</span>
                </span>
                <span className="truncate text-right text-[0.66rem] opacity-75">{active ? "选中" : "打开"}</span>
              </button>
            );
          }) : (
            <div className="flex h-full min-h-0 flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant px-4 text-center">
              <Search aria-hidden className="mb-2 size-5 text-on-surface-variant" />
              <p className="text-sm font-medium">没有匹配结果</p>
              <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">{props.placeholder || "尝试搜索其他项目内容"}</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (item.type === "search-suggestion-list") {
    const options = itemOptionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-low shadow-m3-2">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <Search aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{props.title || "搜索建议"}</p>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.placeholder || props.helper}</p>
          </div>
          <Badge variant="outline" className="shrink-0 text-[0.64rem]">{props.label || "建议"}</Badge>
        </header>
        <div className="min-h-0 flex-1 space-y-1 overflow-hidden p-2">
          {options.slice(0, 5).map((option, index) => {
            const active = option === current || (!current && index === 0);
            return (
              <button
                key={option}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid h-10 w-full grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-2 text-left text-xs transition-colors",
                  active ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <Clock3 aria-hidden className="size-4 justify-self-center" />
                <span className="truncate font-medium text-on-surface">{option}</span>
                <span className="truncate text-[0.64rem] opacity-75">{index === 0 ? "最近" : "建议"}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "filter-bar") {
    const filters = itemOptionTexts(props);
    const current = String(props.value ?? filters[0] ?? "");
    return (
      <section className="flex h-full w-full items-center gap-2 overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low px-3 shadow-m3-1">
        <div className="flex min-w-[11rem] flex-1 items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-3 py-2">
          <Search aria-hidden className="size-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-sm text-on-surface">{props.placeholder || props.title || "搜索"}</span>
        </div>
        <div className="flex min-w-0 shrink items-center gap-1 overflow-hidden">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              tabIndex={passive ? -1 : undefined}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition",
                filter === current ? "bg-primary text-primary-foreground shadow-m3-1" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest",
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        <Badge className="shrink-0" variant="outline">{props.helper || props.label || "0 项"}</Badge>
      </section>
    );
  }

  if (item.type === "tag-input") {
    const tags = String(props.value || "")
      .split(/[,\u3001/]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);
    const visibleTags = tags.length > 0 ? tags : itemOptionTexts(props).slice(0, 3);
    return (
      <section className="flex h-full w-full flex-col justify-center gap-2 overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <Label className="truncate text-xs">{props.label || "标签"}</Label>
          <Badge variant="outline" className="shrink-0 text-[0.64rem]">
            {visibleTags.length}
          </Badge>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap content-center items-center gap-1.5 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container px-2 py-1.5">
          {visibleTags.map((tag) => (
            <span key={tag} className="inline-flex max-w-full items-center gap-1 rounded-full bg-secondary-container px-2.5 py-1 text-xs font-medium text-secondary-container-foreground">
              <span className="max-w-24 truncate">{tag}</span>
              <X aria-hidden className="size-3" />
            </span>
          ))}
          <span className="min-w-20 flex-1 truncate px-1 text-xs text-on-surface-variant">{props.placeholder || "输入标签..."}</span>
        </div>
        {props.helper ? <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </section>
    );
  }

  if (item.type === "checkbox") {
    return (
      <label className="flex h-full w-full items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-4">
        <Checkbox checked={Boolean(props.checked)} tabIndex={passive ? -1 : undefined} />
        <span className="truncate text-sm font-medium">{props.label}</span>
      </label>
    );
  }

  if (item.type === "checkbox-group") {
    const options = itemOptionTexts(props);
    const selectedValues = new Set(String(props.value || options[0] || "").split(/[,\u3001/]+/).map((part) => part.trim()).filter(Boolean));
    return (
      <fieldset className="flex h-full w-full flex-col justify-center gap-2 overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-low px-4 py-3 shadow-m3-1">
        <legend className="sr-only">{props.label}</legend>
        <div className="flex min-w-0 items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-on-surface-variant">{props.label || "复选框组"}</p>
          {props.helper ? <span className="shrink-0 truncate text-[0.66rem] text-on-surface-variant">{props.helper}</span> : null}
        </div>
        <div className="grid min-h-0 gap-1.5 overflow-hidden">
          {options.map((option, index) => {
            const active = selectedValues.has(option) || (selectedValues.size === 0 && index === 0);
            return (
              <label key={option} className="flex min-w-0 items-center gap-2 rounded-xl px-1 py-1 text-sm">
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border transition",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-outline bg-surface",
                  )}
                >
                  {active ? <Check aria-hidden className="size-3" /> : null}
                </span>
                <span className="truncate">{option}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (item.type === "radio") {
    const options = itemOptionTexts(props);
    return (
      <fieldset className="flex h-full w-full flex-col justify-center gap-2 overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-low px-4 py-3">
        <legend className="sr-only">{props.label}</legend>
        <p className="truncate text-xs font-medium text-on-surface-variant">{props.label}</p>
        {options.map((option) => {
          const active = option === props.value || (props.checked && option === options[0]);
          return (
          <label key={option} className="flex min-w-0 items-center gap-2 text-sm">
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full border",
                active ? "border-primary" : "border-outline",
              )}
            >
              {active ? <span className="size-2 rounded-full bg-primary" /> : null}
            </span>
            <span className="truncate">{option}</span>
          </label>
        );
        })}
      </fieldset>
    );
  }

  if (item.type === "radio-group") {
    const options = itemOptionTexts(props);
    const current = String(props.value || options[0] || "");
    return (
      <fieldset className="flex h-full w-full flex-col justify-center gap-2 overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-low px-4 py-3 shadow-m3-1">
        <legend className="sr-only">{props.label}</legend>
        <div className="flex min-w-0 items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-on-surface-variant">{props.label || "Radio Group"}</p>
          {props.helper ? <span className="shrink-0 truncate text-[0.66rem] text-on-surface-variant">{props.helper}</span> : null}
        </div>
        <div className="grid min-h-0 gap-1.5 overflow-hidden" role="radiogroup" aria-label={props.label || "Radio Group"}>
          {options.map((option, index) => {
            const active = option === current || (!current && index === 0);
            return (
              <label
                key={option}
                className={cn(
                  "flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors",
                  active ? "bg-secondary-container text-secondary-container-foreground" : "text-on-surface hover:bg-surface-container-high",
                )}
              >
                <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-full border", active ? "border-primary" : "border-outline")}>
                  {active ? <span className="size-2 rounded-full bg-primary" /> : null}
                </span>
                <span className="truncate">{option}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (item.type === "switch") {
    return (
      <div className="flex h-full w-full items-center justify-between gap-4 overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-low px-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium">{props.title}</h3>
          <p className="mt-1 truncate text-xs text-on-surface-variant">{props.description}</p>
        </div>
        <Switch checked={Boolean(props.checked)} tabIndex={passive ? -1 : undefined} />
      </div>
    );
  }

  if (item.type === "slider") {
    const percent = numericPercent(props.value, 50);
    return (
      <div className="flex h-full w-full flex-col justify-center gap-2 rounded-[20px] border border-outline-variant bg-surface-container-low px-4">
        <div className="flex items-center justify-between gap-2">
          <Label className="truncate text-xs">{props.label}</Label>
          <span className="text-xs tabular-nums text-on-surface-variant">{percent}</span>
        </div>
        <div className="relative h-8">
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-surface-container-highest" />
          <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
          <span className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-m3-1" style={{ left: `${percent}%` }} />
        </div>
        <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p>
      </div>
    );
  }

  if (item.type === "range-slider") {
    const [rawStart, rawEnd] = String(props.value || "24,78").split(",");
    const start = Math.min(numericPercent(rawStart, 24), numericPercent(rawEnd, 78));
    const end = Math.max(numericPercent(rawStart, 24), numericPercent(rawEnd, 78));
    return (
      <div className="flex h-full w-full flex-col justify-center gap-2 rounded-[20px] border border-outline-variant bg-surface-container-low px-4 shadow-m3-1">
        <div className="flex items-center justify-between gap-2">
          <Label className="truncate text-xs">{props.label || "范围"}</Label>
          <span className="text-xs tabular-nums text-on-surface-variant">
            {start} - {end}
          </span>
        </div>
        <div className="relative h-8">
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-surface-container-highest" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
            style={{ left: `${start}%`, width: `${Math.max(end - start, 1)}%` }}
          />
          <span className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-surface shadow-m3-1" style={{ left: `${start}%` }} />
          <span className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-primary shadow-m3-1" style={{ left: `${end}%` }} />
        </div>
        <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p>
      </div>
    );
  }

  if (item.type === "rating") {
    const ratingValue = Math.max(0, Math.min(5, Number.parseInt(String(props.value || "4"), 10) || 0));
    return (
      <div className="flex h-full w-full flex-col justify-center gap-2 rounded-[20px] border border-outline-variant bg-surface-container-low px-4 py-3 shadow-m3-1">
        <div className="flex items-center justify-between gap-2">
          <Label className="truncate text-xs">{props.label || "评分"}</Label>
          <span className="shrink-0 text-xs tabular-nums text-on-surface-variant">{ratingValue}/5</span>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }, (_, index) => {
            const active = index < ratingValue;
            return (
              <button
                key={index}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn("rounded-lg p-0.5 transition-colors", active ? "text-primary" : "text-outline hover:text-on-surface-variant")}
                aria-label={`${index + 1} 星`}
              >
                <Star aria-hidden className={cn("size-5", active && "fill-current")} />
              </button>
            );
          })}
        </div>
        {props.helper ? <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </div>
    );
  }

  if (item.type === "scroll-bar") {
    const percent = numericPercent(props.value, 45);
    return (
      <div className="flex h-full w-full flex-col justify-center gap-1 overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low px-3 shadow-m3-1">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="truncate font-medium">{props.label}</span>
          <span className="shrink-0 tabular-nums text-on-surface-variant">{percent}</span>
        </div>
        <div className="grid h-7 grid-cols-[1.8rem_minmax(0,1fr)_1.8rem] overflow-hidden rounded-xl border border-outline-variant bg-surface-container">
          <button type="button" tabIndex={passive ? -1 : undefined} className="border-r border-outline-variant text-[0.7rem] text-on-surface-variant">◀</button>
          <div className="relative">
            <span className="absolute inset-y-1 w-14 rounded-lg bg-primary" style={{ left: `calc(${percent}% - 1.75rem)` }} />
          </div>
          <button type="button" tabIndex={passive ? -1 : undefined} className="border-l border-outline-variant text-[0.7rem] text-on-surface-variant">▶</button>
        </div>
      </div>
    );
  }

  if (item.type === "color-picker") {
    const swatches = itemOptionTexts(props);
    const value = props.value || swatches[0] || "#6750a4";
    return (
      <div className="flex h-full w-full flex-col justify-center gap-2 rounded-[20px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <Label className="truncate text-xs">{props.label}</Label>
          <span className="font-mono text-xs text-on-surface-variant">{value}</span>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <span className="size-9 shrink-0 rounded-xl border border-outline-variant shadow-m3-1" style={{ backgroundColor: value }} />
          <div className="flex min-w-0 flex-1 gap-1.5 overflow-hidden">
            {swatches.map((swatch) => (
              <button
                key={swatch}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "size-7 shrink-0 rounded-full border transition",
                  swatch === value ? "border-primary ring-2 ring-primary/25" : "border-outline-variant",
                )}
                style={{ backgroundColor: swatch }}
                aria-label={`选择颜色 ${swatch}`}
              />
            ))}
          </div>
        </div>
        {props.helper ? <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </div>
    );
  }

  if (item.type === "color-swatch-grid") {
    const swatches = itemOptionTexts(props);
    const value = String(props.value ?? swatches[0] ?? "#6750a4");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <header className="mb-3 flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{props.title || "色板"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper || props.description}</p>
          </div>
          <span className="shrink-0 rounded-lg border border-outline-variant bg-surface-container px-2 py-1 font-mono text-[0.68rem] text-on-surface-variant">
            {value}
          </span>
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 overflow-hidden">
          {swatches.map((swatch, index) => {
            const active = swatch === value || (!value && index === 0);
            return (
              <button
                key={`${swatch}-${index}`}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "focus-ring flex min-w-0 flex-col justify-end overflow-hidden rounded-2xl border p-2 text-left transition",
                  active ? "border-primary ring-2 ring-primary/20" : "border-outline-variant hover:border-primary/60",
                )}
                style={{ backgroundColor: swatch }}
                aria-label={`选择色板 ${swatch}`}
              >
                <span className="rounded-lg bg-surface/85 px-2 py-1 text-[0.66rem] font-semibold text-on-surface shadow-m3-1">
                  {index === 0 ? props.label || "Primary" : index === 1 ? "Secondary" : "Error"}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "file-picker") {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-2 rounded-[20px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="flex min-w-0 items-center gap-2">
          <FolderOpen aria-hidden className="size-4 shrink-0 text-primary" />
          <Label className="truncate text-xs">{props.label}</Label>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 flex-1 truncate rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-xs text-on-surface">
            {props.value || props.placeholder || "选择文件"}
          </span>
          <Button size="sm" variant="secondary" className="h-8 shrink-0" tabIndex={passive ? -1 : undefined}>
            浏览
          </Button>
        </div>
        {props.helper ? <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </div>
    );
  }

  if (item.type === "folder-picker") {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-2 rounded-[20px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="flex min-w-0 items-center gap-2">
          <FolderOpen aria-hidden className="size-4 shrink-0 text-primary" />
          <Label className="truncate text-xs">{props.label || "文件夹"}</Label>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 flex-1 truncate rounded-xl border border-outline-variant bg-surface-container px-3 py-2 font-mono text-xs text-on-surface">
            {props.value || props.placeholder || "选择文件夹"}
          </span>
          <Button size="sm" variant="secondary" className="h-8 shrink-0" tabIndex={passive ? -1 : undefined}>
            浏览
          </Button>
        </div>
        {props.helper ? <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </div>
    );
  }

  if (item.type === "shortcut-recorder") {
    const keys = String(props.value || "Ctrl+R")
      .split("+")
      .map((key) => key.trim())
      .filter(Boolean);
    return (
      <div className="flex h-full w-full flex-col justify-center gap-2 rounded-[20px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <Label className="truncate text-xs">{props.label}</Label>
          <span className="truncate text-[0.68rem] text-on-surface-variant">录入</span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
          {keys.map((key) => (
            <span key={key} className="rounded-lg border border-outline-variant bg-surface-container-high px-2.5 py-1.5 font-mono text-xs font-semibold shadow-sm">
              {key}
            </span>
          ))}
          <span className="min-w-0 truncate text-xs text-on-surface-variant">{props.helper}</span>
        </div>
      </div>
    );
  }

  if (item.type === "select") {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <Label className="truncate text-xs">{props.label}</Label>
        <div className="flex min-h-0 flex-1 items-center justify-between rounded-xl bg-surface-container-highest px-4 text-sm">
          <span className="truncate">{props.value}</span>
          <span className="text-on-surface-variant">⌄</span>
        </div>
      </div>
    );
  }

  if (item.type === "multi-select") {
    const options = itemOptionTexts(props);
    const selectedValues = new Set(String(props.value || options[0] || "").split(/[,\u3001/]+/).map((part) => part.trim()).filter(Boolean));
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <Label className="truncate text-xs">{props.label || "多选列表"}</Label>
          <Badge variant="outline" className="shrink-0 text-[0.64rem]">
            {selectedValues.size}/{options.length}
          </Badge>
        </div>
        <div className="mt-2 grid min-h-0 flex-1 gap-1 overflow-hidden">
          {options.map((option, index) => {
            const active = selectedValues.has(option) || (selectedValues.size === 0 && index === 0);
            return (
              <button
                key={option}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-left text-xs transition-colors",
                  active ? "bg-secondary-container text-secondary-container-foreground" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-outline",
                  )}
                >
                  {active ? <Check aria-hidden className="size-3" /> : null}
                </span>
                <span className="truncate">{option}</span>
              </button>
            );
          })}
        </div>
        {props.helper ? <p className="mt-2 truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </section>
    );
  }

  if (item.type === "combobox") {
    const options = itemOptionTexts(props);
    return (
      <div className="flex h-full w-full flex-col gap-2 rounded-[20px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <Label className="truncate text-xs">{props.label}</Label>
          <ChevronDown aria-hidden className="size-4 shrink-0 text-on-surface-variant" />
        </div>
        <div className="flex min-h-0 flex-1 items-center gap-2 rounded-xl bg-surface-container-highest px-3 text-sm">
          <Search aria-hidden className="size-4 shrink-0 text-primary" />
          <span className="truncate">{props.value || props.placeholder || options[0]}</span>
        </div>
        {item.height >= 112 ? (
          <div className="flex gap-1 overflow-hidden">
            {options.slice(0, 3).map((option) => (
              <span key={option} className="max-w-full truncate rounded-full bg-surface-container-high px-2 py-1 text-[0.66rem] text-on-surface-variant">
                {option}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (item.type === "autocomplete") {
    const options = itemOptionTexts(props);
    const query = String(props.value || "").trim().toLowerCase();
    const matchingOptions = query
      ? options.filter((option) => option.toLowerCase().includes(query) || query.includes(option.toLowerCase()))
      : options;
    const visibleOptions = (matchingOptions.length > 0 ? matchingOptions : options).slice(0, 3);
    const current = String(props.value || props.placeholder || "输入关键字");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <Label className="truncate text-xs">{props.label || "自动补全"}</Label>
          <Badge variant="outline" className="shrink-0 text-[0.64rem]">
            {props.helper || `${options.length} 项`}
          </Badge>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-sm">
          <Search aria-hidden className="size-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate">{current}</span>
        </div>
        <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-hidden">
          {visibleOptions.length > 0 ? (
            visibleOptions.map((option, index) => {
              const active = option === props.value || index === 0;
              return (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    "flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-lg px-2 text-left text-xs transition-colors",
                    active ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container-high",
                  )}
                >
                  <span className="truncate">{option}</span>
                  {active ? <Check aria-hidden className="size-3.5 shrink-0" /> : null}
                </button>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-outline-variant px-2 py-1.5 text-xs text-on-surface-variant">没有匹配项</div>
          )}
        </div>
      </section>
    );
  }

  if (item.type === "font-combo-box") {
    const options = itemOptionTexts(props);
    const current = props.value || options[0] || "Inter";
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <Label className="truncate text-xs">{props.label}</Label>
        <div className="flex min-h-0 flex-1 items-center gap-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low px-3 shadow-m3-1">
          <Type aria-hidden className="size-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-sm" style={{ fontFamily: current }}>{current}</span>
          <ChevronDown aria-hidden className="size-4 shrink-0 text-on-surface-variant" />
        </div>
      </div>
    );
  }

  if (item.type === "date-picker") {
    return (
      <div className="flex h-full w-full flex-col gap-2 rounded-[20px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays aria-hidden className="size-4 shrink-0 text-primary" />
          <Label className="truncate text-xs">{props.label}</Label>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-between gap-3 rounded-xl bg-surface-container-highest px-3 text-sm">
          <span className="truncate font-medium">{props.value || props.placeholder || "选择日期"}</span>
          <span className="text-on-surface-variant">⌄</span>
        </div>
        {props.helper ? <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </div>
    );
  }

  if (item.type === "date-range-picker") {
    const options = itemOptionTexts(props);
    const [rawStart, rawEnd] = String(props.value || "2026-07-01,2026-07-14").split(/[,\u2192]+/).map((part) => part.trim()).filter(Boolean);
    const start = rawStart || "2026-07-01";
    const end = rawEnd || "2026-07-14";
    const selectedDays = [3, 4, 5, 6, 7, 8, 9, 10];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <header className="flex shrink-0 items-center gap-2">
          <CalendarDays aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.label || "日期范围"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper || props.placeholder || "选择开始和结束日期"}</p>
          </div>
        </header>
        <div className="mt-3 grid shrink-0 grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1fr)] items-center gap-2">
          <span className="truncate rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-xs font-medium">{start}</span>
          <span className="text-center text-xs text-on-surface-variant">to</span>
          <span className="truncate rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-xs font-medium">{end}</span>
        </div>
        <div className="mt-2 flex shrink-0 gap-1 overflow-hidden">
          {options.map((option, index) => (
            <button
              key={option}
              type="button"
              tabIndex={passive ? -1 : undefined}
              className={cn("shrink-0 rounded-full px-2.5 py-1 text-[0.66rem] font-medium", index === 1 ? "bg-primary-container text-primary" : "bg-surface-container-high text-on-surface-variant")}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mt-2 grid min-h-0 flex-1 grid-cols-7 gap-1 overflow-hidden rounded-2xl bg-surface-container p-2">
          {Array.from({ length: 21 }, (_, index) => index + 1).map((day) => {
            const active = selectedDays.includes(day);
            const edge = day === selectedDays[0] || day === selectedDays[selectedDays.length - 1];
            return (
              <span
                key={day}
                className={cn(
                  "flex min-h-5 items-center justify-center rounded-lg text-[0.64rem]",
                  active ? "bg-secondary-container text-secondary-container-foreground" : "text-on-surface-variant",
                  edge && "bg-primary text-primary-foreground",
                )}
              >
                {day}
              </span>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "time-picker") {
    return (
      <div className="flex h-full w-full flex-col gap-2 rounded-[20px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays aria-hidden className="size-4 shrink-0 text-primary" />
          <Label className="truncate text-xs">{props.label}</Label>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-between gap-3 rounded-xl bg-surface-container-highest px-3 text-sm">
          <span className="truncate font-mono text-base font-semibold tabular-nums">{props.value || "00:00"}</span>
          <span className="rounded-full bg-primary-container px-2 py-1 text-[0.66rem] font-medium text-primary">24h</span>
        </div>
        {props.helper ? <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </div>
    );
  }

  if (item.type === "date-time-picker") {
    return (
      <div className="flex h-full w-full flex-col gap-2 rounded-[20px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays aria-hidden className="size-4 shrink-0 text-primary" />
          <Label className="truncate text-xs">{props.label}</Label>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-between gap-3 rounded-xl bg-surface-container-highest px-3 text-sm">
          <span className="truncate font-mono text-sm font-semibold tabular-nums">{props.value || "2026-06-30T09:30"}</span>
          <span className="rounded-full bg-primary-container px-2 py-1 text-[0.66rem] font-medium text-primary">date+time</span>
        </div>
        {props.helper ? <p className="truncate text-[0.68rem] text-on-surface-variant">{props.helper}</p> : null}
      </div>
    );
  }

  if (item.type === "calendar-widget") {
    const days = Array.from({ length: 35 }, (_, index) => index + 1);
    const selectedDay = Math.max(1, Math.min(31, Number(String(props.value || "").slice(-2)) || 30));
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <header className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{props.label || "Calendar"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.value || props.helper}</p>
          </div>
          <CalendarDays aria-hidden className="size-4 shrink-0 text-primary" />
        </header>
        <div className="grid grid-cols-7 gap-1 text-center text-[0.65rem] text-on-surface-variant">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
        </div>
        <div className="mt-1 grid min-h-0 flex-1 grid-cols-7 gap-1 overflow-hidden">
          {days.map((day) => {
            const calendarDay = ((day + 24) % 31) + 1;
            const active = calendarDay === selectedDay;
            return (
              <button
                key={day}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn("rounded-lg text-xs transition", active ? "bg-primary text-primary-foreground" : "bg-surface-container text-on-surface-variant")}
              >
                {calendarDay}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "calendar-scheduler") {
    const events = itemOptionTexts(props);
    const selected = String(props.value ?? "周三");
    const days = ["周一", "周二", "周三", "周四", "周五"];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <CalendarDays aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "日程表"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description || props.helper}</p>
          </div>
          <Badge className="shrink-0" variant="outline">{props.helper || `${events.length} 项`}</Badge>
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-5 divide-x divide-outline-variant overflow-hidden">
          {days.map((day, index) => {
            const active = day === selected || (!selected && index === 2);
            const event = events[index % events.length] ?? props.label ?? "事件";
            return (
              <button
                key={day}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn("flex min-w-0 flex-col gap-2 p-2 text-left transition", active ? "bg-primary-container text-primary" : "hover:bg-surface-container-high")}
              >
                <span className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.08em]">{day}</span>
                <span className="min-h-12 rounded-xl border border-outline-variant bg-surface-container px-2 py-2 text-xs shadow-m3-1">
                  <span className="block truncate font-medium text-on-surface">{event}</span>
                  <span className="mt-1 block truncate text-[0.66rem] text-on-surface-variant">{index + 9}:30 - {index + 10}:20</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "segmented") {
    const options = itemOptionTexts(props);
    return (
      <div className="flex h-full w-full items-center rounded-full border border-outline-variant bg-surface-container-high p-1 shadow-m3-1">
        {options.map((option) => {
          const active = option === props.value || (!props.value && option === options[0]);
          return (
            <span
              key={option}
              className={cn(
                "min-w-0 flex-1 truncate rounded-full px-3 py-2 text-center text-xs font-medium transition",
                active ? "bg-secondary-container text-secondary-container-foreground shadow-m3-1" : "text-on-surface-variant",
              )}
            >
              {option}
            </span>
          );
        })}
      </div>
    );
  }

  if (item.type === "chips") {
    const options = itemOptionTexts(props);
    return (
      <div className="flex h-full w-full flex-wrap content-center items-center gap-2 overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        {options.map((option) => {
          const active = option === props.value || (!props.value && option === options[0]);
          return (
            <span
              key={option}
              className={cn(
                "max-w-full truncate rounded-full border px-3 py-1.5 text-xs font-medium",
                active
                  ? "border-primary bg-secondary-container text-secondary-container-foreground shadow-m3-1"
                  : "border-outline-variant bg-surface-container-high text-on-surface-variant",
              )}
            >
              {option}
            </span>
          );
        })}
      </div>
    );
  }

  if (item.type === "assist-chip" || item.type === "filter-chip" || item.type === "input-chip" || item.type === "suggestion-chip") {
    const active = item.type === "filter-chip" ? Boolean(props.checked) : props.variant === "secondary";
    const ChipIcon = item.type === "assist-chip" ? Wand2 : item.type === "filter-chip" ? Check : item.type === "input-chip" ? X : Star;
    return (
      <button
        type="button"
        tabIndex={passive ? -1 : undefined}
        aria-pressed={item.type === "filter-chip" ? active : undefined}
        className={cn(
          "focus-ring flex h-full w-full min-w-0 items-center justify-center gap-2 overflow-hidden rounded-full border px-3 text-xs font-semibold shadow-m3-1 transition",
          active
            ? "border-primary bg-secondary-container text-secondary-container-foreground"
            : props.variant === "ghost"
              ? "border-transparent bg-surface-container-high text-primary hover:bg-primary-container"
              : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high",
        )}
      >
        <ChipIcon aria-hidden className="size-4 shrink-0" />
        <span className="min-w-0 truncate">{props.label || props.value || "Chip"}</span>
        {item.type === "input-chip" ? (
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant" aria-hidden>
            <X className="size-3" />
          </span>
        ) : null}
      </button>
    );
  }

  if (item.type === "tabs") {
    const options = itemOptionTexts(props);
    return (
      <section className="h-full w-full overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="flex gap-1 rounded-full bg-surface-container-high p-1">
          {options.map((option) => {
            const active = option === props.value || (!props.value && option === options[0]);
            return (
              <span
                key={option}
                className={cn(
                  "min-w-0 flex-1 truncate rounded-full px-3 py-1.5 text-center text-xs font-medium",
                  active ? "bg-primary text-primary-foreground shadow-m3-1" : "text-on-surface-variant",
                )}
              >
                {option}
              </span>
            );
          })}
        </div>
        <div className="mt-3 rounded-[16px] bg-surface-container p-3">
          <p className="truncate text-sm font-medium">{props.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">{props.description || "当前标签页内容区域"}</p>
        </div>
      </section>
    );
  }

  if (item.type === "menu-bar") {
    const options = itemOptionTexts(props);
    const current = props.value ?? options[0];
    return (
      <nav className="flex h-full w-full items-center gap-1 overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low px-2 shadow-m3-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            tabIndex={passive ? -1 : undefined}
            className={cn(
              "h-8 min-w-0 rounded-xl px-3 text-xs font-medium transition",
              option === current ? "bg-secondary-container text-secondary-container-foreground" : "text-on-surface-variant hover:bg-surface-container-high",
            )}
          >
            <span className="block truncate">{option}</span>
          </button>
        ))}
        <span className="ml-auto min-w-0 truncate px-2 text-[0.68rem] text-on-surface-variant">{props.description ?? props.title}</span>
      </nav>
    );
  }

  if (item.type === "ribbon-bar") {
    const groups = itemOptionTexts(props);
    const current = props.value ?? groups[0];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <div className="flex h-9 shrink-0 items-center gap-1 border-b border-outline-variant px-2">
          {groups.map((group) => (
            <button
              key={group}
              type="button"
              tabIndex={passive ? -1 : undefined}
              className={cn(
                "focus-ring h-7 min-w-0 rounded-lg px-3 text-xs font-semibold transition",
                group === current ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              <span className="block truncate">{group}</span>
            </button>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 p-2">
          {groups.map((group, index) => (
            <div key={`${group}-tools`} className="flex min-w-0 flex-col justify-between rounded-2xl border border-outline-variant bg-surface-container px-2 py-2">
              <div className="grid grid-cols-2 gap-1">
                <span className="h-7 rounded-lg bg-primary/15" />
                <span className="h-7 rounded-lg bg-surface-container-highest" />
                <span className="h-7 rounded-lg bg-surface-container-highest" />
                <span className="h-7 rounded-lg bg-surface-container-highest" />
              </div>
              <span className="mt-2 truncate text-center text-[0.66rem] text-on-surface-variant">{index === 1 ? props.label || group : group}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (item.type === "menu") {
    const options = itemOptionTexts(props);
    return (
      <section className="h-full w-full overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-low p-2 shadow-m3-2">
        <div className="flex items-center gap-2 border-b border-outline-variant px-2 py-2">
          <Menu aria-hidden className="size-4 text-primary" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium">{props.title}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
        </div>
        <div className="mt-2 space-y-1">
          {options.map((option, index) => (
            <div key={option} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm hover:bg-surface-container-high">
              <span className="truncate">{option}</span>
              <span className="text-[0.66rem] text-on-surface-variant">{index === 0 ? "Ctrl+N" : index === 1 ? "Ctrl+S" : ""}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (item.type === "context-menu") {
    const options = itemOptionTexts(props);
    const current = props.value || options[0] || "";
    return (
      <section className="h-full w-full overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-low p-2 shadow-m3-2">
        <div className="flex items-center gap-2 border-b border-outline-variant px-2 py-2">
          <Menu aria-hidden className="size-4 text-primary" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium">{props.title || "上下文菜单"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description || "局部对象命令"}</p>
          </div>
        </div>
        <div className="mt-2 space-y-1">
          {options.map((option, index) => {
            const active = option === current;
            return (
              <div
                key={option}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition",
                  active ? "bg-secondary-container text-secondary-container-foreground" : "hover:bg-surface-container-high",
                  index === options.length - 1 && "text-destructive",
                )}
              >
                <span className="truncate">{option}</span>
                {active ? <CheckCircle2 aria-hidden className="size-4 shrink-0" /> : <span className="text-[0.66rem] text-on-surface-variant">{index === 0 ? "Enter" : ""}</span>}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "list") {
    const options = itemOptionTexts(props);
    return (
      <section className="h-full w-full overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <div className="border-b border-outline-variant px-4 py-3">
          <h3 className="truncate text-sm font-medium">{props.title}</h3>
          <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
        </div>
        <div className="divide-y divide-outline-variant">
          {options.map((option, index) => (
            <div key={option} className="flex items-center gap-3 px-4 py-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-xs font-medium text-secondary-container-foreground">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{option}</p>
                <p className="truncate text-xs text-on-surface-variant">项目资源 · 已同步</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (item.type === "list-item") {
    return (
      <button
        type="button"
        tabIndex={passive ? -1 : undefined}
        className="flex h-full w-full min-w-0 items-center gap-3 overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low px-3 text-left shadow-m3-1 transition-colors hover:bg-surface-container"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary-container text-sm font-semibold text-secondary-container-foreground">
          {(props.label || props.title || "I").slice(0, 1)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-on-surface">{props.title || props.label || "列表项"}</span>
          <span className="mt-0.5 block truncate text-xs text-on-surface-variant">{props.description || props.helper}</span>
        </span>
        <span className="shrink-0 rounded-full bg-surface-container-high px-2 py-1 text-[0.64rem] text-on-surface-variant">{props.value || "状态"}</span>
      </button>
    );
  }

  if (item.type === "list-view") {
    const rows = itemOptionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-outline-variant px-4">
          <ScrollText aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "列表视图"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline" className="shrink-0">Model</Badge>
        </header>
        <div className="min-h-0 flex-1 space-y-1 overflow-hidden p-2">
          {rows.slice(0, 6).map((row, index) => {
            const active = row === current || (!current && index === 0);
            return (
              <button
                key={row}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "flex h-12 w-full min-w-0 items-center gap-3 rounded-xl px-3 text-left text-xs transition-colors",
                  active ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl font-semibold", active ? "bg-primary text-primary-foreground" : "bg-surface-container-high text-primary")}>
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{row}</span>
                  <span className="mt-0.5 block truncate text-[0.66rem] opacity-75">{index === 2 ? "Rust module" : "UI resource"} · 已同步</span>
                </span>
                {active ? <Check aria-hidden className="size-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "column-view") {
    const rows = itemOptionTexts(props);
    const current = String(props.value ?? rows[1] ?? rows[0] ?? "");
    const columns = [
      { title: "项目", rows: ["ui", "src", "assets"] },
      { title: "资源", rows: rows.length > 0 ? rows : ["MainWindow.ui", "Settings.ui", "logic.rs"] },
      { title: "详情", rows: [current || "Settings.ui", "已同步", "可编辑"] },
    ];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-outline-variant px-4">
          <Columns3 aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "分栏视图"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline" className="shrink-0">Path</Badge>
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-3 divide-x divide-outline-variant overflow-hidden">
          {columns.map((column, columnIndex) => (
            <div key={column.title} className="min-w-0 overflow-hidden">
              <div className="border-b border-outline-variant bg-surface-container px-3 py-2 text-[0.66rem] font-semibold uppercase text-on-surface-variant">{column.title}</div>
              <div className="space-y-1 p-2">
                {column.rows.slice(0, 4).map((row, rowIndex) => {
                  const active = row === current || (columnIndex === 0 && rowIndex === 0) || (columnIndex === 2 && rowIndex === 0);
                  return (
                    <button
                      key={`${column.title}-${row}`}
                      type="button"
                      tabIndex={passive ? -1 : undefined}
                      className={cn(
                        "flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-lg px-2 text-left text-xs transition-colors",
                        active ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container-high",
                      )}
                    >
                      <span className="truncate">{row}</span>
                      {columnIndex < 2 ? <ChevronRight aria-hidden className="size-3.5 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (item.type === "icon-view") {
    const rows = itemOptionTexts(props);
    const current = String(props.value ?? rows[1] ?? rows[0] ?? "");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-outline-variant px-4">
          <Grid3x3 aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "图标视图"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline" className="shrink-0">Icon</Badge>
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 overflow-hidden p-3">
          {rows.slice(0, 6).map((row, index) => {
            const active = row === current || (!current && index === 0);
            const isCode = row.toLowerCase().endsWith(".rs") || row.toLowerCase().includes("logic");
            return (
              <button
                key={row}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "flex min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container px-2 py-3 text-xs transition-colors hover:bg-surface-container-high",
                  active && "border-primary bg-primary-container text-on-primary-container",
                )}
              >
                <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", active ? "bg-primary text-primary-foreground" : "bg-surface-container-lowest text-primary")}>
                  {isCode ? <FileText aria-hidden className="size-6" /> : <FileImage aria-hidden className="size-6" />}
                </span>
                <span className="w-full truncate text-center font-semibold">{row}</span>
                <span className="w-full truncate text-center text-[0.64rem] opacity-75">{isCode ? "Rust" : "UI file"}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "command-list") {
    const options = itemOptionTexts(props);
    const query = (props.helper || "").trim().toLowerCase();
    const filteredOptions = query ? options.filter((option) => option.toLowerCase().includes(query)) : options;
    const rows = filteredOptions.length > 0 ? filteredOptions : options.slice(0, 1);
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-2">
        <div className="border-b border-outline-variant px-3 py-3">
          <div className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-3 py-2">
            <Search aria-hidden className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate text-sm text-on-surface">{props.helper || props.placeholder || "搜索命令"}</span>
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[0.66rem] text-on-surface-variant">⌘K</span>
          </div>
          <p className="mt-2 truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-hidden p-2">
          {rows.map((option, index) => {
            const active = option === props.value || (!props.value && index === 0);
            return (
              <button
                key={option}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid w-full grid-cols-[2rem_minmax(0,1fr)_4rem] items-center gap-2 rounded-xl px-2 py-2 text-left text-xs transition",
                  active ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-surface-container-lowest text-[0.66rem] font-semibold">{index + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{option}</span>
                  <span className="block truncate text-[0.68rem] opacity-75">{index === 0 ? "命令" : index === 1 ? "构建" : "设置"}</span>
                </span>
                <span className="truncate text-right text-[0.66rem] opacity-75">{index === 0 ? "Enter" : ""}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "command-palette") {
    const options = itemOptionTexts(props);
    const query = (props.helper || "").trim().toLowerCase();
    const filteredOptions = query ? options.filter((option) => option.toLowerCase().includes(query)) : options;
    const rows = filteredOptions.length > 0 ? filteredOptions : options.slice(0, 1);
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-lowest shadow-m3-3">
        <div className="border-b border-outline-variant bg-surface-container-low px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{props.title}</h3>
              <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
            </div>
            <span className="rounded-lg border border-outline-variant bg-surface-container px-2 py-1 text-[0.66rem] font-medium text-on-surface-variant">Ctrl K</span>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 py-2">
            <Search aria-hidden className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate text-xs text-on-surface">{props.helper || props.placeholder || "输入命令"}</span>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden p-2">
          <div className="px-2 pb-1 pt-1 text-[0.66rem] font-medium uppercase text-on-surface-variant">建议操作</div>
          {rows.map((option, index) => {
            const active = option === props.value || (!props.value && index === 0);
            return (
              <button
                key={option}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid w-full grid-cols-[2.25rem_minmax(0,1fr)_4.5rem] items-center gap-2 rounded-xl px-2 py-2 text-left text-xs transition",
                  active ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-surface-container text-primary">
                  {index === 0 ? <FolderOpen aria-hidden className="size-4" /> : index === 1 ? <Play aria-hidden className="size-4" /> : <Download aria-hidden className="size-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-on-surface">{option}</span>
                  <span className="block truncate text-[0.68rem] opacity-75">{index === 0 ? "项目" : index === 1 ? "运行" : "构建"}</span>
                </span>
                <span className="truncate text-right text-[0.66rem] opacity-75">{index === 0 ? "Enter" : "⌘↵"}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "notification-center") {
    const options = itemOptionTexts(props);
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium">{props.title}</h3>
            <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
          </div>
          <button type="button" tabIndex={passive ? -1 : undefined} className="rounded-full bg-primary-container px-2.5 py-1 text-[0.68rem] font-medium text-primary">
            {props.label || "全部已读"}
          </button>
        </div>
        <div className="min-h-0 flex-1 divide-y divide-outline-variant overflow-hidden">
          {options.map((option, index) => {
            const active = option === props.value || (!props.value && index === 0);
            return (
              <div key={option} className={cn("grid grid-cols-[2rem_minmax(0,1fr)_3.5rem] items-center gap-2 px-4 py-3 text-xs", active ? "bg-surface-container" : "")}>
                <span className={cn("size-2.5 rounded-full", index === 1 ? "bg-tertiary" : index === 2 ? "bg-secondary" : "bg-primary")} />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-on-surface">{option}</span>
                  <span className="block truncate text-[0.68rem] text-on-surface-variant">{index === 0 ? "刚刚" : index === 1 ? "3 分钟前" : "12 分钟前"}</span>
                </span>
                <span className="truncate text-right text-[0.66rem] text-on-surface-variant">{index === 1 ? "警告" : "完成"}</span>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "system-tray") {
    const options = itemOptionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="flex items-center gap-3 rounded-[18px] border border-outline-variant bg-surface-container-lowest px-3 py-2">
          <span className="relative grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-container text-primary">
            <Monitor aria-hidden className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-surface-container-lowest bg-tertiary" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "系统托盘"}</h3>
            <p className="truncate text-xs text-on-surface-variant">{props.label || "后台运行"}</p>
          </div>
          <Badge variant="outline" className="max-w-[6rem] shrink-0 truncate">
            Tray
          </Badge>
        </div>
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-on-surface-variant">
          {props.description || "托盘菜单用于后台状态和快速操作。"}
        </p>
        <div className="mt-3 grid min-h-0 flex-1 gap-1.5 overflow-hidden">
          {options.map((option, index) => {
            const active = option === current || (!current && index === 0);
            return (
              <button
                key={option}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid grid-cols-[1.5rem_minmax(0,1fr)_3rem] items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition",
                  active ? "bg-primary-container text-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className={cn("size-2.5 rounded-full", index === 1 ? "bg-tertiary" : index === 2 ? "bg-destructive" : "bg-primary")} />
                <span className="truncate font-medium">{option}</span>
                <span className="truncate text-right text-[0.66rem] opacity-75">{index === 2 ? "Quit" : "Run"}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "activity-bar") {
    const activities = itemOptionTexts(props);
    const current = String(props.value ?? activities[0] ?? "");
    return (
      <nav className="flex h-full w-full flex-col items-center gap-2 overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-low px-2 py-3 shadow-m3-1">
        <Layers aria-hidden className="mb-1 size-5 shrink-0 text-primary" />
        {activities.map((activity, index) => {
          const active = activity === current || (!current && index === 0);
          const Icon = index === 0 ? FolderOpen : index === 1 ? MousePointer2 : Terminal;
          return (
            <button
              key={activity}
              type="button"
              tabIndex={passive ? -1 : undefined}
              className={cn(
                "focus-ring flex size-11 shrink-0 items-center justify-center rounded-2xl transition",
                active ? "bg-primary-container text-primary shadow-m3-1" : "text-on-surface-variant hover:bg-surface-container-high",
              )}
              aria-label={activity}
              title={activity}
            >
              <Icon aria-hidden className="size-5" />
            </button>
          );
        })}
        <span className="mt-auto truncate text-[0.66rem] text-on-surface-variant [writing-mode:vertical-rl]">{props.helper || props.title}</span>
      </nav>
    );
  }

  if (item.type === "shortcut-table") {
    const rows = itemOptionTexts(props);
    const keys = ["Ctrl K", "Ctrl S", "Ctrl Shift B"];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <div className="flex items-center gap-2 border-b border-outline-variant px-4 py-3">
          <Keyboard aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium">{props.title}</h3>
            <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_7rem_5rem] border-b border-outline-variant bg-surface-container-high px-3 py-2 text-[0.68rem] font-medium uppercase text-on-surface-variant">
          <span>命令</span>
          <span>快捷键</span>
          <span>范围</span>
        </div>
        <div className="min-h-0 flex-1 divide-y divide-outline-variant overflow-hidden">
          {rows.map((row, index) => {
            const active = row === props.value || (!props.value && index === 0);
            return (
              <div key={row} className={cn("grid grid-cols-[minmax(0,1fr)_7rem_5rem] items-center gap-2 px-3 py-2.5 text-xs", active ? "bg-primary-container text-primary" : "")}>
                <span className="truncate font-medium">{row}</span>
                <kbd className="truncate rounded-md border border-outline-variant bg-surface-container-lowest px-2 py-1 text-center text-[0.66rem] text-on-surface-variant">{keys[index] ?? "F5"}</kbd>
                <span className="truncate text-on-surface-variant">{index === 2 ? "构建" : "全局"}</span>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "resource-browser") {
    const resources = itemOptionTexts(props);
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium">{props.title}</h3>
            <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline">Assets</Badge>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 overflow-hidden p-3">
          {resources.map((resource, index) => {
            const active = resource === props.value || (!props.value && index === 0);
            return (
              <button
                key={resource}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "flex min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container px-2 py-3 text-xs transition hover:bg-surface-container-high",
                  active && "border-primary bg-primary-container text-primary",
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-surface-container-lowest">
                  {index === 2 ? <FileText aria-hidden className="size-5 text-primary" /> : <FileImage aria-hidden className="size-5 text-primary" />}
                </span>
                <span className="w-full truncate text-center font-medium">{resource}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "asset-grid") {
    const assets = itemOptionTexts(props);
    const current = String(props.value ?? assets[0] ?? "");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <Grid3x3 aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "资源网格"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Button size="sm" variant="outline" className="h-7 shrink-0 text-[0.68rem]" tabIndex={passive ? -1 : undefined}>
            {props.label || "导入"}
          </Button>
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 overflow-hidden p-3">
          {assets.map((asset, index) => {
            const active = asset === current || (!current && index === 0);
            return (
              <button
                key={asset}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "focus-ring flex min-w-0 flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container text-left transition hover:bg-surface-container-high",
                  active && "border-primary bg-primary-container text-primary",
                )}
              >
                <span className={cn("grid h-16 place-items-center", index === 0 ? "bg-primary/15" : index === 1 ? "bg-secondary-container" : "bg-tertiary-container")}>
                  {index === 2 ? <FileJson aria-hidden className="size-6" /> : index === 1 ? <FileImage aria-hidden className="size-6" /> : <Monitor aria-hidden className="size-6" />}
                </span>
                <span className="w-full truncate px-2 py-2 text-xs font-semibold">{asset}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "task-list") {
    const tasks = itemOptionTexts(props);
    const states = ["完成", "运行中", "队列"];
    const widths = ["100%", "58%", "24%"];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <div className="flex items-center gap-2 border-b border-outline-variant px-4 py-3">
          <CheckCircle2 aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium">{props.title}</h3>
            <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-hidden p-3">
          {tasks.map((task, index) => {
            const active = task === props.value || (!props.value && index === 0);
            return (
              <div key={task} className={cn("rounded-xl border border-outline-variant bg-surface-container px-3 py-2.5", active && "border-primary bg-primary-container")}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate font-medium">{task}</span>
                  <span className="shrink-0 text-[0.66rem] text-on-surface-variant">{states[index] ?? "等待"}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
                  <div className={cn("h-full rounded-full", index === 1 ? "bg-tertiary" : "bg-primary")} style={{ width: widths[index] ?? "40%" }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "settings-list") {
    const settings = itemOptionTexts(props);
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <div className="flex items-center gap-2 border-b border-outline-variant px-4 py-3">
          <Settings2 aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium">{props.title}</h3>
            <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
          </div>
        </div>
        <div className="min-h-0 flex-1 divide-y divide-outline-variant overflow-hidden">
          {settings.map((setting, index) => {
            const active = setting === props.value || (!props.value && index === 0);
            return (
              <div key={setting} className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-3 px-4 py-3 text-xs">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-on-surface">{setting}</span>
                  <span className="block truncate text-[0.68rem] text-on-surface-variant">{index === 0 ? "浅色 / 深色" : index === 1 ? "紧凑 / 标准" : "本地偏好"}</span>
                </span>
                <span className={cn("ml-auto flex h-6 w-10 items-center rounded-full p-0.5 transition", active ? "bg-primary" : "bg-surface-container-highest")}>
                  <span className={cn("size-5 rounded-full bg-white shadow-m3-1 transition", active && "translate-x-4")} />
                </span>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "tree-view") {
    const options = itemOptionTexts(props);
    return (
      <section className="h-full w-full overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <div className="border-b border-outline-variant px-4 py-3">
          <h3 className="truncate text-sm font-medium">{props.title}</h3>
          <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
        </div>
        <div className="space-y-1 p-2 text-sm">
          <div className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-on-surface-variant">
            <ChevronDown aria-hidden className="size-3.5 shrink-0" />
            <FolderOpen aria-hidden className="size-4 shrink-0 text-primary" />
            <span className="truncate font-medium">src</span>
          </div>
          {options.map((option, index) => {
            const active = option === props.value || (!props.value && index === 0);
            return (
              <div
                key={option}
                className={cn(
                  "ml-5 flex items-center gap-2 rounded-xl px-2 py-1.5",
                  active ? "bg-secondary-container text-secondary-container-foreground" : "text-on-surface-variant",
                )}
              >
                <CornerDownRight aria-hidden className="size-3.5 shrink-0" />
                <span className="truncate">{option}</span>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "tree-table") {
    const rows = itemOptionTexts(props);
    const current = props.value ?? rows[0];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <div className="flex items-center gap-2 border-b border-outline-variant px-4 py-3">
          <Table2 aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium">{props.title}</h3>
            <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_5rem] border-b border-outline-variant bg-surface-container-high px-3 py-2 text-[0.68rem] font-medium uppercase text-on-surface-variant">
          <span>名称</span>
          <span>状态</span>
          <span>目标</span>
        </div>
        <div className="min-h-0 flex-1 divide-y divide-outline-variant overflow-hidden">
          {rows.map((row, index) => {
            const active = row === current || (!current && index === 0);
            return (
              <button
                key={row}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid w-full grid-cols-[minmax(0,1fr)_5.5rem_5rem] items-center gap-2 px-3 py-2 text-left text-xs transition",
                  active ? "bg-primary/10 text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {index === 0 ? <ChevronDown aria-hidden className="size-3.5 shrink-0 text-primary" /> : <CornerDownRight aria-hidden className="ml-4 size-3.5 shrink-0" />}
                  <span className="truncate font-medium">{row}</span>
                </span>
                <span className={cn("truncate rounded-full px-2 py-1 text-[0.68rem]", index === 1 ? "bg-tertiary-container text-tertiary" : "bg-secondary-container text-secondary-container-foreground")}>
                  {index === 1 ? "已修改" : "就绪"}
                </span>
                <span className="truncate text-on-surface-variant">{index === 2 ? "资源" : "App"}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "outline-view") {
    const rows = itemOptionTexts(props);
    const current = props.value ?? rows[rows.length - 1];
    const kinds = ["窗口", "面板", "函数"];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <ListChecks aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "大纲视图"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline" className="shrink-0 text-[0.66rem]">Outline</Badge>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden p-2">
          {rows.map((row, index) => {
            const active = row === current || (!current && index === rows.length - 1);
            return (
              <button
                key={row}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid w-full grid-cols-[1.5rem_minmax(0,1fr)_4.5rem] items-center gap-2 rounded-xl px-2 py-2 text-left text-xs transition",
                  active ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className={cn("text-center text-[0.72rem]", index === 0 ? "" : "pl-3")}>{index === 0 ? "▾" : "↳"}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{row}</span>
                  <span className="mt-0.5 block truncate text-[0.66rem] opacity-75">Ln {index * 18 + 12}</span>
                </span>
                <span className="truncate rounded-lg border border-outline-variant bg-surface-container px-2 py-1 text-center text-[0.66rem] opacity-80">
                  {kinds[index] ?? "符号"}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "signal-slot-editor") {
    const rows = itemOptionTexts(props);
    const current = props.value ?? rows[0];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <CornerDownRight aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "信号 / 槽"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-[0.66rem]">Qt-style</Badge>
        </header>
        <div className="grid grid-cols-[minmax(0,1fr)_1.75rem_minmax(0,1fr)_5rem] border-b border-outline-variant bg-surface-container-high px-3 py-2 text-[0.68rem] font-medium uppercase text-on-surface-variant">
          <span>Signal</span>
          <span />
          <span>Slot</span>
          <span>状态</span>
        </div>
        <div className="min-h-0 flex-1 divide-y divide-outline-variant overflow-hidden">
          {rows.map((row, index) => {
            const active = row === current || (!current && index === 0);
            const signal = row.includes(".") ? row : `${row}.${index === 1 ? "change" : "click"}`;
            const slot = `on_${signal.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase()}`;
            return (
              <button
                key={row}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid w-full grid-cols-[minmax(0,1fr)_1.75rem_minmax(0,1fr)_5rem] items-center gap-2 px-3 py-2.5 text-left text-xs transition",
                  active ? "bg-primary/10 text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className="truncate font-mono">{signal}</span>
                <ArrowRight aria-hidden className="size-3.5 justify-self-center text-primary" />
                <span className="truncate font-mono text-on-surface">{slot}</span>
                <span className={cn("truncate rounded-full px-2 py-1 text-center text-[0.66rem]", index === 1 ? "bg-tertiary-container text-tertiary" : "bg-secondary-container text-secondary-container-foreground")}>
                  {index === 1 ? "待测" : "就绪"}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "node-graph") {
    const nodes = itemOptionTexts(props);
    const current = props.value ?? nodes[1] ?? nodes[0];
    return (
      <section className="relative h-full w-full overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-low shadow-m3-2">
        <div className="absolute inset-x-0 top-0 z-10 flex h-12 items-center gap-2 border-b border-outline-variant bg-surface-container-low/95 px-3">
          <Activity aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "节点图"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline" className="shrink-0 text-[0.66rem]">{nodes.length} nodes</Badge>
        </div>
        <svg className="absolute inset-0 h-full w-full pt-12" aria-hidden viewBox="0 0 520 320" preserveAspectRatio="none">
          <path d="M128 142 C190 142 208 92 270 92" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="5 5" />
          <path d="M300 112 C350 142 378 190 430 190" fill="none" stroke="hsl(var(--outline))" strokeWidth="2" />
          <circle cx="270" cy="92" r="4" fill="hsl(var(--primary))" />
        </svg>
        <div className="absolute left-[7%] top-[38%] w-[26%] rounded-2xl border border-outline-variant bg-surface-container-lowest p-3 shadow-m3-1">
          <p className="truncate text-[0.66rem] uppercase tracking-[0.08em] text-on-surface-variant">Signal</p>
          <p className="mt-1 truncate text-xs font-semibold">{nodes[0] ?? "UI Signal"}</p>
        </div>
        <div className={cn("absolute left-[39%] top-[22%] w-[28%] rounded-2xl border p-3 shadow-m3-2", current === nodes[1] ? "border-primary bg-primary-container text-primary" : "border-outline-variant bg-surface-container-lowest")}>
          <p className="truncate text-[0.66rem] uppercase tracking-[0.08em] opacity-75">Command</p>
          <p className="mt-1 truncate text-xs font-semibold">{nodes[1] ?? "Run command"}</p>
        </div>
        <div className="absolute right-[7%] top-[54%] w-[26%] rounded-2xl border border-outline-variant bg-surface-container-lowest p-3 shadow-m3-1">
          <p className="truncate text-[0.66rem] uppercase tracking-[0.08em] text-on-surface-variant">Output</p>
          <p className="mt-1 truncate text-xs font-semibold">{nodes[2] ?? "State patch"}</p>
        </div>
      </section>
    );
  }

  if (item.type === "log-viewer") {
    const rows = itemOptionTexts(props);
    const current = props.value ?? rows[rows.length - 1];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-[#15131a] text-[#f7f2fa] shadow-m3-2">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-white/10 bg-[#1c1a22] px-3">
          <Terminal aria-hidden className="size-4 shrink-0 text-[#8bd5ca]" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "日志查看器"}</h3>
            <p className="truncate text-[0.68rem] text-[#cac4d0]">{props.description}</p>
          </div>
          <span className="rounded-full bg-white/10 px-2 py-1 text-[0.64rem] text-[#f4bf75]">{props.helper || "filter"}</span>
        </header>
        <div className="min-h-0 flex-1 space-y-1 overflow-hidden p-3 font-mono text-xs">
          {rows.map((row, index) => {
            const active = row === current || (!current && index === rows.length - 1);
            const level = index === 1 ? "WARN" : index === 2 ? "DONE" : "INFO";
            return (
              <button
                key={row}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid w-full grid-cols-[3.3rem_3.6rem_minmax(0,1fr)] items-center gap-2 rounded-lg px-2 py-1.5 text-left transition",
                  active ? "bg-white/10 text-white" : "text-[#cac4d0] hover:bg-white/5",
                )}
              >
                <span className="truncate text-[#79747e]">09:{12 + index * 2}</span>
                <span className={cn("truncate", level === "WARN" ? "text-[#f4bf75]" : level === "DONE" ? "text-[#a6da95]" : "text-[#8bd5ca]")}>{level}</span>
                <span className="truncate">{row}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "problems-panel") {
    const rows = itemOptionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <AlertTriangle aria-hidden className="size-4 shrink-0 text-destructive" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "问题"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline" className="shrink-0 text-[0.66rem]">{props.helper || rows.length}</Badge>
        </header>
        <div className="grid grid-cols-[5rem_minmax(0,1fr)_4.5rem] border-b border-outline-variant bg-surface-container-high px-3 py-2 text-[0.66rem] font-semibold uppercase text-on-surface-variant">
          <span>级别</span>
          <span>位置</span>
          <span>行</span>
        </div>
        <div className="min-h-0 flex-1 divide-y divide-outline-variant overflow-hidden">
          {rows.map((row, index) => {
            const active = row === current || (!current && index === 0);
            const severity = index === 0 ? "error" : index === 1 ? "warning" : "hint";
            return (
              <button
                key={row}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid h-10 w-full grid-cols-[5rem_minmax(0,1fr)_4.5rem] items-center gap-2 px-3 text-left text-xs transition",
                  active ? "bg-primary/10 text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className={cn("truncate rounded-full px-2 py-1 text-center text-[0.62rem] font-semibold", severity === "error" ? "bg-destructive/10 text-destructive" : severity === "warning" ? "bg-tertiary-container text-tertiary" : "bg-secondary-container text-secondary-container-foreground")}>
                  {severity}
                </span>
                <span className="truncate font-mono">{row}</span>
                <span className="truncate text-right font-mono">{index * 31 + 18}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "breakpoints-panel") {
    const rows = itemOptionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <Circle aria-hidden className="size-4 shrink-0 fill-destructive text-destructive" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "断点"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-[0.66rem]">{props.helper || `${rows.length} 项已启用`}</Badge>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden p-2">
          {rows.map((row, index) => {
            const active = row === current || (!current && index === 0);
            const enabled = index !== 1;
            return (
              <button
                key={row}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "mb-1 grid w-full grid-cols-[1.5rem_minmax(0,1fr)_4.5rem] items-center gap-2 rounded-xl px-2 py-2 text-left text-xs transition",
                  active ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className={cn("size-2.5 rounded-full", enabled ? "bg-destructive" : "border border-outline bg-transparent")} />
                <span className="truncate font-mono">{row}</span>
                <span className="truncate text-right text-[0.66rem]">{enabled ? "启用" : "禁用"}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "watch-panel") {
    const rows = itemOptionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <Search aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "监视"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline" className="shrink-0 text-[0.66rem]">{props.helper || "live"}</Badge>
        </header>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] border-b border-outline-variant bg-surface-container-high px-3 py-2 text-[0.66rem] font-semibold uppercase text-on-surface-variant">
          <span>表达式</span>
          <span>值</span>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden p-2">
          {rows.map((row, index) => {
            const active = row === current || (!current && index === 0);
            const value = index === 0 ? `"${props.label || "button_1"}"` : index === 1 ? "true" : "{ patch: 1 }";
            return (
              <button
                key={row}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid w-full grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] items-center gap-2 rounded-xl px-2 py-2 text-left text-xs transition",
                  active ? "bg-primary/10 text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className="truncate font-mono">{row}</span>
                <span className="truncate rounded-lg border border-outline-variant bg-surface-container px-2 py-1 font-mono text-on-surface">{value}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "call-stack") {
    const rows = itemOptionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <Braces aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "调用栈"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-[0.66rem]">{props.helper || "paused"}</Badge>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden p-2">
          {rows.map((row, index) => {
            const active = row === current || (!current && index === 0);
            return (
              <button
                key={row}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "mb-1 grid w-full grid-cols-[2rem_minmax(0,1fr)_4.5rem] items-center gap-2 rounded-xl px-2 py-2 text-left text-xs transition",
                  active ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className="text-center font-mono text-[0.68rem]">#{index}</span>
                <span className="min-w-0">
                  <span className="block truncate font-mono font-semibold">{row}</span>
                  <span className="mt-0.5 block truncate text-[0.66rem] opacity-75">{index === 0 ? "UI signal" : index === 1 ? "Rust command" : "State patch"}</span>
                </span>
                <span className="truncate text-right font-mono text-[0.66rem]">:{index * 24 + 12}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "property-browser") {
    const rows = itemOptionTexts(props);
    const current = props.value ?? rows[0];
    const groups = ["Layout", "Appearance", "Events"];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <Settings2 aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "属性浏览器"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline" className="shrink-0 text-[0.66rem]">Browser</Badge>
        </header>
        <div className="grid grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] border-b border-outline-variant bg-surface-container-high px-3 py-2 text-[0.68rem] font-medium uppercase text-on-surface-variant">
          <span>属性</span>
          <span>值</span>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden p-2">
          {rows.map((row, index) => {
            const active = row === current || (!current && index === 0);
            const value = index === 0 ? `${item.width}px` : index === 1 ? props.variant || "secondary" : props.actionCommandId || "unbound";
            return (
              <button
                key={row}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid w-full grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-center gap-2 rounded-xl px-2 py-2 text-left text-xs transition",
                  active ? "bg-primary/10 text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{row}</span>
                  <span className="mt-0.5 block truncate text-[0.66rem] opacity-75">{groups[index] ?? "Props"}</span>
                </span>
                <span className="truncate rounded-lg border border-outline-variant bg-surface-container px-2 py-1 text-on-surface">{value}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "layer-panel") {
    const layers = itemOptionTexts(props);
    const current = String(props.value ?? layers[layers.length - 1] ?? layers[0] ?? "");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <Layers aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "图层"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline" className="shrink-0 text-[0.66rem]">Layers</Badge>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden p-2">
          {layers.map((layer, index) => {
            const active = layer === current || (!current && index === layers.length - 1);
            const depthClass = index === 0 ? "" : index === 1 ? "ml-4" : "ml-8";
            return (
              <button
                key={layer}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "focus-ring mb-1 grid w-full grid-cols-[1rem_minmax(0,1fr)_3rem] items-center gap-2 rounded-xl px-2 py-2 text-left text-xs transition",
                  depthClass,
                  active ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className="text-center">{index === 0 ? "▾" : "↳"}</span>
                <span className="truncate font-semibold">{layer}</span>
                <span className="flex justify-end gap-1 opacity-75">
                  {index === 1 ? <Lock aria-hidden className="size-3.5" /> : <Eye aria-hidden className="size-3.5" />}
                  {index === 2 ? <LockOpen aria-hidden className="size-3.5" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "breadcrumb-bar") {
    const options = itemOptionTexts(props);
    const current = props.value ?? props.label ?? options[options.length - 1];
    return (
      <nav className="flex h-full w-full items-center gap-1 overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low px-3 shadow-m3-1">
        {options.map((option, index) => (
          <span key={`${option}-${index}`} className="flex min-w-0 items-center gap-1 text-xs">
            {index > 0 ? <span className="text-on-surface-variant">/</span> : null}
            <button
              type="button"
              tabIndex={passive ? -1 : undefined}
              className={cn(
                "min-w-0 truncate rounded-lg px-2 py-1 transition",
                option === current ? "bg-secondary-container text-secondary-container-foreground" : "text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              {option}
            </button>
          </span>
        ))}
      </nav>
    );
  }

  if (item.type === "pagination") {
    const options = itemOptionTexts(props);
    const current = String(props.value ?? props.label ?? options[1] ?? "1");
    return (
      <nav className="flex h-full w-full items-center gap-2 overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low px-3 shadow-m3-1">
        <span className="min-w-0 flex-1 truncate text-xs text-on-surface-variant">{props.helper || props.description || props.title}</span>
        {options.map((option, index) => {
          const active = current.includes(option) || option === props.label;
          return (
            <button
              key={`${option}-${index}`}
              type="button"
              tabIndex={passive ? -1 : undefined}
              className={cn(
                "shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition",
                active ? "bg-primary text-primary-foreground shadow-m3-1" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest",
              )}
            >
              {option}
            </button>
          );
        })}
      </nav>
    );
  }

  if (item.type === "toolbar") {
    const options = itemOptionTexts(props);
    return (
      <header className="flex h-full w-full items-center gap-2 rounded-[20px] border border-outline-variant bg-surface-container-low px-3 shadow-m3-1">
        <PanelTop aria-hidden className="size-4 shrink-0 text-primary" />
        <strong className="mr-auto truncate text-sm">{props.title}</strong>
        {options.map((option) => (
          <span key={option} className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant">
            {option}
          </span>
        ))}
      </header>
    );
  }

  if (item.type === "floating-toolbar") {
    const options = itemOptionTexts(props);
    return (
      <section className="flex h-full w-full items-center gap-2 overflow-hidden rounded-full border border-outline-variant bg-surface/95 px-2 shadow-m3-3 backdrop-blur">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary">
          <MousePointer2 aria-hidden className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-on-surface">{props.title || props.label || "上下文工具"}</span>
        {options.slice(0, 3).map((option, index) => {
          const active = option === props.value || (!props.value && index === 0);
          return (
            <button
              key={option}
              type="button"
              tabIndex={passive ? -1 : undefined}
              className={cn(
                "focus-ring flex h-9 min-w-0 items-center justify-center rounded-full px-3 text-[0.68rem] font-semibold transition",
                active ? "bg-secondary-container text-secondary-container-foreground" : "text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              <span className="truncate">{option}</span>
            </button>
          );
        })}
      </section>
    );
  }

  if (item.type === "status-bar") {
    const options = itemOptionTexts(props);
    return (
      <footer className="flex h-full w-full items-center gap-2 overflow-hidden rounded-[16px] border border-outline-variant bg-surface-container-low px-3 text-xs shadow-m3-1">
        <Badge variant="secondary" className="shrink-0">{props.label ?? options[0] ?? "就绪"}</Badge>
        <span className="min-w-0 flex-1 truncate text-on-surface-variant">{props.description ?? props.title}</span>
        {options.slice(1).map((option) => (
          <span key={option} className="hidden shrink-0 rounded-full bg-surface-container-high px-2 py-1 text-[0.68rem] text-on-surface-variant sm:inline-flex">
            {option}
          </span>
        ))}
      </footer>
    );
  }

  if (item.type === "split-view") {
    const options = itemOptionTexts(props);
    const split = numericPercent(props.value, 62);
    return (
      <section
        className="grid h-full w-full overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-low shadow-m3-1"
        style={{ gridTemplateColumns: `${split}% 8px 1fr` }}
      >
        <div className="flex min-w-0 flex-col gap-2 p-3">
          <span className="truncate text-xs font-medium text-on-surface">{options[0] ?? "左侧"}</span>
          <div className="h-7 rounded-lg bg-surface-container-high" />
          <div className="h-7 rounded-lg bg-surface-container-high" />
          <div className="min-h-0 flex-1 rounded-xl border border-outline-variant bg-surface-container" />
        </div>
        <div className="flex items-center justify-center bg-outline-variant/70">
          <span className="h-10 w-1 rounded-full bg-outline" />
        </div>
        <div className="flex min-w-0 flex-col gap-2 p-3">
          <span className="truncate text-xs font-medium text-on-surface">{options[1] ?? props.title ?? "内容"}</span>
          <div className="grid flex-1 grid-cols-2 gap-2 overflow-hidden">
            <div className="rounded-xl bg-surface-container-high" />
            <div className="rounded-xl bg-surface-container" />
          </div>
          <span className="truncate text-[0.68rem] text-on-surface-variant">{options[2] ?? props.description}</span>
        </div>
      </section>
    );
  }

  if (item.type === "splitter") {
    const options = itemOptionTexts(props);
    const split = numericPercent(props.value, 58);
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-10 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <RectangleHorizontal aria-hidden className="size-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{props.title || "分割器"}</span>
          <Badge variant="outline" className="shrink-0">{split}%</Badge>
        </header>
        <div className="grid min-h-0 flex-1 overflow-hidden" style={{ gridTemplateColumns: `${split}% 12px 1fr` }}>
          <div className="flex min-w-0 flex-col gap-2 p-3">
            <span className="truncate text-xs font-semibold">{options[0] ?? "左侧面板"}</span>
            <span className="h-7 rounded-lg bg-surface-container-high" />
            <span className="h-7 rounded-lg bg-surface-container-high" />
          </div>
          <div className="group flex cursor-col-resize items-center justify-center bg-outline-variant/70">
            <span className="grid h-12 w-2 place-items-center rounded-full bg-surface-container-lowest shadow-m3-1">
              <span className="h-7 w-1 rounded-full bg-primary" />
            </span>
          </div>
          <div className="flex min-w-0 flex-col gap-2 p-3">
            <span className="truncate text-xs font-semibold">{options[1] ?? "右侧面板"}</span>
            <span className="min-h-0 flex-1 rounded-xl border border-outline-variant bg-surface-container" />
            <span className="truncate text-[0.68rem] text-on-surface-variant">{options[2] ?? props.description}</span>
          </div>
        </div>
      </section>
    );
  }

  if (item.type === "size-grip") {
    return (
      <section className="relative flex h-full w-full flex-col overflow-hidden rounded-[18px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="min-w-0 pr-8">
          <h3 className="truncate text-xs font-semibold">{props.title || "尺寸握把"}</h3>
          <p className="mt-1 line-clamp-2 text-[0.68rem] leading-4 text-on-surface-variant">
            {props.description || "拖拽窗口角落调整尺寸。"}
          </p>
        </div>
        <Badge variant="outline" className="mt-auto w-fit max-w-full truncate">
          {props.value || "1280 x 720"}
        </Badge>
        <div className="absolute bottom-2 right-2 grid size-10 place-items-end rounded-br-[14px] text-outline">
          <Maximize2 aria-hidden className="size-4 text-primary" />
          <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-[12px] border-b-2 border-r-2 border-outline-variant" />
          <span className="absolute bottom-1 right-1 h-5 w-5 rounded-br-[8px] border-b-2 border-r-2 border-outline" />
        </div>
      </section>
    );
  }

  if (item.type === "supporting-pane") {
    const options = itemOptionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return (
      <section className="grid h-full w-full grid-cols-[minmax(0,1fr)_13rem] grid-rows-[minmax(0,1fr)_3.5rem] overflow-hidden rounded-[26px] border border-outline-variant bg-surface-container-low shadow-m3-2">
        <main className="min-h-0 min-w-0 p-4">
          <div className="flex h-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-lowest p-4">
            <p className="truncate text-xs font-medium uppercase tracking-[0.08em] text-primary">Supporting pane</p>
            <h3 className="mt-1 truncate text-base font-semibold">{props.title || "主内容"}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">{props.description || "主内容旁保留上下文辅助信息"}</p>
            <div className="mt-4 grid min-h-0 flex-1 gap-2 overflow-hidden">
              <span className="h-3 w-3/4 rounded-full bg-surface-container-highest" />
              <span className="h-3 w-1/2 rounded-full bg-surface-container-highest" />
              <span className="min-h-16 rounded-2xl bg-primary-container/70" />
              <span className="rounded-2xl border border-outline-variant bg-surface-container" />
            </div>
          </div>
        </main>
        <aside className="min-h-0 border-l border-outline-variant bg-surface-container px-3 py-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="truncate text-xs font-semibold text-on-surface">辅助窗格</span>
            <span className="rounded-full bg-primary-container px-2 py-0.5 text-[0.64rem] font-medium text-primary">{options.length}</span>
          </div>
          <div className="space-y-2 overflow-hidden">
            {options.map((option, index) => {
              const active = option === current || (!current && index === 0);
              return (
                <button
                  key={option}
                  type="button"
                  tabIndex={passive ? -1 : undefined}
                  className={cn(
                    "w-full rounded-2xl px-3 py-2 text-left text-xs transition",
                    active ? "bg-secondary-container text-secondary-container-foreground shadow-m3-1" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest",
                  )}
                >
                  <span className="block truncate font-medium">{option}</span>
                  <span className="mt-1 block truncate text-[0.66rem] opacity-75">{index === 0 ? "问题和状态" : index === 1 ? "上下文详情" : "下一步操作"}</span>
                </button>
              );
            })}
          </div>
        </aside>
        <footer className="col-span-2 flex min-w-0 items-center gap-2 border-t border-outline-variant bg-surface-container px-4 text-xs text-on-surface-variant">
          <span className="size-2 rounded-full bg-primary" />
          <span className="truncate">窄窗口可折叠为底部辅助条 · 当前 {current || options[0] || "上下文"}</span>
        </footer>
      </section>
    );
  }

  if (item.type === "scroll-area") {
    const options = itemOptionTexts(props);
    const current = props.value ?? options[0];
    const rows = [
      ...options,
      "assets/icons/settings.svg",
      "assets/fonts/inter.woff2",
      "logs/build-output.txt",
    ];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <ScrollText aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <span className="h-8 w-1.5 rounded-full bg-outline-variant" />
        </header>
        <div className="min-h-0 flex-1 overflow-hidden p-2">
          <div className="max-h-full space-y-1 overflow-hidden pr-2">
            {rows.map((row, index) => {
              const active = row === current || (!current && index === 0);
              return (
                <button
                  key={`${row}-${index}`}
                  type="button"
                  tabIndex={passive ? -1 : undefined}
                  className={cn(
                    "grid w-full grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition",
                    active ? "bg-primary/10 text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high",
                  )}
                >
                  <span className="truncate font-medium">{row}</span>
                  <span className="truncate text-right text-[0.66rem] opacity-70">{index < options.length ? "绑定" : "更多"}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (item.type === "stacked-pages") {
    const options = itemOptionTexts(props);
    const current = props.value ?? options[0];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <Layers aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
        </header>
        <div className="flex gap-1 border-b border-outline-variant bg-surface-container-high px-2 py-1">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              tabIndex={passive ? -1 : undefined}
              className={cn(
                "min-w-0 flex-1 truncate rounded-lg px-2 py-1 text-[0.68rem] font-medium transition",
                option === current ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-low",
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 gap-2 p-3">
          <div className="rounded-xl border border-outline-variant bg-surface-container p-3">
            <span className="block truncate text-sm font-semibold">{current || "页面"}</span>
            <span className="mt-2 block h-2 w-3/4 rounded-full bg-surface-container-highest" />
            <span className="mt-2 block h-2 w-1/2 rounded-full bg-surface-container-highest" />
          </div>
          <div className="grid grid-cols-2 gap-2 overflow-hidden">
            <span className="rounded-xl bg-surface-container-high" />
            <span className="rounded-xl bg-surface-container" />
          </div>
        </div>
      </section>
    );
  }

  if (item.type === "dock-panel") {
    const options = itemOptionTexts(props);
    const current = props.value ?? options[0];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-outline-variant bg-surface-container px-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <span className="size-6 rounded-md bg-surface-container-highest" />
          <span className="size-6 rounded-md bg-surface-container-highest" />
        </header>
        <div className="flex gap-1 border-b border-outline-variant bg-surface-container-high px-2 py-1">
          {options.map((option) => (
            <span
              key={option}
              className={cn(
                "min-w-0 flex-1 truncate rounded-lg px-2 py-1 text-center text-[0.68rem] font-medium",
                option === current ? "bg-primary-container text-primary" : "text-on-surface-variant",
              )}
            >
              {option}
            </span>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 gap-2 p-3">
          <div className="rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-xs text-on-surface-variant">
            <span className="block truncate font-medium text-on-surface">{current || "面板内容"}</span>
            <span className="mt-1 block h-2 w-3/4 rounded-full bg-surface-container-highest" />
          </div>
          <div className="rounded-xl bg-surface-container-high" />
          <div className="rounded-xl bg-surface-container" />
        </div>
      </section>
    );
  }

  if (item.type === "mdi-area") {
    const windows = itemOptionTexts(props);
    const current = String(props.value ?? windows[0] ?? "");
    const windowLayouts = [
      "left-[5%] top-[14%] h-[58%] w-[56%]",
      "right-[7%] top-[24%] h-[50%] w-[46%]",
      "bottom-[8%] left-[24%] h-[38%] w-[50%]",
    ];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-outline-variant bg-surface-container px-3">
          <Layers aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-1 text-[0.64rem] font-semibold text-primary">MDI</span>
        </header>
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_20%_15%,hsl(var(--primary)/0.08),transparent_30%),linear-gradient(135deg,hsl(var(--surface-container-high)),hsl(var(--surface-container-low)))] p-3">
          {windows.slice(0, 3).map((windowTitle, index) => {
            const active = windowTitle === current || (!current && index === 0);
            return (
              <button
                key={`${windowTitle}-${index}`}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "absolute flex min-h-[92px] min-w-[132px] flex-col overflow-hidden rounded-xl border text-left shadow-m3-1 transition",
                  windowLayouts[index] ?? windowLayouts[0],
                  active
                    ? "z-20 border-primary bg-surface-container-lowest text-on-surface"
                    : "z-10 border-outline-variant bg-surface-container text-on-surface-variant",
                )}
              >
                <span className={cn("flex h-8 shrink-0 items-center gap-1.5 border-b px-2 text-[0.68rem] font-semibold", active ? "border-primary/25 bg-primary/10 text-primary" : "border-outline-variant bg-surface-container-high")}>
                  <span className="size-2 rounded-full bg-error" />
                  <span className="size-2 rounded-full bg-tertiary" />
                  <span className="size-2 rounded-full bg-primary" />
                  <span className="min-w-0 flex-1 truncate pl-1">{windowTitle}</span>
                </span>
                <span className="grid min-h-0 flex-1 grid-rows-[0.8rem_0.8rem_1fr] gap-2 p-3">
                  <span className="rounded-full bg-surface-container-highest" />
                  <span className="w-2/3 rounded-full bg-surface-container-highest" />
                  <span className="rounded-lg border border-outline-variant bg-surface-container-low" />
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "top-app-bar") {
    const options = itemOptionTexts(props);
    return (
      <header className="flex h-full w-full items-center gap-3 overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low px-3 shadow-m3-1">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant">
          <Menu aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{props.title}</h3>
          <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {options.map((option, index) => (
            <span key={option} className="flex size-9 items-center justify-center rounded-full bg-surface-container-high text-[0.66rem] font-medium text-on-surface-variant">
              {index === 0 ? "S" : index === 1 ? "R" : "···"}
            </span>
          ))}
        </div>
      </header>
    );
  }

  if (item.type === "bottom-app-bar") {
    const options = itemOptionTexts(props);
    return (
      <footer className="flex h-full w-full items-center gap-2 overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-low px-3 shadow-m3-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{props.title}</h3>
          <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {options.map((option, index) => (
            <span key={option} className={cn("flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-[0.68rem] font-medium", index === 2 ? "bg-primary text-primary-foreground" : "bg-surface-container-high text-on-surface-variant")}>
              {option}
            </span>
          ))}
        </div>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[18px] bg-primary text-primary-foreground shadow-m3-2">
          <Plus aria-hidden className="size-5" />
        </span>
      </footer>
    );
  }

  if (item.type === "navigation-bar") {
    const options = itemOptionTexts(props);
    return (
      <nav className="flex h-full w-full items-center justify-around gap-1 overflow-hidden rounded-[28px] border border-outline-variant bg-surface-container-low px-2 py-2 shadow-m3-1">
        {options.map((option) => {
          const active = option === props.value || (!props.value && option === options[0]);
          return (
            <span key={option} className="flex min-w-0 flex-1 flex-col items-center gap-1 text-[0.68rem] font-medium text-on-surface-variant">
              <span className={cn("flex h-8 min-w-14 items-center justify-center rounded-full px-4", active ? "bg-secondary-container text-secondary-container-foreground" : "bg-transparent")}>
                <Square aria-hidden className="size-3.5" />
              </span>
              <span className={cn("max-w-full truncate", active && "text-on-surface")}>{option}</span>
            </span>
          );
        })}
      </nav>
    );
  }

  if (item.type === "navigation-suite") {
    const options = itemOptionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return (
      <section className="grid h-full w-full grid-cols-[5rem_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_4.75rem] overflow-hidden rounded-[28px] border border-outline-variant bg-surface-container-low shadow-m3-2">
        <aside className="row-span-2 flex min-h-0 flex-col gap-2 border-r border-outline-variant bg-surface-container px-2 py-3">
          <span className="mx-auto flex size-11 shrink-0 items-center justify-center rounded-[18px] bg-primary text-primary-foreground shadow-m3-1">
            <Navigation aria-hidden className="size-5" />
          </span>
          <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-hidden">
            {options.map((option) => {
              const active = option === current || (!current && option === options[0]);
              return (
                <button
                  key={option}
                  type="button"
                  tabIndex={passive ? -1 : undefined}
                  className={cn(
                    "flex w-full flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[0.64rem] font-medium transition",
                    active ? "bg-secondary-container text-secondary-container-foreground" : "text-on-surface-variant hover:bg-surface-container-high",
                  )}
                >
                  <Square aria-hidden className="size-3.5" />
                  <span className="max-w-full truncate">{option}</span>
                </button>
              );
            })}
          </div>
        </aside>
        <main className="min-h-0 min-w-0 p-3">
          <div className="flex h-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-lowest p-4">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-[0.08em] text-primary">Navigation Suite</p>
              <h3 className="mt-1 truncate text-base font-semibold">{props.title || "应用导航"}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">{props.description || "自适应导航骨架"}</p>
            </div>
            <div className="mt-4 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_6rem] gap-2 overflow-hidden">
              <div className="space-y-2 overflow-hidden">
                <span className="block h-3 w-3/4 rounded-full bg-surface-container-highest" />
                <span className="block h-3 w-1/2 rounded-full bg-surface-container-highest" />
                <span className="block h-16 rounded-2xl bg-primary-container/70" />
              </div>
              <div className="rounded-2xl border border-outline-variant bg-surface-container px-2 py-3 text-center text-[0.68rem] font-medium text-on-surface-variant">
                <span className="block truncate">{current || options[0] || "页面"}</span>
                <span className="mt-2 block rounded-full bg-surface-container-high px-2 py-1">Rail</span>
                <span className="mt-1 block rounded-full bg-surface-container-high px-2 py-1">Bar</span>
              </div>
            </div>
          </div>
        </main>
        <nav className="col-start-2 flex min-w-0 items-center justify-around gap-1 border-t border-outline-variant bg-surface-container px-2 py-2">
          {options.map((option) => {
            const active = option === current || (!current && option === options[0]);
            return (
              <span key={option} className={cn("flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-1 text-[0.62rem] font-medium", active ? "bg-secondary-container text-secondary-container-foreground" : "text-on-surface-variant")}>
                <Square aria-hidden className="size-3" />
                <span className="max-w-full truncate">{option}</span>
              </span>
            );
          })}
        </nav>
      </section>
    );
  }

  if (item.type === "navigation") {
    const options = itemOptionTexts(props);
    return (
      <nav className="h-full w-full overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-2 shadow-m3-1">
        <p className="truncate px-3 py-2 text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">{props.title}</p>
        <div className="space-y-1">
          {options.map((option, index) => (
            <div
              key={option}
              className={cn(
                "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm",
                index === 1 ? "bg-secondary-container text-secondary-container-foreground" : "text-on-surface-variant",
              )}
            >
              <Navigation aria-hidden className="size-4" />
              <span className="truncate">{option}</span>
            </div>
          ))}
        </div>
      </nav>
    );
  }

  if (item.type === "navigation-drawer") {
    const options = itemOptionTexts(props);
    return (
      <nav className="flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <div className="mb-2 flex items-center gap-3 px-2 py-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-primary">
            <Navigation aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{props.title}</h3>
            <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
          </div>
        </div>
        <div className="space-y-1">
          {options.map((option) => {
            const active = option === props.value || (!props.value && option === options[0]);
            return (
              <div
                key={option}
                className={cn(
                  "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium",
                  active ? "bg-secondary-container text-secondary-container-foreground" : "text-on-surface-variant",
                )}
              >
                <Square aria-hidden className="size-4 shrink-0" />
                <span className="truncate">{option}</span>
              </div>
            );
          })}
        </div>
      </nav>
    );
  }

  if (item.type === "navigation-item") {
    const active = Boolean(props.checked);
    return (
      <button
        type="button"
        tabIndex={passive ? -1 : undefined}
        aria-pressed={active}
        className={cn(
          "flex h-full w-full min-w-0 items-center gap-3 overflow-hidden rounded-full px-4 text-left text-sm font-semibold transition-colors",
          active ? "bg-secondary-container text-secondary-container-foreground shadow-m3-1" : "border border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
        )}
      >
        <Navigation aria-hidden className="size-4 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block truncate">{props.title || props.label || "导航项"}</span>
          <span className="block truncate text-[0.64rem] font-normal opacity-75">{props.description || props.helper}</span>
        </span>
        {active ? <Check aria-hidden className="size-4 shrink-0" /> : <span className="shrink-0 text-[0.64rem]">{props.value || ""}</span>}
      </button>
    );
  }

  if (item.type === "side-sheet") {
    const options = itemOptionTexts(props);
    return (
      <aside className="flex h-full w-full flex-col overflow-hidden rounded-l-[28px] rounded-r-[18px] border border-outline-variant bg-surface-container-low shadow-m3-2">
        <div className="border-b border-outline-variant px-4 py-4">
          <h3 className="truncate text-base font-semibold">{props.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">{props.description}</p>
        </div>
        <div className="flex-1 space-y-2 p-3">
          {options.map((option, index) => (
            <div key={option} className="rounded-2xl bg-surface-container-high px-3 py-2">
              <p className="truncate text-sm font-medium">{option}</p>
              <p className="truncate text-[0.68rem] text-on-surface-variant">{index === 0 ? "约束、间距、对齐" : index === 1 ? "值、校验、可见性" : "信号与槽函数"}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-outline-variant p-3">
          <Button className="w-full" size="sm" variant={props.variant ?? "default"} tabIndex={passive ? -1 : undefined}>
            {props.label || "应用"}
          </Button>
        </div>
      </aside>
    );
  }

  if (item.type === "bottom-sheet") {
    const options = itemOptionTexts(props);
    return (
      <aside className="flex h-full w-full flex-col overflow-hidden rounded-t-[28px] rounded-b-[18px] border border-outline-variant bg-surface-container-low shadow-m3-3">
        <div className="flex justify-center pt-2">
          <span className="h-1 w-10 rounded-full bg-outline" />
        </div>
        <div className="border-b border-outline-variant px-4 pb-3 pt-2">
          <h3 className="truncate text-base font-semibold">{props.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">{props.description}</p>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-2 p-3">
          {options.map((option) => (
            <div key={option} className="flex min-w-0 flex-col justify-center rounded-2xl bg-surface-container-high px-3 py-2 text-center">
              <span className="truncate text-sm font-medium">{option}</span>
              <span className="mt-1 truncate text-[0.66rem] text-on-surface-variant">目标</span>
            </div>
          ))}
        </div>
        <div className="border-t border-outline-variant p-3">
          <Button className="w-full" size="sm" variant={props.variant ?? "default"} tabIndex={passive ? -1 : undefined}>
            {props.label || "应用"}
          </Button>
        </div>
      </aside>
    );
  }

  if (item.type === "sheet-drag-handle") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[18px] border border-dashed border-outline-variant bg-surface-container-low px-4 text-center shadow-m3-1">
        <span className="h-1.5 w-12 rounded-full bg-outline" />
        <p className="mt-2 max-w-full truncate text-xs font-semibold text-on-surface">{props.title || props.label || "拖动柄"}</p>
        <p className="mt-0.5 max-w-full truncate text-[0.64rem] text-on-surface-variant">{props.description || props.value}</p>
      </div>
    );
  }

  if (item.type === "accordion") {
    const options = itemOptionTexts(props);
    const current = props.value || options[0];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="border-b border-outline-variant px-4 py-3">
          <h3 className="truncate text-sm font-semibold">{props.title}</h3>
          <p className="mt-1 truncate text-xs text-on-surface-variant">{props.description}</p>
        </header>
        <div className="min-h-0 flex-1 divide-y divide-outline-variant overflow-hidden">
          {options.map((option, index) => {
            const active = option === current || (!current && index === 0);
            return (
              <button
                key={option}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "block w-full min-w-0 px-3 py-2 text-left transition",
                  active ? "bg-primary/10" : "hover:bg-surface-container-high",
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-primary transition-transform", active ? "rotate-180" : "")} />
                  <span className="truncate text-sm font-medium">{option}</span>
                  <span className="ml-auto shrink-0 rounded-full border border-outline-variant bg-surface-container px-2 py-0.5 text-[0.64rem] text-on-surface-variant">
                    {active ? "展开" : "折叠"}
                  </span>
                </span>
                {active ? (
                  <span className="mt-2 block rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-xs leading-5 text-on-surface-variant">
                    {index === 0 ? "约束、间距、对齐和响应式断点。" : index === 1 ? "数据来源、默认值和校验状态。" : "信号绑定、槽函数和运行反馈。"}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "tool-box") {
    const options = itemOptionTexts(props);
    const current = props.value || options[0];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="border-b border-outline-variant px-4 py-3">
          <h3 className="truncate text-sm font-semibold">{props.title}</h3>
          <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden p-2">
          {options.map((option, index) => {
            const active = option === current || (!current && index === 0);
            return (
              <div key={option} className={cn("overflow-hidden rounded-xl", active ? "border border-primary/20 bg-primary/10" : "")}>
                <button
                  type="button"
                  tabIndex={passive ? -1 : undefined}
                  className="flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left text-xs font-medium text-on-surface"
                >
                  <ChevronDown aria-hidden className={cn("size-3.5 shrink-0 text-primary", active ? "rotate-180" : "")} />
                  <span className="truncate">{option}</span>
                </button>
                {active ? (
                  <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                    <span className="h-8 rounded-lg bg-surface-container" />
                    <span className="h-8 rounded-lg bg-surface-container-high" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "navigation-rail") {
    const options = itemOptionTexts(props);
    return (
      <nav className="flex h-full w-full flex-col items-center gap-3 overflow-hidden rounded-[26px] border border-outline-variant bg-surface-container-low px-2 py-3 shadow-m3-1">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-primary">
          <Navigation aria-hidden className="size-5" />
        </span>
        <p className="max-w-full truncate text-[0.66rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">{props.title}</p>
        <div className="flex w-full flex-1 flex-col items-center gap-2">
          {options.map((option) => {
            const active = option === props.value || (!props.value && option === options[0]);
            return (
              <span key={option} className="flex w-full flex-col items-center gap-1 text-[0.66rem] font-medium text-on-surface-variant">
                <span className={cn("flex h-8 w-14 items-center justify-center rounded-full", active ? "bg-secondary-container text-secondary-container-foreground" : "bg-surface-container-high")}>
                  <Square aria-hidden className="size-3.5" />
                </span>
                <span className="max-w-full truncate">{option}</span>
              </span>
            );
          })}
        </div>
      </nav>
    );
  }

  if (item.type === "banner") {
    return (
      <section className="flex h-full w-full items-start gap-3 overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-4 shadow-m3-1">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", props.variant === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary-container text-primary")}>
          <AlertTriangle aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{props.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">{props.description}</p>
          <div className="mt-2">
            <Button size="sm" variant={props.variant === "destructive" ? "destructive" : "secondary"} tabIndex={passive ? -1 : undefined}>
              {props.label || "处理"}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (item.type === "section-header") {
    return (
      <header className="flex h-full w-full min-w-0 items-center justify-between gap-4 overflow-hidden border-b border-outline-variant bg-surface px-1">
        <div className="min-w-0">
          <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-primary">{props.value || props.helper || "分区"}</p>
          <h3 className="truncate text-lg font-semibold text-on-surface">{props.title || "分区标题"}</h3>
          <p className="mt-0.5 truncate text-xs text-on-surface-variant">{props.description}</p>
        </div>
        <Badge variant="secondary" className="shrink-0">{props.label || "0 项"}</Badge>
      </header>
    );
  }

  if (item.type === "alert") {
    const destructive = props.variant === "destructive";
    return (
      <section
        className={cn(
          "flex h-full w-full items-start gap-3 overflow-hidden rounded-[18px] border p-4 shadow-m3-1",
          destructive
            ? "border-destructive/35 bg-destructive/10 text-on-surface"
            : "border-outline-variant bg-surface-container-low text-on-surface",
        )}
      >
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", destructive ? "bg-destructive text-destructive-foreground" : "bg-primary-container text-primary")}>
          <AlertTriangle aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{props.title || "提示"}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">{props.description}</p>
          {props.label ? (
            <Button className="mt-2" size="sm" variant={destructive ? "destructive" : "secondary"} tabIndex={passive ? -1 : undefined}>
              {props.label}
            </Button>
          ) : null}
        </div>
      </section>
    );
  }

  if (item.type === "card" || item.type === "elevated-card" || item.type === "filled-card" || item.type === "outlined-card") {
    const value = numericPercent(props.value, item.type === "filled-card" ? 100 : item.type === "outlined-card" ? 42 : 68);
    const cardLabel =
      item.type === "elevated-card"
        ? "Elevated"
        : item.type === "filled-card"
          ? "Filled"
          : item.type === "outlined-card"
            ? "Outlined"
            : props.label || "实时";
    return (
      <section
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-[24px] p-5",
          item.type === "elevated-card" && "border border-transparent bg-surface-container-lowest shadow-m3-3",
          item.type === "filled-card" && "border border-transparent bg-surface-container-high shadow-m3-1",
          item.type === "outlined-card" && "border border-outline-variant bg-surface-container-lowest shadow-none",
          item.type === "card" && "border border-outline-variant bg-surface-container-low shadow-m3-1",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{props.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-5 text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant={item.type === "outlined-card" ? "outline" : "secondary"} className="shrink-0">{cardLabel}</Badge>
        </div>
        <div className="mt-auto pt-4">
          <div className="mb-2 flex items-center justify-between gap-3 text-[0.68rem] text-on-surface-variant">
            <span className="truncate">{props.helper || props.label || "状态"}</span>
            <span className="shrink-0 font-mono tabular-nums">{value}%</span>
          </div>
          <Progress value={value} />
        </div>
      </section>
    );
  }

  if (item.type === "empty-state") {
    return (
      <section className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[24px] border border-dashed border-outline-variant bg-surface-container-low p-5 text-center">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[20px] bg-primary-container text-primary">
          <Box aria-hidden className="size-6" />
        </span>
        <h3 className="mt-3 max-w-full truncate text-base font-semibold">{props.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-on-surface-variant">{props.description}</p>
        <Button className="mt-4" size="sm" variant="secondary" tabIndex={passive ? -1 : undefined}>
          {props.label || "开始"}
        </Button>
      </section>
    );
  }

  if (item.type === "empty-panel") {
    return (
      <section className="grid h-full w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-4 overflow-hidden rounded-[22px] border border-dashed border-outline-variant bg-surface-container-low p-4 shadow-m3-1">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[20px] bg-surface-container-highest text-primary">
          <Box aria-hidden className="size-6" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{props.title || "空面板"}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">{props.description || "当前区域没有内容。"}</p>
          <div className="mt-3 flex min-w-0 items-center gap-2">
            <Button size="sm" variant={props.variant ?? "secondary"} tabIndex={passive ? -1 : undefined}>
              {props.label || "添加"}
            </Button>
            <span className="truncate text-[0.68rem] text-on-surface-variant">{props.helper || "等待操作"}</span>
          </div>
        </div>
      </section>
    );
  }

  if (item.type === "dialog") {
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-outline-variant bg-surface-container-lowest p-5 shadow-m3-3">
        <h3 className="truncate text-lg font-semibold">{props.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-5 text-on-surface-variant">{props.description}</p>
        <div className="mt-auto flex justify-end gap-2">
          <Button size="sm" variant="ghost" tabIndex={passive ? -1 : undefined}>取消</Button>
          <Button size="sm" variant={props.variant ?? "default"} tabIndex={passive ? -1 : undefined}>{props.label || "确认"}</Button>
        </div>
      </section>
    );
  }

  if (item.type === "popover") {
    const options = itemOptionTexts(props);
    return (
      <section className="relative flex h-full w-full items-start justify-center overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-low p-4 shadow-m3-1">
        <Button size="sm" variant="secondary" tabIndex={passive ? -1 : undefined}>
          <MessageSquare aria-hidden className="size-4" />
          <span className="truncate">{props.label || "打开"}</span>
        </Button>
        <div className="absolute left-4 right-4 top-14 rounded-[22px] border border-outline-variant bg-surface-container-lowest p-4 shadow-m3-3">
          <h3 className="truncate text-sm font-semibold">{props.title || "弹出面板"}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">{props.description || "轻量级局部设置"}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {options.slice(0, 3).map((option) => (
              <Badge key={option} variant="secondary" className="max-w-full truncate">
                {option}
              </Badge>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (item.type === "stepper") {
    const options = itemOptionTexts(props);
    return (
      <section className="flex h-full w-full flex-col justify-center overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-4 shadow-m3-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{props.title}</h3>
            <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
          </div>
          <Button size="sm" variant="secondary" tabIndex={passive ? -1 : undefined}>{props.label || "继续"}</Button>
        </div>
        <div className="mt-4 flex items-center">
          {options.map((option, index) => {
            const active = option === props.value || (!props.value && index === 0);
            const complete = options.indexOf(props.value ?? "") > index;
            return (
              <div key={option} className="flex min-w-0 flex-1 items-center">
                <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold", active || complete ? "bg-primary text-primary-foreground" : "bg-surface-container-highest text-on-surface-variant")}>
                  {complete ? <CheckCircle2 aria-hidden className="size-4" /> : index + 1}
                </span>
                <span className={cn("ml-2 truncate text-xs font-medium", active ? "text-on-surface" : "text-on-surface-variant")}>{option}</span>
                {index < options.length - 1 ? <span className="mx-2 h-px min-w-4 flex-1 bg-outline-variant" /> : null}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "wizard") {
    const options = itemOptionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    const activeIndex = Math.max(0, options.findIndex((option) => option === current));
    return (
      <section className="grid h-full w-full grid-cols-[minmax(132px,0.42fr)_minmax(0,1fr)] overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-lowest shadow-m3-2">
        <aside className="flex min-w-0 flex-col gap-2 border-r border-outline-variant bg-surface-container-low p-4">
          <div className="mb-1 min-w-0">
            <h3 className="truncate text-sm font-semibold">{props.title}</h3>
            <p className="mt-1 line-clamp-2 text-[0.68rem] leading-4 text-on-surface-variant">{props.description}</p>
          </div>
          {options.map((option, index) => {
            const active = option === current || (!current && index === 0);
            const complete = activeIndex > index;
            return (
              <button
                key={option}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium transition",
                  active ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-semibold", active || complete ? "bg-primary text-primary-foreground" : "bg-surface-container-highest")}>
                  {complete ? <CheckCircle2 aria-hidden className="size-3.5" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate">{option}</span>
              </button>
            );
          })}
        </aside>
        <div className="flex min-w-0 flex-col overflow-hidden">
          <header className="border-b border-outline-variant px-4 py-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-primary">Wizard</p>
            <h4 className="mt-1 truncate text-base font-semibold">{current || options[0] || "步骤"}</h4>
          </header>
          <div className="grid min-h-0 flex-1 gap-2 p-4">
            <span className="h-3 w-4/5 rounded-full bg-surface-container-high" />
            <span className="h-3 w-2/3 rounded-full bg-surface-container-high" />
            <span className="min-h-0 rounded-xl border border-outline-variant bg-surface-container-low" />
          </div>
          <footer className="flex shrink-0 justify-end gap-2 border-t border-outline-variant bg-surface-container px-4 py-3">
            <Button size="sm" variant="ghost" tabIndex={passive ? -1 : undefined}>上一步</Button>
            <Button size="sm" tabIndex={passive ? -1 : undefined}>{props.label || "下一步"}</Button>
          </footer>
        </div>
      </section>
    );
  }

  if (item.type === "tooltip") {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[20px] border border-outline-variant bg-surface-container-low p-3">
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-sm font-medium shadow-m3-1">
            <MessageSquare aria-hidden className="size-4 text-primary" />
            {props.label}
          </span>
          <span className="absolute left-1/2 top-[calc(100%+0.5rem)] w-max max-w-[220px] -translate-x-1/2 rounded-xl bg-inverse-surface px-3 py-2 text-xs leading-4 text-inverse-on-surface shadow-m3-2">
            {props.description}
          </span>
        </div>
      </div>
    );
  }

  if (item.type === "snackbar") {
    return (
      <section className="flex h-full w-full items-center gap-3 overflow-hidden rounded-[18px] bg-inverse-surface px-4 py-3 text-inverse-on-surface shadow-m3-3">
        <MessageSquare aria-hidden className="size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">{props.title}</h3>
          <p className="truncate text-xs opacity-75">{props.description}</p>
        </div>
        <Button size="sm" variant={props.variant ?? "secondary"} tabIndex={passive ? -1 : undefined}>
          {props.label || "操作"}
        </Button>
      </section>
    );
  }

  if (item.type === "toast") {
    return (
      <section className="flex h-full w-full items-start gap-3 overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-lowest p-3 shadow-m3-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary">
          <CheckCircle2 aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <h3 className="truncate text-sm font-semibold">{props.title || "通知"}</h3>
            <span className="shrink-0 text-[0.66rem] text-on-surface-variant">{props.helper || "现在"}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">{props.description}</p>
          <Button className="mt-2 h-7 px-2 text-[0.68rem]" size="sm" variant={props.variant ?? "secondary"} tabIndex={passive ? -1 : undefined}>
            {props.label || "查看"}
          </Button>
        </div>
      </section>
    );
  }

  if (item.type === "fab") {
    return (
      <Button
        className="h-full w-full rounded-[22px] px-5 shadow-m3-3"
        variant={props.variant ?? "default"}
        size={props.size ?? "lg"}
        tabIndex={passive ? -1 : undefined}
      >
        <Plus aria-hidden className="size-5" />
        <span className="truncate">{props.label || "新增"}</span>
      </Button>
    );
  }

  if (item.type === "extended-fab") {
    return (
      <Button
        className="h-full w-full rounded-[22px] px-5 shadow-m3-3"
        variant={props.variant ?? "default"}
        size={props.size ?? "lg"}
        tabIndex={passive ? -1 : undefined}
      >
        <Plus aria-hidden className="size-5 shrink-0" />
        <span className="min-w-0 truncate">{props.label || "新建"}</span>
      </Button>
    );
  }

  if (item.type === "stat") {
    return (
      <section className="h-full w-full overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-5 shadow-m3-1">
        <p className="truncate text-xs text-on-surface-variant">{props.label}</p>
        <p className="mt-2 truncate text-3xl font-semibold">{props.value}</p>
        <p className="mt-2 truncate text-xs text-primary">{props.helper}</p>
      </section>
    );
  }

  if (item.type === "lcd-display") {
    return (
      <section className="flex h-full w-full flex-col justify-center overflow-hidden rounded-[22px] border border-outline-variant bg-[#17151b] p-4 text-[#f7f2fa] shadow-m3-2">
        <p className="truncate text-xs text-[#cac4d0]">{props.label}</p>
        <p className="mt-2 truncate font-mono text-4xl font-semibold tabular-nums tracking-normal text-[#8bd5ca]">{props.value}</p>
        <div className="mt-2 flex min-w-0 items-center justify-between gap-2">
          <span className="truncate text-[0.68rem] text-[#cac4d0]">{props.title}</span>
          <span className="truncate rounded-full bg-white/10 px-2 py-1 text-[0.66rem] text-[#f7f2fa]">{props.helper}</span>
        </div>
      </section>
    );
  }

  if (item.type === "chart-view") {
    const series = itemOptionTexts(props);
    const current = String(props.value ?? series[0] ?? "");
    const bars = [42, 58, 38, 72, 64, 86];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-outline-variant px-4">
          <BarChart3 aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "图表视图"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="secondary" className="shrink-0">{props.label || "ms"}</Badge>
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-[2rem_minmax(0,1fr)] gap-2 p-3">
          <div className="flex flex-col justify-between text-right text-[0.62rem] text-on-surface-variant">
            <span>90</span>
            <span>60</span>
            <span>30</span>
          </div>
          <div className="relative min-h-0 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
            <svg className="absolute inset-0 h-full w-full text-primary" viewBox="0 0 320 160" preserveAspectRatio="none" aria-hidden>
              <path d="M0 42 H320 M0 84 H320 M0 126 H320" stroke="hsl(var(--outline-variant))" strokeWidth="1" />
              <path d="M18 118 L74 92 L130 104 L186 62 L242 76 L302 38" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="absolute inset-x-4 bottom-3 flex h-20 items-end gap-2">
              {bars.map((height, index) => (
                <span key={index} className="min-w-0 flex-1 rounded-t-lg bg-primary/18" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>
        <footer className="flex h-10 shrink-0 items-center gap-1.5 border-t border-outline-variant bg-surface-container px-3">
          {series.slice(0, 3).map((name, index) => (
            <span key={name} className={cn("min-w-0 truncate rounded-full px-2 py-1 text-[0.66rem] font-medium", name === current || (!current && index === 0) ? "bg-primary-container text-primary" : "bg-surface-container-high text-on-surface-variant")}>
              {name}
            </span>
          ))}
        </footer>
      </section>
    );
  }

  if (item.type === "progress") {
    const percent = numericPercent(props.value, 68);
    return (
      <section className="flex h-full w-full flex-col justify-center overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-4 shadow-m3-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium">{props.title}</h3>
            <p className="truncate text-xs text-on-surface-variant">{props.label}</p>
          </div>
          <Badge variant={props.variant === "destructive" ? "destructive" : "secondary"}>{percent}%</Badge>
        </div>
        <Progress value={percent} className="mt-3" />
        <p className="mt-2 truncate text-xs text-on-surface-variant">{props.description}</p>
      </section>
    );
  }

  if (item.type === "circular-progress") {
    const percent = numericPercent(props.value, 72);
    const color = props.variant === "destructive" ? "hsl(var(--destructive))" : "hsl(var(--primary))";
    return (
      <section className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-4 text-center shadow-m3-1">
        <div
          aria-hidden
          className="grid size-20 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${color} ${percent * 3.6}deg, hsl(var(--surface-container-high)) 0deg)`,
          }}
        >
          <div className="grid size-14 place-items-center rounded-full bg-surface-container-low">
            <span className="text-sm font-semibold">{percent}%</span>
          </div>
        </div>
        <h3 className="mt-3 max-w-full truncate text-sm font-medium">{props.title}</h3>
        <p className="max-w-full truncate text-xs text-on-surface-variant">{props.label}</p>
        <p className="mt-1 max-w-full truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
      </section>
    );
  }

  if (item.type === "progress-list") {
    const rows = itemOptionTexts(props);
    const basePercent = numericPercent(props.value, 68);
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-outline-variant px-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{props.title || "进度列表"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="secondary" className="shrink-0">{props.label || `${rows.length} 项`}</Badge>
        </header>
        <div className="min-h-0 flex-1 space-y-2 overflow-hidden p-3">
          {rows.slice(0, 4).map((row, index) => {
            const value = clamp(basePercent - index * 18, 8, 100);
            return (
              <div key={row} className="rounded-2xl border border-outline-variant bg-surface-container px-3 py-2">
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-medium">{row}</span>
                  <span className="shrink-0 font-mono text-[0.64rem] text-on-surface-variant">{value}%</span>
                </div>
                <Progress value={value} className="h-1.5" />
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "avatar") {
    const initials = (props.value || props.label || "NU").slice(0, 2).toUpperCase();
    return (
      <div className="flex h-full w-full items-center gap-3 overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low px-4 shadow-m3-1">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{props.label}</p>
          <p className="truncate text-xs text-on-surface-variant">{props.helper}</p>
        </div>
      </div>
    );
  }

  if (item.type === "avatar-group") {
    const options = itemOptionTexts(props);
    return (
      <section className="flex h-full w-full items-center justify-between gap-4 overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low px-4 py-3 shadow-m3-1">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{props.title || "头像组"}</h3>
          <p className="truncate text-xs text-on-surface-variant">{props.label || props.description || "协作成员"}</p>
        </div>
        <div className="flex shrink-0 items-center">
          {options.slice(0, 4).map((option, index) => (
            <span
              key={`${option}-${index}`}
              className={cn(
                "flex size-10 items-center justify-center rounded-full border-2 border-surface-container-low bg-primary text-xs font-bold text-primary-foreground shadow-m3-1",
                index > 0 && "-ml-3",
                index === 1 && "bg-secondary text-secondary-foreground",
                index === 2 && "bg-tertiary text-tertiary-foreground",
                index === 3 && "bg-surface-container-highest text-on-surface",
              )}
              title={option}
            >
              {option.slice(0, 2).toUpperCase()}
            </span>
          ))}
          <span className="-ml-2 flex size-9 items-center justify-center rounded-full border-2 border-surface-container-low bg-surface-container-highest text-[0.68rem] font-semibold text-on-surface-variant">
            {props.helper || "+2"}
          </span>
        </div>
      </section>
    );
  }

  if (item.type === "table") {
    return (
      <section className="h-full w-full overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <div className="border-b border-outline-variant px-4 py-3">
          <h3 className="truncate text-sm font-medium">{props.title}</h3>
          <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-container-high text-on-surface-variant">
            <tr>
              <th className="px-4 py-2 font-medium">名称</th>
              <th className="px-4 py-2 font-medium">状态</th>
              <th className="px-4 py-2 font-medium">目标</th>
            </tr>
          </thead>
          <tbody>
            {["桌面外壳", "UI Kit", "编辑器"].map((name, index) => (
              <tr key={name} className="border-t border-outline-variant">
                <td className="px-4 py-2">{name}</td>
                <td className="px-4 py-2">
                  <Badge variant={index === 2 ? "outline" : "secondary"}>{index === 2 ? "草稿" : "就绪"}</Badge>
                </td>
                <td className="px-4 py-2 text-on-surface-variant">Win</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  }

  if (item.type === "table-view") {
    const rows = itemOptionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-outline-variant px-4">
          <Table2 aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "表视图"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline" className="shrink-0">Model</Badge>
        </header>
        <div className="grid shrink-0 grid-cols-[1.4fr_0.8fr_0.8fr] gap-2 border-b border-outline-variant bg-surface-container px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-normal text-on-surface-variant">
          <span className="truncate">Name</span>
          <span className="truncate">State</span>
          <span className="truncate">Target</span>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          {rows.slice(0, 5).map((row, index) => {
            const active = row === current || (!current && index === 0);
            return (
              <button
                key={row}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid h-9 w-full grid-cols-[1.4fr_0.8fr_0.8fr] gap-2 border-b border-outline-variant/70 px-4 text-left text-xs transition-colors",
                  active ? "bg-primary-container/70 text-on-primary-container" : index % 2 ? "bg-surface-container-lowest text-on-surface-variant" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className="flex min-w-0 items-center gap-2 truncate font-medium">
                  <span className={cn("size-2 shrink-0 rounded-full", active ? "bg-primary" : "bg-outline")} />
                  <span className="truncate">{row}</span>
                </span>
                <span className="flex min-w-0 items-center truncate">{index === 2 ? "Draft" : "Ready"}</span>
                <span className="flex min-w-0 items-center truncate">{index === 0 ? "UI" : index === 1 ? "Rust" : "Release"}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "kanban-board") {
    const columns = itemOptionTexts(props);
    const current = String(props.value ?? columns[0] ?? "");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <Layers aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title || "看板"}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description || props.helper}</p>
          </div>
          <Badge className="shrink-0" variant="outline">{props.helper || `${columns.length} 列`}</Badge>
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 overflow-hidden p-3">
          {columns.map((column, index) => {
            const active = column === current || (!current && index === 0);
            return (
              <div key={column} className={cn("flex min-w-0 flex-col gap-2 rounded-2xl border border-outline-variant bg-surface-container p-2", active && "border-primary bg-primary-container/45")}>
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold">{column}</span>
                  <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[0.62rem] text-on-surface-variant">{index + 2}</span>
                </div>
                {["接口联调", "窗口验证"].slice(0, index === 0 ? 1 : 2).map((task, taskIndex) => (
                  <button
                    key={`${column}-${task}`}
                    type="button"
                    tabIndex={passive ? -1 : undefined}
                    className="min-w-0 rounded-xl border border-outline-variant bg-surface-container-low px-2 py-2 text-left shadow-m3-1"
                  >
                    <span className="block truncate text-xs font-medium text-on-surface">{taskIndex === 0 ? task : props.label || "发布检查"}</span>
                    <span className="mt-1 block truncate text-[0.66rem] text-on-surface-variant">{taskIndex === 0 ? "UI / Rust" : "Release"}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "data-grid") {
    const rows = itemOptionTexts(props);
    const current = props.value ?? rows[0];
    return (
      <section className="h-full w-full overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <div className="flex items-center gap-2 border-b border-outline-variant px-3 py-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium">{props.title}</h3>
            <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
          </div>
          <span className="rounded-full border border-outline-variant bg-surface-container-high px-2 py-1 text-[0.68rem] text-on-surface-variant">
            Sort ↑
          </span>
        </div>
        <div className="grid grid-cols-[2rem_minmax(0,1fr)_6rem_5rem] border-b border-outline-variant bg-surface-container-high px-3 py-2 text-[0.68rem] font-medium uppercase text-on-surface-variant">
          <span />
          <span>名称</span>
          <span>状态</span>
          <span>目标</span>
        </div>
        <div className="divide-y divide-outline-variant">
          {rows.map((name, index) => (
            <button
              key={name}
              type="button"
              tabIndex={passive ? -1 : undefined}
              className={cn(
                "grid w-full grid-cols-[2rem_minmax(0,1fr)_6rem_5rem] items-center px-3 py-2 text-left text-xs transition",
                name === current ? "bg-primary/10" : "hover:bg-surface-container-high",
              )}
            >
              <span className={cn("size-2 rounded-full", index === 2 ? "bg-outline" : "bg-primary")} />
              <span className="truncate font-medium">{name}</span>
              <span className="truncate text-on-surface-variant">{index === 2 ? "草稿" : "就绪"}</span>
              <span className="truncate text-on-surface-variant">Win</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (item.type === "property-grid") {
    const rows = itemOptionTexts(props);
    const current = props.value ?? rows[0];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <div className="flex items-center gap-2 border-b border-outline-variant px-3 py-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium">{props.title}</h3>
            <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline" className="shrink-0 text-[0.66rem]">Props</Badge>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_5.5rem] border-b border-outline-variant bg-surface-container-high px-3 py-2 text-[0.68rem] font-medium uppercase text-on-surface-variant">
          <span>属性</span>
          <span>值</span>
          <span>编辑器</span>
        </div>
        <div className="min-h-0 flex-1 divide-y divide-outline-variant overflow-hidden">
          {rows.map((name, index) => {
            const sampleValue = index === 0 ? "380 px" : index === 1 ? "300 px" : props.actionCommandId || "未绑定";
            const editorType = index === 0 ? "number" : index === 1 ? "number" : "event";
            return (
              <button
                key={name}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_5.5rem] items-center gap-2 px-3 py-2 text-left text-xs transition",
                  name === current ? "bg-primary/10 text-on-surface" : "hover:bg-surface-container-high text-on-surface-variant",
                )}
              >
                <span className="truncate font-medium">{name}</span>
                <span className="truncate rounded-lg border border-outline-variant bg-surface-container px-2 py-1 text-on-surface">
                  {sampleValue}
                </span>
                <span className="truncate text-[0.68rem] uppercase">{editorType}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "key-value-list") {
    const rows = itemOptionTexts(props);
    const current = props.value ?? rows[0];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex items-center gap-2 border-b border-outline-variant px-3 py-2">
          <ScrollText aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium">{props.title}</h3>
            <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline" className="shrink-0 text-[0.66rem]">KV</Badge>
        </header>
        <div className="min-h-0 flex-1 divide-y divide-outline-variant overflow-hidden p-2">
          {rows.map((name, index) => {
            const sampleValue =
              index === 0 ? "0.1.0" : index === 1 ? "Windows x64" : props.actionCommandId || "release";
            return (
              <button
                key={name}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid w-full grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-center gap-3 rounded-xl px-2 py-2 text-left text-xs transition",
                  name === current ? "bg-primary/10 text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className="truncate font-medium">{name}</span>
                <span className="truncate rounded-lg border border-outline-variant bg-surface-container px-2 py-1 text-on-surface">
                  {sampleValue}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "inspector-section") {
    const rows = itemOptionTexts(props);
    const current = props.value ?? rows[0];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex items-center gap-2 border-b border-outline-variant bg-surface-container px-3 py-2">
          <ChevronDown aria-hidden className="size-4 shrink-0 text-on-surface-variant" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <span className="rounded-full bg-surface-container-high px-2 py-1 text-[0.66rem] text-on-surface-variant">
            {rows.length}
          </span>
        </header>
        <div className="min-h-0 flex-1 divide-y divide-outline-variant overflow-hidden p-2">
          {rows.map((row, index) => (
            <button
              key={row}
              type="button"
              tabIndex={passive ? -1 : undefined}
              className={cn(
                "grid w-full grid-cols-[minmax(0,1fr)_6rem] items-center gap-2 rounded-xl px-2 py-2 text-left text-xs transition",
                row === current ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              <span className="truncate font-medium">{row}</span>
              <span className="truncate rounded-lg border border-outline-variant bg-surface-container px-2 py-1 text-right text-on-surface">
                {index === 0 ? "380 px" : index === 1 ? "300 px" : "固定"}
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (item.type === "form-layout") {
    const fields = itemOptionTexts(props);
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-4 shadow-m3-1">
        <div className="mb-3 min-w-0">
          <h3 className="truncate text-sm font-medium">{props.title}</h3>
          <p className="truncate text-xs text-on-surface-variant">{props.description}</p>
        </div>
        <div className="grid min-h-0 flex-1 gap-2">
          {fields.map((field, index) => (
            <label key={field} className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] items-center gap-3 text-xs">
              <span className="truncate text-on-surface-variant">{field}</span>
              <span
                className={cn(
                  "min-w-0 truncate rounded-xl border px-3 py-2",
                  index === 1 ? "border-destructive/35 bg-destructive/10 text-destructive" : "border-outline-variant bg-surface-container",
                )}
              >
                {index === 0 ? props.value ?? "Nova UI Kit" : index === 1 ? "需要选择目录" : "Windows exe"}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="truncate text-[0.68rem] text-on-surface-variant">1 个字段需要处理</span>
          <Button size="sm" variant="secondary" className="h-8" tabIndex={passive ? -1 : undefined}>{props.label ?? "保存"}</Button>
        </div>
      </section>
    );
  }

  if (item.type === "console-panel") {
    const rows = itemOptionTexts(props);
    const current = props.value ?? rows[rows.length - 1];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-[#17151b] text-[#f7f2fa] shadow-m3-2">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-white/10 px-3">
          <Terminal aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title}</h3>
            <p className="truncate text-[0.68rem] text-[#cac4d0]">{props.description}</p>
          </div>
          <Badge variant="outline" className="border-white/15 bg-white/5 text-[#cac4d0]">live</Badge>
        </header>
        <div className="min-h-0 flex-1 space-y-1 overflow-hidden p-3 font-mono text-xs">
          {rows.map((row, index) => (
            <button
              key={row}
              type="button"
              tabIndex={passive ? -1 : undefined}
              className={cn(
                "grid w-full grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2 rounded-lg px-2 py-1.5 text-left transition",
                row === current ? "bg-white/10 text-white" : "text-[#cac4d0] hover:bg-white/5",
              )}
            >
              <span className={cn("truncate", index === 1 ? "text-[#f4bf75]" : index === 2 ? "text-[#8bd5ca]" : "text-[#a6da95]")}>
                {index === 1 ? "warn" : index === 2 ? "done" : "info"}
              </span>
              <span className="truncate">{row}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (item.type === "terminal-view") {
    const commands = itemOptionTexts(props);
    const current = String(props.value ?? commands[commands.length - 1] ?? "");
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-[#101116] text-[#f7f2fa] shadow-m3-2">
        <header className="flex h-10 shrink-0 items-center gap-2 border-b border-white/10 bg-[#1b1c22] px-3">
          <Terminal aria-hidden className="size-4 shrink-0 text-[#8bd5ca]" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xs font-semibold">{props.title || "终端"}</h3>
          </div>
          <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[0.64rem] font-semibold text-[#d0bcff]">{props.label || "shell"}</span>
          {props.readOnly ? <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[0.64rem] text-[#cac4d0]">RO</span> : null}
        </header>
        <div className="min-h-0 flex-1 space-y-1 overflow-hidden p-3 font-mono text-xs leading-5">
          <p className="truncate text-[#79747e]">{props.helper || "~"}</p>
          {commands.slice(0, 3).map((command, index) => (
            <p key={`${command}-${index}`} className={cn("truncate", command === current ? "text-[#f7f2fa]" : "text-[#cac4d0]")}>
              <span className="text-[#8bd5ca]">$ </span>
              {command}
            </p>
          ))}
          <p className="truncate text-[#a6da95]">done in 1.4s</p>
        </div>
        <footer className="flex h-10 shrink-0 items-center gap-2 border-t border-white/10 bg-[#1b1c22] px-3 font-mono text-xs">
          <span className="shrink-0 text-[#8bd5ca]">$</span>
          <span className="min-w-0 flex-1 truncate text-[#f7f2fa]">{current || props.placeholder || "输入命令..."}</span>
          <span className="shrink-0 text-[#79747e]">Enter</span>
        </footer>
      </section>
    );
  }

  if (item.type === "timeline") {
    const rows = itemOptionTexts(props);
    const current = props.value ?? rows[rows.length - 1];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low shadow-m3-1">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-outline-variant px-3">
          <Clock3 aria-hidden className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline" className="text-[0.66rem]">live</Badge>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden p-3">
          {rows.map((row, index) => {
            const active = row === current || (!current && index === rows.length - 1);
            return (
              <button
                key={row}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "relative grid w-full grid-cols-[1.75rem_minmax(0,1fr)_4.5rem] items-start gap-2 rounded-xl px-2 py-2 text-left text-xs transition",
                  active ? "bg-primary/10 text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span className="relative flex justify-center">
                  {index < rows.length - 1 ? <span className="absolute left-1/2 top-4 h-8 w-px -translate-x-1/2 bg-outline-variant" /> : null}
                  <span className={cn("relative z-10 size-2.5 rounded-full", index === rows.length - 1 ? "bg-primary" : index === 1 ? "bg-tertiary-container" : "bg-outline")} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{row}</span>
                  <span className="mt-0.5 block truncate text-[0.68rem] opacity-75">
                    {index === 0 ? "刚刚保存" : index === 1 ? "正在检查" : "已完成"}
                  </span>
                </span>
                <span className="truncate text-right text-[0.66rem] opacity-70">{index === 0 ? "09:12" : index === 1 ? "09:14" : "09:18"}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "status-indicator") {
    const rows = itemOptionTexts(props);
    const current = props.value ?? rows[0];
    return (
      <section className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-low p-3 shadow-m3-1">
        <header className="mb-3 flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary">
            <Activity aria-hidden className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{props.title}</h3>
            <p className="truncate text-[0.68rem] text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="outline" className="max-w-[5.5rem] truncate text-[0.66rem]">{current}</Badge>
        </header>
        <div className="grid min-h-0 flex-1 gap-1.5 overflow-hidden">
          {rows.map((row, index) => {
            const active = row === current || (!current && index === 0);
            return (
              <button
                key={row}
                type="button"
                tabIndex={passive ? -1 : undefined}
                className={cn(
                  "grid w-full grid-cols-[0.85rem_minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition",
                  active ? "bg-primary/10 text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <span
                  className={cn(
                    "size-2.5 rounded-full",
                    index === 1 ? "bg-tertiary" : index === 2 ? "bg-destructive" : "bg-primary",
                  )}
                />
                <span className="truncate font-medium">{row}</span>
                <span className="truncate text-[0.66rem] opacity-70">
                  {index === 1 ? "等待" : index === 2 ? "处理" : "在线"}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (item.type === "divider") {
    return <div className="h-full w-full border-t-2 border-outline-variant" />;
  }

  if (item.type === "badge") {
    const variant = props.variant === "destructive" || props.variant === "outline" || props.variant === "secondary" ? props.variant : "default";
    return (
      <div className="flex h-full w-full items-center overflow-hidden">
        <Badge
          variant={variant}
          className="max-w-full gap-1.5 truncate px-3 py-1.5 shadow-m3-1"
        >
          <span
            aria-hidden
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              variant === "destructive" ? "bg-destructive" : variant === "outline" ? "bg-outline" : "bg-primary",
            )}
          />
          <span className="truncate">{props.label || "状态"}</span>
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center">
      <Badge variant={props.variant === "destructive" ? "destructive" : "secondary"} className="max-w-full truncate">
        {props.label}
      </Badge>
    </div>
  );
}

/**
 * Component form of {@link renderBuilderPreview}, so the whole preview
 * renderer can be code-split out of the builder shell (P2-11).
 */
export function BuilderItemPreview({
  item,
  mode,
  assets = [],
}: {
  item: BuilderItem;
  mode: BuilderMode;
  assets?: DesignerAsset[];
}) {
  return <>{renderBuilderPreview(item, mode, assets)}</>;
}
