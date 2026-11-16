import { ClipboardList, History, Package } from "lucide-react";
import {
    SELLER_HOME_PATH,
    SELLER_MENU,
} from "./sellerMenu";

describe("sellerMenu", () => {
    it("menggunakan path My Products sebagai halaman utama Seller", () => {
        expect(SELLER_HOME_PATH).toBe("/seller/my-products");
    });

    it("menyediakan tiga menu Seller", () => {
        expect(SELLER_MENU).toHaveLength(3);
    });

    it("memiliki konfigurasi menu My Products", () => {
        expect(SELLER_MENU[0]).toEqual({
            label: "My Products",
            href: SELLER_HOME_PATH,
            icon: Package,
        });
    });

    it("memiliki konfigurasi menu Incoming Orders", () => {
        expect(SELLER_MENU[1]).toEqual({
            label: "Incoming Orders",
            href: "/seller/incoming-orders",
            icon: ClipboardList,
        });
    });

    it("memiliki konfigurasi menu Order History", () => {
        expect(SELLER_MENU[2]).toEqual({
            label: "Order History",
            href: "/seller/order-history",
            icon: History,
        });
    });

    it("semua menu memiliki label, href, dan icon", () => {
        SELLER_MENU.forEach((menu) => {
            expect(menu.label).toBeTruthy();
            expect(menu.href).toMatch(/^\/seller\//);
            expect(menu.icon).toBeDefined();
        });
    });
});