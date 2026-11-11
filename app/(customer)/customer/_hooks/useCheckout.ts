import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // samakan dengan project
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import type { CartItem } from "../_types/cartTypes";
import { checkout } from "../_services/orderService";
import { CART_QUERY_KEY } from "./useCart";
import { CUSTOMER_PRODUCTS_QUERY_KEY } from "./useCustomerProducts";

export const useCheckout = () => {
    const uid = useAuthStore((s) => s.user?.uid);
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (items: CartItem[]) => checkout(uid!, items),
        onSuccess: () => {
            toast.success("Purchase successful");
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: CUSTOMER_PRODUCTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ["customer-product"] });
            queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
            router.push("/customer/orders");
        },
        onError: (e: Error) => {
            toast.error(e.message || "Purchase failed");
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY }); // refresh supaya highlight stok terbaru
        },
    });
};