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
]);

export const CHINESE_UI_AUDIT = `(() => {
  const ALLOWED = new Set(${JSON.stringify([...ALLOWED_ASCII])});
  const KBD_OR_CODE = 'kbd, code, pre, samp, [class*="font-mono"]';
  // File names, paths and key chords are technical identifiers, not prose.
  const isIdentifier = (text) =>
    /[\\\\/]/.test(text) ||
    /\\.[A-Za-z0-9]{1,8}$/.test(text) ||
    /\\+/.test(text) ||
    /^[A-Za-z][A-Za-z0-9]*([._-][A-Za-z0-9]+)+$/.test(text);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const leftovers = [];
  let node;
  while ((node = walker.nextNode())) {
    const text = (node.nodeValue || '').replace(/\\s+/g, ' ').trim();
    if (!text) continue;
    const parent = node.parentElement;
    if (!parent) continue;
    if (parent.closest('script, style, ' + KBD_OR_CODE)) continue;
    const style = getComputedStyle(parent);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    // Flag runs of English words: two or more ASCII-letter tokens separated by
    // spaces, with no CJK anywhere in the string.
    if (/[\\u4e00-\\u9fff]/.test(text)) continue;
    if (isIdentifier(text)) continue;
    const tokens = text.split(/[^A-Za-z]+/).filter(Boolean);
    if (tokens.length < 2) continue;
    if (tokens.every((t) => ALLOWED.has(t.toLowerCase()))) continue;
    leftovers.push({ text: text.slice(0, 80), tag: parent.tagName.toLowerCase() });
    if (leftovers.length >= 25) break;
  }
  return { leftovers, leftoverCount: leftovers.length };
})()`;
