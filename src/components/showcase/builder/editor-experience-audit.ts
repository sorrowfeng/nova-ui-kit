// The editor-experience audit checklist, as pure data.
//
// Extracted from BuilderShowcase.tsx (phase 1 of docs/monolith-decomposition.md).
// Split into four domain slices (phase 3): this file is now only the composer.
// Each slice owns the flags it reads and nothing else, so a slice can be read
// or moved without knowing what the other three are doing.
//
// Inputs come in as one snapshot for now. Phase 2 narrows the snapshot per domain
// so a builder that only audits the project tree cannot see canvas state at all.
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { EditorExperienceAuditItem } from "./monolith-module";
import type { EditorExperienceAuditSeverity } from "./status-labels";
import { buildChromeAuditItems } from "./editor-experience-audit-chrome";
import { buildCodeAuditItems } from "./editor-experience-audit-code";
import { buildProjectAuditItems } from "./editor-experience-audit-project";
import { buildSurfaceAuditItems, formatCanvasZoom } from "./editor-experience-audit-surface";

// Re-exported for the shell chrome, which has always imported it from here.
export { formatCanvasZoom };
export type EditorExperienceAuditSnapshot = Record<string, any>;

export function buildEditorExperienceAuditItems(s: EditorExperienceAuditSnapshot): EditorExperienceAuditItem[] {
  return [
    ...buildSurfaceAuditItems(s),
    ...buildCodeAuditItems(s),
    ...buildProjectAuditItems(s),
    ...buildChromeAuditItems(s),
  ];
}

/**
 * The severity of a requirement backed by several pieces of evidence.
 *
 * Order is worst-first and the middle two are not interchangeable: `warning`
 * means a check ran and fell short, `unverified` means it could not run. A
 * requirement with one failing check and five that never ran is `fail`, not
 * `unverified` — an empty canvas must not hide a real gap behind it.
 *
 * An unknown evidence id resolves to `warning` rather than `pass`. A typo in an
 * evidence list should look suspicious, not clean.
 */
export function worstAuditSeverity(
  evidenceIds: string[],
  severityOf: (id: string) => EditorExperienceAuditSeverity | undefined,
): EditorExperienceAuditSeverity {
  const severities = evidenceIds.map((id) => severityOf(id) ?? "warning");
  if (severities.includes("fail")) {
    return "fail";
  }
  if (severities.includes("warning")) {
    return "warning";
  }
  if (severities.includes("unverified")) {
    return "unverified";
  }
  return "pass";
}
