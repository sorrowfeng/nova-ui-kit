import { Children, type ReactNode } from "react";
import { Bug, ChevronRight, Settings2 } from "lucide-react";

export function LogicWorkspace({ children }: { children: ReactNode }) {
  const panels = Children.toArray(children);
  const resourcePanel = panels[0] ?? null;
  const editorPanel = panels[1] ?? null;
  const inspectorPanel = panels[2] ?? null;

  return (
    <div
      className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(17.5rem,19rem)] gap-2 overflow-hidden bg-surface-container-lowest px-2 pt-2 pb-11"
      data-builder-logic-workspace-layout="code-primary"
      data-builder-logic-workspace-preset="vscode-code-primary"
      data-builder-logic-workspace-code-primary=""
      data-builder-logic-workspace-side-panels="right-sidebar"
      data-builder-logic-workspace-code-share="large-editor"
      data-builder-logic-workspace-scroll-model="contained-panels"
      data-builder-logic-workspace-page-scroll="none"
      data-builder-logic-workspace-sidebar-priority="resources-first"
      data-builder-logic-workspace-bottom-dock-clearance="reserved"
    >
      <div
        className="col-start-2 grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_auto] gap-2 overflow-hidden"
        data-builder-logic-secondary-sidebar=""
        data-builder-logic-bottom-panels=""
        data-builder-logic-secondary-sidebar-priority="resources-first"
      >
        <aside
          className="min-h-0 overflow-hidden [&>*]:h-full"
          data-builder-logic-resource-dock="right-outline"
          data-builder-logic-resource-dock-priority="primary-outline"
        >
          {resourcePanel}
        </aside>
        <details
          className="group min-h-0 min-w-0 overflow-hidden rounded-xl border border-outline-variant bg-surface-container text-xs shadow-none"
          data-builder-logic-auxiliary-dock="bottom-panel"
          data-builder-logic-auxiliary-dock-priority="secondary-inspector"
          data-builder-logic-auxiliary-details=""
          data-builder-logic-auxiliary-details-density="collapsed-thin-inspector"
        >
          <summary
            className="focus-ring flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 px-2 py-1.5 text-left transition hover:bg-surface-container-high [&::-webkit-details-marker]:hidden"
            data-builder-logic-auxiliary-summary=""
            data-builder-logic-auxiliary-summary-density="thin-status-row"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-primary">
                <Bug aria-hidden className="size-3" />
              </span>
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate font-medium text-on-surface">调试与命令属性</span>
                <span className="truncate text-[0.66rem] text-on-surface-variant">按需展开</span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-[0.66rem] text-on-surface-variant">
              <Settings2 aria-hidden className="size-3" />
              <span>检查器</span>
              <ChevronRight aria-hidden className="size-3.5 transition group-open:rotate-90" />
            </span>
          </summary>
          <div
            className="subtle-scrollbar hidden max-h-[min(32rem,calc(100vh-14rem))] overflow-y-auto border-t border-outline-variant bg-surface-container-low p-2 group-open:block [&>*]:rounded-[14px] [&>*]:border-0 [&>*]:bg-transparent [&>*]:p-0 [&>*]:shadow-none"
            data-builder-logic-auxiliary-content=""
            data-builder-logic-auxiliary-content-density="hidden-until-open-scroll"
            data-builder-logic-auxiliary-content-state="hidden-until-open"
          >
            {inspectorPanel}
          </div>
        </details>
      </div>
      <main className="col-start-1 row-start-1 min-h-0 min-w-0 overflow-hidden [&>*]:h-full" data-builder-logic-code-editor-primary="">
        {editorPanel}
      </main>
    </div>
  );
}
