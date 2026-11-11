"use client";

import { LayoutGrid, Package, RefreshCw, Sparkles, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCustomerProducts } from "../../_hooks/useCustomerProducts";
import { ProductGrid, ProductGridSkeleton } from "./ProductGrid";

const Hero = () => (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary to-primary/60 p-6 text-primary-foreground md:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-24 size-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                <Sparkles className="size-3.5" />
                Fresh picks every visit
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-4xl">Find something you&apos;ll love</h1>
            <p className="mt-2 text-sm text-primary-foreground/80 md:text-base">
                Browse products from trusted sellers, all in one place.
            </p>
        </div>
    </div>
);

const Section = ({ icon: Icon, title, subtitle, children }: {
    icon: LucideIcon;
    title: string;
    subtitle?: string; children: React.ReactNode;
}) => (
    <section className="grid gap-4">
        <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
            </div>
            <div className="leading-tight">
                <h2 className="text-lg font-semibold">{title}</h2>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
        </div>
        {children}
    </section>
);

const DashboardView = () => {
    const { shuffled, recommended, isLoading, isError, error, refetch, isFetching } = useCustomerProducts();
    if (isLoading) {
        return (
            <div className="grid gap-8">
                <Hero />
                <Section icon={Sparkles} title="Recommended for you">
                    <ProductGridSkeleton />
                </Section>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card py-16 text-center">
                <p className="font-medium text-destructive">Failed to load products</p>
                <p className="max-w-sm text-sm text-muted-foreground">{error.message}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                    <RefreshCw className={cn(isFetching && "animate-spin")} />
                    Retry
                </Button>
            </div>
        );
    }

    if (!shuffled.length) {
        return (
            <div className="grid gap-8">
                <Hero />
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card py-16 text-center">
                    <Package className="size-10 text-muted-foreground" />
                    <p className="font-medium">No products available yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-10">
            <Hero />
            <Section icon={Sparkles} title="Recommended for you" subtitle="10 random picks, just for you">
                <ProductGrid products={recommended} />
            </Section>
            <Section icon={LayoutGrid} title="All products" subtitle={`${shuffled.length} products available`}>
                <ProductGrid products={shuffled} />
            </Section>
        </div>
    );
};

export default DashboardView;