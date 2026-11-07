import { useCallback, type ReactNode } from "react";
import { BadgeCheckIcon, Building2Icon, ClockIcon, FileQuestionIcon, HourglassIcon, XCircleIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/polymet/components/metric-card";
import { ResourcePage } from "@/polymet/components/resource-page";
import { ErrorState } from "@/polymet/components/state-views";
import { apiClient } from "@/polymet/lib/api-client";
import { invalidResponse, isRecord, resources } from "@/polymet/lib/admin-service";
import { useAdminQuery } from "@/polymet/lib/use-admin-query";

interface VerificationStats {
  companies: { total: number; byStatus: Record<string, number> };
  cases: { PENDING_REVIEW: number; MORE_INFO_REQUIRED: number; APPROVED: number; REJECTED: number; open: number };
  decisions: { sampleSize: number; medianDecisionHours: number | null };
}

const CASE_KEYS = ["PENDING_REVIEW", "MORE_INFO_REQUIRED", "APPROVED", "REJECTED", "open"] as const;
const isCount = (value: unknown): value is number => Number.isInteger(value) && Number(value) >= 0;

async function fetchVerificationStats(): Promise<VerificationStats> {
  const response = await apiClient.get<unknown>("/verification/stats");
  const stats = isRecord(response) && response.success === true ? response.stats : undefined;
  if (!isRecord(stats) || !isRecord(stats.companies) || !isRecord(stats.cases) || !isRecord(stats.decisions)) invalidResponse("/verification/stats");
  const { companies, cases, decisions } = stats;
  if (!isCount(companies.total) || !isRecord(companies.byStatus) || !CASE_KEYS.every((key) => isCount(cases[key])) ||
      !isCount(decisions.sampleSize) || !(decisions.medianDecisionHours === null || typeof decisions.medianDecisionHours === "number")) {
    invalidResponse("/verification/stats");
  }
  return stats as unknown as VerificationStats;
}

function formatDuration(hours: number | null): string {
  if (hours === null) return "No decisions yet";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} days`;
}

function VerificationSummary() {
  const fetcher = useCallback(() => fetchVerificationStats(), []);
  const { data, loading, error, retry } = useAdminQuery(fetcher);

  if (error) return <ErrorState description={error} onRetry={retry} />;

  // Card layout is fixed, so only the values use a skeleton while loading.
  const value = (render: (stats: VerificationStats) => ReactNode, label: string) =>
    loading || !data ? (
      <div role="status" aria-busy="true" aria-label={`Loading ${label}`}><span className="sr-only">Loading {label}</span><Skeleton className="h-8 w-16" /></div>
    ) : render(data);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <MetricCard label="Registered companies" icon={Building2Icon} href="/companies"
        value={value((s) => s.companies.total.toLocaleString(), "registered companies")}
        footnote={data ? `${(data.companies.byStatus.UNVERIFIED ?? 0).toLocaleString()} have not submitted verification` : undefined}
        definition="Companies in the directory that have not been deleted." />
      <MetricCard label="Verified companies" icon={BadgeCheckIcon}
        value={value((s) => (s.companies.byStatus.VERIFIED ?? 0).toLocaleString(), "verified companies")}
        definition="Companies whose recorded verification status is VERIFIED." />
      <MetricCard label="Awaiting review" icon={HourglassIcon}
        value={value((s) => s.cases.PENDING_REVIEW.toLocaleString(), "cases awaiting review")}
        definition="Verification cases with status PENDING_REVIEW — these need an admin decision." />
      <MetricCard label="Awaiting company info" icon={FileQuestionIcon}
        value={value((s) => s.cases.MORE_INFO_REQUIRED.toLocaleString(), "cases awaiting company info")}
        definition="Cases where a reviewer requested more information from the company." />
      <MetricCard label="Rejected" icon={XCircleIcon}
        value={value((s) => s.cases.REJECTED.toLocaleString(), "rejected cases")}
        definition="Verification cases recorded as REJECTED." />
      <MetricCard label="Median time to decision" icon={ClockIcon} kind="period"
        value={value((s) => formatDuration(s.decisions.medianDecisionHours), "median time to decision")}
        footnote={data && data.decisions.sampleSize > 0 ? `Across ${data.decisions.sampleSize.toLocaleString()} recent decisions` : undefined}
        definition="Median time from submission to an approve/reject decision, over the most recent 500 decided cases." />
    </div>
  );
}

export default function VerificationQueuePage() {
  return <ResourcePage resource={resources.verification} summary={<VerificationSummary />} />;
}
