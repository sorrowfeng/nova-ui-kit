import type { CSSProperties } from "react";
import type { BuilderItem, FrameLayoutMode, PageConfig } from "./types";

export const MIN_ITEM_WIDTH = 72;
export const MIN_ITEM_HEIGHT = 32;

export function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

export function snap(value: number, gridSize: number, enabled: boolean) {
  return enabled ? Math.round(value / gridSize) * gridSize : Math.round(value);
}

export function numberFromInput(value: string, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  return clamp(Number.isFinite(parsed) ? parsed : fallback, min, max);
}

export function normalizeItemBounds(item: BuilderItem, page: PageConfig): BuilderItem {
  const width = clamp(item.width, MIN_ITEM_WIDTH, page.width);
  const height = clamp(item.height, MIN_ITEM_HEIGHT, page.height);
  return {
    ...item,
    width,
    height,
    x: clamp(item.x, 0, Math.max(0, page.width - width)),
    y: clamp(item.y, 0, Math.max(0, page.height - height)),
  };
}

export function getAbsolutePosition(item: BuilderItem, items: BuilderItem[]) {
  let x = item.x;
  let y = item.y;
  let parentId = item.parentId;
  const visited = new Set<string>();

  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = items.find((candidate) => candidate.id === parentId);
    if (!parent) {
      break;
    }
    x += parent.x;
    y += parent.y;
    parentId = parent.parentId;
  }

  return { x, y };
}

export function getItemDepth(item: BuilderItem, items: BuilderItem[]) {
  let depth = 0;
  let parentId = item.parentId;
  const visited = new Set<string>();

  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = items.find((candidate) => candidate.id === parentId);
    if (!parent) {
      break;
    }
    depth += 1;
    parentId = parent.parentId;
  }

  return depth;
}

export function isDescendantOf(itemId: string, parentId: string, items: BuilderItem[]) {
  let current = items.find((item) => item.id === itemId);
  const visited = new Set<string>();

  while (current?.parentId && !visited.has(current.parentId)) {
    if (current.parentId === parentId) {
      return true;
    }
    visited.add(current.parentId);
    current = items.find((item) => item.id === current?.parentId);
  }

  return false;
}

export function collectDescendantIds(parentIds: string[], items: BuilderItem[]) {
  const ids = new Set(parentIds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of items) {
      if (item.parentId && ids.has(item.parentId) && !ids.has(item.id)) {
        ids.add(item.id);
        changed = true;
      }
    }
  }
  return ids;
}

export function getParentBounds(item: BuilderItem, items: BuilderItem[], page: PageConfig) {
  const parent = item.parentId ? items.find((candidate) => candidate.id === item.parentId && candidate.type === "frame") : null;
  return {
    width: parent?.width ?? page.width,
    height: parent?.height ?? page.height,
  };
}

function numberProp(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return clamp(Number.isFinite(parsed) ? parsed : fallback, min, max);
}

export function itemConstraints(item: BuilderItem) {
  return {
    left: item.props.constraintLeft !== false,
    right: item.props.constraintRight === true,
    top: item.props.constraintTop !== false,
    bottom: item.props.constraintBottom === true,
  };
}

export function frameLayoutMode(item: BuilderItem): FrameLayoutMode {
  if (item.type !== "frame") {
    return "free";
  }
  const mode = item.props.layoutMode;
  return mode === "row" || mode === "column" || mode === "grid" ? mode : "free";
}

export function frameLayoutMetrics(item: BuilderItem) {
  return {
    gap: numberProp(item.props.layoutGap, 12, 0, 80),
    padding: numberProp(item.props.layoutPadding, 16, 0, 80),
    columns: numberProp(item.props.layoutColumns, 2, 1, 6),
  };
}

function isAutoLayoutFrame(item: BuilderItem) {
  return item.type === "frame" && frameLayoutMode(item) !== "free";
}

export function parentUsesAutoLayout(item: BuilderItem, items: BuilderItem[]) {
  const parent = item.parentId ? items.find((candidate) => candidate.id === item.parentId) : null;
  return Boolean(parent && isAutoLayoutFrame(parent));
}

export function frameChildrenStyle(item: BuilderItem): CSSProperties {
  const mode = frameLayoutMode(item);
  if (mode === "free") {
    return {
      position: "absolute",
      inset: 0,
      overflow: "hidden",
    };
  }

  const { gap, padding, columns } = frameLayoutMetrics(item);
  const base: CSSProperties = {
    position: "absolute",
    inset: 0,
    overflow: "auto",
    padding,
    gap,
  };

  if (mode === "row") {
    return {
      ...base,
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
    };
  }

  if (mode === "column") {
    return {
      ...base,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
    };
  }

  return {
    ...base,
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    alignContent: "flex-start",
  };
}

export function normalizeItemBoundsInTree(item: BuilderItem, items: BuilderItem[], page: PageConfig): BuilderItem {
  const bounds = getParentBounds(item, items, page);
  const width = clamp(item.width, MIN_ITEM_WIDTH, bounds.width);
  const height = clamp(item.height, MIN_ITEM_HEIGHT, bounds.height);
  return {
    ...item,
    width,
    height,
    x: clamp(item.x, 0, Math.max(0, bounds.width - width)),
    y: clamp(item.y, 0, Math.max(0, bounds.height - height)),
  };
}

function applyConstraintsToItem(item: BuilderItem, oldBounds: { width: number; height: number }, nextBounds: { width: number; height: number }, page: PageConfig) {
  const constraints = itemConstraints(item);
  const rightMargin = oldBounds.width - item.x - item.width;
  const bottomMargin = oldBounds.height - item.y - item.height;
  let x = item.x;
  let y = item.y;
  let width = item.width;
  let height = item.height;

  if (constraints.left && constraints.right) {
    width = nextBounds.width - item.x - rightMargin;
  } else if (!constraints.left && constraints.right) {
    x = nextBounds.width - rightMargin - item.width;
  } else if (!constraints.left && !constraints.right) {
    x = item.x + (nextBounds.width - oldBounds.width) / 2;
  }

  if (constraints.top && constraints.bottom) {
    height = nextBounds.height - item.y - bottomMargin;
  } else if (!constraints.top && constraints.bottom) {
    y = nextBounds.height - bottomMargin - item.height;
  } else if (!constraints.top && !constraints.bottom) {
    y = item.y + (nextBounds.height - oldBounds.height) / 2;
  }

  return normalizeItemBoundsInTree(
    {
      ...item,
      x: snap(x, page.gridSize, page.snapToGrid),
      y: snap(y, page.gridSize, page.snapToGrid),
      width: snap(width, page.gridSize, page.snapToGrid),
      height: snap(height, page.gridSize, page.snapToGrid),
    },
    [item],
    { ...page, width: nextBounds.width, height: nextBounds.height },
  );
}

export function applyConstraintsForParentResize(
  items: BuilderItem[],
  parentId: string | undefined,
  oldBounds: { width: number; height: number },
  nextBounds: { width: number; height: number },
  page: PageConfig,
): BuilderItem[] {
  if (oldBounds.width === nextBounds.width && oldBounds.height === nextBounds.height) {
    return items;
  }

  const directChildren = items.filter((item) => (item.parentId || undefined) === parentId);
  if (directChildren.length === 0) {
    return items;
  }

  const changedFrames: Array<{ previous: BuilderItem; next: BuilderItem }> = [];
  let nextItems = items.map((item) => {
    if ((item.parentId || undefined) !== parentId) {
      return item;
    }

    const nextItem = applyConstraintsToItem(item, oldBounds, nextBounds, page);
    if (item.type === "frame" && frameLayoutMode(item) === "free" && (item.width !== nextItem.width || item.height !== nextItem.height)) {
      changedFrames.push({ previous: item, next: nextItem });
    }
    return nextItem;
  });

  for (const frame of changedFrames) {
    nextItems = applyConstraintsForParentResize(
      nextItems,
      frame.previous.id,
      { width: frame.previous.width, height: frame.previous.height },
      { width: frame.next.width, height: frame.next.height },
      page,
    );
  }

  return nextItems;
}

export function replaceItemAndApplyResizeConstraints(items: BuilderItem[], previousItem: BuilderItem, nextItem: BuilderItem, page: PageConfig) {
  const nextItems = items.map((candidate) => (candidate.id === previousItem.id ? nextItem : candidate));
  if (previousItem.type !== "frame" || frameLayoutMode(previousItem) !== "free") {
    return nextItems;
  }

  return applyConstraintsForParentResize(
    nextItems,
    previousItem.id,
    { width: previousItem.width, height: previousItem.height },
    { width: nextItem.width, height: nextItem.height },
    page,
  );
}

export function getOrderedFrameChildren(frameId: string, items: BuilderItem[], excludedIds: Set<string> = new Set()) {
  return items
    .filter((item) => item.parentId === frameId && !excludedIds.has(item.id))
    .sort((a, b) => a.z - b.z);
}

export function reorderFrameChildren(items: BuilderItem[], frameId: string, movingIds: string[], insertionIndex: number) {
  const movingSet = new Set(movingIds);
  const siblings = getOrderedFrameChildren(frameId, items);
  const movingSiblings = siblings.filter((item) => movingSet.has(item.id));
  const stableSiblings = siblings.filter((item) => !movingSet.has(item.id));
  const insertAt = clamp(Math.round(insertionIndex), 0, stableSiblings.length);
  const orderedSiblings = [...stableSiblings.slice(0, insertAt), ...movingSiblings, ...stableSiblings.slice(insertAt)];
  const orderedSiblingIds = new Set(orderedSiblings.map((item) => item.id));

  if (orderedSiblings.length === 0) {
    return items;
  }

  const globalOrder = [...items].sort((a, b) => a.z - b.z);
  const nextOrder: BuilderItem[] = [];
  let insertedSiblingBlock = false;

  for (const item of globalOrder) {
    if (orderedSiblingIds.has(item.id)) {
      if (!insertedSiblingBlock) {
        nextOrder.push(...orderedSiblings);
        insertedSiblingBlock = true;
      }
      continue;
    }
    nextOrder.push(item);
  }

  if (!insertedSiblingBlock) {
    nextOrder.push(...orderedSiblings);
  }

  return nextOrder.map((item, index) => ({ ...item, z: index + 1 }));
}
