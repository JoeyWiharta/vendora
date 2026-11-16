
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useTheme } from "@wrksz/themes/client";
import { useSidebar } from "@/components/ui/sidebar";
import { useLogout } from "@/app/(authentication)/_shared/_hooks/useLogout";
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { toast } from "sonner";
import FooterSidebar from "./FooterSidebar";

jest.mock(
    "@wrksz/themes/client",
    () => ({
        useTheme: jest.fn(),
    }),
    { virtual: true },
);

jest.mock("@/components/ui/sidebar", () => ({
    SidebarFooter: ({ children }: any) => <div>{children}</div>,
    SidebarMenu: ({ children }: any) => <div>{children}</div>,
    SidebarMenuItem: ({ children }: any) => <div>{children}</div>,
    SidebarMenuButton: ({ children, ...props }: any) => (
        <button {...props}>{children}</button>
    ),
    useSidebar: jest.fn(),
}));

jest.mock("@/components/ui/avatar", () => ({
    Avatar: ({ children }: any) => <div>{children}</div>,
    AvatarFallback: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ render, children }: any) =>
        React.cloneElement(render, {}, children),
    DropdownMenuContent: ({ children, side, sideOffset, ...props }: any) => (
        <div data-testid="dropdown-content" data-side={side} {...props}>
            {children}
        </div>
    ),
    DropdownMenuItem: ({ children, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
    DropdownMenuSeparator: () => <hr />,
}));

jest.mock("@/components/ui/switch", () => ({
    Switch: ({ checked, ...props }: any) => (
        <input type="checkbox" checked={checked} readOnly {...props} />
    ),
}));

jest.mock("@/components/ui/tooltip", () => ({
    Tooltip: ({ children }: any) => <div>{children}</div>,
    TooltipTrigger: ({ render, children }: any) =>
        React.cloneElement(render, {}, children),
    TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/app/(authentication)/_shared/_hooks/useLogout", () => ({
    useLogout: jest.fn(),
}));

jest.mock("@/app/(authentication)/_shared/_store/authStore", () => ({
    useAuthStore: jest.fn(),
}));

jest.mock("sonner", () => ({
    toast: {
        info: jest.fn(),
    },
}));

describe("FooterSidebar", () => {
    const mockSetTheme = jest.fn();
    const mockLogout = jest.fn();

    const mockAuthStore = (
        user: { email: string; role: string } | null,
    ) => {
        (useAuthStore as unknown as jest.Mock).mockImplementation(
            (selector: (state: any) => any) => selector({ user }),
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();

        (useSidebar as jest.Mock).mockReturnValue({
            isMobile: false,
        });

        (useTheme as jest.Mock).mockReturnValue({
            resolvedTheme: "light",
            setTheme: mockSetTheme,
        });

        (useLogout as jest.Mock).mockReturnValue({
            mutate: mockLogout,
            isPending: false,
        });

        mockAuthStore({
            email: "seller@example.com",
            role: "seller",
        });
    });

    it("menampilkan email, role, dan avatar user", () => {
        render(<FooterSidebar />);

        expect(screen.getAllByText("seller@example.com")).toHaveLength(4);
        expect(screen.getAllByText("seller").length).toBeGreaterThan(0);
        expect(screen.getAllByText("S")).toHaveLength(2);
    });

    it("menggunakan nilai kosong ketika data user tidak tersedia", () => {
        mockAuthStore(null);

        render(<FooterSidebar />);

        expect(screen.queryByText("seller@example.com")).not.toBeInTheDocument();
        expect(screen.queryByText("seller")).not.toBeInTheDocument();
        expect(screen.getByTestId("dropdown-content")).toBeInTheDocument();
    });

    it("menampilkan dropdown di kanan ketika desktop", () => {
        render(<FooterSidebar />);

        expect(screen.getByTestId("dropdown-content"))
            .toHaveAttribute("data-side", "right");
    });

    it("menampilkan dropdown di atas ketika mobile", () => {
        (useSidebar as jest.Mock).mockReturnValue({
            isMobile: true,
        });

        render(<FooterSidebar />);

        expect(screen.getByTestId("dropdown-content"))
            .toHaveAttribute("data-side", "top");
    });

    it("menampilkan switch tidak aktif ketika theme light", () => {
        render(<FooterSidebar />);

        expect(screen.getByRole("checkbox", {
            name: "Toggle dark mode",
        })).not.toBeChecked();
    });

    it("menampilkan switch aktif ketika theme dark", () => {
        (useTheme as jest.Mock).mockReturnValue({
            resolvedTheme: "dark",
            setTheme: mockSetTheme,
        });

        render(<FooterSidebar />);

        expect(screen.getByRole("checkbox", {
            name: "Toggle dark mode",
        })).toBeChecked();
    });

    it("mengubah theme light menjadi dark", () => {
        render(<FooterSidebar />);

        fireEvent.click(screen.getByText("Dark mode"));

        expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });

    it("mengubah theme dark menjadi light", () => {
        (useTheme as jest.Mock).mockReturnValue({
            resolvedTheme: "dark",
            setTheme: mockSetTheme,
        });

        render(<FooterSidebar />);

        fireEvent.click(screen.getByText("Dark mode"));

        expect(mockSetTheme).toHaveBeenCalledWith("light");
    });

    it("menampilkan toast ketika Profile diklik", () => {
        render(<FooterSidebar />);

        fireEvent.click(screen.getByText("Profile"));

        expect(toast.info).toHaveBeenCalledWith("Profile coming soon");
    });

    it("memanggil logout ketika Log out diklik", () => {
        render(<FooterSidebar />);

        fireEvent.click(screen.getByText("Log out"));

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it("menampilkan Logging out ketika logout pending", () => {
        (useLogout as jest.Mock).mockReturnValue({
            mutate: mockLogout,
            isPending: true,
        });

        render(<FooterSidebar />);

        expect(screen.getByText("Logging out...")).toBeInTheDocument();
    });

    it("menonaktifkan tombol logout ketika logout pending", () => {
        (useLogout as jest.Mock).mockReturnValue({
            mutate: mockLogout,
            isPending: true,
        });

        render(<FooterSidebar />);

        expect(screen.getByText("Logging out...")).toBeDisabled();
    });
});
