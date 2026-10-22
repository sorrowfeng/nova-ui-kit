import assert from "node:assert/strict";
import {
  buildProjectSaveManifestItems,
  type ProjectSaveManifestInput,
} from "../src/components/showcase/builder/project-save-manifest";
import {
  buildProjectFileRouteGroups,
  buildProjectSourceOverviewRows,
  type ProjectFileRouteGroupsInput,
  type ProjectSourceOverviewInput,
} from "../src/components/showcase/builder/project-source-models";
import type { DesignerFile, DesignerProject, EditorProjectCheckpoint } from "../src/components/showcase/builder/types-project";

const checkpoint: EditorProjectCheckpoint = {
  id: "cp-1",
  label: "save",
  created_at: "2026-10-22T00:00:00Z",
  path: "/tmp/cp-1",
  project_name: "demo",
  file_count: 1,
  command_count: 0,
};

const file = {
  id: "file-1",
  name: "Main",
  page: { width: 1280, height: 720, windowKind: "single", title: "Main" },
  items: [],
} as unknown as DesignerFile;

const project = {
  id: "proj-1",
  name: "demo",
  description: "",
  rootPath: "/tmp/demo",
  assets: [],
  stateVariables: [],
  rustCommands: [],
  rustLogic: "",
  rustModules: [],
  cargoDependencies: [],
  backendIntegrations: [],
  files: [file],
  activeFileId: "file-1",
  releaseConfig: {
    windowKind: "single",
    titlebarStyle: "system",
    windowTitle: "demo",
    windowWidth: 1280,
    windowHeight: 720,
    titlebarSubtitle: "",
    version: "0.1.0",
  },
  createdAt: "2026-10-22T00:00:00Z",
  updatedAt: "2026-10-22T00:00:00Z",
} as unknown as DesignerProject;

const saveInput: ProjectSaveManifestInput = {
  activeProject: project,
  diskCheckpoints: [checkpoint],
};

const routeInput: ProjectFileRouteGroupsInput = {
  activeProject: project,
  diskCheckpoints: [checkpoint],
};

const overviewInput: ProjectSourceOverviewInput = {
  activeProject: project,
  activeFile: file,
  fileSaveStates: new Map([
    [
      "file-1",
      { fileId: "file-1", currentFingerprint: "a", savedFingerprint: "a", dirty: false },
    ],
  ]),
  projectSettingsDirty: false,
  projectSourceDirty: false,
  rustLogicDirty: false,
  diskCheckpoints: [checkpoint],
};

function uniqueIds(rows: Array<{ id: string }>, label: string) {
  const ids = rows.map((row) => row.id);
  assert.equal(new Set(ids).size, ids.length, `${label}: ids must be unique`);
}

// --- buildProjectSaveManifestItems ---
{
  const items = buildProjectSaveManifestItems(saveInput);
  assert.ok(items.length >= 4, "save manifest covers source/generated/metadata scopes");
  uniqueIds(items, "save manifest");
  for (const item of items) {
    assert.ok(item.title.length > 0, `save manifest ${item.id}: title required`);
    assert.ok(item.path.length > 0, `save manifest ${item.id}: path required`);
    assert.ok(item.icon, `save manifest ${item.id}: icon required`);
    assert.ok(["source", "generated", "metadata"].includes(item.scope), `save manifest ${item.id}: scope`);
  }
  const checkpoints = items.find((item) => item.id === "nova-checkpoints");
  assert.ok(checkpoints, "save manifest keeps the .nova checkpoints row");
  assert.match(checkpoints.detail, /1 个磁盘版本/, "checkpoint count is reflected in the row detail");
}

// --- buildProjectFileRouteGroups ---
{
  const groups = buildProjectFileRouteGroups(routeInput);
  assert.equal(groups.length, 3, "route map has source/generated/metadata groups");
  uniqueIds(groups, "route groups");
  for (const group of groups) {
    assert.ok(group.countLabel.length > 0, `route group ${group.id}: countLabel required`);
    assert.ok(group.routes.length > 0, `route group ${group.id}: at least one route`);
    uniqueIds(group.routes, `route group ${group.id} routes`);
    for (const route of group.routes) {
      assert.ok(route.path.length > 0, `route ${route.id}: path required`);
      assert.ok(route.query.length > 0, `route ${route.id}: query required`);
      assert.ok(route.icon, `route ${route.id}: icon required`);
    }
  }
  const metadata = groups.find((group) => group.id === "metadata");
  assert.ok(metadata, "metadata group present");
  assert.ok(
    metadata.routes.some((route) => /checkpoints/.test(route.path)),
    "metadata group routes to the checkpoints folder",
  );
}

// --- buildProjectSourceOverviewRows ---
{
  const rows = buildProjectSourceOverviewRows(overviewInput);
  assert.ok(rows.length >= 4, "source overview lists UI/rust/generated/metadata rows");
  uniqueIds(rows, "source overview rows");
  for (const row of rows) {
    assert.ok(row.title.length > 0, `source row ${row.id}: title required`);
    assert.ok(row.relativePath.length > 0, `source row ${row.id}: relativePath required`);
    assert.ok(["clean", "dirty", "pending", "generated"].includes(row.status), `source row ${row.id}: status`);
    assert.ok(row.icon, `source row ${row.id}: icon required`);
    assert.ok(row.query.length > 0, `source row ${row.id}: query required`);
  }
  const rustRow = rows.find((row) => row.id === "source-rust-logic-overview");
  assert.ok(rustRow, "rust logic row present");
  assert.equal(rustRow.status, "clean", "a saved rust logic row is clean");

  const dirty = buildProjectSourceOverviewRows({ ...overviewInput, rustLogicDirty: true });
  const dirtyRustRow = dirty.find((row) => row.id === "source-rust-logic-overview");
  assert.ok(dirtyRustRow, "rust logic row present when dirty");
  assert.equal(dirtyRustRow.status, "dirty", "an unsaved rust logic row is dirty");
  assert.equal(dirtyRustRow.statusLabel, "未保存", "dirty rust logic row is labelled 未保存");
}

console.log("project-file-models ok: save manifest, route groups and source overview contracts hold.");
