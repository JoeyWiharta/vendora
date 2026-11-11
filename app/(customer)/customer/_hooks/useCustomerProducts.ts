import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAvailableProducts } from "../_services/customerProductService";
import { shuffle } from "../_utils/shuffle";

export const CUSTOMER_PRODUCTS_QUERY_KEY = ["customer-products"] as const;
const RECOMMENDED_COUNT = 10;

export const useCustomerProducts = () => {
    const query = useQuery({
        queryKey: CUSTOMER_PRODUCTS_QUERY_KEY,
        queryFn: getAvailableProducts,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const shuffled = useMemo(() => shuffle(query.data ?? []), [query.data]);
    const recommended = useMemo(() => shuffled.slice(0, RECOMMENDED_COUNT), [shuffled]);

    return { ...query, shuffled, recommended };
};