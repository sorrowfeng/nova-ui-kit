import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DesignWorkspace({
  children,
  leftCollapsed = false,
  rightCollapsed = false,
}: {
  children: ReactNode;
  leftCollapsed?: boolean;
  rightCollapsed?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid h-full min-h-0 grid-cols-1 overflow-hidden bg-surface-container-low pb-11",
        leftCollapsed && rightCollapsed && "xl:grid-cols-[56px_minmax(0,1fr)_56px]",
        leftCollapsed && !rightCollapsed && "xl:grid-cols-[56px_minmax(0,1fr)_300px] 2xl:grid-cols-[56px_minmax(0,1fr)_320px]",
        !leftCollapsed && rightCollapsed && "xl:grid-cols-[304px_minmax(0,1fr)_56px] 2xl:grid-cols-[320px_minmax(0,1fr)_56px]",
        !leftCollapsed && !rightCollapsed && "xl:grid-cols-[304px_minmax(0,1fr)_300px] 2xl:grid-cols-[320px_minmax(0,1fr)_320px]",
      )}
      data-builder-readable-workbench="qt-creator"
      data-builder-workspace-layout="balanced-left-dock"
      data-builder-left-dock-width="balanced-320"
      data-builder-left-dock-collapsed={leftCollapsed ? "true" : "false"}
      data-builder-right-dock-collapsed={rightCollapsed ? "true" : "false"}
      data-builder-design-workspace-bottom-dock-clearance="reserved"
    >
      {children}
    </div>
  );
}
