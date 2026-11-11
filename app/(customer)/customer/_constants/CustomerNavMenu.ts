import { History, ShoppingCart } from "lucide-react";

export const CUSTOMER_HEADER_ACTIONS = [
    { label: "Cart", href: "/customer/cart", icon: ShoppingCart },
    { label: "Order History", href: "/customer/orders", icon: History },
] as const;