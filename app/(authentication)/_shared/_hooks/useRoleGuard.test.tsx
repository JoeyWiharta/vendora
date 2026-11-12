import { renderHook } from "@testing-library/react";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ replace: mockReplace }),
}));
jest.mock("@/app/(seller)/seller/_constants/SellerSidebarMenu", () => ({
    SELLER_HOME_PATH: "/seller/test-home",
}));
jest.mock("@/app/(customer)/customer/_constants/CustomerNavMenu", () => ({
    CUSTOMER_HOME_PATH: "/customer/test-home",
}));

import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { useRoleGuard } from "./useRoleGuard";

const customer = { uid: "u1", email: "c@mail.com", role: "customer" as const };
const seller = { uid: "u2", email: "s@mail.com", role: "seller" as const };

beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, loading: true });
});

describe("useRoleGuard", () => {
    it("saat loading: tidak redirect dan belum ready", () => {
        const { result } = renderHook(() => useRoleGuard("customer"));

        expect(result.current.ready).toBe(false);
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it("belum login: redirect ke /login dan tidak ready", () => {
        useAuthStore.setState({ user: null, loading: false });
        const { result } = renderHook(() => useRoleGuard("customer"));

        expect(mockReplace).toHaveBeenCalledWith("/login");
        expect(result.current.ready).toBe(false);
    });

    it("customer membuka halaman seller: diarahkan ke home customer", () => {
        useAuthStore.setState({ user: customer, loading: false });
        const { result } = renderHook(() => useRoleGuard("seller"));

        expect(mockReplace).toHaveBeenCalledWith("/customer/test-home");
        expect(result.current.ready).toBe(false);
    });

    it("seller membuka halaman customer: diarahkan ke home seller", () => {
        useAuthStore.setState({ user: seller, loading: false });
        const { result } = renderHook(() => useRoleGuard("customer"));

        expect(mockReplace).toHaveBeenCalledWith("/seller/test-home");
        expect(result.current.ready).toBe(false);
    });

    it.each([
        ["customer", customer],
        ["seller", seller],
    ] as const)("role %s di halaman yang sesuai: ready dan tidak redirect", (required, user) => {
        useAuthStore.setState({ user, loading: false });
        const { result } = renderHook(() => useRoleGuard(required));

        expect(result.current.ready).toBe(true);
        expect(mockReplace).not.toHaveBeenCalled();
    });
});