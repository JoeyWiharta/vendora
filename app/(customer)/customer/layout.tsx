import CustomerGuard from "./_components/CustomerGuard";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return <CustomerGuard>{children}</CustomerGuard>;
}