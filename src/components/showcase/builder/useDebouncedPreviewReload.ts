import { useEffect, useRef } from "react";

export type DebouncedPreviewReloadOptions = {
  /** Master switch (the preview dock's auto-refresh toggle). */
  enabled: boolean;
  /** Fingerprint of the design inputs the preview is generated from. */
  signature: string;
  /** Only auto-reload when a preview already exists — never kick one off. */
  hasPreview: boolean;
  /** Quiet period after the last edit before regenerating. */
  delayMs?: number;
  /** Called once the debounce window elapses. */
  onReload: () => void;
};

export const PREVIEW_RELOAD_DEBOUNCE_MS = 1200;

/**
 * Debounced auto-reload for the live preview (P1-7).
 *
 * Fires `onReload` once the design signature has been quiet for `delayMs`.
 * Mounting, toggling the switch, or enabling the preview never triggers a
 * reload on its own — only a real design change does.
 */
export function useDebouncedPreviewReload({
  enabled,
  signature,
  hasPreview,
  delayMs = PREVIEW_RELOAD_DEBOUNCE_MS,
  onReload,
}: DebouncedPreviewReloadOptions): void {
  const lastSignatureRef = useRef(signature);
  const onReloadRef = useRef(onReload);

  useEffect(() => {
    onReloadRef.current = onReload;
  }, [onReload]);

  useEffect(() => {
    const changed = lastSignatureRef.current !== signature;
    lastSignatureRef.current = signature;

    if (!changed || !enabled || !hasPreview) {
      return;
    }
    const timer = window.setTimeout(() => onReloadRef.current(), delayMs);
    return () => window.clearTimeout(timer);
  }, [signature, enabled, hasPreview, delayMs]);
}
