import { Bell, Check, Command, Download, LayoutGrid, Menu, Moon, Palette, Search, SlidersHorizontal, Sun } from "lucide-react";
import type { Density, ThemeMode, ThemeScheme } from "@/App";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TopbarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  scheme: ThemeScheme;
  onSchemeChange: (scheme: ThemeScheme) => void;
  density: Density;
  onDensityChange: (value: Density) => void;
  onOpenCommand: () => void;
  onOpenMobileNav: () => void;
  onToast: () => void;
};

export function Topbar({
  searchQuery,
  onSearchChange,
  theme,
  onThemeChange,
  scheme,
  onSchemeChange,
  density,
  onDensityChange,
  onOpenCommand,
  onOpenMobileNav,
  onToast,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center gap-3 bg-surface-container-lowest px-5">
      <Button
        variant="ghost"
        size="icon"
        aria-label="打开导航"
        className="lg:hidden"
        onClick={onOpenMobileNav}
      >
        <Menu />
      </Button>

      <div className="relative min-w-0 flex-1 md:max-w-xl">
        <Search aria-hidden className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-on-surface-variant" />
        <Input
          aria-label="筛选组件"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="搜索组件、状态、模式..."
          className="h-12 rounded-full bg-surface-container-high pl-12 pr-24 text-base"
        />
        <button
          type="button"
          className="focus-ring absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-full bg-surface-container-highest px-3 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:text-on-surface md:flex"
          onClick={onOpenCommand}
          aria-label="打开命令面板"
        >
          <Command aria-hidden className="size-3" />
          K
        </button>
      </div>

      <div className="ml-auto hidden items-center gap-2 xl:flex">
        <SegmentedControl
          aria-label="界面密度"
          value={density}
          onValueChange={(value) => onDensityChange(value as Density)}
          options={[
            { value: "compact", label: "紧凑" },
            { value: "cozy", label: "标准" },
            { value: "comfortable", label: "舒展" },
          ]}
        />
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="打开命令面板" onClick={onOpenCommand}>
            <Command />
          </Button>
        </TooltipTrigger>
        <TooltipContent>命令面板</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="hidden gap-2 md:inline-flex" aria-label="切换主题">
            {theme === "dark" ? <Moon aria-hidden /> : theme === "light" ? <Sun aria-hidden /> : <Palette aria-hidden />}
            主题
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>显示模式</DropdownMenuLabel>
          {[
            ["light", "浅色"],
            ["dark", "深色"],
            ["system", "跟随系统"],
          ].map(([value, label]) => (
            <DropdownMenuItem key={value} onClick={() => onThemeChange(value as ThemeMode)}>
              <Check aria-hidden className={theme === value ? "opacity-100" : "opacity-0"} />
              {label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>色彩方案</DropdownMenuLabel>
          {[
            ["violet", "紫藤"],
            ["blue", "海蓝"],
            ["green", "青木"],
          ].map(([value, label]) => (
            <DropdownMenuItem key={value} onClick={() => onSchemeChange(value as ThemeScheme)}>
              <Check aria-hidden className={scheme === value ? "opacity-100" : "opacity-0"} />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="发送测试通知" onClick={onToast}>
            <Bell />
          </Button>
        </TooltipTrigger>
        <TooltipContent>显示通知</TooltipContent>
      </Tooltip>

      <Button variant="secondary" className="hidden gap-2 md:inline-flex" onClick={onToast}>
        <LayoutGrid aria-hidden />
        同步预览
      </Button>

      <Button className="hidden gap-2 md:inline-flex" onClick={onToast}>
        <Download aria-hidden />
        导出
      </Button>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="打开密度控制" className="xl:hidden">
            <SlidersHorizontal />
          </Button>
        </TooltipTrigger>
        <TooltipContent>密度：{density === "compact" ? "紧凑" : density === "comfortable" ? "舒展" : "标准"}</TooltipContent>
      </Tooltip>
    </header>
  );
}
