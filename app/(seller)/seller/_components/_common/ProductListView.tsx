"use client";

import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Package, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatNumber, formatRupiah } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { useSellerProducts } from "../../_hooks/useSellerProducts";
import type { Product } from "../../_types/productTypes";

const LOW_STOCK = 5;

const headClass = "h-11 text-xs font-medium uppercase tracking-wide text-muted-foreground";

const ProductListView = () => {
    const { data: products, isLoading, isError, error, refetch, isFetching } = useSellerProducts();

    const handleEdit = (product: Product) => {
        toast.info(`Edit: ${product.productName}`);
    };

    const handleDelete = (product: Product) => {
        toast.info(`Delete: ${product.productName}`);
    };

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-card p-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="size-12 shrink-0 rounded-lg" />
                        <div className="grid flex-1 gap-1.5">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="hidden h-4 w-20 sm:block" />
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        console.error("Product list error:", error);
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
                <p className="font-medium text-destructive">Failed to load products</p>
                <p className="max-w-sm text-sm text-muted-foreground">{error.message}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                    <RefreshCw className={cn(isFetching && "animate-spin")} />
                    Retry
                </Button>
            </div>
        );
    }

    if (!products?.length) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
                <Package className="size-10 text-muted-foreground" />
                <div>
                    <p className="font-medium">No products yet</p>
                    <p className="text-sm text-muted-foreground">Products you add will show up here.</p>
                </div>
                <Button size="sm" nativeButton={false} render={<Link href="/seller/my-products/add" />}>
                    <Plus />
                    Add Product
                </Button>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className={cn(headClass, "w-[45%] pl-4")}>Product</TableHead>
                        <TableHead className={cn(headClass, "hidden md:table-cell")}>Category</TableHead>
                        <TableHead className={cn(headClass, "text-right")}>Price</TableHead>
                        <TableHead className={cn(headClass, "text-right")}>Stock</TableHead>
                        <TableHead className={cn(headClass, "hidden text-right lg:table-cell")}>Created</TableHead>
                        <TableHead className={cn(headClass, "w-12 pr-4")}>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {products.map((p) => (
                        <TableRow key={p.id} className="relative cursor-pointer hover:bg-muted/40">
                            {/* Product */}
                            <TableCell className="max-w-0 py-3 pl-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                        {p.productImage ? (
                                            <Image
                                                src={p.productImage}
                                                alt={p.productName}
                                                width={48}
                                                height={48}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <Package className="size-4 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <Link
                                            href={`/seller/my-products/${p.id}`}
                                            className="block truncate font-medium after:absolute after:inset-0 after:content-['']"
                                        >
                                            {p.productName}
                                        </Link>
                                        <p className="truncate text-xs text-muted-foreground">{p.description}</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground lg:hidden">
                                            {formatDate(p.createdAt.toDate())}
                                        </p>
                                    </div>
                                </div>
                            </TableCell>

                            {/* Category */}
                            <TableCell className="hidden md:table-cell">
                                <Badge variant="secondary">{p.productCategory}</Badge>
                            </TableCell>

                            {/* Price */}
                            <TableCell className="whitespace-nowrap text-right font-medium">
                                {formatRupiah(p.productPrice)}
                            </TableCell>

                            {/* Stock */}
                            <TableCell className="whitespace-nowrap text-right">
                                {p.productStock === 0 ? (
                                    <Badge variant="destructive">Out of stock</Badge>
                                ) : (
                                    <span className={cn(p.productStock <= LOW_STOCK && "font-medium text-destructive")}>
                                        {formatNumber(p.productStock)}
                                        {p.productStock <= LOW_STOCK && <span className="ml-1 text-xs">Low</span>}
                                    </span>
                                )}
                            </TableCell>

                            {/* Created */}
                            <TableCell className="hidden whitespace-nowrap text-right text-muted-foreground lg:table-cell">
                                {formatDate(p.createdAt.toDate())}
                            </TableCell>

                            {/* Actions: z-10 supaya di atas link overlay baris */}
                            <TableCell className="relative z-10 pr-4 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        render={<Button variant="ghost" size="icon" className="size-8" aria-label="Open actions" />}
                                    >
                                        <MoreHorizontal />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(p)}>
                                            <Pencil />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(p)}>
                                            <Trash2 />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default ProductListView;