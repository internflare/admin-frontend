import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/polymet/components/page-header";
import { SectionCard, DetailGrid } from "@/polymet/components/section-card";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { ErrorState, LoadingState } from "@/polymet/components/state-views";
import { FieldValue, displayValue, ResourcePage } from "@/polymet/components/resource-page";
import { UnavailableNotice } from "@/polymet/components/unavailable-page";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { fetchDetail, findDirectoryRecord, invalidResponse, isRecord, mutateAdmin, recordId, resources, type AdminRecord, type ResourceDefinition, type ResourceField } from "@/polymet/lib/admin-service";
import type { Permission } from "@/polymet/data/admin-roles";

type DetailKind = "users" | "companies" | "listings" | "workspaces" | "verification" | "feedback";
type Mutation = { label: string; endpoint: string; payload: AdminRecord; permission: Permission; destructive?: boolean; reveal?: boolean };

const extraFields: Record<DetailKind, ResourceField[]> = {
  users: [{ key: "phone", label: "Phone (server-authorised)" }, { key: "restrictionReason", label: "Restriction reason" }, { key: "restrictedAt", label: "Restricted at", format: "date" }],
  companies: [{ key: "registration_number", label: "Registration number" }, { key: "website", label: "Website" }, { key: "contact_email", label: "Contact email" }, { key: "phone", label: "Phone" }, { key: "description", label: "Description" }],
  listings: [{ key: "description", label: "Description" }, { key: "location", label: "Location" }, { key: "country", label: "Country" }, { key: "skills_required", label: "Required skills" }, { key: "is_paid", label: "Paid" }, { key: "compensation_min", label: "Minimum compensation" }, { key: "compensation_max", label: "Maximum compensation" }, { key: "currency", label: "Currency" }, { key: "payment_frequency", label: "Payment frequency" }, { key: "applicationCount", label: "Application count" }, { key: "moderation_reason", label: "Moderation reason" }],
  workspaces: [{ key: "features_enabled", label: "Enabled features" }, { key: "seats_available", label: "Seats available" }, { key: "last_reprovisioned_at", label: "Last re-provisioned", format: "date" }],
  verification: [{ key: "company.registration_number", label: "Company registration" }, { key: "company.contact_email", label: "Contact email" }, { key: "company.country", label: "Country" }, { key: "review_notes", label: "Review notes" }, { key: "decided_at", label: "Decision recorded", format: "date" }],
  feedback: [{ key: "description", label: "Description" }, { key: "steps_to_reproduce", label: "Steps to reproduce" }, { key: "expected_behavior", label: "Expected behaviour" }, { key: "page_path", label: "Page" }, { key: "user_agent", label: "Browser" }, { key: "submitter.email", label: "Reporter email (server-authorised)" }, { key: "submitter.user_id", label: "Reporter user ID", href: (r) => isRecord(r.submitter) && typeof r.submitter.user_id === "string" ? `/users/${encodeURIComponent(r.submitter.user_id)}` : undefined }, { key: "admin_note", label: "Triage note" }, { key: "status_updated_at", label: "Status changed", format: "date" }],
};

const FEEDBACK_ACTIONS: { status: string; label: string; destructive?: boolean }[] = [
  { status: "Triaged", label: "Mark triaged" },
  { status: "Planned", label: "Mark planned" },
  { status: "Resolved", label: "Mark resolved" },
  { status: "Declined", label: "Decline", destructive: true },
  { status: "New", label: "Reopen as new" },
];

function safeDocumentUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function ResourceDetail({ kind, id }: { kind: DetailKind; id: string }) {
  return <PermissionGuard permission={resources[kind].permission}><DetailContent key={`${kind}:${id}`} kind={kind} id={id} /></PermissionGuard>;
}

function DetailContent({ kind, id }: { kind: DetailKind; id: string }) {
  const { can } = useAdminRole();
  const resource: ResourceDefinition = resources[kind];
  const fetcher = useCallback(async () => {
    if (!id) throw new Error("A record ID is required.");
    if (kind === "companies" || kind === "workspaces") return findDirectoryRecord(resources[kind], id);
    return fetchDetail(`${resources[kind].endpoint}/${encodeURIComponent(id)}`, kind === "users" ? "user" : kind === "listings" ? "listing" : kind === "feedback" ? "feedback" : "verification");
  }, [kind, id]);
  const query = useAdminQuery(fetcher);
  const [pending, setPending] = useState<Mutation | null>(null);
  const [pii, setPii] = useState<AdminRecord | null>(null);
  if (query.loading) return <LoadingState label="Loading record" />;
  if (query.error || !query.data) return <ErrorState description={query.error ?? "The API did not return this record."} onRetry={query.retry} />;
  const record = query.data;
  const mutations: Mutation[] = [];
  if (kind === "users") {
    for (const status of ["Active", "Restricted", "Suspended"]) {
      if (record.status !== status) mutations.push({ label: status === "Active" ? "Restore access" : `${status} account`, endpoint: `/users/${encodeURIComponent(id)}/status`, payload: { status }, permission: "users.manage", destructive: status !== "Active" });
    }
    mutations.push({ label: "Inspect contact data (audited)", endpoint: `/users/${encodeURIComponent(id)}/reveal-pii`, payload: { field: "all" }, permission: "users.pii", reveal: true });
  } else if (kind === "listings") {
    for (const action of ["Approve", "Reject", "Flag"]) mutations.push({ label: `${action} listing`, endpoint: `/listings/${encodeURIComponent(id)}/moderate`, payload: { action }, permission: "listings.moderate", destructive: action !== "Approve" });
  } else if (kind === "workspaces") {
    mutations.push({ label: "Re-provision workspace", endpoint: `/workspaces/${encodeURIComponent(id)}/re-provision`, payload: {}, permission: "workspaces.manage" });
  } else if (kind === "verification" && !["APPROVED", "REJECTED"].includes(String(record.status))) {
    for (const decision of ["Approve", "Reject", "Request more information"]) mutations.push({ label: decision, endpoint: `/verification/${encodeURIComponent(id)}/decision`, payload: { decision }, permission: "companies.verify", destructive: decision === "Reject" });
  } else if (kind === "feedback") {
    for (const action of FEEDBACK_ACTIONS) {
      if (record.status !== action.status) mutations.push({ label: action.label, endpoint: `/feedback/${encodeURIComponent(id)}/status`, payload: { status: action.status }, permission: "support.manage", destructive: action.destructive });
    }
  }
  const checklist = Array.isArray(record.checklist) ? record.checklist.filter(isRecord) : [];
  const documents = Array.isArray(record.documents) ? record.documents.filter(isRecord) : [];
  const name = displayValue(record.name ?? record.title ?? (isRecord(record.company) ? record.company.name : undefined) ?? id);

  return (
    <div className="space-y-5">
      <PageHeader title={name} description={`Recorded ID: ${recordId(record)}`} breadcrumbs={[{ label: resource.title, href: resource.detailPath }, { label: id }]} actions={
        <><Button variant="outline" size="sm" onClick={query.retry}>Refresh</Button>{mutations.map((mutation) => (
          <PermissionButton key={mutation.label} permission={mutation.permission} size="sm" variant={mutation.destructive ? "destructive" : "outline"}
            disabled={kind === "verification" && mutation.payload.decision === "Approve" && (!checklist.length || checklist.some((item) => item.mandatory === true && item.status !== "Passed"))}
            onClick={() => setPending(mutation)}>{mutation.label}</PermissionButton>
        ))}</>
      } />
      <SectionCard title="Backend record">
        <DetailGrid items={[...resource.fields, ...extraFields[kind]].map((field) => ({ label: field.label, value: <FieldValue record={record} field={field} /> }))} />
      </SectionCard>
      {pii && can("users.pii") && <SectionCard title="Backend-confirmed contact inspection" action={<Button variant="outline" size="sm" onClick={() => setPii(null)}>Hide inspection result</Button>}>
        <DetailGrid items={[{ label: "Email", value: displayValue(pii.email) }, { label: "Phone", value: displayValue(pii.phone) }, { label: "Inspected at", value: displayValue(pii.revealedAt) }]} />
      </SectionCard>}
      {kind === "verification" && (
        <>
          <SectionCard title="Verification checklist" description="Each change is sent to the backend immediately after confirmation. Approval requires mandatory checks to pass.">
            {!Array.isArray(record.checklist) ? <p>Checklist unavailable: the API did not supply it.</p> : checklist.length === 0 ? <p>No checklist items recorded.</p> : (
              <ul className="divide-y">{checklist.map((item) => (
                <li key={String(item.itemKey)} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div><p>{displayValue(item.title)} {item.mandatory === true ? "(required)" : ""}</p><p className="text-sm text-muted-foreground">{displayValue(item.status)} · {displayValue(item.notes)}</p></div>
                  <div className="flex gap-2">{["Passed", "Failed", "Pending"].map((status) => (
                    <PermissionButton key={status} permission="companies.verify" variant="outline" size="sm"
                      disabled={item.status === status || ["APPROVED", "REJECTED"].includes(String(record.status)) || typeof item.itemKey !== "string"}
                      onClick={() => setPending({ label: `Mark check ${status.toLowerCase()}`, endpoint: `/verification/${encodeURIComponent(id)}/checklist`, payload: { itemKey: item.itemKey, status }, permission: "companies.verify" })}>{status}</PermissionButton>
                  ))}</div>
                </li>
              ))}</ul>
            )}
          </SectionCard>
          <SectionCard title="Submitted documents" description="Only URLs supplied by the backend are available. No secure-viewer or download audit is claimed.">
            {!Array.isArray(record.documents) ? <p>Document list unavailable: the API did not supply it.</p> : documents.length === 0 ? <p>No documents recorded.</p> : (
              <ul className="space-y-2">{documents.map((document, index) => {
                const url = safeDocumentUrl(document.url);
                return <li key={`${String(document.url)}:${index}`}>{url ? <a className="underline" href={url} target="_blank" rel="noopener noreferrer">{displayValue(document.title)}</a> : <span>{displayValue(document.title)} — usable document URL not supplied</span>}</li>;
              })}</ul>
            )}
          </SectionCard>
        </>
      )}
      {kind === "users" && can("recruitment.view") && (
        /^[a-f\d]{24}$/i.test(id) ? <ResourcePage resource={resources.applications} title="Applications for this user" initialParams={{ talentId: id }} /> :
          <UnavailableNotice>The applications API only supports MongoDB ObjectId talent filters; this account's ID cannot safely be used to query its application history.</UnavailableNotice>
      )}
      {kind === "companies" && can("listings.view") && (/^[a-f\d]{24}$/i.test(id) ? <ResourcePage resource={resources.listings} title="Company listings" initialParams={{ companyId: id }} /> : <UnavailableNotice>The listings API only supports MongoDB ObjectId company filters; related listings cannot be queried safely for this ID.</UnavailableNotice>)}
      {kind === "listings" && can("recruitment.view") && <ResourcePage resource={resources.applications} title="Listing applications" initialParams={{ opportunityId: id }} />}
      {(kind === "users" || kind === "companies") && can("audit.view") && <Button asChild variant="outline"><Link to={`/audit-logs?entityId=${encodeURIComponent(id)}`}>View recorded audit events</Link></Button>}
      {resource.note && <UnavailableNotice>{resource.note}</UnavailableNotice>}
      {pending && <ConfirmActionDialog key={`${pending.endpoint}:${pending.label}`} open onOpenChange={(open) => { if (!open) setPending(null); }} title={pending.label} target={name} destructive={pending.destructive}
        onConfirm={async ({ reason, note }) => {
          const response = await mutateAdmin(pending.endpoint, { ...pending.payload, reason: reason || note, note, ...(pending.payload.itemKey ? { notes: note } : {}) });
          if (pending.reveal) {
            if (response.userId !== id || typeof response.revealedAt !== "string") invalidResponse(pending.endpoint);
            setPii(response);
            toast.success("Contact inspection confirmed by the backend");
          } else {
            setPii(null);
            toast.success("Change confirmed by the backend");
            query.retry();
          }
        }} />}
    </div>
  );
}
