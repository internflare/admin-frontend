import { useCallback, useState, type ReactNode } from "react";
import { DownloadIcon, RotateCwIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/polymet/components/page-header";
import { MetricCard } from "@/polymet/components/metric-card";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { EmptyState, ErrorState, LoadingState } from "@/polymet/components/state-views";
import {
  AccountTypesDonut, CommercialPanels, CompaniesPanels, FeedbackPanels, ListingsPanels, RecruitmentPanels, SignupsTrend,
} from "@/polymet/components/analytics-panels";
import { ANALYTICS_RANGES, downloadAnalyticsCsv, fetchAnalytics, seriesTotal, type AnalyticsRange } from "@/polymet/lib/analytics-service";
import { formatDateTime, formatNumber } from "@/polymet/lib/format";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

/** Recorded platform analytics. `commercial` shows only the finance section (Revenue analytics). */
export default function AnalyticsPage({ initialTab = "all" }: { initialTab?: "all" | "commercial" }) {
  const commercialOnly = initialTab === "commercial";
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [exporting, setExporting] = useState(false);
  const fetcher = useCallback(() => fetchAnalytics("/analytics", range), [range]);
  const { data, loading, error, retry } = useAdminQuery(fetcher);
  const periodLabel = ANALYTICS_RANGES.find((r) => r.value === range)?.label.toLowerCase() ?? "";

  const exportCsv = async () => {
    setExporting(true);
    try {
      await downloadAnalyticsCsv(range);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const sections = data && (commercialOnly
    ? data.commercial && <Group title="Payments & subscriptions"><CommercialPanels commercial={data.commercial} bucket={data.bucket} /></Group>
    : (
      <>
        {data.users && <Group title="Accounts"><SignupsTrend users={data.users} bucket={data.bucket} /><AccountTypesDonut users={data.users} /></Group>}
        {data.companies && <Group title="Companies"><CompaniesPanels companies={data.companies} bucket={data.bucket} /></Group>}
        {data.listings && <Group title="Listings"><ListingsPanels listings={data.listings} bucket={data.bucket} /></Group>}
        {data.recruitment && <Group title="Recruitment"><RecruitmentPanels recruitment={data.recruitment} bucket={data.bucket} /></Group>}
        {data.commercial && <Group title="Payments & subscriptions"><CommercialPanels commercial={data.commercial} bucket={data.bucket} /></Group>}
        {data.feedback && <Group title="Bug reports & ideas"><FeedbackPanels feedback={data.feedback} /></Group>}
      </>
    ));

  const kpis = data && (commercialOnly
    ? data.commercial && [
      { label: "Successful payments", value: seriesTotal(data.commercial.payments, ["success"]) },
      { label: "Failed payments", value: seriesTotal(data.commercial.payments, ["failed"]) },
      { label: "Active subscriptions", value: data.commercial.subscriptions.find((s) => s.key === "active")?.count ?? 0, current: true },
      { label: "All subscriptions", value: data.commercial.subscriptions.reduce((t, s) => t + s.count, 0), current: true },
    ]
    : [
      data.users && { label: "New sign-ups", value: seriesTotal(data.users.signups, data.users.accountTypes.map((a) => a.key)) },
      data.listings && { label: "Listings posted", value: seriesTotal(data.listings.created, ["listings"]) },
      data.recruitment && { label: "Applications submitted", value: seriesTotal(data.recruitment.activity, ["applications"]) },
      data.companies && { label: "Companies registered", value: seriesTotal(data.companies.registrations, ["companies"]) },
    ].filter((kpi): kpi is { label: string; value: number } => Boolean(kpi)));

  return (
    <PermissionGuard permission={commercialOnly ? "finance.view" : "analytics.view"}>
      <div className="space-y-5">
        <PageHeader
          title={commercialOnly ? "Revenue analytics" : "Analytics & reporting"}
          description={commercialOnly
            ? "Payments and subscriptions recorded by the billing service. Amounts are gross, in the currency they were charged."
            : "Charts built only from recorded platform data. Sections are limited to the modules your role can view."}
          meta={data ? <span className="text-xs text-muted-foreground">Updated {formatDateTime(data.generatedAt)}</span> : undefined}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Select value={range} onValueChange={(value) => setRange(value as AnalyticsRange)}>
                <SelectTrigger className="h-8 w-[160px] bg-background text-xs" aria-label="Date range"><SelectValue /></SelectTrigger>
                <SelectContent>{ANALYTICS_RANGES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={retry} disabled={loading}><RotateCwIcon className="mr-1.5 size-3.5" />Refresh</Button>
              <PermissionButton permission="analytics.export" variant="outline" size="sm" onClick={exportCsv} disabled={exporting || loading || !!error}>
                <DownloadIcon className="mr-1.5 size-3.5" />{exporting ? "Exporting…" : "Export CSV"}
              </PermissionButton>
            </div>
          }
        />
        {loading ? <LoadingState label="Loading analytics" className="rounded-lg border" /> : error ? <ErrorState title="Couldn't load analytics" description={error} onRetry={retry} /> : (
          <>
            {kpis && kpis.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {kpis.map((kpi) => (
                  <MetricCard
                    key={kpi.label}
                    label={kpi.label}
                    kind={"current" in kpi && kpi.current ? "current" : "period"}
                    value={formatNumber(kpi.value)}
                    footnote={"current" in kpi && kpi.current ? "All time" : periodLabel}
                  />
                ))}
              </div>
            )}
            {sections || <EmptyState title="No analytics available for your role" description="Your role can't view any of the modules these charts are built from." />}
          </>
        )}
      </div>
    </PermissionGuard>
  );
}