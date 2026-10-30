import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import DisputesPage from "@/polymet/pages/disputes";

export default function DisputesRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <DisputesPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
