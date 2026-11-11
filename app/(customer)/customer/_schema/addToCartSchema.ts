import { z } from "zod";

export const createAddToCartSchema = (stock: number, inCart: number) =>
    z.object({
        quantity: z
            .number("Quantity is required")
            .int("Quantity must be a whole number")
            .min(1, "Quantity cannot be zero")
            .refine(
                (q) => q + inCart <= stock,
                inCart > 0
                    ? `You already have ${inCart} in your cart. Only ${Math.max(stock - inCart, 0)} more available`
                    : `Insufficient stock. Only ${stock} available`,
            ),
    });

export type AddToCartFormValues = z.infer<ReturnType<typeof createAddToCartSchema>>;