import { BarChart3, PanelTop, RectangleHorizontal, Settings2, Table2, type LucideIcon } from "lucide-react";
import { normalizeItemBounds } from "./layout";
import { createId } from "./ids";
import { createDefaultRustCommands, defaultJsonResultSchema } from "./rust-commands";
import type {
  BuilderComponentType,
  BuilderItem,
  BuilderItemProps,
  BuilderStateVariable,
  DesignerFile,
  PageConfig,
  ResponsiveBreakpointId,
  ResponsiveOverride,
  RustCommand,
} from "./types";

export type ProjectTemplateId = "blank" | "dashboard" | "settings" | "dialog" | "data-tool";

export type ProjectTemplateDefinition = {
  id: ProjectTemplateId;
  title: string;
  description: string;
  defaultName: string;
  badge: string;
  icon: LucideIcon;
  preview: string[];
  footprint: string;
};

export type ProjectTemplateSeed = {
  description: string;
  rustCommands: RustCommand[];
  stateVariables: BuilderStateVariable[];
  files: DesignerFile[];
};

export type ProjectTemplateSeedOptions = {
  defaultPage: PageConfig;
  defaultPropsForType: (type: BuilderComponentType) => BuilderItemProps;
};

export const projectTemplates: ProjectTemplateDefinition[] = [
  {
    id: "blank",
    title: "Blank",
    description: "空白桌面窗口，适合从零开始。",
    defaultName: "Blank Project",
    badge: "自由",
    icon: RectangleHorizontal,
    preview: ["Empty canvas", "Default state", "Default command"],
    footprint: "1 file / 0 controls",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description: "指标卡、表格和刷新动作。",
    defaultName: "Operations Dashboard",
    badge: "数据",
    icon: BarChart3,
    preview: ["Header + action", "3 stat cards", "Status card + table"],
    footprint: "1 file / 9 controls",
  },
  {
    id: "settings",
    title: "Settings",
    description: "设置表单、开关和保存命令。",
    defaultName: "Settings Panel",
    badge: "表单",
    icon: Settings2,
    preview: ["Header", "Inputs + select", "Switches + actions"],
    footprint: "1 file / 9 controls",
  },
  {
    id: "dialog",
    title: "Dialog",
    description: "紧凑弹窗窗口和确认动作。",
    defaultName: "Confirm Dialog",
    badge: "弹窗",
    icon: PanelTop,
    preview: ["Dialog header", "Summary card", "Cancel / confirm"],
    footprint: "1 file / 5 controls",
  },
  {
    id: "data-tool",
    title: "Data Tool",
    description: "搜索、过滤和数据表工作台。",
    defaultName: "Data Tool",
    badge: "工具",
    icon: Table2,
    preview: ["Search + command", "Stats + status", "Record table"],
    footprint: "1 file / 7 controls",
  },
];

export function projectTemplateById(id: ProjectTemplateId) {
  return projectTemplates.find((template) => template.id === id) ?? projectTemplates[0];
}

export function createBlankFile(name = "Main Window.ui", pagePatch: Partial<PageConfig> = {}, defaultPage: PageConfig): DesignerFile {
  const now = new Date().toISOString();
  const pageTitle = name.replace(/\.ui$/i, "") || "Untitled Interface";
  return {
    id: createId(),
    name,
    path: `ui/${name}`,
    page: {
      ...defaultPage,
      title: pageTitle,
      ...pagePatch,
    },
    items: [],
    updatedAt: now,
  };
}

function createTemplateState(name: string, initialValue: string): BuilderStateVariable {
  return {
    id: createId(),
    name,
    initialValue,
  };
}

function createTemplateCommand(name: string, response: string, patch: Partial<RustCommand> = {}): RustCommand {
  return {
    id: createId(),
    name,
    response,
    ...patch,
  };
}

function createTemplateItem(
  options: ProjectTemplateSeedOptions,
  type: BuilderComponentType,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  z: number,
  props: BuilderItemProps = {},
  responsive?: Partial<Record<ResponsiveBreakpointId, ResponsiveOverride>>,
): BuilderItem {
  return {
    id: createId(),
    type,
    name,
    x,
    y,
    width,
    height,
    z,
    responsive,
    props: {
      ...options.defaultPropsForType(type),
      ...props,
    },
  };
}

function createTemplateFile(options: ProjectTemplateSeedOptions, name: string, pagePatch: Partial<PageConfig>, items: BuilderItem[]): DesignerFile {
  const file = createBlankFile(name, pagePatch, options.defaultPage);
  return {
    ...file,
    items: items.map((item) => normalizeItemBounds(item, file.page)),
  };
}

export function createProjectTemplateSeed(templateId: ProjectTemplateId, options: ProjectTemplateSeedOptions): ProjectTemplateSeed {
  const item = (
    type: BuilderComponentType,
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    z: number,
    props: BuilderItemProps = {},
    responsive?: Partial<Record<ResponsiveBreakpointId, ResponsiveOverride>>,
  ) => createTemplateItem(options, type, name, x, y, width, height, z, props, responsive);
  const file = (name: string, pagePatch: Partial<PageConfig>, items: BuilderItem[]) => createTemplateFile(options, name, pagePatch, items);

  if (templateId === "dashboard") {
    const status = createTemplateState("statusText", "Dashboard ready");
    const health = createTemplateState("healthScore", "98%");
    const refresh = createTemplateCommand("refresh_dashboard", "Dashboard refreshed");
    return {
      description: "Operations dashboard starter with status cards, table, and refresh action.",
      rustCommands: [refresh],
      stateVariables: [status, health],
      files: [
        file("Dashboard.ui", { title: "Operations Dashboard", preset: "wide", width: 1728, height: 1024, zoom: 0.45 }, [
          item("heading", "Dashboard title", 64, 56, 620, 96, 1, {
            label: "Operations",
            title: "Service Dashboard",
            description: "Monitor build output, runtime health, and release readiness from one desktop surface.",
          }),
          item("badge", "Environment badge", 1272, 72, 128, 32, 2, { label: "Production", variant: "secondary" }),
          item("button", "Refresh action", 1432, 62, 176, 44, 3, {
            label: "Refresh data",
            events: { click: { commandId: refresh.id, resultStateId: status.id } },
          }),
          item("stat", "Health score", 64, 188, 248, 136, 4, {
            label: "Health score",
            value: "98%",
            helper: "All systems nominal",
            stateBindings: { value: health.id },
          }),
          item("stat", "Build time", 336, 188, 248, 136, 5, { label: "Build time", value: "2.4m", helper: "-18s from last run" }),
          item("stat", "Open issues", 608, 188, 248, 136, 6, { label: "Open issues", value: "3", helper: "2 warnings, 1 review" }),
          item("card", "Release status", 64, 372, 472, 232, 7, {
            title: "Release status",
            description: "Frontend checks, Rust checks, and breakpoint validation are ready to run before packaging.",
            stateBindings: { description: status.id },
          }),
          item("table", "Recent builds", 584, 372, 760, 300, 8, {
            title: "Recent builds",
            description: "Generated artifacts and target platforms.",
          }),
          item("switch", "Auto deploy", 64, 648, 340, 78, 9, {
            title: "Auto deploy",
            description: "Publish after full validation passes.",
            checked: false,
          }),
        ]),
      ],
    };
  }

  if (templateId === "settings") {
    const status = createTemplateState("statusText", "Settings ready");
    const save = createTemplateCommand("save_settings", "Settings saved");
    return {
      description: "Settings panel starter with form controls, state binding, and save action.",
      rustCommands: [save],
      stateVariables: [status],
      files: [
        file("Settings.ui", { title: "Settings Panel", preset: "desktop", width: 1280, height: 820, zoom: 0.55 }, [
          item("heading", "Settings title", 64, 56, 560, 96, 1, {
            label: "Preferences",
            title: "Application Settings",
            description: "Configure paths, build behavior, and generated app defaults.",
          }),
          item("input", "Project path", 64, 188, 420, 78, 2, {
            label: "Project path",
            placeholder: "C:/Users/me/Documents/My App",
            helper: "Used for generated app output.",
          }),
          item("select", "Build target", 528, 188, 320, 78, 3, {
            label: "Build target",
            value: "Windows exe",
            optionA: "Windows exe",
            optionB: "macOS app",
            optionC: "Linux AppImage",
          }),
          item("switch", "Autosave", 64, 304, 380, 78, 4, {
            title: "Autosave project",
            description: "Persist UI and Rust changes while editing.",
            checked: true,
          }),
          item("checkbox", "Validation gate", 476, 318, 340, 48, 5, {
            label: "Require validation before package",
            checked: true,
          }),
          item("textarea", "Release notes", 64, 424, 620, 160, 6, {
            label: "Release notes",
            placeholder: "Document the operator-facing changes...",
          }),
          item("card", "Settings status", 732, 424, 360, 160, 7, {
            title: "Status",
            description: "Settings ready",
            stateBindings: { description: status.id },
          }),
          item("button", "Save settings", 64, 632, 180, 44, 8, {
            label: "Save settings",
            events: { click: { commandId: save.id, resultStateId: status.id } },
          }),
          item("button", "Reset settings", 264, 632, 160, 44, 9, { label: "Reset", variant: "secondary" }),
        ]),
      ],
    };
  }

  if (templateId === "dialog") {
    const status = createTemplateState("statusText", "Waiting for confirmation");
    const confirm = createTemplateCommand("confirm_action", "Action confirmed");
    return {
      description: "Compact dialog starter with confirm/cancel actions.",
      rustCommands: [confirm],
      stateVariables: [status],
      files: [
        file("Confirm Dialog.ui", { title: "Confirm Dialog", preset: "dialog", width: 720, height: 520, zoom: 0.9, background: "plain", showGrid: true }, [
          item("heading", "Dialog heading", 48, 48, 560, 96, 1, {
            label: "Confirmation",
            title: "Apply generated changes?",
            description: "Review the summary before committing UI and Rust updates to the project.",
          }),
          item("card", "Dialog summary", 48, 176, 600, 150, 2, {
            title: "Summary",
            description: "This action will update generated files and run a quick project check.",
            stateBindings: { description: status.id },
          }),
          item("checkbox", "Remember choice", 48, 352, 280, 48, 3, { label: "Remember this choice", checked: false }),
          item("button", "Cancel", 376, 416, 120, 44, 4, { label: "Cancel", variant: "secondary" }),
          item("button", "Confirm", 520, 416, 128, 44, 5, {
            label: "Confirm",
            events: { click: { commandId: confirm.id, resultStateId: status.id } },
          }),
        ]),
      ],
    };
  }

  if (templateId === "data-tool") {
    const status = createTemplateState("statusText", "Loaded 128 records");
    const query = createTemplateCommand("filter_records", "{\"success\":true,\"message\":\"Records filtered\",\"patch\":{\"statusText\":\"Filtered records\"}}", {
      parameters: [{ id: createId(), name: "query", type: "string", source: "value" }],
      acceptsValue: true,
      result: { ...defaultJsonResultSchema },
    });
    return {
      description: "Data tool starter with search input, table, stats, and JSON result patching.",
      rustCommands: [query],
      stateVariables: [status],
      files: [
        file("Data Tool.ui", { title: "Data Tool", preset: "desktop", width: 1360, height: 860, zoom: 0.52 }, [
          item("heading", "Data tool title", 64, 56, 560, 96, 1, {
            label: "Data Tool",
            title: "Record Explorer",
            description: "Search, inspect, and package local data workflows into a desktop app.",
          }),
          item("input", "Search records", 64, 176, 420, 78, 2, {
            label: "Search",
            placeholder: "Type a query",
            helper: "Runs the Rust filter command.",
            events: { change: { commandId: query.id, resultStateId: status.id, applyJsonStatePatch: true } },
          }),
          item("button", "Apply filter", 512, 204, 148, 44, 3, {
            label: "Apply",
            events: { click: { commandId: query.id, resultStateId: status.id, applyJsonStatePatch: true } },
          }),
          item("stat", "Record count", 64, 300, 220, 132, 4, { label: "Records", value: "128", helper: "Local dataset" }),
          item("stat", "Filtered count", 308, 300, 220, 132, 5, { label: "Filtered", value: "42", helper: "Current query" }),
          item("card", "Tool status", 552, 300, 340, 132, 6, {
            title: "Status",
            description: "Loaded 128 records",
            stateBindings: { description: status.id },
          }),
          item("table", "Records table", 64, 480, 960, 300, 7, {
            title: "Records",
            description: "Preview the current query result.",
          }),
        ]),
      ],
    };
  }

  const rustCommands = createDefaultRustCommands();
  const stateVariables = [createTemplateState("statusText", "Ready")];
  return {
    description: "Blank local Nova UI editor project.",
    rustCommands,
    stateVariables,
    files: [createBlankFile("Main Window.ui", {}, options.defaultPage)],
  };
}
