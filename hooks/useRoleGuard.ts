// hooks/useRoleGuard.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authPath } from "@/app/(authentication)/_utils/authPath";
import type { UserRole } from "@/app/(authentication)/_types/authTypes";

export function useRoleGuard(required: UserRole) {
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

export function useRedirectIfLoggedIn() {
    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) router.replace(authPath(user.role));
    }, [loading, user, router]);

    return { ready: !loading && !user };
}

export function useHomeRedirect() {
    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        router.replace(user ? authPath(user.role) : "/login");
    }, [loading, user, router]);
}