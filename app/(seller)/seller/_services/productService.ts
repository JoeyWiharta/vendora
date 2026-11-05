import { addDoc, collection, getDocs, query, serverTimestamp, where, type Timestamp } from "firebase/firestore"
import { dbFirebase } from "@/lib/firebase"
import type { AddProductPayload, Product } from "../_types/productTypes"

interface getSellerProductsParam {
    sellerId: string
}

export const getSellerProducts = async (param: getSellerProductsParam): Promise<Product[]> => {
    const q = query(collection(dbFirebase, "master-products"), where("sellerId", "==", param.sellerId))
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            productName: data.productName ?? "",
            productCategory: data.productCategory ?? "",
            productImage: data.productImage ?? "",
            productPrice: data.productPrice ?? 0,
            productStock: data.productStock ?? 0,
            description: data.description ?? "",
            sellerId: data.sellerId,
            createdAt: data.createdAt as Timestamp,
        } satisfies Product;
    })
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

export const addSellerProduct = async (payload: AddProductPayload): Promise<string> => {
    const docRef = await addDoc(collection(dbFirebase, "master-products"), {
        ...payload,
        createdAt: serverTimestamp(),
    })
    return docRef.id
}