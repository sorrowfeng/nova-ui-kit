import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const exePath = path.join(root, "src-tauri", "target", "release", "nova-ui-kit.exe");
const tauriConfigPath = path.join(root, "src-tauri", "tauri.conf.json");
const tauriMainPath = path.join(root, "src-tauri", "src", "main.rs");
const minimumExeBytes = 5 * 1024 * 1024;
const expectedTitle = "Nova UI 编辑器";
const windowsGuiSubsystem = 2;
const subsystemNames = new Map([
  [1, "Native"],
  [2, "Windows GUI"],
  [3, "Windows Console"],
  [7, "POSIX Console"],
  [9, "Windows CE GUI"],
  [10, "EFI Application"],
  [11, "EFI Boot Service Driver"],
  [12, "EFI Runtime Driver"],
  [13, "EFI ROM"],
  [14, "Xbox"],
  [16, "Windows Boot Application"],
]);

function fail(message) {
  console.error(`Desktop exe smoke failed: ${message}`);
  process.exit(1);
}

function requireContains(filePath, needle, message) {
  const source = fs.readFileSync(filePath, "utf8");
  if (!source.includes(needle)) {
    fail(`${message}: ${path.relative(root, filePath)} should contain ${needle}`);
  }
}

function readPeSubsystem(filePath) {
  const binary = fs.readFileSync(filePath);
  if (binary.length < 0x100) {
    fail(`release exe is too small to contain a valid PE header: ${binary.length} bytes.`);
  }
  if (binary.toString("ascii", 0, 2) !== "MZ") {
    fail("release exe is missing the MZ DOS header.");
  }

  const peOffset = binary.readUInt32LE(0x3c);
  if (peOffset + 92 > binary.length) {
    fail(`release exe has an invalid PE header offset: ${peOffset}.`);
  }
  if (binary.toString("ascii", peOffset, peOffset + 4) !== "PE\u0000\u0000") {
    fail("release exe is missing the PE signature.");
  }

  const optionalHeaderSize = binary.readUInt16LE(peOffset + 20);
  const optionalHeaderOffset = peOffset + 24;
  if (optionalHeaderSize < 70 || optionalHeaderOffset + optionalHeaderSize > binary.length) {
    fail(`release exe has an invalid optional header size: ${optionalHeaderSize}.`);
  }

  const magic = binary.readUInt16LE(optionalHeaderOffset);
  if (magic !== 0x10b && magic !== 0x20b) {
    fail(`release exe has an unsupported optional header magic: 0x${magic.toString(16)}.`);
  }

  const subsystem = binary.readUInt16LE(optionalHeaderOffset + 68);
  return {
    subsystem,
    subsystemName: subsystemNames.get(subsystem) ?? `Unknown (${subsystem})`,
  };
}

if (process.platform !== "win32") {
  fail("this smoke test launches nova-ui-kit.exe and currently requires Windows.");
}

if (!fs.existsSync(exePath)) {
  fail(`release exe not found at ${exePath}. Run npm run tauri:exe first.`);
}

const stat = fs.statSync(exePath);
if (stat.size < minimumExeBytes) {
  fail(`release exe is unexpectedly small: ${stat.size} bytes.`);
}

const pe = readPeSubsystem(exePath);
if (pe.subsystem !== windowsGuiSubsystem) {
  fail(`release exe uses ${pe.subsystemName} subsystem (${pe.subsystem}); expected Windows GUI (${windowsGuiSubsystem}) to avoid a console window.`);
}

requireContains(tauriMainPath, 'windows_subsystem = "windows"', "release exe must use the Windows subsystem to avoid a console window");
requireContains(tauriConfigPath, '"decorations": false', "editor shell must use the Nova custom titlebar");
requireContains(tauriConfigPath, '"maximized": true', "editor desktop exe should open maximized by default");
requireContains(tauriConfigPath, `"title": "${expectedTitle}"`, "editor window title must remain localized");

const escapedExePath = exePath.replace(/'/g, "''");
const escapedExpectedTitle = expectedTitle.replace(/'/g, "''");
const smokeScript = `
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$exe = '${escapedExePath}'
$expectedTitle = '${escapedExpectedTitle}'
$process = Start-Process -FilePath $exe -PassThru
Start-Sleep -Seconds 4
$process.Refresh()
$started = -not $process.HasExited
$title = $process.MainWindowTitle
$handle = $process.MainWindowHandle
$signature = @'
using System;
using System.Runtime.InteropServices;
public static class NovaWindowSmoke {
  [DllImport("user32.dll")]
  public static extern bool IsZoomed(IntPtr hWnd);
}
'@
Add-Type -TypeDefinition $signature -ErrorAction SilentlyContinue
$maximized = if ($handle -ne 0) { [NovaWindowSmoke]::IsZoomed([IntPtr]$handle) } else { $false }
$titleBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($title))
$result = [ordered]@{
  exe = $exe
  size = (Get-Item -LiteralPath $exe).Length
  lastWriteTime = (Get-Item -LiteralPath $exe).LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')
  started = $started
  mainWindowTitle = $title
  mainWindowTitleBase64 = $titleBase64
  titleMatches = ($title -eq $expectedTitle)
  hasMainWindow = ($handle -ne 0)
  maximized = $maximized
  exitCode = if ($process.HasExited) { $process.ExitCode } else { $null }
}
if ($started) {
  Stop-Process -Id $process.Id -Force
  $process.WaitForExit(5000) | Out-Null
}
$result | ConvertTo-Json -Compress
`;

let smokeResult;
try {
  const output = execFileSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", smokeScript], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    timeout: 30000,
  });
  smokeResult = JSON.parse(output.trim());
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

if (!smokeResult.started) {
  fail(`process did not stay running long enough to show a window. Exit code: ${smokeResult.exitCode ?? "unknown"}`);
}

if (!smokeResult.hasMainWindow) {
  fail("process started but did not expose a main window handle.");
}

if (!smokeResult.maximized) {
  fail("process started but the main window was not maximized by default.");
}

const decodedWindowTitle =
  typeof smokeResult.mainWindowTitleBase64 === "string"
    ? Buffer.from(smokeResult.mainWindowTitleBase64, "base64").toString("utf8")
    : String(smokeResult.mainWindowTitle ?? "");

if (!smokeResult.titleMatches && decodedWindowTitle !== expectedTitle) {
  fail(`unexpected main window title: ${JSON.stringify(decodedWindowTitle)}.`);
}

console.log(
  `Desktop exe smoke ok: ${smokeResult.exe} (${smokeResult.size} bytes, ${smokeResult.lastWriteTime}, subsystem ${pe.subsystemName}, title ${JSON.stringify(decodedWindowTitle)}, maximized ${smokeResult.maximized}).`,
);
