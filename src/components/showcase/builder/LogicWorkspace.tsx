import { Children, type ReactNode } from "react";

export function LogicWorkspace({ children }: { children: ReactNode }) {
  const panels = Children.toArray(children);
  const resourcePanel = panels[0] ?? null;
  const editorPanel = panels[1] ?? null;
  const inspectorPanel = panels[2] ?? null;

  return (
    <div
      className="grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(11rem,24vh)_minmax(9rem,20vh)] gap-2 overflow-hidden bg-surface-container-lowest p-2 xl:grid-cols-[minmax(14rem,16rem)_minmax(0,1fr)] xl:grid-rows-[minmax(0,1fr)_minmax(10rem,22vh)]"
      data-builder-logic-workspace-layout="code-primary"
      data-builder-logic-workspace-preset="vscode-code-primary"
      data-builder-logic-workspace-code-primary=""
      data-builder-logic-workspace-side-panels="left-and-bottom"
    >
      <main className="min-h-0 min-w-0 overflow-hidden [&>*]:h-full xl:col-start-2 xl:row-start-1" data-builder-logic-code-editor-primary="">
        {editorPanel}
      </main>
      <aside className="min-h-0 overflow-hidden [&>*]:h-full xl:col-start-1 xl:row-span-2 xl:row-start-1" data-builder-logic-resource-dock="left-explorer">
        {resourcePanel}
      </aside>
      <aside className="min-h-0 min-w-0 overflow-hidden [&>*]:h-full xl:col-start-2 xl:row-start-2" data-builder-logic-auxiliary-dock="bottom-panel">
        {inspectorPanel}
      </aside>
    </div>
  );
}
