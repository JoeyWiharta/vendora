import { History, LayoutDashboard, ShoppingCart } from "lucide-react";

export const CUSTOMER_HOME_PATH = "/customer/dashboard";

const CUSTOMER_HEADER_ACTIONS = [
    { label: "Dashboard", href: CUSTOMER_HOME_PATH, icon: LayoutDashboard },
    { label: "Cart", href: "/customer/cart", icon: ShoppingCart },
    { label: "Order History", href: "/customer/orders", icon: History },
];

export default CUSTOMER_HEADER_ACTIONS;