import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { MetricCard } from "@/polymet/components/metric-card";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import type { Transaction } from "@/polymet/data/commercial-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatCurrency, formatDateTime } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

const QUEUES = {
  awaiting: { label: "Awaiting reconciliation", test: (t: Transaction) => t.reconciliation === "Unreconciled" },
  mismatch: { label: "Provider mismatch", test: (t: Transaction) => t.reconciliation === "Mismatch" },
  events: { label: "Failed / pending events", test: (t: Transaction) => t.webhook !== "Verified" },
  refunds: { label: "Refunds & disputes", test: (t: Transaction) => t.status === "Refunded" || t.status === "Disputed" },
} as const;
type Queue = keyof typeof QUEUES;

export default function ReconciliationPage() {
  const { data, loading, error, retry } = useAdminQuery(adminService.transactions);
  const [queue, setQueue] = useState<Queue>("awaiting");
  const [provider, setProvider] = useState("all");
  const [category, setCategory] = useState("all");
  const [target, setTarget] = useState<Transaction | null>(null);
  const all = data ?? [];
  const rows = all.filter((t) => QUEUES[queue].test(t) && matchesFilter(t.provider, provider) && matchesFilter(t.category, category));

  return (
    <PermissionGuard permission="finance.manage">
      <div className="space-y-5">
        <PageHeader title="Reconciliation" description="Match ledger records to provider settlements. Outcomes are recorded with reason; payments are never marked successful without verified provider evidence." breadcrumbs={[{ label: "Commercial" }, { label: "Reconciliation" }]} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(Object.keys(QUEUES) as Queue[]).map((q) => (
            <MetricCard key={q} label={QUEUES[q].label} value={all.filter(QUEUES[q].test).length} />
          ))}
        </div>
        <Tabs value={queue} onValueChange={(v) => setQueue(v as Queue)}>
          <div className="overflow-x-auto">
            <TabsList className="w-max">
              {(Object.keys(QUEUES) as Queue[]).map((q) => <TabsTrigger key={q} value={q} className="text-xs">{QUEUES[q].label}</TabsTrigger>)}
            </TabsList>
          </div>
        </Tabs>
        <DataTable
          data={rows}
          loading={loading}
          error={error}
          onRetry={retry}
          getRowId={(t) => t.id}
          getSearchText={(t) => `${t.id} ${t.providerRef} ${t.payer}`}
          toolbar={
            <>
              <FilterSelect label="Provider" value={provider} onChange={setProvider} options={["Paystack", "Flutterwave"]} />
              <FilterSelect label="Type" value={category} onChange={setCategory} options={["Subscription", "Salary / stipend", "Paid test task", "Engagement payment", "Refund"]} />
            </>
          }
          columns={[
            { key: "id", header: "Transaction", cell: (t) => <Link to={`/transactions?ref=${t.id}`} className="font-mono text-xs font-medium hover:underline">{t.id}</Link> },
            { key: "ref", header: "Provider ref", hideOnMobile: true, cell: (t) => <span className="font-mono text-xs">{t.providerRef}</span> },
            { key: "cat", header: "Type", cell: (t) => t.category },
            { key: "gross", header: "Ledger amount", align: "right", cell: (t) => formatCurrency(t.gross, t.currency) },
            { key: "wh", header: "Verified event", cell: (t) => <StatusBadge status={t.webhook} /> },
            { key: "rec", header: "Reconciliation", cell: (t) => <StatusBadge status={t.reconciliation} /> },
            { key: "last", header: "Last event", hideOnMobile: true, cell: (t) => <span className="text-xs text-muted-foreground">{t.lifecycle[t.lifecycle.length - 1].event}</span> },
            { key: "date", header: "Created", hideOnMobile: true, sortValue: (t) => t.createdAt, cell: (t) => <span className="whitespace-nowrap text-xs">{formatDateTime(t.createdAt)}</span> },
          ]}
          rowActions={(t) => (
            <PermissionButton permission="finance.manage" size="sm" variant="outline" className="h-7 bg-background text-xs" onClick={() => setTarget(t)}>Record outcome</PermissionButton>
          )}
          emptyTitle="Nothing to reconcile"
          emptyDescription="All records in this queue are matched."
        />
        <ConfirmActionDialog
          open={!!target}
          onOpenChange={(o) => !o && setTarget(null)}
          title="Record reconciliation outcome"
          target={`${target?.id} · ${target?.providerRef} · ${target ? formatCurrency(target.gross, target.currency) : ""}`}
          requireAcknowledgement
          reasonOptions={["Matched to provider settlement report", "Verified via provider API lookup", "Provider fee difference — no ledger change", "Escalate to provider support", "Requires financial adjustment (second approver)"]}
          consequences={["The outcome is appended to the ledger; the original record is never edited", "Financial adjustments require a second Finance approver", "No payment status changes without verified provider evidence"]}
          confirmLabel="Record outcome"
          onConfirm={({ reason }) => recordDemoAction(`Reconciliation outcome for ${target?.id}`, reason)}
        />
      </div>
    </PermissionGuard>
  );
}
