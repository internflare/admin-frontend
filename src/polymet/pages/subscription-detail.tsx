import { UnavailablePage } from "@/polymet/components/unavailable-page";
export default function SubscriptionDetailPage() {
  return <UnavailablePage title="Subscription details" permission="finance.view" description="Subscription details, billing timelines, payment retries, entitlement resync and cancellation are not implemented in the admin API." />;
}
