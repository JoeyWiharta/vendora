import { Timestamp } from "firebase/firestore";

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