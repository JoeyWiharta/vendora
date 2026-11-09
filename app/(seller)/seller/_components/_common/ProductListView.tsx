"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Package,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PRODUCT_CATEGORIES } from "@/constants/ProductCategory";
import { formatDate, formatNumber, formatRupiah } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { useSellerProducts } from "../../_hooks/useSellerProducts";
import { useDeleteProducts } from "../../_hooks/useDeleteProduct";
import type { Product } from "../../_types/productTypes";
import DeleteProductDialog from "./DeleteProductDialog";

const LOW_STOCK = 5;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;
const ALL = "All";

const headClass = "h-11 text-xs font-medium uppercase tracking-wide text-muted-foreground";

const ProductListView = () => {
    const router = useRouter();
    const { data: products, isLoading, isError, error, refetch, isFetching } = useSellerProducts();
    const deleteProducts = useDeleteProducts();

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string>(ALL);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [toDelete, setToDelete] = useState<Product[]>([]);

    // ---------- derived data ----------
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (products ?? []).filter(
            (p) =>
                (category === ALL || p.productCategory === category) &&
                (!q || p.productName.toLowerCase().includes(q)),
        );
    }, [products, search, category]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const pageItems = filtered.slice(startIndex, startIndex + pageSize);

    // hanya id yang masih ada di data (aman kalau produk sudah terhapus)
    const selectedProducts = useMemo(
        () => (products ?? []).filter((p) => selectedIds.has(p.id)),
        [products, selectedIds],
    );

    const allPageSelected = pageItems.length > 0 && pageItems.every((p) => selectedIds.has(p.id));
    const somePageSelected = pageItems.some((p) => selectedIds.has(p.id));

    // ---------- selection handlers ----------
    const toggleOne = (id: string, checked: boolean) =>
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });

    const togglePage = (checked: boolean) =>
        setSelectedIds((prev) => {
            const next = new Set(prev);
            pageItems.forEach((p) => (checked ? next.add(p.id) : next.delete(p.id)));
            return next;
        });

    const clearSelection = () => setSelectedIds(new Set());

    // ---------- filter handlers (selection di-reset supaya produk tersembunyi tidak ikut terhapus) ----------
    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
        clearSelection();
    };

    const handleCategory = (value: string | null) => {
        setCategory(value ?? ALL);
        setPage(1);
        clearSelection();
    };

    const handlePageSize = (value: string | null) => {
        setPageSize(Number(value) || DEFAULT_PAGE_SIZE);
        setPage(1);
    };

    // ---------- delete ----------
    const confirmDelete = () => {
        if (!toDelete.length) return;

        deleteProducts.mutate(toDelete, {
            onSettled: () => {
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    toDelete.forEach((p) => next.delete(p.id));
                    return next;
                });
                setToDelete([]);
            },
        });
    };

    // ---------- states ----------
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

    // ---------- main ----------
    return (
        <div className="grid gap-3">
            {/* Toolbar */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <InputGroup className="sm:max-w-xs">
                    <InputGroupAddon>
                        <Search className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="Search product name..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </InputGroup>

                <Select value={category} onValueChange={handleCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} sideOffset={4}>
                        <SelectItem value={ALL}>All categories</SelectItem>
                        {PRODUCT_CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                                {c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedProducts.length > 0 && (
                    <Button
                        variant="destructive"
                        className="sm:ml-auto"
                        onClick={() => setToDelete(selectedProducts)}
                    >
                        <Trash2 />
                        Delete ({selectedProducts.length})
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border bg-card">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className={cn(headClass, "w-10 pl-4")}>
                                <Checkbox
                                    aria-label="Select all on this page"
                                    checked={allPageSelected}
                                    indeterminate={!allPageSelected && somePageSelected}
                                    disabled={pageItems.length === 0}
                                    onCheckedChange={(c) => togglePage(!!c)}
                                />
                            </TableHead>
                            <TableHead className={cn(headClass, "w-[40%]")}>Product</TableHead>
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
                        {pageItems.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                                    No products match your search or filter.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pageItems.map((p) => (
                                <TableRow
                                    key={p.id}
                                    data-state={selectedIds.has(p.id) ? "selected" : undefined}
                                    className="hover:bg-muted/40"
                                >
                                    <TableCell className="pl-4">
                                        <Checkbox
                                            aria-label={`Select ${p.productName}`}
                                            checked={selectedIds.has(p.id)}
                                            onCheckedChange={(c) => toggleOne(p.id, !!c)}
                                        />
                                    </TableCell>

                                    <TableCell className="max-w-0 py-3">
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
                                                <p className="truncate font-medium">{p.productName}</p>
                                                <p className="truncate text-xs text-muted-foreground">{p.description}</p>
                                                <p className="mt-0.5 text-xs text-muted-foreground lg:hidden">
                                                    {formatDate(p.createdAt.toDate())}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="hidden md:table-cell">
                                        <Badge variant="secondary">{p.productCategory}</Badge>
                                    </TableCell>

                                    <TableCell className="whitespace-nowrap text-right font-medium">
                                        {formatRupiah(p.productPrice)}
                                    </TableCell>

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

                                    <TableCell className="hidden whitespace-nowrap text-right text-muted-foreground lg:table-cell">
                                        {formatDate(p.createdAt.toDate())}
                                    </TableCell>

                                    <TableCell className="pr-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger
                                                render={
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8"
                                                        aria-label="Open actions"
                                                    />
                                                }
                                            >
                                                <MoreHorizontal />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/seller/my-products/edit/${p.id}`)}
                                                >
                                                    <Pencil />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem variant="destructive" onClick={() => setToDelete([p])}>
                                                    <Trash2 />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {filtered.length > 0 && (
                    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filtered.length)} of{" "}
                            {formatNumber(filtered.length)} products
                            {selectedProducts.length > 0 && ` · ${selectedProducts.length} selected`}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            {/* Rows per page */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Rows per page</span>
                                <Select value={String(pageSize)} onValueChange={handlePageSize}>
                                    <SelectTrigger size="sm" className="w-[4.5rem]" aria-label="Rows per page">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent alignItemWithTrigger={false} sideOffset={4}>
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <SelectItem key={size} value={String(size)}>
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Page navigation */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    aria-label="Previous page"
                                    disabled={currentPage === 1}
                                    onClick={() => setPage(currentPage - 1)}
                                >
                                    <ChevronLeft />
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    Page {currentPage} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    aria-label="Next page"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setPage(currentPage + 1)}
                                >
                                    <ChevronRight />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete confirmation */}
            <DeleteProductDialog
                products={toDelete}
                open={toDelete.length > 0}
                isPending={deleteProducts.isPending}
                onOpenChange={(open) => {
                    if (!open) setToDelete([]);
                }}
                onConfirm={confirmDelete}
            />
        </div>
    );
};

export default ProductListView;