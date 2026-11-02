import { Sidebar, SidebarInset, SidebarProvider, SidebarSeparator } from "@/components/ui/sidebar";
import SellerGuard from "./_components/guard/SellerGuard";
import SellerHeader from "./_components/header/SellerHeader";
import SellerSidebarContent from "./_components/sidebar/SellerSidebarContent";
import SellerSidebarFooter from "./_components/sidebar/SellerSidebarFooter";
import SellerSidebarHeader from "./_components/sidebar/SellerSidebarHeader";

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