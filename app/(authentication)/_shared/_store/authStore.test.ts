import { useAuthStore } from "./authStore";
import type { AuthState } from "@/app/(authentication)/_shared/_types/authTypes";

const fakeUser = { uid: "u1", email: "user@mail.com", role: "customer" } as unknown as AuthState["user"];

describe("useAuthStore", () => {
    beforeEach(() => {
        useAuthStore.setState({ user: null, loading: true });
    });

    it("state awal: belum ada user dan masih loading", () => {
        const { user, loading } = useAuthStore.getState();
        expect(user).toBeNull();
        expect(loading).toBe(true);
    });

    it("setUser mengisi user dan menghentikan loading", () => {
        useAuthStore.getState().setUser(fakeUser);

        const { user, loading } = useAuthStore.getState();
        expect(user).toEqual(fakeUser);
        expect(loading).toBe(false);
    });

    it("setUser(null) mengosongkan user tetapi tetap menghentikan loading", () => {
        useAuthStore.getState().setUser(fakeUser);
        useAuthStore.getState().setUser(null);

        const { user, loading } = useAuthStore.getState();
        expect(user).toBeNull();
        expect(loading).toBe(false);
    });
});