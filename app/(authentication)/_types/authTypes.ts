export type UserRole = "customer" | "seller"

export interface UserData {
    uid: string;
    email: string;
    role: UserRole;
}

export interface AuthSession {
    user: UserData;
    idToken: string;
}