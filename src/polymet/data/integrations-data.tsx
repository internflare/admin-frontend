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

export const EXTERNAL_SOURCES: ExternalSource[] = [
  { id: "SRC-ADZ", name: "Adzuna", kind: "Public API", integrationStatus: "Connected", enabled: true, lastSuccessAt: "2025-06-11T03:00:00", lastAttemptAt: "2025-06-11T09:00:00", imported: 4812, failed: 37, duplicates: 214, expired: 612, health: "Degraded", schedule: "Every 6 hours", credentials: "Stored in vault", commercialTerms: "Approved", successRate: 96.2 },
  { id: "SRC-JOO", name: "Jooble", kind: "Public API", integrationStatus: "Credentials invalid", enabled: true, lastSuccessAt: "2025-06-09T03:00:00", lastAttemptAt: "2025-06-11T09:00:00", imported: 2290, failed: 118, duplicates: 96, expired: 340, health: "Failing", schedule: "Every 6 hours", credentials: "Stored in vault", commercialTerms: "Under review", successRate: 71.4 },
  { id: "SRC-PRT", name: "Lagos Tech Partners feed", kind: "Partner feed", integrationStatus: "Connected", enabled: true, lastSuccessAt: "2025-06-11T08:00:00", lastAttemptAt: "2025-06-11T08:00:00", imported: 186, failed: 2, duplicates: 4, expired: 21, health: "Healthy", schedule: "Daily 08:00 WAT", credentials: "Stored in vault", commercialTerms: "Approved", successRate: 99.1 },
  { id: "SRC-EMP", name: "Employer XML feed (Zuri Retail)", kind: "Employer feed", integrationStatus: "Awaiting configuration", enabled: false, lastSuccessAt: null, lastAttemptAt: null, imported: 0, failed: 0, duplicates: 0, expired: 0, health: "Unknown", schedule: "Not scheduled", credentials: "Missing", commercialTerms: "Not started", successRate: null },
];

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

export const SYNC_RUNS: SyncRun[] = [
  { id: "SYN-20931", sourceId: "SRC-ADZ", provider: "Adzuna", startedAt: "2025-06-11T09:00:00", endedAt: "2025-06-11T09:04:12", fetched: 640, created: 0, updated: 0, duplicates: 0, rejected: 0, failures: 640, status: "Failed", retry: "Scheduled" },
  { id: "SYN-20930", sourceId: "SRC-JOO", provider: "Jooble", startedAt: "2025-06-11T09:00:00", endedAt: "2025-06-11T09:00:03", fetched: 0, created: 0, updated: 0, duplicates: 0, rejected: 0, failures: 1, status: "Failed", retry: "Exhausted" },
  { id: "SYN-20929", sourceId: "SRC-PRT", provider: "Lagos Tech Partners feed", startedAt: "2025-06-11T08:00:00", endedAt: "2025-06-11T08:00:41", fetched: 42, created: 6, updated: 31, duplicates: 2, rejected: 1, failures: 0, status: "Succeeded", retry: "—" },
  { id: "SYN-20928", sourceId: "SRC-ADZ", provider: "Adzuna", startedAt: "2025-06-11T03:00:00", endedAt: "2025-06-11T03:06:55", fetched: 1210, created: 148, updated: 902, duplicates: 41, rejected: 9, failures: 0, status: "Partial", retry: "—" },
  { id: "SYN-20927", sourceId: "SRC-JOO", provider: "Jooble", startedAt: "2025-06-11T03:00:00", endedAt: "2025-06-11T03:00:02", fetched: 0, created: 0, updated: 0, duplicates: 0, rejected: 0, failures: 1, status: "Failed", retry: "Retried" },
  { id: "SYN-20926", sourceId: "SRC-ADZ", provider: "Adzuna", startedAt: "2025-06-10T21:00:00", endedAt: "2025-06-10T21:05:10", fetched: 1188, created: 122, updated: 931, duplicates: 38, rejected: 4, failures: 0, status: "Succeeded", retry: "—" },
  { id: "SYN-20925", sourceId: "SRC-JOO", provider: "Jooble", startedAt: "2025-06-09T03:00:00", endedAt: "2025-06-09T03:09:40", fetched: 860, created: 74, updated: 702, duplicates: 22, rejected: 13, failures: 0, status: "Succeeded", retry: "—" },
];

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

export const FAILED_IMPORTS: FailedImport[] = [
  { id: "IMP-1001", externalId: "adz-4412988", provider: "Adzuna", title: "Senior Accountant", company: null, errors: ["company.name missing", "salary_currency unsupported: 'XAF'"], sourceUrl: "https://www.adzuna.com.ng/details/4412988", lastAttempt: "2025-06-11T03:05:00", resolution: "Unresolved" },
  { id: "IMP-1002", externalId: "adz-4413021", provider: "Adzuna", title: "Software Engineer, Payments", company: "Flutterwave", errors: [], duplicateOf: "LST-8807", duplicateReason: "Same provider ID re-published with new redirect URL; title + company + location match", sourceUrl: "https://www.adzuna.com.ng/details/4413021", lastAttempt: "2025-06-11T03:05:00", resolution: "Unresolved" },
  { id: "IMP-1003", externalId: "joo-88291", provider: "Jooble", title: "Customer Support Associate", company: "Moniepoint", errors: ["Application URL returned HTTP 404"], sourceUrl: "https://jooble.org/desc/88291", lastAttempt: "2025-06-09T03:09:00", resolution: "Retry queued" },
  { id: "IMP-1004", externalId: "prt-0192", provider: "Lagos Tech Partners feed", title: "Intern — QA", company: "Paylinq", errors: ["expires_at earlier than posted_at"], sourceUrl: "https://partners.lagostech.ng/jobs/0192", lastAttempt: "2025-06-11T08:00:30", resolution: "Unresolved" },
  { id: "IMP-1005", externalId: "adz-4409911", provider: "Adzuna", title: "Remote typing job $300/day", company: "Unknown", errors: ["Failed content policy: suspected scam pattern"], sourceUrl: "https://www.adzuna.com.ng/details/4409911", lastAttempt: "2025-06-10T21:04:00", resolution: "Dismissed" },
];

export interface DuplicateCandidate {
  id: string;
  left: { ref: string; provider: string; title: string; company: string; location: string };
  right: { ref: string; provider: string; title: string; company: string; location: string };
  similarity: number;
  status: "Needs review" | "Merged" | "Kept separate";
}

export const DUPLICATES: DuplicateCandidate[] = [
  { id: "DUP-301", left: { ref: "adz-4413021", provider: "Adzuna", title: "Software Engineer, Payments", company: "Flutterwave", location: "Lagos" }, right: { ref: "joo-90112", provider: "Jooble", title: "Software Engineer - Payments", company: "Flutterwave Inc.", location: "Lagos, Nigeria" }, similarity: 94, status: "Needs review" },
  { id: "DUP-302", left: { ref: "prt-0188", provider: "Lagos Tech Partners feed", title: "Product Analyst", company: "Kuda", location: "Lagos" }, right: { ref: "adz-4410077", provider: "Adzuna", title: "Product Analyst", company: "Kuda Bank", location: "Lagos" }, similarity: 97, status: "Needs review" },
  { id: "DUP-303", left: { ref: "LST-8804", provider: "Internal", title: "Logistics Operations Intern", company: "Bright Logistics", location: "Port Harcourt" }, right: { ref: "joo-87001", provider: "Jooble", title: "Operations Intern", company: "Bright Logistics", location: "Rivers" }, similarity: 81, status: "Kept separate" },
];

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

export const AI_USAGE_SERIES = [
  { date: "May 29", requests: 4120, failed: 38 },
  { date: "May 30", requests: 4380, failed: 41 },
  { date: "May 31", requests: 3010, failed: 22 },
  { date: "Jun 1", requests: 2880, failed: 19 },
  { date: "Jun 2", requests: 4870, failed: 52 },
  { date: "Jun 3", requests: 5120, failed: 61 },
  { date: "Jun 4", requests: 5340, failed: 140 },
  { date: "Jun 5", requests: 5010, failed: 48 },
  { date: "Jun 6", requests: 4760, failed: 44 },
  { date: "Jun 7", requests: 3220, failed: 27 },
  { date: "Jun 8", requests: 3105, failed: 25 },
  { date: "Jun 9", requests: 5480, failed: 57 },
  { date: "Jun 10", requests: 5710, failed: 63 },
  { date: "Jun 11", requests: 2930, failed: 31 },
];

export const AI_FEATURE_USAGE = [
  { feature: "Candidate matching", requests: 18420, tokens: 41200000, cost: 412000, costKind: "Recorded", p95: 2.1 },
  { feature: "CV & application tools", requests: 14210, tokens: 28900000, cost: 289000, costKind: "Recorded", p95: 3.4 },
  { feature: "Opportunity recommendations", requests: 9880, tokens: 12300000, cost: 123000, costKind: "Recorded", p95: 1.6 },
  { feature: "Job description assistance", requests: 4320, tokens: 8100000, cost: 81000, costKind: "Recorded", p95: 4.2 },
  { feature: "Interview assessments", requests: 2140, tokens: 6900000, cost: 69000, costKind: "Estimated", p95: 5.8 },
  { feature: "Readiness & learning", requests: 3960, tokens: 7200000, cost: 72000, costKind: "Estimated", p95: 2.9 },
  { feature: "Client acquisition writing", requests: 1180, tokens: 2100000, cost: 21000, costKind: "Estimated", p95: 3.1 },
  { feature: "Handover summaries", requests: 0, tokens: 0, cost: 0, costKind: "Not implemented", p95: 0 },
];

export const AI_PROVIDERS = [
  { provider: "Anthropic", requests: 38110, failed: 402, rateLimited: 37, cost: 845000, limit: "₦1,200,000 / month" },
  { provider: "OpenAI", requests: 16000, failed: 266, rateLimited: 112, cost: 222000, limit: "₦400,000 / month" },
];

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

export const AI_EVENTS: AIEvent[] = [
  { id: "AIE-77120", feature: "Candidate matching", provider: "Anthropic", model: "claude-sonnet", account: "Kora Fintech Ltd", plan: "Growth", at: "2025-06-11T11:02:10", latencyMs: 1840, tokensIn: 3210, tokensOut: 412, status: "Success", redactedInput: "Match candidates [12 profiles: PII removed] to listing LST-8801 requirements …", redactedOutput: "Ranked 12 candidates; top factors: Figma (required), research experience …" },
  { id: "AIE-77119", feature: "CV & application tools", provider: "OpenAI", model: "gpt-4o-mini", account: "USR-10422", plan: "Free", at: "2025-06-11T10:58:44", latencyMs: 0, tokensIn: null, tokensOut: null, status: "Rate limited", error: "429 — provider rate limit (tokens per minute)", redactedInput: "[redacted — CV content]", redactedOutput: "—" },
  { id: "AIE-77118", feature: "Interview assessments", provider: "Anthropic", model: "claude-sonnet", account: "Accra CodeWorks", plan: "Growth", at: "2025-06-11T10:41:02", latencyMs: 6120, tokensIn: 5840, tokensOut: 1022, status: "Low confidence", redactedInput: "Assess answers for APP-30014 against rubric [answers redacted]", redactedOutput: "Confidence 0.41 — rubric coverage insufficient; recommend human review." },
  { id: "AIE-77117", feature: "Readiness & learning", provider: "Anthropic", model: "claude-haiku", account: "USR-10434", plan: "Free", at: "2025-06-11T10:30:19", latencyMs: 940, tokensIn: 1220, tokensOut: 640, status: "Success", redactedInput: "Generate learning plan for target role QA Engineer [profile redacted]", redactedOutput: "6-week plan: test design, automation basics …" },
  { id: "AIE-77116", feature: "Job description assistance", provider: "OpenAI", model: "gpt-4o", account: "NovaHealth Africa", plan: "Starter", at: "2025-06-11T10:12:55", latencyMs: 0, tokensIn: 2100, tokensOut: null, status: "Failed", error: "Upstream timeout after 30s", redactedInput: "Draft listing for Junior Data Analyst …", redactedOutput: "—" },
];

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

export const MATCH_REVIEWS: MatchReview[] = [
  { id: "MTR-201", listing: "Product Design Intern (LST-8801)", candidate: "Halima Yusuf", score: 49, confidence: "Low", factors: [{ label: "Figma", weight: "Missing" }, { label: "Prototyping", weight: "Partial" }, { label: "Location (Lagos)", weight: "Missing" }], missingData: ["Portfolio link", "Design experience"], report: "Employer reports candidate appears irrelevant; profile is backend-focused.", status: "Reported inaccuracy" },
  { id: "MTR-202", listing: "Backend Engineer (LST-8805)", candidate: "Halima Yusuf", score: 91, confidence: "High", factors: [{ label: "Go", weight: "Strong" }, { label: "PostgreSQL", weight: "Strong" }, { label: "gRPC", weight: "Partial" }], missingData: [], status: "Reviewed" },
  { id: "MTR-203", listing: "Retail Analytics Intern (LST-8809)", candidate: "Ibrahim Musa", score: 63, confidence: "Low", factors: [{ label: "SQL", weight: "Partial" }, { label: "Excel", weight: "Partial" }], missingData: ["Education", "Skills assessment", "Work history"], status: "Low confidence" },
  { id: "MTR-204", listing: "Logistics Operations Intern (LST-8804)", candidate: "Grace Akpan", score: 71, confidence: "Medium", factors: [{ label: "Excel", weight: "Strong" }, { label: "Fleet ops", weight: "Missing" }], missingData: ["Location preference"], report: "Talent reports match explanation mentions skills not on profile.", status: "Reported inaccuracy" },
];
