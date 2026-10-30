import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckIcon, FileTextIcon, MessageSquareWarningIcon, XIcon, MinusIcon, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PageHeader } from "@/polymet/components/page-header";
import { SectionCard, DetailGrid } from "@/polymet/components/section-card";
import { PriorityBadge, StatusBadge } from "@/polymet/components/status-badge";
import { AuditTimeline } from "@/polymet/components/audit-timeline";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { EmptyState } from "@/polymet/components/state-views";
import { COMPANIES, VERIFICATION_REQUESTS } from "@/polymet/data/people-data";
import { AUDIT_EVENTS } from "@/polymet/data/operations-data";
import { formatDate, formatDateTime } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

type Decision = "Approve" | "Reject" | "Request more information";
type CheckStatus = "Passed" | "Failed" | "Unchecked";

export default function VerificationReviewPage() {
  const { requestId = "VER-5101" } = useParams();
  const request = VERIFICATION_REQUESTS.find((v) => v.id === requestId);
  const [checks, setChecks] = useState<CheckStatus[]>(() => request?.checklist.map((c) => c.status) ?? []);
  const [notes, setNotes] = useState("");
  const [decision, setDecision] = useState<Decision | null>(null);

  if (!request) {
    return <EmptyState title="Verification request not found" action={<Button asChild variant="outline" size="sm"><Link to="/verification">Back to queue</Link></Button>} />;
  }
  const company = COMPANIES.find((c) => c.id === request.companyId);
  const passed = checks.filter((c) => c === "Passed").length;
  const failed = checks.filter((c) => c === "Failed").length;
  const allPassed = passed === checks.length;
  const decided = request.state === "Verified" || request.state === "Rejected";
  const history = AUDIT_EVENTS.filter((a) => a.entity === request.id);

  return (
    <PermissionGuard permission="companies.verify">
      <div className="space-y-5">
        <PageHeader
          title={`Verify ${request.companyName}`}
          description="Company verification only. Representative identity is verified separately on the user account."
          breadcrumbs={[{ label: "People & organisations" }, { label: "Company verification", href: "/verification" }, { label: request.id }]}
          meta={
            <>
              <StatusBadge status={request.state} />
              <PriorityBadge priority={request.priority} />
              <span className="text-xs text-muted-foreground">Submitted {formatDateTime(request.submittedAt)}</span>
            </>
          }
          actions={
            <>
              <PermissionButton permission="companies.verify" variant="outline" size="sm" className="h-8 bg-background" disabled={decided} onClick={() => setDecision("Request more information")}>
                <MessageSquareWarningIcon className="mr-1.5 size-3.5" /> Request info
              </PermissionButton>
              <PermissionButton permission="companies.verify" variant="outline" size="sm" className="h-8 bg-background text-red-600" disabled={decided} onClick={() => setDecision("Reject")}>
                <XIcon className="mr-1.5 size-3.5" /> Reject
              </PermissionButton>
              <PermissionButton permission="companies.verify" size="sm" className="h-8" disabled={decided || !allPassed} onClick={() => setDecision("Approve")}>
                <CheckIcon className="mr-1.5 size-3.5" /> Approve
              </PermissionButton>
            </>
          }
        />

        {!allPassed && !decided && (
          <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
            <InfoIcon className="mt-0.5 size-4 text-muted-foreground" />
            <p>Approval is available only when every checklist item has passed. Completing registration alone never verifies a company.</p>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <SectionCard title="Submitted company details">
              <DetailGrid columns={3} items={[
                { label: "Company name", value: request.companyName },
                { label: "Registration number", value: company?.rcNumber ?? <span className="text-red-600">Not provided</span> },
                { label: "Country", value: request.country },
                { label: "Industry", value: request.industry },
                { label: "Size", value: company?.size ?? "—" },
                { label: "Website", value: company?.website ?? "—" },
                { label: "Representative", value: company ? <Link className="hover:underline" to={`/companies/${company.id}`}>{request.representative}</Link> : request.representative },
                { label: "Required information", value: <StatusBadge status={request.requiredInfo} /> },
                { label: "Assigned reviewer", value: request.reviewer ?? "Unassigned" },
              ]} />
            </SectionCard>

            <SectionCard title="Verification checklist" description={`${passed} passed · ${failed} failed · ${checks.length - passed - failed} unchecked`}>
              <ul className="divide-y">
                {request.checklist.map((item, i) => (
                  <li key={item.label} className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm">{item.label}</span>
                    <ToggleGroup
                      type="single"
                      size="sm"
                      value={checks[i]}
                      disabled={decided}
                      onValueChange={(v) => v && setChecks((prev) => prev.map((c, idx) => (idx === i ? (v as CheckStatus) : c)))}
                      aria-label={`Result for ${item.label}`}
                    >
                      <ToggleGroupItem value="Passed" className="h-7 gap-1 px-2 text-xs data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-700 dark:data-[state=on]:bg-emerald-500/10 dark:data-[state=on]:text-emerald-300"><CheckIcon className="size-3" /> Pass</ToggleGroupItem>
                      <ToggleGroupItem value="Failed" className="h-7 gap-1 px-2 text-xs data-[state=on]:bg-red-50 data-[state=on]:text-red-700 dark:data-[state=on]:bg-red-500/10 dark:data-[state=on]:text-red-300"><XIcon className="size-3" /> Fail</ToggleGroupItem>
                      <ToggleGroupItem value="Unchecked" className="h-7 gap-1 px-2 text-xs"><MinusIcon className="size-3" /> Unchecked</ToggleGroupItem>
                    </ToggleGroup>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <div className="space-y-4">
            <SectionCard title="Supporting evidence" description="Files open in a secure viewer; downloads are audited">
              {request.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
              ) : (
                <ul className="space-y-2">
                  {request.documents.map((d) => (
                    <li key={d.name}>
                      <button type="button" onClick={() => recordDemoAction(`Opened ${d.name}`, "Evidence views are recorded in the audit log.")} className="flex w-full items-center gap-3 rounded-md border p-2.5 text-left hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <FileTextIcon className="size-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{d.name}</p>
                          <p className="text-xs text-muted-foreground">{d.type} · {formatDate(d.uploadedAt)}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard title="Internal review notes" description="Never shown to the company">
              <Label htmlFor="review-notes" className="sr-only">Internal review notes</Label>
              <Textarea id="review-notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. CAC search matched; directors' particulars consistent with representative." />
              <Button size="sm" variant="outline" className="mt-2 bg-background" disabled={!notes.trim()} onClick={() => { recordDemoAction("Saved review note"); setNotes(""); }}>
                Save note
              </Button>
            </SectionCard>

            <SectionCard title="Review history">
              <AuditTimeline events={history.map((a) => ({ id: a.id, at: a.at, actor: a.actor, actorType: a.actorType, title: a.action, detail: a.reason, from: a.previous, to: a.next }))} emptyLabel="No previous decisions on this request." />
            </SectionCard>
          </div>
        </div>

        <ConfirmActionDialog
          open={!!decision}
          onOpenChange={(o) => !o && setDecision(null)}
          title={decision === "Approve" ? "Approve company verification" : decision === "Reject" ? "Reject company verification" : "Request more information"}
          target={`${request.companyName} · ${request.id}`}
          destructive={decision === "Reject"}
          reasonOptions={
            decision === "Approve"
              ? ["All checks passed against registry record"]
              : decision === "Reject"
                ? ["Registration not found in registry", "Documents appear altered", "Representative not authorised", "Suspected fraudulent organisation"]
                : ["Registration certificate missing or illegible", "Proof of address required", "Business email domain mismatch", "Director details inconsistent"]
          }
          consequences={
            decision === "Approve"
              ? ["Company is marked Verified with your name, date and reason", "Verified badge appears on listings", "Pending listings remain subject to listing moderation"]
              : decision === "Reject"
                ? ["Company is marked Rejected; listings cannot be published", "Company is notified with the policy reason (not internal notes)"]
                : ["Company is notified of the specific information required", "Request moves to ‘More info requested’ until resubmitted"]
          }
          confirmLabel={decision ?? "Confirm"}
          onConfirm={({ reason }) => recordDemoAction(`${decision} — ${request.id}`, `Reason: ${reason}. Checklist ${passed}/${checks.length} passed.`)}
        />
      </div>
    </PermissionGuard>
  );
}
