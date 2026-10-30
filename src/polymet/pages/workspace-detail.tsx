import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArchiveRestoreIcon, KeyRoundIcon, SirenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/polymet/components/page-header";
import { SectionCard } from "@/polymet/components/section-card";
import { StatusBadge, PriorityBadge } from "@/polymet/components/status-badge";
import { DataTable } from "@/polymet/components/data-table";
import { MetricCard } from "@/polymet/components/metric-card";
import { AuditTimeline } from "@/polymet/components/audit-timeline";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { EmptyState } from "@/polymet/components/state-views";
import { WORKSPACES, WORKSPACE_MEMBERS, WORKSPACE_PROJECTS, WORKSPACE_REPORTS, ONBOARDING, WORKSPACE_ACCESS_ISSUES } from "@/polymet/data/squadcot-data";
import { PLACEMENTS } from "@/polymet/data/jobs-data";
import { TICKETS } from "@/polymet/data/operations-data";
import { formatDate, formatDateTime } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

export default function WorkspaceDetailPage() {
  const { workspaceId = "WSP-301" } = useParams();
  const [dialog, setDialog] = useState<"restore" | "escalate" | null>(null);
  const ws = WORKSPACES.find((w) => w.id === workspaceId);
  if (!ws) return <EmptyState title="Workspace not found" action={<Button asChild size="sm" variant="outline"><Link to="/workspaces">Back</Link></Button>} />;

  // Sample member list belongs to WSP-301; other workspaces show no member detail.
  const members = ws.id === "WSP-301" ? WORKSPACE_MEMBERS : [];
  const projects = WORKSPACE_PROJECTS.filter((p) => p.workspaceId === ws.id);
  const reports = WORKSPACE_REPORTS.filter((r) => r.workspace === ws.company);
  const onboarding = ONBOARDING.filter((o) => o.workspace === ws.company);
  const issues = WORKSPACE_ACCESS_ISSUES.filter((i) => i.workspaceId === ws.id);
  const engagements = PLACEMENTS.filter((p) => p.workspaceId === ws.id);
  const tickets = TICKETS.filter((t) => t.related.some((r) => r.label === ws.id));

  return (
    <PermissionGuard permission="workspaces.view">
      <div className="space-y-5">
        <PageHeader
          title={`${ws.company} workspace`}
          description={`SquadCot · created ${formatDate(ws.createdAt)}`}
          breadcrumbs={[{ label: "SquadCot" }, { label: "Workspaces", href: "/workspaces" }, { label: ws.id }]}
          meta={<><StatusBadge status={ws.status} /><StatusBadge status={ws.health} /></>}
          actions={
            <>
              <PermissionButton permission="workspaces.manage" size="sm" variant="outline" className="h-8 bg-background" onClick={() => setDialog("escalate")}><SirenIcon className="mr-1.5 size-3.5" />Escalate</PermissionButton>
              <PermissionButton permission="workspaces.manage" size="sm" className="h-8" disabled={!issues.some((i) => i.type === "Missing access" && i.status !== "Resolved")} onClick={() => setDialog("restore")}><KeyRoundIcon className="mr-1.5 size-3.5" />Restore access</PermissionButton>
            </>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Active members" value={ws.activeMembers} />
          <MetricCard label="Engagements" value={ws.engagements} />
          <MetricCard label="Active projects" value={ws.activeProjects} />
          <MetricCard label="Overdue tasks" value={ws.overdueTasks} />
          <MetricCard label="Pending reports" value={ws.pendingReports} />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="w-max">
              {[["overview", "Overview"], ["members", "Members"], ["engagements", "Interns & employees"], ["projects", "Projects & tasks"], ["reports", "Reports & performance"], ["onboarding", "Onboarding & handovers"], ["access", "Access history"], ["support", "Support"]].map(([v, l]) => (
                <TabsTrigger key={v} value={v} className="text-xs">{l}</TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Open issues">
              {issues.filter((i) => i.status !== "Resolved").length === 0 ? <p className="text-sm text-muted-foreground">No open access or association issues.</p> : (
                <ul className="space-y-3">
                  {issues.filter((i) => i.status !== "Resolved").map((i) => (
                    <li key={i.id} className="rounded-md border p-3">
                      <div className="flex items-center gap-2"><PriorityBadge priority={i.severity} /><span className="text-sm font-medium">{i.type}</span></div>
                      <p className="mt-1 text-xs text-muted-foreground">{i.detail}</p>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
            <SectionCard title="Retention policy">
              <div className="flex gap-3">
                <ArchiveRestoreIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Removing a member never deletes company knowledge. Projects, completed tasks, decisions, reports, files and history remain available to authorised workspace users.</p>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="members">
            <DataTable data={members} getRowId={(m) => m.id} emptyTitle="Member detail unavailable" emptyDescription="Member records for this workspace are loaded from SquadCot once connected."
              columns={[
                { key: "name", header: "Member", cell: (m) => <Link className="hover:underline" to={`/users/${m.id}`}>{m.name}</Link> },
                { key: "role", header: "Role", cell: (m) => m.role },
                { key: "eng", header: "Engagement", cell: (m) => <span className="font-mono text-xs">{m.engagement ?? "—"}</span> },
                { key: "joined", header: "Joined", cell: (m) => formatDate(m.joinedAt) },
                { key: "status", header: "Status", cell: (m) => <StatusBadge status={m.status} /> },
              ]} />
          </TabsContent>

          <TabsContent value="engagements">
            <DataTable data={engagements} getRowId={(p) => p.id} emptyTitle="No linked engagements"
              columns={[
                { key: "id", header: "Engagement", cell: (p) => <span className="font-mono text-xs">{p.id}</span> },
                { key: "cand", header: "Person", cell: (p) => p.candidate },
                { key: "type", header: "Type", cell: (p) => p.type },
                { key: "prov", header: "Workspace link", cell: (p) => <StatusBadge status={p.workspaceProvisioning} /> },
                { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
                { key: "sup", header: "Supervisor", cell: (p) => p.supervisor ?? <span className="text-muted-foreground">None</span> },
              ]} />
          </TabsContent>

          <TabsContent value="projects">
            <DataTable data={projects} getRowId={(p) => p.id} emptyTitle="No projects"
              columns={[
                { key: "name", header: "Project", cell: (p) => <span className="font-medium">{p.name}</span> },
                { key: "owner", header: "Owner", cell: (p) => p.owner },
                { key: "progress", header: "Tasks", cell: (p) => <div className="flex w-32 items-center gap-2"><Progress value={(p.completed / p.tasks) * 100} className="h-1.5" /><span className="text-xs tabular-nums">{p.completed}/{p.tasks}</span></div> },
                { key: "overdue", header: "Overdue", align: "right", cell: (p) => p.overdue },
                { key: "due", header: "Milestone due", cell: (p) => formatDate(p.dueDate) },
                { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
              ]} />
          </TabsContent>

          <TabsContent value="reports">
            <DataTable data={reports} getRowId={(r) => r.id} emptyTitle="No reports"
              columns={[
                { key: "member", header: "Member", cell: (r) => r.member },
                { key: "type", header: "Type", cell: (r) => r.type },
                { key: "period", header: "Period", cell: (r) => r.period },
                { key: "sub", header: "Submitted", cell: (r) => formatDateTime(r.submittedAt) },
                { key: "status", header: "Review", cell: (r) => <StatusBadge status={r.reviewStatus} /> },
              ]} />
          </TabsContent>

          <TabsContent value="onboarding">
            <DataTable data={onboarding} getRowId={(o) => o.id} emptyTitle="No onboarding or handovers"
              columns={[
                { key: "kind", header: "Kind", cell: (o) => o.kind },
                { key: "member", header: "Member", cell: (o) => o.member },
                { key: "check", header: "Checklist", cell: (o) => `${o.checklistDone}/${o.checklistTotal}` },
                { key: "status", header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
                { key: "note", header: "Note", cell: (o) => <span className="text-xs text-muted-foreground">{o.note ?? "—"}</span> },
              ]} />
          </TabsContent>

          <TabsContent value="access">
            <SectionCard title="Access & membership history">
              <AuditTimeline events={issues.map((i) => ({ id: i.id, at: i.detectedAt, actor: "SquadCot monitor", actorType: "System", title: `${i.type} · ${i.member}`, detail: i.detail, to: i.status, tone: i.severity === "High" ? "danger" : "default" }))} />
            </SectionCard>
          </TabsContent>

          <TabsContent value="support">
            <SectionCard title="Support issues">
              {tickets.length ? tickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 py-1 text-sm"><Link className="truncate hover:underline" to={`/support/${t.id}`}>{t.subject}</Link><StatusBadge status={t.status} /></div>
              )) : <p className="text-sm text-muted-foreground">No linked tickets.</p>}
            </SectionCard>
          </TabsContent>
        </Tabs>

        <ConfirmActionDialog
          open={!!dialog}
          onOpenChange={(o) => !o && setDialog(null)}
          title={dialog === "restore" ? "Restore workspace access" : "Escalate workspace issue"}
          target={`${ws.company} · ${ws.id}`}
          requireAcknowledgement={dialog === "restore"}
          reasonOptions={dialog === "restore" ? ["Accepted engagement — provisioning failed", "Access removed in error", "Seat entitlement corrected"] : ["Data integrity concern", "Repeated provisioning failures", "Employer complaint", "Security concern"]}
          consequences={dialog === "restore" ? ["Access is granted through the controlled provisioning flow, scoped to the member's role", "Company admin is notified", "Recorded in platform and workspace audit logs"] : ["Creates a high-priority item in the action queue", "Workspace operations lead is notified"]}
          confirmLabel={dialog === "restore" ? "Request restore" : "Escalate"}
          onConfirm={({ reason }) => recordDemoAction(dialog === "restore" ? "Access restore requested" : "Workspace escalated", reason)}
        />
      </div>
    </PermissionGuard>
  );
}
