import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import ListingsPage from "@/polymet/pages/listings";

export default function ListingsRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <ListingsPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
