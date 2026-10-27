"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/query/queryClient";
import { useAuthStore } from "@/store/auth-store";
import { authErrorMessage, logoutUser } from "../_services/authService";

export function useLogout() {
    const router = useRouter();
    const clearAuth = useAuthStore((s) => s.clearAuth);

    return useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            clearAuth();
            useAuthStore.persist.clearStorage(); // hapus key dari localStorage dan sessionStorage
            queryClient.clear(); // buang cache data user sebelumnya
            toast.success("Logged out");
            router.replace("/login");
        },
        onError: (error) => {
            toast.error(authErrorMessage(error));
        },
    });
}