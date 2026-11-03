import { UnavailablePage } from "@/polymet/components/unavailable-page";
export default function NotificationsPage() {
  return <UnavailablePage title="Notification oversight" permission="notifications.manage" description="Notification templates, delivery history, retries, broadcasts and template editing are not exposed by the admin API." />;
}
