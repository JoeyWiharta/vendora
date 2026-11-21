import { render, screen } from "@testing-library/react";
import type { HomeProductTypes } from "../_types/homeProductTypes";
import { ProductGrid, ProductGridSkeleton } from "./ProductGrid";

jest.mock("./ProductCard", () => ({
    __esModule: true,
    default: ({ product, priority }: { product: { id: string }; priority: boolean }) => (
        <div data-testid="card" data-priority={String(priority)}>
            {product.id}
        </div>
    ),
}));

const makeProducts = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ id: `p${i}` })) as unknown as HomeProductTypes[];

describe("ProductGrid", () => {
    it("merender satu kartu per produk", () => {
        render(<ProductGrid products={makeProducts(3)} />);
        expect(screen.getAllByTestId("card")).toHaveLength(3);
    });

    it("tanpa prioritizeFirst: tidak ada kartu yang priority", () => {
        render(<ProductGrid products={makeProducts(7)} />);

        screen.getAllByTestId("card").forEach((card) => expect(card).toHaveAttribute("data-priority", "false"));
    });

    it("prioritizeFirst: hanya 5 kartu pertama yang priority", () => {
        render(<ProductGrid products={makeProducts(7)} prioritizeFirst />);

        const priorities = screen.getAllByTestId("card").map((c) => c.getAttribute("data-priority"));
        expect(priorities).toEqual(["true", "true", "true", "true", "true", "false", "false"]);
    });

    it("list kosong tidak error", () => {
        render(<ProductGrid products={[]} />);
        expect(screen.queryByTestId("card")).not.toBeInTheDocument();
    });
});

describe("ProductGridSkeleton", () => {
    it("default 10 skeleton", () => {
        const { container } = render(<ProductGridSkeleton />);
        expect(container.firstChild?.childNodes).toHaveLength(10);
    });

    it("jumlah skeleton bisa diatur", () => {
        const { container } = render(<ProductGridSkeleton count={4} />);
        expect(container.firstChild?.childNodes).toHaveLength(4);
    });
});