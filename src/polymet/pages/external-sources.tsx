import { UnavailablePage } from "@/polymet/components/unavailable-page";
export default function ExternalSourcesPage() {
  return <UnavailablePage title="External sources" permission="integrations.view" description="External-source configuration, sync health and source-management actions have no admin endpoints." />;
}
