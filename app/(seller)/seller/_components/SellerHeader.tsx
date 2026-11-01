// app/(seller)/_components/SellerHeader.tsx
"use client";

import ThemeToggle from "@/components/common/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

const SellerHeader = () => {
    return (
        <header className="flex h-14 items-center justify-between border-b px-4">
            <SidebarTrigger />
            <ThemeToggle />
        </header>
    );
};

export default SellerHeader;