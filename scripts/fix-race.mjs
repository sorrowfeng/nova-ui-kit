import fs from "node:fs";

const path = "scripts/check-builder-runtime-smoke.mjs";
let t = fs.readFileSync(path, "utf8");

// Fix the design+expand race: click design first, pause, then expand.
const old = `  await evaluate(
    send,
    \`(() => {
      document.querySelector('[data-builder-mode-button="design"]')?.click();
      document.querySelector("[data-builder-right-dock-expand]")?.click();
      return true;
    })()\`,
  );`;

const neu = `  await evaluate(send, \`document.querySelector('[data-builder-mode-button="design"]')?.click(); true\`);
  await delay(300);
  await evaluate(send, \`document.querySelector("[data-builder-right-dock-expand]")?.click(); true\`);
  await delay(300);`;

if (t.includes(old)) {
  t = t.replace(old, neu);
  fs.writeFileSync(path, t);
  console.log("design/expand race fixed");
} else {
  console.log("pattern not found");
}
