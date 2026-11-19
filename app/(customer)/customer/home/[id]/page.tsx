import ProductDetailView from "./_components/ProductDetailView";

export const instant = false;

const ProductDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return <ProductDetailView id={id} />;
};

export default ProductDetailPage;