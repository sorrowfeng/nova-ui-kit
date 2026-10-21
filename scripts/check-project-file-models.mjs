import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const entry = path.join(here, "project-file-models.test.ts");
const outDir = path.join(here, ".test-out");
const outfile = path.join(outDir, "project-file-models.test.mjs");

if (!fs.existsSync(entry)) {
  console.error("check-project-file-models: missing test entry", entry);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const result = await esbuild.build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node18",
  sourcemap: "inline",
  logLevel: "silent",
  absWorkingDir: root,
});

if (result.errors.length > 0) {
  console.error("check-project-file-models: esbuild failed");
  for (const err of result.errors) console.error(err.text);
  process.exit(1);
}

const run = spawnSync(process.execPath, [outfile], { stdio: "inherit", cwd: root });
process.exit(run.status ?? 1);
