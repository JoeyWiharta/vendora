"use client";

import Autoplay from "embla-carousel-autoplay";
import { BadgeCheck, Headset, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const BENEFITS: { icon: LucideIcon; title: string; desc: string }[] = [
    { icon: Truck, title: "Fast delivery", desc: "Sent straight to your door" },
    { icon: ShieldCheck, title: "Secure payment", desc: "Your transactions are safe" },
    { icon: BadgeCheck, title: "Trusted sellers", desc: "Verified by Vendora" },
    { icon: Headset, title: "Friendly support", desc: "Here whenever you need help" },
];

const HomeBenefits = () => {
    return (
        <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]}
            className="w-full min-w-0"
        >
            <CarouselContent className="-ml-3">
                {BENEFITS.map(({ icon: Icon, title, desc }) => (
                    <CarouselItem key={title} className="basis-full pl-3 sm:basis-1/2 lg:basis-1/4">
                        <Card className="h-full rounded-2xl border py-0 shadow-none ring-0">
                            <CardContent className="flex flex-row items-center gap-3 p-3 md:p-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon className="size-5" />
                                </div>
                                <div className="min-w-0 leading-tight">
                                    <p className="truncate text-sm font-semibold">{title}</p>
                                    <p className="line-clamp-1 text-xs text-muted-foreground">{desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    );
};

export default HomeBenefits;