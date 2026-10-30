import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import AIUsagePage from "@/polymet/pages/ai-usage";

export default function AIUsageRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <AIUsagePage />
      </AdminLayout>
    </BrowserRouter>
  );
}
