import { render, screen, fireEvent } from "@testing-library/react";
import { toast } from "sonner";
import LayoutHeader from "./LayoutHeader";

jest.mock("sonner", () => ({
    toast: {
        info: jest.fn(),
    },
}));

jest.mock("@/components/ui/button", () => ({
    Button: ({ children, ...props }: any) => (
        <button {...props}>{children}</button>
    ),
}));

jest.mock("@/components/ui/sidebar", () => ({
    SidebarTrigger: ({ className }: any) => (
        <button
            type="button"
            aria-label="Toggle sidebar"
            className={className}
        />
    ),
}));

describe("LayoutHeader", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("merender header dengan class yang sesuai", () => {
        render(<LayoutHeader />);

        const header = screen.getByRole("banner");

        expect(header).toHaveClass(
            "sticky",
            "top-0",
            "z-20",
            "flex",
            "h-14",
            "px-4",
            "shrink-0",
            "items-center",
            "bg-background/80",
            "backdrop-blur",
            "supports-backdrop-filter:bg-background/60",
        );
    });

    it("menampilkan tombol sidebar", () => {
        render(<LayoutHeader />);

        expect(
            screen.getByRole("button", { name: "Toggle sidebar" }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Toggle sidebar" }),
        ).toHaveClass(
            "-ml-1",
            "size-8",
            "rounded-lg",
            "text-muted-foreground",
            "transition-colors",
            "hover:bg-primary/10",
            "hover:text-primary",
        );
    });

    it("menampilkan tombol Notifications", () => {
        render(<LayoutHeader />);

        const notificationButton = screen.getByRole("button", {
            name: "Notifications",
        });

        expect(notificationButton).toBeInTheDocument();
        expect(notificationButton).toHaveClass(
            "ml-auto",
            "size-8",
            "rounded-full",
            "text-muted-foreground",
            "hover:bg-primary/10",
            "hover:text-primary",
        );
    });

    it("menampilkan toast ketika tombol Notifications diklik", () => {
        render(<LayoutHeader />);

        fireEvent.click(
            screen.getByRole("button", { name: "Notifications" }),
        );

        expect(toast.info).toHaveBeenCalledTimes(1);
        expect(toast.info).toHaveBeenCalledWith(
            "Notifications coming soon",
        );
    });
});