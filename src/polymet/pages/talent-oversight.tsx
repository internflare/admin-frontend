import { UnavailablePage } from "@/polymet/components/unavailable-page";
export default function TalentOversightPage({ initialTab = "portfolio" }: { initialTab?: "portfolio" | "readiness" }) {
  return <UnavailablePage title={initialTab === "portfolio" ? "Portfolio & evidence" : "Learning & readiness"} permission={initialTab === "portfolio" ? "users.manage" : "users.view"} description="Portfolio evidence, verification decisions, learning records, readiness scoring and readiness-review actions have no admin endpoints." />;
}
