import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
    AuthenticatedSession,
    AuthenticatedUser,
} from "@/app/(authentication)/_types/authTypes";

interface AuthState {
    user: AuthenticatedUser | null;
    token: string | null;
    remember: boolean;
    hydrated: boolean;
    setAuth: (session: AuthenticatedSession, remember: boolean) => void;
    clearAuth: () => void;
}

// remember = true  -> localStorage (tetap login setelah browser ditutup)
// remember = false -> sessionStorage (hilang saat tab ditutup)
const authStorage = createJSONStorage(() => ({
    getItem: (name) => localStorage.getItem(name) ?? sessionStorage.getItem(name),
    setItem: (name, value) => {
        const remember = JSON.parse(value).state.remember;
        const target = remember ? localStorage : sessionStorage;
        const other = remember ? sessionStorage : localStorage;
        target.setItem(name, value);
        other.removeItem(name);
    },
    removeItem: (name) => {
        localStorage.removeItem(name);
        sessionStorage.removeItem(name);
    },
}));

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            remember: true,
            hydrated: false,

            setAuth: ({ user, idToken }, remember) =>
                set({ user, token: idToken, remember }),

            clearAuth: () => set({ user: null, token: null }),
        }),
        {
            name: "vendora-auth",
            storage: authStorage,
            skipHydration: true,
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                remember: state.remember,
            }),
            onRehydrateStorage: () => () => {
                useAuthStore.setState({ hydrated: true });
            },
        }
    )
);