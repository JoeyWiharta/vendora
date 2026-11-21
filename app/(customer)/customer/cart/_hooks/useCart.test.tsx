import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import {
    addToCart,
    getCartItemQuantity,
    getCartItems,
    removeCartItem,
    setCartQuantity,
} from "../_services/cartService";
import {
    CART_QUERY_KEY,
    useAddToCart,
    useCartItemQuantity,
    useCartItems,
    useRemoveCartItem,
    useUpdateCartQuantity,
} from "./useCart";

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("../_services/cartService", () => ({
    addToCart: jest.fn(),
    getCartItemQuantity: jest.fn(),
    getCartItems: jest.fn(),
    removeCartItem: jest.fn(),
    setCartQuantity: jest.fn(),
}));

let mockUid: string | undefined = "u1";
jest.mock("@/app/(authentication)/_shared/_store/authStore", () => ({
    useAuthStore: (selector: (s: { user: { uid: string } | null }) => unknown) =>
        selector({ user: mockUid ? { uid: mockUid } : null }),
}));

const mockGetQty = getCartItemQuantity as jest.Mock;
const mockGetItems = getCartItems as jest.Mock;
const mockAdd = addToCart as jest.Mock;
const mockSet = setCartQuantity as jest.Mock;
const mockRemove = removeCartItem as jest.Mock;

const setup = () => {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    return { client, wrapper };
};

beforeEach(() => {
    jest.clearAllMocks();
    mockUid = "u1";
});

describe("useCartItemQuantity", () => {
    it("mengambil quantity item milik user", async () => {
        mockGetQty.mockResolvedValue(3);
        const { wrapper } = setup();

        const { result } = renderHook(() => useCartItemQuantity("p1"), { wrapper });

        await waitFor(() => expect(result.current.data).toBe(3));
        expect(mockGetQty).toHaveBeenCalledWith("u1", "p1");
    });

    it("tidak fetch kalau belum login", () => {
        mockUid = undefined;
        const { wrapper } = setup();

        const { result } = renderHook(() => useCartItemQuantity("p1"), { wrapper });

        expect(result.current.fetchStatus).toBe("idle");
        expect(mockGetQty).not.toHaveBeenCalled();
    });
});

describe("useCartItems", () => {
    it("mengambil daftar cart milik user", async () => {
        const items = [{ productId: "a", quantity: 1, product: null }];
        mockGetItems.mockResolvedValue(items);
        const { wrapper } = setup();

        const { result } = renderHook(() => useCartItems(), { wrapper });

        await waitFor(() => expect(result.current.data).toEqual(items));
        expect(mockGetItems).toHaveBeenCalledWith("u1");
    });

    it("tidak fetch kalau belum login", () => {
        mockUid = undefined;
        const { wrapper } = setup();

        const { result } = renderHook(() => useCartItems(), { wrapper });

        expect(result.current.fetchStatus).toBe("idle");
        expect(mockGetItems).not.toHaveBeenCalled();
    });
});

describe("useAddToCart", () => {
    it("memanggil addToCart, menampilkan toast, dan invalidate cart", async () => {
        mockAdd.mockResolvedValue(undefined);
        const { client, wrapper } = setup();
        const spy = jest.spyOn(client, "invalidateQueries");
        const { result } = renderHook(() => useAddToCart("p1"), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(2);
        });

        expect(mockAdd).toHaveBeenCalledWith("u1", "p1", 2);
        expect(toast.success).toHaveBeenCalledWith("Added to cart");
        expect(spy).toHaveBeenCalledWith({ queryKey: CART_QUERY_KEY });
    });

    it("menampilkan pesan error dari server", async () => {
        mockAdd.mockRejectedValue(new Error("Stok habis"));
        const { wrapper } = setup();
        const { result } = renderHook(() => useAddToCart("p1"), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(1).catch(() => undefined);
        });

        expect(toast.error).toHaveBeenCalledWith("Stok habis");
        expect(toast.success).not.toHaveBeenCalled();
    });

    it("memakai pesan default kalau error tidak punya message", async () => {
        mockAdd.mockRejectedValue(new Error(""));
        const { wrapper } = setup();
        const { result } = renderHook(() => useAddToCart("p1"), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(1).catch(() => undefined);
        });

        expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
});

describe("useUpdateCartQuantity", () => {
    it("memanggil setCartQuantity tanpa toast sukses", async () => {
        mockSet.mockResolvedValue(undefined);
        const { client, wrapper } = setup();
        const spy = jest.spyOn(client, "invalidateQueries");
        const { result } = renderHook(() => useUpdateCartQuantity(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync({ productId: "p1", quantity: 4 });
        });

        expect(mockSet).toHaveBeenCalledWith("u1", "p1", 4);
        expect(toast.success).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith({ queryKey: CART_QUERY_KEY });
    });
});

describe("useRemoveCartItem", () => {
    it("memanggil removeCartItem dan menampilkan toast", async () => {
        mockRemove.mockResolvedValue(undefined);
        const { wrapper } = setup();
        const { result } = renderHook(() => useRemoveCartItem(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync("p1");
        });

        expect(mockRemove).toHaveBeenCalledWith("u1", "p1");
        expect(toast.success).toHaveBeenCalledWith("Removed from cart");
    });
});