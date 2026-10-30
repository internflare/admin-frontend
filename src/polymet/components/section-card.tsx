import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({ title, description, action, children, className, contentClassName }: SectionCardProps) {
  return (
    <Card className={cn("shadow-xs", className)}>
      {(title || action) && (
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 p-4 pb-3">
          <div className="min-w-0 flex-1 space-y-1">
            {title && <CardTitle className="text-sm font-semibold">{title}</CardTitle>}
            {description && <CardDescription className="text-xs">{description}</CardDescription>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("p-4 pt-0", !title && !action && "pt-4", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

interface DetailItem {
  label: string;
  value: ReactNode;
  wide?: boolean;
}

export function DetailGrid({ items, columns = 2 }: { items: DetailItem[]; columns?: 2 | 3 }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-4", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      {items.map((item) => (
        <div key={item.label} className={cn("min-w-0 space-y-1", item.wide && "sm:col-span-full")}>
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="text-sm text-foreground break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
