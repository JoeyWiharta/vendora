import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { getSellerProducts } from "../_services/productService";

export const SELLER_PRODUCTS_QUERY_KEY = ["seller-products"] as const;


export const useSellerProducts = () => {
    const sellerId = useAuthStore((s) => s.user?.uid);

    return useQuery({
        queryKey: [...SELLER_PRODUCTS_QUERY_KEY, sellerId],
        queryFn: () => getSellerProducts({ sellerId: sellerId! }),
        enabled: !!sellerId,
    });
};