import { Skeleton } from "@/components/ui/skeleton";

const ProductDetailSkeleton = () => (
    <div className="grid gap-6">
        <Skeleton className="h-8 w-36" />
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
            <Skeleton className="aspect-square w-full rounded-3xl" />
            <div className="grid content-start gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-9 w-3/4" />
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-52 w-full rounded-2xl" />
            </div>
        </div>
    </div>
);

export default ProductDetailSkeleton;