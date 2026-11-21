import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { getProductById } from "../../home/_services/homeProductService";
import {
    addToCart,
    getCartItemQuantity,
    getCartItems,
    removeCartItem,
    setCartQuantity,
} from "./cartService";

jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    increment: jest.fn(),
    serverTimestamp: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
}));
jest.mock("@/lib/firebase", () => ({ dbFirebase: { __db: true } }));
jest.mock("../../home/_services/homeProductService", () => ({ getProductById: jest.fn() }));

const { increment, serverTimestamp } = jest.requireMock("firebase/firestore");

const mockDoc = doc as jest.Mock;
const mockCollection = collection as jest.Mock;
const mockGetDoc = getDoc as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;
const mockSetDoc = setDoc as jest.Mock;
const mockUpdateDoc = updateDoc as jest.Mock;
const mockDeleteDoc = deleteDoc as jest.Mock;
const mockGetProductById = getProductById as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.mockImplementation((_db, ...segments: string[]) => ({ path: segments.join("/") }));
    mockCollection.mockImplementation((_db, ...segments: string[]) => ({ path: segments.join("/") }));
    increment.mockImplementation((n: number) => ({ __increment: n }));
    serverTimestamp.mockReturnValue("SERVER_TS");
});

describe("getCartItemQuantity", () => {
    it("membaca dokumen di trx-carts/{uid}/items/{productId}", async () => {
        mockGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ quantity: 3 }) });

        await getCartItemQuantity("u1", "p1");

        expect(mockDoc).toHaveBeenCalledWith({ __db: true }, "trx-carts", "u1", "items", "p1");
    });

    it("mengembalikan quantity kalau dokumen ada", async () => {
        mockGetDoc.mockResolvedValue({ exists: () => true, data: () => ({ quantity: 3 }) });
        await expect(getCartItemQuantity("u1", "p1")).resolves.toBe(3);
    });

    it("mengembalikan 0 kalau dokumen tidak ada", async () => {
        mockGetDoc.mockResolvedValue({ exists: () => false });
        await expect(getCartItemQuantity("u1", "p1")).resolves.toBe(0);
    });
});

describe("addToCart", () => {
    it("setDoc dengan increment, serverTimestamp, dan merge", async () => {
        await addToCart("u1", "p1", 2);

        expect(increment).toHaveBeenCalledWith(2);
        expect(mockSetDoc).toHaveBeenCalledWith(
            { path: "trx-carts/u1/items/p1" },
            { productId: "p1", quantity: { __increment: 2 }, updatedAt: "SERVER_TS" },
            { merge: true },
        );
    });
});

describe("getCartItems", () => {
    it("mengembalikan item beserta data produknya", async () => {
        const productA = { id: "a", productName: "A" };
        const productB = { id: "b", productName: "B" };
        mockGetDocs.mockResolvedValue({
            docs: [
                { id: "a", data: () => ({ quantity: 2 }) },
                { id: "b", data: () => ({ quantity: 1 }) },
            ],
        });
        mockGetProductById.mockImplementation(async (id: string) => (id === "a" ? productA : productB));

        const result = await getCartItems("u1");

        expect(mockCollection).toHaveBeenCalledWith({ __db: true }, "trx-carts", "u1", "items");
        expect(result).toEqual([
            { productId: "a", quantity: 2, product: productA },
            { productId: "b", quantity: 1, product: productB },
        ]);
    });

    it("tetap mengembalikan item kalau produknya sudah hilang (null)", async () => {
        mockGetDocs.mockResolvedValue({ docs: [{ id: "gone", data: () => ({ quantity: 1 }) }] });
        mockGetProductById.mockResolvedValue(null);

        await expect(getCartItems("u1")).resolves.toEqual([
            { productId: "gone", quantity: 1, product: null },
        ]);
    });

    it("mengembalikan array kosong kalau cart kosong", async () => {
        mockGetDocs.mockResolvedValue({ docs: [] });
        await expect(getCartItems("u1")).resolves.toEqual([]);
        expect(mockGetProductById).not.toHaveBeenCalled();
    });
});

describe("setCartQuantity", () => {
    it("updateDoc dengan quantity baru dan updatedAt kalau quantity > 0", async () => {
        await setCartQuantity("u1", "p1", 4);

        expect(mockUpdateDoc).toHaveBeenCalledWith(
            { path: "trx-carts/u1/items/p1" },
            { quantity: 4, updatedAt: "SERVER_TS" },
        );
        expect(mockDeleteDoc).not.toHaveBeenCalled();
    });

    it("menghapus item kalau quantity 0", async () => {
        await setCartQuantity("u1", "p1", 0);

        expect(mockDeleteDoc).toHaveBeenCalledWith({ path: "trx-carts/u1/items/p1" });
        expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it("menghapus item kalau quantity negatif", async () => {
        await setCartQuantity("u1", "p1", -1);

        expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
        expect(mockUpdateDoc).not.toHaveBeenCalled();
    });
});

describe("removeCartItem", () => {
    it("menghapus dokumen item", async () => {
        await removeCartItem("u1", "p1");
        expect(mockDeleteDoc).toHaveBeenCalledWith({ path: "trx-carts/u1/items/p1" });
    });
});