import { render, screen } from "@testing-library/react";
import ProductDetailView from "./ProductDetailView";

jest.mock("./ProductBackButton", () => ({ __esModule: true, default: () => <div>back-button</div> }));
jest.mock("./ProductDetailSkeleton", () => ({ __esModule: true, default: () => <div data-testid="skeleton" /> }));
jest.mock("./ProductDetailError", () => ({
    __esModule: true,
    default: ({ message }: { message?: string }) => <div>error-view:{message ?? "none"}</div>,
}));
jest.mock("./ProductOverview", () => ({
    __esModule: true,
    default: ({ product, children }: { product: { productName: string }; children: React.ReactNode }) => (
        <div data-testid="overview">
            {product.productName}
            {children}
        </div>
    ),
}));
jest.mock("./PurchasePanel", () => ({ __esModule: true, default: () => <div data-testid="panel" /> }));

const mockDetail = {
    data: undefined as unknown,
    isLoading: false,
    isError: false,
    error: null as Error | null,
};

const mockUseProductDetail = jest.fn((_id: string) => mockDetail);
jest.mock("../_hooks/useProductDetail", () => ({
    useProductDetail: (id: string) => mockUseProductDetail(id),
}));

beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(mockDetail, { data: undefined, isLoading: false, isError: false, error: null });
});

describe("ProductDetailView", () => {
    it("memanggil hook dengan id dari props", () => {
        render(<ProductDetailView id="abc" />);
        expect(mockUseProductDetail).toHaveBeenCalledWith("abc");
    });

    it("loading: menampilkan skeleton", () => {
        mockDetail.isLoading = true;
        render(<ProductDetailView id="abc" />);

        expect(screen.getByTestId("skeleton")).toBeInTheDocument();
        expect(screen.queryByTestId("overview")).not.toBeInTheDocument();
    });

    it("error: menampilkan error dengan pesannya", () => {
        mockDetail.isError = true;
        mockDetail.error = new Error("boom");
        render(<ProductDetailView id="abc" />);

        expect(screen.getByText("error-view:boom")).toBeInTheDocument();
    });

    it("produk tidak ditemukan: error tanpa pesan", () => {
        mockDetail.data = null;
        render(<ProductDetailView id="abc" />);

        expect(screen.getByText("error-view:none")).toBeInTheDocument();
    });

    it("sukses: tombol kembali, overview, dan purchase panel di dalamnya", () => {
        mockDetail.data = { productName: "Keyboard" };
        render(<ProductDetailView id="abc" />);

        expect(screen.getByText("back-button")).toBeInTheDocument();
        expect(screen.getByTestId("overview")).toHaveTextContent("Keyboard");
        expect(screen.getByTestId("overview")).toContainElement(screen.getByTestId("panel"));
    });
});