
import type { ReactNode } from "react";
import { renderHook, act } from "@testing-library/react";
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import * as ReactQuery from "@tanstack/react-query";

jest.mock("@tanstack/react-query", () => {
    const actual = jest.requireActual("@tanstack/react-query");

    return {
        ...actual,
        useMutation: jest.fn((options: any) =>
            actual.useMutation(options),
        ),
    };
});

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("@/query/queryClient", () => ({
    queryClient: {
        invalidateQueries: jest.fn(),
    },
}));

jest.mock("../_services/productService", () => ({
    deleteSellerProduct: jest.fn(),
}));

jest.mock("../_services/deleteImageService", () => ({
    deleteImageFromCloudinary: jest.fn(),
}));

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
const mockedUseMutation = jest.mocked(ReactQuery.useMutation);

const makeProduct = (id: string, publicId: string | null = null) =>
    ({
        id,
        productName: `Product ${id}`,
        productImagePublicId: publicId,
    }) as unknown as Product;

const createWrapper = () => {
    const client = new QueryClient({
        defaultOptions: {
            mutations: { retry: false },
        },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={client}>
                {children}
            </QueryClientProvider>
        );
    };
};

const run = async (products: Product[]) => {
    const { result } = renderHook(() => useDeleteProducts(), {
        wrapper: createWrapper(),
    });

    let outcome: number | undefined;

    await act(async () => {
        outcome = await result.current
            .mutateAsync(products)
            .catch(() => undefined);
    });

    return { result, outcome };
};

beforeEach(() => {
    jest.clearAllMocks();

    mockedDeleteProduct.mockResolvedValue(undefined);
    mockedDeleteImage.mockResolvedValue(undefined);

    mockedUseMutation.mockImplementation((options: any) =>
        jest.requireActual("@tanstack/react-query").useMutation(options),
    );

    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("useDeleteProducts", () => {
    it("menghapus banyak produk sekaligus", async () => {
        const { outcome } = await run([
            makeProduct("1"),
            makeProduct("2"),
            makeProduct("3"),
        ]);

        expect(mockedDeleteProduct).toHaveBeenCalledTimes(3);
        expect(mockedDeleteProduct).toHaveBeenCalledWith("1");
        expect(mockedDeleteProduct).toHaveBeenCalledWith("2");
        expect(mockedDeleteProduct).toHaveBeenCalledWith("3");
        expect(outcome).toBe(3);
    });

    it("menghapus gambar Cloudinary hanya jika public id tersedia", async () => {
        await run([
            makeProduct("1", "pub-1"),
            makeProduct("2"),
        ]);

        expect(mockedDeleteImage).toHaveBeenCalledTimes(1);
        expect(mockedDeleteImage).toHaveBeenCalledWith("pub-1");
    });

    it("kegagalan penghapusan gambar tidak menggagalkan penghapusan produk", async () => {
        mockedDeleteImage.mockRejectedValue(
            new Error("cloudinary down"),
        );

        const { outcome } = await run([
            makeProduct("1", "pub-1"),
        ]);

        expect(outcome).toBe(1);
        expect(toast.success).toHaveBeenCalledWith(
            "Product deleted successfully",
        );
        expect(toast.error).not.toHaveBeenCalled();
    });

    it("menampilkan toast sukses untuk satu produk dan banyak produk", async () => {
        await run([makeProduct("1")]);

        expect(toast.success).toHaveBeenLastCalledWith(
            "Product deleted successfully",
        );

        await run([
            makeProduct("1"),
            makeProduct("2"),
        ]);

        expect(toast.success).toHaveBeenLastCalledWith(
            "2 products deleted successfully",
        );
    });

    it("meng-invalidate query setelah berhasil", async () => {
        await run([makeProduct("1")]);

        expect(mockedInvalidate).toHaveBeenCalledWith({
            queryKey: SELLER_PRODUCTS_QUERY_KEY,
        });
    });

    it("menangani kegagalan semua produk", async () => {
        mockedDeleteProduct.mockRejectedValue(
            new Error("delete failed"),
        );

        const { outcome } = await run([
            makeProduct("1"),
            makeProduct("2"),
        ]);

        expect(outcome).toBeUndefined();
        expect(toast.error).toHaveBeenCalledWith(
            "Failed to delete products",
        );
        expect(mockedInvalidate).toHaveBeenCalledWith({
            queryKey: SELLER_PRODUCTS_QUERY_KEY,
        });
    });

    it("menangani kegagalan sebagian produk", async () => {
        mockedDeleteProduct
            .mockResolvedValueOnce(undefined)
            .mockRejectedValueOnce(new Error("delete failed"));

        await run([
            makeProduct("1"),
            makeProduct("2"),
        ]);

        expect(toast.error).toHaveBeenCalledWith(
            "1 deleted, 1 failed",
        );
        expect(toast.success).not.toHaveBeenCalled();
    });

    it("berhasil menghapus produk tanpa public id tanpa memanggil Cloudinary", async () => {
        const { outcome } = await run([
            makeProduct("1"),
        ]);

        expect(outcome).toBe(1);
        expect(mockedDeleteProduct).toHaveBeenCalledWith("1");
        expect(mockedDeleteImage).not.toHaveBeenCalled();
    });

    it("menggunakan fallback error ketika nilai error bukan instance Error", () => {
        let mutationOptions: any;

        mockedUseMutation.mockImplementation((options: any) => {
            mutationOptions = options;
            return {} as any;
        });

        renderHook(() => useDeleteProducts(), {
            wrapper: createWrapper(),
        });

        act(() => {
            mutationOptions.onError("unknown error");
        });

        expect(toast.error).toHaveBeenCalledWith(
            "Failed to delete products",
        );
    });
});
