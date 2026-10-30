import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import PlansPage from "@/polymet/pages/plans";

export default function PlansRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <PlansPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
