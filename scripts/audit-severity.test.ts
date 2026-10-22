// How a requirement's severity is derived from its evidence.
//
// This aggregation is where a scoreboard silently lies. Before "unverified"
// existed, a check that could not run was folded into "warning" and the Qt
// Creator matrix read "8 复核" on a fresh project — implying eight capability
// gaps that were really eight empty-canvas preconditions. The order below is
// the whole fix, so the order gets pinned here.
import assert from "node:assert/strict";
import { worstAuditSeverity } from "../src/components/showcase/builder/editor-experience-audit";
import { editorExperienceAuditSeverityLabel } from "../src/components/showcase/builder/status-labels";
import type { EditorExperienceAuditSeverity } from "../src/components/showcase/builder/status-labels";

const of =
  (table: Record<string, EditorExperienceAuditSeverity>) =>
  (id: string): EditorExperienceAuditSeverity | undefined =>
    table[id];

{
  assert.equal(worstAuditSeverity([], of({})), "pass");
  assert.equal(worstAuditSeverity(["a"], of({ a: "pass" })), "pass");
  assert.equal(worstAuditSeverity(["a", "b"], of({ a: "pass", b: "pass" })), "pass");
}

// A check that never ran is not a check that passed.
{
  assert.equal(worstAuditSeverity(["a"], of({ a: "unverified" })), "unverified");
  assert.equal(worstAuditSeverity(["a", "b"], of({ a: "pass", b: "unverified" })), "unverified");
}

// A known gap outranks an unrun check. An empty canvas must not be able to
// hide a real failure behind "we could not tell".
{
  assert.equal(worstAuditSeverity(["a", "b"], of({ a: "unverified", b: "warning" })), "warning");
  assert.equal(worstAuditSeverity(["a", "b"], of({ a: "unverified", b: "fail" })), "fail");
  assert.equal(worstAuditSeverity(["a", "b", "c"], of({ a: "pass", b: "unverified", c: "fail" })), "fail");
  assert.equal(
    worstAuditSeverity(["a", "b", "c", "d"], of({ a: "unverified", b: "unverified", c: "unverified", d: "warning" })),
    "warning",
  );
}

// Full house: the worst of each class wins regardless of order.
{
  const mixed = { pass: "pass", unv: "unverified", warn: "warning", bad: "fail" } as const;
  assert.equal(worstAuditSeverity(["bad", "unv", "pass"], of(mixed)), "fail");
  assert.equal(worstAuditSeverity(["unv", "pass", "warn"], of(mixed)), "warning");
  assert.equal(worstAuditSeverity(["pass", "unv"], of(mixed)), "unverified");
}

// An evidence id nothing produces is suspicious, not clean. Resolving it to
// "pass" would make a typo'd id read as a verified capability.
{
  assert.equal(worstAuditSeverity(["ghost"], of({})), "warning");
  assert.equal(worstAuditSeverity(["real", "ghost"], of({ real: "pass" })), "warning");
}

// The label lookup is a total Record, so a new severity without a label is a
// compile error rather than a blank panel. Asserted anyway because a renamed
// label is a user-visible change nobody would notice in review.
{
  assert.equal(editorExperienceAuditSeverityLabel("pass"), "通过");
  assert.equal(editorExperienceAuditSeverityLabel("unverified"), "待验证");
  assert.equal(editorExperienceAuditSeverityLabel("warning"), "提醒");
  assert.equal(editorExperienceAuditSeverityLabel("fail"), "阻塞");
}

console.log("audit-severity ok: worst-of-evidence ordering and the unverified label hold");
