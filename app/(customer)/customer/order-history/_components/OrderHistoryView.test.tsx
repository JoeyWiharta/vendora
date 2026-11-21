
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderHistoryView from "./OrderHistoryView";

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children, ...rest }: { href: string; children?: React.ReactNode }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

jest.mock("./OrderCard", () => ({
    __esModule: true,
    default: ({ order }: { order: { id: string } }) => (
        <div data-testid="order-card">{order.id}</div>
    ),
}));

const mockOrders = {
    data: undefined as { id: string }[] | undefined,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: jest.fn(),
    isFetching: false,
};

jest.mock("../_hooks/useOrders", () => ({
    useOrders: () => mockOrders,
}));

beforeEach(() => {
    jest.clearAllMocks();

    Object.assign(mockOrders, {
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
    });
});

describe("OrderHistoryView", () => {
    it("loading: menampilkan skeleton dan tidak menampilkan list maupun empty state", () => {
        mockOrders.isLoading = true;

        const { container } = render(<OrderHistoryView />);

        expect(container.querySelectorAll("[data-slot='skeleton']")).toHaveLength(2);
        expect(screen.queryByTestId("order-card")).not.toBeInTheDocument();
        expect(screen.queryByText("No orders yet")).not.toBeInTheDocument();
    });

    it("error: menampilkan pesan dan retry memanggil refetch", async () => {
        mockOrders.isError = true;
        mockOrders.error = new Error("Gagal memuat");

        render(<OrderHistoryView />);

        expect(screen.getByText("Failed to load orders")).toBeInTheDocument();
        expect(screen.getByText("Gagal memuat")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Retry" }));

        expect(mockOrders.refetch).toHaveBeenCalledTimes(1);
    });

    it("error: retry disabled saat fetching", () => {
        mockOrders.isError = true;
        mockOrders.error = new Error("Gagal memuat");
        mockOrders.isFetching = true;

        render(<OrderHistoryView />);

        expect(screen.getByRole("button", { name: "Retry" })).toBeDisabled();
    });

    it("kosong: menampilkan empty state dengan link ke home", () => {
        mockOrders.data = [];

        render(<OrderHistoryView />);

        expect(screen.getByText("No orders yet")).toBeInTheDocument();
        expect(screen.getByText("Start shopping").closest("a")).toHaveAttribute("href");
    });

    it("kosong: menampilkan empty state ketika data orders undefined", () => {
        mockOrders.data = undefined;

        render(<OrderHistoryView />);

        expect(screen.getByText("No orders yet")).toBeInTheDocument();
        expect(screen.getByText("Start shopping")).toBeInTheDocument();
    });

    it("menampilkan satu kartu per order", () => {
        mockOrders.data = [
            { id: "o1" },
            { id: "o2" },
            { id: "o3" },
        ];

        render(<OrderHistoryView />);

        expect(screen.getAllByTestId("order-card")).toHaveLength(3);
        expect(screen.getByText("o2")).toBeInTheDocument();
    });
});
