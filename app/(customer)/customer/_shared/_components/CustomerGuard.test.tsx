
import { render, screen } from "@testing-library/react";
import CustomerGuard from "./CustomerGuard";
import { useRoleGuard } from "@/app/(authentication)/_shared/_hooks/useRoleGuard";

jest.mock("@/app/(authentication)/_shared/_hooks/useRoleGuard", () => ({
    useRoleGuard: jest.fn(),
}));

jest.mock("@/components/common/PageLoader", () => {
    return function MockPageLoader() {
        return <div data-testid="page-loader">Loading...</div>;
    };
});

const mockUseRoleGuard = useRoleGuard as jest.Mock;

describe("CustomerGuard", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("menampilkan PageLoader ketika guard belum siap", () => {
        mockUseRoleGuard.mockReturnValue({
            ready: false,
        });

        render(
            <CustomerGuard>
                <div>Customer Content</div>
            </CustomerGuard>,
        );

        expect(mockUseRoleGuard).toHaveBeenCalledWith("customer");
        expect(screen.getByTestId("page-loader")).toBeInTheDocument();
        expect(screen.queryByText("Customer Content")).not.toBeInTheDocument();
    });

    it("menampilkan children ketika guard sudah siap", () => {
        mockUseRoleGuard.mockReturnValue({
            ready: true,
        });

        render(
            <CustomerGuard>
                <div>Customer Content</div>
            </CustomerGuard>,
        );

        expect(mockUseRoleGuard).toHaveBeenCalledWith("customer");
        expect(screen.getByText("Customer Content")).toBeInTheDocument();
        expect(screen.queryByTestId("page-loader")).not.toBeInTheDocument();
    });
});
