export interface ExternalSource {
  id: string;
  name: string;
  kind: "Public API" | "Partner feed" | "Employer feed";
  integrationStatus: "Connected" | "Awaiting configuration" | "Credentials invalid" | "Terms review";
  enabled: boolean;
  lastSuccessAt: string | null;
  lastAttemptAt: string | null;
  imported: number;
  failed: number;
  duplicates: number;
  expired: number;
  health: "Healthy" | "Degraded" | "Failing" | "Unknown";
  schedule: string;
  credentials: "Stored in vault" | "Missing";
  commercialTerms: "Approved" | "Under review" | "Not started";
  successRate: number | null;
}
export interface SyncRun {
  id: string;
  sourceId: string;
  provider: string;
  startedAt: string;
  endedAt: string | null;
  fetched: number;
  created: number;
  updated: number;
  duplicates: number;
  rejected: number;
  failures: number;
  status: "Succeeded" | "Partial" | "Failed" | "Running";
  retry: "—" | "Scheduled" | "Retried" | "Exhausted";
}
export interface FailedImport {
  id: string;
  externalId: string;
  provider: string;
  title: string | null;
  company: string | null;
  errors: string[];
  duplicateOf?: string;
  duplicateReason?: string;
  sourceUrl: string;
  lastAttempt: string;
  resolution: "Unresolved" | "Retry queued" | "Dismissed" | "Resolved";
}
export interface DuplicateCandidate {
  id: string;
  left: { ref: string; provider: string; title: string; company: string; location: string };
  right: { ref: string; provider: string; title: string; company: string; location: string };
  similarity: number;
  status: "Needs review" | "Merged" | "Kept separate";
}
export const AI_FEATURES = [
  "Candidate matching",
  "Opportunity recommendations",
  "Job description assistance",
  "CV & application tools",
  "Interview assessments",
  "Readiness & learning",
  "Client acquisition writing",
  "Handover summaries",
] as const;
export interface AIEvent {
  id: string;
  feature: string;
  provider: string;
  model: string;
  account: string;
  plan: string;
  at: string;
  latencyMs: number;
  tokensIn: number | null;
  tokensOut: number | null;
  status: "Success" | "Failed" | "Rate limited" | "Low confidence";
  error?: string;
  redactedInput: string;
  redactedOutput: string;
}
export interface MatchReview {
  id: string;
  listing: string;
  candidate: string;
  score: number;
  confidence: "High" | "Medium" | "Low";
  factors: { label: string; weight: "Strong" | "Partial" | "Missing" }[];
  missingData: string[];
  report?: string;
  status: "Reported inaccuracy" | "Low confidence" | "Reviewed";
}
