import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ClockIcon, ReceiptIcon, StickyNoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/polymet/components/page-header";
import { SectionCard, DetailGrid } from "@/polymet/components/section-card";
import { StatusBadge } from "@/polymet/components/status-badge";
import { DataTable } from "@/polymet/components/data-table";
import { AuditTimeline } from "@/polymet/components/audit-timeline";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { EmptyState } from "@/polymet/components/state-views";
import { SUBSCRIPTIONS, TRANSACTIONS, PLANS } from "@/polymet/data/commercial-data";
import { AUDIT_EVENTS } from "@/polymet/data/operations-data";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

export default function SubscriptionDetailPage() {
  const { subscriptionId = "SUB-40001" } = useParams();
  const [note, setNote] = useState("");
  const sub = SUBSCRIPTIONS.find((s) => s.id === subscriptionId);
  if (!sub) return <EmptyState title="Subscription not found" action={<Button asChild size="sm" variant="outline"><Link to="/subscriptions">Back</Link></Button>} />;
  const plan = PLANS.find((p) => p.name === sub.plan && p.audience === sub.audience);
  const payments = TRANSACTIONS.filter((t) => t.related === sub.id);
  const failed = payments.filter((p) => p.status === "Failed");
  const audit = AUDIT_EVENTS.filter((a) => a.entity === sub.id);
  const timeline = [
    ...sub.history.map((h, i) => ({ id: `h${i}`, at: h.at, actor: h.actor, actorType: (h.actor.startsWith("System") ? "System" : "User") as "System" | "User", title: h.event, from: h.from, to: h.to })),
    ...audit.map((a) => ({ id: a.id, at: a.at, actor: a.actor, actorType: a.actorType, title: a.action, detail: a.reason, to: a.next })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <PermissionGuard permission="finance.view">
      <div className="space-y-5">
        <PageHeader
          title={`${sub.account} · ${sub.plan}`}
          description={`${sub.accountKind} subscription · ${formatCurrency(sub.amount)} / month`}
          breadcrumbs={[{ label: "Commercial" }, { label: "Subscriptions", href: "/subscriptions" }, { label: sub.id }]}
          meta={<><StatusBadge status={sub.status} /><StatusBadge status={sub.paymentStatus} /></>}
          actions={<Button asChild size="sm" variant="outline" className="h-8 bg-background"><Link to={sub.accountKind === "Company" ? `/companies/${sub.accountId}` : `/users/${sub.accountId}`}>Open account</Link></Button>}
        />

        {!sub.entitlementsActive && sub.paymentStatus === "Pending webhook" && (
          <div className="flex items-start gap-3 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm dark:border-violet-500/30 dark:bg-violet-500/10" role="status">
            <ClockIcon className="mt-0.5 size-4 text-violet-600" />
            <p>Premium entitlements are <span className="font-medium">held</span> until a verified <code className="font-mono text-xs">charge.success</code> event is received from the provider. This page cannot mark the payment successful.</p>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <SectionCard title="Subscription">
              <DetailGrid columns={3} items={[
                { label: "Current plan", value: sub.plan },
                { label: "Previous plan", value: sub.history.filter((h) => h.from).slice(-1)[0]?.from ?? "—" },
                { label: "Billing period", value: sub.billingPeriod },
                { label: "Started", value: formatDate(sub.startedAt) },
                { label: "Renews", value: formatDate(sub.renewsAt) },
                { label: "Cancellation", value: sub.status === "Cancels at period end" ? "Scheduled at period end" : sub.status === "Cancelled" ? "Cancelled" : "None" },
                { label: "Entitlements", value: sub.entitlementsActive ? <StatusBadge status="Active" /> : <StatusBadge status="Held" tone="warning" /> },
                { label: "Failed attempts", value: failed.length || sub.history.filter((h) => h.event.toLowerCase().includes("fail")).length },
              ]} />
            </SectionCard>

            <SectionCard title="Payment history" description="Receipts and provider references">
              <DataTable data={payments} getRowId={(t) => t.id} pageSize={5} emptyTitle="No payment records"
                columns={[
                  { key: "id", header: "Transaction", cell: (t) => <Link to={`/transactions?ref=${t.id}`} className="font-mono text-xs hover:underline">{t.id}</Link> },
                  { key: "ref", header: "Provider ref", cell: (t) => <span className="font-mono text-xs">{t.providerRef}</span> },
                  { key: "date", header: "Date", cell: (t) => <span className="text-xs">{formatDateTime(t.createdAt)}</span> },
                  { key: "amt", header: "Amount", align: "right", cell: (t) => formatCurrency(t.gross, t.currency) },
                  { key: "wh", header: "Webhook", cell: (t) => <StatusBadge status={t.webhook} /> },
                  { key: "status", header: "Status", cell: (t) => <StatusBadge status={t.status} /> },
                ]}
                rowActions={(t) => (
                  <Button size="icon" variant="ghost" className="size-7" disabled={t.status !== "Successful" && t.status !== "Refunded"} aria-label="Download receipt" onClick={() => recordDemoAction(`Receipt for ${t.id} requested`)}>
                    <ReceiptIcon className="size-3.5" />
                  </Button>
                )}
              />
            </SectionCard>

            {plan && (
              <SectionCard title="Entitlements" description="Configured limit vs measured usage this period">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground"><tr><th className="pb-2 text-left font-medium">Entitlement</th><th className="pb-2 text-right font-medium">Configured limit</th><th className="pb-2 text-right font-medium">Measured usage</th></tr></thead>
                  <tbody className="divide-y">
                    {plan.entitlements.map((e) => (
                      <tr key={e.key}>
                        <td className="py-2">{e.label}</td>
                        <td className="py-2 text-right tabular-nums">{e.limit === null ? <span className="text-muted-foreground">Not configured</span> : typeof e.limit === "number" ? formatNumber(e.limit) : e.limit}</td>
                        <td className="py-2 text-right text-xs text-muted-foreground">Usage metering not connected</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </SectionCard>
            )}
          </div>

          <div className="space-y-4">
            <SectionCard title="Renewal, plan & entitlement changes">
              <AuditTimeline events={timeline} />
            </SectionCard>
            <SectionCard title="Administrative notes" description="Internal only">
              <Label htmlFor="sub-note" className="sr-only">Note</Label>
              <Textarea id="sub-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add context for Finance reviewers" />
              <PermissionButton permission="finance.manage" size="sm" variant="outline" className="mt-2 bg-background" disabled={!note.trim()} onClick={() => { recordDemoAction("Note added to subscription"); setNote(""); }}>
                <StickyNoteIcon className="mr-1.5 size-3.5" /> Save note
              </PermissionButton>
            </SectionCard>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
