import { useMemo } from "react";
import type { GeneratedDiffLine, GeneratedFilePreviewEntry } from "./types-project";

/**
 * Line-level diff preview for a planned generated file (P0-2).
 * Added lines are highlighted green with `+`, removed lines red with `-`;
 * the plain `preview` text is used when the entry has no diff (e.g. copies).
 */
export function GeneratedDiffView({ entry }: { entry: GeneratedFilePreviewEntry }) {
  const hasDiff = entry.diff_lines.length > 0;
  const rows = useMemo(() => groupRows(entry.diff_lines), [entry.diff_lines]);

  if (!hasDiff) {
    return (
      <pre className="max-h-[320px] overflow-auto rounded-xl bg-surface-container-highest p-3 font-mono text-[0.68rem] leading-5 text-on-surface-variant">
        {entry.preview}
      </pre>
    );
  }

  return (
    <div className="max-h-[320px] overflow-auto rounded-xl bg-surface-container-highest" data-builder-generated-diff="">
      <table className="w-full border-collapse font-mono text-[0.68rem] leading-5">
        <caption className="sr-only">{entry.relative_path} 的行级差异</caption>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              data-builder-generated-diff-line={row.kind}
              className={DIFF_ROW_CLASS[row.kind] ?? DIFF_ROW_CLASS.context}
            >
              <td className="w-10 select-none px-2 text-right align-top text-[0.62rem] text-on-surface-variant/70">
                {row.old_line ?? ""}
              </td>
              <td className="w-10 select-none px-2 text-right align-top text-[0.62rem] text-on-surface-variant/70">
                {row.new_line ?? ""}
              </td>
              <td className="w-4 select-none px-1 align-top text-[0.68rem] font-semibold">
                {row.marker}
              </td>
              <td className="whitespace-pre-wrap break-all px-2 py-0.5 align-top text-on-surface">
                {row.text === "" ? " " : row.text}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {entry.diff_truncated ? (
        <p className="border-t border-outline-variant px-3 py-2 text-[0.68rem] text-on-surface-variant">
          差异行数较多，仅显示前 {entry.diff_lines.length} 行（完整统计见 +/− 计数）。
        </p>
      ) : null}
    </div>
  );
}

type DiffRow = {
  key: string;
  kind: GeneratedDiffLine["kind"];
  text: string;
  old_line: number | null;
  new_line: number | null;
  marker: string;
};

const DIFF_MARKER: Record<string, string> = {
  add: "+",
  remove: "−",
  context: " ",
};

const DIFF_ROW_CLASS: Record<string, string> = {
  add: "bg-primary/12 text-on-surface",
  remove: "bg-destructive/12 text-on-surface",
  context: "text-on-surface-variant",
};

function groupRows(lines: GeneratedDiffLine[]): DiffRow[] {
  return lines.map((line, index) => ({
    key: `${index}-${line.kind}-${line.old_line ?? ""}-${line.new_line ?? ""}`,
    kind: line.kind,
    text: line.text,
    old_line: line.old_line,
    new_line: line.new_line,
    marker: DIFF_MARKER[line.kind] ?? " ",
  }));
}
