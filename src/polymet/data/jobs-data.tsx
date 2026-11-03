export type ListingStatus = "Pending review" | "Published" | "Paused" | "Closed" | "Rejected" | "Expired" | "Changes requested";
export interface Listing {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  companyVerified: boolean;
  type: "Internship" | "Full-time" | "Contract" | "Part-time";
  source: "Internal" | "Adzuna" | "Jooble" | "Partner feed";
  location: string;
  paid: "Paid" | "Unpaid" | "Not stated";
  compensation: string;
  publishedAt: string | null;
  expiresAt: string;
  applications: number;
  status: ListingStatus;
  reports: number;
  updatedAt: string;
  applyDestination: string;
  skills: string[];
  description: string;
  flags: string[];
}
export type ApplicationStage = "Submitted" | "Shortlisted" | "Interview" | "Test task" | "Offer" | "Hired" | "Rejected" | "Withdrawn";
export interface Application {
  id: string;
  candidate: string;
  candidateId: string;
  listing: string;
  listingId: string;
  employer: string;
  stage: ApplicationStage;
  submittedAt: string;
  lastActivity: string;
  matchScore: number | null;
  issue?: string;
  history: { stage: ApplicationStage; at: string; by: string }[];
}
export interface Placement {
  id: string;
  candidate: string;
  candidateId: string;
  employer: string;
  opportunity: string;
  type: "Internship" | "Employment" | "Contract";
  acceptance: "Accepted" | "Pending" | "Declined";
  workspaceProvisioning: "Provisioned" | "Pending" | "Failed" | "Not required";
  workspaceId?: string;
  startDate: string;
  expectedCompletion: string;
  status: "Active" | "Not started" | "Completed" | "Terminated" | "State mismatch";
  outcome: "—" | "Completed" | "Converted to employment" | "Ended early" | "Not recorded";
  supervisor?: string;
}
export interface EvidenceItem {
  id: string;
  talent: string;
  talentId: string;
  title: string;
  kind: "Portfolio project" | "Work evidence" | "Certificate" | "Reference";
  submittedAt: string;
  status: "Pending review" | "Approved" | "Rejected" | "Reported";
  reason?: string;
}
export interface ReadinessRecord {
  id: string;
  talent: string;
  talentId: string;
  targetRole: string;
  assessmentScore: number | null;
  learningPlanProgress: number;
  mentorLinked: boolean;
  lastActivity: string;
  status: "On track" | "Stalled" | "Not started" | "Completed";
}
