import {
    createUserWithEmailAndPassword,
    deleteUser,
    signInWithEmailAndPassword,
    signOut, browserLocalPersistence,
    browserSessionPersistence,
    setPersistence,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { authFirebase, dbFirebase } from "@/lib/firebase";
import type { AuthSession, UserRole } from "../_types/authTypes";
import type { LoginPayload } from "../_types/loginTypes";
import type { RegisterPayload } from "../_types/registerTypes";

export const loginUser = async (values: LoginPayload): Promise<AuthSession> => {
    await setPersistence(authFirebase, values.rememberMe ? browserLocalPersistence : browserSessionPersistence)
    const credential = await signInWithEmailAndPassword(authFirebase, values.email, values.password)
    try {
        const firebaseUser = credential.user;
        const userSnapshot = await getDoc(doc(dbFirebase, "master-users", firebaseUser.uid))

        if (!userSnapshot.exists()) {
            throw new Error("User account not found");
        }

        const userData = userSnapshot.data();
        const userRole = userData.role;

        if (userData.uid !== firebaseUser.uid || userData.email !== firebaseUser.email || (userRole !== "customer" && userRole !== "seller")) {
            throw new Error("User account data is invalid");
        }

        return {
            user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                role: userRole as UserRole
            },
            idToken: await firebaseUser.getIdToken(),
        }
    } catch (error) {
        await signOut(authFirebase);
        throw error
    }
}

export const registerUser = async (values: RegisterPayload): Promise<AuthSession> => {
    await setPersistence(authFirebase, browserLocalPersistence)
    const credential = await createUserWithEmailAndPassword(authFirebase, values.email, values.password)
    const firebaseUser = credential.user

    try {
        await setDoc(doc(dbFirebase, "master-users", firebaseUser.uid), {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: values.role,
            createdAt: serverTimestamp(),
        });

        return {
            user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                role: values.role,
            },
            idToken: await firebaseUser.getIdToken(),
        };

    } catch (error) {
        await deleteUser(firebaseUser);
        throw error;
    }
}

export const logoutUser = () => signOut(authFirebase);
