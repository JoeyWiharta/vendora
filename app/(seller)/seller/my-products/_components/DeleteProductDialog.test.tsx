import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("next/image", () => ({
    __esModule: true,
    // eslint-disable-next-line @next/next/no-img-element
    default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));

import DeleteProductDialog from "./DeleteProductDialog";
import type { Product } from "../_types/productTypes";

const makeProduct = (id: string, name: string) =>
    ({
        id,
        productName: name,
        productPrice: 10000,
        productCategory: "Other",
        productImage: "",
    }) as unknown as Product;

const handleOpenChange = jest.fn();
const handleConfirm = jest.fn();

const setup = (products: Product[], overrides: { open?: boolean; isPending?: boolean } = {}) => {
    render(
        <DeleteProductDialog
            products={products}
            open={overrides.open ?? true}
            isPending={overrides.isPending ?? false}
            handleOpenChange={handleOpenChange}
            handleConfirm={handleConfirm}
        />,
    );
    return userEvent.setup();
};

beforeEach(() => jest.clearAllMocks());

describe("DeleteProductDialog", () => {
    it("satu produk: judul dan tombol bentuk tunggal", () => {
        setup([makeProduct("1", "Keyboard")]);

        expect(screen.getByText("Delete this product?")).toBeInTheDocument();
        expect(screen.getByText("Keyboard")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /delete product/i })).toBeInTheDocument();
    });

    it("banyak produk: jumlah di judul dan semua produk ditampilkan", () => {
        setup([makeProduct("1", "Keyboard"), makeProduct("2", "Mouse"), makeProduct("3", "Monitor")]);

        expect(screen.getByText("Delete 3 products?")).toBeInTheDocument();
        expect(screen.getByText("Keyboard")).toBeInTheDocument();
        expect(screen.getByText("Mouse")).toBeInTheDocument();
        expect(screen.getByText("Monitor")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /delete 3 products/i })).toBeInTheDocument();
    });

    it("tombol hapus memanggil handleConfirm", async () => {
        const user = setup([makeProduct("1", "Keyboard")]);
        await user.click(screen.getByRole("button", { name: /delete product/i }));
        expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it("cancel menutup dialog tanpa menghapus", async () => {
        const user = setup([makeProduct("1", "Keyboard")]);
        await user.click(screen.getByRole("button", { name: /cancel/i }));

        expect(handleOpenChange).toHaveBeenCalledWith(false);
        expect(handleConfirm).not.toHaveBeenCalled();
    });

    it("saat pending: tombol disabled dan teks Deleting...", () => {
        setup([makeProduct("1", "Keyboard")], { isPending: true });

        expect(screen.getByRole("button", { name: /deleting/i })).toBeDisabled();
        expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });

    it("tanpa produk: tombol hapus disabled", () => {
        setup([]);
        expect(screen.getByRole("button", { name: /delete 0 products/i })).toBeDisabled();
    });

    it("open false: dialog tidak dirender", () => {
        setup([makeProduct("1", "Keyboard")], { open: false });
        expect(screen.queryByText("Delete this product?")).not.toBeInTheDocument();
    });
});