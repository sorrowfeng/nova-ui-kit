import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const target = path.join(root, "src", "components", "showcase", "BuilderShowcase.tsx");
const MAX_LINES = 18760; // P2-9 target: 2万 lines. 52021 -> 19859 after extracting the five mode views, item preview, view-helpers, module scope, the shell chrome and three pure project-file builders. What remains is the state/event layer. Phase 0 of docs/monolith-decomposition.md then dropped the dead weight (unused imports, unused scope keys, unreachable handlers): 19938 -> 19544. Phase 1 moved the 1037-line editor-experience audit checklist into builder/editor-experience-audit.ts: 19544 -> 18802. Phase 2 then dropped scope-literal keys nothing reads (18802 -> 18789) — including window.name, which rode through the untyped bag under the plain key `name`. Phase 3 deleted the unreachable halves of buildActiveProject/bundleActiveProject and wired the git conflict editor (18790 -> 18726). The limit sits just above the achieved value on purpose — a modest feature addition still fits, a large one has to pay for itself by extracting.

if (!fs.existsSync(target)) {
  console.error("check-showcase-size: missing BuilderShowcase.tsx");
  process.exit(1);
}

const text = fs.readFileSync(target, "utf8");
const lines = text.split(/\r?\n/).length;
const bytes = text.length;

if (lines > MAX_LINES) {
  console.error(
    `check-showcase-size: BuilderShowcase.tsx grew to ${lines} lines (limit ${MAX_LINES}). Extract modules into src/components/showcase/builder/ instead of adding to the monolith.`,
  );
  process.exit(1);
}

console.log(`check-showcase-size ok: ${lines} lines / ${bytes} bytes (limit ${MAX_LINES}).`);
