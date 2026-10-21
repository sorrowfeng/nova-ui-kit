#!/usr/bin/env node
// Watch contract checks on src / src-tauri changes (workflow: check:watch).
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const watchDirs = [
  path.join(root, "src"),
  path.join(root, "src-tauri", "src"),
  path.join(root, "scripts"),
];

let running = false;
let queued = false;

function runChecks(scope) {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  console.log(`[check:watch] running (${scope})…`);
  const child = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "build"],
    { cwd: root, stdio: "inherit", shell: process.platform === "win32" },
  );
  child.on("exit", (code) => {
    console.log(`[check:watch] build exit ${code}`);
    running = false;
    if (queued) {
      queued = false;
      runChecks("queued");
    }
  });
}

console.log("[check:watch] watching src, src-tauri/src, scripts");
console.log("[check:watch] runs npm run build on change (components/experience/size/tsc/vite)");

for (const dir of watchDirs) {
  if (!fs.existsSync(dir)) continue;
  fs.watch(dir, { recursive: true }, (event, filename) => {
    if (!filename) return;
    if (!/\.(tsx?|mjs|rs|css)$/.test(filename)) return;
    if (filename.includes("node_modules") || filename.includes("dist") || filename.includes("target")) return;
    runChecks(filename);
  });
}

// initial run
runChecks("startup");
