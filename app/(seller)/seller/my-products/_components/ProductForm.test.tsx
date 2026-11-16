
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockAdd = jest.fn();
const mockUpdate = jest.fn();

jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: { src: string; alt: string }) => (
        <img src={props.src} alt={props.alt} />
    ),
}));

jest.mock("../_hooks/useAddProducts", () => ({
    useAddProduct: jest.fn(),
}));

jest.mock("../_hooks/useUpdateProduct", () => ({
    useUpdateProduct: jest.fn(),
}));

jest.mock("@/components/ui/select", () => ({
    Select: (props: {
        value: string | null;
        onValueChange: (v: string | undefined) => void;
        disabled?: boolean;
        children: React.ReactNode;
    }) => (
        <>
            <select
                aria-label="Category"
                value={props.value ?? ""}
                disabled={props.disabled}
                onChange={(e) => props.onValueChange(e.target.value)}
            >
                <option value="">-</option>
                {props.children}
            </select>

            <button
                type="button"
                onClick={() => props.onValueChange(undefined)}
            >
                Clear category
            </button>
        </>
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

import { PRODUCT_CATEGORIES } from "@/constants/ProductCategory";
import { DEFAULT_PRODUCT_IMAGE } from "@/constants/ProductDefaultImage";
import { MAX_IMAGE_MB } from "../_schema/productAddEditSchema";
import { useAddProduct } from "../_hooks/useAddProducts";
import { useUpdateProduct } from "../_hooks/useUpdateProduct";
import type { Product } from "../_types/productTypes";
import ProductForm from "./ProductForm";

const mockedUseAdd = jest.mocked(useAddProduct);
const mockedUseUpdate = jest.mocked(useUpdateProduct);

const category = PRODUCT_CATEGORIES[0];

const mockHooks = (
    pending = { add: false, update: false },
) => {
    mockedUseAdd.mockReturnValue({
        mutate: mockAdd,
        isPending: pending.add,
    } as unknown as ReturnType<typeof useAddProduct>);

    mockedUseUpdate.mockReturnValue({
        mutate: mockUpdate,
        isPending: pending.update,
    } as unknown as ReturnType<typeof useUpdateProduct>);
};

const existing = {
    id: "p1",
    productName: "Keyboard",
    productCategory: category,
    productImage: "https://img/old.png",
    productImagePublicId: "pub-old",
    productPrice: 150000,
    productStock: 5,
    description: "Mechanical",
    sellerId: "s1",
    updatedAt: "-",
    createdAt: { toDate: () => new Date() },
} as unknown as Product;

const submitButton = () =>
    screen.getAllByRole("button", {
        name: /add product|save changes|saving/i,
    })[0];

const fillValid = async (
    user: ReturnType<typeof userEvent.setup>,
) => {
    await user.type(screen.getByLabelText("Product name"), "Keyboard");
    await user.selectOptions(screen.getByLabelText("Category"), category);
    await user.type(screen.getByLabelText("Description"), "Mechanical keyboard");
    await user.type(screen.getByLabelText("Price"), "150000");
    await user.type(screen.getByLabelText("Stock"), "5");
};

const uploadArea = () =>
    screen.getByRole("button", { name: "Upload product image" });

const png = () =>
    new File(["x"], "dropped.png", { type: "image/png" });

beforeEach(() => {
    jest.clearAllMocks();
    mockHooks();

    global.URL.createObjectURL = jest.fn(() => "blob:preview");
    global.URL.revokeObjectURL = jest.fn();
});

describe("ProductForm: tambah produk", () => {
    it("submit kosong menampilkan semua pesan validasi", async () => {
        const user = userEvent.setup();
        render(<ProductForm />);

        await user.click(submitButton());

        expect(await screen.findByText("Product name must be more than 5 characters")).toBeInTheDocument();
        expect(screen.getByText("Please select a product category")).toBeInTheDocument();
        expect(screen.getByText("Description is required")).toBeInTheDocument();
        expect(screen.getByText("Price is required")).toBeInTheDocument();
        expect(screen.getByText("Stock is required")).toBeInTheDocument();
        expect(mockAdd).not.toHaveBeenCalled();
    });

    it("menolak nama dengan 5 karakter", async () => {
        const user = userEvent.setup();
        render(<ProductForm />);

        await user.type(screen.getByLabelText("Product name"), "abcde");
        await user.click(submitButton());

        expect(await screen.findByText("Product name must be more than 5 characters")).toBeInTheDocument();
    });

    it("menolak harga dan stok 0", async () => {
        const user = userEvent.setup();
        render(<ProductForm />);

        await user.type(screen.getByLabelText("Price"), "0");
        await user.type(screen.getByLabelText("Stock"), "0");
        await user.click(submitButton());

        expect(await screen.findByText("Price must be greater than 0")).toBeInTheDocument();
        expect(screen.getByText("Stock must be greater than 0")).toBeInTheDocument();
    });

    it("menambahkan produk valid tanpa gambar", async () => {
        const user = userEvent.setup();
        render(<ProductForm />);

        await fillValid(user);
        await user.click(submitButton());

        await waitFor(() => expect(mockAdd).toHaveBeenCalledTimes(1));

        expect(mockAdd.mock.calls[0][0]).toMatchObject({
            productName: "Keyboard",
            productCategory: category,
            description: "Mechanical keyboard",
            productPrice: 150000,
            productStock: 5,
        });

        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("menampilkan default image jika gambar tidak dipilih", () => {
        render(<ProductForm />);

        expect(screen.getByText("Default image")).toBeInTheDocument();
        expect(screen.getByText(/A default image is used if skipped/)).toBeInTheDocument();
        expect(screen.getByAltText("Product preview")).toHaveAttribute("src", DEFAULT_PRODUCT_IMAGE);
    });

    it("memilih dan menghapus gambar", async () => {
        const user = userEvent.setup();
        const { container } = render(<ProductForm />);

        const input = container.querySelector("input[type='file']") as HTMLInputElement;

        await user.upload(input, new File(["x"], "photo.png", { type: "image/png" }));

        expect(await screen.findByText("photo.png")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /remove/i }));

        await waitFor(() => expect(screen.queryByText("photo.png")).not.toBeInTheDocument());
    });

    it("menolak gambar melebihi batas ukuran", async () => {
        const user = userEvent.setup();
        const { container } = render(<ProductForm />);

        const input = container.querySelector("input[type='file']") as HTMLInputElement;
        const big = new File(["x"], "big.png", { type: "image/png" });

        Object.defineProperty(big, "size", {
            value: MAX_IMAGE_MB * 1024 * 1024 + 1,
        });

        await user.upload(input, big);

        expect(await screen.findByText(`Image must not exceed ${MAX_IMAGE_MB}MB`)).toBeInTheDocument();
    });

    it("memperbarui preview nama dan harga", async () => {
        const user = userEvent.setup();
        render(<ProductForm />);

        await user.type(screen.getByLabelText("Product name"), "Keyboard Pro");
        await user.type(screen.getByLabelText("Price"), "150000");

        expect(screen.getByText("Keyboard Pro")).toBeInTheDocument();
        expect(screen.getByText("Rp150.000")).toBeInTheDocument();
    });

    it("tombol Cancel mengarah ke daftar produk", () => {
        render(<ProductForm />);

        expect(screen.getAllByRole("button", { name: "Cancel" })[0]).toHaveAttribute(
            "href",
            "/seller/my-products",
        );
    });

    it("menonaktifkan input dan tombol ketika add pending", () => {
        mockHooks({ add: true, update: false });
        render(<ProductForm />);

        expect(screen.getByLabelText("Product name")).toBeDisabled();
        expect(submitButton()).toBeDisabled();
        expect(submitButton()).toHaveTextContent("Saving...");
    });

    it("menonaktifkan input dan tombol ketika update pending", () => {
        mockHooks({ add: false, update: true });
        render(<ProductForm product={existing} />);

        expect(screen.getByLabelText("Product name")).toBeDisabled();
        expect(submitButton()).toBeDisabled();
        expect(submitButton()).toHaveTextContent("Saving...");
    });

    it("menggunakan string kosong ketika category value undefined", () => {
        render(<ProductForm />);

        fireEvent.click(
            screen.getByRole("button", { name: "Clear category" }),
        );

        expect(screen.getByLabelText("Category")).toHaveValue("");
    });
});

describe("ProductForm: edit produk", () => {
    it("mengisi form dengan data produk", () => {
        render(<ProductForm product={existing} />);

        expect(screen.getByLabelText("Product name")).toHaveValue("Keyboard");
        expect(screen.getByLabelText("Description")).toHaveValue("Mechanical");
        expect(screen.getByLabelText("Price")).toHaveValue(150000);
        expect(screen.getByLabelText("Stock")).toHaveValue(5);
        expect(submitButton()).toHaveTextContent("Save changes");
    });

    it("menampilkan gambar produk saat ini", () => {
        render(<ProductForm product={existing} />);

        expect(screen.getByText("Current image")).toBeInTheDocument();
    });

    it("menampilkan badge default image pada produk dengan gambar default", () => {
        render(
            <ProductForm
                product={{
                    ...existing,
                    productImage: DEFAULT_PRODUCT_IMAGE,
                }}
            />,
        );

        expect(screen.getByText("Default image")).toBeInTheDocument();
        expect(screen.queryByText("Current image")).not.toBeInTheDocument();
    });

    it("memanggil update dengan id dan gambar lama", async () => {
        const user = userEvent.setup();
        render(<ProductForm product={existing} />);

        await user.clear(screen.getByLabelText("Product name"));
        await user.type(screen.getByLabelText("Product name"), "Keyboard V2");
        await user.click(submitButton());

        await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));

        expect(mockUpdate.mock.calls[0][0]).toMatchObject({
            id: "p1",
            data: {
                productName: "Keyboard V2",
                productImage: "https://img/old.png",
                productImagePublicId: "pub-old",
            },
        });

        expect(mockAdd).not.toHaveBeenCalled();
    });
});

describe("ProductForm: area upload gambar", () => {
    it("menerima drop file gambar", async () => {
        render(<ProductForm />);

        fireEvent.drop(uploadArea(), {
            dataTransfer: { files: [png()] },
        });

        expect(await screen.findByText("dropped.png")).toBeInTheDocument();
    });

    it("mengabaikan drop tanpa file", () => {
        render(<ProductForm />);

        fireEvent.drop(uploadArea(), {
            dataTransfer: { files: [] },
        });

        expect(screen.getByText("Default image")).toBeInTheDocument();
    });

    it("mengabaikan drop file bukan gambar", () => {
        render(<ProductForm />);

        fireEvent.drop(uploadArea(), {
            dataTransfer: {
                files: [new File(["x"], "doc.pdf", { type: "application/pdf" })],
            },
        });

        expect(screen.queryByText("doc.pdf")).not.toBeInTheDocument();
    });

    it("mengabaikan drop ketika pending", () => {
        mockHooks({ add: true, update: false });
        render(<ProductForm />);

        fireEvent.drop(uploadArea(), {
            dataTransfer: { files: [png()] },
        });

        expect(screen.queryByText("dropped.png")).not.toBeInTheDocument();
    });

    it("mengaktifkan status dragging saat dragOver", () => {
        render(<ProductForm />);

        fireEvent.dragOver(uploadArea());

        expect(uploadArea()).toHaveClass("border-primary");
        expect(uploadArea()).toHaveClass("bg-primary/5");
    });

    it("tidak mengaktifkan dragging ketika pending", () => {
        mockHooks({ add: true, update: false });
        render(<ProductForm />);

        fireEvent.dragOver(uploadArea());

        expect(uploadArea()).not.toHaveClass("bg-primary/5");
    });

    it("menghapus status dragging saat pointer keluar", () => {
        render(<ProductForm />);

        const area = uploadArea();

        fireEvent.dragOver(area);
        fireEvent.dragLeave(area);

        expect(area).not.toHaveClass("bg-primary/5");
    });

    it("mempertahankan status dragging saat pointer masih di dalam area", () => {
        render(<ProductForm />);

        const area = uploadArea();

        fireEvent.dragOver(area);

        const containsSpy = jest
            .spyOn(area, "contains")
            .mockReturnValue(true);

        fireEvent.dragLeave(area, {
            relatedTarget: document.createElement("span"),
        });

        expect(containsSpy).toHaveBeenCalled();
        expect(area).toHaveClass("bg-primary/5");

        containsSpy.mockRestore();
    });

    it("membuka file picker dengan Enter dan Space", () => {
        const { container } = render(<ProductForm />);
        const input = container.querySelector("input[type='file']") as HTMLInputElement;
        const clickSpy = jest.spyOn(input, "click");

        fireEvent.keyDown(uploadArea(), { key: "Enter" });
        fireEvent.keyDown(uploadArea(), { key: " " });

        expect(clickSpy).toHaveBeenCalledTimes(2);
    });

    it("tidak membuka file picker dengan tombol lain", () => {
        const { container } = render(<ProductForm />);
        const input = container.querySelector("input[type='file']") as HTMLInputElement;
        const clickSpy = jest.spyOn(input, "click");

        fireEvent.keyDown(uploadArea(), { key: "Escape" });

        expect(clickSpy).not.toHaveBeenCalled();
    });

    it("membuka file picker saat area diklik", () => {
        const { container } = render(<ProductForm />);
        const input = container.querySelector("input[type='file']") as HTMLInputElement;
        const clickSpy = jest.spyOn(input, "click");

        fireEvent.click(uploadArea());

        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it("tidak membuka file picker saat pending", () => {
        mockHooks({ add: true, update: false });

        const { container } = render(<ProductForm />);
        const input = container.querySelector("input[type='file']") as HTMLInputElement;
        const clickSpy = jest.spyOn(input, "click");

        fireEvent.click(uploadArea());
        fireEvent.keyDown(uploadArea(), { key: "Enter" });
        fireEvent.keyDown(uploadArea(), { key: " " });

        expect(clickSpy).not.toHaveBeenCalled();
    });

    it("mengabaikan perubahan input ketika tidak ada file", () => {
        const { container } = render(<ProductForm />);
        const input = container.querySelector("input[type='file']") as HTMLInputElement;

        fireEvent.change(input, {
            target: { files: [] },
        });

        expect(input.value).toBe("");
        expect(screen.getByText("Default image")).toBeInTheDocument();
    });

    it("mengabaikan input ketika file bernilai undefined", () => {
        const { container } = render(<ProductForm />);

        const input = container.querySelector(
            "input[type='file']",
        ) as HTMLInputElement;

        fireEvent.change(input, {
            target: { files: null },
        });

        expect(screen.getByText("Default image")).toBeInTheDocument();
        expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    });
});
