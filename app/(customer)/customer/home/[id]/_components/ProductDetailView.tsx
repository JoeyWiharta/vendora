"use client";

import { useProductDetail } from "../_hooks/useProductDetail";
import ProductBackButton from "./ProductBackButton";
import ProductDetailError from "./ProductDetailError";
import ProductDetailSkeleton from "./ProductDetailSkeleton";
import ProductOverview from "./ProductOverview";
import PurchasePanel from "./PurchasePanel";

const ProductDetailView = ({ id }: { id: string }) => {
    const { data: product, isLoading, isError, error } = useProductDetail(id);

    if (isLoading) return <ProductDetailSkeleton />;
    if (isError || !product) return <ProductDetailError message={isError ? error.message : undefined} />;

    return (
        <div className="grid min-w-0 gap-4">
            <ProductBackButton />
            <ProductOverview product={product}>
                <PurchasePanel product={product} />
            </ProductOverview>
        </div>
    );
};

export default ProductDetailView;