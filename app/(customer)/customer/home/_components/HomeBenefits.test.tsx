import { render, screen } from "@testing-library/react";
import HomeBenefits from "./HomeBenefits";

jest.mock("embla-carousel-autoplay", () => ({
    __esModule: true,
    default: jest.fn(() => "autoplay-plugin"),
}));

jest.mock("@/components/ui/carousel", () => ({
    Carousel: ({ children, plugins }: any) => (
        <div data-testid="carousel" data-plugins={plugins.join(",")}>
            {children}
        </div>
    ),
    CarouselContent: ({ children }: any) => <div>{children}</div>,
    CarouselItem: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/card", () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardContent: ({ children }: any) => <div>{children}</div>,
}));

describe("HomeBenefits", () => {
    it("menampilkan seluruh benefit", () => {
        render(<HomeBenefits />);

        expect(screen.getByText("Fast delivery")).toBeInTheDocument();
        expect(screen.getByText("Sent straight to your door")).toBeInTheDocument();

        expect(screen.getByText("Secure payment")).toBeInTheDocument();
        expect(screen.getByText("Your transactions are safe")).toBeInTheDocument();

        expect(screen.getByText("Trusted sellers")).toBeInTheDocument();
        expect(screen.getByText("Verified by Vendora")).toBeInTheDocument();

        expect(screen.getByText("Friendly support")).toBeInTheDocument();
        expect(screen.getByText("Here whenever you need help")).toBeInTheDocument();
    });

    it("menggunakan autoplay carousel", () => {
        render(<HomeBenefits />);

        expect(screen.getByTestId("carousel")).toHaveAttribute(
            "data-plugins",
            "autoplay-plugin",
        );
    });
});