import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { SectionCard } from "@/polymet/components/section-card";
import { TrendChart } from "@/polymet/components/admin-charts";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { IMPORT_HEALTH_SERIES } from "@/polymet/data/dashboard-data";
import type { DuplicateCandidate, FailedImport } from "@/polymet/data/integrations-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDateTime, formatRelative } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";
import { cn } from "@/lib/utils";

type Tab = "history" | "failed" | "duplicates";

export default function SyncMonitoringPage({ initialTab = "history" }: { initialTab?: Tab }) {
  const { data, loading, error, retry } = useAdminQuery(adminService.sync);
  const [provider, setProvider] = useState("all");
  const [resolution, setResolution] = useState("all");
  const [failAction, setFailAction] = useState<{ item: FailedImport; kind: "Retry" | "Dismiss" } | null>(null);
  const [dupAction, setDupAction] = useState<DuplicateCandidate | null>(null);

  const runs = (data?.runs ?? []).filter((r) => matchesFilter(r.provider, provider));
  const failed = (data?.failed ?? []).filter((f) => matchesFilter(f.provider, provider) && matchesFilter(f.resolution, resolution));
  const providers = ["Adzuna", "Jooble", "Lagos Tech Partners feed"];

  return (
    <PermissionGuard permission="integrations.view">
      <div className="space-y-5">
        <PageHeader
          title={initialTab === "history" ? "API sync monitoring" : "Import errors & duplicates"}
          description="External records keep their source attribution and original application destination. Expired or unavailable listings deactivate per configured sync rules; valid records are retained during outages."
          breadcrumbs={[{ label: "Integrations & AI" }, { label: initialTab === "history" ? "Sync monitoring" : "Import errors" }]}
        />
        <SectionCard title="Import health" description="Records imported vs failed per day">
          <TrendChart data={IMPORT_HEALTH_SERIES} xKey="day" variant="bar" stacked height={170} series={[{ key: "imported", label: "Imported", color: "hsl(var(--chart-1))" }, { key: "failed", label: "Failed", color: "hsl(var(--chart-3))" }]} />
        </SectionCard>
        <Tabs defaultValue={initialTab} key={initialTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="history">Sync history</TabsTrigger>
            <TabsTrigger value="failed">Failed imports</TabsTrigger>
            <TabsTrigger value="duplicates">Duplicates & expiry</TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            <DataTable data={runs} loading={loading} error={error} onRetry={retry} getRowId={(r) => r.id}
              toolbar={<FilterSelect label="Provider" value={provider} onChange={setProvider} options={providers} />}
              initialSort={{ key: "start", dir: "desc" }}
              columns={[
                { key: "id", header: "Sync ID", cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
                { key: "prov", header: "Provider", cell: (r) => r.provider },
                { key: "start", header: "Start", sortValue: (r) => r.startedAt, cell: (r) => <span className="whitespace-nowrap text-xs">{formatDateTime(r.startedAt)}</span> },
                { key: "end", header: "End", hideOnMobile: true, cell: (r) => <span className="whitespace-nowrap text-xs">{formatDateTime(r.endedAt)}</span> },
                { key: "f", header: "Fetched", align: "right", cell: (r) => r.fetched },
                { key: "c", header: "Created", align: "right", cell: (r) => r.created },
                { key: "u", header: "Updated", align: "right", hideOnMobile: true, cell: (r) => r.updated },
                { key: "d", header: "Dupes", align: "right", hideOnMobile: true, cell: (r) => r.duplicates },
                { key: "rj", header: "Rejected", align: "right", hideOnMobile: true, cell: (r) => r.rejected },
                { key: "fl", header: "Failures", align: "right", cell: (r) => <span className={cn(r.failures > 0 && "font-medium text-red-600")}>{r.failures}</span> },
                { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
                { key: "retry", header: "Retry", cell: (r) => (r.retry === "—" ? <span className="text-muted-foreground">—</span> : <StatusBadge status={r.retry} />) },
              ]} />
          </TabsContent>
          <TabsContent value="failed">
            <DataTable data={failed} loading={loading} getRowId={(f) => f.id} getSearchText={(f) => `${f.externalId} ${f.title ?? ""} ${f.company ?? ""}`}
              toolbar={<><FilterSelect label="Provider" value={provider} onChange={setProvider} options={providers} /><FilterSelect label="Resolution" value={resolution} onChange={setResolution} options={["Unresolved", "Retry queued", "Dismissed", "Resolved"]} /></>}
              columns={[
                { key: "ext", header: "External ID", cell: (f) => <span className="font-mono text-xs">{f.externalId}</span> },
                { key: "prov", header: "Provider", cell: (f) => f.provider },
                { key: "title", header: "Title · company", cell: (f) => <div className="min-w-[160px] leading-tight"><p>{f.title ?? "—"}</p><p className="text-xs text-muted-foreground">{f.company ?? "Company missing"}</p></div> },
                { key: "err", header: "Validation / duplicate", cell: (f) => <p className="max-w-xs text-xs text-red-700 dark:text-red-400">{f.errors.length ? f.errors.join("; ") : <span className="text-amber-700 dark:text-amber-400">Duplicate of {f.duplicateOf}: {f.duplicateReason}</span>}</p> },
                { key: "url", header: "Source URL", hideOnMobile: true, cell: (f) => <a href={f.sourceUrl} target="_blank" rel="noreferrer" className="block max-w-[160px] truncate font-mono text-xs hover:underline">{f.sourceUrl}</a> },
                { key: "last", header: "Last attempt", hideOnMobile: true, cell: (f) => <span className="text-xs text-muted-foreground">{formatRelative(f.lastAttempt)}</span> },
                { key: "res", header: "Resolution", cell: (f) => <StatusBadge status={f.resolution} /> },
              ]}
              rowActions={(f) => (
                <div className="flex justify-end gap-1">
                  <PermissionButton permission="integrations.manage" size="sm" variant="outline" className="h-7 bg-background text-xs" disabled={f.resolution !== "Unresolved"} onClick={() => setFailAction({ item: f, kind: "Retry" })}>Retry</PermissionButton>
                  <PermissionButton permission="integrations.manage" size="sm" variant="ghost" className="h-7 text-xs" disabled={f.resolution !== "Unresolved"} onClick={() => setFailAction({ item: f, kind: "Dismiss" })}>Dismiss</PermissionButton>
                </div>
              )} />
          </TabsContent>
          <TabsContent value="duplicates" className="space-y-3">
            {(data?.duplicates ?? []).map((d) => (
              <Card key={d.id} className="p-4 shadow-xs">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><span className="font-mono text-xs">{d.id}</span><StatusBadge status={d.status} /></div>
                  <span className="text-xs text-muted-foreground">Similarity <span className="font-semibold text-foreground">{d.similarity}%</span></span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="text-xs text-muted-foreground"><tr><th className="w-28 pb-1 text-left font-medium">Field</th><th className="pb-1 text-left font-medium">Record A</th><th className="pb-1 text-left font-medium">Record B</th></tr></thead>
                    <tbody className="divide-y">
                      {(["ref", "provider", "title", "company", "location"] as const).map((k) => (
                        <tr key={k}>
                          <td className="py-1.5 text-xs capitalize text-muted-foreground">{k === "ref" ? "Provider ID" : k}</td>
                          <td className={cn("py-1.5", k === "ref" && "font-mono text-xs")}>{d.left[k]}</td>
                          <td className={cn("py-1.5", k === "ref" && "font-mono text-xs", d.left[k] !== d.right[k] && k !== "ref" && k !== "provider" && "text-amber-700 dark:text-amber-400")}>{d.right[k]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {d.status === "Needs review" && (
                  <div className="mt-3 flex justify-end">
                    <PermissionButton permission="integrations.manage" size="sm" variant="outline" className="bg-background" onClick={() => setDupAction(d)}>Resolve</PermissionButton>
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <ConfirmActionDialog
          open={!!failAction}
          onOpenChange={(o) => !o && setFailAction(null)}
          title={`${failAction?.kind} import`}
          target={`${failAction?.item.provider} · ${failAction?.item.externalId}`}
          requireReason={failAction?.kind === "Dismiss"}
          consequences={failAction?.kind === "Retry" ? ["Record is queued for re-import on the next sync"] : ["Record is excluded from future imports; attribution is kept in history"]}
          confirmLabel={failAction?.kind}
          onConfirm={({ note }) => recordDemoAction(`${failAction?.kind} ${failAction?.item.externalId}`, note || undefined)}
        />
        <ConfirmActionDialog
          open={!!dupAction}
          onOpenChange={(o) => !o && setDupAction(null)}
          title="Resolve duplicate candidate"
          target={dupAction?.id}
          reasonOptions={["Merge — keep Record A as canonical", "Merge — keep Record B as canonical", "Keep separate — distinct roles"]}
          consequences={["Merged records keep both source attributions and the canonical application destination", "Decision applies to future syncs of these provider IDs"]}
          confirmLabel="Record decision"
          onConfirm={({ reason }) => recordDemoAction(`${reason} (${dupAction?.id})`)}
        />
      </div>
    </PermissionGuard>
  );
}
