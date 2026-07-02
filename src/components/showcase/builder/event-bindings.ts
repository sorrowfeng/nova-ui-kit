import type {
  BuilderEventBinding,
  BuilderEventName,
  BuilderEventPayloadField,
  BuilderItem,
  BuilderItemProps,
} from "./types";

export const defaultEventPayloadFields: BuilderEventPayloadField[] = ["event", "itemId", "itemName", "value"];

export const eventPayloadFields: Array<{ value: BuilderEventPayloadField; label: string; description: string }> = [
  { value: "event", label: "事件", description: "click/change" },
  { value: "itemId", label: "控件 ID", description: "控件唯一 id" },
  { value: "itemName", label: "控件名称", description: "图层名称" },
  { value: "value", label: "值", description: "当前值" },
  { value: "checked", label: "选中状态", description: "布尔开关状态" },
  { value: "state", label: "状态", description: "共享 state 快照" },
];

export function eventNameForItem(item: BuilderItem): BuilderEventName | null {
  if (
    item.type === "button" ||
    item.type === "dialog-button-box" ||
    item.type === "command-link-button" ||
    item.type === "menu-button" ||
    item.type === "split-button" ||
    item.type === "tool-button" ||
    item.type === "icon-button" ||
    item.type === "link-label" ||
    item.type === "tabs" ||
    item.type === "menu-bar" ||
    item.type === "menu" ||
    item.type === "list" ||
    item.type === "list-item" ||
    item.type === "list-view" ||
    item.type === "column-view" ||
    item.type === "icon-view" ||
    item.type === "command-list" ||
    item.type === "tree-view" ||
    item.type === "tree-table" ||
    item.type === "system-tray" ||
    item.type === "breadcrumb-bar" ||
    item.type === "pagination" ||
    item.type === "toolbar" ||
    item.type === "top-app-bar" ||
    item.type === "bottom-app-bar" ||
    item.type === "navigation-bar" ||
    item.type === "navigation-item" ||
    item.type === "navigation-suite" ||
    item.type === "status-bar" ||
    item.type === "split-view" ||
    item.type === "supporting-pane" ||
    item.type === "scroll-area" ||
    item.type === "stacked-pages" ||
    item.type === "dock-panel" ||
    item.type === "navigation" ||
    item.type === "navigation-drawer" ||
    item.type === "navigation-rail" ||
    item.type === "side-sheet" ||
    item.type === "bottom-sheet" ||
    item.type === "sheet-drag-handle" ||
    item.type === "accordion" ||
    item.type === "tool-box" ||
    item.type === "carousel" ||
    item.type === "empty-state" ||
    item.type === "dialog" ||
    item.type === "stepper" ||
    item.type === "banner" ||
    item.type === "section-header" ||
    item.type === "alert" ||
    item.type === "elevated-card" ||
    item.type === "filled-card" ||
    item.type === "outlined-card" ||
    item.type === "snackbar" ||
    item.type === "toast" ||
    item.type === "fab" ||
    item.type === "extended-fab" ||
    item.type === "assist-chip" ||
    item.type === "input-chip" ||
    item.type === "suggestion-chip" ||
    item.type === "floating-toolbar" ||
    item.type === "avatar" ||
    item.type === "avatar-group" ||
    item.type === "image-list" ||
    item.type === "empty-panel" ||
    item.type === "search-suggestion-list" ||
    item.type === "calendar-scheduler" ||
    item.type === "kanban-board" ||
    item.type === "table-view" ||
    item.type === "data-grid" ||
    item.type === "property-grid" ||
    item.type === "inspector-section" ||
    item.type === "console-panel" ||
    item.type === "problems-panel" ||
    item.type === "breakpoints-panel" ||
    item.type === "watch-panel" ||
    item.type === "call-stack" ||
    item.type === "timeline" ||
    item.type === "status-indicator" ||
    item.type === "progress-list" ||
    item.type === "chips"
  ) {
    return "click";
  }
  if (
    item.type === "input" ||
    item.type === "password-field" ||
    item.type === "number-field" ||
    item.type === "spin-box" ||
    item.type === "double-spin-box" ||
    item.type === "dial" ||
    item.type === "textarea" ||
    item.type === "plain-text-edit" ||
    item.type === "rich-text-editor" ||
    item.type === "search-bar" ||
    item.type === "search-view" ||
    item.type === "filter-bar" ||
    item.type === "tag-input" ||
    item.type === "checkbox" ||
    item.type === "checkbox-group" ||
    item.type === "radio" ||
    item.type === "radio-group" ||
    item.type === "switch" ||
    item.type === "slider" ||
    item.type === "range-slider" ||
    item.type === "rating" ||
    item.type === "scroll-bar" ||
    item.type === "color-picker" ||
    item.type === "file-picker" ||
    item.type === "folder-picker" ||
    item.type === "shortcut-recorder" ||
    item.type === "select" ||
    item.type === "multi-select" ||
    item.type === "combobox" ||
    item.type === "autocomplete" ||
    item.type === "font-combo-box" ||
    item.type === "button-group" ||
    item.type === "toggle-group" ||
    item.type === "date-picker" ||
    item.type === "date-range-picker" ||
    item.type === "time-picker" ||
    item.type === "date-time-picker" ||
    item.type === "calendar-widget" ||
    item.type === "segmented" ||
    item.type === "filter-chip" ||
    item.type === "splitter" ||
    item.type === "size-grip" ||
    item.type === "form-layout"
  ) {
    return "change";
  }
  return null;
}

export function eventCommandId(item: BuilderItem, eventName: BuilderEventName) {
  return item.props.events?.[eventName]?.commandId || (eventName === "click" ? item.props.actionCommandId : "") || "";
}

export function eventPayloadFieldSelection(binding?: BuilderEventBinding | null) {
  return binding?.payloadFields?.length ? binding.payloadFields : defaultEventPayloadFields;
}

export function payloadFieldsWithToggle(
  binding: BuilderEventBinding | null,
  field: BuilderEventPayloadField,
  checked: boolean,
): BuilderEventPayloadField[] {
  const current = eventPayloadFieldSelection(binding);
  const next = checked ? Array.from(new Set([...current, field])) : current.filter((value) => value !== field);
  return next.length > 0 ? next : current;
}

export function propsWithEventBindingPatch(
  props: BuilderItemProps,
  eventName: BuilderEventName,
  patch: Partial<BuilderEventBinding>,
): BuilderItemProps {
  const events = { ...(props.events ?? {}) };
  const nextBinding = { ...(events[eventName] ?? {}), ...patch };
  if (patch.commandId === "") {
    delete nextBinding.commandId;
  }
  if (patch.resultTargetItemId === "") {
    delete nextBinding.resultTargetItemId;
  }
  if (patch.resultTargetProp === undefined) {
    delete nextBinding.resultTargetProp;
  }
  if (patch.resultStateId === "") {
    delete nextBinding.resultStateId;
  }
  if (patch.payloadMode === "value") {
    delete nextBinding.payloadMode;
  }
  if (Array.isArray(nextBinding.payloadFields)) {
    const allowedFields = new Set(eventPayloadFields.map((field) => field.value));
    const payloadFields = Array.from(new Set(nextBinding.payloadFields)).filter((field) => allowedFields.has(field));
    if (payloadFields.length > 0) {
      nextBinding.payloadFields = payloadFields;
    } else {
      delete nextBinding.payloadFields;
    }
  }
  if (!nextBinding.passValue || nextBinding.payloadMode !== "json") {
    delete nextBinding.payloadFields;
  }
  if (
    !nextBinding.commandId &&
    !nextBinding.passValue &&
    !nextBinding.payloadMode &&
    !nextBinding.payloadFields?.length &&
    !nextBinding.resultTargetItemId &&
    !nextBinding.resultTargetProp &&
    !nextBinding.resultStateId &&
    !nextBinding.applyJsonStatePatch
  ) {
    delete events[eventName];
  } else {
    events[eventName] = nextBinding;
  }

  return {
    ...props,
    events: Object.keys(events).length > 0 ? events : undefined,
    actionCommandId: eventName === "click" ? nextBinding.commandId || "" : props.actionCommandId,
  };
}

export function propsWithoutPayloadForCommand(props: BuilderItemProps, commandId: string): BuilderItemProps {
  return (["click", "change"] as BuilderEventName[]).reduce((nextProps, eventName) => {
    const binding = nextProps.events?.[eventName];
    if (binding?.commandId !== commandId) {
      return nextProps;
    }
    return propsWithEventBindingPatch(nextProps, eventName, {
      passValue: false,
      payloadMode: "value",
      payloadFields: undefined,
    });
  }, props);
}
