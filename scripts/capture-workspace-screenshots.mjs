import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "docs", "screenshots");
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const browserCandidates =
  process.platform === "win32"
    ? [
        process.env.EDGE_PATH,
        process.env.CHROME_PATH,
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      ].filter(Boolean)
    : [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"];

let viteProcess = null;
let browserProcess = null;
let socket = null;
let nextMessageId = 1;
const pending = new Map();
let userDataDir = "";
let viteOutput = "";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

function cleanup() {
  try {
    socket?.close();
  } catch {}
  for (const child of [browserProcess, viteProcess]) {
    if (!child || child.killed) continue;
    if (process.platform === "win32" && child.pid) {
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      child.kill("SIGTERM");
    }
  }
  if (userDataDir) {
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

function fail(message) {
  cleanup();
  console.error(message);
  if (viteOutput.trim()) console.error(viteOutput.trim().slice(-1500));
  process.exit(1);
}

process.on("exit", cleanup);
process.on("SIGINT", () => fail("interrupted"));

function browserPath() {
  for (const candidate of browserCandidates) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  fail("No Chrome/Edge executable found.");
}

function startVite(port) {
  viteProcess = spawn(npmBin, ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: root,
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  viteProcess.stdout.on("data", (chunk) => {
    viteOutput += chunk.toString();
  });
  viteProcess.stderr.on("data", (chunk) => {
    viteOutput += chunk.toString();
  });
}

function startBrowser(debugPort) {
  userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "nova-shot-"));
  browserProcess = spawn(
    browserPath(),
    [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${userDataDir}`,
      "--window-size=1440,900",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
}

async function websocketText(data) {
  if (typeof data === "string") return data;
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
  if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString("utf8");
  return String(data);
}

async function connect(debugPort) {
  const start = Date.now();
  let pages;
  while (Date.now() - start < 20000) {
    try {
      pages = await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json();
      if (pages.some((entry) => entry.type === "page" && entry.webSocketDebuggerUrl)) break;
    } catch {
      await delay(250);
    }
  }
  const page = pages?.find((entry) => entry.type === "page" && entry.webSocketDebuggerUrl) ?? pages?.[0];
  if (!page?.webSocketDebuggerUrl) fail("No DevTools page websocket.");
  socket = new WebSocket(page.webSocketDebuggerUrl);
  socket.addEventListener("message", async (event) => {
    const payload = JSON.parse(await websocketText(event.data));
    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id);
      pending.delete(payload.id);
      if (payload.error) reject(new Error(payload.error.message));
      else resolve(payload.result);
    }
  });
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
}

function send(method, params = {}) {
  const id = nextMessageId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`${method} timed out`));
      }
    }, 20000).unref?.();
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "evaluate failed");
  return result.result?.value;
}

async function waitFor(expression, label, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if (await evaluate(expression)) return;
    } catch {}
    await delay(200);
  }
  fail(`${label} did not become true`);
}

async function setViewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: width,
    screenHeight: height,
  });
}

async function screenshot(name) {
  const result = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  const file = path.join(outputDir, `${name}.png`);
  fs.writeFileSync(file, Buffer.from(result.data, "base64"));
  const bytes = fs.readFileSync(file);
  const png = bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  console.log(`  saved ${name}.png ${width}x${height} png=${png} ${bytes.length}b`);
  return file;
}

async function click(selector) {
  await evaluate(`(() => {
    const node = document.querySelector(${JSON.stringify(selector)});
    if (!node) return false;
    node.click();
    return true;
  })()`);
  await delay(400);
}

async function load(url, width, height) {
  await setViewport(width, height);
  await send("Page.navigate", { url });
  await waitFor(`Boolean(document.querySelector("[data-editor-shell='builder']"))`, "builder shell");
  await evaluate(`localStorage.setItem("nova-language", "zh-CN");
    localStorage.setItem("nova-language-user-set", "true");
    localStorage.setItem("nova-toolbar-labels-visible", "true");
    localStorage.setItem("nova-command-hints-visible", "true");
    localStorage.setItem("nova-density", "cozy");
    // The first-run guide is a modal; leaving it up makes every workspace
    // screenshot a picture of a dialog instead of the workbench.
    localStorage.setItem("nova-onboarding-done", "true");`);
  await send("Page.navigate", { url });
  await waitFor(`Boolean(document.querySelector("[data-builder-readable-workbench]"))`, "builder workbench");
  if (await evaluate(`Boolean(document.querySelector("[data-builder-onboarding]"))`)) {
    await click("[data-builder-onboarding-skip]");
    await delay(300);
  }
  await delay(700);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const port = await freePort();
  const debugPort = await freePort();
  startVite(port);
  startBrowser(debugPort);
  // wait for vite http
  const start = Date.now();
  while (Date.now() - start < 30000) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}`);
      if (res.ok) break;
    } catch {
      await delay(250);
    }
  }
  await connect(debugPort);
  await send("Page.enable");
  await send("Runtime.enable");
  const url = `http://127.0.0.1:${port}`;

  console.log("Capturing workspace screenshots...");
  await load(url, 1440, 900);

  // Project mode
  await click("[data-builder-mode-button='project']");
  await waitFor(
    `document.querySelector("[data-builder-mode-button='project']")?.getAttribute("aria-current") === "page"`,
    "project mode",
  );
  await delay(500);
  await screenshot("project-workspace");

  // Design mode
  await click("[data-builder-mode-button='design']");
  await waitFor(
    `document.querySelector("[data-builder-mode-button='design']")?.getAttribute("aria-current") === "page"`,
    "design mode",
  );
  await delay(500);
  await screenshot("design-workspace");

  // Logic mode
  await click("[data-builder-mode-button='logic']");
  await waitFor(
    `document.querySelector("[data-builder-mode-button='logic']")?.getAttribute("aria-current") === "page"`,
    "logic mode",
  );
  await delay(500);
  await screenshot("logic-workspace");

  // Build mode
  await click("[data-builder-mode-button='build']");
  await waitFor(
    `document.querySelector("[data-builder-mode-button='build']")?.getAttribute("aria-current") === "page"`,
    "build mode",
  );
  await delay(500);
  await screenshot("build-workspace");

  cleanup();
  console.log("Workspace screenshots updated in docs/screenshots/");
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
