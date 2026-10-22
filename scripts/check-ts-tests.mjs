// Runs every scripts/*.test.ts. One entry point for the TypeScript unit tests
// so a new domain gets a file instead of borrowing a neighbour's — a test
// named after the wrong domain is a test nobody trusts.
//
// Each entry is bundled with esbuild (the sources are TS/TSX with path imports
// that plain node cannot load) and executed as its own process, so a failing
// suite cannot be mistaken for a passing one and one suite cannot leak state
// into the next.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const outDir = path.join(here, ".test-out");

const entries = fs
  .readdirSync(here)
  .filter((name) => name.endsWith(".test.ts"))
  .sort();

if (entries.length === 0) {
  console.error("check-ts-tests: no scripts/*.test.ts found");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

let failed = 0;
for (const entry of entries) {
  const outfile = path.join(outDir, entry.replace(/\.ts$/, ".mjs"));
  // esbuild throws on a build failure rather than only filling result.errors.
  // Caught here so the suite name is printed instead of a stack trace.
  try {
    const result = await esbuild.build({
      entryPoints: [path.join(here, entry)],
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
      console.error(`check-ts-tests: esbuild failed for ${entry}`);
      for (const err of result.errors) console.error(err.text);
      failed += 1;
      continue;
    }
  } catch (error) {
    console.error(`check-ts-tests: esbuild failed for ${entry}`);
    for (const err of error?.errors ?? []) console.error(err.text);
    if (!(error?.errors ?? []).length) console.error(String(error?.message ?? error));
    failed += 1;
    continue;
  }

  const run = spawnSync(process.execPath, [outfile], { stdio: "inherit", cwd: root });
  if (run.status !== 0) {
    console.error(`check-ts-tests: ${entry} failed`);
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`check-ts-tests: ${failed}/${entries.length} suite(s) failed`);
  process.exit(1);
}
console.log(`check-ts-tests ok: ${entries.length} suite(s) passed`);
