"use client";

import Image from "next/image";
import VendoraLogo from "@/assets/logo/vendora-logo.svg";
import { SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { cn } from "cn";

const SellerSidebarHeader = () => {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <SidebarHeader className={cn("h-14 flex-row items-center gap-2 px-4", isCollapsed && "justify-center gap-0 px-0")}>
            <Image src={VendoraLogo} alt="Vendora logo" priority draggable={false} className={cn("aspect-square select-none", isCollapsed ? "size-7" : "size-8")} />
            {!isCollapsed && <span className="text-xl font-semibold tracking-wide">Vendora</span>}
        </SidebarHeader>
    );
};

export default SellerSidebarHeader;