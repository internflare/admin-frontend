import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminRoleProvider } from "@/polymet/components/admin-role-provider";
import { AdminAuthProvider } from "@/polymet/components/admin-auth-provider";
import LoginPage from "@/polymet/pages/login";

export default function LoginRender() {
  return (
    <MemoryRouter initialEntries={["/login"]}>
      <AdminRoleProvider>
        <AdminAuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<div className="p-10 text-center text-sm text-muted-foreground">Signed in — redirected to the console.</div>} />
          </Routes>
        </AdminAuthProvider>
      </AdminRoleProvider>
    </MemoryRouter>
  );
}
