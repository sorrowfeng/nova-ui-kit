import { useCallback, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Modal focus management (accessibility checklist 1.4 / 2.7).
 *
 * While a dialog is open keyboard focus must live inside it; when it closes,
 * focus must go back to the control that opened it. Without the restore step a
 * keyboard user is dropped onto `document.body` and has to Tab from the top.
 *
 * Returns a callback ref to attach to the dialog root.
 */
export function useDialogFocus(open: boolean): (node: HTMLElement | null) => void {
  const nodeRef = useRef<HTMLElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const setNode = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    openerRef.current = typeof document === "undefined" ? null : (document.activeElement as HTMLElement | null);

    const node = nodeRef.current;
    if (node) {
      const target = node.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? node;
      target.focus();
    }

    return () => {
      const opener = openerRef.current;
      openerRef.current = null;
      if (opener && typeof document !== "undefined" && document.contains(opener)) {
        opener.focus();
      }
    };
  }, [open]);

  return setNode;
}
