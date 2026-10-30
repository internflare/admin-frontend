import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import ActionQueuePage from "@/polymet/pages/action-queue";

export default function ActionQueueRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <ActionQueuePage />
      </AdminLayout>
    </BrowserRouter>
  );
}
