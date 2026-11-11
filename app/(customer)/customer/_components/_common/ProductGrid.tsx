import ProductCard from "./ProductCard";
import type { CustomerProduct } from "../../_types/productTypes";

const GRID = "grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5";

export const ProductGrid = ({ products }: { products: CustomerProduct[] }) => (
    <div className={GRID}>
        {products.map((p) => (
            <ProductCard key={p.id} product={p} />
        ))}
    </div>
);

export const ProductGridSkeleton = ({ count = 10 }: { count?: number }) => (
    <div className={GRID}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border bg-card">
                <div className="aspect-square animate-pulse bg-muted" />
                <div className="grid gap-2 p-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                </div>
            </div>
        ))}
    </div>
);