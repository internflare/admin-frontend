import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import SyncMonitoringPage from "@/polymet/pages/sync-monitoring";

export default function SyncMonitoringRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <SyncMonitoringPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
