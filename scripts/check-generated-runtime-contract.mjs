import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const runtime = read("src-tauri/src/generated_app_runtime.rs");
const config = read("src-tauri/src/generated_app_config.rs");
const projectModel = read("src-tauri/src/project_model.rs");

const checks = [];
const failures = [];

function addCheck(label, passed, detail) {
  checks.push(label);
  if (!passed) {
    failures.push({ label, detail });
  }
}

function mustContain(label, source, needle) {
  addCheck(label, source.includes(needle), `Expected source to contain ${needle}`);
}

function mustNotContain(label, source, needle) {
  addCheck(label, !source.includes(needle), `Expected source not to contain ${needle}`);
}

function mustMatch(label, source, pattern) {
  addCheck(label, pattern.test(source), `Expected source to match ${pattern}`);
}

mustContain("Generated app uses Windows subsystem", config, 'windows_subsystem = "windows"');
mustContain("Generated app computes custom chrome", config, 'let custom_chrome = release.titlebar_style != "native";');
mustContain("Generated app disables native decorations for custom chrome", config, "let decorations = !custom_chrome;");
mustContain("Generated app enables transparent shell for custom chrome", config, "let transparent = custom_chrome;");
mustContain("Generated app writes Tauri decorations from shell contract", config, '"decorations": {decorations}');
mustContain("Generated app writes Tauri transparency from shell contract", config, '"transparent": {transparent}');
mustContain("Generated app windows open maximized by default", config, '"maximized": true');

mustContain("Runtime shell exposes window kind", runtime, "data-window-kind={windowKind}");
mustContain("Runtime shell exposes titlebar style", runtime, "data-titlebar-style={titlebarStyle}");
mustContain("Runtime shell exposes runtime background", runtime, "data-runtime-background={runtimeBackground}");
mustContain("Runtime shell forces runtime grid off", runtime, 'data-runtime-grid="off"');
mustContain("Runtime shell exposes Nova desktop style contract", runtime, 'data-runtime-style-contract="nova-desktop-shell"');
mustContain("Runtime shell marks design artifacts absent", runtime, 'data-runtime-design-artifacts="none"');
mustContain("Runtime shell exposes editor parity frame", runtime, 'data-runtime-frame="nova-editor-parity"');
mustContain("Runtime shell exposes desktop density", runtime, 'data-runtime-density="desktop"');
mustContain("Runtime shell exposes Tauri platform", runtime, 'data-runtime-platform="tauri"');
mustContain("Runtime shell exposes design-only grid policy", runtime, 'data-runtime-grid-policy="design-only"');
mustContain("Runtime shell exposes chrome surface", runtime, 'data-runtime-surface={titlebarStyle === "nova" ? "custom-chrome" : "native-content"}');
mustContain("Runtime shell exposes shell style", runtime, 'data-runtime-shell={titlebarStyle === "nova" ? "nova" : titlebarStyle}');
mustNotContain("Runtime shell does not read design grid state", runtime, "showGrid");
mustContain("Runtime body exposes Nova surface", runtime, 'data-runtime-body="nova-surface"');
mustContain("Runtime viewport exposes runtime surface", runtime, 'data-runtime-surface="viewport"');
mustContain("Runtime app canvas exposes runtime surface", runtime, 'data-runtime-surface="app-canvas"');
mustContain("Runtime app canvas marks design grid absent", runtime, 'data-runtime-design-grid="absent"');
mustContain("Runtime app canvas marks rulers absent", runtime, 'data-runtime-rulers="absent"');

mustContain("Runtime titlebar is a Nova draggable region", runtime, 'className="window-titlebar"');
mustContain("Runtime titlebar has Tauri drag region", runtime, 'data-tauri-drag-region=""');
mustContain("Runtime titlebar has a drag handler shell", runtime, 'data-titlebar-drag-shell=""');
mustContain("Runtime titlebar has explicit drag regions", runtime, 'data-titlebar-drag-region=""');
mustContain("Runtime titlebar has a background drag strip", runtime, 'data-titlebar-drag-strip=""');
mustContain("Runtime titlebar marks background drag target", runtime, 'data-titlebar-drag-hit-target="background"');
mustContain("Runtime titlebar marks brand drag target", runtime, 'data-titlebar-drag-hit-target="brand"');
mustContain("Runtime titlebar starts native drag", runtime, "getCurrentWindow().startDragging()");
mustContain("Runtime titlebar avoids dragging on double click", runtime, "event.detail > 1");
mustContain("Runtime titlebar ignores interactive controls while dragging", runtime, "isTitlebarInteractiveTarget(event.target)");
mustContain("Runtime titlebar controls are marked non-draggable", runtime, "data-titlebar-interactive-control");
mustContain("Runtime titlebar double click toggles maximize", runtime, 'runWindowAction("toggleMaximize")');
mustContain("Runtime titlebar exposes Nova metadata", runtime, 'data-runtime-titlebar="nova"');
mustContain("Runtime titlebar exposes editor parity marker", runtime, 'data-runtime-titlebar-parity="editor-shell"');
mustContain("Runtime titlebar exposes desktop density marker", runtime, 'data-runtime-titlebar-density="desktop"');
mustContain("Runtime titlebar exposes live runtime chip", runtime, 'data-runtime-titlebar-chip="live-app"');
mustContain("Runtime titlebar chip is styled", runtime, ".titlebar-runtime-chip");
mustContain("Runtime window controls expose minimize marker", runtime, 'data-window-control="minimize"');
mustContain("Runtime window controls expose maximize marker", runtime, 'data-window-control="toggle-maximize"');
mustContain("Runtime window controls expose close marker", runtime, 'data-window-control="close"');

mustContain("Runtime audit queries generated shell", runtime, 'document.querySelector("[data-runtime-shell]")');
mustContain("Runtime audit fails if grid marker is not off", runtime, 'shell.runtimeGrid !== "off"');
mustContain("Runtime audit fails if style contract is missing", runtime, 'shell.styleContract !== "nova-desktop-shell"');
mustContain("Runtime audit fails if design artifacts are not disabled", runtime, 'shell.designArtifacts !== "none"');
mustContain("Runtime audit fails if frame parity marker is missing", runtime, 'shell.runtimeFrame !== "nova-editor-parity"');
mustContain("Runtime audit checks desktop platform metadata", runtime, 'shell.runtimeDensity !== "desktop" || shell.runtimePlatform !== "tauri"');
mustContain("Runtime audit fails if grid policy is missing", runtime, 'shell.runtimeGridPolicy !== "design-only"');
mustContain("Runtime audit requires runtime surface markers", runtime, "hasRuntimeCanvasSurface");
mustContain("Runtime audit detects editor design grid artifacts", runtime, ".canvas-grid,[data-design-grid],[data-builder-canvas-grid],.canvas-background-grid");
mustContain("Runtime audit requires explicit titlebar drag regions", runtime, "hasNovaTitlebarDragRegions");
mustContain("Runtime audit requires titlebar drag strip", runtime, "hasNovaTitlebarDragStrip");
mustContain("Runtime audit requires Nova titlebar metadata", runtime, "hasNovaTitlebarMetadata");
mustContain("Runtime audit requires Nova titlebar parity", runtime, "hasNovaTitlebarParity");
mustContain("Runtime audit checks live runtime titlebar chip", runtime, "hasRuntimeTitlebarChip");
mustContain("Runtime audit requires window control markers", runtime, "hasWindowControlMarkers");
mustContain("Runtime audit requires window controls outside drag regions", runtime, "hasWindowControlsProtectedFromDrag");
mustContain("Runtime controls expose stable runtime ids", runtime, "data-nova-control-id={item.id}");
mustContain("Runtime styles expose Nova radius token", runtime, "--nova-runtime-radius");
mustContain("Runtime styles expose Nova border token", runtime, "--nova-runtime-border");

mustContain("Runtime window kind follows page overrides", projectModel, 'page.get("windowKind").is_some()');
mustContain("Runtime titlebar style follows page overrides", projectModel, 'page.get("titlebarStyle").is_some()');
mustContain("Runtime titlebar subtitle follows page overrides", projectModel, "titlebar_subtitle");
mustMatch("Runtime model normalizes titlebar style", projectModel, /release_titlebar_style\([\s\S]*titlebar_style_source/);
mustMatch("Runtime model normalizes window kind", projectModel, /release_window_kind\([\s\S]*window_kind_source/);

if (failures.length > 0) {
  console.error(`Generated runtime contract failed: ${failures.length} of ${checks.length} checks failed.`);
  for (const failure of failures) {
    console.error(`  - ${failure.label}`);
    console.error(`    ${failure.detail}`);
  }
  process.exit(1);
}

console.log(`Generated runtime contract ok: ${checks.length} checks.`);
