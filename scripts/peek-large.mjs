import fs from "node:fs";
const lines = fs.readFileSync("src/components/showcase/BuilderShowcase.tsx", "utf8").split(/\r?\n/);
console.log("total", lines.length);

// Find large contiguous regions by marker density
const marks = [
  ["project-tree", "data-builder-project-workspace"],
  ["canvas-node", "renderCanvasNode"],
  ["canvas-context", "data-builder-canvas-context"],
  ["logic-rust", "data-builder-logic-main-panel"],
  ["build-readiness", "data-builder-readiness"],
  ["inspector", "data-builder-inspector"],
  ["experience-audit", "data-builder-experience-audit"],
  ["left-run", "data-builder-left-run-controls"],
];
for (const [name, marker] of marks) {
  const idxs = [];
  lines.forEach((l, i) => {
    if (l.includes(marker)) idxs.push(i + 1);
  });
  console.log(name, "hits", idxs.length, "range", idxs[0] || "-", idxs[idxs.length - 1] || "-");
}
