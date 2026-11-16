"use client";

import Image from "next/image";
import { Loader2, Package, Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/formatter";
import type { Product } from "../_types/productTypes";

interface DeleteProductDialogProps {
    products: Product[];
    open: boolean;
    isPending: boolean;
    handleOpenChange: (open: boolean) => void;
    handleConfirm: () => void;
}

const DeleteProductDialog = (props: DeleteProductDialogProps) => {
    const count = props.products.length;
    const isSingle = count === 1;

    return (
        <AlertDialog
            open={props.open}
            onOpenChange={(open) => {
                if (!props.isPending) props.handleOpenChange(open);
            }}
        >
            <AlertDialogContent className="w-[calc(100vw-1rem)] !max-w-[calc(100vw-1rem)] gap-4 overflow-hidden p-4 sm:w-full sm:!max-w-lg sm:p-6">
                <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <Trash2 className="size-6" />
                    </div>

                    <div className="grid min-w-0 flex-1 gap-1.5 text-left">
                        <AlertDialogTitle className="text-left">
                            {isSingle ? "Delete this product?" : `Delete ${count} products?`}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-left">
                            {isSingle
                                ? "This product will be permanently removed from your store. This action cannot be undone."
                                : "These products will be permanently removed from your store. This action cannot be undone."}
                        </AlertDialogDescription>
                    </div>
                </div>

                {count > 0 && (
                    <ul className="grid max-h-[50svh] grid-cols-1 gap-2 overflow-y-auto overflow-x-hidden rounded-lg border bg-muted/40 p-2">
                        {props.products.map((p) => (
                            <li key={p.id} className="flex min-w-0 items-center gap-3 rounded-md bg-card p-2">
                                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
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

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{p.productName}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {formatRupiah(p.productPrice)}
                                    </p>
                                </div>

                                <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
                                    {p.productCategory}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={props.isPending}>Cancel</AlertDialogCancel>

                    <AlertDialogAction
                        variant="destructive"
                        disabled={props.isPending || count === 0}
                        onClick={(e) => {
                            e.preventDefault();
                            props.handleConfirm();
                        }}
                    >
                        {props.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
                        {props.isPending
                            ? "Deleting..."
                            : isSingle
                                ? "Delete Product"
                                : `Delete ${count} Products`}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteProductDialog;