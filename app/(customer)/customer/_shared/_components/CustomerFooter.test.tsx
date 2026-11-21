
import { render, screen } from "@testing-library/react";
import CustomerFooter from "./CustomerFooter";

jest.mock("@/components/common/CurrentYear", () => {
    return function MockCurrentYear() {
        return <span>2026</span>;
    };
});

describe("CustomerFooter", () => {
    it("menampilkan copyright dengan tahun saat ini dan nama Vendora", () => {
        render(<CustomerFooter />);

        const footer = screen.getByRole("contentinfo");

        expect(footer).toBeInTheDocument();
        expect(footer).toHaveTextContent("© 2026 Vendora. All rights reserved.");
    });

    it("menggunakan class responsive yang sesuai", () => {
        render(<CustomerFooter />);

        const footer = screen.getByRole("contentinfo");

        expect(footer).toHaveClass("hidden", "sm:flex");
        expect(footer).toHaveClass("mx-auto", "w-full");
    });
});
