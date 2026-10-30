import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter, type DataColumn } from "@/polymet/components/data-table";
import { PriorityBadge, StatusBadge } from "@/polymet/components/status-badge";
import { MetricCard } from "@/polymet/components/metric-card";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import type { SupportTicket } from "@/polymet/data/operations-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatRelative } from "@/polymet/lib/format";

const OPEN_STATES = ["Open", "In review", "Awaiting information", "Escalated"];

export default function SupportPage({ initialView = "all" }: { initialView?: "all" | "escalated" }) {
  const { data, loading, error, retry } = useAdminQuery(adminService.tickets);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const userFilter = params.get("user");
  const [status, setStatus] = useState(initialView === "escalated" ? "Escalated" : "all");
  const [area, setArea] = useState("all");
  const [priority, setPriority] = useState("all");
  const [assignee, setAssignee] = useState("all");

  const all = data ?? [];
  const rows = all.filter(
    (t) =>
      matchesFilter(t.status, status) &&
      matchesFilter(t.area, area) &&
      matchesFilter(t.priority, priority) &&
      (assignee === "all" || (assignee === "Unassigned" ? !t.assignee : t.assignee === assignee)) &&
      (!userFilter || t.requesterId === userFilter),
  );
  const assignees = Array.from(new Set(all.map((t) => t.assignee).filter(Boolean))) as string[];

  const columns: DataColumn<SupportTicket>[] = [
    {
      key: "subject",
      header: "Ticket",
      sortValue: (t) => t.subject,
      cell: (t) => (
        <div className="max-w-[340px] leading-tight">
          <Link to={`/support/${t.id}`} className="font-medium hover:underline">{t.subject}</Link>
          <p className="font-mono text-[11px] text-muted-foreground">{t.id} · {t.category}</p>
        </div>
      ),
    },
    { key: "req", header: "Requester", sortValue: (t) => t.requester, cell: (t) => <span className="text-sm">{t.requester}</span> },
    { key: "area", header: "Area", hideOnMobile: true, cell: (t) => t.area },
    { key: "pri", header: "Priority", sortValue: (t) => ["Critical", "High", "Medium", "Low"].indexOf(t.priority), cell: (t) => <PriorityBadge priority={t.priority} /> },
    { key: "status", header: "Status", sortValue: (t) => t.status, cell: (t) => <StatusBadge status={t.status} /> },
    { key: "assignee", header: "Assignee", cell: (t) => t.assignee ?? <span className="text-xs text-muted-foreground">Unassigned</span> },
    { key: "upd", header: "Updated", sortValue: (t) => t.updatedAt, cell: (t) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatRelative(t.updatedAt)}</span> },
  ];

  const escalated = initialView === "escalated";

  return (
    <PermissionGuard permission="support.view">
      <div className="space-y-5">
        <PageHeader
          title={escalated ? "Reports & escalations" : "Support tickets"}
          description={escalated ? "Tickets escalated to specialist teams, including fraud reports and billing issues awaiting Finance." : "Customer conversations across internflareJobs, SquadCot, billing and accounts. Internal notes are never visible to the requester."}
          breadcrumbs={[{ label: "Trust & operations" }, { label: escalated ? "Escalations" : "Support" }]}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Open tickets" value={all.filter((t) => OPEN_STATES.includes(t.status)).length} />
          <MetricCard label="Escalated" value={all.filter((t) => t.status === "Escalated").length} />
          <MetricCard label="Unassigned" value={all.filter((t) => !t.assignee && OPEN_STATES.includes(t.status)).length} />
          <MetricCard label="Median first response" value="1h 10m" kind="period" footnote="Last 30 days · sample figure" />
        </div>
        {userFilter && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Filtered to requester</span>
            <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{userFilter}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-7"
              onClick={() => {
                params.delete("user");
                setParams(params);
              }}
            >
              <XIcon className="size-3.5" /> Clear
            </Button>
          </div>
        )}
        <DataTable
          data={rows}
          loading={loading}
          error={error}
          onRetry={retry}
          columns={columns}
          getRowId={(t) => t.id}
          getSearchText={(t) => `${t.id} ${t.subject} ${t.requester} ${t.requesterId} ${t.related.map((r) => r.label).join(" ")}`}
          searchPlaceholder="Search ticket, requester, related record"
          onRowClick={(t) => navigate(`/support/${t.id}`)}
          initialSort={{ key: "upd", dir: "desc" }}
          emptyTitle={escalated ? "No escalated tickets" : "No tickets match"}
          toolbar={
            <>
              <FilterSelect label="Status" value={status} onChange={setStatus} options={[...OPEN_STATES, "Resolved", "Closed"]} />
              <FilterSelect label="Area" value={area} onChange={setArea} options={["internflareJobs", "SquadCot", "Billing", "Account"]} />
              <FilterSelect label="Priority" value={priority} onChange={setPriority} options={["Critical", "High", "Medium", "Low"]} />
              <FilterSelect label="Assignee" value={assignee} onChange={setAssignee} options={[...assignees, "Unassigned"]} />
            </>
          }
          rowActions={(t) => (
            <Button asChild size="sm" variant="outline" className="h-7 bg-background text-xs" onClick={(e) => e.stopPropagation()}>
              <Link to={`/support/${t.id}`}>Open</Link>
            </Button>
          )}
        />
      </div>
    </PermissionGuard>
  );
}
