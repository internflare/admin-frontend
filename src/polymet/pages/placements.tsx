import { useState } from "react";
import { Link } from "react-router-dom";
import { SearchCheckIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter, type DataColumn } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { SectionCard } from "@/polymet/components/section-card";
import { MetricCard } from "@/polymet/components/metric-card";
import { FunnelBars } from "@/polymet/components/admin-charts";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { OUTCOME_FUNNEL, RECRUITMENT_FUNNEL, SOURCE_PERFORMANCE } from "@/polymet/data/dashboard-data";
import type { Placement } from "@/polymet/data/jobs-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDate, formatNumber, formatPercent } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

export default function PlacementsPage({ context = "jobs" }: { context?: "jobs" | "squadcot" }) {
  const { data, loading, error, retry } = useAdminQuery(adminService.placements);
  const [status, setStatus] = useState("all");
  const [prov, setProv] = useState("all");
  const [investigate, setInvestigate] = useState<Placement | null>(null);

  const rows = (data ?? []).filter((p) => matchesFilter(p.status, status) && matchesFilter(p.workspaceProvisioning, prov));
  const all = data ?? [];
  const title = context === "squadcot" ? "Engagements & placements" : "Placements & outcomes";

  const columns: DataColumn<Placement>[] = [
    { key: "id", header: "Engagement", cell: (p) => <span className="font-mono text-xs">{p.id}</span>, sortValue: (p) => p.id },
    { key: "cand", header: "Candidate", sortValue: (p) => p.candidate, cell: (p) => <Link to={`/users/${p.candidateId}`} className="font-medium hover:underline">{p.candidate}</Link> },
    { key: "emp", header: "Employer · opportunity", cell: (p) => <div className="min-w-[180px] leading-tight"><p>{p.employer}</p><p className="text-xs text-muted-foreground">{p.opportunity}</p></div> },
    { key: "type", header: "Type", hideOnMobile: true, cell: (p) => p.type },
    { key: "acc", header: "Acceptance", cell: (p) => <StatusBadge status={p.acceptance} /> },
    { key: "prov", header: "Workspace", cell: (p) => <span className="flex items-center gap-1.5"><StatusBadge status={p.workspaceProvisioning} />{p.workspaceId && <Link to={`/workspaces/${p.workspaceId}`} className="font-mono text-[11px] text-muted-foreground hover:underline">{p.workspaceId}</Link>}</span> },
    { key: "start", header: "Start", hideOnMobile: true, sortValue: (p) => p.startDate, cell: (p) => <span className="whitespace-nowrap text-xs">{formatDate(p.startDate)}</span> },
    { key: "end", header: "Expected end", hideOnMobile: true, cell: (p) => <span className="whitespace-nowrap text-xs">{p.expectedCompletion === "—" ? "Open-ended" : formatDate(p.expectedCompletion)}</span> },
    { key: "status", header: "Status", sortValue: (p) => p.status, cell: (p) => <StatusBadge status={p.status} /> },
    { key: "out", header: "Outcome", cell: (p) => (p.outcome === "—" ? <span className="text-xs text-muted-foreground">—</span> : <StatusBadge status={p.outcome} />) },
  ];

  return (
    <PermissionGuard permission={context === "squadcot" ? "workspaces.view" : "recruitment.view"}>
      <div className="space-y-5">
        <PageHeader
          title={title}
          description="Accepted offers, engagements and recorded outcomes. Hires and completions are counted only from recorded source events."
          breadcrumbs={[{ label: context === "squadcot" ? "SquadCot" : "internflareJobs" }, { label: title }]}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active engagements" value={all.filter((p) => p.status === "Active").length} />
          <MetricCard label="Provisioning failures" value={all.filter((p) => p.workspaceProvisioning === "Failed").length} />
          <MetricCard label="State mismatches" value={all.filter((p) => p.status === "State mismatch").length} />
          <MetricCard label="Completed without outcome" value={all.filter((p) => p.outcome === "Not recorded").length} footnote="Excluded from conversion metrics" />
        </div>
        <Tabs defaultValue="engagements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="engagements">Engagements</TabsTrigger>
            <TabsTrigger value="outcomes">Outcome analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="engagements">
            <DataTable
              data={rows}
              loading={loading}
              error={error}
              onRetry={retry}
              columns={columns}
              getRowId={(p) => p.id}
              getSearchText={(p) => `${p.id} ${p.candidate} ${p.employer} ${p.opportunity}`}
              toolbar={
                <>
                  <FilterSelect label="Status" value={status} onChange={setStatus} options={["Active", "Not started", "Completed", "Terminated", "State mismatch"]} />
                  <FilterSelect label="Provisioning" value={prov} onChange={setProv} options={["Provisioned", "Pending", "Failed", "Not required"]} />
                </>
              }
              rowActions={(p) => (
                <PermissionButton permission="placements.manage" size="sm" variant="outline" className="h-7 bg-background text-xs" disabled={p.workspaceProvisioning !== "Failed" && p.status !== "State mismatch" && p.workspaceProvisioning !== "Pending"} onClick={() => setInvestigate(p)}>
                  <SearchCheckIcon className="mr-1 size-3" /> Investigate
                </PermissionButton>
              )}
            />
          </TabsContent>
          <TabsContent value="outcomes" className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Recruitment conversion" description="Application → shortlist → interview → offer → acceptance">
              <FunnelBars steps={RECRUITMENT_FUNNEL} />
            </SectionCard>
            <SectionCard title="Internship outcomes" description="Completion and employment conversion">
              <FunnelBars steps={OUTCOME_FUNNEL} />
            </SectionCard>
            <SectionCard title="Recruitment source performance" className="lg:col-span-2" contentClassName="p-0">
              <table className="w-full text-sm">
                <thead className="border-y bg-muted/40 text-xs text-muted-foreground">
                  <tr><th className="px-4 py-2 text-left font-medium">Source</th><th className="px-4 py-2 text-right font-medium">Applications</th><th className="px-4 py-2 text-right font-medium">Shortlist rate</th><th className="px-4 py-2 text-right font-medium">Recorded hires</th></tr>
                </thead>
                <tbody className="divide-y">
                  {SOURCE_PERFORMANCE.map((s) => (
                    <tr key={s.source}>
                      <td className="px-4 py-2.5">{s.source}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{formatNumber(s.applications)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{s.shortlistRate === null ? <span className="text-xs text-muted-foreground">Not tracked (off-platform)</span> : formatPercent(s.shortlistRate)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{s.hires ?? <span className="text-xs text-muted-foreground">Not tracked</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>
          </TabsContent>
        </Tabs>

        <ConfirmActionDialog
          open={!!investigate}
          onOpenChange={(o) => !o && setInvestigate(null)}
          title="Investigate engagement state"
          target={`${investigate?.id} · ${investigate?.candidate} @ ${investigate?.employer}`}
          reasonOptions={["Retry workspace provisioning", "Escalate to workspace operations", "Request employer confirmation of acceptance", "Record as investigated — no change"]}
          consequences={["Provisioning retries go through the normal permission checks", "No hiring decision is altered", "Action is recorded with your reason"]}
          confirmLabel="Record action"
          onConfirm={({ reason }) => recordDemoAction(`${reason} — ${investigate?.id}`)}
        />
      </div>
    </PermissionGuard>
  );
}
