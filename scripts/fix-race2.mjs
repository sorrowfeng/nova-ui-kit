import fs from "node:fs";

const path = "scripts/check-builder-runtime-smoke.mjs";
const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);

// Replace lines 591-598 (0-based 590-597) with two-step click
const replacement = [
  "  await evaluate(send, `document.querySelector('[data-builder-mode-button=\"design\"]')?.click(); true`);",
  "  await delay(350);",
  "  await evaluate(send, `document.querySelector(\"[data-builder-right-dock-expand]\")?.click(); true`);",
  "  await delay(350);",
];

const out = [...lines.slice(0, 590), ...replacement, ...lines.slice(598)];
fs.writeFileSync(path, out.join("\n"));
console.log("replaced 591-598");
