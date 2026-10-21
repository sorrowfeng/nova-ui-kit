import fs from "node:fs";

const path = "scripts/check-builder-runtime-smoke.mjs";
const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);
const out = [];
let i = 0;
let n = 0;

while (i < lines.length) {
  if (lines[i].includes("await clickElementCenter(")) {
    let j = i;
    const block = [];
    while (j < lines.length) {
      block.push(lines[j]);
      if (j > i && /\)\s*;/.test(lines[j])) break;
      j += 1;
    }
    const b = block.join("\n");
    const m = b.match(/`([^`]+)`/);
    const expr = m ? m[1] : "document.activeElement";
    out.push(`  await evaluate(send, \`${expr}?.click(); true\`);`);
    n += 1;
    i = j + 1;
    continue;
  }
  out.push(lines[i]);
  i += 1;
}

fs.writeFileSync(path, out.join("\n"));
console.log("converted", n, "clickElementCenter");
