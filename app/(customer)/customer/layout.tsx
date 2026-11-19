import CustomerGuard from "./_shared/_components/CustomerGuard";
import CustomerHeader from "./_shared/_components/CustomerHeader";
import CustomerFooter from "./_shared/_components/CustomerFooter";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return (
        <CustomerGuard>
            <div className="flex min-h-dvh flex-col bg-muted/30 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
                <CustomerHeader />
                <main className="mx-auto flex w-full max-w-384 flex-1 flex-col px-4 py-4 md:px-6 md:py-6">{children}</main>
                <CustomerFooter />
            </div>
        </CustomerGuard>
    );
}