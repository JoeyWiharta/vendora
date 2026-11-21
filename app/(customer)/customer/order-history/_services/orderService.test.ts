import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    runTransaction,
    where,
} from "firebase/firestore";
import type { CartItem } from "../../_shared/_types/cartTypes";
import { checkout, getMyOrders } from "./orderService";

jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    orderBy: jest.fn(),
    query: jest.fn(),
    runTransaction: jest.fn(),
    serverTimestamp: jest.fn(),
    where: jest.fn(),
}));
jest.mock("@/lib/firebase", () => ({ dbFirebase: { __db: true } }));

const { serverTimestamp } = jest.requireMock("firebase/firestore");

const mockDoc = doc as jest.Mock;
const mockCollection = collection as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;
const mockQuery = query as jest.Mock;
const mockWhere = where as jest.Mock;
const mockOrderBy = orderBy as jest.Mock;
const mockRunTransaction = runTransaction as jest.Mock;

const tx = { get: jest.fn(), update: jest.fn(), set: jest.fn(), delete: jest.fn() };

type ProductData = {
    productName: string;
    productImage?: string;
    productPrice: number;
    productStock: number;
    sellerId: string;
};

const cartItem = (productId: string, quantity: number) => ({ productId, quantity }) as unknown as CartItem;

const productSnap = (id: string, data: ProductData | null) => ({
    id,
    exists: () => data !== null,
    data: () => data,
});

/** Atur isi "database" produk untuk tx.get */
const seedProducts = (products: Record<string, ProductData | null>) => {
    tx.get.mockImplementation(async (ref: { id: string }) => productSnap(ref.id, products[ref.id] ?? null));
};

const keyboard: ProductData = {
    productName: "Keyboard",
    productImage: "kb.jpg",
    productPrice: 750000,
    productStock: 10,
    sellerId: "s1",
};
const chair: ProductData = {
    productName: "Chair",
    productImage: "chair.jpg",
    productPrice: 2450000,
    productStock: 3,
    sellerId: "s2",
};

beforeEach(() => {
    jest.clearAllMocks();
    serverTimestamp.mockReturnValue("SERVER_TS");
    mockCollection.mockImplementation((_db, ...segments: string[]) => ({ path: segments.join("/") }));
    mockDoc.mockImplementation((...args: unknown[]) => {
        // doc(collectionRef) -> dokumen baru dengan id otomatis
        if (args.length === 1) return { id: "order-1", path: "trx-orders/order-1" };
        const segments = args.slice(1) as string[];
        return { id: segments[segments.length - 1], path: segments.join("/") };
    });
    mockRunTransaction.mockImplementation((_db, cb) => cb(tx));
});

describe("checkout", () => {
    it("melempar error dan tidak membuka transaksi kalau cart kosong", async () => {
        await expect(checkout("u1", [])).rejects.toThrow("Cart is empty");
        expect(mockRunTransaction).not.toHaveBeenCalled();
    });

    it("mengurangi stok produk sesuai quantity", async () => {
        seedProducts({ k1: keyboard, c1: chair });

        await checkout("u1", [cartItem("k1", 2), cartItem("c1", 3)]);

        expect(tx.update).toHaveBeenCalledWith({ id: "k1", path: "master-products/k1" }, { productStock: 8 });
        expect(tx.update).toHaveBeenCalledWith({ id: "c1", path: "master-products/c1" }, { productStock: 0 });
    });

    it("membuat order dengan snapshot item dan total harga", async () => {
        seedProducts({ k1: keyboard, c1: chair });

        await checkout("u1", [cartItem("k1", 2), cartItem("c1", 1)]);

        expect(tx.set).toHaveBeenCalledWith(
            { id: "order-1", path: "trx-orders/order-1" },
            {
                userId: "u1",
                createdAt: "SERVER_TS",
                totalPrice: 2 * 750000 + 1 * 2450000,
                items: [
                    {
                        productId: "k1",
                        sellerId: "s1",
                        name: "Keyboard",
                        imageUrl: "kb.jpg",
                        price: 750000,
                        quantity: 2,
                    },
                    {
                        productId: "c1",
                        sellerId: "s2",
                        name: "Chair",
                        imageUrl: "chair.jpg",
                        price: 2450000,
                        quantity: 1,
                    },
                ],
            },
        );
    });

    it("hanya menghapus item cart yang dibeli", async () => {
        seedProducts({ k1: keyboard });

        await checkout("u1", [cartItem("k1", 1)]);

        expect(tx.delete).toHaveBeenCalledTimes(1);
        expect(tx.delete).toHaveBeenCalledWith({ id: "k1", path: "trx-carts/u1/items/k1" });
    });

    it("mengembalikan id order", async () => {
        seedProducts({ k1: keyboard });
        await expect(checkout("u1", [cartItem("k1", 1)])).resolves.toBe("order-1");
    });

    it("memakai imageUrl kosong kalau produk tidak punya gambar", async () => {
        seedProducts({ k1: { ...keyboard, productImage: undefined } });

        await checkout("u1", [cartItem("k1", 1)]);

        const orderData = tx.set.mock.calls[0][1];
        expect(orderData.items[0].imageUrl).toBe("");
    });

    it("gagal dengan pesan stok kalau stok terbaru tidak cukup", async () => {
        seedProducts({ c1: chair }); // stok 3

        await expect(checkout("u1", [cartItem("c1", 4)])).rejects.toThrow(
            "Insufficient stock for Chair (only 3 left)",
        );
    });

    it("gagal kalau salah satu produk sudah tidak ada", async () => {
        seedProducts({ k1: keyboard, gone: null });

        await expect(checkout("u1", [cartItem("k1", 1), cartItem("gone", 1)])).rejects.toThrow(
            "A product in your cart is no longer available",
        );
    });

    it("tidak menulis apa pun kalau validasi gagal", async () => {
        seedProducts({ k1: keyboard, c1: chair });

        await expect(checkout("u1", [cartItem("k1", 1), cartItem("c1", 99)])).rejects.toThrow();

        expect(tx.update).not.toHaveBeenCalled();
        expect(tx.set).not.toHaveBeenCalled();
        expect(tx.delete).not.toHaveBeenCalled();
    });

    it("membaca semua produk sebelum menulis (aturan transaksi Firestore)", async () => {
        seedProducts({ k1: keyboard, c1: chair });

        await checkout("u1", [cartItem("k1", 1), cartItem("c1", 1)]);

        const lastGetOrder = Math.max(...tx.get.mock.invocationCallOrder);
        const firstWriteOrder = Math.min(
            ...tx.update.mock.invocationCallOrder,
            ...tx.set.mock.invocationCallOrder,
            ...tx.delete.mock.invocationCallOrder,
        );
        expect(lastGetOrder).toBeLessThan(firstWriteOrder);
    });
});

describe("getMyOrders", () => {
    it("query berdasarkan userId dan urut createdAt terbaru", async () => {
        mockWhere.mockReturnValue("WHERE");
        mockOrderBy.mockReturnValue("ORDER_BY");
        mockQuery.mockReturnValue("QUERY");
        mockGetDocs.mockResolvedValue({ docs: [] });

        await getMyOrders("u1");

        expect(mockCollection).toHaveBeenCalledWith({ __db: true }, "trx-orders");
        expect(mockWhere).toHaveBeenCalledWith("userId", "==", "u1");
        expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "desc");
        expect(mockQuery).toHaveBeenCalledWith({ path: "trx-orders" }, "WHERE", "ORDER_BY");
        expect(mockGetDocs).toHaveBeenCalledWith("QUERY");
    });

    it("memetakan dokumen menjadi Order", async () => {
        const createdAt = { toDate: () => new Date("2026-11-21") };
        const items = [{ productId: "k1", name: "Keyboard", quantity: 1, price: 750000 }];
        mockGetDocs.mockResolvedValue({
            docs: [{ id: "o1", data: () => ({ userId: "u1", totalPrice: 750000, createdAt, items }) }],
        });

        await expect(getMyOrders("u1")).resolves.toEqual([
            { id: "o1", userId: "u1", totalPrice: 750000, createdAt, items },
        ]);
    });

    it("memakai default totalPrice 0 dan items [] kalau data tidak lengkap", async () => {
        mockGetDocs.mockResolvedValue({ docs: [{ id: "o2", data: () => ({ userId: "u1" }) }] });

        const [order] = await getMyOrders("u1");

        expect(order.totalPrice).toBe(0);
        expect(order.items).toEqual([]);
    });

    it("mengembalikan array kosong kalau belum ada order", async () => {
        mockGetDocs.mockResolvedValue({ docs: [] });
        await expect(getMyOrders("u1")).resolves.toEqual([]);
    });
});