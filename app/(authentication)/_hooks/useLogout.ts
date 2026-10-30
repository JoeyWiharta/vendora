"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/query/queryClient";
import { useAuthStore } from "@/store/authStore";
import { logoutUser } from "../_services/authService";

export const useLogout = () => {
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);

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
            setUser(null);
            queryClient.clear();
            router.replace("/login");
        },
    });
};