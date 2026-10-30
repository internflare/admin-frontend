import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import VerificationReviewPage from "@/polymet/pages/verification-review";

export default function VerificationReviewRender() {
  return (
    <MemoryRouter initialEntries={["/verification/VER-5101"]}>
      <AdminLayout>
        <Routes>
          <Route path="/verification/:requestId" element={<VerificationReviewPage />} />
        </Routes>
      </AdminLayout>
    </MemoryRouter>
  );
}
