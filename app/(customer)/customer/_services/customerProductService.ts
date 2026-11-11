import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { dbFirebase } from "@/lib/firebase";
import type { CustomerProduct } from "../_types/productTypes";

export const getAvailableProducts = async (): Promise<CustomerProduct[]> => {
    const q = query(collection(dbFirebase, "master-products"), where("productStock", ">", 0));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            productName: data.productName ?? "",
            productCategory: data.productCategory ?? "",
            productImage: data.productImage ?? "",
            productPrice: data.productPrice ?? 0,
            productStock: data.productStock ?? 0,
            description: data.description ?? "",
            sellerId: data.sellerId ?? "",
        } satisfies CustomerProduct;
    });
};


export const getProductById = async (id: string): Promise<CustomerProduct | null> => {
    const snap = await getDoc(doc(dbFirebase, "master-products", id));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
        id: snap.id,
        productName: data.productName ?? "",
        productCategory: data.productCategory ?? "",
        productImage: data.productImage ?? "",
        productPrice: data.productPrice ?? 0,
        productStock: data.productStock ?? 0,
        description: data.description ?? "",
        sellerId: data.sellerId ?? "",
    };
};