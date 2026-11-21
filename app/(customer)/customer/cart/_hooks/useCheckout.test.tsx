import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import type { CartItem } from "../../_shared/_types/cartTypes";
import { checkout } from "../../order-history/_services/orderService";
import { useCheckout } from "./useCheckout";

const mockPush = jest.fn();

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("../../order-history/_services/orderService", () => ({ checkout: jest.fn() }));
jest.mock("./useCart", () => ({ CART_QUERY_KEY: ["customer-cart"] }));
jest.mock("../../home/_hooks/useHomeProducts", () => ({ HOME_PRODUCTS_QUERY_KEY: ["home-products"] }));
jest.mock("@/app/(authentication)/_shared/_store/authStore", () => ({
    useAuthStore: (selector: (s: { user: { uid: string } }) => unknown) => selector({ user: { uid: "u1" } }),
}));

const mockCheckout = checkout as jest.Mock;
const items = [{ productId: "p1", quantity: 2 }] as unknown as CartItem[];

const setup = () => {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    return { client, wrapper };
};

beforeEach(() => jest.clearAllMocks());

describe("useCheckout", () => {
    it("memanggil checkout dengan uid dan item yang dikirim", async () => {
        mockCheckout.mockResolvedValue("order-1");
        const { wrapper } = setup();
        const { result } = renderHook(() => useCheckout(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(items);
        });

        expect(mockCheckout).toHaveBeenCalledWith("u1", items);
    });

    it("saat sukses: toast, invalidate semua query terkait, lalu ke order history", async () => {
        mockCheckout.mockResolvedValue("order-1");
        const { client, wrapper } = setup();
        const spy = jest.spyOn(client, "invalidateQueries");
        const { result } = renderHook(() => useCheckout(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(items);
        });

        expect(toast.success).toHaveBeenCalledWith("Purchase successful");
        expect(spy).toHaveBeenCalledWith({ queryKey: ["customer-cart"] });
        expect(spy).toHaveBeenCalledWith({ queryKey: ["home-products"] });
        expect(spy).toHaveBeenCalledWith({ queryKey: ["customer-product"] });
        expect(spy).toHaveBeenCalledWith({ queryKey: ["customer-orders"] });
        // Mencegah bug lama: sebelumnya diarahkan ke /customer/orders (404)
        expect(mockPush).toHaveBeenCalledWith("/customer/order-history");
    });

    it("saat gagal: toast error, refresh cart, dan tidak berpindah halaman", async () => {
        mockCheckout.mockRejectedValue(new Error("Insufficient stock"));
        const { client, wrapper } = setup();
        const spy = jest.spyOn(client, "invalidateQueries");
        const { result } = renderHook(() => useCheckout(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(items).catch(() => undefined);
        });

        expect(toast.error).toHaveBeenCalledWith("Insufficient stock");
        expect(spy).toHaveBeenCalledWith({ queryKey: ["customer-cart"] });
        expect(mockPush).not.toHaveBeenCalled();
        expect(toast.success).not.toHaveBeenCalled();
    });

    it("memakai pesan default kalau error tidak punya message", async () => {
        mockCheckout.mockRejectedValue(new Error(""));
        const { wrapper } = setup();
        const { result } = renderHook(() => useCheckout(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(items).catch(() => undefined);
        });

        expect(toast.error).toHaveBeenCalledWith("Purchase failed");
    });
});