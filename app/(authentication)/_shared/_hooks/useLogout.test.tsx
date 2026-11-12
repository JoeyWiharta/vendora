import type { ReactNode } from "react";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ replace: mockReplace }),
}));
jest.mock("sonner", () => ({ toast: { promise: jest.fn() } }));
jest.mock("../_services/authService", () => ({ logoutUser: jest.fn() }));
jest.mock("@/query/queryClient", () => ({ queryClient: { clear: jest.fn() } }));

import { toast } from "sonner";
import { queryClient } from "@/query/queryClient";
import { logoutUser } from "../_services/authService";
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { useLogout } from "./useLogout";

const mockedLogoutUser = jest.mocked(logoutUser);
const mockedToastPromise = jest.mocked(toast.promise);
const mockedClear = jest.mocked(queryClient.clear);

const createWrapper = () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    };
};

const loggedInUser = { uid: "u1", email: "user@mail.com", role: "customer" as const };

beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: loggedInUser, loading: false });
});

describe("useLogout", () => {
    it("sukses: signOut dipanggil, store dikosongkan, cache dibersihkan, redirect ke /login", async () => {
        mockedLogoutUser.mockResolvedValue(undefined);
        const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

        await act(async () => {
            await result.current.mutateAsync();
        });

        expect(mockedLogoutUser).toHaveBeenCalledTimes(1);
        expect(useAuthStore.getState().user).toBeNull();
        expect(mockedClear).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith("/login");
    });

    it("gagal: user tetap dikeluarkan secara lokal (onSettled)", async () => {
        mockedLogoutUser.mockRejectedValue(new Error("network"));
        const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

        await act(async () => {
            await result.current.mutateAsync().catch(() => { });
        });

        expect(useAuthStore.getState().user).toBeNull();
        expect(mockedClear).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith("/login");
    });

    it("menampilkan toast loading, sukses, dan error", async () => {
        mockedLogoutUser.mockResolvedValue(undefined);
        const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

        await act(async () => {
            await result.current.mutateAsync();
        });

        expect(mockedToastPromise).toHaveBeenCalledWith(
            expect.any(Promise),
            { loading: "Logging out...", success: "Logged out", error: "Logged out" },
        );
    });
});