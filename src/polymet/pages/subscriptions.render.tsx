import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import SubscriptionsPage from "@/polymet/pages/subscriptions";

export default function SubscriptionsRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <SubscriptionsPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
