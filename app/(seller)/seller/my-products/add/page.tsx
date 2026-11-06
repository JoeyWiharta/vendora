export const instant = false;

import SellerMainWrapper from "../../_components/_layout/SellerMainWrapper"
import AddProductForm from "../../_components/_common/AddProductForm"

const AddProductPage = () => {
    return (
        <SellerMainWrapper
            title="Add Product"
            description="Add a new product to your store."
        >
            <AddProductForm />
        </SellerMainWrapper>
    )
}

export default AddProductPage