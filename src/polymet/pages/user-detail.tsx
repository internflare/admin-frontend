import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { BanIcon, CheckIcon, ClockIcon, FileSearchIcon, LifeBuoyIcon, RotateCcwIcon, ShieldAlertIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/polymet/components/page-header";
import { SectionCard, DetailGrid } from "@/polymet/components/section-card";
import { StatusBadge } from "@/polymet/components/status-badge";
import { DataTable } from "@/polymet/components/data-table";
import { AuditTimeline } from "@/polymet/components/audit-timeline";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { MaskedValue, PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import { EmptyState } from "@/polymet/components/state-views";
import { USERS, MENTOR_BOOKINGS } from "@/polymet/data/people-data";
import { APPLICATIONS, PLACEMENTS, EVIDENCE, READINESS } from "@/polymet/data/jobs-data";
import { SUBSCRIPTIONS, TRANSACTIONS } from "@/polymet/data/commercial-data";
import { TICKETS, AUDIT_EVENTS, NOTIFICATION_EVENTS } from "@/polymet/data/operations-data";
import { formatCurrency, formatDate, formatDateTime, formatRelative, maskEmail, maskPhone } from "@/polymet/lib/format";
import { toast } from "sonner";
import { adminService } from "@/polymet/lib/admin-service";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

const TABS = [
  ["overview", "Overview"], ["profile", "Profile"], ["verification", "Verification"], ["applications", "Applications"],
  ["history", "Employment & internships"], ["evidence", "Portfolio & evidence"], ["readiness", "Learning & readiness"],
  ["mentorship", "Mentorship"], ["workspaces", "Workspaces"], ["billing", "Subscription & payments"],
  ["support", "Notifications & support"], ["activity", "Admin activity"],
] as const;

type PendingAction = { kind: "restrict" | "suspend" | "restore"; label: string } | null;

export default function UserDetailPage() {
  const { userId = "USR-10421" } = useParams();
  const { search } = useLocation();
  const initialTab = new URLSearchParams(search).get("tab") ?? "overview";
  const { can } = useAdminRole();
  const user = USERS.find((u) => u.id === userId);
  const [dialog, setDialog] = useState<PendingAction>(null);
  const [verifyDialog, setVerifyDialog] = useState<{ kind: string; decision: string } | null>(null);
  const [requested, setRequested] = useState<string | null>(null);

  if (!user) {
    return <EmptyState title="User not found" description={`No authorised record matches ${userId}.`} action={<Button asChild variant="outline" size="sm"><Link to="/users">Back to users</Link></Button>} />;
  }

  const applications = APPLICATIONS.filter((a) => a.candidateId === user.id);
  const placements = PLACEMENTS.filter((p) => p.candidateId === user.id);
  const evidence = EVIDENCE.filter((e) => e.talentId === user.id);
  const readiness = READINESS.filter((r) => r.talentId === user.id);
  const bookings = MENTOR_BOOKINGS.filter((b) => b.mentee === user.name || b.mentor === user.name);
  const subs = SUBSCRIPTIONS.filter((s) => s.accountId === user.id);
  const txns = TRANSACTIONS.filter((t) => t.payer === user.name || t.payee === user.name);
  const tickets = TICKETS.filter((t) => t.requesterId === user.id);
  const audit = AUDIT_EVENTS.filter((a) => a.entity === user.id);
  const notifications = NOTIFICATION_EVENTS.filter((n) => n.recipient === user.email || n.recipient === user.id);
  const isRestricted = user.status === "Restricted" || user.status === "Suspended";

  const verificationRows = [
    { kind: "Identity verification", status: user.identityVerification, detail: "Government ID and liveness check" },
    { kind: "Qualification verification", status: user.qualificationVerification, detail: "Degrees, certificates and transcripts" },
    { kind: "Work-evidence verification", status: evidence.some((e) => e.status === "Approved") ? "Verified" : evidence.length ? "Pending review" : "Not submitted", detail: "Completion letters, references and project evidence" },
  ];

  return (
    <PermissionGuard permission="users.view">
      <div className="space-y-5">
        <PageHeader
          title={user.name}
          description={`${user.headline} · ${user.location}`}
          breadcrumbs={[{ label: "People & organisations" }, { label: "Users", href: "/users" }, { label: user.id }]}
          meta={
            <>
              <StatusBadge status={user.status} />
              <Badge variant="outline" className="font-normal">{user.accountType}</Badge>
              <Badge variant="outline" className="font-normal">{user.plan} plan</Badge>
              <span className="font-mono text-xs text-muted-foreground">{user.id}</span>
            </>
          }
          actions={
            <>
              <Button asChild variant="outline" size="sm" className="h-8 bg-background">
                <Link to={`/support?user=${user.id}`}><LifeBuoyIcon className="mr-1.5 size-3.5" /> Support history</Link>
              </Button>
              {isRestricted ? (
                <PermissionButton permission="users.manage" size="sm" className="h-8" onClick={() => setDialog({ kind: "restore", label: "Restore access" })}>
                  <RotateCcwIcon className="mr-1.5 size-3.5" /> Restore access
                </PermissionButton>
              ) : (
                <>
                  <PermissionButton permission="users.manage" variant="outline" size="sm" className="h-8 bg-background" onClick={() => setDialog({ kind: "restrict", label: "Restrict account" })}>
                    <ShieldAlertIcon className="mr-1.5 size-3.5" /> Restrict
                  </PermissionButton>
                  <PermissionButton permission="users.manage" variant="destructive" size="sm" className="h-8" onClick={() => setDialog({ kind: "suspend", label: "Suspend account" })}>
                    <BanIcon className="mr-1.5 size-3.5" /> Suspend
                  </PermissionButton>
                </>
              )}
            </>
          }
        />

        {requested && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-500/30 dark:bg-amber-500/10" role="status">
            <ClockIcon className="mt-0.5 size-4 text-amber-600" />
            <p><span className="font-medium">{requested}</span> requested — awaiting backend confirmation. The account status shown above has not changed.</p>
          </div>
        )}

        <Tabs defaultValue={initialTab} key={initialTab} className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="h-9 w-max">
              {TABS.filter(([v]) => v !== "billing" || can("finance.view")).map(([value, label]) => (
                <TabsTrigger key={value} value={value} className="text-xs">{label}</TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <SectionCard title="Account">
              <div className="mb-4 flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={user.avatar} alt="" />
                  <AvatarFallback>{user.name.split(" ").map((p) => p[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.company ?? user.accountType}</p>
                </div>
              </div>
              <DetailGrid
                items={[
                  { label: "Email", value: <MaskedValue value={user.email} masked={maskEmail(user.email)} permission="users.pii" label="email" userId={user.id} /> },
                  { label: "Phone", value: <MaskedValue value={user.phone} masked={maskPhone(user.phone)} permission="users.pii" label="phone" userId={user.id} /> },
                  { label: "Registered", value: formatDate(user.registeredAt) },
                  { label: "Last active", value: formatRelative(user.lastActiveAt) },
                  { label: "Profile completion", value: <div className="flex items-center gap-2"><Progress value={user.profileCompletion} className="h-1.5 w-28" /> {user.profileCompletion}%</div> },
                  { label: "Subscription", value: user.plan },
                  { label: "Password & credentials", value: <span className="text-muted-foreground">Never displayed. Use access assistance for recovery.</span>, wide: true },
                ]}
              />
            </SectionCard>
            <div className="space-y-4">
              <SectionCard title="Verification summary">
                <ul className="space-y-2.5">
                  {verificationRows.map((v) => (
                    <li key={v.kind} className="flex items-center justify-between gap-2 text-sm">
                      <span>{v.kind}</span>
                      <StatusBadge status={v.status} />
                    </li>
                  ))}
                </ul>
              </SectionCard>
              <SectionCard title="At a glance">
                <DetailGrid
                  items={[
                    { label: "Applications", value: applications.length },
                    { label: "Engagements", value: placements.length },
                    { label: "Open tickets", value: tickets.filter((t) => !["Resolved", "Closed"].includes(t.status)).length },
                    { label: "Reports against profile", value: user.status === "Restricted" ? 1 : 0 },
                  ]}
                />
              </SectionCard>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <SectionCard title="Public profile" description="As visible to employers. Internal notes are never shown here.">
              <DetailGrid items={[
                { label: "Headline", value: user.headline },
                { label: "Location", value: user.location },
                { label: "Account type", value: user.accountType },
                { label: "Organisation", value: user.company ?? "—" },
              ]} />
              <div className="mt-4 flex gap-2">
                <PermissionButton permission="users.manage" variant="outline" size="sm" className="bg-background" onClick={() => recordDemoAction(`Opened profile report review for ${user.id}`)}>
                  <FileSearchIcon className="mr-1.5 size-3.5" /> Review reported profile
                </PermissionButton>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="verification" className="grid gap-4 md:grid-cols-3">
            {verificationRows.map((v) => (
              <SectionCard key={v.kind} title={v.kind} description={v.detail} action={<StatusBadge status={v.status} />}>
                <div className="flex flex-wrap gap-2">
                  <PermissionButton permission="users.manage" size="sm" disabled={v.status === "Verified" || v.status === "Not submitted"} onClick={() => setVerifyDialog({ kind: v.kind, decision: "Approve" })}>
                    <CheckIcon className="mr-1 size-3.5" /> Approve
                  </PermissionButton>
                  <PermissionButton permission="users.manage" size="sm" variant="outline" className="bg-background" disabled={v.status === "Not submitted"} onClick={() => setVerifyDialog({ kind: v.kind, decision: "Request more information" })}>
                    Request info
                  </PermissionButton>
                  <PermissionButton permission="users.manage" size="sm" variant="ghost" className="text-red-600" disabled={v.status === "Not submitted"} onClick={() => setVerifyDialog({ kind: v.kind, decision: "Reject" })}>
                    Reject
                  </PermissionButton>
                </div>
                {v.status === "Not submitted" && <p className="mt-3 text-xs text-muted-foreground">Nothing submitted. Decisions are only possible on submitted evidence.</p>}
              </SectionCard>
            ))}
          </TabsContent>

          <TabsContent value="applications">
            <DataTable data={applications} getRowId={(a) => a.id} pageSize={5} emptyTitle="No applications" emptyDescription="This user hasn't applied to any listings."
              columns={[
                { key: "id", header: "Application", cell: (a) => <span className="font-mono text-xs">{a.id}</span> },
                { key: "listing", header: "Opportunity", cell: (a) => <Link className="hover:underline" to={`/listings/${a.listingId}`}>{a.listing}</Link> },
                { key: "employer", header: "Employer", cell: (a) => a.employer },
                { key: "stage", header: "Stage", cell: (a) => <StatusBadge status={a.stage} /> },
                { key: "submitted", header: "Submitted", cell: (a) => formatDate(a.submittedAt) },
              ]} />
          </TabsContent>

          <TabsContent value="history">
            <DataTable data={placements} getRowId={(p) => p.id} pageSize={5} emptyTitle="No employment or internship records"
              columns={[
                { key: "id", header: "Engagement", cell: (p) => <span className="font-mono text-xs">{p.id}</span> },
                { key: "employer", header: "Employer", cell: (p) => p.employer },
                { key: "role", header: "Opportunity", cell: (p) => p.opportunity },
                { key: "type", header: "Type", cell: (p) => p.type },
                { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
                { key: "outcome", header: "Recorded outcome", cell: (p) => <StatusBadge status={p.outcome === "—" ? "Not recorded" : p.outcome} /> },
              ]} />
          </TabsContent>

          <TabsContent value="evidence">
            <DataTable data={evidence} getRowId={(e) => e.id} pageSize={5} emptyTitle="No portfolio or evidence submitted"
              columns={[
                { key: "title", header: "Item", cell: (e) => e.title },
                { key: "kind", header: "Kind", cell: (e) => e.kind },
                { key: "status", header: "Moderation", cell: (e) => <StatusBadge status={e.status} /> },
                { key: "reason", header: "Note", cell: (e) => <span className="text-xs text-muted-foreground">{e.reason ?? "—"}</span> },
              ]} />
          </TabsContent>

          <TabsContent value="readiness">
            <DataTable data={readiness} getRowId={(r) => r.id} pageSize={5} emptyTitle="No readiness or learning activity"
              columns={[
                { key: "role", header: "Target role", cell: (r) => r.targetRole },
                { key: "score", header: "Assessment", cell: (r) => (r.assessmentScore ?? "Not taken") },
                { key: "plan", header: "Learning plan", cell: (r) => `${r.learningPlanProgress}%` },
                { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
              ]} />
          </TabsContent>

          <TabsContent value="mentorship">
            <DataTable data={bookings} getRowId={(b) => b.id} pageSize={5} emptyTitle="No mentorship bookings"
              columns={[
                { key: "topic", header: "Session", cell: (b) => b.topic },
                { key: "mentor", header: "Mentor", cell: (b) => b.mentor },
                { key: "when", header: "Scheduled", cell: (b) => formatDateTime(b.scheduledAt) },
                { key: "status", header: "Status", cell: (b) => <StatusBadge status={b.status} /> },
              ]} />
          </TabsContent>

          <TabsContent value="workspaces">
            <DataTable data={placements.filter((p) => p.workspaceId)} getRowId={(p) => p.id} pageSize={5} emptyTitle="No SquadCot workspace memberships"
              columns={[
                { key: "ws", header: "Workspace", cell: (p) => <Link className="font-mono text-xs hover:underline" to={`/workspaces/${p.workspaceId}`}>{p.workspaceId}</Link> },
                { key: "company", header: "Company", cell: (p) => p.employer },
                { key: "eng", header: "Linked engagement", cell: (p) => <span className="font-mono text-xs">{p.id}</span> },
                { key: "prov", header: "Access provisioning", cell: (p) => <StatusBadge status={p.workspaceProvisioning} /> },
              ]} />
          </TabsContent>

          {can("finance.view") && (
            <TabsContent value="billing" className="space-y-4">
              <DataTable data={subs} getRowId={(s) => s.id} pageSize={5} emptyTitle="No subscriptions"
                columns={[
                  { key: "id", header: "Subscription", cell: (s) => <Link className="font-mono text-xs hover:underline" to={`/subscriptions/${s.id}`}>{s.id}</Link> },
                  { key: "plan", header: "Plan", cell: (s) => s.plan },
                  { key: "status", header: "Status", cell: (s) => <StatusBadge status={s.status} /> },
                  { key: "renews", header: "Renews", cell: (s) => formatDate(s.renewsAt) },
                ]} />
              <DataTable data={txns} getRowId={(t) => t.id} pageSize={5} emptyTitle="No payment records"
                columns={[
                  { key: "id", header: "Transaction", cell: (t) => <span className="font-mono text-xs">{t.id}</span> },
                  { key: "cat", header: "Category", cell: (t) => t.category },
                  { key: "amt", header: "Gross", align: "right", cell: (t) => formatCurrency(t.gross, t.currency) },
                  { key: "status", header: "Status", cell: (t) => <StatusBadge status={t.status} /> },
                ]} />
            </TabsContent>
          )}

          <TabsContent value="support" className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Support tickets">
              {tickets.length === 0 ? <p className="text-sm text-muted-foreground">No tickets.</p> : (
                <ul className="space-y-2">
                  {tickets.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                      <Link to={`/support/${t.id}`} className="truncate hover:underline">{t.subject}</Link>
                      <StatusBadge status={t.status} />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
            <SectionCard title="Recent notifications">
              {notifications.length === 0 ? <p className="text-sm text-muted-foreground">No notification events in the last 30 days.</p> : (
                <ul className="space-y-2">
                  {notifications.map((n) => (
                    <li key={n.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">{n.template}</span>
                      <StatusBadge status={n.status} />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </TabsContent>

          <TabsContent value="activity">
            <SectionCard title="Administrative activity" description="Immutable record of admin and system actions on this account">
              <AuditTimeline
                events={audit.map((a) => ({ id: a.id, at: a.at, actor: a.actor, actorType: a.actorType, title: a.action, detail: a.reason, from: a.previous, to: a.next, tone: a.outcome === "Denied" ? "danger" : "default" }))}
                emptyLabel="No administrative actions recorded for this account."
              />
            </SectionCard>
          </TabsContent>
        </Tabs>

        <ConfirmActionDialog
          open={!!dialog}
          onOpenChange={(o) => !o && setDialog(null)}
          title={dialog?.label ?? ""}
          target={`${user.name} (${user.id})`}
          destructive={dialog?.kind !== "restore"}
          requireAcknowledgement={dialog?.kind === "suspend"}
          reasonOptions={dialog?.kind === "restore" ? ["Appeal upheld", "Verification resolved", "Error in original restriction"] : ["Fraud or scam indicators", "Identity verification failed", "Terms of service violation", "Harassment or abuse report", "Security concern"]}
          consequences={
            dialog?.kind === "suspend"
              ? ["User is signed out of all sessions and cannot sign in", "Active applications are frozen; employers see ‘unavailable’", "Workspace memberships are suspended — company records remain intact", "The user is notified with the policy reference, not internal notes"]
              : dialog?.kind === "restrict"
                ? ["User can sign in but cannot apply, message or publish", "Existing records and workspace history are retained", "User is notified of the restriction and appeal route"]
                : ["Full access is restored", "User is notified that access has been restored"]
          }
          confirmLabel={dialog?.label}
          onConfirm={async ({ reason, note }) => {
            if (!dialog || !user) return;
            const targetStatus = dialog.kind === "suspend" ? "Suspended" : dialog.kind === "restrict" ? "Restricted" : "Active";
            await adminService.updateUserStatus(user.id, {
              status: targetStatus,
              reason,
              note,
            });
            toast.success(`User status updated to ${targetStatus}`, {
              description: `Audit event registered. User ${user.id} set to ${targetStatus}.`,
            });
            setRequested(dialog?.label ?? null);
          }}
        />
        <ConfirmActionDialog
          open={!!verifyDialog}
          onOpenChange={(o) => !o && setVerifyDialog(null)}
          title={`${verifyDialog?.decision}: ${verifyDialog?.kind}`}
          target={`${user.name} (${user.id})`}
          destructive={verifyDialog?.decision === "Reject"}
          consequences={["Decision, reviewer and timestamp are recorded", "Only this verification type changes — other verifications are unaffected", "User receives the configured verification notification"]}
          confirmLabel={verifyDialog?.decision}
          onConfirm={async ({ note }) => {
            if (!verifyDialog || !user) return;
            await adminService.submitVerificationDecision(user.id, {
              decision: verifyDialog.decision === "Verify" ? "Approve" : "Reject",
              reason: `${verifyDialog.kind} verification decision`,
              note,
            });
            toast.success(`Verification ${verifyDialog.decision.toLowerCase()}ed: ${verifyDialog.kind}`, {
              description: `Audit record created for ${user.name} (${user.id}).`,
            });
          }}
        />
      </div>
    </PermissionGuard>
  );
}
