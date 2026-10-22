import { eventPayloadFieldSelection } from "./event-bindings";
import { commandResultSchema, rustCommandParameters } from "./rust-commands";
import type {
  BuilderEventBinding,
  BuilderEventName,
  BuilderItem,
  BuilderItemProps,
  BuilderResultTargetProp,
  DesignerProject,
  RustCommand,
  RustCommandParameterSource,
  RustCommandParameterType,
} from "./types";

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

export function simulatorTraceId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function simulatorTimeLabel() {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

export function resolveSimulatorProps(item: BuilderItem, stateValues: Record<string, string>): BuilderItemProps {
  const props = { ...item.props };
  Object.entries(props.stateBindings ?? {}).forEach(([propName, stateId]) => {
    if (stateId && Object.prototype.hasOwnProperty.call(stateValues, stateId)) {
      props[propName as BuilderResultTargetProp] = stateValues[stateId];
    }
  });
  return props;
}

function simulatorStateSnapshot(project: DesignerProject, stateValues: Record<string, string>) {
  return Object.fromEntries(project.stateVariables.map((state) => [state.name || state.id, stateValues[state.id] ?? state.initialValue ?? ""]));
}

function simulatorEventPayload(
  project: DesignerProject,
  item: BuilderItem,
  props: BuilderItemProps,
  eventName: BuilderEventName,
  rawValue: unknown,
  binding: BuilderEventBinding,
  stateValues: Record<string, string>,
) {
  const value = rawValue ?? props.value ?? props.label ?? "";
  const payload: Record<string, unknown> = {};
  for (const field of eventPayloadFieldSelection(binding)) {
    if (field === "event") {
      payload.event = eventName;
    } else if (field === "itemId") {
      payload.itemId = item.id;
    } else if (field === "itemName") {
      payload.itemName = item.name || props.label || item.type;
    } else if (field === "value") {
      payload.value = value;
    } else if (field === "checked") {
      payload.checked = typeof rawValue === "boolean" ? rawValue : Boolean(props.checked);
    } else if (field === "state") {
      payload.state = simulatorStateSnapshot(project, stateValues);
    }
  }
  return payload;
}

function simulatorSourceValue(
  source: RustCommandParameterSource,
  project: DesignerProject,
  item: BuilderItem,
  props: BuilderItemProps,
  eventName: BuilderEventName,
  rawValue: unknown,
  binding: BuilderEventBinding,
  stateValues: Record<string, string>,
) {
  const value = rawValue ?? props.value ?? props.label ?? "";
  if (source === "checked") {
    return typeof rawValue === "boolean" ? rawValue : Boolean(props.checked);
  }
  if (source === "event") {
    return eventName;
  }
  if (source === "itemId") {
    return item.id;
  }
  if (source === "itemName") {
    return item.name || props.label || item.type;
  }
  if (source === "state") {
    return simulatorStateSnapshot(project, stateValues);
  }
  if (source === "payload") {
    return {
      event: eventName,
      itemId: item.id,
      itemName: item.name || props.label || item.type,
      value,
      checked: typeof rawValue === "boolean" ? rawValue : Boolean(props.checked),
      state: simulatorStateSnapshot(project, stateValues),
      selected: simulatorEventPayload(project, item, props, eventName, rawValue, binding, stateValues),
    };
  }
  return value;
}

function coerceSimulatorArg(type: RustCommandParameterType, value: unknown) {
  if (type === "bool") {
    return typeof value === "boolean" ? value : value === "true" || value === "1" || value === "on";
  }
  if (type === "number") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (type === "json") {
    return value ?? null;
  }
  return typeof value === "string" ? value : compactJson(value ?? "");
}

export function simulatorArgsForEvent(
  project: DesignerProject,
  command: RustCommand,
  item: BuilderItem,
  props: BuilderItemProps,
  eventName: BuilderEventName,
  rawValue: unknown,
  binding: BuilderEventBinding,
  stateValues: Record<string, string>,
) {
  const parameters = rustCommandParameters(command);
  if (parameters.length > 0) {
    return Object.fromEntries(
      parameters.map((parameter) => [
        parameter.name,
        coerceSimulatorArg(
          parameter.type,
          simulatorSourceValue(parameter.source, project, item, props, eventName, rawValue, binding, stateValues),
        ),
      ]),
    );
  }
  if (!binding.passValue) {
    return undefined;
  }
  if (binding.payloadMode === "json") {
    return {
      value: JSON.stringify(simulatorEventPayload(project, item, props, eventName, rawValue, binding, stateValues)),
    };
  }
  return {
    value: String(rawValue ?? props.value ?? ""),
  };
}

function simulatorStatePatchFromRecord(project: DesignerProject, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const stateIds = new Set(project.stateVariables.map((state) => state.id));
  const stateByName = new Map(project.stateVariables.map((state) => [state.name, state.id]));
  const patch: Record<string, string> = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, patchValue]) => {
    const stateId = stateIds.has(key) ? key : stateByName.get(key);
    if (stateId) {
      patch[stateId] = String(patchValue ?? "");
    }
  });
  return patch;
}

function simulatorValueAtPath(value: unknown, path = "") {
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

function simulatorStringResult(value: unknown, fallback: string) {
  if (typeof value === "string") {
    return value;
  }
  if (value === undefined || value === null) {
    return fallback;
  }
  return typeof value === "object" ? compactJson(value) : String(value);
}

export function simulatorOutcomeFromResult(project: DesignerProject, command: RustCommand, rawResult: string, binding: BuilderEventBinding) {
  const resultSchema = commandResultSchema(command);
  if (resultSchema.mode !== "json") {
    let patch: Record<string, string> = {};
    if (binding.applyJsonStatePatch) {
      try {
        patch = simulatorStatePatchFromRecord(project, JSON.parse(rawResult || "{}"));
      } catch {
        patch = {};
      }
    }
    return {
      message: rawResult,
      error: false,
      patch,
    };
  }
  try {
    const parsed = JSON.parse(rawResult) as Record<string, unknown>;
    const successValue = simulatorValueAtPath(parsed, resultSchema.successPath || "success");
    const errorValue = simulatorValueAtPath(parsed, resultSchema.errorPath || "error");
    const messageValue = simulatorValueAtPath(parsed, resultSchema.messagePath || "message");
    const patchValue = simulatorValueAtPath(parsed, resultSchema.statePatchPath || "patch");
    const hasError = successValue === false || Boolean(errorValue);
    return {
      message: simulatorStringResult(hasError ? errorValue ?? messageValue : messageValue, rawResult),
      error: hasError,
      patch: hasError ? {} : simulatorStatePatchFromRecord(project, patchValue),
    };
  } catch {
    return {
      message: rawResult,
      error: true,
      patch: {},
    };
  }
}
