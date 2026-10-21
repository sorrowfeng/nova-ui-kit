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

/** Accessible-name + focusability audit over the whole document. */
const DOM_AUDIT = `(() => {
  const describe = (el) => {
    const id = el.id ? '#' + el.id : '';
    const data = Array.from(el.attributes)
      .filter((a) => a.name.startsWith('data-'))
      .map((a) => a.name + '=' + String(a.value).slice(0, 40));
    return el.tagName.toLowerCase() + id + (data.length ? '[' + data.join(',') + ']' : '');
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
    check(design.unnamedCount === 0, "design mode: every interactive control has a name (checklist 4.1 / 4.3)", design.unnamed.slice(0, 5).join(", "));
    check(
      design.persistentLiveRegion,
      "builder keeps a persistent live region for action feedback (checklist 6.6)",
      `liveRegions=${design.liveRegions}`,
    );

    console.log("[a11y] section 4 — project workspace");
    await clickCenter('[data-builder-mode-button="project"]');
    await delay(1500);
    const project = await evalJs(DOM_AUDIT);
    check(project.unnamedCount === 0, "project mode: every interactive control has a name (checklist 4.x)", project.unnamed.slice(0, 5).join(", "));

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
    check(compact.unnamedCount === 0, "compact viewport: every interactive control has a name", compact.unnamed.slice(0, 5).join(", "));
    check(compact.total > 20, "compact viewport still exposes the main controls", `total=${compact.total}`);
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
