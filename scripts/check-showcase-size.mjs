import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const target = path.join(root, "src", "components", "showcase", "BuilderShowcase.tsx");
const MAX_LINES = 54500; // raised after ToolchainBanner/P0-P2 features; extract further before growing again

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
