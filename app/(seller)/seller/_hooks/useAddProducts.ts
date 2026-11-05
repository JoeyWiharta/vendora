"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { uploadImageToCloudinary } from "../_services/uploadImageService";
import { addSellerProduct } from "../_services/productService";
import type { AddProductForm } from "../_types/productTypes";
import { SELLER_PRODUCTS_QUERY_KEY } from "./useSellerProducts";
import { DEFAULT_PRODUCT_IMAGE } from "@/constants/ProductDefaultImage";

export const useAddProduct = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const sellerId = useAuthStore((s) => s.user?.uid);

    return useMutation({
        mutationFn: (values: AddProductForm) => {
            const promise = (async () => {
                if (!sellerId) throw new Error("Not authenticated");

                const productImage = values.image ? await uploadImageToCloudinary(values.image) : DEFAULT_PRODUCT_IMAGE;
                const { image, ...data } = values;

                return addSellerProduct({
                    ...data,
                    productImage,
                    sellerId,
                });
            })();

            toast.promise(promise, {
                loading: "Adding product...",
                success: "Product added successfully",
                error: (error) =>
                    error instanceof Error ? error.message : "Failed to add product",
            });

            return promise;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: SELLER_PRODUCTS_QUERY_KEY,
            });

            router.push("/seller/my-products");
        },
    });
};