#!/usr/bin/env node
// set-version — keep package.json, src-tauri/Cargo.toml and tauri.conf.json in lockstep.
// Usage: node scripts/set-version.mjs 1.2.3 [--dry-run]
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const version = args.filter((arg) => !arg.startsWith("--"))[0];

const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const TARGETS = [
  {
    file: "package.json",
    describe: "npm package version",
    read: (text) => JSON.parse(text).version,
    write: (text, next) => {
      const pkg = JSON.parse(text);
      const updated = { ...pkg, version: next };
      return `${JSON.stringify(updated, null, 2)}\n`;
    },
  },
  {
    file: "src-tauri/Cargo.toml",
    describe: "Cargo package version",
    read: (text) => text.match(/^version\s*=\s*"([^"]+)"/m)?.[1] ?? null,
    write: (text, next) => text.replace(/^version\s*=\s*"[^"]+"/m, `version = "${next}"`),
  },
  {
    file: "src-tauri/tauri.conf.json",
    describe: "Tauri bundle version",
    read: (text) => JSON.parse(text).version,
    write: (text, next) => {
      const conf = JSON.parse(text);
      const updated = { ...conf, version: next };
      return `${JSON.stringify(updated, null, 2)}\n`;
    },
  },
];

function fail(message) {
  console.error(`set-version: ${message}`);
  process.exit(1);
}

if (!version) {
  fail(`missing version argument.\nUsage: node scripts/set-version.mjs <semver> [--dry-run]`);
}
if (!SEMVER.test(version)) {
  fail(`"${version}" is not a valid semver (expected e.g. 1.2.3 or 1.2.3-rc.1)`);
}

const planned = [];
for (const target of TARGETS) {
  const filePath = path.join(root, target.file);
  if (!fs.existsSync(filePath)) {
    fail(`missing ${target.file}`);
  }
  const before = fs.readFileSync(filePath, "utf8");
  const current = target.read(before);
  if (current === null) {
    fail(`could not read ${target.describe} from ${target.file}`);
  }
  planned.push({ target, filePath, before, current, after: target.write(before, version) });
}

const changing = planned.filter((entry) => entry.before !== entry.after);
if (changing.length === 0) {
  console.log(`set-version: already at ${version}; nothing to do.`);
  process.exit(0);
}

for (const entry of changing) {
  const verb = dryRun ? "would update" : "updated";
  console.log(`set-version: ${verb} ${entry.target.file} ${entry.current} -> ${version}`);
}

if (!dryRun) {
  for (const entry of changing) {
    fs.writeFileSync(entry.filePath, entry.after, "utf8");
  }
}
