
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import CustomerHeader from "./CustomerHeader";
import { usePathname } from "next/navigation";
import { useTheme } from "@wrksz/themes/client";
import { useLogout } from "@/app/(authentication)/_shared/_hooks/useLogout";
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";

const mockSetTheme = jest.fn();
const mockLogout = jest.fn();

type MockAuthState = {
    user: {
        email: string;
        role: string;
    } | null;
};

let mockAuthState: MockAuthState = {
    user: {
        email: "customer@vendora.com",
        role: "customer",
    },
};

let mockTheme = "light";
let mockIsPending = false;

jest.mock("next/navigation", () => ({
    usePathname: jest.fn(),
}));

jest.mock(
    "@wrksz/themes/client",
    () => ({
        useTheme: jest.fn(),
    }),
    { virtual: true },
);

jest.mock("@/app/(authentication)/_shared/_hooks/useLogout", () => ({
    useLogout: jest.fn(),
}));

jest.mock("@/app/(authentication)/_shared/_store/authStore", () => ({
    useAuthStore: jest.fn(),
}));


jest.mock("next/image", () => ({
    __esModule: true,
    default: ({
        priority: _priority,
        ...props
    }: React.ImgHTMLAttributes<HTMLImageElement> & {
        priority?: boolean;
    }) => <img {...props} />,
}));


jest.mock("next/link", () => ({
    __esModule: true,
    default: ({
        children,
        href,
        ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        href: string;
    }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

jest.mock("@/assets/logo/vendora-logo.svg", () => "vendora-logo.svg");

jest.mock("@/components/ui/avatar", () => ({
    Avatar: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    AvatarFallback: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
    ),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    DropdownMenuTrigger: ({
        children,
        ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button {...props}>{children}</button>
    ),
    DropdownMenuContent: ({
        children,
    }: {
        children: React.ReactNode;
    }) => <div>{children}</div>,
    DropdownMenuItem: ({
        children,
        onClick,
        disabled,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
    }) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
    DropdownMenuSeparator: () => <hr />,
}));

jest.mock("@/components/ui/switch", () => ({
    Switch: ({
        checked,
        ...props
    }: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input type="checkbox" checked={checked} readOnly {...props} />
    ),
}));

jest.mock("@/components/ui/tooltip", () => ({
    Tooltip: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    TooltipTrigger: ({
        children,
        render,
    }: {
        children: React.ReactNode;
        render: React.ReactElement;
    }) => React.cloneElement(render, {}, children),
    TooltipContent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}));

jest.mock("@/components/ui/separator", () => ({
    Separator: () => <hr />,
}));

jest.mock("@/lib/utils", () => ({
    cn: (...classes: (string | false | undefined)[]) =>
        classes.filter(Boolean).join(" "),
}));

const mockUsePathname = usePathname as unknown as jest.Mock;
const mockUseTheme = useTheme as unknown as jest.Mock;
const mockUseLogout = useLogout as unknown as jest.Mock;
const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

describe("CustomerHeader", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockAuthState = {
            user: {
                email: "customer@vendora.com",
                role: "customer",
            },
        };

        mockTheme = "light";
        mockIsPending = false;

        mockUsePathname.mockReturnValue("/customer");

        mockUseTheme.mockImplementation(() => ({
            resolvedTheme: mockTheme,
            setTheme: mockSetTheme,
        }));

        mockUseLogout.mockReturnValue({
            mutate: mockLogout,
            isPending: mockIsPending,
        });

        mockUseAuthStore.mockImplementation(
            (selector: (state: MockAuthState) => unknown) =>
                selector(mockAuthState),
        );
    });

    it("menampilkan logo dan navigasi customer", () => {
        render(<CustomerHeader />);

        expect(screen.getByAltText("Vendora logo")).toBeInTheDocument();
        expect(
            screen.getByRole("navigation", { name: "Main navigation" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("navigation", { name: "Mobile navigation" }),
        ).toBeInTheDocument();
    });

    it("menampilkan informasi akun dan inisial email", () => {
        render(<CustomerHeader />);

        expect(
            screen.getAllByText("customer@vendora.com").length,
        ).toBeGreaterThan(0);
        expect(screen.getAllByText("customer").length).toBeGreaterThan(0);
        expect(screen.getAllByText("C").length).toBeGreaterThan(0);
    });

    it("menggunakan fallback ketika user tidak tersedia", () => {
        mockAuthState = {
            user: null,
        };

        render(<CustomerHeader />);

        expect(
            screen.getByRole("button", { name: "Open account menu" }),
        ).toBeInTheDocument();
        expect(screen.getByText("customer")).toBeInTheDocument();
    });

    it("menandai navigasi yang sedang aktif berdasarkan pathname", () => {
        mockUsePathname.mockReturnValue("/customer/cart");

        render(<CustomerHeader />);

        const activeLinks = screen.getAllByRole("link").filter(
            (link) => link.getAttribute("aria-current") === "page",
        );

        expect(activeLinks.length).toBeGreaterThan(0);
        expect(
            activeLinks.every(
                (link) => link.getAttribute("href") === "/customer/cart",
            ),
        ).toBe(true);
    });

    it("tidak menandai navigasi sebagai aktif ketika pathname tidak cocok", () => {
        mockUsePathname.mockReturnValue("/unknown");

        render(<CustomerHeader />);

        const activeLinks = screen.getAllByRole("link").filter(
            (link) => link.getAttribute("aria-current") === "page",
        );

        expect(activeLinks).toHaveLength(0);
    });

    it("mengubah tema dari light menjadi dark", () => {
        render(<CustomerHeader />);

        fireEvent.click(screen.getByText("Dark mode"));

        expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });

    it("mengubah tema dari dark menjadi light", () => {
        mockTheme = "dark";

        render(<CustomerHeader />);

        fireEvent.click(screen.getByText("Dark mode"));

        expect(mockSetTheme).toHaveBeenCalledWith("light");
    });

    it("menampilkan switch dark mode dalam keadaan tidak aktif", () => {
        render(<CustomerHeader />);

        expect(
            screen.getByRole("checkbox", { name: "Toggle dark mode" }),
        ).not.toBeChecked();
    });

    it("menampilkan switch dark mode dalam keadaan aktif", () => {
        mockTheme = "dark";

        render(<CustomerHeader />);

        expect(
            screen.getByRole("checkbox", { name: "Toggle dark mode" }),
        ).toBeChecked();
    });

    it("menjalankan logout ketika tombol Log out diklik", () => {
        render(<CustomerHeader />);

        fireEvent.click(screen.getByText("Log out"));

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it("menampilkan Logging out dan menonaktifkan tombol ketika logout pending", () => {
        mockIsPending = true;

        mockUseLogout.mockReturnValue({
            mutate: mockLogout,
            isPending: mockIsPending,
        });

        render(<CustomerHeader />);

        const logoutButton = screen.getByRole("button", {
            name: "Logging out...",
        });

        expect(logoutButton).toBeDisabled();

        fireEvent.click(logoutButton);

        expect(mockLogout).not.toHaveBeenCalled();
    });
});
