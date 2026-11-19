import Image from "next/image";
import { Shield, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_PRODUCT_IMAGE } from "@/constants/ProductDefaultImage";
import { formatNumber, formatRupiah } from "@/lib/formatter";
import type { HomeProductTypes } from "../../_types/homeProductTypes";

const LOW_STOCK_THRESHOLD = 10;

type ProductOverviewProps = {
    product: HomeProductTypes;
    children: React.ReactNode; // slot untuk PurchasePanel
};

const ProductOverview = ({ product, children }: ProductOverviewProps) => {
    const { productName, productImage, productCategory, productPrice, productStock: stock, description } = product;
    const isLowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD;

    return (
        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
            {/* Foto */}
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border bg-muted lg:sticky lg:top-24">
                <Image
                    src={productImage || DEFAULT_PRODUCT_IMAGE}
                    alt={productName}
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                />
                <Badge variant="secondary" className="absolute left-3 top-3 bg-background/90 backdrop-blur">
                    {productCategory}
                </Badge>
            </div>

            {/* Info */}
            <div className="grid min-w-0 gap-6">
                <div className="grid gap-3">
                    <h1 className="text-2xl font-bold leading-snug tracking-tight md:text-3xl">{productName}</h1>
                    <p className="text-3xl font-bold text-primary md:text-4xl">{formatRupiah(productPrice)}</p>

                    {stock <= 0 ? (
                        <Badge variant="destructive" className="w-fit">Out of stock</Badge>
                    ) : isLowStock ? (
                        <Badge variant="destructive" className="w-fit">Only {formatNumber(stock)} left</Badge>
                    ) : (
                        <Badge variant="secondary" className="w-fit gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            In stock · {formatNumber(stock)} pcs
                        </Badge>
                    )}
                </div>

                <Separator />

                <div className="grid gap-2">
                    <h2 className="text-sm font-semibold">Description</h2>
                    <p className="whitespace-pre-line wrap-break-word text-sm leading-relaxed text-muted-foreground">
                        {description || "No description provided."}
                    </p>
                </div>

                {children}

                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Truck className="size-4 text-primary" />
                        Fast delivery
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield className="size-4 text-primary" />
                        Secure payment
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductOverview;