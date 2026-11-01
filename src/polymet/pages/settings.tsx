import { useState } from "react";
import { CheckIcon, LockIcon, MinusIcon, UserPlusIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/polymet/components/page-header";
import { SectionCard } from "@/polymet/components/section-card";
import { StatusBadge } from "@/polymet/components/status-badge";
import { DataTable, type DataColumn } from "@/polymet/components/data-table";
import { PermissionGuard, PermissionButton } from "@/polymet/components/permission-controls";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { ADMIN_ROLES, PERMISSION_LABELS, type Permission } from "@/polymet/data/admin-roles";
import type { FeatureState } from "@/polymet/data/dashboard-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatRelative } from "@/polymet/lib/format";
import { toast } from "sonner";

type Tab = "platform" | "admins" | "features" | "security";
type AdminUser = { id: string; name: string; email: string; role: string; mfa: boolean; lastActive: string; status: string };
type Flag = { key: string; name: string; area: string; state: FeatureState; note: string };

const STATE_TONE: Record<FeatureState, "success" | "danger" | "neutral" | "pending"> = {
  Enabled: "success",
  Disabled: "danger",
  Planned: "neutral",
  "Awaiting configuration": "pending",
};
const LOCKED_FLAGS = ["commerce.wallet", "commerce.escrow", "commerce.payouts", "commerce.platform_fee"];

const TITLES: Record<Tab, { title: string; crumb: string }> = {
  platform: { title: "Platform settings", crumb: "Platform" },
  admins: { title: "Admin users & roles", crumb: "Admin users" },
  features: { title: "Feature availability", crumb: "Features" },
  security: { title: "Security & configuration", crumb: "Security" },
};

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="sm:w-64 sm:shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage({ initialTab = "platform" }: { initialTab?: Tab }) {
  const admins = useAdminQuery(adminService.adminUsers);
  const flags = useAdminQuery(adminService.featureFlags);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [pending, setPending] = useState<{ title: string; target: string; consequences: string[]; label: string; destructive?: boolean } | null>(null);
  const [roleChange, setRoleChange] = useState<{ user: AdminUser; role: string } | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [aiDailyCap, setAiDailyCap] = useState("50000");
  const [aiPerUser, setAiPerUser] = useState("40");

  const adminColumns: DataColumn<AdminUser>[] = [
    { key: "name", header: "Admin", sortValue: (a) => a.name, cell: (a) => <div className="leading-tight"><p className="font-medium">{a.name}</p><p className="text-xs text-muted-foreground">{a.email}</p></div> },
    {
      key: "role",
      header: "Role",
      sortValue: (a) => a.role,
      cell: (a) => (
        <Select value={a.role} onValueChange={(v) => v !== a.role && setRoleChange({ user: a, role: v })}>
          <SelectTrigger className="h-8 w-56 text-xs" onClick={(e) => e.stopPropagation()}><SelectValue /></SelectTrigger>
          <SelectContent>
            {ADMIN_ROLES.map((r) => <SelectItem key={r.id} value={r.label} className="text-xs">{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
      ),
    },
    { key: "mfa", header: "MFA", cell: (a) => (a.mfa ? <StatusBadge status="Enabled" tone="success" /> : <StatusBadge status="Not enrolled" tone="danger" />) },
    { key: "status", header: "Status", cell: (a) => <StatusBadge status={a.status} /> },
    { key: "last", header: "Last active", sortValue: (a) => a.lastActive, cell: (a) => <span className="text-xs text-muted-foreground">{formatRelative(a.lastActive)}</span> },
  ];

  const allPermissions = Object.keys(PERMISSION_LABELS) as Permission[];

  return (
    <PermissionGuard permission="system.manage">
      <div className="space-y-5">
        <PageHeader
          title={TITLES[tab].title}
          description="Configuration changes require a reason and are recorded in the audit log. Restricted capabilities cannot be enabled from this console."
          breadcrumbs={[{ label: "System" }, { label: TITLES[tab].crumb }]}
        />
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="space-y-4">
          <TabsList>
            <TabsTrigger value="platform">Platform</TabsTrigger>
            <TabsTrigger value="admins">Admins & roles</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="platform" className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <SectionCard title="General">
                <SettingRow label="Platform name"><Input defaultValue="Internflare" className="h-9" /></SettingRow>
                <SettingRow label="Support email"><Input defaultValue="support@internflare.com" className="h-9" /></SettingRow>
                <SettingRow label="Default currency" hint="Applies to plan pricing and receipts">
                  <Select defaultValue="NGN"><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NGN">NGN — Nigerian naira</SelectItem><SelectItem value="GHS">GHS — Ghanaian cedi</SelectItem><SelectItem value="KES">KES — Kenyan shilling</SelectItem></SelectContent></Select>
                </SettingRow>
                <SettingRow label="Maintenance banner" hint="Shown to all users"><Switch /></SettingRow>
              </SectionCard>

              <SectionCard title="Notification delivery">
                <SettingRow label="Email provider" hint="Transactional email"><StatusBadge status="Connected" tone="success" /></SettingRow>
                <SettingRow label="Sender address"><Input defaultValue="no-reply@internflare.com" className="h-9" /></SettingRow>
                <SettingRow label="SMS provider" hint="Optional channel"><StatusBadge status="Awaiting configuration" tone="pending" /></SettingRow>
                <SettingRow label="WhatsApp Business" hint="Optional channel"><StatusBadge status="Planned" tone="neutral" /></SettingRow>
              </SectionCard>

              <SectionCard title="Integrations">
                {[
                  { name: "Paystack", state: "Connected", tone: "success" as const },
                  { name: "Flutterwave", state: "Connected", tone: "success" as const },
                  { name: "Adzuna API", state: "Connected", tone: "success" as const },
                  { name: "Jooble API", state: "Credentials rejected", tone: "danger" as const },
                  { name: "AI provider (primary)", state: "Connected", tone: "success" as const },
                ].map((i) => (
                  <SettingRow key={i.name} label={i.name}>
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={i.state} tone={i.tone} />
                      <PermissionButton permission="integrations.manage" size="sm" variant="outline" className="h-7 bg-background text-xs" onClick={() => setPending({ title: `Rotate ${i.name} credentials?`, target: i.name, consequences: ["Existing key is revoked after the new key is verified", "Secrets are stored server-side and never displayed"], label: "Rotate credentials" })}>
                        Rotate
                      </PermissionButton>
                    </div>
                  </SettingRow>
                ))}
              </SectionCard>

              <SectionCard title="AI usage limits">
                <SettingRow label="Daily request cap" hint="Platform-wide; requests above the cap are queued"><Input type="number" value={aiDailyCap} onChange={(e) => setAiDailyCap(e.target.value)} className="h-9" /></SettingRow>
                <SettingRow label="Per-user daily limit"><Input type="number" value={aiPerUser} onChange={(e) => setAiPerUser(e.target.value)} className="h-9" /></SettingRow>
                <SettingRow label="Redact PII before sending" hint="Names, emails, phone numbers removed from prompts"><Switch defaultChecked disabled /></SettingRow>
                <div className="flex justify-end pt-2">
                  <PermissionButton permission="system.manage" size="sm" onClick={() => setPending({ title: "Update AI usage limits?", target: `Daily cap ${aiDailyCap} · per user ${aiPerUser}`, consequences: ["Takes effect within 5 minutes", "Users above the new limit see a friendly limit message"], label: "Save limits" })}>
                    Save limits
                  </PermissionButton>
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Data retention" description="Retention periods are set by policy and require legal review to change.">
              <Table>
                <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Retention</TableHead><TableHead>After expiry</TableHead></TableRow></TableHeader>
                <TableBody>
                  {[
                    ["Audit logs (finance & access)", "7 years", "Archived"],
                    ["Audit logs (other)", "2 years", "Deleted"],
                    ["Closed support tickets", "3 years", "Anonymised"],
                    ["AI prompts & responses", "30 days", "Deleted"],
                    ["Deleted accounts", "30 days grace", "Permanently erased"],
                  ].map(([d, r, a]) => (
                    <TableRow key={d}><TableCell className="font-medium">{d}</TableCell><TableCell>{r}</TableCell><TableCell className="text-muted-foreground">{a}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          </TabsContent>

          <TabsContent value="admins" className="space-y-4">
            <DataTable
              data={admins.data ?? undefined}
              loading={admins.loading}
              error={admins.error}
              onRetry={admins.retry}
              columns={adminColumns}
              getRowId={(a) => a.id}
              getSearchText={(a) => `${a.name} ${a.email} ${a.role}`}
              searchPlaceholder="Search admins"
              toolbar={
                <PermissionButton permission="system.manage" size="sm" onClick={() => setPending({ title: "Invite a new admin?", target: "New administrator", consequences: ["Invitee must enrol MFA before first sign-in", "Invitation expires in 72 hours"], label: "Send invitation" })}>
                  <UserPlusIcon className="size-4" /> Invite admin
                </PermissionButton>
              }
            />
            <SectionCard title="Role permission matrix" description="Least-privilege defaults. Custom roles are not supported.">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 min-w-48 bg-card">Permission</TableHead>
                      {ADMIN_ROLES.map((r) => <TableHead key={r.id} className="min-w-24 text-center text-[11px] leading-tight">{r.label}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPermissions.map((p) => (
                      <TableRow key={p}>
                        <TableCell className="sticky left-0 bg-card text-xs">{PERMISSION_LABELS[p]}</TableCell>
                        {ADMIN_ROLES.map((r) => (
                          <TableCell key={r.id} className="text-center">
                            {r.permissions.includes(p) ? <CheckIcon className="mx-auto size-4 text-primary" /> : <MinusIcon className="mx-auto size-3 text-muted-foreground/40" />}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Alert>
              <LockIcon className="size-4" />
              <AlertTitle>Restricted financial capabilities</AlertTitle>
              <AlertDescription>Wallet funding, escrow, payouts and the 10% platform fee cannot be enabled here. They depend on provider, legal and compliance readiness.</AlertDescription>
            </Alert>
            <DataTable
              data={flags.data ?? undefined}
              loading={flags.loading}
              error={flags.error}
              onRetry={flags.retry}
              getRowId={(f: Flag) => f.key}
              getSearchText={(f: Flag) => `${f.name} ${f.key} ${f.area}`}
              searchPlaceholder="Search features"
              columns={[
                { key: "name", header: "Feature", sortValue: (f) => f.name, cell: (f) => <div className="leading-tight"><p className="font-medium">{f.name}</p><code className="text-[11px] text-muted-foreground">{f.key}</code></div> },
                { key: "area", header: "Area", sortValue: (f) => f.area, cell: (f) => f.area },
                { key: "state", header: "State", sortValue: (f) => f.state, cell: (f) => <StatusBadge status={f.state} tone={STATE_TONE[f.state]} /> },
                { key: "note", header: "Note", hideOnMobile: true, cell: (f) => <span className="text-xs text-muted-foreground">{f.note}</span> },
              ]}
              rowActions={(f) =>
                LOCKED_FLAGS.includes(f.key) || f.state === "Planned" ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><LockIcon className="size-3" /> Locked</span>
                ) : (
                  <Switch
                    checked={f.state === "Enabled"}
                    disabled={f.state === "Awaiting configuration"}
                    aria-label={`Toggle ${f.name}`}
                    onCheckedChange={(v) =>
                      setPending({
                        title: `${v ? "Enable" : "Disable"} ${f.name}?`,
                        target: f.key,
                        consequences: v ? ["Feature becomes available to eligible users"] : ["Feature is hidden for all users", "In-progress actions are allowed to finish"],
                        label: v ? "Enable feature" : "Disable feature",
                        destructive: !v,
                      })
                    }
                  />
                )
              }
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <SectionCard title="Admin authentication">
                <SettingRow label="Require MFA for all admins" hint="1 admin is not enrolled and will be blocked at next sign-in"><Switch defaultChecked disabled /></SettingRow>
                <SettingRow label="Session timeout (minutes)">
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{["15", "30", "60", "120"].map((m) => <SelectItem key={m} value={m}>{m} minutes</SelectItem>)}</SelectContent>
                  </Select>
                </SettingRow>
                <SettingRow label="Re-authenticate for sensitive actions" hint="PII reveal, role change, finance adjustments"><Switch defaultChecked disabled /></SettingRow>
                <SettingRow label="IP allowlist" hint="Optional — restrict console access by network"><Input placeholder="e.g. 102.89.0.0/16" className="h-9" /></SettingRow>
                <div className="flex justify-end pt-2">
                  <PermissionButton permission="system.manage" size="sm" onClick={() => setPending({ title: "Update security configuration?", target: `Session timeout ${sessionTimeout} min`, consequences: ["Active admin sessions are re-evaluated", "Change applies to all admins"], label: "Save security settings" })}>
                    Save
                  </PermissionButton>
                </div>
              </SectionCard>
              <SectionCard title="Active sessions & keys">
                <SettingRow label="Active admin sessions"><span className="text-sm">6 sessions · 5 admins</span></SettingRow>
                <SettingRow label="API keys" hint="Server-side only; values are never shown"><span className="text-sm">4 active</span></SettingRow>
                <SettingRow label="Webhook signing secrets"><StatusBadge status="Verified" tone="success" /></SettingRow>
                <div className="flex justify-end pt-2">
                  <PermissionButton permission="system.manage" size="sm" variant="outline" className="bg-background" onClick={() => setPending({ title: "Sign out all admin sessions?", target: "All administrators (including you)", consequences: ["Everyone must sign in again with MFA"], label: "Sign out everyone", destructive: true })}>
                    Sign out all sessions
                  </PermissionButton>
                </div>
              </SectionCard>
            </div>
          </TabsContent>
        </Tabs>

        <ConfirmActionDialog
          open={!!pending}
          onOpenChange={(o) => !o && setPending(null)}
          title={pending?.title ?? ""}
          target={pending?.target}
          consequences={pending?.consequences}
          confirmLabel={pending?.label}
          destructive={pending?.destructive}
          onConfirm={async ({ note }) => {
            if (pending?.label === "Sign out everyone") {
              await adminService.revokeAllSessions({ note });
              toast.success("All administrative sessions revoked", {
                description: "All active admin tokens invalidated. Users will be required to re-authenticate.",
              });
            } else if (pending?.target) {
              const nextState: FeatureState = pending.label.startsWith("Enable") ? "Enabled" : "Disabled";
              await adminService.updateFeatureFlag(pending.target, {
                state: nextState,
                note,
              });
              toast.success(`Feature flag updated: ${pending.target}`, {
                description: `State changed to ${nextState}. Reason: ${note || "No note supplied"}.`,
              });
              flags.retry();
            }
            setPending(null);
          }}
        />
        <ConfirmActionDialog
          open={!!roleChange}
          onOpenChange={(o) => !o && setRoleChange(null)}
          title="Change admin role?"
          target={roleChange ? `${roleChange.user.name}: ${roleChange.user.role} → ${roleChange.role}` : undefined}
          consequences={["Permissions change on the admin's next request", "Previous role is recorded in the audit log"]}
          confirmLabel="Change role"
          requireAcknowledgement
          onConfirm={async ({ note }) => {
            if (roleChange) {
              await adminService.updateAdminRole(roleChange.user.id, {
                role: roleChange.role,
                note,
              });
              toast.success(`Role updated for ${roleChange.user.name}`, {
                description: `Assigned role: ${roleChange.role}. Audit event registered.`,
              });
              admins.retry();
            }
            setRoleChange(null);
          }}
        />
      </div>
    </PermissionGuard>
  );
}
