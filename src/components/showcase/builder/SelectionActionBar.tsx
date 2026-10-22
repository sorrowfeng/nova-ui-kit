import type { ComponentType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  AlertTriangle,
  Box,
  Braces,
  ChevronRight,
  ClipboardCopy,
  Copy,
  CornerDownRight,
  Keyboard,
  Layers,
  ListChecks,
  Lock,
  LockOpen,
  Maximize2,
  MousePointer2,
  Move,
  MoveDown,
  MoveUp,
  Play,
  Scissors,
  Settings2,
  TextCursorInput,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { BuilderComponentType, BuilderItem } from "./types";
import { CountReadout, StateBadge, StateLabel } from "./view-helpers";

export type SelectionActionBarState = "idle" | "single" | "multi";

export type SelectionRecommendedStep = {
  id: string;
  actionLabel: string;
  disabled?: boolean;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  onAction: () => void;
};

export type SelectionRosterItem = BuilderItem;

export type SelectionActionBarProps = {
  hasCanvasSelection: boolean;
  selectionAnchorId: string;
  selectionActionBarState: SelectionActionBarState;
  selectionActionBarActionCount: number;
  selectionActionBarReservedTrack: string;
  selectionActionBarLabel: string;
  selectedItems: SelectionRosterItem[];
  selectedItem: SelectionRosterItem | null;
  getItemSummary: (item: BuilderItem) => string;
  getItemIcon: (type: BuilderComponentType) => LucideIcon | ComponentType<{ className?: string }>;
  selectedItemHierarchy: BuilderItem[];
  selectHierarchyBreadcrumbNode: (id: string | null) => void;
  activeFileName: string;
  selectedEventName: string | null;
  selectedEventCommandName: string | null;
  selectedPropertyIssueCount: number;
  selectionModeStrip: ReactNode;
  selectionCapabilityStrip: ReactNode;
  selectionBarStatusTone: string;
  selectionBarStatusLabel: string;
  selectionBarStatusTitle: string;
  selectionBarStatusDetail: string;
  selectionStatusTone: string;
  selectedSignalSlotLocation: string | null;
  selectedSignalSlotGoState: "open" | "create";
  goToSlotForItem: (item: BuilderItem | null) => void;
  hasSelectedSimulatorTrace: boolean;
  openSelectedConnections: () => void;
  selectionRecommendedStep: SelectionRecommendedStep | null;
  focusSelectedRosterItem: (id: string) => void;
  removeItemFromSelection: (id: string) => void;
  clearSelection: (options?: { feedback?: boolean }) => void;
  openSelectedProperties: () => void;
  selectedSameTypeCount: number;
  selectSameTypeControls: () => void;
  selectInverseSelection: () => void;
  focusSelectedObjectNameEditor: () => void;
  canFitSelectedCanvas: boolean;
  fitSelectedCanvasToViewport: () => void;
  selectedQuickTextProps: string[];
  startInlineTextEdit: (item: BuilderItem, prop: string, source?: string) => void;
  quickTextPropLabel: (prop: string) => string;
  textPropertyValue: (value: unknown) => string;
  tabOrderOverlayVisible: boolean;
  setTabOrderOverlayVisible: (update: boolean | ((visible: boolean) => boolean)) => void;
  focusableTabOrderCount: number;
  alignSelected: (mode: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  distributeSelected: (axis: "horizontal" | "vertical") => void;
  matchSelectedSize: (mode: "width" | "height" | "both") => void;
  groupSelectedIntoFrame: () => void;
  ungroupSelectedFrames: () => void;
  moveSelectedLayerStep: (delta: 1 | -1) => void;
  sendToBack: () => void;
  bringToFront: () => void;
  copySelectionToClipboard: () => void;
  cutSelectionToClipboard: () => void;
  duplicateSelected: () => void;
  toggleSelectedLock: () => void;
  createAndBindBackendIntegrationCommand: () => void;
  runSelectedEventFromActionBar: () => void;
  openImpactDock: () => void;
  deleteSelected: () => void;
  openComponentsDock: () => void;
  fitCanvasToViewport: () => void;
  canvasItemCount: number;
  onAlignPreview?: (mode: string | null) => void;
};

const compactBadgeClass = "h-5 px-1.5 py-0 text-[0.62rem] leading-none";
// A keyboard hint is something to read, not something to act on. Six permanent
// pills on a floating action bar spent the selection state's entire visual
// budget restating what the F1 shortcut dialog already lists.
const shortcutChipClass =
  "hidden px-1.5 py-0 font-mono text-[0.56rem] leading-none text-on-surface-variant xl:inline";

function CompactIconGroup({ label, dataKey, children }: { label: string; dataKey: string; children: ReactNode }) {
  return (
    <div
      className="flex h-7 shrink-0 items-center gap-0.5 rounded-full border border-outline-variant bg-surface-container-high px-0.5"
      {...{ [dataKey]: "" }}
      data-builder-actionbar-icon-group={label}
    >
      {children}
    </div>
  );
}

function CompactIconButton({
  label,
  onClick,
  children,
  disabled,
  dataAttr,
  onMouseEnter,
  onMouseLeave,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  dataAttr?: Record<string, string>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <Button
      size="icon-sm"
      variant="ghost"
      className="size-6 rounded-full px-0"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...dataAttr}
    >
      {children}
    </Button>
  );
}

export function SelectionActionBar({
  hasCanvasSelection,
  selectionAnchorId,
  selectionActionBarState,
  selectionActionBarActionCount,
  selectionActionBarReservedTrack,
  selectionActionBarLabel,
  selectedItems,
  selectedItem,
  getItemSummary,
  getItemIcon,
  selectedItemHierarchy,
  selectHierarchyBreadcrumbNode,
  activeFileName,
  selectedEventName,
  selectedEventCommandName,
  selectedPropertyIssueCount,
  selectionModeStrip,
  selectionCapabilityStrip,
  selectionBarStatusTone,
  selectionBarStatusLabel,
  selectionBarStatusTitle,
  selectionBarStatusDetail,
  selectionStatusTone,
  selectedSignalSlotLocation,
  selectedSignalSlotGoState,
  goToSlotForItem,
  hasSelectedSimulatorTrace,
  openSelectedConnections,
  selectionRecommendedStep,
  focusSelectedRosterItem,
  removeItemFromSelection,
  clearSelection,
  openSelectedProperties,
  selectedSameTypeCount,
  selectSameTypeControls,
  selectInverseSelection,
  focusSelectedObjectNameEditor,
  canFitSelectedCanvas,
  fitSelectedCanvasToViewport,
  selectedQuickTextProps,
  startInlineTextEdit,
  quickTextPropLabel,
  textPropertyValue,
  tabOrderOverlayVisible,
  setTabOrderOverlayVisible,
  focusableTabOrderCount,
  alignSelected,
  distributeSelected,
  matchSelectedSize,
  groupSelectedIntoFrame,
  ungroupSelectedFrames,
  moveSelectedLayerStep,
  sendToBack,
  bringToFront,
  copySelectionToClipboard,
  cutSelectionToClipboard,
  duplicateSelected,
  toggleSelectedLock,
  createAndBindBackendIntegrationCommand,
  runSelectedEventFromActionBar,
  openImpactDock,
  deleteSelected,
  openComponentsDock,
  fitCanvasToViewport,
  canvasItemCount,
  onAlignPreview,
}: SelectionActionBarProps) {
  const SelectionRecommendedIcon = selectionRecommendedStep?.icon ?? MousePointer2;
  const previewAlign = (label: string) => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.builderAlignPreview = label;
    }
  };
  const clearAlignPreview = () => {
    if (typeof document !== "undefined") {
      delete document.documentElement.dataset.builderAlignPreview;
    }
  };
  const someLocked = selectedItems.some((item) => item.locked);

  return (
    <section
      className={cn(
        "pointer-events-auto relative z-10 mx-0 mt-0 flex h-12 shrink-0 items-center gap-1.5 border-b border-x-0 border-t-0 px-2 py-0 backdrop-blur transition-colors supports-[backdrop-filter]:bg-surface-container-lowest/88",
        hasCanvasSelection
          ? "border-outline-variant bg-surface-container-lowest/95"
          : "border-outline-variant bg-surface-container-lowest/92",
      )}
      data-builder-selection-action-bar=""
      data-builder-selection-anchor={selectionAnchorId}
      data-builder-selection-state={selectionActionBarState}
      data-builder-selection-actionbar-action-count={selectionActionBarActionCount}
      data-builder-selection-actionbar-density="compact"
      data-builder-selection-chrome-style="ide-toolbar"
      data-builder-selection-placement="canvas-top-external"
      data-builder-selection-track="external-canvas-chrome"
      data-builder-selection-toolbar-state={selectionActionBarReservedTrack}
      data-builder-selection-visible="persistent"
      aria-label={selectionActionBarLabel}
    >
      {hasCanvasSelection ? (
        <>
          <div
            className="flex min-w-[10rem] max-w-[30%] items-center gap-1.5 overflow-hidden"
            data-builder-selection-actionbar-sticky-summary=""
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface-container-high text-primary">
              {selectedItems.length > 1 ? <Layers aria-hidden className="size-3.5" /> : <MousePointer2 aria-hidden className="size-3.5" />}
            </span>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex h-7 min-w-0 flex-nowrap items-center gap-1 overflow-hidden">
                <h3 className="truncate text-xs font-semibold leading-none text-on-surface">
                  {selectedItems.length > 1 ? `已选择 ${selectedItems.length} 个控件` : selectedItem ? getItemSummary(selectedItem) : "未选择"}
                </h3>
                {selectedItem ? (
                  <StateLabel
                    className={cn("hidden shrink-0 2xl:inline-flex", compactBadgeClass)}
                    label={String(selectedItem.type)}
                  />
                ) : null}
                {selectedItem && selectedEventName ? (
                  <StateLabel
                    showQuiet
                    variant={selectedEventCommandName ? "secondary" : "outline"}
                    className={cn("shrink-0", compactBadgeClass)}
                    label={selectedEventCommandName ? `${selectedEventName} 已绑定` : `${selectedEventName} 就绪`}
                  />
                ) : null}
                {selectedPropertyIssueCount > 0 ? (
                  <StateBadge
                    signal
                    variant="destructive"
                    className={cn("shrink-0", compactBadgeClass)}
                    label={`${selectedPropertyIssueCount} 个问题`}
                  />
                ) : null}
                {selectedItemHierarchy.length > 0 ? (
                  <div
                    className="hidden min-h-0 max-w-full items-center gap-1 overflow-hidden rounded-full border border-outline-variant bg-surface-container-high px-1.5 py-0 text-[0.62rem] leading-none text-on-surface-variant xl:flex"
                    data-builder-selection-breadcrumb=""
                    aria-label="当前选择层级路径"
                  >
                    <button
                      type="button"
                      className="focus-ring max-w-24 truncate rounded-full px-1.5 py-0.5 text-left leading-none hover:bg-surface-container-lowest hover:text-on-surface"
                      data-builder-selection-breadcrumb-root=""
                      title={activeFileName}
                      onClick={() => selectHierarchyBreadcrumbNode(null)}
                    >
                      {activeFileName}
                    </button>
                    {selectedItemHierarchy.map((crumb, index) => (
                      <span key={crumb.id} className="flex min-w-0 items-center gap-1">
                        <span className="text-outline" aria-hidden>
                          /
                        </span>
                        <button
                          type="button"
                          className={cn(
                            "focus-ring max-w-28 truncate rounded-full px-1.5 py-0.5 text-left leading-none hover:bg-surface-container-lowest hover:text-on-surface",
                            index === selectedItemHierarchy.length - 1 &&
                              "bg-primary-container text-primary-container-foreground hover:bg-primary-container",
                          )}
                          data-builder-selection-breadcrumb-node={crumb.id}
                          title={`${getItemSummary(crumb)} · ${crumb.type}`}
                          onClick={() => selectHierarchyBreadcrumbNode(crumb.id)}
                        >
                          {getItemSummary(crumb)}
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <p className="sr-only">
                {selectedItems.length > 1
                  ? "可批量复制、删除，并在右侧属性面板编辑共享布局。"
                  : selectedItem
                    ? `${activeFileName} · x ${Math.round(selectedItem.x)} y ${Math.round(selectedItem.y)} · ${Math.round(selectedItem.width)} x ${Math.round(selectedItem.height)}`
                    : `${activeFileName} · 单选控件`}
              </p>
              {selectionModeStrip}
              <div
                className={cn(
                  "hidden min-w-0 items-center gap-2 rounded-lg border px-2 py-1 text-[0.68rem]",
                  selectionBarStatusTone === "attention"
                    ? "border-destructive/30 bg-destructive/10"
                    : selectionBarStatusTone === "interactive"
                      ? "border-primary/30 bg-primary/10"
                      : "border-outline-variant bg-surface-container-high",
                )}
                data-builder-selection-status=""
              >
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <StateLabel
                      showQuiet
                      variant={
                        selectionBarStatusTone === "attention"
                          ? "destructive"
                          : selectionBarStatusTone === "interactive" || selectionBarStatusTone === "ready"
                            ? "secondary"
                            : "outline"
                      }
                      label={selectionBarStatusLabel}
                    />
                    <span className="min-w-0 truncate font-medium text-on-surface">{selectionBarStatusTitle}</span>
                    <span className="hidden min-w-0 truncate text-on-surface-variant lg:inline">{selectionBarStatusDetail}</span>
                    {selectedItem && selectedEventName ? (
                      <div
                        className="hidden min-w-0 items-center gap-1 rounded-full border border-outline-variant bg-surface-container px-1.5 py-0.5 text-[0.58rem] text-on-surface-variant xl:flex"
                        data-builder-selection-signal-slot-strip=""
                        data-builder-selection-signal-slot-state={selectedEventCommandName ? "bound" : "unbound"}
                      >
                        <span className="shrink-0 font-medium text-on-surface" data-builder-selection-signal-slot-event="">
                          {selectedEventName}
                        </span>
                        <CornerDownRight aria-hidden className="size-3 shrink-0 text-primary" />
                        <span className="min-w-0 truncate font-mono" data-builder-selection-signal-slot-command="">
                          {selectedEventCommandName ?? "未绑定 Rust command"}
                        </span>
                        <span className="shrink-0 text-outline" aria-hidden>
                          /
                        </span>
                        <span className="shrink-0 font-mono" data-builder-selection-signal-slot-location="">
                          {selectedSignalSlotLocation ?? (selectedEventCommandName ? "定位函数" : "创建槽")}
                        </span>
                        <button
                          type="button"
                          className="focus-ring shrink-0 rounded-full bg-secondary-container px-1.5 py-0.5 font-medium text-secondary-container-foreground transition hover:brightness-95"
                          data-builder-selection-signal-slot-go=""
                          data-builder-selection-signal-slot-go-state={selectedSignalSlotGoState}
                          aria-label={selectedEventCommandName ? "转到 Rust 槽函数" : "创建并转到 Rust 槽函数"}
                          onClick={() => goToSlotForItem(selectedItem)}
                        >
                          {selectedEventCommandName ? "转到" : "创建"}
                        </button>
                      </div>
                    ) : null}
                    {selectionCapabilityStrip}
                    <span
                      className="hidden shrink-0 rounded-full border border-outline-variant bg-surface-container px-2 py-0.5 font-mono text-[0.58rem] text-on-surface-variant xl:inline-flex"
                      data-builder-selection-keyboard-nudge=""
                    >
                      Arrow / Shift+Arrow
                    </span>
                  </div>
                </div>
                {hasSelectedSimulatorTrace ? (
                  <Button size="sm" variant="ghost" className="h-6 shrink-0 px-2 text-[0.68rem]" onClick={openSelectedConnections}>
                    追踪
                  </Button>
                ) : selectionRecommendedStep ? (
                  <Button
                    size="sm"
                    variant={selectionBarStatusTone === "attention" || selectionStatusTone === "setup" ? "secondary" : "ghost"}
                    className="h-6 shrink-0 px-2 text-[0.68rem]"
                    data-builder-selection-recommended-action={selectionRecommendedStep.id}
                    disabled={selectionRecommendedStep.disabled}
                    onClick={selectionRecommendedStep.onAction}
                  >
                    <SelectionRecommendedIcon aria-hidden className="size-3.5" />
                    {selectionRecommendedStep.actionLabel}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden" data-builder-selection-actionbar-viewport="">
            <div
              className="hidden shrink-0 items-center gap-1 rounded-md border border-outline-variant bg-surface-container-high px-1.5 py-0.5 text-[0.62rem] font-medium text-on-surface-variant 2xl:flex"
              data-builder-selection-actionbar-overflow=""
              aria-hidden
            >
              <ChevronRight className="size-3" />
              {selectionActionBarActionCount} 项
            </div>
            <div
              className="subtle-scrollbar flex h-12 min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-md border border-transparent bg-transparent px-0 py-0"
              data-builder-selection-actionbar-scroll=""
              tabIndex={0}
              role="region"
              aria-label="选择命令滚动区"
              onKeyDown={(event) => {
                const target = event.currentTarget;
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  target.scrollBy({ left: 48, behavior: "smooth" });
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  target.scrollBy({ left: -48, behavior: "smooth" });
                } else if (event.key === "Home") {
                  event.preventDefault();
                  target.scrollTo({ left: 0, behavior: "smooth" });
                } else if (event.key === "End") {
                  event.preventDefault();
                  target.scrollTo({ left: target.scrollWidth, behavior: "smooth" });
                } else if (event.key === "PageDown") {
                  event.preventDefault();
                  target.scrollBy({ left: target.clientWidth * 0.8, behavior: "smooth" });
                } else if (event.key === "PageUp") {
                  event.preventDefault();
                  target.scrollBy({ left: -target.clientWidth * 0.8, behavior: "smooth" });
                }
              }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant={selectedItems.length > 1 ? "secondary" : "ghost"} data-builder-selection-roster="">
                    <ListChecks aria-hidden className="size-4" />
                    已选 {selectedItems.length}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80" data-builder-selection-roster-menu="">
                  <DropdownMenuLabel>当前选择</DropdownMenuLabel>
                  <div className="max-h-72 space-y-1 overflow-y-auto p-1">
                    {selectedItems.map((item) => {
                      const Icon = getItemIcon(item.type);
                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1 rounded-xl border border-outline-variant bg-surface-container-low p-1"
                          data-builder-selection-roster-item={item.type}
                        >
                          <button
                            type="button"
                            className="focus-ring flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-surface-container-high"
                            data-builder-selection-roster-focus={item.id}
                            onClick={() => focusSelectedRosterItem(item.id)}
                          >
                            <Icon aria-hidden className="size-3.5 shrink-0 text-primary" />
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-medium text-on-surface">{getItemSummary(item)}</span>
                              <span className="block truncate font-mono text-[0.62rem] text-on-surface-variant">
                                {item.type} · x {Math.round(item.x)} y {Math.round(item.y)}
                              </span>
                            </span>
                          </button>
                          <button
                            type="button"
                            className="focus-ring flex size-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                            data-builder-selection-roster-remove={item.id}
                            aria-label={`从选择中移除 ${getItemSummary(item)}`}
                            disabled={selectedItems.length <= 1}
                            onClick={() => removeItemFromSelection(item.id)}
                          >
                            <X aria-hidden className="size-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-builder-selection-roster-clear="" onSelect={() => clearSelection({ feedback: true })}>
                    <MousePointer2 aria-hidden className="mr-2 size-4" />
                    清空选择
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="secondary" data-builder-actionbar-properties="" onClick={openSelectedProperties}>
                <Settings2 aria-hidden className="size-4" />
                属性
              </Button>
              <Button
                size="sm"
                variant="ghost"
                data-builder-actionbar-select-same-type=""
                disabled={selectedSameTypeCount <= 1}
                onClick={() => selectSameTypeControls()}
              >
                <ListChecks aria-hidden className="size-4" />
                同类
                <span className={shortcutChipClass}>Ctrl+Shift+A</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                data-builder-actionbar-invert-selection=""
                disabled={canvasItemCount === 0}
                onClick={selectInverseSelection}
              >
                <MousePointer2 aria-hidden className="size-4" />
                反选
                <span className={shortcutChipClass}>Ctrl+I</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                data-builder-actionbar-rename-object=""
                disabled={!selectedItem}
                onClick={focusSelectedObjectNameEditor}
              >
                <TextCursorInput aria-hidden className="size-4" />
                命名
                <span className={shortcutChipClass}>Ctrl+F2</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                data-builder-actionbar-fit-selection=""
                disabled={!canFitSelectedCanvas}
                onClick={fitSelectedCanvasToViewport}
              >
                <Maximize2 aria-hidden className="size-4" />
                适配
                <span className={shortcutChipClass}>Ctrl+2</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-builder-actionbar-edit-text=""
                    data-builder-actionbar-edit-text-field-count={selectedQuickTextProps.length || undefined}
                    disabled={!selectedItem || selectedQuickTextProps.length === 0}
                  >
                    <Type aria-hidden className="size-4" />
                    <span>文本</span>
                    <span className={cn(shortcutChipClass, "leading-none")} data-builder-actionbar-edit-text-shortcut="">
                      F2 / Enter
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80" data-builder-actionbar-edit-text-menu="">
                  <DropdownMenuLabel className="flex items-center justify-between gap-2">
                    <span>可编辑文本字段</span>
                    <span className="text-[0.66rem] font-normal text-on-surface-variant">{selectedQuickTextProps.length} 项</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {selectedItem
                    ? selectedQuickTextProps.map((prop) => (
                        <DropdownMenuItem
                          key={prop}
                          data-builder-actionbar-edit-text-field={prop}
                          onSelect={() => startInlineTextEdit(selectedItem, prop, "actionbar")}
                        >
                          <Type aria-hidden className="size-4 text-primary" />
                          <span className="min-w-0 flex-1 truncate">{quickTextPropLabel(prop)}</span>
                          <span
                            className="max-w-[8.5rem] truncate text-[0.68rem] text-on-surface-variant"
                            data-builder-actionbar-edit-text-field-value={prop}
                          >
                            {textPropertyValue(selectedItem.props[prop as keyof typeof selectedItem.props]) || "空"}
                          </span>
                        </DropdownMenuItem>
                      ))
                    : null}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant={tabOrderOverlayVisible ? "secondary" : "ghost"}
                data-builder-actionbar-tab-order=""
                disabled={focusableTabOrderCount === 0}
                onClick={() => setTabOrderOverlayVisible((visible) => !visible)}
              >
                <Keyboard aria-hidden className="size-4" />
                Tab 顺序
                <span className={shortcutChipClass}>Ctrl+Alt+T</span>
              </Button>
              {selectedItems.length > 1 ? (
                <CompactIconGroup label="align" dataKey="data-builder-actionbar-align">
                  <CompactIconButton label="左对齐" onClick={() => alignSelected("left")} onMouseEnter={() => previewAlign("左对齐")} onMouseLeave={clearAlignPreview}>
                    <AlignHorizontalJustifyStart aria-hidden />
                  </CompactIconButton>
                  <CompactIconButton label="水平居中对齐" onClick={() => alignSelected("center")} onMouseEnter={() => previewAlign("水平居中")} onMouseLeave={clearAlignPreview}>
                    <AlignHorizontalJustifyCenter aria-hidden />
                  </CompactIconButton>
                  <CompactIconButton label="右对齐" onClick={() => alignSelected("right")} onMouseEnter={() => previewAlign("右对齐")} onMouseLeave={clearAlignPreview}>
                    <AlignHorizontalJustifyEnd aria-hidden />
                  </CompactIconButton>
                  <CompactIconButton label="顶部对齐" onClick={() => alignSelected("top")} onMouseEnter={() => previewAlign("顶部对齐")} onMouseLeave={clearAlignPreview}>
                    <AlignVerticalJustifyStart aria-hidden />
                  </CompactIconButton>
                  <CompactIconButton label="垂直居中对齐" onClick={() => alignSelected("middle")} onMouseEnter={() => previewAlign("垂直居中")} onMouseLeave={clearAlignPreview}>
                    <AlignVerticalJustifyCenter aria-hidden />
                  </CompactIconButton>
                  <CompactIconButton label="底部对齐" onClick={() => alignSelected("bottom")} onMouseEnter={() => previewAlign("底部对齐")} onMouseLeave={clearAlignPreview}>
                    <AlignVerticalJustifyEnd aria-hidden />
                  </CompactIconButton>
                </CompactIconGroup>
              ) : null}
              {selectedItems.length > 2 ? (
                <CompactIconGroup label="distribute" dataKey="data-builder-actionbar-distribute">
                  <CompactIconButton label="水平等距分布" onClick={() => distributeSelected("horizontal")}>
                    <Move aria-hidden />
                  </CompactIconButton>
                  <CompactIconButton label="垂直等距分布" onClick={() => distributeSelected("vertical")}>
                    <MoveDown aria-hidden />
                  </CompactIconButton>
                </CompactIconGroup>
              ) : null}
              {selectedItems.length > 1 ? (
                <CompactIconGroup label="match-size" dataKey="data-builder-actionbar-match-size">
                  <CompactIconButton label="匹配宽度" onClick={() => matchSelectedSize("width")}>
                    <span className="text-[0.62rem] font-semibold" aria-hidden>
                      W
                    </span>
                  </CompactIconButton>
                  <CompactIconButton label="匹配高度" onClick={() => matchSelectedSize("height")}>
                    <span className="text-[0.62rem] font-semibold" aria-hidden>
                      H
                    </span>
                  </CompactIconButton>
                  <CompactIconButton label="匹配宽高" onClick={() => matchSelectedSize("both")}>
                    <Maximize2 aria-hidden />
                  </CompactIconButton>
                </CompactIconGroup>
              ) : null}
              {selectedItems.length > 1 ? (
                <Button size="sm" variant="ghost" data-builder-actionbar-group="" onClick={() => groupSelectedIntoFrame()}>
                  <Box aria-hidden className="size-4" />
                  成组
                </Button>
              ) : null}
              {selectedItems.some((item) => item.type === "frame") ? (
                <Button size="sm" variant="ghost" data-builder-actionbar-ungroup="" onClick={ungroupSelectedFrames}>
                  <Layers aria-hidden className="size-4" />
                  取消成组
                </Button>
              ) : null}
              <CompactIconGroup label="layer-order" dataKey="data-builder-actionbar-layer-order">
                <CompactIconButton
                  label="下移一层 Ctrl+["
                  onClick={() => moveSelectedLayerStep(-1)}
                  dataAttr={{ "data-builder-actionbar-layer-backward": "" }}
                >
                  <MoveDown aria-hidden />
                </CompactIconButton>
                <CompactIconButton
                  label="上移一层 Ctrl+]"
                  onClick={() => moveSelectedLayerStep(1)}
                  dataAttr={{ "data-builder-actionbar-layer-forward": "" }}
                >
                  <MoveUp aria-hidden />
                </CompactIconButton>
                <CompactIconButton
                  label="置于底层 Ctrl+Shift+["
                  onClick={sendToBack}
                  dataAttr={{ "data-builder-actionbar-back": "" }}
                >
                  <span className="font-mono text-[0.62rem]" aria-hidden>
                    [
                  </span>
                </CompactIconButton>
                <CompactIconButton
                  label="置于顶层 Ctrl+Shift+]"
                  onClick={bringToFront}
                  dataAttr={{ "data-builder-actionbar-front": "" }}
                >
                  <span className="font-mono text-[0.62rem]" aria-hidden>
                    ]
                  </span>
                </CompactIconButton>
              </CompactIconGroup>
              <Button size="sm" variant="ghost" data-builder-actionbar-copy="" onClick={copySelectionToClipboard}>
                <ClipboardCopy aria-hidden className="size-4" />
                复制
              </Button>
              <Button size="sm" variant="ghost" data-builder-actionbar-cut="" onClick={cutSelectionToClipboard}>
                <Scissors aria-hidden className="size-4" />
                剪切
              </Button>
              <Button size="sm" variant="ghost" data-builder-actionbar-duplicate="" onClick={duplicateSelected}>
                <Copy aria-hidden className="size-4" />
                副本
              </Button>
              <Button size="sm" variant="ghost" data-builder-actionbar-lock="" onClick={toggleSelectedLock}>
                {someLocked ? <LockOpen aria-hidden className="size-4" /> : <Lock aria-hidden className="size-4" />}
                {someLocked ? "解锁" : "锁定"}
              </Button>
              <Button
                size="sm"
                variant={selectedEventCommandName ? "secondary" : selectedEventName ? "default" : "ghost"}
                data-builder-actionbar-connections=""
                disabled={!selectedItem}
                onClick={
                  selectedEventCommandName
                    ? openSelectedConnections
                    : selectedEventName
                      ? () => createAndBindBackendIntegrationCommand()
                      : openSelectedConnections
                }
              >
                <Braces aria-hidden className="size-4" />
                {selectedEventCommandName ? "连接" : selectedEventName ? "创建绑定" : "连接"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                data-builder-actionbar-go-slot=""
                data-builder-actionbar-go-slot-state={selectedSignalSlotGoState}
                disabled={!selectedItem || !selectedEventName}
                onClick={() => goToSlotForItem(selectedItem)}
              >
                <CornerDownRight aria-hidden className="size-4" />
                槽函数
              </Button>
              <Button
                size="sm"
                variant="ghost"
                data-builder-actionbar-run-event=""
                disabled={!selectedItem || !selectedEventName || !selectedEventCommandName}
                onClick={runSelectedEventFromActionBar}
              >
                <Play aria-hidden className="size-4" />
                运行事件
              </Button>
              <Button size="sm" variant="ghost" data-builder-actionbar-impact="" onClick={openImpactDock}>
                <AlertTriangle aria-hidden className="size-4" />
                影响
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                data-builder-actionbar-delete=""
                onClick={deleteSelected}
              >
                <Trash2 aria-hidden className="size-4" />
                删除
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className="flex min-w-[7rem] max-w-[22%] items-center gap-1.5 overflow-hidden"
            data-builder-selection-action-bar-idle=""
            data-builder-selection-actionbar-sticky-summary=""
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface-container-high text-primary">
              <MousePointer2 aria-hidden className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex h-7 min-w-0 flex-nowrap items-center gap-1 overflow-hidden">
                <h3 className="truncate text-xs font-semibold leading-none text-on-surface">选择</h3>
                <CountReadout
                  label={String(canvasItemCount)}
                  count={canvasItemCount}
                  className="font-mono text-[0.62rem] leading-none"
                />
                <span className="sr-only" data-builder-selection-keyboard-nudge-hint="">
                  Ctrl/Shift 多选快捷键
                </span>
              </div>
              <p className="sr-only">
                点击控件选择，按住 Ctrl 叠加选择，按住 Shift 选择范围，也可以在画布空白处拖拽框选；选中后可用方向键微调位置。
              </p>
              {selectionModeStrip}
              <div className="hidden min-w-0 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-high px-2 py-1 text-[0.68rem]">
                <StateLabel label="选择工具" />
                <span className="min-w-0 font-medium leading-5 text-on-surface">操作栏保持常驻，选中任何控件后都会在这里显示同一套动作。</span>
                {selectionCapabilityStrip}
              </div>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden" data-builder-selection-actionbar-viewport="">
            <div
              className="hidden shrink-0 items-center gap-1 rounded-md border border-outline-variant bg-surface-container-high px-1.5 py-0.5 text-[0.62rem] font-medium text-on-surface-variant 2xl:flex"
              data-builder-selection-actionbar-overflow=""
              aria-hidden
            >
              <ChevronRight className="size-3" />
              {selectionActionBarActionCount} 项
            </div>
            <div
              className="subtle-scrollbar flex h-12 min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-md border border-transparent bg-transparent px-0 py-0"
              data-builder-selection-actionbar-scroll=""
              tabIndex={0}
              aria-label="画布空闲命令滚动区"
            >
              <Button size="sm" variant="secondary" data-builder-actionbar-idle-components="" onClick={openComponentsDock}>
                <Layers aria-hidden className="size-4" />
                控件库
              </Button>
              <Button size="sm" variant="ghost" data-builder-actionbar-idle-fit="" onClick={fitCanvasToViewport}>
                <Maximize2 aria-hidden className="size-4" />
                适配画布
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
