import { useState } from "react";
import { PencilIcon, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/polymet/components/page-header";
import { StatusBadge } from "@/polymet/components/status-badge";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { PageSkeleton, ErrorState } from "@/polymet/components/state-views";
import type { EntitlementValue, Plan, PlanAudience } from "@/polymet/data/commercial-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatCurrency, formatDate, formatNumber } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";
import { cn } from "@/lib/utils";

function limitLabel(e: EntitlementValue) {
  if (e.limit === null) return "Not configured";
  if (e.limit === "Unlimited") return "Unlimited";
  return `${formatNumber(e.limit)} ${e.unit}`;
}

export default function PlansPage() {
  const { data, loading, error, retry } = useAdminQuery(adminService.plans);
  const [editing, setEditing] = useState<{ plan: Plan; ent: EntitlementValue } | null>(null);
  const [value, setValue] = useState("");
  const [unlimited, setUnlimited] = useState(false);
  const [effective, setEffective] = useState("2025-07-01");

  const openEdit = (plan: Plan, ent: EntitlementValue) => {
    setEditing({ plan, ent });
    setUnlimited(ent.limit === "Unlimited");
    setValue(typeof ent.limit === "number" ? String(ent.limit) : "");
  };

  const renderAudience = (audience: PlanAudience) => {
    const plans = (data ?? []).filter((p) => p.audience === audience);
    const keys = plans[0]?.entitlements ?? [];
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => (
            <Card key={p.id} className={cn("p-4 shadow-xs", p.priceMonthly === 0 && "bg-muted/30")}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{p.name}</p>
                <StatusBadge status={p.status} />
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{p.priceMonthly === 0 ? "Free" : formatCurrency(p.priceMonthly)}<span className="text-xs font-normal text-muted-foreground">{p.priceMonthly ? " / month" : ""}</span></p>
              <p className="mt-1 text-xs text-muted-foreground">{formatNumber(p.activeSubscribers)} active · effective {formatDate(p.effectiveFrom)}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">{p.id}</p>
            </Card>
          ))}
        </div>
        <div className="overflow-x-auto rounded-lg border bg-card shadow-xs">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Entitlement (configured limit)</th>
                {plans.map((p) => <th key={p.id} className="px-4 py-2 text-left font-medium">{p.name}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y">
              {keys.map((k) => (
                <tr key={k.key}>
                  <td className="px-4 py-2.5">
                    <p>{k.label}</p>
                    <p className="text-[11px] text-muted-foreground">Unit: {k.unit}</p>
                  </td>
                  {plans.map((p) => {
                    const ent = p.entitlements.find((e) => e.key === k.key)!;
                    return (
                      <td key={p.id} className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("tabular-nums", ent.limit === null && "text-muted-foreground")}>{limitLabel(ent)}</span>
                          <PermissionButton permission="plans.manage" variant="ghost" size="icon" className="size-6" aria-label={`Edit ${k.label} for ${p.name}`} onClick={() => openEdit(p, ent)}>
                            <PencilIcon className="size-3" />
                          </PermissionButton>
                        </div>
                        <p className={cn("text-[10px] uppercase tracking-wide", ent.source === "Documented in PRD" ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>{ent.source}</p>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <PermissionGuard permission="finance.view">
      <div className="space-y-5">
        <PageHeader
          title="Plans & entitlements"
          description="Plan catalogue and configured limits. Unspecified entitlements stay ‘Not configured’ until product confirms them — no benefits are assumed."
          breadcrumbs={[{ label: "Commercial" }, { label: "Plans & entitlements" }]}
        />
        <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p>Values here are <span className="font-medium">configured limits</span>. Measured usage per account is shown on each subscription. Premium entitlements activate only after a verified payment confirmation.</p>
        </div>
        {loading ? <PageSkeleton /> : error ? <ErrorState onRetry={retry} /> : (
          <Tabs defaultValue="Talent" className="space-y-4">
            <TabsList>
              <TabsTrigger value="Talent">Talent plans</TabsTrigger>
              <TabsTrigger value="Employer">Employer plans</TabsTrigger>
            </TabsList>
            <TabsContent value="Talent">{renderAudience("Talent")}</TabsContent>
            <TabsContent value="Employer">{renderAudience("Employer")}</TabsContent>
          </Tabs>
        )}

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit entitlement</DialogTitle>
              <DialogDescription>{editing?.plan.audience} · {editing?.plan.name} · {editing?.ent.label}</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                recordDemoAction(`Scheduled ${editing?.ent.label} = ${unlimited ? "Unlimited" : value} for ${editing?.plan.name}`, `Effective ${formatDate(effective)}. Change requires backend approval and is audited.`);
                setEditing(null);
              }}
            >
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="unlimited" className="font-normal">Unlimited</Label>
                <Switch id="unlimited" checked={unlimited} onCheckedChange={setUnlimited} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="limit">Limit ({editing?.ent.unit})</Label>
                <Input id="limit" type="number" min={0} value={value} disabled={unlimited} onChange={(e) => setValue(e.target.value)} placeholder="Leave empty to keep unconfigured" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="effective">Effective from</Label>
                <Input id="effective" type="date" value={effective} onChange={(e) => setEffective(e.target.value)} />
              </div>
              {editing?.ent.source === "Documented in PRD" && (
                <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">This limit is documented in the PRD. Changing it requires product sign-off.</p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" className="bg-background" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={!unlimited && value === ""}>Schedule change</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
