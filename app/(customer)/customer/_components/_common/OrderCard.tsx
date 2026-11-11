import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_PRODUCT_IMAGE } from "@/constants/ProductDefaultImage";
import { formatDate, formatRupiah } from "@/lib/formatter";
import type { Order } from "../../_types/orderTypes";

const OrderCard = ({ order }: { order: Order }) => (
    <Card>
        <CardContent className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Order ID</p>
                    <p className="truncate font-mono text-sm font-medium">{order.id}</p>
                </div>
                <Badge variant="secondary">{order.createdAt ? formatDate(order.createdAt.toDate()) : "-"}</Badge>
            </div>

            <Separator />

            <div className="grid gap-3">
                {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                        <Link
                            href={`/customer/product/${item.productId}`}
                            className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted"
                        >
                            <Image
                                src={item.imageUrl || DEFAULT_PRODUCT_IMAGE}
                                alt={item.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                            />
                        </Link>
                        <div className="min-w-0 flex-1">
                            <Link
                                href={`/customer/product/${item.productId}`}
                                className="line-clamp-2 text-sm font-medium hover:text-primary hover:underline"
                            >
                                {item.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                {item.quantity} x {formatRupiah(item.price)}
                            </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold">{formatRupiah(item.price * item.quantity)}</p>
                    </div>
                ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Order total</span>
                <span className="text-lg font-bold text-primary">{formatRupiah(order.totalPrice)}</span>
            </div>
        </CardContent>
    </Card>
);

export default OrderCard;