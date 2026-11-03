import { ResourcePage } from "@/polymet/components/resource-page";
import { resources } from "@/polymet/lib/admin-service";

export default function WorkspacesPage({ initialTab = "directory" }: { initialTab?: "directory" | "issues" }) {
  return <ResourcePage resource={resources.workspaces} initialParams={initialTab === "issues" ? { status: "Provisioning_Error" } : {}} title={initialTab === "issues" ? "Workspaces with provisioning errors" : undefined} />;
}
