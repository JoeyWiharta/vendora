"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/query/queryClient";
import { deleteSellerProduct } from "../_services/productService";
import { deleteImageFromCloudinary } from "../_services/deleteImageService";
import type { Product } from "../_types/productTypes";
import { SELLER_PRODUCTS_QUERY_KEY } from "./useSellerProducts";

export const useDeleteProducts = () => {
    return useMutation({
        mutationFn: async (products: Product[]) => {
            const results = await Promise.allSettled(
                products.map(async (product) => {
                    await deleteSellerProduct(product.id);
                    if (product.productImagePublicId) {
                        try {
                            await deleteImageFromCloudinary(product.productImagePublicId);
                        } catch (err) {
                            console.error("Cloudinary cleanup failed:", product.id, err);
                        }
                    }
                }),
            );

            const failed = results.filter((r) => r.status === "rejected").length;
            if (failed > 0) {
                throw new Error(failed === products.length ? "Failed to delete products" : `${products.length - failed} deleted, ${failed} failed`);
            }
            return products.length;
        },

        onSuccess: (count) => { toast.success(count === 1 ? "Product deleted successfully" : `${count} products deleted successfully`); },

        onError: (error) => {
            console.error("Delete products error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete products");
        },

        onSettled: () => { queryClient.invalidateQueries({ queryKey: SELLER_PRODUCTS_QUERY_KEY }); },
    });
};