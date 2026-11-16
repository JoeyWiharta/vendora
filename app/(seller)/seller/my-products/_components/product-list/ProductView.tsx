"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSellerProducts } from "../../_hooks/useSellerProducts";
import { useDeleteProducts } from "../../_hooks/useDeleteProduct";
import type { Product } from "../../_types/productTypes";
import DeleteProductDialog from "../DeleteProductDialog";
import ProductToolbar from "./ProductToolbar";
import ProductTable from "./ProductTable";
import ProductPagination from "./ProductPagination";
import { ProductEmpty, ProductError, ProductLoading, ProductNoMatch } from "./ProductStates";

const ALL = "All";
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_BUTTONS = 3;
const LOW_STOCK = 5;
const NO_PRODUCTS: Product[] = [];
const ADD_HREF = "/seller/my-products/add";
const editHref = (id: string) => `/seller/my-products/edit/${id}`;

const ProductView = () => {
    const router = useRouter();
    const { data, isLoading, isError, error, refetch, isFetching } = useSellerProducts();
    const deleteProducts = useDeleteProducts();

    const [searchFilter, setSearchFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>(ALL);
    const [pageShow, setPageShow] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectedDeleteData, setSelectedDeleteData] = useState<Product[]>([]);

    const products = data ?? NO_PRODUCTS;

    const filtered = useMemo(() => {
        const q = searchFilter.trim().toLowerCase();
        return products.filter((p) =>
            (categoryFilter === ALL || p.productCategory === categoryFilter) && (!q || p.productName.toLowerCase().includes(q)),
        );
    }, [products, searchFilter, categoryFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(pageShow, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const pageItems = filtered.slice(startIndex, startIndex + pageSize);

    const selectedProducts = useMemo(
        () => products.filter((p) => selectedIds.has(p.id)),
        [products, selectedIds],
    );

    const allPageSelected = pageItems.length > 0 && pageItems.every((p) => selectedIds.has(p.id));
    const somePageSelected = pageItems.some((p) => selectedIds.has(p.id));

    const clearSelection = () => setSelectedIds(new Set());

    const updateSelection = (update: (next: Set<string>) => void) =>
        setSelectedIds((prev) => {
            const next = new Set(prev);
            update(next);
            return next;
        });

    const handleToggleOne = (id: string, checked: boolean) => updateSelection((next) => (checked ? next.add(id) : next.delete(id)));

    const handleTogglePage = (checked: boolean) => updateSelection((next) => pageItems.forEach((p) => (checked ? next.add(p.id) : next.delete(p.id))));

    const handleSearch = (value: string) => {
        setSearchFilter(value);
        setPageShow(1);
        clearSelection();
    };

    const handleCategory = (value: string | null) => {
        setCategoryFilter(value ?? ALL);
        setPageShow(1);
        clearSelection();
    };

    const handlePageSize = (value: string | null) => {
        setPageSize(Number(value) || DEFAULT_PAGE_SIZE);
        setPageShow(1);
    };

    const handleReset = () => {
        setSearchFilter("");
        setCategoryFilter(ALL);
        setPageShow(1);
        clearSelection();
    };

    const handleOpen = (id: string) => router.push(editHref(id));
    const handlePrefetch = (id: string) => router.prefetch(editHref(id));

    const closeDeleteDialog = () => setSelectedDeleteData([]);

    const confirmDelete = () => {
        if (!selectedDeleteData.length) return;
        deleteProducts.mutate(selectedDeleteData, {
            onSettled: () => {
                updateSelection((next) => selectedDeleteData.forEach((p) => next.delete(p.id)));
                closeDeleteDialog();
            },
        });
    };

    if (isLoading) return <ProductLoading rows={pageSize} />;

    if (isError) {
        console.error("Product list error:", error);
        return <ProductError message={error.message} isFetching={isFetching} handleRetry={() => refetch()} />;
    }

    if (products.length === 0) return <ProductEmpty addHref={ADD_HREF} />;

    return (
        <div className="flex flex-1 flex-col gap-3">
            <ProductToolbar
                allValue={ALL}
                searchFilter={searchFilter}
                categoryFilter={categoryFilter}
                selectedDeleteCount={selectedProducts.length}
                handleSearch={handleSearch}
                handleCategory={handleCategory}
                handleDelete={() => setSelectedDeleteData(selectedProducts)}
            />

            {filtered.length === 0 ? (
                <ProductNoMatch handleReset={handleReset} />
            ) : (
                <div className="overflow-hidden rounded-xl border bg-card">
                    <ProductTable
                        items={pageItems}
                        lowStock={LOW_STOCK}
                        selectedIds={selectedIds}
                        allSelected={allPageSelected}
                        someSelected={somePageSelected}
                        handleToggleOne={handleToggleOne}
                        handleTogglePage={handleTogglePage}
                        handleOpen={handleOpen}
                        handlePrefetch={handlePrefetch}
                    />

                    <ProductPagination
                        pageSizeOptions={PAGE_SIZE_OPTIONS}
                        maxPageButtons={MAX_PAGE_BUTTONS}
                        totalData={filtered.length}
                        startIndex={startIndex}
                        pageSize={pageSize}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        handlePageChange={setPageShow}
                        handlePageSize={handlePageSize}
                    />
                </div>
            )}

            <DeleteProductDialog
                products={selectedDeleteData}
                open={selectedDeleteData.length > 0}
                isPending={deleteProducts.isPending}
                handleOpenChange={(open) => {
                    if (!open) closeDeleteDialog();
                }}
                handleConfirm={confirmDelete}
            />
        </div>
    );
};

export default ProductView;