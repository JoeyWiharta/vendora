import { History, House, ShoppingCart } from "lucide-react";

export const CUSTOMER_HOME_PATH = "/customer/home";

export const CUSTOMER_MENU = [
    { label: "Home", href: CUSTOMER_HOME_PATH, icon: House },
    { label: "Cart", href: "/customer/cart", icon: ShoppingCart },
    { label: "Order History", href: "/customer/orders", icon: History },
];
