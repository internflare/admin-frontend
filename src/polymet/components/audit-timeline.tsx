import { BotIcon, UserIcon, ShieldIcon } from "lucide-react";
import { formatDateTime } from "@/polymet/lib/format";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  at: string;
  actor: string;
  actorType?: "Admin" | "System" | "User";
  title: string;
  detail?: string;
  from?: string;
  to?: string;
  tone?: "default" | "danger" | "success";
}

export function AuditTimeline({ events, emptyLabel = "No history recorded." }: { events: TimelineEvent[]; emptyLabel?: string }) {
  if (events.length === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {events.map((e) => {
        const Icon = e.actorType === "System" ? BotIcon : e.actorType === "Admin" ? ShieldIcon : UserIcon;
        return (
          <li key={e.id} className="relative">
            <span
              className={cn(
                "absolute -left-[29px] top-0 flex size-6 items-center justify-center rounded-full border bg-background",
                e.tone === "danger" && "border-red-300 text-red-600",
                e.tone === "success" && "border-emerald-300 text-emerald-600",
              )}
            >
              <Icon className="size-3" />
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="text-sm font-medium">{e.title}</p>
              <time className="text-xs text-muted-foreground tabular-nums">{formatDateTime(e.at)}</time>
            </div>
            <p className="text-xs text-muted-foreground">by {e.actor}</p>
            {(e.from || e.to) && (
              <p className="mt-1 text-xs">
                {e.from && <span className="rounded bg-muted px-1.5 py-0.5 line-through decoration-muted-foreground/60">{e.from}</span>}
                {e.from && e.to && <span className="mx-1 text-muted-foreground">→</span>}
                {e.to && <span className="rounded bg-accent px-1.5 py-0.5 text-accent-foreground">{e.to}</span>}
              </p>
            )}
            {e.detail && <p className="mt-1 text-sm text-muted-foreground">{e.detail}</p>}
          </li>
        );
      })}
    </ol>
  );
}
