import { render, screen } from "@testing-library/react";

jest.mock("@lottiefiles/dotlottie-react", () => ({
    DotLottieReact: () => <div data-testid="lottie" />,
}));

import AuthIllustration from "./AuthIllustration";

describe("AuthIllustration", () => {
    it("menampilkan logo Vendora", () => {
        render(<AuthIllustration />);
        expect(screen.getByAltText("Vendora logo")).toBeInTheDocument();
    });

    it("menampilkan animasi lottie", () => {
        render(<AuthIllustration />);
        expect(screen.getByTestId("lottie")).toBeInTheDocument();
    });
});