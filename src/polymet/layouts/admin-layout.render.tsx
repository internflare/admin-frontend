import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import { AdminRoleProvider } from "@/polymet/components/admin-role-provider";
import { PageHeader } from "@/polymet/components/page-header";

export default function AdminLayoutRender() {
  return (
    <BrowserRouter>
      <AdminRoleProvider>
        <AdminLayout>
          <PageHeader
            title="Page title"
            description="Layout preview — pages render inside this content area."
            breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Page" }]}
          />
        </AdminLayout>
      </AdminRoleProvider>
    </BrowserRouter>
  );
}
