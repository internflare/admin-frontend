import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import SupportPage from "@/polymet/pages/support";

export default function SupportRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <SupportPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
