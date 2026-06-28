import type { ReactNode } from "react";

export function DesignWorkspace({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
      {children}
    </div>
  );
}
