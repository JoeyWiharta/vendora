export const instant = false;

import SellerMainWrapper from "../../../_components/_layout/SellerMainWrapper";
import EditProductView from "../../../_components/_common/EditProductView";

const EditProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    return (
        <SellerMainWrapper
            title="Edit Product"
            description="Update your product details."
        >
            <EditProductView id={id} />
        </SellerMainWrapper>
    );
};

export default EditProductPage;