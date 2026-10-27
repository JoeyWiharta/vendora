"use client";

import { useRoleGuard } from "@/hooks/use-role-guard";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
    useRoleGuard("seller");
    return <>{children}</>;
}