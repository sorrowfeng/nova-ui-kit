import type { ReactNode, Ref } from "react";
import type { BuilderItem, BuilderComponentType } from "./types";

export type CanvasContextMenuProps = {
  open: boolean;
  x: number;
  y: number;
  placementX: "left" | "right";
  placementY: "top" | "bottom";
  item: BuilderItem | null;
  itemSummary: string;
  eventName: string | null;
  activeFileName: string;
  itemCount: number;
  pageWidth: number;
  pageHeight: number;
  selectedCount: number;
  quickInsertTypes: readonly string[];
  quickInsertGroups: ReadonlyArray<{ id: string; label: string; types: readonly string[] }>;
  insertQuery: string;
  insertInputRef?: Ref<HTMLInputElement>;
  insertSearchResults: Array<{ type: string; title: string; icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }> }>;
  insertActiveIndex: number;
  onInsertQueryChange: (value: string) => void;
  onInsertActiveIndexChange: (index: number) => void;
  onInsertSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onInsertComponent: (type: BuilderComponentType) => void;
  onClose: () => void;
  onAction: (action: string) => void;
  getItemIcon: (type: BuilderComponentType) => ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  menuBody: ReactNode;
};

type ComponentType<P = unknown> = (props: P) => ReactNode;

/**
 * Canvas right-click menu shell. Action list is passed as `menuBody`
 * so BuilderShowcase keeps domain-specific handlers.
 */
export function CanvasContextMenu(props: CanvasContextMenuProps) {
  const {
    open,
    x,
    y,
    placementX,
    placementY,
    item,
    itemSummary,
    eventName,
    activeFileName,
    itemCount,
    pageWidth,
    pageHeight,
    quickInsertTypes,
    quickInsertGroups,
    insertQuery,
    insertInputRef,
    insertSearchResults,
    insertActiveIndex,
    onInsertQueryChange,
    onInsertActiveIndexChange,
    onInsertSearchKeyDown,
    onInsertComponent,
    onClose,
    getItemIcon,
    menuBody,
  } = props;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9998]"
      data-builder-canvas-context-overlay=""
      onPointerDown={onClose}
      onContextMenu={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div
        role="menu"
        aria-label={item ? `${itemSummary} 操作菜单` : "画布操作菜单"}
        className="subtle-scrollbar absolute max-h-[calc(100vh-1.5rem)] w-60 overflow-y-auto rounded-2xl border border-outline-variant bg-surface-container-lowest/98 p-1.5 text-xs text-on-surface shadow-m3-3 backdrop-blur"
        data-builder-canvas-context-smart-position=""
        data-builder-canvas-context-placement-x={placementX}
        data-builder-canvas-context-placement-y={placementY}
        style={{
          left: x,
          top: y,
          transformOrigin: `${placementX === "left" ? "right" : "left"} ${placementY === "top" ? "bottom" : "top"}`,
        }}
        onPointerDown={(event) => event.stopPropagation()}
        onContextMenu={(event) => event.preventDefault()}
      >
        <div className="px-2 py-1.5">
          <p className="truncate font-medium">{item ? itemSummary : activeFileName}</p>
          <p className="mt-0.5 truncate text-[0.68rem] text-on-surface-variant">
            {item ? `${item.type}${eventName ? ` · ${eventName}` : ""}` : `${itemCount} 个控件 · ${pageWidth} x ${pageHeight}`}
          </p>
        </div>
        <div className="my-1 h-px bg-outline-variant" />
        <details className="group mx-1 mb-1" data-builder-canvas-context-insert-collapsed="">
          <summary className="focus-ring flex h-8 cursor-pointer list-none items-center gap-2 rounded-xl px-2 text-[0.72rem] font-medium hover:bg-surface-container-high [&::-webkit-details-marker]:hidden">
            <span className="flex-1 truncate">插入控件到此处</span>
            <span className="font-mono text-[0.6rem] text-on-surface-variant">{quickInsertTypes.length}</span>
          </summary>
          <div className="px-1 pb-1" data-builder-canvas-context-insert-search="">
            <input
              ref={insertInputRef}
              value={insertQuery}
              data-builder-canvas-context-insert-search-input=""
              aria-label="搜索要插入的控件"
              placeholder="搜索控件…"
              className="focus-ring h-7 w-full rounded-lg border border-outline-variant bg-surface-container px-2 text-[0.7rem] text-on-surface"
              onChange={(event) => onInsertQueryChange(event.target.value)}
              onKeyDown={onInsertSearchKeyDown}
            />
            {insertQuery.trim() ? (
              <div className="mt-1 max-h-28 overflow-y-auto" data-builder-canvas-context-insert-search-results="" role="listbox">
                {insertSearchResults.map((definition, index) => {
                  const Icon = getItemIcon(definition.type as BuilderComponentType);
                  return (
                    <button
                      key={definition.type}
                      type="button"
                      role="option"
                      aria-selected={index === insertActiveIndex}
                      className="focus-ring flex h-7 w-full items-center gap-1.5 rounded-lg px-2 text-left hover:bg-surface-container-high"
                      data-builder-canvas-context-insert-component={definition.type}
                      onMouseEnter={() => onInsertActiveIndexChange(index)}
                      onClick={() => onInsertComponent(definition.type as BuilderComponentType)}
                    >
                      <Icon aria-hidden className="size-3 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate text-[0.68rem]">{definition.title}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-1 px-1 pb-1">
            {quickInsertGroups.flatMap((group) => group.types).slice(0, 8).map((type) => {
              const Icon = getItemIcon(type as BuilderComponentType);
              return (
                <button
                  key={type}
                  type="button"
                  role="menuitem"
                  className="focus-ring flex h-7 min-w-0 items-center gap-1 rounded-lg px-1.5 hover:bg-surface-container-high"
                  data-builder-canvas-context-insert-component={type}
                  onClick={() => onInsertComponent(type as BuilderComponentType)}
                >
                  <Icon aria-hidden className="size-3 shrink-0 text-primary" />
                  <span className="max-w-[4.5rem] truncate text-[0.62rem]">{type}</span>
                </button>
              );
            })}
          </div>
        </details>
        <div className="my-1 h-px bg-outline-variant" />
        {menuBody}
      </div>
    </div>
  );
}
