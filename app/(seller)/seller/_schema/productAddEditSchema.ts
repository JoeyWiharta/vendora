import { z } from "zod"

export const MAX_IMAGE_MB = 2

export const addEditProductSchema = z.object({
    productName: z.string().trim().min(6, "Product name must be more than 5 characters"),
    productCategory: z.string().min(1, "Please select a product category"),
    description: z.string().trim().min(1, "Description is required"),
    productPrice: z.number("Price is required").int("Price must be a whole number").positive("Price must be greater than 0"),
    productStock: z.number("Stock is required").int("Stock must be a whole number").positive("Stock must be greater than 0"),
    image: z
        .instanceof(File)
        .refine((file) => file.size > 0, "Image cannot be empty")
        .refine((file) => file.type.startsWith("image/"), "File must be an image")
        .refine((file) => file.size <= MAX_IMAGE_MB * 1024 * 1024, `Image must not exceed ${MAX_IMAGE_MB}MB`)
        .optional(),
})