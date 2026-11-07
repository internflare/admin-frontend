import { apiClient } from "@/polymet/lib/api-client";
import { invalidResponse, isRecord } from "@/polymet/lib/admin-service";

export const OPERATIONS_RANGES = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
] as const;
export type OperationsRange = (typeof OPERATIONS_RANGES)[number]["value"];

export type ProbeStatus = "healthy" | "degraded" | "down" | "unknown";
export const INCIDENT_STATUSES = ["Investigating", "Identified", "Monitoring", "Resolved"] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
export const INCIDENT_SEVERITIES = ["minor", "major", "critical"] as const;
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export interface HistoryPoint {
  period: string;
  samples: number;
  uptimePct: number | null;
  avgLatencyMs: number | null;
  maxMessages: number | null;
}

/** One monitored service, provider or queue. `key` is `<kind>:<target>`. */
export interface MonitoredTarget {
  key: string;
  kind: "service" | "provider" | "queue";
  target: string;
  name: string;
  status: ProbeStatus;
  latencyMs: number | null;
  httpStatus: number | null;
  error: string | null;
  messages: number | null;
  consumers: number | null;
  checkedAt: string | null;
  uptimePct: number | null;
  avgLatencyMs: number | null;
  p95LatencyMs: number | null;
  samples: number;
  history: HistoryPoint[];
}

export interface IncidentUpdate {
  at: string;
  status: IncidentStatus;
  message: string;
  actor: string;
  automated: boolean;
}

export interface Incident {
  id: string;
  reference: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  source: "manual" | "automatic";
  affected: string[];
  openedBy: string;
  recoveredAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  timeline: IncidentUpdate[];
}

export interface OperationsOverview {
  range: OperationsRange;
  bucket: string;
  from: string;
  generatedAt: string;
  intervalSeconds: number;
  monitorEnabled: boolean;
  lastCheckedAt: string;
  historyAvailable: boolean;
  periods: string[];
  services: MonitoredTarget[];
  providers: MonitoredTarget[];
  queues: MonitoredTarget[];
  incidents: { open: number; recent: Incident[] };
}

const isTarget = (value: unknown) =>
  isRecord(value) && typeof value.key === "string" && typeof value.name === "string" &&
  typeof value.status === "string" && Array.isArray(value.history);

const isIncident = (value: unknown) =>
  isRecord(value) && typeof value.id === "string" && typeof value.reference === "string" &&
  typeof value.status === "string" && Array.isArray(value.timeline) && Array.isArray(value.affected);

export async function fetchOperationsOverview(range: OperationsRange): Promise<OperationsOverview> {
  const endpoint = "/operations/overview";
  const response = await apiClient.get<unknown>(endpoint, { params: { range } });
  if (!isRecord(response) || response.success !== true || !isRecord(response.overview)) invalidResponse(endpoint);
  const overview = response.overview;
  const lists = [overview.services, overview.providers, overview.queues];
  if (!lists.every((list) => Array.isArray(list) && list.every(isTarget)) || !Array.isArray(overview.periods) ||
      !isRecord(overview.incidents) || !Array.isArray(overview.incidents.recent) ||
      !overview.incidents.recent.every(isIncident)) invalidResponse(endpoint);
  return overview as unknown as OperationsOverview;
}

/** Runs every probe now (system.manage). */
export async function runOperationsChecks(): Promise<string> {
  const endpoint = "/operations/checks";
  const response = await apiClient.post<unknown>(endpoint, {});
  if (!isRecord(response) || response.success !== true || typeof response.checkedAt !== "string") invalidResponse(endpoint);
  return response.checkedAt;
}

export async function fetchIncidents(status: "open" | "resolved" | "all", page = 1, limit = 20) {
  const endpoint = "/operations/incidents";
  const response = await apiClient.get<unknown>(endpoint, { params: { status, page, limit } });
  if (!isRecord(response) || response.success !== true || !Array.isArray(response.incidents) ||
      !response.incidents.every(isIncident) || !isRecord(response.pagination)) invalidResponse(endpoint);
  return {
    incidents: response.incidents as unknown as Incident[],
    total: typeof response.pagination.total === "number" ? response.pagination.total : response.incidents.length,
  };
}

export async function createIncident(input: { title: string; severity: IncidentSeverity; affected: string[]; message: string }): Promise<Incident> {
  const endpoint = "/operations/incidents";
  const response = await apiClient.post<unknown>(endpoint, input);
  if (!isRecord(response) || response.success !== true || !isIncident(response.incident)) invalidResponse(endpoint);
  return response.incident as unknown as Incident;
}

export async function postIncidentUpdate(id: string, input: { status: IncidentStatus; message: string }): Promise<Incident> {
  const endpoint = `/operations/incidents/${encodeURIComponent(id)}/updates`;
  const response = await apiClient.post<unknown>(endpoint, input);
  if (!isRecord(response) || response.success !== true || !isIncident(response.incident)) invalidResponse(endpoint);
  return response.incident as unknown as Incident;
}

const ERROR_LABELS: Record<string, string> = {
  timeout: "Timed out",
  connection_refused: "Connection refused",
  dns_failure: "Host not found",
  connection_reset: "Connection reset",
  tls_error: "TLS error",
  network_error: "Network error",
  slow_response: "Slow response",
  dependency_degraded: "Dependency degraded",
  queue_missing: "Queue missing",
  no_consumers: "No consumers",
  backlog: "Backlog above threshold",
  broker_unreachable: "Broker unreachable",
};

export function describeProbeError(code: string | null): string | null {
  if (!code) return null;
  if (code.startsWith("http_")) return `HTTP ${code.slice(5)}`;
  return ERROR_LABELS[code] ?? code.replace(/_/g, " ");
}
