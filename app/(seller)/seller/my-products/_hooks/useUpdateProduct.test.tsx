import type { ReactNode } from "react";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("sonner", () => ({ toast: { promise: jest.fn() } }));
jest.mock("@/query/queryClient", () => ({ queryClient: { invalidateQueries: jest.fn() } }));
jest.mock("../_services/uploadImageService", () => ({ uploadImageToCloudinary: jest.fn() }));
jest.mock("../_services/deleteImageService", () => ({ deleteImageFromCloudinary: jest.fn() }));
jest.mock("../_services/productService", () => ({ updateSellerProduct: jest.fn() }));

import { toast } from "sonner";
import { queryClient } from "@/query/queryClient";
import { uploadImageToCloudinary } from "../_services/uploadImageService";
import { deleteImageFromCloudinary } from "../_services/deleteImageService";
import { updateSellerProduct } from "../_services/productService";
import { SELLER_PRODUCTS_QUERY_KEY } from "./useSellerProducts";
import { useUpdateProduct } from "./useUpdateProduct";

const mockedUpload = jest.mocked(uploadImageToCloudinary);
const mockedDeleteImage = jest.mocked(deleteImageFromCloudinary);
const mockedUpdate = jest.mocked(updateSellerProduct);
const mockedToastPromise = jest.mocked(toast.promise);
const mockedInvalidate = jest.mocked(queryClient.invalidateQueries);

const fields = {
    productName: "Keyboard v2",
    productCategory: "Electronics",
    description: "Updated",
    productPrice: 200000,
    productStock: 3,
    productImage: "https://img/old.png",
    productImagePublicId: "pub-old" as string | null,
};

const createWrapper = () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    };
};

const run = async (data: Parameters<ReturnType<typeof useUpdateProduct>["mutateAsync"]>[0]["data"]) => {
    const { result } = renderHook(() => useUpdateProduct(), { wrapper: createWrapper() });
    await act(async () => {
        await result.current.mutateAsync({ id: "p1", data }).catch(() => { });
    });
    return result;
};

beforeEach(() => {
    jest.clearAllMocks();
    mockedUpdate.mockResolvedValue(undefined);
    mockedDeleteImage.mockResolvedValue(undefined);
});

describe("useUpdateProduct", () => {
    it("tanpa gambar baru: update dengan gambar lama, tanpa upload dan tanpa hapus gambar", async () => {
        await run(fields);

        expect(mockedUpload).not.toHaveBeenCalled();
        expect(mockedUpdate).toHaveBeenCalledWith("p1", fields);
        expect(mockedDeleteImage).not.toHaveBeenCalled();
    });

    it("dengan gambar baru: upload, update dengan url baru, lalu hapus gambar lama", async () => {
        const image = new File(["x"], "new.png", { type: "image/png" });
        mockedUpload.mockResolvedValue({ secure_url: "https://img/new.png", public_id: "pub-new" });

        await run({ ...fields, image });

        expect(mockedUpload).toHaveBeenCalledWith(image);
        expect(mockedUpdate).toHaveBeenCalledWith("p1", {
            ...fields,
            productImage: "https://img/new.png",
            productImagePublicId: "pub-new",
        });
        expect(mockedUpdate.mock.calls[0][1]).not.toHaveProperty("image");
        expect(mockedDeleteImage).toHaveBeenCalledWith("pub-old");
    });

    it("gambar baru tapi produk lama tanpa public id (default image): tidak ada yang dihapus", async () => {
        const image = new File(["x"], "new.png", { type: "image/png" });
        mockedUpload.mockResolvedValue({ secure_url: "https://img/new.png", public_id: "pub-new" });

        await run({ ...fields, productImagePublicId: null, image });

        expect(mockedDeleteImage).not.toHaveBeenCalled();
    });

    it("sukses: list di-invalidate dan redirect", async () => {
        await run(fields);

        expect(mockedInvalidate).toHaveBeenCalledWith({ queryKey: SELLER_PRODUCTS_QUERY_KEY });
        expect(mockPush).toHaveBeenCalledWith("/seller/my-products");
    });

    it("gagal update: tidak redirect dan tidak menghapus gambar lama", async () => {
        const image = new File(["x"], "new.png", { type: "image/png" });
        mockedUpload.mockResolvedValue({ secure_url: "u", public_id: "p" });
        mockedUpdate.mockRejectedValue(new Error("fail"));

        await run({ ...fields, image });

        expect(mockedDeleteImage).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
        expect(mockedInvalidate).not.toHaveBeenCalled();
    });

    it("toast loading, sukses, dan pesan error", async () => {
        await run(fields);

        const options = mockedToastPromise.mock.calls[0][1] as {
            loading: string;
            success: string;
            error: (e: unknown) => string;
        };
        expect(options.loading).toBe("Updating product...");
        expect(options.success).toBe("Product updated successfully");
        expect(options.error(new Error("Boom"))).toBe("Boom");
        expect(options.error(42)).toBe("Failed to update product");
    });
});