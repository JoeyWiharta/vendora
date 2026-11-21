import { render, screen } from "@testing-library/react";
import { formatNumber, formatRupiah } from "@/lib/formatter";
import type { HomeProductTypes } from "../../_types/homeProductTypes";
import ProductOverview from "./ProductOverview";

jest.mock("next/image", () => ({
    __esModule: true,
    // eslint-disable-next-line @next/next/no-img-element
    default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
jest.mock("@/constants/ProductDefaultImage", () => ({ DEFAULT_PRODUCT_IMAGE: "/default.png" }));

const rp = (n: number) => formatRupiah(n).replace(/\s/g, " ");

const makeProduct = (over: Record<string, unknown> = {}) =>
    ({
        id: "p1",
        productName: "RGB Keyboard",
        productImage: "kb.jpg",
        productCategory: "Electronics",
        productPrice: 750000,
        productStock: 50,
        description: "Hot-swappable switches",
        ...over,
    }) as unknown as HomeProductTypes;

const renderOverview = (over: Record<string, unknown> = {}) =>
    render(
        <ProductOverview product={makeProduct(over)}>
            <div data-testid="slot">panel</div>
        </ProductOverview>,
    );

describe("ProductOverview", () => {
    it("menampilkan nama, harga, kategori, dan deskripsi", () => {
        renderOverview();

        expect(screen.getByRole("heading", { level: 1, name: "RGB Keyboard" })).toBeInTheDocument();
        expect(screen.getByText(rp(750000))).toBeInTheDocument();
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Hot-swappable switches")).toBeInTheDocument();
    });

    it("deskripsi kosong: pesan default", () => {
        renderOverview({ description: "" });
        expect(screen.getByText("No description provided.")).toBeInTheDocument();
    });

    it("menampilkan gambar produk, atau gambar default kalau kosong", () => {
        const { unmount } = renderOverview();
        expect(screen.getByAltText("RGB Keyboard")).toHaveAttribute("src", "kb.jpg");
        unmount();

        renderOverview({ productImage: "" });
        expect(screen.getByAltText("RGB Keyboard")).toHaveAttribute("src", "/default.png");
    });

    it("merender children (slot PurchasePanel)", () => {
        renderOverview();
        expect(screen.getByTestId("slot")).toBeInTheDocument();
    });

    it("menampilkan keunggulan toko", () => {
        renderOverview();

        expect(screen.getByText("Fast delivery")).toBeInTheDocument();
        expect(screen.getByText("Secure payment")).toBeInTheDocument();
    });

    describe("badge stok", () => {
        it("stok 0: Out of stock", () => {
            renderOverview({ productStock: 0 });
            expect(screen.getByText("Out of stock")).toBeInTheDocument();
        });

        it("stok 1-10: Only N left", () => {
            renderOverview({ productStock: 7 });
            expect(screen.getByText(`Only ${formatNumber(7)} left`)).toBeInTheDocument();
        });

        it("stok tepat 10 (batas): masih Only 10 left", () => {
            renderOverview({ productStock: 10 });
            expect(screen.getByText(`Only ${formatNumber(10)} left`)).toBeInTheDocument();
        });

        it("stok banyak: In stock · N pcs", () => {
            renderOverview({ productStock: 50 });
            expect(screen.getByText(`In stock · ${formatNumber(50)} pcs`)).toBeInTheDocument();
        });
    });
});