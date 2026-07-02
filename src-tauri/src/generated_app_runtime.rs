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

      const appShell = document.querySelector("[data-runtime-shell]");
      const runtimeViewport = document.querySelector("[data-runtime-surface='viewport']");
      const runtimeCanvas = document.querySelector("[data-runtime-surface='app-canvas']");
      const shell = appShell
        ? {
            runtimeShell: appShell.getAttribute("data-runtime-shell") || "",
            runtimeGrid: appShell.getAttribute("data-runtime-grid") || "",
            styleContract: appShell.getAttribute("data-runtime-style-contract") || "",
            designArtifacts: appShell.getAttribute("data-runtime-design-artifacts") || "",
            runtimeSurface: appShell.getAttribute("data-runtime-surface") || "",
            runtimeFrame: appShell.getAttribute("data-runtime-frame") || "",
            runtimeDensity: appShell.getAttribute("data-runtime-density") || "",
            runtimePlatform: appShell.getAttribute("data-runtime-platform") || "",
            runtimeGridPolicy: appShell.getAttribute("data-runtime-grid-policy") || "",
            windowKind: appShell.getAttribute("data-window-kind") || "",
            titlebarStyle: appShell.getAttribute("data-titlebar-style") || "",
            runtimeBackground: appShell.getAttribute("data-runtime-background") || "",
            hasRuntimeBodySurface: Boolean(document.querySelector("[data-runtime-body='nova-surface']")),
            hasRuntimeViewportSurface: Boolean(runtimeViewport),
            hasRuntimeCanvasSurface: Boolean(
              runtimeCanvas &&
              runtimeCanvas.getAttribute("data-runtime-design-grid") === "absent" &&
              runtimeCanvas.getAttribute("data-runtime-rulers") === "absent"
            ),
            hasNovaTitlebar: Boolean(document.querySelector(".window-titlebar[data-runtime-titlebar='nova'][data-titlebar-drag-shell]")),
            hasNovaTitlebarDragRegions: document.querySelectorAll(".window-titlebar [data-titlebar-drag-region][data-tauri-drag-region]").length >= 2,
            hasNovaTitlebarDragStrip: Boolean(document.querySelector(".window-titlebar [data-titlebar-drag-strip][data-titlebar-drag-hit-target='background']")),
            hasInteractiveTitlebarControls: Boolean(document.querySelector("[data-titlebar-interactive='true']")),
            hasNovaTitlebarMetadata: Boolean(document.querySelector(".window-titlebar[data-runtime-titlebar='nova'][data-window-kind][data-titlebar-style][data-titlebar-status]")),
            hasNovaTitlebarParity: Boolean(document.querySelector(".window-titlebar[data-runtime-titlebar='nova'][data-runtime-titlebar-parity='editor-shell'][data-runtime-titlebar-density='desktop']")),
            hasRuntimeTitlebarChip: Boolean(document.querySelector("[data-runtime-titlebar-chip='live-app']")),
            hasWindowControlMarkers: Boolean(
              document.querySelector("[data-window-control='minimize']") &&
              document.querySelector("[data-window-control='toggle-maximize']") &&
              document.querySelector("[data-window-control='close']")
            ),
            hasWindowControlsProtectedFromDrag: Array.from(document.querySelectorAll(".window-titlebar [data-window-control]")).every((control) =>
              control.hasAttribute("data-titlebar-interactive-control") && !control.closest("[data-titlebar-drag-region]")
            ),
            hasDesignGridArtifact: Boolean(document.querySelector(".canvas-grid,[data-design-grid],[data-builder-canvas-grid],.canvas-background-grid")),
            bounds: boundsFor(appShell),
          }
        : {
            runtimeShell: "",
            runtimeGrid: "",
            styleContract: "",
            designArtifacts: "",
            runtimeSurface: "",
            runtimeFrame: "",
            runtimeDensity: "",
            runtimePlatform: "",
            runtimeGridPolicy: "",
            windowKind: "",
            titlebarStyle: "",
            runtimeBackground: "",
            hasRuntimeBodySurface: false,
            hasRuntimeViewportSurface: false,
            hasRuntimeCanvasSurface: false,
            hasNovaTitlebar: false,
            hasNovaTitlebarDragRegions: false,
            hasNovaTitlebarDragStrip: false,
            hasInteractiveTitlebarControls: false,
            hasNovaTitlebarMetadata: false,
            hasNovaTitlebarParity: false,
            hasRuntimeTitlebarChip: false,
            hasWindowControlMarkers: false,
            hasWindowControlsProtectedFromDrag: false,
            hasDesignGridArtifact: Boolean(document.querySelector(".canvas-grid,[data-design-grid],[data-builder-canvas-grid],.canvas-background-grid")),
            bounds: null,
          };

      if (!appShell) {
        issue("error", "Runtime shell marker missing", "The generated app did not render the Nova runtime shell root marker.", null, null);
      }
      if (appShell && shell.runtimeGrid !== "off") {
        issue("error", "Runtime grid marker is not disabled", "Generated exe windows should render the application shell without editor design grid affordances.", null, shell.bounds);
      }
      if (appShell && shell.styleContract !== "nova-desktop-shell") {
        issue("error", "Runtime style contract missing", "Generated exe windows should declare the Nova desktop shell style contract.", null, shell.bounds);
      }
      if (appShell && shell.designArtifacts !== "none") {
        issue("error", "Runtime design artifacts marker is not disabled", "Generated exe windows should explicitly mark editor-only design artifacts as absent.", null, shell.bounds);
      }
      if (appShell && shell.runtimeFrame !== "nova-editor-parity") {
        issue("error", "Runtime frame parity marker missing", "Generated exe windows should declare that they use the Nova editor-parity desktop frame.", null, shell.bounds);
      }
      if (appShell && (shell.runtimeDensity !== "desktop" || shell.runtimePlatform !== "tauri")) {
        issue("warning", "Runtime desktop platform metadata incomplete", "Generated exe windows should expose desktop density and Tauri platform metadata for shell parity checks.", null, shell.bounds);
      }
      if (appShell && shell.runtimeGridPolicy !== "design-only") {
        issue("error", "Runtime grid policy marker missing", "Generated exe windows should declare that grid affordances are design-only and absent in runtime.", null, shell.bounds);
      }
      if (appShell && (!shell.hasRuntimeBodySurface || !shell.hasRuntimeViewportSurface || !shell.hasRuntimeCanvasSurface)) {
        issue("error", "Runtime app surface markers missing", "Generated exe windows should expose Nova body, viewport, and app canvas surface markers without design grid or ruler state.", null, shell.bounds);
      }
      if (shell.hasDesignGridArtifact) {
        issue("error", "Editor design grid rendered in runtime", "The generated app DOM contains editor-only design grid selectors.", null, shell.bounds);
      }
      if (appShell && (!shell.windowKind || !shell.titlebarStyle || !shell.runtimeShell)) {
        issue("warning", "Runtime shell metadata incomplete", "The generated app shell is missing window kind, titlebar style, or shell style metadata.", null, shell.bounds);
      }
      if (shell.titlebarStyle === "nova" && !shell.hasNovaTitlebar) {
        issue("error", "Nova titlebar missing", "The runtime shell requested the Nova titlebar but no draggable Nova titlebar was rendered.", null, shell.bounds);
      }
      if (shell.titlebarStyle === "nova" && (!shell.hasNovaTitlebarDragRegions || !shell.hasNovaTitlebarDragStrip)) {
        issue("error", "Nova titlebar drag regions missing", "The runtime shell requested the Nova titlebar but the drag strip or explicit drag hit regions are missing.", null, shell.bounds);
      }
      if (shell.titlebarStyle === "nova" && !shell.hasInteractiveTitlebarControls) {
        issue("error", "Nova titlebar controls missing", "The runtime shell requested the Nova titlebar but no interactive window controls were rendered.", null, shell.bounds);
      }
      if (shell.titlebarStyle === "nova" && !shell.hasNovaTitlebarMetadata) {
        issue("error", "Nova titlebar metadata missing", "The runtime shell requested the Nova titlebar but the titlebar does not expose window kind, style, and status metadata.", null, shell.bounds);
      }
      if (shell.titlebarStyle === "nova" && !shell.hasNovaTitlebarParity) {
        issue("error", "Nova titlebar parity marker missing", "The runtime shell requested the Nova titlebar but it is not marked as an editor-parity desktop titlebar.", null, shell.bounds);
      }
      if (shell.titlebarStyle === "nova" && !shell.hasRuntimeTitlebarChip) {
        issue("warning", "Nova runtime titlebar chip missing", "The runtime shell requested the Nova titlebar but the live runtime chip is missing.", null, shell.bounds);
      }
      if (shell.titlebarStyle === "nova" && !shell.hasWindowControlMarkers) {
        issue("error", "Nova window controls are not identifiable", "The runtime shell requested the Nova titlebar but minimize, maximize, and close controls do not expose stable markers.", null, shell.bounds);
      }
      if (shell.titlebarStyle === "nova" && !shell.hasWindowControlsProtectedFromDrag) {
        issue("error", "Nova window controls can start drag", "The runtime shell requested the Nova titlebar but window controls are not isolated from draggable regions.", null, shell.bounds);
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
        const intentionallyHidden = item.props?.visible === false || element.getAttribute("data-nova-visible") === "false";
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

        if (intentionallyHidden) {
          continue;
        }
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
        shell,
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
    r#"import { useCallback, useEffect, useMemo, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
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
  enabled?: boolean;
  visible?: boolean;
  readOnly?: boolean;
  tabIndex?: number;
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
type RuntimeWindowKind = "main" | "dialog" | "tool" | "frameless";
type RuntimeTitlebarStyle = "nova" | "native" | "hidden";
type RuntimePageBackground = "plain" | "soft";

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
const startupProbeCommandName =
  Object.entries(commandBindings).find(([commandId]) => (commandSchemas[commandId]?.parameters ?? []).length === 0)?.[1] ?? null;
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

function runtimeWindowKind(value: unknown): RuntimeWindowKind {
  return value === "dialog" || value === "tool" || value === "frameless" ? value : "main";
}

function runtimeTitlebarStyle(value: unknown, windowKind: RuntimeWindowKind): RuntimeTitlebarStyle {
  if (windowKind === "frameless") {
    return "hidden";
  }
  return value === "native" || value === "hidden" ? value : "nova";
}

function runtimePageBackground(value: unknown): RuntimePageBackground {
  return value === "soft" ? "soft" : "plain";
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
  "[role='menuitem']",
  "[data-titlebar-interactive='true']",
  "[data-titlebar-interactive-control]",
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

function startWindowDrag(event: ReactMouseEvent<HTMLElement>) {
  if (event.button !== 0 || event.detail > 1 || isTitlebarInteractiveTarget(event.target)) {
    return;
  }
  void getCurrentWindow().startDragging().catch(() => {
    // Browser preview fallback.
  });
}

function NovaWindowTitlebar({
  title,
  subtitle,
  status,
  windowKind,
  titlebarStyle,
}: {
  title: string;
  subtitle: string;
  status: string;
  windowKind: RuntimeWindowKind;
  titlebarStyle: RuntimeTitlebarStyle;
}) {
  return (
    <div
      className="window-titlebar"
      data-runtime-titlebar="nova"
      data-runtime-titlebar-parity="editor-shell"
      data-runtime-titlebar-density="desktop"
      data-titlebar-drag-shell=""
      data-window-kind={windowKind}
      data-titlebar-style={titlebarStyle}
      data-titlebar-status={status ? "active" : "idle"}
      onMouseDown={startWindowDrag}
      onDoubleClick={(event) => {
        if (!isTitlebarInteractiveTarget(event.target)) {
          void runWindowAction("toggleMaximize");
        }
      }}
    >
      <div
        aria-hidden="true"
        className="titlebar-hit-strip"
        data-tauri-drag-region=""
        data-titlebar-drag-region=""
        data-titlebar-drag-strip=""
        data-titlebar-drag-hit-target="background"
      />
      <div
        className="titlebar-drag-region"
        data-tauri-drag-region=""
        data-titlebar-drag-region=""
        data-titlebar-drag-hit-target="content"
      >
        <div className="titlebar-brand" data-tauri-drag-region="" data-titlebar-drag-region="" data-titlebar-drag-hit-target="brand">
          <span className="titlebar-mark" aria-hidden data-tauri-drag-region="">N</span>
          <span className="titlebar-title" data-tauri-drag-region="">{title}</span>
          {subtitle ? <span className="titlebar-subtitle" data-tauri-drag-region="">{subtitle}</span> : null}
          <span className="titlebar-runtime-chip" data-runtime-titlebar-chip="live-app" data-tauri-drag-region="">Runtime</span>
        </div>
        <span className="titlebar-status" data-tauri-drag-region="">{status}</span>
      </div>
      <div className="window-controls" data-titlebar-interactive="true">
        <button type="button" aria-label="Minimize window" data-titlebar-interactive-control="" data-window-control="minimize" onClick={() => void runWindowAction("minimize")}>
          <span aria-hidden className="window-control-icon window-minimize-icon" />
        </button>
        <button type="button" aria-label="Maximize or restore window" data-titlebar-interactive-control="" data-window-control="toggle-maximize" onClick={() => void runWindowAction("toggleMaximize")}>
          <span aria-hidden className="window-control-icon window-maximize-icon" />
        </button>
        <button type="button" aria-label="Close window" className="window-close" data-titlebar-interactive-control="" data-window-control="close" onClick={() => void runWindowAction("close")}>
          <span aria-hidden className="window-control-icon window-close-icon" />
        </button>
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

const runtimeInteractiveSelector = "button,input,textarea,select,a[href],[role='button'],[tabindex]";

function runtimeTabIndex(props: ItemProps) {
  const parsed = typeof props.tabIndex === "number" ? props.tabIndex : Number(props.tabIndex);
  return Number.isFinite(parsed) ? Math.round(propNumber(parsed, 0, -1, 999)) : undefined;
}

function runtimeItemState(props: ItemProps) {
  return {
    enabled: props.enabled !== false,
    visible: props.visible !== false,
    readOnly: props.readOnly === true,
  };
}

function optionTexts(props: ItemProps) {
  return [props.optionA, props.optionB, props.optionC].map((option) => String(option ?? "").trim()).filter(Boolean);
}

function percentValue(value: unknown, fallback = 50) {
  return propNumber(value, fallback, 0, 100);
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
  const props = itemProps(item, propOverrides, stateValues);
  const tabIndex = runtimeTabIndex(props);
  const runtimeState = runtimeItemState(props);
  const style: CSSProperties = {
    ...nodeStyle(item, parentLayout, parentSize),
    ...(runtimeState.visible ? {} : { display: "none" }),
  };
  return (
    <div
      key={item.id}
      className={parentLayout === "free" ? "node" : "node node-flow"}
      style={style}
      data-nova-control-id={item.id}
      data-nova-control-type={item.type}
      data-nova-control-name={String(item.name ?? item.type)}
      data-nova-parent-id={item.parentId ?? ""}
      data-nova-tab-index={tabIndex ?? undefined}
      data-nova-enabled={runtimeState.enabled ? "true" : "false"}
      data-nova-visible={runtimeState.visible ? "true" : "false"}
      data-nova-read-only={runtimeState.readOnly ? "true" : "false"}
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
  if (item.type === "group-box") {
    const rows = optionTexts(props);
    return <fieldset className="group-box"><legend>{String(props.title ?? "Group")}</legend><p>{String(props.description ?? "")}</p><div>{rows.map((row, index) => <label key={row}><span>{row}</span><i className={index === 2 ? "group-box-meter group-box-meter-active" : "group-box-meter"} /></label>)}</div></fieldset>;
  }
  if (item.type === "spacer") {
    return <div className="spacer"><span>↔</span><strong>{String(props.title ?? "Spacer")}</strong><small>{String(props.value ?? props.description ?? "stretch")}</small></div>;
  }
  if (item.type === "label") {
    return <div className="text-label"><strong>{String(props.label ?? "Label")}</strong>{props.description ? <small>{String(props.description)}</small> : null}</div>;
  }
  if (item.type === "link-label") {
    const commandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "click")];
    const label = state?.loading ? "Running..." : String(props.label ?? "Open link");
    const target = String(props.value ?? props.helper ?? '#');
    return <button type="button" className="link-label" title={target} disabled={Boolean(state?.loading)} onClick={commandName ? () => onRunCommand(item, "click", target) : undefined}><strong>{label}</strong>{props.description ? <small>{String(props.description)}</small> : null}<code>{target}</code></button>;
  }
  if (item.type === "text-browser") {
    const lines = String(props.value ?? props.description ?? "Read-only text").split(/\n+/).filter(Boolean);
    return <section className="text-browser"><header><strong>{String(props.title ?? "Text browser")}</strong><span>Read only</span></header><div>{lines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div></section>;
  }
  if (item.type === "help-viewer") {
    const commandName = eventCommandName(props, "click");
    const topics = optionTexts(props);
    const current = String(props.value ?? topics[0] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Help viewer")}</strong><small>{String(props.description ?? "")}</small></header><div className="tree-table-head"><span>Topic</span><span>Type</span><span>Key</span></div><div className="tree-table-body">{topics.map((topic, index) => <button key={topic} type="button" className={topic === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", topic); if (commandName) onRunCommand(item, "click", topic); }}><span>{index === 0 ? "▾" : "↳"} <b>{topic}</b></span><small>{index === 0 ? "Guide" : "Doc"}</small><em>{index === 1 ? "F1" : "Open"}</em></button>)}</div></section>;
  }
  if (item.type === "image") {
    const src = assetSrc(props);
    const fit = String(props.objectFit ?? "cover");
    return src ? <img className={`image image-${fit}`} src={src} alt={String(props.alt ?? props.label ?? "Project asset")} /> : <section className="card"><strong>No image asset</strong><p>Bind a project asset in Nova UI Editor.</p></section>;
  }
  if (item.type === "image-list") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="image-list"><header><span><strong>{String(props.title ?? "Image list")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></span><em>{String(props.helper ?? `${options.length} items`)}</em></header><div>{options.slice(0, 6).map((option, index) => <button key={`${option}-${index}`} type="button" className={option === current || (!current && index === 0) ? "image-list-item image-list-item-active" : "image-list-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span className={`image-list-thumb image-list-thumb-${(index % 3) + 1}`} /><strong>{option}</strong></button>)}</div><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "select") : undefined}>{String(props.label ?? "Select")}</button></section>;
  }
  if (item.type === "web-view") {
    const commandName = eventCommandName(props, "click");
    const pages = optionTexts(props);
    const current = String(props.value ?? pages[0] ?? "about:blank");
    return <section className="web-view"><header><span>{current}</span><button type="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "reload") : undefined}>{String(props.label ?? "Reload")}</button></header><main><aside>{pages.slice(0, 3).map((page, index) => <button key={page} type="button" className={page === current || (!current && index === 0) ? "web-tab web-tab-active" : "web-tab"} onClick={() => { onWriteProp(item, "value", page); if (commandName) onRunCommand(item, "click", page); }}>{page}</button>)}</aside><article><strong>{String(props.title ?? "Web view")}</strong><p>{String(props.description ?? "")}</p><span /><span /><i /></article></main><footer>DOM ready · sandboxed preview</footer></section>;
  }
  if (item.type === "media-player") {
    const commandName = eventCommandName(props, "click");
    const chapters = optionTexts(props);
    const progress = percentValue(props.value, 42);
    return <section className="media-player"><div className="media-screen"><span><strong>{String(props.title ?? "Media player")}</strong><small>{String(props.description ?? "")}</small></span><button type="button" className="media-play" aria-label={String(props.label ?? "Play")} onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "play") : undefined}>▶</button></div><footer><div className="media-controls"><button type="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "play") : undefined}>▶</button><span className="media-track"><i style={{ width: `${progress}%` }} /></span><small>{String(props.helper ?? `${progress}%`)}</small></div><div className="media-chapters">{chapters.slice(0, 3).map((chapter, index) => <button key={chapter} type="button" className={index === 0 ? "media-chip media-chip-active" : "media-chip"} onClick={() => { onWriteProp(item, "value", chapter); if (commandName) onRunCommand(item, "click", chapter); }}>{chapter}</button>)}</div></footer></section>;
  }
  if (item.type === "pdf-viewer") {
    const commandName = eventCommandName(props, "click");
    const sections = optionTexts(props);
    const current = String(props.value ?? "1 / 1");
    return <section className="pdf-viewer"><header><span><strong>{String(props.title ?? "PDF viewer")}</strong><small>{String(props.description ?? "")}</small></span><em>{current}</em><button type="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "fit-width") : undefined}>{String(props.label ?? "Fit width")}</button></header><main><aside>{sections.slice(0, 3).map((section, index) => <button key={section} type="button" className={index === 0 ? "pdf-page pdf-page-active" : "pdf-page"} onClick={() => { onWriteProp(item, "value", `${index + 1} / ${Math.max(sections.length, 1)}`); if (commandName) onRunCommand(item, "click", section); }}><i /><span>{section}</span></button>)}</aside><article><strong>{String(props.title ?? "Document")}</strong><span /><span /><div><p /><p /><p /><b /></div></article></main><footer><span>{String(props.helper ?? "Zoom 100%")}</span><span>{current}</span></footer></section>;
  }
  if (item.type === "map-view") {
    const commandName = eventCommandName(props, "click");
    const layers = optionTexts(props);
    return <section className="map-view"><header><span><strong>{String(props.title ?? "Map view")}</strong><small>{String(props.description ?? "")}</small></span><button type="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "locate") : undefined}>{String(props.label ?? "Locate")}</button></header><div className="map-canvas"><svg aria-hidden viewBox="0 0 500 300" preserveAspectRatio="none"><path d="M34 206 C96 154 132 168 184 126 C236 82 308 82 366 118 C416 150 442 132 482 84" /></svg>{layers.slice(0, 3).map((layer, index) => <button key={layer} type="button" className={`map-marker map-marker-${index + 1}`} onClick={() => { onWriteProp(item, "value", layer); if (commandName) onRunCommand(item, "click", layer); }}><i />{layer}</button>)}<aside><strong>{String(props.value ?? "31.2304, 121.4737")}</strong><small>{String(props.helper ?? "Zoom 14")}</small></aside></div></section>;
  }
  if (item.type === "graphics-view") {
    const commandName = eventCommandName(props, "click");
    const layers = optionTexts(props);
    const current = String(props.value ?? layers[0] ?? "100%");
    return <section className="graphics-view"><header><span><strong>{String(props.title ?? "Graphics view")}</strong><small>{String(props.description ?? "")}</small></span><em>{current}</em></header><div className="graphics-scene"><svg aria-hidden viewBox="0 0 480 260" preserveAspectRatio="none"><path d="M110 92 C180 52 252 58 326 112" /><path d="M148 172 C230 210 302 190 370 146" /></svg>{layers.slice(0, 3).map((layer, index) => <button key={`${layer}-${index}`} type="button" className={`graphics-node graphics-node-${index + 1}`} onClick={() => { onWriteProp(item, "value", layer); if (commandName) onRunCommand(item, "click", layer); }}><strong>{layer}</strong><span /></button>)}</div><footer>{layers.slice(0, 3).map((layer) => <small key={layer}>{layer}</small>)}</footer></section>;
  }
  if (item.type === "carousel") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="carousel">{options.map((option, index) => <button key={option} type="button" className={option === current ? "carousel-card carousel-card-active" : "carousel-card"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>{index + 1}</span><strong>{option}</strong><small>{index === 0 ? String(props.title ?? "Carousel") : String(props.description ?? "")}</small></button>)}</section>;
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
  if (item.type === "button-group") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    const runChange = (value: string) => {
      onWriteProp(item, "value", value);
      if (commandName) onRunCommand(item, "change", value);
    };
    return <div className="button-group" role="group" aria-label={String(props.label ?? "Button group")}>{options.slice(0, 5).map((option) => <button key={option} type="button" className={option === current ? "button-group-item button-group-item-active" : "button-group-item"} aria-pressed={option === current} disabled={Boolean(state?.loading)} onClick={() => runChange(option)}>{option}</button>)}</div>;
  }
  if (item.type === "dialog-button-box") {
    const commandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "click")];
    const options = optionTexts(props);
    const primaryLabel = String(props.label ?? options[options.length - 1] ?? "OK");
    const actions = options.length > 0 ? options : ["Cancel", "Apply", primaryLabel];
    const runAction = (action: string) => {
      onWriteProp(item, "helper", action);
      if (commandName) onRunCommand(item, "click", action);
    };
    return <div className="dialog-button-box" aria-label={String(props.helper ?? "Dialog actions")}>{actions.slice(0, 4).map((action, index) => { const primary = action === primaryLabel || index === actions.length - 1; return <button key={`${action}-${index}`} type="button" className={primary ? "dialog-button dialog-button-primary" : "dialog-button"} disabled={Boolean(state?.loading) || !commandName} onClick={() => runAction(action)}>{state?.loading && primary ? "Running..." : action}</button>; })}</div>;
  }
  if (item.type === "command-link-button") {
    const commandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "click")];
    const label = state?.loading ? "Running..." : String(props.label ?? "Continue");
    return <button type="button" className="command-link-button" disabled={Boolean(state?.loading) || !commandName} onClick={commandName ? () => onRunCommand(item, "click", label) : undefined}><span>→</span><strong>{String(props.title ?? label)}</strong><small>{String(props.description ?? props.helper ?? "")}</small><em>{label}</em></button>;
  }
  if (item.type === "menu-button") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? props.label ?? "Menu");
    const runMenuItem = (value: string) => {
      onWriteProp(item, "value", value);
      if (commandName) onRunCommand(item, "click", value);
    };
    return <div className="split-button menu-button"><button type="button" className="split-button-main" disabled={!commandName} onClick={commandName ? () => runMenuItem(current) : undefined}><span>☰</span><strong>{String(props.label ?? "Menu")}</strong><small>{current}</small></button><button type="button" className="split-button-menu" aria-label="Switch menu item" onClick={() => runMenuItem(options[(Math.max(0, options.indexOf(current)) + 1) % Math.max(1, options.length)] ?? current)}>⌄</button></div>;
  }
  if (item.type === "split-button") {
    const commandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "click")];
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    const label = state?.loading ? "Running..." : String(props.label ?? "Run");
    const nextOption = () => {
      const index = Math.max(0, options.indexOf(current));
      return options[(index + 1) % Math.max(1, options.length)] ?? current;
    };
    const runAction = (value: string) => {
      onWriteProp(item, "value", value);
      if (commandName) onRunCommand(item, "click", value);
    };
    return <div className={state?.loading ? "split-button split-button-loading" : "split-button"}><button type="button" className="split-button-main" title={commandName ? `Runs ${commandName}` : "No Rust command bound"} disabled={Boolean(state?.loading) || !commandName} onClick={commandName ? () => runAction(current) : undefined}><span>▶</span><strong>{label}</strong><small>{current || "Default"}</small></button><button type="button" className="split-button-menu" aria-label="Switch split button option" disabled={Boolean(state?.loading) || options.length === 0} onClick={() => runAction(nextOption())}>⌄</button></div>;
  }
  if (item.type === "tool-button") {
    const commandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "click")];
    const label = state?.loading ? "Running..." : String(props.label ?? "Tool");
    return <button type="button" className={props.variant === "destructive" ? "tool-button tool-button-danger" : "tool-button"} title={commandName ? `Runs ${commandName}` : "No Rust command bound"} disabled={Boolean(state?.loading) || !commandName} onClick={commandName ? () => onRunCommand(item, "click", label) : undefined}><span>◆</span><strong>{label}</strong></button>;
  }
  if (item.type === "toggle-button") {
    const commandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "click")];
    const active = Boolean(props.checked);
    const label = state?.loading ? "Running..." : String(props.label ?? "Toggle");
    const runToggle = () => {
      onWriteProp(item, "checked", String(!active));
      if (commandName) onRunCommand(item, "click", !active);
    };
    return <button type="button" className={active ? "tool-button toggle-button-active" : "tool-button"} aria-pressed={active} title={commandName ? `Runs ${commandName}` : "Toggle state"} disabled={Boolean(state?.loading)} onClick={runToggle}><span>{active ? "✓" : "○"}</span><strong>{label}</strong></button>;
  }
  if (item.type === "toggle-group") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="segmented toggle-group" aria-label={String(props.label ?? "Toggle group")}>{options.map((option, index) => { const active = option === current || (!current && index === 0); return <button key={option} type="button" className={active ? "segment segment-active" : "segment"} aria-pressed={active} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "change", option); }}>{option}</button>; })}</section>;
  }
  if (item.type === "icon-button") {
    const commandName = eventCommandName(props, "click");
    const label = String(props.label ?? "Action");
    const icon = label.toLowerCase().includes("save") || label.includes("保存") ? "💾" : label.toLowerCase().includes("run") || label.includes("运行") ? "▶" : "●";
    return <button type="button" className="icon-action-button" aria-label={label} title={label} onClick={commandName ? () => onRunCommand(item, "click", label) : undefined}>{icon}</button>;
  }
  if (item.type === "input") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field"><span>{String(props.label ?? "Input")}</span><input value={String(props.value ?? "")} placeholder={String(props.placeholder ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</label>;
  }
  if (item.type === "password-field") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const visible = Boolean(props.checked);
    const current = String(props.value ?? "");
    return <label className="field password-field"><span>{String(props.label ?? "Password")}</span><div className="password-field-control"><span aria-hidden>🔒</span><input type={visible ? "text" : "password"} value={current} placeholder={String(props.placeholder ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} /><button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => onWriteProp(item, "checked", String(!visible))}>{visible ? "Hide" : "Show"}</button></div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "number-field") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const current = String(props.value ?? "");
    const numericValue = Number(current);
    const writeValue = (nextValue: string) => {
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    const stepValue = (delta: number) => {
      const nextValue = String(Number.isFinite(numericValue) ? numericValue + delta : delta);
      writeValue(nextValue);
    };
    return <label className="field number-field"><span>{String(props.label ?? "Number")}</span><div className="number-field-control"><button type="button" aria-label="Decrease value" onClick={() => stepValue(-1)}>-</button><input type="number" value={current} placeholder={String(props.placeholder ?? "")} onChange={(event) => writeValue(event.currentTarget.value)} /><button type="button" aria-label="Increase value" onClick={() => stepValue(1)}>+</button></div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "spin-box") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const current = String(props.value ?? "");
    const numericValue = Number(current);
    const writeValue = (nextValue: string) => {
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    const stepValue = (delta: number) => {
      const nextValue = String(Number.isFinite(numericValue) ? numericValue + delta : delta);
      writeValue(nextValue);
    };
    return <label className="field spin-box"><span>{String(props.label ?? "Spin box")}</span><div className="spin-box-control"><input type="number" value={current} placeholder={String(props.placeholder ?? "")} onChange={(event) => writeValue(event.currentTarget.value)} /><span><button type="button" aria-label="Increase value" onClick={() => stepValue(1)}>⌃</button><button type="button" aria-label="Decrease value" onClick={() => stepValue(-1)}>⌄</button></span></div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "double-spin-box") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const current = String(props.value ?? "");
    const numericValue = Number(current);
    const writeValue = (nextValue: string) => {
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    const stepValue = (delta: number) => {
      const nextValue = String(Number.isFinite(numericValue) ? Number((numericValue + delta).toFixed(2)) : delta);
      writeValue(nextValue);
    };
    return <label className="field spin-box double-spin-box"><span>{String(props.label ?? "Double spin box")}</span><div className="spin-box-control"><input type="number" step="0.1" value={current} placeholder={String(props.placeholder ?? "")} onChange={(event) => writeValue(event.currentTarget.value)} /><span><button type="button" aria-label="Increase value" onClick={() => stepValue(0.1)}>+0.1</button><button type="button" aria-label="Decrease value" onClick={() => stepValue(-0.1)}>-0.1</button></span></div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "dial") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const value = percentValue(props.value, 42);
    const writeValue = (nextValue: string | number) => {
      onWriteProp(item, "value", String(nextValue));
      if (commandName) onRunCommand(item, "change", String(nextValue));
    };
    const nextValue = () => (value + 10) % 110;
    const angle = -135 + value * 2.7;
    return <label className="dial"><span>{String(props.label ?? "Dial")}</span><button type="button" className="dial-face" onClick={() => writeValue(nextValue())}><i style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} /><strong>{value}</strong></button><input type="range" min="0" max="100" value={value} onChange={(event) => writeValue(event.currentTarget.value)} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "textarea") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field"><span>{String(props.label ?? "Notes")}</span><textarea value={String(props.value ?? "")} placeholder={String(props.placeholder ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</label>;
  }
  if (item.type === "plain-text-edit") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="plain-text-edit"><span>{String(props.label ?? "Plain text")}</span><textarea value={String(props.value ?? "")} placeholder={String(props.placeholder ?? "")} spellCheck={false} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "rich-text-editor") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <section className="rich-text-editor"><header><button type="button" aria-label="Bold">B</button><button type="button" aria-label="Italic"><i>I</i></button><button type="button" aria-label="Bulleted list">•</button><small>{String(props.label ?? "Rich text")}</small></header><textarea value={String(props.value ?? "")} placeholder={String(props.placeholder ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</section>;
  }
  if (item.type === "code-editor") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const value = String(props.value ?? "");
    const lineCount = Math.max(1, value.split(/\n/).length);
    return <section className="code-editor"><header><span>{String(props.title ?? "Code editor")}</span><em>{String(props.label ?? "Code")}</em>{props.readOnly ? <b>RO</b> : null}</header><div><pre aria-hidden>{Array.from({ length: Math.min(24, lineCount) }, (_, index) => <span key={index}>{index + 1}</span>)}</pre><textarea value={value} placeholder={String(props.placeholder ?? "")} readOnly={Boolean(props.readOnly)} spellCheck={false} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} /></div><footer><small className={state?.error ? "feedback feedback-error" : "feedback"}>{state?.message ?? String(props.helper ?? "Ln 1, Col 1")}</small><small>{String(props.description ?? "UTF-8 · LF")}</small></footer></section>;
  }
  if (item.type === "search-bar") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="search-bar"><span>⌕</span><input value={String(props.value ?? "")} aria-label={String(props.label ?? "Search")} placeholder={String(props.placeholder ?? "Search")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</label>;
  }
  if (item.type === "search-view") {
    const clickCommandName = eventCommandName(props, "click");
    const changeCommandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")] ?? feedback[eventFeedbackKey(item.id, "click")];
    const options = optionTexts(props);
    const query = String(props.helper ?? "");
    const current = String(props.value ?? options[0] ?? "");
    const normalizedQuery = query.trim().toLowerCase();
    const rows = normalizedQuery ? options.filter((option) => option.toLowerCase().includes(normalizedQuery)) : options;
    return <section className="command-list search-view"><header><strong>{String(props.title ?? "Search view")}</strong><small>{String(props.description ?? "Search files, commands, or records")}</small></header><label><span>⌕</span><input value={query} aria-label={String(props.label ?? "Search")} placeholder={String(props.placeholder ?? "Search")} onChange={(event) => { onWriteProp(item, "helper", event.currentTarget.value); if (changeCommandName) onRunCommand(item, "change", event.currentTarget.value); }} /></label><div className="command-list-results">{rows.length > 0 ? rows.map((option, index) => <button key={option} type="button" className={option === current ? "command-list-row command-list-row-active" : "command-list-row"} onClick={() => { onWriteProp(item, "value", option); if (clickCommandName) onRunCommand(item, "click", option); }}><span>{index + 1}</span><strong>{option}</strong><small>{option === current ? "Selected" : "Open"}</small></button>) : <div className="command-list-empty">No matching results</div>}</div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</section>;
  }
  if (item.type === "search-suggestion-list") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="command-list search-view"><header><strong>{String(props.title ?? "Search suggestions")}</strong><small>{String(props.description ?? props.placeholder ?? "")}</small></header><div className="command-list-results">{options.slice(0, 6).map((option, index) => <button key={option} type="button" className={option === current ? "command-list-row command-list-row-active" : "command-list-row"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>⌕</span><strong>{option}</strong><small>{index === 0 ? String(props.helper ?? "Recent") : "Suggestion"}</small></button>)}</div></section>;
  }
  if (item.type === "filter-bar") {
    const commandName = eventCommandName(props, "click");
    const filters = optionTexts(props);
    const current = String(props.value ?? filters[0] ?? "");
    return <section className="command-list"><label><span>⌕</span><input value={String(props.placeholder ?? props.title ?? "")} aria-label={String(props.label ?? "Filter")} readOnly /></label><div className="chip-set">{filters.map((filter) => <button key={filter} type="button" className={filter === current ? "chip chip-active" : "chip"} onClick={() => { onWriteProp(item, "value", filter); if (commandName) onRunCommand(item, "click", filter); }}>{filter}</button>)}</div><small>{String(props.helper ?? props.description ?? "")}</small></section>;
  }
  if (item.type === "tag-input") {
    const commandName = eventCommandName(props, "change");
    const tags = String(props.value ?? "").split(/[,\u3001/]+/).map((tag) => tag.trim()).filter(Boolean);
    const visibleTags = tags.length > 0 ? tags : optionTexts(props).slice(0, 3);
    const writeTags = (nextTags: string[]) => {
      const nextValue = nextTags.join(",");
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    return <section className="tag-input"><label><span>{String(props.label ?? "Tags")}</span><input value="" placeholder={String(props.placeholder ?? "Add tag")} onChange={(event) => event.currentTarget.value ? writeTags([...visibleTags, event.currentTarget.value]) : undefined} /></label><div className="chip-set">{visibleTags.map((tag) => <button key={tag} type="button" className="chip chip-active" onClick={() => writeTags(visibleTags.filter((candidate) => candidate !== tag))}>{tag}<span aria-hidden> ×</span></button>)}</div>{props.helper ? <small>{String(props.helper)}</small> : null}</section>;
  }
  if (item.type === "checkbox") {
    const commandName = eventCommandName(props, "change");
    return <label className="check"><input type="checkbox" defaultChecked={Boolean(props.checked)} onChange={commandName ? (event) => onRunCommand(item, "change", event.currentTarget.checked) : undefined} />{String(props.label ?? "Checkbox")}</label>;
  }
  if (item.type === "checkbox-group") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const selected = new Set(String(props.value ?? options[0] ?? "").split(/[,\u3001/]+/).map((part) => part.trim()).filter(Boolean));
    const writeGroup = (option: string, checked: boolean) => {
      const next = new Set(selected);
      if (checked) {
        next.add(option);
      } else {
        next.delete(option);
      }
      const nextValue = Array.from(next).join(",");
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    return <fieldset className="card checkbox-group"><strong>{String(props.label ?? "Checkbox group")}</strong>{props.helper ? <small>{String(props.helper)}</small> : null}{options.map((option, index) => { const active = selected.has(option) || (selected.size === 0 && index === 0); return <label key={option} className="check"><input type="checkbox" checked={active} onChange={(event) => writeGroup(option, event.currentTarget.checked)} />{option}</label>; })}</fieldset>;
  }
  if (item.type === "radio") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <fieldset className="card"><strong>{String(props.label ?? "Radio group")}</strong>{options.map((option) => <label key={option} className="check"><input type="radio" name={item.id} checked={option === current} onChange={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "change", option); }} />{option}</label>)}</fieldset>;
  }
  if (item.type === "radio-group") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <fieldset className="card radio-group"><strong>{String(props.label ?? "Radio group")}</strong>{props.helper ? <small>{String(props.helper)}</small> : null}{options.map((option, index) => { const active = option === current || (!current && index === 0); return <label key={option} className="check"><input type="radio" name={item.id} checked={active} onChange={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "change", option); }} />{option}</label>; })}</fieldset>;
  }
  if (item.type === "switch") {
    const commandName = eventCommandName(props, "change");
    return <div className="panel-row"><div><strong>{String(props.title ?? "Switch")}</strong><p>{String(props.description ?? "")}</p></div><input type="checkbox" defaultChecked={Boolean(props.checked)} onChange={commandName ? (event) => onRunCommand(item, "change", event.currentTarget.checked) : undefined} /></div>;
  }
  if (item.type === "slider") {
    const commandName = eventCommandName(props, "change");
    const value = percentValue(props.value, 50);
    return <label className="field"><span>{String(props.label ?? "Slider")} · {value}</span><input type="range" min="0" max="100" value={value} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "range-slider") {
    const commandName = eventCommandName(props, "change");
    const [rawStart, rawEnd] = String(props.value ?? "24,78").split(",");
    const start = Math.min(percentValue(rawStart, 24), percentValue(rawEnd, 78));
    const end = Math.max(percentValue(rawStart, 24), percentValue(rawEnd, 78));
    const writeRange = (nextStart: string | number, nextEnd: string | number) => {
      const safeStart = Math.min(Number(nextStart), Number(nextEnd));
      const safeEnd = Math.max(Number(nextStart), Number(nextEnd));
      const nextValue = `${safeStart},${safeEnd}`;
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    return <label className="range-slider"><span>{String(props.label ?? "Range")} · {start} - {end}</span><div><input aria-label="Minimum value" type="range" min="0" max="100" value={start} onChange={(event) => writeRange(event.currentTarget.value, end)} /><input aria-label="Maximum value" type="range" min="0" max="100" value={end} onChange={(event) => writeRange(start, event.currentTarget.value)} /><i style={{ left: `${start}%`, width: `${Math.max(end - start, 1)}%` }} /></div>{props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "rating") {
    const commandName = eventCommandName(props, "change");
    const current = Math.max(0, Math.min(5, Number.parseInt(String(props.value ?? "4"), 10) || 0));
    const writeRating = (nextValue: number) => {
      onWriteProp(item, "value", String(nextValue));
      if (commandName) onRunCommand(item, "change", String(nextValue));
    };
    return <section className="card rating-control"><strong>{String(props.label ?? "Rating")} · {current}/5</strong><div className="rating-stars">{Array.from({ length: 5 }, (_, index) => { const value = index + 1; const active = value <= current; return <button key={value} type="button" aria-label={`${value} stars`} className={active ? "rating-star rating-star-active" : "rating-star"} onClick={() => writeRating(value)}>{active ? "★" : "☆"}</button>; })}</div>{props.helper ? <small>{String(props.helper)}</small> : null}</section>;
  }
  if (item.type === "scroll-bar") {
    const commandName = eventCommandName(props, "change");
    const value = percentValue(props.value, 45);
    const writeValue = (nextValue: string | number) => {
      onWriteProp(item, "value", String(nextValue));
      if (commandName) onRunCommand(item, "change", String(nextValue));
    };
    return <label className="scroll-bar"><span>{String(props.label ?? "Scroll bar")} · {value}</span><div><button type="button" aria-label="Scroll left" onClick={() => writeValue(Math.max(0, value - 5))}>◀</button><input type="range" min="0" max="100" value={value} onChange={(event) => writeValue(event.currentTarget.value)} /><button type="button" aria-label="Scroll right" onClick={() => writeValue(Math.min(100, value + 5))}>▶</button></div>{props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "color-picker") {
    const commandName = eventCommandName(props, "change");
    const swatches = optionTexts(props);
    const current = String(props.value ?? swatches[0] ?? '#6750a4');
    return <section className="color-picker"><header><span>{String(props.label ?? "Color")}</span><code>{current}</code></header><div className="color-picker-body"><input type="color" value={current} aria-label={String(props.label ?? "Color")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{swatches.map((swatch) => <button key={swatch} type="button" className={swatch === current ? "color-swatch color-swatch-active" : "color-swatch"} style={{ backgroundColor: swatch }} aria-label={`Use ${swatch}`} onClick={() => { onWriteProp(item, "value", swatch); if (commandName) onRunCommand(item, "change", swatch); }} />)}</div>{props.helper ? <small>{String(props.helper)}</small> : null}</section>;
  }
  if (item.type === "color-swatch-grid") {
    const commandName = eventCommandName(props, "change");
    const swatches = optionTexts(props);
    const current = String(props.value ?? swatches[0] ?? '#6750a4');
    return <section className="color-picker"><header><span>{String(props.title ?? "Color swatches")}</span><code>{current}</code></header><div className="color-picker-body">{swatches.map((swatch, index) => <button key={swatch} type="button" className={swatch === current ? "color-swatch color-swatch-active" : "color-swatch"} style={{ backgroundColor: swatch }} aria-label={`Use ${swatch}`} onClick={() => { onWriteProp(item, "value", swatch); if (commandName) onRunCommand(item, "change", swatch); }}><span>{index === 0 ? "P" : index === 1 ? "S" : "E"}</span></button>)}</div>{props.helper ? <small>{String(props.helper)}</small> : null}</section>;
  }
  if (item.type === "file-picker") {
    const commandName = eventCommandName(props, "change");
    const current = String(props.value ?? "");
    return <label className="file-picker"><span>{String(props.label ?? "File")}</span><div><input value={current} placeholder={String(props.placeholder ?? "Select file")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} /><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "change", current) : undefined}>Browse</button></div>{props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "folder-picker") {
    const commandName = eventCommandName(props, "change");
    const current = String(props.value ?? "");
    return <label className="file-picker folder-picker"><span>{String(props.label ?? "Folder")}</span><div><input value={current} placeholder={String(props.placeholder ?? "Select folder")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} /><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "change", current) : undefined}>Browse</button></div>{props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "shortcut-recorder") {
    const commandName = eventCommandName(props, "change");
    const current = String(props.value ?? "Ctrl+R");
    const keys = current.split("+").map((key) => key.trim()).filter(Boolean);
    return <button type="button" className="shortcut-recorder" onClick={commandName ? () => onRunCommand(item, "change", current) : undefined}><span>{String(props.label ?? "Shortcut")}</span><div>{keys.map((key) => <kbd key={key}>{key}</kbd>)}<small>{String(props.helper ?? "Record shortcut")}</small></div></button>;
  }
  if (item.type === "select") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field"><span>{String(props.label ?? "Select")}</span><select value={String(props.value ?? props.optionA ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }}><option>{String(props.optionA ?? "Option A")}</option><option>{String(props.optionB ?? "Option B")}</option><option>{String(props.optionC ?? "Option C")}</option></select>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</label>;
  }
  if (item.type === "multi-select") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const selected = new Set(String(props.value ?? options[0] ?? "").split(/[,\u3001/]+/).map((part) => part.trim()).filter(Boolean));
    const writeMultiSelect = (option: string, checked: boolean) => {
      const next = new Set(selected);
      if (checked) {
        next.add(option);
      } else {
        next.delete(option);
      }
      const nextValue = Array.from(next).join(",");
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    return <fieldset className="card multi-select"><strong>{String(props.label ?? "Multi select")}</strong>{props.helper ? <small>{String(props.helper)}</small> : null}{options.map((option, index) => { const active = selected.has(option) || (selected.size === 0 && index === 0); return <label key={option} className="check"><input type="checkbox" checked={active} onChange={(event) => writeMultiSelect(option, event.currentTarget.checked)} />{option}</label>; })}</fieldset>;
  }
  if (item.type === "combobox") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const options = optionTexts(props);
    return <label className="field combobox"><span>{String(props.label ?? "Combobox")}</span><input list={`${item.id}-options`} value={String(props.value ?? "")} placeholder={String(props.placeholder ?? "Search")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} /><datalist id={`${item.id}-options`}>{options.map((option) => <option key={option} value={option} />)}</datalist>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</label>;
  }
  if (item.type === "autocomplete") {
    const changeCommandName = eventCommandName(props, "change");
    const clickCommandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "change")] ?? feedback[eventFeedbackKey(item.id, "click")];
    const options = optionTexts(props);
    const current = String(props.value ?? "");
    const normalizedQuery = current.trim().toLowerCase();
    const filteredOptions = normalizedQuery ? options.filter((option) => option.toLowerCase().includes(normalizedQuery)) : options;
    const visibleOptions = (filteredOptions.length > 0 ? filteredOptions : options).slice(0, 5);
    return <section className="autocomplete-field"><label><span>{String(props.label ?? "自动补全")}</span><input value={current} placeholder={String(props.placeholder ?? "输入关键字")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (changeCommandName) onRunCommand(item, "change", event.currentTarget.value); }} /></label><div className="autocomplete-options">{visibleOptions.length > 0 ? visibleOptions.map((option, index) => { const active = option === current || index === 0; return <button key={option} type="button" className={active ? "autocomplete-option autocomplete-option-active" : "autocomplete-option"} onClick={() => { onWriteProp(item, "value", option); if (clickCommandName) onRunCommand(item, "click", option); }}><span>{option}</span>{active ? <span aria-hidden>✓</span> : null}</button>; }) : <div className="autocomplete-empty">没有匹配项</div>}</div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</section>;
  }
  if (item.type === "font-combo-box") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "Inter");
    return <label className="field font-combo-box"><span>{String(props.label ?? "Font")}</span><select value={current} style={{ fontFamily: current }} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }}>{options.map((option) => <option key={option} value={option} style={{ fontFamily: option }}>{option}</option>)}</select></label>;
  }
  if (item.type === "date-picker") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field date-picker"><span>{String(props.label ?? "Date")}</span><input type="date" value={String(props.value ?? "")} placeholder={String(props.placeholder ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "date-range-picker") {
    const changeCommandName = eventCommandName(props, "change");
    const clickCommandName = eventCommandName(props, "click");
    const state = feedback[eventFeedbackKey(item.id, "change")] ?? feedback[eventFeedbackKey(item.id, "click")];
    const parts = String(props.value ?? "2026-07-01,2026-07-14").split(/[,\u2192]+/).map((part) => part.trim()).filter(Boolean);
    const start = parts[0] ?? "";
    const end = parts[1] ?? "";
    const writeRange = (nextStart: string, nextEnd: string) => {
      const nextValue = `${nextStart},${nextEnd}`;
      onWriteProp(item, "value", nextValue);
      if (changeCommandName) onRunCommand(item, "change", nextValue);
    };
    return <section className="date-range-picker"><header><strong>{String(props.label ?? "Date range")}</strong><small>{String(props.helper ?? props.placeholder ?? "")}</small></header><div className="date-range-fields"><label><span>Start</span><input type="date" value={start} onChange={(event) => writeRange(event.currentTarget.value, end)} /></label><label><span>End</span><input type="date" value={end} onChange={(event) => writeRange(start, event.currentTarget.value)} /></label></div><div className="date-range-presets">{optionTexts(props).map((option) => <button key={option} type="button" onClick={() => { onWriteProp(item, "helper", option); if (clickCommandName) onRunCommand(item, "click", option); }}>{option}</button>)}</div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : null}</section>;
  }
  if (item.type === "time-picker") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field time-picker"><span>{String(props.label ?? "Time")}</span><input type="time" value={String(props.value ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "date-time-picker") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    return <label className="field date-time-picker"><span>{String(props.label ?? "Date time")}</span><input type="datetime-local" value={String(props.value ?? "")} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} />{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</label>;
  }
  if (item.type === "calendar-widget") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const current = String(props.value ?? "2026-06-30");
    const selectedDay = Math.max(1, Math.min(31, Number(current.slice(-2)) || 30));
    const days = Array.from({ length: 35 }, (_, index) => ((index + 24) % 31) + 1);
    const writeValue = (day: number) => {
      const prefix = current.slice(0, 8) || "2026-06-";
      const nextValue = `${prefix}${String(day).padStart(2, "0")}`;
      onWriteProp(item, "value", nextValue);
      if (commandName) onRunCommand(item, "change", nextValue);
    };
    return <section className="calendar-widget"><header><strong>{String(props.label ?? "Calendar")}</strong><small>{current}</small></header><div className="calendar-weekdays">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="calendar-grid">{days.map((day, index) => <button key={`${day}-${index}`} type="button" className={day === selectedDay ? "calendar-day calendar-day-active" : "calendar-day"} onClick={() => writeValue(day)}>{day}</button>)}</div>{state?.message ? <small className={state.error ? "feedback feedback-error" : "feedback"}>{state.message}</small> : props.helper ? <small>{String(props.helper)}</small> : null}</section>;
  }
  if (item.type === "calendar-scheduler") {
    const commandName = eventCommandName(props, "click");
    const events = optionTexts(props);
    const current = String(props.value ?? "Wed");
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    return <section className="card timeline"><strong>{String(props.title ?? "Schedule")}</strong><p>{String(props.description ?? props.helper ?? "")}</p>{days.map((day, index) => { const active = current === day || (!current && index === 2); const eventName = events[index % Math.max(1, events.length)] ?? String(props.label ?? "Event"); return <button key={day} type="button" className={active ? "timeline-row timeline-row-active" : "timeline-row"} onClick={() => { onWriteProp(item, "value", day); if (commandName) onRunCommand(item, "click", day); }}><span className="timeline-rail"><i /><b /></span><strong>{day}</strong><small>{eventName}</small><em>{index + 9}:30</em></button>; })}</section>;
  }
  if (item.type === "segmented") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <div className="segmented">{options.map((option) => <button key={option} type="button" className={option === current ? "segment segment-active" : "segment"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "change", option); }}>{option}</button>)}</div>;
  }
  if (item.type === "chips") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <div className="chip-set">{options.map((option) => <button key={option} type="button" className={option === current ? "chip chip-active" : "chip"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button>)}</div>;
  }
  if (item.type === "assist-chip" || item.type === "filter-chip" || item.type === "input-chip" || item.type === "suggestion-chip") {
    const commandName = eventCommandName(props, item.type === "filter-chip" ? "change" : "click");
    const active = item.type === "filter-chip" ? Boolean(props.checked) : props.variant === "secondary";
    const icon = item.type === "assist-chip" ? "✦" : item.type === "filter-chip" ? "✓" : item.type === "input-chip" ? "×" : "★";
    const runChip = () => {
      if (item.type === "filter-chip") {
        const nextChecked = !active;
        onWriteProp(item, "checked", String(nextChecked));
        if (commandName) onRunCommand(item, "change", nextChecked);
        return;
      }
      if (commandName) onRunCommand(item, "click", props.value ?? props.label ?? "chip");
    };
    return <button type="button" className={active ? "chip chip-active md3-chip" : "chip md3-chip"} aria-pressed={item.type === "filter-chip" ? active : undefined} onClick={runChip}><span>{icon}</span>{String(props.label ?? props.value ?? "Chip")}{item.type === "input-chip" ? <em aria-hidden>×</em> : null}</button>;
  }
  if (item.type === "tabs") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="card"><div className="tab-row">{options.map((option) => <button key={option} type="button" className={option === current ? "button" : "button button-muted"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button>)}</div><p>{String(props.title ?? "Tabs")}</p></section>;
  }
  if (item.type === "menu-bar") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <nav className="menu-bar">{options.map((option) => <button key={option} type="button" className={option === current ? "menu-bar-item menu-bar-item-active" : "menu-bar-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button>)}<span>{String(props.description ?? props.title ?? "")}</span></nav>;
  }
  if (item.type === "ribbon-bar") {
    const commandName = eventCommandName(props, "click");
    const groups = optionTexts(props);
    const current = String(props.value ?? groups[0] ?? "");
    return <section className="card"><div className="tab-row">{groups.map((group) => <button key={group} type="button" className={group === current ? "button" : "button button-muted"} onClick={() => { onWriteProp(item, "value", group); if (commandName) onRunCommand(item, "click", group); }}>{group}</button>)}</div><p>{String(props.description ?? "Grouped desktop commands")}</p><div className="toolbar-actions">{groups.map((group, index) => <button key={`${group}-tool`} type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", group) : undefined}>{index === 1 ? String(props.label ?? group) : group}</button>)}</div></section>;
  }
  if (item.type === "menu") {
    const commandName = eventCommandName(props, "click");
    return <section className="card menu-card"><strong>{String(props.title ?? "Menu")}</strong><p>{String(props.description ?? "")}</p>{optionTexts(props).map((option) => <button key={option} type="button" className="menu-item" onClick={commandName ? () => onRunCommand(item, "click", option) : undefined}>{option}<span>⌘</span></button>)}</section>;
  }
  if (item.type === "context-menu") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="card menu-card"><strong>{String(props.title ?? "Context Menu")}</strong><p>{String(props.description ?? "")}</p>{options.map((option, index) => <button key={option} type="button" className={option === current ? "menu-item menu-item-active" : "menu-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}<span>{option === current ? "✓" : index === 0 ? "Enter" : ""}</span></button>)}</section>;
  }
  if (item.type === "list") {
    const commandName = eventCommandName(props, "click");
    return <section className="card"><strong>{String(props.title ?? "List")}</strong><p>{String(props.description ?? "")}</p>{optionTexts(props).map((option) => <button key={option} type="button" className="list-row" onClick={commandName ? () => onRunCommand(item, "click", option) : undefined}>{option}</button>)}</section>;
  }
  if (item.type === "list-item") {
    const commandName = eventCommandName(props, "click");
    return <button type="button" className="list-view-row list-view-row-active" onClick={commandName ? () => onRunCommand(item, "click", props.value ?? props.title ?? "list-item") : undefined}><span>{String(props.label ?? props.title ?? "I").slice(0, 1)}</span><strong>{String(props.title ?? props.label ?? "List item")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></button>;
  }
  if (item.type === "list-view") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="list-view"><header><span><strong>{String(props.title ?? "List view")}</strong><small>{String(props.description ?? "")}</small></span><em>Model</em></header><div className="list-view-body">{rows.slice(0, 8).map((row, index) => { const active = row === current || (!current && index === 0); return <button key={row} type="button" className={active ? "list-view-row list-view-row-active" : "list-view-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{index + 1}</span><strong>{row}</strong><small>{index === 2 ? "Rust module" : "UI resource"} · synced</small></button>; })}</div></section>;
  }
  if (item.type === "column-view") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[1] ?? rows[0] ?? "");
    const columns = [
      { title: "Project", rows: ["ui", "src", "assets"] },
      { title: "Resources", rows: rows.length > 0 ? rows : ["MainWindow.ui", "Settings.ui", "logic.rs"] },
      { title: "Details", rows: [current || "Settings.ui", "synced", "editable"] },
    ];
    return <section className="column-view"><header><span><strong>{String(props.title ?? "Column view")}</strong><small>{String(props.description ?? "")}</small></span><em>Path</em></header><div className="column-view-body">{columns.map((column, columnIndex) => <div key={column.title} className="column-view-column"><strong>{column.title}</strong>{column.rows.slice(0, 5).map((row, rowIndex) => { const active = row === current || (columnIndex === 0 && rowIndex === 0) || (columnIndex === 2 && rowIndex === 0); return <button key={`${column.title}-${row}`} type="button" className={active ? "column-view-row column-view-row-active" : "column-view-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span>{columnIndex < 2 ? <em>›</em> : null}</button>; })}</div>)}</div></section>;
  }
  if (item.type === "icon-view") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[1] ?? rows[0] ?? "");
    return <section className="icon-view"><header><span><strong>{String(props.title ?? "Icon view")}</strong><small>{String(props.description ?? "")}</small></span><em>Icon</em></header><div className="icon-view-body">{rows.slice(0, 8).map((row, index) => { const active = row === current || (!current && index === 0); const isCode = row.toLowerCase().endsWith(".rs") || row.toLowerCase().includes("logic"); return <button key={row} type="button" className={active ? "icon-view-item icon-view-item-active" : "icon-view-item"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{isCode ? "{}" : "▣"}</span><strong>{row}</strong><small>{isCode ? "Rust" : "UI file"}</small></button>; })}</div></section>;
  }
  if (item.type === "command-list") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const query = String(props.helper ?? "");
    const current = String(props.value ?? options[0] ?? "");
    const normalizedQuery = query.trim().toLowerCase();
    const rows = normalizedQuery ? options.filter((option) => option.toLowerCase().includes(normalizedQuery)) : options;
    const visibleRows = rows.length > 0 ? rows : [];
    return <section className="command-list"><header><strong>{String(props.title ?? "Commands")}</strong><small>{String(props.description ?? "")}</small></header><label><span>⌕</span><input value={query} placeholder={String(props.placeholder ?? "Search commands")} onChange={(event) => onWriteProp(item, "helper", event.currentTarget.value)} /></label><div className="command-list-results">{visibleRows.length > 0 ? visibleRows.map((option, index) => <button key={option} type="button" className={option === current ? "command-list-row command-list-row-active" : "command-list-row"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>{index + 1}</span><strong>{option}</strong><small>{index === 0 ? "Enter" : ""}</small></button>) : <div className="command-list-empty">No results</div>}</div></section>;
  }
  if (item.type === "command-palette") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const query = String(props.helper ?? "");
    const current = String(props.value ?? options[0] ?? "");
    const normalizedQuery = query.trim().toLowerCase();
    const rows = normalizedQuery ? options.filter((option) => option.toLowerCase().includes(normalizedQuery)) : options;
    const visibleRows = rows.length > 0 ? rows : options.slice(0, 1);
    return <section className="command-list"><header><strong>{String(props.title ?? "Command palette")}</strong><small>{String(props.description ?? "Search commands and files")}</small></header><label><span>⌘</span><input value={query} placeholder={String(props.placeholder ?? "Type a command")} onChange={(event) => onWriteProp(item, "helper", event.currentTarget.value)} /></label><div className="command-list-results">{visibleRows.map((option, index) => <button key={option} type="button" className={option === current ? "command-list-row command-list-row-active" : "command-list-row"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>{index === 0 ? "↵" : index + 1}</span><strong>{option}</strong><small>{index === 0 ? "Run" : "Open"}</small></button>)}</div></section>;
  }
  if (item.type === "notification-center") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="card"><strong>{String(props.title ?? "Notifications")}</strong><p>{String(props.description ?? "")}</p><div>{options.map((option, index) => <button key={option} type="button" className={option === current ? "list-row list-row-active" : "list-row"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>{index === 1 ? "!" : "•"}</span><strong>{option}</strong><small>{index === 0 ? "Now" : `${index * 4}m`}</small></button>)}</div></section>;
  }
  if (item.type === "system-tray") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="system-tray"><header><span className="system-tray-mark">◈<i /></span><div><strong>{String(props.title ?? "System tray")}</strong><small>{String(props.label ?? "Background")}</small></div><em>Tray</em></header><p>{String(props.description ?? "")}</p><div className="system-tray-menu">{options.map((option, index) => { const active = option === current || (!current && index === 0); return <button key={option} type="button" className={active ? "system-tray-row system-tray-row-active" : "system-tray-row"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span className={index === 2 ? "system-tray-dot system-tray-dot-danger" : index === 1 ? "system-tray-dot system-tray-dot-warn" : "system-tray-dot"} /><strong>{option}</strong><small>{index === 2 ? "Quit" : "Run"}</small></button>; })}</div></section>;
  }
  if (item.type === "activity-bar") {
    const commandName = eventCommandName(props, "click");
    const activities = optionTexts(props);
    const current = String(props.value ?? activities[0] ?? "");
    return <section className="key-value-list"><header><strong>{String(props.title ?? "Activity bar")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></header>{activities.map((activity, index) => <button key={activity} type="button" className={activity === current ? "key-value-row key-value-row-active" : "key-value-row"} onClick={() => { onWriteProp(item, "value", activity); if (commandName) onRunCommand(item, "click", activity); }}><span>{activity}</span><strong>{index === 0 ? "Project" : index === 1 ? "Design" : "Build"}</strong></button>)}</section>;
  }
  if (item.type === "shortcut-table") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const keys = ["Ctrl K", "Ctrl S", "Ctrl Shift B"];
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="property-grid"><header><strong>{String(props.title ?? "Shortcuts")}</strong><small>{String(props.description ?? "")}</small></header>{rows.map((row, index) => <button key={row} type="button" className={row === current ? "property-row property-row-active" : "property-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span><strong>{keys[index] ?? "F5"}</strong></button>)}</section>;
  }
  if (item.type === "resource-browser") {
    const commandName = eventCommandName(props, "click");
    const resources = optionTexts(props);
    const current = String(props.value ?? resources[0] ?? "");
    return <section className="card data-grid"><strong>{String(props.title ?? "Resources")}</strong><p>{String(props.description ?? "")}</p><div>{resources.map((resource, index) => <button key={resource} type="button" className={resource === current ? "data-grid-cell data-grid-cell-active" : "data-grid-cell"} onClick={() => { onWriteProp(item, "value", resource); if (commandName) onRunCommand(item, "click", resource); }}><span>{index === 2 ? "Aa" : "▧"}</span><strong>{resource}</strong><small>{index === 2 ? "Font" : "Asset"}</small></button>)}</div></section>;
  }
  if (item.type === "asset-grid") {
    const commandName = eventCommandName(props, "click");
    const assets = optionTexts(props);
    const current = String(props.value ?? assets[0] ?? "");
    return <section className="card data-grid"><strong>{String(props.title ?? "Asset grid")}</strong><p>{String(props.description ?? "")}</p><div>{assets.map((asset, index) => <button key={asset} type="button" className={asset === current ? "data-grid-cell data-grid-cell-active" : "data-grid-cell"} onClick={() => { onWriteProp(item, "value", asset); if (commandName) onRunCommand(item, "click", asset); }}><span>{index === 2 ? "{}" : "▧"}</span><strong>{asset}</strong><small>{index === 1 ? "Icon" : index === 2 ? "Token" : "Image"}</small></button>)}</div></section>;
  }
  if (item.type === "task-list") {
    const commandName = eventCommandName(props, "click");
    const tasks = optionTexts(props);
    const current = String(props.value ?? tasks[0] ?? "");
    return <section className="card timeline"><strong>{String(props.title ?? "Tasks")}</strong><p>{String(props.description ?? "")}</p>{tasks.map((task, index) => <button key={task} type="button" className={task === current ? "timeline-row timeline-row-active" : "timeline-row"} onClick={() => { onWriteProp(item, "value", task); if (commandName) onRunCommand(item, "click", task); }}><span>{index === 0 ? "✓" : index === 1 ? "…" : "○"}</span><strong>{task}</strong><small>{index === 0 ? "Done" : index === 1 ? "Running" : "Queued"}</small></button>)}</section>;
  }
  if (item.type === "settings-list") {
    const commandName = eventCommandName(props, "click");
    const settings = optionTexts(props);
    const current = String(props.value ?? settings[0] ?? "");
    return <section className="key-value-list"><header><strong>{String(props.title ?? "Settings")}</strong><small>{String(props.description ?? "")}</small></header>{settings.map((setting, index) => <button key={setting} type="button" className={setting === current ? "key-value-row key-value-row-active" : "key-value-row"} onClick={() => { onWriteProp(item, "value", setting); if (commandName) onRunCommand(item, "click", setting); }}><span>{setting}</span><strong>{setting === current ? "On" : index === 1 ? "Cozy" : "Off"}</strong></button>)}</section>;
  }
  if (item.type === "tree-view") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="card tree-view"><strong>{String(props.title ?? "Project tree")}</strong><p>{String(props.description ?? "")}</p><div className="tree-root">▾ src</div>{options.map((option) => <button key={option} type="button" className={option === current ? "tree-row tree-row-active" : "tree-row"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>↳ {option}</button>)}</section>;
  }
  if (item.type === "tree-table") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Tree table")}</strong><small>{String(props.description ?? "")}</small></header><div className="tree-table-head"><span>Name</span><span>Status</span><span>Target</span></div><div className="tree-table-body">{rows.map((row, index) => <button key={row} type="button" className={row === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{index === 0 ? "▾" : "↳"} <b>{row}</b></span><small>{index === 1 ? "Modified" : "Ready"}</small><em>{index === 2 ? "Asset" : "App"}</em></button>)}</div></section>;
  }
  if (item.type === "outline-view") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[rows.length - 1] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Outline")}</strong><small>{String(props.description ?? "")}</small></header><div className="tree-table-head"><span>Symbol</span><span>Kind</span><span>Line</span></div><div className="tree-table-body">{rows.map((row, index) => <button key={row} type="button" className={row === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{index === 0 ? "▾" : "↳"} <b>{row}</b></span><small>{index === 0 ? "Window" : index === 1 ? "Panel" : "Function"}</small><em>{index * 18 + 12}</em></button>)}</div></section>;
  }
  if (item.type === "signal-slot-editor") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Signals / Slots")}</strong><small>{String(props.description ?? "")}</small></header><div className="tree-table-head"><span>Signal</span><span>Slot</span><span>Status</span></div><div className="tree-table-body">{rows.map((row, index) => { const signal = row.includes(".") ? row : `${row}.${index === 1 ? "change" : "click"}`; const slot = `on_${signal.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase()}`; return <button key={row} type="button" className={row === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span><b>{signal}</b></span><small>{slot}</small><em>{index === 1 ? "Test" : "Ready"}</em></button>; })}</div></section>;
  }
  if (item.type === "node-graph") {
    const commandName = eventCommandName(props, "click");
    const nodes = optionTexts(props);
    const current = String(props.value ?? nodes[1] ?? nodes[0] ?? "");
    return <section className="data-grid"><header><span><strong>{String(props.title ?? "Node graph")}</strong><small>{String(props.description ?? "")}</small></span><button type="button">{nodes.length} nodes</button></header><div className="data-grid-head"><span /><span>Node</span><span>Role</span><span>Links</span></div>{nodes.map((node, index) => <button key={node} type="button" className={node === current ? "data-grid-row data-grid-row-active" : "data-grid-row"} onClick={() => { onWriteProp(item, "value", node); if (commandName) onRunCommand(item, "click", node); }}><span className={index === 1 ? "dot" : "dot dot-muted"} /><span>{node}</span><span>{index === 0 ? "Signal" : index === 1 ? "Command" : "Output"}</span><span>{index === 1 ? "2" : "1"}</span></button>)}</section>;
  }
  if (item.type === "log-viewer") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[rows.length - 1] ?? "");
    return <section className="console-panel"><header><span>▸</span><strong>{String(props.title ?? "Log viewer")}</strong><small>{String(props.description ?? "")}</small></header><div>{rows.map((row, index) => <button key={row} type="button" className={row === current ? "console-row console-row-active" : "console-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{index === 1 ? "WARN" : index === 2 ? "DONE" : "INFO"}</span><code>{row}</code></button>)}</div></section>;
  }
  if (item.type === "problems-panel") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Problems")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></header><div className="tree-table-head"><span>Severity</span><span>Location</span><span>Line</span></div><div className="tree-table-body">{rows.map((row, index) => <button key={row} type="button" className={row === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span><b>{index === 0 ? "ERROR" : index === 1 ? "WARN" : "HINT"}</b></span><small>{row}</small><em>{index * 31 + 18}</em></button>)}</div></section>;
  }
  if (item.type === "breakpoints-panel") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Breakpoints")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></header><div className="tree-table-head"><span>State</span><span>Location</span><span>Hit</span></div><div className="tree-table-body">{rows.map((row, index) => <button key={row} type="button" className={row === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span><b>{index === 1 ? "○" : "●"}</b></span><small>{row}</small><em>{index === 1 ? "Off" : "On"}</em></button>)}</div></section>;
  }
  if (item.type === "watch-panel") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="property-grid"><header><span><strong>{String(props.title ?? "Watch")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></span><em>Live</em></header><div className="property-grid-head"><span>Expression</span><span>Value</span><span>Type</span></div>{rows.map((row, index) => { const value = index === 0 ? String(props.label ?? "button_1") : index === 1 ? "true" : "{ patch: 1 }"; return <button key={row} type="button" className={row === current ? "property-grid-row property-grid-row-active" : "property-grid-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span><span>{value}</span><span>{index === 2 ? "json" : "value"}</span></button>; })}</section>;
  }
  if (item.type === "call-stack") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Call stack")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></header><div className="tree-table-head"><span>Frame</span><span>Function</span><span>Line</span></div><div className="tree-table-body">{rows.map((row, index) => <button key={row} type="button" className={row === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span><b>#{index}</b></span><small>{row}</small><em>{index * 24 + 12}</em></button>)}</div></section>;
  }
  if (item.type === "property-browser") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="property-grid"><header><span><strong>{String(props.title ?? "Property browser")}</strong><small>{String(props.description ?? "")}</small></span><em>Browser</em></header><div className="property-grid-head"><span>Property</span><span>Value</span><span>Group</span></div>{rows.map((row, index) => { const sampleValue = index === 0 ? `${item.width}px` : index === 1 ? String(props.variant ?? "secondary") : String(props.actionCommandId ?? "Unbound"); const group = index === 0 ? "Layout" : index === 1 ? "Style" : "Events"; return <button key={row} type="button" className={row === current ? "property-grid-row property-grid-row-active" : "property-grid-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span><span>{sampleValue}</span><span>{group}</span></button>; })}</section>;
  }
  if (item.type === "layer-panel") {
    const commandName = eventCommandName(props, "click");
    const layers = optionTexts(props);
    const current = String(props.value ?? layers[layers.length - 1] ?? layers[0] ?? "");
    return <section className="tree-table"><header><strong>{String(props.title ?? "Layers")}</strong><small>{String(props.description ?? "")}</small></header><div className="tree-table-head"><span>Layer</span><span>State</span><span>Order</span></div><div className="tree-table-body">{layers.map((layer, index) => <button key={layer} type="button" className={layer === current ? "tree-table-row tree-table-row-active" : "tree-table-row"} onClick={() => { onWriteProp(item, "value", layer); if (commandName) onRunCommand(item, "click", layer); }}><span>{index === 0 ? "▾" : "↳"} <b>{layer}</b></span><small>{index === 1 ? "Locked" : "Visible"}</small><em>{index + 1}</em></button>)}</div></section>;
  }
  if (item.type === "breadcrumb-bar") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? props.label ?? options[options.length - 1] ?? "");
    return <nav className="breadcrumb-bar">{options.map((option, index) => <span key={`${option}-${index}`}><span>{index > 0 ? "/" : ""}</span><button type="button" className={option === current ? "breadcrumb-item breadcrumb-item-active" : "breadcrumb-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button></span>)}</nav>;
  }
  if (item.type === "pagination") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? props.label ?? options[1] ?? "1");
    return <nav className="breadcrumb-bar"><span>{String(props.helper ?? props.description ?? "")}</span>{options.map((option, index) => <button key={`${option}-${index}`} type="button" className={current.includes(option) || option === props.label ? "breadcrumb-item breadcrumb-item-active" : "breadcrumb-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button>)}</nav>;
  }
  if (item.type === "toolbar") {
    const commandName = eventCommandName(props, "click");
    return <header className="panel-row"><strong>{String(props.title ?? "Toolbar")}</strong><div className="toolbar-actions">{optionTexts(props).map((option) => <button key={option} type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", option) : undefined}>{option}</button>)}</div></header>;
  }
  if (item.type === "floating-toolbar") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="floating-toolbar"><span>●</span><strong>{String(props.title ?? props.label ?? "Toolbar")}</strong>{options.slice(0, 3).map((option, index) => <button key={option} type="button" className={option === current || (!current && index === 0) ? "floating-toolbar-action floating-toolbar-action-active" : "floating-toolbar-action"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button>)}</section>;
  }
  if (item.type === "status-bar") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    return <footer className="status-bar"><button type="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? options[0] ?? "ready") : undefined}>{String(props.label ?? options[0] ?? "Ready")}</button><span>{String(props.description ?? props.title ?? "")}</span>{options.slice(1).map((option) => <small key={option}>{option}</small>)}</footer>;
  }
  if (item.type === "split-view") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const split = percentValue(props.value, 62);
    return <section className="split-view" style={{ gridTemplateColumns: `${split}% 8px 1fr` }}><button type="button" className="split-pane" onClick={commandName ? () => onRunCommand(item, "click", options[0] ?? "left") : undefined}><strong>{options[0] ?? "Project"}</strong><span /><span /><i /></button><span className="split-handle" /><button type="button" className="split-pane split-pane-main" onClick={commandName ? () => onRunCommand(item, "click", options[1] ?? "main") : undefined}><strong>{options[1] ?? String(props.title ?? "Canvas")}</strong><i /><small>{options[2] ?? String(props.description ?? "")}</small></button></section>;
  }
  if (item.type === "splitter") {
    const commandName = eventCommandName(props, "change");
    const options = optionTexts(props);
    const split = percentValue(props.value, 58);
    const writeSplit = (value: string) => {
      onWriteProp(item, "value", value);
      if (commandName) onRunCommand(item, "change", value);
    };
    return <section className="splitter"><header><span><strong>{String(props.title ?? "Splitter")}</strong><small>{String(props.description ?? "")}</small></span><em>{split}%</em></header><div className="splitter-body" style={{ gridTemplateColumns: `${split}% 12px 1fr` }}><div className="splitter-pane"><strong>{options[0] ?? "Left pane"}</strong><span /><span /></div><label className="splitter-handle" aria-label="Splitter position"><input type="range" min="20" max="80" value={split} onChange={(event) => writeSplit(event.currentTarget.value)} /><i /></label><div className="splitter-pane splitter-pane-main"><strong>{options[1] ?? "Right pane"}</strong><span /><small>{options[2] ?? "Context"}</small></div></div></section>;
  }
  if (item.type === "size-grip") {
    const commandName = eventCommandName(props, "change");
    const state = feedback[eventFeedbackKey(item.id, "change")];
    const current = String(props.value ?? "1280 x 720");
    const nextSize = current === "1280 x 720" ? "1366 x 768" : "1280 x 720";
    const writeSize = (value: string) => {
      onWriteProp(item, "value", value);
      if (commandName) onRunCommand(item, "change", value);
    };
    return <button type="button" className="size-grip" aria-label={String(props.title ?? "Size grip")} onClick={() => writeSize(nextSize)}><span><strong>{String(props.title ?? "Size grip")}</strong><small>{String(props.description ?? "Drag corner to resize")}</small><em>{state?.loading ? "Running..." : current}</em></span><i aria-hidden /><b aria-hidden /><b aria-hidden /></button>;
  }
  if (item.type === "supporting-pane") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="supporting-pane"><main><header><small>Supporting pane</small><strong>{String(props.title ?? "Overview")}</strong><p>{String(props.description ?? "")}</p></header><div><span /><span /><i /><b /></div></main><aside><header><strong>Context</strong><em>{options.length}</em></header>{options.map((option, index) => { const active = option === current || (!current && index === 0); return <button key={option} type="button" className={active ? "supporting-pane-item supporting-pane-item-active" : "supporting-pane-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><strong>{option}</strong><small>{index === 0 ? "Issues and state" : index === 1 ? "Context details" : "Next actions"}</small></button>; })}</aside><footer>Collapsed helper · {String(current || (options[0] ?? "Context"))}</footer></section>;
  }
  if (item.type === "scroll-area") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    const rows = [...options, "assets/icons/settings.svg", "assets/fonts/inter.woff2", "logs/build-output.txt"];
    return <section className="scroll-area"><header><span>↕</span><div><strong>{String(props.title ?? "Scroll area")}</strong><small>{String(props.description ?? "")}</small></div><i /></header><div className="scroll-area-body">{rows.map((row, index) => <button key={`${row}-${index}`} type="button" className={row === current ? "scroll-area-row scroll-area-row-active" : "scroll-area-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><strong>{row}</strong><small>{index < options.length ? "Bound" : "More"}</small></button>)}</div></section>;
  }
  if (item.type === "stacked-pages") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="stacked-pages"><header><span>▣</span><div><strong>{String(props.title ?? "Stacked pages")}</strong><small>{String(props.description ?? "")}</small></div></header><nav>{options.map((option) => <button key={option} type="button" className={option === current ? "stacked-page-tab stacked-page-tab-active" : "stacked-page-tab"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button>)}</nav><div className="stacked-page-body"><strong>{current || "Page"}</strong><span /><span /><i /></div></section>;
  }
  if (item.type === "tool-box") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="tool-box"><header><strong>{String(props.title ?? "Tool box")}</strong><small>{String(props.description ?? "")}</small></header>{options.map((option, index) => { const active = option === current || (!current && index === 0); return <button key={option} type="button" className={active ? "tool-box-item tool-box-item-active" : "tool-box-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>{active ? "⌃" : "⌄"}</span><strong>{option}</strong>{active ? <small>{index === 0 ? "Inputs, buttons and editors." : index === 1 ? "Layouts, containers and spacers." : "Data display and feedback widgets."}</small> : null}</button>; })}</section>;
  }
  if (item.type === "dock-panel") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="dock-panel"><header><span><strong>{String(props.title ?? "Dock")}</strong><small>{String(props.description ?? "")}</small></span><button type="button" aria-label="Pin">□</button><button type="button" aria-label="Close">×</button></header><div className="dock-tabs">{options.map((option) => <button key={option} type="button" className={option === current ? "dock-tab dock-tab-active" : "dock-tab"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>{option}</button>)}</div><div className="dock-panel-body"><strong>{current || String(props.title ?? "Panel")}</strong><span /><span /><i /></div></section>;
  }
  if (item.type === "mdi-area") {
    const commandName = eventCommandName(props, "click");
    const windows = optionTexts(props);
    const current = String(props.value ?? windows[0] ?? "");
    const layouts = ["mdi-window-a", "mdi-window-b", "mdi-window-c"];
    return <section className="mdi-area"><header><span><strong>{String(props.title ?? "MDI area")}</strong><small>{String(props.description ?? "")}</small></span><em>MDI</em></header><div className="mdi-stage">{windows.slice(0, 3).map((windowTitle, index) => { const active = windowTitle === current || (!current && index === 0); return <button key={`${windowTitle}-${index}`} type="button" className={`${layouts[index] ?? layouts[0]} ${active ? "mdi-window mdi-window-active" : "mdi-window"}`} onClick={() => { onWriteProp(item, "value", windowTitle); if (commandName) onRunCommand(item, "click", windowTitle); }}><span className="mdi-window-title"><i /><i /><i /><strong>{windowTitle}</strong></span><span className="mdi-window-body"><b /><b /><small /></span></button>; })}</div></section>;
  }
  if (item.type === "top-app-bar") {
    const commandName = eventCommandName(props, "click");
    return <header className="top-app-bar"><button type="button" className="icon-button" aria-label="Menu">☰</button><span><strong>{String(props.title ?? "App")}</strong><small>{String(props.description ?? "")}</small></span><div>{optionTexts(props).map((option) => <button key={option} type="button" className="icon-button" aria-label={option} onClick={commandName ? () => onRunCommand(item, "click", option) : undefined}>{option.slice(0, 1)}</button>)}</div></header>;
  }
  if (item.type === "bottom-app-bar") {
    const commandName = eventCommandName(props, "click");
    return <footer className="bottom-app-bar"><span><strong>{String(props.title ?? "Actions")}</strong><small>{String(props.description ?? "")}</small></span><div>{optionTexts(props).map((option, index) => <button key={option} type="button" className={index === 2 ? "button" : "button button-muted"} onClick={commandName ? () => onRunCommand(item, "click", option) : undefined}>{option}</button>)}</div><button type="button" className="fab-mini" aria-label={String(props.label ?? "Create")} onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "create") : undefined}>＋</button></footer>;
  }
  if (item.type === "navigation-bar") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <nav className="navigation-bar">{options.map((option) => <button key={option} type="button" className={option === current ? "nav-bar-item nav-bar-item-active" : "nav-bar-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>□</span>{option}</button>)}</nav>;
  }
  if (item.type === "navigation-suite") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="navigation-suite"><aside><strong>NS</strong>{options.map((option) => <button key={option} type="button" className={option === current ? "navigation-suite-rail-item navigation-suite-item-active" : "navigation-suite-rail-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>□</span><small>{option}</small></button>)}</aside><main><header><small>Navigation Suite</small><strong>{String(props.title ?? "Application")}</strong><p>{String(props.description ?? "")}</p></header><div><span /><span /><i /></div><footer>{String(current || (options[0] ?? "Page"))}</footer></main><nav>{options.map((option) => <button key={option} type="button" className={option === current ? "navigation-suite-bar-item navigation-suite-item-active" : "navigation-suite-bar-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>□</span>{option}</button>)}</nav></section>;
  }
  if (item.type === "navigation") {
    const commandName = eventCommandName(props, "click");
    return <nav className="card"><strong>{String(props.title ?? "Navigation")}</strong>{optionTexts(props).map((option) => <button key={option} type="button" className="list-row" onClick={commandName ? () => onRunCommand(item, "click", option) : undefined}>{option}</button>)}</nav>;
  }
  if (item.type === "navigation-drawer") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <nav className="navigation-drawer"><header><strong>{String(props.title ?? "Drawer")}</strong><small>{String(props.description ?? "")}</small></header>{options.map((option) => <button key={option} type="button" className={option === current ? "drawer-item drawer-item-active" : "drawer-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}>□ {option}</button>)}</nav>;
  }
  if (item.type === "navigation-item") {
    const commandName = eventCommandName(props, "click");
    const active = Boolean(props.checked);
    return <button type="button" className={active ? "drawer-item drawer-item-active" : "drawer-item"} aria-pressed={active} onClick={commandName ? () => onRunCommand(item, "click", props.title ?? props.label ?? "navigation-item") : undefined}>□ <strong>{String(props.title ?? props.label ?? "Navigation item")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></button>;
  }
  if (item.type === "side-sheet") {
    const commandName = eventCommandName(props, "click");
    return <aside className="side-sheet"><strong>{String(props.title ?? "Sheet")}</strong><p>{String(props.description ?? "")}</p>{optionTexts(props).map((option) => <div key={option} className="sheet-section">{option}<small>Editable section</small></div>)}<button type="button" className="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "apply") : undefined}>{String(props.label ?? "Apply")}</button></aside>;
  }
  if (item.type === "bottom-sheet") {
    const commandName = eventCommandName(props, "click");
    return <aside className="bottom-sheet"><span className="sheet-handle" /><strong>{String(props.title ?? "Bottom sheet")}</strong><p>{String(props.description ?? "")}</p><div className="bottom-sheet-options">{optionTexts(props).map((option) => <button key={option} type="button" className="sheet-section" onClick={commandName ? () => onRunCommand(item, "click", option) : undefined}>{option}<small>Target</small></button>)}</div><button type="button" className="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "apply") : undefined}>{String(props.label ?? "Apply")}</button></aside>;
  }
  if (item.type === "sheet-drag-handle") {
    return <section className="bottom-sheet"><span className="sheet-handle" /><strong>{String(props.title ?? "Drag handle")}</strong><p>{String(props.description ?? props.value ?? "")}</p></section>;
  }
  if (item.type === "accordion") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="accordion"><header><strong>{String(props.title ?? "Accordion")}</strong><small>{String(props.description ?? "")}</small></header>{options.map((option, index) => { const active = option === current || (!current && index === 0); return <button key={option} type="button" className={active ? "accordion-item accordion-item-active" : "accordion-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span><b>{option}</b><i>{active ? "Expanded" : "Collapsed"}</i></span><em>{active ? "⌃" : "⌄"}</em>{active ? <small>{index === 0 ? "Layout constraints, spacing and responsive rules." : index === 1 ? "Data source, defaults and validation state." : "Signals, slots and runtime feedback."}</small> : null}</button>; })}</section>;
  }
  if (item.type === "navigation-rail") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <nav className="navigation-rail"><strong>{String(props.title ?? "Rail")}</strong>{options.map((option) => <button key={option} type="button" className={option === current ? "rail-item rail-item-active" : "rail-item"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>◇</span>{option}</button>)}</nav>;
  }
  if (item.type === "heading") {
    return <section><p className="eyebrow">{String(props.label ?? "")}</p><h1>{String(props.title ?? "Heading")}</h1><p>{String(props.description ?? "")}</p></section>;
  }
  if (item.type === "empty-state") {
    const commandName = eventCommandName(props, "click");
    return <section className="empty-state"><span>＋</span><strong>{String(props.title ?? "Empty")}</strong><p>{String(props.description ?? "")}</p><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "start") : undefined}>{String(props.label ?? "Start")}</button></section>;
  }
  if (item.type === "empty-panel") {
    const commandName = eventCommandName(props, "click");
    return <section className="empty-panel"><span>□</span><div><strong>{String(props.title ?? "Empty panel")}</strong><p>{String(props.description ?? "")}</p><footer><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "add") : undefined}>{String(props.label ?? "Add")}</button><small>{String(props.helper ?? "Waiting")}</small></footer></div></section>;
  }
  if (item.type === "stepper") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    return <section className="card stepper"><div className="trace-title"><strong>{String(props.title ?? "Steps")}</strong><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "next") : undefined}>{String(props.label ?? "Next")}</button></div><p>{String(props.description ?? "")}</p><div className="step-row">{options.map((option, index) => <button key={option} type="button" className={option === current ? "step step-active" : "step"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>{index + 1}</span>{option}</button>)}</div></section>;
  }
  if (item.type === "wizard") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    const current = String(props.value ?? options[0] ?? "");
    const activeIndex = Math.max(0, options.findIndex((option) => option === current));
    return <section className="wizard"><aside><strong>{String(props.title ?? "Wizard")}</strong><small>{String(props.description ?? "")}</small>{options.map((option, index) => { const active = option === current || (!current && index === 0); const complete = activeIndex > index; return <button key={option} type="button" className={active ? "wizard-step wizard-step-active" : "wizard-step"} onClick={() => { onWriteProp(item, "value", option); if (commandName) onRunCommand(item, "click", option); }}><span>{complete ? "✓" : index + 1}</span><b>{option}</b></button>; })}</aside><main><header><small>Wizard</small><strong>{current || options[0] || "Step"}</strong></header><div><span /><span /><i /></div><footer><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", "previous") : undefined}>Back</button><button type="button" className="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "next") : undefined}>{String(props.label ?? "Next")}</button></footer></main></section>;
  }
  if (item.type === "banner") {
    const commandName = eventCommandName(props, "click");
    return <section className={props.variant === "destructive" ? "banner banner-danger" : "banner"}><strong>{String(props.title ?? "Notice")}</strong><p>{String(props.description ?? "")}</p><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "action") : undefined}>{String(props.label ?? "Action")}</button></section>;
  }
  if (item.type === "alert") {
    const commandName = eventCommandName(props, "click");
    return <section className={props.variant === "destructive" ? "alert-card alert-card-danger" : "alert-card"}><span>!</span><div><strong>{String(props.title ?? "Alert")}</strong><p>{String(props.description ?? "")}</p>{props.label ? <button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "action") : undefined}>{String(props.label)}</button> : null}</div></section>;
  }
  if (item.type === "card" || item.type === "elevated-card" || item.type === "filled-card" || item.type === "outlined-card") {
    const commandName = eventCommandName(props, "click");
    const className = item.type === "elevated-card" ? "card runtime-card elevated-card" : item.type === "filled-card" ? "card runtime-card filled-card" : item.type === "outlined-card" ? "card runtime-card outlined-card" : "card runtime-card";
    const label = item.type === "elevated-card" ? "Elevated" : item.type === "filled-card" ? "Filled" : item.type === "outlined-card" ? "Outlined" : String(props.label ?? "实时");
    return <button type="button" className={className} onClick={commandName ? () => onRunCommand(item, "click", props.label ?? props.title ?? "card") : undefined}><div className="runtime-card-header"><span><strong>{String(props.title ?? "Card")}</strong><p>{String(props.description ?? "")}</p></span><em>{label}</em></div><progress max="100" value={percentValue(props.value, item.type === "filled-card" ? 100 : item.type === "outlined-card" ? 42 : 68)} /><small>{String(props.helper ?? props.value ?? "68%")}</small></button>;
  }
  if (item.type === "dialog") {
    const commandName = eventCommandName(props, "click");
    return <section className="card dialog-card"><h2>{String(props.title ?? "Dialog")}</h2><p>{String(props.description ?? "")}</p><div className="toolbar-actions"><button type="button" className="button button-muted">Cancel</button><button type="button" className="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "confirm") : undefined}>{String(props.label ?? "Confirm")}</button></div></section>;
  }
  if (item.type === "popover") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    return <section className="card popover-card"><button type="button" className="button button-muted" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "open") : undefined}>{String(props.label ?? "Open")}</button><div className="popover-panel"><strong>{String(props.title ?? "Popover")}</strong><p>{String(props.description ?? "")}</p><div>{options.slice(0, 3).map((option) => <span key={option}>{option}</span>)}</div></div></section>;
  }
  if (item.type === "tooltip") {
    return <section className="tooltip-demo"><span className="tooltip-anchor">{String(props.label ?? "Action")}</span><span className="tooltip-bubble">{String(props.description ?? "Helpful context")}</span></section>;
  }
  if (item.type === "snackbar") {
    const commandName = eventCommandName(props, "click");
    return <section className="snackbar"><span><strong>{String(props.title ?? "Saved")}</strong><p>{String(props.description ?? "")}</p></span><button type="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "action") : undefined}>{String(props.label ?? "Action")}</button></section>;
  }
  if (item.type === "section-header") {
    return <header className="panel-row"><span><strong>{String(props.title ?? "Section")}</strong><p>{String(props.description ?? "")}</p></span><em>{String(props.label ?? props.helper ?? "")}</em></header>;
  }
  if (item.type === "toast") {
    const commandName = eventCommandName(props, "click");
    return <section className="toast-card"><span>✓</span><div><header><strong>{String(props.title ?? "Toast")}</strong><small>{String(props.helper ?? "now")}</small></header><p>{String(props.description ?? "")}</p><button type="button" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "open") : undefined}>{String(props.label ?? "Open")}</button></div></section>;
  }
  if (item.type === "fab") {
    const commandName = eventCommandName(props, "click");
    return <button type="button" className="fab" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "fab") : undefined}><span>＋</span>{String(props.label ?? "New")}</button>;
  }
  if (item.type === "extended-fab") {
    const commandName = eventCommandName(props, "click");
    return <button type="button" className="fab extended-fab" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "extended-fab") : undefined}><span>＋</span><strong>{String(props.label ?? "New")}</strong></button>;
  }
  if (item.type === "stat") {
    return <section className="card"><p>{String(props.label ?? "Metric")}</p><h2>{String(props.value ?? "0")}</h2><small>{String(props.helper ?? "")}</small></section>;
  }
  if (item.type === "lcd-display") {
    return <section className="lcd-display"><small>{String(props.label ?? "LCD")}</small><strong>{String(props.value ?? "0")}</strong><footer><span>{String(props.title ?? "Metric")}</span><em>{String(props.helper ?? "")}</em></footer></section>;
  }
  if (item.type === "chart-view") {
    const commandName = eventCommandName(props, "click");
    const series = optionTexts(props);
    const current = String(props.value ?? series[0] ?? "");
    return <section className="chart-view"><header><span><strong>{String(props.title ?? "Chart")}</strong><small>{String(props.description ?? "")}</small></span><em>{String(props.label ?? "ms")}</em></header><div className="chart-plot"><svg aria-hidden viewBox="0 0 320 160" preserveAspectRatio="none"><path className="chart-grid" d="M0 42 H320 M0 84 H320 M0 126 H320" /><path className="chart-line" d="M18 118 L74 92 L130 104 L186 62 L242 76 L302 38" /></svg><div className="chart-bars"><i style={{ height: "42%" }} /><i style={{ height: "58%" }} /><i style={{ height: "38%" }} /><i style={{ height: "72%" }} /><i style={{ height: "64%" }} /><i style={{ height: "86%" }} /></div></div><footer>{series.slice(0, 3).map((name, index) => <button key={name} type="button" className={name === current || (!current && index === 0) ? "chart-legend chart-legend-active" : "chart-legend"} onClick={() => { onWriteProp(item, "value", name); if (commandName) onRunCommand(item, "click", name); }}>{name}</button>)}</footer></section>;
  }
  if (item.type === "progress") {
    const value = percentValue(props.value, 68);
    return <section className="card"><div className="trace-title"><strong>{String(props.title ?? "Progress")}</strong><small>{value}%</small></div><progress max="100" value={value} /><p>{String(props.description ?? "")}</p></section>;
  }
  if (item.type === "circular-progress") {
    const value = percentValue(props.value, 72);
    const color = props.variant === "destructive" ? '#ba1a1a' : '#6750a4';
    return <section className="circular-progress"><div className="circular-progress-ring" style={{ background: `conic-gradient(${color} ${value * 3.6}deg, #f3edf7 0deg)` }}><span>{value}%</span></div><strong>{String(props.title ?? "Loading")}</strong><small>{String(props.label ?? "")}</small><p>{String(props.description ?? "")}</p></section>;
  }
  if (item.type === "progress-list") {
    const rows = optionTexts(props);
    const base = percentValue(props.value, 68);
    return <section className="list-view"><header><span><strong>{String(props.title ?? "Progress list")}</strong><small>{String(props.description ?? "")}</small></span><em>{String(props.label ?? `${rows.length} tasks`)}</em></header><div className="list-view-body">{rows.slice(0, 5).map((row, index) => { const value = Math.min(Math.max(base - index * 18, 8), 100); return <div key={row} className="list-view-row"><span>{index + 1}</span><strong>{row}</strong><small>{value}%</small><progress max="100" value={value} /></div>; })}</div></section>;
  }
  if (item.type === "avatar") {
    const commandName = eventCommandName(props, "click");
    const initials = String(props.value ?? props.label ?? "NU").slice(0, 2).toUpperCase();
    return <button type="button" className="panel-row avatar-row" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? initials) : undefined}><span className="avatar">{initials}</span><span><strong>{String(props.label ?? "User")}</strong><p>{String(props.helper ?? "")}</p></span></button>;
  }
  if (item.type === "avatar-group") {
    const commandName = eventCommandName(props, "click");
    const options = optionTexts(props);
    return <button type="button" className="avatar-group" onClick={commandName ? () => onRunCommand(item, "click", props.label ?? "group") : undefined}><span><strong>{String(props.title ?? "Team")}</strong><p>{String(props.label ?? props.description ?? "")}</p></span><div>{options.slice(0, 4).map((option, index) => <i key={`${option}-${index}`} className={`avatar avatar-group-item avatar-group-item-${index + 1}`}>{option.slice(0, 2).toUpperCase()}</i>)}<em>{String(props.helper ?? "+2")}</em></div></button>;
  }
  if (item.type === "table") {
    return <section className="card"><strong>{String(props.title ?? "Table")}</strong><table><tbody><tr><td>Desktop</td><td>Ready</td></tr><tr><td>Rust</td><td>Linked</td></tr></tbody></table></section>;
  }
  if (item.type === "table-view") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="table-view"><header><span><strong>{String(props.title ?? "Table view")}</strong><small>{String(props.description ?? "")}</small></span><em>Model</em></header><div className="table-view-head"><span>Name</span><span>State</span><span>Target</span></div><div className="table-view-body">{rows.slice(0, 6).map((row, index) => { const active = row === current || (!current && index === 0); return <button key={row} type="button" className={active ? "table-view-row table-view-row-active" : "table-view-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span><span>{index === 2 ? "Draft" : "Ready"}</span><span>{index === 0 ? "UI" : index === 1 ? "Rust" : "Release"}</span></button>; })}</div></section>;
  }
  if (item.type === "kanban-board") {
    const commandName = eventCommandName(props, "click");
    const columns = optionTexts(props);
    const current = String(props.value ?? columns[0] ?? "");
    return <section className="data-grid"><header><span><strong>{String(props.title ?? "Board")}</strong><small>{String(props.description ?? props.helper ?? "")}</small></span><button type="button">{String(props.label ?? "Flow")}</button></header><div className="data-grid-head">{columns.map((column) => <span key={column}>{column}</span>)}</div><div className="data-grid-body">{columns.map((column, index) => <button key={column} type="button" className={column === current ? "data-grid-row data-grid-row-active" : "data-grid-row"} onClick={() => { onWriteProp(item, "value", column); if (commandName) onRunCommand(item, "click", column); }}><span className={index === 2 ? "dot dot-muted" : "dot"} /><span>{column}</span><span>{index + 2} cards</span><span>{index === 1 ? "Active" : "Ready"}</span></button>)}</div></section>;
  }
  if (item.type === "data-grid") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="data-grid"><header><span><strong>{String(props.title ?? "Data grid")}</strong><small>{String(props.description ?? "")}</small></span><button type="button">Sort ^</button></header><div className="data-grid-head"><span /><span>Name</span><span>Status</span><span>Target</span></div>{rows.map((row, index) => <button key={row} type="button" className={row === current ? "data-grid-row data-grid-row-active" : "data-grid-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span className={index === 2 ? "dot dot-muted" : "dot"} /><span>{row}</span><span>{index === 2 ? "Draft" : "Ready"}</span><span>Win</span></button>)}</section>;
  }
  if (item.type === "property-grid") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="property-grid"><header><span><strong>{String(props.title ?? "Properties")}</strong><small>{String(props.description ?? "")}</small></span><em>Props</em></header><div className="property-grid-head"><span>Property</span><span>Value</span><span>Editor</span></div>{rows.map((row, index) => { const sampleValue = index === 0 ? `${item.width}px` : index === 1 ? `${item.height}px` : String(props.actionCommandId ?? "Unbound"); const editorType = index === 2 ? "event" : "number"; return <button key={row} type="button" className={row === current ? "property-grid-row property-grid-row-active" : "property-grid-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span><span>{sampleValue}</span><span>{editorType}</span></button>; })}</section>;
  }
  if (item.type === "key-value-list") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="key-value-list"><header><span><strong>{String(props.title ?? "Details")}</strong><small>{String(props.description ?? "")}</small></span><em>KV</em></header>{rows.map((row, index) => { const sampleValue = index === 0 ? "0.1.0" : index === 1 ? "Windows x64" : String(props.actionCommandId ?? "release"); return <button key={row} type="button" className={row === current ? "key-value-row key-value-row-active" : "key-value-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span><strong>{sampleValue}</strong></button>; })}</section>;
  }
  if (item.type === "inspector-section") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="inspector-section"><header><span>⌄</span><strong>{String(props.title ?? "Inspector")}</strong><small>{String(props.description ?? "")}</small></header>{rows.map((row, index) => <button key={row} type="button" className={row === current ? "inspector-row inspector-row-active" : "inspector-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{row}</span><em>{index === 0 ? `${item.width}px` : index === 1 ? `${item.height}px` : "fixed"}</em></button>)}</section>;
  }
  if (item.type === "form-layout") {
    const commandName = eventCommandName(props, "change");
    const fields = optionTexts(props);
    return <section className="form-layout"><header><strong>{String(props.title ?? "Form")}</strong><small>{String(props.description ?? "")}</small></header>{fields.map((field, index) => <label key={field}><span>{field}</span><input value={index === 0 ? String(props.value ?? "Nova UI Kit") : index === 1 ? "Select directory" : "Windows exe"} aria-invalid={index === 1} onChange={(event) => { if (commandName) onRunCommand(item, "change", event.currentTarget.value); }} /></label>)}<footer><small>1 field needs attention</small><button type="button" className="button" onClick={commandName ? () => onRunCommand(item, "change", props.value ?? "") : undefined}>{String(props.label ?? "Save")}</button></footer></section>;
  }
  if (item.type === "console-panel") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[rows.length - 1] ?? "");
    return <section className="console-panel"><header><span>▸</span><strong>{String(props.title ?? "Console")}</strong><small>{String(props.description ?? "")}</small></header><div>{rows.map((row, index) => <button key={row} type="button" className={row === current ? "console-row console-row-active" : "console-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span>{index === 1 ? "warn" : index === 2 ? "done" : "info"}</span><code>{row}</code></button>)}</div></section>;
  }
  if (item.type === "terminal-view") {
    const clickCommandName = eventCommandName(props, "click");
    const changeCommandName = eventCommandName(props, "change");
    const commands = optionTexts(props);
    const current = String(props.value ?? commands[commands.length - 1] ?? "");
    return <section className="terminal-view"><header><span>▸</span><strong>{String(props.title ?? "Terminal")}</strong><small>{String(props.label ?? "shell")}</small></header><div><p className="terminal-cwd">{String(props.helper ?? "~")}</p>{commands.slice(0, 3).map((command) => <button key={command} type="button" className={command === current ? "terminal-line terminal-line-active" : "terminal-line"} onClick={() => { onWriteProp(item, "value", command); if (clickCommandName) onRunCommand(item, "click", command); }}><span>$</span><code>{command}</code></button>)}<p className="terminal-success">done in 1.4s</p></div><label><span>$</span><input value={current} placeholder={String(props.placeholder ?? "Type command...")} readOnly={Boolean(props.readOnly)} onChange={(event) => { onWriteProp(item, "value", event.currentTarget.value); if (changeCommandName) onRunCommand(item, "change", event.currentTarget.value); }} /></label></section>;
  }
  if (item.type === "timeline") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[rows.length - 1] ?? "");
    return <section className="timeline"><header><span>◷</span><strong>{String(props.title ?? "Activity")}</strong><small>{String(props.description ?? "")}</small></header><div>{rows.map((row, index) => { const active = row === current || (!current && index === rows.length - 1); return <button key={row} type="button" className={active ? "timeline-row timeline-row-active" : "timeline-row"} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span className="timeline-rail"><i /><b /></span><strong>{row}</strong><small>{index === 0 ? "09:12" : index === 1 ? "09:14" : "09:18"}</small><em>{index === 0 ? "Saved" : index === 1 ? "Checking" : "Done"}</em></button>; })}</div></section>;
  }
  if (item.type === "status-indicator") {
    const commandName = eventCommandName(props, "click");
    const rows = optionTexts(props);
    const current = String(props.value ?? rows[0] ?? "");
    return <section className="status-indicator"><header><span className="status-indicator-icon">⌁</span><div><strong>{String(props.title ?? "Status")}</strong><small>{String(props.description ?? "")}</small></div><em>{current}</em></header><div>{rows.map((row, index) => { const active = row === current || (!current && index === 0); const tone = index === 1 ? "status-indicator-warn" : index === 2 ? "status-indicator-bad" : "status-indicator-good"; return <button key={row} type="button" className={`${active ? "status-indicator-row status-indicator-row-active" : "status-indicator-row"} ${tone}`} onClick={() => { onWriteProp(item, "value", row); if (commandName) onRunCommand(item, "click", row); }}><span /><strong>{row}</strong><small>{index === 1 ? "等待" : index === 2 ? "处理" : "在线"}</small></button>; })}</div></section>;
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
                  {logPreview.loading ? "Loading backend runtime log summary..." : logPreview.content || logPreview.message}
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
                  Log summary
                </button>
                <button type="button" onClick={() => onOpenBackendLog(result.id, runtime?.logPath)} disabled={!canUseLog || Boolean(logPreview?.loading)}>
                  Open full log
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
    if (!startupProbeCommandName) {
      setMessage(registeredRustCommands.length > 0 ? "Rust commands ready" : "No Rust commands registered");
      return;
    }
    invoke<string>(startupProbeCommandName)
      .then(setMessage)
      .catch((error) => setMessage(String(error)));
  }, []);

  useEffect(() => {
    const controls = Array.from(document.querySelectorAll<HTMLElement>("[data-nova-control-id]"));
    for (const control of controls) {
      const rawTabIndex = control.getAttribute("data-nova-tab-index");
      const tabIndex = rawTabIndex === null ? Number.NaN : Number(rawTabIndex);
      const target = control.matches(runtimeInteractiveSelector)
        ? control
        : control.querySelector<HTMLElement>(runtimeInteractiveSelector);
      if (!target) {
        continue;
      }
      const enabled = control.getAttribute("data-nova-enabled") !== "false";
      const readOnly = control.getAttribute("data-nova-read-only") === "true";
      if (!enabled) {
        target.setAttribute("aria-disabled", "true");
        target.setAttribute("data-nova-runtime-disabled", "true");
        if (
          target instanceof HTMLButtonElement ||
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement
        ) {
          target.disabled = true;
        } else {
          target.tabIndex = -1;
        }
      }
      if (readOnly) {
        target.setAttribute("aria-readonly", "true");
        target.setAttribute("data-nova-runtime-read-only", "true");
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
          target.readOnly = true;
        }
      }
      if (!Number.isFinite(tabIndex) || !enabled) {
        continue;
      }
      target.tabIndex = Math.round(tabIndex);
      target.setAttribute("data-nova-runtime-tab-index", String(Math.round(tabIndex)));
    }
  }, [activeFile?.id, itemPropOverrides, stateValues]);

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
        message: "Loading backend runtime log summary...",
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
  const windowKind = runtimeWindowKind((basePage as { windowKind?: unknown }).windowKind ?? projectReleaseConfig.windowKind);
  const requestedTitlebarStyle = runtimeTitlebarStyle((basePage as { titlebarStyle?: unknown }).titlebarStyle ?? projectReleaseConfig.titlebarStyle, windowKind);
  const releaseTitlebarStyle = runtimeTitlebarStyle(projectReleaseConfig.titlebarStyle, runtimeWindowKind(projectReleaseConfig.windowKind));
  const titlebarStyle = requestedTitlebarStyle === "native" && releaseTitlebarStyle !== "native" ? "nova" : requestedTitlebarStyle;
  const windowTitle = String(page.title || projectReleaseConfig.windowTitle || projectReleaseConfig.appName || project.name || "Nova App");
  const titlebarSubtitle = String((basePage as { titlebarSubtitle?: unknown }).titlebarSubtitle || projectReleaseConfig.titlebarSubtitle || "");
  const runtimeBackground = runtimePageBackground((basePage as { background?: unknown }).background);
  const showRuntimePanel = projectReleaseConfig.showRuntimePanel === true;
  const statusText = message && message !== "Rust logic not invoked yet" ? message : `${items.length} controls / ${breakpoint}`;

  return (
    <main
      className={`app app-${windowKind} app-titlebar-${titlebarStyle} app-background-${runtimeBackground}`}
      data-window-kind={windowKind}
      data-titlebar-style={titlebarStyle}
      data-runtime-background={runtimeBackground}
      data-runtime-grid="off"
      data-runtime-style-contract="nova-desktop-shell"
      data-runtime-design-artifacts="none"
      data-runtime-frame="nova-editor-parity"
      data-runtime-density="desktop"
      data-runtime-platform="tauri"
      data-runtime-grid-policy="design-only"
      data-runtime-surface={titlebarStyle === "nova" ? "custom-chrome" : "native-content"}
      data-runtime-shell={titlebarStyle === "nova" ? "nova" : titlebarStyle}
    >
      {titlebarStyle === "nova" ? (
        <NovaWindowTitlebar
          title={windowTitle}
          subtitle={titlebarSubtitle}
          status={statusText}
          windowKind={windowKind}
          titlebarStyle={titlebarStyle}
        />
      ) : null}
      <div className="app-body" data-runtime-body="nova-surface">
        <div className="workspace" data-runtime-panel={showRuntimePanel ? "visible" : "hidden"}>
          <div className="canvas-viewport" data-runtime-surface="viewport">
            <section
              className={`canvas canvas-background-${runtimeBackground}`}
              data-runtime-surface="app-canvas"
              data-runtime-design-grid="absent"
              data-runtime-rulers="absent"
              style={{ width: page.width, height: page.height, minWidth: "100%", minHeight: "100%" }}
            >
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
  background: #f8f7fb;
}

button,
input,
textarea,
select {
  font: inherit;
}

.app {
  --nova-runtime-radius: 18px;
  --nova-runtime-shadow: 0 18px 50px rgb(32 27 44 / 0.12);
  --nova-runtime-border: #d8d2e4;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8f7fb;
  color: #1d1b20;
  box-shadow: inset 0 0 0 1px var(--nova-runtime-border);
}

.app-titlebar-native,
.app-titlebar-hidden {
  background: #fffbff;
  box-shadow: none;
}

.app-dialog,
.app-tool {
  background: #f8f7fb;
}

.window-titlebar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  height: 40px;
  flex: 0 0 auto;
  user-select: none;
  border-bottom: 1px solid #d8d2e4;
  background:
    linear-gradient(180deg, rgb(255 251 255 / 0.97), rgb(248 247 251 / 0.94));
  padding: 0 10px 0 12px;
  color: #5f5a66;
  backdrop-filter: blur(18px);
}

.titlebar-hit-strip {
  position: absolute;
  inset: 0 112px 0 0;
  z-index: 0;
}

.app-dialog .window-titlebar {
  height: 38px;
}

.app-tool .window-titlebar {
  height: 36px;
  background: rgb(248 247 251 / 0.96);
}

.titlebar-drag-region {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  align-self: stretch;
}

.titlebar-brand {
  display: flex;
  min-width: 0;
  align-self: stretch;
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

.titlebar-runtime-chip {
  display: inline-flex;
  height: 20px;
  flex: 0 0 auto;
  align-items: center;
  border: 1px solid rgb(103 80 164 / 0.22);
  border-radius: 999px;
  background: rgb(232 222 248 / 0.58);
  color: #4f378b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1;
  padding: 0 8px;
}

.titlebar-status {
  justify-self: end;
  max-width: 34vw;
}

.window-controls {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 2px;
}

.window-controls button {
  position: relative;
  display: inline-flex;
  width: 34px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  align-items: center;
  background: transparent;
  color: #49454f;
  cursor: pointer;
  justify-content: center;
  padding: 0;
  transition: background-color 120ms ease, color 120ms ease;
}

.window-controls button:hover {
  background: #f0edf4;
}

.window-controls .window-close:hover {
  background: #ba1a1a;
  color: white;
}

.window-control-icon {
  position: relative;
  display: inline-block;
  width: 12px;
  height: 12px;
  color: currentColor;
}

.window-minimize-icon::before,
.window-maximize-icon::before,
.window-close-icon::before,
.window-close-icon::after {
  position: absolute;
  content: "";
  background: currentColor;
}

.window-minimize-icon::before {
  left: 1px;
  right: 1px;
  top: 8px;
  height: 1.5px;
  border-radius: 999px;
}

.window-maximize-icon::before {
  inset: 2px;
  border: 1.5px solid currentColor;
  border-radius: 2px;
  background: transparent;
}

.window-close-icon::before,
.window-close-icon::after {
  left: 1px;
  top: 5px;
  width: 10px;
  height: 1.5px;
  border-radius: 999px;
}

.window-close-icon::before {
  transform: rotate(45deg);
}

.window-close-icon::after {
  transform: rotate(-45deg);
}

.app-body {
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
  background: #f8f7fb;
  padding: 0;
}

.app-titlebar-native .app-body,
.app-titlebar-hidden .app-body {
  background: #fffbff;
  padding-top: 0;
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
  gap: 0;
}

.workspace[data-runtime-panel="visible"] {
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 18px;
  padding: 18px;
  background: #f8f7fb;
}

[data-runtime-style-contract="nova-desktop-shell"] .workspace[data-runtime-panel="visible"] {
  border-radius: var(--nova-runtime-radius);
}

.canvas-viewport {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  border: 0;
  border-radius: 0;
  background: #f8f7fb;
  padding: 0;
  box-shadow: none;
}

[data-runtime-surface="viewport"] {
  scrollbar-color: #cac4d0 transparent;
}

.app-titlebar-native .canvas-viewport,
.app-titlebar-hidden .canvas-viewport {
  background: #fffbff;
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
  border: 0;
  border-radius: 0;
  background: #fffbff;
  box-shadow: none;
}

.canvas-background-soft {
  background:
    radial-gradient(circle at 18% 0%, rgb(103 80 164 / 0.08), transparent 32%),
    #fffbff;
}

.canvas-background-plain {
  background: #fffbff;
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

.text-label {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  color: #1d192b;
  padding: 4px;
}

.text-label strong,
.text-label small {
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-label strong {
  font-size: 14px;
  white-space: nowrap;
}

.text-label small {
  display: -webkit-box;
  margin-top: 4px;
  color: #79747e;
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.link-label {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  color: #6750a4;
  padding: 12px 14px;
  text-align: left;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.link-label:not(:disabled):hover {
  border-color: #d0bcff;
  background: #f7f2fa;
}

.link-label strong,
.link-label small,
.link-label code {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-label strong {
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.link-label small {
  margin-top: 4px;
  color: #79747e;
  font-size: 11px;
}

.link-label code {
  margin-top: 4px;
  color: #7d5260;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10px;
}

.text-browser {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 20px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.text-browser header {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #d8d2e4;
  padding: 0 14px;
}

.text-browser header strong,
.text-browser header span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-browser header strong {
  font-size: 13px;
}

.text-browser header span {
  color: #79747e;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.text-browser > div {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 12px 14px;
}

.text-browser p {
  margin: 0 0 8px;
  color: #49454f;
  font-size: 12px;
  line-height: 1.5;
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

.image-list {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 12px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.image-list header {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.image-list header span {
  min-width: 0;
}

.image-list strong,
.image-list small,
.image-list em,
.image-list-item strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-list small {
  display: block;
  margin-top: 3px;
  color: #79747e;
  font-size: 11px;
}

.image-list em {
  flex: 0 0 auto;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 4px 8px;
}

.image-list > div {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  overflow: hidden;
  margin: 12px 0;
}

.image-list-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 16px;
  background: #f9f6fb;
  color: #49454f;
  padding: 0;
  text-align: left;
}

.image-list-item-active {
  border-color: #6750a4;
  box-shadow: 0 8px 18px rgb(31 28 38 / 0.1);
}

.image-list-thumb {
  display: block;
  height: 58px;
  flex: 0 0 auto;
}

.image-list-thumb-1 {
  background: linear-gradient(135deg, #d7e3ff, #eaddff);
}

.image-list-thumb-2 {
  background: linear-gradient(135deg, #d2e7d6, #f3edf7);
}

.image-list-thumb-3 {
  background: linear-gradient(135deg, #ffd8e4, #e8def8);
}

.image-list-item strong {
  padding: 7px 8px;
  font-size: 11px;
}

.image-list > .button {
  width: 100%;
  height: 34px;
}

.web-view {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.web-view header {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 8px 10px;
}

.web-view header span {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 10px;
  background: #fffbff;
  color: #79747e;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  padding: 6px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.web-view header button {
  border: 0;
  border-radius: 10px;
  background: #eaddff;
  color: #4f378b;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 800;
  padding: 7px 9px;
}

.web-view main {
  display: flex;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.web-view aside {
  display: flex;
  width: 96px;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 5px;
  overflow: hidden;
  border-right: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 10px 8px;
}

.web-tab {
  min-width: 0;
  overflow: hidden;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #79747e;
  font-size: 11px;
  font-weight: 700;
  padding: 7px 8px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.web-tab-active {
  background: #eaddff;
  color: #4f378b;
}

.web-view article {
  display: grid;
  min-width: 0;
  min-height: 0;
  flex: 1;
  grid-template-rows: auto auto 12px 12px minmax(0, 1fr);
  gap: 9px;
  overflow: hidden;
  background: #fffbff;
  padding: 16px;
}

.web-view article strong,
.web-view article p {
  overflow: hidden;
  text-overflow: ellipsis;
}

.web-view article strong {
  font-size: 15px;
  white-space: nowrap;
}

.web-view article p {
  display: -webkit-box;
  color: #79747e;
  font-size: 12px;
  line-height: 1.45;
  margin: 0;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.web-view article span,
.web-view article i {
  border-radius: 999px;
  background: #f3edf7;
}

.web-view article span:nth-of-type(2) {
  width: 66%;
}

.web-view article i {
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #f9f6fb;
}

.web-view footer {
  overflow: hidden;
  border-top: 1px solid #d8d2e4;
  background: #f9f6fb;
  color: #79747e;
  font-size: 11px;
  padding: 7px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-player {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #2b2930;
  border-radius: 22px;
  background: #17151b;
  color: #f7f2fa;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.18);
}

.media-screen {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  background:
    radial-gradient(circle at 35% 25%, rgb(208 188 255 / 0.35), transparent 30%),
    linear-gradient(135deg, #211f26, #101116);
}

.media-screen > span {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  min-width: 0;
}

.media-screen strong,
.media-screen small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-screen small {
  color: #cac4d0;
  font-size: 11px;
  margin-top: 3px;
}

.media-play {
  position: absolute;
  left: 50%;
  top: 50%;
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.14);
  color: white;
  font-size: 22px;
  transform: translate(-50%, -50%);
  box-shadow: 0 12px 28px rgb(0 0 0 / 0.24);
}

.media-player footer {
  border-top: 1px solid rgb(255 255 255 / 0.1);
  background: #211f26;
  padding: 12px;
}

.media-controls {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.media-controls button {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
  color: #f7f2fa;
}

.media-controls small {
  color: #cac4d0;
  font-size: 11px;
  white-space: nowrap;
}

.media-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
}

.media-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #d0bcff;
}

.media-chapters {
  display: flex;
  gap: 6px;
  overflow: hidden;
  margin-top: 9px;
}

.media-chip {
  min-width: 0;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
  color: #cac4d0;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-chip-active {
  background: #d0bcff;
  color: #381e72;
}

.pdf-viewer {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.pdf-viewer header {
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: 9px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 8px 12px;
}

.pdf-viewer header span {
  min-width: 0;
  flex: 1;
}

.pdf-viewer header strong,
.pdf-viewer header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-viewer header small {
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.pdf-viewer header em {
  border-radius: 999px;
  background: #f3edf7;
  color: #79747e;
  flex: 0 0 auto;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
  padding: 5px 8px;
}

.pdf-viewer header button,
.map-view header button {
  border: 0;
  border-radius: 10px;
  background: #eaddff;
  color: #4f378b;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 800;
  padding: 7px 9px;
}

.pdf-viewer main {
  display: flex;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.pdf-viewer aside {
  display: flex;
  width: 96px;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  border-right: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 10px 8px;
}

.pdf-page {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 10px;
  background: #fffbff;
  color: #79747e;
  font-size: 11px;
  font-weight: 700;
  padding: 7px;
  text-align: left;
}

.pdf-page-active {
  border-color: #6750a4;
  background: #eaddff;
  color: #4f378b;
}

.pdf-page i {
  display: block;
  height: 40px;
  border-radius: 6px;
  background: #f3edf7;
  margin-bottom: 6px;
}

.pdf-page span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-viewer article {
  display: flex;
  width: min(260px, 72%);
  min-width: 160px;
  max-height: 230px;
  flex: 0 1 auto;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 3px;
  background: white;
  color: #1d192b;
  margin: auto;
  padding: 16px;
  box-shadow: 0 12px 28px rgb(31 28 38 / 0.16);
}

.pdf-viewer article strong,
.pdf-viewer article span,
.pdf-viewer article p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-viewer article strong {
  font-size: 12px;
}

.pdf-viewer article span {
  display: block;
  height: 8px;
  border-radius: 999px;
  background: #d8d2e4;
}

.pdf-viewer article span:nth-of-type(2) {
  width: 66%;
}

.pdf-viewer article div {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: 1fr 0.8fr;
  gap: 8px;
  overflow: hidden;
}

.pdf-viewer article p {
  height: 6px;
  border-radius: 999px;
  background: #cac4d0;
  margin: 0 0 6px;
}

.pdf-viewer article b {
  display: block;
  height: 48px;
  border-radius: 8px;
  background: #f3edf7;
}

.pdf-viewer footer {
  display: flex;
  height: 36px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  overflow: hidden;
  border-top: 1px solid #d8d2e4;
  background: #f9f6fb;
  color: #79747e;
  font-size: 11px;
  padding: 0 12px;
}

.pdf-viewer footer span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-view {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.map-view header {
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: 9px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 8px 12px;
}

.map-view header span {
  min-width: 0;
  flex: 1;
}

.map-view header strong,
.map-view header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-view header small {
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.map-canvas {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgb(20 108 67 / 0.13) 1px, transparent 1px),
    linear-gradient(180deg, rgb(20 108 67 / 0.13) 1px, transparent 1px),
    #eef4ef;
  background-size: 34px 34px;
}

.map-canvas svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: #146c43;
  opacity: 0.9;
}

.map-canvas path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 3;
}

.map-marker {
  position: absolute;
  display: flex;
  max-width: 38%;
  min-width: 0;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  border: 1px solid #146c43;
  border-radius: 999px;
  background: white;
  color: #146c43;
  font-size: 11px;
  font-weight: 800;
  padding: 6px 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-shadow: 0 8px 18px rgb(31 28 38 / 0.12);
}

.map-marker i {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: currentColor;
}

.map-marker-1 {
  left: 15%;
  top: 58%;
}

.map-marker-2 {
  left: 48%;
  top: 34%;
}

.map-marker-3 {
  right: 14%;
  top: 24%;
  border-color: #ba1a1a;
  background: #ffdad6;
  color: #ba1a1a;
}

.map-canvas aside {
  position: absolute;
  left: 12px;
  bottom: 12px;
  max-width: 68%;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: rgb(255 255 255 / 0.9);
  padding: 9px 10px;
  box-shadow: 0 8px 18px rgb(31 28 38 / 0.12);
}

.map-canvas aside strong,
.map-canvas aside small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-canvas aside strong {
  font-size: 11px;
}

.map-canvas aside small {
  color: #49454f;
  font-size: 11px;
  margin-top: 3px;
}

.graphics-view {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.graphics-view header {
  display: flex;
  min-height: 46px;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 8px 12px;
}

.graphics-view header span {
  min-width: 0;
  flex: 1;
}

.graphics-view header strong,
.graphics-view header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.graphics-view header small {
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.graphics-view header em {
  border-radius: 999px;
  background: rgb(103 80 164 / 0.12);
  color: #6750a4;
  flex: 0 0 auto;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
  padding: 5px 8px;
}

.graphics-scene {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgb(202 196 208 / 0.42) 1px, transparent 1px),
    linear-gradient(180deg, rgb(202 196 208 / 0.42) 1px, transparent 1px),
    #f9f6fb;
  background-size: 32px 32px;
}

.graphics-scene svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: rgb(103 80 164 / 0.48);
  pointer-events: none;
}

.graphics-scene path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 3;
}

.graphics-node {
  position: absolute;
  min-width: 108px;
  max-width: 46%;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
  color: #49454f;
  padding: 9px 11px;
  text-align: left;
  box-shadow: 0 8px 18px rgb(31 28 38 / 0.12);
}

.graphics-node:hover,
.graphics-node-1 {
  border-color: #6750a4;
  background: #eaddff;
  color: #4f378b;
}

.graphics-node-1 {
  left: 12%;
  top: 18%;
}

.graphics-node-2 {
  right: 10%;
  top: 32%;
}

.graphics-node-3 {
  left: 30%;
  bottom: 16%;
}

.graphics-node strong {
  display: block;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.graphics-node span {
  display: block;
  width: 66%;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  margin-top: 7px;
  opacity: 0.22;
}

.graphics-view footer {
  display: flex;
  height: 40px;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  border-top: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 0 10px;
}

.graphics-view footer small {
  min-width: 0;
  overflow: hidden;
  border-radius: 999px;
  background: #f3edf7;
  color: #79747e;
  padding: 5px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.button-muted {
  border: 1px solid #d8d2e4;
  background: #f4eff7;
  color: #49454f;
}

.button-group {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  align-items: stretch;
  gap: 4px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  padding: 4px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.button-group-item {
  min-width: 0;
  flex: 1 1 0;
  overflow: hidden;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: #49454f;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  padding: 0 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.button-group-item:hover {
  background: #f4eff7;
}

.button-group-item-active {
  background: #e8def8;
  color: #4f378b;
  box-shadow: 0 4px 14px rgb(31 28 38 / 0.08);
}

.button-group-item:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.dialog-button-box {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  padding: 8px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.dialog-button {
  min-width: 76px;
  max-width: 140px;
  height: 36px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: transparent;
  color: #6750a4;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  padding: 0 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-button:hover {
  background: #f4eff7;
}

.dialog-button-primary {
  border-color: #6750a4;
  background: #6750a4;
  color: #fff;
}

.dialog-button-primary:hover {
  background: #5b4695;
}

.dialog-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.command-link-button {
  display: grid;
  width: 100%;
  height: 100%;
  min-width: 0;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  grid-template-rows: 1fr 1fr;
  align-items: center;
  column-gap: 12px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 12px 14px;
  text-align: left;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.command-link-button:disabled {
  cursor: not-allowed;
  opacity: 0.64;
}

.command-link-button:not(:disabled):hover {
  border-color: #d0bcff;
  background: #f7f1fb;
}

.command-link-button span {
  display: grid;
  grid-row: 1 / 3;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 999px;
  background: #eaddff;
  color: #6750a4;
  font-size: 18px;
  font-weight: 800;
}

.command-link-button strong,
.command-link-button small,
.command-link-button em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-link-button strong {
  align-self: end;
  font-size: 14px;
}

.command-link-button small {
  align-self: start;
  color: #79747e;
  font-size: 12px;
}

.command-link-button em {
  grid-row: 1 / 3;
  border-radius: 999px;
  background: #f3edf7;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 5px 9px;
}

.split-button {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid rgb(103 80 164 / 0.18);
  border-radius: 999px;
  background: #6750a4;
  color: white;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.16);
}

.split-button button {
  min-width: 0;
  border: 0;
  background: transparent;
  color: inherit;
}

.split-button button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.split-button-main {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
}

.split-button-main strong,
.split-button-main small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.split-button-main strong {
  font-size: 13px;
}

.split-button-main small {
  max-width: 88px;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.16);
  padding: 3px 8px;
  font-size: 11px;
}

.split-button-menu {
  width: 44px;
  flex: 0 0 auto;
  border-left: 1px solid rgb(255 255 255 / 0.2) !important;
  background: rgb(0 0 0 / 0.06) !important;
  font-size: 18px;
}

.split-button:not(.split-button-loading) button:hover {
  background: rgb(255 255 255 / 0.1);
}

.tool-button {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #f3edf7;
  color: #49454f;
  padding: 8px;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.07);
}

.tool-button:disabled {
  cursor: not-allowed;
  opacity: 0.64;
}

.tool-button:not(:disabled):hover {
  border-color: #d0bcff;
  background: #eaddff;
  color: #21005d;
}

.toggle-button-active {
  border-color: #6750a4;
  background: #eaddff;
  color: #21005d;
}

.toggle-button-active span {
  color: #4f378b;
}

.tool-button-danger {
  border-color: rgb(186 26 26 / 0.35);
  background: rgb(186 26 26 / 0.1);
  color: #ba1a1a;
}

.tool-button span {
  color: #6750a4;
  font-size: 16px;
  line-height: 1;
}

.tool-button strong {
  max-width: 100%;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.range-slider {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 20px;
  background: #fffbff;
  color: #49454f;
  padding: 12px 14px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.range-slider > span,
.range-slider > small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.range-slider > span {
  font-size: 12px;
  font-weight: 700;
}

.range-slider > div {
  position: relative;
  height: 28px;
}

.range-slider > div::before {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 4px;
  border-radius: 999px;
  background: #e7e0ec;
  content: "";
  transform: translateY(-50%);
}

.range-slider > div i {
  position: absolute;
  top: 50%;
  height: 4px;
  border-radius: 999px;
  background: #6750a4;
  transform: translateY(-50%);
}

.range-slider input {
  position: absolute;
  inset: 0;
  width: 100%;
  margin: 0;
  appearance: none;
  background: transparent;
  pointer-events: none;
}

.range-slider input::-webkit-slider-thumb {
  width: 18px;
  height: 18px;
  border: 2px solid #6750a4;
  border-radius: 999px;
  appearance: none;
  background: #fffbff;
  box-shadow: 0 2px 10px rgb(31 28 38 / 0.18);
  pointer-events: auto;
}

.range-slider input:last-of-type::-webkit-slider-thumb {
  background: #6750a4;
}

.range-slider input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: 2px solid #6750a4;
  border-radius: 999px;
  background: #fffbff;
  box-shadow: 0 2px 10px rgb(31 28 38 / 0.18);
  pointer-events: auto;
}

.range-slider > small {
  color: #79747e;
  font-size: 11px;
}

.plain-text-edit,
.rich-text-editor,
.calendar-widget {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.plain-text-edit {
  background: #17151b;
  color: #f7f2fa;
}

.plain-text-edit > span,
.rich-text-editor header,
.calendar-widget header {
  display: flex;
  min-height: 38px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid rgb(216 210 228 / 0.82);
  padding: 9px 12px;
  font-size: 12px;
  font-weight: 700;
}

.plain-text-edit > span {
  border-bottom-color: rgb(255 251 255 / 0.12);
  color: #eaddff;
}

.plain-text-edit textarea,
.rich-text-editor textarea {
  min-height: 0;
  min-width: 0;
  flex: 1;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  padding: 12px;
  line-height: 1.55;
}

.plain-text-edit textarea {
  color: #f7f2fa;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}

.plain-text-edit textarea::placeholder {
  color: rgb(247 242 250 / 0.48);
}

.plain-text-edit small,
.rich-text-editor > small,
.calendar-widget > small {
  overflow: hidden;
  border-top: 1px solid rgb(216 210 228 / 0.68);
  padding: 7px 12px;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plain-text-edit small {
  border-top-color: rgb(255 251 255 / 0.12);
  color: rgb(247 242 250 / 0.66);
}

.code-editor {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #2b2930;
  border-radius: 18px;
  background: #17151b;
  color: #f7f2fa;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.18);
}

.code-editor header,
.code-editor footer {
  display: flex;
  min-height: 38px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgb(255 251 255 / 0.1);
  background: #211f26;
  padding: 8px 12px;
}

.code-editor header span {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: #f7f2fa;
  font-size: 12px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.code-editor header em,
.code-editor header b {
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
  color: #d0bcff;
  flex: 0 0 auto;
  font-size: 10px;
  font-style: normal;
  font-weight: 800;
  padding: 4px 7px;
}

.code-editor > div {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: 42px minmax(0, 1fr);
  overflow: hidden;
}

.code-editor pre {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
  overflow: hidden;
  border-right: 1px solid rgb(255 251 255 / 0.08);
  color: #79747e;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.55;
  margin: 0;
  padding: 12px 9px;
  user-select: none;
}

.code-editor textarea {
  min-width: 0;
  min-height: 0;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  color: #f7f2fa;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.55;
  padding: 12px;
}

.code-editor textarea::placeholder {
  color: rgb(247 242 250 / 0.46);
}

.code-editor footer {
  min-height: 32px;
  justify-content: space-between;
  border-top: 1px solid rgb(255 251 255 / 0.1);
  border-bottom: 0;
  color: #cac4d0;
  font-size: 11px;
}

.code-editor footer small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rich-text-editor header {
  justify-content: flex-start;
}

.rich-text-editor header small {
  min-width: 0;
  margin-left: auto;
  overflow: hidden;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rich-text-editor header button {
  width: 28px;
  height: 26px;
  border: 1px solid #d8d2e4;
  border-radius: 8px;
  background: #f7f2fa;
  color: #49454f;
  font-size: 12px;
  font-weight: 800;
}

.rich-text-editor header button:hover {
  border-color: #7d5260;
  background: #fceeee;
  color: #633b48;
}

.rich-text-editor textarea {
  color: #1d192b;
  font-size: 13px;
}

.calendar-widget {
  padding-bottom: 10px;
}

.calendar-widget header strong,
.calendar-widget header small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-widget header small {
  color: #79747e;
  font-size: 11px;
  font-weight: 600;
}

.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 5px;
  padding: 8px 10px 0;
}

.calendar-weekdays span {
  color: #79747e;
  font-size: 10px;
  font-weight: 800;
  text-align: center;
}

.calendar-day {
  min-width: 0;
  height: 30px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: #49454f;
  font-size: 12px;
  font-weight: 700;
}

.calendar-day:hover {
  border-color: #d8d2e4;
  background: #f7f2fa;
}

.calendar-day-active {
  border-color: #7d5260;
  background: #ffd8e4;
  color: #633b48;
}

.password-field-control {
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 8px;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
  padding: 4px 4px 4px 10px;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.07);
}

.password-field-control > span {
  flex: 0 0 auto;
  color: #79747e;
  font-size: 14px;
}

.password-field .password-field-control input {
  min-width: 0;
  min-height: 34px;
  flex: 1;
  border: 0;
  background: transparent;
  color: #1d192b;
  padding: 0;
}

.password-field .password-field-control button {
  height: 34px;
  flex: 0 0 auto;
  border: 1px solid transparent;
  border-radius: 10px;
  background: #f3edf7;
  color: #49454f;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 700;
}

.password-field .password-field-control button:hover {
  border-color: #d0bcff;
  background: #eaddff;
  color: #21005d;
}

.password-field small {
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.number-field-control {
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 8px;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
  padding: 4px;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.07);
}

.number-field .number-field-control input {
  min-width: 0;
  min-height: 34px;
  flex: 1;
  border: 0;
  background: transparent;
  color: #1d192b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  text-align: right;
}

.number-field .number-field-control button {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border: 1px solid transparent;
  border-radius: 10px;
  background: #f3edf7;
  color: #49454f;
  font-size: 18px;
  font-weight: 700;
}

.number-field .number-field-control button:hover {
  border-color: #d0bcff;
  background: #eaddff;
  color: #21005d;
}

.number-field small {
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spin-box-control {
  display: flex;
  min-height: 42px;
  flex: 1;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.07);
}

.spin-box input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1d192b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 14px;
  font-weight: 700;
  padding: 0 10px;
  text-align: right;
}

.spin-box-control > span {
  display: grid;
  width: 36px;
  flex: 0 0 auto;
  grid-template-rows: 1fr 1fr;
  border-left: 1px solid #d8d2e4;
}

.spin-box-control button {
  border: 0;
  background: #f3edf7;
  color: #49454f;
  font-size: 12px;
}

.spin-box-control button + button {
  border-top: 1px solid #d8d2e4;
}

.spin-box-control button:hover {
  background: #eaddff;
  color: #21005d;
}

.spin-box small {
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.double-spin-box .spin-box-control > span {
  width: 42px;
}

.double-spin-box .spin-box-control button {
  font-size: 10px;
  font-weight: 700;
}

.dial {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #49454f;
  padding: 10px;
  text-align: center;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.dial > span,
.dial small {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dial > span {
  color: #49454f;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}

.dial-face {
  position: relative;
  display: grid;
  width: 78px;
  height: 78px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: radial-gradient(circle, #fffbff 0 48%, #f3edf7 49% 100%);
  color: #1d192b;
}

.dial-face i {
  position: absolute;
  top: 8px;
  left: 50%;
  width: 4px;
  height: 27px;
  transform-origin: 50% 31px;
  border-radius: 999px;
  background: #6750a4;
}

.dial-face strong {
  font-size: 14px;
}

.dial input[type="range"] {
  width: 86%;
  height: 18px;
  accent-color: #6750a4;
  margin-top: 7px;
}

.dial small {
  color: #79747e;
  font-size: 11px;
}

.scroll-bar {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  color: #49454f;
  padding: 8px 10px;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.07);
}

.scroll-bar > span,
.scroll-bar small {
  overflow: hidden;
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scroll-bar div {
  display: grid;
  min-width: 0;
  grid-template-columns: 30px minmax(0, 1fr) 30px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 12px;
  background: #f9f6fb;
}

.scroll-bar button {
  border: 0;
  background: #f3edf7;
  color: #49454f;
  font-size: 11px;
}

.scroll-bar button:first-child {
  border-right: 1px solid #d8d2e4;
}

.scroll-bar button:last-child {
  border-left: 1px solid #d8d2e4;
}

.scroll-bar input[type="range"] {
  width: 100%;
  height: 28px;
  accent-color: #6750a4;
}

.scroll-bar small {
  color: #79747e;
}

.color-picker,
.file-picker,
.shortcut-recorder {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  gap: 9px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 20px;
  background: #fffbff;
  color: #49454f;
  padding: 12px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.color-picker header,
.file-picker > span,
.shortcut-recorder > span {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  font-weight: 700;
}

.color-picker code {
  overflow: hidden;
  color: #79747e;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.color-picker-body,
.file-picker div,
.shortcut-recorder div {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.color-picker input[type="color"] {
  width: 42px;
  height: 34px;
  flex: 0 0 auto;
  border: 1px solid #d8d2e4;
  border-radius: 12px;
  background: white;
  padding: 3px;
}

.color-swatch {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgb(31 28 38 / 0.1);
}

.color-swatch-active {
  outline: 2px solid rgb(103 80 164 / 0.35);
  outline-offset: 2px;
}

.color-picker small,
.file-picker small {
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-picker input {
  min-width: 0;
  height: 40px;
  flex: 1;
  border: 1px solid #d8d2e4;
  border-radius: 12px;
  background: #f9f6fb;
  color: #1d192b;
  padding: 0 10px;
}

.file-picker .button {
  width: auto;
  height: 40px;
  min-width: 82px;
  padding: 0 14px;
}

.shortcut-recorder {
  border: 1px solid #d8d2e4;
  cursor: pointer;
  text-align: left;
}

.shortcut-recorder div {
  overflow: hidden;
}

.shortcut-recorder kbd {
  flex: 0 0 auto;
  border: 1px solid #d8d2e4;
  border-bottom-color: #c8c0d4;
  border-radius: 9px;
  background: #f3edf7;
  color: #1d192b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 9px;
  box-shadow: inset 0 -1px 0 rgb(31 28 38 / 0.12);
}

.shortcut-recorder small {
  min-width: 0;
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.combobox input {
  background-image: linear-gradient(45deg, transparent 50%, #79747e 50%), linear-gradient(135deg, #79747e 50%, transparent 50%);
  background-position: calc(100% - 18px) 18px, calc(100% - 13px) 18px;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  padding-right: 34px;
}

.autocomplete-field {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 120px;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 20px;
  background: #fffbff;
  padding: 12px;
  box-shadow: 0 10px 28px rgb(31 28 38 / 0.08);
}

.autocomplete-field label {
  display: grid;
  gap: 6px;
  color: #49454f;
  font-size: 12px;
  font-weight: 700;
}

.autocomplete-field input {
  width: 100%;
  min-width: 0;
  height: 38px;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fef7ff;
  color: #1d192b;
  font-size: 14px;
  outline: none;
  padding: 0 12px;
}

.autocomplete-field input:focus {
  border-color: #6750a4;
  box-shadow: 0 0 0 3px rgb(103 80 164 / 0.14);
}

.autocomplete-options {
  display: grid;
  min-height: 0;
  gap: 4px;
  overflow: hidden;
}

.autocomplete-option {
  display: flex;
  min-width: 0;
  height: 30px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #49454f;
  cursor: pointer;
  font: inherit;
  padding: 0 9px;
  text-align: left;
}

.autocomplete-option span:first-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.autocomplete-option:hover {
  background: #f4eff7;
}

.autocomplete-option-active {
  background: #eaddff;
  color: #21005d;
  font-weight: 700;
}

.autocomplete-empty {
  border: 1px dashed #cac4d0;
  border-radius: 10px;
  color: #79747e;
  font-size: 12px;
  padding: 8px;
}

.autocomplete-field > small {
  min-width: 0;
  overflow: hidden;
  color: #79747e;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-combo-box select {
  min-height: 42px;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background-color: #fffbff;
  color: #1d192b;
  font-size: 14px;
  padding: 0 34px 0 12px;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.07);
}

.search-bar {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 10px;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: #f4eff7;
  padding: 0 16px;
  color: #49454f;
}

.search-bar input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1d1b20;
}

.search-bar small {
  max-width: 35%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-picker input {
  flex: 1;
}

.date-range-picker {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #f9f6fb;
  color: #1d192b;
  padding: 14px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.date-range-picker header {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.date-range-picker header strong,
.date-range-picker header small,
.date-range-presets button {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-range-picker header small {
  color: #79747e;
  font-size: 12px;
}

.date-range-fields {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
}

.date-range-fields label {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
  color: #79747e;
  font-size: 11px;
  font-weight: 650;
}

.date-range-fields input {
  min-width: 0;
  height: 38px;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
  color: #1d192b;
  padding: 0 10px;
}

.date-range-presets {
  display: flex;
  min-width: 0;
  gap: 6px;
  overflow: hidden;
}

.date-range-presets button {
  min-width: 0;
  border: 0;
  border-radius: 999px;
  background: #e8def8;
  color: #4f378b;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 750;
}

.time-picker input {
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 16px;
  font-weight: 700;
}

.date-time-picker input {
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  font-weight: 700;
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

.system-tray {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 12px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.system-tray header {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #f9f6fb;
  padding: 8px 10px;
}

.system-tray-mark {
  position: relative;
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 16px;
  background: #eaddff;
  color: #6750a4;
  font-size: 18px;
  font-weight: 900;
}

.system-tray-mark i {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border: 2px solid #fffbff;
  border-radius: 999px;
  background: #006b5f;
}

.system-tray header div {
  min-width: 0;
  flex: 1;
}

.system-tray strong,
.system-tray small,
.system-tray p,
.system-tray em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.system-tray header strong {
  display: block;
  font-size: 13px;
}

.system-tray header small {
  display: block;
  margin-top: 2px;
  color: #79747e;
  font-size: 11px;
}

.system-tray header em {
  max-width: 58px;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 4px 8px;
}

.system-tray p {
  margin: 0;
  color: #79747e;
  font-size: 12px;
}

.system-tray-menu {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 6px;
  overflow: hidden;
}

.system-tray-row {
  display: grid;
  width: 100%;
  min-width: 0;
  grid-template-columns: 16px minmax(0, 1fr) 42px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 12px;
  background: #f9f6fb;
  color: #49454f;
  padding: 8px 9px;
  text-align: left;
}

.system-tray-row-active,
.system-tray-row:hover {
  background: #eaddff;
  color: #4f378b;
}

.system-tray-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #6750a4;
}

.system-tray-dot-warn {
  background: #7d5260;
}

.system-tray-dot-danger {
  background: #ba1a1a;
}

.system-tray-row small {
  color: inherit;
  font-size: 10px;
  text-align: right;
}

.runtime-card {
  overflow: hidden;
  border-radius: 22px;
  background: #fffbff;
  padding: 18px;
  color: #1d192b;
  text-align: left;
}

button.runtime-card {
  cursor: pointer;
}

button.runtime-card:hover {
  filter: brightness(0.985);
}

.elevated-card {
  border-color: transparent;
  background: #fffbff;
  box-shadow: 0 12px 30px rgb(31 28 38 / 0.16);
}

.filled-card {
  border-color: transparent;
  background: #f3edf7;
  box-shadow: 0 4px 14px rgb(31 28 38 / 0.08);
}

.outlined-card {
  border-color: #79747e;
  background: #fffbff;
  box-shadow: none;
}

.runtime-card-header {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.runtime-card-header span {
  min-width: 0;
}

.runtime-card-header strong,
.runtime-card-header p,
.runtime-card small {
  overflow: hidden;
  text-overflow: ellipsis;
}

.runtime-card-header strong {
  display: block;
  color: #1d192b;
  font-size: 15px;
  font-weight: 750;
  white-space: nowrap;
}

.runtime-card-header p {
  display: -webkit-box;
  margin: 8px 0 0;
  color: #79747e;
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.runtime-card-header em {
  flex: 0 0 auto;
  max-width: 84px;
  overflow: hidden;
  border-radius: 999px;
  background: #e8def8;
  color: #4f378b;
  padding: 5px 9px;
  font-size: 11px;
  font-style: normal;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runtime-card progress {
  margin-top: auto;
}

.runtime-card small {
  display: block;
  color: #79747e;
  font-size: 11px;
  white-space: nowrap;
}

.group-box {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 18px 16px 16px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.group-box legend {
  max-width: 80%;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: #fffbff;
  color: #1d192b;
  font-size: 12px;
  font-weight: 800;
  padding: 5px 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-box p {
  display: -webkit-box;
  overflow: hidden;
  color: #79747e;
  font-size: 12px;
  line-height: 1.5;
  margin: 0 0 10px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.group-box > div {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 8px;
  overflow: hidden;
}

.group-box label {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 58px;
  align-items: center;
  gap: 10px;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #f9f6fb;
  color: #49454f;
  font-size: 12px;
  padding: 8px 10px;
}

.group-box label span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-box-meter {
  height: 8px;
  border-radius: 999px;
  background: #e7e0ec;
}

.group-box-meter-active {
  background: #6750a4;
}

.spacer {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px dashed #79747e;
  border-radius: 18px;
  background: #f9f6fb;
  color: #79747e;
  padding: 10px;
  text-align: center;
}

.spacer span {
  color: #6750a4;
  font-size: 18px;
  line-height: 1;
}

.spacer strong,
.spacer small {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spacer strong {
  color: #1d192b;
  font-size: 12px;
  margin-top: 4px;
}

.spacer small {
  font-size: 11px;
  margin-top: 2px;
}

.tab-row,
.toolbar-actions {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.tab-row .button,
.toolbar-actions .button {
  width: auto;
  height: 32px;
  padding: 0 12px;
  white-space: nowrap;
}

.segmented {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 4px;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: #f3edf7;
  padding: 4px;
}

.segment {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #49454f;
  padding: 9px 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.segment-active {
  background: #e8def8;
  color: #1d192b;
  box-shadow: 0 4px 14px rgb(31 28 38 / 0.12);
}

.rating-control {
  justify-content: center;
  gap: 8px;
}

.rating-stars {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 4px;
}

.rating-star {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 12px;
  background: #f3edf7;
  color: #79747e;
  font-size: 17px;
}

.rating-star-active {
  background: #e8def8;
  color: #6750a4;
}

.chip-set {
  display: flex;
  width: 100%;
  height: 100%;
  flex-wrap: wrap;
  align-content: center;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  padding: 10px;
}

.tag-input {
  display: grid;
  width: 100%;
  height: 100%;
  min-width: 0;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 20px;
  background: #fffbff;
  padding: 10px;
}

.tag-input label {
  display: grid;
  min-width: 0;
  gap: 6px;
}

.tag-input label span {
  overflow: hidden;
  color: #49454f;
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-input input {
  width: 100%;
  min-width: 0;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #f9f6fb;
  color: #1d192b;
  padding: 8px 10px;
}

.tag-input .chip-set {
  height: auto;
  min-height: 0;
  align-content: start;
  overflow: hidden;
  padding: 6px;
}

.chip {
  max-width: 100%;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: #f9f6fb;
  color: #49454f;
  padding: 8px 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-active {
  border-color: #6750a4;
  background: #e8def8;
  color: #1d192b;
}

.md3-chip {
  display: inline-flex;
  height: 40px;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.md3-chip span,
.md3-chip em {
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgb(103 80 164 / 0.12);
  color: #6750a4;
  font-style: normal;
}

.floating-toolbar {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: rgb(255 251 255 / 0.94);
  padding: 8px;
  box-shadow: 0 10px 28px rgb(31 28 38 / 0.18);
}

.floating-toolbar > span {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #eaddff;
  color: #6750a4;
}

.floating-toolbar strong {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: #1d192b;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.floating-toolbar-action {
  max-width: 72px;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #49454f;
  padding: 8px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 800;
}

.floating-toolbar-action-active {
  background: #e8def8;
  color: #1d192b;
}

.menu-card {
  padding: 10px;
}

.menu-item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #1d1b20;
  padding: 10px 12px;
  text-align: left;
}

.menu-item:hover {
  background: #f3edf7;
}

.menu-item-active {
  background: #e8def8;
  color: #21005d;
  font-weight: 700;
}

.menu-item-active:hover {
  background: #eaddff;
}

.list-row {
  width: 100%;
  border: 0;
  border-radius: 12px;
  background: #f9f6fb;
  color: #1d1b20;
  padding: 10px 12px;
  text-align: left;
}

.command-list {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.1);
}

.command-list header {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
  border-bottom: 1px solid #d8d2e4;
  padding: 12px 14px 10px;
}

.command-list header strong,
.command-list header small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-list header small {
  color: #79747e;
}

.command-list label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 12px 8px;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: #f9f6fb;
  color: #6750a4;
  padding: 0 12px;
}

.command-list input {
  min-width: 0;
  height: 38px;
  flex: 1;
  border: 0;
  background: transparent;
  color: #1d192b;
  outline: none;
}

.search-view > small {
  margin: 0 12px 10px;
}

.command-list-results {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 0 8px 8px;
}

.command-list-row {
  display: grid;
  width: 100%;
  grid-template-columns: 28px minmax(0, 1fr) 46px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: #49454f;
  padding: 8px;
  text-align: left;
}

.command-list-row:hover,
.command-list-row-active {
  background: #e8def8;
  color: #1d192b;
}

.command-list-row span {
  display: flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #fffbff;
  color: #6750a4;
  font-size: 11px;
  font-weight: 700;
}

.command-list-row strong,
.command-list-row small,
.command-list-empty {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-list-row strong {
  min-width: 0;
  font-size: 13px;
}

.command-list-row small {
  justify-self: end;
  color: #79747e;
  font-size: 11px;
}

.command-list-empty {
  border: 1px dashed #d8d2e4;
  border-radius: 14px;
  color: #79747e;
  padding: 14px;
  text-align: center;
}

.tree-view {
  padding: 14px;
}

.tree-root,
.tree-row {
  display: block;
  width: 100%;
  overflow: hidden;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #49454f;
  padding: 8px 10px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-row {
  margin-left: 16px;
  width: calc(100% - 16px);
}

.tree-row-active {
  background: #e8def8;
  color: #1d192b;
}

.tree-table {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.tree-table header {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
  border-bottom: 1px solid #d8d2e4;
  padding: 12px 14px;
}

.tree-table header strong,
.tree-table header small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-table header small {
  color: #79747e;
}

.tree-table-head,
.tree-table-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 82px 70px;
  align-items: center;
  gap: 8px;
}

.tree-table-head {
  border-bottom: 1px solid #d8d2e4;
  background: #f3edf7;
  color: #79747e;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 12px;
  text-transform: uppercase;
}

.tree-table-body {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.tree-table-row {
  width: 100%;
  border: 0;
  border-bottom: 1px solid #d8d2e4;
  background: transparent;
  color: #49454f;
  padding: 9px 12px;
  text-align: left;
}

.tree-table-row:hover,
.tree-table-row-active {
  background: rgb(103 80 164 / 0.1);
  color: #1d192b;
}

.tree-table-row span,
.tree-table-row b,
.tree-table-row small,
.tree-table-row em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-table-row span {
  display: flex;
  min-width: 0;
  gap: 6px;
}

.tree-table-row b {
  min-width: 0;
  font-size: 13px;
}

.tree-table-row small {
  border-radius: 999px;
  background: #e8def8;
  color: #1d192b;
  padding: 3px 8px;
  font-size: 11px;
}

.tree-table-row em {
  color: #79747e;
  font-style: normal;
  font-size: 12px;
}

.top-app-bar {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: white;
  padding: 10px 12px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.top-app-bar > span {
  min-width: 0;
  flex: 1;
}

.top-app-bar small {
  display: block;
  overflow: hidden;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-app-bar > div {
  display: flex;
  gap: 6px;
}

.bottom-app-bar {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 24px;
  background: white;
  padding: 10px 12px;
  box-shadow: 0 10px 28px rgb(31 28 38 / 0.1);
}

.bottom-app-bar > span {
  min-width: 0;
  flex: 1;
}

.bottom-app-bar small {
  display: block;
  overflow: hidden;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom-app-bar > div {
  display: flex;
  gap: 6px;
}

.bottom-app-bar .button {
  width: auto;
  height: 34px;
  padding: 0 12px;
  white-space: nowrap;
}

.icon-button {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 999px;
  background: #f3edf7;
  color: #49454f;
  font-weight: 700;
}

.icon-action-button {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 999px;
  background: #e8def8;
  color: #1d192b;
  font-size: 18px;
  font-weight: 700;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.12);
}

.carousel {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 26px;
  background: #f9f6fb;
  padding: 12px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.carousel-card {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 12px;
  text-align: left;
}

.carousel-card-active {
  flex: 1.35;
  background: #e8def8;
}

.carousel-card span {
  width: 32px;
  height: 32px;
  margin-bottom: auto;
  border-radius: 14px;
  background: rgb(255 251 255 / 0.72);
  color: #6750a4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.carousel-card strong,
.carousel-card small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.carousel-card small {
  color: #79747e;
}

.fab-mini {
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 18px;
  background: #6750a4;
  color: white;
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgb(31 28 38 / 0.18);
}

.navigation-bar {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: space-around;
  gap: 4px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 28px;
  background: #f9f6fb;
  padding: 8px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.nav-bar-item {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  border: 0;
  border-radius: 18px;
  background: transparent;
  color: #79747e;
  padding: 6px;
  font-size: 12px;
  font-weight: 600;
}

.nav-bar-item span {
  display: flex;
  min-width: 54px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
}

.nav-bar-item-active {
  color: #1d192b;
}

.nav-bar-item-active span {
  background: #e8def8;
}

.navigation-suite {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 78px minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) 72px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 28px;
  background: #f9f6fb;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.1);
}

.navigation-suite aside {
  display: flex;
  min-height: 0;
  grid-row: 1 / span 2;
  flex-direction: column;
  gap: 8px;
  border-right: 1px solid #d8d2e4;
  background: #f3edf7;
  padding: 12px 8px;
}

.navigation-suite aside > strong {
  display: flex;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #6750a4;
  color: white;
  font-size: 12px;
  margin: 0 auto;
}

.navigation-suite main {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
}

.navigation-suite main header {
  min-width: 0;
}

.navigation-suite main small,
.navigation-suite main strong,
.navigation-suite main p,
.navigation-suite footer,
.navigation-suite-bar-item,
.navigation-suite-rail-item small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navigation-suite main small {
  color: #6750a4;
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
}

.navigation-suite main strong {
  display: block;
  margin-top: 4px;
  font-size: 16px;
}

.navigation-suite main p {
  color: #79747e;
  font-size: 12px;
}

.navigation-suite main div {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 8px;
}

.navigation-suite main div span,
.navigation-suite main div i {
  border-radius: 16px;
  background: #f3edf7;
}

.navigation-suite main div span:first-child {
  width: 78%;
}

.navigation-suite main div span:nth-child(2) {
  width: 56%;
}

.navigation-suite main div i {
  min-height: 54px;
  background: #e8def8;
}

.navigation-suite footer {
  border-radius: 999px;
  background: #fffbff;
  color: #6750a4;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 750;
}

.navigation-suite nav {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-around;
  gap: 4px;
  border-top: 1px solid #d8d2e4;
  background: #f3edf7;
  padding: 8px;
}

.navigation-suite-rail-item,
.navigation-suite-bar-item {
  min-width: 0;
  border: 0;
  border-radius: 18px;
  background: transparent;
  color: #79747e;
  font-size: 11px;
  font-weight: 650;
}

.navigation-suite-rail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
}

.navigation-suite-bar-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px;
}

.navigation-suite-item-active {
  background: #e8def8;
  color: #1d192b;
}

.menu-bar,
.breadcrumb-bar,
.status-bar {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  padding: 4px 8px;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.08);
}

.menu-bar span,
.status-bar span,
.breadcrumb-bar span {
  min-width: 0;
}

.menu-bar > span,
.status-bar > span {
  flex: 1;
  overflow: hidden;
  color: #79747e;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-bar-item,
.breadcrumb-item,
.status-bar button {
  height: 30px;
  min-width: 0;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #49454f;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
}

.menu-bar-item-active,
.breadcrumb-item-active,
.status-bar button {
  background: #e8def8;
  color: #1d192b;
}

.breadcrumb-bar {
  gap: 2px;
}

.breadcrumb-bar > span {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #79747e;
  font-size: 12px;
}

.status-bar small {
  flex: 0 0 auto;
  border-radius: 999px;
  background: #f3edf7;
  color: #79747e;
  padding: 4px 8px;
  font-size: 11px;
}

.split-view {
  display: grid;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 24px;
  background: #f9f6fb;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.split-pane {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  border: 0;
  background: transparent;
  color: #1d192b;
  padding: 12px;
  text-align: left;
}

.split-pane span {
  height: 28px;
  border-radius: 10px;
  background: #f3edf7;
}

.split-pane i {
  min-height: 0;
  flex: 1;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
}

.split-pane-main i {
  background: linear-gradient(90deg, #f3edf7 0 48%, #fffbff 48% 100%);
}

.split-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d8d2e4;
}

.split-handle::after {
  width: 4px;
  height: 40px;
  border-radius: 999px;
  background: #79747e;
  content: "";
}

.splitter {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #f9f6fb;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.splitter header {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #d8d2e4;
  padding: 9px 12px;
}

.splitter header span {
  min-width: 0;
  flex: 1;
}

.splitter header strong,
.splitter header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.splitter header small {
  color: #79747e;
  font-size: 11px;
}

.splitter header em {
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 4px 8px;
}

.splitter-body {
  display: grid;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.splitter-pane {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  padding: 12px;
}

.splitter-pane strong,
.splitter-pane small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.splitter-pane span {
  height: 28px;
  border-radius: 10px;
  background: #f3edf7;
}

.splitter-pane-main span {
  min-height: 0;
  flex: 1;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
}

.splitter-handle {
  position: relative;
  display: grid;
  min-width: 0;
  place-items: center;
  background: #d8d2e4;
  cursor: col-resize;
}

.splitter-handle input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: col-resize;
  opacity: 0;
}

.splitter-handle i {
  width: 5px;
  height: 44px;
  border-radius: 999px;
  background: #6750a4;
  pointer-events: none;
}

.size-grip {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  color: #1d192b;
  padding: 12px;
  text-align: left;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
  cursor: nwse-resize;
}

.size-grip span {
  min-width: 0;
  max-width: calc(100% - 34px);
}

.size-grip strong,
.size-grip small,
.size-grip em {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.size-grip strong {
  font-size: 12px;
}

.size-grip small {
  margin-top: 4px;
  color: #79747e;
  font-size: 11px;
}

.size-grip em {
  width: fit-content;
  max-width: 100%;
  margin-top: 10px;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 4px 8px;
}

.size-grip i {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 34px;
  height: 34px;
  border-right: 2px solid #79747e;
  border-bottom: 2px solid #79747e;
  border-bottom-right-radius: 12px;
}

.size-grip b {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 22px;
  height: 22px;
  border-right: 2px solid #d8d2e4;
  border-bottom: 2px solid #d8d2e4;
  border-bottom-right-radius: 8px;
}

.size-grip b:last-child {
  right: 16px;
  bottom: 16px;
  width: 10px;
  height: 10px;
}

.size-grip:hover {
  border-color: #6750a4;
  background: #f7f2fa;
}

.supporting-pane {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: minmax(0, 1fr) minmax(150px, 220px);
  grid-template-rows: minmax(0, 1fr) 48px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 26px;
  background: #f9f6fb;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.1);
}

.supporting-pane main {
  min-width: 0;
  min-height: 0;
  padding: 16px;
}

.supporting-pane main header {
  min-width: 0;
}

.supporting-pane main small,
.supporting-pane main strong,
.supporting-pane main p,
.supporting-pane aside header strong,
.supporting-pane-item strong,
.supporting-pane-item small,
.supporting-pane footer {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.supporting-pane main small {
  color: #6750a4;
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
}

.supporting-pane main strong {
  display: block;
  margin-top: 4px;
  font-size: 16px;
}

.supporting-pane main p {
  color: #79747e;
  font-size: 12px;
}

.supporting-pane main div {
  display: grid;
  min-height: 0;
  height: calc(100% - 70px);
  gap: 8px;
  margin-top: 14px;
}

.supporting-pane main div span,
.supporting-pane main div i,
.supporting-pane main div b {
  border-radius: 16px;
  background: #f3edf7;
}

.supporting-pane main div span:first-child {
  width: 74%;
  height: 12px;
}

.supporting-pane main div span:nth-child(2) {
  width: 52%;
  height: 12px;
}

.supporting-pane main div i {
  min-height: 54px;
  background: #e8def8;
}

.supporting-pane main div b {
  min-height: 0;
  border: 1px solid #d8d2e4;
  background: #fffbff;
}

.supporting-pane aside {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-left: 1px solid #d8d2e4;
  background: #f3edf7;
  padding: 12px;
}

.supporting-pane aside header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.supporting-pane aside header em {
  flex: 0 0 auto;
  border-radius: 999px;
  background: #e8def8;
  color: #4f378b;
  padding: 4px 8px;
  font-size: 11px;
  font-style: normal;
  font-weight: 750;
}

.supporting-pane-item {
  display: block;
  width: 100%;
  min-width: 0;
  border: 0;
  border-radius: 18px;
  background: #fffbff;
  color: #49454f;
  margin-bottom: 8px;
  padding: 10px;
  text-align: left;
}

.supporting-pane-item strong,
.supporting-pane-item small {
  display: block;
}

.supporting-pane-item small {
  margin-top: 4px;
  color: #79747e;
  font-size: 11px;
}

.supporting-pane-item-active {
  background: #e8def8;
  color: #1d192b;
  box-shadow: 0 4px 14px rgb(31 28 38 / 0.1);
}

.supporting-pane footer {
  grid-column: 1 / span 2;
  border-top: 1px solid #d8d2e4;
  color: #79747e;
  padding: 14px 16px;
  font-size: 12px;
}

.scroll-area {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.scroll-area header {
  display: grid;
  min-height: 50px;
  grid-template-columns: 22px minmax(0, 1fr) 8px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #d8d2e4;
  padding: 10px 12px;
}

.scroll-area header > span {
  color: #6750a4;
}

.scroll-area header div,
.scroll-area header strong,
.scroll-area header small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scroll-area header small {
  display: block;
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.scroll-area header i {
  width: 6px;
  height: 30px;
  border-radius: 999px;
  background: #d8d2e4;
}

.scroll-area-body {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 8px 10px 8px 8px;
}

.scroll-area-row {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) 54px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: #49454f;
  padding: 8px 10px;
  text-align: left;
}

.scroll-area-row:hover,
.scroll-area-row-active {
  background: rgb(103 80 164 / 0.1);
  color: #1d192b;
}

.scroll-area-row strong,
.scroll-area-row small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scroll-area-row strong {
  min-width: 0;
  font-size: 12px;
}

.scroll-area-row small {
  color: #79747e;
  font-size: 11px;
  text-align: right;
}

.stacked-pages {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.stacked-pages header {
  display: grid;
  min-height: 50px;
  grid-template-columns: 22px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #d8d2e4;
  padding: 10px 12px;
}

.stacked-pages header > span {
  color: #6750a4;
}

.stacked-pages header div,
.stacked-pages header strong,
.stacked-pages header small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stacked-pages header small {
  display: block;
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.stacked-pages nav {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #d8d2e4;
  background: #f3edf7;
  padding: 6px 8px;
}

.stacked-page-tab {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #79747e;
  font-size: 12px;
  font-weight: 700;
  padding: 7px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stacked-page-tab-active {
  background: #eaddff;
  color: #4f378b;
}

.stacked-page-body {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 10px;
  padding: 12px;
}

.stacked-page-body strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stacked-page-body span,
.stacked-page-body i {
  border-radius: 12px;
  background: #f3edf7;
}

.stacked-page-body span {
  height: 26px;
}

.stacked-page-body i {
  min-height: 0;
  border: 1px solid #d8d2e4;
  background: #fffbff;
}

.tool-box {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.tool-box header {
  border-bottom: 1px solid #d8d2e4;
  padding: 12px 14px;
}

.tool-box header strong,
.tool-box header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-box header small {
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.tool-box-item {
  display: grid;
  width: calc(100% - 16px);
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: #49454f;
  margin: 4px 8px;
  padding: 9px 10px;
  text-align: left;
}

.tool-box-item:hover,
.tool-box-item-active {
  background: rgb(103 80 164 / 0.1);
  color: #1d192b;
}

.tool-box-item span,
.tool-box-item strong,
.tool-box-item small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-box-item span {
  color: #6750a4;
}

.tool-box-item strong {
  min-width: 0;
  font-size: 13px;
}

.tool-box-item small {
  grid-column: 2;
  color: #79747e;
  font-size: 11px;
  margin-top: -2px;
}

.dock-panel {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.dock-panel header {
  display: flex;
  min-height: 46px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 8px 10px 8px 12px;
}

.dock-panel header span {
  min-width: 0;
  flex: 1;
}

.dock-panel header small {
  display: block;
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dock-panel header button {
  width: 26px;
  height: 26px;
  border: 1px solid #d8d2e4;
  border-radius: 8px;
  background: #f3edf7;
  color: #49454f;
}

.dock-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #d8d2e4;
  background: #f3edf7;
  padding: 6px 8px;
}

.dock-tab {
  min-width: 0;
  flex: 1;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #79747e;
  font-size: 12px;
  font-weight: 700;
  overflow: hidden;
  padding: 7px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dock-tab-active {
  background: #eaddff;
  color: #4f378b;
}

.dock-panel-body {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 10px;
  padding: 12px;
}

.dock-panel-body span,
.dock-panel-body i {
  border-radius: 12px;
  background: #f3edf7;
}

.dock-panel-body span {
  height: 28px;
}

.dock-panel-body i {
  min-height: 0;
  border: 1px solid #d8d2e4;
  background: #fffbff;
}

.chart-view {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.chart-view header {
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 9px 12px;
}

.chart-view header span {
  min-width: 0;
  flex: 1;
}

.chart-view header strong,
.chart-view header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-view header small {
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.chart-view header em {
  border-radius: 999px;
  background: rgb(103 80 164 / 0.12);
  color: #6750a4;
  flex: 0 0 auto;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
  padding: 5px 8px;
}

.chart-plot {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  background: #fffbff;
  margin: 12px;
  border: 1px solid #d8d2e4;
  border-radius: 16px;
}

.chart-plot svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.chart-grid {
  fill: none;
  stroke: #d8d2e4;
  stroke-width: 1;
}

.chart-line {
  fill: none;
  stroke: #6750a4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 4;
}

.chart-bars {
  position: absolute;
  inset: auto 14px 12px;
  display: flex;
  height: 48%;
  align-items: flex-end;
  gap: 7px;
}

.chart-bars i {
  min-width: 0;
  flex: 1;
  border-radius: 10px 10px 0 0;
  background: rgb(103 80 164 / 0.16);
}

.chart-view footer {
  display: flex;
  height: 40px;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  border-top: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 0 10px;
}

.chart-legend {
  min-width: 0;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: #f3edf7;
  color: #79747e;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-legend-active {
  background: #eaddff;
  color: #4f378b;
}

.mdi-area {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.mdi-area header {
  display: flex;
  min-height: 46px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 8px 12px;
}

.mdi-area header span {
  min-width: 0;
  flex: 1;
}

.mdi-area header strong,
.mdi-area header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mdi-area header small {
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.mdi-area header em {
  border-radius: 999px;
  background: rgb(103 80 164 / 0.12);
  color: #6750a4;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
  padding: 5px 8px;
}

.mdi-stage {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  background: #f3edf7;
}

.mdi-window {
  position: absolute;
  display: flex;
  min-width: 132px;
  min-height: 92px;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
  color: #49454f;
  padding: 0;
  text-align: left;
  box-shadow: 0 10px 24px rgb(31 28 38 / 0.12);
}

.mdi-window-active {
  z-index: 4;
  border-color: #6750a4;
  color: #1d192b;
  box-shadow: 0 14px 32px rgb(31 28 38 / 0.18);
}

.mdi-window-a {
  left: 5%;
  top: 14%;
  width: 56%;
  height: 58%;
}

.mdi-window-b {
  right: 7%;
  top: 24%;
  width: 46%;
  height: 50%;
}

.mdi-window-c {
  left: 24%;
  bottom: 8%;
  width: 50%;
  height: 38%;
}

.mdi-window-title {
  display: flex;
  min-height: 32px;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 7px 9px;
}

.mdi-window-active .mdi-window-title {
  border-color: rgb(103 80 164 / 0.24);
  background: #eaddff;
  color: #4f378b;
}

.mdi-window-title i {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #cac4d0;
}

.mdi-window-title i:nth-child(1) {
  background: #ba1a1a;
}

.mdi-window-title i:nth-child(2) {
  background: #7d5260;
}

.mdi-window-title i:nth-child(3) {
  background: #6750a4;
}

.mdi-window-title strong {
  min-width: 0;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mdi-window-body {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-rows: 10px 10px minmax(0, 1fr);
  gap: 8px;
  padding: 12px;
}

.mdi-window-body b,
.mdi-window-body small {
  border-radius: 999px;
  background: #f3edf7;
}

.mdi-window-body b:nth-child(2) {
  width: 66%;
}

.mdi-window-body small {
  border: 1px solid #d8d2e4;
  border-radius: 12px;
  background: #f9f6fb;
}

.data-grid,
.table-view,
.list-view,
.column-view,
.icon-view,
.property-grid,
.key-value-list,
.inspector-section {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.data-grid header,
.table-view header,
.list-view header,
.column-view header,
.icon-view header,
.property-grid header,
.key-value-list header,
.inspector-section header {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #d8d2e4;
  padding: 10px 12px;
}

.data-grid header span,
.table-view header span,
.list-view header span,
.column-view header span,
.icon-view header span,
.property-grid header span,
.key-value-list header span {
  min-width: 0;
  flex: 1;
}

.inspector-section header strong {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-view header em,
.list-view header em,
.column-view header em,
.icon-view header em,
.property-grid header em,
.key-value-list header em {
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 4px 8px;
}

.data-grid small,
.table-view small,
.list-view small,
.column-view small,
.icon-view small,
.property-grid small,
.key-value-list small,
.inspector-section small,
.form-layout small {
  display: block;
  overflow: hidden;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-grid-head,
.data-grid-row {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 82px 56px;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.data-grid-head {
  border-bottom: 1px solid #d8d2e4;
  background: #f3edf7;
  color: #79747e;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.data-grid-row {
  border: 0;
  border-bottom: 1px solid #ece6f0;
  background: transparent;
  color: #49454f;
  font-size: 12px;
  text-align: left;
}

.data-grid-row-active {
  background: #f3edf7;
  color: #1d192b;
}

.data-grid-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-view-head,
.table-view-row {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(76px, 0.75fr) minmax(76px, 0.75fr);
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.table-view-head {
  border-bottom: 1px solid #d8d2e4;
  background: #f3edf7;
  color: #79747e;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.table-view-body {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.table-view-row {
  width: 100%;
  border: 0;
  border-bottom: 1px solid #ece6f0;
  background: transparent;
  color: #49454f;
  font-size: 12px;
  text-align: left;
}

.table-view-row:nth-child(even) {
  background: #fffbff;
}

.table-view-row:hover,
.table-view-row-active {
  background: #f3edf7;
  color: #1d192b;
}

.table-view-row span,
.table-view-head span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-view-row span:first-child {
  font-weight: 700;
}

.list-view-body {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 4px;
  overflow: hidden;
  padding: 8px;
}

.list-view-row {
  display: grid;
  width: 100%;
  min-width: 0;
  grid-template-columns: 34px minmax(0, 1fr);
  grid-template-rows: auto auto;
  align-items: center;
  column-gap: 10px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: #49454f;
  padding: 9px 10px;
  text-align: left;
}

.list-view-row:hover,
.list-view-row-active {
  background: #f3edf7;
  color: #1d192b;
}

.list-view-row > span {
  display: grid;
  grid-row: 1 / 3;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 12px;
  background: #eaddff;
  color: #6750a4;
  font-size: 12px;
  font-weight: 800;
}

.list-view-row strong,
.list-view-row small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-view-row strong {
  font-size: 13px;
}

.list-view-row small {
  color: #79747e;
  font-size: 11px;
}

.column-view-body {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
}

.column-view-column {
  min-width: 0;
  overflow: hidden;
  border-right: 1px solid #d8d2e4;
}

.column-view-column:last-child {
  border-right: 0;
}

.column-view-column > strong {
  display: block;
  overflow: hidden;
  border-bottom: 1px solid #d8d2e4;
  background: #f3edf7;
  color: #79747e;
  font-size: 11px;
  padding: 8px 10px;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.column-view-row {
  display: flex;
  width: calc(100% - 12px);
  min-width: 0;
  height: 32px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #49454f;
  font-size: 12px;
  margin: 6px;
  padding: 0 8px;
  text-align: left;
}

.column-view-row:hover,
.column-view-row-active {
  background: #f3edf7;
  color: #1d192b;
}

.column-view-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.column-view-row em {
  color: #79747e;
  font-style: normal;
}

.icon-view-body {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  overflow: hidden;
  padding: 10px;
}

.icon-view-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 16px;
  background: #fef7ff;
  color: #49454f;
  padding: 10px 8px;
  text-align: center;
}

.icon-view-item:hover,
.icon-view-item-active {
  border-color: #6750a4;
  background: #eaddff;
  color: #21005d;
}

.icon-view-item > span {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 16px;
  background: #fffbff;
  color: #6750a4;
  font-weight: 800;
}

.icon-view-item strong,
.icon-view-item small {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-view-item strong {
  font-size: 12px;
}

.icon-view-item small {
  color: #79747e;
  font-size: 11px;
}

.property-grid-head,
.property-grid-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr) 74px;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.property-grid-head {
  border-bottom: 1px solid #d8d2e4;
  background: #f3edf7;
  color: #79747e;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.property-grid-row {
  border: 0;
  border-bottom: 1px solid #ece6f0;
  background: transparent;
  color: #49454f;
  font-size: 12px;
  text-align: left;
}

.property-grid-row-active {
  background: #f3edf7;
  color: #1d192b;
}

.property-grid-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.property-grid-row span:nth-child(2) {
  border: 1px solid #d8d2e4;
  border-radius: 10px;
  background: #f9f6fb;
  padding: 5px 8px;
}

.property-grid-row span:nth-child(3) {
  color: #79747e;
  font-size: 11px;
  text-transform: uppercase;
}

.key-value-row {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  align-items: center;
  gap: 10px;
  border: 0;
  border-bottom: 1px solid #ece6f0;
  background: transparent;
  color: #49454f;
  font-size: 12px;
  padding: 9px 12px;
  text-align: left;
}

.key-value-row-active {
  background: #f3edf7;
  color: #1d192b;
}

.key-value-row span,
.key-value-row strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.key-value-row strong {
  border: 1px solid #d8d2e4;
  border-radius: 10px;
  background: #f9f6fb;
  color: #1d192b;
  font-weight: 600;
  padding: 5px 8px;
}

.inspector-section {
  background: #f9f6fb;
}

.inspector-section header {
  min-height: 44px;
  background: #fffbff;
}

.inspector-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 92px;
  align-items: center;
  gap: 8px;
  margin: 6px 8px 0;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #49454f;
  font-size: 12px;
  padding: 8px;
  text-align: left;
}

.inspector-row-active {
  background: #eaddff;
  color: #4f378b;
}

.inspector-row span,
.inspector-row em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inspector-row em {
  border: 1px solid #d8d2e4;
  border-radius: 10px;
  background: #fffbff;
  color: #1d192b;
  font-style: normal;
  padding: 5px 8px;
  text-align: right;
}

.console-panel {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #2b2930;
  border-radius: 22px;
  background: #17151b;
  color: #f7f2fa;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.18);
}

.console-panel header {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
  padding: 9px 12px;
}

.console-panel header strong {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.console-panel header small {
  max-width: 42%;
  overflow: hidden;
  color: #cac4d0;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.console-panel > div {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 10px;
}

.console-row {
  display: grid;
  width: 100%;
  grid-template-columns: 52px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #cac4d0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  padding: 7px 8px;
  text-align: left;
}

.console-row-active {
  background: rgb(255 255 255 / 0.1);
  color: white;
}

.console-row span,
.console-row code {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.console-row span {
  color: #8bd5ca;
}

.console-row code {
  font-family: inherit;
}

.terminal-view {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #2b2930;
  border-radius: 22px;
  background: #101116;
  color: #f7f2fa;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.18);
}

.terminal-view header {
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
  background: #1b1c22;
  padding: 9px 12px;
}

.terminal-view header strong {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.terminal-view header small {
  overflow: hidden;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
  color: #d0bcff;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 7px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.terminal-view > div {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 10px 12px;
}

.terminal-cwd,
.terminal-success {
  overflow: hidden;
  margin: 0 0 4px;
  color: #79747e;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.terminal-success {
  color: #a6da95;
}

.terminal-line {
  display: grid;
  width: 100%;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 6px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #cac4d0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  padding: 5px 6px;
  text-align: left;
}

.terminal-line-active {
  background: rgb(255 255 255 / 0.08);
  color: #f7f2fa;
}

.terminal-line span,
.terminal-view label span {
  color: #8bd5ca;
}

.terminal-line code {
  overflow: hidden;
  font-family: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.terminal-view label {
  display: grid;
  min-height: 40px;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 6px;
  border-top: 1px solid rgb(255 255 255 / 0.1);
  background: #1b1c22;
  padding: 8px 12px;
}

.terminal-view input {
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #f7f2fa;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}

.terminal-view input::placeholder {
  color: rgb(247 242 250 / 0.45);
}

.timeline {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.timeline header {
  display: grid;
  min-height: 48px;
  grid-template-columns: 22px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #d8d2e4;
  padding: 10px 12px;
}

.timeline header span {
  color: #6750a4;
}

.timeline header strong,
.timeline header small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline header small {
  grid-column: 2;
  color: #79747e;
  font-size: 11px;
}

.timeline > div {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 10px;
}

.timeline-row {
  display: grid;
  width: 100%;
  grid-template-columns: 24px minmax(0, 1fr) 48px 62px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: #49454f;
  padding: 8px;
  text-align: left;
}

.timeline-row:hover,
.timeline-row-active {
  background: rgb(103 80 164 / 0.1);
  color: #1d192b;
}

.timeline-rail {
  position: relative;
  display: flex;
  justify-content: center;
}

.timeline-rail i {
  position: absolute;
  top: 13px;
  width: 1px;
  height: 26px;
  background: #d8d2e4;
}

.timeline-rail b {
  position: relative;
  z-index: 1;
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #6750a4;
}

.timeline-row strong,
.timeline-row small,
.timeline-row em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline-row strong {
  min-width: 0;
  font-size: 13px;
}

.timeline-row small {
  color: #79747e;
  font-size: 11px;
}

.timeline-row em {
  border-radius: 999px;
  background: #f3edf7;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 3px 8px;
  text-align: center;
}

.status-indicator {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 12px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.status-indicator header {
  display: grid;
  min-height: 42px;
  grid-template-columns: 34px minmax(0, 1fr) minmax(52px, auto);
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.status-indicator-icon {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 999px;
  background: #eaddff;
  color: #6750a4;
  font-weight: 700;
}

.status-indicator header div,
.status-indicator header strong,
.status-indicator header small,
.status-indicator header em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-indicator header small {
  display: block;
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.status-indicator header em {
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 4px 8px;
  text-align: center;
}

.status-indicator > div {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 6px;
  overflow: hidden;
}

.status-indicator-row {
  display: grid;
  width: 100%;
  grid-template-columns: 12px minmax(0, 1fr) 58px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: #49454f;
  padding: 8px 10px;
  text-align: left;
}

.status-indicator-row:hover,
.status-indicator-row-active {
  background: rgb(103 80 164 / 0.1);
  color: #1d192b;
}

.status-indicator-row span {
  width: 9px;
  height: 9px;
  border-radius: 999px;
}

.status-indicator-good span {
  background: #006a60;
}

.status-indicator-warn span {
  background: #7d5700;
}

.status-indicator-bad span {
  background: #ba1a1a;
}

.status-indicator-row strong,
.status-indicator-row small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-indicator-row strong {
  min-width: 0;
  font-size: 13px;
}

.status-indicator-row small {
  color: #79747e;
  font-size: 11px;
  text-align: right;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #6750a4;
}

.dot-muted {
  background: #79747e;
}

.form-layout {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  padding: 14px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.form-layout header,
.form-layout footer {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.form-layout header {
  flex-direction: column;
  align-items: flex-start;
}

.form-layout label {
  display: grid;
  min-width: 0;
  grid-template-columns: 110px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.form-layout label span {
  overflow: hidden;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.form-layout input {
  min-width: 0;
  height: 34px;
  border: 1px solid #d8d2e4;
  border-radius: 12px;
  background: #f9f6fb;
  color: #1d192b;
  padding: 0 10px;
}

.form-layout input[aria-invalid="true"] {
  border-color: #ba1a1a;
  background: #ffdad6;
  color: #410002;
}

.accordion {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.accordion header {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
  border-bottom: 1px solid #d8d2e4;
  padding: 12px 14px;
}

.accordion header strong,
.accordion header small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.accordion header small {
  color: #79747e;
}

.accordion-item {
  display: grid;
  width: 100%;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr) 24px;
  gap: 8px;
  border: 0;
  border-bottom: 1px solid #d8d2e4;
  background: transparent;
  color: #49454f;
  padding: 10px 12px;
  text-align: left;
}

.accordion-item:hover {
  background: #f7f2fa;
}

.accordion-item-active {
  background: rgb(103 80 164 / 0.1);
  color: #1d192b;
}

.accordion-item span {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.accordion-item b,
.accordion-item i,
.accordion-item small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.accordion-item b {
  min-width: 0;
  font-size: 13px;
}

.accordion-item i {
  flex: 0 0 auto;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  color: #79747e;
  font-size: 11px;
  font-style: normal;
  padding: 2px 7px;
}

.accordion-item em {
  justify-self: end;
  color: #6750a4;
  font-style: normal;
}

.accordion-item small {
  grid-column: 1 / -1;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
  color: #79747e;
  padding: 9px 10px;
}

.navigation-drawer {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 28px;
  background: #f9f6fb;
  padding: 14px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.navigation-drawer header {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
  padding: 4px 8px 10px;
}

.navigation-drawer small {
  overflow: hidden;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawer-item {
  width: 100%;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #49454f;
  padding: 10px 14px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawer-item-active {
  background: #e8def8;
  color: #1d192b;
}

.side-sheet {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 28px 18px 18px 28px;
  background: white;
  padding: 16px;
  box-shadow: 0 12px 32px rgb(31 28 38 / 0.12);
}

.side-sheet p {
  overflow: hidden;
  margin: 0;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sheet-section {
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-radius: 14px;
  background: #f9f6fb;
  padding: 10px 12px;
}

.sheet-section small {
  color: #79747e;
}

.bottom-sheet {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 28px 28px 18px 18px;
  background: white;
  padding: 10px 16px 16px;
  box-shadow: 0 12px 32px rgb(31 28 38 / 0.14);
}

.sheet-handle {
  width: 42px;
  height: 4px;
  flex: 0 0 auto;
  align-self: center;
  border-radius: 999px;
  background: #cac4d0;
}

.bottom-sheet p {
  overflow: hidden;
  margin: 0;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom-sheet-options {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.bottom-sheet .sheet-section {
  border: 0;
  color: #1d192b;
  text-align: center;
}

.empty-state {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px dashed #cac4d0;
  border-radius: 24px;
  background: #fffbff;
  padding: 20px;
  text-align: center;
}

.empty-state > span {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: #e8def8;
  color: #4f378b;
  font-size: 22px;
  font-weight: 700;
}

.empty-state p {
  display: -webkit-box;
  max-width: 100%;
  overflow: hidden;
  color: #79747e;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.empty-state .button {
  width: auto;
  height: 34px;
  padding: 0 14px;
}

.empty-panel {
  display: grid;
  width: 100%;
  height: 100%;
  min-width: 0;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  overflow: hidden;
  border: 1px dashed #cac4d0;
  border-radius: 22px;
  background: #fffbff;
  padding: 16px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.empty-panel > span {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 20px;
  background: #f3edf7;
  color: #6750a4;
  font-size: 22px;
  font-weight: 800;
}

.empty-panel div,
.empty-panel strong,
.empty-panel p,
.empty-panel small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-panel strong {
  display: block;
  white-space: nowrap;
}

.empty-panel p {
  display: -webkit-box;
  margin: 5px 0 0;
  color: #79747e;
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.empty-panel footer {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.empty-panel .button {
  width: auto;
  height: 32px;
  padding: 0 12px;
}

.empty-panel small {
  color: #79747e;
  white-space: nowrap;
}

.stepper {
  justify-content: center;
}

.step-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.step {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: #f9f6fb;
  color: #49454f;
  padding: 8px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step span {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f0edf4;
  font-size: 12px;
  font-weight: 700;
}

.step-active {
  background: #e8def8;
  color: #1d192b;
}

.step-active span {
  background: #6750a4;
  color: white;
}

.wizard {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: minmax(132px, 0.42fr) minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 24px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 10px 28px rgb(31 28 38 / 0.1);
}

.wizard aside {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  border-right: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 16px;
}

.wizard aside > strong,
.wizard aside > small {
  overflow: hidden;
  text-overflow: ellipsis;
}

.wizard aside > strong {
  white-space: nowrap;
}

.wizard aside > small {
  display: -webkit-box;
  color: #79747e;
  font-size: 11px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.wizard-step {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: #49454f;
  padding: 8px 10px;
  text-align: left;
}

.wizard-step:hover,
.wizard-step-active {
  background: #eaddff;
  color: #4f378b;
}

.wizard-step span {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f0edf4;
  font-size: 12px;
  font-weight: 800;
}

.wizard-step-active span {
  background: #6750a4;
  color: white;
}

.wizard-step b {
  min-width: 0;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wizard main {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.wizard main header {
  border-bottom: 1px solid #d8d2e4;
  padding: 12px 16px;
}

.wizard main header small,
.wizard main header strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wizard main header small {
  color: #6750a4;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.wizard main header strong {
  margin-top: 3px;
  font-size: 16px;
}

.wizard main > div {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-rows: 12px 12px minmax(0, 1fr);
  gap: 10px;
  padding: 16px;
}

.wizard main > div span,
.wizard main > div i {
  border-radius: 999px;
  background: #f3edf7;
}

.wizard main > div span:nth-child(2) {
  width: 66%;
}

.wizard main > div i {
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #f9f6fb;
}

.wizard footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 12px 16px;
}

.banner {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px 12px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  padding: 16px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.banner p {
  overflow: hidden;
  margin: 0;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner .button {
  grid-row: 1 / span 2;
  grid-column: 2;
  align-self: center;
  width: auto;
  height: 34px;
  padding: 0 14px;
}

.banner-danger {
  border-color: #f2b8b5;
  background: #fff8f7;
}

.alert-card {
  display: grid;
  width: 100%;
  height: 100%;
  min-width: 0;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 12px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  color: #1d192b;
  padding: 14px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.alert-card > span {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 999px;
  background: #e8def8;
  color: #4f378b;
  font-weight: 900;
}

.alert-card strong,
.alert-card p {
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-card strong {
  display: block;
  white-space: nowrap;
}

.alert-card p {
  display: -webkit-box;
  margin: 4px 0 0;
  color: #79747e;
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.alert-card .button {
  width: auto;
  height: 30px;
  margin-top: 8px;
  padding: 0 12px;
}

.alert-card-danger {
  border-color: #f2b8b5;
  background: #fff8f7;
}

.alert-card-danger > span {
  background: #ba1a1a;
  color: white;
}

.navigation-rail {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 26px;
  background: #f9f6fb;
  padding: 12px 8px;
}

.navigation-rail strong {
  max-width: 100%;
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.rail-item {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: 0;
  border-radius: 18px;
  background: transparent;
  color: #49454f;
  padding: 8px 4px;
  font-size: 11px;
}

.rail-item span {
  display: inline-flex;
  width: 44px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f0edf4;
}

.rail-item-active span {
  background: #e8def8;
  color: #4f378b;
}

.dialog-card {
  border-radius: 28px;
  padding: 22px;
}

.popover-card {
  position: relative;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 12px;
  overflow: hidden;
}

.popover-panel {
  width: 100%;
  border: 1px solid #d8d2e4;
  border-radius: 20px;
  background: #fffbff;
  padding: 14px;
  box-shadow: 0 18px 44px rgb(31 28 38 / 0.16);
}

.popover-panel div {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.popover-panel span {
  max-width: 100%;
  overflow: hidden;
  border-radius: 999px;
  background: #e8def8;
  color: #21005d;
  padding: 5px 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;
}

.tooltip-demo {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: white;
}

.tooltip-anchor {
  border-radius: 999px;
  background: #f3edf7;
  color: #1d1b20;
  padding: 10px 16px;
  font-weight: 700;
}

.tooltip-bubble {
  position: absolute;
  left: 50%;
  bottom: 10px;
  max-width: calc(100% - 24px);
  transform: translateX(-50%);
  overflow: hidden;
  border-radius: 12px;
  background: #322f35;
  color: #f5eff7;
  padding: 8px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.snackbar {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 14px;
  border-radius: 18px;
  background: #322f35;
  color: #f5eff7;
  padding: 12px 16px;
  box-shadow: 0 10px 28px rgb(31 28 38 / 0.22);
}

.snackbar span {
  min-width: 0;
  flex: 1;
}

.snackbar p {
  overflow: hidden;
  margin: 3px 0 0;
  color: #cac4d0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.snackbar button {
  border: 0;
  border-radius: 999px;
  background: #e8def8;
  color: #1d192b;
  padding: 8px 12px;
  font-weight: 800;
}

.toast-card {
  display: grid;
  width: 100%;
  height: 100%;
  min-width: 0;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 12px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 20px;
  background: #fffbff;
  color: #1d192b;
  padding: 12px;
  box-shadow: 0 16px 38px rgb(31 28 38 / 0.16);
}

.toast-card > span {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 999px;
  background: #e8def8;
  color: #4f378b;
  font-weight: 900;
}

.toast-card header {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.toast-card strong,
.toast-card small,
.toast-card p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast-card small {
  color: #79747e;
  font-size: 10px;
}

.toast-card p {
  margin: 4px 0 0;
  color: #79747e;
  font-size: 12px;
}

.toast-card button {
  width: auto;
  height: 28px;
  margin-top: 8px;
  border: 0;
  border-radius: 999px;
  background: #e8def8;
  color: #1d192b;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 800;
}

.fab {
  display: inline-flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 0;
  border-radius: 22px;
  background: #6750a4;
  color: white;
  padding: 0 18px;
  font-weight: 800;
  box-shadow: 0 10px 24px rgb(31 28 38 / 0.22);
}

.fab span {
  font-size: 20px;
  line-height: 1;
}

.extended-fab {
  min-width: 0;
  border-radius: 18px;
}

.extended-fab strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar-row {
  justify-content: flex-start;
  text-align: left;
}

.avatar {
  display: inline-flex;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #6750a4;
  color: white;
  font-weight: 800;
}

.avatar-group {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 14px 16px;
  text-align: left;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.avatar-group > span {
  min-width: 0;
}

.avatar-group strong,
.avatar-group p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar-group p {
  margin: 3px 0 0;
  color: #79747e;
  font-size: 12px;
}

.avatar-group > div {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
}

.avatar-group-item {
  width: 38px;
  height: 38px;
  border: 2px solid #fffbff;
  font-size: 11px;
}

.avatar-group-item + .avatar-group-item {
  margin-left: -12px;
}

.avatar-group-item-2 {
  background: #625b71;
}

.avatar-group-item-3 {
  background: #006b5f;
}

.avatar-group-item-4 {
  background: #7d5260;
}

.avatar-group em {
  display: grid;
  width: 34px;
  height: 34px;
  margin-left: -8px;
  place-items: center;
  border: 2px solid #fffbff;
  border-radius: 999px;
  background: #f3edf7;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
}

.lcd-display {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 22px;
  background: #17151b;
  color: #f7f2fa;
  padding: 16px;
  box-shadow: 0 10px 26px rgb(31 28 38 / 0.22);
}

.lcd-display small,
.lcd-display strong,
.lcd-display footer span,
.lcd-display footer em {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lcd-display small {
  color: #cac4d0;
  font-size: 12px;
}

.lcd-display strong {
  color: #8bd5ca;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 36px;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  margin-top: 8px;
}

.lcd-display footer {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
}

.lcd-display footer span {
  color: #cac4d0;
  font-size: 11px;
}

.lcd-display footer em {
  flex: 0 0 auto;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
  color: #f7f2fa;
  font-size: 11px;
  font-style: normal;
  padding: 4px 8px;
}

progress {
  width: 100%;
  height: 8px;
  accent-color: #6750a4;
}

.circular-progress {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 16px;
  text-align: center;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.circular-progress-ring {
  display: grid;
  width: 82px;
  height: 82px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 999px;
  margin-bottom: 12px;
}

.circular-progress-ring span {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border-radius: 999px;
  background: #fffbff;
  color: #1d192b;
  font-size: 14px;
  font-weight: 800;
}

.circular-progress strong,
.circular-progress small,
.circular-progress p {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.circular-progress strong {
  font-size: 14px;
}

.circular-progress small,
.circular-progress p {
  color: #79747e;
  font-size: 11px;
  margin: 2px 0 0;
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

@media (prefers-color-scheme: dark) {
  :root {
    color: #e6e1e5;
    background: #111318;
    color-scheme: dark;
  }

  body,
  .app,
  .app-dialog,
  .app-tool,
  .app-body,
  .workspace[data-runtime-panel="visible"],
  .canvas-viewport {
    background: #111318;
    color: #e6e1e5;
  }

  .app {
    box-shadow: inset 0 0 0 1px #44464f;
  }

  .app-titlebar-native,
  .app-titlebar-hidden,
  .app-titlebar-native .app-body,
  .app-titlebar-hidden .app-body,
  .app-titlebar-native .canvas-viewport,
  .app-titlebar-hidden .canvas-viewport,
  .canvas,
  .canvas-background-plain {
    background: #111318;
  }

  .canvas-background-soft {
    background:
      radial-gradient(circle at 18% 0%, rgb(208 188 255 / 0.12), transparent 32%),
      #111318;
  }

  .window-titlebar {
    border-bottom-color: #44464f;
    background:
      linear-gradient(180deg, rgb(29 27 32 / 0.97), rgb(20 19 24 / 0.94));
    color: #cac4d0;
  }

  .app-tool .window-titlebar {
    background: rgb(29 27 32 / 0.96);
  }

  .titlebar-mark {
    background: #4f378b;
    color: #eaddff;
  }

  .titlebar-title {
    color: #e6e1e5;
  }

  .titlebar-subtitle,
  .titlebar-status {
    color: #cac4d0;
  }

  .window-controls button {
    color: #cac4d0;
  }

  .window-controls button:hover {
    background: #2b2930;
  }

  .runtime-panel,
  .state-snapshot,
  .backend-health,
  .backend-log-card,
  .card,
  .group-box,
  .text-browser,
  .image-list,
  .command-link-button,
  .carousel-card,
  .field,
  .plain-text-edit,
  .rich-text-editor,
  .search-bar,
  .web-view,
  .pdf-viewer,
  .map-view,
  .panel-row,
  .graphics-view,
  .tree-table,
  .command-list,
  .scroll-area,
  .stacked-pages,
  .tool-box,
  .splitter,
  .size-grip,
  .dock-panel,
  .mdi-area,
  .navigation-drawer,
  .side-sheet,
  .bottom-sheet,
  .accordion,
  .empty-state,
  .empty-panel,
  .banner,
  .alert-card,
  .dialog-card,
  .popover-card,
  .toast-card,
  .wizard,
  .chart-view,
  .data-grid,
  .table-view,
  .list-view,
  .column-view,
  .icon-view,
  .property-grid,
  .key-value-list,
  .inspector-section,
  .form-layout,
  .console-panel,
  .timeline,
  .status-indicator,
  .avatar-group,
  .circular-progress {
    border-color: #44464f;
    background: #1d1b20;
    color: #e6e1e5;
    box-shadow: 0 12px 28px rgb(0 0 0 / 0.22);
  }

  .elevated-card {
    border-color: transparent;
    background: #211f26;
  }

  .filled-card {
    border-color: transparent;
    background: #2b2930;
  }

  .outlined-card {
    border-color: #938f99;
    background: #1d1b20;
    box-shadow: none;
  }

  .runtime-card-header strong {
    color: #e6e1e5;
  }

  .runtime-card-header p,
  .runtime-card small {
    color: #cac4d0;
  }

  .splitter header,
  .splitter header em,
  .splitter-pane-main span {
    border-color: #44464f;
  }

  .splitter header small,
  .splitter-pane small {
    color: #cac4d0;
  }

  .splitter-pane span,
  .splitter-pane-main span {
    background: #211f26;
  }

  .splitter-handle {
    background: #44464f;
  }

  .splitter-handle i {
    background: #d0bcff;
  }

  .size-grip,
  .size-grip em {
    border-color: #44464f;
  }

  .size-grip small {
    color: #cac4d0;
  }

  .size-grip em {
    background: #141218;
    color: #cac4d0;
  }

  .size-grip i {
    border-color: #d0bcff;
  }

  .size-grip b {
    border-color: #44464f;
  }

  .size-grip:hover {
    border-color: #d0bcff;
    background: #211f26;
  }

  .mdi-area header,
  .mdi-window-title,
  .dock-panel header,
  .stacked-pages nav,
  .dock-tabs {
    border-color: #44464f;
    background: #2b2930;
  }

  .mdi-stage {
    background: #141218;
  }

  .mdi-window {
    border-color: #44464f;
    background: #211f26;
    color: #cac4d0;
    box-shadow: 0 14px 28px rgb(0 0 0 / 0.28);
  }

  .mdi-window-active {
    border-color: #d0bcff;
    color: #e6e1e5;
  }

  .mdi-window-active .mdi-window-title {
    border-color: rgb(208 188 255 / 0.28);
    background: #4f378b;
    color: #eaddff;
  }

  .mdi-window-body b,
  .mdi-window-body small {
    border-color: #44464f;
    background: #2b2930;
  }

  .wizard aside,
  .wizard footer,
  .wizard main header {
    border-color: #44464f;
    background: #2b2930;
  }

  .wizard-step {
    color: #cac4d0;
  }

  .wizard-step:hover,
  .wizard-step-active {
    background: #4f378b;
    color: #eaddff;
  }

  .wizard-step span,
  .wizard main > div span,
  .wizard main > div i {
    border-color: #44464f;
    background: #1d1b20;
  }

  .wizard-step-active span {
    background: #d0bcff;
    color: #381e72;
  }

  .graphics-view header,
  .graphics-view footer {
    border-color: #44464f;
    background: #2b2930;
  }

  .graphics-scene {
    background:
      linear-gradient(90deg, rgb(147 143 153 / 0.24) 1px, transparent 1px),
      linear-gradient(180deg, rgb(147 143 153 / 0.24) 1px, transparent 1px),
      #141218;
    background-size: 32px 32px;
  }

  .graphics-node {
    border-color: #44464f;
    background: #211f26;
    color: #cac4d0;
  }

  .graphics-node:hover,
  .graphics-node-1 {
    border-color: #d0bcff;
    background: #4f378b;
    color: #eaddff;
  }

  .graphics-view footer small {
    background: #1d1b20;
    color: #cac4d0;
  }

  .web-view header,
  .web-view aside,
  .web-view footer {
    border-color: #44464f;
    background: #2b2930;
  }

  .web-view header span,
  .web-view article i {
    border-color: #44464f;
    background: #141218;
    color: #cac4d0;
  }

  .web-view article {
    background: #1d1b20;
  }

  .web-view article span,
  .web-view article i {
    background: #2b2930;
  }

  .web-tab {
    color: #cac4d0;
  }

  .web-tab-active,
  .web-view header button {
    background: #4f378b;
    color: #eaddff;
  }

  .pdf-viewer header,
  .pdf-viewer aside,
  .pdf-viewer footer,
  .map-view header {
    border-color: #44464f;
    background: #2b2930;
  }

  .pdf-viewer header small,
  .pdf-viewer header em,
  .pdf-viewer footer,
  .map-view header small {
    color: #cac4d0;
  }

  .pdf-viewer header em,
  .pdf-page,
  .pdf-page i {
    border-color: #44464f;
    background: #211f26;
    color: #cac4d0;
  }

  .pdf-page-active,
  .pdf-viewer header button,
  .map-view header button {
    border-color: #d0bcff;
    background: #4f378b;
    color: #eaddff;
  }

  .map-canvas {
    background:
      linear-gradient(90deg, rgb(208 188 255 / 0.12) 1px, transparent 1px),
      linear-gradient(180deg, rgb(208 188 255 / 0.12) 1px, transparent 1px),
      #111318;
  }

  .map-canvas svg {
    color: #80d4a5;
  }

  .map-marker {
    border-color: #80d4a5;
    background: #1d1b20;
    color: #80d4a5;
  }

  .map-marker-3 {
    border-color: #ffb4ab;
    background: #410002;
    color: #ffb4ab;
  }

  .map-canvas aside {
    border-color: #44464f;
    background: rgb(29 27 32 / 0.92);
    color: #e6e1e5;
  }

  .map-canvas aside small {
    color: #cac4d0;
  }

  .chart-view header,
  .chart-view footer {
    border-color: #44464f;
    background: #2b2930;
  }

  .chart-plot {
    border-color: #44464f;
    background: #141218;
  }

  .chart-grid {
    stroke: #44464f;
  }

  .chart-line {
    stroke: #d0bcff;
  }

  .chart-bars i {
    background: rgb(208 188 255 / 0.18);
  }

  .chart-legend {
    background: #1d1b20;
    color: #cac4d0;
  }

  .chart-legend-active {
    background: #4f378b;
    color: #eaddff;
  }

  input,
  textarea,
  select,
  .field input,
  .field textarea,
  .field select,
  .combobox input,
  .autocomplete-field input,
  .search-bar input,
  .command-list input,
  .form-layout input {
    border-color: #44464f;
    background: #141218;
    color: #e6e1e5;
  }

  input::placeholder,
  textarea::placeholder {
    color: #938f99;
  }

  .autocomplete-field {
    border-color: #44464f;
    background: #1d1b20;
    box-shadow: 0 10px 28px rgb(0 0 0 / 0.26);
  }

  .autocomplete-field label,
  .autocomplete-field > small,
  .autocomplete-empty {
    color: #cac4d0;
  }

  .autocomplete-field input:focus {
    border-color: #d0bcff;
    box-shadow: 0 0 0 3px rgb(208 188 255 / 0.18);
  }

  .autocomplete-option {
    color: #cac4d0;
  }

  .autocomplete-option:hover {
    background: #2b2930;
  }

  .autocomplete-option-active {
    background: #4f378b;
    color: #eaddff;
  }

  .autocomplete-empty {
    border-color: #44464f;
  }

  .button-group {
    border-color: #44464f;
    background: #1d1b20;
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.24);
  }

  .button-group-item {
    color: #cac4d0;
  }

  .button-group-item:hover {
    background: #2b2930;
  }

  .button-group-item-active {
    background: #4f378b;
    color: #eaddff;
  }

  .dialog-button-box {
    border-color: #44464f;
    background: #1d1b20;
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.24);
  }

  .dialog-button {
    border-color: #44464f;
    color: #d0bcff;
  }

  .dialog-button:hover {
    background: #2b2930;
  }

  .dialog-button-primary {
    border-color: #d0bcff;
    background: #d0bcff;
    color: #381e72;
  }

  .dialog-button-primary:hover {
    background: #eaddff;
  }

  .button-muted,
  .list-row,
  .tree-row,
  .tree-table-row,
  .command-list-row,
  .scroll-area-row,
  .inspector-row,
  .timeline-row,
  .status-indicator-row,
  .property-grid-row,
  .key-value-row,
  .data-grid-row,
  .table-view-row,
  .list-view-row,
  .column-view-row,
  .icon-view-item,
  .drawer-item,
  .accordion-item,
  .chip,
  .md3-chip,
  .floating-toolbar,
  .floating-toolbar-action,
  .segment,
  .dock-tab,
  .stacked-page-tab {
    border-color: #44464f;
    background: #211f26;
    color: #cac4d0;
  }

  .floating-toolbar strong {
    color: #e6e1e5;
  }

  .floating-toolbar > span,
  .md3-chip span,
  .md3-chip em,
  .floating-toolbar-action-active {
    background: #4f378b;
    color: #eaddff;
  }

  .system-tray,
  .system-tray header,
  .system-tray header em {
    border-color: #44464f;
    background: #1d1b20;
    color: #e6e1e5;
  }

  .system-tray header,
  .system-tray-row {
    background: #211f26;
  }

  .system-tray p,
  .system-tray header small {
    color: #cac4d0;
  }

  .system-tray-mark {
    background: #4f378b;
    color: #eaddff;
  }

  .system-tray-mark i {
    border-color: #1d1b20;
  }

  .system-tray-row {
    color: #cac4d0;
  }

  .system-tray-row-active,
  .system-tray-row:hover {
    background: #4f378b;
    color: #eaddff;
  }

  .data-grid-head,
  .table-view-head,
  .property-grid-head,
  .column-view-column > strong {
    border-color: #44464f;
    background: #141218;
    color: #cac4d0;
  }

  .column-view-column {
    border-color: #44464f;
  }

  .table-view-row:nth-child(even) {
    background: #211f26;
  }

  .button,
  .fab,
  .fab-mini,
  .badge,
  .chip-active,
  .segment-active,
  .dock-tab-active,
  .stacked-page-tab-active,
  .drawer-item-active,
  .accordion-item-active,
  .command-list-row-active,
  .tree-row-active,
  .tree-table-row-active,
  .scroll-area-row-active,
  .inspector-row-active,
  .timeline-row-active,
  .status-indicator-row-active,
  .property-grid-row-active,
  .key-value-row-active,
  .data-grid-row-active,
  .table-view-row-active,
  .list-view-row-active,
  .column-view-row-active {
    background: #4f378b;
    color: #eaddff;
  }

  .column-view-row em {
    color: #cac4d0;
  }

  .icon-view-item {
    border-color: #44464f;
    background: #211f26;
    color: #cac4d0;
  }

  .icon-view-item:hover,
  .icon-view-item-active {
    border-color: #d0bcff;
    background: #4f378b;
    color: #eaddff;
  }

  .icon-view-item > span {
    background: #141218;
    color: #d0bcff;
  }

  .icon-view-item small {
    color: #cac4d0;
  }

  .list-view-row > span {
    background: #4f378b;
    color: #eaddff;
  }

  .list-view-row small {
    color: #cac4d0;
  }

  .key-value-row strong,
  .property-grid-row span:nth-child(2) {
    border-color: #44464f;
    background: #141218;
    color: #e6e1e5;
  }

  .circular-progress-ring span {
    background: #111318;
    color: #e6e1e5;
  }
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
