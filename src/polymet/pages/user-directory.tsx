import { useState } from "react";
import { Link } from "react-router-dom";
import { DownloadIcon, MoreHorizontalIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter, type DataColumn } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { MaskedValue, PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import type { PlatformUser } from "@/polymet/data/people-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDate, formatRelative, maskEmail } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

export default function UserDirectoryPage() {
  const { can } = useAdminRole();
  const { data, loading, error, retry } = useAdminQuery(adminService.users);
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [verification, setVerification] = useState("all");
  const [plan, setPlan] = useState("all");
  const [registered, setRegistered] = useState("all");
  const [completeness, setCompleteness] = useState("all");

  const rows = (data ?? []).filter((u) => {
    const completeOk =
      completeness === "all" ||
      (completeness === "Under 50%" && u.profileCompletion < 50) ||
      (completeness === "50–89%" && u.profileCompletion >= 50 && u.profileCompletion < 90) ||
      (completeness === "90%+" && u.profileCompletion >= 90);
    const regOk =
      registered === "all" ||
      (registered === "2025" && u.registeredAt.startsWith("2025")) ||
      (registered === "2024" && u.registeredAt.startsWith("2024")) ||
      (registered === "Last 30 days" && new Date(u.registeredAt) >= new Date("2025-05-12"));
    return (
      matchesFilter(u.accountType, type) && matchesFilter(u.status, status) && matchesFilter(u.identityVerification, verification) &&
      matchesFilter(u.plan, plan) && completeOk && regOk
    );
  });

  const columns: DataColumn<PlatformUser>[] = [
    {
      key: "name", header: "User", sortValue: (u) => u.name, cell: (u) => (
        <Link to={`/users/${u.id}`} className="flex min-w-[200px] items-center gap-2.5 hover:underline">
          <Avatar className="size-7">
            <AvatarImage src={u.avatar} alt="" />
            <AvatarFallback className="text-[10px]">{u.name.split(" ").map((p) => p[0]).join("")}</AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="font-medium">{u.name}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{u.id}</p>
          </div>
        </Link>
      ),
    },
    { key: "email", header: "Email", hideOnMobile: true, cell: (u) => <MaskedValue value={u.email} masked={maskEmail(u.email)} permission="users.pii" label="email" userId={u.id} /> },
    { key: "type", header: "Type", sortValue: (u) => u.accountType, cell: (u) => u.accountType },
    { key: "registered", header: "Registered", hideOnMobile: true, sortValue: (u) => u.registeredAt, cell: (u) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(u.registeredAt)}</span> },
    {
      key: "completion", header: "Profile", sortValue: (u) => u.profileCompletion, hideOnMobile: true, cell: (u) => (
        <div className="flex w-24 items-center gap-2">
          <Progress value={u.profileCompletion} className="h-1.5" aria-label="Profile completion" />
          <span className="text-xs tabular-nums text-muted-foreground">{u.profileCompletion}%</span>
        </div>
      ),
    },
    { key: "idv", header: "Identity", sortValue: (u) => u.identityVerification, cell: (u) => <StatusBadge status={u.identityVerification} /> },
    { key: "qual", header: "Qualification", hideOnMobile: true, cell: (u) => <StatusBadge status={u.qualificationVerification} /> },
    { key: "plan", header: "Plan", sortValue: (u) => u.plan, hideOnMobile: true, cell: (u) => u.plan },
    { key: "status", header: "Account", sortValue: (u) => u.status, cell: (u) => <StatusBadge status={u.status} /> },
    { key: "last", header: "Last active", hideOnMobile: true, sortValue: (u) => u.lastActiveAt ?? "", cell: (u) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatRelative(u.lastActiveAt)}</span> },
  ];

  return (
    <PermissionGuard permission="users.view">
      <div className="space-y-5">
        <PageHeader
          title="Talent & user accounts"
          description="All accounts across talents, employers, employees, supervisors and mentors. Identity and qualification verification are tracked separately."
          breadcrumbs={[{ label: "People & organisations" }, { label: "Users" }]}
          actions={
            <PermissionButton permission="analytics.export" variant="outline" size="sm" className="h-8 bg-background" onClick={() => recordDemoAction("Export user list", "Exports exclude personal data unless the role allows it.")}>
              <DownloadIcon className="mr-1.5 size-3.5" /> Export
            </PermissionButton>
          }
        />
        <DataTable
          data={rows}
          loading={loading}
          error={error}
          onRetry={retry}
          columns={columns}
          getRowId={(u) => u.id}
          getSearchText={(u) => `${u.name} ${u.id} ${can("users.pii") ? u.email : ""} ${u.company ?? ""}`}
          searchPlaceholder="Search name, ID or email"
          toolbar={
            <>
              <FilterSelect label="Type" value={type} onChange={setType} options={["Talent", "Employer", "Employee", "Supervisor", "Mentor"]} />
              <FilterSelect label="Status" value={status} onChange={setStatus} options={["Active", "Pending", "Restricted", "Suspended"]} />
              <FilterSelect label="Identity" value={verification} onChange={setVerification} options={["Verified", "Pending review", "More info requested", "Rejected", "Not submitted"]} />
              <FilterSelect label="Plan" value={plan} onChange={setPlan} options={["Free", "Career", "Pro", "Elite", "Starter", "Growth", "Professional"]} />
              <FilterSelect label="Registered" value={registered} onChange={setRegistered} options={["Last 30 days", "2025", "2024"]} allLabel="Any time" />
              <FilterSelect label="Profile" value={completeness} onChange={setCompleteness} options={["Under 50%", "50–89%", "90%+"]} />
            </>
          }
          rowActions={(u) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7" aria-label={`Actions for ${u.name}`}>
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link to={`/users/${u.id}`}>View profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to={`/users/${u.id}?tab=verification`}>Review verification</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to={`/audit-logs?ref=${u.id}`}>Audit history</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild disabled={!can("users.manage")}><Link to={`/users/${u.id}?tab=overview`}>Manage access…</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </div>
    </PermissionGuard>
  );
}
