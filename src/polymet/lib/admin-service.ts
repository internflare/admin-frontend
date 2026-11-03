import { apiClient, ApiError, handleApiError } from "@/polymet/lib/api-client";
import type { Permission } from "@/polymet/data/admin-roles";

export type AdminRecord = Record<string, unknown>;
export type QueryParams = Record<string, string | number | undefined>;

export interface ResourceField {
  key: string;
  label: string;
  format?: "date" | "status" | "money";
  href?: (record: AdminRecord) => string | undefined;
}

export interface ResourceDefinition {
  title: string;
  endpoint: string;
  envelope: string;
  permission: Permission;
  alternativePermission?: Permission;
  fields: ResourceField[];
  paginated?: boolean;
  search?: boolean;
  detailPath?: string;
  note?: string;
  filters?: { key: string; label: string; options: string[] }[];
}

export interface CollectionResult {
  records: AdminRecord[];
  pagination?: { page: number; total: number; totalPages: number };
}

export function isRecord(value: unknown): value is AdminRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function recordId(record: AdminRecord): string {
  const id = record._id ?? record.id ?? record.key;
  return typeof id === "string" ? id : "";
}

export function fieldValue(record: AdminRecord, key: string): unknown {
  return key.split(".").reduce<unknown>((value, part) => isRecord(value) ? value[part] : undefined, record);
}

export function invalidResponse(endpoint: string): never {
  throw handleApiError(new ApiError(502, "Invalid API response", {
    message: `The API returned an invalid response for ${endpoint}. No data has been substituted.`,
  }));
}

export const resources = {
  users: {
    title: "Talent & user accounts", endpoint: "/users", envelope: "users", permission: "users.view",
    paginated: true, search: true, detailPath: "/users",
    fields: [{ key: "name", label: "Name" }, { key: "email", label: "Email (server-authorised)" }, { key: "role", label: "Account type" }, { key: "status", label: "Status", format: "status" }, { key: "emailVerified", label: "Email verified" }, { key: "createdAt", label: "Registered", format: "date" }],
    filters: [{ key: "status", label: "Status", options: ["Active", "Restricted", "Suspended", "Deactivated"] }, { key: "accountType", label: "Type", options: ["talent", "employer", "employee", "supervisor", "mentor"] }],
    note: "Identity, qualification, profile completeness, plan and last-active data are not supplied by the user API. Email verification is not identity verification.",
  },
  companies: {
    title: "Company directory", endpoint: "/companies", envelope: "companies", permission: "companies.view",
    paginated: true, search: true, detailPath: "/companies",
    fields: [{ key: "name", label: "Company" }, { key: "industry", label: "Industry" }, { key: "country", label: "Country" }, { key: "verification_status", label: "Verification", format: "status" }, { key: "representative_name", label: "Representative" }, { key: "created_at", label: "Registered", format: "date" }],
    filters: [{ key: "verificationStatus", label: "Verification", options: ["UNVERIFIED", "PENDING_REVIEW", "VERIFIED", "REJECTED"] }],
  },
  verification: {
    title: "Company verification", endpoint: "/verification", envelope: "queue", permission: "companies.view",
    paginated: true, detailPath: "/verification",
    fields: [{ key: "company.name", label: "Company" }, { key: "status", label: "Decision", format: "status" }, { key: "reviewer_id", label: "Reviewer ID" }, { key: "created_at", label: "Submitted", format: "date" }],
    filters: [{ key: "status", label: "Status", options: ["PENDING_REVIEW", "MORE_INFO_REQUIRED", "APPROVED", "REJECTED"] }],
    note: "By default the backend returns pending reviews and requests for more information. Choose a status to see completed decisions.",
  },
  listings: {
    title: "Jobs & internships", endpoint: "/listings", envelope: "listings", permission: "listings.view",
    paginated: true, search: true, detailPath: "/listings",
    fields: [{ key: "title", label: "Listing" }, { key: "company.name", label: "Company" }, { key: "external_company_name", label: "External company" }, { key: "source_type", label: "Source" }, { key: "opportunity_type", label: "Type" }, { key: "work_arrangement", label: "Arrangement" }, { key: "status", label: "Publication", format: "status" }, { key: "moderation_status", label: "Moderation", format: "status" }, { key: "created_at", label: "Created", format: "date" }],
    filters: [{ key: "moderationStatus", label: "Moderation", options: ["Pending", "Approved", "Rejected", "Flagged"] }],
    note: "The list API does not provide application totals, expiry dates or report counts. Publication status and moderation status are separate backend fields.",
  },
  applications: {
    title: "Applications", endpoint: "/applications", envelope: "applications", permission: "recruitment.view",
    paginated: true,
    fields: [{ key: "talent.name", label: "Candidate", href: (r) => typeof r.talent_id === "string" ? `/users/${encodeURIComponent(r.talent_id)}` : undefined }, { key: "opportunity.title", label: "Opportunity", href: (r) => typeof r.opportunity_id === "string" ? `/listings/${encodeURIComponent(r.opportunity_id)}` : undefined }, { key: "current_stage", label: "Stage", format: "status" }, { key: "ai_match_score", label: "Recorded match score" }, { key: "applied_at", label: "Applied", format: "date" }],
    filters: [{ key: "stage", label: "Stage", options: ["New", "Shortlisted", "Interview", "Offer", "Hired", "Rejected"] }],
    note: "Read-only oversight. Application stage changes and employer outreach are not implemented in the admin API.",
  },
  placements: {
    title: "Recorded hires & placements", endpoint: "/placements", envelope: "placements", permission: "recruitment.view", alternativePermission: "placements.manage",
    paginated: true,
    fields: [{ key: "talent.name", label: "Candidate" }, { key: "opportunity.title", label: "Opportunity" }, { key: "opportunity.external_company_name", label: "External company" }, { key: "current_stage", label: "Stage", format: "status" }, { key: "hired_at", label: "Hired at", format: "date" }],
    note: "These are applications whose recorded stage is Hired. Engagement completion, employment conversion, supervisor allocation and payment status are not supplied by this endpoint.",
  },
  workspaces: {
    title: "SquadCot workspaces", endpoint: "/workspaces", envelope: "workspaces", permission: "workspaces.view",
    paginated: true, search: true, detailPath: "/workspaces",
    fields: [{ key: "name", label: "Workspace" }, { key: "company_name", label: "Company" }, { key: "plan_tier", label: "Plan" }, { key: "seats_used", label: "Seats used" }, { key: "seat_quota", label: "Seat quota" }, { key: "status", label: "Status", format: "status" }, { key: "last_synced_at", label: "Last synced", format: "date" }],
    filters: [{ key: "status", label: "Status", options: ["Active", "Suspended", "Over_Quota", "Provisioning_Error"] }],
    note: "Member lists, projects, reports, onboarding and individual access issues are not exposed by the admin API.",
  },
  mentors: {
    title: "Mentor directory", endpoint: "/mentors", envelope: "mentors", permission: "mentors.manage", paginated: true, search: true,
    fields: [{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "status", label: "Account status", format: "status" }, { key: "createdAt", label: "Registered", format: "date" }],
    note: "Bookings, actual availability, ratings, assigned mentees and payouts are unavailable. The endpoint's baseline assignment counts are deliberately not displayed.",
  },
  supervisors: {
    title: "Supervisor directory", endpoint: "/supervisors", envelope: "supervisors", permission: "supervisors.manage", paginated: true, search: true,
    fields: [{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "status", label: "Account status", format: "status" }, { key: "createdAt", label: "Registered", format: "date" }],
    note: "Allocation requests, actual student counts, invitations and supervisor actions are unavailable. The endpoint's baseline student counts are deliberately not displayed.",
  },
  plans: {
    title: "Subscription plans", endpoint: "/plans", envelope: "plans", permission: "finance.view",
    fields: [{ key: "name", label: "Plan" }, { key: "audience", label: "Audience" }, { key: "priceMonthly", label: "Monthly price", format: "money" }, { key: "currency", label: "Currency" }, { key: "status", label: "Status", format: "status" }, { key: "entitlements", label: "Configured entitlements" }],
    note: "Read-only backend plan configuration. Price edits, plan assignment and entitlement changes are not implemented in the admin API.",
  },
  transactions: {
    title: "Transaction ledger", endpoint: "/finance/transactions", envelope: "transactions", permission: "finance.view", paginated: true, search: true,
    fields: [{ key: "id", label: "Transaction" }, { key: "payer", label: "Payer" }, { key: "payee", label: "Payee" }, { key: "category", label: "Category" }, { key: "gross", label: "Gross", format: "money" }, { key: "fee", label: "Fee", format: "money" }, { key: "net", label: "Net", format: "money" }, { key: "currency", label: "Currency" }, { key: "provider", label: "Provider" }, { key: "providerRef", label: "Provider reference" }, { key: "status", label: "Status", format: "status" }, { key: "createdAt", label: "Created", format: "date" }],
    filters: [{ key: "status", label: "Status", options: ["Successful", "Failed", "Pending", "Refunded", "Disputed", "Reversed"] }],
    note: "Refunds, receipt generation, payouts, escrow and wallet actions have no admin endpoints and are unavailable.",
  },
  reconciliation: {
    title: "Payment reconciliation", endpoint: "/finance/reconciliation", envelope: "reconciliations", permission: "finance.view", paginated: true,
    fields: [{ key: "id", label: "Record" }, { key: "transactionId", label: "Transaction" }, { key: "provider", label: "Provider" }, { key: "discrepancyType", label: "Discrepancy" }, { key: "ledgerAmount", label: "Ledger amount", format: "money" }, { key: "gatewayAmount", label: "Gateway amount", format: "money" }, { key: "variance", label: "Variance", format: "money" }, { key: "currency", label: "Currency" }, { key: "status", label: "Resolution", format: "status" }, { key: "detectedAt", label: "Detected", format: "date" }],
    filters: [{ key: "status", label: "Status", options: ["Unresolved", "Settled", "Written_Off", "Escalated"] }],
  },
  audit: {
    title: "Audit logs", endpoint: "/audit-logs", envelope: "logs", permission: "audit.view", paginated: true, search: true,
    fields: [{ key: "actorName", label: "Actor" }, { key: "action", label: "Action" }, { key: "entityType", label: "Entity type" }, { key: "entityId", label: "Entity ID" }, { key: "outcome", label: "Outcome", format: "status" }, { key: "reason", label: "Reason" }, { key: "createdAt", label: "Recorded", format: "date" }],
  },
  admins: {
    title: "Admin users & roles", endpoint: "/settings/admins", envelope: "admins", permission: "system.manage",
    fields: [{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "roleId", label: "Role" }, { key: "mfaEnabled", label: "MFA enabled" }, { key: "status", label: "Status", format: "status" }, { key: "lastActiveAt", label: "Last active", format: "date" }],
    note: "Administrator invitations are supported. Editing an existing administrator's role and revoking all sessions are not implemented.",
  },
  features: {
    title: "Feature availability", endpoint: "/settings/features", envelope: "flags", permission: "system.manage",
    fields: [{ key: "name", label: "Feature" }, { key: "key", label: "Key" }, { key: "area", label: "Area" }, { key: "state", label: "State", format: "status" }, { key: "isLocked", label: "Locked" }, { key: "note", label: "Note" }],
  },
} satisfies Record<string, ResourceDefinition>;

export async function fetchCollection(resource: ResourceDefinition, params: QueryParams = {}): Promise<CollectionResult> {
  const response = await apiClient.get<unknown>(resource.endpoint, { params });
  if (!isRecord(response) || response.success !== true) invalidResponse(resource.endpoint);
  const records = response[resource.envelope];
  if (!Array.isArray(records) || !records.every((record) => isRecord(record) && recordId(record))) {
    invalidResponse(resource.endpoint);
  }
  if (!resource.paginated) return { records };
  const pagination = response.pagination;
  if (!isRecord(pagination) || !Number.isInteger(pagination.page) || !Number.isInteger(pagination.total) ||
      !Number.isInteger(pagination.totalPages) || Number(pagination.page) < 1 ||
      Number(pagination.total) < 0 || Number(pagination.totalPages) < 1) invalidResponse(resource.endpoint);
  return { records, pagination: { page: Number(pagination.page), total: Number(pagination.total), totalPages: Number(pagination.totalPages) } };
}

export async function fetchDetail(endpoint: string, envelope: string): Promise<AdminRecord> {
  const response = await apiClient.get<unknown>(endpoint);
  if (!isRecord(response) || response.success !== true || !isRecord(response[envelope]) ||
      !recordId(response[envelope])) invalidResponse(endpoint);
  return response[envelope];
}

/** Companies/workspaces have no detail endpoint. Read the actual paginated directory, never a fixture. */
export async function findDirectoryRecord(resource: ResourceDefinition, id: string): Promise<AdminRecord> {
  if (!id) throw new Error("A record ID is required.");
  let page = 1;
  while (true) {
    const result = await fetchCollection(resource, { page, limit: 100 });
    const record = result.records.find((entry) => recordId(entry) === id);
    if (record) return record;
    if (!result.pagination || page >= result.pagination.totalPages) break;
    page++;
  }
  throw new Error(`The requested ${resource.title.toLowerCase()} record was not found.`);
}

export async function mutateAdmin(endpoint: string, payload: AdminRecord, method: "post" | "patch" = "post"): Promise<AdminRecord> {
  const response = await apiClient[method]<unknown>(endpoint, payload);
  if (!isRecord(response) || response.success !== true) invalidResponse(endpoint);
  return response;
}

export async function fetchHealth(): Promise<AdminRecord> {
  const response = await apiClient.get<unknown>("/health");
  if (!isRecord(response) || typeof response.status !== "string" ||
      typeof response.service !== "string" || typeof response.timestamp !== "string" ||
      !isRecord(response.dependencies)) invalidResponse("/health");
  return response;
}
