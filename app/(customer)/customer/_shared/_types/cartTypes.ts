import { HomeProductTypes } from "../../home/_types/homeProductTypes";

export interface CartItem {
    productId: string;
    quantity: number;
    product: HomeProductTypes | null; // null kalau produk sudah dihapus seller
}