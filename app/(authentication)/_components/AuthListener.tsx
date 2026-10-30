"use client";

import { useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { authFirebase } from "@/lib/firebase";
import { getUserData } from "../_services/authService";
import { authFlow, useAuthStore } from "@/store/authStore";

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