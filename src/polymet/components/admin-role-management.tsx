import { Fragment, useState } from "react";
import { CheckIcon, MinusIcon } from "lucide-react";
import { toast } from "sonner";
import { PermissionButton } from "@/polymet/components/permission-controls";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { SectionCard } from "@/polymet/components/section-card";
import { ErrorState, LoadingState } from "@/polymet/components/state-views";
import { PERMISSION_LABELS, type AdminRoleId, type Permission } from "@/polymet/data/admin-roles";
import { mutateAdmin, recordId, type AdminRecord, type RoleMatrixEntry } from "@/polymet/lib/admin-service";
import type { AdminQueryState } from "@/polymet/lib/use-admin-query";

const AREA_LABELS: Record<string, string> = {
  dashboard: "Dashboard", users: "Users", companies: "Companies", mentors: "Mentorship", supervisors: "Mentorship",
  listings: "Listings & recruitment", recruitment: "Listings & recruitment", placements: "Listings & recruitment",
  workspaces: "Workspaces", finance: "Finance", plans: "Finance", integrations: "Integrations & AI", ai: "Integrations & AI",
  notifications: "Support", support: "Support", disputes: "Support", audit: "Audit & analytics", analytics: "Audit & analytics",
  system: "System administration",
};

function groupPermissions(): { area: string; permissions: Permission[] }[] {
  const groups = new Map<string, Permission[]>();
  for (const permission of Object.keys(PERMISSION_LABELS) as Permission[]) {
    const area = AREA_LABELS[permission.split(".")[0] ?? ""] ?? "Other";
    groups.set(area, [...(groups.get(area) ?? []), permission]);
  }
  return [...groups].map(([area, permissions]) => ({ area, permissions }));
}

export function RolePermissionMatrix({ roles }: { roles: AdminQueryState<RoleMatrixEntry[]> }) {
  return (
    <SectionCard title="Role permission matrix" description="What each role is allowed to do, exactly as the backend enforces it. Counts show how many administrators currently hold each role.">
      {roles.loading ? <LoadingState label="Loading role permissions" className="py-10" />
        : roles.error || !roles.data ? <ErrorState title="Couldn't load role permissions" description={roles.error ?? undefined} onRetry={roles.retry} />
        : <MatrixTable roles={roles.data} />}
    </SectionCard>
  );
}

function MatrixTable({ roles }: { roles: RoleMatrixEntry[] }) {
  return (
    <div className="space-y-4">
      <div className="max-h-[70vh] overflow-auto rounded-lg border">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <caption className="sr-only">Permissions granted to each administrator role</caption>
          <thead className="sticky top-0 z-10 bg-background">
            <tr className="border-b">
              <th scope="col" className="sticky left-0 z-20 bg-background p-3 text-left font-medium">Permission</th>
              {roles.map((role) => (
                <th key={role.id} scope="col" title={role.description} className="p-3 text-center align-bottom font-medium">
                  <span className="block leading-tight">{role.label}</span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">{role.adminCount} {role.adminCount === 1 ? "admin" : "admins"}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupPermissions().map(({ area, permissions }) => (
              <Fragment key={area}>
                <tr className="bg-muted/40">
                  <th scope="rowgroup" colSpan={roles.length + 1} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{area}</th>
                </tr>
                {permissions.map((permission) => (
                  <tr key={permission} className="border-b last:border-0 hover:bg-muted/20">
                    <th scope="row" className="sticky left-0 bg-background p-3 text-left font-normal">
                      {PERMISSION_LABELS[permission]}
                      <span className="block font-mono text-xs text-muted-foreground">{permission}</span>
                    </th>
                    {roles.map((role) => {
                      const granted = role.permissions.includes(permission);
                      return (
                        <td key={role.id} className="p-3 text-center">
                          {granted
                            ? <CheckIcon aria-label="Allowed" className="mx-auto size-4 text-emerald-600 dark:text-emerald-400" />
                            : <MinusIcon aria-label="Not allowed" className="mx-auto size-4 text-muted-foreground/40" />}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
        {roles.map((role) => (
          <div key={role.id} className="rounded-lg border p-3">
            <dt className="font-medium">{role.label}</dt>
            <dd className="mt-1 text-muted-foreground">{role.description}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ChangeRoleAction({ record, currentAdminId, roles, onChanged }: {
  record: AdminRecord;
  currentAdminId?: string;
  roles?: RoleMatrixEntry[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isSuperAdmin = record.roleId === "super_admin";
  const isSelf = recordId(record) === currentAdminId;
  const blockedReason = isSuperAdmin ? "The super administrator's role cannot be changed."
    : isSelf ? "You cannot change your own role." : !roles ? "Role definitions are still loading." : undefined;

  return (
    <>
      <span title={blockedReason}>
        <PermissionButton permission="system.manage" variant="outline" size="sm" disabled={Boolean(blockedReason)} onClick={() => setOpen(true)}>
          Change role…
        </PermissionButton>
      </span>
      {open && roles && (
        <ChangeRoleDialog record={record} roles={roles} onClose={() => setOpen(false)} onChanged={onChanged} />
      )}
    </>
  );
}

function ChangeRoleDialog({ record, roles, onClose, onChanged }: {
  record: AdminRecord; roles: RoleMatrixEntry[]; onClose: () => void; onChanged: () => void;
}) {
  const current = roles.find((role) => role.id === record.roleId);
  const options = roles.filter((role) => role.id !== "super_admin" && role.id !== record.roleId);
  const [roleId, setRoleId] = useState<AdminRoleId | "">("");
  const next = roles.find((role) => role.id === roleId);
  const gained = next ? next.permissions.filter((permission) => !current?.permissions.includes(permission)) : [];
  const lost = next && current ? current.permissions.filter((permission) => !next.permissions.includes(permission)) : [];
  const name = typeof record.name === "string" ? record.name : recordId(record);

  return (
    <ConfirmActionDialog
      open
      onOpenChange={(open) => { if (!open) onClose(); }}
      title="Change administrator role"
      description="The new role's permissions apply on this administrator's next request. The change, your reason, IP address and browser are recorded in the audit log."
      target={`${name} · currently ${current?.label ?? String(record.roleId)}`}
      confirmLabel={next ? `Change to ${next.label}` : "Change role"}
      requireAcknowledgement
      consequences={next ? [
        gained.length ? `Gains: ${gained.map((permission) => PERMISSION_LABELS[permission]).join(", ")}` : "Gains no new permissions",
        lost.length ? `Loses: ${lost.map((permission) => PERMISSION_LABELS[permission]).join(", ")}` : "Loses no permissions",
      ] : []}
      onConfirm={async ({ note }) => {
        if (!roleId) throw new Error("Select the new role.");
        await mutateAdmin(`/settings/admins/${encodeURIComponent(recordId(record))}/role`, { roleId, reason: note.trim() }, "patch");
        toast.success(`${name} is now ${next?.label ?? roleId}`);
        onChanged();
      }}
    >
      <label className="block space-y-1 text-sm">
        New role <span className="text-red-600">*</span>
        <select aria-label="New role" required className="block w-full rounded-md border bg-background p-2 text-sm" value={roleId} onChange={(event) => setRoleId(event.target.value as AdminRoleId)}>
          <option value="" disabled>Select a role</option>
          {options.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
        </select>
      </label>
    </ConfirmActionDialog>
  );
}
