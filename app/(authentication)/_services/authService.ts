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


export async function loginUser(
    values: LoginPayload
): Promise<AuthSession> {
    await setPersistence(
        authFirebase,
        values.rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
    const credential = await signInWithEmailAndPassword(
        authFirebase,
        values.email,
        values.password
    );

    try {
        const firebaseUser = credential.user;

        const userSnapshot = await getDoc(
            doc(dbFirebase, "master-users", firebaseUser.uid)
        );

        if (!userSnapshot.exists()) {
            throw new Error("Account data not found");
        }

        const userData = userSnapshot.data();
        const role = userData.role;

        if (
            userData.uid !== firebaseUser.uid ||
            userData.email !== firebaseUser.email ||
            (role !== "customer" && role !== "seller")
        ) {
            throw new Error("Invalid account data");
        }

        return {
            user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                role: role as UserRole,
            },
            idToken: await firebaseUser.getIdToken(),
        };
    } catch (error) {
        await signOut(authFirebase);
        throw error;
    }
}

export async function registerUser(
    values: RegisterPayload
): Promise<AuthSession> {
    await setPersistence(authFirebase, browserLocalPersistence);
    const credential = await createUserWithEmailAndPassword(
        authFirebase,
        values.email,
        values.password
    );
    const firebaseUser = credential.user; // createUser otomatis membuat user ter-login

    try {
        await setDoc(doc(dbFirebase, "master-users", firebaseUser.uid), {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: values.role,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        // dokumen gagal dibuat: hapus akun supaya tidak ada akun tanpa role
        await deleteUser(firebaseUser);
        throw error;
    }

    return {
        user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            role: values.role,
        },
        idToken: await firebaseUser.getIdToken(),
    };
}

export const logoutUser = () => signOut(authFirebase);

export const dashboardPath = (role: UserRole) =>
    role === "seller"
        ? "/seller/dashboard"
        : "/customer/dashboard";

export function authErrorMessage(err: unknown): string {
    const error = err as { code?: string; message?: string };

    switch (error.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
            return "Incorrect email or password, or account not registered";

        case "auth/too-many-requests":
            return "Too many attempts, please try again later";

        case "auth/network-request-failed":
            return "Network error. Please check your connection";

        case "auth/email-already-in-use":
            return "This email is already registered";

        case "auth/weak-password":
            return "Password must be at least 6 characters";

        case "permission-denied":
            return "Permission denied. Please check Firestore rules";

        default:
            return error.message ?? "Something went wrong";
    }
}