import { Activity, Layers, Palette, Ruler, ShieldCheck } from "lucide-react";
import type { ShowcaseId, ShowcaseNavItem } from "@/data/components";
import { showcaseNavItems } from "@/data/components";
import type { AppCopy } from "@/lib/i18n";
import type { AppLanguage, Density, ThemeMode, ThemeScheme } from "@/lib/preferences";
import { densityOptions, schemeOptions, themeOptions } from "@/lib/preferences";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";

type InspectorPanelProps = {
  activeId: ShowcaseId;
  copy: AppCopy;
  language: AppLanguage;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  scheme: ThemeScheme;
  onSchemeChange: (scheme: ThemeScheme) => void;
  density: Density;
  onDensityChange: (density: Density) => void;
  onSaveProject: () => void;
};

function localizedOption(language: AppLanguage, option: { labelZh: string; labelEn: string }) {
  return language === "zh-CN" ? option.labelZh : option.labelEn;
}

export function InspectorPanel({
  activeId,
  copy,
  language,
  theme,
  onThemeChange,
  scheme,
  onSchemeChange,
  density,
  onDensityChange,
  onSaveProject,
}: InspectorPanelProps) {
  const activeItem: ShowcaseNavItem = showcaseNavItems.find((item) => item.id === activeId) ?? showcaseNavItems[0];

  return (
    <aside className="hidden w-[320px] shrink-0 border-l border-outline-variant bg-surface-container-low px-4 py-4 xl:block">
      <div className="subtle-scrollbar h-full overflow-y-auto pr-1">
        <section className="rounded-[28px] bg-surface-container p-4 shadow-m3-1">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary-container text-primary-container-foreground">
              <Layers aria-hidden className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{copy.inspector.currentCanvas}</p>
              <p className="truncate text-xs text-on-surface-variant">{activeItem.category}</p>
            </div>
          </div>
          <h2 className="mt-4 text-xl font-medium">{activeItem.title}</h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">{activeItem.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {activeItem.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-[28px] bg-surface-container p-4 shadow-m3-1">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Palette aria-hidden className="size-4 text-primary" />
            {copy.inspector.theme}
          </div>
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
          <div className="mt-4 grid grid-cols-3 gap-2">
            {schemeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-label={localizedOption(language, option)}
                onClick={() => onSchemeChange(option.value)}
                className={cn(
                  "focus-ring flex flex-col items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-high p-2 text-xs font-medium",
                  scheme === option.value && "border-primary bg-primary-container text-primary-container-foreground",
                )}
              >
                <span className={cn("size-8 rounded-full shadow-m3-1", option.swatch)} />
                {localizedOption(language, option)}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-[28px] bg-surface-container p-4 shadow-m3-1">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Ruler aria-hidden className="size-4 text-primary" />
            {copy.inspector.desktopDensity}
          </div>
          <SegmentedControl
            aria-label={copy.inspector.desktopDensity}
            value={density}
            onValueChange={(value) => onDensityChange(value as Density)}
            className="w-full justify-between"
            options={densityOptions.map((option) => ({
              value: option.value,
              label: localizedOption(language, option),
            }))}
          />
        </section>

        <section className="mt-4 rounded-[28px] bg-surface-container p-4 shadow-m3-1">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium">
            <Activity aria-hidden className="size-4 text-primary" />
            {copy.inspector.runtime}
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-xs text-on-surface-variant">
                <span>{copy.inspector.coverage}</span>
                <span>91%</span>
              </div>
              <Progress value={91} />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs text-on-surface-variant">
                <span>{copy.inspector.interactions}</span>
                <span>86%</span>
              </div>
              <Progress value={86} />
            </div>
          </div>
          <Button className="mt-4 w-full" onClick={onSaveProject}>
            <ShieldCheck aria-hidden />
            {copy.inspector.saveProject}
          </Button>
        </section>
      </div>
    </aside>
  );
}
