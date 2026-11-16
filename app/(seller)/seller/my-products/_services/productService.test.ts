jest.mock("firebase/firestore", () => ({
    addDoc: jest.fn(),
    collection: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    serverTimestamp: jest.fn(),
    updateDoc: jest.fn(),
    where: jest.fn(),
}));
jest.mock("@/lib/firebase", () => ({ dbFirebase: { name: "db" } }));

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { dbFirebase } from "@/lib/firebase";
import {
    addSellerProduct,
    deleteSellerProduct,
    getSellerProducts,
    updateSellerProduct,
} from "./productService";

const mockedAddDoc = jest.mocked(addDoc);
const mockedCollection = jest.mocked(collection);
const mockedDeleteDoc = jest.mocked(deleteDoc);
const mockedDoc = jest.mocked(doc);
const mockedGetDocs = jest.mocked(getDocs);
const mockedQuery = jest.mocked(query);
const mockedServerTimestamp = jest.mocked(serverTimestamp);
const mockedUpdateDoc = jest.mocked(updateDoc);
const mockedWhere = jest.mocked(where);

const collectionRef = { path: "master-products" };
const queryRef = { q: "query" };
const docRef = { path: "master-products/p1" };

const ts = (ms: number) => ({ toMillis: () => ms });

const docSnap = (id: string, data: Record<string, unknown>) => ({ id, data: () => data });

const snapshot = (docs: ReturnType<typeof docSnap>[]) => ({ docs }) as never;

beforeEach(() => {
    jest.resetAllMocks();
    mockedCollection.mockReturnValue(collectionRef as never);
    mockedQuery.mockReturnValue(queryRef as never);
    mockedWhere.mockReturnValue("WHERE" as never);
    mockedDoc.mockReturnValue(docRef as never);
    mockedServerTimestamp.mockReturnValue("SERVER_TS" as never);
});

describe("getSellerProducts", () => {
    it("hanya mengambil produk milik seller (where sellerId)", async () => {
        mockedGetDocs.mockResolvedValue(snapshot([]));

        await getSellerProducts({ sellerId: "seller-1" });

        expect(mockedCollection).toHaveBeenCalledWith(dbFirebase, "master-products");
        expect(mockedWhere).toHaveBeenCalledWith("sellerId", "==", "seller-1");
        expect(mockedQuery).toHaveBeenCalledWith(collectionRef, "WHERE");
        expect(mockedGetDocs).toHaveBeenCalledWith(queryRef);
    });

    it("memetakan dokumen Firestore ke Product", async () => {
        const createdAt = ts(1000);
        mockedGetDocs.mockResolvedValue(
            snapshot([
                docSnap("p1", {
                    productName: "Keyboard",
                    productCategory: "Electronics",
                    productImage: "http://img/1.png",
                    productImagePublicId: "pub-1",
                    productPrice: 150000,
                    productStock: 5,
                    description: "Mechanical",
                    sellerId: "seller-1",
                    updatedAt: "2025-01-01",
                    createdAt,
                }),
            ]),
        );

        const result = await getSellerProducts({ sellerId: "seller-1" });

        expect(result).toEqual([
            {
                id: "p1",
                productName: "Keyboard",
                productCategory: "Electronics",
                productImage: "http://img/1.png",
                productImagePublicId: "pub-1",
                productPrice: 150000,
                productStock: 5,
                description: "Mechanical",
                sellerId: "seller-1",
                updatedAt: "2025-01-01",
                createdAt,
            },
        ]);
    });

    it("memakai nilai default untuk field yang kosong", async () => {
        mockedGetDocs.mockResolvedValue(
            snapshot([docSnap("p1", { sellerId: "seller-1", createdAt: ts(1) })]),
        );

        const [product] = await getSellerProducts({ sellerId: "seller-1" });

        expect(product).toMatchObject({
            productName: "",
            productCategory: "",
            productImage: "",
            productImagePublicId: null,
            productPrice: 0,
            productStock: 0,
            description: "",
            updatedAt: "-",
        });
    });

    it("mengurutkan dari yang terbaru (createdAt menurun)", async () => {
        mockedGetDocs.mockResolvedValue(
            snapshot([
                docSnap("old", { sellerId: "s", createdAt: ts(100) }),
                docSnap("newest", { sellerId: "s", createdAt: ts(300) }),
                docSnap("mid", { sellerId: "s", createdAt: ts(200) }),
            ]),
        );

        const result = await getSellerProducts({ sellerId: "s" });

        expect(result.map((p) => p.id)).toEqual(["newest", "mid", "old"]);
    });

    it("mengembalikan array kosong jika seller belum punya produk", async () => {
        mockedGetDocs.mockResolvedValue(snapshot([]));
        await expect(getSellerProducts({ sellerId: "s" })).resolves.toEqual([]);
    });

    it("error Firestore diteruskan", async () => {
        mockedGetDocs.mockRejectedValue(new Error("permission-denied"));
        await expect(getSellerProducts({ sellerId: "s" })).rejects.toThrow("permission-denied");
    });
});

describe("addSellerProduct", () => {
    const payload = {
        sellerId: "seller-1",
        productName: "Keyboard",
        productCategory: "Electronics",
        description: "Mechanical",
        productPrice: 150000,
        productStock: 5,
        productImage: "http://img/default.png",
        productImagePublicId: null,
    };

    it("menyimpan produk ke master-products dengan updatedAt '-' dan createdAt server", async () => {
        mockedAddDoc.mockResolvedValue({ id: "new-id" } as never);

        await addSellerProduct(payload);

        expect(mockedCollection).toHaveBeenCalledWith(dbFirebase, "master-products");
        expect(mockedAddDoc).toHaveBeenCalledWith(collectionRef, {
            ...payload,
            updatedAt: "-",
            createdAt: "SERVER_TS",
        });
    });

    it("mengembalikan id dokumen baru", async () => {
        mockedAddDoc.mockResolvedValue({ id: "new-id" } as never);
        await expect(addSellerProduct(payload)).resolves.toBe("new-id");
    });

    it("error Firestore diteruskan", async () => {
        mockedAddDoc.mockRejectedValue(new Error("fail"));
        await expect(addSellerProduct(payload)).rejects.toThrow("fail");
    });
});

describe("updateSellerProduct", () => {
    const payload = {
        productName: "Keyboard v2",
        productCategory: "Electronics",
        description: "Updated",
        productPrice: 200000,
        productStock: 3,
        productImage: "http://img/2.png",
        productImagePublicId: "pub-2",
    };

    it("memperbarui dokumen yang benar dan mengisi updatedAt dengan timestamp server", async () => {
        mockedUpdateDoc.mockResolvedValue(undefined);

        await updateSellerProduct("p1", payload);

        expect(mockedDoc).toHaveBeenCalledWith(dbFirebase, "master-products", "p1");
        expect(mockedUpdateDoc).toHaveBeenCalledWith(docRef, { ...payload, updatedAt: "SERVER_TS" });
    });

    it("tidak menyertakan sellerId pada update", async () => {
        mockedUpdateDoc.mockResolvedValue(undefined);

        await updateSellerProduct("p1", payload);

        const sent = mockedUpdateDoc.mock.calls[0][1] as unknown as Record<string, unknown>;
        expect(sent).not.toHaveProperty("sellerId");
    });

    it("error Firestore diteruskan", async () => {
        mockedUpdateDoc.mockRejectedValue(new Error("fail"));
        await expect(updateSellerProduct("p1", payload)).rejects.toThrow("fail");
    });
});

describe("deleteSellerProduct", () => {
    it("menghapus dokumen sesuai id", async () => {
        mockedDeleteDoc.mockResolvedValue(undefined);

        await deleteSellerProduct("p1");

        expect(mockedDoc).toHaveBeenCalledWith(dbFirebase, "master-products", "p1");
        expect(mockedDeleteDoc).toHaveBeenCalledWith(docRef);
    });

    it("error Firestore diteruskan", async () => {
        mockedDeleteDoc.mockRejectedValue(new Error("fail"));
        await expect(deleteSellerProduct("p1")).rejects.toThrow("fail");
    });
});