import { Sidebar, SidebarInset, SidebarProvider, SidebarSeparator } from "@/components/ui/sidebar";
import SellerGuard from "./_shared/_components/SellerGuard";
import LayoutHeader from "./_shared/_components/LayoutHeader";
import ContentSidebar from "./_shared/_components/ContentSidebar";
import FooterSidebar from "./_shared/_components/FooterSidebar";
import HeaderSidebar from "./_shared/_components/HeaderSidebar";
import LayoutFooter from "./_shared/_components/LayoutFooter";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
    return (
        <SellerGuard>
            <SidebarProvider>
                <Sidebar collapsible="icon">
                    <HeaderSidebar />
                    <ContentSidebar />
                    <FooterSidebar />
                </Sidebar>

                <SidebarInset>
                    <LayoutHeader />
                    <main className="flex-1 px-4 md:px-6">{children}</main>
                    <LayoutFooter />
                </SidebarInset>
            </SidebarProvider>
        </SellerGuard>
    );
}