// Severity/status → display label lookups.
//
// These cross the boundary from domain data into the UI classifier, so they
// are kept free of JSX and free of imports: the density gate's regression test
// imports them directly and asserts every lookup is total. A `labels[x]` that
// returns undefined for a valid enum member is a typo'd key — silent until it
// blanks a panel — and a bare Record lookup cannot tell that apart from a
// genuinely unknown wire value.

export type BuildReadinessSeverity = "ready" | "warning" | "error";
export type WindowVisualAuditSeverity = "pass" | "warning" | "error";
/**
 * "unverified" is not a softer "pass". It means the check that would decide
 * could not run because its precondition is absent — nothing is selected, the
 * caret is outside a symbol, nothing has been built yet. Collapsing it into
 * either "pass" or "warning" is what made the Qt Creator matrix report a
 * product gap for an empty canvas.
 */
export type EditorExperienceAuditSeverity = "pass" | "unverified" | "warning" | "fail";
export type SimulatorTraceStatus = "success" | "error";
export type FrameLayoutMode = "free" | "row" | "column" | "grid";
export type ResponsiveBreakpointId = "desktop" | "tablet" | "mobile";
export type BuildDiagnosticSeverity = "error" | "warning";

/** Shown when wire data carries a status the table never anticipated. */
export const UNKNOWN_STATUS_LABEL = "未知";

const BUILD_READINESS_SEVERITY_LABELS: Record<BuildReadinessSeverity, string> = {
  ready: "就绪",
  warning: "警告",
  error: "错误",
};

const WINDOW_VISUAL_AUDIT_SEVERITY_LABELS: Record<WindowVisualAuditSeverity, string> = {
  pass: "通过",
  warning: "警告",
  error: "错误",
};

const EDITOR_EXPERIENCE_AUDIT_SEVERITY_LABELS: Record<EditorExperienceAuditSeverity, string> = {
  pass: "通过",
  unverified: "待验证",
  warning: "提醒",
  fail: "阻塞",
};

const SIMULATOR_TRACE_STATUS_LABELS: Record<SimulatorTraceStatus, string> = {
  success: "成功",
  error: "错误",
};

const FRAME_LAYOUT_MODE_LABELS: Record<FrameLayoutMode, string> = {
  free: "自由",
  row: "行",
  column: "列",
  grid: "网格",
};

const RESPONSIVE_BREAKPOINT_LABELS: Record<ResponsiveBreakpointId, string> = {
  desktop: "桌面",
  tablet: "平板",
  mobile: "手机",
};

const BUILD_DIAGNOSTIC_SEVERITY_LABELS: Record<BuildDiagnosticSeverity, string> = {
  error: "错误",
  warning: "警告",
};

function lookup(table: Record<string, string>, key: string): string {
  return table[key] ?? (typeof key === "string" && key.trim() !== "" ? key : UNKNOWN_STATUS_LABEL);
}

export function buildReadinessSeverityLabel(severity: BuildReadinessSeverity): string {
  return lookup(BUILD_READINESS_SEVERITY_LABELS, severity);
}

export function visualAuditSeverityLabel(severity: WindowVisualAuditSeverity): string {
  return lookup(WINDOW_VISUAL_AUDIT_SEVERITY_LABELS, severity);
}

export function editorExperienceAuditSeverityLabel(severity: EditorExperienceAuditSeverity): string {
  return lookup(EDITOR_EXPERIENCE_AUDIT_SEVERITY_LABELS, severity);
}

export function simulatorTraceStatusLabel(status: SimulatorTraceStatus): string {
  return lookup(SIMULATOR_TRACE_STATUS_LABELS, status);
}

export function frameLayoutModeLabel(mode: FrameLayoutMode): string {
  return lookup(FRAME_LAYOUT_MODE_LABELS, mode);
}

export function responsiveBreakpointLabel(breakpoint: ResponsiveBreakpointId): string {
  return lookup(RESPONSIVE_BREAKPOINT_LABELS, breakpoint);
}

export function buildDiagnosticSeverityLabel(severity: BuildDiagnosticSeverity): string {
  return lookup(BUILD_DIAGNOSTIC_SEVERITY_LABELS, severity);
}

/** Every severity the lookup tables claim to cover — the gate asserts against this. */
export const STATUS_LABEL_DOMAINS = {
  buildReadiness: {
    table: BUILD_READINESS_SEVERITY_LABELS,
    label: buildReadinessSeverityLabel,
  },
  windowVisualAudit: {
    table: WINDOW_VISUAL_AUDIT_SEVERITY_LABELS,
    label: visualAuditSeverityLabel,
  },
  editorExperienceAudit: {
    table: EDITOR_EXPERIENCE_AUDIT_SEVERITY_LABELS,
    label: editorExperienceAuditSeverityLabel,
  },
  simulatorTrace: {
    table: SIMULATOR_TRACE_STATUS_LABELS,
    label: simulatorTraceStatusLabel,
  },
  frameLayoutMode: {
    table: FRAME_LAYOUT_MODE_LABELS,
    label: frameLayoutModeLabel,
  },
  responsiveBreakpoint: {
    table: RESPONSIVE_BREAKPOINT_LABELS,
    label: responsiveBreakpointLabel,
  },
  buildDiagnosticSeverity: {
    table: BUILD_DIAGNOSTIC_SEVERITY_LABELS,
    label: buildDiagnosticSeverityLabel,
  },
} as const;
