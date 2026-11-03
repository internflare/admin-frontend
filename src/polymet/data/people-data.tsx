export type AccountType = "Talent" | "Employer" | "Employee" | "Supervisor" | "Mentor";
export type AccountStatus = "Active" | "Pending" | "Restricted" | "Suspended";
export type VerificationState = "Verified" | "Pending review" | "Not submitted" | "Rejected" | "More info requested";
export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: AccountType;
  registeredAt: string;
  profileCompletion: number;
  identityVerification: VerificationState;
  qualificationVerification: VerificationState;
  plan: string;
  status: AccountStatus;
  lastActiveAt: string | null;
  location: string;
  headline: string;
  company?: string;
  avatar?: string;
}
export interface Company {
  id: string;
  name: string;
  representative: string;
  representativeEmail: string;
  country: string;
  industry: string;
  size: string;
  verification: VerificationState;
  plan: string;
  activeListings: number;
  hires: number;
  workspaceId?: string;
  registeredAt: string;
  status: AccountStatus;
  rcNumber?: string;
  website: string;
}
export interface VerificationRequest {
  id: string;
  companyId: string;
  companyName: string;
  representative: string;
  country: string;
  industry: string;
  submittedAt: string;
  requiredInfo: "Complete" | "Incomplete" | "Partially complete";
  state: VerificationState;
  priority: "High" | "Medium" | "Low";
  reviewer: string | null;
  checklist: { label: string; status: "Passed" | "Failed" | "Unchecked" }[];
  documents: { name: string; type: string; uploadedAt: string }[];
}
export interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  rate: number | null;
  availability: "Available" | "Limited" | "Unavailable";
  verification: VerificationState;
  sessionsCompleted: number;
  upcomingBookings: number;
  cancellations: number;
  rating: number | null;
  flags: number;
  avatar?: string;
}
export interface MentorBooking {
  id: string;
  mentor: string;
  mentee: string;
  topic: string;
  scheduledAt: string;
  status: "Requested" | "Confirmed" | "Completed" | "Cancelled";
  paymentStatus: "Not required" | "Pending confirmation" | "Confirmed" | "Refund pending";
}
export interface Supervisor {
  id: string;
  name: string;
  specialism: string;
  availability: "Available" | "At capacity" | "Unavailable";
  activeAssignments: number;
  capacity: number;
  companies: string[];
  reviewsThisMonth: number;
  escalations: number;
  avatar?: string;
}
export interface SupervisorRequest {
  id: string;
  company: string;
  engagement: string;
  intern: string;
  requestedAt: string;
  specialism: string;
  status: "Pending" | "Assigned" | "Declined";
  assignedTo?: string;
}
export interface AccessCase {
  id: string;
  user: string;
  userId: string;
  type: "Account recovery" | "Invitation not received" | "Role review" | "Workspace access" | "Restriction appeal";
  status: "Open" | "In review" | "Resolved";
  openedAt: string;
  detail: string;
}
export interface Invitation {
  id: string;
  email: string;
  invitedBy: string;
  context: string;
  role: string;
  sentAt: string;
  status: "Pending" | "Accepted" | "Expired" | "Bounced" | "Revoked";
}
