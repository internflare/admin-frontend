import { useState } from "react";
import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/polymet/components/page-header";
import { MetricCard } from "@/polymet/components/metric-card";
import { DataTable, FilterSelect, matchesFilter } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { ConfirmActionDialog } from "@/polymet/components/confirm-action-dialog";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import type { Mentor } from "@/polymet/data/people-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatCurrency, formatDateTime } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

export default function MentorsPage() {
  const { data, loading, error, retry } = useAdminQuery(adminService.mentors);
  const [verification, setVerification] = useState("all");
  const [bookingStatus, setBookingStatus] = useState("all");
  const [review, setReview] = useState<Mentor | null>(null);

  const mentors = (data?.mentors ?? []).filter((m) => matchesFilter(m.verification, verification));
  const bookings = (data?.bookings ?? []).filter((b) => matchesFilter(b.status, bookingStatus));

  return (
    <PermissionGuard permission="mentors.manage">
      <div className="space-y-5">
        <PageHeader
          title="Mentors"
          description="Mentor profiles, availability, pricing, bookings and moderation. Mentors are shown as verified only when a verification decision is recorded."
          breadcrumbs={[{ label: "People & organisations" }, { label: "Mentors" }]}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Mentors" value={(data?.mentors ?? []).length} />
          <MetricCard label="Verified" value={(data?.mentors ?? []).filter((m) => m.verification === "Verified").length} />
          <MetricCard label="Booking requests" value={(data?.bookings ?? []).filter((b) => b.status === "Requested").length} />
          <MetricCard label="Open moderation flags" value={(data?.mentors ?? []).reduce((s, m) => s + m.flags, 0)} />
        </div>

        <Tabs defaultValue="directory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="directory">Directory</TabsTrigger>
            <TabsTrigger value="bookings">Bookings & sessions</TabsTrigger>
          </TabsList>
          <TabsContent value="directory">
            <DataTable
              data={mentors}
              loading={loading}
              error={error}
              onRetry={retry}
              getRowId={(m) => m.id}
              getSearchText={(m) => `${m.name} ${m.expertise.join(" ")}`}
              searchPlaceholder="Search mentors or expertise"
              toolbar={<FilterSelect label="Verification" value={verification} onChange={setVerification} options={["Verified", "Pending review", "Not submitted", "Rejected"]} />}
              columns={[
                { key: "name", header: "Mentor", sortValue: (m) => m.name, cell: (m) => (
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-7"><AvatarImage src={m.avatar} alt="" /><AvatarFallback className="text-[10px]">{m.name.split(" ").map((p) => p[0]).join("")}</AvatarFallback></Avatar>
                    <div className="leading-tight"><p className="font-medium">{m.name}</p><p className="font-mono text-[11px] text-muted-foreground">{m.id}</p></div>
                  </div>
                ) },
                { key: "exp", header: "Expertise", cell: (m) => <div className="flex flex-wrap gap-1">{m.expertise.map((e) => <Badge key={e} variant="secondary" className="font-normal">{e}</Badge>)}</div> },
                { key: "rate", header: "Rate / session", align: "right", sortValue: (m) => m.rate ?? -1, cell: (m) => (m.rate ? formatCurrency(m.rate) : <span className="text-muted-foreground">Not set</span>) },
                { key: "avail", header: "Availability", cell: (m) => <StatusBadge status={m.availability} /> },
                { key: "ver", header: "Verification", cell: (m) => <StatusBadge status={m.verification} /> },
                { key: "sessions", header: "Sessions", align: "right", hideOnMobile: true, sortValue: (m) => m.sessionsCompleted, cell: (m) => m.sessionsCompleted },
                { key: "rating", header: "Rating", hideOnMobile: true, sortValue: (m) => m.rating ?? 0, cell: (m) => (m.rating ? <span className="inline-flex items-center gap-1"><StarIcon className="size-3 fill-amber-400 text-amber-400" />{m.rating}</span> : <span className="text-xs text-muted-foreground">No reviews</span>) },
                { key: "flags", header: "Flags", align: "right", cell: (m) => (m.flags ? <span className="font-medium text-red-600">{m.flags}</span> : 0) },
              ]}
              rowActions={(m) => (
                <PermissionButton permission="mentors.manage" size="sm" variant="outline" className="h-7 bg-background text-xs" disabled={m.verification === "Verified" && m.flags === 0} onClick={() => setReview(m)}>
                  Review
                </PermissionButton>
              )}
            />
          </TabsContent>
          <TabsContent value="bookings">
            <DataTable
              data={bookings}
              loading={loading}
              getRowId={(b) => b.id}
              getSearchText={(b) => `${b.mentor} ${b.mentee} ${b.topic}`}
              toolbar={<FilterSelect label="Status" value={bookingStatus} onChange={setBookingStatus} options={["Requested", "Confirmed", "Completed", "Cancelled"]} />}
              columns={[
                { key: "id", header: "Booking", cell: (b) => <span className="font-mono text-xs">{b.id}</span> },
                { key: "topic", header: "Topic", cell: (b) => b.topic },
                { key: "mentor", header: "Mentor", cell: (b) => b.mentor },
                { key: "mentee", header: "Mentee", cell: (b) => b.mentee },
                { key: "when", header: "Scheduled", sortValue: (b) => b.scheduledAt, cell: (b) => <span className="whitespace-nowrap text-xs">{formatDateTime(b.scheduledAt)}</span> },
                { key: "status", header: "Status", cell: (b) => <StatusBadge status={b.status} /> },
                { key: "pay", header: "Payment", cell: (b) => <StatusBadge status={b.paymentStatus} /> },
              ]}
            />
          </TabsContent>
        </Tabs>

        <ConfirmActionDialog
          open={!!review}
          onOpenChange={(o) => !o && setReview(null)}
          title={`Moderate mentor · ${review?.name}`}
          target={`${review?.id} · ${review?.verification}`}
          reasonOptions={["Approve mentor verification", "Request credentials", "Hide profile pending review", "Dismiss feedback flag", "Reject verification"]}
          consequences={["Only a recorded approval displays the ‘Verified mentor’ badge", "Hidden profiles cannot accept new bookings; existing sessions are kept"]}
          confirmLabel="Record decision"
          onConfirm={({ reason }) => recordDemoAction(`${reason} — ${review?.id}`)}
        />
      </div>
    </PermissionGuard>
  );
}
