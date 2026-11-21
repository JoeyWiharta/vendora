import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { getAvailableProducts, getProductById } from "./homeProductService";

jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
}));

jest.mock("@/lib/firebase", () => ({
    dbFirebase: "mock-db",
}));

const mockProductData = {
    productName: "Keyboard",
    productCategory: "Electronics",
    productImage: "keyboard.jpg",
    productPrice: 150000,
    productStock: 10,
    description: "Mechanical keyboard",
    sellerId: "seller-1",
};

describe("homeProductService", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (collection as jest.Mock).mockReturnValue("mock-collection");
        (where as jest.Mock).mockReturnValue("mock-where");
        (query as jest.Mock).mockReturnValue("mock-query");
        (doc as jest.Mock).mockReturnValue("mock-doc");
    });

    describe("getAvailableProducts", () => {
        it("mengambil produk yang memiliki stok lebih dari 0", async () => {
            (getDocs as jest.Mock).mockResolvedValue({
                docs: [
                    {
                        id: "product-1",
                        data: () => mockProductData,
                    },
                ],
            });

            const result = await getAvailableProducts();

            expect(collection).toHaveBeenCalledWith("mock-db", "master-products");
            expect(where).toHaveBeenCalledWith("productStock", ">", 0);
            expect(query).toHaveBeenCalledWith("mock-collection", "mock-where");
            expect(getDocs).toHaveBeenCalledWith("mock-query");

            expect(result).toEqual([
                {
                    id: "product-1",
                    ...mockProductData,
                },
            ]);
        });

        it("menggunakan nilai fallback ketika field produk tidak tersedia", async () => {
            (getDocs as jest.Mock).mockResolvedValue({
                docs: [
                    {
                        id: "product-2",
                        data: () => ({}),
                    },
                ],
            });

            const result = await getAvailableProducts();

            expect(result).toEqual([
                {
                    id: "product-2",
                    productName: "",
                    productCategory: "",
                    productImage: "",
                    productPrice: 0,
                    productStock: 0,
                    description: "",
                    sellerId: "",
                },
            ]);
        });

        it("mengembalikan array kosong ketika tidak ada produk", async () => {
            (getDocs as jest.Mock).mockResolvedValue({
                docs: [],
            });

            const result = await getAvailableProducts();

            expect(result).toEqual([]);
        });

        it("meneruskan error ketika pengambilan produk gagal", async () => {
            const error = new Error("Firestore error");

            (getDocs as jest.Mock).mockRejectedValue(error);

            await expect(getAvailableProducts()).rejects.toThrow("Firestore error");
        });
    });

    describe("getProductById", () => {
        it("mengambil produk berdasarkan id", async () => {
            (getDoc as jest.Mock).mockResolvedValue({
                id: "product-1",
                exists: () => true,
                data: () => mockProductData,
            });

            const result = await getProductById("product-1");

            expect(doc).toHaveBeenCalledWith(
                "mock-db",
                "master-products",
                "product-1",
            );
            expect(getDoc).toHaveBeenCalledWith("mock-doc");

            expect(result).toEqual({
                id: "product-1",
                ...mockProductData,
            });
        });

        it("mengembalikan null ketika produk tidak ditemukan", async () => {
            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => false,
            });

            const result = await getProductById("unknown");

            expect(result).toBeNull();
        });

        it("menggunakan nilai fallback ketika field produk tidak tersedia", async () => {
            (getDoc as jest.Mock).mockResolvedValue({
                id: "product-2",
                exists: () => true,
                data: () => ({}),
            });

            const result = await getProductById("product-2");

            expect(result).toEqual({
                id: "product-2",
                productName: "",
                productCategory: "",
                productImage: "",
                productPrice: 0,
                productStock: 0,
                description: "",
                sellerId: "",
            });
        });

        it("meneruskan error ketika pengambilan produk gagal", async () => {
            (getDoc as jest.Mock).mockRejectedValue(
                new Error("Firestore error"),
            );

            await expect(getProductById("product-1")).rejects.toThrow(
                "Firestore error",
            );
        });
    });
});