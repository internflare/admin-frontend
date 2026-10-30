import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import CompanyDetailPage from "@/polymet/pages/company-detail";

export default function CompanyDetailRender() {
  return (
    <MemoryRouter initialEntries={["/companies/CMP-2001"]}>
      <AdminLayout>
        <Routes>
          <Route path="/companies/:companyId" element={<CompanyDetailPage />} />
        </Routes>
      </AdminLayout>
    </MemoryRouter>
  );
}
