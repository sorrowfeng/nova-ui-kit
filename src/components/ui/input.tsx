import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "sm" | "md" | "lg";
  invalid?: boolean;
}

const sizeClass = {
  sm: "h-[var(--control-sm)] px-2.5 text-xs",
  md: "h-[var(--control-md)] px-3 text-sm",
  lg: "h-[var(--control-lg)] px-4 text-base",
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputSize = "md", invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "focus-ring flex w-full rounded-xl border border-transparent bg-surface-container-highest text-on-surface shadow-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-on-surface-variant hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-primary",
          sizeClass[inputSize],
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
Input.displayName = "Input";

export { Input };
