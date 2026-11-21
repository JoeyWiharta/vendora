
import { createAddToCartSchema } from "./addToCartSchema";

describe("createAddToCartSchema", () => {
    describe("validasi quantity", () => {
        it("menerima quantity valid tanpa item di cart", () => {
            const schema = createAddToCartSchema(10, 0);

            expect(schema.safeParse({ quantity: 5 }).success).toBe(true);
        });

        it("menerima quantity sesuai sisa stok", () => {
            const schema = createAddToCartSchema(10, 3);

            expect(schema.safeParse({ quantity: 7 }).success).toBe(true);
        });

        it("menolak quantity nol", () => {
            const schema = createAddToCartSchema(10, 0);
            const result = schema.safeParse({ quantity: 0 });

            expect(result.success).toBe(false);

            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Quantity cannot be zero",
                );
            }
        });

        it("menolak quantity negatif", () => {
            const schema = createAddToCartSchema(10, 0);

            expect(schema.safeParse({ quantity: -1 }).success).toBe(false);
        });

        it("menolak quantity pecahan", () => {
            const schema = createAddToCartSchema(10, 0);
            const result = schema.safeParse({ quantity: 1.5 });

            expect(result.success).toBe(false);

            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Quantity must be a whole number",
                );
            }
        });

        it("menolak quantity dengan tipe data bukan angka", () => {
            const schema = createAddToCartSchema(10, 0);
            const result = schema.safeParse({ quantity: "2" });

            expect(result.success).toBe(false);

            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Quantity is required",
                );
            }
        });

        it("menolak quantity yang tidak diberikan", () => {
            const schema = createAddToCartSchema(10, 0);
            const result = schema.safeParse({});

            expect(result.success).toBe(false);

            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Quantity is required",
                );
            }
        });
    });

    describe("validasi ketersediaan stok", () => {
        it("menolak quantity melebihi total stok tanpa item di cart", () => {
            const schema = createAddToCartSchema(5, 0);
            const result = schema.safeParse({ quantity: 6 });

            expect(result.success).toBe(false);

            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Insufficient stock. Only 5 available",
                );
            }
        });

        it("menolak quantity melebihi sisa stok ketika cart sudah berisi item", () => {
            const schema = createAddToCartSchema(5, 3);
            const result = schema.safeParse({ quantity: 3 });

            expect(result.success).toBe(false);

            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "You already have 3 in your cart. Only 2 more available",
                );
            }
        });

        it("menolak quantity ketika stok sudah habis di cart", () => {
            const schema = createAddToCartSchema(5, 5);
            const result = schema.safeParse({ quantity: 1 });

            expect(result.success).toBe(false);

            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "You already have 5 in your cart. Only 0 more available",
                );
            }
        });

        it("menolak quantity ketika jumlah di cart melebihi stok", () => {
            const schema = createAddToCartSchema(5, 7);
            const result = schema.safeParse({ quantity: 1 });

            expect(result.success).toBe(false);

            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "You already have 7 in your cart. Only 0 more available",
                );
            }
        });
    });
});
