import type { MouseEvent } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Check, Copy, FileDown, FilePlus2, HelpCircle, Minus, RotateCcw, Settings, Sparkles, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type WindowAction = "minimize" | "toggleMaximize" | "close";

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

function TitleMenu({ label, items }: { label: string; items: string[] }) {
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
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {items.map((item, index) => (
          <DropdownMenuItem key={item}>
            {index === 0 ? <Check aria-hidden className="size-4" /> : null}
            {index === 1 ? <Copy aria-hidden className="size-4" /> : null}
            {index === 2 ? <RotateCcw aria-hidden className="size-4" /> : null}
            {item}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings aria-hidden className="size-4" />
          偏好设置
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

export function WindowTitlebar() {
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
          <TitleMenu label="文件" items={["新建项目", "打开项目", "保存到磁盘"]} />
          <TitleMenu label="编辑" items={["撤销", "重做", "复制选中控件"]} />
          <TitleMenu label="视图" items={["Design 模式", "Logic 模式", "Build 模式"]} />
          <TitleMenu label="构建" items={["运行检查", "构建 exe", "打包安装器"]} />
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
              <DropdownMenuItem>
                <HelpCircle aria-hidden className="size-4" />
                Nova 编辑器指南
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FilePlus2 aria-hidden className="size-4" />
                新建项目模板
              </DropdownMenuItem>
              <DropdownMenuItem>
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
