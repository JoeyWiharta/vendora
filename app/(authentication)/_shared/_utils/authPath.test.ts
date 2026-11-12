jest.mock("@/app/(seller)/seller/_constants/SellerSidebarMenu", () => ({
    SELLER_HOME_PATH: "/seller/test-home",
}));
jest.mock("@/app/(customer)/customer/_constants/CustomerNavMenu", () => ({
    CUSTOMER_HOME_PATH: "/customer/test-home",
}));

import { authPath } from "./authPath";

describe("authPath", () => {
    it("mengarahkan seller ke home seller", () => {
        expect(authPath("seller")).toBe("/seller/test-home");
    });

    it("mengarahkan customer ke home customer", () => {
        expect(authPath("customer")).toBe("/customer/test-home");
    });
});