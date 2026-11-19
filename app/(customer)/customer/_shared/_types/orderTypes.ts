import type { Timestamp } from "firebase/firestore";

export interface OrderItem {
    productId: string;
    sellerId: string;
    name: string;
    imageUrl: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: string;
    userId: string;
    totalPrice: number;
    createdAt: Timestamp;
    items: OrderItem[];
}