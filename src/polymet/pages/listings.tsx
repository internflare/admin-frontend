import { ResourcePage } from "@/polymet/components/resource-page";
import { UnavailablePage } from "@/polymet/components/unavailable-page";
import { resources } from "@/polymet/lib/admin-service";

export type ListingView = "all" | "pending" | "published" | "paused" | "closed" | "rejected" | "reported" | "expired" | "external";

export default function ListingsPage({ initialView = "all" }: { initialView?: ListingView }) {
  if (initialView === "external" || initialView === "reported" || initialView === "expired") {
    return <UnavailablePage title={`${initialView} listings`} permission="listings.view" description="The admin API does not expose a source, report-count or expiry filter. All recorded listings, including their source, remain available in Jobs & internships." />;
  }
  return <ResourcePage resource={resources.listings} initialParams={initialView === "pending" ? { moderationStatus: "Pending" } : initialView === "all" ? {} : { status: initialView }} />;
}
