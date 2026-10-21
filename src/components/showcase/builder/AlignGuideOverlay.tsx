import type { BuilderItem } from "./types";

export type AlignPreviewMode =
  | "左对齐"
  | "水平居中"
  | "右对齐"
  | "顶部对齐"
  | "垂直居中"
  | "底部对齐";

function itemBox(item: BuilderItem, zoom: number) {
  return {
    left: item.x * zoom,
    top: item.y * zoom,
    width: item.width * zoom,
    height: item.height * zoom,
    right: (item.x + item.width) * zoom,
    bottom: (item.y + item.height) * zoom,
    cx: (item.x + item.width / 2) * zoom,
    cy: (item.y + item.height / 2) * zoom,
  };
}

/**
 * Dashed alignment guides on the canvas while hovering align actions.
 */
export function AlignGuideOverlay({
  mode,
  items,
  zoom,
  canvasWidth,
  canvasHeight,
}: {
  mode: AlignPreviewMode | null;
  items: BuilderItem[];
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
}) {
  if (!mode || items.length < 2) return null;

  const boxes = items.map((item) => itemBox(item, zoom));
  const minX = Math.min(...boxes.map((b) => b.left));
  const maxX = Math.max(...boxes.map((b) => b.right));
  const minY = Math.min(...boxes.map((b) => b.top));
  const maxY = Math.max(...boxes.map((b) => b.bottom));
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  const lines: Array<{ x1: number; y1: number; x2: number; y2: number; key: string }> = [];
  if (mode === "左对齐") {
    const x = minX;
    lines.push({ key: "l", x1: x, y1: 0, x2: x, y2: canvasHeight });
  } else if (mode === "右对齐") {
    const x = maxX;
    lines.push({ key: "r", x1: x, y1: 0, x2: x, y2: canvasHeight });
  } else if (mode === "水平居中") {
    lines.push({ key: "cx", x1: midX, y1: 0, x2: midX, y2: canvasHeight });
  } else if (mode === "顶部对齐") {
    const y = minY;
    lines.push({ key: "t", x1: 0, y1: y, x2: canvasWidth, y2: y });
  } else if (mode === "底部对齐") {
    const y = maxY;
    lines.push({ key: "b", x1: 0, y1: y, x2: canvasWidth, y2: y });
  } else if (mode === "垂直居中") {
    lines.push({ key: "cy", x1: 0, y1: midY, x2: canvasWidth, y2: midY });
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-20"
      width={canvasWidth}
      height={canvasHeight}
      data-builder-align-guides={mode}
      aria-hidden
    >
      {lines.map((line) => (
        <line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          opacity={0.85}
        />
      ))}
    </svg>
  );
}
