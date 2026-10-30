import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import ReconciliationPage from "@/polymet/pages/reconciliation";

export default function ReconciliationRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <ReconciliationPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
