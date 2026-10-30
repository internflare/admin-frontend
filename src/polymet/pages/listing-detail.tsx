import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangleIcon, CheckIcon, PauseIcon, PencilLineIcon, XIcon, ArchiveIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/polymet/components/page-header";
import { SectionCard, DetailGrid } from "@/polymet/components/section-card";
import { StatusBadge } from "@/polymet/components/status-badge";
import { AuditTimeline } from "@/polymet/components/audit-timeline";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { EmptyState } from "@/polymet/components/state-views";
import { LISTINGS } from "@/polymet/data/jobs-data";
import { COMPANIES } from "@/polymet/data/people-data";
import { AUDIT_EVENTS } from "@/polymet/data/operations-data";
import { formatDate, formatDateTime } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

type Action = "Approve" | "Reject" | "Request changes" | "Pause" | "Close";

const REASONS: Record<Action, string[]> = {
  Approve: ["Meets listing policy", "Reviewed — reports not substantiated"],
  Reject: ["Fraud or scam indicators", "Upfront fees requested from applicants", "Company verification rejected", "Prohibited content"],
  "Request changes": ["Compensation unclear", "Unpaid internship terms incomplete", "Missing required qualifications", "Off-platform application link"],
  Pause: ["Under investigation following reports", "Broken application destination", "Employer request"],
  Close: ["Position filled", "Expired at source", "Employer account restricted"],
};

export default function ListingDetailPage() {
  const { listingId = "LST-8801" } = useParams();
  const listing = LISTINGS.find((l) => l.id === listingId);
  const [action, setAction] = useState<Action | null>(null);
  if (!listing) return <EmptyState title="Listing not found" action={<Button asChild size="sm" variant="outline"><Link to="/listings">Back to listings</Link></Button>} />;
  const company = COMPANIES.find((c) => c.id === listing.companyId);
  const history = AUDIT_EVENTS.filter((a) => a.entity === listing.id);
  const external = listing.source !== "Internal";

  return (
    <PermissionGuard permission="listings.view">
      <div className="space-y-5">
        <PageHeader
          title={listing.title}
          description={`${listing.company} · ${listing.location}`}
          breadcrumbs={[{ label: "internflareJobs" }, { label: "Listings", href: "/listings" }, { label: listing.id }]}
          meta={<><StatusBadge status={listing.status} /><Badge variant="outline" className="font-normal">{listing.type}</Badge><Badge variant="outline" className="font-normal">{listing.source}</Badge></>}
          actions={
            <>
              <PermissionButton permission="listings.moderate" size="sm" variant="outline" className="h-8 bg-background" onClick={() => setAction("Request changes")}><PencilLineIcon className="mr-1.5 size-3.5" />Request changes</PermissionButton>
              <PermissionButton permission="listings.moderate" size="sm" variant="outline" className="h-8 bg-background" disabled={listing.status === "Paused"} onClick={() => setAction("Pause")}><PauseIcon className="mr-1.5 size-3.5" />Pause</PermissionButton>
              <PermissionButton permission="listings.moderate" size="sm" variant="outline" className="h-8 bg-background" onClick={() => setAction("Close")}><ArchiveIcon className="mr-1.5 size-3.5" />Close</PermissionButton>
              <PermissionButton permission="listings.moderate" size="sm" variant="outline" className="h-8 bg-background text-red-600" onClick={() => setAction("Reject")}><XIcon className="mr-1.5 size-3.5" />Reject</PermissionButton>
              <PermissionButton permission="listings.moderate" size="sm" className="h-8" disabled={listing.status === "Published" && listing.reports === 0} onClick={() => setAction("Approve")}><CheckIcon className="mr-1.5 size-3.5" />Approve</PermissionButton>
            </>
          }
        />

        {listing.flags.length > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10" role="alert">
            <AlertTriangleIcon className="mt-0.5 size-4 text-red-600" />
            <div className="text-sm">
              <p className="font-medium">{listing.reports} report{listing.reports === 1 ? "" : "s"} · {listing.flags.length} automated flag{listing.flags.length === 1 ? "" : "s"}</p>
              <ul className="mt-1 flex flex-wrap gap-1.5">{listing.flags.map((f) => <li key={f}><StatusBadge status={f} tone="danger" showDot={false} /></li>)}</ul>
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <SectionCard title="Listing information">
              <p className="mb-4 text-sm leading-relaxed">{listing.description}</p>
              <DetailGrid columns={3} items={[
                { label: "Type", value: listing.type },
                { label: "Location", value: listing.location },
                { label: "Pay", value: listing.paid },
                { label: "Compensation", value: listing.compensation },
                { label: "Published", value: formatDate(listing.publishedAt) },
                { label: "Expires", value: formatDate(listing.expiresAt) },
                { label: "Applications", value: listing.applications },
                { label: "Last updated", value: formatDateTime(listing.updatedAt) },
              ]} />
            </SectionCard>
            <SectionCard title="Required qualifications & skills">
              {listing.skills.length ? <div className="flex flex-wrap gap-1.5">{listing.skills.map((s) => <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>)}</div> : <p className="text-sm text-muted-foreground">None specified.</p>}
            </SectionCard>
            <SectionCard title="Application destination & source">
              <DetailGrid items={[
                { label: "Source", value: listing.source },
                { label: "Destination", value: <span className="break-all font-mono text-xs">{listing.applyDestination}</span> },
                { label: "Attribution", value: external ? `Imported from ${listing.source}; original listing retained at source.` : "Posted on Internflare" },
              ]} />
            </SectionCard>
          </div>
          <div className="space-y-4">
            <SectionCard title="Company" action={company && <Button asChild size="sm" variant="ghost" className="h-7 text-xs"><Link to={`/companies/${company.id}`}>Open</Link></Button>}>
              <DetailGrid items={[
                { label: "Company", value: listing.company },
                { label: "Company verification", value: <StatusBadge status={company?.verification ?? (external ? "Not submitted" : "Unknown")} /> },
                { label: "Plan", value: company?.plan ?? "—" },
                { label: "Active listings", value: company?.activeListings ?? "—" },
              ]} />
            </SectionCard>
            <SectionCard title="Review history" description="Internal — not visible to employers or applicants">
              <AuditTimeline events={history.map((a) => ({ id: a.id, at: a.at, actor: a.actor, actorType: a.actorType, title: a.action, detail: a.reason, from: a.previous, to: a.next }))} emptyLabel="No moderation decisions yet." />
            </SectionCard>
          </div>
        </div>

        <ConfirmActionDialog
          open={!!action}
          onOpenChange={(o) => !o && setAction(null)}
          title={`${action} listing`}
          target={`${listing.title} · ${listing.id}`}
          destructive={action === "Reject" || action === "Pause"}
          reasonOptions={action ? REASONS[action] : []}
          consequences={
            action === "Approve" ? ["Listing becomes visible to talents", "Open reports are closed with your decision"]
              : action === "Reject" ? ["Listing is removed from search; applicants are informed it is unavailable", "Employer receives the policy reason only"]
                : action === "Pause" ? ["Listing is hidden; existing applications are preserved", "Employer is notified"]
                  : action === "Close" ? ["No new applications; pipeline remains accessible to employer"]
                    : ["Employer receives requested changes; listing stays unpublished until resubmitted"]
          }
          confirmLabel={action ?? ""}
          onConfirm={({ reason }) => recordDemoAction(`${action} ${listing.id}`, reason)}
        />
      </div>
    </PermissionGuard>
  );
}
