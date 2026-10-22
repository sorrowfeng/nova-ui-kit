import { useCallback, useMemo, useRef, useState } from "react";
import { Check, GitMerge, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDialogFocus } from "@/lib/dialog-focus";

type ConflictHunk = {
  ours: string;
  theirs: string;
  start_line: number;
};

export type ConflictFile = {
  path: string;
  hunks: ConflictHunk[];
};

/** Per-hunk merge choice. `both` concatenates ours then theirs. */
type ConflictResolution = "ours" | "theirs" | "both";

const RESOLUTIONS: readonly ConflictResolution[] = ["ours", "theirs", "both"];

const RESOLUTION_LABEL: Record<ConflictResolution, string> = {
  ours: "保留本方",
  theirs: "采用对方",
  both: "两者都留",
};

/** Keyboard shortcuts: 1/2/3 pick ours/theirs/both on the focused hunk. */
const RESOLUTION_KEYS: Record<string, ConflictResolution> = {
  Digit1: "ours",
  Digit2: "theirs",
  Digit3: "both",
  Numpad1: "ours",
  Numpad2: "theirs",
  Numpad3: "both",
};

/**
 * Side-by-side conflict merge editor (D2).
 * Each hunk is resolved independently, then the whole set is written back
 * (P0-1: per-hunk application). Keys 1/2/3 pick a side, Tab/Shift+Tab move
 * between hunks (P1-6).
 */
export function ConflictMergeEditor({
  file,
  onResolve,
  onClose,
}: {
  file: ConflictFile;
  onResolve: (resolutions: ConflictResolution[]) => void;
  onClose: () => void;
}) {
  const [choices, setChoices] = useState<Record<number, ConflictResolution>>({});
  const [activeHunk, setActiveHunk] = useState(0);
  const hunkRefs = useRef<Array<HTMLElement | null>>([]);
  // Mounted and unmounted by the parent, so treat mount as "open".
  const dialogRef = useDialogFocus(true);

  const resolutions = useMemo<ConflictResolution[]>(
    () =>
      file.hunks.map((_, index) => choices[index] ?? "ours"),
    [file.hunks, choices],
  );

  const pick = useCallback((index: number, value: ConflictResolution) => {
    setChoices((c) => ({ ...c, [index]: value }));
    setActiveHunk(index);
  }, []);

  const focusHunk = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, file.hunks.length - 1));
    setActiveHunk(clamped);
    hunkRefs.current[clamped]?.focus();
  }, [file.hunks.length]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const resolution = RESOLUTION_KEYS[event.key] ?? RESOLUTION_KEYS[event.code];
      if (resolution) {
        event.preventDefault();
        pick(activeHunk, resolution);
        return;
      }
      if (event.key === "ArrowDown" && event.altKey) {
        event.preventDefault();
        focusHunk(activeHunk + 1);
        return;
      }
      if (event.key === "ArrowUp" && event.altKey) {
        event.preventDefault();
        focusHunk(activeHunk - 1);
      }
    },
    [activeHunk, focusHunk, pick],
  );

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="focus-ring fixed inset-0 z-[140] flex items-start justify-center bg-scrim/40 p-4 pt-[6vh]"
      data-builder-conflict-merge=""
      role="dialog"
      aria-modal="true"
      aria-label={`合并冲突 ${file.path}`}
      onKeyDown={handleKeyDown}
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
              ref={(node) => {
                hunkRefs.current[index] = node;
              }}
              tabIndex={activeHunk === index ? 0 : -1}
              className={cn(
                "overflow-hidden rounded-xl border border-outline-variant focus-ring",
                activeHunk === index ? "border-primary" : undefined,
              )}
              data-builder-conflict-hunk={index}
              data-builder-conflict-line={hunk.start_line}
              data-builder-conflict-choice={resolutions[index]}
              onFocus={() => setActiveHunk(index)}
            >
              <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container px-3 py-1.5">
                <span className="text-[0.68rem] text-on-surface-variant">
                  第 {hunk.start_line} 行
                  <span className="ml-2 rounded-full bg-surface-container-high px-1.5 py-0.5 text-[0.6rem]">
                    {index + 1}/{file.hunks.length}
                  </span>
                </span>
                <div className="ml-auto flex gap-1">
                  {RESOLUTIONS.map((value, keyIndex) => (
                    <button
                      key={value}
                      type="button"
                      className={cn(
                        "focus-ring h-6 rounded-full px-2 text-[0.62rem] font-medium",
                        resolutions[index] === value
                          ? "bg-primary-container text-primary-container-foreground"
                          : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest",
                      )}
                      data-builder-conflict-pick={`${index}-${value}`}
                      title={`快捷键 ${keyIndex + 1}`}
                      onClick={() => pick(index, value)}
                    >
                      <kbd className="mr-1 rounded bg-surface-container-highest px-1 text-[0.58rem] opacity-70">
                        {keyIndex + 1}
                      </kbd>
                      {RESOLUTION_LABEL[value]}
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
            每个冲突可单独选择；未选择的默认保留本方。快捷键 1/2/3 选择，Alt+↑/↓ 切换冲突。
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button
              size="sm"
              variant="secondary"
              data-builder-conflict-apply-all-ours=""
              onClick={() => onResolve(file.hunks.map(() => "ours" as ConflictResolution))}
            >
              全部本方
            </Button>
            <Button
              size="sm"
              variant="secondary"
              data-builder-conflict-apply-all-theirs=""
              onClick={() => onResolve(file.hunks.map(() => "theirs" as ConflictResolution))}
            >
              全部对方
            </Button>
            <Button
              size="sm"
              onClick={() => onResolve(resolutions)}
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
