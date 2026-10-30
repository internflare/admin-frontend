export type PlanAudience = "Talent" | "Employer";

export interface EntitlementValue {
  key: string;
  label: string;
  unit: string;
  /** Configured limit. null = not configured yet (must be confirmed). "unlimited" allowed. */
  limit: number | "Unlimited" | null;
  source: "Documented in PRD" | "Configurable" | "Not specified";
}

export interface Plan {
  id: string;
  name: string;
  audience: PlanAudience;
  priceMonthly: number;
  currency: "NGN";
  status: "Active" | "Draft" | "Retired";
  effectiveFrom: string;
  activeSubscribers: number;
  entitlements: EntitlementValue[];
}

const talentEntitlements = (free: boolean): EntitlementValue[] => [
  { key: "applications", label: "Applications", unit: "per month", limit: free ? 10 : null, source: free ? "Documented in PRD" : "Not specified" },
  { key: "tracking_slots", label: "Application tracking slots", unit: "active", limit: free ? 5 : null, source: free ? "Documented in PRD" : "Not specified" },
  { key: "ai_requests", label: "AI tool requests", unit: "per month", limit: null, source: "Configurable" },
  { key: "readiness", label: "Readiness assessments", unit: "per month", limit: null, source: "Not specified" },
  { key: "premium_visibility", label: "Premium profile visibility", unit: "feature", limit: null, source: "Not specified" },
];

const employerEntitlements = (free: boolean): EntitlementValue[] => [
  { key: "listings", label: "Active listings", unit: "concurrent", limit: free ? 1 : null, source: free ? "Documented in PRD" : "Not specified" },
  { key: "applicant_views", label: "Applicant profile views", unit: "per month", limit: free ? 20 : null, source: free ? "Documented in PRD" : "Not specified" },
  { key: "interview_requests", label: "Interview requests", unit: "per month", limit: free ? 3 : null, source: free ? "Documented in PRD" : "Not specified" },
  { key: "workspace_members", label: "Workspace member allowance", unit: "seats", limit: null, source: "Configurable" },
  { key: "ai_requests", label: "AI tool requests", unit: "per month", limit: null, source: "Configurable" },
];

export const PLANS: Plan[] = [
  { id: "PLN-T0", name: "Free", audience: "Talent", priceMonthly: 0, currency: "NGN", status: "Active", effectiveFrom: "2024-06-01", activeSubscribers: 18240, entitlements: talentEntitlements(true) },
  { id: "PLN-T1", name: "Career", audience: "Talent", priceMonthly: 5000, currency: "NGN", status: "Active", effectiveFrom: "2024-06-01", activeSubscribers: 1384, entitlements: talentEntitlements(false) },
  { id: "PLN-T2", name: "Pro", audience: "Talent", priceMonthly: 15000, currency: "NGN", status: "Active", effectiveFrom: "2024-06-01", activeSubscribers: 412, entitlements: talentEntitlements(false) },
  { id: "PLN-T3", name: "Elite", audience: "Talent", priceMonthly: 30000, currency: "NGN", status: "Active", effectiveFrom: "2024-06-01", activeSubscribers: 96, entitlements: talentEntitlements(false) },
  { id: "PLN-E0", name: "Free", audience: "Employer", priceMonthly: 0, currency: "NGN", status: "Active", effectiveFrom: "2024-06-01", activeSubscribers: 612, entitlements: employerEntitlements(true) },
  { id: "PLN-E1", name: "Starter", audience: "Employer", priceMonthly: 10000, currency: "NGN", status: "Active", effectiveFrom: "2024-06-01", activeSubscribers: 148, entitlements: employerEntitlements(false) },
  { id: "PLN-E2", name: "Growth", audience: "Employer", priceMonthly: 30000, currency: "NGN", status: "Active", effectiveFrom: "2024-06-01", activeSubscribers: 64, entitlements: employerEntitlements(false) },
  { id: "PLN-E3", name: "Professional", audience: "Employer", priceMonthly: 100000, currency: "NGN", status: "Active", effectiveFrom: "2024-06-01", activeSubscribers: 21, entitlements: employerEntitlements(false) },
];

export type SubscriptionStatus =
  | "Active"
  | "Pending payment confirmation"
  | "Past due"
  | "Cancelled"
  | "Cancels at period end"
  | "Expired";

export interface Subscription {
  id: string;
  account: string;
  accountId: string;
  accountKind: "Talent" | "Company";
  plan: string;
  audience: PlanAudience;
  status: SubscriptionStatus;
  billingPeriod: "Monthly";
  amount: number;
  startedAt: string;
  renewsAt: string | null;
  paymentStatus: "Confirmed" | "Pending webhook" | "Failed" | "Refunded";
  entitlementsActive: boolean;
  history: { at: string; event: string; from?: string; to?: string; actor: string }[];
}

export const SUBSCRIPTIONS: Subscription[] = [
  { id: "SUB-40001", account: "Kora Fintech Ltd", accountId: "CMP-2001", accountKind: "Company", plan: "Growth", audience: "Employer", status: "Active", billingPeriod: "Monthly", amount: 30000, startedAt: "2024-10-01", renewsAt: "2025-07-01", paymentStatus: "Confirmed", entitlementsActive: true, history: [{ at: "2024-10-01T09:00:00", event: "Subscribed", to: "Starter", actor: "Ngozi Umeh" }, { at: "2025-02-01T09:00:00", event: "Upgraded", from: "Starter", to: "Growth", actor: "Ngozi Umeh" }, { at: "2025-06-01T09:00:00", event: "Renewed", to: "Growth", actor: "System (Paystack webhook)" }] },
  { id: "SUB-40002", account: "Halima Yusuf", accountId: "USR-10429", accountKind: "Talent", plan: "Elite", audience: "Talent", status: "Active", billingPeriod: "Monthly", amount: 30000, startedAt: "2025-01-05", renewsAt: "2025-07-05", paymentStatus: "Confirmed", entitlementsActive: true, history: [{ at: "2025-01-05T09:00:00", event: "Subscribed", to: "Pro", actor: "Halima Yusuf" }, { at: "2025-04-05T09:00:00", event: "Upgraded", from: "Pro", to: "Elite", actor: "Halima Yusuf" }] },
  { id: "SUB-40003", account: "NovaHealth Africa", accountId: "CMP-2002", accountKind: "Company", plan: "Starter", audience: "Employer", status: "Pending payment confirmation", billingPeriod: "Monthly", amount: 10000, startedAt: "2025-06-10", renewsAt: null, paymentStatus: "Pending webhook", entitlementsActive: false, history: [{ at: "2025-06-10T15:02:00", event: "Checkout started", to: "Starter", actor: "Kelechi Nwosu" }, { at: "2025-06-10T15:04:00", event: "Awaiting verified payment event", actor: "System" }] },
  { id: "SUB-40004", account: "Chiamaka Eze", accountId: "USR-10421", accountKind: "Talent", plan: "Pro", audience: "Talent", status: "Active", billingPeriod: "Monthly", amount: 15000, startedAt: "2024-12-12", renewsAt: "2025-06-12", paymentStatus: "Confirmed", entitlementsActive: true, history: [{ at: "2024-12-12T09:00:00", event: "Subscribed", to: "Pro", actor: "Chiamaka Eze" }] },
  { id: "SUB-40005", account: "Aisha Bello", accountId: "USR-10427", accountKind: "Talent", plan: "Career", audience: "Talent", status: "Past due", billingPeriod: "Monthly", amount: 5000, startedAt: "2025-03-01", renewsAt: "2025-06-01", paymentStatus: "Failed", entitlementsActive: false, history: [{ at: "2025-03-01T09:00:00", event: "Subscribed", to: "Career", actor: "Aisha Bello" }, { at: "2025-06-01T09:00:00", event: "Renewal payment failed", actor: "System (Paystack webhook)" }, { at: "2025-06-04T09:00:00", event: "Retry failed — insufficient funds", actor: "System" }] },
  { id: "SUB-40006", account: "Bright Logistics", accountId: "CMP-2003", accountKind: "Company", plan: "Professional", audience: "Employer", status: "Active", billingPeriod: "Monthly", amount: 100000, startedAt: "2024-05-01", renewsAt: "2025-07-01", paymentStatus: "Confirmed", entitlementsActive: true, history: [{ at: "2024-05-01T09:00:00", event: "Subscribed", to: "Professional", actor: "Samuel Okon" }] },
  { id: "SUB-40007", account: "Zainab Lawal", accountId: "USR-10432", accountKind: "Talent", plan: "Career", audience: "Talent", status: "Cancels at period end", billingPeriod: "Monthly", amount: 5000, startedAt: "2025-04-20", renewsAt: "2025-06-20", paymentStatus: "Confirmed", entitlementsActive: true, history: [{ at: "2025-04-20T09:00:00", event: "Subscribed", to: "Career", actor: "Zainab Lawal" }, { at: "2025-06-02T09:00:00", event: "Cancellation scheduled", actor: "Zainab Lawal" }] },
  { id: "SUB-40008", account: "EduBridge Labs", accountId: "CMP-2009", accountKind: "Company", plan: "Starter", audience: "Employer", status: "Active", billingPeriod: "Monthly", amount: 10000, startedAt: "2025-04-25", renewsAt: "2025-06-25", paymentStatus: "Confirmed", entitlementsActive: true, history: [{ at: "2025-04-25T09:00:00", event: "Subscribed", to: "Starter", actor: "Peter Ola" }] },
  { id: "SUB-40009", account: "Accra CodeWorks", accountId: "CMP-2006", accountKind: "Company", plan: "Growth", audience: "Employer", status: "Cancelled", billingPeriod: "Monthly", amount: 30000, startedAt: "2024-10-05", renewsAt: null, paymentStatus: "Refunded", entitlementsActive: false, history: [{ at: "2024-10-05T09:00:00", event: "Subscribed", to: "Growth", actor: "Ama Owusu" }, { at: "2025-05-10T09:00:00", event: "Cancelled — duplicate charge refunded", actor: "Finance (Ifeanyi Obi)" }] },
];

export type TransactionCategory =
  | "Subscription"
  | "Salary / stipend"
  | "Paid test task"
  | "Engagement payment"
  | "Platform fee"
  | "Refund"
  | "Dispute";

export type TransactionStatus =
  | "Successful"
  | "Pending"
  | "Failed"
  | "Refunded"
  | "Disputed"
  | "Reversed";

export interface Transaction {
  id: string;
  category: TransactionCategory;
  payer: string;
  payee: string;
  related?: string;
  gross: number;
  currency: "NGN" | "GHS";
  feeEligible: boolean;
  fee: number;
  net: number;
  provider: "Paystack" | "Flutterwave";
  providerRef: string;
  status: TransactionStatus;
  createdAt: string;
  webhook: "Verified" | "Awaiting" | "Signature failed" | "Not received";
  reconciliation: "Reconciled" | "Unreconciled" | "Mismatch" | "Pending";
  failureReason?: string;
  lifecycle: { at: string; event: string }[];
}

export const TRANSACTIONS: Transaction[] = [
  { id: "TXN-7f3a91", category: "Subscription", payer: "Kora Fintech Ltd", payee: "Internflare", related: "SUB-40001", gross: 30000, currency: "NGN", feeEligible: false, fee: 0, net: 30000, provider: "Paystack", providerRef: "PSK_9f2c1a8e71", status: "Successful", createdAt: "2025-06-01T09:00:12", webhook: "Verified", reconciliation: "Reconciled", lifecycle: [{ at: "2025-06-01T09:00:12", event: "Charge initiated" }, { at: "2025-06-01T09:00:19", event: "charge.success webhook verified" }, { at: "2025-06-02T02:00:00", event: "Matched in settlement report" }] },
  { id: "TXN-7f3a92", category: "Subscription", payer: "NovaHealth Africa", payee: "Internflare", related: "SUB-40003", gross: 10000, currency: "NGN", feeEligible: false, fee: 0, net: 10000, provider: "Paystack", providerRef: "PSK_1b77e0c9d2", status: "Pending", createdAt: "2025-06-10T15:03:40", webhook: "Awaiting", reconciliation: "Pending", lifecycle: [{ at: "2025-06-10T15:03:40", event: "Checkout completed by customer" }, { at: "2025-06-10T15:03:41", event: "Awaiting verified charge.success event" }] },
  { id: "TXN-7f3a93", category: "Paid test task", payer: "Accra CodeWorks", payee: "Halima Yusuf", related: "APP-30014", gross: 1200, currency: "GHS", feeEligible: true, fee: 120, net: 1080, provider: "Flutterwave", providerRef: "FLW-MOCK-88213", status: "Pending", createdAt: "2025-06-05T09:20:00", webhook: "Not received", reconciliation: "Unreconciled", lifecycle: [{ at: "2025-06-05T09:20:00", event: "Payment obligation created on task assignment" }, { at: "2025-06-05T09:21:00", event: "Charge initiated" }] },
  { id: "TXN-7f3a94", category: "Subscription", payer: "Aisha Bello", payee: "Internflare", related: "SUB-40005", gross: 5000, currency: "NGN", feeEligible: false, fee: 0, net: 0, provider: "Paystack", providerRef: "PSK_44ad0b2e10", status: "Failed", createdAt: "2025-06-04T09:00:00", webhook: "Verified", reconciliation: "Reconciled", failureReason: "Insufficient funds (issuer decline 51)", lifecycle: [{ at: "2025-06-04T09:00:00", event: "Renewal retry initiated" }, { at: "2025-06-04T09:00:06", event: "charge.failed webhook verified" }] },
  { id: "TXN-7f3a95", category: "Salary / stipend", payer: "Zuri Retail Group", payee: "Chiamaka Eze", related: "ENG-6103", gross: 120000, currency: "NGN", feeEligible: true, fee: 12000, net: 108000, provider: "Paystack", providerRef: "PSK_0c88aa71fe", status: "Successful", createdAt: "2025-05-28T12:00:00", webhook: "Verified", reconciliation: "Mismatch", lifecycle: [{ at: "2025-05-28T12:00:00", event: "Charge initiated" }, { at: "2025-05-28T12:00:09", event: "charge.success webhook verified" }, { at: "2025-05-29T02:00:00", event: "Settlement amount ₦118,200 differs from recorded gross" }] },
  { id: "TXN-7f3a96", category: "Refund", payer: "Internflare", payee: "Accra CodeWorks", related: "SUB-40009", gross: 30000, currency: "NGN", feeEligible: false, fee: 0, net: 30000, provider: "Paystack", providerRef: "PSK_RF_2210ab", status: "Refunded", createdAt: "2025-05-10T10:00:00", webhook: "Verified", reconciliation: "Reconciled", lifecycle: [{ at: "2025-05-10T10:00:00", event: "Refund requested by Finance (reason: duplicate charge)" }, { at: "2025-05-11T08:12:00", event: "refund.processed webhook verified" }] },
  { id: "TXN-7f3a97", category: "Engagement payment", payer: "EduBridge Labs", payee: "Zainab Lawal", related: "ENG-6107", gross: 80000, currency: "NGN", feeEligible: true, fee: 8000, net: 72000, provider: "Paystack", providerRef: "PSK_7e1d02cc4b", status: "Disputed", createdAt: "2025-06-03T14:00:00", webhook: "Verified", reconciliation: "Unreconciled", lifecycle: [{ at: "2025-06-03T14:00:00", event: "Charge initiated" }, { at: "2025-06-03T14:00:10", event: "charge.success webhook verified" }, { at: "2025-06-07T09:00:00", event: "Dispute DSP-604 opened by payer" }] },
  { id: "TXN-7f3a98", category: "Subscription", payer: "Chiamaka Eze", payee: "Internflare", related: "SUB-40004", gross: 15000, currency: "NGN", feeEligible: false, fee: 0, net: 15000, provider: "Paystack", providerRef: "PSK_ab9910e3c1", status: "Pending", createdAt: "2025-06-11T06:00:00", webhook: "Signature failed", reconciliation: "Pending", lifecycle: [{ at: "2025-06-11T06:00:00", event: "Renewal charge initiated" }, { at: "2025-06-11T06:00:08", event: "Webhook received — signature verification failed; not trusted" }] },
  { id: "TXN-7f3a99", category: "Subscription", payer: "Bright Logistics", payee: "Internflare", related: "SUB-40006", gross: 100000, currency: "NGN", feeEligible: false, fee: 0, net: 100000, provider: "Paystack", providerRef: "PSK_5520cc19ab", status: "Successful", createdAt: "2025-06-01T09:02:00", webhook: "Verified", reconciliation: "Unreconciled", lifecycle: [{ at: "2025-06-01T09:02:00", event: "Charge initiated" }, { at: "2025-06-01T09:02:07", event: "charge.success webhook verified" }] },
];

export const FEE_CONFIGURATION = {
  plannedRate: 10,
  status: "Planned — subject to commercial, gateway and legal/compliance confirmation",
  eligibleCategories: ["Salary / stipend", "Paid test task", "Engagement payment"] as TransactionCategory[],
  excludedCategories: ["Subscription", "Refund", "Dispute"] as TransactionCategory[],
};

export const RESTRICTED_FINANCE_CAPABILITIES = [
  { name: "Wallet funding", status: "Disabled", reason: "Provider and CBN licensing requirements not confirmed" },
  { name: "Escrow / fund holding", status: "Disabled", reason: "Legal and compliance review outstanding" },
  { name: "Payouts to talents", status: "Disabled", reason: "Payout provider not configured" },
];
