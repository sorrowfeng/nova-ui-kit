import { useCallback, type PointerEvent as ReactPointerEvent } from "react";
import type { BuilderItem, DragSession, ResizeHandle } from "./types";

/**
 * Canvas item drag-move / resize handles (workflow B2.4).
 * Keeps pointer session setup out of BuilderShowcase.
 */
export function useCanvasItemDrag(options: {
  mode: string;
  canvasPanMode: boolean;
  spacePanActive: boolean;
  items: BuilderItem[];
  selectedIds: string[];
  selectItem: (id: string, event: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }) => void;
  setSelectedId: (id: string) => void;
  pushHistorySnapshot: () => void;
  setDragSession: (session: DragSession | null) => void;
  getNodeCanvasPosition: (item: BuilderItem) => { x: number; y: number };
}) {
  const {
    mode,
    canvasPanMode,
    spacePanActive,
    items,
    selectedIds,
    selectItem,
    setSelectedId,
    pushHistorySnapshot,
    setDragSession,
    getNodeCanvasPosition,
  } = options;

  const startMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, item: BuilderItem) => {
      if (mode !== "design" || item.locked || event.button !== 0 || canvasPanMode || spacePanActive || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement;
      if (target.closest("[data-builder-resize-handle]")) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        selectItem(item.id, event);
        return;
      }

      const moveIds = (selectedIds.includes(item.id) ? selectedIds : [item.id]).filter((id) => {
        const node = items.find((candidate) => candidate.id === id);
        return node && !node.locked;
      });
      if (moveIds.length === 0) {
        return;
      }

      if (!selectedIds.includes(item.id)) {
        setSelectedId(item.id);
      }
      pushHistorySnapshot();
      setDragSession({
        kind: "move",
        ids: moveIds,
        startClientX: event.clientX,
        startClientY: event.clientY,
        origins: Object.fromEntries(
          moveIds.map((id) => {
            const node = items.find((candidate) => candidate.id === id) ?? item;
            return [id, { x: node.x, y: node.y }];
          }),
        ),
        absoluteOrigins: Object.fromEntries(
          moveIds.map((id) => {
            const node = items.find((candidate) => candidate.id === id) ?? item;
            return [id, getNodeCanvasPosition(node)];
          }),
        ),
      });
    },
    [
      canvasPanMode,
      getNodeCanvasPosition,
      items,
      mode,
      pushHistorySnapshot,
      selectItem,
      selectedIds,
      setDragSession,
      setSelectedId,
      spacePanActive,
    ],
  );

  const startResize = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, item: BuilderItem, handle: ResizeHandle) => {
      if (mode !== "design" || item.locked || event.button !== 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      setSelectedId(item.id);
      pushHistorySnapshot();
      setDragSession({
        kind: "resize",
        id: item.id,
        handle,
        startClientX: event.clientX,
        startClientY: event.clientY,
        originWidth: item.width,
        originHeight: item.height,
        originX: item.x,
        originY: item.y,
      });
    },
    [mode, pushHistorySnapshot, setDragSession, setSelectedId],
  );

  return { startMove, startResize };
}
