import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import ExternalSourcesPage from "@/polymet/pages/external-sources";

export default function ExternalSourcesRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <ExternalSourcesPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
