import fs from "node:fs";
const path = "scripts/check-goal-coverage.mjs";
let t = fs.readFileSync(path, "utf8");
const needle = '"check:builder-runtime": "node scripts/check-builder-runtime-smoke.mjs"';
console.log("found", t.includes(needle));
t = t.split(needle).join('"check:builder-runtime"');
fs.writeFileSync(path, t);
console.log("done");
