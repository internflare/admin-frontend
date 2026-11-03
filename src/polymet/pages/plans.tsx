import { ResourcePage } from "@/polymet/components/resource-page";
import { resources } from "@/polymet/lib/admin-service";

export default function PlansPage() {
  return <ResourcePage resource={resources.plans} />;
}
