import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import AnalyticsPage from "@/polymet/pages/analytics";

export default function AnalyticsRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <AnalyticsPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
