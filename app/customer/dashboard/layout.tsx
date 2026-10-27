"use client";

import { useRoleGuard } from "@/hooks/use-role-guard";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    useRoleGuard("customer");
    return <>{children}</>;
}