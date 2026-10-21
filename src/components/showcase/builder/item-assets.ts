import { convertFileSrc } from "@tauri-apps/api/core";
import type { BuilderItem, DesignerAsset } from "./types-project";

/** True when running inside the Tauri desktop shell (vs plain browser). */
export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/** Resolve the asset record an image/file item points at. */
export function assetForItem(item: BuilderItem, assets: DesignerAsset[]): DesignerAsset | null {
  return assets.find((asset) => asset.id === item.props.assetId) ?? null;
}

/**
 * Browser-usable source for an item's image. Absolute/remote/data sources are
 * returned as-is; local Tauri paths are converted via the asset protocol.
 */
export function imageSourceForItem(item: BuilderItem, assets: DesignerAsset[]): string {
  const asset = assetForItem(item, assets);
  const source = asset?.sourcePath || item.props.assetPath || asset?.publicPath || "";
  if (!source || /^(https?:|data:|blob:|\/)/i.test(source) || !isTauriRuntime()) {
    return source;
  }
  return convertFileSrc(source);
}
