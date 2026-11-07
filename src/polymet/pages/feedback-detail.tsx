import { useParams } from "react-router-dom";
import { ResourceDetail } from "@/polymet/components/resource-detail";
export default function FeedbackDetailPage() {
  const { feedbackId = "" } = useParams();
  return <ResourceDetail kind="feedback" id={feedbackId} />;
}
