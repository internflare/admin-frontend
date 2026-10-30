import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import UserDetailPage from "@/polymet/pages/user-detail";

export default function UserDetailRender() {
  return (
    <MemoryRouter initialEntries={["/users/USR-10422"]}>
      <AdminLayout>
        <Routes>
          <Route path="/users/:userId" element={<UserDetailPage />} />
        </Routes>
      </AdminLayout>
    </MemoryRouter>
  );
}
