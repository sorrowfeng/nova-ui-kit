// Design tokens shared between the Nova editor and generated apps.
// Generated styles can consume these via CSS variables.

export type NovaThemeTokens = {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  surface: string;
  surfaceContainer: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  radius: string;
  border: string;
  fontSans: string;
  fontMono: string;
};

export const novaLightTokens: NovaThemeTokens = {
  primary: "hsl(259 100% 48%)",
  onPrimary: "hsl(0 0% 100%)",
  primaryContainer: "hsl(259 100% 92%)",
  surface: "hsl(0 0% 100%)",
  surfaceContainer: "hsl(270 20% 96%)",
  onSurface: "hsl(270 5% 12%)",
  onSurfaceVariant: "hsl(270 5% 29%)",
  outline: "hsl(270 6% 45%)",
  outlineVariant: "hsl(270 8% 80%)",
  radius: "1rem",
  border: "1px",
  fontSans: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  fontMono: "Consolas, 'Cascadia Code', monospace",
};

export const novaDarkTokens: NovaThemeTokens = {
  primary: "hsl(259 100% 87%)",
  onPrimary: "hsl(261 58% 28%)",
  primaryContainer: "hsl(258 43% 38%)",
  surface: "hsl(260 14% 8%)",
  surfaceContainer: "hsl(260 12% 14%)",
  onSurface: "hsl(270 20% 96%)",
  onSurfaceVariant: "hsl(270 8% 72%)",
  outline: "hsl(270 6% 55%)",
  outlineVariant: "hsl(270 8% 28%)",
  radius: "1rem",
  border: "1px",
  fontSans: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  fontMono: "Consolas, 'Cascadia Code', monospace",
};

export function novaThemeCssVars(tokens: NovaThemeTokens): string {
  return [
    `--nova-primary: ${tokens.primary};`,
    `--nova-on-primary: ${tokens.onPrimary};`,
    `--nova-primary-container: ${tokens.primaryContainer};`,
    `--nova-surface: ${tokens.surface};`,
    `--nova-surface-container: ${tokens.surfaceContainer};`,
    `--nova-on-surface: ${tokens.onSurface};`,
    `--nova-on-surface-variant: ${tokens.onSurfaceVariant};`,
    `--nova-outline: ${tokens.outline};`,
    `--nova-outline-variant: ${tokens.outlineVariant};`,
    `--nova-radius: ${tokens.radius};`,
    `--nova-border-width: ${tokens.border};`,
    `--nova-font-sans: ${tokens.fontSans};`,
    `--nova-font-mono: ${tokens.fontMono};`,
  ].join("\n");
}
