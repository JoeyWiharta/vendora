"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { authErrorMessage, dashboardPath, loginUser } from "../_services/authService";
import type { LoginPayload } from "../_types/loginTypes";

export const useLogin = () => {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);

    return useMutation({
        mutationFn: (payload: LoginPayload) => loginUser(payload),
        onSuccess: (session, variables) => {
            setAuth(session, variables.rememberMe);
            toast.success("Login successful");
            router.replace(dashboardPath(session.user.role));
        },
        onError: (error) => {
            toast.error(authErrorMessage(error));
        },
    });
}