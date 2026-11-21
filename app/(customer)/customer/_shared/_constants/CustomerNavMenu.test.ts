
import { History, House, ShoppingCart } from "lucide-react";
import {
    CUSTOMER_HOME_PATH,
    CUSTOMER_MENU,
} from "./CustomerNavMenu";

describe("CustomerNavMenu", () => {
    it("memiliki customer home path yang benar", () => {
        expect(CUSTOMER_HOME_PATH).toBe("/customer/home");
    });

    it("memiliki tiga menu customer", () => {
        expect(CUSTOMER_MENU).toHaveLength(3);
    });

    it("memiliki konfigurasi menu Home, Cart, dan Order History", () => {
        expect(CUSTOMER_MENU).toEqual([
            {
                label: "Home",
                href: "/customer/home",
                icon: House,
            },
            {
                label: "Cart",
                href: "/customer/cart",
                icon: ShoppingCart,
            },
            {
                label: "Order History",
                href: "/customer/order-history",
                icon: History,
            },
        ]);
    });

    it("menggunakan href yang unik untuk setiap menu", () => {
        const hrefs = CUSTOMER_MENU.map((menu) => menu.href);

        expect(new Set(hrefs).size).toBe(hrefs.length);
    });
});
