import { apiClient } from "@/polymet/lib/api-client";
import { invalidResponse, isRecord } from "@/polymet/lib/admin-service";

export const ACTION_PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;
export type ActionPriority = (typeof ACTION_PRIORITIES)[number];

export type ActionSource =
  | "incidents"
  | "verifications"
  | "reconciliations"
  | "transactions"
  | "listings"
  | "workspaces"
  | "feedback";

export interface ActionQueueItem {
  id: string;
  source: ActionSource;
  priority: ActionPriority;
  title: string;
  detail: string;
  recordType: string;
  recordRef: string;
  status: string;
  createdAt: string;
  ageHours: number;
  href: string;
  nextAction: string;
}

export interface ActionQueueSource {
  source: ActionSource;
  label: string;
  module: string;
  total: number;
  loaded: number;
}

export interface ActionQueue {
  generatedAt: string;
  items: ActionQueueItem[];
  sources: ActionQueueSource[];
  restrictedSources: { source: ActionSource; label: string }[];
  priorityCounts: Record<ActionPriority, number>;
  truncated: boolean;
}

const isString = (value: unknown): value is string => typeof value === "string";

function isItem(value: unknown): value is ActionQueueItem {
  return (
    isRecord(value) &&
    ["id", "source", "title", "detail", "recordType", "recordRef", "status", "createdAt", "href", "nextAction"].every((key) => isString(value[key])) &&
    ACTION_PRIORITIES.includes(value.priority as ActionPriority) &&
    typeof value.ageHours === "number"
  );
}

function isSource(value: unknown): value is ActionQueueSource {
  return isRecord(value) && isString(value.source) && isString(value.label) && isString(value.module) &&
    typeof value.total === "number" && typeof value.loaded === "number";
}

/** Open records from every module the signed-in admin can view, sorted by priority then age. */
export async function fetchActionQueue(): Promise<ActionQueue> {
  const endpoint = "/action-queue";
  const response = await apiClient.get<unknown>(endpoint);
  const queue = isRecord(response) && response.success === true ? response.queue : undefined;
  if (
    !isRecord(queue) || !isString(queue.generatedAt) ||
    !Array.isArray(queue.items) || !queue.items.every(isItem) ||
    !Array.isArray(queue.sources) || !queue.sources.every(isSource) ||
    !Array.isArray(queue.restrictedSources) || !isRecord(queue.priorityCounts) ||
    !ACTION_PRIORITIES.every((priority) => typeof (queue.priorityCounts as Record<string, unknown>)[priority] === "number")
  ) invalidResponse(endpoint);
  return queue as unknown as ActionQueue;
}
