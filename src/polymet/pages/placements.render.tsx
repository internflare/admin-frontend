import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import PlacementsPage from "@/polymet/pages/placements";

export default function PlacementsRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <PlacementsPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
