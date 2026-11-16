import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { ResourcePage } from "@/polymet/components/resource-page";
import { mutateAdmin, resources } from "@/polymet/lib/admin-service";
import { planUpdatePayload, readManagedPlan, type ManagedPlan } from "@/polymet/lib/plan-management";

export default function PlansPage() {
  const { can } = useAdminRole();
  const [selected, setSelected] = useState<{ plan: ManagedPlan; refresh: () => void } | null>(null);
  return <>
    <ResourcePage resource={resources.plans} rowActions={(record, refresh) => {
      const plan = readManagedPlan(record);
      return <Button variant="outline" size="sm" disabled={!plan} onClick={() => plan && setSelected({ plan, refresh })}>
        {!plan ? "Invalid plan data" : can("plans.manage") ? "Edit price & limits…" : "View limits…"}
      </Button>;
    }} />
    {selected && <PlanEditor key={`${selected.plan.code}:${selected.plan.updated_at}`} plan={selected.plan}
      editable={can("plans.manage")} onClose={() => setSelected(null)} onSaved={selected.refresh} />}
  </>;
}

function PlanEditor({ plan, editable, onClose, onSaved }: {
  plan: ManagedPlan; editable: boolean; onClose: () => void; onSaved: () => void;
}) {
  const [price, setPrice] = useState(String(plan.price_monthly));
  const [currency, setCurrency] = useState(plan.currency);
  const [limits, setLimits] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(plan.limits).map(([key, value]) => [key, String(value)])),
  );
  const reservedFree = plan.code === "free" || plan.code === "emp-free";
  const setLimit = (key: string, value: string) => setLimits((previous) => ({ ...previous, [key]: value }));

  return <ConfirmActionDialog open onOpenChange={(open) => { if (!open) onClose(); }}
    contentClassName="max-h-[90dvh] overflow-y-auto"
    title={editable ? "Save tier price & limits" : "Tier price & limits (read-only)"}
    target={`${plan.name} · ${plan.audience} · ${plan.code}`}
    description="Canonical billing configuration. Amounts are major currency units, not kobo or cents. Unconfigured never means unlimited."
    requireReason={editable} requireAcknowledgement={editable} confirmLabel={editable ? "Confirm & save" : "Close"}
    consequences={editable ? ["The public catalogue and new checkouts use the saved price. Existing payment amounts are not rewritten.",
      "Billing returns these configured limits. This does not implement new downstream quota enforcement.",
      "A stale update is rejected. Refresh the table and reopen the editor to review current values."] : []}
    onConfirm={async ({ note }) => {
      if (!editable) return;
      const payload = planUpdatePayload(plan, price, currency, limits, note);
      await mutateAdmin(`/plans/${encodeURIComponent(plan.code)}`, payload, "patch");
      toast.success("Billing tier updated");
      onSaved();
    }}>
    <div className="max-h-[45vh] space-y-4 overflow-y-auto pr-2">
      <fieldset disabled={!editable} className="space-y-4">
        <label className="block space-y-1 text-sm">
          <span>Monthly price (major units; currently {plan.currency} {plan.price_monthly.toLocaleString()})</span>
          <Input aria-label="Monthly price" type="number" min="0" step="0.01" required value={price}
            disabled={reservedFree} onChange={(event) => setPrice(event.target.value)} />
        </label>
        {reservedFree && <p className="text-xs text-muted-foreground">Reserved fallback tier: its price must stay zero. Limits remain configurable.</p>}
        <label className="block space-y-1 text-sm">
          <span>Currency</span>
          <select aria-label="Currency" className="w-full rounded-md border bg-background p-2" value={currency}
            onChange={(event) => setCurrency(event.target.value as ManagedPlan["currency"])}>
            <option value="NGN">NGN — Nigerian naira</option><option value="USD">USD — US dollars</option>
          </select>
        </label>
        <p className="text-xs text-muted-foreground">Counts are non-negative whole numbers. Zero grants no allowance. “Not configured” stores null; it does not grant unlimited use. No new entitlement keys can be added here.</p>
        {plan.limitDefinitions.map((definition) => <div key={definition.key} className="space-y-1">
          <label htmlFor={definition.type === "count" && limits[definition.key] === "null" ? `configuration-${definition.key}` : `limit-${definition.key}`} className="text-sm font-medium">{definition.label} ({definition.unit})</label>
          <p className="text-xs text-muted-foreground">Stored: {plan.limits[definition.key] === null ? "Not configured" : String(plan.limits[definition.key])}</p>
          {definition.type === "boolean" ? (
            <select id={`limit-${definition.key}`} className="w-full rounded-md border bg-background p-2 text-sm"
              value={limits[definition.key]} onChange={(event) => setLimit(definition.key, event.target.value)}>
              <option value="null">Not configured (null)</option><option value="true">Enabled</option><option value="false">Disabled</option>
            </select>
          ) : <>
            <select id={`configuration-${definition.key}`} aria-label={`${definition.label} configuration`} className="w-full rounded-md border bg-background p-2 text-sm"
              value={limits[definition.key] === "null" ? "null" : "count"}
              onChange={(event) => setLimit(definition.key, event.target.value === "null" ? "null" : "0")}>
              <option value="null">Not configured (null)</option><option value="count">Configured count</option>
            </select>
            {limits[definition.key] !== "null" && <Input id={`limit-${definition.key}`} type="number" min="0" max={Number.MAX_SAFE_INTEGER}
              step="1" required value={limits[definition.key]} onChange={(event) => setLimit(definition.key, event.target.value)} />}
          </>}
        </div>)}
      </fieldset>
      {!editable && <p className="text-sm text-muted-foreground">Finance viewing access is read-only. Editing requires plans.manage.</p>}
    </div>
  </ConfirmActionDialog>;
}
