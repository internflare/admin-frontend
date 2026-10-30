import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRoundIcon, MailIcon, RotateCcwIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/polymet/components/page-header";
import { MetricCard } from "@/polymet/components/metric-card";
import { DataTable, FilterSelect, matchesFilter } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { SectionCard } from "@/polymet/components/section-card";
import type { AccessCase, Invitation } from "@/polymet/data/people-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDateTime, formatRelative } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

export default function AccountAccessPage() {
  const { data, loading, error, retry } = useAdminQuery(adminService.access);
  const [caseType, setCaseType] = useState("all");
  const [inviteStatus, setInviteStatus] = useState("all");
  const [restoreCase, setRestoreCase] = useState<AccessCase | null>(null);
  const [resendInvite, setResendInvite] = useState<Invitation | null>(null);

  const cases = (data?.cases ?? []).filter((c) => matchesFilter(c.type, caseType));
  const invites = (data?.invitations ?? []).filter((i) => matchesFilter(i.status, inviteStatus));

  return (
    <PermissionGuard permission="users.manage">
      <div className="space-y-5">
        <PageHeader
          title="Invitations & account access"
          description="Account recovery assistance, invitation delivery, role reviews and access restoration. Passwords, secrets and credentials are never shown."
          breadcrumbs={[{ label: "People & organisations" }, { label: "Invitations & access" }]}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Open access cases" value={(data?.cases ?? []).filter((c) => c.status !== "Resolved").length} icon={KeyRoundIcon} />
          <MetricCard label="Pending invitations" value={(data?.invitations ?? []).filter((i) => i.status === "Pending").length} icon={MailIcon} />
          <MetricCard label="Bounced invitations" value={(data?.invitations ?? []).filter((i) => i.status === "Bounced").length} icon={MailIcon} />
          <MetricCard label="Restriction appeals" value={(data?.cases ?? []).filter((c) => c.type === "Restriction appeal").length} icon={RotateCcwIcon} />
        </div>

        <Tabs defaultValue="cases" className="space-y-4">
          <TabsList>
            <TabsTrigger value="cases">Access cases</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="states">Account states</TabsTrigger>
          </TabsList>
          <TabsContent value="cases">
            <DataTable
              data={cases}
              loading={loading}
              error={error}
              onRetry={retry}
              getRowId={(c) => c.id}
              getSearchText={(c) => `${c.id} ${c.user} ${c.userId} ${c.detail}`}
              searchPlaceholder="Search cases"
              toolbar={<FilterSelect label="Type" value={caseType} onChange={setCaseType} options={["Account recovery", "Invitation not received", "Role review", "Workspace access", "Restriction appeal"]} />}
              columns={[
                { key: "id", header: "Case", cell: (c) => <span className="font-mono text-xs">{c.id}</span>, sortValue: (c) => c.id },
                { key: "user", header: "User", cell: (c) => <Link to={`/users/${c.userId}`} className="font-medium hover:underline">{c.user}</Link> },
                { key: "type", header: "Type", cell: (c) => c.type, sortValue: (c) => c.type },
                { key: "detail", header: "Detail", hideOnMobile: true, cell: (c) => <p className="max-w-md text-xs text-muted-foreground">{c.detail}</p> },
                { key: "opened", header: "Opened", cell: (c) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatRelative(c.openedAt)}</span>, sortValue: (c) => c.openedAt },
                { key: "status", header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
              ]}
              rowActions={(c) => (
                <PermissionButton permission="users.manage" size="sm" variant="outline" className="h-7 bg-background text-xs" disabled={c.status === "Resolved"} onClick={() => setRestoreCase(c)}>
                  Resolve
                </PermissionButton>
              )}
            />
          </TabsContent>
          <TabsContent value="invitations">
            <DataTable
              data={invites}
              loading={loading}
              getRowId={(i) => i.id}
              getSearchText={(i) => `${i.email} ${i.context} ${i.invitedBy}`}
              searchPlaceholder="Search invitations"
              toolbar={<FilterSelect label="Status" value={inviteStatus} onChange={setInviteStatus} options={["Pending", "Accepted", "Expired", "Bounced", "Revoked"]} />}
              columns={[
                { key: "email", header: "Invitee", cell: (i) => <span className="font-mono text-xs">{i.email}</span> },
                { key: "context", header: "Context", cell: (i) => i.context },
                { key: "role", header: "Role", cell: (i) => i.role },
                { key: "by", header: "Invited by", hideOnMobile: true, cell: (i) => i.invitedBy },
                { key: "sent", header: "Sent", hideOnMobile: true, cell: (i) => formatDateTime(i.sentAt), sortValue: (i) => i.sentAt },
                { key: "status", header: "Status", cell: (i) => <StatusBadge status={i.status} /> },
              ]}
              rowActions={(i) => (
                <PermissionButton permission="users.manage" size="sm" variant="ghost" className="h-7 text-xs" disabled={i.status === "Accepted"} onClick={() => setResendInvite(i)}>
                  Resend
                </PermissionButton>
              )}
            />
          </TabsContent>
          <TabsContent value="states">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { s: "Active", d: "Full access according to account type and plan." },
                { s: "Pending", d: "Registered; awaiting email confirmation or onboarding." },
                { s: "Restricted", d: "Can sign in; cannot apply, publish or message. Records retained." },
                { s: "Suspended", d: "Cannot sign in. Workspace memberships suspended; company records retained." },
              ].map((x) => (
                <SectionCard key={x.s} title={x.s} action={<StatusBadge status={x.s} />}>
                  <p className="text-sm text-muted-foreground">{x.d}</p>
                </SectionCard>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <ConfirmActionDialog
          open={!!restoreCase}
          onOpenChange={(o) => !o && setRestoreCase(null)}
          title={`Resolve ${restoreCase?.type.toLowerCase() ?? "case"}`}
          target={`${restoreCase?.user} · ${restoreCase?.id}`}
          reasonOptions={["Access restored after verification", "Recovery completed via verified channel", "Invitation re-issued", "No change required", "Escalated to workspace operations"]}
          consequences={["The case is marked resolved with your reason", "Any access change is requested from the backend and audited", "The user is notified via their verified channel"]}
          confirmLabel="Resolve case"
          onConfirm={({ reason }) => recordDemoAction(`Resolved ${restoreCase?.id}`, reason)}
        />
        <ConfirmActionDialog
          open={!!resendInvite}
          onOpenChange={(o) => !o && setResendInvite(null)}
          title="Resend invitation"
          target={resendInvite?.email}
          requireReason={false}
          consequences={["The previous invitation link is revoked", "A new link valid for 7 days is sent"]}
          confirmLabel="Resend"
          onConfirm={() => recordDemoAction(`Invitation ${resendInvite?.id} resend requested`)}
        />
      </div>
    </PermissionGuard>
  );
}
