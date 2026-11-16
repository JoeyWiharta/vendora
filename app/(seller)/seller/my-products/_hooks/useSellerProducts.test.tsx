import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("../_services/productService", () => ({ getSellerProducts: jest.fn() }));

import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { getSellerProducts } from "../_services/productService";
import type { Product } from "../_types/productTypes";
import { SELLER_PRODUCTS_QUERY_KEY, useSellerProducts } from "./useSellerProducts";

const mockedGet = jest.mocked(getSellerProducts);

const createWrapper = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={ client }> { children } </QueryClientProvider>;
    };
};

beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, loading: false });
});

describe("useSellerProducts", () => {
    it("query key dasar", () => {
        expect(SELLER_PRODUCTS_QUERY_KEY).toEqual(["seller-products"]);
    });

    it("belum login: query tidak dijalankan", () => {
        const { result } = renderHook(() => useSellerProducts(), { wrapper: createWrapper() });

        expect(mockedGet).not.toHaveBeenCalled();
        expect(result.current.fetchStatus).toBe("idle");
    });

    it("sudah login: mengambil produk milik seller yang login", async () => {
        const products = [{ id: "p1" }] as unknown as Product[];
        mockedGet.mockResolvedValue(products);
        useAuthStore.setState({ user: { uid: "seller-1", email: "s@mail.com", role: "seller" }, loading: false });

        const { result } = renderHook(() => useSellerProducts(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(mockedGet).toHaveBeenCalledWith({ sellerId: "seller-1" });
        expect(result.current.data).toEqual(products);
    });

    it("error dari service muncul sebagai isError", async () => {
        mockedGet.mockRejectedValue(new Error("permission-denied"));
        useAuthStore.setState({ user: { uid: "seller-1", email: "s@mail.com", role: "seller" }, loading: false });

        const { result } = renderHook(() => useSellerProducts(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe("permission-denied");
    });
});