import type { ReactNode } from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ replace: mockReplace }),
}));
jest.mock("sonner", () => ({ toast: { promise: jest.fn() } }));
jest.mock("../../_shared/_services/authService", () => ({ loginUser: jest.fn() }));
jest.mock("@/app/(seller)/seller/_constants/SellerSidebarMenu", () => ({
    SELLER_HOME_PATH: "/seller/test-home",
}));
jest.mock("@/app/(customer)/customer/_constants/CustomerNavMenu", () => ({
    CUSTOMER_HOME_PATH: "/customer/test-home",
}));

import { toast } from "sonner";
import { loginUser } from "../../_shared/_services/authService";
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { useLogin } from "./useLogin";

const mockedLoginUser = jest.mocked(loginUser);
const mockedToastPromise = jest.mocked(toast.promise);

const payload = { email: "user@mail.com", password: "secret", rememberMe: false };

const wrapper = ({ children }: { children: ReactNode }) => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, loading: true });
});

describe("useLogin", () => {
    it.each([
        ["customer", "/customer/test-home"],
        ["seller", "/seller/test-home"],
    ] as const)("sukses sebagai %s: mengisi store dan redirect ke %s", async (role, path) => {
        const user = { uid: "u1", email: "user@mail.com", role };
        mockedLoginUser.mockResolvedValue(user);
        const { result } = renderHook(() => useLogin(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(payload);
        });

        expect(mockedLoginUser).toHaveBeenCalledWith(payload);
        expect(useAuthStore.getState().user).toEqual(user);
        expect(mockReplace).toHaveBeenCalledWith(path);
    });

    it("gagal: tidak mengisi store dan tidak redirect", async () => {
        mockedLoginUser.mockRejectedValue(new Error("Invalid email or password"));
        const { result } = renderHook(() => useLogin(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(payload).catch(() => { });
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(useAuthStore.getState().user).toBeNull();
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it("menampilkan toast loading dan sukses", async () => {
        mockedLoginUser.mockResolvedValue({ uid: "u1", email: "a@b.com", role: "customer" });
        const { result } = renderHook(() => useLogin(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(payload);
        });

        expect(mockedToastPromise).toHaveBeenCalledWith(
            expect.any(Promise),
            expect.objectContaining({ loading: "Logging in...", success: "Login successful" }),
        );
    });

    it("toast error memakai pesan ramah dari authErrorMessage", async () => {
        mockedLoginUser.mockRejectedValue(Object.assign(new Error("x"), { code: "auth/wrong-password" }));
        const { result } = renderHook(() => useLogin(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(payload).catch(() => { });
        });

        const options = mockedToastPromise.mock.calls[0][1] as { error: (e: unknown) => string };
        expect(options.error({ code: "auth/wrong-password" })).toBe("Invalid email or password");
    });
});