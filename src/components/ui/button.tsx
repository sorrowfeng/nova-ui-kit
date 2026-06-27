import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring m3-state-layer inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-normal transition-all disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-m3-1 hover:shadow-m3-2 active:shadow-none",
        secondary:
          "bg-secondary-container text-secondary-container-foreground hover:shadow-m3-1",
        destructive:
          "bg-destructive text-destructive-foreground shadow-m3-1 hover:shadow-m3-2 active:shadow-none",
        outline:
          "border border-outline bg-transparent text-primary shadow-none",
        ghost: "bg-transparent text-primary shadow-none",
        subtle:
          "bg-surface-container-high text-on-surface shadow-m3-1 hover:shadow-m3-2",
      },
      size: {
        sm: "h-[var(--control-sm)] px-4 text-xs",
        md: "h-[var(--control-md)] px-6",
        lg: "h-[var(--control-lg)] px-7 text-base",
        icon: "size-[var(--control-md)]",
        "icon-sm": "size-[var(--control-sm)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 aria-hidden className="animate-spin" /> : null}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
