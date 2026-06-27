import { Activity, Layers, Palette, Ruler, ShieldCheck } from "lucide-react";
import type { ShowcaseId, ShowcaseNavItem } from "@/data/components";
import { showcaseNavItems } from "@/data/components";
import type { Density, ThemeMode, ThemeScheme } from "@/App";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";

type InspectorPanelProps = {
  activeId: ShowcaseId;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  scheme: ThemeScheme;
  onSchemeChange: (scheme: ThemeScheme) => void;
  density: Density;
  onDensityChange: (density: Density) => void;
  onToast: () => void;
};

const schemeOptions: Array<{ value: ThemeScheme; label: string; className: string }> = [
  { value: "violet", label: "紫藤", className: "bg-[#6750A4]" },
  { value: "blue", label: "海蓝", className: "bg-[#0B65C2]" },
  { value: "green", label: "青木", className: "bg-[#146C43]" },
];

export function InspectorPanel({
  activeId,
  theme,
  onThemeChange,
  scheme,
  onSchemeChange,
  density,
  onDensityChange,
  onToast,
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
              <p className="truncate text-sm font-medium">当前画布</p>
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
            主题
          </div>
          <SegmentedControl
            aria-label="主题模式"
            value={theme}
            onValueChange={(value) => onThemeChange(value as ThemeMode)}
            className="w-full justify-between"
            options={[
              { value: "light", label: "浅色" },
              { value: "dark", label: "深色" },
              { value: "system", label: "系统" },
            ]}
          />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {schemeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-label={`切换到${option.label}主题`}
                onClick={() => onSchemeChange(option.value)}
                className={cn(
                  "focus-ring flex flex-col items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-high p-2 text-xs font-medium",
                  scheme === option.value && "border-primary bg-primary-container text-primary-container-foreground",
                )}
              >
                <span className={cn("size-8 rounded-full shadow-m3-1", option.className)} />
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-[28px] bg-surface-container p-4 shadow-m3-1">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Ruler aria-hidden className="size-4 text-primary" />
            桌面密度
          </div>
          <SegmentedControl
            aria-label="界面密度"
            value={density}
            onValueChange={(value) => onDensityChange(value as Density)}
            className="w-full justify-between"
            options={[
              { value: "compact", label: "紧凑" },
              { value: "cozy", label: "标准" },
              { value: "comfortable", label: "舒展" },
            ]}
          />
        </section>

        <section className="mt-4 rounded-[28px] bg-surface-container p-4 shadow-m3-1">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium">
            <Activity aria-hidden className="size-4 text-primary" />
            运行状态
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-xs text-on-surface-variant">
                <span>组件覆盖</span>
                <span>91%</span>
              </div>
              <Progress value={91} />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs text-on-surface-variant">
                <span>交互可用</span>
                <span>86%</span>
              </div>
              <Progress value={86} />
            </div>
          </div>
          <Button className="mt-4 w-full" onClick={onToast}>
            <ShieldCheck aria-hidden />
            同步工作台
          </Button>
        </section>
      </div>
    </aside>
  );
}
