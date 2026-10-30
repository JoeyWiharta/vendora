
"use client";

import PageLoader from "@/components/common/PageLoader";
import { useRoleGuard } from "@/hooks/useRoleGuard";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    const { ready } = useRoleGuard("customer");

    if (!ready) return <PageLoader />;

    return <>{children}</>;
}