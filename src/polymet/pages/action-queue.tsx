import { UnavailablePage } from "@/polymet/components/unavailable-page";
export default function ActionQueuePage() {
  return <UnavailablePage title="Action queue" permission="dashboard.view" description="There is no aggregated action-queue endpoint. Company verification and payment reconciliation remain available in their live modules." />;
}
