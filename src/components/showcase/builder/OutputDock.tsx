import { useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { ChevronUp, Maximize2, Minimize2, X } from "lucide-react";
import type { BuilderDockTab } from "./ProjectDock";
import { DockTabList } from "./ProjectDock";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OUTPUT_DOCK_MIN_HEIGHT = 300;
const OUTPUT_DOCK_COMPACT_MIN_HEIGHT = 192;
const OUTPUT_DOCK_DEFAULT_HEIGHT = 360;
const OUTPUT_DOCK_RESIZE_STEP = 24;
const OUTPUT_DOCK_VIEWPORT_MARGIN = 88;
const OUTPUT_DOCK_STATUS_BAR_OFFSET = "2rem";

function outputDockViewportMaxHeight() {
  if (typeof window === "undefined") {
    return 720;
  }
  return Math.max(OUTPUT_DOCK_COMPACT_MIN_HEIGHT, window.innerHeight - OUTPUT_DOCK_VIEWPORT_MARGIN);
}

function outputDockMinHeight() {
  return Math.min(OUTPUT_DOCK_MIN_HEIGHT, outputDockViewportMaxHeight());
}

function boundedOutputDockHeight(height: number) {
  const viewportMax = outputDockViewportMaxHeight();
  const viewportMin = outputDockMinHeight();
  return Math.min(Math.max(Math.round(height), viewportMin), viewportMax);
}

export function OutputDock<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  expanded = false,
  onExpandedChange,
  minimized = false,
  onMinimizedChange,
  avoidDesignSideDocks = false,
  height,
  onHeightChange,
  summary,
  minimizedSummary,
  children,
}: {
  tabs: BuilderDockTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  minimized?: boolean;
  onMinimizedChange?: (minimized: boolean) => void;
  avoidDesignSideDocks?: boolean;
  height?: number;
  onHeightChange?: (height: number) => void;
  summary?: ReactNode;
  minimizedSummary?: ReactNode;
  children: ReactNode;
}) {
  const [fallbackHeight, setFallbackHeight] = useState(OUTPUT_DOCK_DEFAULT_HEIGHT);
  const [resizing, setResizing] = useState(false);
  const resizeStartRef = useRef<{ pointerId: number; startY: number; startHeight: number } | null>(null);
  const ExpandIcon = expanded ? Minimize2 : Maximize2;
  const dockMinHeight = outputDockMinHeight();
  const dockMaxHeight = outputDockViewportMaxHeight();
  const dockHeight = boundedOutputDockHeight(height ?? fallbackHeight);
  const dockShortViewport = dockMaxHeight < OUTPUT_DOCK_MIN_HEIGHT;
  const dockHeightClass = minimized ? "h-9" : "max-h-[calc(100vh-5.5rem)]";
  const dockShellClass = "pointer-events-none overflow-visible rounded-none border border-transparent bg-transparent shadow-none backdrop-blur-0";
  const dockPanelChromeClass =
    "pointer-events-auto relative overflow-hidden rounded-t-xl border border-b-0 border-outline-variant/90 bg-surface-container-lowest/98 shadow-none backdrop-blur-xl";
  const dockMotionClass = minimized ? "transition-none" : "transition-[height]";
  const dockSurfaceStyle = {
    "--builder-output-dock-statusbar-offset": OUTPUT_DOCK_STATUS_BAR_OFFSET,
    "--builder-output-dock-safe-bottom": "calc(var(--builder-output-dock-statusbar-offset) + env(safe-area-inset-bottom))",
    bottom: "var(--builder-output-dock-safe-bottom)",
    contain: "layout paint",
  } as CSSProperties;
  const dockStyle = minimized
    ? ({
        ...dockSurfaceStyle,
        height: "2.25rem",
        minHeight: "2.25rem",
        maxHeight: "2.25rem",
        backgroundColor: "transparent",
        borderColor: "transparent",
        boxShadow: "none",
      } as CSSProperties)
    : ({
        ...dockSurfaceStyle,
        "--builder-output-dock-height": `${dockHeight}px`,
        "--builder-output-dock-min-height": `${dockMinHeight}px`,
        "--builder-output-dock-max-height": `${dockMaxHeight}px`,
        height: "min(var(--builder-output-dock-height), var(--builder-output-dock-max-height))",
        minHeight: "var(--builder-output-dock-min-height)",
        maxHeight: "var(--builder-output-dock-max-height)",
      } as CSSProperties);
  const bodyLayoutClass = expanded
    ? cn(
        "grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] lg:grid-rows-1",
        dockShortViewport ? "gap-2 p-2 pt-3" : "gap-2.5 p-2.5 pt-4",
      )
    : cn("grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)]", dockShortViewport ? "gap-1.5 p-2 pt-3" : "gap-2 p-2.5 pt-4");
  const summaryLayoutClass = expanded
    ? "grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-2 overflow-hidden"
    : "grid min-w-0 gap-2";
  const summaryCardClass = expanded
    ? "subtle-scrollbar min-h-0 min-w-0 overflow-auto overscroll-contain break-words rounded-[22px] border border-outline-variant/70 bg-surface-container-low p-2.5 [overflow-wrap:anywhere]"
    : "subtle-scrollbar max-h-[5.75rem] min-w-0 overflow-auto overscroll-contain break-words rounded-[20px] border border-outline-variant/70 bg-surface-container-low p-2 [overflow-wrap:anywhere]";
  const contentPanelClass =
    "subtle-scrollbar h-full min-h-0 min-w-0 overflow-auto overscroll-contain break-words rounded-lg border border-outline-variant bg-surface-container p-3 shadow-none [overflow-wrap:anywhere]";
  const dockPanelStyle = {
    backgroundColor: "hsl(var(--surface-container-lowest) / 0.98)",
    borderColor: "hsl(var(--outline-variant) / 0.9)",
    boxShadow: "0 -1px 0 hsl(var(--outline-variant) / 0.5)",
    WebkitBackdropFilter: "blur(18px)",
    backdropFilter: "blur(18px)",
  } as CSSProperties;
  const minimizedStripStyle = {
    backgroundColor: "hsl(var(--surface-container-lowest) / 0.98)",
    borderColor: "hsl(var(--outline-variant) / 0.9)",
    boxShadow: "0 -1px 0 hsl(var(--outline-variant) / 0.45)",
    WebkitBackdropFilter: "blur(18px)",
    backdropFilter: "blur(18px)",
  } as CSSProperties;
  const handleTabChange = (tab: T) => {
    onTabChange(tab);
    if (minimized) {
      onMinimizedChange?.(false);
    }
  };
  const commitHeight = (nextHeight: number) => {
    const bounded = boundedOutputDockHeight(nextHeight);
    if (height === undefined) {
      setFallbackHeight(bounded);
    }
    onHeightChange?.(bounded);
  };
  const startResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (minimized || event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeStartRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: dockHeight,
    };
    setResizing(true);
  };
  const moveResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const session = resizeStartRef.current;
    if (!session || session.pointerId !== event.pointerId) {
      return;
    }
    commitHeight(session.startHeight + session.startY - event.clientY);
  };
  const stopResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const session = resizeStartRef.current;
    if (!session || session.pointerId !== event.pointerId) {
      return;
    }
    resizeStartRef.current = null;
    setResizing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };
  const resizeFromKeyboard = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      commitHeight(dockHeight + OUTPUT_DOCK_RESIZE_STEP);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      commitHeight(dockHeight - OUTPUT_DOCK_RESIZE_STEP);
    }
    if (event.key === "Home") {
      event.preventDefault();
      commitHeight(OUTPUT_DOCK_MIN_HEIGHT);
    }
    if (event.key === "End") {
      event.preventDefault();
      commitHeight(outputDockViewportMaxHeight());
    }
  };

  return (
    <section
      className={cn(
        "isolate fixed bottom-0 left-0 right-0 z-40 shrink-0 md:left-[88px]",
        resizing && "select-none",
        avoidDesignSideDocks && "xl:left-[328px] xl:right-[304px]",
        dockShellClass,
        dockMotionClass,
        dockHeightClass,
      )}
      style={dockStyle}
      data-builder-output-dock=""
      data-builder-output-dock-expanded={expanded ? "true" : "false"}
      data-builder-output-dock-layout={minimized ? "minimized" : expanded ? "expanded" : "standard"}
      data-builder-output-dock-height={minimized ? "minimized" : dockHeight}
      data-builder-output-dock-min-height={minimized ? "minimized" : dockMinHeight}
      data-builder-output-dock-max-height={minimized ? "minimized" : dockMaxHeight}
      data-builder-output-dock-viewport-fit=""
      data-builder-output-dock-short-viewport={dockShortViewport ? "true" : "false"}
      data-builder-output-dock-minimized={minimized ? "true" : "false"}
      data-builder-output-dock-resizing={resizing ? "true" : "false"}
      data-builder-output-dock-shell="docked-strip"
      data-builder-output-dock-minimized-chrome={minimized ? "docked-strip" : "full-panel"}
      data-builder-output-dock-no-reserved-band=""
      data-builder-output-dock-low-chrome=""
      data-builder-output-dock-safe-area="bottom"
      data-builder-output-dock-statusbar-offset=""
      data-builder-output-dock-transparent-shell=""
      data-builder-output-dock-no-background-shield=""
      data-builder-output-dock-content-clip="scroll-panels"
      aria-label="Editor output dock"
    >
      {minimized ? (
        <div
          className={cn(
            "pointer-events-auto grid h-9 w-full min-w-0 items-center gap-2 overflow-hidden rounded-none border-y border-outline-variant/80 bg-surface-container-lowest/98 px-2 shadow-none backdrop-blur-xl",
            minimizedSummary
              ? "grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto]"
              : "grid-cols-[minmax(0,1fr)_auto]",
          )}
          style={minimizedStripStyle}
          data-builder-output-dock-minimized-shell=""
        >
          <div className="min-w-0 max-h-full overflow-hidden">
            <DockTabList tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} layout="inline" />
          </div>
          {minimizedSummary ? (
            <div
              className="subtle-scrollbar hidden min-w-0 max-h-full items-center overflow-x-auto border-l border-outline-variant/70 px-2 py-0 text-[0.68rem] leading-none text-on-surface-variant md:flex"
              data-builder-output-dock-minimized-summary=""
              data-builder-output-dock-minimized-peek=""
            >
              {minimizedSummary}
            </div>
          ) : null}
          <Button
            size="icon-sm"
            variant="secondary"
            className="size-7"
            aria-label="显示输出面板"
            title="显示输出面板 (Ctrl+J)"
            data-builder-restore-output-dock=""
            onClick={() => onMinimizedChange?.(false)}
          >
            <ChevronUp aria-hidden className="size-3.5" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            bodyLayoutClass,
            dockPanelChromeClass,
            resizing && "border-primary/60 shadow-[0_18px_60px_hsl(var(--shadow)/0.24)]",
          )}
          style={dockPanelStyle}
          data-builder-output-dock-body=""
          data-builder-output-dock-panel="surface"
        >
          <button
            type="button"
            className={cn(
              "focus-ring absolute left-10 right-10 top-1.5 z-10 flex h-3 cursor-row-resize items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary",
              resizing && "bg-primary/12 text-primary",
            )}
            aria-label="调整输出面板高度"
            aria-valuemin={dockMinHeight}
            aria-valuemax={dockMaxHeight}
            aria-valuenow={dockHeight}
            data-builder-output-dock-resize-handle=""
            onPointerDown={startResize}
            onPointerMove={moveResize}
            onPointerUp={stopResize}
            onPointerCancel={stopResize}
            onKeyDown={resizeFromKeyboard}
          >
            <span className="h-1 w-14 rounded-full bg-current opacity-40" />
          </button>
          <div className={summaryLayoutClass}>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2" data-builder-output-dock-header="">
              <DockTabList tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} layout="inline" />
              <div className="flex items-start gap-1">
                {onMinimizedChange ? (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="最小化输出面板"
                    title="最小化输出面板 (Esc)"
                    data-builder-minimize-output-dock=""
                    onClick={() => onMinimizedChange(true)}
                  >
                    <X aria-hidden className="size-3.5" />
                  </Button>
                ) : null}
                {onExpandedChange ? (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={expanded ? "收起输出面板" : "展开输出面板"}
                    data-builder-toggle-output-dock=""
                    onClick={() => onExpandedChange(!expanded)}
                  >
                    <ExpandIcon aria-hidden className="size-3.5" />
                  </Button>
                ) : null}
              </div>
            </div>
            {summary ? (
              <div
                className={summaryCardClass}
                data-builder-output-dock-summary=""
                data-builder-output-dock-rounded-panel=""
              >
                {summary}
              </div>
            ) : null}
          </div>
          <div
            className={contentPanelClass}
            data-builder-output-dock-content=""
            data-builder-output-dock-rounded-content=""
            data-builder-output-dock-wrap-policy="break-anywhere"
          >
            {children}
          </div>
        </div>
      )}
    </section>
  );
}
