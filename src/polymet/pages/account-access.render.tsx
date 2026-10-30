import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import AccountAccessPage from "@/polymet/pages/account-access";

export default function AccountAccessRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <AccountAccessPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
