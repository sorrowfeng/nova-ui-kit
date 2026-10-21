import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const builderModuleDir = "src/components/showcase/builder";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readBuilderSources() {
  const main = read("src/components/showcase/BuilderShowcase.tsx");
  const modules = fs
    .readdirSync(path.join(root, builderModuleDir))
    .filter((name) => /\.tsx?$/.test(name))
    .map((name) => read(`${builderModuleDir}/${name}`))
    .join("\n");
  return `${main}\n${modules}`;
}

const typesSource = [
  "src/components/showcase/builder/types-canvas.ts",
  "src/components/showcase/builder/types-project.ts",
  "src/components/showcase/builder/types-release.ts",
  "src/components/showcase/builder/types.ts",
]
  .map((p) => read(p))
  .join("\n");
const builderSource = readBuilderSources();
const templateDir = "src-tauri/src/generated_templates";
const runtimeSource = [
  read("src-tauri/src/generated_app_runtime.rs"),
  ...fs
    .readdirSync(path.join(root, templateDir))
    .filter((name) => name.endsWith(".rs"))
    .map((name) => read(`${templateDir}/${name}`)),
].join("\n");

function extractRequired(source, pattern, label) {
  const match = source.match(pattern);
  if (!match?.[1]) {
    throw new Error(`Could not locate ${label}.`);
  }
  return match[1];
}

function unique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function quotedValues(source) {
  return unique([...source.matchAll(/"([^"]+)"/g)].map((match) => match[1]));
}

function reportMissing(label, expected, actual) {
  const actualSet = new Set(actual);
  const missing = expected.filter((value) => !actualSet.has(value));
  if (missing.length > 0) {
    console.error(`${label} is missing ${missing.length} component type(s):`);
    for (const value of missing) {
      console.error(`  - ${value}`);
    }
  }
  return missing;
}

const requiredDesktopControlGroups = {
  "qt-layout": [
    "frame",
    "group-box",
    "spacer",
    "divider",
    "split-view",
    "splitter",
    "size-grip",
    "supporting-pane",
    "scroll-area",
    "stacked-pages",
    "dock-panel",
    "mdi-area",
    "accordion",
    "tool-box",
  ],
  "qt-inputs": [
    "button",
    "button-group",
    "dialog-button-box",
    "command-link-button",
    "menu-button",
    "split-button",
    "tool-button",
    "toggle-button",
    "toggle-group",
    "icon-button",
    "input",
    "password-field",
    "number-field",
    "spin-box",
    "double-spin-box",
    "dial",
    "textarea",
    "plain-text-edit",
    "rich-text-editor",
    "code-editor",
    "search-bar",
    "search-view",
    "filter-bar",
    "tag-input",
    "checkbox",
    "checkbox-group",
    "radio",
    "radio-group",
    "switch",
    "slider",
    "range-slider",
    "rating",
    "scroll-bar",
    "color-picker",
    "color-swatch-grid",
    "file-picker",
    "folder-picker",
    "shortcut-recorder",
    "select",
    "multi-select",
    "combobox",
    "autocomplete",
    "font-combo-box",
    "date-picker",
    "date-range-picker",
    "time-picker",
    "date-time-picker",
    "calendar-widget",
    "calendar-scheduler",
    "segmented",
    "chips",
    "assist-chip",
    "filter-chip",
    "input-chip",
    "suggestion-chip",
  ],
  "desktop-navigation": [
    "tabs",
    "menu-bar",
    "ribbon-bar",
    "menu",
    "context-menu",
    "list",
    "list-view",
    "column-view",
    "icon-view",
    "command-list",
    "command-palette",
    "notification-center",
    "system-tray",
    "activity-bar",
    "shortcut-table",
    "resource-browser",
    "task-list",
    "settings-list",
    "tree-view",
    "tree-table",
    "outline-view",
    "signal-slot-editor",
    "node-graph",
    "log-viewer",
    "problems-panel",
    "breakpoints-panel",
    "watch-panel",
    "call-stack",
    "property-browser",
    "layer-panel",
    "breadcrumb-bar",
    "pagination",
    "top-app-bar",
    "bottom-app-bar",
    "navigation-bar",
    "navigation-suite",
    "status-bar",
    "toolbar",
    "floating-toolbar",
    "navigation",
    "navigation-drawer",
    "navigation-rail",
  ],
  "md3-feedback": [
    "card",
    "carousel",
    "empty-state",
    "empty-panel",
    "dialog",
    "popover",
    "side-sheet",
    "bottom-sheet",
    "stepper",
    "wizard",
    "banner",
    "alert",
    "tooltip",
    "snackbar",
    "toast",
    "fab",
    "extended-fab",
    "elevated-card",
    "filled-card",
    "outlined-card",
    "progress",
    "circular-progress",
  ],
  "md3-composition-details": [
    "list-item",
    "navigation-item",
    "search-suggestion-list",
    "sheet-drag-handle",
    "section-header",
    "progress-list",
  ],
  "desktop-data-display": [
    "badge",
    "avatar",
    "avatar-group",
    "stat",
    "lcd-display",
    "chart-view",
    "image-list",
    "table",
    "table-view",
    "kanban-board",
    "data-grid",
    "property-grid",
    "key-value-list",
    "inspector-section",
    "form-layout",
    "console-panel",
    "terminal-view",
    "timeline",
    "status-indicator",
    "heading",
    "label",
    "link-label",
    "text-browser",
    "help-viewer",
    "image",
    "web-view",
    "asset-grid",
    "media-player",
    "pdf-viewer",
    "map-view",
    "graphics-view",
  ],
};

const typeBlock = extractRequired(
  typesSource,
  /export type BuilderComponentType =([\s\S]*?);/,
  "BuilderComponentType union",
);
const paletteBlock = extractRequired(
  builderSource,
  /const palette: ComponentDefinition\[] = \[([\s\S]*?)\n\];/,
  "component palette",
);

const componentTypes = quotedValues(typeBlock);
const rawPaletteTypes = [...paletteBlock.matchAll(/type: "([^"]+)"/g)].map((match) => match[1]);
const paletteTypes = unique(rawPaletteTypes);
const builderPreviewTypes = unique([...builderSource.matchAll(/item\.type === "([^"]+)"/g)].map((match) => match[1]));
const runtimeTypes = unique([...runtimeSource.matchAll(/item\.type === "([^"]+)"/g)].map((match) => match[1]));

const failures = [
  ...reportMissing("Palette", componentTypes, paletteTypes),
  ...reportMissing("Builder preview", componentTypes, builderPreviewTypes),
  ...reportMissing("Generated runtime", componentTypes, runtimeTypes),
];

const requiredDesktopControlTypes = unique(Object.values(requiredDesktopControlGroups).flat());
failures.push(...reportMissing("Required desktop UI control set", requiredDesktopControlTypes, componentTypes));
for (const [group, requiredTypes] of Object.entries(requiredDesktopControlGroups)) {
  failures.push(...reportMissing(`Required desktop UI group '${group}'`, requiredTypes, paletteTypes));
}

const duplicatePaletteTypes = rawPaletteTypes.filter((type, index) => rawPaletteTypes.indexOf(type) !== index);
if (duplicatePaletteTypes.length > 0) {
  console.error("Palette has duplicate component type(s):");
  for (const value of unique(duplicatePaletteTypes)) {
    console.error(`  - ${value}`);
  }
  failures.push(...duplicatePaletteTypes);
}

if (failures.length > 0) {
  process.exit(1);
}

console.log(
  `Component coverage ok: ${componentTypes.length} types, ${paletteTypes.length} palette entries, ${builderPreviewTypes.length} builder branches, ${runtimeTypes.length} runtime branches, ${requiredDesktopControlTypes.length} required desktop controls.`,
);
