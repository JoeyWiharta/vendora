"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { dashboardPath } from "@/app/(authentication)/_services/authService";
import type { UserRole } from "@/app/(authentication)/_types/authTypes";

// Untuk halaman customer / seller
export function useRoleGuard(required: UserRole) {
    const user = useAuthStore((s) => s.user);
    const hydrated = useAuthStore((s) => s.hydrated);
    const router = useRouter();

    useEffect(() => {
        useAuthStore.persist.rehydrate();
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        if (!user) router.replace("/login");
        else if (user.role !== required) router.replace(dashboardPath(user.role));
    }, [hydrated, user, required, router]);
}

// Untuk /login dan /register
export function useRedirectIfLoggedIn() {
    const user = useAuthStore((s) => s.user);
    const hydrated = useAuthStore((s) => s.hydrated);
    const router = useRouter();

    useEffect(() => {
        useAuthStore.persist.rehydrate();
    }, []);

    useEffect(() => {
        if (hydrated && user) router.replace(dashboardPath(user.role));
    }, [hydrated, user, router]);

    return { ready: hydrated && !user };
}