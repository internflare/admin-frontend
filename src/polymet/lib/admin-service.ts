/**
 * Admin service boundary. Every page reads data through these functions so the
 * sample data can be replaced with real admin API calls without touching UI.
 * All records returned here are clearly-identified SAMPLE data.
 */
import { USERS, COMPANIES, VERIFICATION_REQUESTS, MENTORS, MENTOR_BOOKINGS, SUPERVISORS, SUPERVISOR_REQUESTS, ACCESS_CASES, INVITATIONS } from "@/polymet/data/people-data";
import { LISTINGS, APPLICATIONS, PLACEMENTS, EVIDENCE, READINESS } from "@/polymet/data/jobs-data";
import { WORKSPACES, WORKSPACE_MEMBERS, WORKSPACE_PROJECTS, WORKSPACE_REPORTS, ONBOARDING, WORKSPACE_ACCESS_ISSUES } from "@/polymet/data/squadcot-data";
import { PLANS, SUBSCRIPTIONS, TRANSACTIONS } from "@/polymet/data/commercial-data";
import { EXTERNAL_SOURCES, SYNC_RUNS, FAILED_IMPORTS, DUPLICATES, AI_EVENTS, MATCH_REVIEWS } from "@/polymet/data/integrations-data";
import { ACTION_QUEUE, TICKETS, DISPUTES, NOTIFICATION_TEMPLATES, NOTIFICATION_EVENTS, AUDIT_EVENTS } from "@/polymet/data/operations-data";
import { ADMIN_USERS, FEATURE_FLAGS } from "@/polymet/data/dashboard-data";

export const IS_SAMPLE_DATA = true;

function sample<T>(data: T, delay = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

export const adminService = {
  users: () => sample(USERS),
  companies: () => sample(COMPANIES),
  verificationRequests: () => sample(VERIFICATION_REQUESTS),
  mentors: () => sample({ mentors: MENTORS, bookings: MENTOR_BOOKINGS }),
  supervisors: () => sample({ supervisors: SUPERVISORS, requests: SUPERVISOR_REQUESTS }),
  access: () => sample({ cases: ACCESS_CASES, invitations: INVITATIONS }),
  listings: () => sample(LISTINGS),
  applications: () => sample(APPLICATIONS),
  placements: () => sample(PLACEMENTS),
  talentOversight: () => sample({ evidence: EVIDENCE, readiness: READINESS }),
  workspaces: () => sample(WORKSPACES),
  workspaceDetail: () => sample({ members: WORKSPACE_MEMBERS, projects: WORKSPACE_PROJECTS, reports: WORKSPACE_REPORTS, onboarding: ONBOARDING, issues: WORKSPACE_ACCESS_ISSUES }),
  plans: () => sample(PLANS),
  subscriptions: () => sample(SUBSCRIPTIONS),
  transactions: () => sample(TRANSACTIONS),
  sources: () => sample(EXTERNAL_SOURCES),
  sync: () => sample({ runs: SYNC_RUNS, failed: FAILED_IMPORTS, duplicates: DUPLICATES }),
  aiEvents: () => sample({ events: AI_EVENTS, matches: MATCH_REVIEWS }),
  actionQueue: () => sample(ACTION_QUEUE),
  tickets: () => sample(TICKETS),
  disputes: () => sample(DISPUTES),
  notifications: () => sample({ templates: NOTIFICATION_TEMPLATES, events: NOTIFICATION_EVENTS }),
  audit: () => sample(AUDIT_EVENTS),
  adminUsers: () => sample(ADMIN_USERS),
  featureFlags: () => sample(FEATURE_FLAGS),
};
