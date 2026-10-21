export const NOVA_EDITOR_COMMAND_EVENT = "nova-editor-command";

export type NovaEditorCommand =
  | "new-project"
  | "open-project"
  | "save-project"
  | "undo"
  | "redo"
  | "copy-selection"
  | "mode-project"
  | "mode-design"
  | "mode-logic"
  | "mode-build"
  | "quick-check-all"
  | "run-selected-event"
  | "run-output-exe"
  | "build-exe"
  | "bundle-installer"
  | "open-app-settings"
  | "open-project-settings"
  | "open-build-output"
  | "open-project-files"
  | "help-guide"
  | "project-templates"
  | "open-sample"
  | "open-template"
  | "show-shortcuts"
  | "show-onboarding"
  | "canvas-find"
  | "preview-run";

export type NovaEditorCommandEventDetail = {
  command: NovaEditorCommand;
  /** Template id for `open-template` (see builder/project-templates.ts). */
  templateId?: string;
};

export function dispatchNovaEditorCommand(command: NovaEditorCommand, templateId?: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent<NovaEditorCommandEventDetail>(NOVA_EDITOR_COMMAND_EVENT, {
      detail: templateId ? { command, templateId } : { command },
    }),
  );
}
