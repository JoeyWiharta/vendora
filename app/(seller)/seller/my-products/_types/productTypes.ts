import { Timestamp } from "firebase/firestore";
import { addEditProductSchema } from "../_schema/productAddEditSchema";
import { z } from "zod";

export interface Product {
    id: string;
    productName: string;
    productCategory: string;
    productImage: string;
    productImagePublicId: string | null;
    productPrice: number;
    productStock: number;
    description: string;
    sellerId: string;
    updatedAt: Timestamp | string;
    createdAt: Timestamp;
}

export type AddProductFormPayload = z.infer<typeof addEditProductSchema>;

export interface AddProductPayload {
    sellerId: string;
    productName: string;
    productCategory: string;
    description: string;
    productPrice: number;
    productStock: number;
    productImage: string;
    productImagePublicId: string | null;
}

export type UpdateProductPayload = Omit<AddProductPayload, "sellerId">;

export interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
}