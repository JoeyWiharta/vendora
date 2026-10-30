"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/query/queryClient";
import { useAuthStore } from "@/store/authStore";
import { logoutUser } from "../_services/authService";

export const useLogout = () => {
    const router = useRouter();
    const clearAuth = useAuthStore((s) => s.clearAuth);

    return useMutation({
        mutationFn: () => {
            const promise = logoutUser();
            toast.promise(promise, {
                loading: "Logging out...",
                success: "Logged out",
                error: "Logged out",
            });
            return promise;
        },
        onSettled: () => {
            clearAuth();
            useAuthStore.persist.clearStorage();
            queryClient.clear();
            router.replace("/login");
        },
    });
};