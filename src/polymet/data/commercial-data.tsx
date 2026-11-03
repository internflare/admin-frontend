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
export type SubscriptionStatus = "Active" | "Pending payment confirmation" | "Past due" | "Cancelled" | "Cancels at period end" | "Expired";
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
export type TransactionCategory = "Subscription" | "Salary / stipend" | "Paid test task" | "Engagement payment" | "Platform fee" | "Refund" | "Dispute";
export type TransactionStatus = "Successful" | "Pending" | "Failed" | "Refunded" | "Disputed" | "Reversed";
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
