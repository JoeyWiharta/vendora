"use server";

import cloudinary from "@/lib/cloudinary";

export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
    if (!publicId || typeof publicId !== "string") {
        throw new Error("Public ID is required");
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error("Failed to delete image");
    }
};