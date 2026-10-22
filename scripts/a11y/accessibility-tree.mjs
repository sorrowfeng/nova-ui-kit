// Checklist 6.x — "读屏措辞与状态播报".
//
// A screen reader does not read the DOM; it reads the accessibility tree that
// the browser exposes to assistive tech. CDP's Accessibility.getFullAXTree is
// exactly that surface, so the wording contract can be checked without a human
// listening: every interactive node needs a name, and status changes need a
// live region the AT can subscribe to.

const INTERACTIVE_ROLES = new Set([
  "button",
  "link",
  "textbox",
  "searchbox",
  "combobox",
  "checkbox",
  "radio",
  "switch",
  "tab",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "slider",
  "spinbutton",
]);

const LIVE_ROLES = new Set(["status", "alert"]);

function valueOf(axValue) {
  if (!axValue) return "";
  return typeof axValue.value === "string" ? axValue.value : axValue.value != null ? String(axValue.value) : "";
}

function describeNode(node) {
  const role = valueOf(node.role) || "(no role)";
  const name = valueOf(node.name);
  const props = (node.properties || []).map((p) => `${p.name}=${p.value?.value ?? ""}`).join(" ");
  return `${role}{${name || "(unnamed)"}}${props ? " " + props : ""}`;
}

/**
 * @param {Array} nodes CDP Accessibility.AXNode[]
 * @returns {{unnamedInteractive: string[], unnamedInteractiveCount: number,
 *            liveRegions: string[], liveRegionCount: number,
 *            statusNodes: string[], interactiveCount: number}}
 */
export function auditAccessibilityTree(nodes) {
  const unnamedInteractive = [];
  const liveRegions = [];
  const statusNodes = [];
  let interactiveCount = 0;

  for (const node of nodes) {
    const role = valueOf(node.role);
    const name = valueOf(node.name).trim();
    const ignored = (node.properties || []).some((p) => p.name === "ignored" && p.value?.value === true);
    if (ignored) continue;

    if (INTERACTIVE_ROLES.has(role)) {
      interactiveCount += 1;
      if (!name) unnamedInteractive.push(describeNode(node));
    }
    if (LIVE_ROLES.has(role)) {
      liveRegions.push(describeNode(node));
    }
    const liveProp = (node.properties || []).find((p) => p.name === "live");
    if (liveProp && valueOf(liveProp.value) !== "off") {
      statusNodes.push(describeNode(node));
    }
  }

  return {
    unnamedInteractive: unnamedInteractive.slice(0, 25),
    unnamedInteractiveCount: unnamedInteractive.length,
    liveRegions,
    liveRegionCount: liveRegions.length,
    statusNodes,
    interactiveCount,
  };
}

/**
 * Checklist 6.7 — Chinese UI must not ship half-translated English labels.
 * Technical identifiers (file names, chords, code) are allowed.
 */
const ALLOWED_ASCII = new Set([
  "ui", "rust", "css", "json", "md", "exe", "app", "dmg", "deb", "npm", "git",
  "nova", "ok", "id", "url", "api", "cpu", "ram", "png", "svg", "toml", "yaml",
  "yaml", "deb", "appimage", "tauri", "vite", "webview", "ipc", "ffi", "cli",
  // Schema and wire vocabulary that is code, not prose.
  "string", "number", "boolean", "object", "array", "enum", "true", "false",
  "null", "undefined", "float", "int", "uint", "char", "str", "vec", "path",
  "file", "dir", "src", "bin", "lib", "target", "debug", "release", "main",
  "fn", "impl", "mod", "pub", "mut", "let", "const", "type", "struct", "enum",
  // Short editor/key tokens that never carry prose meaning.
  "ln", "col", "esc", "tab", "alt", "ctrl", "shift", "enter", "space", "cmd",
  // Wire and domain identifiers the UI prints as data: event names, parameter
  // types, crate and macro vocabulary. These are the thing named, not prose
  // about it — "click -> text", "serde · derive", "#[tauri::command]".
  "click", "slot", "text", "result", "event", "value", "command", "invoke",
  "handler", "derive", "serde", "pid", "assets", "arg", "args", "payload",
  "state",
]);

export const CHINESE_UI_AUDIT = `(() => {
  const ALLOWED = new Set(${JSON.stringify([...ALLOWED_ASCII])});
  // Source code rendered in the Rust editor is code the way <pre> is: the
  // words belong to the program the user is writing, not to Nova's chrome.
  const KBD_OR_CODE =
    'kbd, code, pre, samp, [data-builder-rust-signature-help], ' +
    '[data-builder-rust-syntax-token], [data-builder-rust-minimap]';
  // File names, paths, macros and key chords are technical identifiers, not
  // prose. A file name can contain a space ("Main Window.ui"), so the
  // extension test has to look inside the string, not only at the end.
  const isIdentifier = (text) =>
    /[\\\\/]/.test(text) ||
    /\\.[A-Za-z0-9]{1,16}$/.test(text) ||
    /\\.[A-Za-z0-9]{1,16}(?![A-Za-z0-9])/.test(text) ||
    /\\+/.test(text) ||
    /[#@]\\S/.test(text) ||
    /^[\\[{]/.test(text) ||
    /:[0-9]+$/.test(text) ||
    /^[A-Za-z][A-Za-z0-9]*([._-][A-Za-z0-9]+)+$/.test(text);
  // A single token can be code without the whole string being code: camelCase
  // field names, SCREAMING_CASE enum members, and anything carrying digits.
  const isIdentifierToken = (token) =>
    /^[a-z]+[A-Z]/.test(token) ||
    /_/.test(token) ||
    /^[A-Z0-9]+$/.test(token) ||
    /[0-9]/.test(token);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const leftovers = [];
  let node;
  while ((node = walker.nextNode())) {
    const text = (node.nodeValue || '').replace(/\\s+/g, ' ').trim();
    if (!text) continue;
    const parent = node.parentElement;
    if (!parent) continue;
    if (parent.closest('script, style, ' + KBD_OR_CODE)) continue;
    // The component palette names the control being inserted. That is a type
    // name (Spin Box, Elevated Card) the way QPushButton is, not a sentence —
    // its description is already Chinese.
    if (parent.closest('[data-builder-palette-type]')) continue;
    const style = getComputedStyle(parent);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    // Mixed CJK+ASCII is fine — the Chinese carries the meaning and the ASCII
    // is an identifier riding along ("0 处引用", "逻辑 Main Window.ui").
    if (/[\\u4e00-\\u9fff]/.test(text)) continue;
    if (isIdentifier(text)) continue;
    const tokens = text.split(/[^A-Za-z]+/).filter(Boolean);
    if (tokens.length === 0) continue;
    // A single leftover word is the common leak ("modules", "checkpoints",
    // "tracked"). Short tokens are initials and key names, not prose; code
    // shaped tokens (statusText, TEXT, itemId) are identifiers even when long.
    const proseTokens = tokens.filter((t) => t.length >= 3 && !isIdentifierToken(t));
    if (proseTokens.length === 0) continue;
    if (proseTokens.every((t) => ALLOWED.has(t.toLowerCase()))) continue;
    // Name the call site the way the density histogram does: the nearest
    // data-builder-* hook is the identifier the tests already use.
    let hook = "";
    for (let host = parent; host && !hook; host = host.parentElement) {
      for (const attr of host.attributes || []) {
        if (attr.name.startsWith("data-builder-")) {
          hook = attr.name.replace("data-builder-", "") + (attr.value ? "=" + attr.value.slice(0, 28) : "");
          break;
        }
      }
    }
    leftovers.push({ text: text.slice(0, 80), tag: parent.tagName.toLowerCase(), hook });
    if (leftovers.length >= 25) break;
  }
  return { leftovers, leftoverCount: leftovers.length };
})()`;
