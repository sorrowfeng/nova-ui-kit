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
  if (item.type === "button") {
    return "click";
  }
  if (item.type === "input" || item.type === "textarea" || item.type === "checkbox" || item.type === "switch" || item.type === "select") {
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
