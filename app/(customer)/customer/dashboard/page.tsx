import { LogoutButton } from "@/components/common/LogoutButton";

export const instant = false;

export default function CustomerDashboardPage() {
    return <>
        <h1 className="p-6 text-2xl font-bold">Customer Dashboard</h1>;
        <LogoutButton />
    </>
}