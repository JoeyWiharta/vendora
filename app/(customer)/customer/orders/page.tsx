import OrderHistoryView from "../_components/_common/OrderHistoryView";

export const instant = false;

export default function OrdersPage() {
    return (
        <div className="grid gap-4">
            <h1 className="text-2xl font-bold">Order History</h1>
            <OrderHistoryView />
        </div>
    );
}