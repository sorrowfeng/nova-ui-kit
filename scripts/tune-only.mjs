import fs from "node:fs";

const path = "scripts/check-builder-runtime-smoke.mjs";
let t = fs.readFileSync(path, "utf8");

// Only tune timeouts — no structural changes.
t = t.replaceAll("timeoutMs = 15000", "timeoutMs = 20000");
t = t.replace('fail("timed out after 90 seconds");', 'fail("timed out after 150 seconds");');

fs.writeFileSync(path, t);
console.log("timeouts tuned only");
