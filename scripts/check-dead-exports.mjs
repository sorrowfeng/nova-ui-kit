// check-dead-exports — ratchet on unreferenced export surface.
//
// `noUnusedLocals` cannot see a dead export: the export IS a use. That blind
// spot is how five modules with no importer (and CanvasContextMenu.tsx, an
// orphaned duplicate of a live component) sat in the tree with the smoke green
// — the smoke measures whether behaviour exists, not whether the code that
// provides it is reachable.
//
// This does not delete anything. It pins the count at zero: an export that
// nothing imports must not land. It started as a ratchet at 220, and the
// bargain then was the same as check-builder-file-size — a ratchet's job is to
// make growth visible, not to make growth impossible. The stock is now worked
// down, so the gate is simply "no dead exports".
//
// Scoped to src/components/showcase/. src/components/ui/ is the component kit,
// whose export surface is its API — ButtonProps and buttonVariants are unused
// here and still the point of the file.
//
// Consumers are read from the whole of src/ plus scripts/*.mjs. Restricting the
// consumer scan to the export scan is how App.tsx and OnboardingGuide.tsx — the
// two files outside showcase/ that import from it — looked like nobody.
//
// Self-checked before it counts: a fixture that reproduces an in-scan import, a
// relative dynamic import(), an @/ aliased dynamic import() from outside the
// scan dir, and a static import from outside the scan dir must classify all
// four, plus two orphans. A counter that reports nothing is indistinguishable
// from one that sees nothing.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const SRC_DIR = path.join(root, "src");
const SCAN_DIR = path.join(SRC_DIR, "components", "showcase");
// "@/" -> "<root>/src/", the one alias in tsconfig.json's paths.
const ALIASES = [{ prefix: "@/", target: SRC_DIR + path.sep }];
const CEILING = 0; // measured 2026-10-23. The stock is worked down; keep it at zero.

// --- fixture: every shape the classifier must not miss ---
const FIXTURE_SRC = `src`;
const FIXTURE_SHOWCASE = `src/components/showcase`;

const FIXTURE_FILES = {
  [`${FIXTURE_SHOWCASE}/fixture.ts`]: `
export type OrphanType = { a: number };
export function orphanFn() { return 1; }
export const orphanConst = 2;
export type UsedType = { b: number };
export function usedFn() { return 3; }
`,
  // Exports nothing on purpose: this file only exists to consume UsedType and
  // usedFn by name and to hold a relative import(). Anything it exported would
  // show up in the expected orphan set and blur what the fixture is testing.
  [`${FIXTURE_SHOWCASE}/consumer.ts`]: `
import type { UsedType } from "./fixture";
import { usedFn } from "./fixture";
const consumer: UsedType = { b: usedFn() };
const lazyView = () => import("./lazy-target").then((m) => ({ default: m.LazyView }));
void consumer;
void lazyView;
`,
  // Loaded only through import().then(m => m.LazyView) — never an import binding.
  [`${FIXTURE_SHOWCASE}/lazy-target.ts`]: `
export function LazyView() { return null; }
export type LazyOnlyType = { c: number };
`,
  // Reached through the @/ alias from a file outside the scan dir.
  [`${FIXTURE_SHOWCASE}/lazy-alias-target.ts`]: `
export function AliasView() { return null; }
export type AliasOnlyType = { d: number };
`,
  // Static import from outside the scan dir — the OnboardingGuide shape.
  [`${FIXTURE_SHOWCASE}/outside-used.ts`]: `
export const outsideOnly = 4;
`,
  // Outside the export scan dir; must still count as a consumer.
  [`${FIXTURE_SRC}/App.tsx`]: `
import { outsideOnly } from "@/components/showcase/outside-used";
export const aliasLazy = () =>
  import("@/components/showcase/lazy-alias-target").then((m) => ({ default: m.AliasView }));
export const app = outsideOnly + 1;
`,
};

// The exact orphan report the fixture must produce — nothing more, nothing less.
// UsedType/usedFn (in-scan import), outsideOnly (import from outside the scan
// dir) and every export of the two dynamic targets (relative import() and @/
// aliased import()) must NOT appear here.
const EXPECT_ORPHANS = [
  [`${FIXTURE_SHOWCASE}/fixture.ts`, "OrphanType"],
  [`${FIXTURE_SHOWCASE}/fixture.ts`, "orphanFn"],
  [`${FIXTURE_SHOWCASE}/fixture.ts`, "orphanConst"],
];

// `includeTests` is false for export scanning — scripts/*.test.ts are suites,
// not export sources — and true for the word scan, which must see every name a
// gate can pin. Sharing one filter between the two is how the word scan ended
// up reading no .test.ts file at all.
function listFiles(dir, extensions, out = [], includeTests = false) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listFiles(full, extensions, out, includeTests);
      continue;
    }
    if (!extensions.some((ext) => entry.name.endsWith(ext))) continue;
    if (!includeTests && /\.test\.ts$/.test(entry.name)) continue;
    out.push(full);
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

/**
 * Modules loaded via `import("./x")`. `lazy(() => import("./builder/BuildView")
 * .then((m) => ({ default: m.BuildView })))` never names an import binding —
 * it reaches the export through the namespace object, so nothing here looks
 * like a use. Treating those modules as fully consumed is the conservative
 * call: it cannot cause someone to delete a live component.
 */
function dynamicImportSpecifiers(sf) {
  const specifiers = [];
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return specifiers;
}

/** Relative and tsconfig-alias specifiers -> absolute file path, else null. */
function resolveSpecifier(fromFile, specifier, aliases = ALIASES) {
  let base = null;
  if (specifier.startsWith(".")) {
    base = path.resolve(path.dirname(fromFile), specifier);
  } else {
    const alias = aliases.find((a) => specifier.startsWith(a.prefix));
    if (!alias) return null;
    base = path.join(alias.target, specifier.slice(alias.prefix.length));
  }
  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/**
 * The whole scan, in one function. The fixture and the real tree call this same
 * function, so a change to consumer scope or specifier resolution changes the
 * fixture's answer too — which is the only way a self-check can catch it.
 *
 * `srcDir` is both the consumer root and the alias target: consumers come from
 * every .ts/.tsx under it, exports only from `scanRel` inside it. Scanning the
 * export directory for consumers as well is what hid App.tsx and
 * OnboardingGuide.tsx, the two files outside showcase/ that import from it.
 */
function runScan(srcDir, scanRel, aliases, readText, extraConsumedWords = new Set()) {
  const scanDir = path.join(srcDir, scanRel);
  const exportFiles = listFiles(scanDir, [".ts", ".tsx"]);
  const exported = new Map();
  const consumed = new Set();
  const dynamicModules = new Set();

  for (const file of exportFiles) {
    exported.set(file, exportNames(parse(file, readText(file))));
  }
  // Consumers include test files: a suite that imports an export keeps it live.
  for (const file of listFiles(srcDir, [".ts", ".tsx"], [], true)) {
    const sf = parse(file, readText(file));
    for (const name of consumedNames(sf)) consumed.add(name);
    for (const specifier of dynamicImportSpecifiers(sf)) {
      const resolved = resolveSpecifier(file, specifier, aliases);
      if (resolved) dynamicModules.add(resolved);
    }
  }

  const orphans = [];
  for (const [file, names] of exported) {
    if (dynamicModules.has(file)) continue;
    for (const name of names) {
      if (!consumed.has(name) && !extraConsumedWords.has(name)) {
        orphans.push({ file, name });
      }
    }
  }
  return { exportFiles, exported, consumed, dynamicModules, orphans };
}

/** Absolute paths in, repo-relative posix paths out. */
function reportOrphans(orphans, fromDir) {
  return orphans.map((o) => ({ file: path.relative(fromDir, o.file).split(path.sep).join("/"), name: o.name }));
}

// Check scripts and their test suites reference a few symbols by name in
// assertions; that counts as use. STATUS_LABEL_DOMAINS is the known one —
// check-ui-density-rules.mjs reads it by name to walk the label tables. The
// extension list must cover every place a name can be pinned: .mjs gates and
// .test.ts suites run under check:ts-tests. A filter that silently matched
// nothing is how STATUS_LABEL_DOMAINS was briefly reported orphaned.
//
// The guard below is structural on purpose. A name sentinel cannot work: the
// guard's own source contains the sentinel, so the check that "a name is
// present in the scan" is satisfied by the check script itself.
const scriptFiles = listFiles(path.join(root, "scripts"), [".mjs", ".test.ts"], [], true);
for (const ext of [".mjs", ".test.ts"]) {
  if (!scriptFiles.some((file) => file.endsWith(ext))) {
    console.error(`check-dead-exports: script word scan matched no ${ext} file — the extension filter is blind`);
    process.exit(1);
  }
}
const scriptWords = new Set();
for (const file of scriptFiles) {
  for (const match of fs.readFileSync(file, "utf8").matchAll(/[A-Za-z_$][\w$]*/g)) scriptWords.add(match[0]);
}
if (scriptWords.size < 100) {
  console.error(`check-dead-exports: script word scan produced only ${scriptWords.size} tokens — refusing to trust it`);
  process.exit(1);
}

// --- self-check: runScan on a fixture whose answer is known exactly ---
// The fixture asserts on the final orphan report, not on intermediate state.
// Asserting the probe is how the previous version stayed green while the real
// call site scanned the wrong directory.
const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "nova-dead-exports-"));
try {
  const fixtureApp = path.join(fixtureDir, FIXTURE_SRC);
  fs.mkdirSync(path.join(fixtureDir, FIXTURE_SHOWCASE), { recursive: true });
  fs.mkdirSync(fixtureApp, { recursive: true });
  for (const [rel, body] of Object.entries(FIXTURE_FILES)) {
    fs.writeFileSync(path.join(fixtureDir, rel), body, "utf8");
  }
  const fixtureAliases = [{ prefix: "@/", target: fixtureApp + path.sep }];
  const probe = runScan(
    fixtureDir,
    "src/components/showcase",
    fixtureAliases,
    (f) => fs.readFileSync(f, "utf8"),
  );
  const actual = reportOrphans(probe.orphans, fixtureDir).map((o) => `${o.file}: ${o.name}`).sort();
  const expected = EXPECT_ORPHANS.map((e) => `${e[0]}: ${e[1]}`).sort();

  const problems = [];
  for (const entry of expected) {
    if (!actual.includes(entry)) problems.push(`fixture: expected orphan missing — ${entry}`);
  }
  for (const entry of actual) {
    if (!expected.includes(entry)) problems.push(`fixture: live code reported as orphan — ${entry}`);
  }
  if (problems.length > 0) {
    console.error("check-dead-exports: the classifier is blind — refusing to trust a count");
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }
  console.log(
    `check-dead-exports: classifier self-check ok (${expected.length} expected, ${actual.length} reported; relative + @/ dynamic import and out-of-scan consumers tracked)`,
  );
} finally {
  fs.rmSync(fixtureDir, { recursive: true, force: true });
}

// --- the real count ---
const scan = runScan(SRC_DIR, path.relative(SRC_DIR, SCAN_DIR), ALIASES, (f) => fs.readFileSync(f, "utf8"), scriptWords);
const orphans = reportOrphans(scan.orphans, root);

if (orphans.length > CEILING) {
  console.error(
    `check-dead-exports: ${orphans.length} unreferenced export(s) in src/components/showcase (ceiling ${CEILING}).`,
  );
  console.error(`  Strip the export or use it. New over the ceiling by ${orphans.length - CEILING}:`);
  for (const orphan of orphans) console.error(`    ${orphan.file}: ${orphan.name}`);
  process.exit(1);
}
console.log(
  `check-dead-exports ok: ${orphans.length} unreferenced export(s) in ${scan.exportFiles.length} file(s) (ceiling ${CEILING}).`,
);

if (process.argv.includes("--report")) {
  const byFile = new Map();
  for (const orphan of orphans) {
    if (!byFile.has(orphan.file)) byFile.set(orphan.file, []);
    byFile.get(orphan.file).push(orphan.name);
  }
  console.log(`\ncheck-dead-exports: ${byFile.size} file(s) carry the ${orphans.length} orphan(s)`);
  for (const [file, names] of [...byFile].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${String(names.length).padStart(3)}  ${file}`);
    console.log(`       ${names.join(", ")}`);
  }
}

if (process.argv.includes("--json")) {
  const outPath = process.argv[process.argv.indexOf("--json") + 1];
  if (!outPath) {
    console.error("check-dead-exports: --json needs a path");
    process.exit(1);
  }
  const byFile = {};
  for (const orphan of orphans) {
    if (!byFile[orphan.file]) byFile[orphan.file] = [];
    byFile[orphan.file].push(orphan.name);
  }
  fs.writeFileSync(outPath, JSON.stringify(byFile, null, 2), "utf8");
}
