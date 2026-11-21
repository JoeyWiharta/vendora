import { render, screen } from "@testing-library/react";
import { ShoppingBag } from "lucide-react";
import HomeSection from "./HomeSection";

describe("HomeSection", () => {
    it("menampilkan title, subtitle, dan children", () => {
        render(
            <HomeSection
                icon={ShoppingBag}
                title="Recommended products"
                subtitle="Products picked for you"
            >
                <div data-testid="section-content">Product list</div>
            </HomeSection>,
        );

        expect(
            screen.getByRole("heading", { name: "Recommended products" }),
        ).toBeInTheDocument();

        expect(screen.getByText("Products picked for you")).toBeInTheDocument();
        expect(screen.getByTestId("section-content")).toHaveTextContent("Product list");
    });

    it("menggunakan id section ketika diberikan", () => {
        render(
            <HomeSection
                id="recommended"
                icon={ShoppingBag}
                title="Recommended"
            >
                Content
            </HomeSection>,
        );

        expect(document.getElementById("recommended")).toBeInTheDocument();
    });

    it("tidak menampilkan subtitle ketika tidak diberikan", () => {
        render(
            <HomeSection icon={ShoppingBag} title="All products">
                Content
            </HomeSection>,
        );

        expect(screen.getByRole("heading", { name: "All products" })).toBeInTheDocument();
        expect(screen.queryByText("Products picked for you")).not.toBeInTheDocument();
    });

    it("menampilkan action ketika diberikan", () => {
        render(
            <HomeSection
                icon={ShoppingBag}
                title="All products"
                action={<button type="button">View all</button>}
            >
                Content
            </HomeSection>,
        );

        expect(screen.getByRole("button", { name: "View all" })).toBeInTheDocument();
    });
});