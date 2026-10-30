import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter, type DataColumn } from "@/polymet/components/data-table";
import { PriorityBadge, StatusBadge } from "@/polymet/components/status-badge";
import { MetricCard } from "@/polymet/components/metric-card";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import type { Workspace, WorkspaceAccessIssue } from "@/polymet/data/squadcot-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatRelative } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

export default function WorkspacesPage({ initialTab = "directory" }: { initialTab?: "directory" | "issues" }) {
  const ws = useAdminQuery(adminService.workspaces);
  const detail = useAdminQuery(adminService.workspaceDetail);
  const [health, setHealth] = useState("all");
  const [issueType, setIssueType] = useState("all");
  const [resolve, setResolve] = useState<WorkspaceAccessIssue | null>(null);

  const workspaces = (ws.data ?? []).filter((w) => matchesFilter(w.health, health));
  const issues = (detail.data?.issues ?? []).filter((i) => matchesFilter(i.type, issueType));
  const all = ws.data ?? [];

  const columns: DataColumn<Workspace>[] = [
    { key: "company", header: "Company", sortValue: (w) => w.company, cell: (w) => <div className="leading-tight"><Link to={`/workspaces/${w.id}`} className="font-medium hover:underline">{w.company}</Link><p className="font-mono text-[11px] text-muted-foreground">{w.id}</p></div> },
    { key: "members", header: "Members", align: "right", sortValue: (w) => w.activeMembers, cell: (w) => w.activeMembers },
    { key: "eng", header: "Engagements", align: "right", sortValue: (w) => w.engagements, cell: (w) => w.engagements },
    { key: "proj", header: "Projects", align: "right", hideOnMobile: true, sortValue: (w) => w.activeProjects, cell: (w) => w.activeProjects },
    { key: "tasks", header: "Outstanding tasks", align: "right", hideOnMobile: true, sortValue: (w) => w.outstandingTasks, cell: (w) => <span>{w.outstandingTasks}{w.overdueTasks > 0 && <span className="ml-1 text-xs text-red-600">({w.overdueTasks} overdue)</span>}</span> },
    { key: "reports", header: "Pending reports", align: "right", hideOnMobile: true, sortValue: (w) => w.pendingReports, cell: (w) => w.pendingReports },
    { key: "status", header: "Status", cell: (w) => <StatusBadge status={w.status} /> },
    { key: "health", header: "Access & provisioning", sortValue: (w) => w.health, cell: (w) => <StatusBadge status={w.health} /> },
    { key: "last", header: "Last activity", hideOnMobile: true, sortValue: (w) => w.lastActivity, cell: (w) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatRelative(w.lastActivity)}</span> },
  ];

  return (
    <PermissionGuard permission="workspaces.view">
      <div className="space-y-5">
        <PageHeader
          title={initialTab === "issues" ? "Access & membership issues" : "Company workspaces"}
          description="SquadCot workspaces, membership and provisioning health. When members leave, company-owned projects, tasks, reports and files remain with the company."
          breadcrumbs={[{ label: "SquadCot" }, { label: initialTab === "issues" ? "Access issues" : "Workspaces" }]}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active workspaces" value={all.filter((w) => w.status === "Active").length} />
          <MetricCard label="Workspaces with issues" value={all.filter((w) => w.health !== "Healthy").length} />
          <MetricCard label="Open access issues" value={(detail.data?.issues ?? []).filter((i) => i.status !== "Resolved").length} />
          <MetricCard label="Overdue tasks" value={all.reduce((s, w) => s + w.overdueTasks, 0)} />
        </div>
        <Tabs defaultValue={initialTab} key={initialTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="directory">Directory</TabsTrigger>
            <TabsTrigger value="issues">Access & membership issues</TabsTrigger>
          </TabsList>
          <TabsContent value="directory">
            <DataTable
              data={workspaces}
              loading={ws.loading}
              error={ws.error}
              onRetry={ws.retry}
              columns={columns}
              getRowId={(w) => w.id}
              getSearchText={(w) => `${w.company} ${w.id}`}
              toolbar={<FilterSelect label="Health" value={health} onChange={setHealth} options={["Healthy", "Degraded", "Access issues"]} />}
              rowActions={(w) => <Button asChild size="sm" variant="outline" className="h-7 bg-background text-xs"><Link to={`/workspaces/${w.id}`}>Open</Link></Button>}
            />
          </TabsContent>
          <TabsContent value="issues">
            <DataTable
              data={issues}
              loading={detail.loading}
              error={detail.error}
              onRetry={detail.retry}
              getRowId={(i) => i.id}
              getSearchText={(i) => `${i.id} ${i.workspace} ${i.member} ${i.detail}`}
              toolbar={<FilterSelect label="Type" value={issueType} onChange={setIssueType} options={["Missing access", "Engagement link mismatch", "Orphaned task", "Unexpected membership change", "Report association"]} />}
              columns={[
                { key: "sev", header: "Severity", cell: (i) => <PriorityBadge priority={i.severity} /> },
                { key: "type", header: "Issue", cell: (i) => <div className="min-w-[240px] leading-tight"><p className="font-medium">{i.type}</p><p className="text-xs text-muted-foreground">{i.detail}</p></div> },
                { key: "ws", header: "Workspace", cell: (i) => <Link to={`/workspaces/${i.workspaceId}`} className="hover:underline">{i.workspace}</Link> },
                { key: "member", header: "Member", cell: (i) => i.member },
                { key: "det", header: "Detected", hideOnMobile: true, sortValue: (i) => i.detectedAt, cell: (i) => <span className="text-xs text-muted-foreground">{formatRelative(i.detectedAt)}</span> },
                { key: "status", header: "Status", cell: (i) => <StatusBadge status={i.status} /> },
              ]}
              rowActions={(i) => (
                <PermissionButton permission="workspaces.manage" size="sm" variant="outline" className="h-7 bg-background text-xs" disabled={i.status === "Resolved"} onClick={() => setResolve(i)}>Act</PermissionButton>
              )}
            />
          </TabsContent>
        </Tabs>
        <ConfirmActionDialog
          open={!!resolve}
          onOpenChange={(o) => !o && setResolve(null)}
          title={`Resolve: ${resolve?.type}`}
          target={`${resolve?.workspace} · ${resolve?.member} · ${resolve?.id}`}
          reasonOptions={["Restore access via controlled provisioning", "Re-link engagement to workspace", "Reassign orphaned tasks to company admin", "Confirmed intentional — no change", "Escalate to engineering"]}
          consequences={["Changes run through normal workspace permissions — no bypass", "Company knowledge and history are retained", "Action recorded in workspace and platform audit logs"]}
          confirmLabel="Record action"
          onConfirm={({ reason }) => recordDemoAction(`${reason} — ${resolve?.id}`)}
        />
      </div>
    </PermissionGuard>
  );
}
