export const GROWTH_SERIES = [
  { month: "Jan", talents: 14820, employers: 512, applications: 8240, listings: 610 },
  { month: "Feb", talents: 15790, employers: 548, applications: 9120, listings: 655 },
  { month: "Mar", talents: 16920, employers: 590, applications: 10480, listings: 702 },
  { month: "Apr", talents: 17880, employers: 631, applications: 11020, listings: 744 },
  { month: "May", talents: 19140, employers: 688, applications: 12960, listings: 812 },
  { month: "Jun", talents: 20132, employers: 721, applications: 6110, listings: 838 },
];

export const REVENUE_SERIES = [
  { month: "Jan", mrr: 9.42, subscriptions: 1720, failed: 41 },
  { month: "Feb", mrr: 10.1, subscriptions: 1810, failed: 37 },
  { month: "Mar", mrr: 11.05, subscriptions: 1902, failed: 44 },
  { month: "Apr", mrr: 11.88, subscriptions: 1990, failed: 52 },
  { month: "May", mrr: 12.64, subscriptions: 2080, failed: 49 },
  { month: "Jun", mrr: 12.96, subscriptions: 2125, failed: 23 },
];

export const WORKSPACE_ACTIVITY_SERIES = [
  { week: "W18", completed: 812, overdue: 64, reports: 88 },
  { week: "W19", completed: 856, overdue: 71, reports: 90 },
  { week: "W20", completed: 901, overdue: 58, reports: 92 },
  { week: "W21", completed: 874, overdue: 77, reports: 86 },
  { week: "W22", completed: 940, overdue: 81, reports: 89 },
  { week: "W23", completed: 968, overdue: 92, reports: 84 },
];

export const IMPORT_HEALTH_SERIES = [
  { day: "Jun 5", imported: 412, failed: 9 },
  { day: "Jun 6", imported: 388, failed: 12 },
  { day: "Jun 7", imported: 401, failed: 8 },
  { day: "Jun 8", imported: 376, failed: 14 },
  { day: "Jun 9", imported: 298, failed: 41 },
  { day: "Jun 10", imported: 264, failed: 63 },
  { day: "Jun 11", imported: 154, failed: 641 },
];

export const RECRUITMENT_FUNNEL = [
  { stage: "Applications", value: 12960 },
  { stage: "Shortlisted", value: 2851 },
  { stage: "Interview requests", value: 1180 },
  { stage: "Offers", value: 214 },
  { stage: "Accepted / hired", value: 171 },
];

export const OUTCOME_FUNNEL = [
  { stage: "Internships started", value: 486 },
  { stage: "Completed", value: 402 },
  { stage: "Converted to employment", value: 133 },
];

export const SOURCE_PERFORMANCE = [
  { source: "Internal listings", applications: 10240, shortlistRate: 23.4, hires: 152 },
  { source: "Partner feed", applications: 640, shortlistRate: 18.1, hires: 9 },
  { source: "Adzuna (click-out)", applications: 1520, shortlistRate: null, hires: null },
  { source: "Jooble (click-out)", applications: 560, shortlistRate: null, hires: null },
];

export const HEALTH_SERVICES = [
  { name: "Core API", status: "Operational", latency: "142 ms p95", uptime: 99.98 },
  { name: "Authentication", status: "Operational", latency: "88 ms p95", uptime: 99.99 },
  { name: "SquadCot workspace service", status: "Degraded", latency: "910 ms p95", uptime: 99.71 },
  { name: "Workspace provisioning jobs", status: "Degraded", latency: "3 failures / 24h", uptime: 98.9 },
  { name: "Payment webhooks (Paystack)", status: "Operational", latency: "1 signature failure / 24h", uptime: 99.95 },
  { name: "Email delivery", status: "Degraded", latency: "4.1% bounce / 24h", uptime: 99.6 },
  { name: "External sync — Adzuna", status: "Degraded", latency: "Last run failed", uptime: 96.2 },
  { name: "External sync — Jooble", status: "Outage", latency: "401 since 9 Jun", uptime: 71.4 },
  { name: "AI providers", status: "Operational", latency: "2.4 s p95", uptime: 99.2 },
] as const;

export const ADMIN_USERS = [
  { id: "ADM-001", name: "Adaeze Okafor", email: "adaeze.okafor@internflare.com", role: "Super administrator", mfa: true, lastActive: "2025-06-11T11:04:00", status: "Active" },
  { id: "ADM-002", name: "Ifeanyi Obi", email: "ifeanyi.obi@internflare.com", role: "Finance & subscriptions", mfa: true, lastActive: "2025-06-11T10:40:00", status: "Active" },
  { id: "ADM-003", name: "Kemi Alabi", email: "kemi.alabi@internflare.com", role: "Support & disputes", mfa: true, lastActive: "2025-06-11T10:52:00", status: "Active" },
  { id: "ADM-004", name: "Musa Ibrahim", email: "musa.ibrahim@internflare.com", role: "Recruitment & listing moderator", mfa: false, lastActive: "2025-06-11T09:31:00", status: "Active" },
  { id: "ADM-005", name: "Bisola Martins", email: "bisola.martins@internflare.com", role: "Workspace operations", mfa: true, lastActive: "2025-06-09T15:00:00", status: "Active" },
  { id: "ADM-006", name: "Yemi Kalu", email: "yemi.kalu@internflare.com", role: "Supervisor & mentorship coordinator", mfa: true, lastActive: "2025-05-30T11:00:00", status: "Invited" },
  { id: "ADM-007", name: "Tobi Adeleke", email: "tobi.adeleke@internflare.com", role: "Analytics / read-only auditor", mfa: true, lastActive: "2025-06-10T08:00:00", status: "Active" },
];

export type FeatureState = "Enabled" | "Disabled" | "Planned" | "Awaiting configuration";

export const FEATURE_FLAGS: { key: string; name: string; area: string; state: FeatureState; note: string }[] = [
  { key: "jobs.marketplace", name: "Job & internship marketplace", area: "internflareJobs", state: "Enabled", note: "Live for all regions" },
  { key: "jobs.external_feeds", name: "External job imports", area: "Integrations", state: "Enabled", note: "Adzuna live; Jooble credentials invalid" },
  { key: "jobs.paid_test_tasks", name: "Paid test tasks", area: "internflareJobs", state: "Enabled", note: "Charges via Paystack/Flutterwave only" },
  { key: "squadcot.workspaces", name: "SquadCot workspaces", area: "SquadCot", state: "Enabled", note: "—" },
  { key: "squadcot.handover_ai", name: "AI handover summaries", area: "SquadCot", state: "Planned", note: "Not implemented" },
  { key: "commerce.platform_fee", name: "10% platform fee on eligible transactions", area: "Commercial", state: "Awaiting configuration", note: "Subject to commercial, gateway and legal/compliance readiness" },
  { key: "commerce.wallet", name: "Wallet funding", area: "Commercial", state: "Disabled", note: "Provider, legal and compliance requirements not confirmed" },
  { key: "commerce.escrow", name: "Escrow & fund holding", area: "Commercial", state: "Disabled", note: "Legal and compliance review outstanding" },
  { key: "commerce.payouts", name: "Payouts", area: "Commercial", state: "Disabled", note: "Payout provider not configured" },
  { key: "notify.sms", name: "SMS notifications", area: "Notifications", state: "Awaiting configuration", note: "Optional — not required for launch" },
  { key: "notify.whatsapp", name: "WhatsApp notifications", area: "Notifications", state: "Planned", note: "Optional — not required for launch" },
  { key: "mentors.paid_sessions", name: "Paid mentor sessions", area: "Mentorship", state: "Enabled", note: "Payment confirmation required before booking" },
  { key: "ai.interview_assessments", name: "AI interview assessments", area: "AI", state: "Enabled", note: "Advisory only — human decision required" },
];
