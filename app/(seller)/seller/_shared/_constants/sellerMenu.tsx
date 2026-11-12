import { ClipboardList, History, Package } from "lucide-react";

export const SELLER_HOME_PATH = "/seller/my-products";

export const SELLER_MENU = [
    { label: "My Products", href: SELLER_HOME_PATH, icon: Package },
    { label: "Incoming Orders", href: "/seller/incoming-orders", icon: ClipboardList },
    { label: "Order History", href: "/seller/order-history", icon: History },
];

