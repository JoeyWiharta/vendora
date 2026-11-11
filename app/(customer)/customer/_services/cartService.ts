import { collection, deleteDoc, doc, getDoc, getDocs, increment, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { dbFirebase } from "@/lib/firebase";
import type { CartItem } from "../_types/cartTypes";
import { getProductById } from "./customerProductService";

const itemRef = (uid: string, productId: string) =>
    doc(dbFirebase, "trx-carts", uid, "items", productId);

export const getCartItemQuantity = async (uid: string, productId: string): Promise<number> => {
    const snap = await getDoc(itemRef(uid, productId));
    return snap.exists() ? (snap.data().quantity as number) : 0;
};

export const addToCart = async (uid: string, productId: string, quantity: number): Promise<void> => {
    await setDoc(
        itemRef(uid, productId),
        { productId, quantity: increment(quantity), updatedAt: serverTimestamp() },
        { merge: true },
    );
};

export const getCartItems = async (uid: string): Promise<CartItem[]> => {
    const snap = await getDocs(collection(dbFirebase, "trx-carts", uid, "items"));
    return Promise.all(
        snap.docs.map(async (d) => ({
            productId: d.id,
            quantity: d.data().quantity as number,
            product: await getProductById(d.id),
        })),
    );
};

export const setCartQuantity = async (uid: string, productId: string, quantity: number): Promise<void> => {
    if (quantity <= 0) return deleteDoc(itemRef(uid, productId));
    await updateDoc(itemRef(uid, productId), { quantity, updatedAt: serverTimestamp() });
};

export const removeCartItem = async (uid: string, productId: string): Promise<void> => {
    await deleteDoc(itemRef(uid, productId));
};