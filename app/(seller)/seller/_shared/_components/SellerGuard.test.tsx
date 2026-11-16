
import { render, screen } from "@testing-library/react";
import SellerGuard from "./SellerGuard";
import { useRoleGuard } from "@/app/(authentication)/_shared/_hooks/useRoleGuard";

jest.mock("@/components/common/PageLoader", () => ({
    __esModule: true,
    default: () => <div data-testid="page-loader">Loading...</div>,
}));

jest.mock("@/app/(authentication)/_shared/_hooks/useRoleGuard", () => ({
    useRoleGuard: jest.fn(),
}));

const mockedUseRoleGuard = jest.mocked(useRoleGuard);

describe("SellerGuard", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("menampilkan loader ketika guard belum ready", () => {
        mockedUseRoleGuard.mockReturnValue({
            ready: false,
        } as ReturnType<typeof useRoleGuard>);

        render(
            <SellerGuard>
                <div>Seller Dashboard</div>
            </SellerGuard>
        );

        expect(screen.getByTestId("page-loader")).toBeInTheDocument();
        expect(screen.queryByText("Seller Dashboard")).not.toBeInTheDocument();
        expect(mockedUseRoleGuard).toHaveBeenCalledWith("seller");
    });

    it("menampilkan children ketika guard sudah ready", () => {
        mockedUseRoleGuard.mockReturnValue({
            ready: true,
        } as ReturnType<typeof useRoleGuard>);

        render(
            <SellerGuard>
                <div>Seller Dashboard</div>
            </SellerGuard>
        );

        expect(screen.getByText("Seller Dashboard")).toBeInTheDocument();
        expect(screen.queryByTestId("page-loader")).not.toBeInTheDocument();
        expect(mockedUseRoleGuard).toHaveBeenCalledWith("seller");
    });
});
