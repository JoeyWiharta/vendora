"use client";

import { useRoleGuard } from "@/hooks/useRoleGuard";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    useRoleGuard("customer");
    return <>{children}</>;
}