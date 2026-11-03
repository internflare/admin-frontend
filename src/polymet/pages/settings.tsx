import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionCard } from "@/polymet/components/section-card";
import { ResourcePage } from "@/polymet/components/resource-page";
import { UnavailablePage } from "@/polymet/components/unavailable-page";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import { ADMIN_ROLES } from "@/polymet/data/admin-roles";
import { mutateAdmin, resources } from "@/polymet/lib/admin-service";

type Tab = "platform" | "admins" | "features" | "security";

function SettingsContent({ initialTab }: { initialTab: Tab }) {
  const [tab, setTab] = useState(initialTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="space-y-5">
      <TabsList><TabsTrigger value="platform">Platform</TabsTrigger><TabsTrigger value="admins">Admins & roles</TabsTrigger><TabsTrigger value="features">Features</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger></TabsList>
      <TabsContent value="platform"><UnavailablePage title="Platform settings" permission="system.manage" description="General platform settings, notification providers, integration credentials, maintenance mode and AI limits do not have configuration endpoints." /></TabsContent>
      <TabsContent value="security"><UnavailablePage title="Security & configuration" permission="system.manage" description="Global session revocation, session-timeout configuration and authentication-policy edits are not implemented in the admin API. Sign-out remains available in the account menu." /></TabsContent>
      <TabsContent value="features"><ResourcePage resource={resources.features} /></TabsContent>
      <TabsContent value="admins" className="space-y-5">
        <ResourcePage key={revision} resource={resources.admins} />
        <SectionCard title="Invite administrator" description="Creates an invitation through the backend. Success confirms the invitation record, not email delivery.">
          <form className="max-w-xl space-y-3" onSubmit={async (event) => {
            event.preventDefault();
            if (submitting) return;
            setSubmitting(true); setError(null);
            try {
              await mutateAdmin("/settings/admins/invite", { name: name.trim(), email: email.trim(), roleId });
              toast.success("Administrator invitation recorded by the backend");
              setName(""); setEmail(""); setRoleId(""); setRevision((value) => value + 1);
            } catch (failure) {
              setError(failure instanceof Error ? failure.message : "The invitation was not confirmed.");
            } finally { setSubmitting(false); }
          }}>
            <div className="space-y-1"><Label htmlFor="admin-name">Name</Label><Input id="admin-name" minLength={2} required value={name} onChange={(event) => setName(event.target.value)} disabled={submitting} /></div>
            <div className="space-y-1"><Label htmlFor="admin-email">Email</Label><Input id="admin-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={submitting} /></div>
            <div className="space-y-1"><Label htmlFor="admin-role">Role</Label><select id="admin-role" className="block w-full rounded-md border bg-background p-2 text-sm" required value={roleId} onChange={(event) => setRoleId(event.target.value)} disabled={submitting}><option value="" disabled>Select a role</option>{ADMIN_ROLES.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}</select></div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting || !name.trim() || !email.trim() || !roleId}>{submitting ? "Submitting…" : "Invite administrator"}</Button>
          </form>
        </SectionCard>
      </TabsContent>
    </Tabs>
  );
}

export default function SettingsPage({ initialTab = "platform" }: { initialTab?: Tab }) {
  return <PermissionGuard permission="system.manage"><SettingsContent initialTab={initialTab} /></PermissionGuard>;
}
