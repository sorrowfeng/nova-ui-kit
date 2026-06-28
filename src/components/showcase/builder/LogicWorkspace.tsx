import type { ReactNode } from "react";

export function LogicWorkspace({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 overflow-hidden p-4 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
      {children}
    </div>
  );
}
