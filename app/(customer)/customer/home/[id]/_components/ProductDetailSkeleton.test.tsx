import { render } from "@testing-library/react";
import ProductDetailSkeleton from "./ProductDetailSkeleton";

describe("ProductDetailSkeleton", () => {
    it("merender kerangka loading (header + dua kolom)", () => {
        const { container } = render(<ProductDetailSkeleton />);

        expect(container.firstChild).toBeInTheDocument();
        expect(container.firstChild?.childNodes).toHaveLength(2);
    });
});