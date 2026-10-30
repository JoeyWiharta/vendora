"use client";

import PageLoader from "@/components/common/PageLoader";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const SellerGuard = ({ children }: { children: React.ReactNode }) => {
    const { ready } = useRoleGuard("seller");

    if (!ready) return <PageLoader />;

    return <>{children}</>;
};

export default SellerGuard;