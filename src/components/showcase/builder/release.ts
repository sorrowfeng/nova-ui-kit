import { clamp } from "./layout";
import type {
  PageConfig,
  ProjectReleaseConfig,
  ReleaseBundleTarget,
  ReleaseInstallerSmokeMode,
  ReleaseInstallerSmokeRunnerMode,
  ReleaseSigningMode,
  ReleaseTitlebarStyle,
  ReleaseWindowKind,
} from "./types";

export const releaseBundleTargets: { value: ReleaseBundleTarget; label: string }[] = [
  { value: "all", label: "全部目标" },
  { value: "app", label: "App 包" },
  { value: "nsis", label: "NSIS 安装器" },
  { value: "msi", label: "MSI 安装器" },
  { value: "appimage", label: "AppImage" },
  { value: "deb", label: "Deb 包" },
  { value: "dmg", label: "DMG 镜像" },
];

export function releaseBundleTargetLabel(value: ReleaseBundleTarget): string {
  return releaseBundleTargets.find((target) => target.value === value)?.label ?? String(value);
}

export function releaseSigningModeLabel(value: ReleaseSigningMode): string {
  return releaseSigningModes.find((mode) => mode.value === value)?.label ?? String(value);
}

export const releaseSigningModes: { value: ReleaseSigningMode; label: string; description: string }[] = [
  { value: "unsigned", label: "未签名", description: "本地测试和内部构建，不写入签名配置。" },
  { value: "windows-certificate", label: "Windows 证书", description: "使用证书 thumbprint 和时间戳服务签名 Windows 安装包。" },
  { value: "custom-command", label: "自定义命令", description: "使用自定义 signCommand，把 %1 作为待签名文件路径。" },
];

export const releaseWindowKinds: { value: ReleaseWindowKind; label: string; description: string }[] = [
  { value: "main", label: "主窗口", description: "普通应用主界面，默认可缩放并显示完整标题栏。" },
  { value: "dialog", label: "对话框", description: "适合确认、设置、向导等中等尺寸窗口。" },
  { value: "tool", label: "工具窗口", description: "适合浮动工具、面板或辅助控制台。" },
  { value: "frameless", label: "无框沉浸", description: "隐藏标题栏，内容占满窗口。" },
];

export const releaseTitlebarStyles: { value: ReleaseTitlebarStyle; label: string; description: string }[] = [
  { value: "nova", label: "Nova 自绘", description: "与编辑器一致的细边框自绘标题栏。" },
  { value: "native", label: "系统原生", description: "使用操作系统默认标题栏和窗口控件。" },
  { value: "hidden", label: "隐藏", description: "隐藏标题栏，适合 kiosk、弹层或全内容窗口。" },
];

export const releaseDigestAlgorithms = ["sha256", "sha384", "sha512"] as const;

export const releaseInstallerSmokeModes: { value: ReleaseInstallerSmokeMode; label: string; description: string }[] = [
  { value: "artifact-only", label: "仅产物检查", description: "只检查安装包文件存在、类型和体积。" },
  { value: "write-script", label: "写出 smoke 脚本", description: "额外写出 PowerShell 安装/卸载 smoke 脚本，供发布前手动执行。" },
];

export const releaseInstallerSmokeRunnerModes: { value: ReleaseInstallerSmokeRunnerMode; label: string; description: string }[] = [
  { value: "local-artifact", label: "本地产物 runner", description: "在本机只运行 artifact-only smoke，不执行安装器。" },
  { value: "manual", label: "人工复核", description: "只生成脚本和结果路径，由测试人员手动执行并回填。" },
  { value: "vm-handoff", label: "VM 交接", description: "额外生成 VM/沙箱测试交接包，供隔离环境 runner 使用。" },
];

export function releaseSlug(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "nova-app";
}

export function defaultBundleIdentifier(name: string) {
  return `com.nova.generated.${releaseSlug(name).replace(/-/g, ".")}`;
}

export function normalizeReleaseVersion(value: string) {
  const version = value.trim();
  return /^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/.test(version) ? version : "0.1.0";
}

export function normalizeReleaseWindowKind(value: unknown): ReleaseWindowKind {
  return value === "dialog" || value === "tool" || value === "frameless" ? value : "main";
}

export function normalizeReleaseTitlebarStyle(value: unknown, windowKind: ReleaseWindowKind = "main"): ReleaseTitlebarStyle {
  if (windowKind === "frameless") {
    return "hidden";
  }
  return value === "native" || value === "hidden" ? value : "nova";
}

export type ReleaseVersionBump = "patch" | "minor" | "major";

export function releaseVersionParts(value: string) {
  const normalized = normalizeReleaseVersion(value);
  const [core] = normalized.split(/[-+]/);
  const [major = "0", minor = "1", patch = "0"] = core.split(".");
  return {
    major: Math.max(0, Number.parseInt(major, 10) || 0),
    minor: Math.max(0, Number.parseInt(minor, 10) || 0),
    patch: Math.max(0, Number.parseInt(patch, 10) || 0),
  };
}

export function bumpReleaseVersion(value: string, bump: ReleaseVersionBump) {
  const parts = releaseVersionParts(value);
  if (bump === "major") {
    return `${parts.major + 1}.0.0`;
  }
  if (bump === "minor") {
    return `${parts.major}.${parts.minor + 1}.0`;
  }
  return `${parts.major}.${parts.minor}.${parts.patch + 1}`;
}

export function defaultReleaseNotes(version = "0.1.0") {
  return [`发布 ${normalizeReleaseVersion(version)}`, "", "- UI 变更：", "- Rust 逻辑变更：", "- 验证备注："].join("\n");
}

export function normalizeReleaseNotes(value: unknown, version = "0.1.0") {
  return typeof value === "string" && value.trim() ? value : defaultReleaseNotes(version);
}

export function normalizeBundleIdentifier(value: string, fallbackName: string) {
  const identifier = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^-+|-+$/g, "")
    .replace(/^\.+|\.+$/g, "");
  return identifier.includes(".") ? identifier : defaultBundleIdentifier(fallbackName);
}

export function normalizeReleaseBundleTarget(value: unknown): ReleaseBundleTarget {
  return releaseBundleTargets.some((target) => target.value === value) ? (value as ReleaseBundleTarget) : "all";
}

export function normalizeReleaseSigningMode(value: unknown): ReleaseSigningMode {
  return releaseSigningModes.some((mode) => mode.value === value) ? (value as ReleaseSigningMode) : "unsigned";
}

export function normalizeDigestAlgorithm(value: unknown) {
  return releaseDigestAlgorithms.some((algorithm) => algorithm === value) ? (value as string) : "sha256";
}

export function normalizeReleaseInstallerSmokeMode(value: unknown): ReleaseInstallerSmokeMode {
  return releaseInstallerSmokeModes.some((mode) => mode.value === value) ? (value as ReleaseInstallerSmokeMode) : "artifact-only";
}

export function normalizeReleaseInstallerSmokeRunnerMode(value: unknown): ReleaseInstallerSmokeRunnerMode {
  return releaseInstallerSmokeRunnerModes.some((mode) => mode.value === value) ? (value as ReleaseInstallerSmokeRunnerMode) : "local-artifact";
}

export function normalizeMinimumArtifactSizeKb(value: unknown) {
  const size = Math.round(Number(value ?? 1));
  return clamp(Number.isFinite(size) ? size : 1, 0, 1024 * 1024);
}

export function normalizeEnvVarName(value: unknown) {
  const name = typeof value === "string" ? value.trim() : "";
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : "";
}

export function releaseSigningConfigured(release: ProjectReleaseConfig) {
  if (release.signingMode === "windows-certificate") {
    const signingTargetReady = Boolean(release.certificateThumbprint.trim() && release.timestampUrl.trim());
    if (!release.importCertificateBeforeBuild) {
      return signingTargetReady;
    }
    return Boolean(signingTargetReady && release.certificateSourcePath.trim() && normalizeEnvVarName(release.certificatePasswordEnvVar));
  }
  if (release.signingMode === "custom-command") {
    return Boolean(release.signCommand.trim() && release.signCommand.includes("%1"));
  }
  return false;
}

export function releaseSigningDescription(release: ProjectReleaseConfig) {
  if (release.signingMode === "windows-certificate") {
    return releaseSigningConfigured(release)
      ? `使用 thumbprint ${release.certificateThumbprint.slice(0, 8)}... 和 ${release.digestAlgorithm} 进行 Windows 签名；密钥仍保存在环境变量中。`
      : release.importCertificateBeforeBuild
        ? "Windows 签名需要 thumbprint、时间戳 URL、PFX/P12 路径和密码环境变量。"
        : "Windows 签名需要证书 thumbprint 和时间戳 URL。";
  }
  if (release.signingMode === "custom-command") {
    return releaseSigningConfigured(release)
      ? "自定义 signCommand 已配置，并会写入生成的 Tauri 配置。"
      : "自定义签名命令需要包含 %1 产物占位符。";
  }
  return "未签名构建可用于本地测试，但不适合可信分发。";
}

export function defaultReleaseConfig(name = "Nova 项目"): ProjectReleaseConfig {
  return {
    appName: name || "Nova 应用",
    bundleIdentifier: defaultBundleIdentifier(name),
    version: "0.1.0",
    releaseNotes: defaultReleaseNotes("0.1.0"),
    bundleTargets: "all",
    iconAssetId: "",
    signingMode: "unsigned",
    certificateThumbprint: "",
    certificateSourcePath: "",
    certificatePasswordEnvVar: "NOVA_SIGNING_CERT_PASSWORD",
    importCertificateBeforeBuild: false,
    digestAlgorithm: "sha256",
    timestampUrl: "",
    timestampTsp: false,
    signCommand: "",
    minimumArtifactSizeKb: 1,
    installerSmokeMode: "artifact-only",
    installerSmokeRunnerMode: "local-artifact",
    installerSmokeVmName: "Nova Smoke VM",
    installerSmokeVmSharedFolder: "",
    installerSmokeVmNotes: "",
    windowTitle: name || "Nova 应用",
    windowKind: "main",
    titlebarStyle: "nova",
    titlebarSubtitle: "桌面应用",
    windowWidth: 1200,
    windowHeight: 800,
    minWindowWidth: 720,
    minWindowHeight: 480,
    resizable: true,
    showRuntimePanel: false,
  };
}

/**
 * The exe window opens the window that was designed. The page is the surface
 * being drawn; this config is what the built exe opens.
 *
 * Seeded from `defaultReleaseConfig` alone they disagree on four of six shell
 * fields (title, subtitle, width, height), so a fresh project started life
 * "需同步" and its exe opened a different window from the one on the canvas —
 * which is the one requirement this product exists to meet.
 *
 * Only the shell follows the page. Signing, bundling and installer settings
 * are release concerns with no page counterpart and must survive untouched.
 * Re-syncing after a deliberate divergence stays a user action, not a side
 * effect of saving.
 */
export function releaseWindowShellFromPage(
  config: ProjectReleaseConfig,
  page: PageConfig,
): ProjectReleaseConfig {
  return {
    ...config,
    windowTitle: page.title.trim() || config.windowTitle,
    windowKind: page.windowKind,
    titlebarStyle: page.titlebarStyle,
    titlebarSubtitle: page.titlebarSubtitle,
    windowWidth: page.width,
    windowHeight: page.height,
  };
}

export function normalizeReleaseConfig(value: unknown, projectName = "Nova 项目"): ProjectReleaseConfig {
  const defaults = defaultReleaseConfig(projectName);
  if (!value || typeof value !== "object") {
    return defaults;
  }
  const source = value as Partial<ProjectReleaseConfig>;
  const appName = (source.appName || projectName || defaults.appName).trim() || defaults.appName;
  const windowKind = normalizeReleaseWindowKind(source.windowKind);
  return {
    appName,
    bundleIdentifier: normalizeBundleIdentifier(source.bundleIdentifier || defaults.bundleIdentifier, appName),
    version: normalizeReleaseVersion(source.version || defaults.version),
    releaseNotes: normalizeReleaseNotes(source.releaseNotes, source.version || defaults.version),
    bundleTargets: normalizeReleaseBundleTarget(source.bundleTargets),
    iconAssetId: typeof source.iconAssetId === "string" ? source.iconAssetId : "",
    signingMode: normalizeReleaseSigningMode(source.signingMode),
    certificateThumbprint: typeof source.certificateThumbprint === "string" ? source.certificateThumbprint.trim() : "",
    certificateSourcePath: typeof source.certificateSourcePath === "string" ? source.certificateSourcePath.trim() : "",
    certificatePasswordEnvVar: normalizeEnvVarName(source.certificatePasswordEnvVar) || defaults.certificatePasswordEnvVar,
    importCertificateBeforeBuild: source.importCertificateBeforeBuild === true,
    digestAlgorithm: normalizeDigestAlgorithm(source.digestAlgorithm),
    timestampUrl: typeof source.timestampUrl === "string" ? source.timestampUrl.trim() : "",
    timestampTsp: source.timestampTsp === true,
    signCommand: typeof source.signCommand === "string" ? source.signCommand.trim() : "",
    minimumArtifactSizeKb: normalizeMinimumArtifactSizeKb(source.minimumArtifactSizeKb),
    installerSmokeMode: normalizeReleaseInstallerSmokeMode(source.installerSmokeMode),
    installerSmokeRunnerMode: normalizeReleaseInstallerSmokeRunnerMode(source.installerSmokeRunnerMode),
    installerSmokeVmName: typeof source.installerSmokeVmName === "string" ? source.installerSmokeVmName.trim() : defaults.installerSmokeVmName,
    installerSmokeVmSharedFolder: typeof source.installerSmokeVmSharedFolder === "string" ? source.installerSmokeVmSharedFolder.trim() : "",
    installerSmokeVmNotes: typeof source.installerSmokeVmNotes === "string" ? source.installerSmokeVmNotes.trim() : "",
    windowTitle: (source.windowTitle || appName).trim() || appName,
    windowKind,
    titlebarStyle: normalizeReleaseTitlebarStyle(source.titlebarStyle, windowKind),
    titlebarSubtitle: typeof source.titlebarSubtitle === "string" ? source.titlebarSubtitle.trim() : defaults.titlebarSubtitle,
    windowWidth: clamp(Math.round(Number(source.windowWidth ?? defaults.windowWidth)), 320, 3840),
    windowHeight: clamp(Math.round(Number(source.windowHeight ?? defaults.windowHeight)), 240, 2160),
    minWindowWidth: clamp(Math.round(Number(source.minWindowWidth ?? defaults.minWindowWidth)), 240, 3840),
    minWindowHeight: clamp(Math.round(Number(source.minWindowHeight ?? defaults.minWindowHeight)), 180, 2160),
    resizable: source.resizable !== false,
    showRuntimePanel: source.showRuntimePanel === true,
  };
}
