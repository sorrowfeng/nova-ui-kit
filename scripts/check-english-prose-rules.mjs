// Regression tests for the English-prose detector itself.
//
// A detector that quietly stops detecting is worse than none: the gate prints
// ok and nobody notices the chrome drifted back to English. These cases pin the
// two directions that matter — real prose must be caught, names and code must
// not — so a change to the filters has to survive a list of known inputs.
import { ALLOWED_PROSE, findEnglishProse } from "./check-english-prose.mjs";

/** Strings the detector must flag as untranslated English prose. */
const MUST_CATCH = [
  "Queue is paused. Resume it before continuing queued work.",
  "The related UI file is active.",
  "Sample payload",
  "Request schema",
  "Left edges",
  "Enabled Rust module",
];

/** Strings the detector must leave alone: names, identifiers and code. */
const MUST_MISS = [
  "已完成", // Chinese carries the meaning
  "状态待生成", // Chinese with a signal suffix
  "MainWindow.ui", // file name
  "rust/logic.rs", // path
  "#[tauri::command]", // macro
  "statusText", // camelCase field name
  "TEXT_ITEM", // SCREAMING_CASE member
  "logic.rs:12", // file and line
  "cargo build", // shell command
  "fn save_project(input: SaveInput) -> Result<String, String>", // Rust source
  'input, textarea, select, [contenteditable="true"]', // CSS selector list
  "size-3 transition-transform group-open:rotate-90", // Tailwind utilities
  "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif", // font stack
  "hsl(259 100% 48%)", // CSS colour
  "Ctrl Shift B", // key chord
  "Spin Box", // component type name, on the allowlist
];

/**
 * Prose-shaped and NOT on the allowlist. The detector has to flag this one:
 * a detector that only ever agrees with the allowlist cannot lose, and a gate
 * that cannot lose is not a gate.
 */
const MUST_CATCH_UNFAMILIAR = ["Sego UI font", "Please select a directory first."];

const failures = [];

for (const text of MUST_CATCH) {
  const hits = findEnglishProse(`const x = ${JSON.stringify(text)};`, "probe.tsx");
  if (hits.length === 0) failures.push(`should have caught ${JSON.stringify(text)}`);
}

for (const text of MUST_CATCH_UNFAMILIAR) {
  const hits = findEnglishProse(`const x = ${JSON.stringify(text)};`, "probe.tsx");
  if (hits.length === 0) failures.push(`detector stopped catching unfamiliar prose: ${JSON.stringify(text)}`);
}

for (const text of MUST_MISS) {
  const hits = findEnglishProse(`const x = ${JSON.stringify(text)};`, "probe.tsx");
  if (hits.length > 0) failures.push(`should have ignored ${JSON.stringify(text)} but reported ${JSON.stringify(hits[0].text)}`);
}

// An allowlist entry with no reason makes the list a junk drawer.
for (const [text, reason] of ALLOWED_PROSE) {
  if (typeof reason !== "string" || reason.trim().length < 8) {
    failures.push(`allowlist entry ${JSON.stringify(text)} needs a reason`);
  }
}

if (failures.length > 0) {
  console.error("check-english-prose-rules failed:");
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log(
  `check-english-prose-rules ok: ${MUST_CATCH.length + MUST_CATCH_UNFAMILIAR.length} must catch, ` +
    `${MUST_MISS.length} must miss, ${ALLOWED_PROSE.size} allowlist entries each carry a reason`,
);
