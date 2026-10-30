import { BrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/polymet/layouts/admin-layout";
import TransactionsPage from "@/polymet/pages/transactions";

export default function TransactionsRender() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <TransactionsPage />
      </AdminLayout>
    </BrowserRouter>
  );
}
