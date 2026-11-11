"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { registerUser } from "../../_shared/_services/authService";
import type { RegisterPayload } from "../_types/registerTypes";
import { authErrorMessage } from "../../_shared/_utils/authErrorMessage";
import { authPath } from "../../_shared/_utils/authPath";

export const useRegister = () => {
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);

    return useMutation({
        mutationFn: (payload: RegisterPayload) => {
            const promise = registerUser(payload);
            toast.promise(promise, {
                loading: "Creating account...",
                success: "Account created successfully",
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