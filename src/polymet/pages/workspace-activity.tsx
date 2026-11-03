import { UnavailablePage } from "@/polymet/components/unavailable-page";
export default function WorkspaceActivityPage({ initialTab = "projects" }: { initialTab?: "projects" | "reports" | "onboarding" }) {
  return <UnavailablePage title={`Workspace ${initialTab}`} permission="workspaces.view" description="Workspace projects, task activity, reports, onboarding records and reminder actions are not exposed by the admin API." />;
}
