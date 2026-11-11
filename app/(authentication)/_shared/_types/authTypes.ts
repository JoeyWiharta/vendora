export type UserRole = "customer" | "seller"

export interface UserData {
    uid: string;
    email: string;
    role: UserRole;
}

export interface AuthState {
    user: UserData | null;
    loading: boolean;
    setUser: (
        user: UserData | null
    ) => void;
}