export type Priority = "Critical" | "High" | "Medium" | "Low";

export interface ActionItem {
  id: string;
  priority: Priority;
  recordType: string;
  recordRef: string;
  summary: string;
  createdAt: string;
  assignee: string | null;
  status: "Open" | "In progress" | "Awaiting info" | "Resolved";
  nextAction: string;
  href: string;
}

export const ACTION_QUEUE: ActionItem[] = [
  { id: "AQ-001", priority: "Critical", recordType: "Integration", recordRef: "SRC-JOO", summary: "Jooble sync failing for 48h — credentials rejected (401)", createdAt: "2025-06-09T09:00:00", assignee: "Ifeanyi Obi", status: "In progress", nextAction: "Rotate API credentials", href: "/integrations/SRC-JOO" },
  { id: "AQ-002", priority: "High", recordType: "Listing", recordRef: "LST-8812", summary: "Listing reported 4× — off-platform WhatsApp contact", createdAt: "2025-06-10T20:10:00", assignee: null, status: "Open", nextAction: "Review and pause listing", href: "/listings/LST-8812" },
  { id: "AQ-003", priority: "High", recordType: "Company verification", recordRef: "VER-5101", summary: "NovaHealth Africa verification pending 7 days", createdAt: "2025-06-04T10:20:00", assignee: "Adaeze Okafor", status: "In progress", nextAction: "Complete checklist", href: "/verification/VER-5101" },
  { id: "AQ-004", priority: "High", recordType: "Workspace", recordRef: "WAI-501", summary: "Hired intern without SquadCot access (ENG-6102)", createdAt: "2025-06-09T11:05:00", assignee: null, status: "Open", nextAction: "Investigate provisioning failure", href: "/workspaces/WSP-301" },
  { id: "AQ-005", priority: "High", recordType: "Transaction", recordRef: "TXN-7f3a95", summary: "Settlement mismatch ₦1,800 on stipend payment", createdAt: "2025-05-29T02:00:00", assignee: "Ifeanyi Obi", status: "In progress", nextAction: "Record reconciliation outcome", href: "/transactions?ref=TXN-7f3a95" },
  { id: "AQ-006", priority: "Medium", recordType: "Listing", recordRef: "LST-8808", summary: "Broken external application URL (HTTP 404)", createdAt: "2025-06-10T03:00:00", assignee: null, status: "Open", nextAction: "Deactivate per sync rules", href: "/listings/LST-8808" },
  { id: "AQ-007", priority: "Medium", recordType: "Supervisor request", recordRef: "SRQ-802", summary: "Kora Fintech requests supervisor for ENG-6102", createdAt: "2025-06-08T13:20:00", assignee: null, status: "Open", nextAction: "Assign supervisor", href: "/supervisors" },
  { id: "AQ-008", priority: "Medium", recordType: "Support ticket", recordRef: "TCK-2207", summary: "Escalated: employer charged twice for Growth plan", createdAt: "2025-06-10T12:00:00", assignee: "Kemi Alabi", status: "Awaiting info", nextAction: "Confirm provider refund status", href: "/support/TCK-2207" },
  { id: "AQ-009", priority: "Medium", recordType: "Transaction", recordRef: "TXN-7f3a98", summary: "Webhook signature failure on renewal charge", createdAt: "2025-06-11T06:00:08", assignee: null, status: "Open", nextAction: "Verify via provider API", href: "/reconciliation" },
  { id: "AQ-010", priority: "Low", recordType: "Metric anomaly", recordRef: "AI-COST", summary: "AI failed requests spiked 2.6× on 4 Jun", createdAt: "2025-06-04T23:59:00", assignee: null, status: "Open", nextAction: "Review provider error logs", href: "/ai-usage" },
  { id: "AQ-011", priority: "Low", recordType: "Dispute", recordRef: "DSP-604", summary: "Engagement payment dispute — awaiting evidence", createdAt: "2025-06-07T09:00:00", assignee: "Kemi Alabi", status: "Awaiting info", nextAction: "Request evidence from talent", href: "/disputes" },
  { id: "AQ-012", priority: "Low", recordType: "Evidence", recordRef: "EVD-403", summary: "Reported certificate cannot be verified at issuer", createdAt: "2025-06-01T10:00:00", assignee: null, status: "Open", nextAction: "Review evidence", href: "/talent-oversight/portfolio" },
  { id: "AQ-013", priority: "Medium", recordType: "Notification", recordRef: "NTF-FAIL", summary: "38 verification emails bounced in 24h", createdAt: "2025-06-11T07:00:00", assignee: null, status: "Open", nextAction: "Inspect failed delivery queue", href: "/notifications" },
  { id: "AQ-014", priority: "Low", recordType: "Company verification", recordRef: "VER-5102", summary: "Savanna Agro submission partially complete", createdAt: "2025-06-05T14:02:00", assignee: null, status: "Open", nextAction: "Request more information", href: "/verification/VER-5102" },
];

export type TicketStatus =
  | "Open"
  | "In review"
  | "Awaiting information"
  | "Escalated"
  | "Resolved"
  | "Closed";

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  area: "internflareJobs" | "SquadCot" | "Billing" | "Account";
  priority: Priority;
  status: TicketStatus;
  requester: string;
  requesterId: string;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  related: { label: string; href: string }[];
  messages: { id: string; author: string; kind: "customer" | "agent" | "internal"; body: string; at: string }[];
}

export const TICKETS: SupportTicket[] = [
  { id: "TCK-2207", subject: "We were charged twice for the Growth plan", category: "Billing", area: "Billing", priority: "High", status: "Escalated", requester: "Ama Owusu (Accra CodeWorks)", requesterId: "CMP-2006", assignee: "Kemi Alabi", createdAt: "2025-06-10T12:00:00", updatedAt: "2025-06-11T09:12:00", related: [{ label: "SUB-40009", href: "/subscriptions/SUB-40009" }, { label: "TXN-7f3a96", href: "/transactions?ref=TXN-7f3a96" }], messages: [{ id: "m1", author: "Ama Owusu", kind: "customer", body: "Our card statement shows two ₦30,000 charges on 10 May. Please refund one.", at: "2025-06-10T12:00:00" }, { id: "m2", author: "Kemi Alabi", kind: "agent", body: "Thanks Ama — we've escalated this to Finance and will confirm once the provider confirms the refund.", at: "2025-06-10T13:10:00" }, { id: "m3", author: "Kemi Alabi", kind: "internal", body: "Refund TXN-7f3a96 shows verified refund webhook. Need to confirm whether second charge exists at Paystack.", at: "2025-06-11T09:12:00" }] },
  { id: "TCK-2206", subject: "I accepted the offer but can't open SquadCot", category: "Workspace access", area: "SquadCot", priority: "High", status: "In review", requester: "Tunde Bakare", requesterId: "USR-10422", assignee: "Adaeze Okafor", createdAt: "2025-06-10T09:40:00", updatedAt: "2025-06-10T15:00:00", related: [{ label: "ENG-6102", href: "/placements" }, { label: "WSP-301", href: "/workspaces/WSP-301" }], messages: [{ id: "m1", author: "Tunde Bakare", kind: "customer", body: "I start on 16 June and the workspace says I don't have access.", at: "2025-06-10T09:40:00" }, { id: "m2", author: "Adaeze Okafor", kind: "internal", body: "Provisioning failed — seat limit. Workspace ops looking at entitlement.", at: "2025-06-10T15:00:00" }] },
  { id: "TCK-2205", subject: "Listing asked me to pay a registration fee", category: "Fraud report", area: "internflareJobs", priority: "Critical", status: "Resolved", requester: "Grace Akpan", requesterId: "USR-10434", assignee: "Kemi Alabi", createdAt: "2025-06-01T08:00:00", updatedAt: "2025-06-01T11:00:00", related: [{ label: "LST-8803", href: "/listings/LST-8803" }], messages: [{ id: "m1", author: "Grace Akpan", kind: "customer", body: "The recruiter wants ₦5,000 before the interview.", at: "2025-06-01T08:00:00" }, { id: "m2", author: "Kemi Alabi", kind: "agent", body: "Thank you for reporting. The listing has been paused while we review it. Never pay to apply.", at: "2025-06-01T11:00:00" }] },
  { id: "TCK-2204", subject: "Verification documents re-upload", category: "Verification", area: "Account", priority: "Medium", status: "Awaiting information", requester: "Tobi Ade (Lumen Studio)", requesterId: "CMP-2004", assignee: "Ifeanyi Obi", createdAt: "2025-05-21T10:00:00", updatedAt: "2025-06-02T10:00:00", related: [{ label: "VER-5103", href: "/verification/VER-5103" }], messages: [{ id: "m1", author: "Tobi Ade", kind: "customer", body: "Which documents do you need?", at: "2025-05-21T10:00:00" }] },
  { id: "TCK-2203", subject: "Weekly report not linked to supervisor", category: "Reports", area: "SquadCot", priority: "Low", status: "Open", requester: "Zainab Lawal", requesterId: "USR-10432", assignee: null, createdAt: "2025-06-09T08:00:00", updatedAt: "2025-06-09T08:00:00", related: [{ label: "WSP-305", href: "/workspaces/WSP-305" }], messages: [{ id: "m1", author: "Zainab Lawal", kind: "customer", body: "My report shows 'no reviewer'.", at: "2025-06-09T08:00:00" }] },
  { id: "TCK-2202", subject: "Can't download receipt", category: "Billing", area: "Billing", priority: "Low", status: "Closed", requester: "Halima Yusuf", requesterId: "USR-10429", assignee: "Kemi Alabi", createdAt: "2025-05-30T08:00:00", updatedAt: "2025-05-31T08:00:00", related: [{ label: "SUB-40002", href: "/subscriptions/SUB-40002" }], messages: [{ id: "m1", author: "Halima Yusuf", kind: "customer", body: "Receipt link errors.", at: "2025-05-30T08:00:00" }] },
];

export interface Dispute {
  id: string;
  category: "Listing or account" | "Hiring or engagement" | "Task or submission" | "Paid test task" | "Payment" | "Workspace access";
  parties: string;
  related: string;
  amount?: number;
  status: TicketStatus;
  openedAt: string;
  updatedAt: string;
  owner: string | null;
  evidence: number;
  decision?: string;
}

export const DISPUTES: Dispute[] = [
  { id: "DSP-604", category: "Payment", parties: "EduBridge Labs ↔ Zainab Lawal", related: "TXN-7f3a97", amount: 80000, status: "Awaiting information", openedAt: "2025-06-07T09:00:00", updatedAt: "2025-06-10T09:00:00", owner: "Kemi Alabi", evidence: 3 },
  { id: "DSP-603", category: "Paid test task", parties: "Accra CodeWorks ↔ Halima Yusuf", related: "APP-30014", amount: 1200, status: "In review", openedAt: "2025-06-06T09:00:00", updatedAt: "2025-06-09T09:00:00", owner: "Kemi Alabi", evidence: 2 },
  { id: "DSP-602", category: "Hiring or engagement", parties: "Zuri Retail Group ↔ Aisha Bello", related: "ENG-6106", status: "Resolved", openedAt: "2025-04-11T09:00:00", updatedAt: "2025-05-02T09:00:00", owner: "Adaeze Okafor", evidence: 5, decision: "Early termination upheld; completion record not issued." },
  { id: "DSP-601", category: "Listing or account", parties: "QuickHire Global ↔ Internflare", related: "CMP-2007", status: "Closed", openedAt: "2025-06-01T09:00:00", updatedAt: "2025-06-04T09:00:00", owner: "Adaeze Okafor", evidence: 4, decision: "Verification rejection maintained." },
  { id: "DSP-605", category: "Workspace access", parties: "Kora Fintech Ltd ↔ Tunde Bakare", related: "WSP-301", status: "Open", openedAt: "2025-06-11T09:00:00", updatedAt: "2025-06-11T09:00:00", owner: null, evidence: 1 },
  { id: "DSP-606", category: "Task or submission", parties: "Bright Logistics ↔ Grace Akpan", related: "PRJ-903", status: "Escalated", openedAt: "2025-06-10T09:00:00", updatedAt: "2025-06-11T07:00:00", owner: "Kemi Alabi", evidence: 2 },
];

export interface NotificationTemplate {
  id: string;
  name: string;
  event: string;
  channel: "Email" | "In-app" | "SMS" | "WhatsApp";
  status: "Active" | "Draft" | "Disabled" | "Not configured";
  updatedAt: string;
  sent30d: number;
  failureRate: number | null;
  subject: string;
  body: string;
}

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  { id: "TPL-registration", name: "Welcome & verify email", event: "Registration", channel: "Email", status: "Active", updatedAt: "2025-05-10", sent30d: 3120, failureRate: 1.2, subject: "Welcome to Internflare, {{first_name}}", body: "Hi {{first_name}},\n\nConfirm your email to finish setting up your Internflare account.\n\n{{verify_link}}" },
  { id: "TPL-verification", name: "Company verification decision", event: "Verification", channel: "Email", status: "Active", updatedAt: "2025-04-02", sent30d: 214, failureRate: 17.8, subject: "Your company verification: {{decision}}", body: "Hello {{representative}},\n\nYour verification for {{company}} is now {{decision}}.\n\n{{next_steps}}" },
  { id: "TPL-application", name: "Application status update", event: "Applications", channel: "In-app", status: "Active", updatedAt: "2025-03-11", sent30d: 9800, failureRate: 0, subject: "Application update", body: "Your application for {{listing}} moved to {{stage}}." },
  { id: "TPL-interview", name: "Interview request", event: "Interviews", channel: "Email", status: "Active", updatedAt: "2025-05-21", sent30d: 1180, failureRate: 0.8, subject: "Interview request from {{company}}", body: "{{company}} would like to interview you for {{listing}} on {{date}}." },
  { id: "TPL-offer", name: "Offer issued", event: "Offers", channel: "Email", status: "Active", updatedAt: "2025-05-21", sent30d: 96, failureRate: 0, subject: "You have an offer from {{company}}", body: "Congratulations! Review and respond to your offer: {{offer_link}}" },
  { id: "TPL-task", name: "Task assigned", event: "Tasks", channel: "In-app", status: "Active", updatedAt: "2025-02-19", sent30d: 14320, failureRate: 0, subject: "New task", body: "{{assigner}} assigned you “{{task}}” due {{due}}." },
  { id: "TPL-payment", name: "Payment receipt", event: "Payments", channel: "Email", status: "Active", updatedAt: "2025-05-02", sent30d: 1740, failureRate: 0.4, subject: "Receipt {{reference}}", body: "We've received your payment of {{amount}}. Reference: {{reference}}." },
  { id: "TPL-mentor", name: "Mentor booking confirmed", event: "Mentorship", channel: "Email", status: "Draft", updatedAt: "2025-06-06", sent30d: 0, failureRate: null, subject: "Your session with {{mentor}}", body: "Your session is booked for {{date}}." },
  { id: "TPL-sms", name: "Interview reminder (SMS)", event: "Interviews", channel: "SMS", status: "Not configured", updatedAt: "—", sent30d: 0, failureRate: null, subject: "—", body: "SMS provider not configured." },
];

export interface NotificationEvent {
  id: string;
  template: string;
  recipient: string;
  channel: "Email" | "In-app";
  at: string;
  status: "Delivered" | "Bounced" | "Failed" | "Queued" | "Opened";
  error?: string;
}

export const NOTIFICATION_EVENTS: NotificationEvent[] = [
  { id: "NEV-90021", template: "Company verification decision", recipient: "musa@savannaagro.ng", channel: "Email", at: "2025-06-11T07:01:00", status: "Bounced", error: "550 5.1.1 mailbox does not exist" },
  { id: "NEV-90020", template: "Welcome & verify email", recipient: "grace.akpan@gmail.com", channel: "Email", at: "2025-06-11T06:40:00", status: "Opened" },
  { id: "NEV-90019", template: "Task assigned", recipient: "USR-10432", channel: "In-app", at: "2025-06-11T06:30:00", status: "Delivered" },
  { id: "NEV-90018", template: "Interview request", recipient: "chiamaka.eze@gmail.com", channel: "Email", at: "2025-06-10T14:00:10", status: "Delivered" },
  { id: "NEV-90017", template: "Company verification decision", recipient: "bola@heliosenergy.ng", channel: "Email", at: "2025-06-10T12:00:00", status: "Failed", error: "Provider timeout (retry exhausted)" },
  { id: "NEV-90016", template: "Payment receipt", recipient: "ngozi@korafintech.com", channel: "Email", at: "2025-06-01T09:00:25", status: "Delivered" },
  { id: "NEV-90015", template: "Welcome & verify email", recipient: "s.okon@brightlogistics.ng", channel: "Email", at: "2025-06-10T12:00:01", status: "Bounced", error: "552 mailbox full" },
];

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  actorType: "Admin" | "System" | "User";
  action: string;
  entityType: string;
  entity: string;
  previous?: string;
  next?: string;
  reason?: string;
  correlationId: string;
  outcome: "Success" | "Denied" | "Failed";
}

export const AUDIT_EVENTS: AuditEvent[] = [
  { id: "AUD-58821", at: "2025-06-11T11:04:00", actor: "Adaeze Okafor", actorType: "Admin", action: "verification.checklist_updated", entityType: "Company verification", entity: "VER-5101", previous: "2/6 passed", next: "3/6 passed", correlationId: "req_8f21c7", outcome: "Success" },
  { id: "AUD-58820", at: "2025-06-11T10:52:00", actor: "Kemi Alabi", actorType: "Admin", action: "ticket.escalated", entityType: "Support ticket", entity: "TCK-2207", previous: "In review", next: "Escalated", reason: "Requires Finance confirmation of duplicate charge", correlationId: "req_8f20aa", outcome: "Success" },
  { id: "AUD-58819", at: "2025-06-11T09:31:00", actor: "Musa Ibrahim", actorType: "Admin", action: "finance.adjustment_attempted", entityType: "Transaction", entity: "TXN-7f3a95", reason: "Attempted to mark settlement mismatch resolved", correlationId: "req_8f1e02", outcome: "Denied" },
  { id: "AUD-58818", at: "2025-06-11T09:00:04", actor: "System", actorType: "System", action: "integration.sync_failed", entityType: "External source", entity: "SRC-JOO", next: "Failing", reason: "401 Unauthorized", correlationId: "sync_20930", outcome: "Failed" },
  { id: "AUD-58817", at: "2025-06-10T20:30:00", actor: "Ifeanyi Obi", actorType: "Admin", action: "listing.paused", entityType: "Listing", entity: "LST-8803", previous: "Published", next: "Paused", reason: "Upfront fee requested from applicants (fraud indicators)", correlationId: "req_8e9910", outcome: "Success" },
  { id: "AUD-58816", at: "2025-06-10T16:00:00", actor: "Adaeze Okafor", actorType: "Admin", action: "supervisor.assigned", entityType: "Supervisor assignment", entity: "SRQ-804", previous: "Pending", next: "Emeka Obi", reason: "Specialism match; capacity 4/6", correlationId: "req_8e7c31", outcome: "Success" },
  { id: "AUD-58815", at: "2025-06-10T15:04:00", actor: "System", actorType: "System", action: "subscription.entitlements_held", entityType: "Subscription", entity: "SUB-40003", next: "Pending payment confirmation", reason: "No verified charge.success event", correlationId: "wh_33a1", outcome: "Success" },
  { id: "AUD-58814", at: "2025-06-09T12:00:00", actor: "Adaeze Okafor", actorType: "Admin", action: "admin.role_changed", entityType: "Admin user", entity: "ADM-007", previous: "Support & disputes", next: "Analytics / read-only auditor", reason: "Team transfer", correlationId: "req_8d0021", outcome: "Success" },
  { id: "AUD-58813", at: "2025-06-03T10:00:00", actor: "Adaeze Okafor", actorType: "Admin", action: "user.restricted", entityType: "User account", entity: "USR-10427", previous: "Active", next: "Restricted", reason: "Identity document rejected — suspected alteration", correlationId: "req_8a1902", outcome: "Success" },
  { id: "AUD-58812", at: "2025-05-31T10:00:00", actor: "Adaeze Okafor", actorType: "Admin", action: "verification.rejected", entityType: "Company verification", entity: "VER-5105", previous: "Pending review", next: "Rejected", reason: "Registration number not found in registry; domain registered 2 days ago", correlationId: "req_8a0001", outcome: "Success" },
  { id: "AUD-58811", at: "2025-05-10T10:00:00", actor: "Ifeanyi Obi", actorType: "Admin", action: "finance.refund_requested", entityType: "Transaction", entity: "TXN-7f3a96", reason: "Duplicate charge confirmed by provider", correlationId: "req_7f9921", outcome: "Success" },
];
