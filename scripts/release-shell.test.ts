// Release window shell: the exe should open the window the user designed.
//
// The page is the window being drawn; the release config is the window the
// built exe opens. Seeded from independent defaults they disagreed on four of
// six shell fields, so every fresh project began life "需同步" and shipped an
// exe whose window did not match its own design surface.
import assert from "node:assert/strict";
import { defaultReleaseConfig, releaseWindowShellFromPage } from "../src/components/showcase/builder/release";
import type { PageConfig, ProjectReleaseConfig } from "../src/components/showcase/builder/types";

const page: PageConfig = {
  title: "未命名界面",
  windowKind: "main",
  titlebarStyle: "nova",
  titlebarSubtitle: "桌面界面",
  preset: "desktop",
  activeBreakpoint: "desktop",
  width: 1440,
  height: 900,
  background: "grid",
  showGrid: true,
  showRulers: true,
  snapToGrid: true,
  gridSize: 8,
  zoom: 0.5,
  autoSave: true,
};

function shellFields(config: ProjectReleaseConfig) {
  return {
    windowTitle: config.windowTitle,
    windowKind: config.windowKind,
    titlebarStyle: config.titlebarStyle,
    titlebarSubtitle: config.titlebarSubtitle,
    windowWidth: config.windowWidth,
    windowHeight: config.windowHeight,
  };
}

// The defect: independent defaults disagree. This is the assertion that must
// keep failing if anyone re-splits the two seeds.
{
  const seeded = shellFields(defaultReleaseConfig("Nova 项目"));
  assert.notDeepEqual(
    seeded,
    shellFields({
      ...defaultReleaseConfig("Nova 项目"),
      windowTitle: page.title,
      windowKind: page.windowKind,
      titlebarStyle: page.titlebarStyle,
      titlebarSubtitle: page.titlebarSubtitle,
      windowWidth: page.width,
      windowHeight: page.height,
    }),
    "release defaults unexpectedly already match the page defaults",
  );
}

{
  const synced = releaseWindowShellFromPage(defaultReleaseConfig("Nova 项目"), page);
  assert.deepEqual(shellFields(synced), {
    windowTitle: "未命名界面",
    windowKind: "main",
    titlebarStyle: "nova",
    titlebarSubtitle: "桌面界面",
    windowWidth: 1440,
    windowHeight: 900,
  });
}

// Only the shell follows the page. Everything the release pipeline needs must
// survive untouched — an installer that loses its signing mode because the
// window title got synced would be a much worse bug than the one being fixed.
{
  const base = defaultReleaseConfig("轨道实验室");
  const synced = releaseWindowShellFromPage(base, page);
  assert.equal(synced.appName, base.appName, "appName must not follow the page title");
  assert.equal(synced.bundleIdentifier, base.bundleIdentifier);
  assert.equal(synced.version, base.version);
  assert.equal(synced.bundleTargets, base.bundleTargets);
  assert.equal(synced.signingMode, base.signingMode);
  assert.equal(synced.certificatePasswordEnvVar, base.certificatePasswordEnvVar);
  assert.equal(synced.installerSmokeMode, base.installerSmokeMode);
  assert.equal(synced.minWindowWidth, base.minWindowWidth);
  assert.equal(synced.minWindowHeight, base.minWindowHeight);
  assert.equal(synced.resizable, base.resizable);
  assert.equal(synced.showRuntimePanel, base.showRuntimePanel);
}

// Immutable: the caller's config must not be rewritten in place.
{
  const base = defaultReleaseConfig("Nova 项目");
  const before = { ...base };
  releaseWindowShellFromPage(base, page);
  assert.deepEqual(base, before, "releaseWindowShellFromPage must not mutate its input");
}

// An empty page title is not a window title. Fall back to what the config
// already had rather than building an exe with a blank title bar.
{
  const synced = releaseWindowShellFromPage(defaultReleaseConfig("轨道实验室"), { ...page, title: "   " });
  assert.equal(synced.windowTitle, "轨道实验室");
}

console.log("release-shell ok: the exe window opens as designed");
