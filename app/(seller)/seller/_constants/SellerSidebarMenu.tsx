import { ClipboardList, History, Package } from "lucide-react";

const SELLER_SIDEBAR_MENU = [
    { label: "Product List", href: "/seller/product-list", icon: Package },
    { label: "Order List", href: "/seller/orders", icon: ClipboardList },
    { label: "History List", href: "/seller/history", icon: History },
];

export default SELLER_SIDEBAR_MENU