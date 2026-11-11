import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/formatter";
import type { CustomerProduct } from "../../_types/productTypes";

const LOW_STOCK = 10;

const ProductCard = ({ product }: { product: CustomerProduct }) => {
    const lowStock = product.productStock <= LOW_STOCK;

    return (
        <Link
            href={`/customer/product/${product.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-muted">
                {product.productImage ? (
                    <Image
                        src={product.productImage}
                        alt={product.productName}
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <Package className="size-10 text-muted-foreground" />
                )}

                <Badge variant="secondary" className="absolute left-2 top-2 bg-background/90 backdrop-blur">
                    {product.productCategory}
                </Badge>
                {lowStock && (
                    <Badge variant="destructive" className="absolute bottom-2 left-2">
                        Only {product.productStock} left
                    </Badge>
                )}
            </div>

            <div className="flex flex-1 flex-col justify-between gap-2 p-3">
                <h3 className="line-clamp-2 text-sm font-medium leading-snug">{product.productName}</h3>
                <p className="text-base font-bold text-primary">{formatRupiah(product.productPrice)}</p>
            </div>
        </Link>
    );
};

export default ProductCard;