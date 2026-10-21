import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const target = path.join(root, "src", "components", "showcase", "BuilderShowcase.tsx");
const MAX_LINES = 20000; // P2-9 target: 2万 lines. 52021 -> 19859 after extracting the five mode views, item preview, view-helpers, module scope, the shell chrome and three pure project-file builders. What remains is the state/event layer.

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
