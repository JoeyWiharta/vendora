import OrderHistoryView from "./_components/OrderHistoryView";

export const instant = false;

export default function OrdersPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <h1 className="text-2xl font-bold">Order History</h1>
            <OrderHistoryView />
        </div>
    );
}