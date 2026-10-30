import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter, type DataColumn } from "@/polymet/components/data-table";
import { PriorityBadge, StatusBadge } from "@/polymet/components/status-badge";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import { MetricCard } from "@/polymet/components/metric-card";
import type { VerificationRequest } from "@/polymet/data/people-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDateTime, formatRelative } from "@/polymet/lib/format";

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 } as const;

export default function VerificationQueuePage() {
  const { data, loading, error, retry } = useAdminQuery(adminService.verificationRequests);
  const [state, setState] = useState("Pending review");
  const [priority, setPriority] = useState("all");
  const [reviewer, setReviewer] = useState("all");

  const rows = (data ?? []).filter(
    (v) => matchesFilter(v.state, state) && matchesFilter(v.priority, priority) && (reviewer === "all" || (reviewer === "Unassigned" ? !v.reviewer : v.reviewer === reviewer)),
  );

  const columns: DataColumn<VerificationRequest>[] = [
    {
      key: "company", header: "Company", sortValue: (v) => v.companyName, cell: (v) => (
        <div className="min-w-[180px] leading-tight">
          <Link to={`/verification/${v.id}`} className="font-medium hover:underline">{v.companyName}</Link>
          <p className="font-mono text-[11px] text-muted-foreground">{v.id}</p>
        </div>
      ),
    },
    { key: "rep", header: "Representative", hideOnMobile: true, cell: (v) => v.representative },
    { key: "where", header: "Country · industry", hideOnMobile: true, cell: (v) => <span className="text-muted-foreground">{v.country} · {v.industry}</span> },
    { key: "submitted", header: "Submitted", sortValue: (v) => v.submittedAt, cell: (v) => <span title={formatDateTime(v.submittedAt)} className="whitespace-nowrap text-xs text-muted-foreground">{formatRelative(v.submittedAt)}</span> },
    { key: "info", header: "Required info", cell: (v) => <StatusBadge status={v.requiredInfo} /> },
    { key: "state", header: "State", cell: (v) => <StatusBadge status={v.state} />, sortValue: (v) => v.state },
    { key: "priority", header: "Priority", cell: (v) => <PriorityBadge priority={v.priority} />, sortValue: (v) => PRIORITY_ORDER[v.priority] },
    { key: "reviewer", header: "Reviewer", hideOnMobile: true, cell: (v) => v.reviewer ?? <span className="text-muted-foreground">Unassigned</span> },
  ];

  const all = data ?? [];
  return (
    <PermissionGuard permission="companies.verify">
      <div className="space-y-5">
        <PageHeader
          title="Company verification"
          description="Review submitted company evidence. Company verification is separate from identity, qualification and work-evidence verification."
          breadcrumbs={[{ label: "People & organisations" }, { label: "Company verification" }]}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Pending review" value={all.filter((v) => v.state === "Pending review").length} />
          <MetricCard label="High priority" value={all.filter((v) => v.priority === "High" && v.state === "Pending review").length} />
          <MetricCard label="Awaiting company info" value={all.filter((v) => v.state === "More info requested").length} />
          <MetricCard label="Median time to decision" value="2.4 days" kind="period" />
        </div>
        <DataTable
          data={rows}
          loading={loading}
          error={error}
          onRetry={retry}
          columns={columns}
          getRowId={(v) => v.id}
          getSearchText={(v) => `${v.companyName} ${v.id} ${v.representative}`}
          searchPlaceholder="Search company or request ID"
          initialSort={{ key: "priority", dir: "asc" }}
          toolbar={
            <>
              <FilterSelect label="State" value={state} onChange={setState} options={["Pending review", "More info requested", "Verified", "Rejected"]} />
              <FilterSelect label="Priority" value={priority} onChange={setPriority} options={["High", "Medium", "Low"]} />
              <FilterSelect label="Reviewer" value={reviewer} onChange={setReviewer} options={["Unassigned", "Adaeze Okafor", "Ifeanyi Obi"]} />
            </>
          }
          rowActions={(v) => (
            <Button asChild size="sm" variant="outline" className="h-7 bg-background text-xs">
              <Link to={`/verification/${v.id}`}>Review</Link>
            </Button>
          )}
          emptyTitle="No requests in this state"
          emptyDescription="Change the state filter to see decided or waiting requests."
        />
      </div>
    </PermissionGuard>
  );
}
