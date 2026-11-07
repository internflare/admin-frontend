import { BreakdownList, ChartEmpty, CHART_COLORS, DonutChart, TrendChart } from "@/polymet/components/admin-charts";
import { SectionCard } from "@/polymet/components/section-card";
import { formatCurrency, formatNumber } from "@/polymet/lib/format";
import { humanize, labelSeries, seriesTotal, type AnalyticsSnapshot, type Breakdown, type SeriesPoint } from "@/polymet/lib/analytics-service";

type Bucket = AnalyticsSnapshot["bucket"];
type Section<K extends keyof AnalyticsSnapshot> = NonNullable<AnalyticsSnapshot[K]>;

const BUCKET_LABEL: Record<Bucket, string> = { day: "per day", week: "per week (Mon–Sun, UTC)", month: "per month" };

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  talent: "Talent", employer: "Employers", admin: "Administrators", not_onboarded: "Not onboarded",
};

const toItems = (items: Breakdown[], labels: Record<string, string> = {}) =>
  items.map((item) => ({ label: labels[item.key] ?? humanize(item.key), value: item.count }));

function Trend({ points, bucket, series, variant = "bar", stacked, empty }: {
  points: SeriesPoint[]; bucket: Bucket; series: { key: string; label: string }[];
  variant?: "bar" | "area" | "line"; stacked?: boolean; empty: string;
}) {
  if (seriesTotal(points, series.map((s) => s.key)) === 0) return <ChartEmpty message={empty} />;
  return (
    <TrendChart
      data={labelSeries(points, bucket)}
      xKey="label"
      variant={variant}
      stacked={stacked}
      series={series.map((s, i) => ({ ...s, color: CHART_COLORS[i % CHART_COLORS.length] }))}
    />
  );
}

export function SignupsTrend({ users, bucket }: { users: Section<"users">; bucket: Bucket }) {
  const total = seriesTotal(users.signups, Object.keys(ACCOUNT_TYPE_LABELS));
  return (
    <SectionCard title="New sign-ups" description={`${formatNumber(total)} accounts created in this period, ${BUCKET_LABEL[bucket]}, by current account type.`}>
      <Trend
        points={users.signups}
        bucket={bucket}
        stacked
        series={Object.entries(ACCOUNT_TYPE_LABELS).map(([key, label]) => ({ key, label }))}
        empty="No accounts were created in this period."
      />
    </SectionCard>
  );
}

export function AccountTypesDonut({ users }: { users: Section<"users"> }) {
  return (
    <SectionCard title="Accounts by type" description="All registered accounts, using the same rule as the user directory.">
      <DonutChart items={toItems(users.accountTypes, ACCOUNT_TYPE_LABELS)} centerLabel="accounts" emptyMessage="No accounts registered yet." />
    </SectionCard>
  );
}

export function CompaniesPanels({ companies, bucket }: { companies: Section<"companies">; bucket: Bucket }) {
  return (
    <>
      <SectionCard title="Company registrations" description={`New companies ${BUCKET_LABEL[bucket]}.`}>
        <Trend points={companies.registrations} bucket={bucket} series={[{ key: "companies", label: "Companies" }]} empty="No companies registered in this period." />
      </SectionCard>
      <SectionCard title="Company verification" description="Current verification status of every company.">
        <DonutChart items={toItems(companies.verification)} centerLabel="companies" emptyMessage="No companies registered yet." />
      </SectionCard>
    </>
  );
}

export function ListingsPanels({ listings, bucket }: { listings: Section<"listings">; bucket: Bucket }) {
  return (
    <>
      <SectionCard title="Listings created" description={`Opportunities posted ${BUCKET_LABEL[bucket]}.`}>
        <Trend points={listings.created} bucket={bucket} variant="area" series={[{ key: "listings", label: "Listings" }]} empty="No listings were posted in this period." />
      </SectionCard>
      <SectionCard title="Listings by type" description="All listings, by opportunity type.">
        <DonutChart items={toItems(listings.byType)} centerLabel="listings" emptyMessage="No listings posted yet." />
      </SectionCard>
      <SectionCard title="Work arrangement" description="All listings, by work arrangement.">
        <DonutChart items={toItems(listings.byArrangement)} centerLabel="listings" emptyMessage="No listings posted yet." />
      </SectionCard>
      <SectionCard title="Listing status" description="Current lifecycle status of every listing.">
        {listings.total === 0 ? <ChartEmpty message="No listings posted yet." height={160} /> : <BreakdownList items={toItems(listings.byStatus)} />}
      </SectionCard>
    </>
  );
}

export function RecruitmentPanels({ recruitment, bucket }: { recruitment: Section<"recruitment">; bucket: Bucket }) {
  return (
    <>
      <SectionCard title="Recruitment activity" description={`Applications submitted and interviews scheduled ${BUCKET_LABEL[bucket]}.`}>
        <Trend
          points={recruitment.activity}
          bucket={bucket}
          series={[{ key: "applications", label: "Applications" }, { key: "interviews", label: "Interviews" }]}
          empty="No applications or interviews in this period."
        />
      </SectionCard>
      <SectionCard title="Applications by current stage" description="Where every application currently sits. This is a snapshot, not a conversion funnel.">
        {recruitment.total === 0 ? <ChartEmpty message="No applications submitted yet." height={160} /> : <BreakdownList items={toItems(recruitment.stages)} />}
      </SectionCard>
      <SectionCard title="Interview outcomes" description="All interviews, by status.">
        <DonutChart items={toItems(recruitment.interviews)} centerLabel="interviews" emptyMessage="No interviews scheduled yet." />
      </SectionCard>
    </>
  );
}

export function CommercialPanels({ commercial, bucket }: { commercial: Section<"commercial">; bucket: Bucket }) {
  const revenue = seriesTotal(commercial.revenue, commercial.currencies);
  return (
    <>
      <SectionCard
        title="Successful payment volume"
        description={commercial.currencies.length
          ? `${commercial.currencies.map((c) => formatCurrency(seriesTotal(commercial.revenue, [c]), c)).join(" · ")} gross in this period, ${BUCKET_LABEL[bucket]}.`
          : `Gross value of successful payments ${BUCKET_LABEL[bucket]}.`}
      >
        {revenue === 0
          ? <ChartEmpty message="No successful payments in this period." />
          : <Trend points={commercial.revenue} bucket={bucket} variant="area" series={commercial.currencies.map((c) => ({ key: c, label: `Gross (${c})` }))} empty="" />}
      </SectionCard>
      <SectionCard title="Payment attempts" description={`Successful vs failed payments ${BUCKET_LABEL[bucket]}.`}>
        <Trend
          points={commercial.payments}
          bucket={bucket}
          stacked
          series={[{ key: "success", label: "Successful" }, { key: "failed", label: "Failed" }, { key: "other", label: "Pending / other" }]}
          empty="No payment attempts in this period."
        />
      </SectionCard>
      <SectionCard title="Payment outcomes" description="Payments created in this period, by status.">
        <DonutChart items={toItems(commercial.paymentStatus)} centerLabel="payments" emptyMessage="No payments in this period." />
      </SectionCard>
      <SectionCard title="Subscriptions by status" description="All subscriptions, by current status.">
        <DonutChart items={toItems(commercial.subscriptions)} centerLabel="subscriptions" emptyMessage="No subscriptions recorded yet." />
      </SectionCard>
    </>
  );
}

export function FeedbackPanels({ feedback }: { feedback: Section<"feedback"> }) {
  return (
    <>
      <SectionCard title="Feedback by type" description="All bug reports and feature ideas submitted by users.">
        <DonutChart items={toItems(feedback.byType)} centerLabel="submissions" emptyMessage="No feedback submitted yet." />
      </SectionCard>
      <SectionCard title="Feedback by status" description="Triage progress of every submission.">
        {feedback.total === 0 ? <ChartEmpty message="No feedback submitted yet." height={160} /> : <BreakdownList items={toItems(feedback.byStatus)} />}
      </SectionCard>
    </>
  );
}
