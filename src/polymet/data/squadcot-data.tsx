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
export interface WorkspaceMember {
  id: string;
  name: string;
  role: "Company admin" | "Manager" | "Employee" | "Intern" | "Supervisor";
  joinedAt: string;
  status: "Active" | "Left" | "Invited" | "Access missing";
  engagement?: string;
}
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
