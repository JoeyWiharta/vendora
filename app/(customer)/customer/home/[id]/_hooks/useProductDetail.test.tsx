
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { getProductById } from "../../_services/homeProductService";
import { useProductDetail } from "./useProductDetail";

jest.mock("../../_services/homeProductService", () => ({
    getProductById: jest.fn(),
}));

const mockGetProductById = jest.mocked(getProductById);

const wrapper = ({ children }: { children: ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe("useProductDetail", () => {
    it("berhasil mengambil detail produk berdasarkan ID", async () => {
        const product = {
            id: "product-1",
            productName: "Test Product",
            productPrice: 100000,
            productStock: 10,
        };

        mockGetProductById.mockResolvedValue(product as never);

        const { result } = renderHook(
            () => useProductDetail("product-1"),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockGetProductById).toHaveBeenCalledTimes(1);
        expect(mockGetProductById).toHaveBeenCalledWith("product-1");
        expect(result.current.data).toEqual(product);
    });

    it("menampilkan error ketika gagal mengambil detail produk", async () => {
        const error = new Error("Failed to fetch product");

        mockGetProductById.mockRejectedValue(error);

        const { result } = renderHook(
            () => useProductDetail("product-1"),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toEqual(error);
        expect(mockGetProductById).toHaveBeenCalledWith("product-1");
    });

    it("memulai query dalam kondisi loading", async () => {
        let resolveProduct!: (value: unknown) => void;

        mockGetProductById.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveProduct = resolve;
                }) as never,
        );

        const { result } = renderHook(
            () => useProductDetail("product-1"),
            { wrapper },
        );

        expect(result.current.isLoading).toBe(true);

        resolveProduct({
            id: "product-1",
            productName: "Test Product",
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });
    });
});
