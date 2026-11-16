import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where, type Timestamp } from "firebase/firestore";
import { dbFirebase } from "@/lib/firebase";
import type { AddProductPayload, Product, UpdateProductPayload } from "../_types/productTypes";

interface GetSellerProductsParam {
    sellerId: string;
}

export const getSellerProducts = async (param: GetSellerProductsParam): Promise<Product[]> => {
    const q = query(collection(dbFirebase, "master-products"), where("sellerId", "==", param.sellerId));
    const snapshot = await getDocs(q);
    return snapshot.docs
        .map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                productName: data.productName ?? "",
                productCategory: data.productCategory ?? "",
                productImage: data.productImage ?? "",
                productImagePublicId: data.productImagePublicId ?? null,
                productPrice: data.productPrice ?? 0,
                productStock: data.productStock ?? 0,
                description: data.description ?? "",
                sellerId: data.sellerId,
                updatedAt: data.updatedAt ?? "-",
                createdAt: data.createdAt as Timestamp,
            } satisfies Product;
        })
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
};

export const addSellerProduct = async (payload: AddProductPayload): Promise<string> => {
    const docRef = await addDoc(
        collection(dbFirebase, "master-products"),
        {
            ...payload,
            updatedAt: "-",
            createdAt: serverTimestamp(),
        }
    );
    return docRef.id;
};

export const updateSellerProduct = async (id: string, payload: UpdateProductPayload): Promise<void> => {
    await updateDoc(doc(dbFirebase, "master-products", id), {
        ...payload,
        updatedAt: serverTimestamp(),
    });
};



export const deleteSellerProduct = async (id: string): Promise<void> => {
    await deleteDoc(doc(dbFirebase, "master-products", id));
};