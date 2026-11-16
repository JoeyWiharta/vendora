
import { render, screen } from "@testing-library/react";
import LayoutMainWrapper from "./LayoutMainWrapper";

describe("LayoutMainWrapper", () => {
    it("menampilkan title, description, action, dan children", () => {
        render(
            <LayoutMainWrapper
                title="My Products"
                description="Manage your products"
                action={<button>Add Product</button>}
            >
                <p>Product content</p>
            </LayoutMainWrapper>
        );

        expect(
            screen.getByRole("heading", { name: "My Products" })
        ).toBeInTheDocument();

        expect(
            screen.getByText("Manage your products")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Add Product" })
        ).toBeInTheDocument();

        expect(
            screen.getByText("Product content")
        ).toBeInTheDocument();
    });

    it("tidak menampilkan description dan action jika tidak diberikan", () => {
        render(
            <LayoutMainWrapper title="Dashboard">
                <p>Dashboard content</p>
            </LayoutMainWrapper>
        );

        expect(
            screen.getByRole("heading", { name: "Dashboard" })
        ).toBeInTheDocument();

        expect(
            screen.getByText("Dashboard content")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("Manage your products")
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole("button")
        ).not.toBeInTheDocument();
    });
});
