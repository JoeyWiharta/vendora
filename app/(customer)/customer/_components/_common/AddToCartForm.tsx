"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { createAddToCartSchema, type AddToCartFormValues } from "../../_schema/addToCartSchema";
import { useAddToCart, useCartItemQuantity } from "../../_hooks/useCart";

const AddToCartForm = ({ productId, stock }: { productId: string; stock: number }) => {
    const { data: inCart = 0, isLoading } = useCartItemQuantity(productId);
    const { mutate: addToCart, isPending } = useAddToCart(productId);

    const schema = useMemo(() => createAddToCartSchema(stock, inCart), [stock, inCart]);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AddToCartFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { quantity: 1 },
    });

    const quantity = watch("quantity");
    const maxedOut = stock > 0 && stock - inCart <= 0;

    const step = (delta: number) => {
        const next = (Number.isFinite(quantity) ? quantity : 0) + delta;
        setValue("quantity", Math.max(next, 0), { shouldValidate: true });
    };

    if (stock <= 0) {
        return <p className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">Out of stock</p>;
    }

    return (
        <form onSubmit={handleSubmit((d) => addToCart(d.quantity))} noValidate className="grid gap-4">
            <Field data-invalid={!!errors.quantity}>
                <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" aria-label="Decrease quantity" disabled={isPending} onClick={() => step(-1)}>
                        <Minus />
                    </Button>
                    <Input
                        id="quantity"
                        type="number"
                        inputMode="numeric"
                        className="w-24 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        disabled={isPending}
                        aria-invalid={!!errors.quantity}
                        {...register("quantity", { valueAsNumber: true })}
                    />
                    <Button type="button" variant="outline" size="icon" aria-label="Increase quantity" disabled={isPending} onClick={() => step(1)}>
                        <Plus />
                    </Button>
                </div>
                {errors.quantity && <FieldError>{errors.quantity.message}</FieldError>}
            </Field>

            {inCart > 0 && <p className="text-xs text-muted-foreground">{inCart} already in your cart</p>}

            <Button type="submit" size="lg" disabled={isPending || isLoading || maxedOut}>
                {isPending ? <Spinner /> : <ShoppingCart />}
                {maxedOut ? "Max stock in cart" : isPending ? "Adding..." : "Add to cart"}
            </Button>
        </form>
    );
};

export default AddToCartForm;