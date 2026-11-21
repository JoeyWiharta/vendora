import CartView from "./_components/CartView";

export const instant = false;

export default function CartPage() {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <h1 className="text-2xl font-bold">My Cart</h1>
            <CartView />
        </div>
    );
}