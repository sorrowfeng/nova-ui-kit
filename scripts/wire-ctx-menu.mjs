import fs from "node:fs";

const path = "src/components/showcase/BuilderShowcase.tsx";
const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);

// Replace the canvasContextMenu ternary JSX with a CanvasContextMenu component call.
let start = -1;
for (let i = 53400; i < 53500; i++) {
  if (lines[i].includes("{canvasContextMenu ? (")) {
    start = i;
    break;
  }
}
if (start < 0) {
  console.error("start not found");
  process.exit(1);
}

// Find the matching ) : null}
let depth = 0;
let end = -1;
for (let i = start; i < start + 900; i++) {
  depth += (lines[i].match(/\{/g) || []).length - (lines[i].match(/\}/g) || []).length;
  if (i > start && depth === 0) {
    end = i;
    break;
  }
}
console.log("replacing lines", start + 1, "-", end + 1);

const replacement = `              <CanvasContextMenu
                open={Boolean(canvasContextMenu)}
                x={canvasContextMenu?.x ?? 0}
                y={canvasContextMenu?.y ?? 0}
                placementX={canvasContextMenu?.placementX ?? "right"}
                placementY={canvasContextMenu?.placementY ?? "bottom"}
                item={canvasContextMenuItem}
                itemSummary={canvasContextMenuItem ? getItemSummary(canvasContextMenuItem) : ""}
                eventName={canvasContextMenuEventName}
                activeFileName={activeFile.name}
                itemCount={items.length}
                pageWidth={page.width}
                pageHeight={page.height}
                selectedCount={selectedIds.length}
                quickInsertTypes={canvasContextQuickInsertTypes}
                quickInsertGroups={canvasContextQuickInsertGroups}
                insertQuery={canvasContextInsertQuery}
                insertInputRef={canvasContextInsertInputRef}
                insertSearchResults={canvasContextInsertSearchResults}
                insertActiveIndex={canvasContextInsertActiveIndex}
                onInsertQueryChange={(value) => {
                  setCanvasContextInsertQuery(value);
                  setCanvasContextInsertActiveIndex(0);
                }}
                onInsertActiveIndexChange={setCanvasContextInsertActiveIndex}
                onInsertSearchKeyDown={handleCanvasContextInsertSearchKeyDown}
                onInsertComponent={insertComponentFromCanvasContext}
                onClose={closeCanvasContextMenu}
                onAction={runCanvasContextAction}
                getItemIcon={(type) => getDefinition(type).icon}
                menuBody={canvasContextMenuActions}
              />`;

const next = [...lines.slice(0, start), ...replacement.split("\n"), ...lines.slice(end + 1)];

// Add import
let text = next.join("\n");
if (!text.includes("CanvasContextMenu")) {
  text = text.replace(
    'import { ToolchainBanner } from "./builder/ToolchainBanner";',
    'import { ToolchainBanner } from "./builder/ToolchainBanner";\nimport { CanvasContextMenu } from "./builder/CanvasContextMenu";',
  );
}

fs.writeFileSync(path, text);
console.log("context menu componentized");
