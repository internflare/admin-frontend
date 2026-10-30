import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { KeyRoundIcon, LockIcon, PowerIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/polymet/components/page-header";
import { SectionCard, DetailGrid } from "@/polymet/components/section-card";
import { StatusBadge } from "@/polymet/components/status-badge";
import { MetricCard } from "@/polymet/components/metric-card";
import { DataTable } from "@/polymet/components/data-table";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { EmptyState } from "@/polymet/components/state-views";
import { EXTERNAL_SOURCES, SYNC_RUNS, FAILED_IMPORTS } from "@/polymet/data/integrations-data";
import { formatDateTime, formatNumber, formatPercent } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

export default function SourceDetailPage() {
  const { sourceId = "SRC-ADZ" } = useParams();
  const [dialog, setDialog] = useState<"sync" | "toggle" | null>(null);
  const source = EXTERNAL_SOURCES.find((s) => s.id === sourceId);
  if (!source) return <EmptyState title="Source not found" action={<Button asChild size="sm" variant="outline"><Link to="/integrations">Back</Link></Button>} />;
  const runs = SYNC_RUNS.filter((r) => r.sourceId === source.id);
  const errors = FAILED_IMPORTS.filter((f) => f.provider === source.name);
  const configured = source.integrationStatus !== "Awaiting configuration";

  return (
    <PermissionGuard permission="integrations.view">
      <div className="space-y-5">
        <PageHeader
          title={source.name}
          description={`${source.kind} · schedule: ${source.schedule}`}
          breadcrumbs={[{ label: "Integrations & AI" }, { label: "External job sources", href: "/integrations" }, { label: source.id }]}
          meta={<><StatusBadge status={source.health} /><StatusBadge status={source.integrationStatus} /></>}
          actions={
            <>
              <PermissionButton permission="integrations.manage" size="sm" variant="outline" className="h-8 bg-background" onClick={() => setDialog("toggle")}><PowerIcon className="mr-1.5 size-3.5" />{source.enabled ? "Disable source" : "Enable source"}</PermissionButton>
              <PermissionButton permission="integrations.manage" size="sm" className="h-8" disabled={!configured || !source.enabled} onClick={() => setDialog("sync")}><RefreshCwIcon className="mr-1.5 size-3.5" />Request sync</PermissionButton>
            </>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Imported" value={formatNumber(source.imported)} />
          <MetricCard label="Failed records" value={formatNumber(source.failed)} />
          <MetricCard label="Duplicates" value={formatNumber(source.duplicates)} />
          <MetricCard label="Expired / deactivated" value={formatNumber(source.expired)} />
          <MetricCard label="Sync success rate" value={formatPercent(source.successRate)} kind={source.successRate === null ? "unavailable" : "period"} />
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <SectionCard title="Configuration">
            <DetailGrid items={[
              { label: "Integration status", value: <StatusBadge status={source.integrationStatus} /> },
              { label: "Enabled", value: source.enabled ? "Yes" : "No" },
              { label: "Credentials", value: <span className="inline-flex items-center gap-1.5"><LockIcon className="size-3 text-muted-foreground" />{source.credentials}</span> },
              { label: "API secret", value: <span className="font-mono text-xs text-muted-foreground">•••••••••••• (never displayed)</span> },
              { label: "Commercial-use terms", value: <StatusBadge status={source.commercialTerms} /> },
              { label: "Sync schedule", value: source.schedule },
              { label: "Last successful connection", value: formatDateTime(source.lastSuccessAt) },
              { label: "Last attempt", value: formatDateTime(source.lastAttemptAt) },
              { label: "Record mapping", value: configured ? "Title, company, location, salary, apply URL, expiry mapped" : "Not configured" },
              { label: "Outage rule", value: "Retain existing valid records during provider outages", wide: true },
            ]} />
            <PermissionButton permission="integrations.manage" size="sm" variant="outline" className="mt-4 bg-background" onClick={() => recordDemoAction("Credential rotation requested", "Rotation is performed in the secrets vault, not in this UI.")}>
              <KeyRoundIcon className="mr-1.5 size-3.5" /> Rotate credentials in vault
            </PermissionButton>
          </SectionCard>
          <div className="space-y-4">
            <SectionCard title="Import & retry history" contentClassName="p-0">
              <DataTable data={runs} getRowId={(r) => r.id} pageSize={5} className="rounded-none border-x-0 border-b-0 shadow-none" emptyTitle="No sync runs yet"
                columns={[
                  { key: "id", header: "Run", cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
                  { key: "start", header: "Started", cell: (r) => <span className="text-xs">{formatDateTime(r.startedAt)}</span> },
                  { key: "fetched", header: "Fetched", align: "right", cell: (r) => r.fetched },
                  { key: "created", header: "Created", align: "right", cell: (r) => r.created },
                  { key: "fail", header: "Failures", align: "right", cell: (r) => r.failures },
                  { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
                  { key: "retry", header: "Retry", cell: (r) => r.retry },
                ]} />
            </SectionCard>
            <SectionCard title="Error history">
              {errors.length === 0 ? <p className="text-sm text-muted-foreground">No record-level errors.</p> : (
                <ul className="space-y-2">
                  {errors.map((e) => (
                    <li key={e.id} className="rounded-md border p-2.5">
                      <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs">{e.externalId}</span><StatusBadge status={e.resolution} /></div>
                      <p className="mt-1 text-xs text-muted-foreground">{e.errors.join("; ") || e.duplicateReason}</p>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        </div>
        <ConfirmActionDialog
          open={!!dialog}
          onOpenChange={(o) => !o && setDialog(null)}
          title={dialog === "sync" ? `Request ${source.name} sync` : `${source.enabled ? "Disable" : "Enable"} ${source.name}`}
          target={source.id}
          destructive={dialog === "toggle" && source.enabled}
          requireReason={dialog === "toggle"}
          consequences={dialog === "sync" ? ["A sync job is queued with the sync service", "Results appear in sync history; no records are changed by this UI"] : source.enabled ? ["Scheduled syncs stop", "Existing valid imported listings remain until they expire per sync rules"] : ["Scheduled syncs resume once credentials and terms are valid"]}
          confirmLabel={dialog === "sync" ? "Queue sync" : "Confirm"}
          onConfirm={({ note }) => recordDemoAction(dialog === "sync" ? `Sync requested for ${source.name}` : `Source ${source.enabled ? "disable" : "enable"} requested`, note || undefined)}
        />
      </div>
    </PermissionGuard>
  );
}
