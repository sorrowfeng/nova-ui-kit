import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
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
    : [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].filter(Boolean);

let viteProcess = null;
let browserProcess = null;
let devtoolsSocket = null;
let userDataDir = "";
let shuttingDown = false;
let viteOutput = "";

const smokeTimeout = setTimeout(() => {
  fail("timed out after 90 seconds");
}, 90000);
smokeTimeout.unref?.();

function log(message) {
  console.log(`[builder-smoke] ${message}`);
}

function stopProcess(child) {
  if (child && !child.killed) {
    if (process.platform === "win32" && child.pid) {
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      return;
    }
    child.kill("SIGTERM");
  }
}

function stopWindowsProcessesUsingPath(markerPath) {
  if (process.platform !== "win32" || !markerPath) {
    return;
  }
  const encodedMarker = Buffer.from(markerPath, "utf8").toString("base64");
  const script = [
    `$marker = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${encodedMarker}'));`,
    "$deadline = (Get-Date).AddSeconds(3);",
    "do {",
    "$targets = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($marker) };",
    "if (-not $targets) { break };",
    "$targets | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue };",
    "Start-Sleep -Milliseconds 150;",
    "} while ((Get-Date) -lt $deadline)",
  ].join(" ");
  spawnSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script], { stdio: "ignore" });
}

function cleanup() {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  try {
    devtoolsSocket?.close();
  } catch {
    // Best-effort cleanup only.
  }
  stopWindowsProcessesUsingPath(userDataDir);
  stopProcess(browserProcess);
  stopProcess(viteProcess);
  stopWindowsProcessesUsingPath(userDataDir);
  if (userDataDir) {
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : "";
      if (code !== "EBUSY" && code !== "ENOTEMPTY") {
        console.warn(`Builder smoke cleanup warning: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
}

function fail(message) {
  cleanup();
  console.error(`Builder runtime smoke failed: ${message}`);
  if (viteOutput.trim()) {
    console.error(`Vite output:\n${viteOutput.trim().slice(-3000)}`);
  }
  process.exit(1);
}

process.on("exit", cleanup);
process.on("SIGINT", () => fail("interrupted"));
process.on("SIGTERM", () => fail("terminated"));

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

async function waitForHttp(url, label, timeoutMs = 20000) {
  const start = Date.now();
  let lastError = "";
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      lastError = `${response.status} ${response.statusText}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await delay(250);
  }
  fail(`${label} did not become available: ${lastError}`);
}

function findBrowserExecutable() {
  for (const candidate of browserCandidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  fail("could not find Edge or Chrome. Set EDGE_PATH or CHROME_PATH to run browser UI smoke.");
}

function startVite(port) {
  return spawn(npmBin, ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });
}

function startBrowser(browserPath, debugPort, browserUserDataDir) {
  return spawn(
    browserPath,
    [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${browserUserDataDir}`,
      "--window-size=1440,960",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
}

async function websocketText(data) {
  if (typeof data === "string") {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString("utf8");
  }
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString("utf8");
  }
  if (data && typeof data.arrayBuffer === "function") {
    return Buffer.from(await data.arrayBuffer()).toString("utf8");
  }
  return String(data);
}

async function connectDevtools(debugPort) {
  log("waiting for Chrome DevTools");
  await waitForHttp(`http://127.0.0.1:${debugPort}/json/version`, "Chrome DevTools");
  const pages = await (await waitForHttp(`http://127.0.0.1:${debugPort}/json`, "Chrome page list")).json();
  const page = pages.find((entry) => entry.type === "page" && entry.webSocketDebuggerUrl) ?? pages[0];
  if (!page?.webSocketDebuggerUrl) {
    fail("Chrome DevTools did not expose a page websocket.");
  }

  const socket = new WebSocket(page.webSocketDebuggerUrl);
  devtoolsSocket = socket;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("DevTools websocket open timed out")), 10000);
    socket.addEventListener(
      "open",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
    socket.addEventListener(
      "error",
      (event) => {
        clearTimeout(timer);
        reject(new Error(`DevTools websocket error: ${event.message ?? "unknown"}`));
      },
      { once: true },
    );
  });

  let nextId = 1;
  const pending = new Map();
  const rejectAllPending = (error) => {
    for (const { reject, timer } of pending.values()) {
      clearTimeout(timer);
      reject(error);
    }
    pending.clear();
  };

  socket.addEventListener("message", async (event) => {
    try {
      const message = JSON.parse(await websocketText(event.data));
      if (message.id && pending.has(message.id)) {
        const { resolve, reject, timer } = pending.get(message.id);
        pending.delete(message.id);
        clearTimeout(timer);
        if (message.error) {
          reject(new Error(message.error.message));
        } else {
          resolve(message.result);
        }
      }
    } catch (error) {
      rejectAllPending(error instanceof Error ? error : new Error(String(error)));
    }
  });
  socket.addEventListener("error", () => rejectAllPending(new Error("DevTools websocket errored")));
  socket.addEventListener("close", () => {
    if (!shuttingDown) {
      rejectAllPending(new Error("DevTools websocket closed"));
    }
  });

  const send = (method, params = {}, timeoutMs = 10000) =>
    new Promise((resolve, reject) => {
      if (socket.readyState !== WebSocket.OPEN) {
        reject(new Error(`DevTools websocket is not open for ${method}`));
        return;
      }
      const id = nextId++;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`${method} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });

  return { socket, send };
}

async function evaluate(send, expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? "Runtime.evaluate failed");
  }
  return result.result?.value;
}

async function waitFor(send, expression, label, timeoutMs = 15000) {
  const start = Date.now();
  let lastError = "";
  while (Date.now() - start < timeoutMs) {
    try {
      const value = await evaluate(send, expression);
      if (value) {
        return value;
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await delay(250);
  }
  fail(`timed out waiting for ${label}${lastError ? `: ${lastError}` : ""}`);
}

async function assertRuntimeCheck(send, expression, label) {
  const result = await evaluate(send, expression);
  if (!result?.passed) {
    fail(`${label} failed${result?.detail ? `: ${result.detail}` : ""}`);
  }
  return result;
}

async function closeTransientOverlays(send) {
  await evaluate(
    send,
    `(() => {
      const active = document.activeElement;
      active?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
      return true;
    })()`,
  );
  await delay(80);
}

async function clickElementCenter(send, elementExpression, label) {
  const point = await evaluate(
    send,
    `(() => {
      const element = ${elementExpression};
      if (!element) {
        return null;
      }
      element.scrollIntoView({ block: "center", inline: "nearest" });
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return { failed: true, detail: "element has no clickable size", width: rect.width, height: rect.height };
      }
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        text: element.textContent?.trim().replace(/\\s+/g, " ").slice(0, 120) || ""
      };
    })()`,
  );
  if (!point || point.failed) {
    fail(`${label} is not clickable${point?.detail ? `: ${point.detail}` : ""}`);
  }
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
  await delay(120);
  return point;
}

async function openCanvasContextMenuAtCanvasPoint(send, canvasX, canvasY, label) {
  const point = await evaluate(
    send,
    `(() => new Promise((resolve) => {
      const canvas = document.querySelector("[data-builder-canvas]");
      const viewport = document.querySelector("[data-builder-canvas-viewport]");
      if (!canvas) {
        resolve({ ok: false, detail: "missing canvas" });
        return;
      }
      const scrollToPoint = () => {
        const rect = canvas.getBoundingClientRect();
        const zoom = canvas.offsetWidth > 0 ? rect.width / canvas.offsetWidth : 1;
        if (viewport) {
          viewport.scrollTo({
            left: Math.max(0, ${canvasX} * zoom - viewport.clientWidth / 2),
            top: Math.max(0, ${canvasY} * zoom - viewport.clientHeight / 2)
          });
        }
        window.requestAnimationFrame(() => {
          const nextRect = canvas.getBoundingClientRect();
          const nextZoom = canvas.offsetWidth > 0 ? nextRect.width / canvas.offsetWidth : 1;
          resolve({
            ok: true,
            x: nextRect.left + ${canvasX} * nextZoom,
            y: nextRect.top + ${canvasY} * nextZoom,
            zoom: nextZoom
          });
        });
      };
      scrollToPoint();
    }))()`,
  );
  if (!point?.ok) {
    fail(`${label} could not resolve canvas point${point?.detail ? `: ${point.detail}` : ""}`);
  }
  const opened = await evaluate(
    send,
    `(() => {
      const canvas = document.querySelector("[data-builder-canvas]");
      if (!canvas) {
        return false;
      }
      canvas.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: ${point.x},
        clientY: ${point.y}
      }));
      return true;
    })()`,
  );
  if (!opened) {
    fail(`${label} could not open canvas context menu`);
  }
  await delay(100);
}

async function insertCanvasContextComponentAtCanvasPoint(send, componentType, canvasX, canvasY, label) {
  const beforeIds = await evaluate(
    send,
    `Array.from(document.querySelectorAll("[data-builder-node-id]")).map((node) => node.getAttribute("data-builder-node-id")).filter(Boolean)`,
  );
  await openCanvasContextMenuAtCanvasPoint(send, canvasX, canvasY, label);
  await waitFor(
    send,
    `Boolean(document.querySelector('[data-builder-canvas-context-insert-component="${componentType}"]'))`,
    `${label} insert action`,
  );
  await clickElementCenter(
    send,
    `document.querySelector('[data-builder-canvas-context-insert-component="${componentType}"]')`,
    `${label} insert ${componentType}`,
  );
  const insertedId = await waitFor(
    send,
    `(() => {
      const before = new Set(${JSON.stringify(beforeIds)});
      const inserted = Array.from(document.querySelectorAll("[data-builder-node-id]"))
        .map((node) => node.getAttribute("data-builder-node-id"))
        .filter(Boolean)
        .filter((id) => !before.has(id));
      return inserted[0] || "";
    })()`,
    `${label} inserted node`,
  );
  await closeTransientOverlays(send);
  return insertedId;
}

async function fillElementWithText(send, elementExpression, text, label) {
  await clickElementCenter(send, elementExpression, label);
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "a",
    code: "KeyA",
    windowsVirtualKeyCode: 65,
    modifiers: 2,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "a",
    code: "KeyA",
    windowsVirtualKeyCode: 65,
    modifiers: 2,
  });
  await send("Input.insertText", { text });
  await delay(80);
  const changed = await evaluate(
    send,
    `(() => {
      const element = ${elementExpression};
      if (!element) {
        return false;
      }
      element.focus();
      const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, "value")?.set ||
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set ||
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
      const targetValue = ${JSON.stringify(text)};
      const temporaryValue = targetValue.length > 0 ? "" : "__nova_temp__";
      setter?.call(element, temporaryValue);
      element.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: "",
        inputType: "deleteContentBackward"
      }));
      setter?.call(element, ${JSON.stringify(text)});
      element.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: ${JSON.stringify(text)},
        inputType: "insertText"
      }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      return element.value === ${JSON.stringify(text)};
    })()`,
  );
  if (!changed) {
    fail(`${label} could not be filled`);
  }
  await delay(120);
}

async function setElementValue(send, elementExpression, text, label) {
  const changed = await evaluate(
    send,
    `(() => {
      const element = ${elementExpression};
      if (!element) {
        return false;
      }
      element.focus?.();
      const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, "value")?.set ||
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set ||
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
      setter?.call(element, ${JSON.stringify(text)});
      element.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: ${JSON.stringify(text)},
        inputType: "insertText"
      }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      return element.value === ${JSON.stringify(text)};
    })()`,
  );
  if (!changed) {
    fail(`${label} could not be set`);
  }
  await delay(120);
}

async function pressKey(send, { key, code = key, windowsVirtualKeyCode = 0, modifiers = 0 }, label) {
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key,
    code,
    windowsVirtualKeyCode,
    modifiers,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key,
    code,
    windowsVirtualKeyCode,
    modifiers,
  });
  await delay(120);
  if (label) {
    log(label);
  }
}

async function commitInlineTextEditor(send, label) {
  const editorTag = await evaluate(
    send,
    `(() => {
      const editor = document.querySelector("[data-builder-inline-text-editor] textarea, [data-builder-inline-text-editor] input");
      editor?.focus?.();
      return editor?.tagName?.toLowerCase() || "";
    })()`,
  );
  if (!editorTag) {
    fail(`${label} inline text editor is missing`);
  }
  await pressKey(
    send,
    {
      key: "Enter",
      code: "Enter",
      windowsVirtualKeyCode: 13,
      modifiers: editorTag === "textarea" ? 2 : 0,
    },
    `${label} committed with ${editorTag === "textarea" ? "Ctrl+Enter" : "Enter"}`,
  );
}

async function runDesignInteractionChecks(send, verified) {
  log("checking design selection interactions");
  await evaluate(
    send,
    `(() => {
      document.querySelector('[data-builder-mode-button="design"]')?.click();
      document.querySelector("[data-builder-right-dock-expand]")?.click();
      return true;
    })()`,
  );
  await waitFor(
    send,
    `document.querySelector("[data-builder-readable-workbench]")?.getAttribute("data-builder-right-dock-collapsed") === "false"`,
    "right inspector dock expanded for design interaction checks",
  );
  await evaluate(
    send,
    `(() => {
      const canvas = document.querySelector("[data-builder-canvas]");
      canvas?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      return true;
    })()`,
  );
  await delay(120);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const visibleCount = await evaluate(
      send,
      `Array.from(document.querySelectorAll("[data-builder-node-id]")).filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width > 24 && rect.height > 18 && rect.right > 0 && rect.bottom > 0;
      }).length`,
    );
    if (visibleCount >= 2) {
      break;
    }
    log(`inserting smoke controls (${visibleCount}/2 visible)`);
    await evaluate(
      send,
      `(() => {
        document.querySelector("[data-builder-actionbar-idle-components]")?.click();
        const componentButtons = Array.from(document.querySelectorAll("[data-builder-component-quick-insert]"));
        const emptyButtons = Array.from(document.querySelectorAll("[data-builder-empty-insert]"));
        const buttons = componentButtons.length > 0 ? componentButtons : emptyButtons;
        buttons.slice(0, Math.max(1, 2 - ${visibleCount})).forEach((button) => button.click());
        return { componentButtons: componentButtons.length, emptyButtons: emptyButtons.length };
      })()`,
    );
    await delay(350);
  }
  await waitFor(
    send,
    `Array.from(document.querySelectorAll("[data-builder-node-id]")).filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.width > 24 && rect.height > 18 && rect.right > 0 && rect.bottom > 0;
    }).length >= 2`,
    "at least two visible canvas nodes for selection smoke",
  );

  const candidates = await assertRuntimeCheck(
    send,
    `(() => {
      const visibleNodes = Array.from(document.querySelectorAll("[data-builder-node-id]")).filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width > 24 && rect.height > 18 && rect.right > 0 && rect.bottom > 0;
      });
      const editable = visibleNodes.find((node) => node.hasAttribute("data-builder-inline-text-double-click")) ?? visibleNodes[0];
      const second = visibleNodes.find((node) => node !== editable);
      window.__novaSmokeNodes = {
        first: editable?.getAttribute("data-builder-node-id") || "",
        second: second?.getAttribute("data-builder-node-id") || ""
      };
      const actionbar = document.querySelector("[data-builder-selection-action-bar]");
      window.__novaSmokeActionbarTop = actionbar ? actionbar.getBoundingClientRect().top : null;
      return {
        passed: Boolean(editable && second && actionbar),
        detail: visibleNodes.length < 2 ? "need at least two visible canvas nodes" : "",
        first: window.__novaSmokeNodes.first,
        second: window.__novaSmokeNodes.second
      };
    })()`,
    "canvas node candidates",
  );

  await evaluate(
    send,
    `(() => {
      const canvas = document.querySelector("[data-builder-canvas]");
      canvas?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      return true;
    })()`,
  );
  await waitFor(send, `document.querySelector("[data-builder-selection-action-bar]")?.getAttribute("data-builder-selection-state") === "idle"`, "idle selection actionbar");
  await waitFor(send, `Boolean(document.querySelector("[data-builder-selection-status-bar]"))`, "status bar selection mode status");
  await assertRuntimeCheck(
    send,
    `(() => {
      const viewport = document.querySelector("[data-builder-canvas-viewport]");
      const canvas = document.querySelector("[data-builder-canvas]");
      const actionbar = document.querySelector("[data-builder-selection-action-bar]");
      const controls = document.querySelector("[data-builder-canvas-controls]");
      const canvasHud = document.querySelector("[data-builder-selection-mode-hud]");
      const statusBarSelection = document.querySelector("[data-builder-selection-status-bar]");
      const modeStrip = actionbar?.querySelector("[data-builder-selection-mode-strip]");
      const capabilityStrip = actionbar?.querySelector("[data-builder-selection-capability-strip]");
      const affordances = Array.from(actionbar?.querySelectorAll("[data-builder-selection-mode-affordance]") || []);
      const affordanceIds = affordances.map((node) => node.getAttribute("data-builder-selection-mode-affordance") || "");
      const capabilities = Array.from(actionbar?.querySelectorAll("[data-builder-selection-capability]") || []);
      const capabilityIds = capabilities.map((node) => node.getAttribute("data-builder-selection-capability") || "");
      const actionbarRect = actionbar?.getBoundingClientRect();
      const controlsRect = controls?.getBoundingClientRect();
      const viewportRect = viewport?.getBoundingClientRect();
      const canvasRect = canvas?.getBoundingClientRect();
      window.__novaSmokeCanvasLayoutBaseline = actionbarRect && viewportRect && canvasRect
        ? {
            actionbarTop: actionbarRect.top,
            actionbarHeight: actionbarRect.height,
            controlsHeight: controlsRect?.height || 0,
            viewportTop: viewportRect.top,
            viewportHeight: viewportRect.height,
            canvasTop: canvasRect.top,
            canvasLeft: canvasRect.left
          }
        : null;
      return {
        passed:
          Boolean(window.__novaSmokeCanvasLayoutBaseline) &&
          !canvasHud &&
          statusBarSelection?.getAttribute("data-builder-selection-status-tone") === "idle" &&
          statusBarSelection?.getAttribute("data-builder-selection-status-count") === "0" &&
          actionbar?.getAttribute("data-builder-selection-visible") === "persistent" &&
          actionbar?.getAttribute("data-builder-selection-actionbar-density") === "compact" &&
          actionbar?.getAttribute("data-builder-selection-placement") === "canvas-top-external" &&
          actionbar?.getAttribute("data-builder-selection-track") === "external-canvas-chrome" &&
          controls?.getAttribute("data-builder-canvas-controls-density") === "compact" &&
          Number(actionbarRect?.height || 999) <= 48 &&
          Number(controlsRect?.height || 999) <= 48 &&
          viewport?.getAttribute("data-builder-canvas-selection-scroll-padding") === "content-local" &&
          Boolean(actionbar.querySelector("[data-builder-selection-actionbar-sticky-summary]")) &&
          Boolean(actionbar.querySelector("[data-builder-selection-actionbar-viewport]")) &&
          Boolean(actionbar.querySelector("[data-builder-selection-actionbar-scroll]")) &&
          modeStrip?.getAttribute("data-builder-selection-mode-strip-state") === "idle" &&
          ["marquee", "add", "subtract", "invert", "clear"].every((id) => affordanceIds.includes(id)) &&
          capabilityStrip?.getAttribute("data-builder-selection-capability-state") === "idle" &&
          ["layout", "text", "logic", "runtime"].every((id) => capabilityIds.includes(id)) &&
          capabilities.every((node) => node.hasAttribute("data-builder-selection-capability-enabled")),
        detail: \`visible=\${actionbar?.getAttribute("data-builder-selection-visible") || "missing"}, density=\${actionbar?.getAttribute("data-builder-selection-actionbar-density") || "missing"}, controlsDensity=\${controls?.getAttribute("data-builder-canvas-controls-density") || "missing"}, actionbarHeight=\${actionbarRect?.height || "missing"}, controlsHeight=\${controlsRect?.height || "missing"}, placement=\${actionbar?.getAttribute("data-builder-selection-placement") || "missing"}, track=\${actionbar?.getAttribute("data-builder-selection-track") || "missing"}, status=\${statusBarSelection?.getAttribute("data-builder-selection-status-tone") || "missing"}, canvasHud=\${canvasHud ? "present" : "none"}, strip=\${modeStrip?.getAttribute("data-builder-selection-mode-strip-state") || "missing"}, affordances=\${affordanceIds.join("/")}, capabilities=\${capabilityIds.join("/")}\`
      };
    })()`,
    "persistent selection actionbar layout contract",
  );

  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      node?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      return true;
    })()`,
  );
  await waitFor(send, `document.querySelector("[data-builder-canvas]")?.getAttribute("data-builder-canvas-selected-count") === "1"`, "single canvas selection");
  await waitFor(send, `document.querySelector("[data-builder-selection-action-bar]")?.getAttribute("data-builder-selection-state") === "single"`, "single selection actionbar");
  verified.singleSelection = true;
  await assertRuntimeCheck(
    send,
    `(() => {
      const baseline = window.__novaSmokeCanvasLayoutBaseline;
      const viewport = document.querySelector("[data-builder-canvas-viewport]");
      const canvas = document.querySelector("[data-builder-canvas]");
      const actionbar = document.querySelector("[data-builder-selection-action-bar]");
      const capabilityStrip = actionbar?.querySelector("[data-builder-selection-capability-strip]");
      const enabledCapabilities = Array.from(actionbar?.querySelectorAll('[data-builder-selection-capability-enabled="true"]') || [])
        .map((node) => node.getAttribute("data-builder-selection-capability") || "");
      const actionbarRect = actionbar?.getBoundingClientRect();
      const viewportRect = viewport?.getBoundingClientRect();
      const canvasRect = canvas?.getBoundingClientRect();
      const delta = (actual, expected) => Math.abs(Number(actual) - Number(expected));
      return {
        passed:
          Boolean(baseline && actionbarRect && viewportRect && canvasRect) &&
          delta(actionbarRect.top, baseline.actionbarTop) <= 2 &&
          delta(actionbarRect.height, baseline.actionbarHeight) <= 2 &&
          delta(viewportRect.top, baseline.viewportTop) <= 2 &&
          delta(viewportRect.height, baseline.viewportHeight) <= 2 &&
          delta(canvasRect.top, baseline.canvasTop) <= 2 &&
          delta(canvasRect.left, baseline.canvasLeft) <= 2 &&
          capabilityStrip?.getAttribute("data-builder-selection-capability-state") === "single" &&
          enabledCapabilities.includes("layout") &&
          enabledCapabilities.includes("runtime"),
        detail: baseline
          ? \`actionbarTop=\${actionbarRect?.top}/\${baseline.actionbarTop}, viewportTop=\${viewportRect?.top}/\${baseline.viewportTop}, canvasTop=\${canvasRect?.top}/\${baseline.canvasTop}, capabilities=\${enabledCapabilities.join("/")}\`
          : "missing baseline"
      };
    })()`,
    "canvas layout remains stable for single selection",
  );

  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.second}"]\`);
      node?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true, view: window }));
      return true;
    })()`,
  );
  await waitFor(send, `Number(document.querySelector("[data-builder-canvas]")?.getAttribute("data-builder-canvas-selected-count") || 0) >= 2`, "multi canvas selection");
  await waitFor(send, `document.querySelector("[data-builder-selection-action-bar]")?.getAttribute("data-builder-selection-state") === "multi"`, "multi selection actionbar");
  await waitFor(send, `Boolean(document.querySelector("[data-builder-multi-select-inspector]"))`, "multi-select inspector");
  verified.multiSelection = true;
  await assertRuntimeCheck(
    send,
    `(() => {
      const inspector = document.querySelector("[data-builder-multi-select-inspector]");
      const layout = document.querySelector("[data-builder-multi-select-layout-tools]");
      const bounds = document.querySelector("[data-builder-multi-select-layout-bounds]");
      const alignButtons = Array.from(document.querySelectorAll("[data-builder-multi-select-align]"));
      const distributeButtons = Array.from(document.querySelectorAll("[data-builder-multi-select-distribute]"));
      const movableCount = Number(layout?.getAttribute("data-builder-multi-select-layout-movable-count") || 0);
      const lockedCount = Number(layout?.getAttribute("data-builder-multi-select-layout-locked-count") || -1);
      const parentManagedCount = Number(layout?.getAttribute("data-builder-multi-select-layout-parent-managed-count") || -1);
      const spacing = document.querySelector("[data-builder-multi-select-layout-spacing-state]")?.textContent?.trim() || "";
      return {
        passed:
          Boolean(inspector) &&
          Boolean(layout) &&
          Boolean(bounds?.textContent?.trim()) &&
          movableCount >= 2 &&
          lockedCount >= 0 &&
          parentManagedCount >= 0 &&
          alignButtons.length >= 6 &&
          distributeButtons.length === 2 &&
          distributeButtons.every((button) => button.disabled) &&
          /再选|需至少/.test(spacing),
        detail: \`movable=\${movableCount}, locked=\${lockedCount}, parentManaged=\${parentManagedCount}, align=\${alignButtons.length}, distribute=\${distributeButtons.length}, spacing=\${spacing}, bounds=\${bounds?.textContent?.trim() || "missing"}\`
      };
    })()`,
    "multi-select inspector layout tools",
  );
  verified.multiSelectLayoutRuntime = true;

  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const rect = node?.getBoundingClientRect();
      node?.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect ? rect.left + Math.min(24, rect.width / 2) : 100,
        clientY: rect ? rect.top + Math.min(24, rect.height / 2) : 100
      }));
      return Boolean(node);
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-canvas-context-group-layout]"))`, "canvas context layout grouping controls");
  await assertRuntimeCheck(
    send,
    `(() => {
      const menu = document.querySelector("[data-builder-canvas-context-overlay]");
      const layout = document.querySelector("[data-builder-canvas-context-group-layout]");
      const modes = Array.from(document.querySelectorAll("[data-builder-canvas-context-group-layout-mode]"));
      const modeValues = modes.map((button) => button.getAttribute("data-builder-canvas-context-group-layout-mode") || "");
      const selectedCount = Number(document.querySelector("[data-builder-canvas]")?.getAttribute("data-builder-canvas-selected-count") || 0);
      return {
        passed:
          Boolean(menu && layout) &&
          selectedCount >= 2 &&
          ["free", "row", "column", "grid"].every((mode) => modeValues.includes(mode)) &&
          modes.every((button) => !button.disabled),
        detail: \`selected=\${selectedCount}, modes=\${modeValues.join("/")}, disabled=\${modes.filter((button) => button.disabled).length}\`
      };
    })()`,
    "canvas context layout grouping options are available for multi selection",
  );
  await closeTransientOverlays(send);

  await assertRuntimeCheck(
    send,
    `(() => {
      const actionbar = document.querySelector("[data-builder-selection-action-bar]");
      const statusBarSelection = document.querySelector("[data-builder-selection-status-bar]");
      const strip = actionbar?.querySelector("[data-builder-selection-mode-strip]");
      const capabilityStrip = actionbar?.querySelector("[data-builder-selection-capability-strip]");
      const affordances = Array.from(actionbar?.querySelectorAll("[data-builder-selection-mode-affordance]") || []);
      const shortcuts = Array.from(actionbar?.querySelectorAll("[data-builder-selection-mode-shortcut]") || [])
        .map((node) => node.getAttribute("data-builder-selection-mode-shortcut") || node.textContent?.trim() || "")
        .filter(Boolean);
      const capabilityIds = Array.from(actionbar?.querySelectorAll("[data-builder-selection-capability]") || [])
        .map((node) => node.getAttribute("data-builder-selection-capability") || "");
      return {
        passed:
          actionbar?.getAttribute("data-builder-selection-state") === "multi" &&
          statusBarSelection?.getAttribute("data-builder-selection-status-tone") === "multi" &&
          strip?.getAttribute("data-builder-selection-mode-strip-state") === "multi" &&
          capabilityStrip?.getAttribute("data-builder-selection-capability-state") === "multi" &&
          Number(strip?.getAttribute("data-builder-selection-mode-strip-count") || 0) >= 2 &&
          affordances.length >= 5 &&
          ["layout", "text", "logic", "runtime"].every((id) => capabilityIds.includes(id)) &&
          ["拖拽", "Ctrl / Shift", "Alt", "Ctrl+I", "Esc"].every((shortcut) => shortcuts.includes(shortcut)),
        detail: \`state=\${actionbar?.getAttribute("data-builder-selection-state") || "missing"}, status=\${statusBarSelection?.getAttribute("data-builder-selection-status-tone") || "missing"}, strip=\${strip?.getAttribute("data-builder-selection-mode-strip-state") || "missing"}, capability=\${capabilityStrip?.getAttribute("data-builder-selection-capability-state") || "missing"}, count=\${strip?.getAttribute("data-builder-selection-mode-strip-count") || "missing"}, shortcuts=\${shortcuts.join("/")}, affordances=\${affordances.length}, capabilities=\${capabilityIds.join("/")}\`
      };
    })()`,
    "selection mode strip remains discoverable during multi selection",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const baseline = window.__novaSmokeCanvasLayoutBaseline;
      const viewport = document.querySelector("[data-builder-canvas-viewport]");
      const canvas = document.querySelector("[data-builder-canvas]");
      const actionbar = document.querySelector("[data-builder-selection-action-bar]");
      const actionbarRect = actionbar?.getBoundingClientRect();
      const viewportRect = viewport?.getBoundingClientRect();
      const canvasRect = canvas?.getBoundingClientRect();
      const delta = (actual, expected) => Math.abs(Number(actual) - Number(expected));
      return {
        passed:
          Boolean(baseline && actionbarRect && viewportRect && canvasRect) &&
          delta(actionbarRect.top, baseline.actionbarTop) <= 2 &&
          delta(actionbarRect.height, baseline.actionbarHeight) <= 2 &&
          delta(viewportRect.top, baseline.viewportTop) <= 2 &&
          delta(viewportRect.height, baseline.viewportHeight) <= 2 &&
          delta(canvasRect.top, baseline.canvasTop) <= 2 &&
          delta(canvasRect.left, baseline.canvasLeft) <= 2,
        detail: baseline
          ? \`actionbarTop=\${actionbarRect?.top}/\${baseline.actionbarTop}, viewportTop=\${viewportRect?.top}/\${baseline.viewportTop}, canvasTop=\${canvasRect?.top}/\${baseline.canvasTop}\`
          : "missing baseline"
      };
    })()`,
    "canvas layout remains stable for multi selection",
  );

  await assertRuntimeCheck(
    send,
    `(() => {
      const actionbar = document.querySelector("[data-builder-selection-action-bar]");
      const top = actionbar ? actionbar.getBoundingClientRect().top : null;
      const stableTop = window.__novaSmokeActionbarTop;
      return {
        passed: typeof top === "number" && typeof stableTop === "number" && Math.abs(top - stableTop) <= 2,
        detail: \`actionbar top moved from \${stableTop} to \${top}\`
      };
    })()`,
    "stable selection actionbar placement",
  );
  verified.stableActionbar = true;

  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const rect = node?.getBoundingClientRect();
      node?.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect ? rect.left + Math.min(24, rect.width / 2) : 100,
        clientY: rect ? rect.top + Math.min(24, rect.height / 2) : 100
      }));
      return Boolean(node);
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector('[data-builder-canvas-context-group-layout-mode="grid"]'))`, "canvas context grid grouping action");
  await evaluate(
    send,
    `(() => {
      const action = document.querySelector('[data-builder-canvas-context-group-layout-mode="grid"]');
      action?.scrollIntoView({ block: "center", inline: "nearest" });
      action?.click();
      return Boolean(action);
    })()`,
  );
  await waitFor(
    send,
    `(() => {
      const selected = document.querySelector('[data-builder-node-selected="true"][data-builder-node="frame"]');
      return selected?.getAttribute("data-builder-frame-layout-mode") === "grid";
    })()`,
    "canvas context grid grouping result",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const selected = document.querySelector('[data-builder-node-selected="true"][data-builder-node="frame"]');
      const groupId = selected?.getAttribute("data-builder-node-id") || "";
      const children = Array.from(document.querySelectorAll(\`[data-builder-parent-id="\${groupId}"]\`));
      window.__novaSmokeGroupedFrameId = groupId;
      return {
        passed:
          Boolean(selected) &&
          selected?.getAttribute("data-builder-frame-layout-mode") === "grid" &&
          children.length >= 2 &&
          children.some((node) => node.getAttribute("data-builder-node-id") === window.__novaSmokeNodes.first) &&
          children.some((node) => node.getAttribute("data-builder-node-id") === window.__novaSmokeNodes.second),
        detail: \`group=\${groupId || "missing"}, layout=\${selected?.getAttribute("data-builder-frame-layout-mode") || "missing"}, children=\${children.length}\`
      };
    })()`,
    "canvas context grid grouping creates a selected grid frame",
  );
  verified.canvasContextGroupLayoutRuntime = true;

  log("checking context menu and inline text edit");
  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const rect = node?.getBoundingClientRect();
      node?.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect ? rect.left + Math.min(24, rect.width / 2) : 100,
        clientY: rect ? rect.top + Math.min(24, rect.height / 2) : 100
      }));
      return true;
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-canvas-context-overlay]"))`, "canvas context menu overlay");
  await waitFor(send, `Boolean(document.querySelector("[data-builder-canvas-context-select-same-type], [data-builder-canvas-context-edit-text-field], [data-builder-canvas-context-quick-insert]"))`, "canvas context menu actions");
  verified.contextMenu = true;
  await assertRuntimeCheck(
    send,
    `(() => {
      const baseline = window.__novaSmokeCanvasLayoutBaseline;
      const viewportRect = document.querySelector("[data-builder-canvas-viewport]")?.getBoundingClientRect();
      const actionbarRect = document.querySelector("[data-builder-selection-action-bar]")?.getBoundingClientRect();
      const delta = (actual, expected) => Math.abs(Number(actual) - Number(expected));
      return {
        passed:
          Boolean(baseline && viewportRect && actionbarRect) &&
          delta(viewportRect.top, baseline.viewportTop) <= 2 &&
          delta(viewportRect.height, baseline.viewportHeight) <= 2 &&
          delta(actionbarRect.top, baseline.actionbarTop) <= 2,
        detail: baseline
          ? \`viewportTop=\${viewportRect?.top}/\${baseline.viewportTop}, actionbarTop=\${actionbarRect?.top}/\${baseline.actionbarTop}\`
          : "missing baseline"
      };
    })()`,
    "canvas layout remains stable with context menu",
  );
  await closeTransientOverlays(send);
  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const rect = node?.getBoundingClientRect();
      node?.dispatchEvent(new MouseEvent("dblclick", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect ? rect.left + Math.min(24, rect.width / 2) : 100,
        clientY: rect ? rect.top + Math.min(24, rect.height / 2) : 100
      }));
      return true;
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-inline-text-editor]"))`, "inline text editor from double click");
  verified.inlineTextEdit = true;
  await assertRuntimeCheck(
    send,
    `(() => {
      const baseline = window.__novaSmokeCanvasLayoutBaseline;
      const viewportRect = document.querySelector("[data-builder-canvas-viewport]")?.getBoundingClientRect();
      const actionbarRect = document.querySelector("[data-builder-selection-action-bar]")?.getBoundingClientRect();
      const delta = (actual, expected) => Math.abs(Number(actual) - Number(expected));
      return {
        passed:
          Boolean(baseline && viewportRect && actionbarRect) &&
          delta(viewportRect.top, baseline.viewportTop) <= 2 &&
          delta(viewportRect.height, baseline.viewportHeight) <= 2 &&
          delta(actionbarRect.top, baseline.actionbarTop) <= 2,
        detail: baseline
          ? \`viewportTop=\${viewportRect?.top}/\${baseline.viewportTop}, actionbarTop=\${actionbarRect?.top}/\${baseline.actionbarTop}\`
          : "missing baseline"
      };
    })()`,
    "canvas layout remains stable with inline editor",
  );
  await fillElementWithText(
    send,
    `document.querySelector("[data-builder-inline-text-editor] input, [data-builder-inline-text-editor] textarea")`,
    "NovaSmokeDouble",
    "double-click inline text input",
  );
  await pressKey(send, { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  await waitFor(send, `!document.querySelector("[data-builder-inline-text-editor]")`, "double-click inline text editor committed");
  await assertRuntimeCheck(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const text = node?.textContent?.replace(/\\s+/g, " ") || "";
      return {
        passed: text.includes("NovaSmokeDouble"),
        detail: \`nodeText=\${text.slice(0, 180)}\`
      };
    })()`,
    "double-click text edit updates canvas node",
  );
  verified.inlineTextEditCommitRuntime = true;

  await closeTransientOverlays(send);
  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const rect = node?.getBoundingClientRect();
      node?.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect ? rect.left + Math.min(24, rect.width / 2) : 100,
        clientY: rect ? rect.top + Math.min(24, rect.height / 2) : 100
      }));
      return true;
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-canvas-context-overlay]"))`, "canvas context menu overlay for text edit");
  await clickElementCenter(
    send,
    `document.querySelector("[data-builder-canvas-context-edit-text-field]")`,
    "canvas context edit text field",
  );
  await waitFor(
    send,
    `document.querySelector("[data-builder-inline-text-editor]")?.getAttribute("data-builder-inline-text-edit-source") === "context-menu"`,
    "context-menu inline text editor",
  );
  await fillElementWithText(
    send,
    `document.querySelector("[data-builder-inline-text-editor] input, [data-builder-inline-text-editor] textarea")`,
    "NovaSmokeContext",
    "context inline text input",
  );
  await pressKey(send, { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  await waitFor(send, `!document.querySelector("[data-builder-inline-text-editor]")`, "context inline text editor committed");
  await assertRuntimeCheck(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const text = node?.textContent?.replace(/\\s+/g, " ") || "";
      return {
        passed: text.includes("NovaSmokeContext"),
        detail: \`nodeText=\${text.slice(0, 180)}\`
      };
    })()`,
    "context-menu text edit updates canvas node",
  );
  verified.contextMenuTextEditRuntime = true;

  await closeTransientOverlays(send);
  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      node?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      document.body?.focus?.();
      return Boolean(node);
    })()`,
  );
  await waitFor(send, `document.querySelector("[data-builder-canvas]")?.getAttribute("data-builder-canvas-selected-count") === "1"`, "single selection before F2 inline edit");
  await pressKey(send, { key: "F2", code: "F2", windowsVirtualKeyCode: 113 });
  await waitFor(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const editor = node?.querySelector("[data-builder-inline-text-editor]");
      return editor?.getAttribute("data-builder-inline-text-edit-source") === "keyboard" &&
        editor?.getAttribute("data-builder-inline-text-edit-item-id") === window.__novaSmokeNodes.first;
    })()`,
    "keyboard F2 inline text editor",
  );
  await fillElementWithText(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      return node?.querySelector("[data-builder-inline-text-editor] input, [data-builder-inline-text-editor] textarea") || null;
    })()`,
    "NovaSmokeF2",
    "F2 inline text input",
  );
  await commitInlineTextEditor(send, "F2 inline text editor");
  await waitFor(send, `!document.querySelector("[data-builder-inline-text-editor]")`, "F2 inline text editor committed");
  await assertRuntimeCheck(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const text = node?.textContent?.replace(/\\s+/g, " ") || "";
      return {
        passed: text.includes("NovaSmokeF2"),
        detail: \`nodeText=\${text.slice(0, 180)}\`
      };
    })()`,
    "F2 text edit updates canvas node",
  );
  verified.inlineTextKeyboardRuntime = true;

  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      node?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      document.body?.focus?.();
      return Boolean(node);
    })()`,
  );
  await waitFor(
    send,
    `document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`)?.getAttribute("data-builder-node-selected") === "true"`,
    "single selection before Enter inline edit",
  );
  await pressKey(send, { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  await waitFor(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const editor = node?.querySelector("[data-builder-inline-text-editor]");
      return editor?.getAttribute("data-builder-inline-text-edit-source") === "keyboard" &&
        editor?.getAttribute("data-builder-inline-text-edit-item-id") === window.__novaSmokeNodes.first;
    })()`,
    "keyboard Enter inline text editor",
  );
  const enterEditorProp = await assertRuntimeCheck(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const editor = node?.querySelector("[data-builder-inline-text-editor]");
      const input = editor?.querySelector("input, textarea");
      return {
        passed: Boolean(editor && input),
        prop: editor?.getAttribute("data-builder-inline-text-edit-prop") || "",
        value: input?.value || "",
        detail: editor ? "" : "missing inline text editor"
      };
    })()`,
    "Enter inline text editor target",
  );
  await fillElementWithText(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      return node?.querySelector("[data-builder-inline-text-editor] input, [data-builder-inline-text-editor] textarea") || null;
    })()`,
    "NovaSmokeEnter",
    "Enter inline text input",
  );
  log(`Enter inline text editor editing ${enterEditorProp.prop || "unknown"} from ${JSON.stringify(enterEditorProp.value || "")}`);
  await commitInlineTextEditor(send, "Enter inline text editor");
  await waitFor(send, `!document.querySelector("[data-builder-inline-text-editor]")`, "Enter inline text editor committed");
  await waitFor(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const text = node?.textContent?.replace(/\\s+/g, " ") || "";
      return text.includes("NovaSmokeEnter");
    })()`,
    "Enter text edit canvas update",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const text = node?.textContent?.replace(/\\s+/g, " ") || "";
      return {
        passed: text.includes("NovaSmokeEnter"),
        detail: \`nodeText=\${text.slice(0, 180)}\`
      };
    })()`,
    "Enter text edit updates canvas node",
  );
  verified.inlineTextEnterRuntime = true;

  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      node?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      document.body?.focus?.();
      return Boolean(node);
    })()`,
  );
  await waitFor(
    send,
    `document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`)?.getAttribute("data-builder-node-selected") === "true"`,
    "single selection before actionbar text edit",
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-actionbar-edit-text]"))`, "selection actionbar text edit trigger");
  await clickElementCenter(send, `document.querySelector("[data-builder-actionbar-edit-text]")`, "selection actionbar text menu trigger");
  await waitFor(send, `Boolean(document.querySelector("[data-builder-actionbar-edit-text-menu]"))`, "selection actionbar text menu");
  await clickElementCenter(
    send,
    `Array.from(document.querySelectorAll("[data-builder-actionbar-edit-text-field]")).find((item) => !item.getAttribute("aria-disabled"))`,
    "selection actionbar text field",
  );
  await waitFor(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const editor = node?.querySelector("[data-builder-inline-text-editor]");
      return editor?.getAttribute("data-builder-inline-text-edit-source") === "actionbar" &&
        editor?.getAttribute("data-builder-inline-text-edit-item-id") === window.__novaSmokeNodes.first;
    })()`,
    "actionbar inline text editor",
  );
  await fillElementWithText(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      return node?.querySelector("[data-builder-inline-text-editor] input, [data-builder-inline-text-editor] textarea") || null;
    })()`,
    "NovaSmokeActionbar",
    "actionbar inline text input",
  );
  await commitInlineTextEditor(send, "actionbar inline text editor");
  await waitFor(send, `!document.querySelector("[data-builder-inline-text-editor]")`, "actionbar inline text editor committed");
  await assertRuntimeCheck(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const text = node?.textContent?.replace(/\\s+/g, " ") || "";
      return {
        passed: text.includes("NovaSmokeActionbar"),
        detail: \`nodeText=\${text.slice(0, 180)}\`
      };
    })()`,
    "actionbar text edit updates canvas node",
  );
  verified.actionbarTextEditRuntime = true;

  await closeTransientOverlays(send);
  await evaluate(
    send,
    `(() => {
      window.__novaSmokeTableViewCount = document.querySelectorAll('[data-builder-node="table-view"]').length;
      const canvas = document.querySelector("[data-builder-canvas]");
      const rect = canvas?.getBoundingClientRect();
      canvas?.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect ? rect.left + Math.min(rect.width - 48, 360) : 360,
        clientY: rect ? rect.top + Math.min(rect.height - 48, 260) : 260
      }));
      return Boolean(canvas);
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-canvas-context-insert-search-input]"))`, "canvas context insert search input");
  await fillElementWithText(
    send,
    `document.querySelector("[data-builder-canvas-context-insert-search-input]")`,
    "table-view",
    "canvas context insert search",
  );
  await waitFor(
    send,
    `Boolean(document.querySelector('[data-builder-canvas-context-insert-search-result="table-view"]'))`,
    "canvas context table-view search result",
  );
  await clickElementCenter(
    send,
    `document.querySelector('[data-builder-canvas-context-insert-search-result="table-view"]')`,
    "canvas context table-view insert result",
  );
  await waitFor(
    send,
    `document.querySelectorAll('[data-builder-node="table-view"]').length >= Number(window.__novaSmokeTableViewCount || 0) + 1`,
    "table-view inserted from canvas context search",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const tableViews = Array.from(document.querySelectorAll('[data-builder-node="table-view"]'));
      const selectedCount = Number(document.querySelector("[data-builder-canvas]")?.getAttribute("data-builder-canvas-selected-count") || 0);
      const latest = tableViews.at(-1);
      window.__novaSmokeInsertedTableId = latest?.getAttribute("data-builder-node-id") || "";
      const rect = latest?.getBoundingClientRect();
      return {
        passed:
          tableViews.length >= Number(window.__novaSmokeTableViewCount || 0) + 1 &&
          selectedCount === 1 &&
          Boolean(window.__novaSmokeInsertedTableId) &&
          Boolean(rect && rect.width > 120 && rect.height > 80),
        detail: \`tableViews=\${tableViews.length}, selected=\${selectedCount}, tableId=\${window.__novaSmokeInsertedTableId || "missing"}, rect=\${rect ? Math.round(rect.width) + "x" + Math.round(rect.height) : "missing"}\`
      };
    })()`,
    "canvas context search inserts a real table-view control",
  );
  verified.canvasContextInsertRuntime = true;

  await closeTransientOverlays(send);
  await assertRuntimeCheck(
    send,
    `(() => {
      const tableId = window.__novaSmokeInsertedTableId || "";
      const table = tableId ? document.querySelector(\`[data-builder-node-id="\${CSS.escape(tableId)}"]\`) : null;
      const tableRect = table?.getBoundingClientRect();
      const candidates = Array.from(document.querySelectorAll("[data-builder-node-id]"))
        .filter((node) => node !== table && (node.getAttribute("data-builder-parent-id") || "") === "")
        .map((node) => ({ node, rect: node.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width > 24 && rect.height > 18);
      const base =
        candidates.find(({ rect }) => tableRect && Math.abs(rect.width - tableRect.width) > 8)?.node ||
        candidates[0]?.node ||
        null;
      const baseRect = base?.getBoundingClientRect();
      window.__novaSmokeContextMatchBaseId = base?.getAttribute("data-builder-node-id") || "";
      window.__novaSmokeContextMatchBefore = {
        baseWidth: baseRect?.width || 0,
        tableWidth: tableRect?.width || 0
      };
      return {
        passed:
          Boolean(base && table && tableRect && baseRect) &&
          Math.abs((baseRect?.width || 0) - (tableRect?.width || 0)) > 8,
        detail: \`base=\${window.__novaSmokeContextMatchBaseId || "missing"}, table=\${tableId || "missing"}, baseWidth=\${baseRect?.width || 0}, tableWidth=\${tableRect?.width || 0}\`
      };
    })()`,
    "canvas context match-size baseline with different widths",
  );
  await evaluate(
    send,
    `(() => {
      const baseId = window.__novaSmokeContextMatchBaseId || "";
      const base = baseId ? document.querySelector(\`[data-builder-node-id="\${CSS.escape(baseId)}"]\`) : null;
      base?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      return Boolean(base);
    })()`,
  );
  await waitFor(
    send,
    `document.querySelector('[data-builder-node-id="' + CSS.escape(window.__novaSmokeContextMatchBaseId || "") + '"]')?.getAttribute("data-builder-node-selected") === "true" &&
      document.querySelector("[data-builder-canvas]")?.getAttribute("data-builder-canvas-selected-count") === "1"`,
    "canvas context match-size base selected",
  );
  await evaluate(
    send,
    `(() => {
      const tableId = window.__novaSmokeInsertedTableId || "";
      const table = tableId ? document.querySelector(\`[data-builder-node-id="\${CSS.escape(tableId)}"]\`) : null;
      table?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true, view: window }));
      return Boolean(table);
    })()`,
  );
  await waitFor(
    send,
    `(() => {
      const baseId = window.__novaSmokeContextMatchBaseId || "";
      const tableId = window.__novaSmokeInsertedTableId || "";
      const base = baseId ? document.querySelector(\`[data-builder-node-id="\${CSS.escape(baseId)}"]\`) : null;
      const table = tableId ? document.querySelector(\`[data-builder-node-id="\${CSS.escape(tableId)}"]\`) : null;
      return base?.getAttribute("data-builder-node-selected") === "true" &&
        table?.getAttribute("data-builder-node-selected") === "true" &&
        Number(document.querySelector("[data-builder-canvas]")?.getAttribute("data-builder-canvas-selected-count") || 0) >= 2;
    })()`,
    "canvas context match-size multi selection",
  );
  await evaluate(
    send,
    `(() => {
      const baseId = window.__novaSmokeContextMatchBaseId || "";
      const base = baseId ? document.querySelector(\`[data-builder-node-id="\${CSS.escape(baseId)}"]\`) : null;
      const rect = base?.getBoundingClientRect();
      base?.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect ? rect.left + Math.min(24, rect.width / 2) : 100,
        clientY: rect ? rect.top + Math.min(24, rect.height / 2) : 100
      }));
      return Boolean(base);
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-canvas-context-match-width]"))`, "canvas context match-width action");
  await clickElementCenter(send, `document.querySelector("[data-builder-canvas-context-match-width]")`, "canvas context match width");
  await waitFor(
    send,
    `(() => {
      const baseId = window.__novaSmokeContextMatchBaseId || "";
      const tableId = window.__novaSmokeInsertedTableId || "";
      const base = baseId ? document.querySelector(\`[data-builder-node-id="\${CSS.escape(baseId)}"]\`) : null;
      const table = tableId ? document.querySelector(\`[data-builder-node-id="\${CSS.escape(tableId)}"]\`) : null;
      const baseWidth = base?.getBoundingClientRect().width || 0;
      const tableWidth = table?.getBoundingClientRect().width || 0;
      return Boolean(base && table) && Math.abs(baseWidth - tableWidth) <= 2;
    })()`,
    "canvas context match-width updates selected control width",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const baseId = window.__novaSmokeContextMatchBaseId || "";
      const tableId = window.__novaSmokeInsertedTableId || "";
      const base = baseId ? document.querySelector(\`[data-builder-node-id="\${CSS.escape(baseId)}"]\`) : null;
      const table = tableId ? document.querySelector(\`[data-builder-node-id="\${CSS.escape(tableId)}"]\`) : null;
      const before = window.__novaSmokeContextMatchBefore || {};
      const baseWidth = base?.getBoundingClientRect().width || 0;
      const tableWidth = table?.getBoundingClientRect().width || 0;
      const feedbackNode = document.querySelector("[data-builder-project-jump-feedback]");
      const feedback = feedbackNode?.textContent || "";
      const feedbackRect = feedbackNode?.getBoundingClientRect();
      const feedbackStyle = feedbackNode ? getComputedStyle(feedbackNode) : null;
      const centeredFeedback =
        feedbackRect &&
        Math.abs((feedbackRect.left + feedbackRect.right) / 2 - window.innerWidth / 2) <= 2 &&
        feedbackRect.top >= 48 &&
        feedbackRect.top <= 72;
      return {
        passed:
          Math.abs(Number(before.baseWidth || 0) - Number(before.tableWidth || 0)) > 8 &&
          Math.abs(baseWidth - tableWidth) <= 2 &&
          feedback.includes("尺寸已统一") &&
          feedbackNode?.getAttribute("data-builder-project-jump-feedback-placement") === "top-center-toast-lane" &&
          feedbackNode?.getAttribute("data-toast-surface-style") === "nova-surface" &&
          feedbackStyle?.position === "fixed" &&
          centeredFeedback,
        detail: \`before=\${before.baseWidth || 0}/\${before.tableWidth || 0}, after=\${baseWidth}/\${tableWidth}, feedback=\${feedback.trim().replace(/\\s+/g, " ").slice(0, 140)}, feedbackPosition=\${feedbackStyle?.position || "missing"}, feedbackRect=\${feedbackRect ? Math.round(feedbackRect.left) + "," + Math.round(feedbackRect.top) + "," + Math.round(feedbackRect.right) : "missing"}\`
      };
    })()`,
    "canvas context match-width real layout mutation",
  );
  verified.canvasContextMatchSizeRuntime = true;

  await closeTransientOverlays(send);
  const distributeIds = [
    await insertCanvasContextComponentAtCanvasPoint(send, "button", 180, 420, "canvas context distribute first control"),
    await insertCanvasContextComponentAtCanvasPoint(send, "button", 460, 420, "canvas context distribute second control"),
    await insertCanvasContextComponentAtCanvasPoint(send, "button", 920, 420, "canvas context distribute third control"),
  ];
  await assertRuntimeCheck(
    send,
    `(() => {
      const ids = ${JSON.stringify(distributeIds)};
      const combo = ids.map((id) => {
        const node = document.querySelector(\`[data-builder-node-id="\${CSS.escape(id)}"]\`);
        const rect = node?.getBoundingClientRect();
        return rect ? {
          id,
          parentId: node.getAttribute("data-builder-parent-id") || "",
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height
        } : null;
      }).filter(Boolean).sort((left, right) => left.left - right.left);
      if (combo.length !== 3) {
        return { passed: false, detail: \`inserted=\${ids.join("/")}, found=\${combo.length}\` };
      }
      const parentIds = new Set(combo.map((entry) => entry.parentId));
      const span = combo[2].right - combo[0].left;
      const widthSum = combo.reduce((total, entry) => total + entry.width, 0);
      const available = span - widthSum;
      const firstGap = combo[1].left - combo[0].right;
      const secondGap = combo[2].left - combo[1].right;
      const gapDelta = Math.abs(firstGap - secondGap);
      window.__novaSmokeContextDistributeIds = combo.map((entry) => entry.id);
      window.__novaSmokeContextDistributeBefore = combo.map((entry) => ({
        id: entry.id,
        left: entry.left,
        right: entry.right,
        width: entry.width
      }));
      return {
        passed: parentIds.size === 1 && available >= 16 && gapDelta > 8,
        detail: \`ids=\${window.__novaSmokeContextDistributeIds.join("/")}, parents=\${Array.from(parentIds).join("/") || "root"}, available=\${available}, gaps=\${firstGap}/\${secondGap}\`
      };
    })()`,
    "canvas context distribute baseline with deterministic controls",
  );
  await evaluate(
    send,
    `(() => {
      const ids = window.__novaSmokeContextDistributeIds || [];
      ids.forEach((id, index) => {
        const node = document.querySelector(\`[data-builder-node-id="\${CSS.escape(id)}"]\`);
        node?.dispatchEvent(new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          ctrlKey: index > 0,
          view: window
        }));
      });
      return ids.length === 3;
    })()`,
  );
  await waitFor(
    send,
    `(() => {
      const ids = window.__novaSmokeContextDistributeIds || [];
      const selectedIds = Array.from(document.querySelectorAll('[data-builder-node-selected="true"]'))
        .map((node) => node.getAttribute("data-builder-node-id"))
        .filter(Boolean);
      return ids.length === 3 && ids.every((id) => selectedIds.includes(id)) &&
        Number(document.querySelector("[data-builder-canvas]")?.getAttribute("data-builder-canvas-selected-count") || 0) >= 3;
    })()`,
    "canvas context distribute multi selection",
  );
  await evaluate(
    send,
    `(() => {
      const id = (window.__novaSmokeContextDistributeIds || [])[0] || "";
      const node = id ? document.querySelector(\`[data-builder-node-id="\${CSS.escape(id)}"]\`) : null;
      const rect = node?.getBoundingClientRect();
      node?.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect ? rect.left + Math.min(24, rect.width / 2) : 100,
        clientY: rect ? rect.top + Math.min(24, rect.height / 2) : 100
      }));
      return Boolean(node);
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-canvas-context-distribute-horizontal]"))`, "canvas context distribute-horizontal action");
  await clickElementCenter(send, `document.querySelector("[data-builder-canvas-context-distribute-horizontal]")`, "canvas context distribute horizontal");
  await waitFor(
    send,
    `(() => {
      const ids = window.__novaSmokeContextDistributeIds || [];
      const entries = ids.map((id) => {
        const node = document.querySelector(\`[data-builder-node-id="\${CSS.escape(id)}"]\`);
        const rect = node?.getBoundingClientRect();
        return rect ? { id, left: rect.left, right: rect.right, width: rect.width } : null;
      }).filter(Boolean).sort((left, right) => left.left - right.left);
      if (entries.length !== 3) return false;
      const firstGap = entries[1].left - entries[0].right;
      const secondGap = entries[2].left - entries[1].right;
      return Math.abs(firstGap - secondGap) <= 9;
    })()`,
    "canvas context distribute-horizontal updates selected positions",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const ids = window.__novaSmokeContextDistributeIds || [];
      const before = window.__novaSmokeContextDistributeBefore || [];
      const entries = ids.map((id) => {
        const node = document.querySelector(\`[data-builder-node-id="\${CSS.escape(id)}"]\`);
        const rect = node?.getBoundingClientRect();
        return rect ? { id, left: rect.left, right: rect.right, width: rect.width } : null;
      }).filter(Boolean).sort((left, right) => left.left - right.left);
      const firstGap = entries[1]?.left - entries[0]?.right;
      const secondGap = entries[2]?.left - entries[1]?.right;
      const moved = entries.some((entry) => {
        const original = before.find((candidate) => candidate.id === entry.id);
        return original && Math.abs(original.left - entry.left) > 2;
      });
      const feedback = document.querySelector("[data-builder-project-jump-feedback]")?.textContent || "";
      return {
        passed:
          entries.length === 3 &&
          moved &&
          Math.abs(firstGap - secondGap) <= 9 &&
          feedback.includes("选择已等距分布"),
        detail: \`ids=\${entries.map((entry) => entry.id).join("/")}, gaps=\${firstGap}/\${secondGap}, moved=\${moved}, feedback=\${feedback.trim().replace(/\\s+/g, " ").slice(0, 140)}\`
      };
    })()`,
    "canvas context distribute-horizontal real layout mutation",
  );
  verified.canvasContextDistributeRuntime = true;

  await closeTransientOverlays(send);
  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      node?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      return Boolean(node);
    })()`,
  );
  await waitFor(send, `document.querySelector("[data-builder-canvas]")?.getAttribute("data-builder-canvas-selected-count") === "1"`, "single selection before context menu selection actions");
  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const rect = node?.getBoundingClientRect();
      window.__novaSmokeContextFirstType = node?.getAttribute("data-builder-node") || "";
      window.__novaSmokeContextSameTypeCount = Array.from(document.querySelectorAll("[data-builder-node-id]"))
        .filter((candidate) => candidate.getAttribute("data-builder-node") === window.__novaSmokeContextFirstType).length;
      window.__novaSmokeContextTotalCount = document.querySelectorAll("[data-builder-node-id]").length;
      node?.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect ? rect.left + Math.min(24, rect.width / 2) : 100,
        clientY: rect ? rect.top + Math.min(24, rect.height / 2) : 100
      }));
      return Boolean(node);
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-canvas-context-selection-summary]"))`, "canvas context selection summary");
  await assertRuntimeCheck(
    send,
    `(() => {
      const summary = document.querySelector("[data-builder-canvas-context-selection-summary]");
      const count = Number(summary?.getAttribute("data-builder-canvas-context-selection-count") || 0);
      const focusable = Number(summary?.getAttribute("data-builder-canvas-context-selection-focusable-count") || 0);
      const readonly = Number(summary?.getAttribute("data-builder-canvas-context-selection-readonly-count") || 0);
      return {
        passed: count === 1 && focusable >= 0 && readonly >= 0 && Boolean(summary?.textContent?.includes("已选")),
        detail: \`count=\${count}, focusable=\${focusable}, readonly=\${readonly}, text=\${summary?.textContent?.trim().replace(/\\s+/g, " ") || "missing"}\`
      };
    })()`,
    "canvas context selection summary",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const action = document.querySelector('[data-builder-canvas-context-select-same-type=""]:not([disabled])');
      action?.scrollIntoView({ block: "center", inline: "nearest" });
      action?.click();
      return {
        passed: Boolean(action),
        detail: action ? action.textContent?.trim().replace(/\\s+/g, " ") || "clicked" : "missing"
      };
    })()`,
    "canvas context select same type",
  );
  await delay(500);
  await assertRuntimeCheck(
    send,
    `(() => {
      const selected = Array.from(document.querySelectorAll('[data-builder-node-selected="true"]'));
      const expectedType = window.__novaSmokeContextFirstType || "";
      const expectedCount = Number(window.__novaSmokeContextSameTypeCount || 0);
      const typeCounts = selected.reduce((counts, node) => {
        const type = node.getAttribute("data-builder-node") || "unknown";
        counts[type] = (counts[type] || 0) + 1;
        return counts;
      }, {});
      const selectedIds = selected.map((node) => node.getAttribute("data-builder-node-id")).filter(Boolean);
      return {
        passed: selected.length === expectedCount &&
          selected.every((node) => node.getAttribute("data-builder-node") === expectedType),
        detail: \`expected=\${expectedType}:\${expectedCount}, selected=\${selected.length}, types=\${JSON.stringify(typeCounts)}, ids=\${selectedIds.join("/")}\`
      };
    })()`,
    "canvas context select-same-type result",
  );
  verified.canvasContextSelectSameRuntime = true;

  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const rect = node?.getBoundingClientRect();
      node?.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect ? rect.left + Math.min(24, rect.width / 2) : 100,
        clientY: rect ? rect.top + Math.min(24, rect.height / 2) : 100
      }));
      return Boolean(node);
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-canvas-context-invert-selection]"))`, "canvas context invert selection action");
  await evaluate(
    send,
    `(() => {
      window.__novaSmokeContextInvertSourceIds = Array.from(document.querySelectorAll('[data-builder-node-selected="true"]'))
        .map((node) => node.getAttribute("data-builder-node-id"))
        .filter(Boolean);
      window.__novaSmokeContextInvertAllIds = Array.from(document.querySelectorAll("[data-builder-node-id]"))
        .map((node) => node.getAttribute("data-builder-node-id"))
        .filter(Boolean);
      return true;
    })()`,
  );
  await evaluate(
    send,
    `(() => {
      const action = document.querySelector("[data-builder-canvas-context-invert-selection]");
      action?.scrollIntoView({ block: "center", inline: "nearest" });
      action?.click();
      return Boolean(action);
    })()`,
  );
  await waitFor(
    send,
    `(() => {
      const selectedIds = Array.from(document.querySelectorAll('[data-builder-node-selected="true"]'))
        .map((node) => node.getAttribute("data-builder-node-id"))
        .filter(Boolean)
        .sort();
      const source = new Set(window.__novaSmokeContextInvertSourceIds || []);
      const expectedIds = (window.__novaSmokeContextInvertAllIds || [])
        .filter((id) => !source.has(id))
        .sort();
      return selectedIds.length === expectedIds.length &&
        selectedIds.every((id, index) => id === expectedIds[index]);
    })()`,
    "canvas context invert selection result",
  );
  verified.canvasContextInvertSelectionRuntime = true;

  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      node?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      return Boolean(node);
    })()`,
  );
  await waitFor(send, `document.querySelector("[data-builder-canvas]")?.getAttribute("data-builder-canvas-selected-count") === "1"`, "single selection before runtime toggle");
  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const rect = node?.getBoundingClientRect();
      node?.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect ? rect.left + Math.min(24, rect.width / 2) : 100,
        clientY: rect ? rect.top + Math.min(24, rect.height / 2) : 100
      }));
      return Boolean(node);
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-canvas-context-toggle-visible]"))`, "canvas context visible runtime toggle");
  await evaluate(
    send,
    `(() => {
      const action = document.querySelector("[data-builder-canvas-context-toggle-visible]");
      action?.scrollIntoView({ block: "center", inline: "nearest" });
      action?.click();
      return Boolean(action);
    })()`,
  );
  await waitFor(
    send,
    `document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`)?.getAttribute("data-builder-node-visible") === "false"`,
    "canvas context hidden runtime state",
  );
  await evaluate(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const rect = node?.getBoundingClientRect();
      node?.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect ? rect.left + Math.min(24, rect.width / 2) : 100,
        clientY: rect ? rect.top + Math.min(24, rect.height / 2) : 100
      }));
      return Boolean(node);
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-canvas-context-toggle-visible]"))`, "canvas context visible runtime restore toggle");
  await evaluate(
    send,
    `(() => {
      const action = document.querySelector("[data-builder-canvas-context-toggle-visible]");
      action?.scrollIntoView({ block: "center", inline: "nearest" });
      action?.click();
      return Boolean(action);
    })()`,
  );
  await waitFor(
    send,
    `document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`)?.getAttribute("data-builder-node-visible") === "true"`,
    "canvas context restored runtime state",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const node = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeNodes.first}"]\`);
      const runtimeState = node?.getAttribute("data-builder-node-runtime-state") || "";
      return {
        passed:
          node?.getAttribute("data-builder-node-selected") === "true" &&
          node?.getAttribute("data-builder-node-visible") === "true" &&
          runtimeState.includes("visible"),
        detail: \`selected=\${node?.getAttribute("data-builder-node-selected")}, visible=\${node?.getAttribute("data-builder-node-visible")}, state=\${runtimeState}\`
      };
    })()`,
    "canvas context runtime state toggle and restore",
  );
  verified.canvasContextRuntimeStateRuntime = true;

  await closeTransientOverlays(send);
  await evaluate(
    send,
    `(() => {
      const tableViews = Array.from(document.querySelectorAll('[data-builder-node="table-view"]'));
      const node = tableViews.at(-1);
      const rect = node?.getBoundingClientRect();
      window.__novaSmokeCanvasGoSlotNodeId = node?.getAttribute("data-builder-node-id") || "";
      node?.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect ? rect.left + Math.min(32, rect.width / 2) : 120,
        clientY: rect ? rect.top + Math.min(32, rect.height / 2) : 120
      }));
      return Boolean(node);
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-canvas-context-go-slot]"))`, "canvas context go-to-slot action");
  await assertRuntimeCheck(
    send,
    `(() => {
      const action = document.querySelector("[data-builder-canvas-context-go-slot]");
      const state = action?.getAttribute("data-builder-canvas-context-go-slot") || "";
      const selected = document.querySelector(\`[data-builder-node-id="\${window.__novaSmokeCanvasGoSlotNodeId}"]\`)?.getAttribute("data-builder-node-selected") || "";
      return {
        passed: (state === "create" || state === "open") && selected === "true" && !action.disabled,
        detail: \`state=\${state || "missing"}, selected=\${selected || "missing"}, disabled=\${Boolean(action?.disabled)}\`
      };
    })()`,
    "canvas context go-to-slot entry state",
  );
  await evaluate(
    send,
    `(() => {
      const action = document.querySelector("[data-builder-canvas-context-go-slot]");
      action?.scrollIntoView({ block: "center", inline: "nearest" });
      action?.click();
      return Boolean(action);
    })()`,
  );
  await waitFor(
    send,
    `document.querySelector('[data-builder-mode-button="logic"]')?.getAttribute("aria-current") === "page" &&
      Boolean(document.querySelector("[data-builder-rust-slot-navigator]"))`,
    "canvas context go-to-slot opens logic slot navigator",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const navigator = document.querySelector("[data-builder-rust-slot-navigator]");
      const control = document.querySelector("[data-builder-rust-slot-navigator-control]")?.textContent?.trim() || "";
      const command = document.querySelector("[data-builder-rust-slot-navigator-command]")?.textContent?.trim() || "";
      const source = document.querySelector("[data-builder-rust-slot-navigator-source]")?.textContent?.trim() || "";
      const slotCard = document.querySelector("[data-builder-rust-command-slot-card]");
      const slotState = slotCard?.getAttribute("data-builder-rust-command-slot-state") || "";
      const rustSource = document.querySelector("[data-builder-rust-logic]")?.value || "";
      return {
        passed:
          Boolean(navigator) &&
          Number(navigator?.getAttribute("data-builder-rust-slot-navigator-history-count") || 0) >= 1 &&
          Boolean(control) &&
          !/暂无调用控件/.test(control) &&
          Boolean(command) &&
          Boolean(source) &&
          slotState !== "" &&
          rustSource.includes(command),
        detail: \`control=\${control || "missing"}, command=\${command || "missing"}, source=\${source || "missing"}, slotState=\${slotState || "missing"}\`
      };
    })()`,
    "canvas context go-to-slot creates or opens a Rust slot path",
  );
  verified.canvasContextGoSlotRuntime = true;
  await evaluate(send, `document.querySelector('[data-builder-mode-button="design"]')?.click(); true`);
  await waitFor(send, `Boolean(document.querySelector("[data-builder-canvas]"))`, "design canvas after canvas context go-to-slot");

  verified.canvasLayoutStableRuntime = true;
  await closeTransientOverlays(send);

  log("checking marquee selection");
  const marquee = await assertRuntimeCheck(
    send,
    `(() => {
      const canvas = document.querySelector("[data-builder-canvas]");
      const nodes = Array.from(document.querySelectorAll("[data-builder-node-id]")).slice(0, 4);
      const canvasRect = canvas?.getBoundingClientRect();
      const nodeRects = nodes.map((node) => node.getBoundingClientRect()).filter((rect) => rect.width > 0 && rect.height > 0);
      if (!canvasRect || nodeRects.length < 2) {
        return { passed: false, detail: "need canvas and at least two node rects" };
      }
      const right = Math.min(canvasRect.right - 6, Math.max(...nodeRects.map((rect) => rect.right)) + 24);
      const bottom = Math.min(canvasRect.bottom - 6, Math.max(...nodeRects.map((rect) => rect.bottom)) + 24);
      window.__novaSmokeMarquee = {
        pointerId: 91,
        startX: canvasRect.left + 6,
        startY: canvasRect.top + 6,
        endX: right,
        endY: bottom
      };
      return { passed: right > canvasRect.left + 24 && bottom > canvasRect.top + 24, detail: JSON.stringify(window.__novaSmokeMarquee) };
    })()`,
    "marquee coordinates",
  );
  await evaluate(
    send,
    `(() => {
      const point = window.__novaSmokeMarquee;
      const canvas = document.querySelector("[data-builder-canvas]");
      canvas?.dispatchEvent(new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        pointerId: point.pointerId,
        pointerType: "mouse",
        isPrimary: true,
        button: 0,
        buttons: 1,
        clientX: point.startX,
        clientY: point.startY
      }));
      return true;
    })()`,
  );
  await delay(80);
  await evaluate(
    send,
    `(() => {
      const point = window.__novaSmokeMarquee;
      window.dispatchEvent(new PointerEvent("pointermove", {
        bubbles: true,
        cancelable: true,
        pointerId: point.pointerId,
        pointerType: "mouse",
        isPrimary: true,
        button: 0,
        buttons: 1,
        clientX: point.endX,
        clientY: point.endY
      }));
      return true;
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-selection-marquee]")) || Number(document.querySelector("[data-builder-canvas]")?.getAttribute("data-builder-canvas-selected-count") || 0) >= 2`, "marquee selection feedback");
  await evaluate(
    send,
    `(() => {
      const point = window.__novaSmokeMarquee;
      window.dispatchEvent(new PointerEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        pointerId: point.pointerId,
        pointerType: "mouse",
        isPrimary: true,
        button: 0,
        buttons: 0,
        clientX: point.endX,
        clientY: point.endY
      }));
      return true;
    })()`,
  );
  await waitFor(send, `Number(document.querySelector("[data-builder-canvas]")?.getAttribute("data-builder-canvas-selected-count") || 0) >= 2`, "marquee selects multiple controls");
  verified.marqueeSelection = true;
  await closeTransientOverlays(send);
}

async function runProjectWorkspaceChecks(send, verified) {
  log("checking project workspace runtime");
  await assertRuntimeCheck(
    send,
    `(() => {
      const tree = document.querySelector("[data-builder-project-workspace-tree]");
      const nodes = Array.from(document.querySelectorAll("[data-builder-project-workspace-node]"));
      const topology = document.querySelector("[data-builder-project-topology]");
      const sourceOverview = document.querySelector("[data-builder-project-source-overview]");
      const folderHealth = document.querySelector("[data-builder-project-folder-health]");
      const actionCenter = document.querySelector("[data-builder-project-action-center]");
      const workingSet = document.querySelector("[data-builder-project-working-set]");
      const ownership = document.querySelector("[data-builder-project-ownership-matrix]");
      const topologyCount = Number(topology?.getAttribute("data-builder-project-topology-count") || 0);
      const sourceCount = Number(sourceOverview?.getAttribute("data-builder-project-source-overview-count") || 0);
      const folderHealthCount = Number(folderHealth?.getAttribute("data-builder-project-folder-health-count") || 0);
      const folderHealthRows = Array.from(document.querySelectorAll("[data-builder-project-folder-health-row]"));
      const folderHealthIds = folderHealthRows.map((row) => row.getAttribute("data-builder-project-folder-health-row") || "");
      const folderHealthStates = folderHealthRows.map((row) => row.getAttribute("data-builder-project-folder-health-state") || "");
      const folderHealthPaths = Array.from(document.querySelectorAll("[data-builder-project-folder-health-path]")).map((row) => row.textContent?.trim() || "");
      const folderHealthOpen = Array.from(document.querySelectorAll("[data-builder-project-folder-health-open]"));
      const actionCount = Number(actionCenter?.getAttribute("data-builder-project-action-center-count") || 0);
      const actionRows = Array.from(document.querySelectorAll("[data-builder-project-action-center-row]"));
      const actionKinds = actionRows.map((row) => row.getAttribute("data-builder-project-action-center-kind") || "");
      const actionOpen = document.querySelector("[data-builder-project-action-center-open]");
      const actionRunKit = actionCenter?.getAttribute("data-builder-project-action-center-run-kit") || "";
      const actionKitProgress = document.querySelector("[data-builder-project-action-center-kit-progress]");
      const workingSetCount = Number(workingSet?.getAttribute("data-builder-project-working-set-count") || 0);
      const workingSetOpen = document.querySelector("[data-builder-project-working-set-open]");
      const workingSetReveal = document.querySelector("[data-builder-project-working-set-reveal]");
      const ownershipCount = Number(ownership?.getAttribute("data-builder-project-ownership-matrix-count") || 0);
      return {
        passed:
          Boolean(tree) &&
          nodes.length >= 6 &&
          topologyCount > 0 &&
          sourceCount > 0 &&
          folderHealthCount >= 4 &&
          folderHealthRows.length === folderHealthCount &&
          ["root", "source", "generated", "metadata"].every((id) => folderHealthIds.includes(id)) &&
          folderHealthStates.every((state) => ["ready", "warning", "pending"].includes(state)) &&
          folderHealthPaths.some((path) => path.includes(".nova")) &&
          folderHealthOpen.length >= 4 &&
          actionCount >= 5 &&
          actionRows.length === actionCount &&
          ["sync", "logic", "run", "build"].every((kind) => actionKinds.includes(kind)) &&
          Boolean(actionOpen) &&
          Boolean(actionRunKit) &&
          Boolean(actionKitProgress) &&
          workingSetCount >= 3 &&
          Boolean(workingSetOpen) &&
          Boolean(workingSetReveal) &&
          ownershipCount > 0,
        detail: \`nodes=\${nodes.length}, topology=\${topologyCount}, source=\${sourceCount}, folderHealth=\${folderHealthCount}/\${folderHealthIds.join("/")}, actionCenter=\${actionCount}/\${actionKinds.join("/")}, runKit=\${actionRunKit}, workingSet=\${workingSetCount}, ownership=\${ownershipCount}\`
      };
    })()`,
    "project workspace tree, topology, source overview, folder health, action center, working set, and ownership matrix",
  );
  verified.projectWorkspaceTree = true;
  verified.projectTopology = true;
  verified.projectSourceOverview = true;
  verified.projectActionCenterRuntime = true;
  verified.projectWorkingSetRuntime = true;
  verified.projectOwnership = true;

  await fillElementWithText(send, `document.querySelector("[data-builder-project-workspace-search-input]")`, "logic.rs", "project locator search");
  await waitFor(send, `Boolean(document.querySelector('[data-builder-project-locator-result="rust-logic"]'))`, "project locator Rust logic result");
  await assertRuntimeCheck(
    send,
    `(() => {
      const locator = document.querySelector("[data-builder-project-locator]");
      const result = document.querySelector('[data-builder-project-locator-result="rust-logic"]');
      const select = document.querySelector('[data-builder-project-locator-select="rust-logic"]');
      const open = document.querySelector('[data-builder-project-locator-open="rust-logic"]');
      const count = Number(locator?.getAttribute("data-builder-project-locator-count") || 0);
      return {
        passed:
          Boolean(locator) &&
          locator?.getAttribute("data-builder-project-locator-query") === "logic.rs" &&
          count >= 1 &&
          Boolean(result) &&
          result?.getAttribute("data-builder-project-locator-result-group") === "rust" &&
          Boolean(select) &&
          Boolean(open),
        detail: \`query=\${locator?.getAttribute("data-builder-project-locator-query") || "missing"}, count=\${count}, group=\${result?.getAttribute("data-builder-project-locator-result-group") || "missing"}\`
      };
    })()`,
    "project locator search results",
  );
  await clickElementCenter(send, `document.querySelector('[data-builder-project-locator-select="rust-logic"]')`, "project locator Rust result");
  await waitFor(
    send,
    `document.querySelector("[data-builder-project-workspace-tree]")?.getAttribute("data-builder-project-tree-selected-node") === "rust-logic"`,
    "project locator selects Rust logic node",
  );
  verified.projectLocatorRuntime = true;
  await clickElementCenter(send, `document.querySelector("[data-builder-project-workspace-search-clear]")`, "project locator clear search");
  await waitFor(send, `!document.querySelector("[data-builder-project-locator]")`, "project locator cleared");

  await evaluate(
    send,
    `(() => {
      const tree = document.querySelector("[data-builder-project-workspace-tree]");
      tree?.focus();
      window.__novaSmokeProjectTreeInitialSelected = tree?.getAttribute("data-builder-project-tree-selected-node") || "";
      window.__novaSmokeProjectTreeInitialVisible = Number(tree?.getAttribute("data-builder-project-tree-visible-count") || 0);
      window.__novaSmokeProjectTreeInitialCollapsed = Number(tree?.getAttribute("data-builder-project-tree-collapsed-count") || 0);
      tree?.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
      return Boolean(tree);
    })()`,
  );
  await waitFor(
    send,
    `(() => {
      const tree = document.querySelector("[data-builder-project-workspace-tree]");
      const selected = tree?.getAttribute("data-builder-project-tree-selected-node") || "";
      return Boolean(selected) && selected !== window.__novaSmokeProjectTreeInitialSelected;
    })()`,
    "project tree End key selects the last visible node",
  );
  await evaluate(
    send,
    `(() => {
      const tree = document.querySelector("[data-builder-project-workspace-tree]");
      tree?.focus();
      tree?.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
      return Boolean(tree);
    })()`,
  );
  await waitFor(
    send,
    `(() => {
      const tree = document.querySelector("[data-builder-project-workspace-tree]");
      const active = tree?.getAttribute("aria-activedescendant") || "";
      return active === "project-explorer-node-root";
    })()`,
    "project tree Home key returns to root",
  );
  await evaluate(
    send,
    `(() => {
      const tree = document.querySelector("[data-builder-project-workspace-tree]");
      tree?.focus();
      tree?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
      return Boolean(tree);
    })()`,
  );
  await waitFor(
    send,
    `(() => {
      const tree = document.querySelector("[data-builder-project-workspace-tree]");
      const selected = tree?.getAttribute("data-builder-project-tree-selected-node") || "";
      return Boolean(selected) && selected !== "root";
    })()`,
    "project tree ArrowDown moves selection",
  );
  await evaluate(
    send,
    `(() => {
      const tree = document.querySelector("[data-builder-project-workspace-tree]");
      tree?.focus();
      tree?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", ctrlKey: true, altKey: true, bubbles: true, cancelable: true }));
      return Boolean(tree);
    })()`,
  );
  await waitFor(
    send,
    `Number(document.querySelector("[data-builder-project-workspace-tree]")?.getAttribute("data-builder-project-tree-collapsed-count") || 0) > Number(window.__novaSmokeProjectTreeInitialCollapsed || 0)`,
    "project tree Ctrl+Alt+Left collapses folders",
  );
  await evaluate(
    send,
    `(() => {
      const tree = document.querySelector("[data-builder-project-workspace-tree]");
      tree?.focus();
      tree?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", ctrlKey: true, altKey: true, bubbles: true, cancelable: true }));
      return Boolean(tree);
    })()`,
  );
  await waitFor(
    send,
    `Number(document.querySelector("[data-builder-project-workspace-tree]")?.getAttribute("data-builder-project-tree-collapsed-count") || -1) === 0`,
    "project tree Ctrl+Alt+Right expands folders",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const tree = document.querySelector("[data-builder-project-workspace-tree]");
      const selectedNodeId = tree?.getAttribute("data-builder-project-tree-selected-node") || "";
      const active = tree?.getAttribute("aria-activedescendant") || "";
      const selectedNode = selectedNodeId ? document.querySelector(\`[data-builder-project-tree-node="\${CSS.escape(selectedNodeId)}"]\`) : null;
      const visible = Number(tree?.getAttribute("data-builder-project-tree-visible-count") || 0);
      const collapsed = Number(tree?.getAttribute("data-builder-project-tree-collapsed-count") || -1);
      return {
        passed:
          Boolean(tree) &&
          Boolean(selectedNode) &&
          active === \`project-explorer-node-\${selectedNodeId}\` &&
          visible >= Number(window.__novaSmokeProjectTreeInitialVisible || 0) &&
          collapsed === 0,
        detail: \`selected=\${selectedNodeId}, active=\${active}, visible=\${visible}, collapsed=\${collapsed}\`
      };
    })()`,
    "project tree keyboard navigation and bulk folding",
  );
  verified.projectTreeKeyboardRuntime = true;

  await evaluate(
    send,
    `(() => {
      const node = Array.from(document.querySelectorAll("[data-builder-project-workspace-node]")).find((entry) => {
        const button = Array.from(entry.querySelectorAll("button")).at(-1);
        return button && !button.disabled;
      });
      const button = node ? Array.from(node.querySelectorAll("button")).at(-1) : null;
      button?.click();
      return Boolean(button);
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-project-workspace-detail]"))`, "project workspace detail after node click");
  await waitFor(send, `Boolean(document.querySelector("[data-builder-project-node-dossier]"))`, "project node dossier after node click");
  await assertRuntimeCheck(
    send,
    `(() => {
      const dossier = document.querySelector("[data-builder-project-node-dossier]");
      const tasks = document.querySelectorAll("[data-builder-project-node-dossier-task]");
      const openFiles = document.querySelector("[data-builder-project-open-files]");
      const scopes = document.querySelector("[data-builder-project-workspace-scopes]");
      return {
        passed: Boolean(dossier) && tasks.length > 0 && Boolean(openFiles) && Boolean(scopes),
        detail: \`tasks=\${tasks.length}, openFiles=\${Boolean(openFiles)}, scopes=\${Boolean(scopes)}\`
      };
    })()`,
    "project node dossier and project workspace panels",
  );
  verified.projectNodeDossier = true;

  await evaluate(
    send,
    `(() => {
      const uiNode = Array.from(document.querySelectorAll('[data-builder-project-tree-node^="ui-"]'))
        .find((entry) => entry.getAttribute("data-builder-project-tree-node") !== "ui-folder");
      const button = uiNode?.querySelector("[data-builder-project-workspace-node-select]");
      button?.click();
      return Boolean(button);
    })()`,
  );
  await waitFor(
    send,
    `Boolean(document.querySelector("[data-builder-project-node-action-strip]")) &&
      document.querySelector("[data-builder-project-node-action-strip]")?.getAttribute("data-builder-project-node-action-strip-file") !== "none"`,
    "project node action strip for UI file",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const strip = document.querySelector("[data-builder-project-node-action-strip]");
      const open = document.querySelector("[data-builder-project-node-action-open]");
      const rename = document.querySelector("[data-builder-project-node-action-rename]");
      const duplicate = document.querySelector("[data-builder-project-node-action-duplicate]");
      const newUi = document.querySelector("[data-builder-project-node-action-new-ui]");
      const copyPath = document.querySelector("[data-builder-project-node-action-copy-path]");
      const reveal = document.querySelector("[data-builder-project-node-action-reveal]");
      const filter = document.querySelector("[data-builder-project-node-action-filter]");
      const deleteButton = document.querySelector("[data-builder-project-node-action-delete]");
      const fileId = strip?.getAttribute("data-builder-project-node-action-strip-file") || "";
      const nodeId = strip?.getAttribute("data-builder-project-node-action-strip-node") || "";
      return {
        passed:
          Boolean(strip) &&
          nodeId.startsWith("ui-") &&
          Boolean(fileId && fileId !== "none") &&
          Boolean(open && !open.disabled) &&
          Boolean(rename && !rename.disabled) &&
          Boolean(duplicate && !duplicate.disabled) &&
          Boolean(newUi && !newUi.disabled) &&
          Boolean(copyPath && !copyPath.disabled) &&
          Boolean(reveal) &&
          Boolean(filter && !filter.disabled) &&
          Boolean(deleteButton && !deleteButton.disabled),
        detail: \`node=\${nodeId || "missing"}, file=\${fileId || "missing"}, rename=\${Boolean(rename && !rename.disabled)}, duplicate=\${Boolean(duplicate && !duplicate.disabled)}, delete=\${Boolean(deleteButton && !deleteButton.disabled)}\`
      };
    })()`,
    "project node action strip direct file actions",
  );
  await clickElementCenter(send, `document.querySelector("[data-builder-project-node-action-rename]")`, "project node action strip rename");
  await waitFor(
    send,
    `document.activeElement === document.querySelector("[data-builder-project-file-rename-input]")`,
    "project node action strip focuses rename input",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const summary = document.querySelector("[data-builder-editor-tabs-summary]")?.textContent || "";
      const uiNodes = Array.from(document.querySelectorAll('[data-builder-project-tree-node^="ui-"]'))
        .filter((entry) => entry.getAttribute("data-builder-project-tree-node") !== "ui-folder");
      const strip = document.querySelector("[data-builder-project-node-action-strip]");
      window.__novaSmokeProjectActionBefore = {
        fileCount: Number(summary.match(/(\\d+)\\s*文件/)?.[1] || 0),
        uiNodeCount: uiNodes.length,
        selectedFile: strip?.getAttribute("data-builder-project-node-action-strip-file") || "",
        selectedNode: strip?.getAttribute("data-builder-project-node-action-strip-node") || ""
      };
      return {
        passed:
          window.__novaSmokeProjectActionBefore.fileCount > 0 &&
          window.__novaSmokeProjectActionBefore.uiNodeCount > 0 &&
          window.__novaSmokeProjectActionBefore.selectedFile !== "" &&
          window.__novaSmokeProjectActionBefore.selectedFile !== "none",
        detail: JSON.stringify(window.__novaSmokeProjectActionBefore)
      };
    })()`,
    "project node action strip baseline before duplicate",
  );
  await clickElementCenter(send, `document.querySelector("[data-builder-project-node-action-duplicate]")`, "project node action strip duplicate");
  await waitFor(
    send,
    `(() => {
      const summary = document.querySelector("[data-builder-editor-tabs-summary]")?.textContent || "";
      const fileCount = Number(summary.match(/(\\d+)\\s*文件/)?.[1] || 0);
      return fileCount >= Number(window.__novaSmokeProjectActionBefore?.fileCount || 0) + 1;
    })()`,
    "project node duplicate increases project file count",
  );
  await evaluate(send, `document.querySelector('[data-builder-mode-button="project"]')?.click(); true`);
  await waitFor(send, `Boolean(document.querySelector("[data-builder-project-workspace-tree]"))`, "project tree after duplicate");
  await assertRuntimeCheck(
    send,
    `(() => {
      const summary = document.querySelector("[data-builder-editor-tabs-summary]")?.textContent || "";
      const fileCount = Number(summary.match(/(\\d+)\\s*文件/)?.[1] || 0);
      const uiNodes = Array.from(document.querySelectorAll('[data-builder-project-tree-node^="ui-"]'))
        .filter((entry) => entry.getAttribute("data-builder-project-tree-node") !== "ui-folder");
      const duplicateNode = uiNodes.find((entry) => /Copy\\.ui/.test(entry.textContent || ""));
      window.__novaSmokeProjectDuplicateNodeId = duplicateNode?.getAttribute("data-builder-project-tree-node") || "";
      window.__novaSmokeProjectFileCountAfterDuplicate = fileCount;
      return {
        passed:
          fileCount >= Number(window.__novaSmokeProjectActionBefore?.fileCount || 0) + 1 &&
          uiNodes.length >= Number(window.__novaSmokeProjectActionBefore?.uiNodeCount || 0) + 1 &&
          Boolean(window.__novaSmokeProjectDuplicateNodeId),
        detail: \`fileCount=\${fileCount}, uiNodes=\${uiNodes.length}, duplicate=\${window.__novaSmokeProjectDuplicateNodeId || "missing"}\`
      };
    })()`,
    "project node duplicate creates a selectable UI file node",
  );
  verified.projectNodeDuplicateRuntime = true;

  await evaluate(
    send,
    `(() => {
      const nodeId = window.__novaSmokeProjectDuplicateNodeId || "";
      const node = nodeId ? document.querySelector(\`[data-builder-project-tree-node="\${CSS.escape(nodeId)}"]\`) : null;
      node?.querySelector("[data-builder-project-workspace-node-select]")?.click();
      return Boolean(node);
    })()`,
  );
  await waitFor(
    send,
    `document.querySelector("[data-builder-project-node-action-strip]")?.getAttribute("data-builder-project-node-action-strip-node") === window.__novaSmokeProjectDuplicateNodeId`,
    "project node action strip selects duplicate UI file",
  );
  await clickElementCenter(send, `document.querySelector("[data-builder-project-node-action-delete]")`, "project node action strip delete");
  await waitFor(send, `Boolean(document.querySelector("[data-builder-destructive-dialog]"))`, "project node delete confirmation dialog");
  await assertRuntimeCheck(
    send,
    `(() => {
      const dialog = document.querySelector("[data-builder-destructive-dialog]");
      const title = document.querySelector("[data-builder-destructive-dialog-title]")?.textContent || "";
      const description = document.querySelector("[data-builder-destructive-dialog-description]")?.textContent || "";
      const cancel = document.querySelector("[data-builder-destructive-cancel]");
      const confirm = document.querySelector("[data-builder-destructive-confirm]");
      return {
        passed:
          Boolean(dialog) &&
          /删除|清空/.test(title) &&
          /项目|UI 文件|移除/.test(description) &&
          Boolean(cancel) &&
          Boolean(confirm),
        detail: \`title=\${title.trim()}, description=\${description.trim().replace(/\\s+/g, " ").slice(0, 160)}, cancel=\${Boolean(cancel)}, confirm=\${Boolean(confirm)}\`
      };
    })()`,
    "project node delete opens guarded destructive dialog",
  );
  await clickElementCenter(send, `document.querySelector("[data-builder-destructive-cancel]")`, "project node delete cancel");
  await waitFor(send, `!document.querySelector("[data-builder-destructive-dialog]")`, "project node delete dialog canceled");
  await assertRuntimeCheck(
    send,
    `(() => {
      const summary = document.querySelector("[data-builder-editor-tabs-summary]")?.textContent || "";
      const fileCount = Number(summary.match(/(\\d+)\\s*文件/)?.[1] || 0);
      const duplicateNodeId = window.__novaSmokeProjectDuplicateNodeId || "";
      const duplicateNode = duplicateNodeId ? document.querySelector(\`[data-builder-project-tree-node="\${CSS.escape(duplicateNodeId)}"]\`) : null;
      return {
        passed: fileCount === Number(window.__novaSmokeProjectFileCountAfterDuplicate || 0) && Boolean(duplicateNode),
        detail: \`fileCount=\${fileCount}, afterDuplicate=\${window.__novaSmokeProjectFileCountAfterDuplicate || 0}, duplicateStillVisible=\${Boolean(duplicateNode)}\`
      };
    })()`,
    "project node delete cancel preserves duplicated UI file",
  );
  verified.projectNodeDeleteDialogRuntime = true;
  verified.projectNodeActionStripRuntime = true;

  await assertRuntimeCheck(
    send,
    `(() => {
      const tabStrip = document.querySelector("[data-builder-editor-tabs]");
      const projectOpenFiles = document.querySelector("[data-builder-project-open-files]");
      const uiOpenRows = Array.from(document.querySelectorAll('[data-builder-project-open-file-kind="ui"]'));
      const logicRow = document.querySelector('[data-builder-project-open-file="logic:rust"]');
      const buildRow = document.querySelector('[data-builder-project-open-file="build:workspace"]');
      const newUiButton = document.querySelector("[data-builder-project-open-files-new-ui]");
      const tabStripRect = tabStrip?.getBoundingClientRect();
      const tabStripStyle = tabStrip ? getComputedStyle(tabStrip) : null;
      window.__novaSmokeProjectFileCount = Number((document.querySelector("[data-builder-editor-tabs-summary]")?.textContent || "").match(/(\\d+)\\s*文件/)?.[1] || 0);
      window.__novaSmokeOpenUiTabs = uiOpenRows.length;
      window.__novaSmokeEditorTabCount = Number(tabStrip?.getAttribute("data-builder-editor-tab-count") || 0);
      return {
        passed:
          Boolean(tabStrip) &&
          tabStrip?.getAttribute("data-builder-editor-tabs-visibility") === "sidebar-only" &&
          tabStrip?.getAttribute("data-builder-editor-tabs-replaced-by") === "project-open-files" &&
          Boolean(tabStripRect && tabStripRect.height <= 2 && tabStripRect.width <= 2) &&
          tabStripStyle?.position === "absolute" &&
          Boolean(projectOpenFiles) &&
          uiOpenRows.length >= 1 &&
          Boolean(logicRow) &&
          Boolean(buildRow) &&
          Boolean(newUiButton) &&
          Number(tabStrip?.getAttribute("data-builder-editor-tab-count") || 0) >= uiOpenRows.length + 2,
        detail: \`uiRows=\${uiOpenRows.length}, editorTabs=\${tabStrip?.getAttribute("data-builder-editor-tab-count") || "0"}, visibility=\${tabStrip?.getAttribute("data-builder-editor-tabs-visibility") || "missing"}, rect=\${tabStripRect ? Math.round(tabStripRect.width) + "x" + Math.round(tabStripRect.height) : "missing"}, projectFiles=\${window.__novaSmokeProjectFileCount || 0}, logic=\${Boolean(logicRow)}, build=\${Boolean(buildRow)}\`
      };
    })()`,
    "project open files manager replaces the duplicated top editor tab strip",
  );

  await evaluate(send, `document.querySelector("[data-builder-project-open-files-new-ui]")?.click(); true`);
  await waitFor(
    send,
    `(() => {
      const tabStrip = document.querySelector("[data-builder-editor-tabs]");
      const uiRows = document.querySelectorAll('[data-builder-editor-tab="ui"]');
      return uiRows.length >= Number(window.__novaSmokeOpenUiTabs || 0) + 1 &&
        Number(tabStrip?.getAttribute("data-builder-editor-tab-count") || 0) >= Number(window.__novaSmokeEditorTabCount || 0) + 1;
    })()`,
    "new UI file opens as an editor tab",
  );
  verified.editorTabsRuntime = true;

  await evaluate(send, `document.querySelector('[data-builder-mode-button="project"]')?.click(); true`);
  await waitFor(send, `Boolean(document.querySelector("[data-builder-project-open-files]"))`, "project open files after new UI");
  await assertRuntimeCheck(
    send,
    `(() => {
      const projectOpenFiles = document.querySelector("[data-builder-project-open-files]");
      const activeTabId = projectOpenFiles?.getAttribute("data-builder-project-open-files-active-tab") || "";
      const activeRow = activeTabId ? document.querySelector(\`[data-builder-project-open-file="\${CSS.escape(activeTabId)}"]\`) : null;
      const activeOpenButton = activeRow?.querySelector("[data-builder-project-open-file-open]");
      const activeCloseButton = activeRow?.querySelector("[data-builder-project-open-file-close]");
      const uiRows = Array.from(document.querySelectorAll('[data-builder-project-open-file-kind="ui"]'));
      const projectFileCount = Number((document.querySelector("[data-builder-editor-tabs-summary]")?.textContent || "").match(/(\\d+)\\s*文件/)?.[1] || 0);
      return {
        passed:
          activeTabId.startsWith("ui:") &&
          Boolean(activeRow) &&
          activeRow?.getAttribute("data-builder-project-open-file-state") === "active" &&
          Boolean(activeOpenButton) &&
          Boolean(activeCloseButton) &&
          !activeCloseButton.disabled &&
          uiRows.length >= Number(window.__novaSmokeOpenUiTabs || 0) + 1 &&
          projectFileCount >= Number(window.__novaSmokeProjectFileCount || 0) + 1,
        detail: \`active=\${activeTabId}, uiRows=\${uiRows.length}, projectFiles=\${projectFileCount}, closeDisabled=\${Boolean(activeCloseButton?.disabled)}\`
      };
    })()`,
    "new UI file is managed by project open files",
  );
  verified.projectOpenFilesRuntime = true;

  await evaluate(
    send,
    `(() => {
      const activeTabId = document.querySelector("[data-builder-project-open-files]")?.getAttribute("data-builder-project-open-files-active-tab") || "";
      const activeRow = activeTabId ? document.querySelector(\`[data-builder-project-open-file="\${CSS.escape(activeTabId)}"]\`) : null;
      activeRow?.querySelector("[data-builder-project-open-file-close]")?.click();
      return Boolean(activeRow);
    })()`,
  );
  await waitFor(
    send,
    `(() => {
      const projectFileCount = Number((document.querySelector("[data-builder-editor-tabs-summary]")?.textContent || "").match(/(\\d+)\\s*文件/)?.[1] || 0);
      const uiTabs = document.querySelectorAll('[data-builder-editor-tab="ui"]');
      return uiTabs.length === Number(window.__novaSmokeOpenUiTabs || 0) && projectFileCount >= Number(window.__novaSmokeProjectFileCount || 0) + 1;
    })()`,
    "closing an editor tab removes only the editor tab",
  );
  await evaluate(send, `document.querySelector('[data-builder-mode-button="project"]')?.click(); true`);
  await waitFor(send, `Boolean(document.querySelector("[data-builder-project-open-files]"))`, "project open files after closing UI tab");
  await waitFor(
    send,
    `(() => {
      const projectFileCount = Number((document.querySelector("[data-builder-editor-tabs-summary]")?.textContent || "").match(/(\\d+)\\s*文件/)?.[1] || 0);
      const uiRows = document.querySelectorAll('[data-builder-project-open-file-kind="ui"]');
      return uiRows.length === Number(window.__novaSmokeOpenUiTabs || 0) && projectFileCount >= Number(window.__novaSmokeProjectFileCount || 0) + 1;
    })()`,
    "closing an editor tab keeps the project file",
  );
  verified.projectOpenFileCloseRuntime = true;

  await evaluate(
    send,
    `(() => {
      const reveal = document.querySelector('[data-builder-project-open-file="logic:rust"] [data-builder-project-open-file-reveal]');
      reveal?.click();
      return Boolean(reveal);
    })()`,
  );
  await waitFor(send, `document.querySelector('[data-builder-project-workspace-node="rust-logic"]')?.getAttribute("aria-selected") === "true"`, "project open file reveal selects Rust logic node");
  verified.projectOpenFileRevealRuntime = true;

  await evaluate(
    send,
    `(() => {
      const open = document.querySelector('[data-builder-project-open-file="logic:rust"] [data-builder-project-open-file-open]');
      open?.click();
      return Boolean(open);
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-rust-editor]"))`, "project open files can activate Rust logic tab");
  await evaluate(send, `document.querySelector('[data-builder-mode-button="project"]')?.click(); true`);
  await waitFor(send, `Boolean(document.querySelector("[data-builder-project-open-files]"))`, "project workspace restored after opening logic tab");

  await assertRuntimeCheck(
    send,
    `(() => {
      const saveManifest = document.querySelector("[data-builder-project-save-manifest]");
      const saveRoot = saveManifest?.getAttribute("data-builder-project-save-root") || "";
      const saveItems = Array.from(document.querySelectorAll("[data-builder-project-save-manifest-item]"));
      const sourceItems = saveItems.filter((item) => item.getAttribute("data-builder-project-save-manifest-item-scope") === "source");
      const generatedItems = saveItems.filter((item) => item.getAttribute("data-builder-project-save-manifest-item-scope") === "generated");
      const metadataItems = saveItems.filter((item) => item.getAttribute("data-builder-project-save-manifest-item-scope") === "metadata");
      const savePlan = document.querySelector("[data-builder-project-save-plan]");
      const savePlanSteps = Array.from(document.querySelectorAll("[data-builder-project-save-plan-step]"));
      const savePlanScopes = savePlanSteps.map((step) => step.getAttribute("data-builder-project-save-plan-step-scope") || "");
      const savePlanStates = savePlanSteps.map((step) => step.getAttribute("data-builder-project-save-plan-step-status") || "");
      const savePlanPending = savePlanSteps.map((step) => {
        const value = step.getAttribute("data-builder-project-save-plan-step-pending-count");
        return value === null ? -1 : Number(value);
      });
      const savePlanPaths = Array.from(document.querySelectorAll("[data-builder-project-save-plan-path]")).map((node) => node.textContent?.trim() || "");
      const savePlanOpen = Array.from(document.querySelectorAll("[data-builder-project-save-plan-open]"));
      const routing = document.querySelector("[data-builder-project-file-routing][data-builder-project-save-destinations]");
      const routeGroups = Array.from(document.querySelectorAll("[data-builder-project-file-route-group]"));
      const routes = Array.from(document.querySelectorAll("[data-builder-project-file-route]"));
      const metadataGroup = document.querySelector('[data-builder-project-nova-metadata="true"]');
      const runButton = document.querySelector("[data-builder-project-save-manifest-run]");
      return {
        passed:
          Boolean(saveManifest) &&
          Boolean(saveRoot) &&
          saveItems.length >= 6 &&
          sourceItems.length > 0 &&
          generatedItems.length > 0 &&
          metadataItems.length > 0 &&
          Boolean(savePlan) &&
          Number(savePlan?.getAttribute("data-builder-project-save-plan-count") || 0) === 3 &&
          savePlanSteps.length === 3 &&
          ["source", "generated", "metadata"].every((scope) => savePlanScopes.includes(scope)) &&
          savePlanStates.every((state) => ["ready", "warning", "pending"].includes(state)) &&
          savePlanPending.every((count) => count >= 0) &&
          savePlanPaths.some((path) => path.includes(".nova")) &&
          savePlanOpen.length === 3 &&
          Boolean(routing) &&
          routeGroups.length >= 3 &&
          routes.length >= 6 &&
          Boolean(metadataGroup) &&
          Boolean(runButton),
        detail: \`saveRoot=\${saveRoot}, manifest=\${saveItems.length}, source=\${sourceItems.length}, generated=\${generatedItems.length}, metadata=\${metadataItems.length}, savePlan=\${savePlanSteps.length}/\${savePlanScopes.join("/")}, states=\${savePlanStates.join("/")}, pending=\${savePlanPending.join("/")}, paths=\${savePlanPaths.join("|")}, open=\${savePlanOpen.length}, routing=\${Boolean(routing)}, metadataGroup=\${Boolean(metadataGroup)}, runButton=\${Boolean(runButton)}, routeGroups=\${routeGroups.length}, routes=\${routes.length}\`
      };
    })()`,
    "project folder save destinations and .nova metadata routing",
  );
  await clickElementCenter(
    send,
    `document.querySelector('[data-builder-project-save-plan-open="metadata"]')`,
    "project save plan .nova route",
  );
  await waitFor(
    send,
    `document.querySelector("[data-builder-project-save-plan-route]")?.getAttribute("data-builder-project-save-plan-route") === "metadata"`,
    "project save plan route state",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const route = document.querySelector("[data-builder-project-save-plan-route]");
      const routeId = route?.getAttribute("data-builder-project-save-plan-route") || "";
      const routeFilter = route?.getAttribute("data-builder-project-save-plan-route-filter") || "";
      const routeQuery = route?.getAttribute("data-builder-project-save-plan-route-query") || "";
      const routePath = document.querySelector("[data-builder-project-save-plan-route-path]")?.textContent?.trim() || "";
      const workspaceSearch = document.querySelector("[data-builder-project-workspace-search-input]");
      const treeSearch = document.querySelector("[data-builder-project-tree-search] input");
      const searchValue = workspaceSearch?.value || treeSearch?.value || "";
      const activeMetaFilters = Array.from(document.querySelectorAll('[data-builder-project-filter-option="meta"]'))
        .filter((button) => button.getAttribute("aria-pressed") === "true");
      const locator = document.querySelector("[data-builder-project-locator]");
      return {
        passed:
          routeId === "metadata" &&
          routeFilter === "meta" &&
          routeQuery === ".nova" &&
          routePath.includes(".nova") &&
          searchValue === ".nova" &&
          activeMetaFilters.length >= 1 &&
          locator?.getAttribute("data-builder-project-locator-query") === ".nova",
        detail: \`route=\${routeId}, filter=\${routeFilter}, query=\${routeQuery}, path=\${routePath}, search=\${searchValue}, activeMeta=\${activeMetaFilters.length}, locator=\${locator?.getAttribute("data-builder-project-locator-query") || "missing"}\`
      };
    })()`,
    "project save plan routes .nova stage into project tree filter and search",
  );
  verified.projectFolderSaveRuntime = true;
}

async function runModeContractChecks(send, verified) {
  log("checking builder mode contract");
  await assertRuntimeCheck(
    send,
    `(() => {
      const modes = Array.from(document.querySelectorAll("[data-builder-mode-button]")).map((node) => node.getAttribute("data-builder-mode-button")).filter(Boolean);
      const expected = ["project", "design", "logic", "build"];
      const hasExpected = expected.every((mode) => modes.includes(mode));
      const noRedundantModes = !modes.includes("preview") && !modes.includes("export");
      const modeRail = document.querySelector('[data-builder-mode-rail="qt-creator-left"]');
      const modeBar = document.querySelector('[data-builder-mode-bar="project-design-logic-build"]');
      return {
        passed: modes.length === expected.length && hasExpected && noRedundantModes && Boolean(modeRail) && !modeBar,
        detail: \`modes=\${modes.join("/")}, rail=\${Boolean(modeRail)}, redundantBar=\${Boolean(modeBar)}\`
      };
    })()`,
    "builder preview/export mode removal",
  );
  verified.previewExportRemovedRuntime = true;
}

async function runComponentPaletteRuntimeChecks(send, verified) {
  log("checking component palette coverage runtime");
  await evaluate(send, `document.querySelector('[data-builder-dock-tab="components"]')?.click(); true`);
  await waitFor(send, `Boolean(document.querySelector('[data-builder-dock-tab="components"][data-builder-dock-tab-active="true"]'))`, "components dock tab active");
  await waitFor(send, `Boolean(document.querySelector("[data-builder-component-coverage-panel]"))`, "component coverage panel");
  await assertRuntimeCheck(
    send,
    `(() => {
      const coverage = document.querySelector("[data-builder-component-coverage-panel]");
      const countLabel = document.querySelector("[data-builder-component-coverage-count]")?.textContent?.trim() || "";
      const groups = Array.from(document.querySelectorAll("[data-builder-component-coverage-group]"));
      const missingBadges = Array.from(document.querySelectorAll("[data-builder-component-coverage-missing]"));
      const quickInsert = Array.from(document.querySelectorAll("[data-builder-component-quick-insert]"));
      const categories = Array.from(document.querySelectorAll("[data-builder-component-category]"));
      const collections = document.querySelector("[data-builder-component-collections]");
      const favorites = document.querySelector("[data-builder-component-favorites]");
      const recents = document.querySelector("[data-builder-component-recents]");
      const kits = Array.from(document.querySelectorAll("[data-builder-component-kit]"));
      const kitTypes = Array.from(document.querySelectorAll("[data-builder-component-kit-type]"));
      const kitFocusActions = Array.from(document.querySelectorAll("[data-builder-component-kit-focus]"));
      const kitInsertActions = Array.from(document.querySelectorAll("[data-builder-component-kit-insert]"));
      const kitScaffoldActions = Array.from(document.querySelectorAll("[data-builder-component-kit-scaffold]"));
      const paletteLayout = document.querySelector("[data-builder-component-palette-layout]");
      const categoryStrip = document.querySelector("[data-builder-component-category-strip]");
      const kitLayout = document.querySelector("[data-builder-component-kits]");
      const compactRows = Array.from(document.querySelectorAll('[data-builder-palette-row-layout="compact"]'));
      const md3ShellGroup = document.querySelector('[data-builder-component-coverage-group="md3-application-shell"]');
      const md3ShellBadge = document.querySelector('[data-builder-component-coverage-missing="md3-application-shell"]');
      const completeGroups = missingBadges.filter((badge) => /完整/.test(badge.textContent || ""));
      const parsed = countLabel.match(/^(\\d+)\\/(\\d+)$/);
      const complete = parsed ? Number(parsed[1]) : 0;
      const total = parsed ? Number(parsed[2]) : 0;
      return {
        passed:
          Boolean(coverage) &&
          total >= 6 &&
          complete === total &&
          groups.length >= 5 &&
          completeGroups.length >= 5 &&
          Boolean(md3ShellGroup) &&
          /完整/.test(md3ShellBadge?.textContent || "") &&
          quickInsert.length >= 6 &&
          categories.length >= 4 &&
          paletteLayout?.getAttribute("data-builder-component-palette-layout") === "qt-compact-list" &&
          categoryStrip?.getAttribute("data-builder-component-category-strip") === "compact-grid" &&
          kits.length >= 5 &&
          kitLayout?.getAttribute("data-builder-component-kits-layout") === "compact-list" &&
          kitTypes.length >= 20 &&
          kitFocusActions.length >= 5 &&
          kitInsertActions.length >= 5 &&
          kitScaffoldActions.length >= 5 &&
          compactRows.length >= 6 &&
          Boolean(collections) &&
          Boolean(favorites) &&
          Boolean(recents),
        detail: \`count=\${countLabel}, groups=\${groups.length}, completeGroups=\${completeGroups.length}, md3Shell=\${Boolean(md3ShellGroup)}, quickInsert=\${quickInsert.length}, categories=\${categories.length}, categoryStrip=\${categoryStrip?.getAttribute("data-builder-component-category-strip") || "missing"}, paletteLayout=\${paletteLayout?.getAttribute("data-builder-component-palette-layout") || "missing"}, kits=\${kits.length}, kitLayout=\${kitLayout?.getAttribute("data-builder-component-kits-layout") || "missing"}, kitTypes=\${kitTypes.length}, compactRows=\${compactRows.length}, scaffoldActions=\${kitScaffoldActions.length}, collections=\${Boolean(collections)}, favorites=\${Boolean(favorites)}, recents=\${Boolean(recents)}\`
      };
    })()`,
    "MD3 and Qt desktop component palette coverage",
  );
  await evaluate(send, `document.querySelector('[data-builder-component-kit-focus="md3-window-shell"]')?.click(); true`);
  await waitFor(send, `document.querySelector("[data-builder-component-kits]")?.getAttribute("data-builder-component-active-kit") === "md3-window-shell"`, "component kit focus active");
  await assertRuntimeCheck(
    send,
    `(() => {
      const allowed = new Set(["top-app-bar", "navigation-rail", "navigation-drawer", "navigation-suite", "status-bar", "extended-fab", "side-sheet", "bottom-sheet", "snackbar"]);
      const rows = Array.from(document.querySelectorAll("[data-builder-palette-type]"));
      return {
        passed:
          rows.length >= 6 &&
          rows.every((row) => allowed.has(row.getAttribute("data-builder-palette-type") || "")) &&
          !document.querySelector("[data-builder-component-collections]") &&
          Boolean(document.querySelector('[data-builder-component-kit-active="true"]')),
        detail: \`rows=\${rows.length}, active=\${document.querySelector("[data-builder-component-kits]")?.getAttribute("data-builder-component-active-kit") || "none"}\`
      };
    })()`,
    "component palette kit focus filter",
  );
  const beforeKitInsertCount = await evaluate(send, `document.querySelectorAll("[data-builder-node]").length`);
  await evaluate(send, `document.querySelector('[data-builder-component-kit-insert="top-app-bar"]')?.click(); true`);
  await waitFor(send, `document.querySelectorAll("[data-builder-node]").length > ${Number(beforeKitInsertCount) || 0}`, "component kit inserts a canvas node");
  await waitFor(send, `Boolean(document.querySelector('[data-builder-node="top-app-bar"][data-builder-node-selected="true"]'))`, "component kit inserted top app bar");

  const beforeKitScaffoldCount = await evaluate(send, `document.querySelectorAll("[data-builder-node]").length`);
  const scaffoldCount = await evaluate(
    send,
    `Number(document.querySelector('[data-builder-component-kit-scaffold="md3-window-shell"]')?.getAttribute("data-builder-component-kit-scaffold-count") || 0)`,
  );
  await evaluate(send, `document.querySelector('[data-builder-component-kit-scaffold="md3-window-shell"]')?.click(); true`);
  await waitFor(
    send,
    `document.querySelectorAll("[data-builder-node]").length >= ${Number(beforeKitScaffoldCount) || 0} + ${Math.max(1, Number(scaffoldCount) || 0)}`,
    "component kit scaffold inserts multiple canvas nodes",
  );
  await waitFor(
    send,
    `Number(document.querySelector("[data-builder-canvas]")?.getAttribute("data-builder-canvas-selected-count") || 0) >= ${Math.max(1, Number(scaffoldCount) || 0)}`,
    "component kit scaffold selects inserted nodes",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const scaffoldCount = ${Number(scaffoldCount) || 0};
      const canvas = document.querySelector("[data-builder-canvas]");
      const selectedCount = Number(canvas?.getAttribute("data-builder-canvas-selected-count") || 0);
      const selectedTypes = Array.from(document.querySelectorAll('[data-builder-node-selected="true"]'))
        .map((node) => node.getAttribute("data-builder-node") || "")
        .filter(Boolean);
      const uniqueTypes = new Set(selectedTypes);
      return {
        passed:
          scaffoldCount >= 8 &&
          selectedCount >= scaffoldCount &&
          uniqueTypes.has("top-app-bar") &&
          uniqueTypes.has("navigation-rail") &&
          uniqueTypes.has("snackbar") &&
          uniqueTypes.size >= 6,
        detail: \`scaffoldCount=\${scaffoldCount}, selected=\${selectedCount}, unique=\${Array.from(uniqueTypes).join("/")}\`
      };
    })()`,
    "component kit scaffold creates a selected multi-control MD3 shell",
  );
  await evaluate(send, `document.querySelector("[data-builder-component-kit-clear]")?.click(); true`);
  await waitFor(send, `document.querySelector("[data-builder-component-kits]")?.getAttribute("data-builder-component-active-kit") === "none"`, "component kit focus cleared");
  verified.componentPaletteRuntime = true;
  verified.componentCoverageRuntime = true;
  verified.componentPaletteKitsRuntime = true;
  verified.componentPaletteKitScaffoldRuntime = true;
}

async function runWindowShellEditorChecks(send, verified) {
  log("checking UI window shell editor runtime");
  await closeTransientOverlays(send);
  await evaluate(
    send,
    `(() => {
      const canvas = document.querySelector("[data-builder-canvas]");
      const rect = canvas?.getBoundingClientRect();
      canvas?.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect ? rect.left + 8 : 8,
        clientY: rect ? rect.top + 8 : 8
      }));
      const propertiesTab = Array.from(document.querySelectorAll('[data-builder-dock-tab="properties"]')).find((tab) => tab.textContent?.includes("属性"));
      propertiesTab?.click();
      return Boolean(canvas);
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-page-window-shell]"))`, "page window shell editor");
  await assertRuntimeCheck(
    send,
    `(() => {
      const shell = document.querySelector("[data-builder-page-window-shell]");
      const canvasShell = document.querySelector("[data-builder-canvas-window-shell]");
      const preview = document.querySelector("[data-builder-canvas-window-shell-preview]");
      const contentPlane = document.querySelector("[data-builder-canvas-content-plane]");
      const pageKind = document.querySelector("[data-builder-page-window-kind]");
      const pageTitlebar = document.querySelector("[data-builder-page-titlebar-style]");
      const presetList = document.querySelector("[data-builder-page-window-shell-preset-list]");
      const presets = Array.from(document.querySelectorAll("[data-builder-page-window-shell-preset]"));
      const canvasKind = document.querySelector("[data-builder-canvas-window-kind]");
      const canvasTitlebar = document.querySelector("[data-builder-canvas-titlebar-style]");
      return {
        passed:
          Boolean(shell) &&
          Boolean(canvasShell) &&
          Boolean(preview) &&
          Boolean(contentPlane) &&
          preview?.getAttribute("data-builder-canvas-window-shell-placement") === "outside-content" &&
          Boolean(pageKind) &&
          Boolean(pageTitlebar) &&
          Boolean(presetList) &&
          presets.length >= 4 &&
          ["main-nova", "dialog-nova", "tool-nova", "frameless-hidden"].every((id) =>
            presets.some((preset) => preset.getAttribute("data-builder-page-window-shell-preset") === id)
          ) &&
          Boolean(canvasKind) &&
          Boolean(canvasTitlebar) &&
          Boolean(preview?.getAttribute("data-builder-canvas-window-kind")) &&
          Boolean(preview?.getAttribute("data-builder-canvas-titlebar-style")),
        detail: \`previewKind=\${preview?.getAttribute("data-builder-canvas-window-kind") || "missing"}, previewTitlebar=\${preview?.getAttribute("data-builder-canvas-titlebar-style") || "missing"}, placement=\${preview?.getAttribute("data-builder-canvas-window-shell-placement") || "missing"}, presets=\${presets.length}\`
      };
    })()`,
    "UI window shell editor and preview markers",
  );

  await clickElementCenter(send, `document.querySelector('[data-builder-page-window-shell-preset="dialog-nova"]')`, "dialog window shell preset");
  await waitFor(
    send,
    `document.querySelector("[data-builder-canvas-window-shell-preview]")?.getAttribute("data-builder-canvas-window-kind") === "dialog" &&
      document.querySelector("[data-builder-canvas-window-shell-preview]")?.getAttribute("data-builder-canvas-titlebar-style") === "nova"`,
    "dialog preset updates canvas window shell preview",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const preset = document.querySelector('[data-builder-page-window-shell-preset="dialog-nova"]');
      const preview = document.querySelector("[data-builder-canvas-window-shell-preview]");
      return {
        passed:
          preset?.getAttribute("data-builder-page-window-shell-preset-active") === "true" &&
          preview?.getAttribute("data-builder-canvas-window-kind") === "dialog" &&
          preview?.getAttribute("data-builder-canvas-titlebar-style") === "nova",
        detail: \`preset=\${preset?.getAttribute("data-builder-page-window-shell-preset-active") || "missing"}, kind=\${preview?.getAttribute("data-builder-canvas-window-kind") || "missing"}, titlebar=\${preview?.getAttribute("data-builder-canvas-titlebar-style") || "missing"}\`
      };
    })()`,
    "UI window shell preset activation",
  );

  await clickElementCenter(send, `document.querySelector("[data-builder-page-window-kind]")`, "page window kind trigger");
  await waitFor(send, `Array.from(document.querySelectorAll('[role="option"]')).some((option) => /工具窗口/.test(option.textContent || ""))`, "window kind options");
  await clickElementCenter(
    send,
    `Array.from(document.querySelectorAll('[role="option"]')).find((item) => /工具窗口/.test(item.textContent || ""))`,
    "tool window kind option",
  );
  await waitFor(send, `document.querySelector("[data-builder-canvas-window-shell-preview]")?.getAttribute("data-builder-canvas-window-kind") === "tool"`, "canvas preview updates to tool window kind");

  await clickElementCenter(send, `document.querySelector("[data-builder-page-titlebar-style]")`, "page titlebar style trigger");
  await waitFor(send, `Array.from(document.querySelectorAll('[role="option"]')).some((option) => /隐藏/.test(option.textContent || ""))`, "titlebar style options");
  await clickElementCenter(
    send,
    `Array.from(document.querySelectorAll('[role="option"]')).find((item) => /隐藏/.test(item.textContent || ""))`,
    "hidden titlebar style option",
  );
  await waitFor(send, `document.querySelector("[data-builder-canvas-window-shell-preview]")?.getAttribute("data-builder-canvas-titlebar-style") === "hidden"`, "canvas preview updates to hidden titlebar style");
  await assertRuntimeCheck(
    send,
    `(() => {
      const preview = document.querySelector("[data-builder-canvas-window-shell-preview]");
      const shell = document.querySelector("[data-builder-page-window-shell]");
      const synced = shell?.getAttribute("data-builder-page-window-shell-synced") || "";
      return {
        passed:
          preview?.getAttribute("data-builder-canvas-window-kind") === "tool" &&
          preview?.getAttribute("data-builder-canvas-titlebar-style") === "hidden" &&
          (synced === "true" || synced === "false"),
        detail: \`kind=\${preview?.getAttribute("data-builder-canvas-window-kind")}, titlebar=\${preview?.getAttribute("data-builder-canvas-titlebar-style")}, synced=\${synced}\`
      };
    })()`,
    "UI window shell edit propagation",
  );
  verified.pageWindowShellRuntime = true;
  await closeTransientOverlays(send);
}

async function runLogicRustChecks(send, verified) {
  log("checking Rust and logic runtime");
  const rustFindInput = `document.querySelector('input[aria-label="查找 Rust 源码"]')`;
  const rustReplaceInput = `document.querySelector('input[aria-label="替换 Rust 源码"]')`;
  await assertRuntimeCheck(
    send,
    `(() => {
      const rustEditor = document.querySelector("[data-builder-rust-editor]");
      const syntaxState = rustEditor?.getAttribute("data-builder-rust-editor-syntax-state") || "";
      const minimap = document.querySelector("[data-builder-rust-minimap]");
      const minimapMarkers = Number(minimap?.getAttribute("data-builder-rust-minimap-markers") || 0);
      const quickFixes = document.querySelector("[data-builder-rust-quick-fixes]");
      const quickFixCount = Number(quickFixes?.getAttribute("data-builder-rust-quick-fix-count") || 0);
      const contextSummary = document.querySelector("[data-builder-logic-context-summary]");
      const contextCount = Number(contextSummary?.getAttribute("data-builder-logic-context-summary-count") || 0);
      const contextCards = Array.from(document.querySelectorAll("[data-builder-logic-context-card]"));
      const contextActions = Array.from(document.querySelectorAll("[data-builder-logic-context-card-action]"));
      const commandCenter = document.querySelector("[data-builder-logic-command-center]");
      const commandCenterStats = Array.from(document.querySelectorAll("[data-builder-logic-command-center-stat]"));
      const commandCenterCallerCount = Number(commandCenter?.getAttribute("data-builder-logic-command-center-caller-count") || 0);
      const commandCenterPrimaryCaller = commandCenter?.getAttribute("data-builder-logic-command-center-primary-caller") || "";
      const commandCenterOpenSlot = document.querySelector("[data-builder-logic-command-center-open-slot]");
      const commandCenterFocusCaller = document.querySelector("[data-builder-logic-command-center-focus-caller]");
      const commandCenterRun = document.querySelector("[data-builder-logic-command-center-run]");
      const commandCenterMap = document.querySelector("[data-builder-logic-command-center-map]");
      const sourceInspector = document.querySelector("[data-builder-rust-command-source-inspector]");
      const sourceInspectorRows = Array.from(document.querySelectorAll("[data-builder-rust-command-source-inspector-row]"));
      const sourceInspectorLocation = sourceInspector?.getAttribute("data-builder-rust-command-source-inspector-location") || "";
      const sourceInspectorCallerCount = Number(sourceInspector?.getAttribute("data-builder-rust-command-source-inspector-callers") || 0);
      const sourceInspectorPayload = document.querySelector("[data-builder-rust-command-source-inspector-payload]")?.textContent || "";
      const sourceInspectorGoSource = document.querySelector("[data-builder-rust-command-source-inspector-go-source]");
      const sourceInspectorCopyInvoke = document.querySelector("[data-builder-rust-command-source-inspector-copy-invoke]");
      const sourceInspectorRun = document.querySelector("[data-builder-rust-command-source-inspector-run]");
      const sourceInspectorMap = document.querySelector("[data-builder-rust-command-source-inspector-map]");
      const commandCenterCanUseCaller =
        commandCenterCallerCount > 0
          ? commandCenterPrimaryCaller !== "none" &&
            Boolean(commandCenterFocusCaller && !commandCenterFocusCaller.disabled) &&
            Boolean(commandCenterRun && !commandCenterRun.disabled) &&
            Boolean(commandCenterMap && !commandCenterMap.disabled)
          : commandCenterPrimaryCaller === "none";
      const sourceInspectorCanUseCaller =
        sourceInspectorCallerCount > 0
          ? Boolean(sourceInspectorRun && !sourceInspectorRun.disabled) && Boolean(sourceInspectorMap && !sourceInspectorMap.disabled)
          : Boolean(sourceInspectorRun?.disabled) && Boolean(sourceInspectorMap?.disabled);
      const codeLens = document.querySelector("[data-builder-rust-codelens]");
      const codeLensRows = Array.from(document.querySelectorAll("[data-builder-rust-codelens-row]"));
      const codeLensRowCount = Number(codeLens?.getAttribute("data-builder-rust-codelens-row-count") || 0);
      const codeLensCallerCount = Number(codeLens?.getAttribute("data-builder-rust-codelens-caller-count") || 0);
      const codeLensCanNavigate =
        Boolean(document.querySelector("[data-builder-rust-codelens-open-command]")) &&
        (
          Boolean(document.querySelector("[data-builder-rust-codelens-open-slot]")) ||
          Boolean(document.querySelector("[data-builder-rust-codelens-bind-candidate]"))
        ) &&
        Boolean(document.querySelector("[data-builder-rust-codelens-focus-caller]"));
      return {
        passed:
          Boolean(contextSummary) &&
          contextCount >= 4 &&
          contextCards.length >= 4 &&
          contextActions.length >= 4 &&
          Boolean(commandCenter) &&
          Boolean(commandCenter?.getAttribute("data-builder-logic-command-center-command")) &&
          commandCenterStats.length >= 4 &&
          Boolean(commandCenterOpenSlot) &&
          commandCenterCanUseCaller &&
          Boolean(document.querySelector("[data-builder-logic-command-center-connections]")) &&
          Boolean(document.querySelector("[data-builder-logic-command-center-copy-invoke]")) &&
          Boolean(document.querySelector("[data-builder-logic-command-center-insert-json]")) &&
          Boolean(sourceInspector) &&
          Boolean(sourceInspector?.getAttribute("data-builder-rust-command-source-inspector-command")) &&
          sourceInspectorRows.length >= 4 &&
          Boolean(sourceInspectorLocation) &&
          sourceInspectorPayload.includes("invoke(") &&
          Boolean(sourceInspectorGoSource) &&
          Boolean(sourceInspectorCopyInvoke) &&
          sourceInspectorCanUseCaller &&
          Boolean(codeLens) &&
          codeLensRowCount >= 1 &&
          codeLensRows.length >= 1 &&
          codeLensCallerCount >= 0 &&
          codeLensCanNavigate &&
          Boolean(document.querySelector("[data-builder-rust-editor-breadcrumbs]")) &&
          Boolean(document.querySelector("[data-builder-rust-editor-references]")) &&
          Boolean(document.querySelector("[data-builder-rust-signature-help]")) &&
          Boolean(document.querySelector("[data-builder-rust-command-slot-card]")) &&
          Boolean(document.querySelector("[data-builder-rust-slot-navigator]")) &&
          syntaxState === "highlighted" &&
          minimapMarkers > 0 &&
          quickFixCount > 0,
        detail: \`syntax=\${syntaxState}, minimapMarkers=\${minimapMarkers}, quickFixes=\${quickFixCount}, context=\${contextCount}/\${contextCards.length}, commandCenterStats=\${commandCenterStats.length}, commandCenterCallers=\${commandCenterCallerCount}, sourceInspector=\${sourceInspectorRows.length}@\${sourceInspectorLocation}, codeLens=\${codeLensRowCount}/\${codeLensRows.length}, callers=\${codeLensCallerCount}\`
      };
    })()`,
    "Rust editor panels, command center, CodeLens callers, logic context summary, highlighting, signature help, minimap, and quick fixes",
  );
  verified.rustEditorRuntime = true;
  verified.logicContextRuntime = true;
  verified.logicCommandCenterRuntime = true;
  verified.rustCodeLensRuntime = true;
  verified.rustSyntaxRuntime = true;
  verified.rustSignatureRuntime = true;
  verified.rustQuickFixRuntime = true;
  verified.rustMinimapRuntime = true;

  const originalRustSourceBeforeFormat = await evaluate(send, `document.querySelector("[data-builder-rust-logic]")?.value || ""`);
  const messyRustFormatSource = `fn nova_smoke_format(){\nlet value=1;\nif value>0{\nprintln!("ok");\n}\n}\n\n\n`;
  const expectedRustFormatSource = `fn nova_smoke_format(){\n    let value=1;\n    if value>0{\n        println!("ok");\n    }\n}\n`;
  await setElementValue(send, `document.querySelector("[data-builder-rust-logic]")`, messyRustFormatSource, "messy Rust format source");
  await waitFor(send, `document.querySelector("[data-builder-rust-logic]")?.value === ${JSON.stringify(messyRustFormatSource)}`, "messy Rust format source applied");
  await clickElementCenter(send, `document.querySelector("[data-builder-rust-editor-format]")`, "Rust editor format action");
  await assertRuntimeCheck(
    send,
    `(() => {
      const editor = document.querySelector("[data-builder-rust-logic]");
      const source = editor?.value || "";
      const feedback = document.querySelector("[data-builder-project-jump-feedback]")?.textContent || "";
      return {
        passed:
          source === ${JSON.stringify(expectedRustFormatSource)} &&
          feedback.includes("Rust 源码已格式化"),
        detail: \`source=\${JSON.stringify(source)}, feedback=\${feedback.trim().replace(/\\s+/g, " ").slice(0, 140)}\`
      };
    })()`,
    "Rust editor format action mutates source",
  );
  await setElementValue(send, `document.querySelector("[data-builder-rust-logic]")`, originalRustSourceBeforeFormat, "restore Rust source after format smoke");
  await waitFor(send, `document.querySelector("[data-builder-rust-logic]")?.value === ${JSON.stringify(originalRustSourceBeforeFormat)}`, "Rust source restored after format smoke");
  verified.rustFormatRuntime = true;

  await assertRuntimeCheck(
    send,
    `(() => {
      const assistant = document.querySelector("[data-builder-logic-slot-assistant]");
      const state = assistant?.getAttribute("data-builder-logic-slot-assistant-state") || "";
      const stepCount = Number(assistant?.getAttribute("data-builder-logic-slot-assistant-step-count") || 0);
      const steps = Array.from(document.querySelectorAll("[data-builder-logic-slot-assistant-step]"));
      const actions = Array.from(document.querySelectorAll("[data-builder-logic-slot-assistant-step-action]"));
      const connection = document.querySelector("[data-builder-logic-slot-assistant-open-connections]");
      const slot = document.querySelector("[data-builder-logic-slot-assistant-open-slot]");
      const run = document.querySelector("[data-builder-logic-slot-assistant-run]");
      return {
        passed:
          Boolean(assistant) &&
          ["ready", "missing-slot", "unbound"].includes(state) &&
          stepCount >= 5 &&
          steps.length >= 5 &&
          actions.length >= 5 &&
          Boolean(connection) &&
          Boolean(slot) &&
          Boolean(run),
        detail: \`state=\${state || "missing"}, stepCount=\${stepCount}, steps=\${steps.length}, actions=\${actions.length}, buttons=\${Boolean(connection)}/\${Boolean(slot)}/\${Boolean(run)}\`
      };
    })()`,
    "logic slot assistant path",
  );
  verified.logicSlotAssistantRuntime = true;

  await assertRuntimeCheck(
    send,
    `(() => {
      const workbench = document.querySelector("[data-builder-rust-debug-workbench]");
      const tabs = document.querySelectorAll("[data-builder-rust-debug-tab]");
      const problems = document.querySelector("[data-builder-rust-debug-problems]");
      const active = workbench?.getAttribute("data-builder-rust-debug-active-panel") || "";
      return {
        passed: Boolean(workbench) && tabs.length === 4 && Boolean(problems) && active === "problems",
        detail: \`tabs=\${tabs.length}, active=\${active}, problems=\${Boolean(problems)}\`
      };
    })()`,
    "Rust debug workbench default Problems panel",
  );
  await clickElementCenter(send, `document.querySelector('[data-builder-rust-debug-tab="breakpoints"]')`, "Rust debug workbench Breakpoints tab");
  await waitFor(send, `Boolean(document.querySelector("[data-builder-rust-debug-breakpoints]"))`, "Rust debug workbench breakpoints panel");
  await assertRuntimeCheck(
    send,
    `(() => {
      const panel = document.querySelector("[data-builder-rust-debug-breakpoints]");
      const count = Number(panel?.getAttribute("data-builder-rust-debug-breakpoint-count") || 0);
      return { passed: count > 0, detail: \`breakpoints=\${count}\` };
    })()`,
    "Rust debug workbench breakpoint rows",
  );
  await clickElementCenter(send, `document.querySelector("[data-builder-rust-debug-breakpoint-toggle]")`, "Rust debug workbench breakpoint toggle");
  await waitFor(send, `Boolean(document.querySelector('[data-builder-rust-debug-breakpoint="disabled"]'))`, "Rust debug workbench disabled breakpoint state");
  await evaluate(
    send,
    `(() => {
      window.__novaSmokeRustDebugDisabledBreakpoints = document.querySelectorAll('[data-builder-rust-debug-breakpoint="disabled"]').length;
      return true;
    })()`,
  );
  await clickElementCenter(send, `document.querySelector('[data-builder-rust-debug-tab="watch"]')`, "Rust debug workbench Watch tab");
  await waitFor(send, `Boolean(document.querySelector("[data-builder-rust-debug-watch]"))`, "Rust debug workbench watch panel");
  await assertRuntimeCheck(
    send,
    `(() => {
      const count = Number(document.querySelector("[data-builder-rust-debug-watch]")?.getAttribute("data-builder-rust-debug-watch-count") || 0);
      window.__novaSmokeRustDebugWatchCount = count;
      return { passed: count > 0, detail: \`watch=\${count}\` };
    })()`,
    "Rust debug workbench watch rows",
  );
  await clickElementCenter(send, `document.querySelector('[data-builder-rust-debug-tab="call-stack"]')`, "Rust debug workbench Call Stack tab");
  await waitFor(send, `Boolean(document.querySelector("[data-builder-rust-debug-call-stack]"))`, "Rust debug workbench call stack panel");
  await assertRuntimeCheck(
    send,
    `(() => {
      const watchCount = Number(window.__novaSmokeRustDebugWatchCount || 0);
      const stackCount = Number(document.querySelector("[data-builder-rust-debug-call-stack]")?.getAttribute("data-builder-rust-debug-call-stack-count") || 0);
      const disabled = Number(window.__novaSmokeRustDebugDisabledBreakpoints || 0);
      return {
        passed: watchCount > 0 && stackCount > 0 && disabled > 0,
        detail: \`watch=\${watchCount}, stack=\${stackCount}, disabledBreakpoints=\${disabled}\`
      };
    })()`,
    "Rust debug workbench watch, call stack, and breakpoint state",
  );
  verified.rustDebugWorkbenchRuntime = true;

  await setElementValue(
    send,
    rustFindInput,
    "fn",
    "Rust find input",
  );
  await waitFor(send, `Number(document.querySelector("[data-builder-rust-editor-find]")?.getAttribute("data-builder-rust-editor-find-count") || 0) > 0`, "Rust find has matches");
  await evaluate(send, `document.querySelector("[data-builder-rust-editor-find-next]")?.click(); true`);
  await assertRuntimeCheck(
    send,
    `(() => {
      const find = document.querySelector("[data-builder-rust-editor-find]");
      const count = Number(find?.getAttribute("data-builder-rust-editor-find-count") || 0);
      const active = document.querySelector("[data-builder-rust-editor-find-active]");
      const status = document.querySelector("[data-builder-rust-editor-find-status]")?.textContent || "";
      return {
        passed: count > 0 && Boolean(active) && /查找：\\d+ 项/.test(status),
        detail: \`matches=\${count}, active=\${Boolean(active)}, status=\${status.trim()}\`
      };
    })()`,
    "Rust find query and next-result navigation",
  );
  verified.rustFindRuntime = true;

  await setElementValue(
    send,
    rustFindInput,
    "fn",
    "Rust replace find input",
  );
  await waitFor(send, `Number(document.querySelector("[data-builder-rust-editor-find]")?.getAttribute("data-builder-rust-editor-find-count") || 0) > 0`, "Rust replace has fn matches");
  await setElementValue(
    send,
    rustReplaceInput,
    "__nova_smoke_fn__",
    "Rust replace input",
  );
  await clickElementCenter(send, `document.querySelector("[data-builder-rust-editor-replace-current]")`, "Rust replace current action");
  await waitFor(
    send,
    `document.querySelector("[data-builder-rust-logic]")?.value.includes("__nova_smoke_fn__")`,
    "Rust replace current mutates source",
  );
  await setElementValue(
    send,
    rustFindInput,
    "__nova_smoke_fn__",
    "Rust restore find input",
  );
  await waitFor(send, `Number(document.querySelector("[data-builder-rust-editor-find]")?.getAttribute("data-builder-rust-editor-find-count") || 0) > 0`, "Rust restore has smoke token match");
  await setElementValue(
    send,
    rustReplaceInput,
    "fn",
    "Rust restore replace input",
  );
  await clickElementCenter(send, `document.querySelector("[data-builder-rust-editor-replace-current]")`, "Rust restore replace current action");
  await waitFor(
    send,
    `!document.querySelector("[data-builder-rust-logic]")?.value.includes("__nova_smoke_fn__") &&
      document.querySelector("[data-builder-rust-logic]")?.value.includes("fn")`,
    "Rust replace current restores source",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const editor = document.querySelector("[data-builder-rust-logic]");
      const status = document.querySelector("[data-builder-rust-editor-replace-status]")?.textContent || "";
      const replaceInput = ${rustReplaceInput};
      return {
        passed:
          Boolean(editor) &&
          !editor.value.includes("__nova_smoke_fn__") &&
          editor.value.includes("fn") &&
          Boolean(replaceInput) &&
          /替换：/.test(status),
        detail: \`sourceLength=\${editor?.value.length || 0}, replace=\${replaceInput?.value || ""}, status=\${status.trim()}\`
      };
    })()`,
    "Rust replace-current action and restore",
  );
  verified.rustReplaceRuntime = true;

  await fillElementWithText(
    send,
    `document.querySelector('[data-builder-rust-editor-goto-line] input[aria-label="跳转 Rust 行列"]')`,
    "1:1",
    "Rust go-to-line input",
  );
  await waitFor(
    send,
    `document.querySelector('[data-builder-rust-editor-goto-line] input[aria-label="跳转 Rust 行列"]')?.value === "1:1"`,
    "Rust go-to-line input value",
  );
  await delay(300);
  await clickElementCenter(send, `document.querySelector("[data-builder-rust-editor-goto-line-action]")`, "Rust go-to-line action");
  await delay(500);
  await assertRuntimeCheck(
    send,
    `(() => {
      const input = document.querySelector('[data-builder-rust-editor-goto-line] input[aria-label="跳转 Rust 行列"]');
      const editor = document.querySelector("[data-builder-rust-logic]");
      const status = document.querySelector("[data-builder-rust-editor-status]")?.textContent?.trim().replace(/\\s+/g, " ") || "";
      return {
        passed:
          (input?.value === "1" || input?.value === "1:1") &&
          editor?.selectionStart === 0 &&
          /Ln\\s+1,\\s*Col\\s+1/.test(status),
        detail: \`input=\${input?.value || "missing"}, selection=\${editor?.selectionStart ?? "missing"}-\${editor?.selectionEnd ?? "missing"}, status=\${status.slice(0, 180)}\`
      };
    })()`,
    "Rust go-to-line selection",
  );
  verified.rustGotoLineRuntime = true;

  await evaluate(
    send,
    `(() => {
      const createMissingSlots =
        document.querySelector("[data-builder-rust-editor-create-missing-slots]") ||
        document.querySelector("[data-builder-rust-create-missing-slots]");
      createMissingSlots?.click();
      return true;
    })()`,
  );
  await waitFor(
    send,
    `Array.from(document.querySelectorAll("[data-builder-rust-outline-entry]")).some((entry) => {
      const lineText = entry.querySelector("span")?.textContent || "";
      return !/--/.test(lineText);
    })`,
    "Rust outline has a source-backed entry",
  );
  await clickElementCenter(
    send,
    `Array.from(document.querySelectorAll("[data-builder-rust-outline-entry]")).find((entry) => {
      const lineText = entry.querySelector("span")?.textContent || "";
      return !/--/.test(lineText);
    })`,
    "Rust outline entry",
  );
  await waitFor(send, `!document.querySelector("[data-builder-rust-editor-select-symbol-range]")?.disabled`, "Rust select-symbol action enabled");
  await evaluate(send, `document.querySelector("[data-builder-rust-editor-select-symbol-range]")?.click(); true`);
  await waitFor(send, `/选中\\s+[1-9]\\d*\\s+字符/.test(document.querySelector("[data-builder-rust-editor-status]")?.textContent || "")`, "Rust selected symbol range");
  verified.rustSymbolSelectionRuntime = true;

  await assertRuntimeCheck(
    send,
    `(() => {
      const editor = document.querySelector("[data-builder-rust-logic]");
      if (!editor) {
        return { passed: false, detail: "missing Rust editor" };
      }
      const reserved = new Set([
        "as", "async", "await", "break", "const", "continue", "crate", "dyn", "else", "enum", "extern",
        "false", "fn", "for", "if", "impl", "in", "let", "loop", "match", "mod", "move", "mut", "pub",
        "ref", "return", "self", "Self", "static", "struct", "super", "trait", "true", "type", "unsafe",
        "use", "where", "while"
      ]);
      const target = Array.from(editor.value.matchAll(/\\b[A-Za-z_][A-Za-z0-9_]*\\b/g)).find((match) => {
        const name = match[0];
        return name.length > 2 && name !== "__nova_smoke_symbol" && !reserved.has(name);
      });
      if (!target || typeof target.index !== "number") {
        return { passed: false, detail: "no renameable identifier found" };
      }
      window.__novaSmokeRustRenameBefore = editor.value;
      window.__novaSmokeRustRenameTarget = target[0];
      window.__novaSmokeRustRenameSelection = { start: target.index, end: target.index + target[0].length };
      editor.focus();
      editor.setSelectionRange(target.index, target.index + target[0].length);
      editor.dispatchEvent(new Event("select", { bubbles: true }));
      editor.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowRight", code: "ArrowRight", bubbles: true }));
      return {
        passed: true,
        detail: \`target=\${target[0]}, range=\${target.index}-\${target.index + target[0].length}\`
      };
    })()`,
    "Rust rename target selection",
  );
  await waitFor(
    send,
    `(() => {
      const action = document.querySelector("[data-builder-rust-editor-rename-symbol-action]");
      const identifier = document.querySelector("[data-builder-rust-editor-current-identifier]");
      return Boolean(window.__novaSmokeRustRenameTarget) && Boolean(action) && !action.disabled && (identifier?.textContent || "").includes(window.__novaSmokeRustRenameTarget);
    })()`,
    "Rust rename action enabled for selected identifier",
  );
  await setElementValue(
    send,
    `document.querySelector("[data-builder-rust-editor-rename-symbol] input")`,
    "__nova_smoke_symbol",
    "Rust rename input",
  );
  await clickElementCenter(send, `document.querySelector("[data-builder-rust-editor-rename-symbol-action]")`, "Rust rename-symbol action");
  await waitFor(
    send,
    `document.querySelector("[data-builder-rust-logic]")?.value.includes("__nova_smoke_symbol")`,
    "Rust rename mutates source",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const editor = document.querySelector("[data-builder-rust-logic]");
      const identifier = document.querySelector("[data-builder-rust-editor-current-identifier]")?.textContent || "";
      const feedback = document.querySelector("[data-builder-project-jump-feedback]")?.textContent || "";
      const before = window.__novaSmokeRustRenameBefore || "";
      const after = editor?.value || "";
      return {
        passed:
          Boolean(editor) &&
          after !== before &&
          after.includes("__nova_smoke_symbol") &&
          identifier.includes("__nova_smoke_symbol") &&
          feedback.includes("Rust 符号已重命名"),
        detail: \`changed=\${after !== before}, identifier=\${identifier.trim()}, feedback=\${feedback.trim().replace(/\\s+/g, " ").slice(0, 160)}\`
      };
    })()`,
    "Rust rename-symbol source mutation and feedback",
  );
  await evaluate(
    send,
    `(() => {
      const editor = document.querySelector("[data-builder-rust-logic]");
      const before = window.__novaSmokeRustRenameBefore;
      if (!editor || typeof before !== "string") return false;
      const selection = window.__novaSmokeRustRenameSelection || { start: 0, end: 0 };
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
      setter?.call(editor, before);
      editor.dispatchEvent(new Event("input", { bubbles: true }));
      editor.dispatchEvent(new Event("change", { bubbles: true }));
      editor.focus();
      editor.setSelectionRange(selection.start || 0, selection.end || selection.start || 0);
      editor.dispatchEvent(new Event("select", { bubbles: true }));
      return true;
    })()`,
  );
  await waitFor(
    send,
    `document.querySelector("[data-builder-rust-logic]")?.value === window.__novaSmokeRustRenameBefore`,
    "Rust rename smoke source restore",
  );
  await setElementValue(
    send,
    `document.querySelector("[data-builder-rust-editor-rename-symbol] input")`,
    "",
    "Rust rename input reset",
  );
  verified.rustRenameRuntime = true;

  await evaluate(
    send,
    `(() => {
      const editor = document.querySelector("[data-builder-rust-editor]");
      window.__novaSmokeRustWordWrapState = editor?.getAttribute("data-builder-rust-editor-word-wrap-state") || "";
      document.querySelector("[data-builder-rust-editor-word-wrap]")?.click();
      return Boolean(editor);
    })()`,
  );
  await waitFor(
    send,
    `(() => {
      const state = document.querySelector("[data-builder-rust-editor]")?.getAttribute("data-builder-rust-editor-word-wrap-state") || "";
      return Boolean(window.__novaSmokeRustWordWrapState) && state && state !== window.__novaSmokeRustWordWrapState;
    })()`,
    "Rust word wrap toggled",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const editor = document.querySelector("[data-builder-rust-editor]");
      const status = document.querySelector("[data-builder-rust-editor-word-wrap-status]")?.textContent || "";
      const state = editor?.getAttribute("data-builder-rust-editor-word-wrap-state") || "";
      const textarea = document.querySelector("[data-builder-rust-logic]");
      return {
        passed: (state === "on" || state === "off") && /折行：/.test(status) && Boolean(textarea) && textarea.value.length > 0,
        detail: \`state=\${state}, status=\${status.trim()}, sourceLength=\${textarea?.value.length || 0}\`
      };
    })()`,
    "Rust word-wrap control and editor source stay live",
  );
  await evaluate(
    send,
    `(() => {
      const editor = document.querySelector("[data-builder-rust-editor]");
      const state = editor?.getAttribute("data-builder-rust-editor-word-wrap-state") || "";
      if (window.__novaSmokeRustWordWrapState && state !== window.__novaSmokeRustWordWrapState) {
        document.querySelector("[data-builder-rust-editor-word-wrap]")?.click();
      }
      return true;
    })()`,
  );
  verified.rustWordWrapRuntime = true;

  await evaluate(
    send,
    `(() => {
      const editor = document.querySelector("[data-builder-rust-logic]");
      if (!editor) return false;
      editor.focus();
      const index = Math.max(0, editor.value.indexOf("async"));
      editor.setSelectionRange(index, index);
      editor.dispatchEvent(new KeyboardEvent("keydown", {
        key: " ",
        code: "Space",
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      }));
      return true;
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-rust-completions]"))`, "Rust completion popup after Ctrl+Space");
  await assertRuntimeCheck(
    send,
    `(() => {
      const completions = document.querySelectorAll("[data-builder-rust-completion]");
      const detail = document.querySelector("[data-builder-rust-completion-detail]");
      const popup = document.querySelector("[data-builder-rust-completions]");
      const active = document.querySelector('[data-builder-rust-completion-active="true"]');
      const accept = document.querySelector("[data-builder-rust-completion-accept]");
      const count = Number(popup?.getAttribute("data-builder-rust-completion-count") || 0);
      const activeIndex = Number(popup?.getAttribute("data-builder-rust-completion-active-index") || -1);
      return {
        passed: completions.length > 0 && count === completions.length && activeIndex >= 0 && Boolean(active) && Boolean(detail) && Boolean(accept),
        detail: \`completions=\${completions.length}, count=\${count}, activeIndex=\${activeIndex}, active=\${Boolean(active)}, detail=\${Boolean(detail)}, accept=\${Boolean(accept)}\`
      };
    })()`,
    "Rust completion items, active keyboard target, detail preview, and accept action",
  );
  verified.rustCompletionRuntime = true;

  await evaluate(
    send,
    `(() => {
      const editor = document.querySelector("[data-builder-rust-logic]");
      if (!editor) return false;
      window.__novaSmokeRustCompletionBefore = editor.value;
      window.__novaSmokeRustCompletionSelection = {
        start: editor.selectionStart || 0,
        end: editor.selectionEnd || editor.selectionStart || 0
      };
      editor.dispatchEvent(new KeyboardEvent("keydown", {
        key: "ArrowDown",
        code: "ArrowDown",
        bubbles: true,
        cancelable: true
      }));
      return true;
    })()`,
  );
  await waitFor(
    send,
    `document.querySelector("[data-builder-rust-completions]")?.getAttribute("data-builder-rust-completion-active-index") === "1"`,
    "Rust completion keyboard selection moves",
  );
  await evaluate(
    send,
    `(() => {
      const editor = document.querySelector("[data-builder-rust-logic]");
      if (!editor) return false;
      editor.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        bubbles: true,
        cancelable: true
      }));
      return true;
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-rust-completion-commit]"))`, "Rust completion commit status");
  await assertRuntimeCheck(
    send,
    `(() => {
      const editor = document.querySelector("[data-builder-rust-logic]");
      const commit = document.querySelector("[data-builder-rust-completion-commit]");
      const before = window.__novaSmokeRustCompletionBefore || "";
      const after = editor?.value || "";
      const label = commit?.textContent?.trim().replace(/\\s+/g, " ") || "";
      return {
        passed: Boolean(editor) && Boolean(commit) && after !== before && label.includes("已插入"),
        detail: \`changed=\${after !== before}, before=\${before.length}, after=\${after.length}, label=\${label || "missing"}\`
      };
    })()`,
    "Rust completion insertion mutates the editor and reports committed candidate",
  );
  verified.rustCompletionCommitRuntime = true;

  await evaluate(
    send,
    `(() => {
      const editor = document.querySelector("[data-builder-rust-logic]");
      const before = window.__novaSmokeRustCompletionBefore;
      if (!editor || typeof before !== "string") return false;
      const selection = window.__novaSmokeRustCompletionSelection || { start: 0, end: 0 };
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
      setter?.call(editor, before);
      editor.dispatchEvent(new Event("input", { bubbles: true }));
      editor.dispatchEvent(new Event("change", { bubbles: true }));
      editor.focus();
      editor.setSelectionRange(selection.start || 0, selection.end || selection.start || 0);
      editor.dispatchEvent(new Event("select", { bubbles: true }));
      return true;
    })()`,
  );
  await waitFor(send, `document.querySelector("[data-builder-rust-logic]")?.value === window.__novaSmokeRustCompletionBefore`, "Rust completion smoke source restore");
  await closeTransientOverlays(send);

  await assertRuntimeCheck(
    send,
    `(() => {
      const matrix = document.querySelector("[data-builder-logic-connection-matrix]");
      const matrixCount = Number(matrix?.getAttribute("data-builder-logic-connection-matrix-count") || 0);
      const flow = document.querySelector("[data-builder-logic-flow-board]");
      const flowNodes = document.querySelectorAll("[data-builder-logic-flow-node]");
      const impact = document.querySelector("[data-builder-logic-command-impact-panel]");
      const bindings = document.querySelector("[data-builder-rust-command-bindings]");
      return {
        passed: matrixCount > 0 && Boolean(flow) && flowNodes.length >= 3 && Boolean(impact) && Boolean(bindings),
        detail: \`matrix=\${matrixCount}, flowNodes=\${flowNodes.length}, impact=\${Boolean(impact)}, bindings=\${Boolean(bindings)}\`
      };
    })()`,
    "logic connection matrix, flow board, command impact, and bindings",
  );
  verified.logicConnectionRuntime = true;
  verified.logicFlowRuntime = true;

  await evaluate(
    send,
    `(() => {
      const goSlot =
        document.querySelector("[data-builder-logic-connection-matrix-go-slot]") ||
        document.querySelector("[data-builder-logic-flow-go-slot]") ||
        document.querySelector("[data-builder-logic-command-impact-open-slot]") ||
        document.querySelector("[data-builder-rust-command-binding-open-slot]");
      goSlot?.click();
      return Boolean(goSlot);
    })()`,
  );
  await waitFor(
    send,
    `Boolean(document.querySelector("[data-builder-rust-slot-navigator]")) && Boolean(document.querySelector("[data-builder-rust-command-slot-card]"))`,
    "slot navigator after go-to-slot action",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const slotCard = document.querySelector("[data-builder-rust-command-slot-card]");
      const slotState = slotCard?.getAttribute("data-builder-rust-command-slot-state") || "";
      const source = document.querySelector("[data-builder-rust-slot-navigator-source]")?.textContent?.trim() || "";
      const command = document.querySelector("[data-builder-rust-slot-navigator-command]")?.textContent?.trim() || "";
      return {
        passed: Boolean(slotCard) && Boolean(source) && Boolean(command) && slotState !== "",
        detail: \`slotState=\${slotState}, source=\${source}, command=\${command}\`
      };
    })()`,
    "go-to-slot navigator path",
  );
  verified.goToSlotRuntime = true;
}

async function runOutputDockLayoutChecks(send, verified) {
  log("checking output dock layout");
  await evaluate(
    send,
    `(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", {
        key: "j",
        code: "KeyJ",
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      }));
      return true;
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-output-dock]"))`, "output dock after Ctrl+J");
  await waitFor(send, `document.querySelector("[data-builder-output-dock]")?.getAttribute("data-builder-output-dock-layout") !== "minimized"`, "expanded output dock");
  await evaluate(
    send,
    `(() => {
      const dock = document.querySelector("[data-builder-output-dock]");
      if (dock?.getAttribute("data-builder-output-dock-layout") !== "expanded") {
        document.querySelector("[data-builder-toggle-output-dock]")?.click();
      }
      return true;
    })()`,
  );
  await waitFor(send, `document.querySelector("[data-builder-output-dock]")?.getAttribute("data-builder-output-dock-layout") === "expanded"`, "fully expanded output dock");
  await evaluate(send, `document.querySelector('[data-builder-dock-tab="output"]')?.click(); true`);
  await waitFor(
    send,
    `document.querySelector('[data-builder-dock-tab="output"]')?.getAttribute("data-builder-dock-tab-active") === "true"`,
    "output dock output tab active",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const dock = document.querySelector("[data-builder-output-dock]");
      const body = document.querySelector("[data-builder-output-dock-body]");
      const content = document.querySelector("[data-builder-output-dock-content]");
      const summary = document.querySelector("[data-builder-output-dock-summary]");
      const workspace = document.querySelector("[data-builder-workspace-no-output-reserved-band]");
      if (!dock || !body || !content) {
        return { passed: false, detail: "output dock body or content missing" };
      }
      const style = getComputedStyle(dock);
      const bodyStyle = getComputedStyle(body);
      const workspaceStyle = workspace ? getComputedStyle(workspace) : null;
      const rect = dock.getBoundingClientRect();
      const statusBarRect = document.querySelector("footer")?.getBoundingClientRect() ?? null;
      const contentStyle = getComputedStyle(content);
      const bodyRadius = Number.parseFloat(bodyStyle.borderTopLeftRadius || "0");
      const contentRadius = Number.parseFloat(contentStyle.borderTopLeftRadius || "0");
      const workspacePaddingBottom = Number.parseFloat(workspaceStyle?.paddingBottom || "999");
      const bottomGap = Math.round(window.innerHeight - rect.bottom);
      const statusBarClearance = statusBarRect ? Math.round(statusBarRect.top - rect.bottom) : bottomGap;
      const shellTransparent = style.backgroundColor === "rgba(0, 0, 0, 0)" || style.backgroundColor === "transparent";
      const bodyTransparent = bodyStyle.backgroundColor === "rgba(0, 0, 0, 0)" || bodyStyle.backgroundColor === "transparent";
      return {
        passed:
          dock.getAttribute("data-builder-output-dock-shell") === "floating-rounded" &&
          dock.hasAttribute("data-builder-output-dock-no-reserved-band") &&
          dock.getAttribute("data-builder-output-dock-safe-area") === "bottom" &&
          dock.hasAttribute("data-builder-output-dock-statusbar-offset") &&
          dock.hasAttribute("data-builder-output-dock-transparent-shell") &&
          dock.hasAttribute("data-builder-output-dock-no-background-shield") &&
          body.getAttribute("data-builder-output-dock-panel") === "surface" &&
          dock.getAttribute("data-builder-output-dock-content-clip") === "scroll-panels" &&
          Boolean(workspace) &&
          workspace.hasAttribute("data-builder-workspace-no-output-background-shield") &&
          workspacePaddingBottom <= 24 &&
          statusBarClearance >= 0 &&
          shellTransparent &&
          !bodyTransparent &&
          style.position === "fixed" &&
          style.contain.includes("layout") &&
          bodyRadius >= 20 &&
          contentRadius >= 18 &&
          rect.bottom <= window.innerHeight + 1 &&
          rect.left >= 0 &&
          rect.right <= window.innerWidth + 1 &&
          Boolean(summary || dock.getAttribute("data-builder-output-dock-layout") === "minimized"),
        detail: \`position=\${style.position}, contain=\${style.contain}, shellBg=\${style.backgroundColor}, bodyBg=\${bodyStyle.backgroundColor}, workspacePb=\${workspacePaddingBottom}, noShield=\${workspace?.hasAttribute("data-builder-workspace-no-output-background-shield")}, bottomGap=\${bottomGap}, statusClearance=\${statusBarClearance}, bodyRadius=\${bodyRadius}, contentRadius=\${contentRadius}, rect=\${Math.round(rect.left)},\${Math.round(rect.top)},\${Math.round(rect.right)},\${Math.round(rect.bottom)}\`
      };
    })()`,
    "rounded floating output dock without workspace background shield",
  );
  verified.outputDockLayout = true;
  await assertRuntimeCheck(
    send,
    `(() => {
      const dock = document.querySelector("[data-builder-output-dock]");
      const body = document.querySelector("[data-builder-output-dock-body]");
      const header = document.querySelector("[data-builder-output-dock-header]");
      const content = document.querySelector("[data-builder-output-dock-content]");
      const summary = document.querySelector("[data-builder-output-dock-summary]");
      const resize = document.querySelector("[data-builder-output-dock-resize-handle]");
      const workspace = document.querySelector("[data-builder-workspace-no-output-reserved-band]");
      if (!dock || !body || !header || !content || !summary || !resize) {
        return { passed: false, detail: "expanded output dock internal regions missing" };
      }

      const viewportRect = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
      const contains = (outer, inner, inset = 0) =>
        inner.left >= outer.left - inset &&
        inner.top >= outer.top - inset &&
        inner.right <= outer.right + inset &&
        inner.bottom <= outer.bottom + inset;
      const intersects = (outer, inner) =>
        inner.right > outer.left &&
        inner.left < outer.right &&
        inner.bottom > outer.top &&
        inner.top < outer.bottom;
      const rectFor = (node) => node.getBoundingClientRect();

      const dockRect = rectFor(dock);
      const bodyRect = rectFor(body);
      const headerRect = rectFor(header);
      const contentRect = rectFor(content);
      const summaryRect = rectFor(summary);
      const resizeRect = rectFor(resize);
      const contentStyle = getComputedStyle(content);
      const summaryStyle = getComputedStyle(summary);
      const workspaceStyle = workspace ? getComputedStyle(workspace) : null;
      const workspacePaddingBottom = Number.parseFloat(workspaceStyle?.paddingBottom || "999");
      const bottomGap = Math.round(window.innerHeight - dockRect.bottom);
      const statusBarRect = document.querySelector("footer")?.getBoundingClientRect() ?? null;
      const statusBarClearance = statusBarRect ? Math.round(statusBarRect.top - dockRect.bottom) : bottomGap;
      const tabs = Array.from(dock.querySelectorAll('[data-builder-dock-tab-layout="inline"]'));
      const activeTabs = tabs.filter((tab) => tab.getAttribute("data-builder-dock-tab-active") === "true");
      const visibleControls = Array.from(dock.querySelectorAll('button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .map((node) => ({ node, rect: rectFor(node) }))
        .filter(({ rect }) => rect.width > 0 && rect.height > 0 && intersects(dockRect, rect));
      const clippedControls = visibleControls
        .filter(({ rect }) => !contains(dockRect, rect, 2) || !contains(viewportRect, rect, 2))
        .map(({ node, rect }) => {
          const marker =
            node.getAttribute("data-builder-dock-tab") ||
            node.getAttribute("data-builder-output-dock-resize-handle") ||
            node.getAttribute("data-builder-toggle-output-dock") ||
            node.getAttribute("data-builder-minimize-output-dock") ||
            node.getAttribute("aria-label") ||
            node.textContent?.trim() ||
            node.tagName.toLowerCase();
          return \`\${marker}@\${Math.round(rect.left)},\${Math.round(rect.top)},\${Math.round(rect.right)},\${Math.round(rect.bottom)}\`;
        });
      const contentScrollable = ["auto", "scroll"].includes(contentStyle.overflowY);
      const summaryScrollable = ["auto", "scroll"].includes(summaryStyle.overflowY);
      const contentPanelOk =
        contentRect.width >= 240 &&
        contentRect.height >= 120 &&
        content.clientHeight >= 100 &&
        content.scrollHeight >= content.clientHeight &&
        contentScrollable;
      const summaryPanelOk =
        summaryRect.width >= 180 &&
        summaryRect.height >= 80 &&
        summaryScrollable;
      const internalRectsContained =
        contains(dockRect, bodyRect, 1) &&
        contains(dockRect, headerRect, 1) &&
        contains(dockRect, contentRect, 1) &&
        contains(dockRect, summaryRect, 1) &&
        contains(dockRect, resizeRect, 1);

      return {
        passed:
          dock.getAttribute("data-builder-output-dock-layout") === "expanded" &&
          dock.hasAttribute("data-builder-output-dock-no-reserved-band") &&
          dock.hasAttribute("data-builder-output-dock-no-background-shield") &&
          dock.getAttribute("data-builder-output-dock-content-clip") === "scroll-panels" &&
          Boolean(workspace) &&
          workspace.hasAttribute("data-builder-workspace-no-output-background-shield") &&
          workspacePaddingBottom <= 24 &&
          bottomGap >= 32 &&
          bottomGap <= 64 &&
          statusBarClearance >= 0 &&
          tabs.length >= 2 &&
          activeTabs.length === 1 &&
          contentPanelOk &&
          summaryPanelOk &&
          internalRectsContained &&
          clippedControls.length === 0,
        detail: \`layout=\${dock.getAttribute("data-builder-output-dock-layout")}, tabs=\${tabs.length}/\${activeTabs.length}, bottomGap=\${bottomGap}, statusClearance=\${statusBarClearance}, workspacePb=\${workspacePaddingBottom}, noShield=\${workspace?.hasAttribute("data-builder-workspace-no-output-background-shield")}, content=\${Math.round(contentRect.width)}x\${Math.round(contentRect.height)}, summary=\${Math.round(summaryRect.width)}x\${Math.round(summaryRect.height)}, clipped=\${clippedControls.join("|") || "none"}\`
      };
    })()`,
    "expanded output dock content and controls stay inside viewport",
  );
  verified.outputDockContentRuntime = true;
  verified.outputDockNoClipRuntime = true;

  await evaluate(send, `document.querySelector('[data-builder-dock-tab="logs"]')?.click(); true`);
  await waitFor(
    send,
    `document.querySelector('[data-builder-dock-tab="logs"]')?.getAttribute("data-builder-dock-tab-active") === "true"`,
    "output dock logs tab active",
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-output-log-search-input]"))`, "output log search input");
  await setElementValue(
    send,
    `document.querySelector("[data-builder-output-log-search-input]")`,
    "运行",
    "output dock log search",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const panel = document.querySelector("[data-builder-output-log-readable-panel]");
      const input = document.querySelector("[data-builder-output-log-search-input]");
      const count = document.querySelector("[data-builder-output-log-search-count]");
      const reader = document.querySelector("[data-builder-output-log-line-reader]");
      const lines = Array.from(document.querySelectorAll("[data-builder-output-log-line]"));
      const matched = lines.filter((line) => line.getAttribute("data-builder-output-log-line-match") === "true");
      return {
        passed:
          Boolean(panel) &&
          input?.value === "运行" &&
          Boolean(count) &&
          Boolean(reader) &&
          lines.length > 0 &&
          matched.length > 0,
        detail: \`value=\${input?.value || ""}, lines=\${lines.length}, matched=\${matched.length}, count=\${count?.textContent?.trim() || "missing"}\`
      };
    })()`,
    "output dock log search and line reader",
  );
  await evaluate(send, `document.querySelector("[data-builder-output-log-search-clear]")?.click(); true`);
  await waitFor(send, `document.querySelector("[data-builder-output-log-search-input]")?.value === ""`, "output log search cleared");
  verified.outputDockLogSearchRuntime = true;

  await evaluate(send, `document.querySelector("[data-builder-minimize-output-dock]")?.click(); true`);
  await waitFor(
    send,
    `document.querySelector("[data-builder-output-dock]")?.getAttribute("data-builder-output-dock-layout") === "minimized"`,
    "minimized output dock",
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const dock = document.querySelector("[data-builder-output-dock]");
      const pill = document.querySelector("[data-builder-output-dock-minimized-shell]");
      if (!dock || !pill) {
        return { passed: false, detail: "minimized dock or pill missing" };
      }
      const dockStyle = getComputedStyle(dock);
      const pillStyle = getComputedStyle(pill);
      const dockRect = dock.getBoundingClientRect();
      const pillRect = pill.getBoundingClientRect();
      const transparentDockBg = dockStyle.backgroundColor === "rgba(0, 0, 0, 0)" || dockStyle.backgroundColor === "transparent";
      const visiblePillBg = pillStyle.backgroundColor !== "rgba(0, 0, 0, 0)" && pillStyle.backgroundColor !== "transparent";
      const centered = Math.abs((dockRect.left + dockRect.right) / 2 - (pillRect.left + pillRect.right) / 2) <= 2;
      return {
        passed:
          dock.getAttribute("data-builder-output-dock-minimized-chrome") === "floating-pill" &&
          dockStyle.pointerEvents === "none" &&
          transparentDockBg &&
          dockStyle.boxShadow === "none" &&
          pillStyle.pointerEvents === "auto" &&
          visiblePillBg &&
          pillRect.width < dockRect.width - 32 &&
          pillRect.height <= dockRect.height + 2 &&
          pillRect.left > dockRect.left &&
          pillRect.right < dockRect.right &&
          centered,
        detail: \`dockPointer=\${dockStyle.pointerEvents}, dockBg=\${dockStyle.backgroundColor}, dockShadow=\${dockStyle.boxShadow}, pillPointer=\${pillStyle.pointerEvents}, pillBg=\${pillStyle.backgroundColor}, dock=\${Math.round(dockRect.width)}x\${Math.round(dockRect.height)}, pill=\${Math.round(pillRect.width)}x\${Math.round(pillRect.height)}, centered=\${centered}\`
      };
    })()`,
    "minimized output dock renders as a transparent shell with centered floating pill",
  );
  await evaluate(send, `document.querySelector("[data-builder-restore-output-dock]")?.click(); true`);
  await waitFor(
    send,
    `document.querySelector("[data-builder-output-dock]")?.getAttribute("data-builder-output-dock-layout") !== "minimized"`,
    "restored output dock",
  );
}

async function runShellCommandPlacementChecks(send, verified) {
  log("checking builder shell command placement");
  await assertRuntimeCheck(
    send,
    `(() => {
      const shell = document.querySelector('[data-editor-shell="builder"]');
      const leftRun = document.querySelector('[data-builder-left-run-controls-layout="qt-creator-kit"]');
      const compactTopbar = document.querySelector('[data-builder-compact-topbar][data-builder-compact-topbar-policy="status-locator-only"]');
      const titlebarBuildMenu = document.querySelector('[data-titlebar-build-menu-secondary][data-titlebar-command-overflow="build-run-secondary"]');
      const showcaseTopbar = document.querySelector('[data-showcase-topbar], [data-topbar-scope="component-library"]');
      const runOwner = document.querySelector('[data-builder-run-command-owner="primary-left-rail"]');
      const ownership = document.querySelector('[data-builder-command-ownership*="left-rail-primary"]');
      const utilityStrip = document.querySelector('[data-builder-left-rail-utility-strip="qt-creator-minimal"]');
      const leftRect = leftRun?.getBoundingClientRect();
      const titlebarRect = titlebarBuildMenu?.getBoundingClientRect();
      return {
        passed:
          Boolean(shell) &&
          shell.getAttribute("data-editor-toolbar-policy") === "titlebar-left-rail" &&
          shell.hasAttribute("data-editor-omits-showcase-topbar") &&
          Boolean(leftRun && utilityStrip && leftRect && leftRect.width >= 48 && leftRect.width <= 96 && leftRect.height > 120) &&
          Boolean(compactTopbar) &&
          Boolean(titlebarBuildMenu && titlebarRect && titlebarRect.width > 0 && titlebarRect.height > 0) &&
          Boolean(runOwner) &&
          Boolean(ownership) &&
          !showcaseTopbar,
        detail: \`policy=\${shell?.getAttribute("data-editor-toolbar-policy") || "missing"}, left=\${leftRect ? Math.round(leftRect.width) + "x" + Math.round(leftRect.height) : "missing"}, utility=\${Boolean(utilityStrip)}, titlebar=\${titlebarRect ? Math.round(titlebarRect.width) + "x" + Math.round(titlebarRect.height) : "missing"}, showcaseTopbar=\${Boolean(showcaseTopbar)}\`
      };
    })()`,
    "builder command placement",
  );
  verified.builderToolbarPolicy = true;
  verified.builderTopbarOmitted = true;
  verified.titlebarOverflowRuntime = true;

  await evaluate(send, `document.querySelector('[data-builder-mode-button="design"]')?.click(); true`);
  await waitFor(send, `Boolean(document.querySelector("[data-builder-readable-workbench]"))`, "readable design workbench");
  await assertRuntimeCheck(
    send,
    `(() => {
      const workspace = document.querySelector("[data-builder-readable-workbench]");
      const canvas = document.querySelector("[data-builder-readable-canvas]");
      const controls = document.querySelector("[data-builder-workbench-layout-controls]");
      const leftToggle = document.querySelector("[data-builder-toggle-left-dock]");
      const rightToggle = document.querySelector("[data-builder-toggle-right-dock]");
      const outputToggle = document.querySelector("[data-builder-toggle-output-dock-compact]");
      return {
        passed:
          workspace?.getAttribute("data-builder-workspace-layout") === "wide-left-dock" &&
          canvas?.getAttribute("data-builder-canvas-priority") === "true" &&
          Boolean(controls && leftToggle && rightToggle && outputToggle),
        detail: \`layout=\${workspace?.getAttribute("data-builder-workspace-layout") || "missing"}, controls=\${Boolean(controls)}, left=\${Boolean(leftToggle)}, right=\${Boolean(rightToggle)}, output=\${Boolean(outputToggle)}\`
      };
    })()`,
    "Qt Creator readable workbench layout controls",
  );
  await evaluate(
    send,
    `(() => {
      document.querySelector("[data-builder-right-dock-collapse]")?.click();
      return true;
    })()`,
  );
  await waitFor(send, `document.querySelector("[data-builder-readable-workbench]")?.getAttribute("data-builder-right-dock-collapsed") === "true"`, "right inspector dock collapsed");
  await assertRuntimeCheck(
    send,
    `(() => {
      const workspace = document.querySelector("[data-builder-readable-workbench]");
      const canvas = document.querySelector("[data-builder-readable-canvas]");
      const rightDock = document.querySelector('[data-builder-readable-dock="right"]');
      const workspaceRect = workspace?.getBoundingClientRect();
      const canvasRect = canvas?.getBoundingClientRect();
      const rightRect = rightDock?.getBoundingClientRect();
      const canvasRatio = workspaceRect && canvasRect ? canvasRect.width / workspaceRect.width : 0;
      return {
        passed:
          workspace?.getAttribute("data-builder-right-dock-collapsed") === "true" &&
          rightDock?.getAttribute("data-builder-side-dock-collapsed") === "true" &&
          Boolean(rightRect && rightRect.width <= 72) &&
          canvasRatio >= 0.68,
        detail: \`canvasRatio=\${canvasRatio.toFixed(2)}, rightWidth=\${rightRect ? Math.round(rightRect.width) : "missing"}\`
      };
    })()`,
    "collapsed inspector gives canvas priority",
  );
  await clickElementCenter(send, `document.querySelector("[data-builder-right-dock-expand]")`, "expand right inspector dock");
  await waitFor(send, `document.querySelector("[data-builder-readable-workbench]")?.getAttribute("data-builder-right-dock-collapsed") === "false"`, "right inspector dock expanded");
  await assertRuntimeCheck(
    send,
    `(() => {
      const workspace = document.querySelector("[data-builder-readable-workbench]");
      const rightDock = document.querySelector('[data-builder-readable-dock="right"]');
      const rightRect = rightDock?.getBoundingClientRect();
      return {
        passed:
          workspace?.getAttribute("data-builder-right-dock-collapsed") === "false" &&
          rightDock?.getAttribute("data-builder-side-dock-collapsed") === "false" &&
          Boolean(rightRect && rightRect.width >= 260),
        detail: \`rightWidth=\${rightRect ? Math.round(rightRect.width) : "missing"}\`
      };
    })()`,
    "expanded inspector remains available",
  );
  await clickElementCenter(send, `document.querySelector("[data-builder-left-dock-collapse]")`, "collapse left project dock");
  await waitFor(send, `document.querySelector("[data-builder-readable-workbench]")?.getAttribute("data-builder-left-dock-collapsed") === "true"`, "left project dock collapsed");
  await assertRuntimeCheck(
    send,
    `(() => {
      const leftDock = document.querySelector('[data-builder-readable-dock="left"]');
      const leftRect = leftDock?.getBoundingClientRect();
      return {
        passed:
          leftDock?.getAttribute("data-builder-side-dock-collapsed") === "true" &&
          Boolean(leftRect && leftRect.width <= 72) &&
          Boolean(document.querySelector("[data-builder-left-dock-expand]")),
        detail: \`leftWidth=\${leftRect ? Math.round(leftRect.width) : "missing"}\`
      };
    })()`,
    "collapsed project dock becomes a compact rail",
  );
  await clickElementCenter(send, `document.querySelector("[data-builder-left-dock-expand]")`, "expand left project dock");
  await waitFor(send, `document.querySelector("[data-builder-readable-workbench]")?.getAttribute("data-builder-left-dock-collapsed") === "false"`, "left project dock expanded");
  verified.readableWorkbenchRuntime = true;

  await assertRuntimeCheck(
    send,
    `(() => {
      const titlebar = document.querySelector('[data-window-titlebar][data-titlebar-drag-shell]');
      const dragRegions = Array.from(document.querySelectorAll('[data-window-titlebar] [data-titlebar-drag-region][data-tauri-drag-region]'));
      const strip = document.querySelector('[data-window-titlebar] [data-titlebar-drag-strip][data-titlebar-drag-hit-target="background"]');
      const brand = document.querySelector('[data-window-titlebar] [data-titlebar-drag-hit-target="brand"]');
      const controls = Array.from(document.querySelectorAll('[data-window-titlebar] [data-window-control]'));
      const interactiveControls = Array.from(document.querySelectorAll('[data-window-titlebar] [data-titlebar-interactive-control]'));
      const titlebarRect = titlebar?.getBoundingClientRect();
      const stripRect = strip?.getBoundingClientRect();
      const brandRect = brand?.getBoundingClientRect();
      const controlsOutsideDragRegions = controls.every((control) => !control.closest("[data-titlebar-drag-region]"));
      const controlsMarkedInteractive = controls.every((control) => control.hasAttribute("data-titlebar-interactive-control"));
      const dragSurfaceArea = dragRegions.reduce((sum, region) => {
        const rect = region.getBoundingClientRect();
        return sum + Math.max(0, rect.width) * Math.max(0, rect.height);
      }, 0);
      return {
        passed:
          Boolean(titlebar && titlebarRect && titlebarRect.width >= 800 && titlebarRect.height >= 36) &&
          dragRegions.length >= 3 &&
          Boolean(strip && stripRect && stripRect.width >= 120 && stripRect.height >= 36) &&
          Boolean(brand && brandRect && brandRect.width >= 120 && brandRect.height >= 32) &&
          controls.length >= 3 &&
          interactiveControls.length >= controls.length &&
          controlsOutsideDragRegions &&
          controlsMarkedInteractive &&
          dragSurfaceArea >= 8000,
        detail: \`titlebar=\${titlebarRect ? Math.round(titlebarRect.width) + "x" + Math.round(titlebarRect.height) : "missing"}, regions=\${dragRegions.length}, strip=\${stripRect ? Math.round(stripRect.width) + "x" + Math.round(stripRect.height) : "missing"}, brand=\${brandRect ? Math.round(brandRect.width) + "x" + Math.round(brandRect.height) : "missing"}, controls=\${controls.length}, interactive=\${interactiveControls.length}, dragArea=\${Math.round(dragSurfaceArea)}, controlsOutsideDrag=\${controlsOutsideDragRegions}\`
      };
    })()`,
    "editor titlebar drag hit targets",
  );
  verified.titlebarDragRuntime = true;

  await assertRuntimeCheck(
    send,
    `(() => {
      const leftRun = document.querySelector('[data-builder-left-run-controls-layout="qt-creator-kit"]');
      const utilityStrip = document.querySelector('[data-builder-left-rail-utility-strip="qt-creator-minimal"]');
      const compactButtons = document.querySelector('[data-builder-left-rail-buttons="qt-creator-minimal"]');
      const kit = document.querySelector("[data-builder-rail-kit]");
      const presetSelect = document.querySelector("[data-builder-rail-kit-preset-select]");
      const presetPreview = document.querySelector("[data-builder-rail-kit-step-preview]");
      const presetPlan = document.querySelector("[data-builder-rail-kit-plan]");
      const stepCount = Number(presetPreview?.getAttribute("data-builder-rail-kit-step-count") || "0");
      const planTotal = Number(presetPlan?.getAttribute("data-builder-rail-kit-plan-total") || "0");
      const planProgress = Number(presetPlan?.getAttribute("data-builder-rail-kit-plan-progress") || "-1");
      const planNextStep = presetPlan?.getAttribute("data-builder-rail-kit-plan-next-step") || "";
      const steps = Array.from(document.querySelectorAll("[data-builder-rail-kit-step]"));
      const selectedPreset = document.querySelector("[data-builder-rail-run-selected-preset]");
      const target = document.querySelector("[data-builder-rail-run-target]");
      const workflow = document.querySelector("[data-builder-rail-primary-workflow]");
      const quickActions = document.querySelector("[data-builder-rail-quick-actions]");
      const buildButton = document.querySelector("[data-builder-rail-build][data-builder-rail-build-shortcut]");
      const checkButton = document.querySelector("[data-builder-rail-check][data-builder-rail-check-shortcut]");
      const runShortcut = document.querySelector("[data-builder-rail-primary-workflow][data-builder-rail-run-shortcut]");
      const style = leftRun ? getComputedStyle(leftRun) : null;
      return {
        passed:
          Boolean(leftRun) &&
          Boolean(utilityStrip) &&
          Boolean(compactButtons) &&
          style?.display !== "none" &&
          style?.visibility !== "hidden" &&
          Boolean(kit) &&
          Boolean(presetSelect) &&
          Boolean(presetPreview) &&
          Boolean(presetPlan) &&
          stepCount >= 1 &&
          planTotal === stepCount &&
          planProgress >= 0 &&
          Boolean(planNextStep) &&
          steps.length >= 1 &&
          Boolean(selectedPreset) &&
          Boolean(target) &&
          Boolean(workflow) &&
          Boolean(quickActions) &&
          Boolean(buildButton) &&
          Boolean(checkButton) &&
          Boolean(runShortcut),
        detail: \`display=\${style?.display || "missing"}, visibility=\${style?.visibility || "missing"}, compact=\${Boolean(compactButtons)}, stepCount=\${stepCount}, planTotal=\${planTotal}, planProgress=\${planProgress}, next=\${planNextStep}, renderedSteps=\${steps.length}\`
      };
    })()`,
    "left rail run kit surface",
  );
  verified.leftRunKitRuntime = true;

  await assertRuntimeCheck(
    send,
    `(() => {
      const trigger = document.querySelector("[data-builder-rail-kit-preset-select]");
      const preview = document.querySelector("[data-builder-rail-kit-step-preview]");
      const plan = document.querySelector("[data-builder-rail-kit-plan]");
      const stepCount = Number(preview?.getAttribute("data-builder-rail-kit-step-count") || 0);
      const planTotal = Number(plan?.getAttribute("data-builder-rail-kit-plan-total") || 0);
      const planProgress = Number(plan?.getAttribute("data-builder-rail-kit-plan-progress") || -1);
      const nextStep = plan?.getAttribute("data-builder-rail-kit-plan-next-step") || "";
      const summary = document.querySelector("[data-builder-rail-kit-plan-summary]")?.textContent?.trim() || "";
      const overflow = document.querySelector("[data-builder-rail-kit-step-overflow]");
      return {
        passed:
          Boolean(trigger) &&
          stepCount >= 1 &&
          planTotal === stepCount &&
          planProgress >= 0 &&
          Boolean(nextStep) &&
          nextStep !== "none" &&
          Boolean(summary) &&
          Boolean(overflow),
        detail: \`preset=\${trigger?.textContent?.trim().replace(/\\s+/g, " ") || "missing"}, stepCount=\${stepCount}, planTotal=\${planTotal}, progress=\${planProgress}, next=\${nextStep}, summary=\${summary}, overflow=\${Boolean(overflow)}\`
      };
    })()`,
    "left rail run kit preset model stays available in compact rail",
  );
  verified.leftRunPresetChangeRuntime = true;

  await assertRuntimeCheck(
    send,
    `(() => {
      const operation = document.querySelector("[data-builder-left-run-operation-monitor]");
      const title = document.querySelector("[data-builder-left-run-operation-title]");
      const detail = document.querySelector("[data-builder-left-run-operation-detail]");
      const action = document.querySelector("[data-builder-left-run-operation-action]");
      const state = operation?.getAttribute("data-builder-left-run-operation-state") || "";
      return {
        passed:
          Boolean(operation) &&
          Boolean(state) &&
          Boolean(title?.textContent?.trim()) &&
          Boolean(detail?.textContent?.trim()) &&
          Boolean(action?.textContent?.trim()),
        detail: \`state=\${state}, title=\${title?.textContent?.trim() || "missing"}, action=\${action?.textContent?.trim() || "missing"}\`
      };
    })()`,
    "left rail operation monitor",
  );
  verified.leftRunOperationRuntime = true;

  await evaluate(
    send,
    `(() => {
      const trigger = document.querySelector("[data-builder-rail-more]");
      trigger?.scrollIntoView({ block: "center", inline: "nearest" });
      trigger?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, button: 0, pointerType: "mouse" }));
      trigger?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0, view: window }));
      trigger?.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, button: 0, view: window }));
      trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, view: window }));
      return true;
    })()`,
  );
  await waitFor(send, `Boolean(document.querySelector("[data-builder-rail-kit-command-menu]"))`, "left rail build/run command menu");
  await assertRuntimeCheck(
    send,
    `(() => {
      const menu = document.querySelector("[data-builder-rail-kit-command-menu]");
      return {
        passed:
          Boolean(menu) &&
          Boolean(menu.querySelector("[data-builder-rail-menu-quick-check]")) &&
          Boolean(menu.querySelector("[data-builder-rail-menu-validate-window]")) &&
          Boolean(menu.querySelector("[data-builder-rail-menu-bundle-installer]")) &&
          Boolean(menu.querySelector("[data-builder-rail-menu-build-config]")),
        detail: menu?.textContent?.trim().replace(/\\s+/g, " ").slice(0, 160) || "missing menu"
      };
    })()`,
    "left rail overflow command menu",
  );
  verified.leftRunCommandMenuRuntime = true;
  await clickElementCenter(send, `document.querySelector("[data-builder-rail-menu-build-config]")`, "left rail build configuration menu item");
  await waitFor(
    send,
    `Boolean(document.querySelector("[data-builder-build-workspace]")) &&
      document.querySelector('[data-builder-mode-button="build"]')?.getAttribute("aria-current") === "page"`,
    "left rail build configuration route",
  );
  verified.leftRunBuildConfigRouteRuntime = true;

  await evaluate(
    send,
    `(() => {
      const trigger = document.querySelector("[data-titlebar-build-menu-secondary] button");
      trigger?.scrollIntoView({ block: "center", inline: "nearest" });
      trigger?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, button: 0, pointerType: "mouse" }));
      trigger?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0, view: window }));
      trigger?.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, button: 0, view: window }));
      trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, view: window }));
      return true;
    })()`,
  );
  await waitFor(
    send,
    `Boolean(document.querySelector('[data-titlebar-menu-command="quick-check-all"]')) &&
      Array.from(document.querySelectorAll('[role="menuitem"]')).some((item) => /构建|打包|运行|检查/.test(item.textContent || ""))`,
    "titlebar secondary build menu",
  );
  verified.titlebarBuildMenuRuntime = true;
  await clickElementCenter(send, `document.querySelector('[data-titlebar-menu-command="quick-check-all"]')`, "titlebar quick check menu item");
  await waitFor(
    send,
    `document.querySelector("[data-builder-left-run-operation-monitor]")?.getAttribute("data-builder-left-run-operation-task") === "quick-check-all"`,
    "titlebar build menu action reaches left rail operation monitor",
    20000,
  );
  await assertRuntimeCheck(
    send,
    `(() => {
      const monitor = document.querySelector("[data-builder-left-run-operation-monitor]");
      const task = monitor?.getAttribute("data-builder-left-run-operation-task") || "";
      const status = monitor?.getAttribute("data-builder-left-run-operation-status") || "";
      const count = Number(monitor?.getAttribute("data-builder-left-run-operation-count") || 0);
      const detail = document.querySelector("[data-builder-left-run-operation-detail]")?.textContent?.trim().replace(/\\s+/g, " ") || "";
      return {
        passed: task === "quick-check-all" && count >= 1 && Boolean(status),
        detail: \`task=\${task || "missing"}, status=\${status || "missing"}, count=\${count}, detail=\${detail.slice(0, 160)}\`
      };
    })()`,
    "titlebar build menu command is tracked by the left rail monitor",
  );
  verified.titlebarBuildActionRuntime = true;
  await closeTransientOverlays(send);
}

async function runAppSettingsRuntimeChecks(send, verified) {
  log("checking app settings language preferences");
  const reloadToken = `settings-smoke-${Date.now()}`;
  await evaluate(
    send,
    `(() => {
      localStorage.removeItem("nova-language");
      localStorage.removeItem("nova-language-user-set");
      localStorage.removeItem("nova-language-zh-default-migrated");
      location.assign(location.origin + location.pathname + "?${reloadToken}");
      return true;
    })()`,
  );
  await waitFor(send, `location.search.includes("${reloadToken}")`, "language preference reload navigation", 15000);
  await waitFor(send, `document.readyState === "complete"`, "reload after clearing language preference", 15000);
  await waitFor(send, `document.documentElement.lang === "zh-CN"`, "Chinese default language", 15000);
  await waitFor(send, `Boolean(document.querySelector('[data-builder-left-run-controls-layout="qt-creator-kit"]'))`, "builder shell after language reload");
  await clickElementCenter(send, `document.querySelector('[data-window-control="settings"]')`, "settings titlebar button");
  await waitFor(send, `Boolean(document.querySelector('[data-app-settings-language-switch]'))`, "settings language switcher");
  await assertRuntimeCheck(
    send,
    `(() => {
      const section = document.querySelector('[data-app-settings-language]');
      const checked = section?.querySelector('[role="radio"][aria-checked="true"]');
      return {
        passed: document.documentElement.lang === "zh-CN" &&
          section?.getAttribute("data-app-settings-default-language") === "zh-CN" &&
          checked?.textContent?.trim() === "中文",
        detail: "lang=" + document.documentElement.lang + ", checked=" + (checked?.textContent?.trim() || "")
      };
    })()`,
    "settings defaults to Chinese",
  );
  await clickElementCenter(
    send,
    `Array.from(document.querySelectorAll('[data-app-settings-language-switch] [role="radio"]')).find((node) => node.textContent.trim() === "English")`,
    "English language option",
  );
  await waitFor(send, `document.documentElement.lang === "en-US"`, "English language switch");
  await assertRuntimeCheck(
    send,
    `(() => ({
      passed: localStorage.getItem("nova-language") === "en-US" &&
        localStorage.getItem("nova-language-user-set") === "true" &&
        document.querySelector('[data-app-settings-overview]')?.textContent.includes("Preference Overview") &&
        document.querySelector('[data-app-settings-appearance]')?.textContent.includes("Appearance") &&
        document.querySelector('[data-app-settings-workspace]')?.textContent.includes("Workbench") &&
        document.querySelector('[data-app-settings-behavior]')?.textContent.includes("Behavior"),
      detail: "language=" + localStorage.getItem("nova-language")
    }))()`,
    "settings switches and persists English",
  );
  await clickElementCenter(
    send,
    `Array.from(document.querySelectorAll('[data-app-settings-language-switch] [role="radio"]')).find((node) => node.textContent.trim() === "中文")`,
    "Chinese language option",
  );
  await waitFor(send, `document.documentElement.lang === "zh-CN"`, "Chinese language switch");
  await assertRuntimeCheck(
    send,
    `(() => ({
      passed: localStorage.getItem("nova-language") === "zh-CN" &&
        document.querySelector('[data-app-settings-overview]')?.textContent.includes("偏好总览") &&
        document.querySelector('[data-app-settings-appearance]')?.textContent.includes("外观") &&
        document.querySelector('[data-app-settings-workspace]')?.textContent.includes("工作台") &&
        document.querySelector('[data-app-settings-behavior]')?.textContent.includes("操作行为"),
      detail: "language=" + localStorage.getItem("nova-language")
    }))()`,
    "settings switches back to Chinese",
  );
  await closeTransientOverlays(send);
  verified.appSettingsLanguageRuntime = true;
}

const vitePort = await freePort();
const debugPort = await freePort();
const appUrl = `http://127.0.0.1:${vitePort}`;
const browserPath = findBrowserExecutable();
userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "nova-builder-smoke-"));

log(`starting Vite on ${appUrl}`);
viteProcess = startVite(vitePort);
viteProcess.stdout.on("data", (chunk) => {
  viteOutput += String(chunk);
});
viteProcess.stderr.on("data", (chunk) => {
  const text = String(chunk);
  viteOutput += text;
  if (/error|EADDRINUSE/i.test(text)) {
    process.stderr.write(text);
  }
});

log(`starting browser debug port ${debugPort}`);
browserProcess = startBrowser(browserPath, debugPort, userDataDir);

let passed = false;
try {
  await waitForHttp(appUrl, "Vite dev server");
  log("Vite is ready");
  const { socket, send } = await connectDevtools(debugPort);
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false,
  });
  log("navigating to builder");
  await send("Page.navigate", { url: appUrl });

  await waitFor(send, "document.readyState === 'complete'", "page load");
  await waitFor(send, "window.innerWidth >= 1200 && window.innerHeight >= 800", "desktop viewport");
  await waitFor(send, "Boolean(document.querySelector('[data-editor-shell=\"builder\"]'))", "builder shell");
  await waitFor(send, "Boolean(document.querySelector('[data-builder-mode-rail=\"qt-creator-left\"]'))", "builder mode rail");
  await waitFor(send, "Boolean(document.querySelector('[data-builder-left-run-controls-layout=\"qt-creator-kit\"]'))", "left run kit");

  const checks = [
    ["project", "[data-builder-project-workspace-tree]", "project workspace tree"],
    ["design", "[data-builder-canvas][data-builder-canvas-selected-count]", "design canvas"],
    ["logic", "[data-builder-logic-workbench-next-actions]", "logic workbench"],
    ["logic", "[data-builder-logic-command-impact-panel]", "logic command impact panel"],
    ["build", "[data-builder-desktop-runtime-workbench]", "desktop runtime workbench"],
  ];
  const verified = {
    appSettingsLanguageRuntime: false,
    projectTree: false,
    projectWorkspaceTree: false,
    projectTopology: false,
    projectSourceOverview: false,
    projectActionCenterRuntime: false,
    projectWorkingSetRuntime: false,
    projectOwnership: false,
    projectLocatorRuntime: false,
    projectNodeDossier: false,
    projectTreeKeyboardRuntime: false,
    editorTabsRuntime: false,
    projectOpenFilesRuntime: false,
    projectOpenFileCloseRuntime: false,
    projectOpenFileRevealRuntime: false,
    projectFolderSaveRuntime: false,
    projectNodeActionStripRuntime: false,
    projectNodeDuplicateRuntime: false,
    projectNodeDeleteDialogRuntime: false,
    previewExportRemovedRuntime: false,
    componentPaletteRuntime: false,
    componentCoverageRuntime: false,
    componentPaletteKitsRuntime: false,
    componentPaletteKitScaffoldRuntime: false,
    pageWindowShellRuntime: false,
    canvas: false,
    stableActionbar: false,
    canvasLayoutStableRuntime: false,
    singleSelection: false,
    multiSelection: false,
    multiSelectLayoutRuntime: false,
    marqueeSelection: false,
    contextMenu: false,
    canvasContextInsertRuntime: false,
    canvasContextSelectSameRuntime: false,
    canvasContextInvertSelectionRuntime: false,
    canvasContextRuntimeStateRuntime: false,
    canvasContextGroupLayoutRuntime: false,
    canvasContextMatchSizeRuntime: false,
    canvasContextDistributeRuntime: false,
    canvasContextGoSlotRuntime: false,
    contextMenuTextEditRuntime: false,
    inlineTextEdit: false,
    inlineTextEditCommitRuntime: false,
    inlineTextKeyboardRuntime: false,
    inlineTextEnterRuntime: false,
    actionbarTextEditRuntime: false,
    logicWorkbench: false,
    logicImpact: false,
    logicContextRuntime: false,
    logicCommandCenterRuntime: false,
    logicConnectionRuntime: false,
    logicFlowRuntime: false,
    logicSlotAssistantRuntime: false,
    goToSlotRuntime: false,
    rustEditorRuntime: false,
    rustCodeLensRuntime: false,
    rustSyntaxRuntime: false,
    rustCompletionRuntime: false,
    rustCompletionCommitRuntime: false,
    rustSignatureRuntime: false,
    rustQuickFixRuntime: false,
    rustMinimapRuntime: false,
    rustFormatRuntime: false,
    rustFindRuntime: false,
    rustReplaceRuntime: false,
    rustGotoLineRuntime: false,
    rustSymbolSelectionRuntime: false,
    rustRenameRuntime: false,
    rustWordWrapRuntime: false,
    rustDebugWorkbenchRuntime: false,
    runtimeWorkbench: false,
    outputDockLayout: false,
    outputDockContentRuntime: false,
    outputDockNoClipRuntime: false,
    outputDockLogSearchRuntime: false,
    readableWorkbenchRuntime: false,
    builderToolbarPolicy: false,
    builderTopbarOmitted: false,
    titlebarDragRuntime: false,
    titlebarOverflowRuntime: false,
    titlebarBuildMenuRuntime: false,
    titlebarBuildActionRuntime: false,
    leftRunKitRuntime: false,
    leftRunPresetChangeRuntime: false,
    leftRunOperationRuntime: false,
    leftRunCommandMenuRuntime: false,
    leftRunBuildConfigRouteRuntime: false,
  };

  await runModeContractChecks(send, verified);
  await runShellCommandPlacementChecks(send, verified);
  await runAppSettingsRuntimeChecks(send, verified);

  for (const [mode, selector, label] of checks) {
    log(`checking ${label}`);
    await evaluate(send, `document.querySelector('[data-builder-mode-button="${mode}"]')?.click(); true`);
    await waitFor(send, `Boolean(document.querySelector(${JSON.stringify(selector)}))`, label);
    if (label === "project workspace tree") verified.projectTree = true;
    if (label === "design canvas") verified.canvas = true;
    if (label === "logic workbench") verified.logicWorkbench = true;
    if (label === "logic command impact panel") verified.logicImpact = true;
    if (label === "desktop runtime workbench") verified.runtimeWorkbench = true;
    if (label === "project workspace tree") {
      await runProjectWorkspaceChecks(send, verified);
    }
    if (label === "design canvas") {
      await runDesignInteractionChecks(send, verified);
      await runWindowShellEditorChecks(send, verified);
      await runComponentPaletteRuntimeChecks(send, verified);
    }
    if (label === "logic command impact panel") {
      await runLogicRustChecks(send, verified);
    }
    if (label === "desktop runtime workbench") {
      await runOutputDockLayoutChecks(send, verified);
    }
  }

  const summary = await evaluate(
    send,
    `({
      title: document.title,
      shell: document.querySelector('[data-editor-shell]')?.getAttribute('data-editor-shell') || '',
      modes: Array.from(document.querySelectorAll('[data-builder-mode-button]')).map((node) => node.getAttribute('data-builder-mode-button'))
    })`,
  );

  socket.close();
  clearTimeout(smokeTimeout);
  console.log(
    `Builder runtime smoke ok: ${summary.shell} shell, modes ${summary.modes.join("/")}, appSettingsLanguageRuntime=${verified.appSettingsLanguageRuntime}, canvas=${verified.canvas}, projectTree=${verified.projectTree}, projectWorkspaceTree=${verified.projectWorkspaceTree}, projectTopology=${verified.projectTopology}, projectSourceOverview=${verified.projectSourceOverview}, projectActionCenterRuntime=${verified.projectActionCenterRuntime}, projectWorkingSetRuntime=${verified.projectWorkingSetRuntime}, projectOwnership=${verified.projectOwnership}, projectLocatorRuntime=${verified.projectLocatorRuntime}, projectNodeDossier=${verified.projectNodeDossier}, projectNodeActionStripRuntime=${verified.projectNodeActionStripRuntime}, projectNodeDuplicateRuntime=${verified.projectNodeDuplicateRuntime}, projectNodeDeleteDialogRuntime=${verified.projectNodeDeleteDialogRuntime}, projectTreeKeyboardRuntime=${verified.projectTreeKeyboardRuntime}, editorTabsRuntime=${verified.editorTabsRuntime}, projectOpenFilesRuntime=${verified.projectOpenFilesRuntime}, projectOpenFileCloseRuntime=${verified.projectOpenFileCloseRuntime}, projectOpenFileRevealRuntime=${verified.projectOpenFileRevealRuntime}, projectFolderSaveRuntime=${verified.projectFolderSaveRuntime}, previewExportRemovedRuntime=${verified.previewExportRemovedRuntime}, componentPaletteRuntime=${verified.componentPaletteRuntime}, componentCoverageRuntime=${verified.componentCoverageRuntime}, componentPaletteKitsRuntime=${verified.componentPaletteKitsRuntime}, componentPaletteKitScaffoldRuntime=${verified.componentPaletteKitScaffoldRuntime}, pageWindowShellRuntime=${verified.pageWindowShellRuntime}, stableActionbar=${verified.stableActionbar}, canvasLayoutStableRuntime=${verified.canvasLayoutStableRuntime}, singleSelection=${verified.singleSelection}, multiSelection=${verified.multiSelection}, multiSelectLayoutRuntime=${verified.multiSelectLayoutRuntime}, marqueeSelection=${verified.marqueeSelection}, contextMenu=${verified.contextMenu}, canvasContextInsertRuntime=${verified.canvasContextInsertRuntime}, canvasContextSelectSameRuntime=${verified.canvasContextSelectSameRuntime}, canvasContextInvertSelectionRuntime=${verified.canvasContextInvertSelectionRuntime}, canvasContextRuntimeStateRuntime=${verified.canvasContextRuntimeStateRuntime}, canvasContextGroupLayoutRuntime=${verified.canvasContextGroupLayoutRuntime}, canvasContextMatchSizeRuntime=${verified.canvasContextMatchSizeRuntime}, canvasContextDistributeRuntime=${verified.canvasContextDistributeRuntime}, canvasContextGoSlotRuntime=${verified.canvasContextGoSlotRuntime}, contextMenuTextEditRuntime=${verified.contextMenuTextEditRuntime}, inlineTextEdit=${verified.inlineTextEdit}, inlineTextEditCommitRuntime=${verified.inlineTextEditCommitRuntime}, inlineTextKeyboardRuntime=${verified.inlineTextKeyboardRuntime}, inlineTextEnterRuntime=${verified.inlineTextEnterRuntime}, actionbarTextEditRuntime=${verified.actionbarTextEditRuntime}, logicWorkbench=${verified.logicWorkbench}, logicContextRuntime=${verified.logicContextRuntime}, logicCommandCenterRuntime=${verified.logicCommandCenterRuntime}, logicImpact=${verified.logicImpact}, logicConnectionRuntime=${verified.logicConnectionRuntime}, logicFlowRuntime=${verified.logicFlowRuntime}, logicSlotAssistantRuntime=${verified.logicSlotAssistantRuntime}, goToSlotRuntime=${verified.goToSlotRuntime}, rustEditorRuntime=${verified.rustEditorRuntime}, rustCodeLensRuntime=${verified.rustCodeLensRuntime}, rustSyntaxRuntime=${verified.rustSyntaxRuntime}, rustCompletionRuntime=${verified.rustCompletionRuntime}, rustCompletionCommitRuntime=${verified.rustCompletionCommitRuntime}, rustSignatureRuntime=${verified.rustSignatureRuntime}, rustQuickFixRuntime=${verified.rustQuickFixRuntime}, rustMinimapRuntime=${verified.rustMinimapRuntime}, rustFormatRuntime=${verified.rustFormatRuntime}, rustFindRuntime=${verified.rustFindRuntime}, rustReplaceRuntime=${verified.rustReplaceRuntime}, rustGotoLineRuntime=${verified.rustGotoLineRuntime}, rustSymbolSelectionRuntime=${verified.rustSymbolSelectionRuntime}, rustRenameRuntime=${verified.rustRenameRuntime}, rustWordWrapRuntime=${verified.rustWordWrapRuntime}, rustDebugWorkbenchRuntime=${verified.rustDebugWorkbenchRuntime}, runtimeWorkbench=${verified.runtimeWorkbench}, outputDockLayout=${verified.outputDockLayout}, outputDockContentRuntime=${verified.outputDockContentRuntime}, outputDockNoClipRuntime=${verified.outputDockNoClipRuntime}, outputDockLogSearchRuntime=${verified.outputDockLogSearchRuntime}, readableWorkbenchRuntime=${verified.readableWorkbenchRuntime}, builderToolbarPolicy=${verified.builderToolbarPolicy}, builderTopbarOmitted=${verified.builderTopbarOmitted}, titlebarDragRuntime=${verified.titlebarDragRuntime}, titlebarOverflowRuntime=${verified.titlebarOverflowRuntime}, titlebarBuildMenuRuntime=${verified.titlebarBuildMenuRuntime}, titlebarBuildActionRuntime=${verified.titlebarBuildActionRuntime}, leftRunKitRuntime=${verified.leftRunKitRuntime}, leftRunPresetChangeRuntime=${verified.leftRunPresetChangeRuntime}, leftRunOperationRuntime=${verified.leftRunOperationRuntime}, leftRunCommandMenuRuntime=${verified.leftRunCommandMenuRuntime}, leftRunBuildConfigRouteRuntime=${verified.leftRunBuildConfigRouteRuntime}.`,
  );
  passed = true;
} finally {
  clearTimeout(smokeTimeout);
  cleanup();
}

if (passed) {
  process.exit(0);
}
