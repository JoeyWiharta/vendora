import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomeView from "./HomeView";

jest.mock("./HomeHero", () => ({ __esModule: true, default: () => <div data-testid="hero" /> }));
jest.mock("./HomeBenefits", () => ({ __esModule: true, default: () => <div data-testid="benefits" /> }));
jest.mock("./HomeFeedback", () => ({
    HomeEmpty: () => <div>empty-state</div>,
    HomeError: ({ message, onRetry, retrying }: { message: string; onRetry: () => void; retrying: boolean }) => (
        <div>
            <span>error:{message}</span>
            <span>retrying:{String(retrying)}</span>
            <button onClick={onRetry}>retry</button>
        </div>
    ),
}));
jest.mock("./HomeSection", () => ({
    __esModule: true,
    default: ({
        id,
        title,
        subtitle,
        children,
    }: {
        id: string;
        title: string;
        subtitle: string;
        children: React.ReactNode;
    }) => (
        <section data-testid={id}>
            <h2>{title}</h2>
            <p>{subtitle}</p>
            {children}
        </section>
    ),
}));
jest.mock("./ProductGrid", () => ({
    ProductGrid: ({ products, prioritizeFirst }: { products: unknown[]; prioritizeFirst?: boolean }) => (
        <div data-testid="grid" data-count={products.length} data-priority={String(!!prioritizeFirst)} />
    ),
    ProductGridSkeleton: () => <div data-testid="skeleton" />,
}));

const mockHome = {
    shuffled: [] as unknown[],
    recommended: [] as unknown[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: jest.fn(),
    isFetching: false,
};
jest.mock("../_hooks/useHomeProducts", () => ({ useHomeProducts: () => mockHome }));

beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(mockHome, {
        shuffled: [{}, {}, {}, {}, {}],
        recommended: [{}, {}, {}],
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
    });
});

describe("HomeView", () => {
    it("selalu menampilkan hero dan benefits", () => {
        render(<HomeView />);

        expect(screen.getByTestId("hero")).toBeInTheDocument();
        expect(screen.getByTestId("benefits")).toBeInTheDocument();
    });

    it("loading: section recommended dengan skeleton", () => {
        mockHome.isLoading = true;
        render(<HomeView />);

        expect(screen.getByText("Picking something for you...")).toBeInTheDocument();
        expect(screen.getByTestId("skeleton")).toBeInTheDocument();
        expect(screen.queryByTestId("all-products")).not.toBeInTheDocument();
    });

    it("error: menampilkan pesan dan retry memanggil refetch", async () => {
        mockHome.isError = true;
        mockHome.error = new Error("boom");
        mockHome.isFetching = true;
        render(<HomeView />);

        expect(screen.getByText("error:boom")).toBeInTheDocument();
        expect(screen.getByText("retrying:true")).toBeInTheDocument();

        await userEvent.click(screen.getByText("retry"));
        expect(mockHome.refetch).toHaveBeenCalledTimes(1);
    });

    it("tidak ada produk: menampilkan empty state", () => {
        mockHome.shuffled = [];
        render(<HomeView />);

        expect(screen.getByText("empty-state")).toBeInTheDocument();
        expect(screen.queryByTestId("recommended")).not.toBeInTheDocument();
    });

    it("sukses: recommended dan all products dengan jumlah yang benar", () => {
        render(<HomeView />);

        const recommended = screen.getByTestId("recommended");
        expect(within(recommended).getByText("3 random picks, just for you")).toBeInTheDocument();
        expect(within(recommended).getByTestId("grid")).toHaveAttribute("data-count", "3");

        const all = screen.getByTestId("all-products");
        expect(within(all).getByText("5 products available")).toBeInTheDocument();
        expect(within(all).getByTestId("grid")).toHaveAttribute("data-count", "5");
    });

    it("kedua grid memakai prioritizeFirst agar gambar LCP tidak lazy", () => {
        render(<HomeView />);

        expect(within(screen.getByTestId("recommended")).getByTestId("grid")).toHaveAttribute("data-priority", "true");
        expect(within(screen.getByTestId("all-products")).getByTestId("grid")).toHaveAttribute("data-priority", "true");
    });
});