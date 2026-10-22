// check-command-reachability — the Tauri IPC surface has to be wired at both ends.
//
// Why this gate exists: four registered commands (check_editor_project,
// build_editor_project, bundle_editor_project, create_editor_project) sat in
// the handler list with no frontend caller. Three were not merely unused —
// their behaviour was reimplemented by the background-task runners, so the UI
// worked and the smoke stayed green while the duplicate sat there. Same shape
// as CanvasContextMenu.tsx: a smoke measures whether behaviour exists, not
// whether every code path that produces it is reachable.
//
// It keys on `tauri::generate_handler![…]`, which is the actual registration
// list. Anchoring on `#[tauri::command]` instead is wrong twice over: the
// attribute also appears on fixtures inside `#[cfg(test)] mod tests`, and a
// command that is defined but never registered is not IPC surface at all.
//
// Three checks, each of which must be able to lose:
//   1. every registered command has at least one frontend invoke
//   2. every frontend invoke names a registered command
//   3. every #[tauri::command] is either registered or on the fixture allowlist
//
// Call sites are found by scanning for the name followed by `(`. A raw word
// search is not enough — `invoke` is a word in the product copy ("用 invoke
// 调用 Rust commands"). The generic argument can contain `>`, so a `[^>]*`
// regex group stops early and the whole call goes unseen; the scan below walks
// the angle brackets instead.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

/**
 * #[tauri::command] functions that are deliberately not registered.
 * Each entry is a reason, not a blank cheque.
 */
const UNREGISTERED_FIXTURES = {
  project_status: "fixture inside #[cfg(test)]: describes the shape of a command a generated app ships",
  run_go_worker: "fixture inside #[cfg(test)]: describes the shape of a command a generated app ships",
};

/** Registered commands that are deliberately not called from the frontend. */
const ALLOWED_UNREACHABLE = {
  // none today
};

/**
 * Call sites where the command name is a variable, not a literal. The gate
 * cannot see which command those reach, so each one has to say why it is safe.
 * Keyed by the callee expression plus the file, so a new dynamic invoke is not
 * covered by accident.
 */
const ALLOWED_DYNAMIC_INVOKES = {
  "src/components/showcase/builder/monolith-module.tsx: invoke(command)":
    "this IS the invokeIfAvailable wrapper; every literal call in the app funnels through it",
};

const RUST_DIR = path.join("src-tauri", "src");

function walk(dir, test, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "target" || e.name === "dist") continue;
      walk(p, test, out);
    } else if (test.test(e.name)) out.push(p);
  }
  return out;
}
const rel = (f) => f.split(path.sep).join("/");

// ---- registered: the generate_handler! list ------------------------------
// generated_bridge.rs emits a generated app whose run() also contains a
// `generate_handler![{handlers}]` inside a Rust raw string. A raw search finds
// that one first and reports `handlers` as a command. Real handler lists are
// only identifiers and commas — anything with a `{` is a format placeholder.
const registered = new Map(); // name -> where
for (const file of walk(RUST_DIR, /\.rs$/)) {
  const text = fs.readFileSync(file, "utf8");
  let from = 0;
  for (;;) {
    const open = text.indexOf("generate_handler!", from);
    if (open === -1) break;
    from = open + 1;
    const bracket = text.indexOf("[", open);
    if (bracket === -1) throw new Error(`${rel(file)}: generate_handler! has no [ — parser is wrong`);
    const close = text.indexOf("]", bracket);
    if (close === -1) throw new Error(`${rel(file)}: generate_handler![ is never closed — parser is wrong`);
    const body = text.slice(bracket + 1, close);
    if (/[{}]/.test(body)) continue; // format! template, not a registration
    const names = [...body.matchAll(/[A-Za-z_][A-Za-z0-9_]*/g)];
    if (names.length === 0) continue;
    const lineOf = (idx) => text.slice(0, idx).split(/\r?\n/).length;
    for (const m of names) {
      const name = m[0];
      const line = lineOf(bracket + 1 + m.index);
      if (registered.has(name)) {
        throw new Error(`${name} is registered twice (${registered.get(name)}, ${rel(file)}:${line})`);
      }
      registered.set(name, `${rel(file)}:${line}`);
    }
  }
}

// ---- every #[tauri::command] definition ---------------------------------
const commandDefs = new Map(); // name -> where
for (const file of walk(RUST_DIR, /\.rs$/)) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (!/^#\[tauri::command\]\s*$/.test(lines[i])) continue;
    let j = i + 1;
    while (j < lines.length && (/^\s*\/\//.test(lines[j]) || /^\s*#\[/.test(lines[j]))) j++;
    const m = lines[j]?.match(/^\s*(?:pub(?:\([^)]*\))?\s+)?fn\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
    if (!m) {
      throw new Error(`${rel(file)}:${i + 1}: #[tauri::command] is not followed by a fn — parser is wrong`);
    }
    const name = m[1];
    if (!commandDefs.has(name)) commandDefs.set(name, []);
    commandDefs.get(name).push(`${rel(file)}:${j + 1}`);
  }
}

// ---- frontend invokes ---------------------------------------------------
// Walked with the TypeScript AST, not scanned with a regex. The regex version
// of this lost three ways before it was thrown out, all of them silent:
//   - `invoke` is a word in the product copy ("用 invoke 调用 Rust commands")
//   - `invoke("${name}")` inside a template literal is a code *preview* shown to
//     the user, not a call
//   - `function invokeIfAvailable<T>(command, …)` is the wrapper's definition
// Only the AST knows which `invoke` is a CallExpression.
const invokeRefs = new Map(); // name -> [where]
const dynamicInvokes = [];

function visit(node, file, source) {
  if (ts.isCallExpression(node)) {
    const callee = node.expression.getText(source);
    if (callee === "invoke" || callee === "invokeIfAvailable") {
      const where = `${rel(file)}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}`;
      const arg0 = node.arguments[0];
      if (arg0 && ts.isStringLiteral(arg0)) {
        const name = arg0.text;
        if (!invokeRefs.has(name)) invokeRefs.set(name, []);
        invokeRefs.get(name).push(where);
      } else if (arg0) {
        dynamicInvokes.push({
          where,
          key: `${rel(file)}: ${callee}(${arg0.getText(source)})`,
        });
      } else {
        throw new Error(`${where}: ${callee}() with no arguments — parser is wrong`);
      }
    }
  }
  ts.forEachChild(node, (child) => visit(child, file, source));
}

for (const file of walk("src", /\.tsx?$/)) {
  const raw = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(
    file,
    raw,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  visit(source, file, source);
}

const failures = [];

const unexplainedDynamics = dynamicInvokes.filter((d) => !(d.key in ALLOWED_DYNAMIC_INVOKES));
if (unexplainedDynamics.length > 0) {
  failures.push(
    `dynamic invoke name(s) — this gate cannot see which command they reach: ` +
      `${unexplainedDynamics.map((d) => `${d.where} [${d.key}]`).join(", ")}. ` +
      `If a literal name is possible, use one; otherwise add it to ALLOWED_DYNAMIC_INVOKES with a reason.`,
  );
}

// 1. registered but never invoked
for (const [name, where] of [...registered].sort()) {
  if (invokeRefs.has(name)) continue;
  if (name in ALLOWED_UNREACHABLE) continue;
  failures.push(
    `registered command ${name} (${where}) has no frontend caller — ` +
      `wired on the Rust side and orphaned on the TS side. Either call it or drop it from ` +
      `generate_handler!; if it is deliberately open, add it to ALLOWED_UNREACHABLE with a reason.`,
  );
}

// 2. invoked but not registered
for (const [name, where] of [...invokeRefs].sort()) {
  if (registered.has(name)) continue;
  failures.push(`invoke of ${name} at ${where.join(", ")} names no registered command — typo or stale call.`);
}

// 3. defined but never registered
for (const [name, where] of [...commandDefs].sort()) {
  if (registered.has(name)) continue;
  if (name in UNREGISTERED_FIXTURES) continue;
  failures.push(
    `#[tauri::command] ${name} (${where.join(", ")}) is never registered in generate_handler! — ` +
      `it cannot be called at all. Register it or delete it; if it is a test fixture, add it to ` +
      `UNREGISTERED_FIXTURES with a reason.`,
  );
}

// ---- the gate must not go vacuous ---------------------------------------
if (registered.size === 0) throw new Error("found 0 registered commands — the Rust parser is broken");
if (invokeRefs.size === 0) throw new Error("found 0 frontend invokes — the TS parser is broken");
if (commandDefs.size === 0) throw new Error("found 0 #[tauri::command] definitions — the Rust parser is broken");

if (failures.length > 0) {
  console.error(`check-command-reachability: ${failures.length} problem(s)`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}

const covered = [...registered.keys()].filter((n) => invokeRefs.has(n)).length;
const single = [...invokeRefs].filter(([, w]) => w.length === 1).length;
console.log(
  `check-command-reachability ok: ${registered.size} registered, ${commandDefs.size} defined, ` +
    `${invokeRefs.size} invoked, ${covered}/${registered.size} reachable, ` +
    `${Object.keys(UNREGISTERED_FIXTURES).length} fixture(s) allowed unregistered, ` +
    `${Object.keys(ALLOWED_UNREACHABLE).length} allowed unreachable, ` +
    `${single} command(s) with exactly one call site (the shape an orphan starts as).`,
);
