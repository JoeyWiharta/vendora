import { Sidebar, SidebarInset, SidebarProvider, SidebarSeparator } from "@/components/ui/sidebar";
import SellerGuard from "./_components/_layout/SellerGuard";
import SellerHeader from "./_components/_layout/SellerHeader";
import SellerSidebarContent from "./_components/_layout/SellerSidebarContent";
import SellerSidebarFooter from "./_components/_layout/SellerSidebarFooter";
import SellerSidebarHeader from "./_components/_layout/SellerSidebarHeader";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
    return (
        <SellerGuard>
            <SidebarProvider>
                <Sidebar collapsible="icon">
                    <SellerSidebarHeader />
                    <SidebarSeparator className="mx-auto w-[90%]!" />
                    <SellerSidebarContent />
                    <SidebarSeparator className="mx-auto w-[90%]!" />
                    <SellerSidebarFooter />
                </Sidebar>

                <SidebarInset>
                    <SellerHeader />
                    <main className="flex-1 p-4 md:p-6">{children}</main>
                </SidebarInset>
            </SidebarProvider>
        </SellerGuard>
    );
}