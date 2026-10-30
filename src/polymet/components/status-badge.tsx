import { cn } from "@/lib/utils";

export type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "pending"
  | "neutral"
  | "brand"
  | "accent";

const TONE_CLASSES: Record<StatusTone, { wrap: string; dot: string }> = {
  success: { wrap: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20", dot: "bg-emerald-500" },
  warning: { wrap: "bg-amber-50 text-amber-800 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20", dot: "bg-amber-500" },
  danger: { wrap: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20", dot: "bg-red-500" },
  info: { wrap: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20", dot: "bg-sky-500" },
  pending: { wrap: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20", dot: "bg-violet-500" },
  neutral: { wrap: "bg-muted text-muted-foreground ring-border", dot: "bg-muted-foreground/60" },
  brand: { wrap: "bg-orange-50 text-orange-800 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20", dot: "bg-primary" },
  accent: { wrap: "bg-[#997fff]/10 text-[#5b3fd1] ring-[#997fff]/30 dark:text-[#c4b5ff]", dot: "bg-[#997fff]" },
};

const STATUS_TONES: Record<string, StatusTone> = {
  // success
  active: "success", verified: "success", published: "success", approved: "success", successful: "success",
  reconciled: "success", healthy: "success", operational: "success", connected: "success", enabled: "success",
  confirmed: "success", delivered: "success", opened: "success", succeeded: "success", completed: "success",
  provisioned: "success", hired: "success", accepted: "success", resolved: "success", reviewed: "success",
  "on track": "success", available: "success", "converted to employment": "success", success: "success",
  passed: "success", complete: "success", "stored in vault": "success",
  // warning
  "pending review": "warning", pending: "warning", "past due": "warning", degraded: "warning", paused: "warning",
  "at risk": "warning", "more info requested": "warning", "changes requested": "warning", "awaiting information": "warning",
  "awaiting info": "warning", "awaiting configuration": "warning", "partially complete": "warning", limited: "warning",
  "cancels at period end": "warning", partial: "warning", "low confidence": "warning", "rate limited": "warning",
  "at capacity": "warning", stalled: "warning", "under review": "warning", "retry queued": "warning", "in progress": "info",
  "awaiting supervisor": "warning", "needs review": "warning", investigating: "info", scheduled: "info",
  // danger
  rejected: "danger", failed: "danger", failing: "danger", suspended: "danger", restricted: "danger", outage: "danger",
  mismatch: "danger", "state mismatch": "danger", disputed: "danger", bounced: "danger", overdue: "danger",
  "access issues": "danger", "access missing": "danger", "credentials invalid": "danger", "signature failed": "danger",
  terminated: "danger", "ended early": "danger", escalated: "danger", critical: "danger", denied: "danger",
  blocked: "danger", "reported inaccuracy": "danger", reported: "danger", incomplete: "danger", missing: "danger",
  "not received": "danger", exhausted: "danger", high: "danger",
  // info / pending
  open: "info", "in review": "info", submitted: "info", running: "info", queued: "info", provisioning: "info",
  interview: "info", shortlisted: "info", "test task": "pending", offer: "pending", requested: "pending",
  "pending payment confirmation": "pending", "pending webhook": "pending", awaiting: "pending", "pending confirmation": "pending",
  unreconciled: "pending", planned: "pending", medium: "warning", "not started": "neutral",
  // neutral
  closed: "neutral", expired: "neutral", cancelled: "neutral", withdrawn: "neutral", archived: "neutral", draft: "neutral",
  "not submitted": "neutral", disabled: "neutral", unknown: "neutral", dismissed: "neutral", "not configured": "neutral",
  "not required": "neutral", "not recorded": "neutral", left: "neutral", unavailable: "neutral", low: "neutral",
  invited: "info", refunded: "neutral", reversed: "neutral", "kept separate": "neutral", merged: "success",
  "refund pending": "warning", "not implemented": "neutral", "terms review": "warning", "not specified": "neutral",
};

export function toneForStatus(status: string): StatusTone {
  return STATUS_TONES[status.toLowerCase()] ?? "neutral";
}

interface StatusBadgeProps {
  status: string;
  tone?: StatusTone;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, tone, className, showDot = true }: StatusBadgeProps) {
  const resolved = TONE_CLASSES[tone ?? toneForStatus(status)];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        resolved.wrap,
        className,
      )}
    >
      {showDot && <span className={cn("size-1.5 rounded-full", resolved.dot)} aria-hidden />}
      {status}
    </span>
  );
}

const PRIORITY_TONE: Record<string, StatusTone> = {
  Critical: "danger",
  High: "brand",
  Medium: "warning",
  Low: "neutral",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return <StatusBadge status={priority} tone={PRIORITY_TONE[priority] ?? "neutral"} />;
}
