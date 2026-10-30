import { useState } from "react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { MetricCard } from "@/polymet/components/metric-card";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import type { EvidenceItem } from "@/polymet/data/jobs-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDate, formatRelative } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

export default function TalentOversightPage({ initialTab = "portfolio" }: { initialTab?: "portfolio" | "readiness" }) {
  const { data, loading, error, retry } = useAdminQuery(adminService.talentOversight);
  const [status, setStatus] = useState("all");
  const [review, setReview] = useState<EvidenceItem | null>(null);
  const evidence = (data?.evidence ?? []).filter((e) => matchesFilter(e.status, status));
  const readiness = data?.readiness ?? [];

  return (
    <PermissionGuard permission="users.view">
      <div className="space-y-5">
        <PageHeader
          title={initialTab === "portfolio" ? "Portfolio & evidence moderation" : "Readiness & learning oversight"}
          description="Work-evidence verification is distinct from identity and qualification verification. Readiness data is advisory and never replaces employer decisions."
          breadcrumbs={[{ label: "internflareJobs" }, { label: initialTab === "portfolio" ? "Portfolio & evidence" : "Readiness & learning" }]}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Evidence pending review" value={(data?.evidence ?? []).filter((e) => e.status === "Pending review").length} />
          <MetricCard label="Reported evidence" value={(data?.evidence ?? []).filter((e) => e.status === "Reported").length} />
          <MetricCard label="Learning plans on track" value={readiness.filter((r) => r.status === "On track").length} />
          <MetricCard label="Stalled plans" value={readiness.filter((r) => r.status === "Stalled").length} />
        </div>
        <Tabs defaultValue={initialTab} key={initialTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="portfolio">Portfolio & evidence</TabsTrigger>
            <TabsTrigger value="readiness">Readiness & learning</TabsTrigger>
          </TabsList>
          <TabsContent value="portfolio">
            <DataTable
              data={evidence}
              loading={loading}
              error={error}
              onRetry={retry}
              getRowId={(e) => e.id}
              getSearchText={(e) => `${e.title} ${e.talent} ${e.id}`}
              toolbar={<FilterSelect label="Status" value={status} onChange={setStatus} options={["Pending review", "Approved", "Rejected", "Reported"]} />}
              columns={[
                { key: "title", header: "Item", cell: (e) => <div className="min-w-[200px] leading-tight"><p className="font-medium">{e.title}</p><p className="font-mono text-[11px] text-muted-foreground">{e.id}</p></div> },
                { key: "talent", header: "Talent", cell: (e) => <Link to={`/users/${e.talentId}`} className="hover:underline">{e.talent}</Link> },
                { key: "kind", header: "Kind", cell: (e) => e.kind },
                { key: "sub", header: "Submitted", sortValue: (e) => e.submittedAt, cell: (e) => <span className="text-xs text-muted-foreground">{formatRelative(e.submittedAt)}</span> },
                { key: "status", header: "Status", cell: (e) => <StatusBadge status={e.status} /> },
                { key: "reason", header: "Note", hideOnMobile: true, cell: (e) => <span className="text-xs text-muted-foreground">{e.reason ?? "—"}</span> },
              ]}
              rowActions={(e) => (
                <PermissionButton permission="users.manage" size="sm" variant="outline" className="h-7 bg-background text-xs" disabled={e.status === "Approved" || e.status === "Rejected"} onClick={() => setReview(e)}>Review</PermissionButton>
              )}
            />
          </TabsContent>
          <TabsContent value="readiness">
            <DataTable
              data={readiness}
              loading={loading}
              getRowId={(r) => r.id}
              getSearchText={(r) => `${r.talent} ${r.targetRole}`}
              columns={[
                { key: "talent", header: "Talent", cell: (r) => <Link to={`/users/${r.talentId}`} className="font-medium hover:underline">{r.talent}</Link> },
                { key: "role", header: "Target role", cell: (r) => r.targetRole },
                { key: "score", header: "Assessment", align: "right", sortValue: (r) => r.assessmentScore ?? -1, cell: (r) => r.assessmentScore ?? <span className="text-xs text-muted-foreground">Not taken</span> },
                { key: "plan", header: "Learning plan", sortValue: (r) => r.learningPlanProgress, cell: (r) => <div className="flex w-28 items-center gap-2"><Progress value={r.learningPlanProgress} className="h-1.5" /><span className="text-xs tabular-nums">{r.learningPlanProgress}%</span></div> },
                { key: "mentor", header: "Mentor linked", cell: (r) => (r.mentorLinked ? "Yes" : <span className="text-muted-foreground">No</span>) },
                { key: "last", header: "Last activity", cell: (r) => <span className="text-xs">{formatDate(r.lastActivity)}</span> },
                { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
              ]}
            />
          </TabsContent>
        </Tabs>
        <ConfirmActionDialog
          open={!!review}
          onOpenChange={(o) => !o && setReview(null)}
          title={`Review evidence · ${review?.id}`}
          target={`${review?.title} — ${review?.talent}`}
          reasonOptions={["Approve — evidence verified with issuer/employer", "Reject — cannot be verified", "Reject — content belongs to another person", "Request clarification from talent"]}
          consequences={["Only work-evidence status changes", "Talent is notified of the outcome"]}
          confirmLabel="Record decision"
          onConfirm={({ reason }) => recordDemoAction(`${reason} (${review?.id})`)}
        />
      </div>
    </PermissionGuard>
  );
}
