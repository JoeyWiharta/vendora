import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from "@/lib/formatter";

interface ProductPaginationProps {
    pageSizeOptions: number[];
    maxPageButtons: number;
    totalData: number;
    startIndex: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
    handlePageSize: (value: string | null) => void;
}

const ProductPagination = (props: ProductPaginationProps) => {
    const count = Math.min(props.maxPageButtons, props.totalPages);
    const start = Math.min(Math.max(1, props.currentPage - 1), props.totalPages - count + 1);
    const pages = Array.from({ length: count }, (_, i) => start + i);
    const isFirst = props.currentPage === 1;
    const isLast = props.currentPage === props.totalPages;
    const endIndex = Math.min(props.startIndex + props.pageSize, props.totalData);

    return (
        <div className="flex flex-col gap-3 border-t px-4 py-3 md:flex-row md:items-center md:justify-between">
            <p className="text-center text-xs text-muted-foreground md:text-left">
                Showing {props.startIndex + 1}-{endIndex} of {formatNumber(props.totalData)}
                <span className="hidden sm:inline"> products</span>
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between md:justify-end md:gap-6">
                <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap text-xs text-muted-foreground">Rows per page</span>
                    <Select value={String(props.pageSize)} onValueChange={props.handlePageSize}>
                        <SelectTrigger size="sm" className="w-[4.5rem]" aria-label="Rows per page">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false} sideOffset={4}>
                            {props.pageSizeOptions.map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <nav aria-label="Pagination" className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 sm:inline-flex"
                        aria-label="First page"
                        disabled={isFirst}
                        onClick={() => props.handlePageChange(1)}
                    >
                        <ChevronsLeft />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        aria-label="Previous page"
                        disabled={isFirst}
                        onClick={() => props.handlePageChange(props.currentPage - 1)}
                    >
                        <ChevronLeft />
                    </Button>

                    {pages.map((page) => (
                        <Button
                            key={page}
                            variant={page === props.currentPage ? "default" : "outline"}
                            size="icon"
                            className="size-8 text-xs"
                            aria-label={`Page ${page}`}
                            aria-current={page === props.currentPage ? "page" : undefined}
                            onClick={() => props.handlePageChange(page)}
                        >
                            {page}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        aria-label="Next page"
                        disabled={isLast}
                        onClick={() => props.handlePageChange(props.currentPage + 1)}
                    >
                        <ChevronRight />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 sm:inline-flex"
                        aria-label="Last page"
                        disabled={isLast}
                        onClick={() => props.handlePageChange(props.totalPages)}
                    >
                        <ChevronsRight />
                    </Button>
                </nav>
            </div>
        </div>
    );
};

export default ProductPagination;