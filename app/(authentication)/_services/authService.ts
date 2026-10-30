import { createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword, signOut, browserLocalPersistence, browserSessionPersistence, setPersistence, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { authFirebase, dbFirebase } from "@/lib/firebase";
import { authFlow } from "@/store/authStore";
import type { UserData, UserRole } from "../_types/authTypes";
import type { LoginPayload } from "../_types/loginTypes";
import type { RegisterPayload } from "../_types/registerTypes";

export const getUserData = async (firebaseUser: User): Promise<UserData> => {
    const snapshot = await getDoc(doc(dbFirebase, "master-users", firebaseUser.uid));
    if (!snapshot.exists()) {
        throw new Error("Invalid email or password");
    }
    const data = snapshot.data();
    const role = data.role;
    if (data.uid !== firebaseUser.uid || data.email !== firebaseUser.email || (role !== "customer" && role !== "seller")) {
        throw new Error("Your account data is invalid. Please contact support");
    }

    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        role: role as UserRole,
    };
};

export const loginUser = async (values: LoginPayload): Promise<UserData> => {
    authFlow.busy = true;
    try {
        await setPersistence(authFirebase, values.rememberMe ? browserLocalPersistence : browserSessionPersistence);
        const credential = await signInWithEmailAndPassword(authFirebase, values.email, values.password);
        try {
            return await getUserData(credential.user);
        } catch (error) {
            await signOut(authFirebase);
            throw error;
        }
    } finally {
        authFlow.busy = false;
    }
};

export const registerUser = async (values: RegisterPayload): Promise<UserData> => {
    authFlow.busy = true;
    try {
        await setPersistence(authFirebase, browserLocalPersistence);
        const credential = await createUserWithEmailAndPassword(authFirebase, values.email, values.password);
        const firebaseUser = credential.user;

        try {
            await setDoc(doc(dbFirebase, "master-users", firebaseUser.uid), {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: values.role,
                createdAt: serverTimestamp(),
            });

            return {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                role: values.role,
            };
        } catch (error) {
            await deleteUser(firebaseUser);
            throw error;
        }
    } finally {
        authFlow.busy = false;
    }
};

export const logoutUser = () => signOut(authFirebase);