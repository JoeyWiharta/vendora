
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import ContentSidebar from "./ContentSidebar";

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

jest.mock("next/navigation", () => ({
    usePathname: jest.fn(),
}));

jest.mock("@/components/ui/sidebar", () => ({
    SidebarContent: ({ children }: any) => <div>{children}</div>,
    SidebarGroup: ({ children }: any) => <div>{children}</div>,
    SidebarGroupContent: ({ children }: any) => <div>{children}</div>,
    SidebarGroupLabel: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
    ),
    SidebarMenu: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
    ),
    SidebarMenuItem: ({ children }: any) => <div>{children}</div>,
    SidebarMenuButton: ({ render, children, onClick, isActive, ...props }: any) =>
        React.cloneElement(render, {
            ...props,
            onClick,
            "data-active": String(isActive),
        }, children),
    useSidebar: jest.fn(),
}));

jest.mock("../_constants/sellerMenu", () => {
    const { Package, ShoppingCart } = require("lucide-react");

    return {
        SELLER_MENU: [
            {
                label: "My Products",
                href: "/seller/my-products",
                icon: Package,
            },
            {
                label: "Incoming Orders",
                href: "/seller/incoming-orders",
                icon: ShoppingCart,
            },
        ],
    };
});

describe("ContentSidebar", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (useSidebar as jest.Mock).mockReturnValue({
            state: "expanded",
        });

        (usePathname as jest.Mock).mockReturnValue("/seller/my-products");
    });

    it("menampilkan Main Menu ketika sidebar terbuka", () => {
        render(<ContentSidebar />);

        expect(screen.getByText("Main Menu")).toBeInTheDocument();
    });

    it("menampilkan Menu ketika sidebar collapsed", () => {
        (useSidebar as jest.Mock).mockReturnValue({
            state: "collapsed",
        });

        render(<ContentSidebar />);

        expect(screen.getByText("Menu")).toBeInTheDocument();
    });

    it("menampilkan seluruh menu Seller", () => {
        render(<ContentSidebar />);

        expect(screen.getByText("My Products")).toBeInTheDocument();
        expect(screen.getByText("Incoming Orders")).toBeInTheDocument();
    });

    it("memberikan status active pada menu sesuai pathname", () => {
        render(<ContentSidebar />);

        expect(screen.getByRole("link", { name: "My Products" }))
            .toHaveAttribute("data-active", "true");

        expect(screen.getByRole("link", { name: "Incoming Orders" }))
            .toHaveAttribute("data-active", "false");
    });

    it("tetap menganggap menu aktif ketika pathname merupakan subroute", () => {
        (usePathname as jest.Mock).mockReturnValue(
            "/seller/my-products/edit/product-1",
        );

        render(<ContentSidebar />);

        expect(screen.getByRole("link", { name: "My Products" }))
            .toHaveAttribute("data-active", "true");
    });

    it("menampilkan indikator active ketika menu aktif", () => {
        const { container } = render(<ContentSidebar />);

        expect(container.querySelector(".bg-primary")).toBeInTheDocument();
    });

    it("menggunakan posisi indikator berbeda ketika collapsed", () => {
        (useSidebar as jest.Mock).mockReturnValue({
            state: "collapsed",
        });

        const { container } = render(<ContentSidebar />);

        expect(container.querySelector(".-left-3")).toBeInTheDocument();
    });

    it("menggunakan posisi indikator ketika sidebar terbuka", () => {
        const { container } = render(<ContentSidebar />);

        expect(container.querySelector(".-left-2")).toBeInTheDocument();
    });

    it("mencegah navigasi ketika menu aktif diklik", () => {
        render(<ContentSidebar />);

        const link = screen.getByRole("link", {
            name: "My Products",
        });

        const event = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
        });

        link.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
    });

    it("tidak mencegah navigasi ketika menu tidak aktif diklik", () => {
        render(<ContentSidebar />);

        const link = screen.getByRole("link", {
            name: "Incoming Orders",
        });

        const event = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
        });

        link.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
    });
});
