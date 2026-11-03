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
export type TicketStatus = "Open" | "In review" | "Awaiting information" | "Escalated" | "Resolved" | "Closed";
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
export interface NotificationEvent {
  id: string;
  template: string;
  recipient: string;
  channel: "Email" | "In-app";
  at: string;
  status: "Delivered" | "Bounced" | "Failed" | "Queued" | "Opened";
  error?: string;
}
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
