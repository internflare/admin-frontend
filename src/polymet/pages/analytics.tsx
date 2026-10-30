import { useState } from "react";
import { DownloadIcon, InfoIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/polymet/components/page-header";
import { MetricCard } from "@/polymet/components/metric-card";
import { SectionCard } from "@/polymet/components/section-card";
import { TrendChart, FunnelBars, BreakdownList } from "@/polymet/components/admin-charts";
import { DateRangeSelect } from "@/polymet/components/date-range-select";
import { PermissionGuard, PermissionButton } from "@/polymet/components/permission-controls";
import {
  GROWTH_SERIES,
  REVENUE_SERIES,
  WORKSPACE_ACTIVITY_SERIES,
  IMPORT_HEALTH_SERIES,
  RECRUITMENT_FUNNEL,
  OUTCOME_FUNNEL,
  SOURCE_PERFORMANCE,
} from "@/polymet/data/dashboard-data";
import { PLANS } from "@/polymet/data/commercial-data";
import { AI_USAGE_SERIES, AI_FEATURE_USAGE } from "@/polymet/data/integrations-data";
import { formatCompactCurrency, formatCurrency, formatNumber, formatPercent } from "@/polymet/lib/format";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

type Tab = "talent" | "recruitment" | "outcomes" | "squadcot" | "commercial" | "external" | "mentorship";

const TABS: { value: Tab; label: string }[] = [
  { value: "talent", label: "Talent & growth" },
  { value: "recruitment", label: "Recruitment" },
  { value: "outcomes", label: "Outcomes" },
  { value: "squadcot", label: "SquadCot" },
  { value: "commercial", label: "Commercial" },
  { value: "external", label: "External sources" },
  { value: "mentorship", label: "Mentorship & AI" },
];

const DEFINITIONS: Record<Tab, { metric: string; definition: string }[]> = {
  talent: [
    { metric: "Registered talent", definition: "Accounts with a verified email and talent role, excluding deleted and test accounts." },
    { metric: "Monthly active", definition: "Distinct talent with ≥1 authenticated session in the calendar month." },
  ],
  recruitment: [
    { metric: "Shortlist rate", definition: "Applications moved to Shortlisted ÷ applications received for internal listings only." },
    { metric: "Time to hire", definition: "Median days from application submitted to offer accepted." },
  ],
  outcomes: [
    { metric: "Completion rate", definition: "Internships marked Completed by the employer ÷ internships started in the cohort." },
    { metric: "Conversion to employment", definition: "Completed internships with a recorded employment offer accepted within 90 days." },
  ],
  squadcot: [
    { metric: "Overdue tasks", definition: "Open tasks past their due date at the end of the week." },
    { metric: "Report submission", definition: "Weekly reports submitted ÷ reports expected for active engagements." },
  ],
  commercial: [
    { metric: "MRR", definition: "Sum of normalised monthly value of Active subscriptions with a verified payment. Pending payment confirmation is excluded." },
    { metric: "Platform fee", definition: "Planned only. Not yet charged on any transaction — shown as zero until enabled." },
  ],
  external: [
    { metric: "Click-outs", definition: "Talent clicks to an external application URL. Hires on external sources are not tracked." },
  ],
  mentorship: [
    { metric: "AI requests", definition: "Calls to an AI provider, including retries. Failed requests are counted separately." },
    { metric: "AI cost", definition: "Provider-recorded spend where available; otherwise estimated from token counts." },
  ],
};

function Definitions({ tab }: { tab: Tab }) {
  return (
    <SectionCard title="Metric definitions" description="How each figure on this tab is calculated.">
      <dl className="grid gap-3 sm:grid-cols-2">
        {DEFINITIONS[tab].map((d) => (
          <div key={d.metric} className="rounded-lg border p-3">
            <dt className="flex items-center gap-1.5 text-sm font-medium"><InfoIcon className="size-3.5 text-muted-foreground" /> {d.metric}</dt>
            <dd className="mt-1 text-xs text-muted-foreground">{d.definition}</dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}

export default function AnalyticsPage({ initialTab = "talent" }: { initialTab?: Tab }) {
  const [range, setRange] = useState("12m");
  const [tab, setTab] = useState<Tab>(initialTab);
  const latest = GROWTH_SERIES[GROWTH_SERIES.length - 1];
  const prev = GROWTH_SERIES[GROWTH_SERIES.length - 2];
  const rev = REVENUE_SERIES[REVENUE_SERIES.length - 1];
  const revPrev = REVENUE_SERIES[REVENUE_SERIES.length - 2];
  const pct = (a: number, b: number) => Math.round(((a - b) / b) * 1000) / 10;
  const isCommercial = initialTab === "commercial";

  return (
    <PermissionGuard permission={isCommercial ? "finance.view" : "analytics.view"}>
      <div className="space-y-5">
        <PageHeader
          title={isCommercial ? "Revenue analytics" : "Analytics & reporting"}
          description="Sample figures. Every metric links to its definition below; estimates are labelled."
          breadcrumbs={[{ label: isCommercial ? "Commercial" : "Trust & operations" }, { label: "Analytics" }]}
          actions={
            <>
              <DateRangeSelect value={range} onChange={setRange} />
              <PermissionButton permission="analytics.export" variant="outline" size="sm" className="bg-background" onClick={() => recordDemoAction(`Export queued · ${TABS.find((t) => t.value === tab)?.label}`, "CSV will be emailed to you. Exports are audited and exclude personal data.")}>
                <DownloadIcon className="size-4" /> Export CSV
              </PermissionButton>
            </>
          }
        />

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList>
              {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
            </TabsList>
          </div>

          <TabsContent value="talent" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Registered talent" value={formatNumber(latest.talents)} delta={pct(latest.talents, prev.talents)} kind="current" />
              <MetricCard label="Employers" value={formatNumber(latest.employers)} delta={pct(latest.employers, prev.employers)} kind="current" />
              <MetricCard label="Live listings" value={formatNumber(latest.listings)} delta={pct(latest.listings, prev.listings)} kind="current" />
              <MetricCard label="Applications (May)" value={formatNumber(prev.applications)} kind="period" />
            </div>
            <SectionCard title="Account growth">
              <TrendChart data={GROWTH_SERIES} xKey="month" variant="area" series={[{ key: "talents", label: "Talent", color: "hsl(var(--chart-1))" }]} />
            </SectionCard>
            <Definitions tab="talent" />
          </TabsContent>

          <TabsContent value="recruitment" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard title="Recruitment funnel" description="Internal listings · last 30 days"><FunnelBars steps={RECRUITMENT_FUNNEL} /></SectionCard>
              <SectionCard title="Applications by month">
                <TrendChart data={GROWTH_SERIES} xKey="month" variant="bar" series={[{ key: "applications", label: "Applications", color: "hsl(var(--chart-1))" }]} />
              </SectionCard>
            </div>
            <Definitions tab="recruitment" />
          </TabsContent>

          <TabsContent value="outcomes" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Completion rate" value={formatPercent((OUTCOME_FUNNEL[1].value / OUTCOME_FUNNEL[0].value) * 100)} kind="period" />
              <MetricCard label="Conversion to employment" value={formatPercent((OUTCOME_FUNNEL[2].value / OUTCOME_FUNNEL[1].value) * 100)} kind="period" />
              <MetricCard label="Median time to hire" value="19 days" kind="estimate" footnote="Sample-based estimate" />
            </div>
            <SectionCard title="Internship outcomes" description="2025 cohort to date"><FunnelBars steps={OUTCOME_FUNNEL} /></SectionCard>
            <Definitions tab="outcomes" />
          </TabsContent>

          <TabsContent value="squadcot" className="space-y-4">
            <SectionCard title="Weekly workspace activity">
              <TrendChart
                data={WORKSPACE_ACTIVITY_SERIES}
                xKey="week"
                variant="bar"
                series={[
                  { key: "completed", label: "Tasks completed", color: "hsl(var(--chart-1))" },
                  { key: "overdue", label: "Overdue", color: "hsl(var(--chart-3))" },
                ]}
              />
            </SectionCard>
            <SectionCard title="Report submission rate (%)">
              <TrendChart data={WORKSPACE_ACTIVITY_SERIES} xKey="week" series={[{ key: "reports", label: "Submitted %", color: "hsl(var(--chart-2))" }]} height={180} />
            </SectionCard>
            <Definitions tab="squadcot" />
          </TabsContent>

          <TabsContent value="commercial" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="MRR" value={`₦${rev.mrr}M`} delta={pct(rev.mrr, revPrev.mrr)} kind="current" />
              <MetricCard label="Paying subscriptions" value={formatNumber(rev.subscriptions)} delta={pct(rev.subscriptions, revPrev.subscriptions)} kind="current" />
              <MetricCard label="Failed payments (Jun)" value={rev.failed} invertDelta delta={pct(rev.failed, revPrev.failed)} kind="period" />
              <MetricCard label="Platform fee revenue" value={formatCurrency(0)} kind="unavailable" footnote="10% fee planned — not enabled" />
            </div>
            <SectionCard title="MRR (₦ millions)">
              <TrendChart data={REVENUE_SERIES} xKey="month" variant="area" series={[{ key: "mrr", label: "MRR (₦M)", color: "hsl(var(--chart-1))" }]} />
            </SectionCard>
            <SectionCard title="Subscribers by plan">
              <BreakdownList items={PLANS.map((p) => ({ label: `${p.audience} · ${p.name}`, value: p.activeSubscribers, hint: p.priceMonthly ? `${formatCompactCurrency(p.priceMonthly)}/mo` : "Free" }))} />
            </SectionCard>
            <Definitions tab="commercial" />
          </TabsContent>

          <TabsContent value="external" className="space-y-4">
            <SectionCard title="Import health · last 7 days">
              <TrendChart
                data={IMPORT_HEALTH_SERIES}
                xKey="day"
                variant="bar"
                stacked
                series={[
                  { key: "imported", label: "Imported", color: "hsl(var(--chart-1))" },
                  { key: "failed", label: "Failed", color: "hsl(var(--destructive))" },
                ]}
              />
            </SectionCard>
            <SectionCard title="Performance by source">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Applications / click-outs</TableHead>
                    <TableHead className="text-right">Shortlist rate</TableHead>
                    <TableHead className="text-right">Hires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SOURCE_PERFORMANCE.map((s) => (
                    <TableRow key={s.source}>
                      <TableCell className="font-medium">{s.source}</TableCell>
                      <TableCell className="text-right">{formatNumber(s.applications)}</TableCell>
                      <TableCell className="text-right">{s.shortlistRate == null ? <span className="text-xs text-muted-foreground">Not tracked</span> : formatPercent(s.shortlistRate)}</TableCell>
                      <TableCell className="text-right">{s.hires == null ? <span className="text-xs text-muted-foreground">Not tracked</span> : s.hires}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
            <Definitions tab="external" />
          </TabsContent>

          <TabsContent value="mentorship" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Mentor sessions (30d)" value="312" kind="period" />
              <MetricCard label="Session completion" value="91%" kind="period" />
              <MetricCard label="AI match accuracy" value="Not measured" kind="unavailable" footnote="No ground-truth evaluation in place" />
            </div>
            <SectionCard title="AI requests per day">
              <TrendChart
                data={AI_USAGE_SERIES}
                xKey="date"
                series={[
                  { key: "requests", label: "Requests", color: "hsl(var(--chart-2))" },
                  { key: "failed", label: "Failed", color: "hsl(var(--destructive))" },
                ]}
              />
            </SectionCard>
            <SectionCard title="AI cost by feature (30d)">
              <BreakdownList items={AI_FEATURE_USAGE.map((f) => ({ label: f.feature, value: f.cost, hint: f.costKind }))} format={(n) => formatCompactCurrency(n)} />
            </SectionCard>
            <Definitions tab="mentorship" />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
