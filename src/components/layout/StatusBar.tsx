import { useEffect, useState } from "react";
import { CheckCircle2, Database, Monitor, MousePointer2 } from "lucide-react";
import type { AppCopy } from "@/lib/i18n";
import type { AppLanguage, Density, ThemeMode, ThemeScheme } from "@/lib/preferences";
import { densityOptions, languageOptions, schemeOptions, themeOptions } from "@/lib/preferences";

const BUILDER_SELECTION_STATUS_EVENT = "nova-builder-selection-status";

type BuilderSelectionStatus = {
  active: boolean;
  tone?: string;
  label?: string;
  detail?: string;
  count?: number;
};

type BuilderSelectionStatusWindow = Window & {
  __novaBuilderSelectionStatus?: BuilderSelectionStatus;
};

type StatusBarProps = {
  copy: AppCopy;
  language: AppLanguage;
  theme: ThemeMode;
  scheme: ThemeScheme;
  density: Density;
  autoSaveEnabled: boolean;
};

function labelFor(language: AppLanguage, option: { labelZh: string; labelEn: string }) {
  return language === "zh-CN" ? option.labelZh : option.labelEn;
}

export function StatusBar({ copy, language, theme, scheme, density, autoSaveEnabled }: StatusBarProps) {
  const [builderSelectionStatus, setBuilderSelectionStatus] = useState<BuilderSelectionStatus | null>(null);
  const themeLabel = labelFor(language, themeOptions.find((option) => option.value === theme) ?? themeOptions[2]);
  const schemeLabel = labelFor(language, schemeOptions.find((option) => option.value === scheme) ?? schemeOptions[0]);
  const densityLabel = labelFor(language, densityOptions.find((option) => option.value === density) ?? densityOptions[1]);
  const languageLabel = languageOptions.find((option) => option.value === language)?.label ?? language;

  useEffect(() => {
    const readStatus = (status?: BuilderSelectionStatus | null) => {
      setBuilderSelectionStatus(status?.active ? status : null);
    };
    readStatus((window as BuilderSelectionStatusWindow).__novaBuilderSelectionStatus);
    const handleStatus = (event: Event) => {
      readStatus((event as CustomEvent<BuilderSelectionStatus>).detail);
    };
    window.addEventListener(BUILDER_SELECTION_STATUS_EVENT, handleStatus);
    return () => window.removeEventListener(BUILDER_SELECTION_STATUS_EVENT, handleStatus);
  }, []);

  return (
    // Not a bare `footer`: the design canvas renders component previews that
    // contain their own <footer> elements, so a test that queries the tag lands
    // inside a preview. This is the app chrome the layout gates measure.
    <footer
      data-app-status-bar=""
      className="flex h-8 shrink-0 items-center justify-between gap-3 border-t border-outline-variant bg-surface-container-lowest px-4 text-xs text-on-surface-variant"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex shrink-0 items-center gap-1.5">
          <CheckCircle2 aria-hidden className="size-3.5 text-primary" />
          {copy.status.ready}
        </span>
        {builderSelectionStatus ? (
          <span
            className="flex min-w-0 items-center gap-1.5 truncate"
            data-builder-selection-status-bar=""
            data-builder-selection-status-tone={builderSelectionStatus.tone}
            data-builder-selection-status-count={builderSelectionStatus.count ?? 0}
          >
            <MousePointer2 aria-hidden className="size-3.5 shrink-0 text-primary" />
            <span className="shrink-0 font-medium text-on-surface" data-builder-selection-status-label="">
              {builderSelectionStatus.label}
            </span>
            <span className="min-w-0 truncate" data-builder-selection-status-detail="">
              {builderSelectionStatus.detail}
            </span>
            <span className="shrink-0 font-mono text-[0.68rem]" data-builder-selection-status-count-label="">
              {builderSelectionStatus.count ?? 0}
            </span>
          </span>
        ) : null}
        <span className="hidden shrink-0 items-center gap-1.5 md:flex">
          <Database aria-hidden className="size-3.5" />
          {copy.status.groups}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <span>{copy.status.theme}：{themeLabel} / {schemeLabel}</span>
        <span className="hidden md:inline">{copy.status.language}：{languageLabel}</span>
        <span className="hidden lg:inline">{copy.status.autoSave}：{autoSaveEnabled ? copy.status.on : copy.status.off}</span>
        <span className="hidden items-center gap-1.5 md:flex">
          <Monitor aria-hidden className="size-3.5" />
          {copy.status.density}：{densityLabel}
        </span>
      </div>
    </footer>
  );
}
