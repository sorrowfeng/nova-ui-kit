import type { BuilderItemProps } from "./types-project";
import { clamp } from "./layout";

/** Non-empty option texts for select/segmented style controls. */
export function itemOptionTexts(props: BuilderItemProps): string[] {
  return [props.optionA, props.optionB, props.optionC]
    .map((option) => option?.trim())
    .filter((option): option is string => Boolean(option));
}

/** Clamp a coerced number into 0-100 (progress, zoom-style props). */
export function numericPercent(value: unknown, fallback = 50): number {
  const parsed = Number(value);
  return Math.round(clamp(Number.isFinite(parsed) ? parsed : fallback, 0, 100));
}
