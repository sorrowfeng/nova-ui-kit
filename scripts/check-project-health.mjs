import fs from "node:fs";

// Project health check (workflow: 崩溃恢复与项目健康检查)
// Validates .nova / nova.project.json integrity and prints a JSON report.

const rootArg = process.argv[2];
if (!rootArg) {
  console.error("Usage: node scripts/check-project-health.mjs <project-root>");
  process.exit(2);
}

const root = rootArg;
const issues = [];
const warnings = [];
const info = [];

function exists(rel) {
  return fs.existsSync(`${root}/${rel}`);
}

function readJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(`${root}/${rel}`, "utf8"));
  } catch (error) {
    issues.push(`${rel}: invalid JSON (${error.message})`);
    return null;
  }
}

// 1) Manifest
const manifestPath = "nova.project.json";
if (!exists(manifestPath)) {
  issues.push("missing nova.project.json");
} else {
  const project = readJson(manifestPath);
  if (project) {
    const version = project.schemaVersion ?? 0;
    info.push(`schemaVersion=${version}`);
    if (version > 1) warnings.push(`schemaVersion ${version} is newer than supported 1`);
    if (!project.name) warnings.push("project.name is empty");
    if (!Array.isArray(project.files)) issues.push("project.files is missing or not an array");
    else info.push(`files=${project.files.length}`);
    if (project.rustCommands != null && !Array.isArray(project.rustCommands)) {
      issues.push("project.rustCommands must be an array");
    }
  }
}

// 2) Editor state
if (exists(".nova/editor-state.json")) {
  readJson(".nova/editor-state.json");
  info.push("editor-state present");
} else {
  warnings.push(".nova/editor-state.json missing (will be recreated)");
}

// 3) Workspace metadata
if (exists(".nova/workspace.json")) {
  readJson(".nova/workspace.json");
} else {
  warnings.push(".nova/workspace.json missing");
}

// 4) Core project dirs
for (const dir of ["ui", "rust", ".nova"]) {
  if (!exists(dir)) warnings.push(`missing directory ${dir}/`);
}

// 5) rust/logic.rs
if (exists("rust/logic.rs")) {
  const logic = fs.readFileSync(`${root}/rust/logic.rs`, "utf8");
  if (logic.trim().length === 0) warnings.push("rust/logic.rs is empty");
  info.push(`logic.rs bytes=${logic.length}`);
} else {
  warnings.push("rust/logic.rs missing");
}

// 6) Checkpoints dir sanity
if (exists(".nova/checkpoints")) {
  const entries = fs.readdirSync(`${root}/.nova/checkpoints`).filter((n) => !n.startsWith("."));
  info.push(`checkpoints=${entries.length}`);
}

const report = {
  root,
  ok: issues.length === 0,
  issues,
  warnings,
  info,
};

console.log(JSON.stringify(report, null, 2));
process.exit(issues.length === 0 ? 0 : 1);
