export type ListingStatus =
  | "Pending review"
  | "Published"
  | "Paused"
  | "Closed"
  | "Rejected"
  | "Expired"
  | "Changes requested";

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

export const LISTINGS: Listing[] = [
  { id: "LST-8801", title: "Product Design Intern", company: "Kora Fintech Ltd", companyId: "CMP-2001", companyVerified: true, type: "Internship", source: "Internal", location: "Lagos · Hybrid", paid: "Paid", compensation: "₦150,000 / month stipend", publishedAt: "2025-05-20", expiresAt: "2025-07-20", applications: 214, status: "Published", reports: 0, updatedAt: "2025-06-10T10:00:00", applyDestination: "Internflare application flow", skills: ["Figma", "User research", "Prototyping"], description: "Join our product team to design onboarding and payments flows for SME merchants.", flags: [] },
  { id: "LST-8802", title: "Junior Data Analyst", company: "NovaHealth Africa", companyId: "CMP-2002", companyVerified: false, type: "Full-time", source: "Internal", location: "Remote · Nigeria", paid: "Paid", compensation: "₦350,000 – ₦450,000 / month", publishedAt: null, expiresAt: "2025-07-30", applications: 0, status: "Pending review", reports: 0, updatedAt: "2025-06-10T14:20:00", applyDestination: "Internflare application flow", skills: ["SQL", "Python", "Power BI"], description: "Analyse patient engagement data and build operational dashboards.", flags: ["Company verification pending"] },
  { id: "LST-8803", title: "Remote Data Entry — Earn $500/day", company: "QuickHire Global", companyId: "CMP-2007", companyVerified: false, type: "Part-time", source: "Internal", location: "Remote", paid: "Paid", compensation: "$500 / day", publishedAt: "2025-05-31", expiresAt: "2025-06-30", applications: 38, status: "Paused", reports: 7, updatedAt: "2025-06-01T09:00:00", applyDestination: "https://quickhire-global.biz/apply?ref=if", skills: [], description: "No experience needed. Pay registration fee to start.", flags: ["Upfront fee requested", "Unrealistic compensation", "Off-platform application"] },
  { id: "LST-8804", title: "Logistics Operations Intern", company: "Bright Logistics", companyId: "CMP-2003", companyVerified: true, type: "Internship", source: "Internal", location: "Port Harcourt · On-site", paid: "Paid", compensation: "₦100,000 / month stipend", publishedAt: "2025-05-02", expiresAt: "2025-06-15", applications: 97, status: "Published", reports: 0, updatedAt: "2025-06-02T08:00:00", applyDestination: "Internflare application flow", skills: ["Excel", "Fleet ops"], description: "Support dispatch planning and route optimisation.", flags: [] },
  { id: "LST-8805", title: "Backend Engineer (Go)", company: "Accra CodeWorks", companyId: "CMP-2006", companyVerified: true, type: "Full-time", source: "Internal", location: "Accra · Hybrid", paid: "Paid", compensation: "GH₵ 9,000 / month", publishedAt: "2025-04-18", expiresAt: "2025-06-01", applications: 156, status: "Expired", reports: 0, updatedAt: "2025-06-01T00:00:00", applyDestination: "Internflare application flow", skills: ["Go", "PostgreSQL", "gRPC"], description: "Build payment rails for West African merchants.", flags: [] },
  { id: "LST-8806", title: "Social Media Intern", company: "Lumen Studio", companyId: "CMP-2004", companyVerified: false, type: "Internship", source: "Internal", location: "Lagos · On-site", paid: "Unpaid", compensation: "Unpaid", publishedAt: null, expiresAt: "2025-07-10", applications: 0, status: "Changes requested", reports: 0, updatedAt: "2025-06-08T11:00:00", applyDestination: "Internflare application flow", skills: ["Content", "Canva"], description: "Manage brand pages for agency clients.", flags: ["Unpaid internship — duration not stated"] },
  { id: "LST-8807", title: "Software Engineer, Payments", company: "Flutterwave", companyVerified: false, type: "Full-time", source: "Adzuna", location: "Lagos", paid: "Not stated", compensation: "Not stated", publishedAt: "2025-06-05", expiresAt: "2025-07-05", applications: 0, status: "Published", reports: 0, updatedAt: "2025-06-11T03:00:00", applyDestination: "https://www.adzuna.com.ng/details/4412…", skills: ["Java", "Kotlin"], description: "Imported from Adzuna. Original listing retained at source.", flags: [] },
  { id: "LST-8808", title: "Customer Support Associate", company: "Moniepoint", companyVerified: false, type: "Full-time", source: "Jooble", location: "Abuja", paid: "Not stated", compensation: "Not stated", publishedAt: "2025-06-02", expiresAt: "2025-06-09", applications: 0, status: "Expired", reports: 1, updatedAt: "2025-06-10T03:00:00", applyDestination: "https://jooble.org/desc/88291… (404)", skills: [], description: "Imported from Jooble. Application URL returned 404 on last check.", flags: ["Broken application URL"] },
  { id: "LST-8809", title: "Retail Analytics Intern", company: "Zuri Retail Group", companyId: "CMP-2008", companyVerified: true, type: "Internship", source: "Internal", location: "Lagos · Hybrid", paid: "Paid", compensation: "₦120,000 / month stipend", publishedAt: "2025-06-01", expiresAt: "2025-07-15", applications: 63, status: "Published", reports: 0, updatedAt: "2025-06-09T09:00:00", applyDestination: "Internflare application flow", skills: ["Excel", "SQL"], description: "Analyse store performance across 40 outlets.", flags: [] },
  { id: "LST-8810", title: "Learning Experience Designer", company: "EduBridge Labs", companyId: "CMP-2009", companyVerified: false, type: "Contract", source: "Internal", location: "Remote", paid: "Paid", compensation: "₦600,000 fixed (3 months)", publishedAt: null, expiresAt: "2025-07-25", applications: 0, status: "Pending review", reports: 0, updatedAt: "2025-06-09T17:00:00", applyDestination: "Internflare application flow", skills: ["Instructional design"], description: "Design learner journeys for secondary-school STEM courses.", flags: ["Company verification pending"] },
  { id: "LST-8811", title: "Graduate Trainee — Agribusiness", company: "Savanna Agro Co-op", companyId: "CMP-2005", companyVerified: false, type: "Full-time", source: "Partner feed", location: "Kaduna · On-site", paid: "Paid", compensation: "₦180,000 / month", publishedAt: null, expiresAt: "2025-08-01", applications: 0, status: "Pending review", reports: 0, updatedAt: "2025-06-06T12:00:00", applyDestination: "Internflare application flow", skills: ["Agronomy"], description: "Rotational programme across farm operations and sales.", flags: [] },
  { id: "LST-8812", title: "Crypto Trading Assistant", company: "Unverified poster", companyVerified: false, type: "Part-time", source: "Internal", location: "Remote", paid: "Paid", compensation: "Commission only", publishedAt: "2025-06-07", expiresAt: "2025-07-07", applications: 12, status: "Published", reports: 4, updatedAt: "2025-06-10T20:00:00", applyDestination: "WhatsApp link in description", skills: [], description: "Help clients invest. Contact via WhatsApp.", flags: ["Off-platform contact", "Commission only"] },
  { id: "LST-8813", title: "Frontend Engineering Intern", company: "Kora Fintech Ltd", companyId: "CMP-2001", companyVerified: true, type: "Internship", source: "Internal", location: "Lagos · Hybrid", paid: "Paid", compensation: "₦150,000 / month stipend", publishedAt: "2025-03-01", expiresAt: "2025-04-01", applications: 302, status: "Closed", reports: 0, updatedAt: "2025-04-01T00:00:00", applyDestination: "Internflare application flow", skills: ["React", "TypeScript"], description: "Build merchant dashboard features.", flags: [] },
  { id: "LST-8814", title: "Sales Representative", company: "QuickHire Global", companyId: "CMP-2007", companyVerified: false, type: "Full-time", source: "Internal", location: "Remote", paid: "Not stated", compensation: "Not stated", publishedAt: null, expiresAt: "2025-07-01", applications: 0, status: "Rejected", reports: 2, updatedAt: "2025-05-31T10:00:00", applyDestination: "https://quickhire-global.biz", skills: [], description: "—", flags: ["Company verification rejected"] },
];

export type ApplicationStage =
  | "Submitted"
  | "Shortlisted"
  | "Interview"
  | "Test task"
  | "Offer"
  | "Hired"
  | "Rejected"
  | "Withdrawn";

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

export const APPLICATIONS: Application[] = [
  { id: "APP-30011", candidate: "Chiamaka Eze", candidateId: "USR-10421", listing: "Product Design Intern", listingId: "LST-8801", employer: "Kora Fintech Ltd", stage: "Interview", submittedAt: "2025-05-22T10:00:00", lastActivity: "2025-06-10T14:00:00", matchScore: 86, history: [{ stage: "Submitted", at: "2025-05-22T10:00:00", by: "Candidate" }, { stage: "Shortlisted", at: "2025-05-28T09:00:00", by: "Ngozi Umeh" }, { stage: "Interview", at: "2025-06-10T14:00:00", by: "Ngozi Umeh" }] },
  { id: "APP-30012", candidate: "Tunde Bakare", candidateId: "USR-10422", listing: "Frontend Engineering Intern", listingId: "LST-8813", employer: "Kora Fintech Ltd", stage: "Hired", submittedAt: "2025-03-03T08:00:00", lastActivity: "2025-06-09T11:00:00", matchScore: 79, issue: "Workspace not provisioned after hire", history: [{ stage: "Submitted", at: "2025-03-03T08:00:00", by: "Candidate" }, { stage: "Shortlisted", at: "2025-03-10T08:00:00", by: "Ngozi Umeh" }, { stage: "Interview", at: "2025-03-18T08:00:00", by: "Ngozi Umeh" }, { stage: "Offer", at: "2025-06-01T08:00:00", by: "Ngozi Umeh" }, { stage: "Hired", at: "2025-06-09T11:00:00", by: "Candidate accepted" }] },
  { id: "APP-30013", candidate: "Grace Akpan", candidateId: "USR-10434", listing: "Logistics Operations Intern", listingId: "LST-8804", employer: "Bright Logistics", stage: "Offer", submittedAt: "2025-05-10T09:30:00", lastActivity: "2025-06-08T16:00:00", matchScore: 71, history: [{ stage: "Submitted", at: "2025-05-10T09:30:00", by: "Candidate" }, { stage: "Interview", at: "2025-05-25T10:00:00", by: "Bisi Adebayo" }, { stage: "Offer", at: "2025-06-08T16:00:00", by: "Bisi Adebayo" }] },
  { id: "APP-30014", candidate: "Halima Yusuf", candidateId: "USR-10429", listing: "Backend Engineer (Go)", listingId: "LST-8805", employer: "Accra CodeWorks", stage: "Test task", submittedAt: "2025-04-20T12:00:00", lastActivity: "2025-06-05T09:00:00", matchScore: 91, issue: "Paid test task payment pending confirmation", history: [{ stage: "Submitted", at: "2025-04-20T12:00:00", by: "Candidate" }, { stage: "Shortlisted", at: "2025-04-25T12:00:00", by: "Ama Owusu" }, { stage: "Test task", at: "2025-06-05T09:00:00", by: "Ama Owusu" }] },
  { id: "APP-30015", candidate: "Zainab Lawal", candidateId: "USR-10432", listing: "Retail Analytics Intern", listingId: "LST-8809", employer: "Zuri Retail Group", stage: "Shortlisted", submittedAt: "2025-06-02T08:00:00", lastActivity: "2025-06-07T10:00:00", matchScore: 74, history: [{ stage: "Submitted", at: "2025-06-02T08:00:00", by: "Candidate" }, { stage: "Shortlisted", at: "2025-06-07T10:00:00", by: "Ifeoma Chukwu" }] },
  { id: "APP-30016", candidate: "Ibrahim Musa", candidateId: "USR-10424", listing: "Retail Analytics Intern", listingId: "LST-8809", employer: "Zuri Retail Group", stage: "Submitted", submittedAt: "2025-06-09T19:00:00", lastActivity: "2025-06-09T19:00:00", matchScore: null, history: [{ stage: "Submitted", at: "2025-06-09T19:00:00", by: "Candidate" }] },
  { id: "APP-30017", candidate: "Aisha Bello", candidateId: "USR-10427", listing: "Product Design Intern", listingId: "LST-8801", employer: "Kora Fintech Ltd", stage: "Rejected", submittedAt: "2025-05-23T09:00:00", lastActivity: "2025-05-30T09:00:00", matchScore: 58, history: [{ stage: "Submitted", at: "2025-05-23T09:00:00", by: "Candidate" }, { stage: "Rejected", at: "2025-05-30T09:00:00", by: "Ngozi Umeh" }] },
  { id: "APP-30018", candidate: "Chiamaka Eze", candidateId: "USR-10421", listing: "Retail Analytics Intern", listingId: "LST-8809", employer: "Zuri Retail Group", stage: "Withdrawn", submittedAt: "2025-06-03T09:00:00", lastActivity: "2025-06-06T09:00:00", matchScore: 62, history: [{ stage: "Submitted", at: "2025-06-03T09:00:00", by: "Candidate" }, { stage: "Withdrawn", at: "2025-06-06T09:00:00", by: "Candidate" }] },
  { id: "APP-30019", candidate: "Halima Yusuf", candidateId: "USR-10429", listing: "Product Design Intern", listingId: "LST-8801", employer: "Kora Fintech Ltd", stage: "Submitted", submittedAt: "2025-06-10T07:00:00", lastActivity: "2025-06-10T07:00:00", matchScore: 49, history: [{ stage: "Submitted", at: "2025-06-10T07:00:00", by: "Candidate" }] },
  { id: "APP-30020", candidate: "Grace Akpan", candidateId: "USR-10434", listing: "Crypto Trading Assistant", listingId: "LST-8812", employer: "Unverified poster", stage: "Submitted", submittedAt: "2025-06-08T07:00:00", lastActivity: "2025-06-08T07:00:00", matchScore: null, issue: "Applied to reported listing", history: [{ stage: "Submitted", at: "2025-06-08T07:00:00", by: "Candidate" }] },
];

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

export const PLACEMENTS: Placement[] = [
  { id: "ENG-6101", candidate: "Halima Yusuf", candidateId: "USR-10429", employer: "Accra CodeWorks", opportunity: "Backend Engineering Intern", type: "Internship", acceptance: "Accepted", workspaceProvisioning: "Provisioned", workspaceId: "WSP-303", startDate: "2025-01-06", expectedCompletion: "2025-06-30", status: "Active", outcome: "—", supervisor: "Emeka Obi" },
  { id: "ENG-6102", candidate: "Tunde Bakare", candidateId: "USR-10422", employer: "Kora Fintech Ltd", opportunity: "Frontend Engineering Intern", type: "Internship", acceptance: "Accepted", workspaceProvisioning: "Failed", workspaceId: "WSP-301", startDate: "2025-06-16", expectedCompletion: "2025-12-16", status: "State mismatch", outcome: "—" },
  { id: "ENG-6103", candidate: "Chiamaka Eze", candidateId: "USR-10421", employer: "Zuri Retail Group", opportunity: "UX Intern", type: "Internship", acceptance: "Accepted", workspaceProvisioning: "Provisioned", workspaceId: "WSP-304", startDate: "2024-12-01", expectedCompletion: "2025-05-31", status: "Completed", outcome: "Converted to employment", supervisor: "Yaw Mensah" },
  { id: "ENG-6104", candidate: "Grace Akpan", candidateId: "USR-10434", employer: "Bright Logistics", opportunity: "Logistics Operations Intern", type: "Internship", acceptance: "Pending", workspaceProvisioning: "Pending", workspaceId: "WSP-302", startDate: "2025-06-23", expectedCompletion: "2025-09-23", status: "Not started", outcome: "—" },
  { id: "ENG-6105", candidate: "Samuel Okon", candidateId: "USR-10428", employer: "Bright Logistics", opportunity: "Operations Analyst", type: "Employment", acceptance: "Accepted", workspaceProvisioning: "Provisioned", workspaceId: "WSP-302", startDate: "2025-04-14", expectedCompletion: "—", status: "Active", outcome: "—", supervisor: "Bisi Adebayo" },
  { id: "ENG-6106", candidate: "Aisha Bello", candidateId: "USR-10427", employer: "Zuri Retail Group", opportunity: "Marketing Intern", type: "Internship", acceptance: "Accepted", workspaceProvisioning: "Provisioned", workspaceId: "WSP-304", startDate: "2025-01-10", expectedCompletion: "2025-04-10", status: "Terminated", outcome: "Ended early" },
  { id: "ENG-6107", candidate: "Zainab Lawal", candidateId: "USR-10432", employer: "EduBridge Labs", opportunity: "Customer Success Intern", type: "Internship", acceptance: "Accepted", workspaceProvisioning: "Provisioned", workspaceId: "WSP-305", startDate: "2025-05-05", expectedCompletion: "2025-08-05", status: "Active", outcome: "—" },
  { id: "ENG-6108", candidate: "Ibrahim Musa", candidateId: "USR-10424", employer: "Kora Fintech Ltd", opportunity: "Data Intern", type: "Internship", acceptance: "Accepted", workspaceProvisioning: "Provisioned", workspaceId: "WSP-301", startDate: "2024-10-01", expectedCompletion: "2025-03-31", status: "Completed", outcome: "Not recorded" },
];

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

export const EVIDENCE: EvidenceItem[] = [
  { id: "EVD-401", talent: "Halima Yusuf", talentId: "USR-10429", title: "Payments ledger service (GitHub)", kind: "Portfolio project", submittedAt: "2025-06-08T10:00:00", status: "Pending review" },
  { id: "EVD-402", talent: "Chiamaka Eze", talentId: "USR-10421", title: "Zuri Retail internship completion letter", kind: "Work evidence", submittedAt: "2025-06-02T10:00:00", status: "Approved" },
  { id: "EVD-403", talent: "Aisha Bello", talentId: "USR-10427", title: "Google Digital Marketing certificate", kind: "Certificate", submittedAt: "2025-06-01T10:00:00", status: "Reported", reason: "Certificate ID does not resolve at issuer" },
  { id: "EVD-404", talent: "Zainab Lawal", talentId: "USR-10432", title: "Reference from EduBridge supervisor", kind: "Reference", submittedAt: "2025-06-10T10:00:00", status: "Pending review" },
  { id: "EVD-405", talent: "Tunde Bakare", talentId: "USR-10422", title: "Portfolio site — duplicated project images", kind: "Portfolio project", submittedAt: "2025-05-30T10:00:00", status: "Rejected", reason: "Content matches another user's public portfolio" },
];

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

export const READINESS: ReadinessRecord[] = [
  { id: "RDY-101", talent: "Chiamaka Eze", talentId: "USR-10421", targetRole: "Product Designer", assessmentScore: 82, learningPlanProgress: 100, mentorLinked: true, lastActivity: "2025-06-09T10:00:00", status: "Completed" },
  { id: "RDY-102", talent: "Tunde Bakare", talentId: "USR-10422", targetRole: "Frontend Engineer", assessmentScore: 68, learningPlanProgress: 55, mentorLinked: true, lastActivity: "2025-06-10T10:00:00", status: "On track" },
  { id: "RDY-103", talent: "Ibrahim Musa", talentId: "USR-10424", targetRole: "Data Analyst", assessmentScore: null, learningPlanProgress: 0, mentorLinked: false, lastActivity: "2025-05-29T10:00:00", status: "Not started" },
  { id: "RDY-104", talent: "Grace Akpan", talentId: "USR-10434", targetRole: "QA Engineer", assessmentScore: 57, learningPlanProgress: 20, mentorLinked: true, lastActivity: "2025-05-18T10:00:00", status: "Stalled" },
  { id: "RDY-105", talent: "Zainab Lawal", talentId: "USR-10432", targetRole: "Customer Success", assessmentScore: 74, learningPlanProgress: 70, mentorLinked: false, lastActivity: "2025-06-11T10:00:00", status: "On track" },
];
