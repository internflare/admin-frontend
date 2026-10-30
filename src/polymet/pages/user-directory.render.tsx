import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import UserDirectoryPage from "@/polymet/pages/user-directory";

export default function UserDirectoryRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <UserDirectoryPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
