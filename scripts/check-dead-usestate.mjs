// check-dead-usestate — the trap that bit three times, as a gate.
//
// `tsc --noUnusedLocals` sees a setter that is called and calls it used. It
// cannot see that every call site passes the initial value, so the state never
// changes and every read is a dead branch. That is how `checkingTarget`,
// `building`/`bundling` and `conflictFile` each hid: an entire feature closed
// over state nothing ever set.
//
// The gate runs twice. First against a fixture of known shapes — if the
// detector cannot find them, a green scan of src/ is meaningless and the gate
// fails for being blind. Then against src/, where any hit is a bug.
//
// Conservative by construction: a setter used as a value is live, a function
// updater is live, a single non-literal argument is live. Better to miss one
// than to send someone deleting working code — the first draft reported
// `setBuilding` as dead because it is passed as `taskKind === "build" ?
// setBuilding : …`, which is exactly the wiring that fixed it.
//
// TypeScript AST, not regex. See docs/monolith-decomposition.md.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

/**
 * Every shape the detector claims to understand. The gate refuses to run the
 * real scan unless it classifies all six exactly — a detector that reports
 * nothing is indistinguishable from a detector that sees nothing.
 */
const FIXTURE = `import { useState } from "react";
export function Fixture() {
  const [never, setNever] = useState<string | null>(null);
  const [onlyNull, setOnlyNull] = useState<string | null>(null);
  const [onlyFalse, setOnlyFalse] = useState<boolean>(false);
  const [live, setLive] = useState<string>("");
  const [usedAsValue, setUsedAsValue] = useState<boolean>(false);
  const [fnUpdater, setFnUpdater] = useState<number>(0);
  setOnlyNull(null);
  setOnlyNull(undefined);
  setOnlyFalse(false);
  setLive("hello");
  setFnUpdater((n) => n + 1);
  const mark = setUsedAsValue;
  return <div onClick={() => mark(true)}>{never}{onlyNull}{onlyFalse}{live}{fnUpdater}</div>;
}
`;

const FIXTURE_EXPECT_DEAD = ["setNever", "setOnlyNull", "setOnlyFalse"];
const FIXTURE_EXPECT_LIVE = ["setLive", "setUsedAsValue", "setFnUpdater"];

/**
 * A call that provably leaves the state at its initial value.
 *
 * `null` and `false` are keyword expression kinds, NOT literal expressions —
 * `ts.isLiteralExpression` excludes them, and testing it first made this
 * function miss the exact `setConflictFile(null)` shape it exists to catch.
 */
function isFalsyLiteral(node) {
  if (node.kind === ts.SyntaxKind.NullKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return true;
  if (ts.isIdentifier(node)) return node.text === "undefined";
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken) return true;
  if (ts.isStringLiteralLike(node)) return node.text.length === 0;
  if (ts.isNumericLiteral(node)) return Number(node.text) === 0;
  return false;
}

function listFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.ts$/.test(entry.name)) out.push(full);
  }
  return out;
}

function scanFile(file) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const bindings = [];
  const setterCalls = new Map();
  const setterRefs = new Map();

  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isArrayBindingPattern(node.name) && node.initializer) {
      const init = node.initializer;
      const callee = ts.isCallExpression(init) ? init.expression.getText(source) : "";
      if (callee === "useState" || callee.endsWith(".useState")) {
        const setter = node.name.elements[1];
        if (setter && ts.isBindingElement(setter) && ts.isIdentifier(setter.name)) {
          bindings.push({ name: setter.name.text, at: setter.name.getStart(source) });
        }
      }
    }
    if (ts.isIdentifier(node)) {
      if (!setterRefs.has(node.text)) setterRefs.set(node.text, []);
      setterRefs.get(node.text).push(node);
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const name = node.expression.text;
      if (!setterCalls.has(name)) setterCalls.set(name, []);
      setterCalls.get(name).push(node.arguments);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  const dead = [];
  const live = [];
  for (const binding of bindings) {
    // The binding's own name is an Identifier too; counting it reported every
    // setter in the codebase as "used as a value". Compare positions.
    const usedAsValue = (setterRefs.get(binding.name) ?? []).some((id) => {
      if (id.getStart(source) === binding.at) return false;
      return !(ts.isCallExpression(id.parent) && id.parent.expression === id);
    });
    const calls = setterCalls.get(binding.name) ?? [];
    const hasLiveCall = calls.some((args) => args.length !== 1 || !isFalsyLiteral(args[0]));
    if (!usedAsValue && !hasLiveCall) dead.push(binding.name);
    else live.push(binding.name);
  }
  return { dead, live, count: bindings.length };
}

function scanDir(dir) {
  const findings = [];
  let bindings = 0;
  for (const file of listFiles(dir)) {
    const { dead, count } = scanFile(file);
    for (const name of dead) findings.push({ file: path.relative(root, file), name });
    bindings += count;
  }
  return { findings, bindings };
}

// --- the detector must prove it can see before it is trusted to see ---
const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "nova-dead-usestate-"));
try {
  fs.writeFileSync(path.join(fixtureDir, "fixture.tsx"), FIXTURE, "utf8");
  const probe = scanFile(path.join(fixtureDir, "fixture.tsx"));
  const problems = [];
  for (const name of FIXTURE_EXPECT_DEAD) {
    if (!probe.dead.includes(name)) problems.push(`fixture: ${name} should be reported dead and was not`);
  }
  for (const name of probe.dead) {
    if (!FIXTURE_EXPECT_DEAD.includes(name)) problems.push(`fixture: ${name} reported dead but should be live`);
  }
  for (const name of FIXTURE_EXPECT_LIVE) {
    if (probe.dead.includes(name)) problems.push(`fixture: ${name} reported dead but is live`);
    if (!probe.live.includes(name)) problems.push(`fixture: ${name} not seen at all`);
  }
  if (problems.length > 0) {
    console.error("check-dead-usestate: the detector is blind — refusing to trust a green scan");
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }
  console.log(
    `check-dead-usestate: detector self-check ok (${FIXTURE_EXPECT_DEAD.length} dead, ${FIXTURE_EXPECT_LIVE.length} live shapes classified)`,
  );
} finally {
  fs.rmSync(fixtureDir, { recursive: true, force: true });
}

// --- the real scan ---
const { findings, bindings } = scanDir(path.join(root, "src"));
if (findings.length > 0) {
  console.error(`check-dead-usestate: ${findings.length} useState setter(s) can never change the state they own`);
  for (const finding of findings) {
    console.error(`  ${finding.file}: ${finding.name}`);
    console.error(`    every read of this state is a dead branch. Wire the setter or delete the state.`);
  }
  process.exit(1);
}
console.log(`check-dead-usestate ok: ${bindings} useState binding(s) in src/ all have a live setter`);
