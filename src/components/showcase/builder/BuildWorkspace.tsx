import type { ReactNode } from "react";

export function BuildWorkspace({
  toolbar,
  children,
}: {
  toolbar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-surface-container-low">
      <div className="border-b border-outline-variant bg-surface-container-lowest px-4 py-3">
        {toolbar}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        {children}
      </div>
    </div>
  );
}
