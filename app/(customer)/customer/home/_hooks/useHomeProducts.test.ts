import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { useHomeProducts, HOME_PRODUCTS_QUERY_KEY } from "./useHomeProducts";

jest.mock("@tanstack/react-query", () => ({
    useQuery: jest.fn(),
}));

jest.mock("../_services/homeProductService", () => ({
    getAvailableProducts: jest.fn(),
}));

jest.mock("../_utils/shuffle", () => ({
    shuffle: jest.fn((arr) => [...arr]),
}));

const mockUseQuery = useQuery as jest.Mock;
const mockShuffle = jest.requireMock("../_utils/shuffle").shuffle as jest.Mock;

const mockProducts = Array.from({ length: 12 }, (_, index) => ({
    id: `product-${index + 1}`,
    productName: `Product ${index + 1}`,
    productCategory: "Electronics",
    productImage: "",
    productPrice: 10000,
    productStock: 10,
    description: "",
    sellerId: "seller-1",
}));

describe("useHomeProducts", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockUseQuery.mockReturnValue({
            data: mockProducts,
            isLoading: false,
            isError: false,
        });

        mockShuffle.mockImplementation((arr) => [...arr]);
    });

    it("menggunakan konfigurasi React Query yang benar", () => {
        renderHook(() => useHomeProducts());

        expect(mockUseQuery).toHaveBeenCalledWith({
            queryKey: HOME_PRODUCTS_QUERY_KEY,
            queryFn: expect.any(Function),
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
        });

        expect(HOME_PRODUCTS_QUERY_KEY).toEqual(["home-products"]);
    });

    it("menghasilkan shuffled products dan maksimal 10 recommended products", () => {
        const { result } = renderHook(() => useHomeProducts());

        expect(mockShuffle).toHaveBeenCalledWith(mockProducts);
        expect(result.current.shuffled).toHaveLength(12);
        expect(result.current.recommended).toHaveLength(10);
        expect(result.current.recommended).toEqual(mockProducts.slice(0, 10));
    });

    it("menggunakan array kosong ketika data belum tersedia", () => {
        mockUseQuery.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        });

        const { result } = renderHook(() => useHomeProducts());

        expect(mockShuffle).toHaveBeenCalledWith([]);
        expect(result.current.shuffled).toEqual([]);
        expect(result.current.recommended).toEqual([]);
        expect(result.current.isLoading).toBe(true);
    });

    it("meneruskan properti hasil React Query", () => {
        const queryResult = {
            data: mockProducts,
            isLoading: false,
            isError: true,
            error: new Error("Failed"),
        };

        mockUseQuery.mockReturnValue(queryResult);

        const { result } = renderHook(() => useHomeProducts());

        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(queryResult.error);
    });
});