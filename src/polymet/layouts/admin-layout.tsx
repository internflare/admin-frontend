import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AdminSidebar } from "@/polymet/layouts/admin-sidebar";
import { AdminTopbar } from "@/polymet/layouts/admin-topbar";

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="min-w-0 bg-background">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
      </SidebarInset>
      <Toaster position="bottom-right" richColors closeButton />
    </SidebarProvider>
  );
}
