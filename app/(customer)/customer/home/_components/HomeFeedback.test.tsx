import { fireEvent, render, screen } from "@testing-library/react";
import { HomeEmpty, HomeError } from "./HomeFeedback";

describe("HomeError", () => {
    it("menampilkan pesan error dan tombol retry", () => {
        const onRetry = jest.fn();

        render(
            <HomeError
                message="Something went wrong"
                onRetry={onRetry}
                retrying={false}
            />,
        );

        expect(screen.getByText("Failed to load products")).toBeInTheDocument();
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();

        const button = screen.getByRole("button", { name: "Retry" });

        expect(button).toBeEnabled();

        fireEvent.click(button);

        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("menampilkan kondisi retrying dan menonaktifkan tombol", () => {
        const onRetry = jest.fn();

        render(
            <HomeError
                message="Something went wrong"
                onRetry={onRetry}
                retrying
            />,
        );

        const button = screen.getByRole("button", { name: "Retrying..." });

        expect(button).toBeDisabled();

        fireEvent.click(button);

        expect(onRetry).not.toHaveBeenCalled();
    });
});

describe("HomeEmpty", () => {
    it("menampilkan informasi ketika produk kosong", () => {
        render(<HomeEmpty />);

        expect(screen.getByText("No products available yet")).toBeInTheDocument();
        expect(
            screen.getByText("Check back soon, new products are added regularly."),
        ).toBeInTheDocument();
    });
});