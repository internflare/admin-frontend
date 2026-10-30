import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRightIcon, ArrowUpRightIcon, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type MetricKind = "current" | "period" | "estimate" | "unavailable";

const KIND_LABEL: Record<MetricKind, string> = {
  current: "Current",
  period: "Period total",
  estimate: "Estimate",
  unavailable: "Unavailable",
};

interface MetricCardProps {
  label: string;
  value: ReactNode;
  kind?: MetricKind;
  delta?: number;
  /** When true, a negative delta is good (e.g. failed payments). */
  invertDelta?: boolean;
  deltaLabel?: string;
  icon?: LucideIcon;
  href?: string;
  footnote?: string;
  definition?: string;
}

export function MetricCard({
  label, value, kind = "current", delta, invertDelta, deltaLabel = "vs previous period", icon: Icon, href, footnote, definition,
}: MetricCardProps) {
  const positive = delta !== undefined && (invertDelta ? delta < 0 : delta > 0);
  const content = (
    <Card
      className={cn(
        "group flex h-full flex-col gap-3 p-4 shadow-xs transition-colors",
        href && "hover:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Icon className="size-3.5" />
            </span>
          )}
          {definition ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-xs font-medium text-muted-foreground underline decoration-dotted underline-offset-4">{label}</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-64 text-xs">{definition}</TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          )}
        </div>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            kind === "estimate" && "bg-[#997fff]/10 text-[#5b3fd1] dark:text-[#c4b5ff]",
            kind === "unavailable" && "bg-muted text-muted-foreground",
            (kind === "current" || kind === "period") && "text-muted-foreground",
          )}
        >
          {KIND_LABEL[kind]}
        </span>
      </div>
      <div className={cn("text-2xl font-semibold tabular-nums tracking-tight", kind === "unavailable" && "text-muted-foreground")}>
        {kind === "unavailable" ? "—" : value}
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        {delta !== undefined && kind !== "unavailable" ? (
          <>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
              )}
            >
              {delta >= 0 ? <ArrowUpRightIcon className="size-3" /> : <ArrowDownRightIcon className="size-3" />}
              {Math.abs(delta).toFixed(1)}%
            </span>
            <span>{deltaLabel}</span>
          </>
        ) : (
          <span>{footnote ?? (kind === "unavailable" ? "Source not connected" : " ")}</span>
        )}
      </div>
    </Card>
  );
  return href ? (
    <Link to={href} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {content}
    </Link>
  ) : (
    content
  );
}
