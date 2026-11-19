import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { getMyOrders } from "../_services/orderService";

export const useOrders = () => {
    const uid = useAuthStore((s) => s.user?.uid);
    return useQuery({
        queryKey: ["customer-orders", uid],
        queryFn: () => getMyOrders(uid!),
        enabled: !!uid,
    });
};