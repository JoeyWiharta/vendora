"use client";

import PageLoader from "@/components/common/PageLoader";
import { useRoleGuard } from "@/hooks/useRoleGuard";

const CustomerGuard = ({ children }: { children: React.ReactNode }) => {
    const { ready } = useRoleGuard("customer");

    if (!ready) return <PageLoader />;

    return <>{children}</>;
};

export default CustomerGuard;