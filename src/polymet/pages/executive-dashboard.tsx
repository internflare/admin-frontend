import { useState } from "react";
import {
  UsersIcon, BadgeCheckIcon, BriefcaseIcon, FileStackIcon, ListChecksIcon, CalendarClockIcon, HandshakeIcon,
  UserCheckIcon, TrophyIcon, TrendingUpIcon, LayoutGridIcon, AlarmClockIcon, FileBarChartIcon, RepeatIcon,
  WalletIcon, ArrowUpCircleIcon, CreditCardIcon, ReceiptIcon, GlobeIcon, PlugIcon, SparklesIcon, DownloadIcon,
} from "lucide-react";
import { PageHeader } from "@/polymet/components/page-header";
import { MetricCard } from "@/polymet/components/metric-card";
import { SectionCard } from "@/polymet/components/section-card";
import { TrendChart, FunnelBars } from "@/polymet/components/admin-charts";
import { DateRangeSelect } from "@/polymet/components/date-range-select";
import { AttentionPanel } from "@/polymet/components/attention-panel";
import { PermissionButton, PermissionGuard } from "@/polymet/components/permission-controls";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import { PageSkeleton, ErrorState } from "@/polymet/components/state-views";
import {
  GROWTH_SERIES, REVENUE_SERIES, WORKSPACE_ACTIVITY_SERIES, IMPORT_HEALTH_SERIES, RECRUITMENT_FUNNEL, OUTCOME_FUNNEL,
} from "@/polymet/data/dashboard-data";
import { AI_USAGE_SERIES } from "@/polymet/data/integrations-data";
import { adminService } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";
import { formatCompact, formatNumber } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

function SectionTitle({ children }: { children: string }) {
  return <h2 className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</h2>;
}

export default function ExecutiveDashboardPage() {
  const { can } = useAdminRole();
  const [range, setRange] = useState("30d");
  const queue = useAdminQuery(adminService.actionQueue);

  return (
    <PermissionGuard permission="dashboard.view">
      <div className="space-y-5">
        <PageHeader
          title="Executive dashboard"
          description="Ecosystem-wide health across internflareJobs, SquadCot and the shared platform. Metrics are computed from recorded source events only."
          breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Executive dashboard" }]}
          actions={
            <>
              <DateRangeSelect value={range} onChange={setRange} />
              <PermissionButton permission="analytics.export" variant="outline" size="sm" className="h-8 bg-background" onClick={() => recordDemoAction("Export dashboard snapshot")}>
                <DownloadIcon className="mr-1.5 size-3.5" /> Export
              </PermissionButton>
            </>
          }
        />

        {queue.loading ? (
          <PageSkeleton />
        ) : queue.error ? (
          <ErrorState onRetry={queue.retry} />
        ) : (
          <div className="grid gap-5 2xl:grid-cols-[1fr_400px]">
            <div className="min-w-0 space-y-5">
              <SectionTitle>Talent & recruitment</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Registered talents" value={formatNumber(20132)} delta={5.2} icon={UsersIcon} href="/users" definition="Talent accounts with confirmed email. Excludes suspended and deleted accounts." />
                <MetricCard label="Verified employers" value={formatNumber(318)} delta={3.1} icon={BadgeCheckIcon} href="/companies" definition="Companies with an approved company-verification decision. Registration alone does not count." />
                <MetricCard label="Active listings" value={formatNumber(838)} delta={3.2} icon={BriefcaseIcon} href="/listings" footnote="Includes 412 external imports" />
                <MetricCard label="New applications" value={formatNumber(6110)} kind="period" delta={-4.1} icon={FileStackIcon} href="/applications" />
                <MetricCard label="Shortlisted candidates" value={formatNumber(1402)} kind="period" delta={6.8} icon={ListChecksIcon} />
                <MetricCard label="Interview requests" value={formatNumber(588)} kind="period" delta={2.4} icon={CalendarClockIcon} />
                <MetricCard label="Offers / hires" value="104 / 83" kind="period" delta={8.1} icon={HandshakeIcon} href="/placements" definition="Hires counted only from recorded offer-acceptance events." />
                <MetricCard label="Employment conversion" value="33.1%" kind="period" delta={1.9} icon={TrendingUpIcon} definition="Completed internships with a recorded employment-conversion event ÷ completed internships." />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard title="User growth" description="Cumulative registered talents and employers">
                  <TrendChart
                    data={GROWTH_SERIES}
                    xKey="month"
                    variant="area"
                    series={[
                      { key: "talents", label: "Talents", color: "hsl(var(--chart-1))" },
                      { key: "employers", label: "Employers", color: "hsl(var(--chart-2))" },
                    ]}
                  />
                </SectionCard>
                <SectionCard title="Listings & applications" description="New per month (June month-to-date)">
                  <TrendChart
                    data={GROWTH_SERIES}
                    xKey="month"
                    variant="bar"
                    series={[
                      { key: "applications", label: "Applications", color: "hsl(var(--chart-1))" },
                      { key: "listings", label: "Listings", color: "hsl(var(--chart-3))" },
                    ]}
                  />
                </SectionCard>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard title="Recruitment conversion" description="Stage counts in period; % = conversion from previous stage">
                  <FunnelBars steps={RECRUITMENT_FUNNEL} />
                </SectionCard>
                <SectionCard title="Internship outcomes" description="Completion and employment conversion from recorded outcomes">
                  <FunnelBars steps={OUTCOME_FUNNEL} />
                  <p className="mt-4 text-xs text-muted-foreground">
                    1 completed engagement has no recorded outcome and is excluded from conversion.
                  </p>
                </SectionCard>
              </div>

              <SectionTitle>Engagements & SquadCot</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Active engagements" value={formatNumber(312)} delta={4.4} icon={UserCheckIcon} href="/engagements" />
                <MetricCard label="Completed engagements" value={formatNumber(402)} kind="period" delta={2.0} icon={TrophyIcon} />
                <MetricCard label="Active workspaces" value={formatNumber(229)} delta={1.7} icon={LayoutGridIcon} href="/workspaces" />
                <MetricCard label="Overdue tasks" value={formatNumber(92)} delta={13.6} invertDelta icon={AlarmClockIcon} href="/workspace-activity/projects" />
              </div>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <SectionCard title="Workspace activity" description="Tasks completed vs overdue per week">
                  <TrendChart
                    data={WORKSPACE_ACTIVITY_SERIES}
                    xKey="week"
                    variant="bar"
                    series={[
                      { key: "completed", label: "Completed", color: "hsl(var(--chart-1))" },
                      { key: "overdue", label: "Overdue", color: "hsl(var(--chart-3))" },
                    ]}
                  />
                </SectionCard>
                <div className="grid gap-3">
                  <MetricCard label="Task completion rate" value="91.3%" kind="period" delta={-0.8} icon={ListChecksIcon} />
                  <MetricCard label="Report participation" value="84.0%" kind="period" delta={-5.6} icon={FileBarChartIcon} href="/workspace-activity/reports" definition="Expected weekly reports submitted ÷ reports due in period." />
                </div>
              </div>

              {can("finance.view") && (
                <>
                  <SectionTitle>Commercial</SectionTitle>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Monthly recurring revenue" value="₦12.96M" delta={2.5} icon={WalletIcon} href="/analytics/commercial" definition="Sum of active, payment-confirmed subscriptions normalised to monthly. Pending-webhook subscriptions excluded." />
                    <MetricCard label="Active paid subscriptions" value={formatNumber(2125)} delta={2.2} icon={RepeatIcon} href="/subscriptions" />
                    <MetricCard label="Upgrades" value="61" kind="period" delta={9.0} icon={ArrowUpCircleIcon} />
                    <MetricCard label="Failed payments" value="23" kind="period" delta={-53.1} invertDelta icon={CreditCardIcon} href="/transactions" />
                    <MetricCard label="Eligible transaction volume" value="₦4.82M" kind="period" delta={12.4} icon={ReceiptIcon} definition="Salary/stipend, paid test-task and engagement payments with verified payment events." />
                    <MetricCard label="Recorded platform fees" value="₦0" kind="period" icon={ReceiptIcon} footnote="Fee awaiting commercial & compliance approval" />
                  </div>
                  <SectionCard title="Revenue & subscriptions" description="MRR (₦ millions) and failed payments">
                    <TrendChart
                      data={REVENUE_SERIES}
                      xKey="month"
                      series={[
                        { key: "mrr", label: "MRR (₦M)", color: "hsl(var(--chart-1))" },
                        { key: "failed", label: "Failed payments", color: "hsl(var(--chart-2))" },
                      ]}
                    />
                  </SectionCard>
                </>
              )}

              <SectionTitle>Integrations & AI</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="External listings imported" value={formatNumber(1248)} kind="period" delta={-18.2} icon={GlobeIcon} href="/integrations" />
                <MetricCard label="External-source health" value="1 of 3 healthy" icon={PlugIcon} href="/integrations" footnote="Jooble failing · Adzuna degraded" />
                <MetricCard label="AI requests" value={formatCompact(54110)} kind="period" delta={7.3} icon={SparklesIcon} href="/ai-usage" />
                <MetricCard label="AI provider cost" value="₦1.07M" kind="estimate" icon={SparklesIcon} footnote="Recorded ₦905k + estimated ₦162k" />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard title="External feed import health" description="Records imported vs failed per day">
                  <TrendChart
                    data={IMPORT_HEALTH_SERIES}
                    xKey="day"
                    variant="bar"
                    stacked
                    series={[
                      { key: "imported", label: "Imported", color: "hsl(var(--chart-1))" },
                      { key: "failed", label: "Failed", color: "hsl(var(--chart-3))" },
                    ]}
                  />
                </SectionCard>
                <SectionCard title="AI usage" description="Requests and failures per day">
                  <TrendChart
                    data={AI_USAGE_SERIES}
                    xKey="date"
                    series={[
                      { key: "requests", label: "Requests", color: "hsl(var(--chart-2))" },
                      { key: "failed", label: "Failed", color: "hsl(var(--chart-1))" },
                    ]}
                  />
                </SectionCard>
              </div>
            </div>

            <div className="space-y-4 2xl:sticky 2xl:top-20 2xl:self-start">
              <AttentionPanel items={queue.data ?? []} />
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
