#!/usr/bin/env node
// check-platform-bundle-config — P2-12: validate the Tauri bundle config for
// every supported platform without needing that platform's host.
// Usage: node scripts/check-platform-bundle-config.mjs
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const confPath = path.join(root, "src-tauri", "tauri.conf.json");
const iconDir = path.join(root, "src-tauri", "icons");

const problems = [];
function require(condition, message) {
  if (!condition) problems.push(message);
}

if (!fs.existsSync(confPath)) {
  console.error("check-platform-bundle-config: missing src-tauri/tauri.conf.json");
  process.exit(1);
}

const conf = JSON.parse(fs.readFileSync(confPath, "utf8"));
const bundle = conf.bundle;

require(Boolean(bundle), "bundle section is missing");
require(Boolean(conf.version), "top-level version is missing");
require(Boolean(conf.productName), "productName is missing");
require(Boolean(conf.identifier), "identifier is missing");

if (bundle) {
  require(bundle.active === true, "bundle.active must be true");
  require(Boolean(bundle.targets), "bundle.targets must be set (expected \"all\" or an explicit list)");
  require(Boolean(bundle.category), "bundle.category is missing");
  require(Boolean(bundle.shortDescription), "bundle.shortDescription is missing");
  require(Boolean(bundle.longDescription), "bundle.longDescription is missing");

  const icons = Array.isArray(bundle.icon) ? bundle.icon : [];
  require(icons.length > 0, "bundle.icon must list at least one icon");
  for (const icon of icons) {
    require(fs.existsSync(path.join(root, "src-tauri", icon)), `bundle.icon entry missing on disk: ${icon}`);
  }
  require(
    icons.some((icon) => icon.endsWith(".ico")),
    "bundle.icon must include a Windows .ico",
  );
  require(
    icons.some((icon) => icon.endsWith(".icns")),
    "bundle.icon must include a macOS .icns",
  );
  require(
    icons.some((icon) => icon.endsWith(".png")),
    "bundle.icon must include a PNG",
  );

  // Linux: AppImage + deb are the two L2 targets.
  require(Boolean(bundle.linux), "bundle.linux section is missing");
  require(Boolean(bundle.linux?.deb), "bundle.linux.deb section is missing");
  require(Boolean(bundle.linux?.appimage), "bundle.linux.appimage section is missing");
  require(Array.isArray(bundle.linux?.deb?.depends), "bundle.linux.deb.depends must be an array");

  // macOS: signing happens on the host, but the minimum version is config.
  require(Boolean(bundle.macOS), "bundle.macOS section is missing");
  require(Boolean(bundle.macOS?.minimumSystemVersion), "bundle.macOS.minimumSystemVersion is missing");

  // Windows: webview bootstrapper is the supported install mode.
  require(Boolean(bundle.windows), "bundle.windows section is missing");
  const installMode = bundle.windows?.webviewInstallMode?.type;
  require(Boolean(installMode), "bundle.windows.webviewInstallMode.type is missing");
}

if (fs.existsSync(iconDir)) {
  for (const name of ["icon.ico", "icon.icns", "icon.png"]) {
    require(fs.existsSync(path.join(iconDir, name)), `src-tauri/icons/${name} is missing`);
  }
} else {
  problems.push("src-tauri/icons directory is missing");
}

// `frontendDist` is resolved against src-tauri/, while `npm run build` writes
// wherever vite's outDir points at the project root. If the two disagree the
// bundle silently picks up nothing (or a stale copy of dist), and the breakage
// only shows up on a clean checkout.
{
  const viteConfigPath = path.join(root, "vite.config.ts");
  let viteOutDir = "dist";
  if (fs.existsSync(viteConfigPath)) {
    const viteText = fs.readFileSync(viteConfigPath, "utf8");
    const match = viteText.match(/\boutDir\s*:\s*["']([^"']+)["']/);
    if (match) viteOutDir = match[1];
  }
  const frontendDist = conf.build?.frontendDist;
  require(Boolean(frontendDist), "build.frontendDist is missing");
  if (frontendDist) {
    const resolved = path.resolve(root, "src-tauri", frontendDist);
    const expected = path.resolve(root, viteOutDir);
    require(
      resolved === expected,
      `build.frontendDist ("${frontendDist}" -> ${resolved}) must point at the vite output directory (${expected})`,
    );
  }
  const stale = path.join(root, "src-tauri", "dist");
  require(
    !fs.existsSync(stale),
    "src-tauri/dist exists; a stale web build there hides a wrong build.frontendDist — delete it",
  );
}

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(`check-platform-bundle-config: ${problem}`);
  }
  process.exit(1);
}

console.log("check-platform-bundle-config ok: windows/linux/macOS bundle sections and icons are complete.");
console.log(
  "check-platform-bundle-config note: actual .deb/.AppImage/.dmg output still needs the matching host; see docs/platform-matrix.md.",
);
