// Generated target React/Vite runtime templates used by Nova's Rust project writer.

pub fn generated_vite_config() -> &'static str {
    r#"import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
});
"#
}

pub fn generated_tsconfig() -> &'static str {
    r#"{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": []
}
"#
}

pub fn generated_main_tsx() -> &'static str {
    r#"import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
"#
}

pub fn generated_capture_window_script() -> &'static str {
    r#"import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";

const appDir = process.cwd();
const validationDir = path.resolve(appDir, "..", "validation");
const screenshotPath = path.join(validationDir, "generated-window-runtime.png");
const analysisPath = path.join(validationDir, "generated-window-screenshot-analysis.json");
const runtimeAuditPath = path.join(validationDir, "generated-window-runtime-audit.json");
const breakpointDir = path.join(validationDir, "breakpoints");
const breakpointValidationPath = path.join(validationDir, "generated-window-breakpoint-validation.json");
const statusPath = path.join(validationDir, "browser-capture-status.json");

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function readProject() {
  const source = await fs.readFile(path.join(appDir, "src", "project-data.ts"), "utf8");
  const match = source.match(/export const project = ([\s\S]*?) as const;\nexport const registeredRustCommands/);
  if (!match) {
    throw new Error("Cannot parse generated project-data.ts");
  }
  return JSON.parse(match[1]);
}

async function writeStatus(status) {
  await fs.mkdir(validationDir, { recursive: true });
  await fs.writeFile(statusPath, JSON.stringify(status, null, 2));
}

async function writeAnalysis(analysis, outputPath = analysisPath) {
  await fs.mkdir(validationDir, { recursive: true });
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(analysis, null, 2));
}

async function writeRuntimeAudit(audit, outputPath = runtimeAuditPath) {
  await fs.mkdir(validationDir, { recursive: true });
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(audit, null, 2));
}

async function writeBreakpointValidation(validation) {
  await fs.mkdir(validationDir, { recursive: true });
  await fs.writeFile(breakpointValidationPath, JSON.stringify(validation, null, 2));
}

function contentTypeFor(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

async function startStaticServer(rootDir) {
  const safeRoot = path.resolve(rootDir);
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
      const pathname = decodeURIComponent(requestUrl.pathname);
      if (pathname === "/favicon.ico") {
        response.writeHead(204);
        response.end();
        return;
      }
      let filePath = path.resolve(safeRoot, `.${pathname}`);
      if (filePath !== safeRoot && !filePath.startsWith(safeRoot + path.sep)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      let stat = await fs.stat(filePath).catch(() => null);
      if (stat?.isDirectory()) {
        filePath = path.join(filePath, "index.html");
        stat = await fs.stat(filePath).catch(() => null);
      }
      if (!stat?.isFile()) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      const content = await fs.readFile(filePath);
      response.writeHead(200, { "content-type": contentTypeFor(filePath) });
      response.end(content);
    } catch (error) {
      response.writeHead(500);
      response.end(error instanceof Error ? error.message : String(error));
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  return {
    url: `http://127.0.0.1:${port}/index.html`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

function rounded(value, digits = 4) {
  return Number(value.toFixed(digits));
}

function quantizedColor(data, offset) {
  const alpha = data[offset + 3];
  if (alpha < 16) {
    return "transparent";
  }
  const red = data[offset] >> 4;
  const green = data[offset + 1] >> 4;
  const blue = data[offset + 2] >> 4;
  return `${red}-${green}-${blue}`;
}

function analysisIssue(severity, title, detail) {
  return { severity, title, detail };
}

async function analyzeScreenshot(screenshotFilePath, expectedViewport) {
  const { PNG } = await import("pngjs");
  const buffer = await fs.readFile(screenshotFilePath);
  const png = PNG.sync.read(buffer);
  const totalPixels = png.width * png.height;
  const maxSamples = 32000;
  const step = Math.max(1, Math.floor(Math.sqrt(totalPixels / maxSamples)));
  const samples = [];
  const bins = new Map();

  for (let y = 0; y < png.height; y += step) {
    for (let x = 0; x < png.width; x += step) {
      const offset = (png.width * y + x) * 4;
      const key = quantizedColor(png.data, offset);
      samples.push({ x, y, key });
      bins.set(key, (bins.get(key) ?? 0) + 1);
    }
  }

  let dominantKey = "";
  let dominantCount = 0;
  for (const [key, count] of bins.entries()) {
    if (count > dominantCount) {
      dominantKey = key;
      dominantCount = count;
    }
  }

  let contentSamples = 0;
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;
  for (const sample of samples) {
    if (sample.key !== dominantKey && sample.key !== "transparent") {
      contentSamples += 1;
      minX = Math.min(minX, sample.x);
      minY = Math.min(minY, sample.y);
      maxX = Math.max(maxX, sample.x);
      maxY = Math.max(maxY, sample.y);
    }
  }

  const dominantColorRatio = samples.length > 0 ? dominantCount / samples.length : 1;
  const contentRatio = samples.length > 0 ? contentSamples / samples.length : 0;
  const uniqueColorBins = bins.size;
  const issues = [];
  const viewportWidthDelta = Math.abs(png.width - expectedViewport.width);
  const viewportTooShort = png.height < expectedViewport.height * 0.75;
  const likelyBlank = samples.length === 0 || uniqueColorBins <= 3 || (dominantColorRatio > 0.992 && contentRatio < 0.008);

  if (likelyBlank) {
    issues.push(analysisIssue("error", "Screenshot appears blank", "The runtime screenshot has too little visible variation to prove the generated UI rendered."));
  }
  if (viewportWidthDelta > 2) {
    issues.push(analysisIssue("warning", "Viewport width mismatch", `Expected ${expectedViewport.width}px wide, captured ${png.width}px.`));
  }
  if (viewportTooShort) {
    issues.push(analysisIssue("warning", "Viewport height is unexpectedly short", `Expected around ${expectedViewport.height}px tall, captured ${png.height}px.`));
  }
  if (!likelyBlank && contentRatio < 0.025) {
    issues.push(analysisIssue("warning", "Low content coverage", "Most sampled pixels match the dominant background color, so the generated UI may be sparse or visually collapsed."));
  }

  const status = issues.some((issue) => issue.severity === "error") ? "failed" : issues.length > 0 ? "warning" : "passed";
  return {
    status,
    screenshotPath: screenshotFilePath,
    expectedViewport,
    capturedSize: { width: png.width, height: png.height },
    sampleStep: step,
    sampledPixels: samples.length,
    uniqueColorBins,
    dominantColorRatio: rounded(dominantColorRatio),
    contentRatio: rounded(contentRatio),
    contentBounds:
      contentSamples > 0
        ? { x: minX, y: minY, width: maxX - minX + step, height: maxY - minY + step }
        : null,
    isLikelyBlank: likelyBlank,
    issues,
    analyzedAt: new Date().toISOString(),
  };
}

function activeBreakpointForWidth(width) {
  if (width <= 600) return "mobile";
  if (width <= 1100) return "tablet";
  return "desktop";
}

function resolveExpectedItem(item, breakpoint) {
  if (breakpoint === "desktop") {
    return item;
  }
  const override = item.responsive?.[breakpoint];
  if (!override) {
    return item;
  }
  return {
    ...item,
    x: typeof override.x === "number" ? override.x : item.x,
    y: typeof override.y === "number" ? override.y : item.y,
    width: typeof override.width === "number" ? override.width : item.width,
    height: typeof override.height === "number" ? override.height : item.height,
  };
}

async function collectRuntimeAudit(page, project, expectedViewport, runtimeMessages) {
  const activeFile = project.files?.find((file) => file.id === project.activeFileId) ?? project.files?.[0];
  const breakpoint = activeBreakpointForWidth(expectedViewport.width);
  const expectedItems = (activeFile?.items ?? []).map((item) => resolveExpectedItem(item, breakpoint));
  return page.evaluate(
    ({ expectedItems, expectedViewport, breakpoint, runtimeMessages }) => {
      const now = new Date().toISOString();
      const issues = [];
      const controls = [];
      const elements = Array.from(document.querySelectorAll("[data-nova-control-id]"));
      const elementById = new Map(elements.map((element) => [element.getAttribute("data-nova-control-id") || "", element]));
      const interactiveSelector = "button,input,textarea,select,a[href],[role='button'],[tabindex]";

      function rounded(value) {
        return Math.round(value * 100) / 100;
      }

      function boundsFor(element) {
        const rect = element.getBoundingClientRect();
        return {
          x: rounded(rect.x),
          y: rounded(rect.y),
          width: rounded(rect.width),
          height: rounded(rect.height),
          right: rounded(rect.right),
          bottom: rounded(rect.bottom),
        };
      }

      function issue(severity, title, detail, item, bounds) {
        issues.push({
          severity,
          title,
          detail,
          itemId: item?.id,
          itemName: item?.name,
          itemType: item?.type,
          bounds,
        });
      }

      function isElementVisible(element, bounds) {
        const style = window.getComputedStyle(element);
        return bounds.width > 0 && bounds.height > 0 && style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || 1) > 0;
      }

      function boundEvents(item) {
        const props = item.props ?? {};
        const events = props.events && typeof props.events === "object" ? Object.entries(props.events) : [];
        const names = events.filter(([, value]) => value && typeof value === "object" && value.commandId).map(([name]) => name);
        if (props.actionCommandId && !names.includes("click")) {
          names.push("click");
        }
        return names;
      }

      function hasTextOverflow(element) {
        const textNodes = [element, ...Array.from(element.querySelectorAll("button,span,p,strong,h1,h2,h3,small,label,td,input,textarea,select"))];
        return textNodes.some((node) => {
          const target = node;
          const text = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement
            ? target.value || target.getAttribute("placeholder") || ""
            : target.textContent || "";
          if (!text.trim() || target.clientWidth <= 0 || target.clientHeight <= 0) {
            return false;
          }
          return target.scrollWidth > target.clientWidth + 1 || target.scrollHeight > target.clientHeight + 1;
        });
      }

      if (expectedItems.length > 0 && elements.length === 0) {
        issue("error", "No runtime controls found", "The generated app rendered without any data-nova control markers.", null, null);
      }

      for (const item of expectedItems) {
        const element = elementById.get(item.id);
        if (!element) {
          issue("error", "Runtime control missing", "A control from the UI file was not found in the generated app DOM.", item, null);
          continue;
        }
        const bounds = boundsFor(element);
        const visible = isElementVisible(element, bounds);
        const interactive = element.matches(interactiveSelector) ? element : element.querySelector(interactiveSelector);
        const events = boundEvents(item);
        const disabled = interactive instanceof HTMLButtonElement || interactive instanceof HTMLInputElement || interactive instanceof HTMLTextAreaElement || interactive instanceof HTMLSelectElement
          ? interactive.disabled
          : interactive?.getAttribute("aria-disabled") === "true";
        const outsideViewport = bounds.right < 0 || bounds.bottom < 0 || bounds.x > expectedViewport.width || bounds.y > expectedViewport.height;
        const clippedByViewport = !outsideViewport && (bounds.x < 0 || bounds.y < 0 || bounds.right > expectedViewport.width || bounds.bottom > expectedViewport.height);

        controls.push({
          id: item.id,
          name: item.name ?? item.type,
          type: item.type,
          parentId: item.parentId ?? "",
          bounds,
          visible,
          eventNames: events,
          hasInteractiveTarget: Boolean(interactive),
          disabled: Boolean(disabled),
        });

        if (!visible) {
          issue("error", "Runtime control is not visible", "The control exists in the DOM but has no visible box.", item, bounds);
        }
        if (bounds.width < 2 || bounds.height < 2) {
          issue("error", "Runtime control collapsed", "The control rendered with a near-zero width or height.", item, bounds);
        }
        if (outsideViewport) {
          issue("warning", "Runtime control outside viewport", "The control exists but is outside the captured window viewport.", item, bounds);
        }
        if (clippedByViewport) {
          issue("warning", "Runtime control clipped by viewport", "The control is visible but extends beyond the captured window viewport.", item, bounds);
        }
        if (events.length > 0 && !interactive) {
          issue("error", "Bound event has no interactive target", "This control has an event binding but no button, input, select, textarea, link, role button, or tabindex target.", item, bounds);
        }
        if (events.length > 0 && disabled) {
          issue("warning", "Bound event target is disabled", "The event binding exists but the interactive target is disabled in the generated runtime.", item, bounds);
        }
        if (hasTextOverflow(element)) {
          issue("warning", "Runtime text may overflow", "One or more text-bearing descendants have scroll overflow in the generated runtime.", item, bounds);
        }
      }

      const errorCount = issues.filter((item) => item.severity === "error").length;
      const warningCount = issues.filter((item) => item.severity === "warning").length;
      return {
        status: errorCount > 0 ? "failed" : warningCount > 0 ? "warning" : "passed",
        breakpoint,
        expectedViewport,
        documentSize: {
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
        },
        expectedControlCount: expectedItems.length,
        renderedControlCount: controls.length,
        visibleControlCount: controls.filter((control) => control.visible).length,
        interactiveControlCount: controls.filter((control) => control.hasInteractiveTarget).length,
        boundEventControlCount: controls.filter((control) => control.eventNames.length > 0).length,
        errorCount,
        warningCount,
        controls,
        issues,
        runtimeMessages,
        auditedAt: now,
      };
    },
    { expectedItems, expectedViewport, breakpoint, runtimeMessages },
  );
}

function validationBreakpoints(activeFile) {
  const pageWidth = Number(activeFile?.page?.width ?? 1280);
  const pageHeight = Number(activeFile?.page?.height ?? 720);
  return [
    {
      id: "desktop",
      viewport: {
        width: clamp(Math.max(pageWidth, 1280), 1111, 1920),
        height: clamp(Math.max(pageHeight, 720), 600, 1600),
      },
    },
    { id: "tablet", viewport: { width: 1024, height: 768 } },
    { id: "mobile", viewport: { width: 390, height: 844 } },
  ];
}

async function captureViewport(browser, project, url, id, viewport, screenshotFilePath) {
  const runtimeMessages = [];
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  try {
    page.on("console", (message) => runtimeMessages.push({ type: message.type(), text: message.text() }));
    page.on("pageerror", (error) => runtimeMessages.push({ type: "pageerror", text: error.message }));
    await page.goto(url, { waitUntil: "networkidle" });
    await page.screenshot({ path: screenshotFilePath, fullPage: false });
    const runtimeAudit = await collectRuntimeAudit(page, project, viewport, runtimeMessages.slice(-20));
    const analysis = await analyzeScreenshot(screenshotFilePath, viewport);
    return {
      id,
      viewport,
      screenshotPath: screenshotFilePath,
      analysis,
      runtimeAudit,
      runtimeMessages: runtimeMessages.slice(-20),
    };
  } finally {
    await page.close().catch(() => undefined);
  }
}

function summarizeValidationStatus(entries) {
  const issues = entries.flatMap((entry) => [
    ...(entry.analysis?.issues ?? []),
    ...(entry.runtimeAudit?.issues ?? []),
  ]);
  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  return {
    status: errorCount > 0 ? "failed" : warningCount > 0 ? "warning" : "passed",
    errorCount,
    warningCount,
  };
}

async function launchBrowser(chromium) {
  const attempts = [
    { label: "msedge", options: { channel: "msedge", headless: true } },
    { label: "chrome", options: { channel: "chrome", headless: true } },
    { label: "bundled", options: { headless: true } },
  ];
  const errors = [];
  for (const attempt of attempts) {
    try {
      const browser = await chromium.launch(attempt.options);
      return { browser, channel: attempt.label, errors };
    } catch (error) {
      errors.push(`${attempt.label}: ${error.message}`);
    }
  }
  throw new Error(`No compatible Chromium browser found. ${errors.join(" | ")}`);
}

try {
  const project = await readProject();
  const activeFile = project.files?.find((file) => file.id === project.activeFileId) ?? project.files?.[0];
  const width = clamp(Number(activeFile?.page?.width ?? 1280), 320, 1920);
  const height = clamp(Number(activeFile?.page?.height ?? 720), 240, 1600);
  const { chromium } = await import("playwright-core");
  const { browser, channel, errors } = await launchBrowser(chromium);
  const staticServer = await startStaticServer(path.join(appDir, "dist"));
  let primaryCapture = null;
  const breakpointCaptures = [];
  try {
    primaryCapture = await captureViewport(browser, project, staticServer.url, "current", { width, height }, screenshotPath);
    for (const breakpoint of validationBreakpoints(activeFile)) {
      const breakpointScreenshotPath = path.join(breakpointDir, `${breakpoint.id}-runtime.png`);
      const breakpointAnalysisPath = path.join(breakpointDir, `${breakpoint.id}-screenshot-analysis.json`);
      const breakpointRuntimeAuditPath = path.join(breakpointDir, `${breakpoint.id}-runtime-audit.json`);
      const capture = await captureViewport(browser, project, staticServer.url, breakpoint.id, breakpoint.viewport, breakpointScreenshotPath);
      await writeAnalysis(capture.analysis, breakpointAnalysisPath);
      await writeRuntimeAudit(capture.runtimeAudit, breakpointRuntimeAuditPath);
      breakpointCaptures.push({
        id: breakpoint.id,
        viewport: breakpoint.viewport,
        screenshotPath: breakpointScreenshotPath,
        screenshotAnalysisPath: breakpointAnalysisPath,
        runtimeAuditPath: breakpointRuntimeAuditPath,
        analysis: capture.analysis,
        runtimeAudit: capture.runtimeAudit,
        runtimeMessages: capture.runtimeMessages,
      });
    }
  } finally {
    await browser.close().catch(() => undefined);
    await staticServer.close().catch(() => undefined);
  }
  const runtimeAudit = primaryCapture?.runtimeAudit;
  const analysis = primaryCapture?.analysis ?? await analyzeScreenshot(screenshotPath, { width, height });
  if (runtimeAudit) {
    await writeRuntimeAudit(runtimeAudit);
  }
  await writeAnalysis(analysis);
  const breakpointSummary = {
    ...summarizeValidationStatus(breakpointCaptures),
    validationPath: breakpointValidationPath,
    breakpoints: breakpointCaptures,
    validatedAt: new Date().toISOString(),
  };
  await writeBreakpointValidation(breakpointSummary);
  await writeStatus({
    ok: true,
    channel,
    url: staticServer.url,
    screenshotPath,
    analysisPath,
    runtimeAuditPath: runtimeAudit ? runtimeAuditPath : undefined,
    breakpointValidationPath,
    viewport: { width, height },
    analysisSummary: {
      status: analysis.status,
      issueCount: analysis.issues.length,
      contentRatio: analysis.contentRatio,
      uniqueColorBins: analysis.uniqueColorBins,
      isLikelyBlank: analysis.isLikelyBlank,
    },
    runtimeAuditSummary: runtimeAudit
      ? {
          status: runtimeAudit.status,
          errorCount: runtimeAudit.errorCount,
          warningCount: runtimeAudit.warningCount,
          renderedControlCount: runtimeAudit.renderedControlCount,
          boundEventControlCount: runtimeAudit.boundEventControlCount,
        }
      : undefined,
    breakpointValidationSummary: {
      status: breakpointSummary.status,
      errorCount: breakpointSummary.errorCount,
      warningCount: breakpointSummary.warningCount,
      breakpointCount: breakpointSummary.breakpoints.length,
    },
    runtimeMessages: primaryCapture?.runtimeMessages ?? [],
    fallbackErrors: errors,
    capturedAt: new Date().toISOString(),
  });
  console.log(`Captured generated window screenshot with ${channel}: ${screenshotPath}`);
} catch (error) {
  await writeStatus({
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    capturedAt: new Date().toISOString(),
  });
  console.log(`Browser screenshot unavailable: ${error instanceof Error ? error.message : String(error)}`);
}
"#
}

pub fn generated_app_tsx() -> &'static str {
    r#"import { useCallback, useEffect, useMemo, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  backendIntegrationOpenLogCommand,
  backendIntegrationProbeCommand,
  backendIntegrationReadLogCommand,
  backendIntegrationRuntimeStatusCommand,
  backendIntegrationStartCommand,
  backendIntegrationStopCommand,
  project,
  registeredRustCommands,
  rustCommandBindings,
  rustCommandSchemas,
} from "./project-data";

type LayoutMode = "free" | "row" | "column" | "grid";
type BreakpointId = "desktop" | "tablet" | "mobile";

type ResponsiveOverride = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

type EventName = "click" | "change";
type EventPayloadMode = "value" | "json";
type EventPayloadField = "event" | "itemId" | "itemName" | "value" | "checked" | "state";
type CommandParameterType = "string" | "bool" | "number" | "json";
type CommandParameterSource = "value" | "checked" | "event" | "itemId" | "itemName" | "state" | "payload";
type CommandParameterSchema = {
  name: string;
  type: CommandParameterType;
  source: CommandParameterSource;
};
type CommandResultSchema = {
  mode?: "text" | "json";
  messagePath?: string;
  statePatchPath?: string;
  successPath?: string;
  errorPath?: string;
};
type CommandSchema = {
  parameters?: readonly CommandParameterSchema[];
  result?: CommandResultSchema;
};
type EventBinding = {
  commandId?: string;
  passValue?: boolean;
  payloadMode?: EventPayloadMode;
  payloadFields?: readonly EventPayloadField[];
  resultTargetItemId?: string;
  resultTargetProp?: "value" | "label" | "title" | "description" | "helper";
  resultStateId?: string;
  applyJsonStatePatch?: boolean;
};
type ItemProps = Record<string, unknown> & {
  actionCommandId?: string;
  events?: Partial<Record<EventName, EventBinding>>;
  stateBindings?: Partial<Record<"value" | "label" | "title" | "description" | "helper", string>>;
};

type Item = {
  id: string;
  type: string;
  name?: string;
  parentId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  responsive?: Partial<Record<BreakpointId, ResponsiveOverride>>;
  props?: ItemProps;
};

type ProjectAsset = {
  id: string;
  name: string;
  publicPath: string;
};

type ProjectStateVariable = {
  id: string;
  name: string;
  initialValue: string;
};

type RuntimeReleaseConfig = {
  appName?: string;
  windowTitle?: string;
  windowKind?: "main" | "dialog" | "tool" | "frameless";
  titlebarStyle?: "nova" | "native" | "hidden";
  titlebarSubtitle?: string;
  showRuntimePanel?: boolean;
};

type CommandFeedback = Record<string, { loading: boolean; message: string; error: boolean }>;
type ItemPropOverrides = Record<string, Record<string, string>>;
type StateValues = Record<string, string>;
type CommandRunner = (item: Item, eventName: EventName, rawValue?: unknown) => void;
type PropWriter = (item: Item, propName: string, value: string) => void;
type RuntimeTraceEntry = {
  id: string;
  time: string;
  itemId: string;
  itemName: string;
  eventName: EventName;
  commandName: string;
  status: "running" | "success" | "error";
  args?: Record<string, unknown>;
  result?: string;
  message?: string;
  patch?: StateValues;
  error?: string;
};
type BackendProbeResult = {
  id: string;
  name: string;
  kind: string;
  language: string;
  transport: string;
  status: "ready" | "skipped" | "timeout" | "error" | string;
  message: string;
  durationMs?: number;
  exitCode?: number | null;
  stdout?: string;
  stderr?: string;
  resourcePath?: string;
};
type BackendRuntimeStatus = {
  id: string;
  name: string;
  kind: string;
  transport: string;
  status: "running" | "stopped" | "exited" | "skipped" | "error" | string;
  pid?: number | null;
  startedAtMs?: number | null;
  message: string;
  resourcePath?: string;
  logPath?: string;
};
type BackendRuntimeLogResult = {
  success: boolean;
  message: string;
  logPath?: string;
  content?: string;
  truncated?: boolean;
  lengthBytes?: number;
};
type BackendRuntimeLogPreview = {
  loading: boolean;
  message: string;
  content: string;
  error: boolean;
  truncated?: boolean;
  lengthBytes?: number;
  logPath?: string;
};

const projectAssets = ((project as unknown as { assets?: readonly ProjectAsset[] }).assets ?? []) as readonly ProjectAsset[];
const projectStateVariables = ((project as unknown as { stateVariables?: readonly ProjectStateVariable[] }).stateVariables ?? []) as readonly ProjectStateVariable[];
const projectReleaseConfig = ((project as unknown as { releaseConfig?: RuntimeReleaseConfig }).releaseConfig ?? {}) as RuntimeReleaseConfig;
const commandBindings = rustCommandBindings as Record<string, string>;
const commandSchemas = rustCommandSchemas as Record<string, CommandSchema>;
const defaultEventPayloadFields: EventPayloadField[] = ["event", "itemId", "itemName", "value"];
const breakpointSizes: Record<BreakpointId, { width: number; height: number }> = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 1024, height: 768 },
  mobile: { width: 390, height: 844 },
};

function breakpointForWindow(width: number): BreakpointId {
  if (width <= 600) {
    return "mobile";
  }
  if (width <= 1100) {
    return "tablet";
  }
  return "desktop";
}

function useResponsiveBreakpoint() {
  const [width, setWidth] = useState(typeof window === "undefined" ? 1440 : window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return breakpointForWindow(width);
}

function pageForBreakpoint(page: { width?: number; height?: number }, breakpoint: BreakpointId) {
  if (breakpoint === "desktop") {
    return { width: Number(page.width ?? breakpointSizes.desktop.width), height: Number(page.height ?? breakpointSizes.desktop.height) };
  }
  return breakpointSizes[breakpoint];
}

function resolveItemForBreakpoint(item: Item, breakpoint: BreakpointId): Item {
  if (breakpoint === "desktop") {
    return item;
  }
  const override = item.responsive?.[breakpoint];
  if (!override) {
    return item;
  }
  return {
    ...item,
    x: typeof override.x === "number" ? override.x : item.x,
    y: typeof override.y === "number" ? override.y : item.y,
    width: typeof override.width === "number" ? override.width : item.width,
    height: typeof override.height === "number" ? override.height : item.height,
  };
}

function resolveItemsForBreakpoint(items: Item[], breakpoint: BreakpointId) {
  return items.map((item) => resolveItemForBreakpoint(item, breakpoint));
}

function assetSrc(props: ItemProps) {
  const assetId = String(props.assetId ?? "");
  const asset = projectAssets.find((candidate) => candidate.id === assetId);
  const publicPath = String(props.assetPath || asset?.publicPath || "");
  return publicPath ? `/${publicPath.replace(/^\/+/, "")}` : "";
}

function eventFeedbackKey(itemId: string, eventName: EventName) {
  return `${itemId}:${eventName}`;
}

function eventBinding(props: ItemProps, eventName: EventName): EventBinding {
  return props.events?.[eventName] ?? (eventName === "click" && props.actionCommandId ? { commandId: props.actionCommandId } : {});
}

function eventCommandName(props: ItemProps, eventName: EventName) {
  const commandId = String(eventBinding(props, eventName).commandId ?? "");
  return commandId ? commandBindings[commandId] ?? "" : "";
}

function createInitialStateValues(): StateValues {
  return Object.fromEntries(projectStateVariables.map((state) => [state.id, String(state.initialValue ?? "")]));
}

function statePatchFromRecord(value: unknown): StateValues {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const stateByName = new Map(projectStateVariables.map((state) => [state.name, state.id]));
  const stateIds = new Set(projectStateVariables.map((state) => state.id));
  const patch: StateValues = {};
  for (const [key, patchValue] of Object.entries(value as Record<string, unknown>)) {
    const stateId = stateIds.has(key) ? key : stateByName.get(key);
    if (stateId) {
      patch[stateId] = String(patchValue ?? "");
    }
  }
  return patch;
}

function statePatchFromJson(result: string): StateValues {
  try {
    return statePatchFromRecord(JSON.parse(result));
  } catch {
    return {};
  }
}

function valueAtPath(value: unknown, path = "") {
  if (!path.trim()) {
    return value;
  }
  return path.split(".").filter(Boolean).reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    return (current as Record<string, unknown>)[segment];
  }, value);
}

function stringResult(value: unknown, fallback: string) {
  if (typeof value === "string") {
    return value;
  }
  if (value === undefined || value === null) {
    return fallback;
  }
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function traceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowLabel() {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

type WindowAction = "minimize" | "toggleMaximize" | "close";

const TITLEBAR_INTERACTIVE_SELECTOR = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "[role='button']",
  "[contenteditable='true']",
].join(",");

function isTitlebarInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest(TITLEBAR_INTERACTIVE_SELECTOR));
}

async function runWindowAction(action: WindowAction) {
  try {
    const appWindow = getCurrentWindow();
    if (action === "minimize") {
      await appWindow.minimize();
    }
    if (action === "toggleMaximize") {
      await appWindow.toggleMaximize();
    }
    if (action === "close") {
      await appWindow.close();
    }
  } catch {
    // Browser preview fallback.
  }
}

function startWindowDrag(event: ReactPointerEvent<HTMLElement>) {
  if (event.button !== 0 || isTitlebarInteractiveTarget(event.target)) {
    return;
  }
  void getCurrentWindow().startDragging().catch(() => {
    // Browser preview fallback.
  });
}

function NovaWindowTitlebar({ title, subtitle, status }: { title: string; subtitle: string; status: string }) {
  return (
    <div
      className="window-titlebar"
      data-tauri-drag-region=""
      onPointerDown={startWindowDrag}
      onDoubleClick={(event) => {
        if (!isTitlebarInteractiveTarget(event.target)) {
          void runWindowAction("toggleMaximize");
        }
      }}
    >
      <div className="titlebar-brand">
        <span className="titlebar-mark" aria-hidden>N</span>
        <span className="titlebar-title">{title}</span>
        {subtitle ? <span className="titlebar-subtitle">{subtitle}</span> : null}
      </div>
      <span className="titlebar-status">{status}</span>
      <div className="window-controls" data-titlebar-interactive="true">
        <button type="button" aria-label="Minimize window" onClick={() => void runWindowAction("minimize")}>_</button>
        <button type="button" aria-label="Maximize or restore window" onClick={() => void runWindowAction("toggleMaximize")}>[]</button>
        <button type="button" aria-label="Close window" className="window-close" onClick={() => void runWindowAction("close")}>X</button>
      </div>
    </div>
  );
}

function commandResultOutcome(result: string, binding: EventBinding) {
  const schema = commandSchemas[String(binding.commandId ?? "")]?.result;
  if (schema?.mode !== "json") {
    return {
      message: result,
      error: false,
      patch: binding.applyJsonStatePatch ? statePatchFromJson(result) : {},
    };
  }

  try {
    const parsed = JSON.parse(result) as Record<string, unknown>;
    const successValue = valueAtPath(parsed, schema.successPath || "success");
    const errorValue = valueAtPath(parsed, schema.errorPath || "error");
    const messageValue = valueAtPath(parsed, schema.messagePath || "message");
    const patchValue = valueAtPath(parsed, schema.statePatchPath || "patch");
    const hasError = successValue === false || Boolean(errorValue);
    return {
      message: stringResult(hasError ? errorValue ?? messageValue : messageValue, result),
      error: hasError,
      patch: hasError ? {} : statePatchFromRecord(patchValue),
    };
  } catch {
    return {
      message: result,
      error: true,
      patch: {},
    };
  }
}

function selectedPayloadFields(binding: EventBinding): EventPayloadField[] {
  const validFields = new Set<EventPayloadField>(["event", "itemId", "itemName", "value", "checked", "state"]);
  const fields = (binding.payloadFields?.length ? binding.payloadFields : defaultEventPayloadFields).filter(
    (field): field is EventPayloadField => validFields.has(field as EventPayloadField),
  );
  return fields.length > 0 ? fields : defaultEventPayloadFields;
}

function stateSnapshot(stateValues: StateValues) {
  return Object.fromEntries(
    projectStateVariables.map((state) => [
      state.name || state.id,
      Object.prototype.hasOwnProperty.call(stateValues, state.id) ? stateValues[state.id] : String(state.initialValue ?? ""),
    ]),
  );
}

function eventPayload(
  item: Item,
  props: ItemProps,
  eventName: EventName,
  rawValue: unknown,
  binding: EventBinding,
  stateValues: StateValues,
) {
  const value = rawValue ?? props.value ?? props.label ?? "";
  const payload: Record<string, unknown> = {};
  for (const field of selectedPayloadFields(binding)) {
    if (field === "event") {
      payload.event = eventName;
    } else if (field === "itemId") {
      payload.itemId = item.id;
    } else if (field === "itemName") {
      payload.itemName = String(item.name ?? props.label ?? item.type);
    } else if (field === "value") {
      payload.value = value;
    } else if (field === "checked") {
      payload.checked = typeof rawValue === "boolean" ? rawValue : Boolean(props.checked);
    } else if (field === "state") {
      payload.state = stateSnapshot(stateValues);
    }
  }
  return payload;
}

function commandSourceValue(
  parameter: CommandParameterSchema,
  item: Item,
  props: ItemProps,
  eventName: EventName,
  rawValue: unknown,
  binding: EventBinding,
  stateValues: StateValues,
) {
  const value = rawValue ?? props.value ?? props.label ?? "";
  if (parameter.source === "checked") {
    return typeof rawValue === "boolean" ? rawValue : Boolean(props.checked);
  }
  if (parameter.source === "event") {
    return eventName;
  }
  if (parameter.source === "itemId") {
    return item.id;
  }
  if (parameter.source === "itemName") {
    return String(item.name ?? props.label ?? item.type);
  }
  if (parameter.source === "state") {
    return stateSnapshot(stateValues);
  }
  if (parameter.source === "payload") {
    return {
      event: eventName,
      itemId: item.id,
      itemName: String(item.name ?? props.label ?? item.type),
      value,
      checked: typeof rawValue === "boolean" ? rawValue : Boolean(props.checked),
      state: stateSnapshot(stateValues),
      selected: eventPayload(item, props, eventName, rawValue, binding, stateValues),
    };
  }
  return value;
}

function coerceCommandArg(type: CommandParameterType, value: unknown) {
  if (type === "bool") {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      return value === "true" || value === "1" || value === "on";
    }
    return Boolean(value);
  }
  if (type === "number") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (type === "json") {
    return value ?? null;
  }
  return typeof value === "string" ? value : JSON.stringify(value ?? "");
}

function commandArgs(
  item: Item,
  props: ItemProps,
  eventName: EventName,
  rawValue: unknown,
  binding: EventBinding,
  stateValues: StateValues,
) {
  const schema = commandSchemas[String(binding.commandId ?? "")];
  const parameters = schema?.parameters ?? [];
  if (parameters.length > 0) {
    return Object.fromEntries(
      parameters.map((parameter) => [
        parameter.name,
        coerceCommandArg(
          parameter.type,
          commandSourceValue(parameter, item, props, eventName, rawValue, binding, stateValues),
        ),
      ]),
    );
  }
  if (!binding.passValue) {
    return undefined;
  }
  if (binding.payloadMode === "json") {
    return { value: JSON.stringify(eventPayload(item, props, eventName, rawValue, binding, stateValues)) };
  }
  return { value: String(rawValue ?? props.value ?? "") };
}

function itemProps(item: Item, overrides: ItemPropOverrides, stateValues: StateValues): ItemProps {
  const base = { ...(item.props ?? {}), ...(overrides[item.id] ?? {}) } as ItemProps;
  for (const [propName, stateId] of Object.entries(base.stateBindings ?? {})) {
    if (stateId && Object.prototype.hasOwnProperty.call(stateValues, stateId)) {
      base[propName] = stateValues[stateId];
    }
  }
  return base;
}

function propNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.min(Math.max(safe, min), max);
}

function itemConstraints(item: Item) {
  return {
    left: item.props?.constraintLeft !== false,
    right: item.props?.constraintRight === true,
    top: item.props?.constraintTop !== false,
    bottom: item.props?.constraintBottom === true,
  };
}

function frameLayoutMode(item: Item): LayoutMode {
  const mode = item.props?.layoutMode;
  return mode === "row" || mode === "column" || mode === "grid" ? mode : "free";
}

function frameChildrenStyle(item: Item): CSSProperties {
  const mode = frameLayoutMode(item);
  if (mode === "free") {
    return {};
  }
  const gap = propNumber(item.props?.layoutGap, 12, 0, 80);
  const padding = propNumber(item.props?.layoutPadding, 16, 0, 80);
  if (mode === "row") {
    return { display: "flex", flexDirection: "row", alignItems: "flex-start", gap, padding, overflow: "auto" };
  }
  if (mode === "column") {
    return { display: "flex", flexDirection: "column", alignItems: "stretch", gap, padding, overflow: "auto" };
  }
  const columns = propNumber(item.props?.layoutColumns, 2, 1, 6);
  return { display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, alignContent: "flex-start", gap, padding, overflow: "auto" };
}

function nodeStyle(item: Item, parentLayout: LayoutMode, parentSize?: { width: number; height: number }): CSSProperties {
  if (parentLayout !== "free") {
    return { width: item.width, height: item.height, zIndex: item.z };
  }
  const constraints = itemConstraints(item);
  const bounds = parentSize ?? { width: item.x + item.width, height: item.y + item.height };
  const style: CSSProperties = { zIndex: item.z };
  if (constraints.left || !constraints.right) {
    style.left = item.x;
  }
  if (constraints.right) {
    style.right = bounds.width - item.x - item.width;
  }
  if (!constraints.right || !constraints.left) {
    style.width = item.width;
  }
  if (constraints.top || !constraints.bottom) {
    style.top = item.y;
  }
  if (constraints.bottom) {
    style.bottom = bounds.height - item.y - item.height;
  }
  if (!constraints.bottom || !constraints.top) {
    style.height = item.height;
  }
  return style;
}

function renderNode(
  item: Item,
  allItems: Item[],
  feedback: CommandFeedback,
  propOverrides: ItemPropOverrides,
  stateValues: StateValues,
  onRunCommand: CommandRunner,
  onWriteProp: PropWriter,
  parentLayout: LayoutMode = "free",
  parentSize?: { width: number; height: number },
) {
  return (
    <div
      key={item.id}
      className={parentLayout === "free" ? "node" : "node node-flow"}
      style={nodeStyle(item, parentLayout, parentSize)}
      data-nova-control-id={item.id}
      data-nova-control-type={item.type}
      data-nova-control-name={String(item.name ?? item.type)}
      data-nova-parent-id={item.parentId ?? ""}
    >
      {renderItem(item, allItems, feedback, propOverrides, stateValues, onRunCommand, onWriteProp)}
    </div>
  );
}

function renderItem(
  item: Item,
  allItems: Item[],
  feedback: CommandFeedback,
  propOverrides: ItemPropOverrides,
  stateValues: StateValues,
  onRunCommand: CommandRunner,
  onWriteProp: PropWriter,
) {
  const props = itemProps(item, propOverrides, stateValues);
  if (item.type === "frame") {
    const mode = frameLayoutMode(item);
    const children = allItems.filter((child) => child.parentId === item.id).sort((a, b) => a.z - b.z);
    return (
      <section className="card frame">
        <strong>{String(props.title ?? "Frame")}</strong>
        <p>{String(props.description ?? "")}</p>
        <div className={mode === "free" ? "frame-children" : "frame-children frame-children-auto"} style={frameChildrenStyle(item)}>
          {children.map((child) => renderNode(child, allItems, feedback, propOverrides, stateValues, onRunCommand, onWriteProp, mode, { width: item.width, height: item.height }))}
        </div>
      </section>
    );
  }
  if (item.type === "image") {
    const src = assetSrc(props);
    const fit = String(props.objectFit ?? "cover");
    return src ? <img className={`image image-${fit}`} src={src} alt={String(props.alt ?? props.label ?? "Project asset")} /> : <section className="card"><strong>No image asset</strong><p>Bind a project asset in Nova UI Editor.</p></section>;
  }
  if (item.type === "button") {
    const commandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "click")];
    const label = state?.loading ? "Running..." : String(props.label ?? "Button");
    return (
      <button
        className="button"
        type="button"
        title={commandName ? `Runs ${commandName}` : "No Rust command bound"}
        disabled={Boolean(state?.loading) || !commandName}
        onClick={commandName ? () => onRunCommand(item, "click") : undefined}
      >
        {label}
      </button>
    );
  }
  if (item.type === "input") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field"><span>{String(props.label ?? "Input")}</span><input value={String(props.value ?? "")} placeholder={String(props.placeholder ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</label>;
  }
  if (item.type === "textarea") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field"><span>{String(props.label ?? "Notes")}</span><textarea value={String(props.value ?? "")} placeholder={String(props.placeholder ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</label>;
  }
  if (item.type === "checkbox") {
    const commandName = eventCommandName(props, "change");
    return <label className="check"><input type="checkbox" defaultChecked={Boolean(props.checked)} onChange={commandName ? (event) => onRunCommand(item, "change", event.currentTarget.checked) : undefined} />{String(props.label ?? "Checkbox")}</label>;
  }
  if (item.type === "switch") {
    const commandName = eventCommandName(props, "change");
    return <div className="panel-row"><div><strong>{String(props.title ?? "Switch")}</strong><p>{String(props.description ?? "")}</p></div><input type="checkbox" defaultChecked={Boolean(props.checked)} onChange={commandName ? (event) => onRunCommand(item, "change", event.currentTarget.checked) : undefined} /></div>;
  }
  if (item.type === "select") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field"><span>{String(props.label ?? "Select")}</span><select value={String(props.value ?? props.optionA ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }}><option>{String(props.optionA ?? "Option A")}</option><option>{String(props.optionB ?? "Option B")}</option><option>{String(props.optionC ?? "Option C")}</option></select>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</label>;
  }
  if (item.type === "heading") {
    return <section><p className="eyebrow">{String(props.label ?? "")}</p><h1>{String(props.title ?? "Heading")}</h1><p>{String(props.description ?? "")}</p></section>;
  }
  if (item.type === "stat") {
    return <section className="card"><p>{String(props.label ?? "Metric")}</p><h2>{String(props.value ?? "0")}</h2><small>{String(props.helper ?? "")}</small></section>;
  }
  if (item.type === "table") {
    return <section className="card"><strong>{String(props.title ?? "Table")}</strong><table><tbody><tr><td>Desktop</td><td>Ready</td></tr><tr><td>Rust</td><td>Linked</td></tr></tbody></table></section>;
  }
  if (item.type === "divider") {
    return <hr />;
  }
  if (item.type === "badge") {
    return <span className="badge">{String(props.label ?? "Badge")}</span>;
  }
  return <section className="card"><strong>{String(props.title ?? "Card")}</strong><p>{String(props.description ?? "")}</p></section>;
}

function compactJson(value: unknown) {
  if (value === undefined) {
    return "";
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function upsertBackendRuntimeStatus(current: BackendRuntimeStatus[], next: BackendRuntimeStatus) {
  const index = current.findIndex((item) => item.id === next.id);
  if (index === -1) {
    return [next, ...current];
  }
  return current.map((item, itemIndex) => (itemIndex === index ? next : item));
}

function backendRuntimeContext(statuses: BackendRuntimeStatus[]) {
  const relevant = statuses.filter((status) => !["stopped", "skipped"].includes(status.status));
  if (relevant.length === 0) {
    return "";
  }
  return relevant
    .map((status) => {
      const pid = status.pid ? ` pid ${status.pid}` : "";
      const log = status.logPath ? ` log ${status.logPath}` : "";
      return `${status.name}: ${status.status}${pid}${log}`;
    })
    .join(" / ");
}

function withBackendRuntimeContext(message: string, statuses: BackendRuntimeStatus[]) {
  const context = backendRuntimeContext(statuses);
  return context ? `${message} · Backend runtime: ${context}` : message;
}

function RuntimeTracePanel({
  trace,
  stateValues,
  backendProbeResults,
  backendProbeLoading,
  backendRuntimeStatuses,
  backendRuntimeLogs,
  backendRuntimeLoading,
  onStartBackend,
  onStopBackend,
  onRefreshBackendRuntime,
  onPreviewBackendLog,
  onOpenBackendLog,
}: {
  trace: RuntimeTraceEntry[];
  stateValues: StateValues;
  backendProbeResults: BackendProbeResult[];
  backendProbeLoading: boolean;
  backendRuntimeStatuses: BackendRuntimeStatus[];
  backendRuntimeLogs: Record<string, BackendRuntimeLogPreview>;
  backendRuntimeLoading: boolean;
  onStartBackend: (integrationId: string) => void;
  onStopBackend: (integrationId: string) => void;
  onRefreshBackendRuntime: () => void;
  onPreviewBackendLog: (integrationId: string, logPath?: string) => void;
  onOpenBackendLog: (integrationId: string, logPath?: string) => void;
}) {
  return (
    <aside className="runtime-panel" aria-label="Runtime command trace">
      <div className="runtime-header">
        <div>
          <p className="eyebrow">Runtime Trace</p>
          <h2>Commands & State</h2>
        </div>
        <span>{trace.length} events</span>
      </div>
      <div className="backend-health">
        <div className="trace-title">
          <strong>Backend health</strong>
          <small>{backendProbeLoading || backendRuntimeLoading ? "checking" : `${backendProbeResults.length} integrations`}</small>
        </div>
        {backendProbeResults.length > 0 ? (
          backendProbeResults.map((result) => {
            const runtime = backendRuntimeStatuses.find((item) => item.id === result.id);
            const canManage = runtime && runtime.status !== "skipped";
            const running = runtime?.status === "running";
            const logPreview = backendRuntimeLogs[result.id];
            const canUseLog = Boolean(runtime?.logPath);
            return (
            <article key={result.id} className={`trace-entry trace-${result.status === "ready" || result.status === "skipped" ? "success" : "error"}`}>
              <div className="trace-title">
                <span>{result.name}</span>
                <small>{result.status}</small>
              </div>
              <p>{result.kind} / {result.transport} / health {Math.round(Number(result.durationMs ?? 0))} ms</p>
              <p>runtime {runtime?.status ?? "unknown"}{runtime?.pid ? ` / pid ${runtime.pid}` : ""}</p>
              {result.resourcePath ? <code>{result.resourcePath}</code> : null}
              {runtime?.logPath ? <code>log {runtime.logPath}</code> : null}
              {result.stdout ? <code>stdout {result.stdout}</code> : null}
              {result.stderr ? <code>stderr {result.stderr}</code> : null}
              <small className={result.status === "ready" || result.status === "skipped" ? "feedback" : "feedback feedback-error"}>{result.message}</small>
              {runtime?.message ? <small className={runtime.status === "error" ? "feedback feedback-error" : "feedback"}>{runtime.message}</small> : null}
              {logPreview ? <small className={logPreview.error ? "feedback feedback-error" : "feedback"}>{logPreview.message}</small> : null}
              {logPreview ? (
                <pre className={logPreview.error ? "backend-log-preview backend-log-error" : "backend-log-preview"}>
                  {logPreview.loading ? "Loading backend runtime log..." : logPreview.content || logPreview.message}
                </pre>
              ) : null}
              <div className="backend-actions">
                <button type="button" onClick={onRefreshBackendRuntime} disabled={backendRuntimeLoading}>
                  Refresh
                </button>
                <button type="button" onClick={() => onStartBackend(result.id)} disabled={!canManage || running || backendRuntimeLoading}>
                  Start
                </button>
                <button type="button" onClick={() => onStopBackend(result.id)} disabled={!canManage || !running || backendRuntimeLoading}>
                  Stop
                </button>
                <button type="button" onClick={() => onPreviewBackendLog(result.id, runtime?.logPath)} disabled={!canUseLog || Boolean(logPreview?.loading)}>
                  Preview log
                </button>
                <button type="button" onClick={() => onOpenBackendLog(result.id, runtime?.logPath)} disabled={!canUseLog || Boolean(logPreview?.loading)}>
                  Open log
                </button>
              </div>
            </article>
          );
          })
        ) : (
          <div className="trace-empty">
            <strong>{backendProbeLoading ? "Checking backend integrations" : "No backend probe configured"}</strong>
            <p>{backendProbeLoading ? "Nova is asking Rust for backend health." : "Rust-only generated apps do not need an external health probe."}</p>
          </div>
        )}
      </div>
      <div className="state-snapshot">
        <strong>State snapshot</strong>
        {projectStateVariables.length > 0 ? (
          <dl>
            {projectStateVariables.map((state) => (
              <div key={state.id}>
                <dt>{state.name || state.id}</dt>
                <dd>{stateValues[state.id] ?? String(state.initialValue ?? "")}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p>No project state variables.</p>
        )}
      </div>
      <div className="trace-list">
        {trace.length > 0 ? (
          trace.map((entry) => (
            <article key={entry.id} className={`trace-entry trace-${entry.status}`}>
              <div className="trace-title">
                <span>{`${entry.eventName} -> ${entry.commandName}`}</span>
                <small>{entry.time}</small>
              </div>
              <p>{entry.itemName} / {entry.itemId}</p>
              {entry.args ? <code>args {compactJson(entry.args)}</code> : null}
              {entry.patch && Object.keys(entry.patch).length > 0 ? <code>patch {compactJson(entry.patch)}</code> : null}
              {entry.message ? <small className={entry.status === "error" ? "feedback feedback-error" : "feedback"}>{entry.message}</small> : null}
            </article>
          ))
        ) : (
          <div className="trace-empty">
            <strong>No command events yet</strong>
            <p>Interact with a bound control to inspect invoke args, Rust results, and state patches.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

export function App() {
  const activeFile = useMemo(() => {
    const files = Array.isArray(project.files) ? project.files : [];
    return files.find((file) => file.id === project.activeFileId) ?? files[0];
  }, []);
  const commandName = registeredRustCommands[0] ?? "app_message";
  const [message, setMessage] = useState("Rust logic not invoked yet");
  const [commandFeedback, setCommandFeedback] = useState<CommandFeedback>({});
  const [itemPropOverrides, setItemPropOverrides] = useState<ItemPropOverrides>({});
  const [stateValues, setStateValues] = useState<StateValues>(() => createInitialStateValues());
  const [runtimeTrace, setRuntimeTrace] = useState<RuntimeTraceEntry[]>([]);
  const [backendProbeResults, setBackendProbeResults] = useState<BackendProbeResult[]>([]);
  const [backendProbeLoading, setBackendProbeLoading] = useState(Boolean(backendIntegrationProbeCommand));
  const [backendRuntimeStatuses, setBackendRuntimeStatuses] = useState<BackendRuntimeStatus[]>([]);
  const [backendRuntimeLogs, setBackendRuntimeLogs] = useState<Record<string, BackendRuntimeLogPreview>>({});
  const [backendRuntimeLoading, setBackendRuntimeLoading] = useState(Boolean(backendIntegrationRuntimeStatusCommand));
  const breakpoint = useResponsiveBreakpoint();

  useEffect(() => {
    invoke<string>(commandName)
      .then(setMessage)
      .catch((error) => setMessage(String(error)));
  }, [commandName]);

  useEffect(() => {
    if (!backendIntegrationProbeCommand) {
      setBackendProbeLoading(false);
      return;
    }
    setBackendProbeLoading(true);
    invoke<BackendProbeResult[]>(backendIntegrationProbeCommand)
      .then((results) => setBackendProbeResults(Array.isArray(results) ? results : []))
      .catch((error) =>
        setBackendProbeResults([
          {
            id: "backend-probe",
            name: "Backend health probe",
            kind: "probe",
            language: "rust",
            transport: "tauri-invoke",
            status: "error",
            message: String(error),
          },
        ]),
      )
      .finally(() => setBackendProbeLoading(false));
  }, []);

  const refreshBackendRuntime = useCallback(() => {
    if (!backendIntegrationRuntimeStatusCommand) {
      setBackendRuntimeLoading(false);
      return;
    }
    setBackendRuntimeLoading(true);
    invoke<BackendRuntimeStatus[]>(backendIntegrationRuntimeStatusCommand)
      .then((results) => setBackendRuntimeStatuses(Array.isArray(results) ? results : []))
      .catch((error) =>
        setBackendRuntimeStatuses([
          {
            id: "backend-runtime",
            name: "Backend runtime",
            kind: "runtime",
            transport: "tauri-invoke",
            status: "error",
            message: String(error),
          },
        ]),
      )
      .finally(() => setBackendRuntimeLoading(false));
  }, []);

  useEffect(() => {
    refreshBackendRuntime();
  }, [refreshBackendRuntime]);

  const startBackend = useCallback((integrationId: string) => {
    if (!backendIntegrationStartCommand) {
      return;
    }
    setBackendRuntimeLoading(true);
    invoke<BackendRuntimeStatus>(backendIntegrationStartCommand, { integrationId })
      .then((result) => setBackendRuntimeStatuses((current) => upsertBackendRuntimeStatus(current, result)))
      .catch((error) =>
        setBackendRuntimeStatuses((current) =>
          upsertBackendRuntimeStatus(current, {
            id: integrationId,
            name: integrationId,
            kind: "sidecar",
            transport: "tauri-invoke",
            status: "error",
            message: String(error),
          }),
        ),
      )
      .finally(() => {
        setBackendRuntimeLoading(false);
        refreshBackendRuntime();
      });
  }, [refreshBackendRuntime]);

  const stopBackend = useCallback((integrationId: string) => {
    if (!backendIntegrationStopCommand) {
      return;
    }
    setBackendRuntimeLoading(true);
    invoke<BackendRuntimeStatus>(backendIntegrationStopCommand, { integrationId })
      .then((result) => setBackendRuntimeStatuses((current) => upsertBackendRuntimeStatus(current, result)))
      .catch((error) =>
        setBackendRuntimeStatuses((current) =>
          upsertBackendRuntimeStatus(current, {
            id: integrationId,
            name: integrationId,
            kind: "sidecar",
            transport: "tauri-invoke",
            status: "error",
            message: String(error),
          }),
        ),
      )
      .finally(() => {
        setBackendRuntimeLoading(false);
        refreshBackendRuntime();
      });
  }, [refreshBackendRuntime]);

  const previewBackendLog = useCallback((integrationId: string, logPath?: string) => {
    if (!backendIntegrationReadLogCommand || !logPath) {
      return;
    }
    setBackendRuntimeLogs((current) => ({
      ...current,
      [integrationId]: {
        ...(current[integrationId] ?? { content: "", message: "" }),
        loading: true,
        error: false,
        message: "Loading backend runtime log...",
        logPath,
      },
    }));
    invoke<BackendRuntimeLogResult>(backendIntegrationReadLogCommand, { logPath })
      .then((result) => {
        setBackendRuntimeLogs((current) => ({
          ...current,
          [integrationId]: {
            loading: false,
            error: !result.success,
            message: result.message,
            content: result.content ?? "",
            truncated: result.truncated,
            lengthBytes: result.lengthBytes,
            logPath: result.logPath ?? logPath,
          },
        }));
      })
      .catch((error) => {
        setBackendRuntimeLogs((current) => ({
          ...current,
          [integrationId]: {
            loading: false,
            error: true,
            message: String(error),
            content: "",
            logPath,
          },
        }));
      });
  }, []);

  const openBackendLog = useCallback((integrationId: string, logPath?: string) => {
    if (!backendIntegrationOpenLogCommand || !logPath) {
      return;
    }
    invoke<BackendRuntimeLogResult>(backendIntegrationOpenLogCommand, { logPath })
      .then((result) => {
        setBackendRuntimeLogs((current) => ({
          ...current,
          [integrationId]: {
            ...(current[integrationId] ?? { content: "" }),
            loading: false,
            error: !result.success,
            message: result.message,
            logPath: result.logPath ?? logPath,
          },
        }));
      })
      .catch((error) => {
        setBackendRuntimeLogs((current) => ({
          ...current,
          [integrationId]: {
            ...(current[integrationId] ?? { content: "" }),
            loading: false,
            error: true,
            message: String(error),
            logPath,
          },
        }));
      });
  }, []);

  const writeProp = useCallback<PropWriter>((item, propName, value) => {
    const stateId = item.props?.stateBindings?.[propName as keyof NonNullable<ItemProps["stateBindings"]>];
    if (stateId) {
      setStateValues((current) => ({
        ...current,
        [stateId]: value,
      }));
    }
    setItemPropOverrides((current) => ({
      ...current,
      [item.id]: {
        ...(current[item.id] ?? {}),
        [propName]: value,
      },
    }));
  }, []);

  const runCommand = useCallback<CommandRunner>((item, eventName, rawValue) => {
    const props = itemProps(item, itemPropOverrides, stateValues);
    const binding = eventBinding(props, eventName);
    const nextCommandName = eventCommandName(props, eventName);
    if (!nextCommandName) {
      return;
    }
    const key = eventFeedbackKey(item.id, eventName);
    const args = commandArgs(item, props, eventName, rawValue, binding, stateValues);
    const entryId = traceId();
    setRuntimeTrace((current) => [
      {
        id: entryId,
        time: nowLabel(),
        itemId: item.id,
        itemName: String(item.name ?? props.label ?? item.type),
        eventName,
        commandName: nextCommandName,
        status: "running" as const,
        args: args as Record<string, unknown> | undefined,
      },
      ...current,
    ].slice(0, 8));
    setCommandFeedback((current) => ({
      ...current,
      [key]: { loading: true, message: "", error: false },
    }));
    setMessage(`${eventName} -> ${nextCommandName}: running...`);
    invoke<string>(nextCommandName, args)
      .then((result) => {
        const rawOutcome = commandResultOutcome(result, binding);
        const outcome = rawOutcome.error
          ? { ...rawOutcome, message: withBackendRuntimeContext(rawOutcome.message, backendRuntimeStatuses) }
          : rawOutcome;
        setRuntimeTrace((current) =>
          current.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  time: nowLabel(),
                  status: outcome.error ? "error" : "success",
                  result,
                  message: outcome.message,
                  patch: outcome.patch,
                  error: outcome.error ? outcome.message : undefined,
                }
              : entry,
          ),
        );
        setCommandFeedback((current) => ({
          ...current,
          [key]: { loading: false, message: outcome.message, error: outcome.error },
        }));
        if (Object.keys(outcome.patch).length > 0) {
          setStateValues((current) => ({
            ...current,
            ...outcome.patch,
          }));
        }
        if (!outcome.error && binding.resultTargetItemId && binding.resultTargetProp) {
          setItemPropOverrides((current) => ({
            ...current,
            [binding.resultTargetItemId!]: {
              ...(current[binding.resultTargetItemId!] ?? {}),
              [binding.resultTargetProp!]: outcome.message,
            },
          }));
        }
        if (!outcome.error && binding.resultStateId) {
          setStateValues((current) => ({
            ...current,
            [binding.resultStateId!]: outcome.message,
          }));
        }
        setMessage(`${eventName} -> ${nextCommandName}: ${outcome.message}`);
      })
      .catch((error) => {
        const message = withBackendRuntimeContext(String(error), backendRuntimeStatuses);
        setRuntimeTrace((current) =>
          current.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  time: nowLabel(),
                  status: "error",
                  message,
                  error: message,
                }
              : entry,
          ),
        );
        setCommandFeedback((current) => ({
          ...current,
          [key]: { loading: false, message, error: true },
        }));
        setMessage(`${eventName} -> ${nextCommandName}: ${message}`);
      });
  }, [backendRuntimeStatuses, itemPropOverrides, stateValues]);

  const basePage = activeFile?.page ?? { title: project.name, width: 1200, height: 800 };
  const page = { ...basePage, ...pageForBreakpoint(basePage, breakpoint) };
  const items = resolveItemsForBreakpoint([...(activeFile?.items ?? [])].sort((a, b) => a.z - b.z) as Item[], breakpoint);
  const topLevelItems = items.filter((item) => !item.parentId);
  const rawWindowKind = projectReleaseConfig.windowKind ?? "main";
  const windowKind = rawWindowKind === "dialog" || rawWindowKind === "tool" || rawWindowKind === "frameless" ? rawWindowKind : "main";
  const rawTitlebarStyle = projectReleaseConfig.titlebarStyle ?? "nova";
  const titlebarStyle = windowKind === "frameless" ? "hidden" : rawTitlebarStyle === "native" || rawTitlebarStyle === "hidden" ? rawTitlebarStyle : "nova";
  const windowTitle = String(projectReleaseConfig.windowTitle || page.title || projectReleaseConfig.appName || project.name || "Nova App");
  const titlebarSubtitle = String(projectReleaseConfig.titlebarSubtitle || "");
  const showRuntimePanel = projectReleaseConfig.showRuntimePanel === true;
  const statusText = message && message !== "Rust logic not invoked yet" ? message : `${items.length} controls / ${breakpoint}`;

  return (
    <main className={`app app-${windowKind} app-titlebar-${titlebarStyle}`}>
      {titlebarStyle === "nova" ? <NovaWindowTitlebar title={windowTitle} subtitle={titlebarSubtitle} status={statusText} /> : null}
      <div className="app-body">
        <div className="workspace" data-runtime-panel={showRuntimePanel ? "visible" : "hidden"}>
          <div className="canvas-viewport">
            <section className="canvas" style={{ width: page.width, height: page.height }}>
              {topLevelItems.map((item) => renderNode(item, items, commandFeedback, itemPropOverrides, stateValues, runCommand, writeProp, "free", { width: page.width, height: page.height }))}
            </section>
          </div>
          {showRuntimePanel ? (
            <RuntimeTracePanel
              trace={runtimeTrace}
              stateValues={stateValues}
              backendProbeResults={backendProbeResults}
              backendProbeLoading={backendProbeLoading}
              backendRuntimeStatuses={backendRuntimeStatuses}
              backendRuntimeLogs={backendRuntimeLogs}
              backendRuntimeLoading={backendRuntimeLoading}
              onStartBackend={startBackend}
              onStopBackend={stopBackend}
              onRefreshBackendRuntime={refreshBackendRuntime}
              onPreviewBackendLog={previewBackendLog}
              onOpenBackendLog={openBackendLog}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
"#
}

pub fn generated_styles() -> &'static str {
    r#":root {
  color: #1d1b20;
  background: #f8f7fb;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    linear-gradient(180deg, #fbfafc 0%, #f4f1f7 100%);
}

button,
input,
textarea,
select {
  font: inherit;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #1d1b20;
}

.window-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  height: 40px;
  flex: 0 0 auto;
  user-select: none;
  border-bottom: 1px solid #d8d2e4;
  background: rgb(255 251 255 / 0.94);
  padding: 0 10px 0 12px;
  color: #5f5a66;
  backdrop-filter: blur(18px);
}

.titlebar-brand {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
}

.titlebar-mark {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #e8def8;
  color: #4f378b;
  font-size: 12px;
}

.titlebar-title {
  max-width: 260px;
  overflow: hidden;
  color: #1d1b20;
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.titlebar-subtitle,
.titlebar-status {
  min-width: 0;
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.titlebar-status {
  justify-self: end;
  max-width: 34vw;
}

.window-controls {
  display: flex;
  align-items: center;
  gap: 2px;
}

.window-controls button {
  width: 34px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #49454f;
  cursor: pointer;
}

.window-controls button:hover {
  background: #f0edf4;
}

.window-controls .window-close:hover {
  background: #ba1a1a;
  color: white;
}

.app-body {
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
  padding: 18px;
}

.app-titlebar-native .app-body,
.app-titlebar-hidden .app-body {
  padding-top: 18px;
}

.app-frameless .app-body {
  padding: 0;
}

h1,
h2,
p {
  margin: 0;
}

.eyebrow {
  color: #6750a4;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workspace {
  display: grid;
  height: 100%;
  min-height: 0;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  gap: 18px;
}

.workspace[data-runtime-panel="visible"] {
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
}

.canvas-viewport {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: rgb(255 251 255 / 0.72);
  padding: 14px;
  box-shadow: 0 18px 46px rgb(31 28 38 / 0.1);
}

.app-frameless .canvas-viewport {
  border: 0;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}

.canvas {
  position: relative;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  box-shadow: 0 10px 30px rgb(31 28 38 / 0.08);
}

.runtime-panel {
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 56px);
  overflow: auto;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: rgb(255 255 255 / 0.94);
  padding: 14px;
  box-shadow: 0 14px 34px rgb(31 28 38 / 0.1);
}

.runtime-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.runtime-header h2 {
  font-size: 16px;
}

.runtime-header span {
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  padding: 4px 8px;
  color: #5f5a66;
  font-size: 11px;
}

.state-snapshot,
.backend-health,
.trace-entry,
.trace-empty {
  border: 1px solid #e7e0ec;
  border-radius: 14px;
  background: #fbf8ff;
  padding: 10px;
}

.backend-health {
  display: grid;
  gap: 10px;
  margin-bottom: 10px;
}

.backend-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.backend-actions button {
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: white;
  padding: 6px 10px;
  color: #1d1b20;
  font-size: 12px;
  cursor: pointer;
}

.backend-actions button:disabled {
  color: #938f99;
  cursor: not-allowed;
}

.backend-log-preview {
  max-height: 180px;
  overflow: auto;
  margin: 8px 0 0;
  border: 1px solid #d8d2e4;
  border-radius: 10px;
  background: #1d1b20;
  color: #f8f7fb;
  padding: 9px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 11px;
  line-height: 1.5;
}

.backend-log-error {
  background: #fff3f3;
  color: #7d1b1b;
}

.state-snapshot {
  margin-bottom: 10px;
}

.state-snapshot strong,
.backend-health strong,
.trace-empty strong {
  font-size: 12px;
}

.state-snapshot dl {
  display: grid;
  gap: 6px;
  margin: 8px 0 0;
}

.state-snapshot div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.state-snapshot dt,
.state-snapshot dd,
.trace-entry p,
.trace-entry small,
.trace-empty p {
  margin: 0;
  color: #5f5a66;
  font-size: 11px;
}

.state-snapshot dd {
  max-width: 170px;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trace-list {
  display: grid;
  gap: 8px;
}

.trace-entry {
  display: grid;
  gap: 6px;
}

.trace-running {
  border-color: #c9b7ff;
}

.trace-success {
  border-color: #b7d8c7;
}

.trace-error {
  border-color: #efb8c8;
}

.trace-title {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  font-weight: 700;
}

.trace-title span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trace-entry code {
  display: block;
  max-height: 72px;
  overflow: auto;
  border-radius: 10px;
  background: #f0edf6;
  padding: 7px;
  color: #3b3542;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 10px;
  white-space: pre-wrap;
  word-break: break-word;
}

.node {
  position: absolute;
  overflow: hidden;
}

.node-flow {
  position: relative;
  flex: 0 0 auto;
}

.image {
  width: 100%;
  height: 100%;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: white;
  display: block;
}

.image-cover {
  object-fit: cover;
}

.image-contain {
  object-fit: contain;
}

.image-fill {
  object-fit: fill;
}

.button {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 999px;
  background: #6750a4;
  color: white;
  font-weight: 700;
}

.button:disabled {
  cursor: not-allowed;
  background: #8b8495;
  opacity: 0.72;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  height: 100%;
  color: #49454f;
  font-size: 13px;
}

.field input,
.field textarea,
.field select {
  min-height: 40px;
  width: 100%;
  flex: 1;
  border: 1px solid #d8d2e4;
  border-radius: 12px;
  background: white;
  padding: 10px 12px;
}

.feedback {
  color: #5f5a68;
  font-size: 11px;
}

.feedback-error {
  color: #b3261e;
}

.check,
.panel-row,
.card {
  display: flex;
  width: 100%;
  height: 100%;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: white;
  padding: 16px;
}

.check {
  align-items: center;
  gap: 10px;
}

.panel-row {
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.card {
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.frame {
  position: relative;
  overflow: hidden;
}

.frame-children {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.frame-children-auto {
  overflow: auto;
}

.badge {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  border-radius: 999px;
  background: #e8def8;
  color: #4f378b;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .runtime-panel {
    position: static;
    max-height: none;
  }
}
"#
}
