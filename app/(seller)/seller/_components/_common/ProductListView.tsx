// app/(seller)/seller/_components/product/ProductListView.tsx
"use client";

import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSellerProducts } from "../../_hooks/useSellerProducts";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const formatDate = (timestamp: Timestamp) =>
    new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(timestamp.toDate());

const ProductListView = () => {
    const { data: products, isLoading, isError, error } = useSellerProducts();

    if (isLoading) {
        return (
            <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (isError) {
        console.error("Product list error:", error);
        return <p className="text-sm text-destructive">Failed to load products: {error.message}</p>;
    }

    if (!products?.length) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
                <Package className="size-10 text-muted-foreground" />
                <p className="font-medium">No products yet</p>
                <p className="text-sm text-muted-foreground">Products you add will show up here.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right">Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((p) => (
                        <TableRow key={p.id} className="relative cursor-pointer hover:bg-muted/50">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                        {p.productImage ? (
                                            <Image
                                                src={p.productImage}
                                                alt={p.productName}
                                                width={40}
                                                height={40}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <Package className="size-4 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <Link
                                            href={`/seller/my-products/${p.id}`}
                                            className="truncate font-medium after:absolute after:inset-0 after:content-['']"
                                        >
                                            {p.productName}
                                        </Link>
                                        <p className="truncate text-xs text-muted-foreground">{p.description}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">{p.productCategory}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatRupiah(p.productPrice)}</TableCell>
                            <TableCell className="text-right">
                                <span className={p.productStock <= 5 ? "font-medium text-destructive" : ""}>
                                    {p.productStock}
                                </span>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default ProductListView;