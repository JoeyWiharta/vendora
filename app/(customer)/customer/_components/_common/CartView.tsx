"use client";

import Link from "next/link";
import { RefreshCw, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/formatter";
import { useCartItems } from "../../_hooks/useCart";
import { canCheckout, cartTotal, isInsufficient } from "../../_utils/cartUtils";
import CartItemRow from "./CartItemRow";
import { Spinner } from "@/components/ui/spinner";
import { useCheckout } from "../../_hooks/useCheckout";

const CartView = () => {
    const { data: items = [], isLoading, isError, error, refetch, isFetching } = useCartItems();
    const { mutate: purchase, isPending: isPurchasing } = useCheckout();

    if (isLoading) {
        return (
            <div className="grid gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card py-16 text-center">
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
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card py-16 text-center">
                <ShoppingCart className="size-10 text-muted-foreground" />
                <p className="font-medium">Your cart is empty</p>
                <Button size="sm" nativeButton={false} render={<Link href="/customer/dashboard" />}>
                    Start shopping
                </Button>
            </div>
        );
    }

    const total = cartTotal(items);
    const problemCount = items.filter(isInsufficient).length;

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="grid gap-3">
                {items.map((item) => (
                    <CartItemRow key={item.productId} item={item} />
                ))}
            </div>

            <Card className="lg:sticky lg:top-20">
                <CardContent className="grid gap-4">
                    <h2 className="text-lg font-semibold">Order summary</h2>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{items.length} item(s)</span>
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

                    <Button size="lg" disabled={!canCheckout(items) || isPurchasing} onClick={() => purchase(items)}>
                        {isPurchasing && <Spinner />}
                        {isPurchasing ? "Processing..." : "Purchase"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default CartView;