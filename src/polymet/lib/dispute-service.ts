import { apiClient } from "@/polymet/lib/api-client";
import { invalidResponse, isRecord, type AdminRecord, type ResourceDefinition } from "@/polymet/lib/admin-service";

export const disputesResource: ResourceDefinition = {
  title: "Disputes", endpoint: "/disputes", envelope: "disputes", permission: "support.view",
  paginated: true, search: true,
  fields: [
    { key: "reference", label: "Reference" }, { key: "title", label: "Title" },
    { key: "status", label: "Status", format: "status" }, { key: "priority", label: "Priority" },
    { key: "assignee_id", label: "Assigned admin ID" }, { key: "updated_at", label: "Updated", format: "date" },
  ],
  filters: [
    { key: "status", label: "Status", options: ["Open", "Assigned", "Escalated", "Resolved"] },
    { key: "priority", label: "Priority", options: ["Low", "Medium", "High", "Critical"] },
  ],
  note: "Persistent dispute cases. Evidence consists of external HTTPS URL references, not uploaded files. Resolved cases are read-only.",
};
export interface Dispute extends AdminRecord {
  _id: string; reference: string; title: string; description: string; status: string; priority: string;
  version: number; assignee_id?: string; user_id?: string; application_id?: string;
  notes: { text: string; author_id: string; created_at: string }[];
  evidence: { url: string; description: string; author_id: string; created_at: string }[];
  escalation?: { reason: string; author_id: string; created_at: string };
  resolution?: { summary: string; author_id: string; created_at: string };
}
export type DisputeAction = "assign" | "notes" | "evidence" | "escalate" | "resolve";
export interface DisputeOption { id: string; label: string; user_id?: string }
function hasActor(value: unknown): value is AdminRecord {
  return isRecord(value) && typeof value.author_id === "string" &&
    typeof value.created_at === "string" && !Number.isNaN(Date.parse(value.created_at));
}
function parseDispute(response: unknown, endpoint: string): Dispute {
  if (!isRecord(response) || response.success !== true || !isRecord(response.dispute)) invalidResponse(endpoint);
  const record = response.dispute;
  if (typeof record._id !== "string" || typeof record.title !== "string" || typeof record.reference !== "string" ||
      typeof record.description !== "string" || !["Open", "Assigned", "Escalated", "Resolved"].includes(String(record.status)) ||
      !["Low", "Medium", "High", "Critical"].includes(String(record.priority)) ||
      !Number.isInteger(record.version) || Number(record.version) < 0 ||
      !Array.isArray(record.notes) || !Array.isArray(record.evidence) ||
      !record.notes.every((entry) => hasActor(entry) && typeof entry.text === "string") ||
      !record.evidence.every((entry) => hasActor(entry) && typeof entry.url === "string" && typeof entry.description === "string") ||
      (record.escalation !== undefined && (!hasActor(record.escalation) || typeof record.escalation.reason !== "string")) ||
      (record.resolution !== undefined && (!hasActor(record.resolution) || typeof record.resolution.summary !== "string")) ||
      !["assignee_id", "user_id", "application_id"].every((key) => record[key] === undefined || typeof record[key] === "string")) invalidResponse(endpoint);
  return record as Dispute;
}
export async function fetchDispute(id: string, signal?: AbortSignal): Promise<Dispute> {
  const endpoint = `/disputes/${encodeURIComponent(id)}`;
  return parseDispute(await apiClient.get<unknown>(endpoint, { signal }), endpoint);
}
export async function createDispute(payload: AdminRecord): Promise<Dispute> {
  return parseDispute(await apiClient.post<unknown>("/disputes", payload), "/disputes");
}
export async function changeDispute(id: string, action: DisputeAction, payload: AdminRecord): Promise<Dispute> {
  const endpoint = `/disputes/${encodeURIComponent(id)}/${action}`;
  return parseDispute(await apiClient.post<unknown>(endpoint, payload), endpoint);
}
export async function lookupDispute(kind: "users" | "applications" | "admins", search: string | undefined, signal: AbortSignal): Promise<DisputeOption[]> {
  const response = await apiClient.get<unknown>("/disputes/lookups", { params: { kind, search }, signal });
  if (!isRecord(response) || response.success !== true || !Array.isArray(response.options) ||
      !response.options.every((entry) => isRecord(entry) && typeof entry.id === "string" && typeof entry.label === "string")) invalidResponse("/disputes/lookups");
  return response.options as DisputeOption[];
}
