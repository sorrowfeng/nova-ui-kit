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
    title: "空白",
    description: "空白桌面窗口，适合从零开始。",
    defaultName: "空白项目",
    badge: "自由",
    icon: RectangleHorizontal,
    preview: ["空画布", "默认状态", "默认命令"],
    footprint: "1 个文件 / 0 个控件",
  },
  {
    id: "dashboard",
    title: "仪表盘",
    description: "指标卡、表格和刷新动作。",
    defaultName: "运营仪表盘",
    badge: "数据",
    icon: BarChart3,
    preview: ["标题 + 操作", "3 个指标卡", "状态卡 + 表格"],
    footprint: "1 个文件 / 9 个控件",
  },
  {
    id: "settings",
    title: "设置",
    description: "设置表单、开关和保存命令。",
    defaultName: "设置面板",
    badge: "表单",
    icon: Settings2,
    preview: ["标题", "输入框 + 下拉选择", "开关 + 操作"],
    footprint: "1 个文件 / 9 个控件",
  },
  {
    id: "dialog",
    title: "弹窗",
    description: "紧凑弹窗窗口和确认动作。",
    defaultName: "确认弹窗",
    badge: "弹窗",
    icon: PanelTop,
    preview: ["弹窗标题", "摘要卡片", "取消 / 确认"],
    footprint: "1 个文件 / 5 个控件",
  },
  {
    id: "data-tool",
    title: "数据工具",
    description: "搜索、过滤和数据表工作台。",
    defaultName: "数据工具",
    badge: "工具",
    icon: Table2,
    preview: ["搜索 + 命令", "指标 + 状态", "记录表"],
    footprint: "1 个文件 / 7 个控件",
  },
];

export function projectTemplateById(id: ProjectTemplateId) {
  return projectTemplates.find((template) => template.id === id) ?? projectTemplates[0];
}

export function createBlankFile(name = "主窗口.ui", pagePatch: Partial<PageConfig> = {}, defaultPage: PageConfig): DesignerFile {
  const now = new Date().toISOString();
  const pageTitle = name.replace(/\.ui$/i, "") || "未命名界面";
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
    const status = createTemplateState("statusText", "仪表盘就绪");
    const health = createTemplateState("healthScore", "98%");
    const refresh = createTemplateCommand("refresh_dashboard", "仪表盘已刷新");
    return {
      description: "包含状态卡、表格和刷新操作的运营仪表盘 starter。",
      rustCommands: [refresh],
      stateVariables: [status, health],
      files: [
        file("Dashboard.ui", { title: "运营仪表盘", preset: "wide", width: 1728, height: 1024, zoom: 0.45 }, [
          item("heading", "仪表盘标题", 64, 56, 620, 96, 1, {
            label: "运营",
            title: "服务仪表盘",
            description: "在一个桌面界面中监控构建输出、运行健康度和发布就绪状态。",
          }),
          item("badge", "环境徽标", 1272, 72, 128, 32, 2, { label: "生产环境", variant: "secondary" }),
          item("button", "刷新操作", 1432, 62, 176, 44, 3, {
            label: "刷新数据",
            events: { click: { commandId: refresh.id, resultStateId: status.id } },
          }),
          item("stat", "健康分数", 64, 188, 248, 136, 4, {
            label: "健康分数",
            value: "98%",
            helper: "所有系统正常",
            stateBindings: { value: health.id },
          }),
          item("stat", "构建耗时", 336, 188, 248, 136, 5, { label: "构建耗时", value: "2.4m", helper: "比上次快 18s" }),
          item("stat", "未处理问题", 608, 188, 248, 136, 6, { label: "未处理问题", value: "3", helper: "2 个警告，1 个待审查" }),
          item("card", "发布状态", 64, 372, 472, 232, 7, {
            title: "发布状态",
            description: "打包前可以运行前端检查、Rust 检查和断点验证。",
            stateBindings: { description: status.id },
          }),
          item("table", "最近构建", 584, 372, 760, 300, 8, {
            title: "最近构建",
            description: "生成产物和目标平台。",
          }),
          item("switch", "自动部署", 64, 648, 340, 78, 9, {
            title: "自动部署",
            description: "完整验证通过后发布。",
            checked: false,
          }),
        ]),
      ],
    };
  }

  if (templateId === "settings") {
    const status = createTemplateState("statusText", "设置已就绪");
    const save = createTemplateCommand("save_settings", "设置已保存");
    return {
      description: "包含表单控件、状态绑定和保存操作的设置面板 starter。",
      rustCommands: [save],
      stateVariables: [status],
      files: [
        file("Settings.ui", { title: "设置面板", preset: "desktop", width: 1280, height: 820, zoom: 0.55 }, [
          item("heading", "设置标题", 64, 56, 560, 96, 1, {
            label: "偏好",
            title: "应用设置",
            description: "配置路径、构建行为和生成应用默认值。",
          }),
          item("input", "项目路径", 64, 188, 420, 78, 2, {
            label: "项目路径",
            placeholder: "C:/Users/me/Documents/My App",
            helper: "用于生成应用输出。",
          }),
          item("select", "构建目标", 528, 188, 320, 78, 3, {
            label: "构建目标",
            value: "Windows 可执行文件",
            optionA: "Windows 可执行文件",
            optionB: "macOS 应用",
            optionC: "Linux AppImage",
          }),
          item("switch", "自动保存", 64, 304, 380, 78, 4, {
            title: "自动保存项目",
            description: "编辑时保存 UI 和 Rust 变更。",
            checked: true,
          }),
          item("checkbox", "验证门禁", 476, 318, 340, 48, 5, {
            label: "打包前要求验证",
            checked: true,
          }),
          item("textarea", "发布说明", 64, 424, 620, 160, 6, {
            label: "发布说明",
            placeholder: "记录面向操作者的变更...",
          }),
          item("card", "设置状态", 732, 424, 360, 160, 7, {
            title: "状态",
            description: "设置已就绪",
            stateBindings: { description: status.id },
          }),
          item("button", "保存设置", 64, 632, 180, 44, 8, {
            label: "保存设置",
            events: { click: { commandId: save.id, resultStateId: status.id } },
          }),
          item("button", "重置设置", 264, 632, 160, 44, 9, { label: "重置", variant: "secondary" }),
        ]),
      ],
    };
  }

  if (templateId === "dialog") {
    const status = createTemplateState("statusText", "等待确认");
    const confirm = createTemplateCommand("confirm_action", "操作已确认");
    return {
      description: "包含确认/取消操作的紧凑弹窗 starter。",
      rustCommands: [confirm],
      stateVariables: [status],
      files: [
        file("Confirm Dialog.ui", { title: "确认弹窗", preset: "dialog", width: 720, height: 520, zoom: 0.9, background: "plain", showGrid: true }, [
          item("heading", "弹窗标题", 48, 48, 560, 96, 1, {
            label: "确认",
            title: "应用生成变更？",
            description: "提交 UI 和 Rust 更新到项目之前，请先查看摘要。",
          }),
          item("card", "弹窗摘要", 48, 176, 600, 150, 2, {
            title: "摘要",
            description: "该操作会更新生成文件并运行一次快速项目检查。",
            stateBindings: { description: status.id },
          }),
          item("checkbox", "记住选择", 48, 352, 280, 48, 3, { label: "记住这次选择", checked: false }),
          item("button", "取消", 376, 416, 120, 44, 4, { label: "取消", variant: "secondary" }),
          item("button", "确认", 520, 416, 128, 44, 5, {
            label: "确认",
            events: { click: { commandId: confirm.id, resultStateId: status.id } },
          }),
        ]),
      ],
    };
  }

  if (templateId === "data-tool") {
    const status = createTemplateState("statusText", "已加载 128 条记录");
    const query = createTemplateCommand("filter_records", "{\"success\":true,\"message\":\"记录已过滤\",\"patch\":{\"statusText\":\"已过滤记录\"}}", {
      parameters: [{ id: createId(), name: "query", type: "string", source: "value" }],
      acceptsValue: true,
      result: { ...defaultJsonResultSchema },
    });
    return {
      description: "包含搜索输入、表格、指标和 JSON 结果 patch 的数据工具 starter。",
      rustCommands: [query],
      stateVariables: [status],
      files: [
        file("Data Tool.ui", { title: "数据工具", preset: "desktop", width: 1360, height: 860, zoom: 0.52 }, [
          item("heading", "数据工具标题", 64, 56, 560, 96, 1, {
            label: "数据工具",
            title: "记录浏览器",
            description: "搜索、检查并把本地数据工作流打包成桌面应用。",
          }),
          item("input", "搜索记录", 64, 176, 420, 78, 2, {
            label: "搜索",
            placeholder: "输入查询",
            helper: "运行 Rust 过滤命令。",
            events: { change: { commandId: query.id, resultStateId: status.id, applyJsonStatePatch: true } },
          }),
          item("button", "应用过滤", 512, 204, 148, 44, 3, {
            label: "应用",
            events: { click: { commandId: query.id, resultStateId: status.id, applyJsonStatePatch: true } },
          }),
          item("stat", "记录数量", 64, 300, 220, 132, 4, { label: "记录", value: "128", helper: "本地数据集" }),
          item("stat", "过滤数量", 308, 300, 220, 132, 5, { label: "已过滤", value: "42", helper: "当前查询" }),
          item("card", "工具状态", 552, 300, 340, 132, 6, {
            title: "状态",
            description: "已加载 128 条记录",
            stateBindings: { description: status.id },
          }),
          item("table", "记录表", 64, 480, 960, 300, 7, {
            title: "记录",
            description: "预览当前查询结果。",
          }),
        ]),
      ],
    };
  }

  const rustCommands = createDefaultRustCommands();
  const stateVariables = [createTemplateState("statusText", "就绪")];
  return {
    description: "空白本地 Nova UI 编辑器项目。",
    rustCommands,
    stateVariables,
    files: [createBlankFile("主窗口.ui", {}, options.defaultPage)],
  };
}
