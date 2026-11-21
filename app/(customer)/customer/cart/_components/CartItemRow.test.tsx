import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { formatRupiah } from "@/lib/formatter";
import type { CartItem } from "../../_shared/_types/cartTypes";
import CartItemRow from "./CartItemRow";

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

const mockUpdate = { mutate: jest.fn(), isPending: false };
const mockRemove = { mutate: jest.fn(), isPending: false };
jest.mock("../_hooks/useCart", () => ({
    useUpdateCartQuantity: () => mockUpdate,
    useRemoveCartItem: () => mockRemove,
}));

const rp = (n: number) => formatRupiah(n).replace(/\s/g, " ");

const product = {
    id: "p1",
    productName: "Keyboard",
    productImage: "kb.jpg",
    productPrice: 750000,
    productStock: 10,
};

const makeItem = (over: Record<string, unknown> = {}) =>
    ({ productId: "p1", quantity: 2, product, ...over }) as unknown as CartItem;

const onToggle = jest.fn();
const renderRow = (item: CartItem, selected = true) =>
    render(<CartItemRow item={item} selected={selected} onToggle={onToggle} />);

beforeEach(() => {
    jest.clearAllMocks();
    mockUpdate.isPending = false;
    mockRemove.isPending = false;
});

describe("CartItemRow - tampilan", () => {
    it("menampilkan nama, harga satuan, dan total per baris", () => {
        renderRow(makeItem());

        expect(screen.getByRole("link", { name: "Keyboard" })).toBeInTheDocument();
        expect(screen.getByText(`${rp(750000)} each`)).toBeInTheDocument();
        expect(screen.getByText(rp(1500000))).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("link produk mengarah ke halaman detail yang benar", () => {
        renderRow(makeItem());

        expect(screen.getByRole("link", { name: "Keyboard" })).toHaveAttribute("href", "/customer/home/p1");
        expect(screen.getByRole("link", { name: "View Keyboard" })).toHaveAttribute("href", "/customer/home/p1");
    });

    it("memakai gambar produk, dan gambar default kalau kosong", () => {
        const { unmount } = renderRow(makeItem());
        expect(screen.getByAltText("Keyboard")).toHaveAttribute("src", "kb.jpg");
        unmount();

        renderRow(makeItem({ product: { ...product, productImage: "" } }));
        expect(screen.getByAltText("Keyboard")).toHaveAttribute("src", "/default.png");
    });

    it("produk yang sudah hilang: tanpa link, pesan khusus, tombol + disabled", () => {
        renderRow(makeItem({ product: null }));

        expect(screen.getByText("Product no longer available")).toBeInTheDocument();
        expect(screen.getByText("Remove this item to continue")).toBeInTheDocument();
        expect(screen.getByAltText("Unavailable product")).toHaveAttribute("src", "/default.png");
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
        expect(screen.queryByText(/each/)).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
        expect(screen.getByRole("checkbox", { name: "Select item" })).toBeInTheDocument();
    });

    it("stok tidak cukup: tampil peringatan dan baris ditandai", () => {
        const { container } = renderRow(makeItem({ quantity: 5, product: { ...product, productStock: 3 } }));

        expect(screen.getByText("Insufficient stock (only 3 left)")).toBeInTheDocument();
        expect(container.firstChild).toHaveClass("border-destructive");
    });

    it("baris terpilih diberi highlight", () => {
        const { container } = renderRow(makeItem(), true);
        expect(container.firstChild).toHaveClass("border-primary/50");
    });
});

describe("CartItemRow - quantity & hapus", () => {
    it("tombol - mengurangi quantity", async () => {
        renderRow(makeItem());
        await userEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
        expect(mockUpdate.mutate).toHaveBeenCalledWith({ productId: "p1", quantity: 1 });
    });

    it("tombol + menambah quantity", async () => {
        renderRow(makeItem());
        await userEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
        expect(mockUpdate.mutate).toHaveBeenCalledWith({ productId: "p1", quantity: 3 });
    });

    it("tombol + disabled kalau quantity sudah sama dengan stok", () => {
        renderRow(makeItem({ quantity: 10 }));
        expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
    });

    it("tombol hapus memanggil remove dengan productId", async () => {
        renderRow(makeItem());
        await userEvent.click(screen.getByRole("button", { name: "Remove item" }));
        expect(mockRemove.mutate).toHaveBeenCalledWith("p1");
    });

    it.each([
        ["update", () => (mockUpdate.isPending = true)],
        ["remove", () => (mockRemove.isPending = true)],
    ])("semua tombol disabled saat %s sedang berjalan", (_name, setPending) => {
        setPending();
        renderRow(makeItem());

        expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Remove item" })).toBeDisabled();
    });
});

describe("CartItemRow - checkbox", () => {
    it("mencerminkan status terpilih", () => {
        const { unmount } = renderRow(makeItem(), true);
        expect(screen.getByRole("checkbox", { name: "Select Keyboard" })).toBeChecked();
        unmount();

        renderRow(makeItem(), false);
        expect(screen.getByRole("checkbox", { name: "Select Keyboard" })).not.toBeChecked();
    });

    it("klik memanggil onToggle", async () => {
        renderRow(makeItem());
        await userEvent.click(screen.getByRole("checkbox", { name: "Select Keyboard" }));
        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("item bermasalah tidak bisa dipilih", async () => {
        renderRow(makeItem({ quantity: 5, product: { ...product, productStock: 3 } }), false);
        await userEvent.click(screen.getByRole("checkbox", { name: "Select Keyboard" }));
        expect(onToggle).not.toHaveBeenCalled();
    });
});