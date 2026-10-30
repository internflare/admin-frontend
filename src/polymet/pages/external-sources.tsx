import { Link } from "react-router-dom";
import { PlugIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/polymet/components/page-header";
import { StatusBadge } from "@/polymet/components/status-badge";
import { DataTable } from "@/polymet/components/data-table";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatNumber, formatRelative } from "@/polymet/lib/format";

export default function ExternalSourcesPage() {
  const { data, loading, error, retry } = useAdminQuery(adminService.sources);
  const sources = data ?? [];
  return (
    <PermissionGuard permission="integrations.view">
      <div className="space-y-5">
        <PageHeader
          title="External job sources"
          description="Adzuna, Jooble and approved partner/employer feeds. Availability depends on configuration, credentials, commercial-use terms and permissions. API secrets are never shown."
          breadcrumbs={[{ label: "Integrations & AI" }, { label: "External job sources" }]}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {sources.map((s) => (
            <Link key={s.id} to={`/integrations/${s.id}`} className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Card className="h-full space-y-3 p-4 shadow-xs hover:border-primary/40">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium"><PlugIcon className="size-4 text-muted-foreground" />{s.name}</span>
                  <StatusBadge status={s.health} />
                </div>
                <p className="text-xs text-muted-foreground">{s.kind} · {s.enabled ? "Enabled" : "Disabled"}</p>
                <p className="text-2xl font-semibold tabular-nums">{formatNumber(s.imported)}<span className="ml-1 text-xs font-normal text-muted-foreground">imported</span></p>
                <p className="text-xs text-muted-foreground">Last success {s.lastSuccessAt ? formatRelative(s.lastSuccessAt) : "never"}</p>
              </Card>
            </Link>
          ))}
        </div>
        <DataTable
          data={sources}
          loading={loading}
          error={error}
          onRetry={retry}
          getRowId={(s) => s.id}
          columns={[
            { key: "name", header: "Provider", sortValue: (s) => s.name, cell: (s) => <Link to={`/integrations/${s.id}`} className="font-medium hover:underline">{s.name}</Link> },
            { key: "int", header: "Integration", cell: (s) => <StatusBadge status={s.integrationStatus} /> },
            { key: "en", header: "Enabled", cell: (s) => (s.enabled ? "Yes" : <span className="text-muted-foreground">No</span>) },
            { key: "succ", header: "Last success", sortValue: (s) => s.lastSuccessAt ?? "", cell: (s) => <span className="text-xs">{s.lastSuccessAt ? formatRelative(s.lastSuccessAt) : "Never"}</span> },
            { key: "att", header: "Last attempt", hideOnMobile: true, cell: (s) => <span className="text-xs">{s.lastAttemptAt ? formatRelative(s.lastAttemptAt) : "Never"}</span> },
            { key: "imp", header: "Imported", align: "right", sortValue: (s) => s.imported, cell: (s) => formatNumber(s.imported) },
            { key: "fail", header: "Failed", align: "right", sortValue: (s) => s.failed, cell: (s) => formatNumber(s.failed) },
            { key: "dup", header: "Duplicates", align: "right", hideOnMobile: true, cell: (s) => formatNumber(s.duplicates) },
            { key: "exp", header: "Expired", align: "right", hideOnMobile: true, cell: (s) => formatNumber(s.expired) },
            { key: "health", header: "Health", cell: (s) => <StatusBadge status={s.health} /> },
          ]}
          rowActions={(s) => <Button asChild size="sm" variant="outline" className="h-7 bg-background text-xs"><Link to={`/integrations/${s.id}`}>Open</Link></Button>}
        />
      </div>
    </PermissionGuard>
  );
}
