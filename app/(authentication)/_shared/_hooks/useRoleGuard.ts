"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { authPath } from "@/app/(authentication)/_shared/_utils/authPath";
import type { UserRole } from "@/app/(authentication)/_shared/_types/authTypes";

export const useRoleGuard = (required: UserRole) => {
    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!user) router.replace("/login");
        else if (user.role !== required) router.replace(authPath(user.role));
    }, [loading, user, required, router]);

    return { ready: !loading && user?.role === required };
}


