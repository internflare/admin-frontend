import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import WorkspaceDetailPage from "@/polymet/pages/workspace-detail";

export default function WorkspaceDetailRender() {
  return (
    <MemoryRouter initialEntries={["/workspaces/WSP-301"]}>
      <AdminLayout>
        <Routes>
          <Route path="/workspaces/:workspaceId" element={<WorkspaceDetailPage />} />
        </Routes>
      </AdminLayout>
    </MemoryRouter>
  );
}
