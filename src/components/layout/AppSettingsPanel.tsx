import { Bell, Focus, Keyboard, Languages, MonitorCog, PanelLeftClose, RotateCcw, Save, Settings2, Sparkles, Type } from "lucide-react";
import type { AppCopy } from "@/lib/i18n";
import type { AppLanguage, Density, FontScale, MotionPreference, ThemeMode, ThemeScheme } from "@/lib/preferences";
import { DEFAULT_APP_LANGUAGE, densityOptions, fontScaleOptions, languageOptions, motionOptions, schemeOptions, themeOptions } from "@/lib/preferences";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type AppSettingsPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copy: AppCopy;
  language: AppLanguage;
  onLanguageChange: (language: AppLanguage) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  scheme: ThemeScheme;
  onSchemeChange: (scheme: ThemeScheme) => void;
  density: Density;
  onDensityChange: (density: Density) => void;
  statusBarVisible: boolean;
  onStatusBarVisibleChange: (visible: boolean) => void;
  toolbarLabelsVisible: boolean;
  onToolbarLabelsVisibleChange: (visible: boolean) => void;
  commandHintsVisible: boolean;
  onCommandHintsVisibleChange: (visible: boolean) => void;
  autoSaveEnabled: boolean;
  onAutoSaveEnabledChange: (enabled: boolean) => void;
  notificationsEnabled: boolean;
  onNotificationsEnabledChange: (enabled: boolean) => void;
  compactSidebar: boolean;
  onCompactSidebarChange: (compact: boolean) => void;
  focusModeEnabled: boolean;
  onFocusModeEnabledChange: (enabled: boolean) => void;
  fontScale: FontScale;
  onFontScaleChange: (fontScale: FontScale) => void;
  motion: MotionPreference;
  onMotionChange: (motion: MotionPreference) => void;
  onResetDefaults: () => void;
};

function localizedOption(language: AppLanguage, option: { labelZh: string; labelEn: string }) {
  return language === "zh-CN" ? option.labelZh : option.labelEn;
}

function localizedLanguageDetail(
  language: AppLanguage,
  option: { detailZh: string; detailEn: string } | undefined,
  fallback: AppLanguage,
) {
  if (!option) {
    return fallback;
  }
  return language === "zh-CN" ? option.detailZh : option.detailEn;
}

export function AppSettingsPanel({
  open,
  onOpenChange,
  copy,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  scheme,
  onSchemeChange,
  density,
  onDensityChange,
  statusBarVisible,
  onStatusBarVisibleChange,
  toolbarLabelsVisible,
  onToolbarLabelsVisibleChange,
  commandHintsVisible,
  onCommandHintsVisibleChange,
  autoSaveEnabled,
  onAutoSaveEnabledChange,
  notificationsEnabled,
  onNotificationsEnabledChange,
  compactSidebar,
  onCompactSidebarChange,
  focusModeEnabled,
  onFocusModeEnabledChange,
  fontScale,
  onFontScaleChange,
  motion,
  onMotionChange,
  onResetDefaults,
}: AppSettingsPanelProps) {
  const languageLabel = localizedLanguageDetail(
    language,
    languageOptions.find((option) => option.value === language),
    language,
  );
  const defaultLanguageLabel = localizedLanguageDetail(
    language,
    languageOptions.find((option) => option.value === DEFAULT_APP_LANGUAGE),
    DEFAULT_APP_LANGUAGE,
  );
  const themeLabel = localizedOption(language, themeOptions.find((option) => option.value === theme) ?? themeOptions[2]);
  const schemeLabel = localizedOption(language, schemeOptions.find((option) => option.value === scheme) ?? schemeOptions[0]);
  const densityLabel = localizedOption(language, densityOptions.find((option) => option.value === density) ?? densityOptions[1]);
  const workspaceLabel = focusModeEnabled
    ? copy.settings.focusMode
    : compactSidebar
      ? copy.settings.compactSidebar
      : copy.settings.showStatusBar;
  const behaviorLabel = notificationsEnabled
    ? `${copy.settings.autoSave} ${autoSaveEnabled ? copy.settings.on : copy.settings.off}`
    : copy.settings.muted;
  const overviewRows = [
    { label: copy.settings.overviewLanguage, value: languageLabel },
    { label: copy.settings.overviewAppearance, value: `${themeLabel} / ${schemeLabel}` },
    { label: copy.settings.overviewDensity, value: densityLabel },
    { label: copy.settings.overviewWorkspace, value: workspaceLabel },
    { label: copy.settings.overviewBehavior, value: behaviorLabel },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-[420px] max-w-[calc(100vw-24px)] flex-col gap-0 p-0 sm:max-w-[420px]">
        <SheetHeader className="border-b border-outline-variant px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-container text-primary-container-foreground">
              <Settings2 aria-hidden className="size-5" />
            </div>
            <div>
              <SheetTitle>{copy.settings.title}</SheetTitle>
              <SheetDescription className="mt-1">{copy.settings.description}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="subtle-scrollbar flex-1 overflow-y-auto px-5 py-5">
          <section className="rounded-2xl border border-outline-variant bg-surface-container p-4" data-app-settings-overview="">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MonitorCog aria-hidden className="size-4 text-primary" />
              {copy.settings.overview}
            </div>
            <p className="mt-2 text-xs leading-5 text-on-surface-variant">{copy.settings.overviewDescription}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {overviewRows.map((row) => (
                <div key={row.label} className="min-w-0 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2">
                  <div className="truncate text-[0.68rem] font-medium text-on-surface-variant">{row.label}</div>
                  <div className="mt-1 truncate text-xs font-medium text-on-surface">{row.value}</div>
                </div>
              ))}
            </div>
          </section>

          <Separator className="my-5" />

          <section className="space-y-3" data-app-settings-language="" data-app-settings-default-language={DEFAULT_APP_LANGUAGE}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Languages aria-hidden className="size-4 text-primary" />
              {copy.settings.language}
            </div>
            <p className="text-xs leading-5 text-on-surface-variant">{copy.settings.languageDescription}</p>
            <div data-app-settings-language-switch="">
              <SegmentedControl
                aria-label={copy.settings.language}
                value={language}
                onValueChange={(value) => onLanguageChange(value as AppLanguage)}
                className="w-full justify-between"
                options={languageOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2" data-app-settings-preference-summary="">
              <div className="rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-xs text-on-surface-variant" aria-live="polite">
                <span className="block font-medium text-on-surface">{copy.settings.languageCurrent}</span>
                <span>{languageLabel}</span>
              </div>
              <div className="rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-xs text-on-surface-variant">
                <span className="block font-medium text-on-surface">{copy.settings.languageDefault}</span>
                <span>{defaultLanguageLabel}</span>
              </div>
            </div>
            <p className="text-xs leading-5 text-on-surface-variant">{copy.settings.languageDefaultDescription}</p>
          </section>

          <Separator className="my-5" />

          <section className="space-y-4" data-app-settings-appearance="">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles aria-hidden className="size-4 text-primary" />
              {copy.settings.appearance}
            </div>

            <div className="space-y-2">
              <Label>{copy.settings.themeMode}</Label>
              <SegmentedControl
                aria-label={copy.settings.themeMode}
                value={theme}
                onValueChange={(value) => onThemeChange(value as ThemeMode)}
                className="w-full justify-between"
                options={themeOptions.map((option) => ({
                  value: option.value,
                  label: localizedOption(language, option),
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>{copy.settings.colorScheme}</Label>
              <div className="grid grid-cols-3 gap-2">
                {schemeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-label={localizedOption(language, option)}
                    onClick={() => onSchemeChange(option.value)}
                    className={cn(
                      "focus-ring flex min-w-0 flex-col items-center gap-2 rounded-xl border border-outline-variant bg-surface-container p-3 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high",
                      scheme === option.value && "border-primary bg-primary-container text-primary-container-foreground",
                    )}
                  >
                    <span className={cn("size-7 rounded-full shadow-m3-1", option.swatch)} />
                    <span className="truncate">{localizedOption(language, option)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{copy.settings.density}</Label>
              <SegmentedControl
                aria-label={copy.settings.density}
                value={density}
                onValueChange={(value) => onDensityChange(value as Density)}
                className="w-full justify-between"
                options={densityOptions.map((option) => ({
                  value: option.value,
                  label: localizedOption(language, option),
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>{copy.settings.fontScale}</Label>
              <p className="text-xs leading-5 text-on-surface-variant">{copy.settings.fontScaleDescription}</p>
              <SegmentedControl
                aria-label={copy.settings.fontScale}
                value={fontScale}
                onValueChange={(value) => onFontScaleChange(value as FontScale)}
                className="w-full justify-between"
                options={fontScaleOptions.map((option) => ({
                  value: option.value,
                  label: localizedOption(language, option),
                }))}
              />
            </div>
          </section>

          <Separator className="my-5" />

          <section className="space-y-4" data-app-settings-workspace="">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MonitorCog aria-hidden className="size-4 text-primary" />
              {copy.settings.workspace}
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl border border-outline-variant bg-surface-container p-4">
              <div className="space-y-1">
                <Label htmlFor="nova-status-bar">{copy.settings.showStatusBar}</Label>
                <p className="text-xs leading-5 text-on-surface-variant">{copy.settings.showStatusBarDescription}</p>
              </div>
              <Switch
                id="nova-status-bar"
                checked={statusBarVisible}
                onCheckedChange={onStatusBarVisibleChange}
                aria-label={copy.settings.showStatusBar}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl border border-outline-variant bg-surface-container p-4">
              <div className="flex min-w-0 gap-3">
                <Type aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="space-y-1">
                  <Label htmlFor="nova-toolbar-labels">{copy.settings.toolbarLabels}</Label>
                  <p className="text-xs leading-5 text-on-surface-variant">{copy.settings.toolbarLabelsDescription}</p>
                </div>
              </div>
              <Switch
                id="nova-toolbar-labels"
                checked={toolbarLabelsVisible}
                onCheckedChange={onToolbarLabelsVisibleChange}
                aria-label={copy.settings.toolbarLabels}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl border border-outline-variant bg-surface-container p-4">
              <div className="flex min-w-0 gap-3">
                <Keyboard aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="space-y-1">
                  <Label htmlFor="nova-command-hints">{copy.settings.commandHints}</Label>
                  <p className="text-xs leading-5 text-on-surface-variant">{copy.settings.commandHintsDescription}</p>
                </div>
              </div>
              <Switch
                id="nova-command-hints"
                checked={commandHintsVisible}
                onCheckedChange={onCommandHintsVisibleChange}
                aria-label={copy.settings.commandHints}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl border border-outline-variant bg-surface-container p-4">
              <div className="flex min-w-0 gap-3">
                <PanelLeftClose aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="space-y-1">
                  <Label htmlFor="nova-compact-sidebar">{copy.settings.compactSidebar}</Label>
                  <p className="text-xs leading-5 text-on-surface-variant">{copy.settings.compactSidebarDescription}</p>
                </div>
              </div>
              <Switch
                id="nova-compact-sidebar"
                checked={compactSidebar}
                onCheckedChange={onCompactSidebarChange}
                aria-label={copy.settings.compactSidebar}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl border border-outline-variant bg-surface-container p-4">
              <div className="flex min-w-0 gap-3">
                <Focus aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="space-y-1">
                  <Label htmlFor="nova-focus-mode">{copy.settings.focusMode}</Label>
                  <p className="text-xs leading-5 text-on-surface-variant">{copy.settings.focusModeDescription}</p>
                </div>
              </div>
              <Switch
                id="nova-focus-mode"
                checked={focusModeEnabled}
                onCheckedChange={onFocusModeEnabledChange}
                aria-label={copy.settings.focusMode}
              />
            </div>
          </section>

          <Separator className="my-5" />

          <section className="space-y-4" data-app-settings-behavior="">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Save aria-hidden className="size-4 text-primary" />
              {copy.settings.behavior}
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl border border-outline-variant bg-surface-container p-4">
              <div className="space-y-1">
                <Label htmlFor="nova-auto-save">{copy.settings.autoSave}</Label>
                <p className="text-xs leading-5 text-on-surface-variant">{copy.settings.autoSaveDescription}</p>
              </div>
              <Switch
                id="nova-auto-save"
                checked={autoSaveEnabled}
                onCheckedChange={onAutoSaveEnabledChange}
                aria-label={copy.settings.autoSave}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl border border-outline-variant bg-surface-container p-4">
              <div className="flex min-w-0 gap-3">
                <Bell aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="space-y-1">
                  <Label htmlFor="nova-notifications">{copy.settings.notifications}</Label>
                  <p className="text-xs leading-5 text-on-surface-variant">{copy.settings.notificationsDescription}</p>
                </div>
              </div>
              <Switch
                id="nova-notifications"
                checked={notificationsEnabled}
                onCheckedChange={onNotificationsEnabledChange}
                aria-label={copy.settings.notifications}
              />
            </div>

            <div className="space-y-2">
              <Label>{copy.settings.motion}</Label>
              <p className="text-xs leading-5 text-on-surface-variant">{copy.settings.motionDescription}</p>
              <SegmentedControl
                aria-label={copy.settings.motion}
                value={motion}
                onValueChange={(value) => onMotionChange(value as MotionPreference)}
                className="w-full justify-between"
                options={motionOptions.map((option) => ({
                  value: option.value,
                  label: localizedOption(language, option),
                }))}
              />
            </div>
          </section>
        </div>

        <div className="border-t border-outline-variant px-5 py-4">
          <div className="mb-3 text-xs text-on-surface-variant">{copy.settings.save}</div>
          <Button variant="outline" className="w-full justify-center gap-2" onClick={onResetDefaults}>
            <RotateCcw aria-hidden className="size-4" />
            {copy.settings.reset}
          </Button>
          <p className="mt-2 text-center text-xs text-on-surface-variant">{copy.settings.resetDescription}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
