import { render, screen } from "@testing-library/react";

jest.mock("../_hooks/useSellerProducts", () => ({ useSellerProducts: jest.fn() }));
jest.mock("./ProductForm", () => ({
    __esModule: true,
    default: (props: { product: { productName: string } }) => <div>form: {props.product.productName}</div>,
}));

import { useSellerProducts } from "../_hooks/useSellerProducts";
import EditProductView from "./EditProductView";

const mockedUse = jest.mocked(useSellerProducts);

const mockState = (state: Record<string, unknown>) =>
    mockedUse.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        ...state,
    } as unknown as ReturnType<typeof useSellerProducts>);

describe("EditProductView", () => {
    it("loading: menampilkan skeleton, bukan form", () => {
        mockState({ isLoading: true });
        const { container } = render(<EditProductView id="p1" />);

        expect(container.querySelector("[data-slot='skeleton']")).toBeInTheDocument();
        expect(screen.queryByText(/form:/)).not.toBeInTheDocument();
    });

    it("produk tidak ditemukan: pesan dan tombol kembali", () => {
        mockState({ data: [{ id: "lain", productName: "X" }] });
        render(<EditProductView id="p1" />);

        expect(screen.getByText("Product not found")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /back to products/i })).toHaveAttribute(
            "href",
            "/seller/my-products",
        );
    });

    it("produk ditemukan: form menerima produk dengan id yang cocok", () => {
        mockState({
            data: [
                { id: "p1", productName: "Keyboard" },
                { id: "p2", productName: "Mouse" },
            ],
        });
        render(<EditProductView id="p2" />);

        expect(screen.getByText("form: Mouse")).toBeInTheDocument();
    });

    it("error query: bukan 'Product not found'", () => {
        mockState({ isError: true });
        render(<EditProductView id="p1" />);

        expect(screen.queryByText("Product not found")).not.toBeInTheDocument();
        expect(screen.getByText("Failed to load product")).toBeInTheDocument();
    });
});