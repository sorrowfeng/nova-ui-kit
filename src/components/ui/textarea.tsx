import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "focus-ring flex min-h-24 w-full rounded-xl border border-transparent bg-surface-container-highest px-4 py-3 text-sm text-on-surface shadow-none transition-colors placeholder:text-on-surface-variant hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-primary",
          invalid && "border-destructive focus-visible:ring-destructive",
          className,
        )}
        ref={ref}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
