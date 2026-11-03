import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/polymet/components/page-header";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import type { Permission } from "@/polymet/data/admin-roles";

export function UnavailableNotice({ children }: { children: React.ReactNode }) {
  return (
    <Alert>
      <AlertTitle>Unavailable — backend integration not implemented</AlertTitle>
      <AlertDescription>{children} No sample records, estimated results or local-only changes are shown.</AlertDescription>
    </Alert>
  );
}

export function UnavailablePage({ title, permission, description }: { title: string; permission: Permission; description: string }) {
  return (
    <PermissionGuard permission={permission}>
      <div className="space-y-5">
        <PageHeader title={title} description="This module is not available from the current admin API." />
        <UnavailableNotice>{description}</UnavailableNotice>
      </div>
    </PermissionGuard>
  );
}
