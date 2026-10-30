import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import SupervisorsPage from "@/polymet/pages/supervisors";

export default function SupervisorsRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <SupervisorsPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
