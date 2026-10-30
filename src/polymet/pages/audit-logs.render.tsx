import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import AuditLogsPage from "@/polymet/pages/audit-logs";

export default function AuditLogsRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <AuditLogsPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
