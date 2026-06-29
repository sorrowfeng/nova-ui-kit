import { Languages, MonitorCog, RotateCcw, Settings2, Sparkles } from "lucide-react";
import type { AppCopy } from "@/lib/i18n";
import type { AppLanguage, Density, MotionPreference, ThemeMode, ThemeScheme } from "@/lib/preferences";
import { densityOptions, languageOptions, motionOptions, schemeOptions, themeOptions } from "@/lib/preferences";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  motion: MotionPreference;
  onMotionChange: (motion: MotionPreference) => void;
  onResetDefaults: () => void;
};

function localizedOption(language: AppLanguage, option: { labelZh: string; labelEn: string }) {
  return language === "zh-CN" ? option.labelZh : option.labelEn;
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
  motion,
  onMotionChange,
  onResetDefaults,
}: AppSettingsPanelProps) {
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
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Languages aria-hidden className="size-4 text-primary" />
              {copy.settings.language}
            </div>
            <p className="text-xs leading-5 text-on-surface-variant">{copy.settings.languageDescription}</p>
            <Select value={language} onValueChange={(value) => onLanguageChange(value as AppLanguage)}>
              <SelectTrigger aria-label={copy.settings.language}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <span>{option.label}</span>
                      <span className="text-xs text-on-surface-variant">{option.detail}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <Separator className="my-5" />

          <section className="space-y-4">
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
          </section>

          <Separator className="my-5" />

          <section className="space-y-4">
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
