import { create } from "zustand";
import type { AuthState } from "@/app/(authentication)/_shared/_types/authTypes";

export const useAuthStore = create<AuthState>(
    (set) => ({
        user: null,
        loading: true,
        setUser: (user) => set({
            user,
            loading: false
        }),
    }));

