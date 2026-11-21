import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/formatter";
import type { HomeProductTypes } from "../_types/homeProductTypes";

const LOW_STOCK_THRESHOLD = 10;

type ProductCardProps = {
    product: HomeProductTypes;
    priority?: boolean;
};

const ProductCard = ({ product, priority = false }: ProductCardProps) => {
    const { id, productName, productCategory, productImage, productPrice, productStock } = product;
    const isOutOfStock = productStock <= 0;
    const isLowStock = productStock > 0 && productStock <= LOW_STOCK_THRESHOLD;

    return (
        <Link
            href={`/customer/home/${id}`}
            className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            <Card className="h-full gap-0 overflow-hidden rounded-2xl py-0 shadow-sm transition duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-muted">
                    {productImage ? (
                        <Image
                            src={productImage}
                            alt={productName}
                            fill
                            priority={priority}
                            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                            className="object-cover transition duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <Package className="size-10 text-muted-foreground" />
                    )}

                    <Badge
                        variant="secondary"
                        className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate bg-background/90 backdrop-blur"
                    >
                        {productCategory}
                    </Badge>

                    {isOutOfStock ? (
                        <Badge variant="destructive" className="absolute bottom-2 left-2">
                            Out of stock
                        </Badge>
                    ) : isLowStock ? (
                        <Badge variant="destructive" className="absolute bottom-2 left-2">
                            Only {productStock} left
                        </Badge>
                    ) : null}
                </div>

                <CardContent className="grid gap-1.5 p-3">
                    <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-snug">{productName}</h3>
                    <p className="text-base font-bold text-primary">{formatRupiah(productPrice)}</p>
                </CardContent>
            </Card>
        </Link>
    );
};

export default ProductCard;