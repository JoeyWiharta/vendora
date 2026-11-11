import type { CustomerProduct } from "./productTypes";

export interface CartItem {
    productId: string;
    quantity: number;
    product: CustomerProduct | null; // null kalau produk sudah dihapus seller
}