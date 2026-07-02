import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitive.Provider;
const toastViewportClassName =
  "pointer-events-none fixed left-1/2 top-[calc(3.25rem+env(safe-area-inset-top))] z-[120] flex max-h-[calc(100vh-6rem)] w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 flex-col items-stretch gap-2 outline-none";
const toastSurfaceClassName =
  "pointer-events-auto grid w-full grid-cols-[auto_1fr_auto] items-start gap-x-3 gap-y-1 overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-lowest/98 p-3 text-on-surface shadow-m3-3 backdrop-blur data-[state=open]:animate-fade-in";
const toastIconClassName =
  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary";

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(toastViewportClassName, className)}
    data-toast-viewport-placement="top-center"
    data-toast-viewport-avoids-search=""
    data-toast-viewport-unified-style=""
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(toastSurfaceClassName, className)}
    data-toast-surface-style="nova-surface"
    {...props}
  />
));
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastAction = ToastPrimitive.Action;
const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn("focus-ring m3-state-layer rounded-full p-1 text-on-surface-variant hover:text-on-surface", className)}
    toast-close=""
    {...props}
  >
    <X aria-hidden className="size-4" />
  </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description ref={ref} className={cn("text-sm leading-5 text-on-surface-variant", className)} {...props} />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  toastIconClassName,
  toastSurfaceClassName,
  toastViewportClassName,
};
