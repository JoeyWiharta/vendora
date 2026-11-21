import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { getMyOrders } from "../_services/orderService";
import { useOrders } from "./useOrders";

jest.mock("../_services/orderService", () => ({ getMyOrders: jest.fn() }));

let mockUid: string | undefined = "u1";
jest.mock("@/app/(authentication)/_shared/_store/authStore", () => ({
    useAuthStore: (selector: (s: { user: { uid: string } | null }) => unknown) =>
        selector({ user: mockUid ? { uid: mockUid } : null }),
}));

const mockGetMyOrders = getMyOrders as jest.Mock;

const setup = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    return { client, wrapper };
};

beforeEach(() => {
    jest.clearAllMocks();
    mockUid = "u1";
});

describe("useOrders", () => {
    it("mengambil order milik user dan menyimpannya dengan key per uid", async () => {
        const orders = [{ id: "o1" }];
        mockGetMyOrders.mockResolvedValue(orders);
        const { client, wrapper } = setup();

        const { result } = renderHook(() => useOrders(), { wrapper });

        await waitFor(() => expect(result.current.data).toEqual(orders));
        expect(mockGetMyOrders).toHaveBeenCalledWith("u1");
        expect(client.getQueryData(["customer-orders", "u1"])).toEqual(orders);
    });

    it("tidak fetch kalau belum login", () => {
        mockUid = undefined;
        const { wrapper } = setup();

        const { result } = renderHook(() => useOrders(), { wrapper });

        expect(result.current.fetchStatus).toBe("idle");
        expect(mockGetMyOrders).not.toHaveBeenCalled();
    });

    it("mengekspos error dari service", async () => {
        mockGetMyOrders.mockRejectedValue(new Error("boom"));
        const { wrapper } = setup();

        const { result } = renderHook(() => useOrders(), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe("boom");
    });
});