import { useRef, useState } from "react";
import { Bell, Check, Command, Menu, MoreHorizontal, Save, Search, Settings, X } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
  onOpenMobileNav: () => void;
  onToast: () => void;
  notificationsEnabled: boolean;
  toolbarLabelsVisible: boolean;
  commandHintsVisible: boolean;
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
  onOpenMobileNav,
  onToast,
  notificationsEnabled,
  toolbarLabelsVisible,
  commandHintsVisible,
}: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchVisible = searchOpen || searchQuery.trim().length > 0;
  const openSearch = () => {
    setSearchOpen(true);
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-10 shrink-0 items-center gap-2 border-b border-outline-variant/70 bg-surface-container-lowest px-3"
      data-showcase-topbar="compact-library-only"
      data-topbar-scope="component-library"
    >
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={copy.topbar.openNav}
        className="lg:hidden"
        onClick={onOpenMobileNav}
      >
        <Menu />
      </Button>

      <div
        className={cn(
          "relative min-w-0 flex-none transition-[width] duration-150",
          searchVisible ? "w-[min(28rem,44vw)]" : "w-8",
        )}
        data-topbar-search-state={searchVisible ? "expanded" : "collapsed"}
      >
        {searchVisible ? (
          <>
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-on-surface-variant" />
            <Input
              ref={searchInputRef}
              aria-label={copy.topbar.searchAria}
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              onBlur={() => window.setTimeout(() => !searchQuery.trim() && setSearchOpen(false), 120)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  onSearchChange("");
                  setSearchOpen(false);
                  searchInputRef.current?.blur();
                }
              }}
              placeholder={copy.topbar.searchPlaceholder}
              className={cn("h-8 rounded-lg border-outline-variant bg-surface-container pl-8 text-xs shadow-none", commandHintsVisible ? "pr-20" : "pr-9")}
              data-topbar-search-expanded=""
            />
            {searchQuery ? (
              <button
                type="button"
                className="focus-ring absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                aria-label={copy.topbar.clearSearch}
                data-topbar-search-clear=""
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSearchChange("");
                  searchInputRef.current?.focus();
                }}
              >
                <X aria-hidden className="size-3.5" />
              </button>
            ) : commandHintsVisible ? (
              <button
                type="button"
                className="focus-ring absolute right-1.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md bg-surface-container-high px-1.5 py-0.5 text-[0.62rem] font-medium text-on-surface-variant transition-colors hover:text-on-surface md:flex"
                onMouseDown={(event) => event.preventDefault()}
                onClick={onOpenCommand}
                aria-label={copy.topbar.openCommand}
              >
                <Command aria-hidden className="size-3" />
                K
              </button>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            className="focus-ring flex size-8 items-center justify-center rounded-lg border border-outline-variant bg-surface-container text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
            aria-label={copy.topbar.searchAria}
            title={copy.topbar.searchPlaceholder}
            data-topbar-search-collapsed=""
            onClick={openSearch}
          >
            <Search aria-hidden className="size-3.5" />
          </button>
        )}
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label={copy.topbar.openCommand} onClick={onOpenCommand}>
            <Command />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copy.topbar.commandPalette}</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={toolbarLabelsVisible ? "sm" : "icon-sm"}
            className={cn("h-8 rounded-lg", toolbarLabelsVisible ? "gap-1.5 px-2 text-xs" : "px-0")}
            aria-label={copy.topbar.densityControl}
          >
            <MoreHorizontal aria-hidden className="size-4" />
            <span className={toolbarLabelsVisible ? "" : "sr-only"}>{copy.topbar.tools}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>{copy.topbar.tools}</DropdownMenuLabel>
          <DropdownMenuItem onSelect={onOpenCommand}>
            <Command aria-hidden className="size-4" />
            <span className="min-w-0 flex-1 truncate">{copy.topbar.commandPalette}</span>
            {commandHintsVisible ? <span className="ml-auto text-[0.66rem] text-on-surface-variant">Ctrl+K</span> : null}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onSaveProject}>
            <Save aria-hidden className="size-4" />
            <span className="min-w-0 flex-1 truncate">{copy.topbar.saveProject}</span>
            {commandHintsVisible ? <span className="ml-auto text-[0.66rem] text-on-surface-variant">Ctrl+S</span> : null}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!notificationsEnabled} onSelect={onToast}>
            <Bell aria-hidden className="size-4" />
            {notificationsEnabled ? copy.topbar.notify : copy.topbar.notifyDisabled}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{copy.topbar.displayMode}</DropdownMenuLabel>
          {themeOptions.map((option) => (
            <DropdownMenuItem key={option.value} onSelect={() => onThemeChange(option.value)}>
              <Check aria-hidden className={theme === option.value ? "opacity-100" : "opacity-0"} />
              {language === "zh-CN" ? option.labelZh : option.labelEn}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{copy.topbar.colorScheme}</DropdownMenuLabel>
          {schemeOptions.map((option) => (
            <DropdownMenuItem key={option.value} onSelect={() => onSchemeChange(option.value)}>
              <Check aria-hidden className={scheme === option.value ? "opacity-100" : "opacity-0"} />
              {language === "zh-CN" ? option.labelZh : option.labelEn}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{copy.topbar.density}</DropdownMenuLabel>
          <div className="px-2 py-1">
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onOpenSettings}>
            <Settings aria-hidden className="size-4" />
            {copy.topbar.openSettings}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
