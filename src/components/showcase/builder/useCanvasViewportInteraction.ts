import { useCallback, useRef, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type UIEvent as ReactUIEvent, type WheelEvent as ReactWheelEvent } from "react";

type PanSession = {
  pointerId?: number;
  startClientX: number;
  startClientY: number;
  startScrollLeft: number;
  startScrollTop: number;
};

type CanvasViewportInteraction = {
  startCanvasPan: (event: ReactPointerEvent<HTMLDivElement>) => void;
  moveCanvasPan: (event: ReactPointerEvent<HTMLDivElement>) => void;
  stopCanvasPan: (event: ReactPointerEvent<HTMLDivElement>) => void;
  startCanvasMousePan: (event: ReactMouseEvent<HTMLDivElement>) => void;
  handleCanvasViewportScroll: (event: ReactUIEvent<HTMLDivElement>) => void;
  handleCanvasViewportWheel: (event: ReactWheelEvent<HTMLDivElement>) => void;
};

/**
 * Canvas viewport pan / zoom pointer interaction (workflow B2.4).
 * Keeps pointer capture and wheel zoom out of BuilderShowcase.
 */
export function useCanvasViewportInteraction(options: {
  viewportRef: { current: HTMLDivElement | null };
  canvasPanActive: boolean;
  zoomCanvasBy: (delta: number) => void;
  onViewportMoved?: (viewport: HTMLDivElement) => void;
}): CanvasViewportInteraction {
  const panSessionRef = useRef<PanSession | null>(null);
  const { viewportRef, canvasPanActive, zoomCanvasBy, onViewportMoved } = options;

  const remember = useCallback(
    (viewport: HTMLDivElement) => {
      onViewportMoved?.(viewport);
    },
    [onViewportMoved],
  );

  const startCanvasPan = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const shouldPan = canvasPanActive || event.button === 1 || event.altKey;
      const viewport = viewportRef.current;
      if (!shouldPan || !viewport) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      viewport.setPointerCapture(event.pointerId);
      panSessionRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startScrollLeft: viewport.scrollLeft,
        startScrollTop: viewport.scrollTop,
      };
    },
    [canvasPanActive, viewportRef],
  );

  const moveCanvasPan = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const session = panSessionRef.current;
      const viewport = viewportRef.current;
      if (!session || !viewport || session.pointerId !== event.pointerId) {
        return;
      }
      event.preventDefault();
      viewport.scrollLeft = session.startScrollLeft - (event.clientX - session.startClientX);
      viewport.scrollTop = session.startScrollTop - (event.clientY - session.startClientY);
      remember(viewport);
    },
    [remember, viewportRef],
  );

  const stopCanvasPan = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const session = panSessionRef.current;
      const viewport = viewportRef.current;
      if (viewport?.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }
      if (session?.pointerId === event.pointerId) {
        panSessionRef.current = null;
      }
    },
    [viewportRef],
  );

  const startCanvasMousePan = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const shouldPan = canvasPanActive || event.button === 1 || event.altKey;
      const viewport = viewportRef.current;
      if (!shouldPan || !viewport) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const session: PanSession = {
        startClientX: event.clientX,
        startClientY: event.clientY,
        startScrollLeft: viewport.scrollLeft,
        startScrollTop: viewport.scrollTop,
      };
      const onMouseMove = (moveEvent: MouseEvent) => {
        viewport.scrollLeft = session.startScrollLeft - (moveEvent.clientX - session.startClientX);
        viewport.scrollTop = session.startScrollTop - (moveEvent.clientY - session.startClientY);
        remember(viewport);
        moveEvent.preventDefault();
      };
      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [canvasPanActive, remember, viewportRef],
  );

  const handleCanvasViewportScroll = useCallback(
    (event: ReactUIEvent<HTMLDivElement>) => {
      remember(event.currentTarget);
    },
    [remember],
  );

  const handleCanvasViewportWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }
      event.preventDefault();
      zoomCanvasBy(event.deltaY < 0 ? 0.1 : -0.1);
    },
    [zoomCanvasBy],
  );

  return {
    startCanvasPan,
    moveCanvasPan,
    stopCanvasPan,
    startCanvasMousePan,
    handleCanvasViewportScroll,
    handleCanvasViewportWheel,
  };
}
