// What ShellView pulls out of the builder scope bag.
//
// The bag is still open (see the index signature) — closing all ~1090 keys is
// the rest of phase 2. What is closed here are the four mode-view components,
// because that is the half the per-view key sets cannot reach on their own:
// ShellView receives ProjectView and friends *through* the bag, so without a
// declared type every `<ProjectView scope={{...}} />` is a call on `any` and
// the 108-key literal beside it is never checked.
//
// A declared property wins over the index signature, so these four stay typed
// while every other name keeps flowing as any. Values stay any for the same
// reason as in scope-*.ts: closing the keys and typing the values are two
// jobs, and mixing them makes a failure impossible to attribute.
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from "react";
import type { ProjectViewScope } from "./scope-project";
import type { DesignViewScope } from "./scope-design";
import type { LogicViewScope } from "./scope-logic";
import type { BuildViewScope } from "./scope-build";

export type ShellViewScope = {
  ProjectView: ComponentType<{ scope: ProjectViewScope }>;
  DesignView: ComponentType<{ scope: DesignViewScope }>;
  LogicView: ComponentType<{ scope: LogicViewScope }>;
  BuildView: ComponentType<{ scope: BuildViewScope }>;
  [key: string]: any;
};
