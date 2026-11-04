
export const instant = false;

import SellerMainWrapper from "../_components/_layout/SellerMainWrapper";
import ProductListView from "../_components/common/ProductListView";

const MyProductsPage = () => {
    return (
        <SellerMainWrapper
            breadcrumbs={[{ label: "Seller", href: "/seller/my-products" }, { label: "My Products" }]}
            title="My Products"
            description="Manage the products you sell."
        >
            <ProductListView />
        </SellerMainWrapper>
    );
};

export default MyProductsPage;