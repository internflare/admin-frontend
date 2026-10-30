import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowUpRightIcon, LockIcon, SendIcon, SirenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/polymet/components/page-header";
import { SectionCard, DetailGrid } from "@/polymet/components/section-card";
import { PriorityBadge, StatusBadge } from "@/polymet/components/status-badge";
import { PermissionGuard, PermissionButton } from "@/polymet/components/permission-controls";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { AuditTimeline } from "@/polymet/components/audit-timeline";
import { EmptyState, ErrorState, PageSkeleton } from "@/polymet/components/state-views";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import type { TicketStatus } from "@/polymet/data/operations-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDateTime } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";
import { cn } from "@/lib/utils";

const STATUSES: TicketStatus[] = ["Open", "In review", "Awaiting information", "Escalated", "Resolved", "Closed"];
const AGENTS = ["Kemi Alabi", "Adaeze Okafor", "Ifeanyi Obi", "Bisola Martins"];

type PendingAction =
  | { kind: "status"; value: TicketStatus }
  | { kind: "assign"; value: string }
  | { kind: "escalate" }
  | { kind: "resolve" };

export default function SupportTicketDetailPage() {
  const { ticketId = "TCK-2207" } = useParams();
  const { data, loading, error, retry } = useAdminQuery(adminService.tickets);
  const { can } = useAdminRole();
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState description={error} onRetry={retry} />;
  const ticket = data?.find((t) => t.id === ticketId);
  if (!ticket)
    return (
      <EmptyState
        title="Ticket not found"
        description={`No ticket with ID ${ticketId}.`}
        action={<Button asChild size="sm" variant="outline" className="bg-background"><Link to="/support">Back to inbox</Link></Button>}
      />
    );

  const closed = ticket.status === "Resolved" || ticket.status === "Closed";
  const canManage = can("support.manage");

  const send = () => {
    recordDemoAction(internal ? "Internal note added" : `Reply sent to ${ticket.requester}`, reply.slice(0, 80));
    setReply("");
  };

  const pendingCopy = (() => {
    if (!pending) return null;
    switch (pending.kind) {
      case "status":
        return { title: `Change status to “${pending.value}”?`, consequences: [`Requester sees status “${pending.value}”`], confirm: "Change status" };
      case "assign":
        return { title: `Assign to ${pending.value}?`, consequences: ["The new assignee is notified", "SLA timer continues"], confirm: "Assign" };
      case "escalate":
        return { title: "Escalate this ticket?", consequences: ["Ticket moves to the escalations queue", "Specialist team is notified"], confirm: "Escalate", reasons: ["Requires Finance", "Suspected fraud", "Workspace provisioning failure", "Legal / compliance", "Other"] };
      case "resolve":
        return { title: "Resolve this ticket?", consequences: ["Resolution summary is shared with the requester", "Ticket closes automatically after 7 days without reply"], confirm: "Resolve ticket" };
    }
  })();

  return (
    <PermissionGuard permission="support.view">
      <div className="space-y-5">
        <PageHeader
          title={ticket.subject}
          breadcrumbs={[{ label: "Support", href: "/support" }, { label: ticket.id }]}
          meta={
            <>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
            </>
          }
          actions={
            <>
              <PermissionButton permission="support.manage" variant="outline" size="sm" className="bg-background" disabled={closed || ticket.status === "Escalated"} onClick={() => setPending({ kind: "escalate" })}>
                <SirenIcon className="size-4" /> Escalate
              </PermissionButton>
              <PermissionButton permission="support.manage" size="sm" disabled={closed} onClick={() => setPending({ kind: "resolve" })}>
                Resolve
              </PermissionButton>
            </>
          }
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <SectionCard title="Conversation" description="Internal notes are only visible to admins.">
              <ol className="space-y-3">
                {ticket.messages.map((m) => (
                  <li
                    key={m.id}
                    className={cn(
                      "rounded-lg border p-3",
                      m.kind === "internal" && "border-dashed border-amber-400/70 bg-amber-50 dark:bg-amber-950/20",
                      m.kind === "agent" && "bg-primary/5",
                      m.kind === "customer" && "bg-background",
                    )}
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-medium">{m.author}</span>
                      <span className="text-muted-foreground">
                        {m.kind === "customer" ? "Requester" : m.kind === "agent" ? "Agent reply" : "Internal note"}
                      </span>
                      {m.kind === "internal" && <LockIcon className="size-3 text-amber-600" />}
                      <span className="ml-auto text-muted-foreground">{formatDateTime(m.at)}</span>
                    </div>
                    <p className="whitespace-pre-line text-sm">{m.body}</p>
                  </li>
                ))}
              </ol>

              {canManage && !closed ? (
                <div className="mt-4 space-y-2 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reply">{internal ? "Internal note" : "Reply to requester"}</Label>
                    <div className="flex items-center gap-2 text-xs">
                      <Switch id="internal" checked={internal} onCheckedChange={setInternal} />
                      <Label htmlFor="internal" className="text-xs font-normal">Internal note</Label>
                    </div>
                  </div>
                  <Textarea
                    id="reply"
                    rows={4}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={internal ? "Visible to admins only…" : "Write a reply. Never ask for passwords or full card numbers."}
                    className={cn(internal && "border-dashed border-amber-400/70")}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" disabled={reply.trim().length < 2} onClick={send}>
                      <SendIcon className="size-4" /> {internal ? "Add note" : "Send reply"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 border-t pt-4 text-xs text-muted-foreground">
                  {closed ? "This ticket is closed. Reopen by changing its status." : "Your role can view tickets but cannot reply."}
                </p>
              )}
            </SectionCard>

            {closed && (
              <SectionCard title="Resolution summary">
                <p className="text-sm text-muted-foreground">
                  {ticket.messages.filter((m) => m.kind === "agent").slice(-1)[0]?.body ?? "No summary recorded."}
                </p>
              </SectionCard>
            )}

            <SectionCard title="Ticket history">
              <AuditTimeline
                events={[
                  { id: "h1", at: ticket.createdAt, actor: ticket.requester, actorType: "User", title: "Ticket created", detail: ticket.category },
                  ...(ticket.assignee ? [{ id: "h2", at: ticket.createdAt, actor: "System", actorType: "System" as const, title: `Assigned to ${ticket.assignee}` }] : []),
                  { id: "h3", at: ticket.updatedAt, actor: ticket.assignee ?? "System", actorType: "Admin", title: "Status updated", to: ticket.status },
                ]}
              />
            </SectionCard>
          </div>

          <div className="space-y-5">
            <SectionCard title="Details">
              <DetailGrid
                columns={2}
                items={[
                  { label: "Category", value: ticket.category },
                  { label: "Area", value: ticket.area },
                  { label: "Created", value: formatDateTime(ticket.createdAt) },
                  { label: "Updated", value: formatDateTime(ticket.updatedAt) },
                  {
                    label: "Requester",
                    wide: true,
                    value: (
                      <Link to={ticket.requesterId.startsWith("CMP") ? `/companies/${ticket.requesterId}` : `/users/${ticket.requesterId}`} className="inline-flex items-center gap-1 hover:underline">
                        {ticket.requester} <ArrowUpRightIcon className="size-3" />
                      </Link>
                    ),
                  },
                ]}
              />
            </SectionCard>

            <SectionCard title="Manage">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={ticket.status} onValueChange={(v) => setPending({ kind: "status", value: v as TicketStatus })} disabled={!canManage}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Assignee</Label>
                  <Select value={ticket.assignee ?? "unassigned"} onValueChange={(v) => v !== "unassigned" && setPending({ kind: "assign", value: v })} disabled={!canManage}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned" disabled>Unassigned</SelectItem>
                      {AGENTS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {!canManage && <p className="text-xs text-muted-foreground">Requires “support.manage”.</p>}
              </div>
            </SectionCard>

            <SectionCard title="Related records">
              {ticket.related.length === 0 ? (
                <p className="text-sm text-muted-foreground">No linked records.</p>
              ) : (
                <ul className="space-y-1.5">
                  {ticket.related.map((r) => (
                    <li key={r.label}>
                      <Link to={r.href} className="inline-flex items-center gap-1 font-mono text-sm hover:underline">
                        {r.label} <ArrowUpRightIcon className="size-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        </div>

        {pending?.kind === "resolve" ? (
          <ConfirmActionDialog
            open
            onOpenChange={(o) => !o && setPending(null)}
            title="Resolve this ticket?"
            description="Write the resolution summary in the note field. It will be shared with the requester."
            target={`${ticket.id} · ${ticket.requester}`}
            consequences={pendingCopy?.consequences}
            confirmLabel="Resolve ticket"
            onConfirm={({ note }) => {
              recordDemoAction(`${ticket.id} resolved`, note);
              setPending(null);
            }}
          />
        ) : (
          pendingCopy && (
            <ConfirmActionDialog
              open={!!pending}
              onOpenChange={(o) => !o && setPending(null)}
              title={pendingCopy.title}
              target={`${ticket.id} · ${ticket.subject}`}
              consequences={pendingCopy.consequences}
              confirmLabel={pendingCopy.confirm}
              reasonOptions={"reasons" in pendingCopy ? pendingCopy.reasons : undefined}
              onConfirm={({ reason, note }) => {
                recordDemoAction(`${pendingCopy.confirm} · ${ticket.id}`, reason || note);
                setPending(null);
              }}
            />
          )
        )}
      </div>
    </PermissionGuard>
  );
}
