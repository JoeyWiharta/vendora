import { useQuery } from "@tanstack/react-query";
import { getProductById } from "../_services/customerProductService";

export const useProductDetail = (id: string) =>
    useQuery({
        queryKey: ["customer-product", id],
        queryFn: () => getProductById(id),
    });