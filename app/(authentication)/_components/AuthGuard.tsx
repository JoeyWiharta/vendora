"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageLoader from "@/components/common/PageLoader";
import { useAuthStore } from "@/store/authStore";
import { authPath } from "../_utils/authPath";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) router.replace(authPath(user.role));
    }, [loading, user, router]);

    const ready = !loading && !user;

    if (ready) {
        return <>{children}</>;
    } else {
        return <PageLoader />;
    }
};

export default AuthGuard;