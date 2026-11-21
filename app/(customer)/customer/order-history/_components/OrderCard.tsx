import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_PRODUCT_IMAGE } from "@/constants/ProductDefaultImage";
import { formatDate, formatRupiah } from "@/lib/formatter";
import type { Order } from "../../_shared/_types/orderTypes";

const OrderCard = ({ order }: { order: Order }) => {
    const totalPcs = order.items.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <Card className="gap-0 overflow-hidden py-0">
            <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Receipt className="size-5" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Order ID</p>
                        <p className="truncate font-mono text-sm font-medium" title={order.id}>
                            #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    {order.createdAt ? formatDate(order.createdAt.toDate()) : "-"}
                </div>
            </div>

            <Separator />

            <CardContent className="grid gap-3 p-4">
                {order.items.map((item) => {
                    const href = `/customer/home/${item.productId}`;
                    return (
                        <div key={item.productId} className="flex items-center gap-3">
                            <Link
                                href={href}
                                aria-label={`View ${item.name}`}
                                className="group relative size-16 shrink-0 overflow-hidden rounded-xl border bg-muted"
                            >
                                <Image
                                    src={item.imageUrl || DEFAULT_PRODUCT_IMAGE}
                                    alt={item.name}
                                    fill
                                    sizes="64px"
                                    className="object-cover transition duration-300 group-hover:scale-105"
                                />
                            </Link>
                            <div className="min-w-0 flex-1">
                                <Link
                                    href={href}
                                    className="line-clamp-2 text-sm font-medium transition hover:text-primary hover:underline"
                                >
                                    {item.name}
                                </Link>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {item.quantity} x {formatRupiah(item.price)}
                                </p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold">{formatRupiah(item.price * item.quantity)}</p>
                        </div>
                    );
                })}
            </CardContent>

            <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
                <span className="text-xs text-muted-foreground">
                    {order.items.length} product(s) · {totalPcs} pcs
                </span>
                <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-lg font-bold text-primary">{formatRupiah(order.totalPrice)}</span>
                </div>
            </div>
        </Card>
    );
};

export default OrderCard;