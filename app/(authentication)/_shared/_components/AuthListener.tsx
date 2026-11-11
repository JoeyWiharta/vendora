"use client";

import { useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { authFirebase } from "@/lib/firebase";
import { authFlow } from "@/app/(authentication)/_shared/_store/authFlow";
import { useAuthStore } from "@/app/(authentication)/_shared/_store/authStore";
import { getUserData } from "../_services/authService";

const AuthListener = () => {
    const setUser = useAuthStore((s) => s.setUser);

    useEffect(() => {
        return onAuthStateChanged(authFirebase, async (firebaseUser) => {
            if (authFlow.busy) return;
            if (!firebaseUser) return setUser(null);

            try {
                setUser(await getUserData(firebaseUser));
            } catch {
                await signOut(authFirebase);
                setUser(null);
            }
        });
    }, [setUser]);

    return null;
};

export default AuthListener;