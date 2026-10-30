import { useState } from "react";
import { AlertTriangleIcon, LockIcon, ScaleIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/polymet/components/page-header";
import { MetricCard } from "@/polymet/components/metric-card";
import { SectionCard, DetailGrid } from "@/polymet/components/section-card";
import { TrendChart, BreakdownList } from "@/polymet/components/admin-charts";
import { DataTable, FilterSelect, matchesFilter } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { DateRangeSelect } from "@/polymet/components/date-range-select";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import { AI_FEATURE_USAGE, AI_PROVIDERS, AI_USAGE_SERIES, type AIEvent, type MatchReview } from "@/polymet/data/integrations-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatCompact, formatCompactCurrency, formatCurrency, formatDateTime, formatNumber } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";
import { cn } from "@/lib/utils";

export default function AIUsagePage({ initialTab = "usage" }: { initialTab?: "usage" | "matching" }) {
  const { can } = useAdminRole();
  const { data, loading, error, retry } = useAdminQuery(adminService.aiEvents);
  const [status, setStatus] = useState("all");
  const [eventId, setEventId] = useState<string | null>(null);
  const [match, setMatch] = useState<MatchReview | null>(null);
  const event: AIEvent | undefined = data?.events.find((e) => e.id === eventId);
  const events = (data?.events ?? []).filter((e) => matchesFilter(e.status, status));

  const recorded = AI_FEATURE_USAGE.filter((f) => f.costKind === "Recorded").reduce((s, f) => s + f.cost, 0);
  const estimated = AI_FEATURE_USAGE.filter((f) => f.costKind === "Estimated").reduce((s, f) => s + f.cost, 0);

  return (
    <PermissionGuard permission="ai.view">
      <div className="space-y-5">
        <PageHeader
          title={initialTab === "matching" ? "Matching & assessments" : "AI usage & costs"}
          description="Provider-reported usage, costs and failures. Accuracy statistics are not shown unless measured. AI output is advisory; hiring decisions remain human."
          breadcrumbs={[{ label: "Integrations & AI" }, { label: initialTab === "matching" ? "Matching" : "AI usage" }]}
          actions={<DateRangeSelect showCompare={false} />}
        />
        <Tabs defaultValue={initialTab} key={initialTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="usage">Usage & cost</TabsTrigger>
            <TabsTrigger value="events">Request events</TabsTrigger>
            <TabsTrigger value="matching">Matching & assessments</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard label="Requests" value={formatCompact(54110)} kind="period" />
              <MetricCard label="Failed requests" value={formatNumber(668)} kind="period" />
              <MetricCard label="Rate-limit events" value={formatNumber(149)} kind="period" />
              <MetricCard label="Recorded provider cost" value={formatCompactCurrency(recorded)} kind="period" />
              <MetricCard label="Estimated cost" value={formatCompactCurrency(estimated)} kind="estimate" footnote="Providers without billing export" />
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <SectionCard title="Requests over time">
                <TrendChart data={AI_USAGE_SERIES} xKey="date" variant="area" series={[{ key: "requests", label: "Requests", color: "hsl(var(--chart-2))" }, { key: "failed", label: "Failed", color: "hsl(var(--chart-1))" }]} />
              </SectionCard>
              <SectionCard title="Usage by provider">
                <ul className="space-y-3">
                  {AI_PROVIDERS.map((p) => (
                    <li key={p.provider} className="rounded-md border p-3">
                      <div className="flex items-center justify-between"><span className="font-medium">{p.provider}</span><span className="text-sm tabular-nums">{formatCurrency(p.cost)}</span></div>
                      <p className="mt-1 text-xs text-muted-foreground">{formatNumber(p.requests)} requests · {p.failed} failed · {p.rateLimited} rate-limited</p>
                      <p className="text-xs text-muted-foreground">Configured limit: {p.limit}</p>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            </div>
            <SectionCard title="Usage by feature" contentClassName="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="border-y bg-muted/40 text-xs text-muted-foreground">
                    <tr><th className="px-4 py-2 text-left font-medium">Feature</th><th className="px-4 py-2 text-right font-medium">Requests</th><th className="px-4 py-2 text-right font-medium">Tokens</th><th className="px-4 py-2 text-right font-medium">Cost</th><th className="px-4 py-2 text-right font-medium">p95 latency</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {AI_FEATURE_USAGE.map((f) => (
                      <tr key={f.feature} className={cn(f.costKind === "Not implemented" && "text-muted-foreground")}>
                        <td className="px-4 py-2.5">{f.feature}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{f.costKind === "Not implemented" ? "—" : formatNumber(f.requests)}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{f.costKind === "Not implemented" ? "—" : formatCompact(f.tokens)}</td>
                        <td className="px-4 py-2.5 text-right"><span className="tabular-nums">{f.costKind === "Not implemented" ? "—" : formatCurrency(f.cost)}</span> <StatusBadge status={f.costKind} tone={f.costKind === "Estimated" ? "accent" : f.costKind === "Recorded" ? "success" : "neutral"} showDot={false} className="ml-1" /></td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{f.costKind === "Not implemented" ? "—" : `${f.p95}s`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
            <SectionCard title="Cost share by feature">
              <BreakdownList items={AI_FEATURE_USAGE.filter((f) => f.cost > 0).map((f) => ({ label: f.feature, value: f.cost, hint: f.costKind === "Estimated" ? "est." : undefined }))} format={(n) => formatCurrency(n)} />
            </SectionCard>
          </TabsContent>

          <TabsContent value="events">
            <DataTable data={events} loading={loading} error={error} onRetry={retry} getRowId={(e) => e.id} onRowClick={(e) => setEventId(e.id)}
              toolbar={<FilterSelect label="Status" value={status} onChange={setStatus} options={["Success", "Failed", "Rate limited", "Low confidence"]} />}
              columns={[
                { key: "id", header: "Event", cell: (e) => <span className="font-mono text-xs">{e.id}</span> },
                { key: "feat", header: "Feature", cell: (e) => e.feature },
                { key: "prov", header: "Provider · model", hideOnMobile: true, cell: (e) => <span className="text-xs">{e.provider} · {e.model}</span> },
                { key: "acct", header: "Account · plan", hideOnMobile: true, cell: (e) => <span className="text-xs">{e.account} · {e.plan}</span> },
                { key: "lat", header: "Latency", align: "right", cell: (e) => (e.latencyMs ? `${(e.latencyMs / 1000).toFixed(1)}s` : "—") },
                { key: "tok", header: "Tokens in/out", align: "right", hideOnMobile: true, cell: (e) => <span className="text-xs">{e.tokensIn ?? "—"} / {e.tokensOut ?? "—"}</span> },
                { key: "status", header: "Status", cell: (e) => <StatusBadge status={e.status} /> },
                { key: "at", header: "Time", hideOnMobile: true, cell: (e) => <span className="whitespace-nowrap text-xs">{formatDateTime(e.at)}</span> },
              ]} />
          </TabsContent>

          <TabsContent value="matching" className="space-y-3">
            <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
              <ScaleIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p>Match scores rank candidates for employer review only. They never auto-reject or auto-hire. Accuracy is not reported until a labelled evaluation exists.</p>
            </div>
            {(data?.matches ?? []).map((m) => (
              <Card key={m.id} className="p-4 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{m.candidate} → {m.listing}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{m.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold tabular-nums">{m.score}</span>
                    <StatusBadge status={`${m.confidence} confidence`} tone={m.confidence === "High" ? "success" : m.confidence === "Medium" ? "warning" : "danger"} />
                    <StatusBadge status={m.status} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.factors.map((f) => <StatusBadge key={f.label} status={`${f.label}: ${f.weight}`} tone={f.weight === "Strong" ? "success" : f.weight === "Partial" ? "warning" : "neutral"} showDot={false} />)}
                </div>
                {m.missingData.length > 0 && <p className="mt-2 flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400"><AlertTriangleIcon className="size-3" /> Missing data: {m.missingData.join(", ")}</p>}
                {m.report && <p className="mt-2 rounded-md bg-muted/50 p-2 text-sm">“{m.report}”</p>}
                {m.status !== "Reviewed" && (
                  <div className="mt-3 flex justify-end"><PermissionButton permission="ai.view" size="sm" variant="outline" className="bg-background" onClick={() => setMatch(m)}>Review</PermissionButton></div>
                )}
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <Sheet open={!!event} onOpenChange={(o) => !o && setEventId(null)}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            {event && (
              <>
                <SheetHeader>
                  <SheetTitle className="font-mono">{event.id}</SheetTitle>
                  <SheetDescription>{event.feature} · {formatDateTime(event.at)}</SheetDescription>
                </SheetHeader>
                <div className="mt-5 space-y-5">
                  <DetailGrid items={[
                    { label: "Status", value: <StatusBadge status={event.status} /> },
                    { label: "Provider / model", value: `${event.provider} · ${event.model}` },
                    { label: "Account", value: event.account },
                    { label: "Plan", value: event.plan },
                    { label: "Latency", value: event.latencyMs ? `${event.latencyMs} ms` : "—" },
                    { label: "Tokens", value: `${event.tokensIn ?? "—"} in / ${event.tokensOut ?? "—"} out` },
                    ...(event.error ? [{ label: "Error", value: event.error, wide: true }] : []),
                  ]} />
                  {can("ai.sensitive") ? (
                    <div className="space-y-3">
                      <div><p className="mb-1 text-xs font-medium text-muted-foreground">Input (redacted)</p><p className="rounded-md bg-muted p-2 font-mono text-xs">{event.redactedInput}</p></div>
                      <div><p className="mb-1 text-xs font-medium text-muted-foreground">Output (redacted)</p><p className="rounded-md bg-muted p-2 font-mono text-xs">{event.redactedOutput}</p></div>
                      <p className="text-[11px] text-muted-foreground">Prompts and personal data are redacted at source. Viewing is audited.</p>
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 rounded-md border border-dashed p-3 text-xs text-muted-foreground"><LockIcon className="size-3.5" /> Payloads are restricted to roles with “View redacted AI payloads”.</p>
                  )}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        <ConfirmActionDialog
          open={!!match}
          onOpenChange={(o) => !o && setMatch(null)}
          title="Review match result"
          target={`${match?.id} · ${match?.candidate}`}
          reasonOptions={["Inaccuracy confirmed — log for model feedback", "Missing profile data — prompt talent to complete", "Result acceptable — close report", "Escalate to AI team"]}
          consequences={["Feedback is stored for evaluation; no ranking is changed manually", "Employer and talent decisions are unaffected"]}
          confirmLabel="Record review"
          onConfirm={({ reason }) => recordDemoAction(`${reason} (${match?.id})`)}
        />
      </div>
    </PermissionGuard>
  );
}
