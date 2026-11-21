"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { formatRupiah } from "@/lib/formatter";
import { useAddToCart, useCartItemQuantity } from "../../../cart/_hooks/useCart";
import { createAddToCartSchema } from "../_schema/addToCartSchema";
import type { AddToCartFormValues } from "../_types/AddToCartTypes";
import type { HomeProductTypes } from "../../_types/homeProductTypes";

const PurchasePanel = ({ product }: { product: HomeProductTypes }) => {
    const { id, productPrice, productStock: stock } = product;

    const { data: inCart = 0, isLoading: isCartLoading } = useCartItemQuantity(id);
    const { mutate: addToCart, isPending } = useAddToCart(id);

    const schema = useMemo(() => createAddToCartSchema(stock, inCart), [stock, inCart]);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AddToCartFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { quantity: 1 },
    });

    const quantity = watch("quantity");
    const safeQuantity = Number.isFinite(quantity) ? quantity : 0;
    const maxedOut = stock > 0 && stock - inCart <= 0;

    const step = (delta: number) => {
        setValue("quantity", Math.max(safeQuantity + delta, 0), { shouldValidate: true });
    };

    return (
        <Card className="gap-0 rounded-2xl bg-muted/30 py-0 shadow-none">
            <CardContent className="grid gap-3 p-4 lg:p-4">
                {stock <= 0 ? (
                    <p className="rounded-lg bg-destructive/10 p-3 text-center text-sm font-medium text-destructive">
                        This product is out of stock
                    </p>
                ) : (
                    <form onSubmit={handleSubmit((d) => addToCart(d.quantity))} noValidate className="grid gap-4">
                        <Field data-invalid={!!errors.quantity}>
                            <div className="flex items-center justify-between gap-3">
                                <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="outline" size="icon" aria-label="Decrease quantity" disabled={isPending} onClick={() => step(-1)}>
                                        <Minus />
                                    </Button>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        inputMode="numeric"
                                        className="w-16 bg-background text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        disabled={isPending}
                                        aria-invalid={!!errors.quantity}
                                        {...register("quantity", { valueAsNumber: true })}
                                    />
                                    <Button type="button" variant="outline" size="icon" aria-label="Increase quantity" disabled={isPending} onClick={() => step(1)}>
                                        <Plus />
                                    </Button>
                                </div>
                            </div>
                            {errors.quantity && <FieldError>{errors.quantity.message}</FieldError>}
                        </Field>

                        {inCart > 0 && <p className="text-xs text-muted-foreground">{inCart} already in your cart</p>}

                        <Separator />

                        <div className="flex items-baseline justify-between">
                            <span className="text-sm text-muted-foreground">Subtotal</span>
                            <span className="text-xl font-bold">{formatRupiah(safeQuantity * productPrice)}</span>
                        </div>

                        <Button type="submit" size="lg" className="h-11 w-full" disabled={isPending || isCartLoading || maxedOut}>
                            {isPending ? <Spinner /> : <ShoppingCart />}
                            {maxedOut ? "Max stock in cart" : isPending ? "Adding..." : "Add to cart"}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};

export default PurchasePanel;