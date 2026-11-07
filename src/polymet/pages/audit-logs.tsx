import { useSearchParams } from "react-router-dom";
import { ResourcePage } from "@/polymet/components/resource-page";
import { AuditEntryDetails } from "@/polymet/components/audit-entry-details";
import { resources } from "@/polymet/lib/admin-service";

export default function AuditLogsPage() {
  const [params] = useSearchParams();
  return <ResourcePage resource={resources.audit} initialParams={{ entityId: params.get("entityId") ?? params.get("ref") ?? undefined }} rowActions={(record) => <AuditEntryDetails record={record} />} />;
}
