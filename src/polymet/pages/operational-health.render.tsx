import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import OperationalHealthPage from "@/polymet/pages/operational-health";

export default function OperationalHealthRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <OperationalHealthPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
