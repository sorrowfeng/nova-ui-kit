// Checklist 3.3 — global shortcuts must not collide with the keys the desktop
// webview or the OS reserves (new window / close tab / devtools / quit).
//
// The scan is static: it looks for `key === "x"` guards that sit next to a
// primary-modifier check. Anything that would swallow Ctrl+N / Ctrl+W / … is
// reported so the binding can be moved off the reserved chord.
import fs from "node:fs";
import path from "node:path";

/** Chords the desktop shell owns. Letters are compared case-insensitively. */
export const RESERVED_SHORTCUTS = [
  { modifiers: "ctrl+shift", key: "i", why: "devtools" },
  { modifiers: "ctrl+shift", key: "j", why: "devtools console" },
  { modifiers: "ctrl+shift", key: "c", why: "devtools element picker" },
  { modifiers: "ctrl+shift", key: "p", why: "devtools command menu" },
  { modifiers: "ctrl", key: "n", why: "new window" },
  { modifiers: "ctrl", key: "t", why: "new tab" },
  { modifiers: "ctrl", key: "w", why: "close tab / window" },
  { modifiers: "ctrl+shift", key: "w", why: "close window" },
  { modifiers: "ctrl", key: "q", why: "quit" },
  { modifiers: "ctrl", key: "r", why: "reload webview" },
  { modifiers: "ctrl+shift", key: "r", why: "hard reload" },
];

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      walk(full, out);
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function modifierSeenIn(windowText) {
  const hasShift = /\bshiftKey\b/.test(windowText);
  const hasPrimary = /\bctrlKey\b|\bmetaKey\b|\bisPrimaryShortcut\b|\bprimaryShortcut\b/.test(windowText);
  return { hasShift, hasPrimary };
}

/** Scan `src/` for key guards that would capture a reserved chord. */
export function findReservedShortcutConflicts(rootDir = process.cwd()) {
  const srcDir = path.join(rootDir, "src");
  const conflicts = [];
  const keyGuard = /(?:event|e|ev|evt)\.key\s*===\s*["']([^"']+)["']/g;

  for (const file of walk(srcDir)) {
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      keyGuard.lastIndex = 0;
      let match;
      while ((match = keyGuard.exec(line)) !== null) {
        const key = match[1].toLowerCase();
        const windowText = lines.slice(Math.max(0, i - 12), Math.min(lines.length, i + 4)).join("\n");
        const { hasShift, hasPrimary } = modifierSeenIn(windowText);
        if (!hasPrimary) continue;
        for (const reserved of RESERVED_SHORTCUTS) {
          const wantsShift = reserved.modifiers.includes("shift");
          if (wantsShift !== hasShift) continue;
          if (reserved.key !== key) continue;
          conflicts.push({
            file: path.relative(rootDir, file).replace(/\\/g, "/"),
            line: i + 1,
            chord: `Ctrl+${wantsShift ? "Shift+" : ""}${match[1].toUpperCase()}`,
            why: reserved.why,
            source: line.trim().slice(0, 120),
          });
        }
      }
    }
  }
  return conflicts;
}

/**
 * The documented chord table lives in KeyboardShortcutsOverlay. It must not
 * advertise a chord the shell reserves either.
 */
export function findReservedDocumentedShortcuts(rootDir = process.cwd()) {
  const overlay = path.join(rootDir, "src", "components", "layout", "KeyboardShortcutsOverlay.tsx");
  if (!fs.existsSync(overlay)) return [];
  const text = fs.readFileSync(overlay, "utf8");
  const conflicts = [];
  for (const reserved of RESERVED_SHORTCUTS) {
    const wantsShift = reserved.modifiers.includes("shift");
    const label = `Ctrl + ${wantsShift ? "Shift + " : ""}${reserved.key.toUpperCase()}`;
    if (text.includes(label)) {
      conflicts.push({ file: "src/components/layout/KeyboardShortcutsOverlay.tsx", chord: label, why: reserved.why });
    }
  }
  return conflicts;
}
