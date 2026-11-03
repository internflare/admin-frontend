import { UnavailablePage } from "@/polymet/components/unavailable-page";
export default function AccountAccessPage() {
  return <UnavailablePage title="Account access & invitations" permission="users.manage" description="Access-case queues, platform-user invitations and invitation resends have no admin endpoints. Account restrictions remain available on real user detail pages." />;
}
