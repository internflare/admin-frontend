import { useParams } from "react-router-dom";
import { ResourceDetail } from "@/polymet/components/resource-detail";
export default function WorkspaceDetailPage() {
  const { workspaceId = "" } = useParams();
  return <ResourceDetail kind="workspaces" id={workspaceId} />;
}
