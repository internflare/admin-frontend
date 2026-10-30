import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import SettingsPage from "@/polymet/pages/settings";

export default function SettingsRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <SettingsPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
