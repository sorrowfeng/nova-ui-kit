import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

type SegmentedControlProps = {
  value: string;
  options: Option[];
  onValueChange: (value: string) => void;
  "aria-label": string;
  className?: string;
};

export function SegmentedControl({
  value,
  options,
  onValueChange,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps) {
  return (
    <div
      className={cn("inline-flex h-[var(--control-md)] items-center rounded-full border border-outline bg-surface-container-high p-1", className)}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={cn(
            "focus-ring m3-state-layer h-full rounded-full px-4 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface",
            value === option.value && "bg-secondary-container text-secondary-container-foreground shadow-none",
          )}
          onClick={() => onValueChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
