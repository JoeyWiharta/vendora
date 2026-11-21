
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { formatRupiah } from "@/lib/formatter";
import type { CartItem } from "../../_shared/_types/cartTypes";
import CartView from "./CartView";

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({
        href,
        children,
        ...rest
    }: {
        href: string;
        children?: React.ReactNode;
    }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

jest.mock("./CartItemRow", () => ({
    __esModule: true,
    default: ({
        item,
        selected,
        onToggle,
    }: {
        item: { productId: string };
        selected: boolean;
        onToggle: () => void;
    }) => (
        <div
            data-testid={`row-${item.productId}`}
            data-selected={String(selected)}
        >
            <button onClick={onToggle}>toggle-{item.productId}</button>
        </div>
    ),
}));

const mockCart = {
    data: undefined as CartItem[] | undefined,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: jest.fn(),
    isFetching: false,
};

const mockCheckout = {
    mutate: jest.fn(),
    isPending: false,
};

jest.mock("../_hooks/useCart", () => ({
    useCartItems: () => mockCart,
}));

jest.mock("../_hooks/useCheckout", () => ({
    useCheckout: () => mockCheckout,
}));

const rp = (n: number) => formatRupiah(n).replace(/\s/g, " ");

const make = (
    productId: string,
    quantity: number,
    stock: number,
    price: number,
) =>
    ({
        productId,
        quantity,
        product: {
            id: productId,
            productName: productId,
            productPrice: price,
            productStock: stock,
        },
    }) as unknown as CartItem;

const itemA = make("a", 2, 10, 1000);
const itemB = make("b", 1, 10, 500);
const itemBad = make("c", 9, 5, 100);

const select = (name: string) => screen.getByTestId(`row-${name}`);

beforeEach(() => {
    jest.clearAllMocks();

    Object.assign(mockCart, {
        data: [itemA, itemB],
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
    });

    mockCheckout.isPending = false;
});

describe("CartView - state non-list", () => {
    it("loading: tidak menampilkan summary maupun empty state", () => {
        mockCart.isLoading = true;

        render(<CartView />);

        expect(screen.queryByText("Order summary")).not.toBeInTheDocument();
        expect(screen.queryByText("Your cart is empty")).not.toBeInTheDocument();
    });

    it("error: menampilkan pesan dan tombol retry", async () => {
        mockCart.isError = true;
        mockCart.error = new Error("Network down");

        render(<CartView />);

        expect(screen.getByText("Failed to load cart")).toBeInTheDocument();
        expect(screen.getByText("Network down")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Retry" }));

        expect(mockCart.refetch).toHaveBeenCalledTimes(1);
    });

    it("error: tombol retry disabled saat sedang fetching", () => {
        mockCart.isError = true;
        mockCart.error = new Error("x");
        mockCart.isFetching = true;

        render(<CartView />);

        expect(screen.getByRole("button", { name: "Retry" })).toBeDisabled();
    });

    it("kosong: menampilkan empty state dengan link ke home", () => {
        mockCart.data = [];

        render(<CartView />);

        expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
        expect(screen.getByText("Start shopping").closest("a")).toHaveAttribute(
            "href",
        );
    });

    it("data undefined: menggunakan fallback empty array", () => {
        mockCart.data = undefined;

        render(<CartView />);

        expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
        expect(screen.queryByText("Order summary")).not.toBeInTheDocument();
    });
});

describe("CartView - seleksi item", () => {
    it("semua item valid terpilih secara default", () => {
        render(<CartView />);

        expect(select("a")).toHaveAttribute("data-selected", "true");
        expect(select("b")).toHaveAttribute("data-selected", "true");
        expect(
            screen.getByRole("checkbox", { name: "Select all items" }),
        ).toBeChecked();
        expect(screen.getByText("2 of 2 selected")).toBeInTheDocument();
    });

    it("summary menghitung produk, total pcs, dan total harga", () => {
        render(<CartView />);

        expect(screen.getByText("3 pcs")).toBeInTheDocument();
        expect(screen.getByText(rp(2500))).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Purchase (2)" }),
        ).toBeEnabled();
    });

    it("meng-uncheck satu item memperbarui summary", async () => {
        render(<CartView />);

        await userEvent.click(screen.getByText("toggle-a"));

        expect(select("a")).toHaveAttribute("data-selected", "false");
        expect(screen.getByText("1 of 2 selected")).toBeInTheDocument();
        expect(screen.getByText("1 pcs")).toBeInTheDocument();
        expect(screen.getByText(rp(500))).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Purchase (1)" }),
        ).toBeInTheDocument();
    });

    it("meng-check ulang item yang tadi di-uncheck", async () => {
        render(<CartView />);

        await userEvent.click(screen.getByText("toggle-a"));
        await userEvent.click(screen.getByText("toggle-a"));

        expect(select("a")).toHaveAttribute("data-selected", "true");
        expect(
            screen.getByRole("button", { name: "Purchase (2)" }),
        ).toBeInTheDocument();
    });

    it("select all: uncheck semua lalu check semua", async () => {
        render(<CartView />);

        const selectAll = screen.getByRole("checkbox", {
            name: "Select all items",
        });

        await userEvent.click(selectAll);

        expect(select("a")).toHaveAttribute("data-selected", "false");
        expect(select("b")).toHaveAttribute("data-selected", "false");
        expect(
            screen.getByRole("button", { name: "Purchase" }),
        ).toBeDisabled();
        expect(
            screen.getByText("Select at least one item to purchase."),
        ).toBeInTheDocument();

        await userEvent.click(selectAll);

        expect(select("a")).toHaveAttribute("data-selected", "true");
        expect(select("b")).toHaveAttribute("data-selected", "true");
    });

    it("select all saat sebagian terpilih akan memilih semuanya", async () => {
        render(<CartView />);

        await userEvent.click(screen.getByText("toggle-a"));
        await userEvent.click(
            screen.getByRole("checkbox", { name: "Select all items" }),
        );

        expect(select("a")).toHaveAttribute("data-selected", "true");
        expect(select("b")).toHaveAttribute("data-selected", "true");
    });
});

describe("CartView - item bermasalah", () => {
    beforeEach(() => {
        mockCart.data = [itemA, itemBad];
    });

    it("item bermasalah tidak terpilih dan diberi peringatan", () => {
        render(<CartView />);

        expect(select("c")).toHaveAttribute("data-selected", "false");
        expect(
            screen.getByText(
                /1 item\(s\) can't be purchased/,
            ),
        ).toBeInTheDocument();
        expect(screen.getByText("1 of 2 selected")).toBeInTheDocument();
    });

    it("item bermasalah tidak ikut dihitung di total", () => {
        render(<CartView />);

        expect(screen.getByText(rp(2000))).toBeInTheDocument();
    });

    it("kalau semua item bermasalah: tombol disabled dan tanpa hint pilih item", () => {
        mockCart.data = [itemBad];

        render(<CartView />);

        expect(
            screen.getByRole("button", { name: "Purchase" }),
        ).toBeDisabled();
        expect(
            screen.queryByText("Select at least one item to purchase."),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("checkbox", { name: "Select all items" }),
        ).not.toBeChecked();
    });
});

describe("CartView - purchase", () => {
    it("mengirim semua item terpilih", async () => {
        render(<CartView />);

        await userEvent.click(
            screen.getByRole("button", { name: "Purchase (2)" }),
        );

        expect(mockCheckout.mutate).toHaveBeenCalledWith([itemA, itemB]);
    });

    it("hanya mengirim item yang dicentang", async () => {
        render(<CartView />);

        await userEvent.click(screen.getByText("toggle-a"));
        await userEvent.click(
            screen.getByRole("button", { name: "Purchase (1)" }),
        );

        expect(mockCheckout.mutate).toHaveBeenCalledTimes(1);
        expect(mockCheckout.mutate).toHaveBeenCalledWith([itemB]);
    });

    it("tidak pernah mengirim item bermasalah", async () => {
        mockCart.data = [itemA, itemBad];

        render(<CartView />);

        await userEvent.click(
            screen.getByRole("button", { name: "Purchase (1)" }),
        );

        expect(mockCheckout.mutate).toHaveBeenCalledWith([itemA]);
    });

    it("saat processing: tombol disabled dan teks berubah", () => {
        mockCheckout.isPending = true;

        render(<CartView />);

        const button = screen.getByRole("button", {
            name: /Processing\.\.\./,
        });

        expect(button).toBeDisabled();
        expect(
            screen.getByRole("checkbox", { name: "Select all items" }),
        ).toBeInTheDocument();
    });
});
