import { UnavailablePage } from "@/polymet/components/unavailable-page";
export default function SyncMonitoringPage({ initialTab = "history" }: { initialTab?: "history" | "failed" | "duplicates" }) {
  return <UnavailablePage title={initialTab === "history" ? "Sync monitoring" : initialTab === "failed" ? "Failed imports" : "Duplicate review"} permission="integrations.view" description="Sync runs, import failures, duplicate candidates, retries and duplicate decisions are not implemented in the admin API." />;
}
