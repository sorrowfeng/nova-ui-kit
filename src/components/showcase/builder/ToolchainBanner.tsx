import { AlertTriangle } from "lucide-react";

export type ToolchainStatus = {
  ok: boolean;
  missing: string[];
  nodeVersion: string;
  npmVersion: string;
  cargoVersion: string;
  rustcVersion: string;
};

export function ToolchainBanner({ status }: { status: ToolchainStatus | null }) {
  if (!status || status.ok) return null;
  return (
    <div
      className="fixed left-1/2 top-2 z-[130] w-[min(32rem,calc(100%-2rem))] -translate-x-1/2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-on-surface shadow-m3-2"
      data-builder-toolchain-banner=""
      data-builder-toolchain-missing={status.missing.join(",")}
      role="status"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">构建环境不完整</p>
          <p className="mt-0.5 text-on-surface-variant">
            缺少：{status.missing.join("、")}。请安装 Node.js（含 npm）与 Rust 工具链后再点「运行」。
          </p>
          <p className="mt-0.5 font-mono text-[0.62rem] text-on-surface-variant">
            node {status.nodeVersion || "—"} · npm {status.npmVersion || "—"} · cargo {status.cargoVersion || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
