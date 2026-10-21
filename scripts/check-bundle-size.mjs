#!/usr/bin/env node
// check-bundle-size — P2-11: keep every application chunk under 1 MB raw.
// Usage: node scripts/check-bundle-size.mjs [--dir dist]
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const dirIndex = args.indexOf("--dir");
const distDir = path.resolve(process.cwd(), dirIndex >= 0 ? args[dirIndex + 1] : "dist");

// The budget is on raw bytes so it stays meaningful before gzip and does not
// shift with compressor settings. Vendor chunks are reported but not gated.
const MAX_RAW_BYTES = 1024 * 1024;

function fail(message) {
  console.error(`check-bundle-size: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(distDir)) {
  fail(`missing ${distDir}. Run \`npm run build\` first.`);
}

const assetsDir = path.join(distDir, "assets");
const assetRoot = fs.existsSync(assetsDir) ? assetsDir : distDir;
const entries = fs.readdirSync(assetRoot).filter((name) => name.endsWith(".js"));

if (entries.length === 0) {
  fail(`no .js assets found in ${assetRoot}`);
}

const rows = entries
  .map((name) => {
    const bytes = fs.statSync(path.join(assetRoot, name)).size;
    return { name, bytes, vendor: name.startsWith("vendor-") };
  })
  .sort((a, b) => b.bytes - a.bytes);

let failed = false;
for (const row of rows) {
  const kb = (row.bytes / 1024).toFixed(1).padStart(8);
  const mark = row.vendor ? "  (vendor, not gated)" : row.bytes > MAX_RAW_BYTES ? "  OVER BUDGET" : "";
  console.log(`check-bundle-size: ${kb} kB  ${row.name}${mark}`);
  if (!row.vendor && row.bytes > MAX_RAW_BYTES) {
    failed = true;
  }
}

const appChunks = rows.filter((row) => !row.vendor);
const largest = appChunks[0];
if (largest) {
  console.log(
    `check-bundle-size: largest application chunk ${largest.name} at ${(largest.bytes / 1024).toFixed(1)} kB (budget ${(MAX_RAW_BYTES / 1024).toFixed(0)} kB).`,
  );
}

if (failed) {
  fail(`an application chunk exceeds ${(MAX_RAW_BYTES / 1024).toFixed(0)} kB. Split it with lazy import() boundaries.`);
}
console.log(`check-bundle-size ok: ${appChunks.length} application chunks within budget.`);
