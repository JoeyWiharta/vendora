import type { CartItem } from "../../_shared/_types/cartTypes";
import { canCheckout, cartTotal, isInsufficient, lineTotal } from "./cartUtils";

const makeItem = (quantity: number, stock: number, price = 1000, productId = "p1"): CartItem =>
    ({
        productId,
        quantity,
        product: { id: productId, productName: "Item", productPrice: price, productStock: stock },
    }) as unknown as CartItem;

const missingProduct = (productId = "gone", product: null | undefined = null): CartItem =>
    ({ productId, quantity: 1, product }) as unknown as CartItem;

describe("lineTotal", () => {
    it("mengalikan harga dengan quantity", () => {
        expect(lineTotal(2450000, 2)).toBe(4900000);
    });

    it("mengembalikan 0 kalau quantity 0", () => {
        expect(lineTotal(1000, 0)).toBe(0);
    });
});

describe("isInsufficient", () => {
    it("false kalau quantity di bawah stok", () => {
        expect(isInsufficient(makeItem(2, 5))).toBe(false);
    });

    it("false kalau quantity sama dengan stok (batas)", () => {
        expect(isInsufficient(makeItem(5, 5))).toBe(false);
    });

    it("true kalau quantity melebihi stok", () => {
        expect(isInsufficient(makeItem(6, 5))).toBe(true);
    });

    it("true kalau produk null", () => {
        expect(isInsufficient(missingProduct("gone", null))).toBe(true);
    });

    it("true kalau produk undefined", () => {
        expect(isInsufficient(missingProduct("gone", undefined))).toBe(true);
    });
});

describe("cartTotal", () => {
    it("0 untuk cart kosong", () => {
        expect(cartTotal([])).toBe(0);
    });

    it("menjumlahkan total semua item", () => {
        const items = [makeItem(2, 10, 1000, "a"), makeItem(1, 10, 500, "b")];
        expect(cartTotal(items)).toBe(2500);
    });

    it("mengabaikan item yang produknya sudah tidak ada", () => {
        const items = [makeItem(1, 10, 1000, "a"), missingProduct()];
        expect(cartTotal(items)).toBe(1000);
    });
});

describe("canCheckout", () => {
    it("false untuk cart kosong", () => {
        expect(canCheckout([])).toBe(false);
    });

    it("true kalau semua item stoknya cukup", () => {
        expect(canCheckout([makeItem(1, 5, 1000, "a"), makeItem(5, 5, 1000, "b")])).toBe(true);
    });

    it("false kalau ada satu item stoknya kurang", () => {
        expect(canCheckout([makeItem(1, 5, 1000, "a"), makeItem(9, 5, 1000, "b")])).toBe(false);
    });

    it("false kalau ada item yang produknya hilang", () => {
        expect(canCheckout([makeItem(1, 5), missingProduct()])).toBe(false);
    });
});