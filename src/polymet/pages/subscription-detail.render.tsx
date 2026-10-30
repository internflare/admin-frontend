import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import SubscriptionDetailPage from "@/polymet/pages/subscription-detail";

export default function SubscriptionDetailRender() {
  return (
    <MemoryRouter initialEntries={["/subscriptions/SUB-40003"]}>
      <AdminLayout>
        <Routes>
          <Route path="/subscriptions/:subscriptionId" element={<SubscriptionDetailPage />} />
        </Routes>
      </AdminLayout>
    </MemoryRouter>
  );
}
