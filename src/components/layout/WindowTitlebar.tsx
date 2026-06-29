import type { MouseEvent } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Box, Check, Copy, Download, FileDown, FilePlus2, FolderOpen, HelpCircle, Minus, Monitor, Play, RotateCcw, Save, Settings, Sparkles, Square, Terminal, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onRunEditorCommand: (command: NovaEditorCommand) => void;
};

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

async function startWindowDrag(event: MouseEvent<HTMLElement>) {
  if (event.button !== 0) {
    return;
  }
  try {
    event.preventDefault();
    const appWindow = getCurrentWindow();
    await appWindow.startDragging();
  } catch {
    // Browser preview fallback.
  }
}

function TitleMenu({
  label,
  items,
  onRunCommand,
}: {
  label: string;
  items: TitleMenuItem[];
  onRunCommand: (command: NovaEditorCommand) => void;
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
          <span className="min-w-0 flex-1 truncate">命令说明</span>
          <span className="ml-auto text-[0.66rem] text-on-surface-variant">Ctrl+K</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WindowMenu() {
  const items: Array<{ label: string; icon: typeof Minus; action: WindowAction }> = [
    { label: "最小化", icon: Minus, action: "minimize" },
    { label: "最大化/还原", icon: Square, action: "toggleMaximize" },
    { label: "关闭窗口", icon: X, action: "close" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus-ring rounded-md px-2 py-1 transition-colors hover:bg-surface-container-high hover:text-on-surface data-[state=open]:bg-surface-container-high"
        >
          窗口
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>窗口</DropdownMenuLabel>
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

export function WindowTitlebar({ onRunEditorCommand }: WindowTitlebarProps) {
  return (
    <div
      className="relative flex h-10 shrink-0 select-none items-center border-b border-outline-variant bg-surface px-3 pr-32 text-xs text-on-surface-variant"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          data-tauri-drag-region=""
          onMouseDown={startWindowDrag}
          onDoubleClick={() => runWindowAction("toggleMaximize")}
          className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary-container text-primary-container-foreground"
        >
          <Sparkles aria-hidden className="size-3.5" />
        </div>
        <div
          data-tauri-drag-region=""
          className="flex min-w-0 shrink-0 items-center gap-2"
          onMouseDown={startWindowDrag}
          onDoubleClick={() => runWindowAction("toggleMaximize")}
        >
          <span className="shrink-0 font-medium text-on-surface">Nova UI Editor</span>
          <span className="truncate">Desktop UI project editor</span>
        </div>
        <div className="ml-3 hidden min-w-0 shrink items-center gap-1 overflow-hidden text-on-surface-variant md:flex">
          <TitleMenu
            label="文件"
            onRunCommand={onRunEditorCommand}
            items={[
              { label: "新建项目", command: "new-project", icon: FilePlus2 },
              { label: "打开项目", command: "open-project", icon: FolderOpen },
              { label: "保存到磁盘", command: "save-project", icon: Save, shortcut: "Ctrl+S" },
            ]}
          />
          <TitleMenu
            label="编辑"
            onRunCommand={onRunEditorCommand}
            items={[
              { label: "撤销", command: "undo", icon: Undo2, shortcut: "Ctrl+Z" },
              { label: "重做", command: "redo", icon: RotateCcw, shortcut: "Ctrl+Y" },
              { label: "复制选中控件", command: "copy-selection", icon: Copy, shortcut: "Ctrl+C" },
            ]}
          />
          <TitleMenu
            label="视图"
            onRunCommand={onRunEditorCommand}
            items={[
              { label: "Design 模式", command: "mode-design", icon: Sparkles },
              { label: "Logic 模式", command: "mode-logic", icon: Settings },
              { label: "Build 模式", command: "mode-build", icon: Terminal },
              { label: "Preview 模式", command: "mode-preview", icon: Monitor },
              { label: "Export 模式", command: "mode-export", icon: FileDown },
            ]}
          />
          <TitleMenu
            label="构建"
            onRunCommand={onRunEditorCommand}
            items={[
              { label: "运行检查", command: "quick-check-all", icon: Terminal },
              { label: "运行当前事件", command: "run-selected-event", icon: Play, shortcut: "F5" },
              { label: "构建 exe", command: "build-exe", icon: Download, shortcut: "Ctrl+Shift+B" },
              { label: "打包安装器", command: "bundle-installer", icon: Box },
            ]}
          />
          <WindowMenu />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="focus-ring rounded-md px-2 py-1 transition-colors hover:bg-surface-container-high hover:text-on-surface data-[state=open]:bg-surface-container-high"
              >
                帮助
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onSelect={() => onRunEditorCommand("help-guide")}>
                <HelpCircle aria-hidden className="size-4" />
                Nova 编辑器指南
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onRunEditorCommand("project-templates")}>
                <FilePlus2 aria-hidden className="size-4" />
                新建项目模板
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onRunEditorCommand("bundle-installer")}>
                <FileDown aria-hidden className="size-4" />
                导出桌面包
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div
        data-tauri-drag-region=""
        className="min-w-8 flex-1 self-stretch"
        onMouseDown={startWindowDrag}
        onDoubleClick={() => runWindowAction("toggleMaximize")}
      />

      <div className="absolute inset-y-0 right-3 flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          aria-label="最小化窗口"
          onClick={() => runWindowAction("minimize")}
        >
          <Minus />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          aria-label="最大化或还原窗口"
          onClick={() => runWindowAction("toggleMaximize")}
        >
          <Square />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-lg text-on-surface-variant hover:bg-destructive hover:text-destructive-foreground"
          aria-label="关闭窗口"
          onClick={() => runWindowAction("close")}
        >
          <X />
        </Button>
      </div>
    </div>
  );
}
