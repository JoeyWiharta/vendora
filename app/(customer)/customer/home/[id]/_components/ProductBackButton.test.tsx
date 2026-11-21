import { render, screen } from "@testing-library/react";
import { CUSTOMER_HOME_PATH } from "../../../_shared/_constants/CustomerNavMenu";
import ProductBackButton from "./ProductBackButton";

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children, ...rest }: { href: string; children?: React.ReactNode }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

describe("ProductBackButton", () => {
    it("menampilkan link kembali ke home customer", () => {
        render(<ProductBackButton />);
        expect(screen.getByText("Back to home").closest("a")).toHaveAttribute("href", CUSTOMER_HOME_PATH);
    });
});