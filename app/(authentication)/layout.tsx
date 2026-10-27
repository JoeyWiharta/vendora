"use client";

import Image from "next/image";
import VendoraLogo from "@/app/assets/logo/vendora-logo.svg";
import AuthIllustration from "./_components/AuthIllustration";

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background">
            <div className="grid w-full max-w-screen-2xl md:min-h-[min(100vh,56rem)] md:grid-cols-2">
                <AuthIllustration />
                <section className="flex items-center justify-center p-4 sm:p-6 lg:p-10">
                    <div className="w-full max-w-md space-y-6 lg:space-y-8">
                        <div className="flex items-center gap-2.5 md:hidden">
                            <Image src={VendoraLogo} alt="Vendora logo" width={40} height={40} />
                            <span className="text-2xl font-bold tracking-tight">Vendora</span>
                        </div>

                        <div className="space-y-8 rounded-xl bg-card p-6 shadow-xl shadow-primary/5 ring-1 ring-border sm:p-8 lg:p-10">
                            {children}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default AuthLayout;