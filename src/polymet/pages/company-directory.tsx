import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2Icon } from "lucide-react";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter, type DataColumn } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import { MetricCard } from "@/polymet/components/metric-card";
import type { Company } from "@/polymet/data/people-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDate } from "@/polymet/lib/format";

export default function CompanyDirectoryPage() {
  const { data, loading, error, retry } = useAdminQuery(adminService.companies);
  const [verification, setVerification] = useState("all");
  const [plan, setPlan] = useState("all");
  const [country, setCountry] = useState("all");

  const rows = (data ?? []).filter((c) => matchesFilter(c.verification, verification) && matchesFilter(c.plan, plan) && matchesFilter(c.country, country));

  const columns: DataColumn<Company>[] = [
    {
      key: "name", header: "Company", sortValue: (c) => c.name, cell: (c) => (
        <Link to={`/companies/${c.id}`} className="flex min-w-[200px] items-center gap-2.5 hover:underline">
          <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground"><Building2Icon className="size-3.5" /></span>
          <div className="leading-tight">
            <p className="font-medium">{c.name}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{c.id}</p>
          </div>
        </Link>
      ),
    },
    { key: "rep", header: "Representative", cell: (c) => c.representative, hideOnMobile: true },
    { key: "industry", header: "Industry", cell: (c) => <span className="text-muted-foreground">{c.industry} · {c.country}</span>, sortValue: (c) => c.industry, hideOnMobile: true },
    { key: "verification", header: "Company verification", cell: (c) => <StatusBadge status={c.verification} />, sortValue: (c) => c.verification },
    { key: "plan", header: "Plan", cell: (c) => c.plan, sortValue: (c) => c.plan },
    { key: "listings", header: "Active listings", align: "right", cell: (c) => c.activeListings, sortValue: (c) => c.activeListings },
    { key: "hires", header: "Hires", align: "right", cell: (c) => c.hires, sortValue: (c) => c.hires, hideOnMobile: true },
    { key: "ws", header: "Workspace", hideOnMobile: true, cell: (c) => (c.workspaceId ? <Link className="font-mono text-xs hover:underline" to={`/workspaces/${c.workspaceId}`}>{c.workspaceId}</Link> : <span className="text-xs text-muted-foreground">None</span>) },
    { key: "status", header: "Account", cell: (c) => <StatusBadge status={c.status} /> },
    { key: "reg", header: "Registered", hideOnMobile: true, sortValue: (c) => c.registeredAt, cell: (c) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(c.registeredAt)}</span> },
  ];

  const all = data ?? [];
  return (
    <PermissionGuard permission="companies.view">
      <div className="space-y-5">
        <PageHeader
          title="Employers & companies"
          description="Company accounts, verification state, plans, listings and SquadCot workspaces. A company is verified only after an approved verification decision."
          breadcrumbs={[{ label: "People & organisations" }, { label: "Companies" }]}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Registered companies" value={all.length} />
          <MetricCard label="Verified" value={all.filter((c) => c.verification === "Verified").length} />
          <MetricCard label="Awaiting review" value={all.filter((c) => c.verification === "Pending review").length} href="/verification" />
          <MetricCard label="With workspaces" value={all.filter((c) => c.workspaceId).length} href="/workspaces" />
        </div>
        <DataTable
          data={rows}
          loading={loading}
          error={error}
          onRetry={retry}
          columns={columns}
          getRowId={(c) => c.id}
          getSearchText={(c) => `${c.name} ${c.id} ${c.representative} ${c.industry} ${c.rcNumber ?? ""}`}
          searchPlaceholder="Search company, ID, RC number"
          toolbar={
            <>
              <FilterSelect label="Verification" value={verification} onChange={setVerification} options={["Verified", "Pending review", "More info requested", "Rejected", "Not submitted"]} />
              <FilterSelect label="Plan" value={plan} onChange={setPlan} options={["Free", "Starter", "Growth", "Professional"]} />
              <FilterSelect label="Country" value={country} onChange={setCountry} options={["Nigeria", "Ghana", "Unknown"]} />
            </>
          }
        />
      </div>
    </PermissionGuard>
  );
}
