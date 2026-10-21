import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProjectHealthPanel({
  fileCount,
  hasRustLogic,
  hasCommands,
  onRunCheck,
}: {
  fileCount: number;
  hasRustLogic: boolean;
  hasCommands: boolean;
  onRunCheck: () => void;
}) {
  return (
    <details
      className="group rounded-xl border border-outline-variant bg-surface-container-low p-2"
      data-builder-project-health=""
      data-builder-project-health-density="collapsed-summary"
    >
      <summary className="focus-ring flex min-h-8 cursor-pointer list-none items-center gap-2 rounded-md px-1 text-xs [&::-webkit-details-marker]:hidden">
        <ChevronRight aria-hidden className="size-3.5 text-on-surface-variant transition-transform group-open:rotate-90" />
        <span className="flex-1 font-semibold text-on-surface">项目健康检查</span>
        <Badge variant="outline">manifest / .nova / logic</Badge>
      </summary>
      <div className="mt-2 space-y-1 text-[0.68rem] text-on-surface-variant" data-builder-project-health-body="">
        <p>
          文件 {fileCount} · Rust 逻辑 {hasRustLogic ? "有" : "无"} · 命令 {hasCommands ? "有" : "无"}
        </p>
        <p>检查项目清单、schemaVersion、.nova 元数据与 rust/logic.rs 完整性。</p>
        <Button size="sm" variant="secondary" data-builder-project-health-run="" onClick={onRunCheck}>
          运行检查
        </Button>
      </div>
    </details>
  );
}
