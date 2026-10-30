import { useState } from "react";
import { useLocation } from "react-router-dom";
import { BanIcon, PercentIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter, type DataColumn } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { SectionCard, DetailGrid } from "@/polymet/components/section-card";
import { AuditTimeline } from "@/polymet/components/audit-timeline";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import { FEE_CONFIGURATION, RESTRICTED_FINANCE_CAPABILITIES, type Transaction } from "@/polymet/data/commercial-data";
import { AUDIT_EVENTS } from "@/polymet/data/operations-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatCurrency, formatDateTime } from "@/polymet/lib/format";

export default function TransactionsPage() {
  const { search } = useLocation();
  const { data, loading, error, retry } = useAdminQuery(adminService.transactions);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [provider, setProvider] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(new URLSearchParams(search).get("ref"));
  const selected = (data ?? []).find((t) => t.id === selectedId) ?? null;
  const rows = (data ?? []).filter((t) => matchesFilter(t.category, category) && matchesFilter(t.status, status) && matchesFilter(t.provider, provider));

  const columns: DataColumn<Transaction>[] = [
    { key: "id", header: "Reference", sortValue: (t) => t.id, cell: (t) => <div className="leading-tight"><p className="font-mono text-xs font-medium">{t.id}</p><p className="font-mono text-[11px] text-muted-foreground">{t.providerRef}</p></div> },
    { key: "cat", header: "Category", sortValue: (t) => t.category, cell: (t) => t.category },
    { key: "parties", header: "Payer → payee", hideOnMobile: true, cell: (t) => <span className="text-xs">{t.payer} → {t.payee}</span> },
    { key: "rel", header: "Related", hideOnMobile: true, cell: (t) => <span className="font-mono text-xs text-muted-foreground">{t.related ?? "—"}</span> },
    { key: "gross", header: "Gross", align: "right", sortValue: (t) => t.gross, cell: (t) => formatCurrency(t.gross, t.currency) },
    { key: "fee", header: "Fee", align: "right", hideOnMobile: true, cell: (t) => (t.feeEligible ? <span title="Planned fee — not yet charged">{formatCurrency(t.fee, t.currency)}*</span> : <span className="text-muted-foreground">n/a</span>) },
    { key: "net", header: "Net", align: "right", hideOnMobile: true, cell: (t) => formatCurrency(t.net, t.currency) },
    { key: "status", header: "Status", cell: (t) => <StatusBadge status={t.status} /> },
    { key: "wh", header: "Verified event", cell: (t) => <StatusBadge status={t.webhook} /> },
    { key: "date", header: "Created", sortValue: (t) => t.createdAt, hideOnMobile: true, cell: (t) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</span> },
  ];

  return (
    <PermissionGuard permission="finance.view">
      <div className="space-y-5">
        <PageHeader title="Payments & transactions" description="Ledger of payment events from providers. Raw card details are never stored or displayed. Records cannot be edited here." breadcrumbs={[{ label: "Commercial" }, { label: "Transactions" }]} />

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Platform fee configuration" action={<StatusBadge status="Awaiting configuration" />}>
            <div className="flex gap-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground"><PercentIcon className="size-4" /></span>
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold">{FEE_CONFIGURATION.plannedRate}% planned</span> on eligible transactions only.</p>
                <p className="text-xs text-muted-foreground">{FEE_CONFIGURATION.status}.</p>
                <p className="text-xs">Eligible: {FEE_CONFIGURATION.eligibleCategories.join(", ")} · Not eligible: {FEE_CONFIGURATION.excludedCategories.join(", ")}</p>
                <p className="text-xs text-muted-foreground">* Fee amounts shown are calculated previews; no fee has been charged.</p>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Restricted capabilities">
            <ul className="space-y-2">
              {RESTRICTED_FINANCE_CAPABILITIES.map((c) => (
                <li key={c.name} className="flex items-start justify-between gap-3 rounded-md border border-dashed p-2.5">
                  <div className="flex gap-2">
                    <BanIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.reason}</p></div>
                  </div>
                  <StatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <DataTable
          data={rows}
          loading={loading}
          error={error}
          onRetry={retry}
          columns={columns}
          getRowId={(t) => t.id}
          onRowClick={(t) => setSelectedId(t.id)}
          getSearchText={(t) => `${t.id} ${t.providerRef} ${t.payer} ${t.payee} ${t.related ?? ""}`}
          searchPlaceholder="Search reference, provider ref, party"
          initialSort={{ key: "date", dir: "desc" }}
          toolbar={
            <>
              <FilterSelect label="Category" value={category} onChange={setCategory} options={["Subscription", "Salary / stipend", "Paid test task", "Engagement payment", "Platform fee", "Refund", "Dispute"]} />
              <FilterSelect label="Status" value={status} onChange={setStatus} options={["Successful", "Pending", "Failed", "Refunded", "Disputed", "Reversed"]} />
              <FilterSelect label="Provider" value={provider} onChange={setProvider} options={["Paystack", "Flutterwave"]} />
            </>
          }
        />

        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            {selected && (
              <>
                <SheetHeader>
                  <SheetTitle className="font-mono">{selected.id}</SheetTitle>
                  <SheetDescription>{selected.category} · {selected.provider}</SheetDescription>
                </SheetHeader>
                <div className="mt-5 space-y-5">
                  <div className="flex flex-wrap gap-2"><StatusBadge status={selected.status} /><StatusBadge status={selected.webhook} /><StatusBadge status={selected.reconciliation} /></div>
                  <DetailGrid items={[
                    { label: "Provider reference", value: <span className="font-mono text-xs">{selected.providerRef}</span> },
                    { label: "Related obligation", value: <span className="font-mono text-xs">{selected.related ?? "—"}</span> },
                    { label: "Payer", value: selected.payer },
                    { label: "Payee", value: selected.payee },
                    { label: "Gross", value: formatCurrency(selected.gross, selected.currency) },
                    { label: "Applicable fee", value: selected.feeEligible ? `${formatCurrency(selected.fee, selected.currency)} (preview)` : "Not eligible" },
                    { label: "Net", value: formatCurrency(selected.net, selected.currency) },
                    { label: "Payment method", value: <span className="text-muted-foreground">Held by provider</span> },
                    ...(selected.failureReason ? [{ label: "Failure reason", value: selected.failureReason, wide: true }] : []),
                  ]} />
                  <div>
                    <p className="mb-3 text-xs font-medium text-muted-foreground">Lifecycle</p>
                    <AuditTimeline events={[...selected.lifecycle].reverse().map((l, i) => ({ id: `${i}`, at: l.at, actor: "Payment service", actorType: "System", title: l.event }))} />
                  </div>
                  <div>
                    <p className="mb-3 text-xs font-medium text-muted-foreground">Admin audit</p>
                    <AuditTimeline events={AUDIT_EVENTS.filter((a) => a.entity === selected.id).map((a) => ({ id: a.id, at: a.at, actor: a.actor, actorType: a.actorType, title: a.action, detail: a.reason, tone: a.outcome === "Denied" ? "danger" : "default" }))} emptyLabel="No admin actions on this transaction." />
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </PermissionGuard>
  );
}
