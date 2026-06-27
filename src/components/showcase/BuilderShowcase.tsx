import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from "react";
import {
  BarChart3,
  Box,
  Braces,
  CheckCircle2,
  Copy,
  Download,
  FileJson,
  FolderOpen,
  GripVertical,
  Heading1,
  LayoutTemplate,
  Layers,
  MousePointerClick,
  MoveDown,
  MoveUp,
  PanelTop,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Table2,
  ToggleLeft,
  Trash2,
  Type,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type BuilderComponentType =
  | "hero"
  | "card"
  | "button"
  | "input"
  | "switch"
  | "stats"
  | "table"
  | "alert";

type BuilderMode = "design" | "preview" | "export";
type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ControlSize = "sm" | "md" | "lg";
type AlertTone = "info" | "success" | "danger";
type CanvasWidth = "compact" | "desktop" | "wide";
type CanvasBackground = "plain" | "soft" | "grid";

type PageConfig = {
  title: string;
  width: CanvasWidth;
  background: CanvasBackground;
  autoSave: boolean;
};

type BuilderItemProps = {
  title?: string;
  description?: string;
  label?: string;
  placeholder?: string;
  helper?: string;
  value?: string;
  variant?: ButtonVariant;
  size?: ControlSize;
  tone?: AlertTone;
  checked?: boolean;
};

type BuilderItem = {
  id: string;
  type: BuilderComponentType;
  name: string;
  props: BuilderItemProps;
};

type SavedBuilderState = {
  page: PageConfig;
  items: BuilderItem[];
};

type BuilderTemplate = {
  id: string;
  title: string;
  description: string;
  icon: typeof Layers;
  createState: () => SavedBuilderState;
};

type ComponentDefinition = {
  type: BuilderComponentType;
  title: string;
  description: string;
  icon: typeof Layers;
  defaultProps: BuilderItemProps;
};

const palette: ComponentDefinition[] = [
  {
    type: "hero",
    title: "页面标题",
    description: "用于应用首页、设置页或工作区顶部。",
    icon: Heading1,
    defaultProps: {
      label: "工作区",
      title: "产品控制台",
      description: "集中管理关键指标、任务队列和团队状态。",
    },
  },
  {
    type: "card",
    title: "内容卡片",
    description: "承载表单、摘要和分组内容。",
    icon: Box,
    defaultProps: {
      title: "账户概览",
      description: "当前项目包含 12 个活跃模块，最近 24 小时同步正常。",
    },
  },
  {
    type: "button",
    title: "操作按钮",
    description: "主操作、次操作或危险操作。",
    icon: MousePointerClick,
    defaultProps: {
      label: "新建项目",
      variant: "default",
      size: "md",
    },
  },
  {
    type: "input",
    title: "输入控件",
    description: "用于名称、路径、搜索和配置项。",
    icon: Type,
    defaultProps: {
      label: "项目名称",
      placeholder: "输入名称",
      helper: "名称会用于窗口标题和导出清单。",
    },
  },
  {
    type: "switch",
    title: "开关行",
    description: "用于二元设置和能力开关。",
    icon: ToggleLeft,
    defaultProps: {
      title: "启用自动保存",
      description: "编辑器会在本地保存画布结构。",
      checked: true,
    },
  },
  {
    type: "stats",
    title: "统计模块",
    description: "展示关键指标和运行状态。",
    icon: BarChart3,
    defaultProps: {
      title: "运行指标",
      description: "构建成功率、组件数量和导出状态。",
    },
  },
  {
    type: "table",
    title: "数据表格",
    description: "用于简单列表、配置项或任务队列。",
    icon: Table2,
    defaultProps: {
      title: "最近构建",
      description: "展示构建产物和状态。",
    },
  },
  {
    type: "alert",
    title: "提示横幅",
    description: "用于说明、成功或危险状态。",
    icon: PanelTop,
    defaultProps: {
      title: "导出准备就绪",
      description: "当前界面可以生成 React 结构，并继续交给 Tauri 打包。",
      tone: "info",
    },
  },
];

const BUILDER_STORAGE_KEY = "nova-ui-kit-builder-state-v1";

const defaultPage: PageConfig = {
  title: "Nova Generated Interface",
  width: "desktop",
  background: "grid",
  autoSave: true,
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `node-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createItem(type: BuilderComponentType): BuilderItem {
  const definition = palette.find((item) => item.type === type) ?? palette[0];
  return {
    id: createId(),
    type,
    name: definition.title,
    props: { ...definition.defaultProps },
  };
}

function createInitialItems(): BuilderItem[] {
  return [createItem("hero"), createItem("stats"), createItem("card"), createItem("input"), createItem("button")];
}

function createTemplateItems(types: BuilderComponentType[]) {
  return types.map((type) => createItem(type));
}

function normalizeBuilderState(value: unknown): SavedBuilderState | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const state = value as Partial<SavedBuilderState>;
  if (!Array.isArray(state.items)) {
    return null;
  }

  const allowedTypes = new Set(palette.map((item) => item.type));
  const items = state.items
    .filter((item): item is BuilderItem => Boolean(item && allowedTypes.has(item.type)))
    .map((item) => ({
      id: item.id || createId(),
      type: item.type,
      name: item.name || palette.find((definition) => definition.type === item.type)?.title || item.type,
      props: { ...(item.props ?? {}) },
    }));

  return {
    page: { ...defaultPage, ...(state.page ?? {}) },
    items: items.length > 0 ? items : createInitialItems(),
  };
}

function loadSavedBuilderState(): SavedBuilderState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(BUILDER_STORAGE_KEY);
    return raw ? normalizeBuilderState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function getInitialBuilderState(): SavedBuilderState {
  return loadSavedBuilderState() ?? { page: defaultPage, items: createInitialItems() };
}

const builderTemplates: BuilderTemplate[] = [
  {
    id: "dashboard",
    title: "数据仪表盘",
    description: "标题、指标、表格和主操作，适合管理后台。",
    icon: BarChart3,
    createState: () => ({
      page: { ...defaultPage, title: "Desktop Analytics Dashboard", width: "wide" },
      items: createTemplateItems(["hero", "stats", "table", "button"]),
    }),
  },
  {
    id: "settings",
    title: "设置页面",
    description: "说明卡片、输入项和开关，适合偏好设置。",
    icon: Settings2,
    createState: () => ({
      page: { ...defaultPage, title: "Settings Panel", width: "desktop", background: "soft" },
      items: createTemplateItems(["hero", "card", "input", "switch", "alert"]),
    }),
  },
  {
    id: "empty",
    title: "空白画布",
    description: "从零开始拖拽组件，适合自由搭建。",
    icon: LayoutTemplate,
    createState: () => ({
      page: { ...defaultPage, title: "Untitled Interface", width: "desktop", background: "grid" },
      items: [],
    }),
  },
];

function escapeText(value = "") {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getItemSummary(item: BuilderItem) {
  return item.props.title ?? item.props.label ?? item.name;
}

function renderItemCode(item: BuilderItem) {
  const title = escapeText(item.props.title);
  const description = escapeText(item.props.description);
  const label = escapeText(item.props.label);
  const placeholder = escapeText(item.props.placeholder);

  if (item.type === "hero") {
    return `<section className="rounded-3xl bg-primary-container p-6 text-primary-container-foreground">
  <p className="text-sm opacity-80">${label}</p>
  <h1 className="mt-2 text-3xl font-medium">${title}</h1>
  <p className="mt-3 max-w-2xl text-sm opacity-80">${description}</p>
</section>`;
  }

  if (item.type === "button") {
    return `<Button variant="${item.props.variant ?? "default"}" size="${item.props.size ?? "md"}">${label}</Button>`;
  }

  if (item.type === "input") {
    return `<div className="space-y-2">
  <Label>${label}</Label>
  <Input placeholder="${placeholder}" />
</div>`;
  }

  if (item.type === "switch") {
    return `<div className="flex items-center justify-between rounded-2xl border p-4">
  <div>
    <p className="text-sm font-medium">${title}</p>
    <p className="text-xs text-muted-foreground">${description}</p>
  </div>
  <Switch defaultChecked={${Boolean(item.props.checked)}} />
</div>`;
  }

  if (item.type === "alert") {
    return `<div className="rounded-2xl border p-4">
  <p className="text-sm font-medium">${title}</p>
  <p className="mt-1 text-sm text-muted-foreground">${description}</p>
</div>`;
  }

  if (item.type === "stats") {
    return `<div className="grid gap-3 md:grid-cols-3">
  <StatCard label="组件" value="24" />
  <StatCard label="覆盖率" value="91%" />
  <StatCard label="状态" value="Ready" />
</div>`;
  }

  if (item.type === "table") {
    return `<div className="rounded-2xl border">
  <table className="w-full text-sm">
    <thead><tr><th>名称</th><th>状态</th><th>时间</th></tr></thead>
    <tbody><tr><td>${title}</td><td>完成</td><td>刚刚</td></tr></tbody>
  </table>
</div>`;
  }

  return `<Card><CardHeader><CardTitle>${title}</CardTitle></CardHeader><CardContent>${description}</CardContent></Card>`;
}

function getCanvasWidthClass(width: CanvasWidth) {
  return {
    compact: "max-w-xl",
    desktop: "max-w-3xl",
    wide: "max-w-5xl",
  }[width];
}

function getCanvasBackgroundClass(background: CanvasBackground, mode: BuilderMode) {
  if (mode === "preview") {
    return "bg-surface-container-lowest";
  }

  if (background === "plain") {
    return "bg-surface-container-lowest";
  }

  if (background === "soft") {
    return "bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.08),transparent_34%),hsl(var(--surface-container-lowest))]";
  }

  return "bg-[linear-gradient(hsl(var(--outline-variant)/0.35)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--outline-variant)/0.35)_1px,transparent_1px)] bg-[size:24px_24px]";
}

function renderBuilderPreview(item: BuilderItem) {
  const props = item.props;

  if (item.type === "hero") {
    return (
      <section className="rounded-[28px] bg-primary-container p-6 text-primary-container-foreground shadow-m3-1">
        <p className="text-sm font-medium opacity-80">{props.label}</p>
        <h2 className="mt-2 text-3xl font-medium tracking-normal">{props.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80">{props.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-primary-container-foreground/25 text-primary-container-foreground">
            桌面应用
          </Badge>
          <Badge variant="outline" className="border-primary-container-foreground/25 text-primary-container-foreground">
            Tauri
          </Badge>
        </div>
      </section>
    );
  }

  if (item.type === "card") {
    return (
      <section className="rounded-[24px] border border-outline-variant bg-surface-container-lowest p-5 shadow-m3-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium">{props.title}</h3>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="secondary">Active</Badge>
        </div>
        <Progress value={68} className="mt-5" />
      </section>
    );
  }

  if (item.type === "button") {
    return (
      <div className="flex items-center gap-3 rounded-[24px] border border-dashed border-outline-variant bg-surface-container-low p-5">
        <Button variant={props.variant ?? "default"} size={props.size ?? "md"}>
          <Plus aria-hidden className="size-4" />
          {props.label}
        </Button>
        <span className="text-sm text-on-surface-variant">按钮会映射为 shadcn 风格 Button。</span>
      </div>
    );
  }

  if (item.type === "input") {
    return (
      <div className="space-y-2 rounded-[24px] border border-outline-variant bg-surface-container-low p-5">
        <Label>{props.label}</Label>
        <Input placeholder={props.placeholder} />
        <p className="text-xs text-on-surface-variant">{props.helper}</p>
      </div>
    );
  }

  if (item.type === "switch") {
    return (
      <div className="flex items-center justify-between gap-4 rounded-[24px] border border-outline-variant bg-surface-container-low p-5">
        <div>
          <h3 className="text-sm font-medium">{props.title}</h3>
          <p className="mt-1 text-sm text-on-surface-variant">{props.description}</p>
        </div>
        <Switch checked={Boolean(props.checked)} />
      </div>
    );
  }

  if (item.type === "stats") {
    return (
      <section className="rounded-[24px] border border-outline-variant bg-surface-container-low p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">{props.title}</h3>
            <p className="text-xs text-on-surface-variant">{props.description}</p>
          </div>
          <Badge variant="accent">Live</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["组件", "24"],
            ["覆盖率", "91%"],
            ["状态", "Ready"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-surface-container-high p-4">
              <p className="text-xs text-on-surface-variant">{label}</p>
              <p className="mt-2 text-2xl font-medium">{value}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (item.type === "table") {
    return (
      <section className="overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-low">
        <div className="border-b border-outline-variant p-4">
          <h3 className="text-sm font-medium">{props.title}</h3>
          <p className="text-xs text-on-surface-variant">{props.description}</p>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-high text-xs text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-medium">名称</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">时间</th>
            </tr>
          </thead>
          <tbody>
            {["桌面壳", "组件库", "导出器"].map((name, index) => (
              <tr key={name} className="border-t border-outline-variant">
                <td className="px-4 py-3">{name}</td>
                <td className="px-4 py-3">
                  <Badge variant={index === 2 ? "outline" : "secondary"}>{index === 2 ? "待生成" : "完成"}</Badge>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">{index + 1} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  }

  const toneClass = {
    info: "border-primary/30 bg-primary/8 text-primary",
    success: "border-tertiary-container bg-tertiary-container text-tertiary-container-foreground",
    danger: "border-destructive/30 bg-destructive/8 text-destructive",
  }[props.tone ?? "info"];

  return (
    <section className={cn("rounded-[24px] border p-5", toneClass)}>
      <h3 className="text-sm font-medium">{props.title}</h3>
      <p className="mt-1 text-sm opacity-80">{props.description}</p>
    </section>
  );
}

export function BuilderShowcase() {
  const [initialState] = useState(() => getInitialBuilderState());
  const [page, setPage] = useState<PageConfig>(initialState.page);
  const [items, setItems] = useState<BuilderItem[]>(initialState.items);
  const [selectedId, setSelectedId] = useState(initialState.items[0]?.id ?? "");
  const [mode, setMode] = useState<BuilderMode>("design");
  const [exportKind, setExportKind] = useState<"json" | "jsx">("json");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedItem = items.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (!page.autoSave || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify({ page, items }));
  }, [items, page]);

  const exportJson = useMemo(
    () =>
      JSON.stringify(
        {
          page,
          target: "tauri-react",
          version: 1,
          items,
        },
        null,
        2,
      ),
    [items, page],
  );

  const exportJsx = useMemo(
    () =>
      [
        `export function ${page.title.replace(/[^A-Za-z0-9]/g, "") || "GeneratedInterface"}() {`,
        "  return (",
        "    <div className=\"space-y-4\">",
        ...items.map((item) => renderItemCode(item).split("\n").map((line) => `      ${line}`).join("\n")),
        "    </div>",
        "  );",
        "}",
      ].join("\n"),
    [items, page.title],
  );

  const exportText = exportKind === "json" ? exportJson : exportJsx;

  const handlePaletteDragStart = (event: DragEvent, type: BuilderComponentType) => {
    event.dataTransfer.setData("application/x-nova-component", type);
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleItemDragStart = (event: DragEvent, id: string) => {
    event.dataTransfer.setData("application/x-nova-item", id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleCanvasDrop = (event: DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/x-nova-component") as BuilderComponentType;
    const draggedId = event.dataTransfer.getData("application/x-nova-item");

    if (type) {
      const nextItem = createItem(type);
      setItems((current) => [...current, nextItem]);
      setSelectedId(nextItem.id);
      setMode("design");
    }

    if (draggedId) {
      setItems((current) => {
        const dragged = current.find((item) => item.id === draggedId);
        if (!dragged) {
          return current;
        }
        return [...current.filter((item) => item.id !== draggedId), dragged];
      });
    }
  };

  const handleItemDrop = (event: DragEvent, targetId: string) => {
    event.preventDefault();
    event.stopPropagation();
    const draggedId = event.dataTransfer.getData("application/x-nova-item");
    const type = event.dataTransfer.getData("application/x-nova-component") as BuilderComponentType;

    if (draggedId && draggedId !== targetId) {
      setItems((current) => {
        const dragged = current.find((item) => item.id === draggedId);
        if (!dragged) {
          return current;
        }
        const withoutDragged = current.filter((item) => item.id !== draggedId);
        const targetIndex = withoutDragged.findIndex((item) => item.id === targetId);
        const next = [...withoutDragged];
        next.splice(Math.max(targetIndex, 0), 0, dragged);
        return next;
      });
    }

    if (type) {
      const nextItem = createItem(type);
      setItems((current) => {
        const targetIndex = current.findIndex((item) => item.id === targetId);
        const next = [...current];
        next.splice(targetIndex + 1, 0, nextItem);
        return next;
      });
      setSelectedId(nextItem.id);
    }
  };

  const updateSelectedProps = (patch: BuilderItemProps) => {
    if (!selectedItem) {
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.id === selectedItem.id ? { ...item, props: { ...item.props, ...patch } } : item,
      ),
    );
  };

  const updatePage = (patch: Partial<PageConfig>) => {
    setPage((current) => ({ ...current, ...patch }));
  };

  const saveProject = () => {
    window.localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify({ page, items }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  };

  const loadProject = () => {
    const savedState = loadSavedBuilderState();
    if (!savedState) {
      return;
    }
    setPage(savedState.page);
    setItems(savedState.items);
    setSelectedId(savedState.items[0]?.id ?? "");
    setMode("design");
  };

  const applyTemplate = (template: BuilderTemplate) => {
    const nextState = template.createState();
    setPage(nextState.page);
    setItems(nextState.items);
    setSelectedId(nextState.items[0]?.id ?? "");
    setMode("design");
  };

  const resetCanvas = () => {
    const nextState = { page: defaultPage, items: createInitialItems() };
    setPage(nextState.page);
    setItems(nextState.items);
    setSelectedId(nextState.items[0]?.id ?? "");
    setMode("design");
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  };

  const downloadExport = () => {
    const blob = new Blob([exportText], { type: exportKind === "json" ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = exportKind === "json" ? "nova-interface.json" : "GeneratedInterface.tsx";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const duplicateSelected = () => {
    if (!selectedItem) {
      return;
    }
    const copy = { ...selectedItem, id: createId(), props: { ...selectedItem.props } };
    setItems((current) => {
      const index = current.findIndex((item) => item.id === selectedItem.id);
      const next = [...current];
      next.splice(index + 1, 0, copy);
      return next;
    });
    setSelectedId(copy.id);
  };

  const deleteSelected = () => {
    if (!selectedItem) {
      return;
    }
    setItems((current) => {
      const next = current.filter((item) => item.id !== selectedItem.id);
      setSelectedId(next[0]?.id ?? "");
      return next;
    });
  };

  const copyExport = async () => {
    await navigator.clipboard?.writeText(exportText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="space-y-[var(--panel-gap)]">
      <section className="grid gap-[var(--panel-gap)] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="rounded-[28px] border border-outline-variant bg-surface-container p-4 shadow-m3-1">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">快速开始</h2>
              <p className="text-xs text-on-surface-variant">模板或控件都可点击添加</p>
            </div>
            <LayoutTemplate aria-hidden className="size-4 text-primary" />
          </div>

          <div className="mb-5 space-y-2">
            {builderTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  type="button"
                  data-builder-template={template.id}
                  className="focus-ring flex w-full items-start gap-3 rounded-[22px] border border-outline-variant bg-surface-container-low p-3 text-left transition-colors hover:bg-surface-container-high"
                  onClick={() => applyTemplate(template)}
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary-container-foreground">
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{template.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-on-surface-variant">{template.description}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-on-surface-variant">控件库</h3>
            <Badge variant="secondary">{palette.length}</Badge>
          </div>

          <div className="space-y-2">
            {palette.map((definition) => {
              const Icon = definition.icon;
              return (
                <button
                  key={definition.type}
                  type="button"
                  data-builder-palette-type={definition.type}
                  draggable
                  onDragStart={(event) => handlePaletteDragStart(event, definition.type)}
                  onClick={() => {
                    const nextItem = createItem(definition.type);
                    setItems((current) => [...current, nextItem]);
                    setSelectedId(nextItem.id);
                  }}
                  className="focus-ring m3-state-layer flex w-full items-start gap-3 rounded-[22px] border border-transparent bg-surface-container-low p-3 text-left transition-colors hover:border-outline-variant hover:bg-surface-container-high"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-container text-primary">
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{definition.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-on-surface-variant">{definition.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 rounded-[28px] border border-outline-variant bg-surface-container-lowest shadow-m3-1">
          <div className="flex flex-col gap-3 border-b border-outline-variant p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-medium">{page.title}</h2>
              <p className="text-xs text-on-surface-variant">当前界面包含 {items.length} 个节点，拖拽排序后可直接导出</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedControl
                aria-label="编辑器模式"
                value={mode}
                onValueChange={(value) => setMode(value as BuilderMode)}
                options={[
                  { value: "design", label: "设计" },
                  { value: "preview", label: "预览" },
                  { value: "export", label: "导出" },
                ]}
              />
              <Button variant="ghost" size="sm" data-builder-save="" onClick={saveProject}>
                {saved ? <CheckCircle2 aria-hidden className="size-4" /> : <Save aria-hidden className="size-4" />}
                {saved ? "已保存" : "保存"}
              </Button>
              <Button variant="ghost" size="icon-sm" data-builder-load="" aria-label="载入本地保存" onClick={loadProject}>
                <FolderOpen />
              </Button>
              <Button variant="ghost" size="icon-sm" data-builder-reset="" aria-label="重置画布" onClick={resetCanvas}>
                <RotateCcw />
              </Button>
            </div>
          </div>

          {mode === "export" ? (
            <div className="space-y-4 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SegmentedControl
                  aria-label="导出格式"
                  value={exportKind}
                  onValueChange={(value) => setExportKind(value as "json" | "jsx")}
                  options={[
                    { value: "json", label: "JSON" },
                    { value: "jsx", label: "React" },
                  ]}
                />
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={downloadExport}>
                    <Download aria-hidden className="size-4" />
                    下载文件
                  </Button>
                  <Button variant="secondary" onClick={copyExport}>
                    <Copy aria-hidden className="size-4" />
                    {copied ? "已复制" : "复制导出"}
                  </Button>
                </div>
              </div>
              <Textarea data-builder-export-output="" readOnly value={exportText} className="min-h-[560px] resize-none font-mono text-xs leading-5" />
            </div>
          ) : (
            <div
              data-builder-canvas=""
              className={cn("min-h-[680px] p-5", getCanvasBackgroundClass(page.background, mode))}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleCanvasDrop}
            >
              <div className={cn("mx-auto min-h-[620px] rounded-[32px] border border-outline-variant bg-surface p-5 shadow-m3-2", getCanvasWidthClass(page.width))}>
                {items.length === 0 ? (
                  <div className="flex min-h-[560px] items-center justify-center rounded-[28px] border border-dashed border-outline-variant text-sm text-on-surface-variant">
                    拖入组件开始搭建
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        data-builder-node={item.type}
                        draggable={mode === "design"}
                        onDragStart={(event) => handleItemDragStart(event, item.id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleItemDrop(event, item.id)}
                        onClick={() => setSelectedId(item.id)}
                        className={cn(
                          "group relative rounded-[30px] transition",
                          mode === "design" && "cursor-pointer p-1",
                          mode === "design" && selectedId === item.id && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
                          mode === "design" && selectedId !== item.id && "hover:ring-1 hover:ring-outline",
                        )}
                      >
                        {mode === "design" ? (
                          <div className="absolute -left-2 -top-2 z-10 flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-high px-2 py-1 text-[0.68rem] font-medium text-on-surface-variant opacity-0 shadow-m3-1 transition-opacity group-hover:opacity-100">
                            <GripVertical aria-hidden className="size-3" />
                            {index + 1}
                          </div>
                        ) : null}
                        {renderBuilderPreview(item)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <aside className="rounded-[28px] border border-outline-variant bg-surface-container p-4 shadow-m3-1">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">设计器</h2>
              <p className="text-xs text-on-surface-variant">页面、对象树和属性</p>
            </div>
            <Settings2 aria-hidden className="size-4 text-primary" />
          </div>

          <div className="space-y-4">
            <section className="rounded-[24px] bg-surface-container-low p-3">
              <div className="mb-3 flex items-center gap-2">
                <FileJson aria-hidden className="size-4 text-primary" />
                <h3 className="text-sm font-medium">页面设置</h3>
              </div>
              <div className="space-y-3">
                <Field label="页面名称">
                  <Input value={page.title} onChange={(event) => updatePage({ title: event.target.value })} />
                </Field>
                <Field label="画布宽度">
                  <Select value={page.width} onValueChange={(value) => updatePage({ width: value as CanvasWidth })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">紧凑</SelectItem>
                      <SelectItem value="desktop">桌面</SelectItem>
                      <SelectItem value="wide">宽屏</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="背景">
                  <Select value={page.background} onValueChange={(value) => updatePage({ background: value as CanvasBackground })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">网格</SelectItem>
                      <SelectItem value="soft">柔和</SelectItem>
                      <SelectItem value="plain">纯色</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="flex items-center justify-between rounded-2xl bg-surface-container-high p-3">
                  <Label>自动保存</Label>
                  <Switch checked={page.autoSave} onCheckedChange={(autoSave) => updatePage({ autoSave })} />
                </div>
              </div>
            </section>

            <section className="rounded-[24px] bg-surface-container-low p-3">
              <div className="mb-3 flex items-center gap-2">
                <Layers aria-hidden className="size-4 text-primary" />
                <h3 className="text-sm font-medium">对象树</h3>
              </div>
              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-outline-variant p-4 text-center text-xs text-on-surface-variant">
                  画布为空
                </div>
              ) : (
                <div className="space-y-1">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-1 rounded-2xl p-1 transition-colors",
                        selectedId === item.id ? "bg-secondary-container text-secondary-container-foreground" : "hover:bg-surface-container-high",
                      )}
                    >
                      <button
                        type="button"
                        className="focus-ring min-w-0 flex-1 rounded-xl px-2 py-2 text-left"
                        onClick={() => setSelectedId(item.id)}
                      >
                        <span className="block truncate text-xs font-medium">{index + 1}. {getItemSummary(item)}</span>
                        <span className="block truncate text-[0.68rem] opacity-70">{item.name}</span>
                      </button>
                      <button
                        type="button"
                        className="focus-ring rounded-full p-1 disabled:opacity-30"
                        aria-label="上移节点"
                        disabled={index === 0}
                        onClick={() => moveItem(item.id, -1)}
                      >
                        <MoveUp aria-hidden className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="focus-ring rounded-full p-1 disabled:opacity-30"
                        aria-label="下移节点"
                        disabled={index === items.length - 1}
                        onClick={() => moveItem(item.id, 1)}
                      >
                        <MoveDown aria-hidden className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="my-4 h-px bg-outline-variant" />

          {selectedItem ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">节点属性</h3>
                <p className="mt-1 text-xs text-on-surface-variant">{getItemSummary(selectedItem)}</p>
              </div>
              <div className="rounded-[22px] bg-surface-container-low p-3">
                <p className="text-xs text-on-surface-variant">类型</p>
                <p className="mt-1 text-sm font-medium">{selectedItem.name}</p>
              </div>

              {"title" in selectedItem.props ? (
                <Field label="标题">
                  <Input value={selectedItem.props.title ?? ""} onChange={(event) => updateSelectedProps({ title: event.target.value })} />
                </Field>
              ) : null}

              {"label" in selectedItem.props ? (
                <Field label="标签">
                  <Input value={selectedItem.props.label ?? ""} onChange={(event) => updateSelectedProps({ label: event.target.value })} />
                </Field>
              ) : null}

              {"description" in selectedItem.props ? (
                <Field label="说明">
                  <Textarea value={selectedItem.props.description ?? ""} onChange={(event) => updateSelectedProps({ description: event.target.value })} />
                </Field>
              ) : null}

              {"placeholder" in selectedItem.props ? (
                <Field label="占位文本">
                  <Input value={selectedItem.props.placeholder ?? ""} onChange={(event) => updateSelectedProps({ placeholder: event.target.value })} />
                </Field>
              ) : null}

              {"helper" in selectedItem.props ? (
                <Field label="辅助说明">
                  <Input value={selectedItem.props.helper ?? ""} onChange={(event) => updateSelectedProps({ helper: event.target.value })} />
                </Field>
              ) : null}

              {selectedItem.type === "button" ? (
                <>
                  <Field label="按钮意图">
                    <Select value={selectedItem.props.variant ?? "default"} onValueChange={(value) => updateSelectedProps({ variant: value as ButtonVariant })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="ghost">Ghost</SelectItem>
                        <SelectItem value="destructive">Destructive</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="尺寸">
                    <Select value={selectedItem.props.size ?? "md"} onValueChange={(value) => updateSelectedProps({ size: value as ControlSize })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              ) : null}

              {selectedItem.type === "alert" ? (
                <Field label="状态">
                  <Select value={selectedItem.props.tone ?? "info"} onValueChange={(value) => updateSelectedProps({ tone: value as AlertTone })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="danger">Danger</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              ) : null}

              {selectedItem.type === "switch" ? (
                <div className="flex items-center justify-between rounded-[22px] bg-surface-container-low p-3">
                  <Label>默认开启</Label>
                  <Switch checked={Boolean(selectedItem.props.checked)} onCheckedChange={(checked) => updateSelectedProps({ checked })} />
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="secondary" onClick={duplicateSelected}>
                  <Copy aria-hidden className="size-4" />
                  复制
                </Button>
                <Button variant="destructive" onClick={deleteSelected}>
                  <Trash2 aria-hidden className="size-4" />
                  删除
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-outline-variant p-6 text-center text-sm text-on-surface-variant">
              选择画布节点后编辑属性
            </div>
          )}
        </aside>
      </section>

      <section className="grid gap-[var(--panel-gap)] lg:grid-cols-3">
        {[
          ["拖拽构建", "从组件库拖到画布，支持重新排序和选中编辑。"],
          ["结构导出", "JSON 可作为持久化 schema，React 片段可继续接入项目。"],
          ["桌面输出", "编辑器本身仍运行在 Tauri 壳内，可以直接打包 exe。"],
        ].map(([title, description], index) => (
          <div key={title} className="rounded-[28px] border border-outline-variant bg-surface-container p-5 shadow-m3-1">
            <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-secondary-container text-primary">
              {index === 0 ? <MousePointerClick aria-hidden className="size-4" /> : null}
              {index === 1 ? <Braces aria-hidden className="size-4" /> : null}
              {index === 2 ? <Save aria-hidden className="size-4" /> : null}
            </div>
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-on-surface-variant">{label}</Label>
      {children}
    </div>
  );
}
