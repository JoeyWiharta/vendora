import { fireEvent, render, screen } from "@testing-library/react";
import HomeHero from "./HomeHero";

const mockScrollIntoView = jest.fn();
const mockMatchMedia = jest.fn();

beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: mockMatchMedia,
    });

    Element.prototype.scrollIntoView = mockScrollIntoView;
});

beforeEach(() => {
    jest.clearAllMocks();

    mockMatchMedia.mockReturnValue({
        matches: false,
    });
});

describe("HomeHero", () => {
    it("menampilkan konten hero", () => {
        render(<HomeHero />);

        expect(screen.getByText("Fresh picks every visit")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "Find something you'll love",
        );
        expect(
            screen.getByText("Browse products from trusted sellers, all in one place."),
        ).toBeInTheDocument();

        expect(screen.getByText("4.9 trusted sellers")).toBeInTheDocument();
    });

    it("scroll ke recommended dengan smooth ketika reduced motion tidak aktif", () => {
        const target = document.createElement("div");
        target.id = "recommended";
        target.scrollIntoView = mockScrollIntoView;
        document.body.appendChild(target);

        render(<HomeHero />);

        fireEvent.click(screen.getByRole("button", { name: "Start shopping" }));

        expect(mockMatchMedia).toHaveBeenCalledWith(
            "(prefers-reduced-motion: reduce)",
        );
        expect(mockScrollIntoView).toHaveBeenCalledWith({
            behavior: "smooth",
            block: "start",
        });

        target.remove();
    });

    it("scroll ke all-products dengan auto ketika reduced motion aktif", () => {
        mockMatchMedia.mockReturnValue({
            matches: true,
        });

        const target = document.createElement("div");
        target.id = "all-products";
        target.scrollIntoView = mockScrollIntoView;
        document.body.appendChild(target);

        render(<HomeHero />);

        fireEvent.click(screen.getByRole("button", { name: "All products" }));

        expect(mockScrollIntoView).toHaveBeenCalledWith({
            behavior: "auto",
            block: "start",
        });

        target.remove();
    });

    it("tidak error ketika target section tidak ditemukan", () => {
        render(<HomeHero />);

        expect(() => {
            fireEvent.click(screen.getByRole("button", { name: "Start shopping" }));
        }).not.toThrow();
    });
});