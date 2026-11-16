
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Product } from "../_types/productTypes";

jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: { src: string; alt: string }) => (
        <img src={props.src} alt={props.alt} />
    ),
}));


jest.mock("@/components/ui/alert-dialog", () => {
    const React = require("react");

    let mockOnOpenChange: ((open: boolean) => void) | undefined;

    return {
        AlertDialog: ({
            children,
            open,
            onOpenChange,
        }: {
            children: React.ReactNode;
            open: boolean;
            onOpenChange: (open: boolean) => void;
        }) => {
            mockOnOpenChange = onOpenChange;

            if (!open) return null;

            return (
                <div>
                    <button
                        type="button"
                        data-testid="trigger-open-change"
                        onClick={() => onOpenChange(false)}
                    >
                        Trigger open change
                    </button>
                    {children}
                </div>
            );
        },
        AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
            <div>{children}</div>
        ),
        AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
            <h2>{children}</h2>
        ),
        AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
            <p>{children}</p>
        ),
        AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
            <div>{children}</div>
        ),
        AlertDialogCancel: ({
            children,
            ...props
        }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
            <button
                {...props}
                onClick={() => mockOnOpenChange?.(false)}
            >
                {children}
            </button>
        ),
        AlertDialogAction: ({
            children,
            ...props
        }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
            <button {...props}>{children}</button>
        ),
    };
});


import DeleteProductDialog from "./DeleteProductDialog";

const makeProduct = (
    id: string,
    name: string,
    image = "",
    category = "Other",
) =>
    ({
        id,
        productName: name,
        productPrice: 10000,
        productCategory: category,
        productImage: image,
    }) as unknown as Product;

const handleOpenChange = jest.fn();
const handleConfirm = jest.fn();

const setup = (
    products: Product[],
    overrides: { open?: boolean; isPending?: boolean } = {},
) => {
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
    it("satu produk menampilkan judul dan tombol bentuk tunggal", () => {
        setup([makeProduct("1", "Keyboard")]);

        expect(screen.getByText("Delete this product?")).toBeInTheDocument();
        expect(screen.getByText("Keyboard")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /delete product/i })).toBeInTheDocument();
    });

    it("produk tunggal menampilkan gambar jika tersedia", () => {
        setup([makeProduct("1", "Keyboard", "/keyboard.jpg")]);

        expect(screen.getByRole("img", { name: "Keyboard" })).toHaveAttribute(
            "src",
            "/keyboard.jpg",
        );
    });

    it("produk tanpa gambar menampilkan icon Package", () => {
        setup([makeProduct("1", "Keyboard")]);

        expect(document.querySelector(".lucide-package")).toBeInTheDocument();
    });

    it("banyak produk menampilkan jumlah di judul dan semua produk", () => {
        setup([
            makeProduct("1", "Keyboard"),
            makeProduct("2", "Mouse"),
            makeProduct("3", "Monitor"),
        ]);

        expect(screen.getByText("Delete 3 products?")).toBeInTheDocument();
        expect(screen.getByText("Keyboard")).toBeInTheDocument();
        expect(screen.getByText("Mouse")).toBeInTheDocument();
        expect(screen.getByText("Monitor")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /delete 3 products/i })).toBeInTheDocument();
    });

    it("banyak produk menampilkan gambar dan fallback sesuai kondisi masing-masing", () => {
        setup([
            makeProduct("1", "Keyboard", "/keyboard.jpg"),
            makeProduct("2", "Mouse"),
        ]);

        expect(screen.getByRole("img", { name: "Keyboard" })).toBeInTheDocument();
        expect(document.querySelector(".lucide-package")).toBeInTheDocument();
    });

    it("menampilkan kategori dan harga produk", () => {
        setup([
            makeProduct("1", "Keyboard", "", "Electronics"),
            makeProduct("2", "Mouse", "", "Accessories"),
        ]);

        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Accessories")).toBeInTheDocument();

        const prices = document.querySelectorAll("li p.text-xs");

        expect(prices).toHaveLength(2);
        expect(prices[0]).toHaveTextContent(/\d/);
        expect(prices[1]).toHaveTextContent(/\d/);
    });

    it("tombol hapus memanggil handleConfirm", async () => {
        const user = setup([makeProduct("1", "Keyboard")]);

        await user.click(screen.getByRole("button", { name: /delete product/i }));

        expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it("tombol hapus banyak produk memanggil handleConfirm", async () => {
        const user = setup([
            makeProduct("1", "Keyboard"),
            makeProduct("2", "Mouse"),
        ]);

        await user.click(screen.getByRole("button", { name: /delete 2 products/i }));

        expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it("cancel menutup dialog tanpa menghapus produk", async () => {
        const user = setup([makeProduct("1", "Keyboard")]);

        await user.click(screen.getByRole("button", { name: /cancel/i }));

        expect(handleOpenChange).toHaveBeenCalledWith(false);
        expect(handleConfirm).not.toHaveBeenCalled();
    });

    it("saat pending tombol hapus menampilkan teks Deleting dan disabled", () => {
        setup([makeProduct("1", "Keyboard")], { isPending: true });

        expect(screen.getByRole("button", { name: /deleting/i })).toBeDisabled();
        expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });

    it("saat pending tombol hapus tidak memanggil handleConfirm", async () => {
        const user = setup([makeProduct("1", "Keyboard")], { isPending: true });

        await user.click(screen.getByRole("button", { name: /deleting/i }));

        expect(handleConfirm).not.toHaveBeenCalled();
    });

    it("tanpa produk menampilkan judul dan deskripsi bentuk jamak", () => {
        setup([]);

        expect(screen.getByText("Delete 0 products?")).toBeInTheDocument();
        expect(
            screen.getByText(
                "These products will be permanently removed from your store. This action cannot be undone.",
            ),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /delete 0 products/i })).toBeDisabled();
        expect(document.querySelector("ul")).not.toBeInTheDocument();
    });

    it("dialog kosong tidak memanggil handleConfirm", async () => {
        const user = setup([]);

        await user.click(screen.getByRole("button", { name: /delete 0 products/i }));

        expect(handleConfirm).not.toHaveBeenCalled();
    });

    it("onOpenChange memanggil handleOpenChange saat tidak pending", async () => {
        const user = setup([makeProduct("1", "Keyboard")]);

        await user.click(screen.getByTestId("trigger-open-change"));

        expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it("onOpenChange tidak memanggil handleOpenChange saat pending", async () => {
        const user = setup([makeProduct("1", "Keyboard")], { isPending: true });

        await user.click(screen.getByTestId("trigger-open-change"));

        expect(handleOpenChange).not.toHaveBeenCalled();
    });

    it("open false tidak menampilkan dialog", () => {
        setup([makeProduct("1", "Keyboard")], { open: false });

        expect(screen.queryByText("Delete this product?")).not.toBeInTheDocument();
    });

    it("open true menampilkan dialog", () => {
        setup([makeProduct("1", "Keyboard")], { open: true });

        expect(screen.getByText("Delete this product?")).toBeInTheDocument();
    });
});
