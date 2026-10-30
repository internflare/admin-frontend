import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import ExecutiveDashboardPage from "@/polymet/pages/executive-dashboard";

export default function ExecutiveDashboardRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <ExecutiveDashboardPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
