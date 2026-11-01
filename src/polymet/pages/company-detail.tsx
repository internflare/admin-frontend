import { Link, useParams } from "react-router-dom";
import { BadgeCheckIcon, ExternalLinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/polymet/components/page-header";
import { SectionCard, DetailGrid } from "@/polymet/components/section-card";
import { StatusBadge } from "@/polymet/components/status-badge";
import { DataTable } from "@/polymet/components/data-table";
import { AuditTimeline } from "@/polymet/components/audit-timeline";
import { MaskedValue, PermissionGuard } from "@/polymet/components/permission-controls";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import { EmptyState } from "@/polymet/components/state-views";
import { MetricCard } from "@/polymet/components/metric-card";
import { COMPANIES, USERS, VERIFICATION_REQUESTS } from "@/polymet/data/people-data";
import { LISTINGS, APPLICATIONS } from "@/polymet/data/jobs-data";
import { WORKSPACES } from "@/polymet/data/squadcot-data";
import { SUBSCRIPTIONS } from "@/polymet/data/commercial-data";
import { TICKETS, DISPUTES, AUDIT_EVENTS } from "@/polymet/data/operations-data";
import { formatCurrency, formatDate, maskEmail } from "@/polymet/lib/format";

export default function CompanyDetailPage() {
  const { companyId = "CMP-2001" } = useParams();
  const { can } = useAdminRole();
  const company = COMPANIES.find((c) => c.id === companyId);
  if (!company) {
    return <EmptyState title="Company not found" description={`No authorised record matches ${companyId}.`} action={<Button asChild variant="outline" size="sm"><Link to="/companies">Back to companies</Link></Button>} />;
  }
  const verification = VERIFICATION_REQUESTS.filter((v) => v.companyId === company.id);
  const listings = LISTINGS.filter((l) => l.companyId === company.id);
  const applications = APPLICATIONS.filter((a) => a.employer === company.name);
  const workspace = WORKSPACES.find((w) => w.companyId === company.id);
  const sub = SUBSCRIPTIONS.find((s) => s.accountId === company.id);
  const reps = USERS.filter((u) => u.company === company.name);
  const tickets = TICKETS.filter((t) => t.requesterId === company.id);
  const disputes = DISPUTES.filter((d) => d.parties.includes(company.name));
  const audit = AUDIT_EVENTS.filter((a) => verification.some((v) => v.id === a.entity) || listings.some((l) => l.id === a.entity) || a.entity === company.id);

  return (
    <PermissionGuard permission="companies.view">
      <div className="space-y-5">
        <PageHeader
          title={company.name}
          description={`${company.industry} · ${company.country} · ${company.size} employees`}
          breadcrumbs={[{ label: "People & organisations" }, { label: "Companies", href: "/companies" }, { label: company.id }]}
          meta={
            <>
              <StatusBadge status={company.verification} />
              <StatusBadge status={company.status} />
              <Badge variant="outline" className="font-normal">{company.plan} plan</Badge>
            </>
          }
          actions={
            verification[0] && can("companies.verify") ? (
              <Button asChild size="sm" className="h-8">
                <Link to={`/verification/${verification[0].id}`}><BadgeCheckIcon className="mr-1.5 size-3.5" /> Open verification review</Link>
              </Button>
            ) : undefined
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active listings" value={company.activeListings} />
          <MetricCard label="Applications received" value={applications.length} kind="period" />
          <MetricCard label="Recorded hires" value={company.hires} />
          <MetricCard label="Workspace members" value={workspace?.activeMembers ?? "—"} kind={workspace ? "current" : "unavailable"} />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="w-max">
              {["overview", "verification", "representatives", "listings", "recruitment", "workspace", "plan", "support", "audit"].map((t) => (
                <TabsTrigger key={t} value={t} className="text-xs capitalize">{t === "plan" ? "Subscription" : t === "support" ? "Support & disputes" : t}</TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview">
            <SectionCard title="Company details">
              <DetailGrid columns={3} items={[
                { label: "Legal name", value: company.name },
                { label: "Registration number", value: company.rcNumber ?? <span className="text-muted-foreground">Not provided</span> },
                { label: "Website", value: <a className="inline-flex items-center gap-1 hover:underline" href={`https://${company.website}`} target="_blank" rel="noreferrer">{company.website} <ExternalLinkIcon className="size-3" /></a> },
                { label: "Primary representative", value: company.representative },
                { label: "Representative email", value: <MaskedValue value={company.representativeEmail} masked={maskEmail(company.representativeEmail)} permission="users.pii" label="email" userId={company.id} /> },
                { label: "Registered", value: formatDate(company.registeredAt) },
              ]} />
            </SectionCard>
          </TabsContent>

          <TabsContent value="verification">
            <DataTable data={verification} getRowId={(v) => v.id} emptyTitle="No verification submitted" emptyDescription="This company has registered but has not submitted verification evidence. It is not verified."
              columns={[
                { key: "id", header: "Request", cell: (v) => <Link className="font-mono text-xs hover:underline" to={`/verification/${v.id}`}>{v.id}</Link> },
                { key: "sub", header: "Submitted", cell: (v) => formatDate(v.submittedAt) },
                { key: "info", header: "Required info", cell: (v) => <StatusBadge status={v.requiredInfo} /> },
                { key: "state", header: "Decision", cell: (v) => <StatusBadge status={v.state} /> },
                { key: "rev", header: "Reviewer", cell: (v) => v.reviewer ?? "Unassigned" },
              ]} />
          </TabsContent>

          <TabsContent value="representatives">
            <DataTable data={reps} getRowId={(u) => u.id} emptyTitle="No linked representatives"
              columns={[
                { key: "name", header: "Name", cell: (u) => <Link className="hover:underline" to={`/users/${u.id}`}>{u.name}</Link> },
                { key: "type", header: "Account type", cell: (u) => u.accountType },
                { key: "idv", header: "Identity", cell: (u) => <StatusBadge status={u.identityVerification} /> },
                { key: "status", header: "Status", cell: (u) => <StatusBadge status={u.status} /> },
              ]} />
          </TabsContent>

          <TabsContent value="listings">
            <DataTable data={listings} getRowId={(l) => l.id} emptyTitle="No listings published"
              columns={[
                { key: "title", header: "Listing", cell: (l) => <Link className="font-medium hover:underline" to={`/listings/${l.id}`}>{l.title}</Link> },
                { key: "type", header: "Type", cell: (l) => l.type },
                { key: "apps", header: "Applications", align: "right", cell: (l) => l.applications },
                { key: "status", header: "Moderation", cell: (l) => <StatusBadge status={l.status} /> },
              ]} />
          </TabsContent>

          <TabsContent value="recruitment">
            <DataTable data={applications} getRowId={(a) => a.id} emptyTitle="No recruitment history"
              columns={[
                { key: "cand", header: "Candidate", cell: (a) => a.candidate },
                { key: "listing", header: "Opportunity", cell: (a) => a.listing },
                { key: "stage", header: "Stage", cell: (a) => <StatusBadge status={a.stage} /> },
                { key: "sub", header: "Submitted", cell: (a) => formatDate(a.submittedAt) },
              ]} />
          </TabsContent>

          <TabsContent value="workspace">
            {workspace ? (
              <SectionCard title={`SquadCot workspace ${workspace.id}`} action={<Button asChild size="sm" variant="outline" className="bg-background"><Link to={`/workspaces/${workspace.id}`}>Open workspace</Link></Button>}>
                <DetailGrid columns={3} items={[
                  { label: "Status", value: <StatusBadge status={workspace.status} /> },
                  { label: "Health", value: <StatusBadge status={workspace.health} /> },
                  { label: "Active members", value: workspace.activeMembers },
                  { label: "Engagements", value: workspace.engagements },
                  { label: "Active projects", value: workspace.activeProjects },
                  { label: "Overdue tasks", value: workspace.overdueTasks },
                ]} />
              </SectionCard>
            ) : (
              <EmptyState title="No SquadCot workspace" description="A workspace is provisioned when the company accepts its first engagement or enables SquadCot." />
            )}
          </TabsContent>

          <TabsContent value="plan">
            {can("finance.view") ? (
              sub ? (
                <SectionCard title={`${sub.plan} plan`} action={<Button asChild size="sm" variant="outline" className="bg-background"><Link to={`/subscriptions/${sub.id}`}>View subscription</Link></Button>}>
                  <DetailGrid columns={3} items={[
                    { label: "Status", value: <StatusBadge status={sub.status} /> },
                    { label: "Amount", value: `${formatCurrency(sub.amount)} / month` },
                    { label: "Renews", value: formatDate(sub.renewsAt) },
                    { label: "Payment", value: <StatusBadge status={sub.paymentStatus} /> },
                    { label: "Entitlements active", value: sub.entitlementsActive ? "Yes" : "No — awaiting verified payment" },
                  ]} />
                </SectionCard>
              ) : <EmptyState title="Free plan" description="No paid subscription on record." />
            ) : (
              <EmptyState title="Restricted" description="Your role cannot view subscription and payment details." />
            )}
          </TabsContent>

          <TabsContent value="support" className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Support tickets">
              {tickets.length ? tickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 py-1 text-sm"><Link to={`/support/${t.id}`} className="truncate hover:underline">{t.subject}</Link><StatusBadge status={t.status} /></div>
              )) : <p className="text-sm text-muted-foreground">No tickets.</p>}
            </SectionCard>
            <SectionCard title="Disputes">
              {disputes.length ? disputes.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-2 py-1 text-sm"><Link to="/disputes" className="truncate hover:underline">{d.id} · {d.category}</Link><StatusBadge status={d.status} /></div>
              )) : <p className="text-sm text-muted-foreground">No disputes.</p>}
            </SectionCard>
          </TabsContent>

          <TabsContent value="audit">
            <SectionCard title="Audit history">
              <AuditTimeline events={audit.map((a) => ({ id: a.id, at: a.at, actor: a.actor, actorType: a.actorType, title: a.action, detail: a.reason, from: a.previous, to: a.next }))} emptyLabel="No administrative actions recorded for this company." />
            </SectionCard>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
