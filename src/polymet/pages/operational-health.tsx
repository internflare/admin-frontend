import { Link } from "react-router-dom";
import { ActivityIcon, AlertOctagonIcon, CheckCircle2Icon, AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/polymet/components/page-header";
import { MetricCard } from "@/polymet/components/metric-card";
import { SectionCard } from "@/polymet/components/section-card";
import { StatusBadge } from "@/polymet/components/status-badge";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import { HEALTH_SERVICES } from "@/polymet/data/dashboard-data";
import { WORKSPACE_ACCESS_ISSUES } from "@/polymet/data/squadcot-data";
import { EXTERNAL_SOURCES } from "@/polymet/data/integrations-data";
import { recordDemoAction } from "@/polymet/lib/demo-actions";
import { formatRelative } from "@/polymet/lib/format";
import { cn } from "@/lib/utils";

const ANOMALIES = [
  { label: "Email bounce rate", value: "4.1%", baseline: "0.9% baseline", href: "/notifications" },
  { label: "AI failed requests (4 Jun)", value: "2.6×", baseline: "vs 14-day median", href: "/ai-usage" },
  { label: "Report participation", value: "−5.6 pts", baseline: "week over week", href: "/workspace-activity/reports" },
  { label: "Workspace provisioning failures", value: "3", baseline: "0 expected / 24h", href: "/workspaces/access-issues" },
];

export default function OperationalHealthPage() {
  const outages = HEALTH_SERVICES.filter((s) => s.status === "Outage").length;
  const degraded = HEALTH_SERVICES.filter((s) => s.status === "Degraded").length;

  return (
    <PermissionGuard permission="dashboard.view">
      <div className="space-y-5">
        <PageHeader
          title="Operational health"
          description="Service status, background jobs and unusual operational metrics. Status is reported by monitoring — this page never changes service state."
          breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Operational health" }]}
          actions={
            <Button variant="outline" size="sm" className="h-8 bg-background" onClick={() => recordDemoAction("Refresh health checks", "Health checks are read from monitoring once connected.")}>
              <RotateCwIcon className="mr-1.5 size-3.5" /> Refresh
            </Button>
          }
        />

        <div
          className={cn(
            "flex items-start gap-3 rounded-lg border p-4",
            outages ? "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10" : "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10",
          )}
          role="status"
        >
          <AlertOctagonIcon className={cn("mt-0.5 size-5 shrink-0", outages ? "text-red-600" : "text-amber-600")} />
          <div>
            <p className="text-sm font-semibold">
              {outages} outage · {degraded} degraded services
            </p>
            <p className="text-sm text-muted-foreground">
              Jooble sync has failed since 9 Jun (401). Existing valid Jooble listings are retained during the outage.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Services operational" value={`${HEALTH_SERVICES.filter((s) => s.status === "Operational").length} / ${HEALTH_SERVICES.length}`} icon={CheckCircle2Icon} />
          <MetricCard label="Open access issues" value={WORKSPACE_ACCESS_ISSUES.filter((i) => i.status !== "Resolved").length} icon={AlertTriangleIcon} href="/workspaces/access-issues" />
          <MetricCard label="Failing sources" value={EXTERNAL_SOURCES.filter((s) => s.health === "Failing").length} icon={ActivityIcon} href="/integrations" />
          <MetricCard label="Webhook signature failures" value="1" kind="period" icon={AlertTriangleIcon} href="/reconciliation" footnote="Last 24 hours" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <SectionCard title="Services & jobs" contentClassName="p-0">
            <ul className="divide-y border-t">
              {HEALTH_SERVICES.map((s) => (
                <li key={s.name} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.latency}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:w-64">
                    <div className="flex-1">
                      <Progress value={s.uptime} className="h-1.5" aria-label={`${s.name} 30-day availability`} />
                      <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">{s.uptime}% · 30 days</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          <div className="space-y-4">
            <SectionCard title="Unusual metrics" description="Flagged against rolling baselines">
              <ul className="space-y-3">
                {ANOMALIES.map((a) => (
                  <li key={a.label}>
                    <Link to={a.href} className="flex items-center justify-between gap-3 rounded-md border p-3 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <div>
                        <p className="text-sm">{a.label}</p>
                        <p className="text-xs text-muted-foreground">{a.baseline}</p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-orange-700 dark:text-orange-400">{a.value}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard title="External sources">
              <ul className="space-y-2">
                {EXTERNAL_SOURCES.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link to={`/integrations/${s.id}`} className="truncate hover:underline">{s.name}</Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{s.lastSuccessAt ? formatRelative(s.lastSuccessAt) : "never"}</span>
                      <StatusBadge status={s.health} />
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
