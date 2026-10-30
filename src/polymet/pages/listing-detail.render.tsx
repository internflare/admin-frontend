import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import ListingDetailPage from "@/polymet/pages/listing-detail";

export default function ListingDetailRender() {
  return (
    <MemoryRouter initialEntries={["/listings/LST-8812"]}>
      <AdminLayout>
        <Routes>
          <Route path="/listings/:listingId" element={<ListingDetailPage />} />
        </Routes>
      </AdminLayout>
    </MemoryRouter>
  );
}
