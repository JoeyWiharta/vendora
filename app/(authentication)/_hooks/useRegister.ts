"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import {
    authErrorMessage,
    dashboardPath,
    registerUser,
} from "../_services/authService";
import type { RegisterPayload } from "../_types/registerTypes";

export function useRegister() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);

    return useMutation({
        mutationFn: (payload: RegisterPayload) => registerUser(payload),
        onSuccess: (session) => {
            setAuth(session, true);
            toast.success("Account created successfully");
            router.replace(dashboardPath(session.user.role));
        },
        onError: (error) => {
            toast.error(authErrorMessage(error));
        },
    });
}