import { useState } from "react";
import { Link } from "react-router-dom";
import { FileTextIcon, GavelIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter, type DataColumn } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { MetricCard } from "@/polymet/components/metric-card";
import { DetailGrid } from "@/polymet/components/section-card";
import { PermissionGuard, PermissionButton } from "@/polymet/components/permission-controls";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import type { Dispute } from "@/polymet/data/operations-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatCurrency, formatDate, formatDateTime } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

const CATEGORIES: Dispute["category"][] = ["Listing or account", "Hiring or engagement", "Task or submission", "Paid test task", "Payment", "Workspace access"];
const OPEN = ["Open", "In review", "Awaiting information", "Escalated"];

function relatedHref(ref: string) {
  if (ref.startsWith("TXN")) return `/transactions?ref=${ref}`;
  if (ref.startsWith("WSP")) return `/workspaces/${ref}`;
  if (ref.startsWith("CMP")) return `/companies/${ref}`;
  if (ref.startsWith("APP")) return `/applications?ref=${ref}`;
  if (ref.startsWith("ENG")) return "/engagements";
  if (ref.startsWith("PRJ")) return "/workspace-activity/projects";
  return "/disputes";
}

type Action = "Request information" | "Escalate" | "Record decision" | "Close";

export default function DisputesPage() {
  const { data, loading, error, retry } = useAdminQuery(adminService.disputes);
  const { can } = useAdminRole();
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<Action | null>(null);

  const all = data ?? [];
  const rows = all.filter((d) => matchesFilter(d.status, status) && matchesFilter(d.category, category));
  const selected = all.find((d) => d.id === selectedId) ?? null;
  const canSeeFinance = can("finance.view");

  const columns: DataColumn<Dispute>[] = [
    { key: "id", header: "Case", sortValue: (d) => d.id, cell: (d) => <div className="leading-tight"><p className="font-mono text-xs font-medium">{d.id}</p><p className="text-xs text-muted-foreground">{d.category}</p></div> },
    { key: "parties", header: "Parties", cell: (d) => <span className="text-sm">{d.parties}</span> },
    { key: "rel", header: "Related", hideOnMobile: true, cell: (d) => <Link to={relatedHref(d.related)} onClick={(e) => e.stopPropagation()} className="font-mono text-xs hover:underline">{d.related}</Link> },
    { key: "amt", header: "Amount", align: "right", cell: (d) => (d.amount == null ? <span className="text-muted-foreground">—</span> : canSeeFinance ? formatCurrency(d.amount) : <span className="text-xs text-muted-foreground">Restricted</span>) },
    { key: "status", header: "Status", sortValue: (d) => d.status, cell: (d) => <StatusBadge status={d.status} /> },
    { key: "ev", header: "Evidence", align: "right", sortValue: (d) => d.evidence, cell: (d) => d.evidence },
    { key: "owner", header: "Owner", cell: (d) => d.owner ?? <span className="text-xs text-muted-foreground">Unassigned</span> },
    { key: "upd", header: "Updated", sortValue: (d) => d.updatedAt, cell: (d) => <span className="whitespace-nowrap text-xs">{formatDate(d.updatedAt)}</span> },
  ];

  const open = selected && OPEN.includes(selected.status);

  return (
    <PermissionGuard permission="disputes.manage">
      <div className="space-y-5">
        <PageHeader
          title="Disputes"
          description="Formal disputes between talent, employers and the platform. Decisions require a written rationale and are recorded in the audit log. Financial remedies are executed by Finance, not from this screen."
          breadcrumbs={[{ label: "Trust & operations" }, { label: "Disputes" }]}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Open cases" value={all.filter((d) => OPEN.includes(d.status)).length} />
          <MetricCard label="Escalated" value={all.filter((d) => d.status === "Escalated").length} />
          <MetricCard label="Awaiting information" value={all.filter((d) => d.status === "Awaiting information").length} />
          <MetricCard label="Unassigned" value={all.filter((d) => !d.owner && OPEN.includes(d.status)).length} />
        </div>
        <DataTable
          data={rows}
          loading={loading}
          error={error}
          onRetry={retry}
          columns={columns}
          getRowId={(d) => d.id}
          getSearchText={(d) => `${d.id} ${d.parties} ${d.related}`}
          searchPlaceholder="Search case, party, related record"
          onRowClick={(d) => setSelectedId(d.id)}
          toolbar={
            <>
              <FilterSelect label="Status" value={status} onChange={setStatus} options={[...OPEN, "Resolved", "Closed"]} />
              <FilterSelect label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
            </>
          }
          rowActions={(d) => (
            <Button size="sm" variant="outline" className="h-7 bg-background text-xs" onClick={(e) => { e.stopPropagation(); setSelectedId(d.id); }}>
              Review
            </Button>
          )}
        />

        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            {selected && (
              <div className="space-y-5">
                <SheetHeader>
                  <SheetTitle className="font-mono">{selected.id}</SheetTitle>
                  <SheetDescription>{selected.category} · {selected.parties}</SheetDescription>
                </SheetHeader>
                <div className="flex items-center gap-2"><StatusBadge status={selected.status} /></div>
                <DetailGrid
                  columns={2}
                  items={[
                    { label: "Opened", value: formatDateTime(selected.openedAt) },
                    { label: "Last update", value: formatDateTime(selected.updatedAt) },
                    { label: "Owner", value: selected.owner ?? "Unassigned" },
                    { label: "Related", value: <Link to={relatedHref(selected.related)} className="font-mono hover:underline">{selected.related}</Link> },
                    {
                      label: "Amount in dispute",
                      wide: true,
                      value: selected.amount == null ? "Not a financial dispute" : canSeeFinance ? formatCurrency(selected.amount) : "Restricted — requires finance.view",
                    },
                  ]}
                />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Evidence ({selected.evidence})</p>
                  <ul className="space-y-1.5">
                    {Array.from({ length: selected.evidence }).map((_, i) => (
                      <li key={i} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                        <FileTextIcon className="size-4 text-muted-foreground" />
                        <span className="flex-1">Submission {i + 1}</span>
                        <span className="text-xs text-muted-foreground">{i % 2 === 0 ? "From talent" : "From employer"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {selected.decision && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Decision</p>
                    <p className="mt-1 text-sm">{selected.decision}</p>
                  </div>
                )}
                {open ? (
                  <div className="grid grid-cols-2 gap-2">
                    <PermissionButton permission="disputes.manage" variant="outline" size="sm" className="bg-background" onClick={() => setAction("Request information")}>Request information</PermissionButton>
                    <PermissionButton permission="disputes.manage" variant="outline" size="sm" className="bg-background" disabled={selected.status === "Escalated"} onClick={() => setAction("Escalate")}>Escalate</PermissionButton>
                    <PermissionButton permission="disputes.manage" size="sm" className="col-span-2" onClick={() => setAction("Record decision")}>
                      <GavelIcon className="size-4" /> Record decision
                    </PermissionButton>
                  </div>
                ) : (
                  selected.status === "Resolved" && (
                    <PermissionButton permission="disputes.manage" variant="outline" size="sm" className="w-full bg-background" onClick={() => setAction("Close")}>Close case</PermissionButton>
                  )
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>

        <ConfirmActionDialog
          open={!!action && !!selected}
          onOpenChange={(o) => !o && setAction(null)}
          title={action === "Record decision" ? "Record dispute decision?" : `${action}?`}
          target={selected ? `${selected.id} · ${selected.parties}` : undefined}
          description={action === "Record decision" ? "Write the decision and rationale in the note. Both parties are notified." : undefined}
          consequences={
            action === "Record decision"
              ? ["Case moves to Resolved", "Any financial remedy is routed to Finance for execution", "Decision is permanent in the audit log"]
              : action === "Escalate"
                ? ["Case moves to Escalated", "Senior reviewer is notified"]
                : action === "Close"
                  ? ["Case becomes read-only"]
                  : ["Case moves to Awaiting information", "Parties receive an evidence request"]
          }
          confirmLabel={action ?? "Confirm"}
          requireAcknowledgement={action === "Record decision"}
          onConfirm={({ reason, note }) => {
            recordDemoAction(`${action} · ${selected?.id}`, note || reason);
            setAction(null);
          }}
        />
      </div>
    </PermissionGuard>
  );
}
