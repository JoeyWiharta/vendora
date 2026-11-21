
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { formatRupiah } from "@/lib/formatter";
import type { HomeProductTypes } from "../../_types/homeProductTypes";
import PurchasePanel from "./PurchasePanel";

const mockCart = {
    inCart: 0 as number | undefined,
    isCartLoading: false,
    isPending: false,
    addToCart: jest.fn(),
};

jest.mock("../../../cart/_hooks/useCart", () => ({
    useCartItemQuantity: () => ({
        data: mockCart.inCart,
        isLoading: mockCart.isCartLoading,
    }),
    useAddToCart: () => ({
        mutate: mockCart.addToCart,
        isPending: mockCart.isPending,
    }),
}));

const rp = (n: number) => formatRupiah(n).replace(/\s/g, " ");

const makeProduct = (over: Record<string, unknown> = {}) =>
    ({
        id: "p1",
        productPrice: 750000,
        productStock: 50,
        ...over,
    }) as unknown as HomeProductTypes;

const quantityInput = () => screen.getByLabelText("Quantity");
const plus = () =>
    screen.getByRole("button", { name: "Increase quantity" });
const minus = () =>
    screen.getByRole("button", { name: "Decrease quantity" });

beforeEach(() => {
    jest.clearAllMocks();

    Object.assign(mockCart, {
        inCart: 0,
        isCartLoading: false,
        isPending: false,
    });
});

describe("PurchasePanel - tampilan", () => {
    it("data cart undefined: menggunakan fallback quantity 0", () => {
        mockCart.inCart = undefined;

        render(<PurchasePanel product={makeProduct()} />);

        expect(quantityInput()).toHaveValue(1);
        expect(
            screen.queryByText(/already in your cart/),
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Add to cart" }),
        ).toBeEnabled();
    });
    it("stok habis: menampilkan pesan tanpa form", () => {
        render(
            <PurchasePanel product={makeProduct({ productStock: 0 })} />,
        );

        expect(
            screen.getByText("This product is out of stock"),
        ).toBeInTheDocument();

        expect(
            screen.queryByLabelText("Quantity"),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole("button", { name: /Add to cart/ }),
        ).not.toBeInTheDocument();
    });

    it("default: quantity 1 dan subtotal satu item", () => {
        render(<PurchasePanel product={makeProduct()} />);

        expect(quantityInput()).toHaveValue(1);
        expect(screen.getByText(rp(750000))).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Add to cart" }),
        ).toBeEnabled();
    });

    it("menampilkan jumlah produk yang sudah ada di cart", () => {
        mockCart.inCart = 3;

        render(<PurchasePanel product={makeProduct()} />);

        expect(
            screen.getByText("3 already in your cart"),
        ).toBeInTheDocument();
    });

    it("tidak menampilkan informasi cart jika belum ada item", () => {
        render(<PurchasePanel product={makeProduct()} />);

        expect(
            screen.queryByText(/already in your cart/),
        ).not.toBeInTheDocument();
    });
});

describe("PurchasePanel - quantity", () => {
    it("tombol tambah meningkatkan quantity dan subtotal", async () => {
        const user = userEvent.setup();

        render(<PurchasePanel product={makeProduct()} />);

        await user.click(plus());

        expect(quantityInput()).toHaveValue(2);
        expect(screen.getByText(rp(1500000))).toBeInTheDocument();
    });

    it("tombol kurang menurunkan quantity", async () => {
        const user = userEvent.setup();

        render(<PurchasePanel product={makeProduct()} />);

        await user.click(plus());
        await user.click(plus());
        await user.click(minus());

        expect(quantityInput()).toHaveValue(2);
    });

    it("quantity tidak bisa kurang dari nol", async () => {
        const user = userEvent.setup();

        render(<PurchasePanel product={makeProduct()} />);

        await user.click(minus());
        await user.click(minus());

        expect(quantityInput()).toHaveValue(0);
        expect(
            await screen.findByText("Quantity cannot be zero"),
        ).toBeInTheDocument();
        expect(screen.getByText(rp(0))).toBeInTheDocument();
    });

    it("quantity bisa diubah melalui input langsung", async () => {
        const user = userEvent.setup();

        render(<PurchasePanel product={makeProduct()} />);

        await user.clear(quantityInput());
        await user.type(quantityInput(), "4");

        expect(quantityInput()).toHaveValue(4);
        expect(screen.getByText(rp(3000000))).toBeInTheDocument();
    });

    it("input quantity kosong menghasilkan subtotal nol", async () => {
        const user = userEvent.setup();

        render(<PurchasePanel product={makeProduct()} />);

        await user.clear(quantityInput());

        expect(screen.getByText(rp(0))).toBeInTheDocument();
    });

    it("quantity pecahan ditolak", async () => {
        const user = userEvent.setup();

        render(<PurchasePanel product={makeProduct()} />);

        await user.clear(quantityInput());
        await user.type(quantityInput(), "1.5");

        await user.click(
            screen.getByRole("button", { name: "Add to cart" }),
        );

        expect(
            await screen.findByText("Quantity must be a whole number"),
        ).toBeInTheDocument();

        expect(mockCart.addToCart).not.toHaveBeenCalled();
    });
});

describe("PurchasePanel - validasi stok", () => {
    it("quantity melebihi sisa stok menampilkan error", async () => {
        const user = userEvent.setup();

        mockCart.inCart = 3;

        render(
            <PurchasePanel
                product={makeProduct({ productStock: 5 })}
            />,
        );

        await user.click(plus());
        await user.click(plus());

        expect(
            await screen.findByText(
                "You already have 3 in your cart. Only 2 more available",
            ),
        ).toBeInTheDocument();
    });

    it("quantity melebihi stok tidak dikirim ke addToCart", async () => {
        const user = userEvent.setup();

        mockCart.inCart = 3;

        render(
            <PurchasePanel
                product={makeProduct({ productStock: 5 })}
            />,
        );

        await user.click(plus());
        await user.click(plus());

        await user.click(
            screen.getByRole("button", { name: "Add to cart" }),
        );

        expect(mockCart.addToCart).not.toHaveBeenCalled();
    });

    it("menampilkan error stok jika cart masih kosong", async () => {
        const user = userEvent.setup();

        render(
            <PurchasePanel
                product={makeProduct({ productStock: 1 })}
            />,
        );

        await user.click(plus());

        expect(
            await screen.findByText(
                "Insufficient stock. Only 1 available",
            ),
        ).toBeInTheDocument();
    });

    it("stok sudah maksimal di cart: tombol disabled", () => {
        mockCart.inCart = 5;

        render(
            <PurchasePanel
                product={makeProduct({ productStock: 5 })}
            />,
        );

        expect(
            screen.getByRole("button", { name: "Max stock in cart" }),
        ).toBeDisabled();
    });

    it("stok di cart melebihi stok produk: tombol tetap disabled", () => {
        mockCart.inCart = 6;

        render(
            <PurchasePanel
                product={makeProduct({ productStock: 5 })}
            />,
        );

        expect(
            screen.getByRole("button", { name: "Max stock in cart" }),
        ).toBeDisabled();
    });
});

describe("PurchasePanel - add to cart", () => {
    it("submit mengirim quantity ke addToCart", async () => {
        const user = userEvent.setup();

        render(<PurchasePanel product={makeProduct()} />);

        await user.click(plus());

        await user.click(
            screen.getByRole("button", { name: "Add to cart" }),
        );

        await waitFor(() => {
            expect(mockCart.addToCart).toHaveBeenCalledWith(2);
        });
    });

    it("quantity nol tidak dikirim ke addToCart", async () => {
        const user = userEvent.setup();

        render(<PurchasePanel product={makeProduct()} />);

        await user.click(minus());

        await user.click(
            screen.getByRole("button", { name: "Add to cart" }),
        );

        expect(mockCart.addToCart).not.toHaveBeenCalled();
    });

    it("saat pending: tombol menampilkan Adding dan semua kontrol disabled", () => {
        mockCart.isPending = true;

        render(<PurchasePanel product={makeProduct()} />);

        expect(
            screen.getByRole("button", { name: /Adding/ }),
        ).toBeDisabled();

        expect(plus()).toBeDisabled();
        expect(minus()).toBeDisabled();
        expect(quantityInput()).toBeDisabled();
    });

    it("saat cart loading: tombol add to cart disabled", () => {
        mockCart.isCartLoading = true;

        render(<PurchasePanel product={makeProduct()} />);

        expect(
            screen.getByRole("button", { name: "Add to cart" }),
        ).toBeDisabled();
    });
});
