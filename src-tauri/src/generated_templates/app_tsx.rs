// Extracted from generated_app_runtime.rs (workflow C1). Keep byte-stable.

pub const GENERATED_APP_TSX: &str = r#"import { useCallback, useEffect, useMemo, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  backendIntegrationOpenLogCommand,
  backendIntegrationProbeCommand,
  backendIntegrationReadLogCommand,
  backendIntegrationRuntimeStatusCommand,
  backendIntegrationStartCommand,
  backendIntegrationStopCommand,
  project,
  registeredRustCommands,
  rustCommandBindings,
  rustCommandSchemas,
} from "./project-data";

type LayoutMode = "free" | "row" | "column" | "grid";
type BreakpointId = "desktop" | "tablet" | "mobile";

type ResponsiveOverride = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

type EventName = "click" | "change";
type EventPayloadMode = "value" | "json";
type EventPayloadField = "event" | "itemId" | "itemName" | "value" | "checked" | "state";
type CommandParameterType = "string" | "bool" | "number" | "json";
type CommandParameterSource = "value" | "checked" | "event" | "itemId" | "itemName" | "state" | "payload";
type CommandParameterSchema = {
  name: string;
  type: CommandParameterType;
  source: CommandParameterSource;
};
type CommandResultSchema = {
  mode?: "text" | "json";
  messagePath?: string;
  statePatchPath?: string;
  successPath?: string;
  errorPath?: string;
};
type CommandSchema = {
  parameters?: readonly CommandParameterSchema[];
  result?: CommandResultSchema;
};
type EventBinding = {
  commandId?: string;
  passValue?: boolean;
  payloadMode?: EventPayloadMode;
  payloadFields?: readonly EventPayloadField[];
  resultTargetItemId?: string;
  resultTargetProp?: "value" | "label" | "title" | "description" | "helper";
  resultStateId?: string;
  applyJsonStatePatch?: boolean;
};
// C2: slot contract per container control type (workflow C2).
const CONTROL_SLOTS: Record<string, string[]> = {
  frame: ["children"],
  "group-box": ["content"],
  card: ["header", "content", "actions"],
  "dialog-button-box": ["actions"],
  tabs: ["tabs", "panels"],
};

// C2/i18n: locale message bundle for generated runtime (zh-CN default, en-US optional).
const GENERATED_MESSAGES = {
  "zh-CN": {
    appTitle: "Nova 生成应用",
    runCommand: "运行",
    running: "运行中…",
    noBinding: "未绑定 Rust command",
    healthy: "后端就绪",
    frameDefault: "容器",
    buttonDefault: "按钮",
  },
  "en-US": {
    appTitle: "Nova Generated App",
    runCommand: "Run",
    running: "Running…",
    noBinding: "No Rust command bound",
    healthy: "Backend ready",
    frameDefault: "Frame",
    buttonDefault: "Button",
  },
} as const;

type GeneratedLocale = keyof typeof GENERATED_MESSAGES;
type GeneratedMessages = (typeof GENERATED_MESSAGES)[GeneratedLocale];

function resolveGeneratedLocale(locale?: string): GeneratedLocale {
  return locale === "en-US" || locale === "en" ? "en-US" : "zh-CN";
}

function generatedMessages(locale?: string): GeneratedMessages {
  return GENERATED_MESSAGES[resolveGeneratedLocale(locale)];
}

type ItemProps = Record<string, unknown> & {
  actionCommandId?: string;
  events?: Partial<Record<EventName, EventBinding>>;
  stateBindings?: Partial<Record<"value" | "label" | "title" | "description" | "helper", string>>;
  enabled?: boolean;
  visible?: boolean;
  readOnly?: boolean;
  tabIndex?: number;
};

type Item = {
  id: string;
  type: string;
  name?: string;
  parentId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  responsive?: Partial<Record<BreakpointId, ResponsiveOverride>>;
  props?: ItemProps;
};

type ProjectAsset = {
  id: string;
  name: string;
  publicPath: string;
};

type ProjectStateVariable = {
  id: string;
  name: string;
  initialValue: string;
};

type RuntimeReleaseConfig = {
  appName?: string;
  windowTitle?: string;
  windowKind?: "main" | "dialog" | "tool" | "frameless";
  titlebarStyle?: "nova" | "native" | "hidden";
  titlebarSubtitle?: string;
  showRuntimePanel?: boolean;
};
type RuntimeWindowKind = "main" | "dialog" | "tool" | "frameless";
type RuntimeTitlebarStyle = "nova" | "native" | "hidden";
type RuntimePageBackground = "plain" | "soft";

type CommandFeedback = Record<string, { loading: boolean; message: string; error: boolean }>;
type ItemPropOverrides = Record<string, Record<string, string>>;
type StateValues = Record<string, string>;
type CommandRunner = (item: Item, eventName: EventName, rawValue?: unknown) => void;
type PropWriter = (item: Item, propName: string, value: string) => void;
type RuntimeTraceEntry = {
  id: string;
  time: string;
  itemId: string;
  itemName: string;
  eventName: EventName;
  commandName: string;
  status: "running" | "success" | "error";
  args?: Record<string, unknown>;
  result?: string;
  message?: string;
  patch?: StateValues;
  error?: string;
};
type BackendProbeResult = {
  id: string;
  name: string;
  kind: string;
  language: string;
  transport: string;
  status: "ready" | "skipped" | "timeout" | "error" | string;
  message: string;
  durationMs?: number;
  exitCode?: number | null;
  stdout?: string;
  stderr?: string;
  resourcePath?: string;
};
type BackendRuntimeStatus = {
  id: string;
  name: string;
  kind: string;
  transport: string;
  status: "running" | "stopped" | "exited" | "skipped" | "error" | string;
  pid?: number | null;
  startedAtMs?: number | null;
  message: string;
  resourcePath?: string;
  logPath?: string;
};
type BackendRuntimeLogResult = {
  success: boolean;
  message: string;
  logPath?: string;
  content?: string;
  truncated?: boolean;
  lengthBytes?: number;
};
type BackendRuntimeLogPreview = {
  loading: boolean;
  message: string;
  content: string;
  error: boolean;
  truncated?: boolean;
  lengthBytes?: number;
  logPath?: string;
};

const projectAssets = ((project as unknown as { assets?: readonly ProjectAsset[] }).assets ?? []) as readonly ProjectAsset[];
const projectStateVariables = ((project as unknown as { stateVariables?: readonly ProjectStateVariable[] }).stateVariables ?? []) as readonly ProjectStateVariable[];
const projectReleaseConfig = ((project as unknown as { releaseConfig?: RuntimeReleaseConfig }).releaseConfig ?? {}) as RuntimeReleaseConfig;
const commandBindings = rustCommandBindings as Record<string, string>;
const commandSchemas = rustCommandSchemas as Record<string, CommandSchema>;
const defaultEventPayloadFields: EventPayloadField[] = ["event", "itemId", "itemName", "value"];
const startupProbeCommandName =
  Object.entries(commandBindings).find(([commandId]) => (commandSchemas[commandId]?.parameters ?? []).length === 0)?.[1] ?? null;
const breakpointSizes: Record<BreakpointId, { width: number; height: number }> = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 1024, height: 768 },
  mobile: { width: 390, height: 844 },
};

function breakpointForWindow(width: number): BreakpointId {
  if (width <= 600) {
    return "mobile";
  }
  if (width <= 1100) {
    return "tablet";
  }
  return "desktop";
}

function useResponsiveBreakpoint() {
  const [width, setWidth] = useState(typeof window === "undefined" ? 1440 : window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return breakpointForWindow(width);
}

function pageForBreakpoint(page: { width?: number; height?: number }, breakpoint: BreakpointId) {
  if (breakpoint === "desktop") {
    return { width: Number(page.width ?? breakpointSizes.desktop.width), height: Number(page.height ?? breakpointSizes.desktop.height) };
  }
  return breakpointSizes[breakpoint];
}

function runtimeWindowKind(value: unknown): RuntimeWindowKind {
  return value === "dialog" || value === "tool" || value === "frameless" ? value : "main";
}

function runtimeTitlebarStyle(value: unknown, windowKind: RuntimeWindowKind): RuntimeTitlebarStyle {
  if (windowKind === "frameless") {
    return "hidden";
  }
  return value === "native" || value === "hidden" ? value : "nova";
}

function runtimePageBackground(value: unknown): RuntimePageBackground {
  return value === "soft" ? "soft" : "plain";
}

function resolveItemForBreakpoint(item: Item, breakpoint: BreakpointId): Item {
  if (breakpoint === "desktop") {
    return item;
  }
  const override = item.responsive?.[breakpoint];
  if (!override) {
    return item;
  }
  return {
    ...item,
    x: typeof override.x === "number" ? override.x : item.x,
    y: typeof override.y === "number" ? override.y : item.y,
    width: typeof override.width === "number" ? override.width : item.width,
    height: typeof override.height === "number" ? override.height : item.height,
  };
}

function resolveItemsForBreakpoint(items: Item[], breakpoint: BreakpointId) {
  return items.map((item) => resolveItemForBreakpoint(item, breakpoint));
}

function assetSrc(props: ItemProps) {
  const assetId = String(props.assetId ?? "");
  const asset = projectAssets.find((candidate) => candidate.id === assetId);
  const publicPath = String(props.assetPath || asset?.publicPath || "");
  return publicPath ? `/${publicPath.replace(/^\/+/, "")}` : "";
}

function eventFeedbackKey(itemId: string, eventName: EventName) {
  return `${itemId}:${eventName}`;
}

function eventBinding(props: ItemProps, eventName: EventName): EventBinding {
  return props.events?.[eventName] ?? (eventName === "click" && props.actionCommandId ? { commandId: props.actionCommandId } : {});
}

function eventCommandName(props: ItemProps, eventName: EventName) {
  const commandId = String(eventBinding(props, eventName).commandId ?? "");
  return commandId ? commandBindings[commandId] ?? "" : "";
}

function createInitialStateValues(): StateValues {
  return Object.fromEntries(projectStateVariables.map((state) => [state.id, String(state.initialValue ?? "")]));
}

function statePatchFromRecord(value: unknown): StateValues {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const stateByName = new Map(projectStateVariables.map((state) => [state.name, state.id]));
  const stateIds = new Set(projectStateVariables.map((state) => state.id));
  const patch: StateValues = {};
  for (const [key, patchValue] of Object.entries(value as Record<string, unknown>)) {
    const stateId = stateIds.has(key) ? key : stateByName.get(key);
    if (stateId) {
      patch[stateId] = String(patchValue ?? "");
    }
  }
  return patch;
}

function statePatchFromJson(result: string): StateValues {
  try {
    return statePatchFromRecord(JSON.parse(result));
  } catch {
    return {};
  }
}

function valueAtPath(value: unknown, path = "") {
  if (!path.trim()) {
    return value;
  }
  return path.split(".").filter(Boolean).reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    return (current as Record<string, unknown>)[segment];
  }, value);
}

function stringResult(value: unknown, fallback: string) {
  if (typeof value === "string") {
    return value;
  }
  if (value === undefined || value === null) {
    return fallback;
  }
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function traceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowLabel() {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

type WindowAction = "minimize" | "toggleMaximize" | "close";

const TITLEBAR_INTERACTIVE_SELECTOR = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "[role='button']",
  "[role='menuitem']",
  "[data-titlebar-interactive='true']",
  "[data-titlebar-interactive-control]",
  "[contenteditable='true']",
].join(",");

function isTitlebarInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest(TITLEBAR_INTERACTIVE_SELECTOR));
}

async function runWindowAction(action: WindowAction) {
  try {
    const appWindow = getCurrentWindow();
    if (action === "minimize") {
      await appWindow.minimize();
    }
    if (action === "toggleMaximize") {
      await appWindow.toggleMaximize();
    }
    if (action === "close") {
      await appWindow.close();
    }
  } catch {
    // Browser preview fallback.
  }
}

function startWindowDrag(event: ReactMouseEvent<HTMLElement>) {
  if (event.button !== 0 || event.detail > 1 || isTitlebarInteractiveTarget(event.target)) {
    return;
  }
  void getCurrentWindow().startDragging().catch(() => {
    // Browser preview fallback.
  });
}

function NovaWindowTitlebar({
  title,
  subtitle,
  status,
  windowKind,
  titlebarStyle,
}: {
  title: string;
  subtitle: string;
  status: string;
  windowKind: RuntimeWindowKind;
  titlebarStyle: RuntimeTitlebarStyle;
}) {
  return (
    <div
      className="window-titlebar"
      data-runtime-titlebar="nova"
      data-runtime-titlebar-parity="editor-shell"
      data-runtime-titlebar-density="desktop"
      data-titlebar-drag-shell=""
      data-window-kind={windowKind}
      data-titlebar-style={titlebarStyle}
      data-titlebar-status={status ? "active" : "idle"}
      onMouseDown={startWindowDrag}
      onDoubleClick={(event) => {
        if (!isTitlebarInteractiveTarget(event.target)) {
          void runWindowAction("toggleMaximize");
        }
      }}
    >
      <div
        aria-hidden="true"
        className="titlebar-hit-strip"
        data-tauri-drag-region=""
        data-titlebar-drag-region=""
        data-titlebar-drag-strip=""
        data-titlebar-drag-hit-target="background"
      />
      <div
        className="titlebar-drag-region"
        data-tauri-drag-region=""
        data-titlebar-drag-region=""
        data-titlebar-drag-hit-target="content"
      >
        <div className="titlebar-brand" data-tauri-drag-region="" data-titlebar-drag-region="" data-titlebar-drag-hit-target="brand">
          <span className="titlebar-mark" aria-hidden data-tauri-drag-region="">N</span>
          <span className="titlebar-title" data-tauri-drag-region="">{title}</span>
          {subtitle ? <span className="titlebar-subtitle" data-tauri-drag-region="">{subtitle}</span> : null}
          <span className="titlebar-runtime-chip" data-runtime-titlebar-chip="live-app" data-tauri-drag-region="">Runtime</span>
        </div>
        <span className="titlebar-status" data-tauri-drag-region="">{status}</span>
      </div>
      <div className="window-controls" data-titlebar-interactive="true">
        <button type="button" aria-label="Minimize window" data-titlebar-interactive-control="" data-window-control="minimize" onClick={() => void runWindowAction("minimize")}>
          <span aria-hidden className="window-control-icon window-minimize-icon" />
        </button>
        <button type="button" aria-label="Maximize or restore window" data-titlebar-interactive-control="" data-window-control="toggle-maximize" onClick={() => void runWindowAction("toggleMaximize")}>
          <span aria-hidden className="window-control-icon window-maximize-icon" />
        </button>
        <button type="button" aria-label="Close window" className="window-close" data-titlebar-interactive-control="" data-window-control="close" onClick={() => void runWindowAction("close")}>
          <span aria-hidden className="window-control-icon window-close-icon" />
        </button>
      </div>
    </div>
  );
}

function commandResultOutcome(result: string, binding: EventBinding) {
  const schema = commandSchemas[String(binding.commandId ?? "")]?.result;
  if (schema?.mode !== "json") {
    return {
      message: result,
      error: false,
      patch: binding.applyJsonStatePatch ? statePatchFromJson(result) : {},
    };
  }

  try {
    const parsed = JSON.parse(result) as Record<string, unknown>;
    const successValue = valueAtPath(parsed, schema.successPath || "success");
    const errorValue = valueAtPath(parsed, schema.errorPath || "error");
    const messageValue = valueAtPath(parsed, schema.messagePath || "message");
    const patchValue = valueAtPath(parsed, schema.statePatchPath || "patch");
    const hasError = successValue === false || Boolean(errorValue);
    return {
      message: stringResult(hasError ? errorValue ?? messageValue : messageValue, result),
      error: hasError,
      patch: hasError ? {} : statePatchFromRecord(patchValue),
    };
  } catch {
    return {
      message: result,
      error: true,
      patch: {},
    };
  }
}

function selectedPayloadFields(binding: EventBinding): EventPayloadField[] {
  const validFields = new Set<EventPayloadField>(["event", "itemId", "itemName", "value", "checked", "state"]);
  const fields = (binding.payloadFields?.length ? binding.payloadFields : defaultEventPayloadFields).filter(
    (field): field is EventPayloadField => validFields.has(field as EventPayloadField),
  );
  return fields.length > 0 ? fields : defaultEventPayloadFields;
}

function stateSnapshot(stateValues: StateValues) {
  return Object.fromEntries(
    projectStateVariables.map((state) => [
      state.name || state.id,
      Object.prototype.hasOwnProperty.call(stateValues, state.id) ? stateValues[state.id] : String(state.initialValue ?? ""),
    ]),
  );
}

function eventPayload(
  item: Item,
  props: ItemProps,
  eventName: EventName,
  rawValue: unknown,
  binding: EventBinding,
  stateValues: StateValues,
) {
  const value = rawValue ?? props.value ?? props.label ?? "";
  const payload: Record<string, unknown> = {};
  for (const field of selectedPayloadFields(binding)) {
    if (field === "event") {
      payload.event = eventName;
    } else if (field === "itemId") {
      payload.itemId = item.id;
    } else if (field === "itemName") {
      payload.itemName = String(item.name ?? props.label ?? item.type);
    } else if (field === "value") {
      payload.value = value;
    } else if (field === "checked") {
      payload.checked = typeof rawValue === "boolean" ? rawValue : Boolean(props.checked);
    } else if (field === "state") {
      payload.state = stateSnapshot(stateValues);
    }
  }
  return payload;
}

function commandSourceValue(
  parameter: CommandParameterSchema,
  item: Item,
  props: ItemProps,
  eventName: EventName,
  rawValue: unknown,
  binding: EventBinding,
  stateValues: StateValues,
) {
  const value = rawValue ?? props.value ?? props.label ?? "";
  if (parameter.source === "checked") {
    return typeof rawValue === "boolean" ? rawValue : Boolean(props.checked);
  }
  if (parameter.source === "event") {
    return eventName;
  }
  if (parameter.source === "itemId") {
    return item.id;
  }
  if (parameter.source === "itemName") {
    return String(item.name ?? props.label ?? item.type);
  }
  if (parameter.source === "state") {
    return stateSnapshot(stateValues);
  }
  if (parameter.source === "payload") {
    return {
      event: eventName,
      itemId: item.id,
      itemName: String(item.name ?? props.label ?? item.type),
      value,
      checked: typeof rawValue === "boolean" ? rawValue : Boolean(props.checked),
      state: stateSnapshot(stateValues),
      selected: eventPayload(item, props, eventName, rawValue, binding, stateValues),
    };
  }
  return value;
}

function coerceCommandArg(type: CommandParameterType, value: unknown) {
  if (type === "bool") {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      return value === "true" || value === "1" || value === "on";
    }
    return Boolean(value);
  }
  if (type === "number") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (type === "json") {
    return value ?? null;
  }
  return typeof value === "string" ? value : JSON.stringify(value ?? "");
}

function commandArgs(
  item: Item,
  props: ItemProps,
  eventName: EventName,
  rawValue: unknown,
  binding: EventBinding,
  stateValues: StateValues,
) {
  const schema = commandSchemas[String(binding.commandId ?? "")];
  const parameters = schema?.parameters ?? [];
  if (parameters.length > 0) {
    return Object.fromEntries(
      parameters.map((parameter) => [
        parameter.name,
        coerceCommandArg(
          parameter.type,
          commandSourceValue(parameter, item, props, eventName, rawValue, binding, stateValues),
        ),
      ]),
    );
  }
  if (!binding.passValue) {
    return undefined;
  }
  if (binding.payloadMode === "json") {
    return { value: JSON.stringify(eventPayload(item, props, eventName, rawValue, binding, stateValues)) };
  }
  return { value: String(rawValue ?? props.value ?? "") };
}

function itemProps(item: Item, overrides: ItemPropOverrides, stateValues: StateValues): ItemProps {
  const base = { ...(item.props ?? {}), ...(overrides[item.id] ?? {}) } as ItemProps;
  for (const [propName, stateId] of Object.entries(base.stateBindings ?? {})) {
    if (stateId && Object.prototype.hasOwnProperty.call(stateValues, stateId)) {
      base[propName] = stateValues[stateId];
    }
  }
  return base;
}

function propNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.min(Math.max(safe, min), max);
}

const runtimeInteractiveSelector = "button,input,textarea,select,a[href],[role='button'],[tabindex]";

function runtimeTabIndex(props: ItemProps) {
  const parsed = typeof props.tabIndex === "number" ? props.tabIndex : Number(props.tabIndex);
  return Number.isFinite(parsed) ? Math.round(propNumber(parsed, 0, -1, 999)) : undefined;
}

function runtimeItemState(props: ItemProps) {
  return {
    enabled: props.enabled !== false,
    visible: props.visible !== false,
    readOnly: props.readOnly === true,
  };
}

function optionTexts(props: ItemProps) {
  return [props.optionA, props.optionB, props.optionC].map((option) => String(option ?? "").trim()).filter(Boolean);
}

function percentValue(value: unknown, fallback = 50) {
  return propNumber(value, fallback, 0, 100);
}

function itemConstraints(item: Item) {
  return {
    left: item.props?.constraintLeft !== false,
    right: item.props?.constraintRight === true,
    top: item.props?.constraintTop !== false,
    bottom: item.props?.constraintBottom === true,
  };
}

function frameLayoutMode(item: Item): LayoutMode {
  const mode = item.props?.layoutMode;
  return mode === "row" || mode === "column" || mode === "grid" ? mode : "free";
}

function frameChildrenStyle(item: Item): CSSProperties {
  const mode = frameLayoutMode(item);
  if (mode === "free") {
    return {};
  }
  const gap = propNumber(item.props?.layoutGap, 12, 0, 80);
  const padding = propNumber(item.props?.layoutPadding, 16, 0, 80);
  if (mode === "row") {
    return { display: "flex", flexDirection: "row", alignItems: "flex-start", gap, padding, overflow: "auto" };
  }
  if (mode === "column") {
    return { display: "flex", flexDirection: "column", alignItems: "stretch", gap, padding, overflow: "auto" };
  }
  const columns = propNumber(item.props?.layoutColumns, 2, 1, 6);
  return { display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, alignContent: "flex-start", gap, padding, overflow: "auto" };
}

function nodeStyle(item: Item, parentLayout: LayoutMode, parentSize?: { width: number; height: number }): CSSProperties {
  if (parentLayout !== "free") {
    return { width: item.width, height: item.height, zIndex: item.z };
  }
  const constraints = itemConstraints(item);
  const bounds = parentSize ?? { width: item.x + item.width, height: item.y + item.height };
  const style: CSSProperties = { zIndex: item.z };
  if (constraints.left || !constraints.right) {
    style.left = item.x;
  }
  if (constraints.right) {
    style.right = bounds.width - item.x - item.width;
  }
  if (!constraints.right || !constraints.left) {
    style.width = item.width;
  }
  if (constraints.top || !constraints.bottom) {
    style.top = item.y;
  }
  if (constraints.bottom) {
    style.bottom = bounds.height - item.y - item.height;
  }
  if (!constraints.bottom || !constraints.top) {
    style.height = item.height;
  }
  return style;
}

function renderNode(
  item: Item,
  allItems: Item[],
  feedback: CommandFeedback,
  propOverrides: ItemPropOverrides,
  stateValues: StateValues,
  onRunCommand: CommandRunner,
  onWriteProp: PropWriter,
  parentLayout: LayoutMode = "free",
  parentSize?: { width: number; height: number },
) {
  const props = itemProps(item, propOverrides, stateValues);
  const tabIndex = runtimeTabIndex(props);
  const runtimeState = runtimeItemState(props);
  const style: CSSProperties = {
    ...nodeStyle(item, parentLayout, parentSize),
    ...(runtimeState.visible ? {} : { display: "none" }),
  };
  const boundEvents = (["click", "change"] as const)
    .filter((eventName) => Boolean(eventBinding(props, eventName).commandId))
    .join(",");
  const propSummary = [
    props.label != null ? `label=${props.label}` : "",
    props.title != null ? `title=${props.title}` : "",
    props.value != null ? `value=${props.value}` : "",
  ]
    .filter(Boolean)
    .join("|");
  return (
    <div
      key={item.id}
      className={parentLayout === "free" ? "node" : "node node-flow"}
      style={style}
      aria-disabled={runtimeState.enabled ? undefined : true}
      aria-hidden={runtimeState.visible ? undefined : true}
      data-nova-control-id={item.id}
      data-nova-control-type={item.type}
      data-nova-control-name={String(item.name ?? item.type)}
      data-nova-parent-id={item.parentId ?? ""}
      data-nova-tab-index={tabIndex ?? undefined}
      data-nova-enabled={runtimeState.enabled ? "true" : "false"}
      data-nova-visible={runtimeState.visible ? "true" : "false"}
      data-nova-read-only={runtimeState.readOnly ? "true" : "false"}
      data-nova-events={boundEvents || undefined}
      data-nova-props={propSummary || undefined}
      data-nova-slot-region="control"
      data-nova-slots={(CONTROL_SLOTS[item.type] ?? []).join(",") || undefined}
    >
      {renderItem(item, allItems, feedback, propOverrides, stateValues, onRunCommand, onWriteProp)}
    </div>
  );
}

function renderItem(
  item: Item,
  allItems: Item[],
  feedback: CommandFeedback,
  propOverrides: ItemPropOverrides,
  stateValues: StateValues,
  onRunCommand: CommandRunner,
  onWriteProp: PropWriter,
) {
  const props = itemProps(item, propOverrides, stateValues);
  if (item.type === "frame") {
    const mode = frameLayoutMode(item);
    const children = allItems.filter((child) => child.parentId === item.id).sort((a, b) => a.z - b.z);
    return (
      <section className="card frame">
        <strong>{String(props.title ?? generatedMessages().frameDefault)}</strong>
        <p>{String(props.description ?? "")}</p>
        <div className={mode === "free" ? "frame-children" : "frame-children frame-children-auto"} style={frameChildrenStyle(item)} data-nova-slot="children" data-nova-slot-owner={item.id}>
          {children.map((child) => renderNode(child, allItems, feedback, propOverrides, stateValues, onRunCommand, onWriteProp, mode, { width: item.width, height: item.height }))}
        </div>
      </section>
    );
  }
  if (item.type === "group-box") {
    const rows = optionTexts(props);
    return <fieldset className="group-box"><legend>{String(props.title ?? "Group")}</legend><p>{String(props.description ?? "")}</p><div>{rows.map((row, index) => <label key={row}><span>{row}</span><i className={index === 2 ? "group-box-meter group-box-meter-active" : "group-box-meter"} /></label>)}</div></fieldset>;
  }
  if (item.type === "spacer") {
    return <div className="spacer"><span>↔</span><strong>{String(props.title ?? "Spacer")}</strong><small>{String(props.value ?? props.description ?? "stretch")}</small></div>;
  }
  if (item.type === "label") {
    return <div className="text-label"><strong>{String(props.label ?? "Label")}</strong>{props.description ? <small>{String(props.description)}</small> : null}</div>;
  }
  if (item.type === "link-label") {
    const commandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "click")];
    const label = state?.loading ? "Running..." : String(props.label ?? "Open link");
    const target = String(props.value ?? props.helper ?? '#');
    return <button type="button" className="link-label" title={target} disabled={Boolean(state?.loading)} onClick={commandName ? () => onRunCommand(item, "click", target) : undefined}><strong>{label}</strong>{props.description ? <small>{String(props.description)}</small> : null}<code>{target}</code></button>;
  }
  if (item.type === "text-browser") {
    const lines = String(props.value ?? props.description ?? "Read-only text").split(/\n+/).filter(Boolean);
    return <section className="text-browser"><header><strong>{String(props.title ?? "Text browser")}</strong><span>Read only</span></header><div>{lines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div></section>;
  }
  if (item.type === "help-viewer") {
    const commandName = eventCommandName(props, "click");
    const topics = optionTexts(props);
    const current = String(props.value ?? topics[0] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Help viewer")}</strong><small>{String(props.description ?? "")}</small></header><div className="tree-table-head"><span>Topic</span><span>Type</span><span>Key</span></div><div className="tree-table-body">{topics.map((topic, index) => <button key={topic} type="button" className={topic === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", topic); if (commandName) onRunCommand(item, "click", topic); }}><span>{index === 0 ? "▾" : "↳"} <b>{topic}</b></span><small>{index === 0 ? "Guide" : "Doc"}</small><em>{index === 1 ? "F1" : "Open"}</em></button>)}</div></section>;
  }
  if (item.type === "image") {
    const src = assetSrc(props);
    const fit = String(props.objectFit ?? "cover");
    return src ? <img className={`image image-${fit}`} src={src} alt={String(props.alt ?? props.label ?? "Project asset")} /> : <section className="card"><strong>No image asset</strong><p>Bind a project asset in Nova UI Editor.</p></section>;
  }
  if (item.type === "image-list") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="image-list"><header><span><strong>{String(props.title ?? "Image list")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></span><em>{String(props.helper ?? `${options.length} items`)}</em></header><div>{options.slice(0, 6).map((option, index) => <button key={`${option}-${index}`} type="button" className={option === current || (!current && index === 0) ? "image-list-item image-list-item-active" : "image-list-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span className={`image-list-thumb image-list-thumb-${(index % 3) + 1}`} /><strong>{option}</strong></button>)}</div><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "select") : undefined}>{String(props.label ?? "Select")}</button></section>;
  }
  if (item.type === "web-view") {
    const commandName = eventCommandName(props, "click");
    const pages = optionTexts(props);
    const current = String(props.value ?? pages[0] ?? "about:blank");
    return <section className="web-view"><header><span>{current}</span><button type="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "reload") : undefined}>{String(props.label ?? "Reload")}</button></header><main><aside>{pages.slice(0, 3).map((page, index) => <button key={page} type="button" className={page === current || (!current && index === 0) ? "web-tab web-tab-active" : "web-tab"} onClick={() => { onWriteProp(item, "value", page); if (commandName) onRunCommand(item, "click", page); }}>{page}</button>)}</aside><article><strong>{String(props.title ?? "Web view")}</strong><p>{String(props.description ?? "")}</p><span /><span /><i /></article></main><footer>DOM ready · sandboxed preview</footer></section>;
  }
  if (item.type === "media-player") {
    const commandName = eventCommandName(props, "click");
    const chapters = optionTexts(props);
    const progress = percentValue(props.value, 42);
    return <section className="media-player"><div className="media-screen"><span><strong>{String(props.title ?? "Media player")}</strong><small>{String(props.description ?? "")}</small></span><button type="button" className="media-play" aria-label={String(props.label ?? "Play")} onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "play") : undefined}>▶</button></div><footer><div className="media-controls"><button type="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "play") : undefined}>▶</button><span className="media-track"><i style={{ width: `${progress}%` }} /></span><small>{String(props.helper ?? `${progress}%`)}</small></div><div className="media-chapters">{chapters.slice(0, 3).map((chapter, index) => <button key={chapter} type="button" className={index === 0 ? "media-chip media-chip-active" : "media-chip"} onClick={() => { onWriteProp(item, "value", chapter); if (commandName) onRunCommand(item, "click", chapter); }}>{chapter}</button>)}</div></footer></section>;
  }
  if (item.type === "pdf-viewer") {
    const commandName = eventCommandName(props, "click");
    const sections = optionTexts(props);
    const current = String(props.value ?? "1 / 1");
    return <section className="pdf-viewer"><header><span><strong>{String(props.title ?? "PDF viewer")}</strong><small>{String(props.description ?? "")}</small></span><em>{current}</em><button type="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "fit-width") : undefined}>{String(props.label ?? "Fit width")}</button></header><main><aside>{sections.slice(0, 3).map((section, index) => <button key={section} type="button" className={index === 0 ? "pdf-page pdf-page-active" : "pdf-page"} onClick={() => { onWriteProp(item, "value", `${index + 1} / ${Math.max(sections.length, 1)}`); if (commandName) onRunCommand(item, "click", section); }}><i /><span>{section}</span></button>)}</aside><article><strong>{String(props.title ?? "Document")}</strong><span /><span /><div><p /><p /><p /><b /></div></article></main><footer><span>{String(props.helper ?? "Zoom 100%")}</span><span>{current}</span></footer></section>;
  }
  if (item.type === "map-view") {
    const commandName = eventCommandName(props, "click");
    const layers = optionTexts(props);
    return <section className="map-view"><header><span><strong>{String(props.title ?? "Map view")}</strong><small>{String(props.description ?? "")}</small></span><button type="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "locate") : undefined}>{String(props.label ?? "Locate")}</button></header><div className="map-canvas"><svg aria-hidden viewBox="0 0 500 300" preserveAspectRatio="none"><path d="M34 206 C96 154 132 168 184 126 C236 82 308 82 366 118 C416 150 442 132 482 84" /></svg>{layers.slice(0, 3).map((layer, index) => <button key={layer} type="button" className={`map-marker map-marker-${index + 1}`} onClick={() => { onWriteProp(item, "value", layer); if (commandName) onRunCommand(item, "click", layer); }}><i />{layer}</button>)}<aside><strong>{String(props.value ?? "31.2304, 121.4737")}</strong><small>{String(props.helper ?? "Zoom 14")}</small></aside></div></section>;
  }
  if (item.type === "graphics-view") {
    const commandName = eventCommandName(props, "click");
    const layers = optionTexts(props);
    const current = String(props.value ?? layers[0] ?? "100%");
    return <section className="graphics-view"><header><span><strong>{String(props.title ?? "Graphics view")}</strong><small>{String(props.description ?? "")}</small></span><em>{current}</em></header><div className="graphics-scene"><svg aria-hidden viewBox="0 0 480 260" preserveAspectRatio="none"><path d="M110 92 C180 52 252 58 326 112" /><path d="M148 172 C230 210 302 190 370 146" /></svg>{layers.slice(0, 3).map((layer, index) => <button key={`${layer}-${index}`} type="button" className={`graphics-node graphics-node-${index + 1}`} onClick={() => { onWriteProp(item, "value", layer); if (commandName) onRunCommand(item, "click", layer); }}><strong>{layer}</strong><span /></button>)}</div><footer>{layers.slice(0, 3).map((layer) => <small key={layer}>{layer}</small>)}</footer></section>;
  }
  if (item.type === "carousel") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="carousel">{options.map((option, index) => <button key={option} type="button" className={option === current ? "carousel-card carousel-card-active" : "carousel-card"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>{index + 1}</span><strong>{option}</strong><small>{index === 0 ? String(props.title ?? "Carousel") : String(props.description ?? "")}</small></button>)}</section>;
  }
  if (item.type === "button") {
    const commandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "click")];
    const messages = generatedMessages();
    const label = state?.loading ? messages.running : String(props.label ?? messages.buttonDefault);
    return (
      <button
        className="button"
        type="button"
        title={commandName ? `Runs ${commandName}` : "No Rust command bound"}
        aria-label={String(props.label ?? "Button")}
        disabled={Boolean(state?.loading) || !commandName}
        data-nova-event-click={commandName || undefined}
        data-nova-command={commandName || undefined}
        data-nova-runtime-state={state?.loading ? "loading" : state?.status ?? "idle"}
        onClick={commandName ? () => onRunCommand(item, "click") : undefined}
      >
        {label}
      </button>
    );
  }
  if (item.type === "button-group") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    const runChange = (value: string) => {
      onWriteProp(item, "value", value);
      if (commandName) onRunCommand(item, "change", value);
    };
    return <div className="button-group" role="group" aria-label={String(props.label ?? "Button group")}>{options.slice(0, 5).map((option) => <button key={option} type="button" className={option === current ? "button-group-item button-group-item-active" : "button-group-item"} aria-pressed={option === current} disabled={Boolean(state?.loading)} onClick={() => runChange(option)}>{option}</button>)}</div>;
  }
  if (item.type === "dialog-button-box") {
    const commandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "click")];
    const options = optionTexts(props);
    const primaryLabel = String(props.label ?? options[options.length - 1] ?? "OK");
    const actions = options.length > 0 ? options : ["Cancel", "Apply", primaryLabel];
    const runAction = (action: string) => {
      onWriteProp(item, "helper", action);
      if (commandName) onRunCommand(item, "click", action);
    };
    return <div className="dialog-button-box" aria-label={String(props.helper ?? "Dialog actions")}>{actions.slice(0, 4).map((action, index) => { const primary = action === primaryLabel || index === actions.length - 1; return <button key={`${action}-${index}`} type="button" className={primary ? "dialog-button dialog-button-primary" : "dialog-button"} disabled={Boolean(state?.loading) || !commandName} onClick={() => runAction(action)}>{state?.loading && primary ? "Running..." : action}</button>; })}</div>;
  }
  if (item.type === "command-link-button") {
    const commandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "click")];
    const label = state?.loading ? "Running..." : String(props.label ?? "Continue");
    return <button type="button" className="command-link-button" disabled={Boolean(state?.loading) || !commandName} onClick={commandName ? () => onRunCommand(item, "click", label) : undefined}><span>→</span><strong>{String(props.title ?? label)}</strong><small>{String(props.description ?? props.helper ?? "")}</small><em>{label}</em></button>;
  }
  if (item.type === "menu-button") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? props.label ?? "Menu");
    const runMenuItem = (value: string) => {
      onWriteProp(item, "value", value);
      if (commandName) onRunCommand(item, "click", value);
    };
    return <div className="split-button menu-button"><button type="button" className="split-button-main" disabled={!commandName} onClick={commandName ? () => runMenuItem(current) : undefined}><span>☰</span><strong>{String(props.label ?? "Menu")}</strong><small>{current}</small></button><button type="button" className="split-button-menu" aria-label="Switch menu item" onClick={() => runMenuItem(options[(Math.max(0, options.indexOf(current)) + 1) % Math.max(1, options.length)] ?? current)}>⌄</button></div>;
  }
  if (item.type === "split-button") {
    const commandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "click")];
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    const label = state?.loading ? "Running..." : String(props.label ?? "Run");
    const nextOption = () => {
      const index = Math.max(0, options.indexOf(current));
      return options[(index + 1) % Math.max(1, options.length)] ?? current;
    };
    const runAction = (value: string) => {
      onWriteProp(item, "value", value);
      if (commandName) onRunCommand(item, "click", value);
    };
    return <div className={state?.loading ? "split-button split-button-loading" : "split-button"}><button type="button" className="split-button-main" title={commandName ? `Runs ${commandName}` : "No Rust command bound"} disabled={Boolean(state?.loading) || !commandName} onClick={commandName ? () => runAction(current) : undefined}><span>▶</span><strong>{label}</strong><small>{current || "Default"}</small></button><button type="button" className="split-button-menu" aria-label="Switch split button option" disabled={Boolean(state?.loading) || options.length === 0} onClick={() => runAction(nextOption())}>⌄</button></div>;
  }
  if (item.type === "tool-button") {
    const commandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "click")];
    const label = state?.loading ? "Running..." : String(props.label ?? "Tool");
    return <button type="button" className={props.variant === "destructive" ? "tool-button tool-button-danger" : "tool-button"} title={commandName ? `Runs ${commandName}` : "No Rust command bound"} disabled={Boolean(state?.loading) || !commandName} onClick={commandName ? () => onRunCommand(item, "click", label) : undefined}><span>◆</span><strong>{label}</strong></button>;
  }
  if (item.type === "toggle-button") {
    const commandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "click")];
    const active = Boolean(props.checked);
    const label = state?.loading ? "Running..." : String(props.label ?? "Toggle");
    const runToggle = () => {
      onWriteProp(item, "checked", String(!active));
      if (commandName) onRunCommand(item, "click", !active);
    };
    return <button type="button" className={active ? "tool-button toggle-button-active" : "tool-button"} aria-pressed={active} title={commandName ? `Runs ${commandName}` : "Toggle state"} disabled={Boolean(state?.loading)} onClick={runToggle}><span>{active ? "✓" : "○"}</span><strong>{label}</strong></button>;
  }
  if (item.type === "toggle-group") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="segmented toggle-group" aria-label={String(props.label ?? "Toggle group")}>{options.map((option, index) => { const active = option === current || (!current && index === 0); return <button key={option} type="button" className={active ? "segment segment-active" : "segment"} aria-pressed={active} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "change", option); }}>{option}</button>; })}</section>;
  }
  if (item.type === "icon-button") {
    const commandName = eventCommandName(props, "click");
    const label = String(props.label ?? "Action");
    const icon = label.toLowerCase().includes("save") || label.includes("保存") ? "💾" : label.toLowerCase().includes("run") || label.includes("运行") ? "▶" : "●";
    return <button type="button" className="icon-action-button" aria-label={label} title={label} onClick={commandName ? () => onRunCommand(item, "click", label) : undefined}>{icon}</button>;
  }
  if (item.type === "input") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field"><span>{String(props.label ?? "Input")}</span><input value={String(props.value ?? "")} placeholder={String(props.placeholder ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</label>;
  }
  if (item.type === "password-field") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const visible = Boolean(props.checked);
    const current = String(props.value ?? "");
    return <label className="field password-field"><span>{String(props.label ?? "Password")}</span><div className="password-field-control"><span aria-hidden>🔒</span><input type={visible ? "text" : "password"} value={current} placeholder={String(props.placeholder ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} /><button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => onWriteProp(item, "checked", String(!visible))}>{visible ? "Hide" : "Show"}</button></div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "number-field") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const current = String(props.value ?? "");
    const numericValue = Number(current);
    const writeValue = (nextValue: string) => {
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    const stepValue = (delta: number) => {
      const nextValue = String(Number.isFinite(numericValue) ? numericValue + delta : delta);
      writeValue(nextValue);
    };
    return <label className="field number-field"><span>{String(props.label ?? "Number")}</span><div className="number-field-control"><button type="button" aria-label="Decrease value" onClick={() => stepValue(-1)}>-</button><input type="number" value={current} placeholder={String(props.placeholder ?? "")} onChange={(event) => writeValue(event.currentTarget.value)} /><button type="button" aria-label="Increase value" onClick={() => stepValue(1)}>+</button></div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "spin-box") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const current = String(props.value ?? "");
    const numericValue = Number(current);
    const writeValue = (nextValue: string) => {
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    const stepValue = (delta: number) => {
      const nextValue = String(Number.isFinite(numericValue) ? numericValue + delta : delta);
      writeValue(nextValue);
    };
    return <label className="field spin-box"><span>{String(props.label ?? "Spin box")}</span><div className="spin-box-control"><input type="number" value={current} placeholder={String(props.placeholder ?? "")} onChange={(event) => writeValue(event.currentTarget.value)} /><span><button type="button" aria-label="Increase value" onClick={() => stepValue(1)}>⌃</button><button type="button" aria-label="Decrease value" onClick={() => stepValue(-1)}>⌄</button></span></div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "double-spin-box") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const current = String(props.value ?? "");
    const numericValue = Number(current);
    const writeValue = (nextValue: string) => {
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    const stepValue = (delta: number) => {
      const nextValue = String(Number.isFinite(numericValue) ? Number((numericValue + delta).toFixed(2)) : delta);
      writeValue(nextValue);
    };
    return <label className="field spin-box double-spin-box"><span>{String(props.label ?? "Double spin box")}</span><div className="spin-box-control"><input type="number" step="0.1" value={current} placeholder={String(props.placeholder ?? "")} onChange={(event) => writeValue(event.currentTarget.value)} /><span><button type="button" aria-label="Increase value" onClick={() => stepValue(0.1)}>+0.1</button><button type="button" aria-label="Decrease value" onClick={() => stepValue(-0.1)}>-0.1</button></span></div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "dial") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const value = percentValue(props.value, 42);
    const writeValue = (nextValue: string | number) => {
      onWriteProp(item, "value", String(nextValue));
      if (commandName) onRunCommand(item, "change", String(nextValue));
    };
    const nextValue = () => (value + 10) % 110;
    const angle = -135 + value * 2.7;
    return <label className="dial"><span>{String(props.label ?? "Dial")}</span><button type="button" className="dial-face" onClick={() => writeValue(nextValue())}><i style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} /><strong>{value}</strong></button><input type="range" min="0" max="100" value={value} onChange={(event) => writeValue(event.currentTarget.value)} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "textarea") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field"><span>{String(props.label ?? "Notes")}</span><textarea value={String(props.value ?? "")} placeholder={String(props.placeholder ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</label>;
  }
  if (item.type === "plain-text-edit") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="plain-text-edit"><span>{String(props.label ?? "Plain text")}</span><textarea value={String(props.value ?? "")} placeholder={String(props.placeholder ?? "")} spellCheck={false} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "rich-text-editor") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <section className="rich-text-editor"><header><button type="button" aria-label="Bold">B</button><button type="button" aria-label="Italic"><i>I</i></button><button type="button" aria-label="Bulleted list">•</button><small>{String(props.label ?? "Rich text")}</small></header><textarea value={String(props.value ?? "")} placeholder={String(props.placeholder ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</section>;
  }
  if (item.type === "code-editor") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const value = String(props.value ?? "");
    const lineCount = Math.max(1, value.split(/\n/).length);
    return <section className="code-editor"><header><span>{String(props.title ?? "Code editor")}</span><em>{String(props.label ?? "Code")}</em>{props.readOnly ? <b>RO</b> : null}</header><div><pre aria-hidden>{Array.from({ length: Math.min(24, lineCount) }, (_, index) => <span key={index}>{index + 1}</span>)}</pre><textarea value={value} placeholder={String(props.placeholder ?? "")} readOnly={Boolean(props.readOnly)} spellCheck={false} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} /></div><footer><small className={state?.error ? "feedback feedback-error" : "feedback"}>{state?.message ?? String(props.helper ?? "Ln 1, Col 1")}</small><small>{String(props.description ?? "UTF-8 · LF")}</small></footer></section>;
  }
  if (item.type === "search-bar") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="search-bar"><span>⌕</span><input value={String(props.value ?? "")} aria-label={String(props.label ?? "Search")} placeholder={String(props.placeholder ?? "Search")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</label>;
  }
  if (item.type === "search-view") {
    const clickCommandName = eventCommandName(props, "click");
    const changeCommandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")] ?? feedback[eventFeedbackKey(item.id, "click")];
    const options = optionTexts(props);
    const query = String(props.helper ?? "");
    const current = String(props.value ?? options[0] ?? "");
    const normalizedQuery = query.trim().toLowerCase();
    const rows = normalizedQuery ? options.filter((option) => option.toLowerCase().includes(normalizedQuery)) : options;
    return <section className="command-list search-view"><header><strong>{String(props.title ?? "Search view")}</strong><small>{String(props.description ?? "Search files, commands, or records")}</small></header><label><span>⌕</span><input value={query} aria-label={String(props.label ?? "Search")} placeholder={String(props.placeholder ?? "Search")} onChange={(event) => { onWriteProp(item, "helper", event.currentTarget.value); if (changeCommandName) onRunCommand(item, "change", event.currentTarget.value); }} /></label><div className="command-list-results">{rows.length > 0 ? rows.map((option, index) => <button key={option} type="button" className={option === current ? "command-list-row command-list-row-active" : "command-list-row"} onClick={() => { onWriteProp(item, "value", option); if (clickCommandName) onRunCommand(item, "click", option); }}><span>{index + 1}</span><strong>{option}</strong><small>{option === current ? "Selected" : "Open"}</small></button>) : <div className="command-list-empty">No matching results</div>}</div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</section>;
  }
  if (item.type === "search-suggestion-list") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="command-list search-view"><header><strong>{String(props.title ?? "Search suggestions")}</strong><small>{String(props.description ?? props.placeholder ?? "")}</small></header><div className="command-list-results">{options.slice(0, 6).map((option, index) => <button key={option} type="button" className={option === current ? "command-list-row command-list-row-active" : "command-list-row"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>⌕</span><strong>{option}</strong><small>{index === 0 ? String(props.helper ?? "Recent") : "Suggestion"}</small></button>)}</div></section>;
  }
  if (item.type === "filter-bar") {
    const commandName = eventCommandName(props, "click");
    const filters = optionTexts(props);
    const current = String(props.value ?? filters[0] ?? "");
    return <section className="command-list"><label><span>⌕</span><input value={String(props.placeholder ?? props.title ?? "")} aria-label={String(props.label ?? "Filter")} readOnly /></label><div className="chip-set">{filters.map((filter) => <button key={filter} type="button" className={filter === current ? "chip chip-active" : "chip"} onClick={() => { onWriteProp(item, "value", filter); if (commandName) onRunCommand(item, "click", filter); }}>{filter}</button>)}</div><small>{String(props.helper ?? props.description ?? "")}</small></section>;
  }
  if (item.type === "tag-input") {
    const commandName = eventCommandName(props, "change");
    const tags = String(props.value ?? "").split(/[,\u3001/]+/).map((tag) => tag.trim()).filter(Boolean);
    const visibleTags = tags.length > 0 ? tags : optionTexts(props).slice(0, 3);
    const writeTags = (nextTags: string[]) => {
      const nextValue = nextTags.join(",");
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    return <section className="tag-input"><label><span>{String(props.label ?? "Tags")}</span><input value="" placeholder={String(props.placeholder ?? "Add tag")} onChange={(event) => event.currentTarget.value ? writeTags([...visibleTags, event.currentTarget.value]) : undefined} /></label><div className="chip-set">{visibleTags.map((tag) => <button key={tag} type="button" className="chip chip-active" onClick={() => writeTags(visibleTags.filter((candidate) => candidate !== tag))}>{tag}<span aria-hidden> ×</span></button>)}</div>{props.helper ? <small>{String(props.helper)}</small> : null}</section>;
  }
  if (item.type === "checkbox") {
    const commandName = eventCommandName(props, "change");
    return <label className="check"><input type="checkbox" defaultChecked={Boolean(props.checked)} onChange={commandName ? (event) => onRunCommand(item, "change", event.currentTarget.checked) : undefined} />{String(props.label ?? "Checkbox")}</label>;
  }
  if (item.type === "checkbox-group") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const selected = new Set(String(props.value ?? options[0] ?? "").split(/[,\u3001/]+/).map((part) => part.trim()).filter(Boolean));
    const writeGroup = (option: string, checked: boolean) => {
      const next = new Set(selected);
      if (checked) {
        next.add(option);
      } else {
        next.delete(option);
      }
      const nextValue = Array.from(next).join(",");
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    return <fieldset className="card checkbox-group"><strong>{String(props.label ?? "Checkbox group")}</strong>{props.helper ? <small>{String(props.helper)}</small> : null}{options.map((option, index) => { const active = selected.has(option) || (selected.size === 0 && index === 0); return <label key={option} className="check"><input type="checkbox" checked={active} onChange={(event) => writeGroup(option, event.currentTarget.checked)} />{option}</label>; })}</fieldset>;
  }
  if (item.type === "radio") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <fieldset className="card"><strong>{String(props.label ?? "Radio group")}</strong>{options.map((option) => <label key={option} className="check"><input type="radio" name={item.id} checked={option === current} onChange={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "change", option); }} />{option}</label>)}</fieldset>;
  }
  if (item.type === "radio-group") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <fieldset className="card radio-group"><strong>{String(props.label ?? "Radio group")}</strong>{props.helper ? <small>{String(props.helper)}</small> : null}{options.map((option, index) => { const active = option === current || (!current && index === 0); return <label key={option} className="check"><input type="radio" name={item.id} checked={active} onChange={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "change", option); }} />{option}</label>; })}</fieldset>;
  }
  if (item.type === "switch") {
    const commandName = eventCommandName(props, "change");
    return <div className="panel-row"><div><strong>{String(props.title ?? "Switch")}</strong><p>{String(props.description ?? "")}</p></div><input type="checkbox" defaultChecked={Boolean(props.checked)} onChange={commandName ? (event) => onRunCommand(item, "change", event.currentTarget.checked) : undefined} /></div>;
  }
  if (item.type === "slider") {
    const commandName = eventCommandName(props, "change");
    const value = percentValue(props.value, 50);
    return <label className="field"><span>{String(props.label ?? "Slider")} · {value}</span><input type="range" min="0" max="100" value={value} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "range-slider") {
    const commandName = eventCommandName(props, "change");
    const [rawStart, rawEnd] = String(props.value ?? "24,78").split(",");
    const start = Math.min(percentValue(rawStart, 24), percentValue(rawEnd, 78));
    const end = Math.max(percentValue(rawStart, 24), percentValue(rawEnd, 78));
    const writeRange = (nextStart: string | number, nextEnd: string | number) => {
      const safeStart = Math.min(Number(nextStart), Number(nextEnd));
      const safeEnd = Math.max(Number(nextStart), Number(nextEnd));
      const nextValue = `${safeStart},${safeEnd}`;
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    return <label className="range-slider"><span>{String(props.label ?? "Range")} · {start} - {end}</span><div><input aria-label="Minimum value" type="range" min="0" max="100" value={start} onChange={(event) => writeRange(event.currentTarget.value, end)} /><input aria-label="Maximum value" type="range" min="0" max="100" value={end} onChange={(event) => writeRange(start, event.currentTarget.value)} /><i style={{ left: `${start}%`, width: `${Math.max(end - start, 1)}%` }} /></div>{props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "rating") {
    const commandName = eventCommandName(props, "change");
    const current = Math.max(0, Math.min(5, Number.parseInt(String(props.value ?? "4"), 10) || 0));
    const writeRating = (nextValue: number) => {
      onWriteProp(item, "value", String(nextValue));
      if (commandName) onRunCommand(item, "change", String(nextValue));
    };
    return <section className="card rating-control"><strong>{String(props.label ?? "Rating")} · {current}/5</strong><div className="rating-stars">{Array.from({ length: 5 }, (_, index) => { const value = index + 1; const active = value <= current; return <button key={value} type="button" aria-label={`${value} stars`} className={active ? "rating-star rating-star-active" : "rating-star"} onClick={() => writeRating(value)}>{active ? "★" : "☆"}</button>; })}</div>{props.helper ? <small>{String(props.helper)}</small> : null}</section>;
  }
  if (item.type === "scroll-bar") {
    const commandName = eventCommandName(props, "change");
    const value = percentValue(props.value, 45);
    const writeValue = (nextValue: string | number) => {
      onWriteProp(item, "value", String(nextValue));
      if (commandName) onRunCommand(item, "change", String(nextValue));
    };
    return <label className="scroll-bar"><span>{String(props.label ?? "Scroll bar")} · {value}</span><div><button type="button" aria-label="Scroll left" onClick={() => writeValue(Math.max(0, value - 5))}>◀</button><input type="range" min="0" max="100" value={value} onChange={(event) => writeValue(event.currentTarget.value)} /><button type="button" aria-label="Scroll right" onClick={() => writeValue(Math.min(100, value + 5))}>▶</button></div>{props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "color-picker") {
    const commandName = eventCommandName(props, "change");
    const swatches = optionTexts(props);
    const current = String(props.value ?? swatches[0] ?? '#6750a4');
    return <section className="color-picker"><header><span>{String(props.label ?? "Color")}</span><code>{current}</code></header><div className="color-picker-body"><input type="color" value={current} aria-label={String(props.label ?? "Color")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{swatches.map((swatch) => <button key={swatch} type="button" className={swatch === current ? "color-swatch color-swatch-active" : "color-swatch"} style={{ backgroundColor: swatch }} aria-label={`Use ${swatch}`} onClick={() => { onWriteProp(item, "value", swatch); if (commandName) onRunCommand(item, "change", swatch); }} />)}</div>{props.helper ? <small>{String(props.helper)}</small> : null}</section>;
  }
  if (item.type === "color-swatch-grid") {
    const commandName = eventCommandName(props, "change");
    const swatches = optionTexts(props);
    const current = String(props.value ?? swatches[0] ?? '#6750a4');
    return <section className="color-picker"><header><span>{String(props.title ?? "Color swatches")}</span><code>{current}</code></header><div className="color-picker-body">{swatches.map((swatch, index) => <button key={swatch} type="button" className={swatch === current ? "color-swatch color-swatch-active" : "color-swatch"} style={{ backgroundColor: swatch }} aria-label={`Use ${swatch}`} onClick={() => { onWriteProp(item, "value", swatch); if (commandName) onRunCommand(item, "change", swatch); }}><span>{index === 0 ? "P" : index === 1 ? "S" : "E"}</span></button>)}</div>{props.helper ? <small>{String(props.helper)}</small> : null}</section>;
  }
  if (item.type === "file-picker") {
    const commandName = eventCommandName(props, "change");
    const current = String(props.value ?? "");
    return <label className="file-picker"><span>{String(props.label ?? "File")}</span><div><input value={current} placeholder={String(props.placeholder ?? "Select file")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} /><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "change", current) : undefined}>Browse</button></div>{props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "folder-picker") {
    const commandName = eventCommandName(props, "change");
    const current = String(props.value ?? "");
    return <label className="file-picker folder-picker"><span>{String(props.label ?? "Folder")}</span><div><input value={current} placeholder={String(props.placeholder ?? "Select folder")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} /><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "change", current) : undefined}>Browse</button></div>{props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "shortcut-recorder") {
    const commandName = eventCommandName(props, "change");
    const current = String(props.value ?? "Ctrl+R");
    const keys = current.split("+").map((key) => key.trim()).filter(Boolean);
    return <button type="button" className="shortcut-recorder" onClick={commandName ? () => onRunCommand(item, "change", current) : undefined}><span>{String(props.label ?? "Shortcut")}</span><div>{keys.map((key) => <kbd key={key}>{key}</kbd>)}<small>{String(props.helper ?? "Record shortcut")}</small></div></button>;
  }
  if (item.type === "select") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field"><span>{String(props.label ?? "Select")}</span><select value={String(props.value ?? props.optionA ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }}><option>{String(props.optionA ?? "Option A")}</option><option>{String(props.optionB ?? "Option B")}</option><option>{String(props.optionC ?? "Option C")}</option></select>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</label>;
  }
  if (item.type === "multi-select") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const selected = new Set(String(props.value ?? options[0] ?? "").split(/[,\u3001/]+/).map((part) => part.trim()).filter(Boolean));
    const writeMultiSelect = (option: string, checked: boolean) => {
      const next = new Set(selected);
      if (checked) {
        next.add(option);
      } else {
        next.delete(option);
      }
      const nextValue = Array.from(next).join(",");
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    return <fieldset className="card multi-select"><strong>{String(props.label ?? "Multi select")}</strong>{props.helper ? <small>{String(props.helper)}</small> : null}{options.map((option, index) => { const active = selected.has(option) || (selected.size === 0 && index === 0); return <label key={option} className="check"><input type="checkbox" checked={active} onChange={(event) => writeMultiSelect(option, event.currentTarget.checked)} />{option}</label>; })}</fieldset>;
  }
  if (item.type === "combobox") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const options = optionTexts(props);
    return <label className="field combobox"><span>{String(props.label ?? "Combobox")}</span><input list={`${item.id}-options`} value={String(props.value ?? "")} placeholder={String(props.placeholder ?? "Search")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} /><datalist id={`${item.id}-options`}>{options.map((option) => <option key={option} value={option} />)}</datalist>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</label>;
  }
  if (item.type === "autocomplete") {
    const changeCommandName = eventCommandName(props, "change");
    const clickCommandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "change")] ?? feedback[eventFeedbackKey(item.id, "click")];
    const options = optionTexts(props);
    const current = String(props.value ?? "");
    const normalizedQuery = current.trim().toLowerCase();
    const filteredOptions = normalizedQuery ? options.filter((option) => option.toLowerCase().includes(normalizedQuery)) : options;
    const visibleOptions = (filteredOptions.length > 0 ? filteredOptions : options).slice(0, 5);
    return <section className="autocomplete-field"><label><span>{String(props.label ?? "自动补全")}</span><input value={current} placeholder={String(props.placeholder ?? "输入关键字")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (changeCommandName) onRunCommand(item, "change", event.currentTarget.value); }} /></label><div className="autocomplete-options">{visibleOptions.length > 0 ? visibleOptions.map((option, index) => { const active = option === current || index === 0; return <button key={option} type="button" className={active ? "autocomplete-option autocomplete-option-active" : "autocomplete-option"} onClick={() => { onWriteProp(item, "value", option); if (clickCommandName) onRunCommand(item, "click", option); }}><span>{option}</span>{active ? <span aria-hidden>✓</span> : null}</button>; }) : <div className="autocomplete-empty">没有匹配项</div>}</div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</section>;
  }
  if (item.type === "font-combo-box") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "Inter");
    return <label className="field font-combo-box"><span>{String(props.label ?? "Font")}</span><select value={current} style={{ fontFamily: current }} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }}>{options.map((option) => <option key={option} value={option} style={{ fontFamily: option }}>{option}</option>)}</select></label>;
  }
  if (item.type === "date-picker") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field date-picker"><span>{String(props.label ?? "Date")}</span><input type="date" value={String(props.value ?? "")} placeholder={String(props.placeholder ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "date-range-picker") {
    const changeCommandName = eventCommandName(props, "change");
    const clickCommandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "change")] ?? feedback[eventFeedbackKey(item.id, "click")];
    const parts = String(props.value ?? "2026-07-01,2026-07-14").split(/[,\u2192]+/).map((part) => part.trim()).filter(Boolean);
    const start = parts[0] ?? "";
    const end = parts[1] ?? "";
    const writeRange = (nextStart: string, nextEnd: string) => {
      const nextValue = `${nextStart},${nextEnd}`;
      onWriteProp(item, "value", nextValue);
      if (changeCommandName) onRunCommand(item, "change", nextValue);
    };
    return <section className="date-range-picker"><header><strong>{String(props.label ?? "Date range")}</strong><small>{String(props.helper ?? props.placeholder ?? "")}</small></header><div className="date-range-fields"><label><span>Start</span><input type="date" value={start} onChange={(event) => writeRange(event.currentTarget.value, end)} /></label><label><span>End</span><input type="date" value={end} onChange={(event) => writeRange(start, event.currentTarget.value)} /></label></div><div className="date-range-presets">{optionTexts(props).map((option) => <button key={option} type="button" onClick={() => { onWriteProp(item, "helper", option); if (clickCommandName) onRunCommand(item, "click", option); }}>{option}</button>)}</div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</section>;
  }
  if (item.type === "time-picker") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field time-picker"><span>{String(props.label ?? "Time")}</span><input type="time" value={String(props.value ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "date-time-picker") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field date-time-picker"><span>{String(props.label ?? "Date time")}</span><input type="datetime-local" value={String(props.value ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "calendar-widget") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const current = String(props.value ?? "2026-06-30");
    const selectedDay = Math.max(1, Math.min(31, Number(current.slice(-2)) || 30));
    const days = Array.from({ length: 35 }, (_, index) => ((index + 24) % 31) + 1);
    const writeValue = (day: number) => {
      const prefix = current.slice(0, 8) || "2026-06-";
      const nextValue = `${prefix}${String(day).padStart(2, "0")}`;
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    return <section className="calendar-widget"><header><strong>{String(props.label ?? "Calendar")}</strong><small>{current}</small></header><div className="calendar-weekdays">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="calendar-grid">{days.map((day, index) => <button key={`${day}-${index}`} type="button" className={day === selectedDay ? "calendar-day calendar-day-active" : "calendar-day"} onClick={() => writeValue(day)}>{day}</button>)}</div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</section>;
  }
  if (item.type === "calendar-scheduler") {
    const commandName = eventCommandName(props, "click");
    const events = optionTexts(props);
    const current = String(props.value ?? "Wed");
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    return <section className="card timeline"><strong>{String(props.title ?? "Schedule")}</strong><p>{String(props.description ?? props.helper ?? "")}</p>{days.map((day, index) => { const active = current === day || (!current && index === 2); const eventName = events[index % Math.max(1, events.length)] ?? String(props.label ?? "Event"); return <button key={day} type="button" className={active ? "timeline-row timeline-row-active" : "timeline-row"} onClick={() => { onWriteProp(item, "value", day); if (commandName) onRunCommand(item, "click", day); }}><span className="timeline-rail"><i /><b /></span><strong>{day}</strong><small>{eventName}</small><em>{index + 9}:30</em></button>; })}</section>;
  }
  if (item.type === "segmented") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <div className="segmented">{options.map((option) => <button key={option} type="button" className={option === current ? "segment segment-active" : "segment"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "change", option); }}>{option}</button>)}</div>;
  }
  if (item.type === "chips") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <div className="chip-set">{options.map((option) => <button key={option} type="button" className={option === current ? "chip chip-active" : "chip"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button>)}</div>;
  }
  if (item.type === "assist-chip" || item.type === "filter-chip" || item.type === "input-chip" || item.type === "suggestion-chip") {
    const commandName = eventCommandName(props, item.type === "filter-chip" ? "change" : "click");
    const active = item.type === "filter-chip" ? Boolean(props.checked) : props.variant === "secondary";
    const icon = item.type === "assist-chip" ? "✦" : item.type === "filter-chip" ? "✓" : item.type === "input-chip" ? "×" : "★";
    const runChip = () => {
      if (item.type === "filter-chip") {
        const nextChecked = !active;
        onWriteProp(item, "checked", String(nextChecked));
        if (commandName) onRunCommand(item, "change", nextChecked);
        return;
      }
      if (commandName) onRunCommand(item, "click", props.value ?? props.label ?? "chip");
    };
    return <button type="button" className={active ? "chip chip-active md3-chip" : "chip md3-chip"} aria-pressed={item.type === "filter-chip" ? active : undefined} onClick={runChip}><span>{icon}</span>{String(props.label ?? props.value ?? "Chip")}{item.type === "input-chip" ? <em aria-hidden>×</em> : null}</button>;
  }
  if (item.type === "tabs") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="card"><div className="tab-row">{options.map((option) => <button key={option} type="button" className={option === current ? "button" : "button button-muted"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button>)}</div><p>{String(props.title ?? "Tabs")}</p></section>;
  }
  if (item.type === "menu-bar") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <nav className="menu-bar">{options.map((option) => <button key={option} type="button" className={option === current ? "menu-bar-item menu-bar-item-active" : "menu-bar-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button>)}<span>{String(props.description ?? props.title ?? "")}</span></nav>;
  }
  if (item.type === "ribbon-bar") {
    const commandName = eventCommandName(props, "click");
    const groups = optionTexts(props);
    const current = String(props.value ?? groups[0] ?? "");
    return <section className="card"><div className="tab-row">{groups.map((group) => <button key={group} type="button" className={group === current ? "button" : "button button-muted"} onClick={() => { onWriteProp(item, "value", group); if (commandName) onRunCommand(item, "click", group); }}>{group}</button>)}</div><p>{String(props.description ?? "Grouped desktop commands")}</p><div className="toolbar-actions">{groups.map((group, index) => <button key={`${group}-tool`} type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", group) : undefined}>{index === 1 ? String(props.label ?? group) : group}</button>)}</div></section>;
  }
  if (item.type === "menu") {
    const commandName = eventCommandName(props, "click");
    return <section className="card menu-card"><strong>{String(props.title ?? "Menu")}</strong><p>{String(props.description ?? "")}</p>{optionTexts(props).map((option) => <button key={option} type="button" className="menu-item" onClick={commandName ? () => onRunCommand(item, "click", option) : undefined}>{option}<span>⌘</span></button>)}</section>;
  }
  if (item.type === "context-menu") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="card menu-card"><strong>{String(props.title ?? "Context Menu")}</strong><p>{String(props.description ?? "")}</p>{options.map((option, index) => <button key={option} type="button" className={option === current ? "menu-item menu-item-active" : "menu-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}<span>{option === current ? "✓" : index === 0 ? "Enter" : ""}</span></button>)}</section>;
  }
  if (item.type === "list") {
    const commandName = eventCommandName(props, "click");
    return <section className="card"><strong>{String(props.title ?? "List")}</strong><p>{String(props.description ?? "")}</p>{optionTexts(props).map((option) => <button key={option} type="button" className="list-row" onClick={commandName ? () => onRunCommand(item, "click", option) : undefined}>{option}</button>)}</section>;
  }
  if (item.type === "list-item") {
    const commandName = eventCommandName(props, "click");
    return <button type="button" className="list-view-row list-view-row-active" onClick={commandName ? () => onRunCommand(item, "click", props.value ?? props.title ?? "list-item") : undefined}><span>{String(props.label ?? props.title ?? "I").slice(0, 1)}</span><strong>{String(props.title ?? props.label ?? "List item")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></button>;
  }
  if (item.type === "list-view") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="list-view"><header><span><strong>{String(props.title ?? "List view")}</strong><small>{String(props.description ?? "")}</small></span><em>Model</em></header><div className="list-view-body">{rows.slice(0, 8).map((row, index) => { const active = row === current || (!current && index === 0); return <button key={row} type="button" className={active ? "list-view-row list-view-row-active" : "list-view-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{index + 1}</span><strong>{row}</strong><small>{index === 2 ? "Rust module" : "UI resource"} · synced</small></button>; })}</div></section>;
  }
  if (item.type === "column-view") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[1] ?? rows[0] ?? "");
    const columns = [
      { title: "Project", rows: ["ui", "src", "assets"] },
      { title: "Resources", rows: rows.length > 0 ? rows : ["MainWindow.ui", "Settings.ui", "logic.rs"] },
      { title: "Details", rows: [current || "Settings.ui", "synced", "editable"] },
    ];
    return <section className="column-view"><header><span><strong>{String(props.title ?? "Column view")}</strong><small>{String(props.description ?? "")}</small></span><em>Path</em></header><div className="column-view-body">{columns.map((column, columnIndex) => <div key={column.title} className="column-view-column"><strong>{column.title}</strong>{column.rows.slice(0, 5).map((row, rowIndex) => { const active = row === current || (columnIndex === 0 && rowIndex === 0) || (columnIndex === 2 && rowIndex === 0); return <button key={`${column.title}-${row}`} type="button" className={active ? "column-view-row column-view-row-active" : "column-view-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span>{columnIndex < 2 ? <em>›</em> : null}</button>; })}</div>)}</div></section>;
  }
  if (item.type === "icon-view") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[1] ?? rows[0] ?? "");
    return <section className="icon-view"><header><span><strong>{String(props.title ?? "Icon view")}</strong><small>{String(props.description ?? "")}</small></span><em>Icon</em></header><div className="icon-view-body">{rows.slice(0, 8).map((row, index) => { const active = row === current || (!current && index === 0); const isCode = row.toLowerCase().endsWith(".rs") || row.toLowerCase().includes("logic"); return <button key={row} type="button" className={active ? "icon-view-item icon-view-item-active" : "icon-view-item"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{isCode ? "{}" : "▣"}</span><strong>{row}</strong><small>{isCode ? "Rust" : "UI file"}</small></button>; })}</div></section>;
  }
  if (item.type === "command-list") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const query = String(props.helper ?? "");
    const current = String(props.value ?? options[0] ?? "");
    const normalizedQuery = query.trim().toLowerCase();
    const rows = normalizedQuery ? options.filter((option) => option.toLowerCase().includes(normalizedQuery)) : options;
    const visibleRows = rows.length > 0 ? rows : [];
    return <section className="command-list"><header><strong>{String(props.title ?? "Commands")}</strong><small>{String(props.description ?? "")}</small></header><label><span>⌕</span><input value={query} placeholder={String(props.placeholder ?? "Search commands")} onChange={(event) => onWriteProp(item, "helper", event.currentTarget.value)} /></label><div className="command-list-results">{visibleRows.length > 0 ? visibleRows.map((option, index) => <button key={option} type="button" className={option === current ? "command-list-row command-list-row-active" : "command-list-row"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>{index + 1}</span><strong>{option}</strong><small>{index === 0 ? "Enter" : ""}</small></button>) : <div className="command-list-empty">No results</div>}</div></section>;
  }
  if (item.type === "command-palette") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const query = String(props.helper ?? "");
    const current = String(props.value ?? options[0] ?? "");
    const normalizedQuery = query.trim().toLowerCase();
    const rows = normalizedQuery ? options.filter((option) => option.toLowerCase().includes(normalizedQuery)) : options;
    const visibleRows = rows.length > 0 ? rows : options.slice(0, 1);
    return <section className="command-list"><header><strong>{String(props.title ?? "Command palette")}</strong><small>{String(props.description ?? "Search commands and files")}</small></header><label><span>⌘</span><input value={query} placeholder={String(props.placeholder ?? "Type a command")} onChange={(event) => onWriteProp(item, "helper", event.currentTarget.value)} /></label><div className="command-list-results">{visibleRows.map((option, index) => <button key={option} type="button" className={option === current ? "command-list-row command-list-row-active" : "command-list-row"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>{index === 0 ? "↵" : index + 1}</span><strong>{option}</strong><small>{index === 0 ? "Run" : "Open"}</small></button>)}</div></section>;
  }
  if (item.type === "notification-center") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="card"><strong>{String(props.title ?? "Notifications")}</strong><p>{String(props.description ?? "")}</p><div>{options.map((option, index) => <button key={option} type="button" className={option === current ? "list-row list-row-active" : "list-row"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>{index === 1 ? "!" : "•"}</span><strong>{option}</strong><small>{index === 0 ? "Now" : `${index * 4}m`}</small></button>)}</div></section>;
  }
  if (item.type === "system-tray") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="system-tray"><header><span className="system-tray-mark">◈<i /></span><div><strong>{String(props.title ?? "System tray")}</strong><small>{String(props.label ?? "Background")}</small></div><em>Tray</em></header><p>{String(props.description ?? "")}</p><div className="system-tray-menu">{options.map((option, index) => { const active = option === current || (!current && index === 0); return <button key={option} type="button" className={active ? "system-tray-row system-tray-row-active" : "system-tray-row"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span className={index === 2 ? "system-tray-dot system-tray-dot-danger" : index === 1 ? "system-tray-dot system-tray-dot-warn" : "system-tray-dot"} /><strong>{option}</strong><small>{index === 2 ? "Quit" : "Run"}</small></button>; })}</div></section>;
  }
  if (item.type === "activity-bar") {
    const commandName = eventCommandName(props, "click");
    const activities = optionTexts(props);
    const current = String(props.value ?? activities[0] ?? "");
    return <section className="key-value-list"><header><strong>{String(props.title ?? "Activity bar")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></header>{activities.map((activity, index) => <button key={activity} type="button" className={activity === current ? "key-value-row key-value-row-active" : "key-value-row"} onClick={() => { onWriteProp(item, "value", activity); if (commandName) onRunCommand(item, "click", activity); }}><span>{activity}</span><strong>{index === 0 ? "Project" : index === 1 ? "Design" : "Build"}</strong></button>)}</section>;
  }
  if (item.type === "shortcut-table") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const keys = ["Ctrl K", "Ctrl S", "Ctrl Shift B"];
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="property-grid"><header><strong>{String(props.title ?? "Shortcuts")}</strong><small>{String(props.description ?? "")}</small></header>{rows.map((row, index) => <button key={row} type="button" className={row === current ? "property-row property-row-active" : "property-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span><strong>{keys[index] ?? "F5"}</strong></button>)}</section>;
  }
  if (item.type === "resource-browser") {
    const commandName = eventCommandName(props, "click");
    const resources = optionTexts(props);
    const current = String(props.value ?? resources[0] ?? "");
    return <section className="card data-grid"><strong>{String(props.title ?? "Resources")}</strong><p>{String(props.description ?? "")}</p><div>{resources.map((resource, index) => <button key={resource} type="button" className={resource === current ? "data-grid-cell data-grid-cell-active" : "data-grid-cell"} onClick={() => { onWriteProp(item, "value", resource); if (commandName) onRunCommand(item, "click", resource); }}><span>{index === 2 ? "Aa" : "▧"}</span><strong>{resource}</strong><small>{index === 2 ? "Font" : "Asset"}</small></button>)}</div></section>;
  }
  if (item.type === "asset-grid") {
    const commandName = eventCommandName(props, "click");
    const assets = optionTexts(props);
    const current = String(props.value ?? assets[0] ?? "");
    return <section className="card data-grid"><strong>{String(props.title ?? "Asset grid")}</strong><p>{String(props.description ?? "")}</p><div>{assets.map((asset, index) => <button key={asset} type="button" className={asset === current ? "data-grid-cell data-grid-cell-active" : "data-grid-cell"} onClick={() => { onWriteProp(item, "value", asset); if (commandName) onRunCommand(item, "click", asset); }}><span>{index === 2 ? "{}" : "▧"}</span><strong>{asset}</strong><small>{index === 1 ? "Icon" : index === 2 ? "Token" : "Image"}</small></button>)}</div></section>;
  }
  if (item.type === "task-list") {
    const commandName = eventCommandName(props, "click");
    const tasks = optionTexts(props);
    const current = String(props.value ?? tasks[0] ?? "");
    return <section className="card timeline"><strong>{String(props.title ?? "Tasks")}</strong><p>{String(props.description ?? "")}</p>{tasks.map((task, index) => <button key={task} type="button" className={task === current ? "timeline-row timeline-row-active" : "timeline-row"} onClick={() => { onWriteProp(item, "value", task); if (commandName) onRunCommand(item, "click", task); }}><span>{index === 0 ? "✓" : index === 1 ? "…" : "○"}</span><strong>{task}</strong><small>{index === 0 ? "Done" : index === 1 ? "Running" : "Queued"}</small></button>)}</section>;
  }
  if (item.type === "settings-list") {
    const commandName = eventCommandName(props, "click");
    const settings = optionTexts(props);
    const current = String(props.value ?? settings[0] ?? "");
    return <section className="key-value-list"><header><strong>{String(props.title ?? "Settings")}</strong><small>{String(props.description ?? "")}</small></header>{settings.map((setting, index) => <button key={setting} type="button" className={setting === current ? "key-value-row key-value-row-active" : "key-value-row"} onClick={() => { onWriteProp(item, "value", setting); if (commandName) onRunCommand(item, "click", setting); }}><span>{setting}</span><strong>{setting === current ? "On" : index === 1 ? "Cozy" : "Off"}</strong></button>)}</section>;
  }
  if (item.type === "tree-view") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="card tree-view"><strong>{String(props.title ?? "Project tree")}</strong><p>{String(props.description ?? "")}</p><div className="tree-root">▾ src</div>{options.map((option) => <button key={option} type="button" className={option === current ? "tree-row tree-row-active" : "tree-row"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>↳ {option}</button>)}</section>;
  }
  if (item.type === "tree-table") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Tree table")}</strong><small>{String(props.description ?? "")}</small></header><div className="tree-table-head"><span>Name</span><span>Status</span><span>Target</span></div><div className="tree-table-body">{rows.map((row, index) => <button key={row} type="button" className={row === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{index === 0 ? "▾" : "↳"} <b>{row}</b></span><small>{index === 1 ? "Modified" : "Ready"}</small><em>{index === 2 ? "Asset" : "App"}</em></button>)}</div></section>;
  }
  if (item.type === "outline-view") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[rows.length - 1] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Outline")}</strong><small>{String(props.description ?? "")}</small></header><div className="tree-table-head"><span>Symbol</span><span>Kind</span><span>Line</span></div><div className="tree-table-body">{rows.map((row, index) => <button key={row} type="button" className={row === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{index === 0 ? "▾" : "↳"} <b>{row}</b></span><small>{index === 0 ? "Window" : index === 1 ? "Panel" : "Function"}</small><em>{index * 18 + 12}</em></button>)}</div></section>;
  }
  if (item.type === "signal-slot-editor") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Signals / Slots")}</strong><small>{String(props.description ?? "")}</small></header><div className="tree-table-head"><span>Signal</span><span>Slot</span><span>Status</span></div><div className="tree-table-body">{rows.map((row, index) => { const signal = row.includes(".") ? row : `${row}.${index === 1 ? "change" : "click"}`; const slot = `on_${signal.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase()}`; return <button key={row} type="button" className={row === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span><b>{signal}</b></span><small>{slot}</small><em>{index === 1 ? "Test" : "Ready"}</em></button>; })}</div></section>;
  }
  if (item.type === "node-graph") {
    const commandName = eventCommandName(props, "click");
    const nodes = optionTexts(props);
    const current = String(props.value ?? nodes[1] ?? nodes[0] ?? "");
    return <section className="data-grid"><header><span><strong>{String(props.title ?? "Node graph")}</strong><small>{String(props.description ?? "")}</small></span><button type="button">{nodes.length} nodes</button></header><div className="data-grid-head"><span /><span>Node</span><span>Role</span><span>Links</span></div>{nodes.map((node, index) => <button key={node} type="button" className={node === current ? "data-grid-row data-grid-row-active" : "data-grid-row"} onClick={() => { onWriteProp(item, "value", node); if (commandName) onRunCommand(item, "click", node); }}><span className={index === 1 ? "dot" : "dot dot-muted"} /><span>{node}</span><span>{index === 0 ? "Signal" : index === 1 ? "Command" : "Output"}</span><span>{index === 1 ? "2" : "1"}</span></button>)}</section>;
  }
  if (item.type === "log-viewer") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[rows.length - 1] ?? "");
    return <section className="console-panel"><header><span>▸</span><strong>{String(props.title ?? "Log viewer")}</strong><small>{String(props.description ?? "")}</small></header><div>{rows.map((row, index) => <button key={row} type="button" className={row === current ? "console-row console-row-active" : "console-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{index === 1 ? "WARN" : index === 2 ? "DONE" : "INFO"}</span><code>{row}</code></button>)}</div></section>;
  }
  if (item.type === "problems-panel") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Problems")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></header><div className="tree-table-head"><span>Severity</span><span>Location</span><span>Line</span></div><div className="tree-table-body">{rows.map((row, index) => <button key={row} type="button" className={row === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span><b>{index === 0 ? "ERROR" : index === 1 ? "WARN" : "HINT"}</b></span><small>{row}</small><em>{index * 31 + 18}</em></button>)}</div></section>;
  }
  if (item.type === "breakpoints-panel") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Breakpoints")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></header><div className="tree-table-head"><span>State</span><span>Location</span><span>Hit</span></div><div className="tree-table-body">{rows.map((row, index) => <button key={row} type="button" className={row === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span><b>{index === 1 ? "○" : "●"}</b></span><small>{row}</small><em>{index === 1 ? "Off" : "On"}</em></button>)}</div></section>;
  }
  if (item.type === "watch-panel") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="property-grid"><header><span><strong>{String(props.title ?? "Watch")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></span><em>Live</em></header><div className="property-grid-head"><span>Expression</span><span>Value</span><span>Type</span></div>{rows.map((row, index) => { const value = index === 0 ? String(props.label ?? "button_1") : index === 1 ? "true" : "{ patch: 1 }"; return <button key={row} type="button" className={row === current ? "property-grid-row property-grid-row-active" : "property-grid-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span><span>{value}</span><span>{index === 2 ? "json" : "value"}</span></button>; })}</section>;
  }
  if (item.type === "call-stack") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Call stack")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></header><div className="tree-table-head"><span>Frame</span><span>Function</span><span>Line</span></div><div className="tree-table-body">{rows.map((row, index) => <button key={row} type="button" className={row === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span><b>#{index}</b></span><small>{row}</small><em>{index * 24 + 12}</em></button>)}</div></section>;
  }
  if (item.type === "property-browser") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="property-grid"><header><span><strong>{String(props.title ?? "Property browser")}</strong><small>{String(props.description ?? "")}</small></span><em>Browser</em></header><div className="property-grid-head"><span>Property</span><span>Value</span><span>Group</span></div>{rows.map((row, index) => { const sampleValue = index === 0 ? `${item.width}px` : index === 1 ? String(props.variant ?? "secondary") : String(props.actionCommandId ?? "Unbound"); const group = index === 0 ? "Layout" : index === 1 ? "Style" : "Events"; return <button key={row} type="button" className={row === current ? "property-grid-row property-grid-row-active" : "property-grid-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span><span>{sampleValue}</span><span>{group}</span></button>; })}</section>;
  }
  if (item.type === "layer-panel") {
    const commandName = eventCommandName(props, "click");
    const layers = optionTexts(props);
    const current = String(props.value ?? layers[layers.length - 1] ?? layers[0] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Layers")}</strong><small>{String(props.description ?? "")}</small></header><div className="tree-table-head"><span>Layer</span><span>State</span><span>Order</span></div><div className="tree-table-body">{layers.map((layer, index) => <button key={layer} type="button" className={layer === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", layer); if (commandName) onRunCommand(item, "click", layer); }}><span>{index === 0 ? "▾" : "↳"} <b>{layer}</b></span><small>{index === 1 ? "Locked" : "Visible"}</small><em>{index + 1}</em></button>)}</div></section>;
  }
  if (item.type === "breadcrumb-bar") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? props.label ?? options[options.length - 1] ?? "");
    return <nav className="breadcrumb-bar">{options.map((option, index) => <span key={`${option}-${index}`}><span>{index > 0 ? "/" : ""}</span><button type="button" className={option === current ? "breadcrumb-item breadcrumb-item-active" : "breadcrumb-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button></span>)}</nav>;
  }
  if (item.type === "pagination") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? props.label ?? options[1] ?? "1");
    return <nav className="breadcrumb-bar"><span>{String(props.helper ?? props.description ?? "")}</span>{options.map((option, index) => <button key={`${option}-${index}`} type="button" className={current.includes(option) || option === props.label ? "breadcrumb-item breadcrumb-item-active" : "breadcrumb-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button>)}</nav>;
  }
  if (item.type === "toolbar") {
    const commandName = eventCommandName(props, "click");
    return <header className="panel-row"><strong>{String(props.title ?? "Toolbar")}</strong><div className="toolbar-actions">{optionTexts(props).map((option) => <button key={option} type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", option) : undefined}>{option}</button>)}</div></header>;
  }
  if (item.type === "floating-toolbar") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="floating-toolbar"><span>●</span><strong>{String(props.title ?? props.label ?? "Toolbar")}</strong>{options.slice(0, 3).map((option, index) => <button key={option} type="button" className={option === current || (!current && index === 0) ? "floating-toolbar-action floating-toolbar-action-active" : "floating-toolbar-action"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button>)}</section>;
  }
  if (item.type === "status-bar") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    return <footer className="status-bar"><button type="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? options[0] ?? "ready") : undefined}>{String(props.label ?? options[0] ?? "Ready")}</button><span>{String(props.description ?? props.title ?? "")}</span>{options.slice(1).map((option) => <small key={option}>{option}</small>)}</footer>;
  }
  if (item.type === "split-view") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const split = percentValue(props.value, 62);
    return <section className="split-view" style={{ gridTemplateColumns: `${split}% 8px 1fr` }}><button type="button" className="split-pane" onClick={commandName ? () => onRunCommand(item, "click", options[0] ?? "left") : undefined}><strong>{options[0] ?? "Project"}</strong><span /><span /><i /></button><span className="split-handle" /><button type="button" className="split-pane split-pane-main" onClick={commandName ? () => onRunCommand(item, "click", options[1] ?? "main") : undefined}><strong>{options[1] ?? String(props.title ?? "Canvas")}</strong><i /><small>{options[2] ?? String(props.description ?? "")}</small></button></section>;
  }
  if (item.type === "splitter") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const split = percentValue(props.value, 58);
    const writeSplit = (value: string) => {
      onWriteProp(item, "value", value);
      if (commandName) onRunCommand(item, "change", value);
    };
    return <section className="splitter"><header><span><strong>{String(props.title ?? "Splitter")}</strong><small>{String(props.description ?? "")}</small></span><em>{split}%</em></header><div className="splitter-body" style={{ gridTemplateColumns: `${split}% 12px 1fr` }}><div className="splitter-pane"><strong>{options[0] ?? "Left pane"}</strong><span /><span /></div><label className="splitter-handle" aria-label="Splitter position"><input type="range" min="20" max="80" value={split} onChange={(event) => writeSplit(event.currentTarget.value)} /><i /></label><div className="splitter-pane splitter-pane-main"><strong>{options[1] ?? "Right pane"}</strong><span /><small>{options[2] ?? "Context"}</small></div></div></section>;
  }
  if (item.type === "size-grip") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const current = String(props.value ?? "1280 x 720");
    const nextSize = current === "1280 x 720" ? "1366 x 768" : "1280 x 720";
    const writeSize = (value: string) => {
      onWriteProp(item, "value", value);
      if (commandName) onRunCommand(item, "change", value);
    };
    return <button type="button" className="size-grip" aria-label={String(props.title ?? "Size grip")} onClick={() => writeSize(nextSize)}><span><strong>{String(props.title ?? "Size grip")}</strong><small>{String(props.description ?? "Drag corner to resize")}</small><em>{state?.loading ? "Running..." : current}</em></span><i aria-hidden /><b aria-hidden /><b aria-hidden /></button>;
  }
  if (item.type === "supporting-pane") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="supporting-pane"><main><header><small>Supporting pane</small><strong>{String(props.title ?? "Overview")}</strong><p>{String(props.description ?? "")}</p></header><div><span /><span /><i /><b /></div></main><aside><header><strong>Context</strong><em>{options.length}</em></header>{options.map((option, index) => { const active = option === current || (!current && index === 0); return <button key={option} type="button" className={active ? "supporting-pane-item supporting-pane-item-active" : "supporting-pane-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><strong>{option}</strong><small>{index === 0 ? "Issues and state" : index === 1 ? "Context details" : "Next actions"}</small></button>; })}</aside><footer>Collapsed helper · {String(current || (options[0] ?? "Context"))}</footer></section>;
  }
  if (item.type === "scroll-area") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    const rows = [...options, "assets/icons/settings.svg", "assets/fonts/inter.woff2", "logs/build-output.txt"];
    return <section className="scroll-area"><header><span>↕</span><div><strong>{String(props.title ?? "Scroll area")}</strong><small>{String(props.description ?? "")}</small></div><i /></header><div className="scroll-area-body">{rows.map((row, index) => <button key={`${row}-${index}`} type="button" className={row === current ? "scroll-area-row scroll-area-row-active" : "scroll-area-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><strong>{row}</strong><small>{index < options.length ? "Bound" : "More"}</small></button>)}</div></section>;
  }
  if (item.type === "stacked-pages") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="stacked-pages"><header><span>▣</span><div><strong>{String(props.title ?? "Stacked pages")}</strong><small>{String(props.description ?? "")}</small></div></header><nav>{options.map((option) => <button key={option} type="button" className={option === current ? "stacked-page-tab stacked-page-tab-active" : "stacked-page-tab"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button>)}</nav><div className="stacked-page-body"><strong>{current || "Page"}</strong><span /><span /><i /></div></section>;
  }
  if (item.type === "tool-box") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="tool-box"><header><strong>{String(props.title ?? "Tool box")}</strong><small>{String(props.description ?? "")}</small></header>{options.map((option, index) => { const active = option === current || (!current && index === 0); return <button key={option} type="button" className={active ? "tool-box-item tool-box-item-active" : "tool-box-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>{active ? "⌃" : "⌄"}</span><strong>{option}</strong>{active ? <small>{index === 0 ? "Inputs, buttons and editors." : index === 1 ? "Layouts, containers and spacers." : "Data display and feedback widgets."}</small> : null}</button>; })}</section>;
  }
  if (item.type === "dock-panel") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="dock-panel"><header><span><strong>{String(props.title ?? "Dock")}</strong><small>{String(props.description ?? "")}</small></span><button type="button" aria-label="Pin">□</button><button type="button" aria-label="Close">×</button></header><div className="dock-tabs">{options.map((option) => <button key={option} type="button" className={option === current ? "dock-tab dock-tab-active" : "dock-tab"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button>)}</div><div className="dock-panel-body"><strong>{current || String(props.title ?? "Panel")}</strong><span /><span /><i /></div></section>;
  }
  if (item.type === "mdi-area") {
    const commandName = eventCommandName(props, "click");
    const windows = optionTexts(props);
    const current = String(props.value ?? windows[0] ?? "");
    const layouts = ["mdi-window-a", "mdi-window-b", "mdi-window-c"];
    return <section className="mdi-area"><header><span><strong>{String(props.title ?? "MDI area")}</strong><small>{String(props.description ?? "")}</small></span><em>MDI</em></header><div className="mdi-stage">{windows.slice(0, 3).map((windowTitle, index) => { const active = windowTitle === current || (!current && index === 0); return <button key={`${windowTitle}-${index}`} type="button" className={`${layouts[index] ?? layouts[0]} ${active ? "mdi-window mdi-window-active" : "mdi-window"}`} onClick={() => { onWriteProp(item, "value", windowTitle); if (commandName) onRunCommand(item, "click", windowTitle); }}><span className="mdi-window-title"><i /><i /><i /><strong>{windowTitle}</strong></span><span className="mdi-window-body"><b /><b /><small /></span></button>; })}</div></section>;
  }
  if (item.type === "top-app-bar") {
    const commandName = eventCommandName(props, "click");
    return <header className="top-app-bar"><button type="button" className="icon-button" aria-label="Menu">☰</button><span><strong>{String(props.title ?? "App")}</strong><small>{String(props.description ?? "")}</small></span><div>{optionTexts(props).map((option) => <button key={option} type="button" className="icon-button" aria-label={option} onClick={commandName ? () => onRunCommand(item, "click", option) : undefined}>{option.slice(0, 1)}</button>)}</div></header>;
  }
  if (item.type === "bottom-app-bar") {
    const commandName = eventCommandName(props, "click");
    return <footer className="bottom-app-bar"><span><strong>{String(props.title ?? "Actions")}</strong><small>{String(props.description ?? "")}</small></span><div>{optionTexts(props).map((option, index) => <button key={option} type="button" className={index === 2 ? "button" : "button button-muted"} onClick={commandName ? () => onRunCommand(item, "click", option) : undefined}>{option}</button>)}</div><button type="button" className="fab-mini" aria-label={String(props.label ?? "Create")} onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "create") : undefined}>＋</button></footer>;
  }
  if (item.type === "navigation-bar") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <nav className="navigation-bar">{options.map((option) => <button key={option} type="button" className={option === current ? "nav-bar-item nav-bar-item-active" : "nav-bar-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>□</span>{option}</button>)}</nav>;
  }
  if (item.type === "navigation-suite") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="navigation-suite"><aside><strong>NS</strong>{options.map((option) => <button key={option} type="button" className={option === current ? "navigation-suite-rail-item navigation-suite-item-active" : "navigation-suite-rail-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>□</span><small>{option}</small></button>)}</aside><main><header><small>Navigation Suite</small><strong>{String(props.title ?? "Application")}</strong><p>{String(props.description ?? "")}</p></header><div><span /><span /><i /></div><footer>{String(current || (options[0] ?? "Page"))}</footer></main><nav>{options.map((option) => <button key={option} type="button" className={option === current ? "navigation-suite-bar-item navigation-suite-item-active" : "navigation-suite-bar-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>□</span>{option}</button>)}</nav></section>;
  }
  if (item.type === "navigation") {
    const commandName = eventCommandName(props, "click");
    return <nav className="card"><strong>{String(props.title ?? "Navigation")}</strong>{optionTexts(props).map((option) => <button key={option} type="button" className="list-row" onClick={commandName ? () => onRunCommand(item, "click", option) : undefined}>{option}</button>)}</nav>;
  }
  if (item.type === "navigation-drawer") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <nav className="navigation-drawer"><header><strong>{String(props.title ?? "Drawer")}</strong><small>{String(props.description ?? "")}</small></header>{options.map((option) => <button key={option} type="button" className={option === current ? "drawer-item drawer-item-active" : "drawer-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>□ {option}</button>)}</nav>;
  }
  if (item.type === "navigation-item") {
    const commandName = eventCommandName(props, "click");
    const active = Boolean(props.checked);
    return <button type="button" className={active ? "drawer-item drawer-item-active" : "drawer-item"} aria-pressed={active} onClick={commandName ? () => onRunCommand(item, "click", props.title ?? props.label ?? "navigation-item") : undefined}>□ <strong>{String(props.title ?? props.label ?? "Navigation item")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></button>;
  }
  if (item.type === "side-sheet") {
    const commandName = eventCommandName(props, "click");
    return <aside className="side-sheet"><strong>{String(props.title ?? "Sheet")}</strong><p>{String(props.description ?? "")}</p>{optionTexts(props).map((option) => <div key={option} className="sheet-section">{option}<small>Editable section</small></div>)}<button type="button" className="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "apply") : undefined}>{String(props.label ?? "Apply")}</button></aside>;
  }
  if (item.type === "bottom-sheet") {
    const commandName = eventCommandName(props, "click");
    return <aside className="bottom-sheet"><span className="sheet-handle" /><strong>{String(props.title ?? "Bottom sheet")}</strong><p>{String(props.description ?? "")}</p><div className="bottom-sheet-options">{optionTexts(props).map((option) => <button key={option} type="button" className="sheet-section" onClick={commandName ? () => onRunCommand(item, "click", option) : undefined}>{option}<small>Target</small></button>)}</div><button type="button" className="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "apply") : undefined}>{String(props.label ?? "Apply")}</button></aside>;
  }
  if (item.type === "sheet-drag-handle") {
    return <section className="bottom-sheet"><span className="sheet-handle" /><strong>{String(props.title ?? "Drag handle")}</strong><p>{String(props.description ?? props.value ?? "")}</p></section>;
  }
  if (item.type === "accordion") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="accordion"><header><strong>{String(props.title ?? "Accordion")}</strong><small>{String(props.description ?? "")}</small></header>{options.map((option, index) => { const active = option === current || (!current && index === 0); return <button key={option} type="button" className={active ? "accordion-item accordion-item-active" : "accordion-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span><b>{option}</b><i>{active ? "Expanded" : "Collapsed"}</i></span><em>{active ? "⌃" : "⌄"}</em>{active ? <small>{index === 0 ? "Layout constraints, spacing and responsive rules." : index === 1 ? "Data source, defaults and validation state." : "Signals, slots and runtime feedback."}</small> : null}</button>; })}</section>;
  }
  if (item.type === "navigation-rail") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <nav className="navigation-rail"><strong>{String(props.title ?? "Rail")}</strong>{options.map((option) => <button key={option} type="button" className={option === current ? "rail-item rail-item-active" : "rail-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>◇</span>{option}</button>)}</nav>;
  }
  if (item.type === "heading") {
    return <section><p className="eyebrow">{String(props.label ?? "")}</p><h1>{String(props.title ?? "Heading")}</h1><p>{String(props.description ?? "")}</p></section>;
  }
  if (item.type === "empty-state") {
    const commandName = eventCommandName(props, "click");
    return <section className="empty-state"><span>＋</span><strong>{String(props.title ?? "Empty")}</strong><p>{String(props.description ?? "")}</p><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "start") : undefined}>{String(props.label ?? "Start")}</button></section>;
  }
  if (item.type === "empty-panel") {
    const commandName = eventCommandName(props, "click");
    return <section className="empty-panel"><span>□</span><div><strong>{String(props.title ?? "Empty panel")}</strong><p>{String(props.description ?? "")}</p><footer><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "add") : undefined}>{String(props.label ?? "Add")}</button><small>{String(props.helper ?? "Waiting")}</small></footer></div></section>;
  }
  if (item.type === "stepper") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="card stepper"><div className="trace-title"><strong>{String(props.title ?? "Steps")}</strong><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "next") : undefined}>{String(props.label ?? "Next")}</button></div><p>{String(props.description ?? "")}</p><div className="step-row">{options.map((option, index) => <button key={option} type="button" className={option === current ? "step step-active" : "step"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>{index + 1}</span>{option}</button>)}</div></section>;
  }
  if (item.type === "wizard") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    const activeIndex = Math.max(0, options.findIndex((option) => option === current));
    return <section className="wizard"><aside><strong>{String(props.title ?? "Wizard")}</strong><small>{String(props.description ?? "")}</small>{options.map((option, index) => { const active = option === current || (!current && index === 0); const complete = activeIndex > index; return <button key={option} type="button" className={active ? "wizard-step wizard-step-active" : "wizard-step"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>{complete ? "✓" : index + 1}</span><b>{option}</b></button>; })}</aside><main><header><small>Wizard</small><strong>{current || options[0] || "Step"}</strong></header><div><span /><span /><i /></div><footer><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", "previous") : undefined}>Back</button><button type="button" className="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "next") : undefined}>{String(props.label ?? "Next")}</button></footer></main></section>;
  }
  if (item.type === "banner") {
    const commandName = eventCommandName(props, "click");
    return <section className={props.variant === "destructive" ? "banner banner-danger" : "banner"}><strong>{String(props.title ?? "Notice")}</strong><p>{String(props.description ?? "")}</p><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "action") : undefined}>{String(props.label ?? "Action")}</button></section>;
  }
  if (item.type === "alert") {
    const commandName = eventCommandName(props, "click");
    return <section className={props.variant === "destructive" ? "alert-card alert-card-danger" : "alert-card"}><span>!</span><div><strong>{String(props.title ?? "Alert")}</strong><p>{String(props.description ?? "")}</p>{props.label ? <button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "action") : undefined}>{String(props.label)}</button> : null}</div></section>;
  }
  if (item.type === "card" || item.type === "elevated-card" || item.type === "filled-card" || item.type === "outlined-card") {
    const commandName = eventCommandName(props, "click");
    const className = item.type === "elevated-card" ? "card runtime-card elevated-card" : item.type === "filled-card" ? "card runtime-card filled-card" : item.type === "outlined-card" ? "card runtime-card outlined-card" : "card runtime-card";
    const label = item.type === "elevated-card" ? "Elevated" : item.type === "filled-card" ? "Filled" : item.type === "outlined-card" ? "Outlined" : String(props.label ?? "实时");
    return <button type="button" className={className} onClick={commandName ? () => onRunCommand(item, "click", props.label ?? props.title ?? "card") : undefined}><div className="runtime-card-header"><span><strong>{String(props.title ?? "Card")}</strong><p>{String(props.description ?? "")}</p></span><em>{label}</em></div><progress max="100" value={percentValue(props.value, item.type === "filled-card" ? 100 : item.type === "outlined-card" ? 42 : 68)} /><small>{String(props.helper ?? props.value ?? "68%")}</small></button>;
  }
  if (item.type === "dialog") {
    const commandName = eventCommandName(props, "click");
    return <section className="card dialog-card"><h2>{String(props.title ?? "Dialog")}</h2><p>{String(props.description ?? "")}</p><div className="toolbar-actions"><button type="button" className="button button-muted">Cancel</button><button type="button" className="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "confirm") : undefined}>{String(props.label ?? "Confirm")}</button></div></section>;
  }
  if (item.type === "popover") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    return <section className="card popover-card"><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "open") : undefined}>{String(props.label ?? "Open")}</button><div className="popover-panel"><strong>{String(props.title ?? "Popover")}</strong><p>{String(props.description ?? "")}</p><div>{options.slice(0, 3).map((option) => <span key={option}>{option}</span>)}</div></div></section>;
  }
  if (item.type === "tooltip") {
    return <section className="tooltip-demo"><span className="tooltip-anchor">{String(props.label ?? "Action")}</span><span className="tooltip-bubble">{String(props.description ?? "Helpful context")}</span></section>;
  }
  if (item.type === "snackbar") {
    const commandName = eventCommandName(props, "click");
    return <section className="snackbar"><span><strong>{String(props.title ?? "Saved")}</strong><p>{String(props.description ?? "")}</p></span><button type="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "action") : undefined}>{String(props.label ?? "Action")}</button></section>;
  }
  if (item.type === "section-header") {
    return <header className="panel-row"><span><strong>{String(props.title ?? "Section")}</strong><p>{String(props.description ?? "")}</p></span><em>{String(props.label ?? props.helper ?? "")}</em></header>;
  }
  if (item.type === "toast") {
    const commandName = eventCommandName(props, "click");
    return <section className="toast-card"><span>✓</span><div><header><strong>{String(props.title ?? "Toast")}</strong><small>{String(props.helper ?? "now")}</small></header><p>{String(props.description ?? "")}</p><button type="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "open") : undefined}>{String(props.label ?? "Open")}</button></div></section>;
  }
  if (item.type === "fab") {
    const commandName = eventCommandName(props, "click");
    return <button type="button" className="fab" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "fab") : undefined}><span>＋</span>{String(props.label ?? "New")}</button>;
  }
  if (item.type === "extended-fab") {
    const commandName = eventCommandName(props, "click");
    return <button type="button" className="fab extended-fab" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "extended-fab") : undefined}><span>＋</span><strong>{String(props.label ?? "New")}</strong></button>;
  }
  if (item.type === "stat") {
    return <section className="card"><p>{String(props.label ?? "Metric")}</p><h2>{String(props.value ?? "0")}</h2><small>{String(props.helper ?? "")}</small></section>;
  }
  if (item.type === "lcd-display") {
    return <section className="lcd-display"><small>{String(props.label ?? "LCD")}</small><strong>{String(props.value ?? "0")}</strong><footer><span>{String(props.title ?? "Metric")}</span><em>{String(props.helper ?? "")}</em></footer></section>;
  }
  if (item.type === "chart-view") {
    const commandName = eventCommandName(props, "click");
    const series = optionTexts(props);
    const current = String(props.value ?? series[0] ?? "");
    return <section className="chart-view"><header><span><strong>{String(props.title ?? "Chart")}</strong><small>{String(props.description ?? "")}</small></span><em>{String(props.label ?? "ms")}</em></header><div className="chart-plot"><svg aria-hidden viewBox="0 0 320 160" preserveAspectRatio="none"><path className="chart-grid" d="M0 42 H320 M0 84 H320 M0 126 H320" /><path className="chart-line" d="M18 118 L74 92 L130 104 L186 62 L242 76 L302 38" /></svg><div className="chart-bars"><i style={{ height: "42%" }} /><i style={{ height: "58%" }} /><i style={{ height: "38%" }} /><i style={{ height: "72%" }} /><i style={{ height: "64%" }} /><i style={{ height: "86%" }} /></div></div><footer>{series.slice(0, 3).map((name, index) => <button key={name} type="button" className={name === current || (!current && index === 0) ? "chart-legend chart-legend-active" : "chart-legend"} onClick={() => { onWriteProp(item, "value", name); if (commandName) onRunCommand(item, "click", name); }}>{name}</button>)}</footer></section>;
  }
  if (item.type === "progress") {
    const value = percentValue(props.value, 68);
    return <section className="card"><div className="trace-title"><strong>{String(props.title ?? "Progress")}</strong><small>{value}%</small></div><progress max="100" value={value} /><p>{String(props.description ?? "")}</p></section>;
  }
  if (item.type === "circular-progress") {
    const value = percentValue(props.value, 72);
    const color = props.variant === "destructive" ? '#ba1a1a' : '#6750a4';
    return <section className="circular-progress"><div className="circular-progress-ring" style={{ background: `conic-gradient(${color} ${value * 3.6}deg, #f3edf7 0deg)` }}><span>{value}%</span></div><strong>{String(props.title ?? "Loading")}</strong><small>{String(props.label ?? "")}</small><p>{String(props.description ?? "")}</p></section>;
  }
  if (item.type === "progress-list") {
    const rows = optionTexts(props);
    const base = percentValue(props.value, 68);
    return <section className="list-view"><header><span><strong>{String(props.title ?? "Progress list")}</strong><small>{String(props.description ?? "")}</small></span><em>{String(props.label ?? `${rows.length} tasks`)}</em></header><div className="list-view-body">{rows.slice(0, 5).map((row, index) => { const value = Math.min(Math.max(base - index * 18, 8), 100); return <div key={row} className="list-view-row"><span>{index + 1}</span><strong>{row}</strong><small>{value}%</small><progress max="100" value={value} /></div>; })}</div></section>;
  }
  if (item.type === "avatar") {
    const commandName = eventCommandName(props, "click");
    const initials = String(props.value ?? props.label ?? "NU").slice(0, 2).toUpperCase();
    return <button type="button" className="panel-row avatar-row" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? initials) : undefined}><span className="avatar">{initials}</span><span><strong>{String(props.label ?? "User")}</strong><p>{String(props.helper ?? "")}</p></span></button>;
  }
  if (item.type === "avatar-group") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    return <button type="button" className="avatar-group" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "group") : undefined}><span><strong>{String(props.title ?? "Team")}</strong><p>{String(props.label ?? props.description ?? "")}</p></span><div>{options.slice(0, 4).map((option, index) => <i key={`${option}-${index}`} className={`avatar avatar-group-item avatar-group-item-${index + 1}`}>{option.slice(0, 2).toUpperCase()}</i>)}<em>{String(props.helper ?? "+2")}</em></div></button>;
  }
  if (item.type === "table") {
    return <section className="card"><strong>{String(props.title ?? "Table")}</strong><table><tbody><tr><td>Desktop</td><td>Ready</td></tr><tr><td>Rust</td><td>Linked</td></tr></tbody></table></section>;
  }
  if (item.type === "table-view") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="table-view"><header><span><strong>{String(props.title ?? "Table view")}</strong><small>{String(props.description ?? "")}</small></span><em>Model</em></header><div className="table-view-head"><span>Name</span><span>State</span><span>Target</span></div><div className="table-view-body">{rows.slice(0, 6).map((row, index) => { const active = row === current || (!current && index === 0); return <button key={row} type="button" className={active ? "table-view-row table-view-row-active" : "table-view-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span><span>{index === 2 ? "Draft" : "Ready"}</span><span>{index === 0 ? "UI" : index === 1 ? "Rust" : "Release"}</span></button>; })}</div></section>;
  }
  if (item.type === "kanban-board") {
    const commandName = eventCommandName(props, "click");
    const columns = optionTexts(props);
    const current = String(props.value ?? columns[0] ?? "");
    return <section className="data-grid"><header><span><strong>{String(props.title ?? "Board")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></span><button type="button">{String(props.label ?? "Flow")}</button></header><div className="data-grid-head">{columns.map((column) => <span key={column}>{column}</span>)}</div><div className="data-grid-body">{columns.map((column, index) => <button key={column} type="button" className={column === current ? "data-grid-row data-grid-row-active" : "data-grid-row"} onClick={() => { onWriteProp(item, "value", column); if (commandName) onRunCommand(item, "click", column); }}><span className={index === 2 ? "dot dot-muted" : "dot"} /><span>{column}</span><span>{index + 2} cards</span><span>{index === 1 ? "Active" : "Ready"}</span></button>)}</div></section>;
  }
  if (item.type === "data-grid") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="data-grid"><header><span><strong>{String(props.title ?? "Data grid")}</strong><small>{String(props.description ?? "")}</small></span><button type="button">Sort ^</button></header><div className="data-grid-head"><span /><span>Name</span><span>Status</span><span>Target</span></div>{rows.map((row, index) => <button key={row} type="button" className={row === current ? "data-grid-row data-grid-row-active" : "data-grid-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span className={index === 2 ? "dot dot-muted" : "dot"} /><span>{row}</span><span>{index === 2 ? "Draft" : "Ready"}</span><span>Win</span></button>)}</section>;
  }
  if (item.type === "property-grid") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="property-grid"><header><span><strong>{String(props.title ?? "Properties")}</strong><small>{String(props.description ?? "")}</small></span><em>Props</em></header><div className="property-grid-head"><span>Property</span><span>Value</span><span>Editor</span></div>{rows.map((row, index) => { const sampleValue = index === 0 ? `${item.width}px` : index === 1 ? `${item.height}px` : String(props.actionCommandId ?? "Unbound"); const editorType = index === 2 ? "event" : "number"; return <button key={row} type="button" className={row === current ? "property-grid-row property-grid-row-active" : "property-grid-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span><span>{sampleValue}</span><span>{editorType}</span></button>; })}</section>;
  }
  if (item.type === "key-value-list") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="key-value-list"><header><span><strong>{String(props.title ?? "Details")}</strong><small>{String(props.description ?? "")}</small></span><em>KV</em></header>{rows.map((row, index) => { const sampleValue = index === 0 ? "0.1.0" : index === 1 ? "Windows x64" : String(props.actionCommandId ?? "release"); return <button key={row} type="button" className={row === current ? "key-value-row key-value-row-active" : "key-value-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span><strong>{sampleValue}</strong></button>; })}</section>;
  }
  if (item.type === "inspector-section") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="inspector-section"><header><span>⌄</span><strong>{String(props.title ?? "Inspector")}</strong><small>{String(props.description ?? "")}</small></header>{rows.map((row, index) => <button key={row} type="button" className={row === current ? "inspector-row inspector-row-active" : "inspector-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span><em>{index === 0 ? `${item.width}px` : index === 1 ? `${item.height}px` : "fixed"}</em></button>)}</section>;
  }
  if (item.type === "form-layout") {
    const commandName = eventCommandName(props, "change");
    const fields = optionTexts(props);
    return <section className="form-layout"><header><strong>{String(props.title ?? "Form")}</strong><small>{String(props.description ?? "")}</small></header>{fields.map((field, index) => <label key={field}><span>{field}</span><input value={index === 0 ? String(props.value ?? "Nova UI Kit") : index === 1 ? "Select directory" : "Windows exe"} aria-invalid={index === 1} onChange={(event) => { if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} /></label>)}<footer><small>1 field needs attention</small><button type="button" className="button" onClick={commandName ? () => onRunCommand(item, "change", props.value ?? "") : undefined}>{String(props.label ?? "Save")}</button></footer></section>;
  }
  if (item.type === "console-panel") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[rows.length - 1] ?? "");
    return <section className="console-panel"><header><span>▸</span><strong>{String(props.title ?? "Console")}</strong><small>{String(props.description ?? "")}</small></header><div>{rows.map((row, index) => <button key={row} type="button" className={row === current ? "console-row console-row-active" : "console-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{index === 1 ? "warn" : index === 2 ? "done" : "info"}</span><code>{row}</code></button>)}</div></section>;
  }
  if (item.type === "terminal-view") {
    const clickCommandName = eventCommandName(props, "click");
    const changeCommandName = eventCommandName(props, "change");
    const commands = optionTexts(props);
    const current = String(props.value ?? commands[commands.length - 1] ?? "");
    return <section className="terminal-view"><header><span>▸</span><strong>{String(props.title ?? "Terminal")}</strong><small>{String(props.label ?? "shell")}</small></header><div><p className="terminal-cwd">{String(props.helper ?? "~")}</p>{commands.slice(0, 3).map((command) => <button key={command} type="button" className={command === current ? "terminal-line terminal-line-active" : "terminal-line"} onClick={() => { onWriteProp(item, "value", command); if (clickCommandName) onRunCommand(item, "click", command); }}><span>$</span><code>{command}</code></button>)}<p className="terminal-success">done in 1.4s</p></div><label><span>$</span><input value={current} placeholder={String(props.placeholder ?? "Type command...")} readOnly={Boolean(props.readOnly)} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (changeCommandName) onRunCommand(item, "change", event.currentTarget.value); }} /></label></section>;
  }
  if (item.type === "timeline") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[rows.length - 1] ?? "");
    return <section className="timeline"><header><span>◷</span><strong>{String(props.title ?? "Activity")}</strong><small>{String(props.description ?? "")}</small></header><div>{rows.map((row, index) => { const active = row === current || (!current && index === rows.length - 1); return <button key={row} type="button" className={active ? "timeline-row timeline-row-active" : "timeline-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span className="timeline-rail"><i /><b /></span><strong>{row}</strong><small>{index === 0 ? "09:12" : index === 1 ? "09:14" : "09:18"}</small><em>{index === 0 ? "Saved" : index === 1 ? "Checking" : "Done"}</em></button>; })}</div></section>;
  }
  if (item.type === "status-indicator") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="status-indicator"><header><span className="status-indicator-icon">⌁</span><div><strong>{String(props.title ?? "Status")}</strong><small>{String(props.description ?? "")}</small></div><em>{current}</em></header><div>{rows.map((row, index) => { const active = row === current || (!current && index === 0); const tone = index === 1 ? "status-indicator-warn" : index === 2 ? "status-indicator-bad" : "status-indicator-good"; return <button key={row} type="button" className={`${active ? "status-indicator-row status-indicator-row-active" : "status-indicator-row"} ${tone}`} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span /><strong>{row}</strong><small>{index === 1 ? "等待" : index === 2 ? "处理" : "在线"}</small></button>; })}</div></section>;
  }
  if (item.type === "divider") {
    return <hr />;
  }
  if (item.type === "badge") {
    return <span className="badge">{String(props.label ?? "Badge")}</span>;
  }
  return <section className="card"><strong>{String(props.title ?? "Card")}</strong><p>{String(props.description ?? "")}</p></section>;
}

function compactJson(value: unknown) {
  if (value === undefined) {
    return "";
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function upsertBackendRuntimeStatus(current: BackendRuntimeStatus[], next: BackendRuntimeStatus) {
  const index = current.findIndex((item) => item.id === next.id);
  if (index === -1) {
    return [next, ...current];
  }
  return current.map((item, itemIndex) => (itemIndex === index ? next : item));
}

function backendRuntimeContext(statuses: BackendRuntimeStatus[]) {
  const relevant = statuses.filter((status) => !["stopped", "skipped"].includes(status.status));
  if (relevant.length === 0) {
    return "";
  }
  return relevant
    .map((status) => {
      const pid = status.pid ? ` pid ${status.pid}` : "";
      const log = status.logPath ? ` log ${status.logPath}` : "";
      return `${status.name}: ${status.status}${pid}${log}`;
    })
    .join(" / ");
}

function withBackendRuntimeContext(message: string, statuses: BackendRuntimeStatus[]) {
  const context = backendRuntimeContext(statuses);
  return context ? `${message} · Backend runtime: ${context}` : message;
}

function RuntimeTracePanel({
  trace,
  stateValues,
  backendProbeResults,
  backendProbeLoading,
  backendRuntimeStatuses,
  backendRuntimeLogs,
  backendRuntimeLoading,
  onStartBackend,
  onStopBackend,
  onRefreshBackendRuntime,
  onPreviewBackendLog,
  onOpenBackendLog,
}: {
  trace: RuntimeTraceEntry[];
  stateValues: StateValues;
  backendProbeResults: BackendProbeResult[];
  backendProbeLoading: boolean;
  backendRuntimeStatuses: BackendRuntimeStatus[];
  backendRuntimeLogs: Record<string, BackendRuntimeLogPreview>;
  backendRuntimeLoading: boolean;
  onStartBackend: (integrationId: string) => void;
  onStopBackend: (integrationId: string) => void;
  onRefreshBackendRuntime: () => void;
  onPreviewBackendLog: (integrationId: string, logPath?: string) => void;
  onOpenBackendLog: (integrationId: string, logPath?: string) => void;
}) {
  return (
    <aside className="runtime-panel" aria-label="Runtime command trace">
      <div className="runtime-header">
        <div>
          <p className="eyebrow">Runtime Trace</p>
          <h2>Commands & State</h2>
        </div>
        <span>{trace.length} events</span>
      </div>
      <div className="backend-health">
        <div className="trace-title">
          <strong>Backend health</strong>
          <small>{backendProbeLoading || backendRuntimeLoading ? "checking" : `${backendProbeResults.length} integrations`}</small>
        </div>
        {backendProbeResults.length > 0 ? (
          backendProbeResults.map((result) => {
            const runtime = backendRuntimeStatuses.find((item) => item.id === result.id);
            const canManage = runtime && runtime.status !== "skipped";
            const running = runtime?.status === "running";
            const logPreview = backendRuntimeLogs[result.id];
            const canUseLog = Boolean(runtime?.logPath);
            return (
            <article key={result.id} className={`trace-entry trace-${result.status === "ready" || result.status === "skipped" ? "success" : "error"}`}>
              <div className="trace-title">
                <span>{result.name}</span>
                <small>{result.status}</small>
              </div>
              <p>{result.kind} / {result.transport} / health {Math.round(Number(result.durationMs ?? 0))} ms</p>
              <p>runtime {runtime?.status ?? "unknown"}{runtime?.pid ? ` / pid ${runtime.pid}` : ""}</p>
              {result.resourcePath ? <code>{result.resourcePath}</code> : null}
              {runtime?.logPath ? <code>log {runtime.logPath}</code> : null}
              {result.stdout ? <code>stdout {result.stdout}</code> : null}
              {result.stderr ? <code>stderr {result.stderr}</code> : null}
              <small className={result.status === "ready" || result.status === "skipped" ? "feedback" : "feedback feedback-error"}>{result.message}</small>
              {runtime?.message ? <small className={runtime.status === "error" ? "feedback feedback-error" : "feedback"}>{runtime.message}</small> : null}
              {logPreview ? <small className={logPreview.error ? "feedback feedback-error" : "feedback"}>{logPreview.message}</small> : null}
              {logPreview ? (
                <pre className={logPreview.error ? "backend-log-preview backend-log-error" : "backend-log-preview"}>
                  {logPreview.loading ? "Loading backend runtime log summary..." : logPreview.content || logPreview.message}
                </pre>
              ) : null}
              <div className="backend-actions">
                <button type="button" onClick={onRefreshBackendRuntime} disabled={backendRuntimeLoading}>
                  Refresh
                </button>
                <button type="button" onClick={() => onStartBackend(result.id)} disabled={!canManage || running || backendRuntimeLoading}>
                  Start
                </button>
                <button type="button" onClick={() => onStopBackend(result.id)} disabled={!canManage || !running || backendRuntimeLoading}>
                  Stop
                </button>
                <button type="button" onClick={() => onPreviewBackendLog(result.id, runtime?.logPath)} disabled={!canUseLog || Boolean(logPreview?.loading)}>
                  Log summary
                </button>
                <button type="button" onClick={() => onOpenBackendLog(result.id, runtime?.logPath)} disabled={!canUseLog || Boolean(logPreview?.loading)}>
                  Open full log
                </button>
              </div>
            </article>
          );
          })
        ) : (
          <div className="trace-empty">
            <strong>{backendProbeLoading ? "Checking backend integrations" : "No backend probe configured"}</strong>
            <p>{backendProbeLoading ? "Nova is asking Rust for backend health." : "Rust-only generated apps do not need an external health probe."}</p>
          </div>
        )}
      </div>
      <div className="state-snapshot">
        <strong>State snapshot</strong>
        {projectStateVariables.length > 0 ? (
          <dl>
            {projectStateVariables.map((state) => (
              <div key={state.id}>
                <dt>{state.name || state.id}</dt>
                <dd>{stateValues[state.id] ?? String(state.initialValue ?? "")}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p>No project state variables.</p>
        )}
      </div>
      <div className="trace-list">
        {trace.length > 0 ? (
          trace.map((entry) => (
            <article key={entry.id} className={`trace-entry trace-${entry.status}`}>
              <div className="trace-title">
                <span>{`${entry.eventName} -> ${entry.commandName}`}</span>
                <small>{entry.time}</small>
              </div>
              <p>{entry.itemName} / {entry.itemId}</p>
              {entry.args ? <code>args {compactJson(entry.args)}</code> : null}
              {entry.patch && Object.keys(entry.patch).length > 0 ? <code>patch {compactJson(entry.patch)}</code> : null}
              {entry.message ? <small className={entry.status === "error" ? "feedback feedback-error" : "feedback"}>{entry.message}</small> : null}
            </article>
          ))
        ) : (
          <div className="trace-empty">
            <strong>No command events yet</strong>
            <p>Interact with a bound control to inspect invoke args, Rust results, and state patches.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

export function App() {
  const activeFile = useMemo(() => {
    const files = Array.isArray(project.files) ? project.files : [];
    return files.find((file) => file.id === project.activeFileId) ?? files[0];
  }, []);
  const [message, setMessage] = useState("Rust logic not invoked yet");
  const [commandFeedback, setCommandFeedback] = useState<CommandFeedback>({});
  const [itemPropOverrides, setItemPropOverrides] = useState<ItemPropOverrides>({});
  const [stateValues, setStateValues] = useState<StateValues>(() => createInitialStateValues());
  const [runtimeTrace, setRuntimeTrace] = useState<RuntimeTraceEntry[]>([]);
  const [backendProbeResults, setBackendProbeResults] = useState<BackendProbeResult[]>([]);
  const [backendProbeLoading, setBackendProbeLoading] = useState(Boolean(backendIntegrationProbeCommand));
  const [backendRuntimeStatuses, setBackendRuntimeStatuses] = useState<BackendRuntimeStatus[]>([]);
  const [backendRuntimeLogs, setBackendRuntimeLogs] = useState<Record<string, BackendRuntimeLogPreview>>({});
  const [backendRuntimeLoading, setBackendRuntimeLoading] = useState(Boolean(backendIntegrationRuntimeStatusCommand));
  const breakpoint = useResponsiveBreakpoint();

  useEffect(() => {
    if (!startupProbeCommandName) {
      setMessage(registeredRustCommands.length > 0 ? "Rust commands ready" : "No Rust commands registered");
      return;
    }
    invoke<string>(startupProbeCommandName)
      .then(setMessage)
      .catch((error) => setMessage(String(error)));
  }, []);

  useEffect(() => {
    const controls = Array.from(document.querySelectorAll<HTMLElement>("[data-nova-control-id]"));
    for (const control of controls) {
      const rawTabIndex = control.getAttribute("data-nova-tab-index");
      const tabIndex = rawTabIndex === null ? Number.NaN : Number(rawTabIndex);
      const target = control.matches(runtimeInteractiveSelector)
        ? control
        : control.querySelector<HTMLElement>(runtimeInteractiveSelector);
      if (!target) {
        continue;
      }
      const enabled = control.getAttribute("data-nova-enabled") !== "false";
      const readOnly = control.getAttribute("data-nova-read-only") === "true";
      if (!enabled) {
        target.setAttribute("aria-disabled", "true");
        target.setAttribute("data-nova-runtime-disabled", "true");
        if (
          target instanceof HTMLButtonElement ||
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement
        ) {
          target.disabled = true;
        } else {
          target.tabIndex = -1;
        }
      }
      if (readOnly) {
        target.setAttribute("aria-readonly", "true");
        target.setAttribute("data-nova-runtime-read-only", "true");
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
          target.readOnly = true;
        }
      }
      if (!Number.isFinite(tabIndex) || !enabled) {
        continue;
      }
      target.tabIndex = Math.round(tabIndex);
      target.setAttribute("data-nova-runtime-tab-index", String(Math.round(tabIndex)));
    }
  }, [activeFile?.id, itemPropOverrides, stateValues]);

  useEffect(() => {
    if (!backendIntegrationProbeCommand) {
      setBackendProbeLoading(false);
      return;
    }
    setBackendProbeLoading(true);
    invoke<BackendProbeResult[]>(backendIntegrationProbeCommand)
      .then((results) => setBackendProbeResults(Array.isArray(results) ? results : []))
      .catch((error) =>
        setBackendProbeResults([
          {
            id: "backend-probe",
            name: "Backend health probe",
            kind: "probe",
            language: "rust",
            transport: "tauri-invoke",
            status: "error",
            message: String(error),
          },
        ]),
      )
      .finally(() => setBackendProbeLoading(false));
  }, []);

  const refreshBackendRuntime = useCallback(() => {
    if (!backendIntegrationRuntimeStatusCommand) {
      setBackendRuntimeLoading(false);
      return;
    }
    setBackendRuntimeLoading(true);
    invoke<BackendRuntimeStatus[]>(backendIntegrationRuntimeStatusCommand)
      .then((results) => setBackendRuntimeStatuses(Array.isArray(results) ? results : []))
      .catch((error) =>
        setBackendRuntimeStatuses([
          {
            id: "backend-runtime",
            name: "Backend runtime",
            kind: "runtime",
            transport: "tauri-invoke",
            status: "error",
            message: String(error),
          },
        ]),
      )
      .finally(() => setBackendRuntimeLoading(false));
  }, []);

  useEffect(() => {
    refreshBackendRuntime();
  }, [refreshBackendRuntime]);

  const startBackend = useCallback((integrationId: string) => {
    if (!backendIntegrationStartCommand) {
      return;
    }
    setBackendRuntimeLoading(true);
    invoke<BackendRuntimeStatus>(backendIntegrationStartCommand, { integrationId })
      .then((result) => setBackendRuntimeStatuses((current) => upsertBackendRuntimeStatus(current, result)))
      .catch((error) =>
        setBackendRuntimeStatuses((current) =>
          upsertBackendRuntimeStatus(current, {
            id: integrationId,
            name: integrationId,
            kind: "sidecar",
            transport: "tauri-invoke",
            status: "error",
            message: String(error),
          }),
        ),
      )
      .finally(() => {
        setBackendRuntimeLoading(false);
        refreshBackendRuntime();
      });
  }, [refreshBackendRuntime]);

  const stopBackend = useCallback((integrationId: string) => {
    if (!backendIntegrationStopCommand) {
      return;
    }
    setBackendRuntimeLoading(true);
    invoke<BackendRuntimeStatus>(backendIntegrationStopCommand, { integrationId })
      .then((result) => setBackendRuntimeStatuses((current) => upsertBackendRuntimeStatus(current, result)))
      .catch((error) =>
        setBackendRuntimeStatuses((current) =>
          upsertBackendRuntimeStatus(current, {
            id: integrationId,
            name: integrationId,
            kind: "sidecar",
            transport: "tauri-invoke",
            status: "error",
            message: String(error),
          }),
        ),
      )
      .finally(() => {
        setBackendRuntimeLoading(false);
        refreshBackendRuntime();
      });
  }, [refreshBackendRuntime]);

  const previewBackendLog = useCallback((integrationId: string, logPath?: string) => {
    if (!backendIntegrationReadLogCommand || !logPath) {
      return;
    }
    setBackendRuntimeLogs((current) => ({
      ...current,
      [integrationId]: {
        ...(current[integrationId] ?? { content: "", message: "" }),
        loading: true,
        error: false,
        message: "Loading backend runtime log summary...",
        logPath,
      },
    }));
    invoke<BackendRuntimeLogResult>(backendIntegrationReadLogCommand, { logPath })
      .then((result) => {
        setBackendRuntimeLogs((current) => ({
          ...current,
          [integrationId]: {
            loading: false,
            error: !result.success,
            message: result.message,
            content: result.content ?? "",
            truncated: result.truncated,
            lengthBytes: result.lengthBytes,
            logPath: result.logPath ?? logPath,
          },
        }));
      })
      .catch((error) => {
        setBackendRuntimeLogs((current) => ({
          ...current,
          [integrationId]: {
            loading: false,
            error: true,
            message: String(error),
            content: "",
            logPath,
          },
        }));
      });
  }, []);

  const openBackendLog = useCallback((integrationId: string, logPath?: string) => {
    if (!backendIntegrationOpenLogCommand || !logPath) {
      return;
    }
    invoke<BackendRuntimeLogResult>(backendIntegrationOpenLogCommand, { logPath })
      .then((result) => {
        setBackendRuntimeLogs((current) => ({
          ...current,
          [integrationId]: {
            ...(current[integrationId] ?? { content: "" }),
            loading: false,
            error: !result.success,
            message: result.message,
            logPath: result.logPath ?? logPath,
          },
        }));
      })
      .catch((error) => {
        setBackendRuntimeLogs((current) => ({
          ...current,
          [integrationId]: {
            ...(current[integrationId] ?? { content: "" }),
            loading: false,
            error: true,
            message: String(error),
            logPath,
          },
        }));
      });
  }, []);

  const writeProp = useCallback<PropWriter>((item, propName, value) => {
    const stateId = item.props?.stateBindings?.[propName as keyof NonNullable<ItemProps["stateBindings"]>];
    if (stateId) {
      setStateValues((current) => ({
        ...current,
        [stateId]: value,
      }));
    }
    setItemPropOverrides((current) => ({
      ...current,
      [item.id]: {
        ...(current[item.id] ?? {}),
        [propName]: value,
      },
    }));
  }, []);

  const runCommand = useCallback<CommandRunner>((item, eventName, rawValue) => {
    const props = itemProps(item, itemPropOverrides, stateValues);
    const binding = eventBinding(props, eventName);
    const nextCommandName = eventCommandName(props, eventName);
    if (!nextCommandName) {
      return;
    }
    const key = eventFeedbackKey(item.id, eventName);
    const args = commandArgs(item, props, eventName, rawValue, binding, stateValues);
    const entryId = traceId();
    setRuntimeTrace((current) => [
      {
        id: entryId,
        time: nowLabel(),
        itemId: item.id,
        itemName: String(item.name ?? props.label ?? item.type),
        eventName,
        commandName: nextCommandName,
        status: "running" as const,
        args: args as Record<string, unknown> | undefined,
      },
      ...current,
    ].slice(0, 8));
    setCommandFeedback((current) => ({
      ...current,
      [key]: { loading: true, message: "", error: false },
    }));
    setMessage(`${eventName} -> ${nextCommandName}: running...`);
    invoke<string>(nextCommandName, args)
      .then((result) => {
        const rawOutcome = commandResultOutcome(result, binding);
        const outcome = rawOutcome.error
          ? { ...rawOutcome, message: withBackendRuntimeContext(rawOutcome.message, backendRuntimeStatuses) }
          : rawOutcome;
        setRuntimeTrace((current) =>
          current.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  time: nowLabel(),
                  status: outcome.error ? "error" : "success",
                  result,
                  message: outcome.message,
                  patch: outcome.patch,
                  error: outcome.error ? outcome.message : undefined,
                }
              : entry,
          ),
        );
        setCommandFeedback((current) => ({
          ...current,
          [key]: { loading: false, message: outcome.message, error: outcome.error },
        }));
        if (Object.keys(outcome.patch).length > 0) {
          setStateValues((current) => ({
            ...current,
            ...outcome.patch,
          }));
        }
        if (!outcome.error && binding.resultTargetItemId && binding.resultTargetProp) {
          setItemPropOverrides((current) => ({
            ...current,
            [binding.resultTargetItemId!]: {
              ...(current[binding.resultTargetItemId!] ?? {}),
              [binding.resultTargetProp!]: outcome.message,
            },
          }));
        }
        if (!outcome.error && binding.resultStateId) {
          setStateValues((current) => ({
            ...current,
            [binding.resultStateId!]: outcome.message,
          }));
        }
        setMessage(`${eventName} -> ${nextCommandName}: ${outcome.message}`);
      })
      .catch((error) => {
        const message = withBackendRuntimeContext(String(error), backendRuntimeStatuses);
        setRuntimeTrace((current) =>
          current.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  time: nowLabel(),
                  status: "error",
                  message,
                  error: message,
                }
              : entry,
          ),
        );
        setCommandFeedback((current) => ({
          ...current,
          [key]: { loading: false, message, error: true },
        }));
        setMessage(`${eventName} -> ${nextCommandName}: ${message}`);
      });
  }, [backendRuntimeStatuses, itemPropOverrides, stateValues]);

  const basePage = activeFile?.page ?? { title: project.name, width: 1200, height: 800 };
  const page = { ...basePage, ...pageForBreakpoint(basePage, breakpoint) };
  const items = resolveItemsForBreakpoint([...(activeFile?.items ?? [])].sort((a, b) => a.z - b.z) as Item[], breakpoint);
  const topLevelItems = items.filter((item) => !item.parentId);
  const windowKind = runtimeWindowKind((basePage as { windowKind?: unknown }).windowKind ?? projectReleaseConfig.windowKind);
  const requestedTitlebarStyle = runtimeTitlebarStyle((basePage as { titlebarStyle?: unknown }).titlebarStyle ?? projectReleaseConfig.titlebarStyle, windowKind);
  const releaseTitlebarStyle = runtimeTitlebarStyle(projectReleaseConfig.titlebarStyle, runtimeWindowKind(projectReleaseConfig.windowKind));
  const titlebarStyle = requestedTitlebarStyle === "native" && releaseTitlebarStyle !== "native" ? "nova" : requestedTitlebarStyle;
  const windowTitle = String(page.title || projectReleaseConfig.windowTitle || projectReleaseConfig.appName || project.name || "Nova App");
  const titlebarSubtitle = String((basePage as { titlebarSubtitle?: unknown }).titlebarSubtitle || projectReleaseConfig.titlebarSubtitle || "");
  const runtimeBackground = runtimePageBackground((basePage as { background?: unknown }).background);
  const showRuntimePanel = projectReleaseConfig.showRuntimePanel === true;
  const statusText = message && message !== "Rust logic not invoked yet" ? message : `${items.length} controls / ${breakpoint}`;

  return (
    <main
      className={`app app-${windowKind} app-titlebar-${titlebarStyle} app-background-${runtimeBackground}`}
      data-window-kind={windowKind}
      data-titlebar-style={titlebarStyle}
      data-runtime-background={runtimeBackground}
      data-runtime-grid="off"
      data-runtime-style-contract="nova-desktop-shell"
      data-runtime-design-artifacts="none"
      data-runtime-frame="nova-editor-parity"
      data-runtime-density="desktop"
      data-runtime-platform="tauri"
      data-runtime-grid-policy="design-only"
      data-runtime-surface={titlebarStyle === "nova" ? "custom-chrome" : "native-content"}
      data-runtime-shell={titlebarStyle === "nova" ? "nova" : titlebarStyle}
    >
      {titlebarStyle === "nova" ? (
        <NovaWindowTitlebar
          title={windowTitle}
          subtitle={titlebarSubtitle}
          status={statusText}
          windowKind={windowKind}
          titlebarStyle={titlebarStyle}
        />
      ) : null}
      <div className="app-body" data-runtime-body="nova-surface">
        <div className="workspace" data-runtime-panel={showRuntimePanel ? "visible" : "hidden"}>
          <div className="canvas-viewport" data-runtime-surface="viewport">
            <section
              className={`canvas canvas-background-${runtimeBackground}`}
              data-runtime-surface="app-canvas"
              data-runtime-design-grid="absent"
              data-runtime-rulers="absent"
              style={{ width: page.width, height: page.height, minWidth: "100%", minHeight: "100%" }}
            >
              {topLevelItems.map((item) => renderNode(item, items, commandFeedback, itemPropOverrides, stateValues, runCommand, writeProp, "free", { width: page.width, height: page.height }))}
            </section>
          </div>
          {showRuntimePanel ? (
            <RuntimeTracePanel
              trace={runtimeTrace}
              stateValues={stateValues}
              backendProbeResults={backendProbeResults}
              backendProbeLoading={backendProbeLoading}
              backendRuntimeStatuses={backendRuntimeStatuses}
              backendRuntimeLogs={backendRuntimeLogs}
              backendRuntimeLoading={backendRuntimeLoading}
              onStartBackend={startBackend}
              onStopBackend={stopBackend}
              onRefreshBackendRuntime={refreshBackendRuntime}
              onPreviewBackendLog={previewBackendLog}
              onOpenBackendLog={openBackendLog}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
"#;
