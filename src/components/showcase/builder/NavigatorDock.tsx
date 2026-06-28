import type { ReactNode } from "react";

export function NavigatorDock({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}
