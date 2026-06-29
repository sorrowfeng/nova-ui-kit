import { Bell, Check, Command, Download, Menu, Moon, Palette, Save, Search, Settings, SlidersHorizontal, Sun } from "lucide-react";
import type { AppCopy } from "@/lib/i18n";
import type { AppLanguage, Density, ThemeMode, ThemeScheme } from "@/lib/preferences";
import { densityOptions, schemeOptions, themeOptions } from "@/lib/preferences";
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
  language: AppLanguage;
  copy: AppCopy;
  density: Density;
  onDensityChange: (value: Density) => void;
  onOpenCommand: () => void;
  onOpenSettings: () => void;
  onSaveProject: () => void;
  onExportProject: () => void;
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
  language,
  copy,
  density,
  onDensityChange,
  onOpenCommand,
  onOpenSettings,
  onSaveProject,
  onExportProject,
  onOpenMobileNav,
  onToast,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center gap-3 bg-surface-container-lowest px-5">
      <Button
        variant="ghost"
        size="icon"
        aria-label={copy.topbar.openNav}
        className="lg:hidden"
        onClick={onOpenMobileNav}
      >
        <Menu />
      </Button>

      <div className="relative min-w-0 flex-1 md:max-w-xl">
        <Search aria-hidden className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-on-surface-variant" />
        <Input
          aria-label={copy.topbar.searchAria}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={copy.topbar.searchPlaceholder}
          className="h-12 rounded-full bg-surface-container-high pl-12 pr-24 text-base"
        />
        <button
          type="button"
          className="focus-ring absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-full bg-surface-container-highest px-3 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:text-on-surface md:flex"
          onClick={onOpenCommand}
          aria-label={copy.topbar.openCommand}
        >
          <Command aria-hidden className="size-3" />
          K
        </button>
      </div>

      <div className="ml-auto hidden items-center gap-2 xl:flex">
        <SegmentedControl
          aria-label={copy.topbar.density}
          value={density}
          onValueChange={(value) => onDensityChange(value as Density)}
          options={densityOptions.map((option) => ({
            value: option.value,
            label: language === "zh-CN" ? option.labelZh : option.labelEn,
          }))}
        />
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label={copy.topbar.openCommand} onClick={onOpenCommand}>
            <Command />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copy.topbar.commandPalette}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label={copy.topbar.openSettings} onClick={onOpenSettings}>
            <Settings />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copy.topbar.openSettings}</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="hidden gap-2 md:inline-flex" aria-label={copy.topbar.theme}>
            {theme === "dark" ? <Moon aria-hidden /> : theme === "light" ? <Sun aria-hidden /> : <Palette aria-hidden />}
            {copy.topbar.theme}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>{copy.topbar.displayMode}</DropdownMenuLabel>
          {themeOptions.map((option) => (
            <DropdownMenuItem key={option.value} onClick={() => onThemeChange(option.value)}>
              <Check aria-hidden className={theme === option.value ? "opacity-100" : "opacity-0"} />
              {language === "zh-CN" ? option.labelZh : option.labelEn}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{copy.topbar.colorScheme}</DropdownMenuLabel>
          {schemeOptions.map((option) => (
            <DropdownMenuItem key={option.value} onClick={() => onSchemeChange(option.value)}>
              <Check aria-hidden className={scheme === option.value ? "opacity-100" : "opacity-0"} />
              {language === "zh-CN" ? option.labelZh : option.labelEn}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label={copy.topbar.sendNotification} onClick={onToast}>
            <Bell />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copy.topbar.notify}</TooltipContent>
      </Tooltip>

      <Button variant="secondary" className="hidden gap-2 md:inline-flex" onClick={onSaveProject}>
        <Save aria-hidden />
        {copy.topbar.saveProject}
      </Button>

      <Button className="hidden gap-2 md:inline-flex" onClick={onExportProject}>
        <Download aria-hidden />
        {copy.topbar.export}
      </Button>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={copy.topbar.densityControl} className="xl:hidden">
                <SlidersHorizontal />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {copy.topbar.density}：
            {language === "zh-CN"
              ? densityOptions.find((option) => option.value === density)?.labelZh
              : densityOptions.find((option) => option.value === density)?.labelEn}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>{copy.topbar.density}</DropdownMenuLabel>
          {densityOptions.map((option) => (
            <DropdownMenuItem key={option.value} onClick={() => onDensityChange(option.value)}>
              <Check aria-hidden className={density === option.value ? "opacity-100" : "opacity-0"} />
              {language === "zh-CN" ? option.labelZh : option.labelEn}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
