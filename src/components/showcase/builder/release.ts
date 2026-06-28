import { clamp } from "./layout";
import type {
  ProjectReleaseConfig,
  ReleaseBundleTarget,
  ReleaseInstallerSmokeMode,
  ReleaseInstallerSmokeRunnerMode,
  ReleaseSigningMode,
} from "./types";

export const releaseBundleTargets: { value: ReleaseBundleTarget; label: string }[] = [
  { value: "all", label: "All targets" },
  { value: "app", label: "App bundle" },
  { value: "nsis", label: "NSIS installer" },
  { value: "msi", label: "MSI installer" },
  { value: "appimage", label: "AppImage" },
  { value: "deb", label: "Deb package" },
  { value: "dmg", label: "DMG image" },
];

export const releaseSigningModes: { value: ReleaseSigningMode; label: string; description: string }[] = [
  { value: "unsigned", label: "Unsigned", description: "本地测试和内部预览，不写入签名配置。" },
  { value: "windows-certificate", label: "Windows certificate", description: "使用证书 thumbprint 和时间戳服务签名 Windows 安装包。" },
  { value: "custom-command", label: "Custom command", description: "使用自定义 signCommand，把 %1 作为待签名文件路径。" },
];

export const releaseDigestAlgorithms = ["sha256", "sha384", "sha512"] as const;

export const releaseInstallerSmokeModes: { value: ReleaseInstallerSmokeMode; label: string; description: string }[] = [
  { value: "artifact-only", label: "Artifact only", description: "只检查安装包文件存在、类型和体积。" },
  { value: "write-script", label: "Write smoke script", description: "额外写出 PowerShell 安装/卸载 smoke 脚本，供发布前手动执行。" },
];

export const releaseInstallerSmokeRunnerModes: { value: ReleaseInstallerSmokeRunnerMode; label: string; description: string }[] = [
  { value: "local-artifact", label: "Local artifact runner", description: "在本机只运行 artifact-only smoke，不执行安装器。" },
  { value: "manual", label: "Manual review", description: "只生成脚本和结果路径，由测试人员手动执行并回填。" },
  { value: "vm-handoff", label: "VM handoff", description: "额外生成 VM/沙箱测试交接包，供隔离环境 runner 使用。" },
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
  return [`Release ${normalizeReleaseVersion(version)}`, "", "- UI changes:", "- Rust logic changes:", "- Validation notes:"].join("\n");
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
      ? `Windows signing via thumbprint ${release.certificateThumbprint.slice(0, 8)}... with ${release.digestAlgorithm}; secrets stay in env vars.`
      : release.importCertificateBeforeBuild
        ? "Windows signing needs thumbprint, timestamp URL, PFX/P12 path, and a password env var."
        : "Windows signing needs a certificate thumbprint and timestamp URL.";
  }
  if (release.signingMode === "custom-command") {
    return releaseSigningConfigured(release)
      ? "Custom signCommand is configured and will be written to the generated Tauri config."
      : "Custom signing needs a command containing the %1 artifact placeholder.";
  }
  return "Unsigned build; fine for local testing, but not ready for trusted distribution.";
}

export function defaultReleaseConfig(name = "Nova Project"): ProjectReleaseConfig {
  return {
    appName: name || "Nova App",
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
    windowTitle: name || "Nova App",
    windowWidth: 1200,
    windowHeight: 800,
    minWindowWidth: 720,
    minWindowHeight: 480,
    resizable: true,
  };
}

export function normalizeReleaseConfig(value: unknown, projectName = "Nova Project"): ProjectReleaseConfig {
  const defaults = defaultReleaseConfig(projectName);
  if (!value || typeof value !== "object") {
    return defaults;
  }
  const source = value as Partial<ProjectReleaseConfig>;
  const appName = (source.appName || projectName || defaults.appName).trim() || defaults.appName;
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
    windowWidth: clamp(Math.round(Number(source.windowWidth ?? defaults.windowWidth)), 320, 3840),
    windowHeight: clamp(Math.round(Number(source.windowHeight ?? defaults.windowHeight)), 240, 2160),
    minWindowWidth: clamp(Math.round(Number(source.minWindowWidth ?? defaults.minWindowWidth)), 240, 3840),
    minWindowHeight: clamp(Math.round(Number(source.minWindowHeight ?? defaults.minWindowHeight)), 180, 2160),
    resizable: source.resizable !== false,
  };
}
