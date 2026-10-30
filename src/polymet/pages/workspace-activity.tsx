import { useState } from "react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { MetricCard } from "@/polymet/components/metric-card";
import { SectionCard } from "@/polymet/components/section-card";
import { TrendChart } from "@/polymet/components/admin-charts";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import { WORKSPACE_ACTIVITY_SERIES } from "@/polymet/data/dashboard-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDate, formatDateTime } from "@/polymet/lib/format";

type Tab = "projects" | "reports" | "onboarding";
const TITLES: Record<Tab, string> = { projects: "Projects & tasks", reports: "Reports & performance", onboarding: "Onboarding & handovers" };

export default function WorkspaceActivityPage({ initialTab = "projects" }: { initialTab?: Tab }) {
  const { data, loading, error, retry } = useAdminQuery(adminService.workspaceDetail);
  const [projectStatus, setProjectStatus] = useState("all");
  const [reportStatus, setReportStatus] = useState("all");
  const [kind, setKind] = useState("all");

  const projects = (data?.projects ?? []).filter((p) => matchesFilter(p.status, projectStatus));
  const reports = (data?.reports ?? []).filter((r) => matchesFilter(r.reviewStatus, reportStatus));
  const onboarding = (data?.onboarding ?? []).filter((o) => matchesFilter(o.kind, kind));

  return (
    <PermissionGuard permission="workspaces.view">
      <div className="space-y-5">
        <PageHeader title={TITLES[initialTab]} description="Cross-workspace view of SquadCot delivery activity. Read-only — work is managed by each company inside its workspace." breadcrumbs={[{ label: "SquadCot" }, { label: TITLES[initialTab] }]} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Task completion" value="91.3%" kind="period" />
          <MetricCard label="Overdue tasks" value={(data?.projects ?? []).reduce((s, p) => s + p.overdue, 0)} />
          <MetricCard label="Overdue reports" value={(data?.reports ?? []).filter((r) => r.reviewStatus === "Overdue").length} />
          <MetricCard label="Blocked onboarding / handovers" value={(data?.onboarding ?? []).filter((o) => o.status === "Blocked").length} />
        </div>
        <Tabs defaultValue={initialTab} key={initialTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects">Projects & tasks</TabsTrigger>
            <TabsTrigger value="reports">Reports & performance</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding & handovers</TabsTrigger>
          </TabsList>
          <TabsContent value="projects" className="space-y-4">
            <SectionCard title="Weekly task activity">
              <TrendChart data={WORKSPACE_ACTIVITY_SERIES} xKey="week" variant="bar" height={180} series={[{ key: "completed", label: "Completed", color: "hsl(var(--chart-1))" }, { key: "overdue", label: "Overdue", color: "hsl(var(--chart-3))" }]} />
            </SectionCard>
            <DataTable data={projects} loading={loading} error={error} onRetry={retry} getRowId={(p) => p.id} getSearchText={(p) => `${p.name} ${p.workspace} ${p.owner}`}
              toolbar={<FilterSelect label="Status" value={projectStatus} onChange={setProjectStatus} options={["On track", "At risk", "Overdue", "Completed"]} />}
              columns={[
                { key: "name", header: "Project", sortValue: (p) => p.name, cell: (p) => <span className="font-medium">{p.name}</span> },
                { key: "ws", header: "Workspace", cell: (p) => <Link className="hover:underline" to={`/workspaces/${p.workspaceId}`}>{p.workspace}</Link> },
                { key: "owner", header: "Owner", hideOnMobile: true, cell: (p) => p.owner },
                { key: "tasks", header: "Tasks", sortValue: (p) => p.completed / p.tasks, cell: (p) => <div className="flex w-32 items-center gap-2"><Progress value={(p.completed / p.tasks) * 100} className="h-1.5" /><span className="text-xs tabular-nums">{p.completed}/{p.tasks}</span></div> },
                { key: "overdue", header: "Overdue", align: "right", sortValue: (p) => p.overdue, cell: (p) => p.overdue },
                { key: "due", header: "Due", sortValue: (p) => p.dueDate, cell: (p) => <span className="text-xs">{formatDate(p.dueDate)}</span> },
                { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
              ]} />
          </TabsContent>
          <TabsContent value="reports">
            <DataTable data={reports} loading={loading} getRowId={(r) => r.id} getSearchText={(r) => `${r.member} ${r.workspace} ${r.type}`}
              toolbar={<FilterSelect label="Review" value={reportStatus} onChange={setReportStatus} options={["Submitted", "Reviewed", "Overdue", "Awaiting supervisor"]} />}
              columns={[
                { key: "member", header: "Member", cell: (r) => <span className="font-medium">{r.member}</span> },
                { key: "ws", header: "Workspace", cell: (r) => r.workspace },
                { key: "type", header: "Type", cell: (r) => r.type },
                { key: "period", header: "Period", cell: (r) => r.period },
                { key: "sub", header: "Submitted", hideOnMobile: true, cell: (r) => <span className="text-xs">{r.submittedAt ? formatDateTime(r.submittedAt) : "Not submitted"}</span> },
                { key: "rating", header: "Rating", align: "right", cell: (r) => r.rating ?? "—" },
                { key: "status", header: "Review", cell: (r) => <StatusBadge status={r.reviewStatus} /> },
              ]} />
          </TabsContent>
          <TabsContent value="onboarding">
            <DataTable data={onboarding} loading={loading} getRowId={(o) => o.id} getSearchText={(o) => `${o.member} ${o.workspace}`}
              toolbar={<FilterSelect label="Kind" value={kind} onChange={setKind} options={["Onboarding", "Handover"]} />}
              columns={[
                { key: "id", header: "Record", cell: (o) => <span className="font-mono text-xs">{o.id}</span> },
                { key: "kind", header: "Kind", cell: (o) => o.kind },
                { key: "member", header: "Member", cell: (o) => o.member },
                { key: "ws", header: "Workspace", cell: (o) => o.workspace },
                { key: "check", header: "Checklist", cell: (o) => <div className="flex w-28 items-center gap-2"><Progress value={(o.checklistDone / o.checklistTotal) * 100} className="h-1.5" /><span className="text-xs tabular-nums">{o.checklistDone}/{o.checklistTotal}</span></div> },
                { key: "status", header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
                { key: "note", header: "Note", hideOnMobile: true, cell: (o) => <span className="text-xs text-muted-foreground">{o.note ?? "—"}</span> },
              ]} />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
