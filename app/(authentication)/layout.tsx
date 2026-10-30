import Image from "next/image";
import VendoraLogo from "@/assets/logo/vendora-logo.svg";
import AuthIllustration from "./_components/AuthIllustration";
import { Card } from "@/components/ui/card";
import ThemeToggle from "@/components/common/ThemeToggle";
import AuthGuard from "./_components/AuthGuard";

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <AuthGuard>
            <main className="relative flex min-h-screen items-center justify-center bg-background">
                <div className="absolute right-4 top-4">
                    <ThemeToggle />
                </div>
                <div className="grid w-full max-w-screen-2xl md:min-h-[min(100vh,56rem)] md:grid-cols-2">
                    <AuthIllustration />
                    <section className="flex items-center justify-center p-4 sm:p-6 lg:p-10">
                        <div className="w-full max-w-md space-y-6 lg:space-y-8">
                            <div className="flex items-center gap-2.5 md:hidden">
                                <Image src={VendoraLogo} alt="Vendora logo" width={40} height={40} />
                                <span className="text-2xl font-bold tracking-tight">Vendora</span>
                            </div>
                            <Card className="shadow-xl shadow-primary/10">
                                {children}
                            </Card>
                        </div>
                    </section>
                </div>
            </main>
        </AuthGuard>
    );
};

export default AuthLayout;