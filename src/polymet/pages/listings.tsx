import { useState } from "react";
import { Link } from "react-router-dom";
import { FlagIcon, GlobeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/polymet/components/page-header";
import { DataTable, FilterSelect, matchesFilter, type DataColumn } from "@/polymet/components/data-table";
import { StatusBadge } from "@/polymet/components/status-badge";
import { PermissionGuard } from "@/polymet/components/permission-controls";
import type { Listing } from "@/polymet/data/jobs-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatDate, formatRelative } from "@/polymet/lib/format";

export type ListingView =
  | "all" | "pending" | "published" | "paused" | "closed" | "rejected" | "reported" | "expired" | "external";

const VIEWS: { value: ListingView; label: string; test: (l: Listing) => boolean }[] = [
  { value: "all", label: "All", test: () => true },
  { value: "pending", label: "Pending review", test: (l) => l.status === "Pending review" || l.status === "Changes requested" },
  { value: "published", label: "Published", test: (l) => l.status === "Published" },
  { value: "paused", label: "Paused", test: (l) => l.status === "Paused" },
  { value: "closed", label: "Closed", test: (l) => l.status === "Closed" },
  { value: "rejected", label: "Rejected", test: (l) => l.status === "Rejected" },
  { value: "reported", label: "Reported", test: (l) => l.reports > 0 },
  { value: "expired", label: "Expired", test: (l) => l.status === "Expired" },
  { value: "external", label: "External imports", test: (l) => l.source !== "Internal" },
];

const TITLES: Partial<Record<ListingView, { title: string; description: string }>> = {
  pending: { title: "Listing moderation", description: "Listings awaiting review, change requests and reported listings. Internal moderation notes are never shown to employers or applicants." },
  external: { title: "External opportunities", description: "Imported listings retain their source attribution and original application destination." },
};

export default function ListingsPage({ initialView = "all" }: { initialView?: ListingView }) {
  const { data, loading, error, retry } = useAdminQuery(adminService.listings);
  const [view, setView] = useState<ListingView>(initialView);
  const [type, setType] = useState("all");
  const [source, setSource] = useState("all");
  const [paid, setPaid] = useState("all");

  const all = data ?? [];
  const viewTest = VIEWS.find((v) => v.value === view)!.test;
  const rows = all.filter((l) => viewTest(l) && matchesFilter(l.type, type) && matchesFilter(l.source, source) && matchesFilter(l.paid, paid));
  const header = TITLES[initialView] ?? { title: "Jobs & internships", description: "Every internal and imported listing across internflareJobs." };

  const columns: DataColumn<Listing>[] = [
    {
      key: "title", header: "Listing", sortValue: (l) => l.title, cell: (l) => (
        <div className="min-w-[220px] leading-tight">
          <Link to={`/listings/${l.id}`} className="font-medium hover:underline">{l.title}</Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {l.company} {l.companyVerified ? "· verified" : <span className="text-amber-700 dark:text-amber-400">· unverified</span>}
          </p>
        </div>
      ),
    },
    { key: "type", header: "Type", cell: (l) => l.type, sortValue: (l) => l.type },
    { key: "source", header: "Source", cell: (l) => (l.source === "Internal" ? "Internal" : <span className="inline-flex items-center gap-1"><GlobeIcon className="size-3 text-muted-foreground" />{l.source}</span>), sortValue: (l) => l.source },
    { key: "loc", header: "Location", hideOnMobile: true, cell: (l) => <span className="text-muted-foreground">{l.location}</span> },
    { key: "paid", header: "Pay", hideOnMobile: true, cell: (l) => l.paid },
    { key: "pub", header: "Published", hideOnMobile: true, sortValue: (l) => l.publishedAt ?? "", cell: (l) => <span className="whitespace-nowrap text-xs">{formatDate(l.publishedAt)}</span> },
    { key: "exp", header: "Expires", hideOnMobile: true, sortValue: (l) => l.expiresAt, cell: (l) => <span className="whitespace-nowrap text-xs">{formatDate(l.expiresAt)}</span> },
    { key: "apps", header: "Apps", align: "right", sortValue: (l) => l.applications, cell: (l) => l.applications },
    { key: "status", header: "Moderation", sortValue: (l) => l.status, cell: (l) => (
      <span className="flex items-center gap-1.5">
        <StatusBadge status={l.status} />
        {l.reports > 0 && <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600"><FlagIcon className="size-3" />{l.reports}</span>}
      </span>
    ) },
    { key: "upd", header: "Updated", hideOnMobile: true, sortValue: (l) => l.updatedAt, cell: (l) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatRelative(l.updatedAt)}</span> },
  ];

  return (
    <PermissionGuard permission="listings.view">
      <div className="space-y-5">
        <PageHeader title={header.title} description={header.description} breadcrumbs={[{ label: "internflareJobs" }, { label: header.title }]} />
        <div className="overflow-x-auto">
          <Tabs value={view} onValueChange={(v) => setView(v as ListingView)}>
            <TabsList className="w-max">
              {VIEWS.map((v) => (
                <TabsTrigger key={v.value} value={v.value} className="gap-1.5 text-xs">
                  {v.label}
                  <span className="rounded bg-background/80 px-1 text-[10px] tabular-nums text-muted-foreground">{all.filter(v.test).length}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <DataTable
          data={rows}
          loading={loading}
          error={error}
          onRetry={retry}
          columns={columns}
          getRowId={(l) => l.id}
          getSearchText={(l) => `${l.title} ${l.company} ${l.id} ${l.location}`}
          searchPlaceholder="Search title, company or ID"
          toolbar={
            <>
              <FilterSelect label="Type" value={type} onChange={setType} options={["Internship", "Full-time", "Contract", "Part-time"]} />
              <FilterSelect label="Source" value={source} onChange={setSource} options={["Internal", "Adzuna", "Jooble", "Partner feed"]} />
              <FilterSelect label="Pay" value={paid} onChange={setPaid} options={["Paid", "Unpaid", "Not stated"]} />
            </>
          }
          rowActions={(l) => (
            <Button asChild size="sm" variant="outline" className="h-7 bg-background text-xs">
              <Link to={`/listings/${l.id}`}>Review</Link>
            </Button>
          )}
        />
      </div>
    </PermissionGuard>
  );
}
