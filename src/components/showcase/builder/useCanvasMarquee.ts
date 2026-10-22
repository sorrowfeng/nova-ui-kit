import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export type SelectionMarquee = {
  pointerId: number;
  originX: number;
  originY: number;
  currentX: number;
  currentY: number;
  mode: "replace" | "add" | "subtract";
  moved: boolean;
  baseSelectedIds: string[];
};

type CanvasPoint = { x: number; y: number };

export function getSelectionMarqueeRect(marquee: SelectionMarquee) {
  const left = Math.min(marquee.originX, marquee.currentX);
  const top = Math.min(marquee.originY, marquee.currentY);
  const right = Math.max(marquee.originX, marquee.currentX);
  const bottom = Math.max(marquee.originY, marquee.currentY);
  return { left, top, width: right - left, height: bottom - top, right, bottom };
}

const marqueeRect = getSelectionMarqueeRect;

export function getItemIdsInsideMarquee(
  frame: SelectionMarquee,
  itemBounds: (itemId: string) => { x: number; y: number; width: number; height: number } | null,
  allItemIds: string[],
): string[] {
  const rect = marqueeRect(frame);
  const next = new Set(frame.mode === "replace" ? [] : frame.baseSelectedIds);
  for (const id of allItemIds) {
    const bounds = itemBounds(id);
    if (!bounds) continue;
    const itemRight = bounds.x + bounds.width;
    const itemBottom = bounds.y + bounds.height;
    const intersects =
      rect.left <= itemRight && rect.right >= bounds.x && rect.top <= itemBottom && rect.bottom >= bounds.y;
    if (intersects) {
      if (frame.mode === "subtract") next.delete(id);
      else next.add(id);
    }
  }
  return Array.from(next);
}

/**
 * Canvas marquee selection (workflow B2.4).
 */
export function useCanvasMarquee(options: {
  enabled: boolean;
  blocked: boolean;
  selectedIds: string[];
  allItemIds: string[];
  getCanvasPoint: (clientX: number, clientY: number) => CanvasPoint;
  itemBounds: (itemId: string) => { x: number; y: number; width: number; height: number } | null;
  onSelectionChange: (ids: string[]) => void;
  onAnchorChange: (id: string) => void;
  onMarqueeComplete?: () => void;
  onReplaceStart?: () => void;
}) {
  const {
    enabled,
    blocked,
    selectedIds,
    allItemIds,
    getCanvasPoint,
    itemBounds,
    onSelectionChange,
    onAnchorChange,
    onMarqueeComplete,
    onReplaceStart,
  } = options;

  const [marquee, setMarquee] = useState<SelectionMarquee | null>(null);
  const marqueeRef = useRef<SelectionMarquee | null>(null);
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;

  const itemsInside = useCallback(
    (frame: SelectionMarquee) => getItemIdsInsideMarquee(frame, itemBounds, allItemIds),
    [allItemIds, itemBounds],
  );

  const startSelectionMarquee = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || blocked || event.button !== 0) return;
      const target = event.target as HTMLElement;
      if (
        target.closest(
          "[data-builder-node-id], [data-builder-resize-handle], button, input, textarea, select, [contenteditable='true']",
        )
      ) {
        return;
      }

      const point = getCanvasPoint(event.clientX, event.clientY);
      const mode: SelectionMarquee["mode"] = event.altKey
        ? "subtract"
        : event.ctrlKey || event.metaKey || event.shiftKey
          ? "add"
          : "replace";
      const frame: SelectionMarquee = {
        pointerId: event.pointerId,
        originX: point.x,
        originY: point.y,
        currentX: point.x,
        currentY: point.y,
        mode,
        moved: false,
        baseSelectedIds: selectedIdsRef.current,
      };
      event.preventDefault();
      event.stopPropagation();
      marqueeRef.current = frame;
      setMarquee(frame);
      if (mode === "replace") {
        onReplaceStart?.();
      }
    },
    [blocked, enabled, getCanvasPoint, onReplaceStart],
  );

  useEffect(() => {
    if (!marquee) return;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== marquee.pointerId) return;
      const point = getCanvasPoint(event.clientX, event.clientY);
      const moved = Math.hypot(point.x - marquee.originX, point.y - marquee.originY) > 3;
      const next = { ...marquee, currentX: point.x, currentY: point.y, moved };
      event.preventDefault();
      marqueeRef.current = next;
      setMarquee(next);
      if (moved) {
        const ids = itemsInside(next);
        onSelectionChange(ids);
        onAnchorChange(ids[0] ?? "");
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== marquee.pointerId) return;
      const final = marqueeRef.current ?? marquee;
      if (final.moved) {
        const ids = itemsInside(final);
        onSelectionChange(ids);
        onAnchorChange(ids[0] ?? "");
        onMarqueeComplete?.();
      }
      marqueeRef.current = null;
      setMarquee(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [marquee, getCanvasPoint, itemsInside, onSelectionChange, onAnchorChange, onMarqueeComplete]);

  return {
    selectionMarquee: marquee,
    startSelectionMarquee,
    marqueeRect: getSelectionMarqueeRect,
    clearMarquee: () => {
      marqueeRef.current = null;
      setMarquee(null);
    },
  };
}
