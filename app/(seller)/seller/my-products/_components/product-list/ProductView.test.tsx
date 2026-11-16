
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = jest.fn();
const mockPrefetch = jest.fn();
const mockRefetch = jest.fn();
const mockMutate = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush, prefetch: mockPrefetch }),
}));

jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: { src: string; alt: string }) => (
        <img src={props.src} alt={props.alt} />
    ),
}));

jest.mock("../../_hooks/useSellerProducts", () => ({
    useSellerProducts: jest.fn(),
}));

jest.mock("../../_hooks/useDeleteProduct", () => ({
    useDeleteProducts: jest.fn(),
}));

jest.mock("@/components/ui/select", () => ({
    Select: (props: {
        value: string | null;
        onValueChange: (value: string | null) => void;
        children: React.ReactNode;
    }) => (
        <select
            value={props.value ?? ""}
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
    SelectItem: (props: { value: string; children: React.ReactNode }) => (
        <option value={props.value}>{props.children}</option>
    ),
}));

jest.mock("../DeleteProductDialog", () => {
    const Actual = jest.requireActual("../DeleteProductDialog").default;

    return {
        __esModule: true,
        default: (props: {
            products: Product[];
            open: boolean;
            handleOpenChange: (open: boolean) => void;
            handleConfirm: () => void;
        }) => (
            <>
                <Actual {...props} />

                <button
                    type="button"
                    data-testid="test-confirm-empty"
                    onClick={props.handleConfirm}
                />

                <button
                    type="button"
                    data-testid="test-open-change-true"
                    onClick={() => props.handleOpenChange(true)}
                />
            </>
        ),
    };
});

import { PRODUCT_CATEGORIES } from "@/constants/ProductCategory";
import { useSellerProducts } from "../../_hooks/useSellerProducts";
import { useDeleteProducts } from "../../_hooks/useDeleteProduct";
import type { Product } from "../../_types/productTypes";
import ProductView from "./ProductView";

const mockedUseProducts = jest.mocked(useSellerProducts);
const mockedUseDelete = jest.mocked(useDeleteProducts);

const [CAT_A, CAT_B, CAT_C] = PRODUCT_CATEGORIES;

const makeProduct = (
    i: number,
    overrides: Record<string, unknown> = {},
) =>
    ({
        id: `p${i}`,
        productName: `Product ${i}`,
        productCategory: "Electronics",
        productImage: "",
        productImagePublicId: null,
        productPrice: 10000 * i,
        productStock: 10,
        description: `Desc ${i}`,
        sellerId: "s1",
        updatedAt: "-",
        createdAt: {
            toDate: () => new Date(2025, 0, 5),
        },
        ...overrides,
    }) as unknown as Product;

const makeProducts = (n: number) =>
    Array.from({ length: n }, (_, i) => makeProduct(i + 1));

const mockProducts = (state: Record<string, unknown> = {}) =>
    mockedUseProducts.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
        refetch: mockRefetch,
        ...state,
    } as unknown as ReturnType<typeof useSellerProducts>);

const setup = async () => {
    const user = userEvent.setup();
    render(<ProductView />);
    return user;
};

const getDeleteButton = () =>
    screen.queryByRole("button", { name: /delete/i });

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});

    mockedUseDelete.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
    } as unknown as ReturnType<typeof useDeleteProducts>);
});

afterEach(() => {
    jest.restoreAllMocks();
});

// ==================== State ====================

describe("ProductView: state", () => {
    it("loading: menampilkan skeleton", () => {
        mockProducts({ isLoading: true });

        const { container } = render(<ProductView />);

        expect(
            container.querySelector("[data-slot='skeleton']"),
        ).toBeInTheDocument();
    });

    it("error: menampilkan pesan dan retry memanggil refetch", async () => {
        mockProducts({
            isError: true,
            error: new Error("Network down"),
        });

        const user = await setup();

        expect(screen.getByText("Network down")).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: /retry/i }),
        );

        expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it("error ketika sedang fetching", async () => {
        mockProducts({
            isError: true,
            isFetching: true,
            error: new Error("Network down"),
        });

        await setup();

        expect(screen.getByText("Network down")).toBeInTheDocument();
    });

    it("tidak ada produk: menampilkan state kosong", async () => {
        mockProducts({ data: [] });

        await setup();

        expect(screen.getByText("No products yet")).toBeInTheDocument();
    });

    it("data undefined: menampilkan state kosong", async () => {
        mockProducts({ data: undefined });

        await setup();

        expect(screen.getByText("No products yet")).toBeInTheDocument();
    });
});

// ==================== List and Search ====================

describe("ProductView: daftar dan search", () => {
    it("menampilkan produk milik seller", async () => {
        mockProducts({ data: makeProducts(3) });

        await setup();

        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("Product 3")).toBeInTheDocument();
    });

    it("search memfilter berdasarkan nama tanpa case sensitive", async () => {
        mockProducts({
            data: [
                makeProduct(1, { productName: "Keyboard" }),
                makeProduct(2, { productName: "Mouse" }),
            ],
        });

        const user = await setup();

        await user.type(
            screen.getByPlaceholderText("Search product name..."),
            "KEY",
        );

        expect(screen.getByText("Keyboard")).toBeInTheDocument();
        expect(screen.queryByText("Mouse")).not.toBeInTheDocument();
    });

    it("search tanpa hasil menampilkan no match", async () => {
        mockProducts({ data: makeProducts(2) });

        const user = await setup();

        await user.type(
            screen.getByPlaceholderText("Search product name..."),
            "zzz",
        );

        expect(screen.getByText("No products found")).toBeInTheDocument();
    });

    it("Clear filters mengembalikan daftar produk", async () => {
        mockProducts({ data: makeProducts(2) });

        const user = await setup();

        await user.type(
            screen.getByPlaceholderText("Search product name..."),
            "zzz",
        );

        await user.click(
            screen.getByRole("button", { name: /clear filters/i }),
        );

        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Search product name..."),
        ).toHaveValue("");
    });

    it("search mengembalikan pagination ke halaman pertama", async () => {
        mockProducts({ data: makeProducts(25) });

        const user = await setup();

        await user.click(
            screen.getByRole("button", { name: "Next page" }),
        );

        await user.type(
            screen.getByPlaceholderText("Search product name..."),
            "Product 2",
        );

        expect(screen.getByText(/Showing 1-/)).toBeInTheDocument();
    });

    it("search dengan spasi di awal dan akhir tetap memfilter produk", async () => {
        mockProducts({
            data: [
                makeProduct(1, { productName: "Keyboard" }),
                makeProduct(2, { productName: "Mouse" }),
            ],
        });

        const user = await setup();

        await user.type(
            screen.getByPlaceholderText("Search product name..."),
            "  KEY  ",
        );

        expect(screen.getByText("Keyboard")).toBeInTheDocument();
        expect(screen.queryByText("Mouse")).not.toBeInTheDocument();
    });

    it("search kosong menampilkan semua produk dalam kategori aktif", async () => {
        mockProducts({
            data: [
                makeProduct(1, { productCategory: CAT_A }),
                makeProduct(2, { productCategory: CAT_B }),
            ],
        });

        const user = await setup();

        const [categorySelect] = screen.getAllByRole("combobox");

        await user.selectOptions(categorySelect, CAT_A);

        await user.clear(
            screen.getByPlaceholderText("Search product name..."),
        );

        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.queryByText("Product 2")).not.toBeInTheDocument();
    });
});

// ==================== Category Filter ====================

describe("ProductView: filter kategori", () => {
    const setupCategory = async () => {
        const user = userEvent.setup();
        render(<ProductView />);

        const [categorySelect] = screen.getAllByRole("combobox");

        return { user, categorySelect };
    };

    it("memfilter produk sesuai kategori", async () => {
        mockProducts({
            data: [
                makeProduct(1, { productCategory: CAT_A }),
                makeProduct(2, { productCategory: CAT_B }),
            ],
        });

        const { user, categorySelect } = await setupCategory();

        await user.selectOptions(categorySelect, CAT_B);

        expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
        expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    it("All mengembalikan seluruh produk", async () => {
        mockProducts({
            data: [
                makeProduct(1, { productCategory: CAT_A }),
                makeProduct(2, { productCategory: CAT_B }),
            ],
        });

        const { user, categorySelect } = await setupCategory();

        await user.selectOptions(categorySelect, CAT_B);
        await user.selectOptions(categorySelect, "All");

        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    it("kategori kosong mengembalikan filter ke All", async () => {
        mockProducts({
            data: [
                makeProduct(1, { productCategory: CAT_A }),
                makeProduct(2, { productCategory: CAT_B }),
            ],
        });

        const { user, categorySelect } = await setupCategory();

        await user.selectOptions(categorySelect, CAT_A);
        await user.selectOptions(categorySelect, "");

        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    it("kategori tanpa produk menampilkan no match", async () => {
        mockProducts({
            data: [makeProduct(1, { productCategory: CAT_A })],
        });

        const { user, categorySelect } = await setupCategory();

        await user.selectOptions(categorySelect, CAT_C);

        expect(screen.getByText("No products found")).toBeInTheDocument();
    });

    it("kategori dan search bekerja bersamaan", async () => {
        mockProducts({
            data: [
                makeProduct(1, { productCategory: CAT_A }),
                makeProduct(2, { productCategory: CAT_A }),
                makeProduct(3, { productCategory: CAT_B }),
            ],
        });

        const { user, categorySelect } = await setupCategory();

        await user.selectOptions(categorySelect, CAT_A);

        await user.type(
            screen.getByPlaceholderText("Search product name..."),
            "Product 2",
        );

        expect(screen.getByText("Product 2")).toBeInTheDocument();
        expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
        expect(screen.queryByText("Product 3")).not.toBeInTheDocument();
    });

    it("mengganti kategori membersihkan pilihan produk", async () => {
        mockProducts({
            data: [
                makeProduct(1, { productCategory: CAT_A }),
                makeProduct(2, { productCategory: CAT_B }),
            ],
        });

        const { user, categorySelect } = await setupCategory();

        await user.click(
            screen.getByRole("checkbox", { name: "Select Product 1" }),
        );

        expect(getDeleteButton()).toBeInTheDocument();

        await user.selectOptions(categorySelect, CAT_B);

        expect(getDeleteButton()).not.toBeInTheDocument();
    });

    it("Clear filters mereset kategori", async () => {
        mockProducts({
            data: [
                makeProduct(1, { productCategory: CAT_A }),
                makeProduct(2, { productCategory: CAT_B }),
            ],
        });

        const { user, categorySelect } = await setupCategory();

        await user.selectOptions(categorySelect, CAT_C);

        await user.click(
            screen.getByRole("button", { name: /clear filters/i }),
        );

        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("Product 2")).toBeInTheDocument();
    });
});

// ==================== Pagination ====================

describe("ProductView: pagination", () => {
    it("default 10 baris per halaman", async () => {
        mockProducts({ data: makeProducts(25) });

        await setup();

        expect(screen.getAllByRole("row")).toHaveLength(11);
        expect(screen.getByText(/Showing 1-10 of 25/)).toBeInTheDocument();
    });

    it("pindah ke halaman berikutnya", async () => {
        mockProducts({ data: makeProducts(25) });

        const user = await setup();

        await user.click(
            screen.getByRole("button", { name: "Next page" }),
        );

        expect(screen.getByText(/Showing 11-20 of 25/)).toBeInTheDocument();
        expect(screen.getByText("Product 11")).toBeInTheDocument();
        expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
    });

    it("halaman terakhir menampilkan sisa data", async () => {
        mockProducts({ data: makeProducts(25) });

        const user = await setup();

        await user.click(
            screen.getByRole("button", { name: "Last page" }),
        );

        expect(screen.getByText(/Showing 21-25 of 25/)).toBeInTheDocument();
        expect(screen.getAllByRole("row")).toHaveLength(6);
    });

    it("20 produk per halaman", async () => {
        mockProducts({ data: makeProducts(25) });

        const user = await setup();

        const [, pageSizeSelect] = screen.getAllByRole("combobox");

        await user.selectOptions(pageSizeSelect, "20");

        expect(screen.getByText(/Showing 1-20 of 25/)).toBeInTheDocument();
        expect(screen.getAllByRole("row")).toHaveLength(21);
    });

    it("5 produk per halaman dan kembali ke halaman pertama", async () => {
        mockProducts({ data: makeProducts(25) });

        const user = await setup();

        const [, pageSizeSelect] = screen.getAllByRole("combobox");

        await user.click(
            screen.getByRole("button", { name: "Next page" }),
        );

        await user.selectOptions(pageSizeSelect, "5");

        expect(screen.getByText(/Showing 1-5 of 25/)).toBeInTheDocument();
    });

    it("mengubah page size tidak mengubah pilihan produk", async () => {
        mockProducts({ data: makeProducts(25) });

        const user = await setup();

        await user.click(
            screen.getByRole("checkbox", { name: "Select Product 1" }),
        );

        const [, pageSizeSelect] = screen.getAllByRole("combobox");

        await user.selectOptions(pageSizeSelect, "20");

        expect(getDeleteButton()).toBeInTheDocument();
    });

    it("nilai page size kosong kembali ke default 10", async () => {
        mockProducts({ data: makeProducts(25) });

        await setup();

        const [, pageSizeSelect] = screen.getAllByRole("combobox");

        fireEvent.change(pageSizeSelect, {
            target: { value: "" },
        });

        expect(screen.getByText(/Showing 1-10 of 25/)).toBeInTheDocument();
    });
});

// ==================== Navigation ====================

describe("ProductView: navigasi", () => {
    it("klik produk membuka halaman edit", async () => {
        mockProducts({ data: makeProducts(2) });

        const user = await setup();

        await user.click(screen.getByText("Product 2"));

        expect(mockPush).toHaveBeenCalledWith(
            "/seller/my-products/edit/p2",
        );
    });

    it("hover produk melakukan prefetch halaman edit", async () => {
        mockProducts({ data: makeProducts(2) });

        const user = await setup();

        await user.hover(screen.getByText("Product 1"));

        expect(mockPrefetch).toHaveBeenCalledWith(
            "/seller/my-products/edit/p1",
        );
    });
});

// ==================== Selection ====================

describe("ProductView: pilih produk", () => {
    it("memilih produk menampilkan tombol Delete dengan jumlah", async () => {
        mockProducts({ data: makeProducts(3) });

        const user = await setup();

        expect(getDeleteButton()).not.toBeInTheDocument();

        await user.click(
            screen.getByRole("checkbox", { name: "Select Product 1" }),
        );

        await user.click(
            screen.getByRole("checkbox", { name: "Select Product 2" }),
        );

        expect(
            screen.getByRole("button", { name: /delete/i }),
        ).toBeInTheDocument();

        expect(getDeleteButton()).toHaveTextContent("2");
    });

    it("uncheck produk menghapus produk dari pilihan", async () => {
        mockProducts({ data: makeProducts(3) });

        const user = await setup();

        const checkbox = screen.getByRole("checkbox", {
            name: "Select Product 1",
        });

        await user.click(checkbox);

        expect(getDeleteButton()).toBeInTheDocument();

        await user.click(checkbox);

        expect(getDeleteButton()).not.toBeInTheDocument();
    });

    it("select all memilih seluruh produk pada halaman aktif", async () => {
        mockProducts({ data: makeProducts(25) });

        const user = await setup();

        await user.click(
            screen.getByRole("checkbox", {
                name: "Select all on this page",
            }),
        );

        expect(getDeleteButton()).toHaveTextContent("10");
    });

    it("unselect all menghapus pilihan pada halaman aktif", async () => {
        mockProducts({ data: makeProducts(25) });

        const user = await setup();

        const selectAll = screen.getByRole("checkbox", {
            name: "Select all on this page",
        });

        await user.click(selectAll);

        expect(getDeleteButton()).toHaveTextContent("10");

        await user.click(selectAll);

        expect(getDeleteButton()).not.toBeInTheDocument();
    });

    it("select all hanya memilih produk pada halaman aktif", async () => {
        mockProducts({ data: makeProducts(25) });

        const user = await setup();

        await user.click(
            screen.getByRole("checkbox", {
                name: "Select all on this page",
            }),
        );

        expect(getDeleteButton()).toHaveTextContent("10");

        await user.click(
            screen.getByRole("button", { name: "Next page" }),
        );

        expect(getDeleteButton()).toHaveTextContent("10");
    });

    it("mengubah search membersihkan pilihan", async () => {
        mockProducts({ data: makeProducts(3) });

        const user = await setup();

        await user.click(
            screen.getByRole("checkbox", { name: "Select Product 1" }),
        );

        expect(getDeleteButton()).toBeInTheDocument();

        await user.type(
            screen.getByPlaceholderText("Search product name..."),
            "Product 2",
        );

        expect(getDeleteButton()).not.toBeInTheDocument();
    });
});

// ==================== Delete ====================

describe("ProductView: hapus produk", () => {
    it("klik Delete menampilkan dialog tanpa langsung menghapus", async () => {
        mockProducts({ data: makeProducts(3) });

        const user = await setup();

        await user.click(
            screen.getByRole("checkbox", { name: "Select Product 1" }),
        );

        await user.click(
            screen.getByRole("button", { name: /delete/i }),
        );

        expect(screen.getByText("Delete this product?")).toBeInTheDocument();
        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("konfirmasi hapus banyak produk memanggil mutate dengan produk terpilih", async () => {
        mockProducts({ data: makeProducts(3) });

        const user = await setup();

        await user.click(
            screen.getByRole("checkbox", { name: "Select Product 1" }),
        );

        await user.click(
            screen.getByRole("checkbox", { name: "Select Product 3" }),
        );

        await user.click(
            screen.getByRole("button", { name: /delete/i }),
        );

        const dialog = screen.getByRole("alertdialog");

        expect(
            within(dialog).getByText("Delete 2 products?"),
        ).toBeInTheDocument();

        await user.click(
            within(dialog).getByRole("button", {
                name: /delete 2 products/i,
            }),
        );

        expect(mockMutate).toHaveBeenCalledTimes(1);

        const sent = mockMutate.mock.calls[0][0] as Product[];

        expect(sent.map((product) => product.id)).toEqual(["p1", "p3"]);
    });

    it("cancel menutup dialog tanpa menghapus", async () => {
        mockProducts({ data: makeProducts(3) });

        const user = await setup();

        await user.click(
            screen.getByRole("checkbox", { name: "Select Product 1" }),
        );

        await user.click(
            screen.getByRole("button", { name: /delete/i }),
        );

        await user.click(
            within(screen.getByRole("alertdialog")).getByRole("button", {
                name: /cancel/i,
            }),
        );

        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("onSettled menutup dialog dan membersihkan pilihan", async () => {
        mockMutate.mockImplementation(
            (
                _products: Product[],
                options: { onSettled: () => void },
            ) => options.onSettled(),
        );

        mockProducts({ data: makeProducts(3) });

        const user = await setup();

        await user.click(
            screen.getByRole("checkbox", { name: "Select Product 1" }),
        );

        await user.click(
            screen.getByRole("button", { name: /delete/i }),
        );

        await user.click(
            within(screen.getByRole("alertdialog")).getByRole("button", {
                name: /delete product/i,
            }),
        );

        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
        expect(getDeleteButton()).not.toBeInTheDocument();
    });

    it("menutup dialog melalui perubahan open menjadi false", async () => {
        mockProducts({ data: makeProducts(3) });

        const user = await setup();

        await user.click(
            screen.getByRole("checkbox", { name: "Select Product 1" }),
        );

        await user.click(
            screen.getByRole("button", { name: /delete/i }),
        );

        expect(screen.getByRole("alertdialog")).toBeInTheDocument();

        await user.keyboard("{Escape}");

        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("confirmDelete tidak memanggil mutate jika tidak ada produk", async () => {
        mockProducts({ data: makeProducts(3) });

        await setup();

        fireEvent.click(screen.getByTestId("test-confirm-empty"));

        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("handleOpenChange true tidak menutup dialog", async () => {
        mockProducts({ data: makeProducts(3) });

        const user = await setup();

        await user.click(
            screen.getByRole("checkbox", { name: "Select Product 1" }),
        );

        await user.click(
            screen.getByRole("button", { name: /delete/i }),
        );

        fireEvent.click(screen.getByTestId("test-open-change-true"));

        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
});
