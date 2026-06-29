import type { PointerEvent } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Box, Check, Copy, Download, FileDown, FilePlus2, FolderOpen, HelpCircle, Minus, Monitor, Play, RotateCcw, Save, Settings, Sparkles, Square, Terminal, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppCopy } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NovaEditorCommand } from "@/lib/editor-commands";

type WindowAction = "minimize" | "toggleMaximize" | "close";
type TitleMenuItem = {
  label: string;
  command: NovaEditorCommand;
  icon: typeof Check;
  shortcut?: string;
};
type WindowTitlebarProps = {
  copy: AppCopy;
  onOpenSettings: () => void;
  onRunEditorCommand: (command: NovaEditorCommand) => void;
};

const TITLEBAR_INTERACTIVE_SELECTOR = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "[role='button']",
  "[role='menuitem']",
  "[data-titlebar-interactive='true']",
  "[contenteditable='true']",
].join(",");

function isTitlebarInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && target.closest(TITLEBAR_INTERACTIVE_SELECTOR);
}

async function runWindowAction(action: WindowAction) {
  try {
    const appWindow = getCurrentWindow();
    if (action === "minimize") {
      await appWindow.minimize();
    }
    if (action === "toggleMaximize") {
      await appWindow.toggleMaximize();
    }
    if (action === "close") {
      await appWindow.close();
    }
  } catch {
    // Browser preview fallback: keep controls visible without failing outside Tauri.
  }
}

function startWindowDrag(event: PointerEvent<HTMLElement>) {
  if (event.button !== 0) {
    return;
  }
  if (isTitlebarInteractiveTarget(event.target)) {
    return;
  }

  void getCurrentWindow().startDragging().catch(() => {
    // Browser preview fallback.
  });
}

function TitleMenu({
  label,
  items,
  onRunCommand,
  commandHelpLabel,
}: {
  label: string;
  items: TitleMenuItem[];
  onRunCommand: (command: NovaEditorCommand) => void;
  commandHelpLabel: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus-ring rounded-md px-2 py-1 transition-colors hover:bg-surface-container-high hover:text-on-surface data-[state=open]:bg-surface-container-high"
        >
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <DropdownMenuItem key={item.command} onSelect={() => onRunCommand(item.command)}>
              <Icon aria-hidden className="size-4" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.shortcut ? <span className="ml-auto text-[0.66rem] text-on-surface-variant">{item.shortcut}</span> : null}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onRunCommand("help-guide")}>
          <Settings aria-hidden className="size-4" />
          <span className="min-w-0 flex-1 truncate">{commandHelpLabel}</span>
          <span className="ml-auto text-[0.66rem] text-on-surface-variant">Ctrl+K</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WindowMenu({ copy }: { copy: AppCopy }) {
  const items: Array<{ label: string; icon: typeof Minus; action: WindowAction }> = [
    { label: copy.titlebar.minimize, icon: Minus, action: "minimize" },
    { label: copy.titlebar.maximize, icon: Square, action: "toggleMaximize" },
    { label: copy.titlebar.close, icon: X, action: "close" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus-ring rounded-md px-2 py-1 transition-colors hover:bg-surface-container-high hover:text-on-surface data-[state=open]:bg-surface-container-high"
        >
          {copy.titlebar.window}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>{copy.titlebar.window}</DropdownMenuLabel>
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <DropdownMenuItem key={item.action} onSelect={() => runWindowAction(item.action)}>
              <Icon aria-hidden className="size-4" />
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function WindowTitlebar({ copy, onOpenSettings, onRunEditorCommand }: WindowTitlebarProps) {
  return (
    <div
      data-tauri-drag-region=""
      className="relative flex h-10 shrink-0 select-none items-center border-b border-outline-variant bg-surface px-3 pr-32 text-xs text-on-surface-variant"
      onPointerDown={startWindowDrag}
      onDoubleClick={(event) => {
        if (!isTitlebarInteractiveTarget(event.target)) {
          void runWindowAction("toggleMaximize");
        }
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary-container text-primary-container-foreground"
        >
          <Sparkles aria-hidden className="size-3.5" />
        </div>
        <div
          className="flex min-w-0 shrink-0 items-center gap-2"
        >
          <span className="shrink-0 font-medium text-on-surface">{copy.appName}</span>
          <span className="truncate">{copy.titlebar.subtitle}</span>
        </div>
        <div
          data-titlebar-interactive="true"
          className="ml-3 hidden min-w-0 shrink items-center gap-1 overflow-hidden text-on-surface-variant md:flex"
        >
          <TitleMenu
            label={copy.titlebar.file}
            onRunCommand={onRunEditorCommand}
            commandHelpLabel={copy.titlebar.commandHelp}
            items={[
              { label: copy.titlebar.newProject, command: "new-project", icon: FilePlus2 },
              { label: copy.titlebar.openProject, command: "open-project", icon: FolderOpen },
              { label: copy.titlebar.saveProject, command: "save-project", icon: Save, shortcut: "Ctrl+S" },
              { label: copy.titlebar.appSettings, command: "open-app-settings", icon: Settings },
            ]}
          />
          <TitleMenu
            label={copy.titlebar.edit}
            onRunCommand={onRunEditorCommand}
            commandHelpLabel={copy.titlebar.commandHelp}
            items={[
              { label: copy.titlebar.undo, command: "undo", icon: Undo2, shortcut: "Ctrl+Z" },
              { label: copy.titlebar.redo, command: "redo", icon: RotateCcw, shortcut: "Ctrl+Y" },
              { label: copy.titlebar.copySelection, command: "copy-selection", icon: Copy, shortcut: "Ctrl+C" },
            ]}
          />
          <TitleMenu
            label={copy.titlebar.view}
            onRunCommand={onRunEditorCommand}
            commandHelpLabel={copy.titlebar.commandHelp}
            items={[
              { label: copy.titlebar.designMode, command: "mode-design", icon: Sparkles },
              { label: copy.titlebar.logicMode, command: "mode-logic", icon: Settings },
              { label: copy.titlebar.buildMode, command: "mode-build", icon: Terminal },
              { label: copy.titlebar.previewMode, command: "mode-preview", icon: Monitor },
              { label: copy.titlebar.exportMode, command: "mode-export", icon: FileDown },
            ]}
          />
          <TitleMenu
            label={copy.titlebar.build}
            onRunCommand={onRunEditorCommand}
            commandHelpLabel={copy.titlebar.commandHelp}
            items={[
              { label: copy.titlebar.quickCheck, command: "quick-check-all", icon: Terminal },
              { label: copy.titlebar.runEvent, command: "run-selected-event", icon: Play, shortcut: "F5" },
              { label: copy.titlebar.buildExe, command: "build-exe", icon: Download, shortcut: "Ctrl+Shift+B" },
              { label: copy.titlebar.bundleInstaller, command: "bundle-installer", icon: Box },
            ]}
          />
          <WindowMenu copy={copy} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="focus-ring rounded-md px-2 py-1 transition-colors hover:bg-surface-container-high hover:text-on-surface data-[state=open]:bg-surface-container-high"
              >
                {copy.titlebar.help}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onSelect={onOpenSettings}>
                <Settings aria-hidden className="size-4" />
                {copy.titlebar.appSettings}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onRunEditorCommand("help-guide")}>
                <HelpCircle aria-hidden className="size-4" />
                {copy.titlebar.guide}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onRunEditorCommand("project-templates")}>
                <FilePlus2 aria-hidden className="size-4" />
                {copy.titlebar.templates}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onRunEditorCommand("bundle-installer")}>
                <FileDown aria-hidden className="size-4" />
                {copy.titlebar.exportPackage}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div
        className="min-w-8 flex-1 self-stretch"
      />

      <div data-titlebar-interactive="true" className="absolute inset-y-0 right-3 flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          aria-label={copy.titlebar.settingsAria}
          onClick={onOpenSettings}
        >
          <Settings />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          aria-label={copy.titlebar.minimizeAria}
          onClick={() => runWindowAction("minimize")}
        >
          <Minus />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          aria-label={copy.titlebar.maximizeAria}
          onClick={() => runWindowAction("toggleMaximize")}
        >
          <Square />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-lg text-on-surface-variant hover:bg-destructive hover:text-destructive-foreground"
          aria-label={copy.titlebar.closeAria}
          onClick={() => runWindowAction("close")}
        >
          <X />
        </Button>
      </div>
    </div>
  );
}
