import { CheckCircle2, Database, Monitor } from "lucide-react";
import type { AppCopy } from "@/lib/i18n";
import type { AppLanguage, Density, ThemeMode, ThemeScheme } from "@/lib/preferences";
import { densityOptions, languageOptions, schemeOptions, themeOptions } from "@/lib/preferences";

type StatusBarProps = {
  copy: AppCopy;
  language: AppLanguage;
  theme: ThemeMode;
  scheme: ThemeScheme;
  density: Density;
};

function labelFor(language: AppLanguage, option: { labelZh: string; labelEn: string }) {
  return language === "zh-CN" ? option.labelZh : option.labelEn;
}

export function StatusBar({ copy, language, theme, scheme, density }: StatusBarProps) {
  const themeLabel = labelFor(language, themeOptions.find((option) => option.value === theme) ?? themeOptions[2]);
  const schemeLabel = labelFor(language, schemeOptions.find((option) => option.value === scheme) ?? schemeOptions[0]);
  const densityLabel = labelFor(language, densityOptions.find((option) => option.value === density) ?? densityOptions[1]);
  const languageLabel = languageOptions.find((option) => option.value === language)?.label ?? language;

  return (
    <footer className="flex h-8 shrink-0 items-center justify-between border-t border-outline-variant bg-surface-container-lowest px-4 text-xs text-on-surface-variant">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 aria-hidden className="size-3.5 text-primary" />
          {copy.status.ready}
        </span>
        <span className="hidden items-center gap-1.5 md:flex">
          <Database aria-hidden className="size-3.5" />
          {copy.status.groups}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>{copy.status.theme}：{themeLabel} / {schemeLabel}</span>
        <span className="hidden md:inline">{copy.status.language}：{languageLabel}</span>
        <span className="hidden items-center gap-1.5 md:flex">
          <Monitor aria-hidden className="size-3.5" />
          {copy.status.density}：{densityLabel}
        </span>
      </div>
    </footer>
  );
}
