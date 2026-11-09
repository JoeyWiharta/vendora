"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSellerProducts } from "../../_hooks/useSellerProducts";
import ProductForm from "./ProductForm";

interface EditProductViewProps {
    id: string;
}

const EditProductView = ({ id }: EditProductViewProps) => {
    const { data: products, isLoading } = useSellerProducts();

    const product = products?.find((item) => item.id === id);

    if (isLoading) {
        return <Skeleton className="h-96 w-full rounded-xl" />;
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
                <p className="font-medium">Product not found</p>

                <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href="/seller/my-products" />}
                >
                    Back to products
                </Button>
            </div>
        );
    }

    return <ProductForm key={product.id} product={product} />;
};

export default EditProductView;