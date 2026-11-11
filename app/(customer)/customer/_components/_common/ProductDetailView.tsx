"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_PRODUCT_IMAGE } from "@/constants/ProductDefaultImage";
import { formatNumber, formatRupiah } from "@/lib/formatter";
import { useProductDetail } from "../../_hooks/useProductDetail";
import AddToCartForm from "./AddToCartForm";

const BackButton = () => (
    <Button variant="ghost" size="sm" className="w-fit" nativeButton={false} render={<Link href="/customer/dashboard" />}>
        <ArrowLeft />
        Back to dashboard
    </Button>
);

const ProductDetailView = ({ id }: { id: string }) => {
    const { data: product, isLoading, isError, error } = useProductDetail(id);

    if (isLoading) {
        return (
            <div className="grid gap-4">
                <Skeleton className="h-8 w-40" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <Skeleton className="h-96 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="grid gap-4">
                <BackButton />
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-card py-16 text-center">
                    <p className="font-medium">{isError ? "Failed to load product" : "Product not found"}</p>
                    {isError && <p className="text-sm text-muted-foreground">{error.message}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            <BackButton />

            <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
                <div className="relative aspect-square max-h-[calc(100vh-14rem)] w-full overflow-hidden rounded-2xl border bg-muted">
                    <Image
                        src={product.productImage || DEFAULT_PRODUCT_IMAGE}
                        alt={product.productName}
                        fill
                        priority
                        sizes="(min-width: 1024px) 32rem, 50vw"
                        className="object-cover"
                    />
                </div>

                <Card className="lg:sticky lg:top-20">
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Badge variant="secondary" className="w-fit">{product.productCategory}</Badge>
                            <h1 className="text-2xl font-bold leading-snug">{product.productName}</h1>
                            <p className="text-3xl font-bold text-primary">{formatRupiah(product.productPrice)}</p>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Stock:{" "}
                            <span className="font-medium text-foreground">{formatNumber(product.productStock)} pcs</span>
                        </p>

                        <Separator />

                        <div className="grid gap-1">
                            <h2 className="text-sm font-semibold">Description</h2>
                            <p className="whitespace-pre-line wrap-break-word text-sm text-muted-foreground">
                                {product.description}
                            </p>
                        </div>

                        <Separator />
                        <AddToCartForm productId={product.id} stock={product.productStock} />

                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProductDetailView;