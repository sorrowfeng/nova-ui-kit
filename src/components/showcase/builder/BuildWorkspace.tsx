import { Children, type ReactNode } from "react";

export function BuildWorkspace({
  toolbar,
  children,
  toolbarPlacement = "top",
}: {
  toolbar: ReactNode;
  children: ReactNode;
  toolbarPlacement?: "top" | "sidebar";
}) {
  if (toolbarPlacement === "sidebar") {
    const panes = Children.toArray(children);
    const [sidebar, ...mainPanes] = panes;

    return (
      <div
        className="grid h-full min-h-0 grid-cols-1 gap-3 overflow-hidden bg-surface-container-low p-3 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]"
        data-builder-build-workspace=""
        data-builder-build-workspace-layout="compact-ide"
        data-builder-build-toolbar-placement="sidebar"
      >
        <div className="subtle-scrollbar min-h-0 space-y-3 overflow-y-auto pr-1">
          <div className="rounded-[22px] border border-outline-variant bg-surface-container-lowest px-3 py-2 shadow-m3-1">
            {toolbar}
          </div>
          {sidebar}
        </div>
        {mainPanes}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface-container-low" data-builder-build-workspace="" data-builder-build-workspace-layout="compact-ide">
      <div className="border-b border-outline-variant bg-surface-container-lowest px-3 py-2">
        {toolbar}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-3 xl:grid-cols-[320px_minmax(0,1fr)]">
        {children}
      </div>
    </div>
  );
}
