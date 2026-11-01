// app/(seller)/layout.tsx
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import SellerGuard from "./_components/SellerGuard";
import SellerSidebar from "./_components/SellerSidebar";
import SellerHeader from "./_components/SellerHeader";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
    return (
        <SellerGuard>
            <SidebarProvider>
                <SellerSidebar />
                <SidebarInset>
                    <SellerHeader />
                    <main className="flex-1 p-4 md:p-6">{children}</main>
                </SidebarInset>
            </SidebarProvider>
        </SellerGuard>
    );
}