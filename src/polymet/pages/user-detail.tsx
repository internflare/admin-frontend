import { useParams } from "react-router-dom";
import { ResourceDetail } from "@/polymet/components/resource-detail";
export default function UserDetailPage() {
  const { userId = "" } = useParams();
  return <ResourceDetail kind="users" id={userId} />;
}
