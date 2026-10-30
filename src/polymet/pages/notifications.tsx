import { useState } from "react";
import { EyeIcon, MegaphoneIcon, PencilIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter, type DataColumn } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { MetricCard } from "@/polymet/components/metric-card";
import { PermissionGuard, PermissionButton } from "@/polymet/components/permission-controls";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { SectionCard } from "@/polymet/components/section-card";
import type { NotificationEvent, NotificationTemplate } from "@/polymet/data/operations-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDateTime, formatNumber } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

const SAMPLE_VALUES: Record<string, string> = {
  first_name: "Chiamaka",
  company: "Kora Fintech Ltd",
  representative: "Ngozi",
  decision: "Approved",
  next_steps: "You can now publish listings.",
  listing: "Product Design Intern",
  stage: "Shortlisted",
  date: "18 June, 10:00",
  verify_link: "https://internflare.com/verify/•••",
  offer_link: "https://internflare.com/offers/•••",
  assigner: "Emeka Obi",
  task: "Draft onboarding checklist",
  due: "Fri 14 June",
  amount: "₦15,000",
  reference: "TXN-7f3a90",
  mentor: "Dr. Funmi Adeyemi",
};

function renderPreview(text: string) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k: string) => SAMPLE_VALUES[k] ?? `[${k}]`);
}

export default function NotificationsPage({ initialTab = "templates" }: { initialTab?: "templates" | "events" | "failed" }) {
  const { data, loading, error, retry } = useAdminQuery(adminService.notifications);
  const templates = data?.templates ?? [];
  const events = data?.events ?? [];
  const failed = events.filter((e) => e.status === "Bounced" || e.status === "Failed");

  const [channel, setChannel] = useState("all");
  const [tplStatus, setTplStatus] = useState("all");
  const [evStatus, setEvStatus] = useState("all");
  const [preview, setPreview] = useState<NotificationTemplate | null>(null);
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [saveConfirm, setSaveConfirm] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [retryTarget, setRetryTarget] = useState<NotificationEvent | null>(null);

  const openEdit = (t: NotificationTemplate) => {
    setEditing(t);
    setDraftSubject(t.subject);
    setDraftBody(t.body);
  };

  const tplColumns: DataColumn<NotificationTemplate>[] = [
    { key: "name", header: "Template", sortValue: (t) => t.name, cell: (t) => <div className="leading-tight"><p className="font-medium">{t.name}</p><p className="font-mono text-[11px] text-muted-foreground">{t.id}</p></div> },
    { key: "event", header: "Event", sortValue: (t) => t.event, cell: (t) => t.event },
    { key: "channel", header: "Channel", cell: (t) => <StatusBadge status={t.channel} tone={t.channel === "SMS" || t.channel === "WhatsApp" ? "accent" : "neutral"} showDot={false} /> },
    { key: "status", header: "Status", sortValue: (t) => t.status, cell: (t) => <StatusBadge status={t.status} tone={t.status === "Not configured" ? "pending" : undefined} /> },
    { key: "sent", header: "Sent (30d)", align: "right", sortValue: (t) => t.sent30d, cell: (t) => formatNumber(t.sent30d) },
    { key: "fail", header: "Failure rate", align: "right", sortValue: (t) => t.failureRate ?? -1, cell: (t) => (t.failureRate == null ? <span className="text-muted-foreground">—</span> : <span className={t.failureRate > 5 ? "font-medium text-destructive" : ""}>{t.failureRate}%</span>) },
    { key: "upd", header: "Updated", hideOnMobile: true, cell: (t) => <span className="text-xs text-muted-foreground">{t.updatedAt}</span> },
  ];

  const evColumns: DataColumn<NotificationEvent>[] = [
    { key: "id", header: "Event", cell: (e) => <span className="font-mono text-xs">{e.id}</span> },
    { key: "tpl", header: "Template", sortValue: (e) => e.template, cell: (e) => e.template },
    { key: "rcp", header: "Recipient", cell: (e) => <span className="text-xs">{e.recipient}</span> },
    { key: "ch", header: "Channel", hideOnMobile: true, cell: (e) => e.channel },
    { key: "at", header: "Sent", sortValue: (e) => e.at, cell: (e) => <span className="whitespace-nowrap text-xs">{formatDateTime(e.at)}</span> },
    { key: "st", header: "Status", sortValue: (e) => e.status, cell: (e) => <StatusBadge status={e.status} tone={e.status === "Bounced" || e.status === "Failed" ? "danger" : e.status === "Queued" ? "pending" : "success"} /> },
  ];

  const failColumns: DataColumn<NotificationEvent>[] = [
    ...evColumns.slice(0, 3),
    { key: "err", header: "Provider error", cell: (e) => <span className="font-mono text-xs text-destructive">{e.error ?? "—"}</span> },
    evColumns[4],
    evColumns[5],
  ];

  return (
    <PermissionGuard permission="notifications.manage">
      <div className="space-y-5">
        <PageHeader
          title="Notifications"
          description="Templates and delivery for platform emails and in-app messages. SMS and WhatsApp are optional channels and are not required for launch."
          breadcrumbs={[{ label: "Trust & operations" }, { label: "Notifications" }]}
          actions={
            <PermissionButton permission="notifications.manage" size="sm" onClick={() => setBroadcastOpen(true)}>
              <MegaphoneIcon className="size-4" /> Broad announcement
            </PermissionButton>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active templates" value={templates.filter((t) => t.status === "Active").length} kind="current" />
          <MetricCard label="Sent · last 30 days" value={formatNumber(templates.reduce((s, t) => s + t.sent30d, 0))} kind="period" />
          <MetricCard label="Failed deliveries in queue" value={failed.length} kind="current" footnote="Bounced or provider failure" />
          <MetricCard label="SMS / WhatsApp" value="Not configured" kind="unavailable" footnote="Optional channels" />
        </div>

        <Tabs defaultValue={initialTab} key={initialTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="events">Event history</TabsTrigger>
            <TabsTrigger value="failed">Failed deliveries {failed.length > 0 && <span className="ml-1.5 rounded bg-destructive/10 px-1.5 text-[10px] text-destructive">{failed.length}</span>}</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-3">
            <DataTable
              data={templates.filter((t) => matchesFilter(t.channel, channel) && matchesFilter(t.status, tplStatus))}
              loading={loading}
              error={error}
              onRetry={retry}
              columns={tplColumns}
              getRowId={(t) => t.id}
              getSearchText={(t) => `${t.name} ${t.event} ${t.id}`}
              searchPlaceholder="Search templates"
              toolbar={
                <>
                  <FilterSelect label="Channel" value={channel} onChange={setChannel} options={["Email", "In-app", "SMS", "WhatsApp"]} />
                  <FilterSelect label="Status" value={tplStatus} onChange={setTplStatus} options={["Active", "Draft", "Disabled", "Not configured"]} />
                </>
              }
              rowActions={(t) => (
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setPreview(t)} disabled={t.status === "Not configured"}>
                    <EyeIcon className="size-3.5" /> Preview
                  </Button>
                  <PermissionButton permission="notifications.manage" size="sm" variant="outline" className="h-7 bg-background text-xs" onClick={() => openEdit(t)} disabled={t.status === "Not configured"}>
                    <PencilIcon className="size-3.5" /> Edit
                  </PermissionButton>
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="events">
            <DataTable
              data={events.filter((e) => matchesFilter(e.status, evStatus))}
              loading={loading}
              error={error}
              onRetry={retry}
              columns={evColumns}
              getRowId={(e) => e.id}
              getSearchText={(e) => `${e.id} ${e.template} ${e.recipient}`}
              searchPlaceholder="Search recipient, template, event ID"
              initialSort={{ key: "at", dir: "desc" }}
              toolbar={<FilterSelect label="Status" value={evStatus} onChange={setEvStatus} options={["Delivered", "Opened", "Queued", "Bounced", "Failed"]} />}
            />
          </TabsContent>

          <TabsContent value="failed" className="space-y-3">
            <Alert>
              <AlertTitle>Retries are idempotent</AlertTitle>
              <AlertDescription>Hard bounces (5.1.1 mailbox does not exist) should not be retried — correct the recipient address on the account first.</AlertDescription>
            </Alert>
            <DataTable
              data={failed}
              loading={loading}
              error={error}
              onRetry={retry}
              columns={failColumns}
              getRowId={(e) => e.id}
              getSearchText={(e) => `${e.id} ${e.template} ${e.recipient} ${e.error}`}
              searchPlaceholder="Search failed deliveries"
              emptyTitle="No failed deliveries"
              emptyDescription="All recent notifications were delivered."
              rowActions={(e) => (
                <PermissionButton permission="notifications.manage" size="sm" variant="outline" className="h-7 bg-background text-xs" onClick={() => setRetryTarget(e)} disabled={e.error?.startsWith("550")}>
                  <RotateCcwIcon className="size-3.5" /> Retry
                </PermissionButton>
              )}
            />
          </TabsContent>
        </Tabs>

        <SectionCard title="Optional channels" description="Not required for launch. Configure a provider in Settings → Integrations before enabling.">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: "SMS", state: "Awaiting configuration", note: "No SMS provider credentials stored." },
              { name: "WhatsApp", state: "Planned", note: "WhatsApp Business API not integrated." },
            ].map((c) => (
              <div key={c.name} className="flex items-start justify-between gap-3 rounded-lg border border-dashed p-3">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.note}</p>
                </div>
                <StatusBadge status={c.state} tone={c.state === "Planned" ? "neutral" : "pending"} />
              </div>
            ))}
          </div>
        </SectionCard>

        <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Preview · {preview?.name}</DialogTitle>
              <DialogDescription>Rendered with sample values. Variables are shown in brackets when no sample exists.</DialogDescription>
            </DialogHeader>
            {preview && (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{preview.channel} · Subject</p>
                <p className="font-medium">{renderPreview(preview.subject)}</p>
                <div className="border-t pt-3">
                  <p className="whitespace-pre-line text-sm">{renderPreview(preview.body)}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit template · {editing?.name}</DialogTitle>
              <DialogDescription>Changes apply to all future sends of the “{editing?.event}” event. Keep existing {"{{variables}}"} intact.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="tpl-subject">Subject</Label>
                  <Input id="tpl-subject" value={draftSubject} onChange={(e) => setDraftSubject(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tpl-body">Body</Label>
                  <Textarea id="tpl-body" rows={8} value={draftBody} onChange={(e) => setDraftBody(e.target.value)} className="font-mono text-xs" />
                </div>
              </div>
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Live preview</p>
                <p className="text-sm font-medium">{renderPreview(draftSubject)}</p>
                <p className="whitespace-pre-line border-t pt-2 text-sm">{renderPreview(draftBody)}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="bg-background" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={() => setSaveConfirm(true)} disabled={!draftSubject.trim() || !draftBody.trim() || (draftSubject === editing?.subject && draftBody === editing?.body)}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmActionDialog
          open={saveConfirm}
          onOpenChange={setSaveConfirm}
          title="Publish template changes?"
          description="The updated content will be used for all future notifications for this event."
          target={editing ? `${editing.name} (${editing.id})` : undefined}
          consequences={["Previous version is kept in the audit log", "In-flight queued messages keep the old content"]}
          confirmLabel="Publish changes"
          onConfirm={({ note }) => {
            recordDemoAction(`Template ${editing?.id} updated`, note);
            setEditing(null);
          }}
        />

        <ConfirmActionDialog
          open={!!retryTarget}
          onOpenChange={(o) => !o && setRetryTarget(null)}
          title="Retry delivery?"
          target={retryTarget ? `${retryTarget.id} → ${retryTarget.recipient}` : undefined}
          consequences={["One new delivery attempt will be queued"]}
          confirmLabel="Queue retry"
          reasonOptions={["Provider outage resolved", "Recipient address corrected", "Transient timeout"]}
          onConfirm={({ reason }) => recordDemoAction(`Retry queued for ${retryTarget?.id}`, reason)}
        />

        <ConfirmActionDialog
          open={broadcastOpen}
          onOpenChange={setBroadcastOpen}
          title="Send a broad announcement?"
          description="Broad sends reach many accounts and cannot be recalled once delivered."
          target="All active talent and employer accounts (≈ 20,850 recipients)"
          consequences={["Recipients who opted out of announcements are excluded", "Sending is rate-limited over ~45 minutes", "This action is recorded in the audit log"]}
          confirmLabel="Schedule announcement"
          destructive
          requireAcknowledgement
          onConfirm={({ note }) => recordDemoAction("Broad announcement scheduled", note)}
        />
      </div>
    </PermissionGuard>
  );
}
