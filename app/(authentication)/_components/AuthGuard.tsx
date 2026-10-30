"use client";

import PageLoader from "@/components/common/PageLoader";
import { useRedirectIfLoggedIn } from "@/hooks/useRoleGuard";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const { ready } = useRedirectIfLoggedIn();

    if (!ready) return <PageLoader />;

    return <>{children}</>;
};

export default AuthGuard;