#!/usr/bin/env node
// update-changelog — prepend a version section to CHANGELOG.md from the commit range.
// Usage: node scripts/update-changelog.mjs <version> [--since-tag <tag>] [--dry-run]
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const sinceTagIndex = args.indexOf("--since-tag");
const sinceTag = sinceTagIndex >= 0 ? args[sinceTagIndex + 1] : null;
const version = args.filter((arg, index) => {
  const prev = args[index - 1];
  return !arg.startsWith("--") && prev !== "--since-tag";
})[0];

const CHANGELOG = path.join(root, "CHANGELOG.md");
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

function fail(message) {
  console.error(`update-changelog: ${message}`);
  process.exit(1);
}

function git(command) {
  return execSync(`git ${command}`, { cwd: root, encoding: "utf8" }).trim();
}

function classify(subject) {
  const lower = subject.toLowerCase();
  if (/^feat|^add|新增|支持/.test(lower)) return "features";
  if (/^fix|修复/.test(lower)) return "fixes";
  if (/^docs|文档|readme/.test(lower)) return "docs";
  if (/^refactor|拆分|抽取|架构/.test(lower)) return "refactor";
  if (/^test|测试|check|契约/.test(lower)) return "quality";
  return "other";
}

if (!version) {
  fail(`missing version argument.\nUsage: node scripts/update-changelog.mjs <version> [--since-tag <tag>] [--dry-run]`);
}
if (!SEMVER.test(version)) {
  fail(`"${version}" is not a valid semver`);
}

const range = sinceTag ? `${sinceTag}..HEAD` : null;
const log = range
  ? git(`log ${range} --pretty=format:%s`)
  : git(`log -n 200 --pretty=format:%s`);
const subjects = log.split("\n").map((line) => line.trim()).filter(Boolean);

const groups = { features: [], fixes: [], refactor: [], quality: [], docs: [], other: [] };
for (const subject of subjects) {
  groups[classify(subject)].push(subject);
}

const sectionTitles = {
  features: "Features",
  fixes: "Fixes",
  refactor: "Refactor / Architecture",
  quality: "Quality & Checks",
  docs: "Docs",
  other: "Other",
};

const today = new Date().toISOString().slice(0, 10);
const lines = [`## ${version} — ${today}`, ""];
for (const [key, title] of Object.entries(sectionTitles)) {
  if (groups[key].length === 0) continue;
  lines.push(`### ${title}`, "");
  for (const subject of groups[key]) {
    lines.push(`- ${subject}`);
  }
  lines.push("");
}
const section = lines.join("\n");

const header = "# Changelog\n\nAll notable changes to Nova UI Kit are recorded here.\n\n";
const existing = fs.existsSync(CHANGELOG) ? fs.readFileSync(CHANGELOG, "utf8") : "";
const body = existing || header;

if (body.includes(`## ${version} —`)) {
  console.log(`update-changelog: ${version} already present; nothing to do.`);
  process.exit(0);
}

// Insert the new section directly after the document title block.
let next;
const titleEnd = body.indexOf("\n## ");
if (titleEnd === -1) {
  next = `${body.trimEnd()}\n\n${section}`;
} else {
  next = `${body.slice(0, titleEnd + 1)}\n${section}\n${body.slice(titleEnd + 1).replace(/^\n+/, "")}`;
}

if (dryRun) {
  console.log(section);
  console.log(`update-changelog: would write ${next.length} bytes to CHANGELOG.md`);
  process.exit(0);
}

fs.writeFileSync(CHANGELOG, next, "utf8");
console.log(`update-changelog: prepended ${version} (${subjects.length} commits) to CHANGELOG.md`);
