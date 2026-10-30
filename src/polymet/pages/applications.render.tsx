import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import ApplicationsPage from "@/polymet/pages/applications";

export default function ApplicationsRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <ApplicationsPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
