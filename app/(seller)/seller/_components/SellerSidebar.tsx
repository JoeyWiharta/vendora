// app/(seller)/_components/SellerSidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, History, LogOut, Package } from "lucide-react";
import VendoraLogo from "@/assets/logo/vendora-logo.svg";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLogout } from "@/app/(authentication)/_hooks/useLogout";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
    { label: "Product List", href: "/seller/dashboard", icon: Package },
    { label: "Order List", href: "/seller/orders", icon: ClipboardList },
    { label: "History List", href: "/seller/history", icon: History },
];

const SellerSidebar = () => {
    const pathname = usePathname();
    const email = useAuthStore((s) => s.user?.email);
    const { mutate: logout, isPending } = useLogout();

    return (
        <Sidebar>
            <SidebarHeader className="flex-row items-center gap-2.5 p-4">
                <Image src={VendoraLogo} alt="Vendora logo" width={32} height={32} />
                <span className="text-lg font-bold tracking-tight">Vendora</span>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                                <SidebarMenuItem key={href}>
                                    <SidebarMenuButton
                                        render={<Link href={href} />}
                                        isActive={pathname.startsWith(href)}
                                    >
                                        <Icon />
                                        <span>{label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="gap-2 p-4">
                {email && (
                    <p className="truncate text-xs text-muted-foreground">{email}</p>
                )}
                <SidebarMenuButton onClick={() => logout()} disabled={isPending}>
                    <LogOut />
                    <span>Sign out</span>
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>
    );
};

export default SellerSidebar;