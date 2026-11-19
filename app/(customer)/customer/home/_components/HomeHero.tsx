"use client";

import { ArrowRight, ShoppingBag, Sparkles, Star, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const scrollToSection = (id: string) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
    });
};

const HomeHero = () => {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-primary to-primary/70 p-6 text-primary-foreground shadow-lg md:p-12">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-size-[20px_20px] opacity-[0.12]" />
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-white/10 blur-3xl" />

            <div className="relative grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
                <div className="max-w-xl">
                    <Badge className="h-auto gap-1.5 border-transparent bg-white/15 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur">
                        <Sparkles className="size-3.5" />
                        Fresh picks every visit
                    </Badge>

                    <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
                        Find something{" "}
                        <span className="underline decoration-white/40 decoration-4 underline-offset-4">
                            you&apos;ll love
                        </span>
                    </h1>

                    <p className="mt-3 text-sm text-primary-foreground/80 md:text-base">
                        Browse products from trusted sellers, all in one place.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Button
                            size="lg"
                            variant="secondary"
                            onClick={() => scrollToSection("recommended")}
                            className="group h-11 rounded-full bg-background px-6 font-semibold text-primary shadow-sm hover:bg-background/90 hover:shadow-md active:scale-95"
                        >
                            Start shopping
                            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                        </Button>

                        <Button
                            size="lg"
                            variant="ghost"
                            onClick={() => scrollToSection("all-products")}
                            className="h-11 rounded-full border border-white/30 px-6 font-semibold text-primary-foreground hover:bg-white/10 hover:text-primary-foreground active:scale-95 dark:hover:bg-white/10"
                        >
                            All products
                        </Button>
                    </div>
                </div>

                <div aria-hidden className="relative hidden h-52 md:block">
                    <div className="absolute right-4 top-0 flex w-52 -rotate-6 items-center gap-3 rounded-2xl bg-white/15 p-4 shadow-lg backdrop-blur-md">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-white/20">
                            <ShoppingBag className="size-5" />
                        </div>
                        <div className="grid gap-1.5">
                            <Skeleton className="h-2.5 w-20 animate bg-white/50" />
                            <Skeleton className="h-2 w-12 animate bg-white/30" />
                        </div>
                    </div>

                    <div className="absolute bottom-2 left-2 flex w-56 rotate-3 items-center gap-3 rounded-2xl bg-white/20 p-4 shadow-lg backdrop-blur-md">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-white/25">
                            <Tag className="size-5" />
                        </div>
                        <div className="grid gap-1.5">
                            <Skeleton className="h-2.5 w-20 animate bg-white/50" />
                            <Skeleton className="h-2 w-12 animate bg-white/30" />
                        </div>
                    </div>

                    <Badge className="absolute right-0 top-24 h-auto gap-1 border-transparent bg-background px-3 py-1.5 text-xs font-semibold text-primary shadow-lg">
                        <Star className="size-3.5 fill-current" />
                        4.9 trusted sellers
                    </Badge>
                </div>
            </div>
        </div>
    );
};

export default HomeHero;