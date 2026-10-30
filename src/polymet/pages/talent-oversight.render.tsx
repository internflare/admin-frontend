import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import TalentOversightPage from "@/polymet/pages/talent-oversight";

export default function TalentOversightRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <TalentOversightPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
