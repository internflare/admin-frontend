import { format, parseISO } from "date-fns";
import { apiClient } from "@/polymet/lib/api-client";
import { invalidResponse, isRecord } from "@/polymet/lib/admin-service";

export const ANALYTICS_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last 12 months" },
] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number]["value"];

export interface Breakdown { key: string; count: number }
export type SeriesPoint = { period: string } & Record<string, number | string>;

/** Mirrors admin-service's analytics snapshot; sections the admin's role can't read are omitted. */
export interface AnalyticsSnapshot {
  range: AnalyticsRange;
  bucket: "day" | "week" | "month";
  from: string;
  generatedAt: string;
  users?: { total: number; accountTypes: Breakdown[]; signups: SeriesPoint[] };
  companies?: { total: number; verification: Breakdown[]; registrations: SeriesPoint[] };
  listings?: { total: number; byType: Breakdown[]; byArrangement: Breakdown[]; byStatus: Breakdown[]; created: SeriesPoint[] };
  recruitment?: { total: number; stages: Breakdown[]; interviews: Breakdown[]; activity: SeriesPoint[] };
  commercial?: { currencies: string[]; revenue: SeriesPoint[]; payments: SeriesPoint[]; paymentStatus: Breakdown[]; subscriptions: Breakdown[] };
  feedback?: { total: number; byType: Breakdown[]; byStatus: Breakdown[] };
}

const isBreakdowns = (value: unknown) =>
  Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.key === "string" && typeof item.count === "number");
const isSeries = (value: unknown) =>
  Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.period === "string");

const SECTION_SHAPES: Record<string, { breakdowns: string[]; series: string[] }> = {
  users: { breakdowns: ["accountTypes"], series: ["signups"] },
  companies: { breakdowns: ["verification"], series: ["registrations"] },
  listings: { breakdowns: ["byType", "byArrangement", "byStatus"], series: ["created"] },
  recruitment: { breakdowns: ["stages", "interviews"], series: ["activity"] },
  commercial: { breakdowns: ["paymentStatus", "subscriptions"], series: ["revenue", "payments"] },
  feedback: { breakdowns: ["byType", "byStatus"], series: [] },
};

/** Loads recorded analytics. `/dashboard` needs dashboard.view, `/analytics` needs analytics.view. */
export async function fetchAnalytics(endpoint: "/dashboard" | "/analytics", range: AnalyticsRange): Promise<AnalyticsSnapshot> {
  const response = await apiClient.get<unknown>(endpoint, { params: { range } });
  if (!isRecord(response) || response.success !== true || !isRecord(response.analytics)) invalidResponse(endpoint);
  const snapshot = response.analytics;
  if (typeof snapshot.range !== "string" || typeof snapshot.bucket !== "string") invalidResponse(endpoint);
  for (const [section, shape] of Object.entries(SECTION_SHAPES)) {
    const content = snapshot[section];
    if (content === undefined) continue;
    if (!isRecord(content) || !shape.breakdowns.every((key) => isBreakdowns(content[key])) ||
        !shape.series.every((key) => isSeries(content[key]))) invalidResponse(endpoint);
  }
  return snapshot as unknown as AnalyticsSnapshot;
}

/** Downloads the audited CSV export (needs analytics.export). */
export async function downloadAnalyticsCsv(range: AnalyticsRange): Promise<void> {
  const csv = await apiClient.post<unknown>("/analytics/export", { format: "csv", range }, { headers: { Accept: "text/csv" } });
  if (typeof csv !== "string") invalidResponse("/analytics/export");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `internflare-analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Adds a readable `label` for the x-axis based on the bucket size. */
export function labelSeries(points: SeriesPoint[], bucket: AnalyticsSnapshot["bucket"]) {
  const pattern = bucket === "month" ? "MMM yyyy" : "d MMM";
  return points.map((point) => ({ ...point, label: format(parseISO(point.period), pattern) }));
}

export const seriesTotal = (points: SeriesPoint[], keys: string[]) =>
  points.reduce((total, point) => total + keys.reduce((sum, key) => sum + Number(point[key] ?? 0), 0), 0);

export function humanize(key: string) {
  const text = key.replace(/[_-]+/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
