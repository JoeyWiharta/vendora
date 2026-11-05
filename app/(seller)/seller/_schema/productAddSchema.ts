import { z } from "zod"
import { PRODUCT_CATEGORIES } from "@/constants/ProductCategory"

export const MAX_IMAGE_MB = 2

export const addProductSchema = z.object({
    productName: z.string().trim().min(1, "Product name is required"),
    productCategory: z.enum(PRODUCT_CATEGORIES, { message: "Please select a product category" }),
    description: z.string().trim().min(1, "Description is required"),
    productPrice: z.string().trim().min(1, "Price is required").transform(Number).pipe(z.number().positive("Price must be greater than 0")),
    productStock: z.string().trim().min(1, "Stock is required").transform(Number).pipe(z.number().int("Stock must be a whole number").min(0, "Stock cannot be negative")),
    image: z
        .instanceof(File)
        .refine((file) => file.size > 0, "Image cannot be empty")
        .refine((file) => file.type.startsWith("image/"), "File must be an image")
        .refine((file) => file.size <= MAX_IMAGE_MB * 1024 * 1024, `Image must not exceed ${MAX_IMAGE_MB}MB`)
        .optional(),
})

export type AddProductInput = z.infer<typeof addProductSchema>