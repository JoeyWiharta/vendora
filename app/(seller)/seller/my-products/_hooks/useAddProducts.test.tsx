import type { ReactNode } from "react";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("sonner", () => ({ toast: { promise: jest.fn() } }));
jest.mock("@/query/queryClient", () => ({ queryClient: { invalidateQueries: jest.fn() } }));
jest.mock("../_services/uploadImageService", () => ({ uploadImageToCloudinary: jest.fn() }));
jest.mock("../_services/productService", () => ({ addSellerProduct: jest.fn() }));

import { toast } from "sonner";
import { queryClient } from "@/query/queryClient";
import { DEFAULT_PRODUCT_IMAGE } from "@/constants/ProductDefaultImage";
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { uploadImageToCloudinary } from "../_services/uploadImageService";
import { addSellerProduct } from "../_services/productService";
import { SELLER_PRODUCTS_QUERY_KEY } from "./useSellerProducts";
import { useAddProduct } from "./useAddProducts";

const mockedUpload = jest.mocked(uploadImageToCloudinary);
const mockedAdd = jest.mocked(addSellerProduct);
const mockedToastPromise = jest.mocked(toast.promise);
const mockedInvalidate = jest.mocked(queryClient.invalidateQueries);

const values = {
    productName: "Keyboard",
    productCategory: "Electronics",
    description: "Mechanical",
    productPrice: 150000,
    productStock: 5,
};

const createWrapper = () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    };
};

const run = async (input: Parameters<ReturnType<typeof useAddProduct>["mutateAsync"]>[0]) => {
    const { result } = renderHook(() => useAddProduct(), { wrapper: createWrapper() });
    await act(async () => {
        await result.current.mutateAsync(input).catch(() => { });
    });
    return result;
};

beforeEach(() => {
    jest.clearAllMocks();
    mockedAdd.mockResolvedValue("new-id");
    useAuthStore.setState({ user: { uid: "seller-1", email: "s@mail.com", role: "seller" }, loading: false });
});

describe("useAddProduct", () => {
    it("tanpa gambar: memakai default image dan tidak upload", async () => {
        await run(values);

        expect(mockedUpload).not.toHaveBeenCalled();
        expect(mockedAdd).toHaveBeenCalledWith({
            ...values,
            productImage: DEFAULT_PRODUCT_IMAGE,
            productImagePublicId: null,
            sellerId: "seller-1",
        });
    });

    it("dengan gambar: upload lalu menyimpan url dan public id, tanpa field image", async () => {
        const image = new File(["x"], "a.png", { type: "image/png" });
        mockedUpload.mockResolvedValue({ secure_url: "https://img/1.png", public_id: "pub-1" });

        await run({ ...values, image });

        expect(mockedUpload).toHaveBeenCalledWith(image);
        expect(mockedAdd).toHaveBeenCalledWith({
            ...values,
            productImage: "https://img/1.png",
            productImagePublicId: "pub-1",
            sellerId: "seller-1",
        });
        expect(mockedAdd.mock.calls[0][0]).not.toHaveProperty("image");
    });

    it("sukses: list di-invalidate dan redirect ke daftar produk", async () => {
        await run(values);

        expect(mockedInvalidate).toHaveBeenCalledWith({ queryKey: SELLER_PRODUCTS_QUERY_KEY });
        expect(mockPush).toHaveBeenCalledWith("/seller/my-products");
    });

    it("belum login: gagal dan tidak menyimpan", async () => {
        useAuthStore.setState({ user: null, loading: false });

        const result = await run(values);

        expect(result.current.error).toEqual(new Error("Not authenticated"));
        expect(mockedAdd).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });

    it("gagal menyimpan: tidak redirect dan tidak invalidate", async () => {
        mockedAdd.mockRejectedValue(new Error("fail"));

        await run(values);

        expect(mockPush).not.toHaveBeenCalled();
        expect(mockedInvalidate).not.toHaveBeenCalled();
    });

    it("toast loading, sukses, dan pesan error", async () => {
        await run(values);

        const options = mockedToastPromise.mock.calls[0][1] as {
            loading: string;
            success: string;
            error: (e: unknown) => string;
        };
        expect(options.loading).toBe("Adding product...");
        expect(options.success).toBe("Product added successfully");
        expect(options.error(new Error("Upload failed"))).toBe("Upload failed");
        expect(options.error("bukan Error")).toBe("Failed to add product");
    });
});