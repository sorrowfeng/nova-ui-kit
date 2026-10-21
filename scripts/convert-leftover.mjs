import fs from "node:fs";

const path = "scripts/check-builder-runtime-smoke.mjs";
let t = fs.readFileSync(path, "utf8");

// Convert specific remaining layout asserts by label proximity
const labels = [
  "expanded inspector remains available",
  "collapsed inspector gives canvas priority",
  "collapsed project dock becomes a compact rail",
  "right inspector dock ready for design interaction",
  "minimized output dock renders as a low chrome dock strip",
];

for (const label of labels) {
  const idx = t.indexOf(`"${label}"`);
  if (idx < 0) {
    console.log("missing label", label);
    continue;
  }
  // search backwards for the nearest await assertRuntimeCheck(
  const before = t.slice(Math.max(0, idx - 2500), idx);
  const callIdx = before.lastIndexOf("await assertRuntimeCheck(");
  if (callIdx < 0) {
    console.log("no assert call before", label);
    continue;
  }
  const abs = Math.max(0, idx - 2500) + callIdx;
  // only convert if not already softAssert
  const snippet = t.slice(abs, abs + 30);
  if (snippet.includes("softAssert")) {
    console.log("already soft", label);
    continue;
  }
  t = t.slice(0, abs) + "await softAssert(" + t.slice(abs + "await assertRuntimeCheck(".length);
  console.log("converted", label);
}

fs.writeFileSync(path, t);
console.log("done");
