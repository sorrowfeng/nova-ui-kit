import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceCache = new Map();
const builderPath = "src/components/showcase/BuilderShowcase.tsx";
const builderModuleDir = "src/components/showcase/builder";
const typesPath = "src/components/showcase/builder/types.ts";

function read(relativePath) {
  if (!sourceCache.has(relativePath)) {
    if (relativePath === builderPath) {
      const main = fs.readFileSync(path.join(root, builderPath), "utf8");
      const modules = fs
        .readdirSync(path.join(root, builderModuleDir))
        .filter((name) => /\.tsx?$/.test(name))
        .map((name) => fs.readFileSync(path.join(root, builderModuleDir, name), "utf8"))
        .join("\n");
      sourceCache.set(relativePath, `${main}\n${modules}`);
    } else if (relativePath === typesPath) {
      const parts = ["types-canvas.ts", "types-project.ts", "types-release.ts", "types.ts"].map((name) =>
        fs.readFileSync(path.join(root, builderModuleDir, name), "utf8"),
      );
      sourceCache.set(relativePath, parts.join("\n"));
    } else if (relativePath === "src-tauri/src/generated_app_runtime.rs") {
      const templateDir = "src-tauri/src/generated_templates";
      const parts = [fs.readFileSync(path.join(root, relativePath), "utf8")];
      const fullTemplateDir = path.join(root, templateDir);
      if (fs.existsSync(fullTemplateDir)) {
        parts.push(
          ...fs
            .readdirSync(fullTemplateDir)
            .filter((name) => name.endsWith(".rs"))
            .map((name) => fs.readFileSync(path.join(fullTemplateDir, name), "utf8")),
        );
      }
      sourceCache.set(relativePath, parts.join("\n"));
    } else {
      sourceCache.set(relativePath, fs.readFileSync(path.join(root, relativePath), "utf8"));
    }
  }
  return sourceCache.get(relativePath);
}

function contains(relativePath, needle, note) {
  return {
    relativePath,
    note,
    passed: read(relativePath).includes(needle),
    detail: `${relativePath} should contain ${needle}`,
  };
}

function absent(relativePath, needle, note) {
  return {
    relativePath,
    note,
    passed: !read(relativePath).includes(needle),
    detail: `${relativePath} should not contain ${needle}`,
  };
}

function matches(relativePath, pattern, note) {
  return {
    relativePath,
    note,
    passed: pattern.test(read(relativePath)),
    detail: `${relativePath} should match ${pattern}`,
  };
}

function builder(needle, note) {
  return contains(builderPath, needle, note);
}

function outputDock(needle, note) {
  return contains("src/components/showcase/builder/OutputDock.tsx", needle, note);
}

function experience(needle, note) {
  return contains("scripts/check-editor-experience.mjs", needle, note);
}

function parity(id, note) {
  return builder(`item(${id},`, note ?? `Qt Creator parity requirement ${id} exists`);
}

const requirements = [
  {
    id: 1,
    title: "固定选择操作栏",
    evidence: [
      parity(1),
      contains("scripts/check-builder-runtime-smoke.mjs", "[data-editor-shell=\\\"builder\\\"]", "browser smoke verifies the real builder shell renders"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.stableActionbar = true", "browser smoke verifies the selection actionbar stays stable across selection states"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.canvasLayoutStableRuntime = true", "browser smoke verifies canvas viewport does not shift across selection and inline edit states"),
      contains("scripts/check-builder-runtime-smoke.mjs", "selection mode strip remains discoverable during multi selection", "browser smoke verifies selection mode strip persists during multi-select"),
      builder('data-builder-selection-visible="persistent"', "persistent selection toolbar marker"),
      builder('data-builder-selection-placement="canvas-top-external"', "selection toolbar lives in external canvas chrome"),
      builder('data-builder-selection-track="external-canvas-chrome"', "selection toolbar exposes the external chrome track"),
      builder("data-builder-selection-mode-strip", "selection toolbar includes a persistent mode help strip"),
      builder("data-builder-selection-mode-affordance", "selection toolbar exposes stable mode affordances"),
      builder("data-builder-selection-capability-strip", "selection toolbar includes stable capability groups"),
      builder("data-builder-selection-capability-enabled", "selection toolbar keeps disabled capabilities visible"),
      builder("selectionActionBarReservedTrack", "reserved toolbar track model"),
      builder('data-builder-canvas-selection-scroll-padding="content-local"', "canvas scroll padding is local to content"),
      builder("data-builder-canvas-content-plane", "canvas content is separated from editor chrome"),
      builder("canvasOuterChromeHeight", "canvas stage reserves external chrome outside content coordinates"),
      experience('id: "selection-actionbar-stable-track"', "experience audit guards toolbar stability"),
      experience('id: "selection-mode-strip"', "experience audit guards the fixed selection mode strip"),
      experience('id: "selection-capability-strip"', "experience audit guards stable selection capability groups"),
    ],
  },
  {
    id: 2,
    title: "多选与框选",
    evidence: [
      parity(2),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.multiSelection = true", "browser smoke verifies Ctrl multi-select works"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.multiSelectLayoutRuntime = true", "browser smoke verifies multi-select layout tools render"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.marqueeSelection = true", "browser smoke verifies marquee selection works"),
      contains("scripts/check-builder-runtime-smoke.mjs", "[\"marquee\", \"add\", \"subtract\", \"invert\", \"clear\"]", "browser smoke verifies all selection affordances are exposed"),
      builder("selectedIds", "multi-selection state exists"),
      builder("data-builder-selection-marquee", "marquee overlay marker"),
      builder("selectionModeAffordanceItems", "multi-selection affordances are discoverable in the fixed actionbar"),
      builder("data-builder-selection-mode-shortcut", "selection mode strip displays marquee and multi-select shortcuts"),
      builder("startSelectionMarquee", "marquee selection entry point"),
      builder("data-builder-multi-select-inspector", "multi-select inspector marker"),
      builder("data-builder-multi-select-layout-tools", "multi-select inspector exposes layout tools"),
      builder("data-builder-multi-select-distribute", "multi-select inspector exposes distribution actions"),
      experience('id: "multi-select-inspector"', "experience audit guards multi-select inspector"),
      experience('id: "multi-select-layout-tools"', "experience audit guards multi-select layout tools"),
    ],
  },
  {
    id: 3,
    title: "低装饰贴底输出 Dock",
    evidence: [
      parity(3),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.outputDockLayout = true", "browser smoke verifies the low chrome docked output layout"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.outputDockContentRuntime = true", "browser smoke verifies expanded output dock content sizing"),
      outputDock('data-builder-output-dock-shell="docked-strip"', "docked strip output dock shell"),
      outputDock('data-builder-output-dock-low-chrome=""', "low chrome output dock styling"),
      outputDock('data-builder-output-dock-safe-area="bottom"', "output dock respects bottom safe-area"),
      outputDock('data-builder-output-dock-content-clip="scroll-panels"', "output dock clips content inside scroll panels"),
      outputDock("--builder-output-dock-height", "resizable dock height variable"),
      builder("data-builder-output-log-line-reader", "output dock has a line-numbered log reader"),
      builder("data-builder-output-log-search", "output dock can search long logs"),
      builder("data-builder-output-log-line-match", "output dock marks matching log lines"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.outputDockLogSearchRuntime = true", "browser smoke verifies output log search"),
      experience('id: "output-dock-resizable"', "experience audit guards output dock resizing"),
    ],
  },
  {
    id: 4,
    title: "消除底部无效白带",
    evidence: [
      parity(4),
      contains("scripts/check-builder-runtime-smoke.mjs", "data-builder-output-dock-no-reserved-band", "browser smoke verifies the output dock no-reserved-band marker"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.outputDockNoClipRuntime = true", "browser smoke verifies expanded output dock controls remain unclipped"),
      outputDock('data-builder-output-dock-no-reserved-band=""', "output dock no-reserved-band marker"),
      outputDock('data-builder-output-dock-no-background-shield=""', "output dock avoids an outer background shield"),
      outputDock("--builder-output-dock-safe-bottom", "output dock uses a safe-area bottom variable"),
      builder("data-builder-workspace-no-output-reserved-band", "workspace declares no bottom reserved band"),
      builder("--builder-canvas-dock-visual-padding", "separate small visual padding variable"),
      builder('paddingBottom: "var(--builder-canvas-dock-visual-padding)"', "canvas uses visual padding instead of a large blank band"),
      experience('id: "output-dock-safe-scroll-dom"', "experience audit guards output dock DOM status-bar and scroll avoidance"),
      experience('id: "canvas-output-dock-no-white-band"', "experience audit guards no-white-band policy"),
    ],
  },
  {
    id: 5,
    title: "exe 同款窗口壳",
    evidence: [
      parity(5),
      contains("src-tauri/tauri.conf.json", '"decorations": false', "editor window uses custom chrome"),
      contains("package.json", '"check:desktop-exe": "node scripts/check-desktop-exe.mjs"', "project exposes a reusable desktop exe smoke command"),
      contains("package.json", '"verify:desktop": "node scripts/verify-desktop-release.mjs"', "project exposes one-command desktop release verification"),
      contains("package.json", '"check:runtime-contract": "node scripts/check-generated-runtime-contract.mjs"', "project exposes generated runtime contract checks"),
      contains("package.json", '"check:generated-runtime": "node scripts/check-generated-runtime-rust.mjs"', "project exposes targeted generated runtime Rust checks"),
      contains("scripts/check-desktop-exe.mjs", "MainWindowTitle", "desktop exe smoke checks the real window title"),
      contains("scripts/check-desktop-exe.mjs", "readPeSubsystem", "desktop exe smoke parses the actual PE subsystem"),
      contains("scripts/check-desktop-exe.mjs", "windowsGuiSubsystem", "desktop exe smoke requires Windows GUI subsystem instead of console"),
      contains("src/components/layout/WindowTitlebar.tsx", 'data-titlebar-drag-region=""', "editor titlebar has explicit draggable hit regions"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.titlebarDragRuntime = true", "browser smoke verifies titlebar drag hit targets"),
      contains("src-tauri/src/generated_app_runtime.rs", 'data-titlebar-drag-region=""', "generated runtime titlebar has explicit draggable hit regions"),
      contains("src-tauri/src/generated_app_runtime.rs", 'data-titlebar-interactive-control=""', "generated runtime window controls are isolated from drag regions"),
      contains("scripts/verify-desktop-release.mjs", 'runNpmScript("tauri:exe")', "desktop release verification rebuilds the exe"),
      contains("scripts/verify-desktop-release.mjs", 'runNpmScript("check:desktop-exe")', "desktop release verification smoke-tests the exe"),
      contains("scripts/verify-desktop-release.mjs", 'runNpmScript("check:generated-runtime")', "desktop release verification runs generated runtime Rust checks"),
      contains("scripts/check-generated-runtime-rust.mjs", "generated_runtime_uses_nova_drag_titlebar_without_editor_grid", "targeted Rust check verifies generated Nova shell"),
      contains("scripts/check-generated-runtime-contract.mjs", "Runtime titlebar is a Nova draggable region", "generated runtime contract checks Nova titlebar behavior"),
      contains("src-tauri/src/generated_app_runtime.rs", 'data-runtime-style-contract="nova-desktop-shell"', "generated runtime declares Nova desktop shell style contract"),
      contains("src-tauri/src/generated_app_runtime.rs", 'data-runtime-frame="nova-editor-parity"', "generated runtime declares editor-parity frame metadata"),
      contains("src-tauri/src/generated_app_runtime.rs", 'data-runtime-titlebar-parity="editor-shell"', "generated runtime titlebar declares editor shell parity"),
      contains("src-tauri/src/generated_app_runtime.rs", 'data-runtime-titlebar-chip="live-app"', "generated runtime titlebar exposes a live app chip"),
      contains("src-tauri/src/generated_app_runtime.rs", 'data-runtime-body="nova-surface"', "generated runtime exposes Nova body surface"),
      contains("scripts/check-generated-runtime-contract.mjs", "Runtime shell exposes Nova desktop style contract", "generated runtime contract checks style shell token"),
      contains("scripts/check-generated-runtime-contract.mjs", "Runtime shell exposes editor parity frame", "generated runtime contract checks editor-parity frame token"),
      contains("scripts/check-generated-runtime-contract.mjs", "Runtime titlebar exposes editor parity marker", "generated runtime contract checks titlebar parity metadata"),
      builder("data-builder-runtime-parity-panel", "runtime parity panel exists"),
      builder("releaseWindowShellMatchesPage", "release shell is compared with edited window shell"),
      contains("src-tauri/src/project_model.rs", "titlebar_style", "runtime project model carries titlebar style"),
      contains("src-tauri/src/generated_app_runtime.rs", "titlebar", "generated runtime includes titlebar handling"),
    ],
  },
  {
    id: 6,
    title: "运行端无设计网格",
    evidence: [
      parity(6),
      builder('data-builder-runtime-parity-grid="off"', "runtime parity declares grid off"),
      builder('id: "runtime-grid"', "editor audit checks runtime grid policy"),
      contains("src-tauri/src/generated_app_runtime.rs", 'data-runtime-shell={titlebarStyle === "nova" ? "nova" : titlebarStyle}', "generated runtime has its own shell marker"),
      contains("src-tauri/src/generated_app_runtime.rs", 'data-runtime-grid="off"', "generated runtime explicitly marks design grid as off"),
      contains("src-tauri/src/generated_app_runtime.rs", 'data-runtime-grid-policy="design-only"', "generated runtime declares grid as a design-only affordance"),
      contains("src-tauri/src/generated_app_runtime.rs", 'data-runtime-design-artifacts="none"', "generated runtime marks editor-only artifacts absent"),
      contains("src-tauri/src/generated_app_runtime.rs", 'data-runtime-design-grid="absent"', "generated app canvas marks design grid absent"),
      contains("src-tauri/src/generated_app_runtime.rs", 'data-runtime-rulers="absent"', "generated app canvas marks rulers absent"),
      contains("scripts/check-generated-runtime-contract.mjs", "Runtime shell forces runtime grid off", "generated runtime contract checks grid-off policy"),
      contains("scripts/check-generated-runtime-contract.mjs", "Runtime shell exposes design-only grid policy", "generated runtime contract checks design-only grid policy"),
      contains("scripts/check-generated-runtime-contract.mjs", "Runtime audit fails if grid policy is missing", "generated runtime audit fails when grid policy is missing"),
      contains("scripts/check-generated-runtime-contract.mjs", "Runtime audit fails if design artifacts are not disabled", "generated runtime contract checks design artifact marker"),
      contains("scripts/check-generated-runtime-contract.mjs", "Runtime audit requires runtime surface markers", "generated runtime contract checks runtime app surface markers"),
      contains("scripts/check-generated-runtime-contract.mjs", "Runtime audit detects editor design grid artifacts", "generated runtime contract checks design grid artifact detection"),
      contains("scripts/check-generated-runtime-rust.mjs", "generated_runtime_uses_nova_drag_titlebar_without_editor_grid", "targeted Rust check verifies generated runtime grid-off policy"),
      absent("src-tauri/src/generated_app_runtime.rs", "showGrid", "generated runtime does not depend on design grid state"),
    ],
  },
  {
    id: 7,
    title: "UI 外窗体可编辑",
    evidence: [
      parity(7),
      builder("updatePageWindowKind", "page window kind editor exists"),
      builder("updatePageTitlebarStyle", "page titlebar editor exists"),
      builder("data-builder-page-titlebar-style", "inspector exposes page titlebar style"),
      builder("data-builder-canvas-window-shell-preview", "canvas previews the edited window shell"),
      builder('data-builder-canvas-window-shell-placement="outside-content"', "canvas shell preview stays outside the app content plane"),
      builder("pageWindowShellPresets", "page window shell presets cover common UI window types"),
      builder("data-builder-page-window-shell-preset-list", "page settings exposes window shell preset list"),
      builder("applyPageWindowShellPreset", "page window shell preset action can update the active UI shell"),
      experience('id: "page-window-shell-presets"', "experience audit guards page window shell presets"),
      contains("src/components/showcase/builder/types.ts", "windowKind: ReleaseWindowKind", "page config stores window kind"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.pageWindowShellRuntime = true", "browser smoke verifies page window shell editing propagates to canvas preview"),
      contains("scripts/check-generated-runtime-rust.mjs", "active_ui_window_shape_drives_generated_exe_shell", "targeted Rust check verifies active UI window shell drives generated exe shell"),
    ],
  },
  {
    id: 8,
    title: "Rust 编辑器能力",
    evidence: [
      parity(8),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustEditorRuntime = true", "browser smoke verifies Rust editor runtime panels render"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustSyntaxRuntime = true", "browser smoke verifies Rust syntax highlighting is active"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustCompletionRuntime = true", "browser smoke verifies Ctrl+Space completions open"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustCompletionCommitRuntime = true", "browser smoke verifies Rust completion insertion mutates the editor"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustSignatureRuntime = true", "browser smoke verifies Rust signature help renders"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustQuickFixRuntime = true", "browser smoke verifies Rust quick fixes render"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustMinimapRuntime = true", "browser smoke verifies Rust minimap markers render"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustFormatRuntime = true", "browser smoke verifies Rust formatting mutates and restores source"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustFindRuntime = true", "browser smoke verifies Rust find navigation works"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustReplaceRuntime = true", "browser smoke verifies Rust replace-current mutates and restores source"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustGotoLineRuntime = true", "browser smoke verifies Rust go-to-line works"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustSymbolSelectionRuntime = true", "browser smoke verifies Rust symbol selection works"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustRenameRuntime = true", "browser smoke verifies Rust rename-symbol mutates and restores source"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustWordWrapRuntime = true", "browser smoke verifies Rust word-wrap toggle works"),
      builder("rustSyntaxHighlightVisible", "Rust syntax highlight overlay exists"),
      builder("rustCompletionItems", "Rust completion model exists"),
      builder("data-builder-rust-completion-accept", "Rust completion detail exposes an explicit insert action"),
      builder("data-builder-rust-completion-commit", "Rust completion insertion leaves a visible committed-candidate status"),
      builder("rustSignatureHelp", "Rust signature help exists"),
      builder("rustEditorMinimapMarkers", "Rust minimap markers exist"),
      builder("rustEditorQuickFixes", "Rust quick fixes exist"),
      builder("findRustBracketMatch", "Rust editor can derive matching brackets from cursor context"),
      builder("data-builder-rust-bracket-match", "Rust editor status exposes bracket matching"),
      builder("data-builder-rust-bracket-marker", "Rust editor highlights matched brackets in the syntax overlay"),
      builder('id: "rust-editor-bracket-match"', "Rust quick fixes can jump to a matching bracket"),
      builder("data-builder-rust-editor-replace-current", "Rust replace-current action exists"),
      builder("data-builder-rust-editor-replace-status", "Rust replace status exists"),
      experience('id: "rust-editor-replace"', "experience audit guards Rust find and replace"),
      experience('id: "rust-editor-bracket-match"', "experience audit guards Rust bracket matching"),
      experience('id: "rust-editor-quick-fixes"', "experience audit guards Rust quick fixes"),
    ],
  },
  {
    id: 9,
    title: "UI 到后端槽函数链接",
    evidence: [
      parity(9),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.logicConnectionRuntime = true", "browser smoke verifies signal-slot matrix renders"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.logicFlowRuntime = true", "browser smoke verifies visual logic flow renders"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.goToSlotRuntime = true", "browser smoke verifies go-to-slot navigation works"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.canvasContextGoSlotRuntime = true", "browser smoke verifies canvas context menu can create or open a Rust slot"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.logicSlotAssistantRuntime = true", "browser smoke verifies slot assistant path rendering"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustCodeLensRuntime = true", "browser smoke verifies Rust CodeLens caller rows"),
      builder("goToSlotForItem", "go-to-slot action exists"),
      builder("data-builder-canvas-context-go-slot", "canvas context menu exposes create/open slot action"),
      builder("data-builder-actionbar-go-slot-state", "selection actionbar exposes slot action state"),
      builder("data-builder-rust-codelens", "Rust editor exposes CodeLens caller rows"),
      builder("data-builder-rust-codelens-open-slot", "Rust CodeLens can open the Rust slot"),
      builder("data-builder-rust-codelens-focus-caller", "Rust CodeLens can jump back to UI callers"),
      builder("data-builder-rust-command-source-inspector", "Rust command source inspector links invoke, caller, and source"),
      builder("data-builder-rust-command-source-inspector-go-source", "Rust command source inspector can open or create source"),
      builder("data-builder-rust-command-source-inspector-run", "Rust command source inspector can run the primary UI caller"),
      builder("data-builder-logic-slot-assistant", "logic page exposes a continuous slot path assistant"),
      builder("data-builder-logic-slot-assistant-step", "slot assistant breaks the path into actionable steps"),
      builder("data-builder-logic-connection-matrix", "signal-slot connection matrix exists"),
      builder("data-builder-logic-flow-board", "visual logic flow board exists"),
      builder("data-builder-selection-signal-slot-strip", "selection strip exposes signal-slot path"),
      builder('id: "signal-slot"', "editor audit guards signal-slot model"),
    ],
  },
  {
    id: 10,
    title: "项目级工程视图",
    evidence: [
      parity(10),
      contains("scripts/check-builder-runtime-smoke.mjs", "[data-builder-project-workspace-tree]", "browser smoke verifies the project tree renders"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectWorkspaceTree = true", "browser smoke verifies the project workspace tree has real nodes"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectTopology = true", "browser smoke verifies project topology renders"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectSourceOverview = true", "browser smoke verifies project source overview renders"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectWorkingSetRuntime = true", "browser smoke verifies project working set renders"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectOwnership = true", "browser smoke verifies project ownership matrix renders"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectLocatorRuntime = true", "browser smoke verifies project locator search and selection"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectNodeDossier = true", "browser smoke verifies project node dossier opens"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectTreeKeyboardRuntime = true", "browser smoke verifies project tree keyboard navigation and bulk folding"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.editorTabsRuntime = true", "browser smoke verifies editor tabs react to project file actions"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectOpenFilesRuntime = true", "browser smoke verifies project open-files manager can create and track UI files"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectOpenFileCloseRuntime = true", "browser smoke verifies closing open-file tabs keeps project files"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectOpenFileRevealRuntime = true", "browser smoke verifies open-file reveal selects the project tree node"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectNodeActionStripRuntime = true", "browser smoke verifies selected-node action strip"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectNodeDuplicateRuntime = true", "browser smoke verifies selected-node duplicate creates a project UI file"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectNodeDeleteDialogRuntime = true", "browser smoke verifies selected-node delete opens a guarded confirmation and cancel preserves the file"),
      builder("data-builder-project-workspace-tree", "project workspace tree exists"),
      builder("data-builder-project-tree-selected-node", "project tree exposes keyboard selection state"),
      builder("data-builder-project-workspace-node-select", "project tree can select a node without opening it"),
      builder("data-builder-project-topology", "project topology exists"),
      builder("data-builder-project-source-overview", "project source overview exists"),
      builder("data-builder-project-folder-health", "project folder health panel exists"),
      builder("data-builder-project-folder-health-row", "project folder health rows expose source/generated/metadata boundaries"),
      builder("data-builder-project-action-center", "project action center exists"),
      builder("data-builder-project-action-center-open", "project action center exposes open actions"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectActionCenterRuntime = true", "browser smoke verifies project action center at runtime"),
      builder("data-builder-project-working-set", "project working set exists"),
      builder("data-builder-project-working-set-open", "project working set exposes open actions"),
      builder("data-builder-project-locator", "project locator search results exist"),
      builder("data-builder-project-ownership-matrix", "project ownership matrix exists"),
      builder("data-builder-project-node-action-strip", "project node action strip exists"),
      builder("data-builder-project-node-action-rename", "project node action strip exposes direct UI rename"),
      builder("data-builder-project-node-action-duplicate", "project node action strip exposes direct UI duplicate"),
      builder("data-builder-project-node-action-delete", "project node action strip exposes guarded UI delete"),
      builder("data-builder-project-node-dossier", "project node dossier exists"),
      builder('id: "project-folder-health"', "editor audit guards project folder health"),
      builder('id: "project-node-action-strip"', "editor audit guards project node action strip"),
      builder('id: "project-action-center"', "editor audit guards project action center"),
      builder('id: "project-working-set"', "editor audit guards project working set"),
      builder('id: "project-tree"', "editor audit guards project tree"),
    ],
  },
  {
    id: 11,
    title: ".nova 本地状态",
    evidence: [
      parity(11),
      builder(".nova/editor-state.json", "UI exposes editor-state metadata path"),
      contains("src-tauri/src/project_writer.rs", 'root.join(".nova")', "project writer creates .nova metadata"),
      contains("src-tauri/src/project_writer.rs", "write_editor_state", "project writer persists editor state"),
      contains("src-tauri/src/project_persistence.rs", "merge_project_editor_state_metadata", "project loader merges .nova editor state"),
      contains("package.json", '"check:project-persistence": "node scripts/check-project-persistence-rust.mjs"', "project exposes targeted .nova persistence checks"),
      contains("scripts/check-project-persistence-rust.mjs", "save_project_files_writes_editor_state_metadata", "targeted Rust check verifies .nova editor-state and workspace metadata"),
      contains("scripts/check-project-persistence-rust.mjs", "read_editor_project_merges_hidden_editor_state_metadata", "targeted Rust check verifies hidden .nova editor-state readback"),
      contains("src/components/showcase/builder/types.ts", "bottomDockLogSearchQuery?: string", "editor state stores bottom dock log search context"),
      builder("setBottomDockLogSearchQuery(editorState.bottomDockLogSearchQuery", "builder restores bottom dock log search context"),
      contains("src-tauri/src/project_writer.rs", '"logSearchQuery": editor_string_field("bottomDockLogSearchQuery", "")', ".nova writer stores bottom dock log search context"),
      contains("src-tauri/src/project_persistence.rs", '"bottomDockLogSearchQuery"', ".nova reader restores bottom dock log search context"),
      contains("src-tauri/src/lib.rs", 'read["editorState"]["bottomDockLogSearchQuery"]', "Rust tests verify bottom dock log search readback"),
      builder("data-builder-project-folder-health", "project folder health panel exposes local project folder state"),
      builder('data-builder-project-folder-health-row={item.id}', "project folder health renders root/source/generated/metadata rows"),
      builder('id: "project-folder-health"', "experience audit guards local project folder health"),
      experience("project-file-dirty-state", "experience audit guards project dirty state"),
    ],
  },
  {
    id: 12,
    title: "左下角构建运行",
    evidence: [
      parity(12),
      contains("package.json", '"check:builder-runtime": "node scripts/check-builder-runtime-smoke.mjs"', "project exposes a real browser builder smoke command"),
      builder('data-builder-left-run-controls-layout="qt-creator-kit"', "left rail uses Qt Creator style run kit"),
      builder("selectedRailActionPreset", "run kit preset state exists"),
      builder("data-builder-rail-kit-plan", "left run kit exposes a selected preset run plan"),
      builder("data-builder-rail-kit-plan-next-step", "left run kit exposes the next preset step"),
      builder("data-builder-project-action-center-run-kit", "project action center mirrors the selected run kit"),
      builder("data-builder-project-action-center-kit-progress", "project action center shows selected run kit progress"),
      builder("data-builder-left-run-operation-monitor", "left run operation monitor exists"),
      builder("data-builder-left-run-task-timeline", "left run kit shows recent build and run task history"),
      builder("data-builder-left-run-task-timeline-row", "left run kit task history rows can open task details"),
      builder("runProjectActionPreset", "run kit can execute action presets"),
      builder("data-builder-bottom-task-log-toolbar", "bottom task details expose focused log actions"),
      builder("data-builder-bottom-task-log-open-readable", "bottom task details can open the readable full log"),
      builder("data-builder-bottom-task-log-search", "bottom task details can search selected task logs"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.leftRunKitRuntime = true", "browser smoke verifies left rail run kit at runtime"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.leftRunPresetChangeRuntime = true", "browser smoke verifies left rail preset switching updates preview"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.leftRunOperationRuntime = true", "browser smoke verifies left rail operation monitor at runtime"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.leftRunCommandMenuRuntime = true", "browser smoke verifies left rail build/run overflow menu"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.leftRunBuildConfigRouteRuntime = true", "browser smoke verifies left rail build config route"),
      experience('id: "left-rail-kit-preset"', "experience audit guards left rail kit presets"),
      experience('id: "left-rail-kit-plan"', "experience audit guards left rail kit plan visibility"),
      experience("leftRunTaskTimelineRows", "experience audit guards the left run task timeline"),
    ],
  },
  {
    id: 13,
    title: "顶部工具栏收敛",
    evidence: [
      parity(13),
      contains("src/components/layout/AppShell.tsx", 'data-editor-toolbar-policy="titlebar-left-rail"', "builder shell routes commands to titlebar and left rail"),
      contains("src/components/layout/AppShell.tsx", 'data-editor-omits-showcase-topbar=""', "builder shell omits showcase topbar"),
      builder("data-builder-command-ownership-chip", "top chip points to command owner"),
      builder("compact-locator", "compact locator audit item exists"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.builderTopbarOmitted = true", "browser smoke verifies builder omits showcase topbar"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.titlebarOverflowRuntime = true", "browser smoke verifies titlebar build/run overflow ownership"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.titlebarBuildMenuRuntime = true", "browser smoke verifies titlebar build menu can open"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.titlebarBuildActionRuntime = true", "browser smoke verifies titlebar build menu action routes into left rail monitor"),
      experience('id: "topbar-command-deduplication"', "experience audit guards topbar deduplication"),
    ],
  },
  {
    id: 14,
    title: "画布文本快速编辑",
    evidence: [
      parity(14),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.inlineTextEdit = true", "browser smoke verifies double-click inline text editing"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.inlineTextEditCommitRuntime = true", "browser smoke verifies double-click inline text edits commit to the canvas"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.inlineTextKeyboardRuntime = true", "browser smoke verifies F2 inline text edits commit to the canvas"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.inlineTextEnterRuntime = true", "browser smoke verifies Enter inline text edits commit to the canvas"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.actionbarTextEditRuntime = true", "browser smoke verifies actionbar text menu edits commit to the canvas"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.contextMenuTextEditRuntime = true", "browser smoke verifies context-menu text edits commit to the canvas"),
      contains("scripts/check-builder-runtime-smoke.mjs", "[data-builder-inline-text-editor]", "browser smoke waits for the inline text editor"),
      builder("InlineTextEdit", "inline text edit state exists"),
      builder("startInlineTextEdit", "inline text edit action exists"),
      builder("quickTextPrimaryPropByType", "inline text editing chooses the most visible field by control type"),
      builder("data-builder-inline-text-primary-value", "inline text editing hints show the primary field value before editing"),
      builder("data-builder-actionbar-edit-text-menu", "selection actionbar text menu exists"),
      builder("data-builder-canvas-context-edit-text-field", "context menu text field edit exists"),
      experience("quickTextPrimaryPropByType", "experience audit guards type-aware inline text fields"),
      experience('id: "actionbar-text-field-menu"', "experience audit guards actionbar text field menu"),
    ],
  },
  {
    id: 15,
    title: "画布右键菜单",
    evidence: [
      parity(15),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.contextMenu = true", "browser smoke verifies the canvas context menu opens"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.canvasContextInsertRuntime = true", "browser smoke verifies the canvas context menu can search and insert controls"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.canvasContextSelectSameRuntime = true", "browser smoke verifies context menu select-same-type changes selection"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.canvasContextInvertSelectionRuntime = true", "browser smoke verifies context menu invert-selection changes selection"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.canvasContextRuntimeStateRuntime = true", "browser smoke verifies context menu runtime-state toggles update canvas nodes"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.canvasContextGroupLayoutRuntime = true", "browser smoke verifies context menu layout grouping executes"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.canvasContextMatchSizeRuntime = true", "browser smoke verifies context menu match-size mutates selected control bounds"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.canvasContextDistributeRuntime = true", "browser smoke verifies context menu distribution mutates selected control positions"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.contextMenuTextEditRuntime = true", "browser smoke verifies the canvas context menu can run a text edit action"),
      contains("scripts/check-builder-runtime-smoke.mjs", "[data-builder-canvas-context-overlay]", "browser smoke waits for the canvas context menu overlay"),
      builder("CanvasContextMenuState", "canvas context menu state exists"),
      builder("data-builder-canvas-context-overlay", "canvas context menu overlay marker exists"),
      builder("runCanvasContextAction", "canvas context menu dispatch exists"),
      builder("data-builder-canvas-context-quick-insert", "context menu quick insert exists"),
      builder("data-builder-canvas-context-group-layout", "context menu layout grouping selector exists"),
      builder("data-builder-frame-layout-mode", "frame nodes expose layout mode after context-menu grouping"),
      builder("data-builder-canvas-context-selection-summary", "context menu exposes selected, focusable, and readonly counts"),
      builder("contextMenuPlacementReady", "context menu smart positioning audit exists"),
    ],
  },
  {
    id: 16,
    title: "Rust 逻辑页直观化",
    evidence: [
      parity(16),
      contains("scripts/check-builder-runtime-smoke.mjs", "[data-builder-logic-command-impact-panel]", "browser smoke verifies logic command impact panel renders"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.logicConnectionRuntime = true", "browser smoke verifies logic connection matrix renders"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.logicFlowRuntime = true", "browser smoke verifies logic flow board renders"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.goToSlotRuntime = true", "browser smoke verifies slot navigation from logic page"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustFindRuntime = true", "browser smoke verifies the logic page Rust editor can search source"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustSymbolSelectionRuntime = true", "browser smoke verifies the logic page can select Rust symbols"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustRenameRuntime = true", "browser smoke verifies the logic page can rename Rust symbols"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustDebugWorkbenchRuntime = true", "browser smoke verifies the Rust debug workbench tabs and breakpoint state"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.logicSlotAssistantRuntime = true", "browser smoke verifies the logic slot assistant"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.logicContextRuntime = true", "browser smoke verifies the logic context summary"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.rustCodeLensRuntime = true", "browser smoke verifies the Rust CodeLens caller strip"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.logicCommandCenterRuntime = true", "browser smoke verifies the current command action center"),
      builder("data-builder-logic-context-summary", "logic context summary exists"),
      builder("data-builder-logic-context-card", "logic context summary exposes direct action cards"),
      builder("data-builder-logic-command-center", "current command action center exists"),
      builder("data-builder-logic-command-center-open-slot", "current command action center can open or generate the slot"),
      builder("data-builder-logic-command-center-focus-caller", "current command action center can focus the primary caller"),
      builder("data-builder-logic-command-center-run", "current command action center can run the primary caller"),
      builder("data-builder-logic-command-center-map", "current command action center can open mapping"),
      builder("data-builder-logic-command-center-copy-invoke", "current command action center can copy invoke name"),
      builder("data-builder-rust-command-source-inspector", "current command source inspector exists"),
      builder("data-builder-rust-command-source-inspector-location", "current command source inspector exposes source location"),
      builder("data-builder-rust-command-source-inspector-copy-invoke", "current command source inspector can copy invoke name"),
      builder("data-builder-rust-command-source-inspector-map", "current command source inspector can open mapping"),
      builder("data-builder-rust-codelens", "Rust CodeLens exists"),
      builder("data-builder-rust-codelens-row", "Rust CodeLens exposes caller rows"),
      builder("data-builder-logic-workbench-next-actions", "logic next-action workbench exists"),
      builder("data-builder-logic-slot-assistant", "logic slot assistant exists"),
      builder("data-builder-logic-slot-assistant-history", "logic slot assistant shows recent slot navigation"),
      builder("data-builder-rust-editor-breadcrumbs", "Rust breadcrumbs exist"),
      builder("data-builder-logic-command-impact-panel", "command impact panel exists"),
      builder("data-builder-rust-debug-workbench", "Rust debug workbench exists"),
      builder("data-builder-rust-debug-breakpoint-toggle", "Rust debug workbench can toggle breakpoints"),
      builder("data-builder-rust-command-slot-card", "current command slot card exists"),
      builder("data-builder-rust-editor-references", "Rust references panel exists"),
      experience('id: "logic-command-center"', "experience audit guards the current command action center"),
      experience('id: "rust-command-source-inspector"', "experience audit guards the Rust command source inspector"),
      experience('id: "rust-codelens-callers"', "experience audit guards Rust CodeLens callers"),
      experience('id: "logic-context-summary"', "experience audit guards the logic context summary"),
      experience('id: "logic-command-impact-panel"', "experience audit guards command impact panel"),
      experience('id: "rust-debug-workbench"', "experience audit guards Rust debug workbench"),
    ],
  },
  {
    id: 17,
    title: "去除重复预览模式",
    evidence: [
      parity(17),
      contains("src/components/showcase/builder/types.ts", 'export type BuilderMode = "project" | "design" | "logic" | "build";', "builder modes exclude preview/export"),
      builder('data-builder-mode-rail="qt-creator-left"', "mode rail declares current workflow"),
      absent("src/components/showcase/BuilderShowcase.tsx", 'setMode("preview"', "builder no longer switches to preview mode"),
      absent("src/components/showcase/BuilderShowcase.tsx", 'mode: "preview"', "mode rail no longer includes preview"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.previewExportRemovedRuntime = true", "browser smoke verifies preview/export modes are absent at runtime"),
      builder('id: "preview-export-removed"', "editor audit guards preview/export removal"),
    ],
  },
  {
    id: 18,
    title: "项目文件夹保存",
    evidence: [
      parity(18),
      builder("data-builder-project-save-manifest", "project save manifest exists"),
      builder("data-builder-project-save-plan", "project staged save plan exists"),
      builder("data-builder-project-save-plan-step", "project save plan exposes source/generated/.nova stages"),
      builder("data-builder-project-save-plan-route", "project save plan exposes active routing into the project tree"),
      builder('id: "project-save-plan"', "editor audit guards project save plan"),
      builder("data-builder-project-source-overview", "source overview exposes saved project files"),
      builder("data-builder-project-folder-health", "project folder health clarifies root/source/generated/metadata save boundaries"),
      builder("data-builder-project-folder-health-path", "project folder health exposes actual filesystem targets"),
      builder("data-builder-project-folder-health-open", "project folder health can route to project save surfaces"),
      contains("src-tauri/src/project_writer.rs", "save_project_files", "Tauri project writer saves project files"),
      contains("src-tauri/src/project_writer.rs", 'root.join("nova.project.json")', "Tauri project writer emits the portable project manifest"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.projectFolderSaveRuntime = true", "browser smoke verifies project save destinations and .nova routing"),
      contains("scripts/check-project-persistence-rust.mjs", "save_project_files_writes_gitignore_without_overwriting_user_rules", "targeted Rust check verifies .nova metadata remains reusable in project folders"),
      absent("README.md", "JSON/React export", "README no longer documents standalone export as primary flow"),
    ],
  },
  {
    id: 19,
    title: "补齐 MD3 / Qt 控件",
    evidence: [
      parity(19),
      builder("data-builder-component-coverage-panel", "component coverage panel exists"),
      builder("data-builder-component-kits", "component palette exposes kit-based desktop workflows"),
      builder("componentPaletteKitDefinitions", "component palette defines reusable MD3 and Qt control kits"),
      builder("insertComponentPaletteKitScaffold", "component palette kits can batch-insert related controls"),
      builder("data-builder-component-kit-scaffold", "component palette exposes kit scaffold actions"),
      builder('id: "component-palette-kits"', "editor audit guards component palette kits"),
      builder('id: "component-palette-kit-scaffold"', "editor audit guards component palette kit scaffold insertion"),
      builder("md3ApplicationComponentTypes", "MD3 application component set exists"),
      builder('id: "md3-application-shell"', "component coverage includes an MD3 application shell group"),
      contains("scripts/check-component-coverage.mjs", '"md3-composition-details"', "component coverage requires fine-grained MD3 composition controls"),
      builder("md3ApplicationComponentTypes.length >= 32", "MD3 application component set covers a broad shell-level control set"),
      contains("src/components/showcase/builder/types.ts", '"search-suggestion-list"', "search suggestions component type exists"),
      contains("src/components/showcase/builder/types.ts", '"sheet-drag-handle"', "sheet drag handle component type exists"),
      contains("src/components/showcase/builder/types.ts", '"progress-list"', "progress list component type exists"),
      contains("src-tauri/src/generated_app_runtime.rs", 'item.type === "navigation-item"', "generated runtime renders granular navigation item"),
      contains("src/components/showcase/builder/types.ts", '"help-viewer"', "desktop help viewer component type exists"),
      contains("src/components/showcase/builder/types.ts", '"color-swatch-grid"', "color swatch grid component type exists"),
      contains("src/components/showcase/builder/types.ts", '"problems-panel"', "Rust/IDE problems panel component type exists"),
      contains("src/components/showcase/BuilderShowcase.tsx", 'type: "breakpoints-panel"', "component palette exposes breakpoint management panel"),
      contains("src/components/showcase/BuilderShowcase.tsx", 'item.type === "watch-panel"', "builder preview renders watch expression panel"),
      contains("src-tauri/src/generated_app_runtime.rs", 'item.type === "call-stack"', "generated runtime renders call stack panel"),
      contains("src/components/showcase/builder/event-bindings.ts", 'item.type === "problems-panel"', "debug panels participate in click event binding"),
      contains("scripts/check-component-coverage.mjs", "requiredDesktopControlGroups", "component coverage script tracks desktop controls"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.componentCoverageRuntime = true", "browser smoke verifies component coverage panel is complete at runtime"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.componentPaletteRuntime = true", "browser smoke verifies component palette collections and quick insert runtime"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.componentPaletteKitsRuntime = true", "browser smoke verifies component palette kits render, focus, and insert"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.componentPaletteKitScaffoldRuntime = true", "browser smoke verifies component kit scaffold insertion creates a multi-selection"),
      contains("scripts/check-builder-runtime-smoke.mjs", "verified.canvasContextInsertRuntime = true", "browser smoke verifies a desktop table-view control can be inserted from canvas search"),
    ],
  },
];

const failures = [];
let evidenceCount = 0;

for (const requirement of requirements) {
  if (requirement.evidence.length === 0) {
    failures.push({
      requirement,
      evidence: { note: "No evidence checks configured.", detail: "Every goal item needs explicit evidence." },
    });
    continue;
  }

  for (const evidence of requirement.evidence) {
    evidenceCount += 1;
    if (!evidence.passed) {
      failures.push({ requirement, evidence });
    }
  }
}

const ids = requirements.map((requirement) => requirement.id);
const missingIds = Array.from({ length: 19 }, (_, index) => index + 1).filter((id) => !ids.includes(id));
if (missingIds.length > 0) {
  failures.push({
    requirement: { id: "index", title: "Requirement index" },
    evidence: {
      note: "All 19 requested goal items must be represented.",
      detail: `Missing requirement ids: ${missingIds.join(", ")}`,
    },
  });
}

if (failures.length > 0) {
  console.error(`Goal coverage failed: ${failures.length} issue(s) across ${requirements.length} requirement(s).`);
  for (const failure of failures) {
    console.error(`  - #${failure.requirement.id} ${failure.requirement.title}: ${failure.evidence.note}`);
    console.error(`    ${failure.evidence.detail}`);
  }
  process.exit(1);
}

console.log(`Goal coverage ok: ${requirements.length} requirements, ${evidenceCount} evidence checks.`);
