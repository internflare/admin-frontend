import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter, type DataColumn } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { MetricCard } from "@/polymet/components/metric-card";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import type { Subscription } from "@/polymet/data/commercial-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatCurrency, formatDate } from "@/polymet/lib/format";

export default function SubscriptionsPage() {
  const { data, loading, error, retry } = useAdminQuery(adminService.subscriptions);
  const [status, setStatus] = useState("all");
  const [audience, setAudience] = useState("all");
  const [payment, setPayment] = useState("all");
  const all = data ?? [];
  const rows = all.filter((s) => matchesFilter(s.status, status) && matchesFilter(s.audience, audience) && matchesFilter(s.paymentStatus, payment));

  const columns: DataColumn<Subscription>[] = [
    { key: "acct", header: "Account", sortValue: (s) => s.account, cell: (s) => <div className="leading-tight"><Link to={`/subscriptions/${s.id}`} className="font-medium hover:underline">{s.account}</Link><p className="font-mono text-[11px] text-muted-foreground">{s.id} · {s.accountKind}</p></div> },
    { key: "plan", header: "Plan", sortValue: (s) => s.plan, cell: (s) => <span>{s.plan} <span className="text-xs text-muted-foreground">({s.audience})</span></span> },
    { key: "status", header: "Status", sortValue: (s) => s.status, cell: (s) => <StatusBadge status={s.status} /> },
    { key: "amt", header: "Amount", align: "right", sortValue: (s) => s.amount, cell: (s) => formatCurrency(s.amount) },
    { key: "period", header: "Billing", hideOnMobile: true, cell: (s) => s.billingPeriod },
    { key: "renew", header: "Renewal", sortValue: (s) => s.renewsAt ?? "", cell: (s) => <span className="whitespace-nowrap text-xs">{formatDate(s.renewsAt)}</span> },
    { key: "pay", header: "Recorded payment", cell: (s) => <StatusBadge status={s.paymentStatus} /> },
    { key: "ent", header: "Entitlements", hideOnMobile: true, cell: (s) => (s.entitlementsActive ? <StatusBadge status="Active" /> : <StatusBadge status="Held" tone="warning" />) },
    { key: "changes", header: "Plan changes", hideOnMobile: true, cell: (s) => <span className="text-xs text-muted-foreground">{s.history.filter((h) => h.event === "Upgraded" || h.event === "Downgraded").length || "—"}</span> },
  ];

  return (
    <PermissionGuard permission="finance.view">
      <div className="space-y-5">
        <PageHeader title="Subscriptions" description="All talent and employer subscriptions. Entitlements are held until a verified payment event is received; delayed webhooks stay pending." breadcrumbs={[{ label: "Commercial" }, { label: "Subscriptions" }]} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active" value={all.filter((s) => s.status === "Active").length} />
          <MetricCard label="Pending payment confirmation" value={all.filter((s) => s.status === "Pending payment confirmation").length} />
          <MetricCard label="Past due" value={all.filter((s) => s.status === "Past due").length} />
          <MetricCard label="Cancelling at period end" value={all.filter((s) => s.status === "Cancels at period end").length} />
        </div>
        <DataTable
          data={rows}
          loading={loading}
          error={error}
          onRetry={retry}
          columns={columns}
          getRowId={(s) => s.id}
          getSearchText={(s) => `${s.account} ${s.id} ${s.accountId} ${s.plan}`}
          searchPlaceholder="Search account, subscription ID"
          toolbar={
            <>
              <FilterSelect label="Status" value={status} onChange={setStatus} options={["Active", "Pending payment confirmation", "Past due", "Cancels at period end", "Cancelled", "Expired"]} />
              <FilterSelect label="Audience" value={audience} onChange={setAudience} options={["Talent", "Employer"]} />
              <FilterSelect label="Payment" value={payment} onChange={setPayment} options={["Confirmed", "Pending webhook", "Failed", "Refunded"]} />
            </>
          }
          rowActions={(s) => <Button asChild size="sm" variant="outline" className="h-7 bg-background text-xs"><Link to={`/subscriptions/${s.id}`}>Open</Link></Button>}
        />
      </div>
    </PermissionGuard>
  );
}
