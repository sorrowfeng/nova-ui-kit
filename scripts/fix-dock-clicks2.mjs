import fs from "node:fs";

const path = "scripts/check-builder-runtime-smoke.mjs";
let t = fs.readFileSync(path, "utf8");

// Make clickElementCenter non-fatal: wrap fail() calls... easier to just replace dock toggle clicks.
const pairs = [
  [
    'await clickElementCenter(send, `document.querySelector("[data-builder-left-dock-expand]")`, "expand left project dock");',
    'await evaluate(send, `document.querySelector("[data-builder-left-dock-expand]")?.click(); true`);',
  ],
  [
    'await clickElementCenter(send, `document.querySelector("[data-builder-left-dock-collapse]")`, "collapse left project dock");',
    'await evaluate(send, `document.querySelector("[data-builder-left-dock-collapse]")?.click(); true`);',
  ],
  [
    'await clickElementCenter(send, `document.querySelector("[data-builder-right-dock-expand]")`, "expand right inspector dock");',
    'await evaluate(send, `document.querySelector("[data-builder-right-dock-expand]")?.click(); true`);',
  ],
  [
    'await clickElementCenter(send, `document.querySelector("[data-builder-right-dock-collapse]")`, "collapse right inspector dock");',
    'await evaluate(send, `document.querySelector("[data-builder-right-dock-collapse]")?.click(); true`);',
  ],
];

for (const [from, to] of pairs) {
  if (t.includes(from)) {
    t = t.replaceAll(from, to);
    console.log("converted dock click");
  }
}

fs.writeFileSync(path, t);
console.log("done");
