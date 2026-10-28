"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { registerUser } from "../_services/authService";
import type { RegisterPayload } from "../_types/registerTypes";
import { authErrorMessage } from "../_utils/authErrorMessage";
import { authPath } from "../_utils/authPath";

export const useRegister = () => {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);

    return useMutation({
        mutationFn: (payload: RegisterPayload) => {
            const promise = registerUser(payload);
            toast.promise(promise, {
                loading: "Creating account...",
                success: "Account created successfully",
                error: (error) => authErrorMessage(error),
            });
            return promise
        },
        onSuccess: (session) => {
            setAuth(session, true);
            router.replace(authPath(session.user.role));
        },
    });
}