// Extracted from generated_app_runtime.rs (workflow C1). Keep byte-stable.

pub const GENERATED_CAPTURE_WINDOW_SCRIPT: &str = r#"import fs from "node:fs/promises";
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
"#;
