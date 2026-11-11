"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_PRODUCT_IMAGE } from "@/constants/ProductDefaultImage";
import { formatRupiah } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { useRemoveCartItem, useUpdateCartQuantity } from "../../_hooks/useCart";
import type { CartItem } from "../../_types/cartTypes";
import { isInsufficient, lineTotal } from "../../_utils/cartUtils";

const CartItemRow = ({ item }: { item: CartItem }) => {
    const { mutate: updateQty, isPending: isUpdating } = useUpdateCartQuantity();
    const { mutate: remove, isPending: isRemoving } = useRemoveCartItem();
    const busy = isUpdating || isRemoving;

    const { product, productId, quantity } = item;
    const insufficient = isInsufficient(item);
    const canIncrease = !!product && quantity + 1 <= product.productStock;
    const href = `/customer/product/${productId}`;

    return (
        <div
            className={cn(
                "flex gap-3 rounded-2xl border bg-card p-3 sm:gap-4 sm:p-4",
                insufficient && "border-destructive bg-destructive/5",
            )}
        >
            {/* Gambar: link ke detail (kalau produk masih ada) */}
            {product ? (
                <Link
                    href={href}
                    aria-label={`View ${product.productName}`}
                    className="group relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted sm:size-24"
                >
                    <Image
                        src={product.productImage || DEFAULT_PRODUCT_IMAGE}
                        alt={product.productName}
                        fill
                        sizes="96px"
                        className="object-cover transition duration-300 group-hover:scale-105"
                    />
                </Link>
            ) : (
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted sm:size-24">
                    <Image
                        src={DEFAULT_PRODUCT_IMAGE}
                        alt="Unavailable product"
                        fill
                        sizes="96px"
                        className="object-cover"
                    />
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                <div className="min-w-0">
                    {product ? (
                        <Link
                            href={href}
                            className="line-clamp-2 text-sm font-medium transition hover:text-primary hover:underline"
                        >
                            {product.productName}
                        </Link>
                    ) : (
                        <p className="text-sm font-medium text-muted-foreground">Product no longer available</p>
                    )}
                    {product && (
                        <p className="text-xs text-muted-foreground">{formatRupiah(product.productPrice)} each</p>
                    )}
                    {insufficient && (
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive">
                            <AlertTriangle className="size-3.5" />
                            {product
                                ? `Insufficient stock (only ${product.productStock} left)`
                                : "Remove this item to continue"}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            aria-label="Decrease quantity"
                            disabled={busy}
                            onClick={() => updateQty({ productId, quantity: quantity - 1 })}
                        >
                            <Minus />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            aria-label="Increase quantity"
                            disabled={busy || !canIncrease}
                            onClick={() => updateQty({ productId, quantity: quantity + 1 })}
                        >
                            <Plus />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        {product && (
                            <p className="font-semibold">{formatRupiah(lineTotal(product.productPrice, quantity))}</p>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive"
                            aria-label="Remove item"
                            disabled={busy}
                            onClick={() => remove(productId)}
                        >
                            <Trash2 />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItemRow;