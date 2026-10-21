import { useState } from "react";
import { Check, GitMerge, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ConflictHunk = {
  ours: string;
  theirs: string;
  start_line: number;
};

export type ConflictFile = {
  path: string;
  hunks: ConflictHunk[];
};

/**
 * Side-by-side conflict merge editor (D2).
 * For each hunk the user picks ours / theirs / both.
 */
export function ConflictMergeEditor({
  file,
  onResolve,
  onClose,
}: {
  file: ConflictFile;
  onResolve: (resolution: "ours" | "theirs" | "both") => void;
  onClose: () => void;
}) {
  const [choices, setChoices] = useState<Record<number, "ours" | "theirs" | "both">>({});

  const pick = (index: number, value: "ours" | "theirs" | "both") => {
    setChoices((c) => ({ ...c, [index]: value }));
  };

  return (
    <div
      className="fixed inset-0 z-[140] flex items-start justify-center bg-scrim/40 p-4 pt-[6vh]"
      data-builder-conflict-merge=""
      role="dialog"
      aria-modal="true"
      aria-label={`合并冲突 ${file.path}`}
    >
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-m3-3">
        <div className="flex items-center gap-2 border-b border-outline-variant px-4 py-3">
          <GitMerge aria-hidden className="size-4 text-primary" />
          <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface">{file.path}</h2>
          <Badge variant="destructive">{file.hunks.length} 处冲突</Badge>
          <button
            type="button"
            className="focus-ring flex size-7 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
            aria-label="关闭合并编辑器"
            onClick={onClose}
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {file.hunks.map((hunk, index) => (
            <section
              key={index}
              className="overflow-hidden rounded-xl border border-outline-variant"
              data-builder-conflict-hunk={index}
              data-builder-conflict-line={hunk.start_line}
            >
              <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container px-3 py-1.5">
                <span className="text-[0.68rem] text-on-surface-variant">第 {hunk.start_line} 行</span>
                <div className="ml-auto flex gap-1">
                  {(["ours", "theirs", "both"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={cn(
                        "focus-ring h-6 rounded-full px-2 text-[0.62rem] font-medium",
                        choices[index] === value
                          ? "bg-primary-container text-primary-container-foreground"
                          : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest",
                      )}
                      data-builder-conflict-pick={`${index}-${value}`}
                      onClick={() => pick(index, value)}
                    >
                      {value === "ours" ? "保留本方" : value === "theirs" ? "采用对方" : "两者都留"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 divide-y divide-outline-variant md:grid-cols-2 md:divide-x md:divide-y-0">
                <div className="min-w-0">
                  <div className="border-b border-outline-variant bg-primary/5 px-3 py-1 text-[0.62rem] font-medium text-primary">
                    本方（ours）
                  </div>
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap p-3 font-mono text-[0.68rem] text-on-surface">
                    {hunk.ours || "（空）"}
                  </pre>
                </div>
                <div className="min-w-0">
                  <div className="border-b border-outline-variant bg-destructive/5 px-3 py-1 text-[0.62rem] font-medium text-destructive">
                    对方（theirs）
                  </div>
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap p-3 font-mono text-[0.68rem] text-on-surface">
                    {hunk.theirs || "（空）"}
                  </pre>
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-outline-variant px-4 py-3">
          <p className="text-[0.68rem] text-on-surface-variant">
            未选择的冲突将默认保留本方。解决后文件会去掉冲突标记。
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onResolve("ours")}>
              全部本方
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onResolve("theirs")}>
              全部对方
            </Button>
            <Button
              size="sm"
              onClick={() => onResolve("both")}
              data-builder-conflict-apply=""
            >
              <Check aria-hidden className="size-4" />
              应用合并
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
