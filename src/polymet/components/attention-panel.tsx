import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { PriorityBadge } from "@/polymet/components/status-badge";
import { SectionCard } from "@/polymet/components/section-card";
import type { ActionItem } from "@/polymet/data/operations-data";
import { formatRelative } from "@/polymet/lib/format";

interface AttentionPanelProps {
  items: ActionItem[];
  limit?: number;
}

/** Actionable operational items; each row links to its management page. */
export function AttentionPanel({ items, limit = 8 }: AttentionPanelProps) {
  const open = items.filter((i) => i.status !== "Resolved");
  return (
    <SectionCard
      title="Operational attention"
      description={`${open.length} open items across the ecosystem`}
      action={
        <Link to="/action-queue" className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 hover:underline dark:text-orange-400">
          Action queue <ArrowRightIcon className="size-3" />
        </Link>
      }
      contentClassName="p-0"
    >
      <ul className="divide-y border-t">
        {open.slice(0, limit).map((item) => (
          <li key={item.id}>
            <Link
              to={item.href}
              className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted focus-visible:outline-none"
            >
              <div className="w-[68px] shrink-0 pt-0.5">
                <PriorityBadge priority={item.priority} />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm leading-snug">{item.summary}</p>
                <p className="text-xs text-muted-foreground">
                  {item.recordType} · <span className="font-mono">{item.recordRef}</span> · {formatRelative(item.createdAt)}
                </p>
              </div>
              <span className="hidden shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground sm:inline-flex">
                {item.nextAction}
                <ArrowRightIcon className="size-3" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
