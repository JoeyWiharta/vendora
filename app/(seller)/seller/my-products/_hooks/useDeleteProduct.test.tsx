import type { ReactNode } from "react";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/query/queryClient", () => ({ queryClient: { invalidateQueries: jest.fn() } }));
jest.mock("../_services/productService", () => ({ deleteSellerProduct: jest.fn() }));
jest.mock("../_services/deleteImageService", () => ({ deleteImageFromCloudinary: jest.fn() }));

import { toast } from "sonner";
import { queryClient } from "@/query/queryClient";
import { deleteSellerProduct } from "../_services/productService";
import { deleteImageFromCloudinary } from "../_services/deleteImageService";
import type { Product } from "../_types/productTypes";
import { SELLER_PRODUCTS_QUERY_KEY } from "./useSellerProducts";
import { useDeleteProducts } from "./useDeleteProduct";

const mockedDeleteProduct = jest.mocked(deleteSellerProduct);
const mockedDeleteImage = jest.mocked(deleteImageFromCloudinary);
const mockedInvalidate = jest.mocked(queryClient.invalidateQueries);

const makeProduct = (id: string, publicId: string | null = null) =>
    ({ id, productName: `Product ${id}`, productImagePublicId: publicId }) as unknown as Product;

const createWrapper = () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    };
};

const run = async (products: Product[]) => {
    const { result } = renderHook(() => useDeleteProducts(), { wrapper: createWrapper() });
    let outcome: number | undefined;
    await act(async () => {
        outcome = await result.current.mutateAsync(products).catch(() => undefined);
    });
    return { result, outcome };
};

beforeEach(() => {
    jest.clearAllMocks();
    mockedDeleteProduct.mockResolvedValue(undefined);
    mockedDeleteImage.mockResolvedValue(undefined);
    jest.spyOn(console, "error").mockImplementation(() => { });
});

afterEach(() => jest.restoreAllMocks());

describe("useDeleteProducts", () => {
    it("menghapus banyak produk sekaligus", async () => {
        const { outcome } = await run([makeProduct("1"), makeProduct("2"), makeProduct("3")]);

        expect(mockedDeleteProduct).toHaveBeenCalledTimes(3);
        expect(mockedDeleteProduct).toHaveBeenCalledWith("1");
        expect(mockedDeleteProduct).toHaveBeenCalledWith("2");
        expect(mockedDeleteProduct).toHaveBeenCalledWith("3");
        expect(outcome).toBe(3);
    });

    it("gambar Cloudinary hanya dihapus untuk produk yang punya public id", async () => {
        await run([makeProduct("1", "pub-1"), makeProduct("2", null)]);

        expect(mockedDeleteImage).toHaveBeenCalledTimes(1);
        expect(mockedDeleteImage).toHaveBeenCalledWith("pub-1");
    });

    it("gagal hapus gambar tidak menggagalkan penghapusan produk", async () => {
        mockedDeleteImage.mockRejectedValue(new Error("cloudinary down"));

        const { outcome } = await run([makeProduct("1", "pub-1")]);

        expect(outcome).toBe(1);
        expect(toast.success).toHaveBeenCalledWith("Product deleted successfully");
        expect(toast.error).not.toHaveBeenCalled();
    });

    it("toast sukses tunggal dan jamak", async () => {
        await run([makeProduct("1")]);
        expect(toast.success).toHaveBeenLastCalledWith("Product deleted successfully");

        await run([makeProduct("1"), makeProduct("2")]);
        expect(toast.success).toHaveBeenLastCalledWith("2 products deleted successfully");
    });

    it("sukses: daftar produk di-invalidate (list update tanpa reload)", async () => {
        await run([makeProduct("1")]);
        expect(mockedInvalidate).toHaveBeenCalledWith({ queryKey: SELLER_PRODUCTS_QUERY_KEY });
    });

    it("semua gagal: pesan error umum dan tetap invalidate", async () => {
        mockedDeleteProduct.mockRejectedValue(new Error("fail"));

        const { outcome } = await run([makeProduct("1"), makeProduct("2")]);

        expect(outcome).toBeUndefined();
        expect(toast.error).toHaveBeenCalledWith("Failed to delete products");
        expect(mockedInvalidate).toHaveBeenCalledWith({ queryKey: SELLER_PRODUCTS_QUERY_KEY });
    });

    it("sebagian gagal: melaporkan jumlah berhasil dan gagal", async () => {
        mockedDeleteProduct.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("fail"));

        await run([makeProduct("1"), makeProduct("2")]);

        expect(toast.error).toHaveBeenCalledWith("1 deleted, 1 failed");
        expect(toast.success).not.toHaveBeenCalled();
    });
});