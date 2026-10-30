import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangleIcon, InfoIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter, type DataColumn } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { SectionCard, DetailGrid } from "@/polymet/components/section-card";
import { FunnelBars } from "@/polymet/components/admin-charts";
import { AuditTimeline } from "@/polymet/components/audit-timeline";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { RECRUITMENT_FUNNEL } from "@/polymet/data/dashboard-data";
import type { Application } from "@/polymet/data/jobs-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDate, formatRelative } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

const STAGES = ["Submitted", "Shortlisted", "Interview", "Test task", "Offer", "Hired", "Rejected", "Withdrawn"];

export default function ApplicationsPage() {
  const { search } = useLocation();
  const ref = new URLSearchParams(search).get("ref");
  const { data, loading, error, retry } = useAdminQuery(adminService.applications);
  const [stage, setStage] = useState("all");
  const [issues, setIssues] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(ref);
  const selected = (data ?? []).find((a) => a.id === selectedId) ?? null;

  const rows = (data ?? []).filter((a) => matchesFilter(a.stage, stage) && (issues === "all" || (issues === "With issues" ? !!a.issue : !a.issue)));

  const columns: DataColumn<Application>[] = [
    { key: "id", header: "Application", cell: (a) => <span className="font-mono text-xs">{a.id}</span>, sortValue: (a) => a.id },
    { key: "cand", header: "Candidate", sortValue: (a) => a.candidate, cell: (a) => <Link onClick={(e) => e.stopPropagation()} to={`/users/${a.candidateId}`} className="font-medium hover:underline">{a.candidate}</Link> },
    { key: "opp", header: "Opportunity", cell: (a) => <div className="min-w-[180px] leading-tight"><p>{a.listing}</p><p className="text-xs text-muted-foreground">{a.employer}</p></div> },
    { key: "stage", header: "Stage", sortValue: (a) => STAGES.indexOf(a.stage), cell: (a) => <StatusBadge status={a.stage} /> },
    { key: "match", header: "Match", align: "right", hideOnMobile: true, sortValue: (a) => a.matchScore ?? -1, cell: (a) => (a.matchScore === null ? <span className="text-xs text-muted-foreground">n/a</span> : a.matchScore) },
    { key: "sub", header: "Submitted", hideOnMobile: true, sortValue: (a) => a.submittedAt, cell: (a) => <span className="whitespace-nowrap text-xs">{formatDate(a.submittedAt)}</span> },
    { key: "act", header: "Last activity", hideOnMobile: true, sortValue: (a) => a.lastActivity, cell: (a) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatRelative(a.lastActivity)}</span> },
    { key: "issue", header: "Workflow issue", cell: (a) => (a.issue ? <span className="inline-flex items-center gap-1 text-xs text-red-600"><AlertTriangleIcon className="size-3" />{a.issue}</span> : <span className="text-xs text-muted-foreground">—</span>) },
  ];

  return (
    <PermissionGuard permission="recruitment.view">
      <div className="space-y-5">
        <PageHeader
          title="Applications & recruitment"
          description="Investigate candidate pipelines, interviews, paid test tasks and offers. Hiring decisions belong to employers; admins can investigate but not silently alter them."
          breadcrumbs={[{ label: "internflareJobs" }, { label: "Applications" }]}
        />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <DataTable
            data={rows}
            loading={loading}
            error={error}
            onRetry={retry}
            columns={columns}
            getRowId={(a) => a.id}
            onRowClick={(a) => setSelectedId(a.id)}
            getSearchText={(a) => `${a.id} ${a.candidate} ${a.listing} ${a.employer}`}
            searchPlaceholder="Search candidate, listing, ID"
            toolbar={
              <>
                <FilterSelect label="Stage" value={stage} onChange={setStage} options={STAGES} />
                <FilterSelect label="Issues" value={issues} onChange={setIssues} options={["With issues", "No issues"]} />
              </>
            }
          />
          <SectionCard title="Pipeline conversion" description="Last 30 days · recorded stage events">
            <FunnelBars steps={RECRUITMENT_FUNNEL} />
          </SectionCard>
        </div>

        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            {selected && (
              <>
                <SheetHeader>
                  <SheetTitle>{selected.candidate}</SheetTitle>
                  <SheetDescription>{selected.listing} · {selected.employer}</SheetDescription>
                </SheetHeader>
                <div className="mt-5 space-y-5">
                  <DetailGrid items={[
                    { label: "Application", value: <span className="font-mono text-xs">{selected.id}</span> },
                    { label: "Current stage", value: <StatusBadge status={selected.stage} /> },
                    { label: "Match score", value: selected.matchScore ?? "Not computed" },
                    { label: "Listing", value: <Link className="hover:underline" to={`/listings/${selected.listingId}`}>{selected.listingId}</Link> },
                  ]} />
                  {selected.issue && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm dark:border-red-500/30 dark:bg-red-500/10">{selected.issue}</div>
                  )}
                  <div>
                    <p className="mb-3 text-xs font-medium text-muted-foreground">Status history</p>
                    <AuditTimeline events={[...selected.history].reverse().map((h, i) => ({ id: `${i}`, at: h.at, actor: h.by, actorType: h.by.startsWith("Candidate") ? "User" : "User", title: h.stage }))} />
                  </div>
                  <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                    <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
                    Stage changes are made by the employer. Admins can flag workflow issues for investigation; all views are audited.
                  </div>
                  <PermissionButton permission="placements.manage" variant="outline" className="w-full bg-background" onClick={() => recordDemoAction(`Workflow investigation opened for ${selected.id}`)}>
                    Open workflow investigation
                  </PermissionButton>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </PermissionGuard>
  );
}
