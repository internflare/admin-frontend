import { UnavailablePage } from "@/polymet/components/unavailable-page";
export default function SubscriptionsPage() {
  return <UnavailablePage title="Subscriptions" permission="finance.view" description="The admin API exposes plans and transactions, but no subscription directory or subscription-management endpoints." />;
}
