import { UnavailablePage } from "@/polymet/components/unavailable-page";
export default function SupportPage({ initialView = "all" }: { initialView?: "all" | "escalated" }) {
  return <UnavailablePage title={initialView === "escalated" ? "Support escalations" : "Support tickets"} permission="support.view" description="Support tickets, agent assignment, replies and escalations have no admin endpoints." />;
}
