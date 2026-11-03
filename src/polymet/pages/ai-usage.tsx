import { UnavailablePage } from "@/polymet/components/unavailable-page";
export default function AIUsagePage({ initialTab = "usage" }: { initialTab?: "usage" | "matching" }) {
  return <UnavailablePage title={initialTab === "matching" ? "AI matching review" : "AI usage & cost"} permission="ai.view" description="The admin API does not expose AI usage events, costs, provider health, matching reviews or matching actions." />;
}
