"use client";

import Link from "next/link";
import { History, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "../../_hooks/useOrders";
import OrderCard from "./OrderCard";

const OrderHistoryView = () => {
    const { data: orders = [], isLoading, isError, error, refetch, isFetching } = useOrders();

    if (isLoading) {
        return (
            <div className="grid gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-56 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card py-16 text-center">
                <p className="font-medium text-destructive">Failed to load orders</p>
                <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                    <RefreshCw />
                    Retry
                </Button>
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card py-16 text-center">
                <History className="size-10 text-muted-foreground" />
                <p className="font-medium">No orders yet</p>
                <Button size="sm" nativeButton={false} render={<Link href="/customer/dashboard" />}>
                    Start shopping
                </Button>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
            ))}
        </div>
    );
};

export default OrderHistoryView;