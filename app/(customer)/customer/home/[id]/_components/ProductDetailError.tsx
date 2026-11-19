import ProductBackButton from "./ProductBackButton";

const ProductDetailError = ({ message }: { message?: string }) => (
    <div className="grid gap-4">
        <ProductBackButton />
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-card py-16 text-center">
            <p className="font-medium">{message ? "Failed to load product" : "Product not found"}</p>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
    </div>
);

export default ProductDetailError;