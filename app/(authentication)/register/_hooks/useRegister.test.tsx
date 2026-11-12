import type { ReactNode } from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ replace: mockReplace }),
}));
jest.mock("sonner", () => ({ toast: { promise: jest.fn() } }));
jest.mock("../../_shared/_services/authService", () => ({ registerUser: jest.fn() }));
jest.mock("@/app/(seller)/seller/_constants/SellerSidebarMenu", () => ({
    SELLER_HOME_PATH: "/seller/test-home",
}));
jest.mock("@/app/(customer)/customer/_constants/CustomerNavMenu", () => ({
    CUSTOMER_HOME_PATH: "/customer/test-home",
}));

import { toast } from "sonner";
import { registerUser } from "../../_shared/_services/authService";
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { useRegister } from "./useRegister";

const mockedRegisterUser = jest.mocked(registerUser);
const mockedToastPromise = jest.mocked(toast.promise);

const makePayload = (role: "customer" | "seller") =>
    ({
        role,
        email: "user@mail.com",
        password: "password123",
        confirmPassword: "password123",
    }) as Parameters<typeof registerUser>[0];

const wrapper = ({ children }: { children: ReactNode }) => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    return <QueryClientProvider client={ client }> { children } </QueryClientProvider>;
};

beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, loading: true });
});

describe("useRegister", () => {
    it.each([
        ["customer", "/customer/test-home"],
        ["seller", "/seller/test-home"],
    ] as const)("register sebagai %s: auto-login (store terisi) dan redirect ke %s", async (role, path) => {
        const user = { uid: "u1", email: "user@mail.com", role };
        mockedRegisterUser.mockResolvedValue(user);
        const payload = makePayload(role);
        const { result } = renderHook(() => useRegister(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(payload);
        });

        expect(mockedRegisterUser).toHaveBeenCalledWith(payload);
        expect(useAuthStore.getState().user).toEqual(user);
        expect(mockReplace).toHaveBeenCalledWith(path);
    });

    it("gagal: tidak mengisi store dan tidak redirect", async () => {
        mockedRegisterUser.mockRejectedValue(new Error("fail"));
        const { result } = renderHook(() => useRegister(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(makePayload("customer")).catch(() => { });
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(useAuthStore.getState().user).toBeNull();
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it("menampilkan toast loading dan sukses", async () => {
        mockedRegisterUser.mockResolvedValue({ uid: "u1", email: "a@b.com", role: "customer" });
        const { result } = renderHook(() => useRegister(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(makePayload("customer"));
        });

        expect(mockedToastPromise).toHaveBeenCalledWith(
            expect.any(Promise),
            expect.objectContaining({
                loading: "Creating account...",
                success: "Account created successfully",
            }),
        );
    });

    it("toast error memakai pesan dari authErrorMessage", async () => {
        mockedRegisterUser.mockRejectedValue(new Error("x"));
        const { result } = renderHook(() => useRegister(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync(makePayload("customer")).catch(() => { });
        });

        const options = mockedToastPromise.mock.calls[0][1] as { error: (e: unknown) => string };
        expect(options.error({ code: "auth/weak-password" })).toBe("Password is too weak");
    });
});