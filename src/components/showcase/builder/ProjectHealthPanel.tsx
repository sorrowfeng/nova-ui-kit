import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StateLabel } from "./view-helpers";

type ProjectGitStatus = {
  clean: boolean;
  conflicted: string[];
  changed: string[];
};

export function ProjectHealthPanel({
  fileCount,
  hasRustLogic,
  hasCommands,
  onRunCheck,
  onGitSnapshot,
  onOpenConflict,
  gitStatus,
}: {
  fileCount: number;
  hasRustLogic: boolean;
  hasCommands: boolean;
  onRunCheck: () => void;
  onGitSnapshot?: () => void;
  onOpenConflict?: (filePath: string) => void;
  gitStatus?: ProjectGitStatus | null;
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
        <StateLabel label="manifest / .nova / git" />
      </summary>
      <div className="mt-2 space-y-1 text-[0.68rem] text-on-surface-variant" data-builder-project-health-body="">
        <p>
          文件 {fileCount} · Rust 逻辑 {hasRustLogic ? "有" : "无"} · 命令 {hasCommands ? "有" : "无"}
        </p>
        <p>检查项目清单、schemaVersion、.nova 元数据与 rust/logic.rs 完整性。</p>
        {gitStatus ? (
          <div
            className="rounded-lg border border-outline-variant bg-surface-container px-2 py-1"
            data-builder-git-status=""
            data-builder-git-clean={gitStatus.clean ? "true" : "false"}
          >
            {gitStatus.clean ? (
              <span className="text-primary">Git 工作区干净</span>
            ) : (
              <span className="text-on-surface-variant">
                变更 {gitStatus.changed.length}
                {gitStatus.conflicted.length > 0 ? ` · 冲突 ${gitStatus.conflicted.length}` : ""}
              </span>
            )}
            {gitStatus.conflicted.length > 0 ? (
              <ul className="mt-1 space-y-0.5">
                {gitStatus.conflicted.map((file) => (
                  <li key={file} className="truncate text-destructive">
                    {onOpenConflict ? (
                      <button
                        type="button"
                        className="focus-ring w-full truncate rounded-sm px-0.5 text-left hover:underline"
                        data-builder-git-conflict-open=""
                        onClick={() => onOpenConflict(file)}
                      >
                        {file}
                      </button>
                    ) : (
                      file
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="secondary" data-builder-project-health-run="" onClick={onRunCheck}>
            运行检查
          </Button>
          {onGitSnapshot ? (
            <Button size="sm" variant="ghost" data-builder-project-health-git="" onClick={onGitSnapshot}>
              Git 快照
            </Button>
          ) : null}
        </div>
      </div>
    </details>
  );
}
