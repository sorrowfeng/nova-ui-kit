// check-english-prose — the static half of "no English left in the Chinese
// chrome".
//
// The runtime gate (check-a11y, checklist 6.7) reads the DOM. That is the
// right authority for what is on screen, and it cannot see a validation message
// that only appears when a schema is wrong, a task-queue summary that only
// appears mid-run, or a build error that only appears when the build fails.
// Those strings live in source, so the only thing that can police them is a
// source scan.
//
// What counts as prose here is deliberately narrow: a multi-word English phrase
// inside a string literal. Identifiers are not prose — file names, paths,
// macros, camelCase field names, key chords, shell commands, Rust source and
// component type names all name a thing rather than say something about it.
// Anything that survives the filter has to be on the allowlist, and every
// allowlist entry carries its reason, so shipping new English is a deliberate
// diff rather than a silent leak.
import fs from "node:fs";
import path from "node:path";

const ROOTS = (process.argv[2] ?? "src/components/showcase").split(",").map((p) => p.trim());

/**
 * Files that make up the builder chrome — the same surface `check:a11y` 6.7
 * claims covers "the Chinese UI". The UI-kit showcase pages are a component
 * demo, not the editor, and are out of scope here on purpose.
 */
const CHROME_ROOTS = ["src/components/showcase/builder", "src/components/showcase/BuilderShowcase.tsx"];

/**
 * Strings that are names, not sentences, and that the Chinese UI deliberately
 * prints as-is. Each entry records why it is allowed; the point of the list is
 * that adding to it is visible in review.
 */
export const ALLOWED_PROSE = new Map([
  // Component catalogue type names — the name of the control, the way
  // QPushButton is. Its title and description are already Chinese.
  ["Spin Box", "component type name"],
  ["Double Spin Box", "component type name"],
  ["Radio Group", "component type name"],
  ["Assist Chip", "component type name"],
  ["Filter Chip", "component type name"],
  ["Input Chip", "component type name"],
  ["Suggestion Chip", "component type name"],
  ["Elevated Card", "component type name"],
  ["Filled Card", "component type name"],
  ["Outlined Card", "component type name"],
  ["Sheet handle", "component type name"],
  ["UI Signal", "wire value: event kind"],
  ["Run command", "wire value: event kind"],
  ["UI Kit", "kit name"],
  ["Nova UI Kit", "product name"],
  ["MD3 tokens", "design-token set name"],
  ["Segoe UI", "font family name"],
  ["JetBrains Mono", "font family name"],
  ["Linux AppImage", "artifact type name; AppImage is a proper noun"],
  ["Windows 可执行文件、Linux AppImage", "artifact type names joined as one option value"],
  ["Windows x64", "platform target name"],
  ["Node sidecar", "backend integration kind name"],
  ["Go sidecar", "backend integration kind name"],
  ["Tauri invoke", "IPC transport name"],
  ["Nova Smoke VM", "smoke-test VM profile name"],
  ["Option A", "seed option value of a control the user is designing"],
  ["Option B", "seed option value of a control the user is designing"],
  ["Option C", "seed option value of a control the user is designing"],
  ["derive, rc", "Rust attribute tokens in an editor placeholder"],
  // The generated-app locale table: the en-US half is the English translation
  // of strings whose zh-CN half is already Chinese. That is a locale bundle,
  // not half-translated chrome.
  ["Nova Generated App", "generated-i18n en-US locale bundle"],
  ["No Rust command bound", "generated-i18n en-US locale bundle"],
  ["Backend ready", "generated-i18n en-US locale bundle"],
  ["Running…", "generated-i18n en-US locale bundle"],
  ["Cargo ·", "crate-manager product name plus separator"],
  ["· pid", "wire field name of the backend process record"],
]);

/** CJK ranges: a run carrying Chinese already says what it means. */
const CJK = /[㐀-䶿一-鿿豈-﫿]/;

/** Token shapes that are code or names rather than English words. */
function isIdentifierToken(token) {
  return (
    /^[a-z]+[A-Z]/.test(token) || // camelCase
    /_/.test(token) || // snake_case
    /^[A-Z0-9]+$/.test(token) || // SCREAMING_CASE / acronyms
    /[0-9]/.test(token) // anything carrying digits
  );
}

/** Whole-string shapes that are code, paths or names rather than prose. */
function isIdentifierString(text) {
  return (
    /[\\/]/.test(text) || // paths
    /\.[A-Za-z0-9]{1,16}$/.test(text) || // file names
    /\.[A-Za-z0-9]{1,16}(?![A-Za-z0-9])/.test(text) || // extension mid-string
    /^[#@$]\S/.test(text) || // macros and props
    /^[[{]/.test(text) || // JSON / array literals
    /:[0-9]+$/.test(text) || // line suffixes
    /^[A-Za-z][A-Za-z0-9]*([._-][A-Za-z0-9]+)+$/.test(text) // dotted / dashed ids
  );
}

/** Tailwind utility strings: every token is a lowercase kebab / variant. */
function isUtilityClassString(text) {
  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length < 1) return false;
  // A token is a variant-prefixed utility: [..]:, sm:, group-open:, -mt-2, etc.
  const utilityToken = /^(?:\[[^\]]*\]:|[a-z0-9-]+:)*-?[a-z][a-z0-9-]*(?:\[[^\]]*\])?(?:\/[0-9]+)?$/;
  const utility = tokens.filter((t) =>
    utilityToken.test(t) ||
    /^(calc|min|max|env|var|hsl|rgb|url|translateX|translateY|rotate|scale|deg)\(/.test(t) ||
    /^[a-z-]+\(/.test(t) ||
    /^[),]+$/.test(t)
  );
  return utility.length / tokens.length >= 0.7;
}

/** Shell commands, Rust fragments, CSS chunks and other generated source. */
function isCodeFragment(text) {
  return (
    /\\n/.test(text) || // escaped newlines: generated source
    /->/.test(text) || // type signatures and result types
    (/::/.test(text) && !/^[A-Z]/.test(text)) || // Rust paths (unless a product name)
    /^[a-z][\w-]*(\s+[-./\w{}%]+)+$/.test(text) || // command lines
    /[{};]\s*$/.test(text) ||
    /^-{2,}\w/.test(text) || // long flags
    /^(calc|min|max|env|var|hsl|rgb|url|translateX|translateY|rotate|scale)\(/.test(text) ||
    /(?:^|[\s,([{])(?:var|hsl|rgb|calc|env|min|max|url|minmax)\(/.test(text) ||
    /^(?:-?[a-z][a-z0-9-]*:\s*)+/.test(text) && /;$/.test(text) || // CSS declarations
    /^(?:[a-z][a-z0-9-]*:\s*)[a-z-]+$/.test(text) && text.length < 24 || // `target: none`
    // CSS font stacks: comma-separated family names ending in a generic family.
    /(?:sans-serif|monospace|serif|system-ui)\s*$/.test(text) ||
    // CSS selector lists used as querySelector arguments.
    /^\[?[\w-]+[^\n]*\[[a-z-]+[=~|^$*]?=['"][^'"]*['"]\]/.test(text) ||
    /^(?:input|textarea|select|button|div|span|a|p|ul|li|table|tr|td|th)\b/.test(text) && /,\s*\w/.test(text)
  );
}

/** Key chords and editor position readouts name keys, not sentences. */
function isKeyChord(text) {
  return /^(?:Ctrl|Alt|Shift|Cmd|Meta|Enter|Esc|Tab|Space|F\d{1,2})(?:\s*\+\s*(?:Ctrl|Alt|Shift|Cmd|Meta|Enter|Esc|Tab|Space|[A-Z]))*$/i.test(text) ||
    /^(?:Ctrl|Alt|Shift|Cmd|Meta)(?:\s+(?:Ctrl|Alt|Shift|Cmd|Meta|[A-Z]))+$/i.test(text) ||
    /^·?\s*(?:Ctrl|Alt|Shift|Cmd)(?:\+[A-Za-z]+)+$/.test(text);
}

/**
 * Strip line and block comments so a quoted phrase inside a comment does not
 * read as shipped UI copy.
 */
function stripComments(line) {
  return line.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/, "$1");
}

/** Split a literal body into text runs, dropping `${...}` interpolations. */
function textRuns(body) {
  return body
    .split(/(\$\{[^}]*\})/)
    .filter((run) => run && !run.startsWith("${"))
    .map((run) => run.trim())
    .filter(Boolean);
}

/** Scan one source file; return prose runs that are not allowlisted. */
export function findEnglishProse(source, file) {
  const found = [];
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const part of stripComments(line).split(/("[^"]*"|'[^']*'|`[^`]*`)/)) {
      if (!part || !/^["'`]/.test(part) || part.length < 3) continue;
      for (const run of textRuns(part.slice(1, -1))) {
        if (CJK.test(run)) continue;
        if (!/[A-Za-z]{3,}/.test(run)) continue;
        if (ALLOWED_PROSE.has(run)) continue;
        // Single-word runs and identifier-shaped strings name things.
        if (!/\s/.test(run)) continue;
        if (isIdentifierString(run)) continue;
        if (isUtilityClassString(run)) continue;
        if (isCodeFragment(run)) continue;
        if (isKeyChord(run)) continue;
        const tokens = run.split(/[^A-Za-z]+/).filter(Boolean);
        const proseTokens = tokens.filter((t) => t.length >= 3 && !isIdentifierToken(t));
        // All code-shaped tokens means the run is names ("cargo build started"
        // is prose; "MainWindow.ui build_release" is not).
        if (proseTokens.length === 0) continue;
        // A run whose only non-identifier tokens are initials is a name.
        if (proseTokens.every((t) => t.length < 3)) continue;
        found.push({ file, line: index + 1, text: run });
      }
    }
  });
  return found;
}

function collectFiles(target) {
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return [target];
  const out = [];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const invokedDirectly = (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("/check-english-prose.mjs");
if (invokedDirectly) {
  const roots = process.argv[2] ? ROOTS : CHROME_ROOTS;
  const files = roots.flatMap(collectFiles);
  const leftovers = files.flatMap((file) => findEnglishProse(fs.readFileSync(file, "utf8"), file.split(path.sep).join("/")));
  if (leftovers.length > 0) {
    console.error("check-english-prose failed: English prose left in the builder chrome");
    for (const entry of leftovers) {
      console.error(`  ${entry.file}:${entry.line}  ${JSON.stringify(entry.text)}`);
    }
    console.error("");
    console.error("Chinese chrome says things in Chinese. If a string really is a name");
    console.error("(a type name, a font, a product name), add it to ALLOWED_PROSE with a reason.");
    process.exit(1);
  }
  console.log(`check-english-prose ok: ${files.length} files scanned, no English prose in the chrome`);
}
