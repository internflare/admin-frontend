export type Permission =
  | "dashboard.view"
  | "users.view"
  | "users.manage"
  | "users.pii"
  | "companies.view"
  | "companies.verify"
  | "mentors.manage"
  | "supervisors.manage"
  | "listings.view"
  | "listings.moderate"
  | "recruitment.view"
  | "placements.manage"
  | "workspaces.view"
  | "workspaces.manage"
  | "finance.view"
  | "finance.manage"
  | "plans.manage"
  | "integrations.view"
  | "integrations.manage"
  | "ai.view"
  | "ai.sensitive"
  | "notifications.manage"
  | "support.view"
  | "support.manage"
  | "disputes.manage"
  | "audit.view"
  | "analytics.view"
  | "analytics.export"
  | "system.manage";

export type AdminRoleId =
  | "super_admin"
  | "user_ops"
  | "listing_moderator"
  | "finance"
  | "workspace_ops"
  | "supervision_coord"
  | "support"
  | "auditor";

export interface AdminRoleDefinition {
  id: AdminRoleId;
  label: string;
  description: string;
  permissions: Permission[];
}

const ALL: Permission[] = [
  "dashboard.view", "users.view", "users.manage", "users.pii", "companies.view",
  "companies.verify", "mentors.manage", "supervisors.manage", "listings.view",
  "listings.moderate", "recruitment.view", "placements.manage", "workspaces.view",
  "workspaces.manage", "finance.view", "finance.manage", "plans.manage",
  "integrations.view", "integrations.manage", "ai.view", "ai.sensitive",
  "notifications.manage", "support.view", "support.manage", "disputes.manage",
  "audit.view", "analytics.view", "analytics.export", "system.manage",
];

export const ADMIN_ROLES: AdminRoleDefinition[] = [
  {
    id: "super_admin",
    label: "Super administrator",
    description: "Full platform access, including system and admin role configuration.",
    permissions: ALL,
  },
  {
    id: "user_ops",
    label: "User & company operations",
    description: "Accounts, companies, verification and access assistance.",
    permissions: ["dashboard.view", "users.view", "users.manage", "users.pii", "companies.view", "companies.verify", "mentors.manage", "support.view", "audit.view"],
  },
  {
    id: "listing_moderator",
    label: "Recruitment & listing moderator",
    description: "Listings, moderation, applications and external opportunities.",
    permissions: ["dashboard.view", "listings.view", "listings.moderate", "recruitment.view", "companies.view", "integrations.view", "support.view"],
  },
  {
    id: "finance",
    label: "Finance & subscriptions",
    description: "Plans, subscriptions, transactions and reconciliation.",
    permissions: ["dashboard.view", "finance.view", "finance.manage", "plans.manage", "companies.view", "users.view", "analytics.view", "audit.view"],
  },
  {
    id: "workspace_ops",
    label: "Workspace operations",
    description: "SquadCot workspaces, engagements, membership and access issues.",
    permissions: ["dashboard.view", "workspaces.view", "workspaces.manage", "placements.manage", "recruitment.view", "companies.view", "users.view", "support.view"],
  },
  {
    id: "supervision_coord",
    label: "Supervisor & mentorship coordinator",
    description: "Supervisor assignments, mentors and readiness programmes.",
    permissions: ["dashboard.view", "supervisors.manage", "mentors.manage", "workspaces.view", "users.view", "companies.view"],
  },
  {
    id: "support",
    label: "Support & disputes",
    description: "Support inbox, disputes, escalations and notifications.",
    permissions: ["dashboard.view", "support.view", "support.manage", "disputes.manage", "notifications.manage", "users.view", "companies.view", "workspaces.view", "listings.view"],
  },
  {
    id: "auditor",
    label: "Analytics / read-only auditor",
    description: "Read-only analytics and audit logs. No write actions.",
    permissions: ["dashboard.view", "analytics.view", "audit.view", "users.view", "companies.view", "listings.view", "recruitment.view", "workspaces.view", "finance.view", "integrations.view", "ai.view", "support.view"],
  },
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "dashboard.view": "View dashboards",
  "users.view": "View user accounts",
  "users.manage": "Restrict / restore accounts",
  "users.pii": "View personal contact data",
  "companies.view": "View companies",
  "companies.verify": "Decide company verification",
  "mentors.manage": "Manage mentors",
  "supervisors.manage": "Assign supervisors",
  "listings.view": "View listings",
  "listings.moderate": "Moderate listings",
  "recruitment.view": "View recruitment records",
  "placements.manage": "Investigate placements",
  "workspaces.view": "View workspaces",
  "workspaces.manage": "Restore workspace access",
  "finance.view": "View finance records",
  "finance.manage": "Record reconciliation outcomes",
  "plans.manage": "Configure plans & entitlements",
  "integrations.view": "View integrations",
  "integrations.manage": "Retry / configure integrations",
  "ai.view": "View AI usage",
  "ai.sensitive": "View redacted AI payloads",
  "notifications.manage": "Manage notifications",
  "support.view": "View support tickets",
  "support.manage": "Resolve support tickets",
  "disputes.manage": "Decide disputes",
  "audit.view": "View audit logs",
  "analytics.view": "View analytics",
  "analytics.export": "Export reports",
  "system.manage": "Manage system settings & admins",
};
