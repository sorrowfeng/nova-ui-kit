export const NOVA_EDITOR_COMMAND_EVENT = "nova-editor-command";

export type NovaEditorCommand =
  | "new-project"
  | "open-project"
  | "save-project"
  | "undo"
  | "redo"
  | "copy-selection"
  | "mode-design"
  | "mode-logic"
  | "mode-build"
  | "mode-preview"
  | "mode-export"
  | "quick-check-all"
  | "run-selected-event"
  | "build-exe"
  | "bundle-installer"
  | "open-project-settings"
  | "open-build-output"
  | "open-project-files"
  | "help-guide"
  | "project-templates";

export type NovaEditorCommandEventDetail = {
  command: NovaEditorCommand;
};

export function dispatchNovaEditorCommand(command: NovaEditorCommand) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent<NovaEditorCommandEventDetail>(NOVA_EDITOR_COMMAND_EVENT, { detail: { command } }));
}
