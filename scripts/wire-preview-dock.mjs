import fs from "node:fs";

const path = "src/components/showcase/BuilderShowcase.tsx";
let t = fs.readFileSync(path, "utf8");

// Simple replacements first
t = t.replace(
  'type BuilderBottomDockTab = "issues" | "output" | "tasks" | "logs";',
  'type BuilderBottomDockTab = "issues" | "output" | "tasks" | "logs" | "preview";',
);

t = t.replace(
  `    { value: "logs", label: "日志", icon: FileJson },
  ];`,
  `    { value: "logs", label: "日志", icon: FileJson },
    { value: "preview", label: "预览", icon: MonitorPlay },
  ];`,
);

t = t.replace(
  'editorState.activeBottomDockTab === "logs") {',
  'editorState.activeBottomDockTab === "logs" || editorState.activeBottomDockTab === "preview") {',
);

if (!t.includes('import { PreviewDock }')) {
  t = t.replace(
    'import { ToolchainBanner } from "./builder/ToolchainBanner";',
    'import { PreviewDock } from "./builder/PreviewDock";\nimport { ToolchainBanner } from "./builder/ToolchainBanner";',
  );
}

if (!t.includes("MonitorPlay")) {
  t = t.replace("  MousePointer2,", "  MonitorPlay,\n  MousePointer2,");
}

// Open preview tab after generating
t = t.replace(
  `      setPreviewWebPath(result.index_path);
      void openLocalPath(result.index_path);`,
  `      setPreviewWebPath(result.index_path);
      openBottomDock("preview", true);
      void openLocalPath(result.index_path);`,
);

// Insert preview branch before issues content
const issuesBranch = `              {bottomDockTab === "issues" ? (`;
if (t.includes(issuesBranch) && !t.includes("data-builder-preview-dock")) {
  const previewBranch = `              {bottomDockTab === "preview" ? (
                <PreviewDock
                  previewUrl={previewWebPath ? convertFileSrc(previewWebPath) : null}
                  distDir={previewWebPath ? previewWebPath.replace(/[\\\\/]index\\.html$/, "") : null}
                  onRefresh={() => {
                    if (previewWebPath) {
                      void openLocalPath(previewWebPath);
                    }
                  }}
                  onOpenExternal={() => {
                    if (previewWebPath) void openLocalPath(previewWebPath);
                  }}
                  onGenerate={() => void previewGeneratedWeb()}
                />
              ) : bottomDockTab === "issues" ? (`;
  t = t.replace(issuesBranch, previewBranch);
  console.log("preview branch inserted");
}

// convertFileSrc import
if (!t.includes("convertFileSrc")) {
  t = t.replace(
    'import { open } from "@tauri-apps/plugin-dialog";',
    'import { convertFileSrc } from "@tauri-apps/api/core";\nimport { open } from "@tauri-apps/plugin-dialog";',
  );
}

fs.writeFileSync(path, t);
console.log("done");
