import { LogoutButton } from "@/components/common/LogoutButton";

export const instant = false;

export default function CustomerDashboardPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
            <h1 className="text-2xl font-bold">Customer Dashboard</h1>
            <LogoutButton />
        </main>
    );
}