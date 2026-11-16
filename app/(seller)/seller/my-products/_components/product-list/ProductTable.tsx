import Image from "next/image";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatNumber, formatRupiah } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import type { Product } from "../../_types/productTypes";

const headClass = "h-11 text-xs font-medium uppercase tracking-wide text-muted-foreground";

const formatTimestamp = (value: Product["updatedAt"] | Product["createdAt"]) => typeof value === "string" ? value : formatDate(value.toDate());

interface ProductRowProps {
    product: Product;
    lowStock: number;
    selected: boolean;
    handleToggle: (checked: boolean) => void;
    handleOpen: () => void;
    handlePrefetch: () => void;
}

const ProductRow = (props: ProductRowProps) => {
    const { product: p } = props;
    const updated = formatTimestamp(p.updatedAt);
    const created = formatTimestamp(p.createdAt);
    const isLowStock = p.productStock <= props.lowStock;

    return (
        <TableRow
            tabIndex={0}
            data-state={props.selected ? "selected" : undefined}
            className="cursor-pointer hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
            onClick={props.handleOpen}
            onMouseEnter={props.handlePrefetch}
            onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    props.handleOpen();
                }
            }}
        >
            <TableCell className="pl-4" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <Checkbox
                    aria-label={`Select ${p.productName}`}
                    checked={props.selected}
                    onCheckedChange={(c) => props.handleToggle(!!c)}
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
                        <p className="mt-0.5 text-xs text-muted-foreground lg:hidden">{updated}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground lg:hidden">{created}</p>
                    </div>
                </div>
            </TableCell>

            <TableCell className="hidden md:table-cell">
                <Badge variant="secondary">{p.productCategory}</Badge>
            </TableCell>

            <TableCell className="whitespace-nowrap text-right font-medium">{formatRupiah(p.productPrice)}</TableCell>

            <TableCell className="whitespace-nowrap pr-4 text-right lg:pr-2">
                {p.productStock === 0 ? (
                    <Badge variant="destructive">Out of stock</Badge>
                ) : (
                    <span className={cn(isLowStock && "font-medium text-destructive")}>
                        {formatNumber(p.productStock)}
                        {isLowStock && <span className="ml-1 text-xs">Low</span>}
                    </span>
                )}
            </TableCell>

            <TableCell className="hidden whitespace-nowrap pr-4 text-right text-muted-foreground lg:table-cell">
                {updated}
            </TableCell>
            <TableCell className="hidden whitespace-nowrap pr-4 text-right text-muted-foreground lg:table-cell">
                {created}
            </TableCell>
        </TableRow>
    );
};

interface ProductTableProps {
    items: Product[];
    lowStock: number;
    selectedIds: Set<string>;
    allSelected: boolean;
    someSelected: boolean;
    handleToggleOne: (id: string, checked: boolean) => void;
    handleTogglePage: (checked: boolean) => void;
    handleOpen: (id: string) => void;
    handlePrefetch: (id: string) => void;
}

const ProductTable = (props: ProductTableProps) => (
    <Table>
        <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
                <TableHead className={cn(headClass, "w-10 pl-4")}>
                    <Checkbox
                        aria-label="Select all on this page"
                        checked={props.allSelected}
                        indeterminate={!props.allSelected && props.someSelected}
                        onCheckedChange={(c) => props.handleTogglePage(!!c)}
                    />
                </TableHead>
                <TableHead className={cn(headClass, "w-[40%]")}>Product</TableHead>
                <TableHead className={cn(headClass, "hidden md:table-cell")}>Category</TableHead>
                <TableHead className={cn(headClass, "text-right")}>Price</TableHead>
                <TableHead className={cn(headClass, "pr-4 text-right lg:pr-2")}>Stock</TableHead>
                <TableHead className={cn(headClass, "hidden pr-4 text-right lg:table-cell")}>Updated</TableHead>
                <TableHead className={cn(headClass, "hidden pr-4 text-right lg:table-cell")}>Created</TableHead>
            </TableRow>
        </TableHeader>

        <TableBody>
            {props.items.map((p) => (
                <ProductRow
                    key={p.id}
                    product={p}
                    lowStock={props.lowStock}
                    selected={props.selectedIds.has(p.id)}
                    handleToggle={(checked) => props.handleToggleOne(p.id, checked)}
                    handleOpen={() => props.handleOpen(p.id)}
                    handlePrefetch={() => props.handlePrefetch(p.id)}
                />
            ))}
        </TableBody>
    </Table>
);

export default ProductTable;