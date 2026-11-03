import { Button } from "@/components/ui/button";
import { PageHeader } from "@/polymet/components/page-header";
import { SectionCard, DetailGrid } from "@/polymet/components/section-card";
import { ErrorState, PageSkeleton } from "@/polymet/components/state-views";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import { UnavailableNotice } from "@/polymet/components/unavailable-page";
import { displayValue } from "@/polymet/components/resource-page";
import { fetchHealth, isRecord } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";

function HealthContent() {
  const query = useAdminQuery(fetchHealth);
  return <div className="space-y-5">
    <PageHeader title="Operational health" description="Live admin-service dependency checks, not ecosystem-wide telemetry." actions={<Button variant="outline" onClick={query.retry} disabled={query.loading}>Refresh</Button>} />
    {query.loading ? <PageSkeleton /> : query.error ? <ErrorState description={query.error} onRetry={query.retry} /> : query.data && (
      <SectionCard title="Admin-service">
        <DetailGrid items={Object.entries(query.data).filter(([key]) => ["status", "service", "timestamp"].includes(key)).map(([label, value]) => ({ label, value: displayValue(value) }))} />
        <div className="mt-4"><DetailGrid items={isRecord(query.data.dependencies) ? Object.entries(query.data.dependencies).map(([label, value]) => ({ label, value: displayValue(value) })) : []} /></div>
      </SectionCard>
    )}
    <UnavailableNotice>Cross-service uptime, latency history, queue depth, provider status and incident actions are not exposed by the admin API.</UnavailableNotice>
  </div>;
}

export default function OperationalHealthPage() {
  return <PermissionGuard permission="dashboard.view"><HealthContent /></PermissionGuard>;
}
