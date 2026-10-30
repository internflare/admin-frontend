import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import WorkspaceActivityPage from "@/polymet/pages/workspace-activity";

export default function WorkspaceActivityRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <WorkspaceActivityPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
