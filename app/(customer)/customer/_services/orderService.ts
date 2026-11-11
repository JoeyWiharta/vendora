import { collection, doc, getDocs, orderBy, query, runTransaction, serverTimestamp, where } from "firebase/firestore";
import { dbFirebase } from "@/lib/firebase";
import type { CartItem } from "../_types/cartTypes";
import type { Order, OrderItem } from "../_types/orderTypes";

export const checkout = async (uid: string, cartItems: CartItem[]): Promise<string> => {
    if (!cartItems.length) throw new Error("Cart is empty");

    return runTransaction(dbFirebase, async (tx) => {
        // 1. SEMUA read dulu (aturan Firestore transaction)
        const productRefs = cartItems.map((i) => doc(dbFirebase, "master-products", i.productId));
        const snaps = await Promise.all(productRefs.map((ref) => tx.get(ref)));

        // 2. Validasi stok terbaru dari server
        const lines = snaps.map((snap, idx) => {
            const qty = cartItems[idx].quantity;
            if (!snap.exists()) throw new Error("A product in your cart is no longer available");
            const p = snap.data();
            if (p.productStock < qty) {
                throw new Error(`Insufficient stock for ${p.productName} (only ${p.productStock} left)`);
            }
            return {
                ref: productRefs[idx],
                newStock: (p.productStock as number) - qty,
                item: {
                    productId: snap.id,
                    sellerId: p.sellerId as string,
                    name: p.productName as string,
                    imageUrl: (p.productImage as string) ?? "",
                    price: p.productPrice as number,
                    quantity: qty,
                },
            };
        });

        // 3. Baru WRITE: kurangi stok
        lines.forEach((l) => tx.update(l.ref, { productStock: l.newStock }));

        // 4. Buat order (snapshot nama/gambar/harga)
        const orderRef = doc(collection(dbFirebase, "trx-orders"));
        tx.set(orderRef, {
            userId: uid,
            createdAt: serverTimestamp(),
            totalPrice: lines.reduce((sum, l) => sum + l.item.price * l.item.quantity, 0),
            items: lines.map((l) => l.item),
        });

        // 5. Kosongkan cart
        cartItems.forEach((i) => tx.delete(doc(dbFirebase, "trx-carts", uid, "items", i.productId)));

        return orderRef.id;
    });
};

export const getMyOrders = async (uid: string): Promise<Order[]> => {
    const q = query(
        collection(dbFirebase, "trx-orders"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);

    return snap.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            userId: data.userId,
            totalPrice: data.totalPrice ?? 0,
            createdAt: data.createdAt,
            items: (data.items ?? []) as OrderItem[],
        } satisfies Order;
    });
};