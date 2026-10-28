"use client";

import { useRoleGuard } from "@/hooks/useRoleGuard";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
    useRoleGuard("seller");
    return <>{children}</>;
}