
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/components/ui/select", () => ({
    Select: (props: {
        value: string;
        onValueChange: (value: string | null) => void;
        children: React.ReactNode;
    }) => (
        <select
            aria-label="Rows per page"
            value={props.value}
            onChange={(event) =>
                props.onValueChange(event.target.value || null)
            }
        >
            <option value="">Select</option>
            {props.children}
        </select>
    ),
    SelectTrigger: () => null,
    SelectValue: () => null,
    SelectContent: (props: { children: React.ReactNode }) => (
        <>{props.children}</>
    ),
    SelectItem: (props: {
        value: string;
        children: React.ReactNode;
    }) => <option value={props.value}>{props.children}</option>,
}));

import ProductPagination from "./ProductPagination";

const handlePageChange = jest.fn();
const handlePageSize = jest.fn();

const setup = (
    overrides: Partial<React.ComponentProps<typeof ProductPagination>> = {},
) => {
    const user = userEvent.setup();

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

    return user;
};

const pageNumbers = () =>
    screen
        .getAllByRole("button", { name: /^Page \d+$/ })
        .map((button) => Number(button.textContent));

beforeEach(() => {
    jest.clearAllMocks();
});

describe("ProductPagination", () => {
    // ==================== Data Range ====================

    it("menampilkan rentang data halaman pertama", () => {
        setup();

        expect(screen.getByText(/Showing 1-10 of 200/)).toBeInTheDocument();
    });

    it("menampilkan rentang data halaman berikutnya", () => {
        setup({
            startIndex: 10,
            currentPage: 2,
        });

        expect(screen.getByText(/Showing 11-20 of 200/)).toBeInTheDocument();
    });

    it("rentang terakhir tidak melebihi total data", () => {
        setup({
            totalData: 25,
            startIndex: 20,
            currentPage: 3,
            totalPages: 3,
        });

        expect(screen.getByText(/Showing 21-25 of 25/)).toBeInTheDocument();
    });

    it("menampilkan rentang ketika total data kurang dari page size", () => {
        setup({
            totalData: 3,
            startIndex: 0,
            pageSize: 10,
            currentPage: 1,
            totalPages: 1,
        });

        expect(screen.getByText(/Showing 1-3 of 3/)).toBeInTheDocument();
    });

    it("memformat jumlah data dengan format angka", () => {
        setup({
            totalData: 1000,
            startIndex: 0,
            pageSize: 10,
        });

        expect(screen.getByText(/Showing 1-10 of 1\.000/)).toBeInTheDocument();
    });

    // ==================== Page Numbers ====================

    it.each([
        [1, [1, 2, 3]],
        [2, [1, 2, 3]],
        [10, [9, 10, 11]],
        [19, [18, 19, 20]],
        [20, [18, 19, 20]],
    ])(
        "halaman aktif %i menampilkan tombol halaman %j",
        (currentPage, expected) => {
            setup({ currentPage });

            expect(pageNumbers()).toEqual(expected);
        },
    );

    it("total halaman kurang dari maxPageButtons menampilkan semua halaman", () => {
        setup({
            totalPages: 2,
            totalData: 20,
        });

        expect(pageNumbers()).toEqual([1, 2]);
    });

    it("total halaman sama dengan maxPageButtons menampilkan semua halaman", () => {
        setup({
            totalPages: 3,
            maxPageButtons: 3,
            totalData: 30,
        });

        expect(pageNumbers()).toEqual([1, 2, 3]);
    });

    it("maxPageButtons satu hanya menampilkan satu tombol halaman", () => {
        setup({
            currentPage: 5,
            totalPages: 10,
            maxPageButtons: 1,
        });

        expect(pageNumbers()).toEqual([5]);
    });

    it("halaman aktif ditandai aria-current", () => {
        setup({ currentPage: 10 });

        expect(
            screen.getByRole("button", { name: "Page 10" }),
        ).toHaveAttribute("aria-current", "page");

        expect(
            screen.getByRole("button", { name: "Page 9" }),
        ).not.toHaveAttribute("aria-current");

        expect(
            screen.getByRole("button", { name: "Page 11" }),
        ).not.toHaveAttribute("aria-current");
    });

    // ==================== Disabled Buttons ====================

    it("di halaman pertama tombol First dan Previous disabled", () => {
        setup({
            currentPage: 1,
            totalPages: 20,
        });

        expect(
            screen.getByRole("button", { name: "First page" }),
        ).toBeDisabled();

        expect(
            screen.getByRole("button", { name: "Previous page" }),
        ).toBeDisabled();

        expect(
            screen.getByRole("button", { name: "Next page" }),
        ).toBeEnabled();

        expect(
            screen.getByRole("button", { name: "Last page" }),
        ).toBeEnabled();
    });

    it("di halaman terakhir tombol Next dan Last disabled", () => {
        setup({
            currentPage: 20,
            totalPages: 20,
        });

        expect(
            screen.getByRole("button", { name: "Next page" }),
        ).toBeDisabled();

        expect(
            screen.getByRole("button", { name: "Last page" }),
        ).toBeDisabled();

        expect(
            screen.getByRole("button", { name: "First page" }),
        ).toBeEnabled();

        expect(
            screen.getByRole("button", { name: "Previous page" }),
        ).toBeEnabled();
    });

    it("semua tombol navigasi disabled ketika hanya ada satu halaman", () => {
        setup({
            currentPage: 1,
            totalPages: 1,
            totalData: 5,
        });

        expect(
            screen.getByRole("button", { name: "First page" }),
        ).toBeDisabled();

        expect(
            screen.getByRole("button", { name: "Previous page" }),
        ).toBeDisabled();

        expect(
            screen.getByRole("button", { name: "Next page" }),
        ).toBeDisabled();

        expect(
            screen.getByRole("button", { name: "Last page" }),
        ).toBeDisabled();
    });

    // ==================== Navigation ====================

    it("tombol First memanggil handlePageChange dengan halaman 1", async () => {
        const user = setup({ currentPage: 10 });

        await user.click(
            screen.getByRole("button", { name: "First page" }),
        );

        expect(handlePageChange).toHaveBeenCalledWith(1);
    });

    it("tombol Previous memanggil handlePageChange dengan halaman sebelumnya", async () => {
        const user = setup({ currentPage: 10 });

        await user.click(
            screen.getByRole("button", { name: "Previous page" }),
        );

        expect(handlePageChange).toHaveBeenCalledWith(9);
    });

    it("tombol Next memanggil handlePageChange dengan halaman berikutnya", async () => {
        const user = setup({ currentPage: 10 });

        await user.click(
            screen.getByRole("button", { name: "Next page" }),
        );

        expect(handlePageChange).toHaveBeenCalledWith(11);
    });

    it("tombol Last memanggil handlePageChange dengan halaman terakhir", async () => {
        const user = setup({
            currentPage: 10,
            totalPages: 20,
        });

        await user.click(
            screen.getByRole("button", { name: "Last page" }),
        );

        expect(handlePageChange).toHaveBeenCalledWith(20);
    });

    it("tombol nomor halaman memanggil handlePageChange", async () => {
        const user = setup({ currentPage: 10 });

        await user.click(
            screen.getByRole("button", { name: "Page 11" }),
        );

        expect(handlePageChange).toHaveBeenCalledWith(11);
    });

    it("tombol navigasi disabled tidak memanggil handlePageChange", async () => {
        const user = setup({ currentPage: 1 });

        await user.click(
            screen.getByRole("button", { name: "First page" }),
        );

        await user.click(
            screen.getByRole("button", { name: "Previous page" }),
        );

        expect(handlePageChange).not.toHaveBeenCalled();
    });

    it("urutan navigasi dapat menjalankan semua callback halaman", async () => {
        const user = setup({
            currentPage: 10,
            totalPages: 20,
        });

        await user.click(
            screen.getByRole("button", { name: "First page" }),
        );

        await user.click(
            screen.getByRole("button", { name: "Previous page" }),
        );

        await user.click(
            screen.getByRole("button", { name: "Next page" }),
        );

        await user.click(
            screen.getByRole("button", { name: "Last page" }),
        );

        await user.click(
            screen.getByRole("button", { name: "Page 11" }),
        );

        expect(handlePageChange).toHaveBeenNthCalledWith(1, 1);
        expect(handlePageChange).toHaveBeenNthCalledWith(2, 9);
        expect(handlePageChange).toHaveBeenNthCalledWith(3, 11);
        expect(handlePageChange).toHaveBeenNthCalledWith(4, 20);
        expect(handlePageChange).toHaveBeenNthCalledWith(5, 11);
    });

    // ==================== Page Size ====================

    it("menampilkan pilihan rows per page", () => {
        setup();

        const select = screen.getByRole("combobox", {
            name: "Rows per page",
        });

        expect(select).toHaveValue("10");

        expect(
            screen.getByRole("option", { name: "5" }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("option", { name: "10" }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("option", { name: "20" }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("option", { name: "50" }),
        ).toBeInTheDocument();
    });

    it("mengubah rows per page memanggil handlePageSize", async () => {
        const user = setup();

        await user.selectOptions(
            screen.getByRole("combobox", { name: "Rows per page" }),
            "20",
        );

        expect(handlePageSize).toHaveBeenCalledWith("20");
    });

    it("mengubah rows per page ke 5", async () => {
        const user = setup();

        await user.selectOptions(
            screen.getByRole("combobox", { name: "Rows per page" }),
            "5",
        );

        expect(handlePageSize).toHaveBeenCalledWith("5");
    });

    it("mengubah rows per page ke 50", async () => {
        const user = setup();

        await user.selectOptions(
            screen.getByRole("combobox", { name: "Rows per page" }),
            "50",
        );

        expect(handlePageSize).toHaveBeenCalledWith("50");
    });

    it("nilai rows per page kosong mengirim null", () => {
        setup();

        fireEvent.change(
            screen.getByRole("combobox", { name: "Rows per page" }),
            {
                target: { value: "" },
            },
        );

        expect(handlePageSize).toHaveBeenCalledWith(null);
    });
});
