import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "./ProductCard";
import type { HomeProductTypes } from "../_types/homeProductTypes";

const PRIORITY_COUNT = 5;

type ProductGridProps = {
    products: HomeProductTypes[];
    prioritizeFirst?: boolean;
};

export const ProductGrid = ({ products, prioritizeFirst = false }: ProductGridProps) => (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product, index) => (
            <ProductCard
                key={product.id}
                product={product}
                priority={prioritizeFirst && index < PRIORITY_COUNT}
            />
        ))}
    </div>
);

export const ProductGridSkeleton = ({ count = 10 }: { count?: number }) => (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: count }, (_, i) => (
            <Card key={i} className="gap-0 overflow-hidden rounded-2xl py-0 shadow-sm">
                <Skeleton className="aspect-square w-full rounded-none" />
                <CardContent className="grid gap-1.5 p-3">
                    <div className="grid min-h-10 content-start gap-1.5">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-2/3" />
                    </div>
                    <Skeleton className="h-6 w-1/3" />
                </CardContent>
            </Card>
        ))}
    </div>
);