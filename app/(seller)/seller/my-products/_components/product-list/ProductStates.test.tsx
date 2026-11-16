import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductEmpty, ProductError, ProductLoading, ProductNoMatch } from "./ProductStates";

describe("ProductLoading", () => {
    it("merender baris skeleton sebanyak rows", () => {
        const { container } = render(<ProductLoading rows={7} />);
        expect(container.firstElementChild?.children).toHaveLength(7);
    });
});

describe("ProductError", () => {
    it("menampilkan pesan error dan tombol retry memanggil handleRetry", async () => {
        const handleRetry = jest.fn();
        render(<ProductError message="Network down" isFetching={false} handleRetry={handleRetry} />);

        expect(screen.getByText("Failed to load products")).toBeInTheDocument();
        expect(screen.getByText("Network down")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: /retry/i }));
        expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it("tombol retry disabled saat fetching", () => {
        render(<ProductError message="x" isFetching handleRetry={jest.fn()} />);
        expect(screen.getByRole("button", { name: /retry/i })).toBeDisabled();
    });
});

describe("ProductEmpty", () => {
    it("menampilkan pesan kosong dan tombol tambah produk mengarah ke addHref", () => {
        render(<ProductEmpty addHref="/seller/my-products/add" />);

        expect(screen.getByText("No products yet")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /add product/i })).toHaveAttribute(
            "href",
            "/seller/my-products/add",
        );
    });
});

describe("ProductNoMatch", () => {
    it("menampilkan pesan tidak ada hasil dan tombol clear memanggil handleReset", async () => {
        const handleReset = jest.fn();
        render(<ProductNoMatch handleReset={handleReset} />);

        expect(screen.getByText("No products found")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: /clear filters/i }));
        expect(handleReset).toHaveBeenCalledTimes(1);
    });
});