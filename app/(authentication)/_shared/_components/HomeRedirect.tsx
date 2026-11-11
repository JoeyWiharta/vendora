"use client";

import { authPath } from "@/app/(authentication)/_shared/_utils/authPath";
import PageLoader from "@/components/common/PageLoader";
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const HomeRedirect = () => {
    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            router.replace(user ? authPath(user.role) : "/login");
        } else {
            return;
        }
    }, [loading, user, router])

    return (
        <PageLoader />
    );
}
export default HomeRedirect