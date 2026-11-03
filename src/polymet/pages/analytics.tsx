import { UnavailablePage } from "@/polymet/components/unavailable-page";
export default function AnalyticsPage({ initialTab = "talent" }: { initialTab?: "talent" | "recruitment" | "outcomes" | "squadcot" | "commercial" | "external" | "mentorship" }) {
  return <UnavailablePage title={initialTab === "commercial" ? "Revenue analytics" : "Analytics & reporting"} permission={initialTab === "commercial" ? "finance.view" : "analytics.view"} description="The current analytics endpoints return baseline historical series, estimated funnels and fallback counters rather than exclusively recorded events. Charts, deltas and exports are intentionally unavailable until a trustworthy backend analytics contract is implemented. Use the live directories and transaction ledger for recorded data." />;
}
