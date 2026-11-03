import { useParams } from "react-router-dom";
import { ResourceDetail } from "@/polymet/components/resource-detail";
export default function CompanyDetailPage() {
  const { companyId = "" } = useParams();
  return <ResourceDetail kind="companies" id={companyId} />;
}
