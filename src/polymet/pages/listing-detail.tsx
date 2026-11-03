import { useParams } from "react-router-dom";
import { ResourceDetail } from "@/polymet/components/resource-detail";
export default function ListingDetailPage() {
  const { listingId = "" } = useParams();
  return <ResourceDetail kind="listings" id={listingId} />;
}
