// Shared helpers for Nova check-*.mjs contract scripts (workflow F5).
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

export const root = process.cwd();

export function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

export function readIfExists(relativePath) {
  const full = path.join(root, relativePath);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

export function readBuilderBundle() {
  const builder = "src/components/showcase/BuilderShowcase.tsx";
  const dir = "src/components/showcase/builder";
  const main = read(builder);
  const modules = fs
    .readdirSync(path.join(root, dir))
    .filter((name) => /\.tsx?$/.test(name))
    .map((name) => read(`${dir}/${name}`))
    .join("\n");
  return `${main}\n${modules}`;
}

export function readTypesBundle() {
  const dir = "src/components/showcase/builder";
  return ["types-canvas.ts", "types-project.ts", "types-release.ts", "types.ts"]
    .map((name) => read(`${dir}/${name}`))
    .join("\n");
}

export function readGeneratedRuntimeBundle() {
  const templateDir = "src-tauri/src/generated_templates";
  const parts = [read("src-tauri/src/generated_app_runtime.rs")];
  if (fs.existsSync(path.join(root, templateDir))) {
    parts.push(
      ...fs
        .readdirSync(path.join(root, templateDir))
        .filter((name) => name.endsWith(".rs"))
        .map((name) => read(`${templateDir}/${name}`)),
    );
  }
  return parts.join("\n");
}

export function createChecker() {
  const checks = [];
  const failures = [];
  function addCheck(label, passed, detail) {
    checks.push(label);
    if (!passed) failures.push({ label, detail });
  }
  function mustContain(label, source, needle) {
    addCheck(label, source.includes(needle), `Expected to contain ${needle}`);
  }
  function mustNotContain(label, source, needle) {
    addCheck(label, !source.includes(needle), `Expected not to contain ${needle}`);
  }
  function mustMatch(label, source, pattern) {
    addCheck(label, pattern.test(source), `Expected to match ${pattern}`);
  }
  function report(name) {
    if (failures.length > 0) {
      console.error(`${name} failed: ${failures.length} of ${checks.length} checks failed.`);
      for (const failure of failures) {
        console.error(`  - ${failure.label}`);
        console.error(`    ${failure.detail}`);
      }
      process.exit(1);
    }
    console.log(`${name} ok: ${checks.length} checks.`);
  }
  return { addCheck, mustContain, mustNotContain, mustMatch, report, checks, failures };
}
