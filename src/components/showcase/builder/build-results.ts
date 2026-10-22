import type { GeneratedFileChangeSummary } from "./types";

export function normalizeGeneratedFileChangeSummary(value: unknown): GeneratedFileChangeSummary | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const source = value as Partial<GeneratedFileChangeSummary>;
  const totalCount = Math.max(0, Number(source.total_count ?? 0));
  const changedCount = Math.max(0, Number(source.changed_count ?? 0));
  const createdCount = Math.max(0, Number(source.created_count ?? 0));
  const updatedCount = Math.max(0, Number(source.updated_count ?? 0));
  const unchangedCount = Math.max(0, Number(source.unchanged_count ?? Math.max(0, totalCount - changedCount)));
  const assetCount = Math.max(0, Number(source.asset_count ?? 0));
  return {
    summary:
      typeof source.summary === "string" && source.summary.trim()
        ? source.summary
        : `${totalCount} 个生成目标 · ${changedCount} 已变更 · ${unchangedCount} 未变更`,
    total_count: totalCount,
    changed_count: changedCount,
    created_count: createdCount,
    updated_count: updatedCount,
    unchanged_count: unchangedCount,
    asset_count: assetCount,
  };
}
