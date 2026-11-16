import type { CloudinaryUploadResult } from "../_types/productTypes";

export const uploadImageToCloudinary = async (file: File): Promise<CloudinaryUploadResult> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) { throw new Error("Cloudinary configuration is missing") }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to upload image");
    }

    const data: CloudinaryUploadResult = await response.json();

    return {
        secure_url: data.secure_url,
        public_id: data.public_id,
    };
};