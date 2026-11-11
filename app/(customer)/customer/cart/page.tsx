import CartView from "../_components/_common/CartView";

export const instant = false;

export default function CartPage() {
    return (
        <div className="grid gap-4">
            <h1 className="text-2xl font-bold">My Cart</h1>
            <CartView />
        </div>
    );
}