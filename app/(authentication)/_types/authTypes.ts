export type UserRole = "customer" | "seller"

export interface UserData {
    uid: string;
    email: string;
    role: UserRole;
}