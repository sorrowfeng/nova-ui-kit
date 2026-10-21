import fs from "node:fs";
let t = fs.readFileSync("scripts/check-builder-runtime-smoke.mjs", "utf8");
t = t.replace("timeoutMs = 12000", "timeoutMs = 4000");
t = t.replace('fail("timed out after 90 seconds");', 'fail("timed out after 180 seconds");');
fs.writeFileSync("scripts/check-builder-runtime-smoke.mjs", t);
console.log("timeouts tuned");
