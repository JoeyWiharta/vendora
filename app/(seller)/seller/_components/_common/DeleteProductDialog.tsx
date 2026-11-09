"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import type { Product } from "../../_types/productTypes";

const PREVIEW_LIMIT = 5;

interface DeleteProductDialogProps {
    products: Product[];
    open: boolean;
    isPending: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

const DeleteProductDialog = ({
    products,
    open,
    isPending,
    onOpenChange,
    onConfirm,
}: DeleteProductDialogProps) => {
    const count = products.length;
    const isSingle = count === 1;
    const preview = products.slice(0, PREVIEW_LIMIT);
    const remaining = count - preview.length;

    return (
        <AlertDialog
            open={open}
            onOpenChange={(open) => {
                if (!isPending) onOpenChange(open);
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isSingle ? "Delete product?" : `Delete ${count} products?`}
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        {isSingle ? (
                            <>
                                Are you sure you want to delete{" "}
                                <span className="font-medium text-foreground">
                                    {products[0]?.productName}
                                </span>
                                ? This action cannot be undone.
                            </>
                        ) : (
                            "Are you sure you want to delete the selected products? This action cannot be undone."
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Preview daftar produk untuk bulk delete */}
                {!isSingle && count > 0 && (
                    <ul className="grid gap-1 rounded-lg border bg-muted/40 p-3 text-sm">
                        {preview.map((p) => (
                            <li key={p.id} className="truncate">
                                • {p.productName}
                            </li>
                        ))}
                        {remaining > 0 && (
                            <li className="text-xs text-muted-foreground">
                                and {remaining} more...
                            </li>
                        )}
                    </ul>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        variant="destructive"
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isPending || count === 0}
                    >
                        {isPending && <Loader2 className="animate-spin" />}
                        {isSingle ? "Delete Product" : `Delete ${count} Products`}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteProductDialog;