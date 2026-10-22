// check-ui-density — enforces the "simple and easy to use" goal numerically.
//
// Drives the real builder in a headless browser, counts the status chips and
// reading load painted on each workbench, and fails when a surface is more
// decorated than it is actionable. Run with --report to print the numbers
// without gating.
//
// Usage: node scripts/check-ui-density.mjs [--report]
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  DENSITY_BUDGETS,
  DENSITY_PROBE,
  EXPANDED_BUDGETS,
  EXPAND_DISCLOSURES,
  SELECTED_BUDGETS,
  describeDensity,
  findChipTextProblems,
  findDensityOverages,
} from "./usability/ui-density.mjs";

const root = process.cwd();
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";

// The gate runs wherever `npm run build` runs, so browser discovery has to work
// on every CI host, not just a developer's Windows box.
const BROWSER_CANDIDATES =
  process.platform === "win32"
    ? [
        process.env.EDGE_PATH,
        process.env.CHROME_PATH,
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      ].filter(Boolean)
    : [
        process.env.CHROME_PATH,
        process.env.EDGE_PATH,
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      ].filter(Boolean);

function resolveBrowser() {
  for (const candidate of BROWSER_CANDIDATES) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const debugPort = Number(process.env.NOVA_DENSITY_DEBUG_PORT || 14651);
const vitePort = Number(process.env.NOVA_DENSITY_VITE_PORT || 14650);
const reportOnly = process.argv.includes("--report");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Design is measured last. Reaching its "selected" state seeds one control
// from the palette so the inspector mounts, and that insert is saved into the
// project — running design first left every later surface measuring a canvas
// the gate itself had edited, so the numbers depended on the order the
// surfaces were listed in.
const SURFACES = ["project", "logic", "build", "design"];

let ws;
let nextId = 0;
const pending = new Map();
const pageErrors = [];

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
  const target = await evalJs(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    el.scrollIntoView({ block: "center", inline: "nearest" });
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    const blocked = hit && hit !== el && !el.contains(hit);
    const blocker = blocked
      ? (hit.getAttribute("data-builder-mode-button")
          || hit.getAttribute("aria-label")
          || hit.getAttribute("data-builder-onboarding")
          || hit.tagName)
      : null;
    return { x, y, blocked, blocker };
  })()`);
  if (!target) throw new Error(`no element for ${selector}`);
  // CDP mouse events are hit-tested like real ones, so an overlay in front of the
  // target silently steals the click. Say who stole it rather than mis-measure.
  if (target.blocked) {
    throw new Error(`click on ${selector} is blocked by ${target.blocker}`);
  }
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: target.x,
    y: target.y,
    button: "left",
    buttons: 1,
    clickCount: 1,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: target.x,
    y: target.y,
    button: "left",
    buttons: 0,
    clickCount: 1,
  });
  await delay(200);
}

async function waitForReady() {
  for (let i = 0; i < 60; i += 1) {
    try {
      if (await evalJs(`Boolean(document.querySelector("[data-builder-density-root]"))`)) return;
    } catch {
      // vite still compiling
    }
    await delay(400);
  }
  throw new Error("builder workbench never appeared");
}

// The first-run guide paints a full-screen scrim. Input.dispatchMouseEvent is
// hit-tested, so the scrim swallows clicks meant for the mode rail and every
// workbench then measures as the default one. Dismiss it and prove it is gone —
// a silent miss here once made four surfaces report identical numbers.
async function dismissOnboarding() {
  let lastReason = "";
  for (let i = 0; i < 12; i += 1) {
    const present = await evalJs(`Boolean(document.querySelector("[data-builder-onboarding]"))`);
    if (!present) return;
    try {
      await clickCenter("[data-builder-onboarding-skip]");
    } catch (error) {
      // The guide may still be mounting; keep the reason for the final report.
      lastReason = error.message;
    }
    await delay(400);
  }
  if (await evalJs(`Boolean(document.querySelector("[data-builder-onboarding]"))`)) {
    throw new Error(
      `the first-run guide would not dismiss; workbench clicks are unreachable` +
        (lastReason ? ` (${lastReason})` : ""),
    );
  }
}

function connectToBrowser(page) {
  return new Promise((resolve, reject) => {
    ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.onopen = resolve;
    ws.onerror = reject;
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
      // A workbench that failed to render must not be reported as "0 chips".
      // Silence here once turned a real crash into a passing measurement.
      if (msg.method === "Runtime.exceptionThrown") {
        const text = msg.params?.exceptionDetails?.exception?.description
          || msg.params?.exceptionDetails?.text
          || "unknown page error";
        console.error(`  page error: ${String(text).split("\n")[0]}`);
        pageErrors.push(String(text).split("\n")[0]);
      }
      if (msg.method === "Runtime.consoleAPICalled" && msg.params?.type === "error") {
        const text = (msg.params.args || [])
          .map((arg) => arg.value ?? arg.description ?? "")
          .join(" ");
        if (text) {
          console.error(`  console.error: ${text.split("\n")[0]}`);
          pageErrors.push(text.split("\n")[0]);
        }
      }
    };
  });
}

async function findPage() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      const page = (await res.json()).find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page;
    } catch {
      // browser still booting
    }
    await delay(300);
  }
  throw new Error("no browser page target");
}

async function measureSurface(surface) {
  await clickCenter(`[data-builder-mode-button="${surface}"]`);
  await delay(1200);
  // Measuring the wrong workbench once reported every surface as quiet. Make
  // the mode change itself part of the assertion.
  const active = await evalJs(`(() => {
    const el = document.querySelector("[data-builder-mode-button='${surface}']");
    return el ? el.getAttribute("aria-current") === "page" || el.getAttribute("data-active") === "true" : null;
  })()`);
  if (active === false) {
    throw new Error(`clicking the ${surface} mode button did not switch workbench`);
  }
  // The scope hook is stamped with the mode it is showing. A click that looked
  // like it landed but left the previous workbench mounted would otherwise be
  // measured as the new surface.
  const scope = await evalJs(
    `document.querySelector("[data-builder-density-root]")?.getAttribute("data-builder-density-root")`,
  );
  if (scope !== surface) {
    throw new Error(`density scope is "${scope}" after clicking ${surface} — measuring the wrong workbench`);
  }
  const collapsed = await evalJs(DENSITY_PROBE);
  await evalJs(EXPAND_DISCLOSURES);
  await delay(500);
  const expanded = await evalJs(DENSITY_PROBE);
  // The lived-in state: panels open and something selected. Selection mounts
  // the inspector, which is where the decoration concentrates — an empty
  // canvas is quieter than any surface a user actually edits on.
  //
  // Canvas nodes only exist once a page has items on it; the project tree
  // always has rows and clicking one selects the node behind it. When neither
  // is present, seeding one control from the palette is what a user does in
  // the first minute — and the inspector it mounts is the state worth
  // measuring.
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
  let selectable = await evalJs(countSelectable);
  if (!selectable.nodes && !selectable.treeRows) {
    const canSeed = await evalJs(
      `Boolean(document.querySelector("[data-builder-density-root] [data-builder-component-kit-insert]"))`,
    );
    if (!canSeed) {
      return { collapsed, expanded, selected: null, selectable };
    }
    await clickCenter(`[data-builder-density-root] [data-builder-component-kit-insert]`);
    await delay(800);
    selectable = await evalJs(countSelectable);
    if (!selectable.nodes && !selectable.treeRows) {
      return { collapsed, expanded, selected: null, selectable };
    }
  }
  await clickCenter(SELECTABLE);
  await delay(600);
  await evalJs(EXPAND_DISCLOSURES);
  await delay(400);
  return { collapsed, expanded, selected: await evalJs(DENSITY_PROBE), selectable };
}

async function main() {
  const browserPath = resolveBrowser();
  if (!browserPath) {
    console.error(
      "check-ui-density: no Chrome/Edge/Chromium found. Install one or set EDGE_PATH / CHROME_PATH.",
    );
    process.exit(1);
  }

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "nova-density-"));
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

  const cleanup = () => {
    for (const proc of [browserProc, vite]) {
      if (!proc || proc.killed) continue;
      if (process.platform === "win32" && proc.pid) {
        spawn("taskkill", ["/PID", String(proc.pid), "/T", "/F"], { stdio: "ignore" });
      } else {
        proc.kill("SIGTERM");
      }
    }
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // temp dir cleanup is best-effort
    }
  };
  process.on("exit", cleanup);

  try {
    await delay(4000);
    await connectToBrowser(await findPage());
    await send("Runtime.enable");
    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 960,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send("Page.navigate", { url: `http://127.0.0.1:${vitePort}/` });
    await waitForReady();

    // Measure the workbench the way a user sees it: first-run guide dismissed.
    await dismissOnboarding();

    console.log(`check-ui-density: workbench density at 1440x960${reportOnly ? " (report)" : ""}`);
    const problems = [];
    const reports = new Map();
    for (const surface of SURFACES) {
      // Every surface is measured from the same clean state. Seeding a control
      // on one surface (to reach the selected state) would otherwise show up
      // as extra rows on the next, and then the numbers would depend on the
      // order the surfaces happen to be listed in.
      if (surface !== SURFACES[0]) {
        await send("Page.navigate", { url: `http://127.0.0.1:${vitePort}/` });
        await waitForReady();
        await dismissOnboarding();
      }
      const pair = await measureSurface(surface);
      reports.set(surface, pair);
      console.log("  " + describeDensity(surface, pair.collapsed, "collapsed"));
      console.log("  " + describeDensity(surface, pair.expanded, "expanded "));
      if (reportOnly) {
        const s = pair.selectable ?? { nodes: 0, treeRows: 0 };
        console.log(
          `  ${surface.padEnd(8)} selectable: canvas=${s.nodes} tree=${s.treeRows}` +
            `${pair.selected ? "" : "  (nothing to select — no 'selected' measurement)"}`,
        );
      }
      // Budgets are judged even in report mode. A report that never asks the
      // question used to print "ok" for surfaces it had not compared, which is
      // the same defect as a gate that prints a verdict and exits 0. The only
      // difference between the modes is whether the verdict can fail the run.
      problems.push(...findDensityOverages(surface, pair.collapsed, DENSITY_BUDGETS, "collapsed"));
      problems.push(...findDensityOverages(surface, pair.expanded, EXPANDED_BUDGETS, "expanded"));
      problems.push(...findChipTextProblems(pair.collapsed, `${surface} collapsed`));
      problems.push(...findChipTextProblems(pair.expanded, `${surface} expanded`));
      if (pair.selected) {
        console.log("  " + describeDensity(surface, pair.selected, "selected "));
        problems.push(...findChipTextProblems(pair.selected, `${surface} selected`));
        if (!SELECTED_BUDGETS[surface]) {
          // Measuring a state nothing judges is how a quiet verdict gets
          // printed for decoration nobody checked.
          problems.push(
            `${surface} (selected): measured a state with no budget in SELECTED_BUDGETS`,
          );
        } else {
          problems.push(...findDensityOverages(surface, pair.selected, SELECTED_BUDGETS, "selected"));
        }
      }
    }

    if (reportOnly) {
      for (const state of ["expanded", "selected"]) {
        console.log(`\n  repeated chip text in the ${state} state:`);        for (const surface of SURFACES) {
          const report = reports.get(surface)[state];
          if (!report) continue;
          console.log(`  ${surface}:`);
          for (const entry of report.chipHistogram.slice(0, 10)) {
            console.log(
              `    ${String(entry.count).padStart(3)}x  "${entry.text}"  ${entry.sampleTag}`,
            );
          }
        }
      }
    }

    if (pageErrors.length > 0) {
      console.error(`\ncheck-ui-density: the page threw ${pageErrors.length} error(s) while measuring`);
      for (const error of [...new Set(pageErrors)].slice(0, 5)) console.error(`  - ${error}`);
      process.exit(1);
    }

    // A workbench that failed to mount looks "quiet". Require enough controls
    // to be a real surface before trusting its numbers.
    for (const surface of SURFACES) {
      const { collapsed } = reports.get(surface);
      if (collapsed.controlCount < 10) {
        console.error(
          `\ncheck-ui-density: ${surface} exposed only ${collapsed.controlCount} controls; the workbench probably failed to render`,
        );
        process.exit(1);
      }
    }

    if (problems.length > 0) {
      console.error(
        `\ncheck-ui-density: ${problems.length} surface(s) over budget` +
          (reportOnly ? " (report mode does not fail)" : ""),
      );
      for (const problem of problems) console.error(`  - ${problem}`);
      if (!reportOnly) process.exit(1);
    } else {
      console.log("\ncheck-ui-density ok: every workbench is within its density budget.");
    }
  } finally {
    cleanup();
  }
}

main().catch((error) => {
  console.error(`check-ui-density: ${error.message}`);
  process.exit(1);
});
