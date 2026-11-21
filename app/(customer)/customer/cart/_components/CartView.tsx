"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCw, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { formatRupiah } from "@/lib/formatter";
import { CUSTOMER_HOME_PATH } from "../../_shared/_constants/CustomerNavMenu";
import { useCartItems } from "../_hooks/useCart";
import { useCheckout } from "../_hooks/useCheckout";
import { cartTotal, isInsufficient } from "../_utils/cartUtils";
import CartItemRow from "./CartItemRow";

const CartView = () => {
    const { data: items = [], isLoading, isError, error, refetch, isFetching } = useCartItems();
    const { mutate: purchase, isPending: isPurchasing } = useCheckout();

    const [unchecked, setUnchecked] = useState<Set<string>>(new Set());

    if (isLoading) {
        return (
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="grid gap-3">
                    <Skeleton className="h-12 w-full rounded-2xl" />
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="hidden h-64 w-full rounded-2xl lg:block" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card py-16 text-center">
                <p className="font-medium text-destructive">Failed to load cart</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                    <RefreshCw />
                    Retry
                </Button>
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card py-16 text-center">
                <ShoppingCart className="size-10 text-muted-foreground" />
                <p className="font-medium">Your cart is empty</p>
                <Button size="sm" nativeButton={false} render={<Link href={CUSTOMER_HOME_PATH} />}>
                    Start shopping
                </Button>
            </div>
        );
    }

    const selectable = items.filter((i) => !isInsufficient(i));
    const selectedItems = selectable.filter((i) => !unchecked.has(i.productId));
    const selectedCount = selectedItems.length;
    const selectedPcs = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
    const total = cartTotal(selectedItems);
    const problemCount = items.length - selectable.length;

    const allSelected = selectable.length > 0 && selectedCount === selectable.length;
    const someSelected = selectedCount > 0 && !allSelected;

    const toggleItem = (productId: string) =>
        setUnchecked((prev) => {
            const next = new Set(prev);
            if (next.has(productId)) next.delete(productId);
            else next.add(productId);
            return next;
        });

    const toggleAll = (checked: boolean) =>
        setUnchecked(checked ? new Set() : new Set(selectable.map((i) => i.productId)));

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3">
                    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                        <Checkbox
                            checked={allSelected}
                            indeterminate={someSelected}
                            disabled={selectable.length === 0 || isPurchasing}
                            onCheckedChange={(checked) => toggleAll(checked === true)}
                            aria-label="Select all items"
                        />
                        Select all
                        <span className="font-normal text-muted-foreground">({selectable.length})</span>
                    </label>
                    <span className="text-xs text-muted-foreground">
                        {selectedCount} of {items.length} selected
                    </span>
                </div>

                {items.map((item) => (
                    <CartItemRow
                        key={item.productId}
                        item={item}
                        selected={!isInsufficient(item) && !unchecked.has(item.productId)}
                        onToggle={() => toggleItem(item.productId)}
                    />
                ))}
            </div>

            <Card className="lg:sticky lg:top-20">
                <CardContent className="grid gap-4">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <ShoppingBag className="size-5 text-primary" />
                        Order summary
                    </h2>

                    <div className="grid gap-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Selected products</span>
                            <span className="font-medium">{selectedCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Total quantity</span>
                            <span className="font-medium">{selectedPcs} pcs</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <span className="font-medium">Total</span>
                        <span className="text-xl font-bold text-primary">{formatRupiah(total)}</span>
                    </div>

                    {problemCount > 0 && (
                        <p className="text-xs text-destructive">
                            {problemCount} item(s) can&apos;t be purchased. Update the quantity or remove them.
                        </p>
                    )}

                    {selectedCount === 0 && problemCount < items.length && (
                        <p className="text-xs text-muted-foreground">Select at least one item to purchase.</p>
                    )}

                    <Button
                        size="lg"
                        disabled={selectedCount === 0 || isPurchasing}
                        onClick={() => purchase(selectedItems)}
                    >
                        {isPurchasing && <Spinner />}
                        {isPurchasing ? "Processing..." : `Purchase${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default CartView;