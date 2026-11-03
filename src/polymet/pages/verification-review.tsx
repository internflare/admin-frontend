import { useParams } from "react-router-dom";
import { ResourceDetail } from "@/polymet/components/resource-detail";
export default function VerificationReviewPage() {
  const { requestId = "" } = useParams();
  return <ResourceDetail kind="verification" id={requestId} />;
}
