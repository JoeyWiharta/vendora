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
import HomeRedirect from "./HomeRedirect";

beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, loading: true });
});

describe("HomeRedirect", () => {
    it("selalu menampilkan loader", () => {
        render(<HomeRedirect />);
        expect(screen.getByText("page-loader")).toBeInTheDocument();
    });

    it("saat loading: belum redirect", () => {
        render(<HomeRedirect />);
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it("belum login: redirect ke /login", () => {
        useAuthStore.setState({ user: null, loading: false });
        render(<HomeRedirect />);
        expect(mockReplace).toHaveBeenCalledWith("/login");
    });

    it.each([
        ["customer", "/customer/test-home"],
        ["seller", "/seller/test-home"],
    ] as const)("sudah login sebagai %s: redirect ke %s", (role, path) => {
        useAuthStore.setState({ user: { uid: "u1", email: "a@b.com", role }, loading: false });
        render(<HomeRedirect />);
        expect(mockReplace).toHaveBeenCalledWith(path);
    });
});