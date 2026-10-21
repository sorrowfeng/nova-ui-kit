#!/usr/bin/env node
// check-version-consistency — package.json, Cargo.toml and tauri.conf.json must agree.
// Usage: node scripts/check-version-consistency.mjs [expected]
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const expected = process.argv[2] ?? null;

function readVersion(file, pick) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    return { file, version: null, error: "missing file" };
  }
  const text = fs.readFileSync(filePath, "utf8");
  try {
    return { file, version: pick(text), error: null };
  } catch (error) {
    return { file, version: null, error: error instanceof Error ? error.message : String(error) };
  }
}

const found = [
  readVersion("package.json", (text) => JSON.parse(text).version),
  readVersion("src-tauri/Cargo.toml", (text) => text.match(/^version\s*=\s*"([^"]+)"/m)?.[1] ?? null),
  readVersion("src-tauri/tauri.conf.json", (text) => JSON.parse(text).version),
];

let failed = false;
for (const entry of found) {
  if (entry.error || entry.version === null) {
    console.error(`check-version: ${entry.file} -> ${entry.error || "no version field"}`);
    failed = true;
    continue;
  }
  console.log(`check-version: ${entry.file} = ${entry.version}`);
}

const versions = found.map((entry) => entry.version).filter(Boolean);
const unique = new Set(versions);
if (unique.size !== 1) {
  console.error(`check-version: manifests disagree (${versions.join(" vs ")})`);
  failed = true;
}

if (expected && versions.some((version) => version !== expected)) {
  console.error(`check-version: expected ${expected}, got ${versions.join(", ")}`);
  failed = true;
}

if (failed) {
  process.exit(1);
}
console.log(`check-version ok: ${versions[0]}`);
