import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import CompanyDirectoryPage from "@/polymet/pages/company-directory";

export default function CompanyDirectoryRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <CompanyDirectoryPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
