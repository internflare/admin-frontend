import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRightIcon, DownloadIcon, LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter, type DataColumn } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { DetailGrid } from "@/polymet/components/section-card";
import { DateRangeSelect } from "@/polymet/components/date-range-select";
import { PermissionGuard, PermissionButton } from "@/polymet/components/permission-controls";
import type { AuditEvent } from "@/polymet/data/operations-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDateTime } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

const OUTCOME_TONE = { Success: "success", Denied: "warning", Failed: "danger" } as const;

export default function AuditLogsPage() {
  const { data, loading, error, retry } = useAdminQuery(adminService.audit);
  const [params] = useSearchParams();
  const [actorType, setActorType] = useState("all");
  const [entityType, setEntityType] = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [actor, setActor] = useState("all");
  const [range, setRange] = useState("30d");
  const [selectedId, setSelectedId] = useState<string | null>(params.get("ref"));

  const all = data ?? [];
  const entityTypes = Array.from(new Set(all.map((e) => e.entityType))).sort();
  const actors = Array.from(new Set(all.map((e) => e.actor))).sort();
  const rows = all.filter(
    (e) => matchesFilter(e.actorType, actorType) && matchesFilter(e.entityType, entityType) && matchesFilter(e.outcome, outcome) && matchesFilter(e.actor, actor),
  );
  const selected = all.find((e) => e.id === selectedId || e.entity === selectedId) ?? null;

  const columns: DataColumn<AuditEvent>[] = [
    { key: "at", header: "Time", sortValue: (e) => e.at, cell: (e) => <span className="whitespace-nowrap font-mono text-xs">{formatDateTime(e.at)}</span> },
    { key: "actor", header: "Actor", sortValue: (e) => e.actor, cell: (e) => <div className="leading-tight"><p className="text-sm">{e.actor}</p><p className="text-[11px] text-muted-foreground">{e.actorType}</p></div> },
    { key: "action", header: "Action", sortValue: (e) => e.action, cell: (e) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{e.action}</code> },
    { key: "entity", header: "Entity", cell: (e) => <div className="leading-tight"><p className="font-mono text-xs">{e.entity}</p><p className="text-[11px] text-muted-foreground">{e.entityType}</p></div> },
    {
      key: "change",
      header: "Change",
      hideOnMobile: true,
      cell: (e) =>
        e.previous || e.next ? (
          <span className="inline-flex items-center gap-1 text-xs">
            <span className="text-muted-foreground">{e.previous ?? "—"}</span>
            <ArrowRightIcon className="size-3" />
            <span className="font-medium">{e.next ?? "—"}</span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    { key: "outcome", header: "Outcome", sortValue: (e) => e.outcome, cell: (e) => <StatusBadge status={e.outcome} tone={OUTCOME_TONE[e.outcome]} /> },
  ];

  return (
    <PermissionGuard permission="audit.view">
      <div className="space-y-5">
        <PageHeader
          title="Audit logs"
          description="Append-only record of administrative, system and sensitive user actions. Entries cannot be edited or deleted from any role."
          breadcrumbs={[{ label: "Trust & operations" }, { label: "Audit logs" }]}
          actions={
            <>
              <DateRangeSelect value={range} onChange={setRange} showCompare={false} />
              <PermissionButton permission="analytics.export" variant="outline" size="sm" className="bg-background" onClick={() => recordDemoAction("Audit export requested", `${rows.length} entries · ${range}. Export is itself audited.`)}>
                <DownloadIcon className="size-4" /> Export
              </PermissionButton>
            </>
          }
        />
        <Alert>
          <LockIcon className="size-4" />
          <AlertDescription>Retention: 7 years for finance and access events, 2 years for all other events. Personal data in entries is masked unless your role holds “users.pii”.</AlertDescription>
        </Alert>
        <DataTable
          data={rows}
          loading={loading}
          error={error}
          onRetry={retry}
          columns={columns}
          getRowId={(e) => e.id}
          getSearchText={(e) => `${e.id} ${e.actor} ${e.action} ${e.entity} ${e.entityType} ${e.reason ?? ""} ${e.correlationId}`}
          searchPlaceholder="Search action, entity ID, correlation ID, reason"
          onRowClick={(e) => setSelectedId(e.id)}
          initialSort={{ key: "at", dir: "desc" }}
          pageSize={15}
          dense
          toolbar={
            <>
              <FilterSelect label="Actor type" value={actorType} onChange={setActorType} options={["Admin", "System", "User"]} />
              <FilterSelect label="Actor" value={actor} onChange={setActor} options={actors} />
              <FilterSelect label="Entity type" value={entityType} onChange={setEntityType} options={entityTypes} />
              <FilterSelect label="Outcome" value={outcome} onChange={setOutcome} options={["Success", "Denied", "Failed"]} />
            </>
          }
        />

        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            {selected && (
              <div className="space-y-5">
                <SheetHeader>
                  <SheetTitle className="font-mono text-base">{selected.action}</SheetTitle>
                  <SheetDescription>{selected.id} · {formatDateTime(selected.at)}</SheetDescription>
                </SheetHeader>
                <StatusBadge status={selected.outcome} tone={OUTCOME_TONE[selected.outcome]} />
                <DetailGrid
                  columns={2}
                  items={[
                    { label: "Actor", value: selected.actor },
                    { label: "Actor type", value: selected.actorType },
                    { label: "Entity type", value: selected.entityType },
                    { label: "Entity", value: <span className="font-mono">{selected.entity}</span> },
                    { label: "Correlation ID", value: <span className="font-mono">{selected.correlationId}</span>, wide: true },
                  ]}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Previous value</p>
                    <p className="mt-1 text-sm">{selected.previous ?? "—"}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">New value</p>
                    <p className="mt-1 text-sm font-medium">{selected.next ?? "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Reason recorded</p>
                  <p className="mt-1 text-sm">{selected.reason ?? "No reason captured (system event)."}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-background" onClick={() => navigator.clipboard?.writeText(selected.correlationId)}>
                  Copy correlation ID
                </Button>
                <p className="text-xs text-muted-foreground">Audit entries are immutable. Corrections are recorded as new events referencing this entry.</p>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </PermissionGuard>
  );
}
