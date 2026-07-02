import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const exePath = path.join(root, "src-tauri", "target", "release", "nova-ui-kit.exe");

function runNpmScript(scriptName) {
  console.log(`\n==> npm run ${scriptName}`);
  const result = spawnSync(npmBin, ["run", scriptName], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    console.error(`Desktop release verification failed while starting ${scriptName}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Desktop release verification failed in ${scriptName} with exit code ${result.status}.`);
    process.exit(result.status ?? 1);
  }
}

runNpmScript("check:builder-runtime");
runNpmScript("check:runtime-contract");
runNpmScript("check:generated-runtime");
runNpmScript("tauri:exe");
runNpmScript("check:desktop-exe");

const stat = fs.statSync(exePath);
console.log(
  `\nDesktop release verification ok: ${exePath} (${stat.size} bytes, ${stat.mtime.toISOString()}).`,
);
