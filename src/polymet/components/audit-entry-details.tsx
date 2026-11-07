import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/polymet/components/status-badge";
import { displayValue } from "@/polymet/components/resource-page";
import { isRecord, type AdminRecord } from "@/polymet/lib/admin-service";

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.length ? value.map((item) => displayValue(item)).join(", ") : "None";
  return value === undefined ? "—" : displayValue(value);
}

function StateChanges({ previous, next }: { previous: unknown; next: unknown }) {
  const before = isRecord(previous) ? previous : {};
  const after = isRecord(next) ? next : {};
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
  if (!keys.length) return <p className="text-sm text-muted-foreground">This entry did not record a before/after state.</p>;
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
          <tr><th scope="col" className="p-2 font-medium">Field</th><th scope="col" className="p-2 font-medium">Before</th><th scope="col" className="p-2 font-medium">After</th></tr>
        </thead>
        <tbody>
          {keys.map((key) => {
            const changed = JSON.stringify(before[key]) !== JSON.stringify(after[key]);
            return (
              <tr key={key} className={changed ? "border-t bg-amber-50/60 dark:bg-amber-500/10" : "border-t"}>
                <th scope="row" className="p-2 text-left align-top font-mono text-xs font-normal">{key}</th>
                <td className="break-words p-2 align-top">{formatValue(before[key])}</td>
                <td className="break-words p-2 align-top">{formatValue(after[key])}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AuditEntryDetails({ record }: { record: AdminRecord }) {
  const [open, setOpen] = useState(false);
  const recorded = typeof record.createdAt === "string" ? new Date(record.createdAt).toLocaleString() : "Not supplied";
  const rows: [string, unknown][] = [
    ["When", recorded],
    ["Who", `${displayValue(record.actorName)} (${displayValue(record.actorId)})`],
    ["Role at the time", record.actorRole],
    ["Action", record.action],
    ["Entity", `${displayValue(record.entityType)} · ${displayValue(record.entityId)}`],
    ["Reason", record.reason],
    ["Internal note", record.internalNote],
    ["IP address", record.ipAddress],
    ["Browser / user agent", record.userAgent],
    ["Correlation ID", record.correlationId],
    ["Audit ID", record._id],
  ];
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Details</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">{displayValue(record.action)} {typeof record.outcome === "string" && <StatusBadge status={record.outcome} />}</DialogTitle>
            <DialogDescription>Immutable audit record. Changes below are exactly what the backend stored.</DialogDescription>
          </DialogHeader>
          <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[11rem_1fr]">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="break-words">{value === undefined || value === null || value === "" ? <span className="text-muted-foreground">Not supplied</span> : displayValue(value)}</dd>
              </div>
            ))}
          </dl>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">What changed</h3>
            <StateChanges previous={record.previousState} next={record.nextState} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
