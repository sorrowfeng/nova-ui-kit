import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ShowcaseHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  tags: string[];
};

export function ShowcaseHeader({ eyebrow, title, description, tags }: ShowcaseHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 rounded-[28px] bg-primary-container p-6 text-primary-container-foreground shadow-m3-1 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p className="mb-2 text-sm font-medium opacity-80">{eyebrow}</p>
        <h1 className="text-3xl font-medium tracking-normal md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        {tags.slice(0, 5).map((tag) => (
          <Badge key={tag} variant="outline" className="border-primary-container-foreground/25 text-primary-container-foreground">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

type ShowcaseSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
};

export function ShowcaseSection({ title, description, children, action }: ShowcaseSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-medium">{title}</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

type PreviewCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function PreviewCard({ title, description, children, className, bodyClassName }: PreviewCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="border-b border-outline-variant p-5">
        <CardTitle className="flex items-center gap-2 text-sm">
          {title}
          <ArrowUpRight aria-hidden className="size-3.5 text-on-surface-variant" />
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn("p-5", bodyClassName)}>{children}</CardContent>
    </Card>
  );
}

export function PreviewGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-[var(--panel-gap)] lg:grid-cols-2", className)}>{children}</div>;
}

export function ComponentStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-[var(--panel-gap)]", className)}>{children}</div>;
}
