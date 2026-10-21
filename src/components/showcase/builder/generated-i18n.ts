// Minimal i18n foundation for generated apps (workflow: 多语言生成模板骨架).
// Generated runtime can pass `locale` and optional `messages` overrides.

export type GeneratedLocale = "zh-CN" | "en-US";

export const GENERATED_DEFAULT_LOCALE: GeneratedLocale = "zh-CN";

export type GeneratedMessages = {
  appTitle: string;
  runCommand: string;
  running: string;
  noBinding: string;
  healthy: string;
  frameDefault: string;
  buttonDefault: string;
};

export const generatedMessages: Record<GeneratedLocale, GeneratedMessages> = {
  "zh-CN": {
    appTitle: "Nova 生成应用",
    runCommand: "运行",
    running: "运行中…",
    noBinding: "未绑定 Rust command",
    healthy: "后端就绪",
    frameDefault: "容器",
    buttonDefault: "按钮",
  },
  "en-US": {
    appTitle: "Nova Generated App",
    runCommand: "Run",
    running: "Running…",
    noBinding: "No Rust command bound",
    healthy: "Backend ready",
    frameDefault: "Frame",
    buttonDefault: "Button",
  },
};

export function resolveGeneratedLocale(locale?: string): GeneratedLocale {
  if (locale === "en-US" || locale === "en") return "en-US";
  return GENERATED_DEFAULT_LOCALE;
}

export function generatedMessageBundle(locale?: string, overrides?: Partial<GeneratedMessages>): GeneratedMessages {
  const base = generatedMessages[resolveGeneratedLocale(locale)];
  return { ...base, ...(overrides ?? {}) };
}


export function installGeneratedLocale(locale: string): void {
  if (typeof window !== "undefined") {
    (window as unknown as { __NOVA_LOCALE__?: string }).__NOVA_LOCALE__ = resolveGeneratedLocale(locale);
  }
}
