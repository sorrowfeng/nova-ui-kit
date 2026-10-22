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
  describeDensity,
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

const SURFACES = ["project", "design", "logic", "build"];

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
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: point.x,
    y: point.y,
    button: "left",
    buttons: 1,
    clickCount: 1,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: point.x,
    y: point.y,
    button: "left",
    buttons: 0,
    clickCount: 1,
  });
  await delay(200);
}

async function waitForReady() {
  for (let i = 0; i < 60; i += 1) {
    try {
      if (await evalJs(`Boolean(document.querySelector("[data-builder-readable-workbench]"))`)) return;
    } catch {
      // vite still compiling
    }
    await delay(400);
  }
  throw new Error("builder workbench never appeared");
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
  const collapsed = await evalJs(DENSITY_PROBE);
  await evalJs(EXPAND_DISCLOSURES);
  await delay(500);
  const expanded = await evalJs(DENSITY_PROBE);
  return { collapsed, expanded };
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
    if (await evalJs(`Boolean(document.querySelector("[data-builder-onboarding]"))`)) {
      await clickCenter("[data-builder-onboarding-skip]");
      await delay(400);
    }

    console.log(`check-ui-density: workbench density at 1440x960${reportOnly ? " (report)" : ""}`);
    const problems = [];
    const reports = new Map();
    for (const surface of SURFACES) {
      const pair = await measureSurface(surface);
      reports.set(surface, pair);
      console.log("  " + describeDensity(surface, pair.collapsed, "collapsed"));
      console.log("  " + describeDensity(surface, pair.expanded, "expanded "));
      if (!reportOnly) {
        problems.push(...findDensityOverages(surface, pair.collapsed, DENSITY_BUDGETS, "collapsed"));
        problems.push(...findDensityOverages(surface, pair.expanded, EXPANDED_BUDGETS, "expanded"));
      }
    }

    if (reportOnly) {
      console.log("\n  repeated chip text in the expanded state:");
      for (const surface of SURFACES) {
        console.log(`  ${surface}:`);
        for (const entry of reports.get(surface).expanded.chipHistogram.slice(0, 10)) {
          console.log(`    ${String(entry.count).padStart(3)}x  "${entry.text}"`);
        }
      }
    }

    if (problems.length > 0) {
      console.error(`\ncheck-ui-density: ${problems.length} surface(s) over budget`);
      for (const problem of problems) console.error(`  - ${problem}`);
      process.exit(1);
    }
    console.log("\ncheck-ui-density ok: every workbench is within its density budget.");
  } finally {
    cleanup();
  }
}

main().catch((error) => {
  console.error(`check-ui-density: ${error.message}`);
  process.exit(1);
});
