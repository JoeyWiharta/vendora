"use client";

import PageLoader from "@/components/common/PageLoader";
import { useRoleGuard } from "@/hooks/useRoleGuard";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
    const { ready } = useRoleGuard("seller");

    if (!ready) return <PageLoader />;

    return <>{children}</>;
}