import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductPagination from "./ProductPagination";

const handlePageChange = jest.fn();
const handlePageSize = jest.fn();

const setup = (overrides: Partial<React.ComponentProps<typeof ProductPagination>> = {}) => {
    const props = {
        pageSizeOptions: [5, 10, 20, 50],
        maxPageButtons: 3,
        totalData: 200,
        startIndex: 0,
        pageSize: 10,
        currentPage: 1,
        totalPages: 20,
        handlePageChange,
        handlePageSize,
        ...overrides,
    };
    render(<ProductPagination {...props} />);
    return userEvent.setup();
};

const pageNumbers = () =>
    screen
        .getAllByRole("button", { name: /^Page \d+$/ })
        .map((b) => Number(b.textContent));

beforeEach(() => jest.clearAllMocks());

describe("ProductPagination", () => {
    it("menampilkan rentang data", () => {
        setup({ startIndex: 10, currentPage: 2 });
        expect(screen.getByText(/Showing 11-20 of 200/)).toBeInTheDocument();
    });

    it("rentang terakhir tidak melebihi total data", () => {
        setup({ totalData: 25, startIndex: 20, currentPage: 3, totalPages: 3 });
        expect(screen.getByText(/Showing 21-25 of 25/)).toBeInTheDocument();
    });

    it.each([
        [1, [1, 2, 3]],
        [10, [9, 10, 11]],
        [20, [18, 19, 20]],
    ])("halaman aktif %i menampilkan tombol %j", (currentPage, expected) => {
        setup({ currentPage });
        expect(pageNumbers()).toEqual(expected);
    });

    it("total halaman kurang dari max: tampil semua", () => {
        setup({ totalPages: 2, totalData: 20 });
        expect(pageNumbers()).toEqual([1, 2]);
    });

    it("halaman aktif ditandai aria-current", () => {
        setup({ currentPage: 10 });
        expect(screen.getByRole("button", { name: "Page 10" })).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("button", { name: "Page 9" })).not.toHaveAttribute("aria-current");
    });

    it("di halaman pertama: First dan Previous disabled", () => {
        setup({ currentPage: 1 });
        expect(screen.getByRole("button", { name: "First page" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
    });

    it("di halaman terakhir: Next dan Last disabled", () => {
        setup({ currentPage: 20 });
        expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Last page" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
    });

    it("tombol navigasi memanggil handlePageChange dengan halaman yang benar", async () => {
        const user = setup({ currentPage: 10 });

        await user.click(screen.getByRole("button", { name: "First page" }));
        expect(handlePageChange).toHaveBeenLastCalledWith(1);

        await user.click(screen.getByRole("button", { name: "Previous page" }));
        expect(handlePageChange).toHaveBeenLastCalledWith(9);

        await user.click(screen.getByRole("button", { name: "Next page" }));
        expect(handlePageChange).toHaveBeenLastCalledWith(11);

        await user.click(screen.getByRole("button", { name: "Last page" }));
        expect(handlePageChange).toHaveBeenLastCalledWith(20);

        await user.click(screen.getByRole("button", { name: "Page 11" }));
        expect(handlePageChange).toHaveBeenLastCalledWith(11);
    });
});