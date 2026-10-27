"use client";

import { LogoutButton } from "@/app/(authentication)/_components/logout-button";
import { useRoleGuard } from "@/hooks/use-role-guard";

export default function CustomerDashboardPage() {

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
            <h1 className="text-2xl font-bold">Customer Dashboard</h1>
            {/* <p className="text-muted-foreground">{user?.email || ""}</p> */}
            <LogoutButton />
        </main>
    );
}