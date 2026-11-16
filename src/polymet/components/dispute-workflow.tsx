import { useCallback, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import { LoadingState } from "@/polymet/components/state-views";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { useAdminSearch } from "@/polymet/lib/use-admin-search";
import { useAdminMutation } from "@/polymet/lib/use-admin-mutation";
import { changeDispute, createDispute, fetchDispute, lookupDispute, type DisputeAction, type DisputeOption } from "@/polymet/lib/dispute-service";

const textareaClass = "block min-h-24 w-full rounded-md border bg-background p-2 text-sm";
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1 text-sm"><span>{label}</span>{children}</label>;
}
function Lookup({ kind, label, value, onChange, required = false }: {
  kind: "users" | "applications" | "admins"; label: string; value: DisputeOption | null;
  onChange: (value: DisputeOption | null) => void; required?: boolean;
}) {
  const search = useAdminSearch();
  const fetcher = useCallback((signal: AbortSignal) => lookupDispute(kind, search.state.query, signal), [kind, search.state.query]);
  const result = useAdminQuery(fetcher, search.state.phase === "ready" && (kind === "admins" || !!search.state.query));
  return <div className="space-y-2 rounded-md border p-3">
    <Field label={`${label}${required ? " (required)" : " (optional)"}`}>
      <Input aria-label={`Search ${label}`} value={search.input} onChange={(event) => { result.cancel(); search.update(event.target.value); }} placeholder={kind === "applications" ? "Search by exact application ID…" : `Search ${label.toLowerCase()} by name…`} />
    </Field>
    {search.state.phase === "pending" && <p role="status" className="flex items-center gap-2 text-xs"><Spinner aria-label="Searching" /></p>}
    {search.state.phase === "too-short" && <p role="status" className="text-xs">Enter at least 3 characters.</p>}
    {search.state.phase === "too-long" && <p role="alert" className="text-xs text-destructive">Search must be 100 characters or fewer.</p>}
    {result.loading && <p role="status" className="text-xs">Loading matches…</p>}
    {result.error && <p role="alert" className="text-sm text-destructive">{result.error} <Button size="sm" variant="outline" type="button" onClick={result.retry}>Retry</Button></p>}
    {result.data && <Field label={`Select ${label.toLowerCase()}`}>
      <select className="w-full rounded-md border bg-background p-2" value={value?.id ?? ""} onChange={(event) => onChange(result.data?.find((option) => option.id === event.target.value) ?? null)}>
        <option value="">Not selected</option>
        {value && !result.data.some((option) => option.id === value.id) && <option value={value.id}>{value.label}</option>}
        {result.data.map((option) => <option key={option.id} value={option.id}>{option.label} · {option.id}</option>)}
      </select>
    </Field>}
    {result.data?.length === 0 && <p className="text-xs text-muted-foreground">No matching records.</p>}
    {value && <p className="break-all text-xs">Selected: {value.label} · {value.id} <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>Clear</Button></p>}
  </div>;
}
export function CreateDisputeDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [user, setUser] = useState<DisputeOption | null>(null);
  const [application, setApplication] = useState<DisputeOption | null>(null);
  const mutation = useAdminMutation("Could not create dispute");
  return <Dialog open onOpenChange={(open) => { if (!open && !mutation.submitting) onClose(); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Create dispute</DialogTitle><DialogDescription>Create a real case. Optional links are verified against existing records. When both are selected the user must be the application's candidate.</DialogDescription></DialogHeader>
      <form className="space-y-3" onSubmit={(event) => {
        event.preventDefault();
        if (mutation.submitting) return;
        const form = new FormData(event.currentTarget);
        void mutation.run(async () => {
          const created = await createDispute({ title: form.get("title"), description: form.get("description"), priority: form.get("priority"), reason: form.get("reason"), ...(user ? { user_id: user.id } : {}), ...(application ? { application_id: application.id } : {}) });
          toast.success("Dispute created");
          onCreated(created._id);
        });
      }}>
        <fieldset disabled={mutation.submitting} className="space-y-3">
          <Field label="Title"><Input name="title" required minLength={5} maxLength={160} /></Field>
          <Field label="Description"><textarea className={textareaClass} name="description" required minLength={20} maxLength={5000} /></Field>
          <Field label="Priority"><select name="priority" defaultValue="Medium" className="w-full rounded-md border bg-background p-2">{["Low", "Medium", "High", "Critical"].map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Lookup kind="users" label="User" value={user} onChange={setUser} />
          <Lookup kind="applications" label="Application" value={application} onChange={setApplication} />
          <Field label="Reason (audit log)"><textarea name="reason" className={textareaClass} minLength={3} maxLength={2000} required /></Field>
          {mutation.error && <p role="alert" className="text-sm text-destructive">{mutation.error}</p>}
          <Button type="submit">{mutation.submitting && <Spinner className="mr-2" />}Create dispute</Button>
        </fieldset>
      </form>
    </DialogContent>
  </Dialog>;
}

export function DisputeDetailDialog({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const { can } = useAdminRole();
  const fetcher = useCallback((signal: AbortSignal) => fetchDispute(id, signal), [id]);
  const result = useAdminQuery(fetcher);
  const [action, setAction] = useState<DisputeAction>("notes");
  const [assignee, setAssignee] = useState<DisputeOption | null>(null);
  const mutation = useAdminMutation("Could not update dispute");
  const dispute = result.data;
  return <Dialog open onOpenChange={(open) => { if (!open && !mutation.submitting) onClose(); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{dispute ? `${dispute.reference} · ${dispute.title}` : "Dispute details"}</DialogTitle><DialogDescription>Review the case and its internal notes and evidence URL references.</DialogDescription></DialogHeader>
      {result.loading && <LoadingState label="Loading dispute" />}
      {result.error && <p role="alert" className="text-destructive">{result.error} <Button onClick={result.retry} variant="outline">Retry</Button></p>}
      {dispute && <div className="space-y-4 text-sm">
        <div className="flex flex-wrap items-center gap-3"><strong>{dispute.status} · {dispute.priority}</strong><Button size="sm" variant="outline" disabled={mutation.submitting} onClick={result.retry}>Refresh case</Button></div>
        <p className="whitespace-pre-wrap break-words">{dispute.description}</p>
        <dl className="grid gap-1 break-all"><div>Assignee admin ID: {dispute.assignee_id ?? "Unassigned"}</div><div>Linked user ID: {dispute.user_id ?? "None"}</div><div>Linked application ID: {dispute.application_id ?? "None"}</div></dl>
        {dispute.escalation && <section><h3 className="font-semibold">Escalation</h3><p className="whitespace-pre-wrap break-words">{dispute.escalation.reason}</p><small>{dispute.escalation.author_id} · {new Date(dispute.escalation.created_at).toLocaleString()}</small></section>}
        {dispute.resolution && <section><h3 className="font-semibold">Resolution</h3><p className="whitespace-pre-wrap break-words">{dispute.resolution.summary}</p><small>{dispute.resolution.author_id} · {new Date(dispute.resolution.created_at).toLocaleString()}</small></section>}
        <section><h3 className="font-semibold">Internal notes ({dispute.notes.length}/100)</h3>{!dispute.notes.length && <p className="text-muted-foreground">No notes yet.</p>}{dispute.notes.map((note, index) => <div key={index} className="my-2 rounded border p-2"><p className="whitespace-pre-wrap break-words">{note.text}</p><small>{note.author_id} · {new Date(note.created_at).toLocaleString()}</small></div>)}</section>
        <section><h3 className="font-semibold">Evidence URL references ({dispute.evidence.length}/50)</h3><p className="text-xs text-muted-foreground">External links only; no files are uploaded or fetched. Review the destination before opening.</p>{!dispute.evidence.length && <p className="text-muted-foreground">No references yet.</p>}{dispute.evidence.map((item, index) => <div key={index} className="my-2 rounded border p-2"><p className="whitespace-pre-wrap break-words">{item.description}</p>{safeHttps(item.url) ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="block break-all underline">{item.url}</a> : <span>Invalid evidence URL</span>}<small>{item.author_id} · {new Date(item.created_at).toLocaleString()}</small></div>)}</section>
        {can("disputes.manage") && dispute.status !== "Resolved" && <form className="space-y-3 border-t pt-4" onSubmit={(event) => {
          event.preventDefault();
          if (mutation.submitting || (action === "assign" && !assignee)) return;
          const formElement = event.currentTarget;
          const form = new FormData(formElement);
          void mutation.run(async () => {
            const payload = { version: dispute.version, reason: form.get("reason"),
              ...(action === "assign" ? { assignee_id: assignee!.id } : {}),
              ...(action === "notes" ? { text: form.get("text") } : {}),
              ...(action === "evidence" ? { url: form.get("url"), description: form.get("description") } : {}),
              ...(action === "resolve" ? { summary: form.get("summary") } : {}),
            };
            await changeDispute(id, action, payload);
            toast.success("Dispute updated");
            formElement.reset();
            setAssignee(null);
            setAction("notes");
            result.retry();
            onChanged();
          });
        }}>
          <fieldset disabled={mutation.submitting} className="space-y-3">
            <Field label="Action"><select className="w-full rounded-md border bg-background p-2" value={action} onChange={(event) => { setAction(event.target.value as DisputeAction); mutation.reset(); }}>
              <option value="notes">Add internal note</option><option value="evidence">Add evidence URL reference</option><option value="assign">Assign / reassign</option>
              {dispute.status !== "Escalated" && <option value="escalate">Escalate</option>}
              {dispute.assignee_id && <option value="resolve">Resolve (final)</option>}
            </select></Field>
            <div key={action} className="space-y-3">
              {action === "assign" && <Lookup kind="admins" label="Active administrator" value={assignee} onChange={setAssignee} required />}
              {action === "notes" && <Field label="Internal note"><textarea className={textareaClass} name="text" required minLength={3} maxLength={2000} /></Field>}
              {action === "evidence" && <><Field label="HTTPS evidence URL (not an upload)"><Input type="url" pattern="https://.*" name="url" required maxLength={2048} /></Field><Field label="Evidence description"><textarea className={textareaClass} name="description" required minLength={3} maxLength={1000} /></Field></>}
              {action === "resolve" && <><p className="text-muted-foreground">Resolution is final. No payment, refund or account action is performed.</p><Field label="Resolution summary"><textarea className={textareaClass} name="summary" required minLength={10} maxLength={3000} /></Field></>}
              {action === "escalate" && <p>Escalation keeps the current assignee. Use the audit reason to describe why escalation is needed.</p>}
              <Field label="Reason (required audit log entry)"><textarea className={textareaClass} name="reason" required minLength={3} maxLength={2000} /></Field>
            </div>
            {mutation.error && <p role="alert" className="text-destructive">{mutation.error} If this case changed, refresh it before retrying.</p>}
            <Button type="submit" disabled={action === "assign" && !assignee}>{mutation.submitting && <Spinner className="mr-2" />}Confirm {action === "resolve" ? "final resolution" : "action"}</Button>
          </fieldset>
        </form>}
        {dispute.status === "Resolved" && <p className="rounded border p-3">This case is resolved and cannot be changed.</p>}
      </div>}
    </DialogContent>
  </Dialog>;
}
function safeHttps(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}
