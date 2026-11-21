import { render, screen } from "@testing-library/react";
import { formatDate, formatRupiah } from "@/lib/formatter";
import type { Order } from "../../_shared/_types/orderTypes";
import OrderCard from "./OrderCard";

jest.mock("next/image", () => ({
    __esModule: true,
    // eslint-disable-next-line @next/next/no-img-element
    default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children, ...rest }: { href: string; children?: React.ReactNode }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));
jest.mock("@/constants/ProductDefaultImage", () => ({ DEFAULT_PRODUCT_IMAGE: "/default.png" }));

const rp = (n: number) => formatRupiah(n).replace(/\s/g, " ");
const date = new Date("2026-11-21T10:00:00Z");

const makeOrder = (over: Record<string, unknown> = {}) =>
    ({
        id: "abcdef1234567890",
        userId: "u1",
        totalPrice: 3950000,
        createdAt: { toDate: () => date },
        items: [
            { productId: "k1", name: "Keyboard", imageUrl: "kb.jpg", price: 750000, quantity: 2, sellerId: "s1" },
            { productId: "c1", name: "Chair", imageUrl: "", price: 2450000, quantity: 1, sellerId: "s2" },
        ],
        ...over,
    }) as unknown as Order;

describe("OrderCard", () => {
    it("menampilkan ID order yang dipendekkan (tooltip berisi ID penuh)", () => {
        render(<OrderCard order={makeOrder()} />);

        const id = screen.getByText("#ABCDEF12");
        expect(id).toBeInTheDocument();
        expect(id).toHaveAttribute("title", "abcdef1234567890");
    });

    it("menampilkan tanggal order", () => {
        render(<OrderCard order={makeOrder()} />);
        expect(screen.getByText(formatDate(date))).toBeInTheDocument();
    });

    it("menampilkan '-' kalau createdAt belum ada", () => {
        render(<OrderCard order={makeOrder({ createdAt: null })} />);
        expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("menampilkan tiap item: nama, qty x harga, dan subtotal", () => {
        render(<OrderCard order={makeOrder()} />);

        expect(screen.getByRole("link", { name: "Keyboard" })).toBeInTheDocument();
        expect(screen.getByText(`2 x ${rp(750000)}`)).toBeInTheDocument();
        expect(screen.getByText(rp(1500000))).toBeInTheDocument();

        expect(screen.getByRole("link", { name: "Chair" })).toBeInTheDocument();
        expect(screen.getByText(`1 x ${rp(2450000)}`)).toBeInTheDocument();
        expect(screen.getByText(rp(2450000))).toBeInTheDocument();
    });

    it("link produk mengarah ke halaman detail yang benar", () => {
        render(<OrderCard order={makeOrder()} />);

        expect(screen.getByRole("link", { name: "Keyboard" })).toHaveAttribute("href", "/customer/home/k1");
        expect(screen.getByRole("link", { name: "View Keyboard" })).toHaveAttribute("href", "/customer/home/k1");
    });

    it("memakai gambar default kalau imageUrl kosong", () => {
        render(<OrderCard order={makeOrder()} />);

        expect(screen.getByAltText("Keyboard")).toHaveAttribute("src", "kb.jpg");
        expect(screen.getByAltText("Chair")).toHaveAttribute("src", "/default.png");
    });

    it("footer menampilkan jumlah produk, total pcs, dan total harga", () => {
        render(<OrderCard order={makeOrder()} />);

        expect(screen.getByText("2 product(s) · 3 pcs")).toBeInTheDocument();
        expect(screen.getByText(rp(3950000))).toBeInTheDocument();
    });
});