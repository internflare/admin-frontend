export type AccountType = "Talent" | "Employer" | "Employee" | "Supervisor" | "Mentor";
export type AccountStatus = "Active" | "Pending" | "Restricted" | "Suspended";
export type VerificationState =
  | "Verified"
  | "Pending review"
  | "Not submitted"
  | "Rejected"
  | "More info requested";

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

export const USERS: PlatformUser[] = [
  { id: "USR-10421", name: "Chiamaka Eze", email: "chiamaka.eze@gmail.com", phone: "+2348031234567", accountType: "Talent", registeredAt: "2024-11-02", profileCompletion: 92, identityVerification: "Verified", qualificationVerification: "Verified", plan: "Pro", status: "Active", lastActiveAt: "2025-06-11T09:12:00", location: "Lagos, NG", headline: "Product Designer · UX Research", avatar: "https://github.com/yusufhilmi.png" },
  { id: "USR-10422", name: "Tunde Bakare", email: "tunde.bakare@outlook.com", phone: "+2348099876543", accountType: "Talent", registeredAt: "2025-01-14", profileCompletion: 64, identityVerification: "Pending review", qualificationVerification: "Not submitted", plan: "Free", status: "Active", lastActiveAt: "2025-06-10T18:40:00", location: "Ibadan, NG", headline: "Frontend Engineer (React)" },
  { id: "USR-10423", name: "Ngozi Umeh", email: "ngozi@paystackhq.co", phone: "+2348025550101", accountType: "Employer", registeredAt: "2024-09-21", profileCompletion: 100, identityVerification: "Verified", qualificationVerification: "Not submitted", plan: "Growth", status: "Active", lastActiveAt: "2025-06-11T11:02:00", location: "Lagos, NG", headline: "Head of Talent", company: "Kora Fintech Ltd", avatar: "https://github.com/denizcdemirci.png" },
  { id: "USR-10424", name: "Ibrahim Musa", email: "ibrahim.musa@yahoo.com", phone: "+2348077771122", accountType: "Talent", registeredAt: "2025-03-03", profileCompletion: 41, identityVerification: "Not submitted", qualificationVerification: "Not submitted", plan: "Free", status: "Pending", lastActiveAt: "2025-05-29T08:00:00", location: "Kano, NG", headline: "Data Analyst (Entry level)" },
  { id: "USR-10425", name: "Folake Adeyemi", email: "folake.adeyemi@gmail.com", phone: "+2348123344556", accountType: "Mentor", registeredAt: "2024-07-18", profileCompletion: 88, identityVerification: "Verified", qualificationVerification: "Pending review", plan: "Free", status: "Active", lastActiveAt: "2025-06-09T15:30:00", location: "Abuja, NG", headline: "Engineering Manager · Mentor" },
  { id: "USR-10426", name: "Emeka Obi", email: "emeka.obi@squadcot.app", phone: "+2348061112233", accountType: "Supervisor", registeredAt: "2024-06-01", profileCompletion: 95, identityVerification: "Verified", qualificationVerification: "Verified", plan: "Free", status: "Active", lastActiveAt: "2025-06-11T07:45:00", location: "Lagos, NG", headline: "Internship Supervisor" },
  { id: "USR-10427", name: "Aisha Bello", email: "aisha.bello@gmail.com", phone: "+2348145566778", accountType: "Talent", registeredAt: "2025-02-11", profileCompletion: 78, identityVerification: "Rejected", qualificationVerification: "Not submitted", plan: "Career", status: "Restricted", lastActiveAt: "2025-06-02T12:15:00", location: "Kaduna, NG", headline: "Marketing Associate" },
  { id: "USR-10428", name: "Samuel Okon", email: "s.okon@brightlogistics.ng", phone: "+2348039988776", accountType: "Employee", registeredAt: "2025-04-08", profileCompletion: 70, identityVerification: "Verified", qualificationVerification: "Not submitted", plan: "Free", status: "Active", lastActiveAt: "2025-06-11T10:20:00", location: "Port Harcourt, NG", headline: "Operations Analyst", company: "Bright Logistics" },
  { id: "USR-10429", name: "Halima Yusuf", email: "halima.y@protonmail.com", phone: "+2348100001234", accountType: "Talent", registeredAt: "2024-12-19", profileCompletion: 99, identityVerification: "Verified", qualificationVerification: "More info requested", plan: "Elite", status: "Active", lastActiveAt: "2025-06-11T08:05:00", location: "Abuja, NG", headline: "Backend Engineer · Go, Postgres" },
  { id: "USR-10430", name: "David Mensah", email: "david.mensah@gmail.com", phone: "+233244556677", accountType: "Talent", registeredAt: "2025-05-27", profileCompletion: 22, identityVerification: "Not submitted", qualificationVerification: "Not submitted", plan: "Free", status: "Suspended", lastActiveAt: "2025-05-28T21:10:00", location: "Accra, GH", headline: "—" },
  { id: "USR-10431", name: "Kelechi Nwosu", email: "kelechi@novahealth.africa", phone: "+2348057654321", accountType: "Employer", registeredAt: "2025-05-02", profileCompletion: 86, identityVerification: "Pending review", qualificationVerification: "Not submitted", plan: "Starter", status: "Active", lastActiveAt: "2025-06-10T16:44:00", location: "Lagos, NG", headline: "Founder", company: "NovaHealth Africa" },
  { id: "USR-10432", name: "Zainab Lawal", email: "zainab.lawal@gmail.com", phone: "+2348162223344", accountType: "Talent", registeredAt: "2025-04-15", profileCompletion: 83, identityVerification: "Verified", qualificationVerification: "Pending review", plan: "Career", status: "Active", lastActiveAt: "2025-06-11T06:58:00", location: "Lagos, NG", headline: "Customer Success Intern" },
  { id: "USR-10433", name: "Oluwaseun Ajayi", email: "seun.ajayi@gmail.com", phone: "+2348094445566", accountType: "Mentor", registeredAt: "2025-01-30", profileCompletion: 73, identityVerification: "Pending review", qualificationVerification: "Not submitted", plan: "Free", status: "Pending", lastActiveAt: "2025-06-07T19:00:00", location: "Lagos, NG", headline: "Senior Data Scientist" },
  { id: "USR-10434", name: "Grace Akpan", email: "grace.akpan@gmail.com", phone: "+2348011239876", accountType: "Talent", registeredAt: "2025-06-01", profileCompletion: 55, identityVerification: "Pending review", qualificationVerification: "Not submitted", plan: "Free", status: "Active", lastActiveAt: "2025-06-11T12:01:00", location: "Uyo, NG", headline: "Junior QA Tester" },
];

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

export const COMPANIES: Company[] = [
  { id: "CMP-2001", name: "Kora Fintech Ltd", representative: "Ngozi Umeh", representativeEmail: "ngozi@korafintech.com", country: "Nigeria", industry: "Financial services", size: "51–200", verification: "Verified", plan: "Growth", activeListings: 7, hires: 12, workspaceId: "WSP-301", registeredAt: "2024-09-21", status: "Active", rcNumber: "RC 1489201", website: "korafintech.com" },
  { id: "CMP-2002", name: "NovaHealth Africa", representative: "Kelechi Nwosu", representativeEmail: "kelechi@novahealth.africa", country: "Nigeria", industry: "Healthtech", size: "11–50", verification: "Pending review", plan: "Starter", activeListings: 2, hires: 0, registeredAt: "2025-05-02", status: "Active", rcNumber: "RC 7720114", website: "novahealth.africa" },
  { id: "CMP-2003", name: "Bright Logistics", representative: "Samuel Okon", representativeEmail: "s.okon@brightlogistics.ng", country: "Nigeria", industry: "Logistics", size: "201–500", verification: "Verified", plan: "Professional", activeListings: 11, hires: 31, workspaceId: "WSP-302", registeredAt: "2024-04-11", status: "Active", rcNumber: "RC 902331", website: "brightlogistics.ng" },
  { id: "CMP-2004", name: "Lumen Studio", representative: "Tobi Ade", representativeEmail: "tobi@lumenstudio.co", country: "Nigeria", industry: "Creative agency", size: "1–10", verification: "More info requested", plan: "Free", activeListings: 0, hires: 0, registeredAt: "2025-05-19", status: "Active", website: "lumenstudio.co" },
  { id: "CMP-2005", name: "Savanna Agro Co-op", representative: "Musa Danjuma", representativeEmail: "musa@savannaagro.ng", country: "Nigeria", industry: "Agriculture", size: "51–200", verification: "Pending review", plan: "Free", activeListings: 1, hires: 0, registeredAt: "2025-06-03", status: "Pending", rcNumber: "RC 1120876", website: "savannaagro.ng" },
  { id: "CMP-2006", name: "Accra CodeWorks", representative: "Ama Owusu", representativeEmail: "ama@accracodeworks.com", country: "Ghana", industry: "Software", size: "11–50", verification: "Verified", plan: "Growth", activeListings: 4, hires: 6, workspaceId: "WSP-303", registeredAt: "2024-10-02", status: "Active", website: "accracodeworks.com" },
  { id: "CMP-2007", name: "QuickHire Global", representative: "J. Smith", representativeEmail: "hr@quickhire-global.biz", country: "Unknown", industry: "Recruitment", size: "Not provided", verification: "Rejected", plan: "Free", activeListings: 0, hires: 0, registeredAt: "2025-05-30", status: "Restricted", website: "quickhire-global.biz" },
  { id: "CMP-2008", name: "Zuri Retail Group", representative: "Ifeoma Chukwu", representativeEmail: "ifeoma@zuriretail.com", country: "Nigeria", industry: "Retail", size: "500+", verification: "Verified", plan: "Professional", activeListings: 9, hires: 22, workspaceId: "WSP-304", registeredAt: "2024-03-15", status: "Active", rcNumber: "RC 445120", website: "zuriretail.com" },
  { id: "CMP-2009", name: "EduBridge Labs", representative: "Peter Ola", representativeEmail: "peter@edubridge.ng", country: "Nigeria", industry: "Edtech", size: "11–50", verification: "Pending review", plan: "Starter", activeListings: 3, hires: 1, workspaceId: "WSP-305", registeredAt: "2025-04-22", status: "Active", rcNumber: "RC 1678854", website: "edubridge.ng" },
  { id: "CMP-2010", name: "Helios Energy", representative: "Bola Tinubu-Ade", representativeEmail: "bola@heliosenergy.ng", country: "Nigeria", industry: "Energy", size: "201–500", verification: "Not submitted", plan: "Free", activeListings: 0, hires: 0, registeredAt: "2025-06-08", status: "Pending", website: "heliosenergy.ng" },
];

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

const baseChecklist = (passed: number) =>
  [
    "Registered company name matches registry record",
    "RC / registration number provided and valid format",
    "Representative identity linked to verified account",
    "Business email domain matches company website",
    "Registered address supplied",
    "Supporting evidence legible and unexpired",
  ].map((label, i) => ({
    label,
    status: (i < passed ? "Passed" : "Unchecked") as "Passed" | "Unchecked",
  }));

export const VERIFICATION_REQUESTS: VerificationRequest[] = [
  { id: "VER-5101", companyId: "CMP-2002", companyName: "NovaHealth Africa", representative: "Kelechi Nwosu", country: "Nigeria", industry: "Healthtech", submittedAt: "2025-06-04T10:20:00", requiredInfo: "Complete", state: "Pending review", priority: "High", reviewer: "Adaeze Okafor", checklist: baseChecklist(3), documents: [{ name: "CAC_certificate.pdf", type: "Registration certificate", uploadedAt: "2025-06-04" }, { name: "Form_CAC7.pdf", type: "Directors' particulars", uploadedAt: "2025-06-04" }] },
  { id: "VER-5102", companyId: "CMP-2005", companyName: "Savanna Agro Co-op", representative: "Musa Danjuma", country: "Nigeria", industry: "Agriculture", submittedAt: "2025-06-05T14:02:00", requiredInfo: "Partially complete", state: "Pending review", priority: "Medium", reviewer: null, checklist: baseChecklist(1), documents: [{ name: "cooperative_registration.jpg", type: "Registration certificate", uploadedAt: "2025-06-05" }] },
  { id: "VER-5103", companyId: "CMP-2004", companyName: "Lumen Studio", representative: "Tobi Ade", country: "Nigeria", industry: "Creative agency", submittedAt: "2025-05-20T09:00:00", requiredInfo: "Incomplete", state: "More info requested", priority: "Low", reviewer: "Ifeanyi Obi", checklist: baseChecklist(2), documents: [] },
  { id: "VER-5104", companyId: "CMP-2009", companyName: "EduBridge Labs", representative: "Peter Ola", country: "Nigeria", industry: "Edtech", submittedAt: "2025-06-07T16:45:00", requiredInfo: "Complete", state: "Pending review", priority: "Medium", reviewer: null, checklist: baseChecklist(4), documents: [{ name: "CAC_certificate.pdf", type: "Registration certificate", uploadedAt: "2025-06-07" }, { name: "utility_bill_may.pdf", type: "Proof of address", uploadedAt: "2025-06-07" }] },
  { id: "VER-5105", companyId: "CMP-2007", companyName: "QuickHire Global", representative: "J. Smith", country: "Unknown", industry: "Recruitment", submittedAt: "2025-05-30T22:14:00", requiredInfo: "Incomplete", state: "Rejected", priority: "High", reviewer: "Adaeze Okafor", checklist: baseChecklist(0), documents: [{ name: "certificate.png", type: "Registration certificate", uploadedAt: "2025-05-30" }] },
  { id: "VER-5106", companyId: "CMP-2010", companyName: "Helios Energy", representative: "Bola Tinubu-Ade", country: "Nigeria", industry: "Energy", submittedAt: "2025-06-09T08:30:00", requiredInfo: "Incomplete", state: "Pending review", priority: "Low", reviewer: null, checklist: baseChecklist(0), documents: [] },
];

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

export const MENTORS: Mentor[] = [
  { id: "MEN-701", name: "Folake Adeyemi", expertise: ["Engineering leadership", "Career growth"], rate: 15000, availability: "Available", verification: "Pending review", sessionsCompleted: 42, upcomingBookings: 3, cancellations: 1, rating: 4.8, flags: 0, avatar: "https://github.com/yusufhilmi.png" },
  { id: "MEN-702", name: "Oluwaseun Ajayi", expertise: ["Data science", "Interview prep"], rate: 20000, availability: "Limited", verification: "Pending review", sessionsCompleted: 0, upcomingBookings: 1, cancellations: 0, rating: null, flags: 0 },
  { id: "MEN-703", name: "Uche Nnaji", expertise: ["Product management"], rate: 25000, availability: "Available", verification: "Verified", sessionsCompleted: 87, upcomingBookings: 5, cancellations: 2, rating: 4.9, flags: 0, avatar: "https://github.com/denizcdemirci.png" },
  { id: "MEN-704", name: "Rita Boateng", expertise: ["UX design", "Portfolio review"], rate: null, availability: "Unavailable", verification: "Verified", sessionsCompleted: 31, upcomingBookings: 0, cancellations: 4, rating: 4.3, flags: 1 },
  { id: "MEN-705", name: "Chidi Okeke", expertise: ["Sales", "Client acquisition"], rate: 10000, availability: "Available", verification: "Not submitted", sessionsCompleted: 6, upcomingBookings: 2, cancellations: 0, rating: 4.5, flags: 2 },
];

export interface MentorBooking {
  id: string;
  mentor: string;
  mentee: string;
  topic: string;
  scheduledAt: string;
  status: "Requested" | "Confirmed" | "Completed" | "Cancelled";
  paymentStatus: "Not required" | "Pending confirmation" | "Confirmed" | "Refund pending";
}

export const MENTOR_BOOKINGS: MentorBooking[] = [
  { id: "BKG-9001", mentor: "Uche Nnaji", mentee: "Chiamaka Eze", topic: "PM readiness plan review", scheduledAt: "2025-06-12T15:00:00", status: "Confirmed", paymentStatus: "Confirmed" },
  { id: "BKG-9002", mentor: "Folake Adeyemi", mentee: "Tunde Bakare", topic: "Frontend career roadmap", scheduledAt: "2025-06-13T11:00:00", status: "Requested", paymentStatus: "Pending confirmation" },
  { id: "BKG-9003", mentor: "Rita Boateng", mentee: "Zainab Lawal", topic: "Portfolio critique", scheduledAt: "2025-06-05T10:00:00", status: "Cancelled", paymentStatus: "Refund pending" },
  { id: "BKG-9004", mentor: "Chidi Okeke", mentee: "Halima Yusuf", topic: "Freelance client outreach", scheduledAt: "2025-06-01T17:00:00", status: "Completed", paymentStatus: "Confirmed" },
  { id: "BKG-9005", mentor: "Uche Nnaji", mentee: "Grace Akpan", topic: "QA to product transition", scheduledAt: "2025-06-14T09:30:00", status: "Requested", paymentStatus: "Not required" },
];

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

export const SUPERVISORS: Supervisor[] = [
  { id: "SUP-401", name: "Emeka Obi", specialism: "Software engineering", availability: "Available", activeAssignments: 4, capacity: 6, companies: ["Kora Fintech Ltd", "Accra CodeWorks"], reviewsThisMonth: 18, escalations: 0, avatar: "https://github.com/yusufhilmi.png" },
  { id: "SUP-402", name: "Bisi Adebayo", specialism: "Operations & logistics", availability: "At capacity", activeAssignments: 5, capacity: 5, companies: ["Bright Logistics"], reviewsThisMonth: 22, escalations: 1 },
  { id: "SUP-403", name: "Yaw Mensah", specialism: "Product & design", availability: "Available", activeAssignments: 2, capacity: 5, companies: ["Zuri Retail Group"], reviewsThisMonth: 9, escalations: 0, avatar: "https://github.com/denizcdemirci.png" },
  { id: "SUP-404", name: "Hauwa Garba", specialism: "Marketing & growth", availability: "Unavailable", activeAssignments: 0, capacity: 4, companies: [], reviewsThisMonth: 0, escalations: 0 },
];

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

export const SUPERVISOR_REQUESTS: SupervisorRequest[] = [
  { id: "SRQ-801", company: "EduBridge Labs", engagement: "ENG-6107", intern: "Zainab Lawal", requestedAt: "2025-06-09T09:00:00", specialism: "Product & design", status: "Pending" },
  { id: "SRQ-802", company: "Kora Fintech Ltd", engagement: "ENG-6102", intern: "Tunde Bakare", requestedAt: "2025-06-08T13:20:00", specialism: "Software engineering", status: "Pending" },
  { id: "SRQ-803", company: "Bright Logistics", engagement: "ENG-6104", intern: "Grace Akpan", requestedAt: "2025-06-06T10:10:00", specialism: "Operations & logistics", status: "Pending" },
  { id: "SRQ-804", company: "Accra CodeWorks", engagement: "ENG-6101", intern: "Halima Yusuf", requestedAt: "2025-05-20T11:00:00", specialism: "Software engineering", status: "Assigned", assignedTo: "Emeka Obi" },
];

export interface AccessCase {
  id: string;
  user: string;
  userId: string;
  type: "Account recovery" | "Invitation not received" | "Role review" | "Workspace access" | "Restriction appeal";
  status: "Open" | "In review" | "Resolved";
  openedAt: string;
  detail: string;
}

export const ACCESS_CASES: AccessCase[] = [
  { id: "ACC-301", user: "Tunde Bakare", userId: "USR-10422", type: "Workspace access", status: "Open", openedAt: "2025-06-10T09:40:00", detail: "Offer accepted for ENG-6102 but SquadCot workspace membership not provisioned." },
  { id: "ACC-302", user: "Aisha Bello", userId: "USR-10427", type: "Restriction appeal", status: "In review", openedAt: "2025-06-03T15:00:00", detail: "Appeal against restriction applied after identity document rejection." },
  { id: "ACC-303", user: "Samuel Okon", userId: "USR-10428", type: "Invitation not received", status: "Open", openedAt: "2025-06-11T08:15:00", detail: "Employee invite to Bright Logistics workspace not delivered (bounce)." },
  { id: "ACC-304", user: "Ibrahim Musa", userId: "USR-10424", type: "Account recovery", status: "Resolved", openedAt: "2025-05-28T10:00:00", detail: "Lost access to registered email; recovery completed via verified phone." },
];

export interface Invitation {
  id: string;
  email: string;
  invitedBy: string;
  context: string;
  role: string;
  sentAt: string;
  status: "Pending" | "Accepted" | "Expired" | "Bounced" | "Revoked";
}

export const INVITATIONS: Invitation[] = [
  { id: "INV-1201", email: "s.okon@brightlogistics.ng", invitedBy: "Bisi Adebayo", context: "Bright Logistics workspace", role: "Employee", sentAt: "2025-06-10T12:00:00", status: "Bounced" },
  { id: "INV-1202", email: "tolu@korafintech.com", invitedBy: "Ngozi Umeh", context: "Kora Fintech workspace", role: "Company admin", sentAt: "2025-06-09T09:30:00", status: "Pending" },
  { id: "INV-1203", email: "halima.y@protonmail.com", invitedBy: "Ama Owusu", context: "Accra CodeWorks workspace", role: "Intern", sentAt: "2025-05-21T08:00:00", status: "Accepted" },
  { id: "INV-1204", email: "intern@zuriretail.com", invitedBy: "Ifeoma Chukwu", context: "Zuri Retail workspace", role: "Intern", sentAt: "2025-05-01T10:00:00", status: "Expired" },
];
