import { render, screen } from "@testing-library/react";
import LayoutFooter from "./LayoutFooter";

jest.mock("@/components/common/CurrentYear", () => ({
    __esModule: true,
    default: () => <span data-testid="current-year">2026</span>,
}));

describe("LayoutFooter", () => {
    it("menampilkan copyright, tahun saat ini, dan nama Vendora", () => {
        render(<LayoutFooter />);

        expect(screen.getByText("©", { exact: false })).toBeInTheDocument();
        expect(screen.getByTestId("current-year")).toHaveTextContent("2026");
        expect(
            screen.getByText(/Vendora\. All rights reserved\./),
        ).toBeInTheDocument();
    });

    it("merender elemen footer dengan class yang sesuai", () => {
        render(<LayoutFooter />);

        const footer = screen.getByRole("contentinfo");

        expect(footer).toHaveClass(
            "text-left",
            "text-xs",
            "text-muted-foreground",
            "py-4",
            "px-4",
            "md:px-6",
        );
    });
});