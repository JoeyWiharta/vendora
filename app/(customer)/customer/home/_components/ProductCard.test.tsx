import { render, screen } from "@testing-library/react";
import { formatRupiah } from "@/lib/formatter";
import type { HomeProductTypes } from "../_types/homeProductTypes";
import ProductCard from "./ProductCard";

jest.mock("next/image", () => ({
    __esModule: true,
    // eslint-disable-next-line @next/next/no-img-element
    default: ({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) => (
        <img src={src} alt={alt} data-priority={String(!!priority)} />
    ),
}));
jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children, ...rest }: { href: string; children?: React.ReactNode }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

const rp = (n: number) => formatRupiah(n).replace(/\s/g, " ");

const makeProduct = (over: Record<string, unknown> = {}) =>
    ({
        id: "p1",
        productName: "RGB Keyboard",
        productCategory: "Electronics",
        productImage: "kb.jpg",
        productPrice: 750000,
        productStock: 50,
        ...over,
    }) as unknown as HomeProductTypes;

describe("ProductCard", () => {
    it("menampilkan nama, kategori, dan harga", () => {
        render(<ProductCard product={makeProduct()} />);

        expect(screen.getByText("RGB Keyboard")).toBeInTheDocument();
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText(rp(750000))).toBeInTheDocument();
    });

    it("seluruh kartu adalah link ke halaman detail", () => {
        render(<ProductCard product={makeProduct()} />);
        expect(screen.getByRole("link")).toHaveAttribute("href", "/customer/home/p1");
    });

    it("menampilkan gambar produk", () => {
        render(<ProductCard product={makeProduct()} />);
        expect(screen.getByAltText("RGB Keyboard")).toHaveAttribute("src", "kb.jpg");
    });

    it("tanpa gambar: tidak ada <img>", () => {
        render(<ProductCard product={makeProduct({ productImage: "" })} />);
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("priority default false dan diteruskan ke Image", () => {
        const { unmount } = render(<ProductCard product={makeProduct()} />);
        expect(screen.getByAltText("RGB Keyboard")).toHaveAttribute("data-priority", "false");
        unmount();

        render(<ProductCard product={makeProduct()} priority />);
        expect(screen.getByAltText("RGB Keyboard")).toHaveAttribute("data-priority", "true");
    });

    describe("badge stok", () => {
        it("stok 0: Out of stock (bukan 'Only 0 left')", () => {
            render(<ProductCard product={makeProduct({ productStock: 0 })} />);

            expect(screen.getByText("Out of stock")).toBeInTheDocument();
            expect(screen.queryByText(/Only/)).not.toBeInTheDocument();
        });

        it("stok 1-10: Only N left", () => {
            render(<ProductCard product={makeProduct({ productStock: 5 })} />);
            expect(screen.getByText("Only 5 left")).toBeInTheDocument();
        });

        it("stok tepat 10 (batas): masih Only 10 left", () => {
            render(<ProductCard product={makeProduct({ productStock: 10 })} />);
            expect(screen.getByText("Only 10 left")).toBeInTheDocument();
        });

        it("stok 11: tidak ada badge stok", () => {
            render(<ProductCard product={makeProduct({ productStock: 11 })} />);

            expect(screen.queryByText(/Only/)).not.toBeInTheDocument();
            expect(screen.queryByText("Out of stock")).not.toBeInTheDocument();
        });
    });
});