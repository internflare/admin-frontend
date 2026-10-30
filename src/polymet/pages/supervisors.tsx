import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheckIcon, UserCheckIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/polymet/components/page-header";
import { MetricCard } from "@/polymet/components/metric-card";
import { DataTable } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { DetailGrid } from "@/polymet/components/section-card";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { PLACEMENTS } from "@/polymet/data/jobs-data";
import type { SupervisorRequest } from "@/polymet/data/people-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDate, formatRelative } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";
import { cn } from "@/lib/utils";

export default function SupervisorsPage() {
  const { data, loading, error, retry } = useAdminQuery(adminService.supervisors);
  const [active, setActive] = useState<SupervisorRequest | null>(null);
  const [choice, setChoice] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [decline, setDecline] = useState<SupervisorRequest | null>(null);

  const supervisors = data?.supervisors ?? [];
  const requests = data?.requests ?? [];
  const assignments = PLACEMENTS.filter((p) => p.supervisor);
  const engagement = active ? PLACEMENTS.find((p) => p.id === active.engagement) : undefined;

  return (
    <PermissionGuard permission="supervisors.manage">
      <div className="space-y-5">
        <PageHeader
          title="Supervisors"
          description="Assign supervisors to employer engagements. Supervisors can only access the workspaces and records of their assignments."
          breadcrumbs={[{ label: "People & organisations" }, { label: "Supervisors" }]}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Supervisors" value={supervisors.length} icon={ShieldCheckIcon} />
          <MetricCard label="Pending requests" value={requests.filter((r) => r.status === "Pending").length} icon={UserCheckIcon} />
          <MetricCard label="Active assignments" value={supervisors.reduce((s, x) => s + x.activeAssignments, 0)} />
          <MetricCard label="Open escalations" value={supervisors.reduce((s, x) => s + x.escalations, 0)} />
        </div>

        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">Assignment requests</TabsTrigger>
            <TabsTrigger value="directory">Directory</TabsTrigger>
            <TabsTrigger value="assignments">Active assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <DataTable
              data={requests}
              loading={loading}
              error={error}
              onRetry={retry}
              getRowId={(r) => r.id}
              columns={[
                { key: "id", header: "Request", cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
                { key: "company", header: "Employer", cell: (r) => r.company, sortValue: (r) => r.company },
                { key: "intern", header: "Intern · engagement", cell: (r) => <span>{r.intern} <span className="font-mono text-xs text-muted-foreground">{r.engagement}</span></span> },
                { key: "spec", header: "Specialism", hideOnMobile: true, cell: (r) => r.specialism },
                { key: "req", header: "Requested", cell: (r) => <span className="text-xs text-muted-foreground">{formatRelative(r.requestedAt)}</span>, sortValue: (r) => r.requestedAt },
                { key: "status", header: "Status", cell: (r) => <span className="flex items-center gap-2"><StatusBadge status={r.status} />{r.assignedTo && <span className="text-xs text-muted-foreground">{r.assignedTo}</span>}</span> },
              ]}
              rowActions={(r) =>
                r.status === "Pending" ? (
                  <Button size="sm" className="h-7 text-xs" onClick={() => { setActive(r); setChoice(""); }}>Review</Button>
                ) : (
                  <PermissionButton permission="supervisors.manage" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => recordDemoAction(`Reassignment started for ${r.id}`)}>Reassign</PermissionButton>
                )
              }
            />
          </TabsContent>

          <TabsContent value="directory">
            <DataTable
              data={supervisors}
              loading={loading}
              getRowId={(s) => s.id}
              getSearchText={(s) => `${s.name} ${s.specialism} ${s.companies.join(" ")}`}
              columns={[
                { key: "name", header: "Supervisor", sortValue: (s) => s.name, cell: (s) => (
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-7"><AvatarImage src={s.avatar} alt="" /><AvatarFallback className="text-[10px]">{s.name.split(" ").map((p) => p[0]).join("")}</AvatarFallback></Avatar>
                    <div className="leading-tight"><p className="font-medium">{s.name}</p><p className="font-mono text-[11px] text-muted-foreground">{s.id}</p></div>
                  </div>
                ) },
                { key: "spec", header: "Specialism", cell: (s) => s.specialism },
                { key: "avail", header: "Availability", cell: (s) => <StatusBadge status={s.availability} /> },
                { key: "load", header: "Load", sortValue: (s) => s.activeAssignments / s.capacity, cell: (s) => (
                  <div className="flex w-28 items-center gap-2"><Progress value={(s.activeAssignments / s.capacity) * 100} className="h-1.5" /><span className="text-xs tabular-nums">{s.activeAssignments}/{s.capacity}</span></div>
                ) },
                { key: "companies", header: "Assigned companies", hideOnMobile: true, cell: (s) => <span className="text-xs text-muted-foreground">{s.companies.join(", ") || "—"}</span> },
                { key: "reviews", header: "Reviews (mo)", align: "right", hideOnMobile: true, cell: (s) => s.reviewsThisMonth },
                { key: "esc", header: "Escalations", align: "right", cell: (s) => s.escalations },
              ]}
            />
          </TabsContent>

          <TabsContent value="assignments">
            <DataTable
              data={assignments}
              getRowId={(p) => p.id}
              columns={[
                { key: "sup", header: "Supervisor", cell: (p) => p.supervisor },
                { key: "intern", header: "Intern / employee", cell: (p) => <Link className="hover:underline" to={`/users/${p.candidateId}`}>{p.candidate}</Link> },
                { key: "company", header: "Company", cell: (p) => p.employer },
                { key: "ws", header: "Workspace scope", cell: (p) => <Link className="font-mono text-xs hover:underline" to={`/workspaces/${p.workspaceId}`}>{p.workspaceId}</Link> },
                { key: "status", header: "Engagement", cell: (p) => <StatusBadge status={p.status} /> },
                { key: "end", header: "Completion assessment", hideOnMobile: true, cell: (p) => (p.status === "Completed" ? <StatusBadge status="Submitted" /> : <span className="text-xs text-muted-foreground">Due {p.expectedCompletion === "—" ? "—" : formatDate(p.expectedCompletion)}</span>) },
              ]}
              rowActions={(p) => (
                <PermissionButton permission="supervisors.manage" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => recordDemoAction(`Close assignment for ${p.id} requested`)}>Close</PermissionButton>
              )}
            />
          </TabsContent>
        </Tabs>

        <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
          <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg">
            <SheetHeader className="border-b p-5">
              <SheetTitle>Assign supervisor · {active?.id}</SheetTitle>
              <SheetDescription>{active?.company} requested a {active?.specialism.toLowerCase()} supervisor.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-5 p-5">
              <DetailGrid items={[
                { label: "Intern", value: active?.intern },
                { label: "Engagement", value: <span className="font-mono text-xs">{active?.engagement}</span> },
                { label: "Engagement status", value: engagement ? <StatusBadge status={engagement.status} /> : "—" },
                { label: "Workspace", value: engagement?.workspaceId ?? "—" },
              ]} />
              <div className="space-y-2">
                <Label>Eligible supervisors</Label>
                <RadioGroup value={choice} onValueChange={setChoice} className="space-y-2">
                  {supervisors.map((s) => {
                    const eligible = s.availability === "Available" && s.activeAssignments < s.capacity;
                    const match = s.specialism === active?.specialism;
                    return (
                      <label key={s.id} className={cn("flex items-center gap-3 rounded-md border p-3", eligible ? "cursor-pointer hover:border-primary/40" : "opacity-60", choice === s.id && "border-primary ring-1 ring-primary")}>
                        <RadioGroupItem value={s.id} disabled={!eligible} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.specialism} · {s.activeAssignments}/{s.capacity} assignments</p>
                        </div>
                        {match && <StatusBadge status="Specialism match" tone="accent" showDot={false} />}
                        {!eligible && <StatusBadge status={s.availability} />}
                      </label>
                    );
                  })}
                </RadioGroup>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assign-note">Assignment details</Label>
                <Textarea id="assign-note" rows={3} value={assignNote} onChange={(e) => setAssignNote(e.target.value)} placeholder="Review cadence, scope, start date…" />
              </div>
            </div>
            <SheetFooter className="gap-2 border-t p-4 sm:justify-between">
              <Button variant="outline" className="bg-background text-red-600" onClick={() => { setDecline(active); setActive(null); }}>Decline request</Button>
              <PermissionButton
                permission="supervisors.manage"
                disabled={!choice}
                onClick={() => {
                  const s = supervisors.find((x) => x.id === choice);
                  recordDemoAction(`Assigned ${s?.name} to ${active?.engagement}`, "Supervisor access will be scoped to the assigned workspace only.");
                  setActive(null);
                  setAssignNote("");
                }}
              >
                Assign supervisor
              </PermissionButton>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <ConfirmActionDialog
          open={!!decline}
          onOpenChange={(o) => !o && setDecline(null)}
          title="Decline supervisor request"
          target={`${decline?.company} · ${decline?.id}`}
          destructive
          reasonOptions={["No eligible supervisor available", "Engagement not yet accepted", "Outside supported specialisms", "Duplicate request"]}
          consequences={["Employer is notified with the reason", "Request history is retained"]}
          confirmLabel="Decline"
          onConfirm={({ reason }) => recordDemoAction(`Declined ${decline?.id}`, reason)}
        />
      </div>
    </PermissionGuard>
  );
}
