// app/(seller)/seller/_components/header/SellerHeader.tsx
"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const TITLES: Record<string, string> = {
    "/seller/product-list": "Product List",
    "/seller/orders": "Order List",
    "/seller/history": "History List",
    "/seller/profile": "Profile",
};

const SellerHeader = () => {
    const pathname = usePathname();
    const title = Object.entries(TITLES).find(([path]) => pathname.startsWith(path))?.[1];

    return (
        <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-medium">{title}</span>
        </header>
    );
};

export default SellerHeader;