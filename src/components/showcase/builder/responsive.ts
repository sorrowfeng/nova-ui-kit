import type {
  BuilderItem,
  PageConfig,
  ResponsiveBreakpointId,
  ResponsiveOverride,
} from "./types";

export const RESPONSIVE_BREAKPOINT_SIZES: Record<Exclude<ResponsiveBreakpointId, "desktop">, { width: number; height: number }> = {
  tablet: { width: 1024, height: 768 },
  mobile: { width: 390, height: 844 },
};

export function normalizeBreakpoint(value: unknown): ResponsiveBreakpointId {
  return value === "tablet" || value === "mobile" ? value : "desktop";
}

export function responsiveBreakpointSize(id: ResponsiveBreakpointId, page: PageConfig) {
  if (id === "desktop") {
    return { width: page.width, height: page.height };
  }
  return RESPONSIVE_BREAKPOINT_SIZES[id];
}

export function getEffectivePage(page: PageConfig): PageConfig {
  const activeBreakpoint = normalizeBreakpoint(page.activeBreakpoint);
  const size = responsiveBreakpointSize(activeBreakpoint, page);
  return {
    ...page,
    activeBreakpoint,
    preset: activeBreakpoint === "desktop" ? page.preset : activeBreakpoint,
    width: size.width,
    height: size.height,
  };
}

export function resolveItemForBreakpoint(item: BuilderItem, breakpoint: ResponsiveBreakpointId): BuilderItem {
  if (breakpoint === "desktop") {
    return item;
  }
  const override = item.responsive?.[breakpoint];
  if (!override) {
    return item;
  }
  return {
    ...item,
    x: typeof override.x === "number" ? override.x : item.x,
    y: typeof override.y === "number" ? override.y : item.y,
    width: typeof override.width === "number" ? override.width : item.width,
    height: typeof override.height === "number" ? override.height : item.height,
  };
}

export function resolveItemsForBreakpoint(items: BuilderItem[], breakpoint: ResponsiveBreakpointId): BuilderItem[] {
  return items.map((item) => resolveItemForBreakpoint(item, breakpoint));
}

export function withResponsiveLayoutOverride(item: BuilderItem, breakpoint: ResponsiveBreakpointId, patch: ResponsiveOverride): BuilderItem {
  if (breakpoint === "desktop") {
    return { ...item, ...patch };
  }
  return {
    ...item,
    responsive: {
      ...(item.responsive ?? {}),
      [breakpoint]: {
        ...(item.responsive?.[breakpoint] ?? {}),
        ...patch,
      },
    },
  };
}

export function cloneResponsiveOverrides(
  responsive?: Partial<Record<ResponsiveBreakpointId, ResponsiveOverride>>,
): Partial<Record<ResponsiveBreakpointId, ResponsiveOverride>> | undefined {
  return responsive
    ? (Object.fromEntries(Object.entries(responsive).map(([key, value]) => [key, value ? { ...value } : value])) as Partial<
        Record<ResponsiveBreakpointId, ResponsiveOverride>
      >)
    : undefined;
}
