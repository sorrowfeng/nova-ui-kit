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
export type EditorExperienceAuditSeverity = "pass" | "warning" | "fail";

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
  warning: "提醒",
  fail: "阻塞",
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
} as const;
