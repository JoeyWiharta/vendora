"use client";

import Image from "next/image";
import VendoraLogo from "@/assets/logo/vendora-logo.svg";
import { SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { cn } from "cn";

const SellerSidebarHeader = () => {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <SidebarHeader className={cn("h-14 flex-row items-center gap-3 px-4", isCollapsed && "justify-center gap-0 px-0")}>
            <Image src={VendoraLogo} alt="Vendora logo" priority draggable={false} className="aspect-square size-8 select-none" />
            {!isCollapsed && <span className="text-xl font-semibold">Vendora</span>}
        </SidebarHeader>
    );
};

export default SellerSidebarHeader;