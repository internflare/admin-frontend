import type { ReactNode } from "react";
import { AlertTriangleIcon, InboxIcon, RotateCwIcon, ShieldOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="min-w-0 divide-y divide-border overflow-hidden" role="status" aria-busy="true" aria-label="Loading records">
      <span className="sr-only">Loading records</span>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3">
          {Array.from({ length: columns }).map((__, c) => (
            <Skeleton key={c} className={cn("h-4 min-w-0 flex-1", c === 0 && "max-w-40")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading page">
      <span className="sr-only">Loading page</span>
      <Skeleton className="h-8 w-64 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

export function SessionSkeleton({ login = false }: { login?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      <div aria-hidden="true" className="flex h-16 items-center justify-between border-b px-5 sm:px-8">
        <Skeleton className="h-8 w-36" /><Skeleton className="size-9 rounded-full" />
      </div>
      {login ? (
        <div role="status" aria-busy="true" aria-label="Loading sign-in" className="mx-auto max-w-sm space-y-6 px-5 py-20">
          <span className="sr-only">Loading sign-in</span>
          <Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-full" />
          <Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8"><PageSkeleton /></div>
      )}
    </div>
  );
}

interface StateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-12 text-center", className)}>
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <InboxIcon className="size-5" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Couldn't load records", description, onRetry, className }: Partial<StateProps> & { onRetry?: () => void }) {
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center gap-2 px-6 py-12 text-center", className)}>
      <span className="flex size-10 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <AlertTriangleIcon className="size-5" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{description ?? "The admin service did not respond. No data was changed."}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2 bg-background" onClick={onRetry}>
          <RotateCwIcon className="mr-1.5 size-3.5" /> Retry
        </Button>
      )}
    </div>
  );
}

export function AccessDenied({ permissionLabel, roleLabel }: { permissionLabel: string; roleLabel: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <ShieldOffIcon className="size-6" />
      </span>
      <h2 className="text-lg font-semibold">You don't have access to this module</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Your role <span className="font-medium text-foreground">{roleLabel}</span> does not include the
        “{permissionLabel}” permission. Ask a super administrator to review your role if you need access.
      </p>
      <p className="text-xs text-muted-foreground">Access attempts are recorded in the audit log.</p>
    </div>
  );
}
