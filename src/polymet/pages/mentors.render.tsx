import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import MentorsPage from "@/polymet/pages/mentors";

export default function MentorsRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <MentorsPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
