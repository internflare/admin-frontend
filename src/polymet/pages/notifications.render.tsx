import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import NotificationsPage from "@/polymet/pages/notifications";

export default function NotificationsRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <NotificationsPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
