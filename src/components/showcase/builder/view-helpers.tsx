/* eslint-disable @typescript-eslint/no-explicit-any */
// Shared presentational helpers used by the extracted builder views (P2-9).
// Kept out of BuilderShowcase so each view can import what it needs without
// pulling the monolith back in.

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Braces, CheckCircle2, ChevronDown, Download, FileImage, FileJson, FolderOpen, Layers,
  MousePointer2, Play, Save, Settings2, Wand2,
} from "lucide-react";
import type { ProjectJumpKind, ProjectTaskKind } from "./task-center";
import type { ProjectTemplateDefinition } from "./project-templates";

export function PanelTitle({ icon: Icon, title, description }: { icon: typeof Layers; title: string; description: string }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon aria-hidden className="size-4" />
      </span>
      <div className="min-w-0">
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-on-surface-variant">{description}</p>
      </div>
    </div>
  );
}

/**
 * A status token that only paints when the user has something to do.
 *
 * Routine labels ("目录", "文件", ".nova") restate what a row's icon already
 * shows. Painting them on every row buries the rows that are actually wrong,
 * so they stay in the accessible name instead of the visual field.
 */
export function SignalChip({
  label,
  signal,
  toneClass,
  className,
  children,
}: {
  label: string;
  signal: boolean;
  toneClass: string;
  className?: string;
  children?: ReactNode;
}) {
  const text = readLabel(label);
  if (!signal) {
    return <span className="sr-only">{children ?? text}</span>;
  }
  return (
    <span
      className={cn(
        "shrink-0 rounded-md border px-1.5 py-0.5 text-[0.58rem] font-medium leading-4",
        toneClass,
        className,
      )}
    >
      {children ?? text}
    </span>
  );
}

/**
 * The quiet-vs-signal rules live in view-labels.ts so the density gate's
 * regression test can import them without a JSX transform. Re-exported here so
 * view call sites keep one import.
 */
import {
  isQuietCount,
  isQuietCountLabel,
  isQuietStateLabel,
  isSignalStateLabel,
} from "./view-labels";

export {
  QUIET_STATE_LABELS,
  READOUT_STATE_LABELS,
  SIGNAL_STATE_LABELS,
  isQuietCount,
  isQuietCountLabel,
  isQuietStateLabel,
  isReadoutStateLabel,
  isSignalStateLabel,
} from "./view-labels";

/**
 * Status labels cross from domain data into the classifier, so this is the
 * validation boundary. A missing label would otherwise reach `label.trim()`
 * and blank the whole panel with a TypeError — better to name the row that is
 * actually wrong "未知" than to take the workbench down with it.
 */
const UNKNOWN_LABEL = "未知";

function readLabel(label: string): string {
  return typeof label === "string" && label.trim() !== "" ? label : UNKNOWN_LABEL;
}

/**
 * Badge wrapper that drops to screen-reader-only text for benign states and
 * for zero counts. Call sites pass the state they have; this decides whether
 * the eye needs to see it.
 */
/**
 * `signal` is the explicit override: `true` forces a chip, `false` forces the
 * accessible tree only. Leaving it out runs the three-way classifier, so a
 * label nobody has classified becomes plain text rather than defaulting to
 * decoration — the same rule `StateLabel` follows.
 */
export function StateBadge({
  label,
  signal,
  variant = "outline",
  className,
  children,
  ...rest
}: {
  label: string;
  signal?: boolean;
  variant?: "default" | "secondary" | "outline" | "destructive" | "accent";
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) {
  const text = readLabel(label);
  const chip = signal === undefined ? isSignalStateLabel(text) : signal;
  if (chip) {
    return (
      <Badge variant={variant} className={className} {...rest}>
        {children ?? text}
      </Badge>
    );
  }
  if (signal === false || isQuietStateLabel(text)) {
    return (
      <span className="sr-only" {...rest}>
        {children ?? text}
      </span>
    );
  }
  // A readout: a version, a tally, a category. Plain text, not a pill.
  return (
    <span className={cn("text-[0.68rem] text-on-surface-variant", className)} {...rest}>
      {children ?? text}
    </span>
  );
}

/**
 * A tally is something to read, not something to act on: "9 项", "27", "0 控件".
 * Painting it as a pill spends visual budget on a number the row or list it
 * summarizes already states. Zero is not news at all, so it drops out of the
 * visual field and stays in the accessible tree.
 */
export function CountReadout({
  label,
  count,
  className,
  children,
  ...rest
}: {
  label: string;
  count?: number;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) {
  const text = readLabel(label);
  const quiet = count === undefined ? isQuietCountLabel(text) : isQuietCount(count);
  if (quiet) {
    return (
      <span className="sr-only" {...rest}>
        {children ?? text}
      </span>
    );
  }
  return (
    <span
      className={cn("font-mono text-[0.68rem] tabular-nums text-on-surface-variant", className)}
      {...rest}
    >
      {children ?? text}
    </span>
  );
}

/**
 * The three-way split at the heart of the quiet rules, for labels that arrive
 * as free text. A signal paints a chip, a quiet state drops to the accessible
 * tree, and everything in between is a readout: a category or a provenance
 * note the eye can scan without having to filter a rounded box first.
 */
/**
 * `showQuiet` decides what a routine state does when it *is* the row's datum.
 * In chrome, "完成" next to a done icon is repetition and drops to the
 * accessible tree. In a status column it is the cell the user came to read, so
 * it must stay as plain text — never as a pill.
 */
export function StateLabel({
  label,
  variant = "outline",
  className,
  showQuiet = false,
  children,
  ...rest
}: {
  label: string;
  variant?: "default" | "secondary" | "outline" | "destructive" | "accent";
  className?: string;
  showQuiet?: boolean;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) {
  const text = readLabel(label);
  if (isSignalStateLabel(text)) {
    return (
      <Badge variant={variant} className={className} {...rest}>
        {children ?? text}
      </Badge>
    );
  }
  if (isQuietStateLabel(text) && !showQuiet) {
    return (
      <span className="sr-only" {...rest}>
        {children ?? text}
      </span>
    );
  }
  return (
    <span className={cn("text-[0.68rem] text-on-surface-variant", className)} {...rest}>
      {children ?? text}
    </span>
  );
}

export function ProjectJumpIcon({ kind }: { kind: ProjectJumpKind }) {
  if (kind === "action") {
    return <Play aria-hidden className="size-4" />;
  }
  if (kind === "file" || kind === "validation") {
    return <FileJson aria-hidden className="size-4" />;
  }
  if (kind === "control") {
    return <MousePointer2 aria-hidden className="size-4" />;
  }
  if (kind === "component") {
    return <Layers aria-hidden className="size-4" />;
  }
  if (kind === "rust-command") {
    return <Braces aria-hidden className="size-4" />;
  }
  if (kind === "state") {
    return <Settings2 aria-hidden className="size-4" />;
  }
  if (kind === "settings") {
    return <Settings2 aria-hidden className="size-4" />;
  }
  if (kind === "asset") {
    return <FileImage aria-hidden className="size-4" />;
  }
  if (kind === "artifact" || kind === "pipeline") {
    return <Download aria-hidden className="size-4" />;
  }
  if (kind === "maintenance") {
    return <Wand2 aria-hidden className="size-4" />;
  }
  return <FolderOpen aria-hidden className="size-4" />;
}

export function ProjectTaskIcon({ kind }: { kind: ProjectTaskKind }) {
  if (kind === "logic") {
    return <Braces aria-hidden className="size-4" />;
  }
  if (kind === "design") {
    return <MousePointer2 aria-hidden className="size-4" />;
  }
  if (kind === "generate") {
    return <FileJson aria-hidden className="size-4" />;
  }
  if (kind === "check" || kind === "validate") {
    return <CheckCircle2 aria-hidden className="size-4" />;
  }
  if (kind === "build") {
    return <Download aria-hidden className="size-4" />;
  }
  if (kind === "repair") {
    return <Wand2 aria-hidden className="size-4" />;
  }
  return <Save aria-hidden className="size-4" />;
}

export function PropertySection({
  icon: Icon,
  title,
  description,
  badge,
  open = true,
  onOpenChange,
  children,
}: {
  icon: typeof Layers;
  title: string;
  description: string;
  badge?: ReactNode;
  open?: boolean;
  onOpenChange?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[16px] border border-outline-variant bg-surface-container-high">
      <button
        type="button"
        className="focus-ring flex w-full items-start justify-between gap-3 rounded-[16px] p-2.5 text-left transition hover:bg-surface-container-low"
        aria-expanded={open}
        onClick={onOpenChange}
      >
        <span className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon aria-hidden className="size-3.5" />
          </span>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant">{title}</h4>
            <p className="mt-1 text-xs leading-5 text-on-surface-variant">{description}</p>
          </div>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {badge ? <StateLabel className="shrink-0" label={String(badge)} /> : null}
          <ChevronDown aria-hidden className={cn("size-4 text-on-surface-variant transition-transform", open && "rotate-180")} />
        </span>
      </button>
      {open ? <div className="space-y-3 px-2.5 pb-2.5">{children}</div> : null}
    </section>
  );
}

export function TemplateMiniPreview({ template, selected = false }: { template: ProjectTemplateDefinition; selected?: boolean }) {
  const active = selected ? "bg-primary/70" : "bg-on-surface-variant/50";
  return (
    <div className="mt-3 rounded-xl border border-outline-variant bg-surface-container-low p-2" data-builder-template-preview={template.id}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate text-[0.68rem] font-medium text-on-surface-variant">{template.footprint}</span>
        <span className={cn("h-1.5 w-10 rounded-full", selected ? "bg-primary" : "bg-outline-variant")} />
      </div>
      <div className="grid h-16 grid-cols-[1.2fr_0.8fr] gap-1.5 overflow-hidden">
        <div className="space-y-1.5">
          <div className={cn("h-3 rounded-md", active)} />
          <div className="grid grid-cols-3 gap-1">
            <div className={cn("h-5 rounded-md", selected ? "bg-primary/25" : "bg-outline-variant/70")} />
            <div className={cn("h-5 rounded-md", selected ? "bg-primary/20" : "bg-outline-variant/60")} />
            <div className={cn("h-5 rounded-md", selected ? "bg-primary/15" : "bg-outline-variant/50")} />
          </div>
          <div className={cn("h-4 rounded-md", selected ? "bg-primary/20" : "bg-outline-variant/60")} />
        </div>
        <div className={cn("rounded-lg", selected ? "bg-primary/15" : "bg-outline-variant/50")} />
      </div>
      <div className="mt-2 grid gap-1">
        {template.preview.map((line) => (
          <div key={line} className="flex min-w-0 items-center gap-2 text-[0.68rem] text-on-surface-variant">
            <span className={cn("size-1.5 shrink-0 rounded-full", selected ? "bg-primary" : "bg-outline")} />
            <span className="truncate">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs text-on-surface-variant">{label}</Label>
      {children}
    </div>
  );
}

export function PathRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
      <p className="break-all rounded-xl bg-surface-container-high px-3 py-2 font-mono text-[0.68rem] text-on-surface-variant">{value}</p>
    </div>
  );
}

export function NumberBox({
  label,
  value,
  onChange,
  dataAttr,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  dataAttr: "data-builder-canvas-width" | "data-builder-canvas-height";
  disabled?: boolean;
}) {
  return (
    <label className="flex h-[var(--control-sm)] items-center gap-2 rounded-full border border-outline bg-surface-container-high pl-3 pr-1 text-xs text-on-surface-variant">
      {label}
      <Input
        {...{ [dataAttr]: "" }}
        type="number"
        inputSize="sm"
        value={value}
        className="h-7 w-20 rounded-full px-2 text-xs"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
