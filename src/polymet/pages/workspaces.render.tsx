import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import WorkspacesPage from "@/polymet/pages/workspaces";

export default function WorkspacesRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <WorkspacesPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
