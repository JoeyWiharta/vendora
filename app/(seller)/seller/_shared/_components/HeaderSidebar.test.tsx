
import { render, screen } from "@testing-library/react";
import { useSidebar } from "@/components/ui/sidebar";
import HeaderSidebar from "./HeaderSidebar";

jest.mock("next/image", () => ({
    __esModule: true,
    default: ({ priority, ...props }: any) => <img {...props} />,
}));

jest.mock("@/components/ui/sidebar", () => ({
    SidebarHeader: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
    ),
    useSidebar: jest.fn(),
}));

describe("HeaderSidebar", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("menampilkan logo dan nama Vendora ketika sidebar terbuka", () => {
        (useSidebar as jest.Mock).mockReturnValue({
            state: "expanded",
        });

        render(<HeaderSidebar />);

        expect(screen.getByText("Vendora")).toBeInTheDocument();

        const logo = screen.getByRole("img", {
            name: "Vendora logo",
        });

        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute("draggable", "false");
        expect(logo.className).toContain("size-8");
    });

    it("hanya menampilkan logo ketika sidebar collapsed", () => {
        (useSidebar as jest.Mock).mockReturnValue({
            state: "collapsed",
        });

        render(<HeaderSidebar />);

        expect(screen.queryByText("Vendora")).not.toBeInTheDocument();

        const logo = screen.getByRole("img", {
            name: "Vendora logo",
        });

        expect(logo).toBeInTheDocument();
        expect(logo.className).toContain("size-7");

        expect(logo.parentElement?.className).toContain("justify-center");
        expect(logo.parentElement?.className).toContain("px-0");
    });
});
