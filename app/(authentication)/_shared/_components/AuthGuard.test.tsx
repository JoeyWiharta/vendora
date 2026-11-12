import { render, screen } from "@testing-library/react";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ replace: mockReplace }),
}));
jest.mock("@/components/common/PageLoader", () => ({
    __esModule: true,
    default: () => "page-loader",
}));
jest.mock("@/app/(seller)/seller/_constants/SellerSidebarMenu", () => ({
    SELLER_HOME_PATH: "/seller/test-home",
}));
jest.mock("@/app/(customer)/customer/_constants/CustomerNavMenu", () => ({
    CUSTOMER_HOME_PATH: "/customer/test-home",
}));

import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import AuthGuard from "./AuthGuard";

const renderGuard = () =>
    render(
        <AuthGuard>
            <p>form login</p>
        </AuthGuard>,
    );

beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, loading: true });
});

describe("AuthGuard", () => {
    it("saat loading: tampil loader, children disembunyikan, tidak redirect", () => {
        renderGuard();

        expect(screen.getByText("page-loader")).toBeInTheDocument();
        expect(screen.queryByText("form login")).not.toBeInTheDocument();
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it("belum login: menampilkan children", () => {
        useAuthStore.setState({ user: null, loading: false });
        renderGuard();

        expect(screen.getByText("form login")).toBeInTheDocument();
        expect(screen.queryByText("page-loader")).not.toBeInTheDocument();
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it.each([
        ["customer", "/customer/test-home"],
        ["seller", "/seller/test-home"],
    ] as const)("sudah login sebagai %s: children disembunyikan dan redirect ke %s", (role, path) => {
        useAuthStore.setState({ user: { uid: "u1", email: "a@b.com", role }, loading: false });
        renderGuard();

        expect(screen.queryByText("form login")).not.toBeInTheDocument();
        expect(screen.getByText("page-loader")).toBeInTheDocument();
        expect(mockReplace).toHaveBeenCalledWith(path);
    });
});