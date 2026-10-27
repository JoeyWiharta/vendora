"use client";

import Image from "next/image";
import VendoraLogo from "@/app/assets/logo/vendora-logo.svg";
import Copyright from "@/components/common/copyright";
import { useRedirectIfLoggedIn } from "@/hooks/use-role-guard";
import { cn } from "@/lib/utils";
import AuthIllustration from "./_components/auth-illustration";

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    const { ready } = useRedirectIfLoggedIn();

    if (!ready) return null;

    return (
        <main className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_1fr]">
            <AuthIllustration />
            <section className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-xl space-y-8">
                    <div className="flex items-center gap-2.5 lg:hidden">
                        <Image src={VendoraLogo} alt="Vendora logo" width={40} height={40} />
                        <span className="text-2xl font-bold tracking-tight">Vendora</span>
                    </div>

                    <div
                        className={cn(
                            "space-y-8 rounded-xl bg-card p-8 shadow-xl shadow-primary/5 ring-1 ring-border sm:p-10",
                            !ready && "invisible"
                        )}
                    >
                        {children}
                    </div>

                    <div className="text-center">
                        <Copyright />
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AuthLayout;