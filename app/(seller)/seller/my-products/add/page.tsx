export const instant = false;

import SellerMainWrapper from "../../_shared/_components/LayoutMainWrapper"
import ProductForm from "../../_components/_common/ProductForm"

const AddProductPage = () => {
    return (
        <SellerMainWrapper
            title="Add Product"
            description="Add a new product to your store."
        >
            <ProductForm />
        </SellerMainWrapper>
    )
}

export default AddProductPage