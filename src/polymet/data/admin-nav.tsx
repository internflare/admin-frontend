import {
  LayoutDashboardIcon,
  ActivityIcon,
  ListTodoIcon,
  UsersIcon,
  Building2Icon,
  BadgeCheckIcon,
  GraduationCapIcon,
  ShieldCheckIcon,
  KeyRoundIcon,
  BriefcaseIcon,
  FlagIcon,
  FileStackIcon,
  HandshakeIcon,
  FolderCheckIcon,
  BookOpenCheckIcon,
  GlobeIcon,
  LayoutGridIcon,
  UserCheckIcon,
  KanbanSquareIcon,
  FileBarChartIcon,
  ArrowRightLeftIcon,
  DoorOpenIcon,
  PackageIcon,
  RepeatIcon,
  ReceiptIcon,
  ScaleIcon,
  TrendingUpIcon,
  PlugIcon,
  RefreshCwIcon,
  CopyXIcon,
  SparklesIcon,
  TargetIcon,
  BellIcon,
  LifeBuoyIcon,
  GavelIcon,
  SirenIcon,
  ScrollTextIcon,
  BarChart3Icon,
  SettingsIcon,
  UserCogIcon,
  ToggleRightIcon,
  LockIcon,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/polymet/data/admin-roles";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
  badge?: number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const ADMIN_NAV: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Executive dashboard", href: "/", icon: LayoutDashboardIcon, permission: "dashboard.view" },
      { title: "Operational health", href: "/health", icon: ActivityIcon, permission: "dashboard.view" },
      { title: "Alerts & action queue", href: "/action-queue", icon: ListTodoIcon, permission: "dashboard.view", badge: 14 },
    ],
  },
  {
    title: "People & organisations",
    items: [
      { title: "Talent & user accounts", href: "/users", icon: UsersIcon, permission: "users.view" },
      { title: "Employers & companies", href: "/companies", icon: Building2Icon, permission: "companies.view" },
      { title: "Company verification", href: "/verification", icon: BadgeCheckIcon, permission: "companies.verify", badge: 6 },
      { title: "Mentors", href: "/mentors", icon: GraduationCapIcon, permission: "mentors.manage" },
      { title: "Supervisors", href: "/supervisors", icon: ShieldCheckIcon, permission: "supervisors.manage", badge: 3 },
      { title: "Invitations & access", href: "/access", icon: KeyRoundIcon, permission: "users.manage" },
    ],
  },
  {
    title: "internflareJobs",
    items: [
      { title: "Jobs & internships", href: "/listings", icon: BriefcaseIcon, permission: "listings.view" },
      { title: "Listing moderation", href: "/listings/moderation", icon: FlagIcon, permission: "listings.moderate", badge: 9 },
      { title: "Applications & recruitment", href: "/applications", icon: FileStackIcon, permission: "recruitment.view" },
      { title: "Placements & outcomes", href: "/placements", icon: HandshakeIcon, permission: "recruitment.view" },
      { title: "Portfolio & evidence", href: "/talent-oversight/portfolio", icon: FolderCheckIcon, permission: "users.manage" },
      { title: "Readiness & learning", href: "/talent-oversight/readiness", icon: BookOpenCheckIcon, permission: "users.view" },
      { title: "External opportunities", href: "/listings/external", icon: GlobeIcon, permission: "listings.view" },
    ],
  },
  {
    title: "SquadCot",
    items: [
      { title: "Company workspaces", href: "/workspaces", icon: LayoutGridIcon, permission: "workspaces.view" },
      { title: "Engagements & placements", href: "/engagements", icon: UserCheckIcon, permission: "workspaces.view" },
      { title: "Projects & tasks", href: "/workspace-activity/projects", icon: KanbanSquareIcon, permission: "workspaces.view" },
      { title: "Reports & performance", href: "/workspace-activity/reports", icon: FileBarChartIcon, permission: "workspaces.view" },
      { title: "Onboarding & handovers", href: "/workspace-activity/onboarding", icon: ArrowRightLeftIcon, permission: "workspaces.view" },
      { title: "Access & membership issues", href: "/workspaces/access-issues", icon: DoorOpenIcon, permission: "workspaces.manage", badge: 4 },
    ],
  },
  {
    title: "Commercial",
    items: [
      { title: "Plans & entitlements", href: "/plans", icon: PackageIcon, permission: "finance.view" },
      { title: "Subscriptions", href: "/subscriptions", icon: RepeatIcon, permission: "finance.view" },
      { title: "Payments & transactions", href: "/transactions", icon: ReceiptIcon, permission: "finance.view" },
      { title: "Reconciliation", href: "/reconciliation", icon: ScaleIcon, permission: "finance.manage", badge: 5 },
      { title: "Revenue analytics", href: "/analytics/commercial", icon: TrendingUpIcon, permission: "finance.view" },
    ],
  },
  {
    title: "Integrations & AI",
    items: [
      { title: "External job sources", href: "/integrations", icon: PlugIcon, permission: "integrations.view" },
      { title: "API sync monitoring", href: "/integrations/sync", icon: RefreshCwIcon, permission: "integrations.view" },
      { title: "Import errors & duplicates", href: "/integrations/imports", icon: CopyXIcon, permission: "integrations.view" },
      { title: "AI usage & costs", href: "/ai-usage", icon: SparklesIcon, permission: "ai.view" },
      { title: "Matching & assessments", href: "/ai-usage/matching", icon: TargetIcon, permission: "ai.view" },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Notifications", href: "/notifications", icon: BellIcon, permission: "notifications.manage" },
      { title: "Support tickets", href: "/support", icon: LifeBuoyIcon, permission: "support.view", badge: 11 },
      { title: "Disputes", href: "/disputes", icon: GavelIcon, permission: "disputes.manage" },
      { title: "Reports & escalations", href: "/support/escalations", icon: SirenIcon, permission: "support.view" },
      { title: "Audit logs", href: "/audit-logs", icon: ScrollTextIcon, permission: "audit.view" },
      { title: "Analytics & reporting", href: "/analytics", icon: BarChart3Icon, permission: "analytics.view" },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Platform settings", href: "/settings", icon: SettingsIcon, permission: "system.manage" },
      { title: "Admin users & roles", href: "/settings/admins", icon: UserCogIcon, permission: "system.manage" },
      { title: "Feature availability", href: "/settings/features", icon: ToggleRightIcon, permission: "system.manage" },
      { title: "Security & configuration", href: "/settings/security", icon: LockIcon, permission: "system.manage" },
    ],
  },
];
