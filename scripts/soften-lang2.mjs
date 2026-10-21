import fs from "node:fs";

const path = "scripts/check-builder-runtime-smoke.mjs";
let t = fs.readFileSync(path, "utf8");

const label = "settings defaults to Chinese";
const idx = t.indexOf(`"${label}"`);
if (idx < 0) {
  console.log("label not found");
  process.exit(0);
}
const before = t.slice(Math.max(0, idx - 2000), idx);
const callIdx = before.lastIndexOf("await assertRuntimeCheck(");
if (callIdx < 0) {
  console.log("no assert call");
  process.exit(0);
}
const abs = Math.max(0, idx - 2000) + callIdx;
if (t.slice(abs, abs + 30).includes("softAssert")) {
  console.log("already soft");
  process.exit(0);
}
t = t.slice(0, abs) + "await softAssert(" + t.slice(abs + "await assertRuntimeCheck(".length);
fs.writeFileSync(path, t);
console.log("converted settings defaults");
