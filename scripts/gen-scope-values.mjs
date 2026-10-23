// Generate builder/scope-values.ts: the value types of the builder scope bag.
//
// Phase 2 closed the key set (a missing or misspelled key is a compile error).
// Typing the values is the other half — until it lands, every lambda over a
// bag value is `(row: any) =>` because there is nothing to infer, and a value
// of the wrong shape is a blank panel rather than a type error.
//
// The types are read from the site where the bag is built, not hand-written, so
// they cannot drift from the literal. A key is emitted with its real type only
// when every name the type mentions can be imported into the generated file;
// anything else stays `any` and is listed in the output. Partial typing is
// still a gain: the keys that land type the lambdas that read them.
//
// Regenerate with: node scripts/gen-scope-values.mjs
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const OUT_FILE = "src/components/showcase/builder/scope-values.ts";
const TARGET = "src/components/showcase/BuilderShowcase.tsx";

const AMBIENT = {
  // Names always available from these imports in the generated file.
  react: ["ReactNode", "ComponentType", "ReactElement", "JSX", "CSSProperties", "RefObject", "MutableRefObject", "ChangeEvent", "KeyboardEvent", "MouseEvent", "FormEvent", "FocusEvent", "Dispatch", "SetStateAction", "Ref", "ForwardedRef", "ExoticComponent", "PropsWithChildren", "ReactNodeArray", "ReactPortal", "RefAttributes", "ComponentPropsWithoutRef"],
};

function loadProgram() {
  const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
  return ts.createProgram(parsed.fileNames, parsed.options);
}

function findBagLiteral(source) {
  let literal = null;
  const visit = (node) => {
    if (
      ts.isJsxExpression(node) &&
      node.expression &&
      ts.isObjectLiteralExpression(node.expression) &&
      node.expression.properties.length > 50
    ) {
      literal = node.expression;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return literal;
}

/**
 * Short type text, without fully-qualified import() paths.
 *
 * A shorthand property widens: `{ workflowRailBadgeVariant }` where the local
 * is `"destructive" | "secondary" | "outline"` types the property as `string`,
 * because a fresh literal union is widened in an object literal. The value
 * symbol's declared type keeps the union, and the union is what StateBadge's
 * `variant` prop wants. Widening it here turned three real bindings into
 * `string`-not-assignable errors at the call site.
 */
function typeText(checker, prop) {
  const valueSymbol = ts.isShorthandPropertyAssignment(prop)
    ? checker.getShorthandAssignmentValueSymbol(prop)
    : null;
  const type = valueSymbol
    ? checker.getTypeOfSymbolAtLocation(valueSymbol, prop)
    : checker.getTypeAtLocation(prop.name);
  return checker.typeToString(type, prop, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias);
}

/**
 * Identifier names the type text mentions that are not language primitives.
 * Used to decide whether the text can be written into a generated file at all.
 */
function foreignNames(text) {
  const primitives = new Set([
    "string", "number", "boolean", "null", "undefined", "void", "never", "object",
    "symbol", "bigint", "any", "unknown", "true", "false", "readonly", "Array",
    "Record", "Partial", "Pick", "Omit", "Required", "ReturnType", "Parameters",
    "Awaited", "Promise", "Map", "Set", "Date", "RegExp", "Error", "Iterable", "ReadonlySet", "ReadonlyMap", "ReadonlyArray", "Tuple", "ArrayLike",
    "Generator", "Function", "this",
  ]);
  const found = new Set();
  // Strip string literals first. A union like `"Rust" | "UI"` contains tokens
  // that are not names at all — scanning the raw text reported
  // `unresolved: Rust, UI` and `MD3, FAB, Sheet, Qt, Dock, MDI, Section, Watch`
  // for keys that are perfectly writable.
  const code = text.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, " ");
  for (const match of code.matchAll(/(^|[^\w$.])((?:new\s+)?[A-Za-z_$][\w$]*)/g)) {
    const name = match[2];
    if (primitives.has(name)) continue;
    if (name[0] === name[0].toLowerCase() && name[0] !== "$") continue;
    found.add(name);
  }
  return [...found];
}

/**
 * Where a name is declared, as a module specifier we can import from.
 *
 * Two traps here. An import binding in BuilderShowcase is itself a symbol whose
 * declaration lives in BuilderShowcase — resolving to that instead of following
 * the alias made every local type look like it came from "../BuilderShowcase".
 * And `Exclude`, `HTMLButtonElement` and friends are declared in lib.*.d.ts;
 * they are ambient and must not be imported at all, which is how the first run
 * ended up with `import type { Exclude, HTMLButtonElement } from "typescript"`.
 */
function importSourceFor(checker, name, seen, source) {
  const ambient = Object.entries(AMBIENT).find(([, names]) => names.includes(name));
  if (ambient) return { specifier: ambient[0], kind: "named" };
  // Lib globals (ReadonlySet, HTMLDivElement, Exclude, ...) are declared in
  // lib.*.d.ts and never imported. Looking only at symbols named in the bag
  // file misses them entirely, which is how `ReadonlySet` ended up "unresolved".
  const globalSymbol = checker.resolveName(name, source, ts.SymbolFlags.Type, false);
  if (globalSymbol) {
    const decl = globalSymbol.declarations?.[0];
    const file = decl ? decl.getSourceFile().fileName.split(path.sep).join("/") : "";
    if (!file || /(^|\/)lib\.[\w.]+\.d\.ts$/.test(file) || /node_modules\/typescript\/lib\//.test(file)) {
      return { specifier: null, kind: "ambient" };
    }
  }
  for (const raw of seen) {
    if (raw.name !== name) continue;
    // Follow `import { X } from "./y"` to the symbol in y.
    const symbol = raw.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(raw) : raw;
    const decl = symbol.declarations?.[0];
    if (!decl) continue;
    const file = decl.getSourceFile().fileName.split(path.sep).join("/");
    // Compiler and DOM lib declarations are ambient — never imported.
    if (/(^|\/)lib\.[\w.]+\.d\.ts$/.test(file) || /node_modules\/typescript\/lib\//.test(file)) {
      return { specifier: null, kind: "ambient" };
    }
    if (file.includes("node_modules/@types/")) {
      const m = file.match(/node_modules\/@types\/([^/]+)/);
      return m ? { specifier: m[1], kind: "named" } : null;
    }
    if (file.includes("node_modules/")) {
      const m = file.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
      return m ? { specifier: m[1], kind: "named" } : null;
    }
    // Local file: a relative specifier from the output file.
    const outDir = path.dirname(OUT_FILE);
    let rel = path.relative(outDir, file.replace(/\.d\.ts$/, "").replace(/\.tsx?$/, "")).split(path.sep).join("/");
    if (!rel.startsWith(".")) rel = "./" + rel;
    return { specifier: rel, kind: "named" };
  }
  return null;
}

/**
 * typeToString prints the *interface* name React uses internally, which is not
 * always the name the package exports: `ReactKeyboardEvent` is printed for
 * `React.KeyboardEvent`, and `@types/react` exports it as `KeyboardEvent`.
 * Renames are applied before the type is written.
 */
const RENAME = {
  ReactKeyboardEvent: "KeyboardEvent",
  ReactMouseEvent: "MouseEvent",
  ReactChangeEvent: "ChangeEvent",
  ReactFormEvent: "FormEvent",
  ReactFocusEvent: "FocusEvent",
  ReactUIEvent: "UIEvent",
  ReactDragEvent: "DragEvent",
  ReactPointerEvent: "PointerEvent",
  ReactTouchEvent: "TouchEvent",
  ReactWheelEvent: "WheelEvent",
  ReactAnimationEvent: "AnimationEvent",
  ReactTransitionEvent: "TransitionEvent",
  ReactSyntheticEvent: "SyntheticEvent",
  ReactClipboardEvent: "ClipboardEvent",
  ReactCompositionEvent: "CompositionEvent",
};

/**
 * Is `name` actually importable from `specifier`? typeToString can print an
 * internal alias that the package does not export — writing that import
 * produces a broken file, which is worse than leaving the key `any`.
 */
function isExportedFrom(specifier, name, fromDir) {
  const options = program.getCompilerOptions();
  const containing = path.resolve(fromDir, "_.ts");
  const resolved = ts.resolveModuleName(specifier, containing, options, ts.sys);
  if (!resolved.resolvedModule) return false;
  const sf = program.getSourceFile(resolved.resolvedModule.resolvedFileName);
  if (!sf) return false;
  const moduleSymbol = checker.getSymbolAtLocation(sf);
  if (!moduleSymbol) return true; // script / ambient declaration
  return checker.getExportsOfModule(moduleSymbol).some((s) => s.name === name);
}

const program = loadProgram();
const checker = program.getTypeChecker();
const source = program.getSourceFile(path.resolve(TARGET).split(path.sep).join("/"));
if (!source) {
  console.error("phase4-gen-scope-values: BuilderShowcase.tsx not in the program");
  process.exit(1);
}
const bag = findBagLiteral(source);
if (!bag) {
  console.error("phase4-gen-scope-values: bag literal not found");
  process.exit(1);
}

// Every symbol visible where the bag is built; used to resolve short names.
const seen = new Set();
const gather = (node) => {
  const symbol = checker.getSymbolAtLocation(node);
  if (symbol) seen.add(symbol);
  ts.forEachChild(node, gather);
};
gather(source);

const entries = [];
const imports = new Map(); // specifier -> Set<name>
const deferred = [];

for (const prop of bag.properties) {
  if (!ts.isPropertyAssignment(prop) && !ts.isShorthandPropertyAssignment(prop)) continue;
  const name = prop.name.getText(source);
  // React's internal interface names are not what the package exports.
  const text = typeText(checker, prop).replace(/\b[A-Za-z_$][\w$]*\b/g, (id) => RENAME[id] ?? id);

  // The fully-qualified form shows up whenever a type lives in another file and
  // short-name printing could not name it. Those we cannot write without a
  // rewrite pass, so they stay any.
  if (text.includes("import(") || /(^|[^\w])any([^\w]|$)/.test(text.replace(/:\s*any/g, ""))) {
    // `any` in the middle of an object literal is fine to write as-is; only a
    // bare `import(...)` forces the key to stay any.
  }
  const unusable = text.includes("import(") || text.length > 4000;
  const names = unusable ? [] : foreignNames(text);
  const sources = names.map((n) => importSourceFor(checker, n, seen, source));
  // A name that resolves to a module but is not exported from it would produce
  // a broken import. Check before committing to the type text.
  const importable = sources.map((s, i) => {
    if (!s) return false;
    if (s.kind === "ambient") return true;
    return isExportedFrom(s.specifier, names[i], path.dirname(OUT_FILE));
  });
  const resolvable = !unusable && importable.every(Boolean);

  if (!resolvable) {
    entries.push({ name, type: "any" });
    const why = unusable ? "unprintable" : `unresolved: ${names.filter((_, i) => !importable[i]).join(", ")}`;
    deferred.push(`${name}  (${why})`);
    continue;
  }
  for (let i = 0; i < names.length; i += 1) {
    // Ambient names (Exclude, HTMLButtonElement, ...) are already in scope.
    if (sources[i].kind === "ambient") continue;
    const { specifier } = sources[i];
    if (!imports.has(specifier)) imports.set(specifier, new Set());
    imports.get(specifier).add(names[i]);
  }
  entries.push({ name, type: text });
}

// --check writes nothing and fails if the file on disk is stale. Generated
// types that drift from the bag literal are the next silent failure: the whole
// point of reading them from the construction site is that they cannot drift,
// and that is only true while something re-runs the generator and compares.
const CHECK_ONLY = process.argv.includes("--check");
const stale = [];
function emit(file, contents) {
  if (!CHECK_ONLY) {
    fs.writeFileSync(file, contents, "utf8");
    return;
  }
  const onDisk = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (onDisk !== contents) stale.push(file);
}

// --- emit, split by the key set each name belongs to ---
// One file of 1089 keys is 1292 lines, over the 800-line house ceiling. The
// scope key sets already partition the bag (project / design / logic / build /
// shell-only), so each key is written into the file for the first set that
// claims it and the composer intersects the five. `Pick<BuilderScopeValues, K>`
// is unchanged.
function keysFrom(file) {
  return fs.readFileSync(file, "utf8").split(/\r?\n/).flatMap((l) => {
    const m = l.match(/^\s*\| "([A-Za-z_$][\w$]*)"$/);
    return m ? [m[1]] : [];
  });
}

const scopeDir = path.dirname(OUT_FILE);
const BUCKETS = [
  { id: "project", type: "ProjectScopeValues", keys: new Set(keysFrom(path.join(scopeDir, "scope-project.ts"))) },
  { id: "design", type: "DesignScopeValues", keys: new Set(keysFrom(path.join(scopeDir, "scope-design.ts"))) },
  { id: "logic", type: "LogicScopeValues", keys: new Set(keysFrom(path.join(scopeDir, "scope-logic.ts"))) },
  { id: "build", type: "BuildScopeValues", keys: new Set(keysFrom(path.join(scopeDir, "scope-build.ts"))) },
  { id: "shell", type: "ShellOwnScopeValues", keys: new Set(keysFrom(path.join(scopeDir, "scope-shell.ts"))) },
];

function bucketOf(name) {
  for (const bucket of BUCKETS) {
    if (bucket.keys.has(name)) return bucket;
  }
  // Not in any key set — the bag has keys only the composer sees. Keep them
  // together so the last file still has a home.
  return BUCKETS[BUCKETS.length - 1];
}

const byBucket = new Map(BUCKETS.map((b) => [b.id, { bucket: b, entries: [], imports: new Map() }]));
for (const entry of entries) {
  const bucket = bucketOf(entry.name);
  const slot = byBucket.get(bucket.id);
  slot.entries.push(entry);
}
// Rebuild imports per bucket so each file only imports what it uses.
for (const entry of entries) {
  const bucket = bucketOf(entry.name);
  const slot = byBucket.get(bucket.id);
  const names = foreignNames(entry.type);
  for (const n of names) {
    const resolved = importSourceFor(checker, n, seen, source);
    if (!resolved || resolved.kind === "ambient") continue;
    if (!slot.imports.has(resolved.specifier)) slot.imports.set(resolved.specifier, new Set());
    slot.imports.get(resolved.specifier).add(n);
  }
}

const written = [];
for (const { bucket, entries: bucketEntries, imports: bucketImports } of byBucket.values()) {
  const importLines = [...bucketImports]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([specifier, names]) => `import type { ${[...names].sort().join(", ")} } from "${specifier}";`);
  const body = bucketEntries
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => `  ${/^[A-Za-z_$][\w$]*$/.test(e.name) ? e.name : JSON.stringify(e.name)}: ${e.type};`)
    .join("\n");
  const file = [
    `// ${bucket.type} — the value types this slice of the builder scope bag carries.`,
    "//",
    "// Regenerate with: node scripts/gen-scope-values.mjs",
    "//",
    "// Types are read from the site where the bag is built so they cannot drift",
    "// from the literal. Keys whose type could not be written here stay `any`.",
    "/* eslint-disable @typescript-eslint/no-explicit-any */",
    ...importLines,
    "",
    `export type ${bucket.type} = {`,
    body,
    "};",
    "",
  ].join("\n");
  const out = path.join(scopeDir, `scope-values-${bucket.id}.ts`);
  emit(out, file);
  written.push([out, bucketEntries.length]);
}

const composer = [
  "// The whole builder scope bag's value types: the union of the five slices, one",
  "// per key set. Split so no single generated file crosses the 800-line house",
  "// ceiling — the bag is 1089 keys and one file of them is 1292 lines.",
  "//",
  "// Regenerate with: node scripts/gen-scope-values.mjs",
  "import type { ProjectScopeValues } from \"./scope-values-project\";",
  "import type { DesignScopeValues } from \"./scope-values-design\";",
  "import type { LogicScopeValues } from \"./scope-values-logic\";",
  "import type { BuildScopeValues } from \"./scope-values-build\";",
  "import type { ShellOwnScopeValues } from \"./scope-values-shell\";",
  "",
  "export type BuilderScopeValues =",
  "  & ProjectScopeValues",
  "  & DesignScopeValues",
  "  & LogicScopeValues",
  "  & BuildScopeValues",
  "  & ShellOwnScopeValues",
  "  ;",
  "",
  `// ${deferred.length} key(s) still any because their type could not be written:`,
  ...deferred.sort().map((n) => `//   ${n}`),
  "",
].join("\n");
emit(OUT_FILE, composer);
written.push([OUT_FILE, 0]);

for (const [file, count] of written) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).length;
  console.log(`  ${String(lines).padStart(5)} lines  ${String(count).padStart(4)} key(s)  ${file}`);
}
console.log(`phase4-gen-scope-values: typed ${entries.length - deferred.length} / ${entries.length} key(s); ${deferred.length} still any`);
if (CHECK_ONLY) {
  if (stale.length > 0) {
    console.error(`phase4-gen-scope-values: ${stale.length} generated file(s) are stale — regenerate`);
    for (const file of stale) console.error(`  ${file}`);
    process.exit(1);
  }
  console.log("phase4-gen-scope-values ok: generated files match the bag literal");
}
