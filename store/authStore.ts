import { create } from "zustand";
import type { UserData } from "@/app/(authentication)/_types/authTypes";

interface AuthState {
    user: UserData | null;
    loading: boolean;
    setUser: (
        user: UserData | null
    ) => void;
}

export const useAuthStore = create<AuthState>(
    (set) => ({
        user: null,
        loading: true,
        setUser: (user) => set({
            user,
            loading: false
        }),
    }));

export const authFlow = { busy: false };