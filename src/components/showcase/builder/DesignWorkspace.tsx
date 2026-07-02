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
        "grid h-full min-h-0 grid-cols-1 bg-surface-container-low",
        leftCollapsed && rightCollapsed && "xl:grid-cols-[56px_minmax(0,1fr)_56px]",
        leftCollapsed && !rightCollapsed && "xl:grid-cols-[56px_minmax(0,1fr)_300px] 2xl:grid-cols-[56px_minmax(0,1fr)_320px]",
        !leftCollapsed && rightCollapsed && "xl:grid-cols-[336px_minmax(0,1fr)_56px] 2xl:grid-cols-[360px_minmax(0,1fr)_56px]",
        !leftCollapsed && !rightCollapsed && "xl:grid-cols-[336px_minmax(0,1fr)_300px] 2xl:grid-cols-[360px_minmax(0,1fr)_320px]",
      )}
      data-builder-readable-workbench="qt-creator"
      data-builder-workspace-layout="wide-left-dock"
      data-builder-left-dock-collapsed={leftCollapsed ? "true" : "false"}
      data-builder-right-dock-collapsed={rightCollapsed ? "true" : "false"}
    >
      {children}
    </div>
  );
}
