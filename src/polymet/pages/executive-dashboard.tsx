import { useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/polymet/components/page-header";
import { MetricCard } from "@/polymet/components/metric-card";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import { UnavailableNotice } from "@/polymet/components/unavailable-page";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import { fetchCollection, invalidResponse, resources, type QueryParams, type ResourceDefinition } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { Skeleton } from "@/components/ui/skeleton";

const COUNTS: { label: string; resource: ResourceDefinition; params: QueryParams; href: string }[] = [
  { label: "Talent accounts", resource: resources.users, params: { accountType: "talent" }, href: "/users" },
  { label: "Verified companies", resource: resources.companies, params: { verificationStatus: "VERIFIED" }, href: "/companies" },
  { label: "Published listings", resource: resources.listings, params: { status: "published" }, href: "/listings" },
  { label: "Recorded applications", resource: resources.applications, params: {}, href: "/applications" },
  { label: "Recorded hires", resource: resources.placements, params: {}, href: "/placements" },
  { label: "Active workspaces", resource: resources.workspaces, params: { status: "Active" }, href: "/workspaces" },
  { label: "Unresolved reconciliations", resource: resources.reconciliation, params: { status: "Unresolved" }, href: "/reconciliation" },
];

function LiveCount({ label, resource, params, href }: typeof COUNTS[number]) {
  const fetcher = useCallback(async () => {
    const result = await fetchCollection(resource, { ...params, limit: 1, page: 1 });
    if (!result.pagination) invalidResponse(resource.endpoint);
    return result.pagination.total;
  }, [resource, params]);
  const query = useAdminQuery(fetcher);
  if (query.error) return <div role="alert" className="space-y-2 rounded-lg border p-4"><p className="text-sm font-medium">{label}</p><p className="text-xs text-destructive">{query.error}</p><Button variant="outline" size="sm" onClick={query.retry}>Retry count</Button></div>;
  return <MetricCard label={label} value={query.loading ? <div role="status" aria-busy="true" aria-label={`Loading ${label}`}><span className="sr-only">Loading {label}</span><Skeleton className="h-8 w-20" /></div> : query.data?.toLocaleString() ?? "Unavailable"} href={href} definition="Current matching record total from this module's paginated backend directory. No benchmark or estimated fallback is used." />;
}

export default function ExecutiveDashboardPage() {
  const { can } = useAdminRole();
  return (
    <PermissionGuard permission="dashboard.view">
      <div className="space-y-5">
        <PageHeader title="Executive dashboard" description="Current database record totals from the live admin directories. Metrics are shown only for modules your role can access." />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {COUNTS.filter((count) => can(count.resource.permission) || (count.resource.alternativePermission && can(count.resource.alternativePermission))).map((count) => <LiveCount key={count.label} {...count} />)}
        </div>
        <UnavailableNotice>Historical charts, revenue, growth deltas, source performance, AI costs, engagement outcomes and the aggregated action queue are not backed by reliable recorded-event analytics in the current API. The backend dashboard's baseline and estimated values are not used.</UnavailableNotice>
        <Button asChild variant="outline"><Link to="/health">View live admin-service health</Link></Button>
      </div>
    </PermissionGuard>
  );
}
