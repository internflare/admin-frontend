import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import SupportTicketDetailPage from "@/polymet/pages/support-ticket-detail";

export default function SupportTicketDetailRender() {
  return (
    <MemoryRouter initialEntries={["/support/TCK-2207"]}>
      <AdminLayout>
        <Routes>
          <Route path="/support/:ticketId" element={<SupportTicketDetailPage />} />
        </Routes>
      </AdminLayout>
    </MemoryRouter>
  );
}
