
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: { src: string; alt: string }) => (
        <img src={props.src} alt={props.alt} />
    ),
}));

import ProductTable from "./ProductTable";
import type { Product } from "../../_types/productTypes";

const makeProduct = (
    id: string,
    overrides: Record<string, unknown> = {},
) =>
    ({
        id,
        productName: `Product ${id}`,
        productCategory: "Electronics",
        productImage: "",
        productImagePublicId: null,
        productPrice: 150000,
        productStock: 10,
        description: `Desc ${id}`,
        sellerId: "s1",
        updatedAt: "-",
        createdAt: {
            toDate: () => new Date(2025, 0, 5),
        },
        ...overrides,
    }) as unknown as Product;

const handlers = {
    handleToggleOne: jest.fn(),
    handleTogglePage: jest.fn(),
    handleOpen: jest.fn(),
    handlePrefetch: jest.fn(),
};

const setup = (
    items: Product[],
    overrides: Partial<React.ComponentProps<typeof ProductTable>> = {},
) => {
    const user = userEvent.setup();

    render(
        <ProductTable
            items={items}
            lowStock={5}
            selectedIds={new Set()}
            allSelected={false}
            someSelected={false}
            {...handlers}
            {...overrides}
        />,
    );

    return user;
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe("ProductTable", () => {
    it("menampilkan nama, kategori, harga, dan stok", () => {
        setup([makeProduct("1")]);

        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Rp150.000")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("updatedAt string ditampilkan apa adanya dan createdAt diformat", () => {
        setup([makeProduct("1")]);

        expect(screen.getAllByText("-").length).toBeGreaterThan(0);
        expect(screen.getAllByText("5 Jan 2025").length).toBeGreaterThan(0);
    });

    it("updatedAt dan createdAt berupa Timestamp diformat", () => {
        setup([
            makeProduct("1", {
                updatedAt: {
                    toDate: () => new Date(2025, 1, 10),
                },
            }),
        ]);

        expect(screen.getAllByText("10 Feb 2025").length).toBeGreaterThan(0);
        expect(screen.getAllByText("5 Jan 2025").length).toBeGreaterThan(0);
    });

    it("stok 0 menampilkan Out of stock", () => {
        setup([makeProduct("1", { productStock: 0 })]);

        expect(screen.getByText("Out of stock")).toBeInTheDocument();
    });

    it("stok rendah menampilkan label Low", () => {
        setup([makeProduct("1", { productStock: 3 })]);

        expect(screen.getByText("Low")).toBeInTheDocument();
    });

    it("stok tepat pada batas lowStock menampilkan label Low", () => {
        setup([makeProduct("1", { productStock: 5 })]);

        expect(screen.getByText("Low")).toBeInTheDocument();
    });

    it("stok cukup tidak menampilkan label Low", () => {
        setup([makeProduct("1", { productStock: 6 })]);

        expect(screen.queryByText("Low")).not.toBeInTheDocument();
    });

    it("stok 0 tidak menampilkan angka stok atau label Low", () => {
        setup([makeProduct("1", { productStock: 0 })]);

        expect(screen.getByText("Out of stock")).toBeInTheDocument();
        expect(screen.queryByText("Low")).not.toBeInTheDocument();
    });

    it("tanpa gambar menampilkan ikon pengganti", () => {
        setup([makeProduct("1")]);

        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("dengan gambar menampilkan gambar produk", () => {
        setup([
            makeProduct("1", {
                productImage: "https://img/1.png",
            }),
        ]);

        expect(screen.getByRole("img")).toHaveAttribute(
            "src",
            "https://img/1.png",
        );
        expect(screen.getByAltText("Product 1")).toBeInTheDocument();
    });

    it("menampilkan produk dengan dan tanpa gambar", () => {
        setup([
            makeProduct("1"),
            makeProduct("2", {
                productImage: "https://img/2.png",
            }),
        ]);

        expect(screen.getAllByRole("img")).toHaveLength(1);
        expect(screen.getByAltText("Product 2")).toHaveAttribute(
            "src",
            "https://img/2.png",
        );
    });

    it("klik baris memanggil handleOpen dengan id", async () => {
        const user = setup([makeProduct("1")]);

        await user.click(screen.getByText("Product 1"));

        expect(handlers.handleOpen).toHaveBeenCalledWith("1");
    });

    it("hover baris memanggil handlePrefetch", async () => {
        const user = setup([makeProduct("1")]);

        await user.hover(screen.getByText("Product 1"));

        expect(handlers.handlePrefetch).toHaveBeenCalledWith("1");
    });

    it("checkbox baris memilih produk tanpa membuka halaman edit", async () => {
        const user = setup([makeProduct("1")]);

        await user.click(
            screen.getByRole("checkbox", { name: "Select Product 1" }),
        );

        expect(handlers.handleToggleOne).toHaveBeenCalledWith("1", true);
        expect(handlers.handleOpen).not.toHaveBeenCalled();
    });

    it("checkbox baris dapat meng-uncheck produk", async () => {
        const user = setup(
            [makeProduct("1")],
            { selectedIds: new Set(["1"]) },
        );

        await user.click(
            screen.getByRole("checkbox", { name: "Select Product 1" }),
        );

        expect(handlers.handleToggleOne).toHaveBeenCalledWith("1", false);
    });

    it("baris terpilih memiliki checkbox tercentang", () => {
        setup(
            [makeProduct("1"), makeProduct("2")],
            { selectedIds: new Set(["2"]) },
        );

        expect(
            screen.getByRole("checkbox", { name: "Select Product 1" }),
        ).not.toBeChecked();

        expect(
            screen.getByRole("checkbox", { name: "Select Product 2" }),
        ).toBeChecked();
    });

    it("select all memanggil handleTogglePage dengan true", async () => {
        const user = setup([makeProduct("1")]);

        await user.click(
            screen.getByRole("checkbox", {
                name: "Select all on this page",
            }),
        );

        expect(handlers.handleTogglePage).toHaveBeenCalledWith(true);
    });

    it("uncheck select all memanggil handleTogglePage dengan false", async () => {
        const user = setup(
            [makeProduct("1")],
            { allSelected: true },
        );

        await user.click(
            screen.getByRole("checkbox", {
                name: "Select all on this page",
            }),
        );

        expect(handlers.handleTogglePage).toHaveBeenCalledWith(false);
    });

    it("select all tercentang saat allSelected true", () => {
        setup(
            [makeProduct("1")],
            { allSelected: true },
        );

        expect(
            screen.getByRole("checkbox", {
                name: "Select all on this page",
            }),
        ).toBeChecked();
    });

    it("select all tidak tercentang saat allSelected false", () => {
        setup([makeProduct("1")]);

        expect(
            screen.getByRole("checkbox", {
                name: "Select all on this page",
            }),
        ).not.toBeChecked();
    });

    it("select all memiliki kondisi indeterminate saat sebagian produk dipilih", () => {
        setup(
            [makeProduct("1"), makeProduct("2")],
            {
                selectedIds: new Set(["1"]),
                someSelected: true,
                allSelected: false,
            },
        );

        expect(
            screen.getByRole("checkbox", {
                name: "Select all on this page",
            }),
        ).toHaveAttribute("aria-checked", "mixed");
    });

    it("jumlah baris data sesuai items", () => {
        setup([
            makeProduct("1"),
            makeProduct("2"),
            makeProduct("3"),
        ]);

        const rows = screen.getAllByRole("row");

        expect(rows).toHaveLength(4);
        expect(within(rows[0]).getByText("Product")).toBeInTheDocument();
    });

    it("Enter pada baris membuka halaman edit", async () => {
        const user = setup([makeProduct("1")]);
        const row = screen.getByText("Product 1").closest("tr") as HTMLElement;

        row.focus();
        await user.keyboard("{Enter}");

        expect(handlers.handleOpen).toHaveBeenCalledWith("1");
    });

    it("Space pada baris membuka halaman edit", async () => {
        const user = setup([makeProduct("1")]);
        const row = screen.getByText("Product 1").closest("tr") as HTMLElement;

        row.focus();
        await user.keyboard(" ");

        expect(handlers.handleOpen).toHaveBeenCalledWith("1");
    });

    it("tombol keyboard selain Enter dan Space tidak membuka halaman edit", async () => {
        const user = setup([makeProduct("1")]);
        const row = screen.getByText("Product 1").closest("tr") as HTMLElement;

        row.focus();
        await user.keyboard("a");

        expect(handlers.handleOpen).not.toHaveBeenCalled();
    });

    it("keyboard event dari elemen anak tidak membuka halaman edit", () => {
        setup([makeProduct("1")]);

        fireEvent.keyDown(screen.getByText("Product 1"), {
            key: "Enter",
        });

        expect(handlers.handleOpen).not.toHaveBeenCalled();
    });

    it("keyboard event dari checkbox tidak membuka halaman edit", () => {
        setup([makeProduct("1")]);

        fireEvent.keyDown(
            screen.getByRole("checkbox", {
                name: "Select Product 1",
            }),
            { key: "Enter" },
        );

        expect(handlers.handleOpen).not.toHaveBeenCalled();
    });
});
