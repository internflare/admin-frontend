import { ResourcePage } from "@/polymet/components/resource-page";
import { resources } from "@/polymet/lib/admin-service";

export default function PlacementsPage({ context = "jobs" }: { context?: "jobs" | "squadcot" }) {
  return <ResourcePage resource={resources.placements} title={context === "squadcot" ? "Engagements — recorded hires" : undefined} />;
}
