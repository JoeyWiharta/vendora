"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { loginUser } from "../_services/authService";
import type { LoginPayload } from "../_types/loginTypes";
import { authPath } from "../_utils/authPath";
import { authErrorMessage } from "../_utils/authErrorMessage";

export const useLogin = () => {
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);

    return useMutation({
        mutationFn: (payload: LoginPayload) => {
            const promise = loginUser(payload);
            toast.promise(promise, {
                loading: "Logging in...",
                success: "Login successful",
                error: (error) => authErrorMessage(error),
            });
            return promise;
        },
        onSuccess: (user) => {
            setUser(user);
            router.replace(authPath(user.role));
        },
    });
};