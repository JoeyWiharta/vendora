"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { queryClient } from "@/query/queryClient";
import { uploadImageToCloudinary } from "../_services/uploadImageService";
import { deleteImageFromCloudinary } from "../_services/deleteImageService";
import { updateSellerProduct } from "../_services/productService";
import type { UpdateProductPayload } from "../_types/productTypes";
import { SELLER_PRODUCTS_QUERY_KEY } from "./useSellerProducts";

interface UpdateProductInput {
    id: string;
    data: UpdateProductPayload & {
        image?: File;
    };
}

export const useUpdateProduct = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: ({ id, data }: UpdateProductInput) => {
            const promise = (async () => {
                const { image, ...fields } = data;
                const uploadResult = image ? await uploadImageToCloudinary(image) : null;
                await updateSellerProduct(id, {
                    ...fields,
                    productImage: uploadResult?.secure_url ?? fields.productImage,
                    productImagePublicId: uploadResult?.public_id ?? fields.productImagePublicId,
                });

                if (uploadResult && fields.productImagePublicId) {
                    await deleteImageFromCloudinary(fields.productImagePublicId);
                }
            })();

            toast.promise(promise, {
                loading: "Updating product...",
                success: "Product updated successfully",
                error: (error) => error instanceof Error ? error.message : "Failed to update product",
            });

            return promise;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SELLER_PRODUCTS_QUERY_KEY });
            router.push("/seller/my-products");
        },
    });
};