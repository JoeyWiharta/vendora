import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductToolbar from "./ProductToolbar";

const handlers = {
    handleSearch: jest.fn(),
    handleCategory: jest.fn(),
    handleDelete: jest.fn(),
};

const setup = (overrides: Partial<React.ComponentProps<typeof ProductToolbar>> = {}) => {
    render(
        <ProductToolbar
            allValue="All"
            searchFilter=""
            categoryFilter="All"
            selectedDeleteCount={0}
            {...handlers}
            {...overrides}
        />,
    );
    return userEvent.setup();
};

beforeEach(() => jest.clearAllMocks());

describe("ProductToolbar", () => {
    it("menampilkan input search dengan nilai dari props", () => {
        setup({ searchFilter: "key" });
        expect(screen.getByPlaceholderText("Search product name...")).toHaveValue("key");
    });

    it("mengetik di search memanggil handleSearch", async () => {
        const user = setup();
        await user.type(screen.getByPlaceholderText("Search product name..."), "a");
        expect(handlers.handleSearch).toHaveBeenCalledWith("a");
    });

    it("tombol delete tidak tampil jika tidak ada yang dipilih", () => {
        setup({ selectedDeleteCount: 0 });
        expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
    });

    it("tombol delete menampilkan jumlah terpilih dan memanggil handleDelete", async () => {
        const user = setup({ selectedDeleteCount: 3 });
        await user.click(screen.getByRole("button", { name: /delete \(3\)/i }));
        expect(handlers.handleDelete).toHaveBeenCalledTimes(1);
    });
});