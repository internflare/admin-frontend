import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, MoreHorizontalIcon, UserPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter, type DataColumn } from "@/polymet/components/data-table";
import { PriorityBadge, StatusBadge } from "@/polymet/components/status-badge";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import { MetricCard } from "@/polymet/components/metric-card";
import type { ActionItem } from "@/polymet/data/operations-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDateTime, formatRelative } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";
import { CURRENT_ADMIN } from "@/polymet/data/admin-roles";

const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 } as const;

export default function ActionQueuePage() {
  const { data, loading, error, retry } = useAdminQuery(adminService.actionQueue);
  const [type, setType] = useState("all");
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");
  const [period, setPeriod] = useState("all");

  const now = new Date("2025-06-11T12:00:00").getTime();
  const rows = (data ?? []).filter((r) => {
    const age = (now - new Date(r.createdAt).getTime()) / 86400000;
    const inPeriod = period === "all" || (period === "Last 24 hours" ? age <= 1 : period === "Last 7 days" ? age <= 7 : age > 7);
    return matchesFilter(r.recordType, type) && matchesFilter(r.priority, priority) && matchesFilter(r.status, status) && inPeriod;
  });

  const columns: DataColumn<ActionItem>[] = [
    { key: "priority", header: "Priority", cell: (r) => <PriorityBadge priority={r.priority} />, sortValue: (r) => PRIORITY_ORDER[r.priority] },
    {
      key: "summary", header: "Issue", cell: (r) => (
        <div className="min-w-[240px] space-y-0.5">
          <Link to={r.href} className="font-medium hover:underline">{r.summary}</Link>
          <p className="text-xs text-muted-foreground">{r.recordType} · <span className="font-mono">{r.recordRef}</span></p>
        </div>
      ),
    },
    { key: "created", header: "Created", cell: (r) => <span title={formatDateTime(r.createdAt)} className="whitespace-nowrap text-muted-foreground">{formatRelative(r.createdAt)}</span>, sortValue: (r) => r.createdAt, hideOnMobile: true },
    { key: "assignee", header: "Assigned", cell: (r) => r.assignee ?? <span className="text-muted-foreground">Unassigned</span>, sortValue: (r) => r.assignee ?? "", hideOnMobile: true },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} />, sortValue: (r) => r.status },
    {
      key: "next", header: "Recommended next action", hideOnMobile: true, cell: (r) => (
        <Link to={r.href} className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-orange-700 hover:underline dark:text-orange-400">
          {r.nextAction} <ArrowRightIcon className="size-3" />
        </Link>
      ),
    },
  ];

  const types = Array.from(new Set((data ?? []).map((d) => d.recordType)));

  return (
    <PermissionGuard permission="dashboard.view">
      <div className="space-y-5">
        <PageHeader
          title="Alerts & action queue"
          description="Prioritised work across verification, moderation, finance, integrations, workspaces and support."
          breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Action queue" }]}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Open items" value={(data ?? []).filter((d) => d.status !== "Resolved").length} />
          <MetricCard label="Critical / high" value={(data ?? []).filter((d) => d.priority === "Critical" || d.priority === "High").length} />
          <MetricCard label="Unassigned" value={(data ?? []).filter((d) => !d.assignee).length} />
          <MetricCard label="Awaiting info" value={(data ?? []).filter((d) => d.status === "Awaiting info").length} />
        </div>
        <DataTable
          data={rows}
          loading={loading}
          error={error}
          onRetry={retry}
          columns={columns}
          getRowId={(r) => r.id}
          getSearchText={(r) => `${r.summary} ${r.recordRef} ${r.recordType} ${r.assignee ?? ""}`}
          searchPlaceholder="Search issues or record IDs"
          initialSort={{ key: "priority", dir: "asc" }}
          toolbar={
            <>
              <FilterSelect label="Type" value={type} onChange={setType} options={types} />
              <FilterSelect label="Priority" value={priority} onChange={setPriority} options={["Critical", "High", "Medium", "Low"]} />
              <FilterSelect label="Status" value={status} onChange={setStatus} options={["Open", "In progress", "Awaiting info", "Resolved"]} />
              <FilterSelect label="Date" value={period} onChange={setPeriod} options={["Last 24 hours", "Last 7 days", "Older than 7 days"]} allLabel="Any time" />
            </>
          }
          rowActions={(r) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7" aria-label={`Actions for ${r.id}`}>
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link to={r.href}>Open record</Link></DropdownMenuItem>
                <DropdownMenuItem onSelect={() => recordDemoAction(`Assigned ${r.id} to ${CURRENT_ADMIN.name}`)}>
                  <UserPlusIcon className="mr-2 size-4" /> Assign to me
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => recordDemoAction(`Snoozed ${r.id} for 24h`)}>Snooze 24h</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          emptyTitle="Queue is clear"
          emptyDescription="No items match these filters. Reset filters to view all open work."
        />
      </div>
    </PermissionGuard>
  );
}
