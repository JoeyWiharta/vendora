import { render, screen } from "@testing-library/react";
import ProductDetailError from "./ProductDetailError";

jest.mock("./ProductBackButton", () => ({
    __esModule: true,
    default: () => <div>back-button</div>,
}));

describe("ProductDetailError", () => {
    it("tanpa message: Product not found", () => {
        render(<ProductDetailError />);

        expect(screen.getByText("Product not found")).toBeInTheDocument();
        expect(screen.queryByText("Failed to load product")).not.toBeInTheDocument();
    });

    it("dengan message: Failed to load product beserta pesannya", () => {
        render(<ProductDetailError message="Network down" />);

        expect(screen.getByText("Failed to load product")).toBeInTheDocument();
        expect(screen.getByText("Network down")).toBeInTheDocument();
        expect(screen.queryByText("Product not found")).not.toBeInTheDocument();
    });

    it("selalu menampilkan tombol kembali", () => {
        render(<ProductDetailError />);
        expect(screen.getByText("back-button")).toBeInTheDocument();
    });
});