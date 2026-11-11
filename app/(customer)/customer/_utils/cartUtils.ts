import type { CartItem } from "../_types/cartTypes";

export const lineTotal = (price: number, qty: number) => price * qty;

export const isInsufficient = (item: CartItem) => !item.product || item.quantity > item.product.productStock;

export const cartTotal = (items: CartItem[]) => items.reduce((sum, i) => (i.product ? sum + lineTotal(i.product.productPrice, i.quantity) : sum), 0);

export const canCheckout = (items: CartItem[]) => items.length > 0 && items.every((i) => !isInsufficient(i));