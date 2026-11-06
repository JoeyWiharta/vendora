import { Timestamp } from "firebase/firestore";
import { addProductSchema } from "../_schema/productAddSchema";
import { z } from "zod"

export interface Product {
    id: string;
    productName: string;
    productCategory: string;
    productImage: string;
    productPrice: number;
    productStock: number;
    description: string;
    sellerId: string;
    createdAt: Timestamp;
}

export type AddProductFormPayload = z.infer<typeof addProductSchema>

export interface AddProductPayload {
    sellerId: string
    productName: string
    productCategory: string
    description: string
    productPrice: number
    productStock: number
    productImage: string
}