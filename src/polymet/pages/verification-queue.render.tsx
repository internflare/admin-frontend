import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import VerificationQueuePage from "@/polymet/pages/verification-queue";

export default function VerificationQueueRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <VerificationQueuePage />
      </AdminLayout>
    </BrowserRouter>
  );
}
