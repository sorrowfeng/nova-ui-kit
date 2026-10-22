// check-a11y — automated slice of docs/accessibility-checklist.md (P3-15).
// Drives the real builder in a headless browser and asserts the checks that
// can be measured from the DOM: accessible names, focusability, disclosure
// state and live-region feedback. Manual items stay in the checklist doc.
//
// Usage: node scripts/check-a11y.mjs
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  auditAccessibilityTree,
  CHINESE_UI_AUDIT,
} from "./a11y/accessibility-tree.mjs";
import { COLOR_ONLY_AUDIT } from "./a11y/color-only-state.mjs";
import {
  findReservedDocumentedShortcuts,
  findReservedShortcutConflicts,
} from "./a11y/reserved-shortcuts.mjs";
import { EXPAND_DISCLOSURES } from "./usability/ui-density.mjs";

const root = process.cwd();
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const browserPath =
  process.env.EDGE_PATH ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const debugPort = Number(process.env.NOVA_A11Y_DEBUG_PORT || 14551);
const vitePort = Number(process.env.NOVA_A11Y_VITE_PORT || 14550);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const failures = [];
const passes = [];

function check(ok, label, detail) {
  if (ok) {
    passes.push(label);
    console.log(`  ok  ${label}`);
  } else {
    failures.push({ label, detail });
    console.log(`  FAIL ${label}${detail ? ` :: ${detail}` : ""}`);
  }
}

let ws;
let nextId = 0;
const pending = new Map();

function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalJs(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) {
    throw new Error(r.result.exceptionDetails.text || "evaluate failed");
  }
  return r.result?.result?.value;
}

async function clickCenter(selector) {
  const point = await evalJs(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    el.scrollIntoView({ block: "center", inline: "nearest" });
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (!point) throw new Error(`no element for ${selector}`);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await delay(150);
}

const KEY_VK = {
  Tab: 9,
  Escape: 27,
  F1: 112,
};

async function pressKey(key) {
  const code = key.length === 1 ? `Key${key.toUpperCase()}` : key;
  const vk = KEY_VK[key] ?? 0;
  const base = { key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
  await send("Input.dispatchKeyEvent", { type: "keyDown", ...base });
  await send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
  await delay(250);
}

async function focusElement(selector) {
  const ok = await evalJs(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    el.focus();
    return document.activeElement === el || el.contains(document.activeElement);
  })()`);
  if (!ok) throw new Error(`cannot focus ${selector}`);
  await delay(120);
}

/** Where the keyboard focus currently sits, as a comparable marker. */
async function focusMarker() {
  return evalJs(`(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { tag: "body" };
    const data = Array.from(el.attributes)
      .filter((a) => a.name.startsWith("data-"))
      .map((a) => a.name + "=" + String(a.value))
      .sort()
      .join("|");
    return { tag: el.tagName.toLowerCase(), data, aria: el.getAttribute("aria-label") || "" };
  })()`);
}

/**
 * Untranslated English, across the states someone actually works in.
 *
 * A single snapshot of the default surface cannot see the inspector (it
 * mounts only when something is selected), the debugger tabs, or anything
 * inside a closed disclosure — so it reported "no English" while the workbench
 * was full of it. The density gate already learned this lesson and measures
 * collapsed / expanded / selected per workbench; wording has to be held to the
 * same coverage or checklist 6.7 is a claim, not a check.
 *
 * The viewport matters as much as the state: this runs after the 200% scaling
 * approximation, which leaves the page at 720x480 where every `hidden md:flex`
 * label is display:none and therefore invisible to the walker below. Reset
 * first, or the audit is a slice of the UI rather than the UI.
 */
async function collectChineseLeftovers() {
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await delay(600);

  const SELECTABLE =
    "[data-builder-density-root] [data-builder-node-id], [data-builder-density-root] [data-builder-project-tree-node]";
  const countSelectable = `(() => {
    const root = document.querySelector("[data-builder-density-root]");
    if (!root) return { nodes: 0, treeRows: 0 };
    return {
      nodes: root.querySelectorAll("[data-builder-node-id]").length,
      treeRows: root.querySelectorAll("[data-builder-project-tree-node]").length,
    };
  })()`;

  const seen = new Map();
  for (const mode of ["project", "design", "logic", "build"]) {
    await clickCenter(`[data-builder-mode-button="${mode}"]`);
    await delay(1200);
    const scope = await evalJs(
      `document.querySelector("[data-builder-density-root]")?.getAttribute("data-builder-density-root")`,
    );
    if (scope !== mode) {
      throw new Error(`chinese-ui audit: density scope is "${scope}" after clicking ${mode}`);
    }

    for (const state of ["collapsed", "expanded", "selected"]) {
      if (state !== "collapsed") {
        await evalJs(EXPAND_DISCLOSURES);
        await delay(400);
      }
      if (state === "selected") {
        // Same seeding rule as the density gate: a canvas node, else a project
        // tree row, else one control from the palette — which is what a user
        // does in the first minute and what mounts the inspector.
        let selectable = await evalJs(countSelectable);
        if (!selectable.nodes && !selectable.treeRows) {
          const canSeed = await evalJs(
            `Boolean(document.querySelector("[data-builder-density-root] [data-builder-component-kit-insert]"))`,
          );
          if (!canSeed) continue;
          await clickCenter(`[data-builder-density-root] [data-builder-component-kit-insert]`);
          await delay(800);
          selectable = await evalJs(countSelectable);
          if (!selectable.nodes && !selectable.treeRows) continue;
        }
        await clickCenter(SELECTABLE);
        await delay(600);
        await evalJs(EXPAND_DISCLOSURES);
        await delay(400);
      }

      const found = await evalJs(CHINESE_UI_AUDIT);
      for (const item of found.leftovers ?? []) {
        const key = item.text + "|" + (item.hook || "");
        if (!seen.has(key)) seen.set(key, { ...item, where: [] });
        seen.get(key).where.push(`${mode}/${state}`);
      }
    }
  }

  const leftovers = [...seen.values()];
  return { leftoverCount: leftovers.length, leftovers };
}

/** Name + focus-ring assertions that every audited surface must clear. */
function checkSurface(report, label) {
  check(report.unnamedCount === 0, `${label}: every interactive control has a name (checklist 3.5 / 4.x)`, report.unnamed.slice(0, 5).join(", "));
  check(
    report.noFocusRingCount === 0,
    `${label}: interactive controls carry a focus-ring affordance (checklist 1.2)`,
    report.noFocusRingCount ? `${report.noFocusRingCount} e.g. ${report.noFocusRing.slice(0, 5).join(", ")}` : "",
  );
}

/** Accessible-name + focusability audit over the whole document. */
const DOM_AUDIT = `(() => {
  const describe = (el) => {
    const id = el.id ? '#' + el.id : '';
    const data = Array.from(el.attributes)
      .filter((a) => a.name.startsWith('data-'))
      .map((a) => a.name + '=' + String(a.value).slice(0, 40));
    const label = el.getAttribute('aria-label') || (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 24);
    const cls = String(el.className || '').split(/\\s+/).filter(Boolean).slice(0, 6).join('.');
    return el.tagName.toLowerCase() + id + (data.length ? '[' + data.join(',') + ']' : '') + (label ? '{' + label + '}' : '') + (cls ? '.' + cls : '');
  };
  const nameOf = (el) => {
    const label = el.getAttribute('aria-label');
    if (label && label.trim()) return label.trim();
    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      const parts = labelledBy.split(/\\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ').trim();
      if (parts) return parts;
    }
    const title = el.getAttribute('title');
    if (title && title.trim()) return title.trim();
    const text = (el.textContent || '').replace(/\\s+/g, ' ').trim();
    if (text) return text;
    const imgAlt = el.querySelector('img[alt],svg[aria-label]')?.getAttribute('alt') || el.querySelector('svg[aria-label]')?.getAttribute('aria-label');
    if (imgAlt && imgAlt.trim()) return imgAlt.trim();
    return '';
  };

  const interactive = Array.from(document.querySelectorAll(
    'button, a[href], input, select, textarea, [role="button"], [role="menuitem"], [role="tab"], [role="option"], [role="switch"], [role="checkbox"], [role="radio"], [contenteditable="true"]'
  ));

  const unnamed = [];
  const hiddenFocusable = [];
  const positiveTabIndex = [];
  const noFocusRing = [];

  for (const el of interactive) {
    const style = getComputedStyle(el);
    const inertish = el.closest('[inert], [aria-hidden="true"], [hidden]');
    const rendered = style.display !== 'none' && style.visibility !== 'hidden' && el.getClientRects().length > 0;
    if (inertish && rendered && el.tabIndex >= 0) {
      hiddenFocusable.push(describe(el));
    }
    if (el.tabIndex > 0) {
      positiveTabIndex.push(describe(el) + ' tabindex=' + el.tabIndex);
    }
    if (!rendered) continue;
    if (el.getAttribute('aria-hidden') === 'true') continue;
    const type = el.getAttribute('type');
    if (el.tagName === 'INPUT' && (type === 'hidden' || type === 'submit')) continue;
    if (!nameOf(el)) {
      unnamed.push(describe(el));
    }
    const cls = String(el.className || '');
    const hasRing = /focus-ring|focus-visible|outline|ring-/.test(cls) || el.matches(':focus-visible');
    if (!hasRing && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'SELECT') {
      noFocusRing.push(describe(el));
    }
  }

  // Closed <details> still lays out its content (content-visibility), so a
  // zero-rect test is not enough. What matters for accessibility is whether the
  // content is actually reachable — hit-test the centre of each descendant.
  const hitTestable = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    // Only the element itself or something inside it counts. An ancestor hit
    // means the content is clipped away and clicks land on the shell.
    return Boolean(hit && (hit === el || el.contains(hit)));
  };
  const disclosures = Array.from(document.querySelectorAll('details')).map((d) => ({
    target: describe(d),
    open: d.open,
    summaryNamed: Boolean(nameOf(d.querySelector('summary'))),
    contentReachableWhenClosed: d.open
      ? false
      : Array.from(d.querySelectorAll('*')).some((child) => !child.closest('summary') && hitTestable(child)),
  }));

  const liveRegions = Array.from(document.querySelectorAll('[aria-live], [role="status"], [role="alert"]')).length;
  // A live region only announces reliably if it is mounted before its text
  // changes, so the builder must keep a persistent one around (checklist 6.x).
  const persistentLiveRegion = Array.from(
    document.querySelectorAll('[data-builder-live-region], [data-builder-project-jump-feedback]'),
  ).some((el) => el.hasAttribute('aria-live') || el.getAttribute('role') === 'status' || el.getAttribute('role') === 'alert');

  return {
    total: interactive.length,
    unnamed: unnamed.slice(0, 25),
    unnamedCount: unnamed.length,
    hiddenFocusable,
    positiveTabIndex,
    noFocusRing: noFocusRing.slice(0, 25),
    noFocusRingCount: noFocusRing.length,
    disclosures,
    liveRegions,
    persistentLiveRegion,
  };
})()`;

async function main() {
  console.log("[a11y] section 0 — global shortcut reservations (checklist 3.3)");
  const reservedHits = findReservedShortcutConflicts(root);
  check(
    reservedHits.length === 0,
    "no global shortcut captures a chord the shell reserves",
    reservedHits.map((h) => `${h.file}:${h.line} ${h.chord} (${h.why})`).join("; "),
  );
  const documentedHits = findReservedDocumentedShortcuts(root);
  check(
    documentedHits.length === 0,
    "the shortcut overlay does not advertise reserved chords",
    documentedHits.map((h) => `${h.chord} (${h.why})`).join("; "),
  );

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "nova-a11y-"));
  const vite = spawn(npmBin, ["run", "dev", "--", "--port", String(vitePort)], {
    cwd: root,
    stdio: "ignore",
    shell: process.platform === "win32",
  });
  const browserProc = spawn(
    browserPath,
    [
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${userDataDir}`,
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--window-size=1440,960",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  try {
    await delay(4000);
    let page;
    for (let i = 0; i < 40 && !page; i += 1) {
      try {
        const res = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
        page = (await res.json()).find((t) => t.type === "page");
      } catch {
        // retry
      }
      if (!page) await delay(300);
    }
    if (!page) throw new Error("no browser page target");

    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    };

    await send("Runtime.enable");
    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 960,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send("Page.navigate", { url: `http://127.0.0.1:${vitePort}/` });
    await delay(5000);

    console.log("[a11y] dismissing onboarding");
    if (await evalJs(`Boolean(document.querySelector("[data-builder-onboarding]"))`)) {
      await clickCenter('[data-builder-onboarding-skip]');
      await delay(400);
    }

    console.log("[a11y] section 1/2 — focusability and accessible names (shell)");
    const shell = await evalJs(DOM_AUDIT);
    check(shell.total > 20, "shell exposes interactive controls", `total=${shell.total}`);
    check(
      shell.unnamedCount === 0,
      "every interactive control has an accessible name (checklist 3.5 / 4.x)",
      shell.unnamedCount ? `${shell.unnamedCount} unnamed e.g. ${shell.unnamed.slice(0, 5).join(", ")}` : "",
    );
    check(
      shell.positiveTabIndex.length === 0,
      "no positive tabindex breaks document order (checklist 2.x)",
      shell.positiveTabIndex.slice(0, 5).join(", "),
    );
    check(
      shell.hiddenFocusable.length === 0,
      "controls inside inert/aria-hidden containers are not focusable (checklist 5.1)",
      shell.hiddenFocusable.slice(0, 5).join(", "),
    );
    check(
      shell.noFocusRingCount === 0,
      "interactive controls carry a focus-ring affordance (checklist 1.2)",
      shell.noFocusRingCount ? `${shell.noFocusRingCount} e.g. ${shell.noFocusRing.slice(0, 5).join(", ")}` : "",
    );

    // Section 5 — collapsed disclosures keep their content out of tab order.
    for (const d of shell.disclosures) {
      check(
        d.summaryNamed,
        `disclosure summary is named: ${d.target}`,
        d.summaryNamed ? "" : "summary has no accessible name",
      );
      check(
        d.open || !d.contentReachableWhenClosed,
        `collapsed disclosure is not reachable: ${d.target}`,
        "content inside a closed details is still hit-testable",
      );
    }

    console.log("[a11y] section 3 — design canvas");
    await clickCenter('[data-builder-mode-button="design"]');
    await delay(1500);
    const design = await evalJs(DOM_AUDIT);
    checkSurface(design, "design mode");
    check(
      design.persistentLiveRegion,
      "builder keeps a persistent live region for action feedback (checklist 6.6)",
      `liveRegions=${design.liveRegions}`,
    );

    console.log("[a11y] section 4 — project workspace");
    await clickCenter('[data-builder-mode-button="project"]');
    await delay(1500);
    const project = await evalJs(DOM_AUDIT);
    checkSurface(project, "project mode");

    console.log("[a11y] section 5 — logic and build");
    for (const mode of ["logic", "build"]) {
      await clickCenter(`[data-builder-mode-button="${mode}"]`);
      await delay(1500);
      const report = await evalJs(DOM_AUDIT);
      check(report.unnamedCount === 0, `${mode} mode: every interactive control has a name (checklist 4.x)`, report.unnamed.slice(0, 5).join(", "));
    }

    // Checklists 3.5 / 4.x also cover the compact viewport.
    console.log("[a11y] section 6 — compact viewport 1100x720 (checklist 2.6 / 7.2)");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1100,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await delay(1200);
    await clickCenter('[data-builder-mode-button="project"]');
    await delay(1200);
    const compact = await evalJs(DOM_AUDIT);
    checkSurface(compact, "compact viewport 1100x720");
    check(compact.total > 20, "compact viewport still exposes the main controls", `total=${compact.total}`);

    // Checklists 1.4 / 2.7 — a modal must take focus on open and hand it back
    // on close. Without the restore step keyboard users land on document.body.
    console.log("[a11y] section 7 — dialog focus entry and return (checklist 1.4 / 2.7)");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 960,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await delay(800);
    await focusElement('[data-builder-mode-button="design"]');
    const opener = await focusMarker();

    await pressKey("F1");
    await delay(400);
    const overlayOpen = await evalJs(`Boolean(document.querySelector("[data-builder-shortcuts-overlay]"))`);
    check(overlayOpen, "F1 opens the keyboard shortcut dialog (checklist 3.1)");
    const insideDialog = await evalJs(`(() => {
      const dialog = document.querySelector("[data-builder-shortcuts-overlay]");
      return Boolean(dialog && document.activeElement && dialog.contains(document.activeElement));
    })()`);
    check(insideDialog, "opening a dialog moves focus inside it (checklist 1.4)");

    await pressKey("Escape");
    await delay(400);
    const overlayClosed = await evalJs(`Boolean(document.querySelector("[data-builder-shortcuts-overlay]"))`);
    check(!overlayClosed, "Escape closes the dialog (checklist 3.4)");
    const restored = await focusMarker();
    check(
      JSON.stringify(restored) === JSON.stringify(opener),
      "closing a dialog returns focus to its trigger (checklist 1.4)",
      `before=${JSON.stringify(opener)} after=${JSON.stringify(restored)}`,
    );
    const stranded = await evalJs(`(() => {
      const el = document.activeElement;
      return !el || el === document.body || !el.isConnected;
    })()`);
    check(!stranded, "focus is never stranded on a detached node (checklist 2.7)");

    const tabbedAway = await evalJs(`(() => {
      const start = document.activeElement;
      return Boolean(start && start !== document.body && start.tabIndex >= 0);
    })()`);
    check(tabbedAway, "a shell control can hold focus so Tab can move on (checklist 2.7)");

    // Checklist 7.3 — 200% system scaling is approximated by halving the CSS
    // viewport and doubling the device pixel ratio.
    console.log("[a11y] section 8 — 200% scaling approximation (checklist 7.3)");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 720,
      height: 480,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await delay(1200);
    await clickCenter('[data-builder-mode-button="project"]');
    await delay(1200);
    const scaled = await evalJs(DOM_AUDIT);
    checkSurface(scaled, "200% scaling");
    check(scaled.total > 20, "200% scaling still exposes the main controls", `total=${scaled.total}`);

    // Checklist 1.6 — Windows High Contrast / forced-colors replaces the whole
    // palette. Anything that only spoke through a colour chip goes silent.
    console.log("[a11y] section 9 — forced colours and high contrast (checklist 1.6)");
    await send("Emulation.setEmulatedMedia", {
      features: [
        { name: "forced-colors", value: "active" },
        { name: "prefers-contrast", value: "more" },
        { name: "prefers-reduced-transparency", value: "reduce" },
      ],
    });
    await delay(1000);
    const forced = await evalJs(DOM_AUDIT);
    checkSurface(forced, "forced-colors");
    check(forced.total > 20, "forced-colors still exposes the main controls", `total=${forced.total}`);
    const colorOnly = await evalJs(COLOR_ONLY_AUDIT);
    check(
      colorOnly.colorOnlyCount === 0,
      "no control signals state through colour alone (checklist 1.6)",
      colorOnly.colorOnlyCount
        ? `${colorOnly.colorOnlyCount} e.g. ${colorOnly.colorOnly.slice(0, 5).join(", ")}`
        : "",
    );
    check(
      colorOnly.hasForcedColorsRules,
      "stylesheet declares forced-colors / high-contrast handling (checklist 1.6)",
      "no forced-colors, prefers-contrast or high-contrast rule found in the loaded stylesheets",
    );
    await send("Emulation.setEmulatedMedia", { features: [] });
    await delay(400);

    // Checklist 6.x — a screen reader reads the accessibility tree, not the
    // DOM. That tree is inspectable, so the wording contract is checkable.
    console.log("[a11y] section 10 — accessibility tree wording (checklist 6.x)");
    await send("Accessibility.enable");
    await delay(600);
    const treeResponse = await send("Accessibility.getFullAXTree");
    const ax = auditAccessibilityTree(treeResponse.result?.nodes ?? []);
    check(
      ax.interactiveCount > 20,
      "accessibility tree exposes the interactive controls (checklist 6.x)",
      `interactive=${ax.interactiveCount}`,
    );
    check(
      ax.unnamedInteractiveCount === 0,
      "every interactive node has a name a screen reader can speak (checklist 6.1-6.5)",
      ax.unnamedInteractiveCount
        ? `${ax.unnamedInteractiveCount} e.g. ${ax.unnamedInteractive.slice(0, 5).join(" | ")}`
        : "",
    );
    check(
      ax.liveRegionCount > 0,
      "accessibility tree exposes a live region for status announcements (checklist 6.4 / 6.6)",
      `live=${ax.liveRegionCount}`,
    );
    const phrasing = await collectChineseLeftovers();
    check(
      phrasing.leftoverCount === 0,
      "Chinese UI has no untranslated English labels (checklist 6.7)",
      phrasing.leftoverCount
        ? `${phrasing.leftoverCount}:\n` +
          phrasing.leftovers
            .map(
              (l) =>
                `      <${l.tag}> ${l.text}${l.hook ? `  @${l.hook}` : ""}  [${(l.where || []).slice(0, 3).join(", ")}]`,
            )
            .join("\n")
        : "",
    );
  } finally {
    try { ws?.close(); } catch { /* ignore */ }
    try { spawnSync("taskkill", ["/PID", String(browserProc.pid), "/T", "/F"], { stdio: "ignore" }); } catch { /* ignore */ }
    try { spawnSync("taskkill", ["/PID", String(vite.pid), "/T", "/F"], { stdio: "ignore" }); } catch { /* ignore */ }
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }

  console.log(`\n[a11y] ${passes.length} passed, ${failures.length} failed`);
  if (failures.length > 0) {
    for (const failure of failures) {
      console.log(`  - ${failure.label}${failure.detail ? ` :: ${failure.detail}` : ""}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("check-a11y failed:", error);
  process.exit(1);
});
