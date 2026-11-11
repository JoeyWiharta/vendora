import CustomerGuard from "./_components/_guard/CustomerGuard";
import CustomerHeader from "./_components/_layout/CustomerHeader";
import CustomerFooter from "./_components/_layout/CustomerFooter";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return (
        <CustomerGuard>
            <div className="flex min-h-screen flex-col bg-muted/30">
                <CustomerHeader />
                <main className="mx-auto w-full max-w-384 flex-1 px-4 py-4 md:px-6 md:py-6">{children}</main>
                <CustomerFooter />
            </div>
        </CustomerGuard>
    );
}