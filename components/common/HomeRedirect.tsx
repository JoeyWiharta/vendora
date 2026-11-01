"use client";

import PageLoader from "@/components/common/PageLoader";
import { useHomeRedirect } from "@/hooks/useRoleGuard";

export default function HomeRedirect() {
    useHomeRedirect();
    return <PageLoader />;
}