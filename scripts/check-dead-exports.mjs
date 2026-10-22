// check-dead-exports — ratchet on unreferenced export surface.
//
// `noUnusedLocals` cannot see a dead export: the export IS a use. That blind
// spot is how five modules with no importer (and CanvasContextMenu.tsx, an
// orphaned duplicate of a live component) sat in the tree with the smoke green
// — the smoke measures whether behaviour exists, not whether the code that
// provides it is reachable.
//
// This does not delete anything. It pins the current count so the surface
// cannot grow quietly, the same bargain as check-builder-file-size: a ratchet's
// job is to make growth visible, not to make growth impossible. Shrinking is
// the work; not growing is the gate.
//
// Scoped to src/components/showcase/. src/components/ui/ is the component kit,
// whose export surface is its API — ButtonProps and buttonVariants are unused
// here and still the point of the file.
//
// Self-checked before it counts: a fixture with one imported export and one
// orphan must classify both exactly. A counter that reports nothing is
// indistinguishable from one that sees nothing.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const SCAN_DIR = path.join(root, "src", "components", "showcase");
const CEILING = 220; // measured 2026-10-23. Lower it whenever an export is deleted.

const FIXTURE = `
export type OrphanType = { a: number };
export function orphanFn() { return 1; }
export const orphanConst = 2;
export type UsedType = { b: number };
export function usedFn() { return 3; }
`;
const FIXTURE_CONSUMER = `
import type { UsedType } from "./fixture";
import { usedFn } from "./fixture";
export const consumer: UsedType = { b: usedFn() };
`;

const EXPECT_DEAD_FIXTURE = ["OrphanType", "orphanFn", "orphanConst"];
const EXPECT_LIVE_FIXTURE = ["UsedType", "usedFn"];

function listFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.ts$/.test(entry.name)) out.push(full);
  }
  return out;
}

function parse(file, text) {
  return ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function exportNames(sf) {
  const names = new Set();
  const visit = (node) => {
    if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
      for (const el of node.exportClause.elements) names.add(el.name.text);
    }
    if (ts.isExportAssignment(node)) names.add("default");
    const isExported = (node.modifiers || []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (isExported) {
      if (ts.isVariableStatement(node)) {
        for (const d of node.declarationList.declarations) {
          if (ts.isIdentifier(d.name)) names.add(d.name.text);
        }
      } else if (node.name && ts.isIdentifier(node.name)) {
        names.add(node.name.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return names;
}

/** Names consumed elsewhere: import bindings and `export { x } from` clauses. */
function consumedNames(sf) {
  const names = new Set();
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && node.importClause) {
      const c = node.importClause;
      if (c.name) names.add(c.name.text);
      if (c.namedBindings) {
        if (ts.isNamedImports(c.namedBindings)) {
          for (const el of c.namedBindings.elements) names.add(el.name.text);
        } else {
          names.add(c.namedBindings.name.text);
        }
      }
    }
    // A bare `export { x }` re-exports a local and consumes nothing — counting
    // it would mark every re-export as used.
    if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      node.exportClause &&
      ts.isNamedExports(node.exportClause)
    ) {
      for (const el of node.exportClause.elements) names.add(el.name.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return names;
}

function collect(files, readText) {
  const exported = new Map();
  const consumed = new Set();
  for (const file of files) {
    const text = readText(file);
    const sf = parse(file, text);
    exported.set(file, exportNames(sf));
    for (const name of consumedNames(sf)) consumed.add(name);
  }
  return { exported, consumed };
}

// Check scripts reference a few symbols by name in assertions; that counts as
// use, and the plan doc says three symbols live only there.
const scriptWords = new Set();
for (const file of listFiles(path.join(root, "scripts"))) {
  if (!/\.mjs$/.test(file)) continue;
  for (const match of fs.readFileSync(file, "utf8").matchAll(/[A-Za-z_$][\w$]*/g)) scriptWords.add(match[0]);
}

// --- self-check ---
const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "nova-dead-exports-"));
try {
  const fixtureFile = path.join(fixtureDir, "fixture.ts");
  const consumerFile = path.join(fixtureDir, "consumer.ts");
  fs.writeFileSync(fixtureFile, FIXTURE, "utf8");
  fs.writeFileSync(consumerFile, FIXTURE_CONSUMER, "utf8");
  const probe = collect([fixtureFile, consumerFile], (f) => fs.readFileSync(f, "utf8"));
  const problems = [];
  for (const name of EXPECT_DEAD_FIXTURE) {
    if (!probe.exported.get(fixtureFile)?.has(name)) problems.push(`fixture: ${name} was not seen as exported`);
    else if (probe.consumed.has(name)) problems.push(`fixture: ${name} should be dead but is marked consumed`);
  }
  for (const name of EXPECT_LIVE_FIXTURE) {
    if (!probe.exported.get(fixtureFile)?.has(name)) problems.push(`fixture: ${name} was not seen as exported`);
    else if (!probe.consumed.has(name)) problems.push(`fixture: ${name} should be live but is not consumed`);
  }
  if (problems.length > 0) {
    console.error("check-dead-exports: the classifier is blind — refusing to trust a count");
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }
  console.log("check-dead-exports: classifier self-check ok (2 dead, 2 live shapes)");
} finally {
  fs.rmSync(fixtureDir, { recursive: true, force: true });
}

// --- the real count ---
const files = listFiles(SCAN_DIR);
const { exported, consumed } = collect(files, (f) => fs.readFileSync(f, "utf8"));
const orphans = [];
for (const [file, names] of exported) {
  for (const name of names) {
    if (!consumed.has(name) && !scriptWords.has(name)) {
      orphans.push({ file: path.relative(root, file).split(path.sep).join("/"), name });
    }
  }
}

if (orphans.length > CEILING) {
  console.error(
    `check-dead-exports: ${orphans.length} unreferenced export(s) in src/components/showcase (ceiling ${CEILING}).`,
  );
  console.error(`  Delete the export or use it. New over the ceiling by ${orphans.length - CEILING}:`);
  for (const orphan of orphans) console.error(`    ${orphan.file}: ${orphan.name}`);
  process.exit(1);
}
console.log(
  `check-dead-exports ok: ${orphans.length} unreferenced export(s) in ${files.length} file(s) (ceiling ${CEILING} — delete some and lower the ceiling).`,
);
