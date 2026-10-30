import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import SourceDetailPage from "@/polymet/pages/source-detail";

export default function SourceDetailRender() {
  return (
    <MemoryRouter initialEntries={["/integrations/SRC-JOO"]}>
      <AdminLayout>
        <Routes>
          <Route path="/integrations/:sourceId" element={<SourceDetailPage />} />
        </Routes>
      </AdminLayout>
    </MemoryRouter>
  );
}
