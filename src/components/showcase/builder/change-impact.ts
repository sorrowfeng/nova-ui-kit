import type {
  DesignerFile,
  DesignerProject,
  GeneratedFilePreviewEntry,
  GeneratedFilePreviewResult,
  ProjectDependencySourceReference,
} from "./types";
import type { ProjectJumpActionId } from "./task-center";

export type ProjectChangeImpactStatus = "needs-preview" | "stale" | "dirty" | "clean";

export type ProjectChangeScopeId =
  | "project"
  | "ui"
  | "frontend"
  | "rust"
  | "assets"
  | "backend"
  | "release"
  | "validation";

export type ProjectChangeScopeStatus = "unknown" | "dirty" | "clean";

export type ProjectChangeScope = {
  id: ProjectChangeScopeId;
  label: string;
  status: ProjectChangeScopeStatus;
  changedCount: number;
  totalCount: number;
  paths: string[];
  examples: string[];
  sourceRefs: ProjectDependencySourceReference[];
  summary: string;
  nextActions: ProjectJumpActionId[];
};

export type ProjectChangeImpactSummary = {
  status: ProjectChangeImpactStatus;
  currentSnapshotHash: string;
  previewSnapshotHash?: string;
  previewRootPath?: string;
  previewIsStale: boolean;
  changedCount: number;
  totalCount: number;
  dirtyScopeCount: number;
  scopes: ProjectChangeScope[];
  recommendedActions: ProjectJumpActionId[];
  executionPlan: ProjectChangeImpactPlan;
  summary: string;
};

export type ProjectChangeImpactPlan = {
  id: string;
  title: string;
  detail: string;
  badge: string;
  actions: ProjectJumpActionId[];
  scopeIds: ProjectChangeScopeId[];
  ready: boolean;
};

export type ProjectReverseDependencyTargetKind =
  | "project"
  | "ui-file"
  | "control"
  | "generated-runtime"
  | "rust-command"
  | "rust-module"
  | "cargo-dependency"
  | "asset"
  | "backend-integration"
  | "release-config"
  | "validation";

export type ProjectReverseDependencyTarget = {
  id: string;
  kind: ProjectReverseDependencyTargetKind;
  label: string;
  detail: string;
  fileId?: string;
  itemId?: string;
  commandId?: string;
  moduleId?: string;
  dependencyId?: string;
  assetId?: string;
  integrationId?: string;
  path?: string;
};

export type ProjectReverseDependencyStatus = "empty" | "tracked" | "persisted" | "projected";

export type ProjectReverseDependencySummary = {
  target: ProjectReverseDependencyTarget | null;
  status: ProjectReverseDependencyStatus;
  scopeIds: ProjectChangeScopeId[];
  affectedPaths: string[];
  plannedActions: ProjectJumpActionId[];
  matches: ProjectDependencySourceReference[];
  sourceCount: number;
  summary: string;
};

type ProjectChangeScopeDefinition = {
  id: ProjectChangeScopeId;
  label: string;
  cleanSummary: string;
  dirtySummary: (count: number) => string;
  nextActions: ProjectJumpActionId[];
};

const scopeDefinitions: ProjectChangeScopeDefinition[] = [
  {
    id: "project",
    label: "Project schema",
    cleanSummary: "Project manifest and generated project docs are in sync.",
    dirtySummary: (count) => `${count} project metadata target(s) need writing.`,
    nextActions: ["save-project", "apply-generated-changes"],
  },
  {
    id: "ui",
    label: "UI files",
    cleanSummary: "UI JSON and generated project data are in sync.",
    dirtySummary: (count) => `${count} UI/data target(s) changed.`,
    nextActions: ["apply-generated-changes", "quick-check-frontend", "validate-window"],
  },
  {
    id: "frontend",
    label: "Frontend runtime",
    cleanSummary: "Generated React/Vite runtime targets are in sync.",
    dirtySummary: (count) => `${count} frontend runtime target(s) changed.`,
    nextActions: ["apply-generated-changes", "quick-check-frontend"],
  },
  {
    id: "rust",
    label: "Rust/native",
    cleanSummary: "Rust logic, modules, Cargo, and source-map targets are in sync.",
    dirtySummary: (count) => `${count} Rust/native target(s) changed.`,
    nextActions: ["apply-generated-changes", "quick-check-rust"],
  },
  {
    id: "assets",
    label: "Assets/icons",
    cleanSummary: "Project assets, copied public assets, and icons are in sync.",
    dirtySummary: (count) => `${count} asset/icon target(s) need copying.`,
    nextActions: ["apply-generated-changes", "quick-check-frontend", "validate-window"],
  },
  {
    id: "backend",
    label: "Backend integrations",
    cleanSummary: "Backend integration handoff, wrappers, and bundled resources are in sync.",
    dirtySummary: (count) => `${count} backend integration target(s) changed.`,
    nextActions: ["build-backend-artifacts", "apply-generated-changes", "quick-check-rust"],
  },
  {
    id: "release",
    label: "Release package",
    cleanSummary: "Package metadata, Tauri config, signing-facing targets, and bundle resources are in sync.",
    dirtySummary: (count) => `${count} release packaging target(s) changed.`,
    nextActions: ["apply-generated-changes", "quick-check-all", "build-exe"],
  },
  {
    id: "validation",
    label: "Validation tooling",
    cleanSummary: "Generated validation helpers are in sync.",
    dirtySummary: (count) => `${count} validation helper target(s) changed.`,
    nextActions: ["apply-generated-changes", "quick-check-frontend", "validate-window"],
  },
];

type ProjectReverseDependencyScopeInput = {
  id: string;
  label?: string;
  status?: string;
  paths?: string[];
  sourceRefs?: ProjectDependencySourceReference[];
  nextActions?: ProjectJumpActionId[];
};

function uniqueActions(actions: ProjectJumpActionId[]) {
  return actions.filter((action, index) => actions.indexOf(action) === index);
}

function uniqueStrings(values: string[]) {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index);
}

function isProjectChangeScopeId(value: string): value is ProjectChangeScopeId {
  return scopeDefinitions.some((definition) => definition.id === value);
}

function scopeDefinitionForId(id: ProjectChangeScopeId) {
  return scopeDefinitions.find((definition) => definition.id === id)!;
}

function reverseDependencyFallbackScopeIds(target: ProjectReverseDependencyTarget): ProjectChangeScopeId[] {
  if (target.kind === "project") {
    return ["project", "ui", "frontend", "rust", "backend", "release", "validation"];
  }
  if (target.kind === "ui-file" || target.kind === "control") {
    return ["ui", "frontend", "validation"];
  }
  if (target.kind === "generated-runtime") {
    return ["frontend", "validation"];
  }
  if (target.kind === "rust-command" || target.kind === "rust-module" || target.kind === "cargo-dependency") {
    return ["rust", "backend", "release"];
  }
  if (target.kind === "asset") {
    return ["assets", "ui", "frontend", "release"];
  }
  if (target.kind === "backend-integration") {
    return ["backend", "rust", "release"];
  }
  if (target.kind === "release-config") {
    return ["release"];
  }
  return ["validation"];
}

function reverseDependencyFallbackPaths(target: ProjectReverseDependencyTarget) {
  const paths: string[] = target.path ? [target.path] : [];
  if (target.kind === "project") {
    paths.push("nova.project.json", "README.md", "app/package.json");
  }
  if (target.kind === "ui-file" || target.kind === "control") {
    paths.push(target.path || "ui/*.ui.json", "app/src/project-data.ts", "app/src/App.tsx");
  }
  if (target.kind === "generated-runtime") {
    paths.push("app/src/App.tsx", "app/src/project-data.ts", "app/src/index.css");
  }
  if (target.kind === "rust-command") {
    paths.push("app/src-tauri/src/commands.rs", "app/src/project-data.ts");
  }
  if (target.kind === "rust-module") {
    paths.push(target.path || "app/src-tauri/src/*.rs", "app/src-tauri/src/lib.rs");
  }
  if (target.kind === "cargo-dependency") {
    paths.push("app/src-tauri/Cargo.toml", "app/src-tauri/Cargo.lock");
  }
  if (target.kind === "asset") {
    paths.push(target.path || "assets/*", "app/public/assets/*", "app/src/project-data.ts");
  }
  if (target.kind === "backend-integration") {
    paths.push(target.path || "backend/*", "app/src-tauri/src/backend_integrations.rs", "app/src-tauri/resources/*");
  }
  if (target.kind === "release-config") {
    paths.push("app/src-tauri/tauri.conf.json", "app/package.json", "app/src-tauri/Cargo.toml");
  }
  if (target.kind === "validation") {
    paths.push("app/scripts/capture-window.mjs", "validation/*");
  }
  return uniqueStrings(paths).slice(0, 16);
}

function sourceReferenceMatchesTarget(source: ProjectDependencySourceReference, target: ProjectReverseDependencyTarget) {
  if (source.kind === target.kind && (source.id === target.id || source.id.endsWith(target.id))) {
    return true;
  }
  if (target.kind === "control") {
    return Boolean(target.itemId && source.itemId === target.itemId);
  }
  if (target.kind === "ui-file") {
    return Boolean(target.fileId && source.fileId === target.fileId);
  }
  if (target.kind === "rust-command") {
    return Boolean(target.commandId && source.commandId === target.commandId);
  }
  if (target.kind === "rust-module") {
    return Boolean(target.moduleId && source.moduleId === target.moduleId);
  }
  if (target.kind === "cargo-dependency") {
    return Boolean(target.dependencyId && source.dependencyId === target.dependencyId);
  }
  if (target.kind === "asset") {
    return Boolean(target.assetId && source.assetId === target.assetId);
  }
  if (target.kind === "backend-integration") {
    return Boolean(target.integrationId && source.integrationId === target.integrationId);
  }
  return source.kind === target.kind;
}

function mergeReverseDependencySources(sources: ProjectDependencySourceReference[]) {
  const byId = new Map<string, ProjectDependencySourceReference>();
  for (const source of sources) {
    const key = `${source.kind}:${source.id}`;
    const existing = byId.get(key);
    byId.set(
      key,
      existing
        ? {
            ...existing,
            affectedPaths: uniqueStrings([...existing.affectedPaths, ...source.affectedPaths]).slice(0, 16),
          }
        : {
            ...source,
            affectedPaths: uniqueStrings(source.affectedPaths).slice(0, 16),
          },
    );
  }
  return Array.from(byId.values()).slice(0, 12);
}

export function createProjectReverseDependencySummary(
  target: ProjectReverseDependencyTarget | null,
  currentScopes: ProjectReverseDependencyScopeInput[],
  persistedScopes: ProjectReverseDependencyScopeInput[] = [],
): ProjectReverseDependencySummary {
  if (!target) {
    return {
      target: null,
      status: "empty",
      scopeIds: [],
      affectedPaths: [],
      plannedActions: [],
      matches: [],
      sourceCount: 0,
      summary: "Select a UI object or backend source to inspect its generated-file impact.",
    };
  }

  const currentMatches = currentScopes.flatMap((scope) =>
    scope.status === "unknown"
      ? []
      : (scope.sourceRefs ?? [])
          .filter((source) => sourceReferenceMatchesTarget(source, target))
          .map((source) => ({ scope, source })),
  );
  const persistedMatches = persistedScopes.flatMap((scope) =>
    (scope.sourceRefs ?? [])
      .filter((source) => sourceReferenceMatchesTarget(source, target))
      .map((source) => ({ scope, source })),
  );
  const matchedScopes = [...currentMatches, ...persistedMatches].map((match) => match.scope);
  const fallbackScopeIds = reverseDependencyFallbackScopeIds(target);
  const matchedScopeIds = matchedScopes.map((scope) => scope.id).filter(isProjectChangeScopeId);
  const scopeIds = uniqueStrings([...matchedScopeIds, ...fallbackScopeIds]).filter(isProjectChangeScopeId);
  const matchedSources = mergeReverseDependencySources([...currentMatches, ...persistedMatches].map((match) => match.source));
  const affectedPaths = uniqueStrings([
    ...matchedSources.flatMap((source) => source.affectedPaths),
    ...matchedScopes.flatMap((scope) => scope.paths ?? []),
    ...reverseDependencyFallbackPaths(target),
  ]).slice(0, 16);
  const plannedActions = uniqueActions([
    ...currentMatches.flatMap((match) => match.scope.nextActions ?? []),
    ...scopeIds.flatMap((scopeId) => scopeDefinitionForId(scopeId).nextActions),
  ]).slice(0, 8);
  const status: ProjectReverseDependencyStatus =
    currentMatches.length > 0 ? "tracked" : persistedMatches.length > 0 ? "persisted" : "projected";
  const scopeLabel = scopeIds.map((scopeId) => scopeDefinitionForId(scopeId).label).slice(0, 4).join(", ");
  const source =
    status === "tracked"
      ? "current preview"
      : status === "persisted"
        ? "persisted graph"
        : "project model";

  return {
    target,
    status,
    scopeIds,
    affectedPaths,
    plannedActions,
    matches: matchedSources,
    sourceCount: matchedSources.length,
    summary: `${target.label} affects ${scopeIds.length} scope(s) from ${source}${scopeLabel ? `: ${scopeLabel}` : ""}.`,
  };
}

function scopeIsDirty(scopes: ProjectChangeScope[], id: ProjectChangeScopeId) {
  return scopes.some((scope) => scope.id === id && scope.status === "dirty");
}

function createExecutionPlan(
  project: DesignerProject,
  status: ProjectChangeImpactStatus,
  dirtyScopes: ProjectChangeScope[],
  changedCount: number,
): ProjectChangeImpactPlan {
  if (status === "needs-preview" || status === "stale") {
    return {
      id: "impact-refresh",
      title: "Refresh impact preview",
      detail:
        status === "stale"
          ? "The project changed after the last generated-file preview. Refresh before applying generated targets."
          : "Run a generated-file preview so Nova can compute dirty scopes and a scoped execution plan.",
      badge: "refresh",
      actions: ["preview-generated-files"],
      scopeIds: [],
      ready: true,
    };
  }

  if (status === "clean") {
    return {
      id: "impact-verify",
      title: "Verify synced project",
      detail: "Generated targets are in sync. Run checks, validate the window, and build the exe from the current project state.",
      badge: "verify",
      actions: ["quick-check-all", "validate-window", "build-exe"],
      scopeIds: [],
      ready: true,
    };
  }

  const scopeIds = dirtyScopes.map((scope) => scope.id);
  const needsFrontend = scopeIsDirty(dirtyScopes, "ui") || scopeIsDirty(dirtyScopes, "frontend") || scopeIsDirty(dirtyScopes, "assets") || scopeIsDirty(dirtyScopes, "validation");
  const needsRust = scopeIsDirty(dirtyScopes, "rust") || scopeIsDirty(dirtyScopes, "backend") || scopeIsDirty(dirtyScopes, "release");
  const needsValidation = scopeIsDirty(dirtyScopes, "ui") || scopeIsDirty(dirtyScopes, "assets") || scopeIsDirty(dirtyScopes, "frontend") || scopeIsDirty(dirtyScopes, "validation");
  const needsReleaseBuild = scopeIsDirty(dirtyScopes, "release");
  const actions: ProjectJumpActionId[] = [];

  if (scopeIsDirty(dirtyScopes, "project")) {
    actions.push("save-project");
  }
  if (scopeIsDirty(dirtyScopes, "backend")) {
    actions.push("build-backend-artifacts");
  }
  actions.push("apply-generated-changes");
  if (needsFrontend && needsRust) {
    actions.push("quick-check-all");
  } else if (needsFrontend) {
    actions.push("quick-check-frontend");
  } else if (needsRust) {
    actions.push("quick-check-rust");
  }
  if (needsValidation) {
    actions.push("validate-window");
  }
  if (needsReleaseBuild) {
    actions.push("build-exe");
  }

  return {
    id: "impact-scoped",
    title: "Run scoped impact plan",
    detail: `${changedCount} generated target(s) changed across ${dirtyScopes.length} scope(s). Nova will apply changes and run only the checks implied by those scopes.`,
    badge: "impact",
    actions: uniqueActions(actions),
    scopeIds,
    ready: actions.length > 0,
  };
}

function normalizedPath(entry: Pick<GeneratedFilePreviewEntry, "relative_path">) {
  return entry.relative_path.replace(/\\/g, "/").toLowerCase();
}

function normalizedText(value = "") {
  return value.replace(/\\/g, "/").toLowerCase();
}

function fileStem(value = "") {
  return normalizedText(value)
    .split("/")
    .pop()
    ?.replace(/\.[^.]+$/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") ?? "";
}

function sourceKey(source: ProjectDependencySourceReference) {
  return [
    source.kind,
    source.fileId,
    source.itemId,
    source.commandId,
    source.moduleId,
    source.dependencyId,
    source.assetId,
    source.integrationId,
    source.path,
    source.id,
  ]
    .filter(Boolean)
    .join(":");
}

function pushSourceRef(
  sources: Map<string, ProjectDependencySourceReference>,
  source: ProjectDependencySourceReference,
) {
  const key = sourceKey(source);
  const existing = sources.get(key);
  if (!existing) {
    sources.set(key, {
      ...source,
      affectedPaths: Array.from(new Set(source.affectedPaths)).slice(0, 12),
    });
    return;
  }
  sources.set(key, {
    ...existing,
    affectedPaths: Array.from(new Set([...existing.affectedPaths, ...source.affectedPaths])).slice(0, 12),
  });
}

function changedPaths(entries: GeneratedFilePreviewEntry[]) {
  return entries.map((entry) => entry.relative_path);
}

function entriesForFile(entries: GeneratedFilePreviewEntry[], file: DesignerFile) {
  const filePath = normalizedText(file.path || `ui/${file.name}.json`);
  const nameStem = fileStem(file.name.replace(/\.ui$/i, ""));
  return entries.filter((entry) => {
    const path = normalizedPath(entry);
    return path === filePath || path.startsWith(`${filePath}.`) || (path.startsWith("ui/") && fileStem(path) === nameStem);
  });
}

function sourceRefsForScope(
  project: DesignerProject,
  scopeId: ProjectChangeScopeId,
  dirtyEntries: GeneratedFilePreviewEntry[],
): ProjectDependencySourceReference[] {
  const sources = new Map<string, ProjectDependencySourceReference>();
  const paths = changedPaths(dirtyEntries);
  const fallbackPaths = paths.length ? paths : ["generated target plan"];

  if (scopeId === "project") {
    pushSourceRef(sources, {
      id: `project-${project.id}`,
      kind: "project",
      label: project.name,
      detail: `${project.files.length} UI files, ${project.rustCommands.length} commands, ${project.assets.length} assets`,
      affectedPaths: fallbackPaths,
    });
  }

  if (scopeId === "ui") {
    const directFiles = project.files.filter((file) => entriesForFile(dirtyEntries, file).length > 0);
    const files = directFiles.length > 0 ? directFiles : project.files;
    for (const file of files.slice(0, 8)) {
      const fileEntries = entriesForFile(dirtyEntries, file);
      const affectedPaths = fileEntries.length ? changedPaths(fileEntries) : fallbackPaths;
      pushSourceRef(sources, {
        id: `ui-file-${file.id}`,
        kind: "ui-file",
        label: file.name,
        detail: `${file.items.length} controls in ${file.path}`,
        affectedPaths,
        fileId: file.id,
        path: file.path,
      });
      for (const item of file.items.slice(0, 6)) {
        pushSourceRef(sources, {
          id: `control-${item.id}`,
          kind: "control",
          label: item.name,
          detail: `${item.type} in ${file.name}`,
          affectedPaths,
          fileId: file.id,
          itemId: item.id,
          path: file.path,
        });
      }
    }
  }

  if (scopeId === "frontend") {
    pushSourceRef(sources, {
      id: "generated-react-runtime",
      kind: "generated-runtime",
      label: "Generated React runtime",
      detail: "Runtime App.tsx/styles/project-data targets used by the generated app.",
      affectedPaths: fallbackPaths,
    });
  }

  if (scopeId === "rust") {
    for (const module of project.rustModules.filter((module) => module.enabled).slice(0, 10)) {
      const moduleEntries = dirtyEntries.filter((entry) => normalizedPath(entry).includes(`/${module.name.toLowerCase()}.rs`) || normalizedPath(entry).endsWith(`${module.name.toLowerCase()}.rs`));
      if (moduleEntries.length === 0 && dirtyEntries.some((entry) => entry.kind === "rust-module")) {
        continue;
      }
      pushSourceRef(sources, {
        id: `rust-module-${module.id}`,
        kind: "rust-module",
        label: module.name,
        detail: "Project Rust module",
        affectedPaths: moduleEntries.length ? changedPaths(moduleEntries) : fallbackPaths,
        moduleId: module.id,
        path: `rust/modules/${module.name}.rs`,
      });
    }
    for (const command of project.rustCommands.slice(0, 10)) {
      pushSourceRef(sources, {
        id: `rust-command-${command.id}`,
        kind: "rust-command",
        label: command.name,
        detail: command.backendIntegrationId ? "Command bound to backend integration" : "Project Tauri command",
        affectedPaths: fallbackPaths,
        commandId: command.id,
        path: "rust/logic.rs",
      });
    }
    for (const dependency of project.cargoDependencies.filter((dependency) => dependency.enabled).slice(0, 8)) {
      pushSourceRef(sources, {
        id: `cargo-dependency-${dependency.id}`,
        kind: "cargo-dependency",
        label: dependency.name,
        detail: `Cargo dependency v${dependency.version}`,
        affectedPaths: fallbackPaths,
        dependencyId: dependency.id,
        path: "rust/dependencies.json",
      });
    }
  }

  if (scopeId === "assets") {
    const allAssetRegistryChanged = dirtyEntries.some((entry) => normalizedPath(entry).endsWith("assets/assets.json"));
    for (const asset of project.assets.slice(0, 10)) {
      const assetName = fileStem(asset.name || asset.publicPath || asset.sourcePath);
      const assetEntries = dirtyEntries.filter((entry) => {
        const path = normalizedPath(entry);
        return path.includes(assetName) || path.includes(fileStem(asset.publicPath)) || path.includes(fileStem(asset.sourcePath));
      });
      if (!allAssetRegistryChanged && assetEntries.length === 0 && dirtyEntries.some((entry) => entry.kind === "asset" || entry.kind === "icon")) {
        continue;
      }
      pushSourceRef(sources, {
        id: `asset-${asset.id}`,
        kind: "asset",
        label: asset.name,
        detail: asset.sourcePath || asset.publicPath,
        affectedPaths: assetEntries.length ? changedPaths(assetEntries) : fallbackPaths,
        assetId: asset.id,
        path: asset.sourcePath || asset.publicPath,
      });
    }
  }

  if (scopeId === "backend") {
    for (const integration of project.backendIntegrations.filter((integration) => integration.enabled).slice(0, 10)) {
      const integrationName = fileStem(integration.name);
      const resourcePath = normalizedText(integration.resourcePath);
      const artifactPath = normalizedText(integration.artifactPath);
      const integrationEntries = dirtyEntries.filter((entry) => {
        const path = normalizedPath(entry);
        return path.includes(integrationName) || (resourcePath && path.includes(resourcePath)) || (artifactPath && path.includes(fileStem(artifactPath)));
      });
      pushSourceRef(sources, {
        id: `backend-${integration.id}`,
        kind: "backend-integration",
        label: integration.name,
        detail: `${integration.kind} · ${integration.language} · ${integration.transport}`,
        affectedPaths: integrationEntries.length ? changedPaths(integrationEntries) : fallbackPaths,
        integrationId: integration.id,
        path: integration.artifactPath || integration.entryPath || integration.resourcePath,
      });
    }
  }

  if (scopeId === "release") {
    pushSourceRef(sources, {
      id: "release-config",
      kind: "release-config",
      label: `${project.releaseConfig.appName} v${project.releaseConfig.version}`,
      detail: `${project.releaseConfig.bundleTargets} · ${project.releaseConfig.signingMode}`,
      affectedPaths: fallbackPaths,
    });
  }

  if (scopeId === "validation") {
    pushSourceRef(sources, {
      id: "validation-runtime",
      kind: "validation",
      label: "Generated window validation",
      detail: "Capture script, breakpoint validation, and visual/runtime audit artifacts.",
      affectedPaths: fallbackPaths,
    });
  }

  return Array.from(sources.values()).slice(0, 24);
}

function scopeIdsForEntry(entry: GeneratedFilePreviewEntry): ProjectChangeScopeId[] {
  const path = normalizedPath(entry);
  const kind = entry.kind.toLowerCase();
  const scopes = new Set<ProjectChangeScopeId>();

  if (kind === "manifest" || kind === "docs" || path === "nova.project.json" || path === "readme.md") {
    scopes.add("project");
  }
  if (kind === "ui" || path.startsWith("ui/") || path === "app/src/project-data.ts") {
    scopes.add("ui");
  }
  if (kind === "app" || kind === "app-data" || path.startsWith("app/src/") || path.startsWith("app/scripts/")) {
    scopes.add("frontend");
  }
  if (kind === "rust" || kind === "rust-module" || kind === "rust-source-map" || kind === "cargo" || path.includes("src-tauri/src/")) {
    scopes.add("rust");
  }
  if (kind === "asset" || kind === "icon" || path.startsWith("assets/") || path.includes("/assets/") || path.includes("/icons/")) {
    scopes.add("assets");
  }
  if (kind === "backend" || kind === "backend-resource" || path.startsWith("backend/") || path.includes("backend_integrations")) {
    scopes.add("backend");
  }
  if (
    kind === "tauri" ||
    kind === "cargo" ||
    kind === "icon" ||
    path === "app/package.json" ||
    path === "app/index.html" ||
    path.includes("tauri.conf.json") ||
    path.includes("src-tauri/cargo.toml") ||
    path.includes("src-tauri/resources/")
  ) {
    scopes.add("release");
  }
  if (kind === "validation" || path.includes("capture-window") || path.includes("validation")) {
    scopes.add("validation");
  }

  if (scopes.size === 0) {
    scopes.add("project");
  }
  return Array.from(scopes);
}

function scopeSummary(definition: ProjectChangeScopeDefinition, preview: GeneratedFilePreviewResult | null, changedCount: number) {
  if (!preview) {
    return "Run generated-file preview to compute this scope.";
  }
  return changedCount > 0 ? definition.dirtySummary(changedCount) : definition.cleanSummary;
}

export function createProjectChangeImpact(
  project: DesignerProject,
  preview: GeneratedFilePreviewResult | null,
  currentSnapshotHash: string,
  previewSnapshotHash = "",
): ProjectChangeImpactSummary {
  const changedEntries = preview?.entries.filter((entry) => entry.changed) ?? [];
  const previewIsStale = Boolean(preview && previewSnapshotHash && previewSnapshotHash !== currentSnapshotHash);

  const scopes = scopeDefinitions.map((definition): ProjectChangeScope => {
    const scopedEntries = preview?.entries.filter((entry) => scopeIdsForEntry(entry).includes(definition.id)) ?? [];
    const dirtyEntries = scopedEntries.filter((entry) => entry.changed);
    const changedCount = dirtyEntries.length;
    const status: ProjectChangeScopeStatus = preview ? (changedCount > 0 ? "dirty" : "clean") : "unknown";
    const paths = dirtyEntries.map((entry) => entry.relative_path);
    return {
      id: definition.id,
      label: definition.label,
      status,
      changedCount,
      totalCount: scopedEntries.length,
      paths,
      examples: paths.slice(0, 3),
      sourceRefs: sourceRefsForScope(project, definition.id, dirtyEntries),
      summary: scopeSummary(definition, preview, changedCount),
      nextActions: definition.nextActions,
    };
  });

  const dirtyScopes = scopes.filter((scope) => scope.status === "dirty");
  const status: ProjectChangeImpactStatus = !preview
    ? "needs-preview"
    : previewIsStale
      ? "stale"
      : changedEntries.length > 0
        ? "dirty"
        : "clean";
  const recommendedActions: ProjectJumpActionId[] =
    status === "needs-preview" || status === "stale"
      ? ["preview-generated-files"]
        : changedEntries.length > 0
          ? uniqueActions([
              "apply-generated-changes",
              ...dirtyScopes.flatMap((scope) => scope.nextActions.filter((action) => action !== "apply-generated-changes")),
            ]).slice(0, 6)
        : ["quick-check-all", "validate-window", "build-exe"];
  const executionPlan = createExecutionPlan(project, status, dirtyScopes, changedEntries.length);

  const summary =
    status === "needs-preview"
      ? `${project.name} needs a generated-file preview before Nova can compute scoped invalidation.`
      : status === "stale"
        ? `${project.name} changed after the last preview; refresh to avoid applying stale generated targets.`
        : status === "dirty"
          ? `${changedEntries.length} generated target(s) changed across ${dirtyScopes.length} scope(s).`
          : `${project.name} generated targets are in sync with the last preview.`;

  return {
    status,
    currentSnapshotHash,
    previewSnapshotHash: previewSnapshotHash || undefined,
    previewRootPath: preview?.root_path,
    previewIsStale,
    changedCount: changedEntries.length,
    totalCount: preview?.entries.length ?? 0,
    dirtyScopeCount: dirtyScopes.length,
    scopes,
    recommendedActions,
    executionPlan,
    summary,
  };
}
