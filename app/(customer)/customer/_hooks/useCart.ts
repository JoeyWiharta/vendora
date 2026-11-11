import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // samakan dengan library toast di project kamu
import { useAuthStore } from "@/store/authStore";
import { addToCart, getCartItemQuantity, getCartItems, removeCartItem, setCartQuantity } from "../_services/cartService";

export const CART_QUERY_KEY = ["customer-cart"] as const;

export const useCartItemQuantity = (productId: string) => {
    const uid = useAuthStore((s) => s.user?.uid);
    return useQuery({
        queryKey: [...CART_QUERY_KEY, uid, "item", productId],
        queryFn: () => getCartItemQuantity(uid!, productId),
        enabled: !!uid,
    });
};

export const useCartItems = () => {
    const uid = useAuthStore((s) => s.user?.uid);
    return useQuery({
        queryKey: [...CART_QUERY_KEY, uid, "list"],
        queryFn: () => getCartItems(uid!),
        enabled: !!uid,
    });
};

const useCartMutation = <T,>(fn: (uid: string, arg: T) => Promise<void>, successMsg?: string) => {
    const uid = useAuthStore((s) => s.user?.uid);
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (arg: T) => fn(uid!, arg),
        onSuccess: () => {
            if (successMsg) toast.success(successMsg);
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        },
        onError: (e: Error) => toast.error(e.message || "Something went wrong"),
    });
};

export const useAddToCart = (productId: string) =>
    useCartMutation<number>((uid, qty) => addToCart(uid, productId, qty), "Added to cart");

export const useUpdateCartQuantity = () =>
    useCartMutation<{ productId: string; quantity: number }>((uid, { productId, quantity }) =>
        setCartQuantity(uid, productId, quantity),
    );

export const useRemoveCartItem = () =>
    useCartMutation<string>((uid, productId) => removeCartItem(uid, productId), "Removed from cart");