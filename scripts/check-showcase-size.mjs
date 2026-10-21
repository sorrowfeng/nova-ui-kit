import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const target = path.join(root, "src", "components", "showcase", "BuilderShowcase.tsx");
const MAX_LINES = 20500; // P2-9: 52021 -> 20299 after extracting views, item preview, view-helpers, module scope and the shell chrome. At the 2万 target; what remains is the state/event layer.

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
