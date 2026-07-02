import { Children, type ReactNode } from "react";

export function LogicWorkspace({ children }: { children: ReactNode }) {
  const panels = Children.toArray(children);
  const resourcePanel = panels[0] ?? null;
  const editorPanel = panels[1] ?? null;
  const inspectorPanel = panels[2] ?? null;

  return (
    <div
      className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(17.5rem,19rem)] gap-2 overflow-hidden bg-surface-container-lowest p-2"
      data-builder-logic-workspace-layout="code-primary"
      data-builder-logic-workspace-preset="vscode-code-primary"
      data-builder-logic-workspace-code-primary=""
      data-builder-logic-workspace-side-panels="right-sidebar"
      data-builder-logic-workspace-code-share="large-editor"
      data-builder-logic-workspace-scroll-model="contained-panels"
      data-builder-logic-workspace-page-scroll="none"
      data-builder-logic-workspace-sidebar-priority="resources-first"
    >
      <div
        className="col-start-2 grid min-h-0 min-w-0 grid-rows-[minmax(18rem,1.25fr)_minmax(10rem,0.75fr)] gap-2 overflow-hidden"
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
        <aside
          className="min-h-0 min-w-0 overflow-hidden [&>*]:h-full"
          data-builder-logic-auxiliary-dock="bottom-panel"
          data-builder-logic-auxiliary-dock-priority="secondary-inspector"
        >
          {inspectorPanel}
        </aside>
      </div>
      <main className="col-start-1 row-start-1 min-h-0 min-w-0 overflow-hidden [&>*]:h-full" data-builder-logic-code-editor-primary="">
        {editorPanel}
      </main>
    </div>
  );
}
