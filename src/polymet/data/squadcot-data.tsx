export interface Workspace {
  id: string;
  company: string;
  companyId: string;
  activeMembers: number;
  engagements: number;
  activeProjects: number;
  outstandingTasks: number;
  overdueTasks: number;
  pendingReports: number;
  status: "Active" | "Suspended" | "Archived" | "Provisioning";
  health: "Healthy" | "Degraded" | "Access issues";
  createdAt: string;
  lastActivity: string;
}

export const WORKSPACES: Workspace[] = [
  { id: "WSP-301", company: "Kora Fintech Ltd", companyId: "CMP-2001", activeMembers: 18, engagements: 4, activeProjects: 6, outstandingTasks: 47, overdueTasks: 5, pendingReports: 3, status: "Active", health: "Access issues", createdAt: "2024-09-25", lastActivity: "2025-06-11T11:00:00" },
  { id: "WSP-302", company: "Bright Logistics", companyId: "CMP-2003", activeMembers: 34, engagements: 9, activeProjects: 11, outstandingTasks: 92, overdueTasks: 14, pendingReports: 6, status: "Active", health: "Degraded", createdAt: "2024-04-15", lastActivity: "2025-06-11T10:30:00" },
  { id: "WSP-303", company: "Accra CodeWorks", companyId: "CMP-2006", activeMembers: 9, engagements: 2, activeProjects: 3, outstandingTasks: 21, overdueTasks: 1, pendingReports: 0, status: "Active", health: "Healthy", createdAt: "2024-10-05", lastActivity: "2025-06-11T09:10:00" },
  { id: "WSP-304", company: "Zuri Retail Group", companyId: "CMP-2008", activeMembers: 27, engagements: 6, activeProjects: 8, outstandingTasks: 58, overdueTasks: 3, pendingReports: 2, status: "Active", health: "Healthy", createdAt: "2024-03-20", lastActivity: "2025-06-10T17:45:00" },
  { id: "WSP-305", company: "EduBridge Labs", companyId: "CMP-2009", activeMembers: 6, engagements: 1, activeProjects: 2, outstandingTasks: 12, overdueTasks: 4, pendingReports: 1, status: "Active", health: "Degraded", createdAt: "2025-04-25", lastActivity: "2025-06-09T13:00:00" },
  { id: "WSP-306", company: "Helios Energy", companyId: "CMP-2010", activeMembers: 1, engagements: 0, activeProjects: 0, outstandingTasks: 0, overdueTasks: 0, pendingReports: 0, status: "Provisioning", health: "Healthy", createdAt: "2025-06-09", lastActivity: "2025-06-09T08:40:00" },
];

export interface WorkspaceMember {
  id: string;
  name: string;
  role: "Company admin" | "Manager" | "Employee" | "Intern" | "Supervisor";
  joinedAt: string;
  status: "Active" | "Left" | "Invited" | "Access missing";
  engagement?: string;
}

export const WORKSPACE_MEMBERS: WorkspaceMember[] = [
  { id: "USR-10423", name: "Ngozi Umeh", role: "Company admin", joinedAt: "2024-09-25", status: "Active" },
  { id: "USR-20011", name: "Tolu Martins", role: "Manager", joinedAt: "2024-10-02", status: "Invited" },
  { id: "USR-10422", name: "Tunde Bakare", role: "Intern", joinedAt: "2025-06-09", status: "Access missing", engagement: "ENG-6102" },
  { id: "USR-10424", name: "Ibrahim Musa", role: "Intern", joinedAt: "2024-10-01", status: "Left", engagement: "ENG-6108" },
  { id: "USR-20012", name: "Femi Adewale", role: "Employee", joinedAt: "2025-01-12", status: "Active" },
  { id: "USR-10426", name: "Emeka Obi", role: "Supervisor", joinedAt: "2025-02-01", status: "Active" },
];

export interface WorkspaceProject {
  id: string;
  workspace: string;
  workspaceId: string;
  name: string;
  owner: string;
  tasks: number;
  completed: number;
  overdue: number;
  dueDate: string;
  status: "On track" | "At risk" | "Overdue" | "Completed";
}

export const WORKSPACE_PROJECTS: WorkspaceProject[] = [
  { id: "PRJ-901", workspace: "Kora Fintech Ltd", workspaceId: "WSP-301", name: "Merchant onboarding redesign", owner: "Ngozi Umeh", tasks: 34, completed: 22, overdue: 2, dueDate: "2025-07-01", status: "On track" },
  { id: "PRJ-902", workspace: "Kora Fintech Ltd", workspaceId: "WSP-301", name: "Settlement reports v2", owner: "Femi Adewale", tasks: 19, completed: 8, overdue: 3, dueDate: "2025-06-20", status: "At risk" },
  { id: "PRJ-903", workspace: "Bright Logistics", workspaceId: "WSP-302", name: "Route optimisation pilot", owner: "Bisi Adebayo", tasks: 52, completed: 30, overdue: 9, dueDate: "2025-06-10", status: "Overdue" },
  { id: "PRJ-904", workspace: "Accra CodeWorks", workspaceId: "WSP-303", name: "Ledger service hardening", owner: "Ama Owusu", tasks: 21, completed: 19, overdue: 0, dueDate: "2025-06-28", status: "On track" },
  { id: "PRJ-905", workspace: "Zuri Retail Group", workspaceId: "WSP-304", name: "Store KPI dashboard", owner: "Ifeoma Chukwu", tasks: 16, completed: 16, overdue: 0, dueDate: "2025-05-30", status: "Completed" },
  { id: "PRJ-906", workspace: "EduBridge Labs", workspaceId: "WSP-305", name: "Learner support playbook", owner: "Peter Ola", tasks: 12, completed: 4, overdue: 4, dueDate: "2025-06-15", status: "At risk" },
];

export interface WorkspaceReport {
  id: string;
  workspace: string;
  member: string;
  period: string;
  type: "Weekly report" | "Monthly review" | "Performance record" | "Completion assessment";
  submittedAt: string | null;
  reviewStatus: "Submitted" | "Reviewed" | "Overdue" | "Awaiting supervisor";
  rating?: number;
}

export const WORKSPACE_REPORTS: WorkspaceReport[] = [
  { id: "RPT-1101", workspace: "Kora Fintech Ltd", member: "Femi Adewale", period: "Week 23", type: "Weekly report", submittedAt: "2025-06-07T18:00:00", reviewStatus: "Reviewed", rating: 4 },
  { id: "RPT-1102", workspace: "Accra CodeWorks", member: "Halima Yusuf", period: "May 2025", type: "Monthly review", submittedAt: "2025-06-02T10:00:00", reviewStatus: "Awaiting supervisor" },
  { id: "RPT-1103", workspace: "Bright Logistics", member: "Samuel Okon", period: "Week 23", type: "Weekly report", submittedAt: null, reviewStatus: "Overdue" },
  { id: "RPT-1104", workspace: "Zuri Retail Group", member: "Chiamaka Eze", period: "Dec 2024 – May 2025", type: "Completion assessment", submittedAt: "2025-05-31T12:00:00", reviewStatus: "Reviewed", rating: 5 },
  { id: "RPT-1105", workspace: "EduBridge Labs", member: "Zainab Lawal", period: "Week 23", type: "Weekly report", submittedAt: "2025-06-08T21:00:00", reviewStatus: "Submitted" },
  { id: "RPT-1106", workspace: "Bright Logistics", member: "Grace Akpan", period: "Q2 2025", type: "Performance record", submittedAt: null, reviewStatus: "Overdue" },
];

export interface OnboardingRecord {
  id: string;
  workspace: string;
  member: string;
  kind: "Onboarding" | "Handover";
  checklistDone: number;
  checklistTotal: number;
  startedAt: string;
  status: "In progress" | "Completed" | "Blocked";
  note?: string;
}

export const ONBOARDING: OnboardingRecord[] = [
  { id: "ONB-201", workspace: "Kora Fintech Ltd", member: "Tunde Bakare", kind: "Onboarding", checklistDone: 0, checklistTotal: 8, startedAt: "2025-06-09T11:00:00", status: "Blocked", note: "Waiting on workspace access provisioning" },
  { id: "ONB-202", workspace: "EduBridge Labs", member: "Zainab Lawal", kind: "Onboarding", checklistDone: 8, checklistTotal: 8, startedAt: "2025-05-05T09:00:00", status: "Completed" },
  { id: "ONB-203", workspace: "Bright Logistics", member: "Grace Akpan", kind: "Onboarding", checklistDone: 2, checklistTotal: 9, startedAt: "2025-06-10T09:00:00", status: "In progress" },
  { id: "HND-301", workspace: "Kora Fintech Ltd", member: "Ibrahim Musa", kind: "Handover", checklistDone: 6, checklistTotal: 6, startedAt: "2025-03-25T09:00:00", status: "Completed", note: "Project files, decisions and reports retained in workspace" },
  { id: "HND-302", workspace: "Zuri Retail Group", member: "Aisha Bello", kind: "Handover", checklistDone: 3, checklistTotal: 7, startedAt: "2025-04-08T09:00:00", status: "Blocked", note: "Handover summary not submitted before exit" },
];

export interface WorkspaceAccessIssue {
  id: string;
  workspace: string;
  workspaceId: string;
  member: string;
  type: "Missing access" | "Engagement link mismatch" | "Orphaned task" | "Unexpected membership change" | "Report association";
  detectedAt: string;
  severity: "High" | "Medium" | "Low";
  status: "Open" | "Investigating" | "Resolved";
  detail: string;
}

export const WORKSPACE_ACCESS_ISSUES: WorkspaceAccessIssue[] = [
  { id: "WAI-501", workspace: "Kora Fintech Ltd", workspaceId: "WSP-301", member: "Tunde Bakare", type: "Missing access", detectedAt: "2025-06-09T11:05:00", severity: "High", status: "Open", detail: "ENG-6102 accepted; provisioning job failed with ‘member seat limit reached’." },
  { id: "WAI-502", workspace: "Bright Logistics", workspaceId: "WSP-302", member: "Grace Akpan", type: "Engagement link mismatch", detectedAt: "2025-06-10T09:00:00", severity: "Medium", status: "Investigating", detail: "Onboarding started while offer acceptance is still pending." },
  { id: "WAI-503", workspace: "Zuri Retail Group", workspaceId: "WSP-304", member: "Aisha Bello", type: "Orphaned task", detectedAt: "2025-06-01T08:00:00", severity: "Low", status: "Open", detail: "4 tasks assigned to departed member; reassignment required. Records retained." },
  { id: "WAI-504", workspace: "EduBridge Labs", workspaceId: "WSP-305", member: "Zainab Lawal", type: "Report association", detectedAt: "2025-06-08T21:05:00", severity: "Low", status: "Open", detail: "Weekly report submitted without linked supervisor; awaiting supervisor assignment SRQ-801." },
  { id: "WAI-505", workspace: "Kora Fintech Ltd", workspaceId: "WSP-301", member: "Tolu Martins", type: "Unexpected membership change", detectedAt: "2025-06-09T09:31:00", severity: "Medium", status: "Resolved", detail: "Role changed from Employee to Company admin by Ngozi Umeh — confirmed intentional." },
];
