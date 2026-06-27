import { CheckCircle2, Database, Monitor } from "lucide-react";
import type { Density, ThemeMode, ThemeScheme } from "@/App";

type StatusBarProps = {
  theme: ThemeMode;
  scheme: ThemeScheme;
  density: Density;
};

const themeLabel: Record<ThemeMode, string> = {
  light: "浅色",
  dark: "深色",
  system: "跟随系统",
};

const schemeLabel: Record<ThemeScheme, string> = {
  violet: "紫藤",
  blue: "海蓝",
  green: "青木",
};

const densityLabel: Record<Density, string> = {
  compact: "紧凑",
  cozy: "标准",
  comfortable: "舒展",
};

export function StatusBar({ theme, scheme, density }: StatusBarProps) {
  return (
    <footer className="flex h-8 shrink-0 items-center justify-between border-t border-outline-variant bg-surface-container-lowest px-4 text-xs text-on-surface-variant">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 aria-hidden className="size-3.5 text-primary" />
          本地预览就绪
        </span>
        <span className="hidden items-center gap-1.5 md:flex">
          <Database aria-hidden className="size-3.5" />
          6 个组件组
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>主题：{themeLabel[theme]} / {schemeLabel[scheme]}</span>
        <span className="hidden items-center gap-1.5 md:flex">
          <Monitor aria-hidden className="size-3.5" />
          密度：{densityLabel[density]}
        </span>
      </div>
    </footer>
  );
}
